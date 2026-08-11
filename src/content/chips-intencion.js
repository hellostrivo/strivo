// src/content/chips-intencion.js
// Los seis chips de la intención del día (§C2.4, ex-R5).
//
// Va en `content/` por el mismo motivo que las frases del día: es material
// editorial y se revisa aparte del código que lo pinta.
//
// **Los seis son adverbiales y eso no es un detalle de estilo.** La intención
// responde al *cómo* se atraviesa el día; la gran visión del Diario responde al
// *qué* pasa en un gran día (§C2.4.1). Si un chip se puede completar con un
// objeto directo —"con foco *en el informe*"— ha dejado de ser una intención y
// se ha convertido en un objetivo pequeño, y entonces la distinción entre las
// dos superficies se ha perdido.
//
// Son los seis literales de §5.5 R5, sin añadidos: el catálogo cerrado es parte
// de que la respuesta quepa en un toque.
//
// **Ninguno lleva marca de género.** Son sintagmas preposicionales y un
// adjetivo invariable: "con calma" es igual para cualquiera, así que no hace
// falta el helper de §3.6.5 y no hay tres repertorios que mantener.
//
// RN-GEN-04 — Se persiste el texto, no el `id`. Es la excepción razonada del
// modelo: `dailyIntention.intentionText` es un campo de texto libre y el chip
// no es más que un atajo para escribirlo. Guardar un id obligaría a decidir qué
// pasa cuando alguien escribe a mano exactamente "con calma".

export const CHIPS = Object.freeze([
  Object.freeze({ id: 'calma', texto: 'con calma' }),
  Object.freeze({ id: 'foco', texto: 'con foco' }),
  Object.freeze({ id: 'paciencia', texto: 'con paciencia' }),
  Object.freeze({ id: 'valentia', texto: 'con valentía' }),
  Object.freeze({ id: 'presente', texto: 'presente' }),
  Object.freeze({ id: 'sin_prisa', texto: 'sin prisa' }),
])

export const TEXTOS = Object.freeze(CHIPS.map((chip) => chip.texto))

/** ¿La intención guardada coincide con alguno? Decide qué chip se pinta activo. */
export function chipDe(intencion) {
  const texto = String(intencion ?? '').trim().toLowerCase()
  if (texto === '') return null
  return CHIPS.find((chip) => chip.texto === texto) ?? null
}
