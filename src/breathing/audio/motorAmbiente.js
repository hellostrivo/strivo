// src/breathing/audio/motorAmbiente.js
// Quién suena, cuándo entra y cuándo se va (SPEC_15 §3).
//
// Es el único que sabe que existe un catálogo de sonidos. Las fuentes no se
// conocen entre sí y el mezclador no sabe cuántas hay: por eso añadir un sonido
// nuevo es escribir un archivo en `fuentes/` y una línea en el catálogo, sin
// tocar nada de esto.
//
// **Lo que más importa que no falle es el cambio de sonido en vivo.** Cinco
// cambios en dos segundos —alguien probando la lista— tienen que dejar
// exactamente una fuente viva (caso 6.3). Cada cruce cancela el anterior de
// verdad: se libera la fuente que ya estaba saliendo en vez de dejarla
// desvaneciéndose por su cuenta, porque diez fuentes de ruido rosa a volumen
// bajo siguen siendo diez fuentes de ruido rosa.

import { ID_SILENCIO, obtenerSonido, resolverSonidoId } from '../data/catalogoSonidos.js'
import { FUNDIDOS, crearMezclador, normalizarVolumen, rampa } from './mezclador.js'

/** RN-RE-SND-27 — La vista previa se apaga sola a los veinte segundos. */
export const MS_VISTA_PREVIA = 20000

/**
 * @param {AudioContext} ctx
 * @param {{destino?: AudioNode, azar?: Function}} [opciones]
 */
export function crearMotorAmbiente(ctx, { destino, azar = Math.random } = {}) {
  const mezclador = crearMezclador(ctx, destino ? { destino } : {})

  /** La fuente que suena ahora, y la que se está yendo. Nunca más de dos. */
  let actual = null // { id, fuente, ganancia }
  let saliente = null
  let sonidoId = ID_SILENCIO
  let volumen = normalizarVolumen(undefined)
  let estadoSesion = 'inactivo'
  let temporizadorPrevia = null

  /** Cada fuente entra por su propia ganancia, que es lo que permite cruzarlas. */
  function montar(id) {
    const entrada = obtenerSonido(id)
    if (entrada === null || typeof entrada.crear !== 'function') return null

    const ganancia = ctx.createGain()
    ganancia.gain.setValueAtTime(0, ctx.currentTime)
    ganancia.connect(mezclador.entradaAmbiente)

    const fuente = entrada.crear(ctx, ganancia, { azar })
    fuente.iniciar()
    return { id, fuente, ganancia }
  }

  /** RN-RE-SND-03 — Al soltar no queda ni un nodo ni un evento pendiente. */
  function soltar(montaje) {
    if (montaje === null) return
    montaje.fuente.liberar()
    montaje.ganancia.disconnect?.()
  }

  function cancelarPrevia() {
    if (temporizadorPrevia === null) return
    clearTimeout(temporizadorPrevia)
    temporizadorPrevia = null
  }

  return {
    mezclador,

    /** El id que suena de verdad ahora mismo. */
    sonidoActual() {
      return sonidoId
    },

    /** Cuántas fuentes hay vivas. Lo miran las pruebas de fuga (casos 6.3 y 6.4). */
    fuentesVivas() {
      return [actual, saliente].filter(Boolean).length
    },

    /**
     * Cambia el sonido de fondo, cruzando (RN-RE-SND-14).
     *
     * Elegir `silencio` **libera los nodos**; poner el volumen a cero no
     * (RN-RE-SND-16). Son dos cosas distintas a propósito: bajar el control es
     * "ahora no quiero oírlo" y subirlo vuelve a oírse al instante; elegir
     * silencio es "no quiero esto sonando".
     */
    cambiarSonido(id, { duracion = FUNDIDOS.cruce } = {}) {
      const destinoId = resolverSonidoId(id)
      if (destinoId === sonidoId) return sonidoId

      // El cruce anterior no se deja a medias: si quedaba una saliente, se va
      // ahora. Sin esto, cinco cambios seguidos dejarían cinco fuentes vivas.
      soltar(saliente)
      saliente = null

      const ahora = ctx.currentTime
      if (actual !== null) {
        rampa(actual.ganancia.gain, 0, ahora, duracion)
        saliente = actual
        const seVa = saliente
        setTimeout(
          () => {
            if (saliente === seVa) {
              soltar(seVa)
              saliente = null
            }
          },
          duracion * 1000 + 50,
        )
      }

      actual = destinoId === ID_SILENCIO ? null : montar(destinoId)
      if (actual !== null) {
        // Sube mientras el otro baja: la suma nunca es cero durante el cruce.
        rampa(actual.ganancia.gain, 1, ahora, duracion)
      }
      sonidoId = destinoId
      return sonidoId
    },

    /** RN-RE-SND-09 — Entra durante el acomodo, ya presente al primer inhalar. */
    entrar() {
      mezclador.entrar(volumen)
    },

    salir(motivo) {
      return mezclador.salir(motivo)
    },

    /** RN-RE-SND-12/13 — El ambiente se agacha, la guía se calla. */
    aplicarEstado(siguiente) {
      estadoSesion = siguiente.estadoSesion ?? estadoSesion
      if (siguiente.volumenAmbiente !== undefined) {
        volumen = normalizarVolumen(siguiente.volumenAmbiente)
      }
      mezclador.aplicarEstado({ ...siguiente, estadoSesion, volumenAmbiente: volumen })
    },

    ajustarVolumen(siguiente) {
      volumen = normalizarVolumen(siguiente)
      mezclador.ajustarVolumenAmbiente(volumen, estadoSesion)
      return volumen
    },

    /**
     * RN-RE-SND-27/28 — Vista previa: elegir un sonido por su nombre es adivinar.
     * Suena al volumen configurado, para que se oiga como se va a oír.
     */
    vistaPrevia(id) {
      cancelarPrevia()
      this.cambiarSonido(id, { duracion: FUNDIDOS.vistaPrevia })
      mezclador.entrar(volumen, FUNDIDOS.vistaPrevia)
      if (resolverSonidoId(id) === ID_SILENCIO) return
      temporizadorPrevia = setTimeout(() => {
        temporizadorPrevia = null
        this.detenerVistaPrevia()
      }, MS_VISTA_PREVIA)
    },

    detenerVistaPrevia() {
      cancelarPrevia()
      this.cambiarSonido(ID_SILENCIO, { duracion: FUNDIDOS.vistaPrevia })
    },

    /**
     * Fija el sonido de la sesión que empieza, **sin cortar lo que ya suena**.
     *
     * Es `cambiarSonido` más una cosa: cancelar el apagado automático de la
     * vista previa. Si la sesión arranca justo después de haber escuchado un
     * sonido, la fuente que está sonando es la de la vista previa y su
     * temporizador de veinte segundos sigue vivo — sin esto, el ambiente se
     * apagaba solo a mitad de sesión y no había forma de relacionarlo con su
     * causa. Cuando el sonido es el mismo, `cambiarSonido` no hace nada y lo
     * que suena continúa sin un solo salto.
     */
    confirmarSonido(id) {
      cancelarPrevia()
      return this.cambiarSonido(id)
    },

    /** RN-RE-SND-22 — Al desmontar la pantalla no sobrevive nada. */
    liberar() {
      cancelarPrevia()
      soltar(actual)
      soltar(saliente)
      actual = null
      saliente = null
      sonidoId = ID_SILENCIO
      mezclador.liberar()
    },
  }
}
