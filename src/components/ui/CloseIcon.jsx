// src/components/ui/CloseIcon.jsx
// Aspa para quitar un elemento de una lista de chips (motivos propios,
// hábitos propios). Decorativa: la acción la nombra el aria-label del chip.

export default function CloseIcon({ className = 'w-3 h-3 flex-shrink-0 opacity-60' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  )
}
