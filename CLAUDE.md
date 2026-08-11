# CLAUDE.md — Consola ejecutiva de Strivo

**Última actualización:** 10 ago 2026 (v4.1 del blueprint — Fase 1: División Lumia/Formia)  
**Ubicación del blueprint completo:** `/docs/blueprint/Strivo_Blueprint_de_Producto_v4_1.md`  
**Manual de marca:** `/docs/blueprint/BRAND_MANUAL_STRIVO_LUMIA_FORMIA.md`  
**Referencia rápida:** este archivo es para sesiones de desarrollo. Si una decisión no está aquí, busca en los archivos de `docs/blueprint/`.

---

## 1. La esencia (lee esto primero)

**Strivo es un refugio digital donde el usuario termina cada día sintiéndose orgulloso, agradecido, en paz, regulado y esperanzado.**

**Fase 1:** Strivo se divide en dos espacios conceptualmente distintos bajo una marca paraguas:

- **Lumia** (Reflexión · hacia dentro): journal, rituales de introspección, diario del día. Pregunta central: ¿Cómo estoy?
- **Formia** (Acción · hacia delante): identidad, hábitos, construcción. Pregunta central: ¿Quién quiero ser?
- **Strivo** (marca madre): el puente inteligente que integra ambos.

**Una sola app con dos espacios navegables** — no dos apps en tiendas.

No es:
- Un rastreador de hábitos (no gamifica ni penaliza).
- Un coach productivo (no da órdenes).
- Una red social (no hay audiencia ni juicio externo).
- Un reemplazo terapéutico (es complementario, no diagnóstico).

**El diferenciador:** la app devuelve la evidencia propia del usuario en su lenguaje de identidad, sin juzgar. Todo hábito, victoria y logro *confirma* quién está intentando ser, nunca lo contradice.

---

## 2. Navegación de la app (estructura de 2 espacios + transversales)

```
┌──────────────────────────────────────┐
│  LUMIA o FORMIA (contenido dinámico) │
└──────────────────────────────────────┘
┌─ Lumia · Reflexión ─┬─ Formia · Acción ─┐
│  • Hoy (ritual)     │ • Identidad       │
│  • Journal          │ • Hábitos (H1)    │
│  • Historial        │ • Progreso        │
└─────────────────────┴───────────────────┘
```

**Lumia** (pestaña izquierda):
- **Hoy:** pantalla raíz. Contiene Ritual de Mañana + Ritual de Noche (modales) + Vista del Diario.
- **Journal:** escritura libre, sin estructura. Privable con PIN.
- **Historial:** calendario con puntos de ánimo, vista de día completo.

**Formia** (pestaña derecha):
- **Identidad:** gestión de identidad central y áreas (0..3 elegidas).
- **Hábitos (H1):** lista de hábitos activos por identidad.
- **Progreso:** constancia acumulativa, vista por identidad.

**Restricción arquitectónica (RN-DB4-01):** Lumia no lee `formia/`; Formia no lee `lumia/`. Solo Strivo Intelligence puede cruzarlos (Fase 2).

---

## 3. El modelo de identidad (§5.1.1 del blueprint v4.1)

**Regla de oro:** todo registrado pertenece a un **área** (o la central) y confirma la **identidad**, nunca la contradice.

```
┌─ Identidad central (1, siempre existe) ────────┐
│  "Alguien que crece"                           │
│  · Amplia, estable, emocional                  │
│  · No es una tarea ni un objetivo              │
│  · Se edita, con historial de versiones        │
└─ Áreas (0..3 elegidas en P3B) ───────────────┘
│  Salud · Trabajo · Relaciones · Espiritualidad
│  Crecimiento Personal · Finanzas · Creatividad
│  Cada área tiene:
│  - Ícono + color propio (§6.3)
│  - Identidad de área OPCIONAL ("En Salud, alguien que cuida su cuerpo")
│  - Puede pausarse/reanudarse sin perder historial
└─ Hábitos (RN-FO-H3) ─────────────────────────┘
   Cada hábito SIEMPRE tiene `identityRef` (obligatorio, nunca null)
   - "central" (identidad central)
   - areaId (una de las 3 áreas elegidas)
```

**Implicación arquitectónica:** ningún insight, reporte o feedback puede presentar "bajo registro en Salud" como fracaso (RN-ID-05).

---

## 4. Reglas de UX Writing

**§3.6 — Léxico prohibido (NUNCA aparece):**
- "Fallaste", "incumpliste", "abandonaste", "deberías", "debilidades".
- "Racha", "streak" (usamos "Constancia").
- "Tarea" (usamos "Hábito", "Victoria", "Logro" según contexto).
- Emojis del sistema (solo los 24 de §3.9 en tabla de emociones).
- Signos de exclamación, salvo en confirmaciones muy especiales.

**§3.6.4 — Tono:** cálido, cercano, sin condescendencia. Tuteo. Brevedad sin frialdad.

**Ejemplos que SÍ:**
- "Pausado. Aquí estará cuando lo quieras de vuelta."
- "Tu ritual de reflexión está libre. ¿Quieres escribir algo?"
- "Eres alguien que crece. En Salud lo demostraste 11 de los últimos 14 días."

**Ejemplos que NO:**
- "¡Felicidades por tu racha! ¡Vas muy bien!" ❌
- "Faltaste 3 hábitos. ¡Mañana será mejor!" ❌
- "Tu debilidad es la constancia." ❌

**Validar con:** `strivo-voice` skill antes de comitear cualquier string.

---

## 5. Tokens de diseño (completos en `design-tokens.json`)

**Tipografía:**
- Display: `Fraunces` (variable, soft, cálida) — títulos grandes.
- Interfaz: `Inter` (Regular / Medium / Semibold) — cuerpo, botones, labels.

**Colores de marca Lumia (mañana/noche):**
- Lumia Mañana: paleta clara, degradado amanecer dorado → naranja
- Lumia Noche: azul oscuro, punto de convergencia cromática con Formia

**Colores de marca Formia:**
- Formia Mañana: paleta clara y directa
- Formia Noche: púrpura/índigo

**Paleta compartida (ver §6 del BRAND_MANUAL):**
- Ink (texto principal): `#241E33`
- Paper (fondo claro): `#FBF8F4`
- Night (fondo oscuro): `#191428` (índigo violáceo, NO puro negro)
- Acentos: Amber, Plum, Sage, Clay, Mist (ver tabla en token).

**Espaciado:** base 4px. Escala 1,25× (4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 100).

**Motion:** duraciones **más lentas que lo normal**. Min 120ms, máx 900ms para cierre nocturno. Preferir easing smooth (ease-in-out). Respiración diaria: 5-5-3 ×3 ciclos (~39s), completamente saltable.

**Componentes:** radios 10–32px (ver tokens). Sin sombras de drop; usar elevación (2–8 dp). Haptics livianas, sin vibración en errores.

---

## 6. Reglas de negocio transversales (§4.12)

| Regla | Implicación |
|---|---|
| **RN-01** | Marcar un hábito desde cualquier pantalla se sincroniza en todas (Ritual, Vista, Lista). |
| **RN-02** | Sincronización local-first: se guarda en local al instante; la red es async. Si cae, la marca no se pierde. |
| **RN-03** | Cerrar un ritual sin marcar hábitos lo completa igual. Los hábitos nunca bloquean. |
| **RN-04** | Pausar o quitar un área nunca borra sus hábitos/victorias/logros. Se preservan íntegros. |
| **RN-05** | La app NUNCA sugiere "te falta un hábito en Salud" ni presenta un área con poco registro como problema. |
| **RN-06** | Constancia = `count(distinct fecha)`. Solo sube. Nunca se reinicia. Nunca se genera un "fallo". |
| **RN-07** | Suscripción: paywall máx. 2×/semana. Lo escrito siempre exportable. Nada se bloquea al cancelar. |
| **RN-08** | IA: ≤ 3 MXN por usuario premium/mes. Sin retención de datos, sin entrenar modelos con el contenido. |
| **RN-09** | Privacidad: ningún dato identificable de usuario en analítica. Protocolo de contenido sensible (§5.3.16). |
| **RN-10** | Acceso: 2 pestañas máximo en nav principal. Profundidad máxima 3 toques desde cualquier punto. |
| **RN-DB4-01** | Separación Lumia/Formia: Lumia no lee `formia/`; Formia no lee `lumia/`. |
| **RN-DB4-05** | Regla de datos: `identityRef` NUNCA es null en hábitos nuevos. Solo permitido en heredados de Fase 0. |

**Verifica estas antes de cada feature:** si viola una regla, no entra al MVP.

---

## 7. Criterios de aceptación recurrentes

Toda pantalla debe cumplir:

1. ✅ Ningún string contiene léxico prohibido (strivo-voice skill).
2. ✅ Contraste AAA + escalado 200% + modo reducir movimiento (strivo-a11y).
3. ✅ Marcar/editar/crear genera un log local que sincroniza después sin duplicarse (RN-02).
4. ✅ Estado vacío muestra invitación suave, no acusación (e.g. "Tu ritual está libre" no "Sin hábitos").
5. ✅ Error muestra copy amable + botón reintento, nunca código de error.
6. ✅ Offline: se guarda localmente, funciona sin red.
7. ✅ QA emocional (Anexo A del blueprint): 15 checks específicos según el módulo.

---

## 8. Estructura de datos (§C5 del blueprint v4.1)

**Árbol canónico `users/{uid}/`:**

```javascript
shared/ {
  profile: { name, gender, diaTerminaA, wakeTime, sleepTime, createdAt },
  auth: { uid, email, phone },
  onboarding: { completedSteps, currentStep }
}

lumia/ {
  journal/{entryId}: { date, text, emotions[], otherText, createdAt, updatedAt },
  dailyIntention/{date}: { intentionText },  // ex-R5
  nightRitual/{date}: { inheritedWins, newWins, gratitude, learning, sleepState },
  pinConfig: { salt, hash, iterations, algorithm, enabled }
}

formia/ {
  identity/central: string,
  identity/areas: { [areaId]: { selected, identityText, color, icon, order, state } },
  habits/{habitId}: { name, identityRef, context, emoji, createdAt },
  habitLogs/{logId}: { habitId, date, completedAt }
}
```

**Regla clave:** `habits.identityRef` es OBLIGATORIO: "central" | areaId. Nunca null (RN-DB4-05).

---

## 9. Fases del desarrollo

| Fase | Duración | Salida | Estado |
|---|---|---|---|
| **Fase 0** | 4 sem | Sistema de diseño + prototipo (8 bloques implementados) | ✅ Completada (5 testers validados) |
| **Fase 1** | 4–5 sem | División Lumia/Formia limpia, código nuevo, 12 specs | 🔄 EN CURSO (specs en generación) |
| **Fase 2** | 8 sem | Strivo Intelligence, Insights cruzados, Suscripción | Planificada |

---

## 10. Fase 1 — Especificaciones de implementación

**Estrategia:** Borrón y cuenta nueva (limpio, no incremental). Se descarta el código de Fase 0; se reutiliza stack, estructura, skills, CLAUDE.md.

**12 specs documentadas en `/docs/specs/`:**

1. **SPEC_00** — Guía de lectura (meta-spec)
2. **SPEC_02** — Capa de datos: `shared/lumia/formia` + RN-DB4
3. **SPEC_03** — Formia: espacio de identidad
4. **SPEC_04** — Formia: H1/H2/H3 + sugerencia por texto
5. **SPEC_05** — Formia: progreso y constancia
6. **SPEC_06** — Lumia: eliminar bloques Diario
7. **SPEC_07** — Lumia: disolver Ritual de Mañana
8. **SPEC_08** — Lumia: respiración diaria (5-5-3 ×3)
9. **SPEC_09** — Lumia: intención en Hoy → Mañana
10. **SPEC_10** — Lumia: entrada a Mañana (transición)
11. **SPEC_11** — Navegación: "Lumia · Reflexión" / "Formia · Acción"
12. **SPEC_12** — Aplicación de marca por producto

**Tiempo estimado:** 18 horas de código limpio, ~4 semanas a 10 h/semana.

---

## 11. Los no-negociables

1. **Identidad nunca se contradice:** un logro de trabajo confirma "alguien que crece", no lo viola.
2. **Marcar es un toque:** no puede ser un modal con preguntas. Una casilla, más nada.
3. **Cerrar el día es una ceremonia:** la secuencia de cierre (Ritual de Noche, N1–N6) nunca falla, ni siquiera si hay error.
4. **Local-first siempre:** la app funciona completamente sin red. Sync es async.
5. **Sin rachas, sin castigo:** Constancia solo sube. La no realización no genera notificación, alerta ni registro.
6. **Separación Lumia/Formia:** Los dos espacios viven en la misma app. No hay puente directo entre ellos (solo la barra). RN-DB4-01 se respeta siempre.

**Si una feature los violaría, no entra.**

---

## 12. Stack (sin cambios respecto a Fase 0)

- **Frontend:** React + Vite (PWA como prioridad).
- **Almacén local:** IndexedDB + Firebase Firestore para sync.
- **Auth:** Firebase Authentication.
- **Hospedaje:** Netlify + CI/CD automático desde GitHub.
- **Design tokens:** `/src/design-tokens.json` (consumir desde ahí, nunca hardcodear).
- **Copy:** `/src/copy/index.js` (biblioteca centralizada, no hardcodear).

---

## 13. Comandos rápidos para validación

Antes de hacer commit:

```bash
# Verifica que no haya léxico prohibido en strings
npm run lint:copy

# Verifica que todo Hábito tenga identityRef
# (depende de tu schema, pero la idea es que nada quede huérfano)

# Corre pruebas locales
npm run dev

# Verifica que no haya conflictos de merge
git status
```

---

## 14. Progreso de Fase 1

| Spec | Estado | Fecha |
|---|---|---|
| **SPEC_02** | ✅ Completa y comiteada | 10 ago |
| **SPEC_03** | ✅ Completa y comiteada | 10 ago |
| **SPEC_04** | ✅ Completa y comiteada | 10 ago |
| SPEC_05 | → Siguiente | — |
| SPEC_06–12 | Pendientes | — |

**Notas:**
- SPEC_02 pasó 7 criterios de aceptación
- SPEC_03 pasó sus 7 criterios (5 con prueba automática, 2 verificados en navegador)
- SPEC_04 pasó sus 10 criterios (9 con prueba automática, el de "marcar es un toque" verificado en navegador)
- npm run lint, test y build verdes · 99 pruebas
- npm run lint:copy tiene 7 avisos preexistentes (Fase 0), se resuelven en SPEC_06/SPEC_11

**Decisiones tomadas al implementar (no estaban escritas en ningún sitio):**
- **H1 agrupa por identidad** (SPEC_04 §4) y el momento del día sobrevive como etiqueta de fila y barra de progreso. §C3.5 hablaba de cabeceras por momento en H1; se leyó como lo heredado, no como lo vigente.
- **Sin `diasSemana` ni recordatorio.** §5.7 los describe, el modelo canónico de v4.1 no los recoge y el validador de SPEC_02 rechaza campos fuera de lista. En Fase 1 todo hábito activo cuenta para hoy.
- **Copy huérfano de §C7.7.6 redactado:** "Todo lo de esta mañana, hecho." / "Todo lo de esta noche, hecho."
- El motor de sugerencia (`src/lib/sugerirIdentidad.js`) es el mecanismo de §5.3 y lo reutilizarán las victorias de Lumia. No duplicarlo.
- `src/lib/habitAreaLabel.js` es el **único** sitio donde vive la regla de §5.7.4 (RN-HAB-AREA-01).

**Deuda consciente de Fase 1 (se salda en su spec):**
- `SesionProvisional.jsx` y la entrada por la pestaña "Tú" (con su conmutador Identidad/Hábitos) son andamios: los sustituyen el onboarding y SPEC_11.
- `src/tokens/index.js` mapea las áreas con ids viejos (`espiritual`, `personal`) y con emoji. El catálogo bueno es `AREA_CATALOG` de SPEC_02; la limpieza es SPEC_12.
- Los grises de texto van a `text-ink/80` como mínimo: por debajo no llegan a AAA sobre `paper`.
- El contorno de los días sin marca en la cuadrícula de constancia se mantiene tenue (~2.4:1) por decisión de §5.7. Lo que informa son los días llenos (5.4:1) y el resumen en texto que los acompaña.
- **No correr `npm run format`:** prettier no tiene configuración y sus valores por defecto (punto y coma, comillas dobles) contradicen el estilo de todo el repo.

---

Este archivo es **vivo**. Cada spec que cierre actualiza la tabla. Así Claude siempre ve dónde estamos.

Este archivo es **vivo**. Cada decisión nueva se añade aquí, no en otro lado. Así Claude siempre encuentra la fuente única de verdad.

---

**¿Dudas sobre algo de aquí? Pregunta antes de programar.**
