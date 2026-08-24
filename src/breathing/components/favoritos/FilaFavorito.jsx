// src/breathing/components/favoritos/FilaFavorito.jsx
// Una combinación guardada (§4.3).
//
//   ┌──────────────────────────────────────────────┐
//   │  Antes de dormir                       ⋯     │
//   │  4-7-8 · Lluvia · 10 min                     │
//   └──────────────────────────────────────────────┘
//
// El subtítulo se genera, no se guarda: si mañana cambia el nombre de un patrón,
// las filas ya guardadas lo dicen bien sin migrar nada.
//
// **El menú `⋯` va separado del resto de la fila** (RN-RE-FAV-14). Tocar la fila
// carga la combinación y tocar el menú abre opciones; con las dos áreas pegadas,
// un dedo que apunta a "Eliminar" acaba cargando otra cosa, y al revés. Los dos
// destinos tienen 44 px y no se tocan entre sí.

import { copy } from '@copy'
import { obtenerSonido, ID_SILENCIO } from '../../data/catalogoSonidos.js'
import { obtenerPreset } from '../../data/catalogoPatrones.js'

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

export default function FilaFavorito({ favorito, onCargar, onOpciones, conOpciones = true }) {
  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        onClick={() => onCargar(favorito)}
        className="flex min-h-[44px] flex-1 flex-col items-start rounded-md border border-on-surface px-4 py-2 text-left"
      >
        <span className="text-sm text-on-surface">{favorito.nombre}</span>
        <span className="text-xs text-on-surface-soft">{subtitulo(favorito)}</span>
      </button>

      {conOpciones ? (
        <button
          type="button"
          onClick={() => onOpciones(favorito)}
          aria-label={copy.respiracion.favoritos.opciones}
          className="min-h-[44px] min-w-[44px] rounded-md border border-on-surface text-on-surface"
        >
          ⋯
        </button>
      ) : null}
    </div>
  )
}
