// src/components/formia/AreaCard.jsx
// Una tarjeta por área elegida, del color de su área (SPEC_03 §6).
//
// La identidad de área es opcional (RN-ID-03): cuando no está, se invita con
// suavidad y no se deja un hueco que parezca una falta.
//
// Aquí sí se muestra la frase de identidad de área: §5.7.4 la retiró de las
// listas de hábitos, no del producto, y este espacio es uno de los sitios donde
// está bien contextualizada.

import { useId, useState } from 'react'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import { copy, interpolate } from '@copy'
import AreaIcon from './AreaIcon'
import EditorIdentidad from './EditorIdentidad'

const textos = copy.formia.identidad.areas

export default function AreaCard({ area, onGuardarIdentidad, onPausar, onReanudar, onQuitar }) {
  const [editando, setEditando] = useState(false)
  const idBase = useId()
  const nombre = textos.names[area.id]
  const enPausa = area.state === 'pausada'

  async function guardar(texto) {
    await onGuardarIdentidad(area.id, texto)
    setEditando(false)
  }

  // Una pausa no se señala apagando la tarjeta: lo dicen la etiqueta y la nota,
  // y el contraste se mantiene igual de legible que en las demás.
  return (
    <Card className="flex flex-col gap-4 border-l-4" style={{ borderLeftColor: area.color }}>
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center w-9 h-9 rounded-full text-ink flex-shrink-0"
          style={{ backgroundColor: area.color }}
        >
          <AreaIcon areaId={area.id} />
        </span>
        <h3 id={`${idBase}-nombre`} className="text-base font-medium text-ink flex-1">
          {nombre}
        </h3>
        {enPausa && (
          <span className="text-sm text-ink/80 rounded-full bg-surface-muted px-3 py-1">
            {textos.pausedTitle}
          </span>
        )}
      </div>

      {editando ? (
        <EditorIdentidad
          id={`${idBase}-identidad`}
          prefijo={interpolate(textos.identityPrefixTemplate, { area: nombre })}
          valor={area.identityText ?? ''}
          placeholder={textos.identityPlaceholder}
          onGuardar={guardar}
          onCancelar={() => setEditando(false)}
        />
      ) : (
        <>
          {area.identityText ? (
            <p className="font-display text-md text-ink leading-snug">
              {interpolate(textos.identityTemplate, {
                area: nombre,
                identidad: area.identityText,
              })}
            </p>
          ) : (
            <p className="text-base text-ink/80">{textos.identityEmpty}</p>
          )}

          {enPausa && <p className="text-sm text-ink/80">{textos.pausedNote}</p>}

          <div className="flex flex-wrap gap-2" aria-labelledby={`${idBase}-nombre`}>
            <Button size="sm" variant="secondary" onClick={() => setEditando(true)}>
              {area.identityText ? textos.identityEdit : textos.identityAdd}
            </Button>
            {enPausa ? (
              <Button size="sm" variant="ghost" onClick={() => onReanudar(area.id)}>
                {textos.resume}
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => onPausar(area.id)}>
                {textos.pause}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onQuitar(area.id)}>
              {textos.remove}
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
