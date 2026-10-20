// src/components/diario/noche/MomentoReflexion.jsx
// Momento 2 — la reflexión de esta noche.
//
// **Una sola pregunta, y distinta de una noche a otra.** La larga de antes
// —"¿Qué aprendí hoy de mí, de los demás o de la vida?"— llegaba igual todas
// las noches y pedía una conclusión; a la tercera noche dejaba de leerse. Cuál
// toca lo decide `nocheReflexion.js`, no este componente: aquí solo se pinta la
// que llegue.
//
// **Lleva su "Opcional" a la vista y su propia salida.** Nada bloquea: se puede
// pasar de largo sin escribir una palabra y la noche se cierra igual.
//
// El campo abre con tres líneas, crece con el texto y cabe en cuatrocientas
// palabras (`CampoRespuesta`). No hay contador a la vista: un número que sube
// mientras alguien escribe sobre su día es una vigilancia, no una ayuda. Solo
// desde las trescientas se dice, en voz baja, cuántas quedan.

import { clsx } from 'clsx'
import { copy } from '@copy'
import CampoRespuesta from '../CampoRespuesta'

const textos = copy.diario.noche.reflexion

export default function MomentoReflexion({ pregunta, valor, onCambiar, onVolcar, onOmitir }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-on-surface-soft">{textos.opcional}</p>
        <h2 className="font-display text-md text-on-surface">{pregunta.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{pregunta.lead}</p>
      </div>

      <CampoRespuesta
        filas={3}
        value={valor}
        onCambiar={onCambiar}
        onBlur={onVolcar}
        placeholder={textos.placeholder}
        aria-label={pregunta.titulo}
      />

      <button
        type="button"
        onClick={onOmitir}
        className={clsx(
          'self-start rounded-full px-3 py-2 min-h-touch-sm text-sm',
          'text-on-surface-soft hover:text-on-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
        )}
      >
        {textos.omitir}
      </button>
    </section>
  )
}
