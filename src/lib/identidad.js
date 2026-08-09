// src/lib/identidad.js
// La identidad central (P4, §7 del documento de cambios).
//
// Se escribe completando "Soy alguien que…" y se guarda SIN el prefijo, porque
// el resto de la app la interpola después de "alguien que":
//   ritualManana.r3.template · insights.area.evidenceTemplate · onboarding.p11
//
// Modelo (§7.8): `identidadCentral` es el `coreIdentity` de la especificación
// —el nombre se conserva porque ya está escrito en los perfiles guardados y en
// su historial de versiones— y `identidadCentralFuente` es `coreIdentitySource`.

// Ids de las sugerencias, en el orden en que se ofrecen. "Otro" no está aquí:
// no es una sugerencia sino el atajo para escribir la propia.
export const IDENTITY_CHIP_IDS = [
  'cuidado',
  'paz',
  'promesa',
  'intencion',
  'aprendizaje',
  'avances',
]

// Límite blando: el campo sigue aceptando texto y nada se trunca ni se bloquea.
// Solo marca a partir de dónde la frase deja de caber cómoda (§7.7).
export const IDENTIDAD_LIMITE_BLANDO = 120

// El texto tal como se guarda para el resto de la app.
//
// Las sugerencias se leen como frases terminadas ("cuida de sí misma.") pero se
// guardan sin el punto final: si no, las plantillas que la interpolan cerrarían
// con dos ("…alguien que cuida de sí misma..").
//
// Vacío es una respuesta válida (§7.6) y se guarda como null, no como "".
export function normalizarIdentidad(texto) {
  const limpio = (texto ?? '').trim().replace(/[.…\s]+$/, '')
  return limpio || null
}

// De dónde salió la frase. Solo para analítica: nunca se muestra (§7.8).
export const fuenteDeChip = id => `chip:${id}`
export const FUENTE_LIBRE = 'libre'
