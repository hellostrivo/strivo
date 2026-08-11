// src/lumia/pin.js
// Protección del Journal con PIN (§5.8.2 · §7.7.1).
//
// **Esto es un bloqueo de acceso al módulo, no una protección del contenido.**
// La limitación es la característica más importante de la funcionalidad y hay
// que entenderla literalmente: el PIN impide entrar al Journal desde la
// interfaz y nada más. Quien tenga el dispositivo y conocimientos técnicos
// puede leer IndexedDB directamente. Por eso el copy de este flujo no promete
// inviolabilidad de ninguna forma (§7.8), y por eso una prueba automática
// recorre `copy.lumia.journal.pin` entero para comprobarlo.
//
// **El PIN nunca se guarda.** Se guarda su derivación: PBKDF2 con SHA-256, salt
// aleatorio de 16 bytes del generador criptográfico del navegador y ≥ 150.000
// iteraciones, que se persisten junto al hash para poder subirlas en el futuro
// sin invalidar los PIN existentes.
//
// RN-DB-04 — `lumia/pinConfig` se escribe con `sync: false` y nunca sale del
// dispositivo. Es la única rama del árbol que no llega a Firestore.

import { lumia, shared } from '@/lib/db'

/** Lo que se persiste en `pinConfig.algorithm`. */
export const ALGORITMO = 'PBKDF2-SHA-256'

/** §7.7.1 — Mínimo exigido. Se guarda con cada hash para poder elevarlo. */
export const ITERACIONES = 150000

/** Bytes de salt, distinto por usuario y por PIN. */
export const BYTES_SALT = 16

/** §5.8.2 — De cuatro a seis dígitos. Solo dígitos, teclado numérico. */
export const MIN_DIGITOS = 4
export const MAX_DIGITOS = 6

// ─── Formato del PIN ──────────────────────────────────────────────────────────

/** Se queda con los dígitos y corta al máximo. Sin avisar de lo que descarta. */
export function soloDigitos(texto) {
  return String(texto ?? '')
    .replace(/\D/g, '')
    .slice(0, MAX_DIGITOS)
}

export function esPinValido(pin) {
  return new RegExp(`^\\d{${MIN_DIGITOS},${MAX_DIGITOS}}$`).test(String(pin ?? ''))
}

// ─── Derivación ───────────────────────────────────────────────────────────────

function aHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function deHex(hex) {
  const pares = String(hex ?? '').match(/.{2}/g) ?? []
  return Uint8Array.from(pares.map((par) => parseInt(par, 16)))
}

function saltNuevo() {
  return aHex(crypto.getRandomValues(new Uint8Array(BYTES_SALT)))
}

/**
 * Deriva el hash de un PIN. Es la única función que ve el PIN en claro, y no lo
 * devuelve, no lo guarda y no lo registra en ningún sitio.
 */
async function derivar(pin, saltHex, iteraciones) {
  const clave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(String(pin)),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: deHex(saltHex), iterations: iteraciones, hash: 'SHA-256' },
    clave,
    256,
  )
  return aHex(new Uint8Array(bits))
}

/**
 * Comparación en tiempo constante. **Nunca `===` sobre las cadenas**: comparar
 * hashes con igualdad de cadenas corta en el primer byte distinto y filtra por
 * el reloj cuántos caracteres del principio eran correctos (§7.7.1).
 */
export function comparaIgual(a, b) {
  const uno = String(a ?? '')
  const otro = String(b ?? '')
  if (uno.length !== otro.length) return false
  let diferencia = 0
  for (let i = 0; i < uno.length; i += 1) {
    diferencia |= uno.charCodeAt(i) ^ otro.charCodeAt(i)
  }
  return diferencia === 0
}

/** El registro completo que se guarda. Ninguno de sus campos revela el PIN. */
export async function configDe(pin, iteraciones = ITERACIONES) {
  const salt = saltNuevo()
  return {
    salt,
    hash: await derivar(pin, salt, iteraciones),
    iterations: iteraciones,
    algorithm: ALGORITMO,
    enabled: true,
  }
}

// ─── Estado ───────────────────────────────────────────────────────────────────

/**
 * El método por el que se puede volver a reconocer a esta persona.
 *
 * RN-JR-PIN-02 / RN-SEC-PIN-01 — Sin uno, no puede existir un PIN: quedaría
 * bloqueada fuera de su propio journal de forma permanente.
 *
 * @returns {Promise<{tipo: 'email'|'phone', valor: string}|null>}
 */
export async function metodoDeRecuperacion(uid) {
  const registro = await shared.getAuthRecord(uid)
  const email = String(registro?.email ?? '').trim()
  if (email !== '') return { tipo: 'email', valor: email }
  const phone = String(registro?.phone ?? '').trim()
  if (phone !== '') return { tipo: 'phone', valor: phone }
  return null
}

/**
 * Todo lo que la interfaz necesita saber, en una lectura.
 *
 * `sinSalida` es el caso de RN-JR-PIN-02 que hay que avisar: hay PIN activo y
 * la cuenta se quedó sin método de recuperación. No se desactiva solo —eso
 * sería corregir en silencio (RN-DB4-08)—: se avisa y se deja elegir.
 */
export async function estadoPin(uid) {
  const [config, metodo] = await Promise.all([lumia.getPinConfig(uid), metodoDeRecuperacion(uid)])
  const activo = config?.enabled === true
  return {
    activo,
    metodo,
    puedeActivar: metodo !== null,
    sinSalida: activo && metodo === null,
  }
}

// ─── Alta, verificación y baja ────────────────────────────────────────────────

/**
 * Fija el PIN. Falla si la cuenta no tiene por dónde recuperarlo: es preferible
 * no poder activarlo a activarlo y perder el journal para siempre.
 */
export async function crearPin(uid, pin) {
  if (!esPinValido(pin)) return { ok: false, motivo: 'formato' }
  if ((await metodoDeRecuperacion(uid)) === null) return { ok: false, motivo: 'sin-metodo' }
  await lumia.savePinConfig(uid, await configDe(pin))
  return { ok: true }
}

/**
 * ¿Es este el PIN? Compara en tiempo constante contra el hash guardado.
 *
 * Si acierta con un número de iteraciones menor que el vigente, se rederiva y
 * se reescribe: así el listón se puede subir sin invalidar ningún PIN (§7.7.1).
 * Sin protección activa devuelve `true`: no hay puerta que abrir.
 */
export async function verificarPin(uid, pin) {
  const config = await lumia.getPinConfig(uid)
  if (config?.enabled !== true) return true
  if (!esPinValido(pin)) return false

  const candidato = await derivar(pin, config.salt, config.iterations)
  if (!comparaIgual(candidato, config.hash)) return false

  if (config.iterations < ITERACIONES) {
    await lumia.savePinConfig(uid, { ...(await configDe(pin)), enabled: true })
  }
  return true
}

/** Retira la protección. Exige el PIN vigente (§5.8.2). */
export async function desactivarPin(uid, pin) {
  if (!(await verificarPin(uid, pin))) return { ok: false, motivo: 'incorrecto' }
  await lumia.clearPinConfig(uid)
  return { ok: true }
}

// ─── Recuperación: "Olvidé mi PIN" ────────────────────────────────────────────

/**
 * Reautentica contra la cuenta de Firebase.
 *
 * **Desviación anotada.** §5.8.2 describe la reautenticación como "enlace por
 * correo o código SMS, según el método vinculado". `src/lib/firebase.js` solo
 * configura Google y Apple como proveedores: en este repositorio no existe ni
 * autenticación por correo y contraseña ni por teléfono, así que la
 * reautenticación real disponible es la del proveedor vinculado. El método de
 * `shared/auth` sigue siendo el que decide **si** se puede tener PIN
 * (RN-JR-PIN-02); el proveedor decide **cómo** se verifica.
 *
 * Mientras no exista el onboarding con sesión real —Fase 1 entra por
 * `SesionProvisional`, con un uid local— no hay sesión de Firebase que
 * reautenticar y esto devuelve `sin-sesion`. Se dice tal cual en pantalla en
 * vez de fingir una verificación que no ocurrió.
 *
 * @returns {Promise<{ok: boolean, motivo?: 'sin-metodo'|'sin-sesion'|'no-verificado'}>}
 */
export async function reautenticar(uid) {
  if ((await metodoDeRecuperacion(uid)) === null) return { ok: false, motivo: 'sin-metodo' }

  try {
    // Firebase se carga aquí y no arriba a propósito: el PIN **no es una
    // credencial de cuenta** (§7.7.1). No autentica contra ningún servidor, no
    // viaja por la red y no sirve para iniciar sesión. Que su módulo no
    // dependa de la capa de autenticación es esa misma frase, dicha en código.
    const [{ auth, appleProvider, googleProvider }, { reauthenticateWithPopup }] =
      await Promise.all([import('@/lib/firebase'), import('firebase/auth')])

    const usuario = auth?.currentUser ?? null
    if (!usuario) return { ok: false, motivo: 'sin-sesion' }

    const proveedor = usuario.providerData?.[0]?.providerId
    await reauthenticateWithPopup(
      usuario,
      proveedor === 'apple.com' ? appleProvider : googleProvider,
    )
    return { ok: true }
  } catch {
    return { ok: false, motivo: 'no-verificado' }
  }
}

/**
 * Fija un PIN nuevo tras una verificación correcta.
 *
 * **Ninguna entrada del Journal se pierde**: el PIN es una puerta, no una llave
 * del contenido, así que cambiarlo no puede destruir nada. El anterior se
 * descarta y el nuevo nace con salt nuevo y se rederiva por completo (§5.8.2).
 */
export async function reestablecerPin(uid, pin) {
  if (!esPinValido(pin)) return { ok: false, motivo: 'formato' }
  await lumia.savePinConfig(uid, await configDe(pin))
  return { ok: true }
}

/** Vincula un correo o un teléfono para poder tener PIN (`CuentaParaPin`). */
export async function vincularCuenta(uid, { email, phone }) {
  const registro = (await shared.getAuthRecord(uid)) ?? {}
  const patch = { ...registro, uid }
  if (email !== undefined) patch.email = String(email).trim() || null
  if (phone !== undefined) patch.phone = String(phone).trim() || null
  await shared.saveAuthRecord(uid, patch)
  return metodoDeRecuperacion(uid)
}
