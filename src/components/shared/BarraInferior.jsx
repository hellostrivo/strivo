// src/components/shared/BarraInferior.jsx
// La barra de abajo: lo que ya pasó, y tú.
//
// **Vuelve el 26 de agosto de 2026, y no es la de antes.** Aquella —retirada
// con el vestíbulo el 25— saltaba entre espacios y devolvía a un Home que ya no
// existe: era navegación de nivel superior sobre una app que no tiene niveles.
// Esta no lleva a ningún sitio por encima del producto; lleva a dos destinos
// que estaban ya dentro de él.
//
// **El reparto es la decisión, y conserva el razonamiento de RN-NAV-02 en vez
// de romperlo.** Arriba queda lo que se hace ahora —el día, lo que se escribe,
// el aire— y abajo lo que ya pasó y tú. El Historial dejaba de encajar al final
// de una lista de cosas que se hacen hoy; aquí no tiene que encajar en ella.
//
// **Vive en `shared/` y no junto a la cabecera**, y tampoco es un descuido: la
// cabecera lista secciones del diario y podía quedarse en su carpeta, pero esta
// cruza —el Historial es del diario y el Perfil no es de nadie—. Un componente
// que sirve a dos partes no es de ninguna de las dos (RN-TEC-05). No importa ni
// una: recibe sus destinos de esta lista y su texto del copy.
//
// **No nombra ni un color.** Pide superficies por su papel y quien decide qué
// son es el tema, igual que la cabecera: por eso vestirla de contratono en la
// mañana no toca este archivo: comparten la clase `cromo-espacio`, que es el
// asidero de esa decisión y por eso ya no se llama "cabecera".

import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { copy } from '@copy'

const textos = copy.shared.navegacion

/** Los dos destinos, en su orden: primero lo que ya pasó, después tú. */
const DESTINOS = [
  { id: 'historial', ruta: '/historial' },
  { id: 'perfil', ruta: '/perfil' },
]

export default function BarraInferior() {
  return (
    // `pb-safe` deja sitio al indicador de inicio del teléfono: sin él, el
    // último milímetro tocable cae debajo del gesto del sistema.
    //
    // Ancho máximo y centrada: en una pantalla grande hay más margen, no más
    // barra (RN-EST-12).
    <nav
      aria-label={textos.barraLabel}
      className="cromo-espacio fixed inset-x-0 bottom-0 z-30 border-t border-espacio bg-espacio-cabecera px-5 pt-3 pb-safe transicion-tema"
    >
      <ul className="mx-auto flex w-full max-w-lg gap-2">
        {DESTINOS.map((destino) => (
          <li key={destino.id} className="flex-1">
            <NavLink
              to={destino.ruta}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-center rounded-full border px-4 py-2',
                  'min-h-touch-sm text-base',
                  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                  // Peso y borde, no solo color (criterio 7). Es la misma forma
                  // que la cabecera: dos barras que se vieran distinto serían
                  // dos navegaciones, y esto es una repartida en dos sitios.
                  isActive
                    ? 'border-espacio-acento bg-raised font-semibold text-on-surface shadow-elev-1'
                    : 'border-on-surface bg-transparent font-medium text-on-surface-soft',
                )
              }
            >
              {textos.diario.secciones[destino.id]}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
