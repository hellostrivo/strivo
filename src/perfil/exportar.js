// src/perfil/exportar.js
// «Tú», para el archivo de «Llevarme lo que escribí» (SPEC_24A).
//
// Lo que la app sabe de la persona porque ella lo dijo: su nombre, cómo
// hablarle, sus horarios, qué vino a buscar (P3) y qué frases prefiere. Los
// catálogos se leen de donde se preguntan —el género y los motivos del
// onboarding, las referencias de `referencias/`—, como hace Tu perfil
// (RN-TEC-07). No lee `diario/` ni `breathing/`.
//
// **Nunca entra el uid** ni nada de la maquinaria del recorrido (pasos,
// versión, fechas): un identificador interno no es de la persona.

import { copy } from '@copy'
import { opcionDe } from '@/onboarding/genero'
import { ID_OTRO as MOTIVO_OTRO } from '@/onboarding/motivos'
import { MODO_POR_DEFECTO, normalizar } from '@/referencias/preferencias'

function textoONulo(valor) {
  const limpio = String(valor ?? '').trim()
  return limpio === '' ? null : limpio
}

function rotuloDeGenero(gender) {
  const opcion = opcionDe(gender)
  return opcion ? copy.diario.onboarding.p2a.options[opcion] : null
}

/**
 * @param {object} registros - los documentos de `shared/`, tal cual (o `null`).
 * @returns {{persona: object, bloques: object[]}} `persona` para el `.json`;
 *   `bloques`, con la forma de los del día, para la sección «Tú» del `.md`.
 */
export function perfilParaExportar({
  profile = null,
  auth = null,
  preferences = null,
  onboarding = null,
  frases = null,
} = {}) {
  const p3 = copy.diario.onboarding.p3
  const referencias = copy.diario.onboarding.p5r
  const afinidadesTexto = copy.diario.onboarding.p5ra

  const motivos = (onboarding?.motivos ?? []).map((id) => ({
    id,
    rotulo: p3.options[id] ?? null,
  }))
  const motivoOtro = textoONulo(onboarding?.motivoOtro)
  const elegidas = frases ? normalizar(frases) : null
  const conFrases = elegidas && elegidas.modo !== MODO_POR_DEFECTO

  const persona = {
    nombre: textoONulo(profile?.name),
    genero: profile?.gender ? { id: profile.gender, rotulo: rotuloDeGenero(profile.gender) } : null,
    correo: textoONulo(auth?.email),
    telefono: textoONulo(auth?.phone),
    horarios: {
      despertar: profile?.wakeTime ?? null,
      dormir: profile?.sleepTime ?? null,
      diaTerminaA: profile?.diaTerminaA ?? null,
    },
    identidadCentral: textoONulo(profile?.identidadCentral),
    motivos,
    motivoOtro,
    frases: conFrases
      ? {
          modo: { id: elegidas.modo, rotulo: referencias.opciones[elegidas.modo] ?? null },
          afinidades: elegidas.afinidades.map((id) => ({
            id,
            rotulo: afinidadesTexto.opciones[id] ?? null,
          })),
        }
      : null,
    preferencias: preferences
      ? {
          soundEnabled: preferences.soundEnabled ?? null,
          reducedMotion: preferences.reducedMotion ?? null,
          remindersEnabled: preferences.remindersEnabled ?? null,
        }
      : null,
  }

  const bloques = []
  const fichasDeMotivo = [
    ...motivos.filter((m) => m.id !== MOTIVO_OTRO && m.rotulo).map((m) => m.rotulo),
    ...(motivoOtro ? [`«${motivoOtro}»`] : []),
  ]
  if (fichasDeMotivo.length > 0) {
    bloques.push({
      id: 'motivos',
      titulo: p3.question,
      forma: 'chip',
      numerado: false,
      fichas: fichasDeMotivo.map((texto) => ({ texto, emoji: null })),
      lineas: [],
    })
  }
  if (conFrases) {
    const fichas = [
      referencias.opciones[elegidas.modo],
      ...elegidas.afinidades.map((id) => afinidadesTexto.opciones[id]),
    ].filter(Boolean)
    bloques.push({
      id: 'frases',
      titulo: referencias.titulo,
      forma: 'chip',
      numerado: false,
      fichas: fichas.map((texto) => ({ texto, emoji: null })),
      lineas: [],
    })
  }
  if (persona.identidadCentral) {
    bloques.push({
      id: 'sobreTi',
      titulo: copy.cuenta.exportar.archivo.sobreTi,
      forma: 'texto',
      numerado: false,
      fichas: [],
      lineas: [persona.identidadCentral],
    })
  }

  return { persona, bloques }
}
