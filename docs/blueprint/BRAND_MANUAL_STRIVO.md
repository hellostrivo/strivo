# Manual de Marca — Strivo

> **Versión 2.0 — 25 de agosto de 2026.** Una marca, dos paletas, un símbolo.
> Documento hermano del *Blueprint de Producto v5.0*, que lo referencia y no lo duplica:
> **el manual manda en todo lo cromático, tipográfico y simbólico** (blueprint §10.1).
> Pendientes: espaciado de logo, aprobación de la versión monocromática, íconos de UI (§9).

---

## 0. Qué cambia en la versión 2.0

La versión 1.1 describía un sistema de tres marcas: una marca madre y dos productos con paletas
opuestas. El 24 de agosto de 2026 se decidió lanzar **una sola aplicación**, y este manual se reedita
para describir lo que existe y nada más.

| Antes (v1.1) | Ahora (v2.0) |
|---|---|
| Tres marcas: una madre y dos productos | **Una marca: Strivo** |
| Cuatro paletas de momento (dos productos × dos momentos) | **Dos paletas: Strivo · Mañana y Strivo · Noche** |
| Tres símbolos | **Un símbolo: la «S» de Strivo** |
| Tokens con el prefijo de cada producto | **`strivo-am-*` y `strivo-pm-*`** |
| Diferenciación tipográfica por marca | Una sola familia y una sola escala de pesos |

**Los ocho hexes de las dos paletas que sobreviven no se han tocado.** El repliegue de alcance retira
un producto; no recalibra el color del que se queda. Lo único que cambió es el nombre del token, y el
motivo está en §4.3.

Lo retirado no se ha perdido: vive en la rama de resguardo del repositorio, congelada. Este manual no
lo nombra porque describe la marca vigente, no su historia.

---

## 1. Visión de marca

### 1.1 Qué es Strivo

**Strivo es un refugio digital: un lugar íntimo y breve donde volver a ti al empezar y al terminar el
día.** La pregunta central del producto —y de la marca— es **«¿Cómo estoy?»**.

> *«Momento de pausa. Respira. Escribe. Regresa a ti.»*

### 1.2 Lo que la marca no hace

Esta lista es normativa, no retórica: cada línea tiene consecuencias visuales.

- **No celebra.** Ninguna pieza gráfica premia, puntúa ni felicita.
- **No mide.** No hay gráficas de evolución, medallas, barras de avance ni insignias.
- **No apremia.** El nombre tiene raíz en una palabra de empuje y **la narrativa no se apoya en el
  esfuerzo**: Strivo no es lo que te exige, es donde descansas de la exigencia. Ninguna pieza explica
  el origen del nombre ni lo usa como llamada a la acción.
- **No diagnostica.** Ningún color, icono o forma califica un estado emocional como bueno o malo.

### 1.3 Territorio

| | **Strivo** |
|---|---|
| **Dirección** | Hacia dentro |
| **Territorio** | Pausa · Reflexión · Calma |
| **Pregunta central** | ¿Cómo estoy? |
| **Símbolo** | «S» caligráfica en espiral |
| **Familia cromática** | Morados y lavanda, sobre bases cálidas |

---

## 2. Sistema de diseño

Seis principios. Son el ADN visual del producto entero.

| Principio | Significado práctico |
|---|---|
| **Tipografía elegante** | Clara, contemporánea, atemporal — nunca decorativa o de moda pasajera |
| **Formas circulares y orgánicas** | Equilibran estructura y fluidez — evitar ángulos duros donde no aporten |
| **Iconografía minimalista** | Significados universales, coherentes entre sí |
| **Espacios amplios** | Jerarquía visual que respira — nunca layouts saturados |
| **Ilustraciones suaves** | Humanas, cálidas y sofisticadas — nunca corporativas o frías |
| **Precisión tecnológica** | Interfaz intuitiva, confiable y moderna — la calidez no compromete la usabilidad |

**Regla de oro:** si un componente nuevo no puede describirse con estos seis adjetivos, no pertenece
al sistema.

---

## 3. Logotipo e iconografía

### 3.1 El símbolo — archivo vectorial confirmado ✅

| Marca | Símbolo | Archivo | Color de trazo | Grosor |
|---|---|---|---|---|
| **Strivo** | «S» caligráfica en espiral | `strivo_simbolo.svg` | `#2B2730` | 4.2px |

**Especificaciones técnicas:**
- `viewBox="0 0 122 130"` — el lienzo del sistema. Se conserva aunque hoy el símbolo sea uno solo:
  es lo que garantiza que cualquier pieza futura salga proporcionalmente comparable.
- `stroke-linecap="round"` y `stroke-linejoin="round"` — extremos y uniones redondeadas, coherente
  con el principio «formas circulares y orgánicas» (§2).
- `fill="none"` — es un símbolo de trazo (*line art*), no una forma rellena.
- Tamaño base de exportación: 180×180 px.

**Construcción:** trazo continuo en forma de «S», con dos puntos de anclaje sólidos (círculos
rellenos, r=4.4) en los extremos superior derecho e inferior izquierdo — **son parte de la identidad,
no decoración incidental**.

### 3.2 Color de símbolo vs. color de marca

El color de trazo del símbolo (`#2B2730`) **no coincide** con el primario de la paleta
(`#6C5AA7`, `strivo-pm-500`). Es intencional: el símbolo tiene su propio tono «de firma».

**Regla de uso:** `#2B2730` se usa únicamente para el símbolo mismo (logo, ícono de app, favicon);
los tokens de §4 se usan para todo lo demás (botones, superficies, fondos). No forzar a que coincidan.

### 3.3 Versión monocromática — en uso, pendiente de aprobación

El símbolo se pinta **en blanco monocromo** cuando va sobre el contratono oscuro de la mañana
(`#1D1833`), donde su tono de firma daría 1,17:1 —invisible— frente a 17,06:1 en blanco. Sobre la
cabecera clara de la noche va tal cual (9,92:1) y no hace falta.

Hoy está **derivada con un filtro en el CSS y no como archivo nuevo**, para que aprobarla —o
sustituirla por la del diseñador— sea borrar tres líneas. **Pendiente de aprobación** (§9).

### 3.4 Wordmark

**STRIVO** — mayúsculas, tracking amplio, peso regular-medium.

### 3.5 Ícono de app (App Store / Play Store)

| Fondo | Símbolo |
|---|---|
| `#2B2730` (casi negro) | «S» en blanco, centrada |

Esquinas redondeadas siguiendo el estándar del sistema operativo (iOS: *squircle*; Android: círculo o
*squircle* según versión).

### 3.6 Espacio de seguridad y usos mínimos

**[PENDIENTE DE DEFINIR]** — añadir cuando el diseñador lo especifique:
- Espacio mínimo alrededor del logo (en múltiplos de un elemento del propio logo).
- Tamaño mínimo de reproducción (px para digital, mm para impreso).
- Qué NO hacer (estirar, rotar, cambiar proporción, añadir efectos).

---

## 4. Sistema de color

### 4.1 Filosofía de color

La marca tiene **dos variantes tonales, Mañana y Noche**, que reflejan el ritmo circadiano de los dos
momentos del producto. Además, una **escala neutra constante** que no cambia con la hora y viste el
cromo donde no hay momento.

**Ningún valor cromático se escribe a mano en un componente.** Todos viven en el archivo de tokens y
se aplican por variables (blueprint §10.1, RN-VIS-02).

### 4.2 Strivo — Neutros

Uso: cromo por defecto, superficies neutras, y las cuatro fases de Respiración.

| Token | Hex | Uso sugerido |
|---|---|---|
| `strivo-50` | `#F6F4F1` | Fondo base, superficies claras |
| `strivo-100` | `#E9E7E3` | Superficies secundarias, bordes suaves |
| `strivo-300` | `#D4D1CD` | Bordes, divisores |
| `strivo-600` | `#6E6A73` | Texto secundario |
| `strivo-700` | `#58545D` | Indicador gráfico |
| `strivo-800` | `#423E47` | Indicador gráfico |
| `strivo-900` | `#2B2730` | Texto principal, fondo del ícono de app |

**Sobre `strivo-700` y `strivo-800`.** La escala de cinco pasos no alcanzaba para la herramienta de
Respiración: sobre `strivo-50`, solo `strivo-600` (4,82:1) y `strivo-900` (13,32:1) superan el 3:1
que WCAG 2.2 (1.4.11) exige a un elemento gráfico, y esa pantalla necesita cuatro fases
distinguibles. Los dos pasos están **interpolados sobre el eje neutro que ya existía** entre 600 y
900, así que no introducen tono: la escala neutra sigue siendo acromática y §4.1 se mantiene intacta.

Consecuencia asumida: entre pasos contiguos hay 1,4:1, que no basta para nombrar una fase por su
color. Por eso Respiración nombra siempre la fase con texto y con geometría, y el color solo acompaña.

> **Nota de aplicación.** Hoy Respiración vive dentro del producto y pinta sus cuatro fases con la
> paleta de momento (§4.5), no con estos neutros. La escala se conserva como **valor por defecto del
> cromo** y como punto de partida documentado.

### 4.3 Strivo — Mañana (claridad suave)

Uso: la sección Mañana de Hoy, tono más ligero y despejado.

| Token | Hex | Uso sugerido |
|---|---|---|
| `strivo-am-50` | `#F6F2E9` | Fondo base más claro |
| `strivo-am-100` | `#DCCFF1` | Superficie primaria, tarjetas |
| `strivo-am-200` | `#E5C2DC` | Acento secundario — tono intermedio orquídea/rosa entre `am-100` y `am-300` |
| `strivo-am-300` | `#F6DDE8` | Superficie suave, fondos de tarjeta |

**Renombrados el 25 de agosto de 2026.** Los cuatro hexes están confirmados contra el archivo fuente
y **no se han modificado**: lo único que cambió es el prefijo del token, que nombraba a un producto
que ya no existe.

### 4.4 Strivo — Noche (introspección profunda)

Uso: la sección Noche de Hoy, tono más denso e íntimo.

| Token | Hex | Uso sugerido |
|---|---|---|
| `strivo-pm-50` | `#F3EFEA` | Texto claro sobre fondo oscuro / fondo alternativo |
| `strivo-pm-400` | `#8D82B6` | Acento, fondo de ícono de app |
| `strivo-pm-500` | `#6C5AA7` | **Color primario de marca**, CTAs |
| `strivo-pm-700` | `#5A5568` | Superficie oscura, texto sobre claro |

### 4.5 Paleta compartida — tokens semánticos

Estos valores no pertenecen a un momento: son el suelo común de toda la app y viven en la hoja de
estilos global. Se documentan aquí porque son valores de marca y ningún hex se escribe a mano.

| Token | Hex | Uso |
|---|---|---|
| `ink` | `#241E33` | Texto principal sobre claro |
| `paper` | `#FBF8F4` | Fondo claro |
| `night` | `#191428` | Fondo oscuro — **índigo violáceo, nunca negro puro** |
| `amber` | `#E5A25C` | Acento |
| `plum` | `#8B6BA8` | Acento |
| `sage` | `#7E9E86` | Acento |
| `clay` | `#C9836B` | Acento |
| `mist` | `#93A9C4` | Acento |

**El negro puro no se usa** (blueprint RN-VIS-03). El fondo oscuro del producto es un índigo
violáceo, y esa es una decisión de marca: el negro es frío y este producto no lo es.

**Contraste de texto.** El color del texto lo decide **la superficie, no el componente**
(RN-VIS-02): cada contenedor declara si es clara u oscura y el texto hereda de los tokens de
contraste. Este manual define **qué superficie usar**; el sistema de contraste decide **qué texto va
encima**.

### 4.6 Mapeo a `design-tokens.json`

La paleta de momento vive hoy en la hoja `src/styles/tokens-strivo.css`, que es su fuente única en
código; los neutros y el símbolo viven en `design-tokens.json`. Los valores son estos:

```json
{
  "brand": {
    "strivo": {
      "50": "#F6F4F1",
      "100": "#E9E7E3",
      "300": "#D4D1CD",
      "600": "#6E6A73",
      "700": "#58545D",
      "800": "#423E47",
      "900": "#2B2730"
    },
    "simbolos": {
      "strivo": "#2B2730",
      "viewBox": "0 0 122 130"
    }
  },
  "momento": {
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
  }
}
```

**Nota técnica.** El momento se aplica con el atributo `data-moment` sobre la raíz del documento, y
el color de texto con `data-surface`. **Son dos capas y no se pisan.**

### 4.7 Verificación de contraste — automatizada ✅

Ya no es un pendiente manual: `npm run lint:contraste` mide **todas** las combinaciones reales de la
app —texto sobre cada superficie de los dos momentos, indicadores gráficos y los dos estados del
símbolo— contra los umbrales de WCAG, y forma parte de los seis comandos que deben pasar antes de
integrar nada.

Hallazgos permanentes, anotados como informativos y no como fallos:

- **Los primarios de marca no llevan texto de cuerpo encima.** Blanco sobre `strivo-pm-500` da
  5,74:1: pasa AA y no AAA. Se usan como acento y como borde, donde el umbral es 3:1.
- **El círculo de la respiración no se mide contra el 3:1 de WCAG 1.4.11:** la fase la dice el texto,
  el círculo es el ritmo y no el dato.

---

## 5. Tipografía

### 5.1 Familia tipográfica — confirmada ✅

**Inter**, una sola familia para todo el producto.

**Por qué encaja:** neutra pero cálida, diseñada específicamente para interfaces digitales, fuente
variable (permite pesos intermedios sin cargar archivos adicionales), open source y con excelente
*rendering* en todos los navegadores — sin fricción de licenciamiento en ningún punto de escala.

**Instalación vía npm, no CDN** — sin dependencia de red y sin mandar la IP de nadie a un tercero al
abrir la app:

```bash
npm install @fontsource-variable/inter
```
```js
import '@fontsource-variable/inter'
import '@fontsource-variable/inter/wght-italic.css'
```

**La hoja itálica es obligatoria y no es un extra.** El corte variable solo trae verticales: sin
ella, `font-style: italic` lo resuelve el navegador inclinando la vertical por software —falsa
cursiva, con las curvas deformadas—, que es justo lo que esta elección evita.

### 5.2 Jerarquía por peso

La jerarquía se construye con **peso y tamaño, nunca con familias distintas**.

| Uso | Peso |
|---|---|
| Cuerpo y lectura larga | Regular (400) |
| Énfasis y rótulos | Medium (500) |
| Títulos y cabeceras | Semibold (600) |

La cursiva está reservada a la **frase del día**. Usarla en dos sitios de la misma pantalla la
dejaría sin significar nada.

### 5.3 Escala tipográfica

**La escala se expresa en unidades relativas (`rem`)** para que respete el tamaño de fuente del
sistema y escale hasta el 200 % sin pérdida de contenido (blueprint RN-A11Y-03). La raíz **no fija**
un `font-size` que pise esa preferencia.

Los objetivos táctiles, en cambio, siguen en px: son el tamaño de un dedo, no el de una letra.
Mínimo 44 × 44 px.

---

## 6. Iconografía y lenguaje de forma

### 6.1 Principio rector

*«Formas circulares y orgánicas — equilibran estructura y fluidez.»*

- Preferir esquinas redondeadas sobre ángulos rectos en tarjetas, botones y contenedores. Radios
  entre 10 y 32 px.
- **Sin sombras proyectadas.** La profundidad se expresa con elevación sutil de superficie.
- Los íconos internos de la UI deben ser de trazo fino, minimalistas, de una sola línea cuando sea
  posible.
- Evitar iconografía «de stock» genérica — cada ícono debe sentirse dibujado a mano con intención.
- **Ningún icono va solo:** todo icono lleva etiqueta visible o accesible.

### 6.2 Iconografía emocional — encargada, pendiente

Los catálogos emocionales usan hoy emojis del sistema. **Es la única pieza visual del producto que no
es de la marca**, y está encargado un juego propio:

- Formas orgánicas abstractas, **nunca caras**.
- Coherentes con el trazo del símbolo: retícula de 24 px, trazo 1,75.
- En línea cuando están en reposo y rellenas de color al seleccionarse — lo que exige que sean
  **formas cerradas** reutilizables en ambos estados.
- Curvas fluidas y cerradas para emociones de baja energía; formas que irradian para las de alta
  energía.

**Son material de marca, no de código: se piden, no se improvisan.**

### 6.3 Patrones decorativos

| Patrón | Visual | Uso sugerido |
|---|---|---|
| **Ondas** | Líneas curvas horizontales con puntos dispersos | Fondos, transiciones de apertura |
| **Constelación** | Puntos dispersos sobre fondo oscuro | Fondos de superficies nocturnas |

Son **decorativos de fondo** y nunca deben competir con el contenido textual: opacidad baja (10-20 %)
cuando estén detrás de texto. Como toda animación del sistema, respetan la preferencia de movimiento
reducido.

---

## 7. Aplicación en producto

| Pantalla | Momento | Vestimenta |
|---|---|---|
| **Hoy · Mañana** | Mañana | Degradado claro, texto oscuro, acento malva |
| **Hoy · Noche** | Noche | Degradado índigo, texto claro, acento violáceo |
| **Journal** | — | Superficie clara, cromo neutro |
| **Respiración** | Según la hora | Paleta de momento; las cuatro fases por luminancia |
| **Historial** | — | Superficie clara, cromo neutro |

**El fondo de Hoy es siempre un degradado, nunca un color plano** (RN-VIS-01). Cambiar de momento
recolorea fondo, cabecera y tarjetas **a la vez**, en un cruce de 320 ms: nada salta a destiempo.

### 7.1 Movimiento

- Duraciones **más lentas de lo habitual**: mínimo 120 ms, máximo 900 ms para el cierre nocturno.
- Curva suave, sin rebotes ni elasticidad.
- Vibración háptica ligera en confirmaciones. **Nunca en errores.**

### 7.2 Tono de voz de marca

Cálido, cercano, breve. Tuteo. Sin condescendencia y sin entusiasmo impostado. Strivo habla como
alguien que te conoce lo justo y te tiene aprecio: no te anima a gritos, no te da lecciones y no
finge que todo está bien.

**Nunca:** signos de exclamación, felicitaciones, cifras sobre el comportamiento de la persona,
lenguaje de coach. El léxico prohibido completo está en el blueprint §3.3 y se verifica
automáticamente.

---

## 8. Componentes — reglas de aplicación

### 8.1 Botones primarios

- Fondo en `strivo-pm-500` (`#6C5AA7`), texto blanco.
- Sobre superficies que cambian de tema se usa la variante de superficie: el primario sobre el fondo
  nocturno es tinta sobre tinta, y un rectángulo blanco a las once de la noche tampoco sirve.

### 8.2 Navegación

Cuatro secciones —**Hoy · Journal · Respiración · Historial**— en la cabecera, bajo el símbolo.

**La sección activa se distingue por peso tipográfico y borde, no solo por color** (RN-A11Y-02).

### 8.3 Superficies

Cada contenedor declara su papel, no su color. La tarjeta que sostiene el contenido de un recorrido
queda en un tono **distinto del fondo** en ambos momentos, para distinguirse **por luminancia y no
solo por borde**.

---

## 9. Lo que falta para producción — checklist

- [x] ~~Archivo vectorial original del símbolo~~ — ✅ `strivo_simbolo.svg`
- [x] ~~Nombre de la tipografía~~ — ✅ Inter, confirmada
- [x] ~~Verificar el secundario de la mañana~~ — ✅ confirmado: `#E5C2DC`
- [x] ~~Verificación de contraste de cada combinación~~ — ✅ automatizada en `npm run lint:contraste`
- [x] ~~Naming definitivo de la navegación~~ — ✅ Hoy · Journal · Respiración · Historial
- [ ] **Espacio de seguridad y tamaños mínimos** del logo — no definido aún
- [ ] **Aprobación de la versión monocromática** del símbolo — hoy derivada con un filtro CSS y **en
      uso**; conviene que el diseñador la apruebe o la sustituya por un archivo propio (§3.3)
- [ ] **Set de iconos emocionales propios** (16) — encargado, especificado en §6.2
- [ ] **Set de iconos internos de UI** (check, flecha, más, etc.)

---

## 10. Assets

| Archivo | Contenido | Ubicación en el repo |
|---|---|---|
| `strivo_simbolo.svg` | Símbolo vectorial | `src/assets/marca/` |
| `BRAND_MANUAL_STRIVO.md` | Este documento | `docs/blueprint/` |

---

*Fin del documento.*
