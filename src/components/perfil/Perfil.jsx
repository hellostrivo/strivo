// src/components/perfil/Perfil.jsx
// Tu perfil — lo que la app sabe de ti, y que puedes cambiar cuando quieras.
//
// **Una pila de bloques, no un formulario.** La lista de cuáles hay vive en
// `src/perfil/bloques.js` y aquí solo se dice qué pinta cada uno. Es lo que
// permite que el plan de pago y la suscripción de fases posteriores entren
// como un bloque más: un identificador allí, un texto en el copy y un
// componente aquí.
//
// **No hay botón de guardar y no hay nada que confirmar.** Se guarda solo
// —los toques al momento, lo tecleado a los 800 ms— y salir no pregunta
// (RN-EST-08). Tampoco hay nada obligatorio: cualquier bloque se puede dejar en
// blanco, incluido el nombre.
//
// **Las preguntas del onboarding se vuelven a hacer con su mismo catálogo.** El
// género se pregunta aquí con las cuatro opciones de su sub-paso: son campos
// del perfil, no pasos de un recorrido, y dos copias del catálogo se separarían
// en cuanto alguien editara una.
//
// Lo que **no** hay aquí, y no es un olvido: nada que mida, nada que compare y
// ningún dato que la persona no haya escrito ella misma. Un perfil que devuelve
// cifras sobre quien lo abre es un panel de control, y este producto no tiene
// uno (no-negociable 2).
//
// **El bloque de sincronización (SPEC_17A §4.6) no lo contradice**: no dice
// nada de la persona, dice dónde está lo suyo. Su estado se anuncia con texto
// en un contenedor `aria-live`, nunca solo con un punto de color, y el botón
// de volver a intentar aparece solo cuando hay algo que intentar.

import Bloque from './Bloque'
import Button from '@components/ui/Button'
import { CampoLinea } from '@components/shared/Campo'
import { ListaDeChips } from '@components/shared/Chips'
import { copy } from '@copy'
import { BLOQUES } from '@/perfil/bloques'
import { usePerfil } from '@/perfil/usePerfil'
import { useSincronizacion } from '@/perfil/useSincronizacion'
import { OPCIONES as GENEROS, alternar as alternarGenero } from '@/onboarding/genero'

const textos = copy.diario.perfil

// El catálogo se lee de donde se pregunta por primera vez. Ver la nota del
// namespace en `copy/index.js`: un solo sitio hasta que haya un tercero.
const OPCIONES_GENERO = copy.diario.onboarding.p2a.options

function Marco({ children }) {
  return (
    <div data-surface="light" className="min-h-screen bg-espacio text-on-surface">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8">{children}</div>
    </div>
  )
}

export default function Perfil({ uid }) {
  const { valores, carga, acciones, reintentar } = usePerfil(uid)
  const sincronizacion = useSincronizacion(uid)

  const bloques = {
    nombre: () => (
      <label className="flex flex-col gap-2">
        <span className="text-sm text-on-surface-soft">{textos.nombre.label}</span>
        <CampoLinea
          value={valores.nombre}
          autoComplete="given-name"
          onChange={(evento) =>
            acciones.responder('nombre', evento.target.value, { teclado: true })
          }
          onBlur={acciones.volcar}
        />
      </label>
    ),

    genero: () => (
      <ListaDeChips
        etiqueta={textos.genero.titulo}
        opciones={GENEROS.map((id) => ({ id, texto: OPCIONES_GENERO[id] }))}
        elegidas={valores.genero ? [valores.genero] : []}
        onTocar={(id) => acciones.responder('genero', alternarGenero(valores.genero, id))}
      />
    ),

    horarios: () => (
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-on-surface-soft">{textos.horarios.wakeLabel}</span>
          <CampoLinea
            type="time"
            value={valores.despertar}
            onChange={(evento) => acciones.responder('despertar', evento.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-on-surface-soft">{textos.horarios.sleepLabel}</span>
          <CampoLinea
            type="time"
            value={valores.dormir}
            onChange={(evento) => acciones.responder('dormir', evento.target.value)}
          />
        </label>
      </div>
    ),

    sincronizacion: () => (
      <div className="flex flex-col gap-4">
        {/* El estado, con texto y en voz baja. Sin cuántas esperan a salir:
            "Guardando" ya lo dice entero, y un número que el sondeo no ve
            bajar se queda congelado como si algo estuviera atorado. */}
        <div aria-live="polite" className="flex flex-col gap-1">
          <p className="text-base text-on-surface">
            {textos.sincronizacion[sincronizacion.estado]}
          </p>
          {sincronizacion.restauracionFallida && (
            <p className="text-sm text-on-surface-soft leading-relaxed">
              {copy.shared.restauracion.error}
            </p>
          )}
        </div>
        {sincronizacion.puedeReintentar && (
          <div>
            <Button size="sm" variant="surface" onClick={sincronizacion.reintentar}>
              {textos.sincronizacion.reintentar}
            </Button>
          </div>
        )}
      </div>
    ),
  }

  if (carga === 'cargando') {
    return (
      <Marco>
        <div className="min-h-screen" aria-busy="true" />
      </Marco>
    )
  }

  if (carga === 'error') {
    return (
      <Marco>
        <p className="text-base text-on-surface">{copy.diario.error.load.body}</p>
        <div>
          <Button size="sm" variant="surface" onClick={reintentar}>
            {copy.diario.error.load.retry}
          </Button>
        </div>
      </Marco>
    )
  }

  return (
    <Marco>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface">{textos.titulo}</h1>
        <p className="text-base text-on-surface-soft leading-relaxed">{textos.lead}</p>
      </header>

      {BLOQUES.map((id) => (
        <Bloque key={id} titulo={textos[id].titulo} hint={textos[id].hint}>
          {bloques[id]()}
        </Bloque>
      ))}
    </Marco>
  )
}
