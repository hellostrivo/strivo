// src/pages/formia/HabitoNuevo.jsx
// H3 — crear y editar un hábito (§5.7, corregido en §C3.6).
//
// Cuatro campos y ninguno escondido: nombre, emoji, identidad y momento. El
// campo de identidad **no** está plegado en "Más opciones": es el que sostiene
// todo Formia, así que se ve.
//
// RN-FO-H3-01 — Guardar está deshabilitado, no oculto, hasta que haya
// identidad; y deshabilitado **con la explicación visible**, nunca un error
// después de pulsar. Un botón gris sin motivo es un fallo de esta pantalla.
// RN-FO-H3-05 — Sin señal clara en el texto, el campo se queda sin resolver. No
// hay preselección de cortesía, ni siquiera de la identidad central.

import { useMemo, useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import SelectorEmoji from '@components/formia/SelectorEmoji'
import SelectorIdentidad from '@components/formia/SelectorIdentidad'
import { copy } from '@copy'
import { sugerirIdentidad } from '@/lib/sugerirIdentidad'
import { areasEnMarcha } from '@/formia/identidad'

const textos = copy.formia.habitos.editor
const momentos = copy.formia.habitos.momento

const CONTEXTOS = [
  { valor: 'manana', etiqueta: momentos.manana },
  { valor: 'noche', etiqueta: momentos.noche },
  { valor: null, etiqueta: momentos.ninguno },
]

export default function HabitoNuevo({ central, areas, habito = null, onGuardar, onCancelar }) {
  const editando = habito !== null

  const [nombre, setNombre] = useState(habito?.name ?? '')
  const [emoji, setEmoji] = useState(habito?.emoji ?? null)
  const [identityRef, setIdentityRef] = useState(habito?.identityRef ?? null)
  const [context, setContext] = useState(habito?.context ?? null)
  const [guardando, setGuardando] = useState(false)

  // RN-FO-H3-06 — La sugerencia solo puede proponer identidades que existen:
  // las áreas elegidas ahora mismo. Nunca propone crear un área nueva.
  const disponibles = useMemo(() => areasEnMarcha(areas).map((area) => area.id), [areas])
  const sugerida = useMemo(
    () => sugerirIdentidad(nombre, disponibles),
    [nombre, disponibles],
  )

  const faltaNombre = nombre.trim().length === 0
  const faltaIdentidad = identityRef === null
  const pendiente = faltaNombre
    ? textos.pendienteNombre
    : faltaIdentidad
      ? textos.pendiente
      : null

  async function guardar(evento) {
    evento.preventDefault()
    if (pendiente !== null) return
    setGuardando(true)
    await onGuardar({ name: nombre.trim(), emoji, identityRef, context })
    setGuardando(false)
  }

  return (
    <form className="min-h-screen bg-paper px-5 py-8 flex flex-col gap-8" onSubmit={guardar}>
      <h1 className="font-display text-lg text-ink">
        {editando ? textos.titleEditar : textos.titleNuevo}
      </h1>

      <div className="flex flex-col gap-2">
        <label htmlFor="habito-nombre" className="text-sm font-medium text-ink">
          {editando ? textos.nombre.labelEditar : textos.nombre.label}
        </label>
        <input
          id="habito-nombre"
          type="text"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          placeholder={textos.nombre.placeholder}
          className={clsx(
            'w-full rounded-md bg-surface border border-border px-4 py-3',
            'text-base text-ink placeholder:text-ink/70',
            'transition-colors duration-260 ease-smooth',
            'focus:outline-none focus:border-ink/40',
            'focus-visible:ring-2 focus-visible:ring-ink/20',
            'motion-reduce:transition-none',
          )}
        />
      </div>

      <SelectorIdentidad
        central={central}
        areas={areas}
        valor={identityRef}
        sugerida={sugerida}
        onElegir={setIdentityRef}
      />

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-ink">{textos.contexto.label}</p>
        <ul className="flex flex-wrap gap-2">
          {CONTEXTOS.map((opcion) => {
            const elegido = context === opcion.valor
            return (
              <li key={opcion.etiqueta}>
                <button
                  type="button"
                  onClick={() => setContext(opcion.valor)}
                  aria-pressed={elegido}
                  className={clsx(
                    'rounded-full border px-4 py-2 min-h-touch-sm text-base font-medium text-ink',
                    'transition-colors duration-260 ease-smooth',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
                    'motion-reduce:transition-none',
                    elegido ? 'border-ink bg-surface' : 'border-border bg-paper hover:bg-surface',
                  )}
                >
                  {opcion.etiqueta}
                </button>
              </li>
            )
          })}
        </ul>
        {/* El momento es etiqueta, no cita: nada se abre solo a esa hora. */}
        <p className="text-sm text-ink/80">{textos.contexto.hint}</p>
      </div>

      <SelectorEmoji valor={emoji} onElegir={setEmoji} />

      <div className="flex flex-col gap-3">
        {/* La explicación va **antes** del botón y siempre que esté apagado. */}
        {pendiente && (
          <p id="habito-pendiente" className="text-sm text-ink/80">
            {pendiente}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={pendiente !== null}
            loading={guardando}
            aria-describedby={pendiente ? 'habito-pendiente' : undefined}
          >
            {textos.save}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancelar}>
            {textos.cancel}
          </Button>
        </div>
      </div>
    </form>
  )
}
