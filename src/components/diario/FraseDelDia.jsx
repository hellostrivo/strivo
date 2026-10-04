// src/components/diario/FraseDelDia.jsx
// La frase del día (§5.3, Bloque 1 · RN-HOY-02).
//
// Es aire, no información: no se toca, no lleva acción y no pide nada. La elige
// `content/frases-del-dia.js` a partir de la fecha, de forma determinista y sin
// red.
//
// **Ahora tiene recuadro propio, y ese es el cambio.** Era una línea suelta
// entre el conmutador y la primera pregunta del Diario, y como línea suelta se
// leía igual que el resto del texto de la pantalla: pasaba por delante de los
// ojos sin ser una pausa. En un recuadro con su propia superficie deja de ser
// una frase más y pasa a ser el único sitio de Hoy donde no hay nada que hacer.
//
// **La superficie es el secundario de la paleta del momento**, no el blanco velado
// de las tarjetas: `--strivo-frase` es el rosa `strivo-am-200` en la mañana y un
// velo del lavanda `strivo-pm-400` en la noche. Es la única superficie teñida de
// la pantalla, así que se distingue de todo lo demás por color y no por otro
// escalón de luminancia — que es lo que la habría puesto a competir con la
// tarjeta de respiración (RN-HOY-07). Como en el resto del diario, el componente
// no nombra ni un color: pide su superficie por el papel que cumple y las dos
// atmósferas se resuelven en `globals.css` (RN-SURF-01).
//
// **En cursiva.** Es la marca de lo reflexivo y hoy no la lleva nada más en
// Hoy: la tarjeta de respiración la soltó al ganarla la frase. La cursiva es de
// verdad —`globals.css` carga los cortes itálicos de Inter—, no la inclinación
// que el navegador improvisa cuando no los encuentra.
//
// **El aire es parte del contenido.** Relleno generoso y un interlineado más
// suelto que el del resto de la pantalla: lo que se lee despacio se compone
// despacio.
//
// **Quién lo dijo va debajo, y solo cuando lo dijo alguien** (SPEC_29, 4 oct
// 2026). El repertorio tiene dos tipos de entrada y la diferencia no es de
// catálogo, es de quién habla: una cita reproduce a alguien —y va
// entrecomillada, con las mismas «» que la palabra propia en el resto del
// producto, y con autor, obra y ubicación debajo— y una original es voz de
// Strivo, así que va sin comillas **y sin pie**. Hasta la versión 2 las
// originales firmaban «Versión Strivo inspirada en…»; ya no: una idea que
// inspiró una frase no convierte a nadie en su autor, y un `figcaption` vacío
// anunciaría al lector de pantalla una atribución que no existe. Las comillas
// salen del copy y no del JSX: son la marca de estar citando, no un adorno de
// maquetación.
//
// **La tarjeta no dice qué referencias eligió nadie.** Ni etiqueta, ni insignia,
// ni enlace a Tu perfil: es aire, y quien la mira desde el hombro de otra
// persona no tiene por qué enterarse de qué tradición le habla.
//
// **La atribución es una segunda voz, no una segunda línea del mismo texto.**
// Baja un escalón de cuerpo, suelta la cursiva y pide el color secundario de la
// superficie. No baja de ahí: a 14 px el umbral que le toca sigue siendo AAA, y
// con el secundario tal como viene de serie el recuadro teñido de la noche se
// quedaba en 5,0:1. Eso se resuelve donde se conoce esa superficie —el CSS del
// sitio, que ahí sube el secundario al lavanda claro—, y no aquí: este archivo
// sigue sin nombrar un color ni saber a qué hora se pinta (RN-VIS-02).
//
// **Los versos se respetan.** Un tercio del repertorio son citas en verso y
// llevan sus saltos de línea escritos. `whitespace-pre-line` los pinta y sigue
// dejando que cada verso largo pase de renglón cuando no cabe: el alternativo
// —`pre`— habría sacado el texto por el costado en un teléfono estrecho.
//
// **El cuerpo es de 16 px, no de 20.** Lo que la distingue son el recuadro, el
// tinte y la cursiva, no el tamaño: con esos tres encima, 20 px la convertían
// en el titular de la pantalla y el saludo dejaba de serlo. Es el escalón que
// hay debajo en la escala —no existe uno intermedio y no se inventa—, así que
// coincide en cuerpo con la tarjeta de respiración y se separa de ella por
// todo lo demás.

import { copy, interpolate } from '@copy'

export default function FraseDelDia({ frase }) {
  if (!frase) return null

  const textos = copy.diario.hoy.frase
  const esCita = frase.tipo === 'cita'
  const atribuida = esCita && typeof frase.atribucion === 'string' && frase.atribucion !== ''

  return (
    <figure
      aria-label={textos.label}
      className="rounded-lg border border-strivo-frase bg-strivo-frase
                 px-6 py-6 shadow-elev-2 transicion-tema"
    >
      <blockquote
        className="whitespace-pre-line font-display text-base italic
                   leading-relaxed text-on-surface"
      >
        {esCita ? interpolate(textos.citaTemplate, { texto: frase.texto }) : frase.texto}
      </blockquote>
      {atribuida && (
        <figcaption className="mt-3 text-sm not-italic text-on-surface-soft">
          <span className="sr-only">{textos.atribucionLabel}</span>
          {frase.atribucion}
        </figcaption>
      )}
    </figure>
  )
}
