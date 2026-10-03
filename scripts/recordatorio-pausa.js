#!/usr/bin/env node
// scripts/recordatorio-pausa.js
// El recordatorio editorial del miércoles (DP-28.12 y DP-28.23): ¿tiene el
// lunes que viene una cápsula `programada` válida, y se podría construir el
// canal ese lunes? Imprime `{ hace_falta, titulo, cuerpo }` en JSON, y el
// workflow `recordatorio-pausa.yml` abre el issue si hace falta.
//
//   node scripts/recordatorio-pausa.js [--ahora <ISO 8601 con desfase>]
//
// Como el script del canal, aquí solo hay E/S: qué ocupa cada semana lo decide
// `calendarioEfectivo`, con el instante del lunes que viene. «Válida» es lo que
// el calendario acepta —no piloto, y pasando `validar`—, así que una
// programada con faltas no cuenta, y se dice. Si el canal no se podría
// construir —un archivo roto, un choque, otra cápsula lista con faltas, una
// portada que falta—, hace falta aunque la programada esté bien: el lunes el
// build fallaría y no saldría. Eso lo dice `revisar`, del script del canal.
//
// El título lleva la fecha del lunes y no cambia con el caso —hay dos motivos
// posibles y uno no excluye al otro—, para que se pueda buscar y para que el
// workflow no abra dos issues por la misma semana.

import { realpathSync } from 'fs'
import { pathToFileURL } from 'url'

import { lineaDe, revisar } from './publicar-pausa.js'
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
  // Lo que rompe el canal lo decide `revisar`, sin vista previa: es el build
  // que correrá el lunes. Aquí no se copia esa regla.
  const { faltas, capsulas } = revisar({ raiz })
  const ese = calendarioEfectivo(capsulas, instanteEnZona(lunes)).find((e) => e.weekStart === lunes)
  const titulo = `Una pausa: revisar el lunes ${lunes}`
  const programada = ese?.origen === 'programada'

  if (programada && faltas.length === 0) {
    return {
      hace_falta: false,
      titulo,
      cuerpo: `El lunes ${lunes} se publica «${ese.id}». No hace falta nada.`,
    }
  }

  const parrafos = []

  if (faltas.length > 0) {
    parrafos.push(
      `El lunes ${lunes} el canal no se podría construir: el build fallaría y seguiría ` +
        'la cápsula de la semana anterior. Esto es lo que lo impide:',
      faltas.map((f) => `- ${lineaDe(f)}`).join('\n'),
    )
  }

  if (!programada) {
    parrafos.push(`El lunes ${lunes} no tiene una cápsula \`programada\` válida.`)

    const conFaltas = capsulas.filter(
      (c) => c?.status === 'programada' && c.weekStart === lunes && c.piloto !== true,
    )
    if (conFaltas.length > 0) {
      const ids = conFaltas.map((c) => `«${c.id}»`).join(', ')
      parrafos.push(`Hay programada para esa semana ${ids}, pero no pasa el validador.`)
    }

    const siNada = faltas.length > 0 ? 'Con eso resuelto' : 'Si nada cambia'
    if (ese?.origen === 'reserva') {
      parrafos.push(`${siNada}, ese lunes entra la reserva «${ese.id}».`)
    } else if (ese?.origen === 'repetida') {
      parrafos.push(
        `No queda ninguna reserva libre: ${siNada.toLowerCase()}, ese lunes se repite «${ese.id}», la cápsula de la semana anterior.`,
      )
    } else {
      parrafos.push(`${siNada}, ese lunes no habrá ninguna cápsula en el canal.`)
    }

    const cierre = fechaEnZona(limiteValidacionFinal(lunes))
    parrafos.push(
      `Para que salga una cápsula nueva, la validación final cierra el ${cierre} a las ` +
        `${LIMITE_VALIDACION_FINAL.hora} de Monterrey, y se programa antes del lunes a las 00:00.`,
    )
  }

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
