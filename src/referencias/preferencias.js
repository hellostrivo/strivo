// src/referencias/preferencias.js
// Qué referencias quiere encontrar alguien en sus frases del día (SPEC_29).
//
// **Es una preferencia de contenido, no una declaración de identidad.** La
// pregunta no es «¿en qué crees?»: es qué tipo de referencias te gustaría
// encontrar. Nadie se declara religioso, espiritual ni ateo, y nada de aquí
// diagnostica ni etiqueta a nadie. Por eso tampoco hay texto libre: el modo es
// uno de cuatro identificadores y las afinidades, cuatro más.
//
// **Vive en un territorio neutral, y no es un capricho de carpetas.** La leen
// tres sitios —el onboarding, que la pregunta la primera vez; Tu perfil, que
// la vuelve a preguntar con los mismos textos; y el diario, que elige la frase
// con ella— y `eslint.config.js` no deja que el onboarding importe nada del
// diario. CLAUDE.md lo anticipaba: con un tercer consumidor, un catálogo pide
// un hogar neutral.
//
// Aquí no hay copy (vive en `copy.diario.referencias`) ni almacenamiento (lo
// pone `almacen.js`): solo el catálogo y las reglas que lo convierten en un
// perfil de frases.

/** Versión del catálogo de preferencias, guardada con la elección. */
export const VERSION = 1

/** Pregunta 1: qué tipo de referencias. Selección única. */
export const MODOS = Object.freeze([
  'guiadas',
  'espirituales_generales',
  'seculares',
  'sin_definir',
])

/** El modo de quien no contestó, saltó la pregunta o restableció su elección. */
export const MODO_POR_DEFECTO = 'sin_definir'

/** Pregunta 2: las referencias elegidas. Selección múltiple, sin prioridad entre ellas. */
export const AFINIDADES = Object.freeze(['cristianismo', 'budismo', 'hinduismo', 'estoicismo'])

/**
 * Las audiencias del catálogo editorial. `universal` llega a todo el mundo y
 * por eso es neutral; las demás solo a quien las eligió.
 */
export const AUDIENCIAS = Object.freeze([
  'universal',
  'secular',
  'espiritual_general',
  ...AFINIDADES,
])

/**
 * La elección en su forma canónica.
 *
 * Un modo desconocido vale `sin_definir`; las afinidades se filtran contra el
 * catálogo, sin repetidos y **en orden alfabético**, porque quién se eligió
 * primero no dice nada de cuál pesa más. Fuera de `guiadas` no hay
 * afinidades: alguien que cambia a «seculares» deja de tenerlas, no las
 * conserva escondidas.
 *
 * @param {?{modo?: string, afinidades?: string[]}} preferencias
 * @returns {{modo: string, afinidades: string[]}}
 */
export function normalizar(preferencias) {
  const modo = MODOS.includes(preferencias?.modo) ? preferencias.modo : MODO_POR_DEFECTO
  if (modo !== 'guiadas') return { modo, afinidades: [] }
  const elegidas = Array.isArray(preferencias?.afinidades) ? preferencias.afinidades : []
  const afinidades = [...new Set(elegidas.filter((id) => AFINIDADES.includes(id)))].sort()
  return { modo, afinidades }
}

/** Lo que se escribe: la forma canónica y la versión del catálogo. */
export function paraGuardar(preferencias) {
  return { ...normalizar(preferencias), version: VERSION }
}

/**
 * El perfil de frases que resulta de una elección: qué audiencias puede ver y
 * una clave estable para él.
 *
 * - `seculares` y `sin_definir` → universal y secular. Quien no eligió nada no
 *   recibe referencias religiosas, espirituales ni filosóficas por defecto.
 * - `espirituales_generales` → universal y espiritual general, sin tradición.
 * - `guiadas` → universal y las afinidades elegidas. **Sin ninguna elegida**
 *   es lo mismo que no haber decidido: el perfil secular.
 *
 * @returns {{clave: string, audiencias: string[], afinidades: string[]}}
 */
export function perfilDeFrases(preferencias) {
  const { modo, afinidades } = normalizar(preferencias)
  if (modo === 'guiadas' && afinidades.length > 0) {
    return {
      clave: `guiadas:${afinidades.join('+')}`,
      audiencias: ['universal', ...afinidades],
      afinidades,
    }
  }
  if (modo === 'espirituales_generales') {
    return {
      clave: 'espiritual_general',
      audiencias: ['universal', 'espiritual_general'],
      afinidades: [],
    }
  }
  return { clave: 'secular', audiencias: ['universal', 'secular'], afinidades: [] }
}

/**
 * Todos los perfiles distintos que pueden existir: el secular, el espiritual
 * general y las quince combinaciones de afinidades. Es la lista que recorren
 * las validaciones de cobertura.
 */
export function perfilesPosibles() {
  const combinaciones = []
  for (let mascara = 1; mascara < 1 << AFINIDADES.length; mascara += 1) {
    combinaciones.push(AFINIDADES.filter((_, i) => mascara & (1 << i)))
  }
  return [
    perfilDeFrases({ modo: 'sin_definir' }),
    perfilDeFrases({ modo: 'espirituales_generales' }),
    ...combinaciones.map((afinidades) => perfilDeFrases({ modo: 'guiadas', afinidades })),
  ]
}

/**
 * Hash FNV-1a de 32 bits, en hexadecimal. No es criptográfico ni lo necesita:
 * sirve para ordenar y desplazar de forma estable, sin azar y sin red.
 */
export function hash(texto) {
  let h = 0x811c9dc5
  const cadena = String(texto)
  for (let i = 0; i < cadena.length; i += 1) {
    h ^= cadena.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/**
 * La huella local de una elección. Se deriva **solo** del perfil resuelto
 * —modo y afinidades ordenadas—: ni uid, ni correo, ni nombre. Dos elecciones
 * que ven exactamente el mismo repertorio comparten huella, así que pasar de
 * «seculares» a «prefiero decidir después» no cambia la frase de hoy.
 */
export function huellaDe(preferencias) {
  return `h${VERSION}-${hash(perfilDeFrases(preferencias).clave)}`
}

/** Tocar un modo: lo elige, o lo suelta si ya estaba elegido (vuelve a `null`). */
export function alternarModo(actual, id) {
  if (!MODOS.includes(id)) return actual ?? null
  return actual === id ? null : id
}

/** Tocar una afinidad: entra o sale, sin tope y sin orden de prioridad. */
export function alternarAfinidad(actuales, id) {
  const lista = Array.isArray(actuales) ? actuales : []
  if (!AFINIDADES.includes(id)) return lista
  return lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]
}
