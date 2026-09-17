// src/perfil/__tests__/sincronizacion.test.js
// El bloque "Dónde vive lo que escribes" (SPEC_17A §4.6; criterio manual 17,
// aquí su mitad automática).
//
// Lo que decide el estado es `estadoDe`, sin React: se prueba con los tres
// datos delante. Del hook y de la pantalla se comprueba la fuente —que
// sondea y no se suscribe, que no toca `sync.js`, que anuncia con texto—,
// porque no hay DOM en el que montarlos.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { BLOQUES } from '@/perfil/bloques'
import { ESTADOS, estadoDe } from '@/perfil/useSincronizacion'

const textos = copy.diario.perfil.sincronizacion
const CUENTA = 'AbC123firebaseUid'
const LOCAL = 'local-3f2a'

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

describe('el bloque existe entero: identificador, copy y componente', () => {
  it('está declarado, y al final', () => {
    expect(BLOQUES[BLOQUES.length - 1]).toBe('sincronizacion')
  })

  it('su copy es el del §5, cerrado', () => {
    expect(textos).toEqual({
      titulo: 'Dónde vive lo que escribes',
      hint: 'Lo tuyo se guarda aquí primero y se respalda después.',
      alDia: 'Todo guardado',
      pendiente: 'Guardando',
      sinConexion: 'Sin conexión. Se guardará cuando vuelva.',
      sinCuenta: 'Sin cuenta, lo escrito vive solo en este teléfono.',
      reintentar: 'Intentar de nuevo',
    })
    expect(copy.shared.restauracion).toEqual({
      enCurso: 'Recuperando lo que escribiste.',
      error: 'No pudimos recuperar todo ahora. Nada se perdió y lo intentaremos de nuevo.',
      reintentar: 'Intentar de nuevo',
    })
  })

  it('cada estado tiene su texto, y ninguno lleva urgencia ni exclamación', () => {
    ESTADOS.forEach((estado) => {
      expect(typeof textos[estado]).toBe('string')
      expect(textos[estado]).not.toMatch(/!|¡|urgente|ahora mismo|error/i)
    })
  })

  it('la pantalla lo pinta con el marco de siempre y lo anuncia con texto', () => {
    const pantalla = codigoDe('src/components/perfil/Perfil.jsx')
    expect(pantalla).toMatch(/sincronizacion: \(\) =>/)
    expect(pantalla).toMatch(/aria-live="polite"/)
    expect(pantalla).toMatch(/textos\.sincronizacion\[sincronizacion\.estado\]/)
    expect(pantalla).toMatch(/copy\.shared\.restauracion\.error/)
    // Ningún componente nuevo: se pinta dentro de `Bloque`.
    expect(pantalla).not.toMatch(/import .*Sincronizacion.* from '@components/)
  })
})

describe('estadoDe: cuatro estados y una prioridad', () => {
  it('sin cuenta manda sobre todo lo demás', () => {
    const r = estadoDe({
      uid: LOCAL,
      enLinea: false,
      pendientes: 5,
      ultimaRestauracion: { ok: false },
    })
    expect(r.estado).toBe('sinCuenta')
    expect(r.restauracionFallida).toBe(false)
    expect(r.puedeReintentar).toBe(false)
  })

  it('sin conexión, antes que pendiente', () => {
    const r = estadoDe({ uid: CUENTA, enLinea: false, pendientes: 3, ultimaRestauracion: null })
    expect(r.estado).toBe('sinConexion')
    expect(r.puedeReintentar).toBe(false)
  })

  it('pendiente cuando hay algo en la cola y hay red', () => {
    const r = estadoDe({ uid: CUENTA, enLinea: true, pendientes: 2, ultimaRestauracion: null })
    expect(r.estado).toBe('pendiente')
    expect(r.puedeReintentar).toBe(true)
  })

  it('al día cuando no queda nada', () => {
    const r = estadoDe({
      uid: CUENTA,
      enLinea: true,
      pendientes: 0,
      ultimaRestauracion: { ok: true },
    })
    expect(r.estado).toBe('alDia')
    expect(r.puedeReintentar).toBe(false)
    expect(r.restauracionFallida).toBe(false)
  })

  it('una restauración fallida ofrece reintentar aunque la cola esté vacía', () => {
    const r = estadoDe({
      uid: CUENTA,
      enLinea: true,
      pendientes: 0,
      ultimaRestauracion: { ok: false, motivo: 'interrumpida' },
    })
    expect(r.estado).toBe('alDia')
    expect(r.restauracionFallida).toBe(true)
    expect(r.puedeReintentar).toBe(true)
  })

  it('pero no sin red: volver a intentar sin red no es intentar nada', () => {
    const r = estadoDe({
      uid: CUENTA,
      enLinea: false,
      pendientes: 0,
      ultimaRestauracion: { ok: false, motivo: 'sin_red' },
    })
    expect(r.estado).toBe('sinConexion')
    expect(r.puedeReintentar).toBe(false)
  })

  it('sin resultado de restauración en la sesión no hay nada que reintentar', () => {
    const r = estadoDe({ uid: CUENTA, enLinea: true, pendientes: 0, ultimaRestauracion: null })
    expect(r.restauracionFallida).toBe(false)
    expect(r.puedeReintentar).toBe(false)
  })

  it('no devuelve el conteo: la pantalla no dice cuántas esperan (§4.6)', () => {
    const r = estadoDe({ uid: CUENTA, enLinea: true, pendientes: 214, ultimaRestauracion: null })
    expect(r).not.toHaveProperty('pendientes')
    expect(Object.keys(r).sort()).toEqual(['estado', 'puedeReintentar', 'restauracionFallida'])
  })

  it('y la pantalla no pinta ningún número junto al estado', () => {
    const pantalla = codigoDe('src/components/perfil/Perfil.jsx')
    expect(pantalla).not.toMatch(/sincronizacion\.pendientes/)
    expect(pantalla).not.toMatch(/·\s*\{/)
  })

  it('solo devuelve estados que tienen texto', () => {
    const casos = [
      { uid: LOCAL, enLinea: true, pendientes: 0 },
      { uid: CUENTA, enLinea: false, pendientes: 0 },
      { uid: CUENTA, enLinea: true, pendientes: 1 },
      { uid: CUENTA, enLinea: true, pendientes: 0 },
    ]
    casos.forEach((c) =>
      expect(ESTADOS).toContain(estadoDe({ ...c, ultimaRestauracion: null }).estado),
    )
  })
})

describe('el hook sondea y no se suscribe (D11)', () => {
  const hook = codigoDe('src/perfil/useSincronizacion.js')

  it('lee la cola por getPendingCount y no toca sync.js', () => {
    expect(hook).toMatch(/getPendingCount/)
    expect(hook).not.toMatch(/from ['"][^'"]*sync\.js['"]/)
  })

  it('recalcula al montar, al irse y volver la red y al volver la pestaña; sin intervalo', () => {
    expect(hook).toMatch(/addEventListener\('online'/)
    expect(hook).toMatch(/addEventListener\('offline'/)
    expect(hook).toMatch(/addEventListener\('visibilitychange'/)
    expect(hook).not.toMatch(/setInterval|setTimeout/)
  })

  it('retira los oyentes al desmontar', () => {
    expect(hook).toMatch(/removeEventListener\('online'/)
    expect(hook).toMatch(/removeEventListener\('visibilitychange'/)
  })

  it('reintentar vacía la cola y, solo si la última restauración falló, restaura', () => {
    expect(hook).toMatch(/ultimoResultado\(uid\)\?\.ok === false\) await restaurar\(uid\)/)
    expect(hook).toMatch(/await flush\(uid\)/)
  })

  it('usa la regla de cuenta de lib/sesion y no la copia', () => {
    expect(hook).toMatch(/import \{ esUidDeCuenta \} from '@lib\/sesion'/)
    expect(hook).not.toMatch(/'local-'/)
  })
})

describe('sync.js no se modificó (D11, SPEC §2)', () => {
  it('sigue sin emitir nada: ni oyentes propios ni EventTarget', () => {
    const sync = codigoDe('src/lib/db/sync.js')
    expect(sync).not.toMatch(/EventTarget|dispatchEvent|onChange|suscri|subscribe/)
  })
})
