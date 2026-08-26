// src/components/onboarding/Chips.jsx
// Los chips del onboarding: la misma píldora del resto de la app.
//
// La forma sale de `components/shared/pildora.js`, que es de donde la toman
// también los catálogos del día y las pantallas de consulta. No es un detalle
// estético: lo que hace que releer lo escrito se parezca a haberlo escrito es
// que la respuesta tenga siempre el mismo aspecto, y eso empieza aquí, en la
// primera pregunta que alguien contesta.
//
// **Lo elegido no se distingue solo por color** (§10): cambia el borde, cambia
// la superficie, aparece una marca y el texto pasa a peso medio.
//
// Se anuncian con `aria-pressed` y **no como radios**: todos se sueltan
// tocándolos otra vez —que es como se deja una pregunta en blanco— y un radio
// no se deselecciona. Decirlo de otro modo sería mentirle a quien lo oye.
//
// Aquí no hay emojis. Los del día son vocabulario de quien nombra su propio
// estado; estas son opciones de una pregunta, y ponerles cara sería la app
// opinando sobre lo que alguien vino a buscar.

import { clsx } from 'clsx'
import { PILDORA, PILDORA_ELEGIDA, PILDORA_LIBRE } from '@components/shared/pildora'

/** La marca de lo elegido. No es copy: es un signo, y va oculto al lector. */
const MARCA = '✓'

export function Chip({ texto, elegido = false, punteado = false, onTocar }) {
  return (
    <button
      type="button"
      aria-pressed={elegido}
      onClick={onTocar}
      className={clsx(
        PILDORA,
        'transition-all duration-180 ease-smooth motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
        elegido ? PILDORA_ELEGIDA : PILDORA_LIBRE,
        punteado && !elegido && 'border-dashed',
      )}
    >
      {elegido && (
        <span aria-hidden="true" className="text-sm opacity-70">
          {MARCA}
        </span>
      )}
      <span>{texto}</span>
    </button>
  )
}

/**
 * Una lista de chips con su etiqueta de grupo.
 *
 * @param {Array<{id: string, texto: string}>} opciones
 * @param {string[]} elegidas - ids elegidos. Una sola, o varias: quien monta
 *   la lista decide cuántas caben, y la regla vive en su módulo, no aquí.
 */
export function ListaDeChips({ etiqueta, opciones, elegidas = [], punteados = [], onTocar }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={etiqueta}>
      {opciones.map((opcion) => (
        <Chip
          key={opcion.id}
          texto={opcion.texto}
          elegido={elegidas.includes(opcion.id)}
          punteado={punteados.includes(opcion.id)}
          onTocar={() => onTocar(opcion.id)}
        />
      ))}
    </div>
  )
}
