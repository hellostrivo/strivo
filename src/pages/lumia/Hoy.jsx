// src/pages/lumia/Hoy.jsx
// Pantalla raíz de Lumia (§5.2 + §5.2.1 + §5.2.3).
//
// Orienta en menos de dos segundos: qué momento es, qué hay, cómo estoy. Nunca
// es un panel de control: no hay gráficas, ni contadores, ni insignias, ni una
// segunda acción principal.
//
// **Sin enlace a Formia** (§C7.7.3). Los dos espacios se cruzan solo por la
// barra de navegación, así que aquí no hay puente, ni etiqueta, ni vocabulario
// de hábitos. Tampoco está el texto "Tu día está en curso…" de Fase 0.
//
// El tema lo elige el conmutador y solo el conmutador (RN-HOY-05). La hora del
// sistema decide con cuál se abre la pantalla y nada más.

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import DiarioManana from '@components/lumia/DiarioManana'
import DiarioNoche from '@components/lumia/DiarioNoche'
import RitualNoche from '@components/lumia/RitualNoche'
import HeroeHoy from '@components/lumia/HeroeHoy'
import SelectorMomento from '@components/lumia/SelectorMomento'
import Respiracion from '@components/shared/Respiracion'
import TransicionLuz, { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import Button from '@components/ui/Button'
import { copy, interpolate } from '@copy'
import { shared } from '@/lib/db'
import { getTimeSlot } from '@lib/timeSlot'
import { mananaEscrita, nocheEscrita } from '@/lumia/diario'
import { franjaDelSaludo } from '@/lumia/fechas'
import { useDiario } from '@/lumia/useDiario'

const textos = copy.lumia.hoy

/**
 * ¿Ya se cruzó el umbral de la mañana en esta sesión? (§C7.5)
 *
 * Vive en el módulo y no en un `useRef` porque `Hoy` se desmonta al cambiar de
 * pestaña: con el estado dentro del componente, ir al Journal y volver haría
 * pasar por el umbral otra vez. Un umbral que se cruza tres veces en diez
 * minutos deja de ser un umbral y empieza a ser un peaje.
 *
 * No se persiste: SPEC_10 §5 no tiene modelo de datos, y cerrar la app y
 * volver mañana es exactamente cuando el umbral vuelve a tener sentido.
 */
let umbralCruzado = false

/** Solo para las pruebas: devuelve el módulo a como empieza una sesión. */
export function olvidarUmbral() {
  umbralCruzado = false
}

/** Con cuál se abre la pantalla (§5.2.1). A partir de ahí manda el conmutador. */
function momentoInicial() {
  const franja = getTimeSlot()
  return franja === 'amanecer' || franja === 'dia' ? 'manana' : 'noche'
}

function Fondo({ momento }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0">
      {['manana', 'noche'].map((id) => (
        <div
          key={id}
          data-lumia={id}
          className={clsx('absolute inset-0 bg-lumia transicion-fondo')}
          style={{ opacity: momento === id ? 1 : 0 }}
        />
      ))}
    </div>
  )
}

export default function Hoy({ uid, onHideNav }) {
  const { estado, carga, error, acciones, reintentar } = useDiario(uid)
  const [momento, setMomento] = useState(momentoInicial)
  const [vista, setVista] = useState('hoy')
  const [umbral, setUmbral] = useState(false)
  // §6.12 — Silencio por defecto en toda la app. Si el perfil todavía no tiene
  // preferencias, se arranca en silencio y no al revés.
  const [sonido, setSonido] = useState(false)

  useEffect(() => {
    if (!uid) return
    shared
      .getPreferences(uid)
      .then((preferencias) => setSonido(preferencias?.soundEnabled === true))
      .catch(() => {})
  }, [uid])

  /** RN-AUD-03 — Silenciar una vez silencia para siempre, hasta que se cambie. */
  const guardarSonido = (activado) => {
    setSonido(activado)
    shared.updatePreferences(uid, { soundEnabled: activado }).catch(() => {})
  }

  const superficie = momento === 'manana' ? 'light' : 'dark'

  /**
   * §C7.5 — El umbral va donde estaba el pop-up disuelto: justo antes del
   * contenido de la mañana, y no al mover el conmutador, que solo cambia lo
   * que muestra el héroe.
   *
   * RN-LU-MAN-03 — Abrir la mañana **no** dispara la respiración. Sigue
   * entrando solo por su enlace, que es lo que la hace voluntaria.
   */
  const abrir = (siguiente) => {
    if (siguiente === 'manana' && !umbralCruzado && !prefiereMenosMovimiento()) {
      umbralCruzado = true
      setUmbral(true)
    }
    setVista(siguiente)
    onHideNav?.(true)
  }

  const cerrar = () => {
    setVista('hoy')
    onHideNav?.(false)
  }

  const marco = (contenido) => (
    <div data-lumia={momento} className="relative min-h-screen bg-lumia-base transicion-tema">
      <Fondo momento={momento} />
      <div
        data-surface={superficie}
        data-lumia={momento}
        className="relative transicion-tema text-on-surface"
      >
        {contenido}
      </div>
    </div>
  )

  if (carga === 'cargando') {
    return marco(<div className="min-h-screen" aria-busy="true" />)
  }

  if (carga === 'error') {
    return marco(
      <div className="flex min-h-screen flex-col justify-center gap-4 px-5">
        <p className="text-base text-on-surface">{copy.lumia.diario.error.load.body}</p>
        <div>
          <Button size="sm" variant="surface" onClick={reintentar}>
            {copy.lumia.diario.error.load.retry}
          </Button>
        </div>
      </div>,
    )
  }

  if (vista === 'manana') {
    return marco(
      <>
        <DiarioManana estado={estado} acciones={acciones} onSalir={cerrar} />
        {/* La mañana ya está montada detrás: cuando la luz se va, no hay nada
            que cargar ni ningún paso que dar. Umbral, no secuencia. */}
        {umbral && <TransicionLuz onTerminar={() => setUmbral(false)} />}
      </>,
    )
  }

  if (vista === 'noche') {
    return marco(<DiarioNoche estado={estado} acciones={acciones} onSalir={cerrar} />)
  }

  if (vista === 'guiado') {
    return marco(<RitualNoche estado={estado} acciones={acciones} onSalir={cerrar} />)
  }

  if (vista === 'respiracion') {
    return marco(
      <Respiracion
        textos={copy.lumia.respiracion}
        sonido={sonido}
        onSonido={guardarSonido}
        onSalir={cerrar}
      />,
    )
  }

  const hecho =
    momento === 'manana'
      ? mananaEscrita(estado.morning)
      : nocheEscrita(estado.night, estado.victorias)
  const tarjeta = textos.tarjeta[momento]
  const saludo = copy.lumia.hoy.saludo[franjaDelSaludo()]

  return marco(
    <div className="flex min-h-screen flex-col gap-8 px-5 pb-24 pt-10">
      {/* El conmutador va dentro del héroe, justo debajo de la fecha: es el
          primer elemento con el que se puede interactuar, por delante de la
          frase del día y de cualquier pregunta. Elegir el momento es lo que
          decide de qué habla el resto de la pantalla, así que no puede llegar
          después de lo que gobierna. */}
      <HeroeHoy
        estado={estado}
        momento={momento}
        acciones={acciones}
        conmutador={<SelectorMomento momento={momento} onCambiar={setMomento} />}
        saludo={
          estado.nombre
            ? interpolate(textos.saludo.conNombreTemplate, { saludo, nombre: estado.nombre })
            : saludo
        }
      />

      {/* RN-HOY-07 — La tarjeta se distingue del fondo por luminancia, no solo
          por el borde. Es la única acción principal de la pantalla. */}
      <section className="flex flex-col gap-3 rounded-lg border border-on-surface bg-lumia-tarjeta p-5 shadow-elev-2 transicion-tema">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-md text-on-surface">{tarjeta.titulo}</h2>
          <p className="text-sm text-on-surface-soft">
            {hecho ? textos.hecho[momento] : tarjeta.duracion}
          </p>
        </div>
        <div>
          <Button size="sm" variant="surface" onClick={() => abrir(momento)}>
            {hecho ? textos.hecho.accion : tarjeta.accion}
          </Button>
        </div>

        {/* Las dos entradas secundarias del momento activo. Van como enlaces
            discretos y no como segundo botón: la pantalla Hoy tiene **una**
            acción principal.

            RN-LU-RESP-01 — La respiración se abre desde aquí y **solo** desde
            aquí. Entrar en la sección Mañana no la dispara, y por eso los 39
            segundos que dura son aceptables. */}
        {momento === 'manana' && (
          <button
            type="button"
            onClick={() => abrir('respiracion')}
            className="self-start rounded-full px-3 py-2 min-h-touch-sm text-left text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {`${copy.lumia.respiracion.entrada.abrir} · ${copy.lumia.respiracion.entrada.ayuda}`}
          </button>
        )}

        {/* El modo guiado de la noche (§5.6). Escribe en el mismo sitio que la
            vista libre (D-4.5). */}
        {momento === 'noche' && (
          <button
            type="button"
            onClick={() => abrir('guiado')}
            className="self-start rounded-full px-3 py-2 min-h-touch-sm text-left text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
          >
            {`${copy.lumia.ritualNoche.abrir} · ${copy.lumia.ritualNoche.abrirAyuda}`}
          </button>
        )}
      </section>

      {error && (
        <p className="flex flex-wrap items-center gap-3 text-sm text-on-surface-soft" role="status">
          {copy.lumia.diario.error.save.body}
          <Button size="sm" variant="surface" onClick={error.reintentar}>
            {copy.lumia.diario.error.save.retry}
          </Button>
        </p>
      )}
    </div>,
  )
}
