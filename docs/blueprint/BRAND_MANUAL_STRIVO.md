# Manual de Marca — Strivo

> **Versión 2.1 — 1 de septiembre de 2026.** Una marca, dos paletas, un símbolo.
> Recalibración cromática de las dos paletas de momento (§0.1, §4.3, §4.4).
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

## 0.1 Qué cambia en la versión 2.1

La v2.0 dejó escrito que «los ocho hexes de las dos paletas que sobreviven no se han tocado». **Eso
deja de ser cierto aquí: los ocho se recalibran.** La revisión del 1 de septiembre de 2026 recogió
dos observaciones que apuntaban al mismo sitio:

- La paleta se percibía **genérica, sin personalidad** — el morado y el lavanda pastel son el lugar
  común de la categoría de bienestar, y ocuparlo no distingue a Strivo de nada.
- Los **rosas y pasteles de la mañana** se leían como una estética estereotipadamente femenina, que
  no es el público ni el tono de un producto que quiere ser universal.

**La decisión: sustituir la familia cromática entera de los dos momentos por una extraída de la luz
de un atardecer.** No es un retoque de tono; es cambiar el eje. Lo que antes giraba sobre morado y
lavanda ahora gira sobre ámbar, arena, terracota y ciruela apagada.

| | Antes (v2.0) | Ahora (v2.1) |
|---|---|---|
| Eje cromático | Morados y lavanda pastel | Luz de atardecer: ámbar → terracota → ciruela |
| Mañana | Lavanda y rosa orquídea sobre crema | Ámbar, arena y durazno quemado |
| Noche | Morado saturado y violeta | Ciruela apagada y azul violáceo ceniza |
| Origen de los valores | Archivo fuente del diseñador | Muestreo de una fotografía de referencia (§4.3.1) |

**Lo que NO cambia, y es deliberado:** la estructura de tokens (los mismos ocho nombres), la escala
neutra de §4.2, los tokens semánticos de §4.5, la jerarquía de superficies, la tipografía, el
símbolo y el comportamiento de las pantallas. El repliegue de v2.0 retiró un producto; esta versión
recolorea el que quedó **sin mover una sola pieza de sitio**.

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
| **Familia cromática** | Luz de atardecer: ámbar, terracota y ciruela apagada |

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

### 3.1 El logo oficial — archivo vectorial confirmado ✅

**Revisión del 25 de agosto de 2026.** El diseñador entrega `Strivo_Logo_Oficial.svg` y con él se
retira `strivo_simbolo.svg`, que era la «S» sola. **Lo que llega no es una versión nueva del mismo
dibujo: es otra pieza.** Es un **lockup vertical** —símbolo arriba, palabra debajo— y trae los dos en
el mismo trazado, así que no se pueden usar por separado. Este bloque se reescribe entero porque tres
cosas que estaban aquí escritas como si fueran del sistema eran en realidad de aquel archivo: el
lienzo, el trazo y el tono.

| Marca | Logo | Archivo | Concepto | Color |
|---|---|---|---|---|
| **Strivo** | Lockup vertical: «S» orgánica + wordmark | `Strivo_Logo_Oficial.svg` | Umbral interior | `#2B282F` |

**Especificaciones técnicas:**
- `viewBox="0 0 1016 920"` — el lienzo del logo oficial. **Deroga el `0 0 122 130`** del símbolo
  anterior: la proporción es ancha, no alta, y el ancho de reproducción sale del alto por 1016:920.
- **Es de relleno, no de trazo.** Dos `path` con `fill` y sin un solo `stroke`, así que
  `stroke-linecap`, `stroke-linejoin` y `fill="none"` **ya no describen nada** y se retiran también
  de `design-tokens.json`. Lo que decía §2 —«formas circulares y orgánicas»— lo sostiene ahora la
  forma del contorno, no los extremos del trazo.
- Dos colores: `#2B282F` (carbón) para el símbolo y la palabra, `#776F79` (gris malva) para los dos
  puntos terminales.
- Fondo transparente. Tamaño nativo del archivo: 1016×920 px.

**Construcción:** «S» orgánica en espiral (`y` 47–640 del lienzo) con dos puntos terminales sólidos
—**son parte de la identidad, no decoración incidental**— y el wordmark ocupando la quinta parte
inferior (`y` 680–860).

**Tamaño mínimo de reproducción: 56 px de alto.** No es una preferencia: a ese alto la palabra mide
11 px, que es lo que necesita para leerse. Por debajo, el lockup deja de decir «Strivo» y pasa a ser
una mancha. Es el alto al que va en la cabecera de la app, **sin rótulo de texto al lado**: el logo
ya trae la palabra, y ponerla dos veces sería nombrar la marca dos veces.

### 3.2 Color de símbolo vs. color de marca

El color del logo (`#2B282F`) **no coincide** con el primario de la paleta (`#7A5A5F`,
`strivo-pm-500`). Es intencional y sobrevive al cambio de archivo: el logo tiene su propio tono «de
firma». El tono anterior era `#2B2730`; el oficial es `#2B282F`, y la regla es la misma.

**Regla de uso:** `#2B282F` y `#776F79` se usan únicamente para el logo mismo (cabecera, ícono de
app, favicon); los tokens de §4 se usan para todo lo demás (botones, superficies, fondos). No forzar
a que coincidan.

### 3.3 Versión monocromática — en uso, pendiente de aprobación

El logo se pinta **en blanco monocromo** en dos sitios, y en los dos por el mismo motivo: su tono de
firma sobre un fondo oscuro desaparece.

| Dónde | Fondo | Tal cual | En blanco |
|---|---|---|---|
| Cabecera, sección Mañana | `#1D1833` | 1,17:1 — invisible | 17,06:1 |
| Umbral de entrada, de noche | `#191428` | 2,09:1 — insuficiente | 17,92:1 |

Sobre la cabecera clara de la noche va tal cual (9,84:1) y sobre el velo crema del umbral también
(13,70:1): ahí no hace falta.

Hoy está **derivada con un filtro en el CSS y no como archivo nuevo**, para que aprobarla —o
sustituirla por la del diseñador— sea borrar dos reglas. **Pendiente de aprobación** (§9).

### 3.4 Wordmark

**STRIVO** — mayúsculas, tracking amplio, peso regular-medium.

### 3.5 Ícono de app (App Store / Play Store)

| Fondo | Símbolo |
|---|---|
| `#2B282F` (casi negro) | «S» en blanco, centrada |

**Solo la «S», sin el wordmark.** El lockup de §3.1 es vertical y trae la palabra; en un ícono de
64 px la palabra no se leería, así que el ícono pide un recorte del símbolo. **Pendiente** de que el
diseñador entregue ese recorte (§9): hoy no existe como archivo.

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

### 4.3 Strivo — Mañana (claridad cálida)

Uso: la sección Mañana de Hoy, tono más ligero y luminoso.

| Token | Hex | Uso sugerido |
|---|---|---|
| `strivo-am-50` | `#FAF3E9` | Fondo base más claro — arena muy clara |
| `strivo-am-100` | `#E8C9A4` | Superficie primaria, tarjetas — arena ámbar |
| `strivo-am-200` | `#F2BE95` | Acento secundario — durazno quemado |
| `strivo-am-300` | `#F4DFC4` | Superficie suave, fondos de tarjeta — crema cálida |

**Recalibrados el 1 de septiembre de 2026.** Los cuatro hexes anteriores (`#F6F2E9`, `#DCCFF1`,
`#E5C2DC`, `#F6DDE8`) quedan derogados. El caso más claro era `am-100`: un **lavanda** haciendo de
superficie primaria dentro de la sección que el manual describe como cálida, lo que contradecía a
§4.1 antes incluso de llegar a la percepción de nadie. Los rosas y lilas **desaparecen por completo
de la mañana** y no vuelven.

#### 4.3.1 Origen de los valores

Los ocho tokens de §4.3 y §4.4 no se eligieron por gusto ni se generaron sintéticamente: **se
muestrearon de una fotografía de atardecer** aportada como referencia en la revisión. El muestreo se
hizo por bandas horizontales y por agrupamiento de color sobre la imagen completa, y estos son los
anclajes medidos que sostienen la paleta:

| Zona de la imagen | Hex medido | Alimenta |
|---|---|---|
| Núcleo del sol | `#DD7E20` | `am-200` |
| Ámbar del horizonte | `#BF844E` | `am-100`, `am-200` |
| Durazno de transición | `#D0B3A0` | `am-300` |
| Malva ceniza del cielo medio | `#B2AEC5` | `pm-400` |
| Azul violáceo del cenit | `#7272A8` | `pm-400` |
| Ciruela del cielo bajo | `#7F6C79` | `pm-500`, `pm-700` |
| Profundo cálido del mar | `#242228` | referencia de fondo oscuro |

**Dos restricciones gobernaron la derivación**, y explican por qué los tokens no son los hexes
medidos tal cual:

1. **Luminancia conservada.** Cada token nuevo se ajustó para quedar cerca de la luminancia relativa
   del token que sustituye: **los ocho quedan por debajo de 0,05 de desviación**. Es lo que permite
   que la jerarquía de superficies de §8.3 y los degradados de §7 sigan funcionando **sin tocar una
   sola regla de layout**.

   **`am-200` se corrigió al integrar** (1 sep 2026). El muestreo directo daba `#DFAF88`, que se
   oscurecía 0,12 respecto del token que sustituye, y `lint:contraste` lo rechazó: sobre esa
   superficie va la atribución de la frase del día, que se pinta con el **secundario** `#3A3546` y no
   con la tinta, y caía a 5,98:1 contra un umbral AAA de 7:1. La verificación de §4.7 no lo cubría
   porque midió solo `ink` sobre las cuatro superficies de mañana. El token se aclaró a `#F2BE95`
   —mismo durazno quemado, ΔE 6,0 respecto del valor muestreado— hasta 7,07:1, con la desviación de
   luminancia en 0,025. De paso **recupera la separación que la superficie necesita**: ΔE 9,7 frente
   a `am-100`, que es la que tenía la pareja de v2.0 (9,5), y el recuadro de la frase vuelve a
   distinguirse del pie del degradado de la mañana.
2. **Contraste verificado antes de escribir el token**, no después. Los resultados están en §4.7.

**La imagen de referencia no es un asset de marca** y no se distribuye con el producto: fue el
instrumento para fijar los valores, y una vez fijados el manual manda sobre ella.

### 4.4 Strivo — Noche (introspección profunda)

Uso: la sección Noche de Hoy, tono más denso e íntimo.

| Token | Hex | Uso sugerido |
|---|---|---|
| `strivo-pm-50` | `#F2EDE5` | Texto claro sobre fondo oscuro / fondo alternativo |
| `strivo-pm-400` | `#8A7E9B` | Acento, fondo de ícono de app — azul violáceo ceniza |
| `strivo-pm-500` | `#7A5A5F` | **Color primario de marca**, CTAs — ciruela terracota |
| `strivo-pm-700` | `#5D5260` | Superficie oscura, texto sobre claro |

**Recalibrados el 1 de septiembre de 2026.** Los hexes anteriores (`#F3EFEA`, `#8D82B6`, `#6C5AA7`,
`#5A5568`) quedan derogados.

**Sobre `pm-500`, que es el token que más carga la identidad.** Pasa de un morado saturado
(`#6C5AA7`) a una **ciruela terracota apagada** (`#7A5A5F`): el tono de la fotografía justo donde el
naranja del horizonte se apaga contra el malva del cielo. Es el cambio que responde de frente a la
observación de «genérico»: el primario deja de ser el morado que comparte con media categoría y pasa
a ser el color de la hora en que la luz se va, que es exactamente lo que el producto nombra. De paso
**mejora en contraste** — blanco encima sube de 5,74:1 a 6,08:1 (§4.7).

`pm-400` conserva el azul violáceo del cenit de la imagen, pero desaturado hacia ceniza: sigue siendo
el acento frío que la noche necesita para no ser monocroma, sin volver al lila.

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
      "strivo": "#2B282F",
      "puntos": "#776F79",
      "viewBox": "0 0 1016 920"
    }
  },
  "momento": {
    "am": {
      "50": "#FAF3E9",
      "100": "#E8C9A4",
      "200": "#F2BE95",
      "300": "#F4DFC4"
    },
    "pm": {
      "50": "#F2EDE5",
      "400": "#8A7E9B",
      "500": "#7A5A5F",
      "700": "#5D5260"
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
  6,08:1 con la paleta v2.1 (era 5,74:1): pasa AA y no AAA. Se usan como acento y como borde, donde
  el umbral es 3:1.
- **El círculo de la respiración no se mide contra el 3:1 de WCAG 1.4.11:** la fase la dice el texto,
  el círculo es el ritmo y no el dato.

**Verificación de la recalibración v2.1.** Las combinaciones se midieron **antes** de fijar los
tokens, no después. Todas pasan con margen:

| Combinación | Ratio | Umbral | |
|---|---|---|---|
| `ink` sobre `am-50` | 14,57:1 | 7:1 (AAA) | ✅ |
| `ink` sobre `am-100` | 10,18:1 | 7:1 (AAA) | ✅ |
| `ink` sobre `am-200` | 9,61:1 | 7:1 (AAA) | ✅ |
| `ink` sobre `am-300` | 12,38:1 | 7:1 (AAA) | ✅ |
| `pm-50` sobre `night` | 15,38:1 | 7:1 (AAA) | ✅ |
| Blanco sobre `pm-500` | 6,08:1 | 4,5:1 (AA) | ✅ |
| Blanco sobre `pm-700` | 7,39:1 | 4,5:1 (AA) | ✅ |
| `pm-400` sobre `night` | 4,73:1 | 3:1 (gráfico) | ✅ |
| Secundario `#3A3546` sobre `am-200` | 7,07:1 | 7:1 (AAA) | ✅ |
| `am-100` frente a `am-50` (superficie) | 1,43:1 | — | separa por luminancia (§8.3) |
| `am-300` frente a `am-50` (superficie) | 1,18:1 | — | separa por luminancia (§8.3) |

**La tabla mide `ink`, y la app también pinta el secundario.** Esa es la lección de la integración:
la pre-verificación de arriba se hizo con la tinta principal (`#241E33`), pero cinco superficies del
producto llevan encima el secundario `#3A3546`, con el mismo umbral de 7:1 por ser texto de cuerpo.
Es lo que dejó pasar el `#DFAF88` de §4.3.1. **Cualquier recalibración futura mide los dos.**

Esta tabla es **informativa y no sustituye a `npm run lint:contraste`**, que sigue siendo la fuente
de verdad y debe pasar tras la recalibración.

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
| **Hoy · Mañana** | Mañana | Degradado cálido claro, texto oscuro, acento ámbar |
| **Hoy · Noche** | Noche | Degradado profundo, texto claro, acento ciruela |
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

- Fondo en `strivo-pm-500` (`#7A5A5F`), texto blanco.
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

- [x] ~~Archivo vectorial original del logo~~ — ✅ `Strivo_Logo_Oficial.svg` (25 ago 2026, sustituye
      a `strivo_simbolo.svg`)
- [x] ~~Nombre de la tipografía~~ — ✅ Inter, confirmada
- [x] ~~Verificar el secundario de la mañana~~ — ✅ recalibrado en v2.1: `#F2BE95` (§4.3, corregido al integrar — §4.3.1)
- [x] ~~Verificación de contraste de cada combinación~~ — ✅ automatizada en `npm run lint:contraste`
- [x] ~~Naming definitivo de la navegación~~ — ✅ Hoy · Journal · Respiración · Historial
- [ ] **Espacio de seguridad** del logo — no definido aún. El tamaño mínimo sí: 56 px de alto (§3.1)
- [ ] **Recorte del símbolo solo**, sin wordmark, para el ícono de app y el favicon (§3.5) — el
      lockup oficial no sirve a 64 px
- [ ] **Aprobación de la versión monocromática** del logo — hoy derivada con un filtro CSS y **en
      uso** en dos sitios; conviene que el diseñador la apruebe o la sustituya por un archivo propio
      (§3.3)
- [ ] **Set de iconos emocionales propios** (16) — encargado, especificado en §6.2
- [ ] **Set de iconos internos de UI** (check, flecha, más, etc.)
- [ ] **Decidir si `night` acompaña a la recalibración v2.1.** Queda fuera del alcance acordado —es
      un token semántico de §4.5, no de momento— pero **es el fondo de la sección Noche**, y hoy es
      un índigo violáceo frío (`#191428`) bajo una paleta que ya no lo es. La imagen de referencia da
      `#242228` en el mar profundo; el candidato derivado es **`#1E1A22`**, un casi-negro cálido que
      mantiene la regla de «nunca negro puro» (RN-VIS-03). Con la paleta actual el contraste no
      falla (`pm-50` encima da 15,38:1), así que **no es urgente: es de coherencia**
- [ ] **Decidir si `am-50` se separa más de `paper`.** Con la v2.1 quedan casi idénticos
      (`#FAF3E9` frente a `#FBF8F4`). No es un error —el fondo base claro y el papel pueden
      convivir— pero si se quiere que la mañana lea más ámbar que crema, el candidato es
      **`#F9EFE1`**

---

## 10. Assets

| Archivo | Contenido | Ubicación en el repo |
|---|---|---|
| `Strivo_Logo_Oficial.svg` | Logo vectorial: lockup vertical | `src/assets/marca/` |
| `strivo_apertura.mp4` | Video de apertura, 1080×1920, 4,0 s, sin sonido | `src/assets/marca/` |
| `BRAND_MANUAL_STRIVO.md` | Este documento | `docs/blueprint/` |

**Sobre el nombre del video.** Llegó como `Strivo_Apertura_Respiración.mp4` y se renombró al
integrarlo, por dos motivos que no son de estilo. Uno: la tilde en el nombre de un asset que Vite
emite y Netlify sirve viaja percent-encoded y es una fuente conocida de 404. Dos, y es el que manda:
`TransicionLuz.jsx` tiene prohibido nombrar la respiración (RN-LU-MAN-03, con una prueba que lo
comprueba sobre el código), y la ruta del `import` habría metido la palabra dentro del archivo.

### 10.1 El video de apertura

Se reproduce **una sola vez, al abrir la app** —una por sesión, el mismo contador de umbral que ya
existía— y nunca en bucle. Se salta tocando cualquier punto de la pantalla, como se saltaba la frase.
Va **sin sonido**, que es lo que la app es por defecto (RN-RE-11). Con `prefers-reduced-motion` no se
reproduce: la app entra directa a Hoy, sin umbral (RN-VIS-05).

**Se encaja entero, nunca se recorta.** El archivo es vertical (1080×1920) y la pantalla no siempre
lo es, así que se pinta con `object-contain`: el fotograma completo, centrado, dentro de la pantalla,
y el velo rellenando lo que sobra a los lados. Lo contrario —`object-cover`, que amplía hasta
cubrir— estuvo puesto un rato y era visible a simple vista:

| Pantalla | Con `cover` | Con `contain` |
|---|---|---|
| iPhone 15 (390×844) | 475×844 — sin recorte | 390×693 |
| iPad vertical (820×1180) | 820×1458 — **278 px recortados** | 664×1180 |
| Portátil (1440×900) | 1440×2560 — **1660 px recortados** | 506×900 |

**Ninguna medida del umbral va en píxeles fijos**, ni la del video ni la del logo quieto que lo
sustituye con movimiento reducido: no se sabe en qué se abre la app, y lo que se escriba en píxeles
será el tamaño equivocado en algún sitio.

---

*Fin del documento.*
