// src/lumia/__tests__/manana.test.js
// Los criterios de aceptación de la actualización del 23 ago a la mañana.
//
// Lo que se comprueba aquí es sobre todo lo que **no** hay: ningún control que
// se deshabilite, ninguna cuenta de campos, ninguna interpretación de lo que
// alguien escribió y ningún mensaje que señale lo que quedó en blanco. El
// riesgo de esta actualización es de diseño, así que queda vigilado por
// `npm test` y no por la memoria de quien lo lea.

import { existsSync, readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { FIELDS } from '@/lib/db/schema'
import {
  LIMITES,
  alSalirDeFila,
  escribirEn,
  filasIniciales,
  puedeAnadir,
  textosDe,
} from '@/lumia/filas'
import {
  MAX_ACCION,
  MAX_GRATITUD_LINEA,
  MAX_REFLEXION,
  MOMENTOS,
  PREGUNTAS,
  VERSION,
  camposOmitidos,
  estaCerrada,
  etiquetaDeAnimo,
  etiquetaDeIntencion,
  hayAlgoEscrito,
  lineasDeCierre,
  marcaLocal,
  resumenDeManana,
} from '@/lumia/manana'
import { ANIMO, INTENCION, ID_OTRA, MAX_PALABRA_PROPIA } from '@/lumia/mananaEmociones'
import { MAX_ANTERIORES, MAX_IDEAS, ideasAnteriores, ideasGenerales } from '@/lumia/mananaAcciones'
import { BANCO, MAXIMO_EN_VENTANA, debeAparecer, siguientePregunta } from '@/lumia/mananaPausa'

const textos = copy.lumia.diario.manana

const codigoDe = (ruta) =>
  readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

const MOMENTO = (nombre) => codigoDe(`src/components/lumia/manana/${nombre}.jsx`)
// `ChipsUnicos`, `Pasos` y `pildora` subieron un nivel el 23 ago: los monta
// también la noche, y un componente que sirve a los dos recorridos no es de
// ninguno de los dos.
const COMPARTIDO = (nombre) => codigoDe(`src/components/lumia/${nombre}`)
const CONTENEDOR = codigoDe('src/components/lumia/DiarioManana.jsx')

// ─── Criterio 1 ───────────────────────────────────────────────────────────────

describe('criterio 1 — las preguntas se leen con su redacción exacta', () => {
  it('los cuatro títulos y sus textos de apoyo', () => {
    expect(textos.animo.titulo).toBe('¿Cómo me siento esta mañana?')
    expect(textos.animo.lead).toBe('Elige lo que más se acerque a cómo estás.')

    expect(textos.intencion.titulo).toBe('¿Cómo me gustaría sentirme durante el día de hoy?')
    expect(textos.intencion.lead).toBe('Elige una intención para acompañar tu día.')

    expect(textos.gratitud.titulo).toBe('¿Qué agradezco hoy?')
    expect(textos.gratitud.lead).toBe('Puede ser algo pequeño.')

    expect(textos.accion.titulo).toBe('¿Qué puedo hacer hoy para acercarme a esa sensación?')
    expect(textos.accion.lead).toBe('Piensa en algo sencillo y posible.')

    expect(textos.reflexion.titulo).toBe('Si quieres, una última pausa')
  })

  it('los marcadores de posición y el cierre', () => {
    expect(textos.gratitud.placeholder).toBe('Una persona, un momento o algo cotidiano…')
    expect(textos.accion.placeholder).toBe('Hoy puedo…')
    expect(textos.accion.anterioresTitulo).toBe('Ideas que elegiste antes')

    expect(textos.cierre.intencionTemplate).toBe('Tu intención para hoy: {intencion}')
    expect(textos.cierre.accionTemplate).toBe('Un paso que puedes dar: {accion}')
    expect(textos.cierre.vacio).toBe('Tu día puede comenzar desde donde estás.')
    expect(textos.cierre.cta).toBe('Comenzar mi día')
  })

  it('todas hablan en primera persona (§10)', () => {
    // La marca puede estar en el pronombre —"me siento"— o solo en el verbo
    // —"agradezco"—. Lo que ninguna hace es dirigirse a nadie en segunda.
    const enPrimera = /\bme\b|\bmi\b|\bagradezco\b|\bpuedo\b|\bnecesito\b|\bquiero\b/i
    const enSegunda = /\bt[uúe]\b|\btus\b|\bpiensa\b|\bescribe\b/i
    const titulos = [
      textos.animo.titulo,
      textos.intencion.titulo,
      textos.gratitud.titulo,
      textos.accion.titulo,
      ...BANCO.map((pregunta) => pregunta.titulo),
    ]
    titulos.forEach((titulo) => {
      expect(titulo).toMatch(enPrimera)
      expect(titulo).not.toMatch(enSegunda)
    })
  })

  it('la redacción es la misma para todo el mundo: no hay plantilla que la mueva', () => {
    // §6 — La estabilidad es lo que las vuelve familiares. Lo único que se
    // personaliza son las ideas de apoyo de la acción.
    ;[textos.animo, textos.intencion, textos.gratitud, textos.accion].forEach(({ titulo, lead }) =>
      [titulo, lead].forEach((linea) => expect(linea).not.toMatch(/\{\w+\}/)),
    )
  })
})

// ─── Criterio 2 ───────────────────────────────────────────────────────────────

describe('criterio 2 — las dos preguntas emocionales son de selección única', () => {
  it('los catálogos son los que pide la actualización, en su orden', () => {
    expect(ANIMO.CATALOGO.map((o) => o.id)).toEqual([
      'calma',
      'energia',
      'alegre',
      'motivado',
      'neutral',
      'pensativo',
      'cansado',
      'poca_energia',
      'inquieto',
      'abrumado',
      'triste',
    ])
    expect(INTENCION.CATALOGO.map((o) => o.id)).toEqual([
      'calma',
      'energia',
      'enfocado',
      'motivado',
      'confianza',
      'ligero',
      'presente',
      'paciencia',
      'alegre',
    ])
    ;[...ANIMO.CATALOGO, ...INTENCION.CATALOGO].forEach((opcion) =>
      expect(opcion.emoji).toBeTruthy(),
    )
  })

  it('elegir una sustituye a la anterior; nunca hay dos a la vez', () => {
    expect(ANIMO.alternar(null, 'calma')).toBe('calma')
    expect(ANIMO.alternar('calma', 'triste')).toBe('triste')
    expect(INTENCION.alternar('ligero', 'presente')).toBe('presente')
  })

  it('tocar la que ya estaba elegida la suelta: así se deja en blanco', () => {
    expect(ANIMO.alternar('calma', 'calma')).toBeNull()
    expect(INTENCION.alternar('calma', 'calma')).toBeNull()
  })

  it('el punto de partida sí admite emociones difíciles; la intención no', () => {
    // La pregunta de la mañana es qué hay, y ahí caben los días malos. La
    // intención es hacia dónde acompañarse, y "estar triste" no es una.
    expect(ANIMO.IDS).toContain('triste')
    expect(ANIMO.IDS).toContain('abrumado')
    expect(INTENCION.IDS).not.toContain('triste')
    expect(INTENCION.IDS).not.toContain('abrumado')
  })

  it('la distancia entre las dos no se mide ni se nombra en ningún sitio', () => {
    const todo = JSON.stringify(textos)
    ;[/brecha/i, /puntaje/i, /puntuaci[óo]n/i, /porcentaje/i, /mejorar tu estado/i].forEach(
      (patron) => expect(todo).not.toMatch(patron),
    )
    expect(MOMENTO('MomentoIntencionAccion')).not.toMatch(/compar|brecha|alerta/i)
  })

  it('lo elegido no se distingue solo por color (§10)', () => {
    // La forma de la píldora vive en `pildora.js`, que es de donde la toman el
    // recorrido y la consulta; el chip añade lo suyo de control que se toca.
    const pildora = COMPARTIDO('pildora.js')
    expect(pildora).toMatch(/border-current/)
    expect(pildora).toMatch(/font-medium/)
    expect(pildora).toMatch(/shadow-elev-2/)

    const chips = COMPARTIDO('ChipsUnicos.jsx')
    expect(chips).toMatch(/aria-pressed=/)
    expect(chips).toMatch(/PILDORA_ELEGIDA/)
    expect(chips).toMatch(/MARCA/)
    // Ni un color escrito a mano: la píldora es la única fuente.
    expect(chips).not.toMatch(/border-current|bg-lumia-tarjeta/)
  })
})

// ─── Criterio 3 ───────────────────────────────────────────────────────────────

describe('criterio 3 — "Algo más" se crea, se elige, se edita y se quita', () => {
  it('acepta hasta 30 caracteres y no los transforma', () => {
    expect(MAX_PALABRA_PROPIA).toBe(30)
    const largo = 'a'.repeat(50)
    expect(ANIMO.paraGuardar(ID_OTRA, largo).otro).toHaveLength(30)
    expect(ANIMO.paraGuardar(ID_OTRA, 'Con la mente en otra parte').otro).toBe(
      'Con la mente en otra parte',
    )
  })

  it('a diferencia del Journal, admite más de una palabra', () => {
    expect(ANIMO.paraGuardar(ID_OTRA, 'medio dormido').otro).toBe('medio dormido')
  })

  it('sin nada escrito no se guarda un chip vacío', () => {
    expect(ANIMO.paraGuardar(ID_OTRA, '   ')).toEqual({ valor: null, otro: null })
  })

  it('soltar el chip descarta la palabra: no queda guardada a escondidas', () => {
    expect(ANIMO.paraGuardar('calma', 'medio dormido')).toEqual({ valor: 'calma', otro: null })
  })

  it('no se le asigna ningún emoji', () => {
    expect(textos.animo.otra.chip).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
    expect(COMPARTIDO('ChipsUnicos.jsx')).not.toMatch(/otra[\s\S]{0,40}emoji/)
  })

  it('el componente ofrece confirmar, editar y quitar', () => {
    const chips = COMPARTIDO('ChipsUnicos.jsx')
    expect(chips).toMatch(/onKeyDown/)
    expect(chips).toMatch(/textosOtra\.confirmar/)
    expect(chips).toMatch(/textosOtra\.quitar/)
    // Tocar el chip ya elegido reabre el campo en vez de soltarlo: editar y
    // borrar no pueden ser el mismo gesto.
    expect(chips).toMatch(/const tocarOtra/)
  })
})

// ─── Criterio 4 ───────────────────────────────────────────────────────────────

describe('criterio 4 — la gratitud admite hasta tres elementos independientes', () => {
  it('abre con un solo campo, no con tres huecos por rellenar', () => {
    expect(LIMITES.gratitudManana).toEqual({ min: 1, max: 3, crecerSola: false })
    expect(filasIniciales([], LIMITES.gratitudManana)).toHaveLength(1)
  })

  it('escribir en el único campo no abre otro por su cuenta', () => {
    const filas = filasIniciales([], LIMITES.gratitudManana)
    expect(escribirEn(filas, 0, 'el café', LIMITES.gratitudManana)).toHaveLength(1)
  })

  it('"Añadir otro" aparece solo cuando no queda ningún campo en blanco', () => {
    expect(puedeAnadir([{ id: null, texto: '' }], LIMITES.gratitudManana)).toBe(false)
    expect(puedeAnadir([{ id: null, texto: 'el café' }], LIMITES.gratitudManana)).toBe(true)
  })

  it('deja de ofrecerse en el tercero', () => {
    const tres = ['el café', 'la ducha', 'el silencio'].map((texto) => ({ id: null, texto }))
    expect(puedeAnadir(tres, LIMITES.gratitudManana)).toBe(false)
  })

  it('vaciar el último campo lo retira y "Añadir otro" vuelve a ofrecerse', () => {
    const filas = [
      { id: null, texto: 'el café' },
      { id: null, texto: '' },
    ]
    const tras = alSalirDeFila(filas, 1, LIMITES.gratitudManana)
    expect(tras).toHaveLength(1)
    expect(puedeAnadir(tras, LIMITES.gratitudManana)).toBe(true)
  })

  it('cada elemento se guarda por separado', () => {
    const filas = [
      { id: null, texto: ' el café ' },
      { id: null, texto: '' },
      { id: null, texto: 'la ducha' },
    ]
    expect(textosDe(filas)).toEqual(['el café', 'la ducha'])
  })

  it('la gratitud de la mañana es suya y la noche no la comparte', () => {
    // La lista de diez de la noche era `LIMITES.gratitud` y se retiró el 23 ago
    // con "¿Qué agradezco de este día?". Lo que la noche tiene ahora es su
    // propio reconocimiento, con sus propios límites.
    expect(LIMITES.gratitud).toBeUndefined()
    expect(Object.keys(LIMITES).sort()).toEqual(['gratitudManana', 'reconocimiento'])
  })

  it('cada línea cabe en 120 caracteres y el campo lo aplica', () => {
    expect(MAX_GRATITUD_LINEA).toBe(120)
    expect(MOMENTO('MomentoGratitud')).toMatch(/maxLength=\{MAX_GRATITUD_LINEA\}/)
  })
})

// ─── Criterio 5 ───────────────────────────────────────────────────────────────

describe('criterio 5 — la acción es texto libre con ideas ligadas a la intención', () => {
  it('cada intención del catálogo tiene sus tres ideas', () => {
    INTENCION.IDS.forEach((id) => {
      expect(textos.accion.ideas[id]).toHaveLength(3)
    })
  })

  it('se ofrecen como mucho tres', () => {
    expect(MAX_IDEAS).toBe(3)
    expect(ideasGenerales('calma')).toEqual([
      'Hacer una pausa consciente',
      'Silenciar notificaciones un momento',
      'Respirar durante tres minutos',
    ])
  })

  it('una intención escrita a mano recibe las generales, sin interpretarla', () => {
    expect(ideasGenerales(ID_OTRA)).toEqual(textos.accion.ideas.generales.slice(0, MAX_IDEAS))
    expect(ideasGenerales(null)).toHaveLength(MAX_IDEAS)
  })

  it('ninguna idea repite lo que la persona ya tiene delante como propia', () => {
    // La comparación ignora mayúsculas y espacios de más: la misma idea escrita
    // de dos formas seguiría siendo la misma idea.
    const ofrecidas = ideasGenerales('calma', ['  hacer UNA pausa   consciente '])
    expect(ofrecidas).not.toContain('Hacer una pausa consciente')
    // Una lista de intención tiene tres: descontada una, quedan dos. "Hasta
    // tres" no es "siempre tres", y rellenar el hueco con una idea de otra
    // intención sería ofrecer algo que no viene de la que se eligió.
    expect(ofrecidas).toHaveLength(2)
  })

  it('la lista general tiene una cuarta idea que entra cuando alguna se descuenta', () => {
    expect(textos.accion.ideas.generales).toHaveLength(4)
    expect(ideasGenerales(null, ['Dar un paso pequeño'])).toEqual([
      'Hacer una pausa',
      'Elegir una prioridad',
      'Cuidar algo que necesito',
    ])
  })

  it('tocar una idea la deja en el campo y no la guarda todavía (§5)', () => {
    expect(CONTENEDOR).toMatch(/const elegirIdea = \(idea\) => setValores/)
    // No hay ninguna escritura colgada de ese gesto.
    const linea = CONTENEDOR.match(/const elegirIdea =[^\n]*\n/)[0]
    expect(linea).not.toMatch(/guardar|escribir/)
  })

  it('el campo es libre, de tres líneas y hasta 240 caracteres', () => {
    expect(MAX_ACCION).toBe(240)
    const accion = MOMENTO('MomentoIntencionAccion')
    expect(accion).toMatch(/<CampoTexto/)
    expect(accion).toMatch(/filas=\{3\}/)
    expect(accion).toMatch(/maxLength=\{MAX_ACCION\}/)
  })
})

// ─── Criterio 6 ───────────────────────────────────────────────────────────────

describe('criterio 6 — lo escrito antes solo vuelve como dice la regla', () => {
  const HOY = '2026-08-23'
  const recientes = [
    { id: '2026-08-22', intention: 'calma', action: 'Bajar el ritmo al mediodía' },
    { id: '2026-08-20', intention: 'calma', action: 'Salir a caminar' },
    { id: '2026-08-18', intention: 'calma', action: 'Salir a caminar' },
    { id: '2026-08-15', intention: 'enfocado', action: 'Cerrar el correo' },
    { id: '2026-06-01', intention: 'calma', action: 'Una llamada pendiente' },
  ]

  it('devuelve como mucho dos, de la más reciente hacia atrás', () => {
    expect(MAX_ANTERIORES).toBe(2)
    expect(ideasAnteriores(recientes, 'calma', HOY)).toEqual([
      'Bajar el ritmo al mediodía',
      'Salir a caminar',
    ])
  })

  it('solo de la misma intención', () => {
    expect(ideasAnteriores(recientes, 'enfocado', HOY)).toEqual(['Cerrar el correo'])
  })

  it('nada de hace más de treinta días', () => {
    expect(ideasAnteriores(recientes, 'calma', HOY)).not.toContain('Una llamada pendiente')
  })

  it('una intención escrita a mano no se compara con nada', () => {
    expect(ideasAnteriores(recientes, ID_OTRA, HOY)).toEqual([])
    expect(ideasAnteriores(recientes, null, HOY)).toEqual([])
  })

  it('no se repiten y no se toma el propio día', () => {
    const conHoy = [{ id: HOY, intention: 'calma', action: 'Lo de hoy' }, ...recientes]
    const salida = ideasAnteriores(conHoy, 'calma', HOY)
    expect(salida).not.toContain('Lo de hoy')
    expect(new Set(salida).size).toBe(salida.length)
  })

  it('nunca se afirma que le funcionaran, y nunca rellenan solas', () => {
    expect(textos.accion.anterioresTitulo).toBe('Ideas que elegiste antes')
    expect(JSON.stringify(textos)).not.toMatch(/funcion|te sirvió|te ayudó/i)
    expect(MOMENTO('MomentoIntencionAccion')).not.toMatch(/defaultValue|value=\{.*anteriores/)
  })

  it('lo único que vuelve es lo escrito en esta misma pregunta', () => {
    // Ni journal, ni noche, ni ninguna otra superficie.
    const modulo = codigoDe('src/lumia/mananaAcciones.js')
    expect(modulo).not.toMatch(/journal|night|learning|Journal/i)
  })
})

// ─── Criterio 7 ───────────────────────────────────────────────────────────────

describe('criterio 7 — la pausa opcional rota y respeta sus límites', () => {
  const HOY = '2026-08-23'
  const conPausa = (fecha, id) => ({ id: fecha, reflectionId: id })

  it('son las tres preguntas del banco, con su texto de apoyo', () => {
    expect(BANCO.map((p) => p.titulo)).toEqual([
      '¿Qué necesito recordarme hoy?',
      '¿Cómo quiero tratarme hoy?',
      '¿Qué puedo hacer más sencillo hoy?',
    ])
    BANCO.forEach((pregunta) => expect(pregunta.lead).toBeTruthy())
  })

  it('nunca en dos días consecutivos', () => {
    expect(debeAparecer([conPausa('2026-08-22', 'recordarme')], HOY)).toBe(false)
    expect(debeAparecer([conPausa('2026-08-21', 'recordarme')], HOY)).toBe(true)
  })

  it('como mucho tres en siete días', () => {
    expect(MAXIMO_EN_VENTANA).toBe(3)
    const tres = [
      conPausa('2026-08-21', 'recordarme'),
      conPausa('2026-08-19', 'tratarme'),
      conPausa('2026-08-17', 'sencillo'),
    ]
    expect(debeAparecer(tres, HOY)).toBe(false)
    // La de hace ocho días queda fuera de la ventana y deja sitio.
    const dos = [...tres.slice(0, 2), conPausa('2026-08-15', 'sencillo')]
    expect(debeAparecer(dos, HOY)).toBe(true)
  })

  it('sin historia, aparece', () => {
    expect(debeAparecer([], HOY)).toBe(true)
    expect(siguientePregunta([], HOY).id).toBe(BANCO[0].id)
  })

  it('no repite ninguna hasta haber pasado por las demás', () => {
    let historia = []
    const salidas = []
    for (let i = 0; i < BANCO.length * 2; i += 1) {
      const fecha = `2026-08-${String(2 + i * 2).padStart(2, '0')}`
      const elegida = siguientePregunta(historia, fecha)
      salidas.push(elegida.id)
      historia = [...historia, conPausa(fecha, elegida.id)]
    }
    expect(new Set(salidas.slice(0, 3)).size).toBe(3)
    expect(new Set(salidas.slice(3, 6)).size).toBe(3)
  })

  it('dentro del mismo día no cambia: aparecer es una decisión estable', () => {
    const hoyConPausa = { reflectionId: 'tratarme' }
    // Aunque ayer hubiera una —lo que normalmente la callaría— si hoy ya se
    // mostró, se sigue mostrando: desaparecer a media mañana sería peor.
    expect(debeAparecer([conPausa('2026-08-22', 'recordarme')], HOY, hoyConPausa)).toBe(true)
    expect(siguientePregunta([], HOY, hoyConPausa).id).toBe('tratarme')
  })

  it('aparecer cuenta aunque no se conteste', () => {
    // Se guarda al mostrarse, no al responderse: si solo contáramos las
    // respondidas, quien nunca responde la vería todas las mañanas.
    expect(CONTENEDOR).toMatch(/guardar\(\{ reflectionId: pregunta\.id \}\)/)
    expect(debeAparecer([{ id: '2026-08-22', reflectionId: 'recordarme' }], HOY)).toBe(false)
  })

  it('lleva su etiqueta de opcional y su salida, y no se llama afirmación', () => {
    expect(textos.reflexion.opcional).toBe('Opcional')
    expect(textos.reflexion.omitir).toBe('Ahora no')
    expect(JSON.stringify(textos)).not.toMatch(/afirmaci[óo]n/i)
    expect(MAX_REFLEXION).toBe(180)
  })
})

// ─── Criterio 8 ───────────────────────────────────────────────────────────────

describe('criterio 8 — todas las preguntas se pueden omitir', () => {
  it('ningún control del recorrido se deshabilita nunca', () => {
    const pasos = COMPARTIDO('Pasos.jsx')
    expect(pasos).not.toMatch(/disabled/)
    ;['MomentoAnimo', 'MomentoGratitud', 'MomentoIntencionAccion', 'MomentoPausa'].forEach(
      (nombre) => expect(MOMENTO(nombre)).not.toMatch(/disabled|required|aria-invalid/),
    )
  })

  it('no hay una sola palabra que señale lo que quedó en blanco', () => {
    const todo = JSON.stringify(textos)
    ;[/incompleto/i, /te falt/i, /obligatori/i, /sin responder/i, /debes/i].forEach((patron) =>
      expect(todo).not.toMatch(patron),
    )
  })

  it('la gratitud y la pausa tienen además su salida explícita', () => {
    expect(textos.gratitud.omitir).toBe('Omitir por hoy')
    expect(textos.reflexion.omitir).toBe('Ahora no')
    // "Omitir por hoy" solo con todo en blanco: con algo escrito sonaría a
    // descartarlo.
    expect(MOMENTO('MomentoGratitud')).toMatch(/enBlanco &&/)
  })

  it('con todo omitido el cierre funciona igual y no señala el vacío', () => {
    expect(lineasDeCierre(null, 'n')).toEqual([])
    expect(lineasDeCierre({}, 'f')).toEqual([])
    expect(textos.cierre.vacio).toBe('Tu día puede comenzar desde donde estás.')
  })

  it('lo omitido se anota, y solo se anota lo que llegó a preguntarse', () => {
    expect(camposOmitidos({}, { conPausa: false })).toEqual([
      PREGUNTAS.animo,
      PREGUNTAS.intencion,
      PREGUNTAS.gratitud,
      PREGUNTAS.accion,
    ])
    expect(camposOmitidos({}, { conPausa: true })).toContain(PREGUNTAS.pausa)

    const entera = {
      feeling: 'calma',
      intention: 'presente',
      gratitude: ['el café'],
      action: 'Salir a caminar',
      reflection: 'Ir más despacio',
    }
    expect(camposOmitidos(entera, { conPausa: true })).toEqual([])
  })
})

// ─── Criterio 9 ───────────────────────────────────────────────────────────────

describe('criterio 9 — tres momentos, no una lista de campos', () => {
  it('el indicador cuenta momentos y la pausa no entra en la cuenta', () => {
    expect(MOMENTOS).toEqual(['animo', 'gratitud', 'intencion-accion'])
    expect(textos.pasos.indicadorTemplate).toBe('{n} de {total}')
    expect(CONTENEDOR).toMatch(/total=\{MOMENTOS\.length\}/)
    expect(CONTENEDOR).toMatch(/\{!enPausa && <IndicadorPasos/)
  })

  it('se puede avanzar, retroceder y cambiar lo respondido', () => {
    expect(CONTENEDOR).toMatch(/onAtras=/)
    expect(CONTENEDOR).toMatch(/onSiguiente=\{avanzar\}/)
    // Volver desde la pausa lleva al último momento, no a un paso fantasma.
    expect(CONTENEDOR).toMatch(/enPausa \? MOMENTOS\.length - 1 : paso - 1/)
  })

  it('el punto de partida abre solo: una pregunta en toda la pantalla', () => {
    const animo = MOMENTO('MomentoAnimo')
    expect(animo).toMatch(/copy\.lumia\.diario\.manana\.animo/)
    expect(animo).toMatch(/<h2 [^>]*>\{textos\.titulo\}/)
    // Ni la intención ni la acción asoman por aquí: la pantalla es una sola
    // pregunta, que es lo que la vuelve la puerta del recorrido.
    expect(animo).not.toMatch(/intencion|accion|INTENCION/i)
    expect(CONTENEDOR.match(/<MomentoAnimo/g)).toHaveLength(1)
  })

  it('la intención y el paso comparten pantalla, y en ese orden', () => {
    // "¿Qué puedo hacer hoy para acercarme a *esa sensación*?" es un pronombre
    // sin antecedente si la sensación se eligió dos pantallas atrás.
    const juntas = MOMENTO('MomentoIntencionAccion')
    expect(juntas.indexOf('intencion.titulo')).toBeLessThan(juntas.indexOf('accion.titulo'))
    expect(CONTENEDOR.match(/<MomentoIntencionAccion/g)).toHaveLength(1)
    // Las ideas se recalculan con la intención que está justo encima.
    expect(CONTENEDOR).toMatch(/generales=\{ideasGenerales\(valores\.intencion, anteriores\)\}/)
  })

  it('el recorrido son cuatro pantallas y cada una es su archivo', () => {
    expect(existsSync('src/components/lumia/manana/MomentoInicio.jsx')).toBe(false)
    expect(existsSync('src/components/lumia/manana/MomentoAccion.jsx')).toBe(false)
    ;['MomentoAnimo', 'MomentoGratitud', 'MomentoIntencionAccion', 'MomentoPausa'].forEach(
      (nombre) => expect(existsSync(`src/components/lumia/manana/${nombre}.jsx`)).toBe(true),
    )
  })

  it('la mañana cerrada se queda a la vista, sin etiqueta de "hecho"', () => {
    expect(estaCerrada({ completedAt: '2026-08-23T07:10:00+02:00' })).toBe(true)
    expect(estaCerrada({})).toBe(false)
    const resumen = codigoDe('src/components/lumia/manana/ResumenManana.jsx')
    expect(resumen).not.toMatch(/hecho|completad|terminad/i)
    expect(copy.lumia.diario.manana.resumen.editar).toBe('Cambiar algo')
  })
})

// ─── La pantalla de consulta ──────────────────────────────────────────────────

describe('la consulta se ve igual que las preguntas, y en una sola pantalla', () => {
  const escrita = {
    feeling: 'cansado',
    gratitude: ['el café', 'la ducha'],
    intention: 'calma',
    action: 'Salir a caminar',
    reflectionId: 'tratarme',
    reflection: 'Ir despacio',
  }

  it('las dos respuestas emocionales vuelven en píldora y con su emoji', () => {
    const bloques = resumenDeManana(escrita, 'f')
    const porId = (id) => bloques.find((bloque) => bloque.id === id)

    expect(porId(PREGUNTAS.animo)).toMatchObject({ forma: 'chip', emoji: '😴' })
    expect(porId(PREGUNTAS.intencion)).toMatchObject({ forma: 'chip', emoji: '😌' })
    // El emoji es el mismo que se vio al elegir: sale del catálogo, no de aquí.
    expect(porId(PREGUNTAS.animo).emoji).toBe(ANIMO.emojiDe('cansado'))
    expect(porId(PREGUNTAS.intencion).emoji).toBe(INTENCION.emojiDe('calma'))
  })

  it('lo demás es texto: la píldora es de las emociones, no del bloque', () => {
    resumenDeManana(escrita, 'f')
      .filter((bloque) => ![PREGUNTAS.animo, PREGUNTAS.intencion].includes(bloque.id))
      .forEach((bloque) => expect(bloque).toMatchObject({ forma: 'texto', emoji: null }))
  })

  it('a la respuesta escrita a mano no se le asigna emoji (§3)', () => {
    const propia = { feeling: ID_OTRA, feelingOther: 'medio dormido' }
    expect(resumenDeManana(propia, 'n')[0]).toMatchObject({
      forma: 'chip',
      emoji: null,
      lineas: ['«medio dormido»'],
    })
  })

  it('cada bloque trae la pregunta, no una etiqueta resumida', () => {
    const bloques = resumenDeManana(escrita, 'f')
    expect(bloques.map((b) => b.titulo)).toEqual([
      textos.animo.titulo,
      textos.gratitud.titulo,
      textos.intencion.titulo,
      textos.accion.titulo,
      '¿Cómo quiero tratarme hoy?',
    ])
    expect(copy.lumia.diario.manana.resumen).toEqual({ editar: 'Cambiar algo' })
  })

  it('sigue el orden del recorrido y trae las respuestas resueltas', () => {
    const bloques = resumenDeManana(escrita, 'f')
    expect(bloques.map((b) => b.lineas)).toEqual([
      ['Cansada'],
      ['el café', 'la ducha'],
      ['En calma'],
      ['Salir a caminar'],
      ['Ir despacio'],
    ])
  })

  it('lo que quedó en blanco no aparece: no hay marcador de ausencia', () => {
    expect(resumenDeManana({ feeling: 'calma' }, 'n').map((b) => b.id)).toEqual([PREGUNTAS.animo])
    expect(resumenDeManana({}, 'n')).toEqual([])
    expect(resumenDeManana(null, 'n')).toEqual([])
  })

  it('la pausa trae la pregunta de ese día, no una genérica', () => {
    const otra = { ...escrita, reflectionId: 'sencillo' }
    expect(resumenDeManana(otra, 'n').at(-1).titulo).toBe('¿Qué puedo hacer más sencillo hoy?')
    // Sin saber cuál salió, no se puede titular la respuesta: se calla.
    const huerfana = { ...escrita, reflectionId: null }
    expect(resumenDeManana(huerfana, 'n').map((b) => b.id)).not.toContain(PREGUNTAS.pausa)
  })

  it('se pinta con la misma tipografía de pregunta y sin tarjeta ni viñetas', () => {
    const resumen = codigoDe('src/components/lumia/manana/ResumenManana.jsx')
    expect(resumen).toMatch(/<h2 className="font-display text-md text-on-surface">/)
    expect(resumen).not.toMatch(/<ul|<li|rounded-md border/)
    // Todo de una vez: no se pagina ni se pliega.
    expect(resumen).toMatch(/bloques\.map/)
    expect(resumen).not.toMatch(/useState|paso|abierto/)
  })

  it('la píldora de la consulta es la misma que la del recorrido', () => {
    const resumen = codigoDe('src/components/lumia/manana/ResumenManana.jsx')
    expect(resumen).toMatch(/PILDORA, PILDORA_ELEGIDA/)
    expect(resumen).not.toMatch(/rounded-full border px-4|bg-lumia-tarjeta/)
  })

  it('la píldora de la consulta no finge ser un control', () => {
    // Toda la pantalla es de lectura: parecerse a un botón y no responder sería
    // peor que no parecerlo.
    const resumen = codigoDe('src/components/lumia/manana/ResumenManana.jsx')
    const respuesta = resumen.slice(
      resumen.indexOf('function Respuesta'),
      resumen.indexOf('export default'),
    )
    expect(respuesta).not.toMatch(/<button|onClick|aria-pressed|tabIndex/)
    // Y el emoji no se le lee a nadie: la etiqueta ya dice la emoción.
    expect(respuesta).toMatch(/aria-hidden="true">\{bloque\.emoji\}/)
  })
})

// ─── §9 — lo que se guarda ────────────────────────────────────────────────────

describe('§9 — el registro guarda lo que la actualización pide', () => {
  it('el modelo tiene un campo por cada dato de la lista', () => {
    ;[
      'version',
      'updatedAt',
      'completedAt',
      'skipped',
      'feeling',
      'feelingOther',
      'intention',
      'intentionOther',
      'gratitude',
      'action',
      'reflectionId',
      'reflection',
    ].forEach((campo) => expect(FIELDS.morningEntry).toContain(campo))
  })

  it('la marca de tiempo es local y conserva su desfase', () => {
    const marca = marcaLocal(new Date(2026, 7, 23, 7, 10, 0))
    expect(marca).toMatch(/^2026-08-23T07:10:00[+-]\d{2}:\d{2}$/)
  })

  it('la versión se guarda con cada mañana', () => {
    expect(VERSION).toBe(2)
    expect(CONTENEDOR).toMatch(/version: VERSION/)
  })

  it('si la emoción fue propia se sabe por el par de campos', () => {
    expect(ANIMO.paraGuardar(ID_OTRA, 'medio dormido')).toEqual({
      valor: ID_OTRA,
      otro: 'medio dormido',
    })
    expect(ANIMO.paraGuardar('calma', '')).toEqual({ valor: 'calma', otro: null })
  })

  it('los registros de la versión anterior se siguen leyendo', () => {
    // §9 — Nada de lo ya escrito se sobrescribe ni desaparece.
    expect(hayAlgoEscrito({ emotions: ['en_paz'] })).toBe(true)
    expect(hayAlgoEscrito({ granVision: 'un día sin prisa' })).toBe(true)
    expect(hayAlgoEscrito({})).toBe(false)
    const vista = codigoDe('src/components/lumia/VistaDiaCompleto.jsx')
    expect(vista).toMatch(/emocionesHeredadas/)
    expect(vista).toMatch(/granVision/)
  })

  it('lo que ya no se escribe tampoco se puede reabrir a la escritura', () => {
    expect(FIELDS.morningEntry).not.toContain('emotions')
    expect(FIELDS.morningEntry).not.toContain('granVision')
  })
})

// ─── El cierre ────────────────────────────────────────────────────────────────

describe('§8 — el cierre devuelve lo propio, sin celebrar nada', () => {
  const entrada = {
    intention: 'calma',
    action: '  Salir a caminar antes de comer  ',
  }

  it('nombra la intención elegida y el paso escrito', () => {
    expect(lineasDeCierre(entrada, 'f')).toEqual([
      'Tu intención para hoy: En calma',
      'Un paso que puedes dar: Salir a caminar antes de comer',
    ])
  })

  it('con solo una de las dos, sale una sola línea', () => {
    expect(lineasDeCierre({ intention: 'presente' }, 'n')).toHaveLength(1)
    expect(lineasDeCierre({ action: 'Beber agua' }, 'n')).toEqual([
      'Un paso que puedes dar: Beber agua',
    ])
  })

  it('la intención propia se devuelve tal como se escribió', () => {
    expect(lineasDeCierre({ intention: ID_OTRA, intentionOther: 'sin prisa' }, 'm')).toEqual([
      'Tu intención para hoy: «sin prisa»',
    ])
  })

  it('no hay puntuación, ni porcentaje, ni felicitación', () => {
    const apertura = codigoDe('src/components/lumia/manana/AperturaDelDia.jsx')
    expect(apertura).not.toMatch(/%|puntaje|felicit/i)
    expect(JSON.stringify(textos.cierre)).not.toMatch(/[¡!]/)
  })
})

// ─── Género ───────────────────────────────────────────────────────────────────

describe('§3 — los adjetivos siguen al género del perfil', () => {
  it('las tres formas, y la neutra sin marca', () => {
    expect(etiquetaDeAnimo({ feeling: 'cansado' }, 'm')).toBe('Cansado')
    expect(etiquetaDeAnimo({ feeling: 'cansado' }, 'f')).toBe('Cansada')
    expect(etiquetaDeAnimo({ feeling: 'cansado' }, 'n')).toBe('Con cansancio')
    expect(etiquetaDeIntencion({ intention: 'ligero' }, 'n')).toBe('Con ligereza')
  })

  it('sin género declarado se resuelve en neutro y no se rompe nada', () => {
    expect(etiquetaDeAnimo({ feeling: 'motivado' }, undefined)).toBe('Con motivación')
    expect(etiquetaDeAnimo(null, 'f')).toBe('')
  })

  it('la palabra propia no pasa por el helper de género (RN-GEN-06)', () => {
    expect(etiquetaDeAnimo({ feeling: ID_OTRA, feelingOther: 'Cansado' }, 'f')).toBe('«Cansado»')
  })
})

// ─── Criterio 10 ──────────────────────────────────────────────────────────────

describe('criterio 10 — la noche y el resto de Lumia no se tocan', () => {
  // Este criterio se escribió cuando la actualizada era la mañana. La noche se
  // actualizó después, el 23 ago, y sus criterios viven en `noche.test.js`; lo
  // que se comprueba aquí es la otra mitad, que sigue siendo verdad en los dos
  // sentidos: **la mañana no se enteró**. Su copy, su modelo y sus momentos
  // están intactos, y ningún archivo suyo nombra la noche.

  it('la mañana conserva su copy, su modelo y sus tres momentos', () => {
    expect(textos.animo.titulo).toBe('¿Cómo me siento esta mañana?')
    expect(textos.gratitud.titulo).toBe('¿Qué agradezco hoy?')
    expect(textos.cierre.cta).toBe('Comenzar mi día')
    expect(MOMENTOS).toEqual(['animo', 'gratitud', 'intencion-accion'])
    expect(FIELDS.morningEntry).toEqual([
      'version',
      'updatedAt',
      'completedAt',
      'skipped',
      'feeling',
      'feelingOther',
      'intention',
      'intentionOther',
      'gratitude',
      'action',
      'reflectionId',
      'reflection',
    ])
  })

  it('la ceremonia de la mañana sigue siendo la suya y no la de la noche', () => {
    expect(copy.lumia.diario.noche.cierre.cta).toBe('Cerrar mi día')
    expect(CONTENEDOR).toMatch(/<AperturaDelDia/)
    expect(CONTENEDOR).not.toMatch(/CierreDeLaNoche|CierreDelDia/)
  })

  it('ningún archivo de la mañana toca la noche, el journal ni los hábitos', () => {
    // `ChipsUnicos` salió de esta lista al subir un nivel: dejó de ser un
    // archivo de la mañana el día en que la noche también lo montó.
    //
    // **Revisión del paso 8 (25 ago):** la lista nombraba al producto pausado y
    // ahora nombra su vocabulario —`habit`—, que es lo que de verdad no puede
    // volver a entrar aquí. La regla no cambia; cambia cómo se comprueba, para
    // que este archivo no deletree un nombre que ya no existe en `src/`.
    ;['MomentoAnimo', 'MomentoGratitud', 'MomentoIntencionAccion', 'MomentoPausa'].forEach(
      (nombre) => expect(MOMENTO(nombre)).not.toMatch(/noche|night|journal/i),
    )
    ;['manana', 'mananaAcciones', 'mananaPausa', 'mananaEmociones', 'seleccionUnica'].forEach(
      (nombre) => expect(codigoDe(`src/lumia/${nombre}.js`)).not.toMatch(/night|journal|habit/i),
    )
  })

  it('lo que comparten los dos recorridos no conoce a ninguno de los dos', () => {
    // Subieron un nivel el 23 ago. Un componente compartido que alcanzara el
    // copy de un recorrido volvería a ser de ese recorrido, disfrazado.
    ;['ChipsUnicos.jsx', 'Pasos.jsx', 'pildora.js'].forEach((nombre) =>
      expect(`${nombre}: ${COMPARTIDO(nombre)}`).not.toMatch(/diario\.manana|diario\.noche/),
    )
    // `Pasos` recibe su copy por props, que es lo que le permite contar los
    // momentos de la mañana y los de la noche sin saber de cuál son.
    expect(COMPARTIDO('Pasos.jsx')).toMatch(/function IndicadorPasos\(\{ textos/)
  })
})
