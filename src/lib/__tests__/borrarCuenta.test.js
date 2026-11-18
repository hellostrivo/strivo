// SPEC_24B — Borrar mi cuenta: la máquina, el orden y la retoma.
//
// Firebase, Firestore y Apple son dobles; el almacén local y las claves del
// teléfono son los de verdad (con un `localStorage` de mentira), porque lo que
// más importa aquí es que **nada local se toque hasta que la nube esté vacía y
// la cuenta ya no exista**.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UID, resetLocalDB } from '../db/__tests__/helpers.js'
import { leerTodoDelUid, listQueue, writePath } from '../db/local.js'
import {
  guardarMarcaDeBorrado,
  hayMarcaDeBorrado,
  leerMarcaDeBorrado,
  quitarMarcaDeBorrado,
} from '../db/marcaDeBorrado.js'
import { guardarClave, leerClave } from '../db/clavesDelTelefono.js'
import {
  ESTADOS,
  TAMANO_DE_LOTE,
  VALIDEZ_DE_VERIFICACION_MS,
  borrarCuenta,
  conservarCuenta,
  fijarEnsayo,
  limpiarElTelefono,
  palabraCoincide,
  progresoDelBorrado,
  queHacerAlArrancar,
  reiniciarBorradoParaPruebas,
  verificacionVigente,
} from '../borrarCuenta.js'
import { copy } from '@copy'

const AHORA = 1_800_000_000_000

function localStorageDeMentira() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    key: (i) => [...m.keys()][i] ?? null,
    get length() {
      return m.size
    },
  }
}

/** Una nube de mentira, el usuario y todo lo que el borrado toca fuera. */
function entorno({ documentos = 3, usuario = { uid: UID }, conMarcaDeRestauracion = true } = {}) {
  const orden = []
  const nube = new Set()
  for (let i = 0; i < documentos; i += 1) nube.add(`users/${UID}/diario/journal/items/e${i}`)
  nube.add(`users/${UID}/shared/profile`)
  const lotes = []
  const estado = {
    fallarLote: null,
    fallarUsuario: false,
    fallarRevocacion: false,
    noSeVacia: false,
    restaurado: conMarcaDeRestauracion,
  }

  const cuenta = usuario ? { ...usuario, getIdToken: async () => 'id-token-de-la-sesion' } : null
  const f = {
    auth: { currentUser: cuenta, app: { options: { apiKey: 'clave-web' } } },
    db: { __fake: true },
    firestore: {
      doc: (_db, ruta) => ruta,
      writeBatch: () => {
        const pendientes = []
        return {
          delete: (ruta) => pendientes.push(ruta),
          commit: async () => {
            orden.push('lote')
            if (estado.fallarLote !== null && lotes.length === estado.fallarLote) {
              throw new Error('lote')
            }
            lotes.push(pendientes.length)
            for (const ruta of pendientes) nube.delete(ruta)
          },
        }
      },
    },
    firebaseAuth: {},
  }

  const dobles = {
    enLinea: () => true,
    ahora: () => AHORA,
    nativa: () => true,
    firebase: async () => f,
    rutasEnLaNube: async () => {
      orden.push('enumerar')
      const rutas = [...nube].filter((r) => !r.endsWith('/diario/pinConfig'))
      return estado.noSeVacia && orden.filter((o) => o === 'lote').length > 0 ? ['quedó'] : rutas
    },
    restaurar: async () => {
      orden.push('restaurar')
      return { ok: estado.restaurado }
    },
    hayMarcaDeRestauracion: () => estado.restaurado,
    revocar: vi.fn(async () => {
      orden.push('revocar')
      if (estado.fallarRevocacion) throw new Error('apple')
    }),
    borrarUsuario: vi.fn(async () => {
      orden.push('borrarUsuario')
      if (estado.fallarUsuario) throw new Error('usuario')
    }),
    cerrarSesionNativa: vi.fn(async () => orden.push('cerrarSesionNativa')),
    vaciarTelefono: vi.fn(async () => orden.push('vaciarTelefono')),
    detenerSubida: vi.fn(async () => orden.push('detenerSubida')),
    limiteMs: 1000,
  }
  return { dobles, nube, lotes, orden, estado, f }
}

const verificado = (metodo = 'password', extra = {}) => ({ metodo, en: AHORA - 1000, ...extra })

async function sembrarLocal() {
  await writePath({
    uid: UID,
    path: `users/${UID}/diario/journal/items/e0`,
    collection: 'diario/journal',
    id: 'e0',
    data: { text: 'lo mío', updatedAt: '2026-11-14T10:00:00Z' },
  })
}

beforeEach(async () => {
  vi.stubGlobal('localStorage', localStorageDeMentira())
  vi.stubGlobal('navigator', { onLine: true })
  await resetLocalDB()
  reiniciarBorradoParaPruebas()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── La palabra (criterio 14) ────────────────────────────────────────────────

describe('BORRAR', () => {
  it.each(['BORRAR', 'borrar', 'Borrar', ' BORRAR ', '\tborrar\n'])('acepta «%s»', (texto) => {
    expect(palabraCoincide(texto)).toBe(true)
  })

  it.each(['BORAR', 'BORRAR!', 'borrarr', 'B O R R A R', '', null, 'eliminar'])(
    'rechaza «%s»',
    (texto) => {
      expect(palabraCoincide(texto)).toBe(false)
    },
  )

  it('la palabra vive en el copy', () => {
    expect(copy.cuenta.borrar.palabra).toBe('BORRAR')
  })
})

describe('la verificación vale cuatro minutos', () => {
  it('dentro, sí; pasado, no; sin verificar, no', () => {
    expect(verificacionVigente({ en: AHORA - 1000 }, AHORA)).toBe(true)
    expect(verificacionVigente({ en: AHORA - VALIDEZ_DE_VERIFICACION_MS }, AHORA)).toBe(false)
    expect(verificacionVigente(null, AHORA)).toBe(false)
  })
})

// ─── Antes de nada: «No se borró nada» (criterio 6) ─────────────────────────

describe('si falla antes de la nube, no se escribe la marca ni se borra nada', () => {
  it('sin red: hace falta conexión', async () => {
    const { dobles, orden } = entorno()
    const r = await borrarCuenta(UID, {
      verificacion: verificado(),
      dobles: { ...dobles, enLinea: () => false },
    })
    expect(r).toEqual({ ok: false, estado: 'necesitaConexion' })
    expect(hayMarcaDeBorrado(UID)).toBe(false)
    expect(orden).toEqual([])
  })

  it('con la verificación vencida, se vuelve a verificar', async () => {
    const { dobles, orden } = entorno()
    const r = await borrarCuenta(UID, {
      verificacion: { metodo: 'password', en: AHORA - VALIDEZ_DE_VERIFICACION_MS - 1 },
      dobles,
    })
    expect(r.estado).toBe('reverificar')
    expect(orden).toEqual([])
  })

  it('sin verificar, tampoco', async () => {
    const { dobles } = entorno()
    expect((await borrarCuenta(UID, { verificacion: null, dobles })).estado).toBe('reverificar')
  })

  it('sin usuario, o con el de otra cuenta: errorAntes', async () => {
    for (const usuario of [null, { uid: 'otra' }]) {
      const { dobles, orden } = entorno({ usuario })
      const r = await borrarCuenta(UID, { verificacion: verificado(), dobles })
      expect(r.estado).toBe(ESTADOS.errorAntes)
      expect(orden).toEqual([])
      expect(hayMarcaDeBorrado(UID)).toBe(false)
    }
  })

  it('sin Firebase configurado: errorAntes', async () => {
    const { dobles } = entorno()
    const r = await borrarCuenta(UID, {
      verificacion: verificado(),
      dobles: { ...dobles, firebase: async () => null },
    })
    expect(r.estado).toBe(ESTADOS.errorAntes)
  })

  it('D6: sin haber bajado la cuenta y si la bajada no termina, errorAntes sin marca', async () => {
    const { dobles, orden } = entorno({ conMarcaDeRestauracion: false })
    const r = await borrarCuenta(UID, { verificacion: verificado(), dobles })
    expect(r.estado).toBe(ESTADOS.errorAntes)
    expect(orden).toEqual(['restaurar'])
    expect(hayMarcaDeBorrado(UID)).toBe(false)
  })

  it('D6: una cuenta creada en este teléfono baja en el acto y no queda bloqueada', async () => {
    const e = entorno({ conMarcaDeRestauracion: false })
    e.dobles.restaurar = async () => {
      e.orden.push('restaurar')
      e.estado.restaurado = true
      return { ok: true }
    }
    const r = await borrarCuenta(UID, { verificacion: verificado(), dobles: e.dobles })
    expect(r).toEqual({ ok: true })
    expect(e.orden[0]).toBe('restaurar')
  })

  it('el ensayo «Fallar antes de la nube» dice errorAntes y no escribe la marca', async () => {
    fijarEnsayo({ fallarAntes: true })
    const { dobles, orden } = entorno()
    const r = await borrarCuenta(UID, { verificacion: verificado(), dobles })
    expect(r.estado).toBe(ESTADOS.errorAntes)
    expect(orden).toEqual([])
    expect(hayMarcaDeBorrado(UID)).toBe(false)
  })
})

// ─── Apple (criterio 12) ─────────────────────────────────────────────────────

describe('Apple', () => {
  it('con apple.com se revoca primero, con el código de esa misma verificación', async () => {
    const { dobles, orden } = entorno()
    const r = await borrarCuenta(UID, {
      verificacion: verificado('apple.com', { codigo: 'codigo-de-la-hoja' }),
      dobles,
    })
    expect(r.ok).toBe(true)
    expect(dobles.revocar).toHaveBeenCalledWith({
      codigo: 'codigo-de-la-hoja',
      idToken: 'id-token-de-la-sesion',
      apiKey: 'clave-web',
    })
    expect(orden.indexOf('revocar')).toBeLessThan(orden.indexOf('lote'))
    expect(progresoDelBorrado().apple).toBe('revocado')
  })

  it('con correo o con Google no se revoca nada', async () => {
    for (const metodo of ['password', 'google.com']) {
      const { dobles } = entorno()
      await borrarCuenta(UID, { verificacion: verificado(metodo), dobles })
      expect(dobles.revocar).not.toHaveBeenCalled()
    }
  })

  it('D4: si la revocación falla, «No se borró nada», se quita la marca y la nube no se toca', async () => {
    await sembrarLocal()
    const e = entorno()
    e.estado.fallarRevocacion = true
    const r = await borrarCuenta(UID, {
      verificacion: verificado('apple.com', { codigo: 'c' }),
      dobles: e.dobles,
    })
    expect(r.estado).toBe(ESTADOS.errorAntes)
    expect(hayMarcaDeBorrado(UID)).toBe(false)
    expect(e.lotes).toEqual([])
    expect(e.dobles.borrarUsuario).not.toHaveBeenCalled()
    expect(e.dobles.vaciarTelefono).not.toHaveBeenCalled()
    expect(await leerTodoDelUid(UID)).toHaveLength(1)
    expect(progresoDelBorrado().apple).toBe('fallo')
  })
})

// ─── Desde la nube: «No pudimos terminar…» (criterios 6 y 7) ─────────────────

describe('desde la nube, un fallo deja la marca y todo lo local intacto', () => {
  it('a mitad de la nube', async () => {
    await sembrarLocal()
    const e = entorno({ documentos: 700 })
    e.estado.fallarLote = 1
    const r = await borrarCuenta(UID, { verificacion: verificado(), dobles: e.dobles })
    expect(r.estado).toBe(ESTADOS.errorDurante)
    expect(leerMarcaDeBorrado(UID).fase).toBe('nube')
    expect(e.dobles.borrarUsuario).not.toHaveBeenCalled()
    expect(e.dobles.vaciarTelefono).not.toHaveBeenCalled()
    expect(await leerTodoDelUid(UID)).toHaveLength(1)
  })

  it('si al volver a enumerar todavía queda algo, no se sigue', async () => {
    const e = entorno()
    e.estado.noSeVacia = true
    const r = await borrarCuenta(UID, { verificacion: verificado(), dobles: e.dobles })
    expect(r.estado).toBe(ESTADOS.errorDurante)
    expect(e.dobles.borrarUsuario).not.toHaveBeenCalled()
  })

  it('en deleteUser', async () => {
    await sembrarLocal()
    const e = entorno()
    e.estado.fallarUsuario = true
    const r = await borrarCuenta(UID, { verificacion: verificado(), dobles: e.dobles })
    expect(r.estado).toBe(ESTADOS.errorDurante)
    expect(leerMarcaDeBorrado(UID).fase).toBe('cuenta')
    expect(e.dobles.vaciarTelefono).not.toHaveBeenCalled()
    expect(await leerTodoDelUid(UID)).toHaveLength(1)
  })

  it('el ensayo «Detenerse después de la nube» se para antes de deleteUser, con la marca', async () => {
    fijarEnsayo({ detenerDespues: true })
    const e = entorno()
    const r = await borrarCuenta(UID, { verificacion: verificado(), dobles: e.dobles })
    expect(r.estado).toBe('detenido')
    expect(hayMarcaDeBorrado(UID)).toBe(true)
    expect(e.nube.size).toBe(0)
    expect(e.dobles.borrarUsuario).not.toHaveBeenCalled()
    expect(progresoDelBorrado().fase).toBe('detenido')
  })
})

describe('criterio 7: el orden', () => {
  it('marca → detener → (Apple) → nube → comprobar → cuenta → teléfono', async () => {
    const e = entorno()
    const marcas = []
    const espiar = (nombre, fn) =>
      vi.fn(async (...a) => {
        marcas.push([nombre, leerMarcaDeBorrado(UID)?.fase ?? null])
        return fn(...a)
      })
    e.dobles.detenerSubida = espiar('detenerSubida', e.dobles.detenerSubida)
    e.dobles.borrarUsuario = espiar('borrarUsuario', e.dobles.borrarUsuario)
    e.dobles.vaciarTelefono = espiar('vaciarTelefono', e.dobles.vaciarTelefono)
    const r = await borrarCuenta(UID, {
      verificacion: verificado('apple.com', { codigo: 'c' }),
      dobles: e.dobles,
    })
    expect(r.ok).toBe(true)
    expect(e.orden).toEqual([
      'detenerSubida',
      'revocar',
      'enumerar',
      'lote',
      'enumerar',
      'borrarUsuario',
      'cerrarSesionNativa',
      'vaciarTelefono',
    ])
    // La marca está antes de detener la subida y sigue hasta el teléfono.
    expect(marcas).toEqual([
      ['detenerSubida', 'revocando'],
      ['borrarUsuario', 'cuenta'],
      ['vaciarTelefono', 'telefono'],
    ])
    expect(hayMarcaDeBorrado(UID)).toBe(false)
    expect(progresoDelBorrado().fase).toBe('terminado')
  })

  it('la sesión nativa de Google solo se cierra si se entró con un proveedor y en el iPhone', async () => {
    const correo = entorno()
    await borrarCuenta(UID, { verificacion: verificado('password'), dobles: correo.dobles })
    expect(correo.dobles.cerrarSesionNativa).not.toHaveBeenCalled()

    const web = entorno()
    await borrarCuenta(UID, {
      verificacion: verificado('google.com'),
      dobles: { ...web.dobles, nativa: () => false },
    })
    expect(web.dobles.cerrarSesionNativa).not.toHaveBeenCalled()

    const iphone = entorno()
    await borrarCuenta(UID, { verificacion: verificado('google.com'), dobles: iphone.dobles })
    expect(iphone.dobles.cerrarSesionNativa).toHaveBeenCalledTimes(1)
  })
})

describe('criterio 10: más de 500 documentos', () => {
  it('se borran en varios lotes de hasta 500, y la enumeración final da cero', async () => {
    const e = entorno({ documentos: 611 })
    const r = await borrarCuenta(UID, { verificacion: verificado(), dobles: e.dobles })
    expect(r.ok).toBe(true)
    // 611 + el perfil + pinConfig, que se borra sin leerlo.
    expect(e.lotes).toEqual([TAMANO_DE_LOTE, 113])
    expect(e.nube.size).toBe(0)
    const p = progresoDelBorrado()
    expect([p.encontrados, p.borrados, p.lotes]).toEqual([613, 613, 2])
  })

  it('pinConfig se borra siempre, por si alguna versión vieja lo subió', async () => {
    const e = entorno({ documentos: 0 })
    const borradas = []
    const writeBatch = e.f.firestore.writeBatch
    e.f.firestore.writeBatch = () => {
      const lote = writeBatch()
      return {
        delete: (ruta) => {
          borradas.push(ruta)
          lote.delete(ruta)
        },
        commit: lote.commit,
      }
    }
    await borrarCuenta(UID, { verificacion: verificado(), dobles: e.dobles })
    expect(borradas).toContain(`users/${UID}/diario/pinConfig`)
  })

  it('600 documentos con la latencia de una red de teléfono, en pocos segundos', async () => {
    const e = entorno({ documentos: 600 })
    const lento =
      (fn) =>
      async (...a) => {
        await new Promise((r) => setTimeout(r, 150))
        return fn(...a)
      }
    e.dobles.rutasEnLaNube = lento(e.dobles.rutasEnLaNube)
    const writeBatch = e.f.firestore.writeBatch
    e.f.firestore.writeBatch = () => {
      const lote = writeBatch()
      return { delete: lote.delete, commit: lento(lote.commit) }
    }
    const inicio = performance.now()
    expect((await borrarCuenta(UID, { verificacion: verificado(), dobles: e.dobles })).ok).toBe(
      true,
    )
    expect(performance.now() - inicio).toBeLessThan(5000)
  })
})

// ─── Al abrir la app con la marca (criterio 11) ──────────────────────────────

describe('queHacerAlArrancar', () => {
  it('sin marca, nada', () => {
    expect(queHacerAlArrancar(UID, { uid: UID })).toBe(null)
  })

  it('fase telefono, o cuenta sin usuario: la cuenta ya no existe, se limpia', () => {
    guardarMarcaDeBorrado(UID, { fase: 'telefono' })
    expect(queHacerAlArrancar(UID, null).accion).toBe('limpiar')
    guardarMarcaDeBorrado(UID, { fase: 'cuenta' })
    expect(queHacerAlArrancar(UID, null).accion).toBe('limpiar')
  })

  it('con usuario, a medio borrar', () => {
    for (const fase of ['revocando', 'nube', 'cuenta']) {
      guardarMarcaDeBorrado(UID, { fase, metodo: 'password' })
      expect(queHacerAlArrancar(UID, { uid: UID })).toMatchObject({
        accion: 'aMedias',
        sinSesion: false,
      })
    }
  })

  it('D12: antes de la cuenta y sin sesión, a medio borrar, pidiendo entrar', () => {
    guardarMarcaDeBorrado(UID, { fase: 'nube', metodo: 'apple.com' })
    expect(queHacerAlArrancar(UID, null)).toMatchObject({ accion: 'aMedias', sinSesion: true })
    expect(queHacerAlArrancar(UID, { uid: 'otra' })).toMatchObject({ sinSesion: true })
  })

  it('una marca ilegible cuenta como marca, a medio borrar: no se adivina', () => {
    localStorage.setItem(`strivo.borrado.${UID}`, '{roto')
    expect(queHacerAlArrancar(UID, null)).toMatchObject({ accion: 'aMedias', sinSesion: true })
  })

  it('«Terminar de borrar» sigue desde la marca sin volver a pedir la bajada', async () => {
    guardarMarcaDeBorrado(UID, { fase: 'nube', metodo: 'password' })
    const e = entorno({ conMarcaDeRestauracion: false })
    const r = await borrarCuenta(UID, { verificacion: verificado(), dobles: e.dobles })
    expect(r.ok).toBe(true)
    expect(e.orden).not.toContain('restaurar')
  })
})

describe('conservar y limpiar', () => {
  it('«Conservar mi cuenta» encola todo lo de este teléfono salvo semillas y lo local, y quita la marca', async () => {
    await sembrarLocal()
    // Una semilla (sin marca de tiempo) y dos rutas que no salen nunca.
    await writePath({
      uid: UID,
      path: `users/${UID}/shared/profile`,
      collection: 'shared',
      id: 'profile',
      data: { name: null },
      sync: false,
    })
    await writePath({
      uid: UID,
      path: `users/${UID}/diario/pinConfig`,
      collection: 'diario',
      id: 'pinConfig',
      data: { salt: 's' },
      sync: false,
    })
    await writePath({
      uid: UID,
      path: `users/${UID}/shared/frases`,
      collection: 'shared',
      id: 'frases',
      data: { modo: 'seculares', updatedAt: 'x' },
      sync: false,
    })
    // La cola, vacía: el borrado la detuvo.
    for (const entrada of await listQueue(UID)) expect(entrada).toBeDefined()
    guardarMarcaDeBorrado(UID, { fase: 'nube', metodo: 'password' })
    const { dobles } = entorno()
    const r = await conservarCuenta(UID, { dobles })
    expect(r.ok).toBe(true)
    expect(hayMarcaDeBorrado(UID)).toBe(false)
    const rutas = (await listQueue(UID)).map((e) => e.path)
    expect(rutas).toEqual([`users/${UID}/diario/journal/items/e0`])
    expect((await listQueue(UID))[0].op).toBe('put')
  })

  it('«Conservar» sin la sesión de esta cuenta no hace nada', async () => {
    guardarMarcaDeBorrado(UID, { fase: 'nube' })
    const { dobles } = entorno({ usuario: null })
    expect((await conservarCuenta(UID, { dobles })).ok).toBe(false)
    expect(hayMarcaDeBorrado(UID)).toBe(true)
  })

  it('limpiar el teléfono vacía todo y se lleva la marca', async () => {
    guardarMarcaDeBorrado(UID, { fase: 'cuenta' })
    const { dobles } = entorno()
    await limpiarElTelefono(UID, { dobles })
    expect(dobles.vaciarTelefono).toHaveBeenCalledTimes(1)
    expect(hayMarcaDeBorrado(UID)).toBe(false)
  })
})

describe('la marca', () => {
  it('es de la familia que se copia en SQLite', async () => {
    const { esClaveDelTelefono } = await import('../db/clavesDelTelefono.js')
    expect(esClaveDelTelefono(`strivo.borrado.${UID}`)).toBe(true)
  })

  it('guardar, leer y quitar', () => {
    guardarMarcaDeBorrado(UID, { fase: 'nube', metodo: 'google.com', desde: 'x' })
    expect(leerMarcaDeBorrado(UID)).toEqual({ fase: 'nube', metodo: 'google.com', desde: 'x' })
    expect(leerClave(`strivo.borrado.${UID}`)).not.toBe(null)
    quitarMarcaDeBorrado(UID)
    expect(hayMarcaDeBorrado(UID)).toBe(false)
  })

  it('no lleva nada que no esté ya en el teléfono', async () => {
    const e = entorno()
    fijarEnsayo({ detenerDespues: true })
    guardarClave('strivo.uid.local', UID)
    await borrarCuenta(UID, {
      verificacion: verificado('apple.com', { codigo: 'secreto' }),
      dobles: e.dobles,
    })
    const cruda = leerClave(`strivo.borrado.${UID}`)
    expect(Object.keys(JSON.parse(cruda)).sort()).toEqual(['desde', 'fase', 'metodo'])
    expect(cruda).not.toMatch(/secreto|id-token/)
  })
})
