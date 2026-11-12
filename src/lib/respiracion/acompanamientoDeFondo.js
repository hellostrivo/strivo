// src/lib/respiracion/acompanamientoDeFondo.js
// La guía sigue con la pantalla bloqueada (SPEC_23 Parte 2, DP-23.22 y 23.26).
//
// Mientras la app está fuera y la sesión tiene sonido, un temporizador
// (`relojDeFondo`) sustituye a los fotogramas. En cada tic:
//
//   1. quien lo monta avanza su reloj una pasada (`instante`), que es la misma
//      que haría un fotograma: la máquina sigue siendo la única fuente de
//      verdad de las fases (RN-RE-SND-19/20);
//   2. se programan en la guía, sobre el reloj del audio, las fases que van
//      desde lo ya programado hasta 10 s por delante, con el mismo resolvedor
//      que dibuja (`tramos.js`): seguidas, sin huecos ni solapes;
//   3. si el cierre cae dentro de esa ventana, se programa su fundido
//      (`alCierre`) una sola vez, para que el final no dependa de que el tic
//      llegue a tiempo.
//
// En pausa no se programa nada y lo programado se cancela; al retomar, la fase
// en curso se vuelve a programar desde el valor que suena (`sincronizar`). Al
// volver la app, se cancela todo y quien lo monta sigue con sus fotogramas.
//
// No conoce `breathing/` ni `diario/`: todo le llega por funciones, y por eso
// lo comparten la sección Respiración y «Respira un momento».

import { tramosDesde, alRelojDelAudio } from './tramos.js'
import { MS_VENTANA, crearRelojDeFondo } from './relojDeFondo.js'

/**
 * @param {object} opciones
 * @param {() => ({corriendo: boolean, ms: number, finFaseMs: number, finMs: number|null}|null)} opciones.instante -
 *   avanza una pasada y dice dónde está la sesión; `null` si ya no hay sesión.
 * @param {(ms: number) => ({fase: string, restanteMs: number}|null)} opciones.resolver
 * @param {() => object|null} opciones.guia - la guía (`crearAudioRespiracion`).
 * @param {() => number|null} opciones.relojAudio - segundos del contexto.
 * @param {() => void} opciones.sincronizar - programa con `fase()` la fase en curso.
 * @param {(instanteAudio: number) => void} [opciones.alCierre] - programa el fundido final.
 * @param {object} [opciones.reloj] - opciones de `crearRelojDeFondo` (para las pruebas).
 */
export function crearAcompanamientoDeFondo({
  instante,
  resolver,
  guia,
  relojAudio,
  sincronizar,
  alCierre = null,
  reloj = {},
}) {
  // Hasta qué ms de la sesión hay fases programadas. `null`: nada.
  let hastaMs = null
  let cierreProgramado = false

  function cancelar() {
    if (hastaMs !== null) guia()?.cancelarProgramado?.()
    hastaMs = null
  }

  function tic() {
    const punto = instante()
    if (!punto) {
      cancelar()
      return
    }
    if (!punto.corriendo) {
      cancelar()
      cierreProgramado = false
      return
    }
    const ahoraAudio = relojAudio()
    const voz = guia()
    if (ahoraAudio === null || ahoraAudio === undefined) return

    if (hastaMs === null) {
      // Al retomar (o la primera vez sin nada programado): la fase en curso
      // con `fase()`, desde el valor que suena, y lo demás por delante.
      sincronizar()
      hastaMs = punto.finFaseMs
    }

    const fin = punto.finMs ?? Infinity
    if (voz) {
      const tramos = tramosDesde(resolver, hastaMs, punto.ms + MS_VENTANA, fin)
      if (tramos.length > 0) {
        voz.programar(alRelojDelAudio(tramos, punto.ms, ahoraAudio))
        hastaMs = tramos.at(-1).hastaMs
      }
    }

    if (alCierre && !cierreProgramado && Number.isFinite(fin) && fin - punto.ms <= MS_VENTANA) {
      cierreProgramado = true
      alCierre(ahoraAudio + Math.max(0, fin - punto.ms) / 1000)
    }
  }

  const temporizador = crearRelojDeFondo({ alTic: tic, ...reloj })

  return {
    /**
     * La app se va con la sesión con sonido. Si el ritmo corre, la fase en
     * curso ya la programó el último fotograma: se programa desde su final.
     */
    entrar() {
      const punto = instante()
      hastaMs = punto?.corriendo ? punto.finFaseMs : null
      cierreProgramado = false
      temporizador.iniciar()
    },

    /** La app vuelve: se cancela todo lo programado. */
    salir() {
      temporizador.detener()
      cancelar()
      cierreProgramado = false
    },

    /** Al pausar desde fuera, o al reconstruir: lo programado ya no vale. */
    cancelar,

    /** ¿Se programó ya el fundido final? */
    cierreProgramado: () => cierreProgramado,

    activo: () => temporizador.activo(),

    /** Solo para las pruebas: un tic sin esperar al temporizador. */
    tic,
  }
}
