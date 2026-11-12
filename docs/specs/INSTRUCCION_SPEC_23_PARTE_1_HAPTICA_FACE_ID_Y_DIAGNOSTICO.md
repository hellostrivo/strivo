# INSTRUCCIÓN SPEC_23 · Parte 1 — Háptica (23B), Face ID para el Journal (23A) y el diagnóstico del audio (23C, primer paso)

**Para:** Claude Code
**Fecha:** 12 nov 2026 · **Versión:** 1.1 (reporte previo aprobado el 12 nov 2026: §9. **Donde §9 y el resto difieran, manda §9**)
**Rama de partida:** `strivo` en `59a7147`, la fusión de SPEC_22. Compruébalo en §0.
**Gobierna:** esta instrucción + `docs/specs/SPEC_23_NATIVO_BIOMETRIA_HAPTICA_AUDIO.md` + `docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md` + `docs/specs/INSTRUCCION_SPEC_22_RECORDATORIOS_IOS.md` + `docs/specs/INSTRUCCION_SPEC_17B_SQLITE.md` + `SPEC_00B` + `CLAUDE.md`. **Donde esta instrucción y otra difieran, manda esta.** En particular, **corrige varias partes de SPEC_23**, que se escribió en septiembre, antes de que existieran la app de iPhone, SPEC_21.2 y D-21.13 tal como se conoce hoy (ver §2.6).

**Cómo se reparte SPEC_23.** Tres fases, que se aprueban y se fusionan por separado:

| Fase | Qué es | Dónde se escribe |
|---|---|---|
| **23B** | Un toque suave en tres momentos | Esta instrucción, entera |
| **23A** | Abrir el Journal con Face ID, con el PIN siempre de respaldo | Esta instrucción, entera |
| **23C** | Audio de Respiración con la pantalla bloqueada y **D-21.13** (el sonido no vuelve al regresar a la app) | **Aquí solo el diagnóstico.** La construcción va en la **Parte 2**, que se escribe con los resultados del diagnóstico y la decisión de la fundadora sobre DP-23.3 |

**Orden de trabajo:** 23B → 23A → diagnóstico de 23C. Una sola build con el diagnóstico encendido sirve para las tres pruebas manuales en el iPhone. **23B y 23A se pueden fusionar a `strivo` en cuanto pasen sus pruebas**, sin esperar a 23C.

**Por qué ahora:** D-21.13 bloquea la publicación (una sesión que corre en silencio no se publica), y 23A y 23B son, con SPEC_17B y SPEC_22, la defensa frente a la Guideline 4.2.

**En paralelo existe otro trabajo**: D-21.11, en el worktree `~/Developer/strivo-2111`, rama local `revision-21-11` (sin push). **No se toca nada de esa carpeta ni de esa rama**, y esta tarea no toca los archivos de D-21.11 (§1.1 y §8).

---

## 0. Antes de escribir una sola línea

1. Lee `CLAUDE.md` del repo (no una copia): §8 (Journal y Respiración), «App iOS (SPEC_21.1)» con «Lo que no se toca nunca» y el párrafo de `UIBackgroundModes`, «Google y Apple en la app de iPhone (SPEC_21.2)», «Lo escrito en el iPhone, en SQLite (SPEC_17B)», «Los recordatorios llegan en el iPhone (SPEC_22)» y §14. Lee `SPEC_23` entera, sobre todo §6 «Hallazgo del 14 oct» y las DP-23.1, 23.2 y 23.3, y esta instrucción entera.
2. Comprueba que HEAD de `strivo` es `59a7147` o lo contiene (`git merge-base --is-ancestor 59a7147 HEAD`). Si no, **para**.
3. **Convivencia con D-21.11:** `git worktree list` y `git branch --list 'revision-*'`. Reporta lo que hay. **No abras, no compiles y no cambies nada dentro de `~/Developer/strivo-2111`**, y no hagas checkout de `revision-21-11` en ningún sitio. Leerla con `git log`, `git diff` o `git show` desde tu worktree sí se puede (comparten el mismo `.git`). Si existe todavía el worktree `~/Developer/strivo-22` o la rama local `revision-22` (SPEC_22, ya fusionada), **no los borres**: es tarea de la conversación de D-21.11. Solo repórtalo.
4. Monta tu worktree según §8 (pasos 1 y 2) **antes** de investigar: el reporte previo pide compilar en el simulador.
5. Inspecciona:
   - **Journal y PIN:** `src/diario/pin.js` y su prueba; `src/diario/usePin.js`; `src/components/diario/BloqueoPin.jsx` (los dos modos: `desbloqueo` y `ajustes`); `src/components/diario/CuentaParaPin.jsx`; `src/pages/diario/Journal.jsx` (el botón «Ajustes de acceso» y `JournalAbierto`); `src/lib/reautenticacion.js`; `src/lib/db/diario.js` (`getPinConfig`, `savePinConfig`, `clearPinConfig`, `PIN_SYNC`); `src/lib/db/schema.js` (`FIELDS.pinConfig`, `assertFields`); `src/lib/db/local.js` y `restaurar.js` (cómo reconocen `pinConfig` para no encolarlo ni bajarlo); `src/lib/salidaCuenta.js`; `copy.diario.journal.pin` en `src/copy/index.js`.
   - **Háptica:** `src/components/diario/DiarioManana.jsx` y `DiarioNoche.jsx` (`terminar`, `persistir`, `soloLectura`); `src/components/diario/ChipsCatalogo.jsx` (lo montan `manana/MomentoAnimo.jsx`, `manana/MomentoIntencionAccion.jsx` y `noche/MomentoEmocion.jsx`) y `ChipsEmociones.jsx` (lo monta el Journal); `src/breathing/hooks/useSesionRespiracion.js` (`alCambiarFase`); `src/lib/respiracion/maquinaSesion.js` y `relojSesion.js`; `src/components/shared/Respiracion.jsx` («Respira un momento» de Hoy y P1 del onboarding: `avanzar`).
   - **Audio:** `src/lib/audio/contextoAudio.js` (`reanudarContexto`, `despertarAlVolver`, `NO_SE_REANUDA`); `src/lib/audioRespiracion.js`; `src/breathing/audio/` entero (`motorAmbiente.js`, `mezclador.js`, `planificador.js`, `fuentes/`); `src/breathing/hooks/useSesionRespiracion.js` (`asegurarAudio`, el oyente de `visibilitychange`, `restablecerAudio`); `src/breathing/hooks/useWakeLock.js`; `src/breathing/PantallaSesion.jsx`.
   - **iPhone:** `src/lib/plataforma.js` (`esNativa`, `esIPhone`); `src/lib/avisosNativos.js` (el patrón de carga bajo demanda y `{ plugin }`); `src/lib/credencialNativa.js`; `capacitor.config.json`; `ios/App/App/Info.plist`; `ios/App/App/App.entitlements`; `ios/App/CapApp-SPM/Package.swift` y `Package.resolved`; `src/lib/__tests__/appIos.test.js`; `src/lib/__tests__/dobleDeCapacitor.js` (o donde viva el doble del Proxy); `src/copy/diagnostico.js`; `scripts/lint-copy.js`.
6. **Lee el código iOS de los plugins candidatos antes de proponer** (DP-23.5 y DP-23.7). Instálalos en una rama desechable que se borra después, o con `npm pack` en una carpeta aparte; **no en `revision-23` hasta la aprobación**.
7. Entrega un **reporte previo** con todos los puntos marcados **REPORTA**, la lista de archivos que vas a crear o tocar, y **los textos exactos que la fundadora verá en pantalla** en cada prueba manual del §5.2 (el panel «Ajustes de acceso» en cada estado, la pantalla del PIN, el diálogo de permiso de Face ID y las líneas del diagnóstico).
8. **Espera la aprobación de la fundadora.** No cambies código antes.

---

## 1. Decisiones

### 1.1 Ya tomadas, no se reabren

| Origen | Decisión |
|---|---|
| DP-21.3 / DP-21.8 / DP-17B.2 | **El identificador (`com.hellostrivo.strivo`), el esquema y host del WebView (`capacitor://localhost`, los de fábrica) y la base SQLite (`Library/Strivo/strivo.sqlite`) no se tocan.** Nada de `server`, `scheme`, `hostname` ni `allowNavigation` en `capacitor.config.json`. |
| RN-DB-04 / §7.7.1 | **El PIN nunca sale del dispositivo y nunca se guarda en claro.** Con 23A **el PIN tampoco va a la Keychain**: a la Keychain va solo una clave aleatoria (DP-23.8). `diario/pinConfig` sigue escribiéndose con `sync: false`. |
| §5.8.2 / CLAUDE.md §8 | **El PIN es una puerta, no un cifrado.** Face ID es otra forma de abrir la misma puerta; no cifra nada y el copy no promete inviolabilidad (la prueba que recorre `copy.diario.journal.pin` lo sigue comprobando). |
| SPEC_23 §2 | **Fuera:** cifrado del Journal con la clave biométrica, háptica en cualquier otro punto, patrones hápticos propios, sonidos nuevos, archivos de audio, Wake Lock, Android. |
| SPEC_23 DP-23.1 | **Sin interruptor propio de háptica.** Se respeta el ajuste de vibración del sistema, que iOS aplica solo. |
| SPEC_21.1 | **`UIBackgroundModes` se queda como está (`[audio]`) durante esta Parte 1.** Lo usa el diagnóstico. **Si la Parte 2 decide no tener audio en segundo plano, se retira antes de App Review**: declararlo sin usarlo es motivo de rechazo. |
| SPEC_21.1 (`cdb75ad`) | **El texto de permiso de Face ID ya existe** en `Info.plist`, en español, y `appIos.test.js` lo vigila. Su redacción se decide en DP-23.14. |
| RN-VOZ-01 / RN-VOZ-02 / CLAUDE.md §3 | **Todo texto vive en `src/copy/` y pasa `lint:copy`.** Sin léxico prohibido, **sin signos de exclamación**. «Face ID» y «Touch ID» son nombres de producto: no se traducen y **no se escriben a mano**, se interpolan con lo que diga el plugin. |
| Fundadora, 12 nov 2026 | **La web no cambia en esta Parte 1.** Ni háptica, ni interruptor de Face ID, ni una línea de los plugins en lo que descarga la web. (El arreglo de D-21.13 sí llegará a la PWA, en la Parte 2.) |
| SPEC_21.2 | **Ningún objeto de plugin de Capacitor sale suelto de una promesa** (el Proxy contesta a `then` y el `await` se cuelga para siempre, sin error). Se devuelve envuelto, `{ plugin }`, como `avisosNativos.js`. |
| SPEC_22, DP-22.13 | **`esIPhone()` de `plataforma.js` es la única pregunta por la plataforma** para todo lo de esta instrucción. En Android (SPEC_26) se porta como la web hasta que una SPEC de Android diga otra cosa. |
| SPEC_22 | **Plugins en versión exacta**, comparados por mantenimiento reciente, y **un solo archivo de `src/` importa cada uno, bajo demanda**, con una prueba que recorre `src/` para comprobarlo. |
| SPEC_17B / SPEC_22 | **Pruebas manuales solo con lo que se ve y se oye.** Sin consola de Safari, sin Inspector web y sin la consola de Xcode. Lo que haga falta medir se pinta en pantalla en un build de diagnóstico. **Esto sustituye el diagnóstico con el Inspector web que pide SPEC_23 §6.** |
| SPEC_17B | **Tras borrar la app, la primera apertura de una compilación de Xcode necesita internet** para verificar el certificado de desarrolladora. Ninguna prueba manual pide abrirla sin red. |
| D-21.11, 12 nov 2026 | **Esta tarea no toca** `ios/App/App/Base.lproj/LaunchScreen.storyboard`, nada de `ios/App/App/Assets.xcassets/`, `assets/splash*.png`, `scripts/componer-arranque.js` ni los scripts `ios:arranque` e `ios:recursos` de `package.json`. Tampoco el `describe` del storyboard de `appIos.test.js` ni el comentario de D-21.11 de ese archivo. |
| SPEC_21.1 | **El Team de firma vive en `project.pbxproj` como cambio local y no se comitea nunca.** Commits por ruta, nunca `git add -A`, `git add .` ni `git commit -a`. No aceptes «Update to recommended settings» de Xcode. Esta tarea no añade capacidades en «Signing & Capabilities» (ni Face ID ni la Keychain las necesitan). |
| Instrucciones del proyecto | **Formia** (rama `formia-paused`) no se toca, no se consulta y no se reintroduce nada de ella. |

### 1.2 Nuevas, para confirmar en el reporte previo

#### 23B · Háptica

| DP | Propuesta |
|---|---|
| **DP-23.4 · Los tres puntos, exactos** | **(1) Cerrar la mañana o la noche:** en `terminar()` de `DiarioManana.jsx` y `DiarioNoche.jsx`, en el toque que pone el cierre delante. Una vez por cierre (ya lo garantiza `cerrando`). Nunca en el autoguardado ni en un día de solo lectura. Si `persistir` falla, el toque ya ocurrió y está bien: el gesto de cerrar fue de la persona. **(2) Elegir una emoción:** en `ChipsCatalogo.jsx` (las dos preguntas de la mañana y la de la noche) y `ChipsEmociones.jsx` (el Journal), **solo cuando una emoción entra en la selección**. Quitar una no vibra; un toque que choca con el tope y no cambia nada no vibra; elegir «Algo más» / la propia sí, porque entra en la selección. **(3) Cambio de fase en Respiración:** en `alCambiarFase` de `useSesionRespiracion.js`, **solo con la sesión en `activo` o `cerrando`**, incluido el primer «inhalar» tras el acomodo. Nunca durante el acomodo, en pausa, ni en la vista previa de la pantalla de configuración. **REPORTA** si el reloj vuelve a emitir la fase al reanudar una pausa (no debería vibrar dos veces la misma fase). |
| **DP-23.5 · «Respira un momento»** | **También vibra en cada cambio de fase** (`avanzar` de `components/shared/Respiracion.jsx`), y por tanto también en P1 del onboarding, que usa el mismo componente. Motivo: es el mismo evento —un cambio de fase— y que la tarjeta de Hoy no vibre cuando la sección sí se sentiría como un fallo. **Alternativa:** solo la sección, como dice SPEC_23 al pie de la letra. Decide la fundadora. |
| **DP-23.6 · El plugin y el puente** | **`@capacitor/haptics` 8.0.2, versión exacta**, el oficial. **Un solo archivo de `src/` lo importa** (por ejemplo `src/lib/haptica.js`), bajo demanda, y **solo si `esIPhone()`**. Motivo, leído en el paquete: **en la web el plugin no es mudo, vibra con `navigator.vibrate`** (20 ms para `Light`), así que en Chrome de Android la PWA vibraría; por eso en la web no se carga nunca. La función que llaman los tres puntos (por ejemplo `toqueSuave()`) usa `ImpactStyle.Light`, **no se espera** (`await`), **nunca lanza** y no devuelve nada que haya que mirar. En iOS, `UIImpactFeedbackGenerator` ya respeta el ajuste de vibración del sistema: no se lee ningún ajuste desde JS. **REPORTA** si en iOS 26 el ajuste «Vibración → No reproducir nunca» de Sonidos y vibración apaga este tipo de toque (lo comprueba H4). |

#### 23A · Face ID para el Journal

| DP | Propuesta |
|---|---|
| **DP-23.7 · El plugin** | Comparados el 12 nov 2026 (versión, última publicación, peer de Capacitor): **`@capgo/capacitor-native-biometric` 8.9.3** (publicado el 11 nov 2026, `@capacitor/core >= 8`, `Package.swift` con iOS 15 y solo `capacitor-swift-pm`; `setData` con `accessControl: 1` guarda en la Keychain con **`.biometryCurrentSet`** y **`kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly`**, y `getSecureData` la lee pidiendo Face ID); **`@aparajita/capacitor-biometric-auth`** 10.0.0 (feb 2026, Capacitor 8, pero **solo autentica y no usa la Keychain**: no cumple DP-23.8); **`capacitor-native-biometric`** 4.2.2 (sin publicar desde 2023: descartado); **un plugin propio mínimo** en `plugins/`, como `strivo-almacen` en SPEC_17B. **Propuesta: `@capgo/capacitor-native-biometric` 8.9.3, versión exacta**, si al leer su Swift se confirma: que no usa `UserDefaults` ni red, que no necesita manifiesto de privacidad propio, qué devuelve `isAvailable` (tipo de biometría, permiso negado, sin caras registradas, sin código) y **con qué código distingue cancelar, fallar, item inexistente y clave invalidada**. Si algo de eso no se cumple, **propón el plugin propio** (solo cuatro métodos: disponibilidad, guardar, leer con Face ID, borrar) y no instales nada sin decisión. **REPORTA** la comparación con lo leído. |
| **DP-23.8 · Qué se guarda y dónde** | **En la Keychain:** una clave aleatoria de 32 bytes (del generador del sistema, en hex), bajo un nombre fijo (por ejemplo `strivo.journal.biometria`), con `.biometryCurrentSet` y `WhenPasscodeSetThisDeviceOnly`: **no viaja a la Llavero de iCloud, no entra en copias de seguridad, no pasa a otro teléfono y desaparece si se quita el código del iPhone.** **En `diario/pinConfig` (local, `sync: false`):** un campo opcional nuevo, `biometria`, con `{ verificador, activadaEn }`, donde `verificador` es el SHA-256 de la clave en hex. **Abrir con Face ID = leer la clave (iOS pide la cara) → calcular su SHA-256 → compararlo con `verificador` con `comparaIgual`** (tiempo constante, como el PIN). El PIN no se toca ni se copia. **Esto amplía el modelo** (`FIELDS.pinConfig` gana `biometria`, RN-DB-03), aunque es local: **REPORTA** qué pruebas del esquema y de `local.js`/`restaurar.js` cambian y confirma que el campo no se encola nunca, tampoco al mudar el árbol. |
| **DP-23.9 · Dónde vive el interruptor** | **En el panel «Ajustes de acceso» del Journal** (`BloqueoPin` en modo `ajustes`), debajo de «Tu journal pide un PIN para abrirse.». Es un interruptor (`role="switch"`, `aria-checked`, cambio anunciado con `aria-live`, objetivo táctil de 44 px, colores por tokens) con el texto de apoyo debajo. **Solo se pinta si:** es la app de iPhone (`esIPhone()`), hay PIN activo y el teléfono tiene Face ID o Touch ID disponible para Strivo. En la web, sin PIN o sin biometría, **no existe** (ni apagado ni con explicación). |
| **DP-23.10 · Activar** | Al encender el interruptor aparece un campo de PIN con `confirmarPin` y los botones «Activar» y «Cancelar». Con el PIN correcto: se genera la clave, se guarda en la Keychain y **se lee una vez** para que iOS pida Face ID en ese momento (la primera vez, antes, iOS enseña su diálogo de permiso con el texto de `Info.plist`). **Si Face ID responde:** se guarda `biometria` en `pinConfig` y el interruptor queda encendido. **Si se cancela, falla o se niega el permiso:** se borra la clave, el interruptor se queda apagado y **no se añade ningún texto** (el sistema ya lo dijo). PIN equivocado: `bloqueo.incorrecto`, como hoy. |
| **DP-23.11 · Abrir** | Con Face ID activo, **al montar la pantalla del PIN se pide Face ID solo**, una vez por montaje (cada vez que se entra al Journal). Éxito → el Journal se abre. Cancelar o fallar → **la pantalla del PIN de siempre, sin mensaje**. Debajo de «Abrir», **un botón discreto «Abrir con Face ID»** para volver a intentarlo, porque sin él un toque accidental en «Cancelar» obliga al PIN hasta salir del Journal. «Olvidé mi PIN» no cambia. **Sin cambios en cuándo se vuelve a cerrar el Journal**: igual que hoy, se cierra al salir de su ruta, no al mandar la app al fondo. **REPORTA** que el diálogo no sale con la app en segundo plano ni dos veces seguidas (React en modo estricto monta dos veces en desarrollo). |
| **DP-23.12 · Lo que apaga Face ID** | **Siempre que cambie o desaparezca el PIN**: «Dejar de pedirlo» (`desactivarPin`), el PIN nuevo tras «Olvidé mi PIN» (`reestablecerPin`) y cualquier `crearPin`. En los tres se borra la clave de la Keychain y el campo `biometria` desaparece con el `pinConfig` reescrito. **Ojo con `verificarPin`:** cuando rederiva un PIN con menos iteraciones reescribe el `pinConfig` entero, y **ahí `biometria` tiene que conservarse** (no es un cambio de PIN). **Cerrar sesión** (`salirDeCuenta`, cuando de verdad borra lo local) también borra la clave. **REPORTA** dónde va cada llamada y anota en SPEC_24 que borrar la cuenta hará lo mismo. |
| **DP-23.13 · Cuando Face ID deja de abrir** | Si al abrir la clave ya no se puede leer porque **iOS la invalidó** (se registró una cara o un dedo nuevo, se quitó el código, se restauró la copia en otro teléfono) **o la biometría dejó de estar disponible para Strivo** (se le quitó el permiso en Ajustes): se borra la clave, `biometria` pasa a `{ cambiada: true }`, se muestra la pantalla del PIN **con `biometria.cambiada` como nota**, y el panel enseña el interruptor apagado con esa misma frase debajo **hasta que se vuelva a activar o se quite el PIN**. Cancelar el diálogo **no** es esto. **REPORTA** con qué códigos lo distinguen el plugin y iOS; si «cancelado» e «invalidada» no se pueden separar con certeza, ante la duda se trata como cancelado (no se apaga nada). |
| **DP-23.14 · El texto de permiso de Face ID** | Hoy: «Para abrir tu Journal sin escribir el PIN.». **Propuesta: «Para abrir tu journal sin escribir tu PIN.»**, con «journal» en minúscula como en todo el copy del Journal. iOS lo enseña una sola vez, en el diálogo «¿Permitir que “Strivo” use Face ID?». Decide la fundadora; la prueba de `Info.plist` se actualiza con el texto elegido. Para Touch ID no hay diálogo de permiso; el texto que iOS enseña al pedir el dedo es `biometria.motivo` (§6). |
| **DP-23.15 · Al reinstalar** | **Lo guardado en la Keychain sobrevive a borrar la app**; `pinConfig` no (vive en la base de la app). Como el PIN es local (RN-DB-04), **tras reinstalar el Journal llega sin PIN y sin Face ID, igual que hoy**, también al entrar a la cuenta. La clave vieja queda **huérfana**: no se reutiliza nunca y **se borra la primera vez que la app la encuentra sin dueño** (por ejemplo, al resolver el estado del PIN, si `pinConfig` no tiene `verificador` y la Keychain dice que hay clave; borrar no pide Face ID). Al activar, la clave se sobrescribe siempre. **REPORTA** dónde va esa limpieza y que no hace aparecer ningún diálogo. |

#### 23C · El diagnóstico (primer paso)

| DP | Propuesta |
|---|---|
| **DP-23.16 · Build de diagnóstico del audio** | Con `VITE_DIAG_AUDIO=1 npm run ios:build`, un panel pequeño y plegable **en la pantalla de la sesión de Respiración y en «Respira un momento»**, con las líneas de §6 (estado del audio con la hora de cada cambio, qué pasó al irse y al volver, si `resume()` resolvió, rechazó o no contestó en 1 s, cuánto avanzó el reloj del audio mientras la app estaba fuera, **si el JavaScript siguió corriendo fuera** —tics de un temporizador de 1 s y fotogramas—, si el motor sigue vivo, y el estado de la sesión). **Se actualiza solo.** Textos en `src/copy/diagnostico.js` bajo su propia clave, cargados solo con la bandera, con la prueba que construye sin ella y no los encuentra en `dist/`, y la que comprueba que no arrastra los de `VITE_DIAG_ALMACEN` ni `VITE_DIAG_AVISOS`. **Sin la bandera, la app se porta exactamente igual que hoy.** El diagnóstico **no arregla nada**: mide. Se queda en el código detrás de su bandera, como el de 17B y el de 22, porque servirá para comprobar el arreglo de la Parte 2. |
| **DP-23.17 · Dos experimentos dentro del diagnóstico** | Para no compilar variantes, el panel trae dos controles que **solo existen con la bandera**: **(a) «Tipo de sesión de audio: automático / reproducción»**, que pone `navigator.audioSession.type` en `'auto'` o `'playback'` (API de WebKit desde iOS 17; si no existe, la línea dice «no existe» y no hay control). Motivo: un ingeniero de WebKit indica que con el tipo por defecto el audio se comporta como `ambient` —se calla con el modo silencio y se interrumpe al irse la página— y que con `'playback'` no se suspende. **(b) Un botón «Probar con un audio nuevo»**, que dentro del toque cierra el contexto, crea uno nuevo y reconstruye el motor (ambiente y guía) en el punto de la sesión. Si con él vuelve el sonido, se confirma la hipótesis 2 de SPEC_23 §6. **REPORTA** si (b) cabe sin tocar el comportamiento normal; si no cabe limpio, propón la alternativa más pequeña. |
| **DP-23.18 · Hipótesis, en este orden** | Las tres de SPEC_23 §6 y una cuarta: **(4) el tipo de sesión de audio de WebKit** (DP-23.17 a). El diagnóstico tiene que poder confirmar o descartar cada una con lo que la fundadora ve y oye; **REPORTA** cómo leería cada resultado. |

Criterio de producto de la fundadora, que manda sobre todo lo anterior: **en el iPhone, el Journal se abre con la cara de quien lo protegió y con nada más; el PIN siempre sigue ahí; los toques son pocos, suaves y nunca premian; y nada de esto se nota en la web.**

---

## 2. Lo que ya está verificado en el código (12 nov 2026, sobre `59a7147`)

### 2.1 El PIN hoy

- `src/diario/pin.js`: PBKDF2-SHA-256, sal de 16 bytes, 150.000 iteraciones; `comparaIgual` en tiempo constante; `estadoPin` devuelve `{ activo, metodo, puedeActivar, sinSalida }`; `crearPin` exige un método de recuperación (correo o teléfono en `shared/auth`); `verificarPin` **rederiva y reescribe el `pinConfig` entero** si el PIN se guardó con menos iteraciones; `desactivarPin` exige el PIN; `reestablecerPin` fija uno nuevo tras `reautenticar` (contraseña con correo; hoja nativa con Google o Apple, por `lib/reautenticacion.js`).
- `usePin.js`: la puerta se decide **una vez, al montar**; `desbloqueado` vive en el estado del Journal, así que **el Journal se vuelve a cerrar solo al salir de su ruta**, no al mandar la app al fondo.
- `BloqueoPin.jsx`, modo `desbloqueo`: «Tu journal te espera», campo de PIN, «Abrir», «Olvidé mi PIN» → «Volvamos a reconocerte» → «Elige tu PIN nuevo». Modo `ajustes`: el panel que abre el botón **«Ajustes de acceso»** de la lista del Journal, con «Proteger mi journal», «Pedir un PIN» / «Dejar de pedirlo» y `CuentaParaPin` si no hay método de recuperación.
- **No existe «Ajustes → Journal» ni «Cambiar PIN».** Cambiar el PIN hoy es «Olvidé mi PIN» → verificar la cuenta → PIN nuevo, o «Dejar de pedirlo» y «Pedir un PIN» otra vez.
- `diario/pinConfig` se escribe con `sync: false` y `assertFields` rechaza cualquier campo fuera de `['salt', 'hash', 'iterations', 'algorithm', 'enabled']`.
- Sin cuenta no hay método de recuperación, así que **sin cuenta el Journal no deja poner PIN**: 23A se prueba con cuenta.

### 2.2 Los puntos de la háptica

- La mañana y la noche se cierran en `terminar()` de `DiarioManana.jsx` y `DiarioNoche.jsx` (con la guarda `cerrando`), que pone el cierre delante y llama a `persistir()`; `persistir` escribe `completedAt` y avisa a SPEC_22 con `alCerrarMomento`.
- Las emociones: `ChipsCatalogo` (mañana: cómo me siento y cómo me gustaría sentirme; noche: cómo me siento al cerrar) y `ChipsEmociones` (Journal). Los dos calculan la selección siguiente con la función `alternar` de su catálogo, que dice si se alcanzó el tope o si se desplazó una.
- Respiración: la máquina (`maquinaSesion.js`) emite `alCambiarFase` desde el reloj (`relojSesion.js`), que corre con `requestAnimationFrame` y cuenta el tiempo contra el origen con `performance.now()`. «Respira un momento» (`components/shared/Respiracion.jsx`) tiene su propio bucle de `requestAnimationFrame` y detecta el cambio de fase en `avanzar`.

### 2.3 El audio y D-21.13

- Un solo `AudioContext` para toda la app (`lib/audio/contextoAudio.js`), prestado y devuelto. El ambiente (`breathing/audio/motorAmbiente.js`) usa un planificador que **despierta cada 50 ms con `setTimeout`** y programa 200 ms por delante sobre `ctx.currentTime`. La guía (`lib/audioRespiracion.js`) programa la envolvente de cada fase cuando llega `fase()`.
- Lo que ya se intentó para D-21.13 (`90b32e3`, `52e1e89`) sigue en el código: `NO_SE_REANUDA = {running, closed}` (se intenta también `'interrupted'`, el estado propio de WebKit), techo de 1 s en `resume()`, `despertarAlVolver` (intenta ya y, si no corre, con el siguiente toque) y la rampa de 0,4 s de `FUNDIDOS.reanudarContexto`. **No funcionó en el iPhone el 14 oct.**
- **Dos hallazgos que la Parte 2 tendrá que resolver, y que el diagnóstico tiene que medir:**
  1. **El reloj de la sesión anda con `requestAnimationFrame`.** Con la pantalla bloqueada no hay fotogramas, así que **no hay cambios de fase** (la guía deja de marcar inhalar y exhalar) y **la sesión no termina** mientras la pantalla siga bloqueada, aunque el ambiente siguiera sonando. «Sigue hasta el fin de la sesión» (SPEC_23 §3) no se cumple solo con que el audio sobreviva.
  2. **Caso 9.4:** al volver tras más de un ciclo fuera, `notificarAusencia` **pausa la sesión** («no se finge que la sesión siguió»). Con audio que de verdad sonó con la pantalla bloqueada, la sesión sí siguió. Es una decisión de producto para la Parte 2.
- «Respira un momento» calcula el tiempo con `performance.now()` incluido lo que estuvo fuera: si la app estuvo fuera más de lo que queda, al volver se cierra sola.

### 2.4 Lo que ya promete la app de iPhone

- `Info.plist`: `UIBackgroundModes` = `[audio]`; `NSFaceIDUsageDescription` = «Para abrir tu Journal sin escribir el PIN.»; `ITSAppUsesNonExemptEncryption` = `false`; región `es`.
- `appIos.test.js` vigila identificador, esquema, host, iOS 16.2, la base SQLite, el cifrado, el texto de Face ID (`it('el texto de Face ID, exacto')`) y, en el bloque de SPEC_22, que `UIBackgroundModes` sea exactamente `['audio']`.
- `@capacitor/app` ^8.1.2 ya está en `package.json`.

### 2.5 Los plugins candidatos (leídos del paquete de npm el 12 nov 2026)

- **`@capacitor/haptics` 8.0.2:** `impact` crea un `UIImpactFeedbackGenerator` y lo dispara; sin dependencias de terceros; `Package.swift` con iOS 15 y `capacitor-swift-pm`. **Su implementación web vibra con `navigator.vibrate`** (DP-23.6).
- **`@capgo/capacitor-native-biometric` 8.9.3:** `setData` / `getSecureData` / `deleteData` / `isDataSaved` / `isAvailable`; con `accessControl: 1`, `SecAccessControlCreateWithFlags(kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly, .biometryCurrentSet)`; `getSecureData` lee con un `LAContext` y rechaza con `"16"` al cancelar, `"21"` si no hay item y `"10"` si falla la autenticación; en `load()` escucha `didBecomeActive` y emite `biometryChange`. Sin `UserDefaults`. Trae también métodos de credenciales que no se usan. **REPORTA** todo lo que lo confirme o lo contradiga.

### 2.6 Lo que esta instrucción corrige de SPEC_23

| SPEC_23 decía | Manda ahora | Por qué |
|---|---|---|
| «Ajustes → Journal», «junto a Cambiar PIN», `CuentaParaPin` | El panel «Ajustes de acceso» del Journal (DP-23.9) | La app no tiene Ajustes ni «Cambiar PIN»; `CuentaParaPin` es la pantalla de vincular un correo. |
| «Cambiar o quitar el PIN» desactiva | «Dejar de pedirlo», el PIN nuevo de «Olvidé mi PIN» y cerrar sesión (DP-23.12) | Son los caminos que existen. |
| `@capacitor-community/biometric` | `@capgo/capacitor-native-biometric` 8.9.3 o plugin propio (DP-23.7) | El primero no existe con ese nombre; el original no se publica desde 2023. |
| Un token que «envuelve» la clave | Clave aleatoria en la Keychain y su SHA-256 en `pinConfig` (DP-23.8) | Es lo mínimo que hace falta para una puerta; no hay nada que cifrar. |
| `Haptics.impact` «en web es no-op sin error» | En la web el plugin vibra; no se carga (DP-23.6) | Leído en el paquete. |
| Diagnóstico con el Inspector web de Safari | Build de diagnóstico que pinta en pantalla (DP-23.16) | Regla de SPEC_17B y SPEC_22. |
| Tres hipótesis | Cuatro (DP-23.18) | El tipo de sesión de audio de WebKit. |
| 23C en un commit | 23C en una Parte 2 | Depende del diagnóstico y de DP-23.3. |

---

## 3. Alcance

**Entra:** 23B entera; 23A entera; el build de diagnóstico de 23C con sus dos experimentos; pruebas; `CLAUDE.md`; esta instrucción en `docs/specs/`; la nota en SPEC_24.

**No entra:** arreglar D-21.13 o construir el audio en segundo plano (Parte 2); controles en la pantalla de bloqueo; tocar `UIBackgroundModes`; el caso 9.4; cuándo se vuelve a cerrar el Journal; la web; Android; D-21.11 y sus archivos (§1.1); DP-21.5; SPEC_24 y SPEC_25.

---

## 4. Cambios esperados (a confirmar en el reporte previo)

Los nombres los propones tú; esta es la forma:

- **`src/lib/haptica.js`** (23B): el único que importa `@capacitor/haptics`, bajo demanda y solo con `esIPhone()`. Exporta una sola función (por ejemplo `toqueSuave()`), que nunca lanza y no se espera.
- **Los tres puntos** (23B, DP-23.4 y DP-23.5): `DiarioManana.jsx`, `DiarioNoche.jsx`, `ChipsCatalogo.jsx`, `ChipsEmociones.jsx`, `useSesionRespiracion.js` y, si se aprueba DP-23.5, `components/shared/Respiracion.jsx`. **`components/shared/` no puede importar de `diario/` ni de `breathing/`**: `lib/haptica.js` está en territorio neutral y vale para todos.
- **`src/lib/biometria.js`** (23A): el único que importa el plugin de biometría, bajo demanda, devolviéndolo envuelto. Disponibilidad (y qué biometría es), guardar la clave, leerla con Face ID, borrarla, saber si existe. Ninguna respuesta del teléfono es un error (RN-EST-04): todo contesta y nada lanza hacia la pantalla.
- **`src/diario/pin.js` y `usePin.js`** (23A): activar, abrir con biometría, apagar, la invalidación, conservar `biometria` en la rederivación, la limpieza de la clave huérfana. `estadoPin` añade lo que la pantalla necesita (por ejemplo `biometria: 'apagada' | 'activa' | 'cambiada'` y el nombre que dé el plugin). **El PIN sin biometría se comporta exactamente como hoy.**
- **`src/lib/db/schema.js`** (23A): `FIELDS.pinConfig` gana `biometria` (DP-23.8).
- **`BloqueoPin.jsx`** (23A): el interruptor y su paso de confirmación en `ajustes`; el intento automático, el botón «Abrir con Face ID» y la nota de `cambiada` en `desbloqueo`.
- **`src/lib/salidaCuenta.js`** (23A): borrar la clave al cerrar sesión, sin frenar la salida.
- **`ios/App/App/Info.plist`** (23A): solo si la fundadora cambia el texto en DP-23.14.
- **El diagnóstico** (23C): un componente del panel cargado solo con la bandera, montado en `PantallaSesion.jsx` y en `components/shared/Respiracion.jsx`, y lo mínimo en `contextoAudio.js` / `useSesionRespiracion.js` para que el panel pueda leer el estado (sin cambiar el comportamiento sin bandera).
- **`package.json`, `package-lock.json`, `ios/App/CapApp-SPM/Package.swift` y `Package.resolved`:** los dos plugins en versión exacta y lo que regenere `cap sync`. **En `package.json` solo cambia el bloque `dependencies`** (los scripts son de D-21.11).
- **`capacitor.config.json`:** sin cambios, salvo que un plugin necesite configuración (**REPORTA**).
- **Pruebas nuevas en un archivo propio** (por ejemplo `src/lib/__tests__/nativoSpec23.test.js`): los plugins en versión exacta y por SPM, cada uno importado en un solo archivo de `src/`, `UIBackgroundModes` sigue `[audio]`, el texto de Face ID, y nada de los plugins en el chunk principal de la web. **En `appIos.test.js` solo se toca, si hace falta, la línea del texto de Face ID**, para no chocar con D-21.11.
- **`src/copy/index.js`** (§6) y **`src/copy/diagnostico.js`**.
- **`CLAUDE.md`:** una sección nueva «Face ID y háptica en el iPhone (SPEC_23A y 23B)» y, aparte, «El audio de Respiración al irse y al volver (SPEC_23C, diagnóstico)» con los resultados cuando lleguen; «Dónde vive cada regla» (`haptica.js`, `biometria.js`); la nota de §8 sobre el PIN y Face ID; los recuentos de §13.
- **`docs/specs/SPEC_24_BORRADO_CUENTA_EXPORTACION.md`:** una línea: borrar la cuenta borra también la clave de Face ID de la Keychain.

**REPORTA, además:**

- **Simulador:** si puedes probar 23A en el simulador (Face ID inscrito o no, cara que coincide o no, y **Touch ID en un iPhone SE simulado**), por ejemplo con el menú Features o con `notifyutil`. Y **si cambiar la inscripción en el simulador invalida la clave** (criterio 3 de SPEC_23): así la fundadora no tiene que tocar la Face ID de su teléfono.
- **SPM:** que resuelve con `capacitor-swift-pm` 8.5.3 y `swiftToolsVersion: "6.1"`, si algún plugin necesita `packageOptions`, y **cuánto crece la app** en Release.
- **Manifiesto de privacidad:** si alguno de los dos plugins usa API que Apple obliga a declarar.
- **Tamaño de los chunks** de `npm run build` antes y después, y que nada de los plugins ni del diagnóstico entra en el chunk principal de la web.
- **Las vistas previas de Netlify:** si Netlify publica una vista previa por cada pull request contra `strivo` (deploy previews) con las variables de Firebase. Si sí, la Parte 2 podrá probar la PWA antes de fusionar; si no, se probará en Netlify después.
- **Las dos observaciones de §2.3** (el reloj con `requestAnimationFrame` y el caso 9.4): confirma que las entiendes igual, y si ves otra cosa que impida «sigue hasta el fin de la sesión» con la pantalla bloqueada.
- **Lo que choca con `revision-21-11`:** con `git diff strivo...revision-21-11 --stat`, qué archivos toca y cuáles de los tuyos coinciden. Anótalo en el reporte, para que la fundadora sepa qué conflicto esperar.

---

## 5. Criterios de aceptación

### 5.1 Automáticos (Claude Code)

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde.
2. **Háptica:** el toque se pide en los tres puntos de DP-23.4 (y en «Respira un momento» si se aprueba DP-23.5); **no** se pide al quitar una emoción, al chocar con el tope, en un día de solo lectura, durante el acomodo, en pausa, en la vista previa ni al reanudar; **en la web no se carga el plugin y no se pide nada**; si el plugin falla, nada se rompe.
3. **Biometría, la máquina de estados:** apagada → activa (con PIN correcto y Face ID aceptado); activa → abre con Face ID; cancelar → PIN sin mensaje y sin apagar; invalidada → `cambiada`, la clave borrada y el PIN; PIN equivocado al activar → `incorrecto` y nada guardado; Face ID cancelado al activar → nada guardado y la clave borrada.
4. **El `JournalLock` acepta la clave solo si el interruptor está activo**: sin `biometria.verificador`, o con una clave cuyo SHA-256 no coincide, no abre (prueba con el doble del plugin hecho como Proxy, como `dobleDeCapacitor.js`).
5. **Lo que apaga Face ID:** «Dejar de pedirlo», el PIN nuevo de «Olvidé mi PIN», `crearPin` y cerrar sesión borran la clave y el campo; la rederivación de `verificarPin` **conserva** `biometria`.
6. **El PIN nunca llega a la Keychain** (prueba que espía lo que se pasa al plugin) y `pinConfig` sigue sin encolarse, también al mudar el árbol.
7. **Reinstalar:** con clave en la Keychain y sin `verificador` en `pinConfig`, la clave se borra sin pedir Face ID y el Journal se porta como sin biometría.
8. **En la web** el interruptor no existe y el plugin no se carga; el Journal y el PIN pasan sus pruebas de hoy **sin cambiar lo que comprueban**.
9. **Cada plugin se importa en un solo archivo y bajo demanda** (prueba que recorre `src/`), y nada de ellos entra en el chunk principal de la web.
10. **Diagnóstico:** sin `VITE_DIAG_AUDIO`, ni una línea suya existe en `dist/`, y la app se porta igual que hoy (las pruebas de Respiración y de «Respira un momento» pasan sin cambiar lo que comprueban). Cada bandera de diagnóstico no arrastra los textos de las otras.
11. `appIos.test.js` sigue exigiendo identificador, esquema, host y base de fábrica, y `UIBackgroundModes` = `['audio']`.
12. `lint:copy` revisa el copy nuevo; ningún texto lleva «!» ni «¡».
13. Ningún commit lleva `DEVELOPMENT_TEAM` ni `GoogleService-Info.plist` (`git show :ios/App/App.xcodeproj/project.pbxproj | grep DEVELOPMENT_TEAM` sale vacío).
14. **Nada de D-21.11:** `git diff strivo -- ios/App/App/Base.lproj ios/App/App/Assets.xcassets assets scripts/componer-arranque.js` sale vacío y los scripts de `package.json` son los de `strivo`.
15. Las pruebas de SPEC_17A, 17B, 19, 21.1, 21.2, 22, 29, 30 y 31 siguen pasando sin cambiar lo que comprueban.
16. **Al menos 25 casos nuevos** entre 23A y 23B (los del diagnóstico no cuentan).

### 5.2 Manuales (la fundadora, en su iPhone 17 y contra `strivo-fe04f`)

**Nombres de las builds que se usan abajo** (la guía de pruebas dice en cada momento cuál está instalada):

| Nombre | Carpeta y rama | Cómo se compila |
|---|---|---|
| **«La 23 con diagnóstico»** | `~/Developer/strivo-23`, `revision-23` | `VITE_DIAG_AUDIO=1 npm run ios:build` |
| **«La 23 limpia»** | la misma | `npm run ios:build` |
| **«La de D-21.11»** | `~/Developer/strivo-2111`, `revision-21-11` | la de su instrucción (de noche) |

**Pasar de una a otra:** cerrar Xcode, compilar en la carpeta que toca y abrir **su** Xcode con `npm run ios:abrir`. **Instalar encima no borra nada** (ni lo escrito, ni el PIN, ni la clave de Face ID). Solo se borra la app cuando una prueba lo dice. **Tras borrar la app, la primera apertura va con internet.** **Ojo:** la preparación de D-21.11 borra la app, y con ella el PIN del Journal (es local): si se hace antes, F hay que empezarlo poniendo el PIN otra vez.

**Antes de empezar:** apunta cómo tienes **Ajustes → Sonidos y vibración → Vibración** (H4 lo cambia y al final se devuelve). Ten a mano la contraseña de `atreloz.prueba.1@gmail.com`.

**Bloque H · Háptica** (con «La 23 con diagnóstico»; da igual la cuenta)
- **H1 · Cerrar la mañana y la noche.** Hacer la mañana de hoy hasta «Comenzar mi día». **Debe sentirse:** un toque suave, uno solo, al tocar el botón. Lo mismo al cerrar la noche (en el conmutador, Noche).
- **H2 · Las emociones.** En una pregunta de emociones de la mañana: tocar una emoción → un toque; tocarla otra vez para quitarla → **nada**; elegir hasta el tope y tocar una más → **nada**. En el Journal, en una entrada nueva, elegir una emoción → un toque.
- **H3 · Respiración.** Empezar una sesión en la sección Respiración, en silencio. **Debe sentirse:** nada durante el acomodo; un toque en cada cambio de fase (inhalar, retener, exhalar…); nada mientras está en pausa. En Hoy, «Respira un momento»: un toque en cada cambio de fase; al pausar y reanudar, **no** se repite el toque de la fase en la que estabas. Al terminar sola una sesión de la sección, **ningún toque de más** al final.
- **H4 · Si apagas la vibración del sistema.** En **Ajustes → Sonidos y vibración → Vibración**, elegir **«No reproducir nunca»**. Repetir un punto de H2 y uno de H3: **nada**. Devolver la opción a la que tenías.

**Bloque F · Face ID** (con «La 23 con diagnóstico», entrando con `atreloz.prueba.1@gmail.com`, por correo)
- **F1 · Solo con PIN.** En el Journal, «Ajustes de acceso». **Debe verse:** «Proteger mi journal» y «Pedir un PIN», **sin** nada de Face ID. Poner un PIN de 4 dígitos. **Debe verse:** «Tu journal pide un PIN para abrirse.» y debajo el interruptor «Abrir con Face ID», apagado, con «Tu PIN sigue siendo el respaldo.».
- **F2 · Activar.** Encender el interruptor. **Debe verse:** «Escribe tu PIN para activar Face ID.», el campo y «Activar». Escribir el PIN → «Activar» → **la primera vez**, el diálogo de iOS «¿Permitir que “Strivo” use Face ID?» con el texto de DP-23.14 → «Permitir» → mirar el teléfono → el interruptor queda encendido.
- **F3 · Abrir con la cara.** Ir a Hoy y volver al Journal: **Face ID sale solo** y el Journal se abre sin tocar nada más. Cerrar la app del todo (deslizarla hacia arriba en el selector de apps), abrirla, ir al Journal: igual.
- **F4 · Cancelar.** Volver a entrar al Journal y, cuando salga Face ID, tocar **«Cancelar»** (o tapar la cámara hasta que iOS ofrezca cancelar). **Debe verse:** «Tu journal te espera» como siempre, **sin ningún mensaje nuevo**, y debajo de «Abrir» el botón «Abrir con Face ID». Tocarlo → Face ID → se abre. Con el PIN también se abre.
- **F5 · Un PIN nuevo apaga Face ID.** En la pantalla del PIN (cancelando Face ID): «Olvidé mi PIN» → «Verificar mi cuenta» → contraseña → PIN nuevo. Abrir «Ajustes de acceso». **Debe verse:** el interruptor **apagado**. Volver a activarlo (F2, ya sin el diálogo de permiso). Luego «Dejar de pedirlo» con el PIN: **desaparece** el interruptor.
- **F6 · Si le quitas el permiso.** Poner PIN y activar Face ID otra vez. En **Ajustes → Face ID y código** (pide tu código) **→ Otras apps → Strivo**: apagarlo. Volver a Strivo, entrar al Journal. **Debe verse:** sin diálogo de Face ID, la pantalla del PIN con «El teléfono cambió su configuración de Face ID. Actívalo de nuevo cuando quieras.»; en «Ajustes de acceso», sin interruptor (no hay Face ID disponible para Strivo). Devolver el permiso en Ajustes; volver a Strivo: el interruptor aparece **apagado**, con la misma frase debajo.
- **F7 · (Opcional) Una cara nueva.** **Solo si no tienes ya una apariencia alternativa** y quieres hacerlo: con Face ID activo en Strivo, en **Ajustes → Face ID y código → «Configurar apariencia alternativa»**, registrar **tu propia cara** (por ejemplo con lentes). Puedes dejarla así; no hace falta borrar nada. Volver al Journal: **debe verse** lo mismo que en F6 con el permiso concedido (PIN, la frase, el interruptor apagado). **No uses «Restablecer Face ID»**: borraría tu cara y tendrías que configurarla de nuevo, y otras apps (bancos) te pedirían su contraseña. **Si el simulador no invalida la clave (§9), esta prueba deja de ser opcional**, porque es la única forma de comprobar que la app reconoce una clave invalidada.
- **F8 · Cerrar sesión.** Con PIN y Face ID activos: Tu perfil → cerrar sesión → volver a entrar con la misma cuenta. **Debe verse:** el Journal **se abre sin PIN y sin Face ID** (el PIN es de este teléfono y se borró al salir, como hoy). Ningún diálogo de Face ID en ningún momento.
- **F9 · La web.** En `localhost` (`npm run dev` en `~/Developer/strivo-23`), entrar con la misma cuenta y poner un PIN: en «Ajustes de acceso» **no hay nada de Face ID**, y nada vibra.

**Bloque D · Diagnóstico del audio** (con «La 23 con diagnóstico», salvo D0). **Para cada prueba, apunta lo que oyes y haz una captura de pantalla del panel** (botón lateral + subir volumen) **al volver**; las capturas se mandan a Claude en la conversación del proyecto. El modo silencio, apagado salvo en D6. Volumen medio.
- **D0 · La PWA de hoy, como punto de partida.** En Safari del iPhone, en `beamish-wisp-ada776.netlify.app`: Respiración con un sonido (por ejemplo «Lluvia») y la guía activada; a mitad, ir a la pantalla de inicio 15 s y volver. ¿Vuelve el sonido? Repetir bloqueando la pantalla 15 s. (Sin panel: solo lo que se oye.)
- **Cómo leer lo que oyes en D1–D5:** tras 20–30 s fuera, la sesión se pausa sola (es lo de siempre) y **lo correcto es oír la lluvia bajita, sin la guía**. El defecto es **no oír nada**. **Al volver, primero la captura y después cualquier toque**: tocar la pantalla, también el panel, despierta el audio y cambia lo que se mide.
- **D1 · Salir a otra app.** En la app, Respiración: sonido «Lluvia», guía activada, 3 minutos. A mitad, ir a la pantalla de inicio, abrir Fotos 20 s y volver a Strivo **sin tocar la pantalla**. Apunta si se oye la lluvia sola. Captura del panel. Si no se oía, toca una vez en una zona vacía, apunta si vuelve y haz otra captura.
- **D2 · Bloquear la pantalla.** Igual que D1, pero bloqueando el teléfono 30 s. **Mientras está bloqueado, escucha:** ¿sigue el sonido? ¿cuánto dura? ¿se oyen los cambios de inhalar y exhalar? ¿aparece algún control en la pantalla de bloqueo? Desbloquear, captura.
- **D3 · «Respira un momento».** En Hoy, con el sonido activado: a mitad, a la pantalla de inicio 10 s y volver. ¿Vuelve? Captura.
- **D4 · D1 con «reproducción».** En el panel, «Tipo de sesión de audio» → **reproducción**. Salir de la sesión y **empezar una nueva** (el tipo se aplica al empezar). Comprobar que el panel dice «reproducción». Repetir D1. Captura.
- **D5 · D2 con «reproducción».** Con **reproducción** ya puesto, sesión nueva y repetir D2. Escucha con el teléfono bloqueado al menos 60 s.
- **D6 · El modo silencio.** Con el teléfono en **modo silencio**: una sesión con sonido en **automático** (¿suena?) y otra en **reproducción** (¿suena?).
- **D7 · Con tu música.** Poner música en Spotify o Apple Music, abrir Strivo y empezar una sesión con sonido (en el tipo que mejor haya ido). ¿Se pausa tu música? Al terminar la sesión, ¿vuelve sola?
- **D8 · Un audio nuevo.** Si en D1 el sonido no volvió ni con un toque: repetir D1 y, al volver, tocar **«Probar con un audio nuevo»** en el panel. ¿Vuelve? Captura.

**Al terminar:** devuelve **Vibración** a como estaba y, si lo cambiaste, el permiso de Face ID de Strivo.

---

## 6. Copy

**Ningún texto existente cambia.** Los nuevos, en `copy.diario.journal.pin.biometria` (junto a los del PIN, en segunda persona). `{biometria}` es «Face ID» o «Touch ID», según el plugin. Todos pasan `lint:copy`. La redacción final la revisa la fundadora con el reporte previo.

| Clave | Texto |
|---|---|
| `interruptor` | Abrir con {biometria} |
| `texto` | Tu PIN sigue siendo el respaldo. |
| `confirmarPin` | Escribe tu PIN para activar {biometria}. |
| `activar` | Activar |
| `abrir` (botón de la pantalla del PIN) | Abrir con {biometria} |
| `cambiada` | El teléfono cambió su configuración de {biometria}. Actívalo de nuevo cuando quieras. |
| `motivo` (lo que iOS enseña al pedir Touch ID) | Para abrir tu journal. |

«Cancelar» reutiliza `copy.diario.journal.pin.cancelar`; el PIN equivocado, `bloqueo.incorrecto`.

**Texto de permiso de Face ID** (`Info.plist`, DP-23.14): «Para abrir tu journal sin escribir tu PIN.» (propuesta).

**Diagnóstico** (`diagnostico.js`, solo con `VITE_DIAG_AUDIO=1`; propuesta, con horas en `hh:mm:ss`):

| Clave | Texto |
|---|---|
| `audio.estado` | Audio: {estado} (en marcha · suspendido · interrumpido · cerrado · sin audio) |
| `audio.cambios` | Cambios: {lista} (los seis últimos, con su hora) |
| `audio.alIrse` | Al irse: {hora} · {estado} |
| `audio.alVolver` | Al volver: {hora} · fuera {s} s · {estado} |
| `audio.resume` | Reanudar: {resultado} (resolvió · rechazó · sin respuesta en 1 s · no hizo falta) |
| `audio.relojFuera` | Reloj del audio mientras estaba fuera: {a} s de {b} s |
| `audio.relojAhora` | Reloj del audio ahora: {avanza · quieto} |
| `audio.jsFuera` | JavaScript mientras estaba fuera: {n} tics de {m} · {f} fotogramas |
| `audio.motor` | Motor: {vivo · suelto} · fuentes {n} · planificador {tics} |
| `audio.sesion` | Sesión: {estado} · fase {fase} |
| `audio.tipo` | Tipo de sesión de audio: {automático · reproducción · no existe} |
| `audio.nuevo` | Probar con un audio nuevo |
| `audio.plegar` / `audio.desplegar` | Ocultar diagnóstico / Diagnóstico |

---

## 7. Reglas de arquitectura que roza

- **Nada bloquea:** ningún diálogo de iOS deja la pantalla rota; ninguna respuesta del teléfono es un error (RN-EST-04); **la háptica nunca suena en un error** ni premia nada.
- **La web no cambia:** con `esIPhone()` en `false`, el código de hoy, sin plugins.
- **Una regla, un sitio:** cuándo vibra lo dice cada uno de los tres puntos; cómo se habla con iOS, `haptica.js` y `biometria.js`; qué abre el Journal, `pin.js`. La plataforma la dice `plataforma.js`.
- **Dirección de dependencias:** `lib/` no importa de `diario/`, `breathing/`, `perfil/`, `onboarding/` ni de componentes; `components/shared/` no importa de `diario/` ni de `breathing/` (RN-TEC-04 a 08).
- **Nada sale del teléfono:** ni la clave, ni el verificador, ni el PIN, ni el estado de Face ID viajan a Firestore ni a analítica (RN-07).
- **Nada secreto en el repo:** ni el Team ni `GoogleService-Info.plist` ni `.env.local`. Commits por ruta. Antes de comitear, `git show :ios/App/App.xcodeproj/project.pbxproj | grep DEVELOPMENT_TEAM` sale vacío.

---

## 8. Entrega

1. **Trabaja en un worktree aparte:** `~/Developer/strivo-23`, rama local `revision-23` creada desde `strivo`. **`~/Developer/strivo` se queda en `strivo` y no se toca. `~/Developer/strivo-2111` y `revision-21-11` tampoco.**
2. Para que el worktree compile la app de iPhone: copia desde `~/Developer/strivo` los dos archivos que no están en git (`.env.local` y `ios/App/App/GoogleService-Info.plist`), corre `npm install` y **avisa a la fundadora de que tiene que elegir su Team en el Xcode de esa carpeta una vez** (Anexo A). Ninguno de los tres se comitea. Copia también esta instrucción a `docs/specs/` del worktree.
3. Commits pequeños y por tema, **en este orden**: 23B (plugin y puente / los puntos / pruebas) → 23A (plugin y puente / esquema y `pin.js` / pantalla / cerrar sesión / pruebas) → diagnóstico de 23C → docs. Cada uno con la línea `Co-Authored-By` del repo, añadiendo archivos por ruta.
4. **Sin push** hasta que la fundadora lo apruebe; entonces `git push origin revision-23`. Nunca a `strivo` directamente.
5. **Antes de fusionar, el ensayo de fusión con D-21.11**, en los dos órdenes, en un worktree temporal desechable (por ejemplo `~/Developer/strivo-ensayo`, en modo *detached*, que se borra al terminar), **sin mover ninguna rama real**:
   - **Orden A:** desde `strivo`, fusionar `revision-21-11` y luego `revision-23`.
   - **Orden B:** desde `strivo`, fusionar `revision-23` y luego `revision-21-11`.
   - En cada orden: qué archivos chocan, cómo se resuelve cada choque (**conservando los dos lados**; los de `CLAUDE.md` §13 son lo esperable) y, sobre el resultado, `npm run test` y `npm run build`. Si `revision-21-11` ya se fusionó a `strivo` cuando llegues aquí, basta con fusionar `strivo` en `revision-23` en el worktree temporal y repetir las pruebas.
   - **Reporta el resultado antes de fusionar de verdad.** La fusión real la aprueba la fundadora.
6. **Fusión de 23A y 23B** cuando pasen H y F: `revision-23` → `strivo` con un commit de unión. El diagnóstico va dentro, apagado detrás de su bandera, como el de 17B y el de 22. La Parte 2 sigue en el mismo worktree.
7. Reporte final: qué se hizo, cada **REPORTA** con su respuesta, la salida de las siete validaciones, archivos y casos de prueba antes y después, el tamaño de la app y de los chunks, el ensayo de fusión, y la lista H, F y D con los textos exactos que la fundadora verá.

---

## 9. Reporte previo y decisiones

Reporte previo de Claude Code (12 nov 2026) **aprobado por la fundadora con las decisiones de abajo**. Todo lo demás del reporte se aprueba tal como viene: los archivos nuevos y tocados, los textos exactos, dónde va cada toque, cómo se distingue «cancelado» de «invalidada», la limpieza de la clave huérfana en `estadoPin`, el registro de oyentes del diagnóstico (`lib/audio/observadorAudio.js`) y el panel en `components/shared/DiagnosticoAudio.jsx`.

**Lo que el reporte encontró distinto de esta instrucción (y manda el reporte):**

- **«Respira un momento» no se monta en P1 del onboarding**, solo en Hoy. DP-23.5 afecta solo a Hoy; el comentario desfasado del componente se corrige.
- **El planificador del ambiente es un `setInterval` de 50 ms**, no un `setTimeout`.
- **El plugin de biometría no devuelve el nombre** («Face ID» / «Touch ID»), solo un número (`biometryType`: 1 Touch ID, 2 Face ID). Los dos nombres viven en el copy (`biometria.nombres`) y se elige uno por ese número.
- **«Cancelado» e «invalidada» se distinguen sin adivinar:** solo se lee la clave si `pinConfig` tiene `verificador`, y la app solo borra la clave a la vez que el verificador; así, «la clave no está» (`21`) con verificador solo puede ser que iOS la quitó → `cambiada`. Antes de leer, `isAvailable`: permiso negado (`1`), sin caras (`3`) o sin código (`14`) → `cambiada` sin diálogo; bloqueo (`2`) → como cancelado. Al leer, `16`, `10` y `0` → cancelado. **Riesgo residual aceptado:** si iOS diera `10` en vez de `21` para una clave invalidada, Face ID fallaría en cada entrada pero el PIN seguiría abriendo. F7 lo comprueba.
- **El simulador probablemente no invalida la clave** al cambiar la inscripción (su estado biométrico no cambia). Claude Code lo comprueba con la app montada; **si no invalida, F7 deja de ser opcional**.
- **Face ID se lee con `fallbackTitle: ''`**: iOS no ofrece el código del teléfono, porque el respaldo es el PIN. Solo se pide con la app a la vista.
- **`sonidoYFavoritos.test.js` fija la lista exacta de dependencias**: se le añaden los dos plugins (cambia lo que comprueba solo en eso). `diagnosticoAvisos.test.js` y `diagnosticoAlmacen.test.js` añaden la bandera nueva a su lista.
- **Para leer el bloque D:** tras 20–30 s fuera, **lo correcto hoy es «ambiente bajo (al 30 %), sin guía y la sesión en pausa»** (caso 9.4); el panel lo dice («Sesión: en pausa»). El defecto es no oír **nada**. Lo que suena a gotas (lluvia, fuego, cristales) depende del temporizador, que iOS frena en segundo plano; la base continua solo necesita el contexto en marcha.
- **Cualquier toque en la pantalla despierta el audio** (`despertarAlVolver` escucha todo el documento), también uno en el panel. Por eso el panel apunta «Al volver» solo, y **la captura se hace antes de tocar nada**.
- **El tipo de sesión de audio (DP-23.17 a) se guarda y se aplica al empezar una sesión**: cambiarlo a media sesión puede no surtir efecto. En D4 y D5 se cambia y **luego se empieza una sesión nueva**.
- **Para la Parte 2:** el reloj de Respiración no se congela fuera (al volver salta lo que estuvo fuera, y el 9.4 lo cuenta como sesión activa); con la pantalla bloqueada a media inhalación la guía se queda en un tono continuo; el Wake Lock no se vuelve a pedir tras una ausencia corta.
- **`revision-21-11` aún no tiene commits.** Coincidencias previstas: `CLAUDE.md` (conflicto seguro, se conservan los dos lados), `appIos.test.js` (distintos `describe`) y `package.json` (scripts frente a dependencias). **Si la 23 se fusiona antes, el criterio 5 de D-21.11 («mismos chunks que `strivo`») compara contra `strivo` de ese momento.**
- **Tamaño medido:** la app en Release, de 9.504 a 9.640 KB (+136 KB); comprimida, +35 KB. SPM resuelve sin `packageOptions` y sin tocar `capacitor.config.json`; `Package.resolved` no cambia.
- **Vistas previas de Netlify:** no se pudieron comprobar desde el repo. Se miran en Netlify antes de la Parte 2.

| Punto | Decisión |
|---|---|
| **DP-23.5 · «Respira un momento»** | **Sí vibra** en cada cambio de fase, con una referencia propia del último toque (fase y ciclo) que no se borra al pausar ni al volver, para no repetir el toque de la misma fase. |
| **Inhalación fantasma al terminar** | **Se corrige en la máquina:** no se emite la fase cuando `estado === cerrando` y ya se alcanzó el cierre. Con una prueba que lo demuestre. Se acepta que la guía deje de recibir ese `fase('inhalar')` del último fotograma. |
| **Cerrojo del doble toque en «Empezar» de «Respira un momento»** | **Entra:** un bucle huérfano seguiría vibrando durante la pausa, así que toca a 23B. Con su prueba. |
| **DP-23.14 · Texto de permiso** | **«Para abrir tu journal sin escribir tu PIN.»** Se actualiza la línea de `appIos.test.js`. |
| **Apagar el interruptor** | **Sin pedir el PIN**: quitar Face ID reduce el acceso. Borra la clave y el campo. |
| **Nombres de la biometría** | En el copy, elegidos por `biometryType`. |
| **DP-23.7 · Plugin de biometría** | **`@capgo/capacitor-native-biometric`, versión exacta.** Como 8.9.3 se publicó hace un día, **antes de instalar compara 8.9.3 con la versión anterior** (cambios en el Swift y en el registro de cambios): si la diferencia es pequeña y no toca lo que usamos, 8.9.3; si toca la Keychain, `getSecureData` o `isAvailable`, la anterior. Reporta cuál y por qué. |
| **DP-23.6 · Plugin de háptica** | **`@capacitor/haptics` 8.0.2**, versión exacta. |
| **Casos nuevos** | Los 30 o más prometidos entre 23A y 23B. |
| **Trabajo** | Worktree `~/Developer/strivo-23`, rama `revision-23`, según §8. Orden: 23B → 23A → diagnóstico. Al terminar, la build con diagnóstico para H, F y D. |

---

## 10. Implementación y pruebas manuales

### 10.1 Implementación (Claude Code, 12 nov 2026)

En `~/Developer/strivo-23`, rama `revision-23`, sin push. Commits por tema, en el orden de §8.3:

| Commit | Qué |
|---|---|
| `a1ba2ce` | 23B · `@capacitor/haptics` 8.0.2 y `lib/haptica.js` |
| `6bfc800` | 23B · los tres puntos, «Respira un momento» con su memoria y su cerrojo, la inhalación fantasma corregida en la máquina |
| `fbc4ef7` | 23B · pruebas |
| `c233a6a` | 23A · `@capgo/capacitor-native-biometric` 8.9.3 y `lib/biometria.js` |
| `24c6147` | 23A · `pinConfig.biometria` y Face ID en `pin.js` y `usePin` |
| `951624d` | 23A · el interruptor, abrir con la cara y el copy |
| `ecb2283` | 23A · el texto de permiso de DP-23.14 |
| `8b419d7` | 23A · cerrar sesión borra la clave; nota en SPEC_24 |
| `e9ae7f7` | 23A · pruebas |
| `a59402f` | 23C · el build de diagnóstico del audio |
| (docs) | `CLAUDE.md` y esta instrucción |

- **DP-23.7, la versión del plugin:** 8.9.3 frente a 8.9.2 solo cambia la cadena de versión del
  Swift y un párrafo del README; `dist/`, Android y el resto del Swift son idénticos. **8.9.3.**
- **Lo que no se pudo comprobar en el simulador:** la invalidación de la clave al cambiar la
  inscripción. Ni un ejecutable suelto, ni un XCTest sin app anfitriona, ni una app firmada a mano
  tienen Keychain en el simulador. **F7 es obligatoria.**
- **Sin la bandera del diagnóstico**, el CSS sale idéntico y el JS solo conserva la constante `null`
  del `lazy()` y su hijo vacío (el mismo residuo que los diagnósticos de 17B y 22). No es «byte a
  byte» como decía el reporte previo; el comportamiento sí es idéntico.
- **Casos nuevos:** 114 por proyecto entre 23A y 23B (48 de 23B y 66 de 23A), y 12 del diagnóstico.
  Suite: 121 archivos · 2.865 casos en `indexeddb`, 115 archivos · 2.794 en `sqlite`.
- **Chunk principal de la web:** de 737,40 a 744,66 kB (gzip, de 209,40 a 211,15).

### 10.2 Pruebas manuales

**H1–H4 y F1–F9 pasan** (12 nov 2026, la fundadora en su iPhone 17 con «La 23 con diagnóstico»,
contra `strivo-fe04f`).

- **F4:** Face ID abre al instante, así que «Cancelar» se probó tapando la cámara. La pantalla del
  PIN quedó sin ningún mensaje y con «Abrir con Face ID» debajo de «Abrir».
- **F7, una apariencia alternativa: pasa.** Era obligatoria porque el simulador no pudo comprobar
  la invalidación (§10.1). Con una cara nueva registrada, Face ID dejó de abrir y Strivo lo dijo con
  la frase de `cambiada`, y el interruptor quedó apagado. **Así queda contestado el riesgo residual
  del §9:** iOS devuelve «la clave no está» (`21`) para una clave invalidada, no «falló» (`10`).

**Bloque D:** en curso. Sus resultados alimentan la Parte 2.

---

## Anexo A · Para la fundadora: la primera vez en el Xcode del worktree

1. En la terminal de VS Code, dentro de `~/Developer/strivo-23`: `VITE_DIAG_AUDIO=1 npm run ios:build` y luego `npm run ios:abrir`. Se abre **otro** Xcode, el de esa carpeta (cierra antes cualquier otro Xcode para no confundirlos: arriba, en el título de la ventana, se ve de qué carpeta es).
2. En la columna izquierda, clic en **App** (el ícono azul de arriba) → pestaña **Signing & Capabilities** → en **Team** elige **ALEJANDRA TREVIÑO LOZANO**. Deja marcado **Automatically manage signing**. Si sale «Update to recommended settings», **no lo aceptes**.
3. Arriba, junto a «App», elige tu iPhone conectado por cable.
4. Para instalar: botón **▶**. Para detener: **■**.

## Anexo B · Qué build hay en el iPhone

Las dos tareas instalan **la misma app** (mismo identificador), así que la última que instalaste es la que hay. Para saber cuál es sin adivinar:
- **«La 23 con diagnóstico»**: en una sesión de Respiración se ve el panel del diagnóstico (o su botón «Diagnóstico»).
- **«La 23 limpia»**: en «Ajustes de acceso» del Journal, con PIN, aparece «Abrir con Face ID»; en Respiración no hay panel.
- **«La de D-21.11»**: con PIN, en «Ajustes de acceso» **no** aparece «Abrir con Face ID».

Instalar una encima de otra no borra lo escrito, ni el PIN, ni la clave de Face ID. Con «La de D-21.11» instalada, el Journal pide el PIN aunque Face ID estuviera activo (esa build no lo conoce); al volver a instalar la 23, Face ID vuelve a funcionar.
