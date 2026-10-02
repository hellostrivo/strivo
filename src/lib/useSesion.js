// src/lib/useSesion.js
// La sesión, para quien la necesite leer (SPEC_19.1 §4.2).
//
// **El estado vive en `ArranqueProvisional` y aquí solo vive su forma.** Ese
// componente es el único que escribe `strivo.uid.local`, y la sesión es casi
// toda ella decidir qué uid va ahí; partir el estado en dos componentes
// obligaría a los dos a ponerse de acuerdo sobre quién cambia el uid. Lo que
// sí se separa es el contexto y su hook: así Tu perfil y `Entrada` leen la
// sesión sin importar el componente que la sostiene.
//
// Lo que lleva el contexto:
//
//   uid                — el vigente.
//   estado             — `sinConfigurar` | `sinCuenta` | `conCuenta` | `vencida`.
//   correo             — el de la cuenta, o `null`.
//   selloRestauracion  — un número que cambia cada vez que termina una
//                        restauración del uid vigente, con éxito o sin él.
//                        Quien tenga que releerse al bajar algo lo pone en las
//                        dependencias de su efecto (DP-17.11, DP-17.14).
//   conectarCuenta     — lleva la sesión a una cuenta ya abierta en Firebase:
//                        P7 la usa con el resultado de crear o entrar
//                        (SPEC_19.2). Es el mismo camino que usa Tu perfil.
//   entrar, crear, entrarConGoogle, comprobarSalida, salir — las acciones.

import { createContext, useContext } from 'react'

export const ContextoSesion = createContext(null)

export function useSesion() {
  const sesion = useContext(ContextoSesion)
  if (!sesion) {
    throw new Error('useSesion: no hay sesión. ¿Se montó fuera de ArranqueProvisional?')
  }
  return sesion
}
