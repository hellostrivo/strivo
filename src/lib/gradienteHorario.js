// src/lib/gradienteHorario.js
// El color del fondo según la hora (§18).
//
// Que la app sepa qué hora es sin decirlo: abrir Strivo a las 7:00 y a las 22:00
// se siente distinto antes de leer una sola palabra.
//
// Las anclas viven en @tokens (`gradientesInicio`) y aquí solo se interpola
// entre las dos que rodean el momento actual, en círculo: a las 11:40 el fondo
// está a medio camino entre mañana y mediodía. Un salto a una hora redonda
// delataría el mecanismo.
//
// Nota sobre @lib/timeSlot: aquel decide *qué contenido* toca y depende de los
// horarios que la persona declaró; este decide *de qué color* es el fondo y
// sigue al reloj. Son preguntas distintas, así que no se reescribe aquel para
// responder esta.

import { colors, gradientesInicio } from '@tokens'

const HORAS_DEL_DIA = 24

// ─── Color ───────────────────────────────────────────────────────────────────
const aRGB = hex => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

const aHex = ([r, g, b]) =>
  '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()

const mezclar = (desde, hasta, t) =>
  aHex(aRGB(desde).map((canal, i) => canal + (aRGB(hasta)[i] - canal) * t))

// Luminancia relativa (WCAG 2.1)
export function luminancia(hex) {
  const [r, g, b] = aRGB(hex).map(canal => {
    const v = canal / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contraste(unColor, otro) {
  const [claro, oscuro] = [luminancia(unColor), luminancia(otro)].sort((a, b) => b - a)
  return (claro + 0.05) / (oscuro + 0.05)
}

// ─── La hora dentro del círculo del día ──────────────────────────────────────
const horaDecimal = fecha => fecha.getHours() + fecha.getMinutes() / 60

// Las dos anclas que rodean a una hora, y cuánto se ha recorrido entre ellas.
// El día es un círculo: después de la última ancla viene la primera del día
// siguiente, así que la madrugada enlaza con la noche sin costura.
function tramoDe(hora) {
  const anclas = gradientesInicio
  const ultima = anclas[anclas.length - 1]

  for (let i = 0; i < anclas.length; i += 1) {
    const desde = anclas[i]
    const hasta = anclas[i + 1]
    if (hasta && hora >= desde.hora && hora < hasta.hora) {
      return { desde, hasta, t: (hora - desde.hora) / (hasta.hora - desde.hora) }
    }
  }

  // Entre la última ancla y la primera del día siguiente
  const primera = anclas[0]
  const tramo   = HORAS_DEL_DIA - ultima.hora + primera.hora
  const andado  = hora >= ultima.hora ? hora - ultima.hora : HORAS_DEL_DIA - ultima.hora + hora
  return { desde: ultima, hasta: primera, t: andado / tramo }
}

/**
 * El fondo que toca ahora mismo.
 *
 * Devuelve también el color con el que se lee encima: sobre el azul de la noche
 * el texto tiene que ser claro. No es "oscurecer el texto" (§18.4) sino lo
 * contrario, y es la única forma de mantener el contraste sin colgarle un velo
 * negro al degradado, que apagaría justo el efecto que se busca.
 */
export function fondoHorario(fecha = new Date()) {
  const { desde, hasta, t } = tramoDe(horaDecimal(fecha))

  const from = mezclar(desde.from, hasta.from, t)
  const to   = mezclar(desde.to, hasta.to, t)

  // De los dos colores del sistema gana el que se lea mejor sobre la mezcla.
  // Así el cambio de tinta ocurre donde el fondo de verdad cruza, y no a una
  // hora fija que podría caer en medio de la interpolación.
  const contrasteInk   = Math.min(contraste(colors.ink, from), contraste(colors.ink, to))
  const contrastePaper = Math.min(contraste(colors.paper, from), contraste(colors.paper, to))
  const sobreOscuro    = contrastePaper > contrasteInk

  return {
    desde: desde.id,
    hasta: hasta.id,
    from,
    to,
    gradiente: `linear-gradient(170deg, ${from} 0%, ${to} 100%)`,
    texto: sobreOscuro ? colors.paper : colors.ink,
    sobreOscuro,
    contraste: Math.max(contrasteInk, contrastePaper),
  }
}
