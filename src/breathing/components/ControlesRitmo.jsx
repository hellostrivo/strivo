// src/breathing/components/ControlesRitmo.jsx
// Los tiempos de las cuatro fases (SPEC_16 §3.2, RN-RE-NAV-18 y 19).
//
// **Con la caja, un solo control.** Es lo que la hace una caja: cuatro tiempos
// iguales. Enseñar cuatro controles que siempre se mueven juntos sería enseñar
// tres controles falsos. Y si alguien edita una fase por separado, deja de ser
// una caja y se dice en una línea (RN-RE-NAV-19) — no se impide, se explica.
//
// **Pulsación mantenida acelera tras 600 ms.** Sin eso, llevar una fase de 1 a
// 20 segundos son 38 toques. Con eso, uno sostenido.
//
// El valor va con **coma decimal** (RN-RE-NAV-18): el locale es es-MX y `5.0 s`
// en una app en español se lee como un descuido.

import { useEffect, useRef } from 'react'
import { copy, interpolate } from '@copy'
import {
  FASES_EN_ORDEN,
  MAX_FASE,
  MIN_FASE_ACTIVA,
  MIN_FASE_RETENCION,
  FASES_ACTIVAS,
  PASO_EDICION,
} from '@lib/respiracion/motorRitmo'
import { EDICION, LADO_CAJA_MAX, LADO_CAJA_MIN } from '../data/catalogoPatrones.js'
import { tiempoDeFase } from '../lib/formato.js'

/** RN-RE-NAV-18 — Tras 600 ms sostenido, el valor empieza a correr. */
export const MS_ANTES_DE_ACELERAR = 600
export const MS_ENTRE_PASOS = 90

export default function ControlesRitmo({ patron, edicion, onCambiarFase, onCambiarLado, aviso }) {
  const textos = copy.respiracion.configuracion
  const esCaja = edicion === EDICION.LADO_UNICO

  if (esCaja) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-sm text-on-surface-soft">{textos.ritmo}</h2>
        <FilaTiempo
          etiqueta={textos.ladoUnico}
          valor={patron.inhalar}
          minimo={LADO_CAJA_MIN}
          maximo={LADO_CAJA_MAX}
          onCambiar={onCambiarLado}
        />
        {aviso ? <p className="text-xs text-on-surface-soft">{aviso}</p> : null}
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm text-on-surface-soft">{textos.ritmo}</h2>
      {FASES_EN_ORDEN.map((fase) => (
        <FilaTiempo
          key={fase}
          fase={fase}
          etiqueta={copy.respiracion.fases[fase]}
          valor={patron[fase]}
          minimo={FASES_ACTIVAS.includes(fase) ? MIN_FASE_ACTIVA : MIN_FASE_RETENCION}
          maximo={MAX_FASE}
          onCambiar={(valor) => onCambiarFase(fase, valor)}
        />
      ))}
      {aviso ? <p className="text-xs text-on-surface-soft">{aviso}</p> : null}
    </section>
  )
}

function FilaTiempo({ fase, etiqueta, valor, minimo, maximo, onCambiar }) {
  const accesible = copy.respiracion.accesibilidad
  const nombre = fase ? copy.respiracion.fases[fase] : etiqueta

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-on-surface">{etiqueta}</span>

      {/*
        RN-RE-NAV-43 — El `aria-live` va en el contenedor del grupo y no en cada
        botón. Puesto en los botones, un lector de pantalla anunciaría el cambio
        dos veces —una por el botón y otra por el valor— y quien lo usa acabaría
        oyendo el doble de lo que pidió.
      */}
      <div className="flex items-center gap-2" aria-live="polite">
        <BotonPaso
          etiqueta={interpolate(accesible.reducirFase, { fase: nombre })}
          onPaso={() => onCambiar(Math.max(minimo, valor - PASO_EDICION))}
          desactivado={valor <= minimo}
          signo="−"
        />
        <span className="min-w-[64px] text-center text-sm text-on-surface tabular-nums">
          {tiempoDeFase(valor)}
        </span>
        <BotonPaso
          etiqueta={interpolate(accesible.aumentarFase, { fase: nombre })}
          onPaso={() => onCambiar(Math.min(maximo, valor + PASO_EDICION))}
          desactivado={valor >= maximo}
          signo="+"
        />
      </div>
    </div>
  )
}

/**
 * Un `−` o un `+` que acelera si se mantiene pulsado.
 *
 * El temporizador vive dentro del botón y se limpia al soltar, al salir del
 * botón y al desmontar. Un intervalo que sobrevive a su botón es un tiempo que
 * sigue subiendo solo, y es de los errores más difíciles de relacionar con su
 * causa cuando aparece.
 */
function BotonPaso({ etiqueta, onPaso, desactivado, signo }) {
  const espera = useRef(null)
  const repite = useRef(null)
  const accion = useRef(onPaso)
  accion.current = onPaso

  const parar = () => {
    if (espera.current !== null) clearTimeout(espera.current)
    if (repite.current !== null) clearInterval(repite.current)
    espera.current = null
    repite.current = null
  }

  useEffect(() => parar, [])

  const arrancar = () => {
    if (desactivado) return
    accion.current()
    espera.current = setTimeout(() => {
      repite.current = setInterval(() => accion.current(), MS_ENTRE_PASOS)
    }, MS_ANTES_DE_ACELERAR)
  }

  return (
    <button
      type="button"
      aria-label={etiqueta}
      disabled={desactivado}
      onPointerDown={arrancar}
      onPointerUp={parar}
      onPointerLeave={parar}
      onPointerCancel={parar}
      // RN-RE-NAV-42 — Con teclado no hay pulsación mantenida que valga: un
      // toque, un paso. `onKeyDown` repetiría solo por la autorrepetición del
      // sistema, que ya es la aceleración que espera quien usa teclado.
      onKeyDown={(evento) => {
        if (evento.key !== 'Enter' && evento.key !== ' ') return
        evento.preventDefault()
        accion.current()
      }}
      className="min-h-touch min-w-touch rounded-full border border-espacio text-on-surface disabled:opacity-40"
    >
      {signo}
    </button>
  )
}
