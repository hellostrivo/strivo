// src/lib/suscripcion/diagnostico.js
// Lo del build de diagnóstico de SPEC_25 (DP-25.21 y D5), solo con
// `VITE_DIAG_SUSCRIPCION=1`.
//
// **El desfase de días sobrevive a cerrar la app** porque las pruebas piden
// cerrarla: vive en una clave de `localStorage` que sin la bandera nadie lee,
// nadie escribe y ni siquiera llega a `dist/`. No toca el almacén.
//
// **Los eventos viven en memoria** y no salen a ningún sitio (RN-07).

const CLAVE = 'strivo.diag.suscripcion.desfase'
const CLAVE_PASOS = 'strivo.diag.suscripcion.pasos'
const MAX_PASOS = 40
// Distingue un arranque de otro: si cambia sin cerrar la app, algo recargó.
const ARRANQUE = Math.random().toString(36).slice(2, 5)
const eventos = []
const oyentes = new Set()

/** Los días que el diagnóstico mueve el reloj de la suscripción. */
export function leerDesfase() {
  if (import.meta.env.VITE_DIAG_SUSCRIPCION === '1') {
    try {
      return Number(localStorage.getItem(CLAVE)) || 0
    } catch {
      return 0
    }
  }
  return 0
}

/** Mueve el reloj de la suscripción. Cero lo devuelve a hoy y borra la clave. */
export function fijarDesfase(dias) {
  if (import.meta.env.VITE_DIAG_SUSCRIPCION === '1') {
    if (dias) localStorage.setItem(CLAVE, String(dias))
    else localStorage.removeItem(CLAVE)
    for (const fn of [...oyentes]) fn()
  }
}

/** Avisa cuando algo del diagnóstico cambió. */
export function escucharDiagnostico(fn) {
  oyentes.add(fn)
  return () => oyentes.delete(fn)
}

/** Anota uno de los cuatro eventos del muro. Solo con la bandera. */
export function anotarEvento(nombre, plan = null) {
  if (import.meta.env.VITE_DIAG_SUSCRIPCION === '1') {
    eventos.push(plan ? `${nombre} (${plan})` : nombre)
    for (const fn of [...oyentes]) fn()
  }
}

/** La línea temporal, del paso más viejo al más nuevo. */
export function leerPasos() {
  if (import.meta.env.VITE_DIAG_SUSCRIPCION === '1') {
    try {
      const pasos = JSON.parse(localStorage.getItem(CLAVE_PASOS) ?? '[]')
      return Array.isArray(pasos) ? pasos : []
    } catch {
      return []
    }
  }
  return []
}

/**
 * Anota un paso con su hora y su arranque. Sobrevive a cerrar la app: es lo que
 * permite leer en el panel lo que pasó antes de llegar a él.
 */
export function anotarPaso(texto) {
  if (import.meta.env.VITE_DIAG_SUSCRIPCION === '1') {
    try {
      const hora = new Date().toTimeString().slice(0, 8)
      const ms = String(Date.now() % 1000).padStart(3, '0')
      const pasos = [...leerPasos(), `${hora}.${ms} [${ARRANQUE}] ${texto}`].slice(-MAX_PASOS)
      localStorage.setItem(CLAVE_PASOS, JSON.stringify(pasos))
    } catch {
      // El diagnóstico nunca frena a nadie.
    }
  }
}

export function borrarPasos() {
  if (import.meta.env.VITE_DIAG_SUSCRIPCION === '1') localStorage.removeItem(CLAVE_PASOS)
}

export function eventosDeLaSesion() {
  return [...eventos]
}
