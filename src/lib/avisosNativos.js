// src/lib/avisosNativos.js
// El puente con los avisos locales del iPhone (SPEC_22).
//
// **El único archivo de `src/` que importa `@capacitor/local-notifications`, y
// bajo demanda.** En la web y en las pruebas no se carga nunca: la web no
// descarga ni una línea del plugin, y hay una prueba que recorre `src/` para
// comprobarlo. Aquí se dice cómo se habla con iOS; qué avisos tocan lo dice
// `avisos/plan.js` y cuándo se corrige, `avisos/reconciliar.js`.
//
// **El plugin nunca sale suelto de una promesa** (SPEC_21.2). Es un Proxy de
// Capacitor que contesta también a `then`: devolverlo desde una función
// `async` deja el `await` colgado para siempre, sin error. `cargarPlugin` lo
// devuelve envuelto.
//
// **Ninguna respuesta del teléfono es un error** (RN-EST-04). Todo lo de aquí
// contesta y nunca lanza: un "no" del teléfono, un plugin que falla o un
// permiso que no se puede consultar dejan la app como estaba.
//
// **Nunca se programa sin permiso.** `schedule()` del plugin pide el permiso
// él solo si todavía no se ha decidido; el permiso solo se pide con un toque
// de la persona (DP-22.8), así que quien llama a `programar` tiene que haber
// comprobado antes que está concedido. La reconciliación lo hace.

/** Los tres estados del permiso del teléfono. Los mismos valores que P6. */
export const PERMISO = Object.freeze({
  sinPedir: 'sin_pedir',
  concedido: 'concedido',
  denegado: 'denegado',
})

/** El evento del plugin cuando alguien toca un aviso. */
const EVENTO_DE_TOQUE = 'localNotificationActionPerformed'

async function cargarPlugin() {
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  return { plugin: LocalNotifications }
}

function comoPermiso(display) {
  if (display === 'granted') return PERMISO.concedido
  if (display === 'denied') return PERMISO.denegado
  return PERMISO.sinPedir
}

/** ¿Es un aviso de Strivo? Lo marca `extra.strivo` al programarlo. */
export function esDeStrivo(aviso) {
  return aviso?.extra?.strivo === true
}

/**
 * Crea el puente. `cargar` existe para las pruebas: allí se le da un doble
 * que se porta como el Proxy de Capacitor.
 */
export function crearPuente({ cargar = cargarPlugin } = {}) {
  const conPlugin = async (fn, siFalla) => {
    try {
      const { plugin } = await cargar()
      return await fn(plugin)
    } catch {
      return siFalla
    }
  }

  return {
    /** En qué situación está el permiso, sin pedir nada. */
    permiso: () =>
      conPlugin(
        async (plugin) => comoPermiso((await plugin.checkPermissions())?.display),
        PERMISO.denegado,
      ),

    /** Pide el permiso. Solo con un toque de la persona. */
    pedirPermiso: () =>
      conPlugin(
        async (plugin) =>
          (await plugin.requestPermissions())?.display === 'granted'
            ? PERMISO.concedido
            : PERMISO.denegado,
        PERMISO.denegado,
      ),

    /** Los avisos de Strivo que iOS tiene programados. */
    pendientes: () =>
      conPlugin(
        async (plugin) => ((await plugin.getPending())?.notifications ?? []).filter(esDeStrivo),
        null,
      ),

    /** Programa avisos ya formados. Una lista vacía no llama a nadie. */
    programar: (avisos) =>
      avisos.length === 0
        ? Promise.resolve(true)
        : conPlugin(async (plugin) => {
            await plugin.schedule({ notifications: avisos })
            return true
          }, false),

    /** Cancela por id. Una lista vacía no llama a nadie: el plugin la rechaza. */
    cancelar: (ids) =>
      ids.length === 0
        ? Promise.resolve(true)
        : conPlugin(async (plugin) => {
            await plugin.cancel({ notifications: ids.map((id) => ({ id })) })
            return true
          }, false),

    /** Retira del Centro de notificaciones los avisos ya entregados. */
    retirarEntregados: (ids) =>
      ids.length === 0
        ? Promise.resolve(true)
        : conPlugin(async (plugin) => {
            await plugin.removeDeliveredNotificationsById({ ids })
            return true
          }, false),

    /**
     * Escucha los toques en los avisos de Strivo. El plugin guarda el toque
     * hasta que alguien escucha (`retainUntilConsumed`), así que el que abrió
     * la app desde cerrada llega en cuanto esto se registra.
     *
     * @param {(momento: string) => void} alTocar
     * @returns {Promise<() => void>} Para dejar de escuchar.
     */
    escucharToques: (alTocar) =>
      conPlugin(
        async (plugin) => {
          const asa = await plugin.addListener(EVENTO_DE_TOQUE, (evento) => {
            if (evento?.actionId !== 'tap') return
            if (!esDeStrivo(evento?.notification)) return
            alTocar(evento.notification.extra.momento)
          })
          return () => {
            Promise.resolve(asa?.remove?.()).catch(() => {})
          }
        },
        () => {},
      ),
  }
}

/** El puente de la app. */
export const puente = crearPuente()
