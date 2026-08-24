// src/components/lumia/NavLumia.jsx
// La navegación interna de Lumia: cabecera del espacio y sus cuatro secciones.
//
// **Hoy · Journal · Respiración · Historial.** Es la navegación propia del espacio, distinta
// de la de Formia, y con el vocabulario de Lumia: reflexión, calma, cierre. La
// barra de espacios no mezcla los dos registros y esta tampoco.
//
// La cabecera dice "Lumia · Reflexión" —opción A de §C7.3— porque la pestaña de
// abajo solo lleva la marca. Es donde se aprende qué es Lumia.
//
// **Es gemela de `NavFormia` y sigue siendo un archivo aparte a propósito.**
// SPEC_12 le da a cada espacio su paleta y sus símbolos: dentro de una spec las
// dos navegaciones van a dejar de parecerse, y factorizar ahora lo que está a
// punto de divergir solo adelanta el trabajo de deshacerlo.
//
// RN-DB4-01 — Aquí no hay un solo enlace a Formia. El único cruce entre
// espacios es la barra de abajo (§C7.7.3).
//
// **No nombra ni un color.** Pide superficies por su papel —`espacio-cabecera`,
// `on-surface`, `espacio-acento`— y quien decide qué son es el tema (RN-SURF-01).
// Por eso vestirla de contratono en la mañana no toca este archivo más que para
// darle su clase: las tres secciones conservan forma, peso y borde, y solo se
// invierte lo que hay debajo de ellas.

import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import Simbolo from '@components/shared/Simbolo'
import { copy } from '@copy'

const textos = copy.shared.navegacion

// **Respiración entra entre Journal e Historial (24 ago).** Deja de ser la
// herramienta transversal que colgaba del Home de Strivo y pasa a ser una
// sección de Lumia: el mismo componente, el mismo estado, la misma sesión, con
// el cromo y la paleta del espacio. Lo pidió el propietario del producto.
//
// El orden no es alfabético ni histórico: Hoy, Journal y Respiración son lo que
// se hace ahora —el día, lo que se escribe, el aire— y el Historial es lo que ya
// pasó. Dejarla al final la habría metido en el pasado.
const SECCIONES = [
  { id: 'hoy', ruta: '/lumia/hoy' },
  { id: 'journal', ruta: '/lumia/journal' },
  { id: 'respiracion', ruta: '/lumia/respiracion' },
  { id: 'historial', ruta: '/lumia/historial' },
]

export default function NavLumia() {
  return (
    // `z-30` no es decorativo: la pantalla Hoy pinta su degradado en una capa
    // `fixed` que cubre la ventana entera, y sin esto la cabecera queda debajo
    // —presente en el DOM, invisible en pantalla—. Por debajo de la barra de
    // espacios (z-40) y de las secuencias de cierre (z-50), que sí mandan.
    // `cabecera-espacio` no pinta nada por sí sola: es el asidero para que el
    // momento de Hoy pueda vestirla desde `globals.css`, igual que a la barra de
    // abajo. En la mañana las dos van en el contratono del conmutador; en el
    // Journal y en el Historial, donde no hay momento, manda lo de siempre.
    <header className="cabecera-espacio relative z-30 flex flex-col gap-3 border-b border-espacio bg-espacio-cabecera px-5 pb-3 pt-safe transicion-tema">
      <p className="flex items-center gap-2 text-sm text-on-surface-soft">
        <Simbolo marca="lumia" alto={18} />
        {textos.lumia.cabecera}
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
                {textos.lumia.secciones[seccion.id]}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
