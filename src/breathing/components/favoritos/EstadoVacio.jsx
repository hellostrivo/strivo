// src/breathing/components/favoritos/EstadoVacio.jsx
// Cuando todavía no hay ninguna combinación guardada (§4.3).
//
// **No lleva botón de crear** (RN-RE-FAV-16), y no es un descuido de diseño: no
// se puede guardar una combinación sin una combinación de partida. Un botón aquí
// llevaría a un formulario vacío, que es pedirle a alguien que configure a ciegas
// algo que se encuentra respirando. Se explica cuándo aparecerán y ya está.
//
// Cumple además el criterio 4 de este repo: el vacío invita, no acusa.

import { copy } from '@copy'

export default function EstadoVacio() {
  return <p className="text-sm text-on-surface-soft">{copy.respiracion.vacio.sinFavoritos}</p>
}
