// src/breathing/audio/fuentes/fuego.js
// Chisporroteo bajo (§3.3).
//
// La misma mecánica que la lluvia con otros números, y el cambio de números es
// todo: lecho **marrón** en vez de rosa —más grave, sin brillo—, cortado mucho
// más abajo (900 Hz frente a 1800), y crepitaciones con una cola de 40 ms en
// lugar de 90. Una gota resuena; una chispa no.

import { crearBufferRuido, crearFuenteEnBucle } from '@lib/audio/ruido'
import { crearPlanificador, crearVoces, entre, intervaloAleatorio } from '../planificador.js'
import { programarImpulso } from '../impulso.js'

export const PARAMETROS = Object.freeze({
  lechoHz: 900,
  lechoGanancia: 0.32,
  chispaMsMin: 80,
  chispaMsMax: 500,
  chispaDuracionMs: 6,
  chispaHzMin: 1200,
  chispaHzMax: 3800,
  chispaQ: 12,
  chispaGananciaMin: 0.06,
  chispaGananciaMax: 0.2,
  chispaDecaimientoMs: 40,
})

export function siguienteChispa(azar = Math.random) {
  return intervaloAleatorio(PARAMETROS.chispaMsMin, PARAMETROS.chispaMsMax, azar)
}

export function crear(ctx, destino, { azar = Math.random } = {}) {
  const lecho = crearFuenteEnBucle(ctx, crearBufferRuido(ctx, 'marron', { azar }))
  const bufferChispa = crearBufferRuido(ctx, 'blanco', { azar, segundos: 1, conCruce: false })

  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.setValueAtTime(PARAMETROS.lechoHz, ctx.currentTime)

  const ganancia = ctx.createGain()
  ganancia.gain.setValueAtTime(PARAMETROS.lechoGanancia, ctx.currentTime)

  lecho.connect(filtro)
  filtro.connect(ganancia)
  ganancia.connect(destino)

  const voces = crearVoces(ctx)
  const planificador = crearPlanificador(ctx, {
    alTic: voces.segar,
    siguienteIntervalo: () => siguienteChispa(azar),
    disparar(instante) {
      const { fuente, nodos, hasta } = programarImpulso(ctx, destino, {
        instante,
        buffer: bufferChispa,
        msDuracion: PARAMETROS.chispaDuracionMs,
        hz: entre(PARAMETROS.chispaHzMin, PARAMETROS.chispaHzMax, azar),
        q: PARAMETROS.chispaQ,
        ganancia: entre(PARAMETROS.chispaGananciaMin, PARAMETROS.chispaGananciaMax, azar),
        msDecaimiento: PARAMETROS.chispaDecaimientoMs,
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
    liberar() {
      planificador.detener()
      try {
        lecho.stop()
      } catch {
        // No había arrancado.
      }
      voces.vaciar()
      ;[lecho, filtro, ganancia].forEach((nodo) => nodo.disconnect?.())
      arrancado = false
    },
  }
}
