// src/components/lumia/VictoriasHeredadas.jsx
// "Mis logros de hoy" — las victorias de la mañana, por la noche (§5.4, B2).
//
// Tres estados: pendiente, lograda y no se dio. **Nunca hay una X y nunca hay
// rojo.** "No se dio hoy" es un botón secundario discreto que abre dos salidas,
// las dos amables: pasarla a mañana o dejarla ir.
//
// Si no hubo victorias por la mañana, el bloque cambia de pregunta y ofrece
// filas vacías. Nunca se muestra un vacío que recuerde una omisión.

import { clsx } from 'clsx'
import FilasDinamicas from './FilasDinamicas'
import { copy } from '@copy'
import { LIMITES } from '@/lumia/filas'
import { vieneDeOtroDia } from '@/lumia/victorias'

const textos = copy.lumia.diario.noche.victorias

function Marca({ lograda }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'grid h-6 w-6 shrink-0 place-items-center rounded-full border',
        lograda ? 'border-current bg-lumia-tarjeta' : 'border-on-surface',
      )}
    >
      {lograda && (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M5 13l4 4L19 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-check-draw motion-reduce:animate-none"
            style={{ strokeDasharray: 40 }}
          />
        </svg>
      )}
    </span>
  )
}

function Victoria({ victoria, abierta, onAbrir, onAlternar, onPasar, onSoltar, onDeshacer }) {
  const lograda = victoria.state === 'lograda'
  const noSeDio = victoria.state === 'no_se_dio'

  return (
    <li
      className={clsx(
        'flex flex-col gap-2 rounded-md border border-on-surface p-3',
        'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
        lograda ? 'bg-lumia-tarjeta' : 'bg-lumia-campo',
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onAlternar(victoria)}
          aria-pressed={lograda}
          aria-label={`${textos.marcar}: ${victoria.text}`}
          className="flex min-h-touch-sm flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30 rounded-md"
        >
          <Marca lograda={lograda} />
          <span className="flex flex-col gap-0.5">
            <span className="text-base text-on-surface">{victoria.text}</span>
            {vieneDeOtroDia(victoria) && (
              <span className="text-sm text-on-surface-soft">{textos.deAyer}</span>
            )}
          </span>
        </button>
      </div>

      {lograda && <p className="text-sm text-on-surface-soft">{textos.lograda}</p>}

      {noSeDio ? (
        <button
          type="button"
          onClick={() => onDeshacer(victoria)}
          className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          {textos.pasada}
        </button>
      ) : (
        !lograda && (
          <div className="flex flex-wrap items-center gap-2">
            {abierta ? (
              <>
                <button
                  type="button"
                  onClick={() => onPasar(victoria)}
                  className="rounded-full border border-on-surface px-4 py-2 min-h-touch-sm text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
                >
                  {textos.pasar}
                </button>
                <button
                  type="button"
                  onClick={() => onSoltar(victoria)}
                  className="rounded-full border border-on-surface px-4 py-2 min-h-touch-sm text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
                >
                  {textos.soltar}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onAbrir(victoria.id)}
                className="rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
              >
                {textos.noSeDio}
              </button>
            )}
          </div>
        )
      )}
    </li>
  )
}

export default function VictoriasHeredadas({
  victorias,
  filas,
  abierta,
  onAbrir,
  onCambiarFilas,
  onVolcar,
  onAlternar,
  onPasar,
  onSoltar,
  onDeshacer,
}) {
  const hayHeredadas = victorias.length > 0

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-md text-on-surface">
        {hayHeredadas ? textos.titulo : textos.tituloVacio}
      </h2>

      {hayHeredadas ? (
        <ul className="flex flex-col gap-2">
          {victorias.map((victoria) => (
            <Victoria
              key={victoria.id}
              victoria={victoria}
              abierta={abierta === victoria.id}
              onAbrir={onAbrir}
              onAlternar={onAlternar}
              onPasar={onPasar}
              onSoltar={onSoltar}
              onDeshacer={onDeshacer}
            />
          ))}
        </ul>
      ) : (
        <FilasDinamicas
          filas={filas}
          limites={LIMITES.victorias}
          onCambiar={onCambiarFilas}
          onVolcar={onVolcar}
          placeholder={textos.placeholder}
          etiqueta={textos.tituloVacio}
          numeradas
        />
      )}
    </section>
  )
}
