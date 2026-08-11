// src/lib/constancia.js
// Los cálculos de constancia, sin interfaz y sin red: entran registros, sale un
// número. Por eso se pueden probar sin montar un solo componente (SPEC_05 §6).
//
// RN-06 — Constancia = `count(distinct fecha)`. **Solo sube.** No se reinicia y
// no hay nada que se pueda perder por dejar pasar un día: la métrica que se
// rompe al fallar un día no existe en este producto, ni con ese nombre ni con
// ningún otro. Al ser una consulta derivada y no un contador guardado, es
// imposible que un error de sincronización la estropee.
//
// Este archivo es el **único** sitio donde vive esa cuenta. `formia/habitos.js`
// la importa de aquí en vez de reimplementarla: tener la misma regla escrita
// dos veces fue lo que §5.7.4 nos obligó a corregir con `habitAreaLabel.js`.
//
// RN-DB4-01 — Solo `formia/`. Aquí no entra ánimo, ni journal, ni victorias.
// Una consecuencia que conviene tener presente: §5.9 define la Constancia como
// "días con al menos un registro", contando **cualquier** registro. Desde
// Formia solo se ven los `habitLogs`, así que lo que se cuenta aquí son días en
// los que se marcó algún hábito. La cifra verdaderamente global cruza los dos
// espacios y es material de Fase 2 (§C7.4).

import { AREA_CATALOG, AREA_IDS, IDENTITY_CENTRAL } from '@/lib/db'

/**
 * Ventana del insight de evidencia de identidad. Es la del propio ejemplo del
 * blueprint: "en Salud lo demostraste 18 de los últimos 28 días" (§C4.3).
 */
export const DIAS_VENTANA_EVIDENCIA = 28

/**
 * Mínimo para que la frase sea verdad y no ruido. Sale de §5.9, criterio 1:
 * "con menos de 10 registros no se genera ningún insight". Con tres días de
 * datos la frase no dice nada, y una frase que no dice nada gasta la confianza
 * que hace falta para las que sí dirán algo.
 */
export const MINIMO_DIAS_CON_EVIDENCIA = 10

// ─── Fechas ───────────────────────────────────────────────────────────────────

/** Las últimas `n` fechas, de la más antigua a hoy. */
export function ultimasFechas(n, hoy) {
  const fechas = []
  const base = new Date(`${hoy}T12:00:00`)
  for (let i = n - 1; i >= 0; i -= 1) {
    const dia = new Date(base.getTime())
    dia.setDate(dia.getDate() - i)
    const year = dia.getFullYear()
    const month = String(dia.getMonth() + 1).padStart(2, '0')
    const day = String(dia.getDate()).padStart(2, '0')
    fechas.push(`${year}-${month}-${day}`)
  }
  return fechas
}

// ─── Constancia de un hábito ──────────────────────────────────────────────────

/** Fechas en las que se marcó un hábito. Marcarlo cinco veces un día es una. */
export function fechasDe(logs, habitId) {
  return new Set(logs.filter((log) => log.habitId === habitId).map((log) => log.date))
}

/** RN-06 — Días distintos en que se hizo. Solo sube. */
export function constanciaDe(logs, habitId) {
  return fechasDe(logs, habitId).size
}

/** Cuántos de los últimos `n` días tienen marca. En positivo, siempre. */
export function ultimosNDias(logs, habitId, hoy, n) {
  const fechas = fechasDe(logs, habitId)
  return ultimasFechas(n, hoy).filter((fecha) => fechas.has(fecha)).length
}

/** Ids de los hábitos marcados en una fecha. */
export function marcadosEn(logs, fecha) {
  return new Set(logs.filter((log) => log.date === fecha).map((log) => log.habitId))
}

// ─── Constancia agregada ──────────────────────────────────────────────────────

/**
 * Días distintos con al menos un hábito marcado. Dejar de marcar una semana no
 * baja este número: no hay nada que restar, porque los días que no se marcaron
 * nunca se escribieron (RN-06, RN-HB-05).
 */
export function constanciaTotal(logs) {
  return new Set(logs.map((log) => log.date)).size
}

/** Los registros de los hábitos que cuelgan de una identidad. */
export function logsDeIdentidad(logs, habits, identityRef) {
  const ids = new Set(
    habits.filter((habit) => habit.identityRef === identityRef).map((habit) => habit.id),
  )
  return logs.filter((log) => ids.has(log.habitId))
}

/** Días distintos en que se construyó una identidad. */
export function constanciaDeIdentidad(logs, habits, identityRef) {
  return constanciaTotal(logsDeIdentidad(logs, habits, identityRef))
}

// ─── El insight de evidencia de identidad (§C7.4) ─────────────────────────────

/**
 * Evidencia de identidad, **sin correlación**: lo único de Strivo Intelligence
 * que entra en Fase 1. Solo lee `formia/`, así que no cruza espacios y puede
 * vivir aquí sin violar RN-DB4-01 (§C7.4).
 *
 * Se genera **por reglas, no por IA** (§C4.2): sin coste, sin latencia y sin
 * consentimiento que pedir (RN-SI-05).
 *
 * RN-SI-03 — Devuelve las fechas que la sostienen, no solo el número: un
 * insight que no puede citar su evidencia no se genera.
 *
 * @returns {{dias: number, ventana: number, fechas: string[]}|null}
 *   `null` cuando no hay bastante para que la frase sea verdad. No se devuelve
 *   una versión descafeinada ni un "te faltan cuatro días": eso convertiría el
 *   umbral en una meta, y aquí no hay metas (RN-05).
 */
export function evidenciaDeIdentidad(logs, habits, identityRef, hoy) {
  const ventana = new Set(ultimasFechas(DIAS_VENTANA_EVIDENCIA, hoy))
  const fechas = [...new Set(logsDeIdentidad(logs, habits, identityRef).map((log) => log.date))]
    .filter((fecha) => ventana.has(fecha))
    .sort()

  if (fechas.length < MINIMO_DIAS_CON_EVIDENCIA) return null
  return { dias: fechas.length, ventana: DIAS_VENTANA_EVIDENCIA, fechas }
}

// ─── La vista completa ────────────────────────────────────────────────────────

/**
 * Progreso agrupado por identidad (§C3.7, RN-FO-ID-04): una consulta sobre
 * `identityRef`, no un campo nuevo.
 *
 * **Cuenta todos los hábitos, activos o no.** Si los pausados quedaran fuera,
 * pausar un hábito bajaría la constancia de su identidad — y la constancia solo
 * sube (RN-06). Lo registrado sigue registrado (RN-HB-02).
 *
 * **El orden nunca depende de la cantidad.** Es el mismo de siempre: la
 * identidad central primero, después las áreas en su orden de catálogo. Ordenar
 * por cuánto se ha hecho pondría a alguien "lo peor" arriba, que es justo lo
 * que RN-05 prohíbe. Comparar áreas entre sí tampoco entra (SPEC_05 §10).
 */
export function progresoPorIdentidad(habits, logs, areas, hoy) {
  const identidades = [
    { identityRef: IDENTITY_CENTRAL, tipo: 'central', color: null, activa: true, orden: -1 },
    ...AREA_IDS.map((areaId) => ({
      identityRef: areaId,
      tipo: 'area',
      color: areas?.[areaId]?.color ?? AREA_CATALOG[areaId].color,
      activa: areas?.[areaId]?.selected === true,
      orden: areas?.[areaId]?.order ?? AREA_CATALOG[areaId].order,
    })),
  ]

  return identidades
    .map((identidad) => {
      const propios = habits
        .filter((habit) => habit.identityRef === identidad.identityRef)
        .sort((a, b) => String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? '')))

      return {
        ...identidad,
        habitos: propios.map((habito) => ({
          ...habito,
          total: constanciaDe(logs, habito.id),
        })),
        dias: constanciaDeIdentidad(logs, habits, identidad.identityRef),
        evidencia: evidenciaDeIdentidad(logs, habits, identidad.identityRef, hoy),
      }
    })
    .filter((identidad) => identidad.habitos.length > 0)
    .sort((a, b) => Number(b.activa) - Number(a.activa) || a.orden - b.orden)
}
