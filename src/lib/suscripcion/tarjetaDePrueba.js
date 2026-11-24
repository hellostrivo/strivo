// src/lib/suscripcion/tarjetaDePrueba.js
// «Tu prueba termina mañana» sale una vez en este teléfono (DP-25.17). La marca
// es un hecho del teléfono, no de la persona: no viaja con la cuenta.

import { guardarClave, leerClave, quitarClave } from '../db/clavesDelTelefono.js'
import { DIA_DE_LA_TARJETA, ESTADOS } from './estado.js'

const claveDeTarjeta = (uid) => `strivo.tarjetaDePrueba.${uid}`

export function tocaLaTarjeta({ estado, dia, vista }) {
  return estado === ESTADOS.prueba && dia === DIA_DE_LA_TARJETA && !vista
}

export function tarjetaVista(uid) {
  return leerClave(claveDeTarjeta(uid)) != null
}

export function marcarTarjeta(uid) {
  guardarClave(claveDeTarjeta(uid), new Date().toISOString())
}

/** Solo el diagnóstico. */
export function olvidarTarjeta(uid) {
  quitarClave(claveDeTarjeta(uid))
}
