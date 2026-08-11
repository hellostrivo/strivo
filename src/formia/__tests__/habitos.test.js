// src/formia/__tests__/habitos.test.js
// Criterios de aceptación de SPEC_04 que se pueden comprobar sin pintar nada.
// El 6 —marcar es un toque, sin modal— vive en la pantalla y se verifica a mano.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'

import { formia } from '@/lib/db'
import { areaLabelForHabit } from '@/lib/habitAreaLabel'
import { areasSenaladas, sugerirIdentidad } from '@/lib/sugerirIdentidad'
import { UID, resetLocalDB } from '../../lib/db/__tests__/helpers.js'
import {
  agruparPorIdentidad,
  alternarMarca,
  cargarHabitos,
  constanciaDe,
  crearHabito,
  cambiarEstado,
  habitosPorEstado,
  marcadosEn,
  progresoPorMomento,
  ultimasFechas,
  ultimosNDias,
} from '../habitos.js'

const CENTRAL = 'alguien que crece'
const HOY = '2026-08-10'

async function arbolCon(areasElegidas = []) {
  await formia.initFormia(UID, { identityCentral: CENTRAL })
  for (const areaId of areasElegidas) {
    await formia.updateArea(UID, areaId, { selected: true })
  }
  return formia.getAreas(UID)
}

beforeEach(async () => {
  await resetLocalDB()
})

describe('criterio 1 — H3 no guarda sin identidad', () => {
  it('la capa de datos rechaza un hábito sin identityRef', async () => {
    await arbolCon()
    await expect(formia.createHabit(UID, { name: 'Beber agua' })).rejects.toMatchObject({
      code: 'HABIT_IDENTITY_REQUIRED',
    })
  })

  it('con identidad, se crea sin más', async () => {
    await arbolCon(['salud'])
    const { estado } = await crearHabito(UID, { name: 'Beber agua', identityRef: 'salud' })
    expect(estado.habits).toHaveLength(1)
    expect(estado.habits[0].identityRef).toBe('salud')
  })
})

describe('criterios 2, 3 y 4 — el motor de sugerencia', () => {
  it('"salir a correr" señala Salud', () => {
    expect(areasSenaladas('salir a correr')).toEqual(['salud'])
    expect(sugerirIdentidad('salir a correr', ['salud', 'trabajo'])).toBe('salud')
  })

  it('reconoce el texto con acentos y mayúsculas', () => {
    expect(sugerirIdentidad('Preparar la REUNIÓN', ['trabajo'])).toBe('trabajo')
  })

  it('"escribir 20 minutos" no señala nada', () => {
    expect(areasSenaladas('escribir 20 minutos')).toEqual([])
    expect(sugerirIdentidad('escribir 20 minutos', ['salud', 'crecimiento'])).toBeNull()
  })

  it('RN-FO-H3-06: nunca propone un área que no está elegida', () => {
    expect(areasSenaladas('salir a correr')).toEqual(['salud'])
    expect(sugerirIdentidad('salir a correr', ['trabajo'])).toBeNull()
    expect(sugerirIdentidad('salir a correr', [])).toBeNull()
  })

  it('dos señales no son una señal clara', () => {
    expect(areasSenaladas('llamar a un cliente')).toEqual(['trabajo', 'relaciones'])
    expect(sugerirIdentidad('llamar a un cliente', ['trabajo', 'relaciones'])).toBeNull()
  })

  it('nunca propone la identidad central: no hay palabra que la signifique', () => {
    const propuestas = ['correr', 'leer', 'ahorrar', 'nada de nada'].map((texto) =>
      sugerirIdentidad(texto, ['salud', 'crecimiento', 'finanzas']),
    )
    expect(propuestas).not.toContain('central')
  })
})

describe('criterio 5 — H1 agrupa por identidad', () => {
  it('central primero, después las áreas elegidas en su orden', async () => {
    const areas = await arbolCon(['trabajo', 'salud'])
    await crearHabito(UID, { name: 'Estirar', identityRef: 'salud' })
    await crearHabito(UID, { name: 'Revisar prioridades', identityRef: 'trabajo' })
    const { estado } = await crearHabito(UID, { name: 'Leer', identityRef: 'central' })

    const grupos = agruparPorIdentidad(estado.habits, areas, CENTRAL)
    expect(grupos.map((grupo) => grupo.key)).toEqual(['central', 'salud', 'trabajo'])
    expect(grupos[0].titulo).toBe('Alguien que crece')
  })

  it('dentro de un grupo, primero mañana, después noche y al final sin momento', async () => {
    const areas = await arbolCon(['salud'])
    await crearHabito(UID, { name: 'Sin momento', identityRef: 'salud', context: null })
    await crearHabito(UID, { name: 'De noche', identityRef: 'salud', context: 'noche' })
    const { estado } = await crearHabito(UID, {
      name: 'De mañana',
      identityRef: 'salud',
      context: 'manana',
    })

    const [grupo] = agruparPorIdentidad(estado.habits, areas, CENTRAL)
    expect(grupo.habitos.map((habito) => habito.name)).toEqual([
      'De mañana',
      'De noche',
      'Sin momento',
    ])
  })
})

describe('criterio 7 — marcar cinco veces el mismo día cuenta una', () => {
  it('el registro es idempotente y desmarcar lo deshace', async () => {
    await arbolCon(['salud'])
    const { estado } = await crearHabito(UID, { name: 'Beber agua', identityRef: 'salud' })
    const habitId = estado.habits[0].id

    for (let i = 0; i < 5; i += 1) {
      await formia.markHabit(UID, habitId, HOY)
    }
    let logs = await formia.listHabitLogs(UID)
    expect(logs).toHaveLength(1)
    expect(constanciaDe(logs, habitId)).toBe(1)

    const despues = await alternarMarca(UID, habitId, HOY, true)
    expect(despues.estado.logs).toHaveLength(0)
  })

  it('RN-06: la constancia cuenta días distintos y solo sube', async () => {
    await arbolCon(['salud'])
    const { estado } = await crearHabito(UID, { name: 'Beber agua', identityRef: 'salud' })
    const habitId = estado.habits[0].id

    await formia.markHabit(UID, habitId, '2026-08-08')
    await formia.markHabit(UID, habitId, '2026-08-09')
    await formia.markHabit(UID, habitId, '2026-08-09')

    const logs = await formia.listHabitLogs(UID)
    expect(constanciaDe(logs, habitId)).toBe(2)
    expect(ultimosNDias(logs, habitId, HOY, 30)).toBe(2)
    expect(marcadosEn(logs, '2026-08-09').has(habitId)).toBe(true)
  })
})

describe('criterio 8 — un hábito de un área quitada sigue ahí', () => {
  it('se muestra en su grupo, marcado como no activo, sin cambiar de identidad', async () => {
    await arbolCon(['salud'])
    await crearHabito(UID, { name: 'Estirar', identityRef: 'salud' })

    await formia.updateArea(UID, 'salud', { selected: false })
    const estado = await cargarHabitos(UID)

    const grupos = agruparPorIdentidad(estado.habits, estado.areas, CENTRAL)
    const grupoSalud = grupos.find((grupo) => grupo.key === 'salud')

    expect(grupoSalud.habitos).toHaveLength(1)
    expect(grupoSalud.activa).toBe(false)
    expect(estado.habits[0].identityRef).toBe('salud')
  })
})

describe('criterio 9 — la etiqueta es el nombre del área, o nada', () => {
  it('un área elegida da nombre y color', async () => {
    const areas = await arbolCon(['salud'])
    expect(areaLabelForHabit({ identityRef: 'salud' }, areas)).toMatchObject({
      areaId: 'salud',
      nombre: 'Salud',
    })
  })

  it('un área que existe pero no está elegida no da nada', async () => {
    const areas = await arbolCon([])
    expect(areaLabelForHabit({ identityRef: 'salud' }, areas)).toBeNull()
  })

  it('la identidad central no produce etiqueta', async () => {
    const areas = await arbolCon(['salud'])
    expect(areaLabelForHabit({ identityRef: 'central' }, areas)).toBeNull()
  })
})

describe('el progreso del momento', () => {
  it('solo aparecen los momentos que tienen hábitos, y se llena al completarlos', async () => {
    await arbolCon(['salud'])
    await crearHabito(UID, { name: 'Beber agua', identityRef: 'salud', context: 'manana' })
    const { estado } = await crearHabito(UID, {
      name: 'Estirar',
      identityRef: 'salud',
      context: 'manana',
    })

    const sinMarcas = progresoPorMomento(estado.habits, new Set())
    expect(sinMarcas).toEqual([{ context: 'manana', total: 2, hechos: 0 }])

    const todos = progresoPorMomento(estado.habits, new Set(estado.habits.map((h) => h.id)))
    expect(todos[0]).toMatchObject({ hechos: 2, total: 2 })
  })
})

describe('RN-HB-02 — pausar y archivar conservan el historial', () => {
  it('el hábito sale de la lista activa con sus registros intactos', async () => {
    await arbolCon(['salud'])
    const creado = await crearHabito(UID, { name: 'Estirar', identityRef: 'salud' })
    const habitId = creado.estado.habits[0].id
    await formia.markHabit(UID, habitId, '2026-08-09')

    const { estado } = await cambiarEstado(UID, habitId, 'pausado')

    expect(agruparPorIdentidad(estado.habits, estado.areas, CENTRAL)).toEqual([])
    expect(habitosPorEstado(estado.habits, 'pausado')).toHaveLength(1)
    expect(constanciaDe(estado.logs, habitId)).toBe(1)

    const reanudado = await cambiarEstado(UID, habitId, 'activo')
    expect(constanciaDe(reanudado.estado.logs, habitId)).toBe(1)
    expect(agruparPorIdentidad(reanudado.estado.habits, reanudado.estado.areas, CENTRAL)).toHaveLength(1)
  })
})

describe('las fechas de la constancia', () => {
  it('van de la más antigua a hoy, y hoy es la última', () => {
    const fechas = ultimasFechas(14, HOY)
    expect(fechas).toHaveLength(14)
    expect(fechas[13]).toBe(HOY)
    expect(fechas[0]).toBe('2026-07-28')
  })
})

describe('criterio 10 — RN-DB4-01', () => {
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
