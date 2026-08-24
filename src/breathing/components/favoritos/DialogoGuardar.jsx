// src/breathing/components/favoritos/DialogoGuardar.jsx
// Ponerle nombre a una combinación (§4.3).
//
// **Hoja inferior, no modal centrado.** En un teléfono el teclado ocupa la mitad
// baja de la pantalla, y un diálogo centrado acaba con el campo tapado por el
// propio teclado que hace falta para rellenarlo. Desde abajo, el campo sube con
// él.
//
// El campo llega **prellenado y seleccionado** (RN-RE-FAV-04): quien quiera su
// propio nombre escribe encima de un gesto, y quien no quiera pensarlo ya tiene
// uno que sirve. Es la diferencia entre un guardado de dos segundos y uno que
// obliga a inventar un nombre en el peor momento para inventar nada.
//
// Toda la validación viene de `nombreSugerido.js`, que es puro. Aquí solo se
// traduce el motivo a copy.

import { useEffect, useRef, useState } from 'react'
import { copy, interpolate } from '@copy'
import { MOTIVOS, validarNombre } from '../../lib/nombreSugerido.js'

const MENSAJE_POR_MOTIVO = {
  [MOTIVOS.VACIO]: 'nombreVacio',
  [MOTIVOS.LARGO]: 'nombreLargo',
  [MOTIVOS.REPETIDO]: 'nombreRepetido',
}

/**
 * @param {string} sugerido          - RN-RE-FAV-04.
 * @param {string[]} nombresExistentes
 * @param {string[]} resumen         - Las líneas de lo que se va a guardar.
 * @param {?object} favoritoIdentico - RN-RE-FAV-05.
 */
export default function DialogoGuardar({
  sugerido,
  nombresExistentes = [],
  resumen = [],
  favoritoIdentico = null,
  alLimite = false,
  onGuardar,
  onReemplazar,
  onCancelar,
}) {
  const textos = copy.respiracion.favoritos
  const [nombre, setNombre] = useState(sugerido)
  const [motivo, setMotivo] = useState(null)
  const campo = useRef(null)

  useEffect(() => {
    // Seleccionado, no solo enfocado: escribir sustituye en vez de añadirse al
    // final de un nombre que no se pidió.
    campo.current?.focus()
    campo.current?.select()
  }, [])

  // RN-RE-FAV-05 — Si ya existe idéntica, no se ofrece guardar: se dice cuál es.
  if (favoritoIdentico !== null) {
    return (
      <Hoja onCancelar={onCancelar}>
        <p className="text-sm text-on-surface">
          {interpolate(textos.yaGuardada, { nombre: favoritoIdentico.nombre })}
        </p>
      </Hoja>
    )
  }

  // RN-RE-FAV-01 — El límite se explica y no se borra nada solo.
  if (alLimite) {
    return (
      <Hoja onCancelar={onCancelar}>
        <p className="text-sm text-on-surface">{textos.limite}</p>
      </Hoja>
    )
  }

  function confirmar() {
    const veredicto = validarNombre(nombre, nombresExistentes)
    if (!veredicto.valido) {
      setMotivo(veredicto.motivo)
      return
    }
    setMotivo(null)
    onGuardar(veredicto.nombre)
  }

  return (
    <Hoja onCancelar={onCancelar}>
      <label className="flex flex-col gap-2">
        <span className="text-sm text-on-surface">{textos.nombreEtiqueta}</span>
        <input
          ref={campo}
          value={nombre}
          onChange={(evento) => {
            setNombre(evento.target.value)
            setMotivo(null)
          }}
          // RN-RE-FAV-15 — Enter confirma, Escape cancela.
          onKeyDown={(evento) => {
            if (evento.key === 'Enter') confirmar()
            if (evento.key === 'Escape') onCancelar()
          }}
          placeholder={textos.nombrePlaceholder}
          className="min-h-[44px] rounded-md border border-on-surface px-4 text-on-surface"
        />
      </label>

      {motivo !== null ? (
        <p className="text-sm text-on-surface" role="alert">
          {textos[MENSAJE_POR_MOTIVO[motivo]]}
        </p>
      ) : null}

      {motivo === MOTIVOS.REPETIDO ? (
        <button
          type="button"
          onClick={() => onReemplazar(nombre)}
          className="min-h-[44px] underline text-sm text-on-surface"
        >
          {textos.reemplazar}
        </button>
      ) : null}

      <ul className="flex flex-col gap-1">
        {resumen.map((linea) => (
          <li key={linea} className="text-xs text-on-surface-soft">
            {linea}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={confirmar}
          className="min-h-[44px] flex-1 rounded-md border border-on-surface text-on-surface"
        >
          {textos.guardarAccion}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="min-h-[44px] flex-1 rounded-md text-on-surface"
        >
          {textos.cancelar}
        </button>
      </div>
    </Hoja>
  )
}

function Hoja({ children, onCancelar }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.respiracion.favoritos.guardar}
      onKeyDown={(evento) => {
        if (evento.key === 'Escape') onCancelar()
      }}
      className="flex flex-col gap-4 rounded-t-3xl border-t border-on-surface p-6"
    >
      {children}
    </div>
  )
}
