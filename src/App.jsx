// src/App.jsx
// Los dos espacios de Strivo y lo único que los conecta (§C7.3, SPEC_11).
//
// **La barra es el único cruce.** Ningún enlace de contenido lleva de Lumia a
// Formia ni al revés (§C7.7.3): el puente de Fase 0 se retiró y no se sustituyó
// por ninguno. Cada espacio carga lo suyo y cambiar de pestaña no arrastra
// datos (RN-DB4-01).
//
// **Dos pestañas, ni una más.** No hay tercera de Strivo: es la marca madre y
// nadie la abre para hacer algo (§C0.2). Profundidad máxima de tres toques
// desde cualquier punto (§4.3.2, regla 1).
//
// **Se entra siempre por Lumia** y la pestaña activa no se persiste: es estado
// de interfaz, no un dato del usuario (SPEC_11 §5).
//
// `HashRouter` y no `BrowserRouter`: la app se sirve como PWA estática y, sin
// una regla de reescritura en el hospedaje, recargar en `/formia/habitos`
// devolvería un 404. El hash no depende de configuración que esta spec no toca.

import { useEffect, useRef, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { getTimeSlot } from '@lib/timeSlot'

import ArranqueProvisional from '@/components/ArranqueProvisional'
import BarraEspacios from '@components/shared/BarraEspacios'
import TransicionLuz, { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import NavLumia from '@components/lumia/NavLumia'
import NavFormia from '@components/formia/NavFormia'

import Hoy from '@/pages/lumia/Hoy'
import Journal from '@/pages/lumia/Journal'
import Historial from '@/pages/lumia/Historial'
import Identidad from '@/pages/formia/Identidad'
import Habitos from '@/pages/formia/Habitos'
import Progreso from '@/pages/formia/Progreso'

/** La raíz de cada espacio, y por dónde se entra a la app. */
const INICIO = Object.freeze({ lumia: '/lumia/hoy', formia: '/formia/identidad' })

function espacioDe(ruta) {
  return ruta.startsWith('/formia') ? 'formia' : 'lumia'
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

function Espacios({ uid }) {
  // §4.3.2, regla 2 — La navegación se oculta durante rituales, escritura
  // activa y secuencias de cierre. Son estados de flujo, no de navegación.
  const [hideNav, setHideNav] = useState(false)

  // §C7.5 — El umbral de entrada a la app. Con "reducir movimiento" no se
  // muestra: entrar es inmediato.
  const [entrando, setEntrando] = useState(() => !prefiereMenosMovimiento())

  const { pathname } = useLocation()
  const espacio = espacioDe(pathname)

  // La última sección visitada de cada espacio, para que volver a una pestaña
  // devuelva donde se estaba y no a su raíz (criterio 4). Vive en una
  // referencia y no en el modelo: no es un dato del usuario, y entre sesiones
  // se olvida a propósito (SPEC_11 §10).
  const ultima = useRef({ ...INICIO })

  useEffect(() => {
    // Solo se recuerdan secciones de verdad. Al abrir la app, la ruta pasa un
    // instante por `/` antes de que el comodín redirija a Lumia; guardar ese
    // paso dejaría la pestaña de Lumia apuntando a una ruta que no existe y sin
    // marcarse activa, que es justo lo que pasaba antes de este guardia.
    const actual = espacioDe(pathname)
    if (pathname.startsWith(`/${actual}/`)) ultima.current[actual] = pathname
  }, [pathname])

  return (
    // `data-space` elige la paleta de marca y `data-surface` sigue eligiendo el
    // color de texto: son dos capas distintas y no se pisan (manual §4.8).
    // Cambiar de pestaña cambia el atributo, y con él la paleta, sin recargar.
    <div
      data-space={espacio}
      data-moment={momentoDe()}
      data-surface="light"
      className="flex min-h-screen flex-col bg-espacio font-sans text-on-surface"
    >
      {!hideNav && (espacio === 'formia' ? <NavFormia /> : <NavLumia />)}

      <main className="flex-1 pb-24">
        <Routes>
          <Route path="/lumia/hoy" element={<Hoy uid={uid} onHideNav={setHideNav} />} />
          <Route path="/lumia/journal" element={<Journal uid={uid} onHideNav={setHideNav} />} />
          <Route path="/lumia/historial" element={<Historial uid={uid} />} />

          <Route path="/formia/identidad" element={<Identidad uid={uid} />} />
          <Route path="/formia/habitos" element={<Habitos uid={uid} />} />
          <Route path="/formia/progreso" element={<Progreso uid={uid} />} />

          {/* Cualquier otra ruta entra por Lumia, incluida la raíz. */}
          <Route path="*" element={<Navigate to={INICIO.lumia} replace />} />
        </Routes>
      </main>

      {/* El umbral va sobre la app ya montada: cuando la luz se va, lo de
          detrás ya está ahí (RN-LU-MAN-02). */}
      {entrando && <TransicionLuz onTerminar={() => setEntrando(false)} />}

      {!hideNav && <BarraEspacios rutaDe={(id) => ultima.current[id] ?? INICIO[id]} />}
    </div>
  )
}
