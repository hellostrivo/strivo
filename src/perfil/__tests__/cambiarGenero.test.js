// src/perfil/__tests__/cambiarGenero.test.js
// Cambiar el género en Tu perfil cambia cómo habla la app. De punta a punta.
//
// Es la pregunta que ninguna prueba de esta rama contestaba todavía: si esto
// es un ajuste de verdad o un chip bonito que guarda un dato que nadie lee.
// Aquí se recorre el camino entero con la capa de datos real: se toca la
// opción como la toca la pantalla, se escribe con la misma función con la que
// escribe la pantalla, y se vuelve a leer con los mismos cargadores que usan
// Hoy, el Journal y el Historial.
//
// Lo que **no** cubre, porque en este proyecto no se puede: el render. Las
// pruebas corren en Node sin DOM. Lo que se demuestra aquí es que el dato llega
// y que la etiqueta que sale del catálogo es distinta; que el componente pinta
// esa etiqueta lo comprueban las pruebas de fuente de cada catálogo.
//
// RN-GEN-04 — Y por eso cambia también lo ya guardado: lo que se persiste es el
// identificador (`tranquilo`), nunca la etiqueta, así que una noche escrita
// hace un mes se relee con el género de hoy.

import { beforeEach, describe, expect, it } from 'vitest'

import { shared } from '@/lib/db'
import { initUserTree } from '@/lib/db/index.js'
import { cargarDia } from '@/diario/diario.js'
import { UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'

import { alternar, generoDe, opcionDe } from '@/onboarding/genero'
import { perfilDesde } from '@/onboarding/estado'
import { CIERRE } from '@/diario/nocheEmociones'
import { bienvenidaDe } from '@/onboarding/estado'
import { copy } from '@copy'

/** Lo que hace la pantalla al tocar una opción y dejar que se guarde sola. */
async function tocarGenero(uid, valores, opcion) {
  const proximos = { ...valores, genero: alternar(valores.genero, opcion) }
  await shared.updateProfile(uid, perfilDesde(proximos))
  return proximos
}

/** Lo que hace la pantalla al abrirse. */
async function abrirPerfil(uid) {
  const perfil = await shared.getProfile(uid)
  return {
    nombre: perfil?.name ?? '',
    genero: opcionDe(perfil?.gender),
    despertar: perfil?.wakeTime ?? '',
    dormir: perfil?.sleepTime ?? '',
  }
}

beforeEach(resetLocalDB)

describe('cambiar el género en Tu perfil', () => {
  it('llega al perfil, y con el valor del modelo y no con la etiqueta', async () => {
    await initUserTree(UID)
    let valores = await abrirPerfil(UID)

    valores = await tocarGenero(UID, valores, 'femenino')
    expect((await shared.getProfile(UID)).gender).toBe('f')

    await tocarGenero(UID, valores, 'masculino')
    expect((await shared.getProfile(UID)).gender).toBe('m')

    // Se persiste el identificador, nunca lo que se lee en pantalla (RN-DB-06).
    expect(['m', 'f', 'n']).toContain((await shared.getProfile(UID)).gender)
  })

  it('lo recoge el cargador de Hoy, que es de donde lo toma el día', async () => {
    await initUserTree(UID)
    const valores = await abrirPerfil(UID)

    await tocarGenero(UID, valores, 'femenino')
    expect((await cargarDia(UID)).genero).toBe('f')

    await tocarGenero(UID, { ...valores, genero: null }, 'masculino')
    expect((await cargarDia(UID)).genero).toBe('m')
  })

  it('y con él cambia lo que la app dice, no solo lo que guarda', async () => {
    await initUserTree(UID)
    const valores = await abrirPerfil(UID)

    // La misma emoción de cierre de la noche, leída con cada género.
    await tocarGenero(UID, valores, 'masculino')
    const enMasculino = CIERRE.etiquetaDe('tranquilo', (await cargarDia(UID)).genero)

    await tocarGenero(UID, { ...valores, genero: null }, 'femenino')
    const enFemenino = CIERRE.etiquetaDe('tranquilo', (await cargarDia(UID)).genero)

    // Sin contestar, el neutro: redactado sin marca, no en masculino.
    await tocarGenero(UID, { ...valores, genero: null }, 'prefiero_no_contestar')
    const enNeutro = CIERRE.etiquetaDe('tranquilo', (await cargarDia(UID)).genero)

    expect(enMasculino).toBe('Tranquilo')
    expect(enFemenino).toBe('Tranquila')
    expect(enNeutro).toBe('En calma')
    expect(new Set([enMasculino, enFemenino, enNeutro]).size).toBe(3)
  })

  it('y cambia el saludo con el que se entra, que también se resuelve al pintar', async () => {
    // Aquí vivía la misma comprobación sobre las sugerencias de la identidad
    // central. Esa pregunta salió del producto; el saludo del cierre (P8) es
    // hoy el otro consumidor del género fuera del catálogo de la noche, y se
    // resuelve igual: del perfil al pintar, no de lo que se guardó.
    await initUserTree(UID)
    const p8 = copy.diario.onboarding.p8
    await shared.updateProfile(UID, { name: 'Alejandra' })
    const valores = await abrirPerfil(UID)

    await tocarGenero(UID, valores, 'femenino')
    const perfilFemenino = await shared.getProfile(UID)
    expect(bienvenidaDe(p8, { nombre: perfilFemenino.name, genero: perfilFemenino.gender })).toBe(
      'Bienvenida, Alejandra',
    )

    await tocarGenero(UID, { ...valores, genero: null }, 'masculino')
    const perfilMasculino = await shared.getProfile(UID)
    expect(bienvenidaDe(p8, { nombre: perfilMasculino.name, genero: perfilMasculino.gender })).toBe(
      'Bienvenido, Alejandra',
    )
  })

  it('vuelve marcada la opción que se tocó, al reabrir la pantalla', async () => {
    await initUserTree(UID)
    const valores = await abrirPerfil(UID)

    await tocarGenero(UID, valores, 'femenino')
    expect((await abrirPerfil(UID)).genero).toBe('femenino')

    // El neutro vuelve sin marcar: es lo que vale sin contestar, y elegir por
    // alguien cuál de sus dos opciones tocó sería inventarle una respuesta.
    await tocarGenero(UID, { ...valores, genero: null }, 'otro')
    expect((await shared.getProfile(UID)).gender).toBe('n')
    expect((await abrirPerfil(UID)).genero).toBeNull()
  })

  // Y esta es la garantía de que retirar P4 no le borró la frase a nadie: el
  // perfil ya no la escribe, así que fusionar cualquier otro cambio la deja
  // exactamente donde estaba (RN-DB-04).
  it('no toca nada más del perfil al cambiar solo el género', async () => {
    await initUserTree(UID)
    await shared.updateProfile(UID, {
      name: 'Alejandra',
      identidadCentral: 'vive con intención.',
      wakeTime: '06:30',
      sleepTime: '23:15',
    })

    const valores = await abrirPerfil(UID)
    await tocarGenero(UID, valores, 'femenino')

    const perfil = await shared.getProfile(UID)
    expect(perfil.gender).toBe('f')
    expect(perfil.name).toBe('Alejandra')
    expect(perfil.identidadCentral).toBe('vive con intención.')
    expect(perfil.wakeTime).toBe('06:30')
    expect(perfil.sleepTime).toBe('23:15')
    // Y la fecha de alta sigue siendo la de siempre: nada se reescribe de paso.
    expect(perfil.createdAt).toBeTruthy()
  })

  it('lo escrito hace un mes se relee con el género de hoy (RN-GEN-04)', async () => {
    await initUserTree(UID)
    const valores = await abrirPerfil(UID)

    // Una noche cerrada en masculino.
    await tocarGenero(UID, valores, 'masculino')
    const { diario } = await import('@/lib/db')
    await diario.saveNightRitual(UID, '2026-07-15', {
      version: 2,
      closingFeelings: ['tranquilo'],
      completedAt: new Date().toISOString(),
    })

    const guardada = await diario.getNightRitual(UID, '2026-07-15')
    expect(guardada.closingFeelings).toEqual(['tranquilo'])
    expect(CIERRE.etiquetaDe(guardada.closingFeelings[0], generoDe('masculino'))).toBe('Tranquilo')

    // Se cambia el género hoy, y esa noche se relee distinta sin haberla tocado.
    await tocarGenero(UID, { ...valores, genero: null }, 'femenino')
    const genero = (await cargarDia(UID)).genero
    const sigueIgual = await diario.getNightRitual(UID, '2026-07-15')

    expect(sigueIgual.closingFeelings).toEqual(['tranquilo'])
    expect(CIERRE.etiquetaDe(sigueIgual.closingFeelings[0], genero)).toBe('Tranquila')
  })
})
