// src/components/shared/BarraStrivo.jsx
// La vuelta al Home de Strivo desde dentro de un espacio.
//
// **Antes era `BarraEspacios` y saltaba de Lumia a Formia** (§C7.3, SPEC_11).
// Desde el 19 ago 2026 ya no hay salto directo: para cambiar de espacio se
// vuelve aquí, al vestíbulo. Se renombró en vez de adaptarse porque lo que hace
// es otra cosa —igual que `SesionProvisional` pasó a `ArranqueProvisional`
// cuando dejó de ser navegación—.
//
// **Sigue sin haber ningún otro cruce.** Ni un enlace de contenido lleva de un
// espacio al otro (§C7.7.3), y ahora tampoco lo lleva la barra: el único camino
// pasa por una pantalla que no es de ninguno de los dos.
//
// Se queda abajo, donde el pulgar ya la busca, y lleva el símbolo de la marca
// madre. Es el segundo sitio donde aparece, después del arranque de sesión.

import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import Simbolo from '@components/shared/Simbolo'
import { copy } from '@copy'

const textos = copy.shared.navegacion

export default function BarraStrivo() {
  return (
    <nav
      aria-label={textos.barraLabel}
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-40',
        'flex items-stretch',
        'border-t border-espacio bg-espacio-cabecera/95 backdrop-blur-sm',
        'pb-safe',
      )}
    >
      <NavLink
        to="/"
        aria-label={textos.volverLabel}
        className={clsx(
          'flex flex-1 flex-col items-center justify-center gap-1',
          'py-3 min-h-touch text-base font-medium text-on-surface-soft',
          'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
          'hover:text-on-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
        )}
      >
        <Simbolo marca="strivo" alto={18} />
        <span>{textos.volver}</span>
      </NavLink>
    </nav>
  )
}
