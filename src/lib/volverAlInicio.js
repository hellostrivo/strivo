// src/lib/volverAlInicio.js
// Devuelve una pantalla a su principio, sin que se vea el viaje.
//
// Lo usan los dos cierres del día (la mañana y la noche) al volver a Hoy: la
// consulta tiene que aparecer desde arriba, no donde se quedó el recorrido.
// Se llama **mientras el velo del cierre todavía tapa**, así que el salto no lo
// ve nadie.
//
// Hoy se desplaza con el documento, pero no se da por hecho: se recorren los
// antepasados del elemento y se vuelve a cero cualquiera que esté desplazado,
// y después el documento. Si mañana Hoy vive dentro de un contenedor con su
// propio scroll, esto sigue funcionando sin tocarlo.
//
// Asignar `scrollTop` es inmediato mientras nadie declare `scroll-behavior:
// smooth`, y en este producto nadie lo declara.

export function volverAlInicio(elemento) {
  for (let nodo = elemento?.parentElement; nodo; nodo = nodo.parentElement) {
    if (nodo.scrollTop > 0) nodo.scrollTop = 0
  }
  const documento = elemento?.ownerDocument ?? globalThis.document
  const raiz = documento?.scrollingElement ?? documento?.documentElement
  if (raiz) raiz.scrollTop = 0
}
