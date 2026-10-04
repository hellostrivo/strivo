# Adenda — Validación de SPEC_28.2 (canal de publicación de «Una pausa»)

**Fecha:** 4 de octubre de 2026
**Rama:** `una-pausa` · **Commit validado:** `79416b5` (revisado en `revision-28-2`)
**Gobierna:** `SPEC_28_UNA_PAUSA.md` (v0.4) + `INSTRUCCION_SPEC_28_2_CANAL.md` (v1.0)
**Resultado:** **SPEC_28.2 cerrada en código.** La revisión de código encontró un hueco en el recordatorio del miércoles (DP-28.23), corregido en `79416b5`. La fundadora validó M3 y M5. **M1, M2 y M4 quedan diferidos** a la creación del sitio del canal (DP-28.22): ese sitio publica desde `una-pausa`, así que solo se puede crear después de este push. Se cierran DP-28.21 y DP-28.23.

---

## 1. Qué se entregó

Siete commits sobre `1938c8f`:

| Commit | Bloque |
|---|---|
| `93ce20c` | §4.0: los dos comentarios que citaban cosas inexistentes; `journalPrompt` exige exactamente un «¿» |
| `8aeafda` | §4.1–4.3: `canal.js`, `portada.js`, las reglas nuevas de `validar.js`, `validarConjunto`, `CODIGOS` y el fixture corregido |
| `aca4c03` | §4.4–4.5: `scripts/publicar-pausa.js`, `contenido/` vacía y las pruebas en `src/unaPausa/__tests__/` |
| `bd45b03` | §4.6: `canal/netlify.toml` con Node 20, lo añadido al `netlify.toml` de la raíz, `package.json` y `.gitignore` |
| `de28677` | §4.7: los dos workflows (inertes hasta la fusión) y `scripts/recordatorio-pausa.js` |
| `103a8d3` | §4.8: la SPEC a v0.4, `CLAUDE.md` y la instrucción sin cambios |
| `79416b5` | DP-28.23: el recordatorio mira si el canal del lunes se puede construir |

**Suite:** 84 → 90 archivos, 2.498 → 2.733 casos. Los seis comandos en verde. La salida de `lint:copy` es la de `1938c8f`, salvo el número de proceso del aviso de Node.

**Los dos builds, a mano:** `npm run build` no deja `dist/una-pausa/` ni rastro de `scripts/` o `contenido/` en `dist/`. `npm run build:vista-previa` deja `dist/una-pausa/feed.json` y `dist/una-pausa/portadas/` vacía. Con Node 20.20.2 el script corre y escribe el canal vacío.

## 2. Resoluciones de la §0 (aprobadas el 3 oct)

| # | Resolución |
|---|---|
| §4.2 | `validarConjunto` en `validar.js` |
| §4.4 | Pruebas del script en `src/unaPausa/__tests__/`; `vitest.config.js` sin cambios |
| §4.6 | `NODE_VERSION = "20"` en `canal/netlify.toml`; el `[[headers]]` de `/una-pausa/*` va después del de `/*` |
| 5.1 | Regla `portada.nombre` (`^[a-z0-9]+(-[a-z0-9]+)*\.webp$`) siempre que haya `coverAsset`: cierra la vía para publicar cualquier archivo del repo |
| 5.2 | La piloto queda exenta de `semana.falta`, y de nada más |
| 5.3 | `publicadaEl` de la piloto en la vista previa = la semana del canal |
| 5.4 | `CODIGOS`, `PREFIJOS` e `IDS_DE_PROMESA` exportados; una prueba de repo extrae los literales |
| 5.5 | Recordatorio con «programada válida»; la SPEC v0.4 redacta así DP-28.12 |
| 5.6 | Sin cambios en el modelo: abre DP-28.20 |
| 5.7 | Una portada que no se copia no se nombra: `generarCanal` recibe `portadas` |
| 5.8 | Prueba estructural en la suite y los dos builds a mano |

## 3. Decisiones de Claude Code aceptadas

| # | Decisión | Por qué se acepta |
|---|---|---|
| D1 | `id.forma` también salta sin `id` | Una cápsula sin id no tiene archivo ni ruta, y saldría en el canal sin id. Cambió seis comprobaciones de 28.1 que usaban objetos sin id |
| D2 | `portada.proporcion` mira la relación de aspecto | 1599 × 1200 da ancho y proporción; 1200 × 900, solo ancho |
| D3 | Los archivos mal nombrados entran en `validarConjunto` y no en el canal | Es como se repite un id en la práctica |
| D4 | Si el canal de producción falla, no escribe nada; si escribe, vacía antes `<salida>/una-pausa/` | No quedan portadas de una corrida anterior |
| D5 | Los mensajes no copian números: `MAX_PALABRAS`, `MAX_HALLAZGOS`, `MAX_CARACTERES_DE_PREGUNTA` exportados | «Un sitio y solo uno» |
| D6 | Dos mensajes del léxico reescritos para no contener «¡» | La prueba de «sin exclamaciones» los encontró |
| D7 | El recordatorio nombra la programada que no pasa y dice cuándo cierra la validación final | Útil, dentro del alcance |
| D8 | Una prueba lanza el script de verdad; las demás llaman a `publicar` | Comprueba los códigos de salida reales |
| D9 | Pruebas ligeras de los dos workflows (horarios, permisos, secreto, sin instalar nada) | Los workflows no corren hasta la fusión |
| D10 | `revisar` solo recibe `{ raiz }` | Ninguna regla del validador mira la hora del build: lo que rompe el miércoles rompe el lunes |

## 4. Revisión de código

En un clon de `103a8d3` y después de `79416b5`:

- **Lista blanca:** `canal.js` solo saca `CAMPOS_PUBLICOS`, `publicadaEl`, `fuentes` (sin `reviewed`) y `portada`. Ningún campo editorial llega a la app (DP-28.15).
- **DP-28.21:** con un JSON roto en `capsulas/`, el canal de producción sale con 1 y no escribe nada; con `--vista-previa`, sale con 0, imprime la falta como aviso y escribe el canal vacío. Con `contenido/` vacío, `{ formato: 1, semana, vigente: null, archivo: [] }` y salida 0.
- **`netlify.toml` de la raíz:** `[build]` de producción intacto; `/una-pausa/*` después de `/*`; `[context.branch-deploy]` con `build:vista-previa` y `VITE_URL_CANAL = "/una-pausa/feed.json"`.
- **El hueco encontrado (DP-28.23):** el recordatorio solo miraba si el lunes tenía `programada` válida. Con ella presente pero el build de producción condenado por otra cosa (JSON roto, otra `aprobada` con faltas, la portada que falta), decía «no hace falta nada» y el lunes la cápsula no salía. **Corregido en `79416b5`:** `revisar` es la mitad de `publicar` que lee y revisa sin escribir; el recordatorio la usa sin vista previa y avisa también cuando el canal no se podría construir, con una línea por falta. Qué rompe sigue decidiéndose solo en `publicar-pausa.js`. El título pasa a «Una pausa: revisar el lunes AAAA-MM-DD». Ocho casos nuevos; las pruebas de `publicar` pasan sin cambios. `src/unaPausa`: 12 archivos, 630 casos en verde.

## 5. Validación manual

| Criterio | Qué se comprobó | Resultado |
|---|---|---|
| **M3** | `curl -sI https://revision-28-2--beamish-wisp-ada776.netlify.app/una-pausa/feed.json` (4 oct) → `200`, `cache-control: public,max-age=300` sin `immutable`, `content-type: application/json`. El cuerpo es el canal vacío de la semana del 28 sep. Antes, el 3 oct: `/index.html` de producción sale solo con `no-cache`; Netlify no combina dos `Cache-Control` | **Pasa** |
| **M5** | En Netlify, el último deploy de producción del sitio de la app es anterior a 28.2: los push de `revision-28-2` solo crearon deploys de rama | **Pasa** |
| M1, M2, M4 | El sitio del canal y `contenido.hellostrivo.com` | **Diferidos** (§7) |
| Workflows | — | Diferidos a la fusión (DP-28.17) |

## 6. Decisiones cerradas con esta adenda

| DP | Decisión |
|---|---|
| **28.21** | La vista previa nunca rompe el build: con `--vista-previa`, el script sale con 0 y las faltas se imprimen como avisos. El guardián es el sitio del canal, que corre sin esa opción. |
| **28.23** | El recordatorio del miércoles avisa también cuando el canal del lunes no se podría construir, aunque haya `programada` válida. Lo que rompe lo decide `revisar`, en `publicar-pausa.js`, y el recordatorio no copia la regla. |

## 7. Lo que queda

- **M1, M2 y M4, con el sitio del canal** (instrucción §9). El sitio publica desde `una-pausa`, así que se crea después de este push, y cuando DP-28.22 (créditos de Netlify) lo permita. **Fecha límite: antes del 20 nov** (fusión), para tener el CNAME y el certificado comprobados con margen antes del 7 dic. M1 incluye `content-type: application/json`, no solo el 200.
- **Lista de la fusión:** la rama de producción del sitio de la app tiene que ser `strivo` (si no, `strivo` se construiría como vista previa, con la piloto); los workflows entran con `strivo` como rama por defecto (DP-28.17); build hook y secreto `NETLIFY_BUILD_HOOK_CANAL` se crean entonces; tras la fusión, `[context.branch-deploy]` corre en los deploys de rama del lanzamiento y por DP-28.21 nunca los tumba.
- **Para 28.3:**
  - Una piloto en `en_revision` puede traer portada sin `coverAltText`: la pantalla pone `alt=""`, nunca sin atributo.
  - Si el build del lunes falla, el canal sigue sirviendo el `feed.json` anterior: la app lo muestra sin más.
  - En el sitio de la app, una ruta inexistente bajo `/una-pausa/` devuelve `index.html` con 200: el lector del canal comprueba que la respuesta es JSON.
- `package.json` no declara `"type": "module"` y Node avisa al cargar los scripts. Es preexistente (`lint-copy.js` igual) y no rompe nada.
- Deuda aparte, anterior a Una pausa: la intermitente de `journal.test.js`.
