// src/lib/audio/ruido.js
// Los tres ruidos de los que salen casi todos los sonidos ambiente (SPEC_15 §3.3).
//
// **Toda la síntesis de Strivo es procedural: ni un archivo de audio.** Un
// bucle de lluvia en calidad decente pesa entre 1,5 y 4 MB, hay que licenciarlo,
// hay que precachearlo para que funcione sin red, y por bien que esté cortado se
// le acaba oyendo el punto de bucle. Generarlo cuesta cero bytes de descarga,
// no tiene licencia que resolver, funciona offline por construcción y no se
// repite nunca. Es además la infraestructura que SPEC_08 ya dejó en el repo.
//
// **La matemática vive separada de las llamadas a Web Audio** (RN-RE-SND-30).
// El entorno de pruebas no tiene audio real, así que lo que se puede probar de
// verdad —que el ruido rosa cae a 3 dB por octava, que el bucle no chasca— tiene
// que ser una función que reciba números y devuelva números.

/** RN-RE-SND-04 — Cuatro segundos, generados una sola vez y en bucle. */
export const SEGUNDOS_BUFFER = 4

/** RN-RE-SND-05 — El cruce que esconde la costura del bucle. */
export const MS_CRUCE_BUCLE = 200

/**
 * Ruido blanco: energía plana en todas las frecuencias.
 * Suena a estática de televisión. Casi nunca se usa tal cual; es la materia
 * prima de los otros dos y de los impulsos de gota y de chispa.
 */
export function muestrasBlancas(n, azar = Math.random) {
  const muestras = new Float32Array(n)
  for (let i = 0; i < n; i += 1) muestras[i] = azar() * 2 - 1
  return muestras
}

/**
 * Ruido rosa: −3 dB por octava. Es el que el oído percibe como "parejo".
 *
 * El blanco suena agudo y agresivo porque cada octava que sube contiene el
 * doble de bandas y por tanto el doble de energía. El rosa compensa esa cuesta,
 * y por eso es el que se parece a la lluvia, al mar y al viento, que es
 * exactamente lo que hace falta aquí.
 *
 * Filtro de Paul Kellet: una aproximación de seis polos, barata y estable.
 */
export function muestrasRosas(n, azar = Math.random) {
  const muestras = new Float32Array(n)
  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0

  for (let i = 0; i < n; i += 1) {
    const blanco = azar() * 2 - 1
    b0 = 0.99886 * b0 + blanco * 0.0555179
    b1 = 0.99332 * b1 + blanco * 0.0750759
    b2 = 0.969 * b2 + blanco * 0.153852
    b3 = 0.8665 * b3 + blanco * 0.3104856
    b4 = 0.55 * b4 + blanco * 0.5329522
    b5 = -0.7616 * b5 - blanco * 0.016898
    muestras[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + blanco * 0.5362) * 0.11
    b6 = blanco * 0.115926
  }
  return muestras
}

/**
 * Ruido marrón: −6 dB por octava. Más grave y más hondo que el rosa.
 * Es el lecho del fuego: lo que queda cuando se le quita el brillo al rosa.
 */
export function muestrasMarrones(n, azar = Math.random) {
  const muestras = new Float32Array(n)
  let ultimo = 0
  for (let i = 0; i < n; i += 1) {
    const blanco = azar() * 2 - 1
    ultimo = (ultimo + 0.02 * blanco) / 1.02
    muestras[i] = ultimo * 3.5
  }
  return muestras
}

/**
 * Cose el final del bucle con su principio (RN-RE-SND-05).
 *
 * Sin esto, cada cuatro segundos hay un salto de amplitud —el último valor no
 * tiene nada que ver con el primero— y ese salto se oye como un clic. Peor: se
 * oye **cada cuatro segundos**, con lo que el ambiente acaba teniendo un pulso
 * regular, que es justo lo que RN-RE-SND-07 prohíbe. Es un fallo que empieza
 * siendo un chasquido y termina siendo un metrónomo.
 *
 * Se mezcla la cola sobre la cabeza con un desvanecimiento cruzado y se recorta
 * el buffer: lo que queda empalma consigo mismo sin costura.
 *
 * @param {Float32Array} muestras
 * @param {number} muestrasCruce
 * @returns {Float32Array} Más corto que el original por `muestrasCruce`.
 */
export function coserBucle(muestras, muestrasCruce) {
  const cruce = Math.min(Math.floor(muestrasCruce), Math.floor(muestras.length / 2))
  if (cruce <= 0) return muestras.slice()

  const largo = muestras.length - cruce
  const cosido = muestras.slice(0, largo)

  for (let i = 0; i < cruce; i += 1) {
    const { entra, sale } = pesosDeCruce(i / cruce)
    cosido[i] = cosido[i] * entra + muestras[largo + i] * sale
  }
  return cosido
}

/**
 * Los dos pesos de un desvanecimiento cruzado, en igual potencia.
 *
 * `entra² + sale² = 1` para cualquier `t`, y esa identidad es toda la razón de
 * usar senos en vez de rectas: al sumar dos señales sin correlación, lo que se
 * conserva es la potencia y no la amplitud, así que con pesos lineales —que
 * suman 1— el resultado pierde volumen en el centro del cruce y se oye un
 * bache. Con estos, no.
 */
export function pesosDeCruce(t) {
  const recortado = Math.min(1, Math.max(0, Number(t) || 0))
  return {
    entra: Math.sin((recortado * Math.PI) / 2),
    sale: Math.cos((recortado * Math.PI) / 2),
  }
}

/** Los tres, por nombre. */
export const GENERADORES = Object.freeze({
  blanco: muestrasBlancas,
  rosa: muestrasRosas,
  marron: muestrasMarrones,
})

/**
 * Crea el `AudioBuffer` en bucle de un tipo de ruido.
 *
 * **Se llama una vez por fuente, nunca por ciclo** (RN-RE-SND-04). Regenerar
 * cuatro segundos de ruido en cada vuelta serían ~176.000 muestras por segundo
 * quemadas para producir algo indistinguible de lo que ya había.
 *
 * @param {AudioContext} ctx
 * @param {'blanco'|'rosa'|'marron'} tipo
 * @param {{segundos?: number, azar?: Function, conCruce?: boolean}} [opciones]
 * @returns {?AudioBuffer}
 */
export function crearBufferRuido(
  ctx,
  tipo,
  { segundos = SEGUNDOS_BUFFER, azar, conCruce = true } = {},
) {
  const generar = GENERADORES[tipo]
  if (!ctx || !generar) return null

  const frecuencia = ctx.sampleRate || 44100
  const crudas = generar(Math.floor(frecuencia * segundos), azar)
  const muestras = conCruce ? coserBucle(crudas, (MS_CRUCE_BUCLE / 1000) * frecuencia) : crudas

  const buffer = ctx.createBuffer(1, muestras.length, frecuencia)
  buffer.getChannelData(0).set(muestras)
  return buffer
}

/**
 * La fuente en bucle a partir de un buffer ya generado.
 * Devuelve el nodo sin arrancarlo: arrancarlo es decisión de quien lo monta.
 */
export function crearFuenteEnBucle(ctx, buffer) {
  const fuente = ctx.createBufferSource()
  fuente.buffer = buffer
  fuente.loop = true
  return fuente
}
