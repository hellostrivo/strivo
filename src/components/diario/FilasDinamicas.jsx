// src/components/diario/FilasDinamicas.jsx
// La lista que crece sola. Hoy solo la usan los agradecimientos, de la mañana
// y de la noche: los logros y las victorias, que eran los otros dos usos, se
// retiraron el 23 ago. El componente se queda genérico a propósito —recibe
// límites, copy y etiqueta— porque nada de él es de la gratitud.
//
// La mecánica está en `src/diario/filas.js` y aquí solo se pinta: al escribir en
// la última fila nace otra, al salir de una fila vacía creada sobre la marcha
// desaparece, y las primeras se quedan siempre.
//
// **Cada respuesta es una tarjeta, no un renglón** (12 sep 2026). Era un
// `<input>` de una línea con un tope de caracteres, y una respuesta que quería
// ser un párrafo se cortaba a la vista y se quedaba a medias. Ahora cada una
// ocupa el ancho entero, con un área que crece con lo escrito y nunca se
// desplaza por dentro (`CampoParrafo`), y su «Quitar» al pie, fuera del texto.
// Lo que se desplaza es la pantalla: antes de continuar, cada respuesta se lee
// completa, con sus párrafos.
//
// **Sin número mientras se escribe.** Lo llevó un día y se retiró: la
// numeración es de la lectura —la consulta y el Historial la ponen con
// `ListaNumerada`— y no de la captura, donde un «1» sobre un campo en blanco
// convierte la pregunta en un formulario. El indicador del recorrido
// («2 de 3») no es esto y se queda donde está.
//
// **Abre en una línea y crece con lo escrito.** Una tarjeta vacía es su línea y
// nada más: ni sitio reservado para párrafos que aún no existen, ni cabecera.
// El pie —el contador y «Quitar»— existe solo cuando la respuesta tiene texto,
// y por eso va debajo y no encima: al escribir el primer carácter aparece bajo
// el cursor, sin mover el campo que se está tocando.
//
// **El tope es de palabras y es por respuesta**: cuatrocientas en cada una, y
// lo aplica `escribirEn` con el límite que declara la lista. No se anuncia por
// adelantado: hasta las trescientas no se dice nada, y desde ahí un aviso al
// pie dice cuántas quedan —«Te quedan 44 palabras»— y, al llegar, que se llegó.
// Cuándo toca avisar lo decide `palabrasRestantes`, en `filas.js`. Al llegar,
// las palabras que ya están se cambian o se borran igual; la que no cabe no
// entra.
//
// **El aviso comparte fila con «Quitar», y no es una elección estética.** Esa
// fila está mientras hay texto; una línea propia que apareciera y se fuera
// movería la tarjeta entera justo cuando alguien está tocando lo que hay
// debajo —«Añadir otro», «Continuar»—, y el botón se le iría de debajo del
// dedo entre apoyar y soltar. Se vio pasar en un navegador real.
//
// **Y esa fila no mide más que su texto.** «Quitar» conserva sus 44 px de
// objetivo táctil, pero se los come con margen negativo: bajo una respuesta de
// una línea había casi dos líneas de aire, y eran de la fila, no del campo.
//
// El tope de la lista no es un límite que se anuncia con un aviso: es una frase
// serena que aparece cuando ya hay diez cosas y deja de crecer.
//
// `onEnfocar`, `onDesenfocar` y `debajoDeFila` son opcionales y existen para
// que quien monta las filas pueda tener algo propio de UNA fila —hoy, las ideas
// de agradecimiento, que son del renglón enfocado y no del bloque. Quien no los
// pasa no nota ninguna diferencia.

import { useId, useState } from 'react'
import { clsx } from 'clsx'
import { CampoParrafo } from '@components/shared/Campo'
import { copy, interpolate } from '@copy'
import {
  alSalirDeFila,
  escribirEn,
  palabrasRestantes,
  pideConfirmacion,
  puedeAnadir,
  quitarFila,
  topeAlcanzado,
} from '@/diario/filas'

const textos = copy.diario.filas

/** Con las que abre cada respuesta: una. Lo demás lo pone quien escribe. */
const LINEAS_DE_SALIDA = 1

const ENLACE = [
  'shrink-0 rounded-full px-3 py-2 min-h-touch-sm text-sm',
  'text-on-surface-soft hover:text-on-surface',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
]

/** Lo que se dice al pie cuando queda poco sitio, o `null` cuando no toca. */
function avisoDe(texto, limites) {
  const restantes = palabrasRestantes(texto, limites)
  if (restantes === null) return null
  if (restantes === 0) return interpolate(textos.limiteTemplate, { max: limites.palabras })
  if (restantes === 1) return textos.quedaUna
  return interpolate(textos.quedanTemplate, { n: restantes })
}

export default function FilasDinamicas({
  filas,
  limites,
  onCambiar,
  onVolcar,
  placeholder,
  etiqueta,
  onEnfocar,
  onDesenfocar,
  debajoDeFila,
  textoAnadir = textos.anadir,
  // La frase del tope es de una lista que puede llegar a diez. Una de tres no
  // necesita que le anuncien que llegó al final: se ve. `null` la retira.
  textoTope = textos.tope,
}) {
  const [confirmando, setConfirmando] = useState(null)
  const idAviso = useId()
  const tope = topeAlcanzado(filas, limites)

  const cambiar = (indice, texto) => onCambiar(escribirEn(filas, indice, texto, limites))

  const salir = (indice) => {
    onCambiar(alSalirDeFila(filas, indice, limites))
    onVolcar?.()
  }

  const quitar = (indice) => {
    if (pideConfirmacion(filas[indice].texto) && confirmando !== indice) {
      setConfirmando(indice)
      return
    }
    setConfirmando(null)
    onCambiar(quitarFila(filas, indice, limites))
    onVolcar?.()
  }

  return (
    <div className="flex flex-col gap-3">
      {filas.map((fila, indice) => {
        const conTexto = fila.texto.trim() !== ''
        const aviso = avisoDe(fila.texto, limites)

        return (
          <div key={indice} className="flex flex-col gap-2">
            {/* La tarjeta es el campo: la caja, el borde y el anillo de foco son
                suyos y no del área de texto, que va desnuda dentro. */}
            <div
              className={clsx(
                'flex w-full flex-col gap-1 rounded-md border border-on-surface bg-strivo-campo px-4 py-3',
                'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                'focus-within:ring-2 focus-within:ring-current/30',
              )}
            >
              <CampoParrafo
                desnudo
                filas={LINEAS_DE_SALIDA}
                value={fila.texto}
                onChange={(evento) => cambiar(indice, evento.target.value)}
                onFocus={() => onEnfocar?.(indice)}
                onBlur={(evento) => {
                  salir(indice)
                  onDesenfocar?.(indice, evento)
                }}
                placeholder={placeholder}
                aria-label={`${etiqueta}, ${indice + 1}`}
                aria-describedby={aviso ? `${idAviso}-${indice}` : undefined}
              />

              {conTexto && (
                <div className="flex items-center justify-end gap-3">
                  {aviso && (
                    <p id={`${idAviso}-${indice}`} className="text-sm text-on-surface-soft">
                      {aviso}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => quitar(indice)}
                    className={clsx(ENLACE, '-my-3')}
                  >
                    {confirmando === indice ? textos.quitarConfirmar : textos.quitar}
                  </button>
                </div>
              )}
            </div>

            {debajoDeFila?.(indice)}
          </div>
        )
      })}

      {tope && textoTope && (
        <p className="text-sm text-on-surface-soft" role="status">
          {textoTope}
        </p>
      )}

      {puedeAnadir(filas, limites) && (
        <button
          type="button"
          onClick={() => onCambiar([...filas, { id: null, texto: '' }])}
          className={clsx(
            'self-start rounded-full px-4 py-2 min-h-touch-sm text-sm',
            'text-on-surface-soft hover:text-on-surface',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
          )}
        >
          {textoAnadir}
        </button>
      )}
    </div>
  )
}
