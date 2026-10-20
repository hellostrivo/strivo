// src/components/onboarding/Entrar.jsx
// Entrar a una cuenta que ya existe, desde la bienvenida o desde P7 (SPEC_30).
//
// **No es un paso.** No tiene número, no se anota en el expediente y no
// escribe nada: se abre con «Ya tengo una cuenta» y se cierra con «Volver».
// El contenedor no pinta el indicador ni la franja de abajo mientras está
// abierta, igual que con un sub-paso.
//
// El formulario es el de Tu perfil (`FormularioEntrar`), sin su título: aquí
// el título es la pregunta de la pantalla. Lo que añade esta vista son los
// avisos de una entrada que no salió redonda, y cada uno con su salida:
//
//   - `nueva`: Google abrió una cuenta que no existía. Se dice, y se puede
//     seguir con ella o entrar con otra (C4).
//   - `restauracion`: la sesión ya es la cuenta y lo suyo no terminó de
//     llegar. Reintentar, o empezar mientras tanto (C7). El formulario no se
//     ofrece: ya se entró.
//   - `generico`: la mudanza falló y se sigue en el árbol de antes (C8).
//
// **Nada bloquea.** Siempre hay por dónde salir, ningún control lleva
// `disabled`, `required` ni `aria-invalid`, y ningún aviso vibra.

import { useRef } from 'react'
import Button from '@components/ui/Button'
import FormularioEntrar, { ENLACE } from '@components/shared/FormularioEntrar'
import { AVISOS_DE_ENTRADA as AVISOS } from '@/onboarding/traspaso'

export default function Entrar({
  textos,
  cuenta,
  restauracion,
  botones,
  continuar,
  desdeBienvenida,
  aviso,
  proveedores,
  errorDe,
  onCorreo,
  onProveedor,
  onRecuperar,
  onHecho,
  onVolver,
  onContinuar,
  onReintentar,
  onEmpezar,
}) {
  const reintentando = useRef(false)

  const reintentar = async () => {
    if (reintentando.current) return
    reintentando.current = true
    try {
      await onReintentar()
    } finally {
      reintentando.current = false
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface leading-snug">{textos.titulo}</h1>
        <p className="text-base text-on-surface-soft leading-relaxed">
          {desdeBienvenida ? textos.apoyo : textos.apoyoDesdeCuenta}
        </p>
      </div>

      {aviso === AVISOS.restauracion ? (
        <div className="flex flex-col gap-3" aria-live="polite">
          <p className="text-base text-on-surface leading-relaxed">{restauracion.error}</p>
          <Button variant="surface" fullWidth onClick={reintentar}>
            {restauracion.reintentar}
          </Button>
          <button type="button" className={ENLACE} onClick={onEmpezar}>
            {textos.empezarMientras}
          </button>
        </div>
      ) : (
        <>
          <div aria-live="polite">
            {aviso === AVISOS.nueva && (
              <div className="flex flex-col gap-3">
                <p className="text-base text-on-surface leading-relaxed">{textos.nueva}</p>
                <div>
                  <Button variant="surface" onClick={onContinuar}>
                    {continuar}
                  </Button>
                </div>
              </div>
            )}
            {aviso === AVISOS.generico && (
              <p className="text-base text-on-surface">{cuenta.error.generico}</p>
            )}
          </div>

          <FormularioEntrar
            textos={cuenta}
            botones={botones}
            proveedores={proveedores}
            conTitulo={false}
            nivel="h2"
            errorDe={errorDe}
            onEnviar={onCorreo}
            onProveedor={onProveedor}
            onRecuperar={onRecuperar}
            onHecho={onHecho}
            onVolver={onVolver}
          />

          {desdeBienvenida && aviso !== AVISOS.nueva && (
            <p className="text-sm text-on-surface-soft leading-relaxed">{textos.sinCuenta}</p>
          )}
        </>
      )}
    </section>
  )
}
