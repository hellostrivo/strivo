// src/lib/animos.js
// Cómo te vas a dormir — los cinco estados de cierre (§5.6, N6).
//
// Mismo reparto que @lib/emociones y @lib/areas: el nombre visible vive en
// @copy —con sus variantes de género, que los cinco necesitan— y aquí el orden,
// los ids y el color de cada uno.
//
// POR QUÉ UN ID Y NO EL RÓTULO. Antes se guardaba en `dailyEntry.animoCierre`
// la palabra que se leía en pantalla ("Cansado"), y la mañana siguiente se
// comparaba contra esa misma palabra para saber si el día se había cerrado
// difícil. En cuanto el rótulo cambia con el género, una usuaria en femenino
// guardaba "Cansada", que ya no coincidía con nada: el saludo de día difícil
// dejaba de salir sin que nadie se enterara, y su color desaparecía del
// calendario. El id no se flexiona, así que la app puede hablar en femenino sin
// perderse a sí misma.
//
// NINGUNO ES PEOR QUE OTRO. Los colores se reparten entre los acentos de la
// paleta y clay —el que el sistema reserva para errores— se queda fuera a
// propósito: un día inquieto se ve distinto de uno tranquilo, no peor (RN-05).

import { colors } from '@tokens'

export const ANIMOS = [
  { id: 'tranquilo', color: colors.sage },
  { id: 'pensativo', color: colors.mist },
  { id: 'cansado',   color: colors.plum },
  { id: 'inquieto',  color: colors.amber },
  { id: 'otro',      color: '#D9CFC4' },   // border: sigue siendo un día registrado
]

// Los que hacen que la mañana salude distinto (R2). Son ids, no rótulos: por eso
// siguen funcionando en cualquier género.
export const ANIMOS_DIFICILES = ['cansado', 'inquieto']

export const esAnimoConocido = id => ANIMOS.some(a => a.id === id)

export const colorDeAnimoId = id => ANIMOS.find(a => a.id === id)?.color ?? null

/**
 * El nombre visible de un ánimo guardado.
 *
 * `t` es el resolvedor de @hooks/useCopy: hace falta porque los cinco cambian
 * con el género. Un id que no esté en el catálogo —una entrada vieja del
 * historial que no se llegara a migrar— se devuelve tal cual en vez de
 * desaparecer de la pantalla.
 */
export function nombreDeAnimo(id, t) {
  if (!id) return ''
  return esAnimoConocido(id) ? t(`ritualNoche.n6.states.${id}`) : id
}

// ─── Lo escrito antes de que hubiera ids ─────────────────────────────────────
// Las entradas anteriores guardaron el rótulo en masculino, que era el único que
// existía. Se traducen a su id en la migración v6 de @lib/db, y este mapa es
// también la red por si alguna llega tarde desde la sincronización.
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
 * borra lo que alguien escribió.
 */
export function idDeAnimo(valor) {
  if (!valor) return valor
  if (esAnimoConocido(valor)) return valor
  return ID_DE_ROTULO_ANTIGUO[valor] ?? valor
}
