// src/lib/frases.js
// De dónde sale la frase que se lee al abrir la app (§17.5) y la del día (§20.3).
//
// Baraja, no dado: se recorre una permutación entera y solo al acabarla se
// vuelve a barajar. Un random() puro repite con una frecuencia que la gente nota
// y que hace sentir pequeño un repertorio de cien.
//
// La baraja vive en IndexedDB para que sobreviva a cerrar la app: si se
// reiniciara en cada arranque, las primeras frases saldrían siempre y el resto
// casi nunca.
//
// Los dos repertorios no se mezclan (docs/frases.md): el de la apertura mira al
// presente y el del día al día por delante. Si una frase pudiera salir en los
// dos sitios, aparecería dos veces con dos minutos de diferencia.

import { copy } from '@copy'
import { getFlag, setFlag } from '@lib/db'

export const REPERTORIOS = {
  apertura: () => copy.apertura.frases,
  dia:      () => copy.hoy.fraseDelDia,
}

const claveBaraja = repertorio => `baraja.${repertorio}`
const CLAVE_FRASE_DEL_DIA = 'fraseDelDia'

// Fisher-Yates
export function barajar(total, azar = Math.random) {
  const orden = Array.from({ length: total }, (_, i) => i)
  for (let i = orden.length - 1; i > 0; i -= 1) {
    const j = Math.floor(azar() * (i + 1))
    ;[orden[i], orden[j]] = [orden[j], orden[i]]
  }
  return orden
}

/**
 * La siguiente frase del repertorio, sin repetir hasta agotarlo.
 *
 * Si el repertorio creció desde la última vez, se vuelve a barajar: es más
 * sencillo y más justo que intentar encajar las frases nuevas en una baraja a
 * medias, y solo pasa cuando alguien añade frases.
 */
export async function siguienteFrase(repertorio, azar = Math.random) {
  const frases = REPERTORIOS[repertorio]?.() ?? []
  if (!frases.length) return null

  const guardada = await getFlag(claveBaraja(repertorio))
  const sirve =
    guardada &&
    guardada.total === frases.length &&
    Array.isArray(guardada.pendientes) &&
    guardada.pendientes.length > 0

  const pendientes = sirve ? [...guardada.pendientes] : barajar(frases.length, azar)
  const indice     = pendientes.shift()

  await setFlag(claveBaraja(repertorio), { total: frases.length, pendientes })

  return frases[indice] ?? frases[0]
}

/**
 * La frase de hoy (§20.3): la misma durante todo el día natural.
 *
 * Se fija en el primer arranque del día y se guarda con su fecha. Si cambiara al
 * recargar dejaría de ser "la frase de hoy" y sería un elemento aleatorio más.
 */
export async function fraseDelDia(fecha, azar = Math.random) {
  const guardada = await getFlag(CLAVE_FRASE_DEL_DIA)
  if (guardada?.fecha === fecha && guardada?.texto) return guardada.texto

  const texto = await siguienteFrase('dia', azar)
  if (texto) await setFlag(CLAVE_FRASE_DEL_DIA, { fecha, texto })
  return texto
}
