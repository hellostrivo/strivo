// src/components/presentacion/Visuales.jsx
// Las cuatro composiciones de la presentación, una por sección.
//
// **Cuatro dibujos distintos y no uno recoloreado cuatro veces.** Cada uno
// habla de lo suyo con una geometría propia: arcos que se acercan, páginas
// superpuestas, anillos abiertos y marcas que descienden. Hay una prueba que
// compara los cuatro trazados y falla si dos se parecen demasiado, porque la
// forma más fácil de que un carrusel se sienta un trámite es que las cuatro
// pantallas sean la misma con otro tono.
//
// **Ni un color escrito aquí** (RN-VIS-02). Las piezas piden tres papeles
// —trazo, profundo y cálido— y quien decide qué tono es cada uno es el tema,
// que es el único que sabe qué hora es (`globals.css`). Por eso el mismo dibujo
// se lee sobre la crema de la mañana y sobre el índigo de la noche sin una sola
// rama en el componente.
//
// **Vectores y nada más**: ni una imagen, ni una fuente, ni un recurso remoto.
// Son cuatro `<svg>` en línea que pesan lo que pesa su marcado, así que no
// añaden un solo byte al arranque de la app.
//
// **Son decorativos y van ocultos al lector de pantalla.** Lo que hay que leer
// lo dicen el título y la frase de cada tarjeta: un dibujo abstracto descrito
// en voz alta no informa, entretiene. Es el mismo criterio que el de los emojis
// de los catálogos.
//
// El lienzo es cuadrado y de 200 en los cuatro, así que las tarjetas ocupan
// exactamente el mismo sitio y nada salta al pasar de una a otra.

const LIENZO = '0 0 200 200'

/** Lo que comparten los cuatro: el lienzo, la ausencia de voz y el encaje. */
function Lienzo({ children }) {
  return (
    // `h-full w-full` con `preserveAspectRatio` por defecto: la composición se
    // encaja entera en el hueco que le den, nunca se recorta y no lleva ni una
    // medida en píxeles fijos (RN-VIS-06). Un teléfono de 320 y un portátil no
    // tienen la misma forma, y esto se abre en los dos.
    <svg
      viewBox={LIENZO}
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

/**
 * Hoy — la mañana y la noche acercándose, con algo encendido en medio.
 *
 * Dos arcos amplios que no llegan a tocarse: el de arriba lleva el tono cálido
 * del día, el de abajo el profundo de la noche, y entre los dos queda el hueco
 * donde va el punto de luz. **Ni sol ni luna**: lo que dice "mañana" y "noche"
 * es el color y la posición, no un símbolo del cielo.
 *
 * El hueco entre los dos arcos es el asunto de la composición. Es el momento de
 * volver a ti, y por eso está vacío salvo por un punto pequeño: si se llenara,
 * la tarjeta pasaría a hablar de lo que hay que hacer ahí dentro.
 */
export function VisualHoy() {
  return (
    <Lienzo>
      <circle cx="100" cy="102" r="66" className="relleno-presentacion-calido" opacity="0.16" />

      {/* El arco del día: una línea fina sobre un trazo ancho y suave del mismo
          tono cálido, que es lo que le da cuerpo sin cerrar la forma. */}
      <path
        d="M 26 46 A 92 92 0 0 0 174 46"
        className="trazo-presentacion-calido"
        strokeWidth="17"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 26 46 A 92 92 0 0 0 174 46"
        className="trazo-presentacion"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* El de la noche, más sobrio: un solo trazo del tono profundo. */}
      <path
        d="M 26 158 A 92 92 0 0 1 174 158"
        className="trazo-presentacion-profundo"
        strokeWidth="9"
        strokeLinecap="round"
      />

      <circle
        cx="100"
        cy="102"
        r="16"
        className="trazo-presentacion"
        strokeWidth="1.5"
        opacity="0.45"
      />
      <circle cx="100" cy="102" r="5.5" className="relleno-presentacion" />
    </Lienzo>
  )
}

/**
 * Journal — dos páginas superpuestas y un cierre diminuto.
 *
 * El candado es de línea y del tamaño de una uña, a propósito: lo que se guarda
 * aquí es íntimo, no confidencial. Un candado grande, un escudo o una llave
 * traerían el vocabulario de la seguridad bancaria a la única pantalla del
 * producto donde el sistema está mudo.
 *
 * Las tres líneas de dentro son curvas y desiguales, y no llegan al borde: es
 * escritura a mano insinuada, no un cuaderno de renglones.
 */
export function VisualJournal() {
  return (
    <Lienzo>
      {/* La página de atrás, apenas girada: dos hojas que reposan una sobre
          otra nunca quedan alineadas. */}
      <rect
        x="34"
        y="28"
        width="104"
        height="132"
        rx="14"
        className="relleno-presentacion-calido"
        opacity="0.28"
        transform="rotate(-7 86 94)"
      />
      <rect
        x="34"
        y="28"
        width="104"
        height="132"
        rx="14"
        className="trazo-presentacion-profundo"
        strokeWidth="2"
        opacity="0.55"
        transform="rotate(-7 86 94)"
      />

      {/* La de delante, que es la que se escribe. */}
      <rect
        x="58"
        y="44"
        width="104"
        height="132"
        rx="14"
        className="relleno-presentacion-calido"
        opacity="0.2"
        transform="rotate(4 110 110)"
      />
      <rect
        x="58"
        y="44"
        width="104"
        height="132"
        rx="14"
        className="trazo-presentacion"
        strokeWidth="3"
        transform="rotate(4 110 110)"
      />

      <g
        className="trazo-presentacion"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
        transform="rotate(4 110 110)"
      >
        <path d="M 78 82 C 98 76 118 88 140 80" />
        <path d="M 78 106 C 96 100 112 110 132 104" />
        <path d="M 78 130 C 92 126 104 132 118 128" />
      </g>

      {/* El cierre: un arco y un cuerpo, del tamaño de una uña. */}
      <g transform="rotate(4 110 110)">
        <path
          d="M 128 150 a 8 8 0 0 1 16 0 v 5"
          className="trazo-presentacion-profundo"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <rect
          x="126"
          y="155"
          width="20"
          height="14"
          rx="4"
          className="relleno-presentacion-profundo"
        />
      </g>
    </Lienzo>
  )
}

/**
 * Respiración — anillos abiertos y algo que se ensancha muy despacio.
 *
 * Tres anillos que no cierran: el aire entra y sale, no da vueltas. El hueco de
 * los tres mira al mismo sitio, así que la forma tiene un abajo y no es un
 * blanco de tiro.
 *
 * El centro respira con `.aliento-presentacion`, doce segundos por ciclo —más
 * lento que cualquier patrón real de la sección— y **no pide que se le espere**:
 * la tarjeta se pasa en cualquier momento del ciclo y no hay nada que leer
 * dentro de la forma. Con "reducir movimiento" se queda quieto (RN-VIS-05).
 */
export function VisualRespiracion() {
  return (
    <Lienzo>
      <g className="trazo-presentacion" strokeLinecap="round" fill="none">
        <path d="M 62 181.6 A 90 90 0 1 1 138 181.6" strokeWidth="2" opacity="0.4" />
        <path d="M 62 156.4 A 68 68 0 1 1 138 156.4" strokeWidth="3" opacity="0.65" />
        <path d="M 62 125.9 A 46 46 0 1 1 138 125.9" strokeWidth="4.5" />
      </g>

      <g className="aliento-presentacion">
        <circle cx="100" cy="100" r="21" className="relleno-presentacion-calido" opacity="0.75" />
        <circle
          cx="100"
          cy="100"
          r="21"
          className="trazo-presentacion"
          strokeWidth="2.5"
          fill="none"
        />
      </g>
    </Lienzo>
  )
}

/**
 * Historial — marcas que descienden con calma por una línea.
 *
 * Cinco marcas de tamaños distintos y a distancias distintas, sobre una línea
 * que se curva. **No es una cuadrícula y no es una cuenta**: si estuvieran
 * alineadas y fueran iguales, la composición diría cuántas hay y cuántas
 * faltan, que es exactamente lo que el Historial no hace (RN-HIS-01).
 *
 * Tres son hojas y dos son puntos, porque los días no dejan todos la misma
 * marca. La línea no llega a ninguno de los dos extremos del lienzo: no empieza
 * ni termina en ningún sitio.
 */
export function VisualHistorial() {
  const hoja = 'M 0 0 C 10 -8 24 -3 26 10 C 15 18 2 12 0 0 Z'

  return (
    <Lienzo>
      <path
        d="M 48 176 C 74 148 88 128 106 100 S 140 52 154 28"
        className="trazo-presentacion-profundo"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.3"
      />

      <g className="relleno-presentacion-calido" opacity="0.85">
        <path d={hoja} transform="translate(52 158) rotate(-22) scale(1.15)" />
        <path d={hoja} transform="translate(104 84) rotate(-46) scale(0.86)" />
      </g>

      <g className="relleno-presentacion-profundo">
        <path d={hoja} transform="translate(78 122) rotate(-34) scale(1)" />
      </g>

      <g className="relleno-presentacion">
        <circle cx="128" cy="62" r="6.5" />
        <circle cx="152" cy="30" r="4" opacity="0.6" />
      </g>
    </Lienzo>
  )
}

/**
 * El dibujo de cada tarjeta, por su identificador.
 *
 * Es la tercera lista que `presentacion/tarjetas.js` enlaza —copy, orden y
 * dibujo—, y por eso se busca por el mismo id que las otras dos. Una prueba
 * falla si una tarjeta se queda sin la suya.
 */
export const VISUALES = Object.freeze({
  hoy: VisualHoy,
  journal: VisualJournal,
  respiracion: VisualRespiracion,
  historial: VisualHistorial,
})

export default VISUALES
