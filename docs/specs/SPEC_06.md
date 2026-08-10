# SPEC_06 — Lumia: Hoy y el Diario

**Espacio:** Lumia · **Depende de:** SPEC_02 · **Estimación:** 2,5 h

---

## 1. Objetivo

Construir la pantalla raíz de Lumia y las dos vistas del Diario. **Sin hábitos en ninguna de ellas** y **sin Ritual de Mañana**: no se elimina nada, se construye desde cero un Diario que nunca los tuvo.

---

## 2. Dependencias

SPEC_02.

---

## 3. Fuente en el blueprint

- **§C2.0** Alcance de Lumia
- **§C2.1** La disolución del Ritual de Mañana vista desde Lumia
- **§C2.6** Ausencia del bloque "checklist ritual" en el Diario
- **§5.2.2** La pantalla Hoy (heredada, con la resolución de §C7.7.3)
- **§5.3** Vista de Mañana del Diario
- **§C0.5** Por qué se disolvió el Ritual de Mañana
- **Anexo E** Ritual de Mañana derogado — **histórico, no implementable**

---

## 4. Alcance

### 4.1 Pantalla Hoy

- Tarjeta con la frase del día.
- Botones **Mañana** y **Noche**: ambas secciones accesibles siempre, a cualquier hora.
- Tema controlado por el botón, no por el reloj: Mañana → claro con texto oscuro; Noche → azul oscuro con texto claro. Cross-fade 320 ms, inmediato con `prefers-reduced-motion`.
- La tarjeta del ritual va en un tono distinto del fondo para que destaque.
- **Sin** el texto superior "Tu día está en curso…".
- **Sin enlace a Formia** (§C7.7.3). Los dos espacios se cruzan solo por la barra.

### 4.2 Vista de Mañana del Diario

Cinco bloques:

1. Frase del día
2. Agradecimientos — sugerencias solo tras **5 s de inactividad** en el campo
3. Emociones — 15 positivas con emoji, chips tipo píldora, **máximo 3**. Título: "¿Cómo me quiero sentir hoy?"
4. Gran visión — "¿Qué haría que hoy sea un gran día?", placeholder "Imagina tu día ideal"
5. Victorias — "Tres victorias que quisiera conseguir hoy"

**No hay sexto bloque.** El checklist de hábitos de Fase 0 no se construye (§C2.6).

### 4.3 Vista de Noche del Diario

Siete bloques: victorias heredadas con decisiones · nuevos logros · agradecimientos · aprendizaje · estado de sueño · síntesis · cierre.

**No hay bloque de checklist.** El progreso de hábitos vive únicamente en Formia.

---

## 5. Modelo de datos

```
lumia/morningEntry/{date}   { granVision, gratitude[], emotions[] }
lumia/victories/{victoryId} { text, date, state, identityRef?, originId? }
lumia/dayState/{date}       { mood }
```

**Victorias (§C7.7.5):** viven en `lumia/` con `identityRef` **opcional**. La asimetría con los hábitos es deliberada: un hábito es un compromiso de construcción y por eso exige identidad; una victoria es un hecho que ya ocurrió y no necesita justificarse ante ninguna.

El vínculo de una victoria se **deduce del texto** y solo se etiqueta si es claro (§5.3). **No hay selector "¿dónde vive esto?".**

---

## 6. Componentes y archivos

```
src/pages/lumia/Hoy.jsx
src/components/lumia/FraseDelDia.jsx
src/components/lumia/SelectorMomento.jsx     Botones Mañana / Noche + tema
src/components/lumia/DiarioManana.jsx
src/components/lumia/DiarioNoche.jsx
src/components/lumia/ChipsEmociones.jsx
src/components/lumia/CampoGratitud.jsx       Con sugerencias a los 5 s
src/components/lumia/ListaVictorias.jsx
src/content/frases-del-dia.js                Repertorio, archivo de contenido aparte
```

Las bibliotecas de frases van como **archivo de contenido**, no dentro del componente ni dentro de esta spec.

---

## 7. Reglas aplicables

| Regla | Implementación |
|---|---|
| **RN-DB4-01** | Ninguna pantalla de Lumia importa `formia/`. Ni un contador de hábitos, ni una etiqueta. |
| **§C7.7.3** | Sin enlace a Formia desde Hoy. El copy de Fase 0 *"Tu ritual de la mañana"* no se reimplementa. |
| **RN-02** | Autoguardado local inmediato en todos los campos de escritura. |
| **Contraste** | Fondo oscuro → texto claro. El bug de Fase 0 (texto negro sobre fondo nocturno) no se reproduce. |
| **Sin campos obligatorios** | Las dos vistas son saltables por completo. Nada bloquea. |
| **§3.6** | Emociones de la vista de Mañana: **solo positivas**. Las difíciles viven en el Journal (SPEC_07). |

---

## 8. Copy

Namespace `lumia.hoy` y `lumia.diario`.

Strings ya decididos, respétalos literalmente:
- "¿Cómo me quiero sentir hoy?" / "Elige las emociones que quieres cultivar"
- "¿Qué haría que hoy sea un gran día?" / placeholder "Imagina tu día ideal"
- "Tres victorias que quisiera conseguir hoy"
- Sugerencias de gratitud: tu familia · tu cuerpo · este momento · el silencio · lo que tienes

Género según `shared/profile.gender` (P2A). Prohibido "elle"; en neutro, redactar sin género.

---

## 9. Criterios de aceptación

1. Ni la pantalla Hoy ni ninguna vista del Diario muestran hábitos.
2. No existe ningún import de `formia/` en estos componentes.
3. No hay enlace a Formia en ninguna parte de Hoy.
4. Ambas secciones (Mañana y Noche) son accesibles a cualquier hora.
5. El tema lo controla el botón, no el reloj.
6. Con tema Noche, todo el texto es legible (contraste AAA verificado).
7. Las sugerencias de gratitud aparecen a los 5 s de inactividad, no antes.
8. Máximo 3 emociones; la cuarta no se selecciona y el mensaje no reprende.
9. Se puede salir de las dos vistas sin llenar nada.
10. El texto respeta el género elegido en P2A.

---

## 10. Fuera de alcance

- Journal, Historial y Ritual de Noche: SPEC_07.
- Respiración diaria: SPEC_08.
- Intención del día: SPEC_09 (se integra en el display de Mañana, pero se construye aparte).
- Transición de entrada: SPEC_10.
- Cualquier reconstrucción del Ritual de Mañana. Está derogado (Anexo E).
