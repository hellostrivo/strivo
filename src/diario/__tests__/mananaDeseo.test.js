// src/diario/__tests__/mananaDeseo.test.js
// El buen deseo que despide a la mañana (12 oct 2026).
//
// "Comenzar mi día" devolvía a la consulta sin más. Ahora deja delante una de
// veinte frases —"Que tengas un día sereno."— con "Puedes volver y cambiar lo
// que quieras." debajo, y se va sola como "Buenas noches.". Se vigilan cuatro
// cosas: qué frase toca (la misma en el mismo día, la siguiente en el día
// siguiente, ninguna repetida antes de veinte), que el copy es el pedido y
// suena como debe, que la pantalla dice cada cosa en su momento, y que el
// cierre de la mañana guarda detrás y responde en el acto, como el de la noche.

import { readFileSync } from 'fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { FIELDS } from '@/lib/db/schema'
import { DESEOS, IDS, deseoDelDia, deseoPorId } from '@/diario/mananaDeseo'
import { sumarDias } from '@/diario/fechas'
import AperturaDelDia, { DESPEDIDA_VISIBLE, SALIDA } from '@components/diario/manana/AperturaDelDia'
import * as Noche from '@components/diario/noche/CierreDeLaNoche'

const codigoDe = (ruta) =>
  readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

const APERTURA = codigoDe('src/components/diario/manana/AperturaDelDia.jsx')
const CONTENEDOR = codigoDe('src/components/diario/DiarioManana.jsx')
const CSS = readFileSync('src/styles/globals.css', 'utf8')

const textos = copy.diario.manana.cierre

/**
 * Cierra `cuantas` mañanas seguidas desde `desde`, cada una con la frase que
 * le toque, y devuelve las mañanas tal como quedarían guardadas.
 */
function cerrarSeguidas(cuantas, desde = '2026-10-01', previas = []) {
  const mananas = [...previas]
  for (let i = 0; i < cuantas; i += 1) {
    const fecha = sumarDias(desde, i)
    const deseo = deseoDelDia(mananas, fecha, null)
    mananas.push({ id: fecha, wishId: deseo.id })
  }
  return mananas
}

// ─── El copy ──────────────────────────────────────────────────────────────────

describe('las veinte frases, en su orden', () => {
  it('son exactamente las pedidas y en ese orden', () => {
    expect(DESEOS.map((deseo) => deseo.texto)).toEqual([
      'Que tengas un excelente día.',
      'Que hoy encuentres momentos que te hagan bien.',
      'Que tu intención te acompañe durante el día.',
      'Que este día vaya a tu ritmo.',
      'Que hoy haya espacio para ti.',
      'Que tengas un día amable contigo.',
      'Que puedas avanzar con calma.',
      'Que encuentres algo bueno en lo cotidiano.',
      'Que tu día comience con suavidad.',
      'Que hoy te sientas cerca de ti.',
      'Que tengas un día tranquilo y ligero.',
      'Que puedas cuidar de ti a tu manera.',
      'Que hoy encuentres pausas que te hagan bien.',
      'Que este día tenga momentos de calma.',
      'Que tu intención encuentre su lugar hoy.',
      'Que hoy te acompañe lo que necesitas.',
      'Que tengas un día sereno.',
      'Que puedas habitar este día con presencia.',
      'Que hoy haya calma, incluso en lo pequeño.',
      'Que el día te reciba con amabilidad.',
    ])
  })

  it('cada una tiene un id propio, que es lo que se guarda (RN-DB-06)', () => {
    expect(new Set(IDS).size).toBe(20)
    IDS.forEach((id) => expect(id).toMatch(/^[a-z-]+$/))
  })

  it('debajo, el texto exacto de la puerta abierta', () => {
    expect(textos.reabrir).toBe('Puedes volver y cambiar lo que quieras.')
  })

  it('sin exclamaciones y sin felicitar: es un deseo, no una nota', () => {
    const todo = JSON.stringify(textos)
    expect(todo).not.toMatch(/[¡!]/)
    expect(todo).not.toMatch(/felicit|lograste|racha|seguidos/i)
  })

  it('las preguntas y el botón de la mañana no cambian (RN-VOZ-03)', () => {
    expect(textos.cta).toBe('Comenzar mi día')
    expect(copy.diario.manana.animo.titulo).toBe('¿Cómo me siento esta mañana?')
  })
})

// ─── La rotación ──────────────────────────────────────────────────────────────

describe('qué frase toca', () => {
  it('la primera mañana cerrada empieza por la primera', () => {
    expect(deseoDelDia([], '2026-10-12', null).id).toBe('excelente')
    // Las mañanas de antes de que existiera la frase no cuentan.
    expect(deseoDelDia([{ id: '2026-10-11', completedAt: 'x' }], '2026-10-12').id).toBe('excelente')
  })

  it('el mismo día devuelve la misma, aunque se reabra y se vuelva a cerrar', () => {
    const recientes = cerrarSeguidas(3)
    const hoy = '2026-10-12'
    const primera = deseoDelDia(recientes, hoy, null)
    // Ya guardada, manda la que trae la mañana, pase lo que pase alrededor.
    const guardada = { id: hoy, wishId: primera.id }
    expect(deseoDelDia([...recientes, guardada], hoy, guardada)).toBe(primera)
    expect(deseoDelDia(cerrarSeguidas(9), hoy, guardada)).toBe(primera)
  })

  it('cada mañana cerrada en un día nuevo lleva la siguiente', () => {
    const mananas = cerrarSeguidas(5)
    expect(mananas.map((m) => m.wishId)).toEqual(IDS.slice(0, 5))
  })

  it('avanza por mañana cerrada, no por calendario: los días sin abrir no saltan frases', () => {
    const mananas = [
      { id: '2026-10-01', wishId: IDS[0] },
      { id: '2026-10-02', wishId: IDS[1] },
    ]
    expect(deseoDelDia(mananas, '2026-10-30', null).id).toBe(IDS[2])
  })

  it('ninguna se repite hasta haber pasado las veinte, y después vuelve a empezar', () => {
    const mananas = cerrarSeguidas(45)
    const ids = mananas.map((m) => m.wishId)
    expect(new Set(ids.slice(0, 20)).size).toBe(20)
    expect(ids.slice(0, 20)).toEqual([...IDS])
    expect(ids.slice(20, 40)).toEqual([...IDS])
    // Ninguna ventana de veinte seguidas repite nada.
    for (let i = 0; i + 20 <= ids.length; i += 1) {
      expect(new Set(ids.slice(i, i + 20)).size).toBe(20)
    }
  })

  it('cerrar tarde un día anterior no le da la frase del día siguiente', () => {
    // Con la ventana de 72 horas se puede cerrar el martes después del
    // miércoles. El martes no puede recibir la frase que ya salió el miércoles.
    const mananas = [
      { id: '2026-10-05', wishId: IDS[3] },
      { id: '2026-10-07', wishId: IDS[4] },
    ]
    const martes = deseoDelDia(mananas, '2026-10-06', null)
    expect([IDS[3], IDS[4]]).not.toContain(martes.id)
    expect(martes.id).toBe(IDS[5])
  })

  it('un id que ya no existe no rompe nada: se trata como si no hubiera', () => {
    expect(deseoPorId('no-existe')).toBeNull()
    expect(deseoDelDia([], '2026-10-12', { wishId: 'no-existe' }).id).toBe(IDS[0])
  })

  it('no lee nada de lo escrito: solo qué frase salió antes (RN-06)', () => {
    const codigo = codigoDe('src/diario/mananaDeseo.js')
    expect(codigo).not.toMatch(/feelings|intentions|gratitude|action|reflection\b/)
  })
})

// ─── El modelo ────────────────────────────────────────────────────────────────

describe('se guarda en la propia mañana', () => {
  it('wishId está en el modelo y nada más entró', () => {
    expect(FIELDS.morningEntry).toContain('wishId')
    expect(FIELDS.nightRitual).not.toContain('wishId')
  })

  it('el cierre lo escribe junto con la marca, con la frase que se pinta', () => {
    expect(CONTENEDOR).toMatch(
      /const deseo = deseoDelDia\(estado\.recientes, estado\.fecha, morning\)/,
    )
    expect(CONTENEDOR).toMatch(/wishId: deseo\.id,\s*completedAt: marcaLocal\(\)/)
    expect(CONTENEDOR).toMatch(/deseo=\{deseo\}/)
  })
})

// ─── La pantalla ──────────────────────────────────────────────────────────────

describe('la pantalla del cierre', () => {
  const pintar = (props) =>
    renderToStaticMarkup(
      createElement(AperturaDelDia, {
        lineas: ['Tu intención para hoy: En calma'],
        deseo: DESEOS[16],
        onTerminar: () => {},
        ...props,
      }),
    )

  it('primero, la intención y "Comenzar mi día"; el buen deseo todavía no', () => {
    const html = pintar()
    expect(html).toContain('Tu intención para hoy: En calma')
    expect(html).toContain('Comenzar mi día')
    expect(html).not.toContain('Que tengas un día sereno.')
    expect(html).not.toContain(textos.reabrir)
  })

  it('con la mañana en blanco cierra igual, sin señalar el vacío', () => {
    const html = pintar({ lineas: [] })
    expect(html).toContain(textos.vacio)
    expect(html).toContain('Comenzar mi día')
  })

  it('lleva la luz y la superficie de la mañana', () => {
    const html = pintar()
    expect(html).toMatch(/data-surface="light"/)
    expect(html).toMatch(/data-momento="manana"/)
    expect(html).toMatch(/bg-strivo-base/)
  })

  it('el buen deseo va delante y en grande; la puerta abierta, debajo y discreta', () => {
    const [, deseo] = APERTURA.match(
      /<p\s+className=\{clsx\(\s*'([^']+)'[\s\S]*?\{deseo\?\.texto\}/,
    )
    expect(deseo).toMatch(/font-display text-xl text-on-surface/)
    expect(APERTURA).toMatch(/'text-sm text-on-surface-soft',[\s\S]*?\{textos\.reabrir\}/)
    expect(APERTURA.indexOf('deseo?.texto')).toBeLessThan(APERTURA.indexOf('textos.reabrir'))
  })

  it('solo se despide con la mañana guardada; si falla, lo dice y ofrece reintentar', () => {
    expect(APERTURA).toMatch(/despidiendo && guardado === 'listo' && \(/)
    expect(APERTURA).toMatch(/despidiendo && guardado === 'fallo' && \(/)
    expect(APERTURA).toMatch(/onClick=\{onReintentar\}/)
    expect(APERTURA).not.toMatch(/Spinner|animate-spin/)
  })

  it('nada bloquea: ningún control apagado ni obligatorio', () => {
    expect(APERTURA).not.toMatch(/disabled|required|aria-invalid/)
  })

  it('no hay confeti, sonido, recuento ni celebración', () => {
    expect(APERTURA).not.toMatch(/confet|audio|sonido|vibrate|%|puntaje|felicit/i)
  })

  it('la mañana no nombra la noche', () => {
    expect(APERTURA).not.toMatch(/noche|night|CierreDeLaNoche/i)
  })
})

// ─── El tiempo ────────────────────────────────────────────────────────────────

describe('se va sola, como "Buenas noches."', () => {
  const regla = CSS.match(/\.salida-cierre \{[\s\S]*?\n {2}\}/)[0]

  it('cinco segundos a la vista y 700 ms de desvanecido, las mismas cifras que la noche', () => {
    expect(DESPEDIDA_VISIBLE).toBe(5000)
    expect(SALIDA).toBe(700)
    expect(DESPEDIDA_VISIBLE).toBe(Noche.DESPEDIDA_VISIBLE)
    expect(SALIDA).toBe(Noche.SALIDA)
  })

  it('el desvanecido es el de la hoja, y dura lo mismo', () => {
    const [, enLaHoja] = regla.match(/salida-cierre (\d+)ms/)
    expect(Number(enLaHoja)).toBe(SALIDA)
    expect(APERTURA).toMatch(/saliendo && 'salida-cierre'/)
  })

  it('el reloj arranca con la despedida, respeta el movimiento reducido y se limpia', () => {
    expect(APERTURA).toMatch(/if \(!despidiendo \|\| guardado !== 'listo'\) return undefined/)
    expect(APERTURA).toMatch(/prefiereMenosMovimiento\(\)/)
    expect(APERTURA).toMatch(/setTimeout\(irse, DESPEDIDA_VISIBLE\)/)
    expect(APERTURA).toMatch(/setTimeout\(terminar, SALIDA\)/)
    expect(APERTURA).toMatch(/return \(\) => clearTimeout\(reloj\)/)
    expect(APERTURA).toMatch(/motion-reduce:animate-none/)
  })

  it('tocarla salta la espera y no el desvanecido, y terminar es una sola vez', () => {
    expect(APERTURA).toMatch(/onClick=\{irse\}/)
    expect(APERTURA).toMatch(/if \(yendose\.current\) return/)
    expect(APERTURA).toMatch(/if \(terminado\.current\) return/)
  })

  it('al irse vuelve a la consulta, que es donde llevaba "Comenzar mi día"', () => {
    expect(CONTENEDOR).toMatch(
      /onVolver=\{\(\) => \{\s*cerrando\.current = false\s*alInicio\.current = true\s*setVista\('resumen'\)/,
    )
    expect(CONTENEDOR).toMatch(/onTerminar=\{\(\) => setConCierre\(false\)\}/)
    // Y desde la consulta se reabre el recorrido con todo lo escrito.
    expect(CONTENEDOR).toMatch(/onEditar=\{\(\) => \{\s*setPaso\(0\)\s*setVista\('recorrido'\)/)
  })
})

// ─── Terminar ─────────────────────────────────────────────────────────────────

describe('terminar responde en el acto y guarda detrás', () => {
  it('el cierre se pone delante antes de escribir, y un segundo toque no cierra dos veces', () => {
    const terminar = CONTENEDOR.match(/const terminar = \(\) => \{[\s\S]*?\n {2}\}/)[0]
    expect(terminar).toMatch(/if \(cerrando\.current\) return/)
    expect(terminar.indexOf("setVista('cierre')")).toBeLessThan(terminar.indexOf('persistir()'))
    expect(terminar).not.toMatch(/await/)
  })

  it('el resultado de la escritura es lo que decide si hay despedida', () => {
    expect(CONTENEDOR).toMatch(/setGuardado\(resultado \? 'listo' : 'fallo'\)/)
    expect(CONTENEDOR).toMatch(/onReintentar=\{persistir\}/)
  })
})
