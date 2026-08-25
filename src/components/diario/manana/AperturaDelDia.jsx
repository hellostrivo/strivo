// src/components/diario/manana/AperturaDelDia.jsx
// El cierre de la mañana (§8), que es la apertura del día.
//
// Es hermano de `CierreDelDia`, no una copia: aquel oscurece y despide, este
// aclara y suelta. Los dos comparten la forma —pantalla entera, un texto corto
// construido con lo que la persona escribió, un solo botón— porque es la forma
// que este producto le da a un momento que termina.
//
// **Sin puntuación, sin porcentajes y sin felicitación** (§8). Lo que se
// devuelve es la propia intención y el propio paso, con sus palabras. Si no hay
// ninguna de las dos, se cierra igual y se dice sin señalar el vacío: "Tu día
// puede comenzar desde donde estás." Omitirlo todo es una forma legítima de
// pasar por aquí.

import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { copy } from '@copy'

const textos = copy.diario.manana.cierre

export default function AperturaDelDia({ lineas, onTerminar }) {
  return (
    <div
      data-surface="light"
      data-momento="manana"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-strivo-base px-8 text-center"
    >
      {lineas.length === 0 ? (
        <p
          className={clsx(
            'font-display text-lg text-on-surface leading-snug',
            'animate-fade-up motion-reduce:animate-none',
          )}
          role="status"
        >
          {textos.vacio}
        </p>
      ) : (
        <div className="flex flex-col gap-3" role="status">
          {lineas.map((linea, indice) => (
            <p
              key={linea}
              className={clsx(
                indice === 0
                  ? 'font-display text-lg text-on-surface leading-snug'
                  : 'text-base text-on-surface-soft',
                'animate-fade-up motion-reduce:animate-none',
              )}
            >
              {linea}
            </p>
          ))}
        </div>
      )}

      <Button variant="surface" onClick={onTerminar}>
        {textos.cta}
      </Button>
    </div>
  )
}
