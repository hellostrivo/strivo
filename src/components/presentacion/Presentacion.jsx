// src/components/presentacion/Presentacion.jsx
// La presentación de las secciones: cuatro tarjetas, una vez, al terminar de
// entrar.
//
// **Es la segunda mitad de la entrada, no una sección más.** No tiene ruta, no
// la alcanza ningún enlace y no se vuelve a ver: se interpone entre el final
// del onboarding y la primera vez que alguien llega a Hoy, igual que el
// onboarding se interpone antes. Por eso RN-NAV-01 sigue en pie con sus cinco
// destinos: esto no es un sexto, es la puerta.
//
// ─── El marco es el del onboarding, y a propósito ────────────────────────────
//
// Mide la ventana que de verdad se ve (`alto-pantalla`, `100dvh` con respaldo),
// se reparte en franjas y nada de dentro se desplaza. Quien llega aquí acaba de
// recorrer siete pasos con esta misma forma, y cambiarla en la pantalla
// siguiente diría que se ha entrado a otro sitio.
//
// Las tres franjas son las del encargo: "Omitir" arriba, el dibujo en medio
// —que se lleva el hueco que sobra, y es aproximadamente la mitad de arriba— y
// abajo el nombre, la frase, los puntos y el botón. **Nada se desplaza y nada
// se sale**: el dibujo encoge con la ventana en vez de empujar al resto, que es
// lo que `min-h-0` sobre su franja permite.
//
// ─── Cómo se avanza ──────────────────────────────────────────────────────────
//
// Con el botón, con los puntos, y deslizando de lado. **No lo dice ninguna
// pantalla**: una tarjeta que explica cómo pasar a la siguiente ya no es una
// tarjeta breve, y quien no deslice tiene el botón delante. El deslizamiento no
// da la vuelta —detrás de la cuarta no hay una quinta, está la app— así que en
// los extremos no pasa nada.
//
// ─── Salir es salir ──────────────────────────────────────────────────────────
//
// "Omitir" y "Entrar a Strivo" marcan lo mismo: la presentación queda vista.
// Ninguna de las dos pide confirmación y ninguna avisa de lo que se deja atrás
// (RN-EST-08, RN-09). Se espera solo a la escritura local —que es inmediata
// (RN-01)— para que cerrar la app en ese mismo instante no devuelva a nadie
// aquí; lo que tarde la red es cosa de la cola de sync y no de esta puerta.
//
// **Lo que no comparten es cómo se van, y es deliberado.** "Entrar a Strivo" es
// la puerta y se cruza despacio: dos segundos de desvanecido sobre la app, que
// ya está montada detrás. "Omitir" sale al instante, porque omitir es pedir
// paso: hacer esperar dos segundos a quien acaba de decir "ya" convertiría el
// atajo en un peaje, que es justo lo que RN-LU-MAN-02 no admite de un umbral.
//
// **Se desvanece esto, no aparece aquello.** Durante la salida `App` monta las
// secciones debajo y esta pieza pasa a estar fija por encima: cuando termina de
// irse, lo que se ve no aparece —ya estaba ahí—. Es la misma mecánica del
// umbral de entrada, y la razón es la misma: lo que se enciende de golpe es un
// corte, aunque dure lo mismo.
//
// **Solo opacidad.** Ni escala, ni desplazamiento, ni un color que entre por
// encima. Las dos pantallas comparten el degradado del momento, así que no hay
// ningún cambio de tono que hacer: lo único que cambia es que un contenido deja
// sitio al otro.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import { momentoDe } from '@lib/timeSlot'
import Button from '@components/ui/Button'
import { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'

import Puntos from './Puntos'
import { VISUALES } from './Visuales'
import { TARJETAS, TOTAL, enPosicion, esUltima } from '@/presentacion/tarjetas'
import { completarPresentacion } from '@/presentacion/entrada'

const textos = copy.diario.presentacion

/**
 * Cuánto hay que arrastrar para que cuente como deslizar.
 *
 * Cuarenta y ocho píxeles es aproximadamente el ancho de un pulgar: por debajo
 * de eso, lo que hay es un toque que se movió un poco, y pasar de tarjeta ahí
 * se siente como si la pantalla se hubiera ido sola.
 */
const UMBRAL_DESLIZ = 48

/**
 * Lo que tarda la presentación en irse por la puerta grande.
 *
 * Dos segundos, que en este producto no son lentos: el umbral de entrada dura
 * cinco y se despide en otro segundo y medio. La curva vive en `globals.css`
 * (`.salida-presentacion`) y hay una prueba que compara las dos cifras, porque
 * una duración escrita en dos sitios se separa en cuanto alguien cambia una.
 */
const SALIDA = 2000

const titulosPorId = Object.fromEntries(TARJETAS.map((id) => [id, textos[id].titulo]))

export default function Presentacion({ uid, onSaliendo, onTerminado }) {
  const [activa, setActiva] = useState(0)
  const [saliendo, setSaliendo] = useState(false)
  const inicioDelTacto = useRef(null)
  const relojDeSalida = useRef(null)

  // El temporizador de la salida no sobrevive a la pieza: si algo desmonta esto
  // antes de tiempo, lo que no puede quedar en pie es un reloj que abra una
  // puerta que ya no está.
  useEffect(() => () => clearTimeout(relojDeSalida.current), [])

  const momento = momentoDe()
  const superficie = momento === 'noche' ? 'dark' : 'light'

  const id = enPosicion(activa)
  const tarjeta = textos[id]
  const Visual = VISUALES[id]
  const ultima = esUltima(activa)

  const irA = (posicion) => setActiva(TARJETAS.indexOf(enPosicion(posicion)))

  /**
   * Omitir: la marca se escribe y se sale al instante.
   *
   * Quien toca "Omitir" está pidiendo paso, así que se le da. La marca se
   * espera porque es local y tarda lo que tarda un `put` (RN-01).
   */
  const salir = async () => {
    if (saliendo) return
    await completarPresentacion(uid)
    onTerminado()
  }

  /**
   * Entrar a Strivo: la puerta, y se cruza despacio.
   *
   * El orden importa. Primero se avisa de que esto empieza a irse —`App` monta
   * las secciones debajo, así que los dos segundos de desvanecido descubren la
   * app y no un hueco— y solo después se espera a la marca. Con "reducir
   * movimiento" no hay espera: entrar es inmediato (RN-VIS-05).
   */
  const entrar = async () => {
    if (saliendo) return
    setSaliendo(true)
    onSaliendo?.()
    await completarPresentacion(uid)
    if (prefiereMenosMovimiento()) return onTerminado()
    relojDeSalida.current = setTimeout(onTerminado, SALIDA)
  }

  const alEmpezarElTacto = (evento) => {
    inicioDelTacto.current = evento.changedTouches[0]?.clientX ?? null
  }

  const alSoltarElTacto = (evento) => {
    const inicio = inicioDelTacto.current
    inicioDelTacto.current = null
    if (inicio === null) return
    const recorrido = (evento.changedTouches[0]?.clientX ?? inicio) - inicio
    if (Math.abs(recorrido) < UMBRAL_DESLIZ) return
    irA(activa + (recorrido < 0 ? 1 : -1))
  }

  return (
    // El mismo marco del onboarding: mide la ventana, no el documento, y nada
    // de dentro tiene permiso para pasarse de ella (RN-EST-12).
    <div
      data-momento={momento}
      data-surface={superficie}
      className={clsx(
        'alto-pantalla overflow-hidden bg-strivo-base transicion-tema',
        // Mientras sale se despega del flujo y se pone por encima de la app que
        // `App` acaba de montar debajo. Lo que se desvanece es esto entero
        // —fondo incluido—, y por eso el degradado del momento no parpadea: el
        // de detrás es el mismo.
        saliendo ? 'fixed inset-0 z-50 salida-presentacion' : 'relative',
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-strivo" />

      <div
        onTouchStart={alEmpezarElTacto}
        onTouchEnd={alSoltarElTacto}
        className={clsx(
          'relative mx-auto flex h-full w-full max-w-lg flex-col px-5 text-on-surface',
          // Una vez cruzada la puerta no se vuelve: durante el desvanecido no
          // hay nada que tocar, ni una tarjeta a la que volver.
          saliendo && 'pointer-events-none',
        )}
      >
        {/* Arriba y por dentro del área segura: en un teléfono con muesca,
            "Omitir" iría justo debajo de ella. A la derecha porque es la salida
            y no la acción de esta pantalla. */}
        <header className="flex shrink-0 justify-end pt-safe">
          <button
            type="button"
            onClick={salir}
            className={clsx(
              'rounded-full px-4 py-2 min-h-touch-sm text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40',
            )}
          >
            {textos.nav.skip}
          </button>
        </header>

        {/* La franja del dibujo: se lleva todo el hueco que sobra y es la que
            encoge cuando la ventana es corta. `min-h-0` es lo que se lo permite:
            sin él, un lienzo alto estiraría la columna y lo que se saldría por
            abajo sería el botón. */}
        <div className="flex min-h-0 flex-1 items-center justify-center py-4">
          <div
            key={id}
            className="h-full w-full max-w-xs animate-fade-up motion-reduce:animate-none"
          >
            <Visual />
          </div>
        </div>

        {/* El nombre de la sección y su frase. El nombre pesa y mide más —la
            jerarquía es peso y tamaño, nunca una segunda familia— y la frase
            respira debajo. */}
        <section
          key={`${id}-texto`}
          className="shrink-0 animate-fade-up motion-reduce:animate-none"
        >
          <h1 className="font-display text-xl leading-tight">{tarjeta.titulo}</h1>
          <p className="mt-3 text-base leading-relaxed">{tarjeta.frase}</p>
        </section>

        {/* Los puntos y el botón, abajo y siempre a la vista. El hueco de
            arriba es lo que separa la frase del botón: leerlas pegadas
            convertiría la frase en la etiqueta de un control. */}
        <div className="flex shrink-0 flex-col gap-4 pt-10 pb-safe">
          <Puntos
            textos={textos.nav}
            tarjetas={TARJETAS}
            activa={activa}
            titulosPorId={titulosPorId}
            onIr={irA}
          />

          <Button variant="surface" fullWidth onClick={ultima ? entrar : () => irA(activa + 1)}>
            {ultima ? textos.nav.enter : textos.nav.next}
          </Button>
        </div>

        {/* Dónde estás, para quien no ve los puntos. No se pinta en ningún
            sitio: contar tarjetas no es lo que se viene a hacer aquí, y quien
            las recorre de oído sí necesita saber por dónde va. */}
        <p role="status" className="sr-only">
          {interpolate(textos.nav.posicionTemplate, { n: activa + 1, total: TOTAL })}
        </p>
      </div>
    </div>
  )
}
