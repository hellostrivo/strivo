// src/components/perfil/__tests__/diagnosticoAvisos.test.js
// SPEC_22 — El build de diagnóstico de los avisos (DP-22.12, criterios 10 y 12).

import { execFileSync } from 'child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { DIAGNOSTICO, DIAGNOSTICO_AVISOS } from '@copy/diagnostico'
import { EN_SQLITE } from '@/lib/db/__tests__/helpers.js'
import { cuandoDe, lineasDeAvisos } from '../DiagnosticoAvisos.jsx'

describe('las líneas', () => {
  it('permiso, cuántos, el próximo de cada momento y la zona, en ese orden', () => {
    const lineas = lineasDeAvisos({
      permiso: 'concedido',
      programados: 27,
      proximos: { manana: new Date(2026, 10, 12, 7, 0), noche: new Date(2026, 10, 11, 23, 0) },
      zona: 'America/Monterrey',
    })
    expect(lineas).toEqual([
      'Permiso del teléfono: concedido',
      'Avisos programados: 27',
      'Próximo de la mañana: jue 12 nov, 07:00',
      'Próximo de la noche: mié 11 nov, 23:00',
      'Zona horaria: America/Monterrey',
    ])
  })

  it('sin permiso y sin nada programado', () => {
    const lineas = lineasDeAvisos({
      permiso: 'sin_pedir',
      programados: 0,
      proximos: { manana: null, noche: null },
      zona: 'America/Bogota',
    })
    expect(lineas).toEqual([
      'Permiso del teléfono: sin pedir',
      'Avisos programados: 0',
      'Próximo de la mañana: ninguno',
      'Próximo de la noche: ninguno',
      'Zona horaria: America/Bogota',
    ])
  })

  it('denegado se dice denegado', () => {
    expect(lineasDeAvisos({ permiso: 'denegado', programados: 0, proximos: {}, zona: '' })[0]).toBe(
      'Permiso del teléfono: denegado',
    )
  })

  it('la fecha, «mié 11 nov, 07:00»', () => {
    expect(cuandoDe(new Date(2026, 10, 11, 7, 0))).toBe('mié 11 nov, 07:00')
    expect(cuandoDe(null)).toBe('ninguno')
  })
})

describe('solo con su bandera', () => {
  const bloque = readFileSync('src/components/perfil/TusRecordatorios.jsx', 'utf8')

  it('el bloque lo importa bajo VITE_DIAG_AVISOS y nadie más lo importa', () => {
    expect(bloque).toMatch(
      /import\.meta\.env\.VITE_DIAG_AVISOS === '1' \? lazy\(\(\) => import\('\.\/DiagnosticoAvisos'\)\) : null/,
    )
    expect(bloque).not.toMatch(/^import .*DiagnosticoAvisos/m)
  })

  /** Construye la web con las banderas dadas y devuelve el JS de `dist/`. */
  function construir(banderas) {
    const salida = mkdtempSync(join(tmpdir(), 'strivo-diag-avisos-'))
    try {
      const entorno = { ...process.env, ...banderas }
      for (const nombre of ['VITE_DIAG_ALMACEN', 'VITE_DIAG_AVISOS', 'VITE_DIAG_AUDIO']) {
        if (!(nombre in banderas)) delete entorno[nombre]
      }
      execFileSync('npx', ['vite', 'build', '--outDir', salida, '--logLevel', 'error'], {
        env: entorno,
        stdio: 'pipe',
      })
      const archivos = readdirSync(join(salida, 'assets')).filter((n) => n.endsWith('.js'))
      const js = archivos.map((n) => readFileSync(join(salida, 'assets', n), 'utf8'))
      const principal = archivos
        .map((n, i) => ({ n, js: js[i] }))
        .sort((a, b) => b.js.length - a.js.length)[0].js
      return { todo: js.join('\n'), principal }
    } finally {
      rmSync(salida, { recursive: true, force: true })
    }
  }

  // Construir es lento y no depende del almacén: solo en el proyecto indexeddb.
  it.skipIf(EN_SQLITE)(
    'sin la bandera, ningún texto del diagnóstico de avisos llega a dist/, ni el plugin al chunk principal',
    () => {
      const { todo, principal } = construir({})
      expect(todo).toMatch(/Recibir recordatorios/) // el bloque sí está
      expect(todo).not.toContain('Permiso del teléfono:')
      expect(todo).not.toContain('Avisos programados:')
      expect(todo).not.toContain('Zona horaria:')
      // El plugin se registra con su nombre en su propio chunk, no en el principal.
      expect(principal).not.toMatch(/\(\s*"LocalNotifications"\s*,/)
    },
    180000,
  )

  it.skipIf(EN_SQLITE)(
    'cada bandera enciende lo suyo y no arrastra los textos de la otra',
    () => {
      const avisos = construir({ VITE_DIAG_AVISOS: '1' }).todo
      expect(avisos).toContain(DIAGNOSTICO_AVISOS.programados.replace(' {n}', ''))
      expect(avisos).not.toContain(DIAGNOSTICO.simular)
      expect(avisos).not.toContain('Migración:')

      const almacen = construir({ VITE_DIAG_ALMACEN: '1' }).todo
      expect(almacen).toContain(DIAGNOSTICO.simular)
      expect(almacen).not.toContain('Avisos programados:')
      expect(almacen).not.toContain('Permiso del teléfono:')
    },
    360000,
  )
})
