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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { alTerminarRestauracion, hayMarcaDeRestauracion, startSync } from '@/lib/db'
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
  entrarConProveedor,
} from '@lib/cuenta'
import { ContextoSesion } from '@lib/useSesion'
import { momentoDe } from '@lib/timeSlot'
import { copy } from '@copy'

const CLAVE_UID = 'strivo.uid.local'

function acunarUidLocal() {
  return `local-${crypto.randomUUID()}`
}

function uidLocal() {
  let uid = localStorage.getItem(CLAVE_UID)
  if (!uid) {
    uid = acunarUidLocal()
    localStorage.setItem(CLAVE_UID, uid)
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
    localStorage.setItem(CLAVE_UID, nuevo)
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
  }, [estado, uid])

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
   * `entrarConGoogle`, y P7 por `conectarCuenta` (SPEC_19.2).
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

  const entrarConGoogle = useCallback(async () => {
    const r = await entrarConProveedor('google')
    return r.ok ? pasarACuenta(r) : r
  }, [pasarACuenta])

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

  const sesion = useMemo(
    () => ({
      uid,
      estado,
      correo: estado === ESTADOS_SESION.conCuenta ? (usuario?.email ?? null) : null,
      selloRestauracion,
      conectarCuenta: pasarACuenta,
      entrar,
      crear,
      entrarConGoogle,
      comprobarSalida,
      salir,
    }),
    [
      uid,
      estado,
      usuario,
      selloRestauracion,
      pasarACuenta,
      entrar,
      crear,
      entrarConGoogle,
      comprobarSalida,
      salir,
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

  if (!listo || cambiando) {
    return (
      <div data-moment={momentoDe()} className="velo-transicion min-h-screen" aria-busy="true" />
    )
  }

  return <ContextoSesion.Provider value={sesion}>{children(uid)}</ContextoSesion.Provider>
}
