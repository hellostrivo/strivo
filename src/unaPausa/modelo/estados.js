// src/unaPausa/modelo/estados.js
// En qué estados puede estar una cápsula, quién la mueve entre ellos, y qué
// campos tiene que traer cada estado.
//
// La tabla es la de SPEC_28 §4.1, escrita como datos. **Lo que no está en la
// tabla no se puede.** La única fila que no viene de ahí es la de la IA creando
// un borrador desde nada, que la añade la instrucción de 28.1 (§4.3): es como
// entran al repo las cápsulas de 28.5.
//
// En Fase A nadie ejecuta estas transiciones: quien cambia el estado es la
// fundadora, a mano, en un archivo, y el validador solo ve el estado al que
// llegó. Por eso hay dos piezas: `puedeTransitar` es la regla que aplicará el
// servidor de Fase B, y `coherente` es lo único que Fase A puede comprobar —que
// los campos del estado declarado están—.

import { EDITORAS, ESTADOS, SECCIONES_REVISABLES } from './capsula.js'
import { esMarca } from './semana.js'

/**
 * La revisión es una marca por sección, no una edición forzada (DP-28.9,
 * provisional). Es un interruptor: exige o no marcar las seis secciones.
 * «Revisar y modificar» no se puede comprobar en Fase A —haría falta ver la
 * versión anterior— y queda para Fase B.
 */
export const REVISION_POR_SECCION = true

/** Quién mueve una cápsula. `sistema` es el paso del tiempo. */
export const ACTORES = Object.freeze(['editora', 'ia', 'sistema'])

/**
 * SPEC_28 §4.1. `de: null` es «desde nada». `condicion: 'reserva'` solo se
 * cumple si la cápsula lleva `reserva: true`.
 */
export const TRANSICIONES = Object.freeze(
  [
    { de: null, a: 'tema_calendarizado', actores: ['editora'] },
    { de: null, a: 'borrador', actores: ['ia'] },
    { de: 'tema_calendarizado', a: 'borrador', actores: ['editora', 'ia'] },
    { de: 'borrador', a: 'en_revision', actores: ['editora'] },
    { de: 'en_revision', a: 'borrador', actores: ['editora'] },
    { de: 'en_revision', a: 'prevalidada', actores: ['editora'] },
    { de: 'en_revision', a: 'rechazada', actores: ['editora'] },
    { de: 'prevalidada', a: 'aprobada', actores: ['editora'] },
    { de: 'prevalidada', a: 'en_revision', actores: ['editora'] },
    { de: 'prevalidada', a: 'rechazada', actores: ['editora'] },
    { de: 'aprobada', a: 'programada', actores: ['editora'] },
    { de: 'aprobada', a: 'en_revision', actores: ['editora'] },
    { de: 'programada', a: 'aprobada', actores: ['editora'] },
    { de: 'programada', a: 'publicada', actores: ['sistema'] },
    { de: 'publicada', a: 'archivada', actores: ['sistema'] },
    { de: 'aprobada', a: 'publicada', actores: ['sistema'], condicion: 'reserva' },
  ].map((fila) => Object.freeze({ ...fila, actores: Object.freeze(fila.actores) })),
)

/**
 * ¿Puede ese actor llevar una cápsula de `de` a `a`?
 * @param {string|null} de        `null` o `undefined`: la cápsula no existe todavía.
 * @param {string} a
 * @param {string} actor          Uno de `ACTORES`.
 * @param {{reserva?: boolean}} [capsula]  Solo la mira una fila con condición.
 */
export function puedeTransitar(de, a, actor, capsula) {
  const origen = de ?? null
  return TRANSICIONES.some(
    (t) =>
      t.de === origen &&
      t.a === a &&
      t.actores.includes(actor) &&
      (t.condicion !== 'reserva' || capsula?.reserva === true),
  )
}

// El orden del recorrido, para decir «de tal estado en adelante». `rechazada`
// no tiene sitio en él: es una salida, y se le exige lo de un borrador —el
// léxico y nada más—, porque nunca se muestra.
const ORDEN = [
  'tema_calendarizado',
  'borrador',
  'en_revision',
  'prevalidada',
  'aprobada',
  'programada',
  'publicada',
  'archivada',
]

/** ¿El estado está en `umbral` o más adelante? `rechazada`, nunca. */
export function desde(estado, umbral) {
  const i = ORDEN.indexOf(estado)
  return i !== -1 && i >= ORDEN.indexOf(umbral)
}

/** ¿Es uno de los nueve? */
export function esEstado(estado) {
  return ESTADOS.includes(estado)
}

const falta = (codigo, campo) => ({ codigo, campo })
const vacio = (v) => v === undefined || v === null || v === ''

/**
 * Las faltas de coherencia entre el estado declarado y sus campos.
 * @param {import('./capsula.js').WeeklyCapsule} capsula
 * @returns {{codigo: string, campo: string|null}[]}
 */
export function coherente(capsula) {
  const c = capsula ?? {}
  const estado = c.status
  const faltas = []

  if (!esEstado(estado)) return [falta('estado.desconocido', 'status')]

  // Desvío 4 de la instrucción: en Fase A estos dos se derivan, no se escriben.
  if (estado === 'publicada' || estado === 'archivada') {
    faltas.push(falta('estado.derivado-en-fase-a', 'status'))
  }

  if (c.reserva === true && !vacio(c.weekStart)) {
    faltas.push(falta('estado.reserva-con-semana', 'weekStart'))
  }
  if (c.reserva === true && estado === 'programada') {
    faltas.push(falta('estado.reserva-con-semana', 'reserva'))
  }

  if (desde(estado, 'en_revision') && c.generatedWithAi === true && vacio(c.generatedAt)) {
    faltas.push(falta('estado.generado-sin-fecha', 'generatedAt'))
  }

  if (desde(estado, 'prevalidada')) {
    if (!EDITORAS.includes(c.reviewedBy)) {
      faltas.push(falta('estado.editora-desconocida', 'reviewedBy'))
    }
    for (const campo of ['reviewedAt', 'prevalidatedAt']) {
      if (vacio(c[campo])) faltas.push(falta('estado.revision-incompleta', campo))
    }
    if (REVISION_POR_SECCION) {
      const marcadas = Array.isArray(c.reviewedSections) ? c.reviewedSections : []
      if (SECCIONES_REVISABLES.some((s) => !marcadas.includes(s))) {
        faltas.push(falta('estado.revision-incompleta', 'reviewedSections'))
      }
    }
    if (
      c.generatedWithAi === true &&
      esMarca(c.reviewedAt) &&
      esMarca(c.generatedAt) &&
      Date.parse(c.reviewedAt) <= Date.parse(c.generatedAt)
    ) {
      faltas.push(falta('estado.revision-antes-de-generar', 'reviewedAt'))
    }
  }

  if (desde(estado, 'aprobada')) {
    if (!EDITORAS.includes(c.approvedBy)) {
      faltas.push(falta('estado.editora-desconocida', 'approvedBy'))
    }
    if (vacio(c.approvedAt)) faltas.push(falta('estado.sin-aprobar', 'approvedAt'))
  }

  if (desde(estado, 'programada')) {
    for (const campo of ['weekStart', 'scheduledAt']) {
      if (vacio(c[campo])) faltas.push(falta('estado.sin-programar', campo))
    }
  }

  return faltas
}
