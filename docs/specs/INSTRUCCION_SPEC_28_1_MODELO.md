# SPEC_28.1 — Instrucción de ejecución: modelo, estados y validador de «Una pausa»

**Para:** Claude Code
**Rama:** `una-pausa`, en el worktree `../strivo-una-pausa`, creada desde `strivo` · **Commit de referencia:** `1aa5e87` (2 oct 2026)
**Gobierna:** `docs/specs/SPEC_28_UNA_PAUSA.md` (v0.2) + `SPEC_00B` + `CLAUDE.md`
**Alcance:** la entrega 28.1. Lógica pura. Ni una pantalla, ni una ruta, ni un archivo de contenido, ni un cambio en `strivo`.
**Versión:** 1.0 — 3 oct 2026.

---

## 0. Antes de escribir una sola línea

1. **Verifica dónde estás.** La fundadora ya creó el worktree `../strivo-una-pausa` en la rama `una-pausa` y abrió esta sesión ahí. Comprueba y **REPORTA**:
   ```bash
   pwd                                   # debe terminar en strivo-una-pausa
   git branch --show-current             # una-pausa
   git log -1 --format="%H %ci %s"       # 1aa5e87 o posterior de strivo
   git status                            # solo los dos documentos nuevos de docs/specs/
   ```
   Si algo no coincide, **detente y avisa**; no crees otro worktree ni cambies de rama. Todo el trabajo de esta entrega ocurre en esta carpeta.
2. Lee la SPEC_28 v0.2 entera (sobre todo §3.1, §4, §4.1 y §5), `SPEC_00B`, y en `CLAUDE.md` las secciones 2 (navegación), 3 (voz), 11 (arquitectura) y 12 (comandos).
3. Inspecciona: `scripts/lint-copy.js` (`FORBIDDEN`, `CLINICO`, `checkRespiracion`, `POR_ENTRADA`, los `import()` dinámicos de `src/`), `src/lib/db/dates.js`, `src/lib/timeSlot.js`, `src/diario/fechas.js` (solo para no duplicar: **no se importa**), `eslint.config.js` (cómo se declaran las fronteras de `breathing/` y de `NEUTRAL_FILES`), `vitest.config.js`, y una prueba de repo existente que recorra archivos fuente (busca la que impide `getDoc` fuera de `restaurar.js`) como modelo.
4. **Reporta cualquier desvío y espera aprobación antes de codificar.** Los puntos **REPORTA** se reportan aunque no haya desvío.
5. No implementes nada fuera de la §4.

---

## 1. Qué resuelve esta entrega

Una pausa no existe en el repo. Antes de que haya pantalla o canal, hace falta **el único sitio** que sabe:

- qué forma tiene una cápsula,
- en qué estados puede estar y quién la mueve entre ellos,
- qué semana es en Monterrey,
- qué cápsula toca mostrar esta semana (programada → reserva → la última publicada),
- y qué le falta a una cápsula para avanzar.

Lo usarán el script del canal (28.2), la pantalla (28.3) y, en Fase B, el servidor. Por eso es **lógica pura**: sin React, sin navegador, sin `fs`, sin red, sin alias de Vite.

**Lo que no hace:** no lee ni escribe archivos de cápsulas, no genera `feed.json`, no toca `netlify.toml`, no añade copy a `src/copy/index.js`, no toca `App.jsx`, ni `NavStrivo.jsx`, ni `Hoy.jsx`.

---

## 2. Decisiones cerradas, no se reabren

| DP | Decisión |
|---|---|
| DP-28.0 | Una pausa vive en `una-pausa` hasta que la fundadora decida fusionarla. Nada de esta entrega llega a `strivo`. |
| DP-28.1 / 28.2 | Cabecera de cuatro con desplazamiento horizontal. **No es de esta entrega**; se menciona para que el modelo no asuma nada de la navegación. |
| DP-28.3 | El canal vivirá en `https://contenido.hellostrivo.com/una-pausa/feed.json`. Esta entrega exporta la URL como constante (`URL_CANAL`) y nada más. |
| DP-28.4 | Portadas: fotografías hiperrealistas generadas con IA. El modelo exige `coverAsset` y `coverAltText` desde `prevalidada`; el tamaño y el formato del archivo los comprueba 28.2, no esta entrega. |
| DP-28.13 | **Exención léxica temporal:** «estrés» y «ansiedad» (y sus plurales) se permiten en el texto de las cápsulas. El resto de `CLINICO` y todo `FORBIDDEN` siguen prohibidos. La exención es una constante con nombre propio y un comentario que dice que caduca con la adenda de la cápsula piloto. |
| DP-28.15 | Los campos `reviewedBy` y `approvedBy` admiten solo identificadores de una lista (`EDITORAS = ['fundadora']`). Nunca un correo ni un nombre completo: el repo es público. |

**Pendiente, con valor provisional (cambia una constante si la fundadora decide otra cosa):**

| DP | Valor provisional en esta entrega |
|---|---|
| DP-28.9 | Revisión: **marca por sección** (`reviewedSections`), no edición forzada. Validación final: **a más tardar el miércoles previo al lunes de publicación, 23:59:59 en Monterrey**. Las dos reglas viven en una constante cada una (`REVISION_POR_SECCION`, `LIMITE_VALIDACION_FINAL`). |

---

## 3. Desvíos ya conocidos

Estos ya se saben; no hace falta reportarlos como hallazgo, sí confirmar cómo los resuelves.

1. **El modelo del brief no tiene dónde guardar la práctica dentro de la cápsula.** `practiceDestination: 'in_capsule'` solo trae `practiceLabel`. Se añade `practiceText?: string`, obligatorio solo con ese destino.
2. **El modelo del brief no dice quién aprueba.** Se añade `approvedBy?: string`.
3. **Faltan tres campos que la SPEC introduce:** `reserva: boolean` (cápsula aprobada sin semana, para cubrir una semana vacía), `piloto: boolean` (nunca sale en el canal ni en el archivo) y `reviewedSections` (DP-28.9).
4. **`publicada` y `archivada` no se escriben en Fase A: se derivan.** Una cápsula `programada` cuya semana llegó está publicada; la anterior pasa al archivo. Un archivo de cápsula que declare `publicada` o `archivada` es un error en Fase A. Los dos estados existen en el tipo porque Fase B los escribirá.
5. **El léxico vive hoy dentro de `scripts/lint-copy.js`**, que no exporta nada. Esta entrega necesita la misma lista sin copiarla. Ver §4.5.

---

## 4. El trabajo, por archivo

Carpeta nueva: `src/unaPausa/modelo/`. **Todos sus `import` son relativos con extensión `.js`**, sin `@/`: `scripts/` los cargará con `import()` desde Node, como ya hace `lint-copy.js` con `src/copy/index.js`.

### 4.1 La forma — `src/unaPausa/modelo/capsula.js`

- Exporta `ESTADOS` (los nueve del brief, congelados), `DESTINOS_DE_PRACTICA` (`'breathing' | 'journal' | 'in_capsule'`), `SECCIONES_REVISABLES` (`'opening' | 'evidence' | 'practice' | 'prompt' | 'sources' | 'cover'`), `EDITORAS`, `URL_CANAL`.
- Documenta en JSDoc el tipo `WeeklyCapsule` con los campos del brief más los de §3. **Los nombres de campo van en inglés, como el resto de los datos del repo** (`schema.js`); los identificadores de código, en español, como siempre.
- `weekStart` es una clave de fecha `AAAA-MM-DD` que cae en lunes; `null` solo en reservas y en `tema_calendarizado` sin fecha. Las marcas de tiempo (`generatedAt`, `reviewedAt`, `prevalidatedAt`, `approvedAt`, `scheduledAt`) son ISO 8601 con desfase.

**REPORTA** si `src/lib/db/dates.js` ya tiene un validador de clave de fecha que se pueda usar desde aquí sin cruzar ninguna frontera, o si conviene uno propio.

### 4.2 La semana — `src/unaPausa/modelo/semana.js`

- `ZONA = 'America/Monterrey'`.
- `fechaEnZona(instante)` → `'AAAA-MM-DD'` del calendario de Monterrey, con `Intl.DateTimeFormat` y `timeZone: ZONA`. **Prohibido** `getDay()`, `getHours()`, `getDate()` y cualquier método local de `Date`: el resultado no puede depender de la zona horaria del proceso.
- `lunesDe(instante)` → la clave del lunes de la semana a la que pertenece ese instante en Monterrey (semana de lunes a domingo).
- `restarDias(clave, n)` / `sumarDias(clave, n)` sobre claves, sin pasar por la hora local.
- `limiteValidacionFinal(weekStart)` → el instante de cierre según `LIMITE_VALIDACION_FINAL` (provisional: miércoles anterior, 23:59:59 Monterrey).

Sin dependencias nuevas. `date-fns` ya está, pero `date-fns` v3 no sabe de zonas y **no se añade `date-fns-tz`**.

### 4.3 Los estados — `src/unaPausa/modelo/estados.js`

- `TRANSICIONES`: la tabla §4.1 de la SPEC como datos, con el actor de cada una (`'editora' | 'ia' | 'sistema'`).
- `puedeTransitar(de, a, actor)` → booleano. Lo que la tabla no lista, no se puede. `actor: 'ia'` solo llega a `borrador`, y solo desde `tema_calendarizado` o desde nada.
- `coherente(capsula)` → la lista de faltas de **coherencia entre el estado y sus campos**, que es lo único que Fase A puede comprobar (no ve el estado anterior):
  - de `en_revision` en adelante: `generatedWithAi === true` exige `generatedAt`;
  - de `prevalidada` en adelante: `reviewedBy` en `EDITORAS`, `reviewedAt`, `prevalidatedAt`, todas las `SECCIONES_REVISABLES` marcadas, y si hubo IA, `reviewedAt` posterior a `generatedAt`;
  - de `aprobada` en adelante: `approvedBy` en `EDITORAS` y `approvedAt`;
  - `programada`: `weekStart` y `scheduledAt`;
  - `publicada` o `archivada` en un archivo de Fase A: falta (desvío 4).

### 4.4 Lo que toca mostrar — `src/unaPausa/modelo/vigente.js`

- `calendarioEfectivo(capsulas, ahora)` → para cada semana desde la primera cápsula programada que ya llegó hasta la semana de `ahora`, qué cápsula ocupa esa semana y por qué: `{ weekStart, id, origen: 'programada' | 'reserva' | 'repetida' }`.
  - **programada:** la cápsula `programada`, válida y no piloto con ese `weekStart`.
  - **reserva:** si no hay, la siguiente reserva aprobada y válida **que todavía no se haya usado**, en orden de `approvedAt`. Es determinista: el mismo conjunto de archivos da siempre el mismo calendario.
  - **repetida:** si no hay reserva libre, la de la semana anterior.
  - Nunca entra una cápsula en `tema_calendarizado`, `borrador`, `en_revision`, `prevalidada`, `rechazada`, ni una con `piloto: true`, ni una que no pase `validar`.
- `capsulaVigente(capsulas, ahora)` → la de la última semana del calendario efectivo, o `null`.
- `archivo(capsulas, ahora)` → las cápsulas publicadas antes de la vigente, **sin repetidas**, de la más reciente a la más antigua.

**REPORTA** cómo se comporta `calendarioEfectivo` si mañana aparece un archivo nuevo con un `weekStart` ya pasado: en Fase A eso reescribiría la historia del archivo. No lo resuelvas; descríbelo con una prueba que lo deje a la vista y se anota como límite de Fase A.

### 4.5 El léxico, en un solo sitio

`FORBIDDEN` y `CLINICO` viven hoy dentro de `scripts/lint-copy.js` y no se exportan. La regla es «un sitio y solo uno», así que **no se copian**.

**REPORTA antes de mover nada** tu propuesta para dónde viven las dos listas y cómo las importan los dos consumidores (`lint-copy.js` y el validador). Ten en cuenta:

- si se mudan a `src/`, el recorrido línea a línea de `lint-copy.js` se encontrará los propios patrones (por ejemplo, `¡Felicidades!` aparece literal) y hay que eximir ese archivo como ya se exime `frases-del-dia.js` con `POR_ENTRADA`;
- si se quedan en `scripts/`, el validador de `src/` importaría de `scripts/`, y Vite no debe empaquetar nada de ahí en la app (el validador no se usa en la app, pero confírmalo);
- `lint:copy` tiene que dar exactamente el mismo resultado antes y después del movimiento.

La exención de Una pausa (`EXENCION_UNA_PAUSA`, DP-28.13) vive **junto al validador**, no junto a las listas: es una decisión de esta sección, no del léxico.

### 4.6 El validador — `src/unaPausa/modelo/validar.js`

`validar(capsula)` → `{ faltas: Falta[], avisos: Falta[] }`, donde `Falta = { codigo, campo }`. **Códigos, no frases:** el texto para la editora lo pondrá el script de 28.2, y así este archivo no tiene una sola cadena visible (RN-TEC-02). Las reglas dependen del estado: un `borrador` puede estar incompleto; desde `en_revision` se exige todo.

| Regla | Desde | Código |
|---|---|---|
| `title`, `opening`, `evidenceSummary`, `theme` no vacíos | `en_revision` | `texto.falta` |
| `keyFindings` entre 1 y 3 | `en_revision` | `hallazgos.cantidad` |
| Una sola invitación: `practiceDestination` y `practiceLabel` van juntos o no van; `in_capsule` exige `practiceText` | `en_revision` | `practica.incompleta` |
| `journalPrompt`, si existe: una sola pregunta, termina en «?», ≤ 140 caracteres | `en_revision` | `pregunta.forma` |
| Al menos una fuente; cada una con `title`, `authorsOrInstitution`, `year` (número o `null`), `originalUrl` `https://`; `doi`, si existe, con forma `^10\.\d{4,9}/\S+$` | `en_revision` | `fuentes.falta`, `fuentes.incompleta`, `fuentes.doi` |
| Todas las fuentes con `reviewed: true` | `prevalidada` | `fuentes.sin-revisar` |
| `coverAsset` y `coverAltText` no vacíos | `prevalidada` | `portada.falta` |
| Texto visible ≤ 320 palabras (`title`, `opening`, `evidenceSummary`, `keyFindings`, `practiceLabel`, `practiceText`, `journalPrompt`; las fuentes no cuentan) | `en_revision` | `lectura.larga` |
| Léxico: `FORBIDDEN` y `CLINICO` menos `EXENCION_UNA_PAUSA` sobre el texto visible; **los títulos de fuente se excluyen**; sin «¡» ni «!»; sin «elle» | `borrador` | `lexico.<id de la regla>` |
| `prevalidatedAt` en o antes de `weekStart − 28 días` (calendario de Monterrey) | `prevalidada` con `weekStart` | `plazo.cuatro-semanas` |
| `approvedAt` en o antes de `limiteValidacionFinal(weekStart)` | `aprobada` con `weekStart` | `plazo.validacion-final` |
| Todo lo de `coherente()` (§4.3) | según estado | `estado.<...>` |

**Avisos (no bloquean, los decide la editora):** palabras que suenan a promesa de resultado —«garantiza», «elimina», «comprobado que», «te hará»— y `evidenceSummary` sin ninguna forma atenuada («sugiere», «se asocia», «puede»). **REPORTA** la lista final de avisos antes de fijarla.

### 4.7 La frontera — `eslint.config.js`

`src/unaPausa/**` no importa nada de `src/diario/` ni de `src/breathing/`, con el mismo mecanismo que ya protege a `breathing/`. Mensaje en la línea de los existentes. En esta entrega solo existe `modelo/`, pero la regla cubre la carpeta entera desde ya.

### 4.8 Documentación

- `docs/specs/SPEC_28_UNA_PAUSA.md` (v0.2) y esta instrucción: ya los dejó ahí la fundadora; se incluyen en el commit de documentación sin cambiarlos.
- `CLAUDE.md`: sección nueva al final de §13, **«Una pausa — rama `una-pausa` (SPEC_28, oct 2026)»**: qué es, que vive solo en esta rama, la frontera de §4.7, que `src/unaPausa/modelo/` es el único sitio de las reglas editoriales, la exención léxica y su caducidad, y **la prohibición expresa a Claude Code de cambiar `status`, `reviewedBy`, `reviewedSections`, `prevalidatedAt`, `approvedBy`, `approvedAt` o `scheduledAt` de cualquier cápsula**: esos campos los escribe la fundadora. En §11, la línea de `src/unaPausa/` en el árbol y en «Dónde vive cada regla».
- **No** se enmiendan todavía RN-NAV-01/02: eso va con la pestaña, en 28.3.

---

## 5. Criterios de aceptación

**Automáticos (suite)**

1. `lunesDe` del domingo 11 oct 2026 23:59:59 −06:00 da `2026-10-05`; del lunes 12 oct 00:00:00 −06:00 da `2026-10-12`. La misma prueba pasa con `process.env.TZ` en `UTC`, `Asia/Tokyo` y `Pacific/Kiritimati` (fija la variable antes de importar el módulo, en archivos de prueba separados si hace falta).
2. Una prueba de repo falla si algún archivo de `src/unaPausa/` (fuera de `__tests__`) usa `getDay(`, `getHours(`, `getDate(`, `getMonth(` o `getFullYear(`.
3. `puedeTransitar`: prueba por tabla con **todas** las parejas de estados × los tres actores; solo pasan las de la tabla §4.1. `ia` nunca llega a `en_revision`, `prevalidada`, `aprobada`, `programada` ni `publicada`.
4. `capsulaVigente` nunca devuelve una cápsula en `tema_calendarizado`, `borrador`, `en_revision`, `prevalidada` o `rechazada`, ni una `piloto`, ni una que no pase `validar`, con cualquier combinación de entrada (prueba generada sobre todas las combinaciones de estado para tres cápsulas).
5. Semana sin programada y con dos reservas: usa la de `approvedAt` más antiguo; la semana siguiente, sin programada, usa la otra; la tercera, sin reservas libres, `origen: 'repetida'`. El archivo no repite ninguna.
6. Sin ninguna cápsula publicable: `capsulaVigente` da `null` y `archivo` da `[]`.
7. Una cápsula en `en_revision` con cuatro hallazgos, sin fuentes, con «terapia» en `opening`, con «!» en `title` o con 321 palabras visibles da la falta correspondiente, una por caso.
8. «estrés» y «ansiedad» en `evidenceSummary` **no** dan falta; «ansioso» y «estresante» **sí** (DP-28.13 provisional); «Anxiety and stress…» en el título de una fuente **no** da falta.
9. Una cápsula `prevalidada` con `prevalidatedAt` 27 días antes de su `weekStart` da `plazo.cuatro-semanas`; con 28, no.
10. Una cápsula `aprobada` para el lunes 7 dic 2026 con `approvedAt` el miércoles 2 dic 23:59:59 −06:00 pasa; el jueves 3 dic 00:00:00 −06:00 da `plazo.validacion-final`.
11. `reviewedBy: 'team@hellostrivo.com'` da `estado.editora-desconocida`.
12. Ningún archivo de `src/unaPausa/modelo/` importa con alias `@` ni importa `react`; un `import()` del módulo desde un script de Node fuera de Vite funciona (prueba que lo carga con la ruta relativa).
13. `npm run lint` falla con un archivo de prueba temporal en `src/unaPausa/` que importe de `src/diario/` (compruébalo y retira el archivo).
14. `npm run lint:copy` da **el mismo resultado** que en `1aa5e87`.
15. Los seis comandos en verde. Número de casos antes y después en el reporte.

**Manuales:** ninguno en navegador; esta entrega no tiene pantalla. La fundadora revisa en la rama de revisión que la tabla de transiciones y las reglas del validador dicen lo que la SPEC dice.

---

## 6. Reglas de arquitectura que roza

| Regla | Cómo queda |
|---|---|
| Cero strings hardcodeados (RN-TEC-02) | El validador devuelve códigos; ninguna cadena visible en `src/unaPausa/`. |
| «Un sitio y solo uno» | El léxico no se copia (§4.5); las reglas editoriales viven solo en `modelo/`. |
| RN-TEC-04/05 | `unaPausa/` no importa `diario/` ni `breathing/` (§4.7). |
| Firestore de solo escritura | No se toca. Nada de esta entrega habla con Firebase. |
| Lenguaje clínico | Exención temporal y acotada a dos palabras, en una constante con fecha de caducidad (DP-28.13). |
| Sin estado «fallado» | Las faltas son para la editora, nunca para la persona usuaria; ningún código llega a la app. |

---

## 7. Fuera de alcance

El script del canal y `feed.json` (28.2), `netlify.toml`, GitHub Actions, la carpeta `contenido/`, cualquier pantalla, ruta o copy, la cabecera, Hoy, el Journal, la caché local, dependencias nuevas, y cualquier cosa de Fase B.

---

## 8. Al terminar

1. Seis comandos en verde, en el worktree.
2. Commits en `una-pausa` con el formato de siempre, por bloque (§4.1–4.4, §4.5, §4.6, §4.7, §4.8).
3. `git push origin una-pausa:revision-28-1` y reporte: archivos tocados, decisiones tomadas en cada **REPORTA**, casos de prueba antes y después, y cualquier cosa que la SPEC diga y el código no pueda cumplir.
4. **No** hagas push a `una-pausa` ni a `strivo`. Eso lo hace la fundadora tras la revisión.
