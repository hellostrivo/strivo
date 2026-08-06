// src/components/diario/BloqueDiario.jsx
// Envoltorio de cada bloque del Diario (§5.3).
//
// Todos los bloques se ven igual —etiqueta arriba, contenido debajo, mismo
// aire entre ellos— para que la Vista se lea como una hoja y no como un
// formulario. Ninguno marca "pendiente" ni "sin completar": un bloque vacío es
// un bloque que todavía no hacía falta.

export default function BloqueDiario({ id, label, children, className = '' }) {
  return (
    <section aria-labelledby={id ? `${id}-label` : undefined} className={className}>
      {label && (
        <h2
          id={id ? `${id}-label` : undefined}
          className="font-display text-md leading-snug text-ink"
        >
          {label}
        </h2>
      )}
      <div className={label ? 'mt-4' : undefined}>
        {children}
      </div>
    </section>
  )
}
