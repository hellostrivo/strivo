// src/breathing/lib/geometriaCirculo.js
// La matemática del círculo de Respiración (SPEC_14 §3). Pura: sin DOM, sin
// React, sin reloj. Recibe números y devuelve números.
//
// Vive aparte del `.jsx` por §2.2: la capa visual solo se puede probar de
// verdad si la geometría no depende de que exista un navegador. El componente
// pinta lo que estas funciones devuelven y no calcula nada por su cuenta.
//
// **No confundir con el círculo de Lumia (SPEC_08).** Aquel es otro elemento,
// de otra capa de marca, y no se toca (§1.2). Este es nuevo e independiente.

import { recortar } from '@lib/respiracion/curvas'

/** viewBox de §3.4. Cuadrado: el círculo nunca se deforma (RN-RE-VIS-08). */
export const VIEWBOX = Object.freeze({ ancho: 320, alto: 320 })
export const CENTRO = 160
export const RADIO_BASE = 96

/**
 * RN-RE-VIS-04 — El disco vacío mide el 32 % del anillo, nunca 0.
 * Un punto que desaparece del todo se siente como asfixia, y este es un
 * producto que existe para lo contrario.
 */
export const FRACCION_MINIMA = 0.32
const RECORRIDO = 1 - FRACCION_MINIMA // 0.68

const FACTOR_HALO = 1.18
const HALO_BASE = 0.06
const HALO_RECORRIDO = 0.1

/** Opacidad fija del halo con movimiento reducido (§7). */
export const OPACIDAD_HALO_QUIETA = 0.1

/**
 * Los tres radios del dibujo para una amplitud dada.
 *
 * @param {number} amplitud - 0..1, tal cual sale del motor. Nadie la recalcula.
 * @param {number} radioBase - Radio del anillo estático, en unidades de viewBox.
 * @returns {{radioDisco: number, radioHalo: number, opacidadHalo: number}}
 */
export function calcularRadios(amplitud, radioBase = RADIO_BASE) {
  const a = recortar(amplitud)
  const base = Number.isFinite(Number(radioBase)) ? Number(radioBase) : RADIO_BASE
  const radioDisco = base * (FRACCION_MINIMA + RECORRIDO * a)
  return {
    radioDisco,
    radioHalo: radioDisco * FACTOR_HALO,
    opacidadHalo: HALO_BASE + HALO_RECORRIDO * a,
  }
}

/**
 * El arco que traza cuánto le queda a la fase actual (§3.3).
 *
 * Resuelve el problema real que la referencia externa deja abierto: durante una
 * retención de siete segundos el disco está quieto y no hay forma de saber
 * cuánto falta. El arco lo dice sin pedirle a nadie que mire un número.
 *
 * Arranca a las 12 en punto y avanza en sentido horario. Se dibuja siempre el
 * círculo entero y se recorta con `stroke-dasharray` / `stroke-dashoffset`: así
 * el path es constante y por frame solo cambia un número.
 *
 * @param {number} progresoFase - 0..1 dentro de la fase en curso.
 * @param {number} radio
 * @param {number} [centro]
 * @returns {{d: string, longitudTotal: number, longitudVisible: number,
 *            desfase: number}}
 */
export function calcularArco(progresoFase, radio = RADIO_BASE, centro = CENTRO) {
  const t = recortar(progresoFase)
  const r = Number.isFinite(Number(radio)) ? Number(radio) : RADIO_BASE
  const c = Number.isFinite(Number(centro)) ? Number(centro) : CENTRO

  // Dos medias vueltas: un solo arco de 360° es ambiguo para SVG —el punto
  // inicial y el final coinciden— y algunos motores no lo dibujan.
  const arriba = c - r
  const abajo = c + r
  const d = `M ${c} ${arriba} A ${r} ${r} 0 1 1 ${c} ${abajo} A ${r} ${r} 0 1 1 ${c} ${arriba}`

  const longitudTotal = 2 * Math.PI * r
  const longitudVisible = longitudTotal * t

  return {
    d,
    longitudTotal,
    longitudVisible,
    // Lo que se escribe en `stroke-dashoffset`: la parte todavía no recorrida.
    desfase: longitudTotal - longitudVisible,
  }
}

/**
 * §7 — Con movimiento reducido, la amplitud avanza en cuatro escalones
 * (0 %, 33 %, 66 %, 100 %) en vez de por frame.
 *
 * No es "la animación apagada": es la misma información entregada a saltos, que
 * es lo que `prefers-reduced-motion` pide de verdad. Quien lo activa sigue
 * pudiendo respirar guiado.
 */
export const ESCALONES = Object.freeze([0, 1 / 3, 2 / 3, 1])

export function cuantizarAmplitud(amplitud) {
  const a = recortar(amplitud)
  return ESCALONES[Math.min(ESCALONES.length - 1, Math.floor(a * ESCALONES.length))]
}

/**
 * §7 — El arco avanza en pasos de un segundo. Se cuantiza sobre el tiempo
 * transcurrido de la fase y no sobre el progreso, para que un paso dure lo
 * mismo en una fase de 4 s que en una de 20 s.
 */
export function cuantizarProgreso(progresoFase, msFase) {
  const t = recortar(progresoFase)
  const total = Number(msFase)
  if (!Number.isFinite(total) || total <= 0) return t
  const segundos = Math.floor((t * total) / 1000)
  return recortar((segundos * 1000) / total)
}
