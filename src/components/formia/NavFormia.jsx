// src/components/formia/NavFormia.jsx
// La navegación interna de Formia: cabecera del espacio y sus tres secciones.
//
// **Identidad · Hábitos · Progreso.** Con el vocabulario de Formia —
// construcción, dirección, hacia delante— y sin una palabra del de Lumia: aquí
// no se dice "ritual", ni "reflexión", ni "cierre" (§C3.0, principio 1).
//
// La cabecera dice "Formia · Acción" —opción A de §C7.3— porque la pestaña de
// abajo solo lleva la marca.
//
// **Es gemela de `NavLumia` y sigue siendo un archivo aparte a propósito.**
// SPEC_12 le da a cada espacio su paleta y sus símbolos: dentro de una spec las
// dos navegaciones van a dejar de parecerse.
//
// RN-DB4-01 — Aquí no hay un solo enlace a Lumia. El único cruce entre espacios
// es la barra de abajo (§C7.7.3).

import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import Simbolo from '@components/shared/Simbolo'
import { copy } from '@copy'

const textos = copy.shared.navegacion

const SECCIONES = [
  { id: 'identidad', ruta: '/formia/identidad' },
  { id: 'habitos', ruta: '/formia/habitos' },
  { id: 'progreso', ruta: '/formia/progreso' },
]

export default function NavFormia() {
  return (
    <header className="relative z-30 flex flex-col gap-3 border-b border-espacio bg-espacio-cabecera px-5 pb-3 pt-safe">
      <p className="flex items-center gap-2 text-sm text-on-surface-soft">
        <Simbolo marca="formia" alto={18} />
        {textos.formia.cabecera}
      </p>

      <nav aria-label={textos.seccionesLabel}>
        <ul className="flex flex-wrap gap-2">
          {SECCIONES.map((seccion) => (
            <li key={seccion.id}>
              <NavLink
                to={seccion.ruta}
                className={({ isActive }) =>
                  clsx(
                    'inline-flex items-center rounded-full border px-4 py-2',
                    'min-h-touch-sm text-base',
                    'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                    // Peso y borde, no solo color (criterio 7).
                    isActive
                      ? 'border-espacio-acento bg-raised font-semibold text-on-surface shadow-elev-1'
                      : 'border-on-surface bg-transparent font-medium text-on-surface-soft',
                  )
                }
              >
                {textos.formia.secciones[seccion.id]}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
