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
        },
        border: {
          DEFAULT: '#D9CFC4',
          subtle:  '#EDE7DC',
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
        '200': '200ms',
        '260': '260ms',
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
        // La capa oscura que se retira para dejar ver el degradado horario
        'apertura-fondo': {
          '0%':   { opacity: '1' },
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
