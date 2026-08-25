// src/components/ArranqueProvisional.jsx
//
// ⚠ PROVISIONAL — lo sustituye el onboarding, que todavía no está construido.
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
// abre la app. El nombre lo preguntará el onboarding real (P4), que es donde ya
// vive su copy.
//
// **Por qué no se retira:** sin él no hay uid ni preferencias, y la app no
// arranca. Sigue siendo un andamio.
//
// Se monta **una sola vez, en la raíz**, por encima de la navegación.

import { useEffect, useState } from 'react'
import { initUserTree, shared } from '@/lib/db'

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
  const [uid] = useState(uidLocal)
  const [listo, setListo] = useState(false)

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

  if (!listo) return <div className="min-h-screen bg-paper" aria-busy="true" />

  return children(uid)
}
