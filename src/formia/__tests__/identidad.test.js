// src/formia/__tests__/identidad.test.js
// Criterios de aceptación de SPEC_03 que se pueden comprobar sin pintar nada.
// Los dos que faltan —entrar y salir sin completar nada, y que el tope se
// explique con calidez— viven en la pantalla y se verifican a mano.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'

import { formia } from '@/lib/db'
import { UID, resetLocalDB } from '../../lib/db/__tests__/helpers.js'
import {
  areasEnMarcha,
  areasElegidas,
  areasPausadas,
  cargarIdentidad,
  conPrefijoCentral,
  elegirArea,
  guardarCentral,
  guardarIdentidadArea,
  listarAreas,
  pausarArea,
  quedaSitio,
  quitarArea,
  reanudarArea,
  resolverCentral,
  resolverIdentidadArea,
  sinPrefijoCentral,
  versionesRecientes,
} from '../identidad.js'

const CENTRAL = 'alguien que crece'

async function arbolNuevo() {
  await formia.initFormia(UID, { identityCentral: CENTRAL })
}

beforeEach(async () => {
  await resetLocalDB()
})

describe('texto de la identidad central', () => {
  it('separa el prefijo de lo que la persona escribió', () => {
    expect(sinPrefijoCentral('alguien que crece')).toBe('crece')
    expect(sinPrefijoCentral('Alguien que  se respeta')).toBe('se respeta')
    expect(conPrefijoCentral('crece')).toBe('alguien que crece')
  })

  it('no duplica el prefijo si ya venía escrito', () => {
    expect(conPrefijoCentral('alguien que crece')).toBe('alguien que crece')
  })

  it('RN-ID-01: un campo vacío conserva la identidad que ya había', () => {
    expect(resolverCentral('   ', CENTRAL)).toEqual({
      central: CENTRAL,
      guardar: false,
      restaurada: true,
    })
  })

  it('un texto idéntico al vigente no abre versión nueva', () => {
    expect(resolverCentral('crece', CENTRAL).guardar).toBe(false)
  })

  it('RN-ID-03: la identidad de área en blanco es una respuesta válida', () => {
    expect(resolverIdentidadArea('  ')).toBeNull()
    expect(resolverIdentidadArea(' cuida su cuerpo ')).toBe('cuida su cuerpo')
  })
})

describe('criterio 2 — la central se ve aunque no haya áreas', () => {
  it('un usuario con cero áreas elegidas tiene identidad igual', async () => {
    await arbolNuevo()
    const estado = await cargarIdentidad(UID)

    expect(estado.central).toBe(CENTRAL)
    expect(areasElegidas(estado.areas)).toHaveLength(0)
    expect(listarAreas(estado.areas)).toHaveLength(7)
  })
})

describe('criterio 3 — editar la central cierra la versión anterior', () => {
  it('deja la anterior con su fecha de fin y la nueva abierta', async () => {
    await arbolNuevo()
    const { estado } = await guardarCentral(UID, 'se respeta', CENTRAL)

    expect(estado.central).toBe('alguien que se respeta')

    const versiones = versionesRecientes(estado.history)
    expect(versiones).toHaveLength(2)

    const vigente = versiones.find((version) => version.to === null)
    expect(vigente.text).toBe('alguien que se respeta')

    const cerrada = versiones.find((version) => version.text === CENTRAL)
    expect(cerrada.to).not.toBeNull()
  })

  it('vaciar el campo no escribe ni añade versión', async () => {
    await arbolNuevo()
    const { estado, restaurada } = await guardarCentral(UID, '', CENTRAL)

    expect(restaurada).toBe(true)
    expect(estado.central).toBe(CENTRAL)
    expect(estado.history).toHaveLength(1)
  })
})

describe('criterio 4 — el tope de tres áreas', () => {
  it('la cuarta no se escribe y se devuelve el tope, no un error', async () => {
    await arbolNuevo()
    let estado = (await elegirArea(UID, 'salud', null)).estado
    estado = (await elegirArea(UID, 'trabajo', estado.areas)).estado
    estado = (await elegirArea(UID, 'relaciones', estado.areas)).estado

    expect(quedaSitio(estado.areas)).toBe(false)

    const cuarta = await elegirArea(UID, 'finanzas', estado.areas)

    expect(cuarta.tope).toBe(true)
    expect(areasElegidas(cuarta.estado.areas).map((area) => area.id)).toEqual([
      'salud',
      'trabajo',
      'relaciones',
    ])
    expect(cuarta.estado.areas.finanzas.selected).toBe(false)
  })

  it('quitar una deja sitio para otra', async () => {
    await arbolNuevo()
    let estado = (await elegirArea(UID, 'salud', null)).estado
    estado = (await elegirArea(UID, 'trabajo', estado.areas)).estado
    estado = (await elegirArea(UID, 'relaciones', estado.areas)).estado
    estado = (await quitarArea(UID, 'trabajo')).estado

    const cuarta = await elegirArea(UID, 'finanzas', estado.areas)
    expect(cuarta.tope).toBe(false)
    expect(cuarta.estado.areas.finanzas.selected).toBe(true)
  })
})

describe('criterio 5 — pausar y reanudar sin perder nada', () => {
  it('RN-ID-04: pausar la saca de la vista activa y conserva sus datos', async () => {
    await arbolNuevo()
    let estado = (await elegirArea(UID, 'salud', null)).estado
    estado = (await guardarIdentidadArea(UID, 'salud', 'cuida su cuerpo')).estado

    estado = (await pausarArea(UID, 'salud')).estado
    expect(areasEnMarcha(estado.areas)).toHaveLength(0)
    expect(areasPausadas(estado.areas).map((area) => area.id)).toEqual(['salud'])
    expect(estado.areas.salud.identityText).toBe('cuida su cuerpo')
    expect(estado.areas.salud.selected).toBe(true)

    estado = (await reanudarArea(UID, 'salud')).estado
    expect(areasEnMarcha(estado.areas).map((area) => area.id)).toEqual(['salud'])
    expect(estado.areas.salud.identityText).toBe('cuida su cuerpo')
  })

  it('RN-04: quitar un área solo cambia lo que se muestra', async () => {
    await arbolNuevo()
    await elegirArea(UID, 'salud', null)
    await guardarIdentidadArea(UID, 'salud', 'cuida su cuerpo')
    await pausarArea(UID, 'salud')

    const { estado } = await quitarArea(UID, 'salud')

    expect(estado.areas.salud.selected).toBe(false)
    expect(estado.areas.salud.identityText).toBe('cuida su cuerpo')
    // El estado tampoco se toca: vuelve como se dejó (RN-DB4-08).
    expect(estado.areas.salud.state).toBe('pausada')
  })
})

describe('criterio 6 — un área sin identidad propia funciona con normalidad', () => {
  it('se elige, se ve y se pausa sin haberle puesto palabras', async () => {
    await arbolNuevo()
    let estado = (await elegirArea(UID, 'creatividad', null)).estado

    expect(estado.areas.creatividad.identityText).toBeNull()
    expect(areasEnMarcha(estado.areas).map((area) => area.id)).toEqual(['creatividad'])

    estado = (await pausarArea(UID, 'creatividad')).estado
    expect(areasPausadas(estado.areas)).toHaveLength(1)
  })

  it('borrar la identidad de área la devuelve a opcional, no a un error', async () => {
    await arbolNuevo()
    await elegirArea(UID, 'salud', null)
    await guardarIdentidadArea(UID, 'salud', 'cuida su cuerpo')

    const { estado } = await guardarIdentidadArea(UID, 'salud', '')
    expect(estado.areas.salud.identityText).toBeNull()
    expect(estado.areas.salud.selected).toBe(true)
  })
})

describe('criterio 7 — RN-DB4-01', () => {
  const RAICES = ['src/formia', 'src/pages/formia', 'src/components/formia']

  function archivos(dir) {
    return readdirSync(dir).flatMap((nombre) => {
      const ruta = join(dir, nombre)
      if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : archivos(ruta)
      return /\.jsx?$/.test(nombre) ? [ruta] : []
    })
  }

  it('ningún archivo del espacio importa nada de lumia', () => {
    const conLumia = RAICES.flatMap(archivos).filter((ruta) =>
      /^\s*import[\s\S]*?from\s+['"][^'"]*lumia[^'"]*['"]/m.test(readFileSync(ruta, 'utf8')),
    )
    expect(conLumia).toEqual([])
  })
})
