// src/pages/diario/VistaManana.jsx
// Vista de Mañana (§5.3) — los seis bloques del diario del día:
// 1 frase · 2 agradecimientos · 3 emociones · 4 gran día · 5 victorias ·
// 6 checklist del ritual.
//
// No es una secuencia ni un formulario: se entra, se escribe lo que apetezca y
// se sale. Ningún bloque es obligatorio, ninguno avisa de que está vacío y no
// hay botón de guardar — cada bloque persiste al dejar de escribir (RN-02).
//
// Lo que se escribe aquí es lo que ven los rituales: los agradecimientos son la
// lista del día que N4 completa por la noche, las victorias nacen pendientes
// para que N3 las herede, y marcar un hábito es la misma marca que la de R4
// (RN-01).

import { useCallback, useEffect, useState } from 'react'
import { copy, interpolate } from '@copy'
import { markHabit, unmarkHabit } from '@lib/db'
import { loadVistaManana, guardarBloque, guardarVictoria } from '@lib/vistaManana'
import BloqueDiario from '@components/diario/BloqueDiario'
import CamposAgradecimiento from '@components/diario/CamposAgradecimiento'
import EmotionSelector from '@components/strivo/EmotionCard'
import HabitRow from '@components/strivo/HabitRow'
import Chip from '@components/ui/Chip'

const avisar = (mensaje, error) => console.warn(`[Strivo] ${mensaje}`, error)

const campoClase = [
  'w-full rounded-md bg-surface border border-border',
  'px-4 py-4 text-base text-ink',
  'placeholder:text-ink/70',
  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
  'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
].join(' ')

export default function VistaManana({ recarga = 0 }) {
  const [datos, setDatos] = useState(null)

  // Estado de los bloques que se escriben
  const [agradecimientos, setAgradecimientos] = useState([])
  const [emociones, setEmociones]             = useState([])
  const [necesito, setNecesito]               = useState('')
  const [granDia, setGranDia]                 = useState('')
  const [victorias, setVictorias]             = useState([])
  const [hechos, setHechos]                   = useState(() => new Set())

  // `recarga` cambia al cerrar un ritual: lo marcado allí se refleja aquí (RN-01)
  useEffect(() => {
    let vivo = true
    loadVistaManana()
      .then(cargados => {
        if (!vivo) return
        setDatos(cargados)
        setAgradecimientos(cargados.agradecimientos)
        setEmociones(cargados.emociones)
        setNecesito(cargados.emocionesNecesito)
        setGranDia(cargados.granDia)
        setVictorias(cargados.victorias.map(v => ({ ...v })))
        setHechos(cargados.hechos)
      })
      .catch(error => avisar('No se pudo abrir la Vista de Mañana:', error))
    return () => { vivo = false }
  }, [recarga])

  const guardar = useCallback((patch, queFalla) => {
    if (!datos) return
    guardarBloque(datos.userId, datos.fecha, patch)
      .catch(error => avisar(`${queFalla} se guarda más tarde:`, error))
  }, [datos])

  if (!datos) return null

  const { emotions, gratitude, bigDay, victories, phrase } = copy.diarioManana
  const maxVictorias = victories.max

  // Siempre hay un hueco libre al final, hasta el máximo
  const conTexto  = victorias.filter(v => v.texto?.trim())
  const ranuras   = [
    ...victorias,
    ...(conTexto.length === victorias.length && victorias.length < maxVictorias
      ? [{ texto: '', areaId: null }]
      : []),
  ].slice(0, maxVictorias)

  // El estado guarda solo las victorias con texto; el hueco libre del final lo
  // repone `ranuras` en cada render.
  const escribirVictoria = (indice, patch) => {
    const siguientes = [...ranuras]
    siguientes[indice] = { ...siguientes[indice], ...patch }
    setVictorias(siguientes)
  }

  const guardarVictoriaEn = async indice => {
    const victoria = ranuras[indice]
    if (!victoria) return
    try {
      const fila = await guardarVictoria(datos.userId, datos.fecha, victoria)
      const siguientes = [...ranuras]
      siguientes[indice] = fila ?? { texto: '', areaId: null }
      setVictorias(siguientes.filter(v => v.texto?.trim()))
    } catch (error) {
      avisar('La victoria se guarda más tarde:', error)
    }
  }

  const alternarHabito = async (habitId, marcar) => {
    setHechos(previos => {
      const siguientes = new Set(previos)
      if (marcar) siguientes.add(habitId)
      else siguientes.delete(habitId)
      return siguientes
    })
    try {
      if (marcar) await markHabit(habitId, datos.userId, datos.fecha)
      else        await unmarkHabit(habitId, datos.fecha)
    } catch (error) {
      avisar('No se pudo guardar la marca:', error)
      setHechos(previos => {
        const siguientes = new Set(previos)
        if (marcar) siguientes.delete(habitId)
        else siguientes.add(habitId)
        return siguientes
      })
    }
  }

  const marcados = datos.habitos.filter(h => hechos.has(h.id)).length
  const completo = datos.habitos.length > 0 && marcados === datos.habitos.length

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10 flex flex-col gap-12">

      {/* 1 · Frase del día */}
      {datos.perfil?.identidadCentral && (
        <BloqueDiario className="animate-fade-up">
          <p className="font-display text-xl leading-tight text-ink">
            {interpolate(phrase.identityTemplate, {
              identidad: datos.perfil.identidadCentral,
            })}
          </p>

          {datos.intencion && (
            <p className="mt-4 text-base text-ink/80">
              <span className="block">{phrase.intentionLabel}</span>
              <span className="mt-1 block font-display text-md text-ink">
                {datos.intencion}
              </span>
            </p>
          )}
        </BloqueDiario>
      )}

      {/* 2 · Agradecimientos */}
      <BloqueDiario id="agradecimientos" label={gratitude.label}>
        <CamposAgradecimiento
          agradecimientos={agradecimientos}
          onChange={setAgradecimientos}
          onGuardar={() => guardar({ agradecimientos }, 'Lo agradecido')}
          etiqueta={gratitude.label}
          placeholder={gratitude.placeholder}
          suggestionsLabel={gratitude.suggestionsLabel}
          idBase="vm-agradecimiento"
        />
      </BloqueDiario>

      {/* 3 · Emociones */}
      <BloqueDiario id="emociones" label={emotions.label}>
        <p className="-mt-2 mb-4 text-base text-ink/80">
          {interpolate(emotions.hintTemplate, { max: emotions.max })}
        </p>

        <EmotionSelector
          selected={emociones}
          onChange={siguientes => {
            setEmociones(siguientes)
            guardar({ emociones: siguientes }, 'Lo elegido')
          }}
        />

        {/* La pregunta complementaria llega cuando ya hay algo que sostener */}
        {emociones.length > 0 && (
          <div className="mt-6 animate-fade-up">
            <label htmlFor="vm-necesito" className="block text-base text-ink/80">
              {emotions.complementary}
            </label>
            <input
              id="vm-necesito"
              type="text"
              value={necesito}
              maxLength={140}
              autoComplete="off"
              placeholder={emotions.complementaryPlaceholder}
              onChange={event => setNecesito(event.target.value)}
              onBlur={() => guardar({ emocionesNecesito: necesito }, 'Lo que necesitas')}
              className={`mt-3 min-h-touch ${campoClase}`}
            />
          </div>
        )}
      </BloqueDiario>

      {/* 4 · El gran día */}
      <BloqueDiario id="gran-dia" label={bigDay.label}>
        <textarea
          id="vm-gran-dia"
          rows={4}
          value={granDia}
          maxLength={600}
          aria-label={bigDay.label}
          placeholder={bigDay.placeholder}
          onChange={event => setGranDia(event.target.value)}
          onBlur={() => guardar({ granDia }, 'Tu gran día')}
          className={`resize-none leading-relaxed ${campoClase}`}
        />
      </BloqueDiario>

      {/* 5 · Victorias del día, cada una en su área */}
      <BloqueDiario id="victorias" label={victories.label}>
        <div className="flex flex-col gap-6">
          {ranuras.map((victoria, indice) => (
            <div key={victoria.id ?? `nueva-${indice}`}>
              <input
                type="text"
                value={victoria.texto ?? ''}
                maxLength={140}
                autoComplete="off"
                aria-label={`${victories.label} ${indice + 1}`}
                placeholder={victories.placeholder}
                onChange={event => escribirVictoria(indice, { texto: event.target.value })}
                onBlur={() => guardarVictoriaEn(indice)}
                className={`min-h-touch ${campoClase}`}
              />

              {/* El área solo se ofrece cuando ya hay algo que colocar */}
              {victoria.texto?.trim() && datos.areas.length > 0 && (
                <div className="mt-3 animate-fade-up">
                  <p id={`vm-area-${indice}`} className="text-sm text-ink/70">
                    {victories.areaLabel}
                  </p>
                  <div
                    role="group"
                    aria-labelledby={`vm-area-${indice}`}
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {datos.areas.map(area => (
                      <Chip
                        key={area.id}
                        size="sm"
                        color={area.color}
                        selected={victoria.areaId === area.id}
                        onClick={() => {
                          const areaId = victoria.areaId === area.id ? null : area.id
                          escribirVictoria(indice, { areaId })
                          guardarVictoria(datos.userId, datos.fecha, { ...victoria, areaId })
                            .catch(error => avisar('El área se guarda más tarde:', error))
                        }}
                      >
                        {area.nombre}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </BloqueDiario>

      {/* 6 · Checklist del ritual */}
      <BloqueDiario id="ritual" label={copy.ritualManana.r4.title}>
        {datos.habitos.length === 0 ? (
          <p className="text-base leading-relaxed text-ink/80">
            {copy.ritualManana.r4.empty}
          </p>
        ) : (
          <>
            <p className="text-base text-ink/80" aria-live="polite">
              {completo
                ? copy.ritualManana.r4.complete
                : interpolate(copy.ritualManana.r4.progressTemplate, {
                    hecho: marcados,
                    total: datos.habitos.length,
                  })}
            </p>

            <div className="mt-4 flex flex-col gap-1">
              {datos.habitos.map(habito => (
                <HabitRow
                  key={habito.id}
                  habit={habito}
                  area={datos.areas.find(a => a.id === habito.areaId)}
                  done={hechos.has(habito.id)}
                  onToggle={alternarHabito}
                />
              ))}
            </div>
          </>
        )}
      </BloqueDiario>
    </div>
  )
}
