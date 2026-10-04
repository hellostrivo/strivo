// src/components/shared/PreguntasReferencias.jsx
// Las dos preguntas de las referencias de las frases (SPEC_29 §5–§6).
//
// **Una sola pieza para dos sitios.** Las hace el onboarding la primera vez y
// Tu perfil cuando alguien quiera cambiarlas, y el encargo pide que sean
// exactamente las mismas: mismos textos, mismas opciones, misma mecánica. Por
// eso viven aquí y no en ninguno de los dos, y por eso no importan nada de
// ninguna sección: los textos y las respuestas llegan por props (RN-TEC-05).
// Lo único que leen de fuera es el orden de las opciones, de
// `src/referencias/`, que es territorio neutral.
//
// **Son chips con `aria-pressed`, no radios ni casillas.** Es la mecánica de
// toda la app: lo elegido se distingue por peso, borde y una marca, nunca solo
// por color; un toque elige y otro suelta. En la primera pregunta soltar deja
// la pregunta sin contestar, que es una forma válida de contestarla.
//
// **Quien monta decide el nivel del encabezado.** En el onboarding la pregunta
// es la pantalla y va en `h1`; en Tu perfil vive dentro de un bloque que ya
// tiene su `h2`, y va en `h3`.

import { ListaDeChips } from '@components/shared/Chips'
import { AFINIDADES, MODOS } from '@/referencias/preferencias'

function Encabezado({ nivel, textos }) {
  const Titulo = nivel
  return (
    <div className="flex flex-col gap-2">
      <Titulo className="font-display text-lg text-on-surface leading-snug">{textos.titulo}</Titulo>
      <p className="text-base text-on-surface-soft leading-relaxed">{textos.apoyo}</p>
    </div>
  )
}

/**
 * Pregunta 1: qué tipo de referencias. Selección única.
 *
 * @param {object} props
 * @param {object} props.textos - `REFERENCIAS.modo` del copy.
 * @param {?string} props.valor - el modo elegido, o `null`.
 * @param {(id: string) => void} props.onTocar
 * @param {'h1'|'h2'|'h3'} [props.nivel]
 */
export function PreguntaModo({ textos, valor, onTocar, nivel = 'h1' }) {
  return (
    <section className="flex flex-col gap-4">
      <Encabezado nivel={nivel} textos={textos} />
      <p className="text-base text-on-surface">{textos.pregunta}</p>
      <ListaDeChips
        etiqueta={textos.pregunta}
        opciones={MODOS.map((id) => ({ id, texto: textos.opciones[id] }))}
        elegidas={valor ? [valor] : []}
        onTocar={onTocar}
      />
    </section>
  )
}

/**
 * Pregunta 2: qué referencias. Selección múltiple, sin tope y sin orden de
 * prioridad. Siempre lleva una salida para seguir sin elegir.
 *
 * @param {object} props
 * @param {object} props.textos - `REFERENCIAS.afinidades` del copy.
 * @param {string[]} props.valor - las afinidades elegidas.
 * @param {(id: string) => void} props.onTocar
 * @param {() => void} props.onOmitir
 * @param {'h1'|'h2'|'h3'} [props.nivel]
 */
export function PreguntaAfinidades({ textos, valor, onTocar, onOmitir, nivel = 'h1' }) {
  return (
    <section className="flex flex-col gap-4">
      <Encabezado nivel={nivel} textos={textos} />
      <p className="text-base text-on-surface">{textos.pregunta}</p>
      <ListaDeChips
        etiqueta={textos.pregunta}
        opciones={AFINIDADES.map((id) => ({ id, texto: textos.opciones[id] }))}
        elegidas={valor}
        onTocar={onTocar}
      />
      <div>
        <button
          type="button"
          onClick={onOmitir}
          className="rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft
                     underline underline-offset-4 hover:text-on-surface
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          {textos.omitir}
        </button>
      </div>
    </section>
  )
}
