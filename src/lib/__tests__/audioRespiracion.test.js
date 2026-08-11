// src/lib/__tests__/audioRespiracion.test.js
// La capa de audio del ejercicio (§6.12.1).
//
// Se prueba con un `AudioContext` de mentira. Lo que importa comprobar no es
// cómo suena —eso se escucha, no se afirma— sino las tres reglas duras: que no
// suena sin gesto (RN-AUD-01), que silenciar silencia de verdad (RN-AUD-02) y
// que al salir no queda nada vivo (RN-AUD-04).

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FRECUENCIA_ALTA, FRECUENCIA_BAJA, GANANCIA_MAX, crearAudioRespiracion } from '../audioRespiracion.js'

/** Un parámetro de audio que apunta lo que le programan. */
function parametroFalso(inicial = 0) {
  return {
    value: inicial,
    rampas: [],
    setValueAtTime(valor, t) {
      this.value = valor
      this.rampas.push({ tipo: 'set', valor, t })
    },
    linearRampToValueAtTime(valor, t) {
      this.value = valor
      this.rampas.push({ tipo: 'rampa', valor, t })
    },
    cancelScheduledValues(t) {
      this.rampas.push({ tipo: 'cancelar', t })
    },
  }
}

function contextoFalso() {
  const nodos = []
  const contexto = {
    state: 'suspended',
    currentTime: 0,
    destination: { nombre: 'destino' },
    cerrado: false,
    reanudado: false,
    createOscillator() {
      const oscilador = {
        tipo: 'oscilador',
        type: null,
        frequency: parametroFalso(FRECUENCIA_BAJA),
        arrancado: false,
        detenido: false,
        desconectado: false,
        start() {
          this.arrancado = true
        },
        stop() {
          this.detenido = true
        },
        connect: vi.fn(),
        disconnect() {
          this.desconectado = true
        },
      }
      nodos.push(oscilador)
      return oscilador
    },
    createGain() {
      const ganancia = {
        tipo: 'ganancia',
        gain: parametroFalso(1),
        desconectado: false,
        connect: vi.fn(),
        disconnect() {
          this.desconectado = true
        },
      }
      nodos.push(ganancia)
      return ganancia
    },
    async resume() {
      this.reanudado = true
      this.state = 'running'
    },
    close() {
      this.cerrado = true
      this.state = 'closed'
    },
  }
  contexto.nodos = nodos
  return contexto
}

let contexto
let audio

beforeEach(() => {
  contexto = contextoFalso()
  audio = crearAudioRespiracion({ crearContexto: () => contexto })
})

describe('nunca suena sin un gesto previo (RN-AUD-01)', () => {
  it('crear el motor no crea ningún contexto de audio', () => {
    expect(audio.activo()).toBe(false)
    expect(contexto.nodos).toHaveLength(0)
  })

  it('programar una fase sin haber iniciado no hace nada', () => {
    audio.fase('inhalar', 5)
    expect(contexto.nodos).toHaveLength(0)
  })

  it('`iniciar` crea el contexto y lo reanuda ahí mismo', async () => {
    await audio.iniciar()
    expect(audio.activo()).toBe(true)
    expect(contexto.reanudado).toBe(true)
    expect(contexto.state).toBe('running')
  })

  it('el oscilador arranca en silencio: el primer sonido lo hace la fase', async () => {
    await audio.iniciar()
    const [oscilador, envolvente] = contexto.nodos
    expect(oscilador.arrancado).toBe(true)
    expect(envolvente.gain.value).toBe(0)
  })

  it('iniciar dos veces no duplica nodos', async () => {
    await audio.iniciar()
    const cuantos = contexto.nodos.length
    await audio.iniciar()
    expect(contexto.nodos).toHaveLength(cuantos)
  })
})

describe('el perfil sonoro de cada fase (§6.12.1)', () => {
  beforeEach(async () => {
    await audio.iniciar()
  })

  it('inhalar sube la ganancia desde el silencio y el tono con ella', () => {
    audio.fase('inhalar', 5)
    const [oscilador, envolvente] = contexto.nodos
    expect(envolvente.gain.value).toBe(GANANCIA_MAX)
    expect(oscilador.frequency.value).toBe(FRECUENCIA_ALTA)
  })

  it('exhalar la baja hasta el silencio, con el tono descendiendo', () => {
    audio.fase('inhalar', 5)
    audio.fase('exhalar', 5)
    const [oscilador, envolvente] = contexto.nodos
    expect(envolvente.gain.value).toBe(0)
    expect(oscilador.frequency.value).toBe(FRECUENCIA_BAJA)
  })

  it('la pausa es silencio real, no un tono sostenido de fondo', () => {
    audio.fase('inhalar', 5)
    audio.fase('pausa', 3)
    const [, envolvente] = contexto.nodos
    expect(envolvente.gain.value).toBe(0)
  })

  it('la ganancia máxima se queda contenida: alguien duerme al lado', () => {
    expect(GANANCIA_MAX).toBeLessThanOrEqual(0.1)
  })

  it('retomar una fase a medias parte del valor que suena, sin saltos', () => {
    audio.fase('inhalar', 5)
    const [, envolvente] = contexto.nodos
    const antes = envolvente.gain.rampas.length
    audio.fase('inhalar', 2)
    const nuevas = envolvente.gain.rampas.slice(antes)
    expect(nuevas[0].tipo).toBe('cancelar')
    expect(nuevas[1]).toMatchObject({ tipo: 'set', valor: GANANCIA_MAX })
  })
})

describe('control de silencio (RN-AUD-02)', () => {
  it('silenciar lleva el maestro a cero y quitarlo lo devuelve', async () => {
    await audio.iniciar()
    const maestro = contexto.nodos[2]

    audio.silenciar(true)
    expect(maestro.gain.value).toBe(0)

    audio.silenciar(false)
    expect(maestro.gain.value).toBe(1)
  })

  it('silenciar antes de iniciar se recuerda para cuando arranque', async () => {
    audio.silenciar(true)
    await audio.iniciar()
    expect(contexto.nodos[2].gain.value).toBe(0)
  })
})

describe('al salir no queda nada vivo (RN-AUD-04)', () => {
  it('detiene el oscilador, desconecta los nodos y cierra el contexto', async () => {
    await audio.iniciar()
    audio.fase('inhalar', 5)
    const [oscilador, envolvente, maestro] = contexto.nodos

    audio.detener()

    expect(oscilador.detenido).toBe(true)
    expect(oscilador.desconectado).toBe(true)
    expect(envolvente.desconectado).toBe(true)
    expect(maestro.desconectado).toBe(true)
    expect(contexto.cerrado).toBe(true)
    expect(audio.activo()).toBe(false)
  })

  it('salir a mitad de ciclo no deja sonido colgado', async () => {
    await audio.iniciar()
    audio.fase('inhalar', 5)
    audio.detener()
    // Lo que llegue después ya no puede sonar: no hay contexto.
    audio.fase('inhalar', 5)
    expect(audio.activo()).toBe(false)
  })

  it('detener dos veces, o sin haber iniciado, no rompe nada', async () => {
    expect(() => audio.detener()).not.toThrow()
    await audio.iniciar()
    audio.detener()
    expect(() => audio.detener()).not.toThrow()
  })

  it('detenido, ya no vuelve a abrir un contexto', async () => {
    audio.detener()
    await audio.iniciar()
    expect(audio.activo()).toBe(false)
  })
})

describe('sin Web Audio, el ejercicio sigue en pie (RN-AUD-05)', () => {
  it('un contexto que no se puede crear no revienta nada', async () => {
    const mudo = crearAudioRespiracion({ crearContexto: () => null })
    expect(await mudo.iniciar()).toBe(false)
    expect(() => mudo.fase('inhalar', 5)).not.toThrow()
    expect(() => mudo.silenciar(true)).not.toThrow()
    expect(() => mudo.detener()).not.toThrow()
  })
})
