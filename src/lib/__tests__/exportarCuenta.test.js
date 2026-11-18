// SPEC_24A — Llevarme lo que escribí.
//
// Lo que se comprueba aquí es lo que la fundadora no puede ver en la hoja de
// compartir: qué entra en el archivo, qué no entra nunca, en qué orden, con qué
// pregunta delante y con qué rótulo, y que el texto llega tal cual.

import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { UID, resetLocalDB } from '../db/__tests__/helpers.js'
import { leerTodoDelUid, writePath } from '../db/local.js'
import { copy } from '@copy'
import { ANIMO, INTENCION } from '@/diario/mananaEmociones'
import { CIERRE } from '@/diario/nocheEmociones'
import { BANCO as PAUSAS } from '@/diario/mananaPausa'
import { ARCHIVOS, FORMATO, VERSION, escaparMd, nombreDeArchivo } from '@lib/exportar/archivo'
import { comprimir } from '@lib/exportar/comprimir'
import { asegurarCompleto, construirArchivos, pidePuerta, repartir } from '@/exportarCuenta'

const OTRO_UID = 'otra-persona'
const AHORA = new Date(2026, 10, 15, 22, 14, 3)

const dia = copy.diario.historial.dia
const manana = copy.diario.manana
const noche = copy.diario.noche

async function poner(uid, ruta, data) {
  await writePath({
    uid,
    path: `users/${uid}/${ruta}`,
    collection: ruta,
    id: null,
    data,
    sync: false,
  })
}

async function sembrarCuentaCompleta() {
  await poner(UID, 'shared/profile', {
    name: 'Alejandra',
    gender: 'f',
    identidadCentral: null,
    diaTerminaA: '03:00',
    wakeTime: '07:00',
    sleepTime: '23:00',
    createdAt: '2026-08-01T10:00:00-06:00',
  })
  await poner(UID, 'shared/auth', { uid: UID, email: 'ana@ejemplo.com', phone: null })
  await poner(UID, 'shared/onboarding', {
    version: 4,
    completedSteps: ['p1'],
    currentStep: 'p8',
    completedAt: '2026-08-01T10:05:00-06:00',
    motivos: ['paz', 'otro'],
    motivoOtro: 'un rato para mí',
  })
  await poner(UID, 'shared/frases', { modo: 'guiadas', afinidades: ['estoicismo'], version: 1 })

  // Una mañana y una noche de hoy (versión 2), con un journal.
  await poner(UID, 'diario/morningEntry/items/2026-11-14', {
    version: 2,
    feelings: [ANIMO.IDS[0], 'otra'],
    feelingOther: 'con frío',
    intentions: [INTENCION.IDS[0]],
    gratitude: ['  El café de mi mamá.  ', 'Que dormí seis horas\naunque me desperté dos veces.'],
    action: 'Salir a caminar.',
    reflectionId: PAUSAS[0].id,
    reflection: 'Respirar antes de contestar.',
  })
  await poner(UID, 'diario/nightRitual/items/2026-11-14', {
    version: 2,
    recognized: ['Que pedí ayuda.'],
    // Sin `reflectionId`: su pregunta no se puede reconstruir.
    reflection: 'Que la calma llegó tarde.',
    closingFeelings: [CIERRE.IDS[0]],
  })
  await poner(UID, 'diario/journal/items/j1', {
    date: '2026-11-14',
    text: '# No es un título\n\nCon *asteriscos* y <b>etiquetas</b>.',
    emotions: ['triste', 'otra'],
    otherText: 'nostalgia',
    createdAt: '2026-11-14T21:40:00-06:00',
    updatedAt: '2026-11-14T21:40:00-06:00',
  })

  // Un día de la versión 1, anterior.
  await poner(UID, 'diario/morningEntry/items/2026-08-19', {
    emotions: ['en_paz'],
    granVision: 'Un día lento.',
  })
  await poner(UID, 'diario/nightRitual/items/2026-08-19', {
    gratitude: ['La lluvia.'],
    learning: 'Que no tengo que contestar todo hoy.',
    sleepState: ['cansado', 'otro'],
    sleepStateOther: 'pensativa',
  })

  // Respiración.
  await poner(UID, 'breathing/unica', { clave: 'unica', visualPreferida: 'circulo' })
  await poner(UID, 'breathing/favoritos/items/f1', {
    nombre: 'Para dormir',
    patronBaseId: 'calma-553',
    visual: 'circulo',
    sonidoAmbienteId: 'silencio',
    duracion: { modo: 'minutos', valor: 5 },
    creadoEn: '2026-09-01T10:00:00Z',
    usos: 12,
  })
  await poner(UID, 'breathing/sesiones/items/s1', {
    iniciadaEn: '2026-09-02T10:00:00Z',
    ciclosCompletados: 3,
    segundosActivos: 39,
  })

  // Lo que nunca sale.
  await poner(UID, 'diario/pinConfig', {
    salt: 'SAL-SECRETA',
    hash: 'HASH-SECRETO',
    iterations: 1,
    algorithm: 'x',
    enabled: true,
  })
  await poner(UID, 'diario/frasesDelDia/items/2026-11-14~h', {
    phraseId: 'F-1',
    fecha: '2026-11-14',
  })
  await poner(UID, 'diario/dayState/items/2026-11-14', { mood: 'en_paz' })

  // Algo de una época que el exportador no conoce.
  await poner(UID, 'diario/antiguo/items/x', { texto: 'de antes' })

  // Y lo de otra persona en el mismo teléfono.
  await poner(OTRO_UID, 'shared/profile', { name: 'Otra' })
}

beforeEach(async () => {
  await resetLocalDB()
})

// ─── Qué se lee ──────────────────────────────────────────────────────────────

describe('leer el almacén de un uid', () => {
  it('leerTodoDelUid devuelve todas sus filas y ninguna de otro uid', async () => {
    await sembrarCuentaCompleta()
    const filas = await leerTodoDelUid(UID)
    expect(filas.length).toBeGreaterThan(10)
    expect(filas.every((f) => f.path.startsWith(`users/${UID}/`))).toBe(true)
  })

  it('repartir deja fuera pinConfig, frasesDelDia y dayState, y guarda lo desconocido en otros', async () => {
    await sembrarCuentaCompleta()
    const r = repartir(UID, await leerTodoDelUid(UID), { conJournal: true })
    expect(r.mananas.map((m) => m.fecha).sort()).toEqual(['2026-08-19', '2026-11-14'])
    expect(r.journal).toHaveLength(1)
    expect(r.otros).toEqual([{ ruta: 'diario/antiguo/items/x', datos: { texto: 'de antes' } }])
    expect(JSON.stringify(r)).not.toMatch(/SAL-SECRETA|HASH-SECRETO|F-1|"mood"/)
  })

  it('sin la puerta del journal, el journal no se lee siquiera', async () => {
    await sembrarCuentaCompleta()
    const r = repartir(UID, await leerTodoDelUid(UID), { conJournal: false })
    expect(r.journal).toEqual([])
    expect(JSON.stringify(r)).not.toMatch(/No es un título/)
  })
})

// ─── El .md ──────────────────────────────────────────────────────────────────

describe('entradas.md', () => {
  async function md() {
    await sembrarCuentaCompleta()
    return (await construirArchivos(UID, { ahora: AHORA })).md
  }

  it('abre con el título y el nombre, y «Tú» con la pregunta de P3', async () => {
    const texto = await md()
    expect(texto.startsWith(`# ${copy.cuenta.exportar.archivo.titulo}`)).toBe(true)
    expect(texto).toMatch(/Alejandra · exportado el 15 de noviembre de 2026/)
    expect(texto).toMatch(/## Tú/)
    expect(texto).toMatch(
      /\*\*¿Qué te gustaría encontrar aquí\?\*\*\nTerminar el día con más paz · «un rato para mí»/,
    )
    expect(texto).toMatch(/Quiero elegir referencias espirituales · Estoicismo/)
  })

  it('los días van en orden cronológico, del más antiguo al más reciente', async () => {
    const texto = await md()
    expect(texto.indexOf('19 de agosto de 2026')).toBeGreaterThan(0)
    expect(texto.indexOf('19 de agosto de 2026')).toBeLessThan(
      texto.indexOf('14 de noviembre de 2026'),
    )
  })

  it('cada respuesta lleva su pregunta delante', async () => {
    const texto = await md()
    expect(texto).toMatch(new RegExp(`\\*\\*${escapar(manana.animo.titulo)}\\*\\*\\n`))
    expect(texto).toMatch(
      new RegExp(`\\*\\*${escapar(manana.gratitud.titulo)}\\*\\*\\n1\\. El café de mi mamá\\.`),
    )
    expect(texto).toMatch(
      new RegExp(`\\*\\*${escapar(manana.accion.titulo)}\\*\\*\\nSalir a caminar\\.`),
    )
    expect(texto).toMatch(
      new RegExp(`\\*\\*${escapar(PAUSAS[0].titulo)}\\*\\*\\nRespirar antes de contestar\\.`),
    )
    expect(texto).toMatch(new RegExp(`\\*\\*${escapar(noche.emocion.titulo)}\\*\\*\\n`))
  })

  it('las emociones van con su rótulo en el género de la persona, y la palabra propia entre comillas', async () => {
    const texto = await md()
    const femenino = ANIMO.etiquetaDe(ANIMO.IDS[0], 'f')
    expect(texto).toMatch(new RegExp(`${escapar(femenino)} · «con frío»`))
  })

  it('una lista conserva su número y sus saltos de línea, con la continuación sangrada', async () => {
    const texto = await md()
    expect(texto).toMatch(/2\. Que dormí seis horas {2}\n {3}aunque me desperté dos veces\./)
  })

  it('una reflexión sin pregunta reconstruible no se pierde: sale con el rótulo del Historial', async () => {
    const texto = await md()
    expect(texto).toMatch(
      new RegExp(`\\*\\*${escapar(dia.reflexion)}\\*\\*\\nQue la calma llegó tarde\\.`),
    )
  })

  it('los días de la versión 1 se leen con sus rótulos propios', async () => {
    const texto = await md()
    expect(texto).toMatch(new RegExp(`\\*\\*${escapar(dia.emociones)}\\*\\*\\nEn paz`))
    expect(texto).toMatch(new RegExp(`\\*\\*${escapar(dia.granVision)}\\*\\*\\nUn día lento\\.`))
    expect(texto).toMatch(new RegExp(`\\*\\*${escapar(dia.gratitud)}\\*\\*\\n1\\. La lluvia\\.`))
    expect(texto).toMatch(new RegExp(`\\*\\*${escapar(dia.aprendizaje)}\\*\\*\\nQue no tengo`))
    expect(texto).toMatch(/Te fuiste a dormir: Cansada · «pensativa»/)
  })

  it('el journal va dentro de su día, con la hora, las emociones y el texto escapado', async () => {
    const texto = await md()
    const desde = texto.indexOf('14 de noviembre de 2026')
    const journal = texto.indexOf(`### ${dia.journal}`)
    expect(journal).toBeGreaterThan(desde)
    expect(texto).toMatch(
      /\*\*21:40\*\* · Triste · «nostalgia»\n\\# No es un título\n\nCon \\\*asteriscos\\\* y \\<b>etiquetas\\<\/b>\./,
    )
  })

  it('Respiración va al final y solo con las combinaciones guardadas: sin sesiones ni recuentos', async () => {
    const texto = await md()
    const respiracion = texto.indexOf('## Respiración')
    expect(respiracion).toBeGreaterThan(texto.indexOf('14 de noviembre de 2026'))
    expect(texto).toMatch(/- \*\*Para dormir\*\* · Calma 5-5-3 · Unos 5 minutos/)
    expect(texto).not.toMatch(/\b12\b|39|ciclos/)
  })

  it('nunca lleva el PIN, las asignaciones de frases ni el uid', async () => {
    const texto = await md()
    expect(texto).not.toMatch(/SAL-SECRETA|HASH-SECRETO|pinConfig|F-1|de antes/)
    expect(texto).not.toContain(UID)
  })
})

// ─── El .json ────────────────────────────────────────────────────────────────

/** El esquema de la versión 1 (§5bis del reporte previo), comprobado a mano. */
function validarEsquema(doc) {
  const errores = []
  const tipo = (valor, esperado, donde) => {
    const real = valor === null ? 'null' : Array.isArray(valor) ? 'array' : typeof valor
    if (!esperado.split('|').includes(real))
      errores.push(`${donde}: ${real}, se esperaba ${esperado}`)
  }
  tipo(doc.formato, 'string', 'formato')
  tipo(doc.version, 'number', 'version')
  tipo(doc.exportadoEn, 'string', 'exportadoEn')
  tipo(doc.completo, 'boolean', 'completo')
  tipo(doc.persona, 'object', 'persona')
  tipo(doc.persona.nombre, 'string|null', 'persona.nombre')
  tipo(doc.persona.motivos, 'array', 'persona.motivos')
  tipo(doc.dias, 'array', 'dias')
  for (const [i, d] of doc.dias.entries()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) errores.push(`dias[${i}].fecha`)
    tipo(d.manana, 'object|null', `dias[${i}].manana`)
    tipo(d.noche, 'object|null', `dias[${i}].noche`)
    tipo(d.journal, 'array', `dias[${i}].journal`)
    for (const parte of [d.manana, d.noche].filter(Boolean)) {
      tipo(parte.registro, 'object', 'registro')
      for (const b of parte.bloques) {
        tipo(b.id, 'string', 'bloque.id')
        if (!('pregunta' in b)) errores.push('bloque sin pregunta')
        if (!Array.isArray(b.respuestas) && !Array.isArray(b.emociones))
          errores.push('bloque vacío')
        for (const e of b.emociones ?? []) {
          tipo(e.id, 'string', 'emocion.id')
          tipo(e.rotulo, 'string|null', 'emocion.rotulo')
        }
      }
    }
  }
  tipo(doc.respiracion, 'object', 'respiracion')
  tipo(doc.respiracion.favoritos, 'array', 'respiracion.favoritos')
  tipo(doc.respiracion.sesiones, 'array', 'respiracion.sesiones')
  tipo(doc.otros, 'array', 'otros')
  return errores
}

describe('entradas.json', () => {
  async function json() {
    await sembrarCuentaCompleta()
    return JSON.parse((await construirArchivos(UID, { ahora: AHORA })).json)
  }

  it('lleva formato, versión y valida contra el esquema de la versión 1', async () => {
    const doc = await json()
    expect(doc.formato).toBe(FORMATO)
    expect(doc.formato).toBe('strivo.exportacion')
    expect(doc.version).toBe(VERSION)
    expect(doc.version).toBe(1)
    expect(validarEsquema(doc)).toEqual([])
  })

  it('el registro va tal cual: el texto exacto, sin recortar, con los campos de versiones anteriores', async () => {
    const doc = await json()
    const hoy = doc.dias.find((d) => d.fecha === '2026-11-14')
    expect(hoy.manana.registro.gratitude[0]).toBe('  El café de mi mamá.  ')
    const viejo = doc.dias.find((d) => d.fecha === '2026-08-19')
    expect(viejo.manana.registro.granVision).toBe('Un día lento.')
    expect(viejo.noche.registro.sleepState).toEqual(['cansado', 'otro'])
  })

  it('cada identificador lleva su rótulo al lado', async () => {
    const doc = await json()
    const hoy = doc.dias.find((d) => d.fecha === '2026-11-14')
    const animo = hoy.manana.bloques.find((b) => b.id === 'animo')
    expect(animo.emociones[0]).toEqual({
      id: ANIMO.IDS[0],
      rotulo: ANIMO.etiquetaDe(ANIMO.IDS[0], 'f'),
    })
    expect(animo.emociones[1]).toEqual({ id: 'otra', rotulo: '«con frío»' })
    expect(doc.persona.genero).toEqual({ id: 'f', rotulo: 'Femenino' })
    expect(doc.persona.motivos[0]).toEqual({ id: 'paz', rotulo: 'Terminar el día con más paz' })
    expect(doc.respiracion.favoritos[0].rotulos.patron).toBe('Calma 5-5-3')
  })

  it('las sesiones y los recuentos de Respiración sí van en el .json', async () => {
    const doc = await json()
    expect(doc.respiracion.sesiones[0].ciclosCompletados).toBe(3)
    expect(doc.respiracion.favoritos[0].usos).toBe(12)
  })

  it('el correo sí, el uid nunca, y nada del PIN ni de las asignaciones', async () => {
    const doc = await json()
    expect(doc.persona.correo).toBe('ana@ejemplo.com')
    const texto = JSON.stringify(doc)
    expect(texto).not.toContain(UID)
    expect(texto).not.toMatch(
      /SAL-SECRETA|HASH-SECRETO|pinConfig|frasesDelDia|"salt"|"hash"|F-1|"mood"/,
    )
    expect(texto).not.toContain('Otra')
  })

  it('lo que el exportador no conoce va en otros, tal cual', async () => {
    const doc = await json()
    expect(doc.otros).toEqual([{ ruta: 'diario/antiguo/items/x', datos: { texto: 'de antes' } }])
  })

  it('completo dice si la cuenta había terminado de bajar', async () => {
    await sembrarCuentaCompleta()
    const { json: incompleto } = await construirArchivos(UID, { completo: false, ahora: AHORA })
    expect(JSON.parse(incompleto).completo).toBe(false)
  })
})

// ─── Sin entradas, el nombre y el zip ────────────────────────────────────────

describe('el archivo', () => {
  it('sin entradas: el archivo tiene el perfil y la pantalla lo dice', async () => {
    await poner(UID, 'shared/profile', { name: 'Ana', gender: 'n' })
    const r = await construirArchivos(UID, { ahora: AHORA })
    expect(r.sinEntradas).toBe(true)
    expect(JSON.parse(r.json).dias).toEqual([])
    expect(JSON.parse(r.json).persona.nombre).toBe('Ana')
    expect(copy.cuenta.exportar.sinEntradas).toBe(
      'Todavía no hay entradas. El archivo tendrá solo tu perfil.',
    )
  })

  it('sin nada en absoluto también sale un archivo', async () => {
    const r = await construirArchivos(UID, { ahora: AHORA })
    expect(r.sinEntradas).toBe(true)
    expect(r.nombre).toBe('strivo-2026-11-15.zip')
  })

  it('el nombre va sin acentos, en minúsculas y con guiones; sin nombre, solo la fecha', () => {
    expect(nombreDeArchivo('José Ángel', '2026-11-15')).toBe('strivo-jose-angel-2026-11-15.zip')
    expect(nombreDeArchivo('  María  de la Luz ', '2026-11-15')).toBe(
      'strivo-maria-de-la-luz-2026-11-15.zip',
    )
    expect(nombreDeArchivo(null, '2026-11-15')).toBe('strivo-2026-11-15.zip')
    expect(nombreDeArchivo('🌙', '2026-11-15')).toBe('strivo-2026-11-15.zip')
    expect(nombreDeArchivo('Ana/../x', '2026-11-15')).toBe('strivo-anax-2026-11-15.zip')
  })

  it('el zip lleva entradas.md y entradas.json, y se descomprime igual', async () => {
    await sembrarCuentaCompleta()
    const { md, json } = await construirArchivos(UID, { ahora: AHORA })
    const bytes = await comprimir({ [ARCHIVOS.md]: md, [ARCHIVOS.json]: json }, { fecha: AHORA })
    const dentro = unzipSync(bytes)
    expect(Object.keys(dentro).sort()).toEqual(['entradas.json', 'entradas.md'])
    expect(strFromU8(dentro['entradas.md'])).toBe(md)
    expect(strFromU8(dentro['entradas.json'])).toBe(json)
  })

  it('criterio 3: nada del zip lleva el PIN, las asignaciones, la cola ni las claves del teléfono', async () => {
    await sembrarCuentaCompleta()
    const { md, json } = await construirArchivos(UID, { ahora: AHORA })
    const dentro = unzipSync(await comprimir({ [ARCHIVOS.md]: md, [ARCHIVOS.json]: json }))
    const todo = Object.values(dentro).map(strFromU8).join('\n')
    expect(todo).not.toMatch(
      /SAL-SECRETA|HASH-SECRETO|pinConfig|frasesDelDia|syncQueue|strivo\.uid|strivo\.restaurado/,
    )
  })

  it('criterio 5: 2.000 días se preparan en menos de 5 s (10 s en CI)', async () => {
    const filas = []
    const base = new Date(2021, 0, 1)
    for (let i = 0; i < 2000; i += 1) {
      const fecha = new Date(base.getTime() + i * 86400000)
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
      filas.push({
        path: `users/${UID}/diario/morningEntry/items/${clave}`,
        data: {
          feelings: [ANIMO.IDS[1]],
          gratitude: ['Una cosa que agradezco, escrita con calma.', 'Otra más.'],
          action: 'Salir a caminar antes de abrir la computadora.',
        },
      })
      filas.push({
        path: `users/${UID}/diario/nightRitual/items/${clave}`,
        data: { recognized: ['Que pedí ayuda.'], closingFeelings: [CIERRE.IDS[2]] },
      })
    }
    const inicio = performance.now()
    const { md, json } = await construirArchivos(UID, { filas, ahora: AHORA })
    await comprimir({ [ARCHIVOS.md]: md, [ARCHIVOS.json]: json })
    const ms = performance.now() - inicio
    expect(ms).toBeLessThan(process.env.CI ? 10000 : 5000)
    expect(md.match(/^## /gm).length).toBe(2000)
  }, 20000)
})

// ─── Escapar sin romper ──────────────────────────────────────────────────────

describe('escaparMd', () => {
  it('escapa lo que convertiría una línea en estructura', () => {
    expect(escaparMd('# título')).toBe('\\# título')
    expect(escaparMd('> cita')).toBe('\\> cita')
    expect(escaparMd('- punto')).toBe('\\- punto')
    expect(escaparMd('+ punto')).toBe('\\+ punto')
    expect(escaparMd('1. uno')).toBe('1\\. uno')
    expect(escaparMd('---')).toBe('\\---')
    expect(escaparMd('===')).toBe('\\===')
  })

  it('escapa lo que daría formato en cualquier sitio', () => {
    expect(escaparMd('a *b* _c_ `d` <e> [f] \\g')).toBe(
      'a \\*b\\* \\_c\\_ \\`d\\` \\<e> \\[f\\] \\\\g',
    )
  })

  it('no toca lo que no hace falta', () => {
    expect(escaparMd('Hoy fue un buen día: 3 cosas, «café» y 100 %.')).toBe(
      'Hoy fue un buen día: 3 cosas, «café» y 100 %.',
    )
  })

  it('conserva cada salto de línea y cada párrafo', () => {
    expect(escaparMd('uno\ndos\n\ntres')).toBe('uno  \ndos\n\ntres')
    expect(escaparMd('a\r\nb')).toBe('a  \nb')
  })
})

// ─── Sin red, sin cuenta y con PIN ───────────────────────────────────────────

describe('cuándo está completo y cuándo pide la puerta', () => {
  it('sin cuenta siempre está completo y no intenta bajar nada', async () => {
    expect(await asegurarCompleto(UID, { conCuenta: false, enLinea: () => true })).toBe(true)
  })

  it('criterio 4: sin red, con cuenta sin bajar, se exporta igual y dice que puede faltar algo', async () => {
    expect(await asegurarCompleto(UID, { conCuenta: true, enLinea: () => false })).toBe(false)
    await sembrarCuentaCompleta()
    const r = await construirArchivos(UID, { completo: false, ahora: AHORA })
    expect(r.md.length).toBeGreaterThan(0)
  })

  it('criterio 4: con el PIN activo pide la puerta; sin él, no', async () => {
    expect(await pidePuerta(UID)).toBe(false)
    await poner(UID, 'diario/pinConfig', {
      salt: 's',
      hash: 'h',
      iterations: 1,
      algorithm: 'x',
      enabled: true,
    })
    expect(await pidePuerta(UID)).toBe(true)
  })
})

// ─── Quién importa qué (criterio 16) ─────────────────────────────────────────

function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) return nombre === '__tests__' ? [] : archivosDe(ruta)
    return /\.(js|jsx)$/.test(nombre) ? [ruta] : []
  })
}

describe('criterio 16: cada dependencia nueva, un solo archivo y bajo demanda', () => {
  const importadoresDe = (paquete) =>
    archivosDe('src').filter((ruta) =>
      new RegExp(`['"]${paquete.replace('/', '\\/')}['"]`).test(readFileSync(ruta, 'utf8')),
    )

  it.each([
    ['fflate', join('src', 'lib', 'exportar', 'comprimir.js')],
    ['@capacitor/share', join('src', 'lib', 'exportar', 'entregarNativo.js')],
  ])('%s', (paquete, unico) => {
    expect(importadoresDe(paquete)).toEqual([unico])
    const fuente = readFileSync(unico, 'utf8')
    expect(fuente).toMatch(new RegExp(`await import\\('${paquete.replace('/', '\\/')}'\\)`))
    expect(fuente).not.toMatch(new RegExp(`^import .*${paquete.replace('/', '\\/')}`, 'm'))
  })

  it('App.jsx carga la exportación bajo demanda, no al arrancar', () => {
    const app = readFileSync('src/App.jsx', 'utf8')
    expect(app).toMatch(/import\('\.\/exportarCuenta\.js'\)/)
    expect(app).not.toMatch(/^import .*exportarCuenta/m)
  })
})

function escapar(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
