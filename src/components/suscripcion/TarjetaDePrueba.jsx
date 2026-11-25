// src/components/suscripcion/TarjetaDePrueba.jsx
// «Tu prueba termina mañana», en Hoy, una vez en este teléfono (DP-25.17). Sin
// contador y sin volver a salir.
//
// **Se gasta cuando se vio de verdad**: más de la mitad dentro de la pantalla,
// con la app delante y el umbral fuera, durante segundo y medio seguido. Que
// React la pinte no es que alguien la lea (P3, 25 nov 2026).

import { useEffect, useState } from 'react'
import Button from '@components/ui/Button'
import { copy } from '@copy'
import { anotarPaso } from '@lib/suscripcion/diagnostico'
import { useSuscripcion } from '@lib/suscripcion/useSuscripcion'
import {
  TIEMPO_PARA_VERLA_MS,
  crearVigia,
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
  const ref = useALaVista(visible && libre)

  useEffect(() => {
    anotarPaso(`Hoy montada · ${estado} día ${dia}`)
    return () => anotarPaso('Hoy desmontada')
    // Solo al montar y al desmontar.
  }, [])

  useEffect(() => {
    anotarPaso(
      `tarjeta ${visible ? 'sí' : 'no'} · ${estado} día ${dia} · libre ${libre ? 'sí' : 'no'}`,
    )
  }, [visible, estado, dia, libre])

  useEffect(() => {
    if (!visible || !libre || !ref.current) return undefined
    const caja = ref.current
    const vigia = crearVigia({
      alVerla: () => {
        marcarTarjeta(uid)
        anotarPaso('tarjeta vista')
      },
      ms: TIEMPO_PARA_VERLA_MS,
    })
    const mirar = () => {
      const r = caja.getBoundingClientRect()
      const dentro = vigia.mirar({
        arriba: r.top,
        alto: r.height,
        pantalla: window.innerHeight,
        delante: document.visibilityState === 'visible',
      })
      return { r, dentro }
    }
    const { r, dentro } = mirar()
    anotarPaso(
      `tarjeta en ${Math.round(r.top)}+${Math.round(r.height)} de ${window.innerHeight} · ${dentro ? 'a la vista' : 'fuera'}`,
    )
    const reloj = setInterval(mirar, 250)
    const despues = setTimeout(() => {
      const ahora = caja.getBoundingClientRect()
      anotarPaso(`1 s después: ${Math.round(ahora.top)}, desplazado ${Math.round(window.scrollY)}`)
    }, 1000)
    return () => {
      clearInterval(reloj)
      clearTimeout(despues)
    }
  }, [visible, libre, uid, ref])

  const descartar = (como) => {
    anotarPaso(`tocada: ${como}`)
    descartarTarjeta(uid)
    setDescartada(true)
  }

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
            descartar('Ver opciones')
            abrirMuro()
          }}
        >
          {textos.verOpciones}
        </Button>
        <Button type="button" size="sm" variant="surface" onClick={() => descartar('Ahora no')}>
          {textos.ahoraNo}
        </Button>
      </div>
    </section>
  )
}
