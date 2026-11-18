// src/breathing/lib/favoritos.js
// Cómo se dice una combinación guardada en una línea (§4.3).
//
// Vivían en `FilaFavorito.jsx`; salieron aquí en SPEC_24 porque las leen dos:
// la fila de la lista y el archivo de «Llevarme lo que escribí». Una regla, un
// sitio.
//
// El subtítulo se genera, no se guarda: si mañana cambia el nombre de un patrón,
// las filas ya guardadas lo dicen bien sin migrar nada.

import { copy } from '@copy'
import { obtenerSonido, ID_SILENCIO } from '../data/catalogoSonidos.js'
import { obtenerPreset } from '../data/catalogoPatrones.js'

/**
 * `{patrón} · {sonido} · {duración}`, omitiendo el sonido si es silencio.
 *
 * Se omite porque "Silencio" en la línea de resumen ocupa el sitio de algo que
 * sí informa, y porque la ausencia de sonido ya se nota al usarla.
 */
export function subtitulo(favorito) {
  const patron = obtenerPreset(favorito.patronBaseId)
  const partes = []

  if (patron !== null) partes.push(copy.respiracion.patrones[patron.claveCopy].nombre)

  const sonidoId = favorito.sonidoAmbienteId ?? ID_SILENCIO
  if (sonidoId !== ID_SILENCIO && obtenerSonido(sonidoId) !== null) {
    partes.push(copy.respiracion.sonidos[obtenerSonido(sonidoId).claveCopy].nombre)
  }

  partes.push(duracionCorta(favorito.duracion))
  return partes.join(copy.respiracion.favoritos.separador)
}

/** La duración en su forma más corta, con el copy de SPEC_13. */
export function duracionCorta(duracion) {
  const textos = copy.respiracion.duracion
  if (duracion?.modo === 'abierta') return textos.abierta
  const plantilla = duracion?.modo === 'ciclos' ? textos.ciclos : textos.minutos
  return plantilla.replace('{n}', String(duracion?.valor ?? ''))
}
