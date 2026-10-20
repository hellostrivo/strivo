// src/components/diario/CampoRespuesta.jsx
// El campo de las preguntas abiertas de un solo campo de la mañana y de la
// noche: el paso de la mañana, su pausa, la reflexión y la descarga.
//
// **Cabe en cuatrocientas palabras desde el 20 de octubre de 2026**, como cada
// respuesta de la gratitud y del reconocimiento. Eran 240 caracteres en el
// paso, 180 en la pausa y 400 en la reflexión y la descarga, en un
// `maxLength` que cortaba a la vista. El tope lo aplica la misma regla que las
// filas (`escribirConTope`) con el mismo límite (`LIMITE_DE_RESPUESTA`), y el
// aviso es el mismo: nada hasta las trescientas, y desde ahí cuántas quedan.
//
// **Crece con lo escrito y nunca se desplaza por dentro** (`CampoParrafo`).
// El campo de antes contaba saltos de línea, así que un párrafo largo sin
// ninguno se quedaba en tres líneas y se leía por una rendija. Abre con las
// `filas` que pida la pantalla, que es el sitio que ofrece para empezar.

import { useId } from 'react'
import { CampoParrafo } from '@components/shared/Campo'
import { LIMITE_DE_RESPUESTA, escribirConTope } from '@/diario/filas'
import { avisoDePalabras } from './avisoDePalabras'

export default function CampoRespuesta({ value, onCambiar, ...props }) {
  const idAviso = useId()
  const texto = String(value ?? '')
  const aviso = avisoDePalabras(texto, LIMITE_DE_RESPUESTA)

  return (
    <div className="flex flex-col gap-2">
      <CampoParrafo
        value={texto}
        onChange={(evento) =>
          onCambiar(escribirConTope(texto, evento.target.value, LIMITE_DE_RESPUESTA.palabras))
        }
        aria-describedby={aviso ? idAviso : undefined}
        {...props}
      />
      {aviso && (
        <p id={idAviso} className="self-end text-sm text-on-surface-soft">
          {aviso}
        </p>
      )}
    </div>
  )
}
