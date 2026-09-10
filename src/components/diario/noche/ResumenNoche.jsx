// src/components/diario/noche/ResumenNoche.jsx
// La pantalla de consulta: la noche ya escrita, tal como queda en Hoy después
// de cerrar el día.
//
// **Se ve igual que las pantallas del recorrido**, como su hermana de la
// mañana: misma tipografía de pregunta, mismo aire entre bloques, misma
// superficie. Lo que cambia es que ya no hay nada que tocar. Un resumen con
// etiquetas cortas —"Cómo cerraste · Cansada"— sería un inventario con otro
// vocabulario; con la pregunta delante, volver a leerlo es volver a lo que se
// preguntó.
//
// La reflexión trae **la pregunta que salió esa noche**, no una etiqueta
// genérica: rota, así que sin ella la respuesta quedaría sin contexto.
//
// La emoción vuelve en su píldora, con su emoji: se eligió tocando una y se
// relee en una. La forma sale de `pildora.js`, el mismo sitio del que la toma
// `ChipsCatalogo`. Aquí es un `<span>` y no un botón — parecerse a un control
// sin serlo es aceptable cuando toda la pantalla es de consulta.
//
// **La noche trae una sola ficha y la mañana hasta tres**, y aun así las dos
// pantallas pintan `fichas`: una forma de bloque para las dos consultas, no dos
// que se parezcan. Cuántas vengan es del catálogo —la noche admite hasta tres
// desde el 10 de septiembre de 2026— y esta pantalla las pinta todas.
//
// A la respuesta escrita a mano no se le pone emoji: sale su palabra entre
// comillas y la píldora se pinta igual.
//
// **No lleva etiqueta de "hecho"** y los bloques en blanco no aparecen. Con el
// contenido delante, decir "ya cerraste tu día" es contarle a alguien lo que
// está leyendo, y un hueco gris es un reproche con otra forma.
//
// **El enlace para cambiar algo es opcional** (3 sep 2026). Un día que ya pasó
// su ventana de 72 horas se pinta con esta misma pantalla y sin él: sin nada
// que tocar, un control que no lleva a ningún sitio sería peor que su ausencia.
// Sin `onEditar` no se pinta el botón, y no se pone nada en su lugar — un "ya
// no se puede editar" al pie sería un reproche con otra forma.

import { clsx } from 'clsx'
import { PILDORA, PILDORA_ELEGIDA } from '@components/shared/pildora'
import { copy } from '@copy'

const textos = copy.diario.noche

function Respuesta({ bloque }) {
  if (bloque.forma === 'chip') {
    return bloque.fichas.map((ficha) => (
      <span key={ficha.texto} className={clsx(PILDORA, PILDORA_ELEGIDA)}>
        {ficha.emoji && <span aria-hidden="true">{ficha.emoji}</span>}
        <span>{ficha.texto}</span>
      </span>
    ))
  }

  return bloque.lineas.map((linea, indice) => (
    <p key={indice} className="text-base text-on-surface whitespace-pre-wrap">
      {linea}
    </p>
  ))
}

export default function ResumenNoche({ bloques, onEditar = null }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Rótulo tenue, no un segundo título: la pantalla se identifica sin
          competir con el saludo del héroe ni con las preguntas de abajo. */}
      <p className="text-sm text-on-surface-soft">{textos.titulo}</p>

      {bloques.map((bloque) => (
        <section key={bloque.id} className="flex flex-col gap-3">
          <h2 className="font-display text-md text-on-surface">{bloque.titulo}</h2>
          <div
            className={clsx(
              'flex items-start',
              bloque.forma === 'chip' ? 'flex-wrap gap-2' : 'flex-col gap-1',
            )}
          >
            <Respuesta bloque={bloque} />
          </div>
        </section>
      ))}

      {onEditar && (
        <button
          type="button"
          onClick={onEditar}
          className={clsx(
            'self-start rounded-full px-3 py-2 min-h-touch-sm text-sm',
            'text-on-surface-soft hover:text-on-surface',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
          )}
        >
          {textos.resumen.editar}
        </button>
      )}
    </div>
  )
}
