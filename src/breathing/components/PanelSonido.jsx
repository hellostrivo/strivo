// src/breathing/components/PanelSonido.jsx
// Elegir el sonido de fondo y los dos volúmenes (SPEC_15 §5).
//
// **Tocar un sonido lo reproduce en el momento** (RN-RE-SND-27). Es la decisión
// que más cambia esta pantalla: elegir "Cristales" o "Viento" leyendo su nombre
// es adivinar, y adivinar en una herramienta de calma significa empezar la
// sesión con el sonido equivocado y tener que salir a cambiarlo. La vista previa
// suena al volumen configurado (RN-RE-SND-28), para que se oiga como se va a oír
// —no más alto "para que se aprecie"—, y se apaga sola a los veinte segundos.
//
// El primer toque en cualquier sonido es además el gesto que crea o reanuda el
// `AudioContext` (RN-RE-SND-29 y §2.2): ningún navegador deja sonar nada sin él.
//
// Sin Web Audio, el panel entero no se monta (caso 6.1). No se muestra
// desactivado: enseñar seis controles muertos es peor que no enseñarlos, y la
// respiración funciona completa en silencio.

import { copy } from '@copy'
import { CATALOGO_SONIDOS } from '../data/catalogoSonidos.js'
import { VOLUMEN } from '../audio/mezclador.js'

/**
 * @param {string} sonidoId
 * @param {Function} onElegirSonido - Recibe el id. Quien lo monta hace la vista previa.
 * @param {number} volumenAmbiente
 * @param {number} volumenGuia
 * @param {boolean} guiaSonoraActiva
 * @param {boolean} [hayAudio] - Caso 6.1.
 * @param {boolean} [necesitaGesto] - Caso 6.2: el contexto quedó suspendido.
 */
export default function PanelSonido({
  sonidoId,
  onElegirSonido,
  volumenAmbiente,
  volumenGuia,
  guiaSonoraActiva,
  onVolumenAmbiente,
  onVolumenGuia,
  onGuiaSonora,
  onActivarAudio,
  hayAudio = true,
  necesitaGesto = false,
}) {
  const textos = copy.respiracion.sonidos

  if (!hayAudio) {
    return <p className="text-sm text-on-surface-soft">{textos.sinSoporte}</p>
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>

        {/* Caso 6.2 — El navegador bloqueó el audio pese al gesto. Se ofrece un
            toque para activarlo y la sesión visual no se detiene por esto. */}
        {necesitaGesto ? (
          <button
            type="button"
            onClick={onActivarAudio}
            className="min-h-[44px] rounded-2xl border border-on-surface px-4 text-sm text-on-surface"
          >
            {textos.activar}
          </button>
        ) : null}

        <ul className="flex flex-col gap-2">
          {CATALOGO_SONIDOS.map((entrada) => {
            const nombre = textos[entrada.claveCopy]
            const elegido = entrada.id === sonidoId
            return (
              <li key={entrada.id}>
                <button
                  type="button"
                  onClick={() => onElegirSonido(entrada.id)}
                  aria-pressed={elegido}
                  // RN-RE-FAV-14 — 44 px de alto mínimo. Es la medida por debajo
                  // de la cual un dedo empieza a fallar, y fallar aquí significa
                  // reproducir un sonido que no se quería.
                  className="flex min-h-[44px] w-full flex-col items-start rounded-2xl border border-on-surface px-4 py-2 text-left"
                  data-elegido={elegido ? 'si' : 'no'}
                >
                  <span className="text-sm text-on-surface">{nombre.nombre}</span>
                  <span className="text-xs text-on-surface-soft">{nombre.descripcion}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <Deslizador etiqueta={textos.volumen} valor={volumenAmbiente} onCambio={onVolumenAmbiente} />

      <div className="flex flex-col gap-2">
        <label className="flex min-h-[44px] items-center justify-between gap-4">
          <span className="text-sm text-on-surface">{textos.guia}</span>
          <input
            type="checkbox"
            checked={guiaSonoraActiva}
            onChange={(evento) => onGuiaSonora(evento.target.checked)}
            // 44 px también aquí. La etiqueta que lo envuelve ya es un blanco
            // válido —tocar el texto conmuta la casilla—, pero apuntar a la
            // casilla es lo que hace todo el mundo, y una de 24 px falla.
            className="min-h-[44px] min-w-[44px]"
          />
        </label>
        <p className="text-xs text-on-surface-soft">{textos.guiaAyuda}</p>
      </div>

      <Deslizador etiqueta={textos.volumenGuia} valor={volumenGuia} onCambio={onVolumenGuia} />
    </section>
  )
}

/**
 * Un control de volumen con su porcentaje a la vista.
 *
 * El número no es decoración: sin él, "un poco más bajo" es un gesto que no se
 * puede repetir mañana. Y el `aria-valuetext` lo dice en palabras, porque un
 * lector de pantalla leyendo "0,55" no ayuda a nadie.
 */
function Deslizador({ etiqueta, valor, onCambio }) {
  const porcentaje = Math.round(valor * 100)
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center justify-between text-sm text-on-surface">
        {etiqueta}
        <span className="text-on-surface-soft">{`${porcentaje} %`}</span>
      </span>
      <input
        type="range"
        min={VOLUMEN.min}
        max={VOLUMEN.max}
        step={VOLUMEN.paso}
        value={valor}
        onChange={(evento) => onCambio(Number(evento.target.value))}
        aria-valuetext={`${porcentaje} %`}
        className="min-h-[44px] w-full"
      />
    </label>
  )
}
