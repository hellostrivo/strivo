// tests/etiquetaHabito.test.js
// La etiqueta de un hábito (§5.7, bloque 04).
//
// El bug: se etiquetaba con la identidad de área —el tercer nivel del modelo— y
// salían cosas como "Dormir a tiempo · se mueve porque le hace bien". La
// etiqueta sube al segundo nivel, que es el que siempre encaja, y ante la duda
// no se pone nada.

import { describe, it, expect } from 'vitest'
import { copy } from '@copy'
import { etiquetaDeArea, AREA_TYPES, getAreaName } from '@lib/areas'
import { areaColors } from '@tokens'

const areaDe = (tipo, extra = {}) => ({
  id: `u1_area_${tipo}`,
  userId: 'u1',
  tipo,
  nombre: getAreaName(tipo),
  color: areaColors[tipo],
  identidadArea: 'se mueve porque le hace bien',
  estado: 'activa',
  ...extra,
})

describe('Cuándo se etiqueta un hábito', () => {
  it('con área activa, se muestra el nombre del área', () => {
    expect(etiquetaDeArea(areaDe('salud')).nombre).toBe('Salud')
  })

  it('sin área, no se etiqueta', () => {
    expect(etiquetaDeArea(undefined)).toBeNull()
    expect(etiquetaDeArea(null)).toBeNull()
  })

  // Soltar un área para hacer sitio a otra (§8.5-bis) no puede dejar el hábito
  // con una etiqueta que ya no corresponde.
  it('con un área que la persona ya no tiene activa, no se etiqueta', () => {
    expect(etiquetaDeArea(areaDe('salud', { estado: 'pausada' }))).toBeNull()
    expect(etiquetaDeArea(areaDe('salud', { estado: 'archivada' }))).toBeNull()
  })

  it('nunca devuelve un relleno: o hay nombre o no hay nada', () => {
    const etiqueta = etiquetaDeArea(areaDe('finanzas'))
    expect(etiqueta.nombre.trim()).not.toBe('')
    expect(etiqueta.nombre).not.toMatch(/sin área|general|^—$|^-$/i)
  })
})

describe('Qué nombre se muestra', () => {
  it('las siete áreas tienen nombre y salen del copy', () => {
    for (const tipo of AREA_TYPES) {
      const etiqueta = etiquetaDeArea(areaDe(tipo))
      expect(etiqueta.nombre, tipo).toBe(copy.areas[tipo])
    }
  })

  it('usa la nomenclatura vigente, no la que quedó escrita en la fila', () => {
    // Un área guardada hace meses con la etiqueta antigua se lee hoy con la
    // nueva, sin migrar nada.
    const vieja = areaDe('espiritual', { nombre: 'Espiritual' })
    expect(etiquetaDeArea(vieja).nombre).toBe('Espiritualidad')

    const otra = areaDe('personal', { nombre: 'Personal' })
    expect(etiquetaDeArea(otra).nombre).toBe('Crecimiento personal')
  })

  it('lleva el color del área, para el acento (§D.4)', () => {
    expect(etiquetaDeArea(areaDe('salud')).color).toBe(areaColors.salud)
  })

  it('sin color en la fila, lo saca del token de su tipo', () => {
    const sinColor = areaDe('trabajo', { color: undefined })
    expect(etiquetaDeArea(sinColor).color).toBe(areaColors.trabajo)
  })
})

describe('La identidad de área ya no etiqueta hábitos', () => {
  it('la etiqueta nunca es la frase de identidad', () => {
    const area = areaDe('salud')
    expect(etiquetaDeArea(area).nombre).not.toBe(area.identidadArea)
    expect(etiquetaDeArea(area).nombre).not.toContain('porque le hace bien')
  })

  // El dato sigue ahí: se usa en el ritual de mañana y en el perfil (§G).
  it('pero el dato se conserva en la fila del área', () => {
    const area = areaDe('salud')
    etiquetaDeArea(area)
    expect(area.identidadArea).toBe('se mueve porque le hace bien')
  })

  it('el copy de la identidad de área sigue existiendo para R3', () => {
    expect(copy.ritualManana.r3.template).toBeTruthy()
  })
})
