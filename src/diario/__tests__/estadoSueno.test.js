// src/diario/__tests__/estadoSueno.test.js
// "¿Cómo te vas a dormir?" — **catálogo heredado** (§5.4.1).
//
// La pregunta se retiró el 23 ago: la sustituyó "¿Cómo me siento al cerrar el
// día?" (`nocheEmociones.js`, `noche.test.js`). Lo que se comprueba aquí es que
// las noches escritas antes de esa fecha se siguen leyendo enteras, y que del
// módulo se fue todo lo de escritura: nadie puede volver a guardar un estado de
// sueño sin darse cuenta.

import { describe, expect, it } from 'vitest'

import * as estadoSueno from '../estadoSueno.js'
import {
  IDS,
  OPCIONES,
  animoDerivado,
  etiquetaDe,
  etiquetasDe,
  primeraPalabra,
} from '../estadoSueno.js'

describe('estado de sueño (catálogo heredado)', () => {
  it('ya no exporta nada que escriba: la pregunta se retiró con su escritura', () => {
    ;['alternarEstado', 'paraGuardar', 'MAX_ESTADOS', 'disparaCompasion'].forEach((nombre) =>
      expect(estadoSueno[nombre]).toBeUndefined(),
    )
  })

  it('son nueve opciones en orden fijo, con "Algo más" al final', () => {
    expect(OPCIONES).toHaveLength(9)
    expect(IDS[0]).toBe('en_paz')
    expect(IDS[IDS.length - 1]).toBe('otro')
  })

  it('incluye los estados difíciles a propósito', () => {
    expect(IDS).toContain('cansado')
    expect(IDS).toContain('inquieto')
    expect(IDS).toContain('pensativo')
  })

  it('resuelve las etiquetas al género vigente, también en lo ya guardado', () => {
    expect(etiquetaDe('tranquilo', 'f')).toBe('Tranquila')
    expect(etiquetaDe('tranquilo', 'm')).toBe('Tranquilo')
    expect(etiquetaDe('tranquilo', 'n')).toBe('En calma')
  })

  it('"Algo más" se guardó como una palabra y así se relee', () => {
    expect(primeraPalabra('  serena  y algo más ')).toBe('serena')
    expect(primeraPalabra('x'.repeat(40))).toHaveLength(24)
  })

  it('presenta la palabra propia entrecomillada y sin transformar', () => {
    expect(etiquetasDe(['en_paz', 'otro'], 'serena', 'f')).toEqual(['En paz', '«serena»'])
  })

  describe('animoDerivado', () => {
    it('sigue la tabla de §5.4.1', () => {
      expect(animoDerivado(['en_paz'])).toBe('en_paz')
      expect(animoDerivado(['agradecido'])).toBe('en_paz')
      expect(animoDerivado(['orgulloso'])).toBe('en_paz')
      expect(animoDerivado(['contento'])).toBe('en_paz')
      expect(animoDerivado(['tranquilo'])).toBe('tranquilo')
      expect(animoDerivado(['pensativo'])).toBe('normal')
      expect(animoDerivado(['cansado'])).toBe('agotado')
      expect(animoDerivado(['inquieto'])).toBe('inquieto')
      expect(animoDerivado(['otro'])).toBe('normal')
      expect(animoDerivado([])).toBe('normal')
    })

    it('con dos selecciones gana la más pesada', () => {
      expect(animoDerivado(['agradecido', 'cansado'])).toBe('agotado')
      expect(animoDerivado(['tranquilo', 'inquieto'])).toBe('inquieto')
    })
  })
})
