// src/components/lumia/manana/ResumenManana.jsx
// La pantalla de consulta: la mañana ya escrita, tal como queda en Hoy el resto
// del día.
//
// **Se ve igual que las pantallas del recorrido, y esa es toda su idea.** Misma
// tipografía de pregunta, mismo aire entre bloques, misma superficie. Lo que
// cambia es que ya no hay nada que tocar. Un resumen con etiquetas cortas
// —"Cómo empezaste · Cansada"— sería un inventario con otro vocabulario; con la
// pregunta delante, volver a leerlo es volver a lo que se preguntó.
//
// **Las dos respuestas emocionales vuelven en su píldora, con su emoji.** Se
// eligieron tocando una y se releen en una: la respuesta se reconoce porque
// tiene el aspecto que tenía al elegirla, y la pantalla deja de ser una lista de
// texto. La forma sale de `pildora.js`, el mismo sitio del que la toma
// `ChipsUnicos` — dos copias de la misma píldora acabarían separándose.
//
// La píldora de aquí **no es un botón**: es un `<span>`. Parecerse a un control
// sin serlo es aceptable cuando toda la pantalla es de consulta; darle
// apariencia de tocable y que no responda, no lo sería.
//
// A la respuesta escrita a mano no se le pone emoji (§3): sale su palabra entre
// comillas y la píldora se pinta igual.
//
// **Todo en una sola pantalla.** No se pagina, no se pliega y no se navega:
// consultar lo que escribiste no puede costar más que escribirlo.
//
// **No lleva etiqueta de "hecho"**, y no es un olvido: con el contenido a la
// vista, decir "ya definiste tu día" es contarle a alguien lo que está leyendo.
// RN-HOY-03 dice cómo se comunica lo hecho, no que tenga que haber una línea que
// lo anuncie.
//
// Los bloques que quedaron en blanco **no aparecen**. No hay marcador de
// ausencia, ni un hueco gris, ni un "sin responder". Qué bloques hay lo decide
// `resumenDeManana`, en `@/lumia/manana`.
//
// Volver a entrar es un toque y no pide confirmación: cambiar de idea sobre cómo
// quieres pasar el día no es deshacer nada.

import { clsx } from 'clsx'
import { PILDORA, PILDORA_ELEGIDA } from './pildora'
import { copy } from '@copy'

const textos = copy.lumia.diario.manana

function Respuesta({ bloque }) {
  if (bloque.forma === 'chip') {
    return (
      <span className={clsx(PILDORA, PILDORA_ELEGIDA)}>
        {bloque.emoji && <span aria-hidden="true">{bloque.emoji}</span>}
        <span>{bloque.lineas[0]}</span>
      </span>
    )
  }

  return bloque.lineas.map((linea, indice) => (
    <p key={indice} className="text-base text-on-surface whitespace-pre-wrap">
      {linea}
    </p>
  ))
}

export default function ResumenManana({ bloques, onEditar }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Rótulo tenue, no un segundo título: la pantalla se identifica sin
          competir con el saludo del héroe ni con las preguntas de abajo. */}
      <p className="text-sm text-on-surface-soft">{textos.titulo}</p>

      {bloques.map((bloque) => (
        <section key={bloque.id} className="flex flex-col gap-3">
          <h2 className="font-display text-md text-on-surface">{bloque.titulo}</h2>
          {/* La píldora no se estira: `items-start` la deja del ancho de su
              contenido, como en el recorrido. */}
          <div className="flex flex-col items-start gap-1">
            <Respuesta bloque={bloque} />
          </div>
        </section>
      ))}

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
    </div>
  )
}
