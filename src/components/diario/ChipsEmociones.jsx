// src/components/diario/ChipsEmociones.jsx
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
 *   placeholder, valor, onCambiarValor, maxLength, etiquetaValor, onConfirmar }`.
 *   Sin él no se pinta — y hoy solo lo pasa el Journal (§5.8.1): la mañana
 *   pregunta qué cultivar y su catálogo no admite palabra propia.
 *
 *   `etiquetaValor` es la palabra ya formateada por quien monta el chip. El
 *   componente no la construye: el formato de la palabra propia es del catálogo
 *   que la ofrece, igual que el catálogo y la regla de selección.
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

  // La palabra solo sustituye al rótulo mientras el chip está elegido: al
  // soltarlo la palabra deja de contar (`paraGuardar` la descarta), así que
  // seguir enseñándola diría que hay algo guardado que no lo está.
  const textoDeOtra =
    otra && seleccion.includes(otra.id) && otra.etiquetaValor ? otra.etiquetaValor : otra?.chip

  const clases = (elegida, punteado) =>
    clsx(
      'inline-flex items-center gap-2 rounded-full border px-4 py-2',
      'min-h-touch-sm text-base text-on-surface',
      'transition-all duration-180 ease-smooth motion-reduce:transition-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
      elegida
        ? 'border-current bg-strivo-tarjeta shadow-elev-2'
        : 'border-on-surface bg-strivo-campo',
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

        {/* Borde punteado para distinguirlo de los chips de catálogo (§5.8.1).
            Con una palabra escrita el chip **la muestra**: es el único acuse de
            que quedó registrada, y llega por cualquier vía —tecleando, con
            Enter o al salir del campo—. Sin él, escribir la palabra no produce
            ni un cambio en pantalla y parece que no se guardó. */}
        {otra && (
          <button
            type="button"
            onClick={() => tocar(otra.id)}
            aria-pressed={seleccion.includes(otra.id)}
            aria-label={`${textoDeOtra}, ${total} de ${total}`}
            className={clases(seleccion.includes(otra.id), true)}
          >
            <span>{textoDeOtra}</span>
          </button>
        )}
      </div>

      {otra && seleccion.includes(otra.id) && (
        <CampoLinea
          value={otra.valor}
          maxLength={otra.maxLength}
          onChange={(evento) => otra.onCambiarValor(evento.target.value)}
          // Enter es una forma legítima de decir "ya está": vuelca lo pendiente
          // y suelta el foco, que en móvil es lo que cierra el teclado. No
          // valida nada por su cuenta ni puede colar una frase — la regla de
          // una sola palabra vive en `onCambiarValor` y ya corrió en cada
          // tecla, así que el valor que Enter confirma es el que se ve escrito.
          // `preventDefault` es por si algún día este editor fuera un <form>:
          // ahí Enter lo enviaría, y enviar no es lo que se está pidiendo.
          onKeyDown={(evento) => {
            if (evento.key !== 'Enter') return
            evento.preventDefault()
            otra.onConfirmar?.()
            evento.currentTarget.blur()
          }}
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
