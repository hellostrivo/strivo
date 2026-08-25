// src/components/lumia/FraseDelDia.jsx
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
// **La superficie es el secundario de la paleta de Lumia**, no el blanco velado
// de las tarjetas: `--lumia-frase` es el rosa `lumia-am-200` en la mañana y un
// velo del lavanda `lumia-pm-400` en la noche. Es la única superficie teñida de
// la pantalla, así que se distingue de todo lo demás por color y no por otro
// escalón de luminancia — que es lo que la habría puesto a competir con la
// tarjeta de respiración (RN-HOY-07). Como en el resto de Lumia, el componente
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
// **El cuerpo es de 16 px, no de 20.** Lo que la distingue son el recuadro, el
// tinte y la cursiva, no el tamaño: con esos tres encima, 20 px la convertían
// en el titular de la pantalla y el saludo dejaba de serlo. Es el escalón que
// hay debajo en la escala —no existe uno intermedio y no se inventa—, así que
// coincide en cuerpo con la tarjeta de respiración y se separa de ella por
// todo lo demás.

import { copy } from '@copy'

export default function FraseDelDia({ frase }) {
  if (!frase) return null

  return (
    <figure
      className="rounded-lg border border-lumia-frase bg-lumia-frase
                 px-6 py-6 shadow-elev-2 transicion-tema"
    >
      <figcaption className="sr-only">{copy.diario.hoy.frase.label}</figcaption>
      <blockquote className="font-display text-base italic leading-relaxed text-on-surface">
        {frase.texto}
      </blockquote>
    </figure>
  )
}
