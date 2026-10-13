// src/components/diario/manana/AperturaDelDia.jsx
// El cierre de la mañana (§8), que es la apertura del día.
//
// Es hermano de `CierreDeLaNoche`, no una copia: aquel oscurece y despide, este
// aclara y suelta. Los dos comparten la forma —pantalla entera, un texto corto
// construido con lo que la persona escribió, un solo botón— porque es la forma
// que este producto le da a un momento que termina.
//
// **Sin puntuación, sin porcentajes y sin felicitación** (§8). Lo que se
// devuelve es la propia intención y el propio paso, con sus palabras. Si no hay
// ninguna de las dos, se cierra igual y se dice sin señalar el vacío: "Tu día
// puede comenzar desde donde estás." Omitirlo todo es una forma legítima de
// pasar por aquí.
//
// **Y desde el 12 de octubre de 2026 se despide** como lo hace la noche. Hasta
// entonces "Comenzar mi día" devolvía a la consulta sin más; ahora deja delante
// un buen deseo —"Que tengas un día sereno."— y debajo, en voz baja, "Puedes
// volver y cambiar lo que quieras." Se lee cinco segundos, se desvanece en
// medio segundo y vuelve a la consulta, que es donde llevaba el botón antes.
// Tocarla salta la espera —un toque es alguien diciendo que ya— y con "reducir
// movimiento" no hay desvanecido: a los cinco segundos, se vuelve. La frase la
// decide `diario/mananaDeseo.js`; aquí solo se pinta.
//
// **El buen deseo solo se dice con la mañana guardada.** La escritura la hace
// `DiarioManana` mientras esta pantalla ya está delante y llega aquí como
// `guardado`: mientras está de camino, la pantalla espera con la intención y
// sin botón; si falla, no se desea un buen día como si todo hubiera terminado,
// se dice qué pasó, que lo escrito sigue aquí, y se ofrece volver a
// intentarlo. Nada vibra y no hay rueda que gire (RN-EST-02, RN-EST-04).
//
// Las dos duraciones son las de la noche y no se importan de allí: la mañana no
// nombra la noche. El desvanecido es el mismo `.salida-cierre` de
// `globals.css`, y una prueba compara las tres cifras.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import { copy } from '@copy'
import { useBarraDeEstado } from '@lib/barraEstado'

const textos = copy.diario.manana.cierre
const error = copy.diario.error.save

/** Cuánto se lee el buen deseo antes de irse, en milisegundos. */
export const DESPEDIDA_VISIBLE = 5000
/** Cuánto tarda en desvanecerse. La misma cifra va en `.salida-cierre`. */
export const SALIDA = 500

export default function AperturaDelDia({
  lineas,
  deseo,
  guardado = 'listo',
  onReintentar,
  onTerminar,
}) {
  // Va encima de todo, cromo incluido: en la app de iPhone, la hora se lee
  // sobre el papel de la mañana mientras está montado (SPEC_21.1).
  useBarraDeEstado({ capa: 'pantalla', momento: 'manana' })
  const [despidiendo, setDespidiendo] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  // Terminar es una sola vez, venga del reloj o de un toque durante la
  // salida: la segunda llamada no encuentra nada que cerrar.
  const terminado = useRef(false)
  // El padre vuelve a pintar cuando el guardado responde y la forma de volver
  // puede cambiar de identidad; el reloj no se reinicia por eso.
  const alTerminar = useRef(onTerminar)
  alTerminar.current = onTerminar

  const terminar = () => {
    if (terminado.current) return
    terminado.current = true
    alTerminar.current?.()
  }

  useEffect(() => {
    if (!despidiendo || guardado !== 'listo') return undefined
    const sinMovimiento = prefiereMenosMovimiento()
    const relojes = [
      setTimeout(() => (sinMovimiento ? terminar() : setSaliendo(true)), DESPEDIDA_VISIBLE),
    ]
    if (!sinMovimiento) relojes.push(setTimeout(terminar, DESPEDIDA_VISIBLE + SALIDA))
    // Al desmontarse no queda ningún reloj que dispare sobre lo que ya no está.
    return () => relojes.forEach(clearTimeout)
  }, [despidiendo, guardado])

  return (
    <div
      data-surface="light"
      data-momento="manana"
      className={clsx(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-strivo-base px-8 text-center',
        saliendo && 'salida-cierre',
      )}
    >
      {/* El buen deseo es lo protagonista y "puedes volver" va debajo, más
          pequeño y en el tono secundario: es una puerta abierta, no un aviso. */}
      {despidiendo && guardado === 'listo' && (
        <button
          type="button"
          onClick={terminar}
          className="flex max-w-md flex-col items-center gap-3 rounded-md p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          <p
            className={clsx(
              'font-display text-xl text-on-surface leading-snug',
              'animate-fade-up motion-reduce:animate-none',
            )}
          >
            {deseo?.texto}
          </p>
          <p
            className={clsx(
              'text-sm text-on-surface-soft',
              'animate-fade-up motion-reduce:animate-none',
            )}
          >
            {textos.reabrir}
          </p>
        </button>
      )}

      {despidiendo && guardado === 'fallo' && (
        <div className="flex flex-col items-center gap-4" role="status">
          <p className="text-base text-on-surface">{error.body}</p>
          <Button variant="surface" onClick={onReintentar}>
            {error.retry}
          </Button>
        </div>
      )}

      {(!despidiendo || guardado === 'pendiente') && (
        <>
          {lineas.length === 0 ? (
            <p
              className={clsx(
                'font-display text-lg text-on-surface leading-snug',
                'animate-fade-up motion-reduce:animate-none',
              )}
              role="status"
            >
              {textos.vacio}
            </p>
          ) : (
            <div className="flex flex-col gap-3" role="status">
              {lineas.map((linea, indice) => (
                <p
                  key={linea}
                  className={clsx(
                    indice === 0
                      ? 'font-display text-lg text-on-surface leading-snug'
                      : 'text-base text-on-surface-soft',
                    'animate-fade-up motion-reduce:animate-none',
                  )}
                >
                  {linea}
                </p>
              ))}
            </div>
          )}

          {/* Un toque y el botón se va: no lleva `disabled` —nada bloquea— y
              quien evita el segundo toque es que ya no hay botón. */}
          {!despidiendo && (
            <Button variant="surface" onClick={() => setDespidiendo(true)}>
              {textos.cta}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
