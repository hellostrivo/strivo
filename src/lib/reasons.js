// src/lib/reasons.js
// Lo que cada quien viene a buscar (P3, §6 del documento de cambios).
//
// La pregunta ya no es "¿por qué estás aquí?" —que pide justificarse y mira
// hacia lo que está mal— sino "¿qué te gustaría encontrar aquí?", que pide un
// deseo. Mismo dato para el producto, experiencia distinta para la persona.
//
// Aquí vive el orden canónico y los ids; la etiqueta visible vive en @copy,
// como con las áreas. Los ids se guardan en `profile.reasons`: renombrarlos
// rompería los perfiles ya escritos.

export const REASON_IDS = [
  'paz',      // Terminar el día con más paz
  'avance',   // Sentir que sí estoy avanzando
  'escucha',  // Volver a escucharme
  'sueno',    // Dormir con la mente más tranquila
  'habitos',  // Construir hábitos que realmente duren
  'espacio',  // Tener un espacio solo para mí
  'otro',     // Abre un campo de texto opcional
]

// "Otro" es el único que se comporta distinto: revela un campo libre
export const REASON_OTHER = 'otro'

// Lo que se escribe en ese campo. Límite blando: el campo no deja escribir más,
// pero nunca se avisa en rojo ni se bloquea el avance.
export const REASON_OTHER_MAX = 80

// A partir de aquí se muestra el contador, en tono neutro
export const REASON_OTHER_COUNTER_FROM = 65
