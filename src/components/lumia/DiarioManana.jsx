// src/components/lumia/DiarioManana.jsx
// Vista de Mañana del Diario (§5.3). Tres bloques:
//
//   1. Emociones — "¿Cómo me quiero sentir hoy?"
//   2. Agradecimientos
//   3. Gran visión
//
// **No hay bloque de victorias.** "Tres victorias que quisiera conseguir hoy"
// se retiró el 23 ago: la mañana ya no pide planear el día. Lo que surja sin
// haberse previsto se anota libremente en el Journal, que es el espacio de
// escritura sin estructura (§5.8), y no como un campo aparte.
//
// **Las emociones van primero**, invirtiendo el orden de §5.3: la pregunta más
// fácil de responder —un toque, sin escribir— abre la pantalla, y las que piden
// escribir vienen después. Los dos temporizadores de más abajo no se enteran de
// la mudanza: el de las sugerencias de gratitud vive dentro de `CampoGratitud`
// y cuenta desde que se monta y desde cada tecla, no desde que se ve.
//
// El bloque 1 de §5.3 —la frase del día— sigue en pantalla y sigue siendo el
// primero que se lee: lo pinta el héroe de Hoy, una vez, para las dos
// secciones. Aquí se repetiría.
//
// **No hay sexto bloque.** El checklist de hábitos de Fase 0 no se construye
// aquí ni en ningún sitio de Lumia: no se elimina nada, nunca existió en este
// código (§C2.6).
//
// Ningún campo es obligatorio y ninguno bloquea (RN-VM-01). Se puede mirar la
// pantalla entera sin escribir una palabra.
//
// **Se muestra empotrada en Hoy, no como pantalla aparte.** Por eso no trae
// cabecera —el saludo, la fecha y la frase del día son del héroe— ni botón de
// volver ni de terminar: no hay a dónde volver, y lo escrito se guarda solo
// mientras se escribe.

import { useEffect, useRef, useState } from 'react'
import CampoGratitud from './CampoGratitud'
import ChipsEmociones from './ChipsEmociones'
import { CampoTexto } from './Campo'
import { copy } from '@copy'
import { LIMITES, desdeTextos, filasIniciales, textosDe } from '@/lumia/filas'
import { CATALOGO, alternarEmocion } from '@/lumia/emociones'

const textos = copy.lumia.diario.manana

/** §5.3, Bloque 4 — la pregunta de apoyo aparece tras 8 s sin escribir. */
const RETRASO_GRAN_VISION = 8000

export default function DiarioManana({ estado, acciones }) {
  const [gratitud, setGratitud] = useState([])
  const [granVision, setGranVision] = useState('')
  const [emociones, setEmociones] = useState([])
  const [aviso, setAviso] = useState(false)
  const [pistaGranVision, setPistaGranVision] = useState(false)
  const temporizador = useRef(null)

  // Se copia el día guardado al estado local una sola vez: a partir de ahí
  // manda lo que se está escribiendo, y el guardado va detrás.
  useEffect(() => {
    setGratitud(filasIniciales(desdeTextos(estado.morning?.gratitude), LIMITES.gratitud))
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

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-md text-on-surface">{textos.emociones.titulo}</h2>
          <p className="text-sm text-on-surface-soft">{textos.emociones.lead}</p>
        </div>
        <ChipsEmociones
          catalogo={CATALOGO}
          alternar={alternarEmocion}
          seleccion={emociones}
          genero={estado.genero}
          etiqueta={textos.emociones.titulo}
          aviso={aviso}
          avisoTexto={textos.emociones.max}
          onCambiar={guardarEmociones}
          onDesplazada={() => setAviso(true)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-md text-on-surface">{textos.gratitud.titulo}</h2>
          <p className="text-sm text-on-surface-soft">{textos.gratitud.lead}</p>
        </div>
        <CampoGratitud
          filas={gratitud}
          limites={LIMITES.gratitud}
          onCambiar={guardarGratitud}
          onVolcar={acciones.volcar}
          sugerencias={textos.gratitud.sugerencias}
          etiqueta={textos.gratitud.titulo}
          placeholder={textos.gratitud.placeholder}
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
    </div>
  )
}
