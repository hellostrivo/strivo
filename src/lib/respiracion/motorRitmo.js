// src/lib/respiracion/motorRitmo.js
// El ritmo de cualquier patrón de respiración. Lógica pura: sin DOM, sin
// timers, sin estado. Dado un patrón y un instante, dice dónde se está.
//
// Vive en `lib/` y no en `breathing/` a propósito (SPEC_13 §4.3): Lumia consume
// este motor para su respiración diaria y `breathing/` no puede ser importado
// desde un espacio. `lib/` es el territorio neutral que ya existía —aquí están
// `constancia.js` y `timeSlot.js`— y es donde vivía `ritmoRespiracion.js`, que
// ahora es un envoltorio sobre este archivo.
//
// **Unidad de patrón: décimas de segundo, enteras.** 5,0 s se guarda como `50`.
// Nada de flotantes: sumar 0,1 cincuenta veces no da 5, y una sesión de veinte
// minutos son miles de sumas. Los milisegundos aparecen solo al resolver.

import { CURVA_POR_DEFECTO, recortar } from './curvas.js'

/** Las cuatro fases, en el único orden en que ocurren. */
export const FASES_EN_ORDEN = Object.freeze(['inhalar', 'retenerLleno', 'exhalar', 'retenerVacio'])

/** Las dos que mueven aire. No pueden valer 0 (RN-RE-MOT-01). */
export const FASES_ACTIVAS = Object.freeze(['inhalar', 'exhalar'])

/** Las dos que sostienen. Sí pueden valer 0 (RN-RE-MOT-02). */
export const FASES_RETENCION = Object.freeze(['retenerLleno', 'retenerVacio'])

export const MS_POR_DECIMA = 100

export const MIN_FASE_ACTIVA = 10 // 1,0 s — RN-RE-MOT-01
export const MIN_FASE_RETENCION = 0 // RN-RE-MOT-02
export const MAX_FASE = 200 // 20,0 s — RN-RE-MOT-03
export const MIN_CICLO = 60 // 6,0 s — RN-RE-MOT-04
export const MAX_CICLO = 600 // 60,0 s — RN-RE-MOT-04
export const PASO_EDICION = 5 // 0,5 s — RN-RE-MOT-06

/**
 * El patrón al que se recurre cuando falta un valor y no hay nada mejor.
 *
 * Son los mismos números que `calma-553` del catálogo, y la coincidencia no es
 * casual: es el ritmo de Lumia. No se importa de `breathing/data/` porque este
 * módulo no puede conocer `breathing/`; una prueba de allá comprueba que los
 * dos siguen diciendo lo mismo, para que la duplicación no pueda separarse.
 */
export const PATRON_BASE = Object.freeze({
  inhalar: 50,
  retenerLleno: 0,
  exhalar: 50,
  retenerVacio: 30,
})

// ─── Avisos de validación ─────────────────────────────────────────────────────
// Códigos estables. Quien pinta decide el copy; esto es para quien programa.

export const AVISOS = Object.freeze({
  NO_ES_OBJETO: 'no-es-objeto',
  FALTA_FASE: 'falta-fase',
  NO_NUMERICO: 'no-numerico',
  REDONDEADO: 'redondeado',
  MINIMO_FASE: 'minimo-fase',
  MAXIMO_FASE: 'maximo-fase',
  CICLO_CORTO: 'ciclo-corto',
  CICLO_LARGO: 'ciclo-largo',
})

// ─── Lectura del patrón ───────────────────────────────────────────────────────

/** Duración de un ciclo completo, en milisegundos. */
export function duracionCiclo(patron) {
  return decimasDelCiclo(patron) * MS_POR_DECIMA
}

function decimasDelCiclo(patron) {
  if (!esObjeto(patron)) return 0
  return FASES_EN_ORDEN.reduce((total, fase) => {
    const valor = Number(patron[fase])
    return total + (Number.isFinite(valor) && valor > 0 ? valor : 0)
  }, 0)
}

/**
 * Las fases del ciclo con sus límites en milisegundos.
 *
 * **Las fases de duración 0 no aparecen** (caso 9.1): un patrón sin retenciones
 * pasa de inhalar a exhalar sin escalón, y una fase de ancho cero que hay que
 * saltar en cada bucle es una fuente de errores de borde para nada.
 *
 * @returns {{fase: string, msInicio: number, msFin: number, ms: number}[]}
 */
export function fasesDelCiclo(patron) {
  const tramos = []
  let ms = 0
  for (const fase of FASES_EN_ORDEN) {
    const valor = Number(patron?.[fase])
    const decimas = Number.isFinite(valor) && valor > 0 ? Math.trunc(valor) : 0
    if (decimas === 0) continue
    const duracion = decimas * MS_POR_DECIMA
    tramos.push({ fase, msInicio: ms, msFin: ms + duracion, ms: duracion })
    ms += duracion
  }
  return tramos
}

/**
 * Cuán lleno está el pulmón en una fase (SPEC_13 §6.3).
 *
 * Este es **el** contrato con todo lo que se ve y se oye: el círculo, la línea y
 * el volumen leen este número y ninguno calcula el suyo. Es lo que garantiza que
 * sonido e imagen no puedan desincronizarse.
 */
export function amplitudEn(fase, progresoSuave) {
  if (fase === 'inhalar') return recortar(progresoSuave)
  if (fase === 'retenerLleno') return 1
  if (fase === 'exhalar') return 1 - recortar(progresoSuave)
  return 0 // retenerVacio, y cualquier fase que no exista
}

/**
 * Dónde cae un instante dentro del ejercicio. Función pura.
 *
 * @param {object} patron - En décimas de segundo.
 * @param {number} msTranscurridos - Desde el inicio del ciclo 1.
 * @param {{curva?: (t: number) => number}} [opciones] - RN-RE-MOT-10.
 * @returns {{fase: string, progresoFase: number, progresoSuave: number,
 *            amplitud: number, msRestantesFase: number, cicloActual: number,
 *            progresoCiclo: number}}
 */
export function resolverEstado(patron, msTranscurridos, { curva = CURVA_POR_DEFECTO } = {}) {
  const tramos = fasesDelCiclo(patron)
  const total = tramos.reduce((suma, tramo) => suma + tramo.ms, 0)

  // Un patrón sin ninguna fase no tiene dónde caer. Se devuelve un estado en
  // reposo en vez de dividir entre cero: nada bloquea (RN-RE-MOT-07).
  if (total === 0) {
    return {
      fase: 'retenerVacio',
      progresoFase: 0,
      progresoSuave: 0,
      amplitud: 0,
      msRestantesFase: 0,
      cicloActual: 1,
      progresoCiclo: 0,
    }
  }

  const ms = Math.max(0, Number(msTranscurridos) || 0)
  const cicloActual = Math.floor(ms / total) + 1
  const dentro = ms - (cicloActual - 1) * total

  for (const tramo of tramos) {
    if (dentro < tramo.msFin) {
      const progresoFase = (dentro - tramo.msInicio) / tramo.ms
      // Las retenciones no llevan curva: su amplitud es constante, así que
      // suavizarla no cambiaría nada y solo escondería que es una recta.
      const esRetencion = FASES_RETENCION.includes(tramo.fase)
      const progresoSuave = esRetencion ? progresoFase : curva(progresoFase)
      return {
        fase: tramo.fase,
        progresoFase,
        progresoSuave,
        amplitud: amplitudEn(tramo.fase, progresoSuave),
        msRestantesFase: tramo.msFin - dentro,
        cicloActual,
        progresoCiclo: dentro / total,
      }
    }
  }

  // Inalcanzable: los tramos cubren el ciclo entero y `dentro` es menor que él.
  // Si alguien rompe esa invariante, esto deja un estado posible en vez de uno
  // imposible.
  const ultimo = tramos[tramos.length - 1]
  return {
    fase: ultimo.fase,
    progresoFase: 1,
    progresoSuave: 1,
    amplitud: amplitudEn(ultimo.fase, 1),
    msRestantesFase: 0,
    cicloActual,
    progresoCiclo: 1,
  }
}

/** RN-RE-MOT-09 — Dos patrones son iguales si sus cuatro fases coinciden. */
export function sonIguales(a, b) {
  if (!esObjeto(a) || !esObjeto(b)) return false
  return FASES_EN_ORDEN.every((fase) => Number(a[fase]) === Number(b[fase]))
}

/** Las cuatro fases valen lo mismo. Es lo que hace que una caja sea una caja. */
export function esCaja(patron) {
  if (!esObjeto(patron)) return false
  const valores = FASES_EN_ORDEN.map((fase) => Number(patron[fase]))
  return valores.every((valor) => Number.isFinite(valor) && valor === valores[0])
}

// ─── Validación ───────────────────────────────────────────────────────────────

/**
 * Corrige un patrón al valor válido más cercano y explica qué tocó.
 *
 * **RN-RE-MOT-07 — nunca lanza.** Ni con `null`, ni con `{}`, ni con texto en
 * una fase. Esto es deliberado y se aparta de RN-DB4-08, que rige en `lib/db/`:
 * allí un registro incompleto se rechaza porque lo escribió el código; aquí lo
 * escribe una persona moviendo un control, y frenarla con un error sería
 * castigarla por explorar.
 *
 * @returns {{valido: boolean, patron: object, avisos: {fase: ?string, codigo: string, de: *, a: *}[]}}
 *   `valido` es `true` solo si no hubo que corregir nada.
 */
export function validarPatron(patronParcial) {
  const avisos = []
  const patron = {}

  if (!esObjeto(patronParcial)) {
    avisos.push({ fase: null, codigo: AVISOS.NO_ES_OBJETO, de: patronParcial, a: null })
  }

  for (const fase of FASES_EN_ORDEN) {
    patron[fase] = validarFase(
      esObjeto(patronParcial) ? patronParcial[fase] : undefined,
      fase,
      avisos,
    )
  }

  ajustarCiclo(patron, avisos)

  return { valido: avisos.length === 0, patron, avisos }
}

function validarFase(bruto, fase, avisos) {
  const minimo = FASES_ACTIVAS.includes(fase) ? MIN_FASE_ACTIVA : MIN_FASE_RETENCION
  const valor = Number(bruto)

  if (bruto === undefined || bruto === null) {
    avisos.push({ fase, codigo: AVISOS.FALTA_FASE, de: bruto, a: PATRON_BASE[fase] })
    return PATRON_BASE[fase]
  }

  if (!Number.isFinite(valor)) {
    avisos.push({ fase, codigo: AVISOS.NO_NUMERICO, de: bruto, a: PATRON_BASE[fase] })
    return PATRON_BASE[fase]
  }

  let n = valor

  // RN-RE-MOT-05 — Un decimal se redondea al múltiplo de 5 más cercano, que es
  // el paso de edición de RN-RE-MOT-06. Un entero que no sea múltiplo de 5 se
  // respeta: es representable y llegar a él por otra vía no es un error.
  if (!Number.isInteger(n)) {
    const redondeado = Math.round(n / PASO_EDICION) * PASO_EDICION
    avisos.push({ fase, codigo: AVISOS.REDONDEADO, de: n, a: redondeado })
    n = redondeado
  }

  if (n < minimo) {
    avisos.push({ fase, codigo: AVISOS.MINIMO_FASE, de: n, a: minimo })
    n = minimo
  }

  if (n > MAX_FASE) {
    avisos.push({ fase, codigo: AVISOS.MAXIMO_FASE, de: n, a: MAX_FASE })
    n = MAX_FASE
  }

  return n
}

/**
 * Lleva el ciclo al rango de RN-RE-MOT-04 sin romper los topes por fase.
 *
 * Crecer reparte de a un paso entre inhalar y exhalar, siempre por la más
 * corta: un ciclo demasiado breve se arregla dando más aire, no más pausa.
 * Encoger quita de a un paso a la fase más larga, que es la que sobra.
 * Los dos bucles terminan: inhalar + exhalar solos llegan a 400 décimas, muy
 * por encima del mínimo, y los mínimos por fase suman 20, muy por debajo del
 * máximo.
 */
function ajustarCiclo(patron, avisos) {
  const totalOriginal = sumar(patron)

  while (sumar(patron) < MIN_CICLO) {
    const fase = patron.inhalar <= patron.exhalar ? 'inhalar' : 'exhalar'
    const otra = fase === 'inhalar' ? 'exhalar' : 'inhalar'
    const destino = patron[fase] < MAX_FASE ? fase : otra
    if (patron[destino] >= MAX_FASE) break
    patron[destino] = Math.min(MAX_FASE, patron[destino] + PASO_EDICION)
  }

  while (sumar(patron) > MAX_CICLO) {
    const fase = FASES_EN_ORDEN.reduce((mayor, actual) =>
      patron[actual] > patron[mayor] ? actual : mayor,
    )
    const minimo = FASES_ACTIVAS.includes(fase) ? MIN_FASE_ACTIVA : MIN_FASE_RETENCION
    if (patron[fase] <= minimo) break
    patron[fase] = Math.max(minimo, patron[fase] - PASO_EDICION)
  }

  const totalFinal = sumar(patron)
  if (totalFinal !== totalOriginal) {
    const codigo = totalFinal > totalOriginal ? AVISOS.CICLO_CORTO : AVISOS.CICLO_LARGO
    avisos.push({ fase: null, codigo, de: totalOriginal, a: totalFinal })
  }
}

function sumar(patron) {
  return FASES_EN_ORDEN.reduce((total, fase) => total + patron[fase], 0)
}

function esObjeto(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor)
}
