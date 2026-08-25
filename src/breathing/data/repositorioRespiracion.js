// src/breathing/data/repositorioRespiracion.js
// Lo único que habla con el almacén en nombre de Respiración (SPEC_13 §8.6).
//
// **No hay stores nuevos ni migración de IndexedDB.** El almacén de Strivo está
// direccionado por ruta —un solo `records` con la forma exacta de Firestore— así
// que `breathing/` son cuatro colecciones más dentro de lo que ya existe. Subir
// `DB_VERSION` habría sido lo arriesgado, no lo prudente: una build anterior de
// la app no puede abrir una base con versión mayor que la suya, y el requisito
// era justamente que nada se corrompa al volver atrás (SPEC_13 §4.4).
//
// **RN-RE-DAT-09 — de aquí no se importa nada de `diario/`.** Se
// entra por `lib/db/local.js` y `lib/db/schema.js` directamente y no por el
// barril `lib/db/index.js`, que expone los dos espacios: el lint lo prohíbe, y
// aunque no lo hiciera, no hay motivo para tenerlos a la vista.

import { deletePath, newId, readCollection, readPath, writePath } from '@lib/db/local'
import {
  CLAVE_PREFERENCIAS,
  COLECCIONES,
  SEGMENTOS,
  DIAS_RETENCION_SESIONES,
  MAX_RECIENTES,
  mismaConfiguracion,
  normalizarFavorito,
  normalizarPreferencias,
  normalizarReciente,
  normalizarSesion,
  preferenciasDeFabrica,
  rutas,
} from './esquema.js'

// ─── Almacén, con respaldo en memoria ─────────────────────────────────────────
// Caso 9.8 — En una ventana privada IndexedDB puede no existir. La herramienta
// sigue funcionando entera durante la sesión y lo guardado se pierde al salir.
//
// El respaldo vive **aquí y no en `lib/db/local.js`** a propósito: degradar el
// almacén compartido cambiaría el comportamiento de error del diario, que
// se diseñó sobre RN-DB4-08 —nada se corrige en silencio— y está sostenido por
// las pruebas de SPEC_02. El radio se queda dentro de la respiración.

const memoria = new Map()
let enMemoria = false

/** `true` si el almacén persistente no estaba disponible y se degradó. */
export function estaEnMemoria() {
  return enMemoria
}

/** Solo para pruebas: vuelve al estado de partida. */
export function reiniciarRespaldoEnMemoria() {
  memoria.clear()
  enMemoria = false
}

function degradar(error) {
  if (!enMemoria) {
    enMemoria = true
    console.warn('[respiracion] Sin almacen persistente: la sesion vive en memoria.', error)
  }
}

async function leer(path) {
  if (!enMemoria) {
    try {
      return await readPath(path)
    } catch (error) {
      degradar(error)
    }
  }
  return memoria.get(path)?.data ?? null
}

async function leerColeccion(uid, collection) {
  if (!enMemoria) {
    try {
      return await readCollection(uid, collection)
    } catch (error) {
      degradar(error)
    }
  }
  return [...memoria.values()]
    .filter((fila) => fila.uid === uid && fila.collection === collection)
    .map((fila) => (fila.id === null ? { ...fila.data } : { id: fila.id, ...fila.data }))
}

async function escribir({ uid, path, collection, id = null, data }) {
  if (!enMemoria) {
    try {
      await writePath({ uid, path, collection, id, data })
      return data
    } catch (error) {
      degradar(error)
    }
  }
  memoria.set(path, { path, uid, collection, id, data })
  return data
}

async function borrar({ uid, path }) {
  if (!enMemoria) {
    try {
      await deletePath({ uid, path })
      return
    } catch (error) {
      degradar(error)
    }
  }
  memoria.delete(path)
}

function nuevoId() {
  return newId()
}

// ─── Preferencias ─────────────────────────────────────────────────────────────

function rutaPreferencias(uid) {
  return rutas.doc(uid, CLAVE_PREFERENCIAS)
}

/**
 * RN-RE-DAT-08 — Nunca lanza y nunca devuelve nada a medias. Sin preferencias
 * guardadas, siembra las de fábrica y las devuelve, con `guiaSonoraActiva` en
 * `false` (RN-RE-DAT-01).
 */
export async function leerPreferencias(uid) {
  const guardadas = await leer(rutaPreferencias(uid))
  if (guardadas !== null) return normalizarPreferencias(guardadas)

  const frescas = normalizarPreferencias(preferenciasDeFabrica())
  await escribir({
    uid,
    path: rutaPreferencias(uid),
    collection: COLECCIONES.preferencias,
    id: CLAVE_PREFERENCIAS,
    data: frescas,
  })
  return frescas
}

/**
 * RN-RE-DAT-02 — Al terminar una sesión se persiste lo que se usó, para que la
 * siguiente entrada retome el estado. Nadie quiere reconfigurar cada vez.
 */
export async function guardarPreferencias(uid, parcial) {
  const guardadas = await leer(rutaPreferencias(uid))
  const siguientes = normalizarPreferencias(guardadas, parcial)
  await escribir({
    uid,
    path: rutaPreferencias(uid),
    collection: COLECCIONES.preferencias,
    id: CLAVE_PREFERENCIAS,
    data: siguientes,
  })
  return siguientes
}

// ─── Favoritos ────────────────────────────────────────────────────────────────

function rutaFavorito(uid, id) {
  return rutas.item(uid, SEGMENTOS.favoritos, id)
}

/** Orden: el usado más recientemente primero; a igualdad, el más nuevo. */
export async function listarFavoritos(uid) {
  const filas = await leerColeccion(uid, COLECCIONES.favoritos)
  return filas.sort((a, b) => {
    const usoA = a.ultimoUsoEn ?? ''
    const usoB = b.ultimoUsoEn ?? ''
    if (usoA !== usoB) return usoB.localeCompare(usoA)
    return (b.creadoEn ?? '').localeCompare(a.creadoEn ?? '')
  })
}

export async function crearFavorito(uid, datos) {
  const id = nuevoId()
  const favorito = { ...normalizarFavorito(datos), id }
  await escribir({
    uid,
    path: rutaFavorito(uid, id),
    collection: COLECCIONES.favoritos,
    id,
    data: favorito,
  })
  return favorito
}

export async function actualizarFavorito(uid, id, parcial) {
  const previo = await leer(rutaFavorito(uid, id))
  if (previo === null) return null
  const favorito = { ...normalizarFavorito(parcial, previo), id }
  await escribir({
    uid,
    path: rutaFavorito(uid, id),
    collection: COLECCIONES.favoritos,
    id,
    data: favorito,
  })
  return favorito
}

export async function eliminarFavorito(uid, id) {
  await borrar({ uid, path: rutaFavorito(uid, id) })
}

export async function registrarUsoFavorito(uid, id) {
  const previo = await leer(rutaFavorito(uid, id))
  if (previo === null) return null
  const favorito = {
    ...previo,
    id,
    ultimoUsoEn: new Date().toISOString(),
    usos: (Number(previo.usos) || 0) + 1,
  }
  await escribir({
    uid,
    path: rutaFavorito(uid, id),
    collection: COLECCIONES.favoritos,
    id,
    data: favorito,
  })
  return favorito
}

// ─── Recientes ────────────────────────────────────────────────────────────────

function rutaReciente(uid, id) {
  return rutas.item(uid, SEGMENTOS.recientes, id)
}

export async function listarRecientes(uid) {
  const filas = await leerColeccion(uid, COLECCIONES.recientes)
  return filas
    .sort((a, b) => (b.usadoEn ?? '').localeCompare(a.usadoEn ?? ''))
    .slice(0, MAX_RECIENTES)
}

/**
 * Guarda una configuración recién usada.
 *
 * Tres reglas, y las tres existen para que la lista sirva de algo:
 * - **RN-RE-DAT-05** — lo que ya está en favoritos no entra. Dos listas con lo
 *   mismo obligan a leer las dos para saber que no hay nada nuevo.
 * - **RN-RE-DAT-04** — repetir una configuración mueve su fecha, no la duplica.
 * - **RN-RE-DAT-03** — cinco como mucho; la sexta desaloja a la más vieja.
 *
 * @returns {Promise<?object>} La reciente guardada, o `null` si no procedía.
 */
export async function registrarReciente(uid, config) {
  const entrante = normalizarReciente(config)

  const favoritos = await listarFavoritos(uid)
  if (favoritos.some((favorito) => mismaConfiguracion(favorito, entrante))) return null

  const existentes = await listarRecientes(uid)
  const gemela = existentes.find((reciente) => mismaConfiguracion(reciente, entrante))

  if (gemela) {
    const actualizada = { ...gemela, usadoEn: entrante.usadoEn }
    await escribir({
      uid,
      path: rutaReciente(uid, gemela.id),
      collection: COLECCIONES.recientes,
      id: gemela.id,
      data: actualizada,
    })
    return actualizada
  }

  const id = nuevoId()
  const reciente = { ...entrante, id }
  await escribir({
    uid,
    path: rutaReciente(uid, id),
    collection: COLECCIONES.recientes,
    id,
    data: reciente,
  })

  const sobrantes = [...existentes, reciente]
    .sort((a, b) => (b.usadoEn ?? '').localeCompare(a.usadoEn ?? ''))
    .slice(MAX_RECIENTES)
  for (const vieja of sobrantes) {
    await borrar({ uid, path: rutaReciente(uid, vieja.id) })
  }

  return reciente
}

// ─── Sesiones ─────────────────────────────────────────────────────────────────

function rutaSesion(uid, id) {
  return rutas.item(uid, SEGMENTOS.sesiones, id)
}

/**
 * Caso 9.7 — Una sesión sin un solo ciclo completo no se registra. No hubo
 * sesión: hubo alguien que abrió y cerró.
 */
export async function registrarSesion(uid, datos) {
  const sesion = normalizarSesion(datos)
  if (sesion.ciclosCompletados === 0) return null

  const id = nuevoId()
  const registro = { ...sesion, id }
  await escribir({
    uid,
    path: rutaSesion(uid, id),
    collection: COLECCIONES.sesiones,
    id,
    data: registro,
  })
  return registro
}

export async function listarSesiones(uid) {
  const filas = await leerColeccion(uid, COLECCIONES.sesiones)
  return filas.sort((a, b) => (b.iniciadaEn ?? '').localeCompare(a.iniciadaEn ?? ''))
}

/**
 * RN-RE-DAT-06 — Se purga lo que pasa de 90 días, al abrir la app.
 * @returns {Promise<number>} Cuántas se fueron.
 */
export async function purgarSesionesViejas(uid, ahora = new Date()) {
  const corte = new Date(ahora.getTime() - DIAS_RETENCION_SESIONES * 24 * 60 * 60 * 1000)
  const limite = corte.toISOString()
  const sesiones = await leerColeccion(uid, COLECCIONES.sesiones)
  let purgadas = 0
  for (const sesion of sesiones) {
    if ((sesion.iniciadaEn ?? '') < limite) {
      await borrar({ uid, path: rutaSesion(uid, sesion.id) })
      purgadas += 1
    }
  }
  return purgadas
}
