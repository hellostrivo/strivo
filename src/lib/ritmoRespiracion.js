// src/lib/ritmoRespiracion.js
// El ritmo de la respiración: **5-5-3, tres ciclos** (§C2.3 · §5.1.2).
//
// Este es el único sitio donde vive ese ritmo. La respiración diaria de Lumia y
// la de P1 del onboarding usan el mismo componente y, por debajo, esta misma
// tabla (RN-LU-RESP-02): dos implementaciones divergentes es exactamente lo que
// produjo la contradicción que v4.1 vino a cerrar.
//
// **La pausa va al final del ciclo, no entre inhalación y exhalación.** Es
// 5-5-3, no 5-3-5. La distinción se cerró de forma explícita durante la
// revisión y es una decisión cerrada.
//
// **Las duraciones no se acortan nunca**, ni siquiera con "reducir movimiento":
// aquí la duración no es una animación, es el ejercicio (§6.10.1). Una versión
// anterior del prototipo corría el ciclo más rápido y conseguía lo contrario de
// lo que buscaba —aceleraba en vez de calmar—; cualquier regresión hacia una
// duración menor es un defecto, no una optimización.
//
// Aquí no se guarda nada y no hay nada que guardar. La respiración no tiene
// registro, no cuenta para constancia y no alimenta ningún insight: es una
// experiencia, no un dato (SPEC_08 §5).

/** Las tres fases de un ciclo, en su orden, con su duración en milisegundos. */
export const FASES = Object.freeze([
  Object.freeze({ id: 'inhalar', duracion: 5000 }),
  Object.freeze({ id: 'exhalar', duracion: 5000 }),
  Object.freeze({ id: 'pausa', duracion: 3000 }),
])

export const IDS_FASE = Object.freeze(FASES.map((fase) => fase.id))

/** 13 s exactos (SPEC_08, criterio 1). */
export const DURACION_CICLO = FASES.reduce((total, fase) => total + fase.duracion, 0)

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
 *   medias sin volver a empezarlo.
 */
export function faseEn(ms, ciclos = CICLOS) {
  const transcurrido = Math.max(0, Number(ms) || 0)
  const total = DURACION_CICLO * ciclos

  if (transcurrido >= total) {
    return { fase: null, ciclo: ciclos, progreso: 1, restante: 0, terminado: true }
  }

  const ciclo = Math.floor(transcurrido / DURACION_CICLO)
  let dentro = transcurrido - ciclo * DURACION_CICLO

  for (const fase of FASES) {
    if (dentro < fase.duracion) {
      return {
        fase: fase.id,
        ciclo,
        progreso: dentro / fase.duracion,
        restante: fase.duracion - dentro,
        terminado: false,
      }
    }
    dentro -= fase.duracion
  }

  // Inalcanzable: las tres fases suman el ciclo entero. Si algún día alguien
  // cambia una duración y se olvida de otra, esto lo deja en la última fase en
  // vez de devolver un estado imposible.
  const ultima = FASES[FASES.length - 1]
  return { fase: ultima.id, ciclo, progreso: 1, restante: 0, terminado: false }
}

/**
 * Suavizado del movimiento del círculo.
 *
 * Una interpolación lineal se lee como una máquina; esta curva entra y sale sin
 * tirones, que es lo que hace que se pueda seguir con el cuerpo.
 */
function suavizar(progreso) {
  const t = Math.min(1, Math.max(0, progreso))
  return t * t * (3 - 2 * t)
}

/**
 * Escala del círculo en una fase (§5.1.2): 1,0 → 1,18 al inhalar, de vuelta al
 * exhalar, y quieto en la pausa. Sin desplazamiento, sin rotación, sin
 * partículas.
 */
export function escalaEn(fase, progreso) {
  const recorrido = ESCALA_PLENA - ESCALA_REPOSO
  if (fase === 'inhalar') return ESCALA_REPOSO + recorrido * suavizar(progreso)
  if (fase === 'exhalar') return ESCALA_PLENA - recorrido * suavizar(progreso)
  return ESCALA_REPOSO
}
