// src/lib/db/adaptadorSQLite.js
// El almacén de la app nativa sobre SQLite (SPEC_17B).
//
// **Es el único archivo de `src/` que importa el plugin, y lo importa bajo
// demanda** (`cargarPlugin`), como `credencialNativa.js`: en la web y en las
// pruebas no se carga nunca. Hay una prueba que recorre `src/` para
// comprobarlo. El plugin es nuestro (`plugins/strivo-almacen/`), sobre el SQLite
// del sistema, y tiene cuatro métodos: `abrir`, `existe`, `ejecutar` (un lote
// en una transacción) y `consultar`.
//
// **Mismo contrato que `adaptadorIndexedDB.js`.** Las mismas filas
// (`{ path, uid, collection, id, data, updatedAt }`), el mismo orden en las
// lecturas (por la clave del índice y después por `path`) y la misma cola con
// su `seq`, su `rev` y sus `attempts`. El contenido se guarda como JSON en
// texto, sin normalizar (SPEC_17 §6, corregida por §2.4 de la instrucción).
//
// **Un cerrojo hace pasar todas las llamadas de una en una, también las
// lecturas** (DP-17B.8). IndexedDB daba eso gratis: dentro de una transacción
// nadie se colaba. Aquí cada llamada cruza el puente nativo, y entre dos
// `await` podría colarse otra: una lectura entre el leer y el escribir de
// `fusionar` partiría de una copia vieja. Las operaciones de varias sentencias
// van además en un solo lote, que el plugin ejecuta como una transacción.
//
// **Ningún texto de la persona entra en el SQL**: todo va en `valores`, que el
// plugin enlaza como parámetros. Las sentencias de este archivo son literales.
//
// **El plugin nunca sale suelto de una promesa** (SPEC_21.2): es un Proxy de
// Capacitor que también contesta a `then`. `cargarPlugin` lo devuelve envuelto.

/** Versión del esquema. Los cambios futuros se hacen leyendo `meta.esquema`. */
export const ESQUEMA = 1

/**
 * Las tablas, tal como se aprobaron en el reporte previo (DP-17B.3): imitan la
 * fila real y no la de SPEC_17 §6. `fecha` es `data.date` cuando es una cadena,
 * para el índice equivalente a `byCollectionDate`.
 */
export const DDL = Object.freeze([
  `CREATE TABLE IF NOT EXISTS registros (
     path TEXT PRIMARY KEY NOT NULL,
     uid TEXT NOT NULL,
     collection TEXT NOT NULL,
     id TEXT,
     data TEXT NOT NULL,
     updatedAt TEXT,
     fecha TEXT
   ) WITHOUT ROWID`,
  'CREATE INDEX IF NOT EXISTS registros_por_uid ON registros (uid, path)',
  'CREATE INDEX IF NOT EXISTS registros_por_coleccion ON registros (uid, collection, path)',
  'CREATE INDEX IF NOT EXISTS registros_por_fecha ON registros (uid, collection, fecha, path)',
  `CREATE TABLE IF NOT EXISTS cola (
     seq INTEGER PRIMARY KEY AUTOINCREMENT,
     path TEXT NOT NULL UNIQUE,
     uid TEXT NOT NULL,
     op TEXT NOT NULL,
     data TEXT,
     attempts INTEGER NOT NULL DEFAULT 0,
     rev INTEGER,
     enqueuedAt TEXT
   )`,
  'CREATE INDEX IF NOT EXISTS cola_por_uid ON cola (uid, seq)',
  'CREATE TABLE IF NOT EXISTS meta (clave TEXT PRIMARY KEY NOT NULL, valor TEXT NOT NULL) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS claves (clave TEXT PRIMARY KEY NOT NULL, valor TEXT NOT NULL) WITHOUT ROWID',
])

/** Carga el plugin y lo devuelve **envuelto**, nunca suelto (ver la cabecera). */
export async function cargarPlugin() {
  const { StrivoAlmacen } = await import('strivo-almacen')
  return { plugin: StrivoAlmacen }
}

// ─── La conexión, con su cerrojo ──────────────────────────────────────────────

/** Lo que cruza el puente: `undefined` no existe al otro lado; se dice `null`. */
function valoresParaElPuente(valores = []) {
  return valores.map((valor) => (valor === undefined ? null : valor))
}

/**
 * Envuelve el plugin con un cerrojo. `enExclusiva(fn)` ejecuta `fn` cuando
 * todo lo anterior terminó, y `fn` recibe `ejecutar` y `consultar` **sin**
 * cerrojo para hacer varias llamadas seguidas sin que nadie se cuele entre
 * ellas. Llamar a `enExclusiva` desde dentro de `fn` se quedaría esperando a sí
 * mismo: por eso las funciones internas reciben la conexión cruda.
 */
export function crearConexion(plugin) {
  let cola = Promise.resolve()

  const crudo = {
    async abrir() {
      return (await plugin.abrir()).creada === true
    },
    async existe() {
      return (await plugin.existe()).existe === true
    },
    async ejecutar(sentencias) {
      const lote = sentencias.map(({ sql, valores }) => ({
        sql,
        valores: valoresParaElPuente(valores),
      }))
      return (await plugin.ejecutar({ sentencias: lote })).cambios
    },
    async consultar(sql, valores = []) {
      return (await plugin.consultar({ sql, valores: valoresParaElPuente(valores) })).filas
    },
  }

  function enExclusiva(fn) {
    const turno = cola.then(() => fn(crudo))
    // El siguiente espera a que este termine, salga bien o mal.
    cola = turno.catch(() => {})
    return turno
  }

  return { enExclusiva }
}

// ─── Filas ────────────────────────────────────────────────────────────────────

function fechaDe(data) {
  return typeof data?.date === 'string' ? data.date : null
}

function comoFila(registro) {
  return {
    path: registro.path,
    uid: registro.uid,
    collection: registro.collection,
    id: registro.id ?? null,
    data: JSON.parse(registro.data),
    updatedAt: registro.updatedAt ?? undefined,
  }
}

function comoEntrada(fila) {
  const entrada = {
    seq: Number(fila.seq),
    uid: fila.uid,
    path: fila.path,
    op: fila.op,
    data: fila.data === null || fila.data === undefined ? null : JSON.parse(fila.data),
    attempts: Number(fila.attempts),
    enqueuedAt: fila.enqueuedAt ?? undefined,
  }
  // Una entrada de antes de SPEC_31 no trae `rev`: sigue sin traerla.
  if (fila.rev !== null && fila.rev !== undefined) entrada.rev = Number(fila.rev)
  return entrada
}

const PONER = `INSERT OR REPLACE INTO registros (path, uid, collection, id, data, updatedAt, fecha)
               VALUES (?, ?, ?, ?, ?, ?, ?)`

function sentenciaPoner(fila) {
  return {
    sql: PONER,
    valores: [
      fila.path,
      fila.uid,
      fila.collection,
      fila.id ?? null,
      JSON.stringify(fila.data),
      fila.updatedAt ?? null,
      fechaDe(fila.data),
    ],
  }
}

const POR_INDICE = Object.freeze({
  byUser: {
    sql: 'SELECT * FROM registros WHERE uid = ? ORDER BY path',
    valores: (uid) => [uid],
  },
  byCollection: {
    sql: 'SELECT * FROM registros WHERE uid = ? AND collection = ? ORDER BY path',
    valores: ([uid, collection]) => [uid, collection],
  },
  byCollectionDate: {
    sql: 'SELECT * FROM registros WHERE uid = ? AND collection = ? AND fecha = ? ORDER BY path',
    valores: ([uid, collection, fecha]) => [uid, collection, fecha],
  },
})

// ─── El adaptador ─────────────────────────────────────────────────────────────

/**
 * @param {{enExclusiva: Function}} conexion - de `crearConexion`, ya abierta y con el esquema.
 */
export function crearAdaptadorSQLite(conexion) {
  const { enExclusiva } = conexion

  async function leerCruda(c, path) {
    const [fila] = await c.consultar('SELECT * FROM registros WHERE path = ?', [path])
    return fila ? comoFila(fila) : null
  }

  return Object.freeze({
    nombre: 'sqlite',

    leer: (path) => enExclusiva((c) => leerCruda(c, path)),

    async leerIndice(indice, clave) {
      const consulta = POR_INDICE[indice]
      const filas = await enExclusiva((c) => c.consultar(consulta.sql, consulta.valores(clave)))
      return filas.map(comoFila)
    },

    poner: (fila) =>
      enExclusiva(async (c) => {
        await c.ejecutar([sentenciaPoner(fila)])
      }),

    // Leer y escribir dentro del cerrojo: nadie se cuela entre los dos.
    fusionar: ({ path, uid, collection, id, updatedAt }, patch) =>
      enExclusiva(async (c) => {
        const actual = await leerCruda(c, path)
        const data = { ...(actual?.data ?? {}), ...patch }
        await c.ejecutar([sentenciaPoner({ path, uid, collection, id, data, updatedAt })])
        return data
      }),

    // Una sola sentencia: escribió si cambió una fila.
    ponerSiAusente: (fila) =>
      enExclusiva(async (c) => {
        const { valores } = sentenciaPoner(fila)
        const [cambios] = await c.ejecutar([
          {
            sql: `INSERT INTO registros (path, uid, collection, id, data, updatedAt, fecha)
                  VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(path) DO NOTHING`,
            valores,
          },
        ])
        return cambios > 0
      }),

    quitar: (path) =>
      enExclusiva(async (c) => {
        await c.ejecutar([{ sql: 'DELETE FROM registros WHERE path = ?', valores: [path] }])
      }),

    // Lectura y decisiones en JS, y después un solo lote: una transacción.
    mudarFilas: (desde, hacia, decidir) =>
      enExclusiva(async (c) => {
        const prefijo = `users/${desde}/`
        const origen = (await c.consultar(POR_INDICE.byUser.sql, [desde])).map(comoFila)
        const destinos = new Map(
          (await c.consultar(POR_INDICE.byUser.sql, [hacia])).map((f) => [f.path, comoFila(f)]),
        )

        const lote = []
        const mudadas = []
        const completadas = []
        let conservados = 0

        for (const fila of origen) {
          if (!fila.path.startsWith(prefijo)) continue
          const destino = `users/${hacia}/${fila.path.slice(prefijo.length)}`
          const existente = destinos.get(destino) ?? null
          const decision = decidir(fila, existente)
          if (!decision.muda) {
            conservados += 1
            if (decision.completar) {
              lote.push(sentenciaPoner({ ...existente, data: decision.completar }))
              completadas.push({
                path: destino,
                collection: existente.collection,
                data: decision.completar,
              })
            }
            continue
          }
          lote.push(sentenciaPoner({ ...fila, path: destino, uid: hacia, data: decision.data }))
          lote.push({ sql: 'DELETE FROM registros WHERE path = ?', valores: [fila.path] })
          mudadas.push({
            desde: fila.path,
            path: destino,
            collection: fila.collection,
            data: decision.data,
          })
        }

        if (lote.length > 0) await c.ejecutar(lote)
        return { mudadas, completadas, conservados }
      }),

    // Los dos almacenes en un lote; cuántas filas borró cada sentencia es la cuenta.
    borrarUid: (uid) =>
      enExclusiva(async (c) => {
        const [registros, cola] = await c.ejecutar([
          { sql: 'DELETE FROM registros WHERE uid = ?', valores: [uid] },
          { sql: 'DELETE FROM cola WHERE uid = ?', valores: [uid] },
        ])
        return { registros, cola }
      }),

    // Una sola sentencia: la entrada de la ruta conserva su `seq` y sus
    // `attempts`, y su revisión sube (H-1). Sin revisión previa, empieza en 1.
    encolar: ({ uid, path, op, data, enqueuedAt }) =>
      enExclusiva(async (c) => {
        await c.ejecutar([
          {
            sql: `INSERT INTO cola (uid, path, op, data, attempts, rev, enqueuedAt)
                  VALUES (?, ?, ?, ?, 0, 1, ?)
                  ON CONFLICT(path) DO UPDATE SET
                    uid = excluded.uid,
                    op = excluded.op,
                    data = excluded.data,
                    rev = COALESCE(cola.rev, 0) + 1,
                    enqueuedAt = excluded.enqueuedAt`,
            valores: [uid, path, op, data === null ? null : JSON.stringify(data), enqueuedAt],
          },
        ])
      }),

    async listarCola(uid = null) {
      const filas = await enExclusiva((c) =>
        uid
          ? c.consultar('SELECT * FROM cola WHERE uid = ? ORDER BY seq', [uid])
          : c.consultar('SELECT * FROM cola ORDER BY seq'),
      )
      return filas.map(comoEntrada)
    },

    sacar: (seq) =>
      enExclusiva(async (c) => {
        await c.ejecutar([{ sql: 'DELETE FROM cola WHERE seq = ?', valores: [seq] }])
      }),

    // Solo si la revisión no cambió. `IS` y no `=`: una entrada sin revisión
    // coincide con otra sin revisión (las de antes de SPEC_31).
    sacarSiIgual: (enviada) =>
      enExclusiva(async (c) => {
        const [cambios] = await c.ejecutar([
          {
            sql: 'DELETE FROM cola WHERE seq = ? AND rev IS ?',
            valores: [enviada.seq, enviada.rev ?? null],
          },
        ])
        return cambios > 0
      }),

    marcarIntento: (seq) =>
      enExclusiva(async (c) => {
        await c.ejecutar([
          { sql: 'UPDATE cola SET attempts = attempts + 1 WHERE seq = ?', valores: [seq] },
        ])
      }),

    contar: () =>
      enExclusiva(async (c) => {
        const [{ n: registros }] = await c.consultar('SELECT COUNT(*) AS n FROM registros')
        const [{ n: porSubir }] = await c.consultar('SELECT COUNT(*) AS n FROM cola')
        return { registros: Number(registros), porSubir: Number(porSubir) }
      }),

    // La base no se cierra nunca: una sola conexión para toda la vida de la app.
    async cerrar() {},
  })
}

// ─── Meta y claves ────────────────────────────────────────────────────────────

/** Crea las tablas si no están y anota la versión del esquema. */
export function crearEsquema(conexion) {
  return conexion.enExclusiva(async (c) => {
    await c.ejecutar([
      ...DDL.map((sql) => ({ sql, valores: [] })),
      {
        sql: `INSERT INTO meta (clave, valor) VALUES ('esquema', ?) ON CONFLICT(clave) DO NOTHING`,
        valores: [String(ESQUEMA)],
      },
    ])
  })
}

/** La copia de las claves del teléfono, para `clavesDelTelefono.js`. */
export function copiaDeClaves(conexion) {
  return {
    leer: () =>
      conexion.enExclusiva(async (c) =>
        (await c.consultar('SELECT clave, valor FROM claves ORDER BY clave')).map((f) => [
          f.clave,
          f.valor,
        ]),
      ),
    reemplazar: (pares) =>
      conexion.enExclusiva(async (c) => {
        await c.ejecutar([
          { sql: 'DELETE FROM claves', valores: [] },
          ...pares.map(([clave, valor]) => ({
            sql: 'INSERT INTO claves (clave, valor) VALUES (?, ?)',
            valores: [clave, valor],
          })),
        ])
      }),
    escribir: ({ clave, valor }) =>
      conexion.enExclusiva(async (c) => {
        await c.ejecutar([
          valor === null
            ? { sql: 'DELETE FROM claves WHERE clave = ?', valores: [clave] }
            : {
                sql: 'INSERT OR REPLACE INTO claves (clave, valor) VALUES (?, ?)',
                valores: [clave, valor],
              },
        ])
      }),
  }
}
