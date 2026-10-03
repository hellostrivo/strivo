#!/usr/bin/env node
// scripts/recordatorio-pausa.js
// El recordatorio editorial del miércoles (DP-28.12): ¿tiene el lunes que viene
// una cápsula `programada` válida? Imprime `{ hace_falta, titulo, cuerpo }` en
// JSON, y el workflow `recordatorio-pausa.yml` abre el issue si hace falta.
//
//   node scripts/recordatorio-pausa.js [--ahora <ISO 8601 con desfase>]
//
// Como el script del canal, aquí solo hay E/S: qué ocupa cada semana lo decide
// `calendarioEfectivo`, con el instante del lunes que viene. «Válida» es lo que
// el calendario acepta —no piloto, y pasando `validar`—, así que una
// programada con faltas no cuenta, y se dice.
//
// El título lleva la fecha del lunes y no cambia con el caso, para que se
// pueda buscar y para que el workflow no abra dos issues por la misma semana.

import { realpathSync } from 'fs'
import { pathToFileURL } from 'url'

import { leerCapsulas } from './publicar-pausa.js'
import {
  LIMITE_VALIDACION_FINAL,
  esMarca,
  fechaEnZona,
  instanteEnZona,
  limiteValidacionFinal,
  lunesDe,
  sumarDias,
} from '../src/unaPausa/modelo/semana.js'
import { calendarioEfectivo } from '../src/unaPausa/modelo/vigente.js'

/**
 * @param {{raiz?: string, ahora?: Date|number|string}} [opciones]
 * @returns {{hace_falta: boolean, titulo: string, cuerpo: string}}
 */
export function recordatorio({ raiz, ahora = new Date() } = {}) {
  const lunes = sumarDias(lunesDe(ahora), 7)
  const capsulas = leerCapsulas(raiz).leidas.map((l) => l.capsula)
  const ese = calendarioEfectivo(capsulas, instanteEnZona(lunes)).find((e) => e.weekStart === lunes)
  const titulo = `Una pausa: sin cápsula programada para el lunes ${lunes}`

  if (ese?.origen === 'programada') {
    return {
      hace_falta: false,
      titulo,
      cuerpo: `El lunes ${lunes} se publica «${ese.id}». No hace falta nada.`,
    }
  }

  const parrafos = [`El lunes ${lunes} no tiene una cápsula \`programada\` válida.`]

  const conFaltas = capsulas.filter(
    (c) => c?.status === 'programada' && c.weekStart === lunes && c.piloto !== true,
  )
  if (conFaltas.length > 0) {
    const ids = conFaltas.map((c) => `«${c.id}»`).join(', ')
    parrafos.push(
      `Hay programada para esa semana ${ids}, pero no pasa el validador: ` +
        '`npm run canal -- --salida /tmp/canal` dice qué le falta.',
    )
  }

  if (ese?.origen === 'reserva') {
    parrafos.push(`Si nada cambia, ese lunes entra la reserva «${ese.id}».`)
  } else if (ese?.origen === 'repetida') {
    parrafos.push(
      `No queda ninguna reserva libre: si nada cambia, ese lunes se repite «${ese.id}», la cápsula de la semana anterior.`,
    )
  } else {
    parrafos.push('Si nada cambia, ese lunes no habrá ninguna cápsula en el canal.')
  }

  const cierre = fechaEnZona(limiteValidacionFinal(lunes))
  parrafos.push(
    `Para que salga una cápsula nueva, la validación final cierra el ${cierre} a las ` +
      `${LIMITE_VALIDACION_FINAL.hora} de Monterrey, y se programa antes del lunes a las 00:00.`,
  )

  return { hace_falta: true, titulo, cuerpo: parrafos.join('\n\n') }
}

function main(argv) {
  const i = argv.indexOf('--ahora')
  const ahora = i === -1 ? new Date() : argv[i + 1]
  if (i !== -1 && !esMarca(ahora)) {
    console.error('--ahora va en ISO 8601 con desfase, como 2026-12-09T09:00:00-06:00.')
    return 1
  }
  console.log(JSON.stringify(recordatorio({ ahora })))
  return 0
}

function invocadoDirectamente() {
  try {
    return pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url
  } catch {
    return false
  }
}

if (invocadoDirectamente()) process.exitCode = main(process.argv.slice(2))
