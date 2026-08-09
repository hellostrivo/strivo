// src/pages/JournalPage.jsx
// Pestaña "Journal" — escritura libre (§4.3.1, §5.8)
//
// Dos pantallas: la lista con su búsqueda y el editor. Nada más en medio.
// La barra de pestañas se oculta mientras se escribe: la hoja es la pantalla.

import { useCallback, useEffect, useState } from 'react'
import { getCurrentUserId } from '@lib/user'
import { loadEntradas, entradaNueva, guardarEntrada } from '@lib/journal'
import JournalLista  from '@/pages/journal/JournalLista'
import JournalEditor from '@/pages/journal/JournalEditor'

const avisar = (mensaje, error) => console.warn(`[Strivo] ${mensaje}`, error)

export default function JournalPage({ onHideNav }) {
  const [entradas, setEntradas] = useState([])
  const [abierta, setAbierta]   = useState(null)

  const cargar = useCallback(async () => {
    const entradas = await loadEntradas(getCurrentUserId())
    setEntradas(entradas)
  }, [])

  useEffect(() => {
    cargar().catch(error => avisar('No se pudo abrir el Journal:', error))
  }, [cargar])

  useEffect(() => {
    onHideNav?.(!!abierta)
    return () => onHideNav?.(false)
  }, [abierta, onHideNav])

  // Guardar es best-effort y silencioso: se llama al escribir, al perder el
  // foco y al salir, y guardar dos veces lo mismo no crea dos entradas.
  const guardar = useCallback(() => {
    setAbierta(actual => {
      if (actual) {
        guardarEntrada(actual).catch(error => avisar('La entrada se guarda más tarde:', error))
      }
      return actual
    })
  }, [])

  const salir = async () => {
    guardar()
    setAbierta(null)
    await cargar().catch(error => avisar('No se pudo recargar el Journal:', error))
  }

  if (abierta) {
    return (
      <JournalEditor
        entrada={abierta}
        onChange={texto => setAbierta(actual => ({ ...actual, texto }))}
        onEmociones={emociones => setAbierta(actual => ({ ...actual, emociones }))}
        onGuardar={guardar}
        onSalir={salir}
      />
    )
  }

  return (
    <JournalLista
      entradas={entradas}
      onAbrir={setAbierta}
      onNueva={() => setAbierta(entradaNueva(getCurrentUserId()))}
    />
  )
}
