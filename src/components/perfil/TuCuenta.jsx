// src/components/perfil/TuCuenta.jsx
// El bloque Tu cuenta: el estado de la sesión y lo que se puede hacer con él
// (SPEC_19.1 §4.8).
//
// **Cuatro vistas dentro del bloque, sin rutas nuevas**: el estado con sus
// acciones, el formulario de entrar o crear, el de recuperar el acceso y la
// confirmación de salir. Los dos formularios son `FormularioEntrar`, de
// `components/shared/`, que comparte con el onboarding (SPEC_30). Son vistas y no pantallas para no tocar el router, y
// porque ninguna es un sitio al que se vuelva: se entra, se hace y se regresa
// al estado.
//
// Lo que decide cada cosa no vive aquí: la sesión —entrar, crear, salir— es
// del contexto (`useSesion`), que es quien puede cambiar el uid; recuperar la
// contraseña no cambia nada de la sesión y se pide directamente a `lib/cuenta`.
// Este componente pinta y traduce motivos a frases.
//
// **Nada bloquea.** Ningún control lleva `disabled`, `required` ni
// `aria-invalid`: un formulario vacío se puede enviar, y lo que salga se dice
// en palabras, junto al campo y anunciado por `aria-describedby`. Un segundo
// toque mientras el primero está en camino no hace nada, en vez de apagar el
// botón. Un error lleva el foco al primer campo y **conserva lo escrito**.
//
// Sin cuenta no hay nada que esté mal: el estado lo dice como un hecho y
// ofrece crearla. Con la sesión vencida, lo escrito sigue aquí y se dice; lo
// que se ofrece es volver a entrar.

import { useRef, useState } from 'react'
import Button from '@components/ui/Button'
import Confirmacion from '@components/shared/Confirmacion'
import FormularioEntrar from '@components/shared/FormularioEntrar'
import { copy, interpolate } from '@copy'
import { claveDeError, proveedoresDisponibles, recuperarContrasena } from '@lib/cuenta'
import { SALIDA } from '@lib/salidaCuenta'
import { ESTADOS_SESION } from '@lib/sesion'
import { useSesion } from '@lib/useSesion'

const textos = copy.cuenta

// P7 ya dice "Continuar con Google" y "Crear cuenta": se leen de allí.
const P7 = copy.diario.onboarding.p7
const BOTONES = { crear: P7.create, proveedores: P7 }

const VISTAS = Object.freeze({
  estado: 'estado',
  entrar: 'entrar',
  crear: 'crear',
})

export default function TuCuenta() {
  const sesion = useSesion()
  const [vista, setVista] = useState(VISTAS.estado)
  const [salida, setSalida] = useState(null)

  const ocupado = useRef(false)

  /** Un toque a la vez: el segundo, mientras el primero está en camino, no hace nada. */
  const unaVez = async (trabajo) => {
    if (ocupado.current) return
    ocupado.current = true
    try {
      await trabajo()
    } finally {
      ocupado.current = false
    }
  }

  const pedirSalida = () =>
    unaVez(async () => {
      setSalida(await sesion.comprobarSalida())
    })

  const confirmarSalida = () =>
    unaVez(async () => {
      const r = await sesion.salir()
      if (!r.ok) setSalida(SALIDA.pendiente)
    })

  // ─── Formulario de entrar o crear, y recuperar el acceso ───────────────
  // Es el de `components/shared/` (SPEC_30, D30-8): el mismo que monta el
  // onboarding para entrar desde la bienvenida.
  if (vista === VISTAS.entrar || vista === VISTAS.crear) {
    const creando = vista === VISTAS.crear
    return (
      <FormularioEntrar
        modo={creando ? 'crear' : 'entrar'}
        textos={textos}
        botones={BOTONES}
        proveedores={proveedoresDisponibles()}
        errorDe={claveDeError}
        onEnviar={creando ? sesion.crear : sesion.entrar}
        onProveedor={() => sesion.entrarConGoogle()}
        onRecuperar={recuperarContrasena}
        onHecho={() => setVista(VISTAS.estado)}
        onVolver={() => setVista(VISTAS.estado)}
      />
    )
  }

  // ─── El estado y sus acciones ──────────────────────────────────────────
  const { estado } = sesion
  const frase =
    estado === ESTADOS_SESION.conCuenta
      ? interpolate(textos.estado.conCuenta, { correo: sesion.correo ?? '' })
      : textos.estado[estado]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-on-surface leading-relaxed" aria-live="polite">
        {frase}
      </p>

      {(estado === ESTADOS_SESION.sinCuenta || estado === ESTADOS_SESION.vencida) && (
        <div className="flex flex-col gap-3">
          <Button type="button" variant="surface" fullWidth onClick={() => setVista(VISTAS.entrar)}>
            {textos.acciones.entrar}
          </Button>
          {estado === ESTADOS_SESION.sinCuenta && (
            <Button
              type="button"
              variant="surface"
              fullWidth
              onClick={() => setVista(VISTAS.crear)}
            >
              {textos.acciones.crear}
            </Button>
          )}
        </div>
      )}

      {estado === ESTADOS_SESION.conCuenta && (
        <div>
          <Button type="button" size="sm" variant="surface" onClick={pedirSalida}>
            {textos.acciones.salir}
          </Button>
        </div>
      )}

      {/* Con cosas sin subir, la confirmación explica por qué no y solo
          ofrece quedarse: borrar ahí sería perder lo escrito (DP-19.1). */}
      <Confirmacion
        abierta={salida !== null}
        titulo={textos.salir.titulo}
        texto={salida === SALIDA.pendiente ? textos.salir.pendiente : textos.salir.texto}
        cancelar={{ texto: textos.salir.cancelar, onClick: () => setSalida(null) }}
        confirmar={
          salida === SALIDA.libre
            ? { texto: textos.salir.confirmar, onClick: confirmarSalida }
            : null
        }
      />
    </div>
  )
}
