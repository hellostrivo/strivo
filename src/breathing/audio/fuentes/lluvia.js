// src/breathing/audio/fuentes/lluvia.js
// Lluvia constante, sin tormenta (§3.3).
//
// Un lecho de ruido rosa apagado por un paso-bajo —el rumor de fondo— y gotas
// sueltas por encima. Las gotas son lo que la hace lluvia y no un extractor:
// sin ellas el lecho es solo aire.

import { crearBufferRuido, crearFuenteEnBucle } from '@lib/audio/ruido'
import { crearPlanificador, crearVoces, entre, intervaloAleatorio } from '../planificador.js'
import { programarImpulso } from '../impulso.js'

/** §3.3 — Los números son del spec, literales. */
export const PARAMETROS = Object.freeze({
  lechoHz: 1800,
  lechoQ: 0.7,
  lechoGanancia: 0.55,
  gotaMsMin: 40,
  gotaMsMax: 180,
  gotaDuracionMs: 12,
  gotaHzMin: 2200,
  gotaHzMax: 5200,
  gotaQ: 8,
  gotaGananciaMin: 0.1,
  gotaGananciaMax: 0.28,
  gotaDecaimientoMs: 90,
})

/** Puro, para poder medir que las gotas no caen a compás (RN-RE-SND-07). */
export function siguienteGota(azar = Math.random) {
  return intervaloAleatorio(PARAMETROS.gotaMsMin, PARAMETROS.gotaMsMax, azar)
}

export function crear(ctx, destino, { azar = Math.random } = {}) {
  const buffer = crearBufferRuido(ctx, 'rosa', { azar })
  const bufferGota = crearBufferRuido(ctx, 'blanco', { azar, segundos: 1, conCruce: false })

  const lecho = crearFuenteEnBucle(ctx, buffer)
  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.setValueAtTime(PARAMETROS.lechoHz, ctx.currentTime)
  filtro.Q.setValueAtTime(PARAMETROS.lechoQ, ctx.currentTime)

  const ganancia = ctx.createGain()
  ganancia.gain.setValueAtTime(PARAMETROS.lechoGanancia, ctx.currentTime)

  lecho.connect(filtro)
  filtro.connect(ganancia)
  ganancia.connect(destino)

  const voces = crearVoces(ctx)
  const planificador = crearPlanificador(ctx, {
    alTic: voces.segar,
    siguienteIntervalo: () => siguienteGota(azar),
    disparar(instante) {
      const { fuente, nodos, hasta } = programarImpulso(ctx, destino, {
        instante,
        buffer: bufferGota,
        msDuracion: PARAMETROS.gotaDuracionMs,
        hz: entre(PARAMETROS.gotaHzMin, PARAMETROS.gotaHzMax, azar),
        q: PARAMETROS.gotaQ,
        ganancia: entre(PARAMETROS.gotaGananciaMin, PARAMETROS.gotaGananciaMax, azar),
        msDecaimiento: PARAMETROS.gotaDecaimientoMs,
      })
      const voz = voces.anadir(nodos, hasta)
      fuente.onended = () => voces.soltar(voz)
    },
  })

  let arrancado = false

  return {
    iniciar() {
      if (arrancado) return
      arrancado = true
      lecho.start()
      planificador.iniciar()
    },
    detener() {
      planificador.detener()
    },
    /** RN-RE-SND-03 — Al soltar no queda un nodo conectado ni un evento pendiente. */
    liberar() {
      planificador.detener()
      try {
        lecho.stop()
      } catch {
        // No había arrancado. Nada que hacer.
      }
      voces.vaciar()
      ;[lecho, filtro, ganancia].forEach((nodo) => nodo.disconnect?.())
      arrancado = false
    },
  }
}
