# SPEC_08 — Lumia: respiración diaria

**Espacio:** Lumia · **Depende de:** SPEC_06 · **Estimación:** 1 h

---

## 1. Objetivo

Construir la respiración diaria como **experiencia propia de Lumia**, no como umbral de un ritual. Era R1 en Fase 0; el ritual que la contenía ya no existe.

---

## 2. Dependencias

SPEC_06 (se accede desde la sección Mañana).

---

## 3. Fuente en el blueprint

- **§C2.3** Respiración diaria (ex-R1) — **la sección central de esta spec**
- **§6.12.1** Audio generado (heredada, sigue vigente)
- **§5.5.1** — **DEROGADA en v4.1.** Se conserva como historia. No la implementes: defendía el ritmo 4-4 con el argumento de que R1 era el umbral de un ritual, y ese ritual ya no existe.
- **§10.2** Decisión de Fase 0 sobre el ritmo

---

## 4. Alcance

**Ritmo vigente: 5-5-3, tres ciclos.** Cinco segundos de inhalación, cinco de exhalación, tres de pausa al final de cada ciclo. Círculo naranja/dorado. Audio generado con Web Audio API, sujeto a la preferencia de sonido.

**Duración total: ~39 segundos.** Es una práctica, no un gesto. Y eso obliga a lo siguiente:

> **RN-LU-RESP-01** — La experiencia es **enteramente voluntaria**: no se abre sola, no se dispara al entrar en la sección Mañana, no bloquea nada, y es saltable desde el primer segundo.

Esa regla no es un detalle de UX: es la condición que hace aceptables los 39 segundos. Si algún día se le añade activación automática, se convierte en un peaje diario y hay que revisar la decisión, no ignorarla.

**El mismo ritmo y los mismos tres ciclos aplican a la respiración de P1 en el onboarding** (RN-LU-RESP-02). Un solo componente sirve a los dos sitios.

---

## 5. Modelo de datos

Ninguno propio. Lee `shared/preferences.soundEnabled`.

La respiración **no se registra**: no hay `breathingLog`, no cuenta para constancia, no alimenta ningún insight. Es una experiencia, no un dato.

---

## 6. Componentes y archivos

```
src/components/shared/Respiracion.jsx    Componente único, usado por Lumia y por P1
src/lib/audioRespiracion.js              Web Audio API, tonos generados
```

Un solo componente con props de configuración. Dos implementaciones divergentes es exactamente lo que produjo la contradicción de Fase 0.

---

## 7. Reglas aplicables

| Regla | Implementación |
|---|---|
| **RN-LU-RESP-01** | Voluntaria, no automática, saltable desde el segundo 0. Botón de salida siempre visible. |
| **RN-LU-RESP-02** | Mismo ritmo y mismos 3 ciclos en P1 y en la respiración diaria. |
| **RN-LU-RESP-03** | `prefers-reduced-motion` → indicación estática, sin animación de escala. Preferencia de sonido persistida y respetada. |
| **§6.12.1** | Audio generado, no archivos. Control de silencio accesible durante la experiencia. |
| **Limpieza** | Al salir, se detiene el audio y se liberan los nodos. Salir a mitad de ciclo no deja sonido colgado. |

---

## 8. Copy

Namespace `lumia.respiracion`.

**Copy huérfano a redactar** (§C7.7.6): el texto de entrada. El de Fase 0 —*"Antes de empezar, respira una vez"*— **ya no sirve**: "antes de empezar" presuponía un ritual que venía después, y no viene nada después. Redacta uno que invite sin prometer una secuencia.

Restricciones: sin exclamación, sin lenguaje de meditación guiada, sin prometer un beneficio ("te vas a sentir mejor"). Invita, no vende.

---

## 9. Criterios de aceptación

1. Un ciclo dura exactamente 13 s (5 + 5 + 3); la experiencia completa, ~39 s.
2. No se abre sola en ningún caso. Entrar a la sección Mañana no la dispara.
3. Se puede salir en el segundo 1, sin confirmación ni penalización.
4. El círculo es naranja/dorado, no del color del fondo (bug de Fase 0).
5. Con `prefers-reduced-motion`, la indicación es estática.
6. Con el sonido silenciado en preferencias, no suena nada.
7. Salir a mitad de la experiencia detiene el audio y libera los nodos.
8. P1 del onboarding usa el mismo componente y hace tres ciclos.
9. No se guarda ningún registro de la respiración en ninguna colección.

---

## 10. Fuera de alcance

- Cualquier registro, conteo o constancia de respiraciones.
- Otros patrones de respiración configurables.
- Recordatorios para respirar.
- Reproducir el comportamiento de §5.5.1 (derogada).
