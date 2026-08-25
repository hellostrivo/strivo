// src/lumia/__tests__/noche.test.js
// Los criterios de aceptación de la actualización del 23 ago a la noche.
//
// Como en `manana.test.js`, lo que se comprueba aquí es sobre todo lo que **no**
// hay: ningún control que se deshabilite, ningún recuento del día, ninguna
// interpretación de lo que alguien escribió, ningún mensaje que señale lo que
// quedó en blanco y ninguna pregunta que se haga dos veces la misma noche. El
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
  MAX_DESCARGA,
  MAX_RECONOCIMIENTO_LINEA,
  MAX_REFLEXION,
  MOMENTOS,
  PREGUNTAS,
  VERSION,
  algoQueReconoces,
  animoDeNoche,
  camposOmitidos,
  estaCerrada,
  etiquetaDeEmocion,
  hayAlgoEscrito,
  marcaLocal,
  resumenDeNoche,
} from '@/lumia/noche'
import {
  CIERRE,
  EMOCIONES_DE_DESCARGA,
  ID_OTRA,
  MAX_PALABRA_PROPIA,
  animoDeEmocion,
  ofreceDescarga,
} from '@/lumia/nocheEmociones'
import {
  BANCO,
  DIAS_VENTANA,
  FUENTES,
  ID_MANANA,
  ID_SOLTAR,
  MAXIMO_MANANA_EN_VENTANA,
  NOCHES_SIN_REPETIR,
  debeVincularseConManana,
  intencionDeLaManana,
  mananaOfreceIntencion,
  preguntaGuardada,
  puedeOfrecerDescarga,
  reflexionDeLaNoche,
  siguienteDelBanco,
} from '@/lumia/nocheReflexion'

const textos = copy.diario.noche

const codigoDe = (ruta) =>
  readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

const MOMENTO = (nombre) => codigoDe(`src/components/lumia/noche/${nombre}.jsx`)
const CONTENEDOR = codigoDe('src/components/lumia/DiarioNoche.jsx')

const HOY = '2026-08-23'
/** Una noche del historial: fecha, qué pregunta salió y de dónde. */
const noche = (id, reflectionId, reflectionSource = FUENTES.rotativa) => ({
  id,
  reflectionId,
  reflectionSource,
})
/** Una mañana cerrada con intención, que es lo que §6 pide para vincular. */
const mananaCon = (intention, intentionOther = null) => ({
  completedAt: `${HOY}T08:00:00+02:00`,
  intention,
  intentionOther,
})

// ─── Criterio 1 ───────────────────────────────────────────────────────────────

describe('criterio 1 — el reconocimiento sustituye a la pregunta de gratitud', () => {
  it('la pregunta y su texto de apoyo se leen con su redacción exacta', () => {
    expect(textos.reconocimiento.titulo).toBe('¿Qué quiero reconocer de hoy?')
    expect(textos.reconocimiento.lead).toBe(
      'Puede ser algo que disfrutaste, intentaste, enfrentaste o resolviste.',
    )
    expect(textos.reconocimiento.placeholder).toBe('Algo que hice, sentí o atravesé…')
    expect(textos.reconocimiento.anadir).toBe('Añadir otro')
  })

  it('la pregunta anterior no aparece por ningún lado', () => {
    const todo = JSON.stringify(copy.diario)
    ;[/cosas buenas/i, /¿Qué agradezco de este día\?/].forEach((patron) =>
      expect(todo).not.toMatch(patron),
    )
    // Y el bloque entero de gratitud de la noche se retiró con ella.
    expect(textos.gratitud).toBeUndefined()
  })

  it('la redacción no pide que el día haya sido bueno ni exige una cantidad', () => {
    const bloque = `${textos.reconocimiento.titulo} ${textos.reconocimiento.lead} ${textos.reconocimiento.placeholder}`
    ;[/tres cosas/i, /positiv/i, /bueno/i, /al menos/i, /escribe /i].forEach((patron) =>
      expect(bloque).not.toMatch(patron),
    )
  })

  it('todas las preguntas hablan en primera persona (§12)', () => {
    const enPrimera = /\bme\b|\bmi\b|\bm[ií]|quiero|necesito|aprend/i
    const enSegunda = /\bt[uúe]\b|\btus\b|\bpiensa\b|\bescribe\b/i
    const titulos = [
      textos.reconocimiento.titulo,
      textos.emocion.titulo,
      ...BANCO.map((pregunta) => pregunta.titulo),
    ]
    titulos.forEach((titulo) => {
      expect(titulo).toMatch(enPrimera)
      expect(titulo).not.toMatch(enSegunda)
    })
  })
})

// ─── Criterio 2 ───────────────────────────────────────────────────────────────

describe('criterio 2 — el reconocimiento admite hasta tres elementos', () => {
  it('abre con un solo campo, no con tres huecos por rellenar', () => {
    expect(LIMITES.reconocimiento).toEqual({ min: 1, max: 3, crecerSola: false })
    expect(filasIniciales([], LIMITES.reconocimiento)).toHaveLength(1)
  })

  it('escribir en el único campo no abre otro por su cuenta', () => {
    const filas = filasIniciales([], LIMITES.reconocimiento)
    expect(escribirEn(filas, 0, 'aguanté el día', LIMITES.reconocimiento)).toHaveLength(1)
  })

  it('"Añadir otro" aparece solo cuando no queda ningún campo en blanco', () => {
    expect(puedeAnadir([{ id: null, texto: '' }], LIMITES.reconocimiento)).toBe(false)
    expect(puedeAnadir([{ id: null, texto: 'aguanté' }], LIMITES.reconocimiento)).toBe(true)
  })

  it('deja de ofrecerse en el tercero', () => {
    const tres = ['uno', 'dos', 'tres'].map((texto) => ({ id: null, texto }))
    expect(puedeAnadir(tres, LIMITES.reconocimiento)).toBe(false)
  })

  it('vaciar el último campo lo retira y "Añadir otro" vuelve a ofrecerse', () => {
    const filas = [
      { id: null, texto: 'aguanté el día' },
      { id: null, texto: '' },
    ]
    const tras = alSalirDeFila(filas, 1, LIMITES.reconocimiento)
    expect(tras).toHaveLength(1)
    expect(puedeAnadir(tras, LIMITES.reconocimiento)).toBe(true)
  })

  it('cada elemento se guarda por separado y sin espacios de más', () => {
    const filas = [
      { id: null, texto: ' llamé a mi madre ' },
      { id: null, texto: '' },
      { id: null, texto: 'terminé el informe' },
    ]
    expect(textosDe(filas)).toEqual(['llamé a mi madre', 'terminé el informe'])
  })

  it('cada línea cabe en 160 caracteres y el campo lo aplica', () => {
    expect(MAX_RECONOCIMIENTO_LINEA).toBe(160)
    expect(MOMENTO('MomentoReconocimiento')).toMatch(/maxLength=\{MAX_RECONOCIMIENTO_LINEA\}/)
  })

  it('el bloque no ofrece ideas: la pregunta ya trae su propio abanico', () => {
    expect(MOMENTO('MomentoReconocimiento')).not.toMatch(/CampoGratitud|sugerencias/)
  })
})

// ─── Criterio 3 ───────────────────────────────────────────────────────────────

describe('criterio 3 — la reflexión rota, y rota de forma predecible', () => {
  it('el banco son las cinco preguntas de §4, con su redacción', () => {
    expect(BANCO.map((pregunta) => pregunta.titulo)).toEqual([
      '¿Qué me dejó el día de hoy?',
      '¿Qué aprendí hoy sobre mí?',
      '¿Qué quiero recordar de este día?',
      '¿Qué ocupó más espacio en mí hoy?',
      '¿Qué necesito soltar por hoy?',
    ])
    expect(BANCO.map((pregunta) => pregunta.lead)).toEqual([
      'Una emoción, un aprendizaje o algo que quieras recordar.',
      'No necesita ser una gran conclusión.',
      'Puede ser un instante muy pequeño.',
      'Una emoción, una preocupación, una persona o una idea.',
      'No tienes que resolverlo esta noche.',
    ])
  })

  it('la primera noche de todas sale la general', () => {
    expect(siguienteDelBanco([], HOY).id).toBe('general')
    expect(reflexionDeLaNoche([], HOY, null, 'n').id).toBe('general')
  })

  it('no se repite en las siguientes cuatro noches', () => {
    expect(NOCHES_SIN_REPETIR).toBe(4)
    let historial = []
    const salidas = []
    for (let i = 0; i < BANCO.length; i += 1) {
      const elegida = siguienteDelBanco(historial, HOY)
      salidas.push(elegida.id)
      historial = [noche(`2026-08-${10 + i}`, elegida.id), ...historial]
    }
    expect(new Set(salidas).size).toBe(BANCO.length)
    // Y a la sexta vuelve a empezar: la rotación es completa, no aleatoria.
    expect(siguienteDelBanco(historial, HOY).id).toBe(salidas[0])
  })

  it('una pregunta que se mostró cuenta aunque nadie la contestara', () => {
    // El historial guarda `reflectionId`, no la respuesta: por eso una noche en
    // blanco consume turno igual. Sin esto, quien nunca responde vería siempre
    // la misma pregunta.
    const historial = [noche('2026-08-22', 'general')]
    expect(siguienteDelBanco(historial, HOY).id).not.toBe('general')
  })

  it('no cambia si se sale y se vuelve a entrar la misma noche', () => {
    const yaVista = { reflectionId: 'memoria', reflectionSource: FUENTES.rotativa }
    // El historial diría otra cosa; manda lo que ya se guardó para esta fecha.
    const historial = [noche('2026-08-22', 'general')]
    expect(reflexionDeLaNoche(historial, HOY, null, 'n', yaVista).id).toBe('memoria')
  })

  it('nunca sale más de una pregunta por noche', () => {
    const elegida = reflexionDeLaNoche([], HOY, null, 'n')
    expect(typeof elegida.id).toBe('string')
    expect(Array.isArray(elegida)).toBe(false)
    // Y el recorrido tiene un solo bloque de reflexión.
    expect(CONTENEDOR.match(/<MomentoReflexion/g) ?? []).toHaveLength(1)
  })

  it('el campo abre con tres líneas, cabe en 400 caracteres y dice "Opcional"', () => {
    expect(MAX_REFLEXION).toBe(400)
    const bloque = MOMENTO('MomentoReflexion')
    expect(bloque).toMatch(/filas=\{3\}/)
    expect(bloque).toMatch(/maxLength=\{MAX_REFLEXION\}/)
    expect(bloque).toMatch(/textos\.opcional/)
  })

  it('una noche guardada se relee con la pregunta que salió esa noche', () => {
    expect(preguntaGuardada({ reflectionId: 'memoria' }, null, 'n').titulo).toBe(
      '¿Qué quiero recordar de este día?',
    )
    // La ligada a la mañana se reconstruye con la intención de *ese* día.
    expect(
      preguntaGuardada(
        { reflectionId: ID_MANANA, reflectionSource: FUENTES.manana },
        mananaCon('presente'),
        'f',
      ).titulo,
    ).toBe('Esta mañana elegiste Presente como intención. ¿Qué notaste al respecto?')
    expect(preguntaGuardada(null, null, 'n')).toBe(null)
    // Sin intención en esa mañana no se inventa una frase a medias.
    expect(
      preguntaGuardada({ reflectionId: ID_MANANA, reflectionSource: FUENTES.manana }, null, 'n'),
    ).toBe(null)
  })

  it('la rotación no interpreta nada de lo escrito: solo mira ids y fechas', () => {
    const codigo = codigoDe('src/lumia/nocheReflexion.js')
    expect(codigo).not.toMatch(/\.reflection\b|\.recognized\b|\.release\b|\.text\b/)
  })
})

// ─── Criterio 4 ───────────────────────────────────────────────────────────────

describe('criterio 4 — la conexión con la mañana, como mucho dos veces por semana', () => {
  it('nombra la intención y pregunta qué se notó, nunca si se cumplió', () => {
    expect(textos.reflexion.manana.tituloTemplate).toBe(
      'Esta mañana elegiste {emocion} como intención. ¿Qué notaste al respecto?',
    )
    expect(textos.reflexion.manana.lead).toBe(
      'No importa si el día resultó distinto a lo que esperabas.',
    )
    const todo = JSON.stringify(textos)
    ;[/lo lograste/i, /cumpliste/i, /puntaje/i, /puntuaci[óo]n/i, /porcentaje/i].forEach((patron) =>
      expect(todo).not.toMatch(patron),
    )
  })

  it('sustituye a la rotativa, no se añade a ella', () => {
    const elegida = reflexionDeLaNoche([], HOY, mananaCon('calma'), 'n')
    expect(elegida.fuente).toBe(FUENTES.manana)
    expect(elegida.id).toBe(ID_MANANA)
    expect(elegida.titulo).toBe(
      'Esta mañana elegiste En calma como intención. ¿Qué notaste al respecto?',
    )
  })

  it('no aparece si la mañana quedó a medias o sin intención', () => {
    expect(mananaOfreceIntencion(null)).toBe(false)
    expect(mananaOfreceIntencion({ intention: 'calma' })).toBe(false)
    expect(mananaOfreceIntencion({ completedAt: 'x' })).toBe(false)
    expect(debeVincularseConManana([], HOY, { completedAt: 'x', intention: null })).toBe(false)
    expect(reflexionDeLaNoche([], HOY, { completedAt: 'x' }, 'n').fuente).toBe(FUENTES.rotativa)
  })

  it('nunca en noches consecutivas', () => {
    const anoche = [noche('2026-08-22', ID_MANANA, FUENTES.manana)]
    expect(debeVincularseConManana(anoche, HOY, mananaCon('calma'))).toBe(false)
  })

  it('como mucho dos en siete días', () => {
    expect(MAXIMO_MANANA_EN_VENTANA).toBe(2)
    expect(DIAS_VENTANA).toBe(7)
    const dos = [
      noche('2026-08-20', ID_MANANA, FUENTES.manana),
      noche('2026-08-18', ID_MANANA, FUENTES.manana),
    ]
    expect(debeVincularseConManana(dos, HOY, mananaCon('calma'))).toBe(false)
    // Con una sola dentro de la ventana sí cabe la de hoy.
    expect(debeVincularseConManana([dos[0]], HOY, mananaCon('calma'))).toBe(true)
    // Y una del mes pasado ya no cuenta.
    const vieja = [noche('2026-07-20', ID_MANANA, FUENTES.manana), dos[0]]
    expect(debeVincularseConManana(vieja, HOY, mananaCon('calma'))).toBe(true)
  })

  it('las noches que se la llevaron no consumen turno de la rotación', () => {
    const historial = [
      noche('2026-08-22', ID_MANANA, FUENTES.manana),
      noche('2026-08-21', 'general'),
    ]
    expect(siguienteDelBanco(historial, HOY).id).toBe('autoconocimiento')
  })

  it('una intención escrita a mano entra literal, sin reinterpretarla', () => {
    // §6 — "insertar exactamente el texto escrito por la persona". Ni comillas
    // que la adornen, ni el helper de género, ni una lectura de lo que quiso
    // decir (RN-GEN-06).
    expect(intencionDeLaManana(mananaCon(ID_OTRA, ' con menos prisa '), 'f')).toBe(
      'con menos prisa',
    )
    expect(reflexionDeLaNoche([], HOY, mananaCon(ID_OTRA, 'con menos prisa'), 'f').titulo).toBe(
      'Esta mañana elegiste con menos prisa como intención. ¿Qué notaste al respecto?',
    )
  })

  it('la etiqueta del catálogo sí se resuelve al género vigente', () => {
    expect(intencionDeLaManana(mananaCon('enfocado'), 'f')).toBe('Enfocada')
    expect(intencionDeLaManana(mananaCon('enfocado'), 'm')).toBe('Enfocado')
    expect(intencionDeLaManana(mananaCon('enfocado'), 'n')).toBe('Con foco')
  })

  it('de la mañana entra la intención y nada más', () => {
    // §6 — "No mostrar fragmentos de otras respuestas de la mañana". Ni la
    // gratitud, ni el paso, ni la gran visión de los días viejos.
    const codigo = codigoDe('src/lumia/nocheReflexion.js')
    ;[/gratitude/, /\.action\b/, /granVision/, /feeling/].forEach((patron) =>
      expect(codigo).not.toMatch(patron),
    )
    expect(CONTENEDOR).not.toMatch(/morning\.(gratitude|action|granVision|feeling)/)
  })
})

// ─── Criterio 5 y 6 ───────────────────────────────────────────────────────────

describe('criterio 5 y 6 — la emoción de cierre, en selección única', () => {
  it('la pregunta sustituye a "¿Cómo te vas a dormir?"', () => {
    expect(textos.emocion.titulo).toBe('¿Cómo me siento al cerrar el día?')
    expect(textos.emocion.lead).toBe('Elige lo que más se acerque a cómo estás.')
    expect(JSON.stringify(copy.diario)).not.toMatch(/¿Cómo te vas a dormir\?/)
  })

  it('el catálogo son las doce de §7, en su orden y con su emoji', () => {
    expect(CIERRE.CATALOGO.map((opcion) => opcion.id)).toEqual([
      'en_paz',
      'tranquilo',
      'agradecido',
      'orgulloso',
      'aliviado',
      'pensativo',
      'neutral',
      'cansado',
      'inquieto',
      'frustrado',
      'triste',
      'abrumado',
    ])
    CIERRE.CATALOGO.forEach((opcion) => expect(opcion.emoji).toBeTruthy())
  })

  it('las emociones difíciles no llevan tratamiento distinto', () => {
    // Ni marca en el dato, ni orden que las relegue al final del todo, ni una
    // sola palabra de aviso en el copy.
    CIERRE.CATALOGO.forEach((opcion) =>
      expect(Object.keys(opcion).sort()).toEqual(['emoji', 'id', 'label']),
    )
    const chips = codigoDe('src/components/lumia/ChipsUnicos.jsx')
    expect(chips).not.toMatch(/dificil|alerta|aviso|rojo|red-/i)
    // Sobre el bloque de la emoción, no sobre todo el copy: "una preocupación"
    // es una de las cosas que §4 ofrece nombrar en la reflexión.
    expect(JSON.stringify(textos.emocion)).not.toMatch(/cuidado|preocupa|alarma|problema/i)
  })

  it('solo cabe una, y tocar la elegida la suelta', () => {
    expect(CIERRE.alternar(null, 'triste')).toBe('triste')
    expect(CIERRE.alternar('triste', 'en_paz')).toBe('en_paz')
    expect(CIERRE.alternar('triste', 'triste')).toBe(null)
    expect(CIERRE.paraGuardar('en_paz', '')).toEqual({ valor: 'en_paz', otro: null })
  })

  it('se anuncia como algo que se puede soltar, no como un radio', () => {
    // Un radio no se deselecciona; este chip sí, y decir lo contrario sería
    // mentirle a quien usa un lector de pantalla.
    const chips = codigoDe('src/components/lumia/ChipsUnicos.jsx')
    expect(chips).toMatch(/aria-pressed=/)
    expect(chips).not.toMatch(/type="radio"|role="radio"/)
  })

  it('lo elegido no se distingue solo por color (§12)', () => {
    const pildora = codigoDe('src/components/lumia/pildora.js')
    expect(pildora).toMatch(/border-current/)
    expect(pildora).toMatch(/font-medium/)
    const chips = codigoDe('src/components/lumia/ChipsUnicos.jsx')
    expect(chips).toMatch(/MARCA/)
  })

  it('las etiquetas se resuelven al género vigente, también en lo ya guardado', () => {
    expect(etiquetaDeEmocion({ closingFeeling: 'cansado' }, 'f')).toBe('Cansada')
    expect(etiquetaDeEmocion({ closingFeeling: 'cansado' }, 'm')).toBe('Cansado')
    expect(etiquetaDeEmocion({ closingFeeling: 'cansado' }, 'n')).toBe('Con cansancio')
  })
})

// ─── Criterio 7 ───────────────────────────────────────────────────────────────

describe('criterio 7 — "Algo más" se crea, se elige, se edita y se quita', () => {
  it('acepta hasta 30 caracteres y no los transforma', () => {
    expect(MAX_PALABRA_PROPIA).toBe(30)
    expect(CIERRE.paraGuardar(ID_OTRA, 'a'.repeat(50)).otro).toHaveLength(30)
    expect(CIERRE.paraGuardar(ID_OTRA, 'con la cabeza en otro sitio').otro).toBe(
      'con la cabeza en otro sitio',
    )
  })

  it('sin nada escrito no se guarda un chip vacío', () => {
    expect(CIERRE.paraGuardar(ID_OTRA, '   ')).toEqual({ valor: null, otro: null })
  })

  it('se relee entre comillas y sin emoji asignado', () => {
    expect(etiquetaDeEmocion({ closingFeeling: ID_OTRA, closingFeelingOther: 'raro' }, 'f')).toBe(
      '«raro»',
    )
    expect(CIERRE.emojiDe(ID_OTRA)).toBe(null)
    expect(textos.emocion.otra.chip).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
  })

  it('el componente ofrece confirmar, editar y quitar', () => {
    const chips = codigoDe('src/components/lumia/ChipsUnicos.jsx')
    expect(chips).toMatch(/onKeyDown/)
    expect(chips).toMatch(/textosOtra\.confirmar/)
    expect(chips).toMatch(/textosOtra\.quitar/)
    expect(chips).toMatch(/const tocarOtra/)
  })

  it('una palabra propia no se analiza para decidir si es difícil', () => {
    // §8 — la lista de las cuatro es cerrada y explícita. Deducir de una palabra
    // que alguien está mal es exactamente el diagnóstico que §9 prohíbe.
    expect(ofreceDescarga(ID_OTRA)).toBe(false)
    expect(ofreceDescarga('hundida')).toBe(false)
    expect(animoDeEmocion(ID_OTRA)).toBe('normal')
  })
})

// ─── Criterio 8 ───────────────────────────────────────────────────────────────

describe('criterio 8 — la descarga aparece cuando corresponde, o cuando se pide', () => {
  it('su copy es el de §8, con sus dos salidas', () => {
    expect(textos.descarga.titulo).toBe('¿Hay algo que quieras dejar aquí por hoy?')
    expect(textos.descarga.lead).toBe('No necesitas resolverlo ahora.')
    expect(textos.descarga.opcional).toBe('Opcional')
    expect(textos.descarga.omitir).toBe('Ahora no')
    expect(textos.descarga.cta).toBe('Dejarlo aquí y cerrar mi día')
    expect(textos.descarga.abrir).toBe('Necesito soltar algo antes de cerrar')
    expect(MAX_DESCARGA).toBe(400)
  })

  it('las cuatro emociones que la ofrecen son las de §8, y solo esas', () => {
    expect(EMOCIONES_DE_DESCARGA).toEqual(['inquieto', 'frustrado', 'triste', 'abrumado'])
    CIERRE.IDS.filter((id) => !EMOCIONES_DE_DESCARGA.includes(id)).forEach((id) =>
      expect(ofreceDescarga(id)).toBe(false),
    )
  })

  it('el enlace va debajo de todas las emociones, no solo de las cuatro', () => {
    // Si apareciera solo tras una emoción difícil, el catálogo se convertiría en
    // un diagnóstico: la app diría cuáles son las respuestas preocupantes.
    const bloque = MOMENTO('MomentoEmocion')
    expect(bloque).toMatch(/conDescarga && \(/)
    expect(bloque).not.toMatch(/ofreceDescarga|EMOCIONES_DE_DESCARGA/)
  })

  it('nunca es un paso obligatorio: es el cuarto y va fuera de la cuenta', () => {
    expect(MOMENTOS).toHaveLength(3)
    expect(MOMENTOS).not.toContain(PREGUNTAS.descarga)
    expect(CONTENEDOR).toMatch(/const PASO_DESCARGA = MOMENTOS\.length/)
    expect(CONTENEDOR).toMatch(/!enDescarga && <IndicadorPasos/)
  })

  it('no da consejo, no diagnostica y no responde a lo escrito', () => {
    const bloque = MOMENTO('MomentoDescarga')
    expect(bloque).not.toMatch(/analiz|sugerenc|consejo|recomend/i)
    const todo = JSON.stringify(textos.descarga)
    ;[/todo estará bien/i, /te sentirás/i, /deber[íi]as/i, /intenta/i].forEach((patron) =>
      expect(todo).not.toMatch(patron),
    )
  })
})

// ─── Criterio 9 ───────────────────────────────────────────────────────────────

describe('criterio 9 — la pregunta de liberación no se hace dos veces', () => {
  it('la noche en que la rotativa fue "soltar", la descarga no se ofrece', () => {
    expect(ID_SOLTAR).toBe('soltar')
    expect(puedeOfrecerDescarga({ reflectionId: ID_SOLTAR })).toBe(false)
    expect(puedeOfrecerDescarga({ reflectionId: 'general' })).toBe(true)
    expect(puedeOfrecerDescarga(null)).toBe(true)
  })

  it('se cierran las dos vías a la vez, no solo la automática', () => {
    // Si el enlace siguiera ahí, la pregunta seguiría estando dos veces.
    expect(CONTENEDOR).toMatch(/const descargaDisponible = puedeOfrecerDescarga\(night\)/)
    expect(CONTENEDOR).toMatch(/descargaDisponible &&/)
    expect(CONTENEDOR).toMatch(/conDescarga=\{descargaDisponible\}/)
  })
})

// ─── Criterio 10 ──────────────────────────────────────────────────────────────

describe('criterio 10 — todas las preguntas se pueden omitir', () => {
  it('ningún control del recorrido se deshabilita nunca', () => {
    expect(codigoDe('src/components/lumia/Pasos.jsx')).not.toMatch(/disabled/)
    ;['MomentoReconocimiento', 'MomentoReflexion', 'MomentoEmocion', 'MomentoDescarga'].forEach(
      (nombre) => expect(MOMENTO(nombre)).not.toMatch(/disabled|required|aria-invalid/),
    )
  })

  it('no hay una sola palabra que señale lo que quedó en blanco', () => {
    const todo = JSON.stringify(textos)
    ;[/incompleto/i, /te falt/i, /obligatori/i, /sin responder/i, /debes/i].forEach((patron) =>
      expect(todo).not.toMatch(patron),
    )
  })

  it('el reconocimiento y la reflexión tienen además su salida explícita', () => {
    expect(textos.reconocimiento.omitir).toBe('Omitir por hoy')
    expect(textos.reflexion.omitir).toBe('Ahora no')
    expect(textos.reflexion.opcional).toBe('Opcional')
    // "Omitir por hoy" solo con todo en blanco: con algo escrito sonaría a
    // descartarlo.
    expect(MOMENTO('MomentoReconocimiento')).toMatch(/enBlanco &&/)
  })

  it('con todo omitido el cierre funciona igual y no señala el vacío', () => {
    expect(algoQueReconoces(null)).toBe(null)
    expect(algoQueReconoces({ recognized: ['  '] })).toBe(null)
    expect(textos.cierre.titulo).toBe('Tu día puede terminar aquí.')
    expect(resumenDeNoche(null, null, 'n')).toEqual([])
  })

  it('lo omitido se anota, y solo se anota lo que llegó a preguntarse', () => {
    expect(camposOmitidos({}, { conDescarga: false })).toEqual([
      PREGUNTAS.reconocimiento,
      PREGUNTAS.reflexion,
      PREGUNTAS.emocion,
    ])
    expect(camposOmitidos({}, { conDescarga: true })).toContain(PREGUNTAS.descarga)

    const entera = {
      recognized: ['aguanté el día'],
      reflection: 'que puedo pedir ayuda',
      closingFeeling: 'aliviado',
      release: 'la conversación pendiente',
    }
    expect(camposOmitidos(entera, { conDescarga: true })).toEqual([])
  })
})

// ─── Criterio 11 ──────────────────────────────────────────────────────────────

describe('criterio 11 — tres momentos, no una lista de campos', () => {
  it('el indicador cuenta momentos y la descarga no entra en la cuenta', () => {
    expect(MOMENTOS).toEqual(['reconocimiento', 'reflexion', 'emocion'])
    expect(textos.pasos.indicadorTemplate).toBe('{n} de {total}')
    expect(CONTENEDOR).toMatch(/total=\{MOMENTOS\.length\}/)
  })

  it('se puede avanzar, retroceder y cambiar lo respondido', () => {
    expect(CONTENEDOR).toMatch(/onAtras=/)
    expect(CONTENEDOR).toMatch(/onSiguiente=\{avanzar\}/)
    expect(textos.pasos.atras).toBe('Atrás')
    // También desde la descarga, que es la única pantalla con controles propios.
    expect(MOMENTO('MomentoDescarga')).toMatch(/onAtras/)
  })

  it('la palabra "progreso" no aparece: esto no es una barra que llenar', () => {
    expect(JSON.stringify(textos)).not.toMatch(/progreso/i)
  })

  it('cada momento es un archivo, y no hay ninguno de más', () => {
    ;['MomentoReconocimiento', 'MomentoReflexion', 'MomentoEmocion', 'MomentoDescarga'].forEach(
      (nombre) => expect(existsSync(`src/components/lumia/noche/${nombre}.jsx`)).toBe(true),
    )
    // Los dos nombres del reparto anterior: si reaparecen, el recorrido se
    // partió de otra forma y esta prueba pide volver a mirarlo.
    ;['MomentoGratitudNoche', 'MomentoAprendizaje'].forEach((nombre) =>
      expect(existsSync(`src/components/lumia/noche/${nombre}.jsx`)).toBe(false),
    )
  })
})

// ─── Criterio 12 ──────────────────────────────────────────────────────────────

describe('criterio 12 — los registros anteriores quedan intactos', () => {
  it('el modelo guarda todo lo que §11 pide', () => {
    expect(FIELDS.nightRitual).toEqual([
      'version',
      'updatedAt',
      'completedAt',
      'skipped',
      'recognized',
      'reflectionId',
      'reflectionSource',
      'reflection',
      'closingFeeling',
      'closingFeelingOther',
      'release',
    ])
    expect(VERSION).toBe(2)
  })

  it('los cuatro campos de la versión 1 salieron de la escritura, no de la lectura', () => {
    ;['gratitude', 'learning', 'sleepState', 'sleepStateOther'].forEach((campo) =>
      expect(FIELDS.nightRitual).not.toContain(campo),
    )
    // Y las noches que los tienen siguen siendo noches con algo escrito.
    expect(hayAlgoEscrito({ gratitude: ['el café'] })).toBe(true)
    expect(hayAlgoEscrito({ learning: 'que se puede pedir ayuda' })).toBe(true)
    expect(hayAlgoEscrito({ sleepState: ['en_paz'] })).toBe(true)
    expect(hayAlgoEscrito(null)).toBe(false)
    expect(hayAlgoEscrito({})).toBe(false)
  })

  it('el Historial las pinta enteras, cada bloque en su versión', () => {
    const vista = codigoDe('src/components/lumia/VistaDiaCompleto.jsx')
    ;['recognized', 'reflection', 'release', 'gratitude', 'learning', 'sleepState'].forEach(
      (campo) => expect(vista).toMatch(new RegExp(campo)),
    )
  })

  it('el punto del calendario se deriva de las dos versiones', () => {
    expect(animoDeNoche({ closingFeeling: 'en_paz' })).toBe('en_paz')
    expect(animoDeNoche({ closingFeeling: 'triste' })).toBe('inquieto')
    expect(animoDeNoche({ sleepState: ['agradecido', 'cansado'] })).toBe('agotado')
    expect(animoDeNoche({ recognized: ['algo'] })).toBe(null)
    expect(animoDeNoche(null)).toBe(null)
  })

  it('`updatedAt` es hora local con desfase, no UTC', () => {
    // §11 pide "fecha y hora local": normalizar a UTC perdería justo el dato
    // que se pide, que es a qué hora era esto para quien lo escribió.
    expect(marcaLocal(new Date(2026, 7, 23, 22, 30, 5))).toMatch(
      /^2026-08-23T22:30:05[+-]\d{2}:\d{2}$/,
    )
  })

  it('el cierre se reconoce por su marca, no por cuánto se escribió', () => {
    expect(estaCerrada({ recognized: ['algo'] })).toBe(false)
    expect(estaCerrada({ completedAt: marcaLocal() })).toBe(true)
  })
})

// ─── §9 y §10 ─────────────────────────────────────────────────────────────────

describe('§9 — de lo anterior solo se usa lo que las reglas permiten', () => {
  it('no hay una sola frase que interprete un patrón emocional', () => {
    const todo = JSON.stringify(copy.diario.noche)
    ;[/sigues/i, /llevas varios/i, /parece que/i, /esto te sucede/i, /siempre te/i].forEach(
      (patron) => expect(todo).not.toMatch(patron),
    )
  })

  it('las noches anteriores solo llegan a la rotación, y nunca a la pantalla', () => {
    // `estado.noches` entra en un único sitio y sale de él una pregunta. Lo que
    // se escribió en ellas no se lee: `nocheReflexion.js` no toca ni un campo
    // de texto, y esa prueba está en el criterio 3.
    expect(CONTENEDOR.match(/estado\.noches/g) ?? []).toHaveLength(1)
    expect(CONTENEDOR).toMatch(/reflexionDeLaNoche\(\s*estado\.noches/)
  })
})

describe('§10 — el cierre no califica el día', () => {
  it('sus dos líneas son fijas y no dependen de cuánto se escribió', () => {
    expect(textos.cierre.titulo).toBe('Tu día puede terminar aquí.')
    expect(textos.cierre.lead).toBe('Lo que viviste hoy no necesita quedar resuelto esta noche.')
    expect(textos.cierre.leadDescarga).toBe('Por ahora, puedes dejarlo aquí.')
    expect(textos.cierre.reconocidoTitulo).toBe('Algo que reconoces de hoy')
    expect(textos.cierre.cta).toBe('Cerrar mi día')
  })

  it('muestra uno de los elementos reconocidos, no todos', () => {
    expect(algoQueReconoces({ recognized: [' llamé a mi madre ', 'terminé el informe'] })).toBe(
      'llamé a mi madre',
    )
    expect(MOMENTO('CierreDeLaNoche')).toMatch(/\{reconocido\}/)
  })

  it('se fueron el recuento, el punto de luz y el cierre compasivo', () => {
    const cierre = MOMENTO('CierreDeLaNoche')
    expect(cierre).not.toMatch(/sintesis|compasivo|animate-light-sweep/)
    ;['unaGracia', 'graciasTemplate', 'soloGraciasTemplate', 'nada', 'paz', 'compasivo'].forEach(
      (clave) => expect(textos.cierre[clave]).toBeUndefined(),
    )
  })

  it('no promete que nadie vaya a sentirse mejor', () => {
    const todo = JSON.stringify(textos.cierre)
    ;[/todo estará bien/i, /te sentirás/i, /mañana será mejor/i, /felicidades/i].forEach((patron) =>
      expect(todo).not.toMatch(patron),
    )
  })

  it('la despedida se queda: no celebra nada y deja la puerta abierta', () => {
    expect(textos.cierre.despedida).toBe('Buenas noches.')
    expect(textos.cierre.reabrir).toBe('Puedes volver y cambiar lo que quieras.')
  })
})

// ─── §12 y criterio 13 ────────────────────────────────────────────────────────

describe('§12 — la noche se puede recorrer con lector de pantalla y sin ver color', () => {
  it('cada campo lleva su etiqueta accesible', () => {
    ;['MomentoReflexion', 'MomentoDescarga'].forEach((nombre) =>
      expect(MOMENTO(nombre)).toMatch(/aria-label=/),
    )
    expect(codigoDe('src/components/lumia/FilasDinamicas.jsx')).toMatch(/aria-label=/)
  })

  it('las áreas táctiles no bajan del mínimo', () => {
    ;['MomentoReconocimiento', 'MomentoReflexion', 'MomentoEmocion', 'MomentoDescarga'].forEach(
      (nombre) => {
        const codigo = MOMENTO(nombre)
        const botones = codigo.match(/rounded-full[^'"`]*/g) ?? []
        botones.forEach((clase) => expect(clase).toMatch(/min-h-touch-sm/))
      },
    )
  })

  it('ningún componente de la noche fija un color de texto literal', () => {
    ;[
      'src/components/lumia/DiarioNoche.jsx',
      'src/components/lumia/noche/CierreDeLaNoche.jsx',
      'src/components/lumia/noche/MomentoDescarga.jsx',
      'src/components/lumia/noche/MomentoEmocion.jsx',
      'src/components/lumia/noche/MomentoReconocimiento.jsx',
      'src/components/lumia/noche/MomentoReflexion.jsx',
      'src/components/lumia/noche/ResumenNoche.jsx',
    ].forEach((ruta) =>
      expect(`${ruta}: ${codigoDe(ruta)}`).not.toMatch(/text-ink|text-paper|#[0-9a-f]{6}/i),
    )
  })

  it('no hay animaciones que estorben a la hora de descansar', () => {
    // Lo único que se mueve es el texto del cierre, y con movimiento reducido
    // tampoco.
    expect(MOMENTO('CierreDeLaNoche')).toMatch(/motion-reduce:animate-none/)
    ;['MomentoReconocimiento', 'MomentoReflexion', 'MomentoEmocion', 'MomentoDescarga'].forEach(
      (nombre) => expect(MOMENTO(nombre)).not.toMatch(/animate-/),
    )
  })

  it('no suena nada: la noche no tiene una sola llamada de audio', () => {
    expect(CONTENEDOR).not.toMatch(/audio|Audio|sonido/i)
  })
})

describe('criterio 13 — la mañana y el resto de Lumia no se tocan', () => {
  it('ningún archivo de la noche escribe en la mañana', () => {
    // Leer la intención sí; escribir, nunca. Lo que la noche toca de
    // `morningEntry` es una lectura y ni una escritura.
    ;[CONTENEDOR, codigoDe('src/lumia/noche.js'), codigoDe('src/lumia/nocheReflexion.js')].forEach(
      (codigo) => expect(codigo).not.toMatch(/guardarManana|escribirManana|saveMorningEntry/),
    )
  })

  it('la mañana conserva su ceremonia y su copy', () => {
    expect(copy.diario.manana.cierre.cta).toBe('Comenzar mi día')
    expect(copy.diario.manana.gratitud.titulo).toBe('¿Qué agradezco hoy?')
    expect(existsSync('src/components/lumia/manana/AperturaDelDia.jsx')).toBe(true)
  })

  it('ni el Journal ni los hábitos aparecen en ningún archivo de la noche', () => {
    // **Revisión del paso 8 (25 ago):** nombraba al producto pausado y ahora
    // nombra su vocabulario —`habit`—, que es lo que de verdad no puede volver a
    // entrar aquí. La regla no cambia; cambia cómo se comprueba, para que este
    // archivo no deletree un nombre que ya no existe en `src/`.
    ;['noche', 'nocheEmociones', 'nocheReflexion'].forEach((nombre) =>
      expect(codigoDe(`src/lumia/${nombre}.js`)).not.toMatch(/journal|habit/i),
    )
    expect(CONTENEDOR).not.toMatch(/journal|habit/i)
  })
})
