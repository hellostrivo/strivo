// src/unaPausa/Capsula.jsx
// Una cápsula, en el orden de SPEC_28.3 §4.5. La misma para la vigente y para
// el detalle de una del archivo: lo único que cambia es la etiqueta de arriba
// y si al final se ofrece el archivo.
//
// **`theme` no se pinta** (DP-28.24): es el nombre del calendario editorial, y
// repetirlo bajo el título diría dos veces lo mismo. La etiqueta de la vigente
// es la frase fija «Tema de la semana»; la del detalle, su fecha.
//
// **La pregunta y la práctica `journal` se leen y no llevan control** (desvío
// 4): abrir el Journal desde aquí es de 28.4, y un botón que no hace nada es
// peor que no tenerlo. La práctica `breathing` sí lleva su enlace, con la ruta
// que llega por props desde `App.jsx`: `unaPausa/` no nombra `breathing/`.
//
// Sin tiempo de lectura, sin número de pausa y sin marca de «leída».

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { copy } from '@copy'
import Fuentes from './Fuentes.jsx'
import { fechaDePausa } from './fecha.js'

const textos = copy.unaPausa

const enlace =
  'inline-flex min-h-[44px] items-center text-base text-on-surface underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30'

/**
 * La portada: ancho completo de la columna, sin recorte y sin texto encima
 * (DP-28.4). `width` y `height` reservan su sitio antes de que llegue, así que
 * el texto de debajo no salta. **Si no carga, no se pinta nada**: ni icono roto
 * ni hueco. Quien la monta le pone `key` con su `src`, para que una portada
 * nueva vuelva a intentarlo.
 */
function Portada({ src, alt }) {
  const [rota, setRota] = useState(false)
  if (!src || rota) return null
  return (
    <img
      src={src}
      alt={alt ?? ''}
      width="1600"
      height="1200"
      decoding="async"
      onError={() => setRota(true)}
      className="block h-auto w-full rounded-lg"
    />
  )
}

/** Un bloque con su encabezado `h2`. */
function Bloque({ titulo, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-md text-on-surface">{titulo}</h2>
      {children}
    </section>
  )
}

function Practica({ entrada, rutaRespiracion }) {
  const { practiceDestination: destino, practiceLabel: rotulo, practiceText: texto } = entrada
  if (!destino || !rotulo) return null

  return (
    <Bloque titulo={textos.llevaloATuDia}>
      {destino === 'breathing' && rutaRespiracion ? (
        <p>
          <Link to={rutaRespiracion} className={enlace}>
            {rotulo}
          </Link>
        </p>
      ) : destino === 'in_capsule' ? (
        <>
          <h3 className="text-base font-semibold text-on-surface">{rotulo}</h3>
          {texto && (
            <p className="whitespace-pre-line text-base leading-relaxed text-on-surface">{texto}</p>
          )}
        </>
      ) : (
        <p className="text-base leading-relaxed text-on-surface">{rotulo}</p>
      )}
    </Bloque>
  )
}

/**
 * @param {{
 *   entrada: object,
 *   vigente?: boolean,
 *   srcPortada?: string|null,
 *   rutaRespiracion?: string,
 *   rutaArchivo?: string|null,
 *   refEncabezado?: object,
 * }} props
 *   `srcPortada`: la que se pinta —la guardada, si la hay—; por defecto, la del
 *   canal. `rutaArchivo`: solo en la vigente y solo si el archivo tiene algo.
 */
export default function Capsula({
  entrada,
  vigente = false,
  srcPortada,
  rutaRespiracion,
  rutaArchivo = null,
  refEncabezado,
}) {
  const etiqueta = vigente ? textos.etiqueta : fechaDePausa(entrada.publicadaEl)
  const src = srcPortada === undefined ? (entrada.portada?.src ?? null) : srcPortada
  const hallazgos = Array.isArray(entrada.keyFindings) ? entrada.keyFindings : []

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        {etiqueta &&
          (vigente ? (
            <p className="text-sm text-on-surface-soft">{etiqueta}</p>
          ) : (
            <p className="text-sm text-on-surface-soft">
              <time dateTime={entrada.publicadaEl}>{etiqueta}</time>
            </p>
          ))}
        <h1
          ref={refEncabezado}
          tabIndex={-1}
          className="una-pausa-encabezado font-display text-xl text-on-surface"
        >
          {entrada.title}
        </h1>
      </header>

      {entrada.opening && (
        <p className="whitespace-pre-line text-base leading-relaxed text-on-surface">
          {entrada.opening}
        </p>
      )}

      <Portada key={src ?? ''} src={src} alt={entrada.portada?.alt} />

      {(entrada.evidenceSummary || hallazgos.length > 0) && (
        <Bloque titulo={textos.loQueSabemos}>
          {entrada.evidenceSummary && (
            <p className="whitespace-pre-line text-base leading-relaxed text-on-surface">
              {entrada.evidenceSummary}
            </p>
          )}
          {hallazgos.length > 0 && (
            <ul className="flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed text-on-surface">
              {hallazgos.map((hallazgo) => (
                <li key={hallazgo}>{hallazgo}</li>
              ))}
            </ul>
          )}
        </Bloque>
      )}

      <Practica entrada={entrada} rutaRespiracion={rutaRespiracion} />

      {entrada.journalPrompt && (
        <Bloque titulo={textos.preguntaParaTi}>
          <p className="text-base leading-relaxed text-on-surface">{entrada.journalPrompt}</p>
        </Bloque>
      )}

      <Fuentes fuentes={entrada.fuentes} generatedWithAi={entrada.generatedWithAi} />

      {vigente && rutaArchivo && (
        <p>
          <Link to={rutaArchivo} className={enlace}>
            {textos.explorar}
          </Link>
        </p>
      )}
    </article>
  )
}
