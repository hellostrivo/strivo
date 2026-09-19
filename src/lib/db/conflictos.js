// src/lib/db/conflictos.js
// Qué gana cuando un registro existe aquí y en la nube (SPEC_17A §2, §4.2).
//
// Módulo puro: no toca almacenamiento ni red. Lo consume la restauración para
// decidir, documento a documento, si lo que baja puede escribirse encima de lo
// que hay. Las tres reglas, en este orden:
//
//   1. Ruta que no existe en local, la escribe lo remoto. Sin competencia: no
//      hay nada que pisar. (Esa la aplica quien restaura antes de preguntar
//      aquí: si no hay local, no hay conflicto.)
//   2. Documento local con el campo de marca **ausente** frente a remoto con
//      marca: gana el remoto. Solo puede darse en un caso —un `shared/*`
//      sembrado por `initShared`, o un registro escrito antes de esta SPEC— y
//      es justo donde lo remoto es demostrablemente algo que esa persona
//      escribió y lo local es un hueco con forma de dato.
//   3. En todo lo demás, gana lo local: empate, ambas sin marca, marca remota
//      menor o igual, marca local ilegible, o colección sin campo de marca. Es
//      la regla que ya sigue `mudarUid`: lo remoto nunca sobrescribe algo
//      local que no se pueda demostrar más viejo.
//
// **Ausente e ilegible no son lo mismo, y la diferencia decide un caso.** La
// regla 2 existe porque un documento local sin campo de marca es un hueco que
// nadie escribió. Una marca presente pero imparseable —"ayer", un número,
// basura— es lo contrario: alguien escribió ahí y lo único que no sabemos es
// cuándo. Convertir "no puedo leerlo" en "no existe" sería corregir en
// silencio (RN-DB4-08) y dejaría que lo remoto pisara algo escrito. Del lado
// remoto no hace falta distinguir: ausente o ilegible, pierde igual.
//
// **La comparación es por instante, nunca por texto.** Hay dos formatos en
// circulación —`toISOString()` en el journal, `shared/` y respiración;
// `marcaLocal()` con desfase en la mañana y la noche— y husos distintos entre
// dispositivos. Comparar cadenas diría que `2026-09-17T07:00:00-05:00` es
// anterior a `2026-09-17T09:00:00Z`, cuando son tres horas posteriores.
//
// **Nada se inventa** (RN-DB4-08). Un registro sin marca legible no recibe una
// fabricada al vuelo: se trata como "sin marca" y las reglas 2 y 3 lo cubren.

/**
 * Qué campo dice cuándo se escribió por última vez cada colección.
 *
 * Las etiquetas de respiración se escriben **literales aquí y no se importan
 * de `src/breathing/data/esquema.js`** (D10): `lib/db/` no conoce las ramas de
 * arriba, y esa dirección de dependencia no se invierte por un mapa de cinco
 * líneas. Si Respiración renombra una etiqueta, esta tabla se queda atrás y
 * la fusión trata esa colección como "sin campo de marca" —gana lo local—, que
 * es el lado seguro del error.
 *
 * `breathing/sesiones` no tiene campo a propósito: una sesión se escribe una
 * vez y no se edita, así que no hay versión más nueva que pueda ganar.
 * `null` significa "nunca gana lo remoto".
 */
export const CAMPO_DE_MARCA = Object.freeze({
  // Preferencias de respiración: `actualizadoEn` se recalcula en cada
  // normalización.
  breathing: 'actualizadoEn',
  'breathing/favoritos': 'actualizadoEn',
  'breathing/recientes': 'usadoEn',
  'breathing/sesiones': null,
})

const CAMPO_POR_DEFECTO = 'updatedAt'

/** Qué campo lleva la marca en esta colección, o `null` si ninguno. */
export function campoDeMarca(coleccion) {
  return Object.prototype.hasOwnProperty.call(CAMPO_DE_MARCA, coleccion)
    ? CAMPO_DE_MARCA[coleccion]
    : CAMPO_POR_DEFECTO
}

/**
 * Instante de última escritura de un registro, como milisegundos de época.
 *
 * @returns {?number} `null` si la colección no tiene campo de marca, si el
 *   registro no lo trae, si no es una cadena o si no se puede leer como fecha.
 */
export function marcaDe(coleccion, data) {
  const campo = campoDeMarca(coleccion)
  if (campo === null) return null
  const valor = data?.[campo]
  if (typeof valor !== 'string') return null
  const instante = Date.parse(valor)
  return Number.isNaN(instante) ? null : instante
}

/**
 * ¿Puede lo remoto escribirse encima de lo local?
 *
 * Implementa literalmente las reglas 2 y 3 (la 1 no llega aquí: sin local no
 * hay nada que comparar). `true` solo cuando a lo local le falta el campo de
 * marca y lo remoto la tiene, o cuando las dos la tienen legible y la remota
 * es **estrictamente** mayor. Todo lo demás —empate, ambas sin marca, remota
 * menor, local ilegible, colección sin campo— es `false`.
 *
 * `marcaDe` no distingue ausente de ilegible, y aquí sí hace falta: por eso
 * esta función pregunta además `esSemilla` sobre el documento local. Esa
 * pregunta no cambia el contrato de `marcaDe`.
 */
export function ganaRemoto(coleccion, local, remoto) {
  const campo = campoDeMarca(coleccion)
  if (campo === null) return false
  const marcaRemota = marcaDe(coleccion, remoto)
  if (marcaRemota === null) return false
  const marcaLocal = marcaDe(coleccion, local)
  if (marcaLocal === null) return esSemilla(coleccion, local)
  return marcaRemota > marcaLocal
}

/**
 * ¿Es este registro un hueco que nadie escribió?
 *
 * Es la pregunta que distingue **ausente** de **ilegible**, y es pública
 * porque la hacen dos sitios: `ganaRemoto`, para dejar que lo remoto pise una
 * siembra y solo una siembra; y `mudarUid` (DP-17.10), para no subir a la nube
 * lo que sigue siendo semilla después de mudarse a una cuenta. Dos copias de
 * la misma pregunta se separan en cuanto alguien edite una, y la diferencia
 * entre las dos respuestas es que un `updatedAt: "ayer"` suba o no.
 *
 * `null` y `undefined` cuentan como **ausente**, no como ilegible: `null` es
 * la convención de la casa para "todavía no" —`name: null`, `completedAt:
 * null`— y es literalmente lo que siembra `preferenciasDeFabrica()` en
 * `actualizadoEn`. Una siembra con `null` es el mismo hueco que una siembra
 * sin la clave, y tratarla como escrita dejaría que unas preferencias de
 * fábrica le ganaran a las que esa persona sí ajustó (D13). Lo ilegible es
 * otra cosa: un valor que alguien puso y que no se puede fechar, y por eso
 * **no** es semilla.
 *
 * Una colección sin campo de marca (`breathing/sesiones`) nunca es semilla:
 * ahí no hay forma de distinguir, y el lado seguro es tratar cada registro
 * como escrito.
 */
export function esSemilla(coleccion, data) {
  const campo = campoDeMarca(coleccion)
  if (campo === null) return false
  return data?.[campo] == null
}
