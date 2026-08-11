// src/components/lumia/DiarioManana.jsx
// Vista de Mañana del Diario (§5.3). Cinco bloques:
//
//   1. Frase del día
//   2. Agradecimientos
//   3. Emociones — "¿Cómo me quiero sentir hoy?"
//   4. Gran visión
//   5. Victorias
//
// **No hay sexto bloque.** El checklist de hábitos de Fase 0 no se construye
// aquí ni en ningún sitio de Lumia: no se elimina nada, nunca existió en este
// código (§C2.6).
//
// Ningún campo es obligatorio y ninguno bloquea (RN-VM-01). Se puede entrar,
// mirar y salir sin escribir una palabra.

import { useEffect, useRef, useState } from 'react'
import CampoGratitud from './CampoGratitud'
import ChipsEmociones from './ChipsEmociones'
import FraseDelDia from './FraseDelDia'
import ListaVictorias from './ListaVictorias'
import { CampoTexto } from './Campo'
import Button from '@components/ui/Button'
import { copy, interpolate } from '@copy'
import {
  LIMITES,
  conIdsDe,
  desdeRegistros,
  desdeTextos,
  filasIniciales,
  textosDe,
} from '@/lumia/filas'
import { fechaLarga, franjaDelSaludo } from '@/lumia/fechas'

const textos = copy.lumia.diario.manana
const saludos = copy.lumia.hoy.saludo

/** §5.3, Bloque 4 — la pregunta de apoyo aparece tras 8 s sin escribir. */
const RETRASO_GRAN_VISION = 8000

function saludoDelDia(nombre) {
  const saludo = saludos[franjaDelSaludo()]
  return nombre ? interpolate(saludos.conNombreTemplate, { saludo, nombre }) : saludo
}

export default function DiarioManana({ estado, acciones, onSalir }) {
  const [gratitud, setGratitud] = useState([])
  const [victorias, verVictorias] = useState([])
  // Las filas también viven en una referencia: el guardado las lee cuando le
  // toca el turno, no cuando se pidió, y para entonces pueden haber cambiado.
  const filasRef = useRef([])
  const setVictorias = (filas) => {
    filasRef.current = filas
    verVictorias(filas)
  }
  const [granVision, setGranVision] = useState('')
  const [emociones, setEmociones] = useState([])
  const [aviso, setAviso] = useState(false)
  const [pistaGranVision, setPistaGranVision] = useState(false)
  const temporizador = useRef(null)

  // Se copia el día guardado al estado local una sola vez: a partir de ahí
  // manda lo que se está escribiendo, y el guardado va detrás.
  useEffect(() => {
    setGratitud(filasIniciales(desdeTextos(estado.morning?.gratitude), LIMITES.gratitud))
    setVictorias(filasIniciales(desdeRegistros(estado.victorias), LIMITES.victorias))
    setGranVision(estado.morning?.granVision ?? '')
    setEmociones(estado.morning?.emotions ?? [])
  }, [estado.fecha])

  useEffect(() => () => clearTimeout(temporizador.current), [])

  const guardarGratitud = (filas) => {
    setGratitud(filas)
    acciones.escribirManana({ gratitude: textosDe(filas) })
  }

  const guardarGranVision = (texto) => {
    setGranVision(texto)
    acciones.escribirManana({ granVision: texto })
    setPistaGranVision(false)
    clearTimeout(temporizador.current)
    if (texto.trim() === '') {
      temporizador.current = setTimeout(() => setPistaGranVision(true), RETRASO_GRAN_VISION)
    }
  }

  const guardarEmociones = (siguiente) => {
    setEmociones(siguiente)
    setAviso(false)
    acciones.guardarManana({ emotions: siguiente })
  }

  // Al volcar, las victorias vuelven con su id: sin esto, la siguiente
  // escritura crearía un registro nuevo con el mismo texto. Solo se recoge el
  // id, nunca la lista entera: mientras el guardado iba y venía se ha podido
  // escribir en la fila siguiente.
  const volcarVictorias = async () => {
    const resultado = await acciones.guardarVictorias(() => filasRef.current)
    if (resultado?.victorias) {
      setVictorias(conIdsDe(filasRef.current, resultado.victorias))
    }
  }

  const vacia =
    textosDe(gratitud).length === 0 &&
    textosDe(victorias).length === 0 &&
    emociones.length === 0 &&
    granVision.trim() === ''

  return (
    <div className="flex flex-col gap-8 px-5 pb-12 pt-6">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onSalir}
          className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          {textos.volver}
        </button>
        <h1 className="font-display text-lg text-on-surface">{saludoDelDia(estado.nombre)}</h1>
        <p className="text-sm text-on-surface-soft">{fechaLarga(estado.fecha)}</p>
        <FraseDelDia frase={estado.frase} />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-md text-on-surface">{textos.gratitud.titulo}</h2>
        <CampoGratitud
          filas={gratitud}
          limites={LIMITES.gratitud}
          onCambiar={guardarGratitud}
          onVolcar={acciones.volcar}
          sugerencias={textos.gratitud.sugerencias}
          etiqueta={textos.gratitud.titulo}
          ayudas={textos.gratitud.ayudas}
          placeholder={textos.gratitud.placeholder}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-md text-on-surface">{textos.emociones.titulo}</h2>
          <p className="text-sm text-on-surface-soft">{textos.emociones.lead}</p>
        </div>
        <ChipsEmociones
          seleccion={emociones}
          genero={estado.genero}
          aviso={aviso}
          onCambiar={guardarEmociones}
          onDesplazada={() => setAviso(true)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-md text-on-surface">{textos.granVision.titulo}</h2>
        <CampoTexto
          value={granVision}
          onChange={(evento) => guardarGranVision(evento.target.value)}
          onBlur={acciones.volcar}
          placeholder={textos.granVision.placeholder}
          aria-label={textos.granVision.titulo}
        />
        {pistaGranVision && granVision.trim() === '' && (
          <p className="text-sm text-on-surface-soft animate-fade-up motion-reduce:animate-none">
            {textos.granVision.sugerencia}
          </p>
        )}
      </section>

      <ListaVictorias filas={victorias} onCambiar={setVictorias} onVolcar={volcarVictorias} />

      {/* §C2.4 — Sin nada escrito no hay celebración: solo una salida. */}
      <Button
        fullWidth
        onClick={async () => {
          await volcarVictorias()
          await acciones.volcar()
          onSalir()
        }}
      >
        {vacia ? textos.ctaVacio : textos.cta}
      </Button>
    </div>
  )
}
