// src/components/diario/manana/MomentoAnimo.jsx
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
// **Y caben hasta tres a la vez** (27 ago 2026). Amanecer cansado y a la vez con
// ganas no es una contradicción que haya que resolver antes de seguir: es lo
// más corriente que hay. Cuántas admite lo dice el catálogo, no esta pantalla.
//
// La pregunta de la intención **ya no está aquí**. Se mudó a la pantalla 3,
// junto a la acción, porque "¿Qué puedo hacer hoy para acercarme a **esa
// sensación**?" es un pronombre sin antecedente si la sensación se eligió dos
// pantallas atrás.

import ChipsCatalogo from '../ChipsCatalogo'
import { copy } from '@copy'
import { ANIMO } from '@/diario/mananaEmociones'

const textos = copy.diario.manana.animo

export default function MomentoAnimo({ valores, genero, onCambiar }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{textos.lead}</p>
      </div>
      <ChipsCatalogo
        catalogo={ANIMO.CATALOGO}
        alternar={ANIMO.alternarVarias}
        seleccion={valores.animos}
        genero={genero}
        etiqueta={textos.titulo}
        textosOtra={textos.otra}
        avisoTexto={textos.max}
        valorPropio={valores.animoPropio}
        onSeleccionar={(animos) => onCambiar({ animos })}
        onValorPropio={(texto) => onCambiar({ animoPropio: texto })}
      />
    </section>
  )
}
