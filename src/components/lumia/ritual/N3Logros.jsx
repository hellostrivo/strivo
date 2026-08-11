// src/components/lumia/ritual/N3Logros.jsx
// N3 — Logros (§5.6): victorias heredadas + logros no planeados.
//
// **Se llama N3 y no N2.** El hueco es intencional: N2 era el checklist de
// hábitos y se retiró en v4.1 (§C7.7.1). Los identificadores no se reciclan.
//
// Escribe exactamente donde escribe la Vista de Noche —las mismas victorias y
// el mismo `newWins`— porque el ritual es el modo guiado y el Diario la vista
// libre del mismo dato (D-4.5). Por eso reutiliza sus componentes en vez de
// tener una segunda versión que pueda divergir.
//
// Los logros no planeados son el antídoto directo contra el sesgo de
// negatividad: casi todos los días contienen logros que nadie registra.

import { useEffect, useRef, useState } from 'react'
import FilasDinamicas from '../FilasDinamicas'
import VictoriasHeredadas from '../VictoriasHeredadas'
import { copy } from '@copy'
import {
  LIMITES,
  conIdsDe,
  desdeRegistros,
  desdeTextos,
  filasIniciales,
  textosDe,
} from '@/lumia/filas'
import { visiblesDeNoche } from '@/lumia/victorias'

const textos = copy.lumia.diario.noche

/** §5.4, Bloque 3 — la sugerencia aparece tras 6 s sin escribir. */
const RETRASO_LOGROS = 6000

export default function N3Logros({ estado, acciones }) {
  const [logros, setLogros] = useState([])
  const [victorias, verVictorias] = useState([])
  const [abierta, setAbierta] = useState(null)
  const [pista, setPista] = useState(false)
  const temporizador = useRef(null)

  // El guardado lee las filas cuando le toca el turno, no cuando se encola:
  // entre una cosa y otra la persona ha seguido escribiendo.
  const filasRef = useRef([])
  const setVictorias = (filas) => {
    filasRef.current = filas
    verVictorias(filas)
  }

  useEffect(() => {
    setLogros(filasIniciales(desdeTextos(estado.night?.newWins), LIMITES.logros))
    setVictorias(filasIniciales(desdeRegistros(estado.victorias), LIMITES.victorias))
  }, [estado.fecha])

  useEffect(() => () => clearTimeout(temporizador.current), [])

  const guardarLogros = (filas) => {
    setLogros(filas)
    acciones.escribirNoche({ newWins: textosDe(filas) })
    clearTimeout(temporizador.current)
    setPista(false)
    if (textosDe(filas).length === 0) {
      temporizador.current = setTimeout(() => setPista(true), RETRASO_LOGROS)
    }
  }

  // Sin victorias de la mañana, lo que se escribe aquí ya ocurrió: nace logrado.
  const volcarVictorias = async () => {
    const resultado = await acciones.guardarVictorias(() => filasRef.current, 'lograda')
    if (resultado?.victorias) setVictorias(conIdsDe(filasRef.current, resultado.victorias))
  }

  return (
    <div className="flex flex-col gap-8">
      <VictoriasHeredadas
        victorias={visiblesDeNoche(estado.victorias)}
        filas={victorias}
        abierta={abierta}
        onAbrir={setAbierta}
        onCambiarFilas={setVictorias}
        onVolcar={volcarVictorias}
        onAlternar={acciones.alternarLograda}
        onPasar={(victoria) => {
          setAbierta(null)
          acciones.pasarAManana(victoria)
        }}
        onSoltar={(victoria) => {
          setAbierta(null)
          acciones.dejarIr(victoria)
        }}
        onDeshacer={acciones.deshacerDecision}
      />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-md text-on-surface">{textos.logros.titulo}</h2>
        <FilasDinamicas
          filas={logros}
          limites={LIMITES.logros}
          onCambiar={guardarLogros}
          onVolcar={acciones.volcar}
          placeholder={textos.logros.placeholder}
          etiqueta={textos.logros.titulo}
        />
        {pista && (
          <p className="text-sm text-on-surface-soft animate-fade-up motion-reduce:animate-none">
            {textos.logros.sugerencia}
          </p>
        )}
      </section>
    </div>
  )
}
