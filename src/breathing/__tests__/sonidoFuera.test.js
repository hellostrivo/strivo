// src/breathing/__tests__/sonidoFuera.test.js
// SPEC_23 Parte 2 — La sección Respiración y «Respira un momento» con sonido
// fuera de la app: el fundido final programado, y dónde se reclama y se suelta
// «reproducción» (criterios 2, 6, 7 y 8).
//
// El hook y el componente no se pueden montar sin navegador; lo que deciden
// vive en piezas puras con su propia prueba (`sesionAudio`, `contextoAudio`,
// `acompanamientoDeFondo`, la máquina). Aquí se comprueba, leyendo el código,
// que lo usan en el orden que importa.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { FUNDIDOS } from '../audio/mezclador.js'
import { crearMotorAmbiente } from '../audio/motorAmbiente.js'
import { crearContextoFalso } from '../audio/__tests__/dobleAudio.js'

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const HOOK = codigoDe('src/breathing/hooks/useSesionRespiracion.js')
const MOMENTO = codigoDe('src/components/shared/Respiracion.jsx')

function bloque(codigo, inicio, fin) {
  const desde = codigo.indexOf(inicio)
  expect(desde, inicio).toBeGreaterThan(-1)
  return codigo.slice(desde, fin ? codigo.indexOf(fin, desde + inicio.length) : undefined)
}

describe('el fundido final, programado en el reloj del audio (DP-23.22)', () => {
  function motor() {
    const ctx = crearContextoFalso()
    ctx.currentTime = 100
    const ambiente = crearMotorAmbiente(ctx, { azar: () => 0.5 })
    ambiente.entrar()
    return { ctx, ambiente }
  }

  it('salirEn programa el fundido en su instante, no ahora', () => {
    const { ambiente } = motor()
    ambiente.salirEn('completado', 130)
    const rampas = ambiente.mezclador.entradaAmbiente.gain.rampas
    expect(rampas.at(-1)).toMatchObject({
      valor: expect.any(Number),
      t: 130 + FUNDIDOS.salidaCompletado,
    })
    expect(ambiente.saliendo()).toBe(true)
  })

  it('cuando la máquina completa después, no repite el fundido', () => {
    const { ambiente } = motor()
    const duracion = ambiente.salirEn('completado', 130)
    const antes = ambiente.mezclador.entradaAmbiente.gain.rampas.length
    expect(ambiente.salir('completado')).toBe(duracion)
    expect(ambiente.mezclador.entradaAmbiente.gain.rampas).toHaveLength(antes)
  })

  it('pausar o volver a la app cancelan el fundido programado', () => {
    const { ambiente } = motor()
    ambiente.salirEn('completado', 130)
    ambiente.aplicarEstado({ estadoSesion: 'pausado', volumenAmbiente: 50 })
    expect(ambiente.saliendo()).toBe(false)
    ambiente.salirEn('completado', 130)
    ambiente.restablecer({ estadoSesion: 'activo', volumenAmbiente: 50 })
    expect(ambiente.saliendo()).toBe(false)
  })
})

describe('la sección: reclamar y soltar (DP-23.19)', () => {
  it('«reproducción» se reclama en el toque de Empezar, solo con sonido y antes del contexto', () => {
    const empezar = bloque(HOOK, 'const empezar = useCallback', 'maquina.current = crearMaquina')
    const reclama = empezar.indexOf('if (conSonido()) reclamarSonido()')
    expect(reclama).toBeGreaterThan(-1)
    expect(reclama).toBeLessThan(empezar.indexOf('asegurarAudio()'))
  })

  it('con sonido es ambiente distinto de silencio o guía activada', () => {
    const conSonido = bloque(HOOK, 'function conSonido()', 'function resincronizarGuia')
    expect(conSonido).toMatch(/!== ID_SILENCIO/)
    expect(conSonido).toMatch(/guiaSonoraActiva === true/)
  })

  it('soltar es primero «auto» y después cerrar el contexto', () => {
    const soltarSonido = bloque(HOOK, 'function soltarSonido()', 'function reclamarSonido')
    const auto = soltarSonido.indexOf('soltar()')
    expect(auto).toBeGreaterThan(-1)
    expect(auto).toBeLessThan(soltarSonido.indexOf('liberar()'))
    expect(soltarSonido).toMatch(/quitarCuadro\(\)/)
  })

  it('al acabar el fundido final se suelta, y solo si la sesión sigue completada', () => {
    const completado = bloque(HOOK, 'if (estado === ESTADOS.COMPLETADO) {', 'alCompletar?.(')
    expect(completado).toMatch(/temporizadorSoltar\.current = setTimeout/)
    expect(completado).toMatch(/=== ESTADOS\.COMPLETADO\) soltarSonido\(\)/)
  })

  it('salir de la pantalla suelta antes de cerrar nada', () => {
    const soltarTodo = bloque(HOOK, 'const soltarTodo = useCallback', '}, [pararBucle])')
    expect(soltarTodo.indexOf('soltarSonido()')).toBeLessThan(soltarTodo.indexOf('liberar()'))
  })

  it('a media sesión: pasar a silencio suelta; activar el sonido reclama; la guía se crea', () => {
    const ajustar = bloque(
      HOOK,
      'const ajustarEnVivo = useCallback',
      'if (cambios.sonidoAmbienteId',
    )
    expect(ajustar).toMatch(/antes && !conSonido\(\)\)\s*\{\s*soltarSonido\(\)/)
    expect(ajustar).toMatch(/reclamarSonido\(\)/)
    expect(ajustar).toMatch(/cambios\.guiaSonoraActiva === true && guia\.current === null/)
  })
})

describe('la pantalla de bloqueo y las llamadas (DP-23.24 y 23.25)', () => {
  const vigilar = bloque(HOOK, 'function vigilarContexto()', 'function soltarSonido')

  it('pausa desde fuera solo si la sesión corría, y lo apunta', () => {
    expect(vigilar).toMatch(/alSuspender\(\) \{[\s\S]*?pausadaDesdeBloqueo\.current = true/)
  })

  it('reproducir reanuda solo la pausa de la pantalla de bloqueo, con la app fuera', () => {
    const reanudar = bloque(vigilar, 'alReanudar()', 'alInterrumpir()')
    expect(reanudar).toMatch(/if \(!pausadaDesdeBloqueo\.current\) return/)
    expect(reanudar).toMatch(/visibilityState === 'visible'\) return/)
    expect(reanudar).toMatch(/restablecerAudio\(estado\)/)
  })

  it('una llamada pausa y no deja nada para reanudarse solo', () => {
    const interrumpir = bloque(vigilar, 'alInterrumpir()')
    expect(interrumpir).toMatch(/pausadaDesdeBloqueo\.current = false/)
    expect(interrumpir).toMatch(/maquina\.current\?\.pausar\(\)/)
  })

  it('el cuadro dice si suena o está en pausa', () => {
    expect(HOOK).toMatch(/estadoDelCuadro\(estado !== ESTADOS\.PAUSADO\)/)
  })
})

describe('al volver a la app', () => {
  const visibilidad = bloque(
    HOOK,
    'function alCambiarVisibilidad',
    "document.addEventListener('visibilitychange'",
  )

  it('el 9.4 recibe si sonó fuera', () => {
    expect(visibilidad).toMatch(/notificarAusencia\(Date\.now\(\) - desde, \{ sono \}\)/)
    expect(visibilidad).toMatch(/sonoFuera\(/)
  })

  it('el respaldo: si está mudo, el siguiente toque reconstruye (sin suspend ni resume)', () => {
    expect(visibilidad).toMatch(/audioMudo\(/)
    expect(visibilidad).toMatch(
      /alSiguienteToque\(document, \(\) => \{[\s\S]*?reconstruirAudio\(\)/,
    )
    expect(HOOK).not.toMatch(/\.suspend\(/)
  })

  it('con la app fuera la guía no se toca desde las fases ni vibra', () => {
    const alCambiarFase = bloque(HOOK, 'alCambiarFase(ritmo) {', 'guia.current?.fase(ritmo.fase')
    expect(alCambiarFase.indexOf('if (enFondo.current) return')).toBeLessThan(
      alCambiarFase.indexOf('toqueSuave()'),
    )
  })
})

describe('el Wake Lock (DP-23.27)', () => {
  it('al volver, si se soltó y la sesión sigue despierta, se pide otra vez', () => {
    const wakeLock = codigoDe('src/breathing/hooks/useWakeLock.js')
    expect(wakeLock).toMatch(/function alVolver\(\)/)
    expect(wakeLock).toMatch(/released !== true\) return/)
    expect(wakeLock).toMatch(/removeEventListener\('visibilitychange', alVolver\)/)
  })
})

describe('«Respira un momento» (DP-23.26)', () => {
  it('con el sonido activado reclama al empezar, antes de crear la guía', () => {
    const arrancar = bloque(MOMENTO, 'const arrancar = () =>', 'const pausar')
    const reclama = arrancar.indexOf('if (!silenciado && !reclamado.current) reclamarSonido()')
    expect(reclama).toBeGreaterThan(-1)
    expect(reclama).toBeLessThan(arrancar.indexOf('crearAudioRespiracion()'))
  })

  it('silenciar suelta; activar reclama', () => {
    const alternar = bloque(MOMENTO, 'const alternarSonido', 'return (')
    expect(alternar).toMatch(/reclamarSonido\(\)/)
    expect(alternar).toMatch(/soltarSonido\(\)/)
  })

  it('soltar es «auto» antes de cerrar el contexto (detener la guía)', () => {
    const soltarSonido = bloque(MOMENTO, 'const soltarSonido', 'const limpiar')
    expect(soltarSonido.indexOf('soltar()')).toBeLessThan(soltarSonido.indexOf('detener()'))
  })

  it('con la app fuera usa el acompañamiento de lib/, y si termina, cierra', () => {
    expect(MOMENTO).toMatch(/crearAcompanamientoDeFondo\(/)
    const fondo = bloque(MOMENTO, 'function obtenerFondo()', 'const montarGuia')
    expect(fondo).toMatch(/if \(punto\.terminado\) \{\s*terminar\(\)/)
  })

  it('no conoce breathing/ ni diario/, y los textos del cuadro le llegan de Hoy', () => {
    const imports = MOMENTO.match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
    imports.forEach((linea) => expect(linea).not.toMatch(/breathing|diario|@copy'/))
    const hoy = codigoDe('src/pages/diario/Hoy.jsx')
    expect(hoy).toMatch(/cuadro=\{CUADRO_DE_LA_PANTALLA_DE_BLOQUEO\}/)
    expect(hoy).toMatch(/subtitulo: copy\.respiracion\.bloqueo\.subtituloMomento/)
  })
})

describe('el copy del cuadro (§6)', () => {
  it('exacto y sin exclamaciones', () => {
    expect(copy.respiracion.bloqueo).toEqual({
      titulo: 'Respiración · Strivo',
      subtituloMomento: 'Respira un momento',
    })
  })

  it('la sección pone de subtítulo el nombre del patrón', () => {
    const seccion = codigoDe('src/breathing/Respiracion.jsx')
    expect(seccion).toMatch(/copy\.respiracion\.patrones\[preset\.claveCopy\]\.nombre/)
    expect(seccion).toMatch(/titulo: copy\.respiracion\.bloqueo\.titulo/)
  })
})
