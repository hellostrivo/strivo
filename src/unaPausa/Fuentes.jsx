// src/unaPausa/Fuentes.jsx
// Las fuentes de una cápsula, desplegables, con el aviso educativo y la línea
// de transparencia dentro (SPEC_28.3 §4.5, punto 8).
//
// **Un `<button aria-expanded aria-controls>` dentro de un `h2`**: es el patrón
// de acordeón, y así «Fuentes» sigue siendo un encabezado para quien navega por
// encabezados. Al ser un botón de verdad se abre con Intro y con Espacio sin
// escribir una tecla a mano.
//
// **No anima**, ni con movimiento reducido ni sin él: abrir una lista no
// necesita un gesto que la acompañe, y así no hay nada que reducir.
//
// La lista se pinta siempre y se esconde con `hidden`: lo que no se ve tampoco
// lo lee el lector de pantalla, y no hay contenido que aparezca de la nada.

import { useId, useState } from 'react'
import { copy, interpolate } from '@copy'

const textos = copy.unaPausa.fuentes

/** Un enlace que sale de Strivo, y lo dice a quien no lo ve. */
function EnlaceFuera({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[44px] items-center text-sm text-on-surface underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
    >
      {children}
      <span className="sr-only"> {textos.seAbreFuera}</span>
    </a>
  )
}

function Fuente({ fuente }) {
  // Autoría y año van en dos piezas separadas por el espacio de la fila, sin
  // signo entre ellas: un separador escrito aquí sería texto en el componente.
  const autoria = [fuente.authorsOrInstitution, fuente.year].filter(
    (v) => v !== null && v !== undefined && v !== '',
  )
  return (
    <li className="flex flex-col gap-1 border-t border-on-surface pt-3">
      <p className="text-base text-on-surface">{fuente.title}</p>
      {autoria.length > 0 && (
        <p className="flex flex-wrap gap-x-3 text-sm text-on-surface-soft">
          {autoria.map((parte) => (
            <span key={parte}>{parte}</span>
          ))}
        </p>
      )}
      <p className="flex flex-wrap gap-x-5">
        {fuente.originalUrl && (
          <EnlaceFuera href={fuente.originalUrl}>{textos.original}</EnlaceFuera>
        )}
        {fuente.doi && (
          <EnlaceFuera href={`https://doi.org/${fuente.doi}`}>
            {interpolate(textos.doi, { doi: fuente.doi })}
          </EnlaceFuera>
        )}
      </p>
    </li>
  )
}

/**
 * @param {{ fuentes?: object[], generatedWithAi?: boolean }} props
 */
export default function Fuentes({ fuentes = [], generatedWithAi = false }) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-md text-on-surface">
        <button
          type="button"
          aria-expanded={abierta}
          aria-controls={id}
          onClick={() => setAbierta((v) => !v)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-md underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          {textos.titulo}
        </button>
      </h2>

      {/* **El contenedor que se esconde no lleva clases de `display`.** `flex`
          le ganaría a `hidden` —misma especificidad, y las utilidades van
          después— y la lista se vería cerrada. Se vio así en un navegador. */}
      <div id={id} hidden={!abierta}>
        <div className="flex flex-col gap-4">
          <ul aria-label={textos.listaLabel} className="flex flex-col gap-3">
            {fuentes.map((fuente, i) => (
              <Fuente key={`${i}-${fuente.originalUrl ?? fuente.title}`} fuente={fuente} />
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-on-surface-soft">{textos.aviso}</p>
          {generatedWithAi === true && (
            <p className="text-sm leading-relaxed text-on-surface-soft">{textos.transparencia}</p>
          )}
        </div>
      </div>
    </section>
  )
}
