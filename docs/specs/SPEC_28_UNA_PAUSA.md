# SPEC_28 — Una pausa: viabilidad y plan de implementación

**Para:** la fundadora (decisiones) y, entrega por entrega, Claude Code (ejecución)
**Rama de trabajo propuesta:** `una-pausa`, creada desde `strivo` en `1aa5e87` (2 oct 2026)
**Gobierna junto con:** `SPEC_00B` + `CLAUDE.md` + el brief de «Una pausa» del 3 oct 2026
**Versión:** 0.5 — 4 oct 2026. Cierra DP-28.0 a 28.4, 28.12, 28.16, 28.17, 28.19, 28.21, 28.23, 28.24 y 28.25; abre DP-28.20. Cada entrega tiene instrucción propia: `INSTRUCCION_SPEC_28_1_MODELO.md`, `INSTRUCCION_SPEC_28_2_CANAL.md`, `INSTRUCCION_SPEC_28_3_SECCION.md`.

> **Cambios desde 0.4:** 28.3 reescrita según su instrucción, con la ubicación real y los desvíos 1 a 4 (§7). DP-28.19, 28.24 y 28.25 cerradas; DP-28.11 queda para la piloto, fuera de 28.3 (§5).

> **Cambios desde 0.3:** el canal lo construye un segundo sitio de Netlify y la vista previa sale solo en los deploys de rama de la app; el build de producción de la app no cambia (§3.1). Hasta la fusión no hay cron (DP-28.17). DP-28.12, 28.16, 28.17, 28.21 y 28.23 cerradas; DP-28.20, abierta (§5). 28.2 reescrita según su instrucción (§7).

> **Cambios desde 0.1:** DP-28.0, 28.1, 28.2, 28.3 y 28.4 cerradas (§5). Corrección a H11: el repo solo aplica el léxico clínico al copy de Respiración. Excepción léxica temporal para Una pausa (DP-28.13). Portadas fotorrealistas: requisitos técnicos en §4 y dos decisiones nuevas (DP-28.14, 28.15). La rama se trabaja en un *worktree* aparte (§8).

---

## 0. Veredicto

**Es viable técnicamente y no es viable completo antes del 10 de diciembre sin poner en riesgo la App Store.**

- Lo que la persona ve (pestaña, cápsula, archivo, accesos desde Hoy, sin conexión) cabe en **~30 h de código** y se puede hacer sin backend, sin tocar Firestore y sin romper ninguna regla de arquitectura.
- Lo editorial que pide el brief (panel privado, máquina de estados en servidor, borradores con IA, publicación programada, historial de versiones) es **otro producto**: **~60–80 h** más, un backend que hoy no existe y un cambio de plan de Firebase.
- Lo que queda del plan para llegar a la App Store (SPEC_21, 17B, 22, 23, 24, 25) suma **63 h**. Entre el 5 oct y una entrega a revisión hacia el 26 nov hay **~83–120 h** a tu ritmo (7,5 semanas × 11–16 h).
  - iOS + Una pausa completa (~95–120 h): **63 + ~105 ≈ 170 h. No cabe.**
  - iOS + solo lectura (Fase A, ~28 h de código + ~12 h editoriales): **≈ 103 h. Cabe en la mitad alta de tu rango y sin margen** para un tropiezo en Capacitor, que es la incógnita mayor del plan.

**Decidido (3 oct):** Fase A en la rama `una-pausa`, en paralelo y sin prioridad sobre SPEC_21–25. Entra en 1.0 **si está terminada y te gusta a tiempo**; si no, en 1.1. «A tiempo» se concreta así: la decisión se toma el **9 de noviembre** (la cápsula del 7 dic tiene que estar prevalidada ese día) y el código de 28.1–28.4 se fusiona a `strivo` **antes del 20 de noviembre**, para que el binario que va a revisión lo lleve probado en dispositivo.

**Recomendación original (0.1):** dos fases. **Fase A** (lectura + canal de publicación sencillo, controlado por tu push) en la rama `una-pausa`, avanzando solo en las semanas con holgura y con una **fecha de corte el 9 de noviembre** para decidir si entra en 1.0 o en 1.1. **Fase B** (panel editorial e IA en servidor) después del lanzamiento.

**Antes que todo eso: esto amplía el alcance congelado de 1.0.** No está en la lista de lo excluido, pero es una sexta sección y un sistema de contenido nuevo. Es tu decisión (DP-28.0).

---

## 1. Lo que dice el repo hoy (verificado en `1aa5e87`)

| # | Hallazgo | Dónde | Qué implica |
|---|---|---|---|
| H1 | **La cabecera tiene tres destinos y el Historial está abajo**, con Tu perfil. | `NavStrivo.jsx` (`SECCIONES`), `BarraInferior.jsx` (`DESTINOS`) | El orden del brief («Hoy · Journal · Respiración · Una pausa · Historial» en la barra superior) **choca** con «no modifiques la barra inferior». Ver DP-28.1. |
| H2 | **RN-NAV-01: «Cinco destinos: tres arriba, dos abajo. Un sexto exige revisar el capítulo 4.»** | `CLAUDE.md` §2 | Una pausa es el sexto. Hay que enmendar RN-NAV-01 y RN-NAV-02 y el blueprint §4, no solo añadir una pestaña. |
| H3 | **Las píldoras de la cabecera ya no caben en un teléfono con cuatro.** `flex-wrap`, `px-4`, 16 px. Estimación: ~425 px de píldoras contra ~335 px útiles a 375 px de ancho. | `NavStrivo.jsx` | Con la cuarta, la cabecera se parte en dos filas. Hay que elegir desplazamiento horizontal o píldoras más compactas (DP-28.2). |
| H4 | **«Respira un momento» no lleva a la sección Respiración.** Abre en el sitio un ejercicio breve de 39 s (`components/shared/Respiracion.jsx`) como `vista` de Hoy. | `Hoy.jsx` líneas ~185–225, `TarjetaRespiracion.jsx` | El brief parte de un supuesto falso. Se conserva tal cual (es el comportamiento validado). |
| H5 | **Volver desde la respiración breve no devuelve al mismo punto del ritual.** Hoy cambia de `vista` y desmonta `DiarioManana`/`DiarioNoche`, cuyo `paso` y `vista` son estado local; al volver, el recorrido arranca en el paso 0. Lo escrito no se pierde: `useDiario` guarda a los 800 ms y vuelca al desmontar. | `Hoy.jsx` (`abrir`/`cerrar`), `DiarioManana.jsx:80–83`, `DiarioNoche.jsx:89–98`, `useDiario.js:182–190` | El criterio «volver al mismo punto» **no se cumple hoy ni para Respiración**. Arreglarlo para las dos toca código validado (DP-28.6). |
| H6 | **La tarjeta de respiración «mide lo que mide su texto»** y está alineada a la izquierda; es una decisión documentada en el archivo. | `TarjetaRespiracion.jsx` | Dos columnas de igual ancho (~163 px cada una) obligan a cambiar esa decisión, y «Respira un momento» (~200 px con su relleno actual) no cabe en una línea en su columna (DP-28.5). |
| H7 | **No hay backend.** Firestore solo admite `users/{uid}/**` y todo lo demás está cerrado. Sin Cloud Functions, sin Netlify Functions, sin Storage. | `firestore.rules`, `netlify.toml` | Todo el flujo editorial «en servidor» es infraestructura nueva. |
| H8 | **Firestore es de solo escritura salvo `restaurar.js`.** | `CLAUDE.md`, prueba de repo | Leer cápsulas publicadas desde Firestore exigiría un segundo lector autorizado. Se evita sirviendo el contenido como archivo estático por HTTPS. |
| H9 | **Netlify sirve todo con `Cache-Control: public, max-age=31536000, immutable`.** | `netlify.toml` | Un `feed.json` servido así quedaría cacheado un año en cada teléfono. El canal necesita su propio encabezado. |
| H10 | **El service worker solo existe en la PWA.** En Capacitor iOS (`capacitor://`) no hay service worker. | `vite.config.js` (VitePWA) | El «sin conexión» de la cápsula no puede depender de workbox: necesita su propia caché local. |
| H11 | **Corregido en 0.2.** El repo tiene dos listas: `FORBIDDEN` (castigo, prescripción, rendimiento, «trastorno») se aplica a **todo `src/`**; `CLINICO` («ansiedad», «estrés», «terapia», «síntoma», «tratamiento», «cura», «pánico»…) se aplica **solo a `copy.respiracion`**. De hecho el catálogo de emociones ya dice «Con ansiedad» (`copy/index.js:1243`). La regla del proyecto es más estricta que lo que el código impone. | `scripts/lint-copy.js` (`FORBIDDEN`, `CLINICO`, `checkRespiracion`) | Las cápsulas viven fuera de `src/copy`: `lint:copy` no las ve y su validador aplica su propia lista (§4, DP-28.13). |
| H12 | **Ya existe una «pausa» en la mañana**: «Si quieres, una última pausa» (`MomentoPausa.jsx`, `diario/mananaPausa.js`). | `copy.diario.manana.reflexion` | Choque de nombre en código y en la cabeza de quien usa la app. El módulo nuevo no puede llamarse `pausa/`. |
| H13 | **La presentación cuenta las secciones con cuatro tarjetas** («Los cuatro títulos son los nombres de las secciones»). | `copy` §presentación, `components/presentacion/` | Una sección nueva deja la presentación incompleta. Decidir si gana una tarjeta (DP-28.11). |
| H14 | **El Journal no guarda la pregunta que lo originó.** Su esquema es `date, text, emotions, otherText, createdAt, updatedAt`. | `lib/db/schema.js:112` | Guardar «de qué pregunta vino esta entrada» es un cambio de esquema y toca sincronización y restauración. Sin cambio, la pregunta solo puede ir dentro del texto o no guardarse (DP-28.7). |
| H15 | **La CI solo corre en `main` y `develop`**, y con `lint:copy` como advertencia. | `.github/workflows/ci.yml` | Ni `strivo` ni la rama nueva tienen CI. El canal de Fase A no puede apoyarse en ella sin ajustarla. |

---

## 2. Contradicciones dentro del brief

Se resuelven con decisión tuya, no por implementación:

1. ~~**Imagen.**~~ Resuelta: fotografías hiperrealistas generadas con IA (DP-28.4). «Sin fotografías» y «visual abstracto» quedan retirados del brief.
2. ~~**Orden de la barra superior.**~~ Resuelta: Una pausa va arriba junto a Respiración; Historial sigue abajo (DP-28.1).
3. **«Respira un momento debe seguir llevando a la sección Respiración»**: nunca lo hizo (H4).
4. **Calendario frente a la regla de cuatro semanas.** La cápsula del 5 de octubre debía estar prevalidada el 7 de septiembre; la del 2 de noviembre, el lunes que viene. Ninguna de las nueve primeras fechas puede cumplir la regla, porque el sistema no existirá antes de mediados de noviembre (§6).
5. **«Una persona editora debe revisar y modificar antes de prevalidar.»** Obligar a modificar convierte la revisión en un trámite: si el borrador está bien, la edición sería un cambio cosmético para pasar la puerta (DP-28.9).
6. **«La validación final el miércoles previo».** ¿Exactamente el miércoles, o a más tardar el miércoles? Si es exactamente, aprobar el martes queda prohibido (DP-28.9).
7. **El posicionamiento.** «No es meditación, no es una app clínica» frente a una sección semanal de evidencia sobre meditación y respiración, con fuentes científicas y aviso de «no sustituye atención profesional». No es una contradicción técnica; es una pregunta de producto que conviene mirar de frente antes de escribir trece cápsulas.

---

## 3. Arquitectura propuesta

### 3.1 Fase A — sin backend, publicación por tu push

```
contenido/una-pausa/              ← fuente: un .json por cápsula + portadas
        │  (tú cambias el estado y haces push; la IA solo escribe borradores)
        ▼
scripts/publicar-pausa.js         ← valida TODAS las cápsulas y genera el canal
        │  falla si una aprobada o programada no pasa las reglas
        │
        ├─────────────────────────────────────┐
        ▼                                     ▼
sitio del canal (canal/netlify.toml)    deploys de rama de la app (branch-deploy)
canal/dist/una-pausa/feed.json          dist/una-pausa/feed.json ← la piloto como vigente
canal/dist/una-pausa/portadas/*.webp    vista previa, mismo origen; nunca falla (DP-28.21)
        │  hasta la fusión: publica desde una-pausa y se reconstruye a mano
        │  tras la fusión: Action los lunes 06:05 UTC (00:05 en Monterrey) → build hook
        ▼
https://contenido.hellostrivo.com/una-pausa/feed.json   ← lo lee la app con fetch(), no Firestore
        │
        ▼
src/unaPausa/  (módulo nuevo)     ← lector, caché local propia, pantallas
```

- **Dos sitios de Netlify, desde el mismo repo** (DP-28.3). El de la app no cambia su build de producción ni gana el dominio `contenido`. El del canal se crea con *Package directory* = `canal`, solo construye el canal y sirve `/una-pausa/*` con `Cache-Control: public, max-age=300` y `Access-Control-Allow-Origin: *`: el contenido es público, el mismo para todos y no lleva credenciales.
- **Vista previa solo en los deploys de rama de la app** (DP-28.16): `npm run build:vista-previa` corre el script después de `vite build`, con `--vista-previa`, y la app leerá `VITE_URL_CANAL`. El canal de producción nunca incluye la piloto.
- **Sin cron hasta la fusión** (DP-28.17). Los dos workflows —el build hook del lunes y el recordatorio del miércoles— se escribieron en 28.2 y quedan inertes hasta que `strivo` sea la rama por defecto.

- **«Publicada» no se escribe: se deriva.** Una cápsula `programada` cuyo `weekStart` ya llegó en `America/Monterrey` es la publicada. El build del lunes la incluye; antes no existe en el canal. Nada futuro viaja al teléfono.
- **La reserva:** si la semana no tiene cápsula programada válida, el canal sirve la cápsula de reserva aprobada más antigua sin usar; si no hay, conserva la última publicada. Nunca un borrador.
- **La garantía de «la IA no publica» en Fase A es tu push, no un servidor.** Es la misma garantía que ya gobierna todo el repo («yo valido y hago el push a mano»), y hay que decirlo así: Claude Code tiene escritura en el repo local. El validador exige `reviewedBy`, `prevalidatedAt` y `approvedAt` para todo lo que no sea borrador, y CLAUDE.md prohíbe a Claude Code tocar esos campos; pero la barrera dura llega en Fase B.
- **La zona horaria se calcula con `Intl.DateTimeFormat` y `timeZone: 'America/Monterrey'`**, sin dependencia nueva. Monterrey no tiene horario de verano desde 2022, así que el cron en UTC es estable; aun así, el build comprueba la fecha con la zona IANA y no con el desfase fijo.
- **Caché sin conexión:** base IndexedDB aparte, `strivo-contenido`, fuera del árbol del usuario: no entra en la cola de sincronización, no se exporta, no se restaura. Guarda el último canal y la portada vigente como blob. Sirve igual en PWA y en Capacitor. SPEC_17B (SQLite) no la toca.
- **Módulo `src/unaPausa/`** con la misma frontera que `breathing/`: no importa `diario/` ni `breathing/`; los destinos (Respiración, Journal, volver) le llegan por props desde `App.jsx`, que es quien enruta. Regla nueva en `eslint.config.js`.

### 3.2 Fase B — editorial privada (después de 1.0)

- Colección `editorial/capsulas/{id}` y `editorial/capsulas/{id}/versiones/{n}` en Firestore, **cerrada al cliente** salvo a cuentas con el claim `editora: true`; los cambios de estado solo por funciones en servidor, que validan la transición, el actor y las reglas de §4.
- Publicación: una función programada (lunes 00:00, `America/Monterrey`) escribe el mismo `feed.json` del §3.1. **La app no cambia entre fases**: lee la misma URL con el mismo formato.
- Panel: aplicación aparte (entrada Vite propia, sitio aparte), **nunca dentro del binario de la App Store**. Una función oculta de administración dentro de la app es lo que la directriz 2.3.1 de Apple rechaza.
- IA: función en servidor con la llave en secretos del proveedor. Redacta **solo** a partir de fuentes que tú cargaste y que se verificaron contra Crossref (DOI → título, autoría, año). Si propone una fuente nueva, entra como `reviewed: false` y no cuenta para avanzar.
- **Las reglas de Firestore son del proyecto entero.** Se despliegan desde `strivo` y nunca desde la rama: un `firebase deploy --only firestore:rules` desde `una-pausa` cambiaría las reglas de producción de todos.
- Requiere decidir el proveedor (DP-28.3) y, si es Firebase, pasar `strivo-fe04f` al plan Blaze.

---

## 4. Reglas del contenido que el validador hace cumplir

Viven en `src/unaPausa/modelo/` como lógica pura, para que las usen el script de Fase A, las pruebas y, después, el servidor de Fase B. **Un solo sitio para cada regla.**

| Regla | Comprobación |
|---|---|
| Un tema, una invitación | `practiceDestination` y `practiceLabel` son uno o ninguno; no hay listas de prácticas. |
| Hallazgos | `keyFindings.length` entre 1 y 3. |
| Fuentes completas | Al menos una; cada una con `title`, `authorsOrInstitution`, `year` (o `null` declarado), `originalUrl` https; si hay `doi`, con forma `10.x/...`. **Todas `reviewed: true` para pasar de `en_revision` a `prevalidada`.** |
| Lectura breve | Texto visible (sin fuentes) ≤ 320 palabras. No se muestra cifra alguna. |
| Léxico | `FORBIDDEN` + `CLINICO` de `lint-copy.js` sobre todo el texto visible, **menos la exención temporal de Una pausa** («estrés», «ansiedad»; DP-28.13) y **excepto títulos de fuentes**, que se citan como son. Sin «¡» ni «!». Sin «elle». |
| Género | Redacción neutra sin género en todo el texto de cápsula (no hay persona destinataria con género conocido en un canal común). |
| Cuatro semanas | `prevalidatedAt` ≤ `weekStart` − 28 días. |
| Validación final | `approvedAt` cae en la ventana que decida DP-28.9. |
| Transiciones | Solo las de la tabla §4.1; `generatedWithAi` solo puede crear `borrador`. |
| Portada | Obligatoria desde `prevalidada`: `coverAsset` + `coverAltText` no vacío (describe la escena, no la interpreta). Fotografía hiperrealista generada con IA. **WebP, 1600 px de ancho, ≤ 250 KB**, proporción 4:3; el script de 28.2 lo comprueba sobre el archivo. Nunca texto sobre la imagen. Sin animación ni paralaje. |

### 4.1 Transiciones

| De | A | Quién |
|---|---|---|
| — | `tema_calendarizado` | editora |
| `tema_calendarizado` | `borrador` | editora o IA |
| `borrador` | `en_revision` | editora |
| `en_revision` | `borrador` · `prevalidada` · `rechazada` | editora |
| `prevalidada` | `aprobada` · `en_revision` · `rechazada` | editora |
| `aprobada` | `programada` · `en_revision` | editora |
| `programada` | `aprobada` (desprogramar) | editora |
| `programada` | `publicada` | sistema, al llegar `weekStart` |
| `publicada` | `archivada` | sistema, al publicarse la siguiente |
| `aprobada` con `reserva: true` | `publicada` | sistema, solo si la semana no tiene programada |

Campo añadido al modelo del brief: **`reserva: boolean`** y **`approvedBy`** (el brief tiene `reviewedBy` pero no quién aprueba). `version` sube en cada cambio de texto; en Fase A el historial de versiones **es el historial de git** del archivo; en Fase B, la subcolección `versiones`.

---

## 5. Decisiones pendientes

Las marcadas **⛔** bloquean la entrega indicada.

| DP | Pregunta | Recomendación | Bloquea |
|---|---|---|---|
| **DP-28.0** ✅ | ¿1.0 o 1.1? | **Cerrada 3 oct:** 1.0 condicionada, rama aparte, en paralelo al plan. Decisión el 9 nov; fusión antes del 20 nov (§0). | — |
| **DP-28.1** ✅ | Dónde va la pestaña. | **Cerrada 3 oct:** arriba, **Hoy · Journal · Respiración · Una pausa**. Abajo sin cambios. Se enmiendan RN-NAV-01/02 a «seis destinos: cuatro arriba, dos abajo». | — |
| **DP-28.2** ✅ | Cuatro píldoras en un teléfono. | **Cerrada 3 oct:** desplazamiento horizontal. La activa siempre a la vista; un fundido en el borde dice que hay más; sin animación con movimiento reducido. | — |
| **DP-28.3** ✅ | Dominio del canal. | **Cerrada 3 oct:** `contenido.hellostrivo.com`. **Precisión del 3 oct, tarde:** el dominio no se cuelga del sitio de la app, sino de un **segundo sitio de Netlify** que solo publica el canal (mismo repo, comando de build propio). Así el sitio de la app no gana un dominio que no es suyo, y el canal se reconstruye los lunes sin redesplegar la app. Ese sitio se crea en 28.2, y el CNAME apunta a él. | 28.2 |
| **DP-28.4** ✅ | Imagen. | **Cerrada 3 oct:** fotografías hiperrealistas generadas con IA que transmitan calma y el tema de la cápsula. En Fase A las generas fuera y las subes tú; ninguna integración de generación en el código. Antes de usar una herramienta, confirma que sus términos permiten uso comercial en una app de pago. | — |
| **DP-28.5** | Dos columnas de igual jerarquía en Hoy. | Dos columnas de igual ancho con texto que puede partirse en dos líneas dentro de los 56 px; apilar solo por debajo de 340 px. Implica retirar la regla «mide lo que mide su texto» de la tarjeta de respiración. | 28.4 |
| **DP-28.6** | «Volver al mismo punto del ritual» para Respiración también. | Sí: la cápsula y la respiración breve se abren **encima** del Diario, que sigue montado y oculto, en vez de sustituirlo. Corrige H5 para las dos. Toca `Hoy.jsx`, que está validado. | 28.4 |
| **DP-28.7** | Qué pasa con la pregunta al abrir el Journal. | El Journal abre el editor con la pregunta **como encabezado del editor, no como texto**. Si escribes algo, la entrada guarda la pregunta como primera línea del texto; si sales sin escribir, no se crea nada. Sin cambio de esquema. | 28.4 |
| **DP-28.8** | ¿Una pausa se lee en modo lectura (prueba vencida sin pago)? | Sí. No es escritura, y Respiración ya funciona en ese modo (DP-25.1). | 28.3 / SPEC_25 |
| **DP-28.9** | Regla editorial: ¿«revisar y modificar» o «revisar»? ¿Validación «el miércoles» o «a más tardar el miércoles»? | «Revisar cada sección» (marca por sección, no edición forzada) y «a más tardar el miércoles previo, 23:59 Monterrey». | 28.1 |
| **DP-28.10** | ¿«Date una pausa» se muestra si no hay ninguna cápsula conocida (primer arranque sin red)? | Se oculta hasta que haya una en caché o en red. Con la reserva, eso solo pasa la primera vez. | 28.4 |
| **DP-28.11** | ¿La presentación gana una quinta tarjeta? | Sí, si DP-28.0 dice 1.0; se escribe con la cápsula piloto. **Con la piloto, fuera de 28.3** (4 oct). | 28.5 |
| **DP-28.12** ✅ | Recordatorio editorial del miércoles en Fase A. | **Cerrada 3 oct (adenda de 28.1):** una GitHub Action los miércoles abre un issue si el lunes siguiente no tiene una cápsula `programada` válida; el cuerpo dice qué pasará ese lunes —la reserva que entra, la que se repite o ninguna—. GitHub lo manda por correo. Corre solo cuando `strivo` sea la rama por defecto (DP-28.17); hasta entonces, los plazos los lleva la fundadora (prevalidación de la cápsula del 7 dic: 9 nov). Ampliada por DP-28.23. | — |
| **DP-28.13** | Alcance de la exención léxica. Decidido: «estrés» y «ansiedad» se permiten en Una pausa y los criterios se revisan al terminar la piloto. Abierto: ¿solo esas dos palabras, o también sus derivadas («ansioso», «estresante»)? | Solo las dos, con sus plurales. El resto de `CLINICO` («terapia», «síntoma», «tratamiento», «cura», «trastorno», «pánico») sigue fuera. La exención vive en una constante y caduca con la adenda de la piloto. | 28.1 |
| **DP-28.14** | ¿Las fotografías pueden mostrar personas? | Sin rostros reconocibles: manos, siluetas de espaldas, paisajes, objetos, luz. Un rostro fotorrealista inventado en una app íntima se lee como una persona real que no dio permiso. | 28.5 |
| **DP-28.16** ✅ | Vista previa de la piloto. | **Cerrada 3 oct (adenda de 28.1):** **vista previa solo en los deploys de rama de la app.** En ese contexto el build genera además un `feed.json` propio, servido en el mismo origen, con la piloto como vigente. La app lee la URL del canal de una variable de build cuyo valor por defecto es `URL_CANAL`. El canal de producción nunca incluye la piloto. | — |
| **DP-28.17** ✅ | Cuándo corren los workflows. | **Cerrada 3 oct (adenda de 28.1):** **hasta la fusión, sin cron:** no hay público, el sitio del canal publica desde `una-pausa` y se reconstruye a mano cuando haga falta. **Con la fusión**, los workflows entran en `strivo` y el sitio del canal pasa a publicar desde `strivo`. **`strivo` tiene que ser la rama por defecto de GitHub antes del 7 dic**: GitHub solo ejecuta Actions programadas desde la rama por defecto, que hoy es `main`. La promoción se decide en el proyecto de lanzamiento. | — |
| **DP-28.19** ✅ | ¿La piloto también en el archivo de la vista previa? | **Cerrada 4 oct (instrucción de 28.3):** sí, para recorrer en el teléfono vigente → archivo → detalle antes de que haya ninguna publicada. La misma cápsula, sin inventar nada, con `publicadaEl` = la semana del canal menos 7 días, en el orden del archivo; si comparte fecha con una publicada, va detrás. El detalle busca en el archivo antes que en la vigente. **El canal de producción no cambia.** | — |
| **DP-28.24** ✅ | ¿Qué se pinta de `theme`? | **Cerrada 4 oct:** nada. La etiqueta editorial es la frase fija «Tema de la semana» y el encabezado es `title`; `theme` es el nombre del calendario editorial y repetirlo bajo el título diría dos veces lo mismo. | — |
| **DP-28.25** ✅ | ¿Cómo es el archivo? | **Cerrada 4 oct:** una lista de texto, título y fecha, sin portada. La portada se ve en el detalle: una lista de fotos se lee como un catálogo, y sin conexión serían huecos. | — |
| **DP-28.20** | Antes de la primera `programada`, ¿cubre una reserva una semana vacía? | **Abierta.** Hoy no: el calendario empieza en la primera programada que ya llegó, así que si la cápsula del 7 dic no está `programada`, ese lunes no hay ninguna aunque haya reservas aprobadas. El recordatorio del miércoles lo dice así. Se decide fuera de 28.2. | — |
| **DP-28.21** ✅ | ¿Puede el contenido tumbar un deploy de rama? | **Cerrada 3 oct:** no. Con `--vista-previa` el script sale siempre con 0; las faltas se imprimen como avisos y el canal deja fuera lo inválido. Sin `--vista-previa`, una falta en una `aprobada` o `programada` rompe el build. Tras la fusión, `branch-deploy` corre en los deploys de revisión del lanzamiento, y el contenido editorial no puede tumbarlos. Lo decide `codigoDeSalida`, exportada y probada. | — |
| **DP-28.23** ✅ | ¿Avisa el recordatorio si el canal del lunes no se podría construir? | **Cerrada 4 oct (adenda de 28.2):** sí. Si hay faltas que romperían el build de producción, el recordatorio abre el issue aunque el lunes tenga programada válida, con una línea por falta. Lo decide `revisar`, en `publicar-pausa.js`; el recordatorio no copia la regla. | — |
| **DP-28.15** | **El repo es público**, así que `contenido/una-pausa/` deja leer en GitHub los borradores, el calendario y las fuentes antes de publicarse. La app nunca los muestra; GitHub sí. | Aceptarlo en Fase A (no es dato personal) y no escribir correos ni nombres completos en `reviewedBy`/`approvedBy`: se usa el identificador `fundadora`. Hacer el repo privado es una decisión aparte que afecta a todo el proyecto. | 28.1 |

---

## 6. Calendario editorial ajustado

La app sale el 10 de diciembre. Lo que se publique antes solo lo ven tus cuentas de prueba, así que **las fechas de octubre y noviembre no tienen público**. Lo que importa es tener un banco aprobado para el lanzamiento.

| Publicación | Tema (del brief) | Prevalidada a más tardar | Papel |
|---|---|---|---|
| cuando exista 28.3 | Respirar cuando el día se acelera | — | **Piloto interno**, nunca en el archivo público |
| 7 dic 2026 | Hacer espacio en días llenos | 9 nov | Viva al abrir la tienda |
| 14 dic 2026 | Tratarte con amabilidad en momentos intensos | 16 nov | |
| 21 dic 2026 | Mirar lo vivido sin convertirlo en una evaluación | 23 nov | |
| 28 dic 2026 | Empezar un nuevo ciclo a tu ritmo | 30 nov | |
| reserva | Pequeñas pausas que devuelven presencia | 30 nov | `reserva: true` |
| reserva | Cerrar el día sin resolverlo todo | 30 nov | `reserva: true` |

Los temas restantes pasan a enero en adelante. **Seis cápsulas aprobadas antes del 30 de noviembre** son ~12 h de trabajo editorial tuyo (leer las fuentes de verdad es la parte que no se acorta), además del código.

---

## 7. Las entregas

Una SPEC a la vez, como siempre. Cada una se convierte en instrucción para Claude Code cuando sus DP estén cerradas.

### Fase A

#### SPEC_28.1 — Modelo, transiciones y validador · ~6 h

**Ubicación:** `src/unaPausa/modelo/` (nuevo: `capsula.js`, `estados.js`, `semana.js`, `validar.js`), `src/unaPausa/modelo/__tests__/`. `scripts/lint-copy.js` exporta sus listas en vez de duplicarlas.

**Actual:** no existe nada.
**Esperado:** lógica pura, sin React ni navegador. `lunesDe(fecha)` devuelve el lunes en `America/Monterrey`; `capsulaVigente(capsulas, ahora)` aplica programada → reserva → última publicada; `puedeTransitar(de, a, actor)`; `validar(capsula)` devuelve la lista de faltas con las reglas del §4.

**Criterios:**
1. `lunesDe` del domingo 23:59 y del lunes 00:00 de Monterrey dan lunes distintos; probado con `TZ` del proceso en UTC y en Asia/Tokyo.
2. Ninguna transición que la tabla §4.1 no lista es aceptada; `actor: 'ia'` solo llega a `borrador`.
3. Una cápsula sin fuentes, con una fuente `reviewed: false`, con cuatro hallazgos, con «terapia» en `opening` o con más de 320 palabras no pasa de `en_revision`; un título de fuente con «anxiety» o «estrés» sí pasa. *(«estrés» y «ansiedad» sí pasan en el texto de la cápsula: los exime DP-28.13.)*
4. `capsulaVigente` nunca devuelve una cápsula en `borrador`, `en_revision`, `prevalidada`, `rechazada` ni `tema_calendarizado`, con cualquier combinación de entrada (prueba por tabla).
5. Sin cápsula programada y sin reserva, devuelve la última publicada; sin ninguna, `null`.
6. Los seis comandos en verde.

**Roza:** cero strings hardcodeados (los mensajes del validador son para ti, no para la persona usuaria: van en el script, no en `src/copy`; **REPORTA** si `lint:copy` los marca); sin estado «fallado» (el validador nunca llega a la app).

#### SPEC_28.2 — Canal de publicación · ~6 h

**Ubicación:** `src/unaPausa/modelo/` (nuevos: `canal.js`, `portada.js`; amplía `validar.js`), `scripts/publicar-pausa.js`, `scripts/recordatorio-pausa.js`, `contenido/una-pausa/capsulas/` y `contenido/una-pausa/portadas/` (vacías), `canal/netlify.toml` (nuevo), `netlify.toml` (solo el contexto `branch-deploy` y la cabecera de `/una-pausa/*`), `package.json` (`canal`, `build:vista-previa`; **`build` no cambia**), `.github/workflows/publicar-pausa.yml`, `.github/workflows/recordatorio-pausa.yml`. Pruebas en `src/unaPausa/__tests__/`. Instrucción: `INSTRUCCION_SPEC_28_2_CANAL.md`.

**Actual:** no hay canal; `netlify.toml` cachea todo un año (H9).
**Esperado:** el script valida todas las cápsulas con 28.1, el conjunto (`validarConjunto`) y las portadas desde `prevalidada` (`revisarPortada`), falla si algo `aprobada` o `programada` no pasa, y escribe `feed.json` con la vigente y el archivo (solo publicadas, de la más reciente a la más antigua), con una **lista blanca** de campos (`canal.js`). Lo construye el **sitio del canal**; el build de producción de la app no genera nada del canal. La **vista previa** la genera un comando aparte que solo usa el contexto `branch-deploy` (DP-28.16) y nunca falla (DP-28.21). `/una-pausa/*` sale con `Cache-Control: public, max-age=300` y `Access-Control-Allow-Origin: *`. Las dos Actions —lunes 06:05 UTC al build hook, miércoles 15:00 UTC al issue de DP-28.12— se escriben y quedan inertes hasta la fusión (DP-28.17).

**Criterios:**
1. Con una cápsula `programada` para el 12 oct, un build simulado el domingo 11 oct 23:59:59 Monterrey no la incluye; el lunes 12 00:00:00 sí.
2. Ningún campo de una cápsula no publicada aparece en `feed.json`, ni ningún campo fuera de la lista blanca, ni `reviewed` (prueba sobre la salida, con centinelas). En `portadas/` no hay archivo de ninguna no publicada.
3. Con la semana sin cápsula, el canal sirve la reserva; la siguiente, sin reserva libre, repite la anterior. **En Fase A la reserva no se marca:** su uso se deriva, determinista, en `calendarioEfectivo`, y se comprueba sobre la salida.
4. Una cápsula `aprobada` con «terapia» en un hallazgo rompe el build con un mensaje que nombra el archivo, el campo y el código. *(«ansiedad» la exime DP-28.13.)* En `borrador`, solo avisa.
5. `scheduledAt` después del lunes 00:00 de Monterrey de su semana da `plazo.programada-tarde`. Dos programadas en la misma semana, dos ids iguales, un archivo mal nombrado o que no es JSON, dan su falta.
6. Una portada que no es WebP, que no mide 1600 × 1200 o que pasa de 250 000 bytes rompe en una `aprobada` y avisa en una `prevalidada`.
7. `npm run build` no deja nada en `dist/una-pausa/`; `curl -I` sobre `feed.json` en el deploy de la rama muestra el `Cache-Control` corto, no `immutable`.

**Roza:** nada se bloquea (si el script falla, falla el build del sitio del canal y Netlify conserva el deploy anterior: la app sigue con el canal de la semana pasada; el trabajo editorial a medias solo avisa). **Requiere DP-28.3** y que actives los deploys de rama del sitio de la app para validar en tu teléfono sin tocar producción.

#### SPEC_28.3 — La sección · ~10 h

**Ubicación:** `src/unaPausa/` (`UnaPausa.jsx`, `Capsula.jsx`, `Fuentes.jsx`, `Archivo.jsx`, `Estado.jsx`, `LimiteDeErrores.jsx`, `useUnaPausa.js`, `fecha.js`), `src/unaPausa/canal/` (`leer.js`, `cache.js`), `src/unaPausa/modelo/canal.js` (la piloto en el archivo de la vista previa), `src/App.jsx` (ruta `/una-pausa/*` dentro de su límite de errores), `src/components/diario/NavStrivo.jsx` y `cabeceraDesplazable.js`, `src/styles/globals.css` (la cabecera desplazable y `.una-pausa-encabezado`), `src/copy/index.js` (`copy.unaPausa` al final del objeto y `shared.navegacion.diario.secciones.unaPausa`), `eslint.config.js` (cuatro globales del navegador; la frontera del módulo ya estaba desde 28.1), `scripts/lint-contraste.js` (comentario, sin pares nuevos), `CLAUDE.md` §2, §5, §11 y §13. Instrucción: `INSTRUCCION_SPEC_28_3_SECCION.md`.

**Actual:** cabecera con tres destinos; el canal existe y nadie lo lee.
**Esperado:** cuarta píldora «Una pausa» tras Respiración, en una cabecera que se desplaza en horizontal (DP-28.2). La sección muestra la cápsula vigente en el orden del brief (etiqueta, título, apertura, portada, lo que sabemos, llévalo a tu día, una pregunta para ti, fuentes desplegables con aviso educativo y la línea de transparencia) y «Explorar pausas anteriores» si el archivo tiene algo, que lleva a `/una-pausa/archivo` y de ahí a `/una-pausa/:id`. La lectura del canal nunca lanza, comprueba que la respuesta es JSON y tiene un tope de 10 s; la caché `strivo-contenido` guarda el último canal válido y la portada de la vigente, fuera del árbol del usuario. Estados: cargando sin rueda (la forma final vacía, RN-EST-02), sin conexión con la última en caché, vacío y error en tono sereno con reintento.

**Desvíos resueltos en la §0:**
1. «Ningún rótulo de la cabecera se trunca: son de una palabra» se deroga: «Una pausa» son dos. Lo garantiza `whitespace-nowrap` en las píldoras y una lista sin `flex-wrap`, con su prueba.
2. RN-10 y RN-NAV-01/02 se enmiendan a seis destinos en `CLAUDE.md`. **El blueprint §4 sigue pendiente de revisión.**
3. «Una prueba que monta `App` con el `fetch` fallando» no se puede escribir así: las pruebas corren en Node y pintan con `renderToStaticMarkup`, que no ejecuta efectos ni límites de error. La garantía son cinco pruebas: `leerCanal` nunca lanza; `cargarSeccion` con todo fallando no rechaza; el límite de errores pintado a HTML da el estado `error`; la ruta de Una pausa es la única dentro del límite y la cabecera y la barra van fuera de las rutas; nadie fuera de `App.jsx` importa `unaPausa/`. Lo que un límite no ve —los errores de los manejadores de eventos— está anotado en `CLAUDE.md`.
4. La pregunta y la práctica `journal` se leen y no llevan control: abrir el Journal es de 28.4.

**Criterios:**
1. A 320, 375 y 390 px la cabecera no se parte en dos filas, ninguna píldora se recorta y la activa queda visible al entrar por enlace directo a `/una-pausa`.
2. Navegación por teclado completa; el desplegable de fuentes es un `<button aria-expanded aria-controls>`; enlaces de fuentes con `rel="noopener noreferrer"` y nombre accesible que dice que abren fuera.
3. Modo avión con una cápsula en caché: se ve entera, con portada. Sin caché: estado vacío, sin error.
4. Con el canal devolviendo 500, Hoy, Journal, Respiración, Historial y Tu perfil funcionan igual (desvío 3).
5. `strivo-contenido` no aparece en la cola de sincronización ni en ningún `setDoc`: ningún archivo de `unaPausa/` importa `lib/db`, `firebase` ni `firestore` (prueba de repo).
6. El archivo no tiene contadores, «me gusta», orden por popularidad ni marca de «leída».
7. `lint:contraste` cubre las combinaciones nuevas en los dos momentos: no hay pares nuevos, y el comentario nombra los que se reutilizan.
8. Ningún módulo de `unaPausa/` importa `diario/` ni `breathing/` (regla de ESLint y prueba de repo).

**Roza:** RN-NAV-01/02 y RN-10 (se enmiendan en el commit de docs), RN-TEC-02, AAA, `prefers-reduced-motion` (ni el desplegable ni la cabecera animan con él), Firestore de solo escritura (no se toca: el canal es `fetch`).

#### SPEC_28.4 — Accesos desde Hoy y paso al Journal · ~6 h

**Ubicación:** `src/pages/diario/Hoy.jsx`, `src/components/diario/HeroeHoy.jsx`, `src/components/diario/TarjetaRespiracion.jsx` (o una pareja nueva junto a ella), `src/pages/diario/Journal.jsx`, `src/diario/useJournal.js`, `src/App.jsx`, `src/copy/index.js`.

**Actual:** una sola tarjeta; abrir la respiración desmonta el Diario (H5).
**Esperado:** «Respira un momento» y «Date una pausa» lado a lado, mismos tokens del momento, sin duración ni progreso. Las dos abren **encima** del Diario, que sigue montado (DP-28.6). Desde la cápsula, «Una pregunta para ti» lleva al Journal con la pregunta según DP-28.7; si hay PIN, pasa primero por el desbloqueo.

**Criterios:**
1. En la mañana, avanzar al paso 2, escribir sin esperar los 800 ms, abrir «Date una pausa», volver: mismo paso, mismo texto, mismo momento del conmutador. Lo mismo con «Respira un momento» si DP-28.6 dice sí.
2. A 375 px los dos accesos caben en una fila con 56 px de alto mínimo cada uno; por debajo de 340 px se apilan.
3. Abrir el Journal desde la pregunta y salir sin teclear no crea entrada (prueba sobre `journal.guardar`).
4. Con PIN activo, la pregunta no se ve antes del desbloqueo y nada del Journal se ve desde la cápsula.
5. Sin cápsula conocida, se aplica DP-28.10.

**Roza:** nada se pierde (criterio 1), nada se bloquea, RN-LU-RESP-01 (la respiración sigue abriéndose solo desde su tarjeta), RN-TEC-04 (Hoy recibe la cápsula por props, `unaPausa/` no conoce `diario/`).

#### SPEC_28.5 — Cápsula piloto y banco de lanzamiento · trabajo editorial, ~12 h tuyas

**No es código.** Redactamos aquí, juntas, a partir de fuentes que tú abres y lees; yo no propongo una fuente que no puedas abrir y comprobar. Cada cápsula entra al repo como `borrador` con `generatedWithAi: true`; los estados siguientes los cambias tú. Criterio único: las seis del §6 en `aprobada` o `programada` el 30 de noviembre, y el build en verde.

**Total Fase A: ~28 h de código + ~12 h editoriales.**

### Fase B (post 1.0)

| Entrega | Contenido | Horas |
|---|---|---|
| **SPEC_28.6** — Backend editorial | Colección `editorial/` cerrada, claim `editora`, funciones de transición con el validador de 28.1, versiones, publicación programada que escribe el mismo `feed.json`. Retira el canal por git. | 20–28 |
| **SPEC_28.7** — Panel | App aparte: calendario por semana, editor por sección, fuentes con comprobación en Crossref y botón para abrir el original, portada, vista previa con el mismo `Capsula.jsx`, programar, desprogramar, archivar, rechazar, historial, aviso del miércoles. | 25–35 |
| **SPEC_28.8** — Borradores con IA | Función en servidor; entrada: tema + fuentes verificadas; salida: `borrador`. Sin datos de personas usuarias, sin Journal, sin historial. Generación manual y programada. | 10–14 |

---

## 8. La rama

- **Un *worktree* aparte, no un cambio de rama**: `git worktree add ../strivo-una-pausa -b una-pausa strivo`. Así una sesión de Claude Code sobre Una pausa nunca cambia la rama debajo de una sesión de SPEC_21, y cada carpeta tiene su `node_modules`. Al empezar cada entrega, `git rebase strivo` dentro del worktree. **`src/copy/index.js` y `App.jsx` van a chocar** con SPEC_21 en adelante: el copy nuevo va en un bloque propio al final del objeto, y `App.jsx` solo gana una ruta.
- Revisión como siempre: `git push origin una-pausa:revision-28-N`. Tras validar, el push es a `una-pausa`, no a `strivo`.
- **Netlify no publica la rama** salvo que actives los deploys de rama; recomendado, para validar en el teléfono con la URL de la rama.
- **Nada de la rama toca Firebase.** Fase A no lo necesita; en Fase B las reglas se despliegan solo desde `strivo`.
- Fusión a `strivo` solo con DP-28.0 resuelta y Fase A validada entera.

---

## 9. Fuera de alcance de esta SPEC

Un módulo de meditación, programas guiados (congelado), notificaciones de cápsula nueva, analítica de lectura, compartir cápsulas, comentarios o reacciones, cápsulas personalizadas, cualquier uso de datos de la persona usuaria para elegir o generar contenido, y generación de imágenes integrada.
