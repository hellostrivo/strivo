# SPEC_19 — Sesión real y gestión de cuenta (v2.1)

**v2.1 — 1 de octubre de 2026.** Revisada contra el commit `6c80b3f` (24 sep 2026), después de SPEC_17A. Sustituye a la v2.0 (9 sep, commit `5efa09e`).
**Tarea del Gantt:** A3 · **Dependencias:** SPEC_17 Fase A (cerrada)
**Horas revisadas:** 14 (antes 8), en dos entregas: **19.1 Sesión** (~8 h) y **19.2 Cuenta existente** (~6 h).

---

## 0. Qué cambió respecto a la v2.0

La v2.0 se escribió antes de SPEC_17A. Al revisarla contra el repo, ocho afirmaciones ya no se sostenían y faltaba todo lo que 17A le dejó heredado.

**Premisas corregidas**

1. **La sesión ya persiste.** `getAuth()` guarda la sesión en web en IndexedDB (`firebaseLocalStorageDb`) por defecto, y los bloques 3 y 4 de la validación de 17A dependieron de eso. Lo que falta no es persistencia: es que **nadie escucha a Firebase**. El uid sale de `localStorage`, y cuando dice «cuenta» pero Auth no tiene usuario, la cola y la restauración fallan por permisos en silencio.
2. **No se fija `browserLocalPersistence`.** La v2.0 lo pedía, pero eso pasaría la persistencia de IndexedDB a `localStorage`, que es peor. Se deja la de fábrica; el punto de extensión para nativo queda para SPEC_21.
3. **La configuración real está hecha en parte.** Proyecto `strivo-fe04f`, Email/Password activo y probado en 17A. Falta Google en la consola y los dominios autorizados (tarea de la fundadora, §6).
4. **`BLOQUES` ya tiene cuatro entradas** (`nombre, genero, horarios, sincronizacion`). Cuenta entra antes de sincronización.
5. **No existe componente de confirmación** (DP-19.2): se crea uno mínimo, que SPEC_24 reutilizará.
6. **Entrar no puede usar `crearConCorreo`.** Esa función crea la cuenta si el correo no existe. Hace falta `entrarConCorreo`, con su propio mapeo de errores (`wrong-password` hoy se traduce a `correoEnUso`).
7. **La tabla de copy tenía una colisión:** `entrar` era a la vez texto y padre de `entrar.titulo`. Se renombra (§4).
8. **No se instala el emulador.** Pruebas con dobles (`vi.mock('firebase/auth')`, `fake-indexeddb`) y validación manual contra `strivo-fe04f`, igual que 17A (D12).

**Heredado de 17A, que la v2.0 no mencionaba:** DP-19.5, el caso del techo de 15 s de DP-17.11, la reversión de D7, DP-17.14 y retirar `esUidDeCuenta` (DP-17.7).

**Defectos nuevos:** DP-19.6 (la recuperación del PIN no funciona con cuenta de correo) y DP-19.7 (entrar con datos en los dos lados).

## 1. Objetivo y problema

**Objetivo:** que la cuenta sea una sesión de verdad —escuchada, reconciliada al arrancar, abrible y cerrable desde Perfil, recuperable— y que entrar a una cuenta que ya tiene datos no destruya nada, ni en el teléfono ni en la nube.

**Problema:** hoy hay cuenta si el uid no empieza por `local-`. No hay forma de entrar fuera de P7, ni de salir, ni de recuperar la contraseña. Y entrar en P7 a una cuenta con datos y terminar el recorrido pisa en la nube `shared/profile` y `shared/onboarding`.

## 2. Alcance

**Entrega 19.1 — Sesión**
- Un único resolutor del estado de sesión, alimentado por Firebase (`onAuthStateChanged`), con reconciliación al arrancar. Sustituye a `esUidDeCuenta`.
- Estado «sesión vencida»: hay uid de cuenta y no hay usuario de Firebase.
- Bloque **Tu cuenta** en Perfil: estado, entrar, crear, salir, recuperar contraseña.
- `entrarConCorreo` y `recuperarContrasena`.
- **Algoritmo de entrada a una cuenta** (§3.4), usado desde Perfil en esta entrega y desde P7 en la 19.2.
- Cerrar sesión con borrado local seguro (§3.5).
- Sello de restauración: la puerta del onboarding y el bloque de sincronización se releen cuando termina una bajada (cierra el techo de DP-17.11 y DP-17.14).
- `completedAt` como hecho que no se deshace en la fusión de `shared/onboarding`.
- Bloque de sincronización: acuse del botón (DP-17.15) y las dos direcciones separadas en el copy (DP-17.16).
- Apple oculto en web, en Perfil y en P7 (DP-19.4).

**Entrega 19.2 — Cuenta existente** (instrucción aparte, después de validar 19.1)
- P7 distingue cuenta nueva de cuenta existente. Con cuenta existente, usa el algoritmo de §3.4 y, si la nube trae `completedAt`, sale del onboarding (cierra DP-19.5 y revierte D7).
- Recuperación del PIN con cuenta de correo (DP-19.6).

**Fuera:** verificación obligatoria de correo, 2FA, cambio de correo, borrar cuenta (SPEC_24), migrar `signInWithPopup` a redirect/nativo (SPEC_21), Apple en web, emulador de Firebase.

**`ArranqueProvisional` se queda.** Sigue siendo el único que escribe `strivo.uid.local`. Lo que cambia es que deja de decidir solo con `localStorage`.

## 3. Experiencia y comportamiento

### 3.1 Resolución del estado de sesión

Al arrancar, antes de preparar el árbol, se espera a que Firebase resuelva su sesión guardada. Es una lectura local y funciona sin red. Precedencia:

| Firebase | `strivo.uid.local` | Estado | uid vigente |
|---|---|---|---|
| sin configurar | cualquiera | `sinConfigurar` | el de `localStorage` (como hoy) |
| usuario U | uid U | `conCuenta` | U |
| usuario U | `local-…` u otro uid | `conCuenta` tras **entrar a la cuenta** (§3.4) desde ese uid | U |
| sin usuario | `local-…` | `sinCuenta` | el local |
| sin usuario | uid de cuenta | `vencida` | el de cuenta (lo escrito sigue visible) |

- En `vencida` **nada se borra y nada se bloquea**: se lee y se escribe en local como siempre. La cola no arranca, porque las reglas rechazarían la subida. Lo escrito se encola y sube cuando la persona vuelve a entrar.
- Con la app abierta, `onAuthStateChanged` sigue escuchando. Si el usuario pasa a `null` sin que la persona haya cerrado sesión (revocación, borrado de la base de Auth), el estado pasa a `vencida` y no se borra nada.
- La cola arranca **solo** en `conCuenta`, y la restauración se evalúa **solo** en `conCuenta`.

### 3.2 Arranque con sesión

Igual que hoy, con el umbral. La cola y la restauración siguen las reglas de 17A.

### 3.3 Arranque sin sesión

Igual que hoy. El bloque Tu cuenta dice `sinCuenta` y ofrece entrar o crear.

### 3.4 Entrar a una cuenta — algoritmo único (DP-19.5, DP-19.7)

Se aplica siempre que la sesión pasa de un uid de origen (`local-…` o una cuenta vencida) a una cuenta que ya existía. Desde Perfil en 19.1, desde P7 en 19.2.

1. **Restaurar primero.** `restaurar(cuenta)` baja lo de la cuenta al árbol local de su uid, con las reglas de 17A. Mientras dura, se ve la frase de restauración; techo de 15 s (`TECHO_DE_ESPERA_MS`).
2. **Mudar después, con regla por colección:**
   - **`shared/*` → gana la cuenta.** Una fila del origen solo entra si en la cuenta no hay nada o lo que hay es semilla. Lo contestado en una sesión anónima no reemplaza el perfil, el género, los horarios ni el expediente de quien ya usaba esa cuenta.
   - **`diario/*` y `breathing/*` → gana lo más nuevo por marca**, que es la regla de 17A entre dispositivos. Si gana el origen, reemplaza al destino y se encola. Si gana el destino, la fila del origen **se queda bajo el uid de origen**: no se borra.
   - Journal, favoritos, recientes y sesiones tienen ids propios y **no colisionan**. La colisión real es solo `morningEntry`, `nightRitual` y `dayState` del mismo día.
3. **Si la restauración no termina** (sin red, interrumpida o techo): `shared/*` del origen **no se muda** —se queda bajo el uid de origen— y el resto se muda con la regla del punto 2 contra lo que haya en local. La marca no se pone, así que el siguiente arranque restaura.
4. `saveAuthRecord` y cambio de uid, como hoy en `adoptarArbol`.

**Residuo aceptado y documentado:** cuando dos versiones del mismo día chocan, la más vieja deja de verse (se conserva en local bajo el uid de origen si era la anónima). Es la misma regla que ya rige entre dos teléfonos con la misma cuenta.

**Cuenta nueva** (recién creada): `adoptarArbol` como hoy, sin restaurar.

### 3.5 Cerrar sesión (DP-19.1)

1. Confirmación (componente nuevo, mínimo y reutilizable).
2. Antes de mostrarla se intenta `flush`. **Si después la cola no está vacía**, la confirmación cambia de texto, explica que hay cosas que todavía no llegan a la cuenta y ofrece solo «Quedarme». No se cierra sesión hasta que todo haya subido: borrar ahí sería perder lo escrito.
3. Con la cola vacía, al confirmar: `signOut`, se borra del dispositivo todo lo de ese uid (registros, cola, marca de restauración, último resultado, `pinConfig` incluido), y se acuña un uid local nuevo.
4. Con el árbol vacío, **se muestra el onboarding**. Es lo que necesita la siguiente persona en un teléfono compartido, que es el motivo de borrar.
5. Las filas «conservadas» bajo uids anónimos antiguos no se tocan.

### 3.6 Recuperar contraseña

Campo de correo y respuesta idéntica exista o no la cuenta. Sin red: `error.sinConexion`, y el formulario conserva lo escrito.

### 3.7 Casos límite

- **Sin `.env.local`:** el bloque dice `sinConfigurar` y no ofrece nada. P7 se sigue ofreciendo para saltar.
- **Sin conexión al entrar:** mensaje neutro y el formulario se conserva.
- **Sesión vencida:** el bloque lo dice y ofrece entrar. Si se entra con la **misma** cuenta, se reanuda la cola y no hay mudanza. Si se entra con **otra**, §3.4 desde el uid vencido.
- **La puerta del onboarding se relee** cuando termina una restauración de la sesión vigente. Si la persona está dentro del onboarding y la nube trae `completedAt`, sale a Hoy por la transición de siempre.
- **`completedAt` no se deshace:** en la fusión de `shared/onboarding`, si cualquiera de los dos lados trae `completedAt` (o `tourCompletedAt`), el resultado lo conserva aunque gane el otro lado por marca.

## 4. Copy exacto

Va en `copy.cuenta.*`. P7 conserva su copy; se reutilizan sus claves donde sirvan, sin duplicar.

| Clave | Texto |
|---|---|
| `bloque.titulo` | Tu cuenta |
| `estado.sinCuenta` | Sin cuenta. Puedes crear una cuando quieras. |
| `estado.conCuenta` | {correo} |
| `estado.vencida` | La sesión se cerró en este teléfono. Lo que escribiste sigue aquí; entra de nuevo para que se respalde. |
| `estado.sinConfigurar` | Las cuentas no están disponibles en esta versión. |
| `acciones.entrar` | Entrar a mi cuenta |
| `acciones.crear` | Crear una cuenta |
| `acciones.salir` | Cerrar sesión |
| `formulario.tituloEntrar` | Entrar |
| `formulario.tituloCrear` | Crear una cuenta |
| `formulario.correo` | Correo |
| `formulario.contrasena` | Contraseña |
| `formulario.entrar` | Entrar |
| `formulario.crear` | Crear cuenta |
| `formulario.google` | Continuar con Google |
| `formulario.olvide` | Olvidé mi contraseña |
| `formulario.volver` | Volver |
| `recuperar.titulo` | Recuperar acceso |
| `recuperar.texto` | Te enviaremos un enlace para elegir una contraseña nueva. |
| `recuperar.boton` | Enviarme un enlace |
| `recuperar.enviado` | Si ese correo tiene una cuenta, recibirás un enlace en unos minutos. |
| `salir.titulo` | Cerrar sesión |
| `salir.texto` | Lo que escribiste está guardado en tu cuenta y vuelve cuando entres. De este teléfono se quita todo, también el PIN del journal. |
| `salir.pendiente` | Hay cosas que todavía no llegan a tu cuenta. Cuando vuelva la conexión podrás cerrar sesión sin perder nada. |
| `salir.confirmar` | Cerrar sesión |
| `salir.cancelar` | Quedarme |
| `error.credenciales` | Ese correo y esa contraseña no coinciden. |
| `error.sinConexion` | Sin conexión. Inténtalo cuando vuelva. |
| `error.generico` | Algo no salió bien. Inténtalo de nuevo en un momento. |

**Bloque de sincronización (DP-17.15, DP-17.16)**, en `diario.perfil.sincronizacion` o donde vivan hoy:

| Clave | Texto |
|---|---|
| `alDia` | Lo de este teléfono está guardado en tu cuenta. |
| `reintento.sinExito` | Lo intentamos y todavía no se pudo. Seguiremos solos cuando haya conexión. |
| `shared.restauracion.error` | Lo que ya tenías en tu cuenta todavía no termina de llegar a este teléfono. Nada se perdió y lo intentaremos de nuevo. |

Ningún texto lleva género, signo de exclamación ni código de error.

## 5. Interfaz y accesibilidad

- Tu cuenta sigue el patrón de `Bloque.jsx` y se añade a `BLOQUES` antes de `sincronizacion`.
- Los campos reutilizan `src/components/shared/Campo.jsx`. Usan `autocomplete` `email`, `current-password` (entrar) y `new-password` (crear). Los errores van con `aria-describedby` y el foco va al primer campo con error.
- La confirmación es un diálogo con foco atrapado, cierre con Escape equivalente a «Quedarme», y `prefers-reduced-motion` respetado.
- El acuse del reintento va en una región `aria-live="polite"`.

## 6. Requisitos técnicos

- **Firebase 10.14.1.** `auth.authStateReady()` para esperar la sesión guardada; si no está disponible, la primera emisión de `onAuthStateChanged`.
- **Persistencia:** la de fábrica. Nada de `setPersistence` en web.
- **Seguridad:** contraseñas nunca en logs, en estado persistido ni en la cola. Las reglas de Firestore no se tocan.
- **Tareas de la fundadora en la consola, antes de la validación manual:** habilitar Google; dominios autorizados (`localhost` y el dominio de Netlify); plantillas de correo en español; comprobar que la protección contra enumeración de correos está activa.

## 7. Criterios de aceptación

**19.1**
1. Con cuenta, cerrar el navegador por completo y reabrir: sigue `conCuenta`, Perfil muestra el correo y la cola arranca.
2. Borrar a mano `firebaseLocalStorageDb` con `strivo.uid.local` de cuenta: estado `vencida`, lo escrito sigue visible y editable, cero escrituras a Firestore, y el Journal abre.
3. Entrar desde Perfil a una cuenta con datos, partiendo de un árbol anónimo con onboarding hecho y una mañana del mismo día: el perfil de la cuenta no cambia en Firestore; la mañana más nueva es la que queda; la otra sigue en IndexedDB bajo el uid de origen.
4. Cerrar sesión con la cola vacía: uid local nuevo, nada del uid anterior en IndexedDB, onboarding visible, sin errores. Al volver a entrar, vuelve todo vía restauración.
5. Cerrar sesión con escrituras pendientes y sin red: la confirmación muestra `salir.pendiente`, solo ofrece «Quedarme» y no se borra nada.
6. Recuperar contraseña: correo existente e inexistente dan el mismo texto en pantalla.
7. Entrar con Google en web. El botón de Apple no aparece ni en Perfil ni en P7.
8. Sin `.env.local`: la app funciona entera, el bloque dice `sinConfigurar` y P7 se salta.
9. Sin cuenta, la app se usa indefinidamente sin ninguna interrupción nueva.
10. Una restauración que cruza el techo de 15 s: al terminar, la puerta del onboarding y el bloque de sincronización se actualizan sin recargar.
11. El reintento sin éxito muestra `reintento.sinExito`; con éxito, el estado cambia.
12. Suite verde, los dos lint verdes, al menos 25 pruebas nuevas.

**19.2** (detallados en su instrucción)

13. P7 con cuenta existente que trae `completedAt`: tras entrar, se ve la frase de restauración y se sale a Hoy; en Firestore no cambian `shared/profile` ni `shared/onboarding`.
14. P7 con cuenta nueva: igual que hoy.
15. Recuperar el PIN con cuenta de correo: pide la contraseña, verifica y deja elegir un PIN nuevo.

## 8. Plan de pruebas

- **Unitarias:** las cinco filas de la tabla de §3.1; el algoritmo de §3.4 (gana la cuenta en `shared`, gana lo más nuevo en `diario`, origen conservado, restauración fallida sin mudar `shared`); `completedAt` no se deshace; borrado local por uid; salir con cola pendiente; mapeo de errores a copy.
- **Dobles:** `vi.mock('firebase/auth')` y `fake-indexeddb`, el patrón de `sync.test.js`.
- **Manuales:** los criterios contra `strivo-fe04f`.
- **Regresión:** onboarding de ocho pantallas igual; P7 saltable; `adoptarArbol` igual con cuenta nueva; DP-17.10 sigue cerrada; Hoy, Journal, PIN, Respiración e Historial intactos.

## 9. Riesgos

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Dos fuentes del uid se desincronizan | Un resolutor con tabla de precedencia y prueba por fila | Revertir el commit |
| Borrar lo local al salir pierde algo sin subir | No se borra con la cola pendiente | DP-19.1 se puede invertir |
| La regla «más nuevo gana» oculta una versión del mismo día | Se conserva en local bajo el uid de origen; documentado | — |
| `authStateReady` retrasa el arranque | Lectura local, dentro del velo existente | — |
| `signInWithPopup` en WebView | SPEC_21 | — |

## 10. Orden

Segundo del plan. 19.1 y después 19.2, cada una con validación manual y push antes de la siguiente. Prerrequisito de 21, 24 y 25.

**Regla de seguridad hasta cerrar 19.2:** no entrar por P7 con ninguna cuenta que tenga datos reales en la nube. Desde 19.1, la forma segura de entrar a una cuenta existente es desde Perfil.

## Decisiones

**Cerradas el 1 oct 2026** (recomendación aprobada por la fundadora):
- **DP-19.1** — Salir borra lo local, solo con la cola vacía. El PIN se va con lo demás y el copy lo dice. Tras salir se muestra el onboarding.
- **DP-19.2** — Componente de confirmación nuevo y mínimo.
- **DP-19.3** — Deja de bloquear el código. Plantillas y remitente se configuran en la consola antes de App Review.
- **DP-19.4** — Apple oculto en web hasta SPEC_21.
- **DP-19.5** — En P7, una cuenta existente gana sobre lo contestado en la sesión; si trae `completedAt`, se sale del onboarding (19.2).
- **DP-19.6** — PIN con cuenta de correo: se reautentica pidiendo la contraseña (19.2).
- **DP-19.7** — `shared/*`: gana la cuenta. `diario/*` y `breathing/*`: gana lo más nuevo; el perdedor anónimo se conserva bajo su uid.
- **DP-17.11 (techo)** y **DP-17.14** — Sello de restauración que relee la puerta y el bloque.
- **DP-17.15** — Acuse en región `aria-live`, sin cifras.
- **DP-17.16** — El copy separa las dos direcciones.
- **DP-17.7** — `esUidDeCuenta` se retira.
