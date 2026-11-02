// src/components/shared/BotonProveedor.jsx
// El botón de Google o de Apple (SPEC_21.2 §4.4).
//
// **Uno solo, para los tres sitios que lo pintan**: P7, la vista de entrar del
// onboarding y Tu perfil (estos dos, dentro de `FormularioEntrar`). Tres copias
// del mismo botón se separan en cuanto alguien retoca una.
//
// **Todo llega por props** (RN-TEC-05): el proveedor, el texto y qué hacer al
// tocarlo. Aquí no se lee la sesión, ni `lib/cuenta`, ni el copy.
//
// **Los colores no viven aquí** sino en `globals.css` (`.boton-proveedor`):
// fondo blanco en los dos momentos, con borde solo sobre superficie clara, y el
// negro del botón de Apple como excepción de marca a RN-VIS-03. Los logos son
// los de cada marca, sin tocar, y van ocultos al lector de pantalla: el nombre
// del proveedor ya lo dice el texto.
//
// Mismo tamaño que el resto de botones, del ancho de su columna. Sin
// `disabled`: un segundo toque lo frena quien lo monta.

import { clsx } from 'clsx'
import logoApple from '@/assets/proveedores/apple.svg'
import logoGoogle from '@/assets/proveedores/google.svg'

export const LOGOS = Object.freeze({ apple: logoApple, google: logoGoogle })

/**
 * @param {object} props
 * @param {'apple'|'google'} props.proveedor
 * @param {string} props.texto - «Continuar con Apple», «Continuar con Google».
 * @param {() => void} props.onClick
 */
export default function BotonProveedor({ proveedor, texto, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-proveedor={proveedor}
      className={clsx(
        'boton-proveedor',
        `boton-proveedor--${proveedor}`,
        'inline-flex w-full items-center justify-center gap-3',
        'rounded-md px-6 py-4 min-h-touch font-sans font-medium text-base',
        'select-none cursor-pointer',
      )}
    >
      <img src={LOGOS[proveedor]} alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span>{texto}</span>
    </button>
  )
}
