// src/breathing/audio/mezclador.js
// Las ganancias, los fundidos y el agachado del ambiente (SPEC_15 §3.4).
//
// Grafo:
//     fuenteAmbiente → ganAmbiente ─┐
//                                   ├→ ganMaestra → destination
//     guíaSonora     → ganGuia    ──┘
//
// **Aquí no se asigna nunca `.value` a una ganancia** (RN-RE-SND-08). Un salto
// instantáneo de volumen produce un chasquido audible, y en una app cuyo trabajo
// es bajarle las pulsaciones a alguien, un chasquido es un fallo de producto y
// no un detalle técnico. Todo pasa por una rampa.
//
// **Las decisiones son funciones puras** (RN-RE-SND-30): qué ganancia, con qué
// rampa y desde cuándo se calcula sin tocar Web Audio, para poder probarlo en un
// entorno que no tiene audio. Las llamadas a la API van aparte y son triviales.

/** §3.4 — Los tiempos, en segundos. Los números son del spec, literales. */
export const FUNDIDOS = Object.freeze({
  entrada: 2.0, // RN-RE-SND-09 — entra durante el acomodo
  salidaCompletado: 3.0, // RN-RE-SND-10
  salidaTerminar: 0.8, // RN-RE-SND-11 — más rápido: la persona decidió irse
  pausa: 0.5, // RN-RE-SND-12
  cruce: 1.2, // RN-RE-SND-14
  volumen: 0.12, // RN-RE-SND-17
  reanudarContexto: 0.4, // RN-RE-SND-24
  vistaPrevia: 0.8, // RN-RE-SND-27
})

/** RN-RE-SND-12 — Al pausar, el ambiente baja al 30 %. **No se detiene.** */
export const FACTOR_PAUSA = 0.3

/** §3.5 — Los volúmenes de fábrica y su paso. */
export const VOLUMEN = Object.freeze({
  ambientePorDefecto: 0.6,
  guiaPorDefecto: 0.5,
  paso: 0.05,
  min: 0,
  max: 1,
})

/** Una ganancia nunca llega a cero exacto en una rampa exponencial. */
const CASI_CERO = 0.0001

// ─── Decisiones puras ─────────────────────────────────────────────────────────

/** Recorta un volumen a 0..1 y lo cuadra al paso del 5 %. */
export function normalizarVolumen(bruto) {
  const n = Number(bruto)
  if (!Number.isFinite(n)) return VOLUMEN.ambientePorDefecto
  const recortado = Math.min(VOLUMEN.max, Math.max(VOLUMEN.min, n))
  return Math.round(recortado / VOLUMEN.paso) * VOLUMEN.paso
}

/**
 * La ganancia que le toca al ambiente en un estado dado.
 *
 * RN-RE-SND-12 — En pausa baja al 30 %, no a cero. Cortar el fondo en seco
 * sobresalta, que es justo lo contrario del propósito del ejercicio; y el
 * silencio repentino además llama más la atención que el sonido.
 */
export function gananciaAmbiente(volumen, estadoSesion) {
  const base = normalizarVolumen(volumen)
  return estadoSesion === 'pausado' ? base * FACTOR_PAUSA : base
}

/**
 * La ganancia de la guía sonora.
 *
 * RN-RE-SND-13 — En pausa se calla **del todo**, y la diferencia con el
 * ambiente es deliberada: la guía es un marcador de ritmo, y sin ritmo que
 * marcar no tiene nada que decir. El ambiente es paisaje y el paisaje sigue ahí.
 */
export function gananciaGuia(volumen, estadoSesion, activa) {
  if (!activa) return 0
  return estadoSesion === 'pausado' ? 0 : normalizarVolumen(volumen)
}

/** Cuánto dura el fundido de salida según por qué se acaba. */
export function duracionSalida(motivo) {
  return motivo === 'terminar' ? FUNDIDOS.salidaTerminar : FUNDIDOS.salidaCompletado
}

/**
 * Las dos rampas de un cruce entre sonidos (RN-RE-SND-14).
 *
 * Se solapan a propósito: el que entra empieza a subir en el mismo instante en
 * que el que sale empieza a bajar, así que **en ningún momento del cruce la suma
 * es cero**. Un hueco de silencio en mitad de un cambio de sonido se lee como un
 * fallo, no como una transición.
 */
export function planDeCruce(instante, volumen, duracion = FUNDIDOS.cruce) {
  const destino = normalizarVolumen(volumen)
  return {
    sale: { desde: instante, hasta: instante + duracion, valor: 0 },
    entra: { desde: instante, hasta: instante + duracion, valor: destino },
  }
}

/** La suma de las dos ganancias de un cruce en un instante intermedio. */
export function sumaEnCruce(plan, t, volumen) {
  const destino = normalizarVolumen(volumen)
  const total = plan.sale.hasta - plan.sale.desde
  if (total <= 0) return destino
  const avance = Math.min(1, Math.max(0, (t - plan.sale.desde) / total))
  // Igual potencia, como el bucle del ruido: con rampas lineales la suma cae en
  // el centro del cruce y se oye un bache de volumen.
  const entra = Math.sin((avance * Math.PI) / 2)
  const sale = Math.cos((avance * Math.PI) / 2)
  return destino * (entra + sale)
}

// ─── El grafo ─────────────────────────────────────────────────────────────────

/**
 * Aplica una rampa a un parámetro de ganancia.
 *
 * **Nunca `parametro.value = x`.** Se cancela lo programado, se ancla el valor
 * que suena ahora mismo y se rampa desde ahí: así un cambio a mitad de otro
 * fundido no da un salto.
 */
export function rampa(parametro, valor, instante, duracion) {
  parametro.cancelScheduledValues(instante)
  parametro.setValueAtTime(parametro.value, instante)
  if (duracion <= 0) {
    parametro.linearRampToValueAtTime(valor, instante + 0.01)
    return
  }
  parametro.linearRampToValueAtTime(Math.max(CASI_CERO, valor), instante + duracion)
}

/**
 * Monta el mezclador sobre un contexto.
 *
 * RN-RE-SND-15 — `ganMaestra` se queda en 1 y no se toca: el volumen del
 * sistema es de quien tiene el teléfono, y una app que lo pelea es una app que
 * se desinstala.
 */
export function crearMezclador(ctx, { destino = ctx.destination } = {}) {
  const maestra = ctx.createGain()
  maestra.gain.setValueAtTime(1, ctx.currentTime)

  const ambiente = ctx.createGain()
  ambiente.gain.setValueAtTime(0, ctx.currentTime)

  const guia = ctx.createGain()
  guia.gain.setValueAtTime(0, ctx.currentTime)

  ambiente.connect(maestra)
  guia.connect(maestra)
  maestra.connect(destino)

  return {
    entradaAmbiente: ambiente,
    entradaGuia: guia,
    maestra,

    /** RN-RE-SND-09 — Entra durante el acomodo, para estar ya presente al inhalar. */
    entrar(volumen, duracion = FUNDIDOS.entrada) {
      rampa(ambiente.gain, normalizarVolumen(volumen), ctx.currentTime, duracion)
    },

    salir(motivo) {
      const duracion = duracionSalida(motivo)
      rampa(ambiente.gain, 0, ctx.currentTime, duracion)
      rampa(guia.gain, 0, ctx.currentTime, duracion)
      return duracion
    },

    /** RN-RE-SND-12/13 — El ambiente se agacha; la guía se calla. */
    aplicarEstado({ estadoSesion, volumenAmbiente, volumenGuia, guiaActiva }) {
      const ahora = ctx.currentTime
      rampa(ambiente.gain, gananciaAmbiente(volumenAmbiente, estadoSesion), ahora, FUNDIDOS.pausa)
      rampa(guia.gain, gananciaGuia(volumenGuia, estadoSesion, guiaActiva), ahora, FUNDIDOS.pausa)
    },

    /** RN-RE-SND-17 — Mover el control es una rampa corta, no un salto. */
    ajustarVolumenAmbiente(volumen, estadoSesion) {
      rampa(
        ambiente.gain,
        gananciaAmbiente(volumen, estadoSesion),
        ctx.currentTime,
        FUNDIDOS.volumen,
      )
    },

    ajustarVolumenGuia(volumen, estadoSesion, activa) {
      rampa(
        guia.gain,
        gananciaGuia(volumen, estadoSesion, activa),
        ctx.currentTime,
        FUNDIDOS.volumen,
      )
    },

    /** RN-RE-SND-24 — Al volver el foco, el volumen se restablece con rampa. */
    restablecer(volumen, estadoSesion) {
      rampa(
        ambiente.gain,
        gananciaAmbiente(volumen, estadoSesion),
        ctx.currentTime,
        FUNDIDOS.reanudarContexto,
      )
    },

    liberar() {
      ;[ambiente, guia, maestra].forEach((nodo) => nodo.disconnect?.())
    },
  }
}
