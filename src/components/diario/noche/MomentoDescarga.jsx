// src/components/diario/noche/MomentoDescarga.jsx
// La descarga opcional que cierra la noche algunos días (§8).
//
// Va **después** de los tres momentos y fuera de la cuenta del indicador: no
// aparece siempre, y un total que cambia de una noche a otra deja de orientar.
// Es el mismo lugar que ocupa la pausa en la mañana.
//
// Llega por dos caminos y **el componente no distingue cuál**: la eligió una de
// las cuatro emociones difíciles, o la abrió quien quiso desde el enlace de
// abajo. Que se vea igual en los dos casos es deliberado: si la versión
// automática se presentara distinta, sería la app diciendo "te veo mal".
//
// **Es un espacio, no una intervención.** Lo que se escriba aquí no se analiza,
// no se responde, no se convierte en consejo y no dispara ningún mensaje. La app
// no diagnostica y no promete que nadie vaya a sentirse mejor: guarda lo que se
// deja y cierra el día.
//
// Dos salidas, las dos válidas: "Ahora no" pasa de largo y "Dejarlo aquí y
// cerrar mi día" guarda lo escrito. Ninguna se deshabilita: con el campo vacío,
// la principal cierra igual.

import { clsx } from 'clsx'
import Button from '@components/ui/Button'
import { CampoTexto } from '@components/shared/Campo'
import { copy } from '@copy'
import { MAX_DESCARGA } from '@/diario/noche'

const textos = copy.diario.noche.descarga

export default function MomentoDescarga({
  valor,
  textoAtras,
  onCambiar,
  onVolcar,
  onOmitir,
  onCerrar,
  onAtras,
}) {
  const enlace = clsx(
    'rounded-full px-3 py-2 min-h-touch-sm text-sm',
    'text-on-surface-soft hover:text-on-surface',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
  )

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-on-surface-soft">{textos.opcional}</p>
        <h2 className="font-display text-md text-on-surface">{textos.titulo}</h2>
        <p className="text-sm text-on-surface-soft">{textos.lead}</p>
      </div>

      <CampoTexto
        filas={4}
        value={valor}
        maxLength={MAX_DESCARGA}
        onChange={(evento) => onCambiar(evento.target.value)}
        onBlur={onVolcar}
        placeholder={textos.placeholder}
        aria-label={textos.titulo}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="surface" onClick={onCerrar}>
          {textos.cta}
        </Button>
        <button type="button" onClick={onOmitir} className={enlace}>
          {textos.omitir}
        </button>
        {/* Volver al momento 3: §2 pide poder rehacer cualquier respuesta, y
            esta pantalla no es la excepción. "Ahora no" cierra el día sin dejar
            nada; "Atrás" no cierra nada. */}
        <button type="button" onClick={onAtras} className={enlace}>
          {textoAtras}
        </button>
      </div>
    </section>
  )
}
