// src/components/onboarding/__tests__/cuentaProveedores.test.js
// SPEC_21.2 — P7 con Google y Apple: qué dice cada tropiezo.
//
// P7 no traduce con `claveDeError`: tiene su propio aviso para el correo en
// uso y la frase genérica para lo demás. Desde 21.2 tiene también el de otro
// método, y cerrar la hoja no dice nada.

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'

import Cuenta from '@components/onboarding/Cuenta'
import { copy } from '@copy'
import { MOTIVOS } from '@lib/cuenta'

const textos = copy.diario.onboarding.p7

const pintar = (motivo) =>
  renderToStaticMarkup(
    createElement(Cuenta, {
      textos,
      enlace: copy.diario.onboarding.entrar.enlace,
      motivo,
      listo: false,
      onProveedor: () => {},
      onCrear: () => {},
      onEntrar: () => {},
      onSaltar: () => {},
    }),
  )

describe('P7: los tropiezos de Google y Apple', () => {
  it('otro método tiene su frase, y no la genérica', () => {
    const html = pintar(MOTIVOS.otroMetodo)
    expect(html).toContain(copy.cuenta.error.otroMetodo)
    expect(html).not.toContain(copy.errors.generic.body)
  })

  it('cerrar la hoja no dice nada', () => {
    const html = pintar(MOTIVOS.rechazado)
    expect(html).not.toContain(copy.errors.generic.body)
    expect(html).not.toContain(textos.emailExists)
    expect(html).toBe(pintar(null))
  })

  it('el correo en uso sigue con su aviso', () => {
    expect(pintar(MOTIVOS.correoEnUso)).toContain(textos.emailExists)
  })

  it('lo demás, la frase genérica de siempre', () => {
    expect(pintar(MOTIVOS.generico)).toContain(copy.errors.generic.body)
  })

  it('en web pinta solo Google, con el botón compartido', () => {
    const html = pintar(null)
    expect(html).toContain('data-proveedor="google"')
    expect(html).not.toContain('data-proveedor="apple"')
  })
})
