// src/components/lumia/ChipsEmociones.jsx
// Chips tipo píldora con emoji para nombrar emociones.
//
// Lo usan los dos catálogos de la app, que son distintos a propósito (§5.3.2):
// la mañana pregunta **qué quieres cultivar** y solo ofrece positivas en futuro
// (§5.3, B3); el Journal pregunta **qué hay** y las difíciles son obligatorias
// en su catálogo (§5.8.1). El componente no elige: recibe el catálogo y la
// regla de selección de quien lo monta.
//
// El emoji no es voz de la app: es vocabulario de quien nombra su propio estado
// (§3.6.2, punto 5).
//
// La selección de más **no se rechaza**: la nueva entra y la más antigua sale
// con una animación suave y una nota discreta. Bloquearla sería decirle a
// alguien que ha hecho algo mal por sentir una cosa más.

import { clsx } from 'clsx'
import { CampoLinea } from './Campo'
import { resolveGender } from '@copy/gender'

/**
 * @param {object[]} catalogo - `{ id, emoji, label: {m,f,n} }`.
 * @param {Function} alternar - Regla de selección del catálogo correspondiente.
 * @param {object} [otra] - Chip de palabra propia: `{ id, chip, label,
 *   placeholder, valor, onCambiarValor, maxLength }`. Sin él no se pinta.
 */
export default function ChipsEmociones({
  catalogo,
  alternar,
  seleccion = [],
  genero,
  onCambiar,
  onDesplazada,
  etiqueta,
  aviso = false,
  avisoTexto,
  otra = null,
}) {
  const tocar = (id) => {
    const { seleccion: siguiente, desplazada } = alternar(seleccion, id)
    onCambiar(siguiente)
    if (desplazada) onDesplazada?.(desplazada)
  }

  const total = catalogo.length + (otra ? 1 : 0)

  const clases = (elegida, punteado) =>
    clsx(
      'inline-flex items-center gap-2 rounded-full border px-4 py-2',
      'min-h-touch-sm text-base text-on-surface',
      'transition-all duration-180 ease-smooth motion-reduce:transition-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
      elegida ? 'border-current bg-lumia-tarjeta shadow-elev-2' : 'border-on-surface bg-lumia-campo',
      punteado && !elegida && 'border-dashed',
    )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={etiqueta}>
        {catalogo.map((emocion, indice) => {
          const elegida = seleccion.includes(emocion.id)
          const texto = resolveGender(emocion.label, genero)
          return (
            <button
              key={emocion.id}
              type="button"
              onClick={() => tocar(emocion.id)}
              aria-pressed={elegida}
              aria-label={`${texto}, ${indice + 1} de ${total}`}
              className={clases(elegida, false)}
            >
              <span aria-hidden="true">{emocion.emoji}</span>
              <span>{texto}</span>
            </button>
          )
        })}

        {/* Borde punteado para distinguirlo de los chips de catálogo (§5.8.1). */}
        {otra && (
          <button
            type="button"
            onClick={() => tocar(otra.id)}
            aria-pressed={seleccion.includes(otra.id)}
            aria-label={`${otra.chip}, ${total} de ${total}`}
            className={clases(seleccion.includes(otra.id), true)}
          >
            <span>{otra.chip}</span>
          </button>
        )}
      </div>

      {otra && seleccion.includes(otra.id) && (
        <CampoLinea
          value={otra.valor}
          maxLength={otra.maxLength}
          onChange={(evento) => otra.onCambiarValor(evento.target.value)}
          placeholder={otra.placeholder}
          aria-label={otra.label}
          className="max-w-xs"
        />
      )}

      {aviso && (
        <p className="text-sm text-on-surface-soft" role="status">
          {avisoTexto}
        </p>
      )}
    </div>
  )
}
