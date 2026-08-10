// src/components/formia/IdentidadCentral.jsx
// La identidad central: arriba, sola y con más peso que todo lo demás
// (SPEC_03 §6). No es un área más — es la que siempre existe (RN-ID-01).
//
// Hereda el contenido de R3 sin su botón "Seguir": aquí no hay pantalla
// siguiente, porque esto es un destino y no un tránsito (§C3.3).

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import { copy, interpolate } from '@copy'
import { sinPrefijoCentral, versionesRecientes } from '@/formia/identidad'
import EditorIdentidad from './EditorIdentidad'

const textos = copy.formia.identidad.central

function fechaLegible(iso) {
  try {
    return format(parseISO(iso), "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return iso
  }
}

export default function IdentidadCentral({
  central,
  history,
  restaurada = false,
  onGuardar,
  onCerrarAviso,
}) {
  const [editando, setEditando] = useState(false)
  const [verHistorial, setVerHistorial] = useState(false)

  const versiones = versionesRecientes(history)

  async function guardar(texto) {
    await onGuardar(texto)
    setEditando(false)
  }

  return (
    <Card elevated className="flex flex-col gap-5 p-6">
      {editando ? (
        <EditorIdentidad
          id="identidad-central"
          prefijo={textos.prefix}
          valor={sinPrefijoCentral(central)}
          placeholder={textos.placeholder}
          ayuda={textos.hint}
          onGuardar={guardar}
          onCancelar={() => setEditando(false)}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink/80">{textos.lead}</p>
            <p className="font-display text-xl text-ink leading-tight">{central}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              onClick={() => {
                onCerrarAviso?.()
                setEditando(true)
              }}
            >
              {textos.edit}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setVerHistorial((abierto) => !abierto)}
              aria-expanded={verHistorial}
              aria-controls="identidad-central-historial"
            >
              {verHistorial ? textos.historyHide : textos.history}
            </Button>
          </div>
        </>
      )}

      {/* RN-ID-01 — Vaciar el campo no borra nada: se dice y se sigue. */}
      {restaurada && (
        <p className="text-sm text-ink/80 bg-surface-subtle rounded-sm px-4 py-3" role="status">
          {textos.restored}
        </p>
      )}

      {verHistorial && !editando && (
        <div id="identidad-central-historial" className="flex flex-col gap-3 pt-2">
          <h3 className="text-sm font-medium text-ink/80">{textos.historyTitle}</h3>
          {versiones.length === 0 ? (
            <p className="text-sm text-ink/80">{textos.historyEmpty}</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {versiones.map((version) => (
                <li
                  key={`${version.from}-${version.text}`}
                  className="border-l-2 border-border-subtle pl-4"
                >
                  <p className="text-base text-ink">{version.text}</p>
                  <p className="text-sm text-ink/80">
                    {version.to === null
                      ? textos.historyCurrent
                      : interpolate(textos.historyUntilTemplate, {
                          hasta: fechaLegible(version.to),
                        })}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </Card>
  )
}
