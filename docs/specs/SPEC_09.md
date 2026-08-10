# SPEC_09 — Lumia: intención del día

**Espacio:** Lumia · **Depende de:** SPEC_02, SPEC_06 · **Estimación:** 1 h

---

## 1. Objetivo

Construir la intención del día (ex-R5) dentro del display de Hoy → Mañana, sin que colisione con la "gran visión" del Diario.

---

## 2. Dependencias

SPEC_06 (la intención vive dentro de la sección Mañana).

---

## 3. Fuente en el blueprint

- **§C2.4** Intención del día (ex-R5)
- **§C2.4.1** ¿"Intención" y "gran visión" son lo mismo? — **leer entera antes de tocar nada**
- **§5.3** Vista de Mañana (donde vive la gran visión)
- **§5.6** Ritual de Noche (donde la gran visión se recupera)

---

## 4. Alcance

**Son dos cosas distintas y no se fusionan.** Esta es la distinción que más fácil se pierde al implementar:

| | Intención (§C2.4) | Gran visión (§5.3) |
|---|---|---|
| **Naturaleza** | Adverbial: *cómo* quieres atravesar el día | Narrativa: *qué* tendría que pasar |
| **Forma** | 1 línea + 6 chips | 4–12 líneas de escritura |
| **Ejemplo** | "con calma" | "que la conversación con mi hermana salga bien y termine el informe" |
| **Dónde vive** | En el héroe de Hoy, todo el día | En el bloque 4 del Diario de mañana |
| **Campo** | `lumia/dailyIntention/{date}.intentionText` | `lumia/morningEntry/{date}.granVision` |
| **De noche** | No se recupera | Se recupera como contraste: "¿en qué se parece a lo que pasó?" |

Fusionarlas rompe el mecanismo nocturno: la pregunta *"¿en qué se parece a lo que pasó?"* no funciona sobre "con calma".

**Se construye:** la captura de la intención (campo de una línea + 6 chips sugeridos), y su presencia persistente en el héroe de la pantalla Hoy durante el día.

---

## 5. Modelo de datos

```
lumia/dailyIntention/{date}   { intentionText }
```

Una por día. Editable durante el día. No obligatoria: un día sin intención es un día normal.

---

## 6. Componentes y archivos

```
src/components/lumia/IntencionDelDia.jsx    Captura: campo + chips
src/components/lumia/HeroeHoy.jsx           Display persistente en Hoy
src/content/chips-intencion.js              Los 6 chips, archivo de contenido
```

---

## 7. Reglas aplicables

Las cuatro reglas de presentación de §C2.4 existen para que intención y gran visión **no se pisen** en la misma pantalla y no produzcan fatiga de escritura. Implementa las cuatro:

| Regla | Qué obliga |
|---|---|
| **RN-LU-INT-01** | Intención y gran visión no comparten superficie. Dos sitios distintos, dos momentos distintos. |
| **RN-LU-INT-02** | La intención se captura con un toque (chip) o una línea corta. Nunca invita a escribir párrafos. |
| **RN-LU-INT-03** | La intención permanece visible en el héroe todo el día; la gran visión no. |
| **RN-LU-INT-04** | De noche se recupera **la gran visión**, no la intención. |

Consulta §C2.4 para el enunciado exacto de cada una; si la numeración del documento difiere, manda el documento.

Además:

| Regla | Implementación |
|---|---|
| **RN-02** | Autoguardado inmediato al elegir chip o escribir. |
| **Sin obligatoriedad** | No hay día bloqueado por falta de intención. |
| **RN-DB4-01** | No lee `formia/`. La intención no se vincula a ninguna identidad. |

---

## 8. Copy

Namespace `lumia.intencion`.

- Los 6 chips son adverbiales: describen **cómo**, no **qué**. "Con calma", "sin prisa", "presente"… Si un chip se puede completar con un objeto directo, no es un chip de intención.
- El campo libre admite una línea. El placeholder no debe invitar a escribir de más.
- Estado sin intención: el héroe funciona igual, sin hueco acusatorio.

---

## 9. Criterios de aceptación

1. La intención y la gran visión son campos distintos en el modelo, y se ven en pantallas distintas.
2. La intención permanece visible en el héroe de Hoy todo el día.
3. El Ritual de Noche recupera la **gran visión**, no la intención.
4. Elegir un chip guarda al instante.
5. Un día sin intención no bloquea ni muestra ninguna señal negativa.
6. Los 6 chips son todos adverbiales.
7. La intención es editable durante el día y guarda la última versión.
8. Ningún import de `formia/`.

---

## 10. Fuera de alcance

- Fusionar, relacionar o comparar intención y gran visión: expresamente descartado en §C2.4.1.
- Vincular la intención a una identidad de Formia.
- Historial de intenciones o insights sobre ellas: Fase 2.
- Recordatorios de la intención durante el día.
