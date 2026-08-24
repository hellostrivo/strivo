// src/components/lumia/DiarioNoche.jsx
// Vista de Noche del Diario (§5.4). Cinco bloques:
//
//   1. Agradecimientos del día
//   2. Aprendizaje
//   3. Estado de sueño
//   4. Síntesis
//   5. Cierre
//
// **No hay checklist de logros ni victorias heredadas.** Los dos bloques se
// retiraron el 23 ago junto con las victorias de la mañana: sin victorias de
// origen no hay nada que heredar, y un inventario de logros aparte convertía
// el cierre en un balance. Lo que se logró sin haberlo previsto se anota
// libremente en el Journal (§5.8), no como campo estructurado.
//
// **No hay bloque de checklist de hábitos.** El progreso de hábitos vive
// únicamente en Formia y ninguna superficie de Lumia lo muestra (§C2.6).
//
// Esta vista se diseña para el peor día, no para el mejor: se puede recorrer
// entera sin escribir nada y cerrarse igual (RN-VN-01).
//
// **Se muestra empotrada en Hoy, no como pantalla aparte.** El saludo y la
// fecha son del héroe y no se repiten aquí; lo que sí se queda es la línea de
// apertura, que enmarca el cierre y no la dice nadie más. El botón de cerrar
// el día **no** es un paso de navegación: es la ceremonia (§5.4, Bloque 7).
//
// §5.4.3 — El contenedor declara `data-surface="dark"` y todo el texto hereda
// el color claro. Ningún componente de aquí fija un color literal.

import { useEffect, useState } from 'react'
import CampoGratitud from './CampoGratitud'
import CierreDelDia from './CierreDelDia'
import EstadoSueno from './EstadoSueno'
import { CampoTexto } from './Campo'
import Button from '@components/ui/Button'
import { copy, interpolate } from '@copy'
import { LIMITES, desdeTextos, filasIniciales, textosDe } from '@/lumia/filas'
import { diaDeLaSemana, fechaCorta } from '@/lumia/fechas'
import { disparaCompasion } from '@/lumia/estadoSueno'
import { sintesisDelDia } from '@/lumia/diario'

const textos = copy.lumia.diario.noche

export default function DiarioNoche({ estado, acciones }) {
  const [gratitud, setGratitud] = useState([])
  const [aprendizaje, setAprendizaje] = useState('')
  const [pregunta, setPregunta] = useState(textos.aprendizaje.pregunta)
  const [verGratitudManana, setVerGratitudManana] = useState(false)
  const [cerrando, setCerrando] = useState(false)

  useEffect(() => {
    setGratitud(filasIniciales(desdeTextos(estado.night?.gratitude), LIMITES.gratitud))
    setAprendizaje(estado.night?.learning ?? '')
  }, [estado.fecha])

  const sueno = estado.night?.sleepState ?? []
  const compasivo = disparaCompasion(sueno)
  const gratitudDeManana = estado.morning?.gratitude ?? []

  const guardarGratitud = (filas) => {
    setGratitud(filas)
    acciones.escribirNoche({ gratitude: textosDe(filas) })
  }

  const guardarAprendizaje = (texto) => {
    setAprendizaje(texto)
    acciones.escribirNoche({ learning: texto })
  }

  const cerrarDia = async () => {
    await acciones.volcar()
    setCerrando(true)
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-on-surface-soft">
        {interpolate(textos.aperturaTemplate, { dia: diaDeLaSemana(estado.fecha) })}
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-md text-on-surface">{textos.gratitud.titulo}</h2>

        {/* Lo de la mañana se muestra plegado y no se vuelve a pedir (§5.4, B4). */}
        {gratitudDeManana.length > 0 && (
          <div className="flex flex-col gap-1 rounded-md border border-on-surface bg-lumia-campo p-3">
            <p className="text-sm text-on-surface-soft">
              {interpolate(textos.gratitud.mananaTemplate, {
                textos: verGratitudManana ? gratitudDeManana.join(' · ') : '…',
              })}
            </p>
            <button
              type="button"
              onClick={() => setVerGratitudManana((previo) => !previo)}
              className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
            >
              {verGratitudManana ? textos.gratitud.ocultar : textos.gratitud.ver}
            </button>
          </div>
        )}

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
        <h2 className="font-display text-md text-on-surface">
          {interpolate(textos.aprendizaje.tituloTemplate, { fecha: fechaCorta(estado.fecha) })}
        </h2>

        {/* Contraste amable con la mañana. Nunca se pregunta si se cumplió. */}
        {String(estado.morning?.granVision ?? '').trim() !== '' && (
          <div className="flex flex-col gap-1 rounded-md border border-on-surface bg-lumia-campo p-3">
            <p className="text-sm text-on-surface-soft">{textos.aprendizaje.granVisionTitulo}</p>
            <p className="text-base text-on-surface">{estado.morning.granVision}</p>
            <p className="text-sm text-on-surface-soft">{textos.aprendizaje.granVisionPregunta}</p>
          </div>
        )}

        <p className="text-base text-on-surface">{pregunta}</p>
        <CampoTexto
          filas={5}
          value={aprendizaje}
          onChange={(evento) => guardarAprendizaje(evento.target.value)}
          onBlur={acciones.volcar}
          placeholder={textos.aprendizaje.placeholder}
          aria-label={pregunta}
        />
        <button
          type="button"
          onClick={() => {
            const banco = [textos.aprendizaje.pregunta, ...textos.aprendizaje.preguntas]
            const siguiente = banco[(banco.indexOf(pregunta) + 1) % banco.length]
            setPregunta(siguiente)
          }}
          className="self-start rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          {textos.aprendizaje.otraPregunta}
        </button>
      </section>

      <EstadoSueno
        seleccion={sueno}
        otro={estado.night?.sleepStateOther ?? ''}
        genero={estado.genero}
        onCambiar={acciones.guardarEstadoSueno}
      />

      <Button fullWidth variant="surface" onClick={cerrarDia}>
        {textos.cierre.cta}
      </Button>

      {cerrando && (
        <CierreDelDia
          sintesis={sintesisDelDia(estado.night)}
          compasivo={compasivo}
          // Al terminar la ceremonia se vuelve al día, que sigue debajo: no
          // hay pantalla anterior a la que salir y el día no se bloquea
          // (RN-VN-05, reabrir y volver a cerrar no duplica nada).
          onTerminar={() => setCerrando(false)}
        />
      )}
    </div>
  )
}
