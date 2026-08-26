// src/components/shared/TransicionLuz.jsx
// La transición de entrada: luz tenue y una frase (§C7.5).
//
// **Un umbral, no una secuencia.** Al disolverse el Ritual de Mañana, el pop-up
// se llevó tres cosas —umbral, orden y cierre— y de las tres solo se recupera
// la primera. Esta pieza es el umbral y nada más: sin pasos, sin preguntas, sin
// botón de continuar.
//
// **RN-LU-MAN-02 es una regla sobre lo que NO se le puede añadir.** Cada cosa
// que entre aquí —un segundo fotograma, un "seguir", una elección— la acerca al
// wizard del Anexo E, que es exactamente lo que la división vino a eliminar. Si
// alguien se ve añadiendo algo a este archivo, conviene releer el Anexo E antes.
//
// **Es la misma pieza en los dos sitios** (RN-LU-MAN-01): la entrada a la app y
// la entrada a la mañana. Si acaba habiendo dos variantes, la segunda ya es
// algo específico de Mañana y el wizard ha empezado a volver.
//
// **RN-LU-MAN-03 — Aquí no hay respiración.** La respiración diaria es
// voluntaria (RN-LU-RESP-01) y no se dispara con esto. Este archivo no la
// menciona y no la importa.
//
// Vive en `components/shared/` y no fija ni un color: el tono del velo y de la
// luz los pone el tema desde `globals.css`, así que la misma pieza sirve sobre
// el crema de la mañana y sobre el índigo de la noche sin saberlo (RN-TEC-05).
//
// **`conFrase` y `conVideo` no son dos variantes**, son la misma pieza con otro
// contenido dentro. La frase es contenido —el repertorio de apertura de §C7.5—
// y el video de apertura también, así que quien monte el umbral con uno o con
// otro sigue teniendo el mismo umbral: velo, saltable por toda su superficie y
// sin nada que decidir.
//
// ─── El video de apertura (25 de agosto de 2026) ─────────────────────────────
//
// **Al abrir la app, el umbral es el video de marca; al aparecer la mañana,
// sigue siendo la frase.** Son los dos únicos montajes que hay y no se pisan:
// el video es la apertura del producto y solo se ve una vez por sesión.
//
// **Quién decide que se acabó.** Con frase manda el temporizador de cinco
// segundos. Con video manda el propio video —`onEnded`—, y el temporizador pasa
// a ser la red de seguridad: se arma igual al montar y el video lo desactiva en
// cuanto **confirma que está reproduciendo** (`onPlaying`). Si el autoplay se
// bloquea, `onPlaying` no llega, el temporizador no se desactiva y el umbral se
// comporta exactamente como el de siempre. Nadie se queda delante de un velo.
// Es también por lo que el temporizador no se ajusta a la duración del video:
// no tiene que saberla.
//
// **`muted`, `playsInline` y `autoPlay` son los tres requisitos del autoplay en
// iOS**, y por eso van los tres. `muted` se repite además sobre el nodo, en el
// efecto: React no siempre lo escribe como atributo, y sin él Safari rechaza la
// reproducción. La llamada a `play()` es explícita por lo mismo, y su rechazo se
// traga —si no arranca, ya hay red de seguridad—. **Sin `loop`**: se reproduce
// una vez y se acabó. Y sin sonido, que es lo que la app es por defecto.
//
// ─── La despedida del video (26 de agosto de 2026) ──────────────────────────
//
// **Un video que se acaba y un velo que desaparece en el mismo fotograma es un
// corte, no un umbral.** Hasta ahora `onEnded` desmontaba la pieza entera, así
// que la primera pantalla de detrás aparecía de golpe en cuanto el último
// fotograma dejaba de pintarse. Se sale igual, pero en tres tiempos y sin nada
// que tocar:
//
// 1. El video llega a su final y se queda quieto en su último fotograma.
// 2. Ese fotograma se desvanece sobre el velo —que es liso y del mismo tono que
//    el fondo del propio video—, y el velo se queda solo un instante.
// 3. El velo se retira, y lo que va apareciendo debajo es lo que ya estaba
//    montado: la app, o el primer paso del recorrido de entrada.
//
// **No es una secuencia y no le añade nada a RN-LU-MAN-02**: no hay un segundo
// fotograma que enseñar, no hay nada que decidir y no hay botón que buscar. Es
// la misma salida de siempre, contada más despacio.
//
// **Solo se despide el video que llegó a su final por su cuenta**, y quien lo
// sabe es el propio nodo (`ended`). Un toque, un error de reproducción o la red
// de seguridad salen al instante: quien toca está diciendo que ya, y a un video
// que no llegó a verse no hay nada que despedirle.
//
// La frase no pasa por aquí: se va con su propia curva —`transicion-entrada`
// baja a cero al final de sus cinco segundos— y ese desvanecido ya existía.
//
// **Con `prefers-reduced-motion` no se reproduce**: en su sitio va el logo
// quieto. En la práctica esa rama no se monta desde `App`, que con esa
// preferencia entra directo a Hoy sin umbral (RN-VIS-05); está aquí porque la
// pieza no debe depender de que quien la monte se acuerde de preguntar.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { fraseDeApertura } from '@/content/frases-apertura'
import Simbolo from '@components/shared/Simbolo'
import apertura from '@/assets/marca/strivo_apertura.mp4'

/** §C7.5 — Duración calmada, la misma de P1. */
export const DURACION = 5000

/**
 * Lo que tarda el último fotograma en irse y lo que tarda el velo en retirarse
 * detrás de él (26 ago 2026). Dentro del rango de movimiento del proyecto
 * —120 ms mínimo, 900 ms máximo— y en su mitad lenta, que es donde vive todo lo
 * que abre y todo lo que cierra.
 *
 * **Las dos cifras se repiten en `globals.css`**, que es donde vive la curva, y
 * hay una prueba que compara las dos parejas: si alguien cambia una y no la
 * otra, el velo se retiraría antes o después de que la animación termine.
 */
export const DESPEDIDA = 840
export const RETIRADA = 560

/**
 * Los tres tiempos de la salida con video. **No son estados de una secuencia**:
 * nadie los avanza, no hay nada que responder en ninguno y el umbral se sigue
 * saltando entero con un toque. Son la misma salida, contada despacio.
 */
const FASES = Object.freeze({
  video: 'video',
  despedida: 'despedida',
  salida: 'salida',
})

/**
 * El logo quieto, cuando el video no se reproduce. **Medido contra la pantalla
 * y no en píxeles**, por el mismo motivo que el video de al lado: aquí no se
 * sabe si esto se abre en un teléfono, en un iPad o en un portátil. Se toma el
 * menor de los dos ejes para que sea el lado corto el que mande, que es el que
 * se queda sin sitio primero.
 */
const ALTO_LOGO = 'min(40vh, 36vw)'

/** ¿Está activada la preferencia del sistema? Se consulta, no se asume. */
export function prefiereMenosMovimiento() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function TransicionLuz({ onTerminar, conFrase = true, conVideo = false }) {
  // Se pregunta una vez, al montar: si la preferencia cambiara a mitad del
  // umbral, cambiar de contenido debajo de alguien sería peor que ignorarlo.
  const [quieto] = useState(prefiereMenosMovimiento)

  // La frase se elige una sola vez, al montar: recalcularla en cada render la
  // haría cambiar a mitad de los cinco segundos. Sin frase no se saca ninguna
  // del bombo: gastarla sin enseñarla dejaría un hueco en el repertorio.
  const [frase] = useState(function elegir() {
    if (conFrase && !conVideo) return fraseDeApertura()
    return null
  })
  // En qué tiempo de la salida está el umbral con video. Nace en el primero y
  // solo avanza cuando el video llega a su final por su cuenta.
  const [fase, setFase] = useState(FASES.video)

  const temporizador = useRef(null)
  const terminado = useRef(false)
  const reproductor = useRef(null)
  const relevo = useRef(null)

  // Irse es idempotente: el toque, el video y el temporizador llegan al mismo
  // sitio y el primero que llegue apaga a los otros.
  const salir = () => {
    if (terminado.current) return
    terminado.current = true
    clearTimeout(temporizador.current)
    clearTimeout(relevo.current)
    onTerminar()
  }

  // La salida del umbral, y **la única puerta**: la tocan el toque, el final del
  // video, el error de reproducción y la red de seguridad.
  //
  // Se despide despacio en un solo caso —el video llegó a su final por su
  // cuenta, y quien lo sabe es el propio nodo—; en los demás se sale al
  // instante. Un toque es alguien diciendo que ya, y a un video que no llegó a
  // verse no hay nada que despedirle.
  const terminar = () => {
    if (terminado.current) return
    clearTimeout(temporizador.current)
    const nodo = reproductor.current
    if (nodo && nodo.ended && fase === FASES.video) {
      setFase(FASES.despedida)
      return
    }
    salir()
  }

  // El video ya está en marcha: desde aquí manda él, y `onEnded` es quien
  // cierra. La red de seguridad se retira porque ya no hace falta.
  const sostener = () => {
    clearTimeout(temporizador.current)
  }

  useEffect(() => {
    temporizador.current = setTimeout(terminar, DURACION)
    return () => clearTimeout(temporizador.current)
    // Sin dependencias a propósito: se monta una vez y se va. Una dependencia
    // aquí reiniciaría la cuenta a mitad y dejaría a alguien esperando diez
    // segundos delante de un umbral de cinco.
  }, [])

  // Los dos relevos de la despedida. Van con reloj y no con `animationend`
  // porque el reloj es el mismo con o sin animación: con "reducir movimiento"
  // las curvas duran 0,01 ms y aquí no se monta ningún video, así que este
  // efecto no llega a correr.
  useEffect(() => {
    if (fase === FASES.despedida) {
      relevo.current = setTimeout(() => setFase(FASES.salida), DESPEDIDA)
    }
    if (fase === FASES.salida) {
      relevo.current = setTimeout(salir, RETIRADA)
    }
    return () => clearTimeout(relevo.current)
  }, [fase])

  useEffect(() => {
    const nodo = reproductor.current
    if (!nodo) return
    // Los dos requisitos de iOS que React puede no dejar puestos por su cuenta.
    nodo.muted = true
    const arranque = nodo.play()
    // Si el navegador lo rechaza no hay nada que hacer ni nada que contar: la
    // red de seguridad cierra el umbral a su hora (RN-EST-05).
    if (arranque && arranque.catch) arranque.catch(() => {})
  }, [])

  const videoEnMarcha = conVideo && !quieto

  // **El velo del video no se anima: es opaco desde el primer fotograma.** El
  // de la frase sí entra y sale con el reloj, porque ahí el velo se lava por
  // encima de una pantalla en la que ya se está. Al abrir la app no: lo que hay
  // detrás todavía no es de nadie y no debe verse ni un instante, así que lo que
  // aparece despacio es el fotograma —`transicion-entrada-video` va sobre el
  // `<video>`— y no la superficie que lo sostiene.
  //
  // Sin ternario a propósito: este archivo no admite un signo de interrogación
  // ni en el código, y hay una prueba que lo comprueba.
  let velo = 'transicion-entrada'
  if (videoEnMarcha) velo = ''
  // Y en el último tiempo el velo se retira, que es lo que deja aparecer lo que
  // ya estaba montado detrás. Va después de las dos de arriba porque manda
  // sobre las dos: la frase no llega aquí y el video ya se fue.
  if (fase === FASES.salida) velo = 'transicion-salida-velo'

  let contenido = null
  if (videoEnMarcha) {
    contenido = (
      // **La despedida va en la capa, no en el `<video>`.** El fotograma ya
      // tiene su propia curva de entrada, y dos animaciones en el mismo
      // elemento se resuelven por el orden del CSS, que es de las cosas que
      // envejecen mal. Una capa alrededor no tiene esa discusión.
      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-0',
          // Desde que empieza a irse ya no vuelve: sin esto, al pasar al último
          // tiempo la clase se retiraría, con ella la curva, y el fotograma
          // reaparecería entero justo debajo del velo que se está yendo.
          fase !== FASES.video && 'transicion-salida-logo',
        )}
      >
        <video
          ref={reproductor}
          src={apertura}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlaying={sostener}
          onEnded={terminar}
          onError={terminar}
          // **`object-contain` y no `object-cover`.** El video es vertical
          // —1080×1920— y `cover` lo amplía hasta tapar el hueco: en una ventana
          // de portátil de 1440×900 eso son 1440×2560, casi el triple de alto que
          // la pantalla, con 1660 px recortados y todo lo de dentro enorme.
          // `contain` hace lo contrario: mete el fotograma entero dentro de la
          // pantalla, centrado y sin recortar, sea cual sea. Lo que sobra a los
          // lados lo llena el velo, que ya está detrás.
          className="transicion-entrada-video pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
      </span>
    )
  } else if (conVideo) {
    contenido = <Simbolo marca="strivo" alto={ALTO_LOGO} />
  } else if (frase) {
    contenido = (
      <p className="relative font-display text-lg text-on-surface leading-snug">{frase.texto}</p>
    )
  }

  return (
    // Toda la superficie salta la transición: no hay que buscar un botón, y
    // `button` en vez de `div` para que también se pueda con teclado (criterio 3).
    <button
      type="button"
      onClick={terminar}
      aria-label={copy.shared.transicion.saltar}
      className={`velo-transicion ${velo} fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-8 text-center`}
    >
      {/* Detrás del video no se ve, y debajo del logo quieto sí: es la misma
          luz del umbral de siempre, así que solo se retira cuando el video la
          tapa entera. */}
      {!videoEnMarcha && (
        <span
          aria-hidden="true"
          className="luz-transicion pointer-events-none absolute h-72 w-72 rounded-full"
        />
      )}
      {contenido}
    </button>
  )
}
