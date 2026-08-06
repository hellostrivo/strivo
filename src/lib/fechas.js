// src/lib/fechas.js
// Fechas en palabras. Los nombres viven en @copy; aquí solo se componen.
//
// Se trabaja siempre con claves 'YYYY-MM-DD' y con fechas locales: nada de
// toISOString(), que en México adelanta el día por la tarde (ver @lib/timeSlot).

import { copy, interpolate } from '@copy'

export function partesDe(fecha) {
  const [ano, mes, dia] = fecha.split('-').map(Number)
  return { ano, mes, dia }
}

export function aDate(fecha) {
  const { ano, mes, dia } = partesDe(fecha)
  return new Date(ano, mes - 1, dia)
}

/** Día de la semana en el formato del modelo: 0 = lunes, 6 = domingo */
export function diaDeLaSemana(fecha) {
  const dia = aDate(fecha).getDay()   // 0 = domingo en JS
  return dia === 0 ? 6 : dia - 1
}

/** "5 de agosto" · con el año si no es el actual */
export function fechaEnPalabras(fecha, anoActual = new Date().getFullYear()) {
  const { ano, mes, dia } = partesDe(fecha)
  const nombreMes = copy.months.long[mes - 1]

  return ano === anoActual
    ? interpolate(copy.months.dayTemplate, { dia, mes: nombreMes })
    : interpolate(copy.months.dayYearTemplate, { dia, mes: nombreMes, ano })
}

/** "Miércoles, 5 de agosto" */
export function fechaConDiaSemana(fecha, anoActual) {
  return interpolate(copy.months.weekdayTemplate, {
    diaSemana: copy.days.long[diaDeLaSemana(fecha)],
    fecha: fechaEnPalabras(fecha, anoActual),
  })
}

/** "agosto de 2026" */
export function mesEnPalabras(ano, mes) {
  return interpolate(copy.months.monthTemplate, {
    mes: copy.months.long[mes - 1],
    ano,
  })
}

export function clave(ano, mes, dia) {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

export function diasEnElMes(ano, mes) {
  return new Date(ano, mes, 0).getDate()
}

/** Primer y último día del mes, como claves */
export function rangoDelMes(ano, mes) {
  return {
    desde: clave(ano, mes, 1),
    hasta: clave(ano, mes, diasEnElMes(ano, mes)),
  }
}

/**
 * La rejilla del calendario: los huecos de delante para que el 1 caiga en su
 * columna, y después los días del mes. La semana empieza en lunes, como el
 * resto de la app (§7.2, diasSemana 0 = lunes).
 */
export function rejillaDelMes(ano, mes) {
  const huecos = diaDeLaSemana(clave(ano, mes, 1))
  const total  = diasEnElMes(ano, mes)

  return [
    ...Array.from({ length: huecos }, () => null),
    ...Array.from({ length: total }, (_, i) => clave(ano, mes, i + 1)),
  ]
}

export function mesAnterior(ano, mes) {
  return mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 }
}

export function mesSiguiente(ano, mes) {
  return mes === 12 ? { ano: ano + 1, mes: 1 } : { ano, mes: mes + 1 }
}
