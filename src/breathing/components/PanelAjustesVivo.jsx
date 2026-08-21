// src/breathing/components/PanelAjustesVivo.jsx
// Ajustar sin parar de respirar (RN-RE-NAV-24 y 44).
//
// **Lo que NO ofrece es la mitad de su diseño.** Se puede cambiar la visual, el
// sonido y los volúmenes; **no** el patrón ni la duración. Cambiar el ritmo a
// mitad de sesión no es ajustar: es empezar otra sesión, y hacerlo pasar por un
// ajuste dejaría a alguien a media exhalación con un patrón que no eligió para
// este momento. Lo que se puede tocar en vivo es lo que no interrumpe.
//
// El ritmo sigue corriendo mientras el panel está abierto: la máquina ni se
// entera, y lo único que se toca es el grafo de audio y quién pinta.
//
// **Trampa de foco mientras está abierto y `Escape` lo cierra** (RN-RE-NAV-44):
// un panel deslizante del que el tabulador se escapa hacia la pantalla de detrás
// deja a quien navega con teclado perdido en una pantalla que no ve.

import { useEffect, useRef } from 'react'
import { copy } from '@copy'
import PanelSonido from './PanelSonido.jsx'
import SelectorVisual from './SelectorVisual.jsx'

const FOCALIZABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function PanelAjustesVivo({ configuracion, onAjustar, onCerrar, hayAudio = true }) {
  const panel = useRef(null)

  useEffect(() => {
    panel.current?.querySelector(FOCALIZABLES)?.focus()
  }, [])

  /** La trampa: el tabulador da la vuelta dentro en vez de salirse. */
  function alPulsar(evento) {
    if (evento.key === 'Escape') {
      onCerrar()
      return
    }
    if (evento.key !== 'Tab') return

    const focalizables = [...(panel.current?.querySelectorAll(FOCALIZABLES) ?? [])]
    if (focalizables.length === 0) return
    const primero = focalizables[0]
    const ultimo = focalizables[focalizables.length - 1]

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault()
      ultimo.focus()
      return
    }
    if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primero.focus()
    }
  }

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={copy.respiracion.sesion.ajustes}
      onKeyDown={alPulsar}
      className="respiracion-ajustes flex flex-col gap-6 rounded-t-3xl border-t border-espacio p-6"
    >
      <SelectorVisual visual={configuracion.visual} onCambiar={(visual) => onAjustar({ visual })} />

      <PanelSonido
        hayAudio={hayAudio}
        sonidoId={configuracion.sonidoAmbienteId}
        onElegirSonido={(sonidoAmbienteId) => onAjustar({ sonidoAmbienteId })}
        volumenAmbiente={configuracion.volumenAmbiente}
        volumenGuia={configuracion.volumenGuia}
        guiaSonoraActiva={configuracion.guiaSonoraActiva}
        onVolumenAmbiente={(volumenAmbiente) => onAjustar({ volumenAmbiente })}
        onVolumenGuia={(volumenGuia) => onAjustar({ volumenGuia })}
        onGuiaSonora={(guiaSonoraActiva) => onAjustar({ guiaSonoraActiva })}
      />

      <button
        type="button"
        onClick={onCerrar}
        className="min-h-touch rounded-full border border-espacio px-5 text-sm text-on-surface"
      >
        {copy.respiracion.sesion.cerrarAjustes}
      </button>
    </div>
  )
}
