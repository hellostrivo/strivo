// src/lib/respiracion/__tests__/relojFalso.js
// Un reloj y un planificador de fotogramas gobernados a mano.
//
// El motor recibe los dos por parámetro justamente para esto: medir diez
// minutos de sesión sin esperar diez minutos, y poder simular una pestaña
// oculta —tiempo que pasa sin un solo fotograma— que es el caso 9.3.

export function crearRelojFalso() {
  let t = 0
  let siguienteId = 1
  const cola = new Map()

  function correrFotograma() {
    const pendientes = [...cola.values()]
    cola.clear()
    pendientes.forEach((fn) => fn())
  }

  return {
    ahora: () => t,
    programarFrame(fn) {
      const id = siguienteId++
      cola.set(id, fn)
      return id
    },
    cancelarFrame(id) {
      cola.delete(id)
    },
    /** Cuántos fotogramas hay pendientes. Un reloj detenido no deja ninguno. */
    fotogramasPendientes: () => cola.size,

    /** Avanza emitiendo fotogramas, como haría el navegador. */
    avanzar(ms, paso = 16) {
      let restante = ms
      while (restante > 0) {
        const salto = Math.min(paso, restante)
        t += salto
        restante -= salto
        correrFotograma()
      }
    },

    /** Avanza sin emitir ni un fotograma: la pestaña estuvo oculta. */
    ausentarse(ms) {
      t += ms
    },
  }
}
