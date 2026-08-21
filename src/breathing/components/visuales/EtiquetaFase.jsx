// src/breathing/components/visuales/EtiquetaFase.jsx
// El nombre de la fase, en texto (SPEC_14 §6).
//
// **Es el componente que hace daltónica a la visual** (RN-RE-VIS-17). La fase
// nunca se comunica solo por color: aquí está la palabra, y la geometría —el
// tamaño del disco, la altura de la onda— lleva el resto. Es donde la
// referencia externa falla, y aquí no cuesta nada hacerlo bien. En esta app la
// regla además carga peso de verdad: las cuatro fases se distinguen por
// luminancia sobre una escala acromática y entre vecinas hay 1,4:1, así que sin
// esta palabra la fase sencillamente no se podría nombrar.
//
// Debajo va la cuenta regresiva. Con una retención de siete segundos, un dibujo
// quieto sin número deja la sensación de estar perdido; el número convierte la
// espera en algo que se está atravesando (RN-RE-VIS-19).
//
// **La cuenta baja por `ref`, no por estado.** Es lo único de la etiqueta que
// cambia dentro de una fase, y hacerla pasar por React obligaría a re-renderizar
// el árbol una vez por segundo para mover un dígito. El número lo escribe
// `pintar()` sobre este nodo, igual que el radio del disco.

import { copy } from '@copy'
import { segundosDe } from '@/breathing/lib/anuncios'

/**
 * §6 — Por debajo de dos segundos la cuenta parpadearía: se muestra 2, luego 1
 * y se va. Más ruido que información, así que en fases cortas no aparece.
 */
export const MS_MINIMO_CUENTA = 2000

/**
 * @param {string} fase
 * @param {number} msRestantes - Solo para el primer dígito; luego manda `refCuenta`.
 * @param {number} msFase - Lo que dura la fase entera, para decidir la cuenta.
 * @param {boolean} [movimientoReducido] - RN-RE-VIS-18: sin cruce, cambio seco.
 * @param {object} [refCuenta] - El nodo del dígito, para escribirlo sin renderizar.
 */
export default function EtiquetaFase({
  fase,
  msRestantes,
  msFase,
  movimientoReducido = false,
  refCuenta,
}) {
  const nombre = copy.respiracion.fases[fase]
  if (!nombre) return null

  const conCuenta = Number(msFase) >= MS_MINIMO_CUENTA

  return (
    <div
      className="respiracion-etiqueta"
      data-fase={fase}
      data-reducido={movimientoReducido ? 'si' : 'no'}
    >
      <span className="respiracion-etiqueta__nombre">{nombre}</span>
      {conCuenta ? (
        <span ref={refCuenta} className="respiracion-etiqueta__cuenta">
          {segundosDe(msRestantes)}
        </span>
      ) : null}
    </div>
  )
}
