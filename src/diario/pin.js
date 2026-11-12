// src/diario/pin.js
// Protección del Journal con PIN (§5.8.2 · §7.7.1).
//
// **Esto es un bloqueo de acceso al módulo, no una protección del contenido.**
// La limitación es la característica más importante de la funcionalidad y hay
// que entenderla literalmente: el PIN impide entrar al Journal desde la
// interfaz y nada más. Quien tenga el dispositivo y conocimientos técnicos
// puede leer IndexedDB directamente. Por eso el copy de este flujo no promete
// inviolabilidad de ninguna forma (§7.8), y por eso una prueba automática
// recorre `copy.diario.journal.pin` entero para comprobarlo.
//
// **El PIN nunca se guarda.** Se guarda su derivación: PBKDF2 con SHA-256, salt
// aleatorio de 16 bytes del generador criptográfico del navegador y ≥ 150.000
// iteraciones, que se persisten junto al hash para poder subirlas en el futuro
// sin invalidar los PIN existentes.
//
// RN-DB-04 — `diario/pinConfig` se escribe con `sync: false` y nunca sale del
// dispositivo. Es la única rama del árbol que no llega a Firestore.

import { diario, shared } from '@/lib/db'
import { esIPhone } from '@/lib/plataforma'

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
  const [config, metodo] = await Promise.all([diario.getPinConfig(uid), metodoDeRecuperacion(uid)])
  const activo = config?.enabled === true
  return {
    activo,
    metodo,
    puedeActivar: metodo !== null,
    sinSalida: activo && metodo === null,
    biometria: await estadoBiometria(config),
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
  // SPEC_23A (DP-23.12) — Un PIN nuevo nace sin Face ID: la clave se borra.
  await olvidarClave()
  await diario.savePinConfig(uid, await configDe(pin))
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
  const config = await diario.getPinConfig(uid)
  if (config?.enabled !== true) return true
  if (!esPinValido(pin)) return false

  const candidato = await derivar(pin, config.salt, config.iterations)
  if (!comparaIgual(candidato, config.hash)) return false

  if (config.iterations < ITERACIONES) {
    // SPEC_23A (DP-23.12) — Rederivar no es cambiar el PIN: Face ID se queda.
    const rederivado = { ...(await configDe(pin)), enabled: true }
    if (config.biometria) rederivado.biometria = config.biometria
    await diario.savePinConfig(uid, rederivado)
  }
  return true
}

/** Retira la protección. Exige el PIN vigente (§5.8.2). */
export async function desactivarPin(uid, pin) {
  if (!(await verificarPin(uid, pin))) return { ok: false, motivo: 'incorrecto' }
  await olvidarClave()
  await diario.clearPinConfig(uid)
  return { ok: true }
}

// ─── Recuperación: "Olvidé mi PIN" ────────────────────────────────────────────

/**
 * Reautentica contra la cuenta de Firebase.
 *
 * **Cómo se verifica lo decide el proveedor de la cuenta.** §5.8.2 describe la
 * reautenticación como "enlace por correo o código SMS, según el método
 * vinculado"; lo que hay es la reautenticación del proveedor con el que se
 * entró. El método de `shared/auth` sigue siendo el que decide **si** se puede
 * tener PIN (RN-JR-PIN-02); el proveedor decide **cómo** se verifica:
 *
 *   - **Correo y contraseña** (`password`, SPEC_19.2, DP-19.6): se pide la
 *     contraseña. Sin ella devuelve `pide-contrasena` —la pantalla muestra el
 *     campo y vuelve a llamar con ella— y con ella reautentica con
 *     `EmailAuthProvider.credential`. Es el camino de casi cualquier persona.
 *     **La contraseña no se guarda, no se registra y no sale de aquí** más que
 *     hacia Firebase: vive en el estado del componente que la pide.
 *   - **Google** y **Apple**: en web, por ventana emergente; en la app de
 *     iPhone, con la hoja nativa (SPEC_21.2 §4.6). Lo hace
 *     `reautenticarConProveedor`, en `lib/`, porque SPEC_24 la necesita para
 *     borrar la cuenta. Cerrar la hoja es `cancelado`: no es un error y la
 *     pantalla no dice nada.
 *
 * **El método es el de esta sesión** (`metodoDeSesion`, el `signInProvider`
 * del token), no `providerData[0]`: con más de un método en la cuenta, el
 * orden de esa lista no está garantizado.
 *
 * Sin sesión de Firebase —sin cuenta, o con la sesión vencida— no hay a quién
 * reautenticar y esto devuelve `sin-sesion`. Se dice tal cual en pantalla en
 * vez de fingir una verificación que no ocurrió.
 *
 * @param {string} uid
 * @param {object} [opciones]
 * @param {string} [opciones.contrasena] - solo con cuenta de correo.
 * @returns {Promise<{ok: boolean, motivo?: 'sin-metodo'|'sin-sesion'|'pide-contrasena'|'credenciales'|'sin-conexion'|'cancelado'|'no-verificado'}>}
 */
export async function reautenticar(uid, { contrasena } = {}) {
  if ((await metodoDeRecuperacion(uid)) === null) return { ok: false, motivo: 'sin-metodo' }

  try {
    // Firebase se carga aquí y no arriba a propósito: el PIN **no es una
    // credencial de cuenta** (§7.7.1). No autentica contra ningún servidor, no
    // viaja por la red y no sirve para iniciar sesión. Que su módulo no
    // dependa de la capa de autenticación es esa misma frase, dicha en código.
    const [
      { auth, appleProvider, googleProvider },
      { EmailAuthProvider, reauthenticateWithCredential },
      { metodoDeSesion, reautenticarConProveedor },
    ] = await Promise.all([
      import('@/lib/firebase'),
      import('firebase/auth'),
      import('@/lib/reautenticacion'),
    ])

    const usuario = auth?.currentUser ?? null
    if (!usuario) return { ok: false, motivo: 'sin-sesion' }

    const proveedor = await metodoDeSesion(usuario)
    if (proveedor === 'password') {
      if (!contrasena) return { ok: false, motivo: 'pide-contrasena' }
      await reauthenticateWithCredential(
        usuario,
        EmailAuthProvider.credential(usuario.email, contrasena),
      )
      return { ok: true }
    }

    await reautenticarConProveedor(usuario, proveedor, {
      proveedores: { appleProvider, googleProvider },
    })
    return { ok: true }
  } catch (error) {
    return { ok: false, motivo: await motivoDeReautenticacion(error) }
  }
}

/** Contraseña que no coincide: los tres códigos con que Firebase lo dice. */
const CODIGOS_DE_CREDENCIALES = new Set([
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
])

/** Cerrar la ventana emergente de Google o de Apple, en web. */
const CODIGOS_DE_CANCELACION = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
])

/**
 * Lo que puede salir mal al reautenticar, sin un solo código a la vista
 * (RN-EST-04). Qué es cancelar la hoja nativa lo sabe `credencialNativa`, y se
 * pregunta aquí dentro para no cargarlo antes de hacer falta.
 */
async function motivoDeReautenticacion(error) {
  const codigo = String(error?.code ?? '')
  const { esCancelacion } = await import('@/lib/credencialNativa')
  if (CODIGOS_DE_CANCELACION.has(codigo) || esCancelacion(error)) return 'cancelado'
  if (CODIGOS_DE_CREDENCIALES.has(codigo)) return 'credenciales'
  if (codigo === 'auth/network-request-failed') return 'sin-conexion'
  return 'no-verificado'
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
  await olvidarClave()
  await diario.savePinConfig(uid, await configDe(pin))
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

// ─── Face ID y Touch ID (SPEC_23A) ────────────────────────────────────────────
//
// **Otra forma de abrir la misma puerta, no un cifrado.** En la app de iPhone,
// quien protegió su journal con un PIN puede abrirlo con su cara. El PIN sigue
// siendo la puerta de siempre y el respaldo.
//
// **Qué hay en cada sitio** (DP-23.8): en la Keychain, una clave aleatoria de
// 32 bytes que iOS solo entrega tras reconocer la cara; en `pinConfig`, que
// nunca sale del teléfono, el SHA-256 de esa clave (`biometria.verificador`).
// Abrir es leer la clave, calcular su huella y compararla en tiempo constante.
// **El PIN no se copia ni llega a la Keychain.**
//
// **Cancelar e invalidar no se confunden, y sin adivinar** (SPEC_23 §9). Solo
// se lee la clave si hay verificador, y la app solo borra la clave a la vez que
// el verificador. Así, «la clave no está» con verificador solo puede ser que
// iOS la quitó: es `cambiada`. Cancelar, fallar o cualquier otra respuesta es
// volver al PIN sin mensaje y sin apagar nada.
//
// **En la web nada de esto existe**: `esIPhone()` es `false`, el plugin no se
// carga y el estado es siempre `apagada` y sin disponibilidad.

/** Cómo está Face ID para este journal. */
export const BIOMETRIA = Object.freeze({
  apagada: 'apagada',
  activa: 'activa',
  cambiada: 'cambiada',
})

/** Lo que dice la web, y el teléfono cuando no hay forma de saber más. */
const SIN_BIOMETRIA_EN_ESTE_TELEFONO = Object.freeze({
  estado: BIOMETRIA.apagada,
  disponible: false,
  tipo: null,
})

/** Sin biometría por estos motivos, una clave guardada ya no abre. */
const DEJAN_LA_CLAVE_SIN_ABRIR = new Set(['negado', 'sinCaras', 'sinCodigo'])

const BYTES_CLAVE = 32

/** El puente, solo en la app de iPhone y cargado al hacer falta. */
async function puente() {
  if (!esIPhone()) return null
  try {
    const { biometria } = await import('@/lib/biometria')
    return biometria
  } catch {
    return null
  }
}

/** Borra la clave de la Keychain. No pide la cara y nunca lanza. */
async function olvidarClave() {
  const b = await puente()
  if (b) await b.borrar()
}

function claveNueva() {
  return aHex(crypto.getRandomValues(new Uint8Array(BYTES_CLAVE)))
}

/** SHA-256 en hex: lo único de la clave que se guarda en `pinConfig`. */
export async function huellaDe(clave) {
  const bits = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(clave)))
  return aHex(new Uint8Array(bits))
}

function estadoDe(config) {
  if (config?.enabled !== true) return BIOMETRIA.apagada
  if (typeof config.biometria?.verificador === 'string') return BIOMETRIA.activa
  if (config.biometria?.cambiada === true) return BIOMETRIA.cambiada
  return BIOMETRIA.apagada
}

/** `pinConfig` sin `biometria`, para reescribirlo sin dejar restos. */
function sinBiometria(config) {
  const { biometria: _fuera, ...resto } = config
  return resto
}

/**
 * La clave huérfana (DP-23.15). Lo guardado en la Keychain sobrevive a borrar
 * la app y `pinConfig` no: tras reinstalar queda una clave sin dueño. Se
 * borra la primera vez que se encuentra, una vez por sesión. Ni mirar ni
 * borrar piden la cara.
 */
let huerfanaRevisada = false

async function limpiarHuerfana(b, config) {
  if (huerfanaRevisada) return
  if (typeof config?.biometria?.verificador === 'string') return
  huerfanaRevisada = true
  if ((await b.existe()) === true) await b.borrar()
}

/** Para las pruebas: que cada una empiece como una sesión nueva. */
export function olvidarRevisionDeHuerfana() {
  huerfanaRevisada = false
}

/**
 * Lo que la pantalla necesita de Face ID. `disponible` dice si el teléfono
 * tiene Face ID o Touch ID para Strivo; solo se pregunta con PIN activo, que
 * es cuando el interruptor puede existir.
 */
async function estadoBiometria(config) {
  const b = await puente()
  if (!b) return SIN_BIOMETRIA_EN_ESTE_TELEFONO
  await limpiarHuerfana(b, config)
  const estado = estadoDe(config)
  if (config?.enabled !== true) return { ...SIN_BIOMETRIA_EN_ESTE_TELEFONO, estado }
  const { disponible, tipo } = await b.disponibilidad()
  return { estado, disponible, tipo }
}

/** iOS invalidó la clave, o Strivo se quedó sin Face ID: se dice y se apaga. */
async function marcarCambiada(uid, b) {
  await b.borrar()
  const config = await diario.getPinConfig(uid)
  if (config?.enabled !== true) return
  await diario.savePinConfig(uid, { ...sinBiometria(config), biometria: { cambiada: true } })
}

/**
 * Activa Face ID (DP-23.10). Con el PIN correcto se genera la clave, se guarda
 * y **se lee una vez**, para que iOS pida la cara ahora (y la primera vez,
 * antes, su permiso). Solo si la cara responde se guarda el verificador.
 * Cancelar, fallar o negar el permiso dejan todo como estaba y la clave
 * borrada.
 *
 * @returns {Promise<{ok: boolean, motivo?: 'incorrecto'|'no-disponible'|'cancelado'}>}
 */
export async function activarBiometria(uid, pin, { motivo } = {}) {
  const b = await puente()
  if (!b) return { ok: false, motivo: 'no-disponible' }
  if (!(await verificarPin(uid, pin))) return { ok: false, motivo: 'incorrecto' }
  const config = await diario.getPinConfig(uid)
  if (config?.enabled !== true) return { ok: false, motivo: 'no-disponible' }

  const clave = claveNueva()
  if (!(await b.guardar(clave))) {
    await b.borrar()
    return { ok: false, motivo: 'no-disponible' }
  }
  const leida = await b.leer(motivo)
  if (!leida.ok || !comparaIgual(leida.clave, clave)) {
    await b.borrar()
    return { ok: false, motivo: 'cancelado' }
  }

  // Se relee: entre tanto, verificarPin pudo rederivar el PIN.
  const vigente = (await diario.getPinConfig(uid)) ?? config
  await diario.savePinConfig(uid, {
    ...sinBiometria(vigente),
    biometria: { verificador: await huellaDe(clave), activadaEn: new Date().toISOString() },
  })
  return { ok: true }
}

/** Apaga Face ID sin pedir el PIN: quitarlo reduce el acceso (SPEC_23 §9). */
export async function apagarBiometria(uid) {
  await olvidarClave()
  const config = await diario.getPinConfig(uid)
  if (config?.enabled === true && config.biometria) {
    await diario.savePinConfig(uid, sinBiometria(config))
  }
  return { ok: true }
}

/**
 * Abre con Face ID (DP-23.11 y DP-23.13). **Solo abre si el interruptor está
 * activo y la huella de la clave coincide con el verificador.**
 *
 * @returns {Promise<{ok: boolean, motivo?: 'apagada'|'cancelado'|'cambiada'}>}
 */
export async function abrirConBiometria(uid, { motivo } = {}) {
  const config = await diario.getPinConfig(uid)
  const verificador = config?.enabled === true ? config.biometria?.verificador : null
  if (typeof verificador !== 'string') return { ok: false, motivo: 'apagada' }
  const b = await puente()
  if (!b) return { ok: false, motivo: 'apagada' }

  const { disponible, motivo: porQue } = await b.disponibilidad()
  if (!disponible) {
    if (!DEJAN_LA_CLAVE_SIN_ABRIR.has(porQue)) return { ok: false, motivo: 'cancelado' }
    await marcarCambiada(uid, b)
    return { ok: false, motivo: 'cambiada' }
  }

  const leida = await b.leer(motivo)
  if (leida.ok) {
    if (comparaIgual(await huellaDe(leida.clave), verificador)) return { ok: true }
    // Una clave que no es la nuestra no abre nunca: se retira.
    await marcarCambiada(uid, b)
    return { ok: false, motivo: 'cambiada' }
  }
  if (leida.motivo === 'noEsta') {
    await marcarCambiada(uid, b)
    return { ok: false, motivo: 'cambiada' }
  }
  return { ok: false, motivo: 'cancelado' }
}
