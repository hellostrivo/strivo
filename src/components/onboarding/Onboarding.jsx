// src/components/onboarding/Onboarding.jsx
// El recorrido de entrada: nueve pantallas, ocho pasos, una sola vez.
//
// **Se interpone solo la primera vez.** Quién decide eso es `App.jsx`, que
// pregunta al árbol de datos si queda onboarding pendiente; aquí se da por
// hecho que sí. Al terminar, esta pieza se desmonta y no vuelve.
//
// ─── El marco ────────────────────────────────────────────────────────────────
//
// El degradado es el de la app y lo elige el reloj. Aquí no hay conmutador de
// Mañana/Noche —no hay un día que escribir todavía—, así que la única fuente
// posible del momento es la hora, y el atributo que elige paleta toma el valor
// que le da. No es una segunda fuente en Hoy: aquella pantalla sigue mandando
// sobre lo suyo (RN-HOY-05), y esta ni la monta ni la conoce.
//
// Ningún color se escribe aquí: se piden superficies por su papel y el tema las
// resuelve (RN-VIS-02).
//
// ─── La apertura ─────────────────────────────────────────────────────────────
//
// **Abrir la app es abrir la app, también la primera vez.** El umbral de aquí
// es el mismo `TransicionLuz` con el video de marca que se ve en cualquier otra
// apertura: la misma pieza, el mismo contenido y el mismo contador de sesión
// (`lib/umbralSesion`). Aquí no hay una apertura propia del onboarding, y por
// eso tampoco hay una segunda variante que mantener.
//
// Que comparta el contador es lo que resuelve el encadenamiento sin ninguna
// regla nueva: si el video se ve al empezar el recorrido, cuando termine y se
// monten las secciones el umbral ya está gastado y no vuelve a salir. Dos velos
// de cinco segundos seguidos serían un peaje, no un umbral (RN-LU-MAN-02).
//
// Va dentro del marco y sobre lo que ya está montado, igual que en `App`:
// cuando la luz se va, lo de detrás ya está ahí. Con "reducir movimiento" no se
// monta (RN-VIS-05).
//
// ─── Nada bloquea ────────────────────────────────────────────────────────────
//
// Ningún control lleva `disabled`, `required` ni `aria-invalid`. "Continuar"
// avanza con la pantalla en blanco, "Atrás" existe en todos los pasos menos el
// primero, y los dos pasos que dependen de algo de fuera —el permiso de avisos
// y la cuenta— se saltan con un enlace que dice "Ahora no".

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { copy } from '@copy'
import { momentoDe } from '@lib/timeSlot'
import Button from '@components/ui/Button'
import TransicionLuz, { prefiereMenosMovimiento } from '@components/shared/TransicionLuz'
import { cruzarUmbral, umbralPendiente } from '@lib/umbralSesion'

import Progreso from './Progreso'
import Bienvenida from './Bienvenida'
import Nombre from './Nombre'
import Genero from './Genero'
import Motivo from './Motivo'
import Identidad from './Identidad'
import Horarios from './Horarios'
import Recordatorios from './Recordatorios'
import CuentaPaso from './Cuenta'
import Cierre from './Cierre'

import { PASOS } from '@/onboarding/pasos'
import { useOnboarding } from '@/onboarding/useOnboarding'
import { alternar as alternarGenero } from '@/onboarding/genero'
import { alternar as alternarMotivo } from '@/onboarding/motivos'
import { pedirPermiso } from '@/onboarding/recordatorios'
import { crearConCorreo, entrarConProveedor } from '@/onboarding/cuenta'

const textos = copy.diario.onboarding

/** Los pasos cuyo avance es un "Continuar" y nada más. */
const CON_CONTINUAR = [PASOS.nombre, PASOS.genero, PASOS.motivo, PASOS.identidad, PASOS.horarios]

/**
 * ¿Toca umbral en esta sesión?
 *
 * Es una **lectura pura**: pregunta y no gasta nada, así que puede correr al
 * construir el estado. Gastar el contador sí es un efecto, y va aparte.
 */
function hayUmbral() {
  return !prefiereMenosMovimiento() && umbralPendiente('diario')
}

export default function Onboarding({ uid, onUid, onTerminado }) {
  const { respuestas, paso, cargando, genero, acciones } = useOnboarding(uid, { onUid })

  // El umbral de entrada, una vez por sesión y compartido con el resto de la
  // app. No espera a que cargue el recorrido —para eso es un velo— y **nace
  // decidido**: puesto en un efecto llegaba un fotograma tarde, y ese fotograma
  // era el primer paso asomando antes de que empezara el video.
  const [entrando, setEntrando] = useState(hayUmbral)
  const [avisos, setAvisos] = useState(null)
  const [cuenta, setCuenta] = useState({ listo: false, motivo: null })

  useEffect(() => {
    if (entrando) cruzarUmbral('diario')
  }, [entrando])

  const momento = momentoDe()
  const superficie = momento === 'noche' ? 'dark' : 'light'

  const activarAvisos = async () => {
    const estado = await pedirPermiso()
    setAvisos(estado)
    acciones.guardarRecordatorios(estado)
  }

  const entrarCon = async (proveedor) => {
    const resultado = await entrarConProveedor(proveedor)
    if (!resultado.ok) return setCuenta({ listo: false, motivo: resultado.motivo })
    await acciones.adoptarCuenta(resultado)
    setCuenta({ listo: true, motivo: null })
  }

  const crearCuenta = async (correo, contrasena) => {
    const resultado = await crearConCorreo(correo, contrasena)
    if (!resultado.ok) return setCuenta({ listo: false, motivo: resultado.motivo })
    await acciones.adoptarCuenta(resultado)
    setCuenta({ listo: true, motivo: null })
  }

  const entrar = async () => {
    const definitivo = await acciones.terminar()
    onTerminado(definitivo)
  }

  const pantallas = {
    [PASOS.bienvenida]: () => <Bienvenida textos={textos.p1} onContinuar={acciones.avanzar} />,
    [PASOS.nombre]: () => (
      <Nombre
        textos={textos.p2}
        valor={respuestas.nombre}
        onCambiar={(valor) => acciones.responder('nombre', valor, { teclado: true })}
      />
    ),
    [PASOS.genero]: () => (
      <Genero
        textos={textos.p2a}
        valor={respuestas.genero}
        onCambiar={(opcion) =>
          acciones.responder('genero', alternarGenero(respuestas.genero, opcion))
        }
      />
    ),
    [PASOS.motivo]: () => (
      <Motivo
        textos={textos.p3}
        motivos={respuestas.motivos}
        otro={respuestas.motivoOtro}
        onTocar={(id) => {
          const elegidos = alternarMotivo(respuestas.motivos, id)
          acciones.responder('motivos', elegidos)
          acciones.guardarMotivo({ ...respuestas, motivos: elegidos })
        }}
        onOtro={(valor) => acciones.responder('motivoOtro', valor, { teclado: true })}
      />
    ),
    [PASOS.identidad]: () => (
      <Identidad
        textos={textos.p4}
        valor={respuestas.identidad}
        genero={genero}
        onCambiar={(valor) => acciones.responder('identidad', valor, { teclado: true })}
      />
    ),
    [PASOS.horarios]: () => (
      <Horarios
        textos={textos.p5}
        despertar={respuestas.despertar}
        dormir={respuestas.dormir}
        onDespertar={(valor) => acciones.responder('despertar', valor)}
        onDormir={(valor) => acciones.responder('dormir', valor)}
      />
    ),
    [PASOS.recordatorios]: () => (
      <Recordatorios
        textos={textos.p6}
        despertar={respuestas.despertar}
        dormir={respuestas.dormir}
        estado={avisos}
        onActivar={activarAvisos}
        onSaltar={acciones.avanzar}
      />
    ),
    [PASOS.cuenta]: () => (
      <CuentaPaso
        textos={textos.p7}
        motivo={cuenta.motivo}
        listo={cuenta.listo}
        onProveedor={entrarCon}
        onCrear={crearCuenta}
        onSaltar={acciones.avanzar}
      />
    ),
    [PASOS.cierre]: () => (
      <Cierre
        textos={textos.p8}
        identidad={respuestas.identidad}
        despertar={respuestas.despertar}
        onEntrar={entrar}
      />
    ),
  }

  // Los dos pasos que esperan algo de fuera muestran "Continuar" en cuanto
  // saben en qué quedó: hasta entonces, su propia salida es "Ahora no".
  const hayContinuar =
    CON_CONTINUAR.includes(paso) ||
    (paso === PASOS.recordatorios && avisos !== null) ||
    (paso === PASOS.cuenta && cuenta.listo)

  const marco = (contenido) => (
    <div
      data-momento={momento}
      data-surface={superficie}
      className={clsx('relative min-h-screen bg-strivo-base transicion-tema')}
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-strivo" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col gap-8 px-5 py-10 text-on-surface">
        {contenido}
      </div>

      {entrando && <TransicionLuz conVideo onTerminar={() => setEntrando(false)} />}
    </div>
  )

  if (cargando || !paso) return marco(<div className="min-h-screen" aria-busy="true" />)

  return marco(
    <>
      <Progreso textos={textos.nav} paso={paso} />

      <main className="flex-1">{pantallas[paso]()}</main>

      <div className="flex flex-wrap items-center gap-3">
        {hayContinuar && (
          <Button variant="surface" onClick={acciones.avanzar}>
            {textos.nav.continue}
          </Button>
        )}
        {paso !== PASOS.bienvenida && (
          <button
            type="button"
            onClick={acciones.retroceder}
            className={clsx(
              'rounded-full px-3 py-2 min-h-touch-sm text-sm',
              'text-on-surface-soft hover:text-on-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
            )}
          >
            {textos.nav.back}
          </button>
        )}
      </div>
    </>,
  )
}
