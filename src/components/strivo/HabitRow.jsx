// src/components/strivo/HabitRow.jsx
// Fila de hábito en checklist (ritual o lista)
// Design: §5.7, Blueprint v3
//
// REGLAS DE DISEÑO:
// ✅ Al marcar: trazo animado de 260ms + atenuar al 70% (sin tachar)
// ✅ Al desmarcar: inverso, sin penalización visual
// ✅ NUNCA rojo, ni porcentaje de incumplimiento, ni texto "fallaste"
// ✅ El texto tachado NO se usa (connota tarea eliminada, no logro)
//
// Bajo el nombre va el ÁREA del hábito, no la identidad de área: emparejar cada
// hábito con la frase de su área daba cosas como "Dormir a tiempo · se mueve
// porque le hace bien". La regla la resuelve @lib/areas, igual en todas las
// pantallas.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy, interpolate } from '@copy'
import { areaColors } from '@tokens'
import { EMOJI_POR_DEFECTO } from '@lib/emojis'
import { etiquetaDeArea } from '@lib/areas'

/**
 * HabitRow — fila de hábito en checklist
 *
 * @param {object} habit - entidad Habit del §7.2
 * @param {boolean} done - si ya está marcado hoy
 * @param {function} onToggle - callback(habitId, done)
 * @param {object} area - entidad Area (para color)
 * @param {function} [onOpen] - abrir el detalle (H2). Sin él, el nombre no es
 *   tocable: en los rituales no hay a dónde ir y un botón que no lleva a
 *   ningún sitio solo estorba al recorrer con teclado.
 */
// Un toque accidental repetido no puede escribir dos veces. La capa de datos ya
// es idempotente (§26.3), pero absorber el doble toque aquí evita además el
// parpadeo de marcar y desmarcar en el mismo gesto.
const ESPERA_ENTRE_TOQUES = 300

// Lo que se queda en pantalla el guiño del extra. Suficiente para leerlo sin
// convertirse en algo que hay que quitarse de encima.
const DURACION_DEL_EXTRA = 5000

export default function HabitRow({ habit, done = false, onToggle, area, progreso, className, onOpen }) {
  const [pressed, setPressed] = useState(false)
  const ultimoToque = useRef(0)
  // El ✨ del extra: aparece al hacerlo una vez más de las que te propusiste, y
  // se va solo. Es un guiño, no un aviso que haya que cerrar.
  const [extraReciente, setExtraReciente] = useState(false)
  const extraPrevio = useRef(progreso?.extra ?? 0)
  const Contenedor = onOpen ? 'button' : 'div'

  const color = area?.color ?? areaColors[area?.tipo] ?? '#D9CFC4'
  // El área a la que pertenece, y solo si la persona la tiene activa (@lib/areas)
  const etiqueta = etiquetaDeArea(area)

  // Cómo va la semana. Tres estados y ninguno negativo: quedarse a mitad no se
  // nombra como falta, solo se cuenta lo que sí ocurrió (§5.7, RN-05).
  const textoDeProgreso = !progreso
    ? null
    : progreso.extra > 0
      ? interpolate(copy.habits.list.weekExtraTemplate, { n: progreso.extra })
      : progreso.cumplida
        ? copy.habits.list.weekDone
        : interpolate(copy.habits.list.weekProgressTemplate, {
            n: progreso.hechas,
            meta: progreso.meta,
          })

  // Interruptor de dos estados, nunca un contador: tocarlo marca, volver a
  // tocarlo desmarca. En ningún caso suma (§26.3).
  function handleToggle() {
    const ahora = Date.now()
    if (ahora - ultimoToque.current < ESPERA_ENTRE_TOQUES) return
    ultimoToque.current = ahora

    setPressed(true)
    onToggle?.(habit.id, !done)
    setTimeout(() => setPressed(false), 260)
  }

  // Solo cuando el extra crece: reabrir la pantalla con el extra ya hecho no
  // vuelve a felicitar por algo de anteayer.
  useEffect(() => {
    const extra = progreso?.extra ?? 0
    if (extra > extraPrevio.current) {
      setExtraReciente(true)
      const relevo = setTimeout(() => setExtraReciente(false), DURACION_DEL_EXTRA)
      extraPrevio.current = extra
      return () => clearTimeout(relevo)
    }
    extraPrevio.current = extra
    return undefined
  }, [progreso?.extra])

  return (
    <div className={clsx('flex flex-col', className)}>
    <div
      className={clsx(
        'flex items-center gap-3 py-3 px-1',
        'transition-opacity duration-260 ease-smooth',
        done && 'opacity-70',   // Atenuar al 70% (sin tachar)
        'motion-reduce:transition-none',
      )}
    >
      {/* Casilla de verificación (custom para animar el trazo) */}
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={done}
        aria-label={done ? `${habit.nombre} — completado. Toca para desmarcar.` : `${habit.nombre} — sin completar. Toca para marcar.`}
        className={clsx(
          'flex-shrink-0 w-6 h-6 rounded-sm border-2',
          'flex items-center justify-center',
          'transition-all duration-260 ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30',
          'min-w-[48px] min-h-[48px] -m-3',   // área de toque 48×48
          'motion-reduce:transition-none',
        )}
        style={{
          borderColor: done ? color : '#D9CFC4',
          backgroundColor: done ? color + '15' : 'transparent',
        }}
      >
        {done && (
          <svg
            viewBox="0 0 12 10"
            fill="none"
            className="w-3 h-3 animate-check-draw"
            aria-hidden="true"
          >
            <path
              d="M1 5L4.5 8.5L11 1"
              stroke={color}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="40"
              strokeDashoffset={pressed ? '40' : '0'}
              style={{ transition: 'stroke-dashoffset 260ms cubic-bezier(0.25,0.46,0.45,0.94)' }}
            />
          </svg>
        )}
      </button>

      {/* Contenido del hábito */}
      <Contenedor
        {...(onOpen
          ? {
              type: 'button',
              onClick: onOpen,
              'aria-label': `${habit.nombre} — ${copy.habits.list.open}`,
            }
          : {})}
        className={clsx(
          'flex-1 text-left',
          onOpen && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 rounded-sm',
        )}
      >
        <div className="flex items-center gap-2">
          {/* Punto de color del área */}
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />

          {/* Su símbolo (§16). Decorativo: quien usa lector de pantalla oye el
              nombre, que es el identificador real. Los hábitos escritos antes
              de que esto existiera muestran el de por defecto. */}
          <span className="text-md leading-none flex-shrink-0" aria-hidden="true">
            {habit.emoji ?? EMOJI_POR_DEFECTO}
          </span>

          <span className={clsx(
            'text-base text-surface-fg font-sans',
            // SIN tachar. El texto se atenúa por el padre (opacity-70)
          )}>
            {habit.nombre}
          </span>
        </div>

        {/* El área y cómo va la semana. Sin ninguna de las dos no se pinta
            nada: el bloque entero desaparece y la fila queda del alto que le
            toca. */}
        {(etiqueta || textoDeProgreso) && (
          <p className="text-sm text-surface-fg-muted mt-0.5 ml-4">
            {[etiqueta?.nombre, textoDeProgreso].filter(Boolean).join(' · ')}
          </p>
        )}
      </Contenedor>

      {/* La marca de meta cumplida. Es lo único que se añade al cumplirla: ni
          confeti, ni sonido, ni un número más grande. */}
      {progreso?.cumplida && (
        <span
          className="text-sm text-surface-fg-muted flex-shrink-0"
          aria-hidden="true"
        >
          ✓
        </span>
      )}
    </div>

    {/* El guiño del extra. Debajo, pequeño y de paso: se va solo a los cinco
        segundos y no deja nada que cerrar. */}
    {extraReciente && (
      <p
        aria-live="polite"
        className="ml-10 -mt-1 mb-2 text-sm text-surface-fg-muted animate-sugerencia-entra motion-reduce:animate-none"
      >
        ✨ {copy.habits.list.weekExtraJustNow}
      </p>
    )}
    </div>
  )
}
