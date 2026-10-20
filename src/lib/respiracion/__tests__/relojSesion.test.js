// src/lib/respiracion/__tests__/relojSesion.test.js
// El reloj de la sesión (SPEC_13 §6.5). Criterios 8, 9 y 22.

import { describe, expect, it, vi } from 'vitest'

import { PATRON_BASE, duracionCiclo, resolverEstado } from '../motorRitmo.js'
import { crearReloj } from '../relojSesion.js'
import { crearRelojFalso } from './relojFalso.js'

const CICLO = duracionCiclo(PATRON_BASE) // 13 000 ms

function montar(extra = {}) {
  const falso = crearRelojFalso()
  const actualizaciones = []
  const cambiosDeFase = []
  const reloj = crearReloj({
    patron: PATRON_BASE,
    ahora: falso.ahora,
    programarFrame: falso.programarFrame,
    cancelarFrame: falso.cancelarFrame,
    alActualizar: (estado, ms) => actualizaciones.push({ estado, ms }),
    alCambiarFase: (estado, ms) => cambiosDeFase.push({ estado, ms }),
    ...extra,
  })
  return { falso, reloj, actualizaciones, cambiosDeFase }
}

describe('RN-RE-MOT-11 — el tiempo se calcula contra el origen (criterio 8)', () => {
  it('diez minutos de sesión no acumulan ni un milisegundo de deriva', () => {
    const { falso, reloj } = montar()
    reloj.iniciar()

    // Pasos irregulares a propósito: un fotograma real nunca cae cada 16,000 ms
    // exactos. Si el reloj sumara deltas, aquí es donde se separaría.
    const pasos = [16, 17, 15, 33, 16, 8, 21]
    let esperado = 0
    let i = 0
    while (esperado < 600_000) {
      const paso = pasos[i++ % pasos.length]
      falso.avanzar(paso, paso)
      esperado += paso
    }

    expect(Math.abs(reloj.obtenerMs() - esperado)).toBeLessThan(50)
    expect(reloj.obtenerMs()).toBe(esperado)
  })

  it('antes de iniciar, el tiempo es cero', () => {
    const { reloj } = montar()
    expect(reloj.obtenerMs()).toBe(0)
    expect(reloj.estaCorriendo()).toBe(false)
  })

  it('un reloj que retrocediera no devuelve tiempo negativo', () => {
    const falso = crearRelojFalso()
    let t = 1000
    const reloj = crearReloj({
      patron: PATRON_BASE,
      ahora: () => t,
      programarFrame: falso.programarFrame,
      cancelarFrame: falso.cancelarFrame,
    })
    reloj.iniciar()
    t = 400
    expect(reloj.obtenerMs()).toBe(0)
  })
})

describe('RN-RE-MOT-12 — los avisos de fase', () => {
  it('alCambiarFase se dispara una vez por fase, no por fotograma', () => {
    const { falso, reloj, cambiosDeFase, actualizaciones } = montar()
    reloj.iniciar()
    falso.avanzar(CICLO)

    // El 5-5-3 tiene tres tramos por ciclo. El primero cuenta: se venía de nada.
    expect(cambiosDeFase.map((c) => c.estado.fase)).toEqual([
      'inhalar',
      'exhalar',
      'retenerVacio',
      'inhalar',
    ])
    expect(actualizaciones.length).toBeGreaterThan(cambiosDeFase.length * 10)
  })

  it('el cambio de ciclo también se anuncia', () => {
    const { falso, reloj, cambiosDeFase } = montar()
    reloj.iniciar()
    falso.avanzar(CICLO * 2)
    const ciclos = cambiosDeFase.map((c) => c.estado.cicloActual)
    expect(Math.max(...ciclos)).toBe(3)
  })

  it('alActualizar recibe el estado ya resuelto, no el tiempo en crudo', () => {
    const { falso, reloj, actualizaciones } = montar()
    reloj.iniciar()
    falso.avanzar(100)
    const ultima = actualizaciones.at(-1)
    expect(ultima.estado.fase).toBe('inhalar')
    expect(ultima.estado).toHaveProperty('amplitud')
    expect(ultima.estado).toHaveProperty('progresoCiclo')
  })
})

describe('RN-RE-MOT-13 — pausar y reanudar (criterio 9)', () => {
  it('retoma la misma fase en el mismo punto', () => {
    const { falso, reloj } = montar()
    reloj.iniciar()
    falso.avanzar(7000) // a mitad de la exhalación

    const antes = reloj.estadoActual()
    reloj.pausar()
    expect(reloj.estaPausado()).toBe(true)

    falso.avanzar(45_000) // tres ciclos y medio de pausa
    const despues = reloj.estadoActual()

    expect(despues.fase).toBe(antes.fase)
    expect(despues.progresoFase).toBeCloseTo(antes.progresoFase, 2)
    expect(Math.abs(despues.progresoFase - antes.progresoFase)).toBeLessThanOrEqual(0.02)
  })

  it('no reinicia el ciclo: lo pausado se descuenta', () => {
    const { falso, reloj } = montar()
    reloj.iniciar()
    falso.avanzar(7000)
    reloj.pausar()
    falso.avanzar(30_000)
    reloj.reanudar()
    falso.avanzar(1000)
    expect(reloj.obtenerMs()).toBe(8000)
  })

  it('mientras está pausado no se emite un solo fotograma', () => {
    const { falso, reloj, actualizaciones } = montar()
    reloj.iniciar()
    falso.avanzar(1000)
    const emitidas = actualizaciones.length
    reloj.pausar()
    falso.avanzar(5000)
    expect(actualizaciones.length).toBe(emitidas)
    expect(falso.fotogramasPendientes()).toBe(0)
  })

  it('pausar dos veces seguidas no descuenta la pausa dos veces', () => {
    const { falso, reloj } = montar()
    reloj.iniciar()
    falso.avanzar(2000)
    reloj.pausar()
    reloj.pausar()
    falso.avanzar(4000)
    reloj.reanudar()
    expect(reloj.obtenerMs()).toBe(2000)
  })

  it('reanudar sin haber pausado no hace nada', () => {
    const { falso, reloj } = montar()
    reloj.iniciar()
    falso.avanzar(2000)
    reloj.reanudar()
    expect(reloj.obtenerMs()).toBe(2000)
  })
})

describe('RN-RE-MOT-14 — la pestaña oculta (caso 9.3)', () => {
  it('el reloj no se pausa: al volver, la posición es la correcta', () => {
    const { falso, reloj } = montar()
    reloj.iniciar()
    falso.avanzar(1000)

    falso.ausentarse(600_000) // diez minutos sin un solo fotograma

    expect(reloj.obtenerMs()).toBe(601_000)
    const esperado = resolverEstado(PATRON_BASE, 601_000)
    expect(reloj.estadoActual().fase).toBe(esperado.fase)
    expect(reloj.estadoActual().progresoFase).toBeCloseTo(esperado.progresoFase, 10)
  })

  it('no se recuperan los fotogramas perdidos', () => {
    const { falso, reloj, actualizaciones } = montar()
    reloj.iniciar()
    falso.avanzar(160)
    const emitidas = actualizaciones.length
    falso.ausentarse(600_000)
    falso.avanzar(16, 16)
    expect(actualizaciones.length).toBe(emitidas + 1)
  })
})

describe('RN-RE-MOT-15 y caso 9.10 — arrancar y detener', () => {
  it('detener libera el fotograma y anula los avisos', () => {
    const { falso, reloj, actualizaciones } = montar()
    reloj.iniciar()
    falso.avanzar(500)
    const emitidas = actualizaciones.length

    reloj.detener()
    falso.avanzar(5000)

    expect(falso.fotogramasPendientes()).toBe(0)
    expect(actualizaciones.length).toBe(emitidas)
    expect(reloj.estaCorriendo()).toBe(false)
  })

  it('detener dos veces no rompe nada', () => {
    const { reloj } = montar()
    reloj.iniciar()
    expect(() => {
      reloj.detener()
      reloj.detener()
    }).not.toThrow()
  })

  it('detener sin haber iniciado tampoco', () => {
    const { reloj } = montar()
    expect(() => reloj.detener()).not.toThrow()
    expect(reloj.obtenerMs()).toBe(0)
  })

  it('criterio 22: un segundo iniciar() sin detener no pisa el origen', () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { falso, reloj } = montar()

    reloj.iniciar()
    falso.avanzar(4000)
    reloj.iniciar() // React en modo estricto monta dos veces
    falso.avanzar(1000)

    expect(reloj.obtenerMs()).toBe(5000)
    expect(aviso).toHaveBeenCalledTimes(1)
    aviso.mockRestore()
  })

  it('tras detener se puede volver a arrancar desde cero', () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { falso, reloj } = montar()
    reloj.iniciar()
    falso.avanzar(4000)
    reloj.detener()
    reloj.iniciar()
    falso.avanzar(1000)
    expect(reloj.obtenerMs()).toBe(1000)
    expect(aviso).not.toHaveBeenCalled()
    aviso.mockRestore()
  })
})

describe('el reloj no depende de la hora del sistema (caso 9.5)', () => {
  it('por defecto pide el tiempo a performance.now, que es monotónico', async () => {
    const { readFileSync } = await import('fs')
    const fuente = readFileSync('src/lib/respiracion/relojSesion.js', 'utf8')
    // Sin los comentarios: lo que importa es qué llama el código, no qué explica.
    const codigo = fuente
      .split('\n')
      .filter((linea) => {
        const limpia = linea.trimStart()
        return !(limpia.startsWith('//') || limpia.startsWith('*') || limpia.startsWith('/*'))
      })
      .join('\n')

    expect(codigo).toContain('performance.now()')
    // `Date.now` aparece una sola vez y como último recurso donde no exista
    // `performance`, nunca como la fuente de tiempo del ejercicio.
    expect(codigo.match(/Date\.now/g) ?? []).toHaveLength(1)
    expect(codigo).toContain(': Date.now()')
  })
})
