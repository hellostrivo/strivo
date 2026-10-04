// src/diario/__tests__/fraseDelDia.test.js
// La frase del día personalizada (SPEC_28 §14): selección, garantías de no
// repetición, audiencias, ánimo bajo, persistencia y presentación.

import { beforeEach, describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { diario as db, initUserTree, shared } from '@/lib/db'
import { UID, resetLocalDB } from '../../lib/db/__tests__/helpers.js'
import { APROBADAS, FRASES_V2, TEMAS, fraseV2PorId } from '@/content/frases-v2'
import { cita, originales } from '@/content/frases-v2/construir'
import { AFINIDADES, huellaDe, perfilDeFrases, perfilesPosibles } from '@/referencias/preferencias'
import { guardarPreferencias, restablecerPreferencias } from '@/referencias/almacen'
import FraseDelDia from '@components/diario/FraseDelDia'
import {
  TEMA_DE_RESPALDO,
  elegirFrase,
  fraseDeRespaldo,
  resolverAsignacion,
  temaDelDia,
} from '../fraseDelDia.js'
import { cargarDia, fraseAsignada } from '../diario.js'
import { sumarDias } from '../fechas.js'

const INICIO = '2026-10-04'

/** Las preferencias que producen cada perfil posible. */
function preferenciasDe(perfil) {
  if (perfil.afinidades.length > 0) return { modo: 'guiadas', afinidades: perfil.afinidades }
  if (perfil.clave === 'espiritual_general') return { modo: 'espirituales_generales' }
  return { modo: 'sin_definir' }
}

const TODAS = [
  ...perfilesPosibles().map(preferenciasDe),
  { modo: 'seculares' },
  { modo: 'guiadas', afinidades: [] },
  null,
]

function serie(preferencias, dias, { desde = INICIO, ...opciones } = {}) {
  return Array.from({ length: dias }, (_, i) =>
    elegirFrase(sumarDias(desde, i), preferencias, opciones),
  )
}

describe('frase del día · selección', () => {
  it('misma fecha, mismas preferencias y mismo catálogo dan la misma frase', () => {
    for (const preferencias of TODAS) {
      expect(elegirFrase(INICIO, preferencias)).toBe(elegirFrase(INICIO, preferencias))
    }
  })

  it('las afinidades se leen sin orden: elegir B y luego A es lo mismo que A y luego B', () => {
    const ab = { modo: 'guiadas', afinidades: ['budismo', 'estoicismo'] }
    const ba = { modo: 'guiadas', afinidades: ['estoicismo', 'budismo', 'budismo'] }
    expect(huellaDe(ab)).toBe(huellaDe(ba))
    expect(serie(ab, 40)).toEqual(serie(ba, 40))
  })

  it('ningún perfil repite una frase en sus primeros 500 días normales', () => {
    for (const desde of [INICIO, '2027-02-17', '2031-07-01']) {
      for (const preferencias of TODAS) {
        const ids = serie(preferencias, 500, { desde }).map((f) => f.id)
        expect(new Set(ids).size, JSON.stringify(preferencias)).toBe(500)
      }
    }
  })

  it('el tema rota en el ciclo de cinco y nunca se repite en días seguidos', () => {
    const temas = serie({ modo: 'sin_definir' }, 60).map((f) => f.tema)
    temas.forEach((tema, i) => expect(tema).toBe(temaDelDia(sumarDias(INICIO, i))))
    temas.slice(1).forEach((tema, i) => expect(tema).not.toBe(temas[i]))
    expect(new Set(temas.slice(0, 5))).toEqual(new Set(TEMAS))
  })

  it('no depende del orden del catálogo: reordenarlo no cambia ninguna elección', () => {
    const alReves = Object.freeze([...APROBADAS].reverse())
    for (const preferencias of TODAS.slice(0, 6)) {
      expect(serie(preferencias, 60, { catalogo: alReves }).map((f) => f.id)).toEqual(
        serie(preferencias, 60).map((f) => f.id),
      )
    }
  })
})

describe('frase del día · audiencias', () => {
  it('secular y «decidir después» reciben solo lo universal y lo secular', () => {
    for (const preferencias of [{ modo: 'sin_definir' }, { modo: 'seculares' }, null]) {
      for (const frase of serie(preferencias, 500)) {
        expect(frase.audiencias.every((a) => ['universal', 'secular'].includes(a))).toBe(true)
      }
    }
  })

  it('sin afinidades elegidas, «quiero elegir referencias» es el perfil secular', () => {
    expect(perfilDeFrases({ modo: 'guiadas', afinidades: [] }).clave).toBe('secular')
    expect(serie({ modo: 'guiadas', afinidades: [] }, 30)).toEqual(
      serie({ modo: 'sin_definir' }, 30),
    )
  })

  it('un perfil guiado recibe lo universal y sus afinidades, y nada más', () => {
    for (const perfil of perfilesPosibles().filter((p) => p.afinidades.length > 0)) {
      const permitidas = ['universal', ...perfil.afinidades]
      for (const frase of serie(preferenciasDe(perfil), 500)) {
        expect(
          frase.audiencias.some((a) => permitidas.includes(a)),
          frase.id,
        ).toBe(true)
        expect(
          frase.audiencias.every((a) => permitidas.includes(a)),
          frase.id,
        ).toBe(true)
      }
    }
  })

  it('las afinidades elegidas aparecen y se reparten en cualquier tramo de 30 días', () => {
    for (const perfil of perfilesPosibles().filter((p) => p.afinidades.length > 0)) {
      for (let s = 0; s < 365; s += 11) {
        const cuenta = Object.fromEntries(perfil.afinidades.map((a) => [a, 0]))
        for (const frase of serie(preferenciasDe(perfil), 30, { desde: sumarDias(INICIO, s) })) {
          frase.audiencias.filter((a) => a in cuenta).forEach((a) => (cuenta[a] += 1))
        }
        const valores = Object.values(cuenta)
        expect(Math.min(...valores), perfil.clave).toBeGreaterThanOrEqual(2)
        expect(Math.max(...valores) - Math.min(...valores), perfil.clave).toBeLessThanOrEqual(3)
      }
    }
  })

  it('la primera afinidad elegida no tiene prioridad sobre las demás', () => {
    const todas = { modo: 'guiadas', afinidades: [...AFINIDADES] }
    const cuenta = Object.fromEntries(AFINIDADES.map((a) => [a, 0]))
    for (const frase of serie(todas, 500)) {
      frase.audiencias.filter((a) => a in cuenta).forEach((a) => (cuenta[a] += 1))
    }
    const valores = Object.values(cuenta)
    expect(Math.max(...valores) - Math.min(...valores)).toBeLessThanOrEqual(2)
  })

  it('el modo espiritual general no depende de ninguna tradición', () => {
    const frases = serie({ modo: 'espirituales_generales' }, 500)
    for (const frase of frases) {
      expect(frase.audiencias.every((a) => ['universal', 'espiritual_general'].includes(a))).toBe(
        true,
      )
    }
    expect(frases.some((f) => f.audiencias.includes('espiritual_general'))).toBe(true)
  })
})

describe('frase del día · ánimo bajo', () => {
  it('retira el esfuerzo y todo lo no apto, y pone calma en su lugar', () => {
    for (const preferencias of TODAS) {
      const frases = serie(preferencias, 200, { animoBajoReciente: true })
      for (const frase of frases) {
        expect(frase.tema).not.toBe('esfuerzo')
        expect(frase.aptaConAnimoBajo).toBe(true)
      }
      frases.forEach((frase, i) => {
        if (temaDelDia(sumarDias(INICIO, i)) === 'esfuerzo')
          expect(frase.tema).toBe(TEMA_DE_RESPALDO)
      })
      frases.slice(1).forEach((frase, i) => expect(frase.tema).not.toBe(frases[i].tema))
    }
  })

  it('no repite una frase antes de cien días aunque el ánimo bajo dure todo el año', () => {
    for (const preferencias of TODAS) {
      const ultima = new Map()
      serie(preferencias, 400, { animoBajoReciente: true }).forEach((frase, dia) => {
        if (ultima.has(frase.id)) expect(dia - ultima.get(frase.id)).toBeGreaterThanOrEqual(100)
        ultima.set(frase.id, dia)
      })
    }
  })

  it('los demás días no cambian: el ánimo bajo no reindexa el repertorio', () => {
    const normal = serie({ modo: 'sin_definir' }, 50)
    const bajo = serie({ modo: 'sin_definir' }, 50, { animoBajoReciente: true })
    normal.forEach((frase, i) => {
      if (frase.aptaConAnimoBajo) expect(bajo[i]).toBe(frase)
    })
  })

  it('una frase no apta de otro tema se sustituye dentro de su tema', () => {
    const catalogo = originales(
      'universal',
      Object.fromEntries(TEMAS.map((tema) => [tema, [`Una de ${tema}.`, `Otra de ${tema}.`]])),
      { noAptas: ['F2-UNI-GRA-001'] },
    )
    for (let i = 0; i < 20; i += 1) {
      const fecha = sumarDias(INICIO, i)
      const frase = elegirFrase(fecha, null, { animoBajoReciente: true, catalogo })
      expect(frase.id).not.toBe('F2-UNI-GRA-001')
      if (temaDelDia(fecha) === 'gratitud') expect(frase.id).toBe('F2-UNI-GRA-002')
    }
  })
})

describe('frase del día · respaldo', () => {
  it('si un tema se queda sin frases, sale una universal o secular aprobada', () => {
    const catalogo = originales('universal', { gratitud: ['Nada más que esta.'] })
    const frase = elegirFrase(
      '2026-10-05',
      { modo: 'guiadas', afinidades: ['budismo'] },
      { catalogo },
    )
    expect(frase.id).toBe('F2-UNI-GRA-001')
  })

  it('el respaldo nunca es un borrador ni una cita pendiente', () => {
    const pendiente = cita({
      id: 'C-PRUEBA',
      texto: 'Texto de prueba.',
      tema: 'calma',
      audiencias: ['universal'],
      estado: 'pendiente_revision',
      atribucion: 'Alguien · Algo',
      fuenteClave: 'X',
    })
    // El catálogo que recibe el selector ya viene sin pendientes; uno que solo
    // tuviera pendientes no tiene nada que mostrar, y lo dice con `null`.
    const soloAprobadas = [pendiente].filter((f) => f.estado === 'aprobada')
    expect(elegirFrase(INICIO, null, { catalogo: soloAprobadas })).toBeNull()
    expect(fraseDeRespaldo(INICIO, { catalogo: soloAprobadas })).toBeNull()
    expect(fraseDeRespaldo(INICIO).estado).toBe('aprobada')
  })

  it('el selector ve solo las aprobadas', () => {
    for (const preferencias of TODAS) {
      for (const frase of serie(preferencias, 100)) expect(frase.estado).toBe('aprobada')
    }
  })
})

describe('frase del día · asignación guardada', () => {
  beforeEach(resetLocalDB)

  it('se guarda en el dispositivo con id, fecha, huella y versión de catálogo', async () => {
    await initUserTree(UID)
    const frase = await fraseAsignada(UID, INICIO)
    const huella = huellaDe(null)
    expect(await db.getFraseAsignada(UID, INICIO, huella)).toMatchObject({
      phraseId: frase.id,
      fecha: INICIO,
      huella,
      catalogoVersion: 2,
    })
  })

  it('una asignación guardada manda aunque el catálogo cambie después', async () => {
    await initUserTree(UID)
    const huella = huellaDe(null)
    const otra = APROBADAS.find(
      (f) => f.audiencias.includes('universal') && f.id !== elegirFrase(INICIO, null).id,
    )
    await db.saveFraseAsignada(UID, {
      phraseId: otra.id,
      fecha: INICIO,
      huella,
      catalogoVersion: 2,
      asignadaEn: '2026-10-04T08:00:00.000Z',
    })
    expect((await fraseAsignada(UID, INICIO)).id).toBe(otra.id)
    expect((await cargarDia(UID, INICIO)).frase.id).toBe(otra.id)
  })

  it('cambiar de preferencias da otra frase estable sin tocar la asignación anterior', async () => {
    await initUserTree(UID)
    const antes = await fraseAsignada(UID, INICIO)
    const huellaAntes = huellaDe(null)

    await guardarPreferencias(UID, { modo: 'guiadas', afinidades: ['estoicismo'] })
    const despues = await fraseAsignada(UID, INICIO)
    expect(await fraseAsignada(UID, INICIO)).toBe(despues)
    expect((await db.getFraseAsignada(UID, INICIO, huellaAntes)).phraseId).toBe(antes.id)

    await restablecerPreferencias(UID)
    expect((await fraseAsignada(UID, INICIO)).id).toBe(antes.id)
  })

  it('con ánimo bajo, una asignada no apta se vuelve a elegir', async () => {
    await initUserTree(UID)
    const esfuerzo = APROBADAS.find(
      (f) => f.tema === 'esfuerzo' && f.audiencias.includes('universal'),
    )
    await db.saveFraseAsignada(UID, {
      phraseId: esfuerzo.id,
      fecha: INICIO,
      huella: huellaDe(null),
      catalogoVersion: 2,
      asignadaEn: '2026-10-04T08:00:00.000Z',
    })
    const frase = await fraseAsignada(UID, INICIO, { animoBajo: true })
    expect(frase.aptaConAnimoBajo).toBe(true)
  })

  it('una asignación que apunta a algo retirado o inexistente se vuelve a elegir', () => {
    expect(resolverAsignacion({ phraseId: 'F2-NO-EXISTE', catalogoVersion: 2 })).toBeNull()
    const pendiente = FRASES_V2.find((f) => f.estado !== 'aprobada')
    expect(resolverAsignacion({ phraseId: pendiente.id, catalogoVersion: 2 })).toBeNull()
  })

  it('una asignación de la versión 1 se sigue resolviendo con el repertorio anterior', () => {
    const v1 = resolverAsignacion({ phraseId: 'O-001', catalogoVersion: 1 })
    expect(v1.id).toBe('O-001')
    expect(v1.catalogoVersion).toBe(1)
  })

  it('una persona que ya terminó el onboarding entra en «decidir después» sin que nada la detenga', async () => {
    await initUserTree(UID, { onboarding: { completedAt: '2026-09-01T10:00:00.000Z' } })
    expect(await shared.onboardingPendiente(UID)).toBe(false)
    expect(await shared.getFrasesPreferencias(UID)).toBeNull()
    const dia = await cargarDia(UID, INICIO)
    expect(dia.frase.audiencias.every((a) => ['universal', 'secular'].includes(a))).toBe(true)
  })
})

describe('frase del día · presentación', () => {
  const pintar = (frase) => renderToStaticMarkup(createElement(FraseDelDia, { frase }))

  it('una original va sin comillas y sin atribución', () => {
    const original = APROBADAS.find((f) => f.tipo === 'original')
    const html = pintar(original)
    expect(html).toContain(original.texto)
    expect(html).not.toContain('«')
    expect(html).not.toContain('<figcaption')
    expect(html).toContain('<figure')
    expect(html).toContain('<blockquote')
  })

  it('una cita va entre comillas, con su atribución y el rótulo para el lector de pantalla', () => {
    const laCita = fraseV2PorId('C2-UNI-MARTI-EDAD-ORO-1')
    const html = pintar({ ...laCita, estado: 'aprobada' })
    expect(html).toContain('«')
    expect(html).toContain('<figcaption')
    expect(html).toContain('sr-only')
    expect(html).toContain('José Martí')
  })

  it('no es pulsable: ni botones, ni enlaces, ni etiquetas de perfil', () => {
    const html = pintar(APROBADAS.find((f) => f.audiencias.includes('cristianismo')))
    expect(html).not.toMatch(/<button|<a |onclick|role="button"/i)
    expect(html).not.toMatch(/cristianismo/i)
  })
})
