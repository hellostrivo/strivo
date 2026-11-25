// src/components/perfil/TuSuscripcion.jsx
// El bloque «Suscripción» de Tu perfil (SPEC_25, DP-25.16). **Solo en la app de
// iPhone**: lo decide `visibles` en `perfil/bloques.js`.
//
// Es el único sitio donde se dice hasta cuándo es la prueba. «Restaurar
// compras» está siempre; «Ver opciones», sin plan; «Gestionar suscripción», con
// uno que se gestione. La pantalla de Apple se abre como un enlace: el plugin
// no tiene forma de enseñarla dentro de la app (D8).

import { useRef, useState } from 'react'
import Button from '@components/ui/Button'
import { unaVezCon } from '@components/shared/unaVez'
import { copy, interpolate } from '@copy'
import { URL_SUSCRIPCIONES } from '@lib/suscripcion/enlaces'
import { ESTADOS } from '@lib/suscripcion/estado'
import { useSuscripcion } from '@lib/suscripcion/useSuscripcion'

const t = copy.suscripcion.ajustes
const muro = copy.suscripcion.paywall

/** La fecha como se dice: «6 de diciembre de 2026», en hora local. */
export function fechaLarga(fecha) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha)
}

/** Lo que dice el bloque. `null` mientras no se sabe. */
export function fraseDeEstado({ estado, plan, hasta, seRenueva }) {
  const conFecha = (texto) => (hasta ? interpolate(texto, { fecha: fechaLarga(hasta) }) : null)
  if (estado === ESTADOS.fundador) return t.fundador
  if (estado === ESTADOS.prueba) return conFecha(t.enPrueba)
  if (estado === ESTADOS.lectura) return t.sinSuscripcion
  if (estado === ESTADOS.activa && plan) return conFecha(t[seRenueva ? plan : `${plan}Termina`])
  return null
}

/** Qué controles tocan en cada estado. */
export function controlesDe(estado, plan = null) {
  return {
    gestionar: estado === ESTADOS.activa,
    // El Fundador no acepta claves (DP-25.9) y quien tiene el Anual no canjea nada.
    codigo: estado !== ESTADOS.fundador && plan !== 'anual',
    opciones: estado === ESTADOS.prueba || estado === ESTADOS.lectura,
  }
}

export default function TuSuscripcion({ diagnostico = null }) {
  const suscripcion = useSuscripcion()
  const [nota, setNota] = useState(null)
  const ocupado = useRef(false)
  const unaVez = unaVezCon(ocupado)
  const frase = fraseDeEstado(suscripcion)
  const { gestionar, opciones, codigo } = controlesDe(suscripcion.estado, suscripcion.plan)

  const restaurar = () =>
    unaVez(async () => {
      setNota(null)
      const { motivo } = await suscripcion.restaurar()
      if (motivo === 'restaurado') setNota(muro.restaurado)
      else setNota(motivo === 'nada' ? muro.nadaQueRestaurar : muro.errorRestaurar)
    })

  return (
    <div className="flex flex-col gap-4">
      <div aria-live="polite" className="flex flex-col gap-1">
        {frase && <p className="text-base text-on-surface">{frase}</p>}
        {!nota && suscripcion.notaDeCodigo && (
          <p className="text-sm text-on-surface-soft leading-relaxed">{suscripcion.notaDeCodigo}</p>
        )}
        {nota && <p className="text-sm text-on-surface-soft leading-relaxed">{nota}</p>}
      </div>
      <div className="flex flex-col items-start gap-3">
        {opciones && (
          <Button type="button" size="sm" variant="surface" onClick={suscripcion.abrirMuro}>
            {t.verOpciones}
          </Button>
        )}
        {gestionar && (
          <a
            href={URL_SUSCRIPCIONES}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-touch items-center rounded-md border border-on-surface bg-raised px-4 py-2 text-sm font-medium text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {t.gestionar}
          </a>
        )}
        <Button type="button" size="sm" variant="surface" onClick={restaurar}>
          {t.restaurar}
        </Button>
        {codigo && (
          <Button
            type="button"
            size="sm"
            variant="surface"
            onClick={() => {
              setNota(null)
              suscripcion.abrirCodigo()
            }}
          >
            {t.tengoCodigo}
          </Button>
        )}
      </div>
      {diagnostico}
    </div>
  )
}
