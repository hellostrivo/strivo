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
// DOS MOMENTOS. Antes había un tercero, 'dia' ("a lo largo del día"), que no se
// proyectaba a ningún ritual: vivía suelto en la lista. Un hábito que no
// pertenece a ninguno de los dos momentos del día no llega a formar parte de
// ninguna ceremonia, que es de donde este producto saca su sentido. Los que
// existían pasan a la mañana (migración v7 de @lib/db) y `normalizarMomento`
// hace de red por si alguno llega tarde desde la sincronización.

import { copy } from '@copy'
import {
  getHabits,
  getHabit,
  saveHabit,
  getHabitLogsInRange,
  getHabitLogsBetween,
} from '@lib/db'
import { newId } from '@lib/user'
import { todayKey, previousDayKey } from '@lib/timeSlot'
import { semanaDe } from '@lib/fechas'

export const MOMENTOS = ['manana', 'noche']

// Los hábitos del momento retirado ('dia') se leen como de mañana: es el
// momento con el que empieza el día, así que se encuentran antes.
export const MOMENTO_POR_DEFECTO = 'manana'

export const normalizarMomento = momento =>
  MOMENTOS.includes(momento) ? momento : MOMENTO_POR_DEFECTO

// ─── La frecuencia semanal (§5.7) ────────────────────────────────────────────
//
// Un hábito ya no se ata a días concretos —"lunes, miércoles y viernes"— sino a
// cuántas veces por semana se quiere hacer: "tres veces, y yo decido cuándo".
// Es una intención, no un horario, y es lo que distingue acompañar de mandar.
//
// De ahí que el hábito esté disponible TODOS los días, y que cumplir la meta no
// lo retire: quien quiera hacerlo una vez más, puede.
export const FRECUENCIAS = [1, 2, 3, 4, 5, 6, 7]
export const FRECUENCIA_TODOS_LOS_DIAS = 7
export const FRECUENCIA_POR_DEFECTO = FRECUENCIA_TODOS_LOS_DIAS

export function normalizarFrecuencia(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n)) return FRECUENCIA_POR_DEFECTO
  return Math.min(7, Math.max(1, Math.round(n)))
}

// La meta de un hábito, incluidos los que se guardaron antes de que existiera:
// quien había marcado tres días quería hacerlo tres veces por semana.
export function metaSemanalDe(habito) {
  if (habito?.frecuenciaSemanal !== undefined) {
    return normalizarFrecuencia(habito.frecuenciaSemanal)
  }
  return normalizarFrecuencia(habito?.diasSemana?.length ?? FRECUENCIA_POR_DEFECTO)
}

/**
 * Cuánto llevas de tu intención esta semana.
 *
 * Tres estados y ninguno negativo: ir por la mitad no es ir atrasado, es ir. No
 * hay "te falta", ni aviso, ni color de alarma — la ausencia es ausencia (§7.2,
 * RN-05). Lo único que se celebra es lo que sí ocurrió.
 */
export function progresoSemanal(habito, hechas = 0) {
  const meta = metaSemanalDe(habito)
  const veces = Math.max(0, hechas)

  return {
    hechas: veces,
    meta,
    cumplida: veces >= meta,
    // Lo que va por encima de lo que se propuso. No es "de más": es un extra.
    extra: Math.max(0, veces - meta),
  }
}

/**
 * El progreso semanal de una lista de hábitos, leyendo las marcas de la semana
 * a la que pertenece `fecha`. Lo usan la lista, los rituales y el Diario, para
 * que el mismo hábito diga lo mismo en todas partes.
 */
export async function cargarProgresoSemanal(userId, habitos, fecha = todayKey()) {
  const { desde, hasta } = semanaDe(fecha)
  const logs = await getHabitLogsBetween(userId, desde, hasta)
  return progresoDeLaSemana(habitos, logs)
}

/** El progreso de cada hábito a partir de las marcas de la semana. */
export function progresoDeLaSemana(habitos, logsDeLaSemana) {
  const porHabito = new Map()
  for (const log of logsDeLaSemana) {
    porHabito.set(log.habitId, (porHabito.get(log.habitId) ?? 0) + 1)
  }

  return new Map(
    habitos.map(habito => [habito.id, progresoSemanal(habito, porHabito.get(habito.id) ?? 0)])
  )
}

export function nombreDeMomento(momento) {
  const indice = MOMENTOS.indexOf(normalizarMomento(momento))
  return copy.habits.create.moments[indice] ?? momento
}

export function grupoDeMomento(momento) {
  const indice = MOMENTOS.indexOf(normalizarMomento(momento))
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
      habitos: activos.filter(h => normalizarMomento(h.momento) === momento),
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
export async function crearHabito(userId, {
  nombre,
  areaId = null,
  emoji = null,
  momento = MOMENTO_POR_DEFECTO,
  frecuenciaSemanal = FRECUENCIA_POR_DEFECTO,
}) {
  const habito = {
    id: newId(),
    userId,
    nombre: nombre.trim(),
    areaId,
    // Su símbolo (§16.4). null cuando no se eligió ninguno: la interfaz muestra
    // el de por defecto, pero el hábito no lleva escrito uno que nadie escogió.
    emoji,
    momento: normalizarMomento(momento),
    frecuenciaSemanal: normalizarFrecuencia(frecuenciaSemanal),
    estado: 'activo',
    totalCompletados: 0,
    creadoEn: new Date().toISOString(),
  }
  await saveHabit(habito)
  return habito
}

/**
 * Editar un hábito que ya existe (H3 en modo edición).
 *
 * Conserva el id, el estado, la fecha de creación y el contador: cambiar cuándo
 * te toca un hábito no es empezarlo de cero, y su historial —las marcas viven en
 * habitLogs, aparte— no se toca. Solo se reescriben los campos que se editan.
 *
 * La nueva configuración manda desde ya: las vistas y los rituales preguntan por
 * momento y día en cada carga, así que no hay nada que sincronizar aparte.
 */
export async function actualizarHabito(habito, { nombre, areaId, emoji, momento, frecuenciaSemanal }) {
  const actualizado = {
    ...habito,
    nombre: nombre !== undefined ? nombre.trim() : habito.nombre,
    areaId: areaId !== undefined ? areaId : habito.areaId,
    emoji:  emoji  !== undefined ? emoji  : habito.emoji,
    momento: normalizarMomento(momento !== undefined ? momento : habito.momento),
    frecuenciaSemanal: normalizarFrecuencia(
      frecuenciaSemanal !== undefined ? frecuenciaSemanal : metaSemanalDe(habito)
    ),
    editadoEn: new Date().toISOString(),
  }
  await saveHabit(actualizado)
  return actualizado
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
