// src/lib/db/__tests__/dobleDeAlmacen.js
// El plugin `StrivoAlmacen` de mentira, sobre `node:sqlite` (SPEC_17B).
//
// **El motor es SQLite de verdad**, el que trae Node (22.13 o más): las mismas
// sentencias, los mismos índices, el mismo `ON CONFLICT` y la misma
// transacción por lote que el plugin nativo. Lo único doblado es el puente.
// Se carga con `process.getBuiltinModule` porque Vite 5 no reconoce
// `node:sqlite` como módulo de Node y no lo resolvería con un `import`.
//
// **Se porta como un plugin de Capacitor**: es un Proxy que también contesta a
// `then` (`pluginDeCapacitor`). Si el adaptador lo dejara salir suelto de una
// promesa, la prueba se colgaría, igual que el iPhone.
//
// Los métodos imitan los del lado nativo, con sus mismos nombres y formas:
//   abrir() → { creada }, existe() → { existe },
//   ejecutar({ sentencias }) → { cambios }, consultar({ sql, valores }) → { filas }.

import { pluginDeCapacitor } from '../../__tests__/dobleDeCapacitor.js'

const { DatabaseSync } = process.getBuiltinModule('node:sqlite')

/**
 * @param {object} [opciones]
 * @param {boolean} [opciones.existe=false] - si el archivo «ya estaba» antes de abrir.
 * @param {(sentencias) => void} [opciones.antesDeEjecutar] - para hacer fallar un lote.
 * @param {(sql) => void} [opciones.antesDeConsultar] - para hacer fallar una consulta.
 * @param {() => void} [opciones.antesDeAbrir] - para hacer fallar la apertura.
 */
export function crearDobleDeAlmacen(opciones = {}) {
  const estado = {
    db: null,
    archivo: opciones.existe ?? false,
    llamadas: { abrir: 0, existe: 0, ejecutar: 0, consultar: 0 },
    ...opciones,
  }

  const metodos = {
    async abrir() {
      estado.llamadas.abrir += 1
      estado.antesDeAbrir?.()
      if (estado.db) return { creada: false }
      const creada = !estado.archivo
      estado.db = new DatabaseSync(':memory:')
      estado.archivo = true
      return { creada }
    },
    async existe() {
      estado.llamadas.existe += 1
      return { existe: estado.archivo }
    },
    async ejecutar({ sentencias }) {
      estado.llamadas.ejecutar += 1
      if (!estado.db) throw new Error('La base no está abierta.')
      estado.antesDeEjecutar?.(sentencias)
      const db = estado.db
      db.exec('BEGIN IMMEDIATE')
      try {
        const cambios = sentencias.map(({ sql, valores }) => {
          comprobarValores(valores)
          return Number(db.prepare(sql).run(...valores).changes)
        })
        db.exec('COMMIT')
        return { cambios }
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },
    async consultar({ sql, valores }) {
      estado.llamadas.consultar += 1
      if (!estado.db) throw new Error('La base no está abierta.')
      estado.antesDeConsultar?.(sql)
      comprobarValores(valores)
      const filas = estado.db.prepare(sql).all(...valores)
      return { filas: filas.map((f) => ({ ...f })) }
    },
  }

  return { plugin: pluginDeCapacitor(metodos), estado }
}

// Lo que el puente nativo admite: texto, números y nulo. Un `undefined` o un
// objeto no llegarían al otro lado; aquí fallan en voz alta.
function comprobarValores(valores) {
  if (!Array.isArray(valores)) throw new Error('valores tiene que ser una lista')
  for (const valor of valores) {
    const tipo = typeof valor
    if (!(valor === null || tipo === 'string' || tipo === 'number')) {
      throw new Error(`valor no admitido por el puente: ${String(valor)}`)
    }
  }
}

/**
 * Un adaptador SQLite listo para usar: el doble, la conexión con su cerrojo, la
 * base abierta y las tablas creadas. Es lo que deja `prepararAlmacen` cuando
 * todo sale bien, sin la migración.
 */
export async function almacenSQLiteDePruebas(opciones = {}) {
  const { crearAdaptadorSQLite, crearConexion, crearEsquema } =
    await import('../adaptadorSQLite.js')
  const doble = crearDobleDeAlmacen(opciones)
  const conexion = crearConexion(doble.plugin)
  await conexion.enExclusiva((c) => c.abrir())
  await crearEsquema(conexion)
  return { ...doble, conexion, adaptador: crearAdaptadorSQLite(conexion) }
}
