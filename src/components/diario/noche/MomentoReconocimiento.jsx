// src/components/diario/noche/MomentoReconocimiento.jsx
// Momento 1 — la pregunta que abre la noche.
//
// **Reconocer no es agradecer**, y ese es todo el cambio de la actualización
// del 23 ago. La pregunta anterior —"¿Qué agradezco de este día?"— dejaba fuera
// el día que costó: quien lo atravesó a duras penas no tenía dónde ponerlo.
// Aquí cabe lo que se disfrutó, lo que se intentó, lo que se enfrentó y lo que
// simplemente se resolvió.
//
// **Y desde el 30 de agosto de 2026 se dice en el tono del día.** La pregunta
// llega hecha en `pregunta` y cambia con la emoción de cierre: a quien llega
// cansado o triste no se le pregunta qué tuvo de bueno su día. Esta pantalla no
// decide nada de eso —la regla vive en `@/diario/nocheReconocimiento`— y aquí
// no se lee ni una palabra de lo que nadie escribió.
//
// **Lo escrito no se pierde al cambiar la pregunta.** Las filas son estado del
// recorrido y este componente solo las pinta: volver atrás, cambiar la emoción
// y volver aquí cambia el título y las ideas, y deja el texto donde estaba.
//
// **Abre con un solo campo.** Varios campos vacíos a la vez se leen como varios
// huecos por rellenar, y esto no es un formulario: los siguientes los pide quien
// escribe, tocando "Añadir otro". **Hasta cinco desde el 10 de septiembre de
// 2026** —eran tres—, cada uno guardado aparte, todos editables y ninguno
// obligatorio. Cinco no es una meta y no se anuncia por adelantado: quien tenga
// una sola cosa que nombrar la escribe y sigue, exactamente igual que antes.
//
// **Con ideas de apoyo, y son las de esta pregunta.** No las tenía: la pregunta
// traía su propio abanico en el texto de apoyo y una lista genérica encima
// habría sido decirle a alguien de qué tiene que hablar su día. Ahora que la
// pregunta se estrecha para acompañar, las ideas la acompañan a ella —cambian
// con el grupo— y siguen sin escribir nada: tocar una abre otra pregunta y ahí
// acaba. Es el mismo `CampoGratitud` de la mañana, con su misma espera de cinco
// segundos en el renglón enfocado y sus mismos dos "Ahora no" para callarse.
//
// **Cada respuesta cabe en cuatrocientas palabras desde el 12 de septiembre de
// 2026**, y no en una línea: el tope vive en `LIMITES.reconocimiento`
// (`palabras`) y lo aplica la mecánica de las filas, no esta pantalla. Cada una
// se escribe en una tarjeta que crece con el texto y se lee entera antes de
// continuar. La pregunta sigue cambiando con la emoción exactamente igual.

import CampoGratitud from '../CampoGratitud'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { LIMITES } from '@/diario/filas'

const textos = copy.diario.noche.reconocimiento

export default function MomentoReconocimiento({ pregunta, filas, onCambiar, onVolcar, onOmitir }) {
  const enBlanco = filas.every((fila) => String(fila.texto ?? '').trim() === '')

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-md text-on-surface">{pregunta.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{pregunta.lead}</p>
      </div>

      <CampoGratitud
        filas={filas}
        limites={LIMITES.reconocimiento}
        onCambiar={onCambiar}
        onVolcar={onVolcar}
        sugerencias={pregunta.sugerencias}
        etiqueta={pregunta.titulo}
        placeholder={textos.placeholder}
        textoAnadir={textos.anadir}
        // Una lista de cinco no necesita que le anuncien que llegó al final:
        // se ve. La frase del tope es de una lista que puede llegar a diez.
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
