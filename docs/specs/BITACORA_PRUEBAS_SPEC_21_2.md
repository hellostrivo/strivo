# Bitácora de pruebas en iPhone — SPEC_21.2

Complementa el §9 de `INSTRUCCION_SPEC_21_2_GOOGLE_Y_APPLE.md`. Recoge el resultado de cada prueba manual (N1–N15 y la regresión web) hecha por la fundadora el 31 oct y el 1 nov 2026, y los hallazgos que pasan a una instrucción nueva.

**Build probado:** `revision-21-2` en `cda6215` (verificado en GitHub el 1 nov 2026, 09:41). `strivo` en `00f5114`.
**Contra:** proyecto de Firebase `strivo-fe04f`. **Dispositivo:** iPhone de la fundadora.

**Resultado: todos los criterios manuales pasan.** Quedan abiertos O-1, O-2 y O-3 (conexión con Firestore; no los causa 21.2) y la pista de copy de D-N8. Pasan a una instrucción aparte, después de fusionar 21.2.

## Estado

| Prueba | Estado | Fecha | Notas |
|---|---|---|---|
| N4 | ✅ pasa | 31 oct | Vista de entrar, P7 y Tu perfil; Apple y Google. |
| N10 de día | ✅ pasa | 31 oct | |
| N10 de noche | ✅ pasa | 1 nov, 21:47 | Vista de entrar y P7 sobre índigo: los dos botones blancos sin borde, mismo tamaño, Apple primero. Tu perfil (superficie clara) con borde en los dos. Nada se sale con el teclado abierto. Capturas de la fundadora. |
| N1 | ✅ pasa | 1 nov | Apple compartiendo el correo, desde P7 con teléfono vacío. |
| N5 (Apple) | ✅ pasa | 1 nov | La sesión sigue tras cerrar la app del todo y reabrir desde el ícono. |
| N9 (Apple) | ✅ pasa | 1 nov | Recuperar el PIN con Apple; cancelar la hoja no mostró error; las entradas siguen. |
| N2 | ✅ pasa | 1 nov | Apple ocultando el correo: Tu perfil no muestra la dirección de relevo. |
| N7 | ✅ pasa, con **O-1** | 1 nov | Aviso de cuenta nueva correcto; «Volver» → correo de A → llega a sus días, pero solo tras «Intentar de nuevo» (velo ~15 s). |
| N3 | ✅ pasa, con **O-1** | 1 nov, 12:25 | Teléfono vacío → P1 → «Ya tengo una cuenta» → Google con B → velo ~10 s → «Intentar de nuevo» → llegan los días de B. Los dos intentos anteriores no cuentan (nube a medias por O-2). |
| N5 (Google) | ✅ pasa | 1 nov, 12:30 | |
| N9 (Google) | ✅ pasa | 1 nov, 12:30 | Cancelar sin error; PIN nuevo; entradas intactas. |
| N6 | ✅ pasa | 1 nov, 12:30 | «Todo guardado» → cerrar sesión → P1 → Google **mostró la hoja para elegir cuenta** (no entró sola) → B. Velo ~2 s. |
| N11 | ✅ pasa | 1 nov, 12:45 | M3: contraseña equivocada → mensaje amable; «Olvidé mi contraseña» → llega el correo de Firebase en español. M1: teléfono vacío → correo de A → Hoy sin preguntas, velo ~2 s. M4: modo avión → mensaje de sin conexión sin códigos → «Volver» → «Empezar» lleva a P2. M5: modo avión durante el velo → aviso → sin modo avión → «Intentar de nuevo» → Hoy. M6: onboarding contestado con otro nombre hasta P7 → «Ya tengo una cuenta» → A → Tu perfil con el nombre de A. Ver **O-3**. |
| N12 | ✅ pasa | 1 nov, 12:45 | Cerrar sesión → P1 → correo de A → Hoy con sus días. |
| N13 | ✅ pasa | 1 nov, 12:58 | App al fondo durante el velo (cuenta A, tras cerrar sesión) → al volver, Hoy. |
| N15 | ✅ pasa, con **O-1** | 1 nov, 12:58 | Teléfono vacío → Google con B → velo ~12 s → aviso → «Intentar de nuevo» → días de B. Journal abre sin PIN (el PIN no sale del teléfono). Hoy muestra la frase del día. |
| N14 | ✅ pasa, con **O-1** | 1 nov, 13:05 | Cuenta nueva con alias de Gmail creada en P7 y app cerrada sin «Continuar». Teléfono vacío → P1 → entrar con el alias → velo ~15 s → aviso → **sin tocar nada, la vista pasó sola a P7** al terminar la bajada (C7). P7 se vio con la cuenta lista y «Continuar». |
| Regresión web | ✅ pasa | 1 nov, 13:05 | `localhost` con `npm run dev` en `revision-21-2`, ventana de incógnito. La vista de entrar (desde P1) y P7 ofrecen Google y no Apple. M2 de SPEC_30: P1 → «Ya tengo una cuenta» → Google con B → Hoy con sus días, sin preguntas. |
| N8 | ✅ documentada, con **O-1** · **D-N8 decidida: (c)** | 1 nov, 13:17 | Ver «N8» abajo. |

## N8 · Mismo correo, dos formas de entrar (1 nov 2026, 13:12–13:17)

**Configuración de Firebase:** «Link accounts that use the same email» (una cuenta por correo) y protección contra la enumeración de correos **activada**.

**Qué se hizo.** Cuenta A (`@gmail.com`), creada con correo y contraseña en Netlify y nunca verificada por correo. Teléfono vacío → P1 → «Ya tengo una cuenta» → «Continuar con Google» con ese mismo Gmail.

**Resultados:**
1. **Protección contra la enumeración de correos:** activada (anexo A, paso 4b).
2. **Llega a los días de A.** No sale `otroMetodo` ni el aviso de cuenta nueva.
3. **La contraseña deja de funcionar.** En Firebase → Authentication → Users, la fila de A conserva el **mismo UID**, pero el proveedor pasa de **correo** a **solo Google**. Entrar después con correo y contraseña dice que no coinciden.
4. **«Olvidé mi contraseña» la devuelve, pero se lleva Google.** Tras restablecer, entrar con la contraseña nueva funciona y la fila queda **solo con correo**. Lo escrito, intacto en todo momento.

**Por qué.** Es el comportamiento documentado de Firebase con «una cuenta por correo»: Google es proveedor de confianza para `@gmail.com`, y una contraseña sobre un correo **no verificado** se retira al entrar con Google. Restablecer la contraseña hace lo mismo en sentido contrario. Con el correo verificado, Firebase juntaría los dos métodos. `otroMetodo` no aparece en esta configuración, como anticipaba `CLAUDE.md`.

### D-N8 · Decidida por la fundadora el 1 nov 2026: opción (c)

- **Para la 1.0:** el mensaje de contraseña equivocada (`CUENTA.error.credenciales`, hoy «Ese correo y esa contraseña no coinciden.») añade una pista para quien alguna vez entró con Google o Apple. Redacción final de la fundadora. Solo copy; va en la instrucción siguiente.
- **Después del lanzamiento:** verificar el correo al crear la cuenta, para que Firebase junte los métodos en lugar de cambiar uno por otro. Deuda, fuera de 21.2.

## Hallazgos abiertos (pasan a una instrucción nueva; no los causa 21.2)

### O-1 · La primera bajada de la cuenta en el iPhone suele fallar y hace falta «Intentar de nuevo»

**Qué pasa.** Al entrar a una cuenta con datos en la app de iPhone, sobre todo recién instalada, el velo «Recuperando lo que escribiste.» dura entre 10 y 15 s y después sale la vista de entrar con el aviso de restauración (C7 de SPEC_30, `restauracion.error`). «Intentar de nuevo» lo resuelve siempre, y si la bajada termina por detrás la vista avanza sola. Nada se pierde.

| Cuándo | Camino | Instalación | Velo | Resultado |
|---|---|---|---|---|
| 11:54 | N7: cuenta A (correo), tras la cuenta nueva de Apple | nueva | ~15 s | aviso → reintento → bien |
| 12:13 | N3, intento 2: cuenta B (Google) | nueva | ~8 s | aviso (no cuenta: nube a medias por O-2) |
| 12:25 | N3: cuenta B (Google), nube completa | nueva | ~10 s | aviso → reintento → bien |
| 12:30 | N6: cuenta B (Google), tras cerrar sesión | ya usada | ~2 s | directo a Hoy |
| ~12:35 | N11/M1: cuenta A (correo) | nueva | ~2 s | directo a Hoy |
| 12:45 | N12: cuenta A (correo), tras cerrar sesión | ya usada | rápido | directo a Hoy |
| ~12:50 | N15: cuenta B (Google) | nueva | ~12 s | aviso → reintento → bien |
| ~12:55 | N14: alias de Gmail (correo), onboarding a medias | nueva | ~15 s | aviso → avanzó sola a P7 |
| ~13:10 | N8: cuenta A con Google | nueva | largo | aviso → avanzó sola a Hoy |
| ~13:15 | N8, paso 4: cuenta A con contraseña nueva, tras cerrar sesión | ya usada | ~10 s | aviso → avanzó sola a Hoy |

**Conclusión.** 5 de 6 instalaciones nuevas válidas acaban en el aviso, y 1 de 4 entradas con la app ya conectada antes. Pasa con correo y con Google.

**Hipótesis principal, sin confirmar.** El SDK de Firestore marca el cliente como «sin conexión» si no consigue conectar en unos 10 s, y `getDoc`/`getDocs` fallan con «the client is offline». En el WebView de iOS, el canal de streaming de WebChannel puede no abrirse y la detección automática de long polling tarda en caer al de respaldo. `src/lib/firebase.js` usa `getFirestore(app)` sin ajustes. Los casos de 15 s serían el mismo atasco cortado por `TECHO_DE_ESPERA_MS`.

**Bloquea la publicación:** es lo primero que vive quien cambia de iPhone.

### O-2 · En la web, la subida se queda en «Guardando» para siempre, sin error — confirmada

**Qué pasó (12:06–12:25).** Cuenta B creada en Netlify (`strivo` en `00f5114`), Chrome en incógnito, con Google en P7. Después se escribió en Hoy y Journal. Tu perfil se quedó en «Guardando» más de 13 minutos y «Intentar de nuevo» no hacía nada. En Firestore solo existía `shared/`; no había `diario/`. La consola solo mostraba avisos «Cross-Origin-Opener-Policy policy would block the window.closed call» (de la ventana emergente de Google, ajenos). Ningún error de Firestore.

**Confirmación.** Al recargar la pestaña, todo subió («Lo de este teléfono está guardado en tu cuenta.») y apareció `diario/`. Nada se perdió.

**Causa probable.** En `src/lib/db/sync.js`, `flush` hace `await setDoc(...)` sin tiempo límite. Con la conexión colgada la promesa no termina ni falla, `flushing` se queda en `true`, cada `flush` siguiente devuelve `en_curso` y el «Intentar de nuevo» de Tu perfil espera a `flushEnCurso()`, que tampoco termina.

**Bloquea la publicación:** afecta a la web publicada y a la app de iPhone, donde además impediría cerrar sesión.

### O-3 · En el iPhone, la subida tarda ~1 minuto y solo termina al tocar «Intentar de nuevo»

**Qué pasó (~12:38).** Con la cuenta A recién entrada en el teléfono, se escribió en Hoy. Tu perfil se quedó en «Guardando» alrededor de un minuto; «Intentar de nuevo» lo guardó enseguida. A diferencia de O-2, el botón sí funcionó: probablemente una escritura falló y `scheduleRetry` esperó con `RETRY_BACKOFF_MS` (`[2000, 8000, 30000, 120000]`). Sin confirmar.

**Criterio de producto de la fundadora:** con red, lo escrito tiene que llegar a la nube en segundos y sola, sin que nadie toque «Intentar de nuevo». Bloquea la publicación.

## Notas menores (no bloquean)

- **Correo de restablecer contraseña:** llega desde «noreply» (`…firebaseapp.com`), asunto «Cambia la contraseña de Strivo», plantilla de Firebase en español. Antes del lanzamiento: revisar remitente y texto (copy de la fundadora) y decidir si sale desde `hellostrivo.com` (anexo A, paso 8).
- **Tu perfil de noche, al desplazar:** la hora y la batería quedan en texto claro sobre las tarjetas claras. Es la observación ya aceptada en el criterio 14 de 21.1; sin cambios.

## Cuentas de prueba (sin datos reales)

- **A** (correo de Gmail): tras N8 quedó solo con correo y contraseña nueva. Sus días siguen en la nube.
- **B** (Google, otro Gmail de prueba): sus días están en la nube.
- **N14** (alias de Gmail): onboarding a medias en P7.
- Residuo: una cuenta de Apple vacía de N7 (C4) en Firebase → Authentication → Users; se puede borrar.
