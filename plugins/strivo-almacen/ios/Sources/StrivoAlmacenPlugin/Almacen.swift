// Almacen.swift
// La base SQLite de Strivo en el iPhone (SPEC_17B, DP-17B.1 opción c).
//
// **Lo único que hace este archivo es abrir un archivo SQLite del sistema y
// ejecutar sentencias con parámetros enlazados.** No conoce el modelo de datos,
// ni las tablas, ni la cola: eso vive en JavaScript (`src/lib/db/`), igual que
// con IndexedDB. Cuanto menos sepa la parte nativa, menos código queda fuera del
// alcance de Vitest.
//
// Las condiciones del §9 de la instrucción, y dónde se cumplen:
//
//   (2) Todas las sentencias van con parámetros enlazados (`sqlite3_bind_*`):
//       ningún texto escrito por la persona entra nunca dentro del SQL.
//   (3) Una sola conexión, atendida por una cola serial (`cola`). Todas las
//       llamadas pasan por `cola.sync`, vengan del hilo que vengan.
//   (4) WAL con `synchronous = FULL`: cada escritura confirmada sobrevive a un
//       corte de luz, no solo a que la app se cierre.
//   (5) La protección de archivo de fábrica de iOS —hasta el primer desbloqueo—
//       y nunca `Complete`, que dejaría la base cerrada con el teléfono
//       bloqueado (un aviso, el audio de Respiración en segundo plano).
//
// **Dónde vive la base: `Library/Strivo/strivo.sqlite`, y no se toca después de
// publicar** (DP-17B.2). Cambiar la carpeta o el nombre abriría una base vacía.
// Va **dentro** de la copia de seguridad de iCloud: no se marca
// `isExcludedFromBackup`, así que lo escrito y el uid viajan con la copia del
// teléfono, que Apple cifra.
//
// Sin cifrado propio y sin bibliotecas de cifrado: es el SQLite del sistema, y
// `ITSAppUsesNonExemptEncryption` sigue en `false`.

import Foundation
import SQLite3

public enum ErrorDeAlmacen: Error, CustomStringConvertible {
    case noAbre(String)
    case sentencia(String)
    case sinAbrir
    case valorNoAdmitido(String)

    public var description: String {
        switch self {
        case .noAbre(let detalle): return "No se pudo abrir la base: \(detalle)"
        case .sentencia(let detalle): return "La sentencia no se pudo ejecutar: \(detalle)"
        case .sinAbrir: return "La base no está abierta."
        case .valorNoAdmitido(let detalle): return "Valor no admitido: \(detalle)"
        }
    }
}

/// Una sentencia con sus valores, en el orden de sus `?`.
public struct Sentencia {
    public let sql: String
    public let valores: [Any]

    public init(_ sql: String, _ valores: [Any] = []) {
        self.sql = sql
        self.valores = valores
    }
}

// SQLite copia el texto enlazado en el acto (SQLITE_TRANSIENT).
private let TRANSITORIO = unsafeBitCast(-1, to: sqlite3_destructor_type.self)

public final class Almacen {

    /// La carpeta, dentro de `Library/`. Irreversible tras publicar.
    public static let carpeta = "Strivo"
    /// El nombre del archivo. Irreversible tras publicar.
    public static let nombreDeArchivo = "strivo.sqlite"

    /// `Library/Strivo/strivo.sqlite` dentro del contenedor de la app.
    public static func urlDeFabrica() throws -> URL {
        guard let library = FileManager.default.urls(for: .libraryDirectory, in: .userDomainMask).first else {
            throw ErrorDeAlmacen.noAbre("no hay carpeta Library")
        }
        return library
            .appendingPathComponent(carpeta, isDirectory: true)
            .appendingPathComponent(nombreDeArchivo, isDirectory: false)
    }

    public let url: URL
    private var db: OpaquePointer?
    private let cola = DispatchQueue(label: "com.hellostrivo.strivo.almacen")

    public init(url: URL) {
        self.url = url
    }

    deinit {
        if let db = db { sqlite3_close_v2(db) }
    }

    // ─── Abrir ────────────────────────────────────────────────────────────────

    /// ¿Existe el archivo de la base? No lo crea ni lo abre.
    public func existe() -> Bool {
        return cola.sync { FileManager.default.fileExists(atPath: url.path) }
    }

    /// Abre la base, creándola si no existe. Idempotente.
    /// - Returns: `true` si el archivo no existía y se acaba de crear.
    @discardableResult
    public func abrir() throws -> Bool {
        return try cola.sync {
            if db != nil { return false }
            let yaExistia = FileManager.default.fileExists(atPath: url.path)

            let carpeta = url.deletingLastPathComponent()
            do {
                try FileManager.default.createDirectory(
                    at: carpeta,
                    withIntermediateDirectories: true,
                    attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication]
                )
            } catch {
                throw ErrorDeAlmacen.noAbre("no se pudo crear la carpeta (\(error.localizedDescription))")
            }

            var conexion: OpaquePointer?
            let banderas = SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_FULLMUTEX
                | SQLITE_OPEN_FILEPROTECTION_COMPLETEUNTILFIRSTUSERAUTHENTICATION
            let codigo = sqlite3_open_v2(url.path, &conexion, banderas, nil)
            guard codigo == SQLITE_OK, let abierta = conexion else {
                let detalle = conexion.map { String(cString: sqlite3_errmsg($0)) } ?? "código \(codigo)"
                if let conexion = conexion { sqlite3_close_v2(conexion) }
                throw ErrorDeAlmacen.noAbre(detalle)
            }

            do {
                try ajustar(abierta, "PRAGMA journal_mode = WAL")
                try ajustar(abierta, "PRAGMA synchronous = FULL")
                try ajustar(abierta, "PRAGMA busy_timeout = 5000")
            } catch {
                sqlite3_close_v2(abierta)
                throw error
            }

            // La protección de fábrica también sobre el archivo, por si el
            // sistema lo creó con otra. Nunca `.complete` (condición 5).
            try? FileManager.default.setAttributes(
                [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication],
                ofItemAtPath: url.path
            )

            db = abierta
            return !yaExistia
        }
    }

    /// Cierra la conexión. Solo para pruebas: la app no la cierra nunca.
    public func cerrar() {
        cola.sync {
            if let db = db { sqlite3_close_v2(db) }
            db = nil
        }
    }

    // ─── Ejecutar y consultar ─────────────────────────────────────────────────

    /// Ejecuta las sentencias **en una sola transacción**: o entran todas o no
    /// entra ninguna.
    /// - Returns: cuántas filas cambió cada sentencia, en el mismo orden.
    public func ejecutar(_ sentencias: [Sentencia]) throws -> [Int] {
        return try cola.sync {
            guard let db = db else { throw ErrorDeAlmacen.sinAbrir }
            try paso(db, "BEGIN IMMEDIATE")
            var cambios: [Int] = []
            do {
                for sentencia in sentencias {
                    let preparada = try preparar(db, sentencia)
                    defer { sqlite3_finalize(preparada) }
                    var codigo = sqlite3_step(preparada)
                    while codigo == SQLITE_ROW { codigo = sqlite3_step(preparada) }
                    guard codigo == SQLITE_DONE else { throw ErrorDeAlmacen.sentencia(mensaje(db)) }
                    cambios.append(Int(sqlite3_changes(db)))
                }
                try paso(db, "COMMIT")
            } catch {
                _ = sqlite3_exec(db, "ROLLBACK", nil, nil, nil)
                throw error
            }
            return cambios
        }
    }

    /// Una consulta. Cada fila es un diccionario columna → valor, con los tipos
    /// de SQLite: `Int64`, `Double`, `String` o `NSNull`.
    public func consultar(_ sentencia: Sentencia) throws -> [[String: Any]] {
        return try cola.sync {
            guard let db = db else { throw ErrorDeAlmacen.sinAbrir }
            let preparada = try preparar(db, sentencia)
            defer { sqlite3_finalize(preparada) }

            var filas: [[String: Any]] = []
            let columnas = sqlite3_column_count(preparada)
            var codigo = sqlite3_step(preparada)
            while codigo == SQLITE_ROW {
                var fila: [String: Any] = [:]
                for i in 0..<columnas {
                    let nombre = String(cString: sqlite3_column_name(preparada, i))
                    fila[nombre] = try valor(preparada, i)
                }
                filas.append(fila)
                codigo = sqlite3_step(preparada)
            }
            guard codigo == SQLITE_DONE else { throw ErrorDeAlmacen.sentencia(mensaje(db)) }
            return filas
        }
    }

    // ─── Por dentro ───────────────────────────────────────────────────────────

    private func preparar(_ db: OpaquePointer, _ sentencia: Sentencia) throws -> OpaquePointer {
        var preparada: OpaquePointer?
        guard sqlite3_prepare_v2(db, sentencia.sql, -1, &preparada, nil) == SQLITE_OK, let lista = preparada else {
            throw ErrorDeAlmacen.sentencia(mensaje(db))
        }
        let esperados = Int(sqlite3_bind_parameter_count(lista))
        guard esperados == sentencia.valores.count else {
            sqlite3_finalize(lista)
            throw ErrorDeAlmacen.sentencia("se esperaban \(esperados) valores y llegaron \(sentencia.valores.count)")
        }
        for (indice, valor) in sentencia.valores.enumerated() {
            do {
                try enlazar(db, lista, Int32(indice + 1), valor)
            } catch {
                sqlite3_finalize(lista)
                throw error
            }
        }
        return lista
    }

    private func enlazar(_ db: OpaquePointer, _ preparada: OpaquePointer, _ posicion: Int32, _ valor: Any) throws {
        let codigo: Int32
        switch valor {
        case is NSNull:
            codigo = sqlite3_bind_null(preparada, posicion)
        case let texto as String:
            codigo = sqlite3_bind_text(preparada, posicion, texto, -1, TRANSITORIO)
        case let numero as NSNumber:
            if CFGetTypeID(numero) == CFBooleanGetTypeID() {
                codigo = sqlite3_bind_int64(preparada, posicion, numero.boolValue ? 1 : 0)
            } else if CFNumberIsFloatType(numero) {
                let doble = numero.doubleValue
                if doble.rounded() == doble, abs(doble) < 9_007_199_254_740_992 {
                    // JavaScript no distingue enteros: un 3 llega como 3.0.
                    codigo = sqlite3_bind_int64(preparada, posicion, Int64(doble))
                } else {
                    codigo = sqlite3_bind_double(preparada, posicion, doble)
                }
            } else {
                codigo = sqlite3_bind_int64(preparada, posicion, numero.int64Value)
            }
        case let entero as Int:
            codigo = sqlite3_bind_int64(preparada, posicion, Int64(entero))
        case let doble as Double:
            codigo = sqlite3_bind_double(preparada, posicion, doble)
        case let logico as Bool:
            codigo = sqlite3_bind_int64(preparada, posicion, logico ? 1 : 0)
        default:
            throw ErrorDeAlmacen.valorNoAdmitido("\(type(of: valor)) en la posición \(posicion)")
        }
        guard codigo == SQLITE_OK else { throw ErrorDeAlmacen.sentencia(mensaje(db)) }
    }

    private func valor(_ preparada: OpaquePointer, _ columna: Int32) throws -> Any {
        switch sqlite3_column_type(preparada, columna) {
        case SQLITE_NULL:
            return NSNull()
        case SQLITE_INTEGER:
            return sqlite3_column_int64(preparada, columna)
        case SQLITE_FLOAT:
            return sqlite3_column_double(preparada, columna)
        case SQLITE_TEXT:
            return String(cString: sqlite3_column_text(preparada, columna))
        default:
            throw ErrorDeAlmacen.valorNoAdmitido("columna binaria")
        }
    }

    private func ajustar(_ db: OpaquePointer, _ sql: String) throws {
        // Un PRAGMA puede devolver una fila (journal_mode lo hace): se recorre.
        var preparada: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &preparada, nil) == SQLITE_OK, let lista = preparada else {
            throw ErrorDeAlmacen.noAbre(mensaje(db))
        }
        defer { sqlite3_finalize(lista) }
        var codigo = sqlite3_step(lista)
        while codigo == SQLITE_ROW { codigo = sqlite3_step(lista) }
        guard codigo == SQLITE_DONE else { throw ErrorDeAlmacen.noAbre(mensaje(db)) }
    }

    private func paso(_ db: OpaquePointer, _ sql: String) throws {
        guard sqlite3_exec(db, sql, nil, nil, nil) == SQLITE_OK else {
            throw ErrorDeAlmacen.sentencia(mensaje(db))
        }
    }

    private func mensaje(_ db: OpaquePointer) -> String {
        return String(cString: sqlite3_errmsg(db))
    }
}
