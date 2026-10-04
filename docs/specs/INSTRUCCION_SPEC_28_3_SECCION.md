# SPEC_28.3 — Instrucción de ejecución: la sección «Una pausa»

**Para:** Claude Code
**Rama:** `una-pausa`, en el worktree `~/Desktop/STRIVO/strivo-una-pausa` · **Commit de referencia:** `a55b927` (4 oct 2026, adenda de 28.2)
**Gobierna:** `docs/specs/SPEC_28_UNA_PAUSA.md` (v0.4, que esta entrega sube a v0.5) + `ADENDA_SPEC_28_2_VALIDACION_04-10-2026.md` + `SPEC_00B` + `CLAUDE.md`
**Alcance:** la entrega 28.3. La cuarta píldora de la cabecera, la sección con la cápsula vigente, el archivo y el detalle, la lectura del canal y su caché local. Ni los accesos desde Hoy, ni el paso al Journal, ni ninguna cápsula real.
**Versión:** 1.0 — 4 oct 2026.

---

## 0. Antes de escribir una sola línea

1. **Verifica dónde estás** y **REPORTA**:
   ```bash
   pwd
   git branch --show-current
   git log -2 --format="%h %ci %s"
   git status
   ```
   Tienes que estar en `strivo-una-pausa`, en la rama `una-pausa`, con `a55b927` arriba y solo este documento sin seguimiento en `docs/specs/`. Si algo no coincide, **detente y avisa**.
2. **Ponte al día con el lanzamiento:**
   ```bash
   git fetch origin
   git log -1 --format="%h %s" origin/strivo
   ```
   Si `origin/strivo` es `94b6c27`, no hay nada que hacer. Si avanzó, `git rebase origin/strivo`, los seis comandos en verde, y **REPORTA** qué commits entraron y si alguno toca `App.jsx`, `NavStrivo.jsx`, `BarraInferior.jsx`, `src/copy/index.js`, `globals.css`, `tailwind.config.js`, `eslint.config.js`, `lint-contraste.js` o `lint-copy.js`. Con un conflicto, detente. **No hagas push de `una-pausa` reescrita**: eso lo decide la fundadora (DP-28.18).
3. Lee: la SPEC_28 v0.4 (§1 H1–H3, H8, H10, H12, H13; §3.1; §5; §7 de 28.3 y 28.4), la adenda de 28.2 entera (sobre todo §7, «Para 28.3») y el brief de Una pausa (§«Experiencia de usuario» y §«Archivo»). En `CLAUDE.md`: §2, §3, §4, §9, §10, §11, §14 y la sección de Una pausa de §13.
4. Inspecciona: `src/unaPausa/` entero (sobre todo `modelo/canal.js` y `modelo/__tests__/fronteras.test.js`), `NavStrivo.jsx`, `BarraInferior.jsx`, `App.jsx` (`Secciones` y cómo recibe `Respiracion` su `base` y su `salida`), `src/breathing/Respiracion.jsx` (cómo enfoca su encabezado al entrar, RN-RE-NAV-41), `src/copy/index.js` (`shared.navegacion` y el final del objeto), `globals.css` (`.cromo-espacio`), `tailwind.config.js`, `eslint.config.js` (la frontera de `unaPausa`), `scripts/lint-copy.js`, `scripts/lint-contraste.js`, `src/components/shared/__tests__/navegacion.test.js`, cómo usa `idb` `src/lib/db/local.js`, y cómo pintan componentes a HTML las pruebas que ya lo hacen.
5. **Reporta cualquier desvío y espera aprobación antes de codificar.** Los puntos **REPORTA** se reportan aunque no haya desvío.
6. No implementes nada fuera de la §4.

---

## 1. Qué resuelve esta entrega

Desde 28.2 existe un canal: `feed.json` con la cápsula vigente y el archivo. Falta quien lo lea y lo enseñe:

- una **cuarta píldora**, «Una pausa», tras Respiración, en una cabecera que deja de partirse en dos filas;
- la **sección**: la cápsula vigente en el orden del brief, con su portada, sus fuentes desplegables y su línea de transparencia;
- el **archivo** de pausas anteriores y el **detalle** de cada una;
- la **lectura del canal**, que nunca bloquea nada, y una **caché propia** (`strivo-contenido`) para leer sin conexión;
- en la vista previa, **la piloto también en el archivo** (DP-28.19), para que la fundadora recorra en su teléfono el camino entero antes del 9 de noviembre.

**Lo que no hace:** los accesos «Respira un momento» / «Date una pausa» en Hoy, volver al mismo punto del ritual y el paso de la pregunta al Journal (28.4). La quinta tarjeta de la presentación (DP-28.11, con la piloto). Ninguna cápsula en `contenido/` (28.5).

---

## 2. Decisiones cerradas, no se reabren

| DP | Decisión |
|---|---|
| DP-28.1 | Arriba, **Hoy · Journal · Respiración · Una pausa**. Abajo sin cambios: Historial · Tu perfil. RN-NAV-01/02 se enmiendan a «seis destinos: cuatro arriba, dos abajo». |
| DP-28.2 | Cuatro píldoras con **desplazamiento horizontal**. La activa siempre a la vista; un fundido en el borde dice que hay más; sin animación con movimiento reducido. |
| DP-28.4 | Portadas: fotografía WebP 1600 × 1200, nunca texto encima, sin animación ni paralaje. |
| DP-28.8 | Una pausa se lee también en modo lectura (prueba vencida sin pago). Esta entrega no escribe nada del usuario, así que no hay nada que condicionar. |
| DP-28.16 | La app lee el canal de `import.meta.env.VITE_URL_CANAL`, con `URL_CANAL` como valor por defecto. En los deploys de rama vale `/una-pausa/feed.json`. |
| **DP-28.19** | **En la vista previa, la piloto también entra en el archivo.** La misma cápsula, sin inventar nada, con `publicadaEl` = la semana del canal menos 7 días, en el orden del archivo (de la más reciente a la más antigua). **El canal de producción no cambia: la piloto nunca aparece en él.** |
| DP-28.21 | La vista previa nunca rompe el build. |

**Decidido para esta entrega (la fundadora puede cambiarlo al aprobar la §0):**

| DP | Decisión |
|---|---|
| **DP-28.24** | **Qué se pinta de `theme`.** La etiqueta editorial es la frase fija «Tema de la semana» (copy); el encabezado es `title`. **`theme` no se pinta**: es el nombre del calendario editorial y repetirlo bajo el título diría dos veces lo mismo. |
| **DP-28.25** | **El archivo es una lista de texto**: título y fecha de cada pausa, sin portada. La portada se ve en el detalle. Una lista de fotos se lee como un catálogo, y sin conexión serían huecos. |

---

## 3. Desvíos ya conocidos

Confirma cómo los resuelves.

1. **`navegacion.test.js` dice «ningún rótulo de la cabecera se trunca: son de una palabra».** «Una pausa» son dos. La garantía que protegía la prueba —que ningún rótulo se corte— pasa a ser `whitespace-nowrap` en las píldoras y una prueba que lo compruebe. Las pruebas de «cinco destinos» pasan a seis.
2. **RN-10 de §5 de `CLAUDE.md` dice «cinco destinos máximo».** Se enmienda junto con RN-NAV-01/02. **El blueprint §4 sigue pendiente de revisión** y no se toca aquí: se anota.
3. **El criterio 4 de la SPEC pide «una prueba que monta `App` con el `fetch` fallando».** Las pruebas corren en `node` y pintan con `renderToString`, que no ejecuta efectos ni límites de error. **REPORTA** cómo lo cubres. Lo que tiene que quedar garantizado: un error en Una pausa (de red, de JSON o de render) no saca a nadie de Hoy, Journal, Respiración, Historial ni Tu perfil, y la cabecera y la barra siguen ahí.
4. **El brief pide abrir el Journal desde «Una pregunta para ti» y desde la práctica `journal`.** Eso es 28.4 (DP-28.7). En esta entrega la pregunta y la práctica `journal` **se leen y no llevan control**: no se pinta ningún botón que no haga nada.
5. **La adenda de 28.2 §7:** una piloto en `en_revision` puede traer portada sin `alt`; si el build del lunes falla, el canal sigue sirviendo el `feed.json` anterior; en el sitio de la app, una ruta inexistente bajo `/una-pausa/` devuelve `index.html` con 200.

---

## 4. El trabajo, por bloque

### 4.1 La piloto en el archivo de la vista previa — `src/unaPausa/modelo/canal.js`

- Con `vistaPrevia: true` y una piloto válida, `generarCanal` la pone como `vigente` (como hoy) **y además** como entrada del archivo, con `publicadaEl` = `semana` − 7 días, ordenada con el resto de más reciente a más antigua.
- Sin `vistaPrevia`, nada cambia: la piloto no aparece ni como vigente ni en el archivo.
- `portadasPublicadas` no cambia: la portada de la piloto ya se copia por la vigente.

### 4.2 La lectura del canal — `src/unaPausa/canal/` (nuevo)

Fuera de `modelo/`, porque usa red y navegador. **Un solo sitio sabe leer el canal.**

- `urlDelCanal()` → `import.meta.env.VITE_URL_CANAL || URL_CANAL`. Una URL relativa se resuelve contra el origen de la página.
- `leerCanal({ fetch, url, espera })` → `{ ok: true, canal }` o `{ ok: false, motivo }`. Es **válido** solo si: la respuesta es 2xx, `content-type` empieza por `application/json`, el cuerpo se parsea, `formato === FORMATO_CANAL`, y `vigente` es objeto o `null` y `archivo` es lista. **Cualquier otra cosa es un fallo**, también un 200 con HTML (la regla de la SPA). Con un tope de espera (**REPORTA** el valor que propones; por defecto, 10 s): pasado, es un fallo.
- `src` de la portada se resuelve **contra la URL del canal**, no contra la página: `new URL(portada.src, urlDelCanal)`.
- Los motivos son códigos (`red`, `estado`, `tipo`, `json`, `formato`, `espera`), nunca frases.

### 4.3 La caché — `src/unaPausa/canal/cache.js` (nuevo)

- Base IndexedDB **`strivo-contenido`**, con `idb` (ya es dependencia). Dos almacenes: el **último canal válido** y la **portada de la vigente**, como blob, con la clave de su `src`.
- Se escribe **solo** tras una lectura válida. Un canal inválido nunca pisa uno bueno.
- **Fuera del árbol del usuario**: no entra en la cola de sincronización, no se exporta, no se restaura, no se borra al salir de la cuenta (es contenido público, el mismo para todos). Ningún archivo de `src/unaPausa/` importa `lib/db`, `firebase` ni `firestore`: lo comprueba una prueba de repo.
- Si IndexedDB no está o falla, la sección funciona igual, solo sin caché.

### 4.4 Qué ve la persona — `src/unaPausa/useUnaPausa.js` (nuevo)

Un hook que decide el estado de la sección, y una función pura `estadoDeLaSeccion({ cache, lectura, enLinea })` que es la regla, probada por tabla:

| Caché | Lectura | Resultado |
|---|---|---|
| — | en curso | `cargando` (la forma final, vacía; sin rueda, RN-EST-02) |
| cualquiera | válida | `listo` con el canal leído (y se guarda) |
| hay | falla | `listo` con la caché, **sin aviso de error** (RN-EST-05) |
| no hay | falla, sin red | `vacio` |
| no hay | falla, con red | `error`, con reintento |
| — | válida con `vigente: null` | `vacio` |

Al montar, enseña la caché enseguida si la hay y lee el canal detrás. Reintentar vuelve a leer. **Nada de esto se ve fuera de Una pausa.**

### 4.5 Las pantallas — `src/unaPausa/` (nuevos: `UnaPausa.jsx`, `Capsula.jsx`, `Fuentes.jsx`, `Archivo.jsx`, `LimiteDeErrores.jsx`)

**Rutas**, resueltas por el propio contenedor como hace Respiración (`base` por props):

- `/una-pausa` → la vigente.
- `/una-pausa/archivo` → el archivo.
- `/una-pausa/:id` → el detalle de una entrada del canal (vigente o archivo). Un `id` que no está → `/una-pausa`, sin mensaje (como RN-NAV-06).

**La cápsula** (`Capsula.jsx`, la misma para la vigente y el detalle), en este orden:

1. Etiqueta «Tema de la semana» (solo en la vigente; en el detalle, la fecha de `publicadaEl`).
2. `title`, como `h1`.
3. `opening`.
4. La portada: `<img>` con `width="1600" height="1200"` (para que no salte el texto al cargar), ancho completo de la columna, sin recorte, sin texto encima. `alt` = `portada.alt`, o `alt=""` si no lo trae. Si no carga, no se pinta nada: ni icono roto ni hueco.
5. «Lo que sabemos» (`h2`): `evidenceSummary` y `keyFindings` como lista.
6. «Llévalo a tu día» (`h2`), solo si hay práctica:
   - `breathing` → un enlace con `practiceLabel` a la ruta de Respiración, que llega **por props desde `App.jsx`** (`unaPausa/` no nombra `breathing/`);
   - `in_capsule` → `practiceLabel` como subtítulo y `practiceText` debajo;
   - `journal` → `practiceLabel` como texto, sin control (desvío 4).
7. «Una pregunta para ti» (`h2`), solo si hay `journalPrompt`: la pregunta, sin control (desvío 4).
8. «Fuentes»: un `<button aria-expanded aria-controls>` que abre la lista. Cada fuente: título, autoría o institución, año (si no es `null`), enlace al original y, si hay `doi`, enlace a `https://doi.org/<doi>`. Los enlaces van con `target="_blank"`, `rel="noopener noreferrer"` y un texto oculto que dice que se abren fuera de Strivo. Dentro, el aviso de que es información educativa y no sustituye atención profesional, y, **solo si `generatedWithAi` es `true`**, «Contenido elaborado con apoyo de IA y revisado por Strivo.». Con movimiento reducido no anima.
9. En la vigente: «Explorar pausas anteriores», enlace a `/una-pausa/archivo`. **Solo si el archivo tiene alguna entrada.**

**El archivo** (`Archivo.jsx`): lista de enlaces al detalle, con `title` y la fecha de `publicadaEl`, en el orden del canal (DP-28.25). Sin portada, sin contador («12 pausas»), sin «me gusta», sin «leída», sin orden alternativo.

**Fechas:** «7 de diciembre de 2026», con `Intl.DateTimeFormat('es-MX', { …, timeZone: 'UTC' })` sobre `Date.UTC` de la clave. **Ningún método local de `Date`**: la prueba de repo de 28.1 cubre todo `src/unaPausa/`.

**Foco:** al entrar a la sección o cambiar de vista dentro de ella, el foco va al encabezado de la vista, sin dibujar anillo, como Respiración (RN-RE-NAV-41).

**Estados:** `cargando` pinta la forma final vacía; `vacio` y `error` son texto sereno, centrado en la columna; `error` lleva «Reintentar». Ninguno muestra un código ni vibra (RN-EST-04).

**Límite de errores** (`LimiteDeErrores.jsx`): envuelve la ruta de Una pausa en `App.jsx`. Un error de render dentro pinta el estado `error` de la sección; la cabecera, la barra y las demás secciones no se enteran.

**Superficies:** las de las otras secciones fuera de Hoy (`bg-espacio`, `text-on-surface`, `text-on-surface-soft`, `border-on-surface`…). Ni un color literal, ni un token nuevo salvo que haga falta; si hace falta, **REPORTA** antes.

### 4.6 La cabecera — `NavStrivo.jsx`, `globals.css`

- Cuarta entrada `{ id: 'unaPausa', ruta: '/una-pausa' }` tras Respiración. Activa también en `/una-pausa/archivo` y `/una-pausa/:id`.
- La lista **no se parte**: una fila con desplazamiento horizontal, píldoras con `whitespace-nowrap` y su objetivo táctil de siempre (`min-h-touch-sm`).
- **La activa siempre a la vista:** al montar y al cambiar de ruta, la lista se desplaza lo justo para enseñarla entera, **solo en horizontal** (sin mover la página). Con movimiento reducido, sin animación.
- **Un fundido en el borde** que tiene más contenido, y solo mientras lo tenga. Sobre el tono del cromo en los dos momentos y en el contratono de la mañana; no puede tapar el anillo de foco de una píldora.
- La barra de desplazamiento no se pinta; el desplazamiento sigue funcionando con el dedo, la rueda y el teclado (el foco que entra en una píldora la trae a la vista).
- **REPORTA** cómo mides «la activa a la vista» de forma que se pueda probar sin navegador (una función pura sobre anchos y posiciones es lo esperado).

### 4.7 La ruta y el copy — `App.jsx`, `src/copy/index.js`

- `App.jsx` gana una ruta, `/una-pausa/*`, dentro del límite de errores, con `base="/una-pausa"` y `rutaRespiracion={RUTA_RESPIRACION}`. Nada más cambia en `App.jsx`.
- Copy en un bloque propio **al final del objeto**, `copy.unaPausa`, para chocar lo menos posible con SPEC_21 en adelante. Más `shared.navegacion.diario.secciones.unaPausa: 'Una pausa'`.
- Textos exactos del brief: «Una pausa», «Tema de la semana», «Lo que sabemos», «Llévalo a tu día», «Una pregunta para ti», «Fuentes», «Explorar pausas anteriores», «Contenido elaborado con apoyo de IA y revisado por Strivo.».
- Los demás (vacío, error, reintentar, aviso educativo, «se abre fuera de Strivo», etiqueta de la lista de fuentes, nombre accesible del archivo) los redactas tú, con la voz de §3 de `CLAUDE.md`. **REPORTA la lista completa, clave y texto**: la fundadora los revisa uno por uno antes de validar.

### 4.8 Accesibilidad y contraste

- Encabezados en orden (`h1` → `h2`), sin saltos.
- Todo alcanzable con teclado y con foco visible; el desplegable de fuentes se abre con Intro y con Espacio.
- `lint:contraste` cubre cada par nuevo de texto y fondo en los dos momentos; si todo usa pares ya medidos, **REPORTA** cuáles.
- Escalado al 200 %: nada se corta ni se solapa; las píldoras siguen en una fila desplazable.

### 4.9 Documentación

- `docs/specs/SPEC_28_UNA_PAUSA.md` → **v0.5**: §5 con DP-28.19, 28.24 y 28.25 cerradas y DP-28.11 marcada «con la piloto, fuera de 28.3»; §7, 28.3 según esta instrucción (ubicación real, desvíos 1 a 4); una línea en la cabecera que diga qué cambió.
- `CLAUDE.md`:
  - §2: el árbol con la cuarta sección arriba; **RN-NAV-01** («Seis destinos: cuatro arriba, dos abajo») y **RN-NAV-02** (orden), con la fecha y la razón (DP-28.1); que el blueprint §4 sigue pendiente.
  - §5: RN-10 a seis destinos.
  - §11: `src/unaPausa/` con sus carpetas; en «Dónde vive cada regla», la lectura del canal y `estadoDeLaSeccion`.
  - §13, sección de Una pausa: qué hizo 28.3 y qué no, la caché `strivo-contenido` y por qué vive fuera del árbol del usuario, DP-28.19, 28.24 y 28.25.
- Esta instrucción, sin cambios, en el commit de documentación.

---

## 5. Criterios de aceptación

**Automáticos (suite)**

1. `generarCanal` con `vistaPrevia` y una piloto válida: la piloto es `vigente` y está en `archivo` con `publicadaEl` = `semana` − 7 días. Sin `vistaPrevia`, su centinela no aparece en la salida.
2. `leerCanal`: un 200 con `text/html` → fallo `tipo`; un 500 → `estado`; un JSON con `formato: 2` → `formato`; un cuerpo roto → `json`; un `fetch` que no vuelve → `espera`; un canal bueno → `ok`. La URL de una portada relativa se resuelve contra la URL del canal.
3. `estadoDeLaSeccion`: las seis filas de la tabla de §4.4.
4. Caché, con `fake-indexeddb`: un canal válido se guarda y se relee; uno inválido no pisa al bueno; la base se llama `strivo-contenido` y no es la del usuario.
5. Prueba de repo: ningún archivo de `src/unaPausa/` importa `lib/db`, `firebase`, `firestore`, `diario/` ni `breathing/`.
6. `Capsula` pintada a HTML: las secciones salen en el orden de §4.5; sin `journalPrompt` no hay «Una pregunta para ti»; sin práctica no hay «Llévalo a tu día»; la práctica `journal` y la pregunta no llevan botón ni enlace; `alt=""` cuando la portada no trae `alt`; la línea de transparencia solo con `generatedWithAi: true`; el botón de fuentes lleva `aria-expanded` y `aria-controls`; cada enlace de fuente lleva `rel="noopener noreferrer"` y el texto de «se abre fuera».
7. `Archivo` pintado a HTML: sin `img`, sin cifras que cuenten entradas, en el orden del canal. Sin entradas en el archivo, la vigente no ofrece «Explorar pausas anteriores».
8. Un `id` desconocido redirige a `/una-pausa`.
9. Navegación: seis destinos, cuatro arriba en el orden de DP-28.1, dos abajo; ninguna píldora puede partirse (`whitespace-nowrap`); la lista no hace `flex-wrap`; la función de «activa a la vista» da el desplazamiento correcto para la primera, la última y una del medio.
10. Lo que cubra el desvío 3, según lo aprobado en la §0.
11. Las fechas de 28.1: ningún método local de `Date` en `src/unaPausa/`.
12. Los seis comandos en verde; `lint:copy` sin marcas nuevas. Número de casos antes y después en el reporte.

**Manuales** (la fundadora, en el deploy de rama de `revision-28-3`, en su teléfono y en un navegador de escritorio)

*Sin piloto en `contenido/` (se pueden hacer en cuanto esté el deploy):*

- **M1.** A 320, 375 y 390 px (en el navegador, con las herramientas de desarrollo) y en el teléfono: la cabecera es una fila, ninguna píldora se corta, el fundido dice que hay más. Entrando por enlace directo a `#/una-pausa`, la píldora activa se ve entera.
- **M2.** La sección dice el estado vacío, sereno, sin error. «Explorar pausas anteriores» no aparece.
- **M3.** Con la sección abierta, Hoy, Journal, Respiración, Historial y Tu perfil funcionan igual que en producción.
- **M4.** Con teclado en el escritorio: se llega a las cuatro píldoras y se ven al enfocarlas.

*Con la piloto en `en_revision` y válida (cuando exista, 28.5):*

- **M5.** La cápsula se lee entera en el orden del brief, con su portada, sin saltos al cargar. Las fuentes se abren y se cierran; sus enlaces abren fuera.
- **M6.** «Explorar pausas anteriores» → el archivo con la piloto → su detalle. Atrás vuelve donde estabas.
- **M7.** Modo avión con la sección ya vista: se ve entera, con portada. Al volver la red, nada parpadea ni avisa.
- **M8.** La revisión emocional de §10 de `CLAUDE.md`, sobre la sección entera. **Un «sí» en cualquiera es un defecto.**
- **M9.** Todos los textos nuevos que reporte Claude Code, revisados uno por uno.

---

## 6. Reglas de arquitectura que roza

| Regla | Cómo queda |
|---|---|
| Nada se pierde, nada se bloquea | Una pausa no escribe nada del usuario. Si falla —red, JSON o render—, se queda dentro de su límite y el resto de la app no se entera. |
| Firestore de solo escritura | No se toca: el canal es `fetch`. La caché es una base aparte, fuera del árbol del usuario, que no se sincroniza. |
| Frontera de `unaPausa/` | No importa `diario/` ni `breathing/`; Respiración le llega por props desde `App.jsx`. ESLint y una prueba de repo. |
| Cero strings hardcodeados | Todo texto en `copy.unaPausa`; `lint:copy` limpio. |
| AAA y movimiento reducido | `lint:contraste` cubre lo nuevo; ni el desplegable ni la cabecera animan con movimiento reducido. |
| RN-NAV-01/02, RN-10 | Se enmiendan en el commit de documentación, a la vista. |
| Sin contadores, sin progreso | Ni en la cápsula ni en el archivo: ni tiempo de lectura, ni número de pausas, ni «leída». |
| El contenido no usa datos del usuario | El canal es el mismo para todos; la app no envía nada al leerlo. |
| `strivo` no se toca | Nada llega a `strivo` hasta la fusión. |

---

## 7. Fuera de alcance

Los accesos desde Hoy, volver al mismo punto del ritual, abrir el Journal con la pregunta (28.4). La quinta tarjeta de la presentación (DP-28.11). Cualquier cápsula en `contenido/` (28.5). Cambiar el canal de producción o el script. Notificaciones de cápsula nueva, analítica, compartir. Dependencias nuevas. Fase B.

---

## 8. Al terminar

1. Seis comandos en verde, en el worktree.
2. Commits en `una-pausa` por bloque (§4.1; §4.2–4.4; §4.5 y §4.7; §4.6; §4.8; §4.9), cada uno en verde por sí solo. Si el orden tiene que cambiar para que cada uno quede en verde, **REPORTA** el que uses.
3. `git push origin una-pausa:revision-28-3` y reporte: archivos tocados, cada **REPORTA**, la lista de textos nuevos (clave y texto), decisiones tomadas sin preguntar, casos antes y después, y lo que la SPEC pide y el código no puede cumplir.
4. **No** hagas push a `una-pausa` ni a `strivo`.
