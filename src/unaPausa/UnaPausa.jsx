// src/unaPausa/UnaPausa.jsx
// La sección Una pausa: la cápsula de la semana, el archivo y el detalle
// (SPEC_28.3 §4.5).
//
// **Resuelve sus rutas ella misma**, como Respiración: `App.jsx` la monta en
// `/una-pausa/*` y le pasa `base` y la ruta de Respiración por props, porque es
// quien enruta y el único que sabe dónde vive cada cosa.
//
//   /una-pausa           la vigente
//   /una-pausa/archivo   las anteriores
//   /una-pausa/:id       una del canal, vigente o del archivo
//
// Un `id` que no está, o el archivo cuando no tiene nada, vuelve a la vigente
// sin mensaje (como RN-NAV-06).
//
// **El foco va al encabezado de la vista** al entrar y al cambiar de vista,
// sin dibujar anillo (RN-RE-NAV-41, `.una-pausa-encabezado` en `globals.css`).
// Cuando la cápsula llega después de la forma vacía, el foco la sigue solo si
// nadie lo había movido: no se le quita a quien ya tabuló a la cabecera.

import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import Archivo from './Archivo.jsx'
import Capsula from './Capsula.jsx'
import Estado, { Marco } from './Estado.jsx'
import { useUnaPausa } from './useUnaPausa.js'

/**
 * La entrada del canal con ese `id`, o `null`. **El archivo antes que la
 * vigente**: en la vista previa la piloto está en los dos (DP-28.19), y el
 * detalle que se abre desde el archivo lleva la fecha del archivo.
 */
export function entradaPorId(canal, id) {
  const archivo = Array.isArray(canal?.archivo) ? canal.archivo : []
  const enArchivo = archivo.find((e) => e?.id === id)
  if (enArchivo) return enArchivo
  return canal?.vigente?.id === id ? canal.vigente : null
}

/** Lleva el foco al encabezado al cambiar de vista, o si nadie lo había movido. */
function useFocoEnEncabezado(clave) {
  const encabezado = useRef(null)
  const anterior = useRef(null)
  useEffect(() => {
    const cambio = anterior.current !== clave.vista
    anterior.current = clave.vista
    const activo = document.activeElement
    const libre =
      !activo || activo === document.body || activo.classList?.contains('una-pausa-encabezado')
    if (cambio || libre) encabezado.current?.focus()
  }, [clave.vista, clave.estado])
  return encabezado
}

function Detalle({ canal, base, rutaRespiracion, srcDePortada, refEncabezado }) {
  const { id } = useParams()
  const entrada = entradaPorId(canal, id)
  if (!entrada) return <Navigate to={base} replace />
  return (
    <Capsula
      entrada={entrada}
      srcPortada={srcDePortada(entrada)}
      rutaRespiracion={rutaRespiracion}
      refEncabezado={refEncabezado}
    />
  )
}

/**
 * La sección pintada a partir de su estado. Separada del hook para poder
 * pintarla en una prueba con cualquier estado.
 */
export function VistaUnaPausa({
  estado,
  canal,
  reintentar,
  srcDePortada = (e) => e?.portada?.src ?? null,
  base,
  rutaRespiracion,
}) {
  const { pathname } = useLocation()
  const encabezado = useFocoEnEncabezado({ vista: pathname, estado })

  if (estado !== 'listo') {
    return <Estado estado={estado} onReintentar={reintentar} refEncabezado={encabezado} />
  }

  const archivo = canal.archivo
  return (
    <Marco>
      <Routes>
        <Route
          index
          element={
            <Capsula
              entrada={canal.vigente}
              vigente
              srcPortada={srcDePortada(canal.vigente)}
              rutaRespiracion={rutaRespiracion}
              rutaArchivo={archivo.length > 0 ? `${base}/archivo` : null}
              refEncabezado={encabezado}
            />
          }
        />
        <Route
          path="archivo"
          element={
            archivo.length > 0 ? (
              <Archivo entradas={archivo} base={base} refEncabezado={encabezado} />
            ) : (
              <Navigate to={base} replace />
            )
          }
        />
        <Route
          path=":id"
          element={
            <Detalle
              canal={canal}
              base={base}
              rutaRespiracion={rutaRespiracion}
              srcDePortada={srcDePortada}
              refEncabezado={encabezado}
            />
          }
        />
      </Routes>
    </Marco>
  )
}

/**
 * @param {{ base?: string, rutaRespiracion?: string }} props
 */
export default function UnaPausa({ base = '/una-pausa', rutaRespiracion }) {
  const seccion = useUnaPausa()
  return <VistaUnaPausa {...seccion} base={base} rutaRespiracion={rutaRespiracion} />
}
