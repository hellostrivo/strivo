# INSTRUCCIÓN SPEC_21.1 — Strivo dentro de una app de iPhone

**Fecha:** 12 oct 2026 (v2, tras los íconos v1) · **Commit de partida:** `1b33b24` (rama `strivo`) · **SPEC madre:** `docs/specs/SPEC_21_CAPACITOR_IOS.md`
**Partición (DP-21.6, decidida):** 21.1 = contenedor, áreas seguras, sesión, ícono y arranque. 21.2 = Google nativo + Iniciar sesión con Apple. Esta instrucción es **solo 21.1**.

---

## 0. Antes de escribir código

1. Lee `CLAUDE.md`, `docs/specs/SPEC_00B_CONVENCIONES_LANZAMIENTO.md`, `docs/specs/SPEC_21_CAPACITOR_IOS.md` y esta instrucción. **Donde esta instrucción y la SPEC madre difieran, manda esta instrucción** (sección 2 lista cada desvío).
2. Comprueba que HEAD es `1b33b24` o descendiente directo. Si no, reporta qué entró.
3. Entrega un **reporte previo** con:
   - Versión mayor de Capacitor que vas a instalar, y si el proyecto iOS usará Swift Package Manager o CocoaPods. Comprueba compatibilidad con la versión de Xcode y macOS de la fundadora (pregúntale `xcodebuild -version` y `sw_vers` si no los tienes).
   - **Inventario de APIs web** que usa el proyecto y su estado en WKWebView: IndexedDB, `crypto.subtle` (PBKDF2 del PIN), Web Audio (sonidos procedurales), Wake Lock, `matchMedia('(prefers-reduced-motion)')`, video del umbral (autoplay sin sonido, `playsinline`), `localStorage`. Marca cualquiera que pueda fallar.
   - Dónde se decide hoy la paleta Mañana/Noche (archivo y función) y cómo vas a colgar de ahí la barra de estado.
   - Lista de archivos que vas a crear y modificar.
4. **Espera la aprobación** de la fundadora. No instales nada antes.

---

## 1. Decisiones ya tomadas (no se reabren)

| DP | Decisión |
|---|---|
| DP-21.1 | Pantalla de arranque igual que el ícono: papel `#FBF8F4` con la «S» en su color original (carbón `#2B282F`, puntos `#776F79`). Combinación aprobada en el manual §3.5. Sustituye a la decisión anterior (`strivo-800`), que el manual no respaldaba. |
| DP-21.2 | iPad: se ejecuta en modo compatibilidad de iPhone. `TARGETED_DEVICE_FAMILY = 1`. |
| DP-21.3 | Identificador de bundle: **`com.hellostrivo.strivo`**. Irreversible tras publicar. |
| DP-21.4 | Ícono: **íconos v1** ya en el repo (`1b33b24`). La fuente de iOS es `assets/icon-only.png` (1024×1024, opaco, sin esquinas). Se usa tal cual: no se recompone, no se recolorea. Detalles en `docs/marca/iconos-v1/LEEME.md`. |
| DP-21.6 | SPEC_21 se parte en 21.1 y 21.2. |
| DP-21.7 | El service worker de la PWA se **apaga solo en el build nativo**. Netlify lo conserva. |
| DP-21.8 | Esquema y host del WebView: **los de fábrica de Capacitor** (`capacitor://localhost`). No se declaran en la config. |

**Por qué DP-21.8 importa.** El origen del WebView (`esquema://host`) es donde viven IndexedDB y `localStorage`. **Cambiarlo después de publicar borra en silencio todo lo escrito de cada persona en su teléfono**: rompe «nada se pierde». Es tan irreversible como el bundle ID. La SPEC madre proponía `ios.scheme: 'strivo'`; no se aplica.

---

## 2. Desvíos respecto a la SPEC madre (verificados contra el repo en `1b33b24`)

| SPEC madre dice | Repo real | Qué se hace en 21.1 |
|---|---|---|
| Revisar la `Content-Security-Policy` del `index.html` | No existe CSP ni en `index.html` ni en `netlify.toml` | Nada. No se crea una CSP en esta entrega. |
| Instalar `@capacitor/browser` para enlaces externos | No hay ni un `target="_blank"` ni `window.open` en `src/` | No se instala. Entra con la primera SPEC que añada un enlace externo (24 o 25). |
| `NSUserNotificationsUsageDescription` en `Info.plist` | Esa clave no existe en iOS: el diálogo de notificaciones no admite texto propio | No se declara. |
| `ios.contentInset: 'automatic'` | El repo ya usa `viewport-fit=cover` y `env(safe-area-inset-*)` (`globals.css` `--sab`, `.pb-safe`, `.pt-safe`; `respiracion.css`) | Usar `'never'`: con `'automatic'` iOS añade su propio margen, los `env()` valen 0 y el fondo no llega bajo el notch. Los criterios 13 y 14 lo comprueban. |
| `ios.scheme: 'strivo'` | — | No se aplica (DP-21.8): esquema de fábrica. |
| Añadir `capacitor://localhost` a los dominios autorizados de Firebase | Firebase solo admite dominios, no esquemas; y correo y contraseña no consulta esa lista | No aplica en 21.1. Entra en 21.2 con OAuth. |
| Apple se activa en esta SPEC (instrucciones del proyecto) | `PROVEEDORES_WEB = ['google']` en `src/lib/cuenta.js` | Pasa a 21.2. |
| — | `getAuth()` en `src/lib/firebase.js` carga el resolvedor de popup/redirect (un iframe de `authDomain`), que en WKWebView puede colgar `authStateReady()` | Ver §4.3. |
| Ícono 1024×1024 por producir (DP-21.4) y pantalla de arranque «a partir del símbolo» | `assets/icon-only.png`, `icon-foreground.png` e `icon-background.png` ya existen (`ff562e9`) | Solo se generan iOS y la pantalla de arranque. Los dos de Android no se tocan (son de SPEC_26). |
| Barra de estado: «estilo claro sobre PM, oscuro sobre AM» (decidir por la paleta) | La cabecera llega hasta el borde de arriba y su fondo es el contratono oscuro `#1D1833` en la Mañana y en las otras cuatro secciones; claro solo en la Noche de Hoy (`globals.css`, `.cromo-espacio`). Por la paleta, la hora saldría oscura sobre oscuro en casi toda la app | La barra sigue a la **capa del cromo**, no a la paleta: la tabla aprobada vive en `src/lib/barraEstado.js` (`textoDeBarra`) y se prueba fila por fila. Aprobado en el reporte previo y en `6210f7c`; verificado en iPhone (13 oct 2026). Ver §4.8 y criterio 13. |

---

## 3. Alcance

**Entra:**
- Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/app`) y `@capacitor/assets` como devDependency.
- Proyecto `ios/` generado y versionado.
- Detección de plataforma, persistencia de Auth nativa, service worker apagado en nativo.
- Ícono (íconos v1) y pantalla de arranque.
- Barra de estado sincronizada con Mañana/Noche.
- `Info.plist`, script de build, sección nueva en `CLAUDE.md`.

**No entra:** Google nativo, Iniciar sesión con Apple, cualquier plugin funcional (notificaciones, biometría, háptica, audio en segundo plano), Android, CI, App Store Connect, cambios de UI fuera de áreas seguras y `NavStrivo`, el favicon y la carpeta `public/`.

---

## 4. Cambios, uno por uno

### 4.1 Detección de plataforma
**Ubicación:** `src/lib/plataforma.js` (nuevo).
**Actual:** el código no distingue web de nativo.
**Esperado:** un único punto, `esNativa()`, que envuelve `Capacitor.isNativePlatform()`. Nada más en `src/` importa `@capacitor/core` directamente para preguntar la plataforma. Seguro si `@capacitor/core` no está disponible (pruebas, web): devuelve `false`.

### 4.2 Proveedores de cuenta según plataforma
**Ubicación:** `src/lib/cuenta.js`, `src/components/onboarding/Cuenta.jsx`, `src/components/perfil/TuCuenta.jsx`.
**Actual:** P7 y Tu perfil pintan los botones de `PROVEEDORES_WEB = ['google']`, que usan `signInWithPopup`.
**Esperado:** en nativo, la lista de proveedores sociales está **vacía**: solo correo y contraseña. En web, sin cambios. Implementación sugerida: una función `proveedoresDisponibles()` que devuelve `PROVEEDORES_WEB` en web y `[]` en nativo, y los dos componentes leen de ella. Un botón que no puede funcionar es peor que su ausencia (mismo criterio que DP-19.4). Si al quedar la lista vacía algún separador o texto («o entra con…») queda huérfano, también se oculta; repórtalo.
**Regla que roza:** «nada bloquea»: la app sigue entera sin cuenta y con correo.

### 4.3 Firebase Auth en nativo
**Ubicación:** `src/lib/firebase.js`. Revisa también el comentario de `leerSesionGuardada` en `src/lib/sesion.js` («No se fija persistencia»), que deja de ser cierto en nativo y hay que actualizar.
**Actual:** `auth = getAuth(app)`.
**Esperado:**
- Web: sin cambios (`getAuth`).
- Nativo: `initializeAuth(app, { persistence: indexedDBLocalPersistence })` **sin** `popupRedirectResolver`.
- La elección vive en una función pura testeable (p. ej. `opcionesDeAuth(esNativa)`), no en un `if` suelto.
**Criterio:** la sesión sobrevive a cerrar la app por completo y reabrirla (criterio 3).
**Regla que roza:** «Firestore de solo escritura»: no se toca nada de Firestore.

### 4.4 Service worker apagado en nativo (DP-21.7)
**Ubicación:** `vite.config.js`, `package.json`.
**Actual:** `VitePWA({ registerType: 'autoUpdate', … })` siempre.
**Esperado:** `defineConfig(({ mode }) => …)` y `VitePWA({ disable: mode === 'ios', … })`. El build nativo usa `vite build --mode ios`. Verifica que `dist/` del modo `ios` no contiene `sw.js`, `registerSW.js` ni `manifest.webmanifest`, y que el build normal sí.
**Por qué:** dentro de la app los archivos ya vienen empaquetados; un service worker sobra y puede servir una versión vieja tras una actualización.

### 4.5 Configuración de Capacitor
**Ubicación:** `capacitor.config.json` (nuevo; JSON para no añadir tooling de TypeScript).
**Esperado:**
- `appId: "com.hellostrivo.strivo"`, `appName: "Strivo"`, `webDir: "dist"`.
- **Sin `server.url`.** Los activos van embebidos: es la defensa frente a la Guideline 4.2 y no se negocia.
- Sin `server.allowNavigation`.
- `ios.contentInset: "never"`.
- Esquema y host: según DP-21.8 (propuesta: los de fábrica, sin declararlos).
- `plugins.SplashScreen`: `launchAutoHide: false`, `backgroundColor: "#FBF8F4"`, sin spinner.

### 4.6 Proyecto iOS e `Info.plist`
**Ubicación:** `ios/` (nuevo, versionado). Añade a `.gitignore` lo que Capacitor recomienda excluir (`ios/App/Pods`, `ios/App/build`, `ios/DerivedData`, `*.xcuserstate`, `ios/App/App/public` si se regenera en cada sync, etc.). Reporta la lista.
**`Info.plist`:**
- `CFBundleDisplayName`: Strivo.
- `CFBundleDevelopmentRegion`: `es` (los diálogos del sistema salen en español).
- `CFBundleShortVersionString`: 1.0.0 · `CFBundleVersion`: 1.
- Orientación: solo vertical (`UISupportedInterfaceOrientations` = `UIInterfaceOrientationPortrait`).
- `UIBackgroundModes: [audio]`. Se declara ahora para no tocar el plist dos veces; si DP-23.3 decide no tener audio en segundo plano, **se retira antes de App Review** (declararlo sin usarlo es motivo de rechazo).
- `NSFaceIDUsageDescription`: «Para abrir tu Journal sin escribir el PIN.»
- `ITSAppUsesNonExemptEncryption: false`.
- `TARGETED_DEVICE_FAMILY = 1` en el proyecto (DP-21.2).
- Versión mínima de iOS: la de fábrica de la versión de Capacitor elegida. Repórtala.

**Firma:** el proyecto se deja con *Automatically manage signing* activado y **sin** equipo fijado en el commit. El equipo lo elige la fundadora en Xcode (anexo A); no hay que comitear su Team ID.

### 4.7 Ícono y pantalla de arranque
**Ubicación:** `assets/` (fuente para `@capacitor/assets`), generado dentro de `ios/`.
**Actual:** `assets/icon-only.png` (íconos v1) existe; no hay fuente de pantalla de arranque.
**Esperado:**
- **Ícono:** `assets/icon-only.png` tal cual. No se modifica ni se sustituye.
- **Pantalla de arranque:** un script reproducible (`scripts/`) compone, a partir de `docs/marca/logotipo-v1/STRIVO_simbolo_original.svg` **sin alterar trazos ni color**, `assets/splash.png` y `assets/splash-dark.png`: 2732×2732, fondo papel `#FBF8F4`, la «S» centrada. **Los dos iguales**: el modo oscuro del sistema no cambia el arranque (DP-21.1). Tamaño del símbolo: el que respete el mínimo y el espacio libre de `docs/marca/logotipo-v1/LEEME.md`; repórtalo en el reporte previo con una captura o el PNG.
- `npx @capacitor/assets generate --ios` genera los tamaños de iOS. No ejecutes la variante de Android.
- Añade una línea a `docs/marca/iconos-v1/LEEME.md`: dónde viven las fuentes de la pantalla de arranque y que se generan con el script de `scripts/`.
- Al primer render de la app se llama `SplashScreen.hide()` (solo en nativo), de modo que el arranque del sistema da paso a la transición de entrada existente sin corte ni parpadeo blanco. Con `prefers-reduced-motion`, sin fundido.

### 4.8 Barra de estado
**Ubicación:** donde se decide la paleta Mañana/Noche (lo identificas en el reporte previo), más un módulo pequeño en `src/lib/` que envuelva `@capacitor/status-bar`.
**Esperado:** en nativo, el color del texto de la barra lo decide **la capa que hay debajo de ella, no la paleta** (ver §2): el cromo cuando está —contratono oscuro, texto claro, en la Mañana y en Journal, Respiración, Historial y Tu perfil; cromo claro, texto oscuro, en la Noche de Hoy— y el fondo de la pantalla cuando el cromo se oculta o algo se pinta encima (arranque y umbral, onboarding, presentación, escritura, cierres, sesión de respiración, confirmación). Se actualiza cada vez que cambia el conmutador, la franja horaria o la capa. En web no hace nada. La tabla completa y la función pura que la aplica (`textoDeBarra`) viven en `src/lib/barraEstado.js`, probadas fila por fila. La barra se superpone al contenido (`overlay`), y las áreas seguras evitan que algo quede debajo.
**Regla que roza:** ninguna; sin texto visible.

### 4.9 Áreas seguras
**Ubicación:** contenedor raíz y `NavStrivo`. Revisa también el umbral con video, el onboarding, Respiración y las hojas modales.
**Esperado:** nada queda bajo la Dynamic Island, el notch ni el indicador de inicio, y los fondos sí llegan hasta el borde. Usa los tokens existentes (`--sab`, `.pb-safe`, `.pt-safe`) antes de crear otros. `.alto-pantalla` ya hace `100vh` → `100dvh`; no lo cambies.
**Regla:** `git diff --stat` no muestra cambios en componentes de pantalla salvo áreas seguras, `NavStrivo` y los dos componentes de §4.2.

### 4.10 Script y documentación
**Ubicación:** `package.json`, `CLAUDE.md`.
- `"ios:build": "vite build --mode ios && cap sync ios"`.
- `"ios:abrir": "cap open ios"`.
- Nueva sección en `CLAUDE.md`: «App iOS (SPEC_21.1)», con: cómo construir y abrir, qué no se toca nunca (bundle ID, esquema y host del WebView, y por qué), que el build nativo no lleva service worker, que en nativo Auth usa `initializeAuth` y que Google y Apple llegan en 21.2.

---

## 5. Criterios de aceptación

**Automáticos (Claude Code):**
1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde.
2. Al menos 6 pruebas nuevas: `esNativa()` con y sin Capacitor; `opcionesDeAuth` en web y nativo; `proveedoresDisponibles()` en web y nativo; paleta → estilo de barra; `capacitor.config.json` (appId exacto, sin `server.url`, sin `allowNavigation`); la configuración de Vite desactiva el PWA solo en modo `ios`.
3. `npm run build` produce `sw.js`; `vite build --mode ios` no.
4. `npx cap sync ios` termina sin errores.
5. La PWA en web no cambia de comportamiento: Google sigue apareciendo en P7 y en Tu perfil.

**Manuales (la fundadora, en su iPhone con Dynamic Island y en el simulador de Xcode):**
6. Compila y corre en el iPhone físico, firmada con su equipo. El ícono de la pantalla de inicio es el de íconos v1 (la «S» sobre papel), sin bordes negros ni blancos.
7. Arranque: la «S» sobre papel da paso a la transición de entrada sin destello blanco ni salto brusco, tanto de mañana como de noche.
8. Modo avión, primera apertura tras instalar: la app abre, muestra el umbral y llega a Hoy.
9. Crear cuenta con correo, escribir una mañana, cerrar la app por completo (deslizar hacia arriba) y reabrir: sigue con sesión, la mañana está y Tu perfil dice «Todo guardado».
10. Journal: crear PIN, salir, volver a entrar: pide el PIN y lo acepta, igual que en web.
11. Respiración: corre en primer plano con sonido activado; al bloquear la pantalla no hay error visible al volver.
12. P7 y Tu perfil: no aparece el botón de Google; no queda ningún separador huérfano.
13. Nada queda bajo la Dynamic Island ni el indicador de inicio en Hoy (Mañana y Noche), Journal, Respiración, Historial, Tu perfil, el onboarding y el umbral. La hora y la batería se leen en todas esas pantallas: el tono de la barra sigue a la capa del cromo que hay debajo (tabla en `src/lib/barraEstado.js`), y cambia con el conmutador de Hoy porque cambia el cromo.
14. Lo mismo que el 13 en el **simulador de Xcode con un iPhone con notch** (p. ej. iPhone 13). Sustituye al segundo iPhone físico que pedía la SPEC madre.
15. Aprovechando la build: «Cómo son tus días» en Tu perfil sin desbordamiento, y el buen deseo al cerrar la mañana se ve bien.

---

## 6. Reglas de arquitectura que roza

- **Nada se pierde:** DP-21.8 (origen del WebView) y la persistencia de Auth (§4.3).
- **Nada bloquea:** ocultar Google en nativo en vez de dejar un botón roto (§4.2).
- **Firestore de solo escritura:** no se toca; verificar que `restaurar.js` sigue siendo el único lector.
- **Cero strings hardcodeados:** no se añade texto visible en `src/`. El único texto nuevo vive en `Info.plist`, fuera del alcance de `lint:copy`.
- **Contraste AAA / `prefers-reduced-motion`:** arranque con carbón sobre papel (13,71:1; puntos 4,58:1, por encima del 3:1 de elemento gráfico) y `SplashScreen.hide()` sin fundido con movimiento reducido.
- **Silencio por defecto:** no cambia.

---

## 7. Entrega

1. Commits pequeños y con mensaje claro (plataforma y Auth / service worker / Capacitor e iOS / ícono y arranque / barra de estado y áreas seguras / docs). Cada commit termina con la línea `Co-Authored-By` que usa el repo.
2. `git push origin strivo:revision-21-1` para la revisión de código. No hagas push a `strivo`.
3. Reporte final: qué se hizo, desvíos encontrados durante la implementación, salida de las siete validaciones, número de archivos de prueba y casos, y la lista de criterios manuales (6–15) para la fundadora.

---

## Anexo A — Primera ejecución en tu iPhone (para la fundadora)

Esto lo haces tú, después de que la revisión de código esté aprobada. Una sola vez la primera; después basta con el paso 6.

1. **En la Mac**, en la terminal, dentro de `~/Desktop/STRIVO/strivo`: `git fetch && git checkout revision-21-1`, luego `npm install`, luego `npm run ios:build`, luego `npm run ios:abrir`. Se abre Xcode.
2. **Cuenta en Xcode:** Xcode → Settings → Accounts → «+» → Apple ID → entra con el Apple ID de tu cuenta de desarrollador.
3. **Firma:** en la columna izquierda, clic en «App» (el ícono azul de arriba) → pestaña *Signing & Capabilities* → en *Team* elige tu nombre (no el que diga «Personal Team»). Deja marcado *Automatically manage signing*. El *Bundle Identifier* debe decir `com.hellostrivo.strivo`.
4. **Modo desarrollador en el iPhone:** conecta el iPhone con cable y acepta «Confiar en esta computadora». Luego en el iPhone: Ajustes → Privacidad y seguridad → Modo de desarrollador → activar. El iPhone se reinicia y te pide confirmar.
5. **Elegir el destino:** arriba en Xcode, junto al nombre «App», elige tu iPhone en la lista.
6. **Ejecutar:** botón ▶ (o Cmd+R). La primera vez puede pedir la contraseña de tu Mac para el llavero: elige «Permitir siempre». Si el iPhone dice que el desarrollador no es de confianza: Ajustes → General → VPN y gestión de dispositivos → tu nombre → Confiar.
7. **Simulador con notch (criterio 14):** en el mismo menú del paso 5, elige un simulador «iPhone 13» y pulsa ▶. Si no aparece, Xcode → Settings → Components para descargar el simulador.

Si algo falla, copia el mensaje de error tal cual y lo vemos.

## Anexo B — Una comprobación en Google Cloud (para la fundadora, 2 minutos)

Si la clave de API de Firebase tiene restricción por sitio web, la app nativa no podrá hablar con Firebase. Comprueba en console.cloud.google.com → proyecto `strivo-fe04f` → APIs y servicios → Credenciales → la clave «Browser key» o «API key»: en *Restricciones de aplicaciones* debe decir «Ninguna». Si dice «Sitios web», avísame antes de la prueba del criterio 9; no la cambies sin hablarlo.
