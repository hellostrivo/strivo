# SPEC_14 — Respiración: visuales (círculo y bolita sobre línea)

**Proyecto:** Strivo · **Rama:** `phase-1-lumia-formia` · **Fase:** 1C — Respiración
**Depende de:** SPEC_13 (motor). **No empezar hasta que SPEC_13 esté en verde.**
**Bloquea a:** SPEC_16
**Alcance:** capa de presentación del ritmo. Sin sonido, sin favoritos, sin navegación.

---

## 0. Encuadre

Dos guías visuales intercambiables, ambas alimentadas por el mismo `amplitud` del motor.

En *Pocket Breath Coach* la animación de **bolita sobre línea** es lo que más elogian sus usuarios: es la única que muestra **lo que viene**, no solo lo que pasa ahora. Un círculo que se expande te dice "ahora inhala"; la línea te dice "ahora inhalas, y en 4 segundos vas a sostener". Esa anticipación baja la ansiedad de no saber. La replicamos y la mejoramos.

**Lo que mejoramos frente a PBC:**

1. **Anticipación explícita.** La línea muestra el perfil de los próximos dos ciclos, no una onda genérica.
2. **Arco de progreso en las retenciones.** En PBC el círculo se queda quieto en las pausas y no sabes cuánto falta. Aquí un arco traza el tiempo restante.
3. **Modo de movimiento reducido de verdad.** PBC no lo contempla. Aquí es una experiencia diseñada, no la animación desactivada.
4. **Sin fondos fotográficos.** PBC vende paisajes; Strivo usa sus degradados de marca. Menos peso, más coherencia, mejor contraste.
5. **Contraste AAA medido**, no estimado.

---

## 1. Requiere confirmación previa

> ⚠️ **Claude Code confirma antes de ejecutar.**

**1.1 Tokens de color — el único punto abierto de este spec.** Respiración usa **Strivo madre** (decidido en §1.2). Reportar del `design-tokens.json` real:
- ¿Existe una escala `strivo-*`? ¿Con qué pasos?
- ¿Hay variante mañana/noche para Strivo, como sí la hay para Lumia y Formia?
- ¿Qué usa hoy el Home de Strivo, que ya está implementado? Esos son los tokens de referencia: la pantalla de Respiración debe verse como continuación del Home del que se entra.

**No inventar hexadecimales.** Si la escala Strivo existente no alcanza para derivar los cuatro colores de fase de §5, **detenerse y reportar** con una propuesta de los pasos faltantes, para que la persona decida contra el BRAND_MANUAL. El color de marca no se improvisa desde el código.

**1.2 Color del círculo — ✅ DECIDIDO (20 ago 2026).**

**El círculo de Respiración usa color Strivo madre.** No hereda el naranja/dorado de Lumia.

**El círculo de respiración de Lumia (SPEC_08) no se toca.** Conserva su naranja/dorado, su ubicación y su comportamiento exactamente como están. Son dos elementos distintos, de dos capas de marca distintas, y así deben verse.

Consecuencias operativas:
- `VisualCirculo.jsx` de `breathing/` es un componente **nuevo e independiente**. No se reutiliza ni se extiende `Respiracion.jsx` de SPEC_08.
- Los cuatro colores de fase de §5 salen íntegramente de la escala Strivo. Cero referencias a tokens `lumia-*`.
- Que los dos círculos se parezcan en forma pero no en color es intencional: la forma dice "esto es respirar", el color dice "esto es Strivo, no Lumia".
- **RN-RE-VIS-00:** ningún archivo bajo `src/breathing/**` referencia un token `lumia-*` ni `formia-*`. Verificable con una búsqueda en los estilos.

**1.3 Librería de animación.** Reportar si el repo ya usa Framer Motion, `react-spring` o CSS puro. Este spec **no requiere ninguna librería nueva**: todo se resuelve con SVG + atributos calculados por frame desde el motor. Si se propone añadir una dependencia, justificarlo y esperar OK.

---

## 2. Arquitectura de la capa visual

### 2.1 Contrato único

**RN-RE-VIS-01:** toda visual recibe exactamente estas props y **nada más**:

```js
/**
 * @typedef {Object} PropsVisual
 * @property {EstadoRitmo} estado        // de motorRitmo.resolverEstado()
 * @property {Patron} patron
 * @property {'inactivo'|'acomodando'|'activo'|'pausado'|'cerrando'|'completado'} estadoSesion
 * @property {boolean} movimientoReducido
 * @property {'circulo'|'linea'} — no; la visual no sabe cuál es
 */
```

**RN-RE-VIS-02:** ninguna visual calcula amplitud, fase ni tiempo por su cuenta. Ninguna visual tiene `useEffect` con temporizadores. Son **funciones de renderizado del estado que reciben**. Toda la deriva posible vive en un solo lugar: el motor.

**RN-RE-VIS-03:** ninguna visual escribe en la base de datos ni conoce el repositorio.

### 2.2 Archivos

```
src/breathing/components/visuales/GuiaVisual.jsx        // selector delgado
src/breathing/components/visuales/VisualCirculo.jsx
src/breathing/components/visuales/VisualLinea.jsx
src/breathing/components/visuales/EtiquetaFase.jsx      // compartida
src/breathing/components/visuales/AnuncioAccesible.jsx  // compartida
src/breathing/lib/geometriaLinea.js                     // lógica pura de la onda
src/breathing/lib/geometriaCirculo.js                   // lógica pura del arco
```

`geometria*.js` son **puras y testeables sin DOM**. Ahí va toda la matemática; los `.jsx` solo pintan lo que esas funciones devuelven. Esto es lo que hace que 120 tests sean posibles sobre una capa visual.

---

## 3. Visual A — Círculo

### 3.1 Anatomía

Cuatro capas concéntricas, de fuera hacia dentro:

```
┌─ Halo          radio = R × 1.18, opacidad 0.10, difuminado
├─ Arco de fase  radio = R fijo, trazo 3px, traza el progreso de la fase actual
├─ Anillo        radio = R, trazo 2px, opacidad 0.35 — la guía estática
└─ Disco         radio variable — el que respira
```

### 3.2 Geometría

`geometriaCirculo.js`

```js
/**
 * @param {number} amplitud   0..1 del motor
 * @param {number} radioBase  radio del anillo estático, en unidades de viewBox
 * @returns {{ radioDisco:number, radioHalo:number, opacidadHalo:number }}
 */
export function calcularRadios(amplitud, radioBase)
```

| Magnitud | Fórmula | Nota |
|---|---|---|
| `radioDisco` | `radioBase × (0.32 + 0.68 × amplitud)` | Vacío = 32 % del anillo. **Nunca 0**: un punto que desaparece se siente como asfixia. |
| `radioHalo` | `radioDisco × 1.18` | Sigue al disco |
| `opacidadHalo` | `0.06 + 0.10 × amplitud` | Más presencia al estar lleno |

- **RN-RE-VIS-04:** `radioDisco` mínimo es 32 % del base. Verificable.
- **RN-RE-VIS-05:** en `retenerLleno` el disco queda **inmóvil** en su radio máximo. Nada de latido decorativo: la quietud del dibujo es la instrucción.

### 3.3 Arco de fase

Resuelve el problema real de PBC: durante una retención de 7 segundos, el círculo quieto no te dice cuánto falta.

```js
export function calcularArco(progresoFase, radio)
  → { d: string, longitudTotal: number, longitudVisible: number }
```

- Arranca a las 12 en punto, avanza en sentido horario.
- Se dibuja con `stroke-dasharray` / `stroke-dashoffset`.
- **RN-RE-VIS-06:** el arco se **reinicia a 0 al empezar cada fase**, no es un progreso acumulado del ciclo. Mide la fase actual.
- **RN-RE-VIS-07:** el arco cambia de color por fase (§5). El cambio es un `transition` de 200 ms, no un salto.

### 3.4 viewBox y dimensiones

```
viewBox = "0 0 320 320"
centro  = (160, 160)
radioBase = 96
```

Escala por CSS a `min(72vw, 46vh)`, con `max-width: 340px`. En móvil (~380 px de ancho) el círculo ocupa ~274 px: dominante sin llegar a los bordes.

- **RN-RE-VIS-08:** el SVG es `preserveAspectRatio="xMidYMid meet"`. Nunca se deforma.

---

## 4. Visual B — Bolita sobre línea

La firma de PBC. La más informativa. La que hay que hacer muy bien.

### 4.1 Concepto

Una onda horizontal que representa el aire. **La onda se desplaza hacia la izquierda; la bolita se mantiene fija en X.** La bolita solo sube y baja.

```
      ╭──────╮                  ╭───────╮
     ╱        ╲                ╱
    ╱          ╲              ╱
───╯      ●     ╰────────────╯
          ↑
     posición fija: 38 % del ancho
   ← pasado          futuro →
```

Que la bolita esté al 38 % y no al centro es deliberado: se ve **más futuro que pasado**. La anticipación es el valor de esta visual; el pasado no sirve de nada.

### 4.2 Geometría de la onda

`geometriaLinea.js`

```js
/**
 * Genera el path de la onda para una ventana de tiempo.
 * @param {Patron} patron
 * @param {number} msActuales
 * @param {Object} vista { ancho, alto, msVentana, posicionBolita }
 * @returns {{ d:string, puntoBolita:{x,y}, marcasFase:Array<{x,fase}> }}
 */
export function generarOnda(patron, msActuales, vista)
```

Parámetros de la ventana:

| Parámetro | Valor | Justificación |
|---|---|---|
| `msVentana` | `max(duracionCiclo × 2, 20000)` | Siempre al menos dos ciclos visibles, mínimo 20 s. En un patrón de 10 s se ven 2 ciclos; en uno de 19 s, 2 ciclos. |
| `posicionBolita` | `0.38` | 38 % desde la izquierda |
| `alto útil` | 62 % del alto del viewBox | Deja aire arriba y abajo para etiquetas |

**Construcción del path:**
1. Muestrear `amplitud` cada 40 ms a lo largo de toda la ventana (`resolverEstado` con tiempos desplazados). Para 20 s son ~500 puntos: barato y suave.
2. Mapear tiempo → X lineal, amplitud → Y invertida (amplitud 1 = arriba).
3. Unir con curvas de Bézier cuadráticas suavizadas, no con `L` rectos. Un polígono se ve digital; una curva se ve como aire.

- **RN-RE-VIS-09:** la Y de la bolita se calcula con la **misma** `amplitud` del estado del motor, no muestreando el path. El path y la bolita jamás se desfasan.
- **RN-RE-VIS-10:** las mesetas de retención son **planas**, sin ondulación decorativa. La forma comunica: plano = sostén.

### 4.3 Tratamiento de pasado y futuro

- **Pasado** (X < posición de la bolita): opacidad 0,30, trazo 2 px. Se desvanece a 0 en el borde izquierdo (gradiente en el trazo).
- **Futuro** (X > posición de la bolita): opacidad 0,85, trazo 2,5 px. Se desvanece a 0,25 en el borde derecho.
- **RN-RE-VIS-11:** ambos extremos se desvanecen. Una línea cortada en seco en el borde parece un error de renderizado.

### 4.4 La bolita

```
Núcleo:  r = 7,  relleno sólido, color de la fase actual
Halo:    r = 14, opacidad 0,18, mismo color
Estela:  tras la bolita, 3 círculos decrecientes (r 5, 3, 2) con opacidad 0,12 / 0,08 / 0,04,
         separados 14 px hacia la izquierda
```

- **RN-RE-VIS-12:** la estela se **omite por completo** con `prefers-reduced-motion`.
- **RN-RE-VIS-13:** el color de la bolita interpola entre colores de fase durante 200 ms al cambiar de fase, no salta.

### 4.5 Marcas de fase

Sobre la onda, líneas verticales tenues (opacidad 0,12) en cada cambio de fase, con la etiqueta corta debajo (`Inhala`, `Sostén`, `Exhala`, `Descansa`) a 10 px, opacidad 0,45.

- **RN-RE-VIS-14:** solo se etiquetan las marcas **futuras**. Las pasadas llevan la línea pero no el texto.
- **RN-RE-VIS-15:** si el ciclo dura menos de 8 s, las etiquetas se ocultan por apiñamiento; se conservan las líneas.

### 4.6 viewBox

```
viewBox = "0 0 380 200"
```

Escala a `width: 100%`, `max-width: 420px`. Relación 19:10, panorámica: refuerza la lectura temporal de izquierda a derecha.

---

## 5. Color por fase

Cuatro colores derivados de la **escala Strivo madre** reportada en §1.1. **No hexadecimales literales en el código: solo variables CSS.** Ninguno se deriva de `lumia-*` ni de `formia-*` (RN-RE-VIS-00).

| Fase | Rol del color | Variable propuesta |
|---|---|---|
| `inhalar` | El más luminoso y cálido. Apertura. | `--respiracion-fase-inhalar` |
| `retenerLleno` | Igual que inhalar pero 12 % desaturado. Suspensión. | `--respiracion-fase-sosten` |
| `exhalar` | Más frío y profundo. Soltar. | `--respiracion-fase-exhalar` |
| `retenerVacio` | El más apagado. Reposo. | `--respiracion-fase-descanso` |

- **RN-RE-VIS-16:** cada uno de los cuatro contra el fondo de Respiración cumple **AAA (7:1)** para el texto asociado y **≥ 3:1** para el elemento gráfico. Verificado por `npm run lint:contraste`, no a ojo.
- **RN-RE-VIS-17:** la fase **nunca se comunica solo por color**. Siempre hay texto (`EtiquetaFase`) y forma (tamaño del disco / altura de la onda). Requisito de daltonismo. Es también donde PBC falla.

---

## 6. `EtiquetaFase`

Componente compartido por ambas visuales.

- Texto: `copy.respiracion.fases[fase]`.
- Posición: círculo → centrado dentro del disco; línea → centrado sobre la onda, en la parte alta.
- Tipografía: Inter, peso 300, `letter-spacing: 0.06em`, `text-transform: none`.
- Tamaño: `clamp(20px, 5.5vw, 28px)`.
- **RN-RE-VIS-18:** al cambiar de fase, cruce suave de 220 ms (sale la anterior, entra la nueva). Con movimiento reducido, cambio instantáneo sin transición.
- **RN-RE-VIS-19:** debajo, en 14 px y opacidad 0,55, la cuenta regresiva de la fase en segundos enteros (`3`, `2`, `1`). Con retenciones largas es lo que evita la sensación de estar perdido. Se oculta si la fase dura menos de 2,0 s (parpadearía).

---

## 7. Movimiento reducido

`prefers-reduced-motion: reduce` no significa "sin animación". Significa **sin movimiento continuo**. La guía debe seguir siendo utilizable.

| Elemento | Normal | Movimiento reducido |
|---|---|---|
| Radio del disco | Continuo por frame | **Cuatro pasos discretos** por fase (0 %, 33 %, 66 %, 100 % de la amplitud objetivo), con transición CSS de 400 ms entre pasos |
| Arco de fase | Continuo | Avanza en pasos de 1 segundo |
| Onda de la línea | Se desplaza | **Estática.** Se dibuja un ciclo completo, fijo. Un marcador vertical avanza a saltos de 1 segundo sobre él |
| Estela de la bolita | Presente | Eliminada |
| Halo | Opacidad variable | Opacidad fija en 0,10 |
| Cruce de `EtiquetaFase` | 220 ms | Instantáneo |
| Interpolación de color | 200 ms | Instantánea |

- **RN-RE-VIS-20:** con movimiento reducido, la actualización visual ocurre **como máximo una vez por segundo**. Verificable contando renders en test.
- **RN-RE-VIS-21:** la preferencia se lee con `window.matchMedia` **y** se escucha su evento `change`. Si la persona la cambia con la sesión abierta, la visual se adapta sin reiniciar.
- **RN-RE-VIS-22:** existe además un interruptor manual en la configuración, independiente del sistema. Alguien puede querer movimiento reducido sin cambiarlo en todo su dispositivo. `movimientoReducido = preferenciaSistema || preferenciaManual`.

---

## 8. Accesibilidad

**`AnuncioAccesible.jsx`** — un `<span>` visualmente oculto con `aria-live="polite"` y `aria-atomic="true"`.

- **RN-RE-VIS-23:** en cada cambio de fase se actualiza con `copy.respiracion.fasesAccesibles[fase]` interpolando los segundos. Un lector de pantalla dice "Inhala durante 4 segundos".
- **RN-RE-VIS-24:** se actualiza **solo al cambiar de fase**, jamás por frame. Un `aria-live` a 60 Hz es inutilizable.
- **RN-RE-VIS-25:** los SVG llevan `role="img"` y un `<title>` con el nombre del patrón. Los elementos internos, `aria-hidden="true"`: la información ya la da el anuncio.
- **RN-RE-VIS-26:** en `pausado`, se anuncia una vez "En pausa" y se detienen los anuncios de fase.
- **RN-RE-VIS-27:** ningún elemento de la visual es enfocable con teclado. Es un dibujo, no un control. Los controles viven en SPEC_16.

---

## 9. Estados de sesión en la visual

| Estado | Comportamiento |
|---|---|
| `inactivo` | Disco en amplitud 0,5, quieto. Onda estática de un ciclo. Sin etiqueta de fase. Es una **vista previa** del patrón elegido: al cambiar de patrón en la configuración, la vista previa cambia. |
| `acomodando` | Ambas visuales en amplitud 0,5 con una respiración muy lenta (ciclo de 6 s, decorativa). Al centro, la cuenta 3-2-1. Copy de `respiracion.acomodo`. |
| `activo` | Comportamiento pleno. |
| `pausado` | **Se congela en el punto exacto.** Todo baja a opacidad 0,45. Aparece un ícono de pausa al centro (círculo) o sobre la bolita (línea). |
| `cerrando` | Idéntico a `activo`. La persona **no debe notar** que es el último ciclo: saberlo cambia cómo se respira. Sin indicador. |
| `completado` | Ambas se desvanecen a opacidad 0 en 900 ms. El 900 ms es el mismo cierre del Ritual de Noche: es el gesto de cierre de Strivo. |

- **RN-RE-VIS-28:** la transición `inactivo → acomodando` es un cruce de 400 ms. Nunca un corte.
- **RN-RE-VIS-29:** cambiar de visual (círculo ↔ línea) durante una sesión activa está **permitido** y no interrumpe el ritmo: el motor sigue corriendo, solo cambia quién lo pinta. Cruce de 300 ms.

---

## 10. Rendimiento

- **RN-RE-VIS-30:** un frame de render de cualquiera de las dos visuales tarda **< 4 ms** en un dispositivo de gama media. Presupuesto: 60 fps con margen.
- **RN-RE-VIS-31:** `generarOnda` **memoiza el muestreo** por `(patron, msVentana, ancho, alto)`. La forma de la onda no cambia entre frames; solo cambia el desplazamiento en X. Recalcular 500 puntos por frame es un error. **Por frame solo se actualiza un `transform: translateX()`** sobre un `<g>`, más la Y de la bolita.
- **RN-RE-VIS-32:** el desplazamiento usa `transform`, nunca los atributos `x`/`d`. Solo así se compone en GPU.
- **RN-RE-VIS-33:** ningún `setState` de React por frame. El valor por frame se aplica por `ref` directamente sobre el nodo SVG. React solo re-renderiza al **cambiar de fase**, no al cambiar de amplitud.

> RN-RE-VIS-33 es la regla que decide si esto se siente suave o entrecortado. Un `setState` a 60 Hz reconcilia el árbol 60 veces por segundo.

---

## 11. Casos límite

| # | Caso | Comportamiento |
|---|---|---|
| 11.1 | Patrón sin retenciones | La onda pasa de subida a bajada sin meseta. La curva en el pico debe seguir siendo suave, no un pico agudo. Test específico. |
| 11.2 | Retención de 20 s | El arco tarda 20 s en dar la vuelta. La cuenta regresiva llega hasta 20. Sin apiñamiento visual. |
| 11.3 | Ciclo de 6 s en la línea | `msVentana` se fija en 20 s → se ven 3,3 ciclos. Etiquetas ocultas por RN-RE-VIS-15. |
| 11.4 | Viewport de 320 px | Círculo ≤ 230 px, línea sin desbordar. Sin scroll horizontal. Test con viewport de 320×568. |
| 11.5 | Viewport horizontal (móvil acostado) | La visual usa `min(vw, vh)` de referencia y no se sale. El círculo se limita por altura. |
| 11.6 | Pestaña oculta y regreso | Al volver, la visual salta a la posición correcta con un cruce de 250 ms, **no** con un barrido de recuperación. |
| 11.7 | Cambio de visual a mitad de retención | La nueva visual arranca en el punto correcto de esa retención, con su arco/marcador ya avanzado. |
| 11.8 | `movimientoReducido` activado a mitad de sesión | Cambio inmediato de modo sin perder la posición del ritmo. |
| 11.9 | Muy alto contraste del sistema (`prefers-contrast: more`) | Trazos suben a 3 px, opacidades mínimas suben a 0,55, halo se elimina. |
| 11.10 | Patrón cambiado con la sesión en `inactivo` | La vista previa se actualiza con un cruce de 300 ms. |

---

## 12. Archivos

### Crear
```
src/breathing/components/visuales/GuiaVisual.jsx
src/breathing/components/visuales/VisualCirculo.jsx
src/breathing/components/visuales/VisualLinea.jsx
src/breathing/components/visuales/EtiquetaFase.jsx
src/breathing/components/visuales/AnuncioAccesible.jsx
src/breathing/lib/geometriaLinea.js
src/breathing/lib/geometriaCirculo.js
src/breathing/lib/preferenciaMovimiento.js
src/breathing/styles/respiracion.css        (o el mecanismo de estilos que use el repo)
```

### Modificar
```
design-tokens.json    → variables --respiracion-fase-* (previa confirmación de §1.1)
src/copy/index.js     → nada nuevo; los strings ya se crearon en SPEC_13
CLAUDE.md             → reglas RN-RE-VIS-*
```

### No tocar
```
src/components/lumia/**    ✗
src/components/formia/**   ✗
src/shared/respiracion/**  ✗ (cerrado en SPEC_13)
```

---

## 13. Criterios de aceptación

| # | Criterio |
|---|---|
| 1 | Los ~540 tests de SPEC_13 siguen verdes. |
| 2 | `calcularRadios(0, R)` devuelve exactamente `0.32 × R`. `calcularRadios(1, R)` devuelve `R`. |
| 3 | El radio del disco es monótono no decreciente durante toda la fase `inhalar`, para los 6 presets. |
| 4 | El radio es constante (varianza 0) durante `retenerLleno` y `retenerVacio`. |
| 5 | `calcularArco(0)` da longitud visible 0; `calcularArco(1)` da la circunferencia completa (± 0,5 unidades). |
| 6 | El arco se reinicia a 0 en cada cambio de fase (RN-RE-VIS-06). |
| 7 | `generarOnda` produce un path válido (parseable) para los 6 presets. |
| 8 | La Y de la bolita coincide con la Y del path en la X de la bolita, con error < 1 unidad de viewBox, en 20 instantes por ciclo. |
| 9 | La onda tiene mesetas exactamente planas en las retenciones: varianza de Y = 0 en ese tramo (RN-RE-VIS-10). |
| 10 | Un patrón sin retenciones produce un pico suave: la segunda derivada no presenta discontinuidad mayor a un umbral definido (caso 11.1). |
| 11 | `generarOnda` memoiza: llamada dos veces con los mismos argumentos, el muestreo se ejecuta una sola vez (espía sobre `resolverEstado`). |
| 12 | Ninguna visual dispara `setState` durante 5 segundos simulados de sesión activa sin cambio de fase (RN-RE-VIS-33). |
| 13 | Con `prefers-reduced-motion: reduce`, la visual se actualiza ≤ 1 vez por segundo (RN-RE-VIS-20). |
| 14 | Con movimiento reducido, la estela de la bolita no está en el DOM (RN-RE-VIS-12). |
| 15 | El interruptor manual de movimiento reducido funciona con la preferencia del sistema desactivada (RN-RE-VIS-22). |
| 16 | Un cambio de `prefers-reduced-motion` en vivo se refleja sin remontar el componente (RN-RE-VIS-21). |
| 17 | `AnuncioAccesible` se actualiza exactamente una vez por cambio de fase, ni más ni menos, en 3 ciclos simulados (RN-RE-VIS-24). |
| 18 | Los elementos internos del SVG tienen `aria-hidden="true"` y el SVG tiene `role="img"` con `<title>` (RN-RE-VIS-25). |
| 19 | Ningún elemento de la visual aparece en el orden de tabulación (RN-RE-VIS-27). |
| 20 | `npm run lint:contraste` verde con los 4 colores de fase (RN-RE-VIS-16). |
| 20b | Ningún archivo bajo `src/breathing/**` referencia un token `lumia-*` ni `formia-*` (RN-RE-VIS-00). Test que recorre estilos y JSX. |
| 20c | `Respiracion.jsx` de SPEC_08 no fue modificado: su círculo naranja/dorado de Lumia sigue idéntico (§1.2). |
| 21 | Cada fase se distingue por texto **y** por geometría, no solo por color (RN-RE-VIS-17). Test que verifica presencia de `EtiquetaFase` en las 4 fases. |
| 22 | En viewport de 320×568 no hay desbordamiento horizontal en ninguna de las dos visuales (caso 11.4). |
| 23 | Cambiar de visual durante sesión activa preserva `cicloActual` y `progresoFase` (RN-RE-VIS-29). |
| 24 | En `pausado`, la visual queda congelada: dos renders separados 1 s producen atributos idénticos. |
| 25 | En `cerrando`, la visual es indistinguible de `activo`: comparación de props renderizadas (RN-RE-VIS ­— §9). |
| 26 | Ningún string literal visible fuera de `copy/index.js` en todo `src/breathing/components/**`. |
| 27 | `npm run lint`, `lint:copy`, `lint:contraste`, `format:check`, `build`: los cinco en verde. |

**Meta de tests nuevos: 115–135.** Total esperado tras SPEC_14: **~665 verdes.**

---

## 14. Validación manual (además de los tests)

Los tests no detectan si algo se *siente* mal. Después de los criterios automáticos, verificar en navegador y en celular:

1. Círculo con `calma-553`: ¿el movimiento invita a seguirlo o va adelantado/atrasado respecto al impulso natural?
2. Línea con `cuatro-siete-ocho`: ¿la meseta de 7 s se lee claramente como "sostén"?
3. Línea con `exhalacion-larga`: ¿la asimetría 1:2 se ve a simple vista?
4. Movimiento reducido: ¿sigue siendo posible respirar guiado, o quedó inservible?
5. Cambio de círculo a línea a media sesión: ¿se siente continuo?
6. En celular a brillo bajo, de noche: ¿se ve el trazo del futuro de la onda?
7. Entrar al Home, luego a Respiración: ¿el color se lee como continuación del Home de Strivo, o se siente ajeno?
8. Abrir la respiración diaria de Lumia y la de Respiración una tras otra: ¿la diferencia de color se lee como intencional o como inconsistencia?

---

## 15. Definición de hecho

- [ ] §1.1 reportado (tokens Strivo) y §1.3 confirmado (librerías)
- [ ] 29 criterios verificados con evidencia
- [ ] 8 validaciones manuales realizadas y comentadas
- [ ] `CLAUDE.md` con las reglas RN-RE-VIS-*
- [ ] Commit hecho, **sin push**
