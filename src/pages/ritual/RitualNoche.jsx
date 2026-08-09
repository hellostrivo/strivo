// src/pages/ritual/RitualNoche.jsx
// Ritual de Noche (§5.6) — N1 respiración · N2 hábitos del día · N3 victorias
// heredadas y logros no planeados · N4 agradecimientos · N5 reflexión ·
// N6 ánimo de cierre → ceremonia de cierre.
//
// Nota de reparto: copy-library describe el ritual en ocho bloques (N1–N8) y el
// ROADMAP en seis. Aquí van los seis pedidos, juntando en N3 las victorias
// heredadas con los logros no planeados —son la misma pregunta, "qué pasó hoy",
// y así se presentan en la Vista de Noche— y dejando el cierre (N8) fuera de la
// cuenta de pantallas, porque es una ceremonia y no un paso que se recorre.
//
// Cada bloque se guarda solo (RN-02). Salir por la X o por Escape cierra el día
// igual, sin ceremonia y sin reclamarlo después (RN-03).

import { useCallback, useEffect, useMemo, useState } from 'react'
import { copy } from '@copy'
import { colors, gradientsBySlot } from '@tokens'
import { markHabit, unmarkHabit, saveVictory } from '@lib/db'
import {
  loadRitualNoche,
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
import Button from '@components/ui/Button'
import RitualLayout from '@components/ritual/RitualLayout'
import N1Respiracion     from './noche/N1Respiracion'
import N2Habitos         from './noche/N2Habitos'
import N3Victorias       from './noche/N3Victorias'
import N4Agradecimientos from './noche/N4Agradecimientos'
import N5Aprendizaje     from './noche/N5Aprendizaje'
import N6Animo           from './noche/N6Animo'
import CierreNoche       from './noche/CierreNoche'

const BACKGROUND = `linear-gradient(160deg, ${gradientsBySlot.noche.from} 0%, ${colors.paper} 62%)`

const STEPS = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6']

const avisar = (mensaje, error) => console.warn(`[Strivo] ${mensaje}`, error)

export default function RitualNoche({ onClose }) {
  const [datos, setDatos]         = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [hechos, setHechos]       = useState(() => new Set())
  const [decisiones, setDecisiones] = useState({})
  const [logros, setLogros]         = useState([])
  const [agradecimientos, setAgradecimientos] = useState([])
  const [aprendizaje, setAprendizaje]         = useState('')
  const [animos, setAnimos]                   = useState([])
  const [cerrando, setCerrando]               = useState(false)

  useEffect(() => {
    let vivo = true
    loadRitualNoche()
      .then(cargados => {
        if (!vivo) return
        setDatos(cargados)
        setHechos(cargados.hechos)
        setLogros(cargados.logros)
        setAgradecimientos(cargados.agradecimientos)
        setAprendizaje(cargados.aprendizaje)
        setAnimos(cargados.animoCierre)
      })
      .catch(error => {
        avisar('No se pudo abrir el ritual de noche:', error)
        if (vivo) onClose()
      })
    return () => { vivo = false }
  }, [onClose])

  // Estable: N1 avanza con el ciclo de 13s (ver @components/ritual/Respiracion)
  const siguiente = useCallback(
    () => setStepIndex(i => Math.min(STEPS.length - 1, i + 1)),
    []
  )
  const atras = useCallback(() => setStepIndex(i => Math.max(0, i - 1)), [])

  // Guardar lo que aún esté solo en pantalla. No se espera: si el almacén
  // tarda, la ceremonia no se queda mirando.
  const volcarPendientes = useCallback(() => {
    if (!datos) return
    guardarAgradecimientos(datos.userId, datos.fecha, agradecimientos)
      .catch(error => avisar('Los agradecimientos se guardan más tarde:', error))
    guardarAprendizaje(datos.userId, datos.fecha, aprendizaje)
      .catch(error => avisar('La reflexión se guarda más tarde:', error))
    guardarAnimoCierre(datos.userId, datos.fecha, animos)
      .catch(error => avisar('El ánimo se guarda más tarde:', error))
  }, [datos, agradecimientos, aprendizaje, animos])

  // Salir sin ceremonia (X, Escape): el día queda cerrado igual
  const salir = useCallback(() => {
    if (datos) {
      volcarPendientes()
      completarRitualNoche(datos.userId, datos.fecha)
        .catch(error => avisar('El ritual se cierra sin registrar el cierre:', error))
    }
    onClose()
  }, [datos, volcarPendientes, onClose])

  const sintesis = useMemo(
    () => sintesisDelDia({ agradecimientos, logros }),
    [agradecimientos, logros]
  )

  if (!datos) return null

  // La ceremonia empieza con el día ya cerrado y no espera a ninguna escritura
  const cerrarElDia = () => {
    volcarPendientes()
    completarRitualNoche(datos.userId, datos.fecha)
      .catch(error => avisar('El día se cierra sin registrar el cierre:', error))
    setCerrando(true)
  }

  if (cerrando) {
    return (
      <CierreNoche
        frase={fraseSintesis(sintesis, copy.ritualNoche.closing)}
        onDone={onClose}
      />
    )
  }

  const paso = STEPS[stepIndex]

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

  const decidir = (victoria, decision) => {
    setDecisiones(previas => ({ ...previas, [victoria.id]: decision }))
    decidirVictoria(victoria, decision)
      .catch(error => avisar('La decisión se guarda más tarde:', error))
  }

  const anadir = texto => {
    anadirLogro(datos.userId, datos.fecha, texto)
      .then(logro => setLogros(previos => [...previos, logro]))
      .catch(error => avisar('El logro se guarda más tarde:', error))
  }

  // Quitar no borra: la victoria queda soltada (RN-04) y deja de contar
  const quitar = logro => {
    setLogros(previos => previos.filter(l => l.id !== logro.id))
    saveVictory({ ...logro, estado: 'soltada' })
      .catch(error => avisar('El logro no se pudo soltar todavía:', error))
  }

  const esUltimo = stepIndex === STEPS.length - 1

  return (
    <RitualLayout
      step={stepIndex + 1}
      totalSteps={STEPS.length}
      title={copy.ritualNoche.title}
      background={BACKGROUND}
      onClose={salir}
      onBack={stepIndex > 0 ? atras : undefined}
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={esUltimo ? cerrarElDia : siguiente}
        >
          {esUltimo ? copy.ritualNoche.n6.cta : copy.ritual.nav.continue}
        </Button>
      }
    >
      {paso === 'n1' && <N1Respiracion onNext={siguiente} />}

      {paso === 'n2' && (
        <N2Habitos
          habitos={datos.habitos}
          areas={datos.areas}
          hechos={hechos}
          progreso={datos.progreso}
          onToggle={alternarHabito}
        />
      )}

      {paso === 'n3' && (
        <N3Victorias
          heredadas={datos.heredadas}
          decisiones={decisiones}
          logros={logros}
          onDecidir={decidir}
          onAnadirLogro={anadir}
          onQuitarLogro={quitar}
        />
      )}

      {paso === 'n4' && (
        <N4Agradecimientos
          agradecimientos={agradecimientos}
          onChange={setAgradecimientos}
          onGuardar={volcarPendientes}
        />
      )}

      {paso === 'n5' && (
        <N5Aprendizaje
          pregunta={preguntaAprendizaje(datos.fecha, copy.diarioNoche.learning)}
          aprendizaje={aprendizaje}
          onChange={setAprendizaje}
          onGuardar={volcarPendientes}
        />
      )}

      {paso === 'n6' && (
        <N6Animo
          animos={animos}
          onChange={({ animos: elegidos }) => {
            setAnimos(elegidos)
            guardarAnimoCierre(datos.userId, datos.fecha, elegidos)
              .catch(error => avisar('El ánimo se guarda más tarde:', error))
          }}
        />
      )}
    </RitualLayout>
  )
}
