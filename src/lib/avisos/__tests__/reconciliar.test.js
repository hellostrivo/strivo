// src/lib/avisos/__tests__/reconciliar.test.js
// SPEC_22 — La reconciliación (criterios 3, 4 y 8), contra un iPhone de mentira
// cuyo plugin es un Proxy como el de Capacitor.

import { describe, expect, it } from 'vitest'
import { copy } from '@copy'
import { aTiempo } from '../../__tests__/dobleDeCapacitor.js'
import { avisoParaElTelefono, crearReconciliador } from '../reconciliar.js'
import { idDeAviso, planDeAvisos } from '../plan.js'
import { AJENO, telefonoDeMentira } from './telefonoDeMentira.js'

const AHORA = new Date(2026, 10, 11, 6, 0)

const ESTADO = Object.freeze({
  despertar: '07:00',
  dormir: '23:00',
  diaTerminaA: '00:00',
  encendidos: true,
  cerrados: [],
})

function montar({ telefono = telefonoDeMentira(), estado = ESTADO, iphone = true, ...resto } = {}) {
  const resultados = []
  const reconciliador = crearReconciliador({
    puente: telefono.puente,
    iphone: () => iphone,
    leer: async () => estado,
    reloj: () => AHORA,
    contar: (r) => resultados.push(r),
    olvidar: () => {},
    ...resto,
  })
  reconciliador.activar('uid-1')
  return { telefono, reconciliador, resultados }
}

const deStrivo = (telefono) => telefono.estado.pendientes.filter((p) => p.extra?.strivo === true)

describe('sin permiso concedido no se programa nada, y nunca se pide', () => {
  for (const permiso of ['prompt', 'denied']) {
    it(`con el permiso en «${permiso}»`, async () => {
      const viejo = avisoParaElTelefono(planDeAvisos({ ahora: AHORA, ...ESTADO })[0])
      const telefono = telefonoDeMentira({ permiso, pendientes: [viejo] })
      const { reconciliador, resultados } = montar({ telefono })

      await aTiempo(reconciliador.reconciliar())

      expect(telefono.estado.llamadas.schedule).toBe(0)
      expect(telefono.estado.llamadas.requestPermissions).toBe(0)
      // Lo de Strivo que hubiera se cancela.
      expect(deStrivo(telefono)).toEqual([])
      expect(resultados.at(-1)).toMatchObject({ programados: 0 })
    })
  }
})

describe('con permiso, cancela lo que sobra y programa lo que falta', () => {
  it('desde cero programa la ventana entera, en una sola llamada', async () => {
    const { telefono, reconciliador, resultados } = montar()
    await aTiempo(reconciliador.reconciliar())
    const esperado = planDeAvisos({ ahora: AHORA, ...ESTADO })
    expect(telefono.estado.llamadas.schedule).toBe(1)
    expect(
      deStrivo(telefono)
        .map((p) => p.id)
        .sort(),
    ).toEqual(esperado.map((a) => a.id).sort())
    expect(resultados.at(-1)).toMatchObject({ permiso: 'concedido', programados: esperado.length })
  })

  it('un aviso que ya no toca se cancela', async () => {
    const sobra = {
      ...avisoParaElTelefono({
        id: idDeAviso('2026-11-01', 'manana'),
        momento: 'manana',
        fecha: '2026-11-01',
        on: { year: 2026, month: 11, day: 1, hour: 7, minute: 0 },
      }),
    }
    const telefono = telefonoDeMentira({ pendientes: [sobra] })
    const { reconciliador } = montar({ telefono })
    await aTiempo(reconciliador.reconciliar())
    expect(deStrivo(telefono).some((p) => p.id === sobra.id)).toBe(false)
  })

  it('cambiar la hora reprograma el mismo id a la hora nueva', async () => {
    const { telefono, reconciliador } = montar()
    await aTiempo(reconciliador.reconciliar())
    const otro = montar({ telefono, estado: { ...ESTADO, despertar: '06:30' } })
    await aTiempo(otro.reconciliador.reconciliar())
    const manana = deStrivo(telefono).find((p) => p.id === idDeAviso('2026-11-11', 'manana'))
    expect(manana.schedule.on).toMatchObject({ hour: 6, minute: 30 })
  })

  it('con el interruptor apagado, cancela todos los de Strivo', async () => {
    const { telefono, reconciliador } = montar()
    await aTiempo(reconciliador.reconciliar())
    const apagado = montar({ telefono, estado: { ...ESTADO, encendidos: false } })
    await aTiempo(apagado.reconciliador.reconciliar())
    expect(deStrivo(telefono)).toEqual([])
  })
})

describe('idempotente y de una en una', () => {
  it('dos seguidas no repiten trabajo', async () => {
    const { telefono, reconciliador } = montar()
    await aTiempo(reconciliador.reconciliar())
    const { schedule, cancel } = telefono.estado.llamadas
    await aTiempo(reconciliador.reconciliar())
    expect(telefono.estado.llamadas.schedule).toBe(schedule)
    expect(telefono.estado.llamadas.cancel).toBe(cancel)
  })

  it('dos a la vez pasan de una en una, y varias juntas son como mucho dos vueltas', async () => {
    let enVuelo = 0
    let maximo = 0
    let vueltas = 0
    const leer = async () => {
      enVuelo += 1
      vueltas += 1
      maximo = Math.max(maximo, enVuelo)
      await new Promise((r) => setTimeout(r, 5))
      enVuelo -= 1
      return ESTADO
    }
    const { reconciliador } = montar({ leer })
    await aTiempo(
      Promise.all([
        reconciliador.reconciliar(),
        reconciliador.reconciliar(),
        reconciliador.reconciliar(),
      ]),
    )
    expect(maximo).toBe(1)
    expect(vueltas).toBe(2)
  })
})

describe('solo toca lo de Strivo', () => {
  it('un aviso sin la marca de Strivo se queda donde está', async () => {
    const telefono = telefonoDeMentira({ pendientes: [AJENO] })
    const { reconciliador } = montar({ telefono, estado: { ...ESTADO, encendidos: false } })
    await aTiempo(reconciliador.reconciliar())
    await aTiempo(reconciliador.apagar())
    expect(telefono.estado.pendientes).toEqual([AJENO])
  })
})

describe('al cerrar un momento (criterio 4)', () => {
  it('retira el aviso entregado de ese momento y ese día, y ese día ya no se programa', async () => {
    const cerrado = { fecha: '2026-11-11', momento: 'manana' }
    const { telefono, reconciliador } = montar({
      estado: { ...ESTADO, cerrados: [cerrado] },
    })
    await aTiempo(reconciliador.reconciliar({ cerrado }))
    expect(telefono.estado.entregadosRetirados).toEqual([idDeAviso('2026-11-11', 'manana')])
    expect(deStrivo(telefono).some((p) => p.id === idDeAviso('2026-11-11', 'manana'))).toBe(false)
  })
})

describe('lo que no se sabe no se corrige', () => {
  it('si leer el perfil falla, no se cancela ni se programa nada', async () => {
    const viejo = avisoParaElTelefono(planDeAvisos({ ahora: AHORA, ...ESTADO })[0])
    const telefono = telefonoDeMentira({ pendientes: [viejo] })
    const { reconciliador } = montar({
      telefono,
      leer: async () => {
        throw new Error('sin base')
      },
    })
    expect(await aTiempo(reconciliador.reconciliar())).toBeNull()
    expect(telefono.estado.pendientes).toHaveLength(1)
    expect(telefono.estado.llamadas.schedule).toBe(0)
  })

  it('si no se pueden leer los pendientes, no se toca nada', async () => {
    const telefono = telefonoDeMentira()
    const puente = { ...telefono.puente, pendientes: async () => null }
    const { reconciliador } = montar({ telefono, puente })
    expect(await aTiempo(reconciliador.reconciliar())).toBeNull()
    expect(telefono.estado.llamadas.schedule).toBe(0)
  })
})

describe('fuera de la app de iPhone no hace nada', () => {
  it('ni consulta, ni cancela, ni programa', async () => {
    const { telefono, reconciliador } = montar({ iphone: false })
    expect(await aTiempo(reconciliador.reconciliar())).toBeNull()
    await aTiempo(reconciliador.apagar())
    expect(telefono.estado.llamadas).toEqual({
      schedule: 0,
      requestPermissions: 0,
      cancel: 0,
      getPending: 0,
    })
  })
})

describe('cerrar sesión (criterio 8, DP-22.11)', () => {
  it('cancela todos los de Strivo y nadie vuelve a programar después', async () => {
    const { telefono, reconciliador } = montar()
    await aTiempo(reconciliador.reconciliar())
    await aTiempo(reconciliador.apagar())
    expect(deStrivo(telefono)).toEqual([])
    await aTiempo(reconciliador.reconciliar())
    expect(deStrivo(telefono)).toEqual([])
  })

  it('una vuelta en curso no programa nada después de salir', async () => {
    let soltar
    const lento = new Promise((r) => {
      soltar = r
    })
    const { telefono, reconciliador } = montar({ leer: () => lento })
    const vuelta = reconciliador.reconciliar()
    await new Promise((r) => setTimeout(r, 5))
    const salida = reconciliador.apagar()
    soltar(ESTADO)
    await aTiempo(Promise.all([vuelta, salida]))
    expect(deStrivo(telefono)).toEqual([])
    expect(telefono.estado.llamadas.schedule).toBe(0)
  })
})

describe('el aviso tal como llega a iOS (DP-22.4, DP-22.7)', () => {
  const [item] = planDeAvisos({ ahora: AHORA, ...ESTADO })
  const aviso = avisoParaElTelefono(item)

  it('sin título, con el texto de P6 y la marca de Strivo', () => {
    expect(aviso.title).toBe('')
    expect(aviso.body).toBe(copy.notifications.manana)
    expect(aviso.extra).toEqual({ strivo: true, momento: 'manana', fecha: '2026-11-11' })
  })

  it('con fecha completa en `on`, nunca `at`, nunca insignia', () => {
    expect(aviso.schedule.on).toEqual({ year: 2026, month: 11, day: 11, hour: 7, minute: 0 })
    expect(aviso.schedule.at).toBeUndefined()
    expect(aviso.schedule.repeats).toBeUndefined()
    expect(aviso.badge).toBeUndefined()
  })

  it('la noche lleva el texto de la noche', () => {
    expect(avisoParaElTelefono({ ...item, momento: 'noche' }).body).toBe(copy.notifications.noche)
  })
})

describe('el resultado que se cuenta', () => {
  it('permiso, cuántos hay, el próximo de cada momento y la zona', async () => {
    const { reconciliador, resultados } = montar()
    await aTiempo(reconciliador.reconciliar())
    const r = resultados.at(-1)
    expect(r.permiso).toBe('concedido')
    expect(r.proximos.manana).toEqual(new Date(2026, 10, 11, 7, 0))
    expect(r.proximos.noche).toEqual(new Date(2026, 10, 11, 23, 0))
    expect(typeof r.zona).toBe('string')
  })
})
