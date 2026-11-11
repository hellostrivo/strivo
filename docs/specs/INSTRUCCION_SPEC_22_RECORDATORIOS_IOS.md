# INSTRUCCIÓN SPEC_22 — Los recordatorios llegan en el iPhone

**Para:** Claude Code
**Fecha:** 10 nov 2026 · **Versión:** 1.2 (reporte previo aprobado el 11 nov 2026: §9; pruebas manuales pasadas el 11 nov 2026: §10. **Donde §9 y el resto difieran, manda §9**)
**Rama de partida:** `strivo` en `23a7990`, la fusión de SPEC_17B. Compruébalo en §0.
**Gobierna:** esta instrucción + `docs/specs/SPEC_22_RECORDATORIOS_LOCALES_IOS.md` + `docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md` + `docs/specs/INSTRUCCION_SPEC_21_2_GOOGLE_Y_APPLE.md` + `docs/specs/INSTRUCCION_SPEC_17B_SQLITE.md` + `SPEC_00B` + `CLAUDE.md`. **Donde esta instrucción y otra difieran, manda esta.** En particular, **corrige varias partes de SPEC_22**, que se escribió en septiembre, antes de que existieran P6, los horarios de Tu perfil y la app de iPhone (ver §2.6).
**Por qué existe:** en la app de iPhone, P6 dice «Este dispositivo no tiene avisos. Strivo funciona igual.». WKWebView no tiene `Notification`, así que `recordatorios.js` cae en `sin_soporte`. Es verdad, pero no es lo que alguien espera leer en un iPhone, y P6 promete «Dos avisos al día, a las horas que elegiste» que hoy no llegan en ninguna plataforma.
**Por qué ahora:** CLAUDE.md lo anota como deuda que **se cierra antes de cualquier build para testers externos**.

---

## 0. Antes de escribir una sola línea

1. Lee `CLAUDE.md` (secciones «App iOS (SPEC_21.1)», «Google y Apple en la app de iPhone (SPEC_21.2)», «Lo escrito en el iPhone, en SQLite (SPEC_17B)», «Que lo escrito suba solo (SPEC_31)» y, en «Deuda consciente», las dos entradas de los avisos de P6), `SPEC_22` y esta instrucción entera.
2. Comprueba que HEAD de `strivo` es `23a7990` o la contiene (`git merge-base --is-ancestor 23a7990 HEAD`). Si no, **para**.
3. Inspecciona: `src/onboarding/recordatorios.js` y su prueba; `src/components/onboarding/Recordatorios.jsx` y `Onboarding.jsx` (`activarAvisos`, `avisos`, `hayContinuar`); `src/onboarding/escritura.js` (`escribirRecordatorios`) y `useOnboarding.js`; `src/onboarding/horarios.js` (`DESPERTAR_SUGERIDO`, `DORMIR_SUGERIDO`); `src/lib/db/schema.js` (`FIELDS.preferences`, `FIELDS.profile`) y `src/lib/db/shared.js` (la siembra de `remindersEnabled: false`, `getPreferences`, `updatePreferences`, `getProfile`); `src/lib/db/dates.js` (`strivoDateKey`); `src/lib/db/diario.js` (cómo se lee el `completedAt` de una mañana y una noche); `src/diario/useDiario.js` (dónde se escribe `completedAt` al cerrar cada recorrido); `src/pages/diario/Hoy.jsx` (`momentoInicial`, `setMomento`, `fechaPedida`); `src/App.jsx` (rutas, cuándo se montan las secciones frente al onboarding); `src/perfil/bloques.js`, `src/perfil/usePerfil.js`, `src/components/perfil/Perfil.jsx` y `DiagnosticoAlmacen.jsx`; `src/copy/index.js` (`copy.notifications`, `onboarding.p6`, `perfil.horarios`) y `src/copy/diagnostico.js`; `src/lib/salidaCuenta.js`; `src/lib/plataforma.js`; `src/lib/credencialNativa.js` (la carga bajo demanda y la lección del Proxy); `capacitor.config.json`; `ios/App/App/Info.plist`; `ios/App/App/App.entitlements`; `src/lib/__tests__/appIos.test.js`; `scripts/lint-copy.js`.
4. Lee el código iOS del plugin **antes** de proponer (DP-22.13). Puedes instalarlo en una rama desechable que se borra después; no en `strivo` ni en `revision-22` hasta la aprobación.
5. Entrega un **reporte previo** con todos los puntos marcados **REPORTA**, la lista de archivos que vas a crear o tocar, y **los textos exactos que la fundadora verá en pantalla** en cada prueba manual del §5: en P6, en el bloque nuevo de Tu perfil en cada estado de la tabla de DP-22.8, en el aviso y en las líneas de diagnóstico.
6. **Espera la aprobación de la fundadora.** No cambies código antes.

---

## 1. Decisiones

### 1.1 Ya tomadas, no se reabren

| Origen | Decisión |
|---|---|
| SPEC_22 (corrección del Gantt) | **Notificaciones locales, programadas en el teléfono.** Sin servidor, sin APNs, sin push remoto, sin Web Push. Nada sale del dispositivo. |
| DP-21.3 / DP-21.8 / DP-17B.2 | **El identificador (`com.hellostrivo.strivo`), el esquema y host del WebView (`capacitor://localhost`, los de fábrica) y la base SQLite (`Library/Strivo/strivo.sqlite`) no se tocan.** Nada de `server`, `scheme`, `hostname` ni `allowNavigation` en `capacitor.config.json`. |
| SPEC_21.1 | **`UIBackgroundModes` se queda como está** (`audio`, para SPEC_23). Los avisos locales no necesitan modo de fondo. **No se añade `remote-notification`**, ni el entitlement `aps-environment`, ni la capacidad Push Notifications en Xcode: declarar push sin usarlo es motivo de rechazo. |
| RN-VOZ-01 / RN-VOZ-02 / CLAUDE.md §3 | **Todo texto, también el del aviso, vive en `src/copy/` y pasa `lint:copy`.** Sin léxico prohibido y **sin signos de exclamación**. El aviso **no lleva el nombre de la persona ni nada de lo que escribió**: aparece en una pantalla bloqueada que puede estar a la vista. |
| CLAUDE.md §1.2 y §14 | **Los avisos no prometen lo que la app no cumple ni evalúan a nadie.** Nunca «hace 3 días que no escribes», nunca una cuenta, nunca una insignia numérica en el ícono. Solo llegan los dos que la persona pidió. |
| Fundadora, 10 nov 2026 | **La web sigue igual.** Mismo P6, mismo Tu perfil, mismos textos, y nada del plugin en lo que descarga la web (DP-22.2). |
| SPEC_21.2 | **Ningún objeto de plugin de Capacitor sale suelto de una promesa** (el Proxy contesta a `then` y el `await` se cuelga para siempre, sin error). Se devuelve envuelto, como `cargarPlugin` (`{ plugin }`). |
| SPEC_17B | **Pruebas manuales solo con lo que se ve en pantalla.** Sin consola de Safari, sin Inspector web y sin la consola de Xcode. Lo que haga falta ver se pinta en pantalla en un build de diagnóstico (DP-22.12). |
| SPEC_17B | **Tras borrar la app, la primera apertura de una compilación de Xcode necesita internet** para verificar el certificado de desarrolladora. Ninguna prueba manual pide abrirla sin red. |
| `plataforma.js` | `esNativa()` sigue siendo la única pregunta por la plataforma (ver DP-22.13 para Android). |

### 1.2 Nuevas, para confirmar en el reporte previo

| DP | Propuesta |
|---|---|
| **DP-22.1 · A qué hora llegan** | **A las horas de «Cómo son tus días»**: `profile.wakeTime` para la mañana y `profile.sleepTime` para la noche, a la hora exacta. **Sin campo nuevo en el modelo** y sin las 08:00 y 21:30 de SPEC_22. Motivo: P6 ya enseña «07:00 · ¿Cómo quieres sentirte hoy?» y dice «a las horas que elegiste»; dos juegos de horas se separarían. Esas horas ya viajan a la nube, así que tras reinstalar con cuenta vuelven solas (criterio 5 de SPEC_22). Sin hora, ese aviso no se programa. **REPORTA** si algún consumidor de `wakeTime`/`sleepTime` se vería afectado. |
| **DP-22.2 · La web** | **En la web no cambia nada:** P6 sigue pidiendo el permiso del navegador como hoy, con los mismos textos, y **el bloque nuevo de Tu perfil no existe en la web** (no se pinta, ni con un texto de «solo en la app»). La deuda «Los avisos de P6 se piden, pero todavía no llegan» **sigue abierta solo para la web** y queda ligada a DP-21.5 (si la PWA sigue pública). |
| **DP-22.3 · Un interruptor o dos** | **Uno**, el que ya existe: `preferences.remindersEnabled`, para los dos avisos a la vez, igual que P6 los pide a la vez. Sin cambios en el modelo. Alternativa (dos interruptores, Mañana y Noche) **cambia el modelo** (RN-DB-03) y la fundadora la decidiría aparte. **REPORTA** quién más lee o escribe `remindersEnabled`. |
| **DP-22.4 · Qué dice el aviso** | **Siempre el mismo texto, y es el que enseña P6:** `copy.notifications.manana` («¿Cómo quieres sentirte hoy?») y `copy.notifications.noche` («¿Cómo cerrar el día?»). **Sin título**: iOS ya pone el ícono y el nombre de la app encima, y un título «Strivo» lo repetiría. Motivo: el comentario de `Recordatorios.jsx` ya lo decide (una vista previa distinta de lo que llega sería una maqueta), y cambiar esos textos cambiaría también la web. Alternativa: los cuerpos rotativos de SPEC_22 §4, con el primero de cada lista igual al de P6; la decide la fundadora con los textos delante. |
| **DP-22.5 · Cómo se programan** | **Una ventana de 14 días de avisos fechados**: hasta 28 pendientes (lejos del límite de 64 de iOS). Cada aviso con disparador de calendario **de fecha completa** (`schedule.on` con `year`, `month`, `day`, `hour`, `minute`), que sigue la hora de pared del teléfono aunque cambie la zona horaria. **Nunca `schedule.at`** y **nunca un aviso diario repetido con `on: { hour, minute }`** (§2.4 explica por qué). La ventana se rehace cada vez que se reconcilia (DP-22.9). **Consecuencia que se acepta y se escribe en CLAUDE.md:** si alguien no abre la app en 14 días, los avisos dejan de llegar; al abrirla vuelven. Strivo no insiste con quien se fue. **REPORTA** si propones otro número. |
| **DP-22.6 · Si ya hiciste ese momento** | **Ese día, ese aviso no llega.** Un momento está hecho cuando su registro de ese día tiene `completedAt` (RN-DB-09): `morningEntry/{fecha}` para la mañana y `nightRitual/{fecha}` para la noche. A qué día pertenece cada aviso lo decide `strivoDateKey` con el `diaTerminaA` del perfil (una noche a las 00:30 con corte a las 03:00 es la noche del día anterior). Además, **al cerrar un momento se retira del Centro de notificaciones el aviso de ese momento y ese día**, si sigue ahí. **REPORTA** qué pasa con una hora de despertar anterior a `diaTerminaA`. |
| **DP-22.7 · Cómo se presenta** | **Con la app abierta no se muestra** (`presentationOptions: []` en la configuración del plugin): quien está dentro no necesita que le avisen. Sin insignia en el ícono, **nunca**. Sonido: el del sistema, y respeta «No molestar» y los modos de Concentración, que es lo que hace iOS por su cuenta. |
| **DP-22.8 · Permiso y preferencia** | **Son dos cosas, y la app lo dice.** El permiso del teléfono no se guarda: se consulta (`checkPermissions`). **El permiso solo se pide con un toque de la persona**: «Activar recordatorios» en P6, o el interruptor o «Permitir avisos» en Tu perfil. **Nunca al abrir la app.** Y como el plugin pide el permiso él solo si se programa algo sin haberlo pedido (§2.4), **nunca se llama a `schedule` sin permiso concedido**. Lo que se ve en Tu perfil, en la tabla de abajo. **REPORTA** cómo queda cada fila. |
| **DP-22.9 · La reconciliación** | **Una sola rutina** compara lo que debería estar programado con lo que está, y corrige: cancela los avisos de Strivo que ya no tocan y programa los que faltan. Es idempotente y pasa **de una en una** (si llega otra petición mientras corre, se hace una vez más al terminar). Se pide: al montar las secciones (onboarding terminado), al volver la app al frente, al cerrar la mañana o la noche, al cambiar las horas o el interruptor en Tu perfil, al conceder el permiso y cuando termina una restauración de la nube (las horas pueden llegar después). **REPORTA** dónde vive cada disparo y cómo se evita que `diario/` o `perfil/` rompan la dirección de dependencias (RN-TEC-04 a 08). |
| **DP-22.10 · Tocar el aviso** | **Abre Hoy con el momento del aviso ya elegido en el conmutador** (`/hoy?momento=manana` o `noche`), en el día de hoy. Funciona con la app cerrada del todo y con la app en segundo plano. Un valor desconocido se ignora sin mensaje (RN-NAV-06). **Hoy sin parámetro se comporta exactamente igual que hoy.** **REPORTA** cómo lo lee Hoy (HashRouter) y qué pasa si Hoy ya estaba montada cuando llega el toque. |
| **DP-22.11 · Cerrar sesión** | **Cerrar sesión cancela todos los avisos de Strivo en este teléfono**, antes de volver a la bienvenida. Después del onboarding, lo que diga la preferencia del uid nuevo. **REPORTA** dónde va la llamada (`salirDeCuenta`) y anota en SPEC_24 que borrar la cuenta tendrá que hacer lo mismo. |
| **DP-22.12 · Build de diagnóstico** | Con `VITE_DIAG_AVISOS=1 npm run ios:build`, al final del bloque nuevo de Tu perfil: el permiso del teléfono, cuántos avisos de Strivo hay programados, el próximo de la mañana y el próximo de la noche (día y hora), y la zona horaria del teléfono. **Se actualiza solo** tras cada reconciliación. Textos en `src/copy/diagnostico.js` (el mismo archivo de 17B), cargado solo con la bandera, y una prueba que construye sin ella y los busca en `dist/`. Bandera propia, para no encender a la vez el diagnóstico del almacén. |
| **DP-22.13 · El plugin** | **`@capacitor/local-notifications` 8.3.1, versión exacta**, el oficial de Capacitor. Un solo archivo de `src/` lo importa, **bajo demanda**, y una prueba recorre `src/` para comprobarlo. **Android:** `esNativa()` dirá `true` también en Android cuando llegue SPEC_26, y la entrega en Android (permiso de Android 13, alarmas exactas) es de SPEC_27. **REPORTA** cómo se evita que esta lógica programe nada en Android antes de SPEC_27 sin abrir una segunda pregunta por la plataforma fuera de `plataforma.js`. |
| **DP-22.14 · La tarjeta de descubrimiento** | **Fuera.** SPEC_22 §3.1 la proponía tras el primer momento completado; hoy P6 ya pregunta en el onboarding y Tu perfil lo deja cambiar. Una segunda pregunta sería presión. |

**Tabla de DP-22.8 — el bloque de Tu perfil en la app de iPhone:**

| Preferencia (`remindersEnabled`) | Permiso del teléfono | Horas | Lo que se ve |
|---|---|---|---|
| apagada | cualquiera | cualquiera | El interruptor apagado y el texto de apoyo. |
| encendida | concedido | al menos una | El interruptor encendido. Llegan los avisos de las horas que haya. |
| encendida | concedido | ninguna | Encendido, y debajo `sinHoras`. No se programa nada. |
| encendida | sin pedir (p. ej., reinstaló y entró a su cuenta) | cualquiera | Encendido, y debajo `sinPermiso` con el botón «Permitir avisos», que pide el permiso. |
| encendida | denegado (o lo quitó en Ajustes) | cualquiera | Encendido, y debajo `sinPermiso` con el botón «Abrir Ajustes del teléfono». |

**Al encender el interruptor:** con permiso concedido, se enciende. Sin pedir, se pide en ese instante: si lo concede, se enciende; si no, **se queda apagado** y aparece `sinPermiso` con «Abrir Ajustes del teléfono». Con permiso denegado, se queda apagado y aparece lo mismo (iOS no vuelve a preguntar). **Al apagarlo**, se cancelan los avisos; el permiso no se toca.

Criterio de producto de la fundadora, que manda sobre todo lo anterior: **en el iPhone, quien pide los avisos los recibe a sus horas, aunque la app esté cerrada; quien no los pide no recibe nada; y ninguno dice algo que la app no cumpla.**

---

## 2. Lo que ya está verificado en el código (10 nov 2026, sobre `23a7990`)

### 2.1 P6 hoy

- `src/onboarding/recordatorios.js`: `haySoporte()` mira `window.Notification`; `estadoActual()` y `pedirPermiso()` devuelven uno de cuatro estados (`sin_soporte`, `sin_pedir`, `concedido`, `denegado`) y **nunca lanzan**; `quedanActivados(estado)` es `estado === 'concedido'`. El comentario de cabecera ya dice que la entrega no está construida.
- `Recordatorios.jsx` enseña una vista previa por aviso con `copy.notifications.manana` y `.noche` a la hora de despertar y de dormir (las filas sin hora se omiten), y muestra el botón «Activar recordatorios» **solo si `haySoporte()`**. En el iPhone no hay `Notification`, así que no hay botón y sale `unsupported`.
- `Onboarding.jsx` → `activarAvisos` llama a `pedirPermiso()`, guarda el estado en `avisos` y escribe `preferences.remindersEnabled` con `escribirRecordatorios` (en el árbol que decide `arbolDeEntrada`). Con respuesta, el paso enseña «Continuar»; sin ella, «Ahora no».
- Textos de `onboarding.p6`: «¿Quieres que te avise?», «Dos avisos al día, a las horas que elegiste. Nada más.», «Activar recordatorios», «Ahora no», «Listo. Te avisaremos a esas horas.», «Tu dispositivo no dio permiso. Puedes activarlo después desde Ajustes.», «Este dispositivo no tiene avisos. Strivo funciona igual.». **No cambia ninguno** (DP-22.2): en la app de iPhone, con esta SPEC, «Listo. Te avisaremos a esas horas.» pasa a ser verdad.

### 2.2 Los datos

- `shared/preferences`: `soundEnabled`, `reducedMotion`, `remindersEnabled`. La siembra pone `remindersEnabled: false` («la app no pide sitio en la pantalla de nadie hasta que P6 lo pregunta»).
- `shared/profile`: `wakeTime`, `sleepTime` (P5 sugiere `07:00` y `23:00`; Tu perfil arranca en blanco si no hay) y `diaTerminaA` (por defecto, el de `shared.js`).
- `strivoDateKey(diaTerminaA, instante)` en `src/lib/db/dates.js` decide a qué día pertenece un instante. **Es la regla que usa el diario**; los avisos usan esa y no otra.
- Tu perfil: bloques `nombre`, `genero`, `horarios`, `frases`, `cuenta`, `sincronizacion` (`perfil/bloques.js`). Añadir uno es un identificador, un texto en el copy y un componente, con una prueba que lo vigila.

### 2.3 Hoy y el conmutador

- `Hoy.jsx` abre con `momentoInicial()` (por la franja de `getTimeSlot`) y a partir de ahí manda el conmutador (`setMomento`). **Hoy no lee ningún parámetro de la ruta.** El router es `HashRouter`, así que la ruta del aviso sería `#/hoy?momento=noche`.

### 2.4 El plugin (`@capacitor/local-notifications` 8.3.1, leído del paquete de npm)

- `peerDependencies`: `@capacitor/core >= 8.0.0`. `Package.swift` presente (iOS 15+, solo `capacitor-swift-pm`). Sin dependencias de terceros, sin `PrivacyInfo.xcprivacy` propio y **sin API de las que Apple obliga a declarar** en el manifiesto de privacidad (no usa `UserDefaults` ni fechas de archivo). **REPORTA** si lo confirmas.
- **`schedule.at` es peligroso aquí:** se convierte en un intervalo desde ahora (`UNTimeIntervalNotificationTrigger`), así que **no sigue un cambio de zona horaria**, y **una fecha que ya pasó se entrega en el acto**. Una reconciliación que calculara una hora un segundo tarde mandaría un aviso inmediato.
- **`schedule.on` siempre repite**: el plugin crea `UNCalendarNotificationTrigger(dateMatching:, repeats: true)` aunque se pase `repeats: false`. Con `year`, `month`, `day`, `hour` y `minute` coincide una sola vez y sigue la hora de pared del teléfono. **REPORTA** si un disparador así, ya pasado, se queda en la lista de pendientes (la reconciliación tiene que cancelarlo de todas formas).
- **`schedule()` pide el permiso por su cuenta** si todavía no se ha decidido (`ensureAuthorization`). Por eso la regla de DP-22.8: nunca se programa sin permiso concedido.
- **El toque en un aviso se guarda hasta que alguien escucha**: `localNotificationActionPerformed` se emite con `retainUntilConsumed: true`. Con la app cerrada del todo, el oyente que se registre al arrancar lo recibe. **REPORTA** si lo confirmas en el teléfono o el simulador.
- Con la app abierta, sin configuración, el plugin enseña el aviso con insignia, sonido y banner. Con `presentationOptions: []` no enseña nada (DP-22.7).
- Ofrece `checkPermissions`, `requestPermissions`, `getPending`, `cancel`, `removeDeliveredNotificationsById` y `getDeliveredNotifications`. **No ofrece abrir los Ajustes del teléfono** (ver REPORTA en §4).

### 2.5 Lo que ya promete la app de iPhone

- `Info.plist`: `UIBackgroundModes` = `[audio]`; no hay `NSUserNotificationsUsageDescription` y `appIos.test.js` exige que no la haya (iOS no la pide para avisos).
- `App.entitlements`: solo Iniciar sesión con Apple. **Sin `aps-environment`.**
- `appIos.test.js` vigila identificador, esquema, host, iOS 16.2, la base SQLite y el cifrado.

### 2.6 Lo que esta instrucción corrige de SPEC_22

| SPEC_22 decía | Manda ahora | Por qué |
|---|---|---|
| «Ajustes → Recordatorios» | Un bloque nuevo en **Tu perfil**, detrás de «Cómo son tus días» | La app no tiene Ajustes; Tu perfil es esa pantalla. |
| Dos horas propias, 08:00 y 21:30 (DP-22.1 vieja) | Las horas de «Cómo son tus días» | DP-22.1. |
| `perfil.recordatorios = { manana, noche }` | `preferences.remindersEnabled`, sin cambios en el modelo | DP-22.3. |
| Tarjeta de descubrimiento tras el primer momento | Fuera | DP-22.14. |
| Ids fijos 1 y 2 con `repeats: true`, y `at` para mañana | Ventana de 14 días con `on` de fecha completa | §2.4 y DP-22.5. |
| Título «Strivo» y cuerpos rotativos | Sin título; el texto de P6 | DP-22.4. |
| Texto `soloEnApp` en la web (DP-22.2 vieja) | En la web no se pinta nada nuevo | DP-22.2. |
| Al revocar el permiso, interruptores apagados | Encendido, con el aviso de que falta el permiso del teléfono | DP-22.8: el interruptor dice lo que la persona quiere, y la frase de abajo, lo que el teléfono deja. |

---

## 3. Alcance

**Entra:** el plugin y su configuración; P6 en la app de iPhone pidiendo el permiso de verdad; la planificación (pura) y la reconciliación; el bloque «Recordatorios» de Tu perfil, solo en la app de iPhone; abrir Hoy en el momento del aviso; cancelar al cerrar sesión; retirar el aviso entregado al cerrar el momento; el build de diagnóstico; pruebas; `CLAUDE.md`; esta instrucción en `docs/specs/`.

**No entra:** push remoto, APNs o Web Push; Android (SPEC_27); avisos por inactividad o de cualquier otro tipo; insignias; cambiar los textos de P6 o la vista previa de la web; cambiar el modelo de datos (salvo que la fundadora elija dos interruptores, DP-22.3); D-21.11, D-21.13, DP-21.5; SPEC_23 y el audio en segundo plano; SPEC_24.

---

## 4. Cambios esperados (a confirmar en el reporte previo)

Los nombres los propones tú; esta es la forma:

- **Planificación pura** (por ejemplo `src/lib/avisos/plan.js`): de `{ ahora, despertar, dormir, diaTerminaA, encendidos, cerrados, dias }` a la lista de avisos que tienen que estar programados, cada uno con su id, su momento, su fecha (clave del día) y sus componentes de calendario. **Sin plugin, sin base de datos y sin reloj propio**: todo entra por argumentos. Es lo que reutilizará SPEC_27. Ids enteros, únicos y estables por (fecha, momento), dentro de 32 bits.
- **El puente con el plugin** (por ejemplo `src/lib/avisosNativos.js`): **el único archivo de `src/` que importa `@capacitor/local-notifications`, y bajo demanda**, devolviendo el plugin envuelto. Permiso, programar, cancelar, pendientes, retirar entregados y el oyente del toque.
- **La reconciliación** (por ejemplo `src/lib/avisos/reconciliar.js`): lee perfil, preferencias y el `completedAt` de hoy por `lib/db`, pide el plan, compara con lo pendiente y corrige; de una en una. Solo toca los avisos de Strivo (márcalos, por ejemplo con `extra`).
- **`src/onboarding/recordatorios.js`:** en la app de iPhone, los mismos cuatro estados y la misma garantía de no lanzar nunca, pero con el plugin; en la web, **exactamente el código de hoy**. `Recordatorios.jsx` enseña el botón cuando el dispositivo sabe avisar (en la app de iPhone, siempre).
- **Tu perfil:** el bloque nuevo en `perfil/bloques.js` (detrás de `horarios`), su copy y su componente, **pintado solo en la app de iPhone**. Interruptor con `role="switch"`, `aria-checked` y el cambio anunciado con `aria-live`; objetivo táctil de 44 px; colores por tokens. **REPORTA** cómo se omite en la web sin romper la prueba de `bloques.js`.
- **`Hoy.jsx`:** leer `momento` de la ruta de forma mínima (DP-22.10).
- **El oyente del toque**, dentro del router, para poder navegar.
- **`src/lib/salidaCuenta.js`:** cancelar los avisos (DP-22.11).
- **`package.json`, `package-lock.json`, `ios/App/CapApp-SPM/Package.swift` y `Package.resolved`:** el plugin en versión exacta y lo que regenere `cap sync`.
- **`capacitor.config.json`:** solo `plugins.LocalNotifications` (`presentationOptions: []`). Nada más.
- **`appIos.test.js`:** lo de siempre, y además: sin `aps-environment`, `UIBackgroundModes` sigue siendo `[audio]`, sin `NSUserNotificationsUsageDescription`, y la configuración del plugin sin insignia.
- **`src/copy/index.js`:** los textos del bloque nuevo (§6). `src/copy/diagnostico.js`: los del diagnóstico.
- **`CLAUDE.md`:** sección nueva «Los recordatorios llegan en el iPhone (SPEC_22)»; entradas en «Dónde vive cada regla» (plan, puente, reconciliación); las dos deudas de P6 actualizadas (la del iPhone se cierra; la de la web sigue, ligada a DP-21.5); la consecuencia de los 14 días; los recuentos de §13.

**REPORTA, además:**

- **Abrir los Ajustes del teléfono.** Si navegar a `app-settings:` desde el WebView lo abre Capacitor con el sistema sin código nativo nuevo, y en qué pantalla cae (los ajustes de Strivo, idealmente su página de Notificaciones). **Si hace falta código nativo, no lo añadas sin decisión:** propone la alternativa más pequeña (por ejemplo, sin botón y con la frase «Puedes darlo en Ajustes del teléfono, en Strivo»).
- **Otros dueños del centro de notificaciones.** Si algún plugin instalado (por ejemplo `@capacitor-firebase/authentication`) se declara delegado de `UNUserNotificationCenter` y le quitaría los toques al plugin de avisos. Si hace falta tocar `AppDelegate`.
- **Swift Package Manager:** que resuelve con `capacitor-swift-pm` 8.5.3 y `swiftToolsVersion: "6.1"`, si necesita `packageOptions` y cuánto crece la app.
- **P6 sin horas.** Qué enseña P6 en la app de iPhone si P5 se dejó sin ninguna hora: «Listo. Te avisaremos a esas horas.» no puede decirse si no hay horas. Propón la salida más pequeña sin cambiar los textos de la web.
- **El diagnóstico se actualiza** tras cada reconciliación: cómo se entera.
- **Tamaño de los chunks** de `npm run build` antes y después, y que nada del plugin entra en el chunk principal de la web.

---

## 5. Criterios de aceptación

### Automáticos (Claude Code)

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde.
2. **Plan:** respeta las horas exactas; omite los ya pasados (con un margen de un minuto, para no mandar nada «ahora»); omite el momento con `completedAt` ese día; con el interruptor apagado o sin horas, lista vacía; una noche después de medianoche y antes de `diaTerminaA` cuenta como la del día anterior; los componentes de calendario son la hora de pared pedida sea cual sea la zona horaria; 14 días = como mucho 28; ids únicos, estables y de 32 bits.
3. **Reconciliación** (con un doble del plugin hecho como Proxy, igual que `dobleDeCapacitor.js`): **nunca llama a `schedule` ni a `requestPermissions` sin permiso concedido**; sin permiso cancela los de Strivo y no programa nada; cancela lo que sobra y programa lo que falta; dos seguidas no repiten trabajo; dos a la vez pasan de una en una; no toca avisos que no son de Strivo.
4. **Cerrar un momento** pide reconciliar y retira el aviso entregado de ese momento y ese día.
5. **P6 en nativo:** nunca enseña `unsupported`; «Activar recordatorios» pide el permiso con el plugin y guarda `remindersEnabled` como hoy. **P6 en web: las pruebas de hoy pasan sin cambiar lo que comprueban.**
6. **Hoy:** `?momento=manana` y `?momento=noche` abren con ese momento; un valor desconocido se ignora; sin parámetro, igual que hoy; con Hoy ya montada, el toque cambia el momento.
7. **El toque** navega a `/hoy?momento=…`, también si llegó antes de montar el oyente.
8. **Cerrar sesión** cancela los avisos de Strivo.
9. **Tu perfil:** cada fila de la tabla de DP-22.8 enseña lo que dice; en la web el bloque no existe.
10. **El plugin se importa en un solo archivo y bajo demanda** (prueba que recorre `src/`), y nada de él entra en el chunk principal de la web.
11. `appIos.test.js` sigue exigiendo identificador, esquema, host y base de fábrica, y ahora también lo de §4.
12. Sin `VITE_DIAG_AVISOS`, ni una línea del diagnóstico de avisos existe en `dist/` (prueba).
13. `lint:copy` revisa el copy nuevo y el de `notifications`; ningún texto de aviso lleva «!» ni «¡».
14. Ningún commit lleva `DEVELOPMENT_TEAM` ni `GoogleService-Info.plist`.
15. Las pruebas de SPEC_17A, 17B, 19.1, 19.2, 21.1, 21.2, 29, 30 y 31 siguen pasando sin cambiar lo que comprueban.
16. **Al menos 25 casos nuevos.**

### Manuales (la fundadora, en su iPhone, contra `strivo-fe04f`)

Nombres que se usan abajo:
- **«La nueva con diagnóstico»**: la carpeta `~/Developer/strivo-22`, rama `revision-22`, compilada con `VITE_DIAG_AVISOS=1 npm run ios:build`.
- **«La nueva limpia»**: la misma carpeta, compilada con `npm run ios:build`.

Para pasar de una a otra: cerrar Xcode, compilar en la carpeta que toca y abrir su Xcode con `npm run ios:abrir`. Instalar encima no borra nada; solo se borra la app cuando la prueba lo dice. **Tras borrar la app, la primera apertura va con internet.**

**Antes de empezar, apunta tus horas de «Cómo son tus días»**: varias pruebas las cambian a «la hora del teléfono más 3 minutos» y al final se devuelven. Durante las pruebas, **no actives «No molestar» ni una Concentración** salvo en M9.

- **M1 · P6 pide de verdad.** Borrar la app, instalar la nueva con diagnóstico, abrirla con internet y hacer el onboarding **sin cuenta** (P7 → «Ahora no»), con las horas sugeridas de P5. En P6, tocar «Activar recordatorios». **Debe verse:** el aviso de iOS «“Strivo” quiere enviarte notificaciones» → «Permitir» → «Listo. Te avisaremos a esas horas.». **Nunca** «Este dispositivo no tiene avisos». Al terminar, en Tu perfil, el bloque «Recordatorios» con el interruptor encendido y el diagnóstico con el permiso concedido, avisos programados, el próximo de la mañana a tu hora de despertar y el de la noche a tu hora de dormir.
- **M2 · Llega con la app cerrada y abre la Mañana.** Sin haber hecho la mañana de hoy: en Tu perfil, «Me despierto a las:» = la hora del teléfono más 3 minutos. El diagnóstico dice que el próximo de la mañana es **hoy** a esa hora. Cerrar la app deslizándola hacia arriba en el selector de apps y bloquear el teléfono. **Debe verse:** a esa hora, en la pantalla bloqueada, el ícono de Strivo con «¿Cómo quieres sentirte hoy?», sin nombre, sin un segundo «Strivo» como título, y sin número rojo en el ícono. Al tocarlo (y desbloquear), Strivo abre en Hoy con **Mañana** elegida en el conmutador.
- **M3 · Llega con la app en segundo plano y abre la Noche.** «Me duermo a las:» = la hora del teléfono más 3 minutos. Ir a la pantalla de inicio **sin cerrar** Strivo y bloquear. **Debe verse:** «¿Cómo cerrar el día?» y, al tocarlo, Hoy con **Noche** elegida.
- **M4 · Si ya lo hiciste, ese día no llega.** «Me despierto a las:» = la hora más 4 minutos. Antes de que llegue esa hora, hacer la mañana entera y tocar «Comenzar mi día». **Debe verse:** el diagnóstico pasa el próximo de la mañana a **mañana**. Cerrar la app y esperar a que pase la hora: **no llega nada**.
- **M5 · Apagar y volver a encender.** Poner una hora de dormir a la hora más 3 minutos. Apagar el interruptor. **Debe verse:** el diagnóstico dice 0 avisos programados y, con la app cerrada, a esa hora no llega nada. Encenderlo otra vez: **iOS no vuelve a preguntar** y el diagnóstico vuelve a contar avisos.
- **M6 · Si quitas el permiso.** En la app **Ajustes** del iPhone → **Strivo** → **Notificaciones** → apagar «Permitir notificaciones». Volver a Strivo, a Tu perfil. **Debe verse:** el interruptor encendido y debajo «Para avisarte, Strivo necesita permiso del teléfono.» con «Abrir Ajustes del teléfono» (o la frase que se apruebe si no hay botón); el diagnóstico, permiso denegado y 0 programados. Tocar el botón abre la página de Strivo en Ajustes; ahí tocar «Notificaciones», volver a permitir y regresar: el diagnóstico vuelve a contar avisos, sin tocar nada más.
- **M7 · Otra zona horaria.** En **Ajustes** → **General** → **Fecha y hora**: apagar «Ajustar automáticamente» y elegir **Bogotá** (una hora más que Monterrey). Volver a Strivo. **Debe verse:** el diagnóstico con la zona `America/Bogota` y los próximos avisos **a las mismas horas de reloj** de antes. Poner «Me despierto a las:» a la hora que marca el teléfono más 3 minutos, cerrar la app: llega a esa hora. **Al terminar, volver a encender «Ajustar automáticamente».**
- **M8 · Reinstalar con cuenta y negar el permiso.** Borrar la app, instalar la nueva con diagnóstico, abrirla con internet, «Ya tengo una cuenta» → `atreloz.prueba.1@gmail.com` (correo). **Debe verse:** en Tu perfil, tus horas de esa cuenta tal como estaban. Si el interruptor sale encendido: debajo, la frase del permiso con «Permitir avisos»; tocarlo → iOS pregunta → «No permitir» → cambia a «Abrir Ajustes del teléfono». Si sale apagado: encenderlo → iOS pregunta → «No permitir» → el interruptor **se queda apagado** y aparece la frase con «Abrir Ajustes del teléfono». En ningún caso pregunta iOS sin que hayas tocado algo.
- **M9 · Cerrar sesión, y «No molestar».** Entrar con `filantraconsulting@gmail.com` (Google), dar el permiso y encender. (a) Con **«No molestar»** encendido, una hora a +3 minutos y la app cerrada: el aviso **no suena ni enciende la pantalla**; aparece después en el Centro de notificaciones. Apagar «No molestar». (b) Poner otra hora a +3 minutos, **cerrar sesión** en Tu perfil, cerrar la app: **no llega nada**.
- **M10 · La versión limpia y la web.** Instalar la nueva limpia sin borrar la app: el bloque «Recordatorios» está, **sin las líneas de diagnóstico**, y todo sigue. En `localhost` (`npm run dev` en `~/Developer/strivo-22`): P6 igual que hoy y **sin bloque «Recordatorios»** en Tu perfil.

**Al terminar, devuelve tus horas de «Cómo son tus días» a las que apuntaste.**

---

## 6. Copy

**Ningún texto existente cambia** (P6, `notifications`, horarios). Los nuevos, en `src/copy/index.js` junto a los de Tu perfil (en segunda persona, como el resto de Tu perfil), y los del diagnóstico en `src/copy/diagnostico.js`. Todos pasan `lint:copy`: **sin «pendiente»** (se dice «por pedir» o «sin pedir»), sin «!». La redacción final la revisa la fundadora con el reporte previo.

**Bloque «Recordatorios»** (propuesta):

| Clave | Texto |
|---|---|
| `titulo` | Recordatorios |
| `hint` | Un aviso por la mañana y otro por la noche, a las horas de «Cómo son tus días». Si ya pasaste por ese momento, ese día no llega. |
| `interruptor` | Recibir recordatorios |
| `sinPermiso` | Para avisarte, Strivo necesita permiso del teléfono. |
| `permitir` | Permitir avisos |
| `abrirAjustes` | Abrir Ajustes del teléfono |
| `sinHoras` | Elige tus horas en «Cómo son tus días» para recibirlos. |

**El aviso** (DP-22.4): sin título; cuerpo `copy.notifications.manana` o `copy.notifications.noche`, tal cual.

**Diagnóstico** (`diagnostico.js`, solo con `VITE_DIAG_AVISOS=1`; propuesta):

| Clave | Texto |
|---|---|
| `avisos.permiso` | Permiso del teléfono: {estado} (concedido · denegado · sin pedir) |
| `avisos.programados` | Avisos programados: {n} |
| `avisos.proximaManana` | Próximo de la mañana: {cuando} (p. ej., «mié 11 nov, 07:00»; «ninguno») |
| `avisos.proximaNoche` | Próximo de la noche: {cuando} |
| `avisos.zona` | Zona horaria: {zona} |

---

## 7. Reglas de arquitectura que roza

- **Nada bloquea:** pedir el permiso nunca deja la pantalla rota; ninguna respuesta del teléfono es un error (RN-EST-04); nada vibra.
- **La web no cambia:** `esNativa()` en `false` deja el código de hoy, sin el plugin.
- **Una regla, un sitio:** el plan decide qué avisos tocan; la reconciliación, cuándo se corrige; el puente, cómo se habla con iOS. A qué día pertenece un instante lo dice `strivoDateKey`. La plataforma la dice `plataforma.js`.
- **Dirección de dependencias:** `lib/` no importa de `diario/`, `breathing/`, `perfil/`, `onboarding/` ni de componentes. Quien cierra un momento o cambia una hora **pide** la reconciliación; no la contiene.
- **Nada sale del teléfono:** los avisos se programan y se cancelan en el dispositivo; nada nuevo viaja a Firestore ni a analítica (RN-07).
- **Nada secreto en el repo:** ni el Team ni `GoogleService-Info.plist` ni `.env.local`. Commits por ruta, nunca `git add -A`, `git add .` ni `git commit -a`. Antes de comitear, `git show :ios/App/App.xcodeproj/project.pbxproj | grep DEVELOPMENT_TEAM` sale vacío. **No aceptes «Update to recommended settings» de Xcode** ni añadas capacidades en «Signing & Capabilities».

---

## 8. Entrega

1. **Trabaja en un worktree aparte**, como en SPEC_31 y SPEC_17B: `~/Developer/strivo-22`, rama local `revision-22` creada desde `strivo`. **`~/Developer/strivo` se queda en `strivo` y no se toca.**
2. Para que el worktree compile la app de iPhone: copia desde `~/Developer/strivo` los dos archivos que no están en git (`.env.local` y `ios/App/App/GoogleService-Info.plist`), corre `npm install` y **avisa a la fundadora de que tiene que elegir su Team en el Xcode de esa carpeta una vez**. Ninguno de los tres se comitea.
3. Commits pequeños y por tema (plugin y configuración / plan / puente y reconciliación / P6 / Tu perfil / Hoy y el toque / cerrar sesión / diagnóstico / pruebas / docs), cada uno con la línea `Co-Authored-By` del repo, añadiendo archivos por ruta.
4. **Sin push** hasta que la fundadora lo apruebe; entonces `git push origin revision-22`. Nunca a `strivo` directamente.
5. Reporte final: qué se hizo, cada **REPORTA** con su respuesta, la salida de las siete validaciones, archivos y casos de prueba antes y después, y la lista M1–M10 con los textos exactos que la fundadora verá.

---

## 9. Reporte previo y decisiones

Reporte previo de Claude Code (11 nov 2026) **aprobado por la fundadora con las decisiones de abajo**. Todo lo demás del reporte se aprueba tal como viene: los archivos nuevos y tocados, los textos exactos, la forma de pedir la reconciliación (`src/lib/avisos/pedido.js`) y la tabla de disparos.

**Lo que el reporte encontró distinto de esta instrucción (y manda el reporte):**

- **En el iPhone, P6 hoy no dice «Este dispositivo no tiene avisos».** Ese texto solo sale tras tocar «Activar recordatorios», y el botón no aparece sin `Notification`: P6 enseña la vista previa y «Ahora no», sin forma de activar nada. El resultado es el mismo. **CLAUDE.md se corrige** al cerrar la deuda.
- **El plugin exige `title` como texto.** «Sin título» (DP-22.4) es `title: ''`: iOS pone «Strivo» encima y el texto del aviso debajo. M2 lo comprueba.
- **`schedule()` contesta antes de que iOS confirme.** La reconciliación no se fía de esa respuesta: compara siempre con `getPending`, y el diagnóstico cuenta lo que de verdad está programado.
- **El permiso que pide el plugin incluye globos** (`[.badge, .alert, .sound]`), así que en Ajustes → Strivo → Notificaciones aparecerá «Globos». Se acepta: nunca se pasa `badge`, y ningún número llega al ícono.
- **`lint:copy` no detectaba «!» ni «pendiente» en general** (ver la decisión de abajo).
- **`perfil.test.js` («son los seis de esta fase») pasa a siete.** No es de ninguna SPEC del criterio 15; se acepta.
- **Nadie lee hoy `wakeTime`, `sleepTime` ni `remindersEnabled`** fuera de quien los escribe y de la restauración. Con la sugerencia de P5, el aviso de la noche llega a las 23:00, la hora exacta de dormir: se queda así en la 1.0, que es lo que P6 promete.
- **Con una mudanza pendiente, los avisos siguen al uid de la sesión**, igual que lo que enseña Tu perfil. Consecuencia aceptada.

| Punto | Decisión |
|---|---|
| **P6 sin horas** | **Opción A.** Solo en nativo y sin ninguna hora, la frase de concedido es una clave nueva, `p6.grantedSinHoras`: «Listo. Te avisaremos cuando elijas tus horas en Tu perfil.». La web no cambia. |
| **Apoyo del bloque** | «Un aviso por la mañana y otro por la noche, a las horas de «Cómo son tus días». Si ya pasaste por ese momento, ese día no llega.» |
| **DP-22.8, frase tras negar el permiso** | Aprobado: si se niega al encender, el interruptor se queda apagado y la frase con «Abrir Ajustes del teléfono» se ve mientras se siga en la pantalla; es estado de la pantalla y no se guarda. |
| **DP-22.8, orden de las frases** | Aprobado: **el permiso va por delante**; `sinHoras` solo aparece con el permiso concedido. |
| **DP-22.10, toque durante «Respira un momento»** | Aprobado: sale a Hoy con el momento del aviso, en el día de hoy. |
| **Abrir Ajustes** | Aprobado: `app-settings:`, sin código nativo. Lleva a la página de Strivo en Ajustes; ahí se toca «Notificaciones». **En M6 la fundadora toca «Notificaciones» a mano.** |
| **Signos de exclamación** | **Comprobación global de «!» y «¡» sobre todo el copy visible.** Si algún texto de hoy falla, **no se arregla**: se reporta la lista y la comprobación global se queda en los textos nuevos (avisos, bloque, diagnóstico) hasta que la fundadora decida. **«pendiente»**, solo sobre los textos nuevos (hay usos legítimos en maquinaria interna). |
| **DP-22.13, Android** | Aprobado: `esIPhone()` en `plataforma.js` (`esNativa()` y `getPlatform() === 'ios'`). Toda la lógica de avisos pregunta solo eso. SPEC_27 cambia esa función. |
| **Ids y marca** | Aprobado: `YYYYMMDD × 10 + (1 mañana \| 2 noche)` y `extra: { strivo: true, momento, fecha }`. |
| **Diagnóstico** | Aprobado: `DIAGNOSTICO_AVISOS` en `diagnostico.js`, con la comprobación de que cada bandera no arrastra los textos de la otra; si Rollup no los separa, `diagnosticoAvisos.js`. |
| **Tamaño de la app** | Se mide en la implementación (build Release) y va en el reporte final. |
| **Trabajo** | Worktree `~/Developer/strivo-22`, rama `revision-22`, según §8. |

---

## 10. Implementación y pruebas manuales (11 nov 2026)

**Implementación.** Rama `revision-22` (worktree `~/Developer/strivo-22`), 11 commits sobre `23a7990`. Siete validaciones en verde; `npm run test`: 220 archivos, 5.410 casos y 7 omitidos (ya existían). En el proyecto `indexeddb`, de 106 archivos y 2.622 casos a 113 y 2.740: **118 casos nuevos**.

- **Tamaño:** la app en Release (arm64, sin firmar) pasa de 9.316 a 9.504 KB (+188 KB, casi todo el Swift del plugin); comprimida, de 3,11 a 3,18 MB (+64 KB). El chunk principal de la web pasa de 730,19 a 737,40 kB (gzip, de 206,92 a 209,40); el plugin, el plan y la reconciliación van en chunks que la web no descarga.
- **«!» y «¡»: la comprobación es global** sobre todo el copy visible, porque ningún texto de hoy fallaba. Fuera del copy, cuatro citas del repertorio v1 (`frases-del-dia.js`: C-005, C-008, C-047, C-072) llevan «¡…!». Son citas textuales de autores: no se tocaron y quedan anotadas en CLAUDE.md para que la fundadora decida.
- **Id de ejemplo corregido:** con la fórmula aprobada, la mañana del 11 de noviembre es `202611111`.
- **Tres pruebas cambiadas fuera del criterio 15:** los bloques del perfil pasan de seis a siete, la pantalla recorre `visibles()` y hay una dependencia más.
- Hoy sigue arrancando con `useState(momentoInicial)`; el momento del aviso se aplica antes de pintar.

**Pruebas manuales: las diez pasan** (la fundadora en su iPhone y en `localhost`, contra `strivo-fe04f`). Orden ajustado al probar: **M2 usó la Noche con la app cerrada y M3 la Mañana con la app en segundo plano**. Por la tarde, Hoy ya abre en Mañana por sí sola, así que así cada prueba demuestra que el aviso elige el momento.

| Prueba | Resultado |
|---|---|
| **M1** · P6 pide de verdad | ✅ Diálogo de iOS, «Listo. Te avisaremos a esas horas.», bloque encendido, permiso concedido, próximos a 07:00 y 23:00. |
| **M2** · App cerrada del todo → Noche | ✅ Llega «¿Cómo cerrar el día?», sin nombre ni título duplicado ni número en el ícono; el toque abre Hoy con Noche. **El toque en frío funciona.** |
| **M3** · App en segundo plano → Mañana | ✅ Con Hoy en Noche, el aviso de la mañana la cambia a Mañana. |
| **M4** · Si ya lo hiciste, no llega | ✅ Al cerrar la mañana, el próximo pasa al día siguiente y ese día no llega nada. |
| **M5** · Apagar y encender | ✅ 0 programados y nada llega; al encender, iOS no vuelve a preguntar. |
| **M6** · Permiso retirado | ✅ Frase y «Abrir Ajustes del teléfono»; el botón lleva a la página de Strivo; al volver con permiso, cuenta otra vez sola. |
| **M7** · Otra zona horaria | ✅ El aviso llega a la hora local nueva. **Observación O-22.1** (abajo). |
| **M8** · Reinstalar con cuenta y negar | ✅ Las horas vuelven de la nube, iOS no pregunta sin un toque, y al negar se ve lo que dice la tabla de DP-22.8. |
| **M9** · «No molestar» y cerrar sesión | ✅ Con «No molestar», el aviso no suena y queda en el Centro de notificaciones; tras cerrar sesión no llega nada. |
| **M10** · Versión limpia y web | ✅ Sin la bandera no hay diagnóstico; en la web, P6 igual y sin bloque «Recordatorios». |

**O-22.1 · El WebView no se entera al momento de un cambio de zona horaria.** Con la app en segundo plano, al volver tras cambiar la zona horaria, el diagnóstico siguió diciendo `America/Monterrey` hasta cerrar la app del todo; al abrirla de nuevo dijo `America/Bogota`, y al volver a automático, Monterrey. **Los avisos no se ven afectados**: los disparadores de calendario siguen la hora de pared y M7 llegó a la hora local nueva. **Efecto posible, menor:** mientras el WebView conserve la zona vieja, la reconciliación calcula «ahora» con ella, así que un aviso que cae en la hora del desfase puede no programarse (o quedar uno ya pasado, que iOS no entrega) hasta que la app vuelva a arrancar. **Decisión: no se arregla en la 1.0; se anota en CLAUDE.md como límite conocido.**
