# INSTRUCCIÓN SPEC_17B — Lo escrito en el iPhone, en SQLite

**Para:** Claude Code
**Fecha:** 10 nov 2026 · **Versión:** 1.2 (reporte previo aprobado el 10 nov 2026, con condiciones: §9; pruebas manuales pasadas el 10 nov 2026: §10. **Donde §9 y el resto difieran, manda §9**)
**Rama de partida:** `strivo` en `9faf6a2`, la fusión de SPEC_31. Compruébalo en §0.
**Gobierna:** esta instrucción + `docs/specs/SPEC_17_RESTAURACION_Y_PERSISTENCIA.md` (Fase B: §2, §6, criterio 7, §9 y §10) + `docs/specs/SPEC_17A_INSTRUCCION_EJECUCION.md` + `docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md` + `docs/specs/INSTRUCCION_SPEC_21_2_GOOGLE_Y_APPLE.md` + `docs/specs/INSTRUCCION_SPEC_31_SINCRONIZACION_FIABLE.md` + `SPEC_00B` + `CLAUDE.md`. **Donde esta instrucción y otra difieran, manda esta.** En particular, **corrige la forma de la tabla de SPEC_17 §6** (ver §2.4).
**Por qué existe:** en la app de iPhone, todo lo escrito vive en el IndexedDB del WebView, y iOS puede reclamar ese almacenamiento sin avisar. Con cuenta, lo escrito vuelve de la nube; **sin cuenta —y la app funciona entera sin cuenta— se pierde**. SQLite guarda en un archivo propio de la app, que iOS no borra por su cuenta.
**Por qué ahora:** todavía no hay usuarias reales. La migración solo tiene que mover lo de los teléfonos de prueba. Después de publicar, cualquier error de migración pasaría en teléfonos ajenos y sin forma de verlo.

---

## 0. Antes de escribir una sola línea

1. Lee `CLAUDE.md` (secciones «Lo que subió a la nube vuelve a bajar (SPEC_17A)», «Sesión real (SPEC_19.1)», «App iOS (SPEC_21.1)», «Google y Apple en la app de iPhone (SPEC_21.2)» y «Que lo escrito suba solo (SPEC_31)»), la Fase B de SPEC_17 y esta instrucción entera.
2. Comprueba que HEAD de `strivo` es `9faf6a2` o la contiene (`git merge-base --is-ancestor 9faf6a2 HEAD`). Si no, **para**.
3. Inspecciona: `src/lib/db/local.js` (entero), `src/lib/db/index.js`, `src/lib/db/sync.js` y `src/lib/db/restaurar.js` (qué importan de `local.js`; dónde vive la marca de restauración), `src/lib/db/conflictos.js` (`esSemilla`, `esExpediente`, `hechosQueFaltan`, que usa `mudarUid`), `src/lib/db/diario.js` (`savePinConfig`), `src/lib/db/shared.js` (`writePathIfAbsent`), `src/breathing/data/repositorioRespiracion.js`, `src/lib/entradaCuenta.js` (la mudanza pendiente), `src/components/ArranqueProvisional.jsx` (`uidLocal`, `fijarUid`), `src/main.jsx`, `src/lib/pantallaArranque.js` (`planDeRetirada` y su techo de 2 s), `src/lib/plataforma.js`, `src/lib/credencialNativa.js` (el patrón de carga bajo demanda y la lección del Proxy), `src/lib/firebase.js` (`opcionesDeAuth`), `capacitor.config.json`, `ios/App/App/Info.plist`, `ios/App/CapApp-SPM/Package.swift`, `src/lib/__tests__/appIos.test.js`, y las pruebas de `src/lib/db/__tests__/` (en especial `setup.js`, `helpers.js` y `conexion.test.js`).
4. Verifica el plugin **antes** de proponer (§1.2, DP-17B.1). Para responder los REPORTA de Swift Package Manager puedes instalarlo en una rama desechable que se borra después; no en `strivo` ni en `revision-17b` hasta la aprobación.
5. Entrega un **reporte previo** con todos los puntos marcados **REPORTA**, la lista de archivos que vas a crear o tocar, y **los textos exactos que la fundadora verá en pantalla** en cada prueba manual del §5 (la línea de diagnóstico, el botón de simulación, lo que dice Tu perfil en cada estado).
6. **Espera la aprobación de la fundadora.** No cambies código antes.

---

## 1. Decisiones

### 1.1 Ya tomadas, no se reabren

| Origen | Decisión |
|---|---|
| RN-01 / RN-DB-01 | Local primero. En la app nativa, «local» pasa a ser SQLite; el orden no cambia: se guarda en el teléfono antes de que la red entre en juego. |
| SPEC_17 §2 (Fase B) | **Mismo contrato de la capa de datos**, con SQLite solo en nativo. **En web sigue IndexedDB**, igual que hoy. |
| SPEC_17 §6 | Un solo almacén de registros para todas las ramas (`shared/`, `diario/`, `breathing/`), **sin normalizar**. El contenido sigue siendo JSON. |
| SPEC_17 §6 y §9 | **IndexedDB no se borra en esta versión.** La migración copia y verifica; no borra ni escribe nada en IndexedDB. |
| DP-21.3 / DP-21.8 | **El identificador (`com.hellostrivo.strivo`) y el esquema y host del WebView (`capacitor://localhost`, los de fábrica) no se tocan.** Ahora hay una razón más: la migración lee IndexedDB en ese origen. Si cambiara, no habría nada que migrar. |
| RN-DB-04 / `esRutaLocal` | El PIN (`diario/pinConfig`), la preferencia de frases (`shared/frases`) y las asignaciones (`diario/frasesDelDia/items/*`) **nunca entran en la cola**. **Sí se migran**: viven en el teléfono, y SQLite es el teléfono. Si el PIN no se migrara, el Journal se abriría sin candado tras actualizar. |
| SPEC_17A / SPEC_31 | Firestore solo se lee en `restaurar.js`. La cola (`sync.js`), sus tiempos, las reglas de fusión (`conflictos.js`) y el modelo de datos **no cambian**. |
| SPEC_21.2 | **Ningún objeto de plugin de Capacitor sale suelto de una promesa** (el Proxy contesta a `then` y el `await` se cuelga para siempre, sin error). Se devuelve envuelto, como `cargarPlugin` (`{ plugin }`). |
| 10 nov 2026 | **Pruebas manuales solo con lo que se ve en pantalla.** Sin consola de Safari, sin Inspector web y sin la consola de Xcode. Lo que haga falta ver se pinta en pantalla en un build de diagnóstico (DP-17B.7). |

### 1.2 Nuevas, para confirmar en el reporte previo

| DP | Propuesta |
|---|---|
| **DP-17B.1** | **Qué plugin.** Propuesta provisional: **`@capacitor-community/sqlite` 8.1.1, versión exacta**, el que nombra SPEC_17. Tiene `Package.swift` y pide `@capacitor/core >= 8`. **Pero trae SQLCipher dentro aunque no se cifre nada** (lo dice su propio README), y hoy `Info.plist` declara `ITSAppUsesNonExemptEncryption = false` con una prueba que lo exige (`appIos.test.js`, «sin cifrado que declarar»). **REPORTA:** qué dice la documentación de Apple sobre declarar cifrado cuando la app contiene una biblioteca de cifrado que no usa, qué dice Zetetic (el autor de SQLCipher), y qué trámite implicaría cada respuesta. **No cambies la declaración ni la prueba sin decisión de la fundadora.** Alternativas a comparar en el mismo REPORTA: (b) `@capgo/capacitor-fast-sql` (sin SQLCipher en iOS, pero abre un servidor HTTP en el teléfono y pide una excepción de ATS para `localhost`; existe desde oct 2025); (c) un plugin propio mínimo en Swift sobre el SQLite del sistema (sin terceros ni SQLCipher, pero con código nativo que las pruebas de Vitest no ejercitan). |
| **DP-17B.2** | **Dónde vive la base, y desde el primer día.** Nombre `strivo`, `iosDatabaseLocation: 'Library/CapacitorDatabase'` (no `Documents`, que es lo de fábrica del plugin) y `iosIsEncryption: false`. **Entra en la lista de lo que no se toca después de publicar**: cambiar el nombre o la carpeta abriría una base vacía. `appIos.test.js` lo vigila, igual que el identificador. **REPORTA** si la copia de seguridad de iCloud del teléfono incluye esa carpeta (hoy incluye la de WebKit), para decir en CLAUDE.md qué cambia y qué no. |
| **DP-17B.3** | **La forma de las tablas imita la fila real, no la de SPEC_17 §6** (ver §2.4). `registros`: `path` como clave, `uid`, `collection`, `id`, `data` (JSON en texto), `updatedAt` (texto ISO, como hoy) y una columna para `data.date` con su índice. `cola`: `seq` autoincremental, `path` único, `uid`, `op`, `data`, `attempts`, `rev`, `enqueuedAt`. Una tabla `meta` para la marca de migración y la versión del esquema. **REPORTA** la definición exacta, los índices (equivalentes a `byUser`, `byCollection`, `byCollectionDate` y los dos de la cola) y cómo se harán los cambios de esquema futuros (`user_version` o la tabla `meta`). |
| **DP-17B.4** | **El uid también tiene que sobrevivir.** `strivo.uid.local` vive en `localStorage`, que está en el mismo sitio que IndexedDB. Si iOS lo borra y SQLite queda, `uidLocal()` acuña un uid nuevo, aparece la bienvenida y los días quedan en SQLite bajo un uid que nadie lee: el diario se ve perdido aunque esté. Propuesta: en nativo, una copia en SQLite de `strivo.uid.local` (obligatoria) y de `strivo.restaurado.*` y `strivo.mudanzaPendiente.*` (recomendadas); al arrancar, si falta en `localStorage` y está en SQLite, se recupera **antes** de que nadie lea el uid. En web nada cambia. **REPORTA** dónde va la recuperación y cómo se escribe la copia en cada sitio que hoy escribe esas claves. |
| **DP-17B.5** | **La migración.** Una sola vez, en el primer arranque nativo de la versión nueva, dentro de la apertura del almacén: nadie lee ni escribe hasta que termine. (1) Si SQLite ya tiene la marca `migradoEn`, se usa SQLite y **no se vuelve a mirar IndexedDB**, aunque tenga datos. (2) Si no la tiene: se copian **todos** los registros de `records` y **todas** las entradas de `syncQueue` (con su `seq`, `rev`, `attempts` y su orden), en una sola transacción de SQLite. (3) Se verifica: mismo número de registros y de entradas, el mismo conjunto de rutas, y cada registro con el mismo contenido (JSON canónico, claves ordenadas). (4) Solo si todo coincide se escribe `migradoEn` en SQLite, junto con los números. (5) Si algo falla o no coincide: SQLite se vacía, no se marca, **esta sesión sigue con IndexedDB** y el siguiente arranque lo intenta de nuevo. (6) IndexedDB vacío (instalación nueva, o borrado por iOS antes de actualizar): se marca con cero y se usa SQLite. **La marca vive en SQLite y no en `localStorage`**, por lo mismo que DP-17B.4. |
| **DP-17B.6** | **Abrir antes de pintar, sin quedarse nunca en la «S».** En nativo, la apertura (y la migración, si toca) ocurre antes del primer render, con un techo de tiempo. **REPORTA** el valor propuesto, cómo convive con `planDeRetirada` y su techo de 2 s, qué ve la fundadora si la migración tarda, y qué pasa si se cruza el techo. Sin migración, la apertura no debe notarse. |
| **DP-17B.7** | **Un build de diagnóstico, solo para las pruebas.** Con `VITE_DIAG_ALMACEN=1` en `npm run ios:build`, Tu perfil muestra, al final del bloque de sincronización, una línea con: qué almacén se usa, el resultado de la migración (correcta con fecha y hora, nada que migrar, o no terminó con su motivo) y cuántos registros y entradas por subir hay en IndexedDB y en SQLite. Y un botón que **simula que iOS borró el almacén del WebView**: borra la base `strivo` de IndexedDB y las claves `strivo.*` de `localStorage`, y recarga. **No toca la sesión de Firebase** (`firebaseLocalStorageDb`). Sin la bandera, ni la línea ni el botón existen en el código servido, y una prueba lo vigila. **REPORTA** los textos, cómo se evita el `blocked` de `deleteDatabase` (DP-17.12) y si el botón cabe sin crear un bloque nuevo en `perfil/bloques.js`. |
| **DP-17B.8** | **Nada se pisa en SQLite.** En IndexedDB, siete operaciones leen y escriben dentro de una transacción y por eso dos escrituras simultáneas no se pisan (§2.2). En SQLite cada llamada cruza el puente nativo y, entre dos `await`, otra operación puede colarse. Propuesta: un cerrojo en JS que haga pasar las operaciones del adaptador de una en una, más transacciones de SQLite donde haya varias sentencias. **REPORTA** cómo queda cada una de las siete. |
| **DP-17B.9** | **Si SQLite no abre.** Antes de la migración: esta sesión con IndexedDB, como en DP-17B.5. **Después de la migración, nunca se vuelve a IndexedDB**: lo de IndexedDB es una copia vieja y escribir ahí partiría el diario en dos. **REPORTA** qué ve la persona en ese caso (con los estados de error que ya existen, sin códigos, RN-EST-04) y cuántos reintentos hay. |
| **DP-17B.10** | **Volver atrás, y cuándo se borra IndexedDB.** Antes del lanzamiento, revertir es revertir el commit y reinstalar en los teléfonos de prueba. **Después de publicar la 1.0 con SQLite, no hay vuelta a IndexedDB sin una migración inversa**: se escribe así en CLAUDE.md. Borrar el IndexedDB viejo queda como deuda para una versión posterior a la 1.0, con decisión de la fundadora, nunca en esta. |

Criterio de producto de la fundadora, que manda sobre todo lo anterior: **en el iPhone, lo escrito sigue ahí aunque iOS limpie el WebView, y actualizar la app no cambia ni una letra de nada.**

---

## 2. Lo que ya está verificado en el código (10 nov 2026, sobre `9faf6a2`)

### 2.1 La capa local hoy

- **`local.js` es la única puerta a IndexedDB** para los datos de la app. Base `strivo`, `DB_VERSION = 1`, dos almacenes:
  - `records`, con clave `path` e índices `byUser` (`uid`), `byCollection` (`[uid, collection]`) y `byCollectionDate` (`[uid, collection, data.date]`).
  - `syncQueue`, con `seq` autoincremental e índices `byPath` (único) y `byUser`.
- Nadie más en `src/` (fuera de pruebas) abre IndexedDB para datos. `getLocalDB`, `STORE_RECORDS` y `STORE_SYNC_QUEUE` solo los usan las pruebas (`helpers.js`, `conexion.test.js`, `sincronizacionFiable.test.js`, `pinContrasena.test.js`, `repositorioRespiracion.test.js`) e `index.js` los reexporta.
- **El contrato que se conserva** (lo que importan `shared.js`, `diario.js`, `sync.js`, `restaurar.js`, `entradaCuenta.js`, `repositorioRespiracion.js` e `index.js`): `readPath`, `readCollection`, `readCollectionByDate`, `readCollectionBy`, `writePath`, `mergePath`, `writePathIfAbsent`, `deletePath`, `mudarUid`, `borrarUid`, `esRutaLocal`, `alEncolar`, `enqueue`, `listQueue`, `dequeue`, `dequeueSiIgual`, `markQueueAttempt`, `pendingCount`, `newId`, `claveDeMudanzaPendiente`, `almacenLocal`, `getLocalDB` y `closeLocalDB`. **REPORTA** si encuentras algún consumidor más.
- **El orden de las lecturas:** `getAllFromIndex` devuelve las filas ordenadas por la clave del índice y después por `path`. Algún consumidor puede depender de eso. SQLite tiene que devolver el mismo orden (`ORDER BY path`). **REPORTA** si las rutas son siempre ASCII (IndexedDB compara en UTF-16 y SQLite en bytes; con ASCII da igual).

### 2.2 Las siete operaciones que hoy dependen de una transacción

`mergePath` (leer y escribir el mismo registro), `writePathIfAbsent` (escribir solo si no existe), `mudarUid` (una transacción sobre `records`, y después la cola), `borrarUid` (los dos almacenes a la vez), `enqueue` (buscar la entrada de la ruta y reescribirla con `rev + 1`), `dequeueSiIgual` (sacar solo si la revisión coincide, H-1 de SPEC_31) y `markQueueAttempt`. Cada una tiene su razón escrita en el comentario; ninguna puede perder esa garantía (DP-17B.8).

### 2.3 Lo que vive fuera de IndexedDB y también corre peligro

- **`localStorage`** guarda tres hechos del teléfono: `strivo.uid.local` (`ArranqueProvisional.jsx`; `uidLocal()` lo lee de forma síncrona en el `useState` inicial y acuña uno nuevo si falta), `strivo.restaurado.<uid>` (`restaurar.js`) y `strivo.mudanzaPendiente.<uid>` (`local.js` y `entradaCuenta.js`). Ver DP-17B.4.
- **La sesión de Firebase Auth** en nativo usa `indexedDBLocalPersistence` (`opcionesDeAuth`, `firebase.js`). **Queda fuera de esta SPEC.** Si iOS la borra, la persona queda en `vencida`: nada se pierde, lo escrito espera en la cola y sube al volver a entrar. **REPORTA** que eso sigue siendo así con SQLite, y anótalo como deuda en CLAUDE.md.

### 2.4 SPEC_17 §6 no coincide con la fila real

SPEC_17 §6 propone `records (id TEXT PK, path TEXT, data TEXT, updatedAt INTEGER, deletedAt INTEGER)`. La fila real de hoy es `{ path, uid, collection, id, data, updatedAt }`: la clave es `path` (no `id`, que puede ser `null` en documentos únicos), `updatedAt` es texto ISO y **no existe `deletedAt`**, porque `deletePath` borra de verdad. Copiar la tabla de §6 cambiaría formatos y abriría la puerta a perder filas. **Manda la fila real** (DP-17B.3).

### 2.5 El plugin (`@capacitor-community/sqlite` 8.1.1, leído del paquete de npm)

- Publicado en npm el 6 de agosto de 2026 (octubre es la fecha de la última modificación del paquete; corregido en el reporte previo). `peerDependencies`: `@capacitor/core >= 8.0.0`. Dependencia: `jeep-sqlite` (su implementación web, que **no debe cargarse nunca en la web de Strivo**).
- `Package.swift` presente (`swift-tools-version: 5.9`, iOS 15+), con dependencias de `capacitor-swift-pm` ≥ 8.0.0, **`SQLCipher.swift` ≥ 4.14.0** y `ZIPFoundation`.
- Su README avisa que usa SQLCipher **incluso con bases sin cifrar** y que eso está sujeto a las reglas de exportación de cifrado.
- Carpeta por defecto en iOS: `Documents`, salvo que se configure `iosDatabaseLocation`.
- No encontré `PrivacyInfo.xcprivacy` en el paquete. **REPORTA** si el plugin, SQLCipher o ZIPFoundation usan API que Apple obliga a declarar en el manifiesto de privacidad.

### 2.6 Lo que ya promete la app de iPhone

- `ITSAppUsesNonExemptEncryption = false` en `Info.plist`, vigilado por `appIos.test.js` (DP-17B.1).
- `esNativa()` usa `isNativePlatform()`: cuando llegue Android (SPEC_26) también será nativa, así que Android heredará SQLite sin cambiar JS. **REPORTA** si hace falta algo para que eso no rompa nada hoy.
- `main.jsx` pinta en cuanto carga; `retirarPantallaDeArranque()` va primero y tiene techo de 2 s (DP-17B.6).

---

## 3. Alcance

**Entra:** el adaptador SQLite con el mismo contrato, elegido por `esNativa()`; la migración única y verificada de IndexedDB a SQLite (registros y cola); la copia de las claves del teléfono (DP-17B.4); la apertura antes de pintar; el build de diagnóstico; la configuración del plugin en `capacitor.config.json` y lo que regenere `cap sync`; pruebas; `CLAUDE.md`; esta instrucción en `docs/specs/`.

**No entra:** borrar IndexedDB; Android (SPEC_26); cifrado en reposo del Journal (backlog B-5); mover la sesión de Firebase Auth fuera de IndexedDB; cambiar `sync.js`, `restaurar.js`, `conflictos.js`, el modelo de datos o las reglas de fusión (salvo lo mínimo que pida el adaptador, y se **REPORTA**); `onSnapshot`; D-21.11 y D-21.13; firebase 12; la exportación (SPEC_24).

---

## 4. Cambios esperados (a confirmar en el reporte previo)

- **`src/lib/db/local.js`:** mismo contrato público; por dentro, delega en un adaptador elegido una vez. Propuesta de forma (los nombres los propones tú): el código de IndexedDB de hoy, movido **sin cambiar su comportamiento**; un adaptador SQLite, que es **el único archivo de `src/` que importa el plugin, y bajo demanda** (como `credencialNativa.js`), con una prueba que recorre `src/` para comprobarlo; la migración; y la copia de las claves del teléfono. `local.js` sigue sin importar `sync.js`, y `alEncolar` avisa igual con los dos adaptadores.
- **`src/main.jsx` y/o `ArranqueProvisional.jsx`:** la preparación del almacén antes del primer render en nativo, y la recuperación del uid (DP-17B.4 y DP-17B.6).
- **`package.json` y `package-lock.json`:** el plugin en versión exacta. **REPORTA** cuánto pesa `jeep-sqlite` en `npm install` (Netlify lo instala en cada build) y si trae algún script de instalación.
- **`capacitor.config.json`:** la configuración del plugin (DP-17B.2). Nada de `server`, `scheme` ni `hostname`.
- **`ios/App/CapApp-SPM/Package.swift` y `Package.resolved`:** los que regenere `cap sync`. **REPORTA** si el plugin necesita `packageOptions` (como el `symlink` de Firebase), si resuelve con `capacitor-swift-pm` 8.5.3 y `swiftToolsVersion: "6.1"`, y cuánto crece la app.
- **`ios/App/App/Info.plist` y `appIos.test.js`:** la declaración de cifrado **solo si la fundadora lo decide** (DP-17B.1); la prueba nueva de nombre y carpeta de la base (DP-17B.2).
- **Tu perfil:** la línea y el botón de diagnóstico, solo con la bandera (DP-17B.7).
- **`src/copy/index.js`:** los textos del diagnóstico (§6). Ningún texto visible para usuarias cambia.
- **`CLAUDE.md`:** sección nueva «Lo escrito en el iPhone, en SQLite (SPEC_17B)»; la base (nombre y carpeta) entra en «Lo que no se toca nunca»; entradas nuevas en «Dónde vive cada regla»; la línea de la pila («IndexedDB en web · SQLite en la app nativa»); la deuda de borrar IndexedDB y la de la sesión de Firebase Auth; los recuentos de §13.

---

## 5. Criterios de aceptación

### Automáticos (Claude Code)

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde.
2. **Las pruebas de la capa local corren contra los dos adaptadores con el mismo resultado**: las de hoy, sin cambiar lo que comprueban, más las de concurrencia: dos `mergePath` simultáneos no se pisan; `writePathIfAbsent` no pisa una escritura que llega a la vez; `dequeueSiIgual` no saca una revisión nueva; `mudarUid` con y sin política; `borrarUid` solo borra su uid. **REPORTA** con qué motor de SQLite corren en Node (`node:sqlite`, `sql.js` u otro) y cómo se dobla el plugin.
3. **Migración completa:** se copian todos los registros —`diario/pinConfig`, `shared/frases` y `frasesDelDia` incluidos— y todas las entradas de la cola con su `seq`, `rev`, `attempts` y orden. Conteo, conjunto de rutas y contenido canónico coinciden. **IndexedDB queda idéntico antes y después** (volcado comparado).
4. **Migración que falla** (error a mitad de la copia y contenido que no coincide): SQLite queda vacío, sin marca, la sesión usa IndexedDB, y el siguiente arranque lo intenta y lo logra. Nada se pierde.
5. **Ya migrado:** un segundo arranque no migra otra vez aunque IndexedDB haya cambiado, y no lee IndexedDB.
6. **IndexedDB vacío:** se marca con cero y se usa SQLite.
7. **Lo que baja no sube:** `restaurar` escribe en SQLite con `sync: false` y `pendingCount` queda en 0 (SPEC_17, criterio 2, ahora sobre SQLite).
8. Las rutas de `esRutaLocal` nunca entran en la cola de SQLite.
9. **El uid sobrevive:** con `localStorage` vacío y el uid copiado en SQLite, la app arranca con ese uid y no acuña otro.
10. **La web no cambia:** con `esNativa()` en `false` se usa IndexedDB; el plugin solo se importa en un archivo y bajo demanda (prueba que recorre `src/`); **REPORTA** el tamaño de los chunks de `npm run build` antes y después, y confirma que nada del plugin ni de `jeep-sqlite` entra en el chunk principal de la web.
11. `appIos.test.js` sigue exigiendo identificador, esquema y host de fábrica, y ahora también el nombre y la carpeta de la base y `iosIsEncryption: false`.
12. Sin `VITE_DIAG_ALMACEN`, ni la línea ni el botón de diagnóstico existen (prueba).
13. Ningún commit lleva `DEVELOPMENT_TEAM` ni `GoogleService-Info.plist`.
14. Las pruebas de SPEC_17A, 19.1, 19.2, 21.1, 21.2, 29, 30 y 31 siguen pasando sin cambiar lo que comprueban.
15. **Al menos 30 casos nuevos.** **REPORTA** cuánto tarda la migración de 3.000 registros en Node, como referencia.

### Manuales (la fundadora, en su iPhone, contra `strivo-fe04f`)

Nombres que se usan abajo:
- **«La versión de hoy»**: la carpeta `~/Developer/strivo`, rama `strivo`, compilada con `npm run ios:build`.
- **«La nueva con diagnóstico»**: la carpeta `~/Developer/strivo-17b`, rama `revision-17b`, compilada con `VITE_DIAG_ALMACEN=1 npm run ios:build`.
- **«La nueva limpia»**: la misma carpeta, compilada con `npm run ios:build`, sin la bandera.

Para pasar de una a otra: cerrar Xcode, compilar en la carpeta que toca y abrir su Xcode con `npm run ios:abrir`. **Instalar encima no borra nada**: solo se borra la app cuando la prueba lo dice.

- **M1 · Sin cuenta, lo de hoy pasa entero.** Con la versión de hoy, en un teléfono sin Strivo: onboarding sin cuenta (P7 → «Ahora no»), nombre «Prueba M1»; una mañana con un texto reconocible; una entrada del Journal y un PIN; una elección en «Personaliza tus frases» y captura de la frase del día; una combinación favorita en Respiración. Después, **sin borrar la app**, instalar la nueva con diagnóstico. **Debe verse:** sin bienvenida; la mañana, el Journal (pide el PIN), las frases y su elección, la combinación y el Historial, iguales; la línea dice SQLite, migración correcta y el mismo número de registros en los dos lados. **Si dice 0 registros en IndexedDB**, la instalación borró los datos: se para y se avisa.
- **M2 · Lo nuevo se queda y no se migra dos veces.** Escribir algo nuevo, cerrar la app deslizando y abrirla desde el ícono. **Debe verse:** lo nuevo, y la fecha y hora de la migración sin cambiar.
- **M3 · Si iOS limpiara el WebView.** Con modo avión, tocar el botón de simulación. **Debe verse:** sin bienvenida, mismo nombre, todo lo escrito, el Journal pide el PIN, y la línea dice 0 en IndexedDB y lo de siempre en SQLite.
- **M4 · Con cuenta y algo sin subir.** Con la versión de hoy, en un teléfono sin Strivo: entrar con `atreloz.prueba.1@gmail.com` (correo); escribir algo con red; poner modo avión y escribir otra cosa en el Journal; cerrar la app. **Con el modo avión puesto**, instalar la nueva con diagnóstico por cable. **Debe verse:** las dos cosas, y la línea con 1 por subir en los dos lados. Al quitar el modo avión, Tu perfil pasa a guardado sin tocar nada, y lo escrito sin red aparece en la web publicada al entrar con esa cuenta en una ventana privada.
- **M5 · Instalación nueva con Google.** Borrar la app, instalar la nueva con diagnóstico y entrar con `filantraconsulting@gmail.com` (Google). **Debe verse:** sus días como en SPEC_31, la línea dice «nada que migrar» y Tu perfil dice que todo está guardado. Después, con modo avión, la simulación del botón no le quita nada.
- **M6 · Cerrar sesión y volver.** Cerrar sesión (aparece la bienvenida, como debe) y volver a entrar con la misma cuenta: los días vuelven.
- **M7 · La versión limpia y la web.** Instalar la nueva limpia sin borrar la app: no hay línea ni botón de diagnóstico y todo sigue. En `localhost` (`npm run dev` en `~/Developer/strivo-17b`): escribir, recargar, sigue ahí; sin línea de diagnóstico.

---

## 6. Copy

**Ningún texto visible para usuarias cambia.** Los del diagnóstico viven en `src/copy/index.js` igual (RN-VOZ-01), solo se pintan con la bandera y **pasan `lint:copy`**: ojo con «pendiente», que es léxico prohibido; se dice «por subir». Propuesta, a confirmar con los textos exactos en el reporte previo:

| Clave | Texto |
|---|---|
| `almacen` | Almacén: {cual} |
| `migracion.correcta` | Migración: correcta, {fecha} |
| `migracion.nadaQueMigrar` | Migración: nada que migrar |
| `migracion.noTermino` | Migración: no terminó ({motivo}) |
| `conteo` | {almacen}: {registros} registros, {porSubir} por subir |
| `simular` | Simular que iOS limpió el almacén |

---

## 7. Reglas de arquitectura que roza

- **Nada se pierde:** la migración nunca escribe ni borra en IndexedDB; una migración a medias no se marca; después de marcar, nunca se escribe en IndexedDB.
- **Nada se corrige en silencio (RN-DB-02):** si al migrar aparece algo que no se puede copiar tal cual a JSON (un `Date`, un `undefined` que importe, un valor que no sea JSON), la migración no lo arregla: no termina y lo dice en la línea de diagnóstico. **REPORTA** antes si algún escritor de hoy guarda algo así.
- **Nada bloquea:** la app nunca se queda en la «S» ni en un velo sin salida.
- **Una regla, un sitio:** qué almacén se usa lo decide un solo módulo; `esNativa()` sigue siendo la única pregunta por la plataforma; el plugin se importa en un solo archivo.
- **Dirección de dependencias:** `lib/db/` no importa de `breathing/`, `diario/`, `perfil/` ni componentes.
- **Nada secreto en el repo:** ni el Team ni `GoogleService-Info.plist` ni `.env.local`. Commits por ruta, nunca `git add -A`, `git add .` ni `git commit -a`. Antes de comitear, `git show :ios/App/App.xcodeproj/project.pbxproj | grep DEVELOPMENT_TEAM` sale vacío. **No aceptes «Update to recommended settings» de Xcode.**

---

## 8. Entrega

1. **Trabaja en un worktree aparte**, como en SPEC_31: `~/Developer/strivo-17b`, rama local `revision-17b` creada desde `strivo`. **`~/Developer/strivo` se queda en `strivo` y no se toca**: es donde la fundadora compila «la versión de hoy» para preparar M1 y M4.
2. Para que el worktree compile la app de iPhone: copia desde `~/Developer/strivo` los dos archivos que no están en git (`.env.local` y `ios/App/App/GoogleService-Info.plist`), corre `npm install` y avisa a la fundadora de que tiene que elegir su Team en el Xcode de esa carpeta una vez. Ninguno de los tres se comitea.
3. Commits pequeños y por tema (adaptador / migración / claves del teléfono / arranque / plugin y configuración / diagnóstico / pruebas / docs), cada uno con la línea `Co-Authored-By` del repo, añadiendo archivos por ruta.
4. **Sin push** hasta que la fundadora lo apruebe; entonces `git push origin revision-17b`. Nunca a `strivo` directamente.
5. Reporte final: qué se hizo, cada **REPORTA** con su respuesta, la salida de las siete validaciones, archivos y casos de prueba antes y después, y la lista M1–M7 con los textos exactos que la fundadora verá.

---

## 9. Reporte previo y decisiones

Reporte previo de Claude Code (10 nov 2026) aprobado por la fundadora, con las condiciones de abajo. El reporte confirmó que nadie más que `local.js` abre IndexedDB para datos de la app, que todas las rutas son ASCII y que ningún escritor de hoy guarda `Date`, `Map` ni binarios.

| Punto | Decisión |
|---|---|
| **DP-17B.1 · Plugin** | **(c) Un plugin propio mínimo**, en `plugins/strivo-almacen/`, como paquete npm local con su `Package.swift`, sobre el SQLite del sistema. **`ITSAppUsesNonExemptEncryption` sigue en `false` y su prueba no cambia.** Sin SQLCipher, sin servidor local y sin `jeep-sqlite`. Motivo: con (a) la declaración de cifrado deja de poder ser `false` (Apple, Zetetic y el README del plugin coinciden), con el trámite que eso abre; (b) mete un servidor HTTP en el teléfono de una app de diario. **Condiciones:** (1) **lo primero** es comprobar que Swift Package Manager resuelve el paquete local por el enlace que crea `cap sync`; si choca como Firebase, se para y se reporta, sin rodeos; (2) **todas las sentencias con parámetros enlazados**: ningún texto escrito por la persona entra nunca dentro del SQL; (3) una sola conexión, atendida por una cola serial nativa; (4) WAL con `synchronous = FULL`, para que cada escritura confirmada sobreviva a un corte de luz (**REPORTA** si propones otra cosa y por qué); (5) la protección de archivo de fábrica de iOS (hasta el primer desbloqueo), **nunca** `Complete`, que dejaría la base cerrada con el teléfono bloqueado; (6) **pruebas XCTest del plugin en el simulador** (`xcodebuild test`), con su salida en el reporte final: es lo que cubre el código que Vitest no ejecuta; (7) la API más pequeña posible (abrir, saber si el archivo existe, ejecutar un lote en una transacción, consultar); **REPORTA** la API final; (8) el build de Netlify sigue pasando con el paquete local en `package.json`. La mitad para Android (Kotlin) queda para SPEC_26. |
| **DP-17B.2 · Carpeta y copia de iCloud** | **`Library/Strivo/strivo.sqlite`, dentro de la copia de seguridad de iCloud** (sin `isExcludedFromBackup`). Así «nada se pierde» vale también al cambiar de iPhone desde una copia, con o sin cuenta. Hoy `localStorage` no entra en la copia, así que el uid ya se pierde al restaurar un teléfono; con la copia del uid en SQLite deja de pasar. **La ruta es irreversible tras publicar** y entra en «Lo que no se toca nunca» de CLAUDE.md, con una prueba que la vigila. CLAUDE.md dice, sin adornos, que lo escrito y el uid viajan en la copia de iCloud del teléfono, que Apple cifra. |
| **DP-17B.3 · Tablas** | Aprobadas tal como vienen en el reporte (`registros`, `cola`, `meta`, `claves`). Los cambios de esquema futuros, con `meta` (`esquema = 1`). |
| **DP-17B.4 · Claves del teléfono** | Aprobado: `clavesDelTelefono.js`, recuperación en `prepararAlmacen()` antes del primer render, `localStorage` manda cuando tiene el uid. Las líneas que cambian en `restaurar.js` (2) y `entradaCuenta.js` (3) se aceptan. |
| **DP-17B.5 y §7 · Valores que no son JSON** | **La migración no termina y lo dice** (motivo «hay un valor que no es JSON» en la línea de diagnóstico). Nada se corrige en silencio. Si aparece en M1, se decide con el caso delante. |
| **DP-17B.6 · Arranque** | Aprobado: el velo liso de hoy se pinta primero y después se monta `<App/>`; techo de 10 s; las reglas del reporte para cruzarlo, incluida la de no abrir IndexedDB si `strivo` no aparece en `indexedDB.databases()`. |
| **DP-17B.7 · Diagnóstico** | Aprobado: textos en `src/copy/diagnostico.js`, cargado solo con `VITE_DIAG_ALMACEN=1`, y una prueba que construye sin la bandera y los busca en `dist/`. Los textos del reporte (§7) se aprueban tal cual. |
| **DP-17B.8 · Concurrencia** | Aprobado: un cerrojo para todas las llamadas, lecturas incluidas, y las siete operaciones como las describe el reporte. Con (c), el lote del plugin es la transacción. |
| **DP-17B.9 · SQLite no abre** | Tres intentos dentro del techo. Con (c) desaparece el caso dudoso: **se pregunta al plugin si el archivo de la base existe**. Si existe y no abre → la pantalla de error que ya existe, con «Reintentar». Si no existe y no se puede crear → esta sesión sigue con IndexedDB, sin marca, y el siguiente arranque migra. La pista `strivo.almacen` en `localStorage` se queda como segunda señal. |
| **DP-17B.10** | Sin cambios. |
| **Motor de pruebas** | `node:sqlite`, sin dependencias nuevas. Correr las pruebas pide Node 22.13 o más: se anota en CLAUDE.md §12. |
| **Por qué la migración pesa poco** | La 1.0 sale ya con SQLite: quien la instale desde la tienda nunca migra. La migración solo corre en teléfonos que tenían una compilación anterior (los de la fundadora y testers, si los hay antes). Por eso se puede ser estricta (bloquear antes que corregir) sin dejar a nadie atrás. |
| **Trabajo** | Worktree `~/Developer/strivo-17b`, rama `revision-17b`, según §8. |


---

## 10. Implementación y pruebas manuales (10 nov 2026)

**Implementación.** Rama `revision-17b` (worktree `~/Developer/strivo-17b`), 9 commits sobre `9faf6a2`: plugin propio `strivo-almacen` (`7290b81`), claves del teléfono (`20b60c9`), migración (`3db734a`), `local.js` sobre `almacen.js` (`8e1fe37`), velo primero (`514fc7a`), diagnóstico con bandera (`5ab715d`), la suite contra los dos almacenes (`f6098ac`), docs (`e155fd9`) y la prueba de `journal.test.js` más el volcado del PIN en SQLite (`0cd03c1`).

- Siete validaciones en verde; `npm run test` en verde tres veces seguidas (206 archivos, 5.176 casos, 5 saltados). 17 pruebas XCTest del plugin en el simulador.
- La app pasa de 9,0 a 9,3 MB (+108 KB), sin SQLCipher; `ITSAppUsesNonExemptEncryption` sigue en `false`. El chunk principal de la web pasa de 725,97 a 730,19 kB; SQLite y la migración van en un chunk que la web no descarga.
- **Desvíos aceptados:** el criterio 11 vigila la ruta, la copia de iCloud, la protección, WAL y FULL en lugar de `iosIsEncryption` (era del plugin de terceros); sin cuenta, «por subir» no es 0 (lo escrito espera en la cola a que haya cuenta); una escritura nueva en SQLite pierde las claves con `undefined` (deuda anotada en CLAUDE.md; ningún escritor de hoy lo hace).
- **La intermitente de `journal.test.js`** se arregló en la prueba (dos fechas fijas), sin tocar `listJournalEntries`.

**Pruebas manuales: las siete pasan** (la fundadora en su iPhone, contra `strivo-fe04f`):

| Prueba | Resultado |
|---|---|
| **M1** · Sin cuenta, lo de hoy pasa entero | ✅ Sin bienvenida; mañana, Journal, frase del día, elección de frases, combinación favorita e Historial iguales. «Migración: correcta, 10 nov 2026, 13:38»; 10 registros y 6 por subir en los dos lados. **El PIN no se pudo probar aquí**: sin cuenta, el Journal no deja ponerlo. Pasó a M4. |
| **M2** · Lo nuevo se queda y no se migra dos veces | ✅ La entrada nueva sigue tras cerrar y abrir; la misma hora de migración; IndexedDB se queda en 10/6 y SQLite sube a 11/7. |
| **M3** · Si iOS limpiara el WebView | ✅ Con modo avión y el botón de simulación: sin bienvenida, mismo nombre, todo lo escrito; IndexedDB 0/0 y SQLite 11/7. |
| **M4** · Con cuenta, PIN y algo sin subir | ✅ El Journal pide el PIN tras actualizar y tiene las dos entradas; la escrita sin red llega a la nube y se ve en la web publicada. **Desvío:** la app nueva no abrió en modo avión (iOS tiene que verificar por internet el certificado de desarrolladora tras borrar la app), así que se abrió con red: la línea de IndexedDB conservó el pendiente y SQLite bajó a 0, lo que prueba que la cola se mudó, porque esa entrada solo podía subir desde ella. |
| **M5** · Instalación nueva con Google | ✅ «Nada que migrar», IndexedDB 0/0, SQLite 11/0 y «Lo de este teléfono está guardado en tu cuenta.» Con modo avión y la simulación: la cuenta sigue, 11 registros, «Sin conexión…» y sin el aviso de restauración. |
| **M6** · Cerrar sesión y volver | ✅ Diálogo correcto, bienvenida al salir y los días vuelven al entrar con Google. |
| **M7** · Versión limpia y web | ✅ Sin la bandera no hay líneas ni botón y todo sigue; en `localhost`, lo escrito sobrevive a recargar y no hay diagnóstico. |

**Aprendido para pruebas futuras:** después de borrar la app, la primera vez que se abre una compilación de Xcode el iPhone necesita internet para verificar el certificado. Para probar algo «sin red» desde la instalación, hay que abrirla una vez con red antes, o aceptar el plan B de M4.
