// src/lib/borrarCuenta.js
// Borrar mi cuenta (SPEC_24B).
//
// **Nada se borra a medias.** Lo del teléfono no se toca hasta que la nube
// está vacía y la cuenta ya no existe, y un borrado interrumpido se termina o
// se repara (DP-24.12 y DP-24.13). El orden:
//
//   Antes de nada —si algo falla aquí, no se escribe la marca y «No se borró
//   nada»—: hay red, hay Firebase, la sesión es de esta cuenta, la
//   verificación pasó hace menos de cuatro minutos y este teléfono terminó de
//   bajar la cuenta (D6: es lo que deja a «Conservar mi cuenta» reconstruir la
//   nube entera).
//
//   1. La marca (`marcaDeBorrado.js`), fase `revocando`.
//   2. Se detienen la subida y la bajada de ese uid: la marca es el cerrojo de
//      `sync.js` y de `restaurar.js`; aquí se cancela el reintento y se espera
//      al vaciado en camino, con techo.
//   3. Con Apple, se revoca el token (`revocarApple.js`). **Si falla, «No se
//      borró nada»** y se quita la marca (D4): todavía no se tocó ni un
//      documento.
//   4. Fase `nube`: se enumera con la única lectora (`rutasEnLaNube`), se
//      borra por lotes de hasta 500 —Firestore aplica cada lote entero o
//      nada— y se vuelve a enumerar: tiene que salir cero.
//   5. Fase `cuenta`: `deleteUser`.
//   6. Fase `telefono`: el teléfono como recién instalado
//      (`limpiezaDelTelefono.js`), con la sesión de Google del SDK nativo.
//   7. Se quita la marca (va con las demás claves).
//
// **Desde la fase `nube`, cualquier fallo es «No pudimos terminar…»**: un lote
// que venció puede aplicarse después, así que ya no se puede prometer que no
// se borró nada. La marca se queda y lo local queda intacto.
//
// Los avisos se cancelan en la fase `telefono`, después de `deleteUser`: es
// lo del teléfono, y no necesita la sesión.
//
// **SPEC_25:** el cliente de RevenueCat se cierra también en la fase
// `telefono`. Lo pagado sigue ligado al Apple ID y vuelve con «Restaurar
// compras»; borrar su cliente pediría su llave secreta, que no va en la app.
//
// Nada de esto va a analítica (RN-07), ni el hecho de haber borrado.

import { copy } from '@copy'
import { LIMITE_DE_RED_MS, conLimite } from './db/limite.js'
import { cancelRetries, flushEnCurso } from './db/sync.js'
import {
  hayMarcaDeRestauracion,
  restaurar,
  rutasEnLaNube,
  rutasQueSeBorranSinLeer,
} from './db/restaurar.js'
import { reencolarTodo } from './db/local.js'
import {
  FASES,
  guardarMarcaDeBorrado,
  leerMarcaDeBorrado,
  quitarMarcaDeBorrado,
} from './db/marcaDeBorrado.js'
import { TECHO_DE_ESPERA_MS, conTecho } from './sesion.js'
import { esNativa } from './plataforma.js'
import { compras } from './compras.js'
import { vaciarTelefono } from './limpiezaDelTelefono.js'

/** Las pantallas del borrado (§6.4 del reporte previo). */
export const ESTADOS = Object.freeze({
  inicio: 'inicio',
  verificar: 'verificar',
  confirmar: 'confirmar',
  borrando: 'borrando',
  despedida: 'despedida',
  errorAntes: 'errorAntes',
  errorDurante: 'errorDurante',
  aMedias: 'aMedias',
  conservada: 'conservada',
})

/** Lo que vale una verificación: Apple caduca a los 5 min y Firebase pide sesión reciente. */
export const VALIDEZ_DE_VERIFICACION_MS = 4 * 60 * 1000

/** Lo que cabe en un lote de Firestore. */
export const TAMANO_DE_LOTE = 500

/** ¿Escribió BORRAR? Sin distinguir mayúsculas y sin los espacios de alrededor (DP-24.2). */
export function palabraCoincide(texto) {
  const palabra = copy.cuenta.borrar.palabra
  return (
    String(texto ?? '')
      .trim()
      .toLocaleUpperCase('es') === palabra
  )
}

/** ¿Sigue valiendo la verificación? */
export function verificacionVigente(verificacion, ahora = Date.now()) {
  return Boolean(verificacion?.en) && ahora - verificacion.en < VALIDEZ_DE_VERIFICACION_MS
}

// ─── Lo que ve el diagnóstico (VITE_DIAG_BORRADO) ───────────────────────────
//
// Un estado pequeño y sus oyentes. Sin el panel nadie escucha y nadie pone los
// dos ensayos, así que sin la bandera la app se porta exactamente igual.

const progreso = {
  fase: 'sinEmpezar',
  encontrados: 0,
  borrados: 0,
  lotes: 0,
  apple: 'noAplica',
}
const oyentes = new Set()
const ensayo = { fallarAntes: false, detenerDespues: false }

function anotar(cambios) {
  Object.assign(progreso, cambios)
  for (const fn of [...oyentes]) {
    try {
      fn({ ...progreso })
    } catch {
      // El panel no es asunto del borrado.
    }
  }
}

/** El progreso del borrado, para el diagnóstico. */
export function progresoDelBorrado() {
  return { ...progreso }
}

export function escucharBorrado(fn) {
  oyentes.add(fn)
  return () => oyentes.delete(fn)
}

/** Los dos ensayos del diagnóstico (DP-24.20). Solo los pone el panel. */
export function fijarEnsayo(cambios) {
  Object.assign(ensayo, cambios)
}

export function ensayoActual() {
  return { ...ensayo }
}

/** Para las pruebas. */
export function reiniciarBorradoParaPruebas() {
  Object.assign(progreso, {
    fase: 'sinEmpezar',
    encontrados: 0,
    borrados: 0,
    lotes: 0,
    apple: 'noAplica',
  })
  Object.assign(ensayo, { fallarAntes: false, detenerDespues: false })
  oyentes.clear()
}

// ─── El entorno ──────────────────────────────────────────────────────────────
//
// Todo lo que toca fuera de esta función, en un solo sitio y por defecto el
// de verdad. Las pruebas pasan dobles; la app, nada.

async function firebasePorDefecto() {
  const [{ auth, db }, firestore, firebaseAuth] = await Promise.all([
    import('./firebase.js'),
    import('firebase/firestore'),
    import('firebase/auth'),
  ])
  if (!auth || !db) return null
  return { auth, db, firestore, firebaseAuth }
}

const ENTORNO = Object.freeze({
  enLinea: () => typeof navigator === 'undefined' || navigator.onLine !== false,
  firebase: firebasePorDefecto,
  nativa: () => esNativa(),
  rutasEnLaNube: (uid, f) => rutasEnLaNube(uid, { handles: { db: f.db, ...f.firestore } }),
  restaurar: (uid) => restaurar(uid),
  hayMarcaDeRestauracion: (uid) => hayMarcaDeRestauracion(uid),
  revocar: async (datos) => (await import('./revocarApple.js')).revocarApple(datos),
  borrarUsuario: (f, usuario) => f.firebaseAuth.deleteUser(usuario),
  cerrarSesionNativa: async () => (await import('./credencialNativa.js')).cerrarSesionNativa(),
  cerrarCompras: () => compras.cerrar(),
  vaciarTelefono: () => vaciarTelefono(),
  detenerSubida: async () => {
    cancelRetries()
    const enCurso = flushEnCurso()
    if (enCurso) await conTecho(enCurso, TECHO_DE_ESPERA_MS)
  },
  limiteMs: LIMITE_DE_RED_MS,
  ahora: () => Date.now(),
})

function entornoCon(dobles) {
  return { ...ENTORNO, ...dobles }
}

/** El resultado de un borrado que no terminó. Sin un solo código a la vista. */
function fallo(estado) {
  return { ok: false, estado }
}

// ─── Borrar ──────────────────────────────────────────────────────────────────

/**
 * Las precondiciones, sin escribir nada. Exportada para que la pantalla pueda
 * decir «hace falta conexión» al tocar «Continuar», antes de verificar.
 */
export function hayConexion(dobles = {}) {
  return entornoCon(dobles).enLinea()
}

async function borrarLaNube(uid, f, e) {
  const { doc, writeBatch } = f.firestore
  const rutas = [...(await e.rutasEnLaNube(uid, f)), ...rutasQueSeBorranSinLeer(uid)]
  anotar({ encontrados: rutas.length, borrados: 0, lotes: 0 })
  for (let i = 0; i < rutas.length; i += TAMANO_DE_LOTE) {
    const lote = writeBatch(f.db)
    const parte = rutas.slice(i, i + TAMANO_DE_LOTE)
    for (const ruta of parte) lote.delete(doc(f.db, ruta))
    await conLimite(lote.commit(), e.limiteMs)
    anotar({ borrados: progreso.borrados + parte.length, lotes: progreso.lotes + 1 })
  }
  // La comprobación: tiene que quedar cero. Si no, no se sigue.
  const quedan = await e.rutasEnLaNube(uid, f)
  if (quedan.length > 0) throw new Error('quedan documentos en la nube')
}

/**
 * Borra la cuenta de esta sesión, en el orden de la cabecera.
 *
 * @param {string} uid - el de la sesión, que es el de la cuenta.
 * @param {object} opciones
 * @param {?{metodo: string, codigo?: ?string, en: number}} opciones.verificacion -
 *   la de esta misma pantalla (`reautenticarCuenta`).
 * @param {object} [opciones.dobles] - Existen para las pruebas.
 * @returns {Promise<{ok: true} | {ok: false, estado: string}>} `estado` es
 *   `necesitaConexion`, `reverificar`, `errorAntes`, `errorDurante` o
 *   `detenido` (el ensayo del diagnóstico).
 */
export async function borrarCuenta(uid, { verificacion, dobles = {} } = {}) {
  const e = entornoCon(dobles)
  const retomando = leerMarcaDeBorrado(uid) !== null

  // ─── Antes de nada: sin marca, «No se borró nada» ──────────────────────
  if (!e.enLinea()) return fallo('necesitaConexion')
  if (!verificacionVigente(verificacion, e.ahora())) return fallo('reverificar')

  let f
  try {
    f = await e.firebase()
  } catch {
    f = null
  }
  const usuario = f?.auth?.currentUser ?? null
  if (!f || !usuario || usuario.uid !== uid) return fallo(ESTADOS.errorAntes)

  // D6: este teléfono tiene que haber bajado la cuenta. Una cuenta creada aquí
  // la baja en un instante (no hay nada, o está lo que subió). Al retomar no
  // hace falta: la marca solo se escribió después de comprobarlo.
  if (!retomando && !e.hayMarcaDeRestauracion(uid)) {
    await conTecho(
      Promise.resolve(e.restaurar(uid)).catch(() => null),
      TECHO_DE_ESPERA_MS,
    )
    if (!e.hayMarcaDeRestauracion(uid)) return fallo(ESTADOS.errorAntes)
  }

  if (ensayo.fallarAntes) return fallo(ESTADOS.errorAntes)

  // ─── 1 y 2. La marca, y nada sube ni baja ──────────────────────────────
  const metodo = verificacion.metodo ?? leerMarcaDeBorrado(uid)?.metodo ?? null
  const marca = (fase) =>
    guardarMarcaDeBorrado(uid, { fase, metodo, desde: new Date(e.ahora()).toISOString() })

  marca('revocando')
  anotar({ fase: 'revocando', apple: 'noAplica' })
  await e.detenerSubida()

  // ─── 3. Apple: si falla, no se borró nada ──────────────────────────────
  if (metodo === 'apple.com') {
    try {
      const idToken = await usuario.getIdToken()
      await e.revocar({ codigo: verificacion.codigo, idToken, apiKey: f.auth.app?.options?.apiKey })
      anotar({ apple: 'revocado' })
    } catch {
      anotar({ apple: 'fallo', fase: 'sinEmpezar' })
      quitarMarcaDeBorrado(uid)
      return fallo(ESTADOS.errorAntes)
    }
  }

  // ─── 4. La nube ────────────────────────────────────────────────────────
  try {
    marca('nube')
    anotar({ fase: 'nube' })
    await borrarLaNube(uid, f, e)
  } catch {
    anotar({ fase: 'detenido' })
    return fallo(ESTADOS.errorDurante)
  }

  if (ensayo.detenerDespues) {
    anotar({ fase: 'detenido' })
    return fallo('detenido')
  }

  // ─── 5. La cuenta ──────────────────────────────────────────────────────
  const conProveedor = metodo === 'google.com' || metodo === 'apple.com'
  try {
    marca('cuenta')
    anotar({ fase: 'cuenta' })
    await conLimite(e.borrarUsuario(f, usuario), e.limiteMs)
  } catch {
    anotar({ fase: 'detenido' })
    return fallo(ESTADOS.errorDurante)
  }

  // ─── 6 y 7. El teléfono, como recién instalado ─────────────────────────
  await limpiarElTelefono(uid, { conProveedor, dobles })
  return { ok: true }
}

/**
 * La fase `telefono`: la de un borrado que acaba de terminar con la cuenta, y
 * la de una retoma que encuentra la cuenta ya borrada. La marca se va con las
 * demás claves al final.
 */
export async function limpiarElTelefono(uid, { conProveedor = false, dobles = {} } = {}) {
  const e = entornoCon(dobles)
  guardarMarcaDeBorrado(uid, { ...(leerMarcaDeBorrado(uid) ?? {}), fase: 'telefono' })
  anotar({ fase: 'telefono' })
  // La sesión de Google del SDK nativo: solo si se entró con un proveedor (sin
  // `GoogleService-Info.plist`, su `signOut` cerraría la app; ver cuenta.js).
  if (conProveedor && e.nativa()) await e.cerrarSesionNativa()
  await e.cerrarCompras()
  await e.vaciarTelefono()
  quitarMarcaDeBorrado(uid)
  anotar({ fase: 'terminado' })
}

// ─── Al abrir la app con la marca puesta (DP-24.13) ─────────────────────────

/**
 * Qué hacer al arrancar con una marca de borrado.
 *
 *   - `null`: no hay marca.
 *   - `limpiar`: la cuenta ya no existe —la fase `telefono`, o `cuenta` sin
 *     usuario—: se limpia el teléfono y se despide.
 *   - `aMedias`: la cuenta seguramente existe y la nube puede estar a medias.
 *     `sinSesion` cuando no hay usuario de esta cuenta (D12): limpiar ahí
 *     perdería lo único que queda, así que se pide entrar antes.
 *
 * @param {string} uid - el guardado en el teléfono.
 * @param {?{uid: string}} usuario - el de Firebase tras `authStateReady`.
 */
export function queHacerAlArrancar(uid, usuario) {
  const marca = leerMarcaDeBorrado(uid)
  if (!marca) return null
  const conSesion = Boolean(usuario) && usuario.uid === uid
  const fase = FASES.includes(marca.fase) ? marca.fase : 'revocando'
  if (fase === 'telefono' || (fase === 'cuenta' && !conSesion)) {
    return { accion: 'limpiar', marca }
  }
  return { accion: 'aMedias', sinSesion: !conSesion, marca }
}

/**
 * «Conservar mi cuenta»: todo lo de este teléfono vuelve a la cola para que la
 * nube se reconstruya, se quita la marca y la subida se reanuda. Pide la
 * sesión de esta cuenta: sin ella las reglas de Firestore no dejarían subir.
 *
 * @returns {Promise<{ok: boolean, encoladas?: number, estado?: string}>}
 */
export async function conservarCuenta(uid, { dobles = {} } = {}) {
  const e = entornoCon(dobles)
  let f
  try {
    f = await e.firebase()
  } catch {
    f = null
  }
  const usuario = f?.auth?.currentUser ?? null
  if (!usuario || usuario.uid !== uid) return fallo(ESTADOS.errorDurante)
  const encoladas = await reencolarTodo(uid)
  quitarMarcaDeBorrado(uid)
  anotar({ fase: 'sinEmpezar' })
  return { ok: true, encoladas }
}

/**
 * D12 — Entrar para retomar, con el método que guardó la marca. Cuenta como
 * la verificación del borrado (con Apple trae el código para revocar).
 *
 * @param {string} uid - el de la marca: entrar a otra cuenta no vale.
 * @param {object} datos
 * @param {string} datos.metodo
 * @param {?string} [datos.correo]
 * @param {?string} [datos.contrasena]
 * @returns {Promise<{ok: boolean, motivo?: string, verificacion?: object}>}
 */
export async function entrarParaRetomar(uid, { metodo, correo, contrasena }, { dobles = {} } = {}) {
  const e = entornoCon(dobles)
  const f = await e.firebase().catch(() => null)
  if (!f) return { ok: false, motivo: 'no-verificado' }
  try {
    const fa = f.firebaseAuth
    let codigo
    if (metodo === 'password') {
      if (!contrasena) return { ok: false, motivo: 'pide-contrasena' }
      await fa.signInWithEmailAndPassword(f.auth, correo ?? '', contrasena)
    } else if (e.nativa()) {
      const { credencialNativa } = await import('./credencialNativa.js')
      const apple = metodo === 'apple.com'
      const r = await credencialNativa(apple ? 'apple' : 'google', { conCodigo: apple })
      const credencial = apple ? r.credencial : r
      codigo = apple ? r.codigo : undefined
      await fa.signInWithCredential(f.auth, credencial)
    } else {
      const { appleProvider, googleProvider } = await import('./firebase.js')
      await fa.signInWithPopup(f.auth, metodo === 'apple.com' ? appleProvider : googleProvider)
    }
    if (f.auth.currentUser?.uid !== uid) {
      await fa.signOut(f.auth).catch(() => {})
      return { ok: false, motivo: 'no-verificado' }
    }
    return { ok: true, verificacion: { metodo, codigo, en: e.ahora() } }
  } catch (error) {
    const { motivoDeReautenticacion } = await import('./reautenticacion.js')
    return { ok: false, motivo: motivoDeReautenticacion(error) }
  }
}
