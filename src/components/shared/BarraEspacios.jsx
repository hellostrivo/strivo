// src/components/shared/BarraEspacios.jsx
// Las dos pestañas que conectan Lumia y Formia (§C7.3).
//
// **Es lo único que los conecta.** Ningún enlace de contenido lleva de un
// espacio al otro (§C7.7.3): el puente de "Tu ritual de la mañana" que Fase 0
// ponía en Hoy se retiró y no se sustituyó por nada. Si algún día aparece un
// enlace cruzado en cualquier pantalla, esta barra deja de ser el único cruce y
// la separación se ha roto por donde no se ve.
//
// **Dos y solo dos.** No hay tercera pestaña de Strivo: Strivo es la marca
// madre y no se usa directamente (§C0.2). Nadie "abre Strivo" para hacer algo.
//
// Rótulos en **opción A** (§C7.3, decidida el 11 ago 2026): la marca sola en la
// pestaña, y marca + descriptor en la cabecera de cada espacio. "Lumia ·
// Reflexión" entero no cabe aquí a un tamaño legible con escalado al 200 %.

import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { copy } from '@copy'

const textos = copy.shared.navegacion

export default function BarraEspacios({ rutaDe }) {
  const espacios = [
    { id: 'lumia', label: textos.lumia.pestana },
    { id: 'formia', label: textos.formia.pestana },
  ]

  return (
    <nav
      aria-label={textos.barraLabel}
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-40',
        'flex items-stretch',
        'border-t border-on-surface bg-paper/95 backdrop-blur-sm',
        'pb-safe',
      )}
    >
      {espacios.map((espacio) => (
        <NavLink
          key={espacio.id}
          // Vuelve a donde estabas en ese espacio, no a su raíz: cambiar de
          // pestaña no puede perder la sección que se deja (criterio 4).
          to={rutaDe(espacio.id)}
          className={({ isActive }) =>
            clsx(
              'relative flex flex-1 flex-col items-center justify-center gap-1',
              'py-3 min-h-touch text-base',
              'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
              // El estado activo no depende solo del color (criterio 7): cambia
              // el peso tipográfico y aparece una línea encima.
              isActive ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-soft',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-current"
                />
              )}
              <span>{espacio.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
