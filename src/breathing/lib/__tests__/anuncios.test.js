// src/breathing/lib/__tests__/anuncios.test.js
// Criterio 17 de SPEC_14 y las reglas RN-RE-VIS-23, 24 y 26.
//
// La regla que se prueba aquí es que el texto **no depende del tiempo**, solo
// de la fase. Es lo que garantiza que un `aria-live` no se actualice sesenta
// veces por segundo, que es la diferencia entre una guía que se puede oír y una
// que no.

import { describe, expect, it } from 'vitest'

import { cambioDeAnuncio, mensajeAccesible, segundosDe } from '../anuncios.js'
import { copy } from '@copy'
import { ESTADOS } from '@lib/respiracion/maquinaSesion.js'
import { duracionCiclo, fasesDelCiclo, resolverEstado } from '@lib/respiracion/motorRitmo.js'

const PATRON = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }
const LARGO = { inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 }

/** Lo que dura una fase del patrón, que es lo que se anuncia. */
function msDeFase(patron, fase) {
  return fasesDelCiclo(patron).find((tramo) => tramo.fase === fase)?.ms ?? 0
}

describe('qué se dice en cada fase (RN-RE-VIS-23)', () => {
  it.each([
    ['inhalar', 'Inhala durante 5 segundos'],
    ['exhalar', 'Exhala durante 5 segundos'],
    ['retenerVacio', 'Descansa durante 3 segundos'],
  ])('%s se anuncia con lo que dura la fase', (fase, esperado) => {
    expect(mensajeAccesible(fase, msDeFase(PATRON, fase), ESTADOS.ACTIVO)).toBe(esperado)
  })

  it('sostener el aire también tiene su frase', () => {
    expect(mensajeAccesible('retenerLleno', msDeFase(LARGO, 'retenerLleno'), ESTADOS.ACTIVO)).toBe(
      'Sostén el aire durante 7 segundos',
    )
  })

  it('no quedan llaves sin rellenar en ninguna de las cuatro', () => {
    for (const fase of ['inhalar', 'retenerLleno', 'exhalar', 'retenerVacio']) {
      const mensaje = mensajeAccesible(fase, 4000, ESTADOS.ACTIVO)
      expect(mensaje).not.toMatch(/[{}]/)
      expect(mensaje).toContain('4 segundos')
    }
  })

  it('una fase que no existe no inventa un anuncio', () => {
    expect(mensajeAccesible('flotar', 1000, ESTADOS.ACTIVO)).toBe('')
    expect(mensajeAccesible(null, 1000, ESTADOS.ACTIVO)).toBe('')
  })
})

describe('los segundos se cuentan como se cuentan en voz alta', () => {
  it('3,4 s quedan cuatro, no tres', () => {
    expect(segundosDe(3400)).toBe(4)
  })

  it('exactos son exactos', () => {
    expect(segundosDe(5000)).toBe(5)
  })

  it('el final es cero y no un número negativo', () => {
    expect(segundosDe(0)).toBe(0)
    expect(segundosDe(-200)).toBe(0)
    expect(segundosDe(NaN)).toBe(0)
  })
})

describe('una actualización por cambio de fase, ni una más (criterio 17)', () => {
  it('tres ciclos simulados producen exactamente un anuncio por fase', () => {
    const ciclo = duracionCiclo(PATRON)
    let anterior = null
    let anuncios = 0

    // Frames a 60 Hz durante tres ciclos: 2.340 oportunidades de equivocarse.
    for (let ms = 0; ms < ciclo * 3; ms += 1000 / 60) {
      const { fase } = resolverEstado(PATRON, ms)
      const mensaje = mensajeAccesible(fase, msDeFase(PATRON, fase), ESTADOS.ACTIVO)
      if (cambioDeAnuncio(anterior, mensaje)) {
        anuncios += 1
        anterior = mensaje
      }
    }

    // Tres fases por ciclo (este patrón no tiene retenerLleno) × tres ciclos.
    // Con el tiempo **restante** en vez de la duración salían 39: el texto
    // cambiaba cada segundo y el lector de pantalla se cortaba a sí mismo.
    expect(anuncios).toBe(9)
  })

  it('el texto es el mismo en cualquier instante de la fase', () => {
    const textos = [100, 900, 1500, 4900].map((ms) => {
      const { fase } = resolverEstado(PATRON, ms)
      return mensajeAccesible(fase, msDeFase(PATRON, fase), ESTADOS.ACTIVO)
    })
    // Esta es la propiedad entera de RN-RE-VIS-24, y es estructural: la función
    // no recibe ningún valor que cambie dentro de la fase, así que no puede
    // devolver dos cosas distintas por mucho que pasen los milisegundos.
    expect(new Set(textos).size).toBe(1)
  })
})

describe('la pausa se dice una vez y calla las fases (RN-RE-VIS-26)', () => {
  it('en pausa se anuncia el estado, no la fase', () => {
    expect(mensajeAccesible('inhalar', 5000, ESTADOS.PAUSADO)).toBe('En pausa')
    expect(mensajeAccesible('inhalar', 5000, ESTADOS.PAUSADO)).not.toContain('Inhala')
  })

  it('se dice una sola vez por mucho que pase el tiempo', () => {
    let anterior = null
    let anuncios = 0
    for (let i = 0; i < 300; i += 1) {
      const mensaje = mensajeAccesible('inhalar', 5000, ESTADOS.PAUSADO)
      if (cambioDeAnuncio(anterior, mensaje)) {
        anuncios += 1
        anterior = mensaje
      }
    }
    expect(anuncios).toBe(1)
  })

  it('entrar y salir de pausa dentro de la misma fase sí son dos anuncios', () => {
    const activo = mensajeAccesible('inhalar', 5000, ESTADOS.ACTIVO)
    const pausa = mensajeAccesible('inhalar', 5000, ESTADOS.PAUSADO)
    expect(cambioDeAnuncio(activo, pausa)).toBe(true)
    expect(cambioDeAnuncio(pausa, activo)).toBe(true)
  })

  it('el texto de la pausa sale del copy y no está escrito en el código', () => {
    expect(copy.respiracion.estados.pausado).toBe('En pausa')
  })
})

describe('los estados sin ritmo no anuncian nada', () => {
  it.each([ESTADOS.INACTIVO, ESTADOS.ACOMODANDO, ESTADOS.COMPLETADO])(
    '%s se queda en silencio',
    (estadoSesion) => {
      expect(mensajeAccesible('inhalar', 5000, estadoSesion)).toBe('')
    },
  )

  it('la vista previa no le canta una fase a nadie', () => {
    // §9 — En `inactivo` el disco es una vista previa del patrón elegido.
    // Anunciar "Inhala" ahí sería pedir que se respire antes de empezar.
    expect(mensajeAccesible(null, 0, ESTADOS.INACTIVO)).toBe('')
  })

  it('`cerrando` sí anuncia: no debe notarse que es el último ciclo', () => {
    expect(mensajeAccesible('inhalar', 5000, ESTADOS.CERRANDO)).toContain('Inhala')
  })
})
