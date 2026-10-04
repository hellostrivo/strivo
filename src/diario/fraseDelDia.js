// src/diario/fraseDelDia.js
// Qué frase le toca a un día, para unas preferencias (SPEC_28 §11).
//
// Es aire, no información: la elección es local, sin red, sin uid y sin azar.
// La misma fecha, las mismas preferencias y el mismo catálogo dan siempre la
// misma frase, en la Mañana y en la Noche.
//
// ─── Cómo se elige ───────────────────────────────────────────────────────────
//
// 1. **El tema rota por día**, en el orden de `TEMAS`: gratitud, calma,
//    identidad, aceptación, esfuerzo. Dos días consecutivos no comparten tema.
//
// 2. **Cada tema es un ciclo propio de cada perfil.** Se toman las frases
//    aprobadas que el perfil puede ver y se agrupan por audiencia —universal,
//    secular, espiritual general o cada afinidad elegida—. Dentro de cada grupo
//    el orden es el de un hash del id, **no el del array**: reordenar los
//    archivos del catálogo no mueve nada. Los grupos se intercalan con un
//    turno ponderado por su tamaño (round robin ponderado suave), así que en
//    cualquier tramo del ciclo cada afinidad aparece en proporción a lo que
//    aporta y **ninguna elegida queda relegada al final**. Tampoco hay una
//    «primera» afinidad: las afinidades se ordenan alfabéticamente antes de
//    llegar aquí, y el reparto no depende de ese orden.
//
// 3. **Cada perfil entra a su ciclo por un punto distinto** (un desfase que sale
//    de la huella de preferencias y del tema) y avanza una posición cada cinco
//    días. Un ciclo de L frases da L apariciones distintas de ese tema, así que
//    con 100 o más por tema **ninguna frase se repite en 500 días**. No es un
//    módulo sobre el repertorio filtrado: filtrar acorta el array y desplaza
//    todos los índices, que es lo que hacía repetir al selector anterior.
//
// 4. **Con ánimo bajo**, el día de esfuerzo se sustituye por calma, y se toma
//    de la mitad opuesta de su ciclo: lo que el ciclo regular mostrará en los
//    próximos días queda lejos de la sustituta. Es calma y no aceptación porque
//    los vecinos de esfuerzo son aceptación y gratitud: así no se repite tema
//    en días consecutivos. Una frase de otro tema marcada como no apta con ánimo
//    bajo se sustituye dentro de su tema, desde un cuarto de vuelta más allá
//    (la mitad ya la usan las sustitutas del esfuerzo). Con ánimo bajo no hay
//    garantía de 500 días —calma ocupa dos días de cada cinco—, pero ninguna
//    frase vuelve antes de unos cien días: lo mide una prueba.
//
// 5. **Si algo falta** —un tema sin frases elegibles por un problema de
//    datos—, sale una frase universal o secular aprobada. Nunca un error y
//    nunca un borrador.
//
// La persistencia de lo ya asignado no vive aquí sino en `diario.js`
// (`fraseAsignada`): esto es la regla pura, y lo guardado es lo que impide que
// una ampliación futura del catálogo cambie el pasado.

import {
  APROBADAS,
  FRASES_V2,
  TEMAS,
  TEMAS_DE_RENDIMIENTO,
  elegiblesPara,
  fraseV2PorId,
} from '@/content/frases-v2'
import { FRASES as FRASES_V1 } from '@/content/frases-del-dia'
import { hash, huellaDe, perfilDeFrases } from '@/referencias/preferencias'

/** El tema suave que ocupa el día de esfuerzo cuando el ánimo reciente es bajo. */
export const TEMA_DE_RESPALDO = 'calma'

/** Lo que sale si un perfil se queda sin nada que ver: lo neutral. */
const AUDIENCIAS_DE_RESPALDO = Object.freeze(['universal', 'secular'])

function modulo(a, n) {
  return ((a % n) + n) % n
}

/** Días desde el 1 de enero de 1970 de una fecha 'YYYY-MM-DD', sin pasar por UTC del reloj. */
export function diaDeEpoca(fecha) {
  const [y, m, d] = String(fecha ?? '')
    .split('-')
    .map(Number)
  if (!y || !m || !d) return 0
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000)
}

/** El tema que le toca a una fecha en el ciclo de cinco. */
export function temaDelDia(fecha) {
  return TEMAS[modulo(diaDeEpoca(fecha), TEMAS.length)]
}

function numeroDe(texto) {
  return parseInt(hash(texto), 16)
}

/**
 * Intercala grupos en proporción a su tamaño, sin agrupar los de uno al final.
 * Es el turno ponderado suave: en cada paso gana el grupo con más crédito
 * acumulado, y pagar su turno le resta el total. Cada elemento aparece una vez.
 */
function intercalar(grupos) {
  const total = grupos.reduce((suma, g) => suma + g.length, 0)
  const credito = grupos.map(() => 0)
  const siguiente = grupos.map(() => 0)
  const resultado = []
  for (let paso = 0; paso < total; paso += 1) {
    let elegido = -1
    for (let i = 0; i < grupos.length; i += 1) {
      if (siguiente[i] >= grupos[i].length) continue
      credito[i] += grupos[i].length
      if (elegido === -1 || credito[i] > credito[elegido]) elegido = i
    }
    credito[elegido] -= total
    resultado.push(grupos[elegido][siguiente[elegido]])
    siguiente[elegido] += 1
  }
  return resultado
}

const CICLOS = new WeakMap()

/**
 * Los ciclos de los cinco temas para un perfil, sobre un catálogo. Se calculan
 * una vez por catálogo y perfil y se guardan en memoria: son puros.
 *
 * @returns {Record<string, object[]>}
 */
export function ciclosDe(perfil, catalogo = APROBADAS) {
  let porCatalogo = CICLOS.get(catalogo)
  if (!porCatalogo) {
    porCatalogo = new Map()
    CICLOS.set(catalogo, porCatalogo)
  }
  const guardado = porCatalogo.get(perfil.clave)
  if (guardado) return guardado

  const elegibles = elegiblesPara(perfil.audiencias, catalogo)
  const ciclos = {}
  for (const tema of TEMAS) {
    const delTema = elegibles.filter((frase) => frase.tema === tema)
    // Cada frase va al grupo de la primera audiencia del perfil que la incluye.
    const grupos = perfil.audiencias
      .map((audiencia) =>
        delTema
          .filter(
            (frase) => perfil.audiencias.find((a) => frase.audiencias.includes(a)) === audiencia,
          )
          .sort((a, b) => numeroDe(a.id) - numeroDe(b.id) || a.id.localeCompare(b.id)),
      )
      .filter((grupo) => grupo.length > 0)
    ciclos[tema] = intercalar(grupos)
  }
  porCatalogo.set(perfil.clave, ciclos)
  return ciclos
}

/** Por dónde entra un perfil al ciclo de un tema. */
function desfase(huella, tema, largo) {
  return numeroDe(`${huella}|${tema}`) % largo
}

/** La primera apta con ánimo bajo, recorriendo el ciclo desde una posición. */
function primeraApta(ciclo, desde) {
  for (let k = 0; k < ciclo.length; k += 1) {
    const frase = ciclo[modulo(desde + k, ciclo.length)]
    if (frase.aptaConAnimoBajo) return frase
  }
  return null
}

/**
 * Una frase neutral aprobada para cuando el perfil no tiene con qué. Nunca un
 * borrador: sale de las aprobadas, y con ánimo bajo, de las aptas.
 */
export function fraseDeRespaldo(fecha, { animoBajoReciente = false, catalogo = APROBADAS } = {}) {
  const candidatas = elegiblesPara(AUDIENCIAS_DE_RESPALDO, catalogo)
    .filter((frase) => !animoBajoReciente || frase.aptaConAnimoBajo)
    .sort((a, b) => a.id.localeCompare(b.id))
  if (candidatas.length === 0) return null
  return candidatas[modulo(diaDeEpoca(fecha), candidatas.length)]
}

/**
 * La frase de un día para unas preferencias, sin mirar nada guardado.
 *
 * @param {string} fecha - 'YYYY-MM-DD', el día personal de quien lo vive.
 * @param {?object} preferencias - la elección de referencias (se normaliza aquí).
 * @param {object} [opciones]
 * @param {boolean} [opciones.animoBajoReciente] - las tres últimas noches con
 *        ánimo agotado o inquieto. Retira el esfuerzo y lo no apto.
 * @param {object[]} [opciones.catalogo] - para las pruebas; por defecto, las aprobadas.
 * @returns {?object} la entrada del catálogo.
 */
export function elegirFrase(
  fecha,
  preferencias,
  { animoBajoReciente = false, catalogo = APROBADAS } = {},
) {
  const perfil = perfilDeFrases(preferencias)
  const huella = huellaDe(preferencias)
  const ciclos = ciclosDe(perfil, catalogo)
  const dia = diaDeEpoca(fecha)
  const vuelta = Math.floor(dia / TEMAS.length)
  const respaldo = () => fraseDeRespaldo(fecha, { animoBajoReciente, catalogo })

  let tema = TEMAS[modulo(dia, TEMAS.length)]
  let sustituta = false
  if (animoBajoReciente && TEMAS_DE_RENDIMIENTO.includes(tema)) {
    tema = TEMA_DE_RESPALDO
    sustituta = true
  }

  const ciclo = ciclos[tema] ?? []
  if (ciclo.length === 0) return respaldo()

  const mitad = Math.floor(ciclo.length / 2)
  const posicion = vuelta + desfase(huella, tema, ciclo.length) + (sustituta ? mitad : 0)
  const frase = ciclo[modulo(posicion, ciclo.length)]

  if (!animoBajoReciente || frase.aptaConAnimoBajo) return frase
  // Un cuarto de vuelta, y no media: la media es de las sustitutas del
  // esfuerzo, y las dos irían a la misma frase con tres días de diferencia.
  return primeraApta(ciclo, posicion + Math.floor(ciclo.length / 4)) ?? respaldo()
}

/**
 * Lo que se pinta a partir de una asignación guardada, o `null` si ya no vale.
 *
 * Una asignación de la versión 1 se resuelve contra el repertorio anterior,
 * que sigue en el repo para esto. Una de la versión 2, contra el catálogo
 * actual, y **solo si sigue aprobada**: retirar una frase por motivos
 * editoriales o jurídicos manda sobre la estabilidad del pasado.
 */
export function resolverAsignacion(registro, catalogo = FRASES_V2) {
  if (!registro || typeof registro.phraseId !== 'string') return null
  if (registro.catalogoVersion === 1) {
    const v1 = FRASES_V1.find((frase) => frase.id === registro.phraseId)
    if (!v1) return null
    return {
      ...v1,
      catalogoVersion: 1,
      aptaConAnimoBajo: !TEMAS_DE_RENDIMIENTO.includes(v1.tema),
      estado: 'aprobada',
    }
  }
  const frase =
    catalogo === FRASES_V2
      ? fraseV2PorId(registro.phraseId)
      : (catalogo.find((f) => f.id === registro.phraseId) ?? null)
  return frase && frase.estado === 'aprobada' ? frase : null
}
