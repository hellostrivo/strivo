// src/components/perfil/DiagnosticoAlmacen.jsx
// La línea y el botón del build de diagnóstico de SPEC_17B (DP-17B.7).
//
// **Solo existe con `VITE_DIAG_ALMACEN=1`**: `Perfil.jsx` lo importa bajo esa
// condición, y sin la bandera ni este componente ni sus textos llegan a
// `dist/`. Va al final del bloque de sincronización, sin bloque propio en
// `perfil/bloques.js`: no es una sección de Tu perfil, es una lupa para las
// pruebas manuales.

import { useEffect, useState } from 'react'
import Button from '@components/ui/Button'
import { interpolate } from '@copy'
import { DIAGNOSTICO as t } from '@copy/diagnostico'
import { fechaDeMigracion, leerDiagnostico, simularLimpieza } from '@/lib/db/diagnosticoAlmacen'

/** Las líneas, en el orden en que se leen. Sin React, para probarla sin navegador. */
export function lineasDeDiagnostico({ cual, migracion, indexeddb, sqlite }) {
  const lineas = [interpolate(t.almacen, { cual: t.cuales[cual] ?? cual })]
  if (migracion?.estado === 'correcta') {
    lineas.push(interpolate(t.migracion.correcta, { fecha: fechaDeMigracion(migracion.fecha) }))
  } else if (migracion?.estado === 'nadaQueMigrar') {
    lineas.push(t.migracion.nadaQueMigrar)
  } else if (migracion?.estado === 'noTermino') {
    lineas.push(
      interpolate(t.migracion.noTermino, {
        motivo: t.migracion.motivos[migracion.motivo] ?? migracion.motivo,
      }),
    )
  }
  const conteo = (almacen, { registros, porSubir }) =>
    interpolate(t.conteo, { almacen: t.cuales[almacen], registros, porSubir })
  lineas.push(conteo('indexeddb', indexeddb))
  if (sqlite) lineas.push(conteo('sqlite', sqlite))
  return lineas
}

export default function DiagnosticoAlmacen() {
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    let vigente = true
    leerDiagnostico().then((d) => vigente && setDatos(d))
    return () => {
      vigente = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-3 border-t border-on-surface pt-4">
      {datos && (
        <div className="flex flex-col gap-1">
          {lineasDeDiagnostico(datos).map((linea) => (
            <p key={linea} className="text-sm text-on-surface-soft">
              {linea}
            </p>
          ))}
        </div>
      )}
      <div>
        <Button size="sm" variant="surface" onClick={() => simularLimpieza()}>
          {t.simular}
        </Button>
      </div>
    </div>
  )
}
