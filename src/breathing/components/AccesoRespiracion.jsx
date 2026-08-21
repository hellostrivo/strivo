// src/breathing/components/AccesoRespiracion.jsx
// El tercer acceso del Home (SPEC_16 §2).
//
// **Componente propio, no una variante de la tarjeta de espacio** (RN-RE-NAV-08c).
// Lumia y Formia comparten un `<Link>` en un `.map()`, y meterle un tercer modo
// sería la vía más rápida a que Respiración termine viéndose como un tercer
// espacio. No lo es: Lumia y Formia se **habitan** —tienen marca, subtítulo,
// transición de entrada—; Respiración se **toma**. Se entra, se usa, se sale.
//
// La subordinación se construye con cuatro palancas, no con el tamaño:
//   · sin subtítulo (RN-RE-NAV-02) — una línea frente a dos
//   · forma de píldora frente a esquinas de tarjeta
//   · peso tipográfico normal frente al `font-display` de los espacios
//   · un anillo dibujado, no un símbolo de marca
//
// **RN-RE-NAV-01 y RN-RE-NAV-06 se contradicen y manda la accesibilidad.** La
// primera pide ≈40 % de la altura de una tarjeta —34 px— y la segunda un área
// táctil de 56 px como mínimo. No se puede entregar un blanco de 34 px, y menos
// a alguien que lo busca porque está mal. Se queda en 56, que es el 66 % de una
// tarjeta, y la jerarquía la cargan las cuatro palancas de arriba.

import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { copy } from '@copy'

export const RUTA_RESPIRACION = '/respiracion'

export default function AccesoRespiracion() {
  return (
    <Link
      to={RUTA_RESPIRACION}
      className={clsx(
        // Píldora, no tarjeta: la forma es la primera señal de que esto es de
        // otra categoría, y se lee antes que el tamaño.
        'flex min-h-touch items-center justify-center gap-3 rounded-full',
        'border border-espacio px-5',
        'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
      )}
    >
      {/* RN-RE-NAV-03 — Un círculo con anillo, que evoca la guía visual sin ser
          un símbolo de marca. Decorativo: el texto de al lado ya lo nombra. */}
      <span aria-hidden="true" className="acceso-respiracion__icono" />
      <span className="text-sm text-on-surface">{copy.respiracion.home.acceso}</span>
    </Link>
  )
}
