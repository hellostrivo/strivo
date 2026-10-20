// src/breathing/audio/__tests__/dobleAudio.js
// Un `AudioContext` de mentira que lleva la cuenta de todo (SPEC_15 §8).
//
// El entorno de pruebas no tiene Web Audio, y aunque lo tuviera, **las pruebas
// no oyen**. Lo que sí se puede afirmar sin oír nada es lo que este doble
// registra: cuántos nodos se crearon, cuáles se desconectaron, qué rampas se
// programaron y cuándo. Con eso se comprueban las fugas, los cruces y la
// limpieza, que es donde de verdad se rompe el audio.
//
// Lo más importante que hace: **detectar una asignación directa a `.value`**.
// RN-RE-SND-08 la prohíbe porque produce un chasquido audible, y es un error tan
// fácil de cometer —`gain.value = 0.5` es lo que escribiría cualquiera— que
// merece un `setter` que lo apunte en vez de una revisión de código.

import { vi } from 'vitest'

/** Un `AudioParam` que apunta todo lo que le programan. */
export function parametroFalso(inicial = 0, registro) {
  let interno = inicial
  const parametro = {
    rampas: [],
    asignacionesDirectas: 0,
    get value() {
      return interno
    },
    set value(nuevo) {
      // Aquí está la trampa. Nadie de la app debería llegar nunca.
      parametro.asignacionesDirectas += 1
      registro?.asignacionesDirectas.push(new Error('asignación directa a .value').stack ?? '')
      interno = nuevo
    },
    setValueAtTime(valor, t) {
      interno = valor
      parametro.rampas.push({ tipo: 'set', valor, t })
      return parametro
    },
    linearRampToValueAtTime(valor, t) {
      interno = valor
      parametro.rampas.push({ tipo: 'lineal', valor, t })
      return parametro
    },
    exponentialRampToValueAtTime(valor, t) {
      interno = valor
      parametro.rampas.push({ tipo: 'exponencial', valor, t })
      return parametro
    },
    setTargetAtTime(valor, t, constante) {
      interno = valor
      parametro.rampas.push({ tipo: 'objetivo', valor, t, constante })
      return parametro
    },
    cancelScheduledValues(t) {
      parametro.rampas.push({ tipo: 'cancelar', t })
      return parametro
    },
  }
  return parametro
}

export function crearContextoFalso({ sampleRate = 8000 } = {}) {
  const registro = {
    nodos: [],
    asignacionesDirectas: [],
    conexiones: 0,
    desconexiones: 0,
    buffersCreados: 0,
  }

  function nodoBase(tipo, extra = {}) {
    const nodo = {
      tipo,
      conectado: [],
      desconectado: false,
      arrancado: false,
      detenido: false,
      connect(destino) {
        registro.conexiones += 1
        nodo.conectado.push(destino)
        return destino
      },
      disconnect() {
        if (!nodo.desconectado) registro.desconexiones += 1
        nodo.desconectado = true
        nodo.conectado = []
      },
      ...extra,
    }
    registro.nodos.push(nodo)
    return nodo
  }

  const contexto = {
    registro,
    sampleRate,
    currentTime: 0,
    state: 'running',
    cerrado: false,
    destination: nodoBase('destino'),

    createGain() {
      return nodoBase('ganancia', { gain: parametroFalso(1, registro) })
    },

    createBiquadFilter() {
      return nodoBase('filtro', {
        type: null,
        frequency: parametroFalso(350, registro),
        Q: parametroFalso(1, registro),
      })
    },

    createOscillator() {
      const nodo = nodoBase('oscilador', {
        type: null,
        frequency: parametroFalso(440, registro),
        start(t) {
          nodo.arrancado = true
          nodo.arrancadoEn = t
        },
        stop(t) {
          nodo.detenido = true
          nodo.detenidoEn = t
        },
      })
      return nodo
    },

    createBufferSource() {
      const nodo = nodoBase('fuente', {
        buffer: null,
        loop: false,
        onended: null,
        start(t, desplazamiento, duracion) {
          nodo.arrancado = true
          nodo.arrancadoEn = t
          nodo.desplazamiento = desplazamiento
          nodo.duracion = duracion
        },
        stop(t) {
          nodo.detenido = true
          nodo.detenidoEn = t
        },
      })
      return nodo
    },

    createStereoPanner() {
      return nodoBase('paneo', { pan: parametroFalso(0, registro) })
    },

    createBuffer(canales, largo, frecuencia) {
      registro.buffersCreados += 1
      const datos = new Float32Array(largo)
      return {
        numberOfChannels: canales,
        length: largo,
        sampleRate: frecuencia,
        duration: largo / frecuencia,
        getChannelData: () => datos,
      }
    },

    resume: vi.fn(async () => {
      contexto.state = 'running'
    }),

    close: vi.fn(async () => {
      contexto.cerrado = true
      contexto.state = 'closed'
    }),

    /**
     * Adelanta el reloj de audio, que es lo único que mueve el tiempo aquí.
     *
     * Dispara `onended` de lo que ya terminó, como hace un navegador de verdad.
     * Sin esto, el doble mediría una fuga que no existe —o peor, escondería una
     * que sí—: el doble tiene que equivocarse en lo mismo que el navegador, no
     * en otras cosas.
     */
    avanzar(segundos) {
      contexto.currentTime += segundos
      registro.nodos.forEach((nodo) => {
        if (nodo.detenidoEn === undefined || nodo.terminado) return
        if (nodo.detenidoEn > contexto.currentTime) return
        nodo.terminado = true
        nodo.onended?.()
      })
    },
  }

  return contexto
}

/** Los nodos que siguen conectados. Es la cifra que delata una fuga. */
export function nodosVivos(contexto) {
  return contexto.registro.nodos.filter((nodo) => !nodo.desconectado && nodo.tipo !== 'destino')
}

/** Todas las rampas programadas sobre cualquier ganancia. */
export function rampasDeGanancia(contexto) {
  return contexto.registro.nodos
    .filter((nodo) => nodo.tipo === 'ganancia')
    .flatMap((nodo) => nodo.gain.rampas)
}
