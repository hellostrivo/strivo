// src/diario/__tests__/frases.test.js
// La frase del día: determinista, sin repetición dentro del repertorio y sin
// léxico prohibido (RN-HOY-02, §3.6).

import { describe, expect, it } from 'vitest'

import { FRASES, TEMAS, diasSinRepetir, fraseDelDia } from '@/content/frases-del-dia'
import { sumarDias } from '../fechas.js'

describe('frases del día', () => {
  it('devuelve siempre la misma frase para la misma fecha', () => {
    expect(fraseDelDia('2026-08-10')).toEqual(fraseDelDia('2026-08-10'))
  })

  it('no repite ninguna frase mientras dura el repertorio', () => {
    const vistas = new Set()
    let fecha = '2026-08-10'
    for (let dia = 0; dia < diasSinRepetir(); dia += 1) {
      vistas.add(fraseDelDia(fecha).texto)
      fecha = sumarDias(fecha, 1)
    }
    expect(vistas.size).toBe(FRASES.length)
  })

  it('cambia de frase de un día al siguiente', () => {
    const hoy = fraseDelDia('2026-08-10').texto
    const manana = fraseDelDia('2026-08-11').texto
    expect(manana).not.toBe(hoy)
  })

  it('retira las frases de esfuerzo cuando el ánimo reciente es bajo', () => {
    let fecha = '2026-08-10'
    for (let dia = 0; dia < 90; dia += 1) {
      expect(fraseDelDia(fecha, { animoBajoReciente: true }).tema).not.toBe('esfuerzo')
      fecha = sumarDias(fecha, 1)
    }
  })

  it('etiqueta cada frase con un tema del catálogo', () => {
    FRASES.forEach((frase) => expect(TEMAS).toContain(frase.tema))
  })

  it('no usa léxico prohibido ni exclamaciones (§3.6)', () => {
    const prohibido = /fallaste|incumpliste|abandonaste|racha|deber[íi]as?|tendr[íi]as?|tarea|[¡!]/i
    FRASES.forEach((frase) => expect(frase.texto).not.toMatch(prohibido))
  })

  it('no lleva marca de género: ninguna frase necesita el helper', () => {
    FRASES.forEach((frase) => expect(typeof frase.texto).toBe('string'))
  })
})
