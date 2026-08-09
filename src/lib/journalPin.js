// src/lib/journalPin.js
// El PIN del Journal (bloque 07).
//
// QUÉ ES Y QUÉ NO ES. Esto bloquea la ENTRADA al journal en este dispositivo.
// Las entradas siguen guardadas en IndexedDB tal cual se escribieron: no hay
// cifrado del contenido, y por eso el copy no lo promete en ninguna parte. El
// cifrado real es candidato para la Fase 1.
//
// Lo que sí se garantiza aquí:
//   · El PIN nunca se guarda. Se guarda lo que se deriva de él con PBKDF2 y una
//     sal aleatoria, que no permite volver atrás.
//   · La fila vive en `appFlags`, que es el almacén del dispositivo: no se
//     sincroniza ni entra en la cola de subida (ver @lib/db). Un fallo de red no
//     puede dejar a nadie fuera de su propio diario.
//   · La comparación es en tiempo constante: no se sale del bucle en el primer
//     byte distinto.
//
// Se guardan también `iterations` y `algorithm`. Ese es el motivo: poder subir
// el coste dentro de unos años sin invalidar los PIN que ya existen.
//
// El desbloqueo vive en memoria del módulo, no en localStorage: dura lo que
// dura la sesión y se pierde al recargar, que es justo lo que se pide (§07.D.4).

import { getFlag, setFlag, removeFlag } from '@lib/db'

export const PIN_MIN = 4
export const PIN_MAX = 6

const CLAVE       = 'journal.pin'
const ALGORITMO   = 'PBKDF2-SHA-256'
// Muy por encima del mínimo de 150 000 que pide la spec, y todavía por debajo
// de lo que se nota al escribir cuatro dígitos en un teléfono modesto.
const ITERACIONES = 210_000
const BYTES_SAL   = 16
const BITS_HASH   = 256

// ─── El teclado ──────────────────────────────────────────────────────────────
// Solo dígitos, y como mucho seis. Vale igual para lo que se teclea que para lo
// que se pega: el campo llama a esto en cada cambio, así que un pegado con
// espacios o guiones entra limpio en vez de rechazarse con un aviso.
export function soloDigitos(texto) {
  return String(texto ?? '').replace(/\D/g, '').slice(0, PIN_MAX)
}

export function pinCompleto(pin) {
  const digitos = soloDigitos(pin)
  return digitos.length >= PIN_MIN && digitos.length <= PIN_MAX
}

// Sin WebCrypto no se puede derivar nada, y guardar un PIN de otra manera sería
// peor que no tenerlo. Pasa en contextos no seguros (http fuera de localhost) y
// en navegadores muy viejos. La interfaz consulta esto para no ofrecer lo que no
// puede cumplir.
export function hayCripto() {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function' &&
    !!crypto.subtle
  )
}

// ─── Estado en memoria ───────────────────────────────────────────────────────
// `registro` tiene tres valores posibles y los tres significan algo distinto:
//   undefined → todavía no se ha leído el almacén
//   null      → se leyó y no hay PIN
//   objeto    → se leyó y hay PIN
//
// La distinción importa: la pantalla no puede abrir el journal mientras no sepa
// si hay protección, así que no vale un booleano que arranque en false.
let registro
let desbloqueado = false

/** true | false | null (null = todavía no se sabe, hay que preguntar) */
export function hayPinConocido() {
  return registro === undefined ? null : registro !== null
}

export function estaDesbloqueado() {
  return desbloqueado
}

async function leerRegistro() {
  if (registro !== undefined) return registro
  const guardado = await getFlag(CLAVE, null)
  registro = validoParaVerificar(guardado) ? guardado : null
  return registro
}

export async function hayPin() {
  return (await leerRegistro()) !== null
}

/**
 * Qué ve la pantalla del Journal al montarse: 'abierto' o 'bloqueado'.
 *
 * Si el almacén no responde, se abre. No es una concesión: sin poder leer la
 * fila tampoco se podría verificar ningún PIN, así que bloquear dejaría a la
 * persona fuera de lo que escribió sin ninguna forma de volver a entrar. Entre
 * un cerrojo que nadie puede abrir y una puerta abierta, la app no atrapa.
 */
export async function estadoDeAcceso() {
  if (desbloqueado) return 'abierto'
  try {
    return (await hayPin()) ? 'bloqueado' : 'abierto'
  } catch {
    return 'abierto'
  }
}

// ─── Derivación ──────────────────────────────────────────────────────────────
async function derivar(pin, sal, iteraciones) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: sal, iterations: iteraciones, hash: 'SHA-256' },
    material,
    BITS_HASH
  )
  return new Uint8Array(bits)
}

// Sin salidas anticipadas: el bucle recorre siempre los mismos bytes, acierte o
// no. Comparar con === sobre el texto en base64 filtraría por dónde empieza a
// fallar según lo que tarda.
function igualesEnTiempoConstante(a, b) {
  if (a.length !== b.length) return false
  let diferencia = 0
  for (let i = 0; i < a.length; i++) diferencia |= a[i] ^ b[i]
  return diferencia === 0
}

const aBase64  = bytes => btoa(String.fromCharCode(...bytes))
const deBase64 = texto => Uint8Array.from(atob(texto), c => c.charCodeAt(0))

function validoParaVerificar(fila) {
  return (
    !!fila &&
    typeof fila.salt === 'string' &&
    typeof fila.hash === 'string' &&
    Number.isInteger(fila.iterations) &&
    fila.iterations > 0 &&
    fila.algorithm === ALGORITMO
  )
}

// ─── Crear, verificar, cambiar, quitar ───────────────────────────────────────

/**
 * Guarda un PIN nuevo. Sal nueva cada vez —también al cambiarlo o al
 * restablecerlo—, así que dos PIN iguales en dos momentos distintos no dejan la
 * misma huella.
 *
 * Queda desbloqueado al terminar: quien acaba de elegir su PIN no tiene por qué
 * escribirlo otra vez para seguir donde estaba.
 */
export async function guardarPin(pin) {
  const digitos = soloDigitos(pin)
  if (!pinCompleto(digitos) || !hayCripto()) return false

  const sal  = crypto.getRandomValues(new Uint8Array(BYTES_SAL))
  const hash = await derivar(digitos, sal, ITERACIONES)

  const fila = {
    // Lo que se guarda: la sal, la huella y los parámetros con los que se hizo.
    // El PIN no está aquí ni se puede reconstruir desde aquí.
    salt:       aBase64(sal),
    hash:       aBase64(hash),
    iterations: ITERACIONES,
    algorithm:  ALGORITMO,
    creadoEn:   new Date().toISOString(),
  }

  await setFlag(CLAVE, fila)
  registro     = fila
  desbloqueado = true
  return true
}

/**
 * ¿Es este el PIN? Devuelve un booleano y nada más: no cuenta intentos, no
 * escribe nada y no bloquea a nadie (§07.D.4).
 */
export async function verificarPin(pin) {
  const fila = await leerRegistro()
  if (!fila || !hayCripto()) return false

  const digitos = soloDigitos(pin)
  if (!digitos) return false

  const esperado = deBase64(fila.hash)
  const obtenido = await derivar(digitos, deBase64(fila.salt), fila.iterations)
  return igualesEnTiempoConstante(esperado, obtenido)
}

/** Verifica y, si acierta, abre el journal para el resto de la sesión. */
export async function desbloquearCon(pin) {
  const acierta = await verificarPin(pin)
  if (acierta) desbloqueado = true
  return acierta
}

/** Cambiar pide el de ahora. Sal e iteraciones nuevas para el que entra. */
export async function cambiarPin(actual, nuevo) {
  if (!(await verificarPin(actual))) return false
  return guardarPin(nuevo)
}

/**
 * Quitar la protección pide el PIN de ahora y borra su fila. NO toca ninguna
 * entrada del journal: esta función no sabe siquiera dónde viven.
 */
export async function quitarPin(actual) {
  if (!(await verificarPin(actual))) return false
  await removeFlag(CLAVE)
  registro     = null
  desbloqueado = false
  return true
}

/**
 * Después de recuperar la cuenta (§07.D.5): se escribe un PIN nuevo sin pedir el
 * viejo, que es lo que se olvidó. Quien llama a esto tiene que haber completado
 * la reautenticación con Firebase en ese momento; no hay atajo desde la interfaz
 * que llegue aquí sin pasar por ahí.
 *
 * El hash anterior queda invalidado porque se sobrescribe la fila entera, con
 * sal nueva. Las entradas del journal no se tocan.
 */
export async function restablecerPin(nuevo) {
  return guardarPin(nuevo)
}

// Solo para las pruebas: devuelve el módulo al estado de recién cargado.
export function olvidarEnMemoria() {
  registro     = undefined
  desbloqueado = false
}
