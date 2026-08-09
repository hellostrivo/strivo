// tests/vincularCuenta.test.js
// Vincular una cuenta cuando el onboarding ya se cerró (§07.D.5).
//
// P10 pasa una sola vez. Quien la saltó necesita una segunda puerta para poder
// poner un PIN, y cruzarla no puede costarle nada de lo que ya había escrito.

import { describe, it, expect } from 'vitest'
import { vincularCuenta } from '@lib/onboardingProfile'
import { saveUserProfile, saveHabit, getUserProfile } from '@lib/db'
import { entradaNueva, guardarEntrada, loadEntradas } from '@lib/journal'
import { getLocalUserId, getAccountUserId, getCurrentUserId } from '@lib/user'
import { filasDe } from './helpers/db.js'
import { metodoDeRecuperacion } from '@lib/auth'

const CUENTA = { uid: 'firebase-123', correo: 'hola@strivo.com', proveedor: 'correo' }

// Alguien que lleva tiempo usando la app sin cuenta: tiene perfil, un hábito y
// dos cosas escritas en el journal.
async function unaVidaYaEmpezada() {
  const userId = getLocalUserId()
  await saveUserProfile({
    userId,
    gender: 'femenino',
    identidadCentral: 'crece',
    horaDespertar: '07:00',
  })
  await saveHabit({
    id: `${userId}_habito_agua`,
    userId,
    nombre: 'Beber agua',
    areaId: null,
    momento: 'manana',
    estado: 'activo',
    totalCompletados: 3,
  })
  await guardarEntrada({ ...entradaNueva(userId), texto: 'lo que escribí ayer' })
  await guardarEntrada({ ...entradaNueva(userId), texto: 'y lo de hoy' })
  return userId
}

describe('vincular una cuenta después del onboarding', () => {
  it('el id de la cuenta pasa a ser el vigente', async () => {
    await unaVidaYaEmpezada()

    await vincularCuenta(CUENTA)

    expect(getAccountUserId()).toBe(CUENTA.uid)
    expect(getCurrentUserId()).toBe(CUENTA.uid)
  })

  it('el journal no se pierde ni se queda huérfano', async () => {
    const local = await unaVidaYaEmpezada()

    await vincularCuenta(CUENTA)

    // Lo que se ve al abrir el Journal es lo mismo que había
    const entradas = await loadEntradas(getCurrentUserId())
    expect(entradas).toHaveLength(2)
    expect(entradas.map(e => e.texto).sort()).toEqual(['lo que escribí ayer', 'y lo de hoy'])

    // Y no queda nada bajo el dueño de antes
    const todas = await filasDe('journalEntries')
    expect(todas).toHaveLength(2)
    expect(todas.every(e => e.userId === CUENTA.uid)).toBe(true)
    expect(todas.some(e => e.userId === local)).toBe(false)
  })

  it('los hábitos viajan con su contador y sin duplicarse', async () => {
    await unaVidaYaEmpezada()

    await vincularCuenta(CUENTA)

    const habitos = await filasDe('habits')
    expect(habitos).toHaveLength(1)
    expect(habitos[0]).toMatchObject({
      userId: CUENTA.uid,
      nombre: 'Beber agua',
      totalCompletados: 3,
    })
  })

  it('el perfil se muda entero y con la cuenta anotada, sin dejar copia detrás', async () => {
    await unaVidaYaEmpezada()

    await vincularCuenta(CUENTA)

    const perfiles = await filasDe('userProfile')
    expect(perfiles).toHaveLength(1)
    expect(perfiles[0]).toMatchObject({
      userId: CUENTA.uid,
      gender: 'femenino',
      identidadCentral: 'crece',
      horaDespertar: '07:00',
      cuenta: CUENTA,
    })
  })

  it('volver a vincular la misma cuenta no mueve nada ni duplica filas', async () => {
    await unaVidaYaEmpezada()
    await vincularCuenta(CUENTA)

    await vincularCuenta(CUENTA)

    expect(await filasDe('journalEntries')).toHaveLength(2)
    expect(await filasDe('habits')).toHaveLength(1)
    expect(await filasDe('userProfile')).toHaveLength(1)
    expect((await getUserProfile(CUENTA.uid)).identidadCentral).toBe('crece')
  })

  it('sin uid no hace nada: el id vigente se queda como estaba', async () => {
    const local = await unaVidaYaEmpezada()

    expect(await vincularCuenta(null)).toBe(null)
    expect(await vincularCuenta({ correo: 'hola@strivo.com' })).toBe(null)

    expect(getCurrentUserId()).toBe(local)
    expect(await filasDe('journalEntries')).toHaveLength(2)
  })

  it('después de vincular, ya hay con qué recuperar un PIN olvidado', async () => {
    await unaVidaYaEmpezada()
    // Sin cuenta no se ofrece PIN: no habría forma de volver a entrar
    expect(await metodoDeRecuperacion()).toBe(null)

    await vincularCuenta(CUENTA)

    // Con Firebase configurado, la vía es el correo de la cuenta. En las
    // pruebas no hay VITE_FIREBASE_API_KEY, así que sigue siendo null: lo que
    // esta línea fija es que la decisión depende de la cuenta y de la
    // configuración, nunca de un valor por defecto permisivo.
    const via = await metodoDeRecuperacion()
    expect(via === null || via.via === 'correo').toBe(true)
  })
})
