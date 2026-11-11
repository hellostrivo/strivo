// src/lib/avisos/reconciliar.js
// Poner al día los avisos del teléfono (SPEC_22, DP-22.9).
//
// **Una sola rutina** compara lo que toca tener programado con lo que iOS
// tiene, y corrige: cancela los avisos de Strivo que ya no tocan y programa
// los que faltan. Es idempotente —dos seguidas no repiten trabajo— y pasa **de
// una en una**: si llega otra petición mientras corre, se hace una vez más al
// terminar, y nunca dos a la vez.
//
// **Nunca programa sin permiso concedido, y nunca lo pide.** Sin permiso, lo
// único que hace es cancelar los de Strivo. Pedirlo es cosa de un toque de la
// persona (DP-22.8), y `schedule()` del plugin lo pediría él solo si se le
// llamara sin haberlo decidido.
//
// **No se fía de lo que contesta `schedule()`**, que responde antes de que iOS
// confirme: cada vuelta empieza y termina leyendo `getPending`, y lo que
// cuenta al terminar es lo que de verdad está programado.
//
// **Solo toca los avisos de Strivo** (`extra.strivo`).
//
// **Dónde se pide** (la tabla de disparos del §9): al montar las secciones, al
// volver la app al frente y al terminar una restauración (`useAvisos`); al
// cerrar la mañana o la noche (`DiarioManana`, `DiarioNoche`); al cambiar las
// horas (`usePerfil`) y al tocar el interruptor o dar el permiso (el bloque de
// Tu perfil). Ninguno de ellos importa este archivo: piden por
// `avisos/pedido.js`, y este módulo solo lo cargan `useAvisos` y
// `salidaCuenta`, bajo demanda y solo en la app de iPhone.

import { copy } from '@copy'
import { shared, diario } from '../db/index.js'
import { DEFAULT_DIA_TERMINA_A, strivoDateKey } from '../db/dates.js'
import { esIPhone } from '../plataforma.js'
import { PERMISO, puente as puenteDeLaApp } from '../avisosNativos.js'
import { contarResultado, olvidarResultado } from './pedido.js'
import { idDeAviso, planDeAvisos, proximosPorMomento } from './plan.js'

/** Cuánto espera cerrar sesión a una reconciliación en curso, como mucho. */
export const ESPERA_AL_APAGAR_MS = 3000

/**
 * El aviso tal como se le da al plugin.
 *
 * **Sin título**: el plugin exige el campo, y vacío es lo que deja a iOS
 * poner el ícono y el nombre de la app encima. Un título «Strivo» lo diría dos
 * veces. **El cuerpo es el texto que enseña P6**, siempre el mismo, y nunca
 * lleva el nombre de la persona ni nada de lo que escribió: aparece en una
 * pantalla bloqueada que puede estar a la vista. **Sin `badge`, nunca.**
 */
export function avisoParaElTelefono(item, textos = copy.notifications) {
  return {
    id: item.id,
    title: '',
    body: textos[item.momento],
    schedule: { on: { ...item.on } },
    extra: { strivo: true, momento: item.momento, fecha: item.fecha },
  }
}

const CAMPOS_DE_CALENDARIO = ['year', 'month', 'day', 'hour', 'minute']

/** ¿El aviso pendiente es exactamente el que toca? */
function esElMismo(pendiente, aviso) {
  if (!pendiente) return false
  if (pendiente.body !== aviso.body) return false
  const on = pendiente.schedule?.on ?? {}
  return CAMPOS_DE_CALENDARIO.every((campo) => Number(on[campo]) === aviso.schedule.on[campo])
}

/**
 * Lo que la reconciliación necesita saber de la persona: sus horas, su corte
 * del día, si quiere los avisos y qué momentos de hoy ya cerró. Los días
 * siguientes no se pueden escribir todavía (RN-11), así que basta con hoy.
 *
 * `completedAt` es lo único que dice que un momento se cerró (RN-DB-09). Se lee
 * aquí por `lib/db` y no con `diario/manana.js`: `lib/` no importa `diario/`.
 */
export async function leerEstado(uid, ahora) {
  const [perfil, preferencias] = await Promise.all([
    shared.getProfile(uid),
    shared.getPreferences(uid),
  ])
  const diaTerminaA = perfil?.diaTerminaA ?? DEFAULT_DIA_TERMINA_A
  const hoy = strivoDateKey(diaTerminaA, ahora)
  const [manana, noche] = await Promise.all([
    diario.getMorningEntry(uid, hoy),
    diario.getNightRitual(uid, hoy),
  ])
  const cerrados = []
  if (manana?.completedAt) cerrados.push({ fecha: hoy, momento: 'manana' })
  if (noche?.completedAt) cerrados.push({ fecha: hoy, momento: 'noche' })
  return {
    despertar: perfil?.wakeTime ?? null,
    dormir: perfil?.sleepTime ?? null,
    diaTerminaA,
    encendidos: preferencias?.remindersEnabled === true,
    cerrados,
  }
}

function zonaDelTelefono() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  } catch {
    return ''
  }
}

function conEspera(promesa, ms) {
  let reloj
  const techo = new Promise((resolver) => {
    reloj = setTimeout(resolver, ms)
  })
  return Promise.race([promesa, techo]).finally(() => clearTimeout(reloj))
}

/**
 * Crea un reconciliador. Todo lo de fuera entra por argumentos, para poder
 * probarlo con un doble del plugin y un reloj quieto.
 */
export function crearReconciliador({
  puente = puenteDeLaApp,
  iphone = esIPhone,
  leer = leerEstado,
  reloj = () => new Date(),
  textos = copy.notifications,
  contar = contarResultado,
  olvidar = olvidarResultado,
} = {}) {
  let uidActivo = null
  let enCurso = null
  let otraVez = false
  const porRetirar = new Set()

  async function unaVez() {
    const uid = uidActivo
    if (!uid || !iphone()) return null
    const ahora = reloj()

    // Lo entregado de un momento que se acaba de cerrar se retira con o sin
    // permiso: ya no dice nada que haga falta.
    const retirar = [...porRetirar]
    porRetirar.clear()
    await puente.retirarEntregados(retirar)

    const permiso = await puente.permiso()
    const pendientes = await puente.pendientes()
    // Sin saber qué hay programado no se corrige nada: a ciegas, cancelar o
    // programar podría duplicar o borrar de más. La siguiente vuelta lo verá.
    if (pendientes === null) return null

    let plan = []
    if (permiso === PERMISO.concedido) {
      const estado = await leer(uid, ahora)
      plan = planDeAvisos({ ahora, ...estado })
    }
    // Si mientras tanto se cerró sesión, esta vuelta ya no es de nadie.
    if (uidActivo !== uid) return null

    const tocan = new Map(plan.map((item) => [item.id, avisoParaElTelefono(item, textos)]))
    const hay = new Map(pendientes.map((aviso) => [aviso.id, aviso]))
    const sobran = pendientes.filter((aviso) => !tocan.has(aviso.id)).map((aviso) => aviso.id)
    const faltan = [...tocan.values()].filter((aviso) => !esElMismo(hay.get(aviso.id), aviso))

    await puente.cancelar(sobran)
    if (permiso === PERMISO.concedido) await puente.programar(faltan)

    const quedan = sobran.length || faltan.length ? ((await puente.pendientes()) ?? []) : pendientes
    const resultado = {
      permiso,
      programados: quedan.length,
      proximos: proximosPorMomento(quedan, ahora),
      zona: zonaDelTelefono(),
    }
    if (uidActivo === uid) contar(resultado)
    return resultado
  }

  /**
   * Pide una vuelta. Si ya hay una en curso, se apunta otra para cuando
   * termine y se devuelve la misma promesa: varias peticiones juntas son, como
   * mucho, dos vueltas.
   */
  function reconciliar(detalle = {}) {
    const cerrado = detalle?.cerrado
    if (cerrado) {
      const id = idDeAviso(cerrado.fecha, cerrado.momento)
      if (id) porRetirar.add(id)
    }
    if (enCurso) {
      otraVez = true
      return enCurso
    }
    enCurso = (async () => {
      let resultado = null
      try {
        do {
          otraVez = false
          resultado = await unaVez().catch(() => null)
        } while (otraVez)
      } finally {
        enCurso = null
      }
      return resultado
    })()
    return enCurso
  }

  /** Empieza a reconciliar para este uid. */
  function activar(uid) {
    uidActivo = uid ?? null
  }

  /** Deja de reconciliar para el uid que había, sin tocar lo programado. */
  function desactivar(uid) {
    if (uid === undefined || uidActivo === uid) uidActivo = null
  }

  /**
   * Cerrar sesión: nadie más reconcilia, se espera a la vuelta en curso y se
   * cancelan todos los avisos de Strivo en este teléfono (DP-22.11). Nunca
   * lanza y nunca espera más de `ESPERA_AL_APAGAR_MS` a la vuelta en curso.
   */
  async function apagar() {
    uidActivo = null
    olvidar()
    try {
      if (enCurso) await conEspera(enCurso, ESPERA_AL_APAGAR_MS)
      if (!iphone()) return
      const pendientes = await puente.pendientes()
      if (pendientes?.length) await puente.cancelar(pendientes.map((aviso) => aviso.id))
    } catch {
      // Salir no se detiene por los avisos.
    }
  }

  return { reconciliar, activar, desactivar, apagar }
}

const deLaApp = crearReconciliador()

export const reconciliar = deLaApp.reconciliar
export const activarAvisos = deLaApp.activar
export const desactivarAvisos = deLaApp.desactivar
export const apagarAvisos = deLaApp.apagar
