# Manual de Marca — Strivo · Lumia · Formia

> Basado en la síntesis visual "Eje Dual — Propuesta 2 de 4"
> Versión 1.1 — Sistema de color, símbolos y tipografía cerrados y confirmados. Pendientes: espaciado de logo, versión monocromática, naming de tabs, íconos de UI (§9)

---

## 1. Visión de marca

### 1.1 El sistema completo

**Strivo** es la marca madre: el puente inteligente entre dos fuerzas complementarias.

> *"Un sistema, dos fuerzas, un mismo propósito."*

No es un producto que se usa directamente — es la inteligencia que conecta y da sentido a lo que ocurre en Lumia y en Formia.

### 1.2 Los dos productos

| | **Lumia** | **Formia** |
|---|---|---|
| **Dirección** | Hacia dentro | Hacia delante |
| **Territorio** | Pausa · Reflexión · Calma | Acción · Progreso · Crecimiento |
| **Pregunta central** | ¿Cómo estoy? | ¿Quién quiero ser? |
| **Tagline** | "Rituales que te devuelven a ti" | "Hábitos que construyen tu mejor versión" |
| **Icono** | Vela | Espiral |
| **Familia cromática** | Morados / lavanda | Naranjas / terracota |

### 1.3 Tagline de Strivo (marca madre)

> *"Bienestar que integra y te impulsa."*

### 1.4 Los tres, en una frase cada uno

- **Lumia** — *"Momento de pausa. Respira. Escribe. Regresa a ti."*
- **Strivo** — *"Equilibrio inteligente. Integra tu bienestar. Avanza con claridad."*
- **Formia** — *"Impulso del día. Pequeñas acciones, grandes avances."*

---

## 2. Sistema de diseño compartido

Estos 6 principios aplican a **las tres marcas por igual**. Son el ADN visual común que hace que Lumia y Formia se sientan parte de la misma familia aunque tengan paletas opuestas.

| Principio | Significado práctico |
|---|---|
| **Tipografía elegante** | Clara, contemporánea, atemporal — nunca decorativa o de moda pasajera |
| **Formas circulares y orgánicas** | Equilibran estructura y fluidez — evitar ángulos duros donde no aporten |
| **Iconografía minimalista** | Significados universales y coherentes entre los tres productos |
| **Espacios amplios** | Jerarquía visual que respira — nunca layouts saturados |
| **Ilustraciones suaves** | Humanas, cálidas y sofisticadas — nunca corporativas o frías |
| **Precisión tecnológica** | Interfaz intuitiva, confiable y moderna — la calidez no compromete la usabilidad |

**Regla de oro:** si un componente nuevo no puede describirse con estos 6 adjetivos, no pertenece al sistema.

---

## 3. Logotipos e iconografía

### 3.1 Símbolos — archivos vectoriales confirmados ✅

Los tres símbolos ya cuentan con archivo `.svg` fuente, editable y limpio.

| Marca | Símbolo | Archivo | Color de trazo | Grosor |
|---|---|---|---|---|
| **Lumia** | Vela con llama | `lumia_simbolo.svg` | `#7563A7` | 4px |
| **Strivo** | "S" caligráfica en espiral | `strivo_simbolo.svg` | `#2B2730` | 4.2px |
| **Formia** | Espiral concéntrica | `formia_simbolo.svg` | `#D56732` | 4.2px |

**Especificaciones técnicas comunes a los tres:**
- `viewBox="0 0 122 130"` — los tres símbolos comparten el mismo lienzo, lo que garantiza que se vean proporcionalmente consistentes uno junto al otro (ej. en la composición "Eje Dual")
- `stroke-linecap="round"` y `stroke-linejoin="round"` — extremos y uniones redondeadas, coherente con el principio "formas circulares y orgánicas" (§2)
- `fill="none"` — los tres son símbolos de trazo (line art), no rellenos sólidos
- Tamaño base de exportación: 180×180px

**Descripción de construcción de cada uno:**
- **Lumia** — trazo simple de una sola línea: llama como forma orgánica cerrada en la punta, cuerpo de vela como dos líneas verticales con base curva, y dos marcas de "brillo" con opacidad reducida (0.55) como detalle de luz
- **Strivo** — trazo continuo en forma de "S", con dos puntos de anclaje sólidos (círculos rellenos, r=4.4) en los extremos superior derecho e inferior izquierdo — son parte de la identidad, no decoración incidental
- **Formia** — espiral construida con un solo trazo continuo que converge hacia el centro; es geométrica (curvas calculadas), no un caracol literal ni un ícono figurativo

### 3.2 Color de símbolo vs. color de marca

El color de trazo de cada símbolo (tabla de arriba) **no coincide exactamente** con los tokens de paleta de §4. Por ejemplo, Lumia usa `#7563A7` en el símbolo, mientras que la paleta UI tiene `#6C5AA7` (`lumia-pm-500`) como color primario — son tonos hermanos, no idénticos.

Esto es normal: el símbolo tiene su propio tono "de firma", ligeramente distinto al de la interfaz. **Regla de uso:** el color del símbolo (`#7563A7`, `#2B2730`, `#D56732`) se usa únicamente para el símbolo mismo (logo, ícono de app, favicon); los tokens de §4 se usan para todo lo demás (botones, superficies, fondos). No forzar a que sean el mismo valor.

### 3.2 Wordmarks

- **LUMIA** — mayúsculas, tracking amplio, peso regular-medium
- **STRIVO** — mayúsculas, tracking amplio, peso regular-medium
- **FORMIA** — mayúsculas, tracking amplio, peso regular-medium

Los tres wordmarks comparten la misma tipografía y tratamiento — solo cambia el color según la marca.

### 3.3 Iconos de app (App Store / Play Store)

| Marca | Fondo | Símbolo |
|---|---|---|
| Lumia | `#8D82B6` (lavanda medio) | Vela en blanco, centrada |
| Strivo | `#2B2730` (casi negro) | "S" en blanco, centrada |
| Formia | `#B45A2B` (terracota) | Espiral en blanco, centrada |

Esquinas redondeadas siguiendo el estándar del sistema operativo (iOS: squircle; Android: círculo o squircle según versión).

### 3.4 Espacio de seguridad y usos mínimos

**[PENDIENTE DE DEFINIR]** — Cuando tengas los archivos vectoriales, añade aquí:
- Espacio mínimo alrededor del logo (en múltiplos de un elemento del propio logo)
- Tamaño mínimo de reproducción (px para digital, mm para impreso)
- Versión monocromática (para fondos que no permiten color)
- Qué NO hacer (estirar, rotar, cambiar proporción, añadir efectos)

---

## 4. Sistema de color

### 4.1 Filosofía de color

Cada marca tiene **dos variantes tonales** — Mañana/Noche para Lumia y Formia — que reflejan el ritmo circadiano de sus rituales. Strivo, como conector, usa una paleta neutra constante que no cambia con el momento del día.

### 4.2 Strivo — Neutros conectores

Uso: UI compartida, navegación entre productos, elementos de "puente" (insights, notificaciones cruzadas).

| Token | Hex | Uso sugerido |
|---|---|---|
| `strivo-50` | `#F6F4F1` | Fondo base, superficies claras |
| `strivo-100` | `#E9E7E3` | Superficies secundarias, bordes suaves |
| `strivo-300` | `#D4D1CD` | Bordes, divisores |
| `strivo-600` | `#6E6A73` | Texto secundario |
| `strivo-900` | `#2B2730` | Texto principal, fondo del ícono Strivo |

### 4.3 Lumia — Mañana (claridad suave)

Uso: escritura y reflexión matutina, tono más ligero y despejado.

| Token | Hex | Uso sugerido |
|---|---|---|
| `lumia-am-100` | `#DCCFF1` | Superficie primaria, tarjetas |
| `lumia-am-200` | `#E5C2DC` | Acento secundario — tono intermedio orquídea/rosa entre `am-100` y `am-300` |
| `lumia-am-300` | `#F6DDE8` | Superficie suave, fondos de tarjeta |
| `lumia-am-50` | `#F6F2E9` | Fondo base más claro |

Los cuatro tokens de esta paleta están confirmados contra el archivo fuente.

### 4.4 Lumia — Noche (introspección profunda)

Uso: ritual de cierre, journal nocturno, tono más denso e íntimo.

| Token | Hex | Uso sugerido |
|---|---|---|
| `lumia-pm-500` | `#6C5AA7` | Color primario de marca, CTAs |
| `lumia-pm-400` | `#8D82B6` | Acento, fondo de ícono de app |
| `lumia-pm-700` | `#5A5568` | Superficie oscura, texto sobre claro |
| `lumia-pm-50` | `#F3EFEA` | Texto claro sobre fondo oscuro / fondo alternativo |

### 4.5 Formia — Mañana (energía cálida)

Uso: plan del día, identidad, arranque del ritual matutino.

| Token | Hex | Uso sugerido |
|---|---|---|
| `formia-am-400` | `#FFC29C` | Acento cálido, highlights |
| `formia-am-500` | `#E9A387` | Color primario de marca en modo mañana |
| `formia-am-200` | `#E8D9C4` | Superficie suave |
| `formia-am-50` | `#F7F2E9` | Fondo base |

### 4.6 Formia — Noche (avance con propósito)

Uso: revisión de progreso, cierre con sentido de logro.

| Token | Hex | Uso sugerido |
|---|---|---|
| `formia-pm-600` | `#B45A2B` | Color primario, fondo de ícono de app |
| `formia-pm-700` | `#8F4A2F` | Acento oscuro |
| `formia-pm-800` | `#5D4766` | Superficie de transición — punto de convergencia intencional con la paleta Lumia (ver §4.7) |
| `formia-pm-900` | `#1F1D22` | Texto/fondo más oscuro |

### 4.7 Nota de coherencia entre paletas — confirmado ✅

`#5D4766` aparece en Formia · Noche pero es visualmente un tono morado/violeta — muy cercano a la familia de Lumia. **Confirmado como intencional**: en el momento de cierre nocturno, ambas marcas convergen tonalmente. Es el punto donde "hacia dentro" (Lumia) y "hacia delante" (Formia) se encuentran visualmente al final del día — coherente con la filosofía del Eje Dual ("dos fuerzas, un mismo propósito").

**Implicación para implementación:** este token no debe "corregirse" para alejarlo del morado en futuras iteraciones de diseño — es una decisión de marca, no un accidente de paleta. Si en Fase 1 se ajusta la paleta de Formia·Noche, mantener este punto de encuentro cromático con Lumia·Noche como restricción de diseño.

### 4.8 Mapeo a `design-tokens.json`

```json
{
  "color": {
    "strivo": {
      "50": "#F6F4F1",
      "100": "#E9E7E3",
      "300": "#D4D1CD",
      "600": "#6E6A73",
      "900": "#2B2730"
    },
    "lumia": {
      "am": {
        "50": "#F6F2E9",
        "100": "#DCCFF1",
        "200": "#E5C2DC",
        "300": "#F6DDE8"
      },
      "pm": {
        "50": "#F3EFEA",
        "400": "#8D82B6",
        "500": "#6C5AA7",
        "700": "#5A5568"
      }
    },
    "formia": {
      "am": {
        "50": "#F7F2E9",
        "200": "#E8D9C4",
        "400": "#FFC29C",
        "500": "#E9A387"
      },
      "pm": {
        "600": "#B45A2B",
        "700": "#8F4A2F",
        "800": "#5D4766",
        "900": "#1F1D22"
      }
    }
  }
}
```

**Nota técnica para Claude Code:** estos tokens conviven con — no reemplazan — los tokens de contraste semántico ya construidos en el Bloque 01 de Fase 0 (`--color-text-on-light`, `--color-text-on-dark`, mecanismo `data-surface`). La paleta de marca define **qué color de superficie usar en cada contexto**; el sistema de contraste sigue decidiendo **qué color de texto poner encima** para garantizar legibilidad.

### 4.9 Verificación de contraste pendiente

Antes de implementar, verificar con una herramienta de contraste (ej. WebAIM) que:
- Texto sobre `lumia-pm-500` (#6C5AA7) cumple ≥4.5:1 en blanco
- Texto sobre `formia-pm-600` (#B45A2B) cumple ≥4.5:1 en blanco
- Texto oscuro sobre `lumia-am-100`/`formia-am-400` cumple ≥4.5:1

---

## 5. Tipografía

### 5.1 Familia tipográfica — confirmada ✅

**Inter**, para las tres marcas por igual (Strivo, Lumia, Formia comparten la misma familia — coherente con el principio de "tipografía elegante" común del sistema de diseño, §2).

**Por qué encaja:** neutra pero cálida, diseñada específicamente para interfaces digitales, variable font (permite pesos intermedios sin cargar archivos adicionales), open source y con excelente rendering en todos los navegadores y sistemas operativos — sin fricción de licenciamiento en ningún punto de escala del producto.

**Instalación (vía npm, recomendado sobre CDN para evitar dependencia de red):**
```bash
npm install @fontsource-variable/inter
```
```js
import '@fontsource-variable/inter';
```

### 5.2 Diferenciación por marca dentro de la misma familia

Aunque las tres comparten Inter, se diferencian por **peso y tratamiento**, no por familia distinta:

| Marca | Peso predominante | Tracking | Sensación |
|---|---|---|---|
| **Lumia** | Regular (400) / Medium (500) en énfasis | Normal | Suave, íntimo, sin urgencia |
| **Strivo** | Medium (500) / Semibold (600) en títulos | Amplio en wordmark | Neutro, confiable, estructurado |
| **Formia** | Semibold (600) / Bold (700) en CTAs y números | Normal, algo más compacto | Enérgico, directo, orientado a la acción |

### 5.3 Escala tipográfica

```css
--font-family-base: 'Inter Variable', -apple-system, sans-serif;

--font-size-display: 32px; /* peso 600 */
--font-size-h1: 24px;      /* peso 600 */
--font-size-h2: 20px;      /* peso 600 */
--font-size-body: 16px;    /* peso 400 */
--font-size-caption: 14px; /* peso 400 */
--font-size-micro: 12px;   /* peso 500 */
```

**Nota de implementación:** estos tamaños son el punto de partida de Fase 0/1. Ajustar `font-weight` por marca según la tabla de §5.2 vía una clase o prop de contexto (`data-brand="lumia|strivo|formia"`), no duplicando la escala completa tres veces.

---

## 6. Iconografía y lenguaje de forma

### 6.1 Principio rector

*"Formas circulares y orgánicas — equilibran estructura y fluidez."*

- Preferir esquinas redondeadas sobre ángulos rectos en tarjetas, botones y contenedores
- Los íconos internos de la UI (no los símbolos de marca) deben ser de trazo fino, minimalistas, de una sola línea cuando sea posible
- Evitar iconografía "de stock" genérica — cada ícono debe sentirse dibujado a mano con intención

### 6.2 Patrones decorativos del sistema

La síntesis muestra 3 patrones decorativos, uno por "momento":

| Patrón | Visual | Frase asociada | Uso sugerido |
|---|---|---|---|
| **Ondas moradas** | Líneas curvas horizontales con puntos dispersos | *"Dos direcciones, un mismo centro"* | Fondos de pantallas Lumia, transiciones de apertura |
| **Puntos oscuros** | Constelación de puntos sobre fondo oscuro | *"Vive en equilibrio. Crece con propósito."* | Fondos Strivo, pantallas de resumen/inteligencia |
| **Rayos espiral naranja** | Líneas radiales desde un punto, estilo sol/espiral | *"Pausa con intención. Avanza con sentido."* | Fondos Formia, pantallas de progreso |

Estos patrones son **decorativos de fondo**, nunca deben competir con el contenido textual — usar opacidad baja (10-20%) cuando estén detrás de texto.

---

## 7. Aplicación en producto — mapeo de pantallas

Basado en los 5 mockups mostrados en la síntesis:

| Pantalla | Marca | Momento | Función |
|---|---|---|---|
| **Escritura / reflexión AM** | Lumia | Mañana | Journal matutino — "Escribir para ordenar mi mente" |
| **Cierre / introspección PM** | Lumia | Noche | Journal nocturno — "¿Qué aprendí hoy sobre mí?" |
| **Resumen / inteligencia** | Strivo | — | Vista de equilibrio, recomendaciones cruzadas |
| **Plan del día / identidad** | Formia | Mañana | Enfoque diario, hábitos clave del día |
| **Revisión / progreso** | Formia | Noche | Progreso semanal (ej: "82% de avance semanal") |

### 7.1 Correspondencia con Fase 0 (bloques ya implementados)

| Pantalla en síntesis | Componente equivalente en Fase 0 |
|---|---|
| Lumia · Escritura AM | Diario vista Mañana |
| Lumia · Cierre PM | Journal + Ritual de Noche (bloques 06 y 07) |
| Strivo · Resumen | **Nuevo** — no existe aún, es la capa de inteligencia futura |
| Formia · Plan del día | Ritual de Mañana + Hábitos (bloque 04) |
| Formia · Revisión | Diario vista Noche + Historial |

### 7.2 Notificaciones — tono de voz por marca

Ejemplos mostrados en la síntesis, útiles como referencia de voz:

- **Lumia (recordatorio):** *"Tu momento es sagrado. Dedícalo a ti."*
- **Formia (notificación):** *"Un hábito hoy, tu mejor versión mañana."*
- **Strivo (recomendación):** *"Tu enfoque está fuerte. Sigue así, un paso más te acerca."*

Estas tres líneas son un excelente ancla de voz: Lumia habla en modo invitación suave; Formia en modo impulso breve; Strivo en modo observación + ánimo.

---

## 8. Componentes — reglas de aplicación

### 8.1 Tarjetas de marca (brand cards)

Según los mockups, cada marca tiene una tarjeta de presentación con:
- Ícono de la marca (esquina o centrado arriba)
- Título corto (nombre de la función, ej. "Momento de pausa")
- Cuerpo breve (1 línea, tono imperativo suave)

### 8.2 Botones primarios

- **Lumia:** fondo en `lumia-pm-500` (#6C5AA7), texto blanco
- **Formia:** fondo en `formia-pm-600` (#B45A2B) o `formia-am-500` (#E9A387) según momento del día, texto blanco u oscuro (verificar contraste)
- **Strivo:** fondo en `strivo-900` (#2B2730), texto blanco

### 8.3 Navegación inferior (tab bar)

Los mockups muestran 4 tabs consistentes: **Hoy · Explorar/Plan · Diario/Hábitos · Perfil** (el nombrado exacto varía ligeramente entre Lumia y Formia en las capturas — confirmar naming definitivo).

---

## 9. Lo que falta para producción — checklist

- [x] ~~Archivos vectoriales originales de los 3 símbolos~~ — ✅ recibidos (`lumia_simbolo.svg`, `strivo_simbolo.svg`, `formia_simbolo.svg`)
- [x] ~~Nombre de la tipografía~~ — ✅ Inter, confirmada
- [x] ~~Confirmar `#5D4766` en Formia·Noche~~ — ✅ confirmado como convergencia intencional
- [x] ~~Verificar `lumia-am-200`~~ — ✅ confirmado: `#E5C2DC`
- [ ] **Espacio de seguridad y tamaños mínimos** de cada logo — no definido aún, agregar cuando el diseñador lo especifique
- [ ] **Versión monocromática** de cada símbolo (para casos de un solo color, ej. sobre fondos de marca) — se puede derivar de los SVG actuales cambiando el `stroke` a un solo valor, pero conviene que el diseñador la apruebe
- [ ] **Naming definitivo** de los tabs de navegación inferior
- [ ] **Verificación de contraste** de cada combinación texto/fondo (§4.9) — todos los tokens de color ya están fijos; falta correr la verificación en herramienta (ej. WebAIM)
- [ ] **Set de iconos internos de UI** (no los símbolos de marca — los íconos funcionales de la interfaz: check, flecha, más, etc.)

---

## 10. Assets disponibles en este momento

| Archivo | Contenido | Ubicación sugerida en el repo |
|---|---|---|
| `lumia_simbolo.svg` | Símbolo vectorial Lumia | `src/assets/brand/lumia_simbolo.svg` |
| `strivo_simbolo.svg` | Símbolo vectorial Strivo | `src/assets/brand/strivo_simbolo.svg` |
| `formia_simbolo.svg` | Símbolo vectorial Formia | `src/assets/brand/formia_simbolo.svg` |
| `BRAND_MANUAL_STRIVO_LUMIA_FORMIA.md` | Este documento | raíz del repo, junto a `BLUEPRINT_LUMIA_FORMIA.md` |

---

## 11. Próximos pasos sugeridos

1. Confirmar el único punto abierto real: el hex exacto de `lumia-am-200` (todo lo demás en este manual ya está cerrado).
2. Colocar los 3 archivos `.svg` en `src/assets/brand/` dentro del repo.
3. Este manual se referencia (no se duplica) desde `BLUEPRINT_LUMIA_FORMIA.md` en la sección de identidad visual.
4. Se traduce a `design-tokens.json` como parte del Spec 02 (`02_ACTUALIZACION_DESIGN_TOKENS.md`) del roadmap de implementación — incluyendo ahora los símbolos SVG como componentes React (`<LumiaSymbol />`, `<StrivoSymbol />`, `<FormiaSymbol />`).
