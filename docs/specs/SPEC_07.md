# SPEC_07 — Lumia: Journal, Historial y Ritual de Noche

**Espacio:** Lumia · **Depende de:** SPEC_02, SPEC_06 · **Estimación:** 3 h

---

## 1. Objetivo

Construir las tres piezas restantes de Lumia. La más delicada es el Ritual de Noche: **cinco pantallas, no seis**.

---

## 2. Dependencias

SPEC_06 (el Ritual de Noche se abre desde Hoy; el Historial lee lo que el Diario escribe).

---

## 3. Fuente en el blueprint

- **§5.6** Ritual de Noche — **leer la nota de v4.1 al principio de la sección**
- **§C7.7.1** Por qué se retiró N2
- **§5.4** Journal
- **§5.8** Historial
- **§C7.7.2** Alcance de la vista de día completo
- **§5.6.1** Hábitos en el Ritual de Noche — **DEROGADA, no implementar**

---

## 4. Alcance

### 4.1 Ritual de Noche — cinco pantallas

| ID | Pantalla |
|---|---|
| **N1** | Descompresión |
| **N3** | Nuevos logros |
| **N4** | Agradecimientos |
| **N5** | Estado de sueño y reflexión |
| **N6** | Síntesis y cierre (900 ms) |

**N2 no existe.** Era el checklist de hábitos y se retiró: era la única superficie de Lumia que leía y escribía datos de hábitos, la misma mezcla que motivó disolver el Ritual de Mañana.

**Los identificadores no se renumeran.** Las pantallas se llaman N1, N3, N4, N5, N6. El hueco es intencional y es historia de la decisión (§C0.7). No conviertas N3 en N2.

Consecuencias que hay que respetar:
- **RN-HR-01 y RN-HR-02 no aplican en la noche.** Marcar un hábito no tiene ninguna superficie nocturna que actualizar.
- **RN-RN-03** (ritual completable en menos de 90 s) se cumple con más holgura.
- N5 usa el rediseño de Fase 0: título "¿Cómo te vas a dormir?", subtítulo "Elige una o dos. No hay una forma correcta de cerrar el día", 9 opciones con género + "Algo más" de **una sola palabra**, máximo 2 selecciones.

### 4.2 Journal

- Editor sin fricción, autoguardado.
- Selector de emociones arriba, hasta 3, chips tipo píldora con emoji. **Aquí sí van las emociones difíciles** (a diferencia del Diario de mañana).
- Chip "+ Otra" de una palabra.
- Tarjetas de encabezado que separan secciones: "¿Cómo me siento?" / "Mi diario de hoy".
- **PIN opcional** de 4–6 dígitos: bloqueo de acceso, sin cifrado. Almacenamiento con PBKDF2 + SHA-256 en `lumia/pinConfig`. Recuperación por reautenticación de Firebase, sin perder entradas.
- Búsqueda simple.

### 4.3 Historial

- Calendario con puntos de ánimo.
- **Vista de día completo: únicamente contenido de Lumia** (§C7.7.2) — mañana, noche y journal. **Sin hábitos.**

---

## 5. Modelo de datos

```
lumia/journal/{entryId}    { date, text, emotions[], otherText, createdAt, updatedAt }
lumia/nightRitual/{date}   { inheritedWins, newWins, gratitude, learning,
                             sleepState, sleepStateOther }
lumia/pinConfig            { salt, hash, iterations, algorithm, enabled }
lumia/dayState/{date}      { mood }
```

`pinConfig` **no se sincroniza** con Firestore. Vive solo en local.

---

## 6. Componentes y archivos

```
src/pages/lumia/Journal.jsx
src/pages/lumia/Historial.jsx
src/components/lumia/RitualNoche.jsx          Orquestador de las 5 pantallas
src/components/lumia/ritual/N1Descompresion.jsx
src/components/lumia/ritual/N3Logros.jsx
src/components/lumia/ritual/N4Agradecimientos.jsx
src/components/lumia/ritual/N5EstadoSueno.jsx
src/components/lumia/ritual/N6Cierre.jsx
src/components/lumia/BloqueoPin.jsx
src/components/lumia/CuentaParaPin.jsx
src/components/lumia/CalendarioAnimo.jsx
src/components/lumia/VistaDiaCompleto.jsx
```

Nombra los archivos con el identificador real (N1, N3, N4…). Si alguien ve `N2` en el repo, algo se implementó de más.

---

## 7. Reglas aplicables

| Regla | Implementación |
|---|---|
| **§C7.7.1** | Cero hábitos en el Ritual de Noche. Ni lectura, ni escritura, ni conteo. |
| **§C7.7.2** | La vista de día completo no lee `formia/`. |
| **RN-DB4-01** | Ningún componente de esta spec importa `formia/`. |
| **§3.3** | El cierre nocturno nunca falla, ni con error de red. Si algo falla, el cierre sucede igual. |
| **RN-RN-03** | El ritual se completa en menos de 90 s. |
| **Sin campos obligatorios** | Cualquier pantalla del ritual se puede saltar. |
| **Género (P2A)** | N5 respeta femenino/masculino/neutro. El bug de Fase 0 ("Tranquilo" a una usuaria) no se reproduce. |
| **Motion** | Cierre de N6 a 900 ms; inmediato con `prefers-reduced-motion`. |

---

## 8. Copy

Namespaces `lumia.ritualNoche`, `lumia.journal`, `lumia.historial`.

- N5: los strings de Fase 0 ya están decididos, con formato `{ m, f, n }` por opción.
- Journal: emociones difíciles incluidas; el tono no las trata como un problema.
- PIN: el copy de bloqueo es cálido, nunca de seguridad corporativa.
- Ningún texto del ritual menciona hábitos, progreso ni constancia.

---

## 9. Criterios de aceptación

1. El Ritual de Noche tiene **cinco** pantallas y no hay ningún `N2` en el repo.
2. Ningún componente de esta spec importa `formia/`.
3. La vista de día completo no muestra hábitos.
4. N5 muestra el género correcto para una usuaria femenina.
5. "Algo más" acepta una sola palabra.
6. Máximo 2 selecciones de estado de sueño.
7. El PIN bloquea el acceso al Journal y se recupera por reautenticación sin perder entradas.
8. `pinConfig` no aparece en Firestore.
9. El ritual se completa en menos de 90 s sin escribir nada.
10. Con la red caída, N6 cierra igual.

---

## 10. Fuera de alcance

- Navegación por fecha en el Journal y "Descargar mi journal": fuera de alcance por decisión del 7 ago 2026.
- Cifrado del contenido del Journal (el PIN es bloqueo de acceso, no cifrado).
- Insights sobre el ánimo del calendario: Fase 2.
- Cualquier vista unificada Lumia+Formia: sería Strivo Intelligence, no Historial.
