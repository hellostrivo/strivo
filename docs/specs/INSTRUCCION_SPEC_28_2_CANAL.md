# SPEC_28.2 — Instrucción de ejecución: el canal de publicación de «Una pausa»

**Para:** Claude Code
**Rama:** `una-pausa`, en el worktree `~/Desktop/STRIVO/strivo-una-pausa` · **Commit de referencia:** `1938c8f` (3 oct 2026, adenda de 28.1)
**Gobierna:** `docs/specs/SPEC_28_UNA_PAUSA.md` (v0.3, que esta entrega sube a v0.4) + `ADENDA_SPEC_28_1_VALIDACION_03-10-2026.md` + `SPEC_00B` + `CLAUDE.md`
**Alcance:** la entrega 28.2. El script que genera `feed.json`, la configuración de los dos sitios de Netlify y los dos workflows. Ni una pantalla, ni una ruta, ni copy de la app, ni una cápsula real.
**Versión:** 1.0 — 3 oct 2026.

---

## 0. Antes de escribir una sola línea

1. **Verifica dónde estás** y **REPORTA**:
   ```bash
   pwd
   git branch --show-current
   git log -2 --format="%h %ci %s"
   git status
   ```
   Tienes que estar en `strivo-una-pausa`, en la rama `una-pausa`, con `1938c8f` arriba y solo este documento sin seguimiento en `docs/specs/`. Si algo no coincide, **detente y avisa**.
2. **Ponte al día con el lanzamiento:**
   ```bash
   git fetch origin
   git log -1 --format="%h %s" origin/strivo
   ```
   Si `origin/strivo` es `94b6c27`, no hay nada que hacer. Si avanzó, `git rebase origin/strivo`, los seis comandos en verde, y **REPORTA** qué commits entraron y si alguno toca `netlify.toml`, `package.json`, `vite.config.js` o `.github/`. Con un conflicto, detente.
3. Lee la SPEC_28 v0.3 (§1 H7, H9, H10, H15; §3.1; §5; §7 de 28.2), la adenda de 28.1 entera (sobre todo §3 y §6), y en `CLAUDE.md` las secciones 11, 12 y la de Una pausa al final de §13.
4. Inspecciona: `src/unaPausa/modelo/` entero, `scripts/lint-copy.js` (cómo importa de `src/` con `import()`), `netlify.toml`, `package.json`, `vite.config.js` (qué precachea workbox), `vitest.config.js` (`include`), `.github/workflows/ci.yml`, `.gitignore`.
5. **Reporta cualquier desvío y espera aprobación antes de codificar.** Los puntos **REPORTA** se reportan aunque no haya desvío.
6. No implementes nada fuera de la §4.

---

## 1. Qué resuelve esta entrega

El modelo de 28.1 sabe qué cápsula toca cada semana. Falta lo que lo convierte en algo que un teléfono pueda leer:

- un script que lee las cápsulas del repo, las valida con el modelo, **falla si una publicable no pasa**, y escribe `feed.json` con la vigente y el archivo —y nada más—;
- un **segundo sitio de Netlify** que publica solo eso, en `https://contenido.hellostrivo.com/una-pausa/feed.json`, con caché corta y CORS abierto;
- una **vista previa** en los deploys de rama de la app, para que la fundadora vea la cápsula piloto en su teléfono antes del 7 de diciembre;
- los dos workflows del lunes y del miércoles, **escritos ahora e inertes hasta la fusión**.

**Lo que no hace:** no toca `src/` fuera de `src/unaPausa/modelo/`, ni `App.jsx`, ni el copy, ni la caché local de la app (28.3). No añade ninguna cápsula a `contenido/` (28.5). No cambia el build de producción de la app.

---

## 2. Decisiones cerradas, no se reabren

| DP | Decisión |
|---|---|
| DP-28.3 | El canal lo sirve un **segundo sitio de Netlify**, desde este mismo repo, que solo publica el canal. El sitio de la app no gana el dominio `contenido`. |
| DP-28.4 | Portadas WebP, 1600 px de ancho, proporción 4:3, ≤ 250 KB. El script lo comprueba sobre el archivo. |
| DP-28.12 | Recordatorio editorial: una Action los miércoles abre un issue si el lunes siguiente no tiene cápsula `programada` válida. |
| DP-28.15 | El repo es público. Nada del canal lleva un correo ni un nombre; tampoco los campos editoriales. |
| **DP-28.16** | **Vista previa solo en los deploys de rama de la app.** En ese contexto, el build de la app genera además su propio `feed.json`, servido en el mismo origen, con la piloto como vigente. La app leerá la URL del canal de una variable de build (`VITE_URL_CANAL`) cuyo valor por defecto es `URL_CANAL`; esa lectura es de 28.3. **El canal de producción nunca incluye la piloto.** |
| **DP-28.17** | **Hasta la fusión, sin cron.** GitHub solo ejecuta Actions programadas desde la rama por defecto, que hoy es `main`. Los dos workflows se escriben en esta entrega y quedan inertes; entran a `strivo` con la fusión y corren cuando `strivo` sea la rama por defecto. Hasta entonces, el sitio del canal publica desde `una-pausa` y se reconstruye a mano. |

**Decidido para esta entrega:**

- **CORS: `Access-Control-Allow-Origin: *`** en `feed.json` y en las portadas. El contenido es público, el mismo para todos y no lleva credenciales. Enumerar orígenes —el de la app, `capacitor://localhost`, los deploys de rama, `localhost:5173`— no protege nada y se rompe con cada origen nuevo.
- **250 KB son 250 000 bytes**, en decimal: es lo que muestra el Finder de macOS, que es donde la fundadora mira el peso de la foto.
- **En la vista previa, la piloto entra como vigente solo si está en `en_revision` o más adelante y pasa `validar`.** Desde `en_revision` el validador exige la cápsula entera, así que lo que se ve en el teléfono es una cápsula completa, no un borrador a medias.

---

## 3. Desvíos ya conocidos

Estos ya se saben; confirma cómo los resuelves.

1. **La SPEC §7 dice que `build` llama al script antes de `vite build`.** Eso era antes de DP-28.3 y DP-28.16. **El build de producción de la app no cambia** y no genera nada del canal. El canal lo construye el segundo sitio; la vista previa, un comando aparte que solo usa el contexto `branch-deploy`.
2. **El criterio 4 de 28.2 en la SPEC usa «ansiedad», que DP-28.13 exime.** Se prueba con «terapia».
3. **La SPEC §3.1 dibuja una Action los lunes que dispara el build hook.** Se escribe, pero no corre hasta la fusión (DP-28.17).
4. **«Marca la reserva como usada»** (criterio 3 de la SPEC). En Fase A no se marca nada: el uso de una reserva se deriva, determinista, en `calendarioEfectivo`. El criterio se comprueba sobre la salida.
5. **El límite de Fase A de la adenda de 28.1 queda cubierto así:** una cápsula ya publicada sigue siendo `programada` (o `aprobada`, si era reserva) en su archivo, así que si una regla cambia y deja de pasar, rompe el build. Lo que **no** cubría nada era programar una cápsula para una semana que ya empezó: eso es la regla nueva `plazo.programada-tarde` (§4.2).

---

## 4. El trabajo, por bloque

### 4.0 Los tres menores de 28.1 (adenda §3)

- `semana.js`: el comentario cita `__tests__/sinHoraLocal.test.js`; la prueba vive en `__tests__/fronteras.test.js`.
- `capsula.js`: el comentario cita `nivelDe` en `estados.js`; lo que existe es `ORDEN` y `desde`.
- `validar.js`: `journalPrompt` exige **exactamente un «¿»** además de un «?» final (`pregunta.forma`). Prueba con «Qué me ocupa hoy?».
- La regla `cura` se queda como está (aceptado en la adenda).

### 4.1 La forma del canal — `src/unaPausa/modelo/canal.js` (nuevo)

Lógica pura, como el resto del modelo. Es **el único sitio que sabe qué forma tiene `feed.json`**: lo leerán el script, la app en 28.3 y el servidor de Fase B, que escribirá el mismo formato.

- `FORMATO_CANAL = 1`.
- `CAMPOS_PUBLICOS`: **lista blanca**. Un campo que no esté aquí no sale, aunque mañana se añada al modelo. Contenido: `id`, `version`, `theme`, `title`, `opening`, `evidenceSummary`, `keyFindings`, `practiceDestination`, `practiceLabel`, `practiceText`, `journalPrompt`, `generatedWithAi`.
- `CAMPOS_PUBLICOS_DE_FUENTE`: `title`, `authorsOrInstitution`, `year`, `originalUrl`, `doi`. **No** `reviewed`.
- `generarCanal(capsulas, ahora, { vistaPrevia = false } = {})` → objeto:
  ```js
  {
    formato: 1,
    semana: '2026-12-07',
    vigente: Entrada | null,
    archivo: Entrada[],
  }
  ```
  - `semana` es `lunesDe(ahora)`.
  - `vigente` y `archivo` salen de `capsulaVigente` y `archivo` (28.1), sin reordenar nada.
  - `Entrada` = los campos de la lista blanca + `publicadaEl` (el primer `weekStart` del calendario efectivo en que apareció esa cápsula) + `fuentes` (con la lista blanca de fuente) + `portada: { src, alt }`, con `src` **relativo al canal**: `portadas/<coverAsset>`. Relativo para que la vista previa y producción se lean igual.
  - Un campo opcional vacío o ausente no se escribe.
  - Con `vistaPrevia: true`: si hay una cápsula `piloto: true` en `en_revision` o más adelante que pasa `validar`, va como `vigente` y la vigente calculada pasa a encabezar `archivo`. Con dos pilotos así, gana la de `id` menor. Sin `vistaPrevia`, la piloto no aparece jamás (ya lo garantiza 28.1; aquí se prueba sobre la salida).
- `portadasPublicadas(canal)` → la lista de `coverAsset` que el canal referencia. El script copia **esas y ninguna otra**.

### 4.2 Lo que el conjunto tiene que cumplir — `src/unaPausa/modelo/`

En `validar.js`, dos reglas por cápsula:

| Regla | Desde | Código |
|---|---|---|
| `id` con forma `^[a-z0-9]+(-[a-z0-9]+)*$` | siempre | `id.forma` |
| `scheduledAt` en o antes del lunes 00:00 de Monterrey de su `weekStart` | `programada` | `plazo.programada-tarde` |

Nuevo `validarConjunto(capsulas)` → `{ faltas }`, con `campo` = el `id` afectado:

| Regla | Código |
|---|---|
| Dos cápsulas con el mismo `id` | `conjunto.id-repetido` |
| Dos `programada` no piloto con el mismo `weekStart` | `conjunto.choque` |

**REPORTA** en qué archivo propones `validarConjunto` (`validar.js` o uno propio).

### 4.3 La portada — `src/unaPausa/modelo/portada.js` (nuevo)

`revisarPortada(bytes)` recibe un `Uint8Array` y devuelve faltas. Lógica pura, sin `fs` y sin dependencias: lee la cabecera RIFF/WebP (`VP8 `, `VP8L` y `VP8X`) a mano.

| Regla | Código |
|---|---|
| Es un WebP | `portada.formato` |
| 1600 px de ancho | `portada.ancho` |
| 4:3 (1600 × 1200) | `portada.proporcion` |
| ≤ 250 000 bytes | `portada.peso` |

Constantes en `PORTADA = { ancho: 1600, alto: 1200, maxBytes: 250_000 }`. Las pruebas construyen cabeceras mínimas en memoria; **no se commitea ninguna imagen**.

### 4.4 El script — `scripts/publicar-pausa.js` (nuevo)

Hace solo E/S: lee, llama al modelo, escribe. **Ninguna regla editorial vive aquí.**

```
node scripts/publicar-pausa.js --salida <carpeta> [--vista-previa] [--ahora <ISO 8601 con desfase>]
```

- Lee `contenido/una-pausa/capsulas/*.json`. Un archivo que no es JSON válido, o cuyo nombre no es `<id>.json`, es una falta (`archivo.json`, `archivo.nombre`).
- Valida cada cápsula (`validar`), el conjunto (`validarConjunto`) y la portada de toda cápsula desde `prevalidada` (`revisarPortada` sobre `contenido/una-pausa/portadas/<coverAsset>`; si no existe, `portada.archivo`).
- **Falla (código de salida ≠ 0) si** hay una falta en una cápsula `aprobada` o `programada`, cualquier falta de conjunto o de archivo, o una falta de portada en una cápsula `aprobada` o `programada`. Lo demás (borradores, `en_revision`, `prevalidada`) se imprime como aviso y no rompe nada: el trabajo editorial a medias no puede tumbar el canal.
- Escribe `<salida>/una-pausa/feed.json` con `generarCanal` (JSON con dos espacios y salto de línea final) y copia a `<salida>/una-pausa/portadas/` **solo** las de `portadasPublicadas`.
- `--ahora` existe para las pruebas y para simular un build a mano. Sin él, el instante es el del reloj. Ningún `netlify.toml` lo pasa.
- **Los mensajes para la editora viven aquí**, no en `src/copy` (la editora no es la persona usuaria). Cada línea nombra **el archivo, el campo y el código**, y una frase en español:
  ```
  contenido/una-pausa/capsulas/hacer-espacio.json · keyFindings[1] · lexico.terapia — «terapia» no se usa en una cápsula.
  ```
  Tono: el de siempre, aunque solo lo lea la fundadora. Sin exclamaciones.
- Exporta una función `publicar({ raiz, salida, ahora, vistaPrevia })` que devuelve `{ ok, faltas, avisos, canal }`, y solo ejecuta la línea de comandos si se invoca directamente. Así las pruebas no lanzan procesos.

**REPORTA** dónde propones las pruebas del script: `vitest.config.js` solo incluye `src/**/*.test.js`. Las dos opciones son ampliar `include` a `scripts/**/*.test.js` o probarlo desde `src/unaPausa/__tests__/`.

### 4.5 La carpeta de contenido

- `contenido/una-pausa/capsulas/` y `contenido/una-pausa/portadas/`, **vacías**, con un `.gitkeep` cada una. Con la carpeta vacía, el script da `{ formato: 1, semana, vigente: null, archivo: [] }` y sale con 0.
- **Ninguna cápsula de ejemplo en `contenido/`.** Las de las pruebas viven en las pruebas, con fuentes en `example.org`.

### 4.6 Los dos sitios de Netlify

**El sitio del canal — `canal/netlify.toml` (nuevo).** La fundadora crea el sitio con **Package directory = `canal`** y la base en la raíz del repo. Netlify busca la configuración primero en el *package directory*, así que este archivo manda sobre el `netlify.toml` de la raíz; el comando corre en la raíz.

```toml
[build]
  command = "node scripts/publicar-pausa.js --salida canal/dist"
  publish = "canal/dist"

[[headers]]
  for = "/una-pausa/*"
  [headers.values]
    Cache-Control                = "public, max-age=300"
    Access-Control-Allow-Origin  = "*"
    X-Content-Type-Options       = "nosniff"
```

- `canal/dist` va a `.gitignore`.
- **REPORTA** si ves alguna razón para que la ruta de `publish` se resuelva distinto con *package directory*. La primera publicación lo confirma (M1).

**El sitio de la app — `netlify.toml` de la raíz.** Lo de `[build]` de producción **no se toca**. Se añade:

```toml
[context.branch-deploy]
  command = "npm run build:vista-previa"

[context.branch-deploy.environment]
  VITE_URL_CANAL = "/una-pausa/feed.json"

[[headers]]
  for = "/una-pausa/*"
  [headers.values]
    Cache-Control = "public, max-age=300"
```

**El riesgo que hay que mirar:** el `[[headers]]` de `/*` ya pone `Cache-Control: public, max-age=31536000, immutable` y también encaja con `/una-pausa/feed.json`. La documentación de Netlify no dice qué pasa cuando dos reglas ponen la misma cabecera. **No toques la regla de `/*`**: es la caché de producción de la app y es del lanzamiento. Se comprueba en M3; si sale combinada, se reporta y se decide aparte.

`package.json`:

```json
"canal": "node scripts/publicar-pausa.js",
"build:vista-previa": "vite build && node scripts/publicar-pausa.js --vista-previa --salida dist"
```

El script va **después** de `vite build`, que vacía `dist/` al empezar.

### 4.7 Los workflows — inertes hasta la fusión (DP-28.17)

**`.github/workflows/publicar-pausa.yml`:**

- `on: schedule: cron '5 6 * * 1'` (lunes 06:05 UTC = 00:05 en Monterrey) y `workflow_dispatch`.
- Un paso: `POST` al build hook del sitio del canal, leído de `secrets.NETLIFY_BUILD_HOOK_CANAL`. Sin el secreto, el paso falla con un mensaje que lo dice.

**`.github/workflows/recordatorio-pausa.yml`:**

- `on: schedule: cron '0 15 * * 3'` (miércoles 15:00 UTC = 09:00 en Monterrey) y `workflow_dispatch`.
- `permissions: issues: write`, `contents: read`.
- Checkout, Node 20, `node scripts/recordatorio-pausa.js`, que imprime `{ hace_falta, titulo, cuerpo }`:
  - mira el lunes siguiente (`sumarDias(lunesDe(ahora), 7)`) y si tiene una `programada` válida;
  - si no la tiene, el cuerpo dice qué pasará ese lunes según `calendarioEfectivo` con ese instante: entra una reserva (cuál), se repite la anterior (cuál) o no habrá ninguna;
  - el título lleva la fecha del lunes, para que se pueda buscar.
- Si `hace_falta` y no hay ya un issue abierto con ese título, `gh issue create`. Ninguna dependencia nueva.

Ni `ci.yml` ni nada más de `.github/` se toca.

### 4.8 Documentación

- `docs/specs/SPEC_28_UNA_PAUSA.md` → **v0.4**:
  - §3.1: el diagrama con los dos sitios, sin cron hasta la fusión;
  - §5: DP-28.12, 28.16 y 28.17 cerradas, con la redacción de la adenda de 28.1 §6;
  - §7, 28.2: ubicación y criterios según esta instrucción (desvíos 1 a 4);
  - una línea en la cabecera que diga qué cambió.
- `CLAUDE.md`:
  - §11: `contenido/`, `canal/` y `scripts/publicar-pausa.js` en el árbol; `canal.js` y `portada.js` en «Dónde vive cada regla».
  - §12: `npm run canal` y `npm run build:vista-previa`, fuera de los seis.
  - En la sección de Una pausa de §13: los dos sitios, la vista previa y por qué la piloto nunca sale del contexto `branch-deploy`, la lista blanca, que los workflows son inertes hasta que `strivo` sea la rama por defecto, y que con el contenido inválido el sitio del canal conserva el deploy anterior.
- Esta instrucción, sin cambios, en el commit de documentación.

---

## 5. Criterios de aceptación

**Automáticos (suite)**

1. Con una cápsula `programada` para el 12 oct 2026, `publicar` con `ahora` el domingo 11 oct 23:59:59 −06:00 no la incluye; con el lunes 12 oct 00:00:00 −06:00, sí.
2. **Lista blanca, probada sobre la salida:** cada cápsula de prueba lleva un texto centinela único en cada campo. En el `feed.json` escrito no aparece el centinela de ninguna cápsula no publicada, ni ningún campo fuera de `CAMPOS_PUBLICOS`, ni `reviewed`. En `portadas/` no hay archivo de ninguna cápsula no publicada.
3. Semana sin programada → la reserva; la siguiente, sin reserva libre → la anterior. Comprobado sobre `feed.json`.
4. Una cápsula `aprobada` con «terapia» en `keyFindings[1]` → `ok: false`, salida ≠ 0, y el mensaje contiene la ruta del archivo, `keyFindings[1]` y `lexico.terapia`. La misma cápsula en `borrador` → `ok: true`, con el aviso impreso.
5. Dos `programada` con el mismo `weekStart` → `conjunto.choque`, nombrando las dos. Dos con el mismo `id` → `conjunto.id-repetido`. Un archivo `x.json` con `id: 'y'` → `archivo.nombre`. Un archivo que no es JSON → `archivo.json`.
6. Portada: un no-WebP, uno de 1599 px, uno de 1600 × 1000 y uno de 250 001 bytes dan, cada uno, su código. En una `aprobada` rompen; en una `prevalidada`, solo avisan. Un `coverAsset` sin archivo → `portada.archivo`.
7. `plazo.programada-tarde`: `scheduledAt` el lunes 12 oct 00:00:01 −06:00 para ese `weekStart` da la falta; 00:00:00, no.
8. Vista previa: una piloto `aprobada` válida es `vigente`; una piloto en `borrador`, no. Sin `vistaPrevia`, el centinela de la piloto no aparece en la salida.
9. Con `contenido/` vacío: `{ formato: 1, semana, vigente: null, archivo: [] }` y `ok: true`.
10. Mismo contenido y mismo `ahora`, dos veces → `feed.json` idéntico byte a byte.
11. Hay mensaje para **todo** código que el modelo puede emitir. Los `lexico.<id>` se cubren por prefijo; la prueba recorre los `id` de `lexico.js`.
12. `recordatorio-pausa.js`: con programada para el lunes siguiente → `hace_falta: false`; sin ella, con reserva libre → nombra la reserva; sin reserva → nombra la que se repetirá; sin nada → lo dice.
13. `npm run build` no deja nada en `dist/una-pausa/`; `npm run build:vista-previa` deja `dist/una-pausa/feed.json`. Ningún archivo de `scripts/` ni de `contenido/` aparece en `dist/` del build de producción.
14. Las pruebas de zona de 28.1 siguen pasando con el modelo ampliado; `fronteras.test.js` lista los archivos nuevos del modelo.
15. Los seis comandos en verde; `lint:copy` con la misma salida que en `1938c8f`. Número de casos antes y después en el reporte.

**Manuales** (la fundadora, tras crear el sitio del canal; pasos en §9):

- **M1.** `curl -sI https://<sitio-del-canal>.netlify.app/una-pausa/feed.json` → `200`, `cache-control: public, max-age=300`, `access-control-allow-origin: *`.
- **M2.** `curl -s` sobre la misma URL → `{"formato":1,"semana":"…","vigente":null,"archivo":[]}`.
- **M3.** Deploy de rama de la app: `curl -sI https://una-pausa--<sitio-de-la-app>.netlify.app/una-pausa/feed.json` → **exactamente** `public, max-age=300`, sin `immutable`. Si sale combinado, se anota y no se toca la regla de `/*` (se decide aparte).
- **M4.** Con el CNAME activo: M1 sobre `https://contenido.hellostrivo.com/una-pausa/feed.json`, con certificado válido.
- **M5.** La app de producción no cambió: ningún deploy nuevo del sitio de la app en producción.

**Diferido a la fusión:** los dos workflows. GitHub no los ejecuta fuera de la rama por defecto, ni siquiera a mano.

---

## 6. Reglas de arquitectura que roza

| Regla | Cómo queda |
|---|---|
| Nada se bloquea | Si el script falla, falla el build del sitio del canal y Netlify conserva el deploy anterior: la app sigue con el canal de la semana pasada. El trabajo editorial a medias solo avisa. |
| Nada de Firebase | No se toca. El canal es un archivo estático. |
| «Un sitio y solo uno» | Las reglas, en `modelo/`; la forma del canal, en `canal.js`; el script solo hace E/S. |
| Cero strings hardcodeados | Los mensajes son para la editora y viven en el script, fuera de `src/`. **REPORTA** si `lint:copy` marca algo. |
| El contenido nunca usa datos de la persona usuaria | El canal es el mismo para todos y no recibe nada de nadie. |
| La IA no publica | El script no cambia `status` ni ningún campo editorial: solo lee. CLAUDE.md sigue prohibiendo a Claude Code tocarlos. |
| La rama `strivo` no se toca | Nada de esta entrega llega a `strivo` hasta la fusión. El sitio de la app en producción no se redespliega. |

---

## 7. Fuera de alcance

Leer el canal desde la app, la caché `strivo-contenido`, `VITE_URL_CANAL` en el código, cualquier pantalla (28.3). Cualquier cápsula real (28.5). Cambiar la regla de caché de `/*`. Ejecutar los workflows. Hacer de `strivo` la rama por defecto. Dependencias nuevas. Fase B.

---

## 8. Al terminar

1. Seis comandos en verde, en el worktree.
2. Commits en `una-pausa` por bloque (§4.0; §4.1–4.3; §4.4–4.5; §4.6; §4.7; §4.8), cada uno en verde por sí solo.
3. `git push origin una-pausa:revision-28-2` y reporte: archivos tocados, cada **REPORTA**, decisiones tomadas sin preguntar, casos antes y después, y lo que la SPEC pide y el código no puede cumplir.
4. **No** hagas push a `una-pausa` ni a `strivo`.

---

## 9. Pasos de la fundadora (no son de Claude Code)

Después de la revisión del código, antes de M1:

1. **Netlify → Add new project → Import an existing project → GitHub → `hellostrivo/strivo`.**
   - Branch to deploy: `una-pausa`.
   - Base directory: vacío (la raíz).
   - Package directory: `canal`.
   - Nombre del sitio: el que quieras (por ejemplo `strivo-contenido`).
2. En ese sitio nuevo: **desactiva los deploys de rama y los deploy previews**. Solo publica `una-pausa`; cada build de más gasta créditos.
3. Tras el primer deploy: M1 y M2 sobre `<sitio>.netlify.app`.
4. **Domain management → Add a domain → `contenido.hellostrivo.com`.** Netlify te dirá el destino del CNAME.
5. **Squarespace → Domains → hellostrivo.com → DNS → Add record:** tipo `CNAME`, host `contenido`, valor `<sitio>.netlify.app`.
6. Cuando Netlify marque el dominio como verificado y emita el certificado: M4.
7. **No crees todavía el build hook ni el secreto de GitHub.** Eso va con la fusión (DP-28.17).
