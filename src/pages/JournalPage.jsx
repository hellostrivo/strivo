// src/pages/JournalPage.jsx — STUB Fase 0
import { copy } from '@copy'

export default function JournalPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-paper">
      <h1 className="font-display text-xl text-ink mb-2">Journal</h1>
      <p className="text-base text-ink/50 text-center">{copy.empty.journal}</p>
      <p className="text-sm text-ink/30 mt-4">Fase 0 · Se implementa en Fase 1</p>
    </div>
  )
}
