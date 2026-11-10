// src/lib/db/__tests__/diagnosticoAlmacen.test.js
// El build de diagnóstico de SPEC_17B (DP-17B.7, criterio 12).

import { execFileSync } from 'child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { openDB } from 'idb'
import { writePath } from '../local.js'
import { reiniciarAlmacenParaPruebas } from '../almacen.js'
import { fechaDeMigracion, leerDiagnostico, simularLimpieza } from '../diagnosticoAlmacen.js'
import { lineasDeDiagnostico } from '@components/perfil/DiagnosticoAlmacen'
import { DIAGNOSTICO } from '@copy/diagnostico'
import { UID, resetLocalDB } from './helpers.js'

beforeEach(resetLocalDB)
afterEach(async () => {
  vi.unstubAllGlobals()
  reiniciarAlmacenParaPruebas()
  await resetLocalDB()
})

describe('las líneas, con los textos aprobados', () => {
  const conteos = {
    indexeddb: { registros: 42, porSubir: 1 },
    sqlite: { registros: 42, porSubir: 1 },
  }

  it('migración correcta', () => {
    const lineas = lineasDeDiagnostico({
      cual: 'sqlite',
      migracion: { estado: 'correcta', fecha: '2026-11-10T18:42:00' },
      ...conteos,
    })
    expect(lineas).toEqual([
      'Almacén: SQLite',
      `Migración: correcta, ${fechaDeMigracion('2026-11-10T18:42:00')}`,
      'IndexedDB · registros: 42 · por subir: 1',
      'SQLite · registros: 42 · por subir: 1',
    ])
  })

  it('la fecha se dice «10 nov 2026, 18:42», en la hora del teléfono', () => {
    expect(fechaDeMigracion('2026-11-10T18:42:00')).toBe('10 nov 2026, 18:42')
  })

  it('nada que migrar', () => {
    const lineas = lineasDeDiagnostico({
      cual: 'sqlite',
      migracion: { estado: 'nadaQueMigrar', fecha: '2026-11-10T18:42:00' },
      indexeddb: { registros: 0, porSubir: 0 },
      sqlite: { registros: 9, porSubir: 0 },
    })
    expect(lineas.slice(1, 3)).toEqual([
      'Migración: nada que migrar',
      'IndexedDB · registros: 0 · por subir: 0',
    ])
  })

  it.each([
    ['sinAbrir', 'Migración: no terminó (SQLite no abrió)'],
    ['copia', 'Migración: no terminó (la copia se interrumpió)'],
    ['noCoincide', 'Migración: no terminó (lo copiado no coincide)'],
    ['noJson', 'Migración: no terminó (hay un valor que no es JSON)'],
    ['techo', 'Migración: no terminó (tardó más de 10 s)'],
  ])('no terminó: %s', (motivo, texto) => {
    const lineas = lineasDeDiagnostico({
      cual: 'indexeddb',
      migracion: { estado: 'noTermino', motivo },
      indexeddb: { registros: 3, porSubir: 0 },
      sqlite: null,
    })
    expect(lineas).toEqual(['Almacén: IndexedDB', texto, 'IndexedDB · registros: 3 · por subir: 0'])
  })

  it('el botón dice lo aprobado, y ningún texto usa el léxico prohibido', () => {
    expect(DIAGNOSTICO.simular).toBe('Simular que iOS limpió el almacén')
    expect(JSON.stringify(DIAGNOSTICO)).not.toMatch(/pendiente/i)
  })
})

describe('contar y simular', () => {
  it('contar en IndexedDB no crea la base si no está', async () => {
    const datos = await leerDiagnostico()
    expect(datos.indexeddb).toEqual({ registros: 0, porSubir: 0 })
    expect(datos.sqlite).toBeNull()
    expect((await indexedDB.databases()).some((b) => b.name === 'strivo')).toBe(false)
  })

  it('cuenta lo que hay en IndexedDB', async () => {
    await writePath({
      uid: UID,
      path: `users/${UID}/diario/journal/items/a`,
      collection: 'diario/journal',
      id: 'a',
      data: { text: 'a' },
    })
    expect((await leerDiagnostico()).indexeddb).toEqual({ registros: 1, porSubir: 1 })
  })

  it('la simulación borra `strivo` y las claves strivo.*, no la sesión de Firebase, y recarga', async () => {
    await writePath({
      uid: UID,
      path: `users/${UID}/shared/profile`,
      collection: 'shared',
      id: 'profile',
      data: { name: 'x' },
    })
    const firebase = await openDB('firebaseLocalStorageDb', 1, {
      upgrade: (db) => db.createObjectStore('firebaseLocalStorage'),
    })
    firebase.close()
    const datos = new Map([
      ['strivo.uid.local', 'local-1'],
      ['strivo.restaurado.x', 'y'],
      ['strivo.almacen', 'sqlite'],
      ['otra.cosa', 'se queda'],
    ])
    const almacen = {
      get length() {
        return datos.size
      },
      key: (i) => [...datos.keys()][i] ?? null,
      removeItem: (k) => datos.delete(k),
    }
    const recargar = vi.fn()

    await simularLimpieza({ almacen, recargar })

    const bases = (await indexedDB.databases()).map((b) => b.name)
    expect(bases).not.toContain('strivo')
    expect(bases).toContain('firebaseLocalStorageDb')
    expect([...datos.keys()]).toEqual(['otra.cosa'])
    expect(recargar).toHaveBeenCalledOnce()
  })
})

describe('criterio 12: sin la bandera, ni la línea ni el botón existen en lo servido', () => {
  it('Perfil solo lo importa bajo VITE_DIAG_ALMACEN, y nadie más lo importa', () => {
    const perfil = readFileSync('src/components/perfil/Perfil.jsx', 'utf8')
    expect(perfil).toMatch(
      /import\.meta\.env\.VITE_DIAG_ALMACEN === '1' \? lazy\(\(\) => import\('\.\/DiagnosticoAlmacen'\)\) : null/,
    )
    expect(perfil).not.toMatch(/^import .*DiagnosticoAlmacen/m)
    expect(readFileSync('src/copy/index.js', 'utf8')).not.toMatch(/diagnostico/)
  })

  it('construido sin la bandera, ningún texto del diagnóstico llega a dist/', () => {
    const salida = mkdtempSync(join(tmpdir(), 'strivo-sin-diag-'))
    try {
      const entorno = { ...process.env }
      delete entorno.VITE_DIAG_ALMACEN
      execFileSync('npx', ['vite', 'build', '--outDir', salida, '--logLevel', 'error'], {
        env: entorno,
        stdio: 'pipe',
      })
      const js = readdirSync(join(salida, 'assets'))
        .filter((n) => n.endsWith('.js'))
        .map((n) => readFileSync(join(salida, 'assets', n), 'utf8'))
        .join('\n')
      expect(js).toMatch(/Dónde vive lo que escribes/) // el bloque sí está
      expect(js).not.toContain(DIAGNOSTICO.simular)
      expect(js).not.toContain('por subir:')
      expect(js).not.toContain('Migración:')
    } finally {
      rmSync(salida, { recursive: true, force: true })
    }
  }, 180000)
})
