// src/components/suscripcion/HojaDeCodigo.jsx
// La hoja «Tu código» (SPEC_25B, DP-25.22). Arma el enlace y lo abre en el App
// Store, donde se confirma: aquí no se valida nada.
//
// «Continuar» no se deshabilita: con el campo vacío devuelve el foco al campo y
// no pasa nada más. Se cierra con «Cancelar» o con Escape, sin efectos.

import { useEffect, useId, useRef, useState } from 'react'
import Button from '@components/ui/Button'
import { CampoLinea } from '@components/shared/Campo'
import { copy } from '@copy'
import { useBarraDeEstado } from '@lib/barraEstado'
import { urlDeCanje } from '@lib/suscripcion/canje'

const t = copy.suscripcion.codigo
const ENFOCABLES = 'button, input'

/**
 * Lo que hace «Continuar». Fuera del componente para probarlo sin navegador.
 * @returns {boolean} ¿se abrió algo?
 */
export function continuarCon(texto, { enfocar, abrir, onAbierto }) {
  const url = urlDeCanje(texto)
  if (!url) {
    enfocar()
    return false
  }
  // Antes de abrir: la app puede irse al fondo en cuanto se abre.
  onAbierto()
  abrir(url)
  return true
}

/**
 * @param {object} props
 * @param {() => void} props.onCancelar
 * @param {() => void} props.onAbierto - justo antes de ir al App Store.
 */
export default function HojaDeCodigo({ onCancelar, onAbierto }) {
  const id = useId()
  const [texto, setTexto] = useState('')
  const campo = useRef(null)
  const caja = useRef(null)
  useBarraDeEstado({ capa: 'modal' })

  useEffect(() => {
    const anterior = document.activeElement
    campo.current?.focus()
    return () => anterior?.focus?.()
  }, [])

  const alTeclear = (evento) => {
    if (evento.key === 'Escape') {
      evento.preventDefault()
      return onCancelar()
    }
    if (evento.key !== 'Tab') return undefined
    const enfocables = [...(caja.current?.querySelectorAll(ENFOCABLES) ?? [])]
    const primero = enfocables[0]
    const ultimo = enfocables[enfocables.length - 1]
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault()
      ultimo?.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primero?.focus()
    }
    return undefined
  }

  const alEnviar = (evento) => {
    evento.preventDefault()
    continuarCon(texto, {
      enfocar: () => campo.current?.focus(),
      abrir: (url) => window.open(url, '_blank'),
      onAbierto,
    })
  }

  return (
    <div
      data-surface="light"
      className="fixed inset-0 z-50 flex items-center justify-center bg-espacio px-5 text-on-surface"
    >
      <form
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-aviso`}
        onKeyDown={alTeclear}
        onSubmit={alEnviar}
        noValidate
        className="flex w-full max-w-sm flex-col gap-5 rounded-lg border border-on-surface bg-raised p-6"
      >
        <h2 id={`${id}-titulo`} className="font-display text-md text-on-surface">
          {t.titulo}
        </h2>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-on-surface-soft">{t.campo}</span>
          <CampoLinea
            ref={campo}
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <p id={`${id}-aviso`} className="text-base text-on-surface-soft leading-relaxed">
          {t.aviso}
        </p>
        <div className="flex flex-col gap-3">
          <Button type="submit" variant="surface" fullWidth>
            {t.continuar}
          </Button>
          <Button type="button" variant="surface" fullWidth onClick={onCancelar}>
            {t.cancelar}
          </Button>
        </div>
      </form>
    </div>
  )
}
