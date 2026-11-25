// src/components/perfil/DiagnosticoSuscripcion.jsx
// El panel del build de diagnóstico de SPEC_25 (DP-25.21).
//
// **Solo existe con `VITE_DIAG_SUSCRIPCION=1`.** Va al final del bloque
// «Suscripción», plegable. Del cliente de RevenueCat se enseñan los seis
// últimos caracteres y nunca el identificador entero.
//
// Los controles de días mueven el reloj del cálculo y nada más: no escriben en
// el almacén (D5, `lib/suscripcion/diagnostico.js`).

import { useCallback, useEffect, useState } from 'react'
import Button from '@components/ui/Button'
import { interpolate } from '@copy'
import { DIAGNOSTICO_SUSCRIPCION as t } from '@copy/diagnostico'
import { DERECHO, compras } from '@lib/compras'
import { DIA_DE_LA_TARJETA, claveDe, conDesfase, diaDePrueba } from '@lib/suscripcion/estado'
import { escucharDiagnostico, eventosDeLaSesion, fijarDesfase } from '@lib/suscripcion/diagnostico'
import { mostrarFundador } from '@lib/suscripcion/fundador'
import { olvidarTarjeta, tarjetaMarcada } from '@lib/suscripcion/tarjetaDePrueba'
import { useSuscripcion } from '@lib/suscripcion/useSuscripcion'

/** Las líneas, en el orden en que se leen. Sin React, para probarla sin navegador. */
export function lineasDeSuscripcion({
  suscripcion,
  cliente,
  planes,
  eventos,
  ahora,
  tarjeta = false,
}) {
  const derecho = suscripcion.customerInfo?.entitlements?.active?.[DERECHO]
  const activo = derecho?.isActive === true
  const n = ['anual', 'mensual', 'fundador'].filter((id) => planes?.[id]).length
  const sale = mostrarFundador({
    metadata: planes?.metadata,
    paquete: planes?.fundador,
    estado: suscripcion.estado,
    ahora,
  })
  const simulado = conDesfase(ahora, suscripcion.desfaseDias)
  const dia =
    diaDePrueba(suscripcion.fechaInicioPrueba, {
      ahora: simulado,
      diaTerminaA: suscripcion.diaTerminaA,
    }) ?? t.ninguno
  return [
    suscripcion.desfaseDias
      ? interpolate(t.simulado, { fecha: claveDe(simulado), dia })
      : interpolate(t.sinSimular, { dia }),
    interpolate(t.tarjeta, { estado: tarjeta ? t.tarjetas.si : t.tarjetas.no }),
    interpolate(t.estado, {
      estado: suscripcion.estado,
      fecha: suscripcion.hasta ? claveDe(suscripcion.hasta) : t.ninguno,
    }),
    cliente
      ? interpolate(t.cliente, {
          tipo: cliente.anonimo ? t.tipos.anonimo : t.tipos.cuenta,
          final: cliente.final,
        })
      : t.sinCliente,
    interpolate(t.derecho, {
      activo: activo ? t.activos.si : t.activos.no,
      producto: derecho?.productIdentifier ?? t.ninguno,
    }),
    interpolate(t.planes, { n, sale: sale ? t.fundadores.si : t.fundadores.no }),
    interpolate(t.metadata, { json: JSON.stringify(planes?.metadata ?? null) }),
    interpolate(t.inicio, { fecha: suscripcion.fechaInicioPrueba ?? t.ninguno }),
    interpolate(t.eventos, { lista: eventos.join(', ') || t.ninguno }),
  ]
}

/** Cuánto hay que mover el reloj para estar en ese día de la prueba. */
export function desfaseHasta(dia, { fechaInicioPrueba, diaTerminaA, ahora }) {
  const hoy = diaDePrueba(fechaInicioPrueba, { ahora, diaTerminaA })
  return hoy === null ? 0 : dia - hoy
}

export default function DiagnosticoSuscripcion({ uid }) {
  const suscripcion = useSuscripcion()
  const [abierto, setAbierto] = useState(true)
  const [cliente, setCliente] = useState(null)
  const [planes, setPlanes] = useState(null)
  const [eventos, setEventos] = useState(eventosDeLaSesion)
  const [tarjeta, setTarjeta] = useState(() => tarjetaMarcada(uid))

  const mirar = useCallback(async (forzar = false) => {
    setCliente(await compras.cliente())
    setPlanes(await compras.planes({ forzar }))
  }, [])

  useEffect(() => {
    mirar()
  }, [mirar, suscripcion.customerInfo])

  useEffect(() => escucharDiagnostico(() => setEventos(eventosDeLaSesion())), [])

  const ir = (dia) => fijarDesfase(desfaseHasta(dia, { ...suscripcion, ahora: new Date() }))

  const controles = [
    ['dia6', () => ir(DIA_DE_LA_TARJETA)],
    ['dia8', () => ir(DIA_DE_LA_TARJETA + 2)],
    ['hoy', () => fijarDesfase(0)],
    [
      'olvidarTarjeta',
      () => {
        olvidarTarjeta(uid)
        setTarjeta(tarjetaMarcada(uid))
      },
    ],
    [
      'refrescar',
      async () => {
        await suscripcion.refrescar()
        await mirar(true)
      },
    ],
  ]

  return (
    <div className="flex flex-col gap-2 border-t border-on-surface pt-4">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className="self-start text-sm text-on-surface-soft underline"
      >
        {abierto ? t.plegar : t.desplegar}
      </button>
      {abierto && (
        <>
          {lineasDeSuscripcion({
            suscripcion,
            cliente,
            planes,
            eventos,
            ahora: new Date(),
            tarjeta,
          }).map((linea) => (
            <p key={linea} className="text-sm text-on-surface-soft">
              {linea}
            </p>
          ))}
          {controles.map(([id, alTocar]) => (
            <Button key={id} type="button" size="sm" variant="surface" onClick={alTocar}>
              {t[id]}
            </Button>
          ))}
        </>
      )}
    </div>
  )
}
