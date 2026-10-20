// src/breathing/data/catalogoSonidos.js
// Los sonidos de fondo que Respiración ofrece (SPEC_15 §3.1).
//
// Seis entradas y ninguna detrás de un muro de pago. En la referencia externa
// los buenos están en la suscripción, y el resultado es que la herramienta que
// alguien abre para bajar el ritmo empieza enseñándole lo que no puede tener.
//
// **Bosque no está, y no es un olvido.** Es el único de los evaluados que la
// síntesis no resuelve bien: el lecho sale convincente, pero los cantos de
// pájaro sintetizados suenan sintéticos y romperían la sensación de refugio.
// Vale más no tenerlo que tenerlo mal. Si algún día resulta indispensable, entra
// como el primer archivo de audio real del repo y ahí se define su licencia y su
// precaché — hoy no (§1).
//
// Aquí no hay ni un nombre ni una descripción: cada entrada apunta a su clave en
// `copy/`, igual que el catálogo de patrones.

import * as lluvia from '../audio/fuentes/lluvia.js'
import * as olas from '../audio/fuentes/olas.js'
import * as viento from '../audio/fuentes/viento.js'
import * as cristales from '../audio/fuentes/cristales.js'
import * as fuego from '../audio/fuentes/fuego.js'

/**
 * RN-RE-SND-01 — El valor de fábrica.
 * Coherente con §6.12 del blueprint y con el arreglo que SPEC_08 hizo en
 * `initShared`: nadie recibe sonido que no pidió.
 */
export const ID_SILENCIO = 'silencio'

export const CATALOGO_SONIDOS = Object.freeze([
  // RN-RE-SND-02 — El silencio es una opción de la lista, no la ausencia de
  // una. Que aparezca escrito le da permiso a alguien de elegirlo, en vez de
  // dejarlo como lo que queda si no eliges.
  Object.freeze({ id: ID_SILENCIO, claveCopy: 'silencio', crear: null, orden: 1 }),
  Object.freeze({ id: 'lluvia', claveCopy: 'lluvia', crear: lluvia.crear, orden: 2 }),
  Object.freeze({ id: 'olas', claveCopy: 'olas', crear: olas.crear, orden: 3 }),
  Object.freeze({ id: 'viento', claveCopy: 'viento', crear: viento.crear, orden: 4 }),
  Object.freeze({ id: 'cristales', claveCopy: 'cristales', crear: cristales.crear, orden: 5 }),
  Object.freeze({ id: 'fuego', claveCopy: 'fuego', crear: fuego.crear, orden: 6 }),
])

const POR_ID = Object.freeze(
  Object.fromEntries(CATALOGO_SONIDOS.map((entrada) => [entrada.id, entrada])),
)

export const IDS_SONIDO = Object.freeze(CATALOGO_SONIDOS.map((entrada) => entrada.id))

/** La entrada, o `null` si el id no existe (RN-RE-FAV-12). */
export function obtenerSonido(id) {
  return POR_ID[id] ?? null
}

/** ¿Este id se puede reproducir? El silencio existe pero no suena. */
export function esReproducible(id) {
  const entrada = obtenerSonido(id)
  return entrada !== null && typeof entrada.crear === 'function'
}

/**
 * RN-RE-FAV-12 — Un favorito que apunta a un sonido que ya no existe se carga en
 * silencio y se avisa. No falla y no se descarta: lo demás de esa combinación
 * sigue siendo válido.
 */
export function resolverSonidoId(id) {
  return obtenerSonido(id) === null ? ID_SILENCIO : id
}
