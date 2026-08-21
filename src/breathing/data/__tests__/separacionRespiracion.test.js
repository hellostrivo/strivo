// src/breathing/data/__tests__/separacionRespiracion.test.js
// Criterio 19 y RN-RE-DAT-09, comprobados sobre el código fuente.
//
// El lint ya prohíbe los imports que cruzan la línea (SPEC_13 §4.2), pero el
// lint se puede desactivar con un comentario y una prueba no. Es el mismo doble
// cinturón que SPEC_02 puso sobre RN-DB4-01.

import { readFileSync, readdirSync, statSync } from 'fs'
import { extname, join } from 'path'

import { describe, expect, it } from 'vitest'

const CARPETAS = ['src/breathing', 'src/lib/respiracion']

function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) {
      // Las pruebas quedan fuera: una prueba que comprueba que algo NO aparece
      // tiene que poder nombrarlo. Es la regla que SPEC_06 fijó para lint:copy.
      return nombre === '__tests__' ? [] : archivosDe(ruta)
    }
    return ['.js', '.jsx'].includes(extname(nombre)) ? [ruta] : []
  })
}

const ARCHIVOS = CARPETAS.flatMap(archivosDe)

/** Quita comentarios de bloque y de línea, sin tocar las cadenas. */
function soloCodigo(fuente) {
  const sinBloques = fuente.replace(/\/\*[\s\S]*?\*\//g, '')
  return sinBloques
    .split('\n')
    .map((linea) => {
      let comilla = null
      for (let i = 0; i < linea.length; i += 1) {
        const c = linea[i]
        if (comilla) {
          if (c === '\\') i += 1
          else if (c === comilla) comilla = null
        } else if (c === "'" || c === '"' || c === '`') {
          comilla = c
        } else if (c === '/' && linea[i + 1] === '/') {
          return linea.slice(0, i)
        }
      }
      return linea
    })
    .join('\n')
}

function literalesDe(fuente) {
  const codigo = soloCodigo(fuente)
  return (
    codigo
      .split('\n')
      // Un `console.warn` es para quien programa, no para quien respira. No es
      // copy y no tiene por qué vivir en `copy/`.
      .filter((linea) => !linea.includes('console.'))
      .flatMap((linea) => linea.match(/'[^'\n]*'|"[^"\n]*"|`[^`\n$]*`/g) ?? [])
      .map((literal) => literal.slice(1, -1))
  )
}

describe('hay algo que revisar', () => {
  it('las dos carpetas tienen archivos', () => {
    expect(ARCHIVOS.length).toBeGreaterThanOrEqual(7)
  })
})

describe('criterio 19 — ni un string visible fuera de copy/', () => {
  it.each(ARCHIVOS)('%s no contiene texto de interfaz', (ruta) => {
    const sospechosos = literalesDe(readFileSync(ruta, 'utf8')).filter(
      // Un texto que alguien lee tiene espacios o acentos. Los ids del catálogo
      // y las claves de los almacenes no tienen ni una cosa ni la otra.
      (literal) => /\s/.test(literal) || /[áéíóúñü¿¡]/i.test(literal),
    )
    expect(sospechosos).toEqual([])
  })

  it('el copy de Respiración sí existe, y está donde tiene que estar', async () => {
    const { copy } = await import('@copy/index.js')
    expect(copy.respiracion.titulo).toBeTruthy()
    expect(copy.respiracion.fases.inhalar).toBeTruthy()
  })
})

describe('RN-RE-DAT-09 y §4.2 — Respiración no conoce ningún espacio', () => {
  it.each(ARCHIVOS)('%s no importa lumia/ ni formia/', (ruta) => {
    const codigo = soloCodigo(readFileSync(ruta, 'utf8'))
    const imports = codigo.match(/from\s+'[^']+'/g) ?? []
    const cruces = imports.filter((linea) => /lumia|formia/i.test(linea))
    expect(cruces).toEqual([])
  })

  it('tampoco se entra por el barril de la capa de datos, que los expone', () => {
    ARCHIVOS.forEach((ruta) => {
      const codigo = soloCodigo(readFileSync(ruta, 'utf8'))
      expect(codigo).not.toMatch(/from\s+'@\/lib\/db'/)
      expect(codigo).not.toMatch(/from\s+'@lib\/db'/)
    })
  })

  it('el motor tampoco conoce a Respiración: por eso lo puede usar Lumia', () => {
    archivosDe('src/lib/respiracion').forEach((ruta) => {
      const codigo = soloCodigo(readFileSync(ruta, 'utf8'))
      expect(codigo).not.toMatch(/breathing/)
    })
  })

  it('el envoltorio de SPEC_08 sigue sin conocer a Respiración', () => {
    // `ritmoRespiracion.js` lo consume Lumia. Si algún día importara el catálogo,
    // Lumia estaría leyendo `breathing/` sin que se note.
    const codigo = soloCodigo(readFileSync('src/lib/ritmoRespiracion.js', 'utf8'))
    expect(codigo).not.toMatch(/breathing/)
    expect(codigo).toMatch(/respiracion\/motorRitmo/)
  })
})
