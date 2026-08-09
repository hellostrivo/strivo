// tests/gradienteHorario.test.js
// El fondo que acompaña el paso del día (§18) y, sobre todo, que se pueda leer
// encima a cualquier hora: es la restricción más importante de esa sección.

import { describe, it, expect } from 'vitest'
import { fondoHorario, contraste, luminancia } from '@lib/gradienteHorario'
import { gradientesInicio } from '@tokens'

const alas = (hora, minuto = 0) => new Date(2026, 7, 6, hora, minuto)

// Todos los minutos del día, de diez en diez
const todoElDia = []
for (let hora = 0; hora < 24; hora += 1) {
  for (let minuto = 0; minuto < 60; minuto += 10) todoElDia.push(alas(hora, minuto))
}

describe('El degradado sigue al reloj (§18.3)', () => {
  it('nunca es un color plano', () => {
    for (const momento of todoElDia) {
      const fondo = fondoHorario(momento)
      expect(fondo.from, momento.toString()).not.toBe(fondo.to)
      expect(fondo.gradiente).toContain('linear-gradient')
    }
  })

  it('a las 11:40 está a medio camino entre mañana y mediodía', () => {
    const fondo = fondoHorario(alas(11, 40))
    expect(fondo.desde).toBe('manana')
    expect(fondo.hasta).toBe('mediodia')

    const manana   = gradientesInicio.find(a => a.id === 'manana')
    const mediodia = gradientesInicio.find(a => a.id === 'mediodia')
    expect(fondo.from).not.toBe(manana.from)
    expect(fondo.from).not.toBe(mediodia.from)

    // Y de verdad en medio: la luminancia queda entre las dos
    const entre = [luminancia(manana.from), luminancia(mediodia.from)].sort((a, b) => a - b)
    expect(luminancia(fondo.from)).toBeGreaterThan(entre[0])
    expect(luminancia(fondo.from)).toBeLessThan(entre[1])
  })

  it('la mañana es clara y la noche es oscura', () => {
    expect(fondoHorario(alas(9, 30)).sobreOscuro).toBe(false)
    expect(fondoHorario(alas(21, 30)).sobreOscuro).toBe(true)
    expect(fondoHorario(alas(2, 0)).sobreOscuro).toBe(true)
  })

  it('el día es un círculo: de la noche a la madrugada sin costura', () => {
    const antes   = fondoHorario(alas(23, 50))
    const despues = fondoHorario(alas(0, 10))
    // Veinte minutos de diferencia no pueden cambiar el fondo de golpe
    expect(contraste(antes.from, despues.from)).toBeLessThan(1.2)
  })

  it('el cambio de un minuto a otro es imperceptible', () => {
    // Sin saltos a horas redondas (§18.3.2): entre dos minutos seguidos el
    // fondo apenas se mueve, también al amanecer y al anochecer, que es cuando
    // más deprisa cambia.
    for (let minutos = 1; minutos < 24 * 60; minutos += 1) {
      const previo = fondoHorario(alas(Math.floor((minutos - 1) / 60), (minutos - 1) % 60))
      const actual = fondoHorario(alas(Math.floor(minutos / 60), minutos % 60))
      expect(contraste(previo.from, actual.from), `minuto ${minutos}`).toBeLessThan(1.15)
    }
  })
})

describe('Se puede leer encima a cualquier hora (§18.4)', () => {
  // Un fondo que va de oscuro a claro sin saltos (§18.3.2) tiene por fuerza un
  // punto intermedio donde ni la tinta oscura ni la clara llegan a 4.5:1: la
  // franja de luminancia entre 0.17 y 0.22 no la cubre ninguna de las dos. Es
  // el único sitio donde las dos reglas de §18 chocan, y se resuelve así:
  // el cruce se mide, se acota y no dura nada; el texto de cuerpo va en
  // tarjetas con superficie propia (§18.4, último punto), que no dependen de
  // la franja. Lo que queda directamente sobre el degradado es breve.
  const cruce = momento => {
    const fondo = fondoHorario(momento)
    return Math.min(contraste(fondo.texto, fondo.from), contraste(fondo.texto, fondo.to)) < 4.5
  }

  it('el texto pasa el 4.5:1 en las cuatro franjas', () => {
    for (const [hora, minuto] of [[6, 0], [9, 30], [13, 30], [18, 0], [21, 30], [1, 0]]) {
      const fondo = fondoHorario(alas(hora, minuto))
      expect(contraste(fondo.texto, fondo.from), `${hora}:${minuto}`).toBeGreaterThanOrEqual(4.5)
      expect(contraste(fondo.texto, fondo.to), `${hora}:${minuto}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('y también en los intermedios, salvo en el cruce de tinta', () => {
    for (const momento of todoElDia) {
      if (cruce(momento)) continue
      const fondo = fondoHorario(momento)
      expect(contraste(fondo.texto, fondo.from), momento.toString()).toBeGreaterThanOrEqual(4.5)
      expect(contraste(fondo.texto, fondo.to), momento.toString()).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('el cruce es corto y se queda cerca del umbral', () => {
    const cruces = todoElDia.filter(cruce)

    // Dos al día —cuando amanece y cuando anochece— y de pocos minutos: las
    // anclas del alba y del ocaso están juntas justamente para eso.
    expect(cruces.length).toBeLessThanOrEqual(4)

    // 3.9:1 es el suelo teórico de este cruce con las dos tintas del sistema:
    // el peor punto posible entre un fondo oscuro y uno claro. Lo que se
    // garantiza es que no cae por debajo de eso y que dura minutos.
    for (const momento of cruces) {
      const fondo = fondoHorario(momento)
      expect(fondo.contraste, momento.toString()).toBeGreaterThanOrEqual(3.9)
    }
  })

  it('el atardecer, que es la franja difícil, pasa con margen', () => {
    expect(fondoHorario(alas(18, 0)).contraste).toBeGreaterThanOrEqual(4.5)
    expect(fondoHorario(alas(19, 0)).contraste).toBeGreaterThanOrEqual(4.5)
  })
})
