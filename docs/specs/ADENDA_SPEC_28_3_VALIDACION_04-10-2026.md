# Adenda — Validación de SPEC_28.3 (la sección «Una pausa»)

**Fecha:** 4 de octubre de 2026
**Rama:** `una-pausa` · **Commit validado:** `b6318b1` (revisado en `revision-28-3`, sobre `a55b927`; `strivo` en `94b6c27`, sin rebase pendiente)
**Gobierna:** `SPEC_28_UNA_PAUSA.md` (v0.5 en el repo) + `INSTRUCCION_SPEC_28_3_SECCION.md` (v1.0)
**Resultado:** **SPEC_28.3 cerrada en código.** La revisión de código no encontró defectos que bloqueen. La fundadora validó M1–M4 a mano en el deploy de `revision-28-3` y todo pasó. **M5–M9 quedan diferidas** a la piloto en el deploy de `una-pausa` (DP-28.28). Se cierran DP-28.26, 28.27 y 28.28.

---

## 1. Qué se entregó

Seis commits sobre `a55b927`, en el orden de §8.2:

| Commit | Bloque |
|---|---|
| `01cb394` | §4.1: la piloto también en el archivo de la vista previa (DP-28.19) |
| `b8e26cc` | §4.2–4.4: `canal/leer.js`, `canal/cache.js`, `useUnaPausa.js` y la prueba de repo de fronteras |
| `dfe98c7` | §4.5 y §4.7: las pantallas, `copy.unaPausa`, la ruta en `App.jsx` y `.una-pausa-encabezado` (incluye el arreglo de `flex` frente a `hidden` en Fuentes) |
| `2749ca1` | §4.6: la cuarta píldora, `cabeceraDesplazable.js`, la máscara y `secciones.unaPausa` |
| `e2c9887` | §4.8: pruebas de accesibilidad y el comentario en `lint-contraste.js` |
| `b6318b1` | §4.9: `CLAUDE.md`, la SPEC a v0.5 y la instrucción sin cambios |

**Suite:** 90 → 95 archivos, 2.733 → 2.854 casos.

**Comprobado de forma independiente** (clon limpio de `revision-28-3`, Node 22, `npm ci`): `lint`, `lint:copy`, `lint:contraste`, `test` (95 / 2.854), `build` y `build:vista-previa`, los seis en verde. `build:vista-previa` deja `dist/una-pausa/feed.json` con `vigente: null` y `archivo: []`, y el deploy de rama lo sirve como JSON.

## 2. Resoluciones de la §0 (aprobadas el 4 oct)

Desvíos A–H aprobados; `URL.revokeObjectURL` añadido (`crearPortadaLocal`, se libera al desmontar y al cambiar de portada); DP-28.24 y DP-28.25 cerradas; `unaPausa.fuentes.aviso` y `unaPausa.vacio` con el texto de la fundadora. Desvío 3 (criterio 4 de la SPEC): cubierto por cinco pruebas —`leerCanal` nunca lanza; `cargarSeccion` con todo fallando no rechaza; el límite pintado a HTML da `error`; la ruta de Una pausa es la única dentro del límite y la cabecera y la barra van fuera de las rutas; nadie fuera de `App.jsx` importa `unaPausa/`— y, a mano, por M3 con la petición del canal bloqueada.

## 3. Decisiones de Claude Code aceptadas

| # | Decisión | Por qué se acepta |
|---|---|---|
| D1 | Dos archivos más: `Estado.jsx` y `fecha.js` | `Estado` lo comparten la sección y su límite de errores; `fecha.js` concentra el único formateo de fechas, en UTC |
| D2 | Cuatro globales en `eslint.config.js`: `AbortController`, `URL`, `Blob`, `ResizeObserver` | Sin ellas `no-undef` no deja pasar el código; no relajan ninguna regla |
| D3 | `esCanal` exige además que cada entrada del archivo sea un objeto | Más estricta que §4.2; la usa también la caché antes de guardar |
| D4 | La portada se guarda como bytes y tipo, no como `Blob`; al guardar la de la vigente se borran las anteriores | Safari antiguo no guardaba `Blob` en IndexedDB; las portadas no se acumulan |
| D5 | El rótulo de la práctica `in_capsule` es un `h3` | Mantiene el orden de encabezados sin saltos |
| D6 | Autoría y año en dos piezas sin signo entre ellas | No escribe un separador dentro del componente. **Revisar a la vista en M5** |
| D7 | La cabecera no anima al montar, solo al cambiar de ruta | Entrar por enlace directo no debe moverse delante de nadie |
| D8 | `/una-pausa/archivo` con el archivo vacío vuelve a la vigente | Coherente con RN-NAV-06 y con no ofrecer «Explorar» |
| D9 | Tres pruebas existentes ajustadas (navegación de Respiración a seis destinos; `publicar.test.js` y `canal.test.js` por DP-28.19) | Consecuencia directa de DP-28.1 y DP-28.19 |

## 4. Revisión de código

Contra la instrucción y las reglas de arquitectura, en `b6318b1`:

- **Fronteras.** Ningún archivo de `src/unaPausa/` importa `lib/db`, `firebase`, `firestore`, `diario/` ni `breathing/` (prueba de repo y ESLint). La ruta de Respiración llega por props desde `App.jsx`. `strivo-contenido` solo aparece en `canal/cache.js`.
- **Nada se pierde, nada se bloquea.** `leerCanal`, `traerPortada` y la caché no lanzan; `cargarSeccion` no rechaza. El canal solo se pide al montar Una pausa. `LimiteDeErrores` envuelve únicamente la ruta `/una-pausa/*`; `NavStrivo` y la barra quedan fuera.
- **La lectura.** Exige 2xx, `content-type` `application/json`, JSON válido y `formato === 1`; un 200 con HTML es `tipo`. Tope de 10 s con `AbortController`. Sin credenciales ni referente. Portadas resueltas contra la URL del canal.
- **CORS en producción.** `canal/netlify.toml` pone `Access-Control-Allow-Origin: *` en `/una-pausa/*`, que cubre `feed.json` y `portadas/`. No hay CSP que lo bloquee. El service worker solo intercepta Firestore; no precachea JSON ni WebP.
- **Estados.** `estadoDeLaSeccion` cumple las seis filas de §4.4 y añade dos coherentes: con caché, se enseña enseguida mientras se lee; una caché sin vigente cuenta como vacía.
- **Pantallas.** Orden de §4.5; `theme` no se pinta; `alt=""` cuando falta; `width`/`height` reservan la portada; si no carga, no se pinta nada; transparencia solo con `generatedWithAi: true`; la pregunta y la práctica `journal` sin control; archivo sin portada, sin cifras, sin «leída». Sin colores literales.
- **Cabecera.** Una fila sin `flex-wrap`, `whitespace-nowrap`, `scrollTo` horizontal (nunca `scrollIntoView`), `smooth` solo sin movimiento reducido. Fundido por máscara con `currentColor`/`transparent`; `scroll-padding-inline` = `FUNDIDO` = 24 px, comparados por prueba.
- **Copy.** Todo en `copy.unaPausa` al final del objeto, más `secciones.unaPausa`. Sin exclamaciones ni léxico prohibido (prueba). `lint:copy` sin marcas nuevas.
- **Contraste.** Sin pares nuevos, a propósito; el comentario de `lint-contraste.js` nombra los reutilizados.

**Observaciones que no bloquean** (si se ven en M5–M9, se corrigen en 28.4):

| # | Qué | Dónde se vería |
|---|---|---|
| O1 | **Sin conexión, la portada puede aparecer, desaparecer y volver.** El primer render pinta la URL de red; sin red falla y la portada se quita; al llegar la guardada, vuelve. El texto de debajo salta dos veces | M7 |
| O2 | Al girar el teléfono se recalcula el fundido, pero no se vuelve a centrar la activa | teléfono (M1 pasó sin que se viera) |
| O3 | La primera vez, la portada se descarga dos veces (la `<img>` y la copia para la caché). ≤ 250 KB | — (se acepta) |
| O4 | Sin conexión, el detalle de una pausa del archivo sale sin portada: solo se guarda la de la vigente (§4.3) | M7 (es lo previsto) |
| O5 | Al volver atrás, el foco va al `h1` de la vista y la página sube arriba | M6 |
| O6 | En desarrollo local la sección sale en error: sin `VITE_URL_CANAL` lee `contenido.hellostrivo.com`, que aún no existe | — (esperado) |
| O7 | El script de vista previa dice «2 cápsulas publicadas» cuando la piloto está como vigente y en el archivo: la cuenta dos veces y la llama publicada | — (cosmético; se corrige en 28.4) |

## 5. Validación manual

En `https://revision-28-3--beamish-wisp-ada776.netlify.app/#/una-pausa`, en el navegador de escritorio y en el teléfono.

| Criterio | Qué se comprobó | Resultado |
|---|---|---|
| **M1** | Cabecera en una fila a 320, 375 y 390 px y en el teléfono; ninguna píldora cortada; fundido; la activa entera entrando por enlace directo | **Pasa** (fundadora, 4 oct) |
| **M2** | Estado vacío con el texto aprobado, sin error y sin «Explorar pausas anteriores» | **Pasa** (fundadora, 4 oct) |
| **M3** | Las otras cinco secciones igual que en producción; con `feed.json` bloqueado, error con «Reintentar» y nada más cambia | **Pasa** (fundadora, 4 oct) |
| **M4** | Teclado: las cuatro píldoras se alcanzan y se ven al enfocarlas; el foco va al encabezado sin anillo | **Pasa** (fundadora, 4 oct) |
| M5–M9 | Necesitan la piloto en `en_revision` y válida | **Diferidos** (DP-28.28) |

La fundadora informó «validado manualmente y todo bien»; no reportó defectos ni observaciones.

## 6. Decisiones cerradas con esta adenda

La fundadora sigue la recomendación en las tres (4 oct).

| DP | Pregunta | Decisión | Se hace en |
|---|---|---|---|
| **DP-28.26** ✅ | El id `archivo` choca con la ruta `/una-pausa/archivo`, y gana la ruta: una cápsula con ese id no tendría detalle. | **El validador reserva el id.** Una regla `id.reservado` en `validar.js` con la lista `['archivo']`, exportada y usada también por `UnaPausa.jsx`, con su prueba. Ninguna cápsula usa hoy ese id | 28.4 |
| **DP-28.27** ✅ | El archivo y el detalle no tienen «Volver». En Capacitor (iOS) no hay botón atrás, y del detalle no se puede volver al archivo | **Un enlace «Volver»**: en el archivo, a la vigente; en el detalle, al archivo. Texto en `copy.unaPausa.volver` | 28.4 (antes del 20 nov) |
| **DP-28.28** ✅ | ¿Se cierra 28.3 con M1–M4 y M5–M9 diferidas a la piloto, como 28.2? | **Sí.** **M5–M9 se validan antes del 9 nov**, en el deploy de rama de `una-pausa`, con la piloto en `en_revision`; un defecto se corrige en 28.4 o con un arreglo propio | el push de 28.3 |
| **DP-28.14** ✅ | ¿Las fotografías pueden mostrar personas? | **Sin rostros reconocibles** (4 oct). Ver §7 sobre la portada de la piloto | 28.5 |

## 7. Lo que queda

- **La piloto, lista para entrar en `contenido/`.** Texto revisado y validado por la fundadora, tres fuentes marcadas `reviewed: true`, portada y texto alternativo. Valida sin faltas ni avisos en `en_revision`, y la portada pasa `revisarPortada` (WebP, 1600 × 1200, 231 212 bytes). Archivos: `respirar-cuando-el-dia-se-acelera.json` y `respirar-cuando-el-dia-se-acelera.webp`.
- **La portada** parte de una imagen de 1200 × 896 que se recortó a 4:3 y se escaló a 1600 × 1200, así que está algo suavizada. Si en M5 se nota, se vuelve a generar a mayor tamaño. En ella se ve una persona de tres cuartos de espaldas, con parte del perfil; la fundadora la envió y la da por buena.
- **M5–M9 con la piloto**, en `una-pausa--beamish-wisp-ada776.netlify.app`. M9: los veinte textos, uno por uno. O1, O4 y O5 se miran ahí.
- **28.4** recoge DP-28.26, DP-28.27 y O7, además de su alcance propio.
- `docs/specs/SPEC_28_UNA_PAUSA.md` del repo está en v0.5; la copia de los archivos del proyecto sigue en v0.4. Manda la del repo.
- Deuda aparte, anterior a Una pausa: la intermitente de `journal.test.js`.
