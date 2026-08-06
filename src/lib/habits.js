// src/lib/habits.js
// El módulo de Hábitos (§5.7): ciclo de vida y proyección a los rituales.
//
// PROYECCIÓN (RN-HR-01). No hay ningún paso de "añadir al ritual": un hábito
// aparece en un ritual porque su `momento` dice que le toca. Los rituales
// preguntan por getActiveHabitsForMoment(userId, momento, díaDeLaSemana), así
// que crear uno de mañana lo pone en R4 y en la Vista al instante, y pausarlo
// lo saca sin borrar nada.
//
// CICLO DE VIDA. activo ⇄ pausado, y archivado como salida definitiva. Ninguno
// borra: pausar y archivar conservan hábito, marcas e historial íntegros
// (RN-04), y el contador de veces nunca baja (§7.2).
//
// Los hábitos de momento 'dia' no se proyectan a ningún ritual: viven en la
// lista y se marcan desde ahí.

import { copy } from '@copy'
import {
  getHabits,
  getHabit,
  saveHabit,
  getHabitLogsInRange,
} from '@lib/db'
import { newId } from '@lib/user'
import { todayKey, previousDayKey } from '@lib/timeSlot'

export const MOMENTOS = ['manana', 'noche', 'dia']

export const DIAS_TODOS = [0, 1, 2, 3, 4, 5, 6]

export function nombreDeMomento(momento) {
  const indice = MOMENTOS.indexOf(momento)
  return copy.habits.create.moments[indice] ?? momento
}

export function grupoDeMomento(momento) {
  const indice = MOMENTOS.indexOf(momento)
  return copy.habits.list.groups[indice] ?? momento
}

// ─── Lista (H1) ──────────────────────────────────────────────────────────────

/**
 * Agrupa por momento, en el orden en que transcurre el día. Los pausados salen
 * aparte y al final: siguen ahí, sin mezclarse con lo de hoy y sin presentarse
 * como pendientes (RN-05).
 *
 * Los archivados no se listan.
 */
export function agruparPorMomento(habitos) {
  const activos  = habitos.filter(h => h.estado === 'activo')
  const pausados = habitos.filter(h => h.estado === 'pausado')

  return {
    grupos: MOMENTOS.map(momento => ({
      momento,
      titulo: grupoDeMomento(momento),
      habitos: activos.filter(h => h.momento === momento),
    })).filter(grupo => grupo.habitos.length > 0),
    pausados,
    totalActivos: activos.length,
  }
}

export async function loadHabitos(userId) {
  const habitos = await getHabits(userId)
  return habitos.filter(h => h.estado !== 'archivado')
}

// ─── Crear (H3) ──────────────────────────────────────────────────────────────

/**
 * Un hábito nuevo nace activo y con todos los días marcados salvo que se diga
 * otra cosa. Desde ese momento ya le toca en su ritual: no hay que hacer nada
 * más (RN-HR-01).
 */
export async function crearHabito(userId, { nombre, areaId = null, momento = 'manana', diasSemana = DIAS_TODOS }) {
  const habito = {
    id: newId(),
    userId,
    nombre: nombre.trim(),
    areaId,
    momento,
    diasSemana: [...diasSemana].sort((a, b) => a - b),
    estado: 'activo',
    totalCompletados: 0,
    creadoEn: new Date().toISOString(),
  }
  await saveHabit(habito)
  return habito
}

/**
 * Sugerencias por área (copy.habits.suggestions), sin repetir lo que ya existe:
 * no se ofrece crear dos veces el mismo hábito.
 */
export function sugerenciasPara(areas, habitosExistentes = []) {
  const yaEstan = new Set(habitosExistentes.map(h => h.nombre.toLowerCase()))

  if (!areas.length) {
    return (copy.habits.suggestions.personal ?? [])
      .filter(texto => !yaEstan.has(texto.toLowerCase()))
      .map(texto => ({ texto, areaId: null, color: undefined }))
  }

  return areas.flatMap(area =>
    (copy.habits.suggestions[area.tipo] ?? [])
      .filter(texto => !yaEstan.has(texto.toLowerCase()))
      .map(texto => ({ texto, areaId: area.id, color: area.color }))
  )
}

// ─── Ciclo de vida ───────────────────────────────────────────────────────────

export async function pausarHabito(habito) {
  return cambiarEstado(habito, 'pausado')
}

export async function reanudarHabito(habito) {
  return cambiarEstado(habito, 'activo')
}

export async function archivarHabito(habito) {
  return cambiarEstado(habito, 'archivado')
}

// Se relee la fila antes de escribirla en vez de guardar la copia que tenga la
// pantalla: entre que se abrió el detalle y se toca "Pausar", el hábito pudo
// marcarse desde el ritual o desde la lista, y guardar la copia vieja borraría
// esa marca del contador. Cambiar de estado nunca puede tocar el historial.
async function cambiarEstado(habito, estado) {
  const actual = (await getHabit(habito.id)) ?? habito
  const actualizado = { ...actual, estado }
  await saveHabit(actualizado)
  return actualizado
}

// ─── Detalle (H2) ────────────────────────────────────────────────────────────

const DIAS_CUADRICULA = 90

/**
 * La cuadrícula de los últimos 90 días, del más antiguo al de hoy.
 *
 * Cada celda es `hecho: true` o `hecho: false`, y nada más. No existe el estado
 * "fallado": la ausencia de marca es ausencia (§7.2), y así se pinta — con menos
 * tinta, nunca en rojo.
 */
export function cuadriculaDe(logs, hasta = todayKey(), dias = DIAS_CUADRICULA) {
  const hechos = new Set(logs.map(log => log.fecha))

  const fechas = []
  let fecha = hasta
  for (let i = 0; i < dias; i++) {
    fechas.push(fecha)
    fecha = previousDayKey(fecha)
  }

  return fechas
    .reverse()
    .map(f => ({ fecha: f, hecho: hechos.has(f) }))
}

export function rangoDeCuadricula(hasta = todayKey(), dias = DIAS_CUADRICULA) {
  let desde = hasta
  for (let i = 1; i < dias; i++) desde = previousDayKey(desde)
  return { desde, hasta }
}

export async function loadDetalleHabito(habito, hasta = todayKey()) {
  const { desde } = rangoDeCuadricula(hasta)
  const logs = await getHabitLogsInRange(habito.id, desde, hasta)

  const cuadricula = cuadriculaDe(logs, hasta)
  const ultimos30  = cuadricula.slice(-30).filter(dia => dia.hecho).length

  return {
    cuadricula,
    ultimos30,
    // El total desnormalizado del hábito (§7.2): cuenta todas las veces, no
    // solo las que caben en la cuadrícula
    total: habito.totalCompletados ?? 0,
  }
}
