# SPEC_05 — Formia: progreso y constancia

**Espacio:** Formia · **Depende de:** SPEC_02, SPEC_03, SPEC_04 · **Estimación:** 1 h

---

## 1. Objetivo

Construir la vista donde la persona ve la evidencia acumulada de quién está siendo, organizada por identidad. Es el lugar donde Formia cumple su promesa: *actúa desde tu identidad, no desde tus hábitos*.

---

## 2. Dependencias

SPEC_04 (los `habitLogs` tienen que existir para poder agregarlos).

---

## 3. Fuente en el blueprint

- **§C3.7** Historial de constancia
- **§C4.3** Clasificación del catálogo de insights — para saber qué **no** entra aquí
- **§C7.4** Alcance de Strivo Intelligence en Fase 1
- **RN-06** Constancia acumulativa

---

## 4. Alcance

**Se construye:**

- Vista de progreso agrupada **por identidad**: cuánto se ha demostrado cada una.
- Constancia por hábito y agregada por identidad.
- El insight de **evidencia de identidad sin correlación**, único de Strivo Intelligence que entra en Fase 1 (§C7.4): *"Eres alguien que crece. En Salud lo demostraste 18 de los últimos 28 días."*

**Nota arquitectónica importante:** ese insight **solo lee `formia/`**. No cruza espacios. Por eso puede vivir dentro de Formia sin violar RN-DB4-01, y por eso Strivo Intelligence como capa no se construye todavía.

---

## 5. Modelo de datos

Solo lectura. No introduce campos nuevos.

```
formia/habitLogs/{logId}   → agregación por habitId y por identityRef
formia/habits/{habitId}    → para resolver identityRef
formia/identity/*          → para el texto de la identidad en el insight
```

**Cálculo de constancia (RN-06):** `count(distinct fecha)` sobre los logs. Solo sube. No se reinicia nunca. No existe el concepto de racha rota porque no existe la racha.

---

## 6. Componentes y archivos

```
src/pages/formia/Progreso.jsx                  Vista raíz
src/components/formia/ConstanciaPorIdentidad.jsx
src/components/formia/EvidenciaIdentidad.jsx   El insight de §C7.4
src/lib/constancia.js                          Cálculos puros, testeables
```

`constancia.js` sin dependencias de UI ni de red: entra un array de logs, sale un número. Así se puede probar sin montar nada.

---

## 7. Reglas aplicables

| Regla | Implementación |
|---|---|
| **RN-06** | Constancia solo sube. No hay reinicio, no hay racha, no hay "perdiste". |
| **RN-05** | Una identidad con poco registro **no se presenta como problema**. Sin colores de alarma, sin orden que ponga "lo peor" arriba, sin porcentajes de cumplimiento. |
| **RN-ID-05** | Ningún texto contradice la identidad. La evidencia confirma; nunca acusa. |
| **§C4.2** | El insight de evidencia se genera **por reglas**, no por IA. Sin coste, sin latencia, sin llamada externa. |
| **RN-DB4-01** | No se lee `lumia/`. Nada de ánimo, journal ni victorias en esta vista. |

**Umbral del insight:** solo aparece cuando hay evidencia suficiente para que la frase sea verdad. Con tres días de datos, la frase es ruido. Define un mínimo razonable y documéntalo en el código; si el blueprint no fija el número, elige uno conservador y déjalo en una constante nombrada, no incrustado.

---

## 8. Copy

Namespace `formia.progreso`.

- El insight sigue el patrón de §3.7: identidad + área + evidencia numérica. *"Eres alguien que crece. En Salud lo demostraste 18 de los últimos 28 días."*
- **Nunca** porcentajes de cumplimiento ni comparación con un objetivo.
- Estado sin datos: invitación tranquila, no vacío acusatorio.
- Prohibido: "racha", "cumpliste", "meta", "objetivo".

---

## 9. Criterios de aceptación

1. La constancia de un hábito marcado 5 veces en un día suma **1**.
2. Dejar de marcar una semana no reduce ningún número.
3. No aparece en ningún sitio la palabra "racha" ni un porcentaje de cumplimiento.
4. El insight de evidencia solo aparece con datos suficientes, y el umbral es una constante nombrada.
5. Una identidad con un solo registro se muestra sin ninguna señal de alarma.
6. `constancia.js` tiene pruebas unitarias que no montan componentes.
7. Ningún import de `lumia/`.

---

## 10. Fuera de alcance

- Cualquier insight que cruce conducta y ánimo: Fase 2 (§C4, §C7.4).
- Gráficas comparativas entre áreas: comparar áreas es exactamente lo que RN-05 prohíbe.
- Exportación de datos.
- Predicciones o proyecciones de ningún tipo.
