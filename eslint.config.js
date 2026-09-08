// eslint.config.js
// Configuración plana (ESLint 9).
//
// Su razón de ser es de arquitectura, no de estilo: la separación entre las
// partes de la app deja de depender de que quien programa se acuerde. Un
// import que cruce la línea rompe el lint, y el lint corre antes de cada commit.
//
// El mapa que custodia tiene tres partes y un territorio neutral:
//
//   compartido   `components/shared/`   lo usan todas las secciones
//   diario       `diario/`              Hoy, Journal, Respiración, Historial
//   Respiración  `breathing/`           la herramienta
//   onboarding   `onboarding/`          cómo se entra, una vez y antes de todo
//   presentación `presentacion/`        qué hay dentro, una vez y justo detrás
//   neutral      `lib/respiracion/`     el motor de ritmo, que no conoce a nadie
//
// Antes el mapa tenía tres partes, porque había dos espacios que no podían
// leerse entre sí. Al quedar un solo producto, esa regla se queda sin objeto y
// desaparece: no hay un segundo espacio del que separarse. Lo que sigue siendo
// cierto —y es lo que vigila esta configuración— es que Respiración no lee el
// diario, que el diario no lee Respiración, y que lo compartido no conoce ni a
// uno ni a otra.
//
// **El renombrado del paso 9 está cerrado.** Este archivo era uno de los sitios
// donde más se notaba, porque las rutas y los nombres de import se escriben
// literales y no los resuelve nadie: si una lista se queda con el nombre viejo,
// la regla deja de morder sin que nada falle, que es la forma más silenciosa de
// perder una barrera de arquitectura. Se comprueba a mano cuando se toca.

// Los patrones se comparan contra la cadena del import tal cual se escribe
// (`'./diario.js'`, `'../../lib/db/diario.js'`, `'@/lib/db'`), no contra la ruta
// resuelta. Por eso cada forma se lista de manera explícita.
const DIARIO_MODULES = ['./diario', './diario.js', '**/diario', '**/diario.js', '**/diario/**']

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

// F-1B — El onboarding es un tercer territorio, y no una sección más. Corre
// **antes** de la app, una sola vez, y todo lo que escribe vive en `shared/`:
// nombre, género, identidad, horarios, preferencias y su propio expediente. No
// tiene por qué leer el diario y no puede leer Respiración, así que la regla se
// escribe entera en vez de dejarla a la memoria de quien programe.
//
// Es también lo que impide que se cuele aquí el modelo de identidad por áreas
// del alcance retirado: no hay de dónde importarlo.
const ONBOARDING =
  'El onboarding corre antes de la app y solo escribe en shared/: no puede ' +
  'depender de diario/ ni de breathing/. Lo que necesite de una sección, que ' +
  'llegue por props desde App.jsx.'

const PRESENTACION =
  'La presentación de las secciones cuenta lo que hay dentro, no lo monta: no ' +
  'puede depender de diario/ ni de breathing/. Su tarjeta es un nombre, una ' +
  'frase del copy y un dibujo propio.'

const COMPARTIDO =
  'Un componente de components/shared/ lo usan todas las secciones y el ' +
  'onboarding: no puede depender de diario/ ni de breathing/. Lo que necesite, ' +
  'que llegue por props (RN-LU-RESP-02).'

const DB_ENTRYPOINT = ['@/lib/db', '**/lib/db', '**/lib/db/index.js', './index.js', '../index.js']

const DIARIO_FILES = [
  'src/lib/db/diario.js',
  'src/diario/**/*.{js,jsx}',
  'src/pages/diario/**/*.{js,jsx}',
  'src/components/diario/**/*.{js,jsx}',
]

const ONBOARDING_FILES = [
  'src/onboarding/**/*.{js,jsx}',
  'src/components/onboarding/**/*.{js,jsx}',
]

// La presentación de las secciones es la otra mitad de la entrada: corre una
// vez, justo detrás del onboarding, y **cuenta** lo que hay en las secciones
// sin montar ninguna. Le toca la misma regla y por el mismo motivo: en cuanto
// importara algo del diario o de Respiración para dibujar su tarjeta, dejaría
// de ser la puerta y pasaría a ser una sección que se cuela delante de las
// otras. Lo que sabe de cada sección es un nombre y una frase, y los dos vienen
// del copy.
const PRESENTACION_FILES = [
  'src/presentacion/**/*.{js,jsx}',
  'src/components/presentacion/**/*.{js,jsx}',
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
            { group: DB_ENTRYPOINT, importNames: ['diario'], message: RN_RESPIRACION },
          ],
        },
      ],
    },
  },

  // ─── Lo compartido no conoce ninguna sección ────────────────────────────────
  // `components/shared/` es lo que usan todas las secciones y el onboarding a la
  // vez. Un import a `diario/` o a `breathing/` desde aquí lo convertiría en un
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
            { group: DB_ENTRYPOINT, importNames: ['diario'], message: COMPARTIDO },
          ],
        },
      ],
    },
  },

  // ─── El onboarding no es de ninguna sección ─────────────────────────────────
  {
    files: ONBOARDING_FILES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: DIARIO_MODULES, message: ONBOARDING },
            { group: BREATHING_MODULES, message: ONBOARDING },
            { group: DB_ENTRYPOINT, importNames: ['diario'], message: ONBOARDING },
          ],
        },
      ],
    },
  },

  // ─── La presentación tampoco es de ninguna sección ──────────────────────────
  {
    files: PRESENTACION_FILES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: DIARIO_MODULES, message: PRESENTACION },
            { group: BREATHING_MODULES, message: PRESENTACION },
            { group: DB_ENTRYPOINT, importNames: ['diario'], message: PRESENTACION },
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
            { group: DB_ENTRYPOINT, importNames: ['diario'], message: RN_RESPIRACION },
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
