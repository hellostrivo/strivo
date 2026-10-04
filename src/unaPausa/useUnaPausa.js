// src/unaPausa/useUnaPausa.js
// Qué ve la persona al abrir Una pausa (SPEC_28.3 §4.4).
//
// Tres piezas, de la más pura a la que toca React:
//
// - `estadoDeLaSeccion` es **la regla**: con lo que hay en caché, lo que dijo
//   la lectura y si hay red, qué estado se pinta. Una tabla, probada fila a
//   fila.
// - `cargarSeccion` es **el recorrido**: enseña la caché enseguida si la hay,
//   lee el canal detrás, guarda lo bueno. Recibe sus piezas por parámetro para
//   poder probarlo con todo fallando, y **nunca rechaza**.
// - `useUnaPausa` lo conecta a React, y además gestiona la portada guardada.
//
// **Nada de esto se ve fuera de Una pausa.** El canal solo se pide cuando la
// sección se monta: con el canal caído, ninguna otra pantalla se entera.

import { useCallback, useEffect, useState } from 'react'
import { leerCanal, traerPortada } from './canal/leer.js'
import {
  guardarCanal,
  guardarPortada,
  leerCanalGuardado,
  leerPortadaGuardada,
} from './canal/cache.js'

export const ESTADOS_DE_LA_SECCION = Object.freeze(['cargando', 'listo', 'vacio', 'error'])

const CARGANDO = Object.freeze({ estado: 'cargando' })
const VACIO = Object.freeze({ estado: 'vacio' })
const ERROR = Object.freeze({ estado: 'error' })
const listo = (canal) => ({ estado: 'listo', canal })

/**
 * La regla de la sección.
 *
 * | caché | lectura          | resultado                               |
 * |-------|------------------|-----------------------------------------|
 * | no    | en curso         | `cargando` (la forma final, vacía)       |
 * | sí    | en curso         | `listo` con la caché, enseguida          |
 * | —     | válida           | `listo` con lo leído                     |
 * | —     | válida, sin vigente | `vacio`                               |
 * | sí    | falla            | `listo` con la caché, **sin aviso**      |
 * | no    | falla, sin red   | `vacio`                                  |
 * | no    | falla, con red   | `error`, con reintento                   |
 *
 * Una caché sin vigente cuenta como caché vacía: enseña `cargando` mientras se
 * lee y `vacio` si la lectura falla. Un error de red no es un error visible
 * mientras haya algo que leer (RN-EST-05).
 *
 * @param {{ cache: object|null, lectura: null | {ok: boolean, canal?: object}, enLinea: boolean }} entrada
 *   `lectura` es `null` mientras está en curso.
 */
export function estadoDeLaSeccion({ cache, lectura, enLinea }) {
  if (lectura?.ok) return lectura.canal?.vigente ? listo(lectura.canal) : VACIO
  const conVigente = cache?.vigente ? cache : null
  if (lectura == null) return conVigente ? listo(conVigente) : CARGANDO
  if (conVigente) return listo(conVigente)
  if (cache || enLinea === false) return VACIO
  return ERROR
}

/** ¿Hay red? Sin `navigator`, se supone que sí: lo que decide es la lectura. */
export function hayRed() {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

/**
 * El recorrido de la sección. Avisa por `alCambiar` cada vez que el estado
 * cambia y devuelve el último. **Nunca rechaza**: una pieza que lanza cuenta
 * como una que no tiene nada.
 *
 * El canal leído se enseña antes de guardarlo: guardar es para la próxima vez.
 */
export async function cargarSeccion({
  leerGuardado = leerCanalGuardado,
  leer = () => leerCanal(),
  guardar = guardarCanal,
  enLinea = hayRed,
  alCambiar = () => {},
} = {}) {
  const red = () => {
    try {
      return enLinea()
    } catch {
      return true
    }
  }

  let cache = null
  try {
    cache = (await leerGuardado()) ?? null
  } catch {
    cache = null
  }
  alCambiar(estadoDeLaSeccion({ cache, lectura: null, enLinea: red() }))

  let lectura
  try {
    lectura = (await leer()) ?? { ok: false, motivo: 'red' }
  } catch {
    lectura = { ok: false, motivo: 'red' }
  }

  const final = estadoDeLaSeccion({ cache, lectura, enLinea: red() })
  alCambiar(final)
  if (lectura.ok) {
    try {
      await guardar(lectura.canal)
    } catch {
      // Sin caché la próxima vez se lee de la red, como esta.
    }
  }
  return final
}

/**
 * La portada guardada, convertida en una URL que el `<img>` puede pintar.
 *
 * **Cada URL se libera** al poner otra y al soltar (desmontar o cambiar de
 * portada): un `objectURL` sin liberar retiene el blob en memoria mientras la
 * página siga abierta. `crear` y `liberar` llegan por parámetro para poder
 * comprobarlo sin navegador.
 */
export function crearPortadaLocal({
  crear = (blob) => URL.createObjectURL(blob),
  liberar = (url) => URL.revokeObjectURL(url),
} = {}) {
  let actual = null
  return {
    poner(blob) {
      if (actual !== null) liberar(actual)
      actual = crear(blob)
      return actual
    },
    soltar() {
      if (actual !== null) liberar(actual)
      actual = null
    },
  }
}

/**
 * El estado de la sección, para React.
 *
 * @returns {{ estado: string, canal?: object, reintentar: Function, srcDePortada: Function }}
 */
export function useUnaPausa() {
  const [seccion, setSeccion] = useState(CARGANDO)
  const [vuelta, setVuelta] = useState(0)

  useEffect(() => {
    let vivo = true
    cargarSeccion({ alCambiar: (estado) => vivo && setSeccion(estado) })
    return () => {
      vivo = false
    }
  }, [vuelta])

  const reintentar = useCallback(() => {
    setSeccion(CARGANDO)
    setVuelta((n) => n + 1)
  }, [])

  // La portada de la vigente: si está guardada se pinta desde la caché, que es
  // lo que permite verla en modo avión; si no, se pinta desde la red y se
  // guarda para la próxima vez.
  const src = seccion.canal?.vigente?.portada?.src ?? null
  const [local, setLocal] = useState(null)

  useEffect(() => {
    if (src === null) return undefined
    const portada = crearPortadaLocal()
    let vivo = true
    ;(async () => {
      const guardada = await leerPortadaGuardada(src)
      if (!vivo) return
      if (guardada) {
        setLocal({ src, url: portada.poner(guardada) })
        return
      }
      const blob = await traerPortada(src)
      if (vivo && blob) await guardarPortada(src, blob)
    })()
    return () => {
      vivo = false
      portada.soltar()
      // La URL ya no vale: que nadie la pinte si la misma portada vuelve.
      setLocal((actual) => (actual?.src === src ? null : actual))
    }
  }, [src])

  const srcDePortada = useCallback(
    (entrada) => {
      const original = entrada?.portada?.src ?? null
      return local !== null && local.src === original ? local.url : original
    },
    [local],
  )

  return { ...seccion, reintentar, srcDePortada }
}
