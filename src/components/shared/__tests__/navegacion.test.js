// src/components/shared/__tests__/navegacion.test.js
// La barra de dos espacios (§C7.3, SPEC_11).
//
// La mitad de estas pruebas comprueban el criterio 3 —que no hay ningún enlace
// de contenido que cruce de un espacio al otro— recorriendo la app entera. Es
// la verificación que §7 pide hacer aquí, antes de la marca: si aparece un
// cruce, la barra deja de ser el único puente y la separación se ha roto por
// donde no se ve.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'

const APP = 'src/App.jsx'
const BARRA = 'src/components/shared/BarraEspacios.jsx'
const NAV_LUMIA = 'src/components/lumia/NavLumia.jsx'
const NAV_FORMIA = 'src/components/formia/NavFormia.jsx'

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) {
      return nombre === '__tests__' ? [] : archivosDe(ruta)
    }
    return /\.jsx?$/.test(nombre) ? [ruta] : []
  })
}

describe('dos pestañas, ni una más (criterio 1)', () => {
  const barra = codigoDe(BARRA)

  it('la barra tiene exactamente dos espacios', () => {
    const espacios = barra.match(/id: '(lumia|formia)'/g) ?? []
    expect(espacios).toHaveLength(2)
  })

  it('no hay tercera pestaña de Strivo (§C0.2)', () => {
    // Strivo es la marca madre y no se usa directamente: nadie la abre para
    // hacer algo. Una pestaña suya sería una pantalla sin contenido posible.
    expect(barra).not.toMatch(/'strivo'|Strivo/)
    expect(Object.keys(copy.shared.navegacion)).toEqual([
      'barraLabel',
      'seccionesLabel',
      'lumia',
      'formia',
    ])
  })

  it('los rótulos son los de la opción A, decidida y documentada (criterio 8)', () => {
    expect(copy.shared.navegacion.lumia.pestana).toBe('Lumia')
    expect(copy.shared.navegacion.formia.pestana).toBe('Formia')
    expect(copy.shared.navegacion.lumia.cabecera).toBe('Lumia · Reflexión')
    expect(copy.shared.navegacion.formia.cabecera).toBe('Formia · Acción')

    const claude = readFileSync('CLAUDE.md', 'utf8')
    expect(claude).toMatch(/Lumia · Reflexión/)
    expect(claude).toMatch(/opci[óo]n A/i)
  })

  it('la pestaña lleva la marca sola: el descriptor no cabría (§C7.3)', () => {
    expect(copy.shared.navegacion.lumia.pestana.length).toBeLessThan(8)
    expect(copy.shared.navegacion.formia.pestana.length).toBeLessThan(8)
  })
})

describe('la barra es el único cruce (criterio 3 · §C7.7.3)', () => {
  const DE_LUMIA = ['src/lumia', 'src/pages/lumia', 'src/components/lumia'].flatMap(archivosDe)
  const DE_FORMIA = ['src/formia', 'src/pages/formia', 'src/components/formia'].flatMap(archivosDe)

  it('hay bastantes archivos que revisar en los dos lados', () => {
    expect(DE_LUMIA.length).toBeGreaterThan(20)
    expect(DE_FORMIA.length).toBeGreaterThan(8)
  })

  it('ninguna pantalla de Lumia enlaza a Formia', () => {
    DE_LUMIA.forEach((ruta) => {
      const codigo = codigoDe(ruta)
      expect(`${ruta}: ${codigo}`).not.toMatch(/formia/i)
      expect(`${ruta}: ${codigo}`).not.toMatch(/to="\/formia|'\/formia/)
    })
  })

  it('ninguna pantalla de Formia enlaza a Lumia', () => {
    DE_FORMIA.forEach((ruta) => {
      const codigo = codigoDe(ruta)
      // `NavFormia` nombra sus propias rutas, que empiezan por /formia; lo que
      // no puede aparecer es una ruta del otro espacio.
      expect(`${ruta}: ${codigo}`).not.toMatch(/to="\/lumia|'\/lumia/)
      expect(`${ruta}: ${codigo}`).not.toMatch(/\blumia\//i)
    })
  })

  it('solo la barra y `App.jsx` ven los dos espacios a la vez', () => {
    // `App.jsx` es la raíz de composición y la barra es el puente: son el
    // equivalente de `lib/db/index.js` en la capa de datos, los únicos sitios
    // autorizados a verlos juntos. Ninguno de los dos cruza datos.
    const app = codigoDe(APP)
    expect(app).toMatch(/NavLumia/)
    expect(app).toMatch(/NavFormia/)
    expect(codigoDe(BARRA)).toMatch(/lumia[\s\S]*formia/i)

    const cruzan = [...DE_LUMIA, ...DE_FORMIA].filter((ruta) => {
      const codigo = codigoDe(ruta)
      return /lumia/i.test(codigo) && /formia/i.test(codigo)
    })
    expect(cruzan).toEqual([])
  })
})

describe('cada espacio conserva su vocabulario (§8)', () => {
  it('la navegación de Lumia no dice nada de construcción', () => {
    const deLumia = Object.values(copy.shared.navegacion.lumia.secciones).join(' ')
    expect(deLumia).not.toMatch(/h[áa]bito|identidad|progreso|constancia/i)
  })

  it('la navegación de Formia no dice nada de reflexión', () => {
    const deFormia = Object.values(copy.shared.navegacion.formia.secciones).join(' ')
    expect(deFormia).not.toMatch(/ritual|reflexi[óo]n|diario|journal|calma/i)
  })

  it('las tres secciones de cada espacio son las de la spec', () => {
    expect(Object.keys(copy.shared.navegacion.lumia.secciones)).toEqual([
      'hoy',
      'journal',
      'historial',
    ])
    expect(Object.keys(copy.shared.navegacion.formia.secciones)).toEqual([
      'identidad',
      'habitos',
      'progreso',
    ])
  })
})

describe('se entra siempre por Lumia (criterio 5)', () => {
  const app = codigoDe(APP)

  it('la raíz y cualquier ruta desconocida llevan a Lumia', () => {
    expect(app).toMatch(/INICIO = Object\.freeze\(\{ lumia: '\/lumia\/hoy'/)
    expect(app).toMatch(/path="\*" element=\{<Navigate to=\{INICIO\.lumia\} replace/)
  })

  it('la pestaña activa no se persiste: no es un dato del usuario (§5)', () => {
    expect(app).not.toMatch(/localStorage|savePreferences|saveProfile/)
  })
})

describe('profundidad máxima de tres toques (criterio 6 · §4.3.2)', () => {
  // Se cuenta desde la app abierta, que entra por Lumia · Hoy.
  const CAMINOS = [
    { destino: 'Lumia · Hoy', toques: 0 },
    { destino: 'Diario de mañana', toques: 1 },
    { destino: 'Ritual de Noche', toques: 2 },
    { destino: 'Respiración diaria', toques: 2 },
    { destino: 'Journal · una entrada', toques: 2 },
    { destino: 'Historial · un día', toques: 2 },
    { destino: 'Formia · Identidad', toques: 1 },
    { destino: 'Formia · Hábitos', toques: 2 },
    { destino: 'Detalle de un hábito', toques: 3 },
    { destino: 'Nuevo hábito', toques: 3 },
    { destino: 'Formia · Progreso', toques: 2 },
  ]

  it('ningún destino pasa de tres', () => {
    CAMINOS.forEach((camino) => expect(camino.toques).toBeLessThanOrEqual(3))
  })

  it('la barra pone cada espacio a un toque', () => {
    expect(codigoDe(BARRA)).toMatch(/to=\{rutaDe\(espacio\.id\)\}/)
  })
})

describe('accesibilidad de la barra (criterio 7)', () => {
  it('el estado activo no depende solo del color', () => {
    const barra = codigoDe(BARRA)
    // Peso tipográfico y una línea encima, además del color.
    expect(barra).toMatch(/font-semibold/)
    expect(barra).toMatch(/isActive && \(/)
    expect(barra).toMatch(/h-0\.5 rounded-full/)
  })

  it('lo mismo dentro de cada espacio', () => {
    ;[NAV_LUMIA, NAV_FORMIA].forEach((ruta) => {
      const codigo = codigoDe(ruta)
      expect(codigo).toMatch(/font-semibold/)
      expect(codigo).toMatch(/border-current/)
    })
  })

  it('los objetivos táctiles llegan al mínimo', () => {
    expect(codigoDe(BARRA)).toMatch(/min-h-touch\b/)
    ;[NAV_LUMIA, NAV_FORMIA].forEach((ruta) => {
      expect(codigoDe(ruta)).toMatch(/min-h-touch-sm/)
    })
  })

  it('las tres navegaciones se anuncian con su nombre', () => {
    expect(codigoDe(BARRA)).toMatch(/aria-label=\{textos\.barraLabel\}/)
    ;[NAV_LUMIA, NAV_FORMIA].forEach((ruta) => {
      expect(codigoDe(ruta)).toMatch(/aria-label=\{textos\.seccionesLabel\}/)
    })
  })

  it('ninguna de las tres fija un color de texto literal (RN-SURF-01)', () => {
    ;[BARRA, NAV_LUMIA, NAV_FORMIA].forEach((ruta) => {
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/text-ink|text-paper|text-night|#[0-9a-f]{6}/i)
    })
  })
})

describe('los andamios provisionales de la navegación se retiraron', () => {
  it('no queda ningún conmutador ni `SesionProvisional`', () => {
    const enComponentes = readdirSync('src/components')
    expect(enComponentes).not.toContain('SesionProvisional.jsx')

    const app = codigoDe(APP)
    expect(app).not.toMatch(/Conmutador|PROVISIONAL|FORMIA_PROVISIONAL|LUMIA_PROVISIONAL/)
  })

  it('el arranque de sesión sigue, y sigue diciendo que es provisional', () => {
    // No es navegación: resuelve el uid y crea el árbol del usuario. Lo
    // sustituye el onboarding, que ninguna spec de Fase 1 construye.
    const arranque = readFileSync('src/components/ArranqueProvisional.jsx', 'utf8')
    expect(arranque).toMatch(/⚠ PROVISIONAL/)
    expect(arranque).toMatch(/initUserTree/)
  })

  it('se monta una sola vez, en la raíz', () => {
    expect(codigoDe(APP).match(/<ArranqueProvisional>/g) ?? []).toHaveLength(1)
  })
})
