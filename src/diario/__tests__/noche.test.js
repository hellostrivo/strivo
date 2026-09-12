// src/diario/__tests__/noche.test.js
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
  MAX_PALABRAS_POR_RESPUESTA,
  alSalirDeFila,
  escribirEn,
  filasIniciales,
  puedeAnadir,
  textosDe,
} from '@/diario/filas'
import {
  MAX_DESCARGA,
  MAX_REFLEXION,
  MOMENTOS,
  PREGUNTAS,
  VERSION,
  algoQueReconoces,
  animoDeNoche,
  camposOmitidos,
  emocionesDeCierre,
  estaCerrada,
  fichasDeCierre,
  hayAlgoEscrito,
  marcaLocal,
  resumenDeNoche,
} from '@/diario/noche'
import {
  CIERRE,
  EMOCIONES_DE_DESCARGA,
  ID_OTRA,
  MAX_PALABRA_PROPIA,
  ORDEN_DE_ANIMO,
  animoDeCierre,
  animoDeEmocion,
  ofreceDescarga,
} from '@/diario/nocheEmociones'
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
} from '@/diario/nocheReflexion'
import {
  GRUPOS,
  GRUPO_POR_DEFECTO,
  grupoDeCierre,
  indiceDelDia,
  preguntasDe,
  reconocimientoDeLaNoche,
} from '@/diario/nocheReconocimiento'

const textos = copy.diario.noche

const codigoDe = (ruta) =>
  readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

const MOMENTO = (nombre) => codigoDe(`src/components/diario/noche/${nombre}.jsx`)
const CONTENEDOR = codigoDe('src/components/diario/DiarioNoche.jsx')

const HOY = '2026-08-23'
/** Una fecha cuya rotación deja la primera pregunta de cada grupo... la neutra. */
const FECHA = '2026-08-23'
/** Una noche del historial: fecha, qué pregunta salió y de dónde. */
const noche = (id, reflectionId, reflectionSource = FUENTES.rotativa) => ({
  id,
  reflectionId,
  reflectionSource,
})
/** Una mañana cerrada con intención, que es lo que §6 pide para vincular. */
const mananaCon = (intention, intentionOther = null) => ({
  completedAt: `${HOY}T08:00:00+02:00`,
  // La mañana guarda hasta tres desde el 30 de agosto de 2026, y de ellas la
  // noche toma **una**: la primera. Aquí se pasa una sola, que es el caso que
  // §6 describe.
  intentions: intention ? [intention] : [],
  intentionOther,
})

// ─── Criterio 1 ───────────────────────────────────────────────────────────────

describe('criterio 1 — el reconocimiento sustituye a la pregunta de gratitud', () => {
  it('la pregunta y su texto de apoyo se leen con su redacción exacta', () => {
    // Desde el 30 de agosto de 2026 la pregunta se dice en el tono del día, así
    // que ya no hay **una** redacción: hay tres grupos. La neutra es la que
    // llega cuando no se sabe nada —y así se entra al recorrido, porque la
    // emoción se elige dos momentos después—, y conserva la redacción y el
    // texto de apoyo de siempre.
    const neutra = reconocimientoDeLaNoche(null, FECHA)
    expect(neutra.grupo).toBe(GRUPOS.neutro)
    expect(neutra.titulo).toBe('¿Qué quiero reconocer de este día?')
    expect(neutra.lead).toBe(
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
    // Solo el grupo sereno puede preguntar por algo bueno, y solo porque la
    // persona acaba de decir que cierra el día en paz. Los otros dos no lo
    // hacen nunca: pedirle a quien llega cansado que encuentre lo bueno de su
    // día es exigirle que esté bien.
    ;[GRUPOS.neutro, GRUPOS.cuidado].forEach((grupo) => {
      const bloque = `${preguntasDe(grupo).join(' ')} ${textos.reconocimiento.grupos[grupo].lead}`
      ;[/tres cosas/i, /positiv/i, /bueno/i, /al menos/i, /escribe /i, /agradec/i].forEach(
        (patron) => expect(bloque).not.toMatch(patron),
      )
    })
    expect(textos.reconocimiento.placeholder).not.toMatch(/tres cosas|positiv|bueno|al menos/i)
  })

  it('todas las preguntas hablan en primera persona (§12)', () => {
    const enPrimera = /\bme\b|\bmi\b|\bm[ií]|quiero|necesito|aprend/i
    const enSegunda = /\bt[uúe]\b|\btus\b|\bpiensa\b|\bescribe\b/i
    const titulos = [
      // Las quince del reconocimiento, no solo la que salga hoy: la regla es de
      // todas las preguntas de la noche, y una sola en segunda persona se
      // colaría el día que le tocara rotar.
      ...Object.values(GRUPOS).flatMap((grupo) => preguntasDe(grupo)),
      textos.emocion.titulo,
      ...BANCO.map((pregunta) => pregunta.titulo),
      // Las dos que faltaban, y por las que esto se revisó (30 ago 2026):
      // llevaban en segunda persona desde el 23 de agosto con la suite en
      // verde, porque esta lista se escribe a mano y nadie las metió. Toda
      // pregunta que se conteste escribiendo va aquí — la descarga se contesta
      // escribiendo y la ligada a la mañana también.
      textos.descarga.titulo,
      textos.reflexion.manana.tituloTemplate,
    ]
    titulos.forEach((titulo) => {
      expect(titulo).toMatch(enPrimera)
      expect(titulo).not.toMatch(enSegunda)
    })
  })
})

// ─── La pregunta se dice en el tono del día (30 ago 2026) ────────────────────

describe('la pregunta del reconocimiento acompaña el ánimo, y no lo interpreta', () => {
  it('las trece emociones del catálogo caen en un grupo, y solo en uno', () => {
    // Lista cerrada y explícita (RN-06): se mira el id, jamás lo que alguien
    // escribió. Las cinco de cuidado son las cuatro que ya abren la tarjeta de
    // descarga más el cansancio, que no pide soltar nada pero tampoco está para
    // buscarle el lado bueno al día.
    const porGrupo = (grupo) => CIERRE.IDS.filter((id) => grupoDeCierre(id) === grupo)

    expect(porGrupo(GRUPOS.sereno)).toEqual([
      'en_paz',
      'feliz',
      'tranquilo',
      'agradecido',
      'orgulloso',
      'aliviado',
    ])
    expect(porGrupo(GRUPOS.neutro)).toEqual(['pensativo', 'neutral'])
    expect(porGrupo(GRUPOS.cuidado)).toEqual([
      'cansado',
      'inquieto',
      'frustrado',
      'triste',
      'abrumado',
    ])
    // Ni una se queda fuera, y ninguna está en dos sitios.
    expect(porGrupo(GRUPOS.sereno).length + porGrupo(GRUPOS.neutro).length).toBe(8)
    expect(CIERRE.IDS).toHaveLength(13)
  })

  it('sin emoción elegida se pregunta en neutro: así se entra al recorrido', () => {
    // La pregunta es el primer momento y la emoción se elige en el tercero, así
    // que la primera vez que se lee no se sabe nada del día. No se da por hecho
    // que fue bueno ni que fue malo.
    expect(GRUPO_POR_DEFECTO).toBe(GRUPOS.neutro)
    expect(grupoDeCierre(null)).toBe(GRUPOS.neutro)
    expect(grupoDeCierre([])).toBe(GRUPOS.neutro)
  })

  it('la palabra propia no se clasifica: se pregunta en neutro', () => {
    // Colocar en una escala una palabra que alguien acaba de nombrar sería
    // exactamente el diagnóstico que §9 prohíbe (RN-NOC-10).
    expect(grupoDeCierre(ID_OTRA)).toBe(GRUPOS.neutro)
    expect(grupoDeCierre('una_de_otra_version')).toBe(GRUPOS.neutro)
  })

  it('con varias elegidas, una difícil manda sobre todas las demás', () => {
    // Nunca una pregunta de gratitud sobre un día que alguien acaba de nombrar
    // difícil, ni aunque haya nombrado también algo sereno.
    expect(grupoDeCierre(['en_paz', 'triste'])).toBe(GRUPOS.cuidado)
    expect(grupoDeCierre(['agradecido', 'cansado'])).toBe(GRUPOS.cuidado)
    // Y solo se pregunta por algo bueno cuando **todas** son serenas.
    expect(grupoDeCierre(['en_paz', 'agradecido'])).toBe(GRUPOS.sereno)
    expect(grupoDeCierre(['en_paz', 'pensativo'])).toBe(GRUPOS.neutro)
    expect(grupoDeCierre(['en_paz', ID_OTRA])).toBe(GRUPOS.neutro)
  })

  it('a quien cierra el día en difícil no se le pide encontrar algo bueno', () => {
    const dificil = reconocimientoDeLaNoche('triste', FECHA)
    expect(dificil.grupo).toBe(GRUPOS.cuidado)
    expect(dificil.titulo).not.toMatch(/bueno|agradec|disfrut|positiv/i)
    expect(dificil.lead).toBe('No hace falta que haya sido un buen día.')
  })

  it('rota por fecha: la misma toda la noche, distinta a la siguiente', () => {
    // Se deriva y no se guarda, a propósito: congelarla al mostrarse —como hace
    // la reflexión— la dejaría clavada en el grupo equivocado en cuanto alguien
    // cambiara su emoción de cierre, que es justo lo que tiene que poder pasar.
    expect(reconocimientoDeLaNoche('triste', FECHA).titulo).toBe(
      reconocimientoDeLaNoche('triste', FECHA).titulo,
    )
    expect(reconocimientoDeLaNoche('triste', '2026-08-21').titulo).not.toBe(
      reconocimientoDeLaNoche('triste', '2026-08-22').titulo,
    )
  })

  it('recorre el grupo entero antes de repetir ninguna', () => {
    const cuantas = preguntasDe(GRUPOS.cuidado).length
    const dias = ['2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24']
    const salidas = dias.map((dia) => reconocimientoDeLaNoche('cansado', dia).titulo)
    expect(new Set(salidas).size).toBe(cuantas)
    // Y a la vuelta empieza otra vez por donde empezó.
    expect(reconocimientoDeLaNoche('cansado', '2026-08-25').titulo).toBe(salidas[0])
  })

  it('sin fecha legible sale la primera del grupo, no se rompe nada', () => {
    expect(indiceDelDia(null, 5)).toBe(0)
    expect(indiceDelDia('no es una fecha', 5)).toBe(0)
    expect(indiceDelDia(FECHA, 0)).toBe(0)
    expect(reconocimientoDeLaNoche('triste', null).titulo).toBe(preguntasDe(GRUPOS.cuidado)[0])
  })

  it('cambiar la emoción cambia la pregunta y las ideas, y nada más', () => {
    // Lo escrito no se toca: este módulo devuelve texto y las filas viven en el
    // estado del recorrido. Aquí se comprueba lo que sí cambia.
    const antes = reconocimientoDeLaNoche('en_paz', FECHA)
    const despues = reconocimientoDeLaNoche('triste', FECHA)
    expect(despues.titulo).not.toBe(antes.titulo)
    expect(despues.sugerencias).not.toBe(antes.sugerencias)
    // Y la pregunta se arma con la emoción de pantalla, no con la guardada.
    expect(CONTENEDOR).toMatch(/reconocimientoDeLaNoche\(valores\.emociones, estado\.fecha\)/)
    expect(CONTENEDOR).not.toMatch(/reconocimientoDeLaNoche\(night/)
  })

  it('ninguna repite lo que ya se pregunta esa misma noche', () => {
    // Una noche enseña hasta cuatro preguntas: esta, la reflexión, la emoción y
    // la descarga. El banco de la reflexión y la descarga llevan meses estables,
    // así que fijan el vocabulario y el reconocimiento se aparta.
    //
    // Se comparan los verbos que hacen la pregunta, no las palabras sueltas:
    // "hoy" y "día" están en casi todas y no hacen que dos sean la misma.
    const YA_OCUPADOS = [
      /me dej[óo]/i, // "¿Qué me dejó el día de hoy?"
      /me llevo/i, //   ...y decirlo al revés es decir lo mismo
      /aprend[íi]/i, // "¿Qué aprendí hoy sobre mí?"
      /recordar/i, // "¿Qué quiero recordar de este día?"
      /guardar/i, //    ...y "guardar" es "recordar" con otra palabra
      /ocup[óo]/i, // "¿Qué ocupó más espacio en mí hoy?"
      /soltar/i, // "¿Qué necesito soltar por hoy?"
      /dejar/i, // la descarga: "¿Hay algo de mi día que quiera dejar aquí?"
      /¿hay algo que quier/i, //  ...y su forma de abrir, que es lo que se
      //                            reconoce antes de leerla entera
    ]

    Object.values(GRUPOS)
      .flatMap((grupo) => preguntasDe(grupo))
      .forEach((pregunta) => YA_OCUPADOS.forEach((patron) => expect(pregunta).not.toMatch(patron)))
  })

  it('las ideas de apoyo no repiten el encabezado que tienen encima', () => {
    // Son texto de apoyo y tutean, que es lo correcto ahí. Lo que no pueden es
    // decir lo mismo que la pregunta de arriba: dos veces lo mismo en una
    // pantalla se lee como un fallo, no como una ayuda.
    const nucleo = (texto) =>
      texto
        .toLocaleLowerCase('es')
        .replace(/[¿?.,]/g, '')
        .split(/\s+/)
        .filter((palabra) => palabra.length > 3 && !['hoy', 'día', 'algo'].includes(palabra))
        .join(' ')

    Object.values(GRUPOS).forEach((grupo) => {
      const encabezados = preguntasDe(grupo).map(nucleo)
      textos.reconocimiento.grupos[grupo].sugerencias.opciones.forEach((opcion) => {
        const idea = nucleo(opcion.pregunta)
        encabezados.forEach((encabezado) => expect(idea).not.toBe(encabezado))
      })
    })
  })

  it('la consulta repite la pregunta que se contestó, no una genérica', () => {
    // Se rehace con la emoción guardada y la fecha, que están las dos en el
    // registro: no hace falta un campo más para poder releerla (RN-MAN-21).
    const escrita = { recognized: ['seguí adelante'], closingFeeling: 'triste' }
    const [bloque] = resumenDeNoche(escrita, null, 'f', FECHA)
    expect(bloque.titulo).toBe(reconocimientoDeLaNoche('triste', FECHA).titulo)
    expect(bloque.titulo).not.toBe(reconocimientoDeLaNoche('en_paz', FECHA).titulo)
  })
})

// ─── Criterio 2 ───────────────────────────────────────────────────────────────

describe('criterio 2 — el reconocimiento admite hasta cinco elementos', () => {
  it('abre con un solo campo, no con cinco huecos por rellenar', () => {
    // Eran tres hasta el 10 de septiembre de 2026. Lo que no cambia es cómo
    // abre: un campo, y los demás los pide quien escribe.
    expect(LIMITES.reconocimiento).toEqual({
      min: 1,
      max: 5,
      crecerSola: false,
      palabras: MAX_PALABRAS_POR_RESPUESTA,
    })
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

  it('sigue ofreciéndose en el tercero y deja de ofrecerse en el quinto', () => {
    const filasCon = (cuantas) =>
      Array.from({ length: cuantas }, (_, indice) => ({ id: null, texto: `linea ${indice}` }))
    expect(puedeAnadir(filasCon(3), LIMITES.reconocimiento)).toBe(true)
    expect(puedeAnadir(filasCon(4), LIMITES.reconocimiento)).toBe(true)
    expect(puedeAnadir(filasCon(5), LIMITES.reconocimiento)).toBe(false)
  })

  it('el tope no se anuncia: una lista de cinco se ve entera', () => {
    // La frase del tope es de una lista que puede llegar a diez. Contar lo que
    // queda convertiría en un objetivo algo que no lo es.
    expect(MOMENTO('MomentoReconocimiento')).toMatch(/textoTope=\{null\}/)
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
      { id: null, texto: 'salí a caminar' },
      { id: null, texto: 'dormí la siesta' },
    ]
    expect(textosDe(filas)).toEqual([
      'llamé a mi madre',
      'terminé el informe',
      'salí a caminar',
      'dormí la siesta',
    ])
  })

  it('cada respuesta cabe en cuatrocientas palabras, y no en una línea', () => {
    // Era un tope de 160 caracteres en un campo de una línea (12 sep 2026). El
    // tope vive con los límites de la lista y lo aplica la mecánica, no la
    // pantalla: no queda `maxLength` ni constante de caracteres.
    expect(LIMITES.reconocimiento.palabras).toBe(MAX_PALABRAS_POR_RESPUESTA)
    expect(MOMENTO('MomentoReconocimiento')).not.toMatch(/maxLength|MAX_RECONOCIMIENTO_LINEA/)
  })

  it('el bloque ofrece ideas, y son las de la pregunta que está en pantalla', () => {
    // No las tenía: la pregunta traía su propio abanico en el texto de apoyo y
    // una lista genérica encima habría sido decirle a alguien de qué tiene que
    // hablar su día. Ahora que la pregunta se estrecha para acompañar, las
    // ideas la acompañan a ella. Es el mismo componente de la mañana, con su
    // misma espera y sus mismos dos "Ahora no".
    const bloque = MOMENTO('MomentoReconocimiento')
    expect(bloque).toMatch(/import CampoGratitud from/)
    expect(bloque).toMatch(/sugerencias=\{pregunta\.sugerencias\}/)
    // Y nunca escriben por nadie: eso lo garantiza `CampoGratitud`, que abre
    // una pregunta detonante y no toca el campo.
    expect(bloque).not.toMatch(/onCambiar\(.*opcion|setTexto|value=\{opcion/)
  })

  it('cada grupo trae sus propias ideas, no unas generales', () => {
    const opcionesDe = (grupo) =>
      textos.reconocimiento.grupos[grupo].sugerencias.opciones.map((o) => o.id)
    const [sereno, neutro, cuidado] = [GRUPOS.sereno, GRUPOS.neutro, GRUPOS.cuidado].map(opcionesDe)
    expect(sereno).not.toEqual(neutro)
    expect(neutro).not.toEqual(cuidado)
    // A quien llega cansado no se le sugiere buscar lo bueno del día.
    const texto = JSON.stringify(textos.reconocimiento.grupos[GRUPOS.cuidado].sugerencias)
    expect(texto).not.toMatch(/bueno|disfrut|agradec|amable/i)
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
    ).toBe('Esta mañana elegí Presente como intención. ¿Qué noté en mí?')
    expect(preguntaGuardada(null, null, 'n')).toBe(null)
    // Sin intención en esa mañana no se inventa una frase a medias.
    expect(
      preguntaGuardada({ reflectionId: ID_MANANA, reflectionSource: FUENTES.manana }, null, 'n'),
    ).toBe(null)
  })

  it('la rotación no interpreta nada de lo escrito: solo mira ids y fechas', () => {
    const codigo = codigoDe('src/diario/nocheReflexion.js')
    expect(codigo).not.toMatch(/\.reflection\b|\.recognized\b|\.release\b|\.text\b/)
  })
})

// ─── Criterio 4 ───────────────────────────────────────────────────────────────

describe('criterio 4 — la conexión con la mañana, como mucho dos veces por semana', () => {
  it('nombra la intención y pregunta qué se notó, nunca si se cumplió', () => {
    expect(textos.reflexion.manana.tituloTemplate).toBe(
      'Esta mañana elegí {emocion} como intención. ¿Qué noté en mí?',
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
    expect(elegida.titulo).toBe('Esta mañana elegí En calma como intención. ¿Qué noté en mí?')
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
      'Esta mañana elegí con menos prisa como intención. ¿Qué noté en mí?',
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
    const codigo = codigoDe('src/diario/nocheReflexion.js')
    ;[/gratitude/, /\.action\b/, /granVision/, /feeling/].forEach((patron) =>
      expect(codigo).not.toMatch(patron),
    )
    expect(CONTENEDOR).not.toMatch(/morning\.(gratitude|action|granVision|feeling)/)
  })
})

// ─── Criterio 5 y 6 ───────────────────────────────────────────────────────────

describe('criterio 5 y 6 — la emoción de cierre, hasta tres', () => {
  it('la pregunta sustituye a "¿Cómo te vas a dormir?"', () => {
    expect(textos.emocion.titulo).toBe('¿Cómo me siento al cerrar el día?')
    expect(textos.emocion.lead).toBe('Elige hasta tres, las que más se acerquen a cómo estás.')
    expect(JSON.stringify(copy.diario)).not.toMatch(/¿Cómo te vas a dormir\?/)
  })

  it('el catálogo son las trece de §7, en su orden y con su emoji', () => {
    expect(CIERRE.CATALOGO.map((opcion) => opcion.id)).toEqual([
      'en_paz',
      'feliz',
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

  it('"Feliz" entra detrás de "En paz" y no es un caso aparte', () => {
    // Se añadió el 2 de septiembre de 2026 y no trajo mecánica propia: misma
    // forma de opción, mismo chip, misma mecánica, mismo ánimo sereno. Lo que
    // no toca es el tope ni la palabra propia.
    expect(CIERRE.IDS.indexOf('feliz')).toBe(CIERRE.IDS.indexOf('en_paz') + 1)
    expect(CIERRE.es('feliz')).toBe(true)

    const opcion = CIERRE.CATALOGO[1]
    expect(Object.keys(opcion).sort()).toEqual(['emoji', 'id', 'label'])
    expect(opcion.emoji).toBeTruthy()

    // Sin marca de género: "feliz" no la lleva, y las tres formas coinciden.
    expect(['m', 'f', 'n'].map((genero) => CIERRE.etiquetaDe('feliz', genero))).toEqual([
      'Feliz',
      'Feliz',
      'Feliz',
    ])

    // Se elige, se suelta y se guarda como cualquier otra: un id, nunca la
    // etiqueta (RN-DB-06).
    expect(CIERRE.alternarVarias([], 'feliz').seleccion).toEqual(['feliz'])
    expect(CIERRE.alternarVarias(['triste'], 'feliz').seleccion).toEqual(['triste', 'feliz'])
    expect(CIERRE.alternarVarias(['feliz'], 'feliz').seleccion).toEqual([])
    expect(CIERRE.paraGuardarVarias(['feliz'], '')).toEqual({ valores: ['feliz'], otro: null })

    // Y cae en la escala de cinco sin ampliarla, y en el grupo sereno: quien
    // cierra el día feliz acaba de decir que fue bueno.
    expect(animoDeEmocion('feliz')).toBe('en_paz')
    expect(grupoDeCierre('feliz')).toBe(GRUPOS.sereno)
    // No pide soltar nada por su cuenta, como el resto de las serenas.
    expect(ofreceDescarga('feliz')).toBe(false)
  })

  it('las emociones difíciles no llevan tratamiento distinto', () => {
    // Ni marca en el dato, ni orden que las relegue al final del todo, ni una
    // sola palabra de aviso en el copy.
    CIERRE.CATALOGO.forEach((opcion) =>
      expect(Object.keys(opcion).sort()).toEqual(['emoji', 'id', 'label']),
    )
    const chips = codigoDe('src/components/diario/ChipsCatalogo.jsx')
    expect(chips).not.toMatch(/dificil|alerta|rojo|red-|warning/i)
    // Y no hay ninguna rama por emoción: el componente no nombra ni un id del
    // catálogo salvo el de la palabra propia, que no es una emoción. La única
    // frase que puede aparecer —el aviso del tope de la mañana— es de cuántas
    // caben, no de cuál se eligió: llega entera desde fuera y no se toca aquí.
    CIERRE.IDS.forEach((id) => expect(chips).not.toMatch(new RegExp(`'${id}'`)))
    expect(chips).toMatch(/avisoTexto/)
    expect(chips).not.toMatch(/avisoTexto[\s\S]{0,80}(dificil|triste|inquieto)/i)
    // Sobre el bloque de la emoción, no sobre todo el copy: "una preocupación"
    // es una de las cosas que §4 ofrece nombrar en la reflexión.
    expect(JSON.stringify(textos.emocion)).not.toMatch(/cuidado|preocupa|alarma|problema/i)
  })

  it('caben tres, y tocar una elegida la suelta', () => {
    // Hasta el 10 de septiembre de 2026 cabía una sola. Lo pidió el propietario
    // del producto: un día no se cierra sintiendo una sola cosa.
    expect(CIERRE.MAXIMO).toBe(3)
    expect(CIERRE.alternarVarias([], 'triste').seleccion).toEqual(['triste'])
    expect(CIERRE.alternarVarias(['triste'], 'en_paz').seleccion).toEqual(['triste', 'en_paz'])
    expect(CIERRE.alternarVarias(['triste', 'en_paz'], 'triste').seleccion).toEqual(['en_paz'])
    expect(CIERRE.paraGuardarVarias(['en_paz', 'cansado'], '')).toEqual({
      valores: ['en_paz', 'cansado'],
      otro: null,
    })
  })

  it('la cuarta no entra hasta soltar alguna, y se dice en voz baja', () => {
    // La alternativa —dejarla entrar soltando la más antigua, como el Journal—
    // se descartó en la mañana y aquí vale lo mismo: quitarle a alguien algo
    // que acaba de decir de sí mismo para hacer sitio es peor que no añadir.
    const tres = ['cansado', 'agradecido', 'pensativo']
    const cuarta = CIERRE.alternarVarias(tres, 'en_paz')
    expect(cuarta.seleccion).toEqual(tres)
    expect(cuarta.topeAlcanzado).toBe(true)

    // Y soltar una deja sitio otra vez: nada queda bloqueado.
    const dos = CIERRE.alternarVarias(tres, 'agradecido')
    expect(dos.seleccion).toEqual(['cansado', 'pensativo'])
    expect(CIERRE.alternarVarias(dos.seleccion, 'en_paz').seleccion).toHaveLength(3)

    // El aviso dice qué pasa, no qué se hizo mal, y no reprende.
    expect(textos.emocion.max).toBe('Caben tres a la vez. Suelta alguna si quieres cambiarla.')
    expect(MOMENTO('MomentoEmocion')).toMatch(/avisoTexto=\{textos\.emocion\.max\}/)
  })

  it('nada bloquea: la pregunta se puede dejar en blanco entera', () => {
    // §14, no-negociable 1. El tope es lo único que no crece; ningún chip se
    // apaga y ningún control lleva `disabled` (eso lo prueba `ChipsCatalogo`).
    expect(CIERRE.paraGuardarVarias([], '')).toEqual({ valores: [], otro: null })
    expect(camposOmitidos({})).toContain(PREGUNTAS.emocion)
    expect(MOMENTO('MomentoEmocion')).not.toMatch(/disabled|required|aria-invalid/)
  })

  it('el guardado es una lista, y las noches de antes se releen igual', () => {
    // RN-DB-04 — `closingFeeling` sale de la escritura, no de la lectura: una
    // noche de agosto guardó un id suelto y se sigue leyendo tal cual.
    expect(emocionesDeCierre({ closingFeelings: ['en_paz', 'cansado'] })).toEqual([
      'en_paz',
      'cansado',
    ])
    expect(emocionesDeCierre({ closingFeeling: 'en_paz' })).toEqual(['en_paz'])
    expect(emocionesDeCierre({})).toEqual([])
    expect(emocionesDeCierre(null)).toEqual([])

    expect(CONTENEDOR).toMatch(/closingFeelings: elegidas\.valores/)
    expect(CONTENEDOR).not.toMatch(/closingFeeling:/)
    expect(CONTENEDOR).toMatch(/emocionesDeCierre\(night\)/)
  })

  it('con varias, el punto del calendario lo decide la más pesada', () => {
    // No es una regla nueva: es la que ya aplicaba `animoDerivado` a las noches
    // de la versión 1, que también guardaban dos estados. La app no maquilla el
    // día de nadie para que el calendario se vea mejor.
    expect(animoDeCierre(['agradecido', 'cansado'])).toBe('agotado')
    expect(animoDeCierre(['en_paz', 'tranquilo'])).toBe('tranquilo')
    expect(animoDeCierre(['triste', 'feliz'])).toBe('inquieto')
    expect(animoDeCierre('en_paz')).toBe('en_paz')
    expect(animoDeCierre([])).toBe('normal')
    // La palabra propia no arrastra a nada: cae en el centro de la escala.
    expect(animoDeCierre([ID_OTRA, 'en_paz'])).toBe('normal')
    // Y el orden vive en un solo sitio, de lo más pesado a lo más ligero.
    expect(ORDEN_DE_ANIMO).toEqual(['agotado', 'inquieto', 'normal', 'tranquilo', 'en_paz'])
    expect(codigoDe('src/diario/estadoSueno.js')).toMatch(/animoMasPesado/)
  })

  it('una difícil entre varias sigue ofreciendo la descarga', () => {
    // Lista cerrada y explícita, nunca un análisis (RN-06): que alguien esté
    // además agradecido no desmiente que esté inquieto.
    expect(ofreceDescarga(['agradecido', 'inquieto'])).toBe(true)
    expect(ofreceDescarga(['agradecido', 'en_paz'])).toBe(false)
    expect(ofreceDescarga([])).toBe(false)
    expect(ofreceDescarga('triste')).toBe(true)
  })

  it('se anuncia como algo que se puede soltar, no como un radio', () => {
    // Un radio no se deselecciona; este chip sí, y decir lo contrario sería
    // mentirle a quien usa un lector de pantalla.
    const chips = codigoDe('src/components/diario/ChipsCatalogo.jsx')
    expect(chips).toMatch(/aria-pressed=/)
    expect(chips).not.toMatch(/type="radio"|role="radio"/)
  })

  it('lo elegido no se distingue solo por color (§12)', () => {
    const pildora = codigoDe('src/components/shared/pildora.js')
    expect(pildora).toMatch(/border-current/)
    expect(pildora).toMatch(/font-medium/)
    const chips = codigoDe('src/components/diario/ChipsCatalogo.jsx')
    expect(chips).toMatch(/MARCA/)
  })

  it('las etiquetas se resuelven al género vigente, también en lo ya guardado', () => {
    const cansada = (genero) => fichasDeCierre({ closingFeelings: ['cansado'] }, genero)[0].texto
    expect(cansada('f')).toBe('Cansada')
    expect(cansada('m')).toBe('Cansado')
    expect(cansada('n')).toBe('Con cansancio')
    // Y una noche de agosto, con su id suelto, se lee igual.
    expect(fichasDeCierre({ closingFeeling: 'cansado' }, 'f')[0].texto).toBe('Cansada')
  })

  it('se leen todas y en el orden en que se eligieron, con su emoji', () => {
    const fichas = fichasDeCierre({ closingFeelings: ['cansado', 'agradecido'] }, 'f')
    expect(fichas.map((ficha) => ficha.texto)).toEqual(['Cansada', 'Agradecida'])
    expect(fichas.every((ficha) => ficha.emoji)).toBe(true)
    // Un id de una versión anterior del catálogo se cae, no se pinta en blanco.
    expect(fichasDeCierre({ closingFeelings: ['contento'] }, 'f')).toEqual([])
  })
})

// ─── Criterio 7 ───────────────────────────────────────────────────────────────

describe('criterio 7 — "Algo más" se crea, se elige, se edita y se quita', () => {
  it('acepta hasta 30 caracteres y no los transforma', () => {
    expect(MAX_PALABRA_PROPIA).toBe(30)
    expect(CIERRE.paraGuardarVarias([ID_OTRA], 'a'.repeat(50)).otro).toHaveLength(30)
    expect(CIERRE.paraGuardarVarias([ID_OTRA], 'con la cabeza en otro sitio').otro).toBe(
      'con la cabeza en otro sitio',
    )
  })

  it('sin nada escrito no se guarda un chip vacío', () => {
    expect(CIERRE.paraGuardarVarias([ID_OTRA], '   ')).toEqual({ valores: [], otro: null })
    // Y convive con las del catálogo sin llevárselas por delante.
    expect(CIERRE.paraGuardarVarias(['en_paz', ID_OTRA], '   ')).toEqual({
      valores: ['en_paz'],
      otro: null,
    })
  })

  it('se relee entre comillas y sin emoji asignado', () => {
    const propia = fichasDeCierre(
      { closingFeelings: [ID_OTRA], closingFeelingOther: 'raro' },
      'f',
    )[0]
    expect(propia.texto).toBe('«raro»')
    expect(propia.emoji).toBe(null)
    expect(CIERRE.emojiDe(ID_OTRA)).toBe(null)
    expect(textos.emocion.otra.chip).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
  })

  it('el componente ofrece confirmar, editar y quitar', () => {
    const chips = codigoDe('src/components/diario/ChipsCatalogo.jsx')
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
    expect(textos.descarga.titulo).toBe('¿Hay algo de mi día que quiera dejar aquí?')
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
    expect(codigoDe('src/components/diario/Pasos.jsx')).not.toMatch(/disabled/)
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
      (nombre) => expect(existsSync(`src/components/diario/noche/${nombre}.jsx`)).toBe(true),
    )
    // Los dos nombres del reparto anterior: si reaparecen, el recorrido se
    // partió de otra forma y esta prueba pide volver a mirarlo.
    ;['MomentoGratitudNoche', 'MomentoAprendizaje'].forEach((nombre) =>
      expect(existsSync(`src/components/diario/noche/${nombre}.jsx`)).toBe(false),
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
      'closingFeelings',
      'closingFeelingOther',
      'release',
    ])
    // `closingFeeling` salió de la escritura el 10 de septiembre de 2026, no de
    // la lectura: donde había un id ahora hay una lista (RN-DB-04).
    expect(FIELDS.nightRitual).not.toContain('closingFeeling')
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
    const vista = codigoDe('src/components/diario/VistaDiaCompleto.jsx')
    ;['recognized', 'reflection', 'release', 'gratitude', 'learning', 'sleepState'].forEach(
      (campo) => expect(vista).toMatch(new RegExp(campo)),
    )
  })

  it('el punto del calendario se deriva de las dos versiones', () => {
    expect(animoDeNoche({ closingFeelings: ['en_paz'] })).toBe('en_paz')
    expect(animoDeNoche({ closingFeelings: ['triste'] })).toBe('inquieto')
    expect(animoDeNoche({ closingFeelings: ['agradecido', 'cansado'] })).toBe('agotado')
    // Las noches de antes traen su id suelto y se leen igual.
    expect(animoDeNoche({ closingFeeling: 'en_paz' })).toBe('en_paz')
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
    expect(codigoDe('src/components/diario/FilasDinamicas.jsx')).toMatch(/aria-label=/)
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
      'src/components/diario/DiarioNoche.jsx',
      'src/components/diario/noche/CierreDeLaNoche.jsx',
      'src/components/diario/noche/MomentoDescarga.jsx',
      'src/components/diario/noche/MomentoEmocion.jsx',
      'src/components/diario/noche/MomentoReconocimiento.jsx',
      'src/components/diario/noche/MomentoReflexion.jsx',
      'src/components/diario/noche/ResumenNoche.jsx',
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

describe('criterio 13 — la mañana y el resto del diario no se tocan', () => {
  it('ningún archivo de la noche escribe en la mañana', () => {
    // Leer la intención sí; escribir, nunca. Lo que la noche toca de
    // `morningEntry` es una lectura y ni una escritura.
    ;[
      CONTENEDOR,
      codigoDe('src/diario/noche.js'),
      codigoDe('src/diario/nocheReflexion.js'),
    ].forEach((codigo) =>
      expect(codigo).not.toMatch(/guardarManana|escribirManana|saveMorningEntry/),
    )
  })

  it('la mañana conserva su ceremonia y su copy', () => {
    expect(copy.diario.manana.cierre.cta).toBe('Comenzar mi día')
    expect(copy.diario.manana.gratitud.titulo).toBe('¿Qué agradezco hoy?')
    expect(existsSync('src/components/diario/manana/AperturaDelDia.jsx')).toBe(true)
  })

  it('ni el Journal ni los hábitos aparecen en ningún archivo de la noche', () => {
    // **Revisión del paso 8 (25 ago):** nombraba al producto pausado y ahora
    // nombra su vocabulario —`habit`—, que es lo que de verdad no puede volver a
    // entrar aquí. La regla no cambia; cambia cómo se comprueba, para que este
    // archivo no deletree un nombre que ya no existe en `src/`.
    ;['noche', 'nocheEmociones', 'nocheReflexion'].forEach((nombre) =>
      expect(codigoDe(`src/diario/${nombre}.js`)).not.toMatch(/journal|habit/i),
    )
    expect(CONTENEDOR).not.toMatch(/journal|habit/i)
  })
})
