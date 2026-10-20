// src/breathing/components/SelectorPatron.jsx
// Elegir el ritmo (SPEC_16 §3.2, RN-RE-NAV-13).
//
// Los siete del catálogo en una lista horizontal. Se muestra el nombre y la
// descripción del elegido debajo: enseñar las siete descripciones a la vez
// convierte la elección en una tabla comparativa, que es exactamente lo que
// SPEC_13 evitó al curar el catálogo a siete.

import { copy, interpolate } from '@copy'
import { CATALOGO_PATRONES } from '../data/catalogoPatrones.js'

export default function SelectorPatron({ patronBaseId, onCambiar }) {
  const elegido = CATALOGO_PATRONES.find((entrada) => entrada.id === patronBaseId)
  const textos = elegido ? copy.respiracion.patrones[elegido.claveCopy] : null

  return (
    <section className="flex flex-col gap-3">
      <ul
        className="flex gap-2 overflow-x-auto pb-1"
        role="radiogroup"
        aria-label={copy.respiracion.configuracion.ritmo}
      >
        {CATALOGO_PATRONES.map((entrada) => {
          const nombre = copy.respiracion.patrones[entrada.claveCopy].nombre
          return (
            <li key={entrada.id}>
              <button
                type="button"
                role="radio"
                aria-checked={entrada.id === patronBaseId}
                aria-label={interpolate(copy.respiracion.accesibilidad.vistaPrevia, {
                  patron: nombre,
                })}
                onClick={() => onCambiar(entrada.id)}
                data-elegido={entrada.id === patronBaseId ? 'si' : 'no'}
                className="respiracion-opcion min-h-touch whitespace-nowrap rounded-full border border-on-surface px-4 text-sm text-on-surface"
              >
                {nombre}
              </button>
            </li>
          )
        })}
      </ul>

      {textos ? (
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-md text-on-surface">{textos.nombre}</h2>
          <p className="text-sm text-on-surface-soft">{textos.descripcion}</p>
        </div>
      ) : null}
    </section>
  )
}
