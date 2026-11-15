// src/components/perfil/CapaDeBorrado.jsx
// Los pasos de «Borrar mi cuenta» (SPEC_24B), en una capa a pantalla completa.
//
// **Se entiende sin miedo y se confirma sin culpa.** Se dice qué se borra, qué
// no, y que no tiene vuelta; «Quedarme» está siempre, salvo mientras se borra,
// que no hay nada a medias que dejar. Salir de cualquier paso no pide
// confirmación (RN-EST-08).
//
// **Nada bloquea** (§1.1): ningún control lleva `disabled`, `required` ni
// `aria-invalid`. Lo que falte se dice en palabras junto al campo, anunciado
// con `aria-describedby`. Un segundo toque en camino no hace nada
// (`unaVezCon`). **Ningún error muestra un código** (RN-EST-04).
//
// Un diálogo de verdad, como `Confirmacion`: `role="dialog"`, `aria-modal`, el
// foco entra al título de cada paso y Escape es «Quedarme». Sin animación.
//
// Lo que decide cada cosa no vive aquí: verificar, borrar y conservar son de
// la sesión (`useSesion`), que es quien puede cambiar el uid. Este componente
// pinta los pasos y traduce resultados a frases.

import { useEffect, useId, useRef, useState } from 'react'
import Button from '@components/ui/Button'
import BotonProveedor from '@components/shared/BotonProveedor'
import { CampoLinea } from '@components/shared/Campo'
import { unaVezCon } from '@components/shared/unaVez'
import { copy, interpolate } from '@copy'
import { useBarraDeEstado } from '@lib/barraEstado'
import { ESTADOS, palabraCoincide } from '@lib/borrarCuenta'
import { useSesion } from '@lib/useSesion'

const textos = copy.cuenta.borrar
const P7 = copy.diario.onboarding.p7
const PROVEEDOR_DE_BOTON = Object.freeze({ 'google.com': 'google', 'apple.com': 'apple' })
const URL_DE_SUSCRIPCIONES = 'https://apps.apple.com/account/subscriptions'

const ENLACE =
  'self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30'

/** De lo que dice la verificación a la frase que se lee. */
function notaDeVerificacion(motivo) {
  if (motivo === 'credenciales') return copy.diario.journal.pin.recuperar.credenciales
  if (motivo === 'sin-conexion') return copy.cuenta.error.sinConexion
  if (motivo === 'cancelado' || motivo === 'pide-contrasena') return null
  return copy.cuenta.error.generico
}

/**
 * @param {object} props
 * @param {'perfil'|'aMedias'} props.modo - desde Tu perfil, o al abrir la app
 *   con un borrado interrumpido.
 * @param {boolean} [props.iphone] - las frases de suscripción y compras.
 * @param {boolean} [props.sinSesion] - D12: hay que entrar antes.
 * @param {() => void} [props.onQuedarme]
 * @param {() => void} [props.onExportar] - «Antes, llevarme lo que escribí».
 * @param {() => void} [props.onCerrar] - tras «Conservar mi cuenta».
 * @param {import('react').ReactNode} [props.diagnostico]
 */
export default function CapaDeBorrado({
  modo = 'perfil',
  iphone = false,
  sinSesion = false,
  onQuedarme,
  onExportar,
  onCerrar,
  diagnostico = null,
}) {
  const sesion = useSesion()
  const id = useId()
  const [paso, setPaso] = useState(modo === 'aMedias' ? ESTADOS.aMedias : ESTADOS.inicio)
  const [metodo, setMetodo] = useState(null)
  const [contrasena, setContrasena] = useState('')
  const [palabra, setPalabra] = useState('')
  const [nota, setNota] = useState(null)
  // D12: sin sesión, «Conservar» también pide entrar antes; tras entrar,
  // conserva en vez de seguir a la confirmación.
  const [conservando, setConservando] = useState(false)
  const titulo = useRef(null)
  const ocupado = useRef(false)
  const unaVez = unaVezCon(ocupado)

  useBarraDeEstado({ capa: 'modal' })

  // El foco va al título de cada paso: es lo que el lector de pantalla dice.
  useEffect(() => {
    titulo.current?.focus()
  }, [paso])

  const ir = (siguiente) => {
    setNota(null)
    setPaso(siguiente)
  }

  const quedarme = () => {
    setContrasena('')
    onQuedarme?.()
  }

  const continuar = () =>
    unaVez(async () => {
      if (!sesion.hayConexionParaBorrar()) {
        setNota(textos.necesitaConexion)
        return
      }
      setMetodo(await sesion.metodoParaBorrar())
      setContrasena('')
      ir(ESTADOS.verificar)
    })

  const verificar = () =>
    unaVez(async () => {
      const r = await sesion.verificarParaBorrar(metodo === 'password' ? { contrasena } : {})
      setContrasena('')
      if (r.ok) {
        setPalabra('')
        ir(ESTADOS.confirmar)
        return
      }
      setNota(notaDeVerificacion(r.motivo))
    })

  const borrar = () =>
    unaVez(async () => {
      if (!palabraCoincide(palabra)) {
        setNota(textos.confirmarNoCoincide)
        return
      }
      ir(ESTADOS.borrando)
      const r = await sesion.borrarCuenta()
      if (r.ok) return // La despedida la pinta la sesión.
      if (r.estado === 'reverificar') return ir(ESTADOS.verificar)
      if (r.estado === 'necesitaConexion') {
        setPaso(ESTADOS.confirmar)
        return setNota(textos.necesitaConexion)
      }
      if (r.estado === ESTADOS.errorAntes) return ir(ESTADOS.errorAntes)
      return ir(ESTADOS.errorDurante)
    })

  const terminar = () =>
    unaVez(async () => {
      if (!sesion.hayConexionParaBorrar()) {
        setNota(textos.necesitaConexion)
        return
      }
      setMetodo(await sesion.metodoParaBorrar())
      ir(ESTADOS.verificar)
    })

  const conservar = () =>
    unaVez(async () => {
      if (sinSesion && !sesion.verificadaParaBorrar()) {
        setMetodo(await sesion.metodoParaBorrar())
        ir(ESTADOS.verificar)
        setNota(null)
        setConservando(true)
        return
      }
      const r = await sesion.conservarCuenta()
      if (r.ok) ir(ESTADOS.conservada)
      else setNota(copy.cuenta.error.generico)
    })

  const verificarYSeguir = () =>
    unaVez(async () => {
      const r = await sesion.verificarParaBorrar(metodo === 'password' ? { contrasena } : {})
      setContrasena('')
      if (!r.ok) return setNota(notaDeVerificacion(r.motivo))
      if (conservando) {
        const c = await sesion.conservarCuenta()
        return c.ok ? ir(ESTADOS.conservada) : setNota(copy.cuenta.error.generico)
      }
      setPalabra('')
      return ir(ESTADOS.confirmar)
    })

  const alTeclear = (evento) => {
    if (evento.key === 'Escape' && paso !== ESTADOS.borrando && onQuedarme) {
      evento.preventDefault()
      quedarme()
    }
  }

  // Funciones que devuelven elementos, no componentes: un componente
  // declarado aquí dentro se remontaría en cada pintado.
  const tituloDe = (texto) => (
    <h2
      ref={titulo}
      tabIndex={-1}
      id={`${id}-titulo`}
      className="font-display text-lg text-on-surface focus:outline-none"
    >
      {texto}
    </h2>
  )
  const parrafo = (texto) => (
    <p className="text-base text-on-surface-soft leading-relaxed">{texto}</p>
  )
  const notaVisible = nota ? (
    <p id={`${id}-nota`} className="text-sm text-on-surface leading-relaxed" aria-live="polite">
      {nota}
    </p>
  ) : null
  const botonQuedarme = onQuedarme ? (
    <button type="button" onClick={quedarme} className={ENLACE}>
      {textos.quedarme}
    </button>
  ) : null

  let cuerpo
  if (paso === ESTADOS.inicio) {
    cuerpo = (
      <>
        {tituloDe(textos.titulo)}
        {parrafo(textos.queSeBorra)}
        {parrafo(textos.otroDispositivo)}
        {iphone && (
          <>
            {parrafo(textos.suscripcion)}
            <a
              href={URL_DE_SUSCRIPCIONES}
              target="_blank"
              rel="noopener noreferrer"
              className={ENLACE}
            >
              {textos.suscripcionEnlace}
            </a>
            {parrafo(textos.compras)}
          </>
        )}
        {notaVisible}
        <div className="flex flex-col gap-3">
          {onExportar && (
            <Button type="button" variant="surface" fullWidth onClick={onExportar}>
              {textos.exportarAntes}
            </Button>
          )}
          <Button type="button" variant="surface" fullWidth onClick={continuar}>
            {textos.continuar}
          </Button>
        </div>
        {botonQuedarme}
      </>
    )
  } else if (paso === ESTADOS.verificar) {
    const nombre = textos.proveedores[metodo]
    const enAMedias = modo === 'aMedias' && sinSesion && !sesion.verificadaParaBorrar()
    const accion = modo === 'aMedias' ? verificarYSeguir : verificar
    cuerpo = (
      <>
        {tituloDe(textos.verificarTitulo)}
        {enAMedias && parrafo(textos.entrarAntes)}
        {metodo === 'password' ? (
          <>
            {parrafo(textos.porQuePedimosContrasena)}
            <label className="flex flex-col gap-2">
              <span className="text-sm text-on-surface-soft">
                {copy.cuenta.formulario.contrasena}
              </span>
              <CampoLinea
                type="password"
                autoComplete="current-password"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                aria-describedby={nota ? `${id}-nota` : undefined}
              />
            </label>
            {notaVisible}
            <Button type="button" variant="surface" fullWidth onClick={accion}>
              {textos.verificar}
            </Button>
          </>
        ) : (
          <>
            {parrafo(interpolate(textos.porQuePedimosProveedor, { proveedor: nombre ?? '' }))}
            {notaVisible}
            {PROVEEDOR_DE_BOTON[metodo] && (
              <BotonProveedor
                proveedor={PROVEEDOR_DE_BOTON[metodo]}
                texto={P7[PROVEEDOR_DE_BOTON[metodo]]}
                onClick={accion}
              />
            )}
          </>
        )}
        {botonQuedarme}
      </>
    )
  } else if (paso === ESTADOS.confirmar) {
    cuerpo = (
      <>
        {tituloDe(textos.confirmarTitulo)}
        <label className="flex flex-col gap-2">
          <span className="text-base text-on-surface-soft">{textos.confirmarTexto}</span>
          <CampoLinea
            type="text"
            value={palabra}
            placeholder={textos.confirmarPlaceholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="uppercase"
            onChange={(evento) => setPalabra(evento.target.value)}
            aria-describedby={nota ? `${id}-nota` : undefined}
          />
        </label>
        {notaVisible}
        <Button type="button" variant="surface" fullWidth onClick={borrar}>
          {textos.boton}
        </Button>
        {botonQuedarme}
      </>
    )
  } else if (paso === ESTADOS.borrando) {
    cuerpo = (
      <div aria-busy="true" aria-live="polite">
        {tituloDe(textos.borrando)}
      </div>
    )
  } else if (paso === ESTADOS.errorAntes) {
    cuerpo = (
      <>
        {tituloDe(textos.titulo)}
        {parrafo(textos.errorAntes)}
        {botonQuedarme}
      </>
    )
  } else if (paso === ESTADOS.errorDurante || paso === ESTADOS.aMedias) {
    // Nada se queda sin decidir: o se termina, o se conserva.
    cuerpo = (
      <>
        {tituloDe(paso === ESTADOS.aMedias ? textos.aMediasTitulo : textos.titulo)}
        {parrafo(paso === ESTADOS.aMedias ? textos.aMediasTexto : textos.errorDurante)}
        {notaVisible}
        <div className="flex flex-col gap-3">
          <Button type="button" variant="surface" fullWidth onClick={terminar}>
            {textos.terminar}
          </Button>
          <Button type="button" variant="surface" fullWidth onClick={conservar}>
            {textos.conservar}
          </Button>
        </div>
      </>
    )
  } else if (paso === ESTADOS.conservada) {
    cuerpo = (
      <>
        {tituloDe(textos.conservar)}
        {parrafo(textos.conservada)}
        <Button
          type="button"
          variant="surface"
          fullWidth
          onClick={() => (onCerrar ?? onQuedarme)?.()}
        >
          {textos.cerrar}
        </Button>
      </>
    )
  }

  return (
    <div
      data-surface="light"
      className="fixed inset-0 z-50 overflow-y-auto bg-espacio text-on-surface"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        onKeyDown={alTeclear}
        className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center gap-5 px-5 py-10 pt-safe"
      >
        {cuerpo}
        {diagnostico}
      </div>
    </div>
  )
}
