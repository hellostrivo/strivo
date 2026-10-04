// src/perfil/bloques.js
// Qué hay en Tu perfil, en qué orden, y dónde se añade lo que venga después.
//
// **Esta lista es la costura de la pantalla.** El Perfil no es un formulario
// con cuatro campos: es una pila de bloques independientes, y esto es lo único
// que sabe cuáles son. Las fases siguientes traen plan de pago, suscripción y
// el resto de ajustes de cuenta, y la manera de que eso entre sin rehacer nada
// es que añadirlo sea **un identificador aquí, un texto en el copy y un
// componente**. Ninguna de las tres cosas toca a las otras tres.
//
// La pantalla tiene una prueba que comprueba que cada identificador de esta
// lista tiene componente y copy: añadir uno a medias falla en voz alta en vez
// de dejar un hueco en pantalla.
//
// El orden va de lo más cercano a lo más cotidiano: cómo te llamas, cómo
// hablarte y cómo son tus días. Lo que llegue después —cuenta, plan,
// suscripción— va detrás: son gestiones, no eres tú.
//
// `cuenta` (SPEC_19.1) y `sincronizacion` (SPEC_17A §4.6) son los primeros de
// esos: quién eres para la nube, y después dónde vive lo que escribes y si ya
// está a salvo. Van al final por lo de arriba, y en ese orden porque el
// segundo depende del primero.

/** Los bloques que hay hoy, en el orden en que se ven. */
// `frases` (SPEC_28) va detrás de los horarios: cierra lo que la app sabe de
// ti antes de pasar a dónde vive lo tuyo (cuenta y sincronización).
export const BLOQUES = Object.freeze([
  'nombre',
  'genero',
  'horarios',
  'frases',
  'cuenta',
  'sincronizacion',
])

/** ¿Es un bloque del perfil? */
export function es(id) {
  return BLOQUES.includes(id)
}
