// src/components/formia/ConstanciaPorIdentidad.jsx
// Una tarjeta por identidad: cuánto se ha demostrado, y con qué hábitos.
//
// RN-05 / RN-ID-05 — Una identidad con poco registro **no se presenta como un
// problema**. Sin colores de alarma, sin barras que se queden a medias, sin
// porcentajes y sin nada que diga cuánto falta. Lo que hay, se enseña; lo que
// no hay, no se nombra.
//
// RN-06 — Los números de aquí solo suben. Un hábito pausado sigue contando lo
// que hizo: si dejara de contar, pausar bajaría la cifra (RN-HB-02).

import { copy, interpolate } from '@copy'
import { capitalizar } from '@/formia/habitos'
import EvidenciaIdentidad from './EvidenciaIdentidad'

const textos = copy.formia.progreso.identidad
const nombresDeArea = copy.formia.identidad.areas.names
const totales = copy.formia.habitos.detalle

/**
 * "Lo has hecho 47 veces" — la frase de §5.7, siempre en positivo.
 *
 * Con cero devuelve `null` y la fila no dice nada. La identidad ya explica
 * arriba que todavía no hay marcas; repetirlo hábito por hábito convertiría un
 * estado tranquilo en una lista de ausencias.
 */
function textoTotal(total) {
  if (total === 0) return null
  if (total === 1) return totales.totalUna
  return interpolate(totales.totalTemplate, { n: total })
}

function textoDias(dias) {
  if (dias === 0) return textos.diasCero
  if (dias === 1) return textos.diasUno
  return interpolate(textos.diasTemplate, { n: dias })
}

export default function ConstanciaPorIdentidad({ identidad, central }) {
  const esArea = identidad.tipo === 'area'
  const nombre = esArea ? nombresDeArea[identidad.identityRef] : capitalizar(central ?? '')

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {identidad.color && (
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-inset ring-ink/10"
            style={{ backgroundColor: identidad.color }}
            aria-hidden="true"
          />
        )}
        <h2 className="text-base font-medium text-ink">{nombre}</h2>
        {/* Un área que ya no está elegida se nombra en neutro: sus datos siguen
            aquí y no hay nada que arreglar (RN-04, RN-ID-05). */}
        {esArea && !identidad.activa && (
          <span className="text-sm text-ink/80">{textos.inactiva}</span>
        )}
      </div>

      <p className="text-sm text-ink/80">{textoDias(identidad.dias)}</p>

      {identidad.evidencia && (
        <EvidenciaIdentidad
          evidencia={identidad.evidencia}
          identidad={central}
          area={esArea ? nombre : null}
        />
      )}

      <ul className="flex flex-col divide-y divide-border-subtle">
        {identidad.habitos.map((habito) => (
          <li key={habito.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <span className="text-base text-ink">
              {habito.emoji && <span aria-hidden="true">{habito.emoji} </span>}
              {habito.name}
            </span>
            {textoTotal(habito.total) && (
              <span className="text-sm text-ink/80">{textoTotal(habito.total)}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
