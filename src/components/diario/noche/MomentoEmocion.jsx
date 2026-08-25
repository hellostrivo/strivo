// src/components/diario/noche/MomentoEmocion.jsx
// Momento 3 — "¿Cómo me siento al cerrar el día?".
//
// Sustituye a "¿Cómo te vas a dormir?", que admitía dos estados. Aquí es
// **selección única**: nombrar cómo se cierra el día no es hacer un inventario,
// y con dos respuestas la pregunta deja de tener una. Tocar el chip elegido lo
// suelta — que es cómo se deja la pregunta en blanco sin tener que borrar nada.
//
// **Las emociones difíciles tienen exactamente la misma jerarquía que las
// agradables** (§7): mismo tamaño, mismo borde, misma píldora, mismo orden de
// lectura. Ni rojo, ni aviso, ni una línea que sugiera que hay una respuesta
// mejor que otra. Lo elegido tampoco se distingue solo por color: cambia el
// borde, cambia la superficie, aparece una marca y el texto pasa a peso medio.
//
// **El enlace de descarga va debajo de todas, no solo de las cuatro difíciles.**
// Si apareciera solo tras una emoción difícil, el catálogo se convertiría en un
// diagnóstico: la app estaría diciendo cuáles son las respuestas preocupantes.
// Es voluntario, es discreto y no es un paso del recorrido.

import { clsx } from 'clsx'
import ChipsUnicos from '../ChipsUnicos'
import { copy } from '@copy'
import { CIERRE } from '@/diario/nocheEmociones'

const textos = copy.diario.noche

export default function MomentoEmocion({
  valores,
  genero,
  conDescarga,
  onCambiar,
  onValorPropio,
  onAbrirDescarga,
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-md text-on-surface">{textos.emocion.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{textos.emocion.lead}</p>
      </div>

      <ChipsUnicos
        catalogo={CIERRE.CATALOGO}
        seleccion={valores.emocion}
        genero={genero}
        etiqueta={textos.emocion.titulo}
        textosOtra={textos.emocion.otra}
        valorPropio={valores.emocionPropia}
        onSeleccionar={onCambiar}
        onValorPropio={onValorPropio}
      />

      {/* No aparece la noche en que la reflexión ya fue "¿Qué necesito soltar
          por hoy?": preguntar dos veces lo mismo es lo que la regla evita. */}
      {conDescarga && (
        <button
          type="button"
          onClick={onAbrirDescarga}
          className={clsx(
            'self-start rounded-full px-3 py-2 min-h-touch-sm text-left text-sm',
            'text-on-surface-soft hover:text-on-surface',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
          )}
        >
          {textos.descarga.abrir}
        </button>
      )}
    </section>
  )
}
