// src/breathing/audio/fuentes/cristales.js
// Notas sueltas que aparecen y se van (§3.3).
//
// **El único sonido sin lecho: entre campana y campana hay silencio de verdad.**
// Eso lo hace el más delicado de los cinco, porque cada nota se oye entera y
// cualquier error de afinación o de cola queda a la vista.
//
// Las alturas salen de una **pentatónica de Do**, que es la escala sin
// semitonos: cualesquiera dos notas suenan bien juntas, así que por mucho que el
// azar solape dos campanas nunca puede producir una disonancia. Elegir al azar
// dentro de una escala mayor sí podría.
//
// El intervalo va de 2,5 a 7,0 s a propósito: por debajo empezaría a leerse como
// un pulso y competiría con la respiración (RN-RE-SND-07).

import { crearPlanificador, crearVoces, entre, intervaloAleatorio, unoDe } from '../planificador.js'

export const PARAMETROS = Object.freeze({
  msMin: 2500,
  msMax: 7000,
  ataqueMs: 8,
  colaMsMin: 2800,
  colaMsMax: 4500,
  gananciaMin: 0.12,
  gananciaMax: 0.22,
  armonicoGanancia: 0.3,
  paneoMin: -0.4,
  paneoMax: 0.4,
})

/** Pentatónica de Do: Do, Re, Mi, Sol, La. Sin semitonos, sin disonancia posible. */
export const ALTURAS = Object.freeze([523.25, 587.33, 659.25, 783.99, 880.0])

export function siguienteCampana(azar = Math.random) {
  return intervaloAleatorio(PARAMETROS.msMin, PARAMETROS.msMax, azar)
}

export function crear(ctx, destino, { azar = Math.random } = {}) {
  const voces = crearVoces(ctx)

  const planificador = crearPlanificador(ctx, {
    alTic: voces.segar,
    siguienteIntervalo: () => siguienteCampana(azar),
    disparar(instante) {
      const altura = unoDe(ALTURAS, azar)
      const pico = entre(PARAMETROS.gananciaMin, PARAMETROS.gananciaMax, azar)
      const cola = entre(PARAMETROS.colaMsMin, PARAMETROS.colaMsMax, azar) / 1000
      const ataque = PARAMETROS.ataqueMs / 1000

      const fundamental = ctx.createOscillator()
      fundamental.type = 'sine'
      fundamental.frequency.setValueAtTime(altura, instante)

      // El armónico al doble es lo que le da el timbre de cristal en vez de el
      // de un tono de prueba. Un seno solo suena a aparato médico.
      const armonico = ctx.createOscillator()
      armonico.type = 'sine'
      armonico.frequency.setValueAtTime(altura * 2, instante)
      const gananciaArmonico = ctx.createGain()
      gananciaArmonico.gain.setValueAtTime(PARAMETROS.armonicoGanancia, instante)

      const envolvente = ctx.createGain()
      envolvente.gain.setValueAtTime(0.0001, instante)
      envolvente.gain.linearRampToValueAtTime(pico, instante + ataque)
      // Exponencial: una campana pierde energía en proporción a la que le queda.
      envolvente.gain.exponentialRampToValueAtTime(0.0001, instante + cola)

      const paneo = ctx.createStereoPanner?.()
      if (paneo)
        paneo.pan.setValueAtTime(entre(PARAMETROS.paneoMin, PARAMETROS.paneoMax, azar), instante)

      fundamental.connect(envolvente)
      armonico.connect(gananciaArmonico)
      gananciaArmonico.connect(envolvente)
      if (paneo) {
        envolvente.connect(paneo)
        paneo.connect(destino)
      } else {
        envolvente.connect(destino)
      }

      fundamental.start(instante)
      armonico.start(instante)
      fundamental.stop(instante + cola + 0.05)
      armonico.stop(instante + cola + 0.05)

      const nodos = [fundamental, armonico, gananciaArmonico, envolvente, paneo].filter(Boolean)
      const voz = voces.anadir(nodos, instante + cola + 0.05)
      fundamental.onended = () => voces.soltar(voz)
    },
  })

  return {
    iniciar() {
      planificador.iniciar()
    },
    detener() {
      planificador.detener()
    },
    liberar() {
      planificador.detener()
      voces.vaciar()
    },
  }
}
