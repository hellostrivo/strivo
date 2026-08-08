// src/components/diario/SelectorAnimo.jsx
// Cómo te vas a dormir — nueve estados, se eligen hasta dos.
// Compartido por el Ritual de Noche (N6) y la Vista de Noche (bloque 5).
// Copy: copy.ritualNoche.n6 · ids, orden y límite: @lib/animos
//
// Ninguno es mejor que otro: "Inquieta" no es peor que "En paz", solo distinto,
// y ninguno se pinta en rojo ni abre una pregunta de seguimiento.
//
// Al llegar al máximo las demás se atenúan y dejan de responder. Sin mensaje,
// sin alerta y sin vibración, igual que el límite de emociones y el de áreas de
// P4B: el límite se comunica atenuando, no regañando.
//
// De aquí sale el saludo de mañana (R2 cambia si el día se cerró con cansancio
// o inquietud), así que responder tiene consecuencia, pero no calificación.
// Volver a tocar el elegido lo suelta: nada queda fijado por error.
//
// Lo que se guarda son ids, no lo que se lee: el rótulo cambia con el género y
// el id no (ver la nota de @lib/animos).

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'
import useCopy from '@hooks/useCopy'
import {
  ANIMOS,
  ANIMO_OTRO,
  MAX_ANIMOS,
  OTRO_MAX_LENGTH,
  normalizarAnimos,
  nombreDeAnimo,
  unaPalabra,
} from '@lib/animos'
import Chip from '@components/ui/Chip'

export default function SelectorAnimo({
  animos = [],
  otroTexto = '',
  onChange,
  etiquetadoPor,
}) {
  const t = useCopy()
  const campoRef = useRef(null)

  const elegidos = normalizarAnimos(animos)
  const lleno    = elegidos.length >= MAX_ANIMOS
  const conOtro  = elegidos.includes(ANIMO_OTRO)

  // El campo se enfoca solo al abrirse, pero no en la primera pintada: si la
  // persona vuelve a la pantalla con "Algo más" ya elegido, robarle el foco le
  // movería la vista sin que hubiera tocado nada.
  const abiertoAntes = useRef(conOtro)
  useEffect(() => {
    if (conOtro && !abiertoAntes.current) campoRef.current?.focus()
    abiertoAntes.current = conOtro
  }, [conOtro])

  const alternar = id => {
    if (elegidos.includes(id)) {
      // Soltar "Algo más" se lleva su palabra: no queda escrita para un estado
      // que ya no está elegido.
      const quedan = elegidos.filter(elegido => elegido !== id)
      onChange({ animos: quedan, otroTexto: id === ANIMO_OTRO ? '' : otroTexto })
      return
    }
    if (lleno) return
    onChange({ animos: [...elegidos, id], otroTexto })
  }

  const escribirPalabra = texto =>
    onChange({ animos: elegidos, otroTexto: unaPalabra(texto) })

  return (
    <>
      <p className="text-base leading-relaxed text-ink/80">
        {copy.ritualNoche.n6.subtitle}
      </p>

      <div
        role="group"
        aria-labelledby={etiquetadoPor}
        aria-label={etiquetadoPor ? undefined : t('ritualNoche.n6.question')}
        className="mt-5 flex flex-wrap gap-2"
      >
        {ANIMOS.map(({ id }) => {
          const elegido = elegidos.includes(id)
          return (
            <Chip
              key={id}
              selected={elegido}
              atenuado={lleno && !elegido}
              onClick={() => alternar(id)}
            >
              {/* El chip conserva su nombre aunque haya palabra escrita: el
                  campo de abajo ya la muestra, y cambiar la etiqueta del propio
                  chip haría desaparecer la forma de volver a soltarlo. */}
              {id === ANIMO_OTRO
                ? copy.ritualNoche.n6.states[ANIMO_OTRO]
                : nombreDeAnimo(id, t)}
            </Chip>
          )
        })}
      </div>

      {/* En línea, debajo de la rejilla: elegir "Algo más" no cambia de pantalla
          ni abre un modal, solo hace sitio para una palabra. */}
      {conOtro && (
        <div className="mt-4 animate-sugerencia-entra motion-reduce:animate-none">
          <label htmlFor="animo-otro" className="sr-only">
            {copy.ritualNoche.n6.otherLabel}
          </label>
          <input
            id="animo-otro"
            ref={campoRef}
            type="text"
            value={otroTexto}
            maxLength={OTRO_MAX_LENGTH}
            autoComplete="off"
            autoCapitalize="none"
            enterKeyHint="done"
            placeholder={copy.ritualNoche.n6.otherPlaceholder}
            onChange={evento => escribirPalabra(evento.target.value)}
            // El espacio no llega a escribirse. Pegar un párrafo tampoco falla:
            // se queda con la primera palabra y ya está (D.4, sin errores).
            onKeyDown={evento => {
              if (evento.key === ' ' || evento.key === 'Enter') evento.preventDefault()
            }}
            className={[
              'w-full max-w-xs min-h-touch-sm',
              'rounded-full bg-surface border border-border',
              'px-4 py-2 text-base text-ink',
              'placeholder:text-ink/70',
              'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
              'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
            ].join(' ')}
          />
        </div>
      )}

      {/* Llegar al límite no tiene aviso visual: esto es lo único que lo dice, y
          solo para quien navega con lector de pantalla. */}
      <p className="sr-only" aria-live="polite">
        {interpolate(copy.ritualNoche.n6.countTemplate, {
          n: elegidos.length,
          max: MAX_ANIMOS,
        })}
      </p>
    </>
  )
}
