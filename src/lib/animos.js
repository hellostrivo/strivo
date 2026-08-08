// src/lib/animos.js
// Cómo te vas a dormir — los estados de cierre del día (§5.6).
//
// Mismo reparto que @lib/emociones y @lib/areas: el nombre visible vive en
// @copy —con sus variantes de género, que siete de los nueve necesitan— y aquí
// el orden, los ids y el color de cada uno.
//
// POR QUÉ UN ID Y NO EL RÓTULO. Antes se guardaba la palabra que se leía en
// pantalla ("Cansado"), que solo existía en masculino. En cuanto el rótulo
// cambia con el género, una usuaria guardaría "Cansada", que ya no coincide con
// nada: el saludo de la mañana siguiente dejaría de salir y el punto del
// calendario perdería su color, sin que nadie se entere. El id no se flexiona,
// así que la app puede hablar en femenino sin perderse a sí misma.
//
// SE ELIGEN HASTA DOS. Un día rara vez se cierra con una sola palabra: se puede
// estar agradecida y cansada a la vez, y tener que elegir una sola falsea la
// respuesta. Al llegar al máximo las demás se atenúan y dejan de responder, sin
// aviso ni error, igual que el límite de emociones y el de áreas de P4B.
//
// NINGUNO ES PEOR QUE OTRO. El calendario pinta cada día del color de su estado,
// y clay —el que el sistema reserva para errores— se queda fuera a propósito.
// Los cinco estados que ya existían conservan exactamente el color que tenían,
// para que un mes de hace semanas siga viéndose igual; los cuatro nuevos se
// suman al tono más cercano. Que varios compartan color no es un descuido: el
// calendario cuenta de qué color fue el día, no diagnostica cuál fue (RN-05).

import { colors } from '@tokens'

export const ANIMOS = [
  { id: 'en_paz',     color: colors.sage  },
  { id: 'agradecido', color: colors.amber },
  { id: 'orgulloso',  color: colors.plum  },
  { id: 'tranquilo',  color: colors.sage  },   // el de siempre
  { id: 'contento',   color: colors.amber },
  { id: 'pensativo',  color: colors.mist  },   // el de siempre
  { id: 'cansado',    color: colors.plum  },   // el de siempre
  { id: 'inquieto',   color: colors.amber },   // el de siempre
  { id: 'otro',       color: '#D9CFC4'    },   // el de siempre: border
]

// "Algo más" no es un estado del catálogo: es el hueco para una palabra propia.
export const ANIMO_OTRO = 'otro'

// Cuántos se pueden elegir a la vez ("Elige una o dos").
export const MAX_ANIMOS = 2

// Una palabra, y corta: el campo no es para explicarse, es para nombrar.
export const OTRO_MAX_LENGTH = 20

// Los que hacen que la mañana salude distinto (R2). Son ids, no rótulos: por eso
// siguen funcionando en cualquier género.
export const ANIMOS_DIFICILES = ['cansado', 'inquieto']

export const esAnimoConocido = id => ANIMOS.some(a => a.id === id)

export const colorDeAnimoId = id => ANIMOS.find(a => a.id === id)?.color ?? null

// ─── Lo escrito antes de que hubiera ids ─────────────────────────────────────
// Las entradas más viejas guardaron el rótulo en masculino, que era el único que
// existía. La migración v6 de @lib/db ya los reescribió; este mapa es la red por
// si alguno llega tarde desde la sincronización.
const ID_DE_ROTULO_ANTIGUO = {
  Tranquilo: 'tranquilo',
  Pensativo: 'pensativo',
  Cansado:   'cansado',
  Inquieto:  'inquieto',
  Otro:      'otro',
}

/**
 * El id de un ánimo, venga ya como id o como rótulo de los de antes.
 * Lo que no se reconoce se devuelve sin tocar: no se inventa un estado ni se
 * borra lo que alguien eligió, aunque hoy ese id ya no esté en la lista.
 */
export function idDeAnimo(valor) {
  if (!valor) return valor
  if (esAnimoConocido(valor)) return valor
  return ID_DE_ROTULO_ANTIGUO[valor] ?? valor
}

/**
 * La selección de un día, siempre como lista.
 *
 * Acepta las tres formas que puede tener un registro guardado, porque no se
 * migra nada: lo de antes se lee, no se reescribe.
 *   - `'cansado'`            un solo estado (lo que se guardaba hasta ahora)
 *   - `['cansado', 'en_paz']` la forma actual
 *   - `''` / `null`          sin respuesta
 *
 * Los ids desconocidos se conservan: un registro de hace meses sigue contando
 * lo que contaba, aunque su estado ya no esté en el catálogo.
 */
export function normalizarAnimos(valor) {
  const lista = Array.isArray(valor) ? valor : [valor]
  const vistos = new Set()

  return lista
    .map(idDeAnimo)
    .filter(id => {
      if (typeof id !== 'string' || !id.trim()) return false
      if (vistos.has(id)) return false
      vistos.add(id)
      return true
    })
}

/**
 * El nombre visible de un ánimo guardado.
 *
 * `t` es el resolvedor de @hooks/useCopy: hace falta porque siete de los nueve
 * cambian con el género. "Algo más" se muestra con la palabra que se escribió,
 * si la hay. Un id que ya no esté en el catálogo se devuelve tal cual en vez de
 * desaparecer de la pantalla.
 */
export function nombreDeAnimo(id, t, otroTexto = '') {
  if (!id) return ''
  if (id === ANIMO_OTRO && otroTexto?.trim()) return otroTexto.trim()
  return esAnimoConocido(id) ? t(`ritualNoche.n6.states.${id}`) : id
}

/** Los nombres de una selección entera, listos para leerse seguidos. */
export function nombresDeAnimos(valor, t, otroTexto = '') {
  return normalizarAnimos(valor).map(id => nombreDeAnimo(id, t, otroTexto))
}

/**
 * Una sola palabra, en silencio.
 *
 * Se queda con la primera y recorta a lo que cabe. No avisa de nada: pegar un
 * párrafo aquí no es un error de la persona, es un párrafo que no cabía (§3.6 —
 * la app no regaña).
 */
export function unaPalabra(texto) {
  if (typeof texto !== 'string') return ''
  return (texto.trim().split(/\s+/)[0] ?? '').slice(0, OTRO_MAX_LENGTH)
}

/**
 * Lo que de verdad se guarda de un día.
 *
 * "Algo más" elegido pero sin palabra no se guarda: no se registra una elección
 * vacía y tampoco se avisa de ello (D.4). Y si no quedó seleccionado, su texto
 * se va con él.
 */
export function seleccionParaGuardar(animos, otroTexto = '') {
  const palabra = unaPalabra(otroTexto)
  const limpios = normalizarAnimos(animos).filter(
    id => id !== ANIMO_OTRO || palabra
  )

  return {
    animoCierre:     limpios,
    animoOtroTexto:  limpios.includes(ANIMO_OTRO) ? palabra : '',
  }
}
