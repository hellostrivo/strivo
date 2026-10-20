# Adenda SPEC_17A — Bloque 4: DP-17.13 cerrada y lo que falta del criterio 21

**Fecha:** 24 de septiembre de 2026
**Rama:** `strivo` · **Commit de referencia:** `d4cbe64`
**Gobierna:** `claude/ADENDA_SPEC_17A_VALIDACION_MANUAL_18-09-2026.md`, §6 punto 4
**Qué es esto:** el cierre de DP-17.13 con medición en navegador, el procedimiento de lo que falta del criterio 21, y tres decisiones pendientes nuevas.

---

## 1. DP-17.13 — Si un fallo de restauración debe sobrevivir a la recarga

**Cerrada. No cambia el código.**

### La pregunta

`ultimoResultado(uid)` vive en un `Map` en memoria de módulo (`src/lib/db/restaurar.js:139`) y se pierde en cada recarga. Como la rama `restauracionFallida` del botón "Intentar de nuevo" depende de ese valor, la sospecha era que el botón quedaba inservible después de recargar y que había que persistir el fallo en `localStorage`.

### La respuesta

**Un fallo que todavía importa se reproduce solo.** Tres piezas del código, en este orden:

1. `bajar()` devuelve `{ok: false, motivo: interrumpida}` **sin llamar a `marcar(uid)`** (`restaurar.js`, el `catch` previo al `marcar`). Un fallo no deja marca.
2. `prepararArbol` restaura si `sinArbol || !hayMarcaDeRestauracion(uid)` (`src/lib/sesion.js:140`). Sin marca, **vuelve a restaurar en el arranque siguiente aunque el árbol local esté entero**. Ya estaba fijado en pruebas: `sesion.test.js:177`, *"sin marca pero con árbol, se restaura igual (la marca no es la única condición)"*.
3. Esa segunda restauración vuelve a escribir en el `Map`. Si falla otra vez, `restauracionFallida` es `true` en esa carga y el botón aparece con motivo.

Tras recargar hay solo dos mundos posibles: o el fallo se resolvió solo —y entonces no hay nada que reintentar—, o sigue vivo —y entonces el `Map` se rellena sin persistir nada. La ventana que la persistencia cubriría es exactamente la de un fallo que ya dejó de existir.

Persistirlo, además, rompería la regla que el propio bloque se puso en la cabecera de `Perfil.jsx`: *"el botón de volver a intentar aparece solo cuando hay algo que intentar"*. Y pulsarlo dispararía una restauración completa sin motivo.

El comentario de `restaurar.js:135` —*"un fallo es un hecho de esta sesión, no del dispositivo"*— resulta ser correcto por construcción, no una simplificación.

### Lo que se midió

Ventana de incógnito, `localhost:5173`, cuenta de prueba `FlkJmrwOjfejIHdFt0hOCglXypW2`. Sesión de Auth por `crearConCorreo` (§5 de la adenda del 18), nunca por el onboarding. Fallo forzado con `auth.signOut()` + retirada de la marca: las reglas uid-scoped deniegan la lectura y la bajada falla de forma determinista, sin tocar la nube.

| # | Observación | Resultado |
|---|---|---|
| A | Primera recarga con la bajada rota | ✅ "Todo guardado" + la línea de error de restauración + el botón |
| B | **Segunda recarga, sin restaurar la sesión** | ✅ Idéntico. El fallo se reprodujo solo, sin persistencia |
| C | Pulsar "Intentar de nuevo" | ✅ Cuatro peticiones a Firestore con `Initiator: restaurar.js:180`. Pantalla sin cambios |
| D | Restaurar la sesión y recargar | ✅ Aviso y botón desaparecen. Solo "Todo guardado" |

En C, el `200` de las peticiones no indica éxito: Firestore responde 200 y transporta la negativa en el contenido. Que la línea de error **siguiera** en pantalla tras el reintento es la prueba de que el nuevo intento también falló — si hubiera funcionado, esa línea habría desaparecido sola.

**Corrige la hipótesis de partida:** el botón nunca estuvo roto. El `Map` decide si se **ve**, no si **sirve**.

### Lo único que queda por hacer

Anotar el porqué junto al `Map` en `restaurar.js`, para que nadie vuelva a abrir esta pregunta: que no persiste porque `prepararArbol` repite la restauración mientras no haya marca, con la referencia a `sesion.test.js:177`. Sin pruebas nuevas: las dos piezas ya están fijadas por separado (`restaurar.test.js:375` y `sesion.test.js:177`).

---

## 2. Estado del criterio 21

| Estado | Cómo se validó |
|---|---|
| `sinCuenta` | Bloque 1 |
| `alDia` | Bloques 2 y 3 |
| `restauracionFallida` + botón visible y funcional | **Este documento, observaciones A–D** |
| `pendiente` | Falta |
| `sinConexion` | Falta |
| Botón en su rama de cola (`pendientes > 0`) | Falta |

---

## 3. Procedimiento para lo que falta

Va en el navegador normal, con el árbol sano. No hace falta incógnito ni tocar la sesión de Auth.

**El dato que lo hace posible:** nada vacía la cola al escribir. El único `flush` de toda la app fuera de `sync.js` es el del propio botón; `startSync` vacía al arrancar, al volver la red y al volver la pestaña a primer plano. Una escritura nueva se queda en la cola hasta uno de esos tres eventos, así que `pendiente` es observable y estable.

**Regla durante toda la prueba: no cambies de pestaña.** Un `visibilitychange` dispara el `flush` automático y te borra el estado antes de verlo.

### E — `sinConexion`

1. Abre Tu perfil y déjalo a la vista, en el bloque "Dónde vive lo que escribes".
2. DevTools → Network → en el desplegable de throttling, elige **Offline**.
3. **Sin recargar**, mira el bloque.

Esperado: el texto cambia solo a *"Sin conexión. Se guardará cuando vuelva."* y **no aparece el botón** — reintentar sin red no es intentar nada, y está así por diseño (`estadoDe`, `enLinea` es condición de `puedeReintentar`).

4. Vuelve el throttling a **No throttling**. El texto debe volver a "Todo guardado" solo.

### F — `pendiente`

1. Con la red ya restablecida, ve a **Hoy** o **Journal** y escribe algo. Espera dos segundos a que se guarde.
2. Navega a **Tu perfil** (navegar, no recargar).

Esperado: **"Guardando"**, y el botón **"Intentar de nuevo"** visible. Sin número al lado: la pantalla no dice cuántas escrituras esperan (§4.6).

### G — El botón en su rama de cola

3. Con "Guardando" en pantalla, pulsa **"Intentar de nuevo"**.

Esperado: el texto pasa a **"Todo guardado"** y el botón desaparece. Es el único caso en que el botón produce un cambio visible, y contrasta con la observación C.

---

## 4. Decisiones pendientes nuevas

### DP-17.14 — La pantalla lee el resultado una sola vez

**Abierta.** `useSincronizacion` recalcula al montar, al ir y volver la red, y al volver la pestaña. **Nunca al terminar la restauración.**

Caso concreto y reproducible: el oyente de `reintentarAlVolverLaRed` se registra en el arranque, antes de que monte Perfil, y su `correr(uid)` no se espera. Al volver la red ese oyente dispara primero y el `recalcular` del hook —oyente de `online` también— lee el valor **anterior**. Si el reintento acaba bien, el botón se queda ofreciendo reintentar algo que ya funcionó, hasta el siguiente montaje o `visibilitychange`.

Mismo patrón que DP-17.11: una lectura única de un dato que todavía está en vuelo. La opción (b) de aquella —un sello que cambia al terminar la bajada— lo cubriría aquí también. **Decidir si entra en SPEC_17A o espera a SPEC_19.**

### DP-17.15 — El botón no acusa recibo

**Abierta.** Medido en la observación C: el botón sale a la red, falla y no dice nada. Tampoco diría nada si funcionara. `reintentar` descarta el resultado de `flush`, que además tiene guardia `if (flushing) return { skipped: 'en_curso' }`: pulsarlo mientras el `flush` automático está en vuelo es un no-op silencioso.

Roza el tono: "sin urgencia" no obliga a "sin acuse". **Decidir si el bloque necesita señal de "lo intenté" y de qué forma**, sin cifras y sin alarma.

### DP-17.16 — "Todo guardado" y el aviso de fallo, juntos

**Abierta.** Observado en A y B: el estado dice *"Todo guardado"* y justo debajo aparece *"No pudimos recuperar todo ahora"*. Técnicamente ambas son ciertas —una habla de lo que sube, la otra de lo que baja— pero leídas seguidas se contradicen.

**Decidir si el estado debe reflejar el fallo de bajada, o si el copy debe separar las dos direcciones.** Es materia de redacción del bloque, no de arquitectura.

---

## 5. Notas del entorno

- **Rotar la contraseña de la cuenta de prueba** (`atreloz.bs@gmail.com`) al cerrar la validación: quedó visible en una captura de pantalla durante esta sesión.
- **El perfil de la cuenta de prueba sigue con `wakeTime: null` y `sleepTime: null`.** Es el destrozo documentado en la §2 de la adenda del 18 (DP-17.10), no un defecto nuevo. Lo que baja hoy es ese perfil pisado.
- **Confirmación colateral de la §4 de aquella adenda:** tras restaurar en un dispositivo nuevo (la ventana de incógnito), el Journal abrió y mostró las entradas **sin pedir PIN**. Es el comportamiento correcto y confirma que el criterio 20 estaba mal redactado, no el código.
- La regla de seguridad de DP-19.5 se respetó: la sesión se reconstruyó siempre con `crearConCorreo` desde la consola, nunca pasando por el onboarding.
