// src/pages/JournalPage.jsx
// Pestaña "Journal" — escritura libre (§4.3.1, §5.8)
//
// Dos pantallas: la lista con su búsqueda y el editor. Nada más en medio.
// La barra de pestañas se oculta mientras se escribe: la hoja es la pantalla.
//
// Delante de las dos puede haber una tercera, si la persona puso un PIN
// (bloque 07). El orden importa y no es negociable: mientras no se sepa si hay
// protección no se pinta nada Y NO SE LEEN LAS ENTRADAS. Ni la lista, ni una
// fecha, ni un fragmento. Cargar primero y decidir después dejaría el contenido
// en memoria y a un render de distancia de verse.
//
// El desbloqueo dura la sesión: salir a otra pestaña y volver no lo pide otra
// vez; recargar la app, sí (§07.D.4). Eso lo decide @lib/journalPin, que guarda
// ese estado en memoria y no en el almacén.

import { useCallback, useEffect, useState } from 'react'
import { copy } from '@copy'
import { getCurrentUserId } from '@lib/user'
import { loadEntradas, entradaNueva, guardarEntrada } from '@lib/journal'
import { estadoDeAcceso, hayPinConocido, estaDesbloqueado } from '@lib/journalPin'
import JournalLista      from '@/pages/journal/JournalLista'
import JournalEditor     from '@/pages/journal/JournalEditor'
import JournalDesbloqueo from '@/pages/journal/JournalDesbloqueo'
import ProteccionJournal from '@components/journal/ProteccionJournal'
import Button from '@components/ui/Button'

const avisar = (mensaje, error) => console.warn(`[Strivo] ${mensaje}`, error)

// Lo que ya se sabe sin preguntarle al almacén. En la primera visita de la
// sesión devuelve null —todavía nadie ha leído la fila— y la pantalla espera en
// blanco unos milisegundos. En las siguientes ya está resuelto, así que volver
// al Journal no parpadea.
function accesoInmediato() {
  if (estaDesbloqueado()) return 'abierto'
  const tiene = hayPinConocido()
  if (tiene === null) return null
  return tiene ? 'bloqueado' : 'abierto'
}

export default function JournalPage({ onHideNav }) {
  const [acceso, setAcceso]     = useState(accesoInmediato)  // null|'bloqueado'|'abierto'
  const [entradas, setEntradas] = useState([])
  const [abierta, setAbierta]   = useState(null)
  const [ajustes, setAjustes]   = useState(false)

  const cargar = useCallback(async () => {
    const entradas = await loadEntradas(getCurrentUserId())
    setEntradas(entradas)
  }, [])

  // Primero saber si hay puerta
  useEffect(() => {
    if (acceso) return undefined
    let vigente = true
    estadoDeAcceso()
      .then(estado => { if (vigente) setAcceso(estado) })
      .catch(error => {
        avisar('No se pudo consultar el PIN del Journal:', error)
        if (vigente) setAcceso('abierto')
      })
    return () => { vigente = false }
  }, [acceso])

  // Y solo entonces leer lo que hay dentro
  useEffect(() => {
    if (acceso !== 'abierto') return
    cargar().catch(error => avisar('No se pudo abrir el Journal:', error))
  }, [acceso, cargar])

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

  // Todavía no se sabe. Nada en pantalla es lo correcto: cualquier otra cosa
  // sería enseñar el journal antes de tiempo.
  if (acceso === null) return null

  if (acceso === 'bloqueado') {
    return <JournalDesbloqueo onDesbloqueado={() => setAcceso('abierto')} />
  }

  if (ajustes) {
    return (
      <div className="w-full max-w-md mx-auto px-6 py-10">
        <ProteccionJournal />
        <Button
          variant="ghost"
          size="md"
          fullWidth
          className="mt-10"
          onClick={() => setAjustes(false)}
        >
          {copy.journal.proteccion.volver}
        </Button>
      </div>
    )
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
      onProteger={() => setAjustes(true)}
    />
  )
}
