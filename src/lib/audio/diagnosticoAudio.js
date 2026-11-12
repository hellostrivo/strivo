// src/lib/audio/diagnosticoAudio.js
// El diagnóstico del audio de Respiración (SPEC_23C, DP-23.16). Solo existe
// con `VITE_DIAG_AUDIO=1`: lo carga `contextoAudio.js` con un `import()` que
// sin la bandera desaparece del build.
//
// **Mide, no arregla nada.** Se queda en el código detrás de su bandera, como
// los de SPEC_17B y SPEC_22, porque servirá para comprobar el arreglo de la
// Parte 2. Lo que mide es lo que la fundadora no puede ver sin consola:
//
//   - el estado del contexto, con la hora de cada cambio (`statechange`);
//   - qué pasó al irse y al volver, y cuánto estuvo fuera;
//   - si `resume()` resolvió, rechazó, no contestó en 1 s o no hizo falta;
//   - cuánto avanzó el reloj del audio mientras estaba fuera, frente al reloj
//     de pared: si avanzó casi lo mismo, el audio siguió sonando;
//   - **si el JavaScript siguió corriendo fuera**: los tics de un temporizador
//     de 1 s y los fotogramas que llegaron con la página oculta;
//   - si el motor sigue vivo, cuántas fuentes tiene y cuántos tics lleva el
//     planificador;
//   - las fases programadas por adelantado y si el cuadro está puesto.
//
// «Al volver» se apunta solo, al hacerse visible la página: **cualquier toque
// en la pantalla despierta el audio** (`despertarAlVolver` escucha todo el
// documento), también uno en el panel, así que la captura se hace antes de
// tocar nada.
//
// **Desde la Parte 2 no trae experimentos** (DP-23.28): el control del tipo de
// sesión de audio y «Probar con un audio nuevo» se retiraron, porque ya decide
// el comportamiento normal (`sesionAudio.js` y el respaldo de DP-23.21). Mide,
// además, cuántas fases hay programadas por adelantado y si el cuadro de la
// pantalla de bloqueo está puesto.

import { observar } from './observadorAudio.js'
import { actual } from './contextoAudio.js'
import { cuadroPuesto, tipoActual } from './sesionAudio.js'

const CAMBIOS_QUE_SE_VEN = 6

const estado = {
  cambios: [],
  alIrse: null,
  alVolver: null,
  reanudar: null,
  relojFuera: null,
  jsFuera: null,
  relojAhora: null,
  tics: 0,
  // Mientras la página está oculta:
  ticsFuera: 0,
  fotogramasFuera: 0,
  // Quien suena ahora: la sesión de la sección o «Respira un momento».
  fuentes: { sesion: null, momento: null },
  reanudandoDesde: null,
}

const suscritos = new Set()

function contar() {
  suscritos.forEach((fn) => {
    try {
      fn()
    } catch {
      // El panel se repinta solo; uno roto no frena a los demás.
    }
  })
}

const ahora = () => Date.now()

// ─── Lo que cuentan el contexto, el planificador y la sesión ──────────────────

function apuntarCambio(nombre) {
  estado.cambios.push({ estado: nombre, hora: ahora() })
  if (estado.cambios.length > CAMBIOS_QUE_SE_VEN) estado.cambios.shift()
  contar()
}

observar((tipo, datos) => {
  if (tipo === 'creado') {
    apuntarCambio(datos?.state ?? 'sin audio')
    datos?.addEventListener?.('statechange', () => apuntarCambio(datos.state))
  } else if (tipo === 'cerrado') {
    apuntarCambio('closed')
  } else if (tipo === 'reanudarEmpieza') {
    estado.reanudandoDesde = { hora: ahora(), espera: datos?.espera ?? 1000 }
  } else if (tipo === 'reanudar') {
    // Sin respuesta en 1 s: terminó por el techo, no porque resume() volviera.
    let resultado = datos?.resultado
    if (resultado === 'termino') {
      const desde = estado.reanudandoDesde
      const tardo = desde ? ahora() - desde.hora : 0
      resultado =
        desde && tardo >= desde.espera - 20 && datos?.estado !== 'running'
          ? 'sinRespuesta'
          : 'resolvio'
    }
    estado.reanudandoDesde = null
    estado.reanudar = { resultado, hora: ahora() }
    contar()
  } else if (tipo === 'tic') {
    estado.tics += 1
  } else if (tipo === 'cuadro') {
    contar()
  } else if (tipo === 'sesion' || tipo === 'momento') {
    estado.fuentes[tipo] = datos
    contar()
  }
})

// ─── Irse y volver ────────────────────────────────────────────────────────────

function alCambiarVisibilidad() {
  const ctx = actual()
  if (document.visibilityState === 'hidden') {
    estado.alIrse = {
      hora: ahora(),
      estado: ctx?.state ?? null,
      reloj: ctx?.currentTime ?? null,
      pared: performance.now(),
    }
    estado.ticsFuera = 0
    estado.fotogramasFuera = 0
    contar()
    return
  }
  const ido = estado.alIrse
  const segundos = ido ? (performance.now() - ido.pared) / 1000 : 0
  estado.alVolver = { hora: ahora(), fuera: segundos, estado: ctx?.state ?? null }
  estado.relojFuera =
    ido && ido.reloj !== null && ctx
      ? { audio: Math.max(0, ctx.currentTime - ido.reloj), pared: segundos }
      : null
  estado.jsFuera = ido
    ? { tics: estado.ticsFuera, de: Math.floor(segundos), fotogramas: estado.fotogramasFuera }
    : null
  contar()
}

let relojAnterior = null

function cadaSegundo() {
  if (document.visibilityState === 'hidden') estado.ticsFuera += 1
  const ctx = actual()
  const reloj = ctx?.currentTime ?? null
  estado.relojAhora = reloj === null || relojAnterior === null ? null : reloj > relojAnterior
  relojAnterior = reloj
  contar()
}

function cadaFotograma() {
  if (document.visibilityState === 'hidden') estado.fotogramasFuera += 1
  requestAnimationFrame(cadaFotograma)
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', alCambiarVisibilidad)
  setInterval(cadaSegundo, 1000)
  requestAnimationFrame(cadaFotograma)
}

// ─── Lo que lee el panel ──────────────────────────────────────────────────────

/**
 * Una foto de todo, para pintar. `origen` es quien monta el panel: `sesion`
 * (la sección) o `momento` («Respira un momento»).
 */
export function leer(origen) {
  const ctx = actual()
  const fuente = estado.fuentes[origen] ?? null
  return {
    audio: ctx?.state ?? null,
    cambios: [...estado.cambios],
    alIrse: estado.alIrse,
    alVolver: estado.alVolver,
    reanudar: estado.reanudar,
    relojFuera: estado.relojFuera,
    relojAhora: estado.relojAhora,
    jsFuera: estado.jsFuera,
    motor: fuente?.motor?.() ?? null,
    tics: estado.tics,
    tipo: tipoActual(),
    programadas: fuente?.programadas?.() ?? null,
    relojAudio: ctx?.currentTime ?? null,
    cuadro: cuadroPuesto(),
  }
}

/** El panel se repinta con cada cosa que pasa. */
export function suscribir(fn) {
  suscritos.add(fn)
  return () => suscritos.delete(fn)
}
