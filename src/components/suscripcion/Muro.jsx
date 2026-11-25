// src/components/suscripcion/Muro.jsx
// El muro de pago (SPEC_25 §3.3, DP-25.20 y DP-25.23).
//
// **Se cierra siempre, sin preguntar nada** (RN-EST-08): «Ahora no» tras la
// prueba y «Cerrar» durante ella. Nada aquí presiona: ni cuenta regresiva, ni
// comparación entre planes, ni un plan marcado como mejor.
//
// **Ningún precio es nuestro**: todos salen de la tienda. Sin planes o sin red,
// se dice y se ofrece reintentar, sin tarjetas y sin precios inventados.
//
// Comprar y restaurar pasan de uno en uno (`unaVezCon`); ningún control lleva
// `disabled`. El texto va entero en la tinta principal: el secundario, sobre la
// parada clara del degradado de noche, no llega a AAA.

import { useCallback, useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { unaVezCon } from '@components/shared/unaVez'
import { copy } from '@copy'
import { momentoDe } from '@lib/timeSlot'
import { useBarraDeEstado } from '@lib/barraEstado'
import { compras } from '@lib/compras'
import { anotarEvento } from '@lib/suscripcion/diagnostico'
import { mostrarFundador } from '@lib/suscripcion/fundador'
import { preseleccionada, tarjetasDe } from '@lib/suscripcion/planes'
import { URL_PRIVACIDAD, URL_TERMINOS } from '@lib/suscripcion/enlaces'
import { ESTADOS } from '@lib/suscripcion/estado'

const t = copy.suscripcion.paywall

const ENLACE =
  'inline-flex items-center rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30'

/** Las tarjetas de plan. Elegida se dice con borde, peso y `aria-pressed`. */
export function TarjetasDePlan({ tarjetas, elegida, onElegir }) {
  return (
    <div className="flex flex-col gap-3">
      {tarjetas.map((tarjeta) => {
        const activa = tarjeta.id === elegida
        return (
          <button
            key={tarjeta.id}
            type="button"
            aria-pressed={activa}
            aria-label={[tarjeta.enVoz, tarjeta.texto].filter(Boolean).join('. ')}
            onClick={() => onElegir(tarjeta.id)}
            className={clsx(
              'flex min-h-touch flex-col gap-1 rounded-lg border-2 bg-raised p-4 text-left text-on-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
              activa ? 'border-current font-medium' : 'border-on-surface',
            )}
          >
            <span className="text-base">{tarjeta.titulo}</span>
            <span className="text-base">{tarjeta.detalle}</span>
            {tarjeta.texto && <span className="text-sm">{tarjeta.texto}</span>}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Lo que se ve, sin decidir nada.
 *
 * @param {object} props
 * @param {'cargando'|'listos'|'sinPlanes'} props.carga
 */
export function MuroVista({
  estado,
  carga,
  tarjetas,
  elegida,
  nota,
  onElegir,
  onContinuar,
  onRestaurar,
  onReintentar,
  onCodigo,
  onCerrar,
  urlPrivacidad = URL_PRIVACIDAD,
  tituloRef = null,
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 pb-12 pt-[max(2rem,env(safe-area-inset-top))]">
      <header className="flex flex-col gap-3">
        <h1
          ref={tituloRef}
          tabIndex={-1}
          className="font-display text-xl text-on-surface focus:outline-none"
        >
          {t.titulo}
        </h1>
        <p className="text-base text-on-surface leading-relaxed">{t.texto}</p>
      </header>

      {carga === 'cargando' && <div className="min-h-touch" aria-busy="true" />}

      {carga === 'sinPlanes' && (
        <div className="flex flex-col items-start gap-3" role="status">
          <p className="text-base text-on-surface leading-relaxed">{t.sinPlanes}</p>
          <Button type="button" size="sm" variant="surface" onClick={onReintentar}>
            {t.reintentar}
          </Button>
        </div>
      )}

      {carga === 'listos' && (
        <>
          <TarjetasDePlan tarjetas={tarjetas} elegida={elegida} onElegir={onElegir} />
          <p className="text-sm text-on-surface leading-relaxed">{t.renovacion}</p>
          <Button type="button" variant="surface" fullWidth onClick={onContinuar}>
            {t.boton}
          </Button>
        </>
      )}

      <div aria-live="polite">
        {nota && <p className="text-base text-on-surface leading-relaxed">{nota}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <button type="button" className={ENLACE} onClick={onRestaurar}>
          {t.restaurar}
        </button>
        <button type="button" className={ENLACE} onClick={onCodigo}>
          {t.tengoCodigo}
        </button>
        <a className={ENLACE} href={URL_TERMINOS} target="_blank" rel="noopener noreferrer">
          {t.terminos}
        </a>
        {urlPrivacidad && (
          <a className={ENLACE} href={urlPrivacidad} target="_blank" rel="noopener noreferrer">
            {t.privacidad}
          </a>
        )}
        <button type="button" className={ENLACE} onClick={onCerrar}>
          {estado === ESTADOS.lectura ? t.ahoraNo : t.cerrar}
        </button>
      </div>
    </div>
  )
}

/**
 * @param {object} props
 * @param {string} props.estado - el de la suscripción.
 * @param {() => void} props.onCerrar
 * @param {() => void} props.onCodigo - abre la hoja del código.
 * @param {?string} props.notaDeCodigo - lo que se dice al volver de un canje sin aplicar.
 * @param {(texto: string) => void} props.onAcuse - cierra el muro y dice una frase.
 * @param {() => Promise<{motivo: string}>} props.restaurar
 */
export default function Muro({
  estado,
  onCerrar,
  onCodigo,
  notaDeCodigo = null,
  onAcuse,
  restaurar,
}) {
  const momento = momentoDe()
  useBarraDeEstado({ capa: 'pantalla', momento })
  const [planes, setPlanes] = useState(null)
  const [carga, setCarga] = useState('cargando')
  const [elegida, setElegida] = useState(null)
  const [nota, setNota] = useState(null)
  const ocupado = useRef(false)
  const unaVez = unaVezCon(ocupado)
  const titulo = useRef(null)
  const vivo = useRef(true)

  const traer = useCallback(async () => {
    setCarga('cargando')
    const llegados = await compras.planes()
    if (!vivo.current) return
    setPlanes(llegados)
    const tarjetas = tarjetasDe(llegados)
    setElegida((actual) => actual ?? preseleccionada(tarjetas))
    setCarga(tarjetas.length > 0 ? 'listos' : 'sinPlanes')
  }, [])

  useEffect(() => {
    vivo.current = true
    anotarEvento('paywall_visto')
    const anterior = document.activeElement
    titulo.current?.focus()
    traer()
    return () => {
      vivo.current = false
      anterior?.focus?.()
    }
  }, [traer])

  const conFundador = mostrarFundador({
    metadata: planes?.metadata,
    paquete: planes?.fundador,
    estado,
    ahora: new Date(),
  })
  const tarjetas = tarjetasDe(planes, { conFundador })

  const continuar = () =>
    unaVez(async () => {
      const tarjeta = tarjetas.find(({ id }) => id === elegida)
      if (!tarjeta) return
      setNota(null)
      anotarEvento('compra_iniciada', tarjeta.id)
      const r = await compras.comprar(tarjeta.paquete)
      if (r.motivo === 'ok') {
        anotarEvento('compra_ok', tarjeta.id)
        onAcuse(t.gracias)
        return
      }
      if (r.motivo === 'cancelada') anotarEvento('compra_cancelada', tarjeta.id)
      else if (vivo.current) setNota(t.errorCompra)
    })

  const alRestaurar = () =>
    unaVez(async () => {
      setNota(null)
      const r = await restaurar()
      if (r.motivo === 'restaurado') onAcuse(t.restaurado)
      else if (vivo.current) setNota(r.motivo === 'nada' ? t.nadaQueRestaurar : t.errorRestaurar)
    })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.titulo}
      onKeyDown={(evento) => {
        if (evento.key === 'Escape') onCerrar()
      }}
      data-momento={momento}
      data-surface={momento === 'noche' ? 'dark' : 'light'}
      className="fixed inset-0 z-50 overflow-y-auto bg-strivo-base bg-strivo text-on-surface"
    >
      <MuroVista
        estado={estado}
        carga={carga}
        tarjetas={tarjetas}
        elegida={elegida}
        nota={nota ?? notaDeCodigo}
        onElegir={setElegida}
        onContinuar={continuar}
        onRestaurar={alRestaurar}
        onReintentar={() => unaVez(traer)}
        onCodigo={() => {
          setNota(null)
          onCodigo()
        }}
        onCerrar={onCerrar}
        tituloRef={titulo}
      />
    </div>
  )
}
