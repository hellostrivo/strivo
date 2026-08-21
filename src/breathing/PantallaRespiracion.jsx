// src/breathing/PantallaRespiracion.jsx
// `/respiracion` — configurar y arrancar (SPEC_16 §3.2).
//
// **"Empezar" está fijo abajo y las listas van debajo de él** (RN-RE-NAV-14 y
// 15). Es la regla que más forma le da a esta pantalla: quien abre esto puede
// estar mal en ese momento, y hacerle atravesar un catálogo de favoritos para
// llegar al botón es poner una tienda entre alguien y lo que vino a buscar. Lo
// que importa está siempre a la vista; lo demás está, pero más abajo.
//
// **Todo llega precargado** (RN-RE-NAV-16): un toque desde el Home hasta
// respirar. Salvo la primera vez de todas, que arranca en `entrada-suave`
// —sin retenciones— porque empezar aguantando el aire sin haberlo hecho nunca es
// innecesariamente exigente (RN-RE-NAV-17).
//
// No hay barra de navegación, y no hace falta quitarla: `App.jsx` la monta solo
// dentro de un espacio, y Respiración no lo es (RN-RE-NAV-12).

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { copy } from '@copy'
import { haySoporte } from '@lib/audio/contextoAudio'
import { ESTADOS } from '@lib/respiracion/maquinaSesion'
import { sonIguales, validarPatron } from '@lib/respiracion/motorRitmo'

import GuiaVisual from './components/visuales/GuiaVisual.jsx'
import SelectorPatron from './components/SelectorPatron.jsx'
import SelectorVisual from './components/SelectorVisual.jsx'
import SelectorDuracion from './components/SelectorDuracion.jsx'
import ControlesRitmo from './components/ControlesRitmo.jsx'
import PanelSonido from './components/PanelSonido.jsx'
import AvisoSeguridad from './components/AvisoSeguridad.jsx'
import ListaFavoritos from './components/favoritos/ListaFavoritos.jsx'
import DialogoGuardar from './components/favoritos/DialogoGuardar.jsx'

import {
  EDICION,
  ID_CAJA,
  obtenerPreset,
  patronDe,
  patronDeLado,
  resolverPatronBaseId,
} from './data/catalogoPatrones.js'
import { MAX_FAVORITOS } from './data/esquema.js'
import { ID_SILENCIO } from './data/catalogoSonidos.js'
import { favoritoIdentico, configuracionDe } from './lib/comparadorConfiguracion.js'
import { nombreSugerido } from './lib/nombreSugerido.js'

export default function PantallaRespiracion({
  configuracion,
  onCambiar,
  onEmpezar,
  onSalir,
  avisoVisto,
  onDescartarAviso,
  favoritos = [],
  recientes = [],
  onCargarFavorito,
  onGuardarFavorito,
  onEliminarFavorito,
  eliminada = null,
  onDeshacer,
  vistaPreviaSonido,
}) {
  const navegar = useNavigate()
  const textos = copy.respiracion.configuracion
  const encabezado = useRef(null)

  const [avisoVisible, setAvisoVisible] = useState(!avisoVisto)
  const [guardando, setGuardando] = useState(false)
  const [avisoPatron, setAvisoPatron] = useState(null)

  // RN-RE-NAV-41 — Al entrar, el foco va al encabezado. Quien usa lector de
  // pantalla necesita saber dónde está antes de tabular a ningún control.
  useEffect(() => {
    encabezado.current?.focus()
  }, [])

  const preset = obtenerPreset(configuracion.patronBaseId)
  const edicion = preset?.editable ?? EDICION.LIBRE

  function cambiarPatronBase(id) {
    setAvisoPatron(null)
    onCambiar({ patronBaseId: id, patron: patronDe(id) })
  }

  /**
   * RN-RE-NAV-19 — Editar una fase suelta de la caja la convierte en
   * `personalizado`, y se dice. No se impide: lo que quiere quien mueve un solo
   * lado es un ritmo asimétrico, y negárselo sería defender el nombre del preset
   * por encima de lo que la persona pidió.
   */
  function cambiarFase(fase, valor) {
    const patron = { ...configuracion.patron, [fase]: valor }
    const base = resolverPatronBaseId(configuracion.patronBaseId, patron)
    if (configuracion.patronBaseId === ID_CAJA && base !== ID_CAJA) {
      setAvisoPatron(textos.cajaModificada)
    }
    aplicarPatron(patron, base)
  }

  function cambiarLado(valor) {
    aplicarPatron(patronDeLado(valor), ID_CAJA)
  }

  /**
   * RN-RE-NAV-20 — Un patrón imposible **nunca deshabilita "Empezar"**. Se
   * corrige al valor válido más cercano y se explica. Un botón apagado sin decir
   * por qué deja a alguien mirando una pantalla que no responde.
   */
  function aplicarPatron(bruto, base) {
    const { valido, patron } = validarPatron(bruto)
    if (!valido && !sonIguales(patron, bruto)) setAvisoPatron(textos.patronAjustado)
    onCambiar({ patron, patronBaseId: resolverPatronBaseId(base, patron) })
  }

  const yaGuardada = favoritoIdentico(configuracion, favoritos)
  const nombres = favoritos.map((favorito) => favorito.nombre)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={onSalir}
          aria-label={copy.respiracion.accesibilidad.salir}
          className="min-h-touch min-w-touch rounded-full text-on-surface"
        >
          ✕
        </button>
        <h1 ref={encabezado} tabIndex={-1} className="font-display text-md text-on-surface">
          {textos.titulo}
        </h1>
        <button
          type="button"
          onClick={() => setAvisoVisible(true)}
          aria-label={textos.info}
          className="min-h-touch min-w-touch rounded-full text-on-surface"
        >
          ⓘ
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-5 pb-4">
        {/* RN-RE-COPY-01/03 y RN-RE-NAV-35 — Una tarjeta descartable dentro de
            la pantalla, nunca un modal que bloquee lo que hay detrás. */}
        {avisoVisible ? (
          <AvisoSeguridad
            onDescartar={() => {
              setAvisoVisible(false)
              onDescartarAviso()
            }}
          />
        ) : null}

        {/* §9 de SPEC_14 — En `inactivo` la visual es una vista previa del patrón
            elegido, quieta. Cambiar de patrón la actualiza. */}
        <div className="flex justify-center">
          <GuiaVisual
            visual={configuracion.visual}
            patron={configuracion.patron}
            estado={null}
            estadoSesion={ESTADOS.INACTIVO}
          />
        </div>

        <SelectorPatron patronBaseId={configuracion.patronBaseId} onCambiar={cambiarPatronBase} />

        <SelectorVisual
          visual={configuracion.visual}
          onCambiar={(visual) => onCambiar({ visual })}
        />

        <ControlesRitmo
          patron={configuracion.patron}
          edicion={edicion}
          onCambiarFase={cambiarFase}
          onCambiarLado={cambiarLado}
          aviso={avisoPatron}
        />

        <SelectorDuracion
          duracion={configuracion.duracion}
          onCambiar={(duracion) => onCambiar({ duracion })}
        />

        <PanelSonido
          hayAudio={haySoporte()}
          sonidoId={configuracion.sonidoAmbienteId ?? ID_SILENCIO}
          onElegirSonido={(sonidoAmbienteId) => {
            onCambiar({ sonidoAmbienteId })
            vistaPreviaSonido?.(sonidoAmbienteId)
          }}
          volumenAmbiente={configuracion.volumenAmbiente}
          volumenGuia={configuracion.volumenGuia}
          guiaSonoraActiva={configuracion.guiaSonoraActiva}
          onVolumenAmbiente={(volumenAmbiente) => onCambiar({ volumenAmbiente })}
          onVolumenGuia={(volumenGuia) => onCambiar({ volumenGuia })}
          onGuiaSonora={(guiaSonoraActiva) => onCambiar({ guiaSonoraActiva })}
        />
      </div>

      {/* RN-RE-NAV-14 — La acción principal, pegada abajo y siempre visible.
          Es lo único que de verdad importa de esta pantalla. */}
      <div className="respiracion-accion sticky bottom-0 flex flex-col gap-2 px-5 py-4">
        <button
          type="button"
          onClick={() => {
            onEmpezar()
            navegar('/respiracion/sesion')
          }}
          className="min-h-touch rounded-full border border-espacio px-5 font-display text-md text-on-surface"
        >
          {copy.respiracion.controles.empezar}
        </button>

        {yaGuardada === null ? (
          <button
            type="button"
            onClick={() => setGuardando(true)}
            className="min-h-touch rounded-full px-5 text-sm text-on-surface-soft"
          >
            {copy.respiracion.favoritos.guardar}
          </button>
        ) : null}
      </div>

      {/* RN-RE-NAV-15 — Debajo de "Empezar", en el orden del DOM y en el visual.
          Quien llega con prisa no atraviesa listas para respirar. */}
      <div className="flex flex-col gap-6 px-5 pb-12">
        <ListaFavoritos
          favoritos={favoritos}
          recientes={recientes}
          onCargar={onCargarFavorito}
          onOpciones={onEliminarFavorito}
          onGuardarReciente={(reciente) => onGuardarFavorito(configuracionDe(reciente))}
          eliminada={eliminada}
          onDeshacer={onDeshacer}
        />
      </div>

      {guardando ? (
        <DialogoGuardar
          sugerido={nombreSugerido(
            preset ? copy.respiracion.patrones[preset.claveCopy].nombre : textos.titulo,
            nombres,
          )}
          nombresExistentes={nombres}
          favoritoIdentico={yaGuardada}
          alLimite={favoritos.length >= MAX_FAVORITOS}
          resumen={[]}
          onGuardar={(nombre) => {
            onGuardarFavorito({ ...configuracion, nombre })
            setGuardando(false)
          }}
          onReemplazar={(nombre) => {
            onGuardarFavorito({ ...configuracion, nombre, reemplazar: true })
            setGuardando(false)
          }}
          onCancelar={() => setGuardando(false)}
        />
      ) : null}
    </div>
  )
}
