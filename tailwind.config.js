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

        // Aquí vivían ocho tonos rotulados "Áreas de identidad", uno por área
        // del modelo de identidad de tres niveles. Se retiran en F-1B: ese
        // modelo se replegó con su alcance, la identidad central es hoy una
        // frase que no se reparte, y ninguna clase del árbol los usaba. Era el
        // último rastro de las áreas en los tokens, y un color con nombre de
        // área es una invitación a que el concepto vuelva por donde salió.

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
      // UNA SOLA FAMILIA: Inter, para las tres marcas (manual §5.1). `display`
      // apunta a la misma a propósito — la jerarquía se hace con peso, no con
      // una segunda familia. La clase `.font-display` de globals.css es la que
      // pone ese peso.
      fontFamily: {
        display: ['Inter Variable', 'system-ui', '-apple-system', 'sans-serif'],
        sans:    ['Inter Variable', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Escala base 16px × 1.25, expresada en `rem`.
      // **En rem y no en px**: con píxeles absolutos, subir el cuerpo de letra
      // del sistema no cambiaba nada y §6.14 pide escalar hasta el 200 %.
      // Medido antes del cambio: con la raíz a 32px, el texto seguía a 14px.
      fontSize: {
        'xs':   ['0.75rem',   { lineHeight: '1.5' }],   // 12px
        'sm':   ['0.875rem',  { lineHeight: '1.5' }],   // 14px
        'base': ['1rem',      { lineHeight: '1.5' }],   // 16px
        'md':   ['1.25rem',   { lineHeight: '1.4' }],   // 20px
        'lg':   ['1.5625rem', { lineHeight: '1.3' }],   // 25px
        'xl':   ['2rem',      { lineHeight: '1.2' }],   // 32px
        '2xl':  ['2.5rem',    { lineHeight: '1.2' }],   // 40px
        '3xl':  ['3.125rem',  { lineHeight: '1.1' }],   // 50px
        '4xl':  ['4rem',      { lineHeight: '1.0' }],   // 64px
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
        // Escala de chip al tocar
        'chip-press': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'check-draw':  'check-draw 260ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'light-sweep': 'light-sweep 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'fade-up':     'fade-up 420ms cubic-bezier(0, 0, 0.2, 1) both',
        'chip-press':  'chip-press 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      // ─── Tamaños mínimos para toque (WCAG 2.2) ───────────────────────────
      // **Siguen en px, y es deliberado.** Un objetivo táctil es el tamaño de
      // un dedo, no el de una letra: no debe encoger porque alguien baje el
      // cuerpo de texto del sistema.
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
