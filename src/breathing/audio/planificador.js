// src/breathing/audio/planificador.js
// El reloj que programa los eventos aleatorios del ambiente (RN-RE-SND-06).
//
// **`setTimeout` no tiene precisión de audio y no puede disparar un sonido.**
// El bucle de eventos del navegador se retrasa decenas de milisegundos cuando la
// pestaña tiene trabajo, y una gota de lluvia que llega tarde no se oye tarde:
// se oye mal. Lo que sí puede hacer un temporizador es **despertar cada poco
// para programar por adelantado**, y eso es esto: cada 50 ms mira los próximos
// 200 ms de `ctx.currentTime` y deja programado todo lo que caiga ahí. El
// disparo lo hace después el reloj de audio, que sí es exacto.
//
// No está en la lista de archivos de §7 y es una pieza añadida a propósito: las
// cinco fuentes necesitan exactamente este bucle, y cinco copias serían cinco
// sitios donde RN-RE-SND-06 se puede romper sin que nadie lo note.

export const MS_LOOKAHEAD = 200
export const MS_TIC = 50

/** Tope de eventos por tic. Un intervalo de cero colgaría el bucle sin él. */
const TOPE_POR_TIC = 64

/**
 * @param {AudioContext} ctx
 * @param {object} opciones
 * @param {() => number} opciones.siguienteIntervalo - Segundos hasta el próximo. Puro.
 * @param {(instante: number) => void} opciones.disparar - Programa el sonido en `instante`.
 * @param {?Function} [opciones.alTic] - Se llama en cada vuelta, haya evento o no.
 * @returns {{iniciar: Function, detener: Function, tic: Function}}
 */
export function crearPlanificador(
  ctx,
  { siguienteIntervalo, disparar, alTic = null, msLookahead = MS_LOOKAHEAD, msTic = MS_TIC },
) {
  let temporizador = null
  let proximo = 0
  let corriendo = false

  /** Programa todo lo que caiga dentro de la ventana de anticipación. */
  function tic() {
    if (!corriendo) return
    // Antes de programar nada, se recoge lo que ya terminó. Va en cada tic y no
    // solo cuando toca un evento: con intervalos largos —una campana cada siete
    // segundos— la siega llegaría muy de tarde en tarde y el número de nodos
    // vivos dependería de cuándo se mire.
    alTic?.()
    const limite = ctx.currentTime + msLookahead / 1000
    let programados = 0
    while (proximo < limite && programados < TOPE_POR_TIC) {
      // Nunca en el pasado: si la pestaña estuvo dormida, `proximo` puede haber
      // quedado atrás y programar ahí sería pedirle al contexto un instante que
      // ya pasó. Se recoloca en el presente y sigue.
      disparar(Math.max(proximo, ctx.currentTime))
      proximo = Math.max(proximo, ctx.currentTime) + siguienteIntervalo()
      programados += 1
    }
  }

  return {
    iniciar() {
      if (corriendo) return
      corriendo = true
      proximo = ctx.currentTime + siguienteIntervalo()
      tic()
      temporizador = setInterval(tic, msTic)
    },

    detener() {
      corriendo = false
      if (temporizador !== null) clearInterval(temporizador)
      temporizador = null
    },

    /** Solo para pruebas: adelantar el bucle sin esperar al temporizador. */
    tic,
  }
}

/**
 * Un intervalo aleatorio entre dos límites, en segundos.
 *
 * **Aleatorio no es un capricho: es RN-RE-SND-07.** Un ambiente con un pulso
 * regular perceptible compite con el ritmo de la respiración, y quien está
 * siguiendo una guía de cinco segundos no necesita un segundo metrónomo
 * discutiéndole el compás por debajo.
 */
export function intervaloAleatorio(msMin, msMax, azar = Math.random) {
  return (msMin + azar() * (msMax - msMin)) / 1000
}

/** Un número aleatorio entre dos límites. Para ganancias, alturas y paneos. */
export function entre(min, max, azar = Math.random) {
  return min + azar() * (max - min)
}

/** Uno de la lista, al azar. Para las alturas de la escala pentatónica. */
export function unoDe(lista, azar = Math.random) {
  return lista[Math.min(lista.length - 1, Math.floor(azar() * lista.length))]
}

/**
 * El retardo que hay que dar a un oscilador para que arranque con un desfase.
 *
 * Web Audio no deja fijar la fase de un oscilador, solo cuándo empieza. Como la
 * onda es periódica, adelantar `radianes` equivale a retrasar lo que falta para
 * completar la vuelta, y eso sí se puede pedir.
 */
export function retardoDeFase(radianes, hz) {
  if (!Number.isFinite(hz) || hz <= 0) return 0
  const periodo = 1 / hz
  const fraccion = (((radianes % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI)
  return periodo * (1 - fraccion)
}

/**
 * El registro de las voces efímeras —gotas, chispas, campanas— y su siega.
 *
 * Cada voz se apunta con el instante en que deja de sonar. **La siega no depende
 * de `onended`**, y esa es toda su razón de ser: `onended` es el camino normal y
 * el más rápido, pero es un evento del navegador, y colgar de un solo evento la
 * única garantía de que no se acumulan nodos deja el ambiente a merced de que
 * ese evento llegue siempre. Una sesión de una hora son miles de gotas; si un
 * uno por ciento no avisara, al final habría decenas de nodos vivos. El síntoma
 * no sería un error, sería un teléfono caliente.
 *
 * Desconectar dos veces no hace daño, así que los dos caminos conviven.
 */
export function crearVoces(ctx) {
  const voces = new Set()

  function soltar(voz) {
    voz.nodos.forEach((nodo) => nodo.disconnect?.())
    voces.delete(voz)
  }

  return {
    /** Apunta una voz que dejará de sonar en `hasta`. */
    anadir(nodos, hasta) {
      const voz = { nodos, hasta }
      voces.add(voz)
      return voz
    },

    /** Suelta las que ya terminaron. Se llama en cada tic del planificador. */
    segar() {
      voces.forEach((voz) => {
        if (voz.hasta <= ctx.currentTime) soltar(voz)
      })
    },

    soltar,

    /** Suelta todas, hayan terminado o no. */
    vaciar() {
      voces.forEach((voz) => {
        voz.nodos.forEach((nodo) => {
          try {
            nodo.stop?.()
          } catch {
            // Ya se había detenido sola.
          }
          nodo.disconnect?.()
        })
      })
      voces.clear()
    },

    /** Cuántas siguen sonando. Lo miran las pruebas de fuga. */
    tamano() {
      return voces.size
    },
  }
}
