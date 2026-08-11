// src/components/SesionProvisional.jsx
//
// ⚠ PROVISIONAL — se retira cuando existan el onboarding y SPEC_11.
//
// Fase 1 empieza por la capa de datos y por Formia, así que todavía no hay ni
// autenticación ni onboarding: nadie ha creado el árbol de `users/{uid}/`. Este
// envoltorio hace lo mínimo para poder entrar al espacio de identidad en
// desarrollo — resolver un uid local y, si el árbol no existe, **preguntar** la
// identidad central antes de crearlo.
//
// Preguntarla en vez de inventarla no es un detalle: RN-DB4-08 prohíbe rellenar
// datos que la persona no ha escrito, y RN-DB4-09 exige que la central exista
// desde el primer momento. El onboarding real (P3) hará esto mismo, con su
// pantalla y su ritmo.

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

export default function SesionProvisional({ children }) {
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
          id="sesion-identidad-central"
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
