// Dos proyectos, la misma configuración (SPEC_17B, criterio 2).
//
//   indexeddb — la suite entera, como siempre: el almacén de la web.
//   sqlite    — la suite entera otra vez, con el adaptador de la app nativa
//               sobre `node:sqlite` (Node 22.13 o más). Sin cambiar lo que
//               comprueban las pruebas: solo cambia el almacén vigente.
//
// Del segundo quedan fuera las pruebas que montan su propio almacén: la de
// IndexedDB por dentro (`conexion.test.js`) y las de SQLite, la migración y el
// arranque, que ya corren en el primero. Los casos que miran IndexedDB por
// dentro llevan `it.skipIf(EN_SQLITE)` y su equivalente en SQLite.

const PROPIAS_DE_UN_ALMACEN = [
  'src/lib/db/__tests__/conexion.test.js',
  'src/lib/db/__tests__/adaptadorSQLite.test.js',
  'src/lib/db/__tests__/migracionSQLite.test.js',
  'src/lib/db/__tests__/almacen.test.js',
  'src/lib/db/__tests__/clavesDelTelefono.test.js',
  'src/lib/db/__tests__/diagnosticoAlmacen.test.js',
]

export default [
  {
    extends: './vitest.config.js',
    test: { name: 'indexeddb' },
  },
  {
    extends: './vitest.config.js',
    test: {
      name: 'sqlite',
      exclude: ['**/node_modules/**', ...PROPIAS_DE_UN_ALMACEN],
      env: { STRIVO_ALMACEN: 'sqlite' },
      setupFiles: ['./src/lib/db/__tests__/setupSQLite.js'],
    },
  },
]
