# INSTRUCCIÓN SPEC_31 — Que lo escrito suba solo y lo de la cuenta llegue a la primera

**Para:** Claude Code
**Fecha:** 1 nov 2026 · **Versión:** 1.2 (reporte previo aprobado el 1 nov 2026, §9; pruebas manuales pasadas el 10 nov 2026, §10)
**Rama de partida:** `strivo` en `3557866`, la fusión de SPEC_21.2. Compruébalo en §0.
**Gobierna:** esta instrucción + `docs/specs/BITACORA_PRUEBAS_SPEC_21_2.md` (O-1, O-2, O-3 y D-N8) + `docs/specs/SPEC_17A_INSTRUCCION_EJECUCION.md` + `docs/specs/INSTRUCCION_SPEC_19_1_SESION.md` + `docs/specs/SPEC_30_ENTRAR_DESDE_LA_BIENVENIDA.md` + `SPEC_00B` + `CLAUDE.md`. **Donde esta instrucción y otra difieran, manda esta.**
**Por qué existe:** las pruebas de SPEC_21.2 en el iPhone encontraron tres fallos de la conexión con Firestore que **no causó 21.2** y que **bloquean la publicación**. Viven en código de SPEC_17A y SPEC_19, y pasan también en la web publicada.

---

## 0. Antes de escribir una sola línea

1. Lee `CLAUDE.md` (secciones «Lo que subió a la nube vuelve a bajar (SPEC_17A)», «Sesión real (SPEC_19.1)», «Entrar a una cuenta desde la bienvenida (SPEC_30)» y «Google y Apple en la app de iPhone (SPEC_21.2)»), la bitácora de 21.2 entera y esta instrucción.
2. Comprueba que HEAD de `strivo` es `3557866` o la contiene (`git merge-base --is-ancestor 3557866 HEAD`). Si no, **para**.
3. Inspecciona: `src/lib/db/sync.js` (`flush`, `scheduleRetry`, `startSync`, `flushEnCurso`), `src/lib/db/local.js` (`enqueue`, `markQueueAttempt`), `src/lib/db/restaurar.js` (las lecturas de `getDoc`/`getDocs`), `src/lib/sesion.js` (`TECHO_DE_ESPERA_MS`, `prepararArbol` y su `Promise.race`), `src/lib/entradaCuenta.js` (`entrarACuenta`), `src/lib/salidaCuenta.js` (`comprobarCola`), `src/perfil/useSincronizacion.js` (`reintentarYMirar`), `src/components/ArranqueProvisional.jsx` (`reintentarRestauracion`, el efecto de `startSync`), `src/lib/firebase.js` (`getFirestore`), y sus pruebas.
4. Entrega un **reporte previo** con todos los puntos marcados **REPORTA**, la lista de archivos que vas a crear o tocar, y el protocolo de medición del §0.1 listo para que la fundadora lo siga.
5. **Espera la aprobación de la fundadora.** No cambies código antes.

### 0.1 Medir antes de arreglar (O-1)

O-1 solo se ve en el iPhone, y Claude Code no tiene el iPhone. La fundadora mide; tú preparas cómo.

- Escribe para la fundadora, **en pasos simples y en español** (no es experta en lo técnico), cómo abrir el **Inspector web de Safari** contra la app instalada desde Xcode: qué activar en el iPhone, qué menú usar en Safari de la Mac, y cómo dejar abierta la consola **antes** de entrar a una cuenta.
- Dile exactamente qué copiar o capturar: los mensajes de la consola durante el velo «Recuperando lo que escribiste.» (en especial cualquier «client is offline», «Could not reach Cloud Firestore backend» o avisos de WebChannel / long polling) y cuánto tardó.
- Si hace falta registrar algo para medir (por ejemplo, el tiempo de la primera lectura de `restaurar` y el error con que falla), propón un registro **temporal**, que solo exista en el build de diagnóstico y que salga antes del commit final. **REPORTA** qué añadirías y cómo se retira.
- Mide dos variantes en instalaciones nuevas: Firestore como hoy, y con long polling forzado solo en nativo (DP-31.1). **REPORTA** cómo se arma cada build sin tocar la web.

---

## 1. Decisiones

### 1.1 Ya tomadas, no se reabren

| DP | Decisión |
|---|---|
| RN-01 / RN-DB-01 | Local primero. Lo escrito ya está a salvo en IndexedDB antes de que la red entre en juego. Nada de esto cambia ese orden. |
| DP-17.10, DP-19.5 | Entrar a una cuenta con datos nunca pisa la nube. Las reglas de fusión (`conflictos.js`) y la mudanza no se tocan. |
| DP-19.1 | Con la cola no vacía no se cierra sesión. |
| — | Firestore es de solo escritura salvo `restaurar.js`. Sin lecturas nuevas. |
| D-N8 (1 nov 2026) | Opción (c): una pista en el mensaje de contraseña equivocada para la 1.0 (§6); verificar el correo al crear la cuenta, **después** del lanzamiento y fuera de esta SPEC. |

### 1.2 Nuevas, para confirmar en el reporte previo

| DP | Propuesta |
|---|---|
| **DP-31.1** | **Firestore en la app de iPhone:** si la medición del §0.1 lo confirma, `initializeFirestore` con long polling forzado **solo en nativo** (`esNativa()`); la web se queda como está. Si la medición no lo confirma, no se cambia y se **REPORTA** qué se vio. |
| **DP-31.2** | **Ninguna espera de red es infinita.** Cada escritura de `flush` y cada lectura de `restaurar` tienen tiempo límite. Pasado el límite cuentan como fallo: la entrada sigue en la cola y se programa el reintento. **REPORTA** el valor propuesto y por qué. |
| **DP-31.3** | **Escribir pone la cola en marcha.** Tras encolar, la subida arranca sola en segundos, sin esperar a cambiar de pantalla ni a que alguien toque «Intentar de nuevo». Con varias escrituras seguidas, un solo vaciado (agrupar, no uno por tecla). **REPORTA** dónde va el disparo sin romper la dirección de dependencias. |
| **DP-31.4** | **Reintentos con red, en segundos.** La espera entre reintentos se acorta mientras haya red; con `navigator.onLine === false` no se gasta nada y se espera al evento `online`. **REPORTA** la escala propuesta. |
| **DP-31.5** | **La primera bajada se reintenta sola una vez** antes de enseñar el aviso de restauración (C7), dentro del mismo techo o con un techo nuevo. **REPORTA** si conviene y con qué tiempos, después de medir. |

Criterio de producto de la fundadora, que manda sobre todo lo anterior: **con red, lo escrito llega a la nube en segundos y sola, y quien cambia de iPhone ve lo suyo a la primera.**

---

## 2. Lo que se vio y lo que ya está verificado en el código

### O-3 · En el iPhone, «Guardando» ~1 minuto hasta tocar «Intentar de nuevo»

**Verificado en el código (1 nov 2026), y es la causa más probable:** **nada pone la cola en marcha después de escribir.** `enqueue` (`local.js`) guarda en `syncQueue` y termina; no llama a `flush` ni avisa a nadie. `flush` solo corre en: `startSync` al montar con cuenta, el evento `online`, `visibilitychange` a visible, el temporizador de `scheduleRetry` (que solo existe tras un fallo), «Intentar de nuevo» de Tu perfil (`reintentarYMirar`) y la comprobación de salida (`comprobarCola`). Con la app abierta y en primer plano, **lo escrito se queda en la cola hasta que pasa una de esas cosas.** Encaja exacto con O-3: escribió, «Guardando», tocó el botón y subió en el acto. **REPORTA** si lo confirmas, y por qué el criterio 18 de 17A («llega sin intervención») pasó en septiembre (probablemente un cambio de pestaña).

### O-2 · En la web, «Guardando» más de 13 minutos y el botón no hacía nada

Cuenta nueva con Google en Netlify; se escribió en Hoy y Journal. En Firestore solo llegó `shared/`; `diario/` no. **Ningún error** en la consola. Al **recargar**, todo subió.

- La parte de «no subía» la explica O-3.
- La parte de «el botón no hacía nada» apunta a una espera colgada: `flush` hace `await setDoc(...)` **sin tiempo límite**; si la conexión se cuelga, `flushing` queda en `true`, cada `flush` siguiente devuelve `en_curso` y `reintentarYMirar` y `comprobarCola` esperan a `flushEnCurso()`, que no termina. **Además**, `reintentarYMirar` hace `await restaurar(uid)` antes de vaciar si la última restauración falló, y `restaurar` tampoco tiene límite fuera del `Promise.race` de `prepararArbol`. **REPORTA** cuál de las dos esperas se colgó, o si pudo ser cualquiera.
- Consecuencia en el iPhone que hay que evitar: con una espera colgada, **«Cerrar sesión» tampoco respondería**, porque `comprobarCola` espera lo mismo.

### O-1 · La primera bajada de una cuenta en el iPhone acaba en el aviso de restauración

Al entrar a una cuenta con datos en la app de iPhone recién instalada, el velo dura 10–15 s y sale el aviso C7 con «Intentar de nuevo»; el reintento siempre funciona y, si la bajada termina por detrás, la vista avanza sola. **5 de 6 instalaciones nuevas** y **1 de 4** entradas con la app ya usada. Con correo y con Google. Nada se pierde. Tabla completa en la bitácora.

**Hipótesis, sin confirmar:** el SDK marca el cliente como «sin conexión» si no conecta en ~10 s y las lecturas fallan con «client is offline»; en el WebView de iOS el canal de streaming de WebChannel puede no abrirse y la detección automática de long polling tarda en caer al respaldo. Los casos de 15 s serían el mismo atasco cortado por `TECHO_DE_ESPERA_MS`. Se confirma o se descarta con la medición del §0.1.

---

## 3. Alcance

**Entra:** el disparo de la cola al escribir; tiempos límite en `flush` y en las lecturas de `restaurar`; que «Intentar de nuevo» y «Cerrar sesión» nunca esperen sin fin; la escala de reintentos; la configuración de Firestore en nativo si la medición lo pide; el reintento automático de la primera bajada si se aprueba; la pista de D-N8 (§6); pruebas; `CLAUDE.md`.

**No entra:** SQLite (SPEC_17B); cambiar las reglas de fusión, la mudanza o el modelo de datos; lecturas nuevas de Firestore; `onSnapshot` o tiempo real; verificar el correo (D-N8, parte b); D-21.11, D-21.13; subir a firebase 12.

---

## 4. Cambios esperados (a confirmar en el reporte previo)

- **`src/lib/db/sync.js`:** disparo agrupado tras encolar (DP-31.3); tiempo límite por escritura que cuente como fallo (DP-31.2); escala de reintentos con red (DP-31.4); `flushEnCurso()` que termina siempre, también si la escritura se colgó.
- **`src/lib/db/restaurar.js`:** tiempo límite en cada lectura; un fallo por tiempo es `interrumpida`, nunca una bajada a medias que se dé por buena. El `sync: false` de la bajada y la lista literal de rutas no cambian.
- **`src/perfil/useSincronizacion.js` y `src/lib/salidaCuenta.js`:** «Intentar de nuevo» y la comprobación de salida contestan en un tiempo acotado; si la subida sigue sin salir, se dice con los textos que ya existen. **Ningún botón se queda sin respuesta.**
- **`src/lib/firebase.js`:** solo si DP-31.1 se confirma; la web no cambia.
- **`src/lib/sesion.js` / `entradaCuenta.js`:** solo si DP-31.5 se aprueba.
- **`src/copy/index.js`:** la pista de D-N8 (§6). Nada más de copy, salvo que el reporte previo lo justifique.
- **`CLAUDE.md`:** qué pone en marcha la cola, los límites de tiempo y por qué, y lo que se midió en el iPhone. Corrige donde diga que lo escrito sube «sin intervención» si no era cierto con la app en primer plano.

---

## 5. Criterios de aceptación

### Automáticos (Claude Code)

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde.
2. Tras encolar una escritura con red, `flush` corre solo, sin `online`, sin `visibilitychange` y sin botón. Diez escrituras seguidas producen un vaciado agrupado, no diez.
3. Un `setDoc` que nunca resuelve (doble colgado) cuenta como fallo pasado el límite: la entrada sigue en la cola, `flushing` vuelve a `false`, se programa el reintento y el siguiente `flush` no devuelve `en_curso`.
4. Una lectura de `restaurar` que nunca resuelve termina pasado el límite como `interrumpida` y no escribe nada a medias.
5. `reintentarYMirar` y `comprobarCola` resuelven en tiempo acotado aunque Firestore esté colgado.
6. Sin red (`navigator.onLine === false`) no se programa ningún reintento; al llegar `online`, se vacía.
7. `diario/pinConfig` y las rutas de `esRutaLocal` siguen sin entrar en la cola. `getDoc`/`getDocs` siguen solo en `restaurar.js`.
8. Las pruebas de SPEC_17A, 19.1, 19.2, 30 y 21.2 siguen pasando sin cambiar lo que comprueban.
9. Si DP-31.1 entra: en web `firebase.js` sigue con `getFirestore`; en nativo, la configuración nueva. Una prueba lo vigila.
10. La pista de D-N8 sale en `CUENTA.error.credenciales` y pasa `lint:copy`.

### Manuales (la fundadora, contra `strivo-fe04f`)

- **M1 (O-3, iPhone).** Con cuenta, escribir algo en Hoy y abrir Tu perfil **sin tocar nada**: pasa a «Todo guardado» en pocos segundos.
- **M2 (O-2, web).** En Netlify o `localhost`, cuenta nueva, escribir en Hoy y Journal **sin recargar**: «Todo guardado» en pocos segundos, y `diario/` aparece en Firestore.
- **M3 (O-1, iPhone).** Cinco entradas a una cuenta con datos en instalaciones nuevas (borrar app → ▶): las cinco llegan a sus días **sin el aviso de restauración**. Se anota cuánto dura el velo en cada una.
- **M4 (red que se va).** Escribir con modo avión → «Guardando» sin mensajes de error → quitar el modo avión → sube sola, sin tocar nada.
- **M5 (nada se queda colgado).** Con modo avión puesto a mitad de una subida, «Intentar de nuevo» y «Cerrar sesión» **siempre responden**; cerrar sesión sigue sin dejar salir con algo pendiente (DP-19.1), pero lo dice.
- **M6 (D-N8).** Contraseña equivocada en la vista de entrar, en P7 y en Tu perfil: sale el mensaje con la pista.
- **M7 (regresión).** N1, N3 y N6 de SPEC_21.2 siguen pasando.

---

## 6. Copy

**La redacción final es de la fundadora.** Propuesta para `CUENTA.error.credenciales`:

| Hoy | Propuesta |
|---|---|
| Ese correo y esa contraseña no coinciden. | Ese correo y esa contraseña no coinciden. Si alguna vez entraste con Google o Apple, usa ese botón. |

En web no hay botón de Apple: **REPORTA** si conviene una variante solo con Google para la web, o si la misma frase sirve en las dos.

---

## 7. Reglas de arquitectura que roza

- **Nada se pierde:** un tiempo límite nunca saca una entrada de la cola sin confirmación de Firestore. La entrada solo se borra tras el `setDoc` confirmado.
- **Nada bloquea:** ningún botón se queda sin respuesta; la app sigue entera sin red.
- **Un error de red no es un error visible** mientras el guardado local funcione (RN-EST-05). Sin códigos, sin ruedas, sin cifras de pendientes.
- **Dirección de dependencias:** `lib/db/` no importa de `breathing/`, `diario/` ni componentes.
- **Una regla, un sitio:** los tiempos límite y la escala de reintentos viven en una sola constante cada uno, con su prueba.
- **Nada secreto en el repo:** ni el Team ni `GoogleService-Info.plist`. Commits por ruta, nunca `git add -A`, `git add .` ni `git commit -a`; antes de comitear, `git show :ios/App/App.xcodeproj/project.pbxproj | grep DEVELOPMENT_TEAM` sale vacío.

---

## 8. Entrega

1. Rama local `revision-31` creada desde `strivo`. Commits pequeños y por tema (cola y disparo / límites de tiempo / reintentos / Firestore en nativo / primera bajada / copy / docs), cada uno con la línea `Co-Authored-By` del repo, añadiendo archivos por ruta. Si cambias de rama: `git stash push -m "team-firma" -- ios/App/App.xcodeproj/project.pbxproj` antes y `git stash pop` después.
2. **Sin push** hasta que la fundadora lo apruebe; entonces `git push origin revision-31`. Nunca a `strivo` directamente.
3. Reporte final: qué se hizo, qué se midió y qué decidió la medición, cada **REPORTA** con su respuesta, la salida de las siete validaciones, archivos y casos de prueba antes y después, y la lista M1–M7 para la fundadora.

---

## 9. Reporte previo y decisiones (1 nov 2026)

Reporte previo de Claude Code aprobado por la fundadora, con dos agregados.

| Punto | Decisión |
|---|---|
| O-3 | **Confirmado:** `enqueue` no pone la cola en marcha. El criterio 18 de 17A pasó porque, para mirar Firestore, se cambiaba de pestaña y el regreso (`visibilitychange`) disparaba `flush`: se midió «llega sin tocar la app», no «llega sola». |
| O-2 | Se colgó el `setDoc` de `flush`; `restaurar` descartado para ese caso (cuenta nueva, `restaurarSiHaceFalta: false`). |
| H-1 (nuevo) | `dequeue(seq)` podía borrar una versión más nueva de la misma ruta sin enviarla: la nube se quedaba con la vieja. Se saca una entrada solo si sigue siendo la que se envió (contador de revisión, en transacción). Las entradas antiguas sin contador siguen funcionando. |
| H-2 (nuevo) | La guarda de `flush` iba después de un `await`: dos vaciados podían correr a la vez. La guarda va antes. |
| H-3 (nuevo) | Se programaban reintentos sin red. Ya no; `offline` cancela el pendiente. |
| DP-31.2 | **10 s** por escritura y por lectura (`LIMITE_DE_RED_MS`, `src/lib/db/limite.js`, helper `conLimite`). Una lectura vencida termina la bajada como `interrumpida`, sin marca; lo ya bajado se queda y nada de una lectura abandonada se escribe si llega tarde. |
| DP-31.3 | Aviso `alEncolar` en `local.js`, suscrito por `startSync`. **2 s** (`DEMORA_DE_SUBIDA_MS`) desde la primera escritura, sin reiniciar. |
| DP-31.4 | `[2000, 5000, 10000, 20000, 30000]`, sin reintentos sin red. |
| Botones | «Intentar de nuevo» y la comprobación de salida esperan como máximo 15 s (`conTecho`). |
| Agregado a | **Reabrir la conexión** tras una escritura vencida: `disableNetwork` y luego `enableNetwork` antes del siguiente intento. Una conexión muerta no se recupera sola (O-2: 13 minutos hasta recargar). |
| Agregado b | **Vaciar al irse al fondo** (`visibilitychange` a `hidden` y `pagehide`), sin esperar los 2 s. |
| D-N8 | iPhone: «Ese correo y esa contraseña no coinciden. Si alguna vez entraste con Google o con Apple, prueba con ese botón.» Web: «Ese correo y esa contraseña no coinciden. Si alguna vez entraste con Google, prueba con ese botón.» (`credencialesNativa` y `credenciales`). La del PIN no cambia. |
| DP-31.1, DP-31.5 | En espera de la medición. Rama `diagnostico-31` (`b061b96`, solo registro temporal `[strivo-diag]`, no se fusiona nunca); variante A como hoy, variante B con long polling forzado en nativo. 3 intentos por variante con la cuenta A y 1 con la cuenta B por Google. |
| Trabajo | `revision-31` en un worktree aparte (`~/Developer/strivo-31`) para no cambiar de rama donde la fundadora compila. 4 commits, 98 archivos · 2.534 casos, siete validaciones en verde. Caso límite aceptado: una restauración que lee mientras se reabre la conexión falla como `interrumpida` y se reintenta. |

---

## 10. Cambio de plan y pruebas manuales (10 nov 2026)

**Sin medición con el Inspector web.** El 10 nov la fundadora intentó el protocolo del §0.1 (`claude/PROTOCOLO_MEDICION_O1_SPEC_31.md`) y resultó demasiado complejo de seguir; además, el primer intento entró en 2 s, así que con pocos intentos O-1 podía no reproducirse. Se decidió aplicar **DP-31.1** (long polling forzado solo en nativo, `opcionesDeFirestore(nativa)` en `firebase.js`; la web sigue con `getFirestore`) y **DP-31.5** (`restaurarConUnReintento`, compartido por `prepararArbol` y `entrarACuenta`: un reintento si la bajada falla como `interrumpida` y quedan al menos 3 s del techo de 15 s) sin medir antes, y validar con las pruebas manuales. Si O-1 hubiera seguido, se investigaba aparte. La rama `diagnostico-31` se borró sin fusionarse. `sesion.test.js` ahora espera tres restauraciones en lugar de dos. Suite: 2.546 casos, siete validaciones en verde.

**Resultado: todas las pruebas manuales pasan** (iPhone de la fundadora, `revision-31`, contra `strivo-fe04f`, Wi-Fi):

| Prueba | Resultado |
|---|---|
| **M3 (O-1)** | ✅ 5 de 5 instalaciones nuevas directo a Hoy, en 2–3 s, sin aviso de restauración (3 por correo, 2 por Google). Antes de SPEC_31: 5 de 6 con aviso. |
| **M1 (O-3)** | ✅ Escribir en Hoy y abrir Tu perfil sin tocar nada: «Lo de este teléfono está guardado en tu cuenta.» casi al instante. |
| **M4** | ✅ Con modo avión, lo escrito queda por guardar sin mensajes alarmantes; al quitarlo, sube solo. |
| **M5 (O-2)** | ✅ Sin red, «Intentar de nuevo» responde en menos de 15 s; «Cerrar sesión» responde, avisa que hay cosas sin subir y solo ofrece «Quedarme». |
| **M6 (D-N8)** | ✅ La pista sale en la vista de entrar (P1), en P7 («Ya tengo una cuenta») y en Tu perfil; en el iPhone menciona Google y Apple, en la web solo Google. La fundadora aprueba la redacción tal cual. |
| **M7 (regresión)** | ✅ Tras cerrar sesión, Google pregunta con qué cuenta y entra a sus días; Apple abre su hoja y entra sin error. |
| **M2 (web)** | ✅ En `localhost` (`npm run dev`, `revision-31`), escribir en Hoy y Journal sin recargar: guardado en pocos segundos. |

Las cuentas de prueba cambiaron de método durante las pruebas (la de correo entró por Google y viceversa); no afecta a los resultados.
