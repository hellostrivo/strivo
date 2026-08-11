// src/components/lumia/VistaDiaCompleto.jsx
// Un día entero, en una página serena y con la fecha en grande (§5.10).
//
// **Únicamente contenido de Lumia: mañana, noche y journal. Sin hábitos**
// (§C7.7.2). §5.10 describía aquí "todo lo registrado ese día (mañana, noche,
// journal, hábitos)", pero tras la división esa vista es un insight cruzado de
// facto y no puede vivir en Lumia sin leer `formia/`. Si algún día se quiere la
// vista unificada, será una superficie de Strivo Intelligence.
//
// Un día en blanco no es un día perdido y no se presenta como tal: se dice que
// también estuvo, y se sale por donde se entró.

import { copy, interpolate } from '@copy'
import { diaVacio } from '@/lumia/historial'
import { etiquetasDe as etiquetasDeEmocion } from '@/lumia/emocionesJournal'
import { etiquetasDe as etiquetasDeSueno } from '@/lumia/estadoSueno'
import { etiquetaDe as etiquetaDeManana } from '@/lumia/emociones'
import { horaDe } from '@/lumia/journal'
import { fechaLarga } from '@/lumia/fechas'

const textos = copy.lumia.historial.dia
const noche = copy.lumia.diario.noche

function Bloque({ titulo, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm text-on-surface-soft">{titulo}</h3>
      {children}
    </section>
  )
}

function Lista({ textos: lineas }) {
  return (
    <ul className="flex flex-col gap-1">
      {lineas.map((linea, indice) => (
        <li key={indice} className="text-base text-on-surface">
          {linea}
        </li>
      ))}
    </ul>
  )
}

export default function VistaDiaCompleto({ dia, genero, onVolver }) {
  const { morning, night, victorias, journal } = dia
  const vacio = diaVacio(dia)

  const emocionesDeManana = (morning?.emotions ?? []).map((id) => etiquetaDeManana(id, genero))
  const estadoDeSueno = etiquetasDeSueno(night?.sleepState, night?.sleepStateOther, genero)

  return (
    <article className="flex flex-col gap-8 px-5 pb-12 pt-6">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onVolver}
          className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          {textos.volver}
        </button>
        <h2 className="font-display text-lg text-on-surface">{fechaLarga(dia.fecha)}</h2>
      </header>

      {vacio && <p className="text-base text-on-surface-soft">{textos.vacio}</p>}

      {/* ─── Mañana ─────────────────────────────────────────────────────── */}
      {(emocionesDeManana.length > 0 ||
        (morning?.gratitude?.length ?? 0) > 0 ||
        String(morning?.granVision ?? '').trim() !== '') && (
        <div className="flex flex-col gap-4 rounded-md border border-on-surface bg-lumia-campo p-4">
          <h2 className="font-display text-md text-on-surface">{textos.manana}</h2>

          {emocionesDeManana.length > 0 && (
            <Bloque titulo={textos.emociones}>
              <p className="text-base text-on-surface">{emocionesDeManana.join(' · ')}</p>
            </Bloque>
          )}

          {(morning?.gratitude?.length ?? 0) > 0 && (
            <Bloque titulo={textos.gratitud}>
              <Lista textos={morning.gratitude} />
            </Bloque>
          )}

          {String(morning?.granVision ?? '').trim() !== '' && (
            <Bloque titulo={textos.granVision}>
              <p className="text-base text-on-surface">{morning.granVision}</p>
            </Bloque>
          )}
        </div>
      )}

      {/* ─── Noche ──────────────────────────────────────────────────────── */}
      {(victorias.length > 0 ||
        (night?.newWins?.length ?? 0) > 0 ||
        (night?.gratitude?.length ?? 0) > 0 ||
        String(night?.learning ?? '').trim() !== '' ||
        estadoDeSueno.length > 0) && (
        <div className="flex flex-col gap-4 rounded-md border border-on-surface bg-lumia-campo p-4">
          <h2 className="font-display text-md text-on-surface">{textos.noche}</h2>

          {victorias.length > 0 && (
            <Bloque titulo={textos.victorias}>
              <Lista textos={victorias.map((victoria) => victoria.text)} />
            </Bloque>
          )}

          {(night?.newWins?.length ?? 0) > 0 && (
            <Bloque titulo={textos.logros}>
              <Lista textos={night.newWins} />
            </Bloque>
          )}

          {(night?.gratitude?.length ?? 0) > 0 && (
            <Bloque titulo={textos.gratitud}>
              <Lista textos={night.gratitude} />
            </Bloque>
          )}

          {String(night?.learning ?? '').trim() !== '' && (
            <Bloque titulo={textos.aprendizaje}>
              <p className="text-base text-on-surface whitespace-pre-wrap">{night.learning}</p>
            </Bloque>
          )}

          {/* Si no se eligió nada, el bloque no aparece: no hay marcador de
              ausencia (§5.4.1). */}
          {estadoDeSueno.length > 0 && (
            <p className="text-base text-on-surface">
              {interpolate(noche.sueno.guardadoTemplate, {
                estados: estadoDeSueno.join(noche.sueno.separador),
              })}
            </p>
          )}
        </div>
      )}

      {/* ─── Journal ────────────────────────────────────────────────────── */}
      {journal.length > 0 && (
        <div className="flex flex-col gap-4 rounded-md border border-on-surface bg-lumia-campo p-4">
          <h2 className="font-display text-md text-on-surface">{textos.journal}</h2>
          <ul className="flex flex-col gap-3">
            {journal.map((entrada) => {
              const emociones = etiquetasDeEmocion(entrada.emotions, entrada.otherText, genero)
              return (
                <li key={entrada.id} className="flex flex-col gap-1">
                  <p className="text-sm text-on-surface-soft">{horaDe(entrada)}</p>
                  {emociones.length > 0 && (
                    <p className="text-sm text-on-surface-soft">{emociones.join(' · ')}</p>
                  )}
                  {/* Aquí va la entrada entera, no un extracto: volver a un día
                      es volver a lo que se escribió, no a su resumen. */}
                  <p className="text-base text-on-surface whitespace-pre-wrap">{entrada.text}</p>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </article>
  )
}
