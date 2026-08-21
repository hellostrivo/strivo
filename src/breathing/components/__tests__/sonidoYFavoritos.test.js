// src/breathing/components/__tests__/sonidoYFavoritos.test.js
// Criterios 32, 33, 35 y 36 de SPEC_15, sobre la fuente.
//
// Mismo camino que SPEC_08 y SPEC_14: el entorno es `node`, sin DOM, así que lo
// que no es lógica pura se vigila leyendo el código. Y buena parte de lo que
// SPEC_15 pide es ausencia —ni un archivo de audio, ni una dependencia nueva, ni
// un string escrito a mano— que es justamente lo que no se renderiza.

import { readFileSync, readdirSync, statSync } from 'fs'
import { extname, join } from 'path'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { CATALOGO_SONIDOS } from '../../data/catalogoSonidos.js'
import { subtitulo, duracionCorta } from '../favoritos/FilaFavorito.jsx'

const COMPONENTES = 'src/breathing/components'
const PANEL = `${COMPONENTES}/PanelSonido.jsx`
const FILA = `${COMPONENTES}/favoritos/FilaFavorito.jsx`
const LISTA = `${COMPONENTES}/favoritos/ListaFavoritos.jsx`
const DIALOGO = `${COMPONENTES}/favoritos/DialogoGuardar.jsx`
const VACIO = `${COMPONENTES}/favoritos/EstadoVacio.jsx`

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

function archivosDe(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    return statSync(ruta).isDirectory() ? archivosDe(ruta) : [ruta]
  })
}

const NUEVOS = [PANEL, FILA, LISTA, DIALOGO, VACIO]

describe('el repo no engorda por audio (criterios 35 y 36, RN-RE-SND-00)', () => {
  it('no hay ni un archivo de audio en todo el árbol', () => {
    const extensiones = ['.mp3', '.ogg', '.wav', '.m4a', '.aac', '.flac', '.opus', '.webm']
    const sospechosos = ['src', 'public', 'docs']
      .flatMap((raiz) => {
        try {
          return archivosDe(raiz)
        } catch {
          return []
        }
      })
      .filter((ruta) => extensiones.includes(extname(ruta)))

    // §1 — Si una fuente no alcanza la calidad esperada se reporta y se deja
    // fuera; no se resuelve metiendo un archivo. Bosque es el caso, y por eso
    // no está.
    expect(sospechosos).toEqual([])
  })

  it('no se añadió ninguna dependencia de audio', () => {
    const paquete = JSON.parse(readFileSync('package.json', 'utf8'))
    const todas = Object.keys({ ...paquete.dependencies, ...paquete.devDependencies })
    const deAudio = todas.filter((nombre) =>
      /audio|sound|howler|tone|wav|mp3|standardized/i.test(nombre),
    )
    expect(deAudio).toEqual([])
  })

  it('las dependencias son las mismas ocho de siempre', () => {
    const paquete = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(Object.keys(paquete.dependencies).sort()).toEqual([
      '@fontsource-variable/inter',
      'clsx',
      'date-fns',
      'firebase',
      'idb',
      'react',
      'react-dom',
      'react-router-dom',
    ])
  })

  it('ninguna fuente carga un archivo: todo se sintetiza', () => {
    for (const ruta of archivosDe('src/breathing/audio').filter((r) => !r.includes('__tests__'))) {
      const codigo = codigoDe(ruta)
      expect(`${ruta}`).toBe(ruta)
      expect(codigo).not.toMatch(/fetch\(|decodeAudioData|new Audio\(|\.mp3|\.ogg|\.wav/)
    }
  })
})

describe('todo lo que se lee viene del copy (criterio 33)', () => {
  it.each(NUEVOS)('%s no escribe texto a mano', (ruta) => {
    const codigo = codigoDe(ruta)
    const sueltos = [...codigo.matchAll(/>\s*([A-Za-zÁÉÍÓÚÑáéíóúñ][^<>{}]{2,})\s*</g)]
      .map((m) => m[1].trim())
      .filter((texto) => texto.length > 0)
    expect(sueltos).toEqual([])
  })

  it.each(NUEVOS)('%s importa el copy', (ruta) => {
    expect(codigoDe(ruta)).toMatch(/from '@copy'/)
  })

  it('los seis sonidos tienen nombre y descripción', () => {
    for (const entrada of CATALOGO_SONIDOS) {
      const textos = copy.respiracion.sonidos[entrada.claveCopy]
      expect(textos?.nombre).toBeTruthy()
      expect(textos?.descripcion).toBeTruthy()
    }
  })

  it('el catálogo y el copy no se pueden separar sin que se note', () => {
    const claves = CATALOGO_SONIDOS.map((entrada) => entrada.claveCopy).sort()
    const enCopy = Object.entries(copy.respiracion.sonidos)
      .filter(([, valor]) => typeof valor === 'object')
      .map(([clave]) => clave)
      .sort()
    expect(enCopy).toEqual(claves)
  })
})

describe('el área táctil (criterio 32, RN-RE-FAV-14)', () => {
  it.each(NUEVOS)('%s: todo control interactivo declara 44 px', (ruta) => {
    // Las flechas de los manejadores llevan un `>` dentro, así que trocear el
    // JSX por el primer `>` cortaba los elementos por la mitad y daba por
    // incumplidores a controles que sí tenían la clase. Se neutralizan antes.
    const codigo = codigoDe(ruta).replace(/=>/g, '=»')
    const controles = codigo.match(/<(button|input)[\s\S]*?\/?>/g) ?? []
    const sinMedida = controles.filter((control) => !control.includes('min-h-[44px]'))
    // 44 px es la medida por debajo de la cual un dedo empieza a fallar, y
    // fallar aquí significa reproducir un sonido que no se quería o borrar una
    // combinación en vez de cargarla.
    expect(sinMedida.map((c) => c.slice(0, 60))).toEqual([])
  })

  it('el menú de opciones se separa del toque que carga', () => {
    // Con las dos áreas pegadas, un dedo que apunta a "Eliminar" acaba cargando
    // otra cosa, y al revés.
    const codigo = codigoDe(FILA)
    expect(codigo).toMatch(/min-w-\[44px\]/)
    expect(codigo).toMatch(/gap-2/)
  })

  it('los deslizadores llevan etiqueta accesible con su valor en palabras', () => {
    const codigo = codigoDe(PANEL)
    // Un lector de pantalla leyendo "0,55" no le sirve a nadie.
    expect(codigo).toMatch(/aria-valuetext=/)
    expect(codigo).toMatch(/aria-pressed=/)
  })

  it('el diálogo se anuncia como diálogo', () => {
    const codigo = codigoDe(DIALOGO)
    expect(codigo).toMatch(/role="dialog"/)
    expect(codigo).toMatch(/aria-modal="true"/)
  })

  it('Enter confirma y Escape cancela (RN-RE-FAV-15)', () => {
    const codigo = codigoDe(DIALOGO)
    expect(codigo).toMatch(/evento\.key === 'Enter'/)
    expect(codigo).toMatch(/evento\.key === 'Escape'/)
  })

  it('el campo llega seleccionado, no solo enfocado (RN-RE-FAV-04)', () => {
    // Escribir sustituye en vez de añadirse al final de un nombre que no se pidió.
    expect(codigoDe(DIALOGO)).toMatch(/campo\.current\?\.select\(\)/)
  })
})

describe('el estado vacío no pide lo imposible (RN-RE-FAV-16)', () => {
  it('no ofrece crear un favorito de la nada', () => {
    // No se puede guardar una combinación sin una de partida: un botón aquí
    // llevaría a un formulario vacío, que es pedirle a alguien que configure a
    // ciegas lo que debería descubrir respirando.
    const codigo = codigoDe(VACIO)
    expect(codigo).not.toMatch(/<button|onClick/)
  })

  it('invita en vez de acusar', () => {
    const texto = copy.respiracion.vacio.sinFavoritos
    expect(texto).not.toMatch(/vacío|sin nada|no tienes nada/i)
    expect(texto).toMatch(/Cuando/)
  })
})

describe('el subtítulo de una fila (§4.3)', () => {
  const base = {
    patronBaseId: 'cuatro-siete-ocho',
    sonidoAmbienteId: 'lluvia',
    duracion: { modo: 'minutos', valor: 10 },
  }

  it('junta patrón, sonido y duración', () => {
    expect(subtitulo(base)).toBe('4-7-8 · Lluvia · Unos 10 minutos')
  })

  it('omite el sonido si es silencio', () => {
    // "Silencio" en la línea de resumen ocupa el sitio de algo que sí informa, y
    // la ausencia de sonido ya se nota al usarla.
    expect(subtitulo({ ...base, sonidoAmbienteId: 'silencio' })).toBe('4-7-8 · Unos 10 minutos')
  })

  it('un sonido que ya no existe tampoco se nombra (RN-RE-FAV-12)', () => {
    expect(subtitulo({ ...base, sonidoAmbienteId: 'bosque' })).toBe('4-7-8 · Unos 10 minutos')
  })

  it('se genera al vuelo: cambiar el copy de un patrón cambia las filas guardadas', () => {
    expect(subtitulo(base)).toContain(copy.respiracion.patrones.cuatroSieteOcho.nombre)
  })

  it('la duración se dice en la forma corta de SPEC_13', () => {
    expect(duracionCorta({ modo: 'ciclos', valor: 8 })).toBe('8 respiraciones')
    expect(duracionCorta({ modo: 'minutos', valor: 3 })).toBe('Unos 3 minutos')
    expect(duracionCorta({ modo: 'abierta' })).toBe('Hasta que quieras')
  })
})

describe('Respiración sigue sin conocer a nadie (RN-RE-DAT-09)', () => {
  it('ningún archivo nuevo importa lumia/ ni formia/', () => {
    for (const ruta of NUEVOS) {
      const imports = codigoDe(ruta).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
      imports.forEach((linea) => expect(`${ruta}: ${linea}`).not.toMatch(/lumia|formia/i))
    }
  })

  it('el contexto de audio compartido tampoco', () => {
    const codigo = codigoDe('src/lib/audio/contextoAudio.js')
    expect(codigo).not.toMatch(/lumia|formia|breathing/i)
  })
})
