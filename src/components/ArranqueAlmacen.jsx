// src/components/ArranqueAlmacen.jsx
// El almacén, listo antes de que se monte la app (SPEC_17B, DP-17B.6).
//
// **En la web no espera nada**: el almacén es IndexedDB, como siempre, y la app
// se monta en el primer render, igual que antes de SPEC_17B.
//
// **En la app nativa se pinta primero el velo liso de siempre** —el mismo de
// los dos instantes de arranque de `ArranqueProvisional`: el tono del momento,
// sin texto y sin rueda (RN-EST-02)— y después se monta `<App/>`, cuando
// `prepararAlmacen` ya abrió SQLite, migró si tocaba y devolvió las claves del
// teléfono a `localStorage`. Nadie lee ni escribe antes de eso.
//
// Por qué el velo va primero y no la espera a secas: la pantalla de arranque de
// iOS se retira tras el primer pintado y tiene un techo de 2 s
// (`pantallaArranque.js`). Si el render esperara a la apertura, ese techo la
// quitaría y debajo no habría nada pintado. Con el velo, se retira como siempre
// y lo que queda detrás es el tono del momento.
//
// **Nunca se queda en el velo**: `prepararAlmacen` tiene su techo de 10 s y
// siempre contesta. Si contesta `error`, se pinta la pantalla de error que ya
// existe —qué pasó, que lo escrito sigue guardado, y «Reintentar»—, sin un solo
// código (RN-EST-04). Reintentar recarga: vuelve a abrir desde el principio.

import { useEffect, useState } from 'react'
import Button from '@components/ui/Button'
import { copy } from '@copy'
import { momentoDe } from '@lib/timeSlot'
import { almacenListoSinEspera, prepararAlmacen } from '@/lib/db/almacen'

// Una sola preparación por carga de la página: `StrictMode` monta dos veces.
let preparacion = null

export default function ArranqueAlmacen({ children, preparar = prepararAlmacen }) {
  const [estado, setEstado] = useState(() => (almacenListoSinEspera() ? 'listo' : 'preparando'))

  useEffect(() => {
    if (estado !== 'preparando') return undefined
    let vigente = true
    preparacion ??= preparar()
    preparacion.then((r) => vigente && setEstado(r.estado))
    return () => {
      vigente = false
    }
    // Solo al montar: el almacén se decide una vez.
  }, [])

  if (estado === 'listo') return children

  const momento = momentoDe()

  if (estado === 'error') {
    return (
      <div
        data-moment={momento}
        data-surface={momento === 'noche' ? 'dark' : 'light'}
        className="velo-transicion flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center"
      >
        <p className="text-base text-on-surface leading-relaxed">{copy.diario.error.load.body}</p>
        <Button size="sm" variant="surface" onClick={() => window.location.reload()}>
          {copy.diario.error.load.retry}
        </Button>
      </div>
    )
  }

  return <div data-moment={momento} className="velo-transicion min-h-screen" aria-busy="true" />
}
