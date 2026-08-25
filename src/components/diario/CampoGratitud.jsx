// src/components/diario/CampoGratitud.jsx
// Agradecimientos, con su sistema de sugerencias (§5.3, Bloque 2).
//
// **La app nunca escribe por ti.** Es la regla dura del bloque: tocar una idea
// no rellena el campo, abre una pregunta detonante. Lo que se escriba después
// lo escribe la persona.
//
// **Las ideas son de un renglón, no del bloque.** Aparecen bajo el renglón que
// tiene el foco, tras 5 s sin escribir en él y solo si está vacío (SPEC_06 §4.2,
// criterio 7 — §5.3 decía 6 s). La espera y la condición son de ese renglón:
// haber escrito en el primero no calla al segundo. Se van al primer carácter y
// al salir del campo. La regla entera vive en `@/diario/sugerenciasGratitud`.
//
// Si se descartan dos veces, no vuelven en toda la sesión — ese contador sí es
// del bloque, y de la sesión, no del renglón.

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import FilasDinamicas from './FilasDinamicas'
import { RETRASO_SUGERENCIAS, puedeOfrecer, textoEnfocado } from '@/diario/sugerenciasGratitud'

export default function CampoGratitud({
  filas,
  limites,
  onCambiar,
  onVolcar,
  sugerencias,
  etiqueta,
  placeholder,
  maxLength,
  textoAnadir,
  textoTope,
}) {
  // `null` es el estado de partida y el de después de salir: sin foco no hay
  // ideas en ningún renglón.
  const [enfocada, setEnfocada] = useState(null)
  const [visibles, setVisibles] = useState(false)
  const [pregunta, setPregunta] = useState(null)
  const [descartes, setDescartes] = useState(0)

  const texto = textoEnfocado(enfocada, filas)
  const ofrecible = puedeOfrecer(enfocada, filas, descartes)

  useEffect(() => {
    setVisibles(false)
    setPregunta(null)
    if (!ofrecible) return undefined
    const espera = setTimeout(() => setVisibles(true), RETRASO_SUGERENCIAS)
    return () => clearTimeout(espera)
    // `texto` en las dependencias es deliberado: cada tecla reinicia la espera,
    // y solo la del renglón enfocado. Escribir en el primero no toca la del
    // segundo porque este efecto no se entera de lo que pasa fuera del foco.
  }, [enfocada, texto, ofrecible])

  const descartar = () => {
    setDescartes((previos) => previos + 1)
    setVisibles(false)
    setPregunta(null)
  }

  // Al salir del campo se apagan las ideas, salvo que el foco se haya ido a
  // ellas: con teclado se llega tabulando, y desaparecer justo al alcanzarlas
  // las haría inalcanzables.
  const desenfocar = (indice, evento) => {
    if (evento?.relatedTarget?.closest?.('[data-sugerencias]')) return
    setEnfocada((actual) => (actual === indice ? null : actual))
  }

  // Las ideas se pintan bajo el renglón al que pertenecen, y solo bajo ese.
  const ideasDe = (indice) => {
    if (!visibles || enfocada !== indice) return null

    return (
      <div
        data-sugerencias
        className="flex flex-col gap-2 animate-fade-up motion-reduce:animate-none"
      >
        <p className="text-sm text-on-surface-soft">{pregunta ?? sugerencias.titulo}</p>
        <div className="flex flex-wrap items-center gap-2">
          {sugerencias.opciones.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              // El puntero no roba el foco: si lo robara, el renglón se
              // desenfocaría y las ideas se irían antes de recibir el toque.
              onMouseDown={(evento) => evento.preventDefault()}
              onClick={() => setPregunta(opcion.pregunta)}
              className={clsx(
                'rounded-full border border-on-surface px-4 py-2 min-h-touch-sm text-sm',
                'text-on-surface bg-lumia-campo',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
              )}
            >
              {opcion.label}
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(evento) => evento.preventDefault()}
            onClick={descartar}
            className={clsx(
              'rounded-full px-3 py-2 min-h-touch-sm text-sm',
              'text-on-surface-soft hover:text-on-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
            )}
          >
            {sugerencias.descartar}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <FilasDinamicas
        filas={filas}
        limites={limites}
        onCambiar={onCambiar}
        onVolcar={onVolcar}
        placeholder={placeholder}
        etiqueta={etiqueta}
        onEnfocar={setEnfocada}
        onDesenfocar={desenfocar}
        debajoDeFila={ideasDe}
        maxLength={maxLength}
        textoAnadir={textoAnadir}
        textoTope={textoTope}
      />
    </div>
  )
}
