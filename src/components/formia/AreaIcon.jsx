// src/components/formia/AreaIcon.jsx
// Íconos de las 7 áreas del catálogo (§C5.4, aviso 1).
//
// Van en SVG y no en emoji a propósito: §3.6 reserva los emojis del sistema
// para la tabla de emociones de Lumia, y estos íconos son de Formia.
//
// Cada trazo usa `currentColor`, así que el color lo pone quien los coloca —
// normalmente el color del área que viene de `AREA_CATALOG`.

const TRAZOS = {
  // Salud — hoja: lo que se cuida y crece por su cuenta.
  salud: (
    <>
      <path d="M5 19c0-7 5-12 14-13 1 9-4 14-11 14H5z" />
      <path d="M5 19c3-4 6-6 10-7.5" />
    </>
  ),

  // Trabajo — el oficio, con su asa.
  trabajo: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5" />
      <path d="M3 12.5h18" />
    </>
  ),

  // Relaciones — dos círculos que se tocan sin fundirse.
  relaciones: (
    <>
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
    </>
  ),

  // Espiritualidad — un centro y lo que lo rodea.
  espiritualidad: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" />
      <path d="M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" />
    </>
  ),

  // Crecimiento personal — brote: lo que sube porque se sostiene.
  crecimiento: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12C12 8 9.5 5.5 5.5 5.5c0 4 2.5 6.5 6.5 6.5z" />
      <path d="M12 14.5c0-3.2 2-5.2 5.2-5.2 0 3.2-2 5.2-5.2 5.2z" />
    </>
  ),

  // Finanzas — lo que se guarda.
  finanzas: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v9" />
      <path d="M14.5 9.8c-.6-.8-1.5-1.2-2.5-1.2-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2.1c1.6.4 2.6.9 2.6 2.1s-1.1 2-2.6 2c-1 0-1.9-.4-2.5-1.2" />
    </>
  ),

  // Creatividad — el trazo que deja algo donde no había nada.
  creatividad: (
    <>
      <path d="M4 20c0-2.5 1.5-4 3.5-4S11 17.5 11 20H4z" />
      <path d="M9.5 16.5L18 8a2.1 2.1 0 00-3-3l-8.5 8.5" />
    </>
  ),
}

/**
 * @param {string} areaId - Uno de `AREA_IDS`.
 * @param {string} [className]
 */
export default function AreaIcon({ areaId, className = 'w-5 h-5' }) {
  const trazo = TRAZOS[areaId]
  if (!trazo) return null

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {trazo}
    </svg>
  )
}
