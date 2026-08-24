// src/lib/sugerirIdentidad.js
// Sugerencia de identidad por el texto del hábito (§C3.6.1, RN-FO-H3-04..07).
//
// Es el mismo mecanismo que §5.3 describía —"si el texto contiene señales
// claras de un área, la app **sugiere** el área con un chip tenue que el
// usuario confirma o ignora"— así que vive en `lib/` y no dentro de un espacio:
// recibe texto y una lista de áreas permitidas, y no lee datos de Lumia ni de
// Formia.
//
// **Hoy su único consumidor son los hábitos de Formia.** Las victorias de Lumia
// lo reutilizaban para deducir su vínculo con una identidad y se retiraron el
// 23 ago; el módulo se queda en `lib/` de todos modos, porque la regla que
// implementa es de §C3.6.1 y no del espacio que la llame.
//
// Las dos reglas que gobiernan el motor:
//
//   · **Nunca asigna sola** (RN-FO-H3-04). Devuelve una propuesta; confirmarla
//     es un toque de la persona.
//   · **Sin señal clara, no propone nada** (RN-FO-H3-05). No hay preselección
//     de cortesía, ni siquiera de la identidad central: no existe palabra que
//     signifique "central", y elegirla por nadie sería asignar sin señal.
//
// La cobertura es parcial y honesta a propósito. "Correr" acierta; "escribir 20
// minutos" no, y ese silencio es justo el caso que RN-FO-H3-05 cubre. Ampliar
// esta tabla con palabras ambiguas haría más daño que bien: una sugerencia
// equivocada cuesta más que ninguna sugerencia.

import { AREA_IDS } from '@/lib/db'

/**
 * Señales por área. Solo palabras que apuntan a un área **sin ambigüedad**.
 *
 * Deliberadamente fuera: "escribir" (crecimiento, trabajo o creatividad),
 * "cena" (salud o relaciones), "factura" (trabajo o finanzas), "tocar"
 * (creatividad o cualquier otra cosa). Ante la duda, no hay señal.
 */
const SENALES = Object.freeze({
  salud: [
    'correr',
    'corro',
    'carrera',
    'gym',
    'gimnasio',
    'entrenar',
    'entreno',
    'pesas',
    'ejercicio',
    'estirar',
    'estiramiento',
    'yoga',
    'caminar',
    'camino',
    'pasos',
    'nadar',
    'bici',
    'bicicleta',
    'dormir',
    'agua',
    'fruta',
    'verdura',
  ],
  trabajo: [
    'reunion',
    'reuniones',
    'junta',
    'propuesta',
    'cliente',
    'clientes',
    'correos',
    'inbox',
    'informe',
    'proyecto',
    'prioridades',
    'pendientes',
    'presentacion',
  ],
  relaciones: [
    'llamar',
    'llamada',
    'familia',
    'amigos',
    'amigas',
    'amigo',
    'amiga',
    'pareja',
    'hijos',
    'hijas',
    'mama',
    'papa',
    'abuela',
    'abuelo',
    'escuchar',
  ],
  espiritualidad: [
    'meditar',
    'meditacion',
    'orar',
    'oracion',
    'rezar',
    'misa',
    'biblia',
    'agradecer',
    'gratitud',
    'silencio',
  ],
  crecimiento: [
    'leer',
    'leo',
    'libro',
    'libros',
    'paginas',
    'estudiar',
    'estudio',
    'curso',
    'aprender',
    'idioma',
    'ingles',
  ],
  finanzas: [
    'ahorrar',
    'ahorro',
    'ahorros',
    'gastos',
    'presupuesto',
    'invertir',
    'inversion',
    'deudas',
    'finanzas',
  ],
  creatividad: [
    'dibujar',
    'dibujo',
    'pintar',
    'guitarra',
    'piano',
    'cantar',
    'componer',
    'fotografia',
    'fotos',
  ],
})

/** Minúsculas, sin acentos y partido en palabras. "Salir a Correr" → [salir, a, correr] */
export function palabrasDe(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((palabra) => palabra.length > 0)
}

/**
 * Áreas que el texto señala. Se expone para poder probar la ambigüedad aparte.
 * @returns {string[]} areaIds, sin repetir.
 */
export function areasSenaladas(texto) {
  const palabras = new Set(palabrasDe(texto))
  return AREA_IDS.filter((areaId) => SENALES[areaId].some((senal) => palabras.has(senal)))
}

/**
 * Propone una identidad para un hábito a partir de su nombre.
 *
 * @param {string} texto - Nombre del hábito, según se va escribiendo.
 * @param {string[]} areasDisponibles - Áreas **seleccionadas** ahora mismo.
 * @returns {string|null} Un `areaId`, o `null` si no hay señal clara.
 *
 * RN-FO-H3-06 — Solo propone identidades que ya existen. Un texto que señala
 * Salud cuando Salud no está entre las áreas elegidas no propone nada: el motor
 * jamás sugiere crear un área.
 *
 * Si el texto señala más de un área, tampoco propone: dos señales no son una
 * señal clara, y elegir una por la persona sería adivinar.
 */
export function sugerirIdentidad(texto, areasDisponibles = []) {
  const senaladas = areasSenaladas(texto).filter((areaId) => areasDisponibles.includes(areaId))
  return senaladas.length === 1 ? senaladas[0] : null
}

export default sugerirIdentidad
