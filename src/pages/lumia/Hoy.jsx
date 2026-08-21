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
//
// **El Diario se muestra aquí, sin paso intermedio.** El conmutador elige qué
// sección se escribe y sus bloques aparecen debajo: no hay tarjeta que anuncie
// el día ni botón que lleve a otra pantalla a escribirlo. El único destino
// aparte es la respiración, que ocupa la pantalla entera mientras dura.
//
// **Cerrar el día es escribir la noche, y nada más.** No hay un recorrido
// guiado paralelo: la ceremonia de cierre está al final de la sección Noche,
// donde se escribe.

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import DiarioManana from '@components/lumia/DiarioManana'
import DiarioNoche from '@components/lumia/DiarioNoche'
import HeroeHoy from '@components/lumia/HeroeHoy'
import SelectorMomento from '@components/lumia/SelectorMomento'
import Respiracion from '@components/shared/Respiracion'
import TransicionLuz, { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import { cruzarUmbral, umbralPendiente } from '@lib/umbralSesion'
import Button from '@components/ui/Button'
import { copy, interpolate } from '@copy'
import { shared } from '@/lib/db'
import { getTimeSlot } from '@lib/timeSlot'
import { franjaDelSaludo } from '@/lumia/fechas'
import { useDiario } from '@/lumia/useDiario'

const textos = copy.lumia.hoy

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

export default function Hoy({ uid, onHideNav, onMomento }) {
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
   * El momento sube a la raíz de la app, que es el único ancestro común con la
   * barra inferior: los tokens del tema viajan por el árbol del DOM, y la barra
   * es hermana de `<main>`, no descendiente de esta pantalla.
   *
   * **RN-HOY-05 sigue intacta**: el conmutador continúa siendo el único origen
   * del tema. Esto no lo decide en otro sitio, lo cuenta — el estado no se ha
   * movido de aquí. Es el mismo trato que `onHideNav`.
   *
   * Al desmontarse avisa con `null`: el Journal y el Historial no tienen
   * momento, y dejar el atributo puesto teñiría su barra con la sección de una
   * pantalla que ya no está.
   */
  useEffect(() => {
    onMomento?.(momento)
    return () => onMomento?.(null)
  }, [momento, onMomento])

  /**
   * §C7.5 — El umbral se cruza al mostrarse la mañana, una vez por sesión.
   * Antes lo disparaba el botón que llevaba al Diario; sin ese botón, el sitio
   * equivalente es el primer momento en que la mañana está en pantalla.
   *
   * El contador vive en `lib/umbralSesion` y lo comparte con la entrada al
   * espacio desde el Home: si ya se cruzó ahí, aquí no se repite. Sin eso,
   * entrar de mañana daría dos umbrales seguidos, diez segundos de luz antes
   * de escribir nada.
   *
   * Espera a que el día esté cargado: un velo sobre una pantalla en blanco no
   * es un umbral, es una espera con luz. El contenido tiene que estar montado
   * detrás para que, cuando la luz se va, no quede nada por hacer.
   *
   * RN-LU-MAN-03 — Mostrar la mañana **no** dispara la respiración. Sigue
   * entrando solo por su enlace, que es lo que la hace voluntaria.
   */
  useEffect(() => {
    const puedeCruzarse = umbralPendiente('lumia') && !prefiereMenosMovimiento()
    if (carga !== 'lista' || momento !== 'manana' || !puedeCruzarse) return
    cruzarUmbral('lumia')
    setUmbral(true)
  }, [carga, momento])

  /** Las dos superficies que sí son un destino: ocupan la pantalla entera. */
  const abrir = (siguiente) => {
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

  const saludo = copy.lumia.hoy.saludo[franjaDelSaludo()]

  /* La entrada a la respiración, la misma en las dos secciones. Va como
     enlace discreto justo debajo del conmutador, que es donde estaba cuando la
     tarjeta del día existía: se encuentra sin desplazarse y no interrumpe la
     escritura de más abajo.

     RN-LU-RESP-01 — La respiración se abre desde aquí y **solo** desde aquí.
     Mostrar una sección no la dispara, y por eso los 39 segundos que dura son
     aceptables. */
  const enlace =
    'self-start rounded-full px-3 py-2 min-h-touch-sm text-left text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30'

  return marco(
    <div className="flex min-h-screen flex-col gap-8 px-5 pb-24 pt-10">
      {/* El conmutador va dentro del héroe, justo debajo de la fecha: es el
          primer elemento con el que se puede interactuar, por delante de la
          frase del día y de cualquier pregunta. Elegir el momento es lo que
          decide de qué habla el resto de la pantalla, así que no puede llegar
          después de lo que gobierna. */}
      <HeroeHoy
        estado={estado}
        conmutador={
          <div className="flex flex-col items-start gap-1">
            <SelectorMomento momento={momento} onCambiar={setMomento} />
            <button type="button" onClick={() => abrir('respiracion')} className={enlace}>
              {`${copy.lumia.respiracion.entrada.abrir} · ${copy.lumia.respiracion.entrada.ayuda}`}
            </button>
          </div>
        }
        saludo={
          estado.nombre
            ? interpolate(textos.saludo.conNombreTemplate, { saludo, nombre: estado.nombre })
            : saludo
        }
      />

      {/* El Diario, aquí mismo. Sin tarjeta que lo anuncie y sin paso previo:
          la sección elegida arriba es la que se escribe abajo. */}
      {momento === 'manana' ? (
        <DiarioManana estado={estado} acciones={acciones} />
      ) : (
        <DiarioNoche estado={estado} acciones={acciones} />
      )}

      {/* El día ya está montado detrás: cuando la luz se va, no hay nada que
          cargar ni ningún paso que dar. Umbral, no secuencia. */}
      {umbral && <TransicionLuz onTerminar={() => setUmbral(false)} />}

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
