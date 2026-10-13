// src/lib/__tests__/appIos.test.js
// SPEC_21.1 — la configuración de la app de iPhone, leída de los archivos que
// la definen. Nada de esto se ve en una pantalla, y casi todo es irreversible
// una vez publicado: el identificador, el origen del WebView, el iOS mínimo.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { opcionesDeOcultar, FUNDIDO_DE_SALIDA } from '../pantallaArranque.js'

const leer = (ruta) => readFileSync(ruta, 'utf8')

describe('capacitor.config.json', () => {
  const config = JSON.parse(leer('capacitor.config.json'))

  it('identificador exacto: com.hellostrivo.strivo (DP-21.3, irreversible)', () => {
    expect(config.appId).toBe('com.hellostrivo.strivo')
    expect(config.appName).toBe('Strivo')
    expect(config.webDir).toBe('dist')
  })

  it('sin server.url ni allowNavigation: la app va embebida (Guideline 4.2)', () => {
    expect(config.server?.url).toBeUndefined()
    expect(config.server?.allowNavigation).toBeUndefined()
  })

  it('esquema y host de fábrica: no se declaran (DP-21.8, borrarían lo escrito)', () => {
    expect(config.ios?.scheme).toBeUndefined()
    expect(config.server?.hostname).toBeUndefined()
    expect(config.server?.iosScheme).toBeUndefined()
  })

  it('contentInset never: las áreas seguras las pone el CSS con env()', () => {
    expect(config.ios.contentInset).toBe('never')
  })

  it('la pantalla de arranque no se retira sola, es papel y no lleva rueda', () => {
    expect(config.plugins.SplashScreen).toMatchObject({
      launchAutoHide: false,
      backgroundColor: '#FBF8F4',
      showSpinner: false,
    })
  })

  it('la barra de estado va encima del contenido y abre con texto oscuro, sobre papel', () => {
    expect(config.plugins.StatusBar).toEqual({ overlaysWebView: true, style: 'LIGHT' })
  })
})

describe('vite.config.js: sin service worker solo en el build nativo (DP-21.7)', async () => {
  const { pwaApagado, MODO_IOS, default: configurar } = await import('../../../vite.config.js')

  it('el modo ios apaga el PWA', () => {
    expect(MODO_IOS).toBe('ios')
    expect(pwaApagado('ios')).toBe(true)
  })

  it('el build de Netlify y el de desarrollo lo conservan', () => {
    expect(pwaApagado('production')).toBe(false)
    expect(pwaApagado('development')).toBe(false)
  })

  it('la configuración se construye en los dos modos', () => {
    expect(configurar({ mode: 'ios', command: 'build' }).plugins.length).toBeGreaterThan(0)
    expect(configurar({ mode: 'production', command: 'build' }).plugins.length).toBeGreaterThan(0)
  })
})

describe('package.json', () => {
  const paquete = JSON.parse(leer('package.json'))

  it('ios:build construye en modo ios y sincroniza', () => {
    expect(paquete.scripts['ios:build']).toBe('vite build --mode ios && cap sync ios')
    expect(paquete.scripts['ios:abrir']).toBe('cap open ios')
  })

  it('@capacitor/assets no se instala: se ejecuta fijado con npx', () => {
    expect(paquete.dependencies['@capacitor/assets']).toBeUndefined()
    expect(paquete.devDependencies['@capacitor/assets']).toBeUndefined()
    expect(paquete.scripts['ios:recursos']).toMatch(
      /npx --yes @capacitor\/assets@3\.0\.5 generate --ios$/,
    )
  })

  it('@capacitor/browser no entra en 21.1', () => {
    expect(paquete.dependencies['@capacitor/browser']).toBeUndefined()
  })
})

describe('ios/App/App.xcodeproj/project.pbxproj', () => {
  const proyecto = leer('ios/App/App.xcodeproj/project.pbxproj')

  it('iOS 16.2 en el proyecto y en el target, Debug y Release, y ningún otro', () => {
    const objetivos = [...proyecto.matchAll(/IPHONEOS_DEPLOYMENT_TARGET = ([\d.]+);/g)].map(
      (m) => m[1],
    )
    expect(objetivos).toEqual(['16.2', '16.2', '16.2', '16.2'])
  })

  it('solo iPhone: en iPad corre en modo compatibilidad (DP-21.2)', () => {
    const familias = [...proyecto.matchAll(/TARGETED_DEVICE_FAMILY = ([^;]+);/g)].map((m) => m[1])
    expect(familias).toEqual(['1', '1'])
  })

  it('el identificador del target es el de la config', () => {
    const ids = [...proyecto.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)].map((m) => m[1])
    expect(ids).toEqual(['com.hellostrivo.strivo', 'com.hellostrivo.strivo'])
  })

  it('firma automática y sin equipo: lo elige la fundadora en Xcode', () => {
    expect(proyecto).not.toMatch(/DEVELOPMENT_TEAM/)
    const estilos = [...proyecto.matchAll(/CODE_SIGN_STYLE = (\w+);/g)].map((m) => m[1])
    expect(estilos).toEqual(['Automatic', 'Automatic'])
  })

  it('versión 1.0.0, compilación 1', () => {
    expect([...proyecto.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1])).toEqual([
      '1.0.0',
      '1.0.0',
    ])
    expect([...proyecto.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map((m) => m[1])).toEqual([
      '1',
      '1',
    ])
  })
})

describe('ios/App/App/Info.plist', () => {
  const plist = leer('ios/App/App/Info.plist')
  /** El valor que sigue a una clave, como texto XML. */
  const valor = (clave) => {
    const m = plist.match(
      new RegExp(`<key>${clave}</key>\\s*(<(\\w+)\\s*/>|<(\\w+)>[\\s\\S]*?</\\3>)`),
    )
    return m?.[1] ?? null
  }

  it('los diálogos del sistema salen en español', () => {
    expect(valor('CFBundleDevelopmentRegion')).toBe('<string>es</string>')
    expect(valor('CFBundleDisplayName')).toBe('<string>Strivo</string>')
  })

  it('solo vertical, también en iPad', () => {
    for (const clave of [
      'UISupportedInterfaceOrientations',
      'UISupportedInterfaceOrientations~ipad',
    ]) {
      const orientaciones = [...valor(clave).matchAll(/<string>(\w+)<\/string>/g)].map((m) => m[1])
      expect(orientaciones).toEqual(['UIInterfaceOrientationPortrait'])
    }
  })

  it('audio en segundo plano declarado para SPEC_23', () => {
    expect(valor('UIBackgroundModes')).toMatch(/<string>audio<\/string>/)
  })

  it('el texto de Face ID, exacto', () => {
    expect(valor('NSFaceIDUsageDescription')).toBe(
      '<string>Para abrir tu Journal sin escribir el PIN.</string>',
    )
  })

  it('arm64 como capacidad requerida, no armv7: con iOS 16.2 no deja fuera a nadie', () => {
    const capacidades = [
      ...valor('UIRequiredDeviceCapabilities').matchAll(/<string>(\w+)<\/string>/g),
    ].map((m) => m[1])
    expect(capacidades).toEqual(['arm64'])
  })

  it('sin cifrado que declarar', () => {
    expect(valor('ITSAppUsesNonExemptEncryption')).toBe('<false/>')
  })

  it('la clave de notificaciones no se declara: iOS no la tiene', () => {
    expect(plist).not.toMatch(/NSUserNotificationsUsageDescription/)
  })

  it('la barra abre con texto oscuro, sobre la pantalla de arranque de papel', () => {
    expect(valor('UIStatusBarStyle')).toBe('<string>UIStatusBarStyleDarkContent</string>')
    expect(valor('UIViewControllerBasedStatusBarAppearance')).toBe('<true/>')
  })

  it('las versiones salen de los ajustes del proyecto, no de un literal', () => {
    expect(valor('CFBundleShortVersionString')).toBe('<string>$(MARKETING_VERSION)</string>')
    expect(valor('CFBundleVersion')).toBe('<string>$(CURRENT_PROJECT_VERSION)</string>')
  })
})

describe('la pantalla de arranque se retira (SPEC_21.1 §4.7)', () => {
  it('con un fundido corto, dentro del rango de movimiento de la marca', () => {
    expect(opcionesDeOcultar(false)).toEqual({ fadeOutDuration: FUNDIDO_DE_SALIDA })
    expect(FUNDIDO_DE_SALIDA).toBeGreaterThanOrEqual(120)
    expect(FUNDIDO_DE_SALIDA).toBeLessThanOrEqual(900)
  })

  it('sin fundido con «reducir movimiento»', () => {
    expect(opcionesDeOcultar(true)).toEqual({ fadeOutDuration: 0 })
  })
})
