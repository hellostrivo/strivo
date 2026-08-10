# SPEC_04 — Formia: hábitos (H1, H2, H3)

**Espacio:** Formia · **Depende de:** SPEC_02, SPEC_03 · **Estimación:** 3 h

---

## 1. Objetivo

Construir la lista, el detalle y la creación de hábitos, con la regla que sostiene todo Formia: **ningún hábito existe sin una identidad detrás**.

---

## 2. Dependencias

SPEC_02 (validación de `identityRef`) y SPEC_03 (las identidades tienen que existir para poder vincularlas).

---

## 3. Fuente en el blueprint

- **§C3.1** El eje estructural: identidad → hábito
- **§C3.5** Alimentación de hábitos (ex-R4)
- **§C3.6** H3 corregido — captura obligatoria de la identidad
- **§C3.6.1** Captura de la identidad — mecanismo de sugerencia **(leer entera)**
- **§C3.9** La brecha de v3.1 y por qué se cerró
- **§5.7.4** Etiquetado de área
- **§5.3** Mecanismo de sugerencia por texto (heredado de victorias, se reutiliza)

---

## 4. Alcance

**H1 — Lista de hábitos.** Agrupada **por identidad**, no por momento del día. Ese es el cambio conceptual: en Fase 0 la lista se ordenaba por "mañana / noche" porque servía a un ritual. Ahora se agrupa por quién estás construyendo.

**H2 — Detalle de un hábito.** Nombre, emoji, identidad vinculada, contexto, y la vista de constancia de 90 días.

**H3 — Crear un hábito.** Cuatro campos como máximo: nombre, emoji, identidad, contexto. **La identidad es obligatoria.**

**Marcar un hábito.** Un toque. Sin modal, sin preguntas, sin confirmación (no-negociable §11.2 de `CLAUDE.md`).

---

## 5. Modelo de datos

```
formia/habits/{habitId}   { name, identityRef, context, emoji, createdAt, state }
formia/habitLogs/{logId}  { habitId, date, completedAt }
```

- `identityRef`: `"central"` o un `areaId`. **Nunca null** (RN-DB4-05).
- `context`: `"manana" | "noche" | null`. **Solo etiqueta.** No coloca el hábito en ningún ritual.
- Un log por hábito y día. Clave única `{habitId, date}`.

---

## 6. Componentes y archivos

```
src/pages/formia/Habitos.jsx                H1 — lista agrupada por identidad
src/pages/formia/HabitoDetalle.jsx          H2 — detalle + constancia
src/pages/formia/HabitoNuevo.jsx            H3 — creación
src/components/formia/HabitoItem.jsx        Fila con marca de un toque
src/components/formia/SelectorIdentidad.jsx Chips de identidad (central + áreas seleccionadas)
src/lib/sugerirIdentidad.js                 Motor de sugerencia por texto
```

---

## 7. Reglas aplicables

### 7.1 La captura de identidad en H3 (§C3.6.1)

| Regla | Implementación |
|---|---|
| **RN-FO-H3-04** | Al escribir el nombre, el motor busca señales claras ("correr", "gym", "dormir" → Salud; "reunión", "propuesta", "cliente" → Trabajo) y **sugiere** con un chip tenue. **Nunca asigna sola.** |
| **RN-FO-H3-05** | Sin señal clara, **el campo queda sin resolver**. No hay preselección automática, ni siquiera de la central. Guardar permanece deshabilitado. |
| **RN-FO-H3-06** | La sugerencia solo propone identidades existentes: la central o un área **seleccionada**. Nunca propone crear un área. |
| **RN-FO-H3-07** | Cambiar una sugerencia cuesta un toque. Sin mensaje de confirmación ni de error. |
| **RN-FO-H3-01** | El botón de guardar deshabilitado va **explicado**. Un botón gris sin motivo es un error de esta pantalla. |

El motor de sugerencia es el mismo mecanismo que §5.3 define para las victorias. **Reutiliza esa lógica, no escribas una nueva.** Si la implementación de Fase 0 no sirve (código descartado), reimplementa el mecanismo descrito en §5.3, no otro.

**Cobertura esperada del motor:** parcial y honesta. "Correr" acierta; "escribir 20 minutos" no. Eso no es un fallo del motor: es exactamente el caso que RN-FO-H3-05 cubre.

### 7.2 Reglas generales

| Regla | Implementación |
|---|---|
| **RN-01** | Marcar desde cualquier pantalla se refleja en todas. |
| **RN-03** | Los hábitos nunca bloquean nada. |
| **RN-06** | Constancia = `count(distinct fecha)`. Solo sube. Nunca se reinicia. |
| **RN-05** | Ningún texto sugiere que falte marcar algo. |
| **RN-04** | Un hábito de un área quitada **sigue existiendo y visible**. Se agrupa bajo esa identidad marcada como no activa. No se reasigna solo (RN-DB4-08). |
| **§5.7.4** | La etiqueta muestra **el nombre del área, o nada**. Nunca la frase de identidad completa. |

---

## 8. Copy

Namespace `formia.habitos`.

- **Copy huérfano a redactar** (§C7.7.6): confirmación al completar los hábitos de un momento. El texto de Fase 0 —*"Ritual completo. Buen comienzo."*— **no sirve**: usa vocabulario de Lumia dentro de Formia. Redacta uno nuevo en lenguaje de construcción, sin exclamación y sin celebrar de más.
- Explicación del botón deshabilitado en H3: dice qué falta, no que hayas hecho algo mal.
- Estado vacío de H1: invitación, no vacío acusatorio.
- Etiqueta de identidad no activa: neutra, sin sugerir que haya que arreglarlo.

---

## 9. Criterios de aceptación

1. H3 no permite guardar sin identidad, y el motivo está escrito en pantalla.
2. Escribir "salir a correr" sugiere Salud; la sugerencia se puede cambiar con un toque.
3. Escribir "escribir 20 minutos" no sugiere nada y el guardar sigue deshabilitado hasta elegir.
4. La sugerencia nunca propone un área no seleccionada.
5. H1 agrupa por identidad, no por momento del día.
6. Marcar un hábito es **un toque**, sin modal.
7. Marcar cinco veces el mismo día cuenta una.
8. Un hábito de un área quitada sigue apareciendo y no cambia de identidad solo.
9. La etiqueta muestra el nombre del área o nada; nunca la frase de identidad.
10. Ningún import de `lumia/`.

---

## 10. Fuera de alcance

- La vista de constancia agregada y las estadísticas: SPEC_05. Aquí solo la de 90 días del propio hábito (§5.7).
- Recordatorios y notificaciones.
- Cualquier hábito que aparezca en una pantalla de Lumia: **no existe ese caso** en Fase 1.
- Sugerencias de hábitos del onboarding (P7–P8): las alimenta el onboarding; esta spec construye la gestión posterior.
