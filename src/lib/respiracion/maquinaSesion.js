// src/lib/respiracion/maquinaSesion.js
// La sesión completa: acomodo, ritmo, pausa y cierre.
//
// El reloj sabe en qué fase se está; esta máquina sabe **cuándo termina** y qué
// se le enseña a la persona mientras tanto. Vive en `lib/` con el resto del
// motor y no conoce ni pantallas ni datos: SPEC_14 la pinta y SPEC_16 la entra.

import { CURVA_POR_DEFECTO } from './curvas.js'
import { duracionCiclo } from './motorRitmo.js'
import { crearReloj } from './relojSesion.js'

export const ESTADOS = Object.freeze({
  INACTIVO: 'inactivo',
  ACOMODANDO: 'acomodando',
  ACTIVO: 'activo',
  PAUSADO: 'pausado',
  CERRANDO: 'cerrando',
  COMPLETADO: 'completado',
})

/**
 * 3,0 s de preparación antes del primer inhalar.
 *
 * Es la diferencia con arrancar en seco: nadie está listo para inhalar hondo en
 * el instante en que toca un botón. Se salta con un toque (RN-RE-MOT-19) y su
 * tiempo no cuenta para el límite de la sesión (RN-RE-MOT-21).
 */
export const MS_ACOMODO = 3000

export const MODOS_DURACION = Object.freeze(['ciclos', 'minutos', 'abierta'])

export const LIMITES_DURACION = Object.freeze({
  ciclos: { min: 1, max: 99 },
  minutos: { min: 1, max: 60 },
})

/** Tres minutos, como pide §6.7. */
export const DURACION_POR_DEFECTO = Object.freeze({ modo: 'minutos', valor: 3 })

export const AVISOS_DURACION = Object.freeze({
  MODO_DESCONOCIDO: 'modo-desconocido',
  VALOR_NO_NUMERICO: 'valor-no-numerico',
  MINIMO: 'minimo',
  MAXIMO: 'maximo',
})

/**
 * Corrige una duración al valor válido más cercano. Nunca lanza, igual que
 * `validarPatron` y por el mismo motivo (caso 9.9).
 */
export function validarDuracion(bruta) {
  const avisos = []
  const modo = MODOS_DURACION.includes(bruta?.modo) ? bruta.modo : null

  if (modo === null) {
    avisos.push({
      codigo: AVISOS_DURACION.MODO_DESCONOCIDO,
      de: bruta?.modo,
      a: DURACION_POR_DEFECTO.modo,
    })
    return {
      valido: false,
      duracion: { ...DURACION_POR_DEFECTO },
      avisos,
    }
  }

  // RN-RE-MOT-18 — en modo abierta no hay valor que validar: termina la persona.
  if (modo === 'abierta') {
    return { valido: avisos.length === 0, duracion: { modo, valor: null }, avisos }
  }

  const { min, max } = LIMITES_DURACION[modo]
  let valor = Number(bruta?.valor)

  if (!Number.isFinite(valor)) {
    avisos.push({ codigo: AVISOS_DURACION.VALOR_NO_NUMERICO, de: bruta?.valor, a: min })
    valor = min
  } else {
    valor = Math.round(valor)
    if (valor < min) {
      avisos.push({ codigo: AVISOS_DURACION.MINIMO, de: valor, a: min })
      valor = min
    } else if (valor > max) {
      avisos.push({ codigo: AVISOS_DURACION.MAXIMO, de: valor, a: max })
      valor = max
    }
  }

  return { valido: avisos.length === 0, duracion: { modo, valor }, avisos }
}

const ahoraPorDefecto = () =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()

const programarPorDefecto = (fn) =>
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 16)

const cancelarPorDefecto = (id) => {
  if (id === null || id === undefined) return
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id)
  else clearTimeout(id)
}

/**
 * Crea la máquina de estados de una sesión.
 *
 * @param {object} opciones
 * @param {object} opciones.patron - Ya validado por `validarPatron`.
 * @param {{modo: string, valor: ?number}} [opciones.duracion]
 * @param {(estado: string, instantanea: object) => void} [opciones.alCambiarEstado]
 * @param {(instantanea: object) => void} [opciones.alActualizar]
 * @param {(estadoRitmo: object) => void} [opciones.alCambiarFase]
 */
export function crearMaquina({
  patron,
  duracion = DURACION_POR_DEFECTO,
  curva = CURVA_POR_DEFECTO,
  alCambiarEstado = null,
  alActualizar = null,
  alCambiarFase = null,
  ahora = ahoraPorDefecto,
  programarFrame = programarPorDefecto,
  cancelarFrame = cancelarPorDefecto,
}) {
  const msCiclo = duracionCiclo(patron)
  const limite = validarDuracion(duracion).duracion

  let estado = ESTADOS.INACTIVO
  let estadoAntesDePausa = null
  let acomodoDesde = null
  let idAcomodo = null
  let msCierre = null
  let msFinales = 0
  let terminadaPorPersona = false
  let ritmo = null

  const reloj = crearReloj({
    patron,
    curva,
    ahora,
    programarFrame,
    cancelarFrame,
    alActualizar: (estadoRitmo, ms) => {
      ritmo = estadoRitmo
      evaluarLimite(estadoRitmo, ms)
      alActualizar?.(instantanea())
    },
    alCambiarFase: (estadoRitmo) => {
      alCambiarFase?.(estadoRitmo)
    },
  })

  function cambiar(nuevo) {
    if (estado === nuevo) return
    estado = nuevo
    alCambiarEstado?.(nuevo, instantanea())
  }

  // ─── Acomodo ────────────────────────────────────────────────────────────────

  function msRestantesAcomodo() {
    if (estado !== ESTADOS.ACOMODANDO || acomodoDesde === null) return 0
    return Math.max(0, MS_ACOMODO - (ahora() - acomodoDesde))
  }

  function bucleAcomodo() {
    idAcomodo = null
    if (estado !== ESTADOS.ACOMODANDO) return
    if (ahora() - acomodoDesde >= MS_ACOMODO) {
      arrancarRitmo()
      return
    }
    alActualizar?.(instantanea())
    idAcomodo = programarFrame(bucleAcomodo)
  }

  function pararAcomodo() {
    cancelarFrame(idAcomodo)
    idAcomodo = null
    acomodoDesde = null
  }

  function arrancarRitmo() {
    pararAcomodo()
    cambiar(ESTADOS.ACTIVO)
    reloj.iniciar()
  }

  // ─── Límite ─────────────────────────────────────────────────────────────────

  /**
   * RN-RE-MOT-16 — **El ciclo en curso siempre se completa.** Alcanzar el
   * límite no corta: pasa a `cerrando` y la sesión termina cuando termina la
   * respiración que estaba ocurriendo. Cortar a media exhalación es lo contrario
   * de lo que hace esta herramienta.
   *
   * RN-RE-MOT-20 — En modo `minutos` el límite se hace efectivo al final del
   * ciclo, así que la sesión real dura entre `valor` y `valor + un ciclo`. Por
   * eso el copy dice "unos 3 minutos" y nunca promete una cifra exacta.
   */
  function evaluarLimite(estadoRitmo, ms) {
    if (limite.modo === 'abierta') return // RN-RE-MOT-18
    if (estado !== ESTADOS.ACTIVO && estado !== ESTADOS.CERRANDO) return

    if (estado === ESTADOS.ACTIVO) {
      const alcanzado =
        limite.modo === 'ciclos'
          ? estadoRitmo.cicloActual >= limite.valor
          : ms >= limite.valor * 60_000

      if (alcanzado) {
        msCierre =
          limite.modo === 'ciclos' ? limite.valor * msCiclo : Math.ceil(ms / msCiclo) * msCiclo
        cambiar(ESTADOS.CERRANDO)
      }
    }

    if (estado === ESTADOS.CERRANDO && msCierre !== null && ms >= msCierre) {
      completar(false)
    }
  }

  function completar(porPersona) {
    terminadaPorPersona = porPersona
    msFinales = reloj.obtenerMs()
    reloj.detener()
    pararAcomodo()
    cambiar(ESTADOS.COMPLETADO)
  }

  // ─── Instantánea ────────────────────────────────────────────────────────────

  function ciclosCompletados() {
    if (msCiclo === 0) return 0
    const ms = estado === ESTADOS.COMPLETADO ? msFinales : reloj.obtenerMs()
    return Math.floor(ms / msCiclo)
  }

  function instantanea() {
    return {
      estado,
      ms: estado === ESTADOS.COMPLETADO ? msFinales : reloj.obtenerMs(),
      msRestantesAcomodo: msRestantesAcomodo(),
      ritmo: estado === ESTADOS.INACTIVO || estado === ESTADOS.ACOMODANDO ? null : ritmo,
      ciclosCompletados: ciclosCompletados(),
      duracion: limite,
    }
  }

  /**
   * Lo que queda de la sesión cuando termina.
   *
   * Caso 9.7 — Una sesión sin un solo ciclo completo **no es una sesión**: no se
   * registra ni alimenta recientes. `registrable` lo dice y quien persiste
   * obedece.
   */
  function resumen() {
    const ciclos = ciclosCompletados()
    return {
      ciclosCompletados: ciclos,
      segundosActivos: Math.round(
        (estado === ESTADOS.COMPLETADO ? msFinales : reloj.obtenerMs()) / 1000,
      ),
      terminadaPorPersona,
      registrable: ciclos > 0,
    }
  }

  return {
    iniciar() {
      if (estado !== ESTADOS.INACTIVO && estado !== ESTADOS.COMPLETADO) return
      msCierre = null
      msFinales = 0
      terminadaPorPersona = false
      ritmo = null
      acomodoDesde = ahora()
      cambiar(ESTADOS.ACOMODANDO)
      bucleAcomodo()
    },

    /** RN-RE-MOT-19 — un toque y se empieza, sin esperar los 3 s. */
    saltarAcomodo() {
      if (estado !== ESTADOS.ACOMODANDO) return
      arrancarRitmo()
    },

    pausar() {
      if (estado !== ESTADOS.ACTIVO && estado !== ESTADOS.CERRANDO) return
      estadoAntesDePausa = estado
      reloj.pausar()
      cambiar(ESTADOS.PAUSADO)
    },

    reanudar() {
      if (estado !== ESTADOS.PAUSADO) return
      reloj.reanudar()
      cambiar(estadoAntesDePausa ?? ESTADOS.ACTIVO)
      estadoAntesDePausa = null
    },

    /**
     * RN-RE-MOT-17 — La decisión de la persona manda y corta de inmediato, sin
     * esperar al final del ciclo. Es la única excepción a RN-RE-MOT-16.
     *
     * Caso 9.6 — Durante el acomodo no hay nada que cerrar: vuelve a `inactivo`
     * y no se registra sesión ninguna.
     */
    terminar() {
      if (estado === ESTADOS.ACOMODANDO) {
        pararAcomodo()
        cambiar(ESTADOS.INACTIVO)
        return
      }
      if (estado === ESTADOS.INACTIVO || estado === ESTADOS.COMPLETADO) return
      completar(true)
    },

    /**
     * Caso 9.4 — La pestaña o la pantalla estuvieron fuera más de un ciclo
     * entero. No se finge que la sesión siguió: se pausa y la persona decide.
     * Honestidad por encima de continuidad.
     *
     * Quien escucha `visibilitychange` es la capa visual (SPEC_14); la máquina
     * no toca el DOM.
     */
    notificarAusencia(msAusente) {
      if (estado !== ESTADOS.ACTIVO && estado !== ESTADOS.CERRANDO) return false
      if (!(Number(msAusente) > msCiclo)) return false
      this.pausar()
      return true
    },

    /** Para desmontar. Idempotente, como el reloj (RN-RE-MOT-15). */
    detener() {
      pararAcomodo()
      reloj.detener()
      cambiar(ESTADOS.INACTIVO)
    },

    estado: () => estado,
    instantanea,
    resumen,
    msCiclo: () => msCiclo,
  }
}
