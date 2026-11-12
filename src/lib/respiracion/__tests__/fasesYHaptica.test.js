// src/lib/respiracion/__tests__/fasesYHaptica.test.js
// SPEC_23B — Qué cambios de fase emite la máquina, que son los que vibran.
//
// El toque cuelga de `alCambiarFase`: lo que la máquina emite es exactamente
// lo que la persona siente en la mano. Por eso estas pruebas miran el flujo de
// fases —nada en el acomodo, nada en pausa, nada repetido al reanudar y, desde
// SPEC_23 §9, nada después del cierre—.

import { describe, expect, it } from 'vitest'

import { ESTADOS, MS_ACOMODO, crearMaquina } from '../maquinaSesion.js'
import { PATRON_BASE, duracionCiclo } from '../motorRitmo.js'
import { crearRelojFalso } from './relojFalso.js'
import { vibraEnFase } from '@/breathing/hooks/useSesionRespiracion.js'
import { claveDeFase, faseEn } from '@lib/ritmoRespiracion'

const CICLO = duracionCiclo(PATRON_BASE) // 13 000 ms

function montar(duracion) {
  const falso = crearRelojFalso()
  const fases = []
  const maquina = crearMaquina({
    patron: PATRON_BASE,
    duracion,
    ahora: falso.ahora,
    programarFrame: falso.programarFrame,
    cancelarFrame: falso.cancelarFrame,
    alCambiarFase: (ritmo) =>
      fases.push({
        fase: ritmo.fase,
        ciclo: ritmo.cicloActual,
        estado: maquina.instantanea().estado,
      }),
  })
  return { falso, maquina, fases }
}

describe('la inhalación fantasma del último fotograma (SPEC_23 §9)', () => {
  it('con dos respiraciones, la última fase emitida es del ciclo 2', () => {
    const { falso, maquina, fases } = montar({ modo: 'ciclos', valor: 2 })
    maquina.iniciar()
    maquina.saltarAcomodo()
    falso.avanzar(CICLO * 3)
    expect(maquina.instantanea().estado).toBe(ESTADOS.COMPLETADO)
    expect(fases.every((f) => f.ciclo <= 2)).toBe(true)
    expect(fases.at(-1).ciclo).toBe(2)
  })

  it('con un minuto, ninguna fase sale después de cerrar', () => {
    const { falso, maquina, fases } = montar({ modo: 'minutos', valor: 1 })
    maquina.iniciar()
    maquina.saltarAcomodo()
    falso.avanzar(60_000 + CICLO * 2)
    expect(maquina.instantanea().estado).toBe(ESTADOS.COMPLETADO)
    const ultimoCiclo = Math.ceil(60_000 / CICLO)
    expect(fases.every((f) => f.ciclo <= ultimoCiclo)).toBe(true)
  })

  it('cada fase de cada ciclo sale una vez, ni más ni menos', () => {
    const { falso, maquina, fases } = montar({ modo: 'ciclos', valor: 2 })
    maquina.iniciar()
    maquina.saltarAcomodo()
    falso.avanzar(CICLO * 3)
    const claves = fases.map((f) => `${f.ciclo}:${f.fase}`)
    expect(new Set(claves).size).toBe(claves.length)
    // inhalar, exhalar y retener vacío: tres por ciclo (retener lleno vale 0).
    expect(claves).toHaveLength(6)
  })
})

describe('cuándo emite, que es cuándo vibra', () => {
  it('nada durante el acomodo', () => {
    const { falso, maquina, fases } = montar({ modo: 'ciclos', valor: 2 })
    maquina.iniciar()
    falso.avanzar(MS_ACOMODO - 100)
    expect(fases).toEqual([])
  })

  it('el primer «inhalar» llega al acabar el acomodo, ya en activo', () => {
    const { falso, maquina, fases } = montar({ modo: 'ciclos', valor: 2 })
    maquina.iniciar()
    falso.avanzar(MS_ACOMODO + 50)
    expect(fases[0]).toEqual({ fase: 'inhalar', ciclo: 1, estado: ESTADOS.ACTIVO })
  })

  it('nada en pausa, y al reanudar no se repite la fase en la que se pausó', () => {
    const { falso, maquina, fases } = montar({ modo: 'ciclos', valor: 3 })
    maquina.iniciar()
    maquina.saltarAcomodo()
    falso.avanzar(1000)
    const antes = fases.length
    maquina.pausar()
    falso.avanzar(CICLO * 2)
    expect(fases).toHaveLength(antes)
    maquina.reanudar()
    falso.avanzar(100)
    expect(fases).toHaveLength(antes)
  })

  it('todo lo que emite lo emite en activo o en cerrando', () => {
    const { falso, maquina, fases } = montar({ modo: 'ciclos', valor: 2 })
    maquina.iniciar()
    maquina.saltarAcomodo()
    falso.avanzar(CICLO * 3)
    expect(fases.every((f) => vibraEnFase(f.estado))).toBe(true)
  })
})

describe('vibraEnFase', () => {
  it('sí con la sesión activa o en su último ciclo', () => {
    expect(vibraEnFase(ESTADOS.ACTIVO)).toBe(true)
    expect(vibraEnFase(ESTADOS.CERRANDO)).toBe(true)
  })

  it('nunca sin sesión, en el acomodo, en pausa o al terminar', () => {
    ;[ESTADOS.INACTIVO, ESTADOS.ACOMODANDO, ESTADOS.PAUSADO, ESTADOS.COMPLETADO, undefined].forEach(
      (estado) => expect(vibraEnFase(estado)).toBe(false),
    )
  })
})

describe('claveDeFase («Respira un momento»)', () => {
  it('la misma fase de ciclos distintos tiene claves distintas', () => {
    const duracion = 13_000
    expect(claveDeFase(faseEn(100))).not.toBe(claveDeFase(faseEn(duracion + 100)))
  })

  it('dos puntos de la misma fase y el mismo ciclo comparten clave: no vibra dos veces', () => {
    expect(claveDeFase(faseEn(100))).toBe(claveDeFase(faseEn(2000)))
  })

  it('al terminar no hay clave: no hay nada que vibrar', () => {
    expect(claveDeFase(faseEn(10_000_000))).toBeNull()
    expect(claveDeFase(null)).toBeNull()
  })
})
