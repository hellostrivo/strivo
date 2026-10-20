// src/components/onboarding/Horarios.jsx
// P5 — a qué hora empieza y termina el día.
//
// Sirve para dos cosas concretas y la pantalla lo dice: para acompañar a tu
// ritmo y para saber a qué hora avisar, si se quieren avisos. No es una agenda
// y no compromete a nada — "Lo cambias cuando quieras" está en el copy porque
// es cierto.
//
// Los dos campos llegan con una hora propuesta en vez de en blanco: una casilla
// de hora vacía es algo que hay que rellenar, y en este recorrido no hay nada
// que haya que rellenar. Dejarla como está también es contestar.

import { CampoLinea } from '@components/shared/Campo'

export default function Horarios({ textos, despertar, dormir, onDespertar, onDormir }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.question}</h1>
        <p className="text-base text-on-surface-soft">{textos.hint}</p>
      </div>

      {/* Los dos campos ocupan el ancho de la columna y nada más.

          `min-w-0` en cada renglón y `campo-hora` en cada campo son la misma
          corrección vista desde los dos lados: un `input[type="time"]` trae un
          ancho propio del navegador que en un teléfono es mayor que el hueco, y
          al ser un elemento flexible no tiene permiso para encoger. Empujaba a
          su contenedor hacia fuera, y con él el bloque entero hacia la derecha.
          Lo que hace que se vean centrados es que quepan. */}
      <div className="flex flex-col gap-4">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-sm text-on-surface-soft">{textos.wakeLabel}</span>
          <CampoLinea
            type="time"
            className="campo-hora"
            value={despertar}
            onChange={(evento) => onDespertar(evento.target.value)}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-sm text-on-surface-soft">{textos.sleepLabel}</span>
          <CampoLinea
            type="time"
            className="campo-hora"
            value={dormir}
            onChange={(evento) => onDormir(evento.target.value)}
          />
        </label>
      </div>
    </section>
  )
}
