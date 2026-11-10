// src/lib/__tests__/primeraBajada.test.js
// SPEC_31, DP-31.5 — la primera bajada se reintenta sola una vez, dentro del
// mismo techo, solo si falló como `interrumpida` y quedan al menos
// `MARGEN_PARA_REINTENTAR_MS`.

import { describe, expect, it, vi } from 'vitest'

import { MOTIVOS } from '@lib/db/restaurar'
import { MARGEN_PARA_REINTENTAR_MS, restaurarConUnReintento } from '../sesion.js'

const OK = { ok: true, escritos: 1, fusionados: 0 }
const INTERRUMPIDA = { ok: false, motivo: MOTIVOS.interrumpida, escritos: 0, fusionados: 0 }

/** Un `restaurar` de mentira que devuelve, en orden, lo que se le dé. */
function bajadas(...resultados) {
  const llamadas = []
  const correr = async (uid) => {
    llamadas.push(uid)
    return resultados[Math.min(llamadas.length - 1, resultados.length - 1)]
  }
  return { correr, llamadas }
}

/** Un reloj que avanza `pasoMs` cada vez que se le pregunta. */
function reloj(pasoMs) {
  let t = 0
  return () => {
    const ahora = t
    t += pasoMs
    return ahora
  }
}

describe('restaurarConUnReintento (DP-31.5)', () => {
  it('si la primera termina bien, no se repite', async () => {
    const { correr, llamadas } = bajadas(OK)
    expect(await restaurarConUnReintento('u', 15000, { correr })).toEqual(OK)
    expect(llamadas).toHaveLength(1)
  })

  it('interrumpida con tiempo de sobra: un reintento, y vale lo que diga el segundo', async () => {
    const { correr, llamadas } = bajadas(INTERRUMPIDA, OK)
    expect(await restaurarConUnReintento('u', 15000, { correr })).toEqual(OK)
    expect(llamadas).toEqual(['u', 'u'])
  })

  it('un solo reintento: si el segundo también falla, se devuelve ese fallo', async () => {
    const { correr, llamadas } = bajadas(INTERRUMPIDA, INTERRUMPIDA, OK)
    expect(await restaurarConUnReintento('u', 15000, { correr })).toEqual(INTERRUMPIDA)
    expect(llamadas).toHaveLength(2)
  })

  it('con otro motivo no se repite: sin red o sin configuración, repetir no arregla nada', async () => {
    for (const motivo of [MOTIVOS.sinRed, MOTIVOS.sinConfiguracion]) {
      const { correr, llamadas } = bajadas({ ok: false, motivo }, OK)
      expect((await restaurarConUnReintento('u', 15000, { correr })).motivo).toBe(motivo)
      expect(llamadas).toHaveLength(1)
    }
  })

  it('con menos del margen por delante, no se repite', async () => {
    // El primer intento "tarda" 12,5 s de un techo de 15: quedan 2,5.
    const { correr, llamadas } = bajadas(INTERRUMPIDA, OK)
    const ahora = reloj(12500)
    expect(await restaurarConUnReintento('u', 15000, { correr, ahora })).toEqual(INTERRUMPIDA)
    expect(llamadas).toHaveLength(1)
  })

  it('con el margen justo, sí', async () => {
    const { correr, llamadas } = bajadas(INTERRUMPIDA, OK)
    const ahora = reloj(15000 - MARGEN_PARA_REINTENTAR_MS)
    expect(await restaurarConUnReintento('u', 15000, { correr, ahora })).toEqual(OK)
    expect(llamadas).toHaveLength(2)
  })

  it('el techo cubre los dos intentos: si el segundo no contesta, vuelve null al techo', async () => {
    vi.useFakeTimers()
    try {
      let llamadas = 0
      const correr = async () => {
        llamadas += 1
        if (llamadas === 1) return INTERRUMPIDA
        return new Promise(() => {})
      }
      let resultado
      const espera = restaurarConUnReintento('u', 15000, { correr, ahora: () => 0 }).then(
        (r) => (resultado = r),
      )
      await vi.advanceTimersByTimeAsync(14999)
      expect(resultado).toBeUndefined()
      await vi.advanceTimersByTimeAsync(1)
      await espera
      expect(resultado).toBeNull()
      expect(llamadas).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('el margen es de tres segundos', () => {
    expect(MARGEN_PARA_REINTENTAR_MS).toBe(3000)
  })
})
