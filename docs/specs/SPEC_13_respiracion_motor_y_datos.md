# SPEC_13 — Respiración: motor, catálogo de patrones y capa de datos

**Proyecto:** Strivo · **Rama:** `phase-1-lumia-formia` · **Fase:** 1C — Respiración
**Depende de:** SPEC_02 (capa de datos), SPEC_08 (respiración de Lumia)
**Bloquea a:** SPEC_14, SPEC_15, SPEC_16
**Alcance:** lógica pura + persistencia. **Cero UI en este spec.**

---

## 0. Contexto y encuadre

Strivo suma un tercer acceso desde el Home: **Respiración**. No es una tercera marca ni un tercer espacio: es una **herramienta transversal de Strivo**, hermana menor de Lumia y Formia. Se entra, se usa, se sale.

Referencia externa analizada: *Pocket Breath Coach* (Headfulness LLC, 4.3★, 50k+ descargas). De ahí tomamos:

| Aprendizaje de PBC | Cómo lo adoptamos |
|---|---|
| Patrones con nombre propio (caja, 4-7-8, 4-6) + edición fina de cada fase | Sí, con catálogo curado más corto |
| Guardar configuraciones favoritas con nombre | Sí (SPEC_15) |
| "Recientes" para volver de un toque | Sí, versión mínima |
| Animación + sonido perfectamente sincronizados | Sí, motor único como fuente de verdad |
| Precisión de 0,1 s | **No.** Paso de 0,5 s (ver RN-RE-MOT-06) |
| Anuncios, muro premium, funciones bloqueadas | **No.** Todo abierto |
| Encuadre clínico ("para la ansiedad") | **No.** Voz de refugio (§7) |
| Temporizador de sueño y recordatorios push | **No en esta fase** (§3) |

**Lo que mejoramos frente a PBC:**
1. Fase de acomodo antes del primer inhalar (PBC arranca en seco).
2. El ciclo en curso siempre se completa; nunca se corta a media exhalación.
3. Un solo motor alimenta visual y sonido, con reloj monotónico sin deriva.
4. Accesibilidad real: AAA, `prefers-reduced-motion`, anuncios para lector de pantalla.
5. Catálogo corto y curado en vez de decenas de patrones que paralizan.

---

## 1. Paso 0 obligatorio — reconocimiento antes de tocar nada

Antes de escribir código, Claude Code debe **inventariar y reportar** (sin modificar):

1. Ruta real de los tres archivos de SPEC_08: buscar `ritmoRespiracion`, `audioRespiracion`, `Respiracion.jsx`. Reportar ruta exacta de cada uno.
2. Firma pública actual de `ritmoRespiracion.js`: exports, parámetros, valores de retorno.
3. Quién importa esos módulos hoy (lista de archivos).
4. Esquema actual de `src/lib/db.js`: nombres de stores, versión de esquema, mecanismo de migración.
5. Reglas de ESLint que restringen imports entre `lumia/`, `formia/`, `shared/`. Transcribir la config.
6. Nombre y rutas reales de los tokens en `design-tokens.json`: ¿existe una escala `strivo-*` (marca madre) además de `lumia-*` y `formia-*`?
7. Estructura de `src/copy/index.js`: cómo se agrupan los namespaces.
8. Runner de tests y comando exacto (`npm test`? `vitest`?), y número de tests verdes hoy (esperado: 447).

**Entregar ese reporte y esperar OK antes de continuar.** Las rutas que aparecen abajo son la propuesta; si el repo difiere, mandan las rutas reales y se ajusta el spec.

---

## 2. Objetivo del SPEC_13

Dejar listo, probado y sin UI:

- Un **motor de ritmo generalizado** que ejecute cualquier patrón de 4 fases.
- Un **catálogo de patrones** con presets curados.
- Una **máquina de estados de sesión** con duración por ciclos, por tiempo o abierta.
- La **capa de datos** `breathing/` (preferencias, favoritos, recientes, sesiones).
- Las **reglas de validación** de patrones y duraciones.
- El **copy** del namespace `respiracion` (solo strings; nadie los pinta todavía).

---

## 3. Fuera de alcance (explícito)

No implementar en SPEC_13–16. Se documentan como candidatos de Fase 2:

- ❌ Temporizador de sueño con desvanecido progresivo (PBC lo tiene; no se pidió).
- ❌ Recordatorios push / notificaciones programadas.
- ❌ Estadísticas, rachas, gráficas de progreso, historial navegable de sesiones.
- ❌ Fondos fotográficos / paisajes (PBC los usa; Strivo usa degradados de marca).
- ❌ Precisión de 0,1 s en la edición de fases.
- ❌ Reproducción en segundo plano con pantalla bloqueada (limitación real de PWA, ver §9.4).
- ❌ Cualquier lectura o escritura de datos de Lumia o Formia.

---

## 4. Reglas de arquitectura que este spec roza — **requiere confirmación previa**

> ⚠️ **Claude Code debe confirmar estos cuatro puntos antes de ejecutar.**

**4.1 Refactor de código ya probado (SPEC_08).**
`ritmoRespiracion.js` hoy resuelve un solo patrón (5-5-3). Este spec lo **generaliza**. Es un refactor de 340 tests verdes.
→ Condición innegociable: **los tests existentes de SPEC_08 no se modifican ni se borran.** Son la red de regresión. Si alguno se pone rojo, el refactor está mal, no el test.
→ Si la generalización obliga a cambiar la firma pública, se mantiene la firma vieja como *wrapper* delgado sobre la nueva y se marca `@deprecated` en JSDoc.

**4.2 Nueva raíz de carpeta `breathing/`.**
Se crea un tercer namespace hermano de `lumia/` y `formia/`. La regla RN-DB4-01 (Lumia y Formia no se importan entre sí) debe **extenderse**:

```
breathing/  ──✗──>  lumia/       (prohibido)
breathing/  ──✗──>  formia/      (prohibido)
breathing/  ──✓──>  shared/      (permitido)
lumia/      ──✗──>  breathing/   (prohibido)
formia/     ──✗──>  breathing/   (prohibido)
shared/     ──✗──>  breathing/   (prohibido)
```

→ Confirmar que se puede añadir esta matriz a la config de ESLint sin romper el lint actual.

**4.3 Ubicación del motor: `shared/` y no `breathing/`.**
Lumia consume el motor (respiración diaria 5-5-3×3). Respiración también. Si el motor vive en `breathing/`, Lumia tendría que importarlo → viola 4.2.
→ **Decisión: el motor de ritmo vive en `shared/`.** `breathing/` contiene la experiencia (catálogo, sesión, UI, datos), no el reloj.

**4.4 Migración de IndexedDB.**
Añadir stores implica subir la versión del esquema. Debe ser **aditiva y no destructiva**: ningún dato existente se toca, ninguna lectura previa se rompe. Si el usuario abre una versión vieja de la app después, no debe corromperse nada.
→ Reportar la estrategia de migración que usa hoy `db.js` y confirmar que admite `onupgradeneeded` incremental.

---

## 5. Modelo del patrón

### 5.1 Representación canónica

Un patrón son cuatro fases en orden fijo:

```
inhalar → retenerLleno → exhalar → retenerVacio → (repite)
```

**Unidad de almacenamiento: décimas de segundo, enteras.** Nada de flotantes: 5,0 s se guarda como `50`. Esto elimina la deriva por coma flotante en sumas repetidas.

```js
/**
 * @typedef {Object} Patron
 * @property {number} inhalar        décimas de segundo, entero ≥ 10
 * @property {number} retenerLleno   décimas de segundo, entero ≥ 0
 * @property {number} exhalar        décimas de segundo, entero ≥ 10
 * @property {number} retenerVacio   décimas de segundo, entero ≥ 0
 */
```

### 5.2 Catálogo de presets

`src/breathing/data/catalogoPatrones.js`

| id | Nombre (copy) | inhalar | retenerLleno | exhalar | retenerVacio | Ciclo | Editable |
|---|---|---|---|---|---|---|---|
| `calma-553` | Calma 5-5-3 | 50 | 0 | 50 | 30 | 13,0 s | fases sí |
| `caja` | Respiración en caja | 40 | 40 | 40 | 40 | 16,0 s | **lado único** |
| `cuatro-siete-ocho` | 4-7-8 | 40 | 70 | 80 | 0 | 19,0 s | fases sí |
| `exhalacion-larga` | Exhalación larga | 40 | 0 | 80 | 0 | 12,0 s | fases sí |
| `coherencia` | Coherencia 5-5 | 50 | 0 | 50 | 0 | 10,0 s | fases sí |
| `entrada-suave` | Entrada suave 4-6 | 40 | 0 | 60 | 0 | 10,0 s | fases sí |
| `personalizado` | A tu medida | — | — | — | — | — | fases sí |

- `calma-553` es el **preset por defecto** y el mismo ritmo que usa Lumia. Es el puente de identidad entre la herramienta y la app.
- `entrada-suave` es el recomendado para primera vez (sin retenciones, sin esfuerzo).
- `caja` tiene modo de edición especial: **un solo control mueve las cuatro fases a la vez** (es lo que la hace "caja"). Rango del lado: 30–80 (3,0–8,0 s). Si el usuario edita una fase por separado, el patrón deja de ser "caja" y se convierte automáticamente en `personalizado` (RN-RE-MOT-08).

Cada entrada del catálogo lleva además:

```js
{
  id: 'cuatro-siete-ocho',
  claveCopy: 'respiracion.patrones.cuatroSieteOcho',   // nombre + descripción viven en copy
  patron: { inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 },
  editable: 'fases',            // 'fases' | 'ladoUnico' | 'libre'
  recomendadoPrimeraVez: false,
  tieneRetenciones: true,       // dispara la nota de seguridad (§7.4)
  orden: 3
}
```

### 5.3 Reglas de validación

| Regla | Enunciado |
|---|---|
| **RN-RE-MOT-01** | `inhalar ≥ 10` y `exhalar ≥ 10`. Nunca pueden ser 0: sin inhalar o sin exhalar no hay respiración. |
| **RN-RE-MOT-02** | `retenerLleno ≥ 0` y `retenerVacio ≥ 0`. Sí pueden ser 0. |
| **RN-RE-MOT-03** | Cada fase ≤ 200 (20,0 s). |
| **RN-RE-MOT-04** | Ciclo total ≥ 60 (6,0 s) y ≤ 600 (60,0 s). |
| **RN-RE-MOT-05** | Todos los valores son enteros. Un decimal recibido se redondea al múltiplo de 5 más cercano y se registra en el resultado de la validación. |
| **RN-RE-MOT-06** | El paso de edición es 5 (0,5 s). Decisión deliberada frente a los 0,1 s de PBC: ajustar por décimas obliga a manipular la app en el momento exacto en que la persona debería estar soltando el control. Medio segundo es suficiente resolución y menos fricción. |
| **RN-RE-MOT-07** | La validación **nunca lanza excepción**. Devuelve `{ valido: boolean, patron: Patron, avisos: string[] }` con el patrón ya corregido al valor válido más cercano. Nada bloquea a la persona. |
| **RN-RE-MOT-08** | Si un patrón derivado de `caja` deja de tener sus cuatro fases iguales, su `patronBaseId` pasa a `personalizado`. |
| **RN-RE-MOT-09** | Dos patrones son iguales si sus cuatro fases coinciden. Se usa para detectar "esto ya está en favoritos". |

`validarPatron(patronParcial) → { valido, patron, avisos }` — corrige y explica, no rechaza.

---

## 6. Motor de ritmo

### 6.1 Archivos

| Archivo | Rol |
|---|---|
| `src/shared/respiracion/motorRitmo.js` | **Nuevo.** Lógica pura, sin DOM, sin timers. Dado un patrón y un tiempo transcurrido, dice en qué fase se está y con qué progreso. |
| `src/shared/respiracion/relojSesion.js` | **Nuevo.** Envuelve el motor en un reloj monotónico basado en `requestAnimationFrame` + `performance.now()`. |
| `src/shared/respiracion/maquinaSesion.js` | **Nuevo.** Máquina de estados de la sesión completa. |
| `src/shared/respiracion/curvas.js` | **Nuevo.** Funciones de suavizado compartidas por visual y sonido. |
| `ritmoRespiracion.js` (SPEC_08) | **Modificado.** Se reescribe por dentro como wrapper sobre `motorRitmo`. Firma pública intacta. |

### 6.2 `motorRitmo.js` — API

```js
/**
 * Resuelve el estado del ritmo en un instante dado. Función pura.
 * @param {Patron} patron
 * @param {number} msTranscurridos  desde el inicio del ciclo 1
 * @returns {EstadoRitmo}
 */
export function resolverEstado(patron, msTranscurridos)

/**
 * @typedef {Object} EstadoRitmo
 * @property {'inhalar'|'retenerLleno'|'exhalar'|'retenerVacio'} fase
 * @property {number} progresoFase     0..1 lineal dentro de la fase
 * @property {number} progresoSuave    0..1 con la curva de §6.4 aplicada
 * @property {number} amplitud         0..1 · 0 = pulmón vacío, 1 = pulmón lleno
 * @property {number} msRestantesFase
 * @property {number} cicloActual      empieza en 1
 * @property {number} progresoCiclo    0..1 dentro del ciclo completo
 */

export function duracionCiclo(patron)          // → ms
export function fasesDelCiclo(patron)          // → [{fase, msInicio, msFin}] omitiendo fases de 0
export function validarPatron(patronParcial)   // → {valido, patron, avisos}
export function sonIguales(a, b)               // → boolean
```

### 6.3 `amplitud` es el contrato con la UI

`amplitud` es el valor que **tanto el círculo como la línea como el volumen del sonido** consumen. Un único número entre 0 y 1 que representa cuán lleno está el pulmón.

| Fase | amplitud |
|---|---|
| `inhalar` | sube de 0 → 1 siguiendo la curva |
| `retenerLleno` | constante en 1 |
| `exhalar` | baja de 1 → 0 siguiendo la curva |
| `retenerVacio` | constante en 0 |

Que visual y sonido lean el mismo número es lo que garantiza la sincronía perfecta que PBC presume. **Ningún consumidor puede calcular su propia amplitud.**

### 6.4 Curvas de suavizado

`curvas.js`

```js
// Coseno elevado. Arranque y llegada suaves, tránsito continuo.
// Es lo que hace que el movimiento se sienta orgánico y no mecánico.
export const cosenoElevado = t => (1 - Math.cos(Math.PI * t)) / 2;

export const lineal = t => t;
```

- `inhalar` y `exhalar` usan `cosenoElevado`.
- Las fases de retención no aplican curva (amplitud constante).
- **RN-RE-MOT-10:** la curva es un parámetro del motor, no una constante escondida. `resolverEstado(patron, ms, { curva })`, con `cosenoElevado` por defecto.

### 6.5 `relojSesion.js` — sin deriva

```js
export function crearReloj({ alActualizar, alCambiarFase }) → { iniciar, pausar, reanudar, detener, obtenerMs }
```

Reglas:

| Regla | Enunciado |
|---|---|
| **RN-RE-MOT-11** | El tiempo se calcula **siempre** como `performance.now() - t0 - msPausados`. Nunca acumulando deltas por frame. |
| **RN-RE-MOT-12** | `alActualizar` se dispara por `requestAnimationFrame`. `alCambiarFase` se dispara solo cuando la fase resuelta cambia respecto al frame anterior. |
| **RN-RE-MOT-13** | Al pausar se congela `msPausados`; al reanudar se retoma en el **mismo punto exacto** de la fase. No se reinicia el ciclo. |
| **RN-RE-MOT-14** | `document.visibilitychange` → oculto: el reloj **no** se pausa, pero `alActualizar` deja de emitir (rAF ya no corre). Al volver, se recalcula desde `performance.now()` y la posición es correcta. Nada de saltos ni de recuperar frames perdidos. |
| **RN-RE-MOT-15** | `detener()` libera el rAF y anula callbacks. Llamarlo dos veces no rompe nada. |

### 6.6 `maquinaSesion.js` — estados

```
inactivo ──iniciar()──> acomodando ──(auto)──> activo
                                                 │
                                    pausar() ◄───┤───► reanudar()
                                                 │
                                        pausado ─┘
                                                 │
   activo ──llegóAlLímite()──> cerrando ──(fin del ciclo)──> completado
   cualquiera ──terminar()──> cerrando ──> completado ──> inactivo
```

| Estado | Qué pasa |
|---|---|
| `inactivo` | Configuración visible, nada corriendo. |
| `acomodando` | **3,0 s de preparación.** Mejora frente a PBC, que arranca en seco. Copy: "Acomódate. Empezamos en 3…". Cuenta regresiva 3-2-1. Saltable con un toque. Sin audio guía; el ambiente sí entra con fade-in. |
| `activo` | Corre el ritmo. |
| `pausado` | Ritmo congelado en su punto exacto. El sonido ambiente **baja a 30 %**, no se corta (cortarlo sobresalta). |
| `cerrando` | Se alcanzó el límite pero se está terminando el ciclo en curso. |
| `completado` | Pantalla de cierre. Fade-out de audio de 3,0 s. |

| Regla | Enunciado |
|---|---|
| **RN-RE-MOT-16** | **El ciclo en curso siempre se completa.** Si el límite (ciclos o tiempo) se alcanza a mitad de una exhalación, se pasa a `cerrando` y se termina esa exhalación y su retención. Cortar a media respiración es lo contrario de lo que la herramienta hace. |
| **RN-RE-MOT-17** | Excepción a RN-RE-MOT-16: `terminar()` explícito por la persona corta de inmediato, con fade-out de 800 ms. Su decisión manda. |
| **RN-RE-MOT-18** | En modo abierto nunca se entra a `cerrando` por sí solo. Solo por `terminar()`. |
| **RN-RE-MOT-19** | La transición `acomodando → activo` es automática a los 3,0 s, o inmediata si la persona toca la pantalla. |

### 6.7 Modos de duración

```js
/**
 * @typedef {Object} Duracion
 * @property {'ciclos'|'minutos'|'abierta'} modo
 * @property {number|null} valor
 */
```

| Modo | Valores ofrecidos | Rango libre | Nota |
|---|---|---|---|
| `ciclos` | 3, 5, 10, 20 | 1–99 | El más honesto para patrones largos |
| `minutos` | 1, 3, 5, 10, 15, 20 | 1–60 | **Por defecto: 3 minutos** |
| `abierta` | — | — | Termina cuando la persona quiere |

- **RN-RE-MOT-20:** en modo `minutos`, el límite se evalúa al **final de cada ciclo**, no en tiempo continuo. Combinado con RN-RE-MOT-16, la sesión real dura entre `valor` y `valor + un ciclo`. Se comunica en el copy como "unos 3 minutos", nunca como una promesa exacta.
- **RN-RE-MOT-21:** el tiempo en `acomodando` **no** cuenta para el límite.

---

## 7. Copy

Namespace nuevo `respiracion` en `src/copy/index.js`. **Cero strings fuera de aquí.**

### 7.1 Voz

- Es **Strivo madre**, no Lumia ni Formia. Sobria, cálida, sin adornos.
- **Prohibido:** "ansiedad", "estrés", "pánico", "terapia", "trastorno", "cura", "tratamiento", "síntoma". Strivo es un refugio, no una clínica. Este es el desvío más importante frente a PBC, que se posiciona explícitamente como herramienta para la ansiedad.
- **Prohibido:** "rendimiento", "optimiza", "productividad", "maximiza".
- **Prohibido:** "elle" (regla heredada de P2A). Neutro por redacción.
- Segunda persona, sin imperativos duros. "Cuando quieras", no "¡Empieza ya!".
- Añadir los términos prohibidos nuevos a `npm run lint:copy`.

### 7.2 Strings requeridos

```js
respiracion: {
  titulo: 'Respiración',
  subtitulo: 'Un momento para bajar el ritmo',

  patrones: {
    calma553:        { nombre: 'Calma 5-5-3',            descripcion: 'El ritmo de Strivo. Inhalas, exhalas, y dejas una pausa antes de volver a empezar.' },
    caja:            { nombre: 'Respiración en caja',    descripcion: 'Cuatro tiempos iguales. Ordena la cabeza cuando anda dispersa.' },
    cuatroSieteOcho: { nombre: '4-7-8',                  descripcion: 'Exhalación larga después de una retención. Ayuda a soltar.' },
    exhalacionLarga: { nombre: 'Exhalación larga',       descripcion: 'Sueltas el doble de lo que tomas. Sencillo y hondo.' },
    coherencia:      { nombre: 'Coherencia 5-5',         descripcion: 'Simétrica y sostenida. Buena para quedarse un rato.' },
    entradaSuave:    { nombre: 'Entrada suave 4-6',      descripcion: 'Sin retenciones. Si es tu primera vez, empieza aquí.' },
    personalizado:   { nombre: 'A tu medida',            descripcion: 'Ajusta cada tiempo como te acomode.' }
  },

  fases: {
    inhalar: 'Inhala',
    retenerLleno: 'Sostén',
    exhalar: 'Exhala',
    retenerVacio: 'Descansa'
  },

  // Etiquetas para lector de pantalla (más explícitas que las visuales)
  fasesAccesibles: {
    inhalar: 'Inhala durante {segundos} segundos',
    retenerLleno: 'Sostén el aire durante {segundos} segundos',
    exhalar: 'Exhala durante {segundos} segundos',
    retenerVacio: 'Descansa durante {segundos} segundos'
  },

  acomodo: {
    titulo: 'Acomódate',
    subtitulo: 'Suelta los hombros. Empezamos en un momento.',
    saltar: 'Empezar ya'
  },

  duracion: {
    titulo: '¿Cuánto tiempo?',
    modoCiclos: 'Por respiraciones',
    modoMinutos: 'Por tiempo',
    modoAbierta: 'Sin final',
    ciclos: '{n} respiraciones',
    minutos: 'Unos {n} minutos',
    abierta: 'Hasta que quieras',
    aproximado: 'Terminamos al cerrar la última respiración, así que puede alargarse unos segundos.'
  },

  controles: {
    empezar: 'Empezar',
    pausar: 'Pausar',
    reanudar: 'Seguir',
    terminar: 'Terminar',
    salir: 'Salir'
  },

  cierre: {
    titulo: 'Listo',
    resumenCiclos: 'Respiraste {n} veces.',
    resumenTiempo: '{n} minutos contigo.',
    repetir: 'Otra vez',
    volverAlInicio: 'Volver al inicio'
  },

  seguridad: {
    aviso: 'Si en algún momento te mareas o te incomoda, para y respira normal. No hay nada que ganar aguantando.',
    entendido: 'Entendido'
  },

  vacio: {
    sinFavoritos: 'Todavía no guardas ninguna. Cuando encuentres un ritmo que te acomode, guárdalo aquí.'
  }
}
```

### 7.3 Interpolación

`{n}`, `{segundos}`. Usar el mecanismo de interpolación que ya exista en `copy/index.js`. Si no existe, crear `interpolar(plantilla, valores)` en `src/lib/` y reportarlo.

### 7.4 Nota de seguridad

- **RN-RE-COPY-01:** `respiracion.seguridad.aviso` se muestra **una sola vez**, la primera vez que la persona entra a Respiración. Se persiste `avisoSeguridadVisto: true`.
- **RN-RE-COPY-02:** además queda siempre accesible desde un ícono de información en la pantalla de configuración.
- **RN-RE-COPY-03:** es una tarjeta calmada, descartable con un toque. **No** es un modal bloqueante, **no** tiene lenguaje médico, **no** pide aceptar términos.

---

## 8. Capa de datos

### 8.1 Stores nuevos

Todos bajo el prefijo `breathing`. Local-first con IndexedDB; espejo en Firestore por el mecanismo de sync que ya exista.

```
breathing_preferencias   (singleton, clave fija 'unica')
breathing_favoritos      (colección, keyPath 'id')
breathing_recientes      (colección, keyPath 'id', máx. 5)
breathing_sesiones       (colección, keyPath 'id', retención 90 días)
```

### 8.2 `breathing_preferencias`

```js
{
  clave: 'unica',
  schemaVersion: 1,
  ultimoPatronId: 'calma-553',
  ultimoPatron: { inhalar:50, retenerLleno:0, exhalar:50, retenerVacio:30 },
  visualPreferida: 'circulo',          // 'circulo' | 'linea'
  sonidoAmbienteId: null,              // null = silencio
  volumenAmbiente: 0.6,                // 0..1
  guiaSonoraActiva: false,             // ⚠ false por defecto (§6.12 del blueprint)
  volumenGuia: 0.5,
  duracionPorDefecto: { modo: 'minutos', valor: 3 },
  mantenerPantallaEncendida: true,
  avisoSeguridadVisto: false,
  actualizadoEn: '2026-08-20T00:00:00.000Z'
}
```

- **RN-RE-DAT-01:** `guiaSonoraActiva` arranca en `false`. Es la misma regla que corrigió el bug de `initShared` en SPEC_08: **silencio por defecto**. Cualquier semilla que la ponga en `true` es un bug.
- **RN-RE-DAT-02:** al terminar una sesión se persiste la configuración usada como `ultimo*`, para que la siguiente entrada retome el estado. PBC hace esto y es lo correcto: nadie quiere reconfigurar cada vez.

### 8.3 `breathing_favoritos`

```js
{
  id: 'uuid-v4',
  nombre: 'Antes de dormir',            // 1..40 caracteres
  patron: { inhalar:40, retenerLleno:70, exhalar:80, retenerVacio:0 },
  patronBaseId: 'cuatro-siete-ocho',    // o 'personalizado'
  visual: 'circulo',
  sonidoAmbienteId: 'lluvia',
  volumenAmbiente: 0.6,
  guiaSonoraActiva: false,
  volumenGuia: 0.5,
  duracion: { modo: 'minutos', valor: 10 },
  creadoEn: ISO,
  actualizadoEn: ISO,
  ultimoUsoEn: ISO | null,
  usos: 0
}
```

Reglas de negocio completas en SPEC_15. Aquí solo el esquema, el store, y las funciones CRUD.

### 8.4 `breathing_recientes`

```js
{ id, patron, patronBaseId, visual, sonidoAmbienteId, duracion, usadoEn: ISO }
```

- **RN-RE-DAT-03:** máximo 5. Al insertar el sexto se elimina el más antiguo por `usadoEn`.
- **RN-RE-DAT-04:** si la configuración entrante es idéntica a una reciente (mismo patrón por `sonIguales` + misma visual + mismo sonido), se actualiza `usadoEn` en lugar de duplicar.
- **RN-RE-DAT-05:** una configuración que ya está en favoritos **no** entra en recientes. Evita listas redundantes.

### 8.5 `breathing_sesiones`

Registro mínimo, solo para alimentar `recientes` y `ultimoUsoEn`.

```js
{ id, iniciadaEn: ISO, patronBaseId, ciclosCompletados: int, segundosActivos: int, terminadaPorPersona: boolean }
```

- **RN-RE-DAT-06:** se purgan los registros con más de 90 días al abrir la app.
- **RN-RE-DAT-07:** **no se derivan rachas, metas ni logros.** Coherente con la decisión del 19 de agosto de eliminar "logros" como campo propio. Es telemetría local, no gamificación.

### 8.6 API de datos

`src/breathing/data/repositorioRespiracion.js`

```js
leerPreferencias()                    → Promise<Preferencias>
guardarPreferencias(parcial)          → Promise<Preferencias>
listarFavoritos()                     → Promise<Favorito[]>   // orden: ultimoUsoEn desc, luego creadoEn desc
crearFavorito(datos)                  → Promise<Favorito>
actualizarFavorito(id, parcial)       → Promise<Favorito>
eliminarFavorito(id)                  → Promise<void>
registrarUsoFavorito(id)              → Promise<void>
listarRecientes()                     → Promise<Reciente[]>
registrarReciente(config)             → Promise<void>
registrarSesion(datos)                → Promise<void>
purgarSesionesViejas()                → Promise<number>
```

- **RN-RE-DAT-08:** toda función devuelve una Promise y **nunca lanza** por datos ausentes. Si no hay preferencias, `leerPreferencias()` siembra y devuelve las de fábrica.
- **RN-RE-DAT-09:** ninguna función de este archivo importa nada de `lumia/` ni `formia/`.
- **RN-RE-DAT-10:** escritura optimista: se escribe a IndexedDB y se resuelve; el espejo a Firestore es asíncrono y su fallo no rompe la sesión. Sin conexión, la herramienta funciona completa.

---

## 9. Casos límite

| # | Caso | Comportamiento exigido |
|---|---|---|
| 9.1 | Patrón con ambas retenciones en 0 | Válido. `fasesDelCiclo` omite las fases de duración 0. La visual pasa de inhalar a exhalar sin escalón. |
| 9.2 | Ciclo de 6,0 s (mínimo) | Válido. La UI no debe saturarse de cambios de fase; `alCambiarFase` sigue disparando una vez por fase. |
| 9.3 | Pestaña oculta 10 minutos | Al volver, `resolverEstado` devuelve la posición correcta calculada por RN-RE-MOT-11. Ni salto visual brusco ni recuperación de frames. Ver §9.4. |
| 9.4 | Pantalla bloqueada | **Limitación real de PWA.** El navegador suspende rAF y puede suspender el `AudioContext`. Mitigación: Wake Lock API mientras la sesión está activa (`mantenerPantallaEncendida`), con degradación silenciosa donde no exista. Al recuperar el foco, si `AudioContext.state === 'suspended'`, reanudar. **Si la ausencia total pasó de un ciclo completo, pasar la sesión a `pausado`** en lugar de fingir que siguió. Honestidad por encima de continuidad. |
| 9.5 | Reloj del sistema cambia | Irrelevante: `performance.now()` es monotónico y no se ve afectado. Esta es la razón de no usar `Date.now()`. |
| 9.6 | `terminar()` durante `acomodando` | Va directo a `inactivo`. No se registra sesión ni reciente. |
| 9.7 | Sesión de 0 ciclos completados | No se registra en `sesiones` ni en `recientes`. No hubo sesión. |
| 9.8 | IndexedDB no disponible (modo privado) | Todo opera en memoria durante la sesión. Se avisa una sola vez, sin alarmismo. Nada bloquea. |
| 9.9 | `valor: 0` en modo `ciclos` o `minutos` | La validación lo eleva al mínimo (1) y anota el aviso. Nunca error. |
| 9.10 | Dos sesiones a la vez (doble montaje en React Strict Mode) | `crearReloj` es idempotente: una segunda llamada a `iniciar()` sin `detener()` previo es un no-op que registra `console.warn` en dev. |
| 9.11 | `prefers-reduced-motion: reduce` | El motor **no cambia**. Sigue emitiendo estado. Quien se adapta es la capa visual (SPEC_14). El motor no conoce preferencias de presentación. |

---

## 10. Archivos

### Crear

```
src/shared/respiracion/motorRitmo.js
src/shared/respiracion/relojSesion.js
src/shared/respiracion/maquinaSesion.js
src/shared/respiracion/curvas.js
src/breathing/data/catalogoPatrones.js
src/breathing/data/repositorioRespiracion.js
src/breathing/data/esquema.js
```

Tests espejo en la convención que use el repo (`__tests__/` o `*.test.js` — confirmar en el Paso 0).

### Modificar

```
src/lib/db.js                 → versión de esquema + 4 stores nuevos, migración aditiva
src/copy/index.js             → namespace `respiracion`
.eslintrc / eslint.config.js  → matriz de imports de §4.2
scripts de lint:copy          → nuevos términos prohibidos de §7.1
CLAUDE.md                     → sección "Respiración" con las reglas RN-RE-*
```

### No tocar

```
src/components/lumia/**       ✗
src/components/formia/**      ✗
Tests existentes de SPEC_08   ✗ (red de regresión)
```

---

## 11. Criterios de aceptación

Verificables uno por uno.

| # | Criterio |
|---|---|
| 1 | Los 447 tests previos siguen verdes, sin editar ni borrar ninguno. |
| 2 | `resolverEstado` devuelve la fase y amplitud correctas para los 6 presets, evaluado en al menos 12 puntos por ciclo. |
| 3 | La suma de las fases devueltas por `fasesDelCiclo` es exactamente `duracionCiclo(patron)`, sin error de redondeo, para los 6 presets. |
| 4 | `amplitud` es continua: entre dos instantes separados 16 ms, la variación nunca supera 0,08 en ningún preset. |
| 5 | `amplitud` vale exactamente 1 durante toda `retenerLleno` y exactamente 0 durante toda `retenerVacio`. |
| 6 | `validarPatron` corrige y nunca lanza, para: valores negativos, cero en inhalar, 300 en una fase, decimales, `null`, `undefined`, `{}`. |
| 7 | Un patrón `caja` editado fase por fase queda con `patronBaseId: 'personalizado'` (RN-RE-MOT-08). |
| 8 | El reloj no deriva: simulados 10 minutos de sesión, la diferencia entre tiempo esperado y `obtenerMs()` es < 50 ms. |
| 9 | Pausar y reanudar retoma la misma fase con el mismo `progresoFase` (± 0,02). |
| 10 | Con límite alcanzado a mitad de ciclo, la máquina entra a `cerrando` y `completado` llega solo al terminar el ciclo (RN-RE-MOT-16). |
| 11 | `terminar()` explícito corta de inmediato sin esperar al ciclo (RN-RE-MOT-17). |
| 12 | `acomodando` dura 3,0 s exactos, es saltable, y su tiempo no cuenta al límite (RN-RE-MOT-21). |
| 13 | `leerPreferencias()` sobre una base vacía siembra los valores de fábrica con `guiaSonoraActiva: false` (RN-RE-DAT-01). |
| 14 | `recientes` nunca supera 5 elementos y descarta por `usadoEn` más antiguo. |
| 15 | Una configuración presente en favoritos no aparece en recientes (RN-RE-DAT-05). |
| 16 | La migración de IndexedDB no altera ningún dato previo: test que siembra datos de Lumia y Formia, migra, y verifica que siguen intactos. |
| 17 | `npm run lint` verde con la matriz de imports nueva. Un import de prueba `breathing/ → lumia/` es rechazado por el linter. |
| 18 | `npm run lint:copy` verde. Un string con "ansiedad" en `copy/index.js` es rechazado. |
| 19 | Ningún archivo bajo `src/breathing/**` ni `src/shared/respiracion/**` contiene un string literal visible. Test que recorre los archivos y falla ante literales fuera de `copy/`. |
| 20 | `npm run build` verde. |
| 21 | Con IndexedDB simulado como no disponible, el motor y la máquina de estados operan completos en memoria (caso 9.8). |
| 22 | `crearReloj` es idempotente ante doble `iniciar()` (caso 9.10). |

**Meta de tests nuevos: 90–110.** Total esperado tras SPEC_13: **~540 verdes.**

---

## 12. Verificación

```bash
npm test
npm run lint
npm run lint:copy
npm run lint:contraste
npm run format:check
npm run build
```

Los seis en verde. Reportar el conteo de tests antes y después.

---

## 13. Definición de hecho

- [ ] Paso 0 reportado y aprobado
- [ ] Cuatro puntos de §4 confirmados
- [ ] Los seis comandos de §12 en verde
- [ ] 22 criterios de aceptación verificados uno por uno, con evidencia
- [ ] `CLAUDE.md` actualizado con las reglas RN-RE-*
- [ ] Commit hecho, **sin push** — el push lo hace la persona

**Formato de reporte al terminar:** qué se creó, qué se modificó, conteo de tests antes/después, criterios verificados, cualquier desvío del spec y por qué.
