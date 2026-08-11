// src/components/lumia/RitualNoche.jsx
// El Ritual de Noche: **cinco pantallas** — N1, N3, N4, N5 y N6 (§5.6).
//
// N2 no existe. Era el checklist de hábitos y se retiró en v4.1 (§C7.7.1): era
// la única superficie de Lumia que leía y escribía datos de hábitos, la misma
// mezcla que motivó disolver el Ritual de Mañana. Los identificadores no se
// renumeran, así que el hueco entre N1 y N3 se queda donde está.
//
// Aquí no se lee, ni se escribe, ni se cuenta un solo hábito. Ninguna pantalla
// de esta carpeta importa `formia/` y ninguna cadena de su copy los nombra.
//
// RN-RN-03 — Completable en menos de 90 segundos: ningún campo es obligatorio,
// todas las pantallas se pueden saltar y "Seguir" está siempre disponible.
//
// El ritual escribe donde escribe la Vista de Noche. Es el modo guiado del
// mismo dato, no un segundo almacén (D-4.5, §5.6.1).

import { useState } from 'react'
import N1Descompresion from './ritual/N1Descompresion'
import N3Logros from './ritual/N3Logros'
import N4Agradecimientos from './ritual/N4Agradecimientos'
import N5EstadoSueno from './ritual/N5EstadoSueno'
import N6Cierre from './ritual/N6Cierre'
import Button from '@components/ui/Button'
import { copy, interpolate } from '@copy'
import { TOTAL, anterior, esUltima, posicionDe, primera, siguiente } from '@/lumia/ritualNoche'

const textos = copy.lumia.ritualNoche

export default function RitualNoche({ estado, acciones, onSalir }) {
  const [pantalla, setPantalla] = useState(primera)

  /**
   * Avanzar guarda lo que hubiera quedado a medias, y avanza pase lo que pase.
   *
   * §3.3 — El cierre nocturno nunca falla. Si el guardado tropieza, lo escrito
   * sigue en local y en pantalla; lo que no puede ocurrir es que un error deje
   * a alguien atrapado a mitad del ritual a las once de la noche.
   */
  const avanzar = async () => {
    try {
      await acciones.volcar()
    } catch {
      // Deliberadamente en silencio: el ritual continúa igual.
    }
    setPantalla((actual) => siguiente(actual) ?? actual)
  }

  const retroceder = () => setPantalla((actual) => anterior(actual) ?? actual)

  // N6 es la ceremonia de cierre a pantalla completa: sin cabecera, sin pasos y
  // sin salida a ningún menú (§3.3, etapa 4).
  if (pantalla === 'N6') {
    return <N6Cierre estado={estado} onTerminar={onSalir} />
  }

  return (
    <div className="flex min-h-screen flex-col gap-8 px-5 pb-12 pt-6">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSalir}
          className="rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          {textos.salir}
        </button>
        {/* Dice dónde se está, no cuánto queda por rellenar. */}
        <p className="text-sm text-on-surface-soft" role="status">
          {interpolate(textos.pasoTemplate, { n: posicionDe(pantalla), total: TOTAL })}
        </p>
      </header>

      <div className="flex flex-1 flex-col">
        {pantalla === 'N1' && <N1Descompresion />}
        {pantalla === 'N3' && <N3Logros estado={estado} acciones={acciones} />}
        {pantalla === 'N4' && <N4Agradecimientos estado={estado} acciones={acciones} />}
        {pantalla === 'N5' && <N5EstadoSueno estado={estado} acciones={acciones} />}
      </div>

      <div className="flex flex-col gap-3">
        <Button fullWidth variant="surface" onClick={avanzar}>
          {textos.seguir}
        </Button>

        <div className="flex items-center justify-between gap-3">
          {anterior(pantalla) ? (
            <button
              type="button"
              onClick={retroceder}
              className="rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
            >
              {textos.atras}
            </button>
          ) : (
            <span />
          )}

          {/* Saltar y seguir llevan al mismo sitio. Está a la vista porque
              ninguna pantalla es obligatoria y conviene que se note. */}
          {!esUltima(pantalla) && (
            <button
              type="button"
              onClick={() => setPantalla((actual) => siguiente(actual) ?? actual)}
              className="rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
            >
              {textos.saltar}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
