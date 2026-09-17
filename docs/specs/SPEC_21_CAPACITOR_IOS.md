# SPEC_21 — Capacitor y proyecto iOS

**Tarea del Gantt:** A5 · **Dependencias:** SPEC_19 · **Requiere:** una Mac con Xcode, cuenta de Apple Developer activa

---

## 1. Nombre, objetivo y problema que resuelve

**Objetivo:** convertir la PWA en una app iOS instalable y firmada, con los activos web empaquetados dentro del binario, corriendo en un iPhone físico, sin cambiar ninguna pantalla.

**Problema:** una PWA no se puede subir a la App Store. Y un envoltorio que solo cargue una URL remota es rechazado por la Guideline 4.2. Esta SPEC sienta la base sobre la que SPEC_17B, 22, 23 y 25 añaden lo nativo.

## 2. Alcance

**Entra:** instalación de Capacitor, configuración, proyecto iOS generado, empaquetado de `dist/` dentro de la app, ajustes de `Info.plist` que otras SPECs necesitan (declarados aquí, usados después), ícono y pantalla de arranque, barra de estado y áreas seguras, activación de la persistencia de Firebase Auth para nativo, script de build reproducible, y un checklist de firma.

**Fuera:** cualquier plugin funcional (van en sus SPECs), cambios de UI, Android (SPEC_26), automatización de CI para iOS, App Store Connect (es trámite, no código).

## 3. Experiencia de usuario

Idéntica a la web salvo:
- La app abre a pantalla completa, sin barra de navegador, con la barra de estado del sistema en el color de la paleta activa.
- Nada queda oculto bajo el notch ni bajo el indicador de inicio (áreas seguras).
- La pantalla de arranque del sistema muestra el símbolo de Strivo sobre el fondo base de la paleta Noche (DP-21.1), y da paso a la transición de entrada existente sin corte visible.
- Sin conexión, la app abre igual: los activos están dentro del binario.

**Casos límite:** rotación bloqueada a vertical (la app está diseñada así; se declara en `Info.plist`). iPad: se ejecuta en modo compatibilidad de iPhone (DP-21.2). Enlaces externos (aviso de privacidad, términos) abren en el navegador del sistema, no dentro del WebView.

## 4. Textos exactos

Solo los de `Info.plist`, visibles en diálogos del sistema. Se declaran aquí y se activan en las SPECs que los usan:

| Clave | Texto |
|---|---|
| `NSFaceIDUsageDescription` | Para abrir tu Journal sin escribir el PIN. |
| `NSUserNotificationsUsageDescription` (informativo) | Para recordarte tus momentos de la mañana y de la noche. |

No hay otros textos.

## 5. Interfaz, accesibilidad y consistencia

- `viewport-fit=cover` en el `index.html` y `env(safe-area-inset-*)` aplicados en `NavStrivo` y en el contenedor raíz. Claude Code verifica que ninguna pantalla use `100vh` fijo; si lo hace, cambia a `100dvh` o al patrón que ya use el proyecto.
- Barra de estado: estilo claro sobre PM, oscuro sobre AM, sincronizada con el toggle Mañana/Noche vía `@capacitor/status-bar`.
- El WebView respeta `prefers-reduced-motion` y Dynamic Type del sistema (verificar que la tipografía escale; si el proyecto fija `px`, reportar).

## 6. Requisitos técnicos

**Dependencias:** `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/app`, `@capacitor/browser` (para enlaces externos). Todas oficiales.

**Configuración (`capacitor.config.ts` o `.json`):**
- `appId`: DP-21.3 (propuesta `app.strivo.ios`… ver DP).
- `appName`: Strivo.
- `webDir`: `dist`.
- **Sin `server.url`.** Los activos van embebidos. Esto es la defensa central frente a 4.2 y no se negocia.
- `ios.contentInset: 'automatic'`, `ios.scheme: 'strivo'`.

**Build reproducible.** Script `npm run ios:build` = `vite build && cap sync ios`. Documentado en `CLAUDE.md`. Xcode abre con `cap open ios`.

**`Info.plist`:** orientación vertical únicamente; `UIBackgroundModes: [audio]` (lo usa SPEC_23; se declara ya para no tocar el plist dos veces); textos de la sección 4; `ITSAppUsesNonExemptEncryption: false` (el PIN usa PBKDF2/SHA-256, exención estándar).

**Firebase Auth nativo.** Activar el punto de extensión de SPEC_19: `initializeAuth` con `indexedDBLocalPersistence` cuando `Capacitor.isNativePlatform()`. Verificar que la sesión sobrevive a cerrar y reabrir la app.

**Firebase y dominios autorizados.** Añadir `capacitor://localhost` y `localhost` a los dominios autorizados de Firebase Auth. Documentar en el reporte.

**Ícono y arranque.** Ícono 1024×1024 sin transparencia ni esquinas redondeadas (DP-21.4: quién lo produce). Pantalla de arranque generada con `@capacitor/assets` a partir del símbolo sobre fondo plano.

**Web Crypto en WKWebView.** `crypto.subtle` está disponible; verificar que el PIN (PBKDF2) funciona igual en nativo. Si el proyecto usa alguna API no soportada por WKWebView, reportar antes de continuar.

**Wake Lock.** La API de Wake Lock puede no estar en WKWebView. SPEC_23 la sustituye; aquí solo se verifica que su ausencia no rompe Respiración (debe degradar en silencio).

**Seguridad.** Sin `allowNavigation` abierto. `Content-Security-Policy` del `index.html` revisada para permitir `capacitor://` y los dominios de Firebase, nada más.

## 7. Criterios de aceptación

1. `npm run ios:build && npx cap open ios` produce un proyecto que compila y corre en un iPhone físico firmado con el equipo de la fundadora.
2. En modo avión: la app abre, muestra la transición y Hoy con datos locales.
3. Crear cuenta en la app nativa, cerrar por completo, reabrir: sesión conservada.
4. Journal: crear PIN, bloquear, desbloquear: idéntico a web.
5. Respiración: funciona en primer plano; al bloquear pantalla, no hay error visible (el audio en background llega en SPEC_23).
6. Ninguna pantalla muestra contenido bajo el notch ni bajo el indicador de inicio (revisión en iPhone con notch y en uno con Dynamic Island).
7. `git diff --stat` no muestra cambios en componentes de pantalla salvo áreas seguras y `NavStrivo`.
8. Suite web verde. Pruebas nuevas: al menos 6 (config, detección de plataforma, selector de persistencia de Auth).

## 8. Plan de pruebas

**Automáticas:** unitarias del selector de plataforma y de la config; el resto es manual por naturaleza.
**Manuales:** criterios 1–7 en dos iPhones distintos (uno antiguo con notch, uno reciente), iOS actual y anterior.
**Regresión:** la PWA web sigue funcionando en Netlify sin cambios de comportamiento (verificar que los cambios de áreas seguras no rompen el escritorio).

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Alguna API web usada no existe en WKWebView | Inventario de APIs en el reporte antes de codificar | — |
| Sesión de Firebase no persiste en nativo | Prueba explícita (criterio 3) antes del push | Volver a `browserLocalPersistence` y reportar |
| Áreas seguras rompen layouts de escritorio | Probar en tres anchos | Revert del commit de áreas seguras |
| Firma y provisioning fallan | Checklist de firma en el reporte; no es código | — |

## 10. Orden y dependencias

Quinto. Requiere SPEC_19. Es prerequisito de 17B, 22, 23, 25 y 26.

## Decisiones pendientes

- **DP-21.1** Fondo de la pantalla de arranque: paleta Noche, paleta Mañana, o neutro Strivo madre. Recomendación: Strivo madre (`strivo-800`), porque no depende de la hora.
- **DP-21.2** iPad: modo compatibilidad de iPhone (recomendado, cero trabajo) o no ofrecer la app en iPad. Ambas son aceptables para Apple.
- **DP-21.3** Identificador de bundle definitivo. Debe ser un dominio invertido que controles: si `strivo.app` es tuyo, `app.strivo.ios`; si no, uno basado en un dominio que sí poseas. **No se cambia después de publicar.**
- **DP-21.4** Quién produce el ícono 1024×1024 final: la fundadora a partir del símbolo, o el mismo freelance de los íconos de emoción.
- **DP-21.5** ¿La PWA sigue pública en Netlify después del lanzamiento? Si la web ofrece exactamente lo mismo gratis, Apple puede cuestionar el valor del app nativo y la propia estrategia de precio se debilita. Recomendación: Netlify queda como landing y lista de espera; la app web se restringe a testers o se retira. Requiere decisión antes de publicar, no antes de esta SPEC.
