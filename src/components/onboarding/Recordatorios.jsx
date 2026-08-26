// src/components/onboarding/Recordatorios.jsx
// P6 — dos avisos al día, si se quieren.
//
// **La vista previa usa el copy de las notificaciones que existen** —
// `copy.notifications`, que hasta ahora no tenía consumidor— y no una versión
// de muestra: enseñar aquí un texto distinto del que llegará después sería una
// maqueta, no una vista previa.
//
// **Ninguna respuesta de esta pantalla es un fallo.** El "no" del dispositivo
// se cuenta sin código y sin pedir que se arregle nada, y un dispositivo que no
// sabe avisar recibe la frase que importa: la app funciona igual (RN-EST-04).
// Nada vibra aquí.
//
// Lo que se guarda es la preferencia, no el permiso del sistema. Son cosas
// distintas y `onboarding/recordatorios.js` explica por qué.

import Button from '@components/ui/Button'
import { copy, interpolate } from '@copy'
import { ESTADOS, haySoporte } from '@/onboarding/recordatorios'

const MENSAJES = Object.freeze({
  [ESTADOS.concedido]: 'granted',
  [ESTADOS.denegado]: 'denied',
  [ESTADOS.sinSoporte]: 'unsupported',
})

export default function Recordatorios({ textos, despertar, dormir, estado, onActivar, onSaltar }) {
  const soportado = haySoporte()
  const mensaje = MENSAJES[estado]

  // Se identifican por cuál de los dos son y no por su hora: con la misma hora
  // de despertar y de dormir, las dos filas compartirían clave.
  const avisos = [
    { id: 'manana', hora: despertar, texto: copy.notifications.manana },
    { id: 'noche', hora: dormir, texto: copy.notifications.noche },
  ].filter((aviso) => Boolean(aviso.hora))

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.question}</h1>
        <p className="text-base text-on-surface-soft">{textos.hint}</p>
      </div>

      <ul className="flex flex-col gap-2">
        {avisos.map((aviso) => (
          <li
            key={aviso.id}
            className="rounded-md bg-strivo-campo px-4 py-3 text-base text-on-surface"
          >
            {interpolate(textos.previewTemplate, aviso)}
          </li>
        ))}
      </ul>

      {mensaje && <p className="text-base text-on-surface-soft">{textos[mensaje]}</p>}

      <div className="flex flex-wrap items-center gap-3">
        {soportado && estado !== ESTADOS.concedido && (
          <Button variant="surface" onClick={onActivar}>
            {textos.activate}
          </Button>
        )}
        {/* "Ahora no" es la salida mientras no se sepa en qué quedó. En
            cuanto hay respuesta —la que sea— el contenedor pone "Continuar" en
            su sitio: decirle "ahora no" a algo que ya pasó no significa nada. */}
        {!estado && (
          <button
            type="button"
            onClick={onSaltar}
            className="rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {textos.skip}
          </button>
        )}
      </div>
    </section>
  )
}
