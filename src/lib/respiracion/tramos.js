// src/lib/respiracion/tramos.js
// Las fases de los próximos segundos, para programarlas por adelantado
// (SPEC_23 Parte 2, DP-23.22 y DP-23.26).
//
// **No es un segundo reloj.** Con la pantalla bloqueada no hay fotogramas y los
// temporizadores llegan cada uno o dos segundos, así que la guía no puede
// esperar al cambio de fase para sonar: lo programa antes, sobre el reloj del
// audio, que sí es exacto en segundo plano. Lo que programa sale de aquí, y
// esto solo pregunta al mismo resolvedor que usa quien dibuja —`resolverEstado`
// en la sección, `faseEn` en «Respira un momento»— en qué fase está cada
// instante. La máquina sigue siendo la única fuente de verdad (RN-RE-SND-19/20).

/** Tope de vueltas: ningún patrón tiene fases de menos de un cuarto de segundo. */
const TOPE_DE_TRAMOS = 200

/**
 * Los tramos entre dos instantes de la sesión, seguidos, sin huecos ni solapes.
 *
 * @param {(ms: number) => ({fase: string, restanteMs: number}|null)} resolver -
 *   la fase en ese instante y cuánto le queda; `null` si la sesión ya terminó.
 * @param {number} desdeMs
 * @param {number} hastaMs - el primer tramo que empieza antes se incluye entero.
 * @param {number} [finMs] - el cierre de la sesión: nada se programa después.
 * @returns {{fase: string, desdeMs: number, hastaMs: number}[]}
 */
export function tramosDesde(resolver, desdeMs, hastaMs, finMs = Infinity) {
  const tramos = []
  let ms = desdeMs
  const limite = Math.min(hastaMs, finMs)
  while (ms < limite && tramos.length < TOPE_DE_TRAMOS) {
    const punto = resolver(ms)
    if (!punto) break
    const restante = Math.max(1, Number(punto.restanteMs) || 0)
    const fin = Math.min(ms + restante, finMs)
    tramos.push({ fase: punto.fase, desdeMs: ms, hastaMs: fin })
    ms = fin
  }
  return tramos
}

/**
 * Pasa los tramos al reloj del audio: `ahoraMs` de la sesión es `ahoraAudio`
 * en segundos del contexto.
 */
export function alRelojDelAudio(tramos, ahoraMs, ahoraAudio) {
  return tramos.map((tramo) => ({
    fase: tramo.fase,
    inicio: ahoraAudio + (tramo.desdeMs - ahoraMs) / 1000,
    fin: ahoraAudio + (tramo.hastaMs - ahoraMs) / 1000,
  }))
}
