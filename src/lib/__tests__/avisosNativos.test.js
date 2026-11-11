// src/lib/__tests__/avisosNativos.test.js
// SPEC_22 — El puente con los avisos del iPhone (criterios 7 y 10), y lo que
// la reconciliación lee de la base (`leerEstado`).

import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'

import { diario, shared } from '@/lib/db'
import { initUserTree } from '@/lib/db/index.js'
import { UID, resetLocalDB } from '@/lib/db/__tests__/helpers.js'
import { aTiempo } from './dobleDeCapacitor.js'
import { PERMISO, crearPuente } from '../avisosNativos.js'
import { leerEstado } from '../avisos/reconciliar.js'
import { telefonoDeMentira } from '../avisos/__tests__/telefonoDeMentira.js'

const TOQUE = (momento, extra = { strivo: true, momento, fecha: '2026-11-11' }) => ({
  actionId: 'tap',
  notification: { id: 1, title: '', body: 'x', extra },
})

describe('el plugin nunca sale suelto de una promesa (SPEC_21.2)', () => {
  it('cada llamada contesta, con el plugin como Proxy de Capacitor', async () => {
    const { puente } = telefonoDeMentira()
    await aTiempo(puente.permiso())
    await aTiempo(puente.pendientes())
    await aTiempo(puente.escucharToques(() => {}))
  })
})

describe('el permiso', () => {
  it('se traduce a los tres estados de P6', async () => {
    for (const [display, esperado] of [
      ['granted', PERMISO.concedido],
      ['denied', PERMISO.denegado],
      ['prompt', PERMISO.sinPedir],
    ]) {
      expect(await telefonoDeMentira({ permiso: display }).puente.permiso()).toBe(esperado)
    }
  })

  it('pedirlo devuelve concedido o denegado', async () => {
    const si = telefonoDeMentira({ permiso: 'prompt', respuesta: 'granted' })
    expect(await si.puente.pedirPermiso()).toBe(PERMISO.concedido)
    const no = telefonoDeMentira({ permiso: 'prompt', respuesta: 'denied' })
    expect(await no.puente.pedirPermiso()).toBe(PERMISO.denegado)
  })

  it('un plugin que falla no rompe nada: nunca lanza', async () => {
    const roto = crearPuente({
      cargar: async () => {
        throw new Error('sin plugin')
      },
    })
    expect(await roto.permiso()).toBe(PERMISO.denegado)
    expect(await roto.pedirPermiso()).toBe(PERMISO.denegado)
    expect(await roto.pendientes()).toBeNull()
    expect(await roto.programar([{ id: 1 }])).toBe(false)
    expect(typeof (await roto.escucharToques(() => {}))).toBe('function')
  })
})

describe('las listas vacías no llaman a nadie', () => {
  it('ni programar, ni cancelar, ni retirar', async () => {
    const { puente, estado } = telefonoDeMentira()
    await puente.programar([])
    await puente.cancelar([])
    await puente.retirarEntregados([])
    expect(estado.llamadas.schedule).toBe(0)
    expect(estado.llamadas.cancel).toBe(0)
  })
})

describe('el toque en un aviso (criterio 7)', () => {
  it('un toque en un aviso de Strivo dice su momento', async () => {
    const { puente, tocar } = telefonoDeMentira()
    const tocados = []
    await puente.escucharToques((m) => tocados.push(m))
    tocar(TOQUE('noche'))
    tocar(TOQUE('manana'))
    expect(tocados).toEqual(['noche', 'manana'])
  })

  it('el toque que llegó antes de escuchar también llega (app cerrada del todo)', async () => {
    const { puente } = telefonoDeMentira({ retenidos: [TOQUE('manana')] })
    const tocados = []
    await puente.escucharToques((m) => tocados.push(m))
    expect(tocados).toEqual(['manana'])
  })

  it('descartar un aviso o tocar uno que no es de Strivo no lleva a ningún sitio', async () => {
    const { puente, tocar } = telefonoDeMentira()
    const tocados = []
    await puente.escucharToques((m) => tocados.push(m))
    tocar({ ...TOQUE('noche'), actionId: 'dismiss' })
    tocar(TOQUE('noche', { momento: 'noche' }))
    expect(tocados).toEqual([])
  })

  it('quien enruta lo lleva a Hoy con el momento del aviso', () => {
    const app = readFileSync('src/App.jsx', 'utf8')
    expect(app).toMatch(
      /useAvisos\(uid, \{ alTocar: \(momento\) => navegar\(`\$\{INICIO\}\?momento=\$\{momento\}`\) \}\)/,
    )
  })
})

/** Todos los .js y .jsx de `src/`, sin las pruebas. */
function fuentes(dir = 'src') {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : fuentes(ruta)
    return /\.jsx?$/.test(nombre) ? [ruta] : []
  })
}

describe('un solo archivo importa el plugin, y bajo demanda (criterio 10)', () => {
  it('solo lib/avisosNativos.js lo nombra', () => {
    const quienes = fuentes().filter((ruta) =>
      readFileSync(ruta, 'utf8').includes('@capacitor/local-notifications'),
    )
    expect(quienes).toEqual([join('src', 'lib', 'avisosNativos.js')])
  })

  it('y solo con import() dinámico, nunca arriba', () => {
    const puente = readFileSync('src/lib/avisosNativos.js', 'utf8')
    expect(puente).toMatch(/await import\('@capacitor\/local-notifications'\)/)
    expect(puente).not.toMatch(/^import .*@capacitor\/local-notifications/m)
  })

  it('la reconciliación tampoco se importa arriba: solo useAvisos y salidaCuenta, bajo demanda', () => {
    const quienes = fuentes().filter((ruta) =>
      /(avisos\/|\.\/)reconciliar(\.js)?['"]/.test(readFileSync(ruta, 'utf8')),
    )
    expect(quienes.sort()).toEqual(
      [join('src', 'lib', 'avisos', 'useAvisos.js'), join('src', 'lib', 'salidaCuenta.js')].sort(),
    )
    for (const ruta of quienes) {
      expect(readFileSync(ruta, 'utf8')).not.toMatch(/^import .*reconciliar/m)
    }
  })

  it('el diario y Tu perfil solo piden: importan pedido.js y nada más de los avisos', () => {
    for (const ruta of fuentes().filter((r) =>
      /src\/(diario|perfil|components\/diario)\//.test(r),
    )) {
      const codigo = readFileSync(ruta, 'utf8')
      expect(`${ruta}: ${codigo}`).not.toMatch(/avisos\/(reconciliar|plan|useAvisos)|avisosNativos/)
    }
  })
})

describe('lo que la reconciliación lee de la persona', () => {
  beforeEach(async () => {
    await resetLocalDB()
    await initUserTree(UID)
  })

  it('las horas, el corte, la preferencia y los momentos cerrados hoy', async () => {
    await shared.updateProfile(UID, { wakeTime: '06:30', sleepTime: '22:15' })
    await shared.updatePreferences(UID, { remindersEnabled: true })
    await diario.saveMorningEntry(UID, '2026-11-11', { completedAt: '2026-11-11T07:10:00' })
    await diario.saveNightRitual(UID, '2026-11-11', { recognized: ['algo'] })

    const estado = await leerEstado(UID, new Date(2026, 10, 11, 12, 0))
    expect(estado).toEqual({
      despertar: '06:30',
      dormir: '22:15',
      diaTerminaA: '00:00',
      encendidos: true,
      // La noche tiene algo escrito pero no está cerrada: solo cuenta completedAt.
      cerrados: [{ fecha: '2026-11-11', momento: 'manana' }],
    })
  })

  it('un árbol recién sembrado no pide avisos', async () => {
    const estado = await leerEstado(UID, new Date(2026, 10, 11, 12, 0))
    expect(estado.encendidos).toBe(false)
    expect(estado.despertar).toBeNull()
  })
})
