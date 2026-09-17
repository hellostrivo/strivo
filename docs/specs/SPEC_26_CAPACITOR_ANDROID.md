# SPEC_26 — Capacitor y proyecto Android

**Tarea del Gantt:** C1 · **Dependencias:** SPEC_21, SPEC_17B, SPEC_25 (para la tienda de Google)
**Requiere:** Android Studio (Windows, Linux o Mac), cuenta de Google Play Console (tarea C4), un Samsung, un Xiaomi y un Motorola físicos para probar

---

## 1. Nombre, objetivo y problema que resuelve

**Objetivo:** que la misma app corra en Android con comportamiento nativo correcto: botón Atrás, teclado, edge-to-edge, y compra a través de Google Play sobre la misma lógica de suscripción.

**Problema:** México es mayoritariamente Android. Y Android tiene tres diferencias que, si se ignoran, se sienten como una app rota: el botón físico de Atrás, la gestión del teclado, y la variedad de WebViews y fabricantes.

## 2. Alcance

**Entra:** proyecto Android generado, `appId` y firma, edge-to-edge (obligatorio desde Android 15), manejo del botón Atrás en toda la navegación, comportamiento del teclado, barra de estado y de navegación en color de paleta, ícono adaptativo, pantalla de arranque, productos de Google Play conectados a RevenueCat, pruebas en tres fabricantes, `targetSdk` vigente.

**Fuera:** notificaciones (SPEC_27), widgets, Wear OS, tablets (modo teléfono ampliado se acepta), App Links verificados, cualquier cambio de UI que no sea áreas seguras.

## 3. Experiencia de usuario

**3.1 Botón Atrás (físico o gesto).** Regla única: Atrás hace lo que haría el gesto de retroceso en iOS, más dos excepciones de Strivo:
- Journal desbloqueado: Atrás **bloquea** el Journal y vuelve a la pantalla anterior. Nunca deja el Journal abierto "detrás".
- Respiración en sesión: Atrás pausa y muestra "¿Terminar la sesión?" con "Terminar" / "Seguir". No corta el audio de golpe.
- En el Home de Strivo: Atrás sale de la app (comportamiento estándar). Sin "toca de nuevo para salir".
- En el paywall vencido (SPEC_25): Atrás equivale a "Ahora no".
- Con un campo de texto enfocado y teclado abierto: Atrás cierra el teclado y no navega.

**3.2 Teclado.** Al enfocar un campo del Diario o del Journal, el contenido se desplaza para que el campo quede visible sobre el teclado; el `NavStrivo` **se oculta** mientras el teclado está abierto y vuelve al cerrarlo (DP-26.1). El botón de acción del teclado dice "Listo" y cierra el teclado.

**3.3 Edge-to-edge.** El contenido se extiende bajo las barras del sistema; las barras se tiñen con la paleta activa (AM: iconos oscuros; PM: iconos claros). Nada queda debajo de la barra de navegación por gestos o de tres botones.

**3.4 Compra.** Idéntica a iOS en flujo y copy. La hoja de compra es la de Google Play. "Gestionar suscripción" abre Google Play. "Restaurar compras" existe igual (en Android es casi siempre automático, pero se muestra por consistencia).

**3.5 Casos límite.** WebView desactualizado (fabricante): si `Android System WebView` es anterior a la versión mínima que Claude Code determine (DP-26.2), mostrar `webviewAntiguo` con enlace a Play para actualizarlo. Modo oscuro forzado por el sistema (`forceDark` en algunos fabricantes): desactivarlo explícitamente; la app decide sus colores por Mañana/Noche. Pantallas plegables y con recorte: áreas seguras de `WindowInsets`.

## 4. Textos exactos

`copy.android.*` y reutilización:

| Clave | Texto |
|---|---|
| `respiracion.terminarTitulo` | ¿Terminar la sesión? |
| `respiracion.terminar` | Terminar |
| `respiracion.seguir` | Seguir |
| `teclado.listo` | Listo |
| `webviewAntiguo` | Tu teléfono necesita actualizar un componente del sistema para que Strivo funcione bien. |
| `webviewActualizar` | Actualizar |

Los diálogos de permiso de Google Play y de compra son del sistema; no se redactan aquí.

## 5. Interfaz, accesibilidad y consistencia

- Ícono adaptativo (capa frontal: símbolo; capa de fondo: `strivo-800`, misma decisión que DP-21.1). Sin fondo blanco.
- Pantalla de arranque con la API `SplashScreen` de Android 12+, símbolo centrado, sin animación propia.
- TalkBack: el botón Atrás anuncia el destino; el diálogo de Respiración es `role="alertdialog"` con foco en "Seguir" (la opción no destructiva).
- Tamaño de toque mínimo 48 dp.

## 6. Requisitos técnicos

**Dependencias:** `@capacitor/android`, `@capacitor/keyboard`, `@capacitor/status-bar` (ya), `@capacitor/app` (ya), `@revenuecat/purchases-capacitor` (ya).

**Configuración.** `appId` = el mismo de DP-21.3 (Android acepta el mismo identificador). `android.allowMixedContent: false`. `minSdk`: DP-26.3 (propuesta 26 / Android 8.0). `targetSdk`: el vigente que Google exija en la fecha de publicación (Claude Code lo verifica en la documentación de Play en el momento).

**Botón Atrás.** `App.addListener('backButton', ...)` con una pila de navegación propia consultada desde el router. Un solo manejador central; ningún componente registra el suyo. Las excepciones de 3.1 se resuelven por estado (`journalDesbloqueado`, `sesionRespiracionActiva`, `tecladoAbierto`, `paywallVencido`).

**Teclado.** `Keyboard.setResizeMode({ mode: 'body' })` (o el que Claude Code demuestre que no rompe el layout; reportar). Ocultar `NavStrivo` con `keyboardWillShow`/`keyboardWillHide`.

**Edge-to-edge.** `WindowCompat.setDecorFitsSystemWindows(window, false)` en `MainActivity`; `--safe-area-inset-*` alimentados por `@capacitor/status-bar` o por el plugin que Claude Code determine (en Android las variables `env()` no siempre funcionan; reportar la técnica elegida).

**Firma.** Keystore de subida generado y guardado por la fundadora fuera del repo; Play App Signing activado. El keystore **nunca** entra en git. Documentar en `CLAUDE.md` la ruta local y las variables de entorno.

**Google Play Billing vía RevenueCat.** Productos `strivo_mensual`, `strivo_anual` (suscripciones con planes base) y `strivo_fundador` (producto único) creados en Play Console con los mismos identificadores; vinculados en RevenueCat al mismo entitlement `completo`. Ningún cambio en `SuscripcionProvider`.

**WebView mínimo.** Verificar con `navigator.userAgent` la versión de Chrome del WebView; comparar con DP-26.2.

**Seguridad.** `android:usesCleartextTraffic="false"`. `allowBackup="false"` (el Journal no debe ir al backup de Google en claro; DP-26.4).

## 7. Criterios de aceptación

1. Build de release firmado instalado en un Samsung, un Xiaomi y un Motorola con Android de tres versiones distintas.
2. Recorrido completo (Home, Hoy AM/PM, Journal con PIN, Respiración con sonido, Historial, Ajustes) sin ningún elemento bajo las barras del sistema, en gestos y en tres botones.
3. Atrás: las cinco reglas de 3.1 verificadas una por una.
4. Teclado: campo del Diario visible sobre el teclado; `NavStrivo` oculto y de vuelta; "Listo" cierra.
5. Comprar mensual en el sandbox de Google Play: mismo flujo que iOS; Ajustes muestra el estado.
6. Modo oscuro forzado del sistema activado en un Xiaomi: la app conserva su paleta.
7. `allowBackup="false"` verificable en el manifest; el keystore no está en el repo (`git log --all -- '*.jks' '*.keystore'` vacío).
8. Suite verde; al menos 20 pruebas nuevas (manejador de Atrás con los cinco estados, detección de WebView, estado del nav con teclado).

## 8. Plan de pruebas

**Unitarias:** manejador central de Atrás (tabla de estados × rutas), comparación de versión de WebView.
**Integración:** plugins mockeados; navegación con pila.
**Manuales:** criterios 1–7 en los tres dispositivos. Además: rotación (bloqueada), llamada entrante en Respiración, cambio de app y vuelta (estado conservado).
**Regresión:** iOS no cambia (el manejador de Atrás es no-op en iOS y web); web sin cambios.

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Fragmentación de WebView entre fabricantes | Versión mínima (DP-26.2) y aviso de actualización; pruebas en tres marcas | — |
| Áreas seguras con `env()` no funcionan | Técnica alternativa documentada por Claude Code antes de codificar | — |
| Cuenta de Play personal con requisito de 12 testers | Es trámite (C4/C6), no código; si aplica, el calendario de Android se recorre | — |
| Xiaomi mata la app en segundo plano | Fuera de esta SPEC; SPEC_27 lo trata para notificaciones | — |

## 10. Orden y dependencias

Undécimo. Requiere 21, 17B y 25. Es prerequisito de SPEC_27.

## Decisiones pendientes

- **DP-26.1** ¿`NavStrivo` se oculta con el teclado abierto? Recomendado: sí; en pantallas pequeñas el teclado más el nav dejan tres líneas para escribir.
- **DP-26.2** Versión mínima de Chrome WebView soportada. Propuesta: la que tenga `crypto.subtle`, `dvh` y las APIs que el inventario de SPEC_21 haya listado; Claude Code propone un número con evidencia.
- **DP-26.3** `minSdk`. Propuesta: 26 (Android 8.0) para cubrir la mayoría de equipos en México sin arrastrar WebViews imposibles. Claude Code reporta el porcentaje de dispositivos que quedarían fuera según la distribución vigente.
- **DP-26.4** `allowBackup`. Recomendado: `false`. El Journal viajaría al backup de Google en claro; la restauración real la hace Firestore (SPEC_17), así que no se pierde nada.
