// SPEC_24A — Cómo llega el archivo a la persona, y la pantalla que lo ofrece.
//
// La hoja de compartir y la descarga no se pueden ver aquí: se comprueba lo
// que hace el código alrededor de ellas, con el doble que se porta como el
// Proxy de Capacitor (`dobleDeCapacitor.js`).

import { describe, expect, it, vi } from 'vitest'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { pluginDeCapacitor, aTiempo } from './dobleDeCapacitor.js'
import { aBase64, entregarNativo, esCancelacionDeHoja } from '@lib/exportar/entregarNativo'
import { ENTREGA, descargar, entregar } from '@lib/exportar/entregar'
import { copy } from '@copy'
import BloqueoPin from '@components/diario/BloqueoPin'

function plugins({ compartir = async () => ({}) } = {}) {
  const llamadas = []
  const almacen = pluginDeCapacitor({
    escribirTemporal: async (opciones) => {
      llamadas.push(['escribir', opciones])
      return { url: 'file:///Caches/Strivo/exportar/strivo-ana-2026-11-15.zip' }
    },
    borrarTemporal: async (opciones) => {
      llamadas.push(['borrar', opciones])
    },
  })
  const hoja = pluginDeCapacitor({
    share: async (opciones) => {
      llamadas.push(['compartir', opciones])
      return compartir(opciones)
    },
  })
  return { llamadas, cargar: async () => ({ compartir: hoja, almacen }) }
}

describe('la hoja de compartir del iPhone', () => {
  const bytes = new Uint8Array([80, 75, 3, 4, 0, 255])

  it('escribe el zip en Caches, lo comparte y lo borra después', async () => {
    const { llamadas, cargar } = plugins()
    const r = await aTiempo(entregarNativo(bytes, 'strivo-ana-2026-11-15.zip', { cargar }))
    expect(r).toBe('compartido')
    expect(llamadas.map(([q]) => q)).toEqual(['escribir', 'compartir', 'borrar'])
    expect(llamadas[0][1]).toEqual({ nombre: 'strivo-ana-2026-11-15.zip', base64: aBase64(bytes) })
    expect(llamadas[1][1].files).toEqual([
      'file:///Caches/Strivo/exportar/strivo-ana-2026-11-15.zip',
    ])
    expect(llamadas[2][1]).toEqual({
      url: 'file:///Caches/Strivo/exportar/strivo-ana-2026-11-15.zip',
    })
  })

  it('criterio E2: cerrar la hoja no es un error, y el archivo se borra igual', async () => {
    const { llamadas, cargar } = plugins({
      compartir: async () => {
        throw new Error('Share canceled')
      },
    })
    expect(await aTiempo(entregarNativo(bytes, 'a.zip', { cargar }))).toBe('cancelado')
    expect(llamadas.at(-1)[0]).toBe('borrar')
  })

  it('un fallo de verdad se deja pasar, y el archivo se borra igual', async () => {
    const { llamadas, cargar } = plugins({
      compartir: async () => {
        throw new Error('Error sharing item')
      },
    })
    await expect(entregarNativo(bytes, 'a.zip', { cargar })).rejects.toThrow('Error sharing item')
    expect(llamadas.at(-1)[0]).toBe('borrar')
  })

  it('solo «Share canceled» es cancelar', () => {
    expect(esCancelacionDeHoja(new Error('Share canceled'))).toBe(true)
    expect(esCancelacionDeHoja(new Error('Error sharing item'))).toBe(false)
    expect(esCancelacionDeHoja(null)).toBe(false)
  })

  it('el base64 es el de los bytes, también con archivos grandes', () => {
    expect(aBase64(new Uint8Array([104, 111, 108, 97]))).toBe('aG9sYQ==')
    const grande = new Uint8Array(200000).map((_, i) => i % 256)
    expect(Buffer.from(aBase64(grande), 'base64').equals(Buffer.from(grande))).toBe(true)
  })

  it('los plugins se cargan envueltos, nunca sueltos de una promesa', () => {
    const fuente = readFileSync('src/lib/exportar/entregarNativo.js', 'utf8')
    expect(fuente).toMatch(/return \{ compartir: Share, almacen: StrivoAlmacen \}/)
  })
})

describe('la descarga de la web', () => {
  it('crea un enlace con download, lo toca y lo retira', () => {
    const toques = []
    const enlace = {
      click: () => toques.push('click'),
      remove: () => toques.push('remove'),
    }
    const documento = {
      createElement: (etiqueta) => {
        expect(etiqueta).toBe('a')
        return enlace
      },
      body: { appendChild: () => toques.push('append') },
    }
    vi.useFakeTimers()
    try {
      expect(descargar(new Uint8Array([1]), 'strivo-2026-11-15.zip', { documento })).toBe(
        ENTREGA.descargado,
      )
      expect(enlace.download).toBe('strivo-2026-11-15.zip')
      expect(enlace.href).toMatch(/^blob:/)
      expect(toques).toEqual(['append', 'click', 'remove'])
    } finally {
      vi.runAllTimers()
      vi.useRealTimers()
    }
  })

  it('criterio 15: en la web no se carga ningún plugin nativo', async () => {
    const fuente = readFileSync('src/lib/exportar/entregar.js', 'utf8')
    expect(fuente).toMatch(/if \(!nativa\) return descargar\(bytes, nombre\)/)
    expect(fuente).toMatch(/await import\('\.\/entregarNativo\.js'\)/)
    expect(fuente).not.toMatch(/@capacitor\/share|strivo-almacen/)
  })

  it('entregar en la web es una descarga', async () => {
    const anterior = globalThis.document
    globalThis.document = {
      createElement: () => ({ click() {}, remove() {} }),
      body: { appendChild() {} },
    }
    try {
      expect(await entregar(new Uint8Array([1]), 'a.zip', { nativa: false })).toBe('descargado')
    } finally {
      globalThis.document = anterior
    }
  })
})

describe('la pantalla', () => {
  const textos = copy.cuenta.exportar

  it('los textos son los del §6, sin exclamaciones', () => {
    expect(textos.titulo).toBe('Llevarme lo que escribí')
    expect(textos.texto).toBe(
      'Un archivo con todas tus entradas, tal como las escribiste. Es tuyo.',
    )
    expect(textos.boton).toBe('Preparar mi archivo')
    expect(textos.preparando).toBe('Preparando tu archivo')
    expect(textos.descargado).toBe('Listo. Tu archivo se descargó.')
    expect(textos.error).toBe(
      'No pudimos preparar tu archivo. Lo que escribiste sigue aquí. Inténtalo de nuevo.',
    )
    expect(textos.incompleto).toBe(
      'Puede que el archivo no tenga todo: algo de lo que guardaste en la nube todavía no llega a este teléfono.',
    )
    expect(copy.diario.perfil.tusDatos.titulo).toBe('Tus datos')
    expect(JSON.stringify(textos)).not.toMatch(/[!¡]/)
  })

  it('TusDatos no apaga el botón y dice lo que pasa en voz baja', () => {
    const fuente = readFileSync('src/components/perfil/TusDatos.jsx', 'utf8')
    expect(fuente).not.toMatch(/disabled|required|aria-invalid/)
    expect(fuente).toMatch(/aria-live="polite"/)
    expect(fuente).toMatch(/unaVezCon/)
    // Lo que sabe del diario le llega por props: perfil no importa diario.
    expect(fuente).not.toMatch(/from '@\/diario|from '@\/breathing|exportarCuenta/)
  })

  it('Tu perfil recibe la exportación y la puerta desde App.jsx', () => {
    const perfil = readFileSync('src/components/perfil/Perfil.jsx', 'utf8')
    expect(perfil).toMatch(
      /<TusDatos\s+uid=\{uid\}\s+exportacion=\{exportacion\}\s+Puerta=\{Puerta\}/,
    )
    expect(perfil).not.toMatch(/from '@\/diario/)
    const app = readFileSync('src/App.jsx', 'utf8')
    expect(app).toMatch(/Puerta=\{PuertaDelJournal\}/)
  })

  it('DP-24.6: la puerta es la del Journal, no una copia', () => {
    const puerta = readFileSync('src/components/diario/PuertaDelJournal.jsx', 'utf8')
    expect(puerta).toMatch(/usePin\(uid\)/)
    expect(puerta).toMatch(/<BloqueoPin modo="desbloqueo"/)
    expect(puerta).toMatch(/onCerrar=\{onCerrar\}/)
  })

  const estado = {
    activo: true,
    metodo: { tipo: 'email', valor: 'a@b.c' },
    puedeActivar: true,
    sinSalida: false,
    biometria: { estado: 'apagada', disponible: false, tipo: null },
  }

  it('BloqueoPin en desbloqueo ofrece «Cerrar» solo si se lo piden', () => {
    const conCerrar = renderToStaticMarkup(
      createElement(BloqueoPin, { modo: 'desbloqueo', estado, acciones: {}, onCerrar: () => {} }),
    )
    const sinCerrar = renderToStaticMarkup(
      createElement(BloqueoPin, { modo: 'desbloqueo', estado, acciones: {} }),
    )
    const cerrar = copy.diario.journal.pin.cerrar
    expect(conCerrar).toContain(`>${cerrar}</button>`)
    expect(sinCerrar).not.toContain(`>${cerrar}</button>`)
    // El Journal sigue igual: no se la pasa.
    expect(readFileSync('src/pages/diario/Journal.jsx', 'utf8')).toMatch(
      /<BloqueoPin modo="desbloqueo" estado=\{pin\.estado\} acciones=\{pin\.acciones\} \/>/,
    )
  })
})
