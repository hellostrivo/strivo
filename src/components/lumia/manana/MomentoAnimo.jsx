// src/components/lumia/manana/MomentoAnimo.jsx
// Pantalla 1 — el punto de partida, y nada más.
//
// Una sola pregunta en toda la pantalla, y es la más fácil de responder: un
// toque, sin escribir. Es la puerta del recorrido y por eso está sola —abrir la
// mañana con dos preguntas a la vez convierte el primer gesto en un trámite.
//
// **Aquí caben los días malos.** El catálogo incluye cansancio, inquietud,
// agobio y tristeza, y ninguno lleva tratamiento de advertencia: la pregunta es
// qué hay, no qué convendría que hubiera.
//
// La pregunta de la intención **ya no está aquí**. Se mudó a la pantalla 3,
// junto a la acción, porque "¿Qué puedo hacer hoy para acercarme a **esa
// sensación**?" es un pronombre sin antecedente si la sensación se eligió dos
// pantallas atrás.

import ChipsUnicos from '../ChipsUnicos'
import { copy } from '@copy'
import { ANIMO } from '@/lumia/mananaEmociones'

const textos = copy.lumia.diario.manana.animo

export default function MomentoAnimo({ valores, genero, onCambiar }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{textos.lead}</p>
      </div>
      <ChipsUnicos
        catalogo={ANIMO.CATALOGO}
        seleccion={valores.animo}
        genero={genero}
        etiqueta={textos.titulo}
        textosOtra={textos.otra}
        valorPropio={valores.animoPropio}
        onSeleccionar={(id) => onCambiar({ animo: id })}
        onValorPropio={(texto) => onCambiar({ animoPropio: texto })}
      />
    </section>
  )
}
