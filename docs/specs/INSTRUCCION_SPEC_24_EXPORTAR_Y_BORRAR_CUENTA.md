# INSTRUCCIÓN SPEC_24 — Llevarme lo que escribí (24A) y borrar mi cuenta (24B)

**Para:** Claude Code
**Fecha:** 14 nov 2026 · **Versión:** 1.2 (reporte previo aprobado el 15 nov 2026: §9. **Donde §9 y el resto difieran, manda §9**. Resultados en §10, 17 nov 2026)
**Rama de partida:** `strivo` en `d90427a`, la fusión de SPEC_23. Compruébalo en §0.
**Gobierna:** esta instrucción + `docs/specs/SPEC_24_BORRADO_CUENTA_EXPORTACION.md` (con sus tres notas finales: SPEC_21.2, SPEC_22 y SPEC_23A) + `docs/specs/INSTRUCCION_SPEC_21_2_GOOGLE_Y_APPLE.md` + `docs/specs/INSTRUCCION_SPEC_17B_SQLITE.md` + `docs/specs/INSTRUCCION_SPEC_31_SINCRONIZACION_FIABLE.md` + `SPEC_00B` + `CLAUDE.md`. **Donde esta instrucción y otra difieran, manda esta.** En particular, **corrige varias partes de SPEC_24**, que se escribió en septiembre, antes de la app de iPhone, de Google y Apple nativos, de SQLite y de Face ID (ver §2.7).

**Cómo se reparte SPEC_24.** Dos fases, un solo reporte previo, dos fusiones:

| Fase | Qué es | Cuándo se fusiona |
|---|---|---|
| **24A** | Llevarme lo que escribí: un archivo con todo lo de la persona | En cuanto pasen sus pruebas (bloque E), sin esperar a 24B |
| **24B** | Borrar mi cuenta: nube, cuenta, teléfono y, con Apple, la revocación | Cuando pasen sus pruebas (bloque B) |

**Orden de trabajo:** 24A → 24B. 24B depende de 24A: **nunca se ofrece borrar sin ofrecer antes llevarse lo escrito.** Una sola build con diagnóstico sirve para las pruebas de las dos fases.

**Por qué ahora:** sin borrado de cuenta dentro de la app, Apple rechaza la app (Guideline 5.1.1(v)), y con Iniciar sesión con Apple exige además revocar el token. La meta es la App Store el 10 de diciembre de 2026, y SPEC_25 (muro de pago) va después de esta.

**No hay otro trabajo en paralelo.** Si todavía existe el worktree `~/Developer/strivo-23` o la rama local `revision-23` (SPEC_23, ya fusionada), **no los borres**: solo repórtalo.

---

## 0. Antes de escribir una sola línea

1. Lee `CLAUDE.md` **del repo** (no una copia): §5 (RN-08, «lo escrito debe ser exportable»), §6, §8, §9 (RN-EST-07 y RN-EST-08), §11 («Dónde vive cada regla»), «App iOS (SPEC_21.1)» con **«Lo que no se toca nunca»**, «Google y Apple en la app de iPhone (SPEC_21.2)», «Que lo escrito suba solo (SPEC_31)», «Lo escrito en el iPhone, en SQLite (SPEC_17B)», «Los recordatorios llegan en el iPhone (SPEC_22)», «Face ID y háptica en el iPhone (SPEC_23A y 23B)», «Sesión real (SPEC_19.1)», «Cuenta existente en P7 y PIN con correo (SPEC_19.2)», «Lo que subió a la nube vuelve a bajar (SPEC_17A)», «Deuda consciente» y §14. Lee `SPEC_24` entera con sus tres notas finales, y esta instrucción entera.
2. Comprueba que HEAD de `strivo` es `d90427a` o lo contiene (`git merge-base --is-ancestor d90427a HEAD`). Si no, **para**.
3. `git worktree list` y `git branch --list 'revision-*'`. Reporta lo que hay. No borres nada.
4. Monta tu worktree según §8 (pasos 1 y 2) **antes** de investigar: el reporte previo pide compilar en el simulador.
5. Inspecciona:
   - **Sesión y salida:** `src/lib/salidaCuenta.js` (`comprobarSalida`, `salirDeCuenta`, `apagarAvisos`, `olvidarFaceId`); `src/components/ArranqueProvisional.jsx` (`salir`, `acunarUidLocal`, `prepararArbol`, `fijarUid`, el reintento de restaurar al volver la red, `retirarOyenteRed`); `src/lib/sesion.js` (`resolverSesion`, `prepararArbol`, `restaurarConUnReintento`, `reintentarAlVolverLaRed`, `TECHO_DE_ESPERA_MS`); `src/lib/useSesion.js`; `src/lib/cuenta.js` (`cerrarSesion`, `entroConProveedor`, `proveedoresDisponibles`, `claveDeError`, `esCorreoOculto`); `src/lib/firebase.js` (`opcionesDeAuth`, `opcionesDeFirestore`).
   - **Reautenticación:** `src/lib/reautenticacion.js` (`metodoDeSesion`, `reautenticarConProveedor`); `src/lib/credencialNativa.js` (`credencialNativa`, `datosDeCredencial`, `esCancelacion`, `cerrarSesionNativa`, `cargarPlugin` y el `{ plugin }`); `reautenticar` y `motivoDeReautenticacion` de `src/diario/pin.js` (hoy dependen de `metodoDeRecuperacion`, que es cosa del PIN).
   - **Lo que vive en la nube:** `firestore.rules`; `src/lib/db/restaurar.js` (`DOCUMENTOS`, `SUBCOLECCIONES`, `TAMANO_PAGINA`, la cabecera «única función autorizada a leer de Firestore») y su prueba del criterio 1 en `src/lib/db/__tests__/restaurar.test.js`; `src/lib/db/sync.js` (todos los disparadores de `flush`: `startSync`, `alEncolar`/`programarSubida`, `online`, `visibilitychange`, `pagehide`, los reintentos, `cancelRetries`, `flushEnCurso`); `src/lib/db/limite.js`; `src/lib/db/schema.js` (`paths`, `FIELDS`).
   - **Lo que vive en el teléfono:** `src/lib/db/local.js` (`borrarUid`, `esRutaLocal`, `readCollection`, la cola); `src/lib/db/almacen.js` y los dos adaptadores; `src/lib/db/migracionSQLite.js` (la copia vieja de IndexedDB que no se borra, DP-17B.10); `src/lib/db/clavesDelTelefono.js` (familias `strivo.*`); `src/lib/biometria.js`; `src/lib/avisos/reconciliar.js` (`apagarAvisos`); `src/lib/umbralSesion.js`; cualquier otro `localStorage`/`sessionStorage` de `src/`.
   - **Lo que se exporta:** `src/diario/manana.js` (`resumenDeManana`, `animosDeManana`, `intencionesDeManana`), `src/diario/noche.js`, `src/diario/nocheReconocimiento.js`, el journal (`src/lib/db/diario.js`, `listJournalEntries`), el Historial (cómo pinta un día entero, campos de versiones anteriores incluidos, RN-HIS-07), `src/breathing/data/` (configuración, favoritos, recientes, sesiones), `shared/profile`, `shared/auth`, `shared/preferences`, `shared/onboarding`, `shared/frases`, y el resolutor de género del copy.
   - **El PIN:** `src/diario/pin.js` (`estadoPin`, `abrirConBiometria`), `src/diario/usePin.js`, `src/components/diario/BloqueoPin.jsx` (modo `desbloqueo`).
   - **Tu perfil:** `src/perfil/bloques.js` (`BLOQUES`, `SOLO_EN_IPHONE`, `visibles`) y su prueba; `src/components/perfil/Perfil.jsx`, `Bloque.jsx`, `TuCuenta.jsx`; `src/components/shared/Confirmacion.jsx`, `BotonProveedor.jsx`, `unaVez.js`; `src/components/perfil/DiagnosticoAlmacen.jsx` y `DiagnosticoAvisos.jsx` (el patrón de los diagnósticos); `src/copy/index.js` (`CUENTA`) y `src/copy/diagnostico.js`; `scripts/lint-copy.js`; `scripts/lint-contraste.js`; `src/tokens/design-tokens.json` (hoy solo hay `states.error`, clay `#C9836B`).
   - **iPhone:** `src/lib/plataforma.js` (`esNativa`, `esIPhone`); `capacitor.config.json`; `ios/App/App/Info.plist`; `ios/App/CapApp-SPM/Package.swift` y `Package.resolved`; `src/lib/__tests__/appIos.test.js`; `src/lib/__tests__/dobleDeCapacitor.js`.
6. **Lee el código antes de proponer** (DP-24.9 y DP-24.11): el Swift de `@capacitor-firebase/authentication` 8.5.2 que ya está en `node_modules` (`FirebaseAuthentication.swift`, `revokeAccessToken`; `AppleAuthProviderHandler.swift`, `authorizationCode`), el `RevokeTokenRequest` del SDK de Firebase para iOS que resuelve SPM (búscalo en el checkout de `firebase-ios-sdk` de DerivedData o en su repositorio, en la versión que fija `Package.resolved`), y el código de los plugins candidatos de compartir y de archivos, en una carpeta aparte con `npm pack`. **No instales nada en `revision-24` hasta la aprobación.**
7. Entrega un **reporte previo** con todos los puntos marcados **REPORTA**, la lista de archivos que vas a crear o tocar, el esquema del `.json` exportado, un ejemplo del `.md` con un día de cada tipo, y **los textos exactos que la fundadora verá en pantalla** en cada prueba manual del §5.2 (cada pantalla del borrado en cada estado, la pantalla «a medio borrar», la despedida, las líneas del diagnóstico y lo que dirá el diagnóstico del almacén después de borrar).
8. **Espera la aprobación de la fundadora.** No cambies código antes.

---

## 1. Decisiones

### 1.1 Ya tomadas, no se reabren

| Origen | Decisión |
|---|---|
| DP-21.3 / DP-21.8 / DP-17B.2 | **El identificador (`com.hellostrivo.strivo`), el esquema y host del WebView (`capacitor://localhost`, los de fábrica) y la base SQLite (`Library/Strivo/strivo.sqlite`) no se tocan.** Nada de `server`, `scheme`, `hostname` ni `allowNavigation` en `capacitor.config.json`. Borrar la cuenta **vacía** la base; no la mueve, no la renombra y no borra el archivo. |
| Fundadora, 14 nov 2026 | **Borrar una cuenta no tiene vuelta atrás.** Confirmación clara, sin culpa ni presión, y **nada se borra a medias**: lo del teléfono no se toca hasta que la nube y la cuenta ya no existen, y un borrado interrumpido se termina o se repara (DP-24.12 y DP-24.13). |
| SPEC_24 §2 | **24B depende de 24A.** La primera pantalla del borrado ofrece primero llevarse lo escrito. |
| SPEC_24 §2 | **Fuera:** importar datos, exportar por fechas, PDF con diseño, borrado selectivo de entradas (ya existe por entrada y no se toca), cancelar la suscripción desde la app. |
| SPEC_21.2, nota en SPEC_24 | **La reautenticación del borrado no puede ser solo con contraseña.** El método sale de la sesión (`metodoDeSesion`), no de `providerData[0]`. |
| Apple, Guideline 5.1.1(v) | **Con Iniciar sesión con Apple, borrar la cuenta revoca el token de Apple.** El código de autorización caduca a los cinco minutos y sirve una vez: sale de la reautenticación hecha justo antes de borrar, nunca de uno guardado. |
| SPEC_22, nota en SPEC_24 | **Borrar la cuenta cancela todos los avisos de Strivo** con `apagarAvisos()`, solo en la app de iPhone y cargado bajo demanda, antes de cerrar la sesión. |
| SPEC_23A, nota en SPEC_24 | **Borrar la cuenta borra la clave de Face ID de la Keychain** con `biometria.borrar()` (no pide la cara, nunca lanza), solo en la app de iPhone y cargado bajo demanda. |
| RN-DB-04 / §7.7.1 | **El PIN nunca sale del dispositivo**, tampoco en el archivo exportado: ni el hash, ni la sal, ni el verificador de Face ID. |
| RN-07 | **Nada de lo exportado ni del borrado va a analítica**, ni el hecho de haber borrado una cuenta. |
| RN-VOZ-01 / RN-VOZ-02 / CLAUDE.md §3 | **Todo texto vive en `src/copy/` y pasa `lint:copy`.** Sin léxico prohibido y **sin signos de exclamación**. «Apple», «Google», «Apple ID» y «Face ID» son nombres de producto y no se traducen. |
| `TuCuenta.jsx`, «Nada bloquea» | **Ningún control lleva `disabled`, `required` ni `aria-invalid`.** Lo que falte se dice en palabras, junto al campo, anunciado con `aria-describedby`. Esto **corrige** el «botón deshabilitado hasta que coincida» de SPEC_24 §3 y §5. |
| SPEC_21.2 | **Ningún objeto de plugin de Capacitor sale suelto de una promesa**: se devuelve envuelto, `{ plugin }`. |
| SPEC_22, DP-22.13 | **`esIPhone()` de `plataforma.js` es la única pregunta por la plataforma** para lo que solo existe en el iPhone (avisos, Face ID, suscripción y compras de Apple). |
| SPEC_22 | **Plugins y dependencias nuevas en versión exacta**, comparadas por mantenimiento reciente, y **un solo archivo de `src/` importa cada uno, bajo demanda**, con una prueba que recorre `src/` para comprobarlo. Nada de ellos en el chunk principal de la web. |
| SPEC_17B / SPEC_22 / SPEC_23 | **Pruebas manuales solo con lo que se ve.** Sin consola de Safari, sin Inspector web y sin la consola de Xcode. Lo que haga falta medir se pinta en pantalla en un build de diagnóstico. La consola de Firebase en el navegador sí vale: es una pantalla. |
| SPEC_17B | **Tras borrar la app, la primera apertura de una compilación de Xcode necesita internet.** Ninguna prueba pide abrirla sin red. |
| SPEC_21.1 | **El Team de firma vive en `project.pbxproj` como cambio local y no se comitea nunca.** Commits por ruta, nunca `git add -A`, `git add .` ni `git commit -a`. No aceptes «Update to recommended settings» de Xcode. Esta tarea no añade capacidades en «Signing & Capabilities» (Sign in with Apple ya está). |
| Instrucciones del proyecto | **Formia** (rama `formia-paused`) no se toca, no se consulta y no se reintroduce nada de ella. **DP-21.5** sigue abierta y no se decide aquí. |
| SPEC_24 §10 | **`Purchases.logOut()` de RevenueCat se añade en SPEC_25**, no aquí. Deja el punto marcado con un comentario en el sitio donde irá. |

### 1.2 Nuevas, para confirmar en el reporte previo

#### Generales

| DP | Propuesta |
|---|---|
| **DP-24.1 · La exportación entra en la 1.0** | **Sí.** Es RN-08 y la contraparte del borrado. Funciona **con cuenta y sin cuenta**, en la web y en el iPhone, y **sin red**. |
| **DP-24.5 · Dónde viven** | La app no tiene «Ajustes»: tiene Tu perfil. **Un bloque nuevo al final de Tu perfil, `tusDatos`, título «Tus datos»**, detrás de `sincronizacion` (un identificador en `bloques.js`, un texto en el copy y un componente, como pide su cabecera). Dentro: **«Llevarme lo que escribí»** siempre; y debajo, como **última opción de toda la pantalla y con peso visual bajo** (texto secundario, no botón de color), **«Borrar mi cuenta»**, solo con la sesión `conCuenta`. Sin cuenta o con la sesión `vencida` no aparece (Tu cuenta ya ofrece entrar). Los pasos del borrado son una capa a pantalla completa por encima de Tu perfil (como `Confirmacion`, con `role="dialog"`), sin rutas nuevas. **REPORTA** si prefieres otra forma y por qué. |
| **DP-24.3 · El tono del botón final** | **Ningún color nuevo.** Solo el botón final de la última confirmación usa el tono de acción destructiva, y **ese tono es el `states.error` que ya existe (clay)**, si pasa AAA en los dos momentos en `lint:contraste`; si no lo pasa, el botón va como el primario de siempre. Nada rojo ni alarmante: la pantalla no asusta. **REPORTA** el contraste medido. |

#### 24A · Llevarme lo que escribí

| DP | Propuesta |
|---|---|
| **DP-24.6 · Con el journal protegido** | Con PIN activo (`estadoPin(uid).activo`), **preparar el archivo pide antes el PIN, o Face ID si está activo** (la misma puerta del Journal, sin copiarla). Cancelar no prepara nada y no dice nada. Motivo: con el PIN puesto el Historial no lee el journal siquiera, y un archivo sin puerta sería otra forma de leerlo. **REPORTA** cómo reutilizas `BloqueoPin` / `usePin` sin duplicar la lógica. |
| **DP-24.7 · Qué entra en el archivo** | **Todo lo de la persona, nada de la maquinaria:** `shared/profile`, `shared/auth` (correo; nunca el uid de otro), `shared/preferences`, `shared/onboarding` (sus respuestas), `shared/frases` (la preferencia de frases es suya, aunque no suba a la nube), todas las mañanas, noches y entradas del journal **con los campos de versiones anteriores** (RN-HIS-07), `diario/dayState` si tiene contenido de la persona, y la configuración, favoritos, recientes y sesiones de Respiración. **Nunca:** `diario/pinConfig`, `diario/frasesDelDia` (asignaciones internas), la cola, las marcas ni las claves del teléfono. **Fuente: el almacén local** (SQLite o IndexedDB), que con la cola incluida es lo más completo que hay. **REPORTA** la tabla registro por registro (entra / no entra / por qué) y qué pasa si la restauración de esa cuenta no terminó en este teléfono (¿se avisa? propón). |
| **DP-24.8 · El formato** | Un `.zip` llamado `strivo-{nombre}-{fecha}.zip` (nombre en minúsculas, sin acentos ni espacios; sin nombre, `strivo-{fecha}.zip`; fecha `YYYY-MM-DD` local) con **`entradas.md`** y **`entradas.json`**. **`.md`:** una sección por día, en orden cronológico, **con la pregunta delante de cada respuesta** (el diferenciador de Strivo), textos tal cual, sin resumir ni interpretar; las emociones con su rótulo en el género de la persona; los campos viejos con sus rótulos propios; el journal dentro de su día; Respiración al final. **Reutiliza** lo que ya decide qué bloques hay y con qué título (`resumenDeManana`, las funciones de la noche, lo que pinta el Historial): una regla, un sitio. **`.json`:** con `formato: "strivo.exportacion"` y `version: 1`, la fecha de exportación, y los registros con sus identificadores **y** el rótulo resuelto al lado; esquema documentado en el reporte. Ningún texto del archivo lleva léxico prohibido (los rótulos salen del copy). |
| **DP-24.9 · Cómo se entrega** | **Web:** descarga directa del archivo. **iPhone:** la hoja de compartir del sistema. **Primero comprueba** si `navigator.share({ files })` funciona dentro del WebView de la app (iOS 16.2+): si funciona, **sin plugins nuevos**. Si no: **`@capacitor/share` 8.0.3** y **`@capacitor/filesystem` 8.1.5**, versión exacta, el archivo en `Directory.Cache` y borrado tras compartir (**REPORTA** su dependencia `@capacitor/synapse`, si traen manifiesto de privacidad propio y si `filesystem` usa API que Apple obliga a declarar). **El zip: `fflate` 0.8.3**, versión exacta, cargado bajo demanda (es dependencia no-Capacitor: la aprueba la fundadora). Cancelar la hoja no dice nada; volver a tocar regenera. **REPORTA** cuánto crece la app y el chunk que carga al exportar. |

#### 24B · Borrar mi cuenta

| DP | Propuesta |
|---|---|
| **DP-24.4 · Quién borra la nube** | **(A) La propia app, sin servidor (propuesta).** Las reglas ya dejan a cada uid borrar su árbol, la app conoce la lista entera de rutas (`DOCUMENTOS` y `SUBCOLECCIONES` de `restaurar.js`), y una cuenta normal cabe en un solo lote de 500 operaciones, que Firestore aplica entero o nada. No exige el plan Blaze ni tarjeta, ni carpeta `functions/`, ni la CLI de Firebase, ni tocar las políticas de la organización `hellostrivo.com` en Google Cloud. Sus dos riesgos se cubren aquí: **que la app se cierre a mitad** (DP-24.12 y 24.13) y **que quede algo en una ruta que la lista no conoce** (criterio automático 9 y DP-24.10). **(B) Una Cloud Function `onCall`** con `recursiveDelete` que verifica `request.auth.uid`. Borra subcolecciones que la lista no conozca y no depende de que la app siga abierta, pero no es atómica, exige Blaze, desplegar con la CLI y, probablemente, cambiar la política de dominio de la organización para que la app pueda llamarla. **Si la fundadora elige B, no construyas nada de la nube hasta una adenda**; el resto de 24B sigue igual. |
| **DP-24.10 · Leer para borrar** | Borrar exige saber qué hay en la nube, y **`restaurar.js` es la única que lee de Firestore** (prueba del criterio 1 de `restaurar.test.js`). **Propuesta: la lectora sigue siendo una.** `restaurar.js` exporta una función que enumera las rutas de `users/{uid}/` con su misma lista y su misma paginación (por ejemplo `rutasEnLaNube(uid)`), y el borrado la usa. Añade `diario/pinConfig` como ruta a borrar por si alguna versión vieja la hubiera subido, sin leerla. **REPORTA** si hay rutas que la app escribió alguna vez y no están en la lista (compara con `schema.js` `paths`, con todo lo que `sync.js` puede encolar y con el historial de git; el comentario de `firestore.rules` nombra un `lumia/pinConfig`). |
| **DP-24.11 · Revocar el token de Apple** | Solo si la sesión entró con `apple.com`. Tres caminos, por orden de preferencia: **(c) directa, sin sesión nativa ni servidor:** desde JavaScript, la misma llamada que hace el SDK de iOS en `Auth.auth().revokeToken(withAuthorizationCode:)` —`POST https://identitytoolkit.googleapis.com/v2/accounts:revokeToken?key=…` con `providerId: "apple.com"`, `tokenType: "CODE"`, `token` (el código) e `idToken` (el de la sesión de JavaScript)—. **Solo si** al leer `RevokeTokenRequest` del SDK de iOS confirmas que el cuerpo es ese, qué cabeceras manda (por ejemplo `X-Ios-Bundle-Identifier`) y que la llamada sale desde el WebView sin que CORS la frene. **(a) nativa:** la reautenticación de Apple **del borrado** se hace con `signInWithApple({ skipNativeAuth: false })`, para que el SDK nativo tenga sesión; se llama a `revokeAccessToken({ token: código })` del plugin y se cierra esa sesión nativa. **Ojo, leído en el SDK:** sin usuario nativo, `revokeToken(withAuthorizationCode:)` **no hace nada y no da error**. Comprueba que la credencial que devuelve sirve también para `reauthenticateWithCredential` en JavaScript, con una sola hoja. **(b) servidor**, solo si DP-24.4 = B. **El código sale de `credencialNativa`** (`credential.authorizationCode`), y solo para el borrado: `datosDeCredencial` sigue sin tomar el nombre (prueba que lo vigila). **La revocación es el primer paso del borrado** (DP-24.12): si falla, se para y no se ha borrado nada. **REPORTA** el camino elegido con lo leído. |
| **DP-24.12 · El orden, y qué es «a medias»** | **Antes de borrar nada (si algo falla aquí, no se borró nada):** hay red, hay configuración de Firebase, la sesión es `conCuenta` y la reautenticación acaba de pasar. **Después, en este orden:** (1) se escribe una **marca local de borrado** (`strivo.borrado.<uid>`, por `clavesDelTelefono.js`, para que sobreviva en SQLite); (2) **se detiene toda subida y toda restauración de ese uid** mientras exista la marca: `cancelRetries`, se espera `flushEnCurso` con techo, y ningún disparador de `flush` ni de `restaurar` corre para ese uid (**REPORTA** la lista entera de disparadores y cómo los bloqueas); (3) con Apple, **se revoca el token**; (4) **se borra la nube** por lotes de hasta 500 con `writeBatch` y `conLimite`, y **se vuelve a enumerar** para confirmar que no queda nada; (5) **`deleteUser`**; (6) **se limpia el teléfono** (DP-24.14); (7) se quita la marca; (8) despedida. **Dos errores distintos, y ninguno miente:** si falla antes del paso 3, «No se borró nada»; si falla en el 3 o después, **no se puede prometer que no se borró nada** (un lote vencido puede aplicarse más tarde), así que se dice que lo de este teléfono sigue aquí, la marca se queda y DP-24.13 lo termina o lo repara. Esto **corrige** el `errorParcial` de SPEC_24. **REPORTA** los estados de la máquina (SPEC_24 pedía cinco). |
| **DP-24.13 · Si el borrado se interrumpe** | Al abrir la app con la marca puesta: **si la cuenta ya no existe** (no hay usuario tras `authStateReady()`), se limpia el teléfono y se muestra la despedida (el caso de SPEC_24 §3). **Si la cuenta todavía existe**, se muestra una pantalla «Tu cuenta quedó a medio borrar» con dos salidas: **«Terminar de borrar»** (vuelve a la reautenticación y sigue desde el paso 1; todo es idempotente) y **«Conservar mi cuenta»**, que **vuelve a encolar todo lo local de esa cuenta para que la nube se reconstruya** desde el teléfono, quita la marca y reanuda la subida. Así nada queda a medias: o se termina, o se repara. **REPORTA** cómo se encola todo sin pisar la regla de las semillas (`esSemilla`) y si `setDoc` sin `merge` basta. |
| **DP-24.14 · Qué se limpia en el teléfono** | **Al terminar, en este teléfono no queda nada de Strivo, como recién instalada:** todas las filas y la cola **de todos los uid** del almacén (el de la cuenta y los `local-…` que una entrada a cuenta dejó conservados), las claves `strivo.*` de las tres familias y la marca, la clave de Face ID, los avisos, la sesión de Google del SDK nativo (`cerrarSesionNativa`) y la sesión de Firebase (la cierra `deleteUser`). **En la app nativa, también la copia vieja de IndexedDB** (DP-17B.10 decía «no se borra»: esta es la excepción, porque es lo escrito por la persona y lo pidió borrar; para quien instale la 1.0 esa copia no existe). Se conserva solo lo técnico que no es de nadie (por ejemplo la pista `strivo.almacen`). Después, como al cerrar sesión: uid local nuevo, árbol sembrado y de vuelta a Hoy, donde `Entrada` encuentra el onboarding. **REPORTA** el inventario completo (qué se borra y qué se queda, con el porqué) y si conviene que borrar todos los uid sea así o solo el de la cuenta. |
| **DP-24.15 · La cola con pendientes** | **No se avisa.** SPEC_24 pedía `pendientesSinSubir`, pero lo que no subió está en el teléfono y **por eso entra en el archivo** de 24A; después se borra con todo lo demás. Un aviso más no protege nada. Decide la fundadora. |
| **DP-24.16 · Suscripción y compras (solo iPhone)** | En la primera pantalla, **en la app de iPhone**, dos frases (§6): que borrar la cuenta no cancela la suscripción, con un enlace **«Ver mi suscripción»** a `https://apps.apple.com/account/subscriptions` (el que da Apple en su guía de 5.1.1(v)); y la frase de la fundadora: **lo pagado queda ligado al Apple ID, no a la cuenta de Strivo, y se recupera con «Restaurar compras»** (el nombre exacto que usa SPEC_25 en `paywall.restaurar`). Se muestran **desde ya**, aunque SPEC_25 todavía no exista: la 1.0 sale con las dos cosas. En la web no hay compras y no se dice nada. **REPORTA** cómo se abre el enlace sin `allowNavigation` (por ejemplo `window.open` con `_blank`, o `@capacitor/browser` si hace falta) y que se puede volver a la app. SPEC_25 podrá cambiar el enlace por `showManageSubscriptions`. |
| **DP-24.17 · Otro teléfono o la web** | Borrar no alcanza lo que esté guardado en otro dispositivo con la misma cuenta: ahí se queda, y esa sesión acaba como `vencida`. **Una frase en la primera pantalla** que lo dice (§6). **REPORTA** también el riesgo residual: un token de otro dispositivo sigue valiendo hasta una hora y podría volver a subir algo de su cola a `users/{uid}` después del borrado. Propón si se mitiga o se documenta. |
| **DP-24.2 · La última confirmación** | **Escribir la palabra BORRAR** (no un segundo botón): evita borrar por un toque sin querer en una app que se usa antes de dormir. Campo `type="text"`, sin autocorrección ni sugerencias, mayúsculas solo visuales, la comparación **sin distinguir mayúsculas y sin espacios alrededor**. **El botón no se deshabilita** (§1.1): con otra palabra, al tocarlo aparece `confirmarNoCoincide` y no pasa nada. «Quedarme» siempre. |
| **DP-24.18 · Reautenticar para borrar** | **Se pide siempre**, no solo cuando Firebase lo exige. Con correo: la contraseña. Con Google o Apple: su botón, que abre su hoja (en web, ventana emergente; Apple no existe en web). Contraseña equivocada: el mismo mensaje de siempre, tres intentos no bloquean. Cancelar la hoja: la pantalla se queda como estaba, sin nota. **Saca la reautenticación a `lib/`** sin la dependencia del PIN (`metodoDeRecuperacion`), y que el PIN la use desde ahí sin cambiar lo que hace. **REPORTA** qué pruebas del PIN cambian (no debería cambiar ninguna comprobación). |
| **DP-24.19 · La despedida** | Pantalla con `despedida` y un solo botón, **«Cerrar»**, que lleva a la primera pantalla del onboarding **sin el umbral** (no es una bienvenida). Nada más. |
| **DP-24.20 · Build de diagnóstico** | Con `VITE_DIAG_BORRADO=1`, un panel pequeño y plegable en el bloque «Tus datos», con: la fase en la que está o quedó el borrado y la marca; cuántos documentos encontró en la nube y cuántos borró; si la revocación de Apple respondió bien; y tres controles: **«Fallar antes de la nube»** (para ver «No se borró nada»), **«Detenerse después de la nube»** (borra la nube y se para antes de `deleteUser`, para cerrar la app y ver DP-24.13) y **«Sembrar días de prueba»** (escribe en la cuenta abierta unos 300 días con mañana y noche —más de 500 documentos— para probar la exportación grande y el borrado en varios lotes). Textos en `src/copy/diagnostico.js` bajo su propia clave, cargados solo con la bandera, con la prueba que construye sin ella y no los encuentra en `dist/`, y la que comprueba que no arrastra los de las otras banderas. **Se combina** con `VITE_DIAG_ALMACEN=1` (registros y por subir) y `VITE_DIAG_AVISOS=1` (avisos programados), que ya existen. **Sin la bandera, la app se porta exactamente igual.** |

Criterio de producto de la fundadora, que manda sobre todo lo anterior: **llevarse lo escrito es fácil y está siempre a mano; borrar se encuentra sin buscar, se entiende sin miedo, se confirma sin culpa y, cuando termina, no queda nada; y si algo se interrumpe, nada queda a medias.**

---

## 2. Lo que ya está verificado en el código (14 nov 2026, sobre `d90427a`)

### 2.1 Cerrar sesión hoy

- `salirDeCuenta(uid)` (`src/lib/salidaCuenta.js`): vuelve a mirar la cola (`comprobarSalida`, con techo `TECHO_DE_ESPERA_MS`) y **no sale con pendientes**; luego `cancelRetries()` → `apagarAvisos()` (solo iPhone, bajo demanda) → `cerrarSesion()` → `borrarUid(uid)` → `olvidarFaceId()` (solo iPhone) → `olvidarUid(uid)`.
- `cerrarSesion()` (`cuenta.js`) hace `signOut` de Firebase y, **solo si la sesión entró con Google o Apple en nativo**, `cerrarSesionNativa()` (sin `GoogleService-Info.plist` el plugin cerraría la app).
- `salir` de `ArranqueProvisional.jsx`: tras `salirDeCuenta`, acuña un uid local nuevo, `prepararArbol(nuevo)`, `fijarUid` y `navegar('/hoy')`, donde `Entrada` encuentra el onboarding pendiente.
- `borrarUid(uid)` (`local.js`) borra filas y cola **de ese uid y de ningún otro**, en el adaptador vigente (SQLite en nativo, IndexedDB en web), y retira `strivo.mudanzaPendiente.<uid>`. **La copia vieja de IndexedDB de la app nativa no se toca** (DP-17B.10).

### 2.2 La nube

- `firestore.rules`: `match /users/{uid}/{document=**} { allow read, write: if request.auth != null && request.auth.uid == uid; }` y todo lo demás cerrado. **Borrar el propio árbol desde la app ya está permitido.**
- `restaurar.js` es la **única** lectora de Firestore (lo vigila `restaurar.test.js`, criterio 1) y lleva la lista literal de lo que hay en la nube, porque el SDK web no enumera subcolecciones: `DOCUMENTOS` (`shared/profile`, `shared/auth`, `shared/preferences`, `shared/onboarding`, `breathing/unica`) y `SUBCOLECCIONES` (`diario/journal/items`, `diario/morningEntry/items`, `diario/nightRitual/items`, `diario/dayState/items`, `breathing/favoritos/items`, `breathing/recientes/items`, `breathing/sesiones/items`), con páginas de 300 y `conLimite` por lectura.
- Lo que **nunca sube**: `diario/pinConfig`, `shared/frases` y `diario/frasesDelDia` (`esRutaLocal`).
- `sync.js` sube con `setDoc` **sin `merge`** (o `deleteDoc`), y `flush` se dispara al empezar (`startSync`), 2 s después de cada escritura (`alEncolar`), con `online`, con `visibilitychange` y `pagehide`, con los reintentos y con «Intentar de nuevo» de Tu perfil.
- `restaurar` se dispara en `prepararArbol` (con un reintento), al volver la red (`reintentarAlVolverLaRed`), desde `ArranqueProvisional` y con el botón de Tu perfil (`useSincronizacion`).

### 2.3 Reautenticación

- `reautenticar(uid, { contrasena })` vive en `src/diario/pin.js` y **empieza por `metodoDeRecuperacion(uid)`**, que es del PIN. Con `password` pide la contraseña (`pide-contrasena`) y usa `EmailAuthProvider.credential`; con Google o Apple llama a `reautenticarConProveedor` (`lib/reautenticacion.js`): en web, `reauthenticateWithPopup`; en nativo, `credencialNativa` + `reauthenticateWithCredential`.
- `credencialNativa` llama a `signInWithApple({ skipNativeAuth: true })` y `datosDeCredencial` toma **solo** `idToken` y `nonce`. **El plugin sí devuelve `credential.authorizationCode`** con Apple (leído en `AppleAuthProviderHandler.swift` de la 8.5.2), pero hoy nadie lo toma.
- El plugin tiene `revokeAccessToken({ token })`, que en iOS llama a `Auth.auth().revokeToken(withAuthorizationCode:)`, y **eso exige un usuario en el SDK nativo**; con `skipNativeAuth: true` no lo hay. El SDK de JavaScript (firebase 10.14.1, `@firebase/auth` 1.7.9) tiene `revokeAccessToken(auth, token)`, que manda `tokenType: "ACCESS_TOKEN"` a `/v2/accounts:revokeToken`: **no acepta el código de autorización**. El servicio de Identity Platform sí acepta `tokenType: "CODE"`.

### 2.4 Lo que se exporta hoy

- **Nada.** RN-08 está escrita y no hay ninguna función de exportar en `src/`.

### 2.5 Tu perfil

- `BLOQUES` = `nombre`, `genero`, `horarios`, `recordatorios` (solo iPhone), `frases`, `cuenta`, `sincronizacion`. Añadir un bloque es un identificador, un texto y un componente; hay una prueba que lo exige.
- `TuCuenta.jsx`: vistas dentro del bloque, sin rutas; «Nada bloquea» (sin `disabled`); `unaVezCon` para el doble toque; `Confirmacion` para salir. La cabecera de `Confirmacion.jsx` ya dice que SPEC_24 la reutilizará.
- `design-tokens.json` no tiene token de acción destructiva; tiene `states.error` (clay `#C9836B`).

### 2.6 El iPhone

- `apagarAvisos()` (`avisos/reconciliar.js`) y `biometria.borrar()` (`lib/biometria.js`) existen y se cargan bajo demanda desde `salidaCuenta.js`.
- La sesión de Firebase Auth vive en el IndexedDB del WebView; lo escrito y la cola, en SQLite.

### 2.7 Lo que esta instrucción corrige de SPEC_24

| SPEC_24 decía | Manda ahora | Por qué |
|---|---|---|
| «Ajustes → …» | El bloque «Tus datos» al final de Tu perfil (DP-24.5) | La app no tiene Ajustes. |
| Reautenticación con contraseña | Por el método de la sesión: contraseña, Google o Apple (DP-24.18) | Nota de SPEC_21.2. |
| Botón deshabilitado hasta escribir BORRAR | Sin `disabled`; el mensaje aparece al tocar (DP-24.2) | «Nada bloquea». |
| `errorParcial`: «Nada se ha borrado todavía» | Dos errores: antes y durante (DP-24.12) | Después de empezar con la nube no se puede prometer. |
| La app cerrada a mitad: solo el caso «Auth ya no existe» | También «la cuenta todavía existe»: terminar o conservar (DP-24.13) | Nada a medias. |
| `pendientesSinSubir` | No se avisa (DP-24.15) | Lo pendiente entra en el archivo. |
| Recomendado: Cloud Function por atomicidad | Propuesta: la app (DP-24.4) | Ninguna de las dos es atómica; un lote de 500 sí. |
| Prueba con el emulador y reglas restrictivas | Dobles en las pruebas automáticas y build de diagnóstico en el iPhone (DP-24.20) | El proyecto no usa el emulador; las pruebas manuales son solo lo que se ve. |
| Verificar «con inspección de SQLite y de `localStorage`» | El diagnóstico del almacén en pantalla (DP-24.20) | Igual. |
| Revocar Apple: sin camino elegido | (c), (a) o (b) (DP-24.11) | Leído en el plugin y en los SDK. |
| `Purchases.logOut()` | En SPEC_25 | SPEC_24 §10. |
| «Cancelar la suscripción»: «se informa cómo» | Texto, enlace a Apple y la frase de las compras (DP-24.16) | Petición de la fundadora. |

---

## 3. Alcance

**Entra:** 24A entera; 24B entera (nube, revocación de Apple, cuenta, teléfono, interrupción); el bloque «Tus datos»; el build de diagnóstico; pruebas; `CLAUDE.md`; esta instrucción en `docs/specs/`; una nota en `SPEC_25` (DP-24.16 y `Purchases.logOut()`).

**No entra:** cambiar cómo se cierra sesión (salvo usar las mismas piezas); la Cloud Function (salvo DP-24.4 = B, con adenda); RevenueCat; Android; DP-21.5; verificación de correo; vincular métodos; tocar `entrarACuenta`, `arbolDeEntrada` o `conflictos.js` más allá de lo que pida DP-24.13; el aviso de privacidad (tarea A9, aparte).

---

## 4. Cambios esperados (a confirmar en el reporte previo)

Los nombres los propones tú; esta es la forma:

- **`src/lib/exportar/`** (24A, territorio neutral, como `referencias/` y `content/`): leer el almacén de un uid, construir `entradas.json` y `entradas.md`, comprimir (el único archivo que importa `fflate`, bajo demanda) y entregar (el único que importa los plugins de compartir, si hacen falta). Si `lib/` no puede leer los resúmenes de `diario/` por la dirección de dependencias (RN-TEC), **REPORTA** dónde va cada pieza: lo que pinta un día ya vive en `diario/`, y no se copia.
- **`src/lib/borrarCuenta.js`** (24B): la máquina de estados, la marca, el orden de DP-24.12, la limpieza de DP-24.14, la retoma de DP-24.13. Reutiliza `apagarAvisos`, `olvidarFaceId`, `cerrarSesionNativa`, `borrarUid` y `olvidarUid`; si alguna vive privada en `salidaCuenta.js`, muévela a un sitio común en lugar de copiarla.
- **`src/lib/db/restaurar.js`**: la enumeración de rutas de DP-24.10.
- **`src/lib/db/sync.js`** y quien dispara `restaurar`: no corren con la marca de borrado puesta.
- **`src/lib/reautenticacion.js`**: la reautenticación sin PIN (DP-24.18) y, con Apple, el código de autorización para el borrado.
- **`src/lib/credencialNativa.js`**: devolver también `authorizationCode` cuando lo pida el borrado (y la variante de DP-24.11 si es la (a)).
- **`src/diario/pin.js`**: `reautenticar` usa la de `lib/` sin cambiar lo que hace.
- **`src/perfil/bloques.js`**, **`src/components/perfil/TusDatos.jsx`** (o el nombre que propongas) y los componentes de los pasos del borrado, la pantalla «a medio borrar» y la despedida.
- **`src/components/ArranqueProvisional.jsx`** (o donde corresponda): al arrancar, mirar la marca (DP-24.13); al terminar, uid nuevo y a Hoy, como `salir`.
- **`src/copy/index.js`** (§6) y **`src/copy/diagnostico.js`**.
- **`package.json`, `package-lock.json`** y, si hay plugins, **`ios/App/CapApp-SPM/Package.swift` y `Package.resolved`**: solo el bloque `dependencies`.
- **`capacitor.config.json`**: sin cambios, salvo que un plugin lo necesite (**REPORTA**).
- **Pruebas nuevas en archivos propios** (por ejemplo `src/lib/__tests__/exportarCuenta.test.js` y `borrarCuenta.test.js`), con dobles de Firestore como los de `restaurar.test.js` y el doble Proxy de `dobleDeCapacitor.js`.
- **`CLAUDE.md`:** una sección «Llevarme lo que escribí y borrar mi cuenta (SPEC_24)», «Dónde vive cada regla» (exportar, borrar, la enumeración en `restaurar.js`), la regla de la única lectora con su ampliación, la excepción a DP-17B.10, los recuentos de §13.
- **`docs/specs/SPEC_25_MURO_DE_PAGO.md`:** una nota: «Restaurar compras» se llama así porque la pantalla de borrado la nombra; `Purchases.logOut()` va en el sitio marcado de `borrarCuenta.js`; y si hace falta borrar el cliente de RevenueCat (pide su llave secreta, que no puede ir en la app), se decide allí.

**REPORTA, además:**

- **El inventario del teléfono** (DP-24.14) y **el de la nube** (DP-24.10).
- **Los disparadores de `flush` y `restaurar`** y cómo quedan bloqueados con la marca.
- **Cuánto tarda exportar** 300 y 2.000 días en el simulador (SPEC_24 pide menos de 5 s para 2.000) y **cuánto borrar** 600 documentos contra un doble con la latencia de una red de teléfono.
- **El simulador:** si puedes probar la hoja de compartir y el borrado con una cuenta de correo de prueba en el simulador contra `strivo-fe04f` (con una cuenta que crees tú y borres al terminar).
- **Tamaño** de la app en Release y de los chunks de `npm run build`, antes y después; nada nuevo en el chunk principal.
- **Firebase:** si `deleteUser` puede fallar por la configuración del proyecto (por ejemplo «Acciones del usuario → Habilitar eliminación» de Authentication) y con qué código, para decir lo correcto en pantalla.

---

## 5. Criterios de aceptación

### 5.1 Automáticos (Claude Code)

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde, en los dos proyectos (`indexeddb` y `sqlite`).
2. **Exportar:** el `.md` sale en orden cronológico, con la pregunta delante, el texto tal cual (saltos de línea, comillas, `#`, `*` y `<` sin romper el formato), las emociones con el rótulo del género de la persona y los campos de versiones anteriores con sus rótulos; el `.json` valida contra el esquema del reporte y lleva `formato` y `version`.
3. **Exportar no saca** `pinConfig`, `frasesDelDia`, la cola ni las claves del teléfono (prueba que recorre el archivo generado).
4. **Exportar sin entradas** da un archivo con el perfil y el texto `sinEntradas` en pantalla; **sin red** funciona igual; **con PIN** no se prepara nada sin la puerta.
5. **Exportar 2.000 días** tarda menos de 5 s en la prueba (con la holgura que propongas para la máquina de CI).
6. **La máquina del borrado:** cada estado y cada transición, con los dos errores de DP-24.12 en su sitio: fallar en las precondiciones o en la reautenticación no escribe la marca ni borra nada; fallar en la revocación no borra nada; fallar a mitad de la nube deja la marca y **todo lo local intacto**; fallar en `deleteUser` igual.
7. **Lo local no se toca hasta que la nube está vacía y la cuenta ya no existe** (prueba que espía el orden de las llamadas).
8. **Con la marca puesta no hay subida ni restauración** para ese uid, por ningún disparador.
9. **La lista de borrado es la de la restauración**: una prueba falla si alguien añade una ruta a `DOCUMENTOS`/`SUBCOLECCIONES` o a lo que `sync.js` puede encolar sin que el borrado la cubra.
10. **Más de 500 documentos** se borran en varios lotes, y la enumeración final confirma cero.
11. **Retoma:** con la marca y sin usuario, se limpia y se despide; con la marca y con usuario, «Terminar» sigue y «Conservar» encola todo lo local y quita la marca.
12. **Apple:** solo con `apple.com` se revoca; el código sale de la reautenticación de ese mismo borrado; `datosDeCredencial` sigue sin tomar el nombre; la revocación va antes de la nube.
13. **El teléfono queda vacío** según el inventario aprobado: filas y cola, claves `strivo.*`, marca, clave de Face ID (`biometria.borrar` llamado), avisos (`apagarAvisos` llamado), sesión nativa de Google (solo si entró con proveedor) y, en nativo, la copia vieja de IndexedDB.
14. **BORRAR:** acepta `borrar`, `Borrar`, ` BORRAR ` y rechaza cualquier otra cosa; ningún control lleva `disabled`.
15. **En la web** no aparecen las frases de suscripción ni de compras, no hay Apple, y ningún plugin nativo se carga.
16. **Cada dependencia nueva se importa en un solo archivo y bajo demanda** (prueba que recorre `src/`), y nada de ellas ni del diagnóstico entra en el chunk principal de la web.
17. **Diagnóstico:** sin `VITE_DIAG_BORRADO`, ni una línea suya en `dist/` y la app se porta igual; cada bandera no arrastra los textos de las otras.
18. `appIos.test.js` sigue exigiendo identificador, esquema, host y base de fábrica; la base no cambia de nombre ni de carpeta.
19. `lint:copy` revisa el copy nuevo; ningún texto lleva «!» ni «¡».
20. Ningún commit lleva `DEVELOPMENT_TEAM` ni `GoogleService-Info.plist` (`git show :ios/App/App.xcodeproj/project.pbxproj | grep DEVELOPMENT_TEAM` sale vacío).
21. **Cerrar sesión no cambia**: las pruebas de SPEC_19, 21.2, 22, 23A y 31 sobre la salida pasan sin cambiar lo que comprueban, y cerrar sesión nunca borra nada de la nube.
22. Las pruebas de SPEC_17A, 17B, 19, 21.1, 21.2, 22, 23, 29, 30 y 31 siguen pasando sin cambiar lo que comprueban (salvo la lista de dependencias de `sonidoYFavoritos.test.js` y las listas de banderas de los diagnósticos, si hace falta).
23. **Al menos 40 casos nuevos** entre 24A y 24B (los del diagnóstico no cuentan).

### 5.2 Manuales (la fundadora, en su iPhone 17 y en la web, contra `strivo-fe04f`)

**Nombres de las builds que se usan abajo:**

| Nombre | Carpeta y rama | Cómo se compila |
|---|---|---|
| **«La 24 con diagnóstico»** | `~/Developer/strivo-24`, `revision-24` | `VITE_DIAG_BORRADO=1 VITE_DIAG_ALMACEN=1 VITE_DIAG_AVISOS=1 npm run ios:build` |
| **«La 24 limpia»** | la misma | `npm run ios:build` |
| **La web de la 24** | la misma | `npm run dev` y abrir `http://localhost:5173` en Chrome o Safari de la Mac |

**Pasar de una a otra:** cerrar Xcode, compilar en la carpeta y abrir su Xcode con `npm run ios:abrir`. **Instalar encima no borra nada.** Tras borrar la app, la primera apertura va con internet.

**Antes de empezar:** la configuración de Apple y Firebase del Anexo C, hecha. Las cuentas de prueba del Anexo B, a mano. **Para cada cuenta que vayas a borrar, apunta su UID** antes: Firebase → Authentication → Users → búscala por correo → columna «Identificador de usuario».

**Bloque E · Llevarme lo que escribí** (con «La 24 con diagnóstico»)
- **E1 · Con cuenta, sin PIN.** Con una cuenta que tenga al menos una mañana, una noche y una entrada del journal: Tu perfil → «Tus datos» → «Llevarme lo que escribí» → «Preparar mi archivo». **Debe verse:** «Preparando tu archivo» un instante y la hoja de compartir del iPhone con `strivo-….zip`. Elegir **«Guardar en Archivos»** → En mi iPhone → Guardar. Abrir la app **Archivos**, tocar el zip (se descomprime en una carpeta), entrar y tocar `entradas.md`. **Debe verse:** tus días en orden, cada respuesta con su pregunta delante, tal como la escribiste. (Si Archivos no muestra el `.md`, mándalo por AirDrop a la Mac y ábrelo allí con doble clic.)
- **E2 · Cancelar.** Repetir E1 y cerrar la hoja sin elegir nada. **Debe verse:** nada, ningún mensaje. Volver a tocar «Preparar mi archivo»: la hoja sale otra vez.
- **E3 · Con PIN y Face ID.** Poner PIN en el Journal (y Face ID). Repetir E1. **Debe verse:** antes de la hoja, Face ID (o el PIN). Cancelar → no pasa nada. Con la cara o el PIN → la hoja, y el journal dentro del archivo.
- **E4 · Sin red.** Modo avión y repetir E1 hasta que salga la hoja (cancélala). **Debe funcionar igual.** Quitar el modo avión.
- **E5 · Sin entradas.** Con una cuenta recién creada, sin escribir nada: «Preparar mi archivo». **Debe verse:** «Todavía no hay entradas. El archivo tendrá solo tu perfil.» y la hoja.
- **E6 · Muchos días.** Con una cuenta de prueba nueva, en el panel del diagnóstico: «Sembrar días de prueba». Esperar a que la línea del almacén diga «por subir: 0». «Preparar mi archivo»: **la hoja debe salir en menos de 5 segundos** (cuéntalos). Esta cuenta se borra después en B8.
- **E7 · La web.** En la web de la 24, entrar con una cuenta con días: Tu perfil → «Tus datos» → «Llevarme lo que escribí» → «Preparar mi archivo». **Debe verse:** se descarga el zip. En Finder, doble clic al zip y abrir `entradas.md` (barra espaciadora para verlo).

**Bloque B · Borrar mi cuenta** (con «La 24 con diagnóstico», salvo B11)
- **B1 · Quedarse en cada paso.** Con una cuenta de prueba: «Borrar mi cuenta». **Debe verse** la primera pantalla con lo que se borra, las frases de suscripción y compras, la de otros dispositivos, «Antes, llevarme lo que escribí» y «Continuar con el borrado». Tocar «Quedarme». Volver a entrar, «Continuar» → verificación → «Quedarme». Volver, llegar a «Última confirmación», escribir `BORAR` (mal) y tocar «Borrar mi cuenta». **Debe verse:** el mensaje para escribir BORRAR, y nada más. «Quedarme». **Nada cambió**: tus días siguen.
- **B2 · «Ver mi suscripción».** En la primera pantalla, tocarlo. **Debe abrirse** la página de suscripciones de Apple. Volver a Strivo: sigues donde estabas.
- **B3 · Sin red.** Modo avión, «Borrar mi cuenta» → «Continuar». **Debe verse:** «Para borrar tu cuenta hace falta conexión. Lo que escribiste sigue aquí.» Nada se borra. Quitar el modo avión.
- **B4 · Contraseña equivocada.** Con una cuenta de correo: llegar a la verificación y escribir una contraseña equivocada tres veces. **Debe verse:** el mensaje de siempre cada vez, sin bloqueo. «Quedarme».
- **B5 · Correo, de principio a fin.** Con la cuenta de correo de prueba (Anexo B), con un par de días escritos, PIN y Face ID en el Journal y los recordatorios encendidos. Apunta su UID. «Borrar mi cuenta» → «Continuar con el borrado» → contraseña → «Última confirmación» → escribir `borrar` → «Borrar mi cuenta». **Debe verse:** «Borrando» un instante y la despedida, con un solo botón, «Cerrar». Tocarlo: **la primera pantalla del onboarding, sin el video.** Después:
  - En el panel del almacén (Tu perfil, tras saltar el onboarding): el número de registros que diga el reporte previo para una app recién instalada, y «por subir: 0». En el de avisos: «Avisos programados: 0».
  - En Firebase → Authentication → Users: **ese correo ya no está.** En Firestore → Data → `users`: **ese UID ya no está** (ni en cursiva).
  - En la app: Tu perfil → Tu cuenta → «Entrar a mi cuenta» con ese correo y esa contraseña. **Debe verse:** «Ese correo y esa contraseña no coinciden…».
- **B6 · Google, de principio a fin.** Con la cuenta de Google de prueba (Anexo B), con algún día escrito: «Borrar mi cuenta» → «Continuar» → **«Continuar con Google»** → elegir la cuenta → BORRAR → despedida. En Firebase: el usuario y su UID ya no están. Volver a entrar con Google: **entras a una cuenta nueva y vacía** (tu cuenta de Google sigue intacta).
- **B7 · Apple, de principio a fin.** Antes: en el iPhone, **Ajustes → [tu nombre] → Iniciar sesión y seguridad → Iniciar sesión con Apple**: apunta si Strivo está en la lista (si no está, entra primero a Strivo con Apple y escribe algo). En Strivo: «Borrar mi cuenta» → «Continuar» → **«Continuar con Apple»** → Face ID → BORRAR → despedida. Después:
  - En Ajustes → Iniciar sesión con Apple: **Strivo ya no aparece** (puede tardar unos minutos; si sigue, cierra y abre Ajustes).
  - En Strivo, «Continuar con Apple» otra vez: **la hoja de Apple vuelve a preguntar si compartes u ocultas tu correo**, como la primera vez. Entras a una cuenta nueva y vacía.
  - En Firebase: el usuario viejo ya no está y hay uno nuevo.
- **B8 · Muchos documentos.** Con la cuenta de E6 (más de 500 documentos, «por subir: 0»): borrarla de principio a fin. En el panel del borrado, **los documentos encontrados y los borrados coinciden**. En Firestore, **su UID ya no está**.
- **B9 · Un fallo antes de la nube.** Con una cuenta de prueba: en el panel, activar «Fallar antes de la nube» y borrar. **Debe verse:** «No pudimos borrar tu cuenta. No se borró nada. Inténtalo de nuevo con conexión.» Tus días siguen; en Firebase el usuario sigue.
- **B10 · Interrumpido, y conservar o terminar.** Con una cuenta de prueba con días: activar «Detenerse después de la nube» y borrar. Cuando el panel diga que se detuvo, **cierra la app del todo** (deslízala hacia arriba en el selector de apps) y ábrela. **Debe verse:** «Tu cuenta quedó a medio borrar», con «Terminar de borrar» y «Conservar mi cuenta». Tocar **«Conservar mi cuenta»**. **Debe verse:** tus días siguen, y en unos segundos el panel del almacén dice «por subir: 0»; en Firestore, los documentos de ese UID volvieron. Repetir hasta la pantalla «a medio borrar» y tocar **«Terminar de borrar»** → verificación → BORRAR → despedida. En Firebase: el usuario y su UID ya no están.
- **B11 · La build limpia.** Con «La 24 limpia»: en «Tus datos» no hay panel. Repetir E1 y B1 por encima.
- **B12 · Cerrar sesión sigue igual.** Con `atreloz.prueba.1@gmail.com`: cerrar sesión y volver a entrar. **Debe verse:** tus días vuelven. Cerrar sesión no borra nada de la nube.
- **B13 · La web.** En la web de la 24: B1 (sin las frases de suscripción y compras), y B5 con otra cuenta de correo de prueba. Si tienes una cuenta de Google de prueba libre, también B6 (la verificación es una ventana emergente).

**Al terminar:** vuelve a entrar en el iPhone con la cuenta que usas de diario.

---

## 6. Copy

**Ningún texto existente cambia.** Los nuevos, en `copy.cuenta.exportar`, `copy.cuenta.borrar` y el título del bloque (o donde propongas, sin repetir textos que ya existen: «Cancelar», «Continuar con Apple», «Continuar con Google» y los errores de contraseña se reutilizan). Todos pasan `lint:copy`. La redacción final la revisa la fundadora con el reporte previo.

| Clave | Texto |
|---|---|
| `tusDatos.titulo` | Tus datos |
| `exportar.titulo` | Llevarme lo que escribí |
| `exportar.texto` | Un archivo con todas tus entradas, tal como las escribiste. Es tuyo. |
| `exportar.boton` | Preparar mi archivo |
| `exportar.preparando` | Preparando tu archivo |
| `exportar.sinEntradas` | Todavía no hay entradas. El archivo tendrá solo tu perfil. |
| `exportar.descargado` (solo web) | Listo. Tu archivo se descargó. |
| `exportar.error` | No pudimos preparar tu archivo. Lo que escribiste sigue aquí. Inténtalo de nuevo. |
| `borrar.titulo` | Borrar mi cuenta |
| `borrar.queSeBorra` | Se borran tu cuenta, tus entradas y tus preferencias, aquí y en la nube. No hay forma de recuperarlas después. |
| `borrar.otroDispositivo` | Si usas Strivo con esta cuenta en otro teléfono o en la web, lo que esté guardado ahí se queda ahí. |
| `borrar.suscripcion` (solo iPhone) | Borrar tu cuenta no cancela tu suscripción. Si quieres cancelarla, se hace en los ajustes de tu teléfono. |
| `borrar.suscripcionEnlace` (solo iPhone) | Ver mi suscripción |
| `borrar.compras` (solo iPhone) | Lo que pagaste queda ligado a tu Apple ID, no a tu cuenta de Strivo. Si más adelante creas otra cuenta, lo recuperas con “Restaurar compras”. |
| `borrar.exportarAntes` | Antes, llevarme lo que escribí |
| `borrar.continuar` | Continuar con el borrado |
| `borrar.quedarme` | Quedarme |
| `borrar.verificarTitulo` | Confirma que eres tú |
| `borrar.porQuePedimosContrasena` | Te pedimos tu contraseña para asegurarnos de que eres tú. |
| `borrar.porQuePedimosProveedor` | Vuelve a entrar con {proveedor} para asegurarnos de que eres tú. |
| `borrar.confirmarTitulo` | Última confirmación |
| `borrar.confirmarTexto` | Escribe BORRAR para confirmar. |
| `borrar.confirmarPlaceholder` | BORRAR |
| `borrar.confirmarNoCoincide` | Para confirmar, escribe la palabra BORRAR. |
| `borrar.boton` | Borrar mi cuenta |
| `borrar.borrando` | Borrando |
| `borrar.necesitaConexion` | Para borrar tu cuenta hace falta conexión. Lo que escribiste sigue aquí. |
| `borrar.errorAntes` | No pudimos borrar tu cuenta. No se borró nada. Inténtalo de nuevo con conexión. |
| `borrar.errorDurante` | No pudimos terminar de borrar tu cuenta. Lo de este teléfono sigue aquí. Inténtalo de nuevo con conexión. |
| `borrar.aMediasTitulo` | Tu cuenta quedó a medio borrar |
| `borrar.aMediasTexto` | La última vez no terminamos. Lo de este teléfono sigue aquí. Puedes terminar ahora o conservar tu cuenta. |
| `borrar.terminar` | Terminar de borrar |
| `borrar.conservar` | Conservar mi cuenta |
| `borrar.conservada` | Tu cuenta sigue aquí. Lo de este teléfono vuelve a la nube en cuanto haya conexión. |
| `borrar.despedida` | Listo. Tu cuenta y tus entradas ya no existen. Gracias por haber estado aquí. |
| `borrar.cerrar` | Cerrar |

Nota de tono (SPEC_24): `despedida` es el único texto de todo el proyecto que puede sonar a cierre emocional. **No se añade nada más.** Sin «esperamos verte pronto».

**Diagnóstico** (`diagnostico.js`, solo con `VITE_DIAG_BORRADO=1`; propuesta):

| Clave | Texto |
|---|---|
| `borrado.fase` | Borrado: {fase} (sin empezar · revocando · borrando la nube · borrando la cuenta · limpiando el teléfono · terminado · detenido) |
| `borrado.marca` | Marca de borrado: {sí · no} |
| `borrado.nube` | Nube: {encontrados} encontrados · {borrados} borrados · lotes {n} |
| `borrado.apple` | Apple: {revocado · falló · no aplica} |
| `borrado.fallarAntes` | Fallar antes de la nube |
| `borrado.detenerDespues` | Detenerse después de la nube |
| `borrado.sembrar` | Sembrar días de prueba |
| `borrado.sembrados` | Sembrados: {n} documentos |
| `borrado.plegar` / `borrado.desplegar` | Ocultar diagnóstico / Diagnóstico del borrado |

---

## 7. Reglas de arquitectura que roza

- **Nada a medias:** lo local se borra al final y solo con la nube vacía y la cuenta borrada; la marca manda hasta que todo termine o se repare.
- **Una lectora de Firestore:** `restaurar.js` (DP-24.10). **Una regla, un sitio:** qué hay en la nube, la lista de `restaurar.js`; qué pinta un día, lo que ya lo pinta; la plataforma, `plataforma.js`.
- **Nada bloquea** (sin `disabled`) y **ningún error muestra un código** (RN-EST-04). **Salir de cualquier paso no pide confirmación** (RN-EST-08): «Quedarme» siempre.
- **Dirección de dependencias:** `lib/` no importa de `diario/`, `breathing/`, `perfil/`, `onboarding/` ni de componentes; `components/shared/` no importa de secciones (RN-TEC-04 a 08). **REPORTA** cómo lo cumple la exportación.
- **Nada sale del teléfono** salvo lo que la persona comparte con su archivo: ni el código de Apple, ni la contraseña, ni el contenido van a otro sitio que Firebase y Apple.
- **Nada secreto en el repo:** ni el Team, ni `GoogleService-Info.plist`, ni `.env.local`, ni la clave `.p8` de Apple. Commits por ruta.

---

## 8. Entrega

1. **Trabaja en un worktree aparte:** `~/Developer/strivo-24`, rama local `revision-24` creada desde `strivo`. **`~/Developer/strivo` se queda en `strivo` y no se toca.**
2. Para que el worktree compile la app de iPhone: copia desde `~/Developer/strivo` los dos archivos que no están en git (`.env.local` y `ios/App/App/GoogleService-Info.plist`), corre `npm install` y **avisa a la fundadora de que tiene que elegir su Team en el Xcode de esa carpeta una vez** (Anexo A). Ninguno de los tres se comitea. Copia también esta instrucción a `docs/specs/` del worktree.
3. Commits pequeños y por tema, **en este orden**: 24A (dependencias y entrega / construir el archivo / la pantalla / pruebas) → 24B (enumeración y bloqueo de la subida / reautenticación y Apple / máquina y limpieza / retoma / pantallas / pruebas) → diagnóstico → docs. Cada uno con la línea `Co-Authored-By` del repo, añadiendo archivos por ruta.
4. **Sin push** hasta que la fundadora lo apruebe; entonces `git push origin revision-24`. Nunca a `strivo` directamente.
5. **Fusión de 24A** cuando pase el bloque E: `revision-24` → `strivo` con un commit de unión (si 24B ya está a medias en la rama, propón cómo fusionar solo 24A; si no conviene, se fusiona todo junto al final). **Fusión de 24B** cuando pase el bloque B. Antes de cada fusión, trae lo nuevo de `strivo`, corre las siete validaciones sobre el resultado y repórtalo.
6. Reporte final: qué se hizo, cada **REPORTA** con su respuesta, la salida de las siete validaciones, archivos y casos antes y después, el tamaño de la app y de los chunks, y la lista E y B con los textos exactos que la fundadora verá.

---

## 9. Reporte previo y decisiones

Reporte previo de Claude Code (15 nov 2026, `docs/specs/REPORTE_PREVIO_SPEC_24.md`) **aprobado por la fundadora con las decisiones de abajo**. Todo lo demás del reporte se aprueba tal como viene: los archivos nuevos y tocados (§10 del reporte), el esquema de `entradas.json` versión 1 y el ejemplo de `entradas.md`, la tabla de qué entra en el archivo, el inventario del teléfono, la lista de disparadores bloqueados con la marca, `rutasEnLaNube` en `restaurar.js`, la máquina de nueve estados con sus cuatro fases, los textos de §9.1 del reporte, el diagnóstico, las dos zonas nuevas de eslint y la corrección del comentario de `firestore.rules`. **El reporte se comitea en `docs/specs/` junto con esta instrucción.** DP-24.4 = **A** (decidida el 15 nov).

**Lo que el reporte encontró distinto de esta instrucción (y manda el reporte):**

- **Apple, camino (c):** el SDK de iOS 12.19.3 manda `tokenType` como la cadena **`"3"`** (no «CODE») y la cabecera **`X-Ios-Bundle-Identifier`**; la preflight CORS desde `capacitor://localhost` contesta 200 y acepta esa cabecera. Se llama con la clave web. **El camino (a) con `skipNativeAuth: true` se queda colgado para siempre** (sin usuario nativo, la promesa no contesta).
- **Si falla la revocación de Apple → `errorAntes` («No se borró nada»)** y se quita la marca. Resuelve la contradicción entre DP-24.11 y DP-24.12 en el sentido del criterio 6.
- **Caso nuevo (D12):** marca con fase anterior a `cuenta` y **sin sesión** → la pantalla «a medio borrar», que pide entrar antes de terminar o conservar. Limpiar ahí perdería lo único que queda.
- **Precondición nueva (D6):** antes de borrar, este teléfono tiene que haber terminado de bajar la cuenta. Es lo que permite que «Conservar mi cuenta» reconstruya la nube entera.
- **Ninguna ruta subida queda fuera de la lista** (historial de todas las ramas: antes de SPEC_17A nada subía).
- **Clay no pasa AAA** (5,31:1 con la tinta): el botón final va como el primario de siempre.
- **`navigator.share` no es fiable en el WebView** (pierde el gesto con el zip asíncrono) y la descarga web no funciona dentro de la app: `@capacitor/share`.
- **La lógica de los campos de versiones anteriores vive hoy dentro del JSX de `VistaDiaCompleto`**: sale a funciones puras de `manana.js` y `noche.js`, y el Historial pasa a usarlas sin verse distinto.
- **La pausa de la mañana y la reflexión de la noche sin pregunta reconstruible** salen en el archivo con el rótulo del Historial («Tu pausa», «Tu reflexión») en vez de perderse.
- **`strivo.borrado.*` entra en `FAMILIAS`** de `clavesDelTelefono.js` (si no, `reconciliarClaves` borraría su copia en SQLite).
- **La reautenticación vale 4 minutos**: pasado ese tiempo, «Borrar mi cuenta» vuelve a «Confirma que eres tú».
- **Lo que dirá el diagnóstico tras B5:** `SQLite · registros: 4 · por subir: 0`, `IndexedDB · registros: 0 · por subir: 0`, `Avisos programados: 0`.

| Punto | Decisión |
|---|---|
| **D1 · El archivo temporal en el iPhone** | **Dos métodos nuevos en `strivo-almacen`** (`escribirTemporal`, `borrarTemporal`), con su XCTest, solo en `Library/Caches/Strivo/exportar/`. Se actualiza en `CLAUDE.md` la regla de los métodos del plugin. **Además: al empezar cada exportación se vacía esa carpeta**, por si un archivo quedó ahí porque la app se cerró con la hoja abierta. Sin `@capacitor/filesystem`. |
| **D2 · Compartir y el zip** | **`@capacitor/share` 8.0.3** y **`fflate` 0.8.3**, versión exacta, cada una importada en un solo archivo y bajo demanda. |
| **D3 · Revocar Apple** | **Camino (c).** Si B7 falla (Strivo sigue en «Iniciar sesión con Apple» o el panel dice «Apple: falló»), se trae el camino (a) en una adenda. |
| **D4** | Aprobado como §6.4 del reporte. |
| **D5 · Limpiar el teléfono** | **Vaciar el almacén entero** (todos los uid), como §7 del reporte. |
| **D6 · Borrar sin haber bajado la cuenta** | **Aprobado.** Si la bajada no termina, se muestra `errorAntes` (no se escribió la marca). **REPORTA** al final: (1) que una cuenta creada en este mismo teléfono, que nunca necesitó bajar nada, no queda bloqueada; (2) qué pasa si la bajada falla siempre en un teléfono (que nadie se quede sin poder borrar para siempre). |
| **D7 · Exportar sin haber bajado la cuenta** | **Aprobado**, con este texto para `exportar.incompleto`: **«Puede que el archivo no tenga todo: algo de lo que guardaste en la nube todavía no llega a este teléfono.»** |
| **D8 · Respiración en el `.md`** | **Solo las combinaciones guardadas.** Sesiones y recuentos, solo en el `.json`. |
| **D9 · El botón final** | **El primario de siempre.** |
| **D10 · La cola con pendientes** | **No se avisa.** |
| **D11 · Otro dispositivo** | **Se documenta** en `CLAUDE.md` y en la nota para el aviso de privacidad (A9). |
| **D12 · «A medio borrar» sin sesión** | **Aprobado**, con `borrar.entrarAntes` = «Para seguir, entra de nuevo a tu cuenta.» |
| **`errorDurante`** | **Con «Terminar de borrar» y «Conservar mi cuenta»**, como propone el reporte: nada se queda sin decidir. |
| **`conservada`** | **Con «Cerrar»**, como propone el reporte. |
| **Título del bloque** | «Tus datos». |
| **El escapado del `.md`** | Aprobado como §4.1 del reporte. El texto exacto, sin escapar, está siempre en el `.json`. |
| **Cuenta de prueba en el simulador** | **Sí**, con el correo **`atreloz.prueba.1+claudecode@gmail.com`** y una contraseña que no se guarda en el repo ni en ningún archivo. **Se borra al terminar con el propio flujo de «Borrar mi cuenta»** (sirve de prueba), y se reporta su UID para comprobarlo en Firebase. Google y Apple, solo en el iPhone de la fundadora. |
| **Una prueba manual más** | **E8 · El Historial no cambió:** con «La 24 con diagnóstico», abrir en el Historial un día viejo (de agosto o septiembre, si la cuenta lo tiene) y uno reciente. **Debe verse:** cada día completo, con sus títulos, sin huecos ni textos raros. |
| **Anexo C** | Hecho el 15 nov 2026: Key «Strivo Sign in with Apple» (Key ID `N3JBJ8MAVW`), Services ID `com.hellostrivo.strivo.web` con su dominio y Return URL, y los campos de Apple en Firebase. **«Habilitar eliminación» lo confirma la fundadora antes de B5.** |
| **Trabajo** | En `~/Developer/strivo-24`, rama `revision-24`, según §8. Orden: 24A → 24B → diagnóstico → docs. Al terminar, la build con diagnóstico para E y B. |

---

## 10. Resultados (17 nov 2026)

### 10.1 Implementación

En `~/Developer/strivo-24`, rama `revision-24`, sobre `d90427a`, en el orden de §8: 24A (cuatro commits), 24B (seis), diagnóstico y documentación. **Todo lo del §9 se aplicó tal como se aprobó**: el bloque «Tus datos», el `.zip` con `entradas.md` y `entradas.json` (`strivo.exportacion` v1), la puerta del Journal reutilizada (`PuertaDelJournal` = `usePin` + `BloqueoPin` en desbloqueo con «Cerrar»), `@capacitor/share` 8.0.3 y `fflate` 0.8.3 con un solo importador cada una, los dos métodos nuevos de `strivo-almacen` (D1), `rutasEnLaNube` en la única lectora, la marca `strivo.borrado.<uid>` como cerrojo de la subida y de la bajada, la revocación de Apple por el camino (c), la máquina de nueve estados con sus cuatro fases, la retoma con D12, la limpieza del teléfono (D5) y el diagnóstico.

**Desvíos menores, anotados en el reporte final:**

- La capa del borrado y la despedida viven en `components/perfil/` y no en una carpeta nueva: una prueba exige decidir cada carpeta de `components/`, y el borrado es gestión de cuenta.
- El plugin `strivo-almacen` lo importan dos archivos (la base y la entrega del archivo); la prueba que exigía uno lista ahora los dos.
- El chunk principal de la web crece 12,6 kB (de 758,18 a 770,82; gzip de 215,11 a 218,46), más que los ~2 kB estimados en el reporte previo: el bloque, la puerta, el copy, la retoma en el arranque y la limpieza. La exportación (12 kB), `fflate` (9 kB), el borrado (6,7 kB) y sus pantallas (5,8 kB) van en chunks bajo demanda.
- «Cómo imaginabas el día», del Historial, respeta ahora los saltos de línea al salir a una función pura.
- Las pruebas que leían el código fuente de `pin.js`, `salidaCuenta.js`, `VistaDiaCompleto.jsx` y `Perfil.jsx` se apuntaron a donde vive ahora la misma lógica; ninguna comprobación de comportamiento cambió.

**Validaciones**: los seis comandos de `CLAUDE.md` §12 y `validar:frases` en verde. Proyecto `indexeddb`: de 125 archivos y 2.957 casos a 132 y 3.109 (+152); proyecto `sqlite`: de 2.894 a 3.046 casos; XCTest del plugin: de 17 a 24.

**Recorrido de la web con Playwright** (16 nov 2026, contra `strivo-fe04f`, cuenta `atreloz.prueba.1+claudecode2@gmail.com`, UID `iJVEuaJ3m7S1hAgGq9kWFeVn1023`): crear la cuenta, escribir el reconocimiento de la noche, exportar (1 día, con la pregunta delante y el Markdown escapado), sembrar 600 documentos, exportar (301 días en 99 ms), borrar con contraseña equivocada y «BORAR» antes de lo correcto: despedida a los 5,1 s, 605 encontrados y 605 borrados en 2 lotes, el navegador como recién instalado y la cuenta sin poder volver a entrar. **El primer intento** (con `+claudecode`) se cortó antes de borrar por un error del script y su contraseña aleatoria no se guardó; la fundadora borró esa cuenta a mano.

### 10.2 Pruebas manuales

**E1–E8 y B1–B13 pasan** (15–17 nov 2026, la fundadora en su iPhone 17 con «La 24 con diagnóstico» y «La 24 limpia», y en la web de la 24, contra `strivo-fe04f`).

- **B7, Apple, confirmado**: tras borrar, Strivo desapareció de Ajustes → Iniciar sesión con Apple, la hoja volvió a pedir compartir u ocultar el correo y el panel dijo «Apple: revocado». **El camino (c) basta: no hace falta la adenda del camino (a).**

**Observación, que no bloquea:**

- **O-24.1 · En «Iniciar sesión con Apple» la app sale como «XC com hellostrivo strivo», con ícono genérico.** Es el nombre del App ID que creó Xcode. Se corrige al crear la app en App Store Connect con el nombre Strivo, o cambiando la descripción del App ID en developer.apple.com. No es código.

## Anexo A · Para la fundadora: la primera vez en el Xcode del worktree

1. En la terminal de VS Code, dentro de `~/Developer/strivo-24`: `VITE_DIAG_BORRADO=1 VITE_DIAG_ALMACEN=1 VITE_DIAG_AVISOS=1 npm run ios:build` y luego `npm run ios:abrir`. Se abre **otro** Xcode, el de esa carpeta (cierra antes cualquier otro Xcode; en el título de la ventana se ve de qué carpeta es).
2. En la columna izquierda, clic en **App** (el ícono azul de arriba) → pestaña **Signing & Capabilities** → en **Team** elige **ALEJANDRA TREVIÑO LOZANO**. Deja marcado **Automatically manage signing**. Si sale «Update to recommended settings», **no lo aceptes**.
3. Arriba, junto a «App», elige tu iPhone conectado por cable.
4. Para instalar: botón **▶**. Para detener: **■**.

## Anexo B · Cuentas de prueba para borrar, sin perder las de siempre

**Borrar una cuenta de Strivo no borra tu cuenta de Google ni tu Apple ID**: solo la cuenta dentro de Strivo. Si después vuelves a entrar con ese Google o ese Apple ID, Strivo crea una cuenta nueva y vacía.

- **Correo:** usa alias de tu Gmail de pruebas. Gmail entrega en el mismo buzón todo lo que lleve `+algo` antes de la arroba, y Firebase lo cuenta como otro correo: `atreloz.prueba.1+b1@gmail.com`, `atreloz.prueba.1+b2@gmail.com`, `+b3`… Una por prueba que borre. Se crean en Strivo con «Crear una cuenta» (Tu perfil → Tu cuenta) y una contraseña que apuntes. **`atreloz.prueba.1@gmail.com` (sin `+`) no se borra nunca.**
- **Google:** **no uses `filantraconsulting@gmail.com`** si quieres conservar lo que tiene. Usa otra cuenta de Google tuya (por ejemplo `team@hellostrivo.com` o tu Gmail personal): la primera vez que entres con ella, Strivo le crea una cuenta, y esa es la que borras.
- **Apple:** tu Apple ID. Se puede borrar y volver a crear las veces que haga falta.
- **Para cambiar de cuenta en el iPhone:** Tu perfil → Tu cuenta → «Cerrar sesión» (lo de esa cuenta sigue en la nube y vuelve al entrar) → «Crear una cuenta» o «Entrar a mi cuenta».

## Anexo C · Lo que hace la fundadora fuera del código, antes de las pruebas (una sola vez)

**En developer.apple.com → Certificates, Identifiers & Profiles:**
1. **Keys → «+»**: nombre «Strivo Sign in with Apple» → marcar **Sign in with Apple** → **Configure** → Primary App ID: `com.hellostrivo.strivo` → Save → Continue → Register → **Download**. Se descarga un archivo `AuthKey_XXXXXXXXXX.p8` **que solo se puede bajar una vez**: guárdalo fuera de `~/Developer` (por ejemplo en tu gestor de contraseñas). Apunta el **Key ID** (los 10 caracteres).
2. **Identifiers → «+» → Services IDs** → Continue → Description «Strivo web», Identifier `com.hellostrivo.strivo.web` → Continue → Register. Ábrelo, marca **Sign in with Apple** → **Configure** → Primary App ID `com.hellostrivo.strivo`; Domains: `strivo-fe04f.firebaseapp.com`; Return URLs: `https://strivo-fe04f.firebaseapp.com/__/auth/handler` → Next → Done → Continue → Save.
3. Tu **Team ID** está arriba a la derecha, junto a tu nombre (es el de 10 caracteres de tu cuenta de desarrolladora).

**En la consola de Firebase (`strivo-fe04f`):**
4. **Authentication → Sign-in method → Apple** (el lápiz): en **Services ID**, `com.hellostrivo.strivo.web`; en **OAuth code flow configuration**: el Team ID, el Key ID y, en «Private key», todo el contenido del `.p8` (ábrelo con TextEdit y copia todo, también las líneas `BEGIN` y `END`) → Guardar.
5. **Authentication → Settings → Acciones del usuario** (User actions): que **«Habilitar eliminación»** (Enable delete) esté marcado. Si tu consola no tiene esa sección, no hay nada que hacer aquí.

**En Google Cloud:** nada, si DP-24.4 = A.

**El paso 8 del anexo A de SPEC_21.2** (registrar correos en «Sign in with Apple for Email Communication») **no hace falta para SPEC_24**: Firebase no le manda correos a quien entró con Apple.
