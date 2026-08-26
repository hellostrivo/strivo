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
// **Por qué no se retira:** sin él no hay uid ni preferencias, y la app no
// arranca. Sigue siendo un andamio.
//
// Se monta **una sola vez, en la raíz**, por encima de la navegación.

import { useEffect, useState } from 'react'
import { initUserTree, shared } from '@/lib/db'
import { momentoDe } from '@lib/timeSlot'

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

  /** La sesión pasa a otro uid: el de la cuenta que acaba de crearse. */
  const cambiarUid = (nuevo) => {
    if (!nuevo || nuevo === uid) return
    localStorage.setItem(CLAVE_UID, nuevo)
    setUid(nuevo)
  }

  useEffect(() => {
    let vigente = true

    async function arrancar() {
      // El perfil es la primera rama que escribe `initShared`, así que su
      // ausencia es la señal de que el árbol no existe. Antes lo decía la
      // identidad central, que era la hoja obligatoria del alcance retirado.
      const profile = await shared.getProfile(uid)

      // `initUserTree` ya no exige una identidad central: es `shared/` con sus
      // cuatro ramas y un `diario/` que nace vacío a propósito, porque un día en
      // blanco sería un registro que nadie escribió (RN-DB4-08).
      if (profile === null) await initUserTree(uid)

      if (vigente) setListo(true)
    }

    arrancar()

    return () => {
      vigente = false
    }
  }, [uid])

  // El tono del velo y no el papel de la app: lo primero que se ve al abrir es
  // el umbral, y un fotograma crema delante de un velo nocturno es un fogonazo
  // a las once de la noche.
  if (!listo) {
    return (
      <div data-moment={momentoDe()} className="velo-transicion min-h-screen" aria-busy="true" />
    )
  }

  return children(uid, cambiarUid)
}
