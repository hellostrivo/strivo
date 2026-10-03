// Criterio 1, con la zona del proceso cambiada. La variable se fija **antes** de
// importar el módulo, y el módulo se vuelve a importar para cada zona: si algo
// leyera la hora local al cargarse, aquí se notaría.
//
// Esta máquina vive en America/Monterrey, que es justo donde un error así no se
// vería. Por eso cada caso comprueba primero que la zona cambió de verdad.
import { afterAll, describe, expect, it, vi } from 'vitest'

const ZONAS = ['UTC', 'Asia/Tokyo', 'Pacific/Kiritimati']

afterAll(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe.each(ZONAS)('con TZ=%s', (zona) => {
  it('el proceso está de verdad en esa zona', () => {
    vi.stubEnv('TZ', zona)
    const local = new Intl.DateTimeFormat().resolvedOptions().timeZone
    expect(local === zona || (zona === 'UTC' && /^(UTC|Etc\/UTC)$/.test(local))).toBe(true)
  })

  it('lunesDe da lo mismo que en Monterrey', async () => {
    vi.stubEnv('TZ', zona)
    vi.resetModules()
    const { lunesDe, limiteValidacionFinal, fechaEnZona } = await import('../semana.js')
    expect(lunesDe('2026-10-11T23:59:59-06:00')).toBe('2026-10-05')
    expect(lunesDe('2026-10-12T00:00:00-06:00')).toBe('2026-10-12')
    expect(fechaEnZona('2026-10-12T05:59:59Z')).toBe('2026-10-11')
    expect(new Date(limiteValidacionFinal('2026-12-07')).toISOString()).toBe(
      '2026-12-03T05:59:59.999Z',
    )
  })

  it('el plazo de validación final da lo mismo que en Monterrey', async () => {
    vi.stubEnv('TZ', zona)
    vi.resetModules()
    const { validar } = await import('../validar.js')
    const { programada, enEstado } = await import('./capsulas.js')
    const base = enEstado(programada('2026-12-07'), 'aprobada')
    const codigos = (c) => validar(c).faltas.map((f) => f.codigo)
    expect(codigos({ ...base, approvedAt: '2026-12-02T23:59:59-06:00' })).toEqual([])
    expect(codigos({ ...base, approvedAt: '2026-12-03T00:00:00-06:00' })).toEqual([
      'plazo.validacion-final',
    ])
  })
})
