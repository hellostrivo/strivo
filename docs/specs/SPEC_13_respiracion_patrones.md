# SPEC_13 — Respiración: nuevo espacio con múltiples patrones

## Objetivo
Dar a la respiración su propio espacio dentro de Lumia, con variedad de patrones a elegir, en vez de un solo ejercicio (5-5-3) difícil de encontrar y sin alternativas.

## Contexto previo
- SPEC_08 ya implementó el ejercicio 5-5-3×3 con Web Audio API. Archivos existentes: `ritmoRespiracion.js` (lógica pura), `audioRespiracion.js` (Web Audio), `Respiracion.jsx` (componente agnóstico, vive en `components/shared/`, sin importar lumia/ ni formia/).
- El 5-5-3 se usa hoy en dos lugares que **no cambian** con esta spec: P1 (onboarding) y el momento diario de introspección de Lumia.
- Reglas cerradas que siguen aplicando: RN-LU-RESP-01 a 03 (voluntaria, saltable, sonido silenciado por defecto).

## Alcance de esta spec
Incluye: nuevo botón de navegación, pantalla de selección de patrón, ejecución de cada patrón reutilizando el componente existente parametrizado.
**No incluye:** selección de sonidos (eso es SPEC_14, depende de esta).

## Especificación funcional

### 1. Navegación
- Agregar un cuarto botón "Respiración" en la barra superior interna de Lumia, al mismo nivel que Hoy, Journal, Historial.
- Accesible en cualquier momento, no depende de si es de día o de noche.

### 2. Pantalla de selección de patrón
- Lista de los 4 patrones disponibles (ver tabla abajo), cada uno con nombre y descripción breve de una línea.
- El patrón 5-5-3 se marca visualmente como "Recomendado" (no bloquea elegir otro).
- Tocar un patrón lleva a la pantalla de ejecución (punto 3).

### 3. Pantalla de ejecución
- Reutiliza `Respiracion.jsx` tal cual, parametrizando las duraciones de cada fase según el patrón elegido — no crear un componente nuevo.
- Círculo naranja/dorado, misma identidad visual que el ejercicio existente.
- Saltable/cancelable en cualquier momento (RN-LU-RESP-02).
- Respeta `prefers-reduced-motion` (RN-LU-RESP-03).

### 4. Catálogo de patrones (contenido, no diseño — nombres redactados en voz propia de Lumia, no copiar de ninguna app externa)

| id | Nombre | Fases (segundos) | Ciclos por defecto | Cuándo usarlo (copy breve) |
|---|---|---|---|---|
| `553` | 5-5-3 | inhalar 5 / exhalar 5 / pausa 3 | 3 | Recomendado — el mismo ritmo de tu momento diario |
| `caja` | Respiración en caja | inhalar 4 / retener 4 / exhalar 4 / retener 4 | 4 | Para enfocarte o recuperar equilibrio |
| `478` | 4-7-8 | inhalar 4 / retener 7 / exhalar 8 | 3 | Calma profunda, antes de dormir |
| `exhalacion_larga` | Exhalación larga | inhalar 4 / exhalar 6 | 5 | Para soltar tensión en el momento |

Los valores de ciclos por defecto son sugeridos — ajustar si al probarlos la duración total se siente incoherente entre patrones (ej. que ninguno dure menos de ~15s ni más de ~90s).

## Modelo de datos
- Nuevo catálogo estático de patrones (no requiere persistencia por usuario en esta spec) — puede vivir como constante en el mismo archivo que hoy exporta la config de `ritmoRespiracion.js`, o en un archivo hermano `patronesRespiracion.js`.
- `ritmoRespiracion.js` debe aceptar un patrón como parámetro (fases + duraciones + ciclos) en vez de tener el 5-5-3 hardcodeado — verificar cómo está hoy y refactorizar si es necesario para que sea genérico.

## Copy
Agregar a `src/copy/index.js`: nombre y descripción de cada uno de los 4 patrones, título de la pantalla de selección, y cualquier microcopy de la pantalla de ejecución que hoy esté hardcodeada específicamente para "5-5-3". Correr `npm run lint:copy` al final.

## Reglas de arquitectura — confirmar antes de tocar
1. Este botón nuevo modifica la estructura de navegación de SPEC_06/07 (barra interna de Lumia). No toca la barra externa de dos espacios Lumia/Formia (SPEC_11). Confirmar que los tests existentes de la barra interna no se rompen.
2. El momento diario de introspección (5-5-3 en su ubicación actual) y P1 (onboarding) **no se tocan** — siguen funcionando exactamente igual, fuera de este nuevo espacio.
3. Si `ritmoRespiracion.js` se refactoriza para aceptar patrones parametrizados, correr toda la suite de tests de SPEC_08 (340 tests) para confirmar que el 5-5-3 original sigue pasando sin cambios de comportamiento.
4. `components/shared/**` sigue sin importar lumia/ ni formia/ (regla de lint ya impuesta) — el nuevo catálogo de patrones debe respetar esa frontera.

## Criterios de aceptación
- [ ] Botón "Respiración" visible y funcional en la barra interna de Lumia
- [ ] Los 4 patrones se listan con nombre + descripción
- [ ] 5-5-3 marcado como recomendado
- [ ] Cada patrón ejecuta con las duraciones correctas de la tabla
- [ ] Todos los patrones son saltables/cancelables
- [ ] `prefers-reduced-motion` respetado en los 4 patrones
- [ ] El 5-5-3 original (P1 y momento diario) sigue funcionando sin cambios, tests de SPEC_08 en verde
- [ ] Sin strings hardcodeados, `lint:copy` verde
- [ ] Sin cruces de arquitectura lumia/formia
