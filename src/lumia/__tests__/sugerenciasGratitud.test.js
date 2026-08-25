// src/lumia/__tests__/sugerenciasGratitud.test.js
// El disparador de las ideas de agradecimiento (§5.3, Bloque 2).
//
// Lo que se vigila aquí es sobre todo lo que NO debe pasar: que las ideas no
// aparezcan solas con la pantalla recién abierta, y que escribir en un renglón
// no calle a los otros dos. Eran los dos síntomas de tener un temporizador
// compartido, y sin prueba volverían en la primera refactorización.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import {
  DESCARTES_MAXIMOS,
  RETRASO_SUGERENCIAS,
  puedeOfrecer,
  silenciadas,
  textoEnfocado,
} from '@/lumia/sugerenciasGratitud'

const CAMPO = 'src/components/lumia/CampoGratitud.jsx'
const FILAS = 'src/components/lumia/FilasDinamicas.jsx'
// El bloque de gratitud de la mañana vive en su momento desde la actualización
// del 23 ago: la pantalla pasó a tener tres momentos y cada uno es su archivo.
const MANANA = 'src/components/lumia/manana/MomentoGratitud.jsx'

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const tresVacios = () => [
  { id: null, texto: '' },
  { id: null, texto: '' },
  { id: null, texto: '' },
]

describe('sin foco no hay ideas', () => {
  it('los tres renglones nacen en blanco', () => {
    const filas = tresVacios()
    expect(puedeOfrecer(null, filas)).toBe(false)
    expect(puedeOfrecer(undefined, filas)).toBe(false)
  })

  it('el renglón enfocado y vacío sí puede ofrecerlas', () => {
    expect(puedeOfrecer(0, tresVacios())).toBe(true)
    expect(puedeOfrecer(2, tresVacios())).toBe(true)
  })

  it('un renglón que ya no existe no ofrece nada', () => {
    expect(puedeOfrecer(7, tresVacios())).toBe(false)
    expect(puedeOfrecer(0, [])).toBe(false)
  })
})

describe('cada renglón lleva su propia cuenta', () => {
  it('haber escrito en el primero no calla al segundo ni al tercero', () => {
    const filas = [{ id: null, texto: 'el café de la mañana' }, ...tresVacios().slice(1)]
    expect(puedeOfrecer(1, filas)).toBe(true)
    expect(puedeOfrecer(2, filas)).toBe(true)
  })

  it('el renglón que tiene texto no las ofrece, aunque esté enfocado', () => {
    const filas = [{ id: null, texto: 'el café de la mañana' }, ...tresVacios().slice(1)]
    expect(puedeOfrecer(0, filas)).toBe(false)
  })

  it('unos espacios no cuentan como escribir', () => {
    expect(puedeOfrecer(0, [{ id: null, texto: '   ' }])).toBe(true)
  })

  it('la espera se mide sobre el texto del renglón enfocado, no del bloque', () => {
    const filas = [
      { id: null, texto: 'algo' },
      { id: null, texto: '' },
    ]
    expect(textoEnfocado(0, filas)).toBe('algo')
    expect(textoEnfocado(1, filas)).toBe('')
    expect(textoEnfocado(null, filas)).toBe('')
  })
})

describe('el silencio por descartes sigue siendo del bloque', () => {
  it('dos "Ahora no" y no vuelven en ningún renglón', () => {
    expect(silenciadas(DESCARTES_MAXIMOS)).toBe(true)
    expect(silenciadas(DESCARTES_MAXIMOS - 1)).toBe(false)
    tresVacios().forEach((_, indice) => {
      expect(puedeOfrecer(indice, tresVacios(), DESCARTES_MAXIMOS)).toBe(false)
    })
  })
})

describe('la espera son cinco segundos (SPEC_06 §4.2, criterio 7)', () => {
  it('no se ha movido al arreglar el disparador', () => {
    expect(RETRASO_SUGERENCIAS).toBe(5000)
  })
})

describe('el componente no vuelve al estado compartido', () => {
  it('no decide por el bloque entero', () => {
    expect(codigoDe(CAMPO)).not.toMatch(/filas\.every/)
  })

  it('la espera depende del renglón enfocado y de su texto', () => {
    expect(codigoDe(CAMPO)).toMatch(/\[enfocada, texto, ofrecible\]/)
  })

  it('las filas avisan de quién tiene el foco', () => {
    const codigo = codigoDe(FILAS)
    expect(codigo).toMatch(/onFocus=\{\(\) => onEnfocar\?\.\(indice\)\}/)
    expect(codigo).toMatch(/onDesenfocar\?\.\(indice, evento\)/)
  })

  it('las ideas se pintan bajo su renglón, no al pie del bloque', () => {
    expect(codigoDe(FILAS)).toMatch(/debajoDeFila\?\.\(indice\)/)
    expect(codigoDe(CAMPO)).toMatch(/enfocada !== indice/)
  })
})

describe('lo que se lee en el bloque de la mañana antes de escribir', () => {
  it('bajo la pregunta, una línea que no pide nada', () => {
    // La redacción la fijó la actualización del 23 ago; el patrón —título más
    // una línea que no pide nada— es el mismo de antes.
    expect(copy.diario.manana.gratitud.lead).toBe('Puede ser algo pequeño.')
    expect(codigoDe(MANANA)).toMatch(/\{textos\.lead\}/)
  })

  it('la pista de qué cabe va dentro de los campos, en el gris del marcador', () => {
    expect(copy.diario.manana.gratitud.placeholder).toBe(
      'Una persona, un momento o algo cotidiano…',
    )
    expect(codigoDe(MANANA)).toMatch(/placeholder=\{textos\.placeholder\}/)
  })

  it('es la misma en los tres renglones: ninguno tiene la suya', () => {
    expect(copy.diario.manana.gratitud.ayudas).toBeUndefined()
    expect(codigoDe(FILAS)).toMatch(/placeholder=\{placeholder\}/)
    expect(codigoDe(FILAS)).not.toMatch(/ayudas/)
  })

  it('la noche ya no tiene un bloque de gratitud: se retiró el 23 ago', () => {
    // "¿Qué agradezco de este día?" la sustituyó "¿Qué quiero reconocer de
    // hoy?", que no lleva ideas de apoyo. Este bloque es solo de la mañana.
    expect(copy.diario.noche.gratitud).toBeUndefined()
  })
})

describe('el repertorio de ideas no se toca: esto era del disparador', () => {
  it('la mañana conserva sus cinco puertas de entrada', () => {
    expect(copy.diario.manana.gratitud.sugerencias.opciones.map((o) => o.label)).toEqual([
      'tu familia',
      'tu cuerpo',
      'este momento',
      'el silencio',
      'lo que tienes',
    ])
  })

  it('cada idea sigue abriendo una pregunta y ninguna rellena el campo', () => {
    const { opciones } = copy.diario.manana.gratitud.sugerencias
    opciones.forEach((opcion) => expect(opcion.pregunta).toMatch(/\?$/))
    expect(codigoDe(CAMPO)).toMatch(/setPregunta\(opcion\.pregunta\)/)
    expect(codigoDe(CAMPO)).not.toMatch(/onCambiar\([^)]*opcion/)
  })

  it('el reconocimiento de la noche no ofrece ideas, y no es un olvido', () => {
    // La pregunta ya trae su propio abanico en el texto de apoyo; una lista de
    // sugerencias encima sería decirle a alguien de qué tiene que hablar su día.
    expect(copy.diario.noche.reconocimiento.sugerencias).toBeUndefined()
    expect(codigoDe('src/components/lumia/noche/MomentoReconocimiento.jsx')).not.toMatch(
      /CampoGratitud|sugerencias/,
    )
  })
})
