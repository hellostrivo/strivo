# Auditoría de género del copy existente

**Fecha:** 6 de agosto de 2026
**Origen:** §2.6 del documento de cambios v2.2
**Estado:** backlog. **Nada de esta lista se cambia todavía.**

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

## 2. Pendientes de convertir

### 2.1 Tabla de emociones (16 entradas) — prioridad alta

`copy.emotions.*` — todas en masculino: `Tranquilo`, `Agradecido`, `Motivado`,
`Ansioso`, `Cansado`, `Esperanzado`, `Irritable`, `Enfocado`, `Triste`, `Contento`,
`Abrumado`, `Curioso`, `Presente`, `Inseguro`, `Aliviado`, `Nostálgico`.

Es lo más visible de la app: se leen a diario en la Vista de Mañana y en el cierre de
la noche. Tres son invariables (`Irritable`, `Triste`, `Presente`) y no necesitan
variantes; las otras trece sí.

Nota para quien lo tome: la neutra de una emoción no siempre se puede reformular
(“Cansado” → “Con cansancio” cambia el registro). Es uno de los casos donde §2.5.4
autoriza `cansado/a`, pero conviene decidirlo entero de una vez y no entrada por
entrada.

### 2.2 Estados de sueño del ritual de noche — prioridad alta

`ritualNoche.n6.states` — `['Tranquilo', 'Pensativo', 'Cansado', 'Inquieto', 'Otro']`.
Mismo problema y misma decisión pendiente que la tabla de emociones. Conviene
resolverlos juntos: quien elige “Tranquilo” a las once de la noche está eligiendo la
misma palabra que en el diario.

### 2.3 Frases sueltas — prioridad media

| Clave | Texto actual | Reformulación neutra sugerida |
|---|---|---|
| `tagline` | “…terminar cada día en paz contigo mismo.” | “…terminar cada día en paz.” |
| `insights.area.lowActivity` | “Llevas un tiempo enfocado en {áreaActiva}…” | “Llevas un tiempo en {áreaActiva}…” |
| `onboarding.p10.ready` | “Tu cuenta está lista.” | invariable (concuerda con “cuenta”) — sin cambio |
| `onboarding.p5.hint` | “Se queda guardada aquí.” | invariable (concuerda con “cosa”) — sin cambio |
| `errors.generic.body` / `errors.syncFailed` | “Hemos guardado…”, “…sigue guardado.” | invariable (concuerda con “lo escrito”) — sin cambio |
| `onboarding.p8.suggestions.trabajo[0]` | “Dejar mañana preparado” | invariable (concuerda con “mañana” como objeto) — sin cambio |

Solo las dos primeras filas son trabajo real. Las demás se listan para que la próxima
pasada no vuelva a abrirlas: ya se revisaron y concuerdan con un sustantivo, no con la
persona.

### 2.4 Fuera de `src/copy/index.js`

`tagline` está duplicada en `package.json` (`description`) y en el manifiesto PWA de
`vite.config.js`. Si se cambia, hay que cambiarla en los tres sitios; ahí no hay
variantes de género posibles, así que la neutra debe ser la buena.

---

## 3. Lo que NO entra en esta auditoría

- Los rituales, el diario y los hábitos escriben con el nombre de la persona y en
  segunda persona (“tú”), que no lleva marca de género. No hay nada que convertir ahí
  más allá de lo ya listado.
- Los nombres de las áreas y de los hábitos los escribe la persona: la app no los
  flexiona nunca.
