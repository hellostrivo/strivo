// src/onboarding/genero.js
// P2A — las cuatro opciones que se ofrecen y los tres valores que se guardan.
//
// El modelo tiene tres géneros (`m`, `f`, `n`) porque son los tres que sabe
// resolver `copy/gender.js`, que es quien decide si el copy dice "cansado",
// "cansada" o "con cansancio". La pantalla ofrece cuatro opciones porque
// "prefiero no contestar" y "otro" no son la misma respuesta para quien la da,
// aunque el copy las trate igual: las dos se escriben en neutro.
//
// **Se persiste el identificador del modelo, nunca la etiqueta** (RN-GEN-01,
// RN-DB-06). La opción elegida vive en la pantalla mientras dura el recorrido
// —para que "Atrás" devuelva el chip que se tocó— y no se guarda: un cuarto
// valor en `profile.gender` obligaría a `resolveGender` a saber qué hacer con
// él, y lo que haría sería exactamente lo mismo que con el neutro.
//
// RN-GEN-05 — El neutro es el comportamiento por defecto, no un caso raro: es
// lo que vale sin contestar, que es lo que pasa si alguien se salta el paso.

import { GENERO_POR_DEFECTO } from '@copy/gender'

/** Las cuatro opciones, en el orden en que se ofrecen. */
export const OPCIONES = Object.freeze(['masculino', 'femenino', 'prefiero_no_contestar', 'otro'])

/** De la opción elegida al valor del modelo. */
const A_GENERO = Object.freeze({
  masculino: 'm',
  femenino: 'f',
  prefiero_no_contestar: 'n',
  otro: 'n',
})

/** ¿Es una de las cuatro? */
export function es(opcion) {
  return OPCIONES.includes(opcion)
}

/**
 * El valor que se guarda en `shared/profile.gender`.
 * Sin opción —o con una que no está— vale el neutro: no contestar es una
 * respuesta válida y no deja el perfil a medias.
 */
export function generoDe(opcion) {
  return A_GENERO[opcion] ?? GENERO_POR_DEFECTO
}

/**
 * Tocar una opción. Selección única, y tocar la elegida la suelta: es la forma
 * de dejar la pregunta en blanco sin tener que buscar un botón que lo diga.
 */
export function alternar(seleccion, opcion) {
  if (!es(opcion)) return seleccion ?? null
  return seleccion === opcion ? null : opcion
}
