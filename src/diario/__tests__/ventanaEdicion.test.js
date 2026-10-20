// src/diario/__tests__/ventanaEdicion.test.js
// La ventana de 72 horas: hasta cuándo se puede escribir en un día.
//
// El caso que la trajo: alguien llega a casa a las dos de la mañana y quiere
// cerrar el día que acaba de vivir. Antes se encontraba el día siguiente en
// blanco, porque la clave de fecha ya había cambiado. Aquí se comprueba que ese
// caso está resuelto y que los tres bordes difíciles —el cambio de horario, el
// cambio de huso y el día que todavía no ha llegado— no se llevan nada por
// delante.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import {
  HORAS_DE_EDICION,
  diasEditables,
  editable,
  esFutura,
  inicioDelDia,
  limiteDeEdicion,
} from '../ventanaEdicion.js'

const UNA_HORA = 60 * 60 * 1000

/** Un instante local, escrito con sus números: nunca con `new Date(cadena)`. */
function local(year, month, day, hour = 0, minute = 0) {
  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

describe('cuándo empieza un día', () => {
  it('con el corte por defecto, a la medianoche local de esa fecha', () => {
    const inicio = inicioDelDia('2026-09-02')
    expect(inicio.getFullYear()).toBe(2026)
    expect(inicio.getMonth()).toBe(8)
    expect(inicio.getDate()).toBe(2)
    expect(inicio.getHours()).toBe(0)
    expect(inicio.getMinutes()).toBe(0)
  })

  it('con `diaTerminaA`, a la hora que el perfil declara (RN-DB-01)', () => {
    const inicio = inicioDelDia('2026-09-02', '03:00')
    expect(inicio.getDate()).toBe(2)
    expect(inicio.getHours()).toBe(3)
  })

  it('una clave rota no inventa una fecha: devuelve nada', () => {
    expect(inicioDelDia('')).toBeNull()
    expect(inicioDelDia(null)).toBeNull()
    expect(inicioDelDia('no es una fecha')).toBeNull()
  })

  it('se lee en hora local y no en UTC, en cualquier huso', () => {
    // `new Date('2026-09-02')` sería medianoche UTC, que en América es el día
    // anterior por la tarde y en Asia el mismo día de madrugada. La diferencia
    // entre las dos lecturas es exactamente el desfase del dispositivo.
    const enLocal = inicioDelDia('2026-09-02')
    const enUtc = new Date('2026-09-02')
    expect(enLocal.getTime() - enUtc.getTime()).toBe(enLocal.getTimezoneOffset() * 60 * 1000)
  })
})

describe('la ventana de edición', () => {
  it('dura 72 horas desde que el día empieza, y el número vive en un solo sitio', () => {
    expect(HORAS_DE_EDICION).toBe(72)
    const inicio = inicioDelDia('2026-09-02')
    const limite = limiteDeEdicion('2026-09-02')
    expect(limite.getTime() - inicio.getTime()).toBe(HORAS_DE_EDICION * UNA_HORA)
  })

  it('a las dos de la mañana todavía se puede cerrar el día anterior', () => {
    // El caso reportado, tal cual: son las 02:00 del 3 y el registro es del 2.
    const ahora = local(2026, 9, 3, 2, 0)
    expect(editable('2026-09-02', { ahora })).toBe(true)
    expect(editable('2026-09-03', { ahora })).toBe(true)
  })

  it('hace dos días se escribe; hace cuatro, ya no', () => {
    const ahora = local(2026, 9, 3, 20, 0)
    expect(editable('2026-09-01', { ahora })).toBe(true)
    expect(editable('2026-08-30', { ahora })).toBe(false)
  })

  it('el día que hace 72 horas exactas ya está cerrado', () => {
    const inicio = inicioDelDia('2026-09-01')
    const justoAntes = new Date(inicio.getTime() + HORAS_DE_EDICION * UNA_HORA - 1)
    const justoDespues = new Date(inicio.getTime() + HORAS_DE_EDICION * UNA_HORA)
    expect(editable('2026-09-01', { ahora: justoAntes })).toBe(true)
    expect(editable('2026-09-01', { ahora: justoDespues })).toBe(false)
  })

  it('es deslizante: no se reinicia a medianoche', () => {
    // El mismo día, mirado a las 23:59 y un minuto después. Lo que decide es el
    // tiempo transcurrido, no que haya cambiado la fecha del sistema.
    const antes = local(2026, 9, 2, 23, 59)
    const despues = local(2026, 9, 3, 0, 0)
    expect(editable('2026-09-01', { ahora: antes })).toBe(true)
    expect(editable('2026-09-01', { ahora: despues })).toBe(true)
  })

  it('no depende de la franja horaria: de madrugada se escribe igual', () => {
    const madrugada = local(2026, 9, 3, 3, 30)
    const mediodia = local(2026, 9, 3, 13, 0)
    expect(editable('2026-09-02', { ahora: madrugada })).toBe(true)
    expect(editable('2026-09-02', { ahora: mediodia })).toBe(true)
  })

  it('con `diaTerminaA` la ventana se cuenta desde el corte del perfil', () => {
    // El día "2026-09-01" de quien termina a las 03:00 empieza a las 03:00 del
    // 1 y se cierra a las 03:00 del 4, no a la medianoche.
    const antes = local(2026, 9, 4, 2, 30)
    const despues = local(2026, 9, 4, 3, 30)
    expect(editable('2026-09-01', { ahora: antes, diaTerminaA: '03:00' })).toBe(true)
    expect(editable('2026-09-01', { ahora: despues, diaTerminaA: '03:00' })).toBe(false)
  })

  it('una fecha futura no se escribe: ese día no ha ocurrido', () => {
    const ahora = local(2026, 9, 3, 10, 0)
    expect(esFutura('2026-09-04', { ahora })).toBe(true)
    expect(editable('2026-09-04', { ahora })).toBe(false)
    expect(esFutura('2026-09-03', { ahora })).toBe(false)
  })

  it('una clave rota no abre nada', () => {
    expect(editable(null)).toBe(false)
    expect(editable('2026-13-45')).toBe(false)
  })
})

describe('el cambio de horario y el de huso', () => {
  it('se mide tiempo transcurrido de verdad, no días de 24 horas supuestas', () => {
    // El límite se calcula sumando horas al instante en que el día empezó. Si
    // entre medias el reloj adelanta o atrasa, el límite sigue cayendo 72 horas
    // reales después: es la misma cuenta que hace un reloj de pared parado.
    const inicio = inicioDelDia('2026-10-24')
    const limite = limiteDeEdicion('2026-10-24')
    expect(limite.getTime() - inicio.getTime()).toBe(72 * UNA_HORA)
  })

  it('cambiar de huso no duplica ni esconde un día: la clave no se recalcula', () => {
    // Un registro se guarda bajo la fecha en que se vivió y esa clave no se
    // reinterpreta nunca. Mirarla desde otro huso mueve el instante en que la
    // ventana termina —que es lo correcto, porque también se movió el reloj—,
    // pero no cambia de qué día es el registro ni lo hace aparecer dos veces.
    const ahora = local(2026, 9, 3, 12, 0)
    const abiertos = diasEditables('2026-09-03', { ahora })
    expect(new Set(abiertos).size).toBe(abiertos.length)
    expect(abiertos).toContain('2026-09-03')
  })
})

describe('los días que se pueden abrir', () => {
  it('son hoy y los dos anteriores', () => {
    const ahora = local(2026, 9, 3, 21, 0)
    expect(diasEditables('2026-09-03', { ahora })).toEqual([
      '2026-09-03',
      '2026-09-02',
      '2026-09-01',
    ])
  })

  it('llegan en orden, del más reciente al más antiguo, y sin huecos', () => {
    const ahora = local(2026, 9, 3, 1, 0)
    const abiertos = diasEditables('2026-09-03', { ahora })
    abiertos.forEach((fecha) => expect(editable(fecha, { ahora })).toBe(true))
    expect([...abiertos].sort().reverse()).toEqual(abiertos)
  })

  it('cruzan el cambio de mes sin romperse', () => {
    const ahora = local(2026, 9, 1, 10, 0)
    expect(diasEditables('2026-09-01', { ahora })).toEqual([
      '2026-09-01',
      '2026-08-31',
      '2026-08-30',
    ])
  })

  it('una fecha rota devuelve una lista vacía, no una lista inventada', () => {
    expect(diasEditables('')).toEqual([])
  })
})

describe('el 72 vive en un solo sitio', () => {
  // Un valor mágico repetido se separa en cuanto alguien cambia uno de los dos.
  // Quien lo necesita importa `HORAS_DE_EDICION`; quien lo escriba a mano en
  // otro archivo rompe esta prueba.
  const CONSUMIDORES = [
    'src/diario/diario.js',
    'src/diario/useDiario.js',
    'src/diario/useHistorial.js',
    'src/pages/diario/Hoy.jsx',
    'src/components/diario/SelectorDia.jsx',
    'src/components/diario/VistaDiaCompleto.jsx',
  ]

  /** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
  function codigoDe(ruta) {
    return readFileSync(ruta, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
  }

  CONSUMIDORES.forEach((ruta) => {
    it(`${ruta} no escribe el número a mano`, () => {
      expect(codigoDe(ruta)).not.toMatch(/\b72\b/)
    })
  })
})
