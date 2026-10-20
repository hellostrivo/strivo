# SPEC_17A.2 — Instrucción de ejecución: dos defectos de la validación manual

**Para:** Claude Code
**Rama:** `strivo` · **Commit de referencia:** `7b7d0ff` (17 sep 2026)
**Gobierna:** `ADENDA_SPEC_17A_VALIDACION_MANUAL_18-09-2026.md` + `claude/SPEC_17A_INSTRUCCION_EJECUCION.md` (v1.7) + `SPEC_00B_CONVENCIONES_LANZAMIENTO.md`
**Alcance:** cerrar DP-17.10 y DP-17.11, y corregir cuatro afirmaciones falsas en la documentación. Nada más.

---

## 0. Antes de escribir una sola línea

1. Lee la adenda entera y la §4.1, §4.4 y §6 de la instrucción de ejecución v1.7.
2. Inspecciona: `src/lib/db/local.js`, `src/lib/db/conflictos.js`, `src/lib/db/sync.js`, `src/lib/sesion.js`, `src/components/ArranqueProvisional.jsx`, `src/App.jsx`, `src/onboarding/cuenta.js`, `src/main.jsx`.
3. **Reporta cualquier desvío entre esta instrucción y lo que encuentres, y espera aprobación antes de codificar.** Hay dos puntos donde se espera que reportes aunque no haya desvío: están marcados como **REPORTA**.
4. No implementes nada fuera de la §2 y la §3. En particular: **no se toca el onboarding, no se toca `sync.js`, y no se revierte D7.**

---

## 1. Qué resuelve esta entrega

La validación manual de SPEC_17A encontró que la restauración funciona y que **lo que la rompía estaba antes**: al entrar en P7 a una cuenta existente, la mudanza del árbol sube la semilla y sobrescribe en Firestore los documentos reales de esa cuenta. La restauración bajaba después, fielmente, lo que la subida acababa de destruir.

El segundo defecto es su cómplice: la puerta del onboarding se decide una sola vez, así que una bajada que termina tarde deja a la persona dentro de un recorrido que ya había hecho — y terminarlo vuelve a pasar por P7.

Esta entrega corta el bucle por los dos lados.

Lo que **no** hace: no revierte D7, no añade `onAuthStateChanged`, no toca el onboarding ni sus pantallas, no cambia la cola, no toca el PIN, no añade cifrado.

---

## 2. DP-17.10 — La mudanza no reencola lo que no tiene marca

**Opción aprobada: la 1 de la adenda §2.** Es D14 extendido a la mudanza: una semilla sigue siendo una semilla después de mudarse.

### `src/lib/db/local.js` → `mudarUid(desde, hacia)`

- *Actual:* el bucle final reencola **todas** las filas mudadas, salvo las que casan con `SIN_SINCRONIZAR`.
- *Esperado:* además de `SIN_SINCRONIZAR`, se salta las filas cuyo dato **no tenga campo de marca legible** para su colección. Esas filas se mudan igual —siguen siendo suyas y siguen estando en local—, pero no se encolan: no tienen nada que contarle a la nube.
- La pregunta "¿tiene marca?" se responde con `marcaDe(coleccion, data) !== null` de `src/lib/db/conflictos.js`, usando la etiqueta de colección que la propia fila ya trae en `fila.collection`. **No se duplica el mapa de campos de marca**: una regla, un sitio.
- Lleva comentario de cabecera que explique la relación con D14 y con el caso que lo motivó: mudar a una cuenta que ya tiene datos.

**REPORTA antes de codificar:** `local.js` pasaría a importar de `conflictos.js`. Los dos viven en `lib/db/` y `conflictos.js` es un módulo puro sin acceso a almacenamiento ni a red, así que no invierte ninguna dirección de dependencia — pero confírmalo mirando los imports actuales de ambos y di si introduce un ciclo.

### Criterios de aceptación

1. Árbol sembrado por `initShared` bajo un uid local + `mudarUid(local, cuenta)` ⇒ la cola **no** contiene ninguno de los cuatro documentos de `shared/`. `pendingCount(cuenta) === 0`.
2. Una fila con marca legible —mañana, noche, journal, `dayState`, un perfil editado, un favorito de respiración con `actualizadoEn`— **sí** se reencola tras mudarse. No hay regresión contra el criterio 18.
3. Una fila cuya marca esté **presente pero ilegible** (`"ayer"`, un número) **sí** se reencola: ausente e ilegible no son lo mismo, igual que en §2 de la instrucción v1.7. Alguien escribió ahí.
4. Las colecciones sin campo de marca (`breathing/sesiones`) se siguen encolando como hoy. `campoDeMarca` devuelve `null` para ellas y eso **no** significa "es una semilla".
5. Regresión: las pruebas actuales de `mudarUid` y `adoptarArbol` siguen verdes, con los mismos `{mudados, conservados}`.
6. Prueba nueva end-to-end con dobles: sembrar → mudar → `flush` ⇒ ninguna escritura a `users/{cuenta}/shared/*`.

**El criterio 4 es el que más fácil se rompe.** `marcaDe` devuelve `null` tanto para "esta colección no tiene campo de marca" como para "el campo falta". Para `breathing/sesiones` hay que preguntar primero por `campoDeMarca(coleccion) === null` y encolar sin más.

---

## 3. DP-17.11 — No sembrar mientras hay una bajada en vuelo

**Opción aprobada: la (a) de la adenda §3.** Se arregla la carrera, no la pantalla. El caso del techo de 15 s se decide en SPEC_19 junto con DP-19.5, y **no se toca aquí**.

### `src/lib/sesion.js` → `prepararArbol(uid, opciones)`

- *Actual:* cada llamada evalúa por su cuenta si restaura y si siembra. Dos llamadas concurrentes con el mismo uid —el doble montaje de `React.StrictMode`, y cualquier re-montaje futuro— se pisan: la segunda ve `getProfile(uid) === null` porque la primera sigue bajando, y siembra. `Entrada` lee entonces el expediente sembrado, con `completedAt: null`, y manda al onboarding a quien ya lo hizo.
- *Esperado:* `prepararArbol` guarda en memoria de módulo la promesa en curso **por uid**. Si llega una segunda llamada para un uid que ya tiene una en vuelo, **devuelve esa misma promesa** en vez de arrancar otra evaluación. La entrada se retira al resolverse, en `finally`, gane o falle.
- Sigue siendo lógica sin React, que es donde la instrucción v1.7 la puso a propósito: se prueba sin navegador.
- El guard `arranqueEvaluado` de `ArranqueProvisional` **no se retira ni se cambia**: responde a otra pregunta (una restauración por sesión, aunque cambie el uid) y las dos siguen haciendo falta.

**REPORTA antes de codificar:** si `prepararArbol` recibe la segunda llamada con `restaurarSiHaceFalta: false` mientras la primera corría con `true` —que es justo lo que pasa en el doble montaje— devolver la promesa de la primera es lo correcto, porque la primera hace más, no menos. Confirma que ese es el orden real de las llamadas en `ArranqueProvisional` y dilo antes de escribir.

### Criterios de aceptación

1. Dos llamadas concurrentes a `prepararArbol(uid)` producen **una** restauración y **como mucho una** siembra. La segunda resuelve con el mismo objeto que la primera.
2. Local vacío + `shared/onboarding` remoto con `completedAt` + doble montaje ⇒ la app entra a Hoy **en el primer arranque**, sin pasar por el onboarding. Es el criterio 19 de la instrucción v1.7, ahora verificable en desarrollo.
3. Llamadas **secuenciales** (la primera ya resuelta) vuelven a evaluar con normalidad: esto no es una caché, es una coalescencia de las que están en vuelo.
4. Dos uid distintos a la vez no se interfieren.
5. Las pruebas existentes de `prepararArbol` siguen verdes: marca huérfana, orden restaurar→sembrar, uid local sin restauración, cambio de uid sin restauración.

---

## 4. Correcciones de documentación

Cuatro afirmaciones que el código desmiente. **No se reescribe la historia: se corrige lo que está mal y se dice por qué**, como se ha hecho con las divergencias conocidas.

### `CLAUDE.md`, sección "Lo que subió a la nube vuelve a bajar (SPEC_17A, 17 sep 2026)"

1. Cuarto punto (el del disparo provisional): la frase *"Quien entra en P7 a una cuenta con datos los ve al siguiente arranque; nada se pierde."* es falsa. Sustitúyela por la limitación real y su remedio, citando DP-17.10.
2. Añade al final de esa misma sección, sin crear sección nueva, **un punto sobre cómo se prueba la restauración a mano**, con los cuatro aprendizajes de la adenda §5: hace falta sesión de Auth real (las reglas son uid-scoped); `deleteDatabase` no borra con una conexión abierta; "Omitir" sella igual y solo `completedAt` abre la puerta; `localhost:5173` es un origen compartido con otros proyectos.

Mismo registro que el resto del archivo: prosa, el porqué antes del qué, sin listas de pasos.

### `claude/SPEC_17A_INSTRUCCION_EJECUCION.md`

3. §4.1, último párrafo ("No rompe el camino normal de quien empieza sin cuenta…"): corrígelo para que diga que la mudanza sube la semilla **solo cuando la cuenta es nueva**, y que desde DP-17.10 las filas sin marca no se reencolan.
4. §4.4, "Limitación conocida (D7)": la frase *"**Nada se pierde:** el árbol remoto está intacto y `mudarUid` ya garantiza que lo local no lo pisa"* es falsa. La garantía de `mudarUid` es local. Corrígela y enlaza DP-17.10.
5. §6, criterio manual 20: sustituye *"el Journal pide **crear** PIN"* por *"el Journal abre sin candado y sin pedir el PIN anterior; `diario/pinConfig` no existe en local ni se descargó"*. El código está bien; pedir un PIN para leer lo propio sería un bloqueo.
6. §9: añade DP-17.10 y DP-17.11 como resueltas por esta entrega, con una línea cada una.

### `SPEC_17_RESTAURACION_Y_PERSISTENCIA.md` (v2.0)

7. §7, criterio de aceptación 3: misma corrección que el criterio 20.

---

## 5. Validación

```
npm test
npm run lint
npm run lint:copy
npm run lint:contraste
npm run format:check
```

- Suite verde. **Al menos 8 pruebas nuevas** entre los dos defectos.
- `grep -rn "getDoc\|getDocs" src/` sigue devolviendo resultados solo en `src/lib/db/restaurar.js` y sus pruebas.
- Ningún texto nuevo en pantalla, así que `lint:copy` no debería tener nada que decir. Si lo tiene, para y reporta.

---

## 6. Reglas de arquitectura que esto roza

- **Nada se pierde y nada se bloquea.** DP-17.10 es literalmente esa regla incumplida: se perdía en la nube, que es la única copia que sobrevive al teléfono.
- **RN-DB-04.** Lo ya escrito no se sobrescribe ni desaparece.
- **RN-DB4-08.** Nada se corrige en silencio: una fila sin marca no recibe una marca fabricada para poder subirla.
- **D14**, que se extiende en vez de contradecirse: una siembra ni sella, ni sube, ni pisa — tampoco después de mudarse.
- **Una regla, un sitio.** El mapa de campos de marca sigue viviendo solo en `conflictos.js`.
- **Dirección de dependencias.** `lib/db/` no importa de `breathing/` ni de `diario/`. Un import de `local.js` a `conflictos.js` es horizontal dentro de `lib/db/`; confírmalo.

---

## 7. Fuera de alcance

`onAuthStateChanged` y la pantalla de entrar de verdad (SPEC_19), la reversión de D7, el caso del techo de 15 s en DP-17.11, el Bloque 4 de la validación manual, cifrado en reposo, cualquier cambio al onboarding o a sus pantallas, Fase B.

---

## 8. Commit

Un commit por defecto, más uno de documentación. Incluye `docs/specs/` si sigue sin estar rastreado.

```
fix(db): una semilla no sube ni después de mudarse (DP-17.10)
fix(sesion): no sembrar mientras la bajada sigue en vuelo (DP-17.11)
docs: corregir lo que la validación manual desmintió (SPEC_17A)
```
