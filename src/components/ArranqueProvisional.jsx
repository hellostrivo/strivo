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
// **El uid puede cambiar mientras la app está abierta.** Si el onboarding crea
// una cuenta en P7, el árbol se muda al uid de Firebase y la sesión sigue con
// el nuevo. Por eso el uid es estado y no una constante, y por eso quien lo
// guarda en `localStorage` es este archivo y solo este: dos sitios escribiendo
// esa clave son dos sesiones distintas al siguiente arranque.
//
// **Desde SPEC_17A también arranca la nube, en las dos direcciones.** Con una
// cuenta —`esUidDeCuenta`, la regla provisional de `lib/sesion`— pone en marcha
// la cola de subida (`startSync`) y, antes de sembrar nada, baja lo que esa
// cuenta tenga en Firestore (`prepararArbol`). El orden importa y está
// explicado allí: restaurar primero, sembrar solo si después sigue sin haber
// árbol. Mientras baja, el velo lleva una frase; si falla, se entra igual y el
// reintento vive en Tu perfil. **La restauración se evalúa una sola vez por
// sesión, al montar**: si el uid cambia en P7, la cola se rearranca con el
// nuevo y no se restaura (D7, DP-19.5).
//
// **Por qué no se retira:** sin él no hay uid ni preferencias, y la app no
// arranca. Sigue siendo un andamio.
//
// Se monta **una sola vez, en la raíz**, por encima de la navegación.

import { useEffect, useRef, useState } from 'react'
import { startSync } from '@/lib/db'
import { esUidDeCuenta, prepararArbol } from '@lib/sesion'
import { momentoDe } from '@lib/timeSlot'
import { copy } from '@copy'

const CLAVE_UID = 'strivo.uid.local'

function uidLocal() {
  let uid = localStorage.getItem(CLAVE_UID)
  if (!uid) {
    uid = `local-${crypto.randomUUID()}`
    localStorage.setItem(CLAVE_UID, uid)
  }
  return uid
}

export default function ArranqueProvisional({ children }) {
  const [uid, setUid] = useState(uidLocal)
  const [listo, setListo] = useState(false)
  const [restaurando, setRestaurando] = useState(false)

  // Una sola evaluación de la restauración por sesión (§4.4). Se marca al
  // primer arranque sea cual sea el uid: así el cambio de uid en P7 encuentra
  // la pregunta ya contestada y no restaura a mitad del onboarding.
  const arranqueEvaluado = useRef(false)

  // El oyente del reintento al volver la red, si la restauración falló por eso.
  // Se guarda para retirarlo al desmontar.
  const quitarOyenteRed = useRef(null)

  /** La sesión pasa a otro uid: el de la cuenta que acaba de crearse. */
  const cambiarUid = (nuevo) => {
    if (!nuevo || nuevo === uid) return
    localStorage.setItem(CLAVE_UID, nuevo)
    setUid(nuevo)
  }

  // La cola de subida acompaña al uid: arranca con él y se rearranca si cambia
  // (P7). `startSync` devuelve su limpieza, que retira los oyentes de red y de
  // visibilidad y cancela el reintento pendiente. Sin cuenta no hay nada que
  // subir: las reglas de Firestore no dejarían escribir bajo un uid local.
  useEffect(() => {
    if (!esUidDeCuenta(uid)) return undefined
    return startSync(uid)
  }, [uid])

  useEffect(() => {
    let vigente = true

    async function arrancar() {
      // Solo el primer arranque de la sesión pregunta por la restauración. Un
      // cambio de uid vuelve a pasar por aquí para sembrar si hiciera falta
      // —no hace falta: `mudarUid` acaba de traer el árbol— y nada más.
      const primero = !arranqueEvaluado.current
      arranqueEvaluado.current = true

      // El perfil es la primera rama que escribe `initShared`, así que su
      // ausencia es la señal de que el árbol no existe. `prepararArbol` mira
      // eso mismo para decidir si restaura, y siembra solo después: es `shared/`
      // con sus cuatro ramas y un `diario/` que nace vacío a propósito, porque
      // un día en blanco sería un registro que nadie escribió (RN-DB4-08).
      const { quitarOyente } = await prepararArbol(uid, {
        enRestauracion: primero ? (activa) => vigente && setRestaurando(activa) : undefined,
        restaurarSiHaceFalta: primero,
      })
      if (quitarOyente) quitarOyenteRed.current = quitarOyente

      if (vigente) setListo(true)
    }

    arrancar()

    return () => {
      vigente = false
    }
  }, [uid])

  useEffect(() => () => quitarOyenteRed.current?.(), [])

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

  if (!listo) {
    return (
      <div data-moment={momentoDe()} className="velo-transicion min-h-screen" aria-busy="true" />
    )
  }

  return children(uid, cambiarUid)
}
