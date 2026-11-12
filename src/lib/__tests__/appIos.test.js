// src/lib/__tests__/appIos.test.js
// SPEC_21.1 — la configuración de la app de iPhone, leída de los archivos que
// la definen. Nada de esto se ve en una pantalla, y casi todo es irreversible
// una vez publicado: el identificador, el origen del WebView, el iOS mínimo.

import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { execFileSync } from 'child_process'
import {
  ALTO_PT,
  ANCHO_PT,
  ESCALAS,
  NOMBRE,
  archivoDe,
} from '../../../scripts/componer-arranque.js'

const leer = (ruta) => readFileSync(ruta, 'utf8')

/**
 * Un archivo tal como entraría al próximo commit: el del índice de git, que es
 * el de HEAD salvo lo que ya se haya preparado con `git add`. `null` si git no
 * está o el archivo no está en el índice; quien lo use se salta, no falla.
 */
function enElIndice(ruta) {
  try {
    return execFileSync('git', ['show', `:${ruta}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return null
  }
}

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

  // SPEC_21.2 (DP-21.2.1): el plugin solo consigue la credencial. La sesión es
  // la del SDK de JavaScript, la que leen la cola, la restauración y el PIN.
  it('Google y Apple: el plugin nunca abre su propia sesión (skipNativeAuth)', () => {
    expect(config.plugins.FirebaseAuthentication).toEqual({
      skipNativeAuth: true,
      providers: ['apple.com', 'google.com'],
    })
  })

  it('SPM: el plugin entra por enlace y sin el SDK de Facebook', () => {
    const spm = config.experimental.ios.spm
    expect(spm.swiftToolsVersion).toBe('6.1')
    expect(spm.packageOptions).toEqual({ '@capacitor-firebase/authentication': { symlink: true } })
    // Listar los rasgos sustituye a los de fábrica, que traen Facebook.
    expect(spm.packageTraits).toEqual({ '@capacitor-firebase/authentication': ['Google'] })
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

  it('ios:build comprueba lo de Google, construye en modo ios y sincroniza', () => {
    expect(paquete.scripts['ios:build']).toBe(
      'node scripts/comprobar-ios.mjs && vite build --mode ios && cap sync ios',
    )
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

  it('el plugin de Google y Apple va en versión exacta (DP-21.2.1)', () => {
    expect(paquete.dependencies['@capacitor-firebase/authentication']).toBe('8.5.2')
  })

  // El plugin pide firebase 12 como par opcional y la app usa la 10. Su parte
  // web —la única que importa firebase— nunca se carga, así que se le da la del
  // repo. El override va acotado al plugin: ningún otro paquete lo hereda.
  it('el override de firebase va acotado al plugin y apunta a la del repo', () => {
    expect(paquete.overrides).toEqual({
      '@capacitor-firebase/authentication': { firebase: '$firebase' },
    })
  })
})

describe('package-lock.json', () => {
  const lock = JSON.parse(leer('package-lock.json'))

  it('un solo firebase en todo el árbol: el override no deja una segunda copia', () => {
    const copias = Object.keys(lock.packages).filter((ruta) =>
      /(^|\/)node_modules\/firebase$/.test(ruta),
    )
    expect(copias).toEqual(['node_modules/firebase'])
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

  // **Se lee lo que entraría al commit, no el disco** (§4.6). El equipo de firma
  // lo elige la fundadora en Xcode y vive en su copia de este archivo de forma
  // permanente: lo que hay que garantizar es que no se comitee, no que no exista
  // en su Mac. Leerlo del disco dejaba esta prueba en rojo en cada máquina que
  // firma. Se lee el índice y no HEAD para que también salte si alguien prepara
  // el archivo con su equipo dentro, antes de comitearlo. Sin git —un paquete
  // sin `.git`— no hay commit que vigilar, y la prueba se salta.
  const comiteable = enElIndice('ios/App/App.xcodeproj/project.pbxproj')

  it.skipIf(comiteable === null)(
    'firma automática y sin equipo en lo que se comitea: lo elige la fundadora en Xcode',
    () => {
      expect(comiteable).not.toMatch(/DEVELOPMENT_TEAM/)
      const estilos = [...comiteable.matchAll(/CODE_SIGN_STYLE = (\w+);/g)].map((m) => m[1])
      expect(estilos).toEqual(['Automatic', 'Automatic'])
    },
  )

  it('Iniciar sesión con Apple: los entitlements, en Debug y en Release', () => {
    const rutas = [...proyecto.matchAll(/CODE_SIGN_ENTITLEMENTS = ([^;]+);/g)].map((m) => m[1])
    expect(rutas).toEqual(['App/App.entitlements', 'App/App.entitlements'])
    expect(proyecto).toMatch(/path = App\.entitlements;/)
  })

  it('GoogleService-Info.plist va en los recursos, aunque no esté en git', () => {
    expect(proyecto).toMatch(/GoogleService-Info\.plist in Resources \*\/ = \{isa = PBXBuildFile/)
    const recursos = proyecto.match(/\/\* Resources \*\/ = \{[\s\S]*?files = \(([\s\S]*?)\);/)[1]
    expect(recursos).toMatch(/GoogleService-Info\.plist in Resources/)
  })

  // WebKit admite las expresiones regulares que miran hacia atrás desde iOS
  // 16.4, y la app pide 16.2. En 16.2–16.3 una de ellas rompe la función que
  // la usa o, escrita como literal, el módulo entero al cargarse. Se vigila el
  // código que llega a la app, no las pruebas, que corren en Node.
  it('nada en src/ mira hacia atrás en una expresión regular: iOS 16.2–16.3 no lo admite', () => {
    const archivos = (dir) =>
      readdirSync(dir).flatMap((nombre) => {
        const ruta = join(dir, nombre)
        if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : archivos(ruta)
        return /\.(jsx?|mjs)$/.test(nombre) ? [ruta] : []
      })
    const conLookbehind = archivos('src').filter((ruta) =>
      /\(\?<[=!]/.test(readFileSync(ruta, 'utf8')),
    )
    expect(conLookbehind).toEqual([])
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

describe('ios/App/App/App.entitlements', () => {
  it('Iniciar sesión con Apple, y nada más', () => {
    const derechos = leer('ios/App/App/App.entitlements')
    expect([...derechos.matchAll(/<key>([^<]+)<\/key>/g)].map((m) => m[1])).toEqual([
      'com.apple.developer.applesignin',
    ])
    expect(derechos).toMatch(
      /<key>com\.apple\.developer\.applesignin<\/key>\s*<array>\s*<string>Default<\/string>\s*<\/array>/,
    )
  })
})

describe('.gitignore: lo que no se sube (DP-21.2.3)', () => {
  it('GoogleService-Info.plist queda fuera, como .env.local', () => {
    const lineas = leer('.gitignore').split('\n')
    expect(lineas).toContain('ios/App/App/GoogleService-Info.plist')
    expect(lineas).toContain('.env.local')
  })

  it('los enlaces de SPM que crea cap sync quedan fuera', () => {
    expect(leer('ios/.gitignore').split('\n')).toContain('App/CapApp-SPM/symlinks/')
  })

  it.skipIf(enElIndice('.gitignore') === null)('el plist no está en el índice', () => {
    expect(enElIndice('ios/App/App/GoogleService-Info.plist')).toBeNull()
  })
})

// **D-21.11 (nov 2026): la pantalla de arranque es ligera, o iOS no la pinta.**
// Mientras iOS agranda el ícono, lo que se ve es este storyboard, dibujado de
// antemano por el sistema. Hasta el 12 nov 2026 era una imagen `Splash` de
// 2732 × 2732 a sangre en las tres escalas: 29,9 MB al decodificarse, y el
// límite de iOS para una pantalla de arranque es de 25 MB. `splashboardd` lo
// decía tal cual —«Estimated size (29900800) is over limit (25000000)»— y
// marcaba la app con «a bad launch image»: la ventana crecía en negro, en los
// dos modos, y el papel solo llegaba con la capa del plugin. **Descartado antes
// de dar con ello:** el modo oscuro (`systemBackgroundColor`, adenda de 21.1 §1:
// pasaba igual en modo claro), el fondo del storyboard (pasarlo a papel fijo no
// cambió nada) y la caché (borrar la app y reiniciar, tampoco). Ahora es papel
// con la «S» en su tamaño justo, del mismo tamaño que medía en un iPhone 17, y
// las medidas salen del script que la compone (`scripts/componer-arranque.js`).
describe('ios/App/App/Base.lproj/LaunchScreen.storyboard', () => {
  const storyboard = leer('ios/App/App/Base.lproj/LaunchScreen.storyboard')
  const raiz = storyboard.match(/<view key="view"[^>]*\bid="([^"]+)"[^>]*>[\s\S]*<\/view>/)
  const idRaiz = raiz?.[1]
  const imagenes = [...storyboard.matchAll(/<imageView\b[^>]*>/g)].map((m) => m[0])
  const restricciones = [...storyboard.matchAll(/<constraint\b[^>]*\/>/g)].map((m) => m[0])
  const atributo = (etiqueta, nombre) => etiqueta.match(new RegExp(`\\b${nombre}="([^"]*)"`))?.[1]

  it('la vista raíz es un UIView con fondo papel #FBF8F4, en sRGB', () => {
    expect(raiz).not.toBeNull()
    const colores = [...storyboard.matchAll(/<color key="backgroundColor"([^>]*)\/>/g)]
    expect(colores).toHaveLength(1)
    const fondo = colores[0][1]
    const canal = (nombre) => Number(fondo.match(new RegExp(`${nombre}="([\\d.]+)"`))[1])
    const rgb = ['red', 'green', 'blue'].map((c) => Math.round(canal(c) * 255))
    expect(rgb).toEqual([0xfb, 0xf8, 0xf4])
    expect(canal('alpha')).toBe(1)
    expect(fondo).toMatch(/customColorSpace="sRGB"/)
    // Es el fondo de la raíz, no el de la imagen: va después de sus subvistas.
    expect(raiz[0].lastIndexOf('<color key="backgroundColor"')).toBeGreaterThan(
      raiz[0].lastIndexOf('</subviews>'),
    )
  })

  it('ningún color del sistema: el modo oscuro no lo cambia', () => {
    expect(storyboard).not.toMatch(/systemColor|systemBackgroundColor/)
  })

  it('exactamente una imagen, SimboloArranque, encajada y no a sangre', () => {
    expect(imagenes).toHaveLength(1)
    expect(atributo(imagenes[0], 'image')).toBe(NOMBRE)
    expect(atributo(imagenes[0], 'contentMode')).toBe('scaleAspectFit')
    expect(atributo(imagenes[0], 'translatesAutoresizingMaskIntoConstraints')).toBe('NO')
  })

  it('centrada en la vista raíz, no en el área segura, y del tamaño del script', () => {
    const idImagen = atributo(imagenes[0], 'id')
    const centro = (eje) =>
      restricciones.filter(
        (r) =>
          atributo(r, 'firstItem') === idImagen &&
          atributo(r, 'firstAttribute') === eje &&
          atributo(r, 'secondItem') === idRaiz &&
          atributo(r, 'secondAttribute') === eje &&
          atributo(r, 'constant') === undefined,
      )
    expect(centro('centerX')).toHaveLength(1)
    expect(centro('centerY')).toHaveLength(1)

    const medida = (eje) =>
      restricciones
        .filter(
          (r) => atributo(r, 'firstItem') === undefined && atributo(r, 'firstAttribute') === eje,
        )
        .map((r) => Number(atributo(r, 'constant')))
    expect(medida('width')).toEqual([ANCHO_PT])
    expect(medida('height')).toEqual([ALTO_PT])
    expect(restricciones).toHaveLength(4)
    expect(storyboard).not.toMatch(/safeArea/)

    expect(storyboard).toMatch(
      new RegExp(`<image name="${NOMBRE}" width="${ANCHO_PT}" height="${ALTO_PT}"/>`),
    )
  })

  it('ninguna referencia a Splash y ningún texto', () => {
    expect(storyboard).not.toMatch(/Splash/)
    expect(storyboard).not.toMatch(/<label\b|<textView\b|<textField\b|\btext="/)
  })
})

/** Ancho, alto y si trae canal alfa, leídos de la cabecera del PNG. */
function cabeceraPng(ruta) {
  const datos = readFileSync(ruta)
  expect(datos.subarray(1, 4).toString('latin1')).toBe('PNG')
  expect(datos.subarray(12, 16).toString('latin1')).toBe('IHDR')
  const tipoDeColor = datos[25]
  return {
    ancho: datos.readUInt32BE(16),
    alto: datos.readUInt32BE(20),
    // 4: gris con alfa; 6: color con alfa.
    alfa: tipoDeColor === 4 || tipoDeColor === 6,
  }
}

/** Todos los PNG de una carpeta, a cualquier profundidad. */
function pngsDe(carpeta) {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = join(carpeta, nombre)
    if (statSync(ruta).isDirectory()) return pngsDe(ruta)
    return nombre.toLowerCase().endsWith('.png') ? [ruta] : []
  })
}

describe('ios/App/App/Assets.xcassets: el arranque, del tamaño justo (D-21.11)', () => {
  const CATALOGO = 'ios/App/App/Assets.xcassets'
  const CONJUNTO = `${CATALOGO}/${NOMBRE}.imageset`

  it('SimboloArranque declara 1x, 2x y 3x, sin variante oscura', () => {
    const contenido = JSON.parse(leer(`${CONJUNTO}/Contents.json`))
    expect(contenido.images).toEqual(
      ESCALAS.map((escala) => ({
        idiom: 'universal',
        filename: archivoDe(escala),
        scale: `${escala}x`,
      })),
    )
    expect(JSON.stringify(contenido)).not.toMatch(/appearances|luminosity|dark/)
  })

  it.each(ESCALAS)(
    'el PNG de %ix mide los puntos del script por su escala y tiene alfa',
    (escala) => {
      const { ancho, alto, alfa } = cabeceraPng(`${CONJUNTO}/${archivoDe(escala)}`)
      expect(Math.abs(ancho - ANCHO_PT * escala)).toBeLessThanOrEqual(1)
      expect(Math.abs(alto - ALTO_PT * escala)).toBeLessThanOrEqual(1)
      expect(alfa).toBe(true)
    },
  )

  it('Splash.imageset no existe', () => {
    expect(readdirSync(CATALOGO)).not.toContain('Splash.imageset')
  })

  // La guarda que habría atrapado D-21.11: salta si alguien vuelve a pasar el
  // arranque por `@capacitor/assets`, que lo escribe a 2732 × 2732.
  it('ninguna imagen del catálogo pasa de 1024 px por lado', () => {
    const pngs = pngsDe(CATALOGO)
    expect(pngs.length).toBeGreaterThan(0)
    for (const ruta of pngs) {
      const { ancho, alto } = cabeceraPng(ruta)
      expect(Math.max(ancho, alto), ruta).toBeLessThanOrEqual(1024)
    }
  })

  // `npm run ios:recursos` lee `assets/`: con un `splash.png`, un `logo.png` o
  // un `icon.png` volvería a escribir un arranque de 2732 (DP-21.11.3).
  it('assets/ solo tiene los tres archivos del ícono', () => {
    expect(readdirSync('assets').sort()).toEqual([
      'icon-background.png',
      'icon-foreground.png',
      'icon-only.png',
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

  // El valor es el REVERSED_CLIENT_ID del GoogleService-Info.plist. No es
  // secreto: es el esquema por el que vuelve Google, y sin él GoogleSignIn
  // cierra la app al tocar el botón. Que coincida con el plist lo comprueba
  // `scripts/comprobar-ios.mjs` antes de cada build.
  it('el esquema de vuelta de Google está declarado', () => {
    const esquemas = [...valor('CFBundleURLTypes').matchAll(/<string>([^<]+)<\/string>/g)].map(
      (m) => m[1],
    )
    expect(esquemas).toContain(
      'com.googleusercontent.apps.993205123093-4da1rah1uba8kf7i4k6jicgkhhlrhs6o',
    )
  })

  it('las versiones salen de los ajustes del proyecto, no de un literal', () => {
    expect(valor('CFBundleShortVersionString')).toBe('<string>$(MARKETING_VERSION)</string>')
    expect(valor('CFBundleVersion')).toBe('<string>$(CURRENT_PROJECT_VERSION)</string>')
  })
})

// ─── SPEC_17B: lo escrito en el iPhone, en SQLite ─────────────────────────────
// El plugin es nuestro (`plugins/strivo-almacen/`), sobre el SQLite del
// sistema. La ruta de la base es irreversible tras publicar: cambiarla abriría
// una base vacía.

describe('plugins/strivo-almacen (SPEC_17B)', () => {
  const swift = leer('plugins/strivo-almacen/ios/Sources/StrivoAlmacenPlugin/Almacen.swift')
  const puente = leer(
    'plugins/strivo-almacen/ios/Sources/StrivoAlmacenPlugin/StrivoAlmacenPlugin.swift',
  )
  const codigo = (texto) => texto.replace(/\/\/.*$/gm, '')

  it('la base vive en Library/Strivo/strivo.sqlite (DP-17B.2, irreversible)', () => {
    expect(swift).toMatch(/public static let carpeta = "Strivo"/)
    expect(swift).toMatch(/public static let nombreDeArchivo = "strivo\.sqlite"/)
    expect(swift).toMatch(/for: \.libraryDirectory, in: \.userDomainMask/)
  })

  it('entra en la copia de iCloud: nada marca isExcludedFromBackup', () => {
    expect(codigo(swift + puente)).not.toMatch(/isExcludedFromBackup|ExcludedFromBackup/)
  })

  it('la protección de fábrica, hasta el primer desbloqueo, y nunca Complete (condición 5)', () => {
    expect(codigo(swift)).toMatch(/completeUntilFirstUserAuthentication/)
    expect(codigo(swift)).toMatch(/SQLITE_OPEN_FILEPROTECTION_COMPLETEUNTILFIRSTUSERAUTHENTICATION/)
    expect(codigo(swift)).not.toMatch(/FileProtectionType\.complete\b(?!Until)/)
    expect(codigo(swift)).not.toMatch(/SQLITE_OPEN_FILEPROTECTION_COMPLETE\b/)
  })

  it('WAL con synchronous FULL, y una sola conexión con una cola serial (condiciones 3 y 4)', () => {
    expect(swift).toMatch(/PRAGMA journal_mode = WAL/)
    expect(swift).toMatch(/PRAGMA synchronous = FULL/)
    expect(swift).toMatch(/private var db: OpaquePointer\?/)
    expect(swift).toMatch(/DispatchQueue\(label: "com\.hellostrivo\.strivo\.almacen"\)/)
  })

  it('cuatro métodos y ninguno más (condición 7)', () => {
    const metodos = [...puente.matchAll(/CAPPluginMethod\(name: "(\w+)"/g)].map((m) => m[1])
    expect(metodos.sort()).toEqual(['abrir', 'consultar', 'ejecutar', 'existe'])
  })

  it('sin cifrado ni bibliotecas de terceros: el SQLite del sistema (DP-17B.1)', () => {
    const paquete = leer('plugins/strivo-almacen/Package.swift')
    expect(swift).toMatch(/^import SQLite3$/m)
    const dependencias = [...paquete.matchAll(/\.package\(url: "([^"]+)"/g)].map((m) => m[1])
    expect(dependencias).toEqual(['https://github.com/ionic-team/capacitor-swift-pm.git'])
    const resuelto = leer(
      'ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved',
    )
    expect(resuelto).not.toMatch(/sqlcipher|zipfoundation/i)
    expect(leer('package-lock.json')).not.toMatch(/capacitor-community\/sqlite|jeep-sqlite/)
  })

  it('entra por la ruta real, no por node_modules ni por un enlace', () => {
    const paquete = JSON.parse(leer('package.json'))
    expect(paquete.dependencies['strivo-almacen']).toBe('file:plugins/strivo-almacen')
    expect(leer('ios/App/CapApp-SPM/Package.swift')).toMatch(
      /\.package\(name: "StrivoAlmacen", path: "\.\.\/\.\.\/\.\.\/plugins\/strivo-almacen"\)/,
    )
  })

  it('el JS del plugin no va en dist/, que git ignora', () => {
    const paquete = JSON.parse(leer('plugins/strivo-almacen/package.json'))
    expect(paquete.main).toBe('src/index.js')
    expect(leer('plugins/strivo-almacen/src/index.js')).toMatch(/registerPlugin\('StrivoAlmacen'\)/)
  })
})

// ─── SPEC_22 — los avisos locales, sin push y sin insignia (criterio 11) ────
//
// Notificaciones locales: nada de APNs ni de push remoto. Declarar push sin
// usarlo es motivo de rechazo, así que se vigila que no aparezca por ningún
// lado; y con la app abierta el aviso no se enseña, y nunca con número.
describe('SPEC_22: los avisos locales', () => {
  const config = JSON.parse(leer('capacitor.config.json'))
  const paquete = JSON.parse(leer('package.json'))
  const plist = leer('ios/App/App/Info.plist')

  it('el plugin oficial, en versión exacta (DP-22.13)', () => {
    expect(paquete.dependencies['@capacitor/local-notifications']).toBe('8.3.1')
  })

  it('con la app abierta no se enseña nada, y nunca con insignia (DP-22.7)', () => {
    expect(config.plugins.LocalNotifications).toEqual({ presentationOptions: [] })
  })

  it('sin push: ni aps-environment, ni remote-notification, ni la clave de notificaciones', () => {
    expect(leer('ios/App/App/App.entitlements')).not.toMatch(/aps-environment/)
    const modos = plist.match(/<key>UIBackgroundModes<\/key>\s*<array>([\s\S]*?)<\/array>/)[1]
    expect([...modos.matchAll(/<string>([^<]+)<\/string>/g)].map((m) => m[1])).toEqual(['audio'])
    expect(plist).not.toMatch(/NSUserNotificationsUsageDescription/)
    expect(leer('ios/App/App.xcodeproj/project.pbxproj')).not.toMatch(
      /aps-environment|com\.apple\.Push/,
    )
  })

  it('cap sync lo enlaza por SPM, como paquete local y sin opciones', () => {
    const swift = leer('ios/App/CapApp-SPM/Package.swift')
    expect(swift).toMatch(
      /\.package\(name: "CapacitorLocalNotifications", path: "\.\.\/\.\.\/\.\.\/node_modules\/@capacitor\/local-notifications"\)/,
    )
    expect(
      config.experimental.ios.spm.packageOptions['@capacitor/local-notifications'],
    ).toBeUndefined()
  })
})
