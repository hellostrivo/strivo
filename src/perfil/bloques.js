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

/** Los bloques que hay hoy, en el orden en que se ven. */
export const BLOQUES = Object.freeze(['nombre', 'genero', 'horarios'])

/** ¿Es un bloque del perfil? */
export function es(id) {
  return BLOQUES.includes(id)
}
