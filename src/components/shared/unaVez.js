// src/components/shared/unaVez.js
// Un toque a la vez: el segundo, mientras el primero está en camino, no hace
// nada (SPEC_21.2).
//
// **Es el freno de los botones que esperan a la red**, y vive aquí porque lo
// usan tres sitios: `FormularioEntrar`, Tu cuenta y P7. Tenía dos copias
// escritas a mano y P7 no tenía ninguna; en la app de iPhone eso dejaba que
// dos toques sobre «Continuar con Apple» abrieran dos hojas que se pisaban el
// nonce y la llamada guardada del plugin.
//
// **No apaga el botón**: nada lleva `disabled` (§14, «Nada bloquea»). El botón
// sigue pareciendo y siendo tocable; lo que se ignora es el toque repetido.
// La referencia la pone quien lo monta (`useRef(false)`), para que el freno
// dure lo que dura el componente.

/**
 * @param {{current: boolean}} ocupado - una referencia de React.
 * @returns {(trabajo: () => Promise<unknown>) => Promise<void>}
 */
export function unaVezCon(ocupado) {
  return async (trabajo) => {
    if (ocupado.current) return
    ocupado.current = true
    try {
      await trabajo()
    } finally {
      ocupado.current = false
    }
  }
}
