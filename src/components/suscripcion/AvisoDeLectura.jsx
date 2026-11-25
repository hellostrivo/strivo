// src/components/suscripcion/AvisoDeLectura.jsx
// El aviso del modo lectura (SPEC_25): qué se puede y por dónde se sigue. No es
// una alarma ni tapa nada: lo escrito está debajo.

import Button from '@components/ui/Button'
import { copy } from '@copy'
import { useALaVista } from './useALaVista'

const textos = copy.suscripcion.lectura

export default function AvisoDeLectura({ onOpciones, aLaVista = false }) {
  const ref = useALaVista(aLaVista)
  return (
    <div ref={ref} className="flex flex-col items-start gap-3">
      <p className="text-base text-on-surface leading-relaxed">{textos.aviso}</p>
      <Button type="button" size="sm" variant="surface" onClick={onOpciones}>
        {textos.verOpciones}
      </Button>
    </div>
  )
}
