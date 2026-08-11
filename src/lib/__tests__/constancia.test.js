// src/lib/__tests__/constancia.test.js
// Criterio 6 de SPEC_05: `constancia.js` se prueba **sin montar componentes**.
// Aquí no hay React, ni DOM, ni base de datos: entran registros, sale un número.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import {
  DIAS_VENTANA_EVIDENCIA,
  MINIMO_DIAS_CON_EVIDENCIA,
  constanciaDe,
  constanciaDeIdentidad,
  constanciaTotal,
  evidenciaDeIdentidad,
  logsDeIdentidad,
  progresoPorIdentidad,
  ultimasFechas,
} from '../constancia.js'

const HOY = '2026-08-10'

const HABITOS = [
  { id: 'h1', name: 'Estirar', identityRef: 'salud', createdAt: '2026-01-01' },
  { id: 'h2', name: 'Caminar', identityRef: 'salud', createdAt: '2026-01-02', state: 'pausado' },
  { id: 'h3', name: 'Leer', identityRef: 'central', createdAt: '2026-01-03' },
]

const AREAS = {
  salud: { selected: true, color: '#7E9E86', order: 0 },
  trabajo: { selected: true, color: '#93A9C4', order: 1 },
}

/** Logs para `habitId` en los `n` días anteriores a hoy, uno por día. */
function logsDeDias(habitId, n, hasta = HOY) {
  return ultimasFechas(n, hasta).map((date) => ({ habitId, date, completedAt: `${date}T08:00:00` }))
}

describe('criterio 1 — cinco marcas en un día suman 1', () => {
  it('la constancia cuenta fechas distintas, no registros', () => {
    const logs = [
      { habitId: 'h1', date: HOY },
      { habitId: 'h1', date: HOY },
      { habitId: 'h1', date: HOY },
      { habitId: 'h1', date: HOY },
      { habitId: 'h1', date: HOY },
    ]
    expect(constanciaDe(logs, 'h1')).toBe(1)
    expect(constanciaTotal(logs)).toBe(1)
  })
})

describe('criterio 2 — dejar de marcar no reduce ningún número', () => {
  it('una semana sin marcar deja la constancia donde estaba', () => {
    const logs = logsDeDias('h1', 5, '2026-08-01')

    const antes = constanciaDe(logs, 'h1')
    // Pasa una semana entera sin un solo registro nuevo.
    const despues = constanciaDe(logs, 'h1')

    expect(antes).toBe(5)
    expect(despues).toBe(5)
    // Y el total tampoco se mueve al cambiar el día de referencia: no hay
    // ventana que caduque ni nada que se reinicie (RN-06).
    expect(constanciaTotal(logs)).toBe(5)
  })

  it('pausar un hábito no le quita lo que ya hizo', () => {
    const logs = logsDeDias('h2', 4)
    expect(constanciaDe(logs, 'h2')).toBe(4)

    const identidades = progresoPorIdentidad(HABITOS, logs, AREAS, HOY)
    const salud = identidades.find((identidad) => identidad.identityRef === 'salud')
    const pausado = salud.habitos.find((habito) => habito.id === 'h2')

    expect(pausado.total).toBe(4)
    expect(salud.dias).toBe(4)
  })
})

describe('criterio 4 — el umbral del insight es una constante nombrada', () => {
  it('las dos constantes existen y son conservadoras', () => {
    expect(MINIMO_DIAS_CON_EVIDENCIA).toBe(10)
    expect(DIAS_VENTANA_EVIDENCIA).toBe(28)
  })

  it('por debajo del mínimo no se genera nada', () => {
    const logs = logsDeDias('h1', MINIMO_DIAS_CON_EVIDENCIA - 1)
    expect(evidenciaDeIdentidad(logs, HABITOS, 'salud', HOY)).toBeNull()
  })

  it('justo en el mínimo aparece, y cita los días que la sostienen', () => {
    const logs = logsDeDias('h1', MINIMO_DIAS_CON_EVIDENCIA)
    const evidencia = evidenciaDeIdentidad(logs, HABITOS, 'salud', HOY)

    expect(evidencia.dias).toBe(MINIMO_DIAS_CON_EVIDENCIA)
    expect(evidencia.ventana).toBe(DIAS_VENTANA_EVIDENCIA)
    // RN-SI-03 — La evidencia es citable: son fechas reales, no un número suelto.
    expect(evidencia.fechas).toHaveLength(MINIMO_DIAS_CON_EVIDENCIA)
    expect(evidencia.fechas[evidencia.fechas.length - 1]).toBe(HOY)
  })

  it('los días fuera de la ventana no cuentan para la frase', () => {
    const viejos = logsDeDias('h1', 12, '2026-05-01')
    expect(evidenciaDeIdentidad(viejos, HABITOS, 'salud', HOY)).toBeNull()
    // Pero siguen contando para la constancia: eso nunca se pierde (RN-06).
    expect(constanciaDe(viejos, 'h1')).toBe(12)
  })

  it('suma los días de todos los hábitos de la identidad, sin duplicar fechas', () => {
    const logs = [...logsDeDias('h1', 10), ...logsDeDias('h2', 10)]
    const evidencia = evidenciaDeIdentidad(logs, HABITOS, 'salud', HOY)

    expect(logsDeIdentidad(logs, HABITOS, 'salud')).toHaveLength(20)
    expect(evidencia.dias).toBe(10)
  })
})

describe('criterio 5 — una identidad con un solo registro no da ninguna alarma', () => {
  it('se muestra con su día y sin insight, y nada la señala', () => {
    const logs = [{ habitId: 'h1', date: HOY }]
    const identidades = progresoPorIdentidad(HABITOS, logs, AREAS, HOY)
    const salud = identidades.find((identidad) => identidad.identityRef === 'salud')

    expect(salud.dias).toBe(1)
    expect(salud.evidencia).toBeNull()
    // No hay ningún campo que ordene, puntúe o compare: no existe la forma de
    // presentarlo como un problema (RN-05).
    expect(Object.keys(salud)).not.toContain('porcentaje')
    expect(Object.keys(salud)).not.toContain('objetivo')
  })

  it('una identidad con hábitos y cero marcas también se muestra entera', () => {
    const logs = [{ habitId: 'h1', date: HOY }]
    const identidades = progresoPorIdentidad(HABITOS, logs, AREAS, HOY)
    const central = identidades.find((identidad) => identidad.identityRef === 'central')

    // Cero no la esconde ni la manda al final: sigue primera, con su hábito.
    expect(identidades[0].identityRef).toBe('central')
    expect(central.dias).toBe(0)
    expect(central.habitos).toHaveLength(1)
    expect(central.evidencia).toBeNull()
  })
})

describe('el orden de la vista nunca depende de la cantidad', () => {
  it('central primero y después las áreas en su orden de catálogo', () => {
    const habitos = [
      ...HABITOS,
      { id: 'h4', name: 'Revisar prioridades', identityRef: 'trabajo', createdAt: '2026-01-04' },
    ]
    // Trabajo tiene muchísimos más registros que las demás.
    const logs = [...logsDeDias('h4', 20), { habitId: 'h3', date: HOY }]

    const orden = progresoPorIdentidad(habitos, logs, AREAS, HOY).map((i) => i.identityRef)
    expect(orden).toEqual(['central', 'salud', 'trabajo'])
  })

  it('las áreas ya no elegidas van al final, sin perder sus datos', () => {
    const areas = { ...AREAS, salud: { ...AREAS.salud, selected: false } }
    const logs = [{ habitId: 'h1', date: HOY }, { habitId: 'h3', date: HOY }]

    const identidades = progresoPorIdentidad(HABITOS, logs, areas, HOY)
    expect(identidades.map((i) => i.identityRef)).toEqual(['central', 'salud'])

    const salud = identidades.find((i) => i.identityRef === 'salud')
    expect(salud.activa).toBe(false)
    expect(salud.dias).toBe(1)
  })

  it('una identidad sin hábitos no ocupa sitio', () => {
    const identidades = progresoPorIdentidad(HABITOS, [], AREAS, HOY)
    expect(identidades.map((i) => i.identityRef)).toEqual(['central', 'salud'])
  })
})

describe('la constancia por identidad', () => {
  it('cuenta días distintos, no hábitos marcados', () => {
    const logs = [
      { habitId: 'h1', date: '2026-08-09' },
      { habitId: 'h2', date: '2026-08-09' },
      { habitId: 'h1', date: HOY },
    ]
    expect(constanciaDeIdentidad(logs, HABITOS, 'salud')).toBe(2)
    expect(constanciaDeIdentidad(logs, HABITOS, 'central')).toBe(0)
  })
})

describe('criterio 3 — el léxico de la pantalla', () => {
  // SPEC_05 §8 prohíbe estas además del léxico general de §3.6. La prueba se
  // limita a este namespace para no mover la línea base de `lint:copy`.
  const PROHIBIDAS = [
    /\bracha/i, /\bstreak/i, /\bcumpliste/i, /\bmeta\b/i, /\bmetas\b/i,
    /\bobjetivo/i, /\bfallaste/i, /\bincumpl/i, /%/,
  ]

  function textosDe(valor) {
    if (typeof valor === 'string') return [valor]
    if (valor && typeof valor === 'object') return Object.values(valor).flatMap(textosDe)
    return []
  }

  it('ninguna palabra prohibida aparece en formia.progreso', () => {
    const encontradas = textosDe(copy.formia.progreso).filter((texto) =>
      PROHIBIDAS.some((prohibida) => prohibida.test(texto)),
    )
    expect(encontradas).toEqual([])
  })

  it('tampoco hay porcentajes de cumplimiento en la plantilla del insight', () => {
    expect(copy.formia.progreso.evidencia.areaTemplate).toContain('{n} de los últimos {total} días')
  })
})

describe('criterio 7 — RN-DB4-01', () => {
  const RAICES = ['src/formia', 'src/pages/formia', 'src/components/formia']
  const SUELTOS = ['src/lib/constancia.js', 'src/lib/habitAreaLabel.js', 'src/lib/sugerirIdentidad.js']

  function archivos(dir) {
    return readdirSync(dir).flatMap((nombre) => {
      const ruta = join(dir, nombre)
      if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : archivos(ruta)
      return /\.jsx?$/.test(nombre) ? [ruta] : []
    })
  }

  it('ni el espacio de Formia ni sus helpers importan nada de lumia', () => {
    const conLumia = [...RAICES.flatMap(archivos), ...SUELTOS].filter((ruta) =>
      /^\s*import[\s\S]*?from\s+['"][^'"]*lumia[^'"]*['"]/m.test(readFileSync(ruta, 'utf8')),
    )
    expect(conLumia).toEqual([])
  })
})
