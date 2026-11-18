// SPEC_24 — El build de diagnóstico del borrado (DP-24.20, criterio 17).

import { execFileSync } from 'child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'

import { DIAGNOSTICO, DIAGNOSTICO_AVISOS, DIAGNOSTICO_BORRADO as t } from '@copy/diagnostico'
import { EN_SQLITE, UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { leerTodoDelUid, listQueue } from '@/lib/db/local'
import { lineasDelBorrado, sembrarDias } from '../DiagnosticoBorrado.jsx'

beforeEach(async () => {
  await resetLocalDB()
})

describe('las líneas', () => {
  it('fase, marca, nube y Apple, en ese orden', () => {
    expect(
      lineasDelBorrado(
        { fase: 'nube', encontrados: 612, borrados: 500, lotes: 1, apple: 'revocado' },
        true,
      ),
    ).toEqual([
      'Borrado: borrando la nube',
      'Marca de borrado: sí',
      'Nube: 612 encontrados · 500 borrados · lotes 1',
      'Apple: revocado',
    ])
  })

  it('sin empezar, sin marca y sin Apple', () => {
    expect(
      lineasDelBorrado(
        { fase: 'sinEmpezar', encontrados: 0, borrados: 0, lotes: 0, apple: 'noAplica' },
        false,
      ),
    ).toEqual([
      'Borrado: sin empezar',
      'Marca de borrado: no',
      'Nube: 0 encontrados · 0 borrados · lotes 0',
      'Apple: no aplica',
    ])
  })

  it('detenido y falló se dicen así', () => {
    const [fase, , , apple] = lineasDelBorrado(
      { fase: 'detenido', encontrados: 0, borrados: 0, lotes: 0, apple: 'fallo' },
      true,
    )
    expect(fase).toBe('Borrado: detenido')
    expect(apple).toBe('Apple: falló')
  })
})

describe('sembrar días de prueba', () => {
  it('300 días con mañana y noche son 600 documentos, encolados para subir', async () => {
    const n = await sembrarDias(UID, { hoy: new Date(2026, 10, 15) })
    expect(n).toBe(600)
    expect(await leerTodoDelUid(UID)).toHaveLength(600)
    expect(await listQueue(UID)).toHaveLength(600)
  })
})

describe('solo con su bandera', () => {
  it('Perfil lo importa bajo VITE_DIAG_BORRADO y nadie más lo importa', () => {
    const perfil = readFileSync('src/components/perfil/Perfil.jsx', 'utf8')
    expect(perfil).toMatch(
      /import\.meta\.env\.VITE_DIAG_BORRADO === '1' \? lazy\(\(\) => import\('\.\/DiagnosticoBorrado'\)\) : null/,
    )
    expect(perfil).not.toMatch(/^import .*DiagnosticoBorrado/m)
  })

  /** Construye la web con las banderas dadas y devuelve el JS de `dist/`. */
  function construir(banderas) {
    const salida = mkdtempSync(join(tmpdir(), 'strivo-diag-borrado-'))
    try {
      const entorno = { ...process.env, ...banderas }
      for (const nombre of [
        'VITE_DIAG_ALMACEN',
        'VITE_DIAG_AVISOS',
        'VITE_DIAG_AUDIO',
        'VITE_DIAG_BORRADO',
      ]) {
        if (!(nombre in banderas)) delete entorno[nombre]
      }
      execFileSync('npx', ['vite', 'build', '--outDir', salida, '--logLevel', 'error'], {
        env: entorno,
        stdio: 'pipe',
      })
      const archivos = readdirSync(join(salida, 'assets')).filter((n) => n.endsWith('.js'))
      return archivos.map((n) => readFileSync(join(salida, 'assets', n), 'utf8')).join('\n')
    } finally {
      rmSync(salida, { recursive: true, force: true })
    }
  }

  it.skipIf(EN_SQLITE)(
    'sin la bandera, ni una línea suya llega a dist/',
    () => {
      const todo = construir({})
      expect(todo).toContain('Llevarme lo que escribí') // el bloque sí está
      expect(todo).not.toContain(t.sembrar)
      expect(todo).not.toContain(t.fallarAntes)
      expect(todo).not.toContain('Marca de borrado:')
      expect(todo).not.toContain(t.desplegar)
    },
    180000,
  )

  it.skipIf(EN_SQLITE)(
    'con su bandera enciende lo suyo y no arrastra los textos de las otras',
    () => {
      const borrado = construir({ VITE_DIAG_BORRADO: '1' })
      expect(borrado).toContain(t.sembrar)
      expect(borrado).toContain(t.detenerDespues)
      expect(borrado).not.toContain(DIAGNOSTICO.simular)
      expect(borrado).not.toContain(DIAGNOSTICO_AVISOS.programados.replace(' {n}', ''))
    },
    180000,
  )
})
