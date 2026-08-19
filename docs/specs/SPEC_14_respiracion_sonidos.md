# SPEC_14 — Respiración: sonidos seleccionables

**Depende de SPEC_13** (requiere que exista el espacio de Respiración con múltiples patrones antes de agregar esto).

## Objetivo
Reemplazar el control actual de sonido (encendido/apagado) por una selección entre varios sonidos, para que la persona elija el que prefiera como acompañamiento de su ejercicio de respiración — inspirado en la variedad que ofrecen apps como Pocket Breath Coach, pero con contenido y diseño propios de Lumia (ver nota de origen de audio abajo, es obligatoria).

## Contexto previo
- `audioRespiracion.js` (SPEC_08) ya maneja Web Audio API, con control de silencio y preferencia persistida, sonido silenciado por defecto (RN-LU-RESP-01), limpieza de nodos al salir.
- Hoy es binario: sonido activado o silenciado. Esta spec lo convierte en una selección entre varias opciones (o silencio, que sigue siendo una opción válida).

## Especificación funcional

### 1. Selector de sonido
- En la pantalla de ejecución de cualquier patrón de respiración (SPEC_13), agregar un control para elegir el sonido de acompañamiento.
- Opciones: "Silencio" (default, ya existente) + al menos 2-3 sonidos ambientales/tonos distintos.
- La selección se persiste como preferencia (extender el mismo mecanismo de persistencia que ya usa `soundEnabled`, ahora como `soundChoice` o equivalente).

### 2. Sincronización con las fases
- El sonido elegido debe sincronizarse con las fases del patrón activo (inhalar / retener / exhalar / pausa), igual que ya ocurre hoy con el 5-5-3 — no es un loop de fondo desconectado del ritmo.
- Debe funcionar correctamente con patrones de duraciones distintas entre sí (no asumir que todas las fases duran lo mismo que en 5-5-3).

### 3. Limpieza y accesibilidad
- Mantener la limpieza de nodos de audio al salir/cancelar (ya implementada, extender a los nuevos sonidos).
- El default sigue siendo silencio (RN-LU-RESP-01) — el usuario debe elegir activamente un sonido para escucharlo.

## Origen del contenido de audio — OBLIGATORIO confirmar antes de implementar
No usar, referenciar, ni intentar replicar archivos de audio de Pocket Breath Coach ni de ninguna otra app comercial. Dos caminos posibles, a decidir antes de escribir código:
1. **Sintetizar los tonos vía Web Audio API** (mismo enfoque ya usado en `audioRespiracion.js`) — osciladores simples, sin necesidad de archivos externos. Recomendado por consistencia técnica con lo ya construido.
2. **Audio pregrabado con licencia propia del proyecto** (comprado, de banco libre de regalías, o encargado) — si se elige este camino, es una brecha de contenido/diseño que debe señalarse y resolverse aparte, mismo patrón que los íconos de emoción pendientes. No incluir archivos de audio de origen dudoso en el repo.

Si no hay definición de cuál camino tomar, **detenerse y reportarlo** en vez de improvisar con audio de terceros.

## Alcance de la preferencia — confirmar antes de tocar
El momento diario de introspección (5-5-3 en su ubicación original) y P1 (onboarding) hoy solo tienen on/off de sonido. Definir:
- ¿La nueva selección de sonidos aplica **también** a esas dos ubicaciones (mismo estado de preferencia compartido), o
- ¿Queda **exclusiva** del nuevo espacio de Respiración (SPEC_13), y P1 / momento diario mantienen su control binario actual sin cambios?

No asumir una respuesta — confirmar con el usuario antes de decidir el alcance del estado compartido, ya que afecta el modelo de datos de `shared/`.

## Copy
Nombres y descripciones de cada sonido van a `src/copy/index.js`. Correr `npm run lint:copy`.

## Criterios de aceptación
- [ ] Selector de sonido visible en la pantalla de ejecución de cualquier patrón
- [ ] Al menos 2-3 sonidos disponibles además de "Silencio"
- [ ] Sonido sincronizado correctamente con las fases del patrón activo, para los 4 patrones de SPEC_13
- [ ] Preferencia de sonido persistida entre sesiones
- [ ] Default sigue siendo silencio
- [ ] Limpieza de nodos de audio confirmada al salir/cancelar, para cada sonido
- [ ] Ningún archivo ni referencia de audio proviene de Pocket Breath Coach u otra app de terceros
- [ ] Alcance de la preferencia (compartida vs. exclusiva del nuevo espacio) confirmado y documentado, no asumido
- [ ] Sin strings hardcodeados, `lint:copy` verde
