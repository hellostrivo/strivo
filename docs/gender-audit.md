# Auditoría de género del copy existente

**Fecha:** 6 de agosto de 2026 · **Revisada:** 7 de agosto de 2026 (bloque 01)
**Origen:** §2.6 del documento de cambios v2.2
**Estado:** backlog parcial. Lo que sigue pendiente está en §2.

El motor de lenguaje adaptativo (§2) ya está en pie: `profile.gender` → `genderMode`
(`m` / `f` / `n`), `resolveCopy()` y `useCopy()`. Lo que falta es pasar por él el copy
que ya estaba escrito con una forma de género fija.

Este documento es el inventario de ese trabajo, no su ejecución. El sprint actual
solo convirtió las entradas de P3 y P4 (las pantallas que §2 nombra como
dependientes). Todo lo demás se queda como está hasta que se priorice.

**Cómo se generó:** `grep` de las terminaciones de riesgo (`mismo`, `misma`, `listo`,
`lista`, `orgulloso`, `orgullosa`, `tranquilo`, `tranquila`, `cansado`, `cansada`,
`agradecido`, `agradecida` y las demás formas de la tabla de emociones) sobre
`src/copy/index.js`.

---

## 1. Convertidas en este sprint ✅

| Clave | Variantes |
|---|---|
| `onboarding.p3.options[2]` | m: "Conectar conmigo mismo" · f: "…misma" · n: "Reconectar conmigo" |
| `onboarding.p4.placeholders[1]` | m: "…cuida de sí mismo" · f: "…misma" · n: "…se cuida" |
| `onboarding.p4.placeholders[2]` | m: "…se respeta a sí mismo" · f: "…misma" · n: "…se respeta" |

---

## 1-bis. Convertidas en el bloque 01 (7 ago 2026) ✅

| Clave | Variantes |
|---|---|
| `tagline` | m: "…en paz contigo mismo." · f: "…contigo misma." · n: "…terminar cada día en paz." |
| `insights.area.lowActivity` | m: "…un tiempo enfocado en…" · f: "…enfocada…" · n: "Llevas un tiempo en {áreaActiva}…" |
| `profile.cancel.title` | m: "¿Seguro que quieres cancelar?" · f: "¿Segura…?" · n: "¿Quieres cancelar?" |

`profile.cancel.title` no estaba en la lista original: apareció en el barrido del
bloque 01. Las tres se convirtieron sin tocar pantalla porque ninguna tenía todavía
consumidor.

---

## 2. Pendientes de convertir

### 2.1 Tabla de emociones — ya no aplica ✅

La lista original (`copy.emotions.*`) se retiró al reescribirse el bloque de
emociones. Su sustituta, `hoy.emociones.opciones` (§22), nació ya con variantes: once
de las quince las llevan y las otras cuatro son invariables (`En paz`, `Con energía`,
`Alegre`, `Radiante`). No queda nada que convertir aquí.

Sobrevive un cabo suelto: `amor.n` es `"Amado/a"`, la única barra de género del
producto. Está autorizada en el propio copy y en la lista blanca de
`tests/genero.test.js`, pero **contradice la regla D.1 del bloque 01**, que solo
admite `mismo/a`. Es una decisión de producto abierta, no un descuido.

### 2.2 Estados de sueño del ritual de noche — prioridad alta, lo toma el bloque 02

`ritualNoche.n6.states` — `['Tranquilo', 'Pensativo', 'Cansado', 'Inquieto', 'Otro']`.

**No se convirtió en el bloque 01 a propósito, y no es solo por alcance.** El valor
que se guarda es la propia palabra visible: `SelectorAnimo` escribe `"Cansado"` en
`dailyEntry.animo`, y `@lib/ritualManana` compara contra
`ANIMOS_DIFICILES = ['Cansado', 'Inquieto']` para decidir cómo saluda la mañana
siguiente. Convertir el copy sin separar antes el id del rótulo haría que a una
usuaria en femenino se le guardara `"Cansada"`, que ya no coincide con nada: el
saludo de día difícil dejaría de salir, en silencio.

Quien lo tome (bloque 02) necesita primero dar un id estable a cada estado y migrar
lo que ya esté escrito en IndexedDB. Es un cambio de datos, no de copy.

Fuera de `src/copy/index.js`, el mismo problema:
`src/lib/ritualManana.js:21` — `ANIMOS_DIFICILES = ['Cansado', 'Inquieto']`.

### 2.3 Frases sueltas — prioridad media

| Clave | Texto actual | Reformulación neutra sugerida |
|---|---|---|
| ~~`tagline`~~ | — | convertida en el bloque 01 (ver §1-bis) |
| ~~`insights.area.lowActivity`~~ | — | convertida en el bloque 01 (ver §1-bis) |
| `onboarding.p10.ready` | “Tu cuenta está lista.” | invariable (concuerda con “cuenta”) — sin cambio |
| `errors.generic.body` / `errors.syncFailed` | “Hemos guardado…”, “…sigue guardado.” | invariable (concuerda con “lo escrito”) — sin cambio |
| `onboarding.p8.suggestions.trabajo[0]` | “Dejar mañana preparado” | invariable (concuerda con “mañana” como objeto) — sin cambio |

Las tres filas que quedan se listan para que la próxima pasada no vuelva a abrirlas:
ya se revisaron y concuerdan con un sustantivo, no con la persona.

El barrido del bloque 01 revisó además estos falsos positivos, todos por concordancia
con un sustantivo y ninguno con la persona: `Solo`, `todo`, `mucho` (adverbios y
pronombres invariables), “la mente más tranquila”, “la misma amabilidad”, “Tu cuenta
está lista”, “Dejar mañana preparado”, “Si no sale solo”, y los valores de enum
internos (`activa`, `activo`, `lista`) que nunca se muestran.

### 2.4 Fuera de `src/copy/index.js`

`tagline` está duplicada en `package.json` (`description`), en el manifiesto PWA de
`vite.config.js` y en el `<meta name="description">` de `index.html`. Ahí no hay
variantes de género posibles, así que va la neutra. Los tres siguen hoy con la forma
masculina: cambiarlos es trabajo de metadatos, no de copy de pantalla, y no entró en
el bloque 01.

`src/lib/ritualManana.js:21` — `ANIMOS_DIFICILES` (ver §2.2).

---

## 3. Lo que NO entra en esta auditoría

- Los rituales, el diario y los hábitos escriben con el nombre de la persona y en
  segunda persona (“tú”), que no lleva marca de género. No hay nada que convertir ahí
  más allá de lo ya listado.
- Los nombres de las áreas y de los hábitos los escribe la persona: la app no los
  flexiona nunca.
