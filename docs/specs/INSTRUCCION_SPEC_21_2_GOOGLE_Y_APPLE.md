# INSTRUCCIÓN SPEC_21.2 — Google y Apple dentro de la app de iPhone

**Para:** Claude Code
**Fecha:** 30 oct 2026 · **Versión:** 1.1 (31 oct 2026: decisiones del reporte previo)
**Rama de partida:** `strivo` en `00f5114`, la fusión de `main` en `strivo` (SPEC_30 y PR #8–#11). `a9e8902` es el commit de SPEC_30 que esa fusión trae; §0 comprueba que es ancestro de HEAD.
**Gobierna:** esta instrucción + `docs/specs/SPEC_21_CAPACITOR_IOS.md` + `docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md` + `docs/specs/SPEC_30_ENTRAR_DESDE_LA_BIENVENIDA.md` + `docs/specs/INSTRUCCION_SPEC_19_2_CUENTA_EXISTENTE.md` + `SPEC_00B` + `CLAUDE.md`. **Donde esta instrucción y otra difieran, manda esta** (la §2 lista cada desvío).
**Partición (DP-21.6):** 21.1 = contenedor, cerrada el 14 oct. **21.2 = Google nativo + Iniciar sesión con Apple.** Nada más.

---

## 0. Antes de escribir una sola línea

1. Lee `CLAUDE.md` (secciones «Sesión real», «Cuenta existente en P7», «App iOS (SPEC_21.1)» y «Entrar a una cuenta desde la bienvenida (SPEC_30)»), las instrucciones de 21.1 y 19.2, la SPEC_30 entera y esta instrucción.
2. Comprueba que HEAD de `strivo` contiene `a9e8902` (`git merge-base --is-ancestor a9e8902 HEAD`). Si no, **para**: falta fusionar `main` en `strivo`.
3. Inspecciona: `src/lib/cuenta.js` (`entrarConProveedor`, `comoMotivo`, `claveDeError`, `proveedoresDisponibles`, `cerrarSesion`), `src/lib/firebase.js` (`opcionesDeAuth`, `appleProvider`, `googleProvider`), `src/lib/plataforma.js`, `src/components/ArranqueProvisional.jsx` (`entrarConGoogle`, `pasarACuenta`, `salir`), `src/lib/useSesion.js`, `src/components/perfil/TuCuenta.jsx`, `src/components/shared/FormularioEntrar.jsx`, `src/components/onboarding/Cuenta.jsx`, `Entrar.jsx`, `Onboarding.jsx`, `src/diario/pin.js` (`reautenticar`), `src/components/diario/BloqueoPin.jsx`, el objeto `CUENTA` y `copy.diario.onboarding` (`p7`, `entrar`) en `src/copy/index.js`, `capacitor.config.json`, `ios/App/App/Info.plist`, `ios/App/App/AppDelegate.swift`, `ios/App/App/SceneDelegate.swift`, `ios/App/CapApp-SPM/Package.swift`, y las pruebas de todos ellos (sobre todo `src/lib/__tests__/appIos.test.js`).
4. Entrega un **reporte previo** con todos los puntos marcados **REPORTA**, y además:
   - La versión exacta del plugin (§4.1) y cómo entra por Swift Package Manager (la opción `symlink` que pide su documentación requiere Capacitor CLI 8.4.0 o más; el repo tiene 8.5.3).
   - Qué SDK nativos trae el plugin (Firebase iOS, GoogleSignIn) y cuánto crece la app aproximadamente.
   - Lista de archivos que vas a crear y modificar.
5. **Espera la aprobación de la fundadora.** No instales nada antes.

---

## 1. Decisiones

### 1.1 Ya tomadas, no se reabren

| DP | Decisión |
|---|---|
| DP-21.3 | Bundle `com.hellostrivo.strivo`. Irreversible. |
| DP-21.6 | 21.2 = Google nativo + Iniciar sesión con Apple. |
| DP-21.8 | Esquema y host del WebView de fábrica. **No se tocan**: cambiarlos borra lo escrito de cada persona. |
| DP-19.5 | En `shared/*` gana la cuenta salvo semilla. |
| D30-1…9 | Todo lo de SPEC_30 sigue igual: el enlace de P1, la vista que no es un paso, desde P1 solo se entra con correo, C4 aceptado. |
| — | **La sesión la decide el SDK de Firebase para JavaScript.** Es el que usan la cola, la restauración, las reglas de Firestore y el PIN. El nativo solo consigue la credencial. |

### 1.2 Nuevas (la fundadora las confirma antes de pasar esta instrucción; si cambia alguna, se corrige aquí)

| DP | Decisión |
|---|---|
| **DP-21.2.1** | **Plugin: `@capacitor-firebase/authentication` 8.x**, versión fija (sin `^`), usado **siempre con `skipNativeAuth: true`**. El plugin abre la hoja nativa de Google o de Apple y devuelve la credencial; la sesión se abre con `signInWithCredential` en el SDK de JavaScript. Su documentación cubre exactamente este camino, incluido el `nonce` de Apple. |
| **DP-21.2.2** | **Apple solo en la app de iPhone.** En web sigue solo Google: Apple en web pide un Service ID y verificar el dominio de Netlify, y eso depende de DP-21.5 (¿sigue pública la PWA?). Se reabre si DP-21.5 decide que sí. |
| **DP-21.2.3** | **`GoogleService-Info.plist` fuera de git**, como `.env.local`. Se copia a mano en `ios/App/App/` y se anota en `.gitignore`. Si falta, `npm run ios:build` falla con un mensaje claro que dice qué archivo falta y dónde va. |
| **DP-21.2.4** | **En iPhone, Apple va primero**, luego Google, luego el correo. Los dos botones de proveedor son del mismo tamaño. El de Apple sigue las pautas de Apple (su logo y su texto, en negro o blanco según el fondo); el de Google, las de Google (su logo). |
| **DP-21.2.5** | **Apple pide nombre y correo, y el nombre nunca se guarda ni se pasa a ninguna parte** (reescrita el 31 oct 2026). En iOS el plugin pide siempre los dos ámbitos y `scopes` no aplica a Apple; parchearlo añadiría una herramienta y algo que mantener. `credencialNativa` solo devuelve el token y el nonce, y una prueba lo vigila. El nombre lo da la persona en P2, **que sigue siendo opcional**: Apple puede rechazar una app que exige el nombre después de Iniciar sesión con Apple. |
| **DP-21.2.6** | **Correo oculto de Apple:** Tu cuenta no muestra la dirección `…@privaterelay.appleid.com`; dice que se entra con Apple (copy en §6). |
| **DP-21.2.7** | **Mismo correo, otra forma de entrar:** se dice con un mensaje propio (§6), no con el genérico. **No se vinculan cuentas en 21.2.** |
| **DP-21.2.8** | **Cerrar sesión cierra la sesión de Strivo y la del SDK de Google en el teléfono; la del navegador del sistema, no** (reescrita el 31 oct 2026). La próxima vez Google vuelve a preguntar con qué cuenta, pero la anterior puede seguir en la lista y entrar con un toque. Con Apple no hay nada que cerrar: la hoja usa siempre el Apple ID del teléfono. |

---

## 2. Desvíos y hallazgos (verificados contra el repo tras SPEC_30)

| Lo que hay | Por qué importa | Qué se hace |
|---|---|---|
| `TuCuenta.jsx` llama `onProveedor={() => sesion.entrarConGoogle()}` e **ignora qué botón se tocó** | Con Apple en la lista, el botón de Apple entraría con Google | La sesión ofrece `entrarConProveedor(cual)` y Tu perfil le pasa el proveedor. `entrarConGoogle` desaparece o queda como alias: **REPORTA** cuál. |
| `reautenticar` (PIN) usa `reauthenticateWithPopup` | En la app de iPhone no hay ventana emergente: **recuperar el PIN con una cuenta de Google o de Apple fallaría** | En nativo, reautenticar pide la credencial al plugin y usa `reauthenticateWithCredential` (§4.6). |
| `reautenticar` elige el método por `providerData[0]` | Con más de un método en la misma cuenta, el orden no está garantizado | Se decide por el método con el que se entró en esta sesión. **REPORTA** cómo (p. ej. `getIdTokenResult().signInProvider`). |
| `comoMotivo` convierte cualquier error desconocido en `falloRed` | `auth/account-exists-with-different-credential` le diría a alguien que falló la red | Motivo nuevo `otroMetodo` (DP-21.2.7). |
| La vista de entrar de SPEC_30, P7 y Tu perfil pintan proveedores desde `proveedoresDisponibles()` | Son **tres lugares** con los mismos botones, más el de crear cuenta | Un solo cambio en `proveedoresDisponibles` y un componente de botón de proveedor compartido (§4.4). |
| SPEC_30 C4 (cuenta nueva al entrar con Google) | Con Apple y «Ocultar mi correo», quien creó su cuenta con correo y toca Apple en el teléfono nuevo **abre otra cuenta, vacía**. Deja de ser raro | El aviso de cuenta nueva dice qué hacer (§6) y se prueba en el iPhone (N7). |
| La SPEC madre pedía añadir `capacitor://localhost` a los dominios autorizados | Con `signInWithCredential` no hay redirección | **REPORTA** si hace falta algún dominio. No se añade nada sin necesidad. |
| La app usa `SceneDelegate` (Capacitor 8) y la guía del plugin habla de `AppDelegate` | Si el regreso de Google pasa por una URL, tiene que llegar al plugin | **REPORTA** si GoogleSignIn necesita manejar URL con escenas y cómo llega por `SceneDelegateProxy`. |
| Añadir la capacidad de Apple y el `GoogleService-Info.plist` al proyecto **modifica `project.pbxproj`**, el archivo donde vive el Team local que nunca se comitea | Comitear el archivo entero metería el Team | Ver §4.7. |
| **El plugin pide `firebase` ^12.6.0 como par opcional y la app usa la 10.14.1** (hallado en el reporte previo) | `npm install` falla con `ERESOLVE`; ninguna 8.x admite firebase 10 | `overrides` acotado al plugin: `{ "@capacitor-firebase/authentication": { "firebase": "$firebase" } }`. Su parte web —la única que importa firebase— nunca se carga. Una prueba falla si el lockfile tiene más de un firebase. Subir a firebase 12 queda como deuda para después del lanzamiento. |
| **En iOS el plugin pide a Apple nombre y correo siempre** (hallado en el reporte previo) | DP-21.2.5 tal como estaba no se podía cumplir | DP-21.2.5 reescrita: se acepta, y el nombre nunca sale de `credencialNativa`. |
| **Los traits de SPM del plugin traen Facebook por defecto** | Se enlazaría un SDK que nadie usa | `packageTraits: { "@capacitor-firebase/authentication": ["Google"] }`, con `swiftToolsVersion: "6.1"` y `symlink: true`. |
| **Las pautas de Apple solo admiten el botón blanco o el negro, y RN-VIS-03 prohíbe el negro puro** | Uno de los dos se incumple | **Excepción de marca a RN-VIS-03, solo para el botón de Apple**: blanco con borde, texto y logo negros de día; blanco sin borde de noche. `lint:contraste` la mide como excepción con nombre (`EXCEPCIONES_DE_MARCA`). |
| **El gris de borde de Google (`#747775`) da 2,87:1 sobre la parada más oscura de la mañana** (hallado al implementar) | Un borde que no llega a 3:1 no separa el botón | Se usa `#5F6368`, otro gris de la paleta de Google (3,84:1). Google va en Inter, no en Roboto. |
| **Cancelar no trae código** (hallado en el reporte previo) | Ni Apple (`error 1001`) ni Google (`GIDSignInError.canceled`) llegan con un código de Firebase | Se reconocen dos patrones del mensaje; cualquier otro rechazo sin código es `generico`, nunca `falloRed`. Se confirma en el teléfono (N4). |

---

## 3. Alcance

**Entra:** el plugin; Google y Apple en la app de iPhone en los tres lugares (vista de entrar de P1 y P7, P7, Tu perfil); la sesión abierta en el SDK de JavaScript con la credencial nativa; recuperar el PIN con Google y Apple en nativo; cerrar sesión también en el proveedor; los errores de cancelar y de otro método; el copy nuevo; `Info.plist`, entitlements y `.gitignore`; `CLAUDE.md`; notas para SPEC_24 y SPEC_26.

**No entra:** Apple en web (DP-21.2.2); vincular dos métodos en una cuenta; verificación o cambio de correo; borrar la cuenta y revocar el token de Apple (SPEC_24: aquí solo se deja anotado); Android (SPEC_26); D-21.11 y D-21.13; tocar `entrarACuenta`, `arbolDeEntrada`, `conflictos.js` o el modelo de datos.

---

## 4. Cambios, uno por uno

### 4.1 Plugin — `package.json`, `capacitor.config.json`, `ios/`

- `@capacitor-firebase/authentication` en versión **exacta** compatible con Capacitor 8.5.3, más su dependencia `firebase` si la pide como par (ya está, `^10.13.0`).
- En `capacitor.config.json`: `plugins.FirebaseAuthentication` con `skipNativeAuth: true` y `providers: ["apple.com", "google.com"]`.
- Swift Package Manager según la documentación del plugin (opción `symlink` en `experimental.ios.spm` si la pide). `Package.swift` lo regenera `cap sync`; no se edita a mano.
- **REPORTA:** si el plugin necesita `FirebaseApp.configure()` o algo en `AppDelegate.swift`, y qué hace si falta `GoogleService-Info.plist` (¿se cierra la app al arrancar?).
- Ninguna otra dependencia nueva.

### 4.2 Iniciar sesión — `src/lib/cuenta.js` y un módulo nuevo para lo nativo

- `entrarConProveedor(cual)` conserva su forma de respuesta `{ ok, uid, email, nueva, motivo }`. Cambia **solo cómo consigue la credencial**:
  - **Web:** `signInWithPopup`, sin cambios.
  - **Nativo:** el plugin (`signInWithApple` / `signInWithGoogle`) → `OAuthProvider('apple.com').credential({ idToken, rawNonce })` o `GoogleAuthProvider.credential(idToken)` → `signInWithCredential(auth, credencial)`. `nueva` sale de `getAdditionalUserInfo(resultado).isNewUser`, como en web.
- Lo nativo vive en un módulo propio (p. ej. `src/lib/credencialNativa.js`) que importa el plugin **bajo demanda**, solo en nativo. En web y en las pruebas, el plugin nunca se carga. `cuenta.js` sigue sin importar `@capacitor/*` directamente para preguntar la plataforma (`esNativa()` de 21.1).
- **Cancelar la hoja de Apple o de Google no es un error** (`MOTIVOS.rechazado`, `claveDeError` devuelve `null`). **REPORTA** con qué código o mensaje rechaza el plugin al cancelar, en Apple y en Google, y cómo lo detectas de forma estable.
- `auth/account-exists-with-different-credential` → `MOTIVOS.otroMetodo` (nuevo) → `claveDeError` devuelve `'otroMetodo'`, en P7, en la vista de entrar y en Tu perfil.
- Apple pide solo el ámbito `email` (DP-21.2.5).

### 4.3 Qué proveedores hay — `proveedoresDisponibles`

- Web: `['google']`, sin cambios.
- Nativo: `['apple', 'google']`, en ese orden (DP-21.2.4).
- Actualiza los comentarios que dicen que en nativo no hay ninguno (`cuenta.js`, `firebase.js`, `Cuenta.jsx`, `FormularioEntrar.jsx`, `CLAUDE.md`).

### 4.4 Los botones — un componente compartido

- `components/shared/BotonProveedor.jsx` (nuevo): pinta el botón de Apple o de Google con su logo y su texto, **todo por props** (texto, proveedor, acción), como `FormularioEntrar`. Lo usan `Cuenta.jsx` (P7) y `FormularioEntrar` (vista de entrar y Tu perfil). Nada de copias.
- Apple: fondo negro con texto blanco, o al revés, según el contraste con el fondo de cada paleta; esquinas y altura como los demás botones; logo de Apple. Google: su logo de colores sobre blanco o superficie. Los logos van como SVG en el componente o en `src/assets/`; **no son texto**, así que no pasan por el copy.
- **REPORTA** antes de codificar: cómo quedan los dos botones en Mañana y en Noche (captura o descripción), qué contraste da `lint:contraste`, y si alguna combinación no llega a AAA.
- Altura mínima táctil y foco visible, como el resto. Sin `disabled`.

### 4.5 La sesión — `ArranqueProvisional.jsx` y `TuCuenta.jsx`

- `entrarConProveedor(cual)` en el contexto de sesión, que hace lo mismo que hoy `entrarConGoogle` con el proveedor que llega.
- `TuCuenta.jsx` pasa el proveedor tocado (§2, primera fila).
- **Salir (DP-21.2.8):** después de `signOut` del SDK de JavaScript, en nativo se cierra también la sesión del plugin (`FirebaseAuthentication.signOut()` o lo que corresponda), de modo que la próxima vez la hoja de Google vuelva a preguntar con qué cuenta. Si eso falla, no frena la salida. **REPORTA** qué cierra exactamente en Google y en Apple.
- La vista de entrar de SPEC_30 no cambia de lógica: ya recibe `proveedores` y `onProveedor`. Comprueba que C4 (cuenta nueva) funciona igual con Apple.

### 4.6 Recuperar el PIN — `src/diario/pin.js`

- Con proveedor `apple.com` o `google.com` **en nativo**: pide la credencial al plugin y usa `reauthenticateWithCredential`. En web, `reauthenticateWithPopup` como hoy.
- El método se decide por el de la sesión actual, no por `providerData[0]` (§2).
- Se mantiene la regla de su cabecera: **el PIN no depende de la capa de autenticación**; todo se carga bajo demanda dentro de la función.
- Cancelar la hoja en la recuperación no muestra error de verificación: vuelve al paso anterior.
- **Deja la reautenticación con proveedor en una función reutilizable** (en `lib/`, no en `diario/`): SPEC_24 la va a necesitar para borrar la cuenta.

### 4.7 iOS — `Info.plist`, entitlements, `project.pbxproj`, `.gitignore`, script

- **URL scheme** de Google: el `REVERSED_CLIENT_ID` del `GoogleService-Info.plist` en `CFBundleURLTypes` de `Info.plist`. No es secreto; se comitea.
- **Capacidad «Iniciar sesión con Apple»:** `ios/App/App/App.entitlements` con `com.apple.developer.applesignin = [Default]`, y `CODE_SIGN_ENTITLEMENTS` en el proyecto. El archivo de entitlements se comitea.
- **`GoogleService-Info.plist`:** referenciado en el proyecto, añadido a `.gitignore` (DP-21.2.3). `npm run ios:build` comprueba antes de compilar que existe y, si no, termina con un mensaje en español que dice qué falta y dónde copiarlo.
- **`project.pbxproj` y el Team:** los cambios del proyecto se hacen **editando el texto**, no desde Xcode, y se comitean **solo esos fragmentos**. El Team (`DEVELOPMENT_TEAM`) sigue siendo un cambio local que nunca entra. Antes de cada commit que toque el archivo: `git show :ios/App/App.xcodeproj/project.pbxproj | grep DEVELOPMENT_TEAM` debe salir vacío; la prueba de `appIos.test.js` lo exige también. Commits siempre por ruta, nunca `git add -A`, `git add .` ni `git commit -a`.
- `appIos.test.js` gana comprobaciones: el entitlement de Apple está, el URL scheme está, `GoogleService-Info.plist` está en `.gitignore`, el plugin tiene `skipNativeAuth: true`, y siguen sin estar `server.url` ni `allowNavigation`.

### 4.8 Copy — `src/copy/index.js`

Todo en las claves que ya existen (`CUENTA`, `copy.diario.onboarding`). **Se reutiliza** `p7.apple` («Continuar con Apple») y `p7.google`. Lo nuevo está en la §6. `lint:copy` lo revisa; **REPORTA** si algo choca con la voz.

### 4.9 Documentación

- `CLAUDE.md`: sección «Google y Apple en la app de iPhone (SPEC_21.2)»: el camino de la credencial (`skipNativeAuth` y por qué la sesión es la de JavaScript), qué hay en cada plataforma, el `GoogleService-Info.plist` fuera de git y qué pasa si falta, cómo comitear `project.pbxproj` sin el Team, el error de otro método, y lo que no se ha visto en un teléfono. Actualiza la cifra de pruebas de §13.
- `docs/specs/SPEC_24_BORRADO_CUENTA_EXPORTACION.md`: una nota al final, sin cambiar su alcance: (1) la reautenticación del borrado no puede ser solo con contraseña; usa la función de §4.6; (2) al borrar una cuenta que entró con Apple hay que **revocar su token de Apple**; **REPORTA** cómo se hace con el SDK de JavaScript y la credencial nativa (Firebase tiene `revokeAccessToken`; confirma qué dato pide y si el plugin lo devuelve), y si para eso hay que dar de alta la clave de Apple en Firebase (anexo, paso opcional).
- `docs/specs/SPEC_26_CAPACITOR_ANDROID.md`: una nota: en Android, Apple pide el flujo web con Service ID; el plugin elegido lo soporta.

---

## 5. Criterios de aceptación

### Automáticos (Claude Code)

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde.
2. `proveedoresDisponibles`: web `['google']`; nativo `['apple', 'google']`.
3. En web, `entrarConProveedor` sigue usando `signInWithPopup` y **nunca importa el plugin**.
4. En nativo (plugin simulado), Apple llega a `signInWithCredential` con `idToken` y `rawNonce`; Google, con `idToken`. `nueva` sale de `isNewUser`.
5. Cancelar en Apple y en Google da `rechazado` y ningún texto de error.
6. `account-exists-with-different-credential` da `otroMetodo`, en P7, en la vista de entrar y en Tu perfil.
7. Tu perfil entra con el proveedor tocado: el botón de Apple nunca llama a Google.
8. Salir en nativo cierra también la sesión del plugin, y si eso falla la salida sigue.
9. PIN: con Google o Apple en nativo, la recuperación usa `reauthenticateWithCredential`; el método sale de la sesión actual, no de `providerData[0]`.
10. SPEC_30 sin cambios en sus pruebas: C1–C8 siguen pasando; C4 también con Apple.
11. `BotonProveedor` no importa la sesión ni `lib/cuenta`; ningún control nuevo lleva `disabled`, `required` ni `aria-invalid`; ningún texto nuevo vive en un componente.
12. `appIos.test.js`: entitlement, URL scheme, `.gitignore`, `skipNativeAuth`, sin `server.url` ni `allowNavigation`, y sin `DEVELOPMENT_TEAM` en lo que se comitea.
13. `vite build --mode ios` y `npx cap sync ios` terminan sin errores; `npm run ios:build` sin `GoogleService-Info.plist` termina con el mensaje claro.
14. Al menos 25 pruebas nuevas.

### Manuales (la fundadora, en su iPhone, contra `strivo-fe04f`)

Prepara antes dos cuentas de prueba: **A**, de correo, con el onboarding terminado y dos o tres días escritos; **B**, de Google, igual. Nunca cuentas con datos reales. Recuerda que reinstalar desde Xcode borra lo local: así se consigue un «teléfono vacío».

**Google y Apple**

- **N1.** P7 → «Continuar con Apple» → la hoja de Apple → elegir **compartir** el correo → cuenta nueva → P8. Tu perfil muestra el correo.
- **N2.** Igual con **ocultar** el correo → Tu perfil dice que se entra con Apple, sin la dirección rara (DP-21.2.6).
- **N3.** Teléfono vacío → P1 → «Ya tengo una cuenta» → «Continuar con Google» con la cuenta B → Hoy con sus días, sin ninguna pregunta.
- **N4.** Cancelar la hoja de Apple y la de Google, en P7, en la vista de entrar y en Tu perfil: ningún mensaje de error.
- **N5.** Cerrar la app por completo y reabrir tras entrar con Apple y con Google: la sesión sigue.
- **N6.** Cerrar sesión (con la cola vacía) tras entrar con Google → la app vuelve a P1 → «Ya tengo una cuenta» → Google **vuelve a preguntar** con qué cuenta; **la anterior puede seguir en la lista** (DP-21.2.8).
- **N7.** Teléfono vacío → P1 → «Ya tengo una cuenta» → **Apple** con un Apple ID que nunca usó Strivo → aparece el aviso de cuenta nueva. Se lee y se entiende qué hacer. «Volver» → entrar con correo de la cuenta A → Hoy con sus días.
- **N8.** Mismo correo, dos métodos: con la cuenta A (si su correo es de Gmail), teléfono vacío → «Continuar con Google» con ese mismo Gmail. Anota qué pasa: ¿llega a sus días o ve el mensaje de otro método? Y después, ¿la contraseña de A sigue funcionando? Este caso depende de una regla de Firebase; **lo que salga se documenta**, y si se pierde la contraseña lo decidimos. **Depende también de la protección contra la enumeración de correos** (Authentication → Configuración): con ella activada, Firebase puede no devolver `account-exists-with-different-credential` y el mensaje de otro método no aparecería. Anota en qué estado estaba al probar.
- **N9.** Journal con PIN en una cuenta de Google → «Olvidé mi PIN» → «Verificar mi cuenta» → la hoja de Google → PIN nuevo; las entradas siguen. Lo mismo con Apple.
- **N10.** La vista de entrar, P7 y Tu perfil en Mañana y en Noche: los dos botones del mismo tamaño, Apple primero, nada se sale de la pantalla con el teclado abierto.

**Lo de SPEC_30 que falta por ver, ahora en el iPhone**

- **N11.** M1, M3, M4, M5 y M6 de SPEC_30 en la app de iPhone.
- **N12.** Cerrar sesión y volver a entrar en el mismo iPhone con correo (cuenta A): P1 con el enlace → entrar → Hoy con sus días.
- **N13.** Mandar la app a segundo plano durante el velo de restauración y volver: acaba en Hoy o en la vista de entrar con «Intentar de nuevo», nunca en P1 a medias.
- **N14.** Una cuenta con el onboarding a medias: retoma en su paso, no en P1; P7 se ve lista con «Continuar».
- **N15.** Tras entrar en el teléfono vacío: el Journal de una cuenta que tenía PIN abre sin candado (el PIN no sale del teléfono, es lo esperado), y Hoy muestra una frase aunque la preferencia de frases llegó sin definir.

**Regresión en web (Netlify o `localhost`):** Google sigue en P7, en la vista de entrar y en Tu perfil; Apple no aparece; M2 de SPEC_30 pasa.

---

## 6. Copy propuesto

Segunda persona, sin género, sin exclamaciones. **La redacción final es de la fundadora.**

| Clave | Texto |
|---|---|
| `CUENTA.error.otroMetodo` | Ese correo ya tiene una cuenta con otra forma de entrar. Entra como lo hiciste la primera vez. |
| `CUENTA.estado.conApple` | Entraste con Apple. Tu correo se queda oculto. |
| `copy.diario.onboarding.entrar.nueva` (se reescribe) | Esta cuenta es nueva y todavía no tiene nada guardado. Si antes entrabas de otra forma, vuelve y entra así para traer lo tuyo. |

`CUENTA.estado.conApple` se usa solo cuando el correo de la cuenta es de `privaterelay.appleid.com`; con correo compartido se sigue mostrando `{correo}`.

---

## 7. Reglas de arquitectura que roza

- **Nada se pierde:** DP-21.8 intacto. Entrar con un proveedor nunca pisa la nube (SPEC_19.2 y SPEC_30 sin cambios). C4 deja una cuenta vacía en Firebase: residuo aceptado hasta SPEC_24.
- **Nada bloquea:** la app sigue entera sin cuenta; cancelar no es un error; si el plugin falla, queda el correo.
- **Una sola sesión:** la del SDK de JavaScript. El plugin no abre otra (`skipNativeAuth: true`).
- **Firestore de solo escritura salvo `restaurar.js`:** sin lecturas nuevas.
- **El PIN no es una credencial** y su módulo no depende de la autenticación.
- **Cero strings, AAA, `prefers-reduced-motion`, silencio por defecto.**
- **Nada secreto en el repo:** ni el Team ni `GoogleService-Info.plist`.

---

## 8. Entrega

1. Trabaja en una rama local `revision-21-2` creada desde `strivo`. Commits pequeños y por tema (plugin y configuración / credencial nativa y errores / botones / sesión y Tu perfil / PIN / iOS / docs), cada uno con la línea `Co-Authored-By` del repo, **añadiendo archivos por ruta**.
2. **Sin push** hasta que la fundadora lo apruebe; cuando lo apruebe, `git push origin revision-21-2`. Nunca a `strivo`.
3. Reporte final: qué se hizo, desvíos encontrados, cada **REPORTA** con su respuesta, la salida de las siete validaciones, archivos y casos de prueba antes y después, y la lista N1–N15 para la fundadora.

---

## Anexo A — Lo que hace la fundadora antes de probar (una sola vez)

**En la consola de Firebase** (console.firebase.google.com, proyecto `strivo-fe04f`):

1. **Registrar la app de iPhone:** Configuración del proyecto → «Agregar app» → iOS. ID del paquete: `com.hellostrivo.strivo`. Descarga el `GoogleService-Info.plist`.
2. **Copiarlo** a `~/Developer/strivo/ios/App/App/GoogleService-Info.plist`. No se sube a GitHub; si cambias de Mac, cópialo junto con `.env.local`.
3. **Activar Apple:** Authentication → Método de acceso → Apple → Habilitar. Para la app de iPhone no hace falta llenar los campos de web; si la consola no te deja guardar sin ellos, avísanos antes de llenarlos.
4. **Comprobar** en Authentication → Configuración que está elegida «Una cuenta por dirección de correo electrónico».

**En Google Cloud** (console.cloud.google.com, proyecto `strivo-fe04f`, APIs y servicios → Credenciales):

5. Al registrar la app de iPhone aparece una clave nueva, normalmente llamada «iOS key». Ábrela y en *Restricciones de aplicaciones* elige «Apps para iOS» con `com.hellostrivo.strivo`. No toques la «Browser key» (anexo B de 21.1).

**En Xcode:**

6. En *Signing & Capabilities* debe aparecer «Sign in with Apple». Si Xcode dice que el perfil de aprovisionamiento no la incluye, deja marcado *Automatically manage signing* y vuelve a elegir tu Team: Xcode la da de alta en tu cuenta de desarrolladora.

**Opcional ahora, necesario para SPEC_24:**

7. En developer.apple.com → Certificates, Identifiers & Profiles → Keys: una clave con «Sign in with Apple», para que Firebase pueda revocar el acceso de Apple cuando alguien borre su cuenta. Se carga en Firebase (Apple → «Configuración del flujo de código OAuth»).
8. En la misma sección, «Sign in with Apple for Email Communication»: registrar `noreply@strivo-fe04f.firebaseapp.com` y `noreply@hellostrivo.com`, para que los correos de Strivo lleguen a quien ocultó su correo.
