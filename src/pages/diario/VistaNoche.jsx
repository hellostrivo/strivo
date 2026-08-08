// src/pages/diario/VistaNoche.jsx
// Vista de Noche (§5.3) — los ocho bloques del cierre del día:
// 1 victorias heredadas · 2 logros no planeados · 3 agradecimientos ·
// 4 reflexión · 5 cómo te vas a dormir · 6 hábitos de noche · 7 síntesis ·
// 8 cierre.
//
// Es el mismo día que recorre el Ritual de Noche, en hoja en vez de en
// secuencia: se entra, se escribe lo que apetezca y se sale. Cada bloque guarda
// solo al dejar de escribir (RN-02) y ninguno es obligatorio.
//
// El bloque 8 lanza la misma ceremonia que cierra el ritual —síntesis, luz de
// 900ms, "Buenas noches"— porque cerrar el día es una sola cosa, se llegue por
// donde se llegue. Si el día ya está cerrado, el bloque lo dice y no vuelve a
// pedirlo.

import { useCallback, useEffect, useState } from 'react'
import { copy, interpolate } from '@copy'
import { markHabit, unmarkHabit, saveVictory } from '@lib/db'
import { loadVistaNoche } from '@lib/vistaNoche'
import {
  decidirVictoria,
  anadirLogro,
  guardarAgradecimientos,
  guardarAprendizaje,
  guardarAnimoCierre,
  completarRitualNoche,
  sintesisDelDia,
  fraseSintesis,
  preguntaAprendizaje,
} from '@lib/ritualNoche'
import BloqueDiario from '@components/diario/BloqueDiario'
import CamposAgradecimiento from '@components/diario/CamposAgradecimiento'
import VictoriasHeredadas from '@components/diario/VictoriasHeredadas'
import LogrosNoPlaneados from '@components/diario/LogrosNoPlaneados'
import SelectorAnimo from '@components/diario/SelectorAnimo'
import HabitRow from '@components/strivo/HabitRow'
import Button from '@components/ui/Button'
import Card from '@components/ui/Card'
import CierreNoche from '@/pages/ritual/noche/CierreNoche'

const avisar = (mensaje, error) => console.warn(`[Strivo] ${mensaje}`, error)

export default function VistaNoche({ recarga = 0, onDiaCerrado }) {
  const [datos, setDatos] = useState(null)

  const [decisiones, setDecisiones]           = useState({})
  const [logros, setLogros]                   = useState([])
  const [agradecimientos, setAgradecimientos] = useState([])
  const [aprendizaje, setAprendizaje]         = useState('')
  const [animos, setAnimos]                   = useState([])
  const [cerrando, setCerrando]               = useState(false)
  const [diaCerrado, setDiaCerrado]           = useState(false)

  useEffect(() => {
    let vivo = true
    loadVistaNoche()
      .then(cargados => {
        if (!vivo) return
        setDatos(cargados)
        setLogros(cargados.logros)
        setAgradecimientos(cargados.agradecimientos)
        setAprendizaje(cargados.aprendizaje)
        setAnimos(cargados.animoCierre)
        setDiaCerrado(cargados.diaCerrado)
      })
      .catch(error => avisar('No se pudo abrir la Vista de Noche:', error))
    return () => { vivo = false }
  }, [recarga])

  const guardar = useCallback((accion, queFalla) => {
    accion.catch(error => avisar(`${queFalla} se guarda más tarde:`, error))
  }, [])

  if (!datos) return null

  const sintesis = sintesisDelDia({ agradecimientos, logros })

  // La ceremonia empieza con el día ya cerrado y no espera a ninguna escritura
  const cerrarElDia = () => {
    guardar(guardarAgradecimientos(datos.userId, datos.fecha, agradecimientos), 'Lo agradecido')
    guardar(guardarAprendizaje(datos.userId, datos.fecha, aprendizaje), 'La reflexión')
    guardar(guardarAnimoCierre(datos.userId, datos.fecha, animos), 'El ánimo')
    guardar(completarRitualNoche(datos.userId, datos.fecha), 'El cierre')
    setCerrando(true)
  }

  if (cerrando) {
    return (
      <CierreNoche
        frase={fraseSintesis(sintesis, copy.ritualNoche.closing)}
        onDone={() => {
          setCerrando(false)
          setDiaCerrado(true)
          onDiaCerrado?.()
        }}
      />
    )
  }

  const decidir = (victoria, decision) => {
    setDecisiones(previas => ({ ...previas, [victoria.id]: decision }))
    guardar(decidirVictoria(victoria, decision), 'La decisión')
  }

  const anadir = texto => {
    anadirLogro(datos.userId, datos.fecha, texto)
      .then(logro => setLogros(previos => [...previos, logro]))
      .catch(error => avisar('El logro se guarda más tarde:', error))
  }

  // Quitar no borra: la victoria queda soltada (RN-04) y deja de contar
  const quitar = logro => {
    setLogros(previos => previos.filter(l => l.id !== logro.id))
    guardar(saveVictory({ ...logro, estado: 'soltada' }), 'El logro')
  }

  const alternarHabito = async (habitId, marcar) => {
    setDatos(previos => ({
      ...previos,
      hechos: alternarEn(previos.hechos, habitId, marcar),
    }))
    try {
      if (marcar) await markHabit(habitId, datos.userId, datos.fecha)
      else        await unmarkHabit(habitId, datos.fecha)
    } catch (error) {
      avisar('No se pudo guardar la marca:', error)
      setDatos(previos => ({
        ...previos,
        hechos: alternarEn(previos.hechos, habitId, !marcar),
      }))
    }
  }

  const marcados = datos.habitos.filter(h => datos.hechos.has(h.id)).length
  const completo = datos.habitos.length > 0 && marcados === datos.habitos.length

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10 flex flex-col gap-12">

      {/* 1 · Victorias heredadas de la mañana */}
      {datos.heredadas.length > 0 && (
        <BloqueDiario id="heredadas" label={copy.diarioNoche.victories.label}>
          <VictoriasHeredadas
            heredadas={datos.heredadas}
            decisiones={decisiones}
            onDecidir={decidir}
          />
        </BloqueDiario>
      )}

      {/* 2 · Logros no planeados */}
      <BloqueDiario id="logros" label={copy.diarioNoche.unplanned.label}>
        <LogrosNoPlaneados
          logros={logros}
          onAnadir={anadir}
          onQuitar={quitar}
          idCampo="vn-logro"
          mostrarEtiqueta={false}
        />
      </BloqueDiario>

      {/* 3 · Agradecimientos */}
      <BloqueDiario id="agradecimientos" label={copy.ritualNoche.n4.question}>
        <CamposAgradecimiento
          agradecimientos={agradecimientos}
          onChange={setAgradecimientos}
          onGuardar={() => guardar(
            guardarAgradecimientos(datos.userId, datos.fecha, agradecimientos),
            'Lo agradecido'
          )}
          etiqueta={copy.ritualNoche.n4.question}
          placeholder={copy.ritualNoche.n4.placeholder}
          suggestionsLabel={copy.ritualNoche.n4.suggestionsLabel}
          idBase="vn-agradecimiento"
          max={copy.ritualNoche.n4.max}
        />
      </BloqueDiario>

      {/* 4 · Reflexión */}
      <BloqueDiario
        id="reflexion"
        label={preguntaAprendizaje(datos.fecha, copy.diarioNoche.learning)}
      >
        <textarea
          id="vn-reflexion"
          rows={4}
          value={aprendizaje}
          maxLength={300}
          aria-label={preguntaAprendizaje(datos.fecha, copy.diarioNoche.learning)}
          placeholder={copy.ritualNoche.n5.placeholder}
          onChange={event => setAprendizaje(event.target.value)}
          onBlur={() => guardar(
            guardarAprendizaje(datos.userId, datos.fecha, aprendizaje),
            'La reflexión'
          )}
          className={[
            'w-full resize-none leading-relaxed',
            'rounded-md bg-surface border border-border',
            'px-4 py-4 text-base text-ink',
            'placeholder:text-ink/70',
            'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
            'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
          ].join(' ')}
        />
      </BloqueDiario>

      {/* 5 · Cómo te vas a dormir */}
      {/* Sin `label`: la pregunta la pinta la tarjeta del selector, igual que
          el bloque de emociones de la Vista de Mañana */}
      <BloqueDiario id="animo">
        <SelectorAnimo
          animos={animos}
          onChange={({ animos: elegidos }) => {
            setAnimos(elegidos)
            guardar(guardarAnimoCierre(datos.userId, datos.fecha, elegidos), 'El ánimo')
          }}
        />
      </BloqueDiario>

      {/* 6 · Hábitos de la noche */}
      <BloqueDiario id="habitos" label={copy.ritualNoche.n2.question}>
        {datos.habitos.length === 0 ? (
          <p className="text-base leading-relaxed text-ink/80">
            {copy.ritualNoche.n2.empty}
          </p>
        ) : (
          <>
            <p className="text-base text-ink/80" aria-live="polite">
              {completo
                ? copy.ritualNoche.n2.complete
                : interpolate(copy.ritualNoche.n2.progressTemplate, {
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
                  done={datos.hechos.has(habito.id)}
                  onToggle={alternarHabito}
                />
              ))}
            </div>
          </>
        )}
      </BloqueDiario>

      {/* 7 · Síntesis del día */}
      <BloqueDiario>
        <Card>
          <p className="font-display text-md leading-relaxed text-ink" aria-live="polite">
            {fraseSintesis(sintesis, copy.ritualNoche.closing)}
          </p>
        </Card>
      </BloqueDiario>

      {/* 8 · Cierre */}
      <BloqueDiario>
        {diaCerrado ? (
          <p className="text-center font-display text-md text-ink/80">
            {copy.ritualNoche.closing.peace}
          </p>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={cerrarElDia}>
            {copy.ritualNoche.n6.cta}
          </Button>
        )}
      </BloqueDiario>
    </div>
  )
}

function alternarEn(conjunto, id, incluir) {
  const siguiente = new Set(conjunto)
  if (incluir) siguiente.add(id)
  else siguiente.delete(id)
  return siguiente
}
