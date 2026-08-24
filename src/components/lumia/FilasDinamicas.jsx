// src/components/lumia/FilasDinamicas.jsx
// La lista que crece sola. Hoy solo la usan los agradecimientos, de la mañana
// y de la noche: los logros y las victorias, que eran los otros dos usos, se
// retiraron el 23 ago. El componente se queda genérico a propósito —recibe
// límites, copy y etiqueta— porque nada de él es de la gratitud.
//
// La mecánica está en `src/lumia/filas.js` y aquí solo se pinta: al escribir en
// la última fila nace otra, al salir de una fila vacía creada sobre la marcha
// desaparece, y las primeras se quedan siempre.
//
// El tope no es un límite que se anuncia con un aviso: es una frase serena que
// aparece cuando ya hay diez cosas y deja de crecer.
//
// `onEnfocar`, `onDesenfocar` y `debajoDeFila` son opcionales y existen para
// que quien monta las filas pueda tener algo propio de UNA fila —hoy, las ideas
// de agradecimiento, que son del renglón enfocado y no del bloque. Quien no los
// pasa no nota ninguna diferencia.

import { useState } from 'react'
import { clsx } from 'clsx'
import { CampoLinea } from './Campo'
import { copy } from '@copy'
import {
  alSalirDeFila,
  escribirEn,
  pideConfirmacion,
  puedeAnadir,
  quitarFila,
  topeAlcanzado,
} from '@/lumia/filas'

const textos = copy.lumia.diario.filas

export default function FilasDinamicas({
  filas,
  limites,
  onCambiar,
  onVolcar,
  placeholder,
  numeradas = false,
  etiqueta,
  onEnfocar,
  onDesenfocar,
  debajoDeFila,
  maxLength,
  textoAnadir = textos.anadir,
  // La frase del tope es de una lista que puede llegar a diez. Una de tres no
  // necesita que le anuncien que llegó al final: se ve. `null` la retira.
  textoTope = textos.tope,
}) {
  const [confirmando, setConfirmando] = useState(null)
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
    <div className="flex flex-col gap-2">
      {filas.map((fila, indice) => (
        <div key={indice} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {numeradas && (
              <span className="w-4 shrink-0 text-sm text-on-surface-soft" aria-hidden="true">
                {indice + 1}
              </span>
            )}
            <CampoLinea
              value={fila.texto}
              onChange={(evento) => cambiar(indice, evento.target.value)}
              onFocus={() => onEnfocar?.(indice)}
              onBlur={(evento) => {
                salir(indice)
                onDesenfocar?.(indice, evento)
              }}
              maxLength={maxLength}
              placeholder={placeholder}
              aria-label={`${etiqueta}, ${indice + 1}`}
            />
            {fila.texto.trim() !== '' && (
              <button
                type="button"
                onClick={() => quitar(indice)}
                className={clsx(
                  'shrink-0 rounded-full px-3 py-2 min-h-touch-sm text-sm',
                  'text-on-surface-soft hover:text-on-surface',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                )}
              >
                {confirmando === indice ? textos.quitarConfirmar : textos.quitar}
              </button>
            )}
          </div>

          {debajoDeFila?.(indice)}
        </div>
      ))}

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
