# Adenda SPEC_17A — Resultado de la validación manual en navegador

**Fecha:** 18 de septiembre de 2026
**Rama:** `strivo` · **Commit de referencia:** `7b7d0ff` (17 sep 2026, `docs(claude): lo que subió a la nube vuelve a bajar`)
**Gobierna:** `SPEC_17_RESTAURACION_Y_PERSISTENCIA.md` (v2.0) y `claude/SPEC_17A_INSTRUCCION_EJECUCION.md` (v1.7)
**Qué es esto:** el resultado de los criterios manuales 18–21 de la instrucción, ejecutados contra `strivo-fe04f` en producción. Dos defectos encontrados, dos correcciones de documento, y el procedimiento de prueba que sí funciona.

---

## 1. Qué quedó validado

Los cuatro bloques manuales se ejecutaron con la cuenta de prueba `FlkJmrwOjfejIHdFt0hOCglXypW2`.

| # | Criterio | Resultado |
|---|---|---|
| 18 | Lo escrito llega a Firestore sin intervención | ✅ Confirmado en el Bloque 2 |
| 19 | Borrar solo la base `strivo`, recargar: vuelve todo **en el mismo arranque** | ⚠️ **A medias.** Los datos sí bajaron en ese arranque; la pantalla no se enteró. Ver DP-17.11 |
| 20 | Tras restaurar, el Journal pide **crear** PIN | ⚠️ **Criterio mal redactado.** Ver §4 |
| 21 | Perfil muestra los cuatro estados | ✅ `sinCuenta` (Bloque 1) y `alDia` (Bloques 2 y 3). Faltan `pendiente` y `sinConexion`: son el Bloque 4 |

La restauración, medida por dentro con `ultimoResultado(uid)`:

```
{ ok: true, escritos: 3, fusionados: 3 }
```

Bajaron los tres registros de `diario/` (una mañana, dos entradas de journal) y tres de los cuatro `shared/`. El único conservado fue `shared/preferences`, **correctamente**: ni el local ni el remoto tienen `updatedAt` —los dos son de fábrica—, así que `ganaRemoto` devuelve `false` por la regla 3.

Y quedó confirmado lo que más importaba:

- **`pendingCount(uid) === 0` tras restaurar.** El `sync: false` de la bajada se respeta: nada de lo que bajó volvió a subir (criterio 2).
- **`diario/pinConfig` no existe en Firestore bajo ese uid, y no bajó.** RN-DB-04 se cumple de punta a punta.
- **Los `fusionados: 3` son la prueba en vivo de que D16 funciona.** La siembra corrió a la vez que la bajada —el velo tiene techo y la bajada no se cancela— y lo remoto ganó igual, porque `sembrar` escribe sin `updatedAt` y `tieneCampo` trata `null` como ausente. El caso que D13b y D16 anticiparon en el papel ocurrió de verdad y se resolvió como estaba escrito.

---

## 2. DP-17.10 — La mudanza de P7 sube la semilla y pisa la nube

**Abierta. Es un defecto de producto, no un artefacto de la prueba. Bloquea el cierre de SPEC_17A.**

### Ubicación exacta

- `src/lib/db/local.js` → `mudarUid(desde, hacia)`, el bucle final que reencola cada fila mudada.
- `src/components/ArranqueProvisional.jsx` → el efecto que llama a `startSync(uid)` cuando el uid pasa a ser de cuenta.
- `src/onboarding/cuenta.js` → `adoptarArbol`, que las encadena.

### Comportamiento actual

Al entrar en P7 a una cuenta **que ya existe**, desde un dispositivo sin datos de esa cuenta:

1. `adoptarArbol` llama a `mudarUid(uidLocal, uidCuenta)`, que muda el árbol local entero y **encola cada fila mudada**.
2. El efecto de `ArranqueProvisional` rearranca `startSync` con el uid nuevo.
3. `sync.js` sube con `setDoc` sin `merge`: **sobrescritura completa por ruta.**
4. El árbol que sube es el que sembró `initShared` en la sesión anónima. En la nube reemplaza a los documentos reales de esa cuenta.

La salvaguarda que `mudarUid` documenta —"la mudanza no sobrescribe lo que ya hubiera bajo la cuenta"— **solo existe en local**: es el `store.get(destino)` del bucle. En un dispositivo que nunca vio esa cuenta no hay nada local bajo ese uid, así que no frena nada: todo se muda y todo se sube.

### Qué se midió

Tras un intento de reconstruir la sesión pasando por el onboarding, los documentos de la nube quedaron así:

- `users/{uid}/shared/profile` → `name: null`, `wakeTime: null`, `sleepTime: null`, `createdAt: "2026-09-18T23:26:04.641Z"`, **sin `updatedAt`**. Es la semilla de `initShared`, tal cual.
- `users/{uid}/shared/onboarding` → `completedAt: null`, `currentStep: "p7"`, `updatedAt: "2026-09-18T23:26:15.994Z"`.

Los datos reales de esa cuenta, escritos cinco horas antes, habían desaparecido de la nube. Sobrevivió lo que la semilla no tiene: las entradas de `diario/`, porque el árbol sembrado no trae esas rutas y `setDoc` escribe por ruta, no por árbol.

La restauración nunca falló. Bajaba fielmente la basura que la subida acababa de crear.

### Dos afirmaciones de los documentos que son falsas y hay que corregir

1. **`claude/SPEC_17A_INSTRUCCION_EJECUCION.md` §4.1, último párrafo:** *"No rompe el camino normal de quien empieza sin cuenta: al crear cuenta en P7, `mudarUid` reencola el árbol entero, semilla incluida, que es cuando esos cuatro documentos suben por primera vez."* — Es cierto para una cuenta nueva y destructivo para una que ya tiene datos. D14 cerró esa puerta ("una siembra ni sella, ni sube, ni pisa") y este párrafo la reabre en P7.
2. **`claude/SPEC_17A_INSTRUCCION_EJECUCION.md` §4.4, "Limitación conocida (D7)":** *"**Nada se pierde:** el árbol remoto está intacto y `mudarUid` ya garantiza que lo local no lo pisa."* — El árbol remoto no queda intacto. Esa garantía es local.
3. **`CLAUDE.md`, sección "Lo que subió a la nube vuelve a bajar", cuarto punto:** *"Quien entra en P7 a una cuenta con datos los ve al siguiente arranque; nada se pierde."* — Misma corrección.

### Opciones

**Opción 1 — La mudanza no reencola lo que no tiene marca. (Recomendada.)**
`mudarUid` deja de encolar las filas cuyo dato no trae campo de marca legible —es decir, las que siguen siendo semilla—. Reutiliza `marcaDe`/`campoDeMarca` de `conflictos.js`, no lee de Firestore, no toca D7 y no cambia el onboarding. Es D14 extendido a la mudanza: una semilla sigue siendo una semilla después de mudarse.

*Lo que cubre:* el caso medido (el `shared/profile` que pisó la nube era una semilla sin `updatedAt`).
*Lo que NO cubre, y es más ancho de lo que esta adenda escribió al principio:* todo lo que el recorrido **sella** sigue subiendo y pisando la nube. No es solo el `shared/onboarding` que sellan los pasos —tocar "Omitir" sella igual—: al terminar, `terminar()` (`useOnboarding.js`) escribe **el perfil entero** con `guardarPerfil(respuestas)` y el expediente con `completedAt`, los dos sellados y bajo el uid de la cuenta, así que quien entra por P7 a una cuenta con datos y llega hasta P8 **reemplaza en Firestore `shared/profile` y `shared/onboarding`** con lo que contestó —o con `name: null`, si saltó el nombre—. Y `adoptarArbol` escribe `shared/auth` sellado justo después de mudar (inocuo: mismo uid y correo, `phone: null` que nadie escribe). La opción 1 cierra el caso medido —la semilla que pisó la nube sin que nadie hubiera escrito nada— y no el camino entero de "entrar por P7 a una cuenta con datos". Eso es materia de DP-19.5. *(Corregido el 18 sep 2026 al ejecutar SPEC_17A.2.)*
*Coste:* bajo. Sin regresión: lo que una persona escribió sí sube igual que hoy.

**Opción 2 — La cola no arranca para un uid de cuenta hasta que ese uid tenga marca de restauración.**
Cierra el agujero entero, incluido el expediente sellado. *Coste:* una cuenta recién creada en P7 no respalda nada hasta el siguiente arranque, porque en esa sesión no se restaura (D7). Es una regresión real contra el criterio 18.

**Opción 3 — Restaurar antes de subir al adoptar, en `adoptarArbol`.**
Es el arreglo correcto de fondo y **revierte D7**. Arrastra las tres decisiones que D7 aplazó, y además una que no estaba prevista: `Entrada` relee `onboardingPendiente` cuando cambia el uid, así que un `completedAt` remoto recién bajado sacaría a la persona del onboarding en P7. Esto es SPEC_19, no SPEC_17A.

### Criterios de aceptación (para la opción 1)

1. Partiendo de un árbol sembrado por `initShared` bajo un uid local, tras `mudarUid(local, cuenta)` la cola **no** contiene ninguno de los cuatro documentos de `shared/` que sigan sin marca. `pendingCount` cuenta solo las filas con marca.
2. Una fila con marca legible —una entrada de mañana, un journal, un perfil que alguien editó— **sí** se reencola, como hoy.
3. La prueba de regresión de `adoptarArbol` sigue verde: la mudanza sigue sin pisar nada en local y sigue devolviendo `{mudados, conservados}` con los mismos números.
4. Prueba nueva end-to-end con dobles: árbol sembrado + `mudarUid` + `flush` ⇒ ninguna escritura a `users/{cuenta}/shared/*`.

### Reglas de arquitectura que roza

- **Nada se pierde.** Es literalmente la regla que hoy se rompe: se pierde en la nube, que es la única copia que sobrevive al teléfono.
- **RN-DB-04** ("lo ya escrito no se sobrescribe ni desaparece").
- **D14**, cuyo principio se extiende en vez de contradecirse.
- **Dirección de dependencias:** `local.js` pasaría a importar de `conflictos.js`. Ambos viven en `lib/db/` y `conflictos.js` es un módulo puro, así que no invierte nada. **Confírmalo antes de escribir código.**

---

## 3. DP-17.11 — La puerta del onboarding se decide una sola vez

**Abierta. Explica por qué el criterio 19 solo se cumplió a medias.**

### Ubicación exacta

- `src/App.jsx` → `Entrada`, el `useEffect` con dependencias `[uid]` que lee `onboardingPendiente(uid)` y `presentacionPendiente(uid)`.
- `src/lib/sesion.js` → `prepararArbol`, y su techo `TECHO_DE_ESPERA_MS`.
- `src/main.jsx` → `React.StrictMode`.

### Comportamiento actual

`Entrada` lee la puerta una vez por uid y no vuelve a leerla. Una restauración que termine después de esa lectura no reabre la decisión. Ocurre en dos situaciones:

- **En desarrollo, siempre.** `StrictMode` monta dos veces. El segundo pase encuentra `arranqueEvaluado.current === true`, así que no restaura; comprueba `getProfile(uid)`, que todavía es `null` porque la bajada sigue en vuelo; siembra; y `Entrada` lee el expediente **sembrado**, con `completedAt: null`. Los `fusionados: 3` del §1 son la huella de esa carrera: la bajada llegó después y escribió encima, ya demasiado tarde para la pantalla.
- **En producción, cuando la bajada cruza los 15 s** de `TECHO_DE_ESPERA_MS`. El velo baja, se siembra, se entra, y la puerta se decide sobre la semilla.

**Efecto:** se le enseña el onboarding a quien ya lo hizo. Y como terminarlo escribe un `completedAt` nuevo y vuelve a pasar por P7, **realimenta el DP-17.10**: el bucle que se observó dos veces en la validación.

La segunda recarga, con los datos ya en disco, entró directa a `#/hoy`. El dato estaba bien desde el primer arranque; la decisión se tomó antes de tiempo.

### Comportamiento esperado

Que una restauración que termina después no deje a la persona dentro de un recorrido que ya no le toca. Dos caminos, y **hay que elegir antes de codificar**:

- **(a) Que no se siembre mientras hay una bajada en vuelo para ese uid.** `prepararArbol` guarda la promesa en curso por uid; una segunda llamada la espera en vez de arrancar el camino de siembra. Arregla el caso de `StrictMode` de raíz y no toca la pantalla. **No arregla el caso del techo de 15 s.**
- **(b) Que la puerta se relea cuando la restauración termina.** `ArranqueProvisional` expone un sello que cambia al terminar la bajada, y `Entrada` lo añade a sus dependencias. Cubre los dos casos, pero hay que decidir qué pasa si la persona ya está tecleando su nombre en P2 cuando llega: sacarla de golpe es brusco, y dejarla es volver al problema.

Recomendación: **(a) en SPEC_17A**, que es pequeño, cierra el caso reproducible y no toca ninguna pantalla; **(b) se decide en SPEC_19**, que rehace la entrada con `onAuthStateChanged` y donde la pregunta "qué ve quien entra a una cuenta con datos" ya está abierta como DP-19.5.

### Criterios de aceptación (para (a))

1. Dos llamadas concurrentes a `prepararArbol(uid)` con el mismo uid producen **una** restauración y **una** siembra como mucho; la segunda espera a la primera.
2. Partiendo de local vacío, un `shared/onboarding` remoto con `completedAt` y `StrictMode` activo: la app entra a Hoy **en el primer arranque**, sin pasar por el onboarding. Es el criterio 19 de la instrucción, ahora verificable.
3. El guard de "una sola restauración por sesión" (`arranqueEvaluado`) sigue cumpliéndose: un cambio de uid en P7 no restaura.
4. Suite verde, incluidas las pruebas existentes de `prepararArbol` (marca huérfana, orden restaurar→sembrar, uid local sin restauración).

### Reglas de arquitectura que roza

- **Nada bloquea a la persona.** La espera sigue teniendo techo; esto no lo alarga.
- **Una regla, un sitio.** La lógica sigue en `lib/sesion.js`, sin React, que es donde la instrucción la puso para poder probarla sin navegador.

---

## 4. Corrección de redacción: criterio 20 (y SPEC_17 v2.0 §7.3)

**Dice:** "Tras restaurar en un dispositivo nuevo, el Journal pide **crear** PIN, no desbloquear con uno viejo."

**Lo que hace el código, y está bien:** `estadoPin` devuelve `activo: config?.enabled === true`. Sin `pinConfig` local no hay candado, así que el Journal **abre directo**. No pide nada. Crear un PIN se ofrece donde siempre, no como peaje de entrada.

**El criterio está mal redactado, no el código.** Pedirle a alguien que cree un PIN para leer lo suyo sería un bloqueo, y choca con "nada bloquea a la persona" y con RN-EST. Quien vuelva a correr el criterio tal como está lo marcaría como fallado.

**Redacción propuesta:** *"Tras restaurar en un dispositivo nuevo, el Journal abre sin candado y sin pedir el PIN anterior. `diario/pinConfig` no existe en local ni se descargó."*

### Observación de producto, no defecto

Restaurar en un dispositivo nuevo **abre el Journal sin PIN**. Es coherente con RN-DB-04 y con "nada bloquea": el PIN es un cerrojo local, no cifrado, y la puerta real es la contraseña de la cuenta. Si se quiere que el Journal siga cerrado tras restaurar, eso es cifrado en reposo o un PIN que viaje, y ninguna de las dos cosas está en el alcance congelado de la v1.0. Queda anotado para SPEC_23A/SPEC_24, sin proponerse para ahora.

---

## 5. Procedimiento de prueba de restauración que sí funciona

El criterio 19 dice "borrar solo la base `strivo` y recargar", y eso es correcto **siempre que exista una sesión real de Firebase Auth para ese uid**. Reconstruirla pasando otra vez por el onboarding es lo que dispara DP-17.10. Este es el camino que la evita.

Con la app en `localhost:5173` y DevTools abierto:

```js
// 1. Sesión de Auth real, sin tocar el árbol local ni llamar a mudarUid.
//    El 400 de signUp es el email-already-in-use esperado antes del signIn.
const { crearConCorreo } = await import('/src/onboarding/cuenta.js');
await crearConCorreo(correo, contrasena);   // ⇒ { ok: true, uid: '…' }

// 2. El uid con el que arrancará la próxima carga.
localStorage.setItem('strivo.uid.local', uid);
localStorage.removeItem(`strivo.restaurado.${uid}`);

// 3. Cerrar la conexión ANTES de borrar. Con una conexión abierta,
//    deleteDatabase se queda en 'blocked' y no borra nada, en silencio.
const local = await import('/src/lib/db/local.js');
await local.closeLocalDB();
indexedDB.deleteDatabase('strivo');

// 4. Recargar. Y para leer el resultado por dentro en vez de deducirlo:
const { ultimoResultado } = await import('/src/lib/db/restaurar.js');
ultimoResultado(uid);   // ⇒ { ok: true, escritos: N, fusionados: M }
```

### Cuatro cosas que conviene no volver a aprender por las malas

1. **Escribir `strivo.uid.local` a mano no basta.** Las reglas de Firestore son uid-scoped y exigen `auth.currentUser` para ese uid. Sin sesión real, `restaurar()` falla por permisos en silencio (`motivo: interrumpida`), se siembra un árbol vacío y se acaba en el onboarding.
2. ~~**`deleteDatabase` no borra con una conexión abierta.** Se queda en `blocked` sin lanzar error. Hay que `closeLocalDB()` primero.~~ **Corregido por DP-17.12 (18 sep 2026):** la conexión se suelta sola cuando alguien pide borrar o migrar la base —`getLocalDB` declara `blocking` y `terminated`—, así que el borrado con la app abierta resuelve por `success` y la siguiente lectura reabre. El paso 3 del procedimiento de arriba sigue siendo válido pero ya no es necesario; lo que motivó la corrección fue que un `blocked` permanente dejaba después colgada cualquier transacción de la página.
3. **Tocar "Omitir" sí marca el paso como completado** y sí sella `updatedAt`. Lo único que abre o cierra la puerta es `completedAt`, y solo lo escribe `terminar()` al final del recorrido: salirse en P7 deja el expediente a medias, con `currentStep: "p7"`.
4. **`localhost:5173` es un origen compartido.** Conviven ahí bases de otros proyectos (`strivo-local`, `trazia`) y claves viejas (`strivo.localUserId`). "Limpiar todo" en ese origen es ambiguo: hay que borrar por nombre y verificar con `indexedDB.databases()`.

---

## 6. Qué queda por hacer

1. ~~Decidir DP-17.10 y DP-17.11.~~ **Hecho (SPEC_17A.2, 18 sep 2026):** opción 1 para DP-17.10 y camino (a) para DP-17.11, los dos implementados y probados.
2. ~~Aplicar las correcciones de §2 (tres afirmaciones falsas) y §4 (criterio 20) a `CLAUDE.md`, a la instrucción de ejecución y a SPEC_17 v2.0.~~ **Hecho** en el mismo commit de documentación, con la limitación de §2 ampliada como se describe allí.
3. Ejecutar el Bloque 4 (estados `pendiente` y `sinConexion`), que cierra el criterio 21.
4. **Pista para el Bloque 4:** el botón "Intentar de nuevo" de Perfil no tuvo efecto visible al probarlo. `ultimoResultado` vive en un `Map` en memoria de módulo y se pierde en cada recarga, así que tras recargar no hay fallo que reintentar y el botón puede estar apareciendo o comportándose de forma distinta a la esperada. Verificar antes de dar el criterio 21 por bueno.
5. El caso del techo de 15 s en DP-17.11 —la bajada que cruza el techo y la puerta ya decidida— queda para SPEC_19, con DP-19.5.

**Mientras DP-19.5 siga abierta:** no entrar por P7 con ninguna cuenta que tenga datos reales en la nube, incluidas las de prueba. DP-17.10 cerró la semilla que pisaba sin que nadie escribiera; terminar el recorrido sigue escribiendo el perfil y el expediente sellados bajo la cuenta, y eso sí pisa (§2, "Lo que NO cubre").
