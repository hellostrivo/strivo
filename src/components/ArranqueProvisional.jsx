// src/components/ArranqueProvisional.jsx
//
// ⚠ PROVISIONAL en lo que queda de él: sigue siendo el andamio que resuelve un
// uid y monta el árbol. Lo que sí existe ya —desde F-1B— es el onboarding, y se
// interpone justo después de esto: `App.jsx` pregunta al árbol si queda
// pendiente y decide qué montar.
//
// Antes se llamaba `SesionProvisional` y se montaba una vez por pestaña, lo que
// lo hacía parecer parte de la navegación. SPEC_11 retiró los dos conmutadores
// provisionales de la barra, pero esto no es navegación: es el arranque de
// sesión. Resuelve un uid y, si el árbol de `users/{uid}/` no existe, lo crea.
//
// **Ya no pregunta nada.** Hasta el 24 de agosto de 2026 condicionaba el
// arranque de la app a que existiera una identidad central: montaba
// un editor de identidad y no dejaba pasar hasta escribirla, porque una regla
// del alcance anterior exigía que esa identidad existiera desde el primer
// momento. Al replegarse ese alcance la regla desaparece con él, y con ella la
// única pantalla que este andamio llegó a tener. Lo que queda es lo que siempre fue su trabajo: un uid y un
// árbol.
//
// RN-DB4-08 se sigue cumpliendo, y por eso el árbol se crea sin pedir nada en
// vez de inventarse un dato: `initShared` siembra el perfil con `name: null` y
// los valores de fábrica de §C5.2, ninguno de los cuales dice nada sobre quien
// abre la app. El nombre lo pregunta el onboarding (P2), y el árbol recién
// sembrado es exactamente lo que ese recorrido viene a rellenar.
//
// **El uid puede cambiar mientras la app está abierta**: al entrar a una cuenta
// en P7 o desde Tu perfil, y al salir. Por eso el uid es estado y no una
// constante, y por eso quien lo guarda en `localStorage` es este archivo y
// solo este: dos sitios escribiendo esa clave son dos sesiones distintas al
// siguiente arranque. Desde SPEC_19.2 nadie más pide cambiarlo: P7 y Tu perfil
// entran los dos por `pasarACuenta` (`conectarCuenta` en el contexto).
//
// **Desde SPEC_17A también arranca la nube, en las dos direcciones.** Con una
// cuenta pone en marcha la cola de subida (`startSync`) y, antes de sembrar
// nada, baja lo que esa cuenta tenga en Firestore (`prepararArbol`). El orden
// importa y está explicado allí: restaurar primero, sembrar solo si después
// sigue sin haber árbol. Mientras baja, el velo lleva una frase; si falla, se
// entra igual y el reintento vive en Tu perfil.
//
// **Desde SPEC_19.1, "hay cuenta" lo dice Firebase y no el uid** (1 oct 2026).
// Al montar se espera a la sesión que Firebase tenía guardada —una lectura
// local, dentro del velo de siempre— y se cruza con `strivo.uid.local` según la
// tabla de `resolverSesion` (`lib/sesion`). De ahí salen los cuatro estados:
// `sinConfigurar`, `sinCuenta`, `conCuenta` y `vencida`. La cola y la
// restauración solo corren con `conCuenta`; con la sesión vencida no se borra
// ni se bloquea nada —se lee y se escribe en local como siempre— y lo escrito
// sube cuando la persona vuelve a entrar. Si Firebase tiene un usuario y
// `localStorage` otro uid, se entra a esa cuenta desde el uid guardado con el
// algoritmo de `entrarACuenta`, con la frase de restauración delante.
//
// Mientras la app está abierta, `onAuthStateChanged` sigue escuchando: si el
// usuario desaparece sin que nadie haya cerrado sesión, el estado pasa a
// `vencida` y no se borra nada.
//
// **La sesión se ofrece por contexto** (`useSesion`, `lib/useSesion`): Tu
// perfil la lee para entrar, crear y salir, y `Entrada` para releer la puerta
// del onboarding cuando termina una restauración (`selloRestauracion`). El
// estado vive aquí y no en un proveedor aparte porque casi todo él es decidir
// qué uid va en `strivo.uid.local`, y este sigue siendo el único sitio que lo
// escribe: P7, entrar desde Perfil y salir pasan todos por aquí.
//
// **La restauración del arranque se evalúa una sola vez por sesión, al
// montar.** Entrar después a una cuenta que ya existía —desde P7 o desde Tu
// perfil— también baja lo de esa cuenta, pero lo hace `entrarACuenta`, antes de
// cambiar de uid. Una cuenta recién creada no tiene nada que bajar: adopta el
// árbol y la cola se rearranca con el uid nuevo.
//
// **Por qué no se retira:** sin él no hay uid ni sesión, y la app no arranca.
// Sigue siendo un andamio.
//
// Se monta **una sola vez, en la raíz**, por encima de la navegación y dentro
// del router, que es lo que le deja volver a Hoy al cerrar sesión.

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  alTerminarRestauracion,
  hayMarcaDeRestauracion,
  restaurar,
  shared,
  startSync,
} from '@/lib/db'
import {
  ESTADOS_SESION,
  escucharUsuario,
  leerSesionGuardada,
  prepararArbol,
  resolverSesion,
} from '@lib/sesion'
import {
  completarMudanzaPendiente,
  entrarACuenta,
  escucharMudanzasPendientes,
  mudanzaPendiente,
  reintentarEntradaAlVolverLaRed,
} from '@lib/entradaCuenta'
import { SALIDA, comprobarSalida as comprobarCola, salirDeCuenta } from '@lib/salidaCuenta'
import {
  MOTIVOS,
  adoptarArbol,
  crearConCorreo,
  entrarConCorreo,
  entrarConProveedor as abrirConProveedor,
} from '@lib/cuenta'
import { ContextoSesion } from '@lib/useSesion'
import { momentoDe } from '@lib/timeSlot'
import { copy } from '@copy'
import { CLAVE_UID, guardarClave, leerClave } from '@/lib/db/clavesDelTelefono'
import { hayMarcaDeBorrado } from '@/lib/db/marcaDeBorrado'
import { flush } from '@/lib/db/sync'
import { cruzarUmbral } from '@lib/umbralSesion'
import { esIPhone } from '@lib/plataforma'
import { anotarPaso, cola } from '@lib/suscripcion/diagnostico'
import Despedida from '@components/perfil/Despedida'

// SPEC_24 — La pantalla «a medio borrar» solo existe si un borrado se
// interrumpió: se carga bajo demanda.
const CapaDeBorrado = lazy(() => import('@components/perfil/CapaDeBorrado'))

/** `lib/borrarCuenta.js`, bajo demanda: solo hace falta al borrar o al retomar. */
const cargarBorrado = () => import('@lib/borrarCuenta')

function acunarUidLocal() {
  return `local-${crypto.randomUUID()}`
}

// Por `clavesDelTelefono` y no con `localStorage` a mano (SPEC_17B, DP-17B.4):
// en la app nativa cada escritura deja una copia en SQLite, y al arrancar
// `prepararAlmacen` la devuelve a `localStorage` antes de que esto se lea. Sin
// eso, un almacén del WebView limpiado por iOS acuñaría un uid nuevo y el
// diario quedaría en SQLite bajo un uid que nadie lee.
function uidLocal() {
  let uid = leerClave(CLAVE_UID)
  if (!uid) {
    uid = acunarUidLocal()
    guardarClave(CLAVE_UID, uid)
  }
  return uid
}

/**
 * La sesión al montar: lo que dice Firebase contra lo que dice `localStorage`.
 * Si no coinciden y hay usuario (fila 3), se entra a su cuenta desde el uid
 * guardado. Devuelve el uid con el que se sigue, que es el de la cuenta salvo
 * que la mudanza misma fallara.
 */
async function resolverArranque(uidGuardado, enRestauracion) {
  const { configurado, usuario } = await leerSesionGuardada()
  // SPEC_24 (DP-24.13): un borrado que se interrumpió manda sobre todo lo
  // demás. Ni se entra a la cuenta —restauraría y mudaría— ni se decide nada
  // antes de terminar o reparar.
  if (hayMarcaDeBorrado(uidGuardado)) {
    const { queHacerAlArrancar } = await cargarBorrado()
    const retoma = queHacerAlArrancar(uidGuardado, usuario)
    if (retoma) return { configurado, usuario, uid: uidGuardado, entro: false, retoma }
  }
  const { uid, requiereEntrada } = resolverSesion({ configurado, usuario, uidGuardado })
  if (!requiereEntrada) return { configurado, usuario, uid, entro: false }
  const entrada = await entrarACuenta(requiereEntrada, usuario, { enRestauracion })
  return { configurado, usuario, uid: entrada.uid, entro: true, entrada }
}

/**
 * El estado con la app abierta. Es la tabla de siempre, con un matiz: un
 * usuario de Firebase con otro uid vigente es el instante entre iniciar sesión
 * y mudar el árbol —P7 y Tu perfil inician sesión y después mudan—, así que mientras el
 * uid no cambie manda el uid, como si no hubiera usuario.
 */
function estadoVivo(configurado, usuario, uid) {
  const r = resolverSesion({ configurado, usuario, uidGuardado: uid })
  if (!r.requiereEntrada) return r.estado
  return resolverSesion({ configurado, usuario: null, uidGuardado: uid }).estado
}

export default function ArranqueProvisional({ children }) {
  const navegar = useNavigate()
  const [uid, setUid] = useState(uidLocal)
  const [configurado, setConfigurado] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [sesionResuelta, setSesionResuelta] = useState(false)
  const [listo, setListo] = useState(false)
  const [restaurando, setRestaurando] = useState(false)
  // Entrar a una cuenta existente o salir: el velo tapa mientras el uid cambia
  // de manos, para que nada se pinte con un árbol a medio mudar.
  const [cambiando, setCambiando] = useState(false)
  const [selloRestauracion, setSelloRestauracion] = useState(0)
  // SPEC_24 — Un borrado interrumpido al arrancar (`{ accion, sinSesion,
  // marca }`), la despedida, y un sello para que la subida vuelva a arrancar
  // tras «Conservar mi cuenta».
  const [retoma, setRetoma] = useState(null)
  const [despedida, setDespedida] = useState(false)
  const [selloBorrado, setSelloBorrado] = useState(0)
  // La verificación del borrado: solo en memoria, y vale cuatro minutos.
  const verificacionDeBorrado = useRef(null)

  const estado = estadoVivo(configurado, usuario, uid)

  // Una sola evaluación de la restauración por sesión (§4.4). Se marca al
  // primer arranque sea cual sea el uid: así el cambio de uid en P7 encuentra
  // la pregunta ya contestada y no restaura a mitad del onboarding.
  const arranqueEvaluado = useRef(false)

  // La promesa del arranque. Vive en una referencia, que sobrevive al doble
  // montaje de `StrictMode`: las dos pasadas esperan la misma resolución y no
  // hay dos entradas a cuenta a la vez.
  const arranque = useRef(null)
  const entroAlArrancar = useRef(false)

  // El uid vigente para quien no se vuelve a crear en cada render: el oyente
  // de la restauración y las acciones del contexto.
  const uidVigente = useRef(uid)

  // El correo de la sesión, para la mudanza que se complete por detrás.
  const correoVigente = useRef(null)
  correoVigente.current = usuario?.email ?? null

  // El oyente del reintento al volver la red, si la restauración —la del
  // arranque, o la de una entrada a cuenta (F3)— falló por eso. Uno a la vez:
  // poner otro retira el anterior. Se retira también al desmontar y al salir.
  const quitarOyenteRed = useRef(null)
  const ponerOyenteRed = useCallback((quitar) => {
    if (!quitar) return
    quitarOyenteRed.current?.()
    quitarOyenteRed.current = quitar
  }, [])
  const retirarOyenteRed = useCallback(() => {
    quitarOyenteRed.current?.()
    quitarOyenteRed.current = null
  }, [])

  /** El único sitio que escribe `strivo.uid.local`, además de `uidLocal`. */
  const fijarUid = useCallback((nuevo) => {
    anotarPaso(`sesión: uid ${cola(uidVigente.current)} → ${cola(nuevo)}`)
    guardarClave(CLAVE_UID, nuevo)
    uidVigente.current = nuevo
    setUid(nuevo)
  }, [])

  // ─── Al montar: qué sesión hay ──────────────────────────────────────────
  useEffect(() => {
    let vigente = true
    if (!arranque.current) arranque.current = resolverArranque(uid, setRestaurando)
    arranque.current.then((r) => {
      if (!vigente) return
      entroAlArrancar.current = r.entro
      if (r.retoma) setRetoma(r.retoma)
      if (r.entro) ponerOyenteRed(reintentarEntradaAlVolverLaRed(r.entrada, r.usuario.uid))
      if (r.uid !== uidVigente.current) fijarUid(r.uid)
      setConfigurado(r.configurado)
      setUsuario(r.usuario)
      setSesionResuelta(true)
    })
    return () => {
      vigente = false
    }
    // Solo al montar: el uid de después lo decide quien lo cambia.
  }, [])

  // ─── El árbol del uid vigente ───────────────────────────────────────────
  useEffect(() => {
    if (!sesionResuelta) return undefined
    let vigente = true

    async function arrancar() {
      // Solo el primer arranque de la sesión pregunta por la restauración, y no
      // si al arrancar ya se entró a una cuenta: `entrarACuenta` acaba de
      // restaurar. Un cambio de uid vuelve a pasar por aquí para sembrar si
      // hiciera falta y nada más.
      const primero = !arranqueEvaluado.current
      arranqueEvaluado.current = true

      // El perfil es la primera rama que escribe `initShared`, así que su
      // ausencia es la señal de que el árbol no existe. `prepararArbol` mira
      // eso mismo para decidir si restaura, y siembra solo después: es `shared/`
      // con sus cuatro ramas y un `diario/` que nace vacío a propósito, porque
      // un día en blanco sería un registro que nadie escribió (RN-DB4-08).
      const { quitarOyente } = await prepararArbol(uid, {
        conCuenta: estado === ESTADOS_SESION.conCuenta,
        enRestauracion: primero ? (activa) => vigente && setRestaurando(activa) : undefined,
        restaurarSiHaceFalta: primero && !entroAlArrancar.current,
      })
      ponerOyenteRed(quitarOyente)

      // Una entrada a esta cuenta dejó la mudanza aplazada y la restauración
      // ya terminó bien en algún momento —la marca está—: se completa ahora,
      // antes de pintar. Si la restauración acaba de correr aquí, el oyente de
      // abajo ya la está haciendo y esto recibe la misma promesa.
      if (
        estado === ESTADOS_SESION.conCuenta &&
        hayMarcaDeRestauracion(uid) &&
        mudanzaPendiente(uid)
      ) {
        const mudanza = await completarMudanzaPendiente(uid, {
          email: correoVigente.current,
        }).catch(() => null)
        if (mudanza && vigente) setSelloRestauracion((n) => n + 1)
      }

      if (vigente) setListo(true)
    }

    arrancar()

    return () => {
      vigente = false
    }
    // `estado` se lee en el momento: lo que cambia el árbol es el uid.
  }, [uid, sesionResuelta])

  // La cola de subida acompaña a la sesión con cuenta: arranca con ella, se
  // rearranca si cambia el uid y se detiene en cuanto deja de haber cuenta
  // —vencida, o al salir—, porque las reglas de Firestore no dejarían subir.
  // `startSync` devuelve su limpieza, que retira los oyentes de red y de
  // visibilidad y cancela el reintento pendiente.
  useEffect(() => {
    if (estado !== ESTADOS_SESION.conCuenta) return undefined
    return startSync(uid)
    // `selloBorrado`: tras «Conservar mi cuenta», con la marca ya quitada,
    // la subida vuelve a arrancar (con la marca puesta, `startSync` no hace nada).
  }, [estado, uid, selloBorrado])

  // Firebase sigue hablando con la app abierta. Un usuario que pasa a `null`
  // sin que nadie haya llamado a `salir` deja la sesión en `vencida`: lo dice
  // `estadoVivo` solo, y no se borra nada.
  useEffect(() => {
    if (!sesionResuelta || !configurado) return undefined
    let vigente = true
    let quitar = null
    escucharUsuario((nuevo) => vigente && setUsuario(nuevo)).then((q) => {
      if (vigente) quitar = q
      else q()
    })
    return () => {
      vigente = false
      quitar?.()
    }
  }, [sesionResuelta, configurado])

  // El sello: cada restauración del uid vigente que termina, también la que
  // cruzó el techo y la del reintento al volver la red (DP-17.11, DP-17.14).
  useEffect(
    () =>
      alTerminarRestauracion((uidRestaurado) => {
        if (uidRestaurado === uidVigente.current) setSelloRestauracion((n) => n + 1)
      }),
    [],
  )

  // La mudanza aplazada de una entrada a cuenta se completa cuando una
  // restauración de esa cuenta termina bien (F1). Al terminar, el sello sube
  // para que la pantalla relea lo que acaba de llegar.
  useEffect(
    () =>
      escucharMudanzasPendientes({
        correo: () => correoVigente.current,
        alMudar: (uidCuenta) => {
          if (uidCuenta === uidVigente.current) setSelloRestauracion((n) => n + 1)
        },
      }),
    [],
  )

  useEffect(() => () => quitarOyenteRed.current?.(), [])

  // ─── Entrar, crear y salir (P7 y Tu perfil) ─────────────────────────────

  /**
   * Con la cuenta ya abierta en Firebase, lleva la sesión a ella. Es el único
   * camino a una cuenta: Tu perfil lo usa por `entrar`, `crear` y
   * `entrarConProveedor`, y P7 por `conectarCuenta` (SPEC_19.2).
   *
   * La misma cuenta que estaba vencida solo recupera la sesión. Una cuenta
   * recién creada adopta el árbol (`adoptarArbol`). Una que ya existía pasa por
   * `entrarACuenta`, con el velo y la frase de restauración. Si la mudanza
   * falla, la sesión se queda en el uid de siempre y se dice con la frase
   * genérica: lo escrito sigue donde estaba.
   */
  const pasarACuenta = useCallback(
    async (cuenta) => {
      const origen = uidVigente.current
      const datos = { uid: cuenta.uid, email: cuenta.email ?? null }
      anotarPaso(
        `sesión: entrar a ${cola(cuenta.uid)} · cuenta ${cuenta.nueva ? 'nueva' : 'que ya existía'}`,
      )
      if (cuenta.uid === origen) {
        setUsuario(datos)
        return { ok: true }
      }

      let nuevo
      if (cuenta.nueva) {
        nuevo = await adoptarArbol(origen, datos)
      } else {
        setCambiando(true)
        const entrada = await entrarACuenta(origen, datos, { enRestauracion: setRestaurando })
        ponerOyenteRed(reintentarEntradaAlVolverLaRed(entrada, cuenta.uid))
        nuevo = entrada.uid
      }
      if (nuevo !== cuenta.uid) {
        setCambiando(false)
        return { ok: false, motivo: MOTIVOS.generico }
      }
      await prepararArbol(nuevo, { conCuenta: true, restaurarSiHaceFalta: false })
      setUsuario(datos)
      fijarUid(nuevo)
      setCambiando(false)
      return { ok: true }
    },
    [fijarUid, ponerOyenteRed],
  )

  const entrar = useCallback(
    async (correo, contrasena) => {
      const r = await entrarConCorreo(correo, contrasena)
      return r.ok ? pasarACuenta({ ...r, nueva: false }) : r
    },
    [pasarACuenta],
  )

  const crear = useCallback(
    async (correo, contrasena) => {
      const r = await crearConCorreo(correo, contrasena)
      return r.ok ? pasarACuenta(r) : r
    },
    [pasarACuenta],
  )

  /**
   * Entra con el proveedor que se tocó: Google o Apple (SPEC_21.2). Antes Tu
   * perfil entraba con Google tocara quien tocara el botón.
   */
  const entrarConProveedor = useCallback(
    async (cual) => {
      const r = await abrirConProveedor(cual)
      return r.ok ? pasarACuenta(r) : r
    },
    [pasarACuenta],
  )

  /**
   * Vuelve a intentar bajar lo de la cuenta cuando una entrada la dejó con la
   * mudanza pendiente (SPEC_30, D30-7). Es el botón de la vista de entrar del
   * onboarding, no el evento de la red: por eso no reutiliza
   * `reintentarEntradaAlVolverLaRed`.
   *
   * **Solo restaura.** Si termina bien, el oyente de mudanzas completa la
   * mudanza y el sello relee la puerta, como al volver la red. Sin mudanza
   * pendiente no hay nada que traer y no toca nada.
   */
  const reintentarRestauracion = useCallback(async () => {
    const cuenta = uidVigente.current
    if (!mudanzaPendiente(cuenta)) return { ok: true }
    const r = await restaurar(cuenta).catch(() => null)
    return { ok: r?.ok === true }
  }, [])

  /** ¿Se puede salir ya, o queda algo por subir? Intenta subirlo antes de contestar. */
  const comprobarSalida = useCallback(() => comprobarCola(uidVigente.current), [])

  /**
   * Cierra la sesión: con la cola vacía, `salirDeCuenta` cierra Firebase y
   * borra lo del uid; aquí se acuña uno local nuevo, se siembra su árbol y se
   * vuelve a Hoy, donde `Entrada` encontrará el onboarding pendiente. Es lo
   * que necesita la siguiente persona en un teléfono compartido (DP-19.1).
   */
  const salir = useCallback(async () => {
    const origen = uidVigente.current
    if ((await comprobarCola(origen)) !== SALIDA.libre) {
      return { ok: false, motivo: SALIDA.pendiente }
    }

    anotarPaso(`sesión: cerrar sesión de ${cola(origen)}`)
    setCambiando(true)
    retirarOyenteRed()
    const r = await salirDeCuenta(origen)
    if (!r.ok) {
      setCambiando(false)
      return r
    }
    const nuevo = acunarUidLocal()
    await prepararArbol(nuevo)
    setUsuario(null)
    fijarUid(nuevo)
    navegar('/hoy', { replace: true })
    setCambiando(false)
    return r
  }, [fijarUid, navegar, retirarOyenteRed])

  // ─── Borrar la cuenta (SPEC_24B) ────────────────────────────────────────

  /**
   * Después de borrar, como al cerrar sesión: uid local nuevo, árbol sembrado y
   * a Hoy, donde `Entrada` encontrará el onboarding. Antes, la despedida, y el
   * umbral se da por cruzado: «Cerrar» lleva a P1 sin el video (DP-24.19).
   */
  const empezarDeCero = useCallback(async () => {
    cruzarUmbral('diario')
    setDespedida(true)
    setRetoma(null)
    retirarOyenteRed()
    const nuevo = acunarUidLocal()
    await prepararArbol(nuevo)
    setUsuario(null)
    fijarUid(nuevo)
  }, [fijarUid, retirarOyenteRed])

  // Al arrancar con la cuenta ya borrada: se termina la limpieza y se despide.
  useEffect(() => {
    if (!listo || retoma?.accion !== 'limpiar') return
    let vigente = true
    cargarBorrado()
      .then(({ limpiarElTelefono }) => limpiarElTelefono(uidVigente.current))
      .catch(() => {})
      .then(() => vigente && empezarDeCero())
    return () => {
      vigente = false
    }
  }, [listo, retoma, empezarDeCero])

  const hayConexionParaBorrar = useCallback(
    () => typeof navigator === 'undefined' || navigator.onLine !== false,
    [],
  )

  /** Con qué hay que verificarse: el de la sesión, o el de la marca sin sesión (D12). */
  const metodoParaBorrar = useCallback(async () => {
    if (retoma?.sinSesion) return retoma.marca?.metodo ?? 'password'
    try {
      const [{ auth }, { metodoDeSesion }] = await Promise.all([
        import('@lib/firebase'),
        import('@lib/reautenticacion'),
      ])
      return (await metodoDeSesion(auth?.currentUser ?? null)) ?? 'password'
    } catch {
      return 'password'
    }
  }, [retoma])

  const verificadaParaBorrar = useCallback(
    () =>
      verificacionDeBorrado.current !== null &&
      Date.now() - verificacionDeBorrado.current.en < 4 * 60 * 1000,
    [],
  )

  /**
   * Verificar para borrar. Con sesión, `reautenticarCuenta` (con Apple, trae el
   * código para revocar). Sin sesión (D12), entrar con el método de la marca.
   */
  const verificarParaBorrar = useCallback(
    async ({ contrasena } = {}) => {
      if (retoma?.sinSesion && !verificadaParaBorrar()) {
        const { entrarParaRetomar } = await cargarBorrado()
        const registro = await shared.getAuthRecord(uidVigente.current).catch(() => null)
        const r = await entrarParaRetomar(uidVigente.current, {
          metodo: retoma.marca?.metodo ?? 'password',
          correo: registro?.email ?? null,
          contrasena,
        })
        if (!r.ok) return r
        verificacionDeBorrado.current = r.verificacion
        setUsuario({ uid: uidVigente.current, email: registro?.email ?? null })
        return { ok: true }
      }
      const { reautenticarCuenta } = await import('@lib/reautenticacion')
      const r = await reautenticarCuenta({ contrasena, conCodigoDeApple: true })
      if (!r.ok) return r
      verificacionDeBorrado.current = { metodo: r.metodo, codigo: r.codigo ?? null, en: Date.now() }
      return { ok: true }
    },
    [retoma, verificadaParaBorrar],
  )

  const borrarCuentaDeSesion = useCallback(async () => {
    const { borrarCuenta } = await cargarBorrado()
    const r = await borrarCuenta(uidVigente.current, {
      verificacion: verificacionDeBorrado.current,
    })
    if (r.estado === 'reverificar') verificacionDeBorrado.current = null
    if (!r.ok) return r
    verificacionDeBorrado.current = null
    await empezarDeCero()
    return r
  }, [empezarDeCero])

  const conservarCuentaDeSesion = useCallback(async () => {
    const { conservarCuenta } = await cargarBorrado()
    const r = await conservarCuenta(uidVigente.current)
    if (!r.ok) return r
    verificacionDeBorrado.current = null
    setSelloBorrado((n) => n + 1)
    flush(uidVigente.current).catch(() => {})
    return r
  }, [])

  const cerrarRetoma = useCallback(() => {
    setRetoma(null)
    setSelloRestauracion((n) => n + 1)
  }, [])

  const cerrarDespedida = useCallback(() => {
    setDespedida(false)
    navegar('/hoy', { replace: true })
  }, [navegar])

  const sesion = useMemo(
    () => ({
      uid,
      estado,
      correo: estado === ESTADOS_SESION.conCuenta ? (usuario?.email ?? null) : null,
      selloRestauracion,
      conectarCuenta: pasarACuenta,
      entrar,
      crear,
      entrarConProveedor,
      reintentarRestauracion,
      comprobarSalida,
      salir,
      hayConexionParaBorrar,
      metodoParaBorrar,
      verificadaParaBorrar,
      verificarParaBorrar,
      borrarCuenta: borrarCuentaDeSesion,
      conservarCuenta: conservarCuentaDeSesion,
    }),
    [
      uid,
      estado,
      usuario,
      selloRestauracion,
      pasarACuenta,
      entrar,
      crear,
      entrarConProveedor,
      reintentarRestauracion,
      comprobarSalida,
      salir,
      hayConexionParaBorrar,
      metodoParaBorrar,
      verificadaParaBorrar,
      verificarParaBorrar,
      borrarCuentaDeSesion,
      conservarCuentaDeSesion,
    ],
  )

  // El tono del velo y no el papel de la app: lo primero que se ve al abrir es
  // el umbral, y un fotograma crema delante de un velo nocturno es un fogonazo
  // a las once de la noche.
  // Mientras baja lo de la cuenta, el mismo velo con una frase encima: sin
  // rueda, sin barra y sin cuánto falta (RN-EST-02). El `data-surface` va solo
  // aquí, donde hay texto que leer sobre el fondo —de noche el velo es índigo—
  // y no en el velo de espera de abajo, que no cambia ni un píxel (§4.5).
  if (restaurando) {
    const momento = momentoDe()
    return (
      <div
        data-moment={momento}
        data-surface={momento === 'noche' ? 'dark' : 'light'}
        className="velo-transicion flex min-h-screen items-center justify-center px-8 text-center"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="font-display text-lg text-on-surface leading-snug">
          {copy.shared.restauracion.enCurso}
        </p>
      </div>
    )
  }

  // SPEC_24: la despedida va delante de todo, también del velo del cambio de uid.
  if (despedida) return <Despedida onCerrar={cerrarDespedida} />

  if (!listo || cambiando) {
    return (
      <div data-moment={momentoDe()} className="velo-transicion min-h-screen" aria-busy="true" />
    )
  }

  // SPEC_24 (DP-24.13): con un borrado a medias, se termina o se conserva
  // antes de enseñar nada más. Nada queda sin decidir.
  if (retoma?.accion === 'aMedias') {
    return (
      <ContextoSesion.Provider value={sesion}>
        <Suspense fallback={<div className="velo-transicion min-h-screen" aria-busy="true" />}>
          <CapaDeBorrado
            modo="aMedias"
            iphone={esIPhone()}
            sinSesion={retoma.sinSesion}
            onCerrar={cerrarRetoma}
          />
        </Suspense>
      </ContextoSesion.Provider>
    )
  }

  return <ContextoSesion.Provider value={sesion}>{children(uid)}</ContextoSesion.Provider>
}
