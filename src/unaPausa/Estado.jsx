// src/unaPausa/Estado.jsx
// Lo que se pinta cuando no hay cápsula que leer: cargando, vacío y error.
//
// - **Cargando** es la forma final, vacía (RN-EST-02): un renglón de etiqueta,
//   el título, dos de apertura y el hueco de la portada. Sin rueda y sin texto
//   que cuente cuánto falta.
// - **Vacío** es una invitación, no una acusación (RN-EST-01): dice qué cabe
//   aquí, no qué falta.
// - **Error** dice qué pasó y ofrece reintentar, sin código y sin vibrar
//   (RN-EST-04). Lo usan la sección y su límite de errores.
//
// Los tres tienen un `h1` —«Una pausa», solo para el lector de pantalla— para
// que el foco tenga dónde ir al entrar (RN-RE-NAV-41).

import { useEffect, useRef } from 'react'
import Button from '@components/ui/Button'
import { copy } from '@copy'

const textos = copy.unaPausa

/** El marco de toda la sección: la columna de siempre, sin crecer a los lados. */
export function Marco({ children }) {
  return (
    <div data-surface="light" className="min-h-screen bg-espacio text-on-surface">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8">{children}</div>
    </div>
  )
}

/**
 * @param {{ estado: 'cargando'|'vacio'|'error', onReintentar?: Function,
 *           refEncabezado?: object, enfocar?: boolean }} props
 *   `enfocar`: lleva el foco al encabezado al montar. Lo usa el límite de
 *   errores, que no tiene a nadie más que lo haga.
 */
export default function Estado({ estado, onReintentar, refEncabezado, enfocar = false }) {
  const propio = useRef(null)
  const encabezado = refEncabezado ?? propio

  useEffect(() => {
    if (enfocar) encabezado.current?.focus()
  }, [enfocar, encabezado])

  const titulo = (
    <h1 ref={encabezado} tabIndex={-1} className="una-pausa-encabezado sr-only">
      {textos.nombre}
    </h1>
  )

  if (estado === 'cargando') {
    return (
      <Marco>
        {titulo}
        {/* `role="status"`: sin rol, un `aria-label` sobre un `div` no lo
            anuncia nadie. */}
        <div
          role="status"
          aria-busy="true"
          aria-label={textos.cargandoLabel}
          className="flex flex-col gap-4"
        >
          <div className="h-4 w-1/3 rounded-md bg-raised" />
          <div className="h-8 w-4/5 rounded-md bg-raised" />
          <div className="h-4 w-full rounded-md bg-raised" />
          <div className="h-4 w-2/3 rounded-md bg-raised" />
          <div className="aspect-[4/3] w-full rounded-lg bg-raised" />
        </div>
      </Marco>
    )
  }

  return (
    <Marco>
      {titulo}
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
        <p className="max-w-sm text-base leading-relaxed text-on-surface">
          {estado === 'error' ? textos.error.texto : textos.vacio}
        </p>
        {estado === 'error' && (
          <Button size="sm" variant="surface" onClick={onReintentar}>
            {textos.error.reintentar}
          </Button>
        )}
      </div>
    </Marco>
  )
}
