// src/components/journal/CampoPin.jsx
// El campo donde se escribe un PIN (bloque 07).
//
// Un solo campo enmascarado y no seis casillas: el repo no tiene ningún patrón
// de casillas de dígito y montarlo aquí sería inventar un componente nuevo para
// una pantalla que se ve dos veces al mes.
//
// `inputMode="numeric"` es lo que abre el teclado numérico del teléfono; el
// `type="password"` de al lado solo enmascara y no manda sobre el teclado en
// iOS ni en Android actuales.
//
// No hay medidor de fortaleza, ni aviso de PIN débil, ni secuencias prohibidas.
// 1234 vale. La app no regaña (§07.D.1).

import { PIN_MAX, soloDigitos } from '@lib/journalPin'

export default function CampoPin({
  id,
  label,
  value,
  onChange,
  onEnter,
  autoFocus = false,
  describedBy,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-base text-ink/80">
        {label}
      </label>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        // Pista para los teclados que todavía no leen inputMode
        pattern="[0-9]*"
        maxLength={PIN_MAX}
        value={value}
        // El PIN no es una credencial que ningún gestor deba guardar ni
        // autocompletar: ni "one-time-code", ni "current-password", ni nada.
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus={autoFocus}
        aria-describedby={describedBy}
        // Lo que se teclea y lo que se pega pasan por el mismo filtro: de un
        // "12 34" pegado quedan cuatro dígitos, sin avisar de nada.
        onChange={event => onChange(soloDigitos(event.target.value))}
        onKeyDown={event => {
          if (event.key === 'Enter' && onEnter) onEnter()
        }}
        className={[
          'mt-3 w-full min-h-touch',
          'rounded-md bg-surface border border-border',
          'px-4 py-4 text-md text-ink text-center tracking-[0.5em]',
          'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
          'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
        ].join(' ')}
      />
    </div>
  )
}
