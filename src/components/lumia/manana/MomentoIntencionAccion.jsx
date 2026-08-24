// src/components/lumia/manana/MomentoIntencionAccion.jsx
// Pantalla 3 — la intención y el paso, juntos.
//
// **Van en la misma pantalla porque la segunda pregunta no se sostiene sin la
// primera.** "¿Qué puedo hacer hoy para acercarme a *esa sensación*?" nombra
// algo con un pronombre: si la sensación se eligió dos pantallas atrás, quien
// lee tiene que acordarse de qué eligió para entender qué se le está pidiendo.
// Con las dos delante, la pregunta se explica sola y la respuesta se piensa una
// sola vez.
//
// Tiene además un efecto que se ve: las ideas de abajo cambian **en el momento**
// en que se toca un chip de arriba. Elegir "En calma" hace aparecer las ideas de
// la calma sin cambiar de pantalla, y eso convierte las dos preguntas en un
// gesto en vez de en dos.
//
// **La intención es una intención, no una meta.** No se mide contra el punto de
// partida de la pantalla 1: ni puntuación, ni brecha, ni color de alerta, ni una
// línea que sugiera que hay algo que mejorar. Empezar cansado y querer estar en
// calma es exactamente lo que estas preguntas esperaban encontrar.
//
// Y el paso es **uno**, no una lista de pendientes: el campo son tres líneas y
// el marcador de posición empieza la frase en primera persona.
//
// Las ideas son eso, ideas. Tocar una la deja en el campo entera y editable, y
// **no se guarda como respuesta hasta que la persona continúa o termina** (§5):
// mientras solo se ha tocado, lo que hay ahí es una propuesta de la app y no
// algo que alguien haya dicho de sí mismo.
//
// Cuando hay acciones que la propia persona escribió antes para esta misma
// intención, se ofrecen aparte y con su nombre: "Ideas que elegiste antes".
// **Nunca se dice que le funcionaran** —la app no tiene forma de saberlo— y
// nunca aparece nada escrito en otra superficie.

import { clsx } from 'clsx'
import ChipsUnicos from './ChipsUnicos'
import { CampoTexto } from '../Campo'
import { copy } from '@copy'
import { MAX_ACCION } from '@/lumia/manana'
import { INTENCION } from '@/lumia/mananaEmociones'

const textos = copy.lumia.diario.manana

function Ideas({ titulo, ideas, onElegir }) {
  if (ideas.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-on-surface-soft">{titulo}</p>
      <div className="flex flex-wrap gap-2">
        {ideas.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => onElegir(idea)}
            className={clsx(
              'rounded-full border border-on-surface px-4 py-2 min-h-touch-sm text-sm text-left',
              'text-on-surface bg-lumia-campo',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
            )}
          >
            {idea}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MomentoIntencionAccion({
  valores,
  genero,
  anteriores,
  generales,
  onCambiar,
  onCambiarAccion,
  onElegirIdea,
  onVolcar,
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-md text-on-surface">{textos.intencion.titulo}</h2>
          <p className="text-sm text-on-surface-soft">{textos.intencion.lead}</p>
        </div>
        <ChipsUnicos
          catalogo={INTENCION.CATALOGO}
          seleccion={valores.intencion}
          genero={genero}
          etiqueta={textos.intencion.titulo}
          textosOtra={textos.intencion.otra}
          valorPropio={valores.intencionPropia}
          onSeleccionar={(id) => onCambiar({ intencion: id })}
          onValorPropio={(texto) => onCambiar({ intencionPropia: texto })}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-md text-on-surface">{textos.accion.titulo}</h2>
          <p className="text-sm text-on-surface-soft">{textos.accion.lead}</p>
        </div>

        <CampoTexto
          filas={3}
          value={valores.accion}
          maxLength={MAX_ACCION}
          onChange={(evento) => onCambiarAccion(evento.target.value)}
          onBlur={onVolcar}
          placeholder={textos.accion.placeholder}
          aria-label={textos.accion.titulo}
        />

        <Ideas titulo={textos.accion.anterioresTitulo} ideas={anteriores} onElegir={onElegirIdea} />
        <Ideas titulo={textos.accion.ideasTitulo} ideas={generales} onElegir={onElegirIdea} />
      </section>
    </div>
  )
}
