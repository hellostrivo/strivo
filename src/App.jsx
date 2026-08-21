// src/App.jsx
// El Home de Strivo, los dos espacios y lo único que los conecta.
//
// **Revisión de SPEC_11 y de §C0.2/§C7.3, 19 ago 2026.** Antes se entraba
// directo a Lumia y la barra de abajo saltaba entre los dos espacios. Ahora
// cada apertura aterriza en el Home de Strivo, y desde dentro de un espacio la
// barra devuelve ahí: para cambiar de espacio se pasa por el vestíbulo. Strivo
// pasa a ser un destino navegable, que es exactamente lo que §C0.2 decía que no
// era; lo decidió el propietario del producto y está anotado en CLAUDE.md.
//
// **Ningún otro cruce.** Ni un enlace de contenido lleva de Lumia a Formia ni al
// revés (§C7.7.3), y cambiar de espacio no arrastra datos (RN-DB4-01). El Home
// nombra a los dos porque vive por encima de ellos, como `ArranqueProvisional`.
//
// **La profundidad se cuenta desde la raíz de cada espacio** (§4.3.2, regla 1).
// El Home es el vestíbulo y no cuenta: con él en la cuenta, el detalle de un
// hábito serían cuatro toques. Dentro de su espacio, ningún destino pasa de
// tres.
//
// La sección activa no se persiste: es estado de interfaz, no un dato del
// usuario (SPEC_11 §5).
//
// `HashRouter` y no `BrowserRouter`: la app se sirve como PWA estática y, sin
// una regla de reescritura en el hospedaje, recargar en `/formia/habitos`
// devolvería un 404. El hash no depende de configuración que esta spec no toca.

import { useEffect, useRef, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { getTimeSlot } from '@lib/timeSlot'

import ArranqueProvisional from '@/components/ArranqueProvisional'
import BarraStrivo from '@components/shared/BarraStrivo'
import TransicionLuz, { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import NavLumia from '@components/lumia/NavLumia'
import NavFormia from '@components/formia/NavFormia'
import { cruzarUmbral, umbralPendiente } from '@lib/umbralSesion'

import Home from '@/pages/Home'
import Respiracion from '@/breathing/Respiracion'
import Hoy from '@/pages/lumia/Hoy'
import Journal from '@/pages/lumia/Journal'
import Historial from '@/pages/lumia/Historial'
import Identidad from '@/pages/formia/Identidad'
import Habitos from '@/pages/formia/Habitos'
import Progreso from '@/pages/formia/Progreso'

/** La raíz de cada espacio. Por dónde se entra a la app es el Home, `/`. */
const INICIO = Object.freeze({ lumia: '/lumia/hoy', formia: '/formia/identidad' })

/**
 * El espacio de una ruta, o `null` si la ruta está por encima de los dos.
 *
 * **`/respiracion` devuelve `null` a propósito, y de ahí salen tres reglas de
 * SPEC_16 sin escribir una línea más:** no se monta la barra (RN-RE-NAV-12), no
 * se cruza el umbral de luz de Lumia (RN-RE-NAV-34) y el cromo se queda en los
 * neutros de Strivo. Respiración es una herramienta, no un tercer espacio, y la
 * función que decide qué es un espacio ya lo dice.
 */
function espacioDe(ruta) {
  if (ruta.startsWith('/formia')) return 'formia'
  if (ruta.startsWith('/lumia')) return 'lumia'
  return null
}

/**
 * El momento que viste al espacio (manual §4.1).
 *
 * Lo decide el reloj, y es la firma visual del producto: abrir a las 7:00 y a
 * las 23:00 no se ve igual (§6.1, principio 2). No choca con RN-HOY-05, que
 * habla del **tema de la pantalla Hoy** —ese lo manda su conmutador y sigue
 * mandándolo—: esto viste el cromo del espacio, que es otra superficie.
 */
function momentoDe(franja = getTimeSlot()) {
  return franja === 'amanecer' || franja === 'dia' ? 'manana' : 'noche'
}

export default function App() {
  return (
    <HashRouter>
      <ArranqueProvisional>{(uid) => <Espacios uid={uid} />}</ArranqueProvisional>
    </HashRouter>
  )
}

// EXPLORACIÓN (rama explora/lumia-am-amanecer) — `?paleta=a|b` monta una de las
// paletas alternas de Lumia·Mañana definidas en `styles/explora-lumia-am.css`.
// Sin el parámetro devuelve `undefined` y React no escribe el atributo, así que
// la app se pinta exactamente igual que en `main`. Se retira con la rama.
function paletaExplorada() {
  if (typeof window === 'undefined') return undefined
  // Con `HashRouter` el parámetro puede venir antes o después del `#`.
  const tras = window.location.hash.split('?')[1] ?? ''
  const params = new window.URLSearchParams(`${window.location.search.slice(1)}&${tras}`)
  const elegida = params.get('paleta')
  return ['a', 'b'].includes(elegida) ? elegida : undefined
}

function Espacios({ uid }) {
  // §4.3.2, regla 2 — La navegación se oculta durante la escritura activa y
  // las secuencias de cierre. Son estados de flujo, no de navegación.
  const [hideNav, setHideNav] = useState(false)

  // §C7.5 — El umbral de entrada al espacio. Guarda cuál se está cruzando, o
  // `null`. Con "reducir movimiento" no se muestra: entrar es inmediato.
  const [entrando, setEntrando] = useState(null)

  // La sección que muestra Hoy, o `null` fuera de ella. No es un segundo origen
  // del tema —lo sigue eligiendo el conmutador (RN-HOY-05)—: es el eco que
  // necesita el cromo. La barra inferior es hermana de `<main>`, así que sin
  // esto no hay forma de que herede los tokens de Lumia, que viajan por el DOM.
  const [momentoLumia, setMomentoLumia] = useState(null)

  const { pathname } = useLocation()
  const espacio = espacioDe(pathname)

  // La última sección visitada de cada espacio, para que volver a una pestaña
  // devuelva donde se estaba y no a su raíz (criterio 4). Vive en una
  // referencia y no en el modelo: no es un dato del usuario, y entre sesiones
  // se olvida a propósito (SPEC_11 §10).
  const ultima = useRef({ ...INICIO })

  useEffect(() => {
    // Solo se recuerdan secciones de verdad: el Home no es la sección de
    // ningún espacio y guardarlo dejaría su acceso apuntando a `/`.
    const actual = espacioDe(pathname)
    if (actual && pathname.startsWith(`/${actual}/`)) ultima.current[actual] = pathname
  }, [pathname])

  /**
   * §C7.5 — El umbral se cruza al entrar al espacio desde el Home, una vez por
   * sesión y por espacio (`lib/umbralSesion`). Al de Lumia le corresponde la
   * frase de apertura; el de Formia entra sin ella —placeholder, pendiente de
   * brief— y con su propia paleta, que le pone el tema.
   *
   * Es el **mismo** contador que consulta la sección Mañana, y por eso entrar
   * por el Home y ver la mañana enseguida no encadena dos umbrales seguidos
   * (RN-LU-MAN-01 y 02). Navegar entre secciones no lo vuelve a disparar: solo
   * cambia con el espacio.
   */
  useEffect(() => {
    const puedeCruzarse = !prefiereMenosMovimiento() && umbralPendiente(espacio)
    if (!espacio || !puedeCruzarse) return
    cruzarUmbral(espacio)
    setEntrando(espacio)
  }, [espacio])

  return (
    // `data-space` elige la paleta de marca y `data-surface` sigue eligiendo el
    // color de texto: son dos capas distintas y no se pisan (manual §4.8).
    // Cambiar de pestaña cambia el atributo, y con él la paleta, sin recargar.
    <div
      data-space={espacio}
      data-moment={momentoDe()}
      // `data-moment` lo decide el reloj y `data-lumia` lo decide quien mira:
      // no son lo mismo y por eso conviven. Sin atributo fuera de Hoy.
      data-lumia={momentoLumia ?? undefined}
      data-paleta={paletaExplorada()}
      data-surface="light"
      className="flex min-h-screen flex-col bg-espacio font-sans text-on-surface"
    >
      {/* El cromo del espacio no existe en el Home: allí no hay secciones que
          mostrar ni sitio al que volver. */}
      {espacio && !hideNav && (espacio === 'formia' ? <NavFormia /> : <NavLumia />)}

      <main className={clsx('flex-1', espacio && 'pb-24')}>
        <Routes>
          <Route path="/" element={<Home rutaDe={(id) => ultima.current[id] ?? INICIO[id]} />} />

          <Route
            path="/lumia/hoy"
            element={<Hoy uid={uid} onHideNav={setHideNav} onMomento={setMomentoLumia} />}
          />
          <Route path="/lumia/journal" element={<Journal uid={uid} onHideNav={setHideNav} />} />
          <Route path="/lumia/historial" element={<Historial uid={uid} />} />

          <Route path="/formia/identidad" element={<Identidad uid={uid} />} />
          <Route path="/formia/habitos" element={<Habitos uid={uid} />} />
          <Route path="/formia/progreso" element={<Progreso uid={uid} />} />

          {/* La herramienta transversal. Sus dos pantallas las resuelve su
              propio contenedor, que es quien sostiene la sesión entre ellas
              para que el botón atrás pause en vez de destruir (RN-RE-NAV-10). */}
          <Route path="/respiracion/*" element={<Respiracion uid={uid} />} />

          {/* Cualquier ruta desconocida vuelve al Home, no a un espacio: elegir
              es de quien abre la app. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* El umbral va sobre la app ya montada: cuando la luz se va, lo de
          detrás ya está ahí (RN-LU-MAN-02). */}
      {entrando && (
        <TransicionLuz conFrase={entrando === 'lumia'} onTerminar={() => setEntrando(null)} />
      )}

      {/* Devuelve al Home. No salta al otro espacio: para eso se pasa por él. */}
      {espacio && !hideNav && <BarraStrivo />}
    </div>
  )
}
