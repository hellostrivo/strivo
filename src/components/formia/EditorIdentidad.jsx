// src/components/formia/EditorIdentidad.jsx
// Editor compartido de identidad: la central y la de cada área usan este mismo
// campo (SPEC_03 §6).
//
// Es un editor en línea, no un modal: en un espacio consultable, editar la
// identidad es un uso legítimo y frecuente (§C3.3), no una interrupción.
//
// Quien lo usa decide qué texto entra y qué texto sale; aquí no se transforma
// nada. El prefijo ("Alguien que", "En Salud soy alguien que") se enseña, no se
// escribe: acompaña sin ocupar el campo.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { copy } from '@copy'

/**
 * @param {string}   prefijo      - Texto que precede al campo. Se muestra, no se edita.
 * @param {string}   valor        - Contenido inicial del campo.
 * @param {string}   [placeholder]
 * @param {string}   [ayuda]      - Nota bajo el campo.
 * @param {string}   id           - Para enlazar etiqueta y campo.
 * @param {Function} onGuardar    - Recibe el texto del campo, tal cual.
 * @param {Function} onCancelar
 * @param {boolean}  [guardando]
 */
export default function EditorIdentidad({
  prefijo,
  valor = '',
  placeholder,
  ayuda,
  id,
  onGuardar,
  onCancelar,
  guardando = false,
}) {
  const [texto, setTexto] = useState(valor)
  const campo = useRef(null)

  useEffect(() => {
    campo.current?.focus()
  }, [])

  const ayudaId = ayuda ? `${id}-ayuda` : undefined

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(evento) => {
        evento.preventDefault()
        onGuardar(texto)
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm text-ink/80 font-medium">
          {prefijo}
        </label>
        <textarea
          id={id}
          ref={campo}
          rows={2}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder={placeholder}
          aria-describedby={ayudaId}
          className={clsx(
            'w-full resize-none rounded-md bg-surface',
            'border border-border px-4 py-3',
            // El placeholder se queda por debajo del texto real a propósito:
            // un ejemplo no puede parecer una respuesta ya escrita. La misma
            // información está repetida en la nota de ayuda, que sí va a AAA.
            'font-display text-md text-ink placeholder:text-ink/70',
            'transition-colors duration-260 ease-smooth',
            'focus:outline-none focus:border-ink/40',
            'focus-visible:ring-2 focus-visible:ring-ink/20',
            'motion-reduce:transition-none',
          )}
        />
        {ayuda && (
          <p id={ayudaId} className="text-sm text-ink/80">
            {ayuda}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="sm" loading={guardando}>
          {copy.formia.identidad.editor.save}
        </Button>
        {onCancelar && (
          <Button type="button" size="sm" variant="ghost" onClick={onCancelar}>
            {copy.formia.identidad.editor.cancel}
          </Button>
        )}
      </div>
    </form>
  )
}
