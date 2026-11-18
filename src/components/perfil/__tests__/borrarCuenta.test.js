// SPEC_24B — Las pantallas de «Borrar mi cuenta».
//
// Se pintan a HTML con una sesión de mentira: lo que se comprueba es qué se
// lee en cada estado, que en la web no aparecen las frases de suscripción y
// compras, y que nada bloquea.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { copy } from '@copy'
import { ContextoSesion } from '@lib/useSesion'
import { ESTADOS_SESION } from '@lib/sesion'
import CapaDeBorrado from '../CapaDeBorrado'
import Despedida from '../Despedida'
import TusDatos from '../TusDatos'

const textos = copy.cuenta.borrar

function pintar(componente, props, sesion = {}) {
  return renderToStaticMarkup(
    createElement(
      ContextoSesion.Provider,
      { value: { estado: ESTADOS_SESION.conCuenta, ...sesion } },
      createElement(componente, props),
    ),
  )
}

const sinEtiquetas = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")

describe('la primera pantalla', () => {
  it('en el iPhone: qué se borra, otros dispositivos, suscripción, compras, exportar, continuar y quedarme', () => {
    const html = pintar(CapaDeBorrado, { iphone: true, onQuedarme() {}, onExportar() {} })
    const texto = sinEtiquetas(html)
    for (const frase of [
      textos.titulo,
      textos.queSeBorra,
      textos.otroDispositivo,
      textos.suscripcion,
      textos.suscripcionEnlace,
      textos.exportarAntes,
      textos.continuar,
      textos.quedarme,
    ]) {
      expect(texto).toContain(frase)
    }
    expect(texto).toContain('Lo que pagaste queda ligado a tu Apple ID')
    expect(html).toContain('href="https://apps.apple.com/account/subscriptions"')
    expect(html).toContain('target="_blank"')
  })

  it('criterio 15: en la web no hay frases de suscripción ni de compras', () => {
    const texto = sinEtiquetas(pintar(CapaDeBorrado, { iphone: false, onQuedarme() {} }))
    expect(texto).not.toContain(textos.suscripcion)
    expect(texto).not.toContain('Apple ID')
    expect(texto).not.toContain(textos.suscripcionEnlace)
    expect(texto).toContain(textos.queSeBorra)
  })

  it('es un diálogo de verdad', () => {
    const html = pintar(CapaDeBorrado, { onQuedarme() {} })
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
  })
})

describe('a medio borrar', () => {
  it('dice qué pasó y ofrece terminar o conservar, sin «Quedarme»', () => {
    const texto = sinEtiquetas(pintar(CapaDeBorrado, { modo: 'aMedias' }))
    expect(texto).toContain(textos.aMediasTitulo)
    expect(texto).toContain(textos.aMediasTexto)
    expect(texto).toContain(textos.terminar)
    expect(texto).toContain(textos.conservar)
    expect(texto).not.toContain(textos.quedarme)
  })
})

describe('la despedida', () => {
  it('una frase y «Cerrar», nada más', () => {
    const texto = sinEtiquetas(renderToStaticMarkup(createElement(Despedida, { onCerrar() {} })))
    expect(texto.trim().replace(/\s+/g, ' ')).toBe(`${textos.despedida} ${textos.cerrar}`)
  })
})

describe('«Borrar mi cuenta» en Tus datos', () => {
  const props = { uid: 'u', exportacion: {}, Puerta: () => null }

  it('con cuenta aparece, como enlace secundario y lo último del bloque', () => {
    const html = pintar(TusDatos, props)
    expect(html).toContain(`>${textos.titulo}</button>`)
    expect(html.lastIndexOf(textos.titulo)).toBeGreaterThan(
      html.indexOf(copy.cuenta.exportar.boton),
    )
  })

  it.each([ESTADOS_SESION.sinCuenta, ESTADOS_SESION.vencida, ESTADOS_SESION.sinConfigurar])(
    'con la sesión %s no aparece',
    (estado) => {
      expect(pintar(TusDatos, props, { estado })).not.toContain(textos.titulo)
    },
  )
})

describe('nada bloquea y nada muestra un código', () => {
  const fuentes = ['CapaDeBorrado.jsx', 'Despedida.jsx', 'TusDatos.jsx'].map((nombre) =>
    readFileSync(`src/components/perfil/${nombre}`, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, ''),
  )

  it('criterio 14: ningún control lleva disabled, required ni aria-invalid', () => {
    for (const fuente of fuentes)
      expect(fuente).not.toMatch(/\bdisabled\b|\brequired\b|aria-invalid/)
  })

  it('el campo BORRAR va sin autocorrección ni sugerencias, y las mayúsculas son solo visuales', () => {
    const capa = fuentes[0]
    expect(capa).toMatch(/type="text"/)
    expect(capa).toMatch(/autoCorrect="off"/)
    expect(capa).toMatch(/autoComplete="off"/)
    expect(capa).toMatch(/spellCheck=\{false\}/)
    expect(capa).toMatch(/className="uppercase"/)
    expect(capa).toMatch(/palabraCoincide\(palabra\)/)
  })

  it('lo que falta se dice junto al campo, con aria-describedby', () => {
    expect(fuentes[0]).toMatch(/aria-describedby=\{nota \? `\$\{id\}-nota` : undefined\}/)
  })
})

describe('el copy del borrado', () => {
  it('es el del §6 y del §9, sin exclamaciones ni léxico de culpa', () => {
    expect(textos.despedida).toBe(
      'Listo. Tu cuenta y tus entradas ya no existen. Gracias por haber estado aquí.',
    )
    expect(textos.entrarAntes).toBe('Para seguir, entra de nuevo a tu cuenta.')
    expect(textos.errorAntes).toBe(
      'No pudimos borrar tu cuenta. No se borró nada. Inténtalo de nuevo con conexión.',
    )
    expect(textos.errorDurante).toBe(
      'No pudimos terminar de borrar tu cuenta. Lo de este teléfono sigue aquí. Inténtalo de nuevo con conexión.',
    )
    const todo = JSON.stringify(textos)
    expect(todo).not.toMatch(/[!¡]/)
    expect(todo).not.toMatch(/esperamos verte|pronto|lamentamos|seguro que/i)
  })
})

describe('el arranque con un borrado interrumpido (DP-24.13)', () => {
  const arranque = readFileSync('src/components/ArranqueProvisional.jsx', 'utf8')

  it('mira la marca antes de entrar a la cuenta: ni restaura ni muda', () => {
    const cuerpo = arranque.slice(arranque.indexOf('async function resolverArranque'))
    expect(cuerpo.indexOf('hayMarcaDeBorrado(uidGuardado)')).toBeGreaterThan(-1)
    expect(cuerpo.indexOf('hayMarcaDeBorrado(uidGuardado)')).toBeLessThan(
      cuerpo.indexOf('entrarACuenta('),
    )
  })

  it('la despedida va delante de todo y «Cerrar» lleva a P1 sin el umbral', () => {
    expect(arranque).toMatch(/if \(despedida\) return <Despedida onCerrar=\{cerrarDespedida\} \/>/)
    expect(arranque).toMatch(/cruzarUmbral\('diario'\)/)
    expect(arranque).toMatch(/navegar\('\/hoy', \{ replace: true \}\)/)
  })

  it('borrar y la pantalla «a medio borrar» se cargan bajo demanda', () => {
    expect(arranque).toMatch(/lazy\(\(\) => import\('@components\/perfil\/CapaDeBorrado'\)\)/)
    expect(arranque).toMatch(/import\('@lib\/borrarCuenta'\)/)
    expect(arranque).not.toMatch(/^import .*borrarCuenta/m)
  })

  it('cerrar sesión no cambia: sigue sin borrar nada de la nube (criterio 21)', () => {
    const salida = readFileSync('src/lib/salidaCuenta.js', 'utf8')
    expect(salida).not.toMatch(/borrarCuenta|writeBatch|deleteUser|vaciarAlmacen/)
    expect(salida).toMatch(/await borrarUid\(uid\)/)
  })
})
