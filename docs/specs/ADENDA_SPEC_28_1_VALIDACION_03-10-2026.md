# Adenda — Validación de SPEC_28.1 (modelo, estados y validador de «Una pausa»)

**Fecha:** 3 de octubre de 2026
**Rama:** `una-pausa` · **Commit validado:** `616b7b2` (revisado en `revision-28-1`)
**Gobierna:** `SPEC_28_UNA_PAUSA.md` (v0.3) + `INSTRUCCION_SPEC_28_1_MODELO.md` (v1.0)
**Resultado:** **SPEC_28.1 cerrada.** La revisión de código no encontró defectos que corregir. La fundadora validó la revisión manual: la tabla de transiciones y las reglas del validador dicen lo que dice la SPEC §4 y §4.1. Se cierran además DP-28.12, DP-28.16 y DP-28.17, que bloqueaban 28.2.

---

## 1. Qué se entregó

Seis commits sobre `94b6c27`:

| Commit | Bloque |
|---|---|
| `bddf10d` | §4.5: el léxico pasa a `src/lib/lexico.js`, con `SOLO_PROSA`, un `id` por regla, `AMPLIADO`, la regla de los derivados de «estrés» y sin el `fallaste` repetido. Las palabras pasan a `src/lib/palabras.js`; `diario/palabras.js` las reexporta. `lexico.js` va a `.prettierignore` |
| `b095bed` | §4.1–4.3: `capsula.js`, `semana.js`, `estados.js`; `unaPausa` en `separacion.test.js` |
| `8e09fc8` | §4.6: `validar.js` |
| `675eb9b` | §4.4: `vigente.js` y la prueba de repo de los criterios 2 y 12 |
| `d5e916f` | §4.7: la frontera en `eslint.config.js` |
| `616b7b2` | §4.8: `CLAUDE.md`, la SPEC a v0.3 y la instrucción sin cambios |

El validador va antes que `vigente.js` porque este lo usa: cada commit queda en verde por sí solo.

**Suite:** 77 → 84 archivos, 2.083 → 2.498 casos. `lint`, `lint:copy`, `lint:contraste`, `format:check` y `build` en verde. La salida de `lint:copy` es idéntica a la de `94b6c27`. Nada del modelo ni del léxico aparece en `dist/`. `una-pausa` ya no sigue a ninguna remota.

## 2. Decisiones de Claude Code aceptadas

| # | Decisión | Por qué se acepta |
|---|---|---|
| D1 | Código `estado.desconocido` | Un `status` mal escrito no puede tratarse como válido |
| D2 | Código `semana.falta`: desde `en_revision`, una cápsula sin `weekStart` tiene que llevar `reserva: true` | Es la regla de la instrucción §4.1 (`weekStart` nulo solo en reservas y temas sin fecha), aplicada donde un borrador ya no puede estar incompleto |
| D3 | Códigos `estado.derivado-en-fase-a`, `lexico.exclamacion`, `promesa.<id>`, `atenuacion.falta` | Nombran reglas que la instrucción ya pedía |
| D4 | Fila «IA: desde nada → borrador» en `TRANSICIONES` | Sale de la instrucción §4.3; es como entran al repo las cápsulas de 28.5 |
| D5 | `puedeTransitar` acepta la cápsula como cuarto argumento, solo para «aprobada → publicada», que exige `reserva: true`; sin él, esa transición da `false` | La condición es de la cápsula, no del estado |
| D6 | El límite de validación final cuenta el segundo entero (23:59:59,999) | «A más tardar el miércoles, 23:59:59» incluye ese segundo |
| D7 | `semanaDe` → `lunesDe` en las dos líneas del §7 de la SPEC | Corrección pedida |

## 3. Revisión de código

En un clon limpio de `616b7b2`:

- Seis comandos en verde. En dos corridas de la suite, una falló solo en la intermitente conocida de `journal.test.js`; la otra, 2.498/2.498.
- **Frontera:** un archivo temporal en `src/unaPausa/` que importaba `../../diario/…`, `@/breathing/…` y `diario` de `lib/db` dio tres errores de ESLint.
- **Escenario del lanzamiento** (programada el 7 dic, una reserva, programada el 21 dic, una piloto): nada antes del 7 dic 00:00 de Monterrey; el 7, la programada; el 14, la reserva; el 21, la programada; el 28, `repetida`. El archivo no repite ninguna y la piloto no aparece.
- **Léxico:** «estrés», «ESTRÉS», «ansiedad», «ansiedades» y «estreses» pasan; «estresante» y «ansiosa» dan falta; un título de fuente con «Anxiety and stress» no se revisa.

**Menores, a resolver en la §0 de la instrucción de 28.2:**

1. `semana.js` cita `__tests__/sinHoraLocal.test.js`, que no existe (la prueba está en `fronteras.test.js`); `capsula.js` cita `nivelDe` en `estados.js`, que no existe (es `ORDEN` / `desde`).
2. Un `journalPrompt` sin «¿» pasa («Qué me ocupa hoy?»): la instrucción solo pedía que terminara en «?».
3. La regla `cura` de `CLINICO` también para «curada», «curar», «curaduría». Se acepta: es conservadora y la editora reescribe.

## 4. Validación manual

| Criterio | Qué se comprobó | Resultado |
|---|---|---|
| Manual (§5 de la instrucción) | `TRANSICIONES` en `estados.js` coincide con la tabla §4.1 de la SPEC; las reglas de `validar.js` coinciden con §4 de la SPEC y §4.6 de la instrucción | Pasa |

## 5. Lo que la SPEC pide y el código no comprueba

- **Género neutro en el texto de la cápsula** (SPEC §4): el validador solo detecta «elle». Comprobar el género exigiría analizar el texto, y RN-06 lo prohíbe. Queda en la revisión editorial.
- **«Revisar y modificar»:** sin versión anterior en Fase A. Queda para Fase B.
- **La historia del archivo puede cambiar hacia atrás** en Fase A. Las pruebas «límites de Fase A» lo dejan a la vista y `CLAUDE.md` lo fija como regla de trabajo.

## 6. Decisiones cerradas con esta adenda

| DP | Decisión |
|---|---|
| **28.12** | Recordatorio editorial del miércoles: una GitHub Action abre un issue si el lunes siguiente no tiene cápsula `aprobada` o `programada`. Corre solo cuando `strivo` sea la rama por defecto (DP-28.17); hasta entonces, los plazos los lleva la fundadora (prevalidación de la cápsula del 7 dic: 9 nov). |
| **28.16** | **Vista previa solo en los deploys de rama de la app.** En ese contexto el build genera además un `feed.json` propio, servido en el mismo origen, con la piloto como vigente. La app lee la URL del canal de una variable de build cuyo valor por defecto es `URL_CANAL`. El canal de producción nunca incluye la piloto. |
| **28.17** | **Hasta la fusión, sin cron:** no hay público, el sitio del canal publica desde `una-pausa` y se reconstruye a mano cuando haga falta. **Con la fusión**, los workflows entran en `strivo` y el sitio del canal pasa a publicar desde `strivo`. **`strivo` tiene que ser la rama por defecto de GitHub antes del 7 dic**: GitHub solo ejecuta Actions programadas desde la rama por defecto, que hoy es `main`. La promoción se decide en el proyecto de lanzamiento. |

## 7. Lo que queda

- `src/copy/__tests__/respiracion.test.js` tiene su propia copia de la lista clínica. Se queda como oráculo independiente; no se actualizará sola si cambia `lexico.js`.
- Deuda aparte, anterior a Una pausa: la intermitente de `journal.test.js` («viene de la más reciente a la más antigua»).
- Los tres menores del §3, en la §0 de 28.2.
