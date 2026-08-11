// src/lumia/useDiario.js
// Estado de React sobre `diario.js` y `victorias.js`, con la misma forma que
// `useHabitos.js`: `{ estado, carga, error, acciones, reintentar }`.
//
// Una sola instancia sostiene la pantalla Hoy y las dos vistas del Diario, así
// que lo que se escribe en la mañana se ve en la noche sin sincronizar nada:
// no hay dos copias del estado que puedan discrepar.
//
// **Autoguardado (§5.3).** Los campos de escritura guardan con un retraso de
// 800 ms desde la última tecla, y de inmediato al perder el foco o al salir de
// la vista. No hay botón de guardar y no hay nada que se pierda por cerrar la
// app a media frase.

import { useCallback, useEffect, useRef, useState } from 'react'
import * as diario from './diario.js'
import * as victorias from './victorias.js'

/** §5.3 — Retraso del autoguardado desde el último carácter. */
export const RETRASO_AUTOGUARDADO = 800

const ESTADO_VACIO = {
  fecha: null,
  nombre: null,
  genero: 'n',
  morning: null,
  night: null,
  victorias: [],
  intencion: null,
  frase: null,
}

/**
 * Los tres espacios que se guardan solos, cada uno con su forma.
 *
 * La mañana y la noche acumulan campos —dos teclas en dos campos distintos se
 * guardan juntas—; la intención es una sola línea y la última gana. `eco` es lo
 * que se ve en pantalla mientras el guardado va de camino.
 */
const ESPACIOS = Object.freeze({
  manana: Object.freeze({
    acumular: (previo, patch) => ({ ...(previo ?? {}), ...patch }),
    eco: (estado, patch) => ({ ...estado, morning: { ...(estado.morning ?? {}), ...patch } }),
  }),
  noche: Object.freeze({
    acumular: (previo, patch) => ({ ...(previo ?? {}), ...patch }),
    eco: (estado, patch) => ({ ...estado, night: { ...(estado.night ?? {}), ...patch } }),
  }),
  intencion: Object.freeze({
    acumular: (_previo, texto) => texto,
    eco: (estado, texto) => ({ ...estado, intencion: { intentionText: texto } }),
  }),
})

export function useDiario(uid, fechaPedida = null) {
  const [estado, setEstado] = useState(ESTADO_VACIO)
  const [carga, setCarga] = useState('cargando')
  const [error, setError] = useState(null)

  const vivo = useRef(true)
  // Lo que está esperando a guardarse, por espacio. Se acumula: dos teclas en
  // dos campos distintos se guardan juntas y ninguna pisa a la otra.
  const pendiente = useRef({ manana: null, noche: null, intencion: null })
  const temporizador = useRef(null)
  // Fila de escrituras: ninguna empieza hasta que termina la anterior.
  const cola = useRef(Promise.resolve())

  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
    }
  }, [])

  const cargar = useCallback(async () => {
    if (!uid) return
    setCarga('cargando')
    try {
      const dia = await diario.cargarDia(uid, fechaPedida)
      if (!vivo.current) return
      setEstado(dia)
      setCarga('lista')
    } catch {
      if (!vivo.current) return
      setCarga('error')
    }
  }, [uid, fechaPedida])

  useEffect(() => {
    cargar()
  }, [cargar])

  /**
   * Ejecuta una escritura y refresca el estado. Si falla, lo escrito sigue en
   * el campo y en local: el reintento repite la misma escritura sin duplicar.
   *
   * Las escrituras van **en fila, una detrás de otra**. Tocar una emoción
   * mientras el autoguardado de un texto está en camino son dos escrituras del
   * mismo día, y si se solapan la última en responder deja en pantalla un
   * estado más viejo que el que hay guardado. La capa de datos ya garantiza que
   * no se pierda nada (`mergePath` es atómico); esta fila es para que lo que se
   * ve coincida siempre con lo último escrito.
   */
  const ejecutar = useCallback(async (accion) => {
    setError(null)
    const enFila = cola.current.then(accion, accion)
    cola.current = enFila.then(
      () => undefined,
      () => undefined,
    )
    try {
      const parcial = await enFila
      if (!vivo.current) return null
      if (parcial) setEstado((previo) => ({ ...previo, ...parcial }))
      return parcial
    } catch {
      if (!vivo.current) return null
      setError({ reintentar: () => ejecutar(accion) })
      return null
    }
  }, [])

  const volcar = useCallback(async () => {
    if (temporizador.current) {
      clearTimeout(temporizador.current)
      temporizador.current = null
    }
    const { manana, noche, intencion } = pendiente.current
    pendiente.current = { manana: null, noche: null, intencion: null }
    const fecha = estado.fecha
    if (!fecha) return

    if (manana) {
      await ejecutar(async () => ({ morning: await diario.guardarManana(uid, fecha, manana) }))
    }
    if (noche) {
      await ejecutar(async () => ({ night: await diario.guardarNoche(uid, fecha, noche) }))
    }
    // `!== null` y no a secas: borrar la intención deja una cadena vacía, que es
    // un cambio tan válido como cualquier otro y que un `if (intencion)` se
    // tragaría en silencio.
    if (intencion !== null) {
      await ejecutar(async () => ({
        intencion: await diario.guardarIntencion(uid, fecha, intencion),
      }))
    }
  }, [ejecutar, estado.fecha, uid])

  const programar = useCallback(
    (espacio, patch) => {
      const forma = ESPACIOS[espacio]
      pendiente.current[espacio] = forma.acumular(pendiente.current[espacio], patch)
      // Eco inmediato en pantalla: lo escrito se ve aunque el guardado tarde.
      setEstado((previo) => forma.eco(previo, patch))
      if (temporizador.current) clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => {
        volcar()
      }, RETRASO_AUTOGUARDADO)
    },
    [volcar],
  )

  // Salir de la vista no puede perder una frase a medio escribir.
  useEffect(() => {
    return () => {
      const { manana, noche, intencion } = pendiente.current
      if (!estado.fecha || (!manana && !noche && intencion === null)) return
      pendiente.current = { manana: null, noche: null, intencion: null }
      if (manana) diario.guardarManana(uid, estado.fecha, manana).catch(() => {})
      if (noche) diario.guardarNoche(uid, estado.fecha, noche).catch(() => {})
      if (intencion !== null) diario.guardarIntencion(uid, estado.fecha, intencion).catch(() => {})
    }
  }, [uid, estado.fecha])

  const refrescarVictorias = async (lista) => ({ victorias: lista })

  const acciones = {
    /** Escritura continua: se guarda sola a los 800 ms. */
    escribirManana: (patch) => programar('manana', patch),
    escribirNoche: (patch) => programar('noche', patch),
    escribirIntencion: (texto) => programar('intencion', texto),

    /** Al perder el foco o cerrar la vista, sin esperar. */
    volcar,

    /** Un toque —una emoción, un estado— se guarda al momento. */
    guardarManana: (patch) =>
      ejecutar(async () => ({ morning: await diario.guardarManana(uid, estado.fecha, patch) })),
    guardarNoche: (patch) =>
      ejecutar(async () => ({ night: await diario.guardarNoche(uid, estado.fecha, patch) })),
    guardarEstadoSueno: (seleccion, otro) =>
      ejecutar(async () => ({
        night: await diario.guardarEstadoSueno(uid, estado.fecha, seleccion, otro),
      })),

    /**
     * Un chip de intención es un toque y se guarda al momento (RN-LU-INT-01).
     *
     * Antes descarta lo que estuviera esperando: si se venía escribiendo a mano
     * y se toca un chip, lo que vale es el chip, y dejar viva la escritura
     * anterior la haría volver 800 ms después para pisarlo.
     */
    guardarIntencion: (texto) => {
      pendiente.current.intencion = null
      return ejecutar(async () => ({
        intencion: await diario.guardarIntencion(uid, estado.fecha, texto),
      }))
    },

    /**
     * `filas` puede ser una función. Las escrituras van en fila, y entre que
     * esta se encola y le toca el turno la persona ha seguido escribiendo: si
     * las filas se capturan al encolar, la victoria que acaba de nacer se
     * guarda dos veces. La función se llama cuando le toca, no antes.
     */
    guardarVictorias: (filas, state) =>
      ejecutar(async () =>
        refrescarVictorias(
          await victorias.guardarFilas(
            uid,
            estado.fecha,
            typeof filas === 'function' ? filas() : filas,
            state,
          ),
        ),
      ),
    alternarLograda: (victoria) =>
      ejecutar(async () => refrescarVictorias(await victorias.alternarLograda(uid, victoria))),
    pasarAManana: (victoria) =>
      ejecutar(async () => refrescarVictorias(await victorias.pasarAManana(uid, victoria))),
    dejarIr: (victoria) =>
      ejecutar(async () => refrescarVictorias(await victorias.dejarIr(uid, victoria))),
    deshacerDecision: (victoria) =>
      ejecutar(async () => refrescarVictorias(await victorias.deshacerDecision(uid, victoria))),
  }

  return { estado, carga, error, acciones, reintentar: cargar }
}

export default useDiario
