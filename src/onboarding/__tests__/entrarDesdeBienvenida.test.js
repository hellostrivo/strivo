// src/onboarding/__tests__/entrarDesdeBienvenida.test.js
// Entrar a una cuenta desde la bienvenida (SPEC_30 §4 y §7).
//
// Como en `cuentaExistente.test.js`, la restauración y la mudanza son las de
// verdad, sobre un Firestore de mentira y `fake-indexeddb`: lo que se prueba es
// dónde se retoma tras entrar desde P1, con qué aviso y qué cae en cada árbol.
// El hook y los componentes no se montan —las pruebas corren sin navegador—, y
// lo que queda en ellos se vigila leyendo la fuente o pintando a HTML.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import * as shared from '@lib/db/shared'
import { listQueue } from '@lib/db/local'
import { paths } from '@lib/db/schema'
import { UID, resetLocalDB } from '@lib/db/__tests__/helpers.js'
import { MOTIVOS, claveDeError } from '@lib/cuenta'
import { copy } from '@copy'
import { PASOS } from '../pasos.js'

import Bienvenida from '@components/onboarding/Bienvenida'
import Entrar from '@components/onboarding/Entrar'

const CUENTA = 'AbC123firebaseUid'
const T0 = '2026-09-17T12:00:00.000Z'

// ─── Firestore de mentira, el patrón de `entradaCuenta.test.js` ──────────────

const nube = new Map()
const control = { fallar: false }

vi.mock('@lib/firebase', () => ({ db: { __fake: true } }))
vi.mock('../../lib/firebase.js', () => ({ db: { __fake: true } }))
vi.mock('firebase/firestore', () => {
  const snap = (path, data) => ({
    id: path.split('/').pop(),
    exists: () => data !== undefined,
    data: () => data,
  })
  const esperar = async () => {
    if (control.fallar) throw new Error('sin permiso')
  }
  return {
    doc: (_db, path) => ({ path }),
    collection: (_db, path) => ({ path }),
    documentId: () => '__name__',
    orderBy: () => ({}),
    limit: (n) => ({ limit: n }),
    startAfter: () => ({}),
    query: (col) => ({ col }),
    getDoc: async (ref) => {
      await esperar()
      return snap(ref.path, nube.get(ref.path))
    },
    getDocs: async ({ col }) => {
      await esperar()
      const prefijo = `${col.path}/`
      const ids = [...nube.keys()]
        .filter((k) => k.startsWith(prefijo) && !k.slice(prefijo.length).includes('/'))
        .sort()
      return { docs: ids.map((k) => snap(k, nube.get(k))) }
    },
  }
})

const { entrarACuenta, mudanzaPendiente } = await import('@lib/entradaCuenta')
const { leerPuerta } = await import('@/presentacion/entrada')
const escritura = await import('../escritura.js')
const traspaso = await import('../traspaso.js')
const { AVISOS_DE_ENTRADA: AVISOS } = traspaso

function enNube(sufijo, data) {
  nube.set(`users/${CUENTA}/${sufijo}`, data)
}

/** La cuenta en la nube, con el onboarding terminado o dejado en `paso`. */
function cuentaEnNube({ terminada, paso = 'p3' }) {
  enNube('shared/profile', { name: 'Alejandra', gender: 'f', updatedAt: T0 })
  enNube('shared/onboarding', {
    version: 4,
    currentStep: terminada ? 'p8' : paso,
    completedSteps: [],
    completedAt: terminada ? T0 : null,
    tourCompletedAt: terminada ? T0 : null,
    updatedAt: T0,
  })
}

/** La sesión anónima recién llegada a la bienvenida: solo la semilla. */
async function sesionEnP1() {
  await shared.initShared(UID)
}

/** Lo que hace la sesión al conectar una cuenta que ya existía. */
const conectarEntrando = async (cuenta) => {
  await entrarACuenta(UID, cuenta)
  return { ok: true }
}

const sharedEncolado = async (uid) =>
  (await listQueue(uid)).map((e) => e.path).filter((p) => p.includes('/shared/'))

function localStorageDeMentira() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

beforeEach(async () => {
  nube.clear()
  control.fallar = false
  vi.stubGlobal('localStorage', localStorageDeMentira())
  vi.stubGlobal('navigator', { onLine: true })
  await resetLocalDB()
  traspaso.retirarTraspaso(CUENTA)
  traspaso.retirarTraspaso(UID)
})

afterEach(() => vi.unstubAllGlobals())

/** El código sin comentarios: lo que se ejecuta, no lo que se explica. */
function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const contenedor = codigoDe('src/components/onboarding/Onboarding.jsx')
const hook = codigoDe('src/onboarding/useOnboarding.js')
const arranque = codigoDe('src/components/ArranqueProvisional.jsx')
const formulario = codigoDe('src/components/shared/FormularioEntrar.jsx')
const textos = copy.diario.onboarding

// ─── Los casos de §4.1 ────────────────────────────────────────────────────────

describe('SPEC_30 §4.1 — entrar desde la bienvenida', () => {
  it('C1: con la cuenta terminada, la puerta dice que no queda onboarding y nada de shared/ sube', async () => {
    cuentaEnNube({ terminada: true })
    await sesionEnP1()

    await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, email: 'ale@ejemplo.com', nueva: false },
      conectarEntrando,
      () => false,
      { desde: PASOS.bienvenida },
    )

    expect(await leerPuerta(CUENTA)).toEqual([false, false])
    expect((await shared.getProfile(CUENTA)).name).toBe('Alejandra')
    expect(await sharedEncolado(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'profile'))
    expect(await sharedEncolado(CUENTA)).not.toContain(paths.sharedDoc(CUENTA, 'onboarding'))
  })

  it('C2: con el onboarding a medias, se retoma en el paso de la cuenta, no en P8 ni en P1', async () => {
    cuentaEnNube({ terminada: false, paso: 'p3' })
    await sesionEnP1()

    await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, email: null, nueva: false },
      conectarEntrando,
      () => false,
      { desde: PASOS.bienvenida },
    )

    expect((await leerPuerta(CUENTA))[0]).toBe(true)
    const { expediente, perfil } = await escritura.leerRecorrido(CUENTA)
    expect(perfil.name).toBe('Alejandra')
    const retomar = traspaso.retomarTrasCuenta(
      CUENTA,
      expediente.currentStep,
      Boolean(mudanzaPendiente(CUENTA)),
    )
    expect(retomar).toEqual({ paso: 'p3', motivo: null })
    expect(retomar.entrada).toBeUndefined()
  })

  it('C3: una cuenta sin nada en la nube retoma en P2, nunca en la bienvenida', async () => {
    await sesionEnP1()

    await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, email: null, nueva: false },
      conectarEntrando,
      () => false,
      { desde: PASOS.bienvenida },
    )

    const { expediente } = await escritura.leerRecorrido(CUENTA)
    expect(traspaso.retomarTrasCuenta(CUENTA, expediente?.currentStep).paso).toBe(PASOS.nombre)
  })

  it('pasoTrasEntrar: nunca P1; lo demás, el paso guardado', () => {
    expect(traspaso.pasoTrasEntrar(null)).toBe(PASOS.nombre)
    expect(traspaso.pasoTrasEntrar('p1')).toBe(PASOS.nombre)
    expect(traspaso.pasoTrasEntrar('p5')).toBe('p5')
    expect(traspaso.pasoTrasEntrar('p4')).toBe('p5')
  })

  it('C4: una cuenta nueva no deja nada apuntado y el contenedor lo dice en la vista', async () => {
    const r = await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, nueva: true },
      async () => ({ ok: true }),
      () => true,
      { desde: PASOS.bienvenida },
    )
    expect(r).toEqual({ ok: true, paso: null })
    expect(traspaso.retomarTrasCuenta(CUENTA, 'p1')).toEqual({ paso: 'p1', motivo: null })

    expect(contenedor).toMatch(/acciones\.avisarEntrada\(AVISOS_DE_ENTRADA\.nueva\)/)
    // Al cambiar el uid sin velo, la carga no cierra la vista: solo la abre.
    expect(hook).toMatch(/if \(retomar\.entrada\) setEntrada\(retomar\.entrada\)/)
  })

  it('C5 y C6: los errores se dicen con copy.cuenta, sin código, y cerrar Google no dice nada', () => {
    expect(claveDeError(MOTIVOS.credenciales)).toBe('credenciales')
    expect(claveDeError(MOTIVOS.correoEnUso)).toBe('credenciales')
    expect(claveDeError(MOTIVOS.sinConexion)).toBe('sinConexion')
    expect(claveDeError(MOTIVOS.falloRed)).toBe('generico')
    expect(claveDeError(MOTIVOS.rechazado)).toBeNull()
    ;['credenciales', 'sinConexion', 'generico'].forEach((clave) =>
      expect(copy.cuenta.error[clave]).toBeTruthy(),
    )
  })

  it('C7: con la restauración sin terminar, el recorrido vuelve a la vista con su aviso, no a P1', async () => {
    cuentaEnNube({ terminada: true })
    await sesionEnP1()
    control.fallar = true

    await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, email: null, nueva: false },
      async (cuenta) => {
        const entrada = await entrarACuenta(UID, cuenta)
        expect(entrada.pendiente).toBe(true)
        return { ok: true }
      },
      () => false,
      { desde: PASOS.bienvenida },
    )

    expect(mudanzaPendiente(CUENTA)).toBe(UID)
    const { expediente } = await escritura.leerRecorrido(CUENTA)
    expect(traspaso.retomarTrasCuenta(CUENTA, expediente?.currentStep, true)).toEqual({
      paso: PASOS.bienvenida,
      motivo: null,
      entrada: { desde: PASOS.bienvenida, aviso: AVISOS.restauracion },
    })
  })

  it('C8: si la mudanza falla, el recorrido del origen vuelve a la vista con el aviso genérico', async () => {
    await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, nueva: false },
      async () => ({ ok: false, motivo: 'generico' }),
      () => false,
      { desde: PASOS.bienvenida },
    )

    expect(traspaso.retomarTrasCuenta(CUENTA, null)).toEqual({ paso: 'p1', motivo: null })
    expect(traspaso.retomarTrasCuenta(UID, 'p1')).toEqual({
      paso: PASOS.bienvenida,
      motivo: null,
      entrada: { desde: PASOS.bienvenida, aviso: AVISOS.generico },
    })
  })

  it('desde P7 todo sigue como en SPEC_19.2: el paso siguiente a P7', async () => {
    await traspaso.conectarConTraspaso(
      UID,
      { uid: CUENTA, nueva: false },
      async () => ({ ok: true }),
      () => false,
      { desde: PASOS.cuenta },
    )
    expect(traspaso.retomarTrasCuenta(CUENTA, 'p3')).toEqual({ paso: PASOS.cierre, motivo: null })
  })
})

// ─── La vista y el contenedor ────────────────────────────────────────────────

describe('SPEC_30 §4.3 y §5 — la vista de entrar', () => {
  const BOTONES = { crear: textos.p7.create, proveedores: textos.p7 }
  const nada = () => {}
  const pintarEntrar = (props) =>
    renderToStaticMarkup(
      createElement(Entrar, {
        textos: textos.entrar,
        cuenta: copy.cuenta,
        restauracion: copy.shared.restauracion,
        botones: BOTONES,
        continuar: textos.nav.continue,
        desdeBienvenida: true,
        aviso: null,
        proveedores: ['google'],
        errorDe: claveDeError,
        onCorreo: nada,
        onProveedor: nada,
        onRecuperar: nada,
        onVolver: nada,
        onContinuar: nada,
        onReintentar: nada,
        onEmpezar: nada,
        ...props,
      }),
    )

  it('criterio 1: el enlace de P1 solo se pinta cuando se le pide, y solo sin cuenta', () => {
    const pintar = (conEntrar) =>
      renderToStaticMarkup(
        createElement(Bienvenida, {
          textos: textos.p1,
          enlace: textos.entrar.enlace,
          conEntrar,
          onContinuar: nada,
          onEntrar: nada,
        }),
      )
    expect(pintar(true)).toContain(textos.entrar.enlace)
    expect(pintar(false)).not.toContain(textos.entrar.enlace)
    expect(contenedor).toMatch(/conEntrar=\{estado === ESTADOS_SESION\.sinCuenta\}/)
  })

  it('criterio 2: abrir y cerrar la vista no escribe nada', () => {
    // Las tres acciones de la vista, de la primera a la que retoma la cuenta.
    const acciones = hook.slice(
      hook.indexOf('const abrirEntrada'),
      hook.indexOf('const retomarCuenta'),
    )
    ;['abrirEntrada', 'cerrarEntrada', 'avisarEntrada'].forEach((nombre) =>
      expect(acciones).toContain(`const ${nombre} = useCallback`),
    )
    expect(acciones).not.toMatch(/enFila|escribir|shared\.|setPaso/)
  })

  it('criterio 3: con la vista abierta no se pintan el indicador ni la franja de abajo', () => {
    expect(contenedor).toMatch(/\{!entrada && <Progreso/)
    expect(contenedor).toMatch(/const hayContinuar =\s+!entrada &&/)
    expect(contenedor).toMatch(/paso !== PASOS\.bienvenida && !entrada/)
  })

  it('criterio 4: desde la vista se entra con entrarConCorreo, nunca se crea', () => {
    const bloque = contenedor.match(/const entrarConCorreoYa = [\s\S]+?\n {2}\}/)[0]
    expect(bloque).toMatch(/entrarConCorreo\(correo, contrasena\)/)
    expect(bloque).not.toMatch(/crearConCorreo/)
    expect(contenedor).toMatch(/acciones\.conectarCuenta\(resultado, \{ desde \}\)/)
  })

  it('desde P1 lleva su apoyo y la nota de empezar sin cuenta; desde P7, el que avisa de que gana la cuenta', () => {
    const p1 = pintarEntrar({ desdeBienvenida: true })
    expect(p1).toContain(textos.entrar.apoyo)
    expect(p1).toContain(textos.entrar.sinCuenta)
    expect(p1).toContain(copy.cuenta.formulario.olvide)

    const p7 = pintarEntrar({ desdeBienvenida: false })
    expect(p7).toContain(textos.entrar.apoyoDesdeCuenta)
    expect(p7).not.toContain(textos.entrar.sinCuenta)
  })

  it('C4: con una cuenta nueva, lo dice y ofrece seguir, con el formulario a la vista', () => {
    const html = pintarEntrar({ aviso: AVISOS.nueva })
    expect(html).toContain(textos.entrar.nueva)
    expect(html).toContain(textos.nav.continue)
    expect(html).toContain(copy.cuenta.formulario.entrar)
  })

  it('C7: con lo suyo en camino, reintentar o empezar mientras tanto, y sin formulario', () => {
    const html = pintarEntrar({ aviso: AVISOS.restauracion })
    expect(html).toContain(copy.shared.restauracion.error)
    expect(html).toContain(copy.shared.restauracion.reintentar)
    expect(html).toContain(textos.entrar.empezarMientras)
    expect(html).not.toContain(copy.cuenta.formulario.contrasena)
  })

  it('C8: con la mudanza fallida, el aviso genérico de copy.cuenta', () => {
    expect(pintarEntrar({ aviso: AVISOS.generico })).toContain(copy.cuenta.error.generico)
  })

  it('al llegar lo de la cuenta con la vista abierta, se retoma en su paso', () => {
    expect(contenedor).toMatch(
      /if \(esperandoCuenta && !mudanzaPendiente\(uid\)\) retomarCuenta\(\)/,
    )
    expect(hook).toMatch(/setPaso\(pasoTrasEntrar\(expediente\?\.currentStep\)\)/)
  })

  it('criterio 11: P7 tiene el enlace, y con la cuenta conectada se ve lista (D30-5)', () => {
    expect(contenedor).toMatch(/onEntrar=\{\(\) => acciones\.abrirEntrada\(PASOS\.cuenta\)\}/)
    expect(contenedor).toMatch(/listo=\{cuenta\.listo \|\| conectado\}/)
  })

  it('criterio 12: nada bloquea en la vista ni en el formulario', () => {
    const vista = codigoDe('src/components/onboarding/Entrar.jsx')
    ;[vista, formulario].forEach((codigo) =>
      expect(codigo).not.toMatch(/\b(disabled|required|aria-invalid)\b/),
    )
  })
})

describe('SPEC_30 §5.5 — reintentar la restauración (D30-7)', () => {
  it('criterio 14: sin mudanza pendiente no toca nada; con ella, solo restaura', () => {
    const accion = arranque.match(/const reintentarRestauracion = [\s\S]+?\n {2}\}, \[\]\)/)[0]
    expect(accion).toMatch(/if \(!mudanzaPendiente\(cuenta\)\) return \{ ok: true \}/)
    expect(accion).toMatch(/restaurar\(cuenta\)/)
    expect(accion).not.toMatch(/mudarUid|completarMudanzaPendiente|fijarUid|setCambiando/)
  })
})

describe('SPEC_30 §5.2 — el formulario compartido (D30-8)', () => {
  it('criterio 15: no importa la sesión, lib/cuenta, el copy ni nada de una sección', () => {
    expect(formulario).not.toMatch(/useSesion|@lib\/cuenta|from '@copy'/)
    expect(formulario).not.toMatch(/from '@\/(diario|breathing|perfil|onboarding)/)
    expect(formulario).not.toMatch(/from '@components\/(perfil|onboarding|diario)/)
  })
})

describe('SPEC_30 §6 — el copy', () => {
  it('es el de la spec, literal', () => {
    expect(textos.entrar).toEqual({
      enlace: 'Ya tengo una cuenta',
      titulo: 'Entra a tu cuenta',
      apoyo: 'Traemos lo que ya tenías guardado. No hace falta contestar nada otra vez.',
      apoyoDesdeCuenta: 'Si tu cuenta ya tenía respuestas, seguimos con las que guardaste en ella.',
      sinCuenta: 'Si es tu primera vez aquí, puedes empezar sin cuenta y crearla al final.',
      nueva:
        'Esta cuenta es nueva y todavía no tiene nada guardado. Puedes seguir con ella o entrar con otra.',
      empezarMientras: 'Empezar mientras tanto',
    })
  })
})
