// src/App.jsx
// Las cuatro secciones y lo que las enmarca.
//
// **Revisión del 25 de agosto de 2026.** Hasta ahora había dos espacios y un
// vestíbulo por encima: cada apertura aterrizaba en el Home de Strivo y desde
// dentro de un espacio la barra inferior devolvía ahí. Al quedar un solo
// espacio, el vestíbulo no tiene entre qué elegir y la barra no tiene a dónde
// volver: los dos se retiran y la app abre directamente en Hoy.
//
// Con ellos se va `espacioDe()`, que decidía a qué espacio pertenecía una ruta,
// y el atributo `data-space` que vestía el cromo según esa respuesta.
//
// **Cinco destinos repartidos en dos barras (26 ago 2026).** La cabecera lleva
// lo que se hace ahora —Hoy, Journal, Respiración— y la barra de abajo lo que ya
// pasó y tú —Historial, Tu perfil—. Las dos acompañan a todas las pantallas: con
// la de abajo solo en Hoy, llegar al Historial desde el Journal costaría dos
// toques donde antes costaba uno.
//
// **La profundidad se cuenta desde la raíz** (§4.3.2, regla 1): ningún destino
// pasa de tres toques.
//
// La sección activa no se persiste: es estado de interfaz, no un dato del
// usuario (SPEC_11 §5).
//
// `HashRouter` y no `BrowserRouter`: la app se sirve como PWA estática y, sin
// una regla de reescritura en el hospedaje, recargar en `/historial`
// devolvería un 404. El hash no depende de configuración que esta spec no toca.

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { momentoDe } from '@lib/timeSlot'

import ArranqueProvisional from '@/components/ArranqueProvisional'
import Onboarding from '@components/onboarding/Onboarding'
import Presentacion from '@components/presentacion/Presentacion'
import TransicionLuz, { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import NavStrivo from '@components/diario/NavStrivo'
import BarraInferior from '@components/shared/BarraInferior'
import { cruzarUmbral, umbralPendiente } from '@lib/umbralSesion'
import { presentacionPendiente } from '@/presentacion/entrada'
import { shared } from '@/lib/db'

import Respiracion from '@/breathing/Respiracion'
import Hoy from '@/pages/diario/Hoy'
import Perfil from '@components/perfil/Perfil'
import Journal from '@/pages/diario/Journal'
import Historial from '@/pages/diario/Historial'

/**
 * ¿Toca umbral en esta sesión?
 *
 * Es una **lectura pura**: pregunta y no gasta nada, así que puede correr al
 * construir el estado. Gastar el contador sí es un efecto, y va aparte.
 */
function hayUmbral() {
  return !prefiereMenosMovimiento() && umbralPendiente('diario')
}

/** La raíz: por dónde se entra a la app. */
const INICIO = '/hoy'

/** La sección de Respiración. La conoce quien enruta, no ella. */
const RUTA_RESPIRACION = '/respiracion'

// El momento que viste el cromo (manual §4.1) lo decide el reloj, y es la firma
// visual del producto: abrir a las 7:00 y a las 23:00 no se ve igual (§6.1,
// principio 2). La regla vive en `lib/timeSlot` porque el onboarding la
// necesita igual. No choca con RN-HOY-05, que habla del **tema de la pantalla
// Hoy** —ese lo manda su conmutador y sigue mandándolo—: esto viste el cromo,
// que es otra superficie.

export default function App() {
  return (
    <HashRouter>
      <ArranqueProvisional>
        {(uid, cambiarUid) => <Entrada uid={uid} onUid={cambiarUid} />}
      </ArranqueProvisional>
    </HashRouter>
  )
}

/**
 * Por dónde se entra: el onboarding la primera vez, la presentación de las
 * secciones justo detrás, y las cuatro secciones el resto de las veces.
 *
 * **La entrada tiene dos mitades y las dos se preguntan al árbol.** El
 * onboarding pregunta lo que la app necesita saber; la presentación cuenta lo
 * que la app tiene dentro. Las dos marcas viven en `shared/onboarding` y la
 * segunda no se muestra a quien ya había entrado antes de que existiera
 * (`presentacion/entrada.js`).
 *
 * **Lo decide el árbol de datos, no una marca en el navegador** (F-1B). La
 * respuesta la da `shared.onboardingPendiente`, que mira `completedAt` y solo
 * eso: saltarse los siete pasos también es haberlo hecho, así que contar pasos
 * dejaría fuera a quien entró de largo. Un árbol de antes de que el onboarding
 * existiera no trae esa marca y lo hace una vez, que es lo correcto: nunca lo
 * vio.
 *
 * **Mientras se averigua no hay rueda que gire** (RN-EST-02): la pantalla
 * espera en el fondo de la app, que es la forma final de lo que viene detrás.
 *
 * **Aquí no hay nada que decidir sobre el umbral.** El onboarding monta el
 * mismo que las secciones, con el mismo contador de sesión, así que si el video
 * se vio al empezar el recorrido no vuelve a salir al terminarlo: el contador
 * ya está gastado (RN-LU-MAN-02). Es el motivo de que ese contador viva en
 * `lib/umbralSesion` y no dentro de ninguna pantalla.
 */
function Entrada({ uid, onUid }) {
  const [pendiente, setPendiente] = useState(null)

  // La segunda mitad de la entrada: las cuatro tarjetas que cuentan qué hay
  // dentro. Es estado aparte del onboarding y no un tercer valor del mismo,
  // porque las dos mitades se responden con preguntas distintas y una de ellas
  // —la de aquí— también la decide lo que acaba de pasar en esta sesión.
  const [presentando, setPresentando] = useState(false)

  // La presentación ya se está yendo por la puerta grande. Lo único que cambia
  // aquí es que las secciones se montan **debajo** durante esos dos segundos:
  // así, cuando el desvanecido termina, lo que se ve no aparece —ya estaba—. Es
  // lo mismo que hace el umbral de entrada, y por el mismo motivo (RN-LU-MAN-02).
  const [saliendo, setSaliendo] = useState(false)

  // Lo que ya se decidió en esta sesión no lo reabre una lectura que llega
  // tarde. Al crear una cuenta en P7 el uid cambia y la lectura de arranque se
  // repite: sin esto, cerrar la presentación mientras esa segunda lectura está
  // en vuelo la volvería a abrir.
  const presentacionResuelta = useRef(false)

  useEffect(() => {
    let vigente = true
    // Las dos mitades se preguntan a la vez: son dos lecturas del mismo
    // documento local y ninguna depende de la respuesta de la otra.
    Promise.all([shared.onboardingPendiente(uid), presentacionPendiente(uid)])
      .then(([onboarding, presentacion]) => {
        if (!vigente) return
        setPendiente(onboarding)
        if (!presentacionResuelta.current) setPresentando(!onboarding && presentacion)
      })
      .catch(() => vigente && setPendiente(false))
    return () => {
      vigente = false
    }
  }, [uid])

  /** La presentación se da por pasada, se haya visto entera o se haya omitido. */
  const cerrarPresentacion = () => {
    presentacionResuelta.current = true
    setPresentando(false)
    setSaliendo(false)
  }

  // **Lo que se ve mientras se averigua es el tono del velo, no el papel de la
  // app** (26 ago). Detrás de esto viene el umbral, así que pintar crema aquí
  // metía un fotograma claro delante de un velo nocturno: un fogonazo a las
  // once. Es también lo que RN-EST-02 pide —la forma final, o nada— porque la
  // forma final de este instante es el velo.
  if (pendiente === null) {
    return (
      <div data-moment={momentoDe()} className="velo-transicion min-h-screen" aria-busy="true" />
    )
  }

  // ─── El único punto de enganche entre el onboarding y la app ───────────────
  //
  // Aquí es donde termina el recorrido de entrada y empieza el producto, y es
  // la única línea que hay que mover el día que el onboarding se sustituya por
  // otro: la presentación no la monta el recorrido, la monta quien decide por
  // dónde se entra. `onTerminado` entrega el uid definitivo —que puede no ser
  // con el que se empezó, si en P7 se creó una cuenta— y a partir de ahí lo que
  // toca es la presentación, no Hoy.
  if (pendiente) {
    return (
      <Onboarding
        uid={uid}
        onUid={onUid}
        onTerminado={(uidFinal) => {
          onUid(uidFinal)
          setPendiente(false)
          setPresentando(true)
        }}
      />
    )
  }

  // Las cuatro tarjetas, entre el recorrido y la primera vez que se llega a
  // Hoy. Quien ya había entrado antes de que esto existiera no pasa por aquí:
  // lo resuelve `presentacionPendiente`, que lo mira por la versión con la que
  // se terminó el recorrido y no por la ausencia de una marca que a esa persona
  // le falta por otro motivo.
  //
  // **Los dos últimos segundos se solapan.** Al tocar "Entrar a Strivo" las
  // secciones se montan aquí debajo y la presentación se desvanece encima, así
  // que la app no aparece: se descubre. Es la única vez que las dos cosas están
  // montadas a la vez, y dura lo que dura el desvanecido.
  if (presentando) {
    return (
      <>
        {saliendo && <Secciones uid={uid} />}
        <Presentacion
          uid={uid}
          onSaliendo={() => setSaliendo(true)}
          onTerminado={cerrarPresentacion}
        />
      </>
    )
  }

  return <Secciones uid={uid} />
}

function Secciones({ uid }) {
  // §4.3.2, regla 2 — La navegación se oculta durante la escritura activa y
  // las secuencias de cierre. Son estados de flujo, no de navegación.
  const [hideNav, setHideNav] = useState(false)

  // §C7.5 — El umbral de entrada. `true` mientras se cruza. Con "reducir
  // movimiento" no se muestra: entrar es inmediato.
  //
  // **Se decide al construir el estado y no en un efecto** (26 ago). Un efecto
  // corre después del primer pintado, así que el umbral llegaba un fotograma
  // tarde y ese fotograma era la pantalla de detrás asomando antes de que
  // empezara el video. Nace decidido; lo que queda para el efecto es gastar el
  // contador, que es lo único que cambia algo fuera de aquí.
  const [entrando, setEntrando] = useState(hayUmbral)

  // La sección que muestra Hoy, o `null` fuera de ella. No es un segundo origen
  // del tema —lo sigue eligiendo el conmutador (RN-HOY-05)—: es el eco que
  // necesita el cromo, porque los tokens viajan por el DOM.
  const [momentoHoy, setMomentoHoy] = useState(null)

  /**
   * §C7.5 — El umbral se cruza al abrir la app, una vez por sesión
   * (`lib/umbralSesion`). Antes se cruzaba al entrar al espacio desde el Home;
   * sin vestíbulo, abrir la app **es** entrar.
   *
   * Es el **mismo** contador que consulta la sección Mañana, y por eso abrir y
   * ver la mañana enseguida no encadena dos umbrales seguidos (RN-LU-MAN-01
   * y 02). Navegar entre secciones no lo vuelve a disparar.
   */
  useEffect(() => {
    if (entrando) cruzarUmbral('diario')
  }, [entrando])

  return (
    // `data-moment` lo decide el reloj y elige la paleta; `data-surface` sigue
    // eligiendo el color de texto: son dos capas distintas y no se pisan
    // (manual §4.8).
    <div
      data-moment={momentoDe()}
      // Se parecen y no son lo mismo, así que conviene el recordatorio: el de
      // arriba —`data-moment`, en inglés— lo decide el reloj y elige la paleta
      // de marca; este —`data-momento`— lo decide quien mira, con el conmutador
      // de Hoy. A las diez de la mañana con el conmutador en Noche valen cosas
      // distintas, y ese es justo el caso que hay que resolver bien. Sin
      // atributo fuera de Hoy.
      data-momento={momentoHoy ?? undefined}
      data-surface="light"
      className="flex min-h-screen flex-col bg-espacio font-sans text-on-surface"
    >
      {!hideNav && <NavStrivo />}

      {/* El hueco de la barra de abajo, que va fija: sin él, el último bloque
          de cualquier pantalla queda debajo de ella. Se retira con la barra
          durante la escritura y las secuencias de cierre, porque entonces no
          hay nada que esquivar (RN-NAV-04). */}
      <main className={clsx('flex-1', !hideNav && 'pb-24')}>
        <Routes>
          <Route path="/" element={<Navigate to={INICIO} replace />} />

          <Route
            path="/hoy"
            element={<Hoy uid={uid} onHideNav={setHideNav} onMomento={setMomentoHoy} />}
          />
          <Route path="/journal" element={<Journal uid={uid} onHideNav={setHideNav} />} />

          {/* La herramienta. Sus dos pantallas las resuelve su propio
              contenedor, que es quien sostiene la sesión entre ellas para que
              el botón atrás pause en vez de destruir (RN-RE-NAV-10). `base` y
              `salida` llegan por props: `breathing/` sigue sin nombrar al
              diario en ningún import, que es lo que la separación exige. */}
          <Route
            path="/respiracion/*"
            element={
              <Respiracion
                uid={uid}
                base={RUTA_RESPIRACION}
                salida={INICIO}
                onHideNav={setHideNav}
              />
            }
          />

          <Route path="/historial" element={<Historial uid={uid} />} />

          {/* Tu perfil: la gestión de la cuenta. No es una sección del diario
              —no escribe en `diario/`, solo en `shared/profile`— y por eso su
              componente no vive con las otras. */}
          <Route path="/perfil" element={<Perfil uid={uid} />} />

          {/* Cualquier ruta desconocida vuelve a Hoy. */}
          <Route path="*" element={<Navigate to={INICIO} replace />} />
        </Routes>
      </main>

      {/* El umbral va sobre la app ya montada: cuando la luz se va, lo de
          detrás ya está ahí (RN-LU-MAN-02).

          **`conVideo` y no `conFrase` desde el 25 de agosto de 2026.** Abrir la
          app es el único sitio donde se ve el video de apertura de la marca; la
          frase no desaparece del producto, sigue siendo el umbral de la mañana
          (`pages/diario/Hoy.jsx`), que es el otro montaje de esta misma pieza.
          Que la apertura de la app y la de la mañana lleven contenido distinto
          no las convierte en dos variantes: el umbral es el mismo componente,
          con el mismo temporizador y la misma superficie que lo salta.

          Con "reducir movimiento" no se monta ninguno de los dos, aquí ni en
          Hoy: entrar es inmediato y sin velo (RN-VIS-05). */}
      {/* Va después de `main` y no dentro: es cromo, como la cabecera, y las
          dos se van juntas cuando la pantalla pide flujo en vez de navegación
          (RN-NAV-04). */}
      {!hideNav && <BarraInferior />}

      {entrando && <TransicionLuz conVideo onTerminar={() => setEntrando(false)} />}
    </div>
  )
}
