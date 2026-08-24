// src/components/lumia/TarjetaRespiracion.jsx
// La entrada al ejercicio de respiración desde la pantalla Hoy.
//
// **Era un enlace y ahora es una tarjeta.** Como línea de texto bajo el
// conmutador se leía en el registro con el que se pintan las ayudas y los pies
// de campo —secundario, informativo— y se pasaba por alto. La respiración no
// es una nota al pie de la pantalla: es una herramienta que alguien puede
// necesitar justo al abrirla, y tiene que encontrarse sin buscarla.
//
// **La misma pieza en las dos secciones**, sin ramas: lo que cambia entre la
// mañana y la noche es la paleta, no el destino ni la forma. No recibe el
// momento ni lo consulta —se viste con los tokens de superficie del tema que
// tenga encima—, así que este archivo no nombra ni un color (RN-SURF-01) y las
// dos atmósferas se resuelven solas.
//
// **Destaca por luminancia, no por borde** (RN-HOY-07): `bg-lumia-tarjeta` es
// el escalón más claro del momento —por encima de `bg-lumia-campo`, que es el
// de los bloques del Diario de más abajo— y la elevación la separa del fondo.
// No compite con el conmutador porque aquel va en contratono y no juega en
// esta escala.
//
// **Toda la tarjeta es el control**, no un botón dentro de un recuadro: una
// caja con una zona tocable más pequeña que ella misma es una invitación que
// se retira en cuanto la aceptas.
//
// **Mide lo que mide su texto.** No se estira al ancho de la columna: se ciñe
// al rótulo y se alinea a la izquierda, debajo del conmutador y con su mismo
// borde de arranque. Un recuadro de borde a borde competía con los bloques del
// Diario, que sí ocupan la columna entera; ceñido, se lee como lo que es —una
// pieza suelta que se ofrece— y sigue siendo un blanco cómodo porque conserva
// los 56 px de alto.
//
// **Sin subtítulo y sin duración.** El rótulo es todo lo que hay: una segunda
// línea en gris devolvería la tarjeta al registro del que se la quiso sacar.
// Lo que dura se dice en la pantalla del ejercicio, antes del botón que lo
// arranca (RN-LU-RESP-01).
//
// **El rótulo baja a 16 px, en redonda y peso normal.** Estaba en cursiva a
// 20 px con peso de medio, un escalón por encima del conmutador, y con la
// frase del día metida en su recuadro había dos piezas disputándose el mismo
// sitio en la jerarquía. La tarjeta no necesita ser lo más llamativo de Hoy:
// necesita encontrarse sin buscarla, y eso ya lo hacen su superficie clara, su
// elevación y sus 56 px de alto. **La cursiva se retira entera de aquí**: es
// ahora la marca de la frase del día, y usarla en dos sitios la dejaría sin
// significar nada.

export default function TarjetaRespiracion({ etiqueta, onAbrir }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="self-start min-h-touch rounded-lg border border-on-surface bg-lumia-tarjeta
                 px-6 py-4 text-base font-normal text-on-surface
                 shadow-elev-2 transicion-tema
                 transition-shadow duration-260 ease-smooth
                 hover:shadow-elev-4 active:shadow-elev-1
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30
                 motion-reduce:transition-none"
    >
      {etiqueta}
    </button>
  )
}
