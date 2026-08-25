// src/diario/__tests__/pin.test.js
// El PIN del Journal (§5.8.2 · §7.7.1).
//
// Lo que se comprueba aquí es la parte que sí se puede comprobar y es la que
// importa: que el PIN no se guarda, que la verificación funciona, que no puede
// existir sin forma de recuperarlo, que cambiarlo no toca ni una entrada y que
// no sale del dispositivo.

import { beforeEach, describe, expect, it } from 'vitest'

import { UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { diario, shared } from '@/lib/db'
import { listQueue } from '@/lib/db/local.js'
import { copy } from '@copy'
import {
  ALGORITMO,
  ITERACIONES,
  comparaIgual,
  configDe,
  crearPin,
  desactivarPin,
  esPinValido,
  estadoPin,
  metodoDeRecuperacion,
  reautenticar,
  reestablecerPin,
  soloDigitos,
  verificarPin,
  vincularCuenta,
} from '../pin.js'
import { entradaNueva, guardar, listar } from '../journal.js'

/** Una cuenta con correo: sin él no puede existir un PIN (RN-JR-PIN-02). */
async function conCorreo() {
  await shared.saveAuthRecord(UID, { uid: UID, email: 'alguien@ejemplo.com', phone: null })
}

beforeEach(async () => {
  await resetLocalDB()
})

describe('formato del PIN (§5.8.2, criterio 3)', () => {
  it('acepta de cuatro a seis dígitos', () => {
    expect(esPinValido('1234')).toBe(true)
    expect(esPinValido('123456')).toBe(true)
  })

  it('rechaza lo que no sean cuatro a seis dígitos', () => {
    expect(esPinValido('123')).toBe(false)
    expect(esPinValido('1234567')).toBe(false)
    expect(esPinValido('12a4')).toBe(false)
    expect(esPinValido('')).toBe(false)
  })

  it('el campo se queda con los dígitos y nada más', () => {
    expect(soloDigitos('12ab34')).toBe('1234')
    expect(soloDigitos('1234567890')).toBe('123456')
  })
})

describe('almacenamiento: el PIN nunca se guarda (§5.8.2, criterio 4)', () => {
  it('se persisten salt, hash, iteraciones y algoritmo', async () => {
    await conCorreo()
    await crearPin(UID, '1234')
    const config = await diario.getPinConfig(UID)

    expect(config.algorithm).toBe(ALGORITMO)
    expect(config.iterations).toBeGreaterThanOrEqual(150000)
    expect(config.salt).toMatch(/^[0-9a-f]{32}$/)
    expect(config.hash).toMatch(/^[0-9a-f]{64}$/)
    expect(config.enabled).toBe(true)
  })

  it('el PIN en claro no aparece por ningún lado del registro', async () => {
    await conCorreo()
    await crearPin(UID, '482913')
    const config = await diario.getPinConfig(UID)
    expect(JSON.stringify(config)).not.toContain('482913')
  })

  it('el salt es distinto en cada derivación', async () => {
    const uno = await configDe('1234')
    const otro = await configDe('1234')
    expect(uno.salt).not.toBe(otro.salt)
    expect(uno.hash).not.toBe(otro.hash)
  })

  it('la comparación no corta en el primer byte distinto', () => {
    expect(comparaIgual('abcd', 'abcd')).toBe(true)
    expect(comparaIgual('abcd', 'abce')).toBe(false)
    expect(comparaIgual('abcd', 'abc')).toBe(false)
  })
})

describe('`pinConfig` no sale del dispositivo (criterio 8 · RN-DB-04)', () => {
  it('crear un PIN no encola nada hacia Firestore', async () => {
    await conCorreo()
    await crearPin(UID, '1234')
    const cola = await listQueue(UID)
    expect(cola.some((entrada) => entrada.path.includes('pinConfig'))).toBe(false)
  })

  it('retirarlo tampoco', async () => {
    await conCorreo()
    await crearPin(UID, '1234')
    await desactivarPin(UID, '1234')
    const cola = await listQueue(UID)
    expect(cola.some((entrada) => entrada.path.includes('pinConfig'))).toBe(false)
  })
})

describe('bloqueo y desbloqueo (criterio 7)', () => {
  it('el PIN correcto abre y el incorrecto no', async () => {
    await conCorreo()
    await crearPin(UID, '1234')
    expect(await verificarPin(UID, '1234')).toBe(true)
    expect(await verificarPin(UID, '4321')).toBe(false)
  })

  it('sin protección se entra en un toque (criterio 1)', async () => {
    expect(await verificarPin(UID, '')).toBe(true)
    expect((await estadoPin(UID)).activo).toBe(false)
  })

  it('retirarlo exige el PIN vigente', async () => {
    await conCorreo()
    await crearPin(UID, '1234')
    expect(await desactivarPin(UID, '9999')).toEqual({ ok: false, motivo: 'incorrecto' })
    expect((await estadoPin(UID)).activo).toBe(true)

    expect(await desactivarPin(UID, '1234')).toEqual({ ok: true })
    expect(await diario.getPinConfig(UID)).toBeNull()
  })

  it('un PIN derivado con menos iteraciones se rederiva al verificarlo', async () => {
    await conCorreo()
    await diario.savePinConfig(UID, await configDe('1234', 1000))
    expect(await verificarPin(UID, '1234')).toBe(true)

    const config = await diario.getPinConfig(UID)
    expect(config.iterations).toBe(ITERACIONES)
    expect(await verificarPin(UID, '1234')).toBe(true)
  })
})

describe('sin forma de recuperarlo no hay PIN (RN-JR-PIN-02, criterio 6)', () => {
  it('una cuenta sin correo ni teléfono no puede activarlo', async () => {
    expect(await crearPin(UID, '1234')).toEqual({ ok: false, motivo: 'sin-metodo' })
    expect(await diario.getPinConfig(UID)).toBeNull()
    expect((await estadoPin(UID)).puedeActivar).toBe(false)
  })

  it('vincular un correo lo habilita', async () => {
    expect(await metodoDeRecuperacion(UID)).toBeNull()
    await vincularCuenta(UID, { email: 'alguien@ejemplo.com' })
    expect(await metodoDeRecuperacion(UID)).toEqual({
      tipo: 'email',
      valor: 'alguien@ejemplo.com',
    })
    expect((await estadoPin(UID)).puedeActivar).toBe(true)
  })

  it('un teléfono también sirve', async () => {
    await vincularCuenta(UID, { phone: '+525500000000' })
    expect((await metodoDeRecuperacion(UID)).tipo).toBe('phone')
  })

  it('quedarse sin método con PIN activo se avisa, no se corrige solo', async () => {
    await conCorreo()
    await crearPin(UID, '1234')
    await shared.saveAuthRecord(UID, { uid: UID, email: null, phone: null })

    const estado = await estadoPin(UID)
    expect(estado.sinSalida).toBe(true)
    // RN-DB4-08 — Nada se corrige en silencio: el PIN sigue puesto.
    expect(estado.activo).toBe(true)
  })

  it('sin método, la recuperación lo dice antes de intentar nada', async () => {
    expect(await reautenticar(UID)).toEqual({ ok: false, motivo: 'sin-metodo' })
  })
})

describe('"Olvidé mi PIN": ninguna entrada se pierde (criterio 5)', () => {
  it('el PIN nuevo nace con salt nuevo y el journal se queda entero', async () => {
    await conCorreo()
    await guardar(UID, { ...entradaNueva('2026-08-10'), text: 'Algo íntimo' })
    await guardar(UID, { ...entradaNueva('2026-08-09'), emotions: ['triste'] })
    await crearPin(UID, '1234')
    const anterior = await diario.getPinConfig(UID)

    expect(await reestablecerPin(UID, '5678')).toEqual({ ok: true })

    const nueva = await diario.getPinConfig(UID)
    expect(nueva.salt).not.toBe(anterior.salt)
    expect(await verificarPin(UID, '5678')).toBe(true)
    expect(await verificarPin(UID, '1234')).toBe(false)

    const entradas = await listar(UID)
    expect(entradas).toHaveLength(2)
    expect(entradas.map((entrada) => entrada.text)).toContain('Algo íntimo')
  })
})

describe('el copy dice la verdad sobre lo que esto hace (§5.8.2, criterio 7)', () => {
  // §7.8 compromete honestidad literal. Prometer protección del contenido sin
  // protegerlo sería la peor clase de mentira que puede contar un producto de
  // escritura íntima, así que la regla se comprueba aquí y no en el linter
  // global: "Seguro" y "Segura" son dos emociones legítimas del catálogo de la
  // mañana, y prohibir la palabra en todo `src/` rompería el build por un
  // motivo equivocado.
  const PROHIBIDO = /cifrad|encriptad|\bsegur[ao]s?\b|protección total|inviolable/i

  function cadenasDe(nodo, ruta) {
    if (typeof nodo === 'string') return [[ruta, nodo]]
    if (Array.isArray(nodo)) return nodo.flatMap((hijo, i) => cadenasDe(hijo, `${ruta}[${i}]`))
    if (nodo && typeof nodo === 'object') {
      return Object.entries(nodo).flatMap(([clave, hijo]) => cadenasDe(hijo, `${ruta}.${clave}`))
    }
    return []
  }

  const CADENAS = cadenasDe(copy.diario.journal.pin, 'copy.diario.journal.pin')

  it('hay copy que revisar', () => {
    expect(CADENAS.length).toBeGreaterThan(20)
  })

  it('ninguna cadena promete lo que esta funcionalidad no hace', () => {
    CADENAS.forEach(([ruta, texto]) => expect(`${ruta}: ${texto}`).not.toMatch(PROHIBIDO))
  })

  it('el copy autorizado habla de acceso en este dispositivo', () => {
    expect(copy.diario.journal.pin.lead).toMatch(/en este dispositivo/i)
  })
})
