// src/components/suscripcion/TarjetaDePrueba.jsx
// «Tu prueba termina mañana», en Hoy, una vez en este teléfono (DP-25.17). Sin
// contador y sin volver a salir: se marca al verse, con el umbral ya fuera.

import { useEffect, useState } from 'react'
import Button from '@components/ui/Button'
import { copy } from '@copy'
import { useSuscripcion } from '@lib/suscripcion/useSuscripcion'
import {
  descartarTarjeta,
  marcarTarjeta,
  tarjetaVista,
  tocaLaTarjeta,
} from '@lib/suscripcion/tarjetaDePrueba'
import { useALaVista } from './useALaVista'

const textos = copy.suscripcion.prueba

export default function TarjetaDePrueba({ uid }) {
  const { estado, dia, libre, abrirMuro } = useSuscripcion()
  const [descartada, setDescartada] = useState(false)
  const visible = !descartada && tocaLaTarjeta({ estado, dia, vista: tarjetaVista(uid) })

  useEffect(() => {
    if (visible && libre) marcarTarjeta(uid)
  }, [visible, libre, uid])

  const descartar = () => {
    descartarTarjeta(uid)
    setDescartada(true)
  }

  const ref = useALaVista(visible && libre)

  // Si deja de ser el día 6 —se compró, o pasó la medianoche—, se retira sola.
  if (!visible) return null

  return (
    <section
      ref={ref}
      className="flex flex-col gap-3 rounded-lg border border-on-surface bg-raised p-5"
    >
      <h2 className="font-display text-md text-on-surface">{textos.tarjetaTitulo}</h2>
      <p className="text-base text-on-surface leading-relaxed">{textos.tarjetaTexto}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="surface"
          onClick={() => {
            descartar()
            abrirMuro()
          }}
        >
          {textos.verOpciones}
        </Button>
        <Button type="button" size="sm" variant="surface" onClick={descartar}>
          {textos.ahoraNo}
        </Button>
      </div>
    </section>
  )
}
