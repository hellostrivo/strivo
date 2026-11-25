// src/components/diario/EntradaDelJournal.jsx
// Una entrada del journal, entera y para leer (SPEC_25, D6).
//
// Solo existe en modo lectura: la lista enseña un extracto y la única forma de
// leer una entrada entera era el editor. Lo escrito nunca queda detrás del
// muro, así que aquí se lee sin pagar nada, y se puede eliminar: es de la
// persona.

import Button from '@components/ui/Button'
import AvisoDeLectura from '@components/suscripcion/AvisoDeLectura'
import { copy } from '@copy'
import { fechaCorta } from '@/diario/fechas'
import { etiquetasDe } from '@/diario/emocionesJournal'

const textos = copy.diario.journal

export default function EntradaDelJournal({
  entrada,
  genero,
  confirmando,
  onVolver,
  onOpciones,
  onBorrar,
}) {
  const emociones = etiquetasDe(entrada.emotions, entrada.otherText, genero)
  return (
    <div className="flex flex-col gap-6 px-5 pb-12 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onVolver}
          className="rounded-full px-3 py-2 min-h-touch-sm text-sm text-on-surface-soft hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        >
          {textos.editor.volver}
        </button>
        <p className="text-sm text-on-surface-soft">{fechaCorta(entrada.date)}</p>
      </header>

      <AvisoDeLectura onOpciones={onOpciones} />

      {emociones.length > 0 && <p className="text-base text-on-surface">{emociones.join(' · ')}</p>}
      {entrada.text && (
        <p className="whitespace-pre-wrap text-base text-on-surface">{entrada.text}</p>
      )}

      {entrada.id && (
        <div>
          <Button type="button" size="sm" variant="surface" onClick={onBorrar}>
            {confirmando ? textos.editor.borrarConfirmar : textos.editor.borrar}
          </Button>
        </div>
      )}
    </div>
  )
}
