// src/components/perfil/TusFrases.jsx
// Personaliza tus frases — el bloque de Tu perfil para las referencias de las
// frases del día (SPEC_28 §6).
//
// **Es una invitación, no un aviso.** Quien ya terminó el onboarding antes de
// que existieran estas preguntas no ve nada al abrir la app: encuentra este
// bloque aquí cuando venga, y si no viene, sus frases siguen siendo las de
// quien todavía no decidió —sin referencias religiosas, espirituales ni
// filosóficas—.
//
// **Tres vistas dentro del bloque y ninguna ruta nueva**, como Tu cuenta:
//
//   · el resumen: qué hay elegido, dicho con palabras, y la nota de para qué
//     se usa;
//   · editar: las dos preguntas del onboarding, **las mismas piezas y los
//     mismos textos** (`components/shared/PreguntasReferencias`). Se guarda al
//     tocar, como todo en Tu perfil, y «Listo» vuelve al resumen;
//   · fuentes: el criterio editorial y la atribución de las citas aprobadas.
//     Es estática y no lleva a ningún sitio.
//
// **Borrar la elección pide confirmación**, aunque no destruya nada escrito:
// lo pide el encargo y es de las pocas cosas de la app que no tienen
// deshacer a la vista. La confirmación es la misma de Tu cuenta.
//
// La preferencia vive solo en este dispositivo (`src/referencias/almacen.js`).

import { useCallback, useEffect, useState } from 'react'
import Button from '@components/ui/Button'
import Confirmacion from '@components/shared/Confirmacion'
import { PreguntaAfinidades, PreguntaModo } from '@components/shared/PreguntasReferencias'
import { copy, interpolate } from '@copy'
import { citasAprobadas } from '@/content/frases-v2'
import {
  guardarPreferencias,
  hayEleccion,
  leerPreferencias,
  restablecerPreferencias,
} from '@/referencias/almacen'
import { alternarAfinidad, alternarModo } from '@/referencias/preferencias'

const textos = copy.diario.perfil.frases

const VISTAS = Object.freeze({ resumen: 'resumen', editar: 'editar', fuentes: 'fuentes' })

/** «Budismo, Hinduismo y Estoicismo», con los nombres del copy. */
function unirLista(ids) {
  const nombres = ids.map((id) => textos.preguntas.afinidades.opciones[id])
  if (nombres.length <= 1) return nombres.join('')
  return nombres.slice(0, -1).join(textos.lista.separador) + textos.lista.ultimo + nombres.at(-1)
}

/** Lo elegido, dicho con palabras. */
export function textoDeEleccion(eleccion) {
  if (!eleccion) return textos.actual.ninguna
  const { modo, afinidades } = eleccion
  if (modo === 'guiadas') {
    return afinidades.length > 0
      ? interpolate(textos.actual.guiadasTemplate, { lista: unirLista(afinidades) })
      : textos.actual.guiadasSinElegir
  }
  return textos.actual[modo] ?? textos.actual.ninguna
}

const ENLACE =
  'rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft underline ' +
  'underline-offset-4 hover:text-on-surface focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-current/30'

export default function TusFrases({ uid }) {
  const [vista, setVista] = useState(VISTAS.resumen)
  // `null` es «no hay elección guardada»; el modo `null` en edición, que
  // todavía no se tocó nada.
  const [eleccion, setEleccion] = useState(null)
  const [borrando, setBorrando] = useState(false)
  const [aviso, setAviso] = useState('')

  const cargar = useCallback(async () => {
    const hay = await hayEleccion(uid)
    setEleccion(hay ? await leerPreferencias(uid) : null)
  }, [uid])

  useEffect(() => {
    cargar()
  }, [cargar])

  const guardar = async (siguiente) => {
    setAviso('')
    if (!siguiente.modo) {
      setEleccion(null)
      await restablecerPreferencias(uid)
      return
    }
    setEleccion(siguiente)
    await guardarPreferencias(uid, siguiente)
  }

  const modo = eleccion?.modo ?? null
  const afinidades = eleccion?.afinidades ?? []

  const tocarModo = (id) => guardar({ modo: alternarModo(modo, id), afinidades })
  const tocarAfinidad = (id) => guardar({ modo, afinidades: alternarAfinidad(afinidades, id) })
  const omitir = async () => {
    await guardar({ modo, afinidades: [] })
    setVista(VISTAS.resumen)
  }

  const borrar = async () => {
    setBorrando(false)
    await restablecerPreferencias(uid)
    setEleccion(null)
    setAviso(textos.borrada)
  }

  if (vista === VISTAS.editar) {
    return (
      <div className="flex flex-col gap-6">
        <PreguntaModo nivel="h3" textos={textos.preguntas.modo} valor={modo} onTocar={tocarModo} />
        {modo === 'guiadas' && (
          <PreguntaAfinidades
            nivel="h3"
            textos={textos.preguntas.afinidades}
            valor={afinidades}
            onTocar={tocarAfinidad}
            onOmitir={omitir}
          />
        )}
        <p className="text-sm text-on-surface-soft leading-relaxed">{textos.nota}</p>
        <div>
          <Button size="sm" variant="surface" onClick={() => setVista(VISTAS.resumen)}>
            {textos.listo}
          </Button>
        </div>
      </div>
    )
  }

  if (vista === VISTAS.fuentes) {
    const citas = citasAprobadas()
    return (
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-md text-on-surface">{textos.fuentes.titulo}</h3>
        {textos.fuentes.criterio.map((parrafo) => (
          <p key={parrafo} className="text-sm text-on-surface-soft leading-relaxed">
            {parrafo}
          </p>
        ))}
        <h4 className="text-base text-on-surface">{textos.fuentes.citasTitulo}</h4>
        {citas.length === 0 ? (
          <p className="text-sm text-on-surface-soft leading-relaxed">{textos.fuentes.sinCitas}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {citas.map((laCita) => (
              <li key={laCita.id} className="text-sm text-on-surface-soft leading-relaxed">
                {laCita.atribucion}
              </li>
            ))}
          </ul>
        )}
        <div>
          <button type="button" className={ENLACE} onClick={() => setVista(VISTAS.resumen)}>
            {textos.fuentes.cerrar}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1" aria-live="polite">
        <p className="text-sm text-on-surface-soft">{textos.actualLabel}</p>
        <p className="text-base text-on-surface leading-relaxed">{textoDeEleccion(eleccion)}</p>
        {aviso && <p className="text-sm text-on-surface-soft">{aviso}</p>}
      </div>
      <p className="text-sm text-on-surface-soft leading-relaxed">{textos.nota}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="surface" onClick={() => setVista(VISTAS.editar)}>
          {eleccion ? textos.cambiar : textos.elegir}
        </Button>
        {eleccion && (
          <button type="button" className={ENLACE} onClick={() => setBorrando(true)}>
            {textos.restablecer}
          </button>
        )}
      </div>
      <div>
        <button type="button" className={ENLACE} onClick={() => setVista(VISTAS.fuentes)}>
          {textos.fuentes.abrir}
        </button>
      </div>

      <Confirmacion
        abierta={borrando}
        titulo={textos.confirmar.titulo}
        texto={textos.confirmar.texto}
        cancelar={{ texto: textos.confirmar.no, onClick: () => setBorrando(false) }}
        confirmar={{ texto: textos.confirmar.si, onClick: borrar }}
      />
    </div>
  )
}
