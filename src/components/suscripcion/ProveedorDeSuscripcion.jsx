// src/components/suscripcion/ProveedorDeSuscripcion.jsx
// La suscripción mientras las secciones están montadas (SPEC_25).
//
// Sostiene lo que dicen la tienda y el almacén, y con eso calcula el estado
// (`lib/suscripcion/estado.js`). Lo leen Hoy, el Journal y Tu perfil por
// `useSuscripcion`. Aquí se monta también el muro, que es una pantalla entera
// por encima de todo, y la frase que lo despide.
//
// **La identidad** (DP-25.19): con la sesión `conCuenta`, el cliente es el uid;
// sin cuenta, anónimo; con `vencida` no se toca nada. Si no se pudo —sin red—,
// se intenta al volver al frente y al volver la red.
//
// **Al volver al frente** (DP-25.18) se pregunta y se escucha; no se
// sincroniza. Lo que pasa fuera de la app —un canje, una renovación, un
// reembolso— llega por el oyente.
//
// El reloj solo se mira al abrir y al volver al frente: nadie pasa a lectura a
// media frase por dar las doce.
//
// En la web no se llama a nadie.

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { shared } from '@/lib/db'
import { compras } from '@lib/compras'
import { esIPhone } from '@lib/plataforma'
import { ESTADOS_SESION, conTecho } from '@lib/sesion'
import { useSesion } from '@lib/useSesion'
import { ESTADOS, estadoDeSuscripcion, puedeEscribir } from '@lib/suscripcion/estado'
import { anotarPaso, escucharDiagnostico, leerDesfase } from '@lib/suscripcion/diagnostico'
import { inicioDePrueba } from '@lib/suscripcion/inicioDePrueba'
import { darElMuroPorVisto, tocaElMuro } from '@lib/suscripcion/muroSolo'
import { ContextoSuscripcion } from '@lib/suscripcion/useSuscripcion'
import Acuse from './Acuse'

// El muro solo existe en el iPhone y al abrirlo: la web no lo necesita nunca.
const Muro = lazy(() => import('./Muro'))

/** Cuánto se espera a que el cliente sea el de la cuenta. */
const TECHO_DE_IDENTIDAD_MS = 5000

export default function ProveedorDeSuscripcion({ uid, libre, children }) {
  const iphone = esIPhone()
  const { estado: sesion, selloRestauracion } = useSesion()
  const [customerInfo, setCustomerInfo] = useState(null)
  const [tiendaLista, setTiendaLista] = useState(false)
  const [inicio, setInicio] = useState({ uid: null, fecha: null, diaTerminaA: undefined })
  const [ahora, setAhora] = useState(() => new Date())
  const [desfaseDias, setDesfase] = useState(leerDesfase)
  const [muro, setMuro] = useState(false)
  const [acuse, setAcuse] = useState(null)
  const vivo = useRef(true)

  useEffect(() => {
    vivo.current = true
    anotarPaso('app: secciones montadas')
    const alCambiar = () => anotarPaso(`app: ${document.visibilityState}`)
    document.addEventListener('visibilitychange', alCambiar)
    return () => {
      vivo.current = false
      anotarPaso('app: secciones desmontadas')
      document.removeEventListener('visibilitychange', alCambiar)
    }
  }, [])

  useEffect(() => {
    anotarPaso(libre ? 'umbral fuera' : 'tapada por el umbral o la escritura')
  }, [libre])

  const refrescar = useCallback(async () => {
    if (!iphone) return null
    // Con techo: una red colgada no deja la pantalla sin saber en qué está.
    if (sesion === ESTADOS_SESION.conCuenta) {
      await conTecho(compras.identificar(uid), TECHO_DE_IDENTIDAD_MS)
    }
    const info = await compras.info()
    if (!vivo.current) return info
    // Sin respuesta se conserva lo último que se supo: nada se borra.
    if (info) setCustomerInfo(info)
    setTiendaLista(true)
    return info
  }, [iphone, sesion, uid])

  const leerInicio = useCallback(async () => {
    if (!iphone) return
    const [fecha, diaTerminaA] = await Promise.all([
      inicioDePrueba(uid, { sesion }).catch(() => null),
      shared.getDiaTerminaA(uid).catch(() => undefined),
    ])
    if (vivo.current) setInicio({ uid, fecha, diaTerminaA })
  }, [iphone, sesion, uid])

  useEffect(() => {
    if (!iphone) return undefined
    return compras.escuchar((info) => {
      if (!vivo.current) return
      setCustomerInfo(info)
      setTiendaLista(true)
    })
  }, [iphone])

  useEffect(() => {
    if (!iphone) return undefined
    refrescar()
    const alVolver = () => {
      if (document.visibilityState !== 'visible') return
      setAhora(new Date())
      refrescar()
    }
    const alVolverLaRed = () => refrescar()
    document.addEventListener('visibilitychange', alVolver)
    window.addEventListener('online', alVolverLaRed)
    return () => {
      document.removeEventListener('visibilitychange', alVolver)
      window.removeEventListener('online', alVolverLaRed)
    }
  }, [iphone, refrescar])

  // La fecha puede llegar de la nube después de montar.
  useEffect(() => {
    leerInicio()
  }, [leerInicio, selloRestauracion])

  useEffect(() => escucharDiagnostico(() => setDesfase(leerDesfase())), [])

  const actual = estadoDeSuscripcion({
    customerInfo,
    fechaInicioPrueba: inicio.fecha,
    ahora,
    desfaseDias,
    diaTerminaA: inicio.diaTerminaA,
    iphone,
    listo: tiendaLista && inicio.uid === uid,
  })
  const conDerecho = actual.estado === ESTADOS.activa || actual.estado === ESTADOS.fundador

  // El muro, solo, una vez por sesión y con la pantalla libre.
  useEffect(() => {
    if (!tocaElMuro({ estado: actual.estado, libre })) return
    darElMuroPorVisto()
    setMuro(true)
  }, [actual.estado, libre])

  // El derecho puede llegar con el muro abierto, sin tocar nada.
  useEffect(() => {
    if (conDerecho) setMuro(false)
  }, [conDerecho])

  const abrirMuro = useCallback(() => {
    darElMuroPorVisto()
    setMuro(true)
  }, [])

  const restaurar = useCallback(() => compras.restaurar(), [])

  const valor = useMemo(
    () => ({
      ...actual,
      puedeEscribir: puedeEscribir(actual.estado),
      libre,
      desfaseDias,
      customerInfo,
      fechaInicioPrueba: inicio.fecha,
      diaTerminaA: inicio.diaTerminaA,
      abrirMuro,
      refrescar,
      restaurar,
    }),
    [
      actual.estado,
      actual.plan,
      actual.seRenueva,
      actual.dia,
      actual.hasta?.getTime(),
      libre,
      desfaseDias,
      customerInfo,
      inicio,
      abrirMuro,
      refrescar,
      restaurar,
    ],
  )

  return (
    <ContextoSuscripcion.Provider value={valor}>
      {children}
      {muro && (
        <Suspense fallback={null}>
          <Muro
            estado={actual.estado}
            onCerrar={() => setMuro(false)}
            onAcuse={(texto) => {
              setMuro(false)
              setAcuse(texto)
            }}
            restaurar={restaurar}
          />
        </Suspense>
      )}
      {acuse && <Acuse texto={acuse} onTerminar={() => setAcuse(null)} />}
    </ContextoSuscripcion.Provider>
  )
}
