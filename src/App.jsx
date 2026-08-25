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
// **La profundidad se cuenta desde la raíz** (§4.3.2, regla 1): ningún destino
// pasa de tres toques.
//
// La sección activa no se persiste: es estado de interfaz, no un dato del
// usuario (SPEC_11 §5).
//
// `HashRouter` y no `BrowserRouter`: la app se sirve como PWA estática y, sin
// una regla de reescritura en el hospedaje, recargar en `/lumia/historial`
// devolvería un 404. El hash no depende de configuración que esta spec no toca.

import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getTimeSlot } from '@lib/timeSlot'

import ArranqueProvisional from '@/components/ArranqueProvisional'
import TransicionLuz, { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import NavLumia from '@components/lumia/NavLumia'
import { cruzarUmbral, umbralPendiente } from '@lib/umbralSesion'

import Respiracion from '@/breathing/Respiracion'
import Hoy from '@/pages/lumia/Hoy'
import Journal from '@/pages/lumia/Journal'
import Historial from '@/pages/lumia/Historial'

/** La raíz: por dónde se entra a la app. */
const INICIO = '/lumia/hoy'

/** La sección de Respiración. La conoce quien enruta, no ella. */
const RUTA_RESPIRACION = '/lumia/respiracion'

/**
 * El momento que viste el cromo (manual §4.1).
 *
 * Lo decide el reloj, y es la firma visual del producto: abrir a las 7:00 y a
 * las 23:00 no se ve igual (§6.1, principio 2). No choca con RN-HOY-05, que
 * habla del **tema de la pantalla Hoy** —ese lo manda su conmutador y sigue
 * mandándolo—: esto viste el cromo, que es otra superficie.
 */
function momentoDe(franja = getTimeSlot()) {
  return franja === 'amanecer' || franja === 'dia' ? 'manana' : 'noche'
}

export default function App() {
  return (
    <HashRouter>
      <ArranqueProvisional>{(uid) => <Secciones uid={uid} />}</ArranqueProvisional>
    </HashRouter>
  )
}

function Secciones({ uid }) {
  // §4.3.2, regla 2 — La navegación se oculta durante la escritura activa y
  // las secuencias de cierre. Son estados de flujo, no de navegación.
  const [hideNav, setHideNav] = useState(false)

  // §C7.5 — El umbral de entrada. `true` mientras se cruza. Con "reducir
  // movimiento" no se muestra: entrar es inmediato.
  const [entrando, setEntrando] = useState(false)

  // La sección que muestra Hoy, o `null` fuera de ella. No es un segundo origen
  // del tema —lo sigue eligiendo el conmutador (RN-HOY-05)—: es el eco que
  // necesita el cromo, porque los tokens viajan por el DOM.
  const [momentoLumia, setMomentoLumia] = useState(null)

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
    if (prefiereMenosMovimiento() || !umbralPendiente('lumia')) return
    cruzarUmbral('lumia')
    setEntrando(true)
  }, [])

  return (
    // `data-moment` lo decide el reloj y elige la paleta; `data-surface` sigue
    // eligiendo el color de texto: son dos capas distintas y no se pisan
    // (manual §4.8).
    <div
      data-moment={momentoDe()}
      // `data-moment` lo decide el reloj y `data-lumia` lo decide quien mira:
      // no son lo mismo y por eso conviven. Sin atributo fuera de Hoy.
      data-lumia={momentoLumia ?? undefined}
      data-surface="light"
      className="flex min-h-screen flex-col bg-espacio font-sans text-on-surface"
    >
      {!hideNav && <NavLumia />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to={INICIO} replace />} />

          <Route
            path="/lumia/hoy"
            element={<Hoy uid={uid} onHideNav={setHideNav} onMomento={setMomentoLumia} />}
          />
          <Route path="/lumia/journal" element={<Journal uid={uid} onHideNav={setHideNav} />} />

          {/* La herramienta. Sus dos pantallas las resuelve su propio
              contenedor, que es quien sostiene la sesión entre ellas para que
              el botón atrás pause en vez de destruir (RN-RE-NAV-10). `base` y
              `salida` llegan por props: `breathing/` sigue sin nombrar al
              diario en ningún import, que es lo que la separación exige. */}
          <Route
            path="/lumia/respiracion/*"
            element={
              <Respiracion
                uid={uid}
                base={RUTA_RESPIRACION}
                salida={INICIO}
                onHideNav={setHideNav}
              />
            }
          />

          <Route path="/lumia/historial" element={<Historial uid={uid} />} />

          {/* Cualquier ruta desconocida vuelve a Hoy. */}
          <Route path="*" element={<Navigate to={INICIO} replace />} />
        </Routes>
      </main>

      {/* El umbral va sobre la app ya montada: cuando la luz se va, lo de
          detrás ya está ahí (RN-LU-MAN-02). */}
      {entrando && <TransicionLuz conFrase onTerminar={() => setEntrando(false)} />}
    </div>
  )
}
