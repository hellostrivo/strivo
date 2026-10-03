// SPEC_28.2 §4.7 y criterio 12 — el recordatorio del miércoles, y los dos
// workflows que quedan inertes hasta la fusión (DP-28.17).
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import { enEstado, programada, reserva } from '../modelo/__tests__/capsulas.js'
import { CAPSULAS } from '../../../scripts/publicar-pausa.js'
import { recordatorio } from '../../../scripts/recordatorio-pausa.js'

const carpetas = []
afterAll(() => {
  for (const carpeta of carpetas) rmSync(carpeta, { recursive: true, force: true })
})

function repo(capsulas) {
  const raiz = mkdtempSync(join(tmpdir(), 'una-pausa-recordatorio-'))
  carpetas.push(raiz)
  mkdirSync(join(raiz, CAPSULAS), { recursive: true })
  for (const c of capsulas) writeFileSync(join(raiz, CAPSULAS, `${c.id}.json`), JSON.stringify(c))
  return raiz
}

// Miércoles 9 dic, 09:00 en Monterrey: el lunes que viene es el 14.
const MIERCOLES = '2026-12-09T09:00:00-06:00'
const TITULO = 'Una pausa: sin cápsula programada para el lunes 2026-12-14'
const mirar = (capsulas, ahora = MIERCOLES) => recordatorio({ raiz: repo(capsulas), ahora })

describe('criterio 12', () => {
  it('con una programada válida para el lunes siguiente, no hace falta', () => {
    const r = mirar([programada('2026-12-07'), programada('2026-12-14')])
    expect(r.hace_falta).toBe(false)
    expect(r.cuerpo).toContain('«c-2026-12-14»')
  })

  it('sin ella, con una reserva libre: nombra la reserva', () => {
    const r = mirar([programada('2026-12-07'), reserva('pequenas-pausas', '2026-11-01')])
    expect(r.hace_falta).toBe(true)
    expect(r.titulo).toBe(TITULO)
    expect(r.cuerpo).toContain('entra la reserva «pequenas-pausas»')
  })

  it('sin reserva libre: nombra la que se repetirá', () => {
    const r = mirar([programada('2026-12-07')])
    expect(r.hace_falta).toBe(true)
    expect(r.cuerpo).toContain('se repite «c-2026-12-07»')
  })

  it('sin nada: lo dice', () => {
    const r = mirar([])
    expect(r.hace_falta).toBe(true)
    expect(r.titulo).toBe(TITULO)
    expect(r.cuerpo).toContain('no habrá ninguna cápsula')
  })

  it('DP-28.20, abierta: antes de la primera programada, una reserva no cubre nada', () => {
    const r = mirar([reserva('pequenas-pausas', '2026-11-01')])
    expect(r.cuerpo).toContain('no habrá ninguna cápsula')
  })
})

describe('lo que el issue dice además', () => {
  it('una programada para ese lunes que no pasa el validador no cuenta, y se nombra', () => {
    const r = mirar([programada('2026-12-07'), programada('2026-12-14', { title: 'Calma!' })])
    expect(r.hace_falta).toBe(true)
    expect(r.cuerpo).toContain('«c-2026-12-14», pero no pasa el validador')
    expect(r.cuerpo).toContain('se repite «c-2026-12-07»')
  })

  it('ni la piloto ni una aprobada sin programar cuentan', () => {
    const piloto = programada('2026-12-14', { id: 'piloto', piloto: true })
    const aprobada = enEstado(programada('2026-12-14', { id: 'lista' }), 'aprobada')
    expect(mirar([piloto, aprobada]).hace_falta).toBe(true)
  })

  it('dice cuándo cierra la validación final de esa semana: el miércoles, en Monterrey', () => {
    expect(mirar([]).cuerpo).toContain('cierra el 2026-12-09 a las 23:59:59 de Monterrey')
  })

  it('el título es el mismo en todos los casos de la misma semana, y lleva la fecha', () => {
    const titulos = [
      mirar([]),
      mirar([programada('2026-12-07')]),
      mirar([programada('2026-12-07'), reserva('r', '2026-11-01')]),
    ].map((r) => r.titulo)
    expect(new Set(titulos)).toEqual(new Set([TITULO]))
  })

  it('el lunes siguiente se cuenta en Monterrey: el domingo a las 23:59 aún mira al 14', () => {
    expect(mirar([], '2026-12-13T23:59:59-06:00').titulo).toBe(TITULO)
    expect(mirar([], '2026-12-14T00:00:00-06:00').titulo).toContain('2026-12-21')
  })

  it('sin exclamaciones', () => {
    const r = mirar([programada('2026-12-07'), reserva('r', '2026-11-01')])
    expect(`${r.titulo}${r.cuerpo}`).not.toMatch(/[¡!]/)
  })
})

describe('los workflows, inertes hasta la fusión (DP-28.17)', () => {
  const leer = (nombre) => readFileSync(`.github/workflows/${nombre}`, 'utf8')

  it('el del lunes: 06:05 UTC, a mano, y el build hook del secreto', () => {
    const yml = leer('publicar-pausa.yml')
    expect(yml).toContain("- cron: '5 6 * * 1'")
    expect(yml).toContain('workflow_dispatch:')
    expect(yml).toContain('${{ secrets.NETLIFY_BUILD_HOOK_CANAL }}')
    expect(yml).toMatch(/if \[ -z "\$BUILD_HOOK" \]; then\n\s+echo "::error::Falta el secreto/)
  })

  it('el del miércoles: 15:00 UTC, issues y lectura, Node 20 y sin instalar nada', () => {
    const yml = leer('recordatorio-pausa.yml')
    expect(yml).toContain("- cron: '0 15 * * 3'")
    expect(yml).toContain('workflow_dispatch:')
    expect(yml).toMatch(/permissions:\n\s+issues: write\n\s+contents: read/)
    expect(yml).toContain("node-version: '20'")
    expect(yml).toContain('node scripts/recordatorio-pausa.js')
    expect(yml).not.toMatch(/npm (ci|install)/)
    expect(yml).toContain('gh issue create')
  })
})
