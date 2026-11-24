// src/lib/suscripcion/inicioDePrueba.js
// Cuándo empezó la prueba de esta persona (SPEC_25, DP-25.13 con D2 y D3).
//
// **Vive en `shared/onboarding`, junto a `completedAt`**, y no en el perfil:
// escribirla en el perfil lo sellaría como recién editado, y un teléfono con un
// perfil viejo pisaría en la nube el de otro. El expediente ya sabe fusionar
// hechos que no se deshacen (`conflictos.js`), y entre dos fechas gana la más
// antigua.
//
// **Solo en la app de iPhone** (D3): si la web la escribiera, quien usara la
// PWA dos semanas instalaría la app con la prueba vencida.
//
// La escribe `terminarRecorrido` al acabar el onboarding. Esto es para quien
// lo había terminado antes de esta versión: la primera vez que abre, hoy. Con
// cuenta, solo si lo de la cuenta ya bajó a este teléfono: puede traer la suya.

import { hayMarcaDeRestauracion, shared } from '../db/index.js'
import { arbolDeEntrada } from '../entradaCuenta.js'
import { ESTADOS_SESION } from '../sesion.js'

const EN_VUELO = new Map()

const SIN_CUENTA = [ESTADOS_SESION.sinCuenta, ESTADOS_SESION.sinConfigurar]

/**
 * La fecha en que empezó la prueba. La escribe si hace falta y se puede.
 *
 * @param {string} uid
 * @param {object} opciones
 * @param {string} opciones.sesion - el estado de la sesión.
 * @returns {Promise<?string>} `null` si todavía no hay.
 */
export function inicioDePrueba(uid, opciones = {}) {
  const enVuelo = EN_VUELO.get(uid)
  if (enVuelo) return enVuelo
  const promesa = resolver(uid, opciones).finally(() => EN_VUELO.delete(uid))
  EN_VUELO.set(uid, promesa)
  return promesa
}

async function resolver(uid, { sesion, ahora = new Date() } = {}) {
  const arbol = await arbolDeEntrada(uid)
  const expediente = await shared.getOnboarding(arbol)
  if (expediente?.fechaInicioPrueba) return expediente.fechaInicioPrueba
  if (!expediente?.completedAt) return null
  // El árbol de origen de una mudanza aplazada es de este teléfono; el de la
  // cuenta puede tener ya su fecha en la nube.
  const deLaCuenta = arbol === uid && !SIN_CUENTA.includes(sesion)
  if (deLaCuenta && !hayMarcaDeRestauracion(uid)) return null
  // Leer tarda: si una mudanza cambió de árbol mientras tanto, se decide otra
  // vez la próxima.
  if ((await arbolDeEntrada(uid)) !== arbol) return null
  const fechaInicioPrueba = ahora.toISOString()
  await shared.updateOnboarding(arbol, { fechaInicioPrueba })
  return fechaInicioPrueba
}
