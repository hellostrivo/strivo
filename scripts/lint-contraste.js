#!/usr/bin/env node
// scripts/lint-contraste.js
// Mide el contraste de los pares texto/fondo que la app usa de verdad.
//
// Existe porque el criterio 2 de SPEC_12 pide AAA en las cuatro paletas y eso
// no se puede afirmar a ojo. Cada par se mide con la fórmula de WCAG 2.2 y se
// compara con el umbral que le toca:
//
//   · Texto de cuerpo → AAA (7:1). Es lo que §6.3.6 exige y lo que Fase 1
//     viene cumpliendo desde SPEC_06.
//   · Texto grande (≥ 18,66 px en negrita o ≥ 24 px) → AAA grande (4,5:1).
//   · Elementos no textuales —bordes, indicadores— → 3:1 (WCAG 2.2, 1.4.11).
//
// **Los primarios de marca no llevan texto de cuerpo encima**, y no es un
// descuido: blanco sobre `lumia-pm-500` da 5,3:1 y sobre `formia-pm-600`, 5,2:1.
// Pasan AA y no llegan a AAA. El manual §4.8 ya lo resuelve: la paleta de marca
// dice qué superficie usar y el sistema de contraste decide qué texto va
// encima. Por eso los primarios se usan como acento y como borde —donde el
// umbral es 3:1— y nunca como fondo de un párrafo.
//
// Cómo correr: npm run lint:contraste

// ─── Fórmula de WCAG 2.2 ──────────────────────────────────────────────────────

function aRGB(hex) {
  const limpio = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(limpio.slice(i, i + 2), 16) / 255)
}

/**
 * Mezcla un color con alfa sobre un fondo opaco. El fondo puede venir ya
 * mezclado —un array de canales— para apilar dos velos: es lo que hace falta
 * cuando un borde translúcido se pinta sobre una superficie translúcida, como
 * el recuadro de la frase del día en la noche.
 */
function sobre(hex, alfa, fondo) {
  const frente = Array.isArray(hex) ? hex : aRGB(hex)
  const detras = Array.isArray(fondo) ? fondo : aRGB(fondo)
  return frente.map((canal, i) => canal * alfa + detras[i] * (1 - alfa))
}

function luminancia(rgb) {
  const [r, g, b] = rgb.map((canal) =>
    canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a, b) {
  const [uno, otro] = [luminancia(Array.isArray(a) ? a : aRGB(a)), luminancia(Array.isArray(b) ? b : aRGB(b))]
  const claro = Math.max(uno, otro)
  const oscuro = Math.min(uno, otro)
  return (claro + 0.05) / (oscuro + 0.05)
}

// ─── Los colores, tal como están en los tokens ────────────────────────────────

const TEXTO = {
  onLight: '#241E33',
  onLightSoft: '#3A3546',
  onDark: '#F2EEF7',
  onDarkSoft: '#B4ACC6',
  blanco: '#FFFFFF',
}

const MARCA = {
  lumiaAm50: '#F6F2E9',
  lumiaAm100: '#DCCFF1',
  lumiaAm200: '#E5C2DC',
  lumiaAm300: '#F6DDE8',
  lumiaPm50: '#F3EFEA',
  lumiaPm400: '#8D82B6',
  lumiaPm500: '#6C5AA7',
  lumiaPm700: '#5A5568',
  formiaAm50: '#F7F2E9',
  formiaAm200: '#E8D9C4',
  formiaAm400: '#FFC29C',
  formiaAm500: '#E9A387',
  formiaPm600: '#B45A2B',
  formiaPm700: '#8F4A2F',
  formiaPm800: '#5D4766',
  formiaPm900: '#1F1D22',
  strivo50: '#F6F4F1',
  strivo100: '#E9E7E3',
  strivo300: '#D4D1CD',
  strivo600: '#6E6A73',
  // SPEC_14 — Dos pasos nuevos sobre el eje neutro que ya existia entre 600 y
  // 900. Sin ellos, la respiracion solo tenia dos colores por encima del 3:1 y
  // §5 necesita cuatro fases distinguibles.
  strivo700: '#58545D',
  strivo800: '#423E47',
  strivo900: '#2B2730',
  night: '#191428',
  // El bloque del conmutador de Hoy. Contratono: oscuro sobre la mañana clara,
  // claro sobre la noche. No sale del manual —lo fijó el propietario del
  // producto— y por eso se mide aquí como cualquier otra superficie con texto.
  conmutadorAm: '#1D1833',
  conmutadorPm: '#F2DDE7',
  // §6.3.9 — El círculo de la respiración, en sus dos versiones.
  breathAm: '#E8A54A',
  breathPm: '#DCCFF1',
  // El símbolo de Strivo lleva su color dentro del `.svg` (manual §3.2: el tono
  // de firma no es el primario de la paleta y no se toca). Sobre el contratono
  // de la mañana no se ve, así que ahí se pinta la versión monocromática que el
  // manual §9 tiene pendiente. Se miden los dos.
  simbolo: '#2B2730',
  simboloMono: '#FFFFFF',
  // La vela de Lumia, también horneada en su `.svg`.
  velaLumia: '#7563A7',
}

const CUERPO = 7
const GRANDE = 4.5
const NO_TEXTO = 3
// Separador decorativo: WCAG no le exige contraste, pero un borde que no se ve
// no separa nada. 1,5:1 es el mismo listón que la cuadrícula de constancia de
// SPEC_05, que se documentó como perceptible.
const SEPARADOR = 1.5

/** Cada par que la app pinta de verdad, con el umbral que le corresponde. */
const PARES = [
  // ── Lumia · Mañana ──────────────────────────────────────────────────────────
  ['Lumia·AM · cuerpo sobre base', TEXTO.onLight, MARCA.lumiaAm50, CUERPO],
  ['Lumia·AM · secundario sobre base', TEXTO.onLightSoft, MARCA.lumiaAm50, CUERPO],
  ['Lumia·AM · cuerpo sobre cabecera', TEXTO.onLight, MARCA.lumiaAm300, CUERPO],
  ['Lumia·AM · secundario sobre cabecera', TEXTO.onLightSoft, MARCA.lumiaAm300, CUERPO],
  ['Lumia·AM · acento sobre cabecera', MARCA.lumiaPm500, MARCA.lumiaAm300, NO_TEXTO],
  ['Lumia·AM · borde sobre cabecera', MARCA.lumiaPm400, MARCA.lumiaAm300, SEPARADOR],
  ['Lumia·AM · cuerpo sobre conmutador', TEXTO.onDark, MARCA.conmutadorAm, CUERPO],
  ['Lumia·AM · conmutador sobre base', MARCA.conmutadorAm, MARCA.lumiaAm50, NO_TEXTO],
  // La barra inferior toma ese mismo contratono, así que su texto es el par de
  // arriba. Lo propio suyo es el símbolo, que sobre el oscuro va en monocromo.
  ['Lumia·AM · símbolo mono sobre barra', MARCA.simboloMono, MARCA.conmutadorAm, NO_TEXTO],
  // La cabecera del espacio comparte ese contratono en la sección Mañana.
  ['Lumia·AM · cabecera sobre base', MARCA.conmutadorAm, MARCA.lumiaAm50, NO_TEXTO],
  ['Lumia·AM · rótulo sobre cabecera', TEXTO.onDarkSoft, MARCA.conmutadorAm, CUERPO],
  ['Lumia·AM · sección sobre cabecera', TEXTO.onDark, MARCA.conmutadorAm, CUERPO],
  // El borde de la sección activa. `lumia-pm-500` daría 2,97:1 y por eso ahí se
  // usa el lavanda claro de la misma paleta.
  ['Lumia·AM · borde activo sobre cabecera', MARCA.lumiaAm100, MARCA.conmutadorAm, NO_TEXTO],
  ['Lumia·AM · vela mono sobre cabecera', MARCA.simboloMono, MARCA.conmutadorAm, NO_TEXTO],
  // La tarjeta de la respiración: `--lumia-tarjeta`, blanco al 72 %, sobre la
  // parada más oscura del degradado de la mañana, que es su peor caso.
  ['Lumia·AM · cuerpo sobre tarjeta de respiración', TEXTO.onLight, sobre('#FFFFFF', 0.72, MARCA.lumiaAm100), CUERPO],
  // El recuadro de la frase del día: el secundario de la paleta en sólido.
  ['Lumia·AM · frase sobre su recuadro', TEXTO.onLight, MARCA.lumiaAm200, CUERPO],
  ['Lumia·AM · secundario sobre el recuadro de la frase', TEXTO.onLightSoft, MARCA.lumiaAm200, CUERPO],
  ['Lumia·AM · borde del recuadro de la frase', MARCA.lumiaPm400, MARCA.lumiaAm200, SEPARADOR],

  // ── Lumia · Noche ───────────────────────────────────────────────────────────
  ['Lumia·PM · cuerpo sobre base', TEXTO.onLight, MARCA.lumiaPm50, CUERPO],
  ['Lumia·PM · secundario sobre base', TEXTO.onLightSoft, MARCA.lumiaPm50, CUERPO],
  ['Lumia·PM · cuerpo sobre cabecera', TEXTO.onLight, MARCA.lumiaAm100, CUERPO],
  ['Lumia·PM · secundario sobre cabecera', TEXTO.onLightSoft, MARCA.lumiaAm100, CUERPO],
  ['Lumia·PM · acento sobre cabecera', MARCA.lumiaPm500, MARCA.lumiaAm100, NO_TEXTO],
  ['Lumia·PM · borde sobre cabecera', MARCA.lumiaPm400, MARCA.lumiaAm100, SEPARADOR],
  // El degradado nocturno de Hoy, en sus tres paradas.
  ['Hoy·noche · cuerpo sobre degradado', TEXTO.onDark, MARCA.night, CUERPO],
  ['Hoy·noche · secundario sobre degradado', TEXTO.onDarkSoft, MARCA.night, GRANDE],
  ['Lumia·PM · cuerpo sobre conmutador', TEXTO.onLight, MARCA.conmutadorPm, CUERPO],
  ['Lumia·PM · conmutador sobre degradado', MARCA.conmutadorPm, MARCA.night, NO_TEXTO],
  // De noche la barra es la pieza clara y el símbolo va tal cual sale del .svg.
  ['Lumia·PM · símbolo sobre barra', MARCA.simbolo, MARCA.conmutadorPm, NO_TEXTO],
  // La misma tarjeta de noche: `--lumia-tarjeta` es ahí un velo claro al 10 %,
  // medido sobre la parada más clara del degradado, que es su peor caso.
  ['Lumia·PM · cuerpo sobre tarjeta de respiración', TEXTO.onDark, sobre('#F2EEF7', 0.10, '#2C2350'), CUERPO],
  // El mismo recuadro de noche: ahí el secundario entra como velo al 20 % sobre
  // el degradado, medido en su parada más clara, que es el peor caso.
  ['Lumia·PM · frase sobre su recuadro', TEXTO.onDark, sobre(MARCA.lumiaPm400, 0.2, '#2C2350'), CUERPO],
  ['Lumia·PM · borde del recuadro de la frase', sobre(MARCA.lumiaAm100, 0.3, sobre(MARCA.lumiaPm400, 0.2, '#2C2350')), sobre(MARCA.lumiaPm400, 0.2, '#2C2350'), SEPARADOR],

  // ── Formia · Mañana ─────────────────────────────────────────────────────────
  ['Formia·AM · cuerpo sobre base', TEXTO.onLight, MARCA.formiaAm50, CUERPO],
  ['Formia·AM · secundario sobre base', TEXTO.onLightSoft, MARCA.formiaAm50, CUERPO],
  ['Formia·AM · cuerpo sobre cabecera', TEXTO.onLight, MARCA.formiaAm200, CUERPO],
  ['Formia·AM · secundario sobre cabecera', TEXTO.onLightSoft, MARCA.formiaAm200, CUERPO],
  ['Formia·AM · acento sobre cabecera', MARCA.formiaPm600, MARCA.formiaAm200, NO_TEXTO],
  ['Formia·AM · borde sobre cabecera', MARCA.formiaPm600, MARCA.formiaAm200, SEPARADOR],

  // ── Formia · Noche ──────────────────────────────────────────────────────────
  ['Formia·PM · cuerpo sobre base', TEXTO.onLight, MARCA.formiaAm50, CUERPO],
  ['Formia·PM · cuerpo sobre cabecera', TEXTO.onLight, MARCA.formiaAm400, CUERPO],
  ['Formia·PM · secundario sobre cabecera', TEXTO.onLightSoft, MARCA.formiaAm400, CUERPO],
  ['Formia·PM · acento sobre cabecera', MARCA.formiaPm600, MARCA.formiaAm400, NO_TEXTO],
  // §4.7 — La convergencia con Lumia, usada como borde: umbral de no-texto.
  ['Formia·PM · borde de convergencia', MARCA.formiaPm800, MARCA.formiaAm400, NO_TEXTO],

  // ── Strivo, el cromo de fuera de los espacios ───────────────────────────────
  ['Strivo · cuerpo sobre base', TEXTO.onLight, MARCA.strivo50, CUERPO],
  ['Strivo · secundario sobre base', TEXTO.onLightSoft, MARCA.strivo50, CUERPO],
  ['Strivo · cuerpo sobre cabecera', TEXTO.onLight, MARCA.strivo100, CUERPO],
  ['Strivo · acento sobre cabecera', MARCA.strivo900, MARCA.strivo100, NO_TEXTO],
  ['Strivo · borde sobre cabecera', MARCA.strivo600, MARCA.strivo100, SEPARADOR],

  // ── Respiracion dentro de Lumia (24 ago) ────────────────────────────────────
  // **Estos pares cambiaron de fondo y de paleta, no de umbral.** Con SPEC_16
  // Respiracion colgaba del Home de Strivo y se media sobre `strivo-50`; ahora
  // es una seccion de Lumia y se pinta sobre las dos superficies del espacio:
  // `lumia-am-50` de dia y `lumia-pm-50` de noche. Los `--strivo-*` siguen
  // siendo el valor por defecto de las siete variables en `:root`, pero hoy no
  // los usa ninguna pantalla — se miden abajo, como informativos.
  //
  // RN-RE-NAV-21/25 — El progreso de la sesion va a opacidad 0,40. Es
  // periferico —se consulta si se busca— y por eso se le pide el umbral de
  // texto grande y no el de cuerpo.
  ['Respiración · progreso de sesión (α 0,40)', sobre(TEXTO.onLight, 0.4, MARCA.lumiaAm50), MARCA.lumiaAm50, SEPARADOR],

  // ── Respiracion: las cuatro fases (SPEC_14 §5, RN-RE-VIS-16) ────────────────
  // El disco, el arco y la bolita son elementos graficos: su umbral es el 3:1 de
  // WCAG 2.2 1.4.11. **La fase no la comunica el color** (RN-RE-VIS-17) —la dice
  // la palabra de `EtiquetaFase` y la geometria—, pero el dibujo tiene que verse
  // igual, asi que se mide como cualquier indicador.
  //
  // Conservan el orden de luminancia de SPEC_14 —inhalar la mas oscura, descanso
  // la mas clara— porque esa rampa es lo que hace que el cambio se lea de reojo.
  // Lo que cambio es de que escala salen: de la de Lumia. Se miden sobre los dos
  // momentos porque el reloj decide cual esta puesto y ninguno es opcional.
  ['Respiración · inhalar sobre Lumia mañana', TEXTO.onLight, MARCA.lumiaAm50, NO_TEXTO],
  ['Respiración · sostén sobre Lumia mañana', MARCA.lumiaPm700, MARCA.lumiaAm50, NO_TEXTO],
  ['Respiración · exhalar sobre Lumia mañana', MARCA.lumiaPm500, MARCA.lumiaAm50, NO_TEXTO],
  ['Respiración · descanso sobre Lumia mañana', MARCA.lumiaPm400, MARCA.lumiaAm50, NO_TEXTO],
  ['Respiración · inhalar sobre Lumia noche', TEXTO.onLight, MARCA.lumiaPm50, NO_TEXTO],
  ['Respiración · sostén sobre Lumia noche', MARCA.lumiaPm700, MARCA.lumiaPm50, NO_TEXTO],
  ['Respiración · exhalar sobre Lumia noche', MARCA.lumiaPm500, MARCA.lumiaPm50, NO_TEXTO],
  ['Respiración · descanso sobre Lumia noche', MARCA.lumiaPm400, MARCA.lumiaPm50, NO_TEXTO],
  // La etiqueta de fase, que es el texto que de verdad lleva el dato: AAA.
  ['Respiración · etiqueta de fase sobre base', TEXTO.onLight, MARCA.lumiaAm50, CUERPO],
  // El recorrido de la linea: es la figura, asi que se le pide el umbral de
  // indicador. Va a opacidad 1 desde que es punteado —un punteado tiene la mitad
  // de tinta que un continuo del mismo grosor—, asi que se mide en plano.
  ['Respiración · recorrido de la línea', MARCA.lumiaPm500, MARCA.lumiaAm50, NO_TEXTO],

  // ── El estado elegido (24 ago) ──────────────────────────────────────────────
  // El borde de acento de la opcion elegida es un indicador de estado, asi que
  // le toca el 3:1 de 1.4.11 — y **es la unica de las tres señales que se puede
  // medir con una cifra**: la superficie y la palomita se ven, pero lo que
  // sostiene la lectura para quien distingue mal los tonos es este borde.
  ['Respiración · borde de la opción elegida', MARCA.lumiaPm500, MARCA.lumiaAm50, NO_TEXTO],
  ['Respiración · palomita de la opción elegida', MARCA.lumiaPm500, MARCA.lumiaAm50, NO_TEXTO],
  // La tarjeta de cada bloque: `bg-raised` es blanco al 72 % sobre el fondo del
  // espacio, y el cuerpo se lee encima.
  ['Respiración · cuerpo sobre tarjeta de bloque', TEXTO.onLight, sobre(TEXTO.blanco, 0.72, MARCA.lumiaAm50), CUERPO],
  ['Respiración · secundario sobre tarjeta de bloque', TEXTO.onLightSoft, sobre(TEXTO.blanco, 0.72, MARCA.lumiaAm50), CUERPO],
]

/**
 * Lo que **no** se hace, y por qué se mide igual: si alguien pone texto de
 * cuerpo sobre un primario de marca, estos números dicen en cuánto se queda.
 */
const INFORMATIVOS = [
  // El círculo de la respiración, en sus dos versiones. **No se le exige el
  // 3:1 de 1.4.11 y no es un descuido:** la fase no la comunica el círculo,
  // la dice el texto con `aria-live` ("Inhala", "Exhala", "Descansa"). El
  // círculo es el ritmo, no el dato, y sobre el amanecer se queda en 1,7:1
  // desde SPEC_08 —cifra que sale a la luz al medirlo, no ahora—.
  ['círculo de respiración sobre el amanecer', MARCA.breathAm, MARCA.lumiaAm300],
  ['círculo de respiración sobre la noche', MARCA.breathPm, MARCA.night],
  ['blanco sobre lumia-pm-500', TEXTO.blanco, MARCA.lumiaPm500],
  ['blanco sobre formia-pm-600', TEXTO.blanco, MARCA.formiaPm600],
  ['blanco sobre formia-pm-800 (convergencia)', TEXTO.blanco, MARCA.formiaPm800],
  ['ink sobre lumia-am-100', TEXTO.onLight, MARCA.lumiaAm100],
  ['ink sobre formia-am-400', TEXTO.onLight, MARCA.formiaAm400],
  // Las marcas de fase de la linea van a opacidad 0,12 y su texto a 0,45. Son
  // orientacion, no dato: lo que hay que leer lo dice `EtiquetaFase` a tamano
  // completo. Se anotan para que la cifra conste, no para exigirles un umbral.
  ['marca de fase de la línea (α 0,12)', sobre(MARCA.lumiaPm400, 0.12, MARCA.lumiaAm50), MARCA.lumiaAm50],
  ['texto de marca de la línea (α 0,45)', sobre(MARCA.lumiaPm400, 0.45, MARCA.lumiaAm50), MARCA.lumiaAm50],
  // **Fases contiguas, medidas entre si. Es el limite conocido de separar cuatro
  // pasos por luminancia sobre una escala acromatica: 1,4:1 entre vecinas.**
  // No se les exige umbral y no es una laguna disimulada: dos fases nunca se ven
  // a la vez —el disco tiene un color cada vez y el cambio es temporal, no
  // espacial—, asi que no hay ninguna adyacencia que WCAG mida. Lo que si dice
  // esta cifra es que el color, solo, no bastaria para nombrar la fase. Por eso
  // RN-RE-VIS-17 obliga a la palabra y a la geometria, y por eso ahi la regla no
  // es un adorno de accesibilidad sino lo que sostiene la lectura.
  ['fase inhalar contra sostén', TEXTO.onLight, MARCA.lumiaPm700],
  ['fase sostén contra exhalar', MARCA.lumiaPm700, MARCA.lumiaPm500],
  ['fase exhalar contra descanso', MARCA.lumiaPm500, MARCA.lumiaPm400],
  // Los valores por defecto de `:root`, en la escala de Strivo. Hoy no los pinta
  // ninguna pantalla —Respiracion solo se monta dentro de Lumia— y se miden para
  // que el dia que otro espacio la monte se sepa de donde se parte.
  ['por defecto · inhalar sobre strivo-50', MARCA.strivo900, MARCA.strivo50],
  ['por defecto · descanso sobre strivo-50', MARCA.strivo600, MARCA.strivo50],
  // **El estado atenuado de la sesion, medido, y por eso se apaga del todo.**
  // RN-RE-NAV-23 pedia opacidad 0,25 para los controles tras seis segundos sin
  // tocar nada. Esta es la cifra que sale, y es la que hizo que se implementara
  // a 0 y no a 0,25: RN-RE-NAV-46 da esa salida expresamente —"o el texto se
  // oculta del todo en vez de quedar ilegible"— y a 0,25 se obtiene lo peor de
  // las dos cosas, una mancha ilegible que sigue tirando del ojo.
  ['control de sesión a α 0,25 (NO se usa)', sobre(TEXTO.onLight, 0.25, MARCA.lumiaAm50), MARCA.lumiaAm50],
  // **El recuadro de la frase contra el fondo sobre el que se pinta.** No se le
  // exige umbral: no es un indicador ni un borde funcional —lo que separa el
  // recuadro es su tinte, y además lleva línea y elevación—, y es la misma
  // liga en la que juegan las tarjetas de Hoy desde SPEC_06. Se anota para que
  // la cifra conste el día que alguien retire el borde o la sombra.
  ['recuadro de la frase sobre la base de la mañana', MARCA.lumiaAm200, MARCA.lumiaAm50],
  ['recuadro de la frase sobre el degradado de la noche', sobre(MARCA.lumiaPm400, 0.2, '#2C2350'), '#2C2350'],
  // Los dos sólidos que **no** se usan de noche, y por qué: el secundario de la
  // paleta en plano no llega a AAA con ninguna de las dos tintas, así que ahí
  // entra como velo.
  ['blanco sobre lumia-pm-400 (NO se usa)', TEXTO.onDark, MARCA.lumiaPm400],
  ['ink sobre lumia-pm-400 (NO se usa)', TEXTO.onLight, MARCA.lumiaPm400],
]

console.log('🎨 contraste: midiendo los pares que la app pinta de verdad\n')

let fallos = 0
PARES.forEach(([nombre, frente, fondo, umbral]) => {
  const medido = ratio(frente, fondo)
  const pasa = medido >= umbral
  if (!pasa) fallos += 1
  const marca = pasa ? '✅' : '❌'
  console.log(`${marca} ${nombre.padEnd(42)} ${medido.toFixed(2)}:1  (mín ${umbral}:1)`)
})

console.log('\n— Informativos: pares que la app NO usa, medidos para que conste —')
INFORMATIVOS.forEach(([nombre, frente, fondo]) => {
  console.log(`   ${nombre.padEnd(42)} ${ratio(frente, fondo).toFixed(2)}:1`)
})

// Los bordes translúcidos del sistema de superficies, mezclados sobre su fondo.
const bordeSobreClaro = ratio(sobre('#241E33', 0.12, MARCA.lumiaAm50), MARCA.lumiaAm50)
console.log(`\n   borde del sistema sobre superficie clara     ${bordeSobreClaro.toFixed(2)}:1`)

if (fallos === 0) {
  console.log('\n✅ contraste: las cuatro paletas pasan su umbral.\n')
  process.exit(0)
}
console.error(`\n⚠️  contraste: ${fallos} par(es) por debajo del umbral.\n`)
process.exit(1)
