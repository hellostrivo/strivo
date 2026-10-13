#!/usr/bin/env node
// scripts/componer-arranque.js
// Compone la fuente de la pantalla de arranque de iOS (SPEC_21.1 §4.7).
//
// **Qué hace.** Toma el símbolo de la marca tal cual —`STRIVO_simbolo_original`,
// la «S» en carbón con los puntos en gris malva— y lo centra sobre papel
// `#FBF8F4` en un lienzo de 2732 × 2732, que es lo que pide
// `@capacitor/assets`. No toca un trazo ni un color: el SVG se rasteriza y se
// pega encima, nada más (manual §3, «No: redibujar, cambiar colores…»).
//
// **Dos archivos iguales a propósito.** `splash.png` y `splash-dark.png` son el
// mismo: el modo oscuro del sistema no cambia el arranque (DP-21.1). Si fueran
// distintos, la app abriría en dos colores según un ajuste que nadie relaciona
// con ella.
//
// **El tamaño.** El encuadre del símbolo mide `ALTO_SIMBOLO` px de alto en el
// lienzo, el 14 %, y el trazo visible 329, porque el espacio libre ya viene
// dentro del encuadre del SVG. iOS pinta la imagen rellenando la pantalla
// (`scaleAspectFill`), así que la «S» visible mide unos 103 pt en un iPhone de
// 6,1″, 112 en uno de 6,7″ y 80 en un SE: por encima de los 48 pt «cómodos» del
// LEEME del logotipo, y lejos de los 32 de mínimo.
//
// Cómo correr: node scripts/componer-arranque.js
// Después, y solo después de revisar el resultado:
//   npx @capacitor/assets@3.0.5 generate --ios

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIMBOLO = join(RAIZ, 'docs/marca/logotipo-v1/STRIVO_simbolo_original.svg')
const DESTINOS = [join(RAIZ, 'assets/splash.png'), join(RAIZ, 'assets/splash-dark.png')]

export const LIENZO = 2732
export const ALTO_SIMBOLO = 385
/** Papel: el fondo del ícono y del velo de día (manual §3.5). */
export const PAPEL = '#FBF8F4'

async function componer() {
  // Se rasteriza a cuatro veces la densidad de referencia y se reduce después:
  // reducir desde grande es lo que deja el borde de la curva limpio.
  const simbolo = await sharp(readFileSync(SIMBOLO), { density: 72 * 4 })
    .resize({ height: ALTO_SIMBOLO, kernel: 'lanczos3' })
    .png()
    .toBuffer()

  const lienzo = sharp({
    create: { width: LIENZO, height: LIENZO, channels: 3, background: PAPEL },
  })
    .composite([{ input: simbolo, gravity: 'center' }])
    // Opaco: sin canal alfa no hay borde que iOS pueda pintar de negro.
    .removeAlpha()
    .png()

  const imagen = await lienzo.toBuffer()
  for (const destino of DESTINOS) {
    await sharp(imagen).toFile(destino)
  }

  const { width, height } = await sharp(simbolo).metadata()
  console.log(`Símbolo: ${width} × ${height} px sobre ${LIENZO} × ${LIENZO}, fondo ${PAPEL}.`)
  for (const destino of DESTINOS) console.log(`  → ${destino.replace(`${RAIZ}/`, '')}`)
}

componer().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
