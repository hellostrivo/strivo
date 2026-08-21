// src/lib/respiracion/__tests__/maquinaSesion.test.js
// La sesión completa (SPEC_13 §6.6). Criterios 10, 11 y 12, y los casos 9.4,
// 9.6, 9.7 y 9.9.

import { describe, expect, it } from 'vitest'

import {
  AVISOS_DURACION,
  DURACION_POR_DEFECTO,
  ESTADOS,
  MS_ACOMODO,
  crearMaquina,
  validarDuracion,
} from '../maquinaSesion.js'
import { PATRON_BASE, duracionCiclo } from '../motorRitmo.js'
import { crearRelojFalso } from './relojFalso.js'

const CICLO = duracionCiclo(PATRON_BASE) // 13 000 ms

function montar(duracion = DURACION_POR_DEFECTO, patron = PATRON_BASE) {
  const falso = crearRelojFalso()
  const estados = []
  const maquina = crearMaquina({
    patron,
    duracion,
    ahora: falso.ahora,
    programarFrame: falso.programarFrame,
    cancelarFrame: falso.cancelarFrame,
    alCambiarEstado: (estado) => estados.push(estado),
  })
  return { falso, maquina, estados }
}

/** Lleva la máquina hasta `activo` sin gastar el acomodo. */
function arrancar(duracion, patron) {
  const montaje = montar(duracion, patron)
  montaje.maquina.iniciar()
  montaje.maquina.saltarAcomodo()
  return montaje
}

describe('validarDuracion (caso 9.9)', () => {
  it('un modo desconocido cae en el de por defecto: 3 minutos', () => {
    const { duracion, valido } = validarDuracion({ modo: 'kilometros', valor: 4 })
    expect(duracion).toEqual({ modo: 'minutos', valor: 3 })
    expect(valido).toBe(false)
  })

  it('valor 0 sube al mínimo y lo anota, sin error', () => {
    const porCiclos = validarDuracion({ modo: 'ciclos', valor: 0 })
    expect(porCiclos.duracion.valor).toBe(1)
    expect(porCiclos.avisos[0].codigo).toBe(AVISOS_DURACION.MINIMO)

    const porMinutos = validarDuracion({ modo: 'minutos', valor: 0 })
    expect(porMinutos.duracion.valor).toBe(1)
  })

  it('los topes son 99 respiraciones y 60 minutos', () => {
    expect(validarDuracion({ modo: 'ciclos', valor: 500 }).duracion.valor).toBe(99)
    expect(validarDuracion({ modo: 'minutos', valor: 500 }).duracion.valor).toBe(60)
  })

  it('en modo abierta no hay valor que validar', () => {
    const { duracion, valido } = validarDuracion({ modo: 'abierta' })
    expect(duracion).toEqual({ modo: 'abierta', valor: null })
    expect(valido).toBe(true)
  })

  it('nunca lanza, con nada', () => {
    for (const entrada of [null, undefined, {}, 5, 'tres minutos', []]) {
      expect(() => validarDuracion(entrada)).not.toThrow()
    }
  })

  it('un decimal se redondea', () => {
    expect(validarDuracion({ modo: 'minutos', valor: 4.6 }).duracion.valor).toBe(5)
  })
})

describe('criterio 12 — el acomodo', () => {
  it('dura 3,0 s exactos y pasa solo a activo', () => {
    const { falso, maquina } = montar()
    maquina.iniciar()
    expect(maquina.estado()).toBe(ESTADOS.ACOMODANDO)
    expect(MS_ACOMODO).toBe(3000)

    falso.avanzar(2984)
    expect(maquina.estado()).toBe(ESTADOS.ACOMODANDO)

    falso.avanzar(16)
    expect(maquina.estado()).toBe(ESTADOS.ACTIVO)
  })

  it('va contando lo que le queda, para poder enseñar 3, 2, 1', () => {
    const { falso, maquina } = montar()
    maquina.iniciar()
    expect(maquina.instantanea().msRestantesAcomodo).toBe(3000)
    falso.avanzar(1008)
    expect(maquina.instantanea().msRestantesAcomodo).toBe(1992)
  })

  it('RN-RE-MOT-19: se salta con un toque', () => {
    const { falso, maquina } = montar()
    maquina.iniciar()
    falso.avanzar(400)
    maquina.saltarAcomodo()
    expect(maquina.estado()).toBe(ESTADOS.ACTIVO)
  })

  it('RN-RE-MOT-21: su tiempo no cuenta para el límite', () => {
    const { falso, maquina } = montar()
    maquina.iniciar()
    falso.avanzar(3000) // se consume el acomodo entero
    falso.avanzar(1000) // y un segundo de ejercicio
    expect(maquina.instantanea().ms).toBe(1000)
  })

  it('durante el acomodo no hay ritmo que enseñar todavía', () => {
    const { maquina } = montar()
    maquina.iniciar()
    expect(maquina.instantanea().ritmo).toBeNull()
  })
})

describe('criterio 10 y RN-RE-MOT-16 — el ciclo en curso siempre se completa', () => {
  it('por tiempo: el límite a mitad de ciclo abre `cerrando`, no `completado`', () => {
    // Un minuto son 60 000 ms; el ciclo es de 13 000. El límite cae dentro del
    // quinto ciclo, a 8 000 ms de su final.
    const { falso, maquina } = arrancar({ modo: 'minutos', valor: 1 })

    falso.avanzar(59_984)
    expect(maquina.estado()).toBe(ESTADOS.ACTIVO)

    falso.avanzar(32)
    expect(maquina.estado()).toBe(ESTADOS.CERRANDO)

    // Sigue respirando hasta cerrar la última: 65 000 ms es el fin del 5º ciclo.
    falso.avanzar(4900)
    expect(maquina.estado()).toBe(ESTADOS.CERRANDO)

    falso.avanzar(200)
    expect(maquina.estado()).toBe(ESTADOS.COMPLETADO)
  })

  it('la sesión real dura entre el límite y el límite más un ciclo (RN-RE-MOT-20)', () => {
    const { falso, maquina } = arrancar({ modo: 'minutos', valor: 1 })
    falso.avanzar(CICLO * 6)
    const { ms } = maquina.instantanea()
    expect(ms).toBeGreaterThanOrEqual(60_000)
    expect(ms).toBeLessThan(60_000 + CICLO)
    expect(maquina.resumen().ciclosCompletados).toBe(5)
  })

  it('por respiraciones: la última se cierra entera', () => {
    const { falso, maquina } = arrancar({ modo: 'ciclos', valor: 3 })

    falso.avanzar(CICLO * 2 - 16)
    expect(maquina.estado()).toBe(ESTADOS.ACTIVO)

    // En 26 000 ms exactos empieza la tercera, que es la última: desde ese
    // instante la sesión está cerrando, y eso es información que la pantalla
    // puede dar ("esta es la última") sin cortar nada.
    falso.avanzar(16)
    expect(maquina.estado()).toBe(ESTADOS.CERRANDO)

    falso.avanzar(CICLO - 100)
    expect(maquina.estado()).toBe(ESTADOS.CERRANDO)

    falso.avanzar(200)
    expect(maquina.estado()).toBe(ESTADOS.COMPLETADO)
    expect(maquina.resumen().ciclosCompletados).toBe(3)
  })

  it('RN-RE-MOT-18: en modo abierta nunca se cierra sola', () => {
    const { falso, maquina } = arrancar({ modo: 'abierta', valor: null })
    falso.avanzar(CICLO * 40)
    expect(maquina.estado()).toBe(ESTADOS.ACTIVO)
    expect(maquina.resumen().ciclosCompletados).toBe(40)
  })
})

describe('criterio 11 y RN-RE-MOT-17 — terminar corta de inmediato', () => {
  it('no espera al final del ciclo: la decisión de la persona manda', () => {
    const { falso, maquina } = arrancar({ modo: 'minutos', valor: 10 })
    falso.avanzar(CICLO * 2 + 3000) // a mitad del tercer ciclo

    maquina.terminar()

    expect(maquina.estado()).toBe(ESTADOS.COMPLETADO)
    expect(maquina.instantanea().ms).toBe(CICLO * 2 + 3000)
    expect(maquina.resumen().terminadaPorPersona).toBe(true)
  })

  it('también corta desde `cerrando`', () => {
    const { falso, maquina } = arrancar({ modo: 'ciclos', valor: 2 })
    falso.avanzar(CICLO + 16)
    expect(maquina.estado()).toBe(ESTADOS.CERRANDO)
    maquina.terminar()
    expect(maquina.estado()).toBe(ESTADOS.COMPLETADO)
  })

  it('caso 9.6: durante el acomodo vuelve a inactivo y no hubo sesión', () => {
    const { falso, maquina } = montar()
    maquina.iniciar()
    falso.avanzar(1200)

    maquina.terminar()

    expect(maquina.estado()).toBe(ESTADOS.INACTIVO)
    expect(maquina.resumen().registrable).toBe(false)
    expect(maquina.resumen().ciclosCompletados).toBe(0)
  })

  it('terminar desde inactivo no hace nada', () => {
    const { maquina } = montar()
    expect(() => maquina.terminar()).not.toThrow()
    expect(maquina.estado()).toBe(ESTADOS.INACTIVO)
  })
})

describe('caso 9.7 — una sesión sin un ciclo completo no es una sesión', () => {
  it('no es registrable si no se cerró ni una respiración', () => {
    const { falso, maquina } = arrancar({ modo: 'minutos', valor: 5 })
    falso.avanzar(4000)
    maquina.terminar()
    expect(maquina.resumen()).toMatchObject({ ciclosCompletados: 0, registrable: false })
  })

  it('con una respiración entera sí lo es', () => {
    const { falso, maquina } = arrancar({ modo: 'minutos', valor: 5 })
    falso.avanzar(CICLO + 500)
    maquina.terminar()
    expect(maquina.resumen()).toMatchObject({ ciclosCompletados: 1, registrable: true })
  })

  it('el resumen cuenta los segundos activos, no los del acomodo', () => {
    const { falso, maquina } = montar({ modo: 'minutos', valor: 5 })
    maquina.iniciar()
    falso.avanzar(3000) // acomodo
    falso.avanzar(CICLO * 2)
    maquina.terminar()
    expect(maquina.resumen().segundosActivos).toBe(26)
  })
})

describe('pausar y reanudar la sesión', () => {
  it('congela el ritmo y vuelve al estado en que estaba', () => {
    const { falso, maquina } = arrancar({ modo: 'minutos', valor: 5 })
    falso.avanzar(5000)

    maquina.pausar()
    expect(maquina.estado()).toBe(ESTADOS.PAUSADO)
    falso.avanzar(30_000)
    expect(maquina.instantanea().ms).toBe(5000)

    maquina.reanudar()
    expect(maquina.estado()).toBe(ESTADOS.ACTIVO)
  })

  it('si estaba cerrando, reanudar devuelve a cerrando y no a activo', () => {
    const { falso, maquina } = arrancar({ modo: 'ciclos', valor: 2 })
    falso.avanzar(CICLO + 100)
    expect(maquina.estado()).toBe(ESTADOS.CERRANDO)

    maquina.pausar()
    maquina.reanudar()
    expect(maquina.estado()).toBe(ESTADOS.CERRANDO)
  })

  it('desde el acomodo no se pausa: no hay nada corriendo', () => {
    const { maquina } = montar()
    maquina.iniciar()
    maquina.pausar()
    expect(maquina.estado()).toBe(ESTADOS.ACOMODANDO)
  })
})

describe('caso 9.4 — la pantalla estuvo bloqueada', () => {
  it('una ausencia de más de un ciclo pasa la sesión a pausado', () => {
    const { falso, maquina } = arrancar({ modo: 'minutos', valor: 20 })
    falso.avanzar(2000)

    falso.ausentarse(CICLO + 5000)
    const pausada = maquina.notificarAusencia(CICLO + 5000)

    expect(pausada).toBe(true)
    expect(maquina.estado()).toBe(ESTADOS.PAUSADO)
  })

  it('una ausencia corta no interrumpe: se recalcula y sigue', () => {
    const { falso, maquina } = arrancar({ modo: 'minutos', valor: 20 })
    falso.avanzar(2000)

    falso.ausentarse(4000)
    const pausada = maquina.notificarAusencia(4000)

    expect(pausada).toBe(false)
    expect(maquina.estado()).toBe(ESTADOS.ACTIVO)
    expect(maquina.instantanea().ms).toBe(6000)
  })

  it('avisar de una ausencia con la sesión ya pausada no hace nada', () => {
    const { falso, maquina } = arrancar({ modo: 'minutos', valor: 20 })
    falso.avanzar(2000)
    maquina.pausar()
    expect(maquina.notificarAusencia(600_000)).toBe(false)
  })
})

describe('el recorrido de estados', () => {
  it('inactivo → acomodando → activo → cerrando → completado', () => {
    const { falso, maquina, estados } = montar({ modo: 'ciclos', valor: 1 })
    maquina.iniciar()
    falso.avanzar(3000)
    falso.avanzar(CICLO + 100)
    expect(estados).toEqual([
      ESTADOS.ACOMODANDO,
      ESTADOS.ACTIVO,
      ESTADOS.CERRANDO,
      ESTADOS.COMPLETADO,
    ])
  })

  it('detener deja todo parado y sin fotogramas pendientes', () => {
    const { falso, maquina } = arrancar()
    falso.avanzar(2000)
    maquina.detener()
    expect(maquina.estado()).toBe(ESTADOS.INACTIVO)
    expect(falso.fotogramasPendientes()).toBe(0)
    expect(() => maquina.detener()).not.toThrow()
  })

  it('iniciar dos veces no reabre una sesión en curso', () => {
    const { falso, maquina } = arrancar()
    falso.avanzar(5000)
    maquina.iniciar()
    expect(maquina.estado()).toBe(ESTADOS.ACTIVO)
    expect(maquina.instantanea().ms).toBe(5000)
  })

  it('tras completarse se puede volver a empezar de cero', () => {
    const { falso, maquina } = arrancar({ modo: 'ciclos', valor: 1 })
    falso.avanzar(CICLO + 100)
    expect(maquina.estado()).toBe(ESTADOS.COMPLETADO)

    maquina.iniciar()
    expect(maquina.estado()).toBe(ESTADOS.ACOMODANDO)
    maquina.saltarAcomodo()
    expect(maquina.instantanea().ms).toBe(0)
  })

  it('la instantánea lleva la duración ya validada', () => {
    const { maquina } = montar({ modo: 'minutos', valor: 900 })
    expect(maquina.instantanea().duracion).toEqual({ modo: 'minutos', valor: 60 })
  })
})
