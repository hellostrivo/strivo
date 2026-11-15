// ArchivosTemporales.swift
// El archivo de «Llevarme lo que escribí», un instante en el teléfono
// (SPEC_24, D1).
//
// La hoja de compartir de iOS necesita una URL de archivo, y el WebView no
// sabe escribir uno. Esto escribe el `.zip` que arma JavaScript en
// `Library/Caches/Strivo/exportar/`, devuelve su URL y lo borra después.
// **Solo ahí**: no puede escribir, ni borrar, fuera de esa carpeta.
//
// Tres reglas, y por qué:
//
//   - **Caches, no Documents ni Library.** Es una copia de paso: iOS puede
//     purgarla cuando quiera y no entra en la copia de iCloud. Lo que vale está
//     en la base, no aquí.
//   - **Cada escritura vacía la carpeta antes.** Si la app se cerró con la hoja
//     abierta, el archivo anterior se quedó ahí; el siguiente lo retira.
//   - **El nombre no puede salir de la carpeta.** Solo letras ASCII, cifras,
//     punto, guion y guion bajo, sin `..`: un nombre con `/` no entra.
//
// Sin API de las que Apple pide declarar: no se leen fechas ni atributos de
// ningún archivo.

import Foundation

public enum ErrorDeArchivo: Error, CustomStringConvertible {
    case nombre(String)
    case datos
    case fuera

    public var description: String {
        switch self {
        case .nombre(let nombre): return "Nombre de archivo no admitido: \(nombre)"
        case .datos: return "Los datos no son base64."
        case .fuera: return "Esa ruta no es de la carpeta de exportar."
        }
    }
}

public struct ArchivosTemporales {
    public let carpeta: URL

    public init(carpeta: URL) {
        self.carpeta = carpeta.standardizedFileURL
    }

    /// `Library/Caches/Strivo/exportar/`.
    public static func carpetaDeFabrica() throws -> URL {
        let caches = try FileManager.default.url(
            for: .cachesDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        return caches
            .appendingPathComponent("Strivo", isDirectory: true)
            .appendingPathComponent("exportar", isDirectory: true)
    }

    static func nombreValido(_ nombre: String) -> Bool {
        guard !nombre.isEmpty, nombre.count <= 120, !nombre.contains("..") else { return false }
        let permitidos = CharacterSet(charactersIn:
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-")
        return nombre.unicodeScalars.allSatisfy { permitidos.contains($0) }
    }

    /// Borra todo lo que haya en la carpeta. Sin carpeta, no hace nada.
    public func vaciar() throws {
        let gestor = FileManager.default
        guard gestor.fileExists(atPath: carpeta.path) else { return }
        for archivo in try gestor.contentsOfDirectory(at: carpeta, includingPropertiesForKeys: nil) {
            try gestor.removeItem(at: archivo)
        }
    }

    /// Vacía la carpeta, escribe el archivo y devuelve su URL.
    public func escribir(nombre: String, base64: String) throws -> URL {
        guard ArchivosTemporales.nombreValido(nombre) else { throw ErrorDeArchivo.nombre(nombre) }
        guard let datos = Data(base64Encoded: base64) else { throw ErrorDeArchivo.datos }
        try vaciar()
        try FileManager.default.createDirectory(at: carpeta, withIntermediateDirectories: true)
        let destino = carpeta.appendingPathComponent(nombre, isDirectory: false)
        try datos.write(to: destino, options: .atomic)
        return destino
    }

    /// Borra un archivo de la carpeta. Si ya no está, no pasa nada.
    public func borrar(url: URL) throws {
        let archivo = url.standardizedFileURL
        guard archivo.deletingLastPathComponent().path == carpeta.path,
              ArchivosTemporales.nombreValido(archivo.lastPathComponent)
        else { throw ErrorDeArchivo.fuera }
        if FileManager.default.fileExists(atPath: archivo.path) {
            try FileManager.default.removeItem(at: archivo)
        }
    }
}
