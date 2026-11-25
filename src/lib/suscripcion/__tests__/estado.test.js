// SPEC_25 — El estado, el Fundador, los planes y lo que sale una vez
// (criterios 2, 4, 5 y 6). Todo puro.

import { readFileSync } from 'fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ESTADOS,
  conDesfase,
  diaDePrueba,
  estadoDeSuscripcion,
  puedeEscribir,
  ultimoDiaDePrueba,
} from '../estado.js'
import { mostrarFundador } from '../fundador.js'
import { precioEnVoz, preseleccionada, tarjetasDe } from '../planes.js'
import { darElMuroPorVisto, olvidarElMuro, tocaElMuro } from '../muroSolo.js'
import {
  descartarTarjeta,
  marcarTarjeta,
  olvidarSesionDeTarjetas,
  olvidarTarjeta,
  tarjetaVista,
  tocaLaTarjeta,
} from '../tarjetaDePrueba.js'
import { esClaveDelTelefono, quitarTodasLasClaves } from '../../db/clavesDelTelefono.js'

const INICIO = new Date(2026, 10, 30, 21, 15)
const enDia = (n, hora = 9) => new Date(2026, 10, 30 + n - 1, hora)

const info = (derecho) => ({
  entitlements: { active: derecho ? { completo: { isActive: true, ...derecho } } : {} },
})
const MENSUAL = info({
  productIdentifier: 'strivo_mensual',
  willRenew: true,
  expirationDate: '2026-12-30T18:00:00Z',
})
const MENSUAL_CANCELADO = info({
  productIdentifier: 'strivo_mensual',
  willRenew: false,
  expirationDate: '2026-12-30T18:00:00Z',
})
const ANUAL = info({
  productIdentifier: 'strivo_anual',
  willRenew: true,
  expirationDate: '2027-11-30T18:00:00Z',
})
const FUNDADOR = info({
  productIdentifier: 'strivo_fundador',
  willRenew: false,
  expirationDate: null,
})
const EXPIRADO = { entitlements: { active: {}, all: { completo: { isActive: false } } } }

const calcular = (datos) =>
  estadoDeSuscripcion({
    customerInfo: null,
    fechaInicioPrueba: INICIO.toISOString(),
    ahora: enDia(1),
    iphone: true,
    ...datos,
  })

describe('sin derecho: la fecha', () => {
  it.each([
    [1, 'prueba'],
    [6, 'prueba'],
    [7, 'prueba'],
    [8, 'lectura'],
    [30, 'lectura'],
  ])('día %i → %s', (dia, estado) => {
    const r = calcular({ ahora: enDia(dia, 23) })
    expect(r.estado).toBe(estado)
    expect(r.dia).toBe(dia)
  })

  it('el día 7 dura hasta la medianoche y el 8 empieza ahí', () => {
    expect(calcular({ ahora: new Date(2026, 11, 6, 23, 59) }).estado).toBe('prueba')
    expect(calcular({ ahora: new Date(2026, 11, 7, 0, 0) }).estado).toBe('lectura')
  })

  it('con el día que termina a las 03:00, la madrugada sigue en el día 7', () => {
    const r = calcular({ ahora: new Date(2026, 11, 7, 1, 30), diaTerminaA: '03:00' })
    expect(r.estado).toBe('prueba')
  })

  it('«hasta» es hoy + 6 y coincide con «mañana» en el día 6', () => {
    expect(ultimoDiaDePrueba(INICIO.toISOString()).getDate()).toBe(6)
    expect(calcular({}).hasta).toEqual(new Date(2026, 11, 6))
  })

  it('un reloj atrasado no cierra nada', () => {
    expect(calcular({ ahora: enDia(-3) }).estado).toBe('prueba')
  })

  it.each([null, undefined, '', 'ayer'])('sin fecha legible (%s), nada se cierra', (fecha) => {
    expect(calcular({ fechaInicioPrueba: fecha, ahora: enDia(30) }).estado).toBe('cargando')
  })

  it('derecho expirado cuenta como sin derecho', () => {
    expect(calcular({ customerInfo: EXPIRADO, ahora: enDia(3) }).estado).toBe('prueba')
    expect(calcular({ customerInfo: EXPIRADO, ahora: enDia(9) }).estado).toBe('lectura')
  })

  it('strivo_pro no abre nada: solo se mira completo', () => {
    const pro = { entitlements: { active: { strivo_pro: { isActive: true } } } }
    expect(calcular({ customerInfo: pro, ahora: enDia(9) }).estado).toBe('lectura')
  })
})

describe('un derecho activo gana siempre a la prueba', () => {
  const casos = [
    ['mensual', MENSUAL, { estado: 'activa', plan: 'mensual', seRenueva: true }],
    [
      'mensual cancelado y vigente',
      MENSUAL_CANCELADO,
      { estado: 'activa', plan: 'mensual', seRenueva: false },
    ],
    ['anual', ANUAL, { estado: 'activa', plan: 'anual', seRenueva: true }],
    ['fundador', FUNDADOR, { estado: 'fundador', plan: 'fundador', hasta: null }],
  ]
  for (const [nombre, customerInfo, esperado] of casos) {
    it.each([null, 1, 6, 7, 8, 30])(`${nombre}, día %s`, (dia) => {
      const r = calcular({
        customerInfo,
        ahora: enDia(dia ?? 1),
        fechaInicioPrueba: dia === null ? null : INICIO.toISOString(),
      })
      expect(r).toMatchObject(esperado)
    })
  }

  it('y también antes de que el almacén conteste', () => {
    expect(calcular({ customerInfo: ANUAL, listo: false }).estado).toBe('activa')
  })

  it('un producto desconocido con derecho abre, sin nombre de plan', () => {
    const raro = info({ productIdentifier: 'rc_promo', willRenew: false })
    expect(calcular({ customerInfo: raro, ahora: enDia(9) })).toMatchObject({
      estado: 'activa',
      plan: null,
    })
  })
})

describe('la web y la carga', () => {
  it('en la web no hay prueba ni lectura (DP-25.12)', () => {
    const r = calcular({ iphone: false, ahora: enDia(300), fechaInicioPrueba: null })
    expect(r.estado).toBe('web')
    expect(puedeEscribir(r.estado)).toBe(true)
  })

  it('sin saber todavía, cargando', () => {
    expect(calcular({ listo: false, ahora: enDia(30) }).estado).toBe('cargando')
  })
})

describe('puedeEscribir', () => {
  it('solo la lectura cierra', () => {
    const cerrados = Object.values(ESTADOS).filter((e) => !puedeEscribir(e))
    expect(cerrados).toEqual(['lectura'])
  })
})

describe('el desfase del diagnóstico', () => {
  it('mueve el día y no la fecha de inicio', () => {
    expect(calcular({ desfaseDias: 5 })).toMatchObject({ estado: 'prueba', dia: 6 })
    expect(calcular({ desfaseDias: 7 })).toMatchObject({ estado: 'lectura', dia: 8 })
  })

  it('cero es hoy, el mismo instante', () => {
    const ahora = new Date()
    expect(conDesfase(ahora, 0)).toBe(ahora)
  })

  it('cuenta días de calendario aunque cambie el horario', () => {
    expect(
      diaDePrueba(new Date(2026, 2, 5, 12).toISOString(), { ahora: new Date(2026, 3, 8, 12) }),
    ).toBe(35)
  })
})

describe('mostrarFundador', () => {
  const paquete = { product: { priceString: 'P' } }
  const bueno = {
    metadata: { mostrar: true, hasta: '2027-01-15' },
    paquete,
    estado: 'prueba',
    ahora: new Date(2026, 11, 20, 12),
  }

  it('sale en prueba y en lectura', () => {
    expect(mostrarFundador(bueno)).toBe(true)
    expect(mostrarFundador({ ...bueno, estado: 'lectura' })).toBe(true)
  })

  it('el último día entra entero y el siguiente no', () => {
    expect(mostrarFundador({ ...bueno, ahora: new Date(2027, 0, 15, 23, 59) })).toBe(true)
    expect(mostrarFundador({ ...bueno, ahora: new Date(2027, 0, 16, 0, 0) })).toBe(false)
  })

  it.each([
    ['apagado', { metadata: { mostrar: false, hasta: '2027-01-15' } }],
    ['mostrar como texto', { metadata: { mostrar: 'true', hasta: '2027-01-15' } }],
    ['mostrar como 1', { metadata: { mostrar: 1, hasta: '2027-01-15' } }],
    ['sin hasta', { metadata: { mostrar: true } }],
    ['hasta mal escrita', { metadata: { mostrar: true, hasta: '15/01/2027' } }],
    ['sin metadata', { metadata: null }],
    ['sin paquete', { paquete: null }],
    ['sin producto', { paquete: { product: null } }],
    ['con suscripción', { estado: 'activa' }],
    ['ya fundador', { estado: 'fundador' }],
    ['en la web', { estado: 'web' }],
  ])('no sale: %s', (_nombre, cambio) => {
    expect(mostrarFundador({ ...bueno, ...cambio })).toBe(false)
  })
})

describe('las tarjetas de plan', () => {
  const pack = (priceString, price) => ({ product: { priceString, price, currencyCode: 'MXN' } })
  const planes = {
    anual: pack('A-tienda', 7),
    mensual: pack('M-tienda', 3),
    fundador: pack('F-tienda', 9),
  }

  it('Anual primero y preseleccionado, con el precio de la tienda', () => {
    const t = tarjetasDe(planes)
    expect(t.map(({ id }) => id)).toEqual(['anual', 'mensual'])
    expect(preseleccionada(t)).toBe('anual')
    expect(t[0].detalle).toBe('A-tienda al año')
    expect(t[1].detalle).toBe('M-tienda al mes')
  })

  it('el Fundador solo si se pide', () => {
    const t = tarjetasDe(planes, { conFundador: true })
    expect(t[2]).toMatchObject({ id: 'fundador', detalle: 'F-tienda, una vez' })
  })

  it('en voz lleva la moneda', () => {
    expect(tarjetasDe(planes)[0].enVoz).toMatch(/^Anual\. .*pesos mexicanos al año$/)
  })

  it('sin moneda legible, el texto de la tienda', () => {
    expect(precioEnVoz({ priceString: 'X', price: 1, currencyCode: '??' })).toBe('X')
  })

  it('vacíos: sin tarjetas y sin error', () => {
    for (const p of [null, {}, { anual: null, mensual: { product: null } }]) {
      expect(tarjetasDe(p)).toEqual([])
      expect(preseleccionada(tarjetasDe(p))).toBeNull()
    }
  })

  it('si solo llega el Mensual, es el elegido', () => {
    expect(preseleccionada(tarjetasDe({ mensual: planes.mensual }))).toBe('mensual')
  })
})

describe('el muro, solo, una vez por sesión', () => {
  beforeEach(olvidarElMuro)

  it('en lectura y con la pantalla libre', () => {
    expect(tocaElMuro({ estado: 'lectura', libre: true })).toBe(true)
    expect(tocaElMuro({ estado: 'lectura', libre: false })).toBe(false)
    expect(tocaElMuro({ estado: 'prueba', libre: true })).toBe(false)
  })

  it('después de «Ahora no», hasta la siguiente sesión', () => {
    darElMuroPorVisto()
    expect(tocaElMuro({ estado: 'lectura', libre: true })).toBe(false)
  })
})

describe('la tarjeta del día 6, una vez en este teléfono', () => {
  beforeEach(() => {
    olvidarSesionDeTarjetas()
    const m = new Map()
    vi.stubGlobal('localStorage', {
      get length() {
        return m.size
      },
      key: (i) => [...m.keys()][i] ?? null,
      getItem: (k) => m.get(k) ?? null,
      setItem: (k, v) => m.set(k, String(v)),
      removeItem: (k) => m.delete(k),
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('solo el día 6 y en prueba', () => {
    expect(tocaLaTarjeta({ estado: 'prueba', dia: 6, vista: false })).toBe(true)
    expect(tocaLaTarjeta({ estado: 'prueba', dia: 5, vista: false })).toBe(false)
    expect(tocaLaTarjeta({ estado: 'prueba', dia: 7, vista: false })).toBe(false)
    expect(tocaLaTarjeta({ estado: 'activa', dia: null, vista: false })).toBe(false)
    expect(tocaLaTarjeta({ estado: 'prueba', dia: 6, vista: true })).toBe(false)
  })

  it('la marca es por uid, se copia en SQLite y se va al borrar la cuenta', () => {
    marcarTarjeta('u1')
    olvidarSesionDeTarjetas()
    expect(tarjetaVista('u1')).toBe(true)
    expect(tarjetaVista('u2')).toBe(false)
    expect(esClaveDelTelefono('strivo.tarjetaDePrueba.u1')).toBe(true)
    expect(quitarTodasLasClaves()).toBe(1)
    expect(tarjetaVista('u1')).toBe(false)
  })

  it('a la vista se queda hasta tocarla o cerrar la app, aunque Hoy se vuelva a montar', () => {
    marcarTarjeta('u1')
    expect(tarjetaVista('u1')).toBe(false)
    descartarTarjeta('u1')
    expect(tarjetaVista('u1')).toBe(true)
    olvidarSesionDeTarjetas()
    expect(tarjetaVista('u1')).toBe(true)
  })

  it('no se marca mientras el umbral la tapa', () => {
    const fuente = readFileSync('src/components/suscripcion/TarjetaDePrueba.jsx', 'utf8')
    expect(fuente).toContain('if (visible && libre) marcarTarjeta(uid)')
  })

  it('el diagnóstico puede olvidarla', () => {
    marcarTarjeta('u1')
    olvidarTarjeta('u1')
    expect(tarjetaVista('u1')).toBe(false)
  })
})
