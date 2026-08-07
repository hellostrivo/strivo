// src/tokens/index.js
// Tokens de diseño de Strivo — fuente canónica para lógica JS dinámica
// Para clases CSS → usar tailwind.config.js
// Blueprint v3, §6.3–6.9

export const colors = {
  ink:   '#241E33',
  paper: '#FBF8F4',
  night: '#191428',
  amber: '#E5A25C',
  plum:  '#8B6BA8',
  sage:  '#7E9E86',
  clay:  '#C9836B',
  mist:  '#93A9C4',
}

// Gradientes horarios (usados en la pantalla Hoy)
// Se interpolan según la hora actual del usuario
export const gradientsBySlot = {
  amanecer:   { from: '#FEE8B6', to: '#FFE4C4' }, // 4:00–11:30
  dia:        { from: '#FFFEF0', to: '#FFF8E7' }, // día normal
  atardecer:  { from: '#F5DEB3', to: '#F0E6D2' }, // 4h antes de dormir
  noche:      { from: '#E8DCC8', to: '#D9CFC4' }, // noche
  madrugada:  { from: '#C9C0C0', to: '#B8B0B0' }, // 00:00–04:00
}

// Colores de cada área de identidad (usados en chips, puntos, etc.)
export const areaColors = {
  salud:       '#7E9E86',
  trabajo:     '#93A9C4',
  relaciones:  '#C9836B',
  finanzas:    '#E5A25C',
  espiritual:  '#8B6BA8',
  personal:    '#D9CFC4',
  creatividad: '#FFE4C4',
  otra:        '#D9CFC4',
}

// Íconos por área (emoji como fallback hasta tener íconos propios)
export const areaIcons = {
  salud:       '🌿',
  trabajo:     '💼',
  relaciones:  '🤝',
  finanzas:    '📊',
  espiritual:  '✨',
  personal:    '🌱',
  creatividad: '🎨',
  otra:        '○',
}

// Duraciones de animación (ms)
export const durations = {
  fast:    120,
  // Revelar un campo que aparece bajo una opción (§6.3.C)
  reveal:  200,
  base:    260,
  slow:    420,
  // Cambio de área dentro de P4C: el bloque de contenido cruza en 280ms y el
  // indicador de progreso en 180ms (§10.3)
  areaSwap:      280,
  areaIndicator: 180,
  // Pulso de la instrucción de límite en P4B (§8.5)
  pulse:   600,
  slower:  700,
  slowest: 900, // cierre nocturno
}

// Tamaños mínimos de toque (px)
export const touch = {
  min:  56,
  smMin: 48,
}

// ─── Apertura de Strivo (§3.3 del documento de cambios v2.2) ─────────────────
// Excepción autorizada al rango 120–900 ms: la apertura es una descompresión,
// no una transición de interfaz. Documentada como tal en CLAUDE.md.
// En ms, para poder programar los relevos desde JS.
export const apertura = {
  total:               5000,
  fondoEntra:           800,
  nucleoEntraDesde:     800,
  nucleoEntra:          600,
  expansionDesde:      1400,
  expansion:           1400,
  contraccionDesde:    2800,
  contraccion:         1400,
  palabraEntraDesde:   1800,
  palabraEntra:         800,
  salidaDesde:         4200,
  salida:               800,
  entrarApareceEn:     1500,
  saltar:               300,
  // Con movimiento reducido: sin escala y mucho más corta
  totalReducido:       1600,
  palabraEntraReducida: 400,
  easingRespiracion: 'cubic-bezier(0.37, 0, 0.63, 1)',
}

// ─── Pantallas de transición del onboarding (§9) ─────────────────────────────
// La otra excepción autorizada al rango 120–900 ms. En ms, como la apertura.
export const transicion = {
  total:              3000,
  fondoEntra:          400,
  fraseEntraDesde:     300,
  fraseEntra:          600,
  fraseSaleDesde:     2600,
  fraseSale:           400,
  saltar:              250,
  // Con movimiento reducido: sin desplazamiento vertical y más corta
  totalReducida:      2300,
  fraseEntraReducida:  250,
}

// Núcleo de luz de la apertura (px). El escalado máximo nunca toca los bordes.
export const aperturaNucleo = {
  // Luz difusa, no una figura: el gradiente se desvanece antes del borde del
  // elemento, así que no hay contorno que lo recorte.
  luz: `radial-gradient(circle,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 249, 235, 0.65) 38%,
    rgba(254, 232, 182, 0.28) 62%,
    rgba(254, 232, 182, 0) 78%)`,
  diametroCompacto:      96,
  diametroBase:         120,
  diametroAmplio:       140,
  puntoDeCorteCompacto: 360,
  puntoDeCorteAmplio:   430,
  escalaMaxima:        1.32,
  opacidadNucleo:       0.9,
  opacidadPalabra:     0.75,
  opacidadEntrar:      0.45,
}
