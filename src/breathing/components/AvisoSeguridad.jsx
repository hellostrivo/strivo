// src/breathing/components/AvisoSeguridad.jsx
// La nota de seguridad de la primera vez (RN-RE-COPY-01/02/03).
//
// **Una tarjeta que se descarta con un toque, no un modal que bloquea.** La
// diferencia no es de estilo: un modal obliga a leer y aceptar antes de poder
// hacer nada, y quien abre esto puede estar en mitad de una crisis de ansiedad.
// Ponerle una puerta delante es exactamente el gesto contrario al del producto.
//
// Sin lenguaje médico y sin pedir que se acepte nada. Dice lo único que hace
// falta —si te mareas, para— y se quita de en medio.
//
// Aparece **dentro** de la pantalla y no como pantalla previa (RN-RE-NAV-35).
// Después de descartada, solo vuelve desde el ícono de información.
//
// Lleva el borde de marca del espacio (`border-espacio`) y no el heredado de la
// superficie: es la única pieza de esta pantalla que tiene que destacar sobre
// las tarjetas de ajustes, y destaca por el borde porque la superficie ya la
// comparte con ellas.

import { copy } from '@copy'

export default function AvisoSeguridad({ onDescartar }) {
  const textos = copy.respiracion.seguridad

  return (
    <aside
      className="flex flex-col gap-3 rounded-lg border border-espacio bg-raised p-4"
      role="note"
    >
      <p className="text-sm text-on-surface">{textos.aviso}</p>
      <button
        type="button"
        onClick={onDescartar}
        className="min-h-touch self-start rounded-full border border-espacio px-5 text-sm text-on-surface"
      >
        {textos.entendido}
      </button>
    </aside>
  )
}
