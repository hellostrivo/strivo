// src/components/diario/SelectorDia.jsx
// Qué día se está escribiendo (3 sep 2026).
//
// Hasta ahora Hoy solo sabía escribir el día de hoy, y al cambiar la clave de
// fecha el anterior quedaba fuera de alcance en el mismo instante. Quien llega
// a casa a las dos de la mañana y quiere cerrar el día que acaba de vivir se
// encontraba el día siguiente en blanco. Esto es la puerta a los días que la
// ventana de 72 horas todavía tiene abiertos (`@/diario/ventanaEdicion`).
//
// **Nombra los días, no los cuenta.** "Hoy", "Ayer" y el nombre del día de la
// semana. Ni "hace 2 días", ni "1 de 3", ni una cuenta de horas que queden: un
// número al lado de un día convertiría volver atrás en una carrera, y aquí no
// se mide nada (§14, no-negociable 2).
//
// **Ningún día lleva marca de vacío.** No hay punto, ni gris, ni "sin escribir"
// en los que quedaron en blanco: sería la lista de lo que falta, y aquí no
// falta nada (RN-05). Los tres se ven exactamente igual.
//
// **La etiqueta de estar en un día pasado va debajo y es discreta**: dice de
// qué día es lo que se está escribiendo y nada más. Sin advertencia, sin prisa
// y sin recordarle a nadie que ese día pasó sin que escribiera.
//
// Va debajo del conmutador de sección a propósito: elegir de qué momento se
// habla sigue siendo el primer gesto de la pantalla, y el día es el marco
// dentro del que ocurre. No compite con él —es texto, no un bloque en
// contratono— y por eso las dos piezas no se leen como dos conmutadores.

import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import { diaDeLaSemana } from '@/diario/fechas'

const textos = copy.diario.hoy.dias

/**
 * Cómo se llama cada día de la lista.
 *
 * Los dos primeros tienen nombre propio; del tercero en adelante se usa el día
 * de la semana, que es como se nombra un día reciente en voz alta. El nombre
 * sale de la fecha y no del copy: es un dato del calendario, no una frase.
 */
function etiquetaDe(fecha, indice) {
  if (indice === 0) return textos.hoy
  if (indice === 1) return textos.ayer
  const dia = diaDeLaSemana(fecha)
  return dia.charAt(0).toUpperCase() + dia.slice(1)
}

export default function SelectorDia({ dias, fecha, onCambiar }) {
  if (!dias || dias.length < 2) return null

  const indice = dias.indexOf(fecha)
  const enOtroDia = indice > 0

  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label={textos.label} className="flex flex-wrap items-center gap-1">
        {dias.map((dia, posicion) => {
          const activo = dia === fecha
          return (
            <button
              key={dia}
              type="button"
              onClick={() => onCambiar(dia)}
              aria-pressed={activo}
              className={clsx(
                'rounded-full px-3 py-2 min-h-touch-sm text-sm',
                'transition-colors duration-120 ease-smooth motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                // El día elegido se distingue por **peso y borde**, nunca solo
                // por color (§10, accesibilidad). Los otros no se apagan: no
                // son opciones de segunda, son otros días.
                activo
                  ? 'border border-on-surface font-medium text-on-surface'
                  : 'border border-transparent text-on-surface-soft hover:text-on-surface',
              )}
            >
              {etiquetaDe(dia, posicion)}
            </button>
          )
        })}
      </div>

      {enOtroDia && (
        <p className="text-sm text-on-surface-soft">
          {interpolate(textos.retroTemplate, { dia: diaDeLaSemana(fecha) })}
        </p>
      )}
    </div>
  )
}
