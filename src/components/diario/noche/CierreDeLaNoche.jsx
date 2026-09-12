// src/components/diario/noche/CierreDeLaNoche.jsx
// La ceremonia que cierra el día (§10). Sustituye a `CierreDelDia`.
//
// Es el momento más importante del producto y sigue siendo el mismo gesto: la
// pantalla se oscurece, se dice una frase corta y hay un solo botón. **Nunca
// falla**: sin nada escrito se cierra igual, y sin nada escrito no se señala el
// vacío (no-negociable 3).
//
// Lo que cambia con esta actualización es **lo que dice**. Antes contaba: "Hoy
// encontraste 2 cosas que agradecer". §10 prohíbe los recuentos, y con razón:
// un número al final del día es una nota. Ahora las dos líneas son fijas —"Tu
// día puede terminar aquí." y "Lo que viviste hoy no necesita quedar resuelto
// esta noche."— y lo único que varía es la segunda cuando se dejó algo escrito
// en la descarga: "Por ahora, puedes dejarlo aquí."
//
// Si hay algo reconocido, se devuelve **uno** —no todos— bajo su encabezado. Es
// una de sus frases, con sus palabras, y no un resumen del día.
//
// **Se fue también el punto de luz cálida**, y no es un descuido: era una
// celebración condicionada al estado con el que se cerraba, es decir una nota
// emocional del día. §10 la prohíbe expresamente, y con ella se fue el cierre
// compasivo —"Hoy pesó"—, que interpretaba lo que alguien acababa de nombrar.
//
// Sobrevive la despedida, que no celebra nada: "Buenas noches." y la puerta
// abierta para volver.
//
// **Y la despedida se va sola** (12 sep 2026). Hasta ahora se quedaba en
// pantalla hasta que alguien la tocaba, y era un botón sin aspecto de botón:
// quien no lo adivinaba se quedaba mirando "Buenas noches." sin saber que la
// app estaba esperándole a él. Ahora se lee cinco segundos, se desvanece en
// medio segundo y devuelve a Hoy con la noche ya escrita debajo. Tocarla sigue
// saltando la espera —un toque es alguien diciendo que ya— y con "reducir
// movimiento" no hay desvanecido: a los cinco segundos, se vuelve.
//
// **La despedida solo se dice cuando la noche está guardada.** La escritura la
// hace `DiarioNoche` mientras esta pantalla ya está delante —el toque en
// "Listo" responde en el acto y no espera a la base de datos— y llega aquí
// como `guardado`: mientras está de camino, la ceremonia espera con su frase
// y sin botón; si falla, no se dice "Buenas noches" como si todo hubiera
// terminado, se dice qué pasó, que lo escrito sigue aquí, y se ofrece volver a
// intentarlo. Nada vibra y no hay rueda que gire (RN-EST-02, RN-EST-04).
//
// Las dos duraciones viven aquí y la curva del desvanecido en `globals.css`
// (`salida-cierre`); hay una prueba que compara las dos.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import { copy } from '@copy'

const textos = copy.diario.noche.cierre
const error = copy.diario.error.save

/** Cuánto se lee "Buenas noches." antes de irse, en milisegundos. */
export const DESPEDIDA_VISIBLE = 5000
/** Cuánto tarda en desvanecerse. La misma cifra va en `.salida-cierre`. */
export const SALIDA = 500

export default function CierreDeLaNoche({
  reconocido,
  conDescarga,
  guardado = 'listo',
  onReintentar,
  onTerminar,
}) {
  const [despidiendo, setDespidiendo] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  // Terminar es una sola vez, venga del reloj o de un toque durante la
  // salida: la segunda llamada no encuentra nada que cerrar.
  const terminado = useRef(false)
  // La forma de volver puede cambiar de identidad en cada pintado del padre
  // —que vuelve a pintar cuando el guardado responde—, y el reloj no puede
  // reiniciarse por eso: lee la última por la referencia y no por el cierre.
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
    // Al desmontarse —porque se volvió, o porque se cambió de pantalla— no
    // queda ningún reloj que dispare sobre lo que ya no está.
    return () => relojes.forEach(clearTimeout)
  }, [despidiendo, guardado])

  return (
    <div
      data-surface="dark"
      data-momento="noche"
      className={clsx(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-night px-8 text-center',
        saliendo && 'salida-cierre',
      )}
    >
      {despidiendo && guardado === 'listo' && (
        <button
          type="button"
          onClick={terminar}
          className="flex flex-col items-center gap-3 rounded-md p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          <p className="font-display text-lg text-on-surface">{textos.despedida}</p>
          <p className="text-sm text-on-surface-soft">{textos.reabrir}</p>
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
          <div className="flex flex-col gap-3" role="status">
            <p
              className={clsx(
                'font-display text-lg text-on-surface leading-snug',
                'animate-fade-up motion-reduce:animate-none',
              )}
            >
              {textos.titulo}
            </p>
            <p
              className={clsx(
                'text-base text-on-surface-soft',
                'animate-fade-up motion-reduce:animate-none',
              )}
            >
              {conDescarga ? textos.leadDescarga : textos.lead}
            </p>
          </div>

          {/* Una sola de las cosas reconocidas. La pantalla final es un
              descanso, no un repaso. */}
          {reconocido && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-on-surface-soft">{textos.reconocidoTitulo}</p>
              <p className="text-base text-on-surface whitespace-pre-wrap">{reconocido}</p>
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
