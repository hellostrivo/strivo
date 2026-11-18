// src/breathing/data/exportar.js
// Respiración, para el archivo de «Llevarme lo que escribí» (SPEC_24A, D8).
//
// **En el `.md` solo van las combinaciones guardadas**, con el nombre que les
// puso la persona y la misma línea que se lee en la lista de favoritos
// (`subtitulo`). Las sesiones y los recuentos de uso son cifras, y una cifra a
// la vista es lo que esta herramienta no enseña nunca (RN-RE-01): van solo en
// el `.json`, que es el registro completo de lo suyo.
//
// Recibe las filas ya leídas: no lee la base y no siembra nada
// (`leerPreferencias` escribe los valores de fábrica si faltan, y exportar no
// puede escribir).

import { copy } from '@copy'
import { obtenerPreset } from './catalogoPatrones.js'
import { obtenerSonido } from './catalogoSonidos.js'
import { subtitulo } from '../lib/favoritos.js'

function rotuloDePatron(id) {
  const preset = obtenerPreset(id)
  return preset ? (copy.respiracion.patrones[preset.claveCopy]?.nombre ?? null) : null
}

function rotuloDeSonido(id) {
  const sonido = obtenerSonido(id)
  return sonido ? (copy.respiracion.sonidos[sonido.claveCopy]?.nombre ?? null) : null
}

function rotuloDeVisual(id) {
  const textos = copy.respiracion.configuracion
  if (id === 'circulo') return textos.visualCirculo
  if (id === 'linea') return textos.visualLinea
  return null
}

function conRotulos(registro) {
  return {
    ...registro,
    rotulos: {
      patron: rotuloDePatron(registro.patronBaseId),
      sonido: rotuloDeSonido(registro.sonidoAmbienteId),
      visual: rotuloDeVisual(registro.visual),
    },
  }
}

function porFecha(campo) {
  return (a, b) => String(a[campo] ?? '').localeCompare(String(b[campo] ?? ''))
}

/**
 * @param {object} filas
 * @param {?object} filas.preferencias - `breathing/unica`, tal cual.
 * @param {object[]} filas.favoritos
 * @param {object[]} filas.recientes
 * @param {object[]} filas.sesiones
 * @returns {{json: object, md: ?{titulo: string, intro: string, lineas: string[]}}}
 */
export function respiracionParaExportar({
  preferencias = null,
  favoritos = [],
  recientes = [],
  sesiones = [],
} = {}) {
  const ordenados = [...favoritos].sort(porFecha('creadoEn'))
  const json = {
    preferencias,
    favoritos: ordenados.map(conRotulos),
    recientes: [...recientes].sort(porFecha('usadoEn')).map(conRotulos),
    sesiones: [...sesiones].sort(porFecha('iniciadaEn')),
  }
  const textos = copy.cuenta.exportar.archivo
  const md =
    ordenados.length === 0
      ? null
      : {
          titulo: textos.respiracion,
          intro: textos.combinaciones,
          combinaciones: ordenados.map((f) => ({
            nombre: String(f.nombre ?? ''),
            detalle: subtitulo(f),
          })),
        }
  return { json, md }
}
