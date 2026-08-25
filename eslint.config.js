// eslint.config.js
// Configuración plana (ESLint 9).
//
// Su razón de ser es de arquitectura, no de estilo: la separación entre las
// partes de la app deja de depender de que quien programa se acuerde. Un
// import que cruce la línea rompe el lint, y el lint corre antes de cada commit.
//
// El mapa que custodia tiene dos partes y un territorio neutral:
//
//   compartido   `components/shared/`   lo usan todas las secciones
//   diario       `lumia/`               Hoy, Journal, Historial
//   Respiración  `breathing/`           la herramienta
//   neutral      `lib/respiracion/`     el motor de ritmo, que no conoce a nadie
//
// Antes el mapa tenía tres partes, porque había dos espacios que no podían
// leerse entre sí. Al quedar un solo producto, esa regla se queda sin objeto y
// desaparece: no hay un segundo espacio del que separarse. Lo que sigue siendo
// cierto —y es lo que vigila esta configuración— es que Respiración no lee el
// diario, que el diario no lee Respiración, y que lo compartido no conoce ni a
// uno ni a otra.
//
// Nota para el renombrado pendiente: `lumia/` pasa a llamarse `diario/`. Este
// archivo es uno de los sitios donde ese cambio se nota, porque las rutas se
// escriben literales.

// Los patrones se comparan contra la cadena del import tal cual se escribe
// (`'./lumia.js'`, `'../../lib/db/lumia.js'`, `'@/lib/db'`), no contra la ruta
// resuelta. Por eso cada forma se lista de manera explícita.
const DIARIO_MODULES = ['./lumia', './lumia.js', '**/lumia', '**/lumia.js', '**/lumia/**']

const BREATHING_MODULES = [
  './breathing',
  './breathing.js',
  '**/breathing',
  '**/breathing.js',
  '**/breathing/**',
]

// RN-RE-DAT-09. Respiración es una sección del producto, no una capa por encima
// ni por debajo del diario: se entra, se usa, se sale. Lo único que comparte con
// el diario es el motor de ritmo, y esa es toda la razón de que el motor viva en
// `lib/respiracion/` y no dentro de ninguna de las dos. Lo demás —dónde volver al
// salir, con qué color pintarse— llega por props desde `App.jsx`, que es quien
// enruta y el único que sabe dónde vive cada cosa.
const RN_RESPIRACION =
  'RN-RE-DAT-09: Respiración no lee el diario y el diario no lee Respiración. ' +
  'Lo que comparten es el motor de ritmo, y por eso vive en lib/respiracion/. ' +
  'Lo demás llega por props desde App.jsx.'

const COMPARTIDO =
  'Un componente de components/shared/ lo usan todas las secciones y el ' +
  'onboarding: no puede depender de lumia/ ni de breathing/. Lo que necesite, ' +
  'que llegue por props (RN-LU-RESP-02).'

const DB_ENTRYPOINT = ['@/lib/db', '**/lib/db', '**/lib/db/index.js', './index.js', '../index.js']

const DIARIO_FILES = [
  'src/lib/db/lumia.js',
  'src/lumia/**/*.{js,jsx}',
  'src/pages/lumia/**/*.{js,jsx}',
  'src/components/lumia/**/*.{js,jsx}',
]

const BREATHING_FILES = [
  'src/breathing/**/*.{js,jsx}',
  'src/pages/breathing/**/*.{js,jsx}',
  'src/components/breathing/**/*.{js,jsx}',
]

// El motor no conoce a nadie: ni el diario ni la propia Respiración.
// Si algún día necesitara el catálogo de patrones, dejaría de poder usarlo el diario.
const NEUTRAL_FILES = ['src/lib/respiracion/**/*.js']

// Solo se activan las dos reglas que enseñan a `no-unused-vars` a ver el JSX.
// El resto del conjunto de eslint-plugin-react se queda fuera a propósito:
// esta configuración existe para custodiar la separación, no para opinar sobre React.
import react from 'eslint-plugin-react'

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  console: 'readonly',
  crypto: 'readonly',
  indexedDB: 'readonly',
  localStorage: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  fetch: 'readonly',
  IDBKeyRange: 'readonly',
  structuredClone: 'readonly',
  // La derivación del PIN codifica a bytes antes de pasar por PBKDF2 (§7.7.1).
  TextEncoder: 'readonly',
  // El ejercicio de respiración: un solo reloj para el círculo y para el tono.
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
}

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'dev-dist/**', 'scripts/**'],
  },

  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: browserGlobals,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { react },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
    },
  },

  // ─── El diario no lee Respiración ───────────────────────────────────────────
  {
    files: DIARIO_FILES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [{ group: BREATHING_MODULES, message: RN_RESPIRACION }],
        },
      ],
    },
  },

  // ─── Respiración no lee el diario ───────────────────────────────────────────
  {
    files: BREATHING_FILES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: DIARIO_MODULES, message: RN_RESPIRACION },
            { group: DB_ENTRYPOINT, importNames: ['lumia'], message: RN_RESPIRACION },
          ],
        },
      ],
    },
  },

  // ─── Lo compartido no conoce ninguna sección ────────────────────────────────
  // `components/shared/` es lo que usan todas las secciones y el onboarding a la
  // vez. Un import a `lumia/` o a `breathing/` desde aquí lo convertiría en un
  // componente de esa sección disfrazado de compartido, que es la forma en que
  // se pierden los componentes únicos (RN-LU-RESP-02).
  {
    files: ['src/components/shared/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: DIARIO_MODULES, message: COMPARTIDO },
            { group: BREATHING_MODULES, message: COMPARTIDO },
            { group: DB_ENTRYPOINT, importNames: ['lumia'], message: COMPARTIDO },
          ],
        },
      ],
    },
  },

  // ─── El motor de ritmo es territorio neutral ────────────────────────────────
  {
    files: NEUTRAL_FILES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: [...DIARIO_MODULES, ...BREATHING_MODULES], message: RN_RESPIRACION },
            { group: DB_ENTRYPOINT, importNames: ['lumia'], message: RN_RESPIRACION },
          ],
        },
      ],
    },
  },

  {
    files: ['src/**/__tests__/**/*.js'],
    languageOptions: {
      globals: { ...browserGlobals, process: 'readonly', global: 'readonly' },
    },
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]
