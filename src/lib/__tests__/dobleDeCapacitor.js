// src/lib/__tests__/dobleDeCapacitor.js
// Un plugin de Capacitor de mentira que se porta como el de verdad.
//
// `registerPlugin` (`@capacitor/core`) devuelve un Proxy que contesta a
// **cualquier** propiedad con un envoltorio de método nativo; solo excluye
// `$$typeof` y `toJSON`. También `then`: si el proxy sale de una promesa —un
// `return` en una función `async`, un `await` sobre él, un `Promise.all`—,
// JavaScript lo toma por una promesa, llama a su `then(resolve, reject)` y el
// envoltorio rechaza **su propia** promesa sin llamar a ninguno de los dos. El
// `await` queda colgado para siempre, sin error. Un objeto normal como doble no
// lo ve nunca, y así llegó al iPhone (31 oct 2026).

/**
 * @param {Record<string, Function>} metodos - los que existen en el lado nativo.
 */
export function pluginDeCapacitor(metodos) {
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === '$$typeof') return undefined
        if (prop === 'toJSON') return () => ({})
        if (Object.hasOwn(metodos, prop)) return metodos[prop]
        return () => {
          const rechazo = Promise.reject(new Error(`"${String(prop)}" no está implementado`))
          // En el teléfono ese rechazo no lo escucha nadie; aquí se escucha para
          // que vitest no lo cuente como un rechazo sin atender.
          rechazo.catch(() => {})
          return rechazo
        }
      },
    },
  )
}

/** Falla en vez de colgarse: la prueba dice qué no terminó. */
export function aTiempo(promesa, ms = 500) {
  let reloj
  const techo = new Promise((_, rechazar) => {
    reloj = setTimeout(() => rechazar(new Error(`no terminó en ${ms} ms`)), ms)
  })
  return Promise.race([promesa, techo]).finally(() => clearTimeout(reloj))
}
