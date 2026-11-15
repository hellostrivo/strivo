// src/components/perfil/TusDatos.jsx
// El bloque «Tus datos»: llevarse lo escrito y, con cuenta, borrarla (SPEC_24).
//
// **Llevarse lo escrito es fácil y está siempre a mano**: un texto, un botón y
// nada más, con cuenta y sin ella, con red y sin ella. Lo que pasa se dice en
// voz baja, en un contenedor `aria-live`, y cancelar la hoja de compartir no
// dice nada.
//
// **Nada bloquea.** El botón no se apaga mientras se prepara: un segundo toque
// en camino no hace nada (`unaVezCon`).
//
// Lo que sabe del diario no lo sabe este componente: la función que prepara
// el archivo y la puerta del Journal le llegan por props desde `App.jsx`
// (RN-TEC-07). Aquí se pinta y se traducen resultados a frases.

import { useCallback, useRef, useState } from 'react'
import Button from '@components/ui/Button'
import { unaVezCon } from '@components/shared/unaVez'
import { copy } from '@copy'
import { useBarraDeEstado } from '@lib/barraEstado'
import { ESTADOS_SESION } from '@lib/sesion'
import { useSesion } from '@lib/useSesion'

const textos = copy.cuenta.exportar

/** La capa a pantalla completa donde se monta la puerta del Journal. */
function CapaDePuerta({ children }) {
  useBarraDeEstado({ capa: 'modal' })
  return (
    <div
      data-surface="light"
      className="fixed inset-0 z-50 overflow-y-auto bg-espacio text-on-surface"
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}

/**
 * @param {object} props
 * @param {string} props.uid
 * @param {{exportar: Function, pidePuerta: Function}} props.exportacion - de `App.jsx`.
 * @param {Function} props.Puerta - `PuertaDelJournal`, de `App.jsx`.
 * @param {import('react').ReactNode} [props.children] - lo que va debajo (24B).
 */
export default function TusDatos({ uid, exportacion, Puerta, children = null }) {
  const sesion = useSesion()
  const [puerta, setPuerta] = useState(false)
  const [preparando, setPreparando] = useState(false)
  const [avisos, setAvisos] = useState([])
  const ocupado = useRef(false)
  const unaVez = unaVezCon(ocupado)

  const preparar = useCallback(async () => {
    setPreparando(true)
    setAvisos([])
    try {
      const r = await exportacion.exportar(uid, {
        conCuenta: sesion.estado === ESTADOS_SESION.conCuenta,
      })
      const siguientes = []
      if (r.sinEntradas) siguientes.push('sinEntradas')
      if (!r.completo) siguientes.push('incompleto')
      if (r.entrega === 'descargado') siguientes.push('descargado')
      setAvisos(siguientes)
    } catch {
      setAvisos(['error'])
    } finally {
      setPreparando(false)
    }
  }, [exportacion, uid, sesion.estado])

  const alTocar = () =>
    unaVez(async () => {
      if (await exportacion.pidePuerta(uid)) {
        setPuerta(true)
        return
      }
      await preparar()
    })

  const alAbrirPuerta = useCallback(() => {
    setPuerta(false)
    unaVez(preparar)
    // `unaVez` y `preparar` no cambian lo que decide esto.
  }, [preparar])

  const alCerrarPuerta = useCallback(() => setPuerta(false), [])

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-base text-on-surface">{textos.titulo}</h3>
        <p className="text-sm text-on-surface-soft leading-relaxed">{textos.texto}</p>
        <div>
          <Button type="button" size="sm" variant="surface" onClick={alTocar}>
            {textos.boton}
          </Button>
        </div>
        <div aria-live="polite" className="flex flex-col gap-1">
          {preparando && <p className="text-sm text-on-surface-soft">{textos.preparando}</p>}
          {avisos.map((clave) => (
            <p key={clave} className="text-sm text-on-surface-soft leading-relaxed">
              {textos[clave]}
            </p>
          ))}
        </div>
      </section>

      {children}

      {puerta && (
        <CapaDePuerta>
          <Puerta uid={uid} onAbierta={alAbrirPuerta} onCerrar={alCerrarPuerta} />
        </CapaDePuerta>
      )}
    </div>
  )
}
