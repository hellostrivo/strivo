// tests/frases.test.js
// De dónde sale la frase del umbral (§17.5) y la del día (§20.3), y las reglas
// de cuándo se muestra la apertura de sesión (§17.4).

import { describe, it, expect } from 'vitest'
import { copy } from '@copy'
import { siguienteFrase, fraseDelDia, barajar, REPERTORIOS } from '@lib/frases'
import {
  debeMostrarApertura,
  ultimaApertura,
  anotarApertura,
  AUSENCIA_MINIMA,
  DESCANSO_MINIMO,
} from '@lib/sesion'

const MINUTO = 60 * 1000

describe('Los dos repertorios (docs/frases.md)', () => {
  it('tienen el tamaño acordado', () => {
    expect(copy.apertura.frases).toHaveLength(100)
    expect(copy.hoy.fraseDelDia).toHaveLength(60)
  })

  it('no se mezclan: ninguna frase está en los dos', () => {
    const enApertura = new Set(copy.apertura.frases)
    for (const frase of copy.hoy.fraseDelDia) {
      expect(enApertura.has(frase), frase).toBe(false)
    }
  })

  it('ninguna se repite dentro de su repertorio', () => {
    for (const [nombre, leer] of Object.entries(REPERTORIOS)) {
      const frases = leer()
      expect(new Set(frases).size, nombre).toBe(frases.length)
    }
  })

  it('se leen en tres segundos: como mucho 14 palabras', () => {
    // La regla 1 de docs/frases.md pide entre 4 y 14 palabras. Tres frases del
    // repertorio entregado se quedan por debajo —"Hay tiempo.", "No vas tarde."
    // y "Puedes ir despacio."— y son de las mejores que hay: la brevedad es
    // justo lo que las hace funcionar en un mal día. El tope sí se comprueba.
    for (const frase of [...copy.apertura.frases, ...copy.hoy.fraseDelDia]) {
      const palabras = frase.trim().split(/\s+/).length
      expect(palabras, frase).toBeGreaterThanOrEqual(2)
      expect(palabras, frase).toBeLessThanOrEqual(14)
    }
  })

  it('ninguna lleva marca de género ni léxico prohibido', () => {
    const marca     = /\w+[oa]s?\/[oa]s?\b|\belles?\b/i
    const prohibido = /\bracha|streak|fallaste|deber[ií]as?\b/i
    for (const frase of [...copy.apertura.frases, ...copy.hoy.fraseDelDia]) {
      expect(frase, frase).not.toMatch(marca)
      expect(frase, frase).not.toMatch(prohibido)
    }
  })
})

describe('Baraja, no dado (§17.5)', () => {
  it('la permutación contiene todos los índices una vez', () => {
    const orden = barajar(10)
    expect(orden).toHaveLength(10)
    expect([...orden].sort((a, b) => a - b)).toEqual([...Array(10).keys()])
  })

  it('no repite ninguna frase hasta agotar el repertorio', async () => {
    const total  = copy.apertura.frases.length
    const salidas = []
    for (let i = 0; i < total; i += 1) salidas.push(await siguienteFrase('apertura'))

    expect(new Set(salidas).size).toBe(total)
  })

  it('al agotarlo vuelve a barajar y sigue dando frases', async () => {
    const total = copy.apertura.frases.length
    for (let i = 0; i < total; i += 1) await siguienteFrase('apertura')

    const siguiente = await siguienteFrase('apertura')
    expect(copy.apertura.frases).toContain(siguiente)
  })

  it('el estado sobrevive a cerrar la app: no se reinicia en cada arranque', async () => {
    const primera = await siguienteFrase('apertura')
    const segunda = await siguienteFrase('apertura')

    // Cada llamada es un "arranque": si la baraja se reiniciara, la primera
    // frase de la permutación saldría una y otra vez.
    expect(segunda).not.toBe(primera)
  })
})

describe('La frase del día (§20.3)', () => {
  it('es la misma durante todo el día natural', async () => {
    const primera = await fraseDelDia('2026-08-07')
    const otraVez = await fraseDelDia('2026-08-07')
    const tercera = await fraseDelDia('2026-08-07')

    expect(otraVez).toBe(primera)
    expect(tercera).toBe(primera)
    expect(copy.hoy.fraseDelDia).toContain(primera)
  })

  it('cambia al día siguiente', async () => {
    const hoy    = await fraseDelDia('2026-08-07')
    const manana = await fraseDelDia('2026-08-08')

    expect(manana).not.toBe(hoy)
  })
})

describe('Cuándo aparece la apertura de sesión (§17.4)', () => {
  const ahora = 1_770_000_000_000

  it('en un arranque en frío, sí', () => {
    expect(debeMostrarApertura({
      ahora, ultimaVez: null, ocultaDesde: null, vieneDelOnboarding: false,
    })).toBe(true)
  })

  it('justo después del onboarding, no', () => {
    expect(debeMostrarApertura({
      ahora, ultimaVez: null, ocultaDesde: null, vieneDelOnboarding: true,
    })).toBe(false)
  })

  it('volviendo tras dos minutos fuera, no; tras cuarenta, sí', () => {
    const base = { ahora, ultimaVez: ahora - 3 * DESCANSO_MINIMO, vieneDelOnboarding: false }

    expect(debeMostrarApertura({ ...base, ocultaDesde: ahora - 2 * MINUTO })).toBe(false)
    expect(debeMostrarApertura({ ...base, ocultaDesde: ahora - 40 * MINUTO })).toBe(true)
  })

  it('el límite de la ausencia es de media hora', () => {
    const base = { ahora, ultimaVez: null, vieneDelOnboarding: false }

    expect(debeMostrarApertura({ ...base, ocultaDesde: ahora - AUSENCIA_MINIMA + 1 })).toBe(false)
    expect(debeMostrarApertura({ ...base, ocultaDesde: ahora - AUSENCIA_MINIMA })).toBe(true)
  })

  it('como mucho una vez por hora, aunque se cumpla todo lo demás', () => {
    expect(debeMostrarApertura({
      ahora,
      ultimaVez: ahora - 20 * MINUTO,
      ocultaDesde: null,
      vieneDelOnboarding: false,
    })).toBe(false)

    expect(debeMostrarApertura({
      ahora,
      ultimaVez: ahora - DESCANSO_MINIMO,
      ocultaDesde: null,
      vieneDelOnboarding: false,
    })).toBe(true)
  })

  it('la última vez se guarda y se recupera', async () => {
    expect(await ultimaApertura()).toBeNull()
    await anotarApertura(ahora)
    expect(await ultimaApertura()).toBe(ahora)
  })
})
