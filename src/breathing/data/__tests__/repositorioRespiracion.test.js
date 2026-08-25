// src/breathing/data/__tests__/repositorioRespiracion.test.js
// La capa de datos de Respiración (SPEC_13 §8). Criterios 13, 14, 15, 16 y 21.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as diario from '@lib/db/diario'
import * as local from '@lib/db/local'
import { UID, resetLocalDB } from '@lib/db/__tests__/helpers.js'

import { patronDe, patronDeLado } from '../catalogoPatrones.js'
import { MAX_RECIENTES, rutas } from '../esquema.js'
import * as repo from '../repositorioRespiracion.js'

beforeEach(async () => {
  repo.reiniciarRespaldoEnMemoria()
  await resetLocalDB()
})

const configuracion = (extra = {}) => ({
  patron: patronDe('coherencia'),
  patronBaseId: 'coherencia',
  visual: 'circulo',
  sonidoAmbienteId: null,
  duracion: { modo: 'minutos', valor: 3 },
  ...extra,
})

describe('criterio 13 — preferencias sobre una base vacía', () => {
  it('siembra las de fábrica y las devuelve', async () => {
    const prefs = await repo.leerPreferencias(UID)
    expect(prefs.ultimoPatronId).toBe('calma-553')
    expect(prefs.visualPreferida).toBe('circulo')
    expect(prefs.duracionPorDefecto).toEqual({ modo: 'minutos', valor: 3 })
    expect(prefs.avisoSeguridadVisto).toBe(false)
  })

  it('RN-RE-DAT-01: la guía sonora arranca apagada, sin excepción', async () => {
    const prefs = await repo.leerPreferencias(UID)
    expect(prefs.guiaSonoraActiva).toBe(false)
    expect(prefs.sonidoAmbienteId).toBeNull()
  })

  it('ni siquiera se puede sembrar encendida por accidente', async () => {
    // Es el error que SPEC_08 encontró en `initShared`. Aquí no puede repetirse:
    // el valor entra por el normalizador, no por la semilla.
    const prefs = await repo.guardarPreferencias(UID, { guiaSonoraActiva: 'sí' })
    expect(prefs.guiaSonoraActiva).toBe(false)
  })

  it('lo sembrado queda escrito: la segunda lectura no vuelve a sembrar', async () => {
    await repo.leerPreferencias(UID)
    await repo.guardarPreferencias(UID, { visualPreferida: 'linea' })
    expect((await repo.leerPreferencias(UID)).visualPreferida).toBe('linea')
  })

  it('RN-RE-DAT-02: retoma la configuración de la última sesión', async () => {
    await repo.guardarPreferencias(UID, {
      ultimoPatronId: 'cuatro-siete-ocho',
      ultimoPatron: patronDe('cuatro-siete-ocho'),
    })
    const prefs = await repo.leerPreferencias(UID)
    expect(prefs.ultimoPatronId).toBe('cuatro-siete-ocho')
    expect(prefs.ultimoPatron).toEqual(patronDe('cuatro-siete-ocho'))
  })

  it('RN-RE-DAT-08: un valor imposible se corrige, no rompe', async () => {
    const prefs = await repo.guardarPreferencias(UID, {
      volumenAmbiente: 40,
      volumenGuia: -3,
      visualPreferida: 'holograma',
      duracionPorDefecto: { modo: 'siglos', valor: 2 },
      ultimoPatron: { inhalar: 0 },
    })
    expect(prefs.volumenAmbiente).toBe(1)
    expect(prefs.volumenGuia).toBe(0)
    expect(prefs.visualPreferida).toBe('circulo')
    expect(prefs.duracionPorDefecto).toEqual({ modo: 'minutos', valor: 3 })
    expect(prefs.ultimoPatron.inhalar).toBeGreaterThan(0)
  })

  it('un patrón editado deja de llevar el nombre de su preset', async () => {
    const prefs = await repo.guardarPreferencias(UID, {
      ultimoPatronId: 'coherencia',
      ultimoPatron: { ...patronDe('coherencia'), exhalar: 65 },
    })
    expect(prefs.ultimoPatronId).toBe('personalizado')
  })
})

describe('favoritos (§8.3)', () => {
  it('se crean con id y con sus dos fechas', async () => {
    const favorito = await repo.crearFavorito(UID, {
      nombre: 'Antes de dormir',
      patron: patronDe('cuatro-siete-ocho'),
      patronBaseId: 'cuatro-siete-ocho',
      duracion: { modo: 'minutos', valor: 10 },
    })
    expect(favorito.id).toBeTruthy()
    expect(favorito.nombre).toBe('Antes de dormir')
    expect(favorito.creadoEn).toBeTruthy()
    expect(favorito.usos).toBe(0)
    expect(favorito.ultimoUsoEn).toBeNull()
  })

  it('el nombre se recorta a 40 caracteres en el campo, no al leerlo', async () => {
    const favorito = await repo.crearFavorito(UID, { nombre: 'a'.repeat(80) })
    expect(favorito.nombre).toHaveLength(40)
  })

  it('se listan con el usado más recientemente primero', async () => {
    const uno = await repo.crearFavorito(UID, { nombre: 'Uno' })
    const dos = await repo.crearFavorito(UID, { nombre: 'Dos' })
    await repo.registrarUsoFavorito(UID, dos.id)

    const lista = await repo.listarFavoritos(UID)
    expect(lista.map((f) => f.id)).toEqual([dos.id, uno.id])
  })

  it('registrar un uso suma uno y fecha', async () => {
    const favorito = await repo.crearFavorito(UID, { nombre: 'Uno' })
    await repo.registrarUsoFavorito(UID, favorito.id)
    const usado = await repo.registrarUsoFavorito(UID, favorito.id)
    expect(usado.usos).toBe(2)
    expect(usado.ultimoUsoEn).toBeTruthy()
  })

  it('actualizar conserva lo que no se toca', async () => {
    const favorito = await repo.crearFavorito(UID, {
      nombre: 'Uno',
      patron: patronDe('caja'),
      patronBaseId: 'caja',
    })
    const cambiado = await repo.actualizarFavorito(UID, favorito.id, { nombre: 'Otro' })
    expect(cambiado.nombre).toBe('Otro')
    expect(cambiado.patron).toEqual(patronDe('caja'))
    expect(cambiado.creadoEn).toBe(favorito.creadoEn)
  })

  it('eliminar lo saca de la lista', async () => {
    const favorito = await repo.crearFavorito(UID, { nombre: 'Uno' })
    await repo.eliminarFavorito(UID, favorito.id)
    expect(await repo.listarFavoritos(UID)).toEqual([])
  })

  it('operar sobre un favorito que no existe devuelve null, no un error', async () => {
    expect(await repo.actualizarFavorito(UID, 'no-existe', { nombre: 'x' })).toBeNull()
    expect(await repo.registrarUsoFavorito(UID, 'no-existe')).toBeNull()
    await expect(repo.eliminarFavorito(UID, 'no-existe')).resolves.toBeUndefined()
  })

  it('sin favoritos, la lista está vacía y no lanza', async () => {
    expect(await repo.listarFavoritos(UID)).toEqual([])
  })
})

describe('criterio 14 y RN-RE-DAT-03 — recientes', () => {
  it('nunca pasan de cinco, y se va la más antigua', async () => {
    for (let i = 0; i < 8; i += 1) {
      await repo.registrarReciente(
        UID,
        configuracion({
          patron: patronDeLado(30 + i * 5),
          patronBaseId: 'personalizado',
          usadoEn: `2026-08-0${i + 1}T10:00:00.000Z`,
        }),
      )
    }

    const recientes = await repo.listarRecientes(UID)
    expect(recientes).toHaveLength(MAX_RECIENTES)
    expect(recientes[0].usadoEn).toBe('2026-08-08T10:00:00.000Z')
    expect(recientes.at(-1).usadoEn).toBe('2026-08-04T10:00:00.000Z')
  })

  it('RN-RE-DAT-04: repetir una configuración mueve la fecha, no duplica', async () => {
    await repo.registrarReciente(UID, configuracion({ usadoEn: '2026-08-01T10:00:00.000Z' }))
    await repo.registrarReciente(UID, configuracion({ usadoEn: '2026-08-05T10:00:00.000Z' }))

    const recientes = await repo.listarRecientes(UID)
    expect(recientes).toHaveLength(1)
    expect(recientes[0].usadoEn).toBe('2026-08-05T10:00:00.000Z')
  })

  it('cambiar la visual sí la hace otra configuración', async () => {
    await repo.registrarReciente(UID, configuracion({ visual: 'circulo' }))
    await repo.registrarReciente(UID, configuracion({ visual: 'linea' }))
    expect(await repo.listarRecientes(UID)).toHaveLength(2)
  })

  it('criterio 15 y RN-RE-DAT-05: lo que ya está en favoritos no entra', async () => {
    await repo.crearFavorito(UID, {
      nombre: 'La mía',
      patron: patronDe('coherencia'),
      patronBaseId: 'coherencia',
      visual: 'circulo',
    })

    const resultado = await repo.registrarReciente(UID, configuracion())

    expect(resultado).toBeNull()
    expect(await repo.listarRecientes(UID)).toEqual([])
  })

  it('una configuración distinta de la favorita sí entra', async () => {
    await repo.crearFavorito(UID, {
      nombre: 'La mía',
      patron: patronDe('coherencia'),
      patronBaseId: 'coherencia',
      visual: 'circulo',
    })
    const resultado = await repo.registrarReciente(
      UID,
      configuracion({ patron: patronDe('caja'), patronBaseId: 'caja' }),
    )
    expect(resultado).not.toBeNull()
  })
})

describe('sesiones (§8.5)', () => {
  it('se registra una sesión con ciclos completados', async () => {
    const sesion = await repo.registrarSesion(UID, {
      iniciadaEn: '2026-08-20T08:00:00.000Z',
      patronBaseId: 'coherencia',
      patron: patronDe('coherencia'),
      ciclosCompletados: 12,
      segundosActivos: 120,
      terminadaPorPersona: false,
    })
    expect(sesion.id).toBeTruthy()
    expect(sesion.ciclosCompletados).toBe(12)
    expect(await repo.listarSesiones(UID)).toHaveLength(1)
  })

  it('caso 9.7: una sesión de cero ciclos no se registra', async () => {
    const sesion = await repo.registrarSesion(UID, { ciclosCompletados: 0 })
    expect(sesion).toBeNull()
    expect(await repo.listarSesiones(UID)).toEqual([])
  })

  it('RN-RE-DAT-06: se purga lo que pasa de 90 días', async () => {
    const ahora = new Date('2026-08-20T00:00:00.000Z')
    const dias = (n) => new Date(ahora.getTime() - n * 86_400_000).toISOString()

    for (const antiguedad of [10, 60, 89, 91, 200]) {
      await repo.registrarSesion(UID, {
        iniciadaEn: dias(antiguedad),
        patronBaseId: 'coherencia',
        patron: patronDe('coherencia'),
        ciclosCompletados: 3,
      })
    }

    expect(await repo.purgarSesionesViejas(UID, ahora)).toBe(2)
    expect(await repo.listarSesiones(UID)).toHaveLength(3)
  })

  it('purgar una base sin sesiones devuelve cero', async () => {
    expect(await repo.purgarSesionesViejas(UID)).toBe(0)
  })

  it('RN-RE-DAT-07: el registro no guarda nada de lo que derivar una racha', async () => {
    const sesion = await repo.registrarSesion(UID, {
      patronBaseId: 'coherencia',
      patron: patronDe('coherencia'),
      ciclosCompletados: 3,
    })
    expect(Object.keys(sesion).sort()).toEqual([
      'ciclosCompletados',
      'id',
      'iniciadaEn',
      'patronBaseId',
      'segundosActivos',
      'terminadaPorPersona',
    ])
  })
})

describe('criterio 16 — nada de lo que ya había se toca', () => {
  it('los datos del diario siguen intactos tras usar Respiración', async () => {
    // **Revisión del paso 8 (25 ago):** comprobaba las dos ramas del árbol y
    // ahora comprueba la que queda. La regla de fondo —Respiración no toca lo
    // que no es suyo— no cambia; lo que cambia es cuánto hay que no sea suyo.
    await diario.saveMorningEntry(UID, '2026-08-20', {
      action: 'Salir a caminar',
      gratitude: ['el café'],
      feeling: 'calma',
    })
    const entrada = await diario.createJournalEntry(UID, {
      date: '2026-08-20',
      text: 'Hoy escribí esto.',
    })

    // Respiración escribe en sus cuatro colecciones.
    await repo.leerPreferencias(UID)
    await repo.crearFavorito(UID, { nombre: 'La mía' })
    await repo.registrarReciente(UID, configuracion())
    await repo.registrarSesion(UID, {
      patronBaseId: 'coherencia',
      patron: patronDe('coherencia'),
      ciclosCompletados: 4,
    })

    expect(await diario.getMorningEntry(UID, '2026-08-20')).toMatchObject({
      action: 'Salir a caminar',
      gratitude: ['el café'],
    })
    expect((await diario.listJournalEntries(UID)).map((e) => e.id)).toEqual([entrada.id])
  })

  it('no hace falta subir la versión del esquema: no hay stores nuevos', async () => {
    const db = await local.getLocalDB()
    expect(db.version).toBe(1)
    expect([...db.objectStoreNames].sort()).toEqual(['records', 'syncQueue'])
  })

  it('las rutas de breathing tienen un número par de segmentos, como el resto', () => {
    expect(rutas.doc(UID, 'unica').split('/')).toHaveLength(4)
    expect(rutas.item(UID, 'favoritos', 'abc').split('/')).toHaveLength(6)
  })

  it('el modelo canónico de §C5 sigue teniendo tres raíces, no cuatro', async () => {
    // Es lo que comprueba el criterio 9 de SPEC_08 desde el otro lado: la
    // respiración de Lumia no se registra, y `breathing/` no entra ahí porque no
    // es Lumia. Sus rutas viven en `breathing/data/esquema.js`.
    const schema = await import('@lib/db/schema')
    expect(JSON.stringify(schema.COLLECTIONS)).not.toMatch(/breath/i)
    expect(Object.keys(schema.paths).some((clave) => /breath/i.test(clave))).toBe(false)
  })

  it('lo escrito sale hacia Firestore por la cola de siempre', async () => {
    await repo.leerPreferencias(UID)
    const cola = await local.listQueue(UID)
    expect(cola.some((entrada) => entrada.path.includes('/breathing/'))).toBe(true)
  })
})

describe('criterio 21 y caso 9.8 — sin almacén persistente', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    repo.reiniciarRespaldoEnMemoria()
  })

  it('todo opera en memoria y nada se bloquea', async () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(local, 'readPath').mockRejectedValue(new Error('sin-indexeddb'))
    vi.spyOn(local, 'readCollection').mockRejectedValue(new Error('sin-indexeddb'))
    vi.spyOn(local, 'writePath').mockRejectedValue(new Error('sin-indexeddb'))
    vi.spyOn(local, 'deletePath').mockRejectedValue(new Error('sin-indexeddb'))

    const prefs = await repo.leerPreferencias(UID)
    expect(prefs.guiaSonoraActiva).toBe(false)

    await repo.guardarPreferencias(UID, { visualPreferida: 'linea' })
    expect((await repo.leerPreferencias(UID)).visualPreferida).toBe('linea')

    const favorito = await repo.crearFavorito(UID, { nombre: 'En memoria' })
    expect((await repo.listarFavoritos(UID)).map((f) => f.nombre)).toEqual(['En memoria'])

    await repo.registrarReciente(UID, configuracion())
    expect(await repo.listarRecientes(UID)).toHaveLength(1)

    await repo.eliminarFavorito(UID, favorito.id)
    expect(await repo.listarFavoritos(UID)).toEqual([])

    expect(repo.estaEnMemoria()).toBe(true)
    expect(aviso).toHaveBeenCalledTimes(1) // se avisa una sola vez, sin alarmismo
  })

  it('mientras el almacén responde, no se degrada', async () => {
    await repo.leerPreferencias(UID)
    expect(repo.estaEnMemoria()).toBe(false)
  })
})
