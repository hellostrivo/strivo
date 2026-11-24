// SPEC_25 — El puente con RevenueCat: identidad, compra y restauración
// (criterios 7, 8, 12 y 14). El plugin es un doble que se porta como el Proxy.

import { describe, expect, it, vi } from 'vitest'
import { aTiempo, pluginDeCapacitor } from './dobleDeCapacitor.js'
import { crearCompras, tieneDerecho } from '../compras.js'

const ANONIMO = '$RCAnonymousID:73a6f26cb98d43ccb2073442f44c0123'
const CON = {
  entitlements: { active: { completo: { isActive: true, productIdentifier: 'strivo_mensual' } } },
}
const SIN = { entitlements: { active: {} } }

function montar({
  id = ANONIMO,
  info = SIN,
  tras = SIN,
  restaurado = CON,
  iphone = true,
  clave = 'appl_x',
  ...metodos
} = {}) {
  const llamadas = []
  let actual = id
  let delCliente = info
  let oyente = null
  const anotar = (nombre, fn) => async (datos) => {
    llamadas.push(datos === undefined ? [nombre] : [nombre, datos])
    return fn?.(datos)
  }
  const plugin = pluginDeCapacitor({
    configure: anotar('configure'),
    addCustomerInfoUpdateListener: async (fn) => {
      oyente = fn
      return '1'
    },
    getAppUserID: async () => ({ appUserID: actual }),
    isAnonymous: async () => ({ isAnonymous: actual.startsWith('$RC') }),
    getCustomerInfo: async () => ({ customerInfo: delCliente }),
    logIn: anotar('logIn', ({ appUserID }) => {
      actual = appUserID
      delCliente = tras
      return { customerInfo: tras, created: false }
    }),
    logOut: anotar('logOut', () => {
      actual = ANONIMO
      return { customerInfo: SIN }
    }),
    restorePurchases: anotar('restorePurchases', () => ({ customerInfo: restaurado })),
    syncPurchases: anotar('syncPurchases'),
    ...metodos,
  })
  const cargar = vi.fn(async () => ({ plugin }))
  const compras = crearCompras({
    cargar,
    enTelefono: () => iphone,
    clave: () => clave,
    techoDeCierreMs: 200,
  })
  return { compras, llamadas, cargar, emitir: (i) => oyente?.(i) }
}
const nombres = (llamadas) => llamadas.map(([n]) => n)

describe('configurar', () => {
  it('sin appUserID y una sola vez, y el await termina', async () => {
    const { compras, llamadas } = montar()
    await aTiempo(Promise.all([compras.activar(), compras.info(), compras.planes()]))
    const configuraciones = llamadas.filter(([n]) => n === 'configure')
    expect(configuraciones).toHaveLength(1)
    expect(configuraciones[0][1]).not.toHaveProperty('appUserID')
    expect(configuraciones[0][1].automaticDeviceIdentifierCollectionEnabled).toBe(false)
  })

  it('en la web no se carga el plugin ni para salir', async () => {
    const { compras, cargar } = montar({ iphone: false })
    expect(compras.disponibles()).toBe(false)
    expect(await compras.info()).toBeNull()
    expect(await compras.cerrar()).toBe(false)
    expect(await compras.comprar({})).toEqual({ motivo: 'error' })
    expect(cargar).not.toHaveBeenCalled()
  })

  it('sin clave, tampoco', async () => {
    const { compras, cargar } = montar({ clave: '' })
    expect(await compras.activar()).toBe(false)
    expect(cargar).not.toHaveBeenCalled()
  })

  it('si falla, la siguiente vez lo intenta de nuevo', async () => {
    let veces = 0
    const { compras } = montar({
      configure: async () => {
        veces += 1
        if (veces === 1) throw new Error('no')
      },
    })
    expect(await compras.activar()).toBe(false)
    expect(await compras.activar()).toBe(true)
  })
})

describe('identificar', () => {
  it('liga el cliente al uid', async () => {
    const { compras, llamadas } = montar()
    await compras.identificar('uid1')
    expect(llamadas).toContainEqual(['logIn', { appUserID: 'uid1' }])
  })

  it('con el mismo uid no llama a nadie', async () => {
    const { compras, llamadas } = montar({ id: 'uid1' })
    await compras.identificar('uid1')
    expect(nombres(llamadas)).toEqual(['configure'])
  })

  it('D7: anónimo con derecho que lo pierde al entrar → restaura una vez', async () => {
    const { compras, llamadas } = montar({ info: CON, tras: SIN })
    const info = await compras.identificar('uid1')
    await compras.identificar('uid1')
    expect(nombres(llamadas).filter((n) => n === 'restorePurchases')).toHaveLength(1)
    expect(tieneDerecho(info)).toBe(true)
  })

  it.each([
    ['sin derecho antes', { info: SIN, tras: SIN }],
    ['el derecho viajó con él', { info: CON, tras: CON }],
    ['venía de otra cuenta', { id: 'otra', info: CON, tras: SIN }],
  ])('D7: no restaura: %s', async (_n, opciones) => {
    const { compras, llamadas } = montar(opciones)
    await compras.identificar('uid1')
    expect(nombres(llamadas)).not.toContain('restorePurchases')
  })

  it('si logIn falla, contesta null y no lanza', async () => {
    const { compras } = montar({
      logIn: async () => {
        throw new Error('sin red')
      },
    })
    expect(await compras.identificar('uid1')).toBeNull()
  })
})

describe('cerrar', () => {
  it('con cuenta, logOut', async () => {
    const { compras, llamadas } = montar({ id: 'uid1' })
    expect(await compras.cerrar()).toBe(true)
    expect(nombres(llamadas)).toContain('logOut')
  })

  it('anónimo, nunca', async () => {
    const { compras, llamadas } = montar()
    expect(await compras.cerrar()).toBe(false)
    expect(nombres(llamadas)).not.toContain('logOut')
  })

  it('si no contesta, no detiene a nadie', async () => {
    const { compras } = montar({ id: 'uid1', logOut: () => new Promise(() => {}) })
    expect(await aTiempo(compras.cerrar())).toBeNull()
  })
})

describe('comprar', () => {
  const fallo = (datos) => ({
    purchasePackage: async () => {
      throw Object.assign(new Error('x'), datos)
    },
  })
  it.each([
    ['cancelada por la persona', { userCancelled: true, code: '1' }, 'cancelada'],
    ['cancelada sin la marca', { code: '1' }, 'cancelada'],
    ['aplazada: espera un permiso', { code: '20' }, 'cancelada'],
    ['un error', { code: '2' }, 'error'],
    ['sin red', { code: '10', userCancelled: false }, 'error'],
  ])('%s', async (_n, datos, motivo) => {
    expect(await montar(fallo(datos)).compras.comprar({})).toEqual({ motivo })
  })

  it('con éxito avisa a quien escucha', async () => {
    const { compras } = montar({ purchasePackage: async () => ({ customerInfo: CON }) })
    const oido = vi.fn()
    compras.escuchar(oido)
    expect((await compras.comprar({ identifier: 'p' })).motivo).toBe('ok')
    expect(oido).toHaveBeenCalledWith(CON)
  })
})

describe('restaurar', () => {
  it('con compras, sin compras y con error', async () => {
    expect((await montar().compras.restaurar()).motivo).toBe('restaurado')
    expect((await montar({ restaurado: SIN }).compras.restaurar()).motivo).toBe('nada')
    const roto = montar({
      restorePurchases: async () => {
        throw new Error('no')
      },
    })
    expect((await roto.compras.restaurar()).motivo).toBe('error')
  })
})

describe('el oyente y los planes', () => {
  it('lo de fuera de la app llega solo, sin sincronizar', async () => {
    const { compras, emitir, llamadas } = montar()
    const oido = vi.fn()
    const dejar = compras.escuchar(oido)
    await compras.activar()
    emitir(CON)
    expect(oido).toHaveBeenCalledWith(CON)
    dejar()
    emitir(SIN)
    expect(oido).toHaveBeenCalledTimes(1)
    expect(nombres(llamadas)).not.toContain('syncPurchases')
  })

  it('anual y mensual del actual; el Fundador, solo de su offering', async () => {
    const { compras } = montar({
      getOfferings: async () => ({
        current: { annual: 'A', monthly: 'M', lifetime: 'resto de Test Store' },
        all: { fundador: { lifetime: 'F', metadata: { mostrar: true } } },
      }),
    })
    expect(await compras.planes()).toEqual({
      anual: 'A',
      mensual: 'M',
      fundador: 'F',
      metadata: { mostrar: true },
    })
  })

  it('offerings vacíos: todo null; con error: null', async () => {
    expect(
      await montar({ getOfferings: async () => ({ current: null, all: {} }) }).compras.planes(),
    ).toEqual({ anual: null, mensual: null, fundador: null, metadata: null })
    const roto = montar({
      getOfferings: async () => {
        throw new Error('no')
      },
    })
    expect(await roto.compras.planes()).toBeNull()
  })

  it('el diagnóstico ve seis caracteres del cliente y nunca el id entero', async () => {
    expect(await montar().compras.cliente()).toEqual({ anonimo: true, final: '4c0123' })
  })
})

describe('RN-07: al SDK solo le llega el uid', () => {
  it('ninguna llamada manda nada más', async () => {
    const { compras, llamadas } = montar({ info: CON })
    await compras.identificar('uid1')
    await compras.restaurar()
    await compras.cerrar()
    const datos = llamadas
      .filter(([n]) => n !== 'configure')
      .map(([, d]) => d)
      .filter(Boolean)
    expect(datos).toEqual([{ appUserID: 'uid1' }])
  })
})
