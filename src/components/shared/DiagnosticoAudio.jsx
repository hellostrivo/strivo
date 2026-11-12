// src/components/shared/DiagnosticoAudio.jsx
// El panel del diagnóstico del audio (SPEC_23C, DP-23.16). **Solo existe con
// `VITE_DIAG_AUDIO=1`**: lo montan `breathing/PantallaSesion.jsx` y
// `components/shared/Respiracion.jsx` con un `lazy()` que sin la bandera
// desaparece del build, y con él estos textos.
//
// Vive en `components/shared/` porque lo monta también «Respira un momento», y
// no importa nada de `diario/` ni de `breathing/` (RN-TEC-05): lo que mide lo
// lee de `lib/audio/diagnosticoAudio.js`, y el estado de la sesión le llega
// por props.
//
// **Abierto por defecto, y se repinta solo.** Desplegarlo sería un toque, y un
// toque despierta el audio: la captura de pantalla tiene que poder hacerse al
// volver sin tocar nada.

import { useEffect, useState } from 'react'
import { DIAGNOSTICO_AUDIO as t } from '@copy/diagnostico'
import { interpolate } from '@copy'
import { TIPOS, elegirTipo, leer, reconstruir, suscribir } from '@lib/audio/diagnosticoAudio'

const dosCifras = (n) => String(n).padStart(2, '0')

function hora(ms) {
  if (!ms) return t.todaviaNo
  const d = new Date(ms)
  return `${dosCifras(d.getHours())}:${dosCifras(d.getMinutes())}:${dosCifras(d.getSeconds())}`
}

const estadoDeAudio = (estado) => t.estados[estado] ?? t.estados.ninguno
const unDecimal = (n) => (Math.round(n * 10) / 10).toFixed(1)

/** Las líneas del §6, en su orden. */
function lineas(foto, sesion, fase) {
  const resultado = []
  resultado.push(interpolate(t.estado, { estado: estadoDeAudio(foto.audio) }))
  resultado.push(
    interpolate(t.cambios, {
      lista:
        foto.cambios.length === 0
          ? t.sinCambios
          : foto.cambios
              .map((c) =>
                interpolate(t.cambio, { hora: hora(c.hora), estado: estadoDeAudio(c.estado) }),
              )
              .join(' · '),
    }),
  )
  resultado.push(
    foto.alIrse
      ? interpolate(t.alIrse, {
          hora: hora(foto.alIrse.hora),
          estado: estadoDeAudio(foto.alIrse.estado),
        })
      : t.alIrseNada,
  )
  resultado.push(
    foto.alVolver
      ? interpolate(t.alVolver, {
          hora: hora(foto.alVolver.hora),
          s: Math.round(foto.alVolver.fuera),
          estado: estadoDeAudio(foto.alVolver.estado),
        })
      : t.alVolverNada,
  )
  resultado.push(
    interpolate(t.resume, {
      resultado: foto.reanudar ? t.resultados[foto.reanudar.resultado] : t.todaviaNo,
    }),
  )
  if (foto.relojFuera) {
    resultado.push(
      interpolate(t.relojFuera, {
        a: unDecimal(foto.relojFuera.audio),
        b: unDecimal(foto.relojFuera.pared),
      }),
    )
  }
  if (foto.relojAhora !== null) {
    resultado.push(
      interpolate(t.relojAhora, { valor: foto.relojAhora ? t.reloj.avanza : t.reloj.quieto }),
    )
  }
  if (foto.jsFuera) {
    resultado.push(
      interpolate(t.jsFuera, {
        n: foto.jsFuera.tics,
        m: foto.jsFuera.de,
        f: foto.jsFuera.fotogramas,
      }),
    )
  }
  resultado.push(
    interpolate(t.motor, {
      vivo: foto.motor ? t.motores.vivo : t.motores.suelto,
      n: foto.motor?.fuentesVivas?.() ?? (foto.motor?.activo?.() ? 1 : 0),
      tics: foto.tics,
    }),
  )
  resultado.push(
    interpolate(t.sesion, {
      estado: t.estadosSesion[sesion] ?? sesion,
      fase: fase ?? t.sinFase,
    }),
  )
  resultado.push(interpolate(t.tipo, { tipo: t.tipos[foto.tipo] ?? t.tipos.noExiste }))
  return resultado
}

/**
 * @param {'sesion'|'momento'} origen - quién suena: la sección o «Respira un momento».
 * @param {string} sesion - el estado de la sesión (los de `maquinaSesion`).
 * @param {string|null} fase
 */
export default function DiagnosticoAudio({ origen, sesion, fase }) {
  const [abierto, setAbierto] = useState(true)
  const [, repintar] = useState(0)

  useEffect(() => suscribir(() => repintar((n) => n + 1)), [])

  const foto = leer(origen)
  const boton =
    'rounded-full border border-on-surface px-3 py-2 min-h-touch-sm text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30'

  return (
    <section className="mx-auto mt-3 w-full max-w-md rounded-md border border-on-surface p-4 text-left">
      <button type="button" onClick={() => setAbierto((v) => !v)} className={boton}>
        {abierto ? t.plegar : t.desplegar}
      </button>
      {abierto && (
        <div className="mt-3 flex flex-col gap-1">
          {lineas(foto, sesion, fase).map((linea) => (
            <p key={linea} className="text-sm text-on-surface-soft leading-snug">
              {linea}
            </p>
          ))}
          <div className="mt-3 flex flex-wrap gap-2">
            {foto.tipo !== null && (
              <>
                <button
                  type="button"
                  aria-pressed={foto.tipo === TIPOS.automatico}
                  onClick={() => elegirTipo(TIPOS.automatico)}
                  className={boton}
                >
                  {t.tipos.auto}
                </button>
                <button
                  type="button"
                  aria-pressed={foto.tipo === TIPOS.reproduccion}
                  onClick={() => elegirTipo(TIPOS.reproduccion)}
                  className={boton}
                >
                  {t.tipos.playback}
                </button>
              </>
            )}
            {foto.puedeReconstruir && (
              <button type="button" onClick={() => reconstruir(origen)} className={boton}>
                {t.nuevo}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
