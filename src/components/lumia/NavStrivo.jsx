// src/components/lumia/NavStrivo.jsx
// La navegación de la app: cabecera de marca y sus cuatro secciones.
//
// **Hoy · Journal · Respiración · Historial.**
//
// **Renombrada el 25 de agosto de 2026** (paso 9 del plan de separación, §8).
// Se llamaba por el espacio al que servía, cuando había dos; con un solo
// producto la navegación de sección es la navegación de Strivo. Con el nombre
// cae también su gemela: no hay una segunda a la que parecerse ni de la que
// mantenerse aparte.
//
// La cabecera dice **"Strivo"** y nada más. El descriptor que la acompañaba
// —opción A de §C7.3— existía para distinguir un espacio del otro, y ya no hay
// otro.
//
// **No nombra ni un color.** Pide superficies por su papel —`espacio-cabecera`,
// `on-surface`, `espacio-acento`— y quien decide qué son es el tema (RN-SURF-01).
// Por eso vestirla de contratono en la mañana no toca este archivo más que para
// darle su clase: las cuatro secciones conservan forma, peso y borde, y solo se
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
  { id: 'hoy', ruta: '/hoy' },
  { id: 'journal', ruta: '/journal' },
  { id: 'respiracion', ruta: '/respiracion' },
  { id: 'historial', ruta: '/historial' },
]

export default function NavStrivo() {
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
        {textos.diario.cabecera}
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
                {textos.diario.secciones[seccion.id]}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
