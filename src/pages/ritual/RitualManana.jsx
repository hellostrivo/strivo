// src/pages/ritual/RitualManana.jsx
// Ritual de Mañana (§5.5) — R2 bienvenida · R3 identidad y área del día ·
// R4 hábitos · R5 intención.
//
// El ejercicio de respiración que abría el ritual se retiró: el círculo vive
// ahora solo en las dos aperturas —la del onboarding y la de cada sesión—, que
// es donde hace falta separar el ruido de afuera del espacio de adentro. Entrar
// al ritual ya es estar dentro. Los nombres R2–R5 se conservan porque son los
// del blueprint y los del copy.
//
// Se abre como overlay sobre Hoy en la franja de amanecer y se cierra dejando
// el día empezado. Salir por donde sea —la X, Escape, "Hoy voy con prisa" o
// "Comenzar mi día"— lo completa: un ritual no es una deuda que se reclama
// después, y los hábitos sin marcar no lo dejan a medias (RN-03).
//
// Todo lo que se toca se guarda en el momento (RN-02): marcar un hábito escribe
// su fila, la intención se guarda al salir del campo. Si al terminar falla el
// almacén, lo marcado ya está en disco y el ritual se cierra igual.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { copy } from '@copy'
import { colors, gradientsBySlot } from '@tokens'
import { markHabit, unmarkHabit } from '@lib/db'
import {
  loadRitualManana,
  guardarIntencion,
  completarRitualManana,
} from '@lib/ritualManana'
import Button from '@components/ui/Button'
import RitualLayout from '@components/ritual/RitualLayout'
import R2Bienvenida  from './manana/R2Bienvenida'
import R3Identidad   from './manana/R3Identidad'
import R4Habitos     from './manana/R4Habitos'
import R5Intencion   from './manana/R5Intencion'

const BACKGROUND = `linear-gradient(160deg, ${gradientsBySlot.amanecer.from} 0%, ${colors.paper} 62%)`

const STEPS = [
  { id: 'r2' },
  // Sin identidad central no hay nada que devolver: el paso desaparece en vez
  // de mostrarse a medias. (Solo pasa si se saltó el onboarding.)
  { id: 'r3', skipWhen: datos => !datos.perfil?.identidadCentral },
  { id: 'r4' },
  { id: 'r5' },
]

export default function RitualManana({ onClose }) {
  const [datos, setDatos]         = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [hechos, setHechos]       = useState(() => new Set())
  const [intencion, setIntencion] = useState('')

  useEffect(() => {
    let vivo = true
    loadRitualManana()
      .then(cargados => {
        if (!vivo) return
        setDatos(cargados)
        setHechos(cargados.hechos)
        setIntencion(cargados.intencion)
      })
      .catch(error => {
        // Sin datos el ritual no se abre, pero tampoco rompe Hoy
        console.warn('[Strivo] No se pudo abrir el ritual de mañana:', error)
        if (vivo) onClose()
      })
    return () => { vivo = false }
  }, [onClose])

  const steps = useMemo(
    () => (datos ? STEPS.filter(s => !s.skipWhen?.(datos)) : STEPS),
    [datos]
  )

  const siguiente = () => setStepIndex(i => Math.min(steps.length - 1, i + 1))
  const atras     = () => setStepIndex(i => Math.max(0, i - 1))

  const cerrar = useCallback(async intencionFinal => {
    if (datos) {
      try {
        await completarRitualManana(datos.userId, datos.fecha, intencionFinal)
      } catch (error) {
        console.warn('[Strivo] El ritual se cierra sin registrar el cierre:', error)
      }
    }
    onClose()
  }, [datos, onClose])

  if (!datos) return null

  const index = Math.min(stepIndex, steps.length - 1)
  const paso  = steps[index]

  // Marcar escribe al instante y la pantalla no espera a la escritura: si el
  // almacén falla, se devuelve la marca a como estaba en vez de mentir.
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
      console.warn('[Strivo] No se pudo guardar la marca:', error)
      setHechos(previos => {
        const siguientes = new Set(previos)
        if (marcar) siguientes.delete(habitId)
        else siguientes.add(habitId)
        return siguientes
      })
    }
  }

  const guardarIntencionActual = () => {
    guardarIntencion(datos.userId, datos.fecha, intencion).catch(error => {
      console.warn('[Strivo] La intención no se pudo guardar todavía:', error)
    })
  }

  const esUltimo = index === steps.length - 1

  const footer = esUltimo ? (
    <Button variant="primary" size="lg" fullWidth onClick={() => cerrar(intencion)}>
      {copy.ritualManana.cta}
    </Button>
  ) : (
    <>
      <Button variant="primary" size="lg" fullWidth onClick={siguiente}>
        {copy.ritual.nav.continue}
      </Button>
      {/* Ruta express: termina el ritual aquí mismo, sin pasar por el resto */}
      <Button variant="ghost" size="md" fullWidth onClick={() => cerrar(undefined)}>
        {copy.ritualManana.ctaExpress}
      </Button>
    </>
  )

  return (
    <RitualLayout
      step={index + 1}
      totalSteps={steps.length}
      title={copy.ritualManana.title}
      background={BACKGROUND}
      onClose={() => cerrar(undefined)}
      onBack={index > 0 ? atras : undefined}
      footer={footer}
    >
      {paso.id === 'r2' && (
        <R2Bienvenida
          nombre={datos.perfil?.nombre}
          diaDificil={datos.diaDificil}
        />
      )}

      {paso.id === 'r3' && (
        <R3Identidad
          identidad={datos.perfil.identidadCentral}
          area={datos.areaDelDia}
        />
      )}

      {paso.id === 'r4' && (
        <R4Habitos
          habitos={datos.habitos}
          areas={datos.areas}
          hechos={hechos}
          progreso={datos.progreso}
          onToggle={alternarHabito}
        />
      )}

      {paso.id === 'r5' && (
        <R5Intencion
          intencion={intencion}
          onChange={setIntencion}
          onGuardar={guardarIntencionActual}
        />
      )}
    </RitualLayout>
  )
}
