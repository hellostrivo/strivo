// src/components/diario/PuertaDelJournal.jsx
// La puerta del Journal, antes de preparar el archivo (SPEC_24A, DP-24.6).
//
// **Es la misma puerta, no una copia**: `usePin` y `BloqueoPin` en modo
// `desbloqueo`, con el PIN o Face ID, «Olvidé mi PIN» y todo lo demás. Con el
// PIN puesto el Historial no lee el journal siquiera, y un archivo sin puerta
// sería otra forma de leerlo.
//
// Lo único que añade es la salida: «Cerrar» vuelve a Tu perfil sin preparar
// nada y sin decir nada. Abierta la puerta, avisa (`onAbierta`) y no se pinta:
// lo que sigue es el archivo, no el Journal.
//
// Llega a Tu perfil por props desde `App.jsx`: `perfil/` no importa `diario/`
// (RN-TEC-07).

import { useEffect, useRef } from 'react'
import BloqueoPin from './BloqueoPin'
import { usePin } from '@/diario/usePin'

export default function PuertaDelJournal({ uid, onAbierta, onCerrar }) {
  const pin = usePin(uid)
  const avisado = useRef(false)

  useEffect(() => {
    if (avisado.current) return
    // Si la lectura del PIN falla, no se abre nada: se vuelve sin preparar.
    if (pin.carga === 'error') {
      avisado.current = true
      onCerrar()
    } else if (pin.carga === 'listo' && pin.desbloqueado) {
      avisado.current = true
      onAbierta()
    }
  }, [pin.carga, pin.desbloqueado, onAbierta, onCerrar])

  if (pin.carga !== 'listo' || pin.desbloqueado) {
    return <div className="min-h-screen" aria-busy="true" />
  }

  return (
    <BloqueoPin modo="desbloqueo" estado={pin.estado} acciones={pin.acciones} onCerrar={onCerrar} />
  )
}
