// src/components/diario/DiarioManana.jsx
// La mañana, en tres momentos (actualización del 23 ago a §5.3).
//
//   1. Cómo me siento esta mañana
//   2. Qué agradezco hoy
//   3. Cómo me gustaría sentirme · qué puedo hacer hoy    (dos preguntas)
//   +  Una pausa opcional, algunos días
//   →  El cierre: la intención y el paso, y "Comenzar mi día"
//   →  La consulta: lo respondido, con las preguntas delante
//
// **La intención va con la acción, no con el punto de partida.** "¿Qué puedo
// hacer hoy para acercarme a *esa sensación*?" es un pronombre sin antecedente
// si la sensación se eligió dos pantallas atrás. Juntas, además, las ideas de
// abajo cambian en el momento en que se toca un chip de arriba.
//
// **Nada bloquea.** Se puede avanzar con todo en blanco, volver atrás, cambiar
// cualquier respuesta y cerrar sin haber escrito una palabra. No hay
// "incompleto", no hay campos en rojo y no hay ninguna frase que cuente lo que
// falta. Lo que quedó sin contestar se anota en `skipped` para saber qué se
// preguntó, no para reprochárselo a nadie.
//
// **Se guarda solo, todo el rato** (RN-02). Los toques se escriben al momento y
// lo que se teclea a los 800 ms, igual que en el resto del diario: salir a media
// frase no pierde nada. La única excepción, y es de diseño, está en las ideas
// de la acción — el comentario de `MomentoAccion` lo explica.
//
// **Se muestra empotrada en Hoy**, bajo el conmutador: no trae cabecera, ni
// fecha, ni frase del día —eso es del héroe— ni botón de volver. Lo único que
// ocupa la pantalla entera es el cierre, que es una ceremonia y dura lo que
// dura un toque.
//
// La mañana ya cerrada se queda a la vista como pantalla de consulta, con el
// mismo aspecto que las del recorrido y un enlace discreto para cambiar algo.
// No hay etiqueta de "hecho": el contenido está delante.

import { useEffect, useRef, useState } from 'react'
import AperturaDelDia from './manana/AperturaDelDia'
import MomentoAnimo from './manana/MomentoAnimo'
import MomentoGratitud from './manana/MomentoGratitud'
import MomentoIntencionAccion from './manana/MomentoIntencionAccion'
import MomentoPausa from './manana/MomentoPausa'
import ResumenManana from './manana/ResumenManana'
import { IndicadorPasos, NavegacionPasos } from './Pasos'
import { copy } from '@copy'
import { LIMITES, desdeTextos, filasIniciales, textosDe } from '@/diario/filas'
import {
  MOMENTOS,
  VERSION,
  animosDeManana,
  camposOmitidos,
  estaCerrada,
  intencionesDeManana,
  lineasDeCierre,
  marcaLocal,
  resumenDeManana,
} from '@/diario/manana'
import { ANIMO, INTENCION } from '@/diario/mananaEmociones'
import { ideasAnteriores, ideasGenerales } from '@/diario/mananaAcciones'
import { debeAparecer, siguientePregunta } from '@/diario/mananaPausa'

/** El paso de la pausa opcional, que va detrás de los tres momentos. */
const PASO_PAUSA = MOMENTOS.length

/** El copy del indicador. `Pasos` sirve a los dos recorridos y no lo alcanza. */
const PASOS = copy.diario.manana.pasos

const VALORES_VACIOS = Object.freeze({
  // Las dos preguntas emocionales admiten hasta tres respuestas desde el 30 de
  // agosto de 2026, así que aquí viven listas y no ids sueltos. Cuántas caben
  // no se decide en esta pantalla: lo dice el catálogo.
  animos: [],
  animoPropio: '',
  intenciones: [],
  intencionPropia: '',
  accion: '',
  reflexion: '',
})

export default function DiarioManana({ estado, acciones }) {
  const [vista, setVista] = useState('recorrido')
  const [paso, setPaso] = useState(0)
  const [valores, setValores] = useState(VALORES_VACIOS)
  const [gratitud, setGratitud] = useState([])
  const marco = useRef(null)
  const primerRender = useRef(true)

  const morning = estado.morning

  // El día guardado se copia al estado local una sola vez por fecha: a partir
  // de ahí manda lo que se está escribiendo y el guardado va detrás.
  useEffect(() => {
    setValores({
      // `animosDeManana` lee las dos formas: la lista de hoy y el id suelto de
      // las mañanas de agosto, que no se migran (RN-DB-04).
      animos: animosDeManana(morning),
      animoPropio: morning?.feelingOther ?? '',
      intenciones: intencionesDeManana(morning),
      intencionPropia: morning?.intentionOther ?? '',
      accion: morning?.action ?? '',
      reflexion: morning?.reflection ?? '',
    })
    setGratitud(filasIniciales(desdeTextos(morning?.gratitude), LIMITES.gratitudManana))
    setVista(estaCerrada(morning) ? 'resumen' : 'recorrido')
    setPaso(0)
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

  const conPausa = debeAparecer(estado.recientes, estado.fecha, morning)
  const pregunta = siguientePregunta(estado.recientes, estado.fecha, morning)

  /** Un toque se guarda al momento; lo escrito, a los 800 ms. */
  const sello = () => ({ version: VERSION, updatedAt: marcaLocal() })
  const guardar = (patch) => acciones.guardarManana({ ...patch, ...sello() })
  const escribir = (patch) => acciones.escribirManana({ ...patch, ...sello() })

  const cambiarEmocion = (patch) => {
    const siguientes = { ...valores, ...patch }
    setValores(siguientes)

    const animo = ANIMO.paraGuardarVarias(siguientes.animos, siguientes.animoPropio)
    const intencion = INTENCION.paraGuardarVarias(
      siguientes.intenciones,
      siguientes.intencionPropia,
    )
    const registro = {
      feelings: animo.valores,
      feelingOther: animo.otro,
      intentions: intencion.valores,
      intentionOther: intencion.otro,
    }

    // Tocar un chip es un toque y se guarda ya. Escribir la palabra propia es
    // escribir, y espera como todo lo demás.
    const tecleando = 'animoPropio' in patch || 'intencionPropia' in patch
    if (tecleando) escribir(registro)
    else guardar(registro)
  }

  const cambiarGratitud = (filas) => {
    setGratitud(filas)
    escribir({ gratitude: textosDe(filas) })
  }

  const cambiarAccion = (texto) => {
    setValores((previos) => ({ ...previos, accion: texto }))
    escribir({ action: texto })
  }

  /**
   * Tocar una idea la deja en el campo y **no la guarda todavía** (§5): hasta
   * que la persona continúe, lo que hay escrito es una propuesta de la app y no
   * algo que alguien haya dicho de sí mismo.
   */
  const elegirIdea = (idea) => setValores((previos) => ({ ...previos, accion: idea }))

  const cambiarReflexion = (texto) => {
    setValores((previos) => ({ ...previos, reflexion: texto }))
    escribir({ reflection: texto })
  }

  /** Lo que hay ahora mismo, mezclando lo guardado con lo que está en pantalla. */
  const entradaActual = () => {
    const animo = ANIMO.paraGuardarVarias(valores.animos, valores.animoPropio)
    const intencion = INTENCION.paraGuardarVarias(valores.intenciones, valores.intencionPropia)
    return {
      ...morning,
      feelings: animo.valores,
      feelingOther: animo.otro,
      intentions: intencion.valores,
      intentionOther: intencion.otro,
      gratitude: textosDe(gratitud),
      action: valores.accion,
      reflection: valores.reflexion,
    }
  }

  const terminar = async () => {
    await acciones.volcar()
    const entrada = entradaActual()
    await guardar({
      action: entrada.action,
      reflection: entrada.reflection,
      gratitude: entrada.gratitude,
      skipped: camposOmitidos(entrada, { conPausa }),
      completedAt: marcaLocal(),
    })
    setVista('cierre')
  }

  const avanzar = () => {
    if (paso < MOMENTOS.length - 1) return setPaso(paso + 1)
    if (paso === MOMENTOS.length - 1 && conPausa) {
      // Aparecer cuenta aunque no se conteste: si solo contáramos las pausas
      // respondidas, quien nunca responde la vería todas las mañanas.
      if (!morning?.reflectionId) guardar({ reflectionId: pregunta.id })
      return setPaso(PASO_PAUSA)
    }
    return terminar()
  }

  if (vista === 'cierre') {
    return (
      <AperturaDelDia
        lineas={lineasDeCierre(entradaActual(), estado.genero)}
        onTerminar={() => setVista('resumen')}
      />
    )
  }

  if (vista === 'resumen') {
    return (
      <div ref={marco}>
        <ResumenManana
          bloques={resumenDeManana(morning, estado.genero)}
          onEditar={() => {
            setPaso(0)
            setVista('recorrido')
          }}
        />
      </div>
    )
  }

  // Las ideas de abajo siguen **la primera** intención elegida, no las tres:
  // son ideas para empezar, no una lista que se reparta entre ellas. Se elige
  // la primera porque se eligió primero, no porque sea la más importante — la
  // app no ordena por importancia lo que alguien nombró.
  const [primeraIntencion = null] = valores.intenciones
  const anteriores = ideasAnteriores(estado.recientes, primeraIntencion, estado.fecha)
  const enPausa = paso === PASO_PAUSA
  const esUltimo = enPausa || (paso === MOMENTOS.length - 1 && !conPausa)

  return (
    <div ref={marco} className="flex flex-col gap-8 scroll-mt-4">
      {!enPausa && <IndicadorPasos textos={PASOS} indice={paso} total={MOMENTOS.length} />}

      {paso === 0 && (
        <MomentoAnimo valores={valores} genero={estado.genero} onCambiar={cambiarEmocion} />
      )}

      {paso === 1 && (
        <MomentoGratitud
          filas={gratitud}
          onCambiar={cambiarGratitud}
          onVolcar={acciones.volcar}
          onOmitir={avanzar}
        />
      )}

      {paso === 2 && (
        <MomentoIntencionAccion
          valores={valores}
          genero={estado.genero}
          anteriores={anteriores}
          generales={ideasGenerales(primeraIntencion, anteriores)}
          onCambiar={cambiarEmocion}
          onCambiarAccion={cambiarAccion}
          onElegirIdea={elegirIdea}
          onVolcar={acciones.volcar}
        />
      )}

      {enPausa && (
        <MomentoPausa
          pregunta={pregunta}
          valor={valores.reflexion}
          onCambiar={cambiarReflexion}
          onVolcar={acciones.volcar}
          onOmitir={terminar}
        />
      )}

      <NavegacionPasos
        textos={PASOS}
        hayAtras={paso > 0}
        esUltimo={esUltimo}
        onAtras={() => setPaso(enPausa ? MOMENTOS.length - 1 : paso - 1)}
        onSiguiente={avanzar}
      />
    </div>
  )
}
