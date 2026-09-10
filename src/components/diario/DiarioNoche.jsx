// src/components/diario/DiarioNoche.jsx
// La noche, en tres momentos (actualización del 23 ago a §5.4).
//
//   1. ¿Qué quiero reconocer de hoy?
//   2. Una reflexión breve, distinta cada noche
//   3. ¿Cómo me siento al cerrar el día?
//   +  Si quieres, deja algo aquí        (por la emoción, o desde su enlace)
//   →  El cierre: "Tu día puede terminar aquí." y "Cerrar mi día"
//   →  La consulta: lo respondido, con las preguntas delante
//
// **La noche no evalúa el día.** No pide que nada haya salido bien, no exige
// una lección, no compara la mañana con la noche y no cuenta nada de lo
// escrito. Lo único que entra de la mañana es la intención —cuando toca, según
// §6— y entra como pregunta, nunca como examen: se pregunta qué se notó, jamás
// si se cumplió.
//
// **Nada bloquea.** Se puede avanzar con todo en blanco, volver atrás, cambiar
// cualquier respuesta y cerrar el día sin haber escrito una palabra. No hay
// "incompleto", no hay campos en rojo y no hay ninguna frase que cuente lo que
// falta. Lo que quedó sin contestar se anota en `skipped` para saber qué se
// preguntó, no para reprochárselo a nadie.
//
// **Se guarda solo, todo el rato** (RN-02). Los toques se escriben al momento y
// lo que se teclea a los 800 ms, igual que en el resto del diario: salir a media
// frase no pierde nada, y volver la misma noche devuelve todo donde estaba.
//
// **Se muestra empotrada en Hoy**, bajo el conmutador: no trae cabecera, ni
// fecha, ni frase del día —eso es del héroe— ni botón de volver. Lo único que
// ocupa la pantalla entera es el cierre, que es la ceremonia.
//
// §5.4.3 — El contenedor de Hoy declara `data-surface="dark"` y todo el texto
// hereda el color claro. Ningún componente de aquí fija un color literal.

import { useEffect, useRef, useState } from 'react'
import CierreDeLaNoche from './noche/CierreDeLaNoche'
import MomentoDescarga from './noche/MomentoDescarga'
import MomentoEmocion from './noche/MomentoEmocion'
import MomentoReconocimiento from './noche/MomentoReconocimiento'
import MomentoReflexion from './noche/MomentoReflexion'
import ResumenNoche from './noche/ResumenNoche'
import { IndicadorPasos, NavegacionPasos } from './Pasos'
import { copy, interpolate } from '@copy'
import { LIMITES, desdeTextos, filasIniciales, textosDe } from '@/diario/filas'
import { diaDeLaSemana } from '@/diario/fechas'
import {
  MOMENTOS,
  VERSION,
  algoQueReconoces,
  camposOmitidos,
  emocionesDeCierre,
  estaCerrada,
  hayDescarga,
  marcaLocal,
  resumenDeNoche,
} from '@/diario/noche'
import { CIERRE, ofreceDescarga } from '@/diario/nocheEmociones'
import { reconocimientoDeLaNoche } from '@/diario/nocheReconocimiento'
import { puedeOfrecerDescarga, reflexionDeLaNoche } from '@/diario/nocheReflexion'

const textos = copy.diario.noche

/** El paso de la descarga opcional, que va detrás de los tres momentos. */
const PASO_DESCARGA = MOMENTOS.length

/** El copy del indicador. `Pasos` sirve a los dos recorridos y no lo alcanza. */
const PASOS = textos.pasos

const VALORES_VACIOS = Object.freeze({
  reflexion: '',
  // La emoción de cierre admite hasta tres desde el 10 de septiembre de 2026,
  // así que aquí vive una lista y no un id suelto. Cuántas caben no se decide en
  // esta pantalla: lo dice el catálogo.
  emociones: [],
  emocionPropia: '',
  descarga: '',
})

export default function DiarioNoche({ estado, acciones, soloLectura = false }) {
  const [vista, setVista] = useState('recorrido')
  const [paso, setPaso] = useState(0)
  const [valores, setValores] = useState(VALORES_VACIOS)
  const [reconocido, setReconocido] = useState([])
  // Abrir la descarga a mano es una decisión de esta sesión, no un dato del
  // día: quien la pidió no ha dicho nada de sí mismo todavía.
  const [descargaPedida, setDescargaPedida] = useState(false)
  const marco = useRef(null)
  const primerRender = useRef(true)

  const night = estado.night

  // La noche guardada se copia al estado local una sola vez por fecha: a partir
  // de ahí manda lo que se está escribiendo y el guardado va detrás.
  useEffect(() => {
    setValores({
      reflexion: night?.reflection ?? '',
      // `emocionesDeCierre` lee las dos formas: la lista de hoy y el id suelto
      // de las noches anteriores, que no se migran (RN-DB-04).
      emociones: emocionesDeCierre(night),
      emocionPropia: night?.closingFeelingOther ?? '',
      descarga: night?.release ?? '',
    })
    setReconocido(filasIniciales(desdeTextos(night?.recognized), LIMITES.reconocimiento))
    setVista(estaCerrada(night) ? 'resumen' : 'recorrido')
    setPaso(0)
    setDescargaPedida(false)
    // Solo al cambiar de día: releer en cada guardado pisaría lo que se escribe.
  }, [estado.fecha])

  // Cambiar de momento lleva la tarjeta arriba del todo. Sin esto, con el
  // teclado abierto la pregunta nueva puede quedar fuera de la ventana.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false
      return
    }
    marco.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [paso, vista])

  /**
   * La pregunta del primer momento, hecha con la emoción que hay **en
   * pantalla** y no con la guardada: cambiarla en el tercer momento y volver
   * atrás tiene que devolver la pregunta nueva. No se congela y no hace falta
   * que se congele — se deriva de la fecha, así que dentro de la noche no se
   * mueve sola (`nocheReconocimiento.js`).
   *
   * Lo escrito **no se toca**: las filas viven en `reconocido` y esto solo
   * decide qué se lee encima de ellas.
   */
  const reconocimiento = reconocimientoDeLaNoche(valores.emociones, estado.fecha)

  const pregunta = reflexionDeLaNoche(
    estado.noches,
    estado.fecha,
    estado.morning,
    estado.genero,
    night,
  )

  // §8 y criterio 9 — la noche en que la reflexión ya fue "¿Qué necesito soltar
  // por hoy?" no ofrece la descarga por ninguna de las dos vías.
  const descargaDisponible = puedeOfrecerDescarga(night)
  const conDescarga =
    descargaDisponible &&
    (descargaPedida || ofreceDescarga(valores.emociones) || hayDescarga(night))

  /**
   * §5 — La pregunta se congela al mostrarse, no al contestarse. Salir y volver
   * la misma noche devuelve la misma; y si solo contáramos las respondidas,
   * quien nunca responde vería siempre la primera del banco.
   */
  useEffect(() => {
    if (paso !== 1 || night?.reflectionId) return
    acciones.guardarNoche({
      reflectionId: pregunta.id,
      reflectionSource: pregunta.fuente,
      version: VERSION,
      updatedAt: marcaLocal(),
    })
  }, [paso, night?.reflectionId])

  /** Un toque se guarda al momento; lo escrito, a los 800 ms. */
  const sello = () => ({ version: VERSION, updatedAt: marcaLocal() })
  const guardar = (patch) => acciones.guardarNoche({ ...patch, ...sello() })
  const escribir = (patch) => acciones.escribirNoche({ ...patch, ...sello() })

  const cambiarReconocido = (filas) => {
    setReconocido(filas)
    escribir({ recognized: textosDe(filas) })
  }

  const cambiarReflexion = (texto) => {
    setValores((previos) => ({ ...previos, reflexion: texto }))
    escribir({ reflection: texto })
  }

  const cambiarDescarga = (texto) => {
    setValores((previos) => ({ ...previos, descarga: texto }))
    escribir({ release: texto })
  }

  /**
   * Tocar un chip es un toque y se guarda ya. Escribir la palabra propia es
   * escribir, y espera como todo lo demás.
   *
   * La lista con la que trabajan los chips la resuelve el propio catálogo y
   * llega ya resuelta: hasta tres desde el 10 de septiembre de 2026, y cuántas
   * caben no se cuenta aquí.
   */
  const cambiarEmocion = (patch) => {
    const siguientes = { ...valores, ...patch }
    setValores(siguientes)

    const elegidas = CIERRE.paraGuardarVarias(siguientes.emociones, siguientes.emocionPropia)
    const registro = { closingFeelings: elegidas.valores, closingFeelingOther: elegidas.otro }

    const tecleando = 'emocionPropia' in patch
    if (tecleando) escribir(registro)
    else guardar(registro)
  }

  /** Lo que hay ahora mismo, mezclando lo guardado con lo que está en pantalla. */
  const entradaActual = () => {
    const elegidas = CIERRE.paraGuardarVarias(valores.emociones, valores.emocionPropia)
    return {
      ...night,
      recognized: textosDe(reconocido),
      reflection: valores.reflexion,
      closingFeelings: elegidas.valores,
      closingFeelingOther: elegidas.otro,
      release: valores.descarga,
    }
  }

  const terminar = async () => {
    await acciones.volcar()
    const entrada = entradaActual()
    await guardar({
      recognized: entrada.recognized,
      reflection: entrada.reflection,
      release: entrada.release,
      skipped: camposOmitidos(entrada, { conDescarga }),
      completedAt: marcaLocal(),
    })
    setVista('cierre')
  }

  const avanzar = () => {
    if (paso < MOMENTOS.length - 1) return setPaso(paso + 1)
    if (paso === MOMENTOS.length - 1 && conDescarga) return setPaso(PASO_DESCARGA)
    return terminar()
  }

  const abrirDescarga = () => {
    setDescargaPedida(true)
    setPaso(PASO_DESCARGA)
  }

  /**
   * Un día fuera de la ventana de 72 horas se lee y no se escribe
   * (`@/diario/ventanaEdicion`). **No se oculta y no desaparece**: se muestra
   * con la misma pantalla de consulta que un día ya cerrado, con las preguntas
   * delante y las respuestas debajo. Lo único que no está es el enlace para
   * cambiar algo, porque ya no hay nada que cambiar.
   *
   * Va después de todos los hooks a propósito: el día se carga igual, se lee
   * igual y solo cambia lo que se pinta.
   */
  if (soloLectura) {
    return (
      <div ref={marco}>
        <ResumenNoche
          bloques={resumenDeNoche(night, estado.morning, estado.genero, estado.fecha)}
        />
      </div>
    )
  }

  if (vista === 'cierre') {
    return (
      <CierreDeLaNoche
        reconocido={algoQueReconoces(entradaActual())}
        conDescarga={hayDescarga(entradaActual())}
        // Al terminar la ceremonia se vuelve al día, que sigue debajo: no hay
        // pantalla anterior a la que salir y el día no se bloquea. Reabrir y
        // volver a cerrar no duplica nada (RN-VN-05).
        onTerminar={() => setVista('resumen')}
      />
    )
  }

  if (vista === 'resumen') {
    return (
      <div ref={marco}>
        <ResumenNoche
          bloques={resumenDeNoche(night, estado.morning, estado.genero, estado.fecha)}
          onEditar={() => {
            setPaso(0)
            setVista('recorrido')
          }}
        />
      </div>
    )
  }

  const enDescarga = paso === PASO_DESCARGA
  const esUltimo = paso === MOMENTOS.length - 1 && !conDescarga

  return (
    <div ref={marco} className="flex flex-col gap-8 scroll-mt-4">
      {/* La línea de apertura enmarca el recorrido y por eso va una sola vez, en
          el primer momento: repetirla en cada pantalla la convertiría en una
          cabecera, y en el tercer momento el día ya está cerrándose. */}
      {paso === 0 && (
        <p className="text-sm text-on-surface-soft">
          {interpolate(textos.aperturaTemplate, { dia: diaDeLaSemana(estado.fecha) })}
        </p>
      )}

      {!enDescarga && <IndicadorPasos textos={PASOS} indice={paso} total={MOMENTOS.length} />}

      {paso === 0 && (
        <MomentoReconocimiento
          pregunta={reconocimiento}
          filas={reconocido}
          onCambiar={cambiarReconocido}
          onVolcar={acciones.volcar}
          onOmitir={avanzar}
        />
      )}

      {paso === 1 && (
        <MomentoReflexion
          pregunta={pregunta}
          valor={valores.reflexion}
          onCambiar={cambiarReflexion}
          onVolcar={acciones.volcar}
          onOmitir={avanzar}
        />
      )}

      {paso === 2 && (
        <MomentoEmocion
          valores={valores}
          genero={estado.genero}
          conDescarga={descargaDisponible}
          onCambiar={(emociones) => cambiarEmocion({ emociones })}
          onValorPropio={(texto) => cambiarEmocion({ emocionPropia: texto })}
          onAbrirDescarga={abrirDescarga}
        />
      )}

      {enDescarga && (
        <MomentoDescarga
          valor={valores.descarga}
          textoAtras={PASOS.atras}
          onCambiar={cambiarDescarga}
          onVolcar={acciones.volcar}
          onOmitir={terminar}
          onCerrar={terminar}
          onAtras={() => setPaso(MOMENTOS.length - 1)}
        />
      )}

      {/* La descarga trae sus propios controles (§8): un "Listo" más ahí serían
          dos formas distintas de terminar la misma noche. */}
      {!enDescarga && (
        <NavegacionPasos
          textos={PASOS}
          hayAtras={paso > 0}
          esUltimo={esUltimo}
          onAtras={() => setPaso(paso - 1)}
          onSiguiente={avanzar}
        />
      )}
    </div>
  )
}
