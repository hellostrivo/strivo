# INSTRUCCIÓN D-21.11 — Al abrir la app, papel desde el primer instante

**Para:** Claude Code
**Fecha:** 12 nov 2026 · **Versión:** 1.2 (reporte previo aprobado el 12 nov 2026: §9. **Donde §9 y el resto difieran, manda §9**. Cerrada el 12 nov 2026 sin pruebas manuales: §10)
**Rama de partida:** `strivo` en `59a7147`, la fusión de SPEC_22. Compruébalo en §0.
**Gobierna:** esta instrucción + `docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md` (sobre todo la fila D-21.11 de su §2) + `docs/specs/INSTRUCCION_SPEC_21_1_ADENDA_ARRANQUE_Y_UMBRAL.md` + `SPEC_00B` + `CLAUDE.md`. **Donde esta instrucción y otra difieran, manda esta.**
**Por qué existe:** al abrir Strivo desde el ícono, la ventana que crece pasa por negro antes de llegar al papel. Medido el 14 oct con grabación a 60 fps: en frío, ~500 ms de negro puro a pantalla completa y luego una subida al papel de ~320 ms; en el segundo arranque, ~80 ms de oscuro. Pasa igual de día que de noche, y en modo claro y en modo oscuro.
**Por qué ahora:** es la deuda que se cierra **antes de cualquier build para testers externos**. Es lo primero que ve cualquier persona, cada vez que abre la app.

---

## 0. Antes de escribir una sola línea

1. Lee `CLAUDE.md` (sección «App iOS (SPEC_21.1)»: la pantalla de arranque, D-21.9 y «Lo que no se toca nunca»), la fila D-21.11 de §2 de `docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md`, la adenda `INSTRUCCION_SPEC_21_1_ADENDA_ARRANQUE_Y_UMBRAL.md` §1 (su causa quedó refutada) y esta instrucción entera.
2. Comprueba que HEAD de `strivo` es `59a7147` o lo contiene (`git merge-base --is-ancestor 59a7147 HEAD`). Si no, **para**.
3. **Limpieza previa:** si existe el worktree `~/Developer/strivo-22` (SPEC_22, ya fusionada), quítalo y borra la rama local `revision-22` (`git worktree list`; `git worktree remove --force ../strivo-22`, porque lleva el Team local en el `project.pbxproj`; `git branch -d revision-22`, que solo borra si ya está fusionada). Reporta lo que había.
4. Monta el worktree según §8 (paso 1 y 2) **antes** de investigar: el reporte previo pide compilar y grabar en el simulador.
5. Inspecciona: `ios/App/App/Base.lproj/LaunchScreen.storyboard`; `ios/App/App/Assets.xcassets/` entero (cada imagen: píxeles, escala declarada, peso en disco y memoria al decodificarse); `assets/` (`splash.png`, `splash-dark.png`, los tres de ícono); `scripts/componer-arranque.js` y los scripts `ios:arranque` e `ios:recursos` de `package.json`; `capacitor.config.json` (`plugins.SplashScreen`); `src/lib/pantallaArranque.js` y su prueba; `src/main.jsx`; `ios/App/App/Info.plist`; `ios/App/App/SceneDelegate.swift` y `AppDelegate.swift`; `src/lib/__tests__/appIos.test.js` (el `describe` del storyboard y el comentario de D-21.11, que hoy está encima del `describe` de `App.entitlements`); `docs/marca/iconos-v1/LEEME.md` y `docs/marca/logotipo-v1/LEEME.md`.
6. Lee el código Swift de `@capacitor/ios` 8.5.3 (`CAPBridgeViewController.swift`, `WebViewDelegationHandler.swift`) y de `@capacitor/splash-screen` 8.0.2 (`SplashScreen.swift`, `SplashScreenPlugin.swift`) en `node_modules`. Y el de `@capacitor/assets@3.0.5` para lo que pide DP-21.11.3: **léelo, no ejecutes `ios:recursos` para averiguarlo.**
7. Entrega un **reporte previo** con todos los puntos marcados **REPORTA**, la lista de archivos que vas a crear, tocar y borrar, y **el storyboard nuevo completo** tal como quedaría.
8. **Espera la aprobación de la fundadora.** No cambies nada del repo antes. Las pruebas en el simulador del reporte previo se hacen con la build de `strivo` tal cual y, si hace falta comparar, con cambios locales que se descartan antes de reportar.

---

## 1. Decisiones

### 1.1 Ya tomadas, no se reabren

| Origen | Decisión |
|---|---|
| DP-21.3 / DP-21.8 / DP-17B.2 | **El identificador (`com.hellostrivo.strivo`), el esquema y host del WebView (`capacitor://localhost`, los de fábrica) y la base SQLite (`Library/Strivo/strivo.sqlite`) no se tocan.** Nada de `server`, `scheme`, `hostname` ni `allowNavigation` en `capacitor.config.json`. |
| DP-21.1 | **La pantalla de arranque es papel `#FBF8F4` con la «S» en su color original** (carbón `#2B282F`, puntos `#776F79`), **igual de día que de noche, y no cambia con el modo oscuro del sistema.** Sin texto. |
| DP-21.4 / manual de marca | **El símbolo no se redibuja ni se recolorea.** Sale de `docs/marca/logotipo-v1/STRIVO_simbolo_original.svg` rasterizado tal cual, por un script reproducible. |
| D-21.9 (13 oct 2026) | **La retirada no cambia:** `planDeRetirada` (300 ms de papel quieto, fundido de 320 ms, sin fundido con «reducir movimiento»), el techo de 2 s, la guarda de una sola vez y el segundo intento sin fundido. `ESPERA_ANTES_DE_RETIRAR` se queda en 300 salvo que M4 diga lo contrario (DP-21.11.5). `launchAutoHide: false` se queda. |
| Fundadora, 12 nov 2026 | **La web sigue igual.** Ni un archivo de `src/` (salvo pruebas) ni de `public/` cambia. |
| SPEC_21.1 | **El Team de firma vive en `project.pbxproj` como cambio local y no se comitea nunca.** Esta tarea **no toca `project.pbxproj`**: el catálogo `Assets.xcassets` y el storyboard ya están en el proyecto, y una carpeta `.imageset` nueva dentro del catálogo no necesita registrarse. Si Xcode propone «Update to recommended settings», no se acepta. |
| SPEC_17B / SPEC_22 | **Pruebas manuales solo con lo que se ve en pantalla.** Sin consola de Safari, sin Inspector web y sin la consola de Xcode. Lo que haga falta medir, se mide en una **grabación de pantalla del iPhone**, que mide Claude (en la conversación del proyecto) o Claude Code con `ffmpeg`. |
| SPEC_17B | **Tras borrar la app, la primera apertura de una compilación de Xcode necesita internet** para verificar el certificado de desarrolladora. Ninguna prueba pide abrirla sin red. |
| Gmail (14 oct) | **Es de Strivo**: en el mismo teléfono, Gmail abre limpio. Caché y modo oscuro, descartados. |

### 1.2 Nuevas, para confirmar en el reporte previo

| DP | Propuesta |
|---|---|
| **DP-21.11.1 · Cómo es la pantalla de arranque** | **Una vista de papel con la «S» centrada y de tamaño fijo, en vez de una imagen de 2732×2732 a sangre.** La vista raíz del storyboard pasa a ser un `UIView` con fondo papel `#FBF8F4` fijo en sRGB (el mismo color de hoy), y dentro un solo `UIImageView` con `contentMode="scaleAspectFit"`, centrado en horizontal y en vertical **respecto a la vista entera, no al área segura** (así queda donde está hoy), con ancho y alto fijos (DP-21.11.2). La imagen es un **conjunto nuevo, `SimboloArranque.imageset`**, con PNG de 1x, 2x y 3x del tamaño justo, **fondo transparente** (sobre papel, sin recuadro que pueda no empatar) y **sin variante oscura**. Un nombre nuevo, y no `Splash`, para que `@capacitor/assets` no pueda pisarlo nunca (DP-21.11.3). **El plugin de Capacitor vuelve a montar este mismo storyboard encima del WebView** (`SplashScreen.buildViews`), así que su capa también queda ligera y con la «S» idéntica. **REPORTA** el storyboard completo y si el plugin respeta las restricciones de Auto Layout al darle el tamaño de la ventana (`updateSplashImageBounds`). |
| **DP-21.11.2 · De qué tamaño es la «S»** | **El mismo que se ve hoy en el iPhone 17 de la fundadora (402×874 pt), y fijo en todos los iPhone.** Hoy el encuadre del símbolo mide `ALTO_SIMBOLO` / `LIENZO` × 874 = 385 / 2732 × 874 ≈ **123 pt de alto** y, con la proporción del `viewBox` del SVG (513,83 × 655,27), **≈ 97 pt de ancho**; la «S» visible, ~105 pt. Motivo: el relevo al umbral ya está medido con esa «S» (D-21.9, D-21.10) y no se quiere volver a medir. Efecto aceptado: en un SE la «S» pasa de ~80 a ~105 pt y en un Pro Max baja de ~112 a ~105. Alternativa: una «S» más chica, por ejemplo de 80 pt; la decidiría la fundadora viendo las dos en el simulador. **REPORTA** los números exactos (pt y px por escala, redondeados sin deformar el símbolo) y una captura del simulador iPhone 17 antes y después, a la misma escala, para que se vea que la «S» no se movió ni cambió de tamaño. |
| **DP-21.11.3 · Qué pasa con las fuentes de 2732 y con `ios:recursos`** | **Salen.** Se borran `Splash.imageset` y `assets/splash.png` y `assets/splash-dark.png`. `scripts/componer-arranque.js` (`npm run ios:arranque`) pasa a escribir directamente los tres PNG y el `Contents.json` de `SimboloArranque.imageset`, sin pasar por `@capacitor/assets`. `npm run ios:recursos` queda **solo para el ícono**. Android no los necesita: SPEC_26 usa la API de arranque de Android 12+, que pinta el ícono, y el historial de git los conserva. **REPORTA**, leyendo el código de `@capacitor/assets@3.0.5`: si sin `assets/splash*.png` genera el ícono de iOS sin error y sin crear ningún `Splash.imageset`, o qué opción hace falta. Si no se puede garantizar, propone la salida más pequeña (por ejemplo, quitar `ios:recursos` y documentar el comando del ícono). |
| **DP-21.11.4 · Lo que no se toca en esta primera vuelta** | **Ni Swift, ni `capacitor.config.json`, ni `Info.plist`, ni `project.pbxproj`, ni `src/`.** El arreglo es el storyboard, el catálogo, el script y las pruebas. **Plan B, solo si M1 no pasa** (§5.3): el fondo de la ventana de la app (`SceneDelegate`, hoy sin color: iOS la pinta negra en los dos modos) pasaría a papel. Es código nativo y **necesita una decisión aparte**; no lo adelantes. **REPORTA** tu lectura del código de Capacitor: si hay algún cuadro en que la ventana de la app quede a la vista sin la capa del plugin encima (el plugin la añade con `DispatchQueue.main.async` desde `load()`, y durante la carga inicial el WebView es transparente, `isOpaque = false`). |
| **DP-21.11.5 · El relevo de D-21.9** | **No cambia.** Si la pantalla de arranque del sistema ahora sí se ve, iOS sigue destapando la ventana en el mismo momento y la espera de 300 ms sigue cayendo sobre papel. **M4 lo comprueba de noche** (mayor salto por cuadro de ±15 o menos, como el 13 y el 14 oct). Si falla, se recalibra en una adenda; no se toca aquí. |
| **DP-21.11.6 · Cómo se sabe que quedó** | **Con grabaciones de pantalla del iPhone medidas cuadro por cuadro**, porque a simple vista la fundadora no lo percibe. Criterios en §5.2. **Primero en el simulador** (reporte previo y criterio 9), donde Claude Code puede grabar con `xcrun simctl io booted recordVideo` y medir con `ffmpeg` sin molestar a nadie. **REPORTA** si el simulador reproduce el negro con la build de hoy: si sí, la comparación antes y después ya es evidencia; si no, el iPhone decide. |

Criterio de producto de la fundadora, que manda sobre todo lo anterior: **al tocar el ícono, lo que crece es la «S» sobre papel, como si el ícono se abriera; nunca negro ni gris, de día ni de noche, en modo claro ni en modo oscuro.**

---

## 2. Lo que ya está verificado en el código (12 nov 2026, sobre `59a7147`)

### 2.1 La pantalla de arranque hoy

- `LaunchScreen.storyboard`: la vista raíz del controlador es directamente un `imageView` a pantalla completa, `image="Splash"`, `contentMode="scaleAspectFill"`, con fondo papel fijo en sRGB desde `3e00f61`. El recurso declara `<image name="Splash" width="1366" height="1366"/>`.
- `Splash.imageset`: seis archivos (1x, 2x y 3x, cada uno con su variante oscura), **todos la misma imagen de 2732×2732 px**, RGB opaco, 117 KB en disco cada uno. **Decodificada, cada una ocupa unos 30 MB en memoria** (2732 × 2732 × 4). En 3x, iOS la trata como una imagen de ~911 pt de lado.
- `assets/splash.png` y `assets/splash-dark.png`: las fuentes, idénticas, de 2732×2732. Las compone `scripts/componer-arranque.js` (`ALTO_SIMBOLO = 385` sobre `LIENZO = 2732`) y las reparte `@capacitor/assets@3.0.5` (`npm run ios:recursos`), que según la fila D-21.11 escribe PNG y `Contents.json` en el catálogo y **no reescribe el storyboard**.
- `AppIcon.appiconset`: un solo PNG de 1024×1024. No cambia.

### 2.2 Quién pinta qué al abrir

- **iOS** pinta el storyboard (`UILaunchStoryboardName = LaunchScreen`) mientras agranda el ícono, **antes de que corra una sola línea de la app**. Es lo que se ve negro.
- **El plugin `@capacitor/splash-screen` 8.0.2**, en su `load()`, vuelve a montar el mismo storyboard (`instantiateInitialViewController`) y lo pone encima de la vista del puente, con fondo papel (`backgroundColor` de la configuración). Se queda hasta que `pantallaArranque.js` llama a `hide()`.
- **`@capacitor/ios` 8.5.3**: sin `backgroundColor` en la configuración, el WebView tiene `systemBackground` (blanco en claro, negro en oscuro), y **durante la carga inicial es transparente** (`isOpaque = false`).
- **`SceneDelegate.swift`** crea la ventana sin color de fondo. Una `UIWindow` sin color se ve **negra en los dos modos**. Hoy debería quedar siempre tapada; es el plan B de DP-21.11.4.

**Por qué la hipótesis principal es la imagen:** la ventana que crece desde el ícono es negra **aunque el fondo del storyboard ya es papel**. Si iOS solo tardara en pintar la imagen, se vería el papel del fondo. Que se vea negro apunta a que iOS no logra pintar la pantalla de arranque entera. Lo más pesado que tiene es una imagen de 30 MB.

### 2.3 Lo que vigilan hoy las pruebas

- `appIos.test.js`, `describe('ios/App/App/Base.lproj/LaunchScreen.storyboard')`: fondo papel en sRGB, sin `systemBackgroundColor` y **«la imagen sigue siendo Splash, a sangre»**. Esa última se reescribe (§4).
- El comentario de D-21.11 de ese archivo **está encima del `describe` de `App.entitlements`** y **da como causa el modo oscuro, ya refutada**. Se corrige y se mueve a su sitio.
- `pantallaArranque.test.js`: la retirada de D-21.9. No cambia lo que comprueba.
- **`CLAUDE.md` no menciona D-21.11 en ningún sitio.** Solo está en la instrucción 21.1 y en su adenda.

---

## 3. Alcance

**Entra:** el storyboard; `SimboloArranque.imageset`; borrar `Splash.imageset` y `assets/splash*.png`; `scripts/componer-arranque.js` y los dos scripts de `package.json`; pruebas; la medición en el simulador; `CLAUDE.md`; `docs/marca/iconos-v1/LEEME.md`; la fila D-21.11 de la instrucción 21.1; esta instrucción en `docs/specs/`.

**No entra:** código Swift (salvo que se apruebe el plan B); `capacitor.config.json`; `Info.plist`; `project.pbxproj`; `src/` (salvo pruebas); el ícono; la retirada de D-21.9; el velo nocturno; el umbral y su video; D-21.13; DP-21.5; Android.

---

## 4. Cambios esperados (a confirmar en el reporte previo)

- **`ios/App/App/Base.lproj/LaunchScreen.storyboard`:** según DP-21.11.1 y DP-21.11.2. Sin colores del sistema, sin textos, sin otras vistas. Que siga abriendo en Xcode sin avisos.
- **`ios/App/App/Assets.xcassets/SimboloArranque.imageset/`** (nuevo): `Contents.json` con 1x, 2x y 3x, `idiom: universal`, **sin `appearances`**; tres PNG con canal alfa, del tamaño exacto por escala.
- **`ios/App/App/Assets.xcassets/Splash.imageset/`**: se borra entero.
- **`assets/splash.png`, `assets/splash-dark.png`**: se borran (DP-21.11.3).
- **`scripts/componer-arranque.js`:** escribe el imageset nuevo. Las medidas en pt salen de constantes con su porqué (el cálculo de DP-21.11.2) y la escala se aplica por archivo; rasterizar grande y reducir con `lanczos3`, como hoy. **Reproducible:** correrlo dos veces deja `git status` limpio.
- **`package.json`:** `ios:arranque` sigue llamando al script; `ios:recursos` según lo que salga del REPORTA de DP-21.11.3.
- **`src/lib/__tests__/appIos.test.js`:** el `describe` del storyboard se reescribe (§5.1, criterio 2), con un `describe` nuevo para el catálogo (criterio 3). El comentario de D-21.11 se corrige (causa: la imagen de 2732 en todas las escalas; lo que se descartó y por qué) y se pone encima del `describe` que le toca.
- **`CLAUDE.md`:** en «App iOS (SPEC_21.1)», el bloque de comandos (`ios:arranque` escribe el imageset; `ios:recursos` solo el ícono) y el párrafo de la pantalla de arranque, con un apartado nuevo **«Por qué la pantalla de arranque es ligera (D-21.11, nov 2026)»**: qué se vio, la causa, el arreglo, y la regla «**ninguna imagen del arranque a sangre ni más grande de lo que se pinta**». Los recuentos de §13.
- **`docs/marca/iconos-v1/LEEME.md`:** la línea de la pantalla de arranque, con las fuentes nuevas.
- **`docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md`:** en la fila D-21.11 de §2, el estado final y la causa confirmada (o lo que se sepa).

**REPORTA, además:**

- **Peso y memoria**, antes y después: cada imagen del catálogo (px, KB, MB decodificada) y el tamaño de `Assets.car` en un build Release del simulador.
- **El simulador:** si con la build de hoy la grabación del arranque en frío muestra negro (y cuánto), y lo mismo con el cambio aplicado en local. Para un arranque en frío de verdad: `xcrun simctl uninstall`, instalar, `xcrun simctl terminate` y lanzar desde la pantalla de inicio del simulador con un clic en el ícono, o con `xcrun simctl launch` si no reproduce el zoom. Mide el brillo de una zona de la ventana fuera de la «S», cuadro por cuadro (`ffmpeg … signalstats`). Si el registro del sistema del simulador dice por qué falla la pantalla de arranque (`xcrun simctl spawn booted log show --last 2m --predicate 'eventMessage CONTAINS[c] "launch" OR subsystem CONTAINS[c] "SplashBoard"'`), cópialo.
- **Riesgo de rechazo de Apple:** confirmar que el storyboard nuevo solo usa lo que Apple permite en una pantalla de arranque (vistas e imágenes del catálogo, sin clases propias ni texto).

---

## 5. Criterios de aceptación

### 5.1 Automáticos (Claude Code)

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde.
2. **Storyboard** (`appIos.test.js`): la vista raíz es papel `#FBF8F4` en sRGB; ningún color del sistema; **exactamente un** `imageView`, con `image="SimboloArranque"` y `scaleAspectFit`; restricciones de centro horizontal y vertical respecto a la vista raíz y de ancho y alto con los valores de DP-21.11.2; **ninguna referencia a `Splash`**; ningún texto (`label`, `textView`).
3. **Catálogo:** `SimboloArranque.imageset` declara 1x, 2x y 3x sin variante oscura; cada PNG mide los puntos de DP-21.11.2 por su escala (±1 px) y tiene canal alfa; `Splash.imageset` no existe; **ninguna imagen del catálogo pasa de 1024 px por lado** (la guarda que habría atrapado D-21.11, y que salta si alguien vuelve a correr la herramienta vieja).
4. **Nada más del iPhone cambió:** `git diff strivo -- capacitor.config.json ios/App/App/Info.plist ios/App/App.xcodeproj ios/App/App/SceneDelegate.swift ios/App/App/AppDelegate.swift` sale vacío. Y `appIos.test.js` sigue exigiendo identificador, esquema, host y base de fábrica.
5. **La web no cambió:** `git diff --stat strivo -- src public` solo lista archivos de prueba. `npm run build` produce los mismos chunks (mismos nombres y tamaños que en `strivo`).
6. `pantallaArranque.test.js` pasa **sin cambiar lo que comprueba**.
7. `npm run ios:arranque` dos veces seguidas deja `git status` limpio.
8. `npm run ios:build` sin errores, y **después** el storyboard y el imageset siguen iguales (`cap sync` no los reescribe).
9. **Simulador:** compila con `xcodebuild` para un iPhone 17 simulado, y la grabación del arranque en frío con el cambio no tiene ningún cuadro oscuro en la ventana que crece (si el simulador reproducía el negro antes; si no, se reporta así y decide el iPhone).
10. Ningún commit lleva `DEVELOPMENT_TEAM` ni `GoogleService-Info.plist` (`git show :ios/App/App.xcodeproj/project.pbxproj | grep DEVELOPMENT_TEAM` sale vacío).
11. Las pruebas de SPEC_17A, 17B, 19, 21.1, 21.2, 22, 29, 30 y 31 siguen pasando sin cambiar lo que comprueban.

### 5.2 Manuales (la fundadora, en su iPhone 17)

Nombres que se usan abajo:
- **«La nueva»**: la carpeta `~/Developer/strivo-2111`, rama `revision-21-11`, compilada con `npm run ios:build`.
- **«Grabar un arranque»**: (1) cerrar Strivo del todo, deslizándola hacia arriba en el selector de apps; (2) ir a la pantalla de inicio donde está el ícono de Strivo; (3) abrir el Centro de control y tocar **Grabar pantalla**, esperar la cuenta de tres; (4) cerrar el Centro de control y **tocar el ícono de Strivo en la pantalla de inicio** (no desde la Biblioteca de apps ni el buscador: el zoom sale del ícono); (5) esperar a que se vea el umbral, unos cinco segundos; (6) detener la grabación con el punto rojo de arriba. La grabación queda en **Fotos**.

**Lo que se mide en cada grabación** (lo mide Claude con la grabación que le mandes, o Claude Code con `ffmpeg`):
- **(a)** Mientras el ícono crece, la ventana es **papel con la «S»** desde el primer cuadro en que se distingue: ningún cuadro negro ni gris oscuro. En números: la zona de la ventana fuera de la «S» no baja de 200 de 255 en ningún cuadro.
- **(b)** Ya a pantalla completa y antes del umbral, ningún cuadro con brillo medio por debajo de 200 (de día) y ningún salto hacia oscuro antes del papel.
- **(c)** La «S» queda en el mismo sitio y del mismo tamaño en todo el paso: la de iOS, la del plugin y el relevo al umbral, sin salto.
- **(d)** De noche, el paso del papel al velo índigo es un fundido: mayor salto por cuadro de ±15 o menos, como el 13 y el 14 oct (D-21.9).

**Preparación (una sola vez):** borrar Strivo del iPhone, **reiniciar el iPhone**, instalar la nueva con ▶ en el Xcode de `~/Developer/strivo-2111` **con internet** y dejar que abra sola. Cuando se vea el umbral, ■ en Xcode. Desde aquí, la app se abre siempre desde el ícono. El iPhone se queda en **modo oscuro**, como lo usas, salvo en M3.

- **M1 · De día, en frío.** Justo después de la preparación: grabar un arranque. **Debe verse:** la «S» sobre papel creciendo desde el ícono, nunca negro; luego el umbral como siempre. Criterios (a), (b) y (c). De paso se mira O-21.11.1 (§9): si el umbral entra con un corte en vez de con fundido, se anota aparte y no bloquea.
- **M2 · De día, segundo arranque.** Cerrar Strivo del todo y grabar otro arranque. Criterios (a) y (b). Es el que el 14 oct dio ~80 ms de oscuro.
- **M3 · Modo claro.** En **Ajustes** → **Pantalla y brillo** → **Claro**. Grabar un arranque. Criterios (a) y (b). Después, volver a **Oscuro**.
- **M4 · De noche** (a partir de las 19:00; con la misma build, sin reinstalar). Grabar un arranque. Criterios (a), (b) y (d). **Debe verse:** papel con la «S», y el paso al umbral de noche suave, sin corte.
- **M5 · Reducir movimiento.** En **Ajustes** → **Accesibilidad** → **Movimiento** → activar **Reducir movimiento**. Abrir Strivo desde el ícono (sin grabar hace falta). **Debe verse:** iOS abre con un fundido en vez de zoom, papel con la «S», nunca negro, y la «S» se va sin fundido. Después, desactivar **Reducir movimiento**.
- **M6 · Todo lo demás sigue igual.** En la pantalla de inicio, el ícono es el mismo de siempre. La app llega a la bienvenida o a Hoy como siempre y la barra de estado se lee. Y en Xcode, ningún aviso nuevo sobre el storyboard o las imágenes.

**No hace falta probar la web:** no cambia ningún archivo que llegue a la web, y el criterio 5 lo demuestra.

### 5.3 Si M1 o M2 no pasan

Claude Code **no improvisa un arreglo.** Con las grabaciones medidas:
- **Si el negro sigue igual que antes:** la imagen no era la causa. Siguiente paso, **ya aprobado como diagnóstico** y nunca comiteado: una build con el storyboard **solo de papel, sin «S»**. Si con ella tampoco queda papel, la pantalla de arranque del sistema no es lo que se ve, y entra el plan B de DP-21.11.4 (el fondo de la ventana), que la fundadora decide en una adenda.
- **Si mejoró pero queda un oscuro corto:** se mide en qué tramo cae (mientras crece la ventana, o ya a pantalla completa) y se decide en una adenda.

---

## 6. Copy

**No hay copy.** La pantalla de arranque no lleva texto y no se toca ningún texto de `src/copy/`.

---

## 7. Reglas de arquitectura que roza

- **Nada se pierde:** identificador, esquema y host del WebView, y base SQLite, intactos. Ninguna prueba manual borra datos que importen (las cuentas de prueba no se usan).
- **La marca se respeta:** el símbolo sale del SVG sin tocar trazos ni color, por script. Carbón sobre papel: 13,71:1; puntos sobre papel: 4,58:1.
- **`prefers-reduced-motion`:** la retirada sin fundido de D-21.9 no cambia (M5).
- **Una regla, un sitio:** el tamaño de la «S» vive en las constantes del script y en el storyboard, y una prueba comprueba que coinciden.
- **Nada secreto en el repo:** ni el Team ni `GoogleService-Info.plist` ni `.env.local`. Commits por ruta, nunca `git add -A`, `git add .` ni `git commit -a`. **Los borrados también por ruta** (`git rm` de cada archivo de `Splash.imageset` y de `assets/splash*.png`).

---

## 8. Entrega

1. **Trabaja en un worktree aparte**, como en SPEC_17B y SPEC_22: `~/Developer/strivo-2111`, rama local `revision-21-11` creada desde `strivo`. **`~/Developer/strivo` se queda en `strivo` y no se toca.**
2. Para que el worktree compile la app de iPhone: copia desde `~/Developer/strivo` los dos archivos que no están en git (`.env.local` y `ios/App/App/GoogleService-Info.plist`), corre `npm install` y **avisa a la fundadora de que tiene que elegir su Team en el Xcode de esa carpeta una vez**. Ninguno de los tres se comitea. Si `docs/specs/` de `~/Developer/strivo` tiene esta instrucción sin seguimiento, cópiala también al worktree.
3. Commits pequeños y por tema (pantalla de arranque ligera / script y scripts de `package.json` / pruebas / docs), cada uno con la línea `Co-Authored-By` del repo, añadiendo y borrando archivos por ruta.
4. **Sin push** hasta que la fundadora lo apruebe; entonces `git push origin revision-21-11`. Nunca a `strivo` directamente. La fusión a `strivo` va después de M1–M6.
5. Reporte final: qué se hizo, cada **REPORTA** con su respuesta, la salida de las siete validaciones, archivos y casos de prueba antes y después, el peso antes y después, las mediciones del simulador y la lista M1–M6.

---

## 9. Reporte previo y decisiones

Reporte previo de Claude Code (12 nov 2026) **aprobado por la fundadora con las decisiones de abajo**. Todo lo demás se aprueba tal como viene: el storyboard completo del reporte, la lista de archivos, el script con sus constantes exportadas y la generación solo al ejecutarlo directamente.

**Causa confirmada por el propio iOS.** En el simulador, `splashboardd` registra con la build de hoy: «Error generating launch image for com.hellostrivo.strivo: … Estimated size (29900800) is over limit (25000000)» y la app queda marcada «has a bad launch image until it is updated». La imagen `Splash` de 2732×2732 ocupa 29,9 MB decodificada y **el límite de iOS para una pantalla de arranque es de 25 MB**. Al pasarse, iOS descarta el storyboard entero y pinta la ventana en negro, en los dos modos. Con la propuesta aplicada en local: «launch image generation completed after 0.054s», en oscuro y en claro.

**Medido en el simulador** (iPhone 17, iOS 27.2, modo oscuro, Release firmada ad hoc, franja fuera de la «S»):

| | Hoy | Con el cambio |
|---|---|---|
| En frío | 2.414 ms de negro puro y subida a papel en 175 ms | Ningún cuadro negro: papel con la «S» desde que se distingue |
| Segundo arranque | 1.149 ms de negro y subida en 176 ms | Ningún cuadro negro |
| Paso de iOS a la app | — | Papel sobre papel; mayor bajada entre cuadros, −1 |

**Lo que el reporte encontró y se acepta:**

- **iOS guarda la pantalla de arranque por versión de la app.** En el simulador, las variantes salían sin «S» hasta reiniciarlo. **En el iPhone, borrar la app y reiniciar el teléfono antes de M1 es obligatorio**, y **CLAUDE.md lo anota como regla**: cualquier cambio futuro de la pantalla de arranque se prueba tras borrar la app y reiniciar, o se verá la versión vieja (o la marca de «mala»).
- **Una build sin firmar sale en negro por otro motivo** (error −67056). Toda medición en el simulador va firmada. Se anota en CLAUDE.md junto a la anterior.
- **La «S» no se mueve:** antes y después, 1 px o menos de diferencia a 3x (0,3 pt), centrada en (201, 437) pt en un iPhone 17.
- **`ios:recursos` no cambia, ni `package.json`:** sin `assets/splash*.png`, `@capacitor/assets@3.0.5` solo escribe el ícono. Pero **un `assets/logo.png` o `assets/icon.png` volvería a generar un arranque de 2732**.
- **En teoría, el primer cuadro de la app podría salir sin la capa del plugin** (se añade con `DispatchQueue.main.async`). En la práctica, con el cambio no se ve. El plan B sigue sin hacer falta y lo decide M1.
- **Fuera de alcance, observación O-21.11.1:** en el simulador, en el primer arranque tras instalar, el umbral entra con un corte de papel a índigo en lugar de con fundido, igual antes y después del cambio. Se mira en el iPhone en M1; si se repite allí, va como deuda aparte y **no bloquea** esta tarea.

| Punto | Decisión |
|---|---|
| **DP-21.11.1 · Storyboard** | Aprobado tal como viene en el reporte: `UIView` papel en sRGB, un `UIImageView` `SimboloArranque` `scaleAspectFit`, centrado respecto a la vista raíz, sin texto. |
| **DP-21.11.2 · Tamaño** | **97 × 123 pt**, el de hoy en el iPhone 17. No hace falta grabar la alternativa de 80 pt. PNG transparentes de 97×123, 194×246 y 291×369, con el símbolo encajado sin deformar (`fit: 'contain'`, centrado). |
| **DP-21.11.3 · Fuentes y `ios:recursos`** | Se borran `Splash.imageset` (sus siete archivos) y `assets/splash.png` y `splash-dark.png`, **con `git rm` por ruta** (si el sistema de permisos pide confirmación, la fundadora la da). `ios:recursos` y `package.json` se quedan como están. **Además de la guarda del criterio 3, una prueba exige que `assets/` solo tenga los tres archivos del ícono** (`icon-only.png`, `icon-foreground.png`, `icon-background.png`), para que nadie añada un `logo.png` o un `icon.png` sin enterarse. |
| **DP-21.11.4 · Plan B** | No se hace. Solo si M1 o M2 fallan (§5.3). |
| **DP-21.11.5 · D-21.9** | Sin cambios. M4 mide la noche. |
| **DP-21.11.6 · Medición** | Las grabaciones del iPhone las mide Claude en la conversación del proyecto (tiene `ffmpeg`). Si el chat no acepta un video, la fundadora lo pasa a la Mac y Claude Code lo mide con su script de AVFoundation, que se queda en el scratchpad y no se comitea. |
| **Ramas viejas** | `revision-17b`, `revision-21-2` y `revision-31` ya están fusionadas y se quedan como están; no son de esta tarea. |
| **Trabajo** | Worktree `~/Developer/strivo-2111`, rama `revision-21-11`, según §8. Sin push hasta la aprobación. |

---

## 10. Implementación y pruebas manuales

**Implementado el 12 nov 2026** en `~/Developer/strivo-2111`, rama `revision-21-11`, sin push.

**Qué cambió.**
- `LaunchScreen.storyboard`: el storyboard aprobado en §9, tal cual.
- `SimboloArranque.imageset` (nuevo): `Contents.json` y tres PNG con alfa de 97×123, 194×246 y 291×369 px (2,7, 5,8 y 9,2 KB; 47, 186 y 419 KiB decodificadas), sin variante oscura.
- `Splash.imageset` (sus siete archivos), `assets/splash.png` y `assets/splash-dark.png`: borrados con `git rm` por ruta.
- `scripts/componer-arranque.js`: escribe el imageset directamente, con `fit: 'contain'`. Exporta `NOMBRE`, `ANCHO_PT`, `ALTO_PT`, `ESCALAS` y `archivoDe`, y solo genera cuando se ejecuta.
- `appIos.test.js`: el `describe` del storyboard se reescribió (5 casos) y hay uno nuevo para el catálogo (7). El comentario de D-21.11 está encima del `describe` del storyboard, con la causa confirmada. Las 7 guardas nuevas se comprobaron fallando contra el storyboard viejo, con un PNG de 2732 en el catálogo y con un `assets/splash.png`.
- `CLAUDE.md`, `docs/marca/iconos-v1/LEEME.md` y la fila D-21.11 de la instrucción 21.1.
- `package.json`, Swift, `capacitor.config.json`, `Info.plist`, `project.pbxproj`, `src/` (salvo la prueba) y `public/`: sin cambios.

**Criterios automáticos (§5.1).**

| # | Resultado |
|---|---|
| 1 | `lint`, `lint:copy`, `lint:contraste`, `format:check`, `test`, `build` y `validar:frases`: los siete en verde |
| 2–3 | Las pruebas del storyboard y del catálogo pasan; además, `assets/` solo puede tener los tres archivos del ícono (§9) |
| 4 | `git diff strivo` de `capacitor.config.json`, `Info.plist`, `App.xcodeproj`, `SceneDelegate.swift` y `AppDelegate.swift`: vacío |
| 5 | `git diff --stat strivo -- src public`: solo `src/lib/__tests__/appIos.test.js`. `npm run build`: los mismos 36 archivos, con los mismos nombres y tamaños (chunk principal 737,40 kB, gzip 209,40) |
| 6 | `pantallaArranque.test.js`, 17 casos, sin tocar |
| 7 | `npm run ios:arranque` dos veces: los cuatro archivos idénticos byte a byte |
| 8 | `npm run ios:build` sin errores; el storyboard y el imageset salen idénticos |
| 9 | `xcodebuild` Release para el iPhone 17 simulado (iOS 27.2), firmada ad hoc, tras reiniciar el simulador: **ningún cuadro negro**, en frío y en segundo arranque, en modo oscuro y en claro. `splashboardd`: «launch image generation completed», sin «over limit». Del papel al umbral, la mayor bajada entre cuadros es de −1 (la de −10 del segundo arranque en oscuro es el umbral entrando con su fundido). `ibtool`: sin avisos |
| 10 | Ningún commit lleva `DEVELOPMENT_TEAM` ni `GoogleService-Info.plist` |
| 11 | Suite: 113 archivos y 2.749 casos en `indexeddb` (antes 2.740) y 107 archivos y 2.686 casos en `sqlite` (antes 2.677). Los +9 son de `appIos.test.js` y ninguna otra prueba cambió |

**Peso.** `Assets.car` del Release de simulador: de 81 480 B (con `Splash` de 2732×2732 en 3x, clara y oscura, 29,9 MB decodificada cada una) a 51 032 B (`SimboloArranque` 3x, 291×369).

**Pruebas manuales M1–M6 no realizadas, por decisión de la fundadora (12 nov 2026).** D-21.11 se cierra con la causa confirmada por `splashboardd` y las grabaciones del simulador (0 cuadros negros en frío y en segundo arranque, en oscuro y en claro). Queda por ver en el iPhone, sin bloquear: el relevo de noche de D-21.9 (criterio d) y O-21.11.1. La primera build en el iPhone va tras borrar la app y reiniciar el teléfono.

---

## Anexo A · Para la fundadora: la primera vez en el Xcode del worktree

1. En la terminal de VS Code, dentro de `~/Developer/strivo-2111`: `npm run ios:build` y luego `npm run ios:abrir`. Se abre **otro** Xcode, el de esa carpeta (cierra antes el de `~/Developer/strivo` para no confundirlos).
2. En la columna izquierda, clic en **App** (el ícono azul de arriba) → pestaña **Signing & Capabilities** → en **Team** elige **ALEJANDRA TREVIÑO LOZANO**. Deja marcado **Automatically manage signing**. Si sale «Update to recommended settings», **no lo aceptes**.
3. Arriba, junto a «App», elige tu iPhone conectado por cable.
4. Para instalar: botón **▶**. Para detener: **■**.
