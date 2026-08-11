// src/components/lumia/ritual/N5EstadoSueno.jsx
// N5 — Estado de sueño y reflexión (§5.6.1, con la especificación de §5.4.1).
//
// Título y subtítulo literales, nueve opciones en formato `{ m, f, n }`, máximo
// dos selecciones y "Algo más" con campo en línea de una sola palabra. Reutiliza
// `EstadoSueno`, que ya es el único sitio donde vive ese bloque: N5 y el Bloque
// 7 de la Vista de Noche escriben en el mismo campo, así que rellenar uno
// rellena el otro (D-4.5).
//
// El subtítulo —"Elige una o dos. No hay una forma correcta de cerrar el día"—
// es la única defensa de la pantalla contra la sensación de examen. No se
// acorta y no se reescribe.
//
// **El paso es saltable.** Saltarlo no impide llegar a N6 ni altera la síntesis
// de cierre. La regla de sensibilidad de §5.4.1 se evalúa al salir de aquí y
// decide la variante de N6: con `cansado` o `inquieto`, cierre compasivo sin
// celebración.
//
// La reflexión larga es la profundidad opt-in de §5.6: un ritual con más campos
// obligatorios estaría en el límite de la fatiga nocturna.

import { useEffect, useState } from 'react'
import EstadoSueno from '../EstadoSueno'
import { CampoTexto } from '../Campo'
import { copy } from '@copy'

const textos = copy.lumia.diario.noche.aprendizaje
const ritual = copy.lumia.ritualNoche.n5

export default function N5EstadoSueno({ estado, acciones }) {
  const [aprendizaje, setAprendizaje] = useState('')
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    const guardado = estado.night?.learning ?? ''
    setAprendizaje(guardado)
    // Si ya hay algo escrito, el campo se abre solo: esconder lo que la persona
    // escribió detrás de un enlace sería hacérselo buscar.
    if (guardado.trim() !== '') setAbierto(true)
  }, [estado.fecha])

  const guardar = (texto) => {
    setAprendizaje(texto)
    acciones.escribirNoche({ learning: texto })
  }

  return (
    <div className="flex flex-col gap-8">
      <EstadoSueno
        seleccion={estado.night?.sleepState ?? []}
        otro={estado.night?.sleepStateOther ?? ''}
        genero={estado.genero}
        onCambiar={acciones.guardarEstadoSueno}
      />

      <section className="flex flex-col gap-3">
        {abierto ? (
          <>
            <p className="text-base text-on-surface">{textos.pregunta}</p>
            <CampoTexto
              filas={4}
              value={aprendizaje}
              onChange={(evento) => guardar(evento.target.value)}
              onBlur={acciones.volcar}
              placeholder={textos.placeholder}
              aria-label={textos.pregunta}
            />
          </>
        ) : (
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="self-start rounded-full border border-on-surface bg-lumia-campo px-4 py-2 min-h-touch-sm text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {ritual.mas}
          </button>
        )}
      </section>
    </div>
  )
}
