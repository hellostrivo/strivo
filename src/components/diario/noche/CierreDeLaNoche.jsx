// src/components/diario/noche/CierreDeLaNoche.jsx
// La ceremonia que cierra el día (§10). Sustituye a `CierreDelDia`.
//
// Es el momento más importante del producto y sigue siendo el mismo gesto: la
// pantalla se oscurece, se dice una frase corta y hay un solo botón. **Nunca
// falla**: sin nada escrito se cierra igual, y sin nada escrito no se señala el
// vacío (no-negociable 3).
//
// Lo que cambia con esta actualización es **lo que dice**. Antes contaba: "Hoy
// encontraste 2 cosas que agradecer". §10 prohíbe los recuentos, y con razón:
// un número al final del día es una nota. Ahora las dos líneas son fijas —"Tu
// día puede terminar aquí." y "Lo que viviste hoy no necesita quedar resuelto
// esta noche."— y lo único que varía es la segunda cuando se dejó algo escrito
// en la descarga: "Por ahora, puedes dejarlo aquí."
//
// Si hay algo reconocido, se devuelve **uno** —no todos— bajo su encabezado. Es
// una de sus frases, con sus palabras, y no un resumen del día.
//
// **Se fue también el punto de luz cálida**, y no es un descuido: era una
// celebración condicionada al estado con el que se cerraba, es decir una nota
// emocional del día. §10 la prohíbe expresamente, y con ella se fue el cierre
// compasivo —"Hoy pesó"—, que interpretaba lo que alguien acababa de nombrar.
//
// Sobrevive la despedida, que no celebra nada: "Buenas noches." y la puerta
// abierta para volver.

import { useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { copy } from '@copy'

const textos = copy.diario.noche.cierre

export default function CierreDeLaNoche({ reconocido, conDescarga, onTerminar }) {
  const [despidiendo, setDespidiendo] = useState(false)

  return (
    <div
      data-surface="dark"
      data-momento="noche"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-night px-8 text-center"
    >
      {despidiendo ? (
        <button
          type="button"
          onClick={onTerminar}
          className="flex flex-col items-center gap-3 rounded-md p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          <p className="font-display text-lg text-on-surface">{textos.despedida}</p>
          <p className="text-sm text-on-surface-soft">{textos.reabrir}</p>
        </button>
      ) : (
        <>
          <div className="flex flex-col gap-3" role="status">
            <p
              className={clsx(
                'font-display text-lg text-on-surface leading-snug',
                'animate-fade-up motion-reduce:animate-none',
              )}
            >
              {textos.titulo}
            </p>
            <p
              className={clsx(
                'text-base text-on-surface-soft',
                'animate-fade-up motion-reduce:animate-none',
              )}
            >
              {conDescarga ? textos.leadDescarga : textos.lead}
            </p>
          </div>

          {/* Una sola de las cosas reconocidas. La pantalla final es un
              descanso, no un repaso. */}
          {reconocido && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-on-surface-soft">{textos.reconocidoTitulo}</p>
              <p className="text-base text-on-surface">{reconocido}</p>
            </div>
          )}

          <Button variant="surface" onClick={() => setDespidiendo(true)}>
            {textos.cta}
          </Button>
        </>
      )}
    </div>
  )
}
