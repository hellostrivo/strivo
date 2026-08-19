// src/components/lumia/HeroeHoy.jsx
// El héroe de la pantalla Hoy: saludo, fecha y frase del día.
//
// **Sin intención del día.** La pregunta "¿Con qué intención quieres entrar al
// día?" se retiró entera del producto: la mañana pregunta cómo quieres sentirte
// y qué haría de hoy un gran día, y nada más. La gran visión sigue en su sitio,
// en el Diario, que es otra superficie y otro momento (RN-LU-INT-02).
//
// **El conmutador entra como hueco, justo debajo de la fecha.** Es el primer
// elemento con el que se puede interactuar en toda la pantalla: elegir de qué
// momento se está hablando va antes que leer la frase y antes que cualquier
// pregunta. El héroe no sabe qué momentos hay ni cómo se cambian; solo le
// reserva el sitio (`conmutador`), que es de quien gobierna el estado.

import FraseDelDia from './FraseDelDia'
import { fechaLarga } from '@/lumia/fechas'

export default function HeroeHoy({ estado, saludo, conmutador }) {
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface">{saludo}</h1>
        <p className="text-sm text-on-surface-soft">{fechaLarga(estado.fecha)}</p>
      </div>

      {conmutador}

      <FraseDelDia frase={estado.frase} />
    </header>
  )
}
