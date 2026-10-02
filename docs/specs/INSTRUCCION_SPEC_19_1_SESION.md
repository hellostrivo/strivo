# SPEC_19.1 — Instrucción de ejecución: sesión real

**Para:** Claude Code
**Rama:** `strivo` · **Commit de referencia:** `6c80b3f` (24 sep 2026)
**Gobierna:** `docs/specs/SPEC_19_SESION_REAL_Y_CUENTA.md` (v2.1) + `docs/specs/SPEC_00B_CONVENCIONES_LANZAMIENTO.md` + `CLAUDE.md`
**Alcance:** la entrega 19.1. La 19.2 (P7 con cuenta existente y PIN con correo) tiene instrucción propia y **no se toca aquí**.
**Versión:** 1.0 — 1 oct 2026.

---

## 0. Antes de escribir una sola línea

1. Lee la SPEC v2.1 entera, SPEC_00B y las secciones de `CLAUDE.md` sobre SPEC_17A («Lo que subió a la nube vuelve a bajar» y las trampas de la restauración manual).
2. Inspecciona: `src/lib/firebase.js`, `src/lib/sesion.js`, `src/components/ArranqueProvisional.jsx`, `src/App.jsx` (`Entrada`), `src/onboarding/cuenta.js`, `src/onboarding/useOnboarding.js`, `src/components/onboarding/Cuenta.jsx`, `src/lib/db/local.js` (`mudarUid`), `src/lib/db/conflictos.js`, `src/lib/db/restaurar.js`, `src/lib/db/sync.js`, `src/perfil/bloques.js`, `src/perfil/useSincronizacion.js`, `src/components/perfil/Perfil.jsx`, `src/components/perfil/Bloque.jsx`, `src/components/shared/Campo.jsx`, `src/copy/index.js`, y las pruebas de todos ellos.
3. **Reporta cualquier desvío entre esta instrucción y lo que encuentres, y espera aprobación antes de codificar.** Los puntos marcados **REPORTA** se reportan aunque no haya desvío.
4. No implementes nada fuera de la §4. En particular: **no cambies el flujo de P7** (solo se oculta Apple), **no toques el PIN** y no instales el emulador.

---

## 1. Qué resuelve esta entrega

Hoy «hay cuenta» significa que el uid no empieza por `local-`. Firebase guarda su sesión, pero nadie la escucha. No hay forma de entrar fuera de P7, ni de salir, ni de recuperar la contraseña. Esta entrega:

- pone a Firebase como fuente del estado de sesión;
- añade el bloque Tu cuenta;
- define cómo se entra a una cuenta con datos sin destruir nada;
- define cómo se sale sin perder lo que no subió.

**Lo que no hace:** no cambia P7, no toca el PIN, no migra `signInWithPopup`, no borra cuentas.

---

## 2. Decisiones cerradas, no se reabren

DP-19.1, 19.2, 19.3, 19.4, 19.7, DP-17.7, el techo de DP-17.11, DP-17.14, 17.15 y 17.16, tal como las cierra la SPEC v2.1, sección «Decisiones». DP-19.5 y DP-19.6 se cierran en 19.2.

---

## 3. Desvíos ya conocidos

| # | Desvío | Qué se hace |
|---|---|---|
| D1 | La v2.0 pedía `browserLocalPersistence` | No se fija persistencia en web |
| D2 | `crearConCorreo` crea si el correo no existe | `entrarConCorreo` nuevo, aparte |
| D3 | `comoMotivo` traduce `wrong-password`/`invalid-credential` a `correoEnUso` | Para entrar, motivo `credenciales`. **P7 conserva su mapeo** |
| D4 | No hay componente de confirmación | Se crea uno mínimo |
| D5 | `sesion.test.js:107` comprueba el comentario de deuda de `esUidDeCuenta` | Se reemplaza por la prueba del resolutor |
| D6 | `pin.js` dice que no hay auth por correo en el repo | No se toca en 19.1; lo corrige 19.2 |

---

## 4. El trabajo, por archivo

### 4.1 Resolutor de sesión — `src/lib/sesion.js`

- *Actual:* `esUidDeCuenta(uid)` decide por prefijo.
- *Esperado:* una función pura `resolverSesion({ configurado, usuario, uidGuardado })` que devuelve `{ estado, uid, requiereEntrada }`, con `estado ∈ {sinConfigurar, sinCuenta, conCuenta, vencida}`, según la tabla de la SPEC §3.1. `requiereEntrada` es el uid de origen cuando hay usuario de Firebase y el uid guardado es otro (fila 3 de la tabla); si no, `null`.
- Una función asíncrona `leerSesionGuardada()` que espera a Firebase (`authStateReady()` si existe en 10.14.1; si no, primera emisión de `onAuthStateChanged`) y devuelve `{ configurado, usuario }`. Carga el SDK bajo demanda, como `cuenta.js`.
- `esUidDeCuenta` desaparece. Todo llamador pasa a preguntar por `estado === 'conCuenta'`.
- `prepararArbol` restaura solo si se le dice que la sesión es `conCuenta`. Mantén la coalescencia por uid y su comentario.

**REPORTA:** la lista de llamadores de `esUidDeCuenta` y cómo recibe cada uno el estado nuevo.

### 4.2 Estado de sesión en la app — `src/components/ArranqueProvisional.jsx`

- Sigue siendo el único que escribe `strivo.uid.local`.
- Al montar: `leerSesionGuardada()` → `resolverSesion` → si `requiereEntrada`, ejecuta `entrarACuenta(origen, usuario)` (§4.4) con la frase de restauración → `prepararArbol`.
- Expone el estado por un contexto (`useSesion()`): `{ uid, estado, correo, selloRestauracion, entrar, crear, salir }`. Mantén la firma `children(uid, cambiarUid)` para no tocar `Entrada` más de lo necesario.
- `onAuthStateChanged` queda suscrito mientras la app está montada. Si el usuario pasa a `null` sin que se haya llamado a `salir`, el estado pasa a `vencida` y no se borra nada.
- La cola (`startSync`) arranca solo en `conCuenta` y se detiene al salir de ese estado.
- **`selloRestauracion`:** un número que cambia cada vez que termina una `restaurar()` del uid vigente, con éxito o sin él, también la que sigue después del techo y la del reintento al volver la red. Es lo que cierra el techo de DP-17.11 y DP-17.14.

**REPORTA:** si prefieres un componente proveedor aparte en vez de que el contexto viva dentro de `ArranqueProvisional`, y por qué. La regla que no cambia: un solo escritor de `strivo.uid.local`.

### 4.3 La puerta se relee — `src/App.jsx` → `Entrada`

- *Actual:* el efecto de la puerta depende de `[uid]`.
- *Esperado:* depende de `[uid, selloRestauracion]`. Si la persona está dentro del onboarding y la relectura dice que ya no está pendiente, sale por la misma transición que usa `onTerminado`. Si no está en el onboarding, la relectura no cambia nada visible.
- `presentacionResuelta` sigue protegiendo la presentación ya vista.

### 4.4 Entrar a una cuenta — archivo nuevo `src/lib/entradaCuenta.js`

`entrarACuenta(uidOrigen, cuenta, { enRestauracion, techoMs })` implementa la SPEC §3.4:

1. `restaurar(cuenta.uid)` con techo (reutiliza `conTecho` de `sesion.js`, exportándolo).
2. `mudarUid(uidOrigen, cuenta.uid, { politica })` con la política por colección:
   - `shared/*`: gana el destino salvo que sea semilla (`esSemilla`) o no exista.
   - Las demás: gana lo más nuevo por `marcaDe`. Si gana el origen, reemplaza y se encola. Si gana el destino o empatan, el origen se queda donde está y cuenta como `conservados`.
   - Si la restauración no terminó bien, `shared/*` del origen no se muda.
3. `shared.saveAuthRecord` como en `adoptarArbol`.
4. Devuelve `{ uid, mudados, conservados, restauracion }`.

**`src/lib/db/local.js` → `mudarUid`:** añade el tercer argumento opcional. **Sin él, el comportamiento es idéntico al de hoy** (gana el destino, se conserva el origen, la semilla no se encola). Así `adoptarArbol` y sus pruebas no cambian. La regla «la semilla no sube» (DP-17.10) se mantiene en las dos políticas.

**`src/lib/db/restaurar.js` → `aplicar`, solo para `shared/onboarding`:** si local o remoto traen `completedAt` (o `tourCompletedAt`) no nulo, el documento resultante lo conserva aunque gane el otro lado. Es el único caso de fusión por campo; comenta por qué. Si gana lo local y hubo que añadir el campo, se escribe con `sync: true` para que la nube también lo tenga.

**REPORTA:** si la política cabe en `mudarUid` sin duplicar la lógica de `ganaRemoto`, o si conviene una función hermana en `conflictos.js`. Una regla, un sitio.

### 4.5 Funciones de cuenta — `src/onboarding/cuenta.js`

Añade, sin cambiar las existentes:

- `entrarConCorreo(correo, contrasena)` → `{ ok, uid, email }` o `{ ok: false, motivo }`, con motivos `credenciales`, `sinConexion` (`auth/network-request-failed`), `sinConfigurar` y `generico`.
- `recuperarContrasena(correo)` → **siempre** `{ ok: true }` salvo `sinConexion` y `sinConfigurar`. `user-not-found` y `invalid-email` también devuelven `ok`.
- `cerrarSesion()` → `signOut`.
- `PROVEEDORES_WEB = ['google']`. Apple sale de la lista hasta SPEC_21.

**REPORTA:** si `cuenta.js`, que vive en `onboarding/`, debe moverse a `lib/` ahora que Perfil también lo usa. No lo muevas sin aprobación.

### 4.6 Borrar lo local de un uid — `src/lib/db/local.js`

`borrarUid(uid)`: en una transacción, todos los registros del índice `byUser` para ese uid y todas sus entradas de cola. Además `retirarMarcaDeRestauracion(uid)` y olvidar su `ultimoResultado`. **Nunca** toca otros uids.

### 4.7 Salir — en el contexto de sesión

1. `flush(uid)` y `getPendingCount(uid)`.
2. Si quedan pendientes: la confirmación muestra `salir.pendiente` y solo «Quedarme».
3. Si no: confirmación normal → `cerrarSesion()` → `borrarUid(uid)` → uid local nuevo en `strivo.uid.local` → `prepararArbol` siembra → `Entrada` lee la puerta y muestra el onboarding.

### 4.8 Bloque Tu cuenta — Perfil

- `src/perfil/bloques.js`: `['nombre', 'genero', 'horarios', 'cuenta', 'sincronizacion']`.
- `src/components/perfil/Perfil.jsx`: el bloque lee `useSesion()`. Vistas: estado y acciones → formulario de entrar o crear → recuperar → confirmación de salir. **Sin rutas nuevas:** son vistas dentro del bloque, para no tocar el router.
- Crear desde Perfil usa `crearConCorreo`. Si el correo ya existía y entró, es una cuenta existente → `entrarACuenta`. Si es nueva → `adoptarArbol`. Para distinguir, compara si había restauración posible: **REPORTA** cómo lo detectas sin tocar la firma de `crearConCorreo` (19.2 sí la toca), o propón tocarla ya.
- Google desde Perfil: `entrarConProveedor('google')` → `entrarACuenta` (que, con una cuenta nueva, no baja nada y muda todo).
- Campos con `Campo.jsx`; `autocomplete` según la SPEC §5; foco al primer error; errores con `aria-describedby`.

### 4.9 Confirmación — `src/components/shared/Confirmacion.jsx` (nuevo)

Diálogo `role="dialog"` `aria-modal="true"`, título, texto, una o dos acciones. Foco atrapado, Escape = cancelar, foco devuelto al disparador. Sin animación si `prefers-reduced-motion`. Contraste por tokens, sin colores nuevos.

### 4.10 Bloque de sincronización — `src/perfil/useSincronizacion.js`

- Recalcula también cuando cambia `selloRestauracion` (DP-17.14).
- `estadoDe` usa el estado de sesión, no el prefijo. En `vencida`, el bloque de sincronización dice `sinCuenta`; el que explica la situación es Tu cuenta.
- `reintentar` espera el resultado. Si `flush` devuelve `skipped: 'en_curso'`, espera a que termine ese y relee. Si después sigue habiendo pendientes o la restauración sigue fallida, muestra `reintento.sinExito` en `aria-live="polite"`. Con éxito, el cambio de estado es el acuse.

### 4.11 P7 — solo Apple

`src/components/onboarding/Cuenta.jsx`: los botones de proveedor salen de `PROVEEDORES_WEB`. **Nada más cambia en P7.**

### 4.12 Copy — `src/copy/index.js`

Las claves de la SPEC §4, literales. Las tres claves del bloque de sincronización y de `shared.restauracion.error` se **reemplazan**, no se duplican. Si alguna clave de P7 sirve tal cual, reutilízala y dilo en el reporte.

### 4.13 Documentación

- `CLAUDE.md`: sección «Sesión real (SPEC_19.1, oct 2026)», con la tabla de precedencia, el algoritmo de entrada y su residuo aceptado, la regla de salir con cola pendiente y la regla de seguridad que sigue vigente hasta 19.2. Retira o actualiza los párrafos que dicen que `esUidDeCuenta` es la señal de cuenta.
- Comentarios de cabecera actualizados en `ArranqueProvisional.jsx` y `sesion.js`.

---

## 5. Copy exacto

El de la SPEC §4, sin cambiar una coma. Si una clave choca con la estructura de `copy/index.js`, **REPORTA** la alternativa antes de renombrar.

---

## 6. Criterios de aceptación

**Automáticos (suite)**

1. `resolverSesion`: una prueba por cada fila de la tabla de §3.1 de la SPEC.
2. `entrarACuenta`, con dobles:
   - perfil de la cuenta + perfil anónimo sellado → gana la cuenta y no se encola `shared/profile`;
   - perfil de la cuenta semilla + perfil anónimo escrito → entra el anónimo y se encola;
   - mañana del mismo día más nueva en el origen → reemplaza y se encola;
   - más nueva en el destino → el origen queda bajo su uid y cuenta en `conservados`;
   - journal con ids distintos → se mudan todos;
   - restauración fallida → `shared/*` del origen no se muda.
3. `mudarUid` sin política: todas las pruebas existentes pasan sin cambios.
4. `completedAt` no se deshace en `aplicar`, en los dos sentidos.
5. `borrarUid`: borra registros y cola del uid, deja intactos los de otro uid, retira marca y resultado.
6. Salir con cola pendiente no llama a `signOut` ni a `borrarUid`.
7. `recuperarContrasena` da `ok` para `user-not-found`.
8. `entrarConCorreo` mapea `invalid-credential` a `credenciales`.
9. `useSincronizacion` recalcula al cambiar el sello; `reintentar` espera un `flush` en curso.
10. `Entrada` sale del onboarding si el sello cambia y la puerta ya no está pendiente.
11. Ningún llamador de `esUidDeCuenta` queda en `src/`.
12. Apple no se renderiza en P7 ni en Perfil.
13. Al menos 25 pruebas nuevas; suite, `lint:copy`, `lint:contraste` y `build` verdes.

**Manuales:** los valida la fundadora contra `strivo-fe04f`. No los automatices.

- **M1.** Con cuenta: cerrar el navegador entero y reabrir → Perfil muestra el correo y «Lo de este teléfono está guardado en tu cuenta.».
- **M2.** Con cuenta: en DevTools, borrar solo `firebaseLocalStorageDb` y recargar → Tu cuenta dice `estado.vencida`; Hoy y Journal se leen y se escriben; en la pestaña Red no hay escrituras a Firestore. Volver a entrar con la misma cuenta → lo escrito sube.
- **M3.** Ventana nueva sin cuenta: hacer el onboarding sin P7 y escribir la mañana de hoy. Entrar desde Perfil a la cuenta de prueba (que ya tiene mañana de hoy) → en Firestore, `shared/profile` y `shared/onboarding` no cambian; queda la mañana con `updatedAt` más reciente.
- **M4.** Con la cola vacía: cerrar sesión → aparece el onboarding; en IndexedDB `strivo` no queda ninguna fila del uid de cuenta.
- **M5.** Con escrituras pendientes y red en Offline: «Cerrar sesión» → `salir.pendiente` y solo «Quedarme».
- **M6.** Recuperar contraseña con un correo existente y con uno inventado → el mismo texto. El correo llega en español.
- **M7.** Entrar con Google. No hay botón de Apple ni en Perfil ni en P7.
- **M8.** Sin `.env.local`: la app entera funciona, Tu cuenta dice `sinConfigurar` y P7 se salta.
- **M9.** Red en Slow 3G al recargar con cuenta y sin datos locales: si el velo cae a los 15 s antes de que termine la bajada, al terminar la app sale del onboarding sola o el bloque de sincronización se actualiza, sin recargar.

---

## 7. Reglas de arquitectura que esto roza

- **Nada se pierde.** El algoritmo de entrada (residuo aceptado: la versión vieja del mismo día deja de verse, pero no se borra si era la anónima) y salir con cola pendiente.
- **Nada se bloquea.** `vencida` no oculta nada. El único «no» de esta entrega es no cerrar sesión con cosas sin subir, y protege lo escrito.
- **Firestore de solo escritura salvo `restaurar.js`.** No se añade ninguna lectura de Firestore fuera de ahí; la prueba que recorre `src/` lo sigue exigiendo.
- **D14:** la semilla no sella, no sube y no pisa, también con la política nueva.
- **Cero strings, AAA, `prefers-reduced-motion`.**
- **Un solo escritor de `strivo.uid.local`.**

---

## 8. Fuera de alcance

Cambios de flujo en P7 (19.2), PIN (19.2), redirect u OAuth nativo (SPEC_21), Apple, borrar cuenta (SPEC_24), verificación de correo, 2FA, cambio de correo, emulador, `onSnapshot`.

---

## 9. Al terminar

Reporta: archivos tocados, número de pruebas antes y después, resultado de los lint y del build, cada **REPORTA** con su respuesta, y cualquier cosa que hayas dejado sin hacer y por qué. **Commits separados por tema y sin push**: el push lo hace la fundadora después de la validación manual.
