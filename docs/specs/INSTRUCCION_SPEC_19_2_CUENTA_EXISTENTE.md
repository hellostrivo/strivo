# SPEC_19.2 — Instrucción de ejecución: cuenta existente en P7 y PIN con correo

**Para:** Claude Code
**Rama:** `strivo` · **Commit de referencia:** `6830d48` (1 oct 2026)
**Gobierna:** `docs/specs/SPEC_19_SESION_REAL_Y_CUENTA.md` (v2.1) + `docs/specs/INSTRUCCION_SPEC_19_1_SESION.md` (v1.1) + `docs/specs/ADENDA_SPEC_19_1_VALIDACION_01-10-2026.md` + `SPEC_00B` + `CLAUDE.md`
**Alcance:** la entrega 19.2. Cierra DP-19.5 y DP-19.6, y con ellas la regla de seguridad de P7.
**Versión:** 1.0 — 1 oct 2026.

---

## 0. Antes de escribir una sola línea

1. Lee la SPEC v2.1 (§3.4, §3.7, §7 criterios 13–15), la instrucción 19.1 v1.1 entera (sobre todo los desvíos aprobados), la adenda de validación de 19.1 y la sección «Sesión real» de `CLAUDE.md`.
2. Inspecciona: `src/components/onboarding/Onboarding.jsx`, `src/components/onboarding/Cuenta.jsx`, `src/onboarding/useOnboarding.js`, `src/components/ArranqueProvisional.jsx` (`pasarACuenta`, `cambiarUid`, `fijarUid`), `src/lib/useSesion.js`, `src/lib/entradaCuenta.js`, `src/lib/cuenta.js`, `src/lib/db/conflictos.js` (`ganaOrigenAlMudar`), `src/lib/db/restaurar.js` (`hechosQueFaltan`), `src/presentacion/entrada.js` (`leerPuerta`, `aplicarLecturaDePuerta`), `src/App.jsx` (`Entrada`), `src/diario/pin.js` (`reautenticar`), `src/diario/usePin.js`, `src/components/diario/BloqueoPin.jsx`, `src/copy/index.js`, y las pruebas de todos ellos.
3. **Reporta cualquier desvío y espera aprobación antes de codificar.** Los puntos **REPORTA** se reportan aunque no haya desvío.
4. No implementes nada fuera de la §4.

---

## 1. Qué resuelve esta entrega

**P7 sigue en el camino de antes de 19.1.** `Onboarding.jsx` llama a `acciones.adoptarCuenta` → `adoptarArbol` con cualquier cuenta, nueva o existente: no restaura, muda siempre, y al terminar el recorrido `terminar()` escribe el perfil y el expediente sellados bajo la cuenta. Eso sube y pisa en Firestore `shared/profile` y `shared/onboarding` de quien ya tenía cuenta (DP-19.5). Es el motivo de la regla de seguridad que sigue vigente.

**La recuperación del PIN no funciona con cuenta de correo.** `reautenticar` solo conoce Google y Apple por popup. Con proveedor `password` cae en la rama de Google y devuelve `no-verificado` (DP-19.6). Es el camino de casi cualquier persona.

**Lo que no hace:** no toca el algoritmo de entrada de 19.1 (salvo la §4.3), no cambia Tu perfil, no migra `signInWithPopup` (SPEC_21), no añade Apple.

---

## 2. Decisiones cerradas, no se reabren

- **DP-19.5:** en P7, una cuenta existente gana sobre lo contestado en la sesión. Si la cuenta trae `completedAt`, se sale del onboarding.
- **DP-19.6:** con cuenta de correo, la recuperación del PIN pide la contraseña y reautentica con `EmailAuthProvider.credential`.
- **Un solo camino a la cuenta:** P7 y Tu perfil entran por el mismo `pasarACuenta`. No se mantiene un segundo camino en el onboarding.
- Todo lo cerrado en 19.1 sigue cerrado.

---

## 3. Desvíos ya conocidos

| # | Desvío | Qué se hace |
|---|---|---|
| D1 | P7 usa `acciones.adoptarCuenta` → `adoptarArbol` sin mirar `nueva` | P7 entra por `pasarACuenta` del contexto de sesión (§4.1) |
| D2 | Con la restauración a medias en P7, el recorrido seguiría escribiendo bajo la cuenta | Mientras haya mudanza pendiente, el onboarding escribe bajo el uid de origen (§4.2) |
| D3 | `ganaOrigenAlMudar` no conserva `completedAt` en `shared/onboarding` | El mismo «hecho que no se deshace» de `restaurar.aplicar`, también al mudar (§4.3) |
| D4 | `pin.js` dice que no hay auth por correo en el repo | Se corrige el comentario con el cambio (§4.5) |
| D5 | Residuo de 19.1: la fila 3 del arranque con un onboarding anónimo a medias | Lo cierra D2; se retira la nota de `CLAUDE.md` |

---

## 4. El trabajo, por archivo

### 4.1 P7 entra por la sesión — `Onboarding.jsx`, `useOnboarding.js`, `useSesion.js`, `ArranqueProvisional.jsx`

- *Actual:* `entrarCon` y `crearCuenta` (en `Onboarding.jsx`) obtienen el resultado de `entrarConProveedor` o `crearConCorreo` y llaman a `acciones.adoptarCuenta(resultado)`, que hace `adoptarArbol` y `onUid`.
- *Esperado:* el contexto de sesión expone una acción `conectarCuenta(resultado)` que es `pasarACuenta`, ya existente. P7 la usa en lugar de `adoptarCuenta`:
  - **Cuenta nueva** (`nueva: true`): `adoptarArbol`, igual que hoy. El recorrido sigue a P8.
  - **Cuenta existente** (`nueva: false`): `entrarACuenta`, con el velo y la frase de restauración. Al volver:
    - si la puerta dice que el onboarding ya no está pendiente, `Entrada` sale como en un arranque (la presentación la decide `presentacionPendiente`, desvío D7 de 19.1);
    - si sigue pendiente, el recorrido continúa **en el paso siguiente a P7**, no en el `currentStep` que traiga la cuenta.
  - Antes de conectar se llama a `guardarAhora()`, como hoy.
- `acciones.adoptarCuenta` deja de usarse en P7. Si no tiene otro consumidor, se retira con sus pruebas.

**REPORTA:**
1. Si `Entrada` relee la puerta al cambiar el uid durante el onboarding con la lectura completa (`porSello: false`) y si eso ya basta para sacar a la persona en el caso de `completedAt` remoto, o si hace falta tocar `aplicarLecturaDePuerta`.
2. Si, al desmontarse el onboarding bajo el velo y volver a montarse, el estado del recorrido (`respuestas`, `paso`) se recarga del árbol nuevo y cómo garantizas lo de «continúa en el paso siguiente a P7».

### 4.2 Con mudanza pendiente, el onboarding escribe bajo el origen — `useOnboarding.js`

- *Actual:* tras la cuenta, `uidActual` pasa a ser el uid de la cuenta y todo lo que escribe el recorrido —`responder`, `guardarPerfil`, `guardarMotivo`, `terminar`— va bajo él, sellado. Si la restauración no terminó (mudanza pendiente), eso sube y pisa la nube cuando la cuenta ya tenía perfil.
- *Esperado:* mientras `mudanzaPendiente(uidCuenta)` devuelva un origen, **todas** las escrituras del onboarding van bajo ese origen. Cuando la mudanza se completa, lo escrito se muda con la política normal: en `shared/*` gana la cuenta salvo que lo suyo sea semilla, y lo del origen se conserva bajo su uid. La lectura de la puerta ya mira el origen en ese caso (F2 de 19.1), así que el recorrido es coherente consigo mismo.
- Aplica igual al onboarding montado por la fila 3 del arranque (Firebase con usuario, `localStorage` con uid local y la entrada aplazada). Con esto se cierra el residuo de 19.1 y se retira su nota de `CLAUDE.md`.

### 4.3 `completedAt` no se deshace al mudar — `src/lib/db/conflictos.js` y `src/lib/db/local.js`

- *Actual:* `ganaOrigenAlMudar('shared', origen, destino)` decide la fila entera. Si gana la cuenta y el origen traía `completedAt` que la cuenta no tiene (una cuenta que empezó el onboarding en otro teléfono y no lo terminó), el hecho se pierde y la puerta vuelve a abrir el onboarding.
- *Esperado:* en `shared/onboarding`, si el perdedor trae `completedAt` o `tourCompletedAt` y el ganador no, el resultado los lleva, y se encola. Es la misma regla que ya aplica `restaurar.aplicar`; **una regla, un sitio**: extrae `hechosQueFaltan` a `conflictos.js` y que la usen los dos.

**REPORTA** dónde cabe la fusión en `mudarUid` sin que la política deje de ser una función booleana, o propón el cambio de contrato mínimo.

### 4.4 Copy de P7

Sin claves nuevas si se puede. La frase del velo es `shared.restauracion.enCurso`. «Tu cuenta está lista.» (`p7.ready`) sigue apareciendo solo con cuenta nueva. **REPORTA** si con cuenta existente que continúa el recorrido hace falta algún texto en P7 antes de P8; si hace falta, propónlo y no lo escribas sin aprobación.

### 4.5 PIN con cuenta de correo — `src/diario/pin.js`, `src/diario/usePin.js`, `src/components/diario/BloqueoPin.jsx`

- *Actual:* `reautenticar(uid)` usa `reauthenticateWithPopup` con Google, o con Apple si el proveedor es `apple.com`. Con `password` falla siempre.
- *Esperado:*
  - `reautenticar(uid, { contrasena } = {})`. Si el proveedor del usuario es `password`:
    - sin `contrasena` devuelve `{ ok: false, motivo: 'pide-contrasena' }`;
    - con `contrasena` usa `reauthenticateWithCredential(usuario, EmailAuthProvider.credential(usuario.email, contrasena))`.
    - Errores: `wrong-password` o `invalid-credential` → `credenciales`; `network-request-failed` → `sin-conexion`; cualquier otro → `no-verificado`.
  - Google sigue por popup como hoy. Apple no se toca.
  - Firebase se sigue cargando bajo demanda dentro de la función: **el PIN no depende de la capa de autenticación**, y el comentario de `pin.js` que lo explica se mantiene. Se corrige la afirmación de que no hay auth por correo (D4).
  - **`BloqueoPin.jsx`, paso `recuperar`:** al pulsar «Verificar mi cuenta», si la respuesta es `pide-contrasena`, aparece un campo de contraseña con `Campo.jsx` (`type="password"`, `autocomplete="current-password"`, foco al aparecer, error con `aria-describedby`) y el mismo botón vuelve a intentar con ella. La contraseña vive solo en el estado del componente: nunca en logs, ni en almacenamiento, ni en la cola.
  - Con éxito, el flujo sigue igual que hoy hacia «PIN nuevo». **Ninguna entrada del Journal se toca.**
- **Copy nuevo** en `diario.journal.pin.recuperar` (o donde vivan hoy esas claves):

| Clave | Texto |
|---|---|
| `contrasena` | Contraseña de tu cuenta |
| `pideContrasena` | Escribe la contraseña de tu cuenta para verificarte. |
| `credenciales` | Esa contraseña no coincide con la de tu cuenta. |
| `sinConexion` | Sin conexión. Inténtalo cuando vuelva. |

### 4.6 Documentación

- `CLAUDE.md`: sección «Cuenta existente en P7 y PIN con correo (SPEC_19.2, oct 2026)». Debe incluir: un solo camino a la cuenta, la regla de escribir bajo el origen con mudanza pendiente, `completedAt` al mudar y el PIN con contraseña. **Retira la regla de seguridad de P7** y la nota del residuo de la fila 3.
- Comentarios de cabecera de `Onboarding.jsx`, `useOnboarding.js` (el párrafo de P7 que dice que el árbol se muda siempre) y `pin.js`.

---

## 5. Criterios de aceptación

**Automáticos (suite)**

1. P7 con `nueva: true` → `adoptarArbol`, sin restaurar; el recorrido sigue a P8.
2. P7 con `nueva: false` y cuenta con `completedAt` → `entrarACuenta`; el onboarding se desmonta y la puerta decide la presentación con `presentacionPendiente`.
3. P7 con `nueva: false` y cuenta sin `completedAt` → el recorrido continúa en el paso siguiente a P7.
4. P7 con `nueva: false` y restauración fallida → mudanza pendiente; `responder`, `guardarPerfil`, `guardarMotivo` y `terminar` escriben bajo el uid de origen; nada de `shared/*` se encola bajo la cuenta.
5. Tras completarse esa mudanza: `shared/profile` de la cuenta intacto, lo del origen conservado bajo su uid, y `completedAt` presente en `shared/onboarding` de la cuenta.
6. `hechosQueFaltan` vive en `conflictos.js` y la usan `restaurar.aplicar` y la mudanza; las pruebas de 19.1 sobre `completedAt` pasan sin cambios.
7. `reautenticar` con proveedor `password`: sin contraseña → `pide-contrasena`; correcta → `ok`; incorrecta → `credenciales`; sin red → `sin-conexion`. Con proveedor Google, igual que hoy.
8. `BloqueoPin`: el campo de contraseña solo aparece tras `pide-contrasena`; la contraseña no se escribe en ningún almacén ni en la cola (prueba que lo vigile).
9. Ningún consumidor de `adoptarCuenta` queda en P7.
10. Suite, `lint`, `lint:copy`, `lint:contraste`, `format:check` y `build` en verde. Corre la suite tres veces seguidas e informa si aparece la intermitente de `journal.test.js` (no la toques).

**Manuales:** los valida la fundadora contra `strivo-fe04f`, con la cuenta de prueba. No los automatices.

- **N1 · P7 con cuenta nueva.** Origen limpio, onboarding, en P7 crear una cuenta con un correo nuevo → «Tu cuenta está lista.», P8, Hoy. En Firestore aparece el árbol de la cuenta nueva con lo contestado.
- **N2 · P7 con cuenta existente.** Antes, anota en Firestore `name` y `updatedAt` de `shared/profile` y `completedAt` de `shared/onboarding` de la cuenta de prueba. Origen limpio, onboarding con el nombre «Prueba», en P7 entrar con la cuenta de prueba → frase de restauración → la app sale del onboarding (a Hoy, sin presentación) con el nombre «Alejandra». En Firestore, `shared/profile` y `shared/onboarding` siguen idénticos.
- **N3 · P7 con cuenta existente y red lenta.** Igual que N2, pero con el perfil de latencia de 5000 ms activado **justo antes** de entrar en P7. La frase cae a los 15 s y el recorrido continúa. Termínalo con el nombre «Prueba». Quita la limitación y espera: la app pasa a mostrar «Alejandra» sin volver a pedir el onboarding, y Firestore sigue idéntico.
- **N4 · PIN con cuenta de correo.** Con la cuenta de prueba: Journal → activar PIN → salir del Journal → volver → «Olvidé mi PIN» (o el enlace equivalente) → «Verificar mi cuenta» → aparece el campo de contraseña. Con una contraseña incorrecta sale el texto de credenciales; con la correcta se elige un PIN nuevo y las entradas del Journal siguen ahí.
- **N5 · Regresión.** Entrar desde Tu perfil (M3 de 19.1) y cerrar sesión (M4) siguen igual.

---

## 6. Reglas de arquitectura que roza

- **Nada se pierde.** Cierra la última puerta por la que P7 pisaba la nube. Lo contestado en una sesión anónima que pierde frente a la cuenta se conserva bajo el uid de origen.
- **Nada se bloquea.** Con la restauración lenta, el recorrido sigue; nunca se espera sin techo.
- **Un solo escritor de `strivo.uid.local`** (`ArranqueProvisional`): P7 deja de pedir el cambio por `onUid` directo y pasa por la sesión.
- **Firestore de solo escritura salvo `restaurar.js`.** Sin lecturas nuevas.
- **El PIN no es una credencial de cuenta** y su módulo no depende de la autenticación (§7.7.1). La contraseña de reautenticación no se guarda en ningún sitio.
- **D14:** la semilla ni sella, ni sube, ni pisa.
- **Cero strings, AAA, `prefers-reduced-motion`, sin exclamaciones.**

---

## 7. Fuera de alcance

Apple, redirect u OAuth nativo (SPEC_21), Face ID (SPEC_23), borrar cuenta (SPEC_24), verificación de correo, cambio de correo, la prueba intermitente de `journal.test.js`, y cualquier cambio a Tu perfil.

---

## 8. Al terminar

Reporta: archivos tocados; pruebas antes y después; lint, copy, contraste, formato y build; cada **REPORTA** con su respuesta; las tres corridas de la suite; las decisiones tuyas que no estaban aquí; y lo que dejaste sin hacer y por qué. **Commits separados por tema y sin push.**
