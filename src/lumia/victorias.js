// src/lumia/victorias.js
// Victorias: se escriben por la mañana y se recuperan por la noche (RN-VM-02).
// Es la conexión que sostiene el diferenciador D-1 del producto.
//
// Viven en `lumia/` con `identityRef` **opcional** (§C7.7.5). La asimetría con
// los hábitos es deliberada: un hábito es un compromiso de construcción y por
// eso exige identidad; una victoria es un hecho que ya ocurrió y no necesita
// justificarse ante ninguna.
//
// RN-DB4-01 — El vínculo se **deduce del texto** y no se pregunta. §5.3 pedía un
// chip con las áreas elegidas en P3B, pero esas áreas viven en `formia/` y
// desde aquí no se pueden leer. Así que no hay selector "¿dónde vive esto?", no
// se pinta ninguna etiqueta de área en Lumia, y lo deducido se guarda para
// Strivo Intelligence, que es de quien es (§C7.7.5).

import { AREA_IDS, lumia } from '@/lib/db'
import { sugerirIdentidad } from '@/lib/sugerirIdentidad'
import { diaSiguiente } from './fechas.js'

/** Estados de una victoria (§7.2). `no_se_dio` nunca se pinta en rojo. */
export const ESTADOS = Object.freeze(['pendiente', 'lograda', 'no_se_dio', 'soltada'])

/**
 * Id de una victoria: `fecha-posición-azar`.
 *
 * Las victorias son la única colección que se presenta en el orden en que se
 * escribió (§5.4, criterio 1) y el modelo canónico no les da campo de orden ni
 * marca de tiempo. Ordenar por id resuelve las dos cosas sin inventar un campo:
 * la posición ordena, y el sufijo aleatorio evita que dos dispositivos sin red
 * escriban en la misma ruta.
 */
export function nuevoId(fecha, posicion) {
  const azar = Math.random().toString(36).slice(2, 8)
  return `${fecha}-${String(posicion).padStart(3, '0')}-${azar}`
}

function siguientePosicion(victorias) {
  const posiciones = (victorias ?? []).map((victoria) => {
    const partes = String(victoria.id ?? '').split('-')
    return Number(partes[3]) || 0
  })
  return Math.max(0, ...posiciones) + 1
}

/** Orden estable de presentación: el mismo por la mañana y por la noche. */
export function ordenar(victorias) {
  return [...(victorias ?? [])].sort((a, b) => String(a.id).localeCompare(String(b.id)))
}

/** ¿Se arrastró desde otro día? Se pinta como "Viene de ayer" (§5.4, B2). */
export function vieneDeOtroDia(victoria) {
  return Boolean(victoria?.originId)
}

/**
 * Deduce el vínculo con una identidad a partir del texto.
 *
 * Reutiliza el motor de §5.3 que ya usan los hábitos: si el texto señala un
 * área sin ambigüedad, la devuelve; si señala dos o ninguna, devuelve `null`.
 * Sin señal clara no se etiqueta nada, y nunca se pregunta.
 */
export function deducirIdentidad(texto) {
  return sugerirIdentidad(texto, AREA_IDS)
}

function nuevaVictoria(texto, fecha, state) {
  const limpio = texto.trim()
  const identityRef = deducirIdentidad(limpio)
  const victoria = { text: limpio, date: fecha, state }
  if (identityRef) victoria.identityRef = identityRef
  return victoria
}

/** Las del día, en su orden. */
export async function cargar(uid, fecha) {
  return ordenar(await lumia.listVictoriesByDate(uid, fecha))
}

/**
 * Guarda las filas de victorias de un día: crea las nuevas, actualiza las que
 * cambiaron de texto y borra las que se vaciaron.
 *
 * Vaciar una fila borra el registro, no lo archiva: una fila que se escribió
 * mal nunca fue una victoria. Renunciar a una que sí lo fue es otra cosa, se
 * llama "dejarla ir" y conserva su historia con estado `soltada`.
 *
 * Lo guardado se lee aquí dentro y no se recibe por parámetro: entre que la
 * pantalla pinta y la escritura llega, puede haber otra escritura por medio.
 * Partir de una copia vieja es lo que duplica una victoria.
 *
 * @param {Array<{id: ?string, texto: string}>} filas
 * @param {string} [state] - Estado con el que nacen las nuevas.
 * @returns {Promise<object[]>} las victorias del día, en su orden.
 */
export async function guardarFilas(uid, fecha, filas, state = 'pendiente') {
  const victorias = await cargar(uid, fecha)
  const previas = new Map(victorias.map((victoria) => [victoria.id, victoria]))
  let posicion = siguientePosicion(victorias)

  for (const fila of filas ?? []) {
    const texto = fila.texto.trim()

    // Una fila con id ya es un registro, esté o no en la lista que llegó por
    // parámetro: entre que se guardó y se volvió a llamar, la pantalla pudo
    // haberse quedado con una copia anterior. Tratarla como nueva duplicaría
    // la victoria.
    if (fila.id) {
      const previa = previas.get(fila.id)
      if (texto === '') {
        await lumia.deleteVictory(uid, fila.id)
      } else if (!previa || texto !== previa.text) {
        await lumia.updateVictory(uid, fila.id, {
          text: texto,
          identityRef: deducirIdentidad(texto),
        })
      }
      continue
    }

    if (texto !== '') {
      await lumia.createVictory(uid, nuevaVictoria(texto, fecha, state), nuevoId(fecha, posicion))
      posicion += 1
    }
  }

  return cargar(uid, fecha)
}

/**
 * Marca una victoria como lograda, o la devuelve a pendiente si ya lo estaba.
 * Es un toque, y es reversible: nada de lo que se marca aquí se cierra.
 */
export async function alternarLograda(uid, victoria) {
  const state = victoria.state === 'lograda' ? 'pendiente' : 'lograda'
  await lumia.updateVictory(uid, victoria.id, { state })
  return cargar(uid, victoria.date)
}

/**
 * "Pasarla a mañana": la de hoy queda como `no_se_dio` y nace una copia en el
 * día siguiente.
 *
 * RN-VN-03 — La copia conserva el identificador de origen de toda la cadena,
 * no el del día anterior: una victoria que se ha movido tres veces sigue
 * apuntando a donde empezó.
 */
export async function pasarAManana(uid, victoria) {
  const manana = diaSiguiente(victoria.date)
  const enManana = await lumia.listVictoriesByDate(uid, manana)

  await lumia.createVictory(
    uid,
    {
      text: victoria.text,
      date: manana,
      state: 'pendiente',
      identityRef: victoria.identityRef ?? null,
      originId: victoria.originId ?? victoria.id,
    },
    nuevoId(manana, siguientePosicion(enManana)),
  )
  await lumia.updateVictory(uid, victoria.id, { state: 'no_se_dio' })
  return cargar(uid, victoria.date)
}

/** "Dejarla ir": se archiva. Nunca se borra y nunca se dice nada negativo. */
export async function dejarIr(uid, victoria) {
  await lumia.updateVictory(uid, victoria.id, { state: 'soltada' })
  return cargar(uid, victoria.date)
}

/** Vuelve a pendiente una decisión tomada. Todo aquí es reversible. */
export async function deshacerDecision(uid, victoria) {
  await lumia.updateVictory(uid, victoria.id, { state: 'pendiente' })
  return cargar(uid, victoria.date)
}

/** Las que la noche muestra: todo lo del día menos lo ya soltado. */
export function visiblesDeNoche(victorias) {
  return ordenar(victorias).filter((victoria) => victoria.state !== 'soltada')
}

/** Cuántas se lograron. Alimenta la síntesis de cierre (§5.4). */
export function contarLogradas(victorias) {
  return (victorias ?? []).filter((victoria) => victoria.state === 'lograda').length
}
