// src/lib/respiracion/__tests__/fondo.test.js
// SPEC_23 Parte 2 (DP-23.22 y 23.23) — La sesión con la pantalla bloqueada: las
// fases programadas por adelantado, el cierre a su hora y el caso 9.4 con
// sonido (criterios 3 y 4).

import { describe, expect, it, vi } from 'vitest'

import { ESTADOS, crearMaquina } from '../maquinaSesion.js'
import { PATRON_BASE, duracionCiclo, resolverEstado } from '../motorRitmo.js'
import { tramosDesde, alRelojDelAudio } from '../tramos.js'
import { MS_VENTANA, crearRelojDeFondo } from '../relojDeFondo.js'
import { crearAcompanamientoDeFondo } from '../acompanamientoDeFondo.js'
import { crearRelojFalso } from './relojFalso.js'
import { crearAudioRespiracion, GANANCIA_MAX } from '@lib/audioRespiracion'

const CICLO = duracionCiclo(PATRON_BASE) // 13 000 ms
const PULSO = new Set(['inhalar', 'exhalar'])

const resolverBase = (ms) => {
  const estado = resolverEstado(PATRON_BASE, ms)
  return {
    fase: PULSO.has(estado.fase) ? estado.fase : 'pausa',
    restanteMs: estado.msRestantesFase,
  }
}

/** Comprueba que una lista de tramos va seguida, sin huecos ni solapes. */
function seguidos(tramos) {
  for (let i = 1; i < tramos.length; i += 1) {
    expect(tramos[i].desdeMs).toBe(tramos[i - 1].hastaMs)
  }
  tramos.forEach((t) => expect(t.hastaMs).toBeGreaterThan(t.desdeMs))
}

describe('tramosDesde', () => {
  it('las fases de 10 s, seguidas, con el mismo resolvedor que dibuja', () => {
    // Inhalar 5 s y exhalar 5 s: la ventana de 10 s acaba justo con la
    // exhalación, y un milisegundo más ya incluye la pausa entera.
    expect(tramosDesde(resolverBase, 0, MS_VENTANA).map((t) => t.fase)).toEqual([
      'inhalar',
      'exhalar',
    ])
    const tramos = tramosDesde(resolverBase, 0, MS_VENTANA + 1)
    seguidos(tramos)
    expect(tramos.map((t) => t.fase)).toEqual(['inhalar', 'exhalar', 'pausa'])
    // Cada tramo empieza donde el resolvedor dice que cambia la fase.
    tramos.forEach((t) => expect(resolverBase(t.desdeMs).fase).toBe(t.fase))
  })

  it('el primero empieza a media fase y el último se incluye entero', () => {
    const tramos = tramosDesde(resolverBase, 2000, 3000)
    expect(tramos).toEqual([{ fase: 'inhalar', desdeMs: 2000, hastaMs: 5000 }])
  })

  it('nada después del cierre', () => {
    const tramos = tramosDesde(resolverBase, 0, 60_000, CICLO)
    expect(tramos.at(-1).hastaMs).toBe(CICLO)
    seguidos(tramos)
  })

  it('para si el resolvedor dice que ya terminó', () => {
    expect(tramosDesde(() => null, 0, 10_000)).toEqual([])
  })

  it('al reloj del audio: el instante de la sesión pasa a segundos del contexto', () => {
    expect(
      alRelojDelAudio([{ fase: 'inhalar', desdeMs: 5000, hastaMs: 10_000 }], 4000, 100),
    ).toEqual([{ fase: 'inhalar', inicio: 101, fin: 106 }])
  })
})

describe('el reloj de fondo', () => {
  it('arranca con un tic inmediato, no se duplica y se detiene', () => {
    const alTic = vi.fn()
    const programar = vi.fn(() => 7)
    const cancelar = vi.fn()
    const reloj = crearRelojDeFondo({ alTic, programar, cancelar })
    reloj.iniciar()
    reloj.iniciar()
    expect(alTic).toHaveBeenCalledTimes(1)
    expect(programar).toHaveBeenCalledTimes(1)
    reloj.detener()
    expect(cancelar).toHaveBeenCalledWith(7)
    expect(reloj.activo()).toBe(false)
  })
})

// ─── El acompañamiento, con una guía que apunta lo que le programan ───────────

function guiaQueApunta() {
  return {
    programados: [],
    cancelaciones: 0,
    programar(tramos) {
      this.programados.push(...tramos)
    },
    cancelarProgramado() {
      this.cancelaciones += 1
    },
  }
}

function montar({ corriendo = true, finMs = null } = {}) {
  const sesion = { ms: 2000, corriendo, finMs }
  const guia = guiaQueApunta()
  const audio = { t: 50 }
  const sincronizar = vi.fn()
  const alCierre = vi.fn()
  const acompanamiento = crearAcompanamientoDeFondo({
    instante: () => {
      const punto = resolverBase(sesion.ms)
      return {
        corriendo: sesion.corriendo,
        ms: sesion.ms,
        finFaseMs: sesion.ms + punto.restanteMs,
        finMs: sesion.finMs,
      }
    },
    resolver: resolverBase,
    guia: () => guia,
    relojAudio: () => audio.t + (sesion.ms - 2000) / 1000,
    sincronizar,
    alCierre,
    reloj: { programar: () => 1, cancelar: () => {} },
  })
  return { sesion, guia, audio, sincronizar, alCierre, acompanamiento }
}

describe('el acompañamiento de fondo (DP-23.22)', () => {
  it('al irse con el ritmo en marcha, programa desde el final de la fase en curso', () => {
    const { guia, acompanamiento, sincronizar } = montar()
    acompanamiento.entrar()
    // La fase en curso (inhalar hasta 5 s) ya la programó el último fotograma.
    expect(sincronizar).not.toHaveBeenCalled()
    expect(guia.programados[0]).toMatchObject({ fase: 'exhalar', inicio: 53, fin: 58 })
  })

  it('tic tras tic, en orden y sin huecos ni solapes', () => {
    const { sesion, guia, acompanamiento } = montar()
    acompanamiento.entrar()
    sesion.ms = 4000
    acompanamiento.tic()
    sesion.ms = 9000
    acompanamiento.tic()
    for (let i = 1; i < guia.programados.length; i += 1) {
      expect(guia.programados[i].inicio).toBeCloseTo(guia.programados[i - 1].fin, 6)
    }
    const fases = guia.programados.map((t) => t.fase)
    expect(fases.slice(0, 4)).toEqual(['exhalar', 'pausa', 'inhalar', 'exhalar'])
  })

  it('el fundido final se programa una vez, a la hora del cierre', () => {
    const { sesion, alCierre, acompanamiento } = montar({ finMs: CICLO })
    sesion.ms = CICLO - 9000
    acompanamiento.entrar()
    acompanamiento.tic()
    expect(alCierre).toHaveBeenCalledTimes(1)
    // 9 s antes del cierre, en el reloj del audio de ese instante.
    expect(alCierre.mock.calls[0][0]).toBeCloseTo(50 + (CICLO - 9000 - 2000) / 1000 + 9, 6)
  })

  it('nada se programa después del cierre', () => {
    const { sesion, guia, acompanamiento } = montar({ finMs: CICLO })
    sesion.ms = CICLO - 4000
    acompanamiento.entrar()
    const ultimo = guia.programados.at(-1)
    expect(ultimo.fin).toBeLessThanOrEqual(50 + (CICLO - 2000) / 1000 + 1e-9)
  })

  it('en pausa se cancela lo programado; al retomar, la fase en curso desde el valor real', () => {
    const { sesion, guia, sincronizar, acompanamiento } = montar()
    acompanamiento.entrar()
    sesion.corriendo = false
    acompanamiento.tic()
    expect(guia.cancelaciones).toBe(1)
    sesion.corriendo = true
    sesion.ms = 6000
    acompanamiento.tic()
    expect(sincronizar).toHaveBeenCalledTimes(1)
  })

  it('al volver la app se cancela todo', () => {
    const { guia, acompanamiento } = montar()
    acompanamiento.entrar()
    acompanamiento.salir()
    expect(guia.cancelaciones).toBe(1)
    expect(acompanamiento.activo()).toBe(false)
  })

  it('sin sesión no programa nada', () => {
    const guia = guiaQueApunta()
    const acompanamiento = crearAcompanamientoDeFondo({
      instante: () => null,
      resolver: resolverBase,
      guia: () => guia,
      relojAudio: () => 0,
      sincronizar: () => {},
      reloj: { programar: () => 1, cancelar: () => {} },
    })
    acompanamiento.entrar()
    expect(guia.programados).toEqual([])
  })
})

// ─── La máquina sin fotogramas ────────────────────────────────────────────────

function maquinaSinFotogramas(duracion) {
  const falso = crearRelojFalso()
  const fases = []
  const estados = []
  const maquina = crearMaquina({
    patron: PATRON_BASE,
    duracion,
    ahora: falso.ahora,
    programarFrame: falso.programarFrame,
    cancelarFrame: falso.cancelarFrame,
    alCambiarFase: (ritmo) => fases.push(`${ritmo.cicloActual}:${ritmo.fase}`),
    alCambiarEstado: (estado) => estados.push(estado),
  })
  return { falso, fases, estados, maquina }
}

describe('la máquina con la pantalla bloqueada', () => {
  it('con tics cada 2 s y ningún fotograma, emite las fases y termina a su hora', () => {
    const { falso, fases, maquina } = maquinaSinFotogramas({ modo: 'ciclos', valor: 2 })
    maquina.iniciar()
    maquina.saltarAcomodo()
    for (let ms = 0; ms < CICLO * 3; ms += 2000) {
      falso.ausentarse(2000)
      maquina.evaluarAhora()
    }
    expect(maquina.instantanea().estado).toBe(ESTADOS.COMPLETADO)
    expect(fases.every((clave) => Number(clave.split(':')[0]) <= 2)).toBe(true)
  })

  it('el cierre previsto sale del límite: respiraciones y minutos', () => {
    expect(maquinaSinFotogramas({ modo: 'ciclos', valor: 3 }).maquina.msCierrePrevisto()).toBe(
      3 * CICLO,
    )
    expect(maquinaSinFotogramas({ modo: 'minutos', valor: 3 }).maquina.msCierrePrevisto()).toBe(
      Math.ceil(180_000 / CICLO) * CICLO,
    )
  })

  it('un tic que llega tarde no alarga la sesión un ciclo', () => {
    const { falso, maquina } = maquinaSinFotogramas({ modo: 'minutos', valor: 1 })
    maquina.iniciar()
    maquina.saltarAcomodo()
    const previsto = maquina.msCierrePrevisto()
    // El límite se cruza y el tic llega 4 s después del final del ciclo.
    falso.ausentarse(previsto + 4000)
    maquina.evaluarAhora()
    // Antes el cierre se medía desde el tic (ceil(ms / ciclo)) y caía un ciclo
    // más tarde: la sesión seguía. Ahora termina en ese mismo tic, con los
    // ciclos que pedía el límite.
    expect(maquina.instantanea().estado).toBe(ESTADOS.COMPLETADO)
    expect(maquina.resumen().ciclosCompletados).toBe(previsto / CICLO)
  })

  it('en pausa, evaluar no hace nada', () => {
    const { falso, fases, maquina } = maquinaSinFotogramas({ modo: 'ciclos', valor: 3 })
    maquina.iniciar()
    maquina.saltarAcomodo()
    maquina.pausar()
    const antes = fases.length
    falso.ausentarse(CICLO)
    maquina.evaluarAhora()
    expect(fases).toHaveLength(antes)
  })
})

describe('el caso 9.4 con sonido (DP-23.23)', () => {
  function enMarcha() {
    const montaje = maquinaSinFotogramas({ modo: 'ciclos', valor: 5 })
    montaje.maquina.iniciar()
    montaje.maquina.saltarAcomodo()
    return montaje
  }

  it('con sonido que sonó fuera, no se pausa: sí siguió', () => {
    const { maquina } = enMarcha()
    expect(maquina.notificarAusencia(CICLO * 2, { sono: true })).toBe(false)
    expect(maquina.instantanea().estado).toBe(ESTADOS.ACTIVO)
  })

  it('si no sonó, se pausa como siempre', () => {
    const { maquina } = enMarcha()
    expect(maquina.notificarAusencia(CICLO * 2, { sono: false })).toBe(true)
    expect(maquina.instantanea().estado).toBe(ESTADOS.PAUSADO)
  })

  it('sin decir nada (en silencio), se pausa como siempre', () => {
    const { maquina } = enMarcha()
    expect(maquina.notificarAusencia(CICLO * 2)).toBe(true)
  })
})

// ─── La guía programada por adelantado ────────────────────────────────────────

function contextoQueApunta() {
  const parametro = (inicial) => ({
    value: inicial,
    eventos: [],
    setValueAtTime(v, t) {
      this.eventos.push(['set', v, t])
    },
    linearRampToValueAtTime(v, t) {
      this.eventos.push(['rampa', v, t])
    },
    cancelScheduledValues(t) {
      this.eventos.push(['cancelar', t])
    },
  })
  const nodo = () => ({ gain: parametro(1), connect() {}, disconnect() {} })
  const ctx = {
    state: 'running',
    currentTime: 10,
    destination: {},
    osciladores: [],
    ganancias: [],
    createOscillator() {
      const o = { frequency: parametro(196), start() {}, stop() {}, connect() {}, disconnect() {} }
      this.osciladores.push(o)
      return o
    },
    createGain() {
      const g = nodo()
      this.ganancias.push(g)
      return g
    },
    resume: async () => {},
    close() {},
  }
  return ctx
}

describe('la guía: programar(tramos)', () => {
  async function guia() {
    const ctx = contextoQueApunta()
    const voz = crearAudioRespiracion({ crearContexto: () => ctx })
    await voz.iniciar()
    const envolvente = ctx.ganancias[0].gain
    envolvente.eventos.length = 0
    return { ctx, voz, envolvente }
  }

  it('cada tramo se ancla donde acabó el anterior y sube o baja hasta su final', async () => {
    const { voz, envolvente } = await guia()
    voz.programar([
      { fase: 'inhalar', inicio: 11, fin: 16 },
      { fase: 'exhalar', inicio: 16, fin: 21 },
      { fase: 'pausa', inicio: 21, fin: 24 },
    ])
    expect(envolvente.eventos).toEqual([
      ['set', 0, 11],
      ['rampa', GANANCIA_MAX, 16],
      ['set', GANANCIA_MAX, 16],
      ['rampa', 0, 21],
      ['set', 0, 21],
      ['rampa', 0, 21.08],
    ])
    expect(voz.programado()).toEqual({ hasta: 24, fases: 3 })
  })

  it('no programa en el pasado', async () => {
    const { voz, envolvente } = await guia()
    voz.programar([{ fase: 'inhalar', inicio: 1, fin: 5 }])
    expect(envolvente.eventos).toEqual([])
  })

  it('cancelar deja la envolvente donde suena y olvida lo programado', async () => {
    const { voz, envolvente } = await guia()
    voz.programar([{ fase: 'inhalar', inicio: 11, fin: 16 }])
    voz.cancelarProgramado()
    expect(envolvente.eventos.at(-2)).toEqual(['cancelar', 10])
    expect(voz.programado()).toEqual({ hasta: null, fases: 0 })
  })

  it('una fase con fase() olvida lo programado', async () => {
    const { voz } = await guia()
    voz.programar([{ fase: 'inhalar', inicio: 11, fin: 16 }])
    voz.fase('exhalar', 3)
    expect(voz.programado().fases).toBe(0)
  })
})
