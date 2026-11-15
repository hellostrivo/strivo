// StrivoAlmacenPlugin.swift
// El puente entre JavaScript y `Almacen` (SPEC_17B).
//
// **Seis métodos y ninguno más.** Los cuatro de la base (condición 7 del §9
// de SPEC_17B):
//
//   abrir()                                        → { creada: Bool }
//   existe()                                       → { existe: Bool }
//   ejecutar({ sentencias: [{ sql, valores }] })   → { cambios: [Int] }   // una transacción
//   consultar({ sql, valores })                    → { filas: [{ columna: valor }] }
//
// Y los dos del archivo de «Llevarme lo que escribí» (SPEC_24, D1), que solo
// tocan `Library/Caches/Strivo/exportar/` (`ArchivosTemporales`):
//
//   escribirTemporal({ nombre, base64 })           → { url: String }      // vacía la carpeta antes
//   borrarTemporal({ url })                        → {}
//
// El resto —qué tablas hay, qué se guarda, la cola, la migración— vive en
// JavaScript. Un error se rechaza con un mensaje; la pantalla nunca lo enseña
// (RN-EST-04): lo traduce `src/lib/db/`.

import Foundation
import Capacitor

@objc(StrivoAlmacenPlugin)
public class StrivoAlmacenPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StrivoAlmacenPlugin"
    public let jsName = "StrivoAlmacen"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "abrir", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "existe", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "ejecutar", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "consultar", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "escribirTemporal", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "borrarTemporal", returnType: CAPPluginReturnPromise)
    ]

    private lazy var almacen: Almacen? = try? Almacen(url: Almacen.urlDeFabrica())

    @objc func abrir(_ call: CAPPluginCall) {
        guard let almacen = almacen else { return call.reject("No hay carpeta para la base.") }
        do {
            call.resolve(["creada": try almacen.abrir()])
        } catch {
            call.reject(String(describing: error))
        }
    }

    @objc func existe(_ call: CAPPluginCall) {
        call.resolve(["existe": almacen?.existe() ?? false])
    }

    @objc func ejecutar(_ call: CAPPluginCall) {
        guard let almacen = almacen else { return call.reject("No hay carpeta para la base.") }
        guard let crudas = call.getArray("sentencias") else {
            return call.reject("Faltan las sentencias.")
        }
        do {
            let sentencias = try crudas.map(StrivoAlmacenPlugin.sentencia)
            call.resolve(["cambios": try almacen.ejecutar(sentencias)])
        } catch {
            call.reject(String(describing: error))
        }
    }

    @objc func consultar(_ call: CAPPluginCall) {
        guard let almacen = almacen else { return call.reject("No hay carpeta para la base.") }
        guard let sql = call.getString("sql") else { return call.reject("Falta la sentencia.") }
        let valores: [Any] = call.getArray("valores") ?? []
        do {
            let filas = try almacen.consultar(Sentencia(sql, valores))
            call.resolve(["filas": filas.map(StrivoAlmacenPlugin.fila)])
        } catch {
            call.reject(String(describing: error))
        }
    }

    // ─── El archivo de exportar (SPEC_24) ────────────────────────────────────

    private lazy var temporales: ArchivosTemporales? =
        (try? ArchivosTemporales.carpetaDeFabrica()).map { ArchivosTemporales(carpeta: $0) }

    @objc func escribirTemporal(_ call: CAPPluginCall) {
        guard let temporales = temporales else { return call.reject("No hay carpeta de exportar.") }
        guard let nombre = call.getString("nombre"), let base64 = call.getString("base64") else {
            return call.reject("Faltan el nombre o los datos.")
        }
        do {
            call.resolve(["url": try temporales.escribir(nombre: nombre, base64: base64).absoluteString])
        } catch {
            call.reject(String(describing: error))
        }
    }

    @objc func borrarTemporal(_ call: CAPPluginCall) {
        guard let temporales = temporales else { return call.reject("No hay carpeta de exportar.") }
        guard let cruda = call.getString("url"), let url = URL(string: cruda) else {
            return call.reject("Falta la ruta.")
        }
        do {
            try temporales.borrar(url: url)
            call.resolve()
        } catch {
            call.reject(String(describing: error))
        }
    }

    // ─── Traducción entre el puente y `Almacen` ──────────────────────────────

    static func sentencia(_ cruda: JSValue) throws -> Sentencia {
        guard let objeto = cruda as? JSObject, let sql = objeto["sql"] as? String else {
            throw ErrorDeAlmacen.sentencia("una sentencia sin SQL")
        }
        let valores: [Any] = (objeto["valores"] as? JSArray) ?? []
        return Sentencia(sql, valores)
    }

    static func fila(_ fila: [String: Any]) -> JSObject {
        var objeto = JSObject()
        for (columna, valor) in fila {
            switch valor {
            case let entero as Int64: objeto[columna] = NSNumber(value: entero)
            case let doble as Double: objeto[columna] = NSNumber(value: doble)
            case let texto as String: objeto[columna] = texto
            default: objeto[columna] = NSNull()
            }
        }
        return objeto
    }
}
