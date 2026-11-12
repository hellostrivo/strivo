// src/lib/__tests__/nativoSpec23.test.js
// SPEC_23A y 23B — Lo nativo: los dos plugins, el iPhone y lo que la web no
// descarga (criterios 9 y 11), y la pantalla del PIN con Face ID.
//
// Vive aparte de `appIos.test.js` a propósito: ese archivo lo toca también
// D-21.11, y dos tareas en paralelo sobre el mismo archivo son un conflicto
// asegurado.

import { execFileSync } from 'child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { EN_SQLITE } from '@/lib/db/__tests__/helpers.js'

const leer = (ruta) => readFileSync(ruta, 'utf8')

const PLUGINS = Object.freeze({
  '@capacitor/haptics': { version: '8.0.2', puente: 'src/lib/haptica.js', spm: 'CapacitorHaptics' },
  '@capgo/capacitor-native-biometric': {
    version: '8.9.3',
    puente: 'src/lib/biometria.js',
    spm: 'CapgoCapacitorNativeBiometric',
  },
})

function fuentes(dir = 'src') {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : fuentes(ruta)
    return /\.jsx?$/.test(nombre) ? [ruta] : []
  })
}

describe('los dos plugins, en versión exacta y por SPM', () => {
  const paquete = JSON.parse(leer('package.json'))
  const swift = leer('ios/App/CapApp-SPM/Package.swift')

  for (const [nombre, { version, spm }] of Object.entries(PLUGINS)) {
    it(`${nombre} ${version}, sin rango`, () => {
      expect(paquete.dependencies[nombre]).toBe(version)
    })

    it(`${nombre} entra por SPM desde node_modules, sin packageOptions`, () => {
      expect(swift).toContain(`.package(name: "${spm}", path: "../../../node_modules/${nombre}")`)
      expect(swift).toContain(`.product(name: "${spm}", package: "${spm}")`)
    })
  }

  it('capacitor.config.json no gana configuración para ninguno', () => {
    const config = leer('capacitor.config.json')
    expect(config).not.toMatch(/Haptics|NativeBiometric/)
  })
})

describe('cada plugin lo importa un solo archivo, y bajo demanda (criterio 9)', () => {
  for (const [nombre, { puente }] of Object.entries(PLUGINS)) {
    it(`solo ${puente} nombra ${nombre}`, () => {
      const quienes = fuentes().filter((ruta) => leer(ruta).includes(nombre))
      expect(quienes).toEqual([join(...puente.split('/'))])
    })

    it(`${puente} lo carga con import() dinámico, nunca arriba`, () => {
      const codigo = leer(puente)
      expect(codigo).toContain(`await import('${nombre}')`)
      expect(codigo).not.toMatch(new RegExp(`^import .*${nombre.replace('/', '\\/')}`, 'm'))
    })
  }

  it('el puente de biometría solo lo cargan pin.js y salidaCuenta.js, bajo demanda', () => {
    const quienes = fuentes().filter((ruta) => /(lib\/|\.\/)biometria(\.js)?['"]/.test(leer(ruta)))
    expect(quienes.sort()).toEqual(
      [join('src', 'diario', 'pin.js'), join('src', 'lib', 'salidaCuenta.js')].sort(),
    )
    quienes.forEach((ruta) => {
      expect(leer(ruta)).not.toMatch(/^import .*biometria/m)
    })
  })

  it('los dos, detrás de esIPhone()', () => {
    expect(leer('src/lib/haptica.js')).toMatch(/esIPhone/)
    expect(leer('src/diario/pin.js')).toMatch(/if \(!esIPhone\(\)\) return null/)
    expect(leer('src/lib/salidaCuenta.js')).toMatch(
      /async function olvidarFaceId\(\) \{\s+if \(!esIPhone\(\)\) return/,
    )
  })
})

describe('lo que la app de iPhone promete (criterio 11)', () => {
  const plist = leer('ios/App/App/Info.plist')

  it('UIBackgroundModes sigue siendo exactamente [audio]', () => {
    const modos = plist.match(/<key>UIBackgroundModes<\/key>\s*<array>([\s\S]*?)<\/array>/)[1]
    expect([...modos.matchAll(/<string>([^<]+)<\/string>/g)].map((m) => m[1])).toEqual(['audio'])
  })

  it('el texto de permiso de Face ID es el de DP-23.14', () => {
    expect(plist).toMatch(
      /<key>NSFaceIDUsageDescription<\/key>\s*<string>Para abrir tu journal sin escribir tu PIN\.<\/string>/,
    )
  })

  it('ni Face ID ni la Keychain piden capacidades nuevas', () => {
    const permisos = leer('ios/App/App/App.entitlements')
    expect(permisos).not.toMatch(/keychain-access-groups/)
  })
})

describe('la pantalla del PIN con Face ID', () => {
  const pantalla = leer('src/components/diario/BloqueoPin.jsx')
  const textos = copy.diario.journal.pin.biometria

  it('el interruptor solo existe con PIN y con la biometría disponible', () => {
    expect(pantalla).toMatch(/\{estado\.activo && biometria\.disponible && \(/)
    expect(pantalla).toMatch(/role="switch"/)
    expect(pantalla).toMatch(/aria-checked=\{encendido\}/)
    expect(pantalla).toMatch(/aria-live="polite"/)
  })

  it('la cara se pide sola una vez por montaje, y solo con la app a la vista', () => {
    expect(pantalla).toMatch(/const caraPedida = useRef\(false\)/)
    expect(pantalla).toMatch(/caraPedida\.current \|\| document\.visibilityState !== 'visible'/)
  })

  it('cancelar no añade texto: solo cambiada pone una nota', () => {
    const abrirConCara = pantalla.match(/const abrirConCara = async \(\) => \{[\s\S]*?\n {2}\}/)[0]
    expect(abrirConCara.match(/setNota/g)).toHaveLength(1)
    expect(abrirConCara).toMatch(/resultado\?\.motivo === 'cambiada'/)
  })

  it('ningún texto escrito a mano: los nombres vienen del copy', () => {
    const codigo = pantalla.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    expect(codigo).not.toMatch(/Face ID|Touch ID/)
    expect(textos.nombres).toEqual({ faceId: 'Face ID', touchId: 'Touch ID' })
  })

  it('el copy nuevo, exacto y sin exclamaciones', () => {
    expect(textos).toMatchObject({
      interruptor: 'Abrir con {biometria}',
      texto: 'Tu PIN sigue siendo el respaldo.',
      confirmarPin: 'Escribe tu PIN para activar {biometria}.',
      activar: 'Activar',
      abrir: 'Abrir con {biometria}',
      cambiada:
        'El teléfono cambió su configuración de {biometria}. Actívalo de nuevo cuando quieras.',
      motivo: 'Para abrir tu journal.',
    })
    expect(JSON.stringify(textos)).not.toMatch(/[!¡]/)
  })
})

describe('la web no descarga ninguno de los dos plugins (criterio 9)', () => {
  // Construir es lento y no depende del almacén: solo en el proyecto indexeddb.
  it.skipIf(EN_SQLITE)(
    'en el chunk principal no se registra ninguno',
    () => {
      const salida = mkdtempSync(join(tmpdir(), 'strivo-spec23-'))
      try {
        const entorno = { ...process.env }
        for (const nombre of Object.keys(entorno)) {
          if (nombre.startsWith('VITE_DIAG_')) delete entorno[nombre]
        }
        execFileSync('npx', ['vite', 'build', '--outDir', salida, '--logLevel', 'error'], {
          env: entorno,
          stdio: 'pipe',
        })
        const archivos = readdirSync(join(salida, 'assets')).filter((n) => n.endsWith('.js'))
        const js = archivos.map((n) => readFileSync(join(salida, 'assets', n), 'utf8'))
        const principal = [...js].sort((a, b) => b.length - a.length)[0]
        expect(principal).not.toMatch(/\(\s*"Haptics"\s*,/)
        expect(principal).not.toMatch(/\(\s*"NativeBiometric"\s*,/)
        expect(principal).not.toContain('navigator.vibrate')
        expect(principal).not.toContain('CapgoNativeBiometric')
      } finally {
        rmSync(salida, { recursive: true, force: true })
      }
    },
    180000,
  )
})
