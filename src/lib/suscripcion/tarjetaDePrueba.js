// src/lib/suscripcion/tarjetaDePrueba.js
// «Tu prueba termina mañana» sale una vez en este teléfono (DP-25.17). La marca
// es un hecho del teléfono, no de la persona: no viaja con la cuenta.
//
// **Se marca cuando se ve, no cuando se monta**, y una vez a la vista se queda
// hasta que se toca o se cierra la app. Hoy se monta debajo del umbral y se
// vuelve a montar al cambiar de sección: marcada al montar, cerrar la app
// durante el video, o ir y volver, la gastaba sin que nadie la leyera.

import { guardarClave, leerClave, quitarClave } from '../db/clavesDelTelefono.js'
import { DIA_DE_LA_TARJETA, ESTADOS } from './estado.js'

const claveDeTarjeta = (uid) => `strivo.tarjetaDePrueba.${uid}`

export function tocaLaTarjeta({ estado, dia, vista }) {
  return estado === ESTADOS.prueba && dia === DIA_DE_LA_TARJETA && !vista
}

// Las que están a la vista en esta sesión. En memoria.
const aLaVista = new Set()

/** ¿Ya se gastó? La que sigue a la vista en esta sesión, todavía no. */
export function tarjetaVista(uid) {
  return !aLaVista.has(uid) && leerClave(claveDeTarjeta(uid)) != null
}

/** ¿Está marcada en el teléfono? Solo el diagnóstico. */
export function tarjetaMarcada(uid) {
  return leerClave(claveDeTarjeta(uid)) != null
}

/** Se tocó: no vuelve a salir. */
export function descartarTarjeta(uid) {
  marcarTarjeta(uid)
  aLaVista.delete(uid)
}

/** Solo para las pruebas: como empieza una sesión. */
export function olvidarSesionDeTarjetas() {
  aLaVista.clear()
}

/** Se está viendo: queda marcada para la próxima vez que se abra la app. */
export function marcarTarjeta(uid) {
  aLaVista.add(uid)
  guardarClave(claveDeTarjeta(uid), new Date().toISOString())
}

/** Solo el diagnóstico. */
export function olvidarTarjeta(uid) {
  aLaVista.delete(uid)
  quitarClave(claveDeTarjeta(uid))
}
