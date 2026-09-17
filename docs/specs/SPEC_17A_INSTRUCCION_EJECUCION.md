# SPEC_17A — Instrucción de ejecución

**Para:** Claude Code
**Rama:** `strivo` · **Commit de referencia:** `0e4d7e7` (12 sep 2026)
**Gobierna:** `SPEC_17_RESTAURACION_Y_PERSISTENCIA.md` (v2.0) + `SPEC_00B_CONVENCIONES_LANZAMIENTO.md`
**Alcance de esta entrega:** Fase A. La Fase B (SQLite) no se toca hasta después de SPEC_21.
**Versión:** 1.7 — 17 sep 2026. Fase A implementada. Incorpora D13 a D16, la distinción entre marca ausente e ilegible (§2), el reintento silencioso al volver la red, la siembra que no pisa (§4.1) y la retirada del conteo en Perfil (§4.6).

---

## 0. Antes de escribir una sola línea

1. Lee esta instrucción entera, el SPEC_17 v2.0 y las convenciones.
2. Inspecciona: `src/lib/db/local.js`, `sync.js`, `schema.js`, `shared.js`, `diario.js`, `index.js`, `src/lib/firebase.js`, `src/components/ArranqueProvisional.jsx`, `src/App.jsx`, `src/onboarding/cuenta.js`, `src/onboarding/useOnboarding.js`, `src/perfil/bloques.js`, `src/components/perfil/Perfil.jsx`, `src/breathing/data/esquema.js`, `src/breathing/data/repositorioRespiracion.js`, `src/copy/index.js`, `firestore.rules`.
3. **Reporta cualquier desvío entre lo que dice esta instrucción y lo que encuentres, y espera aprobación.** Los desvíos ya conocidos están en la §3: si encuentras uno más, se para.
4. No implementes nada fuera de la §4.

---

## 1. Qué resuelve esta entrega

Hoy lo escrito vive únicamente en IndexedDB de este dispositivo. La nube no devuelve nada y —según la §3, D1— tampoco recibe nada. Esta entrega cierra las dos mitades: la cola empieza a vaciarse, y lo que subió puede volver a bajar sin pisar lo que haya aquí.

Lo que **no** hace: no reescribe la cola, no toca el modelo de datos de `breathing/`, no añade `onSnapshot`, no añade cifrado, no toca el PIN más que para excluirlo, y **no toca el onboarding** (ver D7).

---

## 2. Reglas de fusión y decisiones cerradas

**Las tres reglas de fusión, en este orden:**

1. **Ruta que no existe en local, la escribe lo remoto.** Sin competencia: no hay nada que pisar.
2. **Documento local con el campo de marca ausente, frente a remoto con marca: gana el remoto.** Solo puede darse en un caso —un `shared/*` sembrado por `initShared`, o un registro escrito antes de esta SPEC— y es justo donde lo remoto es demostrablemente algo que esa persona escribió y lo local es un hueco con forma de dato.
3. **En todo lo demás, gana lo local:** empate, ambas sin marca, marca remota menor o igual, marca local ilegible, o colección sin campo de marca. Es la regla que ya sigue `mudarUid`.

La comparación es **por instante**, sobre `Date.parse(...)`, nunca por texto: hay dos formatos en circulación y husos distintos.

**Ausente e ilegible no son lo mismo, y la diferencia decide un caso.** La regla 2 existe porque un documento local sin campo de marca es un hueco que nadie escribió. Una marca presente pero imparseable —`"ayer"`, un número, basura— es lo contrario: alguien escribió ahí y lo único que no sabemos es cuándo. Convertir "no puedo leerlo" en "no existe" sería corregir en silencio (RN-DB4-08) y dejaría que lo remoto pisara algo escrito. Entonces: **la regla 2 se aplica solo cuando el campo está ausente; si está presente y no se puede parsear, gana lo local.** Del lado remoto no hace falta distinguir: una marca remota ausente o ilegible pierde igual.

**`null` y `undefined` cuentan como ausente, no como ilegible.** Es la convención de la casa para "todavía no" —`name: null`, `completedAt: null`, `ultimoUsoEn: null`— y no un valor que alguien puso. Lo ilegible es `"ayer"` o un número.

**Nada se inventa.** Un registro sin marca legible no recibe una marca fabricada al vuelo (RN-DB4-08).

**Decisiones cerradas, no se reabren:**

- **DP-17.5 — respiración: resuelta sin tocar su modelo.** `breathing/` ya trae su propio campo de última escritura: `actualizadoEn` en preferencias y favoritos (se recalcula en cada normalización), `usadoEn` en recientes, y `sesiones` no compite nunca. **No se añade ningún campo a respiración y no hay migración para esa rama.** Lo que se hace es que la fusión sepa qué campo mirar (§4.2).
- **DP-17.6 — aprobada.** `startSync` se conecta dentro de esta entrega (§4.4).
- **DP-17.7 — aprobada.** Disparo provisional por uid que no empieza con `local-`, marcado como deuda de SPEC_19.
- **DP-17.8 — aprobada, con la corrección de D13.** La marca de restauración vive en `localStorage`, clave `strivo.restaurado.<uid>`, y **anota éxitos, nunca fallos**. No es la única condición del disparo: ver §4.4.
- **DP-17.9 — resuelta.** Los textos del bloque de Perfil son los de la §5. No queda nada por aprobar.

---

## 3. Desvíos detectados y qué se hace con cada uno

| # | Desvío | Resolución |
|---|---|---|
| D1 | `startSync`/`flush` no se llaman desde ningún punto de la app. La cola nunca se vacía, así que Firestore hoy no recibe nada. | Se conecta en §4.4. **DP-17.6, aprobada.** |
| D2 | El disparo "cuando hay sesión" no tiene fuente: no existe `onAuthStateChanged` (es SPEC_19). | Regla provisional en §4.4. **DP-17.7, aprobada.** |
| D3 | `updatedAt` en dos formatos: `marcaLocal()` con desfase en mañana/noche; `toISOString()` en journal, `shared/` y respiración. | Comparación por epoch (§2). No requiere decisión, solo no comparar cadenas. |
| D4 | `FIELDS.dayState` solo admite `mood`; los cuatro `shared/*` no admiten `updatedAt`. `assertFields` rechazaría el campo. | Se amplían las listas (§4.1). Autorizado por el SPEC §2. |
| D5 | `writePath` sella `updatedAt` en la **fila** de IndexedDB, no dentro de `data`, así que nunca llega a Firestore (`sync.js` solo sube `entry.data`). | La fila se deja como está —es metadato local— y el campo de datos lo sella cada función de la capa (§4.1). |
| D6 | `breathing/` se sincroniza sin `sync: false`, aunque el SPEC lo lista fuera de alcance de cambios de modelo. | Sí participa y sí se restaura. No se cambia su modelo. Ver §4.2 y §4.3. |
| D7 | **El uid cambia a mitad del onboarding, no al final.** `onUid` se llama en P7 y `Entrada` reacciona. La restauración arrancaría entre P7 y P8, con el recorrido montado. | Disparo restringido al montaje (§4.4). Limitación nombrada ahí y anotada como DP-19.5. |
| D8 | La migración que propone el SPEC §6 (`updatedAt = createdAt`) solo es posible en `profile`: `auth`, `preferences` y `onboarding` no tienen `createdAt`. | **No hay migración retroactiva de ningún tipo** (§4.1). Lo viejo entra por las reglas 2 y 3 del §2. |
| D9 | `restaurar` no puede pasar por los validadores: `assertFields` rechaza campos retirados (`feeling`, `closingFeeling`, `granVision`, `learning`…) que los días de agosto sí traen. | La bajada escribe por `local.writePath` directo, **sin `validate*`** (§4.3). Tiene criterio propio. |
| D10 | `users/{uid}/**` no es enumerable desde el SDK web. Y la etiqueta `'breathing'` del doc de preferencias no se deduce de la ruta; vive en `breathing/data/esquema.js`, fuera de `lib/db` a propósito. | La lista de rutas y etiquetas se escribe **literal** en `restaurar.js`, con comentario (§4.3). `lib/db/` no importa de `breathing/`. |
| D11 | El indicador de Perfil no tiene de dónde suscribirse: `sync.js` no emite nada, y el SPEC §2 dice que la cola no se toca. | **Sondeo**, no evento: al montar, al volver la red y al volver la pestaña (§4.6). `sync.js` no se modifica. |
| D12 | No hay Emulator Suite en el repo. El SPEC §8 la pide. | **No se instala nada.** Unitarias con el patrón de `sync.test.js` (`vi.mock('firebase/firestore')` + `fake-indexeddb`); el ciclo real lo valida la fundadora en navegador (§6). |
| D13 | **La marca de `localStorage` sobrevive al borrado de IndexedDB, y la siembra pisa el perfil remoto.** Dos mitades: (a) borrar solo IndexedDB deja la marca puesta y no se restaura nada; (b) `initUserTree` siembra `shared/*` antes de restaurar y, con el sello de §4.1, un perfil vacío recién sembrado le gana al perfil remoto real: el nombre, el género, los horarios y las preferencias no vuelven nunca. | **La condición de disparo deja de ser solo la marca, y la restauración corre antes de sembrar** (§4.4). El hueco del reintento lo cierra `initShared`, que no sella (§4.1), más la regla 2 del §2. |
| D14 | **La siembra sube a Firestore y sobrescribe el árbol remoto.** `initShared` encola sus cuatro documentos y `sync.js` sube con `setDoc` sin `merge`: sobrescritura completa. Si la restauración falla en el primer arranque de un dispositivo nuevo, se siembra, la semilla se vacía a la nube y **el perfil vacío reemplaza allí el real**. El reintento desde Perfil ya no tiene qué recuperar. Hasta hoy era inofensivo porque la cola nunca se vaciaba (D1); al conectar `startSync` se vuelve real. | **La siembra escribe con `sync: false`** (§4.1). Mismo principio que el no-sello: una siembra no es una edición y no tiene nada que contarle a la nube. |
| D15 | **La semilla de respiración también sube, y además gana.** `leerPreferencias` (`repositorioRespiracion.js`), al no encontrar preferencias locales, escribe `normalizarPreferencias(preferenciasDeFabrica())` —que **siempre** sella `actualizadoEn: ahoraISO()`— y lo hace por `escribir()`, que no pasa `sync: false`. En un dispositivo nuevo con la restauración fallida, abrir Respiración sube unas preferencias de fábrica con la hora de ahora y **sobrescriben en la nube las que esa persona ajustó**. No solo compiten: ganan. | **Ese único punto de siembra escribe con `sync: false`** (§4.1). Los demás escritores de respiración —guardar preferencias, favoritos, recientes, sesiones— no se tocan: esos sí los escribe una persona. |
| D16 | **El velo no tiene techo.** `restaurar` no lleva límite de tiempo, y `sin_red` no cubre el caso frecuente en móvil: una conexión colgada, no caída. `navigator.onLine` dice `true`, `getDocs` se queda esperando y la persona se queda detrás del velo indefinidamente, con una sola frase y sin salida. Cerrar y volver a abrir repite el bloqueo. | **La espera del arranque tiene un techo de 15 s** (§4.4). Al cumplirse, se entra; la restauración sigue por detrás y marca si termina. |

---

## 4. El trabajo, por archivo

### 4.1 Campos de metadatos

**`src/lib/db/schema.js`**
- *Actual:* `FIELDS.dayState = ['mood']`. `FIELDS.profile`, `FIELDS.auth`, `FIELDS.preferences` y `FIELDS.onboarding` no incluyen `updatedAt`. `assertFields` lanza `UNKNOWN_FIELD` ante cualquier campo fuera de lista.
- *Esperado:* las cinco listas admiten `updatedAt`, con un comentario que diga por qué (criterio de fusión de SPEC_17A) y que lo ya escrito sin el campo se sigue leyendo igual (RN-DB-04).

**`src/lib/db/shared.js`**
- *Actual:* `saveProfile`, `updateProfile`, `saveAuthRecord`, `savePreferences`, `updatePreferences`, `saveOnboarding`, `updateOnboarding` escriben el dato tal cual llega.
- *Esperado:* cada una sella `updatedAt: new Date().toISOString()` dentro del dato o del parche, **después** de validar. El sello lo pone la capa de datos, no la pantalla: son cuatro documentos que escriben siete funciones distintas.

**`initShared` es la excepción, por partida doble: no sella y no sube** (D13, D14). Una siembra no es una edición: escribe `name: null`, `gender: 'n'` y los valores de fábrica, que no dicen nada de nadie. De ahí las dos consecuencias:

- **No sella `updatedAt`.** Sellarla haría que un árbol recién montado reclamara un instante que nadie vivió, y con eso le ganaría al perfil que esa persona sí escribió y que está esperando en la nube.
- **Escribe con `sync: false`.** `sync.js` sube con `setDoc` sin `merge`, así que una semilla encolada **sobrescribe el documento remoto entero**. Si la restauración falla en un dispositivo nuevo, la siembra que viene detrás borraría en la nube el perfil que esa persona escribió, y el reintento desde Perfil se quedaría sin nada que recuperar. Una siembra no tiene nada que contarle a la nube.

No rompe el camino normal de quien empieza sin cuenta: al crear cuenta en P7, `mudarUid` reencola el árbol entero, semilla incluida, que es cuando esos cuatro documentos suben por primera vez.

**Y una tercera: la siembra tampoco pisa.** Con el techo del velo (D16) la bajada puede seguir corriendo mientras se siembra, así que un `put` a secas podría sobrescribir un perfil real que acabara de bajar un instante antes —y la restauración marcaría, y ese nombre no volvería nunca—. La siembra escribe por `writePathIfAbsent` (nuevo en `local.js`, una sola transacción, nunca encola): **escribe solo donde no hay nada.** Es el §7 literal. Con las tres, `initShared` ni sella, ni sube, ni pisa.

**`src/breathing/data/repositorioRespiracion.js` — el mismo principio, un solo punto** (D15).
- *Actual:* `leerPreferencias`, al no encontrar preferencias locales, siembra las de fábrica y las escribe por `escribir()`, que encola. Y lo que escribe pasa por `normalizarPreferencias`, que **siempre** sella `actualizadoEn: ahoraISO()`: la semilla no llega sin marca, llega con la hora de ahora.
- *Esperado:* **esa escritura, y solo esa, va con `sync: false`.** Sin ello, abrir Respiración en un dispositivo nuevo cuya restauración falló sube unas preferencias de fábrica que sobrescriben en la nube las que esa persona ajustó, y por ser más nuevas también ganarían cualquier fusión posterior.
- *No se toca nada más de esa rama:* guardar preferencias, crear o editar favoritos, registrar recientes y registrar sesiones siguen encolando como hoy. Esos sí los escribe una persona. **No es un cambio al modelo de datos de `breathing/`**, que sigue fuera de alcance (§8): es una bandera de sincronización en una llamada.

Se implementa pasando por dentro de `initShared` un camino propio —no llamando a `saveProfile` y compañía con un flag en la firma pública—, que sigue validando igual, y lleva el comentario que explica las dos excepciones.

**`src/lib/db/diario.js`**
- *Actual:* `saveDayState` escribe solo `{ mood }`.
- *Esperado:* sella `updatedAt`. Mañana, noche y journal ya lo traen y **no se tocan** —los dos primeros con `marcaLocal()`, que se respeta: ese formato existe para conservar a qué hora era esto para quien lo escribió.

**Sin migración retroactiva (D8).** No se reescribe ningún registro existente para darle marca, ni siquiera `profile`, que sí tendría de dónde sacarla: media migración es peor que ninguna, porque deja tres documentos de `shared/` comportándose distinto del cuarto sin que nada lo explique. Lo antiguo entra por las reglas 2 y 3 del §2.

---

### 4.2 Regla de fusión — archivo nuevo `src/lib/db/conflictos.js`

Módulo puro, sin acceso a almacenamiento ni a red. Expone:

```
CAMPO_DE_MARCA         // mapa colección → nombre del campo de última escritura
marcaDe(coleccion, data) → number | null
ganaRemoto(coleccion, local, remoto) → boolean
```

El mapa, con el default primero:

| Etiqueta de colección | Campo |
|---|---|
| *(cualquier otra)* | `updatedAt` |
| `breathing` (preferencias) | `actualizadoEn` |
| `breathing/favoritos` | `actualizadoEn` |
| `breathing/recientes` | `usadoEn` |
| `breathing/sesiones` | *(ninguno: nunca gana lo remoto)* |

`ganaRemoto` implementa literalmente las tres reglas del §2:
- Colección sin campo de marca → `false`, siempre.
- Remoto sin marca legible → `false`.
- Local con el campo **ausente** y remoto con marca → `true`.
- Local con el campo **presente pero ilegible** → `false`. Ausente e ilegible no son lo mismo (§2): lo ilegible es prueba de que alguien escribió ahí, y se protege como si tuviera marca.
- Las dos con marca legible → `true` solo si la remota es **estrictamente** mayor.
- Cualquier otro caso (empate, remota menor) → `false`.

`marcaDe` devuelve `Date.parse(valor)` o `null` si falta, no es cadena o no se puede parsear (`NaN`). Como `marcaDe` no distingue ausente de ilegible, `ganaRemoto` pregunta además si el campo existe en el documento local; esa pregunta se hace solo ahí y no cambia el contrato de `marcaDe`.

Las etiquetas de respiración se escriben **literales aquí, con comentario** (D10), y no se importan de `src/breathing/data/esquema.js`: `lib/db/` no conoce las ramas de arriba, y esa dirección de dependencia no se invierte por un mapa de cinco líneas.

---

### 4.3 Restauración — archivo nuevo `src/lib/db/restaurar.js`

`restaurar(uid) → Promise<{ok, escritos, fusionados, motivo?}>`

- Carga el SDK bajo demanda, igual que `sync.js`. Sin `db`, devuelve `{ ok: false, motivo: 'sin_configuracion' }` y no lanza.
- **La lista de rutas se escribe literal aquí** (D10), con su etiqueta de colección al lado, porque el SDK web no enumera subcolecciones:

| Ruta | Etiqueta | `id` |
|---|---|---|
| `users/{uid}/shared/{profile,auth,preferences,onboarding}` | `shared` | el nombre del doc |
| `users/{uid}/diario/journal/items/*` | `diario/journal` | el del documento |
| `users/{uid}/diario/morningEntry/items/*` | `diario/morningEntry` | la fecha |
| `users/{uid}/diario/nightRitual/items/*` | `diario/nightRitual` | la fecha |
| `users/{uid}/diario/dayState/items/*` | `diario/dayState` | la fecha |
| `users/{uid}/breathing/unica` | `breathing` | `unica` |
| `users/{uid}/breathing/favoritos/items/*` | `breathing/favoritos` | el del documento |
| `users/{uid}/breathing/recientes/items/*` | `breathing/recientes` | el del documento |
| `users/{uid}/breathing/sesiones/items/*` | `breathing/sesiones` | el del documento |

- **`users/{uid}/diario/pinConfig` no se lee, no se escribe y no se espera** (RN-DB-04).
- Subcolecciones paginadas con `query(..., orderBy(documentId()), limit(300), startAfter(...))`.
- Cada documento pasa por `ganaRemoto`; solo entonces se escribe.
- **La bajada escribe por `local.writePath` directo, sin `validate*` ni `assertFields`** (D9). Los días de agosto traen campos que el modelo ya no admite escribir, y rechazarlos sería perder exactamente lo que esta SPEC viene a devolver. La validación es para lo que escribe el código de la app, no para lo que baja de la nube de su propio dueño.
- **Toda escritura de bajada va con `sync: false`.** Sin esto, restaurar dispara una resubida completa. Es el punto que más vigilancia necesita y tiene prueba propia.
- Idempotente: escribe por ruta, así que reintentar desde cero no duplica nada.
- **La marca de éxito** se guarda en `localStorage`, clave `strivo.restaurado.<uid>`, y se escribe **solo** cuando la restauración termina entera. Una restauración interrumpida o fallida no deja marca.
- **El último resultado por sesión** se guarda en memoria de módulo, expuesto como `ultimoResultado(uid)`. Lo consume el botón de reintentar de Perfil (§4.6). Un fallo es un hecho de esta sesión, no del dispositivo, y por eso no baja a `localStorage`.

**Esta es la única función de toda la app autorizada a usar `getDoc`/`getDocs`.** Cualquier otra lectura de Firestore fuera de este archivo es un error.

**Nota sobre `breathing/sesiones`, para que no sorprenda.** No son del todo inmutables: `purgarSesionesViejas` borra las de más de 90 días y encola el borrado. Una restauración puede bajar sesiones ya purgadas; la siguiente purga las vuelve a borrar y a subir como borrado. **Converge en un ciclo y no se hace nada al respecto:** filtrar por antigüedad aquí metería la regla de retención de respiración dentro de `lib/db/`, que es exactamente la dirección de dependencia que no se invierte.

---

### 4.4 Arranque de la cola y disparo de la restauración

**`src/lib/sesion.js`** (nuevo) — expone `esUidDeCuenta(uid)`: el uid no empieza con `local-`. La necesitan `ArranqueProvisional` y `useSincronizacion`, y dos copias de la misma regla se separan en cuanto alguien edite una. Lleva **el comentario de deuda de DP-17.7**: es provisional y SPEC_19 la sustituye por `onAuthStateChanged`. `ArranqueProvisional` sigue siendo el único que acuña el uid.

**`src/components/ArranqueProvisional.jsx`** — es quien ya resuelve el uid y monta el árbol, así que es su sitio. **El onboarding no se toca.**

- *Actual:* resuelve uid; si `getProfile(uid) === null`, llama a `initUserTree(uid)`; entrega `children`. Nunca arranca la sincronización.
- *Esperado*, **al montar** y solo si `esUidDeCuenta(uid)`:
  1. `startSync(uid)`, guardando su función de limpieza.
  2. **Restaurar antes de sembrar.** Corre `restaurar(uid)` —con el velo en pantalla (§4.5)— si **no hay marca `strivo.restaurado.<uid>` o no hay árbol** (`getProfile(uid) === null`). Un árbol ausente con marca puesta es una marca huérfana: se retira y se restaura (D13a).
  3. Solo **después**, si `getProfile(uid)` sigue siendo `null` —cuenta sin nada en la nube, o restauración fallida—, `initUserTree(uid)`. Así lo remoto entra por la regla 1 del §2 y no compite con una siembra que no dice nada de nadie (D13b).
  4. Si `restaurar` falla, se entra igual. No hay modal y no hay bloqueo. Como `initShared` no sella (§4.1), un reintento posterior sí recupera el perfil remoto por la regla 2 del §2.
- **La espera tiene un techo: 15 segundos** (D16). Pasados, el velo baja y se entra, aunque `restaurar` no haya contestado. La restauración **no se cancela**: sigue por detrás y, si termina entera, escribe su marca; lo que baje aparecerá al montarse la siguiente sección. Es `Promise.race` entre la restauración y un temporizador, y el temporizador se limpia siempre. **Nada bloquea a la persona**, y el techo no es un umbral de fallo: una restauración lenta no pierde nada por cruzarlo.

- **Un reintento silencioso al volver la red, y solo uno.** Si la restauración del montaje falló con `sin_red`, se queda un oyente de `online` que la corre otra vez, sin velo, sin aviso y sin tocar la pantalla: lo que baje aparecerá la próxima vez que se monte una sección, que es lo que quiere decir "sin avisar" en SPEC_17 v2.0 §3. Se desuscribe al primer intento y al desmontar. **No es un bucle ni un temporizador:** un solo evento, un solo intento, el mismo guard. Con cualquier otro motivo de fallo no se pone oyente —si el error no fue la red, volver la red no arregla nada— y el reintento explícito sigue viviendo en Perfil.
- **Sin cuenta** (`local-…`): nada de esto ocurre. Se siembra como hoy y la app arranca exactamente igual.
- **Cuando el uid cambia durante la sesión** (P7 llama a `cambiarUid`): se rearranca `startSync` con el uid nuevo —para que lo que se acaba de escribir suba— y **no se restaura**.
- Un guard (`useRef`) impide que un re-render o un cambio de uid vuelvan a disparar la restauración en la misma sesión.

**Limitación conocida, y es deliberada (D7).** Quien en P7 entra a una cuenta que ya tenía datos termina el onboarding sin ver su historial: le aparece la siguiente vez que abra la app. Restaurar a mitad del recorrido obligaría a decidir tres cosas —si el velo se interpone sobre P8, si el `completedAt` remoto salta la última pantalla, y qué pasa con el nombre recién tecleado frente al del perfil remoto— sobre un recorrido que SPEC_19 va a rehacer con `onAuthStateChanged` y una pantalla de entrar de verdad. **Nada se pierde:** el árbol remoto está intacto y `mudarUid` ya garantiza que lo local no lo pisa. Queda anotado como **DP-19.5 (nueva)**.

---

### 4.5 Pantalla de restauración

- Reutiliza el velo que ya existe: `data-moment={momentoDe()}` + `velo-transicion`, como el estado de espera actual de `ArranqueProvisional`. **No se crea una pantalla nueva.**
- Debajo del velo, el texto de `copy.shared.restauracion.enCurso`, con `aria-live="polite"` y `aria-busy="true"` en el contenedor.
- **Sin rueda que gire, sin barra de progreso, sin porcentaje** (RN-EST-02). No se cuenta cuánto falta.
- Con `prefers-reduced-motion`, ninguna transición nueva.
- Si el velo necesita un `data-surface` para que el texto se lea sobre el fondo nocturno, **ese atributo se aplica solo donde hay texto encima** —el estado de restauración— y no cambia ni un píxel del velo de espera ni del umbral de marca, que están afinados y quedaron cerrados con SPEC_18.

---

### 4.6 Bloque de sincronización en Perfil

**`src/perfil/bloques.js`**
- *Actual:* `BLOQUES = ['nombre', 'genero', 'horarios']`.
- *Esperado:* `[..., 'sincronizacion']`, al final. El propio archivo dice que las gestiones van detrás de lo que es la persona. `perfil.test.js` tiene una prueba que cuenta tres bloques: actualizarla a cuatro es parte de esta entrega.

**`src/perfil/useSincronizacion.js`** (nuevo) — devuelve uno de cuatro estados:
- `sinCuenta` — `!esUidDeCuenta(uid)`. Tiene prioridad sobre todo lo demás.
- `sinConexion` — `navigator.onLine === false`.
- `pendiente` — `getPendingCount(uid) > 0`.
- `alDia` — el resto.
- Se recalcula al montar, al irse y al volver la red (`offline` y `online`) y al volver la pestaña a primer plano (`visibilitychange`). Sin el primero, quedarse sin red con Perfil abierto seguiría diciendo «Todo guardado» hasta cambiar de pestaña. **No hay sondeo por intervalo y `sync.js` no se modifica** (D11).

**`src/components/perfil/Perfil.jsx`**
- Pinta el bloque con `Bloque`, sin componente nuevo.
- El estado se anuncia **con texto**, en un contenedor `aria-live="polite"`. Si hay punto de color, es decorativo y no porta información por sí solo.
- Botón `reintentar` visible cuando hay pendientes con conexión, o cuando `ultimoResultado(uid)` dice que la última restauración falló. Llama a `flush(uid)` y, en el segundo caso, a `restaurar(uid)`.
- **No se dice cuántas hay pendientes.** «Guardando» es información completa; un número que el sondeo no ve bajar se queda congelado en pantalla y se lee como algo atorado. Y Perfil no devuelve cifras sobre quien lo abre (no-negociable 2, y el comentario de cabecera de `Perfil.jsx`). El SPEC_17 v2.0 §3 pedía el conteo, pero se escribió antes de conocer esa pantalla.
- Cuando la última restauración falló, debajo del estado va `copy.shared.restauracion.error`: un «Intentar de nuevo» sin explicación no se entiende.

---

## 5. Copy exacto

Todo en `src/copy/index.js`. Cero cadenas en componentes (`npm run lint:copy`). **Estos textos están cerrados.**

```
copy.shared.restauracion = {
  enCurso:    'Recuperando lo que escribiste.',
  error:      'No pudimos recuperar todo ahora. Nada se perdió y lo intentaremos de nuevo.',
  reintentar: 'Intentar de nuevo',
}

copy.diario.perfil.sincronizacion = {
  titulo:      'Dónde vive lo que escribes',
  hint:        'Lo tuyo se guarda aquí primero y se respalda después.',
  alDia:       'Todo guardado',
  pendiente:   'Guardando',
  sinConexion: 'Sin conexión. Se guardará cuando vuelva.',
  sinCuenta:   'Sin cuenta, lo escrito vive solo en este teléfono.',
  reintentar:  'Intentar de nuevo',
}
```

---

## 6. Criterios de aceptación

**Automáticos (suite):**
1. `grep -rn "getDoc\|getDocs" src/` devuelve resultados **solo** en `src/lib/db/restaurar.js` y sus pruebas.
2. Tras restaurar, `pendingCount(uid) === 0`. Lo que baja no vuelve a subir.
3. La bajada no pasa por `validate*`: un documento remoto con un campo retirado (`closingFeeling`, `granVision`) se escribe local sin lanzar.
4. Fusión por instante con los dos formatos mezclados y husos distintos: gana la marca mayor, nunca la cadena mayor.
5. Un favorito de respiración fusiona por `actualizadoEn`; una reciente por `usadoEn`; una sesión nunca la gana lo remoto.
6. Las tres reglas del §2: ruta ausente en local la escribe lo remoto; local con el campo **ausente** contra remoto con marca gana el remoto; local con el campo **presente pero ilegible** contra remoto con marca gana **lo local**; ambas sin marca gana lo local.
7. `pinConfig` no se lee ni se escribe en la restauración.
8. Restauración interrumpida no deja marca; la siguiente corre entera; correrla dos veces no duplica nada.
9. **`initShared` no sella `updatedAt` en ninguno de los cuatro documentos, y no encola ninguno**; el resto de escrituras de `shared/` sí hacen las dos cosas. Tras sembrar un árbol, `pendingCount(uid) === 0`.
10. **Con marca puesta y árbol ausente, se restaura** (marca huérfana). Con marca y árbol, no.
11. **La restauración corre antes de la siembra:** partiendo de local vacío y un `shared/profile` remoto con nombre, tras el arranque el perfil local trae ese nombre y no el sembrado.
12. **Una restauración fallida no destruye el árbol remoto:** con `restaurar` devolviendo error y la siembra corriendo detrás, la cola no lleva ninguno de los cuatro documentos de `shared/`, y el reintento posterior sí recupera el nombre.
13. **La semilla de preferencias de respiración no encola.** Tras un `leerPreferencias` que siembra, `pendingCount(uid) === 0`; guardar preferencias después sí encola.
14. **Un fallo por `sin_red` deja un oyente de `online` que reintenta una vez y se desuscribe.** Con cualquier otro motivo no se pone oyente, y en ningún caso hay temporizador ni segundo intento.
15. **El velo baja a los 15 s aunque `restaurar` no conteste**, la app entra, y si la restauración termina después sí escribe su marca.
16. Sin `.env.local`, la app funciona exactamente como hoy y no se toca el SDK.
17. Suite verde. Al menos 30 pruebas nuevas. `npm run lint`, `lint:copy`, `lint:contraste` y `format:check` en verde.

**Manuales, los valida la fundadora en navegador contra `strivo-fe04f`** (no los automatices, no instales el emulador — D12):

18. Con la app abierta y cuenta activa, lo escrito llega a Firestore sin intervención. (Hoy no llega: D1.)
19. **Borrar solo la base `strivo` de IndexedDB** (DevTools → Application), recargar: vuelve todo, incluido el nombre del perfil, en el mismo arranque. Con 100 entradas, en menos de 30 s.
20. Tras restaurar en un dispositivo nuevo, el Journal pide **crear** PIN, no desbloquear con uno viejo.
21. Perfil muestra los cuatro estados correctos.

**Plan de pruebas.** Unitarias de `conflictos.js` (las tres reglas, empate, sin marca en uno y en los dos, colección inmutable, formatos mezclados, huso distinto) y de `restaurar` (vacío, con datos, interrumpido, idempotente, `pinConfig` excluido, `sync: false`, sin validadores, marca solo al terminar). De `ArranqueProvisional`: marca huérfana, orden restaurar→sembrar, uid local sin restauración, cambio de uid sin restauración. Más el hook de estado. El doble de Firestore se hace con `vi.mock('firebase/firestore')` y `fake-indexeddb`, **el mismo patrón que ya usa `sync.test.js`**. Regresión: la cola no cambia de comportamiento, `mudarUid`/`adoptarArbol` siguen sin pisar nada, y Hoy, Journal, Respiración e Historial intactos.

---

## 7. Reglas de arquitectura que esto roza

- **Nada se pierde y nada se bloquea.** La fusión nunca sobrescribe sin marca que lo justifique; una siembra nunca le gana a lo escrito; una restauración fallida no impide entrar; el onboarding no se interrumpe.
- **RN-DB-04.** El PIN no sale ni vuelve. Lo ya escrito no se sobrescribe ni desaparece.
- **RN-DB4-08.** No se corrige ni se rellena nada en silencio: sin marca es sin marca.
- **Cero strings hardcodeados.** Todo el texto nuevo en `src/copy/index.js`.
- **RN-EST-02.** Sin ruedas, sin progreso, sin contadores que presionen.
- **Contraste AAA y `prefers-reduced-motion`**, verificados con los comandos.
- **Tono.** Nada de urgencia, nada de error técnico a la vista, ningún código de error en pantalla.
- **Dirección de dependencias.** `lib/db/` no importa de `breathing/` ni de `diario/`.
- **Una regla, un sitio.** `esUidDeCuenta` vive en `lib/sesion.js` y la importan sus dos consumidores.

---

## 8. Fuera de alcance

Fase B (SQLite y migración), `onAuthStateChanged` y entrar/salir/recuperar (SPEC_19), cambios al onboarding, exportación y borrado (SPEC_24), cifrado en reposo, `onSnapshot`, sincronización en tiempo real, cambios al modelo de datos de `breathing/`, reescritura de la cola, instalación del Emulator Suite.

---

## 9. Estado de las decisiones

**Resueltas:** DP-17.6 (`startSync` en 17A), DP-17.7 (disparo provisional), DP-17.8 (marca en `localStorage`, con la corrección de D13), DP-17.9 (copy de Perfil).

**Heredadas, sin cambio:** DP-17.1, 17.2, 17.3 (resueltas por el repo), DP-17.4 (no se invita a crear cuenta desde el indicador; eso es SPEC_19).

**Nueva, abierta, no bloquea esta entrega:**
- **DP-19.5** — Qué ve quien en P7 entra a una cuenta que ya tenía datos. Hoy termina el onboarding y su historial aparece al siguiente arranque (§4.4). SPEC_19 lo cierra con `onAuthStateChanged` y una pantalla de entrar de verdad.
