// Pruebas del plugin en el simulador (SPEC_17B §9, condición 6).
//
// Es lo que cubre el código que Vitest no ejecuta. Cada prueba abre su propia
// base en una carpeta temporal, salvo la que comprueba la ruta de fábrica.

import XCTest
import Capacitor
import SQLite3
@testable import StrivoAlmacenPlugin

final class AlmacenTests: XCTestCase {

    private var carpeta: URL!
    private var almacen: Almacen!

    override func setUpWithError() throws {
        carpeta = FileManager.default.temporaryDirectory
            .appendingPathComponent("strivo-pruebas-\(UUID().uuidString)", isDirectory: true)
        almacen = Almacen(url: carpeta.appendingPathComponent("Strivo/strivo.sqlite"))
    }

    override func tearDownWithError() throws {
        almacen.cerrar()
        try? FileManager.default.removeItem(at: carpeta)
    }

    private func tabla() throws {
        try almacen.abrir()
        _ = try almacen.ejecutar([Sentencia("CREATE TABLE t (clave TEXT PRIMARY KEY, valor)")])
    }

    // ─── Dónde vive ──────────────────────────────────────────────────────────

    func testLaRutaDeFabricaEsLibraryStrivoStrivoSqlite() throws {
        let url = try Almacen.urlDeFabrica()
        XCTAssertEqual(url.lastPathComponent, "strivo.sqlite")
        XCTAssertEqual(url.deletingLastPathComponent().lastPathComponent, "Strivo")
        XCTAssertEqual(url.deletingLastPathComponent().deletingLastPathComponent().lastPathComponent, "Library")
    }

    func testExisteNoCreaNada() {
        XCTAssertFalse(almacen.existe())
        XCTAssertFalse(FileManager.default.fileExists(atPath: carpeta.path))
    }

    func testAbrirCreaLaBaseUnaVezYEsIdempotente() throws {
        XCTAssertTrue(try almacen.abrir())
        XCTAssertTrue(almacen.existe())
        XCTAssertFalse(try almacen.abrir())
        almacen.cerrar()
        XCTAssertFalse(try almacen.abrir(), "un archivo que ya existía no es una base creada")
    }

    func testLaBaseEntraEnLaCopiaDeICloud() throws {
        try almacen.abrir()
        let archivo = try almacen.url.resourceValues(forKeys: [.isExcludedFromBackupKey])
        let carpetaBase = try almacen.url.deletingLastPathComponent().resourceValues(forKeys: [.isExcludedFromBackupKey])
        XCTAssertEqual(archivo.isExcludedFromBackup, false)
        XCTAssertEqual(carpetaBase.isExcludedFromBackup, false)
    }

    func testLaProteccionNuncaEsComplete() throws {
        try almacen.abrir()
        let atributos = try FileManager.default.attributesOfItem(atPath: almacen.url.path)
        let proteccion = atributos[.protectionKey] as? FileProtectionType
        // El simulador puede no informarla; si la informa, es la de fábrica.
        XCTAssertNotEqual(proteccion, .complete)
        if let proteccion = proteccion {
            XCTAssertEqual(proteccion, .completeUntilFirstUserAuthentication)
        }
    }

    func testWalConSynchronousFull() throws {
        try almacen.abrir()
        XCTAssertEqual(try almacen.consultar(Sentencia("PRAGMA journal_mode")).first?["journal_mode"] as? String, "wal")
        XCTAssertEqual(try almacen.consultar(Sentencia("PRAGMA synchronous")).first?["synchronous"] as? Int64, 2)
    }

    // ─── Ejecutar ────────────────────────────────────────────────────────────

    func testSinAbrirNoEjecutaNiConsulta() {
        XCTAssertThrowsError(try almacen.ejecutar([Sentencia("SELECT 1")]))
        XCTAssertThrowsError(try almacen.consultar(Sentencia("SELECT 1")))
    }

    func testCadaSentenciaDiceCuantasFilasCambio() throws {
        try tabla()
        let cambios = try almacen.ejecutar([
            Sentencia("INSERT INTO t VALUES (?, ?)", ["a", 1]),
            Sentencia("INSERT INTO t VALUES (?, ?)", ["b", 2]),
            Sentencia("INSERT INTO t VALUES (?, ?) ON CONFLICT(clave) DO NOTHING", ["a", 9]),
            Sentencia("UPDATE t SET valor = valor + 1"),
        ])
        XCTAssertEqual(cambios, [1, 1, 0, 2])
    }

    func testElLoteEsUnaTransaccionOEntraTodoONada() throws {
        try tabla()
        XCTAssertThrowsError(try almacen.ejecutar([
            Sentencia("INSERT INTO t VALUES (?, ?)", ["a", 1]),
            Sentencia("INSERT INTO t VALUES (?, ?)", ["a", 2]),  // choca con la clave
        ]))
        XCTAssertEqual(try almacen.consultar(Sentencia("SELECT COUNT(*) AS n FROM t")).first?["n"] as? Int64, 0)
        // Y la conexión sigue sirviendo después del fallo.
        XCTAssertEqual(try almacen.ejecutar([Sentencia("INSERT INTO t VALUES (?, ?)", ["a", 1])]), [1])
    }

    func testUnNumeroDeValoresQueNoCuadraEsUnError() throws {
        try tabla()
        XCTAssertThrowsError(try almacen.ejecutar([Sentencia("INSERT INTO t VALUES (?, ?)", ["a"])]))
    }

    func testLoEscritoPorLaPersonaNuncaEntraEnElSQL() throws {
        try tabla()
        let malicioso = "x'); DROP TABLE t; --"
        _ = try almacen.ejecutar([Sentencia("INSERT INTO t VALUES (?, ?)", ["k", malicioso])])
        let filas = try almacen.consultar(Sentencia("SELECT valor FROM t WHERE clave = ?", ["k"]))
        XCTAssertEqual(filas.first?["valor"] as? String, malicioso)
        XCTAssertEqual(try almacen.consultar(Sentencia("SELECT COUNT(*) AS n FROM t")).first?["n"] as? Int64, 1)
    }

    func testLosTiposVanYVuelvenIguales() throws {
        try tabla()
        let texto = "Gracias por el café ☕️ y por «todo» — ñandú"
        _ = try almacen.ejecutar([
            Sentencia("INSERT INTO t VALUES (?, ?)", ["texto", texto]),
            Sentencia("INSERT INTO t VALUES (?, ?)", ["entero", NSNumber(value: 42)]),
            Sentencia("INSERT INTO t VALUES (?, ?)", ["enteroDeJS", NSNumber(value: 3.0)]),
            Sentencia("INSERT INTO t VALUES (?, ?)", ["decimal", NSNumber(value: 2.5)]),
            Sentencia("INSERT INTO t VALUES (?, ?)", ["nulo", NSNull()]),
            Sentencia("INSERT INTO t VALUES (?, ?)", ["logico", NSNumber(value: true)]),
        ])
        func leer(_ clave: String) throws -> Any? {
            try almacen.consultar(Sentencia("SELECT valor FROM t WHERE clave = ?", [clave])).first?["valor"]
        }
        XCTAssertEqual(try leer("texto") as? String, texto)
        XCTAssertEqual(try leer("entero") as? Int64, 42)
        XCTAssertEqual(try leer("enteroDeJS") as? Int64, 3)
        XCTAssertEqual(try leer("decimal") as? Double, 2.5)
        XCTAssertTrue(try leer("nulo") is NSNull)
        XCTAssertEqual(try leer("logico") as? Int64, 1)
    }

    func testUnaConsultaSinFilasDevuelveUnaListaVacia() throws {
        try tabla()
        XCTAssertEqual(try almacen.consultar(Sentencia("SELECT * FROM t")).count, 0)
    }

    func testLoConfirmadoSigueAhiAlReabrir() throws {
        try tabla()
        _ = try almacen.ejecutar([Sentencia("INSERT INTO t VALUES (?, ?)", ["a", "se queda"])])
        almacen.cerrar()
        let otro = Almacen(url: almacen.url)
        try otro.abrir()
        XCTAssertEqual(try otro.consultar(Sentencia("SELECT valor FROM t")).first?["valor"] as? String, "se queda")
        otro.cerrar()
    }

    func testLlamadasDesdeVariosHilosNoSePisan() throws {
        try tabla()
        _ = try almacen.ejecutar([Sentencia("INSERT INTO t VALUES ('n', 0)")])
        DispatchQueue.concurrentPerform(iterations: 200) { _ in
            _ = try? almacen.ejecutar([Sentencia("UPDATE t SET valor = valor + 1 WHERE clave = 'n'")])
        }
        XCTAssertEqual(try almacen.consultar(Sentencia("SELECT valor FROM t")).first?["valor"] as? Int64, 200)
    }

    // ─── El puente ───────────────────────────────────────────────────────────

    func testElPluginSeLlamaComoLoPideJSYTieneCuatroMetodos() {
        let plugin = StrivoAlmacenPlugin()
        XCTAssertEqual(plugin.jsName, "StrivoAlmacen")
        XCTAssertEqual(plugin.pluginMethods.map { $0.name }.sorted(), ["abrir", "consultar", "ejecutar", "existe"])
    }

    func testElPuenteTraduceSentenciasYFilas() throws {
        let cruda: JSObject = ["sql": "SELECT ?", "valores": ["a", NSNumber(value: 1), NSNull()] as JSArray]
        let sentencia = try StrivoAlmacenPlugin.sentencia(cruda)
        XCTAssertEqual(sentencia.sql, "SELECT ?")
        XCTAssertEqual(sentencia.valores.count, 3)
        XCTAssertThrowsError(try StrivoAlmacenPlugin.sentencia(["valores": [] as JSArray] as JSObject))

        let fila = StrivoAlmacenPlugin.fila(["a": Int64(7), "b": 1.5, "c": "texto", "d": NSNull()])
        XCTAssertEqual((fila["a"] as? NSNumber)?.int64Value, 7)
        XCTAssertEqual((fila["b"] as? NSNumber)?.doubleValue, 1.5)
        XCTAssertEqual(fila["c"] as? String, "texto")
        XCTAssertTrue(fila["d"] is NSNull)
    }
}
