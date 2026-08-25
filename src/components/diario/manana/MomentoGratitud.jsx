// src/components/diario/manana/MomentoGratitud.jsx
// Momento 2 — gratitud.
//
// **Abre con un solo campo.** Tres campos vacíos a la vez se leen como tres
// huecos por rellenar, y esto no es un formulario: el segundo y el tercero los
// pide quien escribe, tocando "Añadir otro". Hasta tres, cada uno guardado
// aparte, y ninguno obligatorio.
//
// **Las ideas de apoyo se conservan tal cual estaban.** Se ofrecen bajo el
// renglón enfocado tras cinco segundos sin escribir en él, nunca rellenan el
// campo y se callan tras dos "Ahora no". Es el mismo `CampoGratitud` de la
// noche con otros límites: la actualización cambió la pregunta y la forma de la
// lista, no el momento en que a alguien le cuesta arrancar.
//
// El ejemplo del marcador de posición es deliberadamente cotidiano: no da por
// hecho que la mañana esté siendo buena, y por eso no ofrece nada
// especialmente luminoso.

import CampoGratitud from '../CampoGratitud'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { LIMITES } from '@/diario/filas'
import { MAX_GRATITUD_LINEA } from '@/diario/manana'

const textos = copy.diario.manana.gratitud

export default function MomentoGratitud({ filas, onCambiar, onVolcar, onOmitir }) {
  const enBlanco = filas.every((fila) => String(fila.texto ?? '').trim() === '')

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{textos.lead}</p>
      </div>

      <CampoGratitud
        filas={filas}
        limites={LIMITES.gratitudManana}
        onCambiar={onCambiar}
        onVolcar={onVolcar}
        sugerencias={textos.sugerencias}
        etiqueta={textos.titulo}
        placeholder={textos.placeholder}
        maxLength={MAX_GRATITUD_LINEA}
        textoAnadir={textos.anadir}
        textoTope={null}
      />

      {/* Solo con todo en blanco: si ya hay algo escrito, "omitir" sonaría a
          descartarlo. Sigue adelante sin borrar nada y sin dejar rastro. */}
      {enBlanco && (
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
      )}
    </section>
  )
}
