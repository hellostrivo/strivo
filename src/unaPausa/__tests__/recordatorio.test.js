// SPEC_28.2 §4.7 y criterio 12 — el recordatorio del miércoles, y los dos
// workflows que quedan inertes hasta la fusión (DP-28.17). DP-28.23: también
// hace falta cuando el canal del lunes no se podría construir.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import { enEstado, programada, reserva } from '../modelo/__tests__/capsulas.js'
import { webp } from '../modelo/__tests__/webp.js'
import { CAPSULAS, PORTADAS } from '../../../scripts/publicar-pausa.js'
import { recordatorio } from '../../../scripts/recordatorio-pausa.js'

const carpetas = []
afterAll(() => {
  for (const carpeta of carpetas) rmSync(carpeta, { recursive: true, force: true })
})

/**
 * Un repo de mentira. Las cápsulas se guardan como `<id>.json`, o como
 * `[nombre, contenido]` para escribir un archivo a mano. Trae `espacio.webp`,
 * la portada de las cápsulas de ejemplo.
 */
function repo(capsulas) {
  const raiz = mkdtempSync(join(tmpdir(), 'una-pausa-recordatorio-'))
  carpetas.push(raiz)
  mkdirSync(join(raiz, CAPSULAS), { recursive: true })
  mkdirSync(join(raiz, PORTADAS), { recursive: true })
  writeFileSync(join(raiz, PORTADAS, 'espacio.webp'), webp('VP8 ', 1600, 1200))
  for (const c of capsulas) {
    const [nombre, contenido] = Array.isArray(c) ? c : [`${c.id}.json`, JSON.stringify(c)]
    writeFileSync(join(raiz, CAPSULAS, nombre), contenido)
  }
  return raiz
}

// Miércoles 9 dic, 09:00 en Monterrey: el lunes que viene es el 14.
const MIERCOLES = '2026-12-09T09:00:00-06:00'
const TITULO = 'Una pausa: revisar el lunes 2026-12-14'
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
    expect(r.cuerpo).toContain(
      '- contenido/una-pausa/capsulas/c-2026-12-14.json · title · lexico.exclamacion — sin signos de exclamación.',
    )
    expect(r.cuerpo).toContain('con eso resuelto, ese lunes se repite «c-2026-12-07»')
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
    expect(mirar([], '2026-12-14T00:00:00-06:00').titulo).toBe(
      'Una pausa: revisar el lunes 2026-12-21',
    )
  })

  it('sin exclamaciones', () => {
    const r = mirar([programada('2026-12-07'), reserva('r', '2026-11-01')])
    expect(`${r.titulo}${r.cuerpo}`).not.toMatch(/[¡!]/)
  })
})

describe('DP-28.23: el canal del lunes tiene que poder construirse', () => {
  const LISTAS = [programada('2026-12-07'), programada('2026-12-14')]
  const NO_SE_CONSTRUYE = 'El lunes 2026-12-14 el canal no se podría construir'

  it('criterio 1: programada válida y un archivo con JSON roto → hace falta, nombrando archivo y código', () => {
    const r = mirar([...LISTAS, ['roto.json', '{ "id": ']])
    expect(r.hace_falta).toBe(true)
    expect(r.titulo).toBe(TITULO)
    expect(r.cuerpo).toContain(NO_SE_CONSTRUYE)
    expect(r.cuerpo).toContain('seguiría la cápsula de la semana anterior')
    expect(r.cuerpo).toContain('- contenido/una-pausa/capsulas/roto.json · archivo.json — ')
  })

  it('un archivo mal nombrado también', () => {
    const r = mirar([...LISTAS, ['x.json', JSON.stringify({ id: 'y', status: 'borrador' })]])
    expect(r.hace_falta).toBe(true)
    expect(r.cuerpo).toContain('x.json · id · archivo.nombre')
  })

  it('criterio 2: programada válida y otra aprobada con «terapia» → hace falta, con lexico.terapia', () => {
    const aprobada = enEstado(
      programada('2026-12-21', { keyFindings: ['Esto no sustituye una terapia.'] }),
      'aprobada',
    )
    const r = mirar([...LISTAS, aprobada])
    expect(r.hace_falta).toBe(true)
    expect(r.cuerpo).toContain(
      '- contenido/una-pausa/capsulas/c-2026-12-21.json · keyFindings[0] · lexico.terapia — «terapia» no se usa en una cápsula.',
    )
  })

  it('criterio 3: programada válida cuya portada no está → hace falta, con portada.archivo', () => {
    const sinPortada = programada('2026-12-14', { coverAsset: 'no-esta.webp' })
    const r = mirar([programada('2026-12-07'), sinPortada])
    expect(r.hace_falta).toBe(true)
    expect(r.cuerpo).toContain(NO_SE_CONSTRUYE)
    expect(r.cuerpo).toContain('c-2026-12-14.json · coverAsset · portada.archivo')
    // La programada pasa el validador: el lunes no le falta cápsula, le falta canal.
    expect(r.cuerpo).not.toContain('no tiene una cápsula `programada` válida')
  })

  it('un choque en el conjunto también', () => {
    const r = mirar([...LISTAS, programada('2026-12-14', { id: 'otra' })])
    expect(r.hace_falta).toBe(true)
    expect(r.cuerpo).toContain('conjunto.choque')
  })

  it('criterio 4: programada válida y un borrador con faltas → no hace falta', () => {
    const borrador = { id: 'a-medias', status: 'borrador', title: 'Calma!' }
    expect(mirar([...LISTAS, borrador]).hace_falta).toBe(false)
  })

  it('criterio 5: programada válida y nada roto → no hace falta', () => {
    const r = mirar(LISTAS)
    expect(r.hace_falta).toBe(false)
    expect(r.titulo).toBe(TITULO)
  })

  it('sin programada y con algo roto, dice las dos cosas', () => {
    const r = mirar([programada('2026-12-07'), ['roto.json', 'no']])
    expect(r.cuerpo).toContain(NO_SE_CONSTRUYE)
    expect(r.cuerpo).toContain('no tiene una cápsula `programada` válida')
    expect(r.cuerpo).toContain('con eso resuelto, ese lunes se repite «c-2026-12-07»')
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
