// src/lib/suscripcion/useSuscripcion.js
// La suscripción, para quien la necesite leer (SPEC_25). El estado lo sostiene
// `components/suscripcion/ProveedorDeSuscripcion.jsx`; aquí vive su forma, para
// que el diario y Tu perfil no importen ese componente (como `useSesion`).
//
// **Sin proveedor, la respuesta es la de la web**: se escribe y no hay muro.

import { createContext, useContext } from 'react'

const nada = () => {}

export const SIN_SUSCRIPCION = Object.freeze({
  estado: 'web',
  hasta: null,
  plan: null,
  seRenueva: false,
  dia: null,
  puedeEscribir: true,
  // ¿No hay nada delante? Ni el umbral ni la escritura.
  libre: true,
  desfaseDias: 0,
  customerInfo: null,
  fechaInicioPrueba: null,
  diaTerminaA: undefined,
  abrirMuro: nada,
  // 25B — La hoja del código, y lo que se dice al volver si no quedó aplicado.
  abrirCodigo: nada,
  notaDeCodigo: null,
  refrescar: async () => null,
  restaurar: async () => ({ motivo: 'error' }),
})

export const ContextoSuscripcion = createContext(SIN_SUSCRIPCION)

export function useSuscripcion() {
  return useContext(ContextoSuscripcion)
}
