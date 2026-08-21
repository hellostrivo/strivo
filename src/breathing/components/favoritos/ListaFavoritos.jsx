// src/breathing/components/favoritos/ListaFavoritos.jsx
// Las combinaciones guardadas y las últimas veces (§4.3).
//
// Dos secciones y una sola forma de fila, porque son lo mismo con distinta
// procedencia: unas las guardó una persona y otras las apuntó la app. La
// diferencia visible es que las recientes no tienen menú —no hay nada que
// renombrar en algo que nadie nombró— y sí un marcador para ascenderlas a
// favorito (RN-RE-FAV-17).
//
// **El orden no se decide aquí** (RN-RE-FAV-06): llega hecho del repositorio,
// que ya ordena por último uso y, a igualdad, por más reciente. Sin ordenación
// manual en esta fase.

import { copy } from '@copy'
import FilaFavorito from './FilaFavorito.jsx'
import EstadoVacio from './EstadoVacio.jsx'

export default function ListaFavoritos({
  favoritos = [],
  recientes = [],
  onCargar,
  onOpciones,
  onGuardarReciente,
  eliminada = null,
  onDeshacer,
}) {
  const textos = copy.respiracion.favoritos

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>

        {favoritos.length === 0 ? (
          <EstadoVacio />
        ) : (
          <ul className="flex flex-col gap-2">
            {favoritos.map((favorito) => (
              <li key={favorito.id}>
                <FilaFavorito favorito={favorito} onCargar={onCargar} onOpciones={onOpciones} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RN-RE-FAV-08 — Deshacer durante seis segundos. Una combinación costó
          configurarla; perderla por un toque en falso es caro, y el aviso vive
          aquí y no en un diálogo para que no bloquee lo siguiente que se haga. */}
      {eliminada !== null ? (
        <p
          className="flex min-h-[44px] items-center justify-between gap-4 text-sm text-on-surface"
          role="status"
        >
          {textos.eliminada}
          <button type="button" onClick={onDeshacer} className="min-h-[44px] underline">
            {textos.deshacer}
          </button>
        </p>
      ) : null}

      {recientes.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-md text-on-surface">{textos.recientes}</h2>
          <ul className="flex flex-col gap-2">
            {recientes.map((reciente) => (
              <li key={reciente.id} className="flex items-stretch gap-2">
                <div className="flex-1">
                  <FilaFavorito favorito={reciente} onCargar={onCargar} conOpciones={false} />
                </div>
                <button
                  type="button"
                  onClick={() => onGuardarReciente(reciente)}
                  aria-label={textos.guardar}
                  className="min-h-[44px] min-w-[44px] rounded-2xl border border-on-surface text-on-surface"
                >
                  ☆
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
