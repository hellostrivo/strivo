// src/pages/lumia/Journal.jsx
// Journal: escritura libre, sin preguntas y sin juicio (§5.8).
//
// Si el Diario es la conversación guiada, el Journal es el silencio disponible.
// Es el único espacio de la app donde el sistema es **completamente mudo**: no
// sugiere texto, no corrige y no comenta nada sin que se le pida (RN-JR-03).
//
// RN-JR-PIN-01 — Con la protección activa, **nada del contenido se renderiza
// antes del desbloqueo**: ni lista difuminada, ni títulos, ni conteo, ni
// previsualización bajo un velo. Por eso `useJournal` no se monta hasta que
// `desbloqueado` es cierto: lo que no se pinta no se puede fotografiar, y lo
// que no se carga no está en memoria.
//
// La página es una superficie clara y declara `data-surface="light"` (§6.3.7).

import { useState } from 'react'
import BloqueoPin from '@components/lumia/BloqueoPin'
import ChipsEmociones from '@components/lumia/ChipsEmociones'
import { CampoLinea, CampoTexto } from '@components/lumia/Campo'
import Button from '@components/ui/Button'
import { copy, interpolate } from '@copy'
import {
  CATALOGO,
  ID_OTRA,
  MAX_PALABRA,
  alternarEmocion,
  etiquetasDe,
  primeraPalabra,
} from '@/lumia/emocionesJournal'
import { agrupar, buscar, extractoDe, horaDe } from '@/lumia/journal'
import { fechaCorta } from '@/lumia/fechas'
import { useJournal } from '@/lumia/useJournal'
import { usePin } from '@/lumia/usePin'

const textos = copy.lumia.journal

function Marco({ children }) {
  return (
    <div data-surface="light" className="min-h-screen bg-paper text-on-surface">
      {children}
    </div>
  )
}

export default function Journal({ uid, onHideNav }) {
  const pin = usePin(uid)

  if (pin.carga === 'cargando') {
    return <Marco>{<div className="min-h-screen" aria-busy="true" />}</Marco>
  }

  if (!pin.desbloqueado) {
    return (
      <Marco>
        <BloqueoPin modo="desbloqueo" estado={pin.estado} acciones={pin.acciones} />
      </Marco>
    )
  }

  return (
    <Marco>
      <JournalAbierto uid={uid} pin={pin} onHideNav={onHideNav} />
    </Marco>
  )
}

/**
 * El contenido, que solo existe cuando la puerta está abierta.
 *
 * Está en un componente aparte y no tras un `if` dentro del anterior por una
 * razón concreta: así `useJournal` —y con él la lectura de las entradas— no se
 * monta hasta que hay desbloqueo. Un hook detrás de una condición se ejecutaría
 * igual y las entradas estarían en memoria antes de tiempo.
 */
function JournalAbierto({ uid, pin, onHideNav }) {
  const { estado, borrador, carga, error, acciones, reintentar } = useJournal(uid)
  const [consulta, setConsulta] = useState('')
  const [ajustes, setAjustes] = useState(false)
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)
  const [aviso, setAviso] = useState(false)

  const abrirEditor = (entrada) => {
    acciones.abrir(entrada)
    setConfirmandoBorrado(false)
    onHideNav?.(true)
  }

  const cerrarEditor = async () => {
    await acciones.cerrar()
    setAviso(false)
    onHideNav?.(false)
  }

  if (carga === 'cargando') {
    return <div className="min-h-screen" aria-busy="true" />
  }

  if (carga === 'error') {
    return (
      <div className="flex min-h-screen flex-col justify-center gap-4 px-5">
        <p className="text-base text-on-surface">{copy.lumia.diario.error.load.body}</p>
        <div>
          <Button size="sm" variant="surface" onClick={reintentar}>
            {copy.lumia.diario.error.load.retry}
          </Button>
        </div>
      </div>
    )
  }

  // ─── Editor ─────────────────────────────────────────────────────────────────

  if (borrador) {
    const seleccion = borrador.emotions ?? []
    return (
      <div className="flex flex-col gap-6 px-5 pb-12 pt-6">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={cerrarEditor}
            className="rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {textos.editor.volver}
          </button>
          <p className="text-sm text-on-surface-soft">{fechaCorta(borrador.date)}</p>
        </header>

        {/* §5.8.1 — Tarjeta cálida: lo que siento. */}
        <section className="flex flex-col gap-3 rounded-md border border-journal-warm bg-journal-warm p-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-md text-on-surface">
              {textos.editor.emociones.titulo}
            </h2>
            <p className="text-sm text-on-surface-soft">{textos.editor.emociones.lead}</p>
          </div>

          <ChipsEmociones
            catalogo={CATALOGO}
            alternar={alternarEmocion}
            seleccion={seleccion}
            genero={estado.genero}
            etiqueta={textos.editor.emociones.titulo}
            aviso={aviso}
            avisoTexto={textos.editor.emociones.max}
            onCambiar={(siguiente) => acciones.escribir({ emotions: siguiente })}
            onDesplazada={() => setAviso(true)}
            otra={{
              id: ID_OTRA,
              chip: textos.editor.emociones.otra.chip,
              label: textos.editor.emociones.otra.label,
              placeholder: textos.editor.emociones.otra.placeholder,
              maxLength: MAX_PALABRA,
              valor: borrador.otherText ?? '',
              // El límite es duro **en el campo** y no solo al guardar
              // (§5.4.1): un campo que acepta dos palabras y guarda una las
              // está corrigiendo en silencio, que es justo lo que RN-DB4-08
              // prohíbe. Lo que se ve escrito es lo que se guarda.
              onCambiarValor: (valor) => acciones.escribir({ otherText: primeraPalabra(valor) }),
            }}
          />
        </section>

        {/* §5.8.1 — Tarjeta fría: lo que escribo. */}
        <section className="flex flex-col gap-3 rounded-md border border-journal-cool bg-journal-cool p-4">
          <h2 className="font-display text-md text-on-surface">{textos.editor.texto.titulo}</h2>
          <CampoTexto
            filas={10}
            filasMax={24}
            value={borrador.text ?? ''}
            onChange={(evento) => acciones.escribir({ text: evento.target.value })}
            onBlur={acciones.volcar}
            placeholder={textos.editor.texto.placeholder}
            aria-label={textos.editor.texto.titulo}
          />
        </section>

        {borrador.id && (
          <div>
            <Button
              size="sm"
              variant="surface"
              onClick={async () => {
                if (!confirmandoBorrado) return setConfirmandoBorrado(true)
                await acciones.borrar()
                setConfirmandoBorrado(false)
                onHideNav?.(false)
                return undefined
              }}
            >
              {confirmandoBorrado ? textos.editor.borrarConfirmar : textos.editor.borrar}
            </Button>
          </div>
        )}

        {error && (
          <p className="flex flex-wrap items-center gap-3 text-sm text-on-surface-soft" role="status">
            {copy.lumia.diario.error.save.body}
            <Button size="sm" variant="surface" onClick={error.reintentar}>
              {copy.lumia.diario.error.save.retry}
            </Button>
          </p>
        )}
      </div>
    )
  }

  // ─── Lista ──────────────────────────────────────────────────────────────────

  const encontradas = buscar(estado.entradas, consulta, estado.genero)
  const grupos = agrupar(encontradas, estado.fecha, textos.grupos)

  return (
    <div className="flex flex-col gap-6 px-5 pb-24 pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface">{textos.title}</h1>
        <p className="text-sm text-on-surface-soft">{textos.lead}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="surface" onClick={() => abrirEditor(null)}>
          {textos.nueva}
        </Button>
        <Button size="sm" variant="surface" onClick={() => setAjustes((previo) => !previo)}>
          {textos.pin.ajustes}
        </Button>
      </div>

      {ajustes && (
        <BloqueoPin
          modo="ajustes"
          estado={pin.estado}
          acciones={pin.acciones}
          onCerrar={() => setAjustes(false)}
        />
      )}

      {estado.entradas.length > 0 && (
        <CampoLinea
          type="search"
          value={consulta}
          onChange={(evento) => setConsulta(evento.target.value)}
          placeholder={textos.buscar.placeholder}
          aria-label={textos.buscar.label}
        />
      )}

      {estado.entradas.length === 0 && (
        <p className="text-base text-on-surface-soft">{textos.vacio}</p>
      )}

      {estado.entradas.length > 0 && encontradas.length === 0 && (
        <p className="text-base text-on-surface-soft" role="status">
          {textos.buscar.sinResultados}
        </p>
      )}

      {grupos.map((grupo) => (
        <section key={grupo.id} className="flex flex-col gap-2">
          <h2 className="text-sm text-on-surface-soft">{grupo.titulo}</h2>
          <ul className="flex flex-col gap-2">
            {grupo.entradas.map((entrada) => {
              const emociones = etiquetasDe(entrada.emotions, entrada.otherText, estado.genero)
              const extracto = extractoDe(entrada)
              return (
                <li key={entrada.id}>
                  <button
                    type="button"
                    onClick={() => abrirEditor(entrada)}
                    className="flex w-full flex-col gap-1 rounded-md border border-on-surface bg-surface p-4 text-left min-h-touch-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
                  >
                    <span className="text-sm text-on-surface-soft">
                      {interpolate(textos.entrada.fechaHoraTemplate, {
                        fecha: fechaCorta(entrada.date),
                        hora: horaDe(entrada),
                      })}
                    </span>
                    <span className="text-base text-on-surface">
                      {extracto === '' ? textos.entrada.soloEmociones : extracto}
                    </span>
                    {emociones.length > 0 && (
                      <span className="text-sm text-on-surface-soft">{emociones.join(' · ')}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
