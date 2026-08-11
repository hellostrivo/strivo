// src/lumia/__tests__/estadoSueno.test.js
// "¿Cómo te vas a dormir?" (§5.4.1, sus seis criterios de aceptación).

import { describe, expect, it } from 'vitest'

import {
  IDS,
  MAX_ESTADOS,
  OPCIONES,
  alternarEstado,
  animoDerivado,
  disparaCompasion,
  etiquetaDe,
  etiquetasDe,
  paraGuardar,
  primeraPalabra,
} from '../estadoSueno.js'

describe('estado de sueño', () => {
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

  it('no es posible seleccionar tres', () => {
    const { seleccion, desplazada } = alternarEstado(['en_paz', 'agradecido'], 'cansado')
    expect(seleccion).toHaveLength(MAX_ESTADOS)
    expect(seleccion).toEqual(['agradecido', 'cansado'])
    expect(desplazada).toBe('en_paz')
  })

  it('se puede cerrar el día sin elegir nada', () => {
    expect(paraGuardar([], '')).toEqual({ sleepState: [], sleepStateOther: null })
  })

  it('"Algo más" acepta una palabra y solo una, y la guarda literalmente', () => {
    expect(primeraPalabra('  serena  y algo más ')).toBe('serena')
    expect(primeraPalabra('x'.repeat(40))).toHaveLength(24)
    expect(paraGuardar(['otro'], 'serena')).toEqual({
      sleepState: ['otro'],
      sleepStateOther: 'serena',
    })
  })

  it('descarta "Algo más" si no se escribió ninguna palabra', () => {
    expect(paraGuardar(['en_paz', 'otro'], '  ')).toEqual({
      sleepState: ['en_paz'],
      sleepStateOther: null,
    })
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

  it('cansado e inquieto activan el cierre compasivo; pensativo no', () => {
    expect(disparaCompasion(['cansado'])).toBe(true)
    expect(disparaCompasion(['inquieto'])).toBe(true)
    expect(disparaCompasion(['pensativo'])).toBe(false)
    expect(disparaCompasion(['en_paz', 'orgulloso'])).toBe(false)
  })
})
