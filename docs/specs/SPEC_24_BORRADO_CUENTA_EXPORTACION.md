# SPEC_24 — Borrado de cuenta y exportación de datos

**Tarea del Gantt:** A8 · **Dependencias:** SPEC_19, SPEC_17B
**Fases:** 24A exportación · 24B borrado (24B depende de 24A: nunca se ofrece borrar sin ofrecer llevarse lo escrito)

---

## 1. Nombre, objetivo y problema que resuelve

**Objetivo:** que la persona pueda llevarse todo lo que escribió y pueda borrar su cuenta y sus datos por completo, desde dentro de la app, sin escribir a nadie.

**Problema:** Apple exige borrado de cuenta dentro de la app para cualquier app que permita crearla; es rechazo automático si falta. Google lo exige también desde su formulario de Data Safety. La ley mexicana de datos personales exige atender derechos de cancelación. Y, más allá de la obligación, un refugio que no te deja irte no es un refugio.

## 2. Alcance

**24A Exportación:** un archivo con todas las entradas de Diario (Mañana y Noche), Journal, Historial de ánimo e Intenciones, más las sesiones y favoritos de Respiración, en un formato legible por humanos y por máquinas. Se comparte con la hoja de compartir del sistema.

**24B Borrado:** eliminación de la cuenta de Firebase Auth, de todos los documentos del usuario en Firestore, de todos los datos locales (SQLite/IndexedDB, preferencias, Keychain de biometría), y desvinculación en RevenueCat si SPEC_25 ya está implementada.

**Fuera:** importación de datos, exportación parcial por fechas, exportación a PDF con diseño (v1.1), borrado selectivo de entradas (ya existe editar/borrar por entrada; no se toca), cancelación de la suscripción (la gestiona Apple/Google; se informa cómo).

> "Descargar mi journal" quedó fuera de alcance en agosto para el Journal como función. Aquí entra como **exportación completa de la cuenta**, que es una obligación de las tiendas y de la ley, no una función del Journal. Es la excepción justificada. DP-24.1 lo confirma.

## 3. Experiencia de usuario

**24A Exportar** (Ajustes → "Llevarme lo que escribí")
1. Pantalla con un texto breve y un botón "Preparar mi archivo".
2. Al tocar: se genera el archivo localmente (sin red). Indicador tenue mientras tanto. Para 2,000 entradas debe tardar menos de 5 s.
3. Se abre la hoja de compartir del sistema con el archivo `strivo-{nombre}-{fecha}.zip` que contiene `entradas.json` y `entradas.md`.
4. Cancelar la hoja de compartir no muestra error. Volver a tocar regenera.
5. Sin datos: el botón existe igual y el archivo contiene solo el perfil. Texto `sinEntradas` visible.

**24B Borrar cuenta** (Ajustes → "Borrar mi cuenta", al final, con peso visual bajo)
1. Pantalla 1: texto de qué se borra y qué no (la suscripción), botón primario "Antes, llevarme lo que escribí" (abre 24A), botón secundario "Continuar con el borrado".
2. Pantalla 2: reautenticación obligatoria (Firebase la exige si la sesión es antigua): contraseña. Texto `porQuePedimosContrasena`.
3. Pantalla 3: confirmación final. Campo donde debe escribir la palabra **BORRAR** (DP-24.2). Botón "Borrar mi cuenta" deshabilitado hasta que coincida. Enlace "Quedarme".
4. Al confirmar: se borra en este orden: Firestore → Auth → local. Indicador tenue. Si Firestore falla, se detiene y muestra `errorParcial`; nada local se borra hasta que la nube confirme.
5. Al terminar: pantalla final `despedida`, un solo botón "Cerrar", que lleva a la pantalla 1 del onboarding. La transición de entrada no se muestra (no es una bienvenida).

**Casos límite.**
- Sin conexión: el borrado no se inicia; texto `necesitaConexion`. La exportación sí funciona.
- Suscripción activa: la pantalla 1 dice explícitamente que hay que cancelarla en Ajustes de Apple/Google y ofrece el enlace directo (`manageSubscriptions` de SPEC_25 si existe; si no, instrucción en texto).
- Cola de sincronización con pendientes: se descarta al borrar (lo que no subió, no existe para la nube; se avisa en pantalla 1 si hay pendientes: `pendientesSinSubir`).
- Contraseña incorrecta en reautenticación: mismo error de SPEC_19; tres intentos fallidos no bloquean, solo repiten.
- La app se cierra a mitad del borrado: al reabrir, si Auth ya no existe pero hay datos locales, se limpian locales y se muestra `despedida`.

## 4. Textos exactos

`copy.cuenta.exportar.*` y `copy.cuenta.borrar.*`:

| Clave | Texto |
|---|---|
| `exportar.titulo` | Llevarme lo que escribí |
| `exportar.texto` | Un archivo con todas tus entradas, tal como las escribiste. Es tuyo. |
| `exportar.boton` | Preparar mi archivo |
| `exportar.preparando` | Preparando tu archivo |
| `exportar.sinEntradas` | Todavía no hay entradas. El archivo tendrá solo tu perfil. |
| `borrar.titulo` | Borrar mi cuenta |
| `borrar.queSeBorra` | Se borran tu cuenta, tus entradas y tus preferencias, aquí y en la nube. No hay forma de recuperarlas después. |
| `borrar.suscripcion` | Si tienes una suscripción activa, cancélala aparte en los ajustes de tu teléfono. Borrar la cuenta no la cancela. |
| `borrar.suscripcionEnlace` | Ver mi suscripción |
| `borrar.pendientesSinSubir` | Hay entradas recientes que aún no se guardaron en la nube. Si borras ahora, se pierden. |
| `borrar.exportarAntes` | Antes, llevarme lo que escribí |
| `borrar.continuar` | Continuar con el borrado |
| `borrar.porQuePedimosContrasena` | Te pedimos tu contraseña para asegurarnos de que eres tú. |
| `borrar.confirmarTitulo` | Última confirmación |
| `borrar.confirmarTexto` | Escribe BORRAR para confirmar. |
| `borrar.confirmarPlaceholder` | BORRAR |
| `borrar.boton` | Borrar mi cuenta |
| `borrar.quedarme` | Quedarme |
| `borrar.borrando` | Borrando |
| `borrar.errorParcial` | No pudimos completar el borrado. Nada se ha borrado todavía. Inténtalo de nuevo con conexión. |
| `borrar.necesitaConexion` | Para borrar tu cuenta necesitas conexión. |
| `borrar.despedida` | Listo. Tu cuenta y tus entradas ya no existen. Gracias por haber estado aquí. |
| `borrar.cerrar` | Cerrar |

Nota de tono: `despedida` es el único texto de todo el proyecto que puede sonar a cierre emocional. No se añade nada más. Sin "esperamos verte pronto".

## 5. Interfaz, accesibilidad y consistencia

- "Borrar mi cuenta" es la última opción de Ajustes, con estilo de texto secundario, no de botón rojo. Solo el botón final de la pantalla 3 usa el tono de acción destructiva (Claude Code confirma si existe un token para ello; si no, DP-24.3).
- El campo BORRAR es `type="text"`, sin autocorrección, mayúsculas forzadas visualmente pero la comparación es insensible a mayúsculas.
- Cada pantalla anuncia su título con `aria-live`. El botón deshabilitado explica por qué en `aria-describedby`.
- Hoja de compartir: la nativa vía `@capacitor/share`; en web, descarga directa del archivo.

## 6. Requisitos técnicos

**Dependencias:** `@capacitor/share`, `@capacitor/filesystem` (oficiales). Para el zip: `fflate` o `jszip` (Claude Code propone la más ligera; requiere aprobación por ser dependencia no-Capacitor).

**24A.** Módulo `exportarCuenta(uid)` en la capa de datos: lee todos los registros de `diario/`, `breathing/` y perfil; produce `entradas.json` (esquema documentado en el reporte, con versión) y `entradas.md` (una sección por día, orden cronológico, texto tal cual, sin interpretar). Escribe en `Directory.Cache`, comparte, borra el archivo tras compartir.

**24B.** `borrarCuenta()`:
1. `reauthenticateWithCredential`.
2. Borrado en Firestore de `users/{uid}` y subcolecciones. Firestore no borra subcolecciones en cascada desde el cliente: se hace por lotes de 500 desde el cliente **o** con una Cloud Function `onCall` (DP-24.4). Recomendación: Cloud Function, porque garantiza atomicidad y no depende de que la app siga abierta.
3. `deleteUser`.
4. Limpieza local: SQLite/IndexedDB, `localStorage` de preferencias, Keychain (23A), bandera de onboarding.
5. Si SPEC_25 existe: `Purchases.logOut()`.

**Seguridad.** Reautenticación obligatoria (Firebase lo exige con `auth/requires-recent-login`; se pide siempre, no solo cuando falla). El borrado en Firestore protegido por reglas: solo el propio `uid`. La Cloud Function, si se elige, verifica `context.auth.uid`.

**Privacidad y ley.** Se registra en el reporte que el borrado cubre: Auth, Firestore, local. Firebase conserva backups por su política; el aviso de privacidad (tarea A9) debe mencionarlo.

## 7. Criterios de aceptación

1. Exportar con 300 entradas: zip generado en menos de 5 s, se abre la hoja de compartir, el `.md` es legible y el `.json` valida contra el esquema del reporte.
2. Exportar sin entradas: archivo con perfil, texto `sinEntradas` visible.
3. Borrar cuenta completa: tras `despedida`, en la consola de Firebase no existe el usuario ni `users/{uid}`; en el dispositivo no queda ningún dato (verificar con inspección de SQLite y de `localStorage`).
4. Iniciar sesión con el correo borrado devuelve `credenciales` (no existe).
5. Borrado sin conexión: no inicia; texto correcto.
6. Simular fallo de Firestore (reglas temporalmente restrictivas en el emulador): `errorParcial`, y los datos locales siguen intactos.
7. Con suscripción activa (sandbox): la pantalla 1 muestra el aviso y el enlace.
8. Suite verde; al menos 25 pruebas nuevas.

## 8. Plan de pruebas

**Unitarias:** generación de `.md` (orden, formato, escape), esquema del `.json`, máquina de estados del borrado (5 estados), validación del campo BORRAR.
**Integración:** emulador de Auth + Firestore: borrado completo; fallo parcial; cola con pendientes.
**Manuales:** criterios 1–7 en iPhone y en web.
**Regresión:** cerrar sesión (SPEC_19) no borra nada en la nube; el PIN y la biometría no interfieren; Ajustes conserva el resto de opciones.

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Borrado parcial deja datos huérfanos en Firestore | Orden nube→auth→local; Cloud Function atómica (DP-24.4) | Script de limpieza administrativo documentado |
| Persona borra por impulso y se arrepiente | Exportación ofrecida primero, reautenticación, palabra de confirmación | No hay reversión: es el contrato con la persona y con la ley |
| Archivo exportado queda en caché del dispositivo | Se borra tras compartir; `Directory.Cache` lo purga el sistema | — |

## 10. Orden y dependencias

Noveno. Requiere SPEC_19 y 17B. Si SPEC_25 se implementa después, el paso `Purchases.logOut()` se añade en SPEC_25, no aquí.

## Decisiones pendientes

- **DP-24.1** Confirmar que la exportación completa de cuenta entra en v1.0 (recomendado: sí; es la contraparte ética y legal del borrado).
- **DP-24.2** Confirmación final: escribir BORRAR (recomendado) o solo un segundo botón. Escribir la palabra evita borrados por gesto accidental en una app que se usa antes de dormir.
- **DP-24.3** Confirmar si existe un token de acción destructiva en `design-tokens.json`. Si no, definir uno acorde a la paleta nueva (SPEC_18).
- **DP-24.4** Borrado de Firestore por lotes desde cliente o Cloud Function. Recomendado: Cloud Function (requiere plan Blaze de Firebase, que la hoja de presupuesto ya contempla).
