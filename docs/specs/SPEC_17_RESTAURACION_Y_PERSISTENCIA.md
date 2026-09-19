# SPEC_17 — Restauración y persistencia (v2.0)

**Reescrita el 9 de septiembre de 2026 tras revisar el repo en el commit `5efa09e`.**
**Tarea del Gantt:** A1 · **Prioridad:** máxima, y ahora más que antes
**Fases:** 17A (antes que cualquier otro SPEC) · 17B (después de SPEC_21)
**Horas revisadas:** 11 (antes 14)

---

## 0. Qué cambió respecto a la v1.0 de esta SPEC

La v1.0 pedía construir la cola de sincronización desde cero. **Ya existe y está bien hecha.** `src/lib/db/sync.js` tiene una entrada por ruta, backoff de 2 s → 8 s → 30 s → 120 s, y no saca nada de la cola hasta que Firestore confirma. Esa parte se da por cerrada y no se toca.

Lo que la revisión encontró en su lugar es más grave:

> **Firestore es hoy de solo escritura.** En todo `src/` únicamente se usan tres operaciones —`doc`, `setDoc`, `deleteDoc`— y no existe ni un `getDoc` ni un `getDocs`. Los datos suben y no vuelven a bajar nunca. Si alguien reinstala la app, cambia de teléfono o borra los datos del navegador, **su diario no vuelve**, aunque esté íntegro en la nube.

La cola cumple su promesa a medias: pone lo escrito a salvo del dispositivo, pero no hay forma de recuperarlo. Esta SPEC pasa a ser, sobre todo, la que cierra ese hueco.

## 1. Objetivo y problema que resuelve

**Objetivo:** que lo escrito vuelva. Que iniciar sesión en un dispositivo vacío recupere el diario completo, que dos dispositivos no se pisen, y que en nativo el almacén local no pueda ser purgado por el sistema.

**Problema:** hoy la única copia viva de un diario es la del teléfono. La nube es un respaldo que nadie puede leer.

## 2. Alcance

**Fase A — Restauración y conflictos (sin Capacitor):**
- Descarga completa de `users/{uid}/**` desde Firestore al almacén local.
- Disparo de la restauración cuando hay sesión y el almacén local no tiene marca de restauración para ese uid.
- Regla de resolución de conflictos, implementada en el punto de fusión.
- Indicador de estado de sincronización en Perfil.
- Campos de metadatos (`updatedAt`) verificados o añadidos donde falten.

**Fase B — Adaptador SQLite (con Capacitor):**
- Mismo contrato de la capa de datos sobre `@capacitor-community/sqlite`, activo solo en nativo. En web sigue IndexedDB.
- Migración única y verificable de IndexedDB a SQLite en el primer arranque nativo.

**Fuera de alcance:** la cola de sincronización (ya existe, no se reescribe), cifrado en reposo del Journal, sincronización en tiempo real, `onSnapshot`, cambios al modelo de datos de `diario/` o `breathing/`, exportación (SPEC_24).

**Regla heredada que se respeta:** `diario/pinConfig` nunca sale del dispositivo (RN-DB-04). La restauración **no** debe traerlo de vuelta ni esperarlo.

## 3. Experiencia de usuario

**Restauración en dispositivo vacío.** Al entrar con una cuenta cuyo árbol local no existe, la app muestra el umbral que ya existe (logo sobre velo) y debajo el texto de restauración. Al terminar, entra a Hoy con todo su historial. Si falla, entra igual y el reintento vive en Perfil.

**Indicador de sincronización.** Un bloque nuevo en Perfil, junto a los tres actuales (nombre, género, horarios): estado y, si hay pendientes, cuántos. Nunca un modal, nunca un banner en Hoy.

**Casos límite:**
- Sin conexión durante días: la cola ya lo resuelve. No se toca.
- Restauración interrumpida a media descarga: no se marca como restaurada; el siguiente arranque la reintenta desde cero. Es idempotente porque escribe por `id`.
- Árbol local con datos y cuenta con datos (el caso de `adoptarArbol`, que ya existe en `src/onboarding/cuenta.js`): se fusiona por `id`; en colisión gana `updatedAt` mayor. Hoy `mudarUid` ya evita sobrescribir; esta SPEC define qué pasa cuando ambos lados tienen el mismo `id`.
- Cuenta sin conexión al primer arranque: no hay restauración; se reintenta al recuperar red, sin avisar.

## 4. Textos exactos

En `copy` (Claude Code confirma la rama exacta; el proyecto ya no tiene bloque `onboarding` muerto y el árbol de copy está limpio):

| Clave | Texto |
|---|---|
| `restaurando` | Recuperando lo que escribiste. |
| `restauradoError` | No pudimos recuperar todo ahora. Nada se perdió y lo intentaremos de nuevo. |
| `reintentar` | Intentar de nuevo |
| `estado.alDia` | Todo guardado |
| `estado.pendiente` | Guardando |
| `estado.sinConexion` | Sin conexión. Se guardará cuando vuelva. |
| `estado.sinCuenta` | Sin cuenta, lo escrito vive solo en este teléfono. |

`estado.sinCuenta` es nuevo respecto a la v1.0 y hace falta: hoy se puede usar la app entera sin cuenta (P7 es saltable), y esa persona debe poder enterarse sin que se le regañe.

## 5. Interfaz, accesibilidad y consistencia

- El bloque de Perfil sigue el patrón de `src/components/perfil/Bloque.jsx`. No se crea un componente nuevo.
- Estados con `aria-live="polite"`. El punto de color por sí solo no comunica nada.
- La pantalla de restauración reutiliza el velo del umbral (`data-moment` + `velo-transicion`), no una pantalla nueva.

## 6. Requisitos técnicos

**Archivos que la revisión confirma existen y hay que leer primero:** `src/lib/db/sync.js`, `src/lib/db/local.js` (tiene `readCollection`, `mudarUid`, `pendingCount`), `src/lib/db/index.js`, `src/lib/db/shared.js`, `src/lib/db/schema.js`, `src/lib/firebase.js`, `src/onboarding/cuenta.js`, `src/perfil/bloques.js`, `firestore.rules`.

**Reglas de Firestore: ya son correctas.** `firestore.rules` limita `users/{uid}/**` a `request.auth.uid == uid` y niega todo lo demás. **DP-17.2 queda resuelta: no hay cambio que aprobar.**

**Restauración.** Función nueva `restaurar(uid)` en la capa de datos:
- Carga `firebase/firestore` bajo demanda, igual que hace `sync.js`. Sin credenciales, no existe.
- Lee `users/{uid}` y sus subcolecciones con `getDocs`, paginado.
- Escribe local con `sync: false` para no reencolar lo que acaba de bajar. Este punto es crítico: sin él, restaurar dispara una subida completa de vuelta.
- Marca `restauradoEn` en `preferences` o donde el esquema lo admita.

**Conflictos.** `updatedAt` como criterio. Claude Code verifica en `schema.js` si todos los registros lo llevan; si no, lo añade con migración interna (`updatedAt = createdAt` para los antiguos) y lo reporta antes de codificar.

**Fase B — SQLite.**
- Dependencia: `@capacitor-community/sqlite` (no hay plugin oficial equivalente).
- Un adaptador con el mismo contrato que el de IndexedDB, elegido por `Capacitor.isNativePlatform()`.
- Tabla `records (id TEXT PK, path TEXT, data TEXT, updatedAt INTEGER, deletedAt INTEGER)` más la tabla de cola, con índice por `path`. El payload sigue siendo JSON, como hoy.
- Migración: si IndexedDB tiene datos y SQLite está vacío, copiar, verificar conteo e ids, marcar `migradoEn`, y **no borrar IndexedDB** hasta la versión siguiente.

**Nota de arquitectura.** El almacén local reutiliza el store `records` para todas las ramas (`shared/`, `diario/`, `breathing/`) desde SPEC_02. El adaptador de SQLite debe conservar esa decisión y no normalizar.

## 7. Criterios de aceptación

1. Con una cuenta que tiene 100 entradas en Firestore, borrar los datos del navegador, entrar de nuevo: las 100 vuelven en menos de 30 s.
2. La restauración **no** deja la cola con entradas pendientes (verificable con `pendingCount`): lo que baja no vuelve a subir.
3. El PIN no se restaura: tras restaurar en un dispositivo nuevo, el Journal abre sin candado y sin pedir el PIN anterior; `diario/pinConfig` no existe en local ni se descargó. *(Redacción corregida el 18 sep 2026: decía «pide crear PIN». Pedir un PIN para leer lo propio sería un bloqueo; el PIN es un cerrojo local que se ofrece donde siempre, no un peaje de entrada.)*
4. Editar el mismo día en dos navegadores sin conexión y reconectar: prevalece el `updatedAt` mayor.
5. Perfil muestra los cuatro estados correctos (al día, pendiente, sin conexión, sin cuenta).
6. Sin `.env.local`, nada de esto se activa y la app funciona igual que hoy.
7. (Fase B) En iPhone: tras la migración, el conteo de registros coincide y ninguna entrada cambió de texto.
8. Suite verde. Pruebas nuevas: al menos 30.

## 8. Plan de pruebas

**Unitarias:** `restaurar` (vacío, con datos, interrumpido, idempotente), fusión por `updatedAt` (gana local, gana remoto, empate), exclusión de `pinConfig`, escritura con `sync: false`.
**Integración:** Firebase Emulator Suite, ciclo completo escribir → cola → subir → borrar local → restaurar.
**Manuales:** los criterios 1–6 en navegador; 7 en iPhone.
**Regresión:** la cola sigue comportándose igual (sus pruebas actuales no cambian de resultado); onboarding P7 con `adoptarArbol` sigue mudando el árbol sin pérdida; Hoy, Journal con PIN, Respiración e Historial intactos.

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Restaurar dispara una resubida completa | `sync: false` en la escritura de bajada, con prueba que lo fija | Revertir el commit |
| La restauración pisa cambios locales más nuevos | Fusión por `updatedAt`, nunca sobrescritura ciega | Idem |
| `updatedAt` no existe en todos los registros | Reportado antes de codificar; migración interna | Idem |
| Migración a SQLite pierde registros | No se borra IndexedDB; conteo verificado | Bandera para volver a IndexedDB |

## 10. Orden y dependencias

Fase A primero que todo, y ahora con más razón: es lo único que hace que la nube sirva de algo. Fase B después de SPEC_21 y antes de SPEC_24.

## Decisiones pendientes

- ~~**DP-17.1** Dónde vive el indicador~~ → **Resuelta por el repo:** Perfil existe y tiene tres bloques. El indicador entra ahí como cuarto bloque.
- ~~**DP-17.2** Reglas de Firestore~~ → **Resuelta:** `firestore.rules` ya es correcta.
- ~~**DP-17.3** ¿Existe pantalla de Ajustes?~~ → **Resuelta:** sí, `src/components/perfil/Perfil.jsx`.
- **DP-17.4 (nueva)** ¿La restauración se ofrece también a quien nunca creó cuenta, invitándole a crearla? Recomendación: no en esta SPEC. Que Perfil muestre `estado.sinCuenta` es suficiente; empujar a crear cuenta desde ahí es trabajo de SPEC_19.
