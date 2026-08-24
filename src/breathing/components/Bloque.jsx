// src/breathing/components/Bloque.jsx
// La tarjeta que envuelve cada grupo de ajustes.
//
// Existe desde que Respiración vive dentro de Lumia (24 ago). Antes los bloques
// eran secciones sueltas sobre el fondo, separadas solo por aire: legible en una
// pantalla que era suya y de nadie más, pero dentro de un espacio con cabecera y
// barra se leía como una lista larga sin jerarquía.
//
// **No nombra ni un color** (RN-SURF-01). Pide la superficie por su papel
// —`bg-raised`, `border-on-surface`— y el espacio que la monta decide qué son.
// Es la misma tarjeta del Home y de los bloques del Diario: mismo radio, misma
// elevación por luminancia y no por borde (RN-HOY-07).

export default function Bloque({ children }) {
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-on-surface bg-raised p-4">
      {children}
    </section>
  )
}
