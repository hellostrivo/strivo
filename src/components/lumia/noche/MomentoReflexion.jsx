// src/components/lumia/noche/MomentoReflexion.jsx
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
// El campo abre con tres líneas y crece con el texto. No hay contador de
// caracteres a la vista: un número que sube mientras alguien escribe sobre su
// día es una vigilancia, no una ayuda.

import { clsx } from 'clsx'
import { CampoTexto } from '../Campo'
import { copy } from '@copy'
import { MAX_REFLEXION } from '@/lumia/noche'

const textos = copy.lumia.diario.noche.reflexion

export default function MomentoReflexion({ pregunta, valor, onCambiar, onVolcar, onOmitir }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-on-surface-soft">{textos.opcional}</p>
        <h2 className="font-display text-md text-on-surface">{pregunta.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{pregunta.lead}</p>
      </div>

      <CampoTexto
        filas={3}
        value={valor}
        maxLength={MAX_REFLEXION}
        onChange={(evento) => onCambiar(evento.target.value)}
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
