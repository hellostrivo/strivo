// src/breathing/components/visuales/VisualCirculo.jsx
// El círculo que respira (SPEC_14 §3).
//
// **No es el círculo de Lumia.** Aquel es de SPEC_08, conserva su naranja de
// amanecer y no se toca (§1.2). Este nace aquí, es independiente, y viste los
// neutros de Strivo madre: la forma dice "esto es respirar" y el color dice
// "esto es Strivo, no Lumia". Que se parezcan en lo primero y no en lo segundo
// es intencional.
//
// **Lo que este componente NO hace**, y es la mitad de su diseño:
//   · No calcula amplitud, ni fase, ni tiempo (RN-RE-VIS-02). Los recibe.
//   · No tiene un solo temporizador. El reloj vive en el motor, y uno solo.
//   · No llama a `setState` por frame (RN-RE-VIS-33). Quien lo monta le pasa el
//     estado por `pintar()` sesenta veces por segundo y React no se entera;
//     React vuelve a pintar cuando cambia la fase, que son nueve veces en un
//     ejercicio de cuarenta segundos y no dos mil cuatrocientas.
//
// Esa última es la regla que decide si esto se siente suave o a trompicones.

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { copy } from '@copy'
import { fasesDelCiclo } from '@lib/respiracion/motorRitmo'
import { ESTADOS } from '@lib/respiracion/maquinaSesion'
import {
  CENTRO,
  OPACIDAD_HALO_QUIETA,
  RADIO_BASE,
  VIEWBOX,
  calcularArco,
  calcularRadios,
} from '@/breathing/lib/geometriaCirculo'
import { crearPintorCirculo } from '@/breathing/lib/pintorVisual'
import { segundosDe } from '@/breathing/lib/anuncios'
import EtiquetaFase from './EtiquetaFase'
import AnuncioAccesible from './AnuncioAccesible'

/** §9 — La vista previa: ni lleno ni vacío, quieto. */
const AMPLITUD_PREVIA = 0.5

const SIN_RITMO = new Set([ESTADOS.INACTIVO, ESTADOS.ACOMODANDO])

const VisualCirculo = forwardRef(function VisualCirculo(
  { estado, patron, estadoSesion = ESTADOS.INACTIVO, movimientoReducido = false },
  ref,
) {
  const disco = useRef(null)
  const halo = useRef(null)
  const arco = useRef(null)

  const previa = SIN_RITMO.has(estadoSesion) || !estado
  const amplitud = previa ? AMPLITUD_PREVIA : estado.amplitud
  const radios = calcularRadios(amplitud, RADIO_BASE)
  const trazo = calcularArco(previa ? 0 : estado.progresoFase, RADIO_BASE)
  const msFase = fasesDelCiclo(patron).find((tramo) => tramo.fase === estado?.fase)?.ms ?? 0

  // Un pintor por fase: al cambiar de fase React repinta, y con el repintado
  // llega uno nuevo que parte de cero. Es lo que reinicia el arco sin que nadie
  // tenga que acordarse de reiniciarlo (RN-RE-VIS-06).
  // RN-RE-VIS-19 — La cuenta regresiva. Baja de segundo en segundo sobre el
  // nodo, sin pasar por React: un dígito no vale un render del árbol.
  const cuenta = useRef(null)
  const ultimaCuenta = useRef(null)

  const pintor = useRef(null)
  const clave = `${estado?.fase ?? 'previa'}:${movimientoReducido}:${msFase}`
  if (pintor.current?.clave !== clave) {
    pintor.current = { clave, motor: crearPintorCirculo({ movimientoReducido, msFase }) }
  }

  /**
   * El único camino por el que el dibujo se mueve entre cambios de fase.
   *
   * Se escribe sobre el nodo, no sobre el estado de React. Devuelve si llegó a
   * tocar algo, que es lo que las pruebas cuentan para comprobar que con
   * movimiento reducido no hay sesenta escrituras por segundo.
   */
  function pintar(siguiente) {
    // Congelado en el punto exacto: durante la pausa y la vista previa no se
    // escribe nada, así que dos frames separados un segundo son idénticos.
    if (estadoSesion === ESTADOS.PAUSADO || SIN_RITMO.has(estadoSesion)) return false

    escribirCuenta(siguiente)

    const paso = pintor.current.motor.calcular(siguiente)
    if (paso === null) return false

    disco.current?.setAttribute('r', String(paso.radioDisco))
    halo.current?.setAttribute('r', String(paso.radioHalo))
    halo.current?.setAttribute('opacity', String(paso.opacidadHalo))
    arco.current?.setAttribute('stroke-dashoffset', String(paso.desfase))
    return true
  }

  /** Solo toca el DOM cuando el dígito cambia de verdad: una vez por segundo. */
  function escribirCuenta(siguiente) {
    if (!cuenta.current || !siguiente) return
    const segundos = segundosDe(siguiente.msRestantesFase)
    if (segundos === ultimaCuenta.current) return
    ultimaCuenta.current = segundos
    cuenta.current.textContent = String(segundos)
  }

  useImperativeHandle(ref, () => ({ pintar }))

  return (
    <div className="respiracion-visual" data-visual="circulo" data-sesion={estadoSesion}>
      <svg
        className="respiracion-circulo"
        viewBox={`0 0 ${VIEWBOX.ancho} ${VIEWBOX.alto}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <title>{copy.respiracion.titulo}</title>

        {/* RN-RE-VIS-25 — Todo lo de dentro es dibujo. Lo que hay que saber lo
            dice el anuncio de abajo, así que repetirlo aquí sería leerlo dos
            veces. */}
        <g aria-hidden="true">
          <circle
            ref={halo}
            className="respiracion-circulo__halo"
            cx={CENTRO}
            cy={CENTRO}
            r={radios.radioHalo}
            opacity={movimientoReducido ? OPACIDAD_HALO_QUIETA : radios.opacidadHalo}
          />
          <circle className="respiracion-circulo__anillo" cx={CENTRO} cy={CENTRO} r={RADIO_BASE} />
          <path
            ref={arco}
            className="respiracion-circulo__arco"
            d={trazo.d}
            strokeDasharray={trazo.longitudTotal}
            strokeDashoffset={trazo.desfase}
            data-fase={estado?.fase ?? 'retenerVacio'}
          />
          <circle
            ref={disco}
            className="respiracion-circulo__disco"
            cx={CENTRO}
            cy={CENTRO}
            r={radios.radioDisco}
            data-fase={estado?.fase ?? 'retenerVacio'}
          />
        </g>
      </svg>

      {/* §9 — En la vista previa no hay fase que nombrar: todavía no se respira. */}
      {previa ? null : (
        <EtiquetaFase
          fase={estado.fase}
          msRestantes={estado.msRestantesFase}
          msFase={msFase}
          movimientoReducido={movimientoReducido}
          refCuenta={cuenta}
        />
      )}

      {estadoSesion === ESTADOS.PAUSADO ? (
        <span className="respiracion-pausa" aria-hidden="true" />
      ) : null}

      <AnuncioAccesible fase={estado?.fase} msFase={msFase} estadoSesion={estadoSesion} />
    </div>
  )
})

export default VisualCirculo
