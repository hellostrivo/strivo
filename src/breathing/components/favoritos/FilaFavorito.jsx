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

// `subtitulo` y `duracionCorta` viven en `breathing/lib/favoritos.js` desde
// SPEC_24: los lee también el archivo de «Llevarme lo que escribí». Se siguen
// exportando desde aquí para quien ya los importaba.
import { copy } from '@copy'
import { subtitulo } from '../../lib/favoritos.js'

export { duracionCorta, subtitulo } from '../../lib/favoritos.js'

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
