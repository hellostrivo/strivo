// src/components/onboarding/Nombre.jsx
// P2 — el nombre, y nada más.
//
// **Se puede dejar en blanco, y la pantalla lo dice antes de que nadie lo
// pregunte.** Sin esa frase, un campo solo en la segunda pantalla se lee como
// un requisito, y aquí no hay ninguno: ni `required`, ni `disabled`, ni nada
// que se ponga en rojo (RN-02).
//
// Se teclea, así que se guarda solo a los 800 ms de la última tecla: salir a
// mitad del nombre no pierde lo escrito.

import { CampoLinea } from '@components/shared/Campo'

export default function Nombre({ textos, valor, onCambiar }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.question}</h1>
        <p className="text-base text-on-surface-soft">{textos.hint}</p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-on-surface-soft">{textos.label}</span>
        <CampoLinea
          value={valor}
          autoComplete="given-name"
          onChange={(evento) => onCambiar(evento.target.value)}
        />
      </label>
    </section>
  )
}
