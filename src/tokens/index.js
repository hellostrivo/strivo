// src/tokens/index.js
// Tokens de diseño de Strivo — fuente canónica para lógica JS dinámica
// Para clases CSS → usar tailwind.config.js
// Blueprint v3, §6.3–6.9

export const colors = {
  ink: '#241E33',
  paper: '#FBF8F4',
  night: '#191428',
  amber: '#E5A25C',
  plum: '#8B6BA8',
  sage: '#7E9E86',
  clay: '#C9836B',
  mist: '#93A9C4',
}

// Gradientes horarios (usados en la pantalla Hoy)
// Se interpolan según la hora actual del usuario
export const gradientsBySlot = {
  amanecer: { from: '#FEE8B6', to: '#FFE4C4' }, // 4:00–11:30
  dia: { from: '#FFFEF0', to: '#FFF8E7' }, // día normal
  atardecer: { from: '#F5DEB3', to: '#F0E6D2' }, // 4h antes de dormir
  noche: { from: '#E8DCC8', to: '#D9CFC4' }, // noche
  madrugada: { from: '#C9C0C0', to: '#B8B0B0' }, // 00:00–04:00
}

// Colores de cada área de identidad (usados en chips, puntos, etc.)
export const areaColors = {
  salud: '#7E9E86',
  trabajo: '#93A9C4',
  relaciones: '#C9836B',
  finanzas: '#E5A25C',
  espiritual: '#8B6BA8',
  personal: '#D9CFC4',
  creatividad: '#FFE4C4',
  otra: '#D9CFC4',
}

// Íconos por área (emoji como fallback hasta tener íconos propios)
export const areaIcons = {
  salud: '🌿',
  trabajo: '💼',
  relaciones: '🤝',
  finanzas: '📊',
  espiritual: '✨',
  personal: '🌱',
  creatividad: '🎨',
  otra: '○',
}

// Duraciones de animación (ms)
export const durations = {
  fast: 120,
  base: 260,
  slow: 420,
  slower: 700,
  slowest: 900, // cierre nocturno
}

// Tamaños mínimos de toque (px)
export const touch = {
  min: 56,
  smMin: 48,
}
