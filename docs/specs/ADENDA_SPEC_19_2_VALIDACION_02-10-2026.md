# Adenda — Validación de SPEC_19.2 (cuenta existente en P7 y PIN con correo)

**Fecha:** 2 de octubre de 2026
**Rama:** `strivo` · **Commit validado:** `b80e4e4`
**Gobierna:** `SPEC_19_SESION_REAL_Y_CUENTA.md` (v2.1) + `INSTRUCCION_SPEC_19_2_CUENTA_EXISTENTE.md` (v1.0)
**Resultado:** **SPEC_19.2 cerrada, y con ella SPEC_19 entera.** Los cinco criterios manuales pasan, validados por la fundadora en navegador contra `strivo-fe04f`. **Se retira la regla de seguridad de P7.**

---

## 1. Qué se entregó

Cinco commits sobre `6830d48`:

| Commit | Tema |
|---|---|
| `ef93317` | Instrucción de la entrega 19.2 |
| `6db7de8` | `hechosQueFaltan` pasa a `conflictos.js`; `completedAt` no se deshace al mudar (§4.3) |
| `a03522a` | P7 entra a la cuenta por la sesión; la entrada lee y escribe en el origen mientras haya mudanza pendiente (§4.1, §4.2, E1–E6) |
| `bd69ed5` | Recuperar el PIN con una cuenta de correo pide la contraseña (§4.5, DP-19.6) |
| `b80e4e4` | `CLAUDE.md`: se retiran la regla de seguridad de P7 y la nota del residuo de la fila 3 |

**Suite:** 75 → 77 archivos, 2.034 → 2.083 casos. `lint`, `lint:copy`, `lint:contraste`, `format:check` y `build` en verde.

## 2. Desvíos aprobados antes de codificar

| # | Desvío | Resolución |
|---|---|---|
| E1 | El onboarding también tenía que **leer** del origen, no solo escribir | Una sola regla, `arbolDeEntrada`, para la puerta, la carga, las escrituras y la presentación |
| E2 | Cerrar la presentación sellaba la semilla de la cuenta y pisaba `shared/onboarding` | `completarPresentacion` escribe en `arbolDeEntrada` |
| E3 | `terminar` devolvía el uid local y la sesión volvía a él | Se retiran `onUid`, `cambiarUid` y el uid de `onTerminado` |
| E4 | La mudanza podía completarse con el recorrido montado y respuestas del origen en memoria | Recarga de respuestas **solo** si cambia el árbol, no con cada sello |
| E5 | El error de una mudanza fallida se perdía al desmontarse P7 | El traspaso en memoria lleva también el motivo |
| E6 | Una escritura en vuelo durante la mudanza | Se espera a toda la fila de escrituras antes de conectar |
| E7 | Códigos de error del PIN | Se añade `auth/invalid-login-credentials` |
| E8 | Clave de copy duplicada | Se reutiliza `cuenta.error.sinConexion` |

**La carrera de `completedAt`, cerrada:** `arbolDeEntrada` espera a la mudanza en curso y vuelve a decidir si, mientras leía, empezó otra. Se aprobó en la revisión; Claude Code lo resolvió sin parar a reportar, lo dijo, y el diseño es correcto (la mudanza nunca pregunta por el árbol de la entrada, así que no hay ciclo).

**Decisión de Claude Code aceptada:** lo que la persona contestó en el onboarding solo se escribe en el árbol del que se leyó (`escritura.js`). `completedAt` y el paso sí siguen al árbol vigente. Eso garantiza que un nombre anónimo nunca cae sellado sobre el perfil de la cuenta.

## 3. Revisión de código

Sin defectos que corregir. Comprobado en el código: el bucle de `arbolDeEntrada`, `escritura.js`, el mapeo de errores y el manejo de la contraseña en `pin.js` (solo viaja en la llamada), y la retirada completa de `adoptarCuenta`, `onUid` y `cambiarUid`. En tres corridas propias: 2.083/2.083 dos veces; en la tercera falló solo la intermitente conocida de `journal.test.js`.

## 4. Validación manual

| Criterio | Qué se comprobó | Resultado |
|---|---|---|
| N1 | P7 con cuenta nueva: «Tu cuenta está lista.», P8, Hoy; árbol nuevo en Firestore con el nombre del onboarding | Pasa |
| N2 | P7 con la cuenta de prueba y otro nombre en el onboarding: frase de restauración, salida a Hoy sin presentación, Perfil con el nombre de la cuenta; `shared/profile` (`name`, `updatedAt`) y `shared/onboarding` (`completedAt`) idénticos en Firestore | Pasa |
| N3 | Igual que N2 con 5 s de latencia: el velo cae a los 15 s, el recorrido sigue y se termina; al volver la red, Perfil pasa al nombre de la cuenta, el onboarding no vuelve al recargar y Firestore sigue idéntico | Pasa |
| N4 | PIN con cuenta de correo: aparece «Contraseña de tu cuenta»; contraseña incorrecta → texto de credenciales; correcta → PIN nuevo, entradas intactas | Pasa |
| N5 | Regresión: cerrar sesión y entrar desde Tu perfil siguen igual | Pasa |

## 5. Lo que queda

- **DP-19.3:** falta, cuando Firebase verifique `hellostrivo.com`, poner remitente `Strivo <noreply@hellostrivo.com>` con respuesta a `team@hellostrivo.com`. Antes de App Review.
- **Sin prueba de pintado** de P7 ni de `BloqueoPin`: el repo no tiene testing-library y no se añadió. Cubierto por N1–N4.
- **Residuo aceptado:** recargar la app en P8 tras entrar a una cuenta existente retoma desde el `currentStep` guardado.
- **Deuda aparte:** la intermitente de `journal.test.js` («viene de la más reciente a la más antigua»).
- **Cuenta de N1** (`team+prueba1@…`): queda en Authentication y Firestore. Se puede borrar a mano o conservar para pruebas.
- **Para SPEC_21:** `signInWithPopup` no sirve en WebView, y Apple sigue oculto en web.
