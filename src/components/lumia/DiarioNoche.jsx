// src/components/lumia/DiarioNoche.jsx
// Vista de Noche del Diario (§5.4). Siete bloques:
//
//   1. Victorias heredadas, con sus decisiones
//   2. Logros no planeados
//   3. Agradecimientos del día
//   4. Aprendizaje
//   5. Estado de sueño
//   6. Síntesis
//   7. Cierre
//
// **No hay bloque de checklist.** El progreso de hábitos vive únicamente en
// Formia y ninguna superficie de Lumia lo muestra (§C2.6).
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

import { useEffect, useRef, useState } from 'react'
import CampoGratitud from './CampoGratitud'
import CierreDelDia from './CierreDelDia'
import EstadoSueno from './EstadoSueno'
import FilasDinamicas from './FilasDinamicas'
import VictoriasHeredadas from './VictoriasHeredadas'
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
import { diaDeLaSemana, fechaCorta } from '@/lumia/fechas'
import { disparaCompasion } from '@/lumia/estadoSueno'
import { sintesisDelDia } from '@/lumia/diario'
import { visiblesDeNoche } from '@/lumia/victorias'

const textos = copy.lumia.diario.noche

/** §5.4, Bloque 3 — la sugerencia de logros aparece tras 6 s sin escribir. */
const RETRASO_LOGROS = 6000

export default function DiarioNoche({ estado, acciones }) {
  const [logros, setLogros] = useState([])
  const [gratitud, setGratitud] = useState([])
  const [victorias, verVictorias] = useState([])
  // Igual que en la mañana: el guardado lee las filas cuando le toca el turno.
  const filasRef = useRef([])
  const setVictorias = (filas) => {
    filasRef.current = filas
    verVictorias(filas)
  }
  const [aprendizaje, setAprendizaje] = useState('')
  const [pregunta, setPregunta] = useState(textos.aprendizaje.pregunta)
  const [abierta, setAbierta] = useState(null)
  const [verGratitudManana, setVerGratitudManana] = useState(false)
  const [pistaLogros, setPistaLogros] = useState(false)
  const [cerrando, setCerrando] = useState(false)
  const temporizador = useRef(null)

  useEffect(() => {
    setLogros(filasIniciales(desdeTextos(estado.night?.newWins), LIMITES.logros))
    setGratitud(filasIniciales(desdeTextos(estado.night?.gratitude), LIMITES.gratitud))
    setVictorias(filasIniciales(desdeRegistros(estado.victorias), LIMITES.victorias))
    setAprendizaje(estado.night?.learning ?? '')
  }, [estado.fecha])

  useEffect(() => () => clearTimeout(temporizador.current), [])

  const heredadas = visiblesDeNoche(estado.victorias)
  const sueno = estado.night?.sleepState ?? []
  const compasivo = disparaCompasion(sueno)
  const gratitudDeManana = estado.morning?.gratitude ?? []

  const guardarLogros = (filas) => {
    setLogros(filas)
    acciones.escribirNoche({ newWins: textosDe(filas) })
    clearTimeout(temporizador.current)
    setPistaLogros(false)
    if (textosDe(filas).length === 0) {
      temporizador.current = setTimeout(() => setPistaLogros(true), RETRASO_LOGROS)
    }
  }

  const guardarGratitud = (filas) => {
    setGratitud(filas)
    acciones.escribirNoche({ gratitude: textosDe(filas) })
  }

  const guardarAprendizaje = (texto) => {
    setAprendizaje(texto)
    acciones.escribirNoche({ learning: texto })
  }

  // Sin victorias de la mañana, lo que se escribe aquí ya ocurrió: nace logrado.
  const volcarVictorias = async () => {
    const resultado = await acciones.guardarVictorias(() => filasRef.current, 'lograda')
    if (resultado?.victorias) {
      setVictorias(conIdsDe(filasRef.current, resultado.victorias))
    }
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

      <VictoriasHeredadas
        victorias={heredadas}
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
        {pistaLogros && (
          <p className="text-sm text-on-surface-soft animate-fade-up motion-reduce:animate-none">
            {textos.logros.sugerencia}
          </p>
        )}
      </section>

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
          sintesis={sintesisDelDia(estado.night, estado.victorias)}
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
