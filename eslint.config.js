// eslint.config.js
// Configuración plana (ESLint 9).
//
// Su razón de ser en Fase 1 es RN-DB4-01: la separación Lumia/Formia deja de
// depender de que quien programa se acuerde. Un import que cruce la línea
// rompe el lint, y el lint corre antes de cada commit.

const RN_DB4_01 =
  'RN-DB4-01: Lumia no lee formia/ y Formia no lee lumia/. ' +
  'Si de verdad hace falta cruzarlos, va en una capa por encima (Fase 2, §C4), ' +
  'nunca dentro de un espacio.'

// Los patrones se comparan contra la cadena del import tal cual se escribe
// (`'./formia.js'`, `'../../lib/db/formia.js'`, `'@/lib/db'`), no contra la
// ruta resuelta. Por eso cada forma se lista de manera explícita.
const FORMIA_MODULES = [
  './formia',
  './formia.js',
  '**/formia',
  '**/formia.js',
  '**/formia/**',
]
const LUMIA_MODULES = ['./lumia', './lumia.js', '**/lumia', '**/lumia.js', '**/lumia/**']
const DB_ENTRYPOINT = ['@/lib/db', '**/lib/db', '**/lib/db/index.js', './index.js', '../index.js']

const LUMIA_FILES = [
  'src/lib/db/lumia.js',
  'src/lumia/**/*.{js,jsx}',
  'src/pages/lumia/**/*.{js,jsx}',
  'src/components/lumia/**/*.{js,jsx}',
]

const FORMIA_FILES = [
  'src/lib/db/formia.js',
  'src/formia/**/*.{js,jsx}',
  'src/pages/formia/**/*.{js,jsx}',
  'src/components/formia/**/*.{js,jsx}',
]

// Solo se activan las dos reglas que enseñan a `no-unused-vars` a ver el JSX.
// El resto del conjunto de eslint-plugin-react se queda fuera a propósito:
// esta configuración existe para RN-DB4-01, no para opinar sobre React.
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

  // ─── RN-DB4-01, un sentido ──────────────────────────────────────────────────
  {
    files: LUMIA_FILES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: FORMIA_MODULES, message: RN_DB4_01 },
            { group: DB_ENTRYPOINT, importNames: ['formia'], message: RN_DB4_01 },
          ],
        },
      ],
    },
  },

  // ─── RN-DB4-01, el otro ─────────────────────────────────────────────────────
  {
    files: FORMIA_FILES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: LUMIA_MODULES, message: RN_DB4_01 },
            { group: DB_ENTRYPOINT, importNames: ['lumia'], message: RN_DB4_01 },
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
