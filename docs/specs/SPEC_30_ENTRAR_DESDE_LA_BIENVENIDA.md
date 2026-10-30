# SPEC_30 — Entrar a una cuenta desde la bienvenida

**Para:** Claude Code
**Rama de referencia:** `strivo` · **Commit de referencia:** `330880a` (20 oct 2026)
**Gobierna:** esta SPEC + `docs/specs/INSTRUCCION_SPEC_19_2_CUENTA_EXISTENTE.md` + `docs/specs/INSTRUCCION_SPEC_19_1_SESION.md` (v1.1) + `SPEC_00B` + `CLAUDE.md`
**Alcance:** el onboarding (P1, P7 y una vista nueva de entrar). No toca Hoy, Tu perfil, el modelo de datos ni las reglas de fusión.
**Versión:** 1.0 — 20 oct 2026. Aprobada en su enfoque por la propietaria del producto el mismo día.

---

## 0. Antes de escribir una sola línea

1. Lee la sección «Sesión real» y «Cuenta existente en P7» de `CLAUDE.md`, y la instrucción de SPEC_19.2 entera.
2. Inspecciona: `src/components/onboarding/Onboarding.jsx`, `Bienvenida.jsx`, `Cuenta.jsx`, `Progreso.jsx`; `src/onboarding/useOnboarding.js`, `traspaso.js`, `escritura.js`, `pasos.js`; `src/components/ArranqueProvisional.jsx` (`pasarACuenta`, `entrar`, `entrarConGoogle`); `src/lib/entradaCuenta.js` (`entrarACuenta`, `arbolDeEntrada`); `src/lib/cuenta.js` (`entrarConCorreo`, `entrarConProveedor`, `recuperarContrasena`, `proveedoresDisponibles`); `src/components/perfil/TuCuenta.jsx`; `src/presentacion/entrada.js`; el objeto `CUENTA` y `copy.diario.onboarding` en `src/copy/index.js`; y las pruebas de todos ellos.
3. **Reporta cualquier desvío y espera aprobación antes de codificar.** Los puntos marcados **REPORTA** se reportan aunque no haya desvío.
4. No implementes nada fuera de la §5.

---

## 1. Qué resuelve

**Hoy, quien ya tiene cuenta no tiene por dónde decirlo hasta P7.** Alguien que cambia de teléfono o reinstala la app ve el video, la bienvenida y contesta seis pantallas —nombre, género, motivo, horarios, referencias, avisos—. En P7 no hay «Entrar»: hay «Continuar con Google» y «Crear cuenta», y por correo `crearConCorreo` intenta crear y, si el correo ya existe, entra sin decirlo. Después `entrarACuenta` restaura y, en `shared/*`, **gana la cuenta** (DP-19.5). Lo que acaba de contestar se queda bajo el uid anónimo y no lo vuelve a ver.

Técnicamente no se pierde nada y no se pisa nada en la nube. Pero se resuelve **descartando en silencio lo que la persona acaba de decir de sí misma**, después de hacerle recorrer seis pantallas que no le servían.

**La solución es una puerta discreta al principio, no una pregunta.** Un enlace «Ya tengo una cuenta» en P1, debajo de «Empezar». Quien llega por primera vez no gasta ni un toque más; quien vuelve se ahorra el recorrido entero.

**Y es el momento técnico más limpio.** En P1 el árbol local es la semilla de fábrica y nada más: `esSemilla` hace que la cuenta gane en todo, sin un solo choque. Cada paso contestado antes de entrar es un choque posible más.

---

## 2. Decisiones cerradas, no se reabren

- **D30-1 — No es una pregunta ni un paso.** No se añade una pantalla «¿Tienes cuenta?». Es un enlace secundario en P1. La cuenta respalda; no es la puerta (copy de P7).
- **D30-2 — Desde P1 solo se entra, nunca se crea con correo.** Se usa `entrarConCorreo`, que no crea nada. Un correo mal escrito no puede abrir una cuenta vacía a nombre de nadie (SPEC_19 §0, punto 6). Crear sigue siendo de P7 y de Tu perfil.
- **D30-3 — Quien entra a una cuenta con el onboarding terminado va directo a Hoy.** No se le vuelve a preguntar nada, tampoco lo que solo vive en el dispositivo:
  - **La preferencia de frases** (`shared/frases`) es solo local por diseño (SPEC_29) y llega en `sin_definir`. Es la consecuencia ya asumida en SPEC_29; se cambia desde Tu perfil.
  - **El permiso de avisos** es de cada aparato. Hoy no hay entrega de avisos construida, y en la app de iPhone lo cierra SPEC_22.
- **D30-4 — P7 se queda como red de seguridad** y gana el mismo enlace «Ya tengo una cuenta». Ahí sí hay respuestas dadas, y la vista lo dice antes de entrar (§4.4): gana lo que ya estaba en la cuenta.
- **D30-5 — Con la cuenta ya conectada, P7 no se salta: se muestra lista** (`textos.ready` y «Continuar»). Saltarla dejaría un hueco en el indicador («6 de 8» → «8 de 8»).
- **D30-6 — Ni el modelo de datos ni las reglas de fusión cambian.** No sube `VERSION` del onboarding: ninguna pregunta cambió.
- **D30-7 — Reintentar la restauración es una acción propia del contexto de sesión** (§4.2, §5.5), no una reutilización de `reintentarEntradaAlVolverLaRed`: esa está hecha para el evento de la red, no para un botón.
- **D30-8 — El formulario de entrar y el de recuperar se comparten con Tu perfil** (§5.2). Dos copias del mismo formulario se separan en cuanto alguien edita una.
- **D30-9 — P7 no dice nada nuevo al caer en la rama de `crearConCorreo` que entra a una cuenta existente** (§4.4). Es un residuo aceptado.
- Todo lo cerrado en SPEC_19.1 y 19.2 sigue cerrado.

---

## 3. El flujo

```
Video de apertura → P1 Bienvenida
                      [Empezar]                → P2 … P8, igual que hoy
                      Ya tengo una cuenta      → Vista «Entrar» (sin indicador)
                                                   Continuar con Google      (solo web)
                                                   Correo · Contraseña · Entrar
                                                   Olvidé mi contraseña
                                                   Volver
                                                 → velo de restauración (techo de 15 s)
                                                 → uno de los casos de §4
```

El enlace **solo aparece con la sesión en `sinCuenta`**. Con `sinConfigurar` no hay cuentas que ofrecer; con `conCuenta` o `vencida` ya hay una.

---

## 4. Casos

### 4.1 Entrar desde P1

| # | Situación | Qué pasa |
|---|---|---|
| C1 | La cuenta ya terminó el onboarding | Restaura, la mudanza se hace (todo es semilla), la puerta lee `completedAt` y `Entrada` sale a Hoy. La presentación la decide `presentacionPendiente`, como en cualquier arranque. |
| C2 | La cuenta existe y dejó el onboarding a medias | Restaura y sigue en el `currentStep` de la cuenta, con sus respuestas ya puestas. **Nunca en P1**: si el paso guardado es `p1`, se retoma en `p2`. Al llegar a P7 la ve lista (D30-5). |
| C3 | La cuenta existe y no tiene nada en la nube (se creó y nunca subió nada) | Igual que C2: su árbol es semilla, el onboarding sigue pendiente y se retoma en `p2`. |
| C4 | Google con una cuenta que no existía | Firebase la crea (`nueva: true`): se adopta el árbol y la vista dice que la cuenta es nueva (§6, `nueva`), con «Continuar» (a P2) y las demás opciones a la vista. Si entra con otra, la cuenta recién creada queda vacía en Firebase: es un residuo aceptado. |
| C5 | Correo y contraseña no coinciden | `CUENTA.error.credenciales`, con «Olvidé mi contraseña» al lado. Firebase da el mismo error si el correo no existe, y **el mensaje no los distingue**: decir «ese correo no tiene cuenta» es contarle a cualquiera qué correos la tienen. Debajo, la nota `sinCuenta` (§6) recuerda que se puede empezar sin cuenta. |
| C6 | Sin red | `CUENTA.error.sinConexion`. No se cambia de uid ni se escribe nada. |
| C7 | La restauración no termina (fallo o techo) | Ver §4.2. |
| C8 | La mudanza misma falla (`pasarACuenta` devuelve `ok: false`) | El recorrido vuelve a montarse con el uid de origen **en la vista de entrar** y con `CUENTA.error.generico`. Lo lleva el traspaso. |

### 4.2 La restauración que no termina (C7)

Hoy, con `entrada.pendiente`, `pasarACuenta` devuelve `ok: true` y la sesión ya es la cuenta. Con la mudanza pendiente, `arbolDeEntrada` lee el árbol de origen, que tiene el onboarding pendiente, y **el recorrido se montaría en P1 como si nada**. Más tarde el sello relee la puerta y sacaría a Hoy a quien estuviera a mitad de P3.

Esperado:

- `pasarACuenta` devuelve también `pendiente` (sin cambiar su forma para quien no lo lee).
- El recorrido que se monta tras el velo vuelve a la **vista de entrar** con `shared.restauracion.error` y dos salidas:
  - **«Intentar de nuevo»** (`shared.restauracion.reintentar`): vuelve a lanzar la restauración de la cuenta con la acción de D30-7. Si termina bien, el oyente de mudanzas que ya existe (`escucharMudanzasPendientes`) completa la mudanza, el sello relee la puerta y se sigue por C1 o C2. La acción no muda ni relee nada por su cuenta.
  - **«Empezar mientras tanto»** (§6): lleva a P2 sobre el árbol de origen, que es lo que `arbolDeEntrada` ya hace. Si después la restauración termina bien, rige lo de siempre: en `shared/*` gana la cuenta salvo semilla, y si la cuenta traía `completedAt` la puerta sale a Hoy.
- Mientras se reintenta, la vista sigue montada y no se pone el velo de restauración encima: es una espera que alguien pidió, no el arranque. «Empezar mientras tanto» sigue a la vista.

### 4.3 La vista «Entrar»

- **No es un paso.** No está en `ORDEN` ni en `CONTADOS`, no se anota en `completedSteps` y **no escribe `currentStep`**: abrirla y volver es navegación, y lo que escribiera en el origen lo descartaría la mudanza.
- **El indicador no se pinta** mientras está abierta, por la misma razón que en el sub-paso del género: no ocupa sitio en la cuenta.
- La franja de abajo no lleva «Continuar» ni «Atrás»: la vista trae su propio «Volver», que regresa a P1 (o a P7) sin escribir nada.
- Proveedores: `proveedoresDisponibles()`. En la app de iPhone, solo correo hasta SPEC_21.2.
- Recuperar la contraseña: la misma vista que en Tu perfil, con el mismo copy (`CUENTA.recuperar`) y la misma respuesta exista o no la cuenta.
- Nada lleva `disabled`, `required` ni `aria-invalid`. Los errores van por `aria-describedby` al campo que corresponde, como en `BloqueoPin`. La contraseña vive solo en el estado del componente.

### 4.4 La misma vista desde P7

- P7 gana el enlace «Ya tengo una cuenta», que abre la misma vista con otro apoyo (§6, `apoyoDesdeCuenta`): dice antes de entrar que **se sigue con lo guardado en la cuenta**. Es la diferencia con P1: aquí sí hay respuestas dadas, y lo que antes pasaba en silencio se dice.
- Al entrar sigue el camino de SPEC_19.2 sin cambios: si la cuenta terminó el onboarding, Hoy; si no, el paso siguiente a P7.
- **El atajo de `crearConCorreo` (crear y, si el correo existe, entrar) se queda como está y sin aviso nuevo** (D30-9). Un aviso solo podría decirse después del velo, en Hoy o en P8, cuando ya no tiene contexto. Con el enlace visible en P7, ese camino deja de ser el habitual.

---

## 5. El trabajo, por archivo

### 5.1 `Bienvenida.jsx`

- Recibe `onEntrar` y `conEntrar` (booleano). Con `conEntrar`, pinta debajo de «Empezar» un enlace con la forma del «Ahora no» de P7 (botón de texto, `min-h-touch-sm`, foco visible). Sin él, la pantalla queda igual que hoy.
- Sigue centrada verticalmente. El enlace no compite con «Empezar»: va en el secundario (`text-on-surface-soft`).

### 5.2 `components/shared/FormularioEntrar.jsx` (nuevo) y `components/onboarding/Entrar.jsx` (nuevo)

- **`FormularioEntrar`** sale de `perfil/TuCuenta.jsx` (D30-8): los campos de correo y contraseña, «Entrar», «Olvidé mi contraseña», la vista de recuperar y sus errores. Recibe **todo por props** —textos, proveedores, acciones y el error a mostrar— y no importa la sesión, `lib/cuenta` ni nada de una sección (RN-TEC-05).
  - `TuCuenta.jsx` pasa a montarlo para entrar. **Crear** sigue siendo de Tu perfil: si el formulario de crear comparte forma con el de entrar, se resuelve con una prop (`modo`) y no con una segunda copia. **REPORTA** la forma exacta de las props antes de moverlo.
  - Las pruebas de Tu perfil tienen que seguir pasando sin cambiar lo que comprueban: es un movimiento, no un rediseño.
- **`Entrar`** es la vista de §4.3: título, apoyo, aviso, el formulario compartido, «Volver» y, según el caso, «Continuar» (C4) o «Empezar mientras tanto» (C7). Recibe sus acciones por props; no importa la sesión.
- No se importa `components/perfil/` desde el onboarding.

### 5.3 `Onboarding.jsx`

- Estado local de la vista: `null` | `'entrar'`, y desde dónde se abrió (`p1` | `p7`). Mientras está abierta, `Progreso` no se pinta y la franja de abajo queda vacía.
- `conEntrar` en P1 es `estado === ESTADOS_SESION.sinCuenta` (de `useSesion`).
- Entrar por correo usa `entrarConCorreo` y después `acciones.conectarCuenta({ ...r, nueva: false })`; por Google, `entrarConProveedor('google')` y `acciones.conectarCuenta(r)`. **No se llama a `sesion.entrar` ni a `sesion.entrarConGoogle`**: saltarían el vaciado de lo pendiente y el traspaso de `useOnboarding`.
- Con `nueva: true` (C4), la vista se queda abierta con el aviso de cuenta nueva y «Continuar» va a P2.
- En P7, `listo` es también `true` cuando la sesión ya está en `conCuenta` al montarse (D30-5).

### 5.4 `useOnboarding.js` y `traspaso.js`

- `conectarCuenta(cuenta, { desde })`. Con `desde: 'p1'` y una cuenta que ya existía, **no se apunta un paso concreto**: se apunta `{ desde: 'p1' }` y el recorrido que se monte retoma en el `currentStep` de la cuenta, nunca antes de `p2` (C2, C3). Con `desde: 'p7'` (o sin opción), todo sigue como hoy: `siguiente(PASOS.cuenta)`.
- El traspaso lleva además la vista y el aviso cuando hay que volver a ella: `{ vista: 'entrar', desde, aviso }` para C7 y C8. `retomarTrasCuenta` devuelve también `vista` y `aviso`.
- Sigue viviendo en memoria y se toma una sola vez. Recargar la app en la vista de entrar vuelve a P1: es navegación y no se guarda.

### 5.5 `ArranqueProvisional.jsx`

- `pasarACuenta` devuelve `{ ok: true, pendiente }` cuando `entrarACuenta` dejó la mudanza pendiente. Los demás consumidores (Tu perfil) no lo leen y no cambian.
- **Acción nueva en el contexto, `reintentarRestauracion()`** (D30-7): vuelve a lanzar la restauración del uid vigente y devuelve `{ ok }`. Solo hace algo si hay una mudanza pendiente hacia ese uid; si no, devuelve `{ ok: true }` sin tocar nada. No pone el velo, no muda y no fija el uid: lo demás lo hacen el oyente de mudanzas y el sello, como al volver la red.

### 5.6 Copy — `src/copy/index.js`

Todo lo nuevo va en `copy.diario.onboarding`. **Se reutiliza lo que ya existe**, sin copias: `p7.google`, `CUENTA.formulario.*`, `CUENTA.recuperar.*`, `CUENTA.error.*`, `shared.restauracion.error` y `reintentar`. Lo nuevo está en la §6.

---

## 6. Copy propuesto

Segunda persona, como el resto del onboarding y de Tu perfil (decidido el 30 ago 2026). Sin género, sin exclamaciones y sin léxico de §3.3. **La redacción final es de la propietaria del producto**; esto es la base.

```js
p1: {
  // … lo de hoy
  yaTengoCuenta: 'Ya tengo una cuenta',
},

entrar: {
  titulo: 'Entra a tu cuenta',
  apoyo: 'Traemos lo que ya tenías guardado. No hace falta contestar nada otra vez.',
  apoyoDesdeCuenta: 'Si tu cuenta ya tenía respuestas, seguimos con las que guardaste en ella.',
  sinCuenta: 'Si es tu primera vez aquí, puedes empezar sin cuenta y crearla al final.',
  nueva: 'Esta cuenta es nueva y todavía no tiene nada guardado. Puedes seguir con ella o entrar con otra.',
  empezarMientras: 'Empezar mientras tanto',
},
```

`lint:copy` revisa todo lo nuevo. **REPORTA** si alguna cadena choca con una regla de voz.

---

## 7. Criterios de aceptación

**Automáticos:**

1. En P1 con `sinCuenta`, el enlace existe y abre la vista; con `sinConfigurar`, `conCuenta` o `vencida`, no se pinta.
2. Abrir la vista y volver no escribe nada en `shared/onboarding` (ni `currentStep` ni `completedSteps`).
3. Mientras la vista está abierta, no se pinta el indicador.
4. Desde P1, el correo usa `entrarConCorreo`, nunca `crearConCorreo`.
5. C1: una cuenta con `completedAt` sale a Hoy y no vuelve a montar el onboarding.
6. C2 y C3: se retoma en el `currentStep` de la cuenta, nunca en `p1`.
7. C4: con `nueva: true` se adopta el árbol y «Continuar» lleva a P2; al llegar a P7, se muestra lista.
8. C5 y C6: el error se dice con `CUENTA.error.*`, sin código, y no cambia el uid.
9. C7: con la mudanza pendiente, el recorrido que se monta tras el velo muestra la vista de entrar con el aviso de restauración, no P1.
10. C8: con la mudanza fallida, la vista vuelve con el uid de origen y `CUENTA.error.generico`.
11. P7: el enlace abre la vista con `apoyoDesdeCuenta`; entrar sigue el camino de SPEC_19.2 sin cambios en sus pruebas.
12. Ningún control nuevo lleva `disabled`, `required` ni `aria-invalid`.
13. Ningún texto nuevo vive en un componente (RN-VOZ-01).
14. `reintentarRestauracion` sin mudanza pendiente no toca nada; con ella, una restauración correcta completa la mudanza por el oyente de siempre y la puerta se relee.
15. `FormularioEntrar` no importa la sesión, `lib/cuenta` ni nada de una sección, y las pruebas de Tu perfil pasan sin cambiar lo que comprueban.
16. Los seis comandos de `CLAUDE.md` §12 en verde.

**Manuales**, contra `strivo-fe04f` (los valida la propietaria del producto):

- **M1.** Teléfono vacío, cuenta con el onboarding terminado y días escritos: P1 → «Ya tengo una cuenta» → correo → Hoy con los días. Sin pasar por ninguna pregunta.
- **M2.** Igual con Google, en web.
- **M3.** Contraseña equivocada → mensaje → «Olvidé mi contraseña» → llega el enlace.
- **M4.** Modo avión en la vista → mensaje de sin conexión → «Volver» → «Empezar» funciona.
- **M5.** Red que se corta durante la restauración → aviso → «Intentar de nuevo» con red → Hoy.
- **M6.** Recorrido hasta P6, P7 → «Ya tengo una cuenta» → entra → Hoy, con el nombre de la cuenta y no el contestado.
- **M7.** App de iPhone: la vista solo ofrece correo y cabe en la pantalla con el teclado abierto.

---

## 8. Lo que esta SPEC no hace

- Crear cuenta desde P1 (D30-2).
- Volver a preguntar las frases o los avisos a quien entra (D30-3).
- Google nativo o Apple (SPEC_21.2), verificación o cambio de correo.
- Tocar `entrarACuenta`, `arbolDeEntrada`, `ganaOrigenAlMudar` ni ninguna regla de `conflictos.js`.
- Borrar cuentas vacías que se crean por C4 (SPEC_24).

---

## 9. Al terminar

- Actualizar `CLAUDE.md`: el bloque de «Onboarding — cómo quedó» (P1 ofrece entrar) y una entrada nueva en §13 con lo que se decidió aquí, sus residuos (C4 y la recarga en la vista) y lo que no se ha visto en un teléfono.
- Una adenda de validación con M1–M7 cuando la propietaria del producto los recorra.

---

## 10. Desvíos al implementar (20 oct 2026)

- **El enlace vive en `copy.diario.onboarding.entrar.enlace`**, no en `p1.yaTengoCuenta`: lo leen P1 y P7, y una clave de P1 leída desde P7 invitaba a duplicarla. El texto es el de §6.
- **`pasarACuenta` no devuelve `pendiente`** (§5.5). El recorrido que se monta tras el velo lo sabe preguntando `mudanzaPendiente(uid)` al cargar (`retomarTrasCuenta`), que no depende de en qué orden lleguen la vuelta de la sesión y la carga.
- **La nota `sinCuenta` se muestra siempre en la vista desde P1**, no solo tras un error de credenciales (C5): Firebase no distingue un correo sin cuenta de una contraseña equivocada, y la nota no depende de eso.
