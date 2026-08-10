# SPEC_02 — Capa de datos y modelo canónico

**Espacio:** Transversal · **Depende de:** nada · **Estimación:** 1,5 h

---

## 1. Objetivo

Reescribir `src/lib/db.js` con el árbol `shared/lumia/formia`, e imponer en la propia capa de datos las reglas que garantizan la separación de los dos espacios.

---

## 2. Dependencias

Ninguna. **Va primera y sola.** Todo lo demás escribe contra esta capa.

---

## 3. Fuente en el blueprint

Leer antes de escribir código:

- **§C5.1** Principio de partición
- **§C5.2** Árbol canónico
- **§C5.3** Extensiones necesarias del árbol
- **§C5.4** Cambios de campo respecto de v3.1
- **§C5.5** Reglas de integridad de `identityRef`

---

## 4. Alcance

**Se construye:**

- El árbol completo bajo `users/{uid}/`.
- Un módulo por espacio: `src/lib/db/shared.js`, `src/lib/db/lumia.js`, `src/lib/db/formia.js`, más `src/lib/db/index.js` que reexporta.
- Validación de escritura que rechaza un hábito sin `identityRef`.
- Persistencia local-first: IndexedDB como fuente inmediata, Firestore como sincronización asíncrona.

**No se construye:** ninguna pantalla. Esta spec no tiene UI.

---

## 5. Modelo de datos

```
users/{uid}/
├── shared/
│   ├── profile      { name, gender, diaTerminaA, wakeTime, sleepTime, createdAt }
│   ├── auth         { uid, email, phone }
│   ├── preferences  { soundEnabled, reducedMotion }
│   └── onboarding   { completedSteps, currentStep }
├── lumia/
│   ├── journal/{entryId}      { date, text, emotions[], otherText, createdAt, updatedAt }
│   ├── dailyIntention/{date}  { intentionText }
│   ├── morningEntry/{date}    { granVision, gratitude[], emotions[] }
│   ├── nightRitual/{date}     { inheritedWins, newWins, gratitude, learning,
│   │                            sleepState, sleepStateOther }
│   ├── victories/{victoryId}  { text, date, state, identityRef?, originId? }
│   ├── dayState/{date}        { mood }
│   └── pinConfig              { salt, hash, iterations, algorithm, enabled }
└── formia/
    ├── identity/central       string
    ├── identity/areas         { [areaId]: { selected, identityText, color, icon, order, state } }
    ├── identityHistory[]      { text, from, to }
    ├── habits/{habitId}       { name, identityRef, context, emoji, createdAt, state }
    └── habitLogs/{logId}      { habitId, date, completedAt }
```

**Campos que cambiaron respecto de v3.1** (§C5.4) — no arrastres los viejos:

| v3.1 | v4.1 |
|---|---|
| `Habit.areaId?` (opcional) | `habits.identityRef` **obligatorio** |
| `Habit.momento: enum(mañana,noche,dia)` | `habits.context: "manana" \| "noche" \| null` — solo etiqueta |
| `Habit.icono` | `habits.emoji` |
| `JournalPinConfig` | `lumia/pinConfig` |

`context` **no implica pertenencia a ningún ritual.** Es una etiqueta de momento del día y nada más. Que un hábito tenga `context: "noche"` no lo hace aparecer en el Ritual de Noche: ese ritual no muestra hábitos (§C7.7.1).

**Las 7 áreas** son un catálogo cerrado con `areaId` estables: `salud`, `trabajo`, `relaciones`, `espiritualidad`, `crecimiento`, `finanzas`, `creatividad`. Máximo 3 con `selected: true`.

---

## 6. Componentes y archivos

```
src/lib/db/
├── index.js      Reexporta los tres módulos. Único punto de import para la app.
├── shared.js     profile, auth, preferences, onboarding
├── lumia.js      journal, dailyIntention, morningEntry, nightRitual, victories, dayState, pinConfig
├── formia.js     identity, identityHistory, habits, habitLogs
├── schema.js     Definición de campos + validadores
└── sync.js       Cola local-first → Firestore
```

`lumia.js` **no importa** `formia.js` y viceversa. Si algún día hace falta cruzarlos, se hace en una capa nueva por encima, nunca dentro de estos módulos.

---

## 7. Reglas aplicables

| Regla | Implementación |
|---|---|
| **RN-DB4-01** | `lumia.js` y `formia.js` no se importan entre sí. Añade una regla de ESLint (`no-restricted-imports`) que lo impida. |
| **RN-DB4-05** | `createHabit()` lanza si `identityRef` es `null`, `undefined` o `""`. No hay valor por defecto. |
| **RN-DB4-08** | Ningún método corrige datos en silencio. Si un registro está incompleto, se devuelve tal cual y la UI decide. |
| **RN-02** | Toda escritura confirma contra IndexedDB antes de encolar el envío a Firestore. |
| **RN-06** | `habitLogs` solo tiene filas de completado. **No existe fila "falló".** La ausencia es ausencia. |
| **Bug de Fase 0** | Un hábito solo puede tener **un** log por día. Clave única `{habitId, date}`; marcar dos veces no suma. |

---

## 8. Copy

Ninguno. Esta spec no produce texto visible.

---

## 9. Criterios de aceptación

1. `createHabit({ name, identityRef: null })` lanza un error explícito, no guarda nada.
2. `createHabit({ name, identityRef: "central" })` guarda correctamente.
3. Un import de `formia.js` dentro de `lumia.js` falla el lint.
4. Marcar el mismo hábito cinco veces en un día produce **un** registro en `habitLogs`.
5. Con la red caída, una escritura persiste en IndexedDB y se sincroniza al volver, sin duplicarse.
6. El árbol creado en Firestore para un usuario nuevo coincide exactamente con §C5.2.
7. Los tres módulos tienen pruebas unitarias de sus validadores.

---

## 10. Fuera de alcance

- Cualquier pantalla o componente visual.
- Lógica de migración desde Fase 0 (no existe: ver SPEC_00 §2).
- Strivo Intelligence y cualquier lectura cruzada (Fase 2, §C4).
- Reglas de seguridad de Firestore más allá de "cada usuario ve solo su árbol".
