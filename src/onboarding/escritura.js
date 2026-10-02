// src/onboarding/escritura.js
// Qué lee y qué escribe el recorrido, y en qué árbol (SPEC_19.2 §4.2).
//
// `useOnboarding` decide **cuándo** se guarda; esto decide **dónde**. Está
// fuera del hook para poder probarlo sin un navegador: es lo que garantiza que
// P7 no vuelva a pisar en la nube el perfil de una cuenta que ya existía.
//
// ─── El árbol ────────────────────────────────────────────────────────────────
//
// Casi siempre es el uid de la sesión. La excepción es la mudanza pendiente:
// al entrar a una cuenta con la restauración a medias, la sesión ya es la de la
// cuenta, pero lo contestado sigue bajo el uid de origen. Mientras dure, el
// recorrido lee y escribe ahí —la puerta lee ahí también—, y cuando la mudanza
// se completa lo escrito se muda con la política normal: en `shared/*` gana la
// cuenta y lo del origen se conserva bajo su uid. Quién elige el árbol es
// `arbolDeEntrada` (`lib/entradaCuenta.js`), que espera antes a la mudanza en
// curso de esa cuenta.
//
// ─── Lo contestado no cambia de árbol ────────────────────────────────────────
//
// Las respuestas que se leyeron de un origen **solo se escriben en ese
// origen**. Si la mudanza se completa con el recorrido abierto, la cuenta ya
// ganó (DP-19.5): sus respuestas son las que valen y el hook las recarga
// (`releerSiCambioElArbol`). Una escritura que llegue entre medias con las
// respuestas viejas —"Prueba" sobre el perfil de "Alejandra"— se descarta,
// porque escribirlas en la cuenta sería deshacer esa decisión, sellada y
// encolada.
//
// Lo que no es una respuesta sí sigue al árbol: el paso en el que se está y,
// sobre todo, `completedAt`. Que el recorrido se terminó es un hecho de la
// sesión, y tiene que llegar a donde la puerta lo va a leer.

import { shared } from '@/lib/db'
import { arbolDeEntrada } from '@lib/entradaCuenta'
import { opcionDe } from './genero.js'
import { expedienteDe, motivoDesde, perfilDesde } from './estado.js'
import { quedanActivados } from './recordatorios.js'

/**
 * Lee el recorrido de la sesión: perfil y expediente del árbol de la entrada.
 *
 * `carga` es lo que el hook guarda para escribir después: el uid de la sesión
 * y el árbol del que salieron las respuestas.
 *
 * @returns {Promise<{carga: {uid: string, arbol: string}, perfil: ?object, expediente: ?object}>}
 */
export async function leerRecorrido(uid) {
  const arbol = await arbolDeEntrada(uid)
  const [perfil, expediente] = await Promise.all([
    shared.getProfile(arbol).catch(() => null),
    shared.getOnboarding(arbol).catch(() => null),
  ])
  return { carga: { uid, arbol }, perfil, expediente }
}

/**
 * Si el árbol de la entrada ya no es el de la carga —la mudanza pendiente se
 * completó—, lo vuelve a leer. Si es el mismo, `null` y no lee nada: un sello
 * de restauración que no cambia el árbol no tiene nada nuevo que contar al
 * recorrido (E4).
 */
export async function releerSiCambioElArbol(uid, carga) {
  if (!carga || carga.uid !== uid) return null
  if ((await arbolDeEntrada(uid)) === carga.arbol) return null
  return leerRecorrido(uid)
}

/** Las respuestas del recorrido a partir de lo guardado, sobre `previas`. */
export function respuestasDe(perfil, expediente, previas) {
  return {
    ...previas,
    nombre: perfil?.name ?? previas.nombre,
    genero: opcionDe(perfil?.gender),
    despertar: perfil?.wakeTime ?? previas.despertar,
    dormir: perfil?.sleepTime ?? previas.dormir,
    motivos: expediente?.motivos ?? previas.motivos,
    motivoOtro: expediente?.motivoOtro ?? previas.motivoOtro,
  }
}

/**
 * ¿Pueden las respuestas de esta carga escribirse en este árbol?
 *
 * Sí, salvo que se leyeran de un origen y el árbol ya sea otro. Una carga del
 * propio uid de la sesión —lo de siempre, también al crear una cuenta nueva,
 * que muda el árbol entero— vale en cualquier árbol.
 */
function respuestasValenEn(carga, arbol) {
  return !carga || carga.arbol === carga.uid || carga.arbol === arbol
}

/** Escribe el perfil. `null` si las respuestas ya no son de este árbol. */
export async function escribirPerfil(uid, carga, valores) {
  const arbol = await arbolDeEntrada(uid)
  if (!respuestasValenEn(carga, arbol)) return null
  return shared.updateProfile(arbol, perfilDesde(valores))
}

/** Escribe el motivo de P3 en el expediente. */
export async function escribirMotivo(uid, carga, valores) {
  const arbol = await arbolDeEntrada(uid)
  if (!respuestasValenEn(carga, arbol)) return null
  return shared.updateOnboarding(arbol, motivoDesde(valores))
}

/** Escribe la preferencia de avisos de P6. */
export async function escribirRecordatorios(uid, carga, estado) {
  const arbol = await arbolDeEntrada(uid)
  if (!respuestasValenEn(carga, arbol)) return null
  return shared.updatePreferences(arbol, { remindersEnabled: quedanActivados(estado) })
}

/**
 * Escribe el expediente al llegar a un paso. El motivo viaja en la misma
 * escritura —ver `ir` en el hook—, pero solo si las respuestas siguen siendo
 * de este árbol; el paso, siempre.
 */
export async function escribirPaso(uid, carga, destino, recorridos, valores) {
  const arbol = await arbolDeEntrada(uid)
  const motivo = respuestasValenEn(carga, arbol) && valores ? motivoDesde(valores) : {}
  return shared.updateOnboarding(arbol, { ...expedienteDe(destino, recorridos), ...motivo })
}

/**
 * Termina el recorrido: el perfil entero, el motivo y `completedAt`.
 *
 * `completedAt` es lo único que decide que el onboarding está hecho, así que
 * se escribe **aquí y en ningún otro sitio** (RN-DB-09). Se escribe también el
 * perfil entero: quien llegó saltándolo todo tiene el mismo derecho a un
 * perfil escrito que quien contestó.
 *
 * Cada escritura pregunta por su árbol, y `completedAt` lo hace la última: si
 * una mudanza pendiente se completa mientras tanto, el hecho cae en la cuenta,
 * que es donde la puerta va a mirar desde ese momento.
 */
export async function terminarRecorrido(uid, carga, { respuestas, paso, recorridos }) {
  await escribirPerfil(uid, carga, respuestas)
  await escribirMotivo(uid, carga, respuestas)
  const arbol = await arbolDeEntrada(uid)
  return shared.updateOnboarding(arbol, {
    ...expedienteDe(paso, recorridos),
    completedAt: new Date().toISOString(),
  })
}
