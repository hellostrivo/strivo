// src/components/lumia/CalendarioAnimo.jsx
// El calendario del Historial: un punto de color por día registrado (§5.10).
//
// **Los días sin registro no se marcan de ningún modo especial.** No hay
// huecos, no hay grises acusatorios y no hay "días perdidos": un día sin
// registro simplemente no tiene punto. Es la regla que decide toda la estética
// de esta pantalla, y por eso la casilla vacía no lleva ni borde propio.
//
// La paleta de ánimo (§6.3.5) va deliberadamente de frío-apagado a
// fresco-luminoso y **no** de rojo a verde: eso convertiría el ánimo en una
// calificación. Los cinco colores viven en `globals.css`; aquí solo se conoce
// el identificador que devuelve `animoDerivado`.

import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import { huecoInicial, nombreDelMes, numeroDeDia } from '@/lumia/historial'
import { fechaCorta } from '@/lumia/fechas'

const textos = copy.lumia.historial.calendario
const nombresDeAnimo = copy.lumia.historial.animo

/**
 * Los cinco ánimos, cada uno con su clase. Escrito a mano y no compuesto con
 * una plantilla: Tailwind recorta las utilidades que no encuentra literalmente
 * en el código, y `bg-animo-${id}` desaparecería del CSS de producción sin que
 * nada fallara en desarrollo.
 */
const CLASE_DE_ANIMO = Object.freeze({
  agotado: 'bg-animo-agotado',
  inquieto: 'bg-animo-inquieto',
  normal: 'bg-animo-normal',
  tranquilo: 'bg-animo-tranquilo',
  en_paz: 'bg-animo-en_paz',
})

export default function CalendarioAnimo({ mes, dias, hoy, onAbrirDia, onAnterior, onSiguiente }) {
  const huecos = huecoInicial(mes)

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAnterior}
          aria-label={textos.anterior}
          className="rounded-full border border-on-surface px-4 py-2 min-h-touch-sm text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <h2 className="font-display text-md text-on-surface">{nombreDelMes(mes)}</h2>

        <button
          type="button"
          onClick={onSiguiente}
          aria-label={textos.siguiente}
          className="rounded-full border border-on-surface px-4 py-2 min-h-touch-sm text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          <span aria-hidden="true">›</span>
        </button>
      </header>

      <div className="grid grid-cols-7 gap-1" aria-hidden="true">
        {copy.days.short.map((dia) => (
          <span key={dia} className="py-1 text-center text-xs text-on-surface-soft">
            {dia}
          </span>
        ))}
      </div>

      <ul className="grid grid-cols-7 gap-1">
        {Array.from({ length: huecos }, (_, i) => (
          <li key={`hueco-${i}`} aria-hidden="true" />
        ))}

        {dias.map((dia) => {
          const etiqueta = dia.animo
            ? interpolate(textos.diaConAnimoTemplate, {
                fecha: fechaCorta(dia.fecha),
                animo: nombresDeAnimo[dia.animo],
              })
            : fechaCorta(dia.fecha)

          return (
            <li key={dia.fecha}>
              <button
                type="button"
                onClick={() => onAbrirDia(dia.fecha)}
                aria-label={etiqueta}
                aria-current={dia.fecha === hoy ? 'date' : undefined}
                className={clsx(
                  'flex w-full flex-col items-center gap-1 rounded-sm px-1 py-2 min-h-touch-sm',
                  'text-sm text-on-surface',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                  dia.fecha === hoy && 'border border-on-surface',
                )}
              >
                <span>{numeroDeDia(dia.fecha)}</span>
                {/* Sin ánimo no hay punto. La ausencia no se dibuja. */}
                <span
                  aria-hidden="true"
                  className={clsx(
                    'h-1.5 w-1.5 rounded-full',
                    dia.animo ? CLASE_DE_ANIMO[dia.animo] : 'opacity-0',
                  )}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
