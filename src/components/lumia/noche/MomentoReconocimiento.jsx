// src/components/lumia/noche/MomentoReconocimiento.jsx
// Momento 1 — "¿Qué quiero reconocer de hoy?".
//
// **Reconocer no es agradecer**, y ese es todo el cambio. La pregunta anterior
// —"¿Qué agradezco de este día?"— dejaba fuera el día que costó: quien lo
// atravesó a duras penas no tenía dónde ponerlo. Aquí cabe lo que se disfrutó,
// lo que se intentó, lo que se enfrentó y lo que simplemente se resolvió.
//
// **Abre con un solo campo.** Tres campos vacíos a la vez se leen como tres
// huecos por rellenar, y esto no es un formulario: el segundo y el tercero los
// pide quien escribe, tocando "Añadir otro". Hasta tres, cada uno guardado
// aparte, todos editables y ninguno obligatorio.
//
// **Sin ideas de apoyo.** La gratitud de la mañana las tiene porque nombrar algo
// que agradecer puede costar; aquí la pregunta ya trae su propio abanico en el
// texto de apoyo, y una lista de sugerencias encima sería decirle a alguien de
// qué tiene que hablar su día.

import FilasDinamicas from '../FilasDinamicas'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { LIMITES } from '@/lumia/filas'
import { MAX_RECONOCIMIENTO_LINEA } from '@/lumia/noche'

const textos = copy.diario.noche.reconocimiento

export default function MomentoReconocimiento({ filas, onCambiar, onVolcar, onOmitir }) {
  const enBlanco = filas.every((fila) => String(fila.texto ?? '').trim() === '')

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{textos.lead}</p>
      </div>

      <FilasDinamicas
        filas={filas}
        limites={LIMITES.reconocimiento}
        onCambiar={onCambiar}
        onVolcar={onVolcar}
        etiqueta={textos.titulo}
        placeholder={textos.placeholder}
        maxLength={MAX_RECONOCIMIENTO_LINEA}
        textoAnadir={textos.anadir}
        // Una lista de tres no necesita que le anuncien que llegó al final: se
        // ve. La frase del tope es de una lista que puede llegar a diez.
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
