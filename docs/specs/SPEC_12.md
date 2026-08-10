# SPEC_12 — Aplicación de marca por espacio

**Espacio:** Transversal · **Depende de:** SPEC_11 · **Estimación:** 2 h

---

## 1. Objetivo

Aplicar la identidad visual de Lumia y Formia sobre una app que ya funciona. Va la última a propósito: la marca se aplica sobre algo terminado, no se construye con ella puesta.

---

## 2. Dependencias

SPEC_11 y, con ella, todo lo demás.

---

## 3. Fuente en el blueprint y el manual

- **`BRAND_MANUAL_STRIVO_LUMIA_FORMIA.md`** — **fuente única de color, símbolos y tipografía.** No inventes valores.
- **§C0.6** Identidad visual: referencia, no duplicación
- **§C0.2** Las tres marcas
- **Capítulo 12** Sistema de diseño (heredado)

El blueprint **no duplica** las paletas: remite al manual. Si un hex aparece en los dos sitios y difieren, gana el manual.

---

## 4. Alcance

**Se construye:**

- Extensión de `design-tokens.json` con las paletas por marca y momento: Lumia·Mañana, Lumia·Noche, Formia·Mañana, Formia·Noche.
- Aplicación de los tokens en cada espacio.
- Los tres símbolos vectoriales (`lumia_simbolo.svg`, `strivo_simbolo.svg`, `formia_simbolo.svg`), mismo viewBox 122×130.
- Tipografía Inter para las tres marcas, **diferenciadas por peso, no por familia**.

**Detalles del manual que conviene no “corregir”:**
- `#5D4766` en Formia·Noche **es intencional**: punto de convergencia cromática con Lumia al final del día. No es un error de contraste que haya que arreglar.
- `lumia-am-200` es `#E5C2DC`.

---

## 5. Modelo de datos

Ninguno. Los tokens son configuración, no datos de usuario.

---

## 6. Componentes y archivos

```
design-tokens.json                    Se extiende con las 4 paletas
src/styles/tokens-lumia.css           Variables CSS del espacio
src/styles/tokens-formia.css
src/assets/marca/lumia_simbolo.svg
src/assets/marca/formia_simbolo.svg
src/assets/marca/strivo_simbolo.svg
```

**Aplica los tokens por espacio con un atributo en la raíz del espacio** (`data-space="lumia"`), reutilizando el mecanismo `data-surface` que ya existía en Fase 0. Nada de colores incrustados en componentes.

---

## 7. Reglas aplicables

| Regla | Implementación |
|---|---|
| **§C0.6** | El manual es la fuente. Ningún hex se escribe a mano en un componente. |
| **Contraste AAA** | Verificar las cuatro paletas, especialmente los momentos de noche. |
| **`prefers-reduced-motion`** | Los patrones decorativos no animan si está activo. |
| **Tipografía** | Inter en las tres marcas. La diferencia es de peso. No introduzcas una segunda familia. |
| **Strivo** | La marca madre **no se usa directamente** (§C0.2). Su símbolo aparece solo donde el manual lo indique (splash, ajustes), nunca como espacio navegable. |

**Lo que queda pendiente en el manual** (v1.1) y por tanto fuera de esta spec salvo que se resuelva antes: espaciado del logo, versión monocromática, íconos de UI. Si te hace falta alguno, pregunta en vez de improvisarlo: es material de marca, no de código.

---

## 8. Copy

Ninguno propio. Esta spec no introduce texto.

---

## 9. Criterios de aceptación

1. Ningún hex escrito a mano en un componente; todo viene de tokens.
2. Las cuatro paletas pasan contraste AAA.
3. `#5D4766` está aplicado en Formia·Noche tal como el manual indica.
4. `lumia-am-200` es `#E5C2DC`.
5. Los tres símbolos comparten viewBox 122×130 y trazos redondeados.
6. Inter en toda la app; una sola familia.
7. Cambiar de espacio cambia la paleta sin recargar.
8. Los patrones decorativos no animan con `prefers-reduced-motion`.
9. Strivo no aparece como espacio navegable en ningún sitio.

---

## 10. Fuera de alcance

- Íconos de UI, espaciado de logo y versión monocromática: pendientes en el manual v1.1.
- Rediseñar cualquier componente. Esta spec **aplica** marca; no reabre decisiones de diseño.
- Ilustraciones nuevas.
- Assets para tiendas de aplicaciones.
