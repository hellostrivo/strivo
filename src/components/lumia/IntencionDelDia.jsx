// src/components/lumia/IntencionDelDia.jsx
// La captura de la intención del día (§C2.4, ex-R5).
//
// **Adverbial, no narrativa.** Aquí se declara *cómo* se quiere atravesar el
// día. El *qué* pasa en un gran día es la gran visión, y vive en el bloque 4
// del Diario de mañana: son dos superficies distintas y no se fusionan
// (§C2.4.1).
// Fusionarlas rompería el mecanismo nocturno, porque "¿cómo se parece a lo que
// pasó?" no se puede preguntar sobre "con calma" sin convertirlo en un examen
// de si la persona logró estar en calma.
//
// **RN-LU-INT-01** — Se responde con un toque y por eso los chips van primero.
// Nunca se presenta como un campo vacío con el teclado abierto: no hay
// `autoFocus` en ninguna parte de este archivo, y eso es deliberado.
//
// **RN-LU-INT-03** — No es obligatoria, no bloquea nada y no aparece como
// pendiente si está vacía. Un día sin intención es un día normal.
//
// RN-DB4-01 — La intención no se vincula a ninguna identidad. No hay selector
// de área, no se deduce nada y no se importa `formia/`.

import { clsx } from 'clsx'
import { CampoLinea } from './Campo'
import { copy } from '@copy'
import { CHIPS, chipDe } from '@/content/chips-intencion'

const textos = copy.lumia.intencion

export default function IntencionDelDia({ intencion = '', onElegir, onEscribir, onVolcar }) {
  const activo = chipDe(intencion)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm text-on-surface-soft">{textos.pregunta}</h2>

      <div className="flex flex-wrap gap-2" role="group" aria-label={textos.pregunta}>
        {CHIPS.map((chip, indice) => {
          const elegido = activo?.id === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              // Tocar el que ya está elegido lo quita. Cambiar de idea sobre
              // cómo se quiere entrar al día cuesta un toque, ni uno más.
              onClick={() => onElegir(elegido ? '' : chip.texto)}
              aria-pressed={elegido}
              aria-label={`${chip.texto}, ${indice + 1} de ${CHIPS.length}`}
              className={clsx(
                'rounded-full border px-4 py-2 min-h-touch-sm text-base text-on-surface',
                'transition-all duration-180 ease-smooth motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                elegido
                  ? 'border-current bg-lumia-tarjeta shadow-elev-2'
                  : 'border-on-surface bg-lumia-campo',
              )}
            >
              {chip.texto}
            </button>
          )
        })}
      </div>

      {/* RN-LU-INT-02 — Una línea, y el marcador de posición no invita a más.
          Es la salida para quien quiera otra palabra, no la puerta de entrada. */}
      <CampoLinea
        value={intencion}
        onChange={(evento) => onEscribir(evento.target.value)}
        onBlur={onVolcar}
        placeholder={textos.otra.placeholder}
        aria-label={textos.otra.label}
        className="max-w-sm"
      />
    </section>
  )
}
