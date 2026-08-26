// src/diario/__tests__/frases.test.js
// La frase del día: determinista, sin repetición dentro del repertorio y sin
// léxico prohibido (RN-HOY-02, §3.6).

import { describe, expect, it } from 'vitest'

import {
  FRASES,
  TEMAS,
  TIPOS,
  diasSinRepetir,
  fraseDelDia,
  revisablesDe,
} from '@/content/frases-del-dia'
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

  it('etiqueta cada frase con un tipo del catálogo', () => {
    FRASES.forEach((frase) => expect(TIPOS).toContain(frase.tipo))
  })

  it('ninguna frase se queda sin atribución', () => {
    // Una entrada sin atribuir es una cita que se lee como voz de Strivo, o una
    // versión propia que se lee como cita. El campo no es decorativo.
    const sinAtribuir = FRASES.filter(
      (frase) => typeof frase.atribucion !== 'string' || frase.atribucion.trim() === '',
    ).map((frase) => frase.id)
    expect(sinAtribuir).toEqual([])
  })

  it('no pone dos temas iguales seguidos', () => {
    // `fraseDelDia` recorre el array por índice de día, así que dos entradas
    // consecutivas del mismo tema son dos días seguidos del mismo tema. El
    // intercalado del repertorio es lo que lo evita, y esto lo vigila.
    const repetidos = FRASES.slice(1)
      .map((frase, i) => (frase.tema === FRASES[i].tema ? `${FRASES[i].id}→${frase.id}` : null))
      .filter(Boolean)
    expect(repetidos).toEqual([])
  })

  it('no usa léxico prohibido ni exclamaciones (§3.6)', () => {
    // **Se revisa lo revisable, no todo.** El texto de una cita es de una obra
    // en dominio público: corregirlo para que pase el léxico la dejaría de ser
    // una cita. Qué se exige de cada entrada lo decide `revisablesDe`, que vive
    // junto a los datos y lo comparte con `scripts/lint-copy.js`.
    const prohibido = /fallaste|incumpliste|abandonaste|racha|deber[íi]as?|tendr[íi]as?|tarea|[¡!]/i
    const infractoras = FRASES.filter((frase) =>
      revisablesDe(frase).some((cadena) => prohibido.test(cadena)),
    ).map((frase) => `${frase.id} (${frase.tipo})`)
    expect(infractoras).toEqual([])
  })

  it('exime el texto de una cita, nunca su atribución ni una original', () => {
    const cita = FRASES.find((frase) => frase.tipo === 'cita')
    const original = FRASES.find((frase) => frase.tipo === 'original')
    expect(revisablesDe(cita)).toEqual([cita.atribucion])
    expect(revisablesDe(original)).toEqual([original.texto, original.atribucion])
    expect(revisablesDe(undefined)).toEqual([])
  })

  it('no lleva marca de género: ninguna frase necesita el helper', () => {
    FRASES.forEach((frase) => expect(typeof frase.texto).toBe('string'))
  })
})
