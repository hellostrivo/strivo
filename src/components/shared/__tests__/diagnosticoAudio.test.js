// src/components/shared/__tests__/diagnosticoAudio.test.js
// SPEC_23C (DP-23.16 y 23.17) — El diagnóstico del audio: solo con su bandera,
// cada bandera con lo suyo, y lo que mide.

import { execFileSync } from 'child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { DIAGNOSTICO, DIAGNOSTICO_AUDIO, DIAGNOSTICO_AVISOS } from '@copy/diagnostico'
import { EN_SQLITE } from '@/lib/db/__tests__/helpers.js'
import { avisar } from '@lib/audio/observadorAudio'
import { leer } from '@lib/audio/diagnosticoAudio'

const leerArchivo = (ruta) => readFileSync(ruta, 'utf8')

/** Una frase que solo existe en el panel: «Cuadro de la pantalla de bloqueo». */
const LINEA_DEL_CUADRO = DIAGNOSTICO_AUDIO.cuadro.replace(': {estado}', '')

describe('solo con su bandera', () => {
  it('PantallaSesion y «Respira un momento» montan el panel bajo VITE_DIAG_AUDIO, perezoso', () => {
    expect(leerArchivo('src/breathing/PantallaSesion.jsx')).toMatch(
      /import\.meta\.env\.VITE_DIAG_AUDIO === '1'\s+\? lazy\(\(\) => import\('@components\/shared\/DiagnosticoAudio'\)\)\s+: null/,
    )
    expect(leerArchivo('src/components/shared/Respiracion.jsx')).toMatch(
      /import\.meta\.env\.VITE_DIAG_AUDIO === '1' \? lazy\(\(\) => import\('\.\/DiagnosticoAudio'\)\) : null/,
    )
  })

  it('nadie importa el panel ni el módulo que mide de forma estática', () => {
    ;['src/breathing/PantallaSesion.jsx', 'src/components/shared/Respiracion.jsx'].forEach(
      (ruta) => {
        expect(leerArchivo(ruta)).not.toMatch(/^import .*DiagnosticoAudio/m)
      },
    )
    expect(leerArchivo('src/lib/audio/contextoAudio.js')).toMatch(
      /if \(import\.meta\.env\.VITE_DIAG_AUDIO === '1'\) import\('\.\/diagnosticoAudio\.js'\)/,
    )
  })

  it('cada avisar() de la app va detrás de la bandera', () => {
    ;[
      'src/lib/audio/contextoAudio.js',
      'src/breathing/audio/planificador.js',
      'src/breathing/hooks/useSesionRespiracion.js',
      'src/components/shared/Respiracion.jsx',
    ].forEach((ruta) => {
      const codigo = leerArchivo(ruta)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
      const llamadas = (codigo.match(/\bavisar\(/g) ?? []).length
      expect(llamadas, ruta).toBeGreaterThan(0)
      // Cada llamada va en la misma línea que la condición, o dentro de un
      // bloque que la abre unas líneas antes.
      const lineas = codigo.split('\n')
      lineas.forEach((linea, i) => {
        if (!/\bavisar\(/.test(linea)) return
        const contexto = lineas.slice(Math.max(0, i - 3), i + 1).join('\n')
        expect(contexto, `${ruta}:${i + 1}`).toMatch(/VITE_DIAG_AUDIO === '1'/)
      })
    })
  })

  it('el copy del diagnóstico no lleva «!» ni «¡» y no vive en copy/index.js', () => {
    expect(JSON.stringify(DIAGNOSTICO_AUDIO)).not.toMatch(/[!¡]/)
    expect(leerArchivo('src/copy/index.js')).not.toMatch(/DIAGNOSTICO_AUDIO/)
  })

  /** Construye la web con las banderas dadas y devuelve el JS de `dist/`. */
  function construir(banderas) {
    const salida = mkdtempSync(join(tmpdir(), 'strivo-diag-audio-'))
    try {
      const entorno = { ...process.env, ...banderas }
      for (const nombre of ['VITE_DIAG_ALMACEN', 'VITE_DIAG_AVISOS', 'VITE_DIAG_AUDIO']) {
        if (!(nombre in banderas)) delete entorno[nombre]
      }
      execFileSync('npx', ['vite', 'build', '--outDir', salida, '--logLevel', 'error'], {
        env: entorno,
        stdio: 'pipe',
      })
      return readdirSync(join(salida, 'assets'))
        .filter((n) => n.endsWith('.js'))
        .map((n) => readFileSync(join(salida, 'assets', n), 'utf8'))
        .join('\n')
    } finally {
      rmSync(salida, { recursive: true, force: true })
    }
  }

  // Construir es lento y no depende del almacén: solo en el proyecto indexeddb.
  it.skipIf(EN_SQLITE)(
    'sin la bandera, ni una línea del diagnóstico del audio llega a dist/ (criterio 10)',
    () => {
      const todo = construir({})
      expect(todo).not.toContain(LINEA_DEL_CUADRO)
      expect(todo).not.toContain('Tipo de sesión de audio')
      expect(todo).not.toContain('reanudarEmpieza')
      expect(todo).not.toContain('strivo.diag.tipoDeAudio')
    },
    180000,
  )

  it.skipIf(EN_SQLITE)(
    'cada bandera enciende lo suyo y no arrastra los textos de las otras',
    () => {
      const audio = construir({ VITE_DIAG_AUDIO: '1' })
      expect(audio).toContain(LINEA_DEL_CUADRO)
      expect(audio).toContain('reanudarEmpieza')
      expect(audio).not.toContain(DIAGNOSTICO.simular)
      expect(audio).not.toContain('Avisos programados:')

      const avisos = construir({ VITE_DIAG_AVISOS: '1' })
      expect(avisos).toContain(DIAGNOSTICO_AVISOS.programados.replace(' {n}', ''))
      expect(avisos).not.toContain(LINEA_DEL_CUADRO)

      const almacen = construir({ VITE_DIAG_ALMACEN: '1' })
      expect(almacen).toContain(DIAGNOSTICO.simular)
      expect(almacen).not.toContain(LINEA_DEL_CUADRO)
    },
    540000,
  )
})

describe('lo que mide (sin navegador)', () => {
  function contextoDeMentira(estado = 'running') {
    const oyentes = []
    return {
      state: estado,
      currentTime: 0,
      addEventListener: (tipo, fn) => tipo === 'statechange' && oyentes.push(fn),
      cambiar(nuevo) {
        this.state = nuevo
        oyentes.forEach((fn) => fn())
      },
    }
  }

  it('apunta cada cambio de estado del contexto, con su hora', () => {
    const ctx = contextoDeMentira('suspended')
    avisar('creado', ctx)
    ctx.cambiar('running')
    ctx.cambiar('interrupted')
    const { cambios } = leer('sesion')
    expect(cambios.slice(-3).map((c) => c.estado)).toEqual(['suspended', 'running', 'interrupted'])
    expect(cambios.every((c) => typeof c.hora === 'number')).toBe(true)
  })

  it('se queda con los seis últimos cambios', () => {
    const ctx = contextoDeMentira()
    avisar('creado', ctx)
    for (let i = 0; i < 10; i += 1) ctx.cambiar(i % 2 ? 'running' : 'suspended')
    expect(leer('sesion').cambios).toHaveLength(6)
  })

  it('reanudar: resolvió, rechazó y no hizo falta', () => {
    avisar('reanudarEmpieza', { espera: 1000 })
    avisar('reanudar', { resultado: 'termino', estado: 'running' })
    expect(leer('sesion').reanudar.resultado).toBe('resolvio')
    avisar('reanudar', { resultado: 'rechazo' })
    expect(leer('sesion').reanudar.resultado).toBe('rechazo')
    avisar('reanudar', { resultado: 'noHizoFalta' })
    expect(leer('sesion').reanudar.resultado).toBe('noHizoFalta')
  })

  it('cuenta los tics del planificador', () => {
    const antes = leer('sesion').tics
    avisar('tic')
    avisar('tic')
    expect(leer('sesion').tics).toBe(antes + 2)
  })

  it('el motor y las fases programadas los publica quien suena (DP-23.28)', () => {
    const motor = { fuentesVivas: () => 2 }
    avisar('sesion', { motor: () => motor, programadas: () => ({ hasta: 12, fases: 7 }) })
    const foto = leer('sesion')
    expect(foto.motor).toBe(motor)
    expect(foto.programadas).toEqual({ hasta: 12, fases: 7 })
    expect(leer('momento').programadas).toBeNull()
  })

  it('ya no trae los experimentos de la Parte 1 (DP-23.28)', () => {
    const panel = leerArchivo('src/components/shared/DiagnosticoAudio.jsx')
    const modulo = leerArchivo('src/lib/audio/diagnosticoAudio.js')
    expect(panel).not.toMatch(/elegirTipo|reconstruir/)
    expect(modulo).not.toMatch(/export function (elegirTipo|reconstruir)/)
    expect(modulo).not.toMatch(/audioSession\.type\s*=/)
    expect(DIAGNOSTICO_AUDIO.nuevo).toBeUndefined()
  })

  it('dice si el cuadro de la pantalla de bloqueo está puesto', () => {
    expect(leer('sesion').cuadro).toBe(false)
  })

  it('sin la API de WebKit, el tipo de sesión de audio no existe', () => {
    expect(leer('sesion').tipo).toBeNull()
  })
})
