// src/breathing/Respiracion.jsx
// El contenedor de las dos pantallas de Respiración (SPEC_16 §3).
//
// No está en la lista de archivos de §9 y se añadió porque hacía falta: las dos
// pantallas comparten la configuración **y la sesión en curso**, y eso no puede
// vivir en ninguna de las dos. Si la sesión viviera en `PantallaSesion`, el
// botón atrás la destruiría al desmontarla, y RN-RE-NAV-10 pide justo lo
// contrario: que pause y se pueda retomar en su punto exacto. El estado tiene
// que estar por encima de la ruta.
//
// Aquí viven, por tanto, las cuatro reglas de continuidad:
//   · RN-RE-NAV-09 — La ruta de sesión no es enlazable: sin sesión, redirige.
//   · RN-RE-NAV-10 — Atrás pausa, no destruye.
//   · RN-RE-NAV-16/17 — Todo llega precargado; la primera vez, `entrada-suave`.
//   · RN-RE-NAV-33 — Al completar se persiste sesión, reciente y `ultimo*`.

import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { ESTADOS } from '@lib/respiracion/maquinaSesion'

import PantallaRespiracion from './PantallaRespiracion.jsx'
import PantallaSesion from './PantallaSesion.jsx'
import { useSesionRespiracion } from './hooks/useSesionRespiracion.js'
import { configuracionDe, favoritoIdentico } from './lib/comparadorConfiguracion.js'
import { patronDe, presetPrimeraVez } from './data/catalogoPatrones.js'
import { ID_SILENCIO, resolverSonidoId } from './data/catalogoSonidos.js'
import { validarPatron } from '@lib/respiracion/motorRitmo'
import * as repo from './data/repositorioRespiracion.js'

/** RN-RE-FAV-08 — Seis segundos para arrepentirse de un borrado. */
export const MS_DESHACER = 6000

/**
 * RN-RE-NAV-16/17 — De preferencias a configuración de pantalla.
 *
 * **La primera vez de todas arranca en `entrada-suave`**, que no tiene
 * retenciones. `calma-553` es el ritmo de la casa y el que guardan las
 * preferencias de fábrica, pero empezar aguantando el aire sin haberlo hecho
 * nunca es innecesariamente exigente. Se distingue por `actualizadoEn`: es nulo
 * mientras nadie haya guardado nada, así que no hace falta un campo nuevo.
 */
export function configuracionInicial(preferencias) {
  const primeraVez =
    preferencias?.actualizadoEn === null || preferencias?.actualizadoEn === undefined
  const patronBaseId = primeraVez ? presetPrimeraVez().id : preferencias.ultimoPatronId

  return {
    patronBaseId,
    patron: primeraVez ? patronDe(patronBaseId) : { ...preferencias.ultimoPatron },
    visual: preferencias?.visualPreferida ?? 'circulo',
    sonidoAmbienteId: resolverSonidoId(preferencias?.sonidoAmbienteId ?? ID_SILENCIO),
    volumenAmbiente: preferencias?.volumenAmbiente ?? 0.6,
    guiaSonoraActiva: preferencias?.guiaSonoraActiva ?? false,
    volumenGuia: preferencias?.volumenGuia ?? 0.5,
    duracion: { ...(preferencias?.duracionPorDefecto ?? { modo: 'minutos', valor: 3 }) },
    mantenerPantallaEncendida: preferencias?.mantenerPantallaEncendida ?? true,
  }
}

/**
 * @param {string} uid
 * @param {string} base    - Dónde vive esta herramienta dentro de la app. Llega
 *   por prop, no se escribe aquí: es lo que le permite pasar de colgar del Home
 *   a ser una sección de un espacio sin que este archivo nombre a ninguno.
 * @param {string} salida  - A dónde se vuelve al cerrar.
 * @param {Function} [onHideNav] - Para que la sesión ocupe la pantalla entera.
 */
export default function Respiracion({
  uid,
  base = '/respiracion',
  salida = '/',
  onHideNav = null,
}) {
  const { pathname } = useLocation()

  const [configuracion, setConfiguracion] = useState(null)
  const [avisoVisto, setAvisoVisto] = useState(true)
  const [favoritos, setFavoritos] = useState([])
  const [recientes, setRecientes] = useState([])
  const [eliminada, setEliminada] = useState(null)
  const [hayTeclado, setHayTeclado] = useState(false)

  const borradoPendiente = useRef(null)
  const enSesion = pathname.startsWith(`${base}/sesion`)

  /**
   * RN-RE-NAV-21 — Durante la sesión no hay cromo: ni cabecera de espacio ni
   * barra. La visual domina y todo lo demás es periférico, y una fila de
   * pestañas al pie es exactamente lo que tira de la atención hacia fuera.
   *
   * Es el mismo mecanismo con el que el Journal se oculta la navegación mientras
   * se escribe (§4.3.2, regla 2): son estados de flujo, no de navegación.
   */
  useEffect(() => {
    onHideNav?.(enSesion)
    return () => onHideNav?.(false)
  }, [enSesion, onHideNav])

  const sesion = useSesionRespiracion(configuracion ?? {}, {
    alCompletar: (resumen) => persistirFinal(resumen),
  })

  // ── Carga inicial ───────────────────────────────────────────────────────────
  useEffect(() => {
    let vivo = true
    Promise.all([repo.leerPreferencias(uid), repo.listarFavoritos(uid), repo.listarRecientes(uid)])
      .then(([preferencias, guardados, ultimas]) => {
        if (!vivo) return
        setConfiguracion(configuracionInicial(preferencias))
        setAvisoVisto(preferencias?.avisoSeguridadVisto === true)
        setFavoritos(guardados)
        setRecientes(ultimas)
      })
      .catch(() => {
        // Sin preferencias guardadas se entra con las de fábrica. Nada bloquea.
        if (vivo) setConfiguracion(configuracionInicial(null))
      })
    return () => {
      vivo = false
    }
  }, [uid])

  /**
   * RN-RE-NAV-45 — Detectar navegación por teclado para no atenuar los
   * controles. Un `Tab` basta como señal y no vuelve atrás: quien ha tabulado
   * una vez puede volver a hacerlo en cualquier momento.
   */
  useEffect(() => {
    function alPulsar(evento) {
      if (evento.key === 'Tab') setHayTeclado(true)
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [])

  /**
   * RN-RE-NAV-10 — Salir de la ruta de sesión **pausa**, no destruye. Al volver
   * a entrar se retoma donde estaba (caso 8.4). Es lo que hace que el botón
   * atrás del navegador no sea un botón de tirar la sesión.
   */
  useEffect(() => {
    if (enSesion) return
    if (sesion.estadoSesion === ESTADOS.ACTIVO || sesion.estadoSesion === ESTADOS.CERRANDO) {
      sesion.pausar()
    }
  }, [enSesion, sesion])

  // ── Persistencia ────────────────────────────────────────────────────────────

  /** RN-RE-NAV-33 — Sesión, reciente y `ultimo*`, al completar y solo entonces. */
  const persistirFinal = useCallback(
    async (resumen) => {
      const actual = configuracion
      if (!actual) return

      await repo.guardarPreferencias(uid, {
        ultimoPatronId: actual.patronBaseId,
        ultimoPatron: actual.patron,
        visualPreferida: actual.visual,
        sonidoAmbienteId: actual.sonidoAmbienteId,
        volumenAmbiente: actual.volumenAmbiente,
        guiaSonoraActiva: actual.guiaSonoraActiva,
        volumenGuia: actual.volumenGuia,
        duracionPorDefecto: actual.duracion,
      })

      // Caso 9.7 — Una sesión sin un ciclo completo no es una sesión: ni se
      // registra ni alimenta las recientes. Lo decide `resumen.registrable`.
      if (!resumen?.registrable) return
      await repo.registrarSesion(uid, {
        patron: actual.patron,
        patronBaseId: actual.patronBaseId,
        ciclosCompletados: resumen.ciclosCompletados,
        segundosActivos: resumen.segundosActivos,
        terminadaPorPersona: resumen.terminadaPorPersona,
      })
      await repo.registrarReciente(uid, configuracionDe({ ...actual, id: null }))
      repo
        .listarRecientes(uid)
        .then(setRecientes)
        .catch(() => {})
    },
    [configuracion, uid],
  )

  const cambiar = useCallback(
    (parcial) => {
      setConfiguracion((previa) => ({ ...previa, ...parcial }))
      // Mover el volumen mientras se escucha un sonido tiene que oírse, o el
      // control no está diciendo la verdad sobre lo que va a pasar. Solo el
      // volumen: el patrón y la duración no tocan el grafo de audio.
      if (parcial.volumenAmbiente !== undefined) {
        sesion.ajustarEnVivo({ volumenAmbiente: parcial.volumenAmbiente })
      }
    },
    [sesion],
  )

  // ── Favoritos ───────────────────────────────────────────────────────────────

  const guardarFavorito = useCallback(
    async ({ nombre, reemplazar, ...resto }) => {
      const base = { ...configuracionDe({ ...configuracion, ...resto }), nombre }
      const existente = favoritos.find(
        (f) => f.nombre.trim().toLowerCase() === nombre.trim().toLowerCase(),
      )
      if (reemplazar && existente) await repo.actualizarFavorito(uid, existente.id, base)
      else await repo.crearFavorito(uid, base)
      repo
        .listarFavoritos(uid)
        .then(setFavoritos)
        .catch(() => {})
    },
    [configuracion, favoritos, uid],
  )

  /**
   * RN-RE-FAV-09 y 13 — Cargar aplica todo y **corrige lo que ya no vale** en
   * vez de descartarlo: un patrón fuera de rango se ajusta, un sonido que ya no
   * existe cae en silencio, y lo demás de esa combinación sigue sirviendo.
   */
  const cargarFavorito = useCallback(
    async (favorito) => {
      const config = configuracionDe(favorito)
      setConfiguracion({
        ...config,
        patron: validarPatron(config.patron).patron,
        sonidoAmbienteId: resolverSonidoId(config.sonidoAmbienteId),
        mantenerPantallaEncendida: configuracion?.mantenerPantallaEncendida ?? true,
      })
      if (favorito.id) {
        await repo.registrarUsoFavorito(uid, favorito.id)
        repo
          .listarFavoritos(uid)
          .then(setFavoritos)
          .catch(() => {})
      }
    },
    [configuracion, uid],
  )

  /**
   * RN-RE-FAV-08 y caso 6.11 — Se quita de la lista al momento y el borrado de
   * verdad espera seis segundos. Si se navega antes, se confirma: la ventana de
   * deshacer no sobrevive a la navegación, porque el sitio donde estaba el
   * botón ya no existe.
   */
  const eliminarFavorito = useCallback(
    (favorito) => {
      setFavoritos((previos) => previos.filter((f) => f.id !== favorito.id))
      setEliminada(favorito)
      borradoPendiente.current = setTimeout(() => {
        borradoPendiente.current = null
        setEliminada(null)
        repo.eliminarFavorito(uid, favorito.id).catch(() => {})
      }, MS_DESHACER)
    },
    [uid],
  )

  const deshacer = useCallback(() => {
    if (borradoPendiente.current !== null) clearTimeout(borradoPendiente.current)
    borradoPendiente.current = null
    // Vuelve con el mismo `id` y todos sus campos: nunca se llegó a borrar.
    setEliminada((previa) => {
      if (previa) setFavoritos((lista) => [previa, ...lista])
      return null
    })
  }, [])

  useEffect(
    () => () => {
      if (borradoPendiente.current !== null) clearTimeout(borradoPendiente.current)
    },
    [],
  )

  if (configuracion === null) return null

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PantallaRespiracion
            configuracion={configuracion}
            onCambiar={cambiar}
            onEmpezar={sesion.empezar}
            avisoVisto={avisoVisto}
            onDescartarAviso={() => {
              setAvisoVisto(true)
              repo.guardarPreferencias(uid, { avisoSeguridadVisto: true }).catch(() => {})
            }}
            favoritos={favoritos}
            recientes={recientes}
            onCargarFavorito={cargarFavorito}
            onGuardarFavorito={guardarFavorito}
            onEliminarFavorito={eliminarFavorito}
            eliminada={eliminada}
            onDeshacer={deshacer}
            yaGuardada={favoritoIdentico(configuracion, favoritos)}
            // RN-RE-SND-27 — El cable que faltaba: la pantalla declaraba esta
            // prop desde SPEC_16 y nadie se la pasaba, así que elegir un sonido
            // antes de empezar era mudo.
            vistaPreviaSonido={sesion.vistaPreviaSonido}
            rutaSesion={`${base}/sesion`}
          />
        }
      />

      <Route
        path="/sesion"
        element={
          // RN-RE-NAV-09 y caso 8.2 — Sin sesión en memoria no hay nada que
          // mostrar. Se vuelve a configurar en vez de fingir una continuidad
          // que no existe: una recarga a mitad de sesión pierde la sesión, y
          // aparentar lo contrario sería deshonesto.
          sesion.estadoSesion === ESTADOS.INACTIVO ? (
            <Navigate to={base} replace />
          ) : (
            <PantallaSesion
              sesion={sesion}
              configuracion={configuracion}
              hayTeclado={hayTeclado}
              onAjustar={(cambios) => {
                cambiar(cambios)
                sesion.ajustarEnVivo(cambios)
              }}
              onSalir={() => sesion.salir()}
              onRepetir={() => sesion.empezar()}
              rutaBase={base}
              salida={salida}
            />
          )
        }
      />
    </Routes>
  )
}
