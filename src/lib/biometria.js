// src/lib/biometria.js
// El puente con Face ID y Touch ID del iPhone (SPEC_23A).
//
// **El único archivo de `src/` que importa `@capgo/capacitor-native-biometric`,
// y bajo demanda.** En la web y en las pruebas no se carga nunca —quien llama
// pregunta antes `esIPhone()`— y hay una prueba que recorre `src/` para
// comprobarlo. **La versión web del plugin es falsa**: dice que siempre hay
// Touch ID y guarda en memoria sin pedir nada. Cargarla en la web sería abrir
// el journal con un sí inventado.
//
// **Qué se guarda en la Keychain: una clave aleatoria y nada más** (DP-23.8).
// Nunca el PIN. Se guarda con `.biometryCurrentSet` y
// `kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly` (`accessControl: 1`, leído
// en el Swift del plugin): no viaja a la Llavero de iCloud, no entra en las
// copias, no pasa a otro teléfono, desaparece si se quita el código del iPhone
// y **iOS la invalida si se registra una cara o un dedo nuevo**. Qué abre el
// journal lo decide `diario/pin.js`; aquí solo se dice cómo se habla con iOS.
//
// **Ninguna respuesta del teléfono es un error** (RN-EST-04). Todo contesta y
// nada lanza hacia la pantalla: un plugin que falla se lee como «no hay
// biometría» o «no se pudo», y la puerta de siempre —el PIN— sigue ahí.
//
// **El plugin nunca sale suelto de una promesa** (SPEC_21.2): es un Proxy de
// Capacitor que contesta también a `then`. `cargarPlugin` lo devuelve envuelto.

/** El nombre fijo de la clave en la Keychain. Al activar se sobrescribe. */
export const NOMBRE_DE_LA_CLAVE = 'strivo.journal.biometria'

/** `AccessControl.BIOMETRY_CURRENT_SET` del plugin. */
const SOLO_LAS_CARAS_DE_HOY = 1

/** `biometryType` del plugin. */
const TIPOS = Object.freeze({ 1: 'touchId', 2: 'faceId' })

/**
 * Por qué no hay biometría, con los códigos que da `isAvailable` (leídos en
 * su Swift). Los tres primeros dejan la clave sin poder abrir: es `cambiada`.
 */
export const SIN_BIOMETRIA = Object.freeze({
  negado: 'negado', // 1 · se le quitó el permiso a Strivo en Ajustes
  sinCaras: 'sinCaras', // 3 · no hay caras ni dedos registrados
  sinCodigo: 'sinCodigo', // 14 · el teléfono no tiene código
  bloqueo: 'bloqueo', // 2 · demasiados intentos: pasa solo
  otro: 'otro',
})

const MOTIVO_DE_DISPONIBILIDAD = Object.freeze({
  1: SIN_BIOMETRIA.negado,
  2: SIN_BIOMETRIA.bloqueo,
  3: SIN_BIOMETRIA.sinCaras,
  14: SIN_BIOMETRIA.sinCodigo,
})

/** Lo que pasó al leer la clave, con los códigos de `getSecureData`. */
export const AL_LEER = Object.freeze({
  cancelado: 'cancelado', // 16 · la persona, el sistema o la app (iOS no los separa)
  noEsta: 'noEsta', // 21 · no hay clave: nunca se guardó, o iOS la quitó
  fallo: 'fallo', // 10 · la cara no coincidió
  otro: 'otro', // 0 · cualquier otra cosa (p. ej. la app en el fondo)
})

const MOTIVO_AL_LEER = Object.freeze({
  16: AL_LEER.cancelado,
  21: AL_LEER.noEsta,
  10: AL_LEER.fallo,
})

async function cargarPlugin() {
  const { NativeBiometric } = await import('@capgo/capacitor-native-biometric')
  return { plugin: NativeBiometric }
}

/**
 * Crea el puente. `cargar` existe para las pruebas: allí se le da un doble que
 * se porta como el Proxy de Capacitor.
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
    /**
     * ¿Hay Face ID o Touch ID para Strivo? No enseña ningún diálogo.
     *
     * @returns {Promise<{disponible: boolean, tipo: 'faceId'|'touchId'|null, motivo: string|null}>}
     */
    disponibilidad: () =>
      conPlugin(
        async (plugin) => {
          const respuesta = await plugin.isAvailable({ useFallback: false })
          const tipo = TIPOS[respuesta?.biometryType] ?? null
          if (respuesta?.isAvailable === true && tipo)
            return { disponible: true, tipo, motivo: null }
          return {
            disponible: false,
            tipo,
            motivo: MOTIVO_DE_DISPONIBILIDAD[respuesta?.errorCode] ?? SIN_BIOMETRIA.otro,
          }
        },
        { disponible: false, tipo: null, motivo: SIN_BIOMETRIA.otro },
      ),

    /** Guarda la clave, sobrescribiendo la que hubiera. No pide la cara. */
    guardar: (clave) =>
      conPlugin(async (plugin) => {
        await plugin.setData({
          key: NOMBRE_DE_LA_CLAVE,
          value: clave,
          accessControl: SOLO_LAS_CARAS_DE_HOY,
        })
        return true
      }, false),

    /**
     * Lee la clave: aquí iOS pide la cara (o el dedo). `motivo` es lo que
     * enseña iOS al pedir Touch ID; con Face ID manda el texto de `Info.plist`.
     * `fallbackTitle` vacío: iOS no ofrece el código del teléfono, porque el
     * respaldo es el PIN.
     *
     * @returns {Promise<{ok: true, clave: string}|{ok: false, motivo: string}>}
     */
    leer: (motivo) =>
      conPlugin(
        async (plugin) => {
          try {
            const { value } = await plugin.getSecureData({
              key: NOMBRE_DE_LA_CLAVE,
              reason: motivo,
              fallbackTitle: '',
            })
            if (typeof value !== 'string' || value === '')
              return { ok: false, motivo: AL_LEER.otro }
            return { ok: true, clave: value }
          } catch (error) {
            return { ok: false, motivo: MOTIVO_AL_LEER[String(error?.code)] ?? AL_LEER.otro }
          }
        },
        { ok: false, motivo: AL_LEER.otro },
      ),

    /** Borra la clave. No pide la cara. Que no existiera también es borrar. */
    borrar: () =>
      conPlugin(async (plugin) => {
        await plugin.deleteData({ key: NOMBRE_DE_LA_CLAVE })
        return true
      }, false),

    /**
     * ¿Hay una clave guardada? No pide la cara. `null` si no se pudo saber:
     * ante la duda no se borra nada.
     */
    existe: () =>
      conPlugin(
        async (plugin) => (await plugin.isDataSaved({ key: NOMBRE_DE_LA_CLAVE }))?.isSaved === true,
        null,
      ),
  }
}

/** El puente de la app. */
export const biometria = crearPuente()
