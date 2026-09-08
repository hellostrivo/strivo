// src/presentacion/__tests__/entrada.test.js
// Cuándo se ve la presentación de las secciones y cuándo no.
//
// La prueba que importa de este archivo es la de quien ya había entrado. Una
// pieza que se interpone en la puerta se equivoca de una sola manera grave:
// apareciéndole a alguien que lleva meses usando la app. Por eso hay tres
// casos para ese escenario y no uno.

import { beforeEach, describe, expect, it } from 'vitest'

import * as shared from '@/lib/db/shared.js'
import { initUserTree } from '@/lib/db/index.js'
import { FIELDS, paths } from '@/lib/db/schema.js'
import { listQueue, readPath } from '@/lib/db/local.js'
import { UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { VERSION } from '@/onboarding/pasos.js'

import {
  VERSION_CON_PRESENTACION,
  completarPresentacion,
  presentacionPendiente,
} from '../entrada.js'

const AYER = '2026-09-07T21:00:00.000Z'

beforeEach(resetLocalDB)

/** Un árbol con el onboarding terminado tal como lo dejaría esa versión. */
async function conOnboardingTerminado(version) {
  await initUserTree(UID)
  await shared.updateOnboarding(UID, { version, completedAt: AYER })
}

describe('el campo vive en el modelo, no al lado', () => {
  it('`tourCompletedAt` es un campo declarado de shared/onboarding', () => {
    // Sin esto, escribirlo lanzaría UNKNOWN_FIELD (RN-DB-03): ampliar el modelo
    // es una decisión, y aquí está tomada.
    expect(FIELDS.onboarding).toContain('tourCompletedAt')
  })

  it('un árbol nuevo nace con la marca en blanco, como con `completedAt`', async () => {
    await initUserTree(UID)
    expect(await shared.getOnboarding(UID)).toMatchObject({
      completedAt: null,
      tourCompletedAt: null,
    })
  })

  it('la versión del recorrido incluye ya la presentación', () => {
    // Es lo que distingue a quien terminó con las cuatro tarjetas detrás de
    // quien terminó antes de que existieran. Si el recorrido subiera de versión
    // y este número se quedara atrás, la distinción seguiría siendo correcta;
    // lo que no puede es ir por delante.
    expect(VERSION).toBeGreaterThanOrEqual(VERSION_CON_PRESENTACION)
  })
})

describe('cuándo queda por ver', () => {
  it('con el onboarding a medias, todavía no toca', async () => {
    await initUserTree(UID)
    expect(await presentacionPendiente(UID)).toBe(false)
  })

  it('sin árbol tampoco: no hay a quién presentarle nada', async () => {
    expect(await presentacionPendiente(UID)).toBe(false)
  })

  it('recién terminado el recorrido de hoy, sí', async () => {
    await conOnboardingTerminado(VERSION)
    expect(await presentacionPendiente(UID)).toBe(true)
  })

  it('y no se marca por el hecho de preguntarlo', async () => {
    // Preguntar no es haberla visto: la marca la escriben "Omitir" y "Entrar a
    // Strivo", que son las dos formas de pasarla.
    await conOnboardingTerminado(VERSION)
    await presentacionPendiente(UID)
    expect((await shared.getOnboarding(UID)).tourCompletedAt).toBeNull()
  })
})

describe('a quien ya había entrado no le aparece', () => {
  it('quien terminó el recorrido de siete pasos no la ve', async () => {
    await conOnboardingTerminado(2)
    expect(await presentacionPendiente(UID)).toBe(false)
  })

  it('quien terminó el de ocho tampoco', async () => {
    await conOnboardingTerminado(1)
    expect(await presentacionPendiente(UID)).toBe(false)
  })

  it('ni quien terminó sin que se guardara una versión', async () => {
    // El expediente de quien entró antes de que el recorrido guardara versión.
    // Sin versión es "antes", no "hoy": entre enseñar de más y enseñar de menos
    // en la puerta, se enseña de menos.
    await initUserTree(UID)
    await shared.updateOnboarding(UID, { completedAt: AYER })
    expect(await presentacionPendiente(UID)).toBe(false)
  })

  it('la migración se escribe una vez y con la fecha en que esa persona entró', async () => {
    await conOnboardingTerminado(2)
    await presentacionPendiente(UID)

    const expediente = await shared.getOnboarding(UID)
    // La fecha es la del día en que terminó su recorrido, no la de hoy: es
    // cuando esa persona entró de verdad.
    expect(expediente.tourCompletedAt).toBe(AYER)
    // Y no toca nada más de lo que ya había escrito (RN-DB-04).
    expect(expediente.completedAt).toBe(AYER)
    expect(expediente.version).toBe(2)
  })

  it('y no vuelve a preguntárselo en el siguiente arranque', async () => {
    await conOnboardingTerminado(2)
    await presentacionPendiente(UID)
    expect(await presentacionPendiente(UID)).toBe(false)
    expect((await shared.getOnboarding(UID)).tourCompletedAt).toBe(AYER)
  })
})

describe('pasarla la cierra, y por las dos puertas igual', () => {
  it('deja la marca con la hora de ahora', async () => {
    await conOnboardingTerminado(VERSION)
    await completarPresentacion(UID)

    const marca = (await shared.getOnboarding(UID)).tourCompletedAt
    expect(typeof marca).toBe('string')
    expect(Number.isNaN(Date.parse(marca))).toBe(false)
  })

  it('y no vuelve a aparecer en las aperturas siguientes', async () => {
    await conOnboardingTerminado(VERSION)
    await completarPresentacion(UID)
    expect(await presentacionPendiente(UID)).toBe(false)
  })

  it('no toca ni una respuesta del recorrido (RN-DB-04)', async () => {
    await conOnboardingTerminado(VERSION)
    await shared.updateOnboarding(UID, { motivos: ['paz'], motivoOtro: 'volver a mí' })
    await completarPresentacion(UID)

    expect(await shared.getOnboarding(UID)).toMatchObject({
      completedAt: AYER,
      motivos: ['paz'],
      motivoOtro: 'volver a mí',
    })
  })
})

describe('se guarda como se guarda todo lo demás (RN-01, RN-DB-01)', () => {
  it('queda en el dispositivo al instante, en la ruta del uid', async () => {
    await conOnboardingTerminado(VERSION)
    await completarPresentacion(UID)

    const local = await readPath(paths.sharedDoc(UID, 'onboarding'))
    expect(local.tourCompletedAt).toBeTruthy()
  })

  it('y queda encolado para subir, sin que la pantalla espere a la red', async () => {
    await conOnboardingTerminado(VERSION)
    await completarPresentacion(UID)

    const cola = await listQueue()
    const suyo = cola.filter((tarea) => tarea.path === paths.sharedDoc(UID, 'onboarding'))
    expect(suyo.length).toBeGreaterThan(0)
    expect(suyo.at(-1).data.tourCompletedAt).toBeTruthy()
  })

  it('un tropiezo al escribir no deja a nadie encerrado en la puerta', async () => {
    // Sin uid la capa de datos lanza. Lo que no puede pasar es que la excepción
    // suba hasta el botón: quien acaba de tocar "Entrar a Strivo" entra.
    await expect(completarPresentacion('')).resolves.toBeNull()
  })
})
