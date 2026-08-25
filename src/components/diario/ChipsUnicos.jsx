// src/components/diario/ChipsUnicos.jsx
// Chips de **selección única** con emoji. Los usan las tres preguntas
// emocionales del día: las dos de la mañana —cómo me siento, cómo me gustaría
// sentirme— y la de la noche —cómo me siento al cerrar el día—.
//
// Vive aquí y no dentro de `manana/` desde que la noche también lo monta: un
// componente que sirve a los dos recorridos no es de ninguno de los dos. No
// conoce ningún catálogo: recibe el suyo, su copy y su etiqueta.
//
// Es primo de `ChipsEmociones` —la píldora es la misma— pero no es él: aquel
// admite tres selecciones y una palabra de 24 caracteres sin espacios; este
// admite una y hasta 30 caracteres tal como se escriban. Dos reglas de
// selección distintas en un mismo componente serían dos ramas que envejecen por
// separado, así que son dos componentes.
//
// **Lo elegido no se distingue solo por color** (§10): cambia el borde, cambia
// la superficie, aparece una marca y el texto pasa a peso medio. Quien no
// distinga los tonos ve igual cuál está elegido.
//
// El emoji no es voz de la app: es vocabulario de quien nombra su propio estado
// (§3.6.2, punto 5). A la palabra propia **no** se le asigna ninguno.

import { useState } from 'react'
import { clsx } from 'clsx'
import { CampoLinea } from './Campo'
import { PILDORA, PILDORA_ELEGIDA, PILDORA_LIBRE } from './pildora'
import { resolveGender } from '@copy/gender'
import { ID_OTRA, MAX_PALABRA_PROPIA, etiquetaPropia } from '@/diario/seleccionUnica'

/** La marca de lo elegido. No es copy: es un signo, y va oculto al lector. */
const MARCA = '✓'

export default function ChipsUnicos({
  catalogo,
  seleccion,
  genero,
  etiqueta,
  textosOtra,
  valorPropio,
  onSeleccionar,
  onValorPropio,
}) {
  const [editando, setEditando] = useState(false)

  const elegidaOtra = seleccion === ID_OTRA
  const total = catalogo.length + 1

  const tocar = (id) => {
    setEditando(false)
    onSeleccionar(seleccion === id ? null : id)
  }

  // Tocar "Algo más" abre el campo, tanto para escribir por primera vez como
  // para cambiar lo escrito. Soltarlo es cosa de "Quitar", que está al lado del
  // campo: sin un control explícito, editar y borrar serían el mismo gesto.
  const tocarOtra = () => {
    if (!elegidaOtra) onSeleccionar(ID_OTRA)
    setEditando(true)
  }

  const quitarOtra = () => {
    setEditando(false)
    onValorPropio('')
    onSeleccionar(null)
  }

  const confirmar = () => {
    setEditando(false)
    if (String(valorPropio ?? '').trim() === '') onSeleccionar(null)
  }

  // La forma sale de `pildora.js`, que es la que comparte con la pantalla de
  // consulta. Lo que se añade aquí es lo propio de un control que se toca.
  const clases = (elegida, punteado) =>
    clsx(
      PILDORA,
      'transition-all duration-180 ease-smooth motion-reduce:transition-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
      elegida ? PILDORA_ELEGIDA : PILDORA_LIBRE,
      punteado && !elegida && 'border-dashed',
    )

  const marca = (elegida) =>
    elegida ? (
      <span aria-hidden="true" className="text-sm">
        {MARCA}
      </span>
    ) : null

  const textoDeOtra =
    elegidaOtra && etiquetaPropia(valorPropio) !== ''
      ? etiquetaPropia(valorPropio)
      : textosOtra.chip

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={etiqueta}>
        {catalogo.map((opcion, indice) => {
          const elegida = seleccion === opcion.id
          const texto = resolveGender(opcion.label, genero)
          return (
            <button
              key={opcion.id}
              type="button"
              onClick={() => tocar(opcion.id)}
              aria-pressed={elegida}
              aria-label={`${texto}, ${indice + 1} de ${total}`}
              className={clases(elegida, false)}
            >
              <span aria-hidden="true">{opcion.emoji}</span>
              <span>{texto}</span>
              {marca(elegida)}
            </button>
          )
        })}

        {/* Borde punteado: no es una emoción del catálogo, es la puerta a la
            palabra de quien escribe. Mientras está elegida, el chip muestra esa
            palabra — es el acuse de que quedó registrada. */}
        <button
          type="button"
          onClick={tocarOtra}
          aria-pressed={elegidaOtra}
          aria-label={`${textoDeOtra}, ${total} de ${total}`}
          className={clases(elegidaOtra, true)}
        >
          <span>{textoDeOtra}</span>
          {marca(elegidaOtra)}
        </button>
      </div>

      {elegidaOtra && editando && (
        <div className="flex flex-wrap items-center gap-2">
          <CampoLinea
            value={valorPropio ?? ''}
            maxLength={MAX_PALABRA_PROPIA}
            autoFocus
            onChange={(evento) => onValorPropio(evento.target.value)}
            // Enter es una forma legítima de decir "ya está": cierra el campo y
            // suelta el foco, que en móvil es lo que retira el teclado.
            onKeyDown={(evento) => {
              if (evento.key !== 'Enter') return
              evento.preventDefault()
              evento.currentTarget.blur()
              confirmar()
            }}
            placeholder={textosOtra.placeholder}
            aria-label={textosOtra.label}
            className="max-w-xs"
          />
          <button
            type="button"
            onClick={confirmar}
            className={clsx(
              'rounded-full border border-on-surface px-4 py-2 min-h-touch-sm text-sm',
              'text-on-surface bg-lumia-campo',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
            )}
          >
            {textosOtra.confirmar}
          </button>
          <button
            type="button"
            onClick={quitarOtra}
            className={clsx(
              'rounded-full px-3 py-2 min-h-touch-sm text-sm',
              'text-on-surface-soft hover:text-on-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
            )}
          >
            {textosOtra.quitar}
          </button>
        </div>
      )}
    </div>
  )
}
