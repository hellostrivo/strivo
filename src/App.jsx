// src/App.jsx
// Punto de entrada de la app Strivo
// Navegación de 3 pestañas: Hoy · Journal · Tú (§4.3.1, Blueprint v3)

import { useState } from 'react'
import { clsx } from 'clsx'

// Páginas (rutas)
// En Fase 0 son stubs; se van completando en Fase 1
import HoyPage     from '@/pages/HoyPage'
import JournalPage from '@/pages/JournalPage'
import TuPage      from '@/pages/TuPage'

const TABS = [
  { id: 'hoy',     label: 'Hoy',     icon: SunMoonIcon },
  { id: 'journal', label: 'Journal', icon: PenIcon     },
  { id: 'tu',      label: 'Tú',      icon: CircleIcon  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('hoy')
  const [hideNav, setHideNav]     = useState(false)  // ocultar en rituales / escritura activa

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col">
      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'hoy'     && <HoyPage     onHideNav={setHideNav} />}
        {activeTab === 'journal' && <JournalPage onHideNav={setHideNav} />}
        {activeTab === 'tu'      && <TuPage />}
      </main>

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
