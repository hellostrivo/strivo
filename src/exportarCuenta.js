// src/exportarCuenta.js
// «Llevarme lo que escribí»: juntar las cuatro partes en un archivo (SPEC_24A).
//
// **Es la única pieza que conoce a la vez el diario y Respiración**, y por eso
// vive aquí y no dentro de ninguna de las dos: la importa solo `App.jsx`, que
// se la pasa a Tu perfil por props, como ya hace con `Respiracion` (RN-TEC-04
// y RN-TEC-07).
//
// Cada parte se construye donde vive lo suyo —el día en `diario/exportar.js`,
// Respiración en `breathing/data/exportar.js`, «Tú» en `perfil/exportar.js`— y
// lo neutral (escribir el `.md` y el `.json`, el zip y la entrega) está en
// `lib/exportar/`.
//
// **La fuente es el almacén local** del uid de la sesión, que con la cola
// incluida es lo más completo que hay en el teléfono. Funciona sin red y sin
// cuenta. Lo que nunca entra (DP-24.7): `diario/pinConfig` (hash, sal y el
// verificador de Face ID), `diario/frasesDelDia` (asignaciones internas),
// `diario/dayState` (el ánimo derivado que nadie escribe), la cola, las marcas
// y las claves del teléfono, y el uid. Lo que el exportador no conoce va al
// `.json`, tal cual, en `otros`: nada de lo escrito se queda fuera.

import { copy, interpolate } from '@copy'
import { leerTodoDelUid } from '@lib/db/local'
import { hayMarcaDeRestauracion, restaurar } from '@lib/db/restaurar'
import { TECHO_DE_ESPERA_MS, conTecho } from '@lib/sesion'
import {
  ARCHIVOS,
  claveDeFechaLocal,
  construirJson,
  construirMd,
  marcaLocalIso,
  nombreDeArchivo,
} from '@lib/exportar/archivo'
import { comprimir } from '@lib/exportar/comprimir'
import { entregar } from '@lib/exportar/entregar'
import { diasParaExportar, partesDelDia } from '@/diario/exportar'
import { estadoPin } from '@/diario/pin'
import { respiracionParaExportar } from '@/breathing/data/exportar'
import { perfilParaExportar } from '@/perfil/exportar'

/** Lo que nunca sale en el archivo, por su ruta dentro de `users/{uid}/`. */
const NUNCA = [/^diario\/pinConfig$/, /^diario\/frasesDelDia(\/|$)/, /^diario\/dayState(\/|$)/]

const SHARED = ['profile', 'auth', 'preferences', 'onboarding', 'frases']

/**
 * Reparte las filas del uid por lo que son. Exportada para las pruebas.
 *
 * @param {string} uid
 * @param {Array<{path: string, id: ?string, data: object}>} filas
 * @param {{conJournal: boolean}} opciones
 */
export function repartir(uid, filas, { conJournal }) {
  const prefijo = `users/${uid}/`
  const r = {
    shared: {},
    mananas: [],
    noches: [],
    journal: [],
    respiracion: { preferencias: null, favoritos: [], recientes: [], sesiones: [] },
    otros: [],
  }
  for (const fila of filas) {
    if (!fila.path.startsWith(prefijo)) continue
    const ruta = fila.path.slice(prefijo.length)
    if (NUNCA.some((patron) => patron.test(ruta))) continue
    const partes = ruta.split('/')
    const [rama, coleccion, items, id] = partes

    if (rama === 'shared' && partes.length === 2 && SHARED.includes(coleccion)) {
      r.shared[coleccion] = fila.data
    } else if (rama === 'diario' && items === 'items' && partes.length === 4) {
      if (coleccion === 'morningEntry') r.mananas.push({ fecha: id, data: fila.data })
      else if (coleccion === 'nightRitual') r.noches.push({ fecha: id, data: fila.data })
      else if (coleccion === 'journal') {
        // Con el PIN puesto y la puerta sin abrir no se lee siquiera (DP-24.6).
        if (conJournal) r.journal.push({ id, ...fila.data })
      } else r.otros.push({ ruta, datos: fila.data })
    } else if (rama === 'breathing' && partes.length === 2 && coleccion === 'unica') {
      r.respiracion.preferencias = fila.data
    } else if (
      rama === 'breathing' &&
      items === 'items' &&
      partes.length === 4 &&
      ['favoritos', 'recientes', 'sesiones'].includes(coleccion)
    ) {
      r.respiracion[coleccion].push({ id, ...fila.data })
    } else {
      r.otros.push({ ruta, datos: fila.data })
    }
  }
  return r
}

function fechaLargaSinDia(fecha) {
  return fecha.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Construye los dos archivos, sin comprimir. Pura salvo la lectura del
 * almacén; exportada para las pruebas.
 *
 * @returns {Promise<{nombre: string, md: string, json: string, sinEntradas: boolean}>}
 */
export async function construirArchivos(
  uid,
  { conJournal = true, completo = true, ahora = new Date(), filas } = {},
) {
  const leidas = filas ?? (await leerTodoDelUid(uid))
  const r = repartir(uid, leidas, { conJournal })
  const genero = r.shared.profile?.gender ?? 'n'

  const dias = diasParaExportar(
    { mananas: r.mananas, noches: r.noches, journal: r.journal },
    genero,
  )
  const { persona, bloques: bloquesTu } = perfilParaExportar(r.shared)
  const respiracion = respiracionParaExportar(r.respiracion)

  const textos = copy.cuenta.exportar.archivo
  const fecha = fechaLargaSinDia(ahora)
  const md = construirMd({
    titulo: textos.titulo,
    subtitulo: persona.nombre
      ? interpolate(textos.exportadoConNombre, { nombre: persona.nombre, fecha })
      : interpolate(textos.exportado, { fecha }),
    tu: { titulo: textos.tu, bloques: bloquesTu },
    dias: dias.map((dia) => ({ titulo: dia.titulo, partes: partesDelDia(dia) })),
    respiracion: respiracion.md,
  })

  const json = construirJson({
    exportadoEn: marcaLocalIso(ahora),
    zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    completo,
    persona,
    dias: dias.map(({ fecha: clave, manana, noche, journal }) => ({
      fecha: clave,
      manana: manana && { registro: manana.registro, bloques: manana.bloques.map(paraJson) },
      noche: noche && { registro: noche.registro, bloques: noche.bloques.map(paraJson) },
      journal: journal.map(({ etiquetas: _etiquetas, hora: _hora, ...resto }) => resto),
    })),
    respiracion: respiracion.json,
    otros: r.otros,
  })

  return {
    nombre: nombreDeArchivo(persona.nombre, claveDeFechaLocal(ahora)),
    md,
    json,
    sinEntradas: dias.length === 0,
  }
}

/** Un bloque, como va en el `.json`: la pregunta, y las respuestas o lo elegido. */
function paraJson(bloque) {
  const base = { id: bloque.id, pregunta: bloque.titulo ?? null }
  if (bloque.forma === 'chip') return { ...base, emociones: bloque.emociones ?? [] }
  return { ...base, respuestas: bloque.lineas.map((l) => String(l ?? '')) }
}

/**
 * ¿Hace falta la puerta del journal antes de exportar? Con el PIN puesto, sí,
 * haya o no entradas: pedirla solo cuando las hay contaría lo que el PIN tapa.
 */
export async function pidePuerta(uid) {
  try {
    return (await estadoPin(uid)).activo === true
  } catch {
    return false
  }
}

/**
 * D7 — Con cuenta y sin haber terminado de bajarla a este teléfono, se intenta
 * bajar antes (como mucho `TECHO_DE_ESPERA_MS`). Termine o no, se exporta lo
 * que hay; si no terminó, el archivo lo dice (`completo: false`) y la pantalla
 * también. Sin cuenta, siempre completo.
 */
export async function asegurarCompleto(uid, { conCuenta, enLinea = () => navigator.onLine } = {}) {
  if (!conCuenta) return true
  if (hayMarcaDeRestauracion(uid)) return true
  if (enLinea())
    await conTecho(
      restaurar(uid).catch(() => null),
      TECHO_DE_ESPERA_MS,
    )
  return hayMarcaDeRestauracion(uid)
}

/**
 * Prepara el archivo y lo entrega: descarga en la web, hoja de compartir en el
 * iPhone. La puerta del journal la abre la pantalla antes de llamar aquí.
 *
 * @returns {Promise<{entrega: 'descargado'|'compartido'|'cancelado', sinEntradas: boolean, completo: boolean}>}
 */
export async function exportarCuenta(uid, { conCuenta = false } = {}) {
  const completo = await asegurarCompleto(uid, { conCuenta })
  const { nombre, md, json, sinEntradas } = await construirArchivos(uid, { completo })
  const bytes = await comprimir({ [ARCHIVOS.md]: md, [ARCHIVOS.json]: json })
  const entrega = await entregar(bytes, nombre)
  return { entrega, sinEntradas, completo }
}
