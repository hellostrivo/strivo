// src/components/shared/__tests__/unaVez.test.js
// SPEC_21.2 — un toque a la vez en los botones que esperan a la red. En la app
// de iPhone, dos `signInWithApple` seguidos se pisan el nonce y la llamada
// guardada del plugin.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'

import { unaVezCon } from '@components/shared/unaVez'

/** Una promesa que se resuelve cuando la prueba lo dice. */
function pendiente() {
  let resolver, rechazar
  const promesa = new Promise((r, x) => {
    resolver = r
    rechazar = x
  })
  return { promesa, resolver, rechazar }
}

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
const codigoDe = (ruta) =>
  readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1')

describe('unaVezCon', () => {
  it('el segundo toque, con el primero en camino, no hace nada', async () => {
    const espera = pendiente()
    let llamadas = 0
    const unaVez = unaVezCon({ current: false })
    const primero = unaVez(() => {
      llamadas += 1
      return espera.promesa
    })
    await unaVez(async () => {
      llamadas += 1
    })
    expect(llamadas).toBe(1)
    espera.resolver()
    await primero
  })

  it('al terminar el primero, el siguiente toque sí entra', async () => {
    let llamadas = 0
    const unaVez = unaVezCon({ current: false })
    await unaVez(async () => {
      llamadas += 1
    })
    await unaVez(async () => {
      llamadas += 1
    })
    expect(llamadas).toBe(2)
  })

  it('si el primero falla, el freno se suelta igual', async () => {
    const ocupado = { current: false }
    const unaVez = unaVezCon(ocupado)
    await expect(
      unaVez(async () => {
        throw new Error('red')
      }),
    ).rejects.toThrow('red')
    expect(ocupado.current).toBe(false)
  })

  it('el freno es de cada referencia: dos componentes no se frenan entre sí', async () => {
    const espera = pendiente()
    const uno = unaVezCon({ current: false })
    const otro = unaVezCon({ current: false })
    let llamadas = 0
    const enCamino = uno(() => espera.promesa)
    await otro(async () => {
      llamadas += 1
    })
    expect(llamadas).toBe(1)
    espera.resolver()
    await enCamino
  })
})

describe('P7 frena el segundo toque en Google y Apple', () => {
  const p7 = codigoDe('src/components/onboarding/Cuenta.jsx')

  it('los botones de proveedor pasan por el freno', () => {
    expect(p7).toMatch(/const unaVez = unaVezCon\(ocupado\)/)
    expect(p7).toMatch(/onClick=\{\(\) => unaVez\(\(\) => onProveedor\(proveedor\)\)\}/)
    expect(p7).not.toMatch(/onClick=\{\(\) => onProveedor\(/)
  })

  it('sin apagar nada: ni disabled, ni required, ni aria-invalid', () => {
    expect(p7).not.toMatch(/disabled|required|aria-invalid/)
  })

  it('el formulario compartido y Tu cuenta usan el mismo freno, sin copias', () => {
    for (const ruta of [
      'src/components/shared/FormularioEntrar.jsx',
      'src/components/perfil/TuCuenta.jsx',
    ]) {
      const codigo = codigoDe(ruta)
      expect(codigo).toMatch(/const unaVez = unaVezCon\(ocupado\)/)
      expect(codigo).not.toMatch(/if \(ocupado\.current\) return/)
    }
  })
})
