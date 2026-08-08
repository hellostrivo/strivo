/** @type {import('tailwindcss').Config} */
// Tokens de diseño de Strivo (§6.3–6.9, Blueprint v3)
// Fuente canónica: src/tokens/design-tokens.json
// Aquí están integrados en Tailwind para uso directo con clases

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // Modo oscuro manual (controlado por app según hora del día)
  theme: {
    extend: {
      // ─── Colores ─────────────────────────────────────────────────────────
      colors: {
        // Semánticos base
        ink:   '#241E33',  // Texto principal
        paper: '#FBF8F4',  // Fondo claro
        night: '#191428',  // Fondo oscuro (índigo violáceo, NO puro negro)

        // Tinta derivada de la superficie (§6.5). `text-surface-fg` en vez de
        // `text-ink` cuando el bloque puede acabar sobre el degradado nocturno:
        // la clase lee --color-text, que lo fija el data-surface más cercano.
        'surface-fg': {
          DEFAULT: 'var(--color-text)',
          muted:   'var(--color-text-muted)',
          // Las cuatro tintas absolutas, por si hace falta forzar una
          'on-light':       'var(--color-text-on-light)',
          'on-light-muted': 'var(--color-text-on-light-muted)',
          'on-dark':        'var(--color-text-on-dark)',
          'on-dark-muted':  'var(--color-text-on-dark-muted)',
        },

        // Acentos
        amber: '#E5A25C',
        plum:  '#8B6BA8',
        sage:  '#7E9E86',
        clay:  '#C9836B',
        mist:  '#93A9C4',

        // Áreas de identidad (cada área tiene su color)
        area: {
          salud:       '#7E9E86', // sage
          trabajo:     '#93A9C4', // mist
          relaciones:  '#C9836B', // clay
          finanzas:    '#E5A25C', // amber
          espiritual:  '#8B6BA8', // plum
          personal:    '#D9CFC4',
          creatividad: '#FFE4C4',
          otra:        '#D9CFC4',
        },

        // Estados (NUNCA rojo puro para errores/vacíos)
        state: {
          hecho:       '#7E9E86',
          pendiente:   '#D9CFC4',
          disabled:    '#E8E0D8',
          error:       '#C9836B', // clay, no rojo
        },

        // Superficies y bordes
        surface: {
          DEFAULT: '#FFFEF7',
          subtle:  '#F5F0E8',
          muted:   '#EDE7DC',
          // La tarjeta del tema vigente de Hoy (§20). Cambia con el botón
          // Mañana/Noche; los componentes no saben cuál está puesto.
          hoy:     'var(--hoy-surface)',
        },
        border: {
          DEFAULT: '#D9CFC4',
          subtle:  '#EDE7DC',
          hoy:     'var(--hoy-border)',
        },
      },

      // ─── Tipografía ──────────────────────────────────────────────────────
      fontFamily: {
        display: ['Fraunces', 'serif'],    // Títulos grandes, emocionales
        sans:    ['Satoshi', 'system-ui', '-apple-system', 'sans-serif'], // UI
      },
      fontSize: {
        // Escala base 16px × 1.25
        'xs':   ['12px', { lineHeight: '1.5' }],
        'sm':   ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.5' }],
        'md':   ['20px', { lineHeight: '1.4' }],
        'lg':   ['25px', { lineHeight: '1.3' }],
        'xl':   ['32px', { lineHeight: '1.2' }],
        '2xl':  ['40px', { lineHeight: '1.2' }],
        '3xl':  ['50px', { lineHeight: '1.1' }],
        '4xl':  ['64px', { lineHeight: '1.0' }],
      },

      // ─── Espaciado (base 4px) ─────────────────────────────────────────────
      spacing: {
        '0.5': '2px',
        '1':   '4px',
        '1.5': '6px',
        '2':   '8px',
        '2.5': '10px',
        '3':   '12px',
        '4':   '16px',
        '5':   '20px',
        '6':   '24px',
        '8':   '32px',
        '10':  '40px',
        '12':  '48px',
        '14':  '56px',
        '16':  '64px',
        '20':  '80px',
        '24':  '96px',
      },

      // ─── Border radius (cálido, mínimo 10px) ─────────────────────────────
      borderRadius: {
        'none': '0px',
        'sm':   '10px',
        'DEFAULT': '16px',
        'md':   '16px',
        'lg':   '24px',
        'xl':   '32px',
        'full': '9999px',
      },

      // ─── Sombras (elevación, nunca drop-shadow pesada) ───────────────────
      boxShadow: {
        'elev-1': '0px 1px 3px rgba(36, 30, 51, 0.12)',
        'elev-2': '0px 3px 6px rgba(36, 30, 51, 0.16)',
        'elev-4': '0px 4px 12px rgba(36, 30, 51, 0.20)',
        'elev-8': '0px 8px 24px rgba(36, 30, 51, 0.24)',
      },

      // ─── Motion (más lento que el estándar, intencional) ─────────────────
      transitionDuration: {
        '120': '120ms',
        '180': '180ms',
        '200': '200ms',
        '260': '260ms',
        '280': '280ms',
        '420': '420ms',
        '700': '700ms',
        '900': '900ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ─── Animaciones personalizadas ───────────────────────────────────────
      keyframes: {
        // Trazo al marcar hábito (260ms)
        'check-draw': {
          '0%':   { 'stroke-dashoffset': '40' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        // Recorrido de luz en cierre nocturno (900ms)
        'light-sweep': {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '50%':  { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        // Fade-in suave para bloques que aparecen
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Respiración guiada del ritual: un ciclo completo de 6s (§5.5, R1)
        'breathe': {
          '0%':   { transform: 'scale(0.82)', opacity: '0.55' },
          '50%':  { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(0.82)', opacity: '0.55' },
        },
        // Escala de chip al tocar
        'chip-press': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        // Apertura de Strivo — núcleo de luz (§3.3 del documento de cambios).
        // Un solo recorrido de 5s: aparece (800→1400), se expande (1400→2800),
        // se contrae (2800→4200) y se va (4200→5000). Solo transform y opacity.
        'apertura-nucleo': {
          '0%,16%': { transform: 'scale(0.85)', opacity: '0' },
          '28%':    { transform: 'scale(1)',    opacity: '0.9' },
          '56%':    { transform: 'scale(1.32)', opacity: '1' },
          '84%':    { transform: 'scale(1)',    opacity: '1' },
          '100%':   { transform: 'scale(1)',    opacity: '0' },
        },
        // La palabra entra a los 1800ms y se queda quieta mientras el núcleo respira
        'apertura-palabra': {
          '0%,36%': { opacity: '0',    transform: 'translateY(8px)' },
          '52%':    { opacity: '0.75', transform: 'translateY(0)' },
          '84%':    { opacity: '0.75', transform: 'translateY(0)' },
          '100%':   { opacity: '0',    transform: 'translateY(0)' },
        },
        // Movimiento reducido: la misma palabra, sin escala y en 400ms
        'apertura-palabra-quieta': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '0.75' },
        },
        // Apertura de sesión (§17): una luz que se enciende, se queda y se va
        // expandiéndose apenas. Un solo recorrido de 3.4s.
        'sesion-luz': {
          '0%':   { opacity: '0',    transform: 'scale(0.9)' },
          '21%':  { opacity: '0.85', transform: 'scale(1)' },
          '85%':  { opacity: '0.85', transform: 'scale(1)' },
          '100%': { opacity: '0',    transform: 'scale(1.06)' },
        },
        'sesion-frase': {
          '0%,15%': { opacity: '0', transform: 'translateY(10px)' },
          '35%':    { opacity: '1', transform: 'translateY(0)' },
          '85%':    { opacity: '1', transform: 'translateY(0)' },
          '100%':   { opacity: '0', transform: 'translateY(0)' },
        },
        // Con movimiento reducido: sin escala ni desplazamiento, 2.4s
        'sesion-luz-quieta': {
          '0%':     { opacity: '0' },
          '13%':    { opacity: '0.85' },
          '87%':    { opacity: '0.85' },
          '100%':   { opacity: '0' },
        },
        'sesion-frase-quieta': {
          '0%':   { opacity: '0' },
          '13%':  { opacity: '1' },
          '87%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        // Sugerencias de gratitud que aparecen tras 5s sin escribir (§21.3)
        'sugerencia-entra': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // La capa oscura que se retira para dejar ver el degradado horario
        'apertura-fondo': {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
        // P4B: al tocar una área atenuada, la instrucción del límite se hace
        // notar. Ni error, ni aviso, ni sacudida (§8.5).
        'pulso-limite': {
          '0%,100%': { opacity: '0.55' },
          '50%':     { opacity: '1' },
        },
        // T-4B: la frase entra, se queda y se va, dentro de los 3s de la
        // transición. Un solo recorrido, como el núcleo de la apertura (§9.2).
        'transicion-frase': {
          '0%,10%': { opacity: '0', transform: 'translateY(12px)' },
          '30%':    { opacity: '1', transform: 'translateY(0)' },
          '87%':    { opacity: '1', transform: 'translateY(0)' },
          '100%':   { opacity: '0', transform: 'translateY(0)' },
        },
        // Movimiento reducido: la misma frase, sin desplazamiento y en 2.3s
        'transicion-frase-quieta': {
          '0%':   { opacity: '0' },
          '11%':  { opacity: '1' },
          '89%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'check-draw':  'check-draw 260ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'light-sweep': 'light-sweep 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'fade-up':     'fade-up 420ms cubic-bezier(0, 0, 0.2, 1) both',
        'chip-press':  'chip-press 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'breathe':     'breathe 6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        // Excepción autorizada al rango 120–900ms (§3.3): es una descompresión,
        // no una transición de interfaz.
        'apertura-nucleo':          'apertura-nucleo 5000ms cubic-bezier(0.37, 0, 0.63, 1) forwards',
        'apertura-palabra':         'apertura-palabra 5000ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'apertura-palabra-quieta':  'apertura-palabra-quieta 400ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'apertura-fondo':           'apertura-fondo 800ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'pulso-limite':             'pulso-limite 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        'transicion-frase':         'transicion-frase 3000ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'transicion-frase-quieta':  'transicion-frase-quieta 2300ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'sesion-luz':               'sesion-luz 3400ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'sesion-frase':             'sesion-frase 3400ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'sesion-luz-quieta':        'sesion-luz-quieta 2400ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'sesion-frase-quieta':      'sesion-frase-quieta 2400ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'sugerencia-entra':         'sugerencia-entra 250ms cubic-bezier(0, 0, 0.2, 1) both',
      },

      // ─── Tamaños mínimos para toque (WCAG 2.2) ───────────────────────────
      minHeight: {
        'touch': '56px',  // mín para elementos tocables
        'touch-sm': '48px',
      },
      minWidth: {
        'touch': '56px',
      },
    },
  },
  plugins: [],
}
