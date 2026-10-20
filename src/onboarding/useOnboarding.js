// src/onboarding/useOnboarding.js
// El estado del onboarding en React, sobre los módulos de al lado.
//
// **Guarda mientras se recorre, no al final** (RN-01). Cada paso escribe lo
// suyo al dejarlo, y lo tecleado se guarda solo a los 800 ms de la última
// tecla: cerrar la app a mitad del nombre no pierde el nombre, y volver a
// abrirla retoma en el paso donde estaba (RN-09).
//
// **El árbol puede no ser el de la sesión** (SPEC_19.2). Si en P7 se crea una
// cuenta nueva, el árbol entero se muda a ella y el uid de la sesión cambia:
// a partir de ahí se escribe allí. Si se entra a una cuenta que ya existía, la
// sesión pasa por `entrarACuenta` —restaurar primero, mudar después— y este
// recorrido se desmonta bajo el velo; el que se monta al volver sigue en el
// paso siguiente a P7 (`traspaso.js`) o no se monta, si la cuenta ya lo había
// terminado. Y mientras la mudanza a esa cuenta esté pendiente, todo se lee y
// se escribe bajo el uid de origen: dónde, lo decide `escritura.js`.
//
// **P7 entra por la sesión, como Tu perfil** (`conectar`, que es
// `pasarACuenta` de `ArranqueProvisional`): un solo camino a la cuenta, y un
// solo escritor de `strivo.uid.local`. Este hook ya no cambia el uid de nadie.
//
// Aquí no hay copy y no hay colores: esto decide qué se guarda y cuándo.

import { useCallback, useEffect, useRef, useState } from 'react'
import { generoDe } from './genero.js'
import { anterior, siguiente } from './pasos.js'
import { RESPUESTAS_INICIALES, expedienteDe } from './estado.js'
import {
  escribirMotivo,
  escribirPaso,
  escribirPerfil,
  escribirRecordatorios,
  escribirReferencias,
  leerRecorrido,
  releerSiCambioElArbol,
  respuestasDe,
  terminarRecorrido,
} from './escritura.js'
import { conectarConTraspaso, retomarTrasCuenta } from './traspaso.js'

/** §5.6 — El mismo retraso que el resto del producto: 800 ms sin teclear. */
export const RETRASO_AUTOGUARDADO = 800

/**
 * @param {string} uid - el uid de la sesión.
 * @param {object} [opciones]
 * @param {(cuenta: object) => Promise<{ok: boolean, motivo?: string}>} [opciones.conectar]
 *   - lleva la sesión a la cuenta de P7 (`conectarCuenta` de `useSesion`).
 * @param {number} [opciones.sello] - el sello de restauración: si al cambiar
 *   cambió también el árbol de la entrada, se recargan las respuestas (E4).
 */
export function useOnboarding(uid, { conectar, sello = 0 } = {}) {
  const [respuestas, setRespuestas] = useState(RESPUESTAS_INICIALES)
  const [paso, setPaso] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [motivoCuenta, setMotivoCuenta] = useState(null)

  // El uid de la sesión y el árbol del que salieron las respuestas. Viven en
  // referencias porque las escrituras en fila se resuelven después del render
  // que las pidió, y tienen que ir a donde está la sesión entonces.
  const uidSesion = useRef(uid)
  const cargado = useRef(null)
  const vivo = useRef(true)
  const recorridos = useRef([])
  const temporizador = useRef(null)
  const pendiente = useRef(null)
  const cola = useRef(Promise.resolve())

  useEffect(() => {
    uidSesion.current = uid
  }, [uid])

  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
      clearTimeout(temporizador.current)
    }
  }, [])

  // ─── Escritura ──────────────────────────────────────────────────────────
  // En fila, una detrás de otra: dos pasos seguidos escriben el mismo
  // documento, y si se solapan la última en responder deja guardado lo más
  // viejo. La capa de datos no pierde nada; la fila es para que lo guardado
  // sea siempre lo último contestado.

  const enFila = useCallback((trabajo) => {
    cola.current = cola.current.then(trabajo, trabajo).catch(() => {})
    return cola.current
  }, [])

  /**
   * Escribe el perfil. Un tropiezo aquí no se muestra: lo escrito sigue en
   * pantalla, la escritura se reintenta sola al siguiente paso y un error de
   * red no es un error visible (RN-EST-05).
   */
  const guardarPerfil = useCallback(
    (valores) => enFila(() => escribirPerfil(uidSesion.current, cargado.current, valores)),
    [enFila],
  )

  const guardarAhora = useCallback(() => {
    clearTimeout(temporizador.current)
    temporizador.current = null
    const valores = pendiente.current
    pendiente.current = null
    return valores ? guardarPerfil(valores) : Promise.resolve()
  }, [guardarPerfil])

  // ─── Carga ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!uid) return
    let vigente = true

    async function cargar() {
      const { carga, perfil, expediente, referencias } = await leerRecorrido(uid)
      if (!vigente) return

      cargado.current = carga
      recorridos.current = expediente?.completedSteps ?? []
      setRespuestas((previas) => respuestasDe(perfil, expediente, previas, referencias))
      // Lo que dejó dicho el recorrido de antes del velo, si lo hubo. Se toma
      // aquí, al aplicar, y no al empezar a leer: el doble montaje de
      // `StrictMode` lanza dos cargas y solo la vigente puede gastarlo.
      const retomar = retomarTrasCuenta(uid, expediente?.currentStep)
      setPaso(retomar.paso)
      setMotivoCuenta(retomar.motivo)
      setCargando(false)
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [uid])

  // **La mudanza pendiente se completó con el recorrido abierto** (E4). La
  // cuenta ganó, así que sus respuestas son las que valen: se recargan, y el
  // paso se queda donde está. Solo si el árbol cambió —el sello sube con cada
  // restauración que termina, y la mayoría no cambian nada de esto—. Lo que
  // estuviera a medio teclear era una respuesta sobre el árbol que perdió y no
  // se guarda.
  useEffect(() => {
    if (!sello) return undefined
    let vigente = true
    releerSiCambioElArbol(uid, cargado.current).then((nueva) => {
      if (!vigente || !nueva) return
      clearTimeout(temporizador.current)
      temporizador.current = null
      pendiente.current = null
      cargado.current = nueva.carga
      setRespuestas(
        respuestasDe(nueva.perfil, nueva.expediente, RESPUESTAS_INICIALES, nueva.referencias),
      )
    })
    return () => {
      vigente = false
    }
  }, [uid, sello])

  // ─── Respuestas ─────────────────────────────────────────────────────────

  /**
   * Lo que se toca se guarda al momento; lo que se teclea, a los 800 ms.
   *
   * El guardado va **fuera** del actualizador de estado y no dentro: React
   * invoca ese actualizador dos veces en desarrollo, y una escritura ahí
   * dentro se dispararía por duplicado. Lo que se guarda se compone del estado
   * de este render, que es el que tenía delante quien acaba de tocar.
   */
  const responder = useCallback(
    (clave, valor, { teclado = false } = {}) => {
      const siguientes = { ...respuestas, [clave]: valor }
      setRespuestas(siguientes)
      clearTimeout(temporizador.current)

      if (teclado) {
        pendiente.current = siguientes
        temporizador.current = setTimeout(guardarAhora, RETRASO_AUTOGUARDADO)
        return
      }
      pendiente.current = null
      temporizador.current = null
      guardarPerfil(siguientes)
    },
    [guardarAhora, guardarPerfil, respuestas],
  )

  const guardarMotivo = useCallback(
    (valores) =>
      enFila(() => escribirMotivo(uidSesion.current, cargado.current, valores ?? respuestas)),
    [enFila, respuestas],
  )

  /**
   * Las referencias de las frases (SPEC_29): se guardan al tocar, como todo
   * toque, y solo en el dispositivo. Reciben las respuestas ya actualizadas
   * porque el estado de React todavía no las tiene en este mismo toque.
   */
  const guardarReferencias = useCallback(
    (valores) => enFila(() => escribirReferencias(uidSesion.current, cargado.current, valores)),
    [enFila],
  )

  const guardarRecordatorios = useCallback(
    (estado) => enFila(() => escribirRecordatorios(uidSesion.current, cargado.current, estado)),
    [enFila],
  )

  // ─── Navegación ─────────────────────────────────────────────────────────

  /**
   * Cambia de paso y guarda el expediente.
   *
   * **El motivo viaja en la misma escritura**, y no es un extra: `motivoOtro`
   * se teclea, y el autoguardado de lo tecleado escribe el perfil, que no es
   * donde vive. Sin esto, la palabra propia de P3 no llegaría al árbol hasta
   * el final del recorrido, y quien lo dejara a medias la perdería.
   */
  const ir = useCallback(
    (destino, valores) => {
      if (!destino) return
      recorridos.current = expedienteDe(destino, recorridos.current).completedSteps
      setPaso(destino)
      enFila(() =>
        escribirPaso(uidSesion.current, cargado.current, destino, recorridos.current, valores),
      )
    },
    [enFila],
  )

  const avanzar = useCallback(async () => {
    await guardarAhora()
    // Las respuestas deciden qué pasos tocan: el de las afinidades solo se
    // recorre si se eligió «Quiero elegir referencias» (SPEC_29).
    ir(siguiente(paso, respuestas), respuestas)
  }, [guardarAhora, ir, paso, respuestas])

  const retroceder = useCallback(async () => {
    await guardarAhora()
    const destino = anterior(paso, respuestas)
    if (destino) ir(destino, respuestas)
  }, [guardarAhora, ir, paso, respuestas])

  /**
   * La cuenta de P7, por la sesión (§4.1).
   *
   * Antes de conectar se vacía todo lo que está por escribir —lo tecleado y la
   * fila entera—: lo que esté en vuelo tiene que caer en el árbol de antes, no
   * a mitad de una mudanza (E6).
   *
   * Con una cuenta que ya existía, la sesión pasa por el velo y este recorrido
   * se desmonta; lo que tenga que saber el siguiente se le deja dicho
   * (`traspaso.js`): el paso que sigue a P7 si todo fue bien, el motivo si la
   * mudanza falló. Si al volver este recorrido sigue montado —una cuenta nueva,
   * o la misma cuenta de la sesión, que no pasan por el velo—, lo aplica él.
   *
   * @returns {Promise<{ok: boolean, motivo?: string}>}
   */
  const conectarCuenta = useCallback(
    async (cuenta) => {
      await guardarAhora()
      await cola.current

      const r = await conectarConTraspaso(uidSesion.current, cuenta, conectar, () => vivo.current)
      // La mudanza ya está hecha: lo siguiente que se escriba va a la cuenta
      // aunque el uid nuevo todavía no haya llegado por props.
      if (r.ok && cuenta.nueva) uidSesion.current = cuenta.uid
      if (r.paso) setPaso(r.paso)
      return r
    },
    [conectar, guardarAhora],
  )

  /**
   * Termina el recorrido. Lo que se escribe y dónde está en
   * `terminarRecorrido` (`escritura.js`); aquí solo se vacía antes lo que
   * estuviera a medio teclear.
   */
  const terminar = useCallback(async () => {
    await guardarAhora()
    await enFila(() =>
      terminarRecorrido(uidSesion.current, cargado.current, {
        respuestas,
        paso,
        recorridos: recorridos.current,
      }),
    )
  }, [enFila, guardarAhora, paso, respuestas])

  return {
    respuestas,
    paso,
    cargando,
    motivoCuenta,
    genero: generoDe(respuestas.genero),
    acciones: {
      responder,
      avanzar,
      retroceder,
      guardarMotivo,
      guardarReferencias,
      guardarRecordatorios,
      conectarCuenta,
      terminar,
    },
  }
}

export default useOnboarding
