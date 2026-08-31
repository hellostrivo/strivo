// src/components/diario/ChipsCatalogo.jsx
// Chips tipo píldora con emoji para las tres preguntas emocionales del día: las
// dos de la mañana —cómo me siento, cómo me gustaría sentirme— y la de la noche
// —cómo me siento al cerrar el día—.
//
// Vive aquí y no dentro de `manana/` porque lo montan los dos recorridos: un
// componente que sirve a los dos no es de ninguno. No conoce ningún catálogo ni
// ninguna regla: recibe el suyo, su copy, su etiqueta y **la regla de selección
// de quien lo monta**.
//
// **Se llamaba `ChipsUnicos` y dejó de ser cierto** (27 ago 2026). Las dos
// preguntas de la mañana admiten hasta tres respuestas y la de la noche sigue
// admitiendo una; lo que las distingue no es el componente sino la función que
// se le pasa, que es de su catálogo. Un componente que dijera "únicos" mientras
// pinta tres elegidas es de los que llevan a escribir el segundo componente en
// vez de reutilizar este.
//
// Es primo de `ChipsEmociones` —la píldora es la misma— pero no es él: aquel
// pide una sola palabra de 24 caracteres sin espacios; este admite hasta 30 tal
// como se escriban, y con "Algo más" elegido enseña la palabra en el propio
// chip. Dos reglas de palabra propia en un mismo componente serían dos ramas
// que envejecen por separado, así que son dos componentes.
//
// **Al llegar al tope, la de más no entra y la lista se queda como está.** Lo
// decide la función que llega en `alternar`, no este componente: aquí no se
// cuenta nada. Lo que sí es de aquí es que un toque que no hace nada se
// explique — sin él, la pantalla parece rota. La frase llega en `avisoTexto` y
// dice qué pasa, nunca qué se hizo mal; **solo si quien monta trajo algo que
// decir**: en la noche no hay ninguna, porque con una sola respuesta lo que
// ocurre no es que se alcance un tope, sino que la respuesta cambia.
//
// **Ningún chip se apaga y ninguno lleva `disabled`.** Los tres elegidos se
// sueltan tocándolos, la pregunta entera se puede dejar en blanco y nada impide
// continuar: el tope es lo único que no crece, y §14 no lo prohíbe.
//
// **Lo elegido no se distingue solo por color** (§10): cambia el borde, cambia
// la superficie, aparece una marca y el texto pasa a peso medio. Quien no
// distinga los tonos ve igual cuál está elegido.
//
// El emoji no es voz de la app: es vocabulario de quien nombra su propio estado
// (§3.6.2, punto 5). A la palabra propia **no** se le asigna ninguno.

import { useState } from 'react'
import { clsx } from 'clsx'
import { CampoLinea } from '@components/shared/Campo'
import { PILDORA, PILDORA_ELEGIDA, PILDORA_LIBRE } from '@components/shared/pildora'
import { resolveGender } from '@copy/gender'
import { ID_OTRA, MAX_PALABRA_PROPIA, etiquetaPropia } from '@/diario/seleccionEmociones'

/** La marca de lo elegido. No es copy: es un signo, y va oculto al lector. */
const MARCA = '✓'

/**
 * @param {object[]} catalogo - `{ id, emoji, label: {m,f,n} }`.
 * @param {Function} alternar - La regla de selección de ese catálogo. Recibe la
 *   lista y el id tocado, y devuelve `{ seleccion, topeAlcanzado }`. Es quien
 *   sabe cuántas respuestas admite la pregunta; aquí no se cuenta nada.
 * @param {string[]} seleccion - Lo elegido, en el orden en que se eligió.
 * @param {?string} avisoTexto - Qué decir cuando ya no cabe otra. Sin él no se
 *   dice nada.
 */
export default function ChipsCatalogo({
  catalogo,
  alternar,
  seleccion = [],
  genero,
  etiqueta,
  textosOtra,
  valorPropio,
  avisoTexto = null,
  onSeleccionar,
  onValorPropio,
}) {
  const [editando, setEditando] = useState(false)
  // El aviso del tope es de esta lista y de nada más, así que vive aquí: quien
  // monta los chips no tiene que sostener un estado que solo se ve dentro. Se
  // retira en cuanto vuelve a caber algo: una frase que se queda después de
  // soltar una emoción estaría hablando de un tope que ya no existe.
  const [aviso, setAviso] = useState(false)

  const elegidas = Array.isArray(seleccion) ? seleccion : []
  const elegidaOtra = elegidas.includes(ID_OTRA)
  const total = catalogo.length + 1

  /** Aplica la regla del catálogo y devuelve si la opción quedó elegida. */
  const aplicar = (id) => {
    const { seleccion: siguiente, topeAlcanzado } = alternar(elegidas, id)
    onSeleccionar(siguiente)
    setAviso(topeAlcanzado)
    return siguiente.includes(id)
  }

  const tocar = (id) => {
    setEditando(false)
    aplicar(id)
  }

  // Tocar "Algo más" abre el campo, tanto para escribir por primera vez como
  // para cambiar lo escrito. Soltarlo es cosa de "Quitar", que está al lado del
  // campo: sin un control explícito, editar y borrar serían el mismo gesto.
  //
  // Con el tope alcanzado el campo **no** se abre: ofrecer un renglón para una
  // respuesta que no va a caber es peor que no ofrecerlo, porque se descubre
  // después de escribirla.
  const tocarOtra = () => {
    if (!elegidaOtra && !aplicar(ID_OTRA)) return
    setEditando(true)
  }

  // Soltar algo deja sitio otra vez, así que el aviso se va con ello: una frase
  // sobre un tope que ya no se alcanza habla de algo que no está pasando.
  const soltar = (siguientes) => {
    onSeleccionar(siguientes)
    setAviso(false)
  }

  const soltarOtra = () => elegidas.filter((id) => id !== ID_OTRA)

  const quitarOtra = () => {
    setEditando(false)
    onValorPropio('')
    soltar(soltarOtra())
  }

  const confirmar = () => {
    setEditando(false)
    if (String(valorPropio ?? '').trim() === '') soltar(soltarOtra())
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
          const elegida = elegidas.includes(opcion.id)
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
              'text-on-surface bg-strivo-campo',
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

      {/* En voz baja y sin reproche: dice lo que pasó, no lo que se hizo mal. */}
      {aviso && avisoTexto && (
        <p className="text-sm text-on-surface-soft" role="status">
          {avisoTexto}
        </p>
      )}
    </div>
  )
}
