#!/usr/bin/env node
// scripts/componer-arranque.js
// Compone la «S» de la pantalla de arranque de iOS (SPEC_21.1 §4.7, D-21.11).
//
// **Qué hace.** Toma el símbolo de la marca tal cual —`STRIVO_simbolo_original`,
// la «S» en carbón con los puntos en gris malva— y escribe
// `SimboloArranque.imageset`: tres PNG transparentes (1x, 2x y 3x) del tamaño
// exacto al que se pintan y su `Contents.json`. No toca un trazo ni un color: el
// SVG se rasteriza y se encaja, nada más (manual §3, «No: redibujar, cambiar
// colores…»). El papel no va en la imagen: es el fondo de la vista del
// storyboard, así que no hay recuadro que pueda no empatar.
//
// **Por qué tan pequeña (D-21.11, 12 nov 2026).** Hasta aquí el arranque era
// una imagen de 2732 × 2732 a sangre en las tres escalas: 29,9 MB al
// decodificarse, y **el límite de iOS para una pantalla de arranque es de
// 25 MB**. Al pasarse, iOS descarta el storyboard entero y la ventana que crece
// desde el ícono sale negra, en los dos modos. Ninguna imagen del arranque va a
// sangre ni más grande de lo que se pinta: la de 3x pesa ~420 KiB decodificada.
//
// **Sin variante oscura.** El modo oscuro del sistema no cambia el arranque
// (DP-21.1). Si la hubiera, la app abriría en dos colores según un ajuste que
// nadie relaciona con ella.
//
// **El tamaño.** `ANCHO_PT` × `ALTO_PT` es lo que medía el encuadre del símbolo
// en un iPhone 17 (402 × 874 pt) con la imagen anterior: 385 px de alto sobre un
// lienzo de 2732 pintado a pantalla llena, 385 / 2732 × 874 ≈ 123 pt, y con la
// proporción del `viewBox` del SVG (513,83 × 655,27), ≈ 97 pt de ancho. Así el
// relevo al umbral, medido con esa «S» (D-21.9, D-21.10), no cambia; ahora es el
// mismo en todos los iPhone. **El storyboard dice los mismos números** en las
// restricciones del `imageView`, y `appIos.test.js` comprueba que coinciden.
//
// Cómo correr: npm run ios:arranque. Dos veces seguidas deja `git status`
// limpio. **No** pases `@capacitor/assets` por aquí: `npm run ios:recursos` es
// solo para el ícono, y un `assets/splash.png`, `logo.png` o `icon.png` le haría
// volver a escribir un arranque de 2732.

import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import sharp from 'sharp'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIMBOLO = join(RAIZ, 'docs/marca/logotipo-v1/STRIVO_simbolo_original.svg')

/** El conjunto de imágenes que pinta el storyboard. Un nombre que `@capacitor/assets` no usa. */
export const NOMBRE = 'SimboloArranque'
export const DESTINO = join(RAIZ, `ios/App/App/Assets.xcassets/${NOMBRE}.imageset`)

/** El recuadro de la «S», en puntos. Ver «El tamaño», arriba. */
export const ANCHO_PT = 97
export const ALTO_PT = 123
export const ESCALAS = [1, 2, 3]

/** El nombre del PNG de cada escala. */
export const archivoDe = (escala) => `${NOMBRE}@${escala}x.png`

async function componer() {
  mkdirSync(DESTINO, { recursive: true })
  const svg = readFileSync(SIMBOLO)
  const imagenes = []

  for (const escala of ESCALAS) {
    const ancho = ANCHO_PT * escala
    const alto = ALTO_PT * escala
    // Se rasteriza a ocho veces la densidad de referencia y se reduce después:
    // reducir desde grande es lo que deja el borde de la curva limpio. `contain`
    // encaja sin deformar y centra; lo que sobra es transparente.
    const png = await sharp(svg, { density: 72 * 8 })
      .resize({
        width: ancho,
        height: alto,
        fit: 'contain',
        kernel: 'lanczos3',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer()
    writeFileSync(join(DESTINO, archivoDe(escala)), png)
    imagenes.push({ idiom: 'universal', filename: archivoDe(escala), scale: `${escala}x` })
    console.log(`  ${escala}x: ${ancho} × ${alto} px → ${archivoDe(escala)}`)
  }

  const contenido = { images: imagenes, info: { author: 'xcode', version: 1 } }
  writeFileSync(join(DESTINO, 'Contents.json'), `${JSON.stringify(contenido, null, 2)}\n`)
  console.log(`${NOMBRE}: ${ANCHO_PT} × ${ALTO_PT} pt → ${DESTINO.replace(`${RAIZ}/`, '')}`)
}

// Solo genera al ejecutarse; importado (las pruebas leen las medidas) no hace nada.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  componer().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
