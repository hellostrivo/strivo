# Adenda — Validación de SPEC_19.1 (sesión real)

**Fecha:** 1 de octubre de 2026
**Rama:** `strivo` · **Commit validado:** `2b6c48c`
**Gobierna:** `SPEC_19_SESION_REAL_Y_CUENTA.md` (v2.1) + `INSTRUCCION_SPEC_19_1_SESION.md` (v1.1)
**Resultado:** **SPEC_19.1 cerrada.** Los nueve criterios manuales pasan, validados por la fundadora en navegador contra `strivo-fe04f`.

---

## 1. Qué se entregó

Diez commits sobre `6c80b3f`:

| Commit | Tema |
|---|---|
| `55cfe44` | SPEC_19 v2.1 e instrucción 19.1 |
| `74b81f0` | `cuenta.js` de `onboarding/` a `lib/`, sin cambios de comportamiento |
| `b928d56` | `entrarConCorreo`, `recuperarContrasena`, `cerrarSesion`, `PROVEEDORES_WEB` y el campo `nueva` |
| `cfbd923` | Capa de datos: política de mudanza, `borrarUid`, `olvidarUid`, `alTerminarRestauracion`, `completedAt` y `flushEnCurso` |
| `2405a11` | Sesión: resolutor, entrada, salida, contexto, puerta del onboarding y bloque de sincronización |
| `7526167` | Tu perfil: bloque Tu cuenta, `Confirmacion` y copy |
| `1a45d29` | P7: Apple oculto (DP-19.4) |
| `d3f0988` | `CLAUDE.md` e instrucción v1.1 con los desvíos aprobados |
| `81d350f` | F1: no se muda nada si la restauración no terminó bien |
| `2b6c48c` | F2: la puerta con mudanza pendiente · F3: reintento al volver la red |

**Suite:** 69 → 75 archivos, 1.895 → 2.034 casos. `lint`, `lint:copy`, `lint:contraste`, `format:check` y `build` en verde.

## 2. Defectos encontrados en la revisión de código, antes del navegador

- **F1 — El diario anónimo podía pisar la nube.** Con la restauración fallida o pasado el techo de 15 s, la mudanza movía el diario contra un destino vacío. Las filas con fecha ganaban sin rival, se encolaban y `setDoc` reemplazaba en Firestore la versión de la cuenta, aunque fuera más nueva. Con el techo, además, la cola subía la versión vieja después de que la bajada tardía hubiera ganado en local. Era DP-17.10 por otra puerta. **Corregido:** sin restauración completa no se muda nada; la mudanza queda apuntada (`strivo.mudanzaPendiente.<uidCuenta>`) y se completa con la política entera cuando una restauración de esa cuenta termina bien.
- **F2 — Con la mudanza aplazada, la app mandaba al onboarding a quien ya lo hizo.** El uid pasaba a la cuenta, su árbol se sembraba y la puerta leía `completedAt: null`. Si la restauración había fallado, la persona podía llegar a P7 y pisar en la nube el perfil y el expediente (DP-19.5). **Corregido:** mientras haya mudanza pendiente, la puerta se lee en el árbol de origen (`leerPuerta`).
- **F3 — Entrar sin red no se reintentaba sola al volver la red.** **Corregido** con el mismo oyente de un solo intento que ya usa el arranque.

## 3. Validación manual

Origen limpio en `localhost:5174`, ventana normal de Chrome, cuenta de prueba `FlkJmrwOjfejIHdFt0hOCglXypW2`.

| Criterio | Qué se comprobó | Resultado |
|---|---|---|
| Recorrido previo | Onboarding sin P7, Tu perfil en orden de cinco bloques, formulario, error de credenciales sin velo, recuperar con correo inventado, consola limpia | Pasa |
| M3 | Entrar desde Perfil con un árbol anónimo («Prueba» + mañana de hoy): el nombre queda «Alejandra»; `shared/profile` y `shared/onboarding` idénticos en Firestore; la mañana del 1 oct sube | Pasa |
| M1 | Cerrar Chrome y reabrir: sesión viva, correo en Perfil, «Lo de este teléfono está guardado en tu cuenta.» | Pasa |
| M5 | Offline con escrituras pendientes: la confirmación de salir solo ofrece «Quedarme» | Pasa |
| M2 | Sin `firebaseLocalStorageDb`: estado vencida, lo local se lee y se escribe, cero escrituras a Firestore; al volver a entrar con la misma cuenta, lo escrito sube | Pasa |
| M9 | Latencia de 5 s y sin base local: el velo cae a los 15 s, aparece el onboarding y la app sale sola a Hoy al terminar la bajada, con los datos de la cuenta | Pasa |
| M4 | Cerrar sesión: el copy menciona el PIN, aparece el onboarding, 0 registros y 0 entradas de cola del uid de la cuenta; al volver a entrar, vuelve todo | Pasa |
| M7 | Entrar con Google; Apple ausente en Perfil y P7 | Pasa |
| M6 | Recuperar contraseña: el mismo texto para un correo real y uno inventado; el correo llega en español | Pasa |
| M8 | Sin `.env.local`: la app entera funciona, Tu cuenta dice que las cuentas no están disponibles, y P7 se salta | Pasa |

## 4. Configuración de Firebase hecha en esta sesión

- Google habilitado como proveedor.
- Dominio de Netlify (`beamish-wisp-ada776.netlify.app`) en dominios autorizados.
- Protección contra la enumeración de correos activa.
- Plantillas en español.
- Contraseña de la cuenta de prueba rotada.
- **DP-19.3 en curso:** dominio `hellostrivo.com` en verificación para los correos. Los registros DNS están publicados en Squarespace (SPF fusionado con Google Workspace, TXT de verificación y dos CNAME de DKIM). Falta, cuando Firebase lo verifique, poner remitente `Strivo <noreply@hellostrivo.com>` con respuesta a `team@hellostrivo.com`, y repetir la prueba de recuperación: hoy el correo llega a Spam y Gmail desactiva sus enlaces ahí.

## 5. Lo que queda abierto

- **Para SPEC_19.2:**
  - P7 con cuenta existente (DP-19.5).
  - PIN con cuenta de correo (DP-19.6).
  - El caso estrecho de la fila 3 del arranque con un onboarding anónimo a medias, anotado en `CLAUDE.md`.
  - **La regla de seguridad sigue vigente:** no entrar por P7 con cuentas que tengan datos reales; entrar a una cuenta existente se hace desde Tu perfil.
- **Aceptado, no se corrige:** si el SDK de Firebase no carga, Tu cuenta diría «no disponibles». En la práctica no ocurre, porque el chunk queda en la precaché del service worker.
- **Deuda aparte, fuera de 19.1:** `src/diario/__tests__/journal.test.js` › «viene de la más reciente a la más antigua» es intermitente (falla en 4–5 de cada 12 corridas aisladas, igual antes que después de 19.1). Es un empate de milisegundos en el orden. Necesita su propia instrucción pequeña.
