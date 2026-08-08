// src/pages/habitos/H3Crear.jsx
// H3 — Crear y editar un hábito (§5.7)
//
// Cuatro decisiones y solo una obligatoria: el nombre. El momento viene en
// "Mañana", el área en General y los días en todos, así que crear un hábito
// puede ser escribir y tocar una vez.
//
// Las sugerencias vienen de las áreas elegidas en el onboarding y no repiten lo
// que ya existe. Tocar una rellena el nombre y hereda su área; después se puede
// cambiar todo.
//
// En cuanto se crea, le toca en su ritual: no hay ningún paso de "añadirlo al
// ritual de la mañana" (RN-HR-01).
//
// La misma pantalla edita. Con `habito`, los campos vienen rellenos y guardar
// ajusta el que ya existe en vez de crear otro: conserva su id, su contador y
// sus marcas. Cambiar de momento o de días manda desde ese instante, porque las
// vistas preguntan por momento y día en cada carga.

import { useEffect, useRef, useState } from 'react'
import { copy } from '@copy'
import { MOMENTOS, DIAS_TODOS, sugerenciasPara, normalizarMomento } from '@lib/habits'
import Button from '@components/ui/Button'
import Chip from '@components/ui/Chip'

const MAX_LENGTH = 60

export default function H3Crear({ areas, habitos, habito, onCrear, onVolver }) {
  const headingRef = useRef(null)
  const campoRef   = useRef(null)
  const editando   = Boolean(habito)

  const [nombre, setNombre]   = useState(habito?.nombre ?? '')
  const [areaId, setAreaId]   = useState(habito?.areaId ?? null)
  const [momento, setMomento] = useState(() => normalizarMomento(habito?.momento))
  const [dias, setDias]       = useState(habito?.diasSemana ?? DIAS_TODOS)

  useEffect(() => { headingRef.current?.focus() }, [])

  // Editando no se sugiere nada: el hábito ya tiene nombre y ofrecerle otro
  // invita a reemplazarlo, que no es lo que se vino a hacer.
  const sugerencias = editando ? [] : sugerenciasPara(areas, habitos)
  const puedeCrear  = nombre.trim().length > 0 && dias.length > 0
  const todosLosDias = dias.length === DIAS_TODOS.length

  const usarSugerencia = sugerencia => {
    setNombre(sugerencia.texto)
    setAreaId(sugerencia.areaId)
    campoRef.current?.focus()
  }

  // Crear y editar escriben lo mismo; quién lo recibe lo decide el módulo.
  const guardar = () => {
    if (!puedeCrear) return
    onCrear({ nombre, areaId, momento, diasSemana: dias })
  }

  const alternarDia = dia => {
    setDias(previos =>
      previos.includes(dia)
        ? previos.filter(d => d !== dia)
        : [...previos, dia].sort((a, b) => a - b)
    )
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10">
      <Button variant="ghost" size="sm" className="-ml-4" onClick={onVolver}>
        {copy.ritual.nav.back}
      </Button>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 font-display text-xl leading-tight text-ink focus:outline-none"
      >
        {editando ? copy.habits.create.editTitle : copy.habits.create.label}
      </h1>

      <input
        id="habito-nombre"
        ref={campoRef}
        type="text"
        value={nombre}
        maxLength={MAX_LENGTH}
        autoComplete="off"
        enterKeyHint="done"
        aria-label={copy.habits.create.label}
        placeholder={copy.habits.create.placeholder}
        onChange={event => setNombre(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter' && puedeCrear) {
            guardar()
          }
        }}
        className={[
          'mt-6 w-full min-h-touch',
          'rounded-md bg-surface border border-border',
          'px-4 py-4 text-md text-ink',
          'placeholder:text-ink/70',
          'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
          'focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20',
        ].join(' ')}
      />

      {sugerencias.length > 0 && (
        <div className="mt-6">
          <p id="h3-sugerencias" className="text-base text-ink/80">
            {copy.habits.create.suggestionsLabel}
          </p>
          <div
            role="group"
            aria-labelledby="h3-sugerencias"
            className="mt-3 flex flex-wrap gap-2"
          >
            {sugerencias.map(sugerencia => (
              <Chip
                key={`${sugerencia.areaId ?? 'general'}-${sugerencia.texto}`}
                size="sm"
                color={sugerencia.color}
                onClick={() => usarSugerencia(sugerencia)}
              >
                {sugerencia.texto}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Momento — decide en qué ritual aparece */}
      <div className="mt-10">
        <p id="h3-momento" className="text-base text-ink/80">
          {copy.habits.create.momentLabel}
        </p>
        <div
          role="group"
          aria-labelledby="h3-momento"
          className="mt-3 flex flex-wrap gap-2"
        >
          {MOMENTOS.map((valor, indice) => (
            <Chip
              key={valor}
              selected={momento === valor}
              onClick={() => setMomento(valor)}
            >
              {copy.habits.create.moments[indice]}
            </Chip>
          ))}
        </div>
      </div>

      {/* Área — opcional: sin área vive en General */}
      {areas.length > 0 && (
        <div className="mt-8">
          <p id="h3-area" className="text-base text-ink/80">
            {copy.habits.create.areaLabel}
          </p>
          <div
            role="group"
            aria-labelledby="h3-area"
            className="mt-3 flex flex-wrap gap-2"
          >
            <Chip selected={areaId === null} onClick={() => setAreaId(null)}>
              {copy.areas.general}
            </Chip>

            {areas.map(area => (
              <Chip
                key={area.id}
                color={area.color}
                selected={areaId === area.id}
                onClick={() => setAreaId(area.id)}
              >
                {area.nombre}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Días */}
      <div className="mt-8">
        <p id="h3-dias" className="text-base text-ink/80">
          {copy.habits.create.daysLabel}
        </p>

        <div
          role="group"
          aria-labelledby="h3-dias"
          className="mt-3 flex flex-wrap gap-2"
        >
          {copy.days.short.map((etiqueta, indice) => (
            <Chip
              key={etiqueta}
              size="sm"
              selected={dias.includes(indice)}
              aria-label={copy.days.long[indice]}
              onClick={() => alternarDia(indice)}
            >
              {etiqueta}
            </Chip>
          ))}
        </div>

        {!todosLosDias && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 -ml-4"
            onClick={() => setDias(DIAS_TODOS)}
          >
            {copy.habits.create.everyDay}
          </Button>
        )}
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-12"
        disabled={!puedeCrear}
        onClick={guardar}
      >
        {editando ? copy.habits.create.editSave : copy.habits.create.save}
      </Button>
    </div>
  )
}
