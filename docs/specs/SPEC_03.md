# SPEC_03 — Formia: espacio de identidad

**Espacio:** Formia · **Depende de:** SPEC_02 · **Estimación:** 2 h

---

## 1. Objetivo

Construir el espacio donde la persona consulta y edita quién quiere ser: identidad central y hasta tres áreas. En Fase 0 esto era el paso R3 de un ritual secuencial; ahora es un lugar al que se entra cuando se quiere.

---

## 2. Dependencias

SPEC_02 (la identidad se lee y escribe en `formia/identity/`).

---

## 3. Fuente en el blueprint

- **§C3.0** Alcance de Formia
- **§C3.1** El eje estructural: identidad → hábito
- **§C3.3** Espacio de identidad (ex-R3) — **la sección central de esta spec**
- **§5.7.4** Etiquetado de área (heredada, sigue vigente)
- **§C0.5** Por qué el Ritual de Mañana se disolvió

---

## 4. Alcance

**Se construye:**

- Pantalla de identidad como **espacio consultable**: se entra, se lee, se sale. Sin secuencia, sin "siguiente", sin barra de progreso.
- Identidad central siempre visible y siempre presente (RN-ID-01: existe desde el onboarding).
- Las áreas seleccionadas con su identidad propia, color e icono.
- Edición de la identidad central con historial de versiones (`identityHistory`).
- Edición de la identidad de cada área.
- Selección y deselección de áreas, con el tope de 3.

**Lo que cambia respecto de Fase 0:** R3 era una pantalla que la persona atravesaba una vez cada mañana empujada por el ritual. Aquí no empuja nada. Nadie tiene que visitar este espacio ningún día concreto.

---

## 5. Modelo de datos

```
formia/identity/central     string        "alguien que crece"
formia/identity/areas       { [areaId]: { selected, identityText, color, icon, order, state } }
formia/identityHistory[]    { text, from, to }
```

- `state`: `"activa" | "pausada" | "archivada"`. Pausar un área **nunca** borra sus hábitos ni sus registros (RN-04).
- `identityText` es **opcional** por área. Un área seleccionada sin identidad propia es válida.
- Editar la identidad central cierra la versión anterior con `to` y abre una nueva. No se pierde nada.

Las 7 áreas: Salud, Trabajo, Relaciones, Espiritualidad, Crecimiento Personal, Finanzas, Creatividad. **Máximo 3 seleccionadas**, dentro y fuera del onboarding.

---

## 6. Componentes y archivos

```
src/pages/formia/Identidad.jsx           Pantalla raíz del espacio
src/components/formia/IdentidadCentral.jsx    Tarjeta destacada, editable
src/components/formia/AreaCard.jsx            Una por área seleccionada
src/components/formia/EditorIdentidad.jsx     Editor compartido (central y área)
src/components/formia/SelectorAreas.jsx       Elegir/quitar áreas, tope 3
```

**Jerarquía visual:** la identidad central va arriba, sola, con más peso tipográfico. Las áreas van debajo, en tarjetas del color de cada una. La central no es "una más": es la que siempre existe.

---

## 7. Reglas aplicables

| Regla | Implementación |
|---|---|
| **RN-ID-01** | La identidad central siempre existe. No puede quedar vacía; si se borra el texto, se restaura la versión anterior. |
| **RN-ID-04** | Un área se pausa sin perder historial. Se puede reanudar. |
| **RN-ID-05** | Ningún texto presenta poco registro en un área como un problema. |
| **RN-04** | Quitar un área no borra sus hábitos. Quedan vinculados y visibles. |
| **RN-DB4-01** | Esta pantalla **no lee `lumia/`**. Nada de journal, ánimo ni victorias aquí. |
| **Tope de 3** | Al intentar seleccionar una cuarta área, se explica el tope con calidez; no se muestra un error. |

**Caso a resolver con cuidado:** quitar un área que tiene hábitos vinculados. Los hábitos **no se borran ni se reasignan solos** (RN-DB4-08). Quedan apuntando a un área no seleccionada. SPEC_04 define cómo se muestran.

---

## 8. Copy

Todo en `src/copy/index.js`, namespace `formia.identidad`.

- Título del espacio: usa el vocabulario de Formia (construcción, dirección), **nunca** el de Lumia (ritual, reflexión, calma).
- Editor de identidad central: mantiene el patrón "Alguien que…" del onboarding.
- Editor por área: "En [ÁREA], quiero ser alguien que…"
- Área sin identidad propia: invitación suave, no hueco acusatorio.
- Tope de áreas: explica, no reprende.

---

## 9. Criterios de aceptación

1. Se entra al espacio y se sale sin completar nada. No hay paso obligatorio.
2. La identidad central se ve siempre, aunque no haya ninguna área seleccionada.
3. Editar la central crea una entrada en `identityHistory` con la versión anterior cerrada.
4. Seleccionar una cuarta área no es posible y el mensaje no culpa a nadie.
5. Pausar un área la saca de la vista activa sin borrar sus datos; reanudarla los devuelve intactos.
6. Un área seleccionada sin identidad propia funciona con normalidad.
7. `grep` del componente no encuentra ningún import de `lumia/`.

---

## 10. Fuera de alcance

- Hábitos: son SPEC_04, aunque cuelguen conceptualmente de aquí.
- Constancia y progreso: SPEC_05.
- Cualquier insight sobre la identidad: Fase 2 (§C4).
- El onboarding (P4, P4B, P4C): ya alimenta estos campos; esta spec construye la vista posterior, no el onboarding.
