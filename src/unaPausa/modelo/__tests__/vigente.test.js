// SPEC_28.1 §4.4 — lo que toca mostrar.
import { describe, expect, it } from 'vitest'
import { ESTADOS } from '../capsula.js'
import { validar } from '../validar.js'
import { archivo, calendarioEfectivo, capsulaVigente } from '../vigente.js'
import { programada, reserva } from './capsulas.js'

const ids = (lista) => lista.map((c) => c.id)
const lunes = (clave, hora = '00:00:00') => `${clave}T${hora}-06:00`

describe('programada → reserva → repetida (criterio 5)', () => {
  // La reserva más nueva va primero en la entrada: el orden lo da approvedAt.
  const capsulas = [
    reserva('r-nueva', '2026-11-15'),
    programada('2026-12-07'),
    reserva('r-vieja', '2026-11-01'),
  ]
  const ahora = lunes('2026-12-28', '09:00:00')

  it('la primera semana vacía usa la reserva más antigua; la siguiente, la otra; la tercera repite', () => {
    expect(calendarioEfectivo(capsulas, ahora)).toEqual([
      { weekStart: '2026-12-07', id: 'c-2026-12-07', origen: 'programada' },
      { weekStart: '2026-12-14', id: 'r-vieja', origen: 'reserva' },
      { weekStart: '2026-12-21', id: 'r-nueva', origen: 'reserva' },
      { weekStart: '2026-12-28', id: 'r-nueva', origen: 'repetida' },
    ])
  })

  it('la vigente es la de la última semana, y el archivo no repite ninguna', () => {
    expect(capsulaVigente(capsulas, ahora).id).toBe('r-nueva')
    expect(ids(archivo(capsulas, ahora))).toEqual(['r-vieja', 'c-2026-12-07'])
  })

  it('es determinista: el mismo conjunto en otro orden da el mismo calendario', () => {
    const otraVez = calendarioEfectivo([...capsulas].reverse(), ahora)
    expect(otraVez).toEqual(calendarioEfectivo(capsulas, ahora))
  })

  it('una programada siempre gana a la reserva en su semana', () => {
    const conOtra = [...capsulas, programada('2026-12-14')]
    expect(calendarioEfectivo(conOtra, ahora).slice(0, 3)).toEqual([
      { weekStart: '2026-12-07', id: 'c-2026-12-07', origen: 'programada' },
      { weekStart: '2026-12-14', id: 'c-2026-12-14', origen: 'programada' },
      { weekStart: '2026-12-21', id: 'r-vieja', origen: 'reserva' },
    ])
  })

  it('el archivo va de la más reciente a la más antigua', () => {
    const tres = [programada('2026-12-07'), programada('2026-12-14'), programada('2026-12-21')]
    expect(ids(archivo(tres, ahora))).toEqual(['c-2026-12-14', 'c-2026-12-07'])
    expect(capsulaVigente(tres, ahora).id).toBe('c-2026-12-21')
  })

  it('si dos programadas chocan en la misma semana, gana el id menor', () => {
    const a = programada('2026-12-07', { id: 'b' })
    const b = programada('2026-12-07', { id: 'a' })
    expect(calendarioEfectivo([a, b], ahora)[0].id).toBe('a')
  })
})

describe('el lunes a las 00:00 de Monterrey', () => {
  const capsulas = [programada('2026-12-07'), programada('2026-12-14')]

  it('el domingo 23:59:59 sigue la de la semana anterior; el lunes 00:00, la nueva', () => {
    expect(capsulaVigente(capsulas, lunes('2026-12-13', '23:59:59')).id).toBe('c-2026-12-07')
    expect(capsulaVigente(capsulas, lunes('2026-12-14')).id).toBe('c-2026-12-14')
  })

  it('nada futuro: antes de su lunes, una programada no existe', () => {
    expect(capsulaVigente(capsulas, lunes('2026-12-06', '23:59:59'))).toBeNull()
  })
})

describe('una reserva solo vale para semanas cuyo lunes llega después de su aprobación', () => {
  it('aprobada el martes, no cubre ese lunes; cubre el siguiente', () => {
    const capsulas = [programada('2026-12-07'), reserva('r', '2026-12-15')]
    expect(calendarioEfectivo(capsulas, lunes('2026-12-21'))).toEqual([
      { weekStart: '2026-12-07', id: 'c-2026-12-07', origen: 'programada' },
      { weekStart: '2026-12-14', id: 'c-2026-12-07', origen: 'repetida' },
      { weekStart: '2026-12-21', id: 'r', origen: 'reserva' },
    ])
  })

  it('aprobada justo en el instante del lunes, tampoco: tiene que ser antes', () => {
    const r = reserva('r', '2026-12-13', { approvedAt: lunes('2026-12-14') })
    const cal = calendarioEfectivo([programada('2026-12-07'), r], lunes('2026-12-14'))
    expect(cal.at(-1).origen).toBe('repetida')
  })
})

describe('sin nada publicable (criterio 6)', () => {
  const ahora = lunes('2026-12-28')

  it('sin cápsulas', () => {
    expect(capsulaVigente([], ahora)).toBeNull()
    expect(archivo([], ahora)).toEqual([])
    expect(calendarioEfectivo([], ahora)).toEqual([])
  })

  it('con solo borradores, piloto o inválidas', () => {
    const capsulas = [
      { ...programada('2026-12-07'), status: 'borrador' },
      programada('2026-12-14', { piloto: true }),
      programada('2026-12-21', { opening: 'Una terapia.' }),
    ]
    expect(capsulaVigente(capsulas, ahora)).toBeNull()
    expect(archivo(capsulas, ahora)).toEqual([])
  })

  it('con solo reservas: el calendario empieza con la primera programada que llega', () => {
    const capsulas = [reserva('r1', '2026-11-01'), reserva('r2', '2026-11-02')]
    expect(capsulaVigente(capsulas, ahora)).toBeNull()
    expect(archivo(capsulas, ahora)).toEqual([])
  })

  it('con un instante ilegible o sin lista', () => {
    expect(capsulaVigente([programada('2026-12-07')], 'mañana')).toBeNull()
    expect(capsulaVigente(undefined, ahora)).toBeNull()
  })
})

describe('nunca se muestra lo que no debe (criterio 4)', () => {
  const PROHIBIDOS = ['tema_calendarizado', 'borrador', 'en_revision', 'prevalidada', 'rechazada']
  const ahora = lunes('2026-12-28', '12:00:00')

  // Tres cápsulas, cada una en los nueve estados: 729 combinaciones, y otras
  // tantas con la primera marcada como piloto. La tercera no pasa `validar` en
  // ningún estado en que se le revise el léxico.
  const plantillas = [
    programada('2026-12-07'),
    reserva('r', '2026-11-01'),
    programada('2026-12-21', { opening: 'Una terapia.' }),
  ]
  const combinaciones = []
  for (const piloto of [false, true]) {
    for (const a of ESTADOS) {
      for (const b of ESTADOS) {
        for (const c of ESTADOS) {
          combinaciones.push([
            { ...plantillas[0], status: a, piloto },
            { ...plantillas[1], status: b },
            { ...plantillas[2], status: c },
          ])
        }
      }
    }
  }

  const visible = (capsula) =>
    !PROHIBIDOS.includes(capsula.status) &&
    capsula.piloto !== true &&
    validar(capsula).faltas.length === 0

  it('recorre todas las combinaciones', () => {
    expect(combinaciones).toHaveLength(2 * 9 ** 3)
  })

  it('ni la vigente ni el archivo traen nunca una cápsula prohibida, piloto o inválida', () => {
    let vistas = 0
    for (const capsulas of combinaciones) {
      const vigente = capsulaVigente(capsulas, ahora)
      const mostradas = [...(vigente ? [vigente] : []), ...archivo(capsulas, ahora)]
      for (const capsula of mostradas) {
        expect(visible(capsula)).toBe(true)
        expect(capsula.id).not.toBe('c-2026-12-21')
      }
      vistas += mostradas.length
    }
    // Que la prueba no pase por no mostrar nunca nada.
    expect(vistas).toBeGreaterThan(0)
  })
})

describe('límites de Fase A, a la vista y sin resolver', () => {
  // El calendario no se guarda: se recalcula. Estas pruebas no dicen que esté
  // bien, dicen lo que pasa, para que nadie lo descubra en producción. Por eso
  // CLAUDE.md pide no cambiar una constante editorial ni añadir una cápsula con
  // semana pasada sin revisar el archivo.
  const antes = [programada('2026-12-07'), reserva('r', '2026-11-01')]
  const ahora = lunes('2026-12-21', '12:00:00')

  it('un archivo nuevo con una semana ya pasada reescribe la historia', () => {
    expect(calendarioEfectivo(antes, ahora)).toEqual([
      { weekStart: '2026-12-07', id: 'c-2026-12-07', origen: 'programada' },
      { weekStart: '2026-12-14', id: 'r', origen: 'reserva' },
      { weekStart: '2026-12-21', id: 'r', origen: 'repetida' },
    ])
    // Con los plazos cumplidos sobre el papel, una programada para el 14 que
    // aparece el 21 ocupa una semana que ya se mostró, y la reserva se corre.
    const despues = [...antes, programada('2026-12-14')]
    expect(calendarioEfectivo(despues, ahora)).toEqual([
      { weekStart: '2026-12-07', id: 'c-2026-12-07', origen: 'programada' },
      { weekStart: '2026-12-14', id: 'c-2026-12-14', origen: 'programada' },
      { weekStart: '2026-12-21', id: 'r', origen: 'reserva' },
    ])
    expect(ids(archivo(despues, ahora))).toEqual(['c-2026-12-14', 'c-2026-12-07'])
  })

  it('una cápsula ya publicada que deja de pasar validar sale del calendario hacia atrás', () => {
    // Es lo que pasará cuando caduque la exención de DP-28.13, o cambie una
    // constante de plazo: el mismo archivo, juzgado con otra regla.
    const editada = programada('2026-12-07', { opening: 'Una terapia.' })
    expect(calendarioEfectivo([editada, reserva('r', '2026-11-01')], ahora)).toEqual([])
  })
})
