// src/components/perfil/Bloque.jsx
// El marco de un bloque del perfil: título, apoyo y lo que se edita dentro.
//
// Existe para que añadir un bloque sea escribir su contenido y nada más. La
// tarjeta, el espaciado y la jerarquía del título se deciden aquí una vez, así
// que el plan de pago de una fase posterior no tendrá que acertar de memoria
// con la forma de los que ya están.
//
// No fija ni un color: pide superficies por su papel y el tema las resuelve
// (RN-VIS-02). `bg-raised` la separa del fondo por luminancia y no solo por el
// borde, que es lo que la hace visible para quien distingue mal los tonos.

export default function Bloque({ titulo, hint, children }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-espacio bg-raised p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-md text-on-surface">{titulo}</h2>
        {hint && <p className="text-sm text-on-surface-soft leading-relaxed">{hint}</p>}
      </div>
      {children}
    </section>
  )
}
