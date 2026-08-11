// src/components/lumia/ritual/N6Cierre.jsx
// N6 — Síntesis y cierre (§5.6 · §3.3, etapa 4).
//
// **Hay una sola ceremonia de cierre en toda la app y es `CierreDelDia`.** El
// ritual y la Vista de Noche terminan igual porque son dos caminos al mismo
// sitio (D-4.5); tener aquí una segunda versión sería garantizar que un día se
// separen y que una de las dos envejezca peor. Esta pantalla solo calcula lo
// que hay que decir y se lo pasa.
//
// **El cierre nunca falla** (§3.3). Sin nada escrito la síntesis es "Hoy solo
// viniste. También cuenta.", que es uno de los mensajes más importantes del
// producto. Con la red caída también cierra: todo se escribió en local al
// instante y la cola de sincronización se ocupa después (RN-02).
//
// RN-VN-04 — Con `cansado` o `inquieto` no hay celebración de ningún tipo: ni
// punto de luz, ni frase de logro. Solo el copy compasivo y las buenas noches.

import CierreDelDia from '../CierreDelDia'
import { sintesisDelDia } from '@/lumia/diario'
import { disparaCompasion } from '@/lumia/estadoSueno'

export default function N6Cierre({ estado, onTerminar }) {
  return (
    <CierreDelDia
      sintesis={sintesisDelDia(estado.night, estado.victorias)}
      compasivo={disparaCompasion(estado.night?.sleepState ?? [])}
      onTerminar={onTerminar}
    />
  )
}
