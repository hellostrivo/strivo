// src/lib/ritmoRespiracion.js
// El ritmo de la respiración diaria de Hoy: **5-5-3, tres ciclos** (§C2.3 · §5.1.2).
//
// **Desde SPEC_13 esto es un envoltorio.** La lógica vive en
// `lib/respiracion/motorRitmo.js`, que resuelve cualquier patrón de cuatro
// fases; aquí queda el 5-5-3 expresado en su lenguaje y la firma que ya
// consumían `Respiracion.jsx` y sus pruebas. La firma pública **no cambió**: si
// algo de esta cabecera se rompe, se rompió el motor, no el contrato.
//
// El 5-5-3 es `{inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30}` en
// el modelo canónico: décimas de segundo, sin retención con el pulmón lleno, y
// la pausa al final. **La pausa va al final del ciclo, no entre inhalación y
// exhalación.** Es 5-5-3, no 5-3-5. La distinción se cerró de forma explícita
// durante la revisión y es una decisión cerrada; el catálogo de Respiración la
// hereda tal cual en su preset `calma-553`, que es el mismo ritmo y el puente de
// identidad entre la herramienta y la app.
//
// **Las duraciones no se acortan nunca**, ni siquiera con "reducir movimiento":
// aquí la duración no es una animación, es el ejercicio (§6.10.1). Una versión
// anterior del prototipo corría el ciclo más rápido y conseguía lo contrario de
// lo que buscaba —aceleraba en vez de calmar—; cualquier regresión hacia una
// duración menor es un defecto, no una optimización.
//
// Aquí no se guarda nada y no hay nada que guardar. La respiración diaria no
// tiene registro, no cuenta para constancia y no alimenta ningún insight: es una
// experiencia, no un dato (SPEC_08 §5). Lo que sí registra es la herramienta de
// Respiración, que es otra cosa y vive en `breathing/`.

import { CURVA_POR_DEFECTO } from './respiracion/curvas.js'
import { amplitudEn, duracionCiclo, resolverEstado } from './respiracion/motorRitmo.js'

/**
 * El 5-5-3 en el modelo canónico de cuatro fases (SPEC_13 §5.1).
 * `retenerLleno: 0` es lo que lo distingue de un 5-5-5-3.
 */
export const PATRON_DIARIO = Object.freeze({
  inhalar: 50,
  retenerLleno: 0,
  exhalar: 50,
  retenerVacio: 30,
})

/**
 * Nombre que usa la respiración diaria para `retenerVacio`.
 *
 * Aquí la fase se llamó siempre "pausa" y así la nombran el componente y sus
 * pruebas. En el modelo canónico es `retenerVacio`, que es lo que de verdad es.
 * La traducción vive aquí y en ningún otro sitio.
 */
const FASE_DIARIO = Object.freeze({ retenerVacio: 'pausa' })
const FASE_CANONICA = Object.freeze({ pausa: 'retenerVacio' })

/** Las tres fases de un ciclo, en su orden, con su duración en milisegundos. */
export const FASES = Object.freeze([
  Object.freeze({ id: 'inhalar', duracion: 5000 }),
  Object.freeze({ id: 'exhalar', duracion: 5000 }),
  Object.freeze({ id: 'pausa', duracion: 3000 }),
])

export const IDS_FASE = Object.freeze(FASES.map((fase) => fase.id))

/** 13 s exactos (SPEC_08, criterio 1). Sale del patrón, no de una constante. */
export const DURACION_CICLO = duracionCiclo(PATRON_DIARIO)

/** RN-LU-RESP-02 — Tres, y los mismos en P1 y en la respiración diaria. */
export const CICLOS = 3

/** ~39 s. Es una práctica, no un gesto, y eso es lo que obliga a RN-LU-RESP-01. */
export const DURACION_TOTAL = DURACION_CICLO * CICLOS

/** Escala del círculo en reposo y en inhalación plena (§5.1.2). */
export const ESCALA_REPOSO = 1
export const ESCALA_PLENA = 1.18

/**
 * Opacidad por fase para "reducir movimiento" (§6.10.1).
 *
 * Sin cambio de escala, el ciclo se comunica **solo con opacidad** más el copy
 * de fase. Son tres valores fijos que cambian en el límite de cada fase: la
 * indicación es estática, no una animación más lenta.
 */
export const OPACIDAD_ESTATICA = Object.freeze({
  inhalar: 1,
  exhalar: 0.62,
  pausa: 0.38,
})

export function duracionDe(id) {
  return FASES.find((fase) => fase.id === id)?.duracion ?? 0
}

/**
 * En qué punto del ejercicio cae un instante.
 *
 * @param {number} ms - Milisegundos transcurridos desde que se inició.
 * @param {number} [ciclos]
 * @returns {{fase: ?string, ciclo: number, progreso: number, restante: number,
 *            terminado: boolean}}
 *   `progreso` va de 0 a 1 dentro de la fase; `restante`, en milisegundos, es lo
 *   que le queda — que es lo que necesita el audio para retomar un ciclo a
 *   medias sin volver a empezarlo. `ciclo` empieza en 0, no en 1: el motor los
 *   cuenta desde 1 y la traducción se hace aquí para no mover el contrato.
 */
export function faseEn(ms, ciclos = CICLOS) {
  const transcurrido = Math.max(0, Number(ms) || 0)
  const total = DURACION_CICLO * ciclos

  if (transcurrido >= total) {
    return { fase: null, ciclo: ciclos, progreso: 1, restante: 0, terminado: true }
  }

  const estado = resolverEstado(PATRON_DIARIO, transcurrido)
  return {
    fase: FASE_DIARIO[estado.fase] ?? estado.fase,
    ciclo: estado.cicloActual - 1,
    progreso: estado.progresoFase,
    restante: estado.msRestantesFase,
    terminado: false,
  }
}

/**
 * Escala del círculo en una fase (§5.1.2): 1,0 → 1,18 al inhalar, de vuelta al
 * exhalar, y quieto en la pausa. Sin desplazamiento, sin rotación, sin
 * partículas.
 *
 * **Ya no calcula su propia curva.** Interpola sobre la `amplitud` del motor,
 * que es el único número del que cuelgan el círculo, la línea y el volumen
 * (SPEC_13 §6.3). Antes suavizaba con `smoothstep`; ahora hereda el coseno
 * elevado, y la diferencia máxima entre las dos es de 0,36 px sobre un círculo
 * de 200 px.
 */
export function escalaEn(fase, progreso) {
  const canonica = FASE_CANONICA[fase] ?? fase
  const suave = CURVA_POR_DEFECTO(progreso)
  return ESCALA_REPOSO + (ESCALA_PLENA - ESCALA_REPOSO) * amplitudEn(canonica, suave)
}
