// src/pages/diario/Hoy.jsx
// Pantalla raíz de la app (§5.2 + §5.2.1 + §5.2.3).
//
// Orienta en menos de dos segundos: qué momento es, qué hay, cómo estoy. Nunca
// es un panel de control: no hay gráficas, ni contadores, ni insignias, ni una
// segunda acción principal.
//
// **Sin vocabulario de hábitos y sin puente a ninguna otra parte.** Lo que se
// replegó no dejó aquí ni una etiqueta ni un enlace. Tampoco está el texto
// "Tu día está en curso…" de Fase 0.
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
//
// **Y no siempre se escribe el día de hoy** (3 sep 2026). La ventana de
// edición dura 72 horas desde que empieza cada día, así que esta pantalla
// puede estar mostrando el de ayer o el de anteayer: el selector de arriba
// elige cuál y `useDiario` carga ese. Qué día se está escribiendo lo sabe esta
// pantalla y nadie más — las secciones reciben el estado ya resuelto, igual que
// antes. Un día que ya pasó su ventana no se oculta ni desaparece: se muestra
// entero y sin nada que tocar.

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import DiarioManana from '@components/diario/DiarioManana'
import DiarioNoche from '@components/diario/DiarioNoche'
import HeroeHoy from '@components/diario/HeroeHoy'
import SelectorDia from '@components/diario/SelectorDia'
import SelectorMomento from '@components/diario/SelectorMomento'
import TarjetaRespiracion from '@components/diario/TarjetaRespiracion'
import Respiracion from '@components/shared/Respiracion'
import TransicionLuz, { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import { cruzarUmbral, umbralPendiente } from '@lib/umbralSesion'
import Button from '@components/ui/Button'
import { copy, interpolate } from '@copy'
import { shared } from '@/lib/db'
import { getTimeSlot } from '@lib/timeSlot'
import { franjaDelSaludo } from '@/diario/fechas'
import { useDiario } from '@/diario/useDiario'

const textos = copy.diario.hoy

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
          data-momento={id}
          className={clsx('absolute inset-0 bg-strivo transicion-fondo')}
          style={{ opacity: momento === id ? 1 : 0 }}
        />
      ))}
    </div>
  )
}

export default function Hoy({ uid, onHideNav, onMomento }) {
  // `null` es "el día al que pertenece este momento", que es con lo que abre
  // siempre la pantalla. Elegir otro día de la ventana lo fija aquí y recarga.
  // No se persiste: al volver a abrir la app se entra por hoy, como siempre.
  const [fechaPedida, setFechaPedida] = useState(null)
  const { estado, carga, error, acciones, reintentar } = useDiario(uid, fechaPedida)
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
    const puedeCruzarse = umbralPendiente('diario') && !prefiereMenosMovimiento()
    if (carga !== 'lista' || momento !== 'manana' || !puedeCruzarse) return
    cruzarUmbral('diario')
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
    <div data-momento={momento} className="relative min-h-screen bg-strivo-base transicion-tema">
      <Fondo momento={momento} />
      <div
        data-surface={superficie}
        data-momento={momento}
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
        <p className="text-base text-on-surface">{copy.diario.error.load.body}</p>
        <div>
          <Button size="sm" variant="surface" onClick={reintentar}>
            {copy.diario.error.load.retry}
          </Button>
        </div>
      </div>,
    )
  }

  if (vista === 'respiracion') {
    return marco(
      <Respiracion
        textos={copy.diario.respiracion}
        sonido={sonido}
        onSonido={guardarSonido}
        onSalir={cerrar}
      />,
    )
  }

  const saludo = copy.diario.hoy.saludo[franjaDelSaludo()]

  return marco(
    <div className="flex min-h-screen flex-col gap-8 px-5 pb-24 pt-10">
      {/* El conmutador va dentro del héroe, justo debajo de la fecha: es el
          primer elemento con el que se puede interactuar, por delante de la
          frase del día y de cualquier pregunta. Elegir el momento es lo que
          decide de qué habla el resto de la pantalla, así que no puede llegar
          después de lo que gobierna. */}
      <HeroeHoy
        estado={estado}
        conmutador={<SelectorMomento momento={momento} onCambiar={setMomento} />}
        /* Los días que la ventana todavía tiene abiertos. Con uno solo el
           selector no se pinta: ofrecer una lista de un elemento es enseñar un
           mecanismo que no hace nada. */
        dias={<SelectorDia dias={estado.dias} fecha={estado.fecha} onCambiar={setFechaPedida} />}
        /* La entrada a la respiración, la misma en las dos secciones: lo que
           cambia entre ellas es la paleta, no el destino. Va pegada al
           conmutador y por delante de la frase del día, que es el aire previo
           a la primera pregunta del Diario: se ofrece antes de ese aire, no
           interrumpiéndolo.

           RN-LU-RESP-01 — La respiración se abre desde aquí y **solo** desde
           aquí. Mostrar una sección no la dispara, y por eso los 39 segundos
           que dura son aceptables. */
        respiracion={
          <TarjetaRespiracion
            etiqueta={copy.diario.respiracion.entrada.abrir}
            onAbrir={() => abrir('respiracion')}
          />
        }
        saludo={
          estado.nombre
            ? interpolate(textos.saludo.conNombreTemplate, { saludo, nombre: estado.nombre })
            : saludo
        }
      />

      {/* Un día que ya cerró su ventana se dice una vez, en voz baja y sin
          alarma: no hay aviso, no hay ventana emergente y no hay nada que
          confirmar. Debajo sigue estando el día entero, para leerlo. */}
      {!estado.editable && <p className="text-sm text-on-surface-soft">{textos.dias.cerrado}</p>}

      {/* El Diario, aquí mismo. Sin tarjeta que lo anuncie y sin paso previo:
          la sección elegida arriba es la que se escribe abajo. */}
      {momento === 'manana' ? (
        <DiarioManana estado={estado} acciones={acciones} soloLectura={!estado.editable} />
      ) : (
        <DiarioNoche estado={estado} acciones={acciones} soloLectura={!estado.editable} />
      )}

      {/* El día ya está montado detrás: cuando la luz se va, no hay nada que
          cargar ni ningún paso que dar. Umbral, no secuencia. */}
      {umbral && <TransicionLuz onTerminar={() => setUmbral(false)} />}

      {error && (
        <p className="flex flex-wrap items-center gap-3 text-sm text-on-surface-soft" role="status">
          {copy.diario.error.save.body}
          <Button size="sm" variant="surface" onClick={error.reintentar}>
            {copy.diario.error.save.retry}
          </Button>
        </p>
      )}
    </div>,
  )
}
