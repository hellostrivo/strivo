// src/breathing/PantallaRespiracion.jsx
// Configurar y arrancar (SPEC_16 §3.2), ya como una sección más de la app.
//
// **"Empezar" está fijo abajo y las listas van debajo de él** (RN-RE-NAV-14 y
// 15). Es la regla que más forma le da a esta pantalla: quien abre esto puede
// estar mal en ese momento, y hacerle atravesar un catálogo de favoritos para
// llegar al botón es poner una tienda entre alguien y lo que vino a buscar. Lo
// que importa está siempre a la vista; lo demás está, pero más abajo.
//
// **Todo llega precargado** (RN-RE-NAV-16): un toque desde la pestaña hasta
// respirar. Salvo la primera vez de todas, que arranca en `entrada-suave`
// —sin retenciones— porque empezar aguantando el aire sin haberlo hecho nunca es
// innecesariamente exigente (RN-RE-NAV-17).
//
// ── Lo que cambió al pasar a ser una sección (24 ago) ────────────────────────
//
// **La cabecera propia se retiró.** Tenía un ✕ para salir y un título; arriba
// ya está la franja de la cabecera con la marca y la pestaña activa, y
// dos cabeceras seguidas son dos sitios distintos diciendo dónde estás. Salir
// es cambiar de pestaña, como en el Journal y en el Historial. Lo único que
// sobrevive de aquella fila es el acceso al aviso de seguridad.
//
// **Los bloques son tarjetas, no secciones sueltas.** Es el idioma de la app:
// superficie elevada, borde heredado y esquinas de 24 px, igual que las tarjetas
// del Home y las del Diario. Aquí ninguna clase nombra un color (RN-SURF-01):
// `bg-raised`, `border-on-surface` y `border-espacio-acento` los resuelve el
// espacio en el que esté montada, así que la misma pantalla se viste sola con la
// paleta de la mañana o con la de la noche.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { copy } from '@copy'
import Button from '@components/ui/Button'
import { haySoporte } from '@lib/audio/contextoAudio'
import { ESTADOS } from '@lib/respiracion/maquinaSesion'
import { sonIguales, validarPatron } from '@lib/respiracion/motorRitmo'

import GuiaVisual from './components/visuales/GuiaVisual.jsx'
import Bloque from './components/Bloque.jsx'
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
  rutaSesion = '/respiracion/sesion',
}) {
  const navegar = useNavigate()
  const textos = copy.respiracion.configuracion
  const encabezado = useRef(null)

  const [avisoVisible, setAvisoVisible] = useState(!avisoVisto)
  const [guardando, setGuardando] = useState(false)
  const [avisoPatron, setAvisoPatron] = useState(null)

  // RN-RE-NAV-41 — Al entrar, el foco va al encabezado. Quien usa lector de
  // pantalla necesita saber dónde está antes de tabular a ningún control.
  //
  // **El foco no se ve, y por eso el encabezado lleva clase (9 sep 2026).** Un
  // `tabIndex={-1}` enfocado por script recibe el anillo por defecto del
  // navegador —un recuadro azul celeste alrededor de la palabra—, que aparecía
  // al abrir la sección sin que nadie lo hubiera pedido. El anillo lo apaga
  // `.respiracion-encabezado` en `styles/respiracion.css`: un encabezado no es
  // alcanzable con el tabulador, así que no es de los elementos a los que WCAG
  // 2.4.7 exige indicador, y lo que la regla 41 pide —que el lector anuncie
  // dónde estás— lo da el foco, no su dibujo.
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
    <div data-surface="light" className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col gap-5 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1
              ref={encabezado}
              tabIndex={-1}
              className="respiracion-encabezado font-display text-lg text-on-surface"
            >
              {textos.titulo}
            </h1>
            <p className="text-sm text-on-surface-soft">{copy.respiracion.subtitulo}</p>
          </div>

          <button
            type="button"
            onClick={() => setAvisoVisible(true)}
            aria-label={textos.info}
            className="respiracion-info min-h-touch-sm min-w-touch-sm shrink-0 rounded-full border border-on-surface text-on-surface-soft"
          >
            <span aria-hidden="true">ⓘ</span>
          </button>
        </div>

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

        {/* **"Cómo lo quieres ver" va primero, y pegada al dibujo (24 ago).**
            Estaba entre la duración y el sonido, a media pantalla de distancia
            de lo que decide: había que elegir a ciegas y bajar a comprobar.
            Aquí arriba, cambiar de opción reemplaza el dibujo que se tiene
            justo encima, así que la diferencia entre círculo y línea se ve en
            el momento en vez de imaginarse. Lo pidió el propietario del
            producto. */}
        <Bloque>
          <SelectorVisual
            visual={configuracion.visual}
            onCambiar={(visual) => onCambiar({ visual })}
          />
        </Bloque>

        <Bloque>
          <SelectorPatron patronBaseId={configuracion.patronBaseId} onCambiar={cambiarPatronBase} />

          <ControlesRitmo
            patron={configuracion.patron}
            edicion={edicion}
            onCambiarFase={cambiarFase}
            onCambiarLado={cambiarLado}
            aviso={avisoPatron}
          />
        </Bloque>

        <Bloque>
          <SelectorDuracion
            duracion={configuracion.duracion}
            onCambiar={(duracion) => onCambiar({ duracion })}
          />
        </Bloque>

        <Bloque>
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
        </Bloque>
      </div>

      {/* RN-RE-NAV-14 — La acción principal, pegada abajo y siempre visible. Es
          lo único que de verdad importa de esta pantalla.
          El `bottom` lo pone `.respiracion-accion` en el CSS y no una clase
          suelta: dentro de un espacio hay una barra fija al pie, y a `bottom: 0`
          el botón quedaba debajo de ella. */}
      <div className="respiracion-accion sticky flex flex-col gap-2 px-5 py-4">
        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            onEmpezar()
            navegar(rutaSesion)
          }}
        >
          {copy.respiracion.controles.empezar}
        </Button>

        {yaGuardada === null ? (
          <button
            type="button"
            onClick={() => setGuardando(true)}
            className="min-h-touch-sm rounded-full px-5 text-sm text-on-surface-soft"
          >
            {copy.respiracion.favoritos.guardar}
          </button>
        ) : null}
      </div>

      {/* RN-RE-NAV-15 — Debajo de "Empezar", en el orden del DOM y en el visual.
          Quien llega con prisa no atraviesa listas para respirar. */}
      <div className="flex flex-col gap-6 px-5 pb-12 pt-2">
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
