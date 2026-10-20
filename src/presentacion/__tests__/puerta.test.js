// src/presentacion/__tests__/puerta.test.js
// La puerta se relee cuando termina una restauración (SPEC_19.1 §4.3;
// criterio 10). La regla es `aplicarLecturaDePuerta`; de `Entrada` se
// comprueba la fuente, porque no hay DOM en el que montarla.

import { readFileSync } from 'fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as shared from '@/lib/db/shared'
import { claveDeMudanzaPendiente } from '@/lib/db/local'
import { resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { aplicarLecturaDePuerta, leerPuerta } from '../entrada.js'

const base = { presentacionResuelta: false }

describe('criterio 10: la relectura por el sello solo saca del onboarding', () => {
  it('dentro del onboarding y la puerta ya no está pendiente: sale', () => {
    expect(
      aplicarLecturaDePuerta({
        ...base,
        porSello: true,
        enOnboarding: true,
        onboarding: false,
        presentacion: false,
      }),
    ).toEqual({ pendiente: false, presentando: false })
  })

  it('y qué viene después lo decide presentacionPendiente (D7)', () => {
    expect(
      aplicarLecturaDePuerta({
        ...base,
        porSello: true,
        enOnboarding: true,
        onboarding: false,
        presentacion: true,
      }),
    ).toEqual({ pendiente: false, presentando: true })
  })

  it('dentro del onboarding y sigue pendiente: nada cambia', () => {
    expect(
      aplicarLecturaDePuerta({
        ...base,
        porSello: true,
        enOnboarding: true,
        onboarding: true,
        presentacion: false,
      }),
    ).toBeNull()
  })

  it('fuera del onboarding: nada visible cambia, diga lo que diga la lectura', () => {
    ;[true, false].forEach((onboarding) =>
      expect(
        aplicarLecturaDePuerta({
          ...base,
          porSello: true,
          enOnboarding: false,
          onboarding,
          presentacion: true,
        }),
      ).toBeNull(),
    )
  })

  it('una presentación ya cerrada en esta sesión no se reabre', () => {
    expect(
      aplicarLecturaDePuerta({
        porSello: true,
        enOnboarding: true,
        onboarding: false,
        presentacion: true,
        presentacionResuelta: true,
      }),
    ).toEqual({ pendiente: false })
  })
})

describe('la lectura del arranque o de un uid nuevo se aplica entera, como siempre', () => {
  it('onboarding pendiente: al onboarding, sin presentación', () => {
    expect(
      aplicarLecturaDePuerta({ ...base, porSello: false, onboarding: true, presentacion: true }),
    ).toEqual({ pendiente: true, presentando: false })
  })

  it('onboarding hecho y presentación pendiente: la presentación', () => {
    expect(
      aplicarLecturaDePuerta({ ...base, porSello: false, onboarding: false, presentacion: true }),
    ).toEqual({ pendiente: false, presentando: true })
  })
})

describe('Entrada usa la regla y relee con el sello', () => {
  const app = readFileSync('src/App.jsx', 'utf8')

  it('el efecto de la puerta depende del uid y del sello', () => {
    expect(app).toMatch(/\}, \[uid, selloRestauracion\]\)/)
    expect(app).toMatch(/useSesion\(\)/)
  })

  it('decide con aplicarLecturaDePuerta y no con una copia', () => {
    expect(app).toMatch(/aplicarLecturaDePuerta\(\{/)
  })

  it('presentacionResuelta sigue protegiendo la presentación ya vista', () => {
    expect(app).toMatch(/presentacionResuelta: presentacionResuelta\.current/)
  })
})

describe('F2: con la mudanza pendiente, la puerta se lee en el árbol de origen', () => {
  const CUENTA = 'AbC123firebaseUid'
  const ORIGEN = 'local-3f2a'
  const HECHO = '2026-09-01T10:00:00.000Z'

  function localStorageDeMentira() {
    const m = new Map()
    return {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => m.set(k, String(v)),
      removeItem: (k) => m.delete(k),
    }
  }

  beforeEach(async () => {
    vi.stubGlobal('localStorage', localStorageDeMentira())
    await resetLocalDB()
    // La cuenta, como queda tras una entrada aplazada: la semilla.
    await shared.initShared(CUENTA)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('origen con completedAt: ni onboarding ni presentación', async () => {
    await shared.initShared(ORIGEN, {
      onboarding: { version: 3, completedAt: HECHO, tourCompletedAt: HECHO },
    })
    localStorage.setItem(claveDeMudanzaPendiente(CUENTA), ORIGEN)

    expect(await leerPuerta(CUENTA)).toEqual([false, false])
    // La semilla de la cuenta, leída a secas, habría mandado al onboarding.
    expect(await shared.onboardingPendiente(CUENTA)).toBe(true)
  })

  it('origen sin completedAt: el onboarding se muestra, igual que sin cuenta', async () => {
    await shared.initShared(ORIGEN)
    localStorage.setItem(claveDeMudanzaPendiente(CUENTA), ORIGEN)
    expect(await leerPuerta(CUENTA)).toEqual([true, false])
  })

  it('mudanza completada (clave retirada): la puerta se lee contra la cuenta', async () => {
    await shared.initShared(ORIGEN, {
      onboarding: { version: 3, completedAt: HECHO, tourCompletedAt: HECHO },
    })
    localStorage.setItem(claveDeMudanzaPendiente(CUENTA), ORIGEN)
    expect(await leerPuerta(CUENTA)).toEqual([false, false])

    localStorage.removeItem(claveDeMudanzaPendiente(CUENTA))
    expect(await leerPuerta(CUENTA)).toEqual([true, false])
  })

  it('si el origen ya no tiene expediente, se lee la cuenta', async () => {
    localStorage.setItem(claveDeMudanzaPendiente(CUENTA), 'local-que-ya-no-esta')
    expect(await leerPuerta(CUENTA)).toEqual([true, false])
  })

  it('sin mudanza pendiente, es la lectura de siempre', async () => {
    await shared.updateOnboarding(CUENTA, { completedAt: HECHO, version: 3 })
    expect(await leerPuerta(CUENTA)).toEqual([false, true])
  })

  it('Entrada lee la puerta con leerPuerta y no con una copia', () => {
    const app = readFileSync('src/App.jsx', 'utf8')
    expect(app).toMatch(/leerPuerta\(uid\)/)
    expect(app).not.toMatch(/mudanzaPendiente/)
  })
})
