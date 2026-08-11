// src/App.jsx
// Punto de entrada de la app Strivo
// Navegación de 3 pestañas: Hoy · Journal · Tú (§4.3.1, Blueprint v3)

import { useState } from 'react'
import { clsx } from 'clsx'

// Páginas (rutas)
import Hoy       from '@/pages/lumia/Hoy'
import Journal   from '@/pages/lumia/Journal'
import Historial from '@/pages/lumia/Historial'

// ⚠ PROVISIONAL — SPEC_03 y SPEC_04 construyen los dos espacios de Formia
// (Identidad y Hábitos), pero la barra de dos espacios ("Lumia · Reflexión" /
// "Formia · Acción") es SPEC_11 y no se adelanta. Mientras tanto, la pestaña
// "Tú" del stub de Fase 0 sirve de entrada, con un conmutador mínimo para
// llegar a las dos. SPEC_11 sustituye esto entero.
import TransicionLuz, { prefiereMenosMovimiento } from '@/components/shared/TransicionLuz'

import SesionProvisional from '@/components/SesionProvisional'
import Identidad         from '@/pages/formia/Identidad'
import Habitos           from '@/pages/formia/Habitos'
import Progreso          from '@/pages/formia/Progreso'

const FORMIA_PROVISIONAL = [
  { id: 'identidad', label: 'Identidad', render: (uid) => <Identidad uid={uid} /> },
  { id: 'habitos',   label: 'Hábitos',   render: (uid) => <Habitos   uid={uid} /> },
  { id: 'progreso',  label: 'Progreso',  render: (uid) => <Progreso  uid={uid} /> },
]

// ⚠ PROVISIONAL — mismo andamio, ahora para las dos superficies de Lumia que
// construye SPEC_07. La barra de SPEC_11 les dará su sitio propio.
const LUMIA_PROVISIONAL = [
  { id: 'journal',   label: 'Journal',   render: (uid, onHideNav) => <Journal uid={uid} onHideNav={onHideNav} /> },
  { id: 'historial', label: 'Historial', render: (uid) => <Historial uid={uid} /> },
]

const TABS = [
  { id: 'hoy',     label: 'Hoy',     icon: SunMoonIcon },
  { id: 'journal', label: 'Journal', icon: PenIcon     },
  { id: 'tu',      label: 'Tú',      icon: CircleIcon  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('hoy')
  const [hideNav, setHideNav]     = useState(false)  // ocultar en rituales / escritura activa
  const [formiaTab, setFormiaTab] = useState('identidad')  // ⚠ provisional, ver arriba
  const [lumiaTab,  setLumiaTab]  = useState('journal')    // ⚠ provisional, ver arriba

  // §C7.5 — El umbral de entrada a la app. Con "reducir movimiento" no se
  // muestra: "inmediata" leído literal es que entrar sea inmediato, y una
  // pantalla quieta cinco segundos no es menos movimiento, es solo esperar.
  const [entrando, setEntrando] = useState(() => !prefiereMenosMovimiento())

  return (
    <div data-surface="light" className="min-h-screen bg-paper text-ink font-sans flex flex-col">
      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'hoy'     && (
          <SesionProvisional>
            {(uid) => <Hoy uid={uid} onHideNav={setHideNav} />}
          </SesionProvisional>
        )}
        {activeTab === 'journal' && (
          <SesionProvisional>
            {(uid) => (
              <>
                {!hideNav && (
                  <Conmutador
                    secciones={LUMIA_PROVISIONAL}
                    activa={lumiaTab}
                    onCambiar={setLumiaTab}
                  />
                )}
                {LUMIA_PROVISIONAL.find(s => s.id === lumiaTab).render(uid, setHideNav)}
              </>
            )}
          </SesionProvisional>
        )}
        {activeTab === 'tu'      && (
          <SesionProvisional>
            {(uid) => (
              <>
                <Conmutador
                  secciones={FORMIA_PROVISIONAL}
                  activa={formiaTab}
                  onCambiar={setFormiaTab}
                />
                {FORMIA_PROVISIONAL.find(seccion => seccion.id === formiaTab).render(uid)}
              </>
            )}
          </SesionProvisional>
        )}
      </main>

      {/* La misma pieza que usa la entrada a la mañana (RN-LU-MAN-01). Va sobre
          la app ya montada: cuando la luz se va, lo de detrás ya está ahí. Es un
          umbral, no una pantalla de carga. */}
      {entrando && <TransicionLuz onTerminar={() => setEntrando(false)} />}

      {/* Barra de navegación inferior (se oculta en rituales y escritura activa) */}
      {!hideNav && (
        <nav
          className={clsx(
            'fixed bottom-0 left-0 right-0 z-50',
            'bg-paper/95 backdrop-blur-sm',
            'border-t border-border',
            'flex items-center',
            'pb-safe', // respeta safe area de iOS
          )}
          aria-label="Navegación principal"
        >
          {TABS.map(tab => {
            const Icon    = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'flex-1 flex flex-col items-center justify-center gap-1',
                  'py-3 min-h-touch',
                  'transition-colors duration-260 ease-smooth',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
                  'motion-reduce:transition-none',
                  isActive ? 'text-ink' : 'text-ink/40',
                )}
              >
                <Icon
                  className={clsx(
                    'w-5 h-5 transition-transform duration-260',
                    isActive && 'scale-110',
                    'motion-reduce:transition-none',
                  )}
                  filled={isActive}
                  aria-hidden="true"
                />
                <span className={clsx(
                  'text-xs font-medium',
                  isActive ? 'opacity-100' : 'opacity-60',
                )}>
                  {tab.label}
                </span>
                {/* Indicador activo */}
                {isActive && (
                  <span
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-ink"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}

// ⚠ PROVISIONAL — El conmutador que sostiene los dos andamios de arriba, en un
// solo sitio para que no haya dos copias que mantener. SPEC_11 se lo lleva.
function Conmutador({ secciones, activa, onCambiar }) {
  return (
    <div className="flex gap-2 px-5 pt-6">
      {secciones.map(seccion => (
        <button
          key={seccion.id}
          type="button"
          onClick={() => onCambiar(seccion.id)}
          aria-pressed={activa === seccion.id}
          className={clsx(
            'rounded-full border px-4 py-2 min-h-touch-sm text-base font-medium text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
            activa === seccion.id ? 'border-ink bg-surface' : 'border-border bg-paper',
          )}
        >
          {seccion.label}
        </button>
      ))}
    </div>
  )
}

// ─── Íconos SVG (inline, sin dependencias externas) ───────────────────────────
function SunMoonIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2.5 : 1.8}>
      <circle cx="12" cy="12" r="4" fill={filled ? 'currentColor' : 'none'} />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        strokeLinecap="round" />
    </svg>
  )
}

function PenIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2.5 : 1.8}>
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CircleIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2.5 : 1.8}>
      <circle cx="12" cy="8" r="4" fill={filled ? 'currentColor' : 'none'} />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  )
}
