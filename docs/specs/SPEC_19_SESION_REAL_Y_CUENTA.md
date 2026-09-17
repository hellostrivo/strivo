# SPEC_19 — Sesión real y gestión de cuenta (v2.0)

**Reescrita el 9 de septiembre de 2026 tras revisar el repo en el commit `5efa09e`.**
**Tarea del Gantt:** A3 · **Dependencias:** SPEC_17 Fase A
**Horas revisadas:** 8 (antes 14)

---

## 0. Qué cambió respecto a la v1.0 de esta SPEC

La v1.0 asumía que no había nada de autenticación. **La mitad ya está construida**, y precisamente la mitad difícil. `src/onboarding/cuenta.js` tiene:

- `crearConCorreo(correo, contrasena)` — crea la cuenta y, si el correo ya existe, prueba a entrar con esa misma contraseña antes de decir nada.
- `entrarConProveedor('google' | 'apple')` — **Google y Apple ya implementados.**
- `adoptarArbol(uidLocal, cuenta)` → `mudarUid` — la migración del árbol local al uid de la cuenta, sin sobrescribir lo que ya hubiera en la nube. Esto era el punto más delicado de la v1.0 y ya está resuelto y comentado.
- `saveAuthRecord` — deja constancia del correo.
- Códigos de error de Firebase ya mapeados a motivos internos (`MOTIVOS`), sin un solo código a la vista.

**Dos consecuencias de producto:**

1. Como Google ya está, Apple **exige** *Sign in with Apple*. Ya está en el código. Requiere un Service ID en la cuenta de desarrollador, que es trámite, no código.
2. `entrarConProveedor` usa `signInWithPopup`. **Dentro de un WebView de Capacitor los popups de OAuth no funcionan bien**; hay que migrar a redirect o al flujo nativo. Se trata en SPEC_21, pero se anota aquí porque nace de este archivo.

Lo que falta es lo que rodea a esas funciones: no hay sesión que persista, no hay dónde entrar si no es durante el onboarding, no hay salir, y nada se ha probado contra un proyecto de Firebase real (no hay `.env.local` y CLAUDE.md lo declara como deuda).

## 1. Objetivo y problema que resuelve

**Objetivo:** que la cuenta sea una sesión de verdad —que sobreviva a cerrar la app, que se pueda abrir y cerrar desde Perfil, y que se pueda recuperar— y no solo un paso del onboarding.

**Problema:** hoy el uid nace local (`local-<uuid>` en `localStorage`, vía `ArranqueProvisional`) y solo cambia si alguien crea cuenta en P7. Quien la creó y vuelve mañana no está autenticado: Firebase no está escuchando. La cola sube bajo un uid que las reglas de Firestore rechazarán en cuanto haya que autenticar de verdad.

## 2. Alcance

**Entra:**
- `onAuthStateChanged` y persistencia de sesión; el uid deja de nacer solo en `localStorage`.
- Bloque **Cuenta** en Perfil: estado, entrar, salir, recuperar contraseña.
- Pantalla de inicio de sesión alcanzable fuera del onboarding.
- Recuperación de contraseña (`sendPasswordResetEmail`).
- Configuración real de Firebase probada de punta a punta.
- Reconciliación entre el uid local y el uid autenticado al arrancar.

**Fuera:**
- Reescribir `crearConCorreo`, `entrarConProveedor` o `adoptarArbol`. Funcionan; se reutilizan.
- Cambiar el onboarding. P7 se queda como está.
- Retirar `ArranqueProvisional`. Sigue haciendo falta: la app debe funcionar sin cuenta (P7 es saltable, RN-01) y alguien tiene que resolver un uid local para esa persona. Lo que cambia es que deja de ser la única fuente del uid.
- Verificación obligatoria de correo, 2FA, cambio de correo.

> **Corrección explícita a la v1.0:** decía «retirar `ArranqueProvisional` del árbol y del repo». Eso era un error nacido de no haber leído el repo: borrarlo dejaría sin uid a quien usa la app sin cuenta, que es un caso soportado a propósito.

## 3. Experiencia de usuario

**3.1 Arranque con sesión.** La app abre como hoy, con el umbral. Por detrás, `onAuthStateChanged` resuelve el uid autenticado y la sesión sigue con él.

**3.2 Arranque sin sesión, con árbol local.** Igual que hoy. Perfil muestra el bloque Cuenta con `sinCuenta` y la invitación a crear una.

**3.3 Entrar desde Perfil.** Correo y contraseña, o Google, o Apple. Al entrar:
- Si el árbol local tiene datos y la cuenta también: se fusiona con la regla de SPEC_17.
- Si el árbol local tiene datos y la cuenta está vacía: se muda con `adoptarArbol`.
- Si el árbol local está vacío: se restaura desde la nube (SPEC_17).

**3.4 Salir.** Confirmación en el patrón de Perfil. Al salir, la sesión vuelve a un uid local nuevo y **los datos locales de la cuenta se borran del dispositivo** (DP-19.1), porque el teléfono puede ser compartido y el Journal es íntimo. Lo escrito sigue en la nube y vuelve al entrar.

**3.5 Recuperar contraseña.** Campo de correo, respuesta siempre idéntica exista o no la cuenta.

**3.6 Casos límite.** Sin `.env.local`: el bloque Cuenta muestra `sinConfigurar` y nada se ofrece, igual que ya hace `hayCuenta()` en el onboarding. Sin conexión al entrar: mensaje neutro, el formulario se conserva. Sesión expirada: se vuelve a pedir entrar; **lo local sigue visible**, nunca se bloquea el diario.

## 4. Textos exactos

`copy.cuenta.*`. El onboarding ya tiene su propio copy para P7 y **no se toca ni se duplica**: Claude Code revisa qué claves existen ahí y reutiliza las que sirvan.

| Clave | Texto |
|---|---|
| `bloque.titulo` | Tu cuenta |
| `estado.sinCuenta` | Sin cuenta. Lo que escribes vive solo en este teléfono. |
| `estado.conCuenta` | {correo} |
| `estado.sinConfigurar` | Las cuentas no están disponibles en esta versión. |
| `entrar` | Entrar a mi cuenta |
| `crear` | Crear una cuenta |
| `entrar.titulo` | Entrar |
| `entrar.correo` | Correo |
| `entrar.contrasena` | Contraseña |
| `entrar.boton` | Entrar |
| `entrar.google` | Continuar con Google |
| `entrar.apple` | Continuar con Apple |
| `entrar.olvide` | Olvidé mi contraseña |
| `recuperar.titulo` | Recuperar acceso |
| `recuperar.texto` | Te enviaremos un enlace para elegir una contraseña nueva. |
| `recuperar.boton` | Enviarme un enlace |
| `recuperar.enviado` | Si ese correo tiene una cuenta, recibirás un enlace en unos minutos. |
| `salir.titulo` | Cerrar sesión |
| `salir.texto` | Lo que escribiste está guardado en tu cuenta y vuelve cuando entres. Se quitará de este teléfono. |
| `salir.confirmar` | Cerrar sesión |
| `salir.cancelar` | Quedarme |
| `error.credenciales` | Ese correo y esa contraseña no coinciden. |
| `error.sinConexion` | Sin conexión. Inténtalo cuando vuelva. |
| `error.generico` | Algo no salió bien. Inténtalo de nuevo en un momento. |

## 5. Interfaz, accesibilidad y consistencia

- El bloque Cuenta sigue el patrón de `src/components/perfil/Bloque.jsx` y se añade a `BLOQUES` en `src/perfil/bloques.js`, que hoy tiene `['nombre', 'genero', 'horarios']`.
- Los campos reutilizan `src/components/shared/Campo.jsx`. No se crean inputs nuevos.
- `autocomplete` correcto (`email`, `current-password`). Errores con `aria-describedby`. Foco al primer campo con error.

## 6. Requisitos técnicos

**Archivos a leer primero:** `src/components/ArranqueProvisional.jsx`, `src/onboarding/cuenta.js`, `src/lib/firebase.js`, `src/App.jsx`, `src/perfil/bloques.js`, `src/perfil/usePerfil.js`, `src/lib/db/local.js` (`mudarUid`).

**Resolución del uid.** Un único punto decide el uid vigente, con esta precedencia: uid de Firebase si hay sesión → uid en `localStorage` si no. `ArranqueProvisional` sigue siendo quien escribe `strivo.uid.local` y sigue siendo el único que lo hace; lo que se añade es que consulte primero a Firebase.

**Persistencia.** `browserLocalPersistence` en web. Punto de extensión preparado para `indexedDBLocalPersistence` en nativo, que activa SPEC_21.

**Configuración real.** Crear el proyecto de Firebase, habilitar Email/Password + Google + Apple, poner `.env.local` a partir de `.env.example`, y **probar el flujo completo por primera vez**. Es trabajo de la fundadora en la consola, más una pasada de verificación aquí.

**Seguridad.** Contraseñas nunca en logs ni en estado persistido. Las reglas de Firestore ya son correctas y no se tocan.

## 7. Criterios de aceptación

1. Crear cuenta en el onboarding, cerrar la app por completo, reabrir: sigue autenticada y Perfil muestra el correo.
2. Cerrar sesión desde Perfil, reabrir: uid local nuevo, app vacía, sin errores.
3. Entrar de nuevo con esa cuenta: vuelve todo (vía SPEC_17).
4. Entrar con Google y con Apple en web.
5. Recuperar contraseña: correo existente e inexistente dan la misma respuesta en pantalla.
6. Sin `.env.local`: la app funciona entera, el bloque Cuenta dice `sinConfigurar`, y el onboarding sigue ofreciendo saltar P7.
7. Quien usa la app sin cuenta puede seguir usándola indefinidamente, sin ninguna interrupción nueva.
8. Suite verde; al menos 20 pruebas nuevas.

## 8. Plan de pruebas

**Unitarias:** precedencia del uid (4 combinaciones), mapeo de errores a copy, reconciliación al arrancar.
**Integración:** Firebase Emulator Suite: entrar, salir, recuperar, fusión con datos en nube.
**Manuales:** los 7 criterios, con y sin `.env.local`.
**Regresión:** el onboarding completo (8 pantallas) sigue igual; P7 saltable; `adoptarArbol` sigue mudando el árbol; PIN del Journal y su recuperación por reautenticación siguen funcionando; Respiración e Historial intactos.

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Dos fuentes del uid se desincronizan | Un solo punto de resolución con precedencia explícita y prueba | Revertir el commit |
| Borrar lo local al salir sorprende a alguien | El texto de confirmación lo dice antes | DP-19.1 se puede invertir |
| `signInWithPopup` falla en nativo | Anotado para SPEC_21; en web funciona | — |
| Primera conexión real a Firebase revela fallos del código de P7 | Se prueba en esta SPEC, no en la App Review | — |

## 10. Orden y dependencias

Segundo. Requiere SPEC_17A (para que entrar recupere datos de verdad). Prerequisito de 21, 24 y 25.

## Decisiones pendientes

- **DP-19.1** Al cerrar sesión, ¿se borran los datos locales? Recomendación: sí, y el copy de arriba ya lo asume.
- ~~**DP-19.2** ¿Existe hoja de confirmación reutilizable?~~ → El patrón a seguir es el de Perfil; Claude Code confirma si hay un componente de confirmación o crea uno mínimo que reutilizará SPEC_24.
- **DP-19.3** Dominio y remitente de los correos de Firebase.
- **DP-19.4 (nueva)** Apple exige un Service ID para *Sign in with Apple* en web. ¿Se configura ahora o se desactiva el botón de Apple hasta tener la cuenta de desarrollador? Recomendación: desactivarlo hasta tenerla, y activarlo en SPEC_21, donde la cuenta ya existe.
