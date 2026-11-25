// SPEC_25 — El muro, los avisos y el bloque, pintados a HTML (criterios 5, 9, 10).

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it, vi } from 'vitest'
import { copy } from '@copy'
import { ContextoSuscripcion, SIN_SUSCRIPCION } from '@lib/suscripcion/useSuscripcion'
import { MuroVista } from '../Muro.jsx'
import AvisoDeLectura from '../AvisoDeLectura.jsx'
import EntradaDelJournal from '@components/diario/EntradaDelJournal'
import TuSuscripcion, {
  controlesDe,
  fechaLarga,
  fraseDeEstado,
} from '@components/perfil/TuSuscripcion'

const t = copy.suscripcion.paywall
const tarjetas = [
  {
    id: 'anual',
    titulo: 'Anual',
    detalle: 'X al año',
    enVoz: 'Anual. x pesos al año',
    texto: null,
  },
  {
    id: 'mensual',
    titulo: 'Mensual',
    detalle: 'Y al mes',
    enVoz: 'Mensual. y pesos al mes',
    texto: null,
  },
]
const pintar = (props) =>
  renderToStaticMarkup(
    createElement(MuroVista, {
      estado: 'prueba',
      carga: 'listos',
      tarjetas,
      elegida: 'anual',
      ...props,
    }),
  )

describe('el muro', () => {
  it('lo que Apple pide: precio, periodo, renovación, Términos', () => {
    const html = pintar({ urlPrivacidad: 'https://x/privacidad' })
    for (const texto of [
      t.titulo,
      t.texto,
      'X al año',
      'Y al mes',
      t.renovacion,
      t.boton,
      t.restaurar,
      t.terminos,
      t.privacidad,
    ]) {
      expect(html).toContain(texto)
    }
    expect(html).toContain('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')
  })

  it('sin URL de privacidad no hay enlace (D17)', () => {
    expect(pintar({ urlPrivacidad: '' })).not.toContain(t.privacidad)
  })

  it('«Cerrar» en la prueba y «Ahora no» en lectura', () => {
    expect(pintar({ estado: 'prueba' })).toContain(`>${t.cerrar}<`)
    expect(pintar({ estado: 'prueba' })).not.toContain(t.ahoraNo)
    expect(pintar({ estado: 'lectura' })).toContain(`>${t.ahoraNo}<`)
    expect(pintar({ estado: 'lectura' })).not.toContain(`>${t.cerrar}<`)
  })

  it('el elegido se dice con aria-pressed y el precio en voz con moneda', () => {
    const html = pintar()
    expect(html).toMatch(/aria-pressed="true" aria-label="Anual\. x pesos al año"/)
    expect(html).toMatch(/aria-pressed="false" aria-label="Mensual/)
  })

  it('sin planes: el aviso, reintentar y restaurar, sin tarjetas ni «Continuar»', () => {
    const html = pintar({ carga: 'sinPlanes', tarjetas: [] })
    expect(html).toContain(t.sinPlanes)
    expect(html).toContain(t.reintentar)
    expect(html).toContain(t.restaurar)
    expect(html).not.toContain(`>${t.boton}<`)
    expect(html).not.toContain('aria-pressed')
  })

  it('la nota se anuncia y ningún control se apaga', () => {
    const html = pintar({ nota: t.errorCompra })
    expect(html).toContain(t.errorCompra)
    expect(html).toContain('aria-live="polite"')
    expect(html).not.toMatch(/disabled=|required|aria-invalid/)
  })

  it('comprar y restaurar pasan de uno en uno, y cancelar no pone nota', () => {
    const fuente = readFileSync('src/components/suscripcion/Muro.jsx', 'utf8')
    expect(fuente).toMatch(/const continuar = \(\) =>\s+unaVez/)
    expect(fuente).toMatch(/const alRestaurar = \(\) =>\s+unaVez/)
    const cancelada = fuente.match(/if \(r\.motivo === 'cancelada'\)[^\n]*/)[0]
    expect(cancelada).not.toContain('setNota')
  })
})

describe('el modo lectura en pantalla', () => {
  it('el aviso dice que se puede leer y ofrece las opciones', () => {
    const html = renderToStaticMarkup(createElement(AvisoDeLectura))
    expect(html).toContain(copy.suscripcion.lectura.aviso)
    expect(html).toContain(copy.suscripcion.lectura.verOpciones)
  })

  it('D6: una entrada del journal se lee entera, sin campos, y se puede eliminar', () => {
    const texto = `${'palabra '.repeat(300)}fin`
    const html = renderToStaticMarkup(
      createElement(EntradaDelJournal, {
        entrada: {
          id: 'e1',
          date: '2026-11-20',
          text: texto,
          emotions: ['feliz'],
          otherText: null,
        },
        genero: 'f',
      }),
    )
    expect(html).toContain('fin</p>')
    expect(html).toContain('Feliz')
    expect(html).toContain(copy.diario.journal.editor.borrar)
    expect(html).not.toMatch(/<textarea|<input/)
  })

  it('Hoy dice la lectura en lugar de que el día se cerró', () => {
    const hoy = readFileSync('src/pages/diario/Hoy.jsx', 'utf8')
    expect(hoy).toContain('{!puedeEscribir && <AvisoDeLectura onOpciones={abrirMuro} aLaVista />}')
    expect(hoy).toMatch(/puedeEscribir && !estado\.editable &&/)
  })

  it('el Journal: una nueva abre el muro; una escrita se lee', () => {
    const journal = readFileSync('src/pages/diario/Journal.jsx', 'utf8')
    expect(journal).toContain('if (!entrada && !puedeEscribir) return abrirMuro()')
    expect(journal).toContain('if (borrador && !puedeEscribir) {')
  })

  it('el día y el journal preguntan a puedeEscribir al empezar algo, no al volcar', () => {
    const dia = readFileSync('src/diario/useDiario.js', 'utf8')
    expect(dia).toContain('() => puedeEscribir && sePuedeEscribir(')
    const volcarDia = dia.slice(dia.indexOf('const volcar ='), dia.indexOf('const programar ='))
    expect(volcarDia).not.toMatch(/abierto|puedeEscribir/)
    const j = readFileSync('src/diario/useJournal.js', 'utf8')
    expect(j).toContain('if (!puedeEscribir) return')
    const volcarJ = j.slice(j.indexOf('const volcar ='), j.indexOf('const programar ='))
    expect(volcarJ).not.toContain('puedeEscribir')
    const borrar = j.slice(j.indexOf('borrar: async'))
    expect(borrar).not.toContain('puedeEscribir')
  })

  it('nadie más lo pregunta: ni Respiración, ni la capa de datos, ni el resto de Tu perfil', () => {
    const quienes = []
    const mirar = (dir) =>
      readdirSync(dir).forEach((n) => {
        const ruta = join(dir, n)
        if (statSync(ruta).isDirectory()) return n === '__tests__' ? null : mirar(ruta)
        if (/\.jsx?$/.test(n) && readFileSync(ruta, 'utf8').includes('puedeEscribir'))
          quienes.push(ruta)
        return null
      })
    mirar('src')
    expect(quienes.sort()).toEqual([
      'src/components/suscripcion/ProveedorDeSuscripcion.jsx',
      'src/diario/useDiario.js',
      'src/diario/useJournal.js',
      'src/lib/suscripcion/estado.js',
      'src/lib/suscripcion/useSuscripcion.js',
      'src/pages/diario/Hoy.jsx',
      'src/pages/diario/Journal.jsx',
    ])
  })

  it('sin proveedor se escribe, como en la web', () => {
    expect(SIN_SUSCRIPCION).toMatchObject({ estado: 'web', puedeEscribir: true })
  })
})

describe('el bloque «Suscripción»', () => {
  const hasta = new Date(2026, 11, 6)
  it.each([
    [{ estado: 'prueba', hasta }, 'En prueba, hasta el 6 de diciembre de 2026'],
    [
      { estado: 'activa', plan: 'mensual', hasta, seRenueva: true },
      'Mensual. Se renueva el 6 de diciembre de 2026.',
    ],
    [
      { estado: 'activa', plan: 'anual', hasta, seRenueva: true },
      'Anual. Se renueva el 6 de diciembre de 2026.',
    ],
    [
      { estado: 'activa', plan: 'mensual', hasta, seRenueva: false },
      'Mensual. Termina el 6 de diciembre de 2026.',
    ],
    [
      { estado: 'activa', plan: 'anual', hasta, seRenueva: false },
      'Anual. Termina el 6 de diciembre de 2026.',
    ],
    [{ estado: 'fundador' }, 'Miembro fundador. Para siempre.'],
    [{ estado: 'lectura' }, 'Sin suscripción'],
    [{ estado: 'cargando' }, null],
    [{ estado: 'activa', plan: null, hasta }, null],
  ])('%o', (datos, frase) => {
    expect(fraseDeEstado(datos)).toBe(frase)
  })

  it.each([
    ['prueba', { gestionar: false, opciones: true }],
    ['lectura', { gestionar: false, opciones: true }],
    ['activa', { gestionar: true, opciones: false }],
    ['fundador', { gestionar: false, opciones: false }],
    ['cargando', { gestionar: false, opciones: false }],
  ])('los controles en %s; «Restaurar compras», siempre', (estado, esperado) => {
    expect(controlesDe(estado)).toEqual(esperado)
    const html = renderToStaticMarkup(
      createElement(
        ContextoSuscripcion.Provider,
        { value: { ...SIN_SUSCRIPCION, estado } },
        createElement(TuSuscripcion),
      ),
    )
    expect(html).toContain(t.restaurar)
    expect(html.includes('account/subscriptions')).toBe(esperado.gestionar)
    expect(html).not.toMatch(/disabled=/)
  })

  it('la fecha es local', () => {
    expect(fechaLarga(new Date(2027, 0, 15, 23, 59))).toBe('15 de enero de 2027')
  })
})

describe('ningún precio a mano y nada que presione (criterios 9 y 10)', () => {
  const archivos = []
  const mirar = (dir) =>
    readdirSync(dir).forEach((n) => {
      const ruta = join(dir, n)
      if (statSync(ruta).isDirectory()) return n === '__tests__' ? null : mirar(ruta)
      return archivos.push(ruta)
    })
  ;['src/copy', 'src/lib/suscripcion', 'src/components/suscripcion'].forEach(mirar)
  archivos.push('src/lib/compras.js', 'src/components/perfil/TuSuscripcion.jsx')

  it.each(archivos)('%s', (ruta) => {
    const fuente = readFileSync(ruta, 'utf8')
    expect(fuente).not.toMatch(/\$\s?\d|\bMXN\b|€|\b(89|799|1499|1,499)\b/)
  })

  it('la lista prohibida de SPEC_25 §4 no aparece', () => {
    expect(JSON.stringify(copy.suscripcion)).not.toMatch(
      /oferta|descuento|ahorra|solo hoy|%|más popular|mejor valor|[!¡]/i,
    )
  })

  it('los textos huérfanos con precios se retiraron (D14)', () => {
    expect(copy.paywall).toBeUndefined()
    expect(copy.profile).toBeUndefined()
  })

  it('«Restaurar compras» se llama igual que en la pantalla de borrado', () => {
    expect(copy.cuenta.borrar.compras).toContain(`“${t.restaurar}”`)
  })
})

vi.mock('@lib/plataforma', () => ({ esIPhone: () => false, esNativa: () => false }))
