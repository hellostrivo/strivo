// src/lib/genderStore.js
// Estado global reactivo del modo de lenguaje (§2.4).
//
// Por qué un almacén con suscripción y no una variable de módulo leída al
// arrancar: cambiar el género desde Ajustes (D-04) tiene que reescribir el copy
// visible al instante, sin recargar la app. Un valor cacheado funcionaría
// durante todo el onboarding —ahí solo se escribe una vez— y fallaría justo
// donde nadie mira.
//
// El valor vive fuera de React y se consume con useSyncExternalStore
// (ver @hooks/useCopy). Escribirlo desde cualquier sitio re-renderiza a todos
// los que lo lean.

import { deriveGenderMode, DEFAULT_GENDER_MODE, isGenderMode, normalizeGender } from '@lib/gender'

let gender     = null                  // lo que la persona contestó (puede ser null)
let genderMode = DEFAULT_GENDER_MODE   // lo que consume el copy: nunca null

const listeners = new Set()

function notify() {
  for (const listener of listeners) listener()
}

export function getGenderMode() {
  return genderMode
}

export function getGender() {
  return gender
}

// Fuente principal: lo que se guardó en el perfil o en el borrador del
// onboarding. Un valor fuera del catálogo se lee como "sin respuesta" y cae en
// el modo neutro, que es lo que hace que la app nunca se quede sin copy.
export function setGender(valor) {
  const siguiente = normalizeGender(valor)
  const modo      = deriveGenderMode(siguiente)
  if (siguiente === gender && modo === genderMode) return
  gender     = siguiente
  genderMode = modo
  notify()
}

// Escape para pruebas y para previsualizar una variante sin tocar el perfil.
export function setGenderMode(modo) {
  const siguiente = isGenderMode(modo) ? modo : DEFAULT_GENDER_MODE
  if (siguiente === genderMode) return
  genderMode = siguiente
  notify()
}

export function subscribeGenderMode(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function resetGenderStore() {
  gender     = null
  genderMode = DEFAULT_GENDER_MODE
  notify()
}
