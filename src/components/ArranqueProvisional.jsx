// src/components/ArranqueProvisional.jsx
//
// ⚠ PROVISIONAL — lo sustituye el onboarding, que **ninguna de las doce specs
// de Fase 1 construye**.
//
// Antes se llamaba `SesionProvisional` y se montaba una vez por pestaña, lo que
// lo hacía parecer parte de la navegación. SPEC_11 retiró los dos conmutadores
// provisionales de la barra, pero esto no es navegación: es el arranque de
// sesión. Resuelve un uid y, si el árbol de `users/{uid}/` no existe, **pregunta
// la identidad central** antes de crearlo.
//
// **Por qué no se retira con los otros dos andamios:** sin él no hay uid, no
// corre `initUserTree` y no se puede crear ni un hábito, porque RN-DB4-09 exige
// que la identidad central exista desde el primer momento. No hay autenticación
// ni onboarding en Fase 1, así que retirarlo deja la app sin arrancar.
//
// Preguntar la identidad en vez de inventarla tampoco es un detalle: RN-DB4-08
// prohíbe rellenar datos que la persona no ha escrito. El onboarding real (P3)
// hará esto mismo, con su pantalla y su ritmo.
//
// Se monta **una sola vez, en la raíz**, por encima de la barra de espacios.

import { useEffect, useState } from 'react'
import EditorIdentidad from '@components/formia/EditorIdentidad'
import { copy } from '@copy'
import { formia, initUserTree } from '@/lib/db'
import { conPrefijoCentral } from '@/formia/identidad'

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
  const [tieneArbol, setTieneArbol] = useState(null)

  useEffect(() => {
    formia.getIdentity(uid).then((identity) => setTieneArbol(identity !== null))
  }, [uid])

  if (tieneArbol === null) return <div className="min-h-screen bg-paper" aria-busy="true" />

  if (!tieneArbol) {
    return (
      <div className="min-h-screen bg-paper px-5 py-8 flex flex-col justify-center gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-lg text-ink">{copy.onboarding.p3.headline}</h1>
          <p className="text-base text-ink/80">{copy.onboarding.p3.subhead}</p>
        </div>
        <EditorIdentidad
          id="arranque-identidad-central"
          prefijo={copy.formia.identidad.central.prefix}
          placeholder={copy.formia.identidad.central.placeholder}
          ayuda={copy.formia.identidad.central.hint}
          onGuardar={async (texto) => {
            const identityCentral = conPrefijoCentral(texto)
            if (identityCentral === '') return
            await initUserTree(uid, { identityCentral })
            setTieneArbol(true)
          }}
        />
      </div>
    )
  }

  return children(uid)
}
