# SPEC_00B — Convenciones comunes de la fase de lanzamiento

**Versión:** 1.0 · 3 de septiembre de 2026
**Aplica a:** SPEC_17 a SPEC_27
**Estado:** Para revisión y aprobación antes de implementar cualquier SPEC

Este documento no se implementa por sí mismo. Es el contrato que todos los SPECs de esta fase asumen. Claude Code debe leerlo antes de cada SPEC.

---

## 1. Punto de partida (no negociable)

- Rama de trabajo: `strivo`. Netlify publica automáticamente desde ella.
- Rama `formia-paused`: **prohibido tocarla, leerla como referencia de implementación o reintroducir cualquier módulo de Formia**. Está bloqueada en GitHub a propósito.
- Rama `feat/onboarding-p1-p3c`: huérfana e incompatible. **No se porta ni se consulta.**
- Estado al arrancar: 1,373 pruebas en verde; `lint`, `lint:copy`, `lint:contraste`, `format:check` y `build` en verde. Cada SPEC debe entregar el repo al menos en ese mismo estado, con las pruebas nuevas sumadas.
- Secciones vigentes: **Hoy** (`/hoy`), **Journal** (`/journal`), **Respiración** (`/respiracion`), **Historial** (`/historial`), más el Home de Strivo y la transición de entrada con el símbolo.
- Rama de datos: `shared/` y `diario/` sobre el store `records` de IndexedDB. `breathing/` reutiliza el mismo store. Sync asíncrono a Firestore.
- Copy: **cero strings hardcodeados**. Todo texto visible vive en `src/copy/index.js`. `npm run lint:copy` lo impone.
- Tokens: `--strivo-*` desde `design-tokens.json`. Manual de marca v2.0: una marca, dos paletas (Mañana/Noche), un símbolo, tipografía Inter.
- Género: helper con forma `{ m, f, n }`. Prohibido "elle". En neutro, redactar sin género o con "mismo/a".

## 2. Reglas de arquitectura que ningún SPEC puede romper

1. Nada bloquea a la persona. Todo es saltable, salvo lo que la ley o las tiendas exijan explícitamente (y el SPEC lo dirá).
2. Contraste AAA verificado por `lint:contraste`. `prefers-reduced-motion` respetado siempre. Motion entre 120 y 900 ms.
3. Los componentes no importan de otras ramas de datos fuera de su dominio. El lint existente lo impone; no se relaja.
4. Silencio por defecto en cualquier sonido (§6.12 del Blueprint v5.0).
5. Sin estado "fallado", sin rachas que se rompen, sin contadores que castigan.
6. Nuevos object stores en IndexedDB solo si un SPEC lo justifica por escrito. Por defecto se reutiliza `records`.

## 3. Tono de todo texto nuevo

Sereno, cálido, íntimo, adulto, práctico y seguro. Prohibido: urgencia ("¡Solo hoy!"), gamificación punitiva, positividad forzada ("¡Tú puedes!"), lenguaje clínico ("ansiedad", "terapia", "síntomas", "salud mental"), signos de exclamación en textos de sistema, y cualquier afirmación de resultado ("te vas a sentir mejor").

Los textos que cada SPEC define son los **definitivos** salvo que se marquen como propuesta. Cualquier cambio de copy pasa por revisión de la fundadora, no por criterio de Claude Code.

## 4. Notación de decisiones pendientes

`DP-nn` marca una decisión que **la fundadora debe tomar antes de implementar** la parte afectada. Claude Code no asume una respuesta: si llega a un DP sin resolver, se detiene en ese punto, implementa lo que no depende de él y reporta.

## 5. Validaciones obligatorias al cerrar cada SPEC

```
npm run lint
npm run lint:copy
npm run lint:contraste
npm run format:check
npm run build
npm test            # o el comando de la suite vigente
```

Más la revisión manual en dispositivo descrita en el SPEC. Si el proyecto incorpora TypeScript en algún momento, se añade `npm run typecheck`; hoy el proyecto es JavaScript y no aplica.

## 6. Flujo de trabajo acordado

1. Claude Code lee este archivo y el SPEC completo.
2. Inspecciona los archivos que el SPEC nombra y **reporta cualquier desvío entre lo que el SPEC asume y lo que encuentra en el repo antes de escribir código**.
3. Implementa solo el alcance definido. Lo que está fuera de alcance no se toca aunque "esté al lado".
4. Corre las validaciones. Reporta pruebas nuevas, archivos tocados y desvíos con razonamiento.
5. La fundadora valida en navegador y en dispositivo. Solo entonces se aprueba el push.
6. Un commit por SPEC como mínimo; SPECs grandes se dividen en las fases que el propio SPEC marca, un commit por fase.

## 7. Dependencias nuevas

Cada SPEC lista las suyas. Regla general: se prefieren plugins oficiales de Capacitor (`@capacitor/*`) y, cuando no existen, los de `@capacitor-community/*`. Cualquier otra dependencia requiere justificación en el reporte de Claude Code y aprobación previa.

## 8. Orden global

| Orden | SPEC | Depende de |
|---|---|---|
| 1 | SPEC_17 Fase A (auditoría de sync y recuperación) | — |
| 2 | SPEC_19 Autenticación real | 17A |
| 3 | SPEC_20 Onboarding mínimo | 19 |
| 4 | SPEC_18 Paleta AM/PM | — (puede ir en cualquier momento; se coloca aquí por bajo riesgo) |
| 5 | SPEC_21 Capacitor iOS | 19 |
| 6 | SPEC_17 Fase B (adaptador SQLite) | 21 |
| 7 | SPEC_22 Recordatorios locales iOS | 21 |
| 8 | SPEC_23 Biométrico, háptica y audio en segundo plano | 21 |
| 9 | SPEC_24 Borrado de cuenta y exportación | 19, 17B |
| 10 | SPEC_25 Muro de pago (RevenueCat) | 19, 21 |
| 11 | SPEC_26 Capacitor Android | 21, 17B |
| 12 | SPEC_27 Recordatorios Android | 22, 26 |
