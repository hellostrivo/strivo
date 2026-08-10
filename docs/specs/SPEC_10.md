# SPEC_10 — Lumia: transición de entrada

**Espacio:** Lumia · **Depende de:** SPEC_06 · **Estimación:** 1 h

---

## 1. Objetivo

Dar a la sección Mañana un umbral que no sea un wizard. La solución es no construir nada nuevo: **se reutiliza la transición de luz tenue con frase** que ya existe al entrar a la app.

---

## 2. Dependencias

SPEC_06.

---

## 3. Fuente en el blueprint

- **§C7.5** La "Mañana" de Lumia sin secuencia de ritual — **contiene la decisión y las tres reglas**
- **§C2.1** La disolución del Ritual de Mañana vista desde Lumia
- **Anexo E** Ritual de Mañana derogado — para saber qué **no** reconstruir

---

## 4. Alcance

**El problema que resuelve.** Al disolverse el wizard, la sección Mañana es una página. El pop-up de Fase 0 aportaba tres cosas —un umbral, un orden y un cierre— y las tres se perdieron. Sin nada, la mañana se siente como un formulario. Con demasiado, se reconstruye el wizard por la puerta de atrás, que es justo lo que la división quería eliminar.

**La solución:** la misma transición de luz tenue + frase aleatoria (repertorio de ~100 de gratitud y amabilidad) que ya se muestra al entrar a la app. Es un umbral, no una secuencia.

**Se construye:** la transición como componente reutilizable, y su uso al entrar a la sección Mañana.

---

## 5. Modelo de datos

Ninguno. La frase se elige al azar del repertorio; no se persiste cuál tocó.

---

## 6. Componentes y archivos

```
src/components/shared/TransicionLuz.jsx    Componente reutilizable
src/content/frases-apertura.js             Repertorio de ~100 frases, archivo aparte
```

**Un solo componente**, usado en la entrada a la app y en la entrada a Mañana. Si acabas con dos variantes, has empezado a construir algo específico de Mañana, y eso es el principio del wizard.

Las frases van en un **archivo de contenido**, nunca dentro del componente ni de esta spec.

---

## 7. Reglas aplicables

| Regla | Implementación |
|---|---|
| **RN-LU-MAN-01** | Es la misma pieza ya usada al entrar a la app, no una variante propia de Mañana. |
| **RN-LU-MAN-02** | No introduce pasos, no exige interacción, no puede convertirse en un wizard. Umbral, no secuencia. |
| **RN-LU-MAN-03** | La respiración diaria (SPEC_08) **no** forma parte de esta transición y no se dispara con ella. Sigue siendo voluntaria (RN-LU-RESP-01). |
| **Motion** | Duración calmada (~5 s en P1). Con `prefers-reduced-motion`, inmediata. |
| **Saltable** | Un toque la salta. Nadie tiene que esperar. |

**El riesgo de esta spec es de diseño, no de código:** cada cosa que añadas a esta transición —un segundo paso, un botón de "continuar", una pregunta— la acerca al wizard derogado. Si te ves añadiendo algo, revisa el Anexo E y comprueba que no lo estás reconstruyendo.

---

## 8. Copy

Namespace `shared.transicion`.

El repertorio de frases ya existe de Fase 0 (gratitud y amabilidad, ~100). Revísalo contra §3.6 antes de reutilizarlo: sin exclamaciones, sin promesas, sin lenguaje de coach.

---

## 9. Criterios de aceptación

1. La transición al entrar a la app y la de entrar a Mañana son **el mismo componente**.
2. No añade ningún paso ni exige ninguna interacción.
3. Se puede saltar con un toque.
4. No dispara la respiración diaria.
5. Con `prefers-reduced-motion`, es inmediata.
6. La frase se elige al azar y no se repite dos veces seguidas.
7. Las frases viven en `src/content/`, no dentro del componente.

---

## 10. Fuera de alcance

- Cualquier secuencia de más de una pantalla: sería el wizard.
- Transiciones distintas para la sección Noche.
- Personalizar la frase según el estado de ánimo o el historial.
- Reconstruir R2 (bienvenida dinámica): suprimido por completo (§C0.5, Anexo E).
