// SPEC_25 — Lo nativo: el plugin, quién lo importa, lo que la web no descarga,
// el diagnóstico y la comprobación de `ios:build` (criterios 11, 13, 14 y D5).

import { execFileSync } from 'child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DIAGNOSTICO,
  DIAGNOSTICO_AVISOS,
  DIAGNOSTICO_BORRADO,
  DIAGNOSTICO_SUSCRIPCION as t,
} from '@copy/diagnostico'
import { EN_SQLITE } from '@/lib/db/__tests__/helpers.js'
import { avisosDeEnlaces, problemasDeCompras, variableDe } from '../../../scripts/comprobar-ios.mjs'
import { desfaseHasta, lineasDeSuscripcion } from '@components/perfil/DiagnosticoSuscripcion'
import {
  anotarEvento,
  eventosDeLaSesion,
  fijarDesfase,
  leerDesfase,
} from '../suscripcion/diagnostico.js'

const PLUGIN = '@revenuecat/purchases-capacitor'
const leer = (ruta) => readFileSync(ruta, 'utf8')
function fuentes(dir = 'src') {
  return readdirSync(dir).flatMap((n) => {
    const ruta = join(dir, n)
    if (statSync(ruta).isDirectory()) return n === '__tests__' ? [] : fuentes(ruta)
    return /\.jsx?$/.test(n) ? [ruta] : []
  })
}

describe('el plugin', () => {
  it('14.1.2, sin rango y por SPM; sin la interfaz de RevenueCat', () => {
    const { dependencies } = JSON.parse(leer('package.json'))
    expect(dependencies[PLUGIN]).toBe('14.1.2')
    expect(Object.keys(dependencies).filter((n) => /purchases.*-ui/.test(n))).toEqual([])
    expect(leer('ios/App/CapApp-SPM/Package.swift')).toContain(
      `.package(name: "RevenuecatPurchasesCapacitor", path: "../../../node_modules/${PLUGIN}")`,
    )
  })

  it('lo importa un solo archivo, bajo demanda y solo en el build nativo', () => {
    expect(fuentes().filter((r) => leer(r).includes(`'${PLUGIN}'`))).toEqual([
      join('src', 'lib', 'compras.js'),
    ])
    expect(leer('src/lib/compras.js')).toMatch(
      /if \(import\.meta\.env\.MODE === 'ios'\) \{\s+const \{ Purchases \} = await import\('@revenuecat\/purchases-capacitor'\)\s+return \{ plugin: Purchases \}/,
    )
  })

  it('no se manda ningún atributo ni se usa la hoja de canje de Apple', () => {
    fuentes().forEach((r) => {
      expect(`${r} ${leer(r)}`).not.toMatch(
        /\.(setAttributes|setEmail|setDisplayName|setPhoneNumber|presentCodeRedemptionSheet|invalidateCustomerInfoCache)\(/,
      )
    })
  })

  it('25A no sincroniza compras (DP-25.18)', () => {
    fuentes().forEach((r) => expect(`${r} ${leer(r)}`).not.toMatch(/\.syncPurchases\(/))
  })

  it('salir y borrar cierran el cliente, en su sitio', () => {
    expect(leer('src/lib/salidaCuenta.js')).toMatch(
      /await cerrarSesion\(\)[\s\S]*await compras\.cerrar\(\)[\s\S]*await borrarUid/,
    )
    expect(leer('src/lib/borrarCuenta.js')).toMatch(
      /await e\.cerrarCompras\(\)\s+await e\.vaciarTelefono\(\)/,
    )
  })

  it('con la sesión vencida no se toca la identidad', () => {
    expect(leer('src/components/suscripcion/ProveedorDeSuscripcion.jsx')).toMatch(
      /if \(sesion === ESTADOS_SESION\.conCuenta\) \{\s+await conTecho\(compras\.identificar\(uid\)/,
    )
  })
})

describe('el diagnóstico, sin su bandera', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('D5: la build limpia nunca lee ni escribe la clave del desfase', () => {
    const espia = { getItem: vi.fn(() => '7'), setItem: vi.fn(), removeItem: vi.fn() }
    vi.stubGlobal('localStorage', espia)
    expect(leerDesfase()).toBe(0)
    fijarDesfase(5)
    anotarEvento('paywall_visto')
    expect(eventosDeLaSesion()).toEqual([])
    expect(espia.getItem).not.toHaveBeenCalled()
    expect(espia.setItem).not.toHaveBeenCalled()
  })

  it('con ella, el desfase sobrevive a cerrar y «hoy» borra la clave', () => {
    vi.stubEnv('VITE_DIAG_SUSCRIPCION', '1')
    const m = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (k) => m.get(k) ?? null,
      setItem: (k, v) => m.set(k, v),
      removeItem: (k) => m.delete(k),
    })
    fijarDesfase(7)
    expect(leerDesfase()).toBe(7)
    fijarDesfase(0)
    expect(leerDesfase()).toBe(0)
    expect(m.size).toBe(0)
  })
})

describe('las líneas', () => {
  const suscripcion = {
    estado: 'prueba',
    hasta: new Date(2026, 11, 6),
    fechaInicioPrueba: '2026-11-30T15:00:00.000Z',
    customerInfo: null,
  }
  it('en su orden, con todo', () => {
    expect(
      lineasDeSuscripcion({
        suscripcion,
        cliente: { anonimo: true, final: 'abc123' },
        planes: {
          anual: {},
          mensual: {},
          fundador: { product: { priceString: 'P' } },
          metadata: { mostrar: true, hasta: '2027-01-15' },
        },
        eventos: ['paywall_visto', 'compra_iniciada (anual)'],
        ahora: new Date(2026, 11, 1),
      }),
    ).toEqual([
      'Hoy: sin simular (día 2)',
      'Tarjeta del día 6: sin ver',
      'Estado: prueba · hasta 2026-12-06',
      'RevenueCat: anónimo · …abc123',
      'completo: no · ninguno',
      'Planes: 3 paquetes · Fundador: sale',
      'Metadata: {"mostrar":true,"hasta":"2027-01-15"}',
      'Inicio de la prueba: 2026-11-30T15:00:00.000Z',
      'Eventos: paywall_visto, compra_iniciada (anual)',
    ])
  })
  it('sin cliente ni planes', () => {
    const l = lineasDeSuscripcion({
      suscripcion,
      cliente: null,
      planes: null,
      eventos: [],
      ahora: new Date(),
    })
    expect(l[3]).toBe('RevenueCat: sin cliente')
    expect(l[5]).toBe('Planes: 0 paquetes · Fundador: no sale')
  })
  it('con el reloj movido, dice qué día cree que es', () => {
    const l = lineasDeSuscripcion({
      suscripcion: { ...suscripcion, desfaseDias: 5 },
      cliente: null,
      planes: null,
      eventos: [],
      ahora: new Date(2026, 10, 30, 12),
      tarjeta: true,
    })
    expect(l[0]).toBe('Hoy simulado: 2026-12-05 (día 6)')
    expect(l[1]).toBe('Tarjeta del día 6: ya vista')
  })
  it('simular día 6 y día 8', () => {
    const datos = {
      fechaInicioPrueba: new Date(2026, 10, 30, 9).toISOString(),
      ahora: new Date(2026, 11, 2, 9),
    }
    expect(desfaseHasta(6, datos)).toBe(3)
    expect(desfaseHasta(8, datos)).toBe(5)
    expect(desfaseHasta(8, { ...datos, fechaInicioPrueba: null })).toBe(0)
  })
})

describe('ios:build', () => {
  it('se detiene sin la clave o con una que no es de iOS', () => {
    expect(problemasDeCompras('appl_abc')).toEqual([])
    for (const clave of [null, '', 'appl_', 'goog_abc', 'sk_abc']) {
      expect(problemasDeCompras(clave)[0]).toMatch(/VITE_REVENUECAT_IOS_KEY/)
    }
  })
  it('avisa, sin detener, si falta la privacidad', () => {
    expect(avisosDeEnlaces("export const URL_PRIVACIDAD = ''")).toHaveLength(1)
    expect(avisosDeEnlaces("export const URL_PRIVACIDAD = 'https://x'")).toEqual([])
  })
  it('lee la variable de .env.local', () => {
    expect(variableDe('A=1\nVITE_REVENUECAT_IOS_KEY="appl_x"\n', 'VITE_REVENUECAT_IOS_KEY')).toBe(
      'appl_x',
    )
    expect(variableDe('', 'X')).toBeNull()
  })
})

describe('lo que se construye', () => {
  function construir(banderas = {}, modo = []) {
    const salida = mkdtempSync(join(tmpdir(), 'strivo-25-'))
    try {
      const entorno = { ...process.env, ...banderas }
      for (const n of ['ALMACEN', 'AVISOS', 'AUDIO', 'BORRADO', 'SUSCRIPCION']) {
        if (!(`VITE_DIAG_${n}` in banderas)) delete entorno[`VITE_DIAG_${n}`]
      }
      execFileSync('npx', ['vite', 'build', ...modo, '--outDir', salida, '--logLevel', 'error'], {
        env: entorno,
        stdio: 'pipe',
      })
      return readdirSync(join(salida, 'assets'))
        .filter((n) => n.endsWith('.js'))
        .map((n) => readFileSync(join(salida, 'assets', n), 'utf8'))
    } finally {
      rmSync(salida, { recursive: true, force: true })
    }
  }
  const DEL_PLUGIN = /redeemWebPurchase|mock-web-user-id/

  it.skipIf(EN_SQLITE)(
    'la web: ni un byte del plugin ni del diagnóstico',
    () => {
      const todo = construir().join('\n')
      expect(todo).toContain('Strivo, completo')
      expect(todo).not.toMatch(DEL_PLUGIN)
      expect(todo).not.toContain(t.desplegar)
      expect(todo).not.toContain(t.dia6)
      expect(todo).not.toContain('strivo.diag.suscripcion')
    },
    180000,
  )

  it.skipIf(EN_SQLITE)(
    'el iPhone limpio: el plugin sí, en su trozo, y sin diagnóstico',
    () => {
      const trozos = construir({}, ['--mode', 'ios'])
      const principal = [...trozos].sort((a, b) => b.length - a.length)[0]
      expect(trozos.some((js) => DEL_PLUGIN.test(js))).toBe(true)
      expect(principal).toContain('Strivo, completo')
      expect(principal).not.toMatch(DEL_PLUGIN)
      expect(trozos.join('\n')).not.toContain('strivo.diag.suscripcion')
    },
    180000,
  )

  it.skipIf(EN_SQLITE)(
    'con su bandera, lo suyo y no lo de las otras; y al revés',
    () => {
      const mio = construir({ VITE_DIAG_SUSCRIPCION: '1' }).join('\n')
      expect(mio).toContain(t.dia6)
      expect(mio).not.toContain(DIAGNOSTICO.simular)
      expect(mio).not.toContain(DIAGNOSTICO_BORRADO.sembrar)
      expect(mio).not.toContain(DIAGNOSTICO_AVISOS.programados.replace(' {n}', ''))
      expect(construir({ VITE_DIAG_BORRADO: '1' }).join('\n')).not.toContain(t.dia6)
    },
    240000,
  )
})
