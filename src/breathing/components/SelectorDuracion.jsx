// src/breathing/components/SelectorDuracion.jsx
// Cuánto dura la sesión (SPEC_16 §3.2).
//
// Tres modos y ninguno oculto: por respiraciones, por tiempo, o sin final. El
// tercero existe porque a veces no se sabe cuánto se va a necesitar, y obligar
// a poner una cifra en ese momento es pedir una decisión que no se puede tomar.
//
// La cifra se dice **aproximada** y se explica por qué (RN-RE-MOT-20): el ciclo
// en curso siempre se termina, así que tres minutos son tres minutos y pico.
// Decir "3 minutos" a secas y durar 3:12 sería una promesa incumplida por unos
// segundos, que es peor que no prometer nada.

import { copy, interpolate } from '@copy'
import { LIMITES_DURACION, MODOS_DURACION } from '@lib/respiracion/maquinaSesion'

const CLAVE_MODO = { ciclos: 'modoCiclos', minutos: 'modoMinutos', abierta: 'modoAbierta' }

export default function SelectorDuracion({ duracion, onCambiar }) {
  const textos = copy.respiracion.duracion
  const limites = LIMITES_DURACION[duracion.modo]

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm text-on-surface-soft">{textos.titulo}</h2>

      <div className="flex gap-2" role="radiogroup" aria-label={textos.titulo}>
        {MODOS_DURACION.map((modo) => (
          <button
            key={modo}
            type="button"
            role="radio"
            aria-checked={duracion.modo === modo}
            onClick={() => onCambiar({ modo, valor: duracion.valor })}
            data-elegido={duracion.modo === modo ? 'si' : 'no'}
            className="min-h-touch flex-1 rounded-full border border-espacio px-3 text-sm text-on-surface"
          >
            {textos[CLAVE_MODO[modo]]}
          </button>
        ))}
      </div>

      {duracion.modo === 'abierta' ? (
        <p className="text-sm text-on-surface">{textos.abierta}</p>
      ) : (
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm text-on-surface">
            {interpolate(textos[duracion.modo], { n: duracion.valor })}
          </span>
          <input
            type="range"
            min={limites?.min ?? 1}
            max={limites?.max ?? 60}
            step={1}
            value={duracion.valor}
            onChange={(evento) =>
              onCambiar({ modo: duracion.modo, valor: Number(evento.target.value) })
            }
            aria-valuetext={interpolate(textos[duracion.modo], { n: duracion.valor })}
            className="min-h-touch w-1/2"
          />
        </label>
      )}

      {/* RN-RE-MOT-20 — Se dice en voz alta que la cifra es aproximada. */}
      {duracion.modo !== 'abierta' ? (
        <p className="text-xs text-on-surface-soft">{textos.aproximado}</p>
      ) : null}
    </section>
  )
}
