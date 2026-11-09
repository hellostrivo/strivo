// src/components/diario/TextoConCitas.jsx
// Una frase de la app que nombra algo que dijo la persona: hoy, su intención de
// la mañana, en el cierre de la mañana y en la pregunta de la noche que la
// recuerda (9 nov 2026).
//
// **Lo citado va en cursiva y nada más.** Mismo cuerpo, mismo peso y mismo
// color que el resto de la frase: las comillas ya vienen en el texto (son
// copy) y la cursiva es lo único que pone la pantalla. Sin recuadro, sin otro
// tono y sin salto de línea, para que la frase se siga leyendo de corrido.
//
// Qué es cita lo dicen los datos (`partes`, de `interpolarPartes`), no este
// componente. Sin partes pinta `texto` tal cual: las preguntas rotativas de la
// noche no citan nada.

import { Fragment } from 'react'

export default function TextoConCitas({ partes, texto }) {
  if (!partes) return texto

  return partes.map((parte, indice) =>
    parte.cita ? (
      <em key={indice} className="italic">
        {parte.texto}
      </em>
    ) : (
      <Fragment key={indice}>{parte.texto}</Fragment>
    ),
  )
}
