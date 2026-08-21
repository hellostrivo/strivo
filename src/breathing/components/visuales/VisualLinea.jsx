// src/breathing/components/visuales/VisualLinea.jsx
// La bolita sobre la línea (SPEC_14 §4).
//
// Es la visual que enseña **lo que viene**. Un círculo que se expande dice
// "ahora inhala"; esto dice "ahora inhalas, y en cuatro segundos vas a
// sostener". Saber lo que sigue es lo que quita la ansiedad de no saber, y por
// eso la bolita va al 38 % del ancho: se ve más futuro que pasado.
//
// **La onda no se redibuja: se desplaza.** Su forma es periódica y no cambia
// entre frames, así que se muestrea una vez, se memoiza (RN-RE-VIS-31) y por
// frame se mueve un `transform` (RN-RE-VIS-32), que es lo único que el
// navegador puede componer en la GPU. Recalcular mil puntos por fotograma sería
// el error que hace que una animación de calma se sienta nerviosa.

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { copy } from '@copy'
import { fasesDelCiclo } from '@lib/respiracion/motorRitmo'
import { ESTADOS } from '@lib/respiracion/maquinaSesion'
import {
  VIEWBOX,
  generarOnda,
  generarOndaEstatica,
  msDeEstado,
  yDeAmplitud,
} from '@/breathing/lib/geometriaLinea'
import { crearPintorLinea } from '@/breathing/lib/pintorVisual'
import { segundosDe } from '@/breathing/lib/anuncios'
import EtiquetaFase from './EtiquetaFase'
import AnuncioAccesible from './AnuncioAccesible'

const SIN_RITMO = new Set([ESTADOS.INACTIVO, ESTADOS.ACOMODANDO])

/** §4.4 — La estela: tres círculos que decrecen hacia el pasado. */
const ESTELA = Object.freeze([
  { dx: -14, r: 5, opacidad: 0.12 },
  { dx: -28, r: 3, opacidad: 0.08 },
  { dx: -42, r: 2, opacidad: 0.04 },
])

const VisualLinea = forwardRef(function VisualLinea(
  { estado, patron, estadoSesion = ESTADOS.INACTIVO, movimientoReducido = false },
  ref,
) {
  const onda = useRef(null)
  const bolita = useRef(null)
  const marcador = useRef(null)

  const previa = SIN_RITMO.has(estadoSesion) || !estado
  const ms = previa ? 0 : msDeEstado(patron, estado)
  const msFase = fasesDelCiclo(patron).find((tramo) => tramo.fase === estado?.fase)?.ms ?? 0

  // §7 — Con movimiento reducido la onda se queda quieta y lo que avanza es un
  // marcador, a saltos de un segundo. No es la animación apagada: es la misma
  // información sin desplazamiento continuo, que es lo que la preferencia pide.
  const dibujo = movimientoReducido ? generarOndaEstatica(patron, ms) : generarOnda(patron, ms)

  const xBolita = movimientoReducido ? dibujo.marcador.x : dibujo.puntoBolita.x
  const yBolita = movimientoReducido
    ? dibujo.marcador.y
    : previa
      ? yDeAmplitud(0.5)
      : dibujo.puntoBolita.y

  // RN-RE-VIS-19 — La cuenta regresiva. Baja de segundo en segundo sobre el
  // nodo, sin pasar por React: un dígito no vale un render del árbol.
  const cuenta = useRef(null)
  const ultimaCuenta = useRef(null)

  const pintor = useRef(null)
  const clave = `${estado?.fase ?? 'previa'}:${movimientoReducido}`
  if (pintor.current?.clave !== clave) {
    pintor.current = { clave, motor: crearPintorLinea({ patron, movimientoReducido }) }
  }

  /** Ver el comentario gemelo de `VisualCirculo`: aquí tampoco hay `setState`. */
  function pintar(siguiente) {
    if (estadoSesion === ESTADOS.PAUSADO || SIN_RITMO.has(estadoSesion)) return false

    escribirCuenta(siguiente)

    const paso = pintor.current.motor.calcular(siguiente)
    if (paso === null) return false

    if (paso.reducido) {
      marcador.current?.setAttribute('transform', `translate(${paso.x} 0)`)
      bolita.current?.setAttribute('transform', `translate(${paso.x} ${paso.y})`)
      return true
    }

    onda.current?.setAttribute('transform', `translate(${paso.desplazamiento} 0)`)
    // RN-RE-VIS-09 — La Y sale de la amplitud del motor, nunca de leer el path.
    // Dos fuentes de verdad para la misma altura acaban separándose.
    bolita.current?.setAttribute('transform', `translate(0 ${paso.y})`)
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
    <div className="respiracion-visual" data-visual="linea" data-sesion={estadoSesion}>
      <svg
        className="respiracion-linea"
        viewBox={`0 0 ${VIEWBOX.ancho} ${VIEWBOX.alto}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <title>{copy.respiracion.titulo}</title>

        <defs>
          {/* RN-RE-VIS-11 — Los dos extremos se desvanecen. Una línea cortada en
              seco contra el borde se lee como un fallo de dibujo, no como una
              ventana de tiempo. */}
          <linearGradient id="respiracion-desvanecido" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopOpacity="0" />
            <stop offset="0.14" stopOpacity="1" />
            <stop offset="0.86" stopOpacity="1" />
            <stop offset="1" stopOpacity="0.25" />
          </linearGradient>
          <mask id="respiracion-mascara">
            <rect
              x="0"
              y="0"
              width={VIEWBOX.ancho}
              height={VIEWBOX.alto}
              fill="url(#respiracion-desvanecido)"
            />
          </mask>
        </defs>

        <g aria-hidden="true" mask="url(#respiracion-mascara)">
          <g
            ref={onda}
            transform={`translate(${movimientoReducido ? 0 : dibujo.desplazamiento} 0)`}
          >
            <path className="respiracion-linea__onda" d={dibujo.d} />
            {dibujo.marcasFase.map((marca) => (
              <g key={`${marca.fase}-${marca.ms}`} transform={`translate(${marca.x} 0)`}>
                <line className="respiracion-linea__marca" x1="0" x2="0" y1="0" y2={VIEWBOX.alto} />
                {/* RN-RE-VIS-14/15 — Solo el futuro lleva texto, y solo si el
                    ciclo da aire suficiente para que no se apiñen. */}
                {marca.futura && dibujo.etiquetasVisibles ? (
                  <text className="respiracion-linea__marca-texto" x="4" y={VIEWBOX.alto - 8}>
                    {copy.respiracion.fases[marca.fase]}
                  </text>
                ) : null}
              </g>
            ))}
          </g>

          {movimientoReducido ? (
            <g ref={marcador} transform={`translate(${dibujo.marcador.x} 0)`}>
              <line
                className="respiracion-linea__marcador"
                x1="0"
                x2="0"
                y1="0"
                y2={VIEWBOX.alto}
              />
            </g>
          ) : null}
        </g>

        <g
          aria-hidden="true"
          ref={bolita}
          transform={`translate(${movimientoReducido ? xBolita : 0} ${yBolita})`}
        >
          {/* RN-RE-VIS-12 — La estela desaparece entera con movimiento reducido.
              Es puro adorno de velocidad y no lleva información. */}
          {movimientoReducido
            ? null
            : ESTELA.map((paso) => (
                <circle
                  key={paso.dx}
                  className="respiracion-linea__estela"
                  cx={xBolita + paso.dx}
                  cy="0"
                  r={paso.r}
                  opacity={paso.opacidad}
                />
              ))}
          <circle
            className="respiracion-linea__halo"
            cx={movimientoReducido ? 0 : xBolita}
            cy="0"
            r="14"
            data-fase={estado?.fase ?? 'retenerVacio'}
          />
          <circle
            className="respiracion-linea__bolita"
            cx={movimientoReducido ? 0 : xBolita}
            cy="0"
            r="7"
            data-fase={estado?.fase ?? 'retenerVacio'}
          />
        </g>
      </svg>

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

export default VisualLinea
