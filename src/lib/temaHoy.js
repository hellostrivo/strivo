// src/lib/temaHoy.js
// Con qué tema abre la pantalla Hoy (§20).
//
// El fondo de Hoy lo decide el botón Mañana/Noche, no el reloj: quien quiere
// cerrar su día a las siete de la tarde no tiene por qué mirar una pantalla que
// insiste en que todavía es de día. Pero al entrar hay que empezar por alguno,
// y ese primero sí lo sugiere la hora.
//
// La regla es la misma que ya decidía qué sección viene preseleccionada, y vive
// aquí para que la capa de fondo (@components/strivo/FondoHorario, montada en
// App) y la propia pantalla arranquen en el mismo tema. Si cada una lo calculara
// por su cuenta podrían discrepar en el primer fotograma, y se vería el cambio.
//
// Es una sugerencia, no una regla: en cuanto se toca un botón manda la persona,
// y las dos secciones están disponibles a cualquier hora.
//
// No se persiste entre sesiones (Fase 0): al volver, se recalcula.

import { getTimeSlot } from '@lib/timeSlot'

// Las franjas en las que abrir por la mañana tiene sentido (§4.3.3)
const FRANJAS_DE_MANANA = ['amanecer', 'dia']

export const TEMAS = ['manana', 'noche']

export function temaInicialDeHoy() {
  return FRANJAS_DE_MANANA.includes(getTimeSlot()) ? 'manana' : 'noche'
}

export const esTemaOscuro = tema => tema === 'noche'
