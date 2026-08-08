// src/App.jsx
// Punto de entrada de la app Strivo
// Navegación de 3 pestañas: Hoy · Journal · Tú (§4.3.1, Blueprint v3)

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'

// Páginas (rutas)
// En Fase 0 son stubs; se van completando en Fase 1
import HoyPage        from '@/pages/HoyPage'
import JournalPage    from '@/pages/JournalPage'
import HabitosModulo  from '@/pages/habitos/HabitosModulo'
import TuPage         from '@/pages/TuPage'
import FondoHorario   from '@components/strivo/FondoHorario'
import AperturaSesion from '@components/strivo/AperturaSesion'

// Onboarding (el flujo completo vive en OnboardingFlow)
import OnboardingFlow from '@/pages/onboarding/OnboardingFlow'
import { isOnboardingComplete, markOnboardingComplete } from '@lib/onboardingStorage'
import { getUserProfile } from '@lib/db'
import { getCurrentUserId } from '@lib/user'
import { setGender } from '@lib/genderStore'
import { fondoHorario } from '@lib/gradienteHorario'
import { siguienteFrase } from '@lib/frases'
import { debeMostrarApertura, ultimaApertura, anotarApertura, AUSENCIA_MINIMA } from '@lib/sesion'

// "Tú" se queda en el extremo: es el cajón de perfil y ajustes (§19.3)
const TABS = [
  { id: 'hoy',     label: copy.nav.hoy,     icon: SunMoonIcon },
  { id: 'journal', label: copy.nav.journal, icon: PenIcon     },
  { id: 'habitos', label: copy.nav.habitos, icon: LeafIcon    },
  { id: 'tu',      label: copy.nav.tu,      icon: CircleIcon  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('hoy')
  const [hideNav, setHideNav]     = useState(false)  // ocultar en rituales / escritura activa
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete())

  // La frase del umbral (§17). null = no hay apertura en pantalla.
  const [fraseApertura, setFraseApertura] = useState(null)
  const vieneDelOnboarding = useRef(false)
  const ocultaDesde        = useRef(null)

  // El copy de toda la app habla en el género del perfil (§2.4). Se lee al
  // arrancar y otra vez al terminar el onboarding, cuando el perfil ya existe.
  //
  // Mientras el onboarding está en marcha manda el borrador (lo escribe la
  // propia pantalla P2A): la lectura del perfil es asíncrona y llegaría después,
  // pisando con un null lo que la persona acaba de contestar.
  //
  // Si no hay perfil todavía, o si la lectura falla, no se toca nada: el modo
  // arranca en neutro, así que nunca hay pantalla sin copy que mostrar.
  useEffect(() => {
    if (showOnboarding) return undefined

    let vigente = true
    getUserProfile(getCurrentUserId())
      .then(perfil => { if (vigente && perfil) setGender(perfil.gender) })
      .catch(error => {
        console.warn('[Strivo] El modo de lenguaje se queda en neutro:', error)
      })
    return () => { vigente = false }
  }, [showOnboarding])

  // La apertura de sesión se decide con las reglas de @lib/sesion: en frío sí,
  // al cambiar de pestaña no, al volver de una interrupción breve tampoco, y
  // como mucho una vez por hora. Justo después del onboarding tampoco: P11 ya
  // es un cierre y dos ceremonias seguidas se devalúan.
  useEffect(() => {
    if (showOnboarding) return undefined

    let vigente = true

    const evaluar = async () => {
      const ahora = Date.now()
      const debe  = debeMostrarApertura({
        ahora,
        ultimaVez: await ultimaApertura(),
        ocultaDesde: ocultaDesde.current,
        vieneDelOnboarding: vieneDelOnboarding.current,
      })
      vieneDelOnboarding.current = false
      if (!debe || !vigente) return

      const frase = await siguienteFrase('apertura')
      if (!vigente || !frase) return
      setFraseApertura(frase)
      await anotarApertura(ahora)
    }

    const alCambiarVisibilidad = () => {
      if (document.hidden) {
        ocultaDesde.current = Date.now()
        return
      }
      // Solo se vuelve a evaluar si la ausencia fue larga: entrar y salir de la
      // app cada dos minutos no puede convertir el umbral en un peaje.
      if (ocultaDesde.current && Date.now() - ocultaDesde.current >= AUSENCIA_MINIMA) {
        evaluar().catch(() => {})
      }
    }

    evaluar().catch(error => {
      console.warn('[Strivo] La apertura de sesión se queda para la próxima:', error)
    })
    document.addEventListener('visibilitychange', alCambiarVisibilidad)

    return () => {
      vigente = false
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    }
  }, [showOnboarding])

  // Primera vez: el onboarding ocupa toda la pantalla, sin barra de pestañas.
  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          markOnboardingComplete()
          vieneDelOnboarding.current = true
          setShowOnboarding(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen text-ink font-sans flex flex-col">
      {/* Una sola capa de fondo para toda la app: cruzar de pestaña no la
          desmonta, así que el degradado nunca parpadea (§18.3.4). */}
      <FondoHorario />

      {/* Contenido principal. Solo "Hoy" se apoya en el degradado; las demás
          traen su propia superficie y se ven exactamente como antes. */}
      <main
        className={clsx(
          'flex-1 overflow-y-auto pb-20',
          activeTab !== 'hoy' && 'bg-paper',
        )}
      >
        {activeTab === 'hoy'     && <HoyPage     onHideNav={setHideNav} />}
        {activeTab === 'journal' && <JournalPage onHideNav={setHideNav} />}
        {activeTab === 'habitos' && <HabitosModulo />}
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
          role="tablist"
          aria-label={copy.nav.label}
        >
          {TABS.map(tab => {
            const Icon    = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
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
                  'text-xs',
                  // En escala de grises la activa se sigue distinguiendo: pesa
                  // más y su icono va relleno (§19.6).
                  isActive ? 'font-bold opacity-100' : 'font-medium opacity-60',
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

      {/* El umbral de cada entrada, sobre el mismo fondo que ya está puesto */}
      {fraseApertura && (
        <AperturaSesion
          frase={fraseApertura}
          sobreOscuro={fondoHorario().sobreOscuro}
          onEnd={() => setFraseApertura(null)}
        />
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

// Hábitos: una hoja que crece. Mismo grosor de trazo y mismo tamaño óptico que
// las otras tres; se rellena cuando la pestaña está activa (§19.3).
function LeafIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2.5 : 1.8}>
      <path
        d="M20 4c0 8-5 12-11 12a5 5 0 010-10c4 0 7-1 11-2z"
        fill={filled ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
      <path d="M4 20c2-4 5-6 9-8" strokeLinecap="round" />
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
