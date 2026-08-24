// src/lumia/mananaEmociones.js
// Los dos catálogos emocionales de la mañana, enlazados con su copy.
//
//   ANIMO     — "¿Cómo me siento esta mañana?" (11 opciones + palabra propia)
//   INTENCION — "¿Cómo me gustaría sentirme durante el día de hoy?" (9 + propia)
//
// **Son dos catálogos distintos a propósito.** El primero pregunta qué hay y
// por eso incluye las emociones difíciles —cansancio, inquietud, tristeza— sin
// una sola marca de advertencia. El segundo pregunta hacia dónde acompañarse, y
// una intención de "estar triste" no es una intención.
//
// **La diferencia entre los dos no se mide.** No hay puntuación, ni brecha, ni
// color de alerta, ni un mensaje que sugiera que hay que mejorar el estado de
// partida. Empezar cansado y querer estar en calma no es un problema a resolver:
// es exactamente lo que la pregunta esperaba.

import { copy } from '@copy'
import { crearSeleccion } from './seleccionUnica.js'

export { ID_OTRA, MAX_PALABRA_PROPIA, etiquetaPropia, recortarPropia } from './seleccionUnica.js'

const textos = copy.lumia.diario.manana

export const ANIMO = crearSeleccion(textos.animo)
export const INTENCION = crearSeleccion(textos.intencion)
