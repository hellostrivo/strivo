// tests/contraste.test.js
// La regla de contraste por superficie (§6.5, bloque 01).
//
// Los cuatro tokens de tinta no se eligen a ojo: cada uno tiene que aguantar
// 4.5:1 contra la PEOR superficie de su familia, no contra la más cómoda. Aquí
// se comprueba esa cota, así que añadir un ancla nueva al degradado —o aclarar
// una superficie— rompe la prueba en vez de romper la lectura de alguien.

import { describe, it, expect } from 'vitest'
import { contraste, fondoHorario } from '@lib/gradienteHorario'
import { colors, textColors, gradientesInicio, momento, temasHoy } from '@tokens'

// WCAG 2.2 AA
const TEXTO_NORMAL = 4.5
const TEXTO_GRANDE = 3

// Las superficies claras reales de la app: las que declaran data-surface="light".
// Los valores salen de tailwind.config.js (colors.surface / colors.paper).
const SUPERFICIES_CLARAS = {
  paper:          colors.paper,
  surface:        '#FFFEF7',
  surfaceSubtle:  '#F5F0E8',
  surfaceMuted:   '#EDE7DC',
}

// Las oscuras: night y las anclas del degradado sobre las que la tinta clara
// gana. Se derivan del propio token para que no haya dos listas que mantener.
const anclasOscuras = () => {
  const tonos = {}
  for (const ancla of gradientesInicio) {
    for (const extremo of ['from', 'to']) {
      const color = ancla[extremo]
      if (contraste(colors.paper, color) > contraste(colors.ink, color)) {
        tonos[`${ancla.id}_${extremo}`] = color
      }
    }
  }
  return tonos
}

const SUPERFICIES_OSCURAS = { night: colors.night, ...anclasOscuras() }

const peorCaso = (tinta, superficies) =>
  Object.entries(superficies).reduce(
    (peor, [nombre, fondo]) => {
      const ratio = contraste(tinta, fondo)
      return ratio < peor.ratio ? { nombre, ratio } : peor
    },
    { nombre: null, ratio: Infinity }
  )

describe('Tinta sobre superficies claras', () => {
  it('la principal cumple 4.5:1 sobre la más oscura de las claras', () => {
    const { ratio, nombre } = peorCaso(textColors.onLight, SUPERFICIES_CLARAS)
    expect(ratio, `peor superficie: ${nombre}`).toBeGreaterThanOrEqual(TEXTO_NORMAL)
  })

  it('la secundaria también, que es la que suele quedarse corta', () => {
    const { ratio, nombre } = peorCaso(textColors.onLightMuted, SUPERFICIES_CLARAS)
    expect(ratio, `peor superficie: ${nombre}`).toBeGreaterThanOrEqual(TEXTO_NORMAL)
  })
})

describe('Tinta sobre superficies oscuras', () => {
  it('la principal cumple 4.5:1 sobre la más clara de las oscuras', () => {
    const { ratio, nombre } = peorCaso(textColors.onDark, SUPERFICIES_OSCURAS)
    expect(ratio, `peor superficie: ${nombre}`).toBeGreaterThanOrEqual(TEXTO_NORMAL)
  })

  it('la secundaria también', () => {
    const { ratio, nombre } = peorCaso(textColors.onDarkMuted, SUPERFICIES_OSCURAS)
    expect(ratio, `peor superficie: ${nombre}`).toBeGreaterThanOrEqual(TEXTO_NORMAL)
  })

  it('cada elemento de interfaz llega al menos a 3:1', () => {
    for (const [nombre, fondo] of Object.entries(SUPERFICIES_OSCURAS)) {
      expect(contraste(textColors.onDarkMuted, fondo), nombre)
        .toBeGreaterThanOrEqual(TEXTO_GRANDE)
    }
  })
})

describe('Por qué existe la regla', () => {
  // El bug que motivó el bloque: la tinta oscura sobre el fondo de la noche.
  it('la tinta clara es ilegible sobre el degradado nocturno', () => {
    for (const [nombre, fondo] of Object.entries(SUPERFICIES_OSCURAS)) {
      expect(contraste(colors.ink, fondo), nombre).toBeLessThan(TEXTO_NORMAL)
    }
  })

  it('y la clara lo resuelve en todas ellas', () => {
    for (const [nombre, fondo] of Object.entries(SUPERFICIES_OSCURAS)) {
      expect(contraste(textColors.onDark, fondo), nombre)
        .toBeGreaterThanOrEqual(TEXTO_NORMAL)
    }
  })

  it('ninguna superficie oscura se quedó sin cubrir', () => {
    // Si alguien añade un ancla oscura nueva al degradado, aparece aquí sola.
    expect(Object.keys(SUPERFICIES_OSCURAS).length).toBeGreaterThan(1)
  })
})

describe('Qué superficie declara la app a cada hora', () => {
  // Es la decisión que toma App.jsx para poner data-surface en <main>.
  const familia = hora =>
    fondoHorario(new Date(2026, 7, 7, hora, 0)).sobreOscuro ? 'dark' : 'light'

  it('de madrugada y de noche pide tinta clara', () => {
    for (const hora of [0, 1, 3, 4, 22, 23]) {
      expect(familia(hora), `a las ${hora}:00`).toBe('dark')
    }
  })

  it('de día pide tinta oscura', () => {
    for (const hora of [8, 10, 12, 14, 17]) {
      expect(familia(hora), `a las ${hora}:00`).toBe('light')
    }
  })

  it('la tinta que sale del fondo es siempre uno de los dos tokens', () => {
    for (let hora = 0; hora < 24; hora += 1) {
      const fondo = fondoHorario(new Date(2026, 7, 7, hora, 0))
      expect([textColors.onLight, textColors.onDark]).toContain(fondo.texto)
    }
  })

  // ─── El cruce del alba y el del ocaso ──────────────────────────────────────
  // Al pasar de tinta oscura a clara el degradado atraviesa un tono medio en el
  // que ninguna de las dos llega a 4.5:1. Hoy son dos ventanas de 10 y 20 min
  // (05:10–05:20 y 19:55–20:15, mínimo 3.59:1). Es comportamiento heredado, no
  // del bloque 01, y está reportado como decisión de producto abierta.
  //
  // Se prueba lo que de verdad se sostiene —nunca se baja de 3:1— y se acota la
  // ventana, para que mover un ancla del degradado no la ensanche en silencio.
  const minutosDelDia = () => {
    const muestras = []
    for (let minuto = 0; minuto < 24 * 60; minuto += 5) {
      muestras.push({
        minuto,
        fondo: fondoHorario(new Date(2026, 7, 7, Math.floor(minuto / 60), minuto % 60)),
      })
    }
    return muestras
  }

  it('nunca baja de 3:1, ni en el cruce', () => {
    for (const { minuto, fondo } of minutosDelDia()) {
      expect(fondo.contraste, `en el minuto ${minuto}`).toBeGreaterThanOrEqual(TEXTO_GRANDE)
    }
  })

  it('la ventana por debajo de 4.5:1 no pasa de media hora al día', () => {
    const flojos = minutosDelDia().filter(({ fondo }) => fondo.contraste < TEXTO_NORMAL)
    expect(flojos.length * 5).toBeLessThanOrEqual(30)
  })

  it('fuera del cruce, el día entero cumple 4.5:1', () => {
    // Todo salvo las dos ventanas del amanecer y del anochecer
    const enElCruce = minuto =>
      (minuto >= 5 * 60 && minuto <= 5 * 60 + 30) ||
      (minuto >= 19 * 60 + 45 && minuto <= 20 * 60 + 20)

    for (const { minuto, fondo } of minutosDelDia()) {
      if (enElCruce(minuto)) continue
      expect(fondo.contraste, `en el minuto ${minuto}`).toBeGreaterThanOrEqual(TEXTO_NORMAL)
    }
  })
})

describe('Las tarjetas de las preguntas de ánimo', () => {
  // El subtítulo se pinta con ink al 80 %, así que lo que hay que medir no es la
  // tinta sino la mezcla que de verdad acaba en pantalla.
  const subtitulo = fondo => {
    const aRGB = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
    const mezcla = aRGB(colors.ink).map((c, i) => c * 0.8 + aRGB(fondo)[i] * 0.2)
    return '#' + mezcla.map(v => Math.round(v).toString(16).padStart(2, '0'))
      .join('').toUpperCase()
  }

  for (const [nombre, tono] of Object.entries(momento)) {
    it(`${nombre}: la pregunta cumple 4.5:1 sobre su tarjeta`, () => {
      expect(contraste(colors.ink, tono), `${nombre} (${tono})`)
        .toBeGreaterThanOrEqual(TEXTO_NORMAL)
    })

    it(`${nombre}: el subtítulo también`, () => {
      expect(contraste(subtitulo(tono), tono), `${nombre} (${tono})`)
        .toBeGreaterThanOrEqual(TEXTO_NORMAL)
    })
  }

  it('los dos momentos se distinguen entre sí', () => {
    expect(momento.manana).not.toBe(momento.noche)
  })
})

describe('Los dos temas de la pantalla Hoy', () => {
  // El degradado se recorre entero: el punto más difícil no tiene por qué estar
  // en un extremo.
  const recorrido = ({ bgFrom, bgTo }) => {
    const aRGB = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
    const [r1, g1, b1] = aRGB(bgFrom)
    const [r2, g2, b2] = aRGB(bgTo)
    return Array.from({ length: 21 }, (_, i) => {
      const t = i / 20
      return '#' + [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]
        .map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
    })
  }

  const tinta = tema => (tema.oscuro ? textColors.onDark : textColors.onLight)
  const tintaSecundaria = tema =>
    (tema.oscuro ? textColors.onDarkMuted : textColors.onLightMuted)

  for (const [nombre, tema] of Object.entries(temasHoy)) {
    it(`${nombre}: la tinta cumple 4.5:1 en todo el fondo`, () => {
      for (const punto of recorrido(tema)) {
        expect(contraste(tinta(tema), punto), `${nombre} en ${punto}`)
          .toBeGreaterThanOrEqual(TEXTO_NORMAL)
      }
    })

    it(`${nombre}: la tinta secundaria también`, () => {
      for (const punto of recorrido(tema)) {
        expect(contraste(tintaSecundaria(tema), punto), `${nombre} en ${punto}`)
          .toBeGreaterThanOrEqual(TEXTO_NORMAL)
      }
    })

    it(`${nombre}: se lee sobre la superficie de sus tarjetas`, () => {
      // La tarjeta de la mañana es clara y la de la noche también se aclara
      // respecto a su fondo, así que en las dos se escribe con la tinta que
      // corresponda a la propia tarjeta.
      const sobreLaTarjeta = Math.max(
        contraste(textColors.onLight, tema.surface),
        contraste(textColors.onDark, tema.surface)
      )
      expect(sobreLaTarjeta, `${nombre} (${tema.surface})`)
        .toBeGreaterThanOrEqual(TEXTO_NORMAL)
    })
  }

  // El bug: la tarjeta del ritual tenía el mismo tono que el fondo y se perdía.
  it('la tarjeta se despega del fondo en los dos temas', () => {
    for (const [nombre, tema] of Object.entries(temasHoy)) {
      const contra = Math.max(
        contraste(tema.surface, tema.bgFrom),
        contraste(tema.surface, tema.bgTo)
      )
      // No se pide 3:1 —entre dos claros es imposible sin virar a gris— pero sí
      // un paso real, y el borde propio hace el resto (§20 D.2/D.3).
      expect(contra, `${nombre}: superficie contra su fondo`).toBeGreaterThan(1.2)
      expect(tema.border, `${nombre}: le falta el borde`).toBeTruthy()
    }
  })

  it('la noche es oscura y la mañana clara, no al revés', () => {
    expect(temasHoy.noche.oscuro).toBe(true)
    expect(temasHoy.manana.oscuro).toBe(false)
    expect(contraste(colors.paper, temasHoy.noche.bgFrom))
      .toBeGreaterThan(contraste(colors.ink, temasHoy.noche.bgFrom))
    expect(contraste(colors.ink, temasHoy.manana.bgFrom))
      .toBeGreaterThan(contraste(colors.paper, temasHoy.manana.bgFrom))
  })
})

describe('Los tokens no son negro ni blanco puros', () => {
  it('la tinta clara es papel, no #FFF', () => {
    expect(textColors.onDark).toBe(colors.paper)
    expect(textColors.onDark.toUpperCase()).not.toBe('#FFFFFF')
  })

  it('la tinta oscura es ink, no #000', () => {
    expect(textColors.onLight).toBe(colors.ink)
    expect(textColors.onLight.toUpperCase()).not.toBe('#000000')
  })
})
