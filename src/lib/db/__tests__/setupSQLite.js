// El proyecto `sqlite` de `vitest.workspace.js` (SPEC_17B, criterio 2): antes
// de cada archivo, el almacén vigente es una base SQLite nueva sobre
// `node:sqlite`, con el mismo adaptador que la app nativa. Las pruebas que
// reinician la base con `resetLocalDB` reciben otra nueva cada vez.
import { usarAdaptador } from '../almacen.js'
import { almacenSQLiteDePruebas } from './dobleDeAlmacen.js'

usarAdaptador((await almacenSQLiteDePruebas()).adaptador)
