// src/lib/audio/__tests__/sesionAudio.test.js
// SPEC_23 Parte 2 — Reclamar y soltar «reproducción», el cuadro de la pantalla
// de bloqueo y lo que WebKit hace con el contexto (criterios 2 y 6), con
// dobles de `navigator.audioSession` y `navigator.mediaSession`.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  cuadroPuesto,
  estadoDelCuadro,
  hayTipoDeSesion,
  imagenDeLaApp,
  ponerCuadro,
  quitarCuadro,
  reclamar,
  soltar,
  tipoActual,
  vigilar,
} from '../sesionAudio.js'

function mediaSessionDeMentira() {
  return {
    metadata: null,
    playbackState: 'none',
    manejadores: {},
    setActionHandler(accion, fn) {
      this.manejadores[accion] = fn
    },
  }
}

class Metadatos {
  constructor(datos) {
    Object.assign(this, datos)
  }
}

let navegador

beforeEach(() => {
  navegador = { audioSession: { type: 'auto' }, mediaSession: mediaSessionDeMentira() }
  vi.stubGlobal('navigator', navegador)
  vi.stubGlobal('MediaMetadata', Metadatos)
})

afterEach(() => {
  quitarCuadro()
  vi.unstubAllGlobals()
})

describe('el tipo de sesión de audio (DP-23.19 y 23.20)', () => {
  it('reclamar pone «reproducción» y soltar vuelve a «auto»', () => {
    expect(reclamar()).toBe(true)
    expect(navegador.audioSession.type).toBe('playback')
    expect(tipoActual()).toBe('playback')
    expect(soltar()).toBe(true)
    expect(navegador.audioSession.type).toBe('auto')
  })

  it('sin la API (iOS 16, otros navegadores) no hace nada y no lanza', () => {
    vi.stubGlobal('navigator', {})
    expect(hayTipoDeSesion()).toBe(false)
    expect(reclamar()).toBe(false)
    expect(soltar()).toBe(false)
    expect(tipoActual()).toBeNull()
  })

  it('si WebKit rechaza el cambio, tampoco lanza', () => {
    vi.stubGlobal('navigator', {
      audioSession: {
        get type() {
          return 'auto'
        },
        set type(_) {
          throw new Error('no')
        },
      },
    })
    expect(reclamar()).toBe(false)
  })
})

describe('el cuadro de la pantalla de bloqueo (DP-23.24)', () => {
  const CUADRO = {
    titulo: 'Respiración · Strivo',
    subtitulo: 'Calma 5-5-3',
    imagen: 'capacitor://localhost/icon-512.png',
  }

  it('pone título, subtítulo e imagen, y solo pausa y reproducir', () => {
    expect(ponerCuadro(CUADRO)).toBe(true)
    const { metadata, manejadores, playbackState } = navegador.mediaSession
    expect(metadata).toMatchObject({ title: CUADRO.titulo, artist: CUADRO.subtitulo })
    expect(metadata.artwork).toEqual([{ src: CUADRO.imagen, sizes: '512x512', type: 'image/png' }])
    expect(Object.keys(manejadores).sort()).toEqual(['pause', 'play'])
    expect(playbackState).toBe('playing')
    expect(cuadroPuesto()).toBe(true)
  })

  it('sin imagen, va sin imagen', () => {
    ponerCuadro({ titulo: 'x' })
    expect(navegador.mediaSession.metadata.artwork).toEqual([])
  })

  it('dice si suena o está en pausa', () => {
    ponerCuadro(CUADRO)
    estadoDelCuadro(false)
    expect(navegador.mediaSession.playbackState).toBe('paused')
    estadoDelCuadro(true)
    expect(navegador.mediaSession.playbackState).toBe('playing')
  })

  it('al quitarlo no queda nada', () => {
    ponerCuadro(CUADRO)
    quitarCuadro()
    const { metadata, manejadores, playbackState } = navegador.mediaSession
    expect(metadata).toBeNull()
    expect(manejadores.play).toBeNull()
    expect(manejadores.pause).toBeNull()
    expect(playbackState).toBe('none')
    expect(cuadroPuesto()).toBe(false)
  })

  it('sin la API no se pone y no lanza', () => {
    vi.stubGlobal('navigator', {})
    expect(ponerCuadro(CUADRO)).toBe(false)
    expect(cuadroPuesto()).toBe(false)
  })

  it('la imagen es el ícono de la app, en el origen de la página', () => {
    vi.stubGlobal('location', { origin: 'capacitor://localhost' })
    expect(imagenDeLaApp()).toBe('capacitor://localhost/icon-512.png')
  })
})

describe('lo que WebKit hace con el contexto (DP-23.24 y 23.25)', () => {
  function contexto(estado = 'running') {
    const oyentes = new Set()
    return {
      state: estado,
      addEventListener: (tipo, fn) => tipo === 'statechange' && oyentes.add(fn),
      removeEventListener: (tipo, fn) => oyentes.delete(fn),
      pasarA(nuevo) {
        this.state = nuevo
        oyentes.forEach((fn) => fn())
      },
      oyentes,
    }
  }

  it('pausa de la pantalla de bloqueo: de «en marcha» a «suspendido»; reproducir: vuelta', () => {
    const ctx = contexto()
    const alSuspender = vi.fn()
    const alReanudar = vi.fn()
    vigilar(ctx, { alSuspender, alReanudar })
    ctx.pasarA('suspended')
    expect(alSuspender).toHaveBeenCalledTimes(1)
    ctx.pasarA('running')
    expect(alReanudar).toHaveBeenCalledTimes(1)
  })

  it('un contexto que nace suspendido y arranca no es una pausa ni un reproducir', () => {
    const ctx = contexto('suspended')
    const alSuspender = vi.fn()
    const alReanudar = vi.fn()
    vigilar(ctx, { alSuspender, alReanudar })
    ctx.pasarA('running')
    expect(alSuspender).not.toHaveBeenCalled()
    expect(alReanudar).not.toHaveBeenCalled()
  })

  it('una llamada: «interrumpido»; al colgar no se reanuda sola', () => {
    const ctx = contexto()
    const alInterrumpir = vi.fn()
    const alReanudar = vi.fn()
    const vigia = vigilar(ctx, { alInterrumpir, alReanudar })
    ctx.pasarA('interrupted')
    expect(alInterrumpir).toHaveBeenCalledTimes(1)
    expect(vigia.pasoPorInterrumpido()).toBe(true)
    ctx.pasarA('running')
    expect(alReanudar).not.toHaveBeenCalled()
    vigia.olvidarInterrupcion()
    expect(vigia.pasoPorInterrumpido()).toBe(false)
  })

  it('cancelar retira el oyente', () => {
    const ctx = contexto()
    vigilar(ctx, {}).cancelar()
    expect(ctx.oyentes.size).toBe(0)
  })

  it('sin contexto no hace nada y no lanza', () => {
    const vigia = vigilar(null, {})
    expect(vigia.pasoPorInterrumpido()).toBe(false)
    expect(() => vigia.cancelar()).not.toThrow()
  })
})
