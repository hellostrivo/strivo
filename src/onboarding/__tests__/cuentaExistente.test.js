// src/onboarding/__tests__/cuentaExistente.test.js
// P7 con una cuenta que ya existía (SPEC_19.2 §4.1–§4.3; criterios 1 a 6 y 9).
//
// La restauración y la mudanza son las de verdad, sobre un Firestore de
// mentira y `fake-indexeddb`: lo que se prueba es dónde cae cada escritura del
// recorrido, no un doble que ya sabe la respuesta. El hook no se monta —las
// pruebas corren sin navegador—, y por eso lo que decide dónde se escribe vive
// en `escritura.js` y `traspaso.js`, que son lo que se ejercita aquí. Lo que
// queda en el hook y en los componentes se vigila leyendo la fuente.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'

import * as shared from '@lib/db/shared'
import { listQueue } from '@lib/db/local'
import { restaurar } from '@lib/db/restaurar'
import { paths } from '@lib/db/schema'
import { UID, resetLocalDB } from '@lib/db/__tests__/helpers.js'
import { PASOS } from '../pasos.js'
import { RESPUESTAS_INICIALES } from '../estado.js'

const CUENTA = 'AbC123firebaseUid'
const T0 = '2026-09-17T12:00:00.000Z'

// ─── Firestore de mentira, el patrón de `entradaCuenta.test.js` ──────────────

const nube = new Map()
const control = { fallar: false }

vi.mock('@lib/firebase', () => ({ db: { __fake: true } }))
vi.mock('../../lib/firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => {
  const snap = (path, data) => ({
    id: path.split('/').pop(),
    exists: () => data !== undefined,
    data: () => data,
  })
  const esperar = async () => {
    if (control.fallar) throw new Error('sin permiso')
  }
  return {
    doc: (_db, path) => ({ path }),
    collection: (_db, path) => ({ path }),
    documentId: () => '__name__',
    orderBy: () => ({}),
    limit: (n) => ({ limit: n }),
    startAfter: () => ({}),
    query: (col) => ({ col }),
    getDoc: async (ref) => {
      await esperar()
      return snap(ref.path, nube.get(ref.path))
    },
    getDocs: async ({ col }) => {
      await esperar()
      const prefijo = `${col.path}/`
      const ids = [...nube.keys()]
        .filter((k) => k.startsWith(prefijo) && !k.slice(prefijo.length).includes('/'))
        .sort()
      return { docs: ids.map((k) => snap(k, nube.get(k))) }
    },
  }
})

const { arbolDeEntrada, completarMudanzaPendiente, entrarACuenta, mudanzaPendiente } =
  await import('@lib/entradaCuenta')
const { completarPresentacion, leerPuerta } = await import('@/presentacion/entrada')
const escritura = await import('../escritura.js')
const traspaso = await import('../traspaso.js')

function enNube(sufijo, data) {
  nube.set(`users/${CUENTA}/${sufijo}`, data)
}

/** La cuenta de prueba en la nube: «Alejandra», con o sin el onboarding terminado. */
function cuentaEnNube({ terminada }) {
  enNube('shared/profile', { name: 'Alejandra', gender: 'f', updatedAt: T0 })
  enNube('shared/onboarding', {
    version: 3,
    currentStep: terminada ? 'p8' : 'p3',
    completedSteps: [],
    completedAt: terminada ? T0 : null,
    tourCompletedAt: terminada ? T0 : null,
    updatedAt: T0,
  })
}

/** La sesión anónima que llega a P7: «Prueba», con el expediente en P7. */
async function sesionEnP7() {
  await shared.initShared(UID)
  await shared.updateProfile(UID, { name: 'Prueba' })
  await shared.updateOnboarding(UID, { version: 3, currentStep: 'p7', completedSteps: ['p1'] })
}

const RESPUESTAS = { ...RESPUESTAS_INICIALES, nombre: 'Prueba', motivos: ['paz'] }
const rutas = async (uid) => (await listQueue(uid)).map((e) => e.path)
const sharedEncolado = async (uid) => (await rutas(uid)).filter((p) => p.includes('/shared/'))

function localStorageDeMentira() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

beforeEach(async () => {
  nube.clear()
  control.fallar = false
  vi.stubGlobal('localStorage', localStorageDeMentira())
  vi.stubGlobal('navigator', { onLine: true })
  await resetLocalDB()
  traspaso.retirarTraspaso(CUENTA)
  traspaso.retirarTraspaso(UID)
})

afterEach(() => vi.unstubAllGlobals())

// ─── Criterios 1 a 3: qué pasa al conectar ────────────────────────────────────

describe('P7 conecta por la sesión y deja dicho dónde seguir (§4.1)', () => {
  it('criterio 1: con cuenta nueva no deja paso, y el recorrido sigue en P7', async () => {
    const conectar = vi.fn(async () => ({ ok: true }))
    const r = await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, nueva: true },
      conectar,
      () => true,
    )

    expect(conectar).toHaveBeenCalledWith({ uid: CUENTA, nueva: true })
    expect(r).toEqual({ ok: true, paso: null })
    expect(traspaso.retomarTrasCuenta(CUENTA, 'p7').paso).toBe('p7')
  })

  it('criterio 2: con cuenta que ya terminó, entra, la puerta dice que no queda onboarding y nada sube', async () => {
    cuentaEnNube({ terminada: true })
    await sesionEnP7()

    const entrada = await entrarACuenta(UID, { uid: CUENTA, email: 'ale@ejemplo.com' })

    expect(entrada.pendiente).toBe(false)
    // La puerta del arranque: ni onboarding ni presentación.
    expect(await leerPuerta(CUENTA)).toEqual([false, false])
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect(await sharedEncolado(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'profile'))
    expect(await sharedEncolado(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'onboarding'))
  })

  it('criterio 3: con cuenta sin completedAt, el recorrido que se monta sigue en el paso siguiente a P7', async () => {
    cuentaEnNube({ terminada: false })
    await sesionEnP7()
    // El recorrido de antes del velo conecta; la sesión entra a la cuenta.
    const conectar = async (cuenta) => {
      await entrarACuenta(UID, cuenta)
      return { ok: true }
    }
    const r = await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, email: null, nueva: false },
      conectar,
      () => false, // se desmontó bajo el velo
    )
    expect(r.paso).toBeNull()

    // El que se monta al volver: la puerta dice que queda onboarding…
    expect((await leerPuerta(CUENTA))[0]).toBe(true)
    // …carga lo de la cuenta, que ganó (su currentStep es p3)…
    const { expediente, perfil } = await escritura.leerRecorrido(CUENTA)
    expect(expediente.currentStep).toBe('p3')
    expect(perfil.name).toBe('Alejandra')
    // …y aun así sigue en P8, una sola vez.
    expect(traspaso.retomarTrasCuenta(CUENTA, expediente.currentStep)).toEqual({
      paso: PASOS.cierre,
      motivo: null,
    })
    expect(traspaso.retomarTrasCuenta(CUENTA, expediente.currentStep).paso).toBe('p3')
  })

  it('si la mudanza falla, el motivo lo recibe el recorrido que se monta con el uid de origen (E5)', async () => {
    const conectar = async () => ({ ok: false, motivo: 'generico' })
    await traspaso.conectarConTraspaso(UID, { uid: CUENTA, nueva: false }, conectar, () => false)

    expect(traspaso.retomarTrasCuenta(CUENTA, null).paso).toBe(PASOS.bienvenida)
    expect(traspaso.retomarTrasCuenta(UID, 'p7')).toEqual({ paso: 'p7', motivo: 'generico' })
  })

  it('si quien conecta sigue montado (no hubo velo), lo toma él y no queda nada apuntado', async () => {
    const r = await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, nueva: false },
      async () => ({ ok: true }),
      () => true,
    )
    expect(r.paso).toBe(PASOS.cierre)
    expect(traspaso.retomarTrasCuenta(CUENTA, 'p3').paso).toBe('p3')
  })
})

// ─── Criterio 4: con la mudanza pendiente, todo cae en el origen ──────────────

describe('criterio 4: con la mudanza pendiente, el recorrido escribe bajo el origen (§4.2)', () => {
  async function entrarSinRestaurar() {
    cuentaEnNube({ terminada: true })
    await sesionEnP7()
    control.fallar = true
    const entrada = await entrarACuenta(UID, { uid: CUENTA, email: null })
    expect(entrada.pendiente).toBe(true)
    // `pasarACuenta` siembra el árbol de la cuenta antes de cambiar de uid.
    await shared.initShared(CUENTA)
    return (await escritura.leerRecorrido(CUENTA)).carga
  }

  it('el árbol de la entrada es el origen, y la carga lo dice', async () => {
    const carga = await entrarSinRestaurar()
    expect(mudanzaPendiente(CUENTA)).toBe(UID)
    expect(await arbolDeEntrada(CUENTA)).toBe(UID)
    expect(carga).toEqual({ uid: CUENTA, arbol: UID })
  })

  it('responder, guardar el motivo, los avisos, el paso y terminar escriben en el origen y nada de shared/* se encola bajo la cuenta', async () => {
    const carga = await entrarSinRestaurar()

    await escritura.escribirPerfil(CUENTA, carga, { ...RESPUESTAS, nombre: 'Prueba bis' })
    await escritura.escribirMotivo(CUENTA, carga, RESPUESTAS)
    await escritura.escribirRecordatorios(CUENTA, carga, 'concedido')
    await escritura.escribirPaso(CUENTA, carga, 'p8', ['p1', 'p7'], RESPUESTAS)
    await escritura.terminarRecorrido(CUENTA, carga, {
      respuestas: RESPUESTAS,
      paso: 'p8',
      recorridos: ['p1', 'p7', 'p8'],
    })
    await completarPresentacion(CUENTA)

    const origen = await shared.getOnboarding(UID)
    expect(origen.completedAt).not.toBeNull()
    expect(origen.tourCompletedAt).not.toBeNull()
    expect(origen.motivos).toEqual(['paz'])
    expect((await shared.getProfile(UID)).name).toBe('Prueba')
    expect((await shared.getPreferences(UID)).remindersEnabled).toBe(true)

    // La cuenta sigue siendo la semilla, y nada suyo de shared/* está en la cola.
    expect((await shared.getOnboarding(CUENTA)).completedAt).toBeNull()
    expect((await shared.getProfile(CUENTA)).name).toBeNull()
    expect(await sharedEncolado(CUENTA)).toEqual([])
    // Y la puerta, que lee el mismo árbol, ve el recorrido terminado.
    expect(await leerPuerta(CUENTA)).toEqual([false, false])
  })

  it('criterio 5: al completarse la mudanza, el perfil de la cuenta queda intacto, lo del origen se conserva y completedAt llega a la cuenta', async () => {
    cuentaEnNube({ terminada: false })
    await sesionEnP7()
    control.fallar = true
    await entrarACuenta(UID, { uid: CUENTA, email: null })
    await shared.initShared(CUENTA)
    const { carga } = await escritura.leerRecorrido(CUENTA)
    await escritura.terminarRecorrido(CUENTA, carga, {
      respuestas: RESPUESTAS,
      paso: 'p8',
      recorridos: ['p1', 'p7', 'p8'],
    })

    // Vuelve la red: la restauración termina bien y la mudanza se completa.
    control.fallar = false
    expect((await restaurar(CUENTA)).ok).toBe(true)
    await completarMudanzaPendiente(CUENTA)

    expect(mudanzaPendiente(CUENTA)).toBeNull()
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect((await shared.getProfile(UID)).name).toBe('Prueba')
    const cuenta = await shared.getOnboarding(CUENTA)
    expect(cuenta.currentStep).toBe('p3')
    expect(cuenta.completedAt).not.toBeNull()
    // Sube el expediente completado y el correo de `shared/auth`, como en
    // cualquier entrada; el perfil no.
    expect(await sharedEncolado(CUENTA)).toContain(paths.sharedDoc(CUENTA, 'onboarding'))
    expect(await sharedEncolado(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'profile'))
    // La puerta ya lee la cuenta, y la cuenta dice que el recorrido se terminó.
    expect(await arbolDeEntrada(CUENTA)).toBe(CUENTA)
    expect((await leerPuerta(CUENTA))[0]).toBe(false)
  })

  it('aplica igual al onboarding montado por la fila 3 del arranque (residuo de 19.1)', async () => {
    // Firebase con usuario, `localStorage` con un uid local a medio onboarding
    // y la entrada aplazada: el mismo `entrarACuenta`, el mismo árbol.
    cuentaEnNube({ terminada: false })
    await shared.initShared(UID)
    await shared.updateOnboarding(UID, { version: 3, currentStep: 'p3', completedSteps: ['p1'] })
    control.fallar = true
    await entrarACuenta(UID, { uid: CUENTA, email: null })
    await shared.initShared(CUENTA)

    const { carga } = await escritura.leerRecorrido(CUENTA)
    await escritura.escribirPerfil(CUENTA, carga, RESPUESTAS)

    expect((await shared.getProfile(UID)).name).toBe('Prueba')
    expect(await sharedEncolado(CUENTA)).toEqual([])
  })
})

// ─── La carrera: terminar con la mudanza en vuelo ─────────────────────────────

describe('un terminar con la mudanza en vuelo cae en la cuenta, no en el origen', () => {
  it('espera a la mudanza, escribe completedAt en la cuenta y no pisa su perfil', async () => {
    cuentaEnNube({ terminada: false })
    await sesionEnP7()
    control.fallar = true
    await entrarACuenta(UID, { uid: CUENTA, email: null })
    await shared.initShared(CUENTA)
    const { carga } = await escritura.leerRecorrido(CUENTA)
    control.fallar = false
    await restaurar(CUENTA)

    // La mudanza se queda a medio camino: ya leyó y movió las filas del
    // origen, pero todavía no ha retirado la clave. Es la ventana en la que un
    // `completedAt` escrito en el origen ya no llegaría a la cuenta.
    let soltarMudanza
    const retenida = new Promise((resolve) => (soltarMudanza = resolve))
    const original = shared.getAuthRecord
    const espia = vi.spyOn(shared, 'getAuthRecord').mockImplementationOnce(async (uid) => {
      await retenida
      return original(uid)
    })

    const mudanza = completarMudanzaPendiente(CUENTA)
    await vi.waitFor(() => expect(espia).toHaveBeenCalled())
    // Con la mudanza en vuelo, se termina el recorrido.
    const terminar = escritura.terminarRecorrido(CUENTA, carga, {
      respuestas: RESPUESTAS,
      paso: 'p8',
      recorridos: ['p1', 'p7', 'p8'],
    })
    await new Promise((r) => setTimeout(r, 20))
    soltarMudanza()
    await Promise.all([mudanza, terminar])
    espia.mockRestore()

    expect((await shared.getOnboarding(CUENTA)).completedAt).not.toBeNull()
    expect((await shared.getOnboarding(UID)).completedAt ?? null).toBeNull()
    // Las respuestas eran del origen, que perdió: la cuenta sigue siendo «Alejandra».
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect(await sharedEncolado(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'profile'))
  })
})

// ─── E4: la recarga solo con cambio de árbol ──────────────────────────────────

describe('E4: las respuestas se recargan solo si cambió el árbol de la entrada', () => {
  it('un sello sin cambio de árbol no recarga ni lee nada', async () => {
    await sesionEnP7()
    const { carga } = await escritura.leerRecorrido(UID)
    const lecturas = vi.spyOn(shared, 'getProfile')

    expect(await escritura.releerSiCambioElArbol(UID, carga)).toBeNull()
    expect(lecturas).not.toHaveBeenCalled()
    lecturas.mockRestore()
  })

  it('con la mudanza pendiente sin completar, tampoco', async () => {
    cuentaEnNube({ terminada: false })
    await sesionEnP7()
    control.fallar = true
    await entrarACuenta(UID, { uid: CUENTA, email: null })
    const { carga } = await escritura.leerRecorrido(CUENTA)

    expect(await escritura.releerSiCambioElArbol(CUENTA, carga)).toBeNull()
  })

  it('cuando la mudanza se completa, devuelve lo de la cuenta', async () => {
    cuentaEnNube({ terminada: false })
    await sesionEnP7()
    control.fallar = true
    await entrarACuenta(UID, { uid: CUENTA, email: null })
    const { carga } = await escritura.leerRecorrido(CUENTA)
    control.fallar = false
    await restaurar(CUENTA)
    await completarMudanzaPendiente(CUENTA)

    const nueva = await escritura.releerSiCambioElArbol(CUENTA, carga)
    expect(nueva.carga).toEqual({ uid: CUENTA, arbol: CUENTA })
    expect(
      escritura.respuestasDe(nueva.perfil, nueva.expediente, RESPUESTAS_INICIALES).nombre,
    ).toBe('Alejandra')
  })

  it('el hook la dispara con el sello, pero quien decide es el árbol', () => {
    const hook = readFileSync('src/onboarding/useOnboarding.js', 'utf8')
    expect(hook).toMatch(/releerSiCambioElArbol\(uid, cargado\.current\)/)
    expect(hook).toMatch(/\}, \[uid, sello\]\)/)
  })
})

// ─── Una cuenta nueva sigue escribiendo como siempre ──────────────────────────

describe('regresión: con una cuenta nueva, lo contestado sigue al árbol mudado', () => {
  it('una escritura tras adoptar el árbol cae en la cuenta, aunque la carga fuera del uid local', async () => {
    await sesionEnP7()
    const { carga } = await escritura.leerRecorrido(UID)
    const { adoptarArbol } = await import('@lib/cuenta')
    expect(await adoptarArbol(UID, { uid: CUENTA, email: null })).toBe(CUENTA)

    await escritura.escribirPerfil(CUENTA, carga, { ...RESPUESTAS, nombre: 'Nueva' })

    expect((await shared.getProfile(CUENTA)).name).toBe('Nueva')
  })
})

// ─── Criterio 9 y lo que se vigila leyendo la fuente ──────────────────────────

describe('criterio 9: P7 no tiene camino propio a la cuenta', () => {
  const contenedor = readFileSync('src/components/onboarding/Onboarding.jsx', 'utf8')
  const hook = readFileSync('src/onboarding/useOnboarding.js', 'utf8')

  it('ningún consumidor de adoptarCuenta ni de adoptarArbol en el onboarding', () => {
    expect(contenedor).not.toMatch(/adoptarCuenta|adoptarArbol/)
    expect(hook).not.toMatch(/adoptarCuenta|adoptarArbol/)
  })

  it('P7 conecta por la sesión', () => {
    expect(contenedor).toMatch(/const \{ conectarCuenta, selloRestauracion \} = useSesion\(\)/)
    expect(contenedor).toMatch(/acciones\.conectarCuenta\(resultado\)/)
    expect(hook).toMatch(/conectarConTraspaso\(uidSesion\.current, cuenta, conectar/)
  })

  it('«Tu cuenta está lista.» solo con cuenta nueva', () => {
    expect(contenedor).toMatch(
      /if \(resultado\.nueva\) setCuenta\(\{ listo: true, motivo: null \}\)/,
    )
  })

  it('antes de conectar se vacía lo tecleado y la fila entera (E6)', () => {
    expect(hook).toMatch(
      /await guardarAhora\(\)\s+await cola\.current\s+const r = await conectarConTraspaso/,
    )
  })

  it('todas las escrituras del recorrido pasan por escritura.js, que elige el árbol', () => {
    expect(hook).not.toMatch(/shared\./)
    const modulo = readFileSync('src/onboarding/escritura.js', 'utf8')
    const escrituras = modulo.match(/shared\.update\w+\((\w+)/g)
    expect(escrituras.length).toBeGreaterThanOrEqual(5)
    escrituras.forEach((e) => expect(e).toMatch(/\(arbol$/))
  })
})
