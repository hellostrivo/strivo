// src/components/perfil/__tests__/tuCuenta.test.js
// El bloque Tu cuenta y la confirmación de salir (SPEC_19.1 §4.8, §4.9, §4.12).
//
// No hay DOM en el que montarlos: se comprueba el copy entero contra la SPEC
// §4 y, de los componentes, la fuente —lo que pintan, cómo se anuncian y lo
// que no se permiten—.

import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'

import Confirmacion from '@components/shared/Confirmacion'

const BLOQUE = 'src/components/perfil/TuCuenta.jsx'
const DIALOGO = 'src/components/shared/Confirmacion.jsx'

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const bloque = codigoDe(BLOQUE)
const dialogo = codigoDe(DIALOGO)

describe('el copy de Tu cuenta es el de la SPEC §4, literal', () => {
  it('copy.cuenta, clave por clave', () => {
    expect(copy.cuenta).toEqual({
      bloque: { titulo: 'Tu cuenta' },
      estado: {
        sinCuenta: 'Sin cuenta. Puedes crear una cuando quieras.',
        conCuenta: '{correo}',
        vencida:
          'La sesión se cerró en este teléfono. Lo que escribiste sigue aquí; entra de nuevo para que se respalde.',
        sinConfigurar: 'Las cuentas no están disponibles en esta versión.',
      },
      acciones: {
        entrar: 'Entrar a mi cuenta',
        crear: 'Crear una cuenta',
        salir: 'Cerrar sesión',
      },
      formulario: {
        tituloEntrar: 'Entrar',
        tituloCrear: 'Crear una cuenta',
        correo: 'Correo',
        contrasena: 'Contraseña',
        entrar: 'Entrar',
        olvide: 'Olvidé mi contraseña',
        volver: 'Volver',
      },
      recuperar: {
        titulo: 'Recuperar acceso',
        texto: 'Te enviaremos un enlace para elegir una contraseña nueva.',
        boton: 'Enviarme un enlace',
        enviado: 'Si ese correo tiene una cuenta, recibirás un enlace en unos minutos.',
      },
      salir: {
        titulo: 'Cerrar sesión',
        texto:
          'Lo que escribiste está guardado en tu cuenta y vuelve cuando entres. De este teléfono se quita todo, también el PIN del journal.',
        pendiente:
          'Hay cosas que todavía no llegan a tu cuenta. Cuando vuelva la conexión podrás cerrar sesión sin perder nada.',
        confirmar: 'Cerrar sesión',
        cancelar: 'Quedarme',
      },
      error: {
        credenciales: 'Ese correo y esa contraseña no coinciden.',
        sinConexion: 'Sin conexión. Inténtalo cuando vuelva.',
        generico: 'Algo no salió bien. Inténtalo de nuevo en un momento.',
      },
    })
  })

  it('formulario.google y formulario.crear se leen de P7, sin duplicarse', () => {
    expect(copy.cuenta.formulario).not.toHaveProperty('google')
    expect(copy.cuenta.formulario).not.toHaveProperty('crear')
    expect(copy.diario.onboarding.p7.google).toBe('Continuar con Google')
    expect(copy.diario.onboarding.p7.create).toBe('Crear cuenta')
    expect(bloque).toMatch(/copy\.diario\.onboarding\.p7/)
    expect(bloque).toMatch(/P7\.create/)
    expect(bloque).toMatch(/P7\[proveedor\]/)
  })

  it('el bloque tiene su título donde lo tienen todos, y es el mismo objeto', () => {
    expect(copy.diario.perfil.cuenta).toBe(copy.cuenta.bloque)
  })

  it('ningún texto lleva exclamación, código de error ni marca de género', () => {
    const todo = JSON.stringify(copy.cuenta)
    expect(todo).not.toMatch(/[!¡]/)
    expect(todo).not.toMatch(/auth\/|error \d|código/i)
    expect(todo).not.toMatch(/"m":|"f":|"n":/)
  })
})

describe('el bloque Tu cuenta', () => {
  it('lee la sesión del contexto y no decide la cuenta por el uid', () => {
    expect(bloque).toMatch(/useSesion\(\)/)
    expect(bloque).not.toMatch(/'local-'|esUidDeCuenta/)
  })

  it('las vistas son vistas: sin rutas nuevas', () => {
    expect(bloque).not.toMatch(/react-router|navigate|<Route/i)
    expect(bloque).toMatch(/entrar: 'entrar'/)
    expect(bloque).toMatch(/crear: 'crear'/)
    expect(bloque).toMatch(/recuperar: 'recuperar'/)
  })

  it('autocomplete según la SPEC §5', () => {
    expect(bloque).toMatch(/autoComplete="email"/)
    expect(bloque).toMatch(/creando \? 'new-password' : 'current-password'/)
  })

  it('los errores se anuncian con aria-describedby y llevan el foco al primer campo', () => {
    expect(bloque).toMatch(/aria-describedby=\{descrito\}/)
    expect(bloque).toMatch(/if \(error\) campoCorreo\.current\?\.focus\(\)/)
  })

  it('nada bloquea: ni disabled, ni required, ni aria-invalid, y el navegador no valida', () => {
    expect(bloque).not.toMatch(/\b(disabled|required|aria-invalid)\b/)
    expect(bloque).toMatch(/noValidate/)
  })

  it('criterio 12: los proveedores salen de PROVEEDORES_WEB y Apple no aparece', () => {
    expect(bloque).toMatch(/PROVEEDORES_WEB\.map/)
    expect(bloque).not.toMatch(/apple/i)
  })

  it('cerrar la ventana de Google no es un error que haya que decir', () => {
    expect(bloque).toMatch(/if \(motivo === MOTIVOS\.rechazado\) return null/)
  })

  it('con cosas sin subir, la confirmación solo ofrece quedarse', () => {
    expect(bloque).toMatch(
      /salida === SALIDA\.pendiente \? textos\.salir\.pendiente : textos\.salir\.texto/,
    )
    expect(bloque).toMatch(/salida === SALIDA\.libre\s*\?\s*\{ texto: textos\.salir\.confirmar/)
  })

  it('ningún texto vive en el componente (RN-VOZ-01) ni hay tonalidades literales', () => {
    ;[bloque, dialogo].forEach((codigo) => {
      expect(codigo.match(/>[^<>{}\n]{12,}</g) ?? []).toEqual([])
      expect(codigo).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(codigo).not.toMatch(/\b(?:bg|text|border)-(?:white|black|gray-\d+)\b/)
    })
  })
})

describe('Confirmacion (DP-19.2)', () => {
  const props = {
    abierta: true,
    titulo: 'Título',
    texto: 'Texto',
    cancelar: { texto: 'Quedarme', onClick: () => {} },
  }

  it('cerrada no pinta nada', () => {
    expect(renderToStaticMarkup(createElement(Confirmacion, { ...props, abierta: false }))).toBe('')
  })

  it('es un diálogo modal con nombre y descripción', () => {
    const html = renderToStaticMarkup(createElement(Confirmacion, props))
    expect(html).toMatch(/role="dialog"/)
    expect(html).toMatch(/aria-modal="true"/)
    const titulo = html.match(/aria-labelledby="([^"]+)"/)[1]
    const texto = html.match(/aria-describedby="([^"]+)"/)[1]
    expect(html).toContain(`id="${titulo}"`)
    expect(html).toContain(`id="${texto}"`)
  })

  it('con una sola acción pinta un botón; con dos, dos', () => {
    const una = renderToStaticMarkup(createElement(Confirmacion, props))
    expect(una.match(/<button/g)).toHaveLength(1)
    const dos = renderToStaticMarkup(
      createElement(Confirmacion, {
        ...props,
        confirmar: { texto: 'Cerrar sesión', onClick: () => {} },
      }),
    )
    expect(dos.match(/<button/g)).toHaveLength(2)
    // La que no destruye nada va primero: es la que recibe el foco.
    expect(dos.indexOf('Quedarme')).toBeLessThan(dos.indexOf('Cerrar sesión'))
  })

  it('Escape cancela, el foco queda atrapado y vuelve a quien lo abrió', () => {
    expect(dialogo).toMatch(/evento\.key === 'Escape'/)
    expect(dialogo).toMatch(/cancelar\.onClick\(\)/)
    expect(dialogo).toMatch(/evento\.key !== 'Tab'/)
    expect(dialogo).toMatch(/const anterior = document\.activeElement/)
    expect(dialogo).toMatch(/anterior\.focus\(\)/)
  })

  it('sin animación y sin importar nada de una sección (RN-TEC-05)', () => {
    expect(dialogo).not.toMatch(/transition|animate|keyframes/)
    expect(dialogo).not.toMatch(/from '@\/(diario|breathing|perfil|onboarding)/)
    expect(dialogo).not.toMatch(/from '@copy'/)
  })
})
