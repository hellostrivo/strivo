// src/components/perfil/DiagnosticoBorrado.jsx
// El panel del build de diagnóstico de SPEC_24 (DP-24.20).
//
// **Solo existe con `VITE_DIAG_BORRADO=1`**: `Perfil.jsx` lo importa bajo esa
// condición, y sin la bandera ni este componente ni sus textos llegan a
// `dist/`. Va al final de «Tus datos», plegado. Es una lupa para las pruebas
// manuales, no una sección.
//
// Dice en qué fase está o quedó el borrado y si hay marca, cuántos documentos
// encontró en la nube y cuántos borró, y si la revocación de Apple respondió.
// Y tres controles: los dos ensayos del borrado («Fallar antes de la nube» y
// «Detenerse después de la nube») y «Sembrar días de prueba», que escribe unos
// 300 días con mañana y noche en la cuenta abierta —más de 500 documentos—
// para probar la exportación grande y el borrado en varios lotes.

import { useEffect, useState } from 'react'
import Button from '@components/ui/Button'
import { interpolate } from '@copy'
import { DIAGNOSTICO_BORRADO as t } from '@copy/diagnostico'
import { ensayoActual, escucharBorrado, fijarEnsayo, progresoDelBorrado } from '@lib/borrarCuenta'
import { hayMarcaDeBorrado } from '@lib/db/marcaDeBorrado'
import { writePath } from '@lib/db/local'

/** Las líneas, en el orden en que se leen. Sin React, para probarla sin navegador. */
export function lineasDelBorrado(progreso, marca) {
  return [
    interpolate(t.fase, { fase: t.fases[progreso.fase] ?? progreso.fase }),
    interpolate(t.marca, { estado: marca ? t.marcas.si : t.marcas.no }),
    interpolate(t.nube, {
      encontrados: progreso.encontrados,
      borrados: progreso.borrados,
      n: progreso.lotes,
    }),
    interpolate(t.apple, { estado: t.apples[progreso.apple] ?? progreso.apple }),
  ]
}

function clave(fecha) {
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${m}-${d}`
}

/**
 * Unos 300 días con mañana y noche en la cuenta abierta, encolados para subir
 * como cualquier escritura. Textos de prueba evidentes, en las rutas de
 * siempre.
 */
export async function sembrarDias(uid, { dias = 300, hoy = new Date() } = {}) {
  let n = 0
  for (let i = 1; i <= dias; i += 1) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i - 7, 12)
    const dia = clave(fecha)
    const updatedAt = fecha.toISOString()
    await writePath({
      uid,
      path: `users/${uid}/diario/morningEntry/items/${dia}`,
      collection: 'diario/morningEntry',
      id: dia,
      data: {
        version: 2,
        updatedAt,
        completedAt: updatedAt,
        feelings: ['tranquilo'],
        gratitude: [`Prueba ${i}: algo que agradezco.`],
        intentions: ['calma'],
        action: `Prueba ${i}: salir a caminar.`,
      },
    })
    await writePath({
      uid,
      path: `users/${uid}/diario/nightRitual/items/${dia}`,
      collection: 'diario/nightRitual',
      id: dia,
      data: {
        version: 2,
        updatedAt,
        completedAt: updatedAt,
        recognized: [`Prueba ${i}: algo que reconozco.`],
        closingFeelings: ['tranquilo'],
      },
    })
    n += 2
  }
  return n
}

export default function DiagnosticoBorrado({ uid }) {
  const [abierto, setAbierto] = useState(true)
  const [progreso, setProgreso] = useState(progresoDelBorrado)
  const [ensayo, setEnsayo] = useState(ensayoActual)
  const [marca, setMarca] = useState(() => hayMarcaDeBorrado(uid))
  const [sembrados, setSembrados] = useState(null)

  useEffect(
    () =>
      escucharBorrado((p) => {
        setProgreso(p)
        setMarca(hayMarcaDeBorrado(uid))
      }),
    [uid],
  )

  const alternar = (control) => {
    fijarEnsayo({ [control]: !ensayo[control] })
    setEnsayo(ensayoActual())
  }

  const sembrar = async () => {
    setSembrados(await sembrarDias(uid))
  }

  return (
    <div className="flex flex-col gap-2 border-t border-on-surface pt-4">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className="self-start text-sm text-on-surface-soft underline"
      >
        {abierto ? t.plegar : t.desplegar}
      </button>
      {abierto && (
        <>
          {lineasDelBorrado(progreso, marca).map((linea) => (
            <p key={linea} className="text-sm text-on-surface-soft">
              {linea}
            </p>
          ))}
          {['fallarAntes', 'detenerDespues'].map((control) => (
            <Button
              key={control}
              type="button"
              size="sm"
              variant="surface"
              aria-pressed={ensayo[control]}
              onClick={() => alternar(control)}
            >
              {ensayo[control] ? interpolate(t.activo, { control: t[control] }) : t[control]}
            </Button>
          ))}
          <Button type="button" size="sm" variant="surface" onClick={sembrar}>
            {t.sembrar}
          </Button>
          {sembrados !== null && (
            <p className="text-sm text-on-surface-soft">
              {interpolate(t.sembrados, { n: sembrados })}
            </p>
          )}
        </>
      )}
    </div>
  )
}
