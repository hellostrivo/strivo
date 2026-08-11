// src/components/lumia/HeroeHoy.jsx
// El héroe de la pantalla Hoy: saludo, fecha, frase del día e intención.
//
// **La intención permanece aquí toda la jornada** (§C2.4). Es el delight moment
// que sobrevive al ritual disuelto: el criterio de aceptación 6 del antiguo
// ritual decía que la intención escrita se queda visible en Hoy, y se conserva
// íntegro aunque el ritual que la capturaba ya no exista.
//
// **La captura vive aquí, no aparte.** En la sección Mañana el héroe monta el
// bloque de chips —"se fusiona dentro del display de Hoy → Mañana" (§C2.4)—;
// en la sección Noche se queda la intención escrita, como texto y sin
// controles. No se pinta dos veces: el display y la captura son el mismo sitio
// mirado en dos momentos.
//
// **De noche no se pregunta nada sobre ella.** Lo que la noche recupera es la
// gran visión, y lo hace en el Diario (§5.4, Bloque 6). La intención se queda
// como estaba: se declaró por la mañana y no se evalúa (§C2.4.1, razón 2).
//
// RN-LU-INT-02 — La gran visión **no** aparece en este héroe. Vive en el bloque
// 4 del Diario de mañana, que es otra superficie y otro momento.

import FraseDelDia from './FraseDelDia'
import IntencionDelDia from './IntencionDelDia'
import { copy, interpolate } from '@copy'
import { fechaLarga } from '@/lumia/fechas'

const textos = copy.lumia.intencion

export default function HeroeHoy({ estado, momento, saludo, acciones }) {
  const intencion = estado.intencion?.intentionText ?? ''

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-lg text-on-surface">{saludo}</h1>
        <p className="text-sm text-on-surface-soft">{fechaLarga(estado.fecha)}</p>
      </div>

      <FraseDelDia frase={estado.frase} />

      {momento === 'manana' ? (
        <IntencionDelDia
          intencion={intencion}
          onElegir={acciones.guardarIntencion}
          onEscribir={acciones.escribirIntencion}
          onVolcar={acciones.volcar}
        />
      ) : (
        // Sin intención, aquí no hay nada: ni hueco, ni marca de pendiente, ni
        // invitación a haberla escrito por la mañana (RN-LU-INT-03).
        intencion.trim() !== '' && (
          <p className="text-base text-on-surface">
            {interpolate(textos.guardadaTemplate, { intencion })}
          </p>
        )
      )}
    </header>
  )
}
