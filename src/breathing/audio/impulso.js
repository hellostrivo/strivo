// src/breathing/audio/impulso.js
// La gota y la chispa: un chasquido corto de ruido, filtrado y con cola.
//
// Lluvia y fuego son el mismo gesto con otros números —un impulso brevísimo de
// ruido blanco pasado por un filtro estrecho y apagado con una exponencial—, así
// que vive una vez. Lo que los distingue son los parámetros de §3.3, no la
// mecánica.
//
// **La cola es exponencial y no lineal**, y esa es toda la diferencia entre que
// suene a gota y que suene a golpe: en el mundo físico la energía de un impacto
// decae proporcionalmente a lo que queda, no a partes iguales.

/**
 * Programa un impulso. No suena en el momento de llamarla: suena en `instante`,
 * que es un tiempo del reloj de audio (RN-RE-SND-06).
 *
 * @param {AudioContext} ctx
 * @param {AudioNode} destino
 * @param {object} p
 * @param {number} p.instante        - En segundos de `ctx.currentTime`.
 * @param {AudioBuffer} p.buffer     - Ruido ya generado. Nunca se genera aquí.
 * @param {number} p.msDuracion      - Lo que dura el trozo de ruido.
 * @param {number} p.hz              - Centro del paso-banda.
 * @param {number} p.q               - Cuán estrecho.
 * @param {number} p.ganancia        - Pico.
 * @param {number} p.msDecaimiento   - Cola.
 * @returns {{fuente: AudioNode, nodos: AudioNode[], hasta: number}}
 */
export function programarImpulso(
  ctx,
  destino,
  { instante, buffer, msDuracion, hz, q, ganancia, msDecaimiento },
) {
  const fuente = ctx.createBufferSource()
  fuente.buffer = buffer
  fuente.loop = true
  // Entra por un punto cualquiera del ruido: si todas las gotas empezaran en la
  // misma muestra, todas sonarían igual y el oído lo caza enseguida.
  const desplazamiento = (instante * 7.13) % Math.max(0.001, buffer.duration)

  const filtro = ctx.createBiquadFilter()
  filtro.type = 'bandpass'
  filtro.frequency.setValueAtTime(hz, instante)
  filtro.Q.setValueAtTime(q, instante)

  const envolvente = ctx.createGain()
  const cola = msDecaimiento / 1000
  // RN-RE-SND-08 — Nunca una asignación directa a `.value`: un salto de
  // ganancia es un chasquido, y aquí habría uno por gota.
  envolvente.gain.setValueAtTime(0, instante)
  envolvente.gain.linearRampToValueAtTime(ganancia, instante + 0.002)
  envolvente.gain.exponentialRampToValueAtTime(0.0001, instante + cola)

  fuente.connect(filtro)
  filtro.connect(envolvente)
  envolvente.connect(destino)

  const hasta = instante + cola + 0.05
  fuente.start(instante, desplazamiento, msDuracion / 1000 + cola)
  fuente.stop(hasta)

  return { fuente, nodos: [fuente, filtro, envolvente], hasta }
}
