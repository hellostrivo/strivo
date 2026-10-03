// Cápsulas de ejemplo para las pruebas del modelo. Cada una pasa `validar` tal
// cual sale de aquí; cada prueba cambia lo que quiere ver fallar.
import { SECCIONES_REVISABLES } from '../capsula.js'
import { restarDias } from '../semana.js'

const marca = (clave, hora = '10:00:00') => `${clave}T${hora}-06:00`

/** Una cápsula programada para ese lunes, con todos los plazos cumplidos. */
export function programada(weekStart = '2026-12-07', cambios = {}) {
  return {
    id: `c-${weekStart}`,
    version: 1,
    status: 'programada',
    weekStart,
    theme: 'Hacer espacio en días llenos',
    title: 'Hacer espacio',
    opening: 'Hay días que llegan llenos desde la primera hora.',
    evidenceSummary:
      'Algunos estudios sugieren que una pausa breve puede ayudar a notar el cuerpo y el aire.',
    keyFindings: ['Una pausa breve se asocia con más calma percibida.'],
    practiceDestination: 'breathing',
    practiceLabel: 'Respira un momento',
    journalPrompt: '¿Qué espacio encontré hoy?',
    sources: [
      {
        title: 'Anxiety and stress in everyday pauses',
        authorsOrInstitution: 'Grupo de ejemplo',
        year: 2020,
        originalUrl: 'https://example.org/pausas',
        doi: '10.1234/pausas.2020',
        reviewed: true,
      },
    ],
    coverAsset: 'espacio.webp',
    coverAltText: 'Una taza sobre una mesa, junto a una ventana con luz de tarde.',
    generatedWithAi: true,
    generatedAt: marca(restarDias(weekStart, 40)),
    reviewedBy: 'fundadora',
    reviewedAt: marca(restarDias(weekStart, 31)),
    reviewedSections: [...SECCIONES_REVISABLES],
    prevalidatedAt: marca(restarDias(weekStart, 30)),
    approvedBy: 'fundadora',
    approvedAt: marca(restarDias(weekStart, 7)),
    scheduledAt: marca(restarDias(weekStart, 7), '11:00:00'),
    reserva: false,
    piloto: false,
    ...cambios,
  }
}

/** Una reserva: aprobada, sin semana, aprobada en ese día. */
export function reserva(id, aprobadaEl, cambios = {}) {
  const base = programada('2026-12-07')
  return {
    ...base,
    id,
    status: 'aprobada',
    weekStart: null,
    reserva: true,
    generatedAt: marca(restarDias(aprobadaEl, 20)),
    reviewedAt: marca(restarDias(aprobadaEl, 10)),
    prevalidatedAt: marca(restarDias(aprobadaEl, 9)),
    approvedAt: marca(aprobadaEl),
    scheduledAt: null,
    ...cambios,
  }
}

/** La misma cápsula en otro estado, sin tocar nada más. */
export const enEstado = (capsula, status) => ({ ...capsula, status })
