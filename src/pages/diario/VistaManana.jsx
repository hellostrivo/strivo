// src/pages/diario/VistaManana.jsx
// Vista de Mañana (§5.3) — los bloques del diario del día:
// 1 frase · 2 agradecimientos · 3 emociones · 4 gran día · 5 victorias ·
// 6 enlace al ritual.
//
// No es una secuencia ni un formulario: se entra, se escribe lo que apetezca y
// se sale. Ningún bloque es obligatorio, ninguno avisa de que está vacío y no
// hay botón de guardar — cada bloque persiste al dejar de escribir (RN-02).
//
// Los hábitos ya no se marcan aquí (§25): "Hoy" es el espacio de la intención y
// el registro vive en su propia pestaña. Lo que queda es el enlace, que además
// es el cierre natural de la mañana — después de decidir cómo quieres sentirte
// y qué victorias quieres, el paso siguiente es ir a hacerlo.
//
// Lo que se escribe aquí es lo que ven los rituales: los agradecimientos son la
// lista del día que N4 completa por la noche y las victorias nacen pendientes
// para que N3 las herede (RN-01).

import { useCallback, useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import { loadVistaManana, guardarBloque, guardarVictoria } from '@lib/vistaManana'
import { areaDe, ESPERA_ANTES_DE_MIRAR } from '@lib/lexicoAreas'
import BloqueDiario from '@components/diario/BloqueDiario'
import CamposAgradecimiento from '@components/diario/CamposAgradecimiento'
import SelectorEmociones from '@components/strivo/SelectorEmociones'
import EnlaceRitualManana from '@components/diario/EnlaceRitualManana'

const avisar = (mensaje, error) => console.warn(`[Strivo] ${mensaje}`, error)

const campoClase = [
  'w-full rounded-md bg-surface border border-border',
  'px-4 py-4 text-base text-ink',
  'placeholder:text-ink/70',
  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
  'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
].join(' ')

export default function VistaManana({ recarga = 0, onIrAlRitual }) {
  const [datos, setDatos] = useState(null)

  // Estado de los bloques que se escriben
  const [agradecimientos, setAgradecimientos] = useState([])
  const [emociones, setEmociones]             = useState([])
  const [necesito, setNecesito]               = useState('')
  const [granDia, setGranDia]                 = useState('')
  const [victorias, setVictorias]             = useState([])

  // Un relevo por línea de victoria: la deducción del área espera a que se deje
  // de escribir (§24.4). Una etiqueta que cambia mientras se escribe distrae.
  const relevos = useRef({})

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
      })
      .catch(error => avisar('No se pudo abrir la Vista de Mañana:', error))
    return () => { vivo = false }
  }, [recarga])

  useEffect(() => {
    const pendientes = relevos.current
    return () => Object.values(pendientes).forEach(clearTimeout)
  }, [])

  const guardar = useCallback((patch, queFalla) => {
    if (!datos) return
    guardarBloque(datos.userId, datos.fecha, patch)
      .catch(error => avisar(`${queFalla} se guarda más tarde:`, error))
  }, [datos])

  if (!datos) return null

  const { emotions, gratitude, phrase, victories } = copy.diarioManana
  const maxVictorias = victories.max
  const tiposElegidos = datos.areas.map(area => area.tipo)

  // Siempre hay un hueco libre al final, hasta el máximo
  const conTexto  = victorias.filter(v => v.texto?.trim())
  const ranuras   = [
    ...victorias,
    ...(conTexto.length === victorias.length && victorias.length < maxVictorias
      ? [{ texto: '', areaId: null, areaDismissed: false }]
      : []),
  ].slice(0, maxVictorias)

  const escribirVictoria = (indice, patch) => {
    const siguientes = [...ranuras]
    siguientes[indice] = { ...siguientes[indice], ...patch }
    setVictorias(siguientes)
  }

  // Se mira el texto cuando se deja de escribir. Si no hay una respuesta clara,
  // no pasa nada: no etiquetar es el comportamiento por defecto (§24.4).
  const mirarArea = (indice, texto) => {
    clearTimeout(relevos.current[indice])
    relevos.current[indice] = setTimeout(() => {
      const victoria = ranuras[indice]
      if (!victoria || victoria.areaDismissed) return

      const tipo   = areaDe(texto, tiposElegidos)
      const areaId = tipo ? datos.areas.find(a => a.tipo === tipo)?.id ?? null : null
      if (areaId === (victoria.areaId ?? null)) return

      escribirVictoria(indice, { areaId })
    }, ESPERA_ANTES_DE_MIRAR)
  }

  const guardarVictoriaEn = async indice => {
    const victoria = ranuras[indice]
    if (!victoria) return
    clearTimeout(relevos.current[indice])
    try {
      const fila = await guardarVictoria(datos.userId, datos.fecha, victoria)
      const siguientes = [...ranuras]
      siguientes[indice] = fila ?? { texto: '', areaId: null, areaDismissed: false }
      setVictorias(siguientes.filter(v => v.texto?.trim()))
    } catch (error) {
      avisar('La victoria se guarda más tarde:', error)
    }
  }

  // Quitar la etiqueta es querer menos interfaz, no otra distinta: no se
  // sustituye por un selector y no vuelve para ese texto.
  const quitarArea = indice => {
    const victoria = { ...ranuras[indice], areaId: null, areaDismissed: true }
    escribirVictoria(indice, { areaId: null, areaDismissed: true })
    guardarVictoria(datos.userId, datos.fecha, victoria)
      .catch(error => avisar('La etiqueta se guarda más tarde:', error))
  }

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

      {/* 2 · Agradecimientos — las sugerencias llegan cuando hacen falta (§21) */}
      <BloqueDiario id="agradecimientos" label={gratitude.label}>
        <CamposAgradecimiento
          porInactividad
          agradecimientos={agradecimientos}
          onChange={setAgradecimientos}
          onGuardar={() => guardar({ agradecimientos }, 'Lo agradecido')}
          etiqueta={gratitude.label}
          placeholder={gratitude.placeholder}
          idBase="vm-agradecimiento"
        />
      </BloqueDiario>

      {/* 3 · Emociones que se quieren cultivar (§22) */}
      <BloqueDiario id="emociones">
        <SelectorEmociones
          selected={emociones}
          max={emotions.max}
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

      {/* 4 · El gran día (§23) */}
      <BloqueDiario id="gran-dia" label={copy.hoy.granDia.pregunta}>
        <textarea
          id="vm-gran-dia"
          rows={4}
          value={granDia}
          maxLength={600}
          aria-label={copy.hoy.granDia.pregunta}
          placeholder={copy.hoy.granDia.placeholder}
          onChange={event => setGranDia(event.target.value)}
          onBlur={() => guardar({ granDia }, 'Tu gran día')}
          className={`resize-none leading-relaxed ${campoClase}`}
        />
      </BloqueDiario>

      {/* 5 · Victorias del día. El área se deduce sola (§24): sin selector, y
          sin etiqueta cuando no hay una respuesta clara. */}
      <BloqueDiario id="victorias" label={copy.hoy.victorias.titulo}>
        <div className="flex flex-col gap-6">
          {ranuras.map((victoria, indice) => {
            const area = victoria.areaId
              ? datos.areas.find(a => a.id === victoria.areaId)
              : null
            return (
              <div key={victoria.id ?? `nueva-${indice}`}>
                <input
                  type="text"
                  value={victoria.texto ?? ''}
                  maxLength={140}
                  autoComplete="off"
                  aria-label={`${copy.hoy.victorias.titulo} ${indice + 1}`}
                  placeholder={victories.placeholder}
                  onChange={event => {
                    escribirVictoria(indice, { texto: event.target.value })
                    mirarArea(indice, event.target.value)
                  }}
                  onBlur={() => guardarVictoriaEn(indice)}
                  className={`min-h-touch ${campoClase}`}
                />

                {/* La fila de la etiqueta está siempre, ocupe o no: así aparecer
                    no desplaza lo de abajo mientras se escribe la siguiente. */}
                <div className="mt-1 h-6 flex justify-end items-center">
                  {area && (
                    <button
                      type="button"
                      onClick={() => quitarArea(indice)}
                      aria-label={interpolate(copy.hoy.victorias.quitarAreaTemplate, {
                        area: area.nombre,
                      })}
                      className={[
                        'inline-flex items-center gap-1.5 rounded-full',
                        'px-2 py-0.5 text-xs text-ink/70',
                        'animate-sugerencia-entra motion-reduce:animate-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
                      ].join(' ')}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: area.color }}
                        aria-hidden="true"
                      />
                      {area.nombre}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </BloqueDiario>

      {/* 6 · El cierre de la mañana: ir a hacerlo (§25) */}
      <EnlaceRitualManana
        habitos={datos.habitos}
        hechos={datos.hechos}
        onIr={onIrAlRitual}
      />
    </div>
  )
}
