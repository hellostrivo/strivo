# SPEC_15 — Respiración: sonido ambiente, guía sonora y favoritos

**Proyecto:** Strivo · **Rama:** `phase-1-lumia-formia` · **Fase:** 1C — Respiración
**Depende de:** SPEC_13 (motor y datos), SPEC_14 (visuales)
**Bloquea a:** SPEC_16
**Alcance:** capa de audio + gestión de configuraciones guardadas. Sin navegación ni pantallas de Home.

---

## 0. Encuadre

Dos sistemas independientes que comparten pantalla de configuración:

- **Sonido ambiente** — el fondo continuo (lluvia, olas, cristales…). No marca el ritmo.
- **Guía sonora** — los pulsos sincronizados con inhalar y exhalar. Sí marca el ritmo. Ya existe de SPEC_08.
- **Favoritos** — guardar una combinación completa con nombre.

En *Pocket Breath Coach*, los sonidos son lo más elogiado ("el gong, los sonidos de fondo son exactamente lo que buscaba") y también el principal muro de pago: los buenos están detrás de la suscripción. **En Strivo todos están disponibles.**

**Lo que mejoramos frente a PBC:**
1. Sin muro de pago ni catálogo bloqueado.
2. Al pausar, el ambiente baja de volumen; no se corta en seco (cortarlo sobresalta, justo lo contrario del propósito).
3. Fade-in y fade-out siempre; ningún sonido entra o sale de golpe.
4. Los favoritos guardan **la configuración completa**, no solo el patrón: visual, sonido, volúmenes y duración.
5. Detección de duplicados: no puedes guardar dos veces lo mismo con otro nombre y quedarte con una lista confusa.

---

## 1. Estrategia de sonido — ✅ DECIDIDO (20 ago 2026)

> ✅ **Decisión tomada: síntesis procedural al 100 %.** Cinco sonidos más silencio. **Bosque queda fuera de esta ronda.**
>
> **Sonidos a implementar:** `silencio`, `lluvia`, `olas`, `viento`, `cristales`, `fuego`.
>
> **Prohibido en SPEC_13–16:** cargar archivos de audio, añadir dependencias de audio, o incluir cualquier binario de sonido en el repo. Si alguna fuente no alcanza la calidad esperada, **se reporta y se deja fuera** — no se resuelve metiendo un archivo.
>
> **Bosque:** documentar en `CLAUDE.md` como deuda consciente. Si más adelante resulta indispensable, entra como el primer archivo de audio real y se define ahí la estrategia de precaché y licencia. Hoy no.

El razonamiento que llevó a esta decisión se conserva abajo, porque explica los parámetros de síntesis de §3.3 y por qué Bosque no está.

**¿Los sonidos ambiente se sintetizan por Web Audio o se cargan como archivos de audio?**

| | Síntesis procedural | Archivos de audio |
|---|---|---|
| Peso en la PWA | 0 KB | 1,5–4 MB por sonido en loop de calidad |
| Funciona sin conexión | Siempre | Solo si están precacheados |
| Licencias | Ninguna que resolver | Hay que licenciar o comprar cada uno |
| Calidad percibida | Excelente en unos, mediocre en otros (ver tabla) | Excelente en todos |
| Coherencia con el repo | Alta: SPEC_08 ya usa Web Audio | Nueva infraestructura de carga y caché |
| Variación | Infinita, nunca se repite | Se nota el punto de bucle |

**Evaluación honesta de cada sonido por síntesis:**

| Sonido | Viabilidad procedural | Técnica |
|---|---|---|
| **Lluvia** | ✅ Excelente | Ruido rosa filtrado paso-bajo + gotas aleatorias (impulsos filtrados) |
| **Olas** | ✅ Excelente | Ruido rosa con LFO de 0,08 Hz sobre filtro y ganancia |
| **Viento** | ✅ Muy buena | Ruido paso-banda con LFO lento sobre frecuencia central y Q |
| **Cristales** | ✅ Excelente | Campanas sinusoidales con decaimiento largo, alturas de una escala pentatónica, disparo aleatorio |
| **Bosque** | ⚠️ **Mediocre** | Lecho de ruido + cantos sintetizados. Los pájaros sintéticos suenan sintéticos. Es el más difícil de falsificar |
| **Fuego / chimenea** | ✅ Buena | Ruido marrón + crepitaciones aleatorias |

Razones de la decisión: cero peso añadido a la PWA, cero licencias que resolver, funcionamiento offline garantizado, variación infinita sin punto de bucle audible, y coherencia con la infraestructura de Web Audio que SPEC_08 ya dejó en el repo.

Bosque es el único que la síntesis no resuelve bien: un lecho de ruido sale convincente, pero los cantos de pájaro sintetizados suenan sintéticos y romperían la sensación de refugio. Vale más no tenerlo que tenerlo mal.

- **RN-RE-SND-00:** el `dist` no crece por activos de audio. El delta del bundle tras SPEC_15 debe ser solo código. Reportarlo en la definición de hecho.

---

## 2. Otras confirmaciones previas

**2.1 Reutilización de `audioRespiracion.js` (SPEC_08).** Ese módulo ya crea y gestiona un `AudioContext` para la guía sonora. Este spec añade una segunda fuente (el ambiente).
→ **Regla:** un solo `AudioContext` en toda la app. Extraer su gestión a `src/shared/audio/contextoAudio.js` como singleton, y que tanto `audioRespiracion.js` como el motor de ambiente lo consuman. Reportar la estructura actual antes de refactorizar. Los tests de SPEC_08 son la red de regresión.

**2.2 Políticas de autoplay.** Ningún navegador permite iniciar audio sin gesto del usuario. El `AudioContext` debe crearse o reanudarse **dentro del manejador del toque en "Empezar"**, nunca al montar el componente. Confirmar cómo lo resuelve hoy SPEC_08 y replicarlo.

**2.3 Nombres de archivo.** El repo usa español en camelCase para librerías y PascalCase para componentes. Confirmar y ajustar si difiere.

---

## 3. Sonido ambiente

### 3.1 Catálogo

`src/breathing/data/catalogoSonidos.js`

| id | Copy | Síntesis |
|---|---|---|
| `silencio` | Silencio | ninguna — **valor por defecto** |
| `lluvia` | Lluvia | ruido rosa filtrado + gotas |
| `olas` | Olas | ruido rosa con LFO 0,08 Hz |
| `viento` | Viento | paso-banda con LFO sobre frecuencia y Q |
| `cristales` | Cristales | campanas pentatónicas aleatorias |
| `fuego` | Fuego | ruido marrón + crepitaciones |

- **RN-RE-SND-01:** `silencio` es el valor de fábrica. Coherente con "silencio por defecto" (§6.12 del blueprint) y con el bug que se corrigió en SPEC_08. Nadie debería recibir sonido inesperado al abrir.
- **RN-RE-SND-02:** `silencio` no es la ausencia de una opción: es una opción explícita en la lista, seleccionable. Que aparezca listada le da permiso a la persona de elegirlo.

### 3.2 Arquitectura de audio

```
src/shared/audio/contextoAudio.js          // singleton del AudioContext (refactor de SPEC_08)
src/shared/audio/ruido.js                  // generadores de ruido blanco/rosa/marrón reutilizables
src/breathing/audio/motorAmbiente.js       // orquestador de sonidos ambiente
src/breathing/audio/fuentes/lluvia.js
src/breathing/audio/fuentes/olas.js
src/breathing/audio/fuentes/viento.js
src/breathing/audio/fuentes/cristales.js
src/breathing/audio/fuentes/fuego.js
src/breathing/audio/mezclador.js           // ganancias, fades, ducking
```

**Contrato de cada fuente** — todas idénticas, para que el catálogo sea extensible sin tocar el orquestador:

```js
/**
 * @param {AudioContext} ctx
 * @param {AudioNode} destino
 * @returns {{ iniciar():void, detener():void, liberar():void }}
 */
export function crear(ctx, destino)
```

- **RN-RE-SND-03:** `liberar()` desconecta todos los nodos y cancela todos los temporizadores programados. **Ningún nodo sobrevive a una sesión.** Es la misma regla de limpieza que SPEC_08 verificó en su criterio 7.
- **RN-RE-SND-04:** el ruido base se genera **una sola vez** en un `AudioBuffer` de 4 segundos y se reproduce con `loop: true`. Regenerarlo por frame es un error de rendimiento.
- **RN-RE-SND-05:** el bucle de ruido lleva un cruce interno de 200 ms entre su final y su inicio para que el punto de bucle no sea audible.

### 3.3 Parámetros de síntesis

**Lluvia**
```
Lecho:  ruido rosa → paso-bajo 1800 Hz, Q 0,7 → ganancia 0,55
Gotas:  cada 40–180 ms (aleatorio), impulso de 12 ms de ruido blanco
        → paso-banda entre 2200–5200 Hz (aleatorio), Q 8
        → ganancia 0,10–0,28 (aleatorio), decaimiento exponencial 90 ms
```

**Olas**
```
Ruido rosa → paso-bajo con frecuencia modulada por LFO seno 0,08 Hz entre 380 y 1400 Hz
Ganancia modulada por el mismo LFO, desfasada 0,7 rad, entre 0,18 y 0,62
```

**Viento**
```
Ruido rosa → paso-banda, frecuencia modulada por LFO 0,05 Hz entre 300 y 900 Hz
Q modulado por segundo LFO 0,03 Hz entre 1,5 y 6,0
Ganancia 0,45
```

**Cristales**
```
Lecho: ninguno (silencio entre campanas)
Campana: cada 2,5–7,0 s (aleatorio)
  oscilador seno en una de [523,25 · 587,33 · 659,25 · 783,99 · 880,00] Hz (pentatónica en Do)
  + armónico a 2× con ganancia 0,3
  ataque 8 ms, decaimiento exponencial 2,8–4,5 s
  ganancia pico 0,12–0,22
  paneo aleatorio entre −0,4 y +0,4
```

**Fuego**
```
Lecho: ruido marrón → paso-bajo 900 Hz → ganancia 0,32
Crepitación: cada 80–500 ms, impulso 6 ms → paso-banda 1200–3800 Hz, Q 12
             ganancia 0,06–0,20, decaimiento 40 ms
```

- **RN-RE-SND-06:** todos los eventos aleatorios se programan con **lookahead de 200 ms** vía `ctx.currentTime`, nunca con `setTimeout` para disparar el sonido. `setTimeout` no tiene precisión de audio.
- **RN-RE-SND-07:** ningún sonido ambiente contiene un pulso periódico regular perceptible. **El ambiente no puede competir con el ritmo de la respiración.** Esta es la razón de que todos los intervalos sean aleatorios.

### 3.4 Mezclador y fades

Grafo:
```
fuenteAmbiente → ganAmbiente ─┐
                              ├→ ganMaestra → destination
guíaSonora     → ganGuia    ──┘
```

| Regla | Enunciado |
|---|---|
| **RN-RE-SND-08** | Todo cambio de ganancia usa `setTargetAtTime` o rampas, **nunca** asignación directa a `.value`. Un salto de ganancia produce un chasquido. |
| **RN-RE-SND-09** | Fade-in al empezar: 2,0 s. El ambiente entra durante `acomodando`, para que ya esté presente cuando arranca el primer inhalar. |
| **RN-RE-SND-10** | Fade-out al completar: 3,0 s, empezando al entrar en `completado`. |
| **RN-RE-SND-11** | Fade-out por `terminar()` explícito: 800 ms. Más rápido, porque la persona decidió irse. |
| **RN-RE-SND-12** | Al **pausar**: el ambiente baja a **30 %** de su volumen en 500 ms. **No se detiene.** Cortarlo sobresalta. Al reanudar, sube a 100 % en 500 ms. |
| **RN-RE-SND-13** | Al pausar, la guía sonora **sí se silencia por completo** (es marcador de ritmo; sin ritmo no tiene sentido). |
| **RN-RE-SND-14** | Cambio de sonido ambiente en vivo: cruce de 1,2 s. El saliente baja mientras el entrante sube. Nunca hay silencio intermedio. |
| **RN-RE-SND-15** | `ganMaestra` respeta el volumen del sistema; la app no intenta forzar volumen. |

### 3.5 Volúmenes

| Control | Rango | Paso | Fábrica |
|---|---|---|---|
| Ambiente | 0–100 % | 5 % | 60 % |
| Guía | 0–100 % | 5 % | 50 % |

- **RN-RE-SND-16:** poner el ambiente en 0 % **no** equivale a `silencio`: los nodos siguen vivos y subir el control vuelve a oírse de inmediato. Elegir `silencio` sí libera los nodos.
- **RN-RE-SND-17:** el cambio de volumen se aplica con rampa de 120 ms, no instantáneo.

### 3.6 Guía sonora

Reutiliza `audioRespiracion.js` de SPEC_08 sin rediseñarlo.

- **RN-RE-SND-18:** desactivada de fábrica (`guiaSonoraActiva: false`).
- **RN-RE-SND-19:** se dispara en el **inicio** de `inhalar` y en el **inicio** de `exhalar`. En las retenciones no suena: el silencio marca la pausa.
- **RN-RE-SND-20:** el disparo se programa desde el cambio de fase que emite el motor (`alCambiarFase`), no desde un temporizador propio. Fuente de verdad única.
- **RN-RE-SND-21:** si SPEC_08 usa dos timbres distintos para inhalar y exhalar, se conservan. Si usa uno solo, dejarlo así y anotarlo como posible mejora futura. No rediseñar aquí.

### 3.7 Ciclo de vida y limpieza

| Regla | Enunciado |
|---|---|
| **RN-RE-SND-22** | Al desmontar la pantalla de Respiración: `liberar()` sobre todas las fuentes, desconexión de todos los nodos, cancelación de todo lo programado. Sin fugas. |
| **RN-RE-SND-23** | `visibilitychange → oculto`: el audio **sigue sonando** (es deseable: la persona puede cerrar los ojos o guardar el teléfono). No se suspende el contexto. |
| **RN-RE-SND-24** | Si el navegador suspende el `AudioContext` por su cuenta, al volver el foco se llama `resume()` y se restablece el volumen con una rampa de 400 ms, no de golpe. |
| **RN-RE-SND-25** | Al montar se declara la sesión con **Media Session API** (`navigator.mediaSession`) con título, y las acciones `play`/`pause` mapeadas a la máquina de estados. Así los controles del sistema y los audífonos funcionan. Degradación silenciosa donde no exista la API. |
| **RN-RE-SND-26** | Si otra app toma el audio (llamada entrante), la sesión pasa a `pausado`. Al recuperar el foco **no se reanuda sola**: se queda en pausa y la persona decide. Reanudar sola sería invasivo. |

---

## 4. Favoritos

### 4.1 Qué guarda un favorito

La **configuración completa**, no solo el patrón. Esa es la mejora sobre PBC: guardar "4-7-8" sin el sonido y la duración con que te funcionó deja el trabajo a medias.

```js
{
  id, nombre,
  patron: { inhalar, retenerLleno, exhalar, retenerVacio },
  patronBaseId,
  visual, sonidoAmbienteId, volumenAmbiente,
  guiaSonoraActiva, volumenGuia,
  duracion: { modo, valor },
  creadoEn, actualizadoEn, ultimoUsoEn, usos
}
```

Esquema y CRUD ya existen de SPEC_13. Este spec añade las **reglas de negocio y la interfaz**.

### 4.2 Reglas

| Regla | Enunciado |
|---|---|
| **RN-RE-FAV-01** | Máximo **20 favoritos**. Al intentar el 21, se explica el límite y se ofrece gestionar la lista. No se borra nada automáticamente. |
| **RN-RE-FAV-02** | Nombre: 1–40 caracteres tras recortar espacios. Vacío → se rechaza el guardado con mensaje, no se guarda "sin nombre". |
| **RN-RE-FAV-03** | Nombre único, comparando sin distinguir mayúsculas y con espacios recortados. Si se repite, se ofrece reemplazar el existente o cambiar el nombre. **Nunca se crea un duplicado silencioso.** |
| **RN-RE-FAV-04** | Al abrir "guardar", el campo llega **prellenado** con un nombre sugerido: el nombre del patrón base, y si ya existe, con un sufijo numérico (`4-7-8`, `4-7-8 2`). Editable y seleccionado, para que escribir encima sea inmediato. |
| **RN-RE-FAV-05** | Si la configuración actual es **idéntica** a un favorito existente (patrón por `sonIguales` + visual + sonido + duración), el botón de guardar se sustituye por una nota: "Ya la tienes guardada como *X*". Sin duplicados. |
| **RN-RE-FAV-06** | Orden de la lista: `ultimoUsoEn` descendente; los nunca usados al final por `creadoEn` descendente. **Sin ordenamiento manual** en esta fase. |
| **RN-RE-FAV-07** | Renombrar es edición en el mismo lugar, sin modal. Al confirmar se revalida contra RN-RE-FAV-02 y 03. |
| **RN-RE-FAV-08** | Eliminar pide confirmación. Tras eliminar, aparece **deshacer durante 6 segundos**. Es un dato que costó configurar; perderlo por un toque accidental es caro. |
| **RN-RE-FAV-09** | Cargar un favorito aplica **toda** su configuración de golpe (patrón, visual, sonido, volúmenes, duración) e incrementa `usos` y `ultimoUsoEn`. |
| **RN-RE-FAV-10** | Cargar un favorito **no inicia la sesión**. Deja todo configurado y la persona pulsa "Empezar". Arrancar solo sería sobresaltar. |
| **RN-RE-FAV-11** | Si tras cargar un favorito se modifica cualquier parámetro, aparece una marca discreta "modificado" y la opción de "Guardar cambios" (actualiza el favorito) o "Guardar como nuevo". **No se sobrescribe en silencio.** |
| **RN-RE-FAV-12** | Un favorito que apunta a un `sonidoAmbienteId` que ya no existe en el catálogo carga con `silencio` y muestra un aviso discreto. No falla. |
| **RN-RE-FAV-13** | Un favorito con un patrón que ya no pasa la validación se corrige con `validarPatron` al cargarlo y se avisa. No se descarta. |

### 4.3 Interfaz

`src/breathing/components/favoritos/`

**`ListaFavoritos.jsx`** — fila por favorito:
```
┌──────────────────────────────────────────────┐
│  Antes de dormir                       ⋯    │
│  4-7-8 · Lluvia · 10 min                     │
└──────────────────────────────────────────────┘
```
- Toque en la fila → cargar (RN-RE-FAV-09).
- Toque en `⋯` → menú: Renombrar · Eliminar.
- Subtítulo generado: `{nombrePatron} · {nombreSonido} · {duracionCorta}`. Se omite el sonido si es `silencio`.
- **RN-RE-FAV-14:** área táctil mínima 44×44 px, y `⋯` con separación suficiente para no confundirse con el toque de carga.

**`DialogoGuardar.jsx`** — hoja inferior, no modal centrado:
- Campo de nombre prellenado y seleccionado.
- Resumen de lo que se va a guardar (las cinco líneas de configuración).
- Botones: Guardar · Cancelar.
- **RN-RE-FAV-15:** `Enter` confirma. `Escape` cancela. En móvil, se abre con el teclado ya desplegado.

**`EstadoVacio.jsx`**
- Copy: `respiracion.vacio.sinFavoritos`.
- **RN-RE-FAV-16:** el estado vacío **no** ofrece un botón de "crear favorito": no se puede crear uno sin una configuración de partida. Solo explica cuándo aparecerán.

**Recientes** — misma fila visual que favoritos, en una sección aparte titulada "Últimas veces", debajo de favoritos. Máximo 5, sin menú `⋯`, con un solo gesto: cargar.
- **RN-RE-FAV-17:** desde una reciente se puede guardar como favorito con un ícono discreto de marcador.

### 4.4 Copy adicional

Añadir al namespace `respiracion` de `src/copy/index.js`:

```js
sonidos: {
  titulo: 'Sonido de fondo',
  silencio:  { nombre: 'Silencio',  descripcion: 'Solo tu respiración.' },
  lluvia:    { nombre: 'Lluvia',    descripcion: 'Constante, sin tormenta.' },
  olas:      { nombre: 'Olas',      descripcion: 'Van y vienen, muy lentas.' },
  viento:    { nombre: 'Viento',    descripcion: 'Entre los árboles, a lo lejos.' },
  cristales: { nombre: 'Cristales', descripcion: 'Notas sueltas que aparecen y se van.' },
  fuego:     { nombre: 'Fuego',     descripcion: 'Chisporroteo bajo.' },
  volumen: 'Volumen',
  guia: 'Sonido que marca el ritmo',
  guiaAyuda: 'Un tono suave al empezar cada inhalación y cada exhalación.',
  volumenGuia: 'Volumen del ritmo'
},

favoritos: {
  titulo: 'Guardadas',
  recientes: 'Últimas veces',
  guardar: 'Guardar esta combinación',
  guardarCambios: 'Guardar cambios',
  guardarComoNueva: 'Guardar como nueva',
  modificado: 'Modificado',
  nombreEtiqueta: '¿Cómo la quieres llamar?',
  nombrePlaceholder: 'Antes de dormir',
  nombreVacio: 'Ponle un nombre para poder encontrarla.',
  nombreLargo: 'Máximo 40 caracteres.',
  nombreRepetido: 'Ya tienes una con ese nombre.',
  reemplazar: 'Reemplazar la anterior',
  yaGuardada: 'Ya la tienes guardada como «{nombre}».',
  limite: 'Puedes guardar hasta 20. Borra alguna que ya no uses para dejar lugar.',
  renombrar: 'Cambiar el nombre',
  eliminar: 'Eliminar',
  confirmarEliminar: '¿Eliminar «{nombre}»?',
  eliminada: 'Eliminada',
  deshacer: 'Deshacer',
  sonidoNoDisponible: 'El sonido de esta combinación ya no está. La cargamos en silencio.'
}
```

---

## 5. Pantalla de configuración de sonido

`src/breathing/components/PanelSonido.jsx`

- Lista de los 6 sonidos como tarjetas seleccionables (una sola selección).
- **RN-RE-SND-27:** tocar un sonido lo **reproduce de inmediato como vista previa**, con fade-in de 800 ms, incluso con la sesión en `inactivo`. Elegir un sonido a ciegas por su nombre es adivinar. La vista previa se detiene al salir del panel o a los 20 s.
- **RN-RE-SND-28:** la vista previa respeta el `volumenAmbiente` configurado, para que se oiga como se va a oír.
- **RN-RE-SND-29:** el primer toque en cualquier sonido es el gesto de usuario que crea o reanuda el `AudioContext` (§2.2).
- Deslizadores de volumen con etiqueta accesible y valor en porcentaje.
- Interruptor de guía sonora, con su texto de ayuda.

---

## 6. Casos límite

| # | Caso | Comportamiento |
|---|---|---|
| 6.1 | `AudioContext` no soportado | Toda la sección de sonido se oculta; la respiración funciona en silencio con visual. Aviso una sola vez, sin alarma. Nada bloquea. |
| 6.2 | Autoplay bloqueado pese al gesto | Se detecta `ctx.state === 'suspended'` tras `resume()` y se muestra un toque para activar el sonido. La sesión visual no se detiene por eso. |
| 6.3 | Cambiar de sonido 5 veces en 2 segundos | Cada cruce cancela el anterior. Nunca se acumulan fuentes. Test que cuenta nodos vivos. |
| 6.4 | Sesión de 60 minutos | Sin fugas: el número de nodos de audio al minuto 60 es igual que al minuto 1. |
| 6.5 | Llamada entrante | RN-RE-SND-26: pasa a `pausado` y se queda ahí. |
| 6.6 | Audífonos desconectados a mitad | El navegador puede pausar el contexto; RN-RE-SND-24 lo reanuda con rampa. |
| 6.7 | Volumen del ambiente a 0 con `cristales` | Los nodos siguen vivos; subir el control se oye de inmediato (RN-RE-SND-16). |
| 6.8 | Guardar favorito con nombre de solo espacios | Rechazado por RN-RE-FAV-02 tras recortar. |
| 6.9 | Guardar favorito con emoji en el nombre | Permitido. El límite de 40 se cuenta por caracteres visibles (`Intl.Segmenter` o equivalente), no por unidades de código. |
| 6.10 | Eliminar y deshacer dentro de los 6 s | El favorito vuelve con **el mismo `id`** y todos sus campos, incluidos `usos` y `ultimoUsoEn`. |
| 6.11 | Eliminar, deshacer, y navegar antes de los 6 s | Al salir de la pantalla, la eliminación se confirma inmediatamente. La ventana de deshacer no sobrevive a la navegación. |
| 6.12 | 20 favoritos y se intenta el 21 | RN-RE-FAV-01: mensaje, sin borrado automático. |
| 6.13 | Favorito guardado, luego se elimina el sonido del catálogo | RN-RE-FAV-12: carga en silencio con aviso. |
| 6.14 | Dos pestañas de la app abiertas | La última escritura gana. Sin bloqueo optimista en esta fase; se documenta como limitación conocida. |
| 6.15 | Configuración modificada tras cargar favorito, y se sale sin guardar | Se pierden los cambios sin advertencia. Es coherente: la configuración es efímera hasta que se guarda. Anotarlo en `CLAUDE.md`. |

---

## 7. Archivos

### Crear
```
src/shared/audio/contextoAudio.js
src/shared/audio/ruido.js
src/breathing/audio/motorAmbiente.js
src/breathing/audio/mezclador.js
src/breathing/audio/fuentes/lluvia.js
src/breathing/audio/fuentes/olas.js
src/breathing/audio/fuentes/viento.js
src/breathing/audio/fuentes/cristales.js
src/breathing/audio/fuentes/fuego.js
src/breathing/data/catalogoSonidos.js
src/breathing/components/PanelSonido.jsx
src/breathing/components/favoritos/ListaFavoritos.jsx
src/breathing/components/favoritos/FilaFavorito.jsx
src/breathing/components/favoritos/DialogoGuardar.jsx
src/breathing/components/favoritos/EstadoVacio.jsx
src/breathing/lib/nombreSugerido.js
src/breathing/lib/comparadorConfiguracion.js
```

### Modificar
```
audioRespiracion.js (SPEC_08)  → consumir el AudioContext singleton (§2.1)
src/copy/index.js              → namespaces `respiracion.sonidos` y `respiracion.favoritos`
CLAUDE.md                      → reglas RN-RE-SND-* y RN-RE-FAV-*
```

### No tocar
```
src/components/lumia/**          ✗
src/components/formia/**         ✗
src/shared/respiracion/**        ✗ (cerrado en SPEC_13)
src/breathing/components/visuales/**  ✗ (cerrado en SPEC_14)
Tests de SPEC_08                 ✗
```

---

## 8. Cómo probar audio en tests

El entorno de test no tiene Web Audio real. Estrategia obligatoria:

- **RN-RE-SND-30:** toda la lógica de decisión (qué ganancia, qué rampa, cuándo programar, qué frecuencia) vive en **funciones puras** en `mezclador.js` y en cada fuente, separada de las llamadas a la API. Los tests prueban las funciones puras.
- Para el grafo, usar un **doble de `AudioContext`** que registre nodos creados, conexiones, desconexiones y llamadas de programación. Con eso se verifican fugas, cruces y limpieza sin sonido real.
- **No** usar `standardized-audio-context` ni ninguna dependencia nueva sin confirmación.

---

## 9. Criterios de aceptación

| # | Criterio |
|---|---|
| 1 | Los ~665 tests previos siguen verdes. |
| 2 | Los tests de SPEC_08 siguen verdes tras el refactor del `AudioContext` singleton. |
| 3 | Existe exactamente **un** `AudioContext` en toda la app: test que instancia ambiente y guía y verifica identidad referencial. |
| 4 | El `AudioContext` no se crea al montar; solo dentro de un manejador de gesto (§2.2). |
| 5 | Las 5 fuentes exponen la misma interfaz `{iniciar, detener, liberar}` (test de forma sobre el catálogo completo). |
| 6 | `liberar()` deja 0 nodos conectados y 0 eventos programados, en las 5 fuentes (RN-RE-SND-03). |
| 7 | El buffer de ruido se genera una sola vez por fuente, no por ciclo (RN-RE-SND-04). |
| 8 | Ningún cambio de ganancia usa asignación directa a `.value` — test que espía el doble y falla si ocurre (RN-RE-SND-08). |
| 9 | Fade-in de 2,0 s, fade-out de cierre de 3,0 s, fade-out de `terminar()` de 800 ms: verificados en la programación de rampas. |
| 10 | Al pausar, la ganancia de ambiente llega a 0,30 × su valor y **no** a 0 (RN-RE-SND-12). |
| 11 | Al pausar, la ganancia de guía llega a 0 (RN-RE-SND-13). |
| 12 | Cambio de sonido en vivo: en ningún instante del cruce la suma de ganancias es 0 (RN-RE-SND-14). |
| 13 | Cinco cambios de sonido en 2 s dejan exactamente una fuente viva (caso 6.3). |
| 14 | Sesión simulada de 60 min: el conteo de nodos es estable (caso 6.4). |
| 15 | La guía sonora se dispara solo en el inicio de `inhalar` y de `exhalar`, nunca en retenciones (RN-RE-SND-19). |
| 16 | La guía se programa desde `alCambiarFase` del motor, no desde un temporizador propio (RN-RE-SND-20). |
| 17 | Ninguna fuente ambiente produce eventos a intervalo fijo — test estadístico sobre 200 eventos programados: la varianza de los intervalos supera un umbral (RN-RE-SND-07). |
| 18 | Sin `AudioContext` disponible, la respiración funciona completa en silencio (caso 6.1). |
| 19 | `nombreSugerido` produce `4-7-8`, y `4-7-8 2` si el primero existe (RN-RE-FAV-04). |
| 20 | Nombre vacío, de solo espacios, o de 41 caracteres: rechazados con el mensaje correcto (RN-RE-FAV-02). |
| 21 | Nombre repetido con distintas mayúsculas y espacios se detecta como repetido (RN-RE-FAV-03). |
| 22 | Configuración idéntica a un favorito existente muestra "ya guardada" en lugar del botón de guardar (RN-RE-FAV-05). |
| 23 | Cargar un favorito aplica los 8 campos de configuración e incrementa `usos` (RN-RE-FAV-09). |
| 24 | Cargar un favorito deja el estado en `inactivo`, no arranca la sesión (RN-RE-FAV-10). |
| 25 | Modificar tras cargar muestra "modificado" y ofrece las dos opciones de guardado (RN-RE-FAV-11). |
| 26 | Deshacer dentro de 6 s restaura el favorito con el mismo `id`, `usos` y `ultimoUsoEn` (caso 6.10). |
| 27 | Navegar antes de los 6 s confirma la eliminación (caso 6.11). |
| 28 | El intento de guardar el favorito 21 muestra el mensaje de límite y no borra nada (RN-RE-FAV-01). |
| 29 | Un favorito con `sonidoAmbienteId` inexistente carga en silencio con aviso (RN-RE-FAV-12). |
| 30 | Un favorito con patrón inválido se corrige al cargar y avisa (RN-RE-FAV-13). |
| 31 | El límite de 40 caracteres cuenta emojis como uno (caso 6.9). |
| 32 | Todos los controles del panel de sonido tienen área táctil ≥ 44×44 px y etiqueta accesible. |
| 33 | Ningún string literal visible fuera de `copy/index.js` en todo `src/breathing/**`. |
| 34 | `npm run lint`, `lint:copy`, `lint:contraste`, `format:check`, `build`: los cinco verdes. |
| 35 | El repo no contiene ningún archivo de audio (`.mp3`, `.ogg`, `.wav`, `.m4a`, `.aac`) nuevo. Test o verificación de árbol de archivos (RN-RE-SND-00). |
| 36 | No se añadió ninguna dependencia de audio a `package.json` (RN-RE-SND-00). |
| 37 | El delta del bundle tras SPEC_15 es solo código; se reporta la cifra antes/después. |

**Meta de tests nuevos: 105–125.** Total esperado tras SPEC_15: **~780 verdes.**

---

## 10. Validación manual

Los tests no oyen. Después de los criterios automáticos, con audífonos y con bocina del teléfono:

1. Cada uno de los 5 sonidos, 2 minutos seguidos: ¿se oye el punto de bucle? ¿Aparece un patrón repetitivo?
2. ¿Algún ambiente compite con el ritmo de la respiración o lo enmascara? (RN-RE-SND-07)
3. Cristales con `calma-553`: ¿coincide alguna campana de forma molesta con los cambios de fase?
4. Pausar a mitad de una exhalación: ¿el descenso al 30 % se siente cuidado o brusco?
5. Cruce entre lluvia y olas: ¿hay algún hueco de silencio?
6. Guía sonora activada al 50 % con ambiente al 60 %: ¿se distingue el pulso del ritmo?
7. Volumen del teléfono al 20 %, de noche: ¿sigue siendo audible la guía?

---

## 11. Definición de hecho

- [ ] §2 confirmado (AudioContext singleton, autoplay, nombres de archivo)
- [ ] 37 criterios verificados con evidencia
- [ ] 7 validaciones manuales de audio realizadas y comentadas
- [ ] Delta del bundle reportado (RN-RE-SND-00)
- [ ] `CLAUDE.md` con RN-RE-SND-*, RN-RE-FAV-* y la deuda consciente de Bosque
- [ ] Commit hecho, **sin push**
