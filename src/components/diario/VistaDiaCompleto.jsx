// src/components/diario/VistaDiaCompleto.jsx
// Un día entero, en una página serena y con la fecha en grande (§5.10).
//
// **Un día son mañana, noche y journal, y nada más** (blueprint §7.3). Una
// versión anterior describía aquí "todo lo registrado ese día (mañana, noche,
// journal, hábitos)", pero los hábitos pertenecían al alcance que se replegó.
// Hoy el día completo es exactamente lo que el diario guarda.
//
// **Sin victorias ni logros.** Los dos bloques se retiraron del producto el
// 23 ago junto con la colección `diario/victories` y el campo
// `nightRitual.newWins`; un día guardado antes de esa fecha conserva sus datos
// escritos, pero aquí ya no se leen ni se pintan.
//
// **La mañana y la noche se leen en sus dos versiones.** La mañana de tres
// momentos —cómo empecé, mi intención, lo que agradecí, mi paso y la pausa— y la
// de §5.3, que guardaba emociones a cultivar y una gran visión; la noche de tres
// momentos —lo que reconocí, mi reflexión, cómo cerré y lo que dejé aquí— y la de
// §5.4, que guardaba gratitud, aprendizaje y estado de sueño. Los días viejos se
// siguen viendo enteros: nada de lo ya escrito se sobrescribe ni desaparece.
// Cada bloque aparece solo si tiene contenido, así que una versión no arrastra
// los huecos de la otra.
//
// La reflexión de la noche se titula con **la pregunta que salió esa noche**:
// rota, así que una etiqueta genérica dejaría la respuesta sin contexto. La
// ligada a la intención de esa mañana se reconstruye con ella.
//
// **Las listas vuelven numeradas y enteras** (12 sep 2026): la gratitud de la
// mañana y el reconocimiento de la noche —y la gratitud de las noches de la
// versión 1— se releen una respuesta debajo de otra, con su número, sus
// párrafos y sin recortar, con el mismo `ListaNumerada` de las dos pantallas de
// consulta. Un día se relee como se escribió.
//
// Un día en blanco no es un día perdido y no se presenta como tal: se dice que
// también estuvo, y se sale por donde se entró.
//
// **Los días que ya cerraron su ventana lo dicen al pie** (3 sep 2026). Desde
// que la edición dura 72 horas hay días del calendario que todavía se pueden
// escribir y días que ya no, y la diferencia se dice una vez, en voz baja y al
// final: "Este día ya quedó como quedó". No se dice nada en los que siguen
// abiertos —sería una cuenta atrás en una pantalla que no tiene dónde
// escribir— y **no cambia nada de lo que se ve**: el día se lee entero, igual
// que antes de que la ventana existiera.

import ListaNumerada from '@components/diario/ListaNumerada'
import { copy, interpolate } from '@copy'
import { diaVacio } from '@/diario/historial'
import { etiquetasDe as etiquetasDeEmocion } from '@/diario/emocionesJournal'
import { etiquetasDe as etiquetasDeSueno } from '@/diario/estadoSueno'
import { etiquetaDe as etiquetaHeredada } from '@/diario/emociones'
import { fichasDeAnimo, fichasDeIntencion, hayAlgoEscrito } from '@/diario/manana'
import {
  fichasDeCierre,
  hayAlgoEscrito as hayAlgoDeNoche,
  hayDescarga,
  hayReconocimiento,
  hayReflexion,
} from '@/diario/noche'
import { preguntaGuardada } from '@/diario/nocheReflexion'
import { horaDe } from '@/diario/journal'
import { fechaLarga } from '@/diario/fechas'

const textos = copy.diario.historial.dia
const noche = copy.diario.noche

function Bloque({ titulo, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm text-on-surface-soft">{titulo}</h3>
      {children}
    </section>
  )
}

export default function VistaDiaCompleto({ dia, genero, onVolver }) {
  const { morning, night, journal } = dia
  const vacio = diaVacio(dia)

  // Hasta tres en cada una desde el 30 de agosto de 2026, y se leen todas: la
  // vista de un día es lo que se escribió ese día, no una muestra.
  const animo = fichasDeAnimo(morning, genero).map((ficha) => ficha.texto)
  const intencion = fichasDeIntencion(morning, genero).map((ficha) => ficha.texto)
  const accion = String(morning?.action ?? '').trim()
  const pausa = String(morning?.reflection ?? '').trim()
  const granVision = String(morning?.granVision ?? '').trim()
  const emocionesHeredadas = (morning?.emotions ?? []).map((id) => etiquetaHeredada(id, genero))
  const estadoDeSueno = etiquetasDeSueno(night?.sleepState, night?.sleepStateOther, genero)
  // Hasta tres desde el 10 de septiembre de 2026, y se leen todas, igual que
  // las de la mañana: la vista de un día es lo que se escribió ese día.
  const emocionDeCierre = fichasDeCierre(night, genero).map((ficha) => ficha.texto)
  const preguntaDeEsaNoche = preguntaGuardada(night, morning, genero)

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
      {hayAlgoEscrito(morning) && (
        <div className="flex flex-col gap-4 rounded-md border border-on-surface bg-strivo-campo p-4">
          <h2 className="font-display text-md text-on-surface">{textos.manana}</h2>

          {animo.length > 0 && (
            <Bloque titulo={textos.animo}>
              <p className="text-base text-on-surface">{animo.join(' · ')}</p>
            </Bloque>
          )}

          {intencion.length > 0 && (
            <Bloque titulo={textos.intencion}>
              <p className="text-base text-on-surface">{intencion.join(' · ')}</p>
            </Bloque>
          )}

          {(morning?.gratitude?.length ?? 0) > 0 && (
            <Bloque titulo={textos.gratitud}>
              <ListaNumerada lineas={morning.gratitude} />
            </Bloque>
          )}

          {accion !== '' && (
            <Bloque titulo={textos.accion}>
              <p className="text-base text-on-surface whitespace-pre-wrap">{accion}</p>
            </Bloque>
          )}

          {pausa !== '' && (
            <Bloque titulo={textos.pausa}>
              <p className="text-base text-on-surface whitespace-pre-wrap">{pausa}</p>
            </Bloque>
          )}

          {/* Las dos preguntas de la versión anterior. Solo aparecen en los
              días que las respondieron. */}
          {emocionesHeredadas.length > 0 && (
            <Bloque titulo={textos.emociones}>
              <p className="text-base text-on-surface">{emocionesHeredadas.join(' · ')}</p>
            </Bloque>
          )}

          {granVision !== '' && (
            <Bloque titulo={textos.granVision}>
              <p className="text-base text-on-surface">{granVision}</p>
            </Bloque>
          )}
        </div>
      )}

      {/* ─── Noche ──────────────────────────────────────────────────────── */}
      {hayAlgoDeNoche(night) && (
        <div className="flex flex-col gap-4 rounded-md border border-on-surface bg-strivo-campo p-4">
          <h2 className="font-display text-md text-on-surface">{textos.noche}</h2>

          {hayReconocimiento(night) && (
            <Bloque titulo={textos.reconocimiento}>
              <ListaNumerada lineas={night.recognized} />
            </Bloque>
          )}

          {hayReflexion(night) && (
            <Bloque titulo={preguntaDeEsaNoche?.titulo ?? textos.reflexion}>
              <p className="text-base text-on-surface whitespace-pre-wrap">{night.reflection}</p>
            </Bloque>
          )}

          {emocionDeCierre.length > 0 && (
            <Bloque titulo={textos.emocionCierre}>
              <p className="text-base text-on-surface">{emocionDeCierre.join(' · ')}</p>
            </Bloque>
          )}

          {hayDescarga(night) && (
            <Bloque titulo={textos.descarga}>
              <p className="text-base text-on-surface whitespace-pre-wrap">{night.release}</p>
            </Bloque>
          )}

          {/* Los tres bloques de la versión anterior. Solo aparecen en las
              noches que los respondieron. */}
          {(night?.gratitude?.length ?? 0) > 0 && (
            <Bloque titulo={textos.gratitud}>
              <ListaNumerada lineas={night.gratitude} />
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
        <div className="flex flex-col gap-4 rounded-md border border-on-surface bg-strivo-campo p-4">
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

      {dia.editable === false && <p className="text-sm text-on-surface-soft">{textos.cerrado}</p>}
    </article>
  )
}
