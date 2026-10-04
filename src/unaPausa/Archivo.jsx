// src/unaPausa/Archivo.jsx
// Las pausas anteriores: una lista de texto, en el orden del canal (DP-28.25).
//
// **Sin portada**: una lista de fotos se lee como un catálogo, y sin conexión
// serían huecos. La portada se ve en el detalle. **Sin contador** («12
// pausas»), sin «me gusta», sin «leída» y sin orden alternativo: el archivo
// muestra lo que hubo, no lleva la cuenta (§14, no-negociable 2).

import { Link } from 'react-router-dom'
import { copy } from '@copy'
import { fechaDePausa } from './fecha.js'

const textos = copy.unaPausa.archivo

/**
 * @param {{ entradas: object[], base: string, refEncabezado?: object }} props
 */
export default function Archivo({ entradas, base, refEncabezado }) {
  return (
    <section className="flex flex-col gap-6">
      <h1
        ref={refEncabezado}
        tabIndex={-1}
        className="una-pausa-encabezado font-display text-lg text-on-surface"
      >
        {textos.titulo}
      </h1>

      <ul aria-label={textos.listaLabel} className="flex flex-col">
        {entradas.map((entrada) => (
          <li key={entrada.id} className="border-t border-on-surface">
            <Link
              to={`${base}/${entrada.id}`}
              className="flex min-h-[56px] flex-col justify-center gap-1 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
            >
              <span className="text-base text-on-surface underline underline-offset-4">
                {entrada.title}
              </span>
              {entrada.publicadaEl && (
                <time dateTime={entrada.publicadaEl} className="text-sm text-on-surface-soft">
                  {fechaDePausa(entrada.publicadaEl)}
                </time>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
