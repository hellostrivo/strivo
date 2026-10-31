#!/usr/bin/env node
// scripts/comprobar-ios.mjs
// Comprueba, antes de construir la app de iPhone, que está lo que Google y
// Apple necesitan y que git no guarda (SPEC_21.2 §4.7, DP-21.2.3).
//
// **`GoogleService-Info.plist` no está en el repo**, como `.env.local`: se
// copia a mano en `ios/App/App/`. Sin él la app arranca igual —el plugin lo
// anota y sigue—, pero Google y Apple no funcionan, y eso se descubriría en el
// teléfono. Aquí se descubre antes, con una frase que dice qué falta y dónde va.
//
// **Y comprueba tres cosas más, porque fallan en silencio o de golpe:**
//   - sin `CLIENT_ID`, la hoja de Google no se abre y la llamada no vuelve nunca;
//   - sin el esquema `REVERSED_CLIENT_ID` en `Info.plist`, GoogleSignIn cierra
//     la app al tocar el botón;
//   - un plist de otra app (otro `BUNDLE_ID`) da tokens que Firebase rechaza.
//
// Cómo correr: lo corre `npm run ios:build` antes de compilar.

import { existsSync, readFileSync } from 'fs'
import { basename } from 'path'

export const RUTA_PLIST = 'ios/App/App/GoogleService-Info.plist'
export const RUTA_INFO = 'ios/App/App/Info.plist'
export const IDENTIFICADOR = 'com.hellostrivo.strivo'

/** El texto de una clave `<string>` de un plist XML, o `null`. */
export function cadenaDe(plist, clave) {
  const m = String(plist ?? '').match(new RegExp(`<key>${clave}</key>\\s*<string>([^<]*)</string>`))
  return m ? m[1].trim() : null
}

/** Los esquemas de URL que declara `Info.plist`. */
export function esquemasDe(info) {
  const bloque = String(info ?? '').match(
    /<key>CFBundleURLSchemes<\/key>\s*<array>([\s\S]*?)<\/array>/g,
  )
  return (bloque ?? []).flatMap((b) =>
    [...b.matchAll(/<string>([^<]*)<\/string>/g)].map((m) => m[1]),
  )
}

/**
 * Qué falta, en frases. Lista vacía es que se puede construir.
 *
 * @param {?string} plist - el contenido de `GoogleService-Info.plist`, o `null` si no existe.
 * @param {string} info - el contenido de `Info.plist`.
 * @returns {string[]}
 */
export function problemas(plist, info) {
  if (plist === null) {
    return [
      `Falta ${RUTA_PLIST}.`,
      'Descárgalo de la consola de Firebase (proyecto strivo-fe04f → Configuración del proyecto → la app de iOS) y cópialo en esa ruta.',
      'No se sube a git: si cambias de Mac, cópialo junto con .env.local.',
    ]
  }
  const fallos = []
  const bundle = cadenaDe(plist, 'BUNDLE_ID')
  if (bundle !== IDENTIFICADOR) {
    fallos.push(
      `${RUTA_PLIST} es de otra app (${bundle ?? 'sin BUNDLE_ID'}); tiene que ser de ${IDENTIFICADOR}.`,
    )
  }
  if (!cadenaDe(plist, 'CLIENT_ID')) {
    fallos.push(
      `${RUTA_PLIST} no trae CLIENT_ID: vuelve a descargarlo con el acceso con Google activado en Firebase.`,
    )
  }
  const invertido = cadenaDe(plist, 'REVERSED_CLIENT_ID')
  if (!invertido) {
    fallos.push(`${RUTA_PLIST} no trae REVERSED_CLIENT_ID.`)
  } else if (!esquemasDe(info).includes(invertido)) {
    fallos.push(
      `${RUTA_INFO} no declara el esquema ${invertido} en CFBundleURLSchemes: sin él, Google cierra la app.`,
    )
  }
  return fallos
}

function principal() {
  // npm corre los scripts desde la raíz del repo.
  const plist = existsSync(RUTA_PLIST) ? readFileSync(RUTA_PLIST, 'utf8') : null
  const fallos = problemas(plist, readFileSync(RUTA_INFO, 'utf8'))
  if (fallos.length > 0) {
    console.error(['', 'No se puede construir la app de iPhone:', ...fallos, ''].join('\n'))
    process.exit(1)
  }
}

if (basename(process.argv[1] ?? '') === 'comprobar-ios.mjs') principal()
