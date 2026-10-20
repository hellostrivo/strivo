// src/breathing/lib/geometriaLinea.js
// La matemática de la bolita sobre línea (SPEC_14 §4). Pura y sin DOM.
//
// Es la visual que muestra **lo que viene** y no solo lo que pasa ahora: un
// círculo que se expande dice "ahora inhala"; la línea dice "ahora inhalas, y
// en cuatro segundos vas a sostener". Esa anticipación es todo su valor, y por
// eso la bolita va al 38 % del ancho y no al centro — se ve más futuro que
// pasado, porque del pasado no hay nada que anticipar.
//
// **La onda se desplaza; la bolita solo sube y baja.** La forma de la onda no
// cambia entre frames: es periódica. Así que se muestrea una vez, se memoiza
// (RN-RE-VIS-31) y por frame solo se mueve un `translateX` (RN-RE-VIS-32).

import { duracionCiclo, fasesDelCiclo, resolverEstado } from '@lib/respiracion/motorRitmo'

/** viewBox de §4.6. Panorámica 19:10: refuerza la lectura de izquierda a derecha. */
export const VIEWBOX = Object.freeze({ ancho: 380, alto: 200 })

/** §4.1 — Más futuro que pasado. */
export const POSICION_BOLITA = 0.38

/** §4.2 — Deja aire arriba y abajo para las etiquetas de fase. */
export const FRACCION_ALTO_UTIL = 0.62

/** §4.2 — Un punto cada 40 ms: barato y ya suave antes de curvar. */
export const MS_MUESTREO = 40

/** §4.2 — Siempre al menos dos ciclos, y nunca menos de 20 s. */
export const MS_VENTANA_MINIMA = 20000

/** §4.5 — Por debajo de 8 s de ciclo las etiquetas se apiñan (RN-RE-VIS-15). */
export const MS_CICLO_MINIMO_ETIQUETAS = 8000

export const VISTA_POR_DEFECTO = Object.freeze({
  ancho: VIEWBOX.ancho,
  alto: VIEWBOX.alto,
  posicionBolita: POSICION_BOLITA,
})

/** La ventana de tiempo visible, en milisegundos. */
export function msVentanaDe(patron) {
  return Math.max(duracionCiclo(patron) * 2, MS_VENTANA_MINIMA)
}

/**
 * Amplitud → Y, con el origen arriba como en SVG.
 *
 * Amplitud 1 (lleno) es el punto más alto: es la única lectura que coincide con
 * lo que hace el pecho, y una onda invertida se lee al revés sin que nadie sepa
 * explicar por qué le incomoda.
 */
export function yDeAmplitud(amplitud, alto = VIEWBOX.alto) {
  const a = Number.isFinite(Number(amplitud)) ? Math.min(1, Math.max(0, Number(amplitud))) : 0
  const util = alto * FRACCION_ALTO_UTIL
  const margen = (alto - util) / 2
  return margen + (1 - a) * util
}

// ─── Muestreo memoizado ───────────────────────────────────────────────────────

const memoria = new Map()
const TOPE_MEMORIA = 8

/** Solo la usan las pruebas, para medir que la memoización existe de verdad. */
export function limpiarMemoria() {
  memoria.clear()
}

function claveDe(patron, vista) {
  const { inhalar, retenerLleno, exhalar, retenerVacio } = patron ?? {}
  return [
    inhalar,
    retenerLleno,
    exhalar,
    retenerVacio,
    vista.ancho,
    vista.alto,
    vista.posicionBolita,
  ].join(':')
}

function vistaCompleta(vista) {
  return { ...VISTA_POR_DEFECTO, ...(vista ?? {}) }
}

/**
 * Muestrea la onda una vez y devuelve el trazo, los puntos y las marcas.
 *
 * RN-RE-VIS-31 — Esto es lo que **no** se recalcula por frame. Mil puntos por
 * fotograma sesenta veces por segundo es el error que hace que una animación
 * de calma se sienta entrecortada, que es exactamente lo contrario del encargo.
 *
 * @returns {{d: string, puntos: {x: number, y: number}[],
 *            marcasFase: {x: number, ms: number, fase: string}[],
 *            pxPorMs: number, msVentana: number, msCiclo: number,
 *            msInicio: number, etiquetasVisibles: boolean}}
 */
export function muestrearOnda(patron, vista = VISTA_POR_DEFECTO) {
  const v = vistaCompleta(vista)
  const clave = claveDe(patron, v)
  if (memoria.has(clave)) return memoria.get(clave)

  const msCiclo = duracionCiclo(patron)
  const msVentana = msVentanaDe(patron)
  const pxPorMs = v.ancho / msVentana

  // Un patrón sin ninguna fase no tiene onda. Se devuelve una recta en reposo
  // en vez de dividir entre cero: nada bloquea, igual que en el motor.
  if (msCiclo <= 0) {
    const y = yDeAmplitud(0, v.alto)
    const vacio = {
      d: `M 0 ${y} L ${v.ancho} ${y}`,
      puntos: [
        { x: 0, y },
        { x: v.ancho, y },
      ],
      marcasFase: [],
      pxPorMs,
      msVentana,
      msCiclo: 0,
      msInicio: 0,
      etiquetasVisibles: false,
    }
    guardar(clave, vacio)
    return vacio
  }

  // El tramo que hay que tener dibujado para que, con cualquier desplazamiento
  // dentro de un ciclo, la ventana visible quede siempre cubierta. Hacia atrás
  // llega lo que ocupa el pasado de la bolita; hacia delante, la ventana entera
  // más un ciclo de carrerilla.
  const msInicio = -v.posicionBolita * msVentana
  const msFin = msVentana + msCiclo

  const puntos = []
  for (let ms = msInicio; ms <= msFin; ms += MS_MUESTREO) {
    puntos.push({
      x: (ms - msInicio) * pxPorMs,
      y: yDeAmplitud(amplitudCiclica(patron, ms, msCiclo), v.alto),
    })
  }

  const resultado = {
    d: trazoSuave(puntos),
    puntos,
    marcasFase: marcasDe(patron, msInicio, msFin, msCiclo, pxPorMs),
    pxPorMs,
    msVentana,
    msCiclo,
    msInicio,
    etiquetasVisibles: msCiclo >= MS_CICLO_MINIMO_ETIQUETAS,
  }

  guardar(clave, resultado)
  return resultado
}

function guardar(clave, valor) {
  if (memoria.size >= TOPE_MEMORIA) memoria.delete(memoria.keys().next().value)
  memoria.set(clave, valor)
}

/**
 * La amplitud en un instante, envolviendo los tiempos negativos.
 *
 * El motor recorta los milisegundos a cero porque una sesión no empieza antes
 * de empezar. Aquí sí hay tiempo negativo: es el pasado que la onda enseña a la
 * izquierda de la bolita. Como la onda es periódica, se resuelve dentro del
 * ciclo equivalente.
 */
function amplitudCiclica(patron, ms, msCiclo) {
  const dentro = ((ms % msCiclo) + msCiclo) % msCiclo
  return resolverEstado(patron, dentro).amplitud
}

function marcasDe(patron, msInicio, msFin, msCiclo, pxPorMs) {
  const tramos = fasesDelCiclo(patron)
  const marcas = []
  const primero = Math.floor(msInicio / msCiclo)
  const ultimo = Math.ceil(msFin / msCiclo)

  for (let ciclo = primero; ciclo <= ultimo; ciclo += 1) {
    for (const tramo of tramos) {
      const ms = ciclo * msCiclo + tramo.msInicio
      if (ms < msInicio || ms > msFin) continue
      marcas.push({ x: (ms - msInicio) * pxPorMs, ms, fase: tramo.fase })
    }
  }
  return marcas
}

// ─── Trazo ────────────────────────────────────────────────────────────────────

/**
 * Une los puntos con cuadráticas que pasan por los puntos medios.
 *
 * Con segmentos rectos la onda se ve digital; el aire no tiene esquinas. Y este
 * esquema tiene una propiedad que hacía falta: sobre un tramo de puntos con la
 * misma Y, los controles y los puntos medios comparten esa Y, así que la curva
 * sale **exactamente plana** (RN-RE-VIS-10). Una meseta que ondula estaría
 * diciendo "sigue moviéndote" justo donde la instrucción es sostener.
 */
export function trazoSuave(puntos) {
  if (puntos.length === 0) return ''
  if (puntos.length === 1) return `M ${redondear(puntos[0].x)} ${redondear(puntos[0].y)}`

  let d = `M ${redondear(puntos[0].x)} ${redondear(puntos[0].y)}`
  for (let i = 1; i < puntos.length - 1; i += 1) {
    const medio = puntoMedio(puntos[i], puntos[i + 1])
    d += ` Q ${redondear(puntos[i].x)} ${redondear(puntos[i].y)} ${redondear(medio.x)} ${redondear(medio.y)}`
  }
  const fin = puntos[puntos.length - 1]
  d += ` L ${redondear(fin.x)} ${redondear(fin.y)}`
  return d
}

function puntoMedio(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Tres decimales: por debajo no se ve y el path pesa el doble. */
function redondear(n) {
  return Math.round(n * 1000) / 1000
}

/**
 * La Y que el trazo dibuja de verdad en una X dada.
 *
 * Existe para poder comprobar el criterio 8 —que la bolita se apoya sobre la
 * curva y no cerca de ella— sin renderizar nada. Como el muestreo es uniforme
 * en el tiempo y X es lineal en el tiempo, la X de cada cuadrática también es
 * lineal en su parámetro, así que despejarla es una división y no una raíz.
 */
export function yDelTrazoEnX(puntos, x) {
  if (puntos.length < 2) return puntos[0]?.y ?? 0

  let desde = puntos[0]
  for (let i = 1; i < puntos.length - 1; i += 1) {
    const control = puntos[i]
    const hasta = puntoMedio(puntos[i], puntos[i + 1])
    if (x <= hasta.x || i === puntos.length - 2) {
      const span = hasta.x - desde.x
      const t = span === 0 ? 0 : Math.min(1, Math.max(0, (x - desde.x) / span))
      const u = 1 - t
      return u * u * desde.y + 2 * u * t * control.y + t * t * hasta.y
    }
    desde = hasta
  }
  return puntos[puntos.length - 1].y
}

/**
 * Los milisegundos absolutos que representa un estado del motor.
 *
 * La línea necesita saber en qué punto de la sesión está para desplazar la onda,
 * y `resolverEstado` no devuelve el instante: devuelve dónde cae. Se reconstruye
 * desde el ciclo y el progreso de la fase en vez de pedirle a quien monta que
 * pase un dato más, porque RN-RE-VIS-01 fija las props de una visual en cuatro y
 * añadir una quinta abre la puerta a las demás.
 */
export function msDeEstado(patron, estado) {
  if (!estado) return 0
  const tramo = fasesDelCiclo(patron).find((t) => t.fase === estado.fase)
  if (!tramo) return 0
  const ciclo = Math.max(1, Number(estado.cicloActual) || 1)
  const dentro = tramo.msInicio + (Number(estado.progresoFase) || 0) * tramo.ms
  return (ciclo - 1) * duracionCiclo(patron) + dentro
}

// ─── Lo que cambia por frame ──────────────────────────────────────────────────

/**
 * La onda completa en un instante.
 *
 * El muestreo sale de la memoria; lo único que se calcula aquí es el
 * desplazamiento y la bolita. **La Y de la bolita se toma de la amplitud del
 * motor, no del trazo** (RN-RE-VIS-09): si se leyera del path, el trazo y la
 * bolita tendrían dos fuentes de verdad y acabarían separándose.
 */
export function generarOnda(patron, msActuales, vista = VISTA_POR_DEFECTO) {
  const v = vistaCompleta(vista)
  const muestreo = muestrearOnda(patron, v)
  const ms = Math.max(0, Number(msActuales) || 0)
  const estado = resolverEstado(patron, ms)

  const dentro = muestreo.msCiclo > 0 ? ms % muestreo.msCiclo : 0
  const desplazamiento = -dentro * muestreo.pxPorMs
  const xBolita = v.ancho * v.posicionBolita

  return {
    ...muestreo,
    desplazamiento,
    fase: estado.fase,
    puntoBolita: { x: xBolita, y: yDeAmplitud(estado.amplitud, v.alto) },
    // §4.5 — Solo las marcas del futuro llevan texto (RN-RE-VIS-14). Que una
    // marca sea futura cambia justo al pasar bajo la bolita, y eso ocurre en el
    // cambio de fase: el único momento en que React vuelve a pintar.
    marcasFase: muestreo.marcasFase.map((marca) => ({
      ...marca,
      futura: marca.x + desplazamiento > xBolita,
    })),
  }
}

/**
 * §7 — La variante de movimiento reducido: **la onda no se mueve.**
 *
 * Se dibuja un ciclo entero, quieto, y un marcador vertical lo recorre a saltos
 * de un segundo. La información es la misma —dónde estás y qué viene— sin
 * desplazamiento continuo, que es lo que la preferencia pide evitar.
 */
export function generarOndaEstatica(patron, msActuales, vista = VISTA_POR_DEFECTO) {
  const v = vistaCompleta(vista)
  const msCiclo = duracionCiclo(patron)
  const ms = Math.max(0, Number(msActuales) || 0)

  if (msCiclo <= 0) {
    const y = yDeAmplitud(0, v.alto)
    return {
      d: `M 0 ${y} L ${v.ancho} ${y}`,
      puntos: [
        { x: 0, y },
        { x: v.ancho, y },
      ],
      marcasFase: [],
      marcador: { x: 0, y },
      fase: 'retenerVacio',
      msCiclo: 0,
      etiquetasVisibles: false,
    }
  }

  const pxPorMs = v.ancho / msCiclo
  const puntos = []
  for (let t = 0; t <= msCiclo; t += MS_MUESTREO) {
    puntos.push({ x: t * pxPorMs, y: yDeAmplitud(resolverEstado(patron, t).amplitud, v.alto) })
  }

  const dentro = ms % msCiclo
  // El salto de un segundo (RN-RE-VIS-20): el marcador solo se mueve una vez
  // por segundo, así que el DOM se toca una vez por segundo y no sesenta.
  const congelado = Math.min(msCiclo, Math.floor(dentro / 1000) * 1000)
  const estado = resolverEstado(patron, congelado)

  return {
    d: trazoSuave(puntos),
    puntos,
    marcasFase: fasesDelCiclo(patron).map((tramo) => ({
      x: tramo.msInicio * pxPorMs,
      ms: tramo.msInicio,
      fase: tramo.fase,
      futura: tramo.msInicio > congelado,
    })),
    marcador: { x: congelado * pxPorMs, y: yDeAmplitud(estado.amplitud, v.alto) },
    fase: estado.fase,
    msCiclo,
    etiquetasVisibles: msCiclo >= MS_CICLO_MINIMO_ETIQUETAS,
  }
}
