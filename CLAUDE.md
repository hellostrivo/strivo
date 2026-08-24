# CLAUDE.md — Consola ejecutiva de Strivo

**Última actualización:** 11 ago 2026 (v4.1 del blueprint — **Fase 1 cerrada**, doce specs)  
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

**Tipografía — `Inter` y solo Inter** (manual §5.1, aplicada en SPEC_12). Las tres marcas comparten
familia y se diferencian **por peso**: Lumia 400/500, Strivo 500/600, Formia 600/700. Fraunces y
Satoshi se retiraron: el manual manda sobre §6.4.1 del blueprint en todo lo tipográfico.
La escala va en `rem` para que escale con la preferencia del sistema.

**Colores de marca — el manual es la fuente única. Ningún hex se escribe a mano.**
Las cuatro paletas viven en `design-tokens.json` y se aplican con `data-space` + `data-moment`:
- Lumia · Mañana: claridad suave (`#F6F2E9`, `#DCCFF1`, `#E5C2DC`, `#F6DDE8`)
- Lumia · Noche: introspección profunda (`#6C5AA7` primario, `#8D82B6`, `#5A5568`, `#F3EFEA`)
- Formia · Mañana: energía cálida (`#F7F2E9`, `#E8D9C4`, `#FFC29C`, `#E9A387`)
- Formia · Noche: avance con propósito (`#B45A2B` primario, `#8F4A2F`, `#5D4766`, `#1F1D22`)

`#5D4766` en Formia·Noche **es intencional** (manual §4.7): el punto donde Lumia y Formia convergen
al final del día. No se corrige para alejarlo del morado.

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
| **SPEC_05** | ✅ Completa y comiteada | 10 ago |
| **SPEC_06** | ✅ Completa | 10 ago |
| **SPEC_07** | ✅ Completa | 10 ago |
| **SPEC_08** | ✅ Completa | 11 ago |
| **SPEC_09** | ⛔ Derogada (19 ago) | 11 ago |
| **SPEC_10** | ✅ Completa | 11 ago |
| **SPEC_11** | ✅ Completa | 11 ago |
| **SPEC_12** | ✅ Completa | 11 ago |
| **SPEC_13** | ✅ Completa (Fase 1C) | 20 ago |
| **SPEC_14** | ✅ Completa (Fase 1C) | 20 ago |
| **SPEC_15** | ✅ Completa (Fase 1C) | 20 ago |
| **SPEC_16** | ✅ Completa (Fase 1C) | 20 ago |

**Fase 1 cerrada.** Las doce specs están implementadas y comiteadas.

**Fase 1C — Respiración** (SPEC_13–16) es trabajo posterior al cierre: añade la herramienta
transversal de Respiración. SPEC_13 entrega motor, catálogo y datos, sin una sola pantalla.

**Notas:**
- SPEC_02 pasó 7 criterios de aceptación
- SPEC_03 pasó sus 7 criterios (5 con prueba automática, 2 verificados en navegador)
- SPEC_04 pasó sus 10 criterios (9 con prueba automática, el de "marcar es un toque" verificado en navegador)
- SPEC_05 pasó sus 7 criterios, todos con prueba automática
- SPEC_06 pasó sus 10 criterios: 7 con prueba automática y 3 verificados en navegador
  (tema por botón con las dos secciones a cualquier hora, contraste del tema Noche,
  y los 5 s de las sugerencias de gratitud)
- SPEC_07 pasó sus 10 criterios: 7 con prueba automática y 3 verificados en navegador
  (género femenino en N5, ritual de 5 pantallas sin escribir nada, y N6 cerrando con la red caída)
- SPEC_08 pasó 8 de sus 9 criterios: 5 con prueba automática y 3 verificados en navegador
  (duración real de 39 s, círculo naranja sobre el amanecer, y ningún `AudioContext` vivo al salir).
  El criterio 8 —P1 usa el mismo componente— no se puede ejercitar: no hay onboarding en Fase 1
- SPEC_09 pasó sus 8 criterios: 6 con prueba automática y 2 verificados en navegador
  (la intención sigue en el héroe al cambiar de sección, y el chip guarda en 272 ms)
- SPEC_10 pasó sus 7 criterios: 5 con prueba automática y 2 verificados en navegador
  (el umbral en los dos sitios con el contenido ya montado detrás, y ausente con "reducir movimiento")
- SPEC_11 pasó 7 de sus 8 criterios y el octavo a medias: los rótulos no se truncan a ningún ancho,
  pero el escalado al 200 % no funciona en toda la app por los tokens en px (deuda, la salda SPEC_12)
- SPEC_12 pasó sus 9 criterios: 7 con prueba automática, el contraste con `npm run lint:contraste`
  (que mide los 30 pares reales) y el cambio de paleta verificado en navegador
- npm run lint, test, build, lint:copy, lint:contraste y format:check verdes · 438 pruebas
- npm run lint:copy limpio: los 7 avisos de Fase 0 desaparecieron con SPEC_06
- **Deuda consciente:**
- RN-RN-01 (pop-up automático a las 19:00–23:59 + desactivación tras 3 rechazos) → FASE_2
  Requiere campos en nightRitual que SPEC_02 no recoge. Ritual accesible desde Hoy.

**Decisiones tomadas al implementar (no estaban escritas en ningún sitio):**
- **H1 agrupa por identidad** (SPEC_04 §4) y el momento del día sobrevive como etiqueta de fila y barra de progreso. §C3.5 hablaba de cabeceras por momento en H1; se leyó como lo heredado, no como lo vigente.
- **Sin `diasSemana` ni recordatorio.** §5.7 los describe, el modelo canónico de v4.1 no los recoge y el validador de SPEC_02 rechaza campos fuera de lista. En Fase 1 todo hábito activo cuenta para hoy.
- **Copy huérfano de §C7.7.6 redactado:** "Todo lo de esta mañana, hecho." / "Todo lo de esta noche, hecho."
- El motor de sugerencia (`src/lib/sugerirIdentidad.js`) es el mecanismo de §5.3 y lo reutilizarán las victorias de Lumia. No duplicarlo.
- `src/lib/habitAreaLabel.js` es el **único** sitio donde vive la regla de §5.7.4 (RN-HAB-AREA-01).
- `src/lib/constancia.js` es el **único** sitio donde vive el cálculo de RN-06. `formia/habitos.js` lo reexporta, no lo reimplementa.
- **La Constancia que muestra Formia cuenta días con algún hábito marcado**, no días de presencia. §5.9 la define sobre "cualquier registro", pero desde Formia no se ve el resto (RN-DB4-01). La cifra global cruza espacios y es de Fase 2. Por eso el copy dice "días construyendo" y no "días contigo".
- **Umbral del insight de evidencia:** `MINIMO_DIAS_CON_EVIDENCIA = 10` (de §5.9, criterio 1) sobre `DIAS_VENTANA_EVIDENCIA = 28` (del ejemplo de §C4.3). Por debajo no se muestra nada — ni una versión reducida, ni cuánto falta.
- **Las páginas de Formia usan `<div>`, no `<main>`:** el `<main>` lo pone el contenedor de la app. Dos anidados son HTML inválido y rompen el punto de referencia del lector de pantalla.

**Decisiones de SPEC_06 (Lumia: Hoy y Diario), 10 ago:**
- **Emociones de la mañana: 15 chips tipo píldora con emoji** (SPEC_06 §4.2). §5.3, §5.3.2 y §5.8.1 describen 16 tarjetas con ícono propio y "nunca emojis", y §5.8.1 dice expresamente que las ilustraciones "siguen siendo obligatorias en el Diario". Se decidió a favor de SPEC_06 con ese dato encima de la mesa. **Consecuencia para SPEC_07:** la mañana y el Journal comparten representación, así que el párrafo de §5.8.1 y la fila "Representación" de §5.3.2 quedan derogados. El catálogo baja a 15 retirando **"Abundante"**, el más cercano a "Próspero".
- **Sugerencias de gratitud a los 5 s**, no a los 6 de §5.3 (SPEC_06, criterio 7). Se descartan por sesión: dos descartes y no vuelven. Guardarlo por día necesitaría un campo que el modelo canónico no tiene.
- **Dos campos del blueprint no se construyen** porque no existen en el modelo canónico y SPEC_06 tampoco los nombra: la "acción pequeña" tras elegir emoción (§5.3, B3) y "¿Qué podría intentar diferente mañana?" (§5.4, B5). Si se recuperan en Fase 2, hay que ampliar `FIELDS` de SPEC_02 primero.
- **`nightRitual.inheritedWins` no se escribe.** Las victorias ya son registros con su propio estado; copiar aquí sus ids daría dos respuestas a la misma pregunta. El campo sigue en el modelo, sin uso.
- **`dayState.mood` tampoco se escribe.** `animoDerivado` es una vista de solo lectura (§5.4.1) y vive en `src/lumia/estadoSueno.js`. Lo consumirá el Historial de SPEC_07.
- **El id de una victoria es `fecha-posición-azar`.** §5.4 (criterio 1) exige presentarlas en el orden en que se escribieron y el modelo no les da ni campo de orden ni marca de tiempo: ordenar por id lo resuelve sin inventar un campo, y el sufijo evita colisiones entre dispositivos sin red.
- **El vínculo de una victoria con una identidad se deduce del texto y no se pinta.** §5.3 pedía un chip con las áreas de P3B, pero viven en `formia/` (RN-DB4-01). Se guarda para Strivo Intelligence (§C7.7.5) y en Lumia no se ve.
- **`mergePath` es atómico desde SPEC_06.** Leía y escribía en transacciones distintas, así que dos escrituras del mismo día se pisaban: marcar una emoción borraba el agradecimiento que iba en camino. Ahora lee y escribe dentro de una transacción, y `useDiario` además encola las escrituras para que la pantalla refleje siempre la última.
- **Tokens de superficie (§6.3.7):** las utilidades se llaman `text-on-surface`, `text-on-surface-soft` y `border-on-surface`. **No** `text-surface`: Tailwind ya genera esa clase desde el color `surface` y la que ganara dependía del orden del CSS, con texto casi blanco sobre fondo claro como premio. El token secundario sobre claro vale `#4F4A5A` y no el `#5B5470` de §6.3.7, que sobre `paper` se queda en 6,7:1 y no llega a AAA.
- **`Button variant="surface"`** para las pantallas que cambian de tema: `primary` sobre el fondo nocturno es tinta sobre tinta y `secondary` es un rectángulo blanco a las once de la noche.
- **60 frases del día**, con el mecanismo entero montado; se amplía en SPEC_12. RN-HOY-02 (365 sin repetir) se cumple hasta donde llega el repertorio, y `diasSinRepetir()` lo dice en voz alta.
- **`lint-copy` ya no revisa `__tests__`:** una prueba que comprueba que el léxico prohibido no aparece tiene que poder nombrarlo.

**Decisiones de SPEC_07 (Journal, Historial y Ritual de Noche), 10 ago:**
- **Dos citas de SPEC_07 §3 están desplazadas y no son contradicciones.** Dice "§5.4 Journal"
  y "§5.8 Historial"; en v4.1, §5.4 es la Vista de Noche, §5.8 el Journal y §5.10 el Historial.
  Y **§5.6.1 no está derogada**: es "N5 — Estado de sueño rediseñado" y está vigente. Lo derogado
  es su sub-apartado final, "Hábitos en el Ritual de Noche".
- **El Journal no tiene título, etiquetas `#`, ánimo por entrada, adjuntos ni plantillas.**
  `FIELDS.journal` de SPEC_02 es exhaustivo y los rechaza al escribir. La búsqueda va sobre el
  texto y sobre las etiquetas de emoción resueltas al género, no sobre los ids.
- **El interruptor del PIN vive dentro del Journal.** §5.8.2 lo sitúa en Perfil → Privacidad
  (§5.12.1), pero **§5.12.1 no llegó a escribirse en v4.1** —solo se la cita— y no hay spec de
  Perfil en Fase 1. Se mueve allí cuando exista.
- **La regla de copy del PIN se comprueba en una prueba, no en `lint-copy.js`.** "Seguro" y
  "Segura" son dos emociones legítimas del catálogo de la mañana: prohibir la palabra en todo
  `src/` rompería el build por un motivo equivocado. `pin.test.js` recorre `copy.lumia.journal.pin`
  entero, como SPEC_05 hizo con el vocabulario de rendimiento en `progreso`.
- **El punto de ánimo del calendario se deriva al vuelo, no se lee de `dayState.mood`.** Coherente
  con SPEC_06: `animoDerivado` es una vista y §5.4.1 prohíbe persistirla. Día con estado de sueño →
  su color de §6.3.5; día con algo escrito pero sin estado → `normal`; día sin nada → sin punto.
  La etiqueta de `normal` es **"Estuviste"** y no "Sin registrar": el día existió.
- **Sin pop-up automático del Ritual de Noche.** RN-RN-01 pide ventana 19:00–23:59, extensión de
  madrugada y desactivación tras tres rechazos; eso necesita "completado hoy" y "veces rechazado",
  dos campos que §C5 no recoge. Se entra desde la tarjeta de Hoy, como enlace discreto bajo la
  acción principal, porque §5.2 solo admite una acción principal por pantalla.
- **N6 no tiene ceremonia propia: reutiliza `CierreDelDia`.** El ritual y la Vista de Noche son dos
  caminos al mismo sitio (D-4.5); dos implementaciones del cierre serían dos que envejecen distinto.
- **Reautenticación del PIN por proveedor, no por enlace de correo ni SMS.** §5.8.2 describe correo
  o SMS, pero `src/lib/firebase.js` solo configura Google y Apple. El método de `shared/auth` decide
  **si** puede haber PIN (RN-JR-PIN-02); el proveedor decide **cómo** se verifica. Sin sesión de
  Firebase —que es el estado de toda la Fase 1— devuelve `sin-sesion` y se dice en pantalla.
- **Con el PIN puesto, el Historial no lee el journal.** La vista de día completo incluye journal
  (§C7.7.2) y lo estaba imprimiendo con la puerta cerrada. Ahora `cargarDia` no lo carga siquiera,
  y el Historial lo dice con una frase fija que no depende de si hay entradas: si apareciera solo
  cuando las hay, la frase estaría contando lo que el PIN tapa (RN-JR-PIN-01).
- **"Algo más" y "+ Otra" aplican el límite en el campo, no solo al guardar.** Aceptar dos palabras
  y guardar una es corregir en silencio. Corrige de paso el mismo comportamiento en `EstadoSueno`.
- **`ChipsEmociones` recibe catálogo y regla de selección.** Los dos catálogos siguen siendo
  distintos (15 positivas en la mañana, 15 con las difíciles en el Journal); lo que se comparte es
  la píldora, no el vocabulario.
- **El namespace `empty` de Fase 0 se retira.** Sus cuatro cadenas tenían dueño en otro sitio y
  ninguna se usaba ya.

**Decisiones de SPEC_08 (respiración diaria), 11 ago:**
- **El ritmo vive aparte del componente:** `src/lib/ritmoRespiracion.js`. SPEC_08 §6 solo nombra dos
  archivos, pero el criterio 1 —un ciclo de 13 s exactos— se mide sin React y sin Web Audio. Mismo
  patrón que `src/lib/constancia.js` en SPEC_05: la regla en un módulo puro y probable.
- **`Respiracion.jsx` recibe el copy por props.** Vive en `components/shared/` porque lo usan Lumia y
  P1 (RN-LU-RESP-02), y un componente compartido que alcanza un namespace de Lumia deja de serlo.
  Hay una **regla de ESLint nueva** que impide a `components/shared/**` importar `lumia/` o `formia/`.
- **La entrada está en Hoy, sección Mañana, como enlace discreto** bajo la acción principal, igual que
  el modo guiado de la noche. Al acabar los tres ciclos se cierra sola: el "avance automático" de R1
  sobrevive como **cierre** automático (§C2.3), porque ya no hay pantalla siguiente a la que ir.
- **Hay un botón "Empezar" antes del ejercicio.** RN-AUD-01 exige crear el `AudioContext` dentro del
  manejador del gesto; si arrancara al montarse, el gesto habría ocurrido en la pantalla anterior y
  el navegador entregaría un contexto suspendido. De paso es el control iniciar/pausar de §5.1.2.
- **`initShared` sembraba `soundEnabled: true` y contradecía §6.12.** "Silencio por defecto, todos los
  sonidos desactivados en la instalación" y A-03 dicen lo contrario de lo que hacía SPEC_02. Corregido
  a `false`. Es la primera spec con sonido de verdad, así que es la primera que lo nota.
- **La preferencia se lee de `soundEnabled`, no de `sonidoRespiracion`.** RN-AUD-03 nombra ese segundo
  campo, pero el modelo canónico solo tiene el primero y SPEC_08 §5 dice expresamente que se use.
  Consecuencia: silenciar la respiración silencia toda la app, que es lo que §6.12 describe de todos
  modos con su paleta de cuatro sonidos.
- **Un solo reloj gobierna el círculo y el tono** (§6.12.1). La escala se escribe sobre el nodo del DOM
  y no en el estado de React: sesenta renders por segundo para mover un círculo sería caro, y lo único
  que cambia de verdad —nueve veces en 39 s— es la fase.
- **Reducir movimiento cambia el cómo, nunca el cuánto.** Sin escala, opacidad fija por fase, y las
  duraciones intactas: la duración no es una animación, es el ejercicio (§6.10.1). El ritmo no expone
  ni un parámetro que permita acortarlo.
- **§5.5.1 no se implementa.** Está derogada: defendía el 4-4 con el argumento de que R1 era el umbral
  de un ritual, y ese ritual ya no existe.

**Decisiones de SPEC_09 (intención del día), 11 ago:**
- **SPEC_09 §7 y §C2.4.1 numeran distinto las mismas cuatro reglas** `RN-LU-INT-01..04`. No hay
  contradicción de fondo: las ocho afirmaciones son compatibles y se cumplen todas. Manda el
  blueprint, como la propia spec indica, y esa es la numeración que citan los comentarios.
- **`HeroeHoy` contiene la captura, no la duplica.** En la sección Mañana monta los chips; en la de
  Noche muestra la intención como texto, sin controles. Pintarla en el héroe *y* en un bloque aparte
  sería la misma cosa dos veces. "Se fusiona dentro del display de Hoy → Mañana" (§C2.4), literal.
- **La intención sigue visible al cambiar a la sección Noche.** §C2.4 conserva íntegro el criterio 6
  del ritual disuelto: permanece en Hoy toda la jornada. Mostrarla no es preguntar por ella; lo que
  la noche recupera —y lo hace en el Diario— es la gran visión.
- **`useDiario` gana un tercer espacio pendiente** junto a mañana y noche. La mañana y la noche
  acumulan campos; la intención es una línea y la última gana. Tocar un chip descarta lo que hubiera
  a medio escribir: si no, la escritura anterior volvería 800 ms después a pisar el chip.
- **El campo no lleva `maxLength`.** §C2.4.1 pide que no invite a escribir de más, y eso lo resuelve
  una línea con un marcador de posición corto. Un límite inventado cortaría a mitad de palabra.
- **Los chips van en `content/` y el resto del texto en `copy.lumia.intencion`.** Son material
  editorial, como las frases del día. Como `lint:copy` y la prueba de separación solo miran
  `copy.lumia`, hay una prueba que les pasa el mismo listón de voz.
- **No se usa `Chip.jsx` de `components/ui/`:** fija `text-ink` y `bg-surface`, y sobre el héroe
  nocturno sería tinta sobre tinta. Se sigue el patrón de `ChipsEmociones`, que hereda la superficie.
- **La gran visión no entra en el Ritual de Noche.** El criterio 3 se cumple por sus dos mitades: la
  Vista de Noche ya recupera la gran visión desde SPEC_06, y una prueba comprueba que **ninguna**
  superficie nocturna lee `dailyIntention`. La tabla de §5.6 no pone el contraste en ninguna de las
  cinco pantallas del ritual, así que SPEC_07 no lo construyó y aquí no se añade.
- **El riesgo de §C2.4.1 es hoy de dos campos, no de tres.** La "acción pequeña" de §5.3-Bloque 3 no
  existe: SPEC_06 decidió no construirla porque no está en el modelo canónico.

**Decisiones de SPEC_10 (transición de entrada), 11 ago:**
- **La pieza "ya implementada en Fase 0" no existía y hubo que escribirla.** RN-LU-MAN-01 y §8 dan
  por hecho que el componente y las ~100 frases se reutilizan de Fase 0, pero Fase 1 es borrón y
  cuenta nueva (SPEC_00 §2). No cambia el alcance, cambia el trabajo: **las 100 frases de
  `frases-apertura.js` son nuevas y están pendientes de revisión editorial.**
- **Se construyeron los dos usos, no solo el de Mañana.** El criterio 1 exige que la entrada a la app
  y la entrada a la mañana sean el mismo componente; con un solo uso, ese criterio no se puede
  ejercitar. La entrada a la app son diez líneas en `App.jsx`.
- **En Mañana se dispara al abrir la vista, no al mover el conmutador.** El conmutador solo cambia lo
  que muestra el héroe; cinco segundos ahí serían un peaje cada vez que alguien compara mañana y
  noche. El umbral va donde estaba el pop-up disuelto: justo antes del contenido.
- **Una vez por sesión, con una variable de módulo en `Hoy.jsx`.** Con el estado dentro del
  componente, ir al Journal y volver haría cruzar el umbral otra vez, porque `Hoy` se desmonta al
  cambiar de pestaña. No se persiste: SPEC_10 §5 no tiene modelo de datos.
- **Con `prefers-reduced-motion` no se muestra.** "Inmediata" leído literal: entrar es inmediato. Una
  pantalla quieta cinco segundos no es menos movimiento, es solo esperar.
- **El velo se monta sobre el contenido ya renderizado**, no en su lugar. Cuando la luz se va no hay
  nada que cargar ni ningún paso que dar: es un umbral, no una pantalla de carga.
- **El tema del velo va en `globals.css`, no en props.** `TransicionLuz` está en `components/shared/`
  y el lint de SPEC_08 le impide conocer Lumia. **La variante nocturna existe y resuelve
  correctamente (`#191428`), pero hoy ningún camino la monta bajo el tema de noche**: se abre solo
  desde la mañana. Está por el día que SPEC_11 mueva la entrada bajo la barra de dos espacios.
- **R2 no se reconstruye.** La bienvenida dinámica está eliminada de raíz (Anexo E, E.0) y una prueba
  falla si aparecen saludo, fecha o nombre dentro de la transición. Lo que sobrevive es el
  encabezado del héroe, que ya estaba desde SPEC_06.
- **Las pruebas de esta spec comprueban sobre todo lo que NO hay:** ni botón de continuar, ni
  pregunta, ni segundo fotograma, ni una segunda variante del componente. El riesgo de SPEC_10 es de
  diseño, y así queda vigilado por el `npm test` y no por la memoria de quien lo lea.

**Decisiones de SPEC_11 (navegación de dos espacios), 11 ago:**
- **Rótulos: opción A.** Era la última decisión abierta del proyecto (§C7.3) y queda cerrada.
  Pestaña `Lumia` / `Formia`; cabecera del espacio `Lumia · Reflexión` / `Formia · Acción`.
  **Por qué:** "Lumia · Reflexión" entero no es legible en una pestaña de móvil con escalado al
  200 %, y la opción B —pestaña `Reflexión` / `Acción`— deja las marcas fuera del uso diario y solo
  vivas en las tiendas. Con la A la marca se aprende abajo y el descriptor la explica arriba, que es
  exactamente el naming mixto que §C7.3 resolvió.
- **`RN-10` significa dos cosas distintas.** SPEC_11 §3 lo cita como "máximo de pestañas y
  profundidad", que es la regla de la tabla de este archivo. En el blueprint, **RN-10 es no pedir
  valoración en la tienda los primeros 21 días**. La regla implementada es **§4.3.2, punto 1**:
  profundidad máxima de tres toques. Conviene no citar RN-10 sin decir de cuál se habla.
- **`NavLumia` y `NavFormia` no existían.** No los construyeron SPEC_03 ni SPEC_04: los dos espacios
  se montaron entrando por los andamios provisionales. SPEC_11 §6 es la spec que los crea.
- **Son dos archivos casi idénticos y siguen separados a propósito.** SPEC_12 le da a cada espacio su
  paleta y sus símbolos: están a punto de dejar de parecerse, y factorizarlos ahora solo adelanta el
  trabajo de deshacerlo.
- **`SesionProvisional` no se retiró: se renombró a `ArranqueProvisional` y se movió a la raíz.** No
  es navegación —resuelve el uid y crea el árbol del usuario— y **ninguna spec de Fase 1 construye el
  onboarding**, así que retirarlo deja la app sin arrancar. Lo que sí desapareció entero son los dos
  conmutadores y el componente `Conmutador` que los sostenía.
- **`HashRouter`, no `BrowserRouter`.** La app se sirve como PWA estática; sin una regla de
  reescritura en Netlify, recargar en `/formia/habitos` daría un 404. Si algún día se quiere URL
  limpia, hay que añadir el `_redirects` **antes** de cambiar el router.
- **Cambiar de pestaña vuelve a la sección donde estabas**, no a la raíz del espacio (criterio 4). Se
  recuerda en una referencia, dentro de la sesión: entre sesiones se olvida a propósito (§10).
- **La cabecera del espacio va en una franja superior sobre `paper`.** Consecuencia: el degradado de
  Hoy deja de llegar al borde de la pantalla y queda por debajo de la franja. Es el precio de que la
  marca se lea, y **SPEC_12 puede revisarlo** cuando dé a cada espacio su superficie.
- **Las tres navegaciones usan los tokens de superficie**, no `text-ink`. La primera versión los fijó
  literales y la prueba de RN-SURF-01 lo cazó: sobre el tema que SPEC_12 va a dar a cada espacio,
  habría sido tinta sobre tinta.
- **La cabecera de Lumia lleva `z-30` y no es decorativo.** La pantalla Hoy pinta su degradado en una
  capa `fixed` que cubre la ventana entera; sin ese `z-30` la cabecera estaba en el DOM y era
  invisible. Queda por debajo de la barra (z-40) y de las secuencias de cierre (z-50), que sí mandan.
- **La ruta transitoria `/` no se recuerda como sección.** Al abrir la app la ruta pasa un instante
  por `/` antes de que el comodín redirija; guardarla dejaba la pestaña de Lumia apuntando a `#/` y
  sin marcarse activa. Solo se recuerdan rutas que empiezan por `/lumia/` o `/formia/`.

**Decisiones de SPEC_12 (aplicación de marca), 11 ago:**
- **Fraunces y Satoshi desaparecen. Inter para las tres marcas.** El manual §5.1 la fija como familia
  única y el criterio 6 pide "una sola familia"; el capítulo 12 lo concede en su preámbulo — la
  tipografía la manda el manual. `.font-display` **conserva su nombre y cambia de significado**: ya
  no elige familia sino **peso** (Lumia 500, Formia 700, §5.2), así que los veinte componentes que la
  usan no se tocaron. Esta spec aplica marca; no rediseña componentes.
- **La fuente va por npm, no por CDN** (manual §5.1): sin dependencia de red y sin mandar la IP de
  nadie a Google o Fontshare al abrir la app.
- **`data-space` + `data-moment` eligen la paleta; `data-surface` sigue eligiendo el texto.** Son dos
  capas y no se pisan, que es exactamente lo que dice la nota técnica del manual §4.8.
- **El momento del espacio lo decide el reloj.** Es la firma visual del producto (§6.1, principio 2).
  No choca con RN-HOY-05, que habla del tema de la pantalla Hoy: ese lo sigue mandando su conmutador.
- **La cabecera adopta el color de su espacio** y lleva su símbolo. Es lo que hace que cambiar de
  pestaña se note sin recargar (criterio 7).
- **Las cabeceras se quedan en el rango claro de cada paleta**, también en el momento noche. El tono
  nocturno entra por el acento y por el degradado de Hoy. Poner cromo oscuro sobre páginas claras
  —Journal, Historial— habría dejado una costura, y arreglarla era rediseñarlas.
- **El token de texto secundario se recalibró de `#4F4A5A` a `#3A3546`.** Estaba calibrado contra
  `paper` (8,1:1) y sobre las cabeceras teñidas caía a 5,5:1 — fuera de AAA sin que se viera a
  simple vista. Lo cazó `npm run lint:contraste`, que ahora mide los 30 pares reales de la app.
- **Los primarios de marca no llevan texto de cuerpo encima**, y no es un descuido: blanco sobre
  `lumia-pm-500` da 5,74:1 y sobre `formia-pm-600`, 4,73:1. Pasan AA y no AAA. Se usan como acento y
  como borde, donde el umbral es 3:1. El script los mide igual y los deja anotados como informativos.
- **`Constancia90.jsx` tenía un hex escrito a mano** (`#7E9E86`). Ahora sale de `--color-sage`. Era el
  único de toda la app y lo encontró la prueba del criterio 1.
- **El símbolo de Strivo aparece en un solo sitio**: el arranque de sesión, que es la superficie por
  encima de los dos espacios (§C0.4). Nunca como destino navegable (§C0.2).
- **Prettier no toca el CSS ni `design-tokens.json`.** Colapsa la alineación por columnas de los
  bloques de tokens y **pasa los hexes a minúsculas**, que es justo lo que rompe la comprobación de
  que cada hex de marca aparece literal en el manual. Está en `.prettierignore` con ese motivo.
- **Ya se puede correr `npm run format`.** El aviso de "no correrlo" era de cuando prettier no tenía
  configuración; ahora `.prettierrc` reproduce el estilo del repo y `format:check` está en verde.

**Ajustes posteriores al cierre de Fase 1:**
- **El conmutador Mañana/Noche es el primer elemento interactivo de Hoy, 19 ago.** Sube dentro de
  `HeroeHoy` justo debajo de la fecha, por delante de la frase del día y de la captura de intención.
  **Invierte el orden del Bloque 03** (frase → conmutador). La frase **no se retira**: baja un puesto
  y sigue siendo el aire previo a la primera pregunta. Motivo: elegir el momento decide de qué habla
  el resto de la pantalla, así que no puede llegar después de lo que gobierna.
- **El conmutador baja un escalón de luminancia** para no competir con la tarjeta del ritual: el
  contenedor pierde el relleno y el segmento activo pasa de `bg-lumia-tarjeta` a `bg-lumia-campo`.
  RN-HOY-07 exige que la tarjeta destaque **por luminancia y no solo por borde**, y con el conmutador
  arriba había dos superficies del mismo tono; ahora la tarjeta vuelve a ser la única del más claro.
- **`HeroeHoy` recibe el conmutador como hueco (`conmutador`), no lo construye.** El héroe no sabe
  qué momentos hay ni cómo se cambian: el estado sigue viviendo en `Hoy.jsx` (RN-HOY-05 intacta).
  Cuatro pruebas nuevas en `separacion.test.js` fijan el orden, el contratono y sus dos colores.
- **El bloque del conmutador va en contratono, 19 ago.** Mañana `#1D1833` (oscuro sobre la mañana
  clara) y Noche `#F2DDE7` (claro sobre el degradado nocturno). **Los dos hexes los fijó el
  propietario del producto y no salen del manual de marca**, que es la única excepción viva a "ningún
  hex se escribe a mano": viven en `globals.css` como `--lumia-conmutador`, nunca en un componente
  (RN-SURF-01), y `npm run lint:contraste` los mide como cualquier otra superficie con texto —14,9:1
  de día y 12,4:1 de noche, AAA los dos—. Si algún día entran al manual, se moverán a los tokens de
  marca. Son vecinos de dos colores que sí están en él (`night #191428`, `lumia-am-300 #F6DDE8`) sin
  ser iguales, así que **no** se sustituyen por ellos por su cuenta.
- **El bloque declara su propio `data-surface`** en vez de heredar el de la pantalla: es la única
  superficie de Lumia que contradice a su fondo, y así el texto se invierte solo. Sustituye al
  escalón de luminancia que se le había dado un rato antes (contenedor sin relleno, activo en
  `lumia-campo`): con un bloque en contratono, la tarjeta del ritual ya no compite con él porque no
  juegan en la misma escala.

- **El Diario se escribe dentro de Hoy, 19 ago.** Desaparece la tarjeta que anunciaba el día y su
  botón: `DiarioManana` y `DiarioNoche` se montan empotrados bajo el héroe, y la sección elegida en
  el conmutador es la que se escribe. **No había ruta que retirar**: el Diario siempre fue una vista
  interna de `Hoy.jsx`, nunca una URL. El Diario de **días pasados** no se toca — vive en
  `VistaDiaCompleto` (Historial), que es otro componente y de solo lectura.
- **Lo que colgaba de ese botón, y dónde está ahora.** No había analítica ni ningún registro de
  "abrió su día" (nada se pierde en silencio). El **umbral de luz** (SPEC_10) pasa del clic al
  primer momento en que la mañana está en pantalla, una vez por sesión, y espera a `carga === 'lista'`
  para que el velo no caiga sobre una pantalla en blanco. `onHideNav` deja de usarse para el Diario:
  la barra de dos espacios se queda visible mientras se escribe. Los dos enlaces secundarios
  —respiración y modo guiado— salen de la tarjeta y van bajo el conmutador; siguen siendo las dos
  únicas superficies a pantalla completa.
- **El estado "hecho" de RN-HOY-03 se retira.** "Ya definiste tu día. Míralo cuando quieras." vivía en
  esa tarjeta; con el contenido a la vista, decirlo es contarle a alguien lo que está leyendo. La
  regla dice **cómo** se comunica lo hecho, no que tenga que haber una línea.
- **El CTA final de la mañana ("Comenzar mi día" / "Salir") se retira.** No hay a dónde volver y el
  guardado ya ocurre al escribir y al salir del campo; un botón ahí sugiere que sin tocarlo no se
  guardó. **"Cerrar mi día" no es ese botón y se queda**: es la ceremonia del Bloque 7 de §5.4. Al
  terminar ya no sale de ninguna pantalla, solo cierra el velo y deja el día debajo.
- **`mananaEscrita` y `nocheEscrita` (`src/lumia/diario.js`) se quedan sin ningún consumidor.** Eran
  para el estado "hecho". Siguen exportadas y probadas; si nadie las reclama, se retiran.

- **La respiración es la entrada de las dos secciones, 19 ago.** El enlace de la noche —"Cerrar mi
  día paso a paso · Tres minutos, guiado"— se retira y en su sitio va el mismo enlace de la mañana.
  Un solo enlace, sin ramas: lo que cambia entre secciones es la paleta, no el destino.
- **El acento de la respiración tiene versión nocturna.** `--color-breath` era el naranja del
  amanecer (`#E8A54A`) para toda la app; de noche se pinta sobre un degradado frío y oscuro, que es
  justo el fondo contrario al que lo eligió §6.3.9. Bajo `[data-lumia='noche']` toma `lumia-am-100`
  (`#DCCFF1`), de la paleta de la noche: 12,2:1 sobre el extremo oscuro del degradado.
- **El círculo de la respiración no se mide contra el 3:1 de WCAG 1.4.11**, y consta en el script: la
  fase la dice el texto con `aria-live` —"Inhala", "Exhala", "Descansa"—, el círculo es el ritmo y no
  el dato. Al medirlo salió que **el círculo de la mañana está en 1,66:1 sobre el amanecer** desde
  SPEC_08. Queda anotado como informativo, no como fallo.
- **El Ritual de Noche guiado se retira entero, 19 ago.** **Cerrar el día es escribir la sección
  Noche del Diario, y no hay nada adicional.** Se borraron `RitualNoche.jsx`, las cinco pantallas de
  `components/lumia/ritual/`, el módulo de pasos `src/lumia/ritualNoche.js`, su prueba, el namespace
  `copy.lumia.ritualNoche` y la animación `.respiracion-lenta`, que solo usaba N1. **Deroga la parte
  de SPEC_07 que construía el recorrido de cinco pantallas** (N1, N3, N4, N5, N6) y deja sin objeto a
  RN-RN-01, que ya estaba aplazada a Fase 2 por otro motivo.
- **Lo que NO se fue con él:** la ceremonia de cierre (`CierreDelDia`, §5.4 Bloque 7) sigue al final
  de la sección Noche —era la mitad compartida (D-4.5)—, y `EstadoSueno` y `CampoGratitud` siguen
  donde estaban. En datos no cambia nada: la colección canónica se sigue llamando `nightRitual` y es
  donde escribe la noche. `isRitualNocheWindow()` de `lib/timeSlot.js` se queda: es la ventana
  horaria, no el recorrido, y nadie la llama todavía.

- **La intención del día se retira entera, 19 ago. SPEC_09 queda derogada.** Se fueron
  `IntencionDelDia.jsx`, `content/chips-intencion.js`, `copy.lumia.intencion`, el tercer espacio de
  `useDiario`, `guardarIntencion` en `lumia/diario.js` y **la colección `lumia/dailyIntention` con su
  campo `intentionText`** de `schema.js` y `lib/db/lumia.js`. La mañana conserva sus dos preguntas:
  emociones y gran visión. El archivo de la spec **se conserva marcado como derogado** —igual que el
  Anexo E—, con el detalle de qué se borró y por qué.
- **Reabre §C2.4 y §C2.4.1 del blueprint, y es una decisión consciente.** Esa sección decidió que
  intención y gran visión son conceptos distintos y no fusionables; sigue siendo cierto en su
  literal —no se fusionaron— pero una de las dos deja de existir. **La documentación está pendiente
  de reescribir esa sección**; con ella caen `RN-LU-INT-01..04`. No bloquea el código.
- **Los datos ya escritos se quedan inertes.** Ningún camino lee `lumia/dailyIntention` y nada lo
  borra: `COLLECTIONS` es solo una etiqueta al escribir y la cola de sincronización trabaja por ruta,
  así que un registro viejo no rompe ninguna lectura histórica. No se migró nada a `granVision`: eso
  mezclaría los dos conceptos que §C2.4.1 separó.
- **Ninguna otra superficie lo leía**, comprobado antes de retirarlo: ni Historial, ni
  `VistaDiaCompleto`, ni la sección Noche —SPEC_09 dejó una prueba de que ninguna superficie nocturna
  lo tocaba—, ni Formia. Hoy una prueba recorre `src/lumia`, `src/pages/lumia`, `src/components/lumia`
  y `src/lib/db` entero y falla si `dailyIntention` o `intentionText` reaparecen.

- **Las emociones abren la sección Mañana, 19 ago.** "¿Cómo me quiero sentir hoy?" pasa a ser la
  primera pregunta, justo debajo de la frase del día; agradecimientos, gran visión y victorias
  conservan su orden relativo. **Invierte el orden de §5.3**, que ponía los agradecimientos primero:
  la pregunta que se responde con un toque abre la pantalla y las que piden escribir vienen después.
- **Los dos temporizadores no dependen del orden**, comprobado antes de mover nada: las sugerencias
  de gratitud (5 s) cuentan dentro de `CampoGratitud` desde que se monta y desde cada tecla, y la
  pista de la gran visión (8 s) arranca al escribir y borrar. Ninguno mira si su bloque está a la
  vista, así que bajarlos en la pantalla no los altera.

- **Las ideas de gratitud son de un renglón, no del bloque, 19 ago.** La regla sale del componente y
  vive en `src/lumia/sugerenciasGratitud.js`: se ofrecen cuando el foco está en **ese** renglón, ese
  renglón está vacío y lleva 5 s sin recibir una tecla. Antes había un solo `visibles` y un solo
  temporizador para los tres, con la condición `filas.every(vacía)`, así que aparecían solas a los
  5 s de montarse la pantalla —sin que nadie estuviera en el bloque— y no volvían nunca en cuanto
  había una línea escrita. Ahora los tres nacen en blanco y el segundo y el tercero conservan su
  oferta aunque el primero esté escrito.
- **El panel se pinta bajo el renglón enfocado**, no al pie del bloque. `FilasDinamicas` gana tres
  props opcionales —`onEnfocar`, `onDesenfocar` y `debajoDeFila`— y quien no las pasa (victorias,
  logros) no nota nada. Es el mismo componente, así que la sección Noche hereda el arreglo.
- **Los botones de idea no roban el foco** (`onMouseDown` con `preventDefault`) y salir del campo no
  las apaga si el foco se fue a ellas —se comprueba con `relatedTarget`—. Sin las dos cosas, tocar
  una idea desenfocaría el renglón y el panel se iría antes de recibir el toque.
- **El silencio por descartes sigue siendo del bloque y de la sesión.** Dos "Ahora no" en cualquier
  renglón y las ideas se callan en los tres. Lo decidió el propietario del producto: la instrucción
  era sobre el disparador, no sobre cuánto insiste la app. **El repertorio no se tocó** —tu familia,
  tu cuerpo, este momento, el silencio, lo que tienes— y una prueba lo fija por si acaso.
- **La gratitud de la mañana se dice en dos alturas, 19 ago.** Bajo la pregunta, un `lead` que no
  pide nada —"Siempre hay algo que agradecer."—; dentro de los campos, en el gris del marcador de
  posición, la pista de qué cabe: "Puede ser desde algo pequeño" —corta a propósito, porque en un
  campo de una línea en móvil todo lo que no quepa se corta con puntos suspensivos—.
  Mismo patrón de título + pista que el bloque de emociones justo encima. Los dos textos los fijó el
  propietario del producto, literales.
- **Se retiran las tres `ayudas`** ("algo pequeño", "alguien", "algo que ya tienes") y con ellas el
  antiguo `placeholder` "algo más". El marcador es **el mismo en los tres renglones**: repartir una
  idea por fila era decirle a cada renglón de qué tenía que hablar, y ahora se ofrece el abanico
  entero en cualquiera. Con eso la prop `ayudas` se queda sin un solo consumidor y se retira de
  `CampoGratitud` y de `FilasDinamicas`. **La noche no se toca**: conserva "algo de hoy".

- **El editor del Journal cierra con "Listo", 20 ago.** Un botón de ancho completo al final del
  contenido —tras la tarjeta de texto y por encima de "Borrar esta entrada"—, en `primary`: es la
  única acción principal de la pantalla y el resto de sus botones son `surface`. **No es un botón de
  guardar y por eso no dice "Guardar"**: el journal se guarda solo desde SPEC_07 (tecla a los
  800 ms, blur, cierre y desmontaje), y una etiqueta de guardado sugeriría que sin tocarlo no se
  guardó. Es la misma palabra con la que Respiración cierra su sesión.
- **"Listo" y "Volver" son el mismo camino, literalmente el mismo handler.** Los dos llaman a
  `cerrarEditor`, que es `acciones.cerrar()` de `useJournal` y nada más. Dos salidas con dos
  guardados distintos serían dos comportamientos que envejecen por separado — el mismo motivo por el
  que N6 reutilizaba `CierreDelDia` en vez de tener ceremonia propia. "Volver" se queda arriba sin
  cambios: sigue siendo la salida disponible en cualquier momento.
- **No se deshabilita nunca.** No hay contenido mínimo que validar ("nada bloquea, todo es
  saltable"), y salir de una entrada vacía no deja rastro porque `journal.guardar` no la escribe.

- **El chip "+ Otra" del Journal acusa recibo, y Enter lo confirma, 20 ago.** Se reportó como
  regresión de Bloque 06 y **no lo era**: el campo nació con SPEC_07 (`e615cb6`) —Bloque 06 creó
  `ChipsEmociones` sin la prop `otra`— y en ninguna versión tuvo `onKeyDown`. Enter **nunca** hizo
  nada. SPEC_12 no tocó ese bloque.
- **El diagnóstico de fondo era otro: no había acuse por ninguna vía.** Ese `CampoLinea` solo tenía
  `onChange` —sin botón y sin `onBlur`—, así que la palabra se escribía al borrador en cada tecla y
  la guardaba el autoguardado de los 800 ms. **Se guardaba de verdad**, pero nada en pantalla lo
  decía: el chip seguía diciendo "Otra" y el campo seguía abierto. Arreglar solo Enter habría dejado
  el mismo bug reportable desde el blur, así que se arreglan las dos mitades.
- **El chip muestra la palabra mientras está elegido**, con el mismo formato `«palabra»` que ya usaba
  la lista de entradas. El formato salió a `etiquetaPropia()` en `src/lumia/emocionesJournal.js`, que
  es ahora el **único** sitio donde vive —`etiquetasDe` lo reusa—. Al soltar el chip vuelve el
  rótulo: `paraGuardar` descarta la palabra sin selección, y seguir enseñándola diría que hay algo
  guardado que no lo está.
- **Enter vuelca y suelta el foco; no valida por su cuenta.** `onConfirmar: acciones.volcar` adelanta
  lo que el autoguardado iba a escribir de todos modos — no es una segunda vía de guardado, que es el
  mismo criterio con el que "Listo" y "Volver" comparten handler. La regla de una sola palabra vive
  **solo** en `onCambiarValor`, que ya corrió en cada tecla: una prueba comprueba que
  `ChipsEmociones` no nombra `primeraPalabra`, porque dos sitios con la misma regla envejecen
  distinto. El `blur` es lo que cierra el teclado en móvil.
- **`ChipsEmociones` sigue sin conocer el catálogo que lo monta.** `etiquetaValor` llega ya formateada
  desde `Journal.jsx`, igual que el catálogo y la regla de selección: una prueba falla si aparece un
  `«` dentro del componente. **La mañana no se ve afectada** —`DiarioManana` no pasa `otra` y su
  catálogo no tiene `ID_OTRA`—, y hay una prueba que lo fija por si algún día lo pasara.

- **La barra de Strivo toma el contratono del conmutador dentro de Lumia, 21 ago.** Iba en
  `espacio-cabecera` —`strivo-100`, un gris cálido fijo a cualquier hora— y se perdía contra las dos
  secciones de Hoy. Ahora lee **el mismo `--lumia-conmutador`** que el conmutador Mañana/Noche:
  `#1D1833` de día, `#F2DDE7` de noche. No es un color parecido elegido a ojo, es el mismo token, y
  una prueba comprueba que en su regla no haya ni un hex escrito a mano. Lo pidió el propietario del
  producto. Fuera de Hoy —Journal, Historial, todo Formia— no hay atributo, no hay regla, y la barra
  conserva su gris.
- **El tema va en `globals.css`, no en props.** `BarraStrivo` está en `components/shared/` y no puede
  conocer Lumia: solo declara la clase `barra-strivo` y el espacio en el que esté decide cómo se ve.
  Es la misma decisión que SPEC_10 tomó con el velo de `TransicionLuz`, y una prueba falla si la
  barra llega a nombrar un color o la palabra "lumia". El texto se invierte redefiniendo las
  variables de superficie en esa regla, que es lo que hace el conmutador con su `data-surface`.
- **El momento sube a la raíz de la app, y RN-HOY-05 queda intacta.** Los tokens del tema viajan por
  el árbol del DOM y la barra es **hermana** de `<main>`, no descendiente de Hoy: sin subirlo, no hay
  forma de que herede nada. `Hoy` lo cuenta con `onMomento`, igual que ya contaba `onHideNav`, y
  `App` lo refleja en `data-lumia`. **El estado no se ha movido**: el conmutador sigue siendo el
  único que lo decide, y una prueba comprueba que `App` nunca llama a `setMomentoLumia` por su
  cuenta. Al desmontarse Hoy el atributo se retira, o el Journal heredaría la sección de una
  pantalla que ya no está.
- **`data-lumia` y `data-moment` conviven porque no son lo mismo.** El segundo lo decide el reloj y
  elige la paleta de marca (SPEC_12); el primero lo decide quien mira. A las diez de la mañana con el
  conmutador en Noche son distintos, y ese es justo el caso que hacía falta resolver bien.
- **El símbolo de Strivo va en monocromo blanco sobre el contratono de la mañana.** Su color vive
  dentro del `.svg` (`#2B2730`, manual §3.2) y sobre `#1D1833` se queda en **1,17:1** — invisible. El
  blanco da 17,06:1. Es la **versión monocromática que el manual §9 tiene pendiente**: "se puede
  derivar de los SVG actuales cambiando el stroke a un solo valor, pero conviene que el diseñador la
  apruebe". Está derivada con un filtro en el CSS y **no** como archivo nuevo, para que aprobarla —o
  sustituirla por la del diseñador— sea borrar tres líneas. **Pendiente de esa aprobación.** De noche
  no hace falta: el símbolo tal cual da 11,33:1 sobre `#F2DDE7`.
- **`lint:contraste` mide los dos símbolos**, no solo los textos. Fue lo que puso número al 1,17:1
  antes de escribir el arreglo.

- **La cabecera de Lumia acompaña a la barra en la sección Mañana, 21 ago.** Sobre `lumia-am-300`
  —un rosa pálido— la franja se comía con la mañana clara. Ahora toma el mismo `--lumia-conmutador`:
  arriba y abajo son el mismo bloque de color, con el contenido de la pantalla entre los dos. Lo
  pidió el propietario del producto. Mismo mecanismo que la barra: `NavLumia` solo declara la clase
  `cabecera-espacio` y el tema lo pone `globals.css`.
- **Solo en Mañana, y es deliberado.** De noche la cabecera se queda en `lumia-am-100`, que es lo que
  **SPEC_12 decidió** para que su texto siga saliendo de los tokens AAA sobre claro —"poner cromo
  oscuro sobre páginas claras habría dejado una costura"—. Ahí no se pierde: la barra de abajo
  también es la pieza clara. El contratono resuelve la mañana, que era el caso roto. Una prueba falla
  si alguien añade la regla para la noche sin volver a mirar esa decisión.
- **Las tres secciones conservan forma, peso y borde; lo que cambia es la superficie que tienen
  debajo.** "Quedan iguales" es sobre su diseño: literalmente iguales serían tinta oscura sobre
  `#1D1833`, es decir invisibles. La inversión llega sola porque `NavLumia` **no nombra ni un color**
  —pide superficies por su papel (RN-SURF-01)—, así que vestirla de contratono no tocó ese archivo
  más que para darle su clase.
- **El borde de la sección activa sí hubo que cambiarlo, y lo cazó la medición.** `lumia-pm-500` sobre
  el contratono da **2,97:1**, por debajo del 3:1 que WCAG 1.4.11 pide a un indicador. Dentro de la
  cabecera en contratono `--espacio-acento` pasa a `lumia-am-100`: 11,57:1, sigue siendo color de
  Lumia, y el estado activo además lleva peso y relleno, así que nunca se comunica solo por color
  (criterio 7 de SPEC_11).
- **La vela va en monocromo blanco sobre el contratono.** En su `#7563A7` da 3,33:1: pasa el umbral
  de no-texto, pero se apaga —que es lo que se reportó—. En blanco, 17,06:1. Es la **misma versión
  monocromática pendiente del manual §9** que usa el símbolo de Strivo en la barra, derivada del
  mismo modo y con la misma nota: **pendiente de aprobación del diseñador**, y hoy son las dos únicas
  dos reglas de filtro del repo.
- **Las dos franjas pierden su línea de borde en contratono.** Lo que las separa es el bloque de
  color entero; contra la mañana clara un borde no tiene nada que hacer.

- **Las victorias y el checklist de logros se retiraron enteros, 23 ago.** Se fue el bloque "Tres
  victorias que quisiera conseguir hoy" de la Vista de Mañana y, como consecuencia directa, el
  checklist de la Vista de Noche: las victorias heredadas con sus decisiones (lograda / pasarla a
  mañana / dejarla ir / deshacer) y el bloque de logros no planeados. Sin victorias de origen no hay
  nada que heredar, y un inventario de logros aparte convertía el cierre en un balance.
- **El concepto no desaparece de la experiencia: queda implícito en el Journal**, que **ya existía y
  no hubo que diseñarlo** (`src/pages/lumia/Journal.jsx`, §5.8). Es escritura libre, sin estructura y
  con el sistema completamente mudo (RN-JR-03), así que lo que se logró sin haberlo previsto se anota
  ahí si surge. **No se le añadió ni un campo, ni una pista, ni una pregunta**: hacerlo lo convertiría
  en el campo estructurado que se acaba de retirar. Una prueba comprueba que el Journal no nombra
  victorias ni logros.
- **Se eliminó el modelo entero, no solo la escritura.** Lo decidió el propietario del producto con
  el coste sobre la mesa. Se fueron `src/lumia/victorias.js`, `ListaVictorias.jsx`,
  `VictoriasHeredadas.jsx`, **la colección `lumia/victories`** (`FIELDS.victory`,
  `COLLECTIONS.victories`, `validateVictory`, `VICTORY_STATES` y las seis funciones de
  `lib/db/lumia.js`), **los campos `nightRitual.newWins` e `inheritedWins`**, las cinco acciones de
  `useDiario` y los dos límites de `filas.js`.
- **Coste asumido y consciente: el Historial pierde esos bloques en días ya guardados.** Es la
  diferencia con la intención, que nunca se pintó en ninguna vista histórica. `VistaDiaCompleto` ya
  no lee victorias ni `newWins`, así que un día del que solo se hubiera registrado eso **aparece
  ahora en blanco**, con "Este día no tiene nada escrito. También estuviste." Los datos **no se
  borran**: siguen inertes en el almacén, como los de `dailyIntention`, porque `COLLECTIONS` es solo
  una etiqueta al escribir y la cola de sincronización trabaja por ruta.
- **`nightRitual` los rechaza al escribir, y eso es lo correcto.** Salieron de `FIELDS.nightRitual`,
  así que un intento de volver a escribir `newWins` lanza `UNKNOWN_FIELD` (RN-DB4-08): en `lib/db/`
  los registros los escribe el código y un campo fuera de lista es un error de programación, no una
  persona explorando. Dejarlo en la lista los habría reabierto a la escritura sin que nadie los pinte.
- **La ceremonia de cierre cuenta solo gratitud.** `recuentoDelDia` devuelve `{ gracias }` y
  `sintesisDelDia` recibe un argumento en vez de dos. Se retiran del copy `unLogro`, `logrosTemplate`,
  `ambosTemplate` y `soloLogrosTemplate`; sobreviven `unaGracia`, `graciasTemplate`,
  `soloGraciasTemplate` y —sin tocar— **"Hoy solo viniste. También cuenta."**, que es a donde cae
  ahora un día con estado de sueño y aprendizaje pero sin agradecimientos. El cierre sigue nombrando
  evidencia propia y no un balance; lo que ya no puede es contar dos cosas.
- **`historial.js` deja de contar victorias para el punto de ánimo.** Un día del que solo hubiera una
  victoria escrita ya no tiene punto en el calendario ni cuenta como día con contenido. Es coherente
  con que la vista de ese día tampoco las muestre: el punto anunciaba algo que al abrirlo no está.
- **`desdeRegistros` y `conIdsDe` se retiraron de `filas.js`**, no se dejaron huérfanas. Existían
  solo para las filas con registro propio, que eran las victorias; los agradecimientos son texto
  suelto. Sus tres pruebas se fueron con ellas. **`FilasDinamicas` se queda genérico** —recibe
  límites, copy y etiqueta— aunque hoy su único uso sea la gratitud: nada de él es de la gratitud.
- **Se comprobó que no quedaba nada más colgando antes de borrar**, con el mismo chequeo que la
  intención: el Ritual de Noche guiado ya no existe (se retiró el 19 ago), Formia, `constancia.js`,
  `lib/db/formia.js` y `breathing/` solo lo **nombraban en comentarios** para decir que no lo leen, y
  no había analítica ni ningún registro colgado del bloque. Una prueba recorre `src/lumia`,
  `src/pages/lumia`, `src/components/lumia` y `src/lib/db` entero y falla si reaparece `victor`,
  `newWins`, `inheritedWins`, `lograda` o `soltada`.
- **`sugerirIdentidad.js` se queda donde está.** Las victorias lo reutilizaban para deducir su
  vínculo con un área (§C7.7.5) y eran su segundo consumidor; hoy solo lo usan los hábitos de Formia.
  Sigue en `lib/` porque la regla que implementa es de §C3.6.1, no del espacio que la llame.
- **Deroga el bloque de victorias de §5.3 y los Bloques 1 y 2 de §5.4**, y con ellos RN-VM-02,
  RN-VN-03 y la parte de §C7.7.5 que da a las victorias su `identityRef` opcional. **La documentación
  del blueprint está pendiente de reescribir esas secciones**; no bloquea el código. La Vista de
  Mañana queda en tres bloques (emociones, agradecimientos, gran visión) y la de Noche en cinco
  (agradecimientos, aprendizaje, estado de sueño, síntesis, cierre).
- **`npm run lint`, `test`, `build`, `lint:copy`, `lint:contraste` y `format:check` en verde ·
  1287 pruebas.**

**Home de Strivo — revisión de SPEC_11 y de §C0.2/§C7.1, 19 ago:**
- **Cada apertura aterriza en un Home de marca** (`src/pages/Home.jsx`, ruta `/`): símbolo de
  Strivo, una animación de bienvenida sin texto y dos accesos —"Lumia · Reflexión / ¿Cómo estoy?"
  y "Formia · Acción / ¿Quién quiero ser?"—. Las dos preguntas son las centrales del blueprint
  (§1 de este archivo), no una frase del repertorio: son fijas.
- **Strivo pasa a ser un destino navegable, y eso deroga el criterio 9 de SPEC_12** ("Strivo no es
  un espacio navegable", §C0.2). Lo decidió el propietario del producto. Lo que sigue en pie es que
  **no es un espacio**: no tiene secciones, no lee datos de ninguno de los dos (RN-DB4-01) y su
  paleta son los neutros conectores, que no cambian con la hora (manual §4.1).
- **La barra inferior ya no salta entre espacios.** `BarraEspacios` se renombró a `BarraStrivo` y
  lleva un solo acceso, a `/`. Se renombró en vez de adaptarse porque hace otra cosa, igual que
  `SesionProvisional` pasó a `ArranqueProvisional`. Para cambiar de espacio se vuelve al vestíbulo.
  **El cruce sigue sin existir en el contenido** (§C7.7.3) y ahora tampoco está en el cromo.
- **La profundidad se cuenta desde la raíz de cada espacio**, no desde la app abierta (§4.3.2,
  regla 1). El Home es el vestíbulo y no cuenta: metiéndolo en la cuenta, el detalle de un hábito y
  el hábito nuevo serían cuatro toques y la regla tendría dos excepciones en vez de un alcance
  claro. Dentro de su espacio ningún destino pasa de tres.
- **Volver a un espacio sigue devolviendo a la sección donde estabas** (criterio 4 de SPEC_11).
  Sobrevive a la revisión: lo que cambia es por dónde se pasa, no dónde se aterriza.
- **Un solo umbral por sesión y por espacio** (`src/lib/umbralSesion.js`). El "ya se cruzó" salió de
  `Hoy.jsx` porque ahora hay dos sitios que lo consultan: la entrada al espacio desde el Home y la
  aparición de la sección Mañana. Sin compartirlo, entrar de mañana encadenaba dos umbrales
  seguidos —diez segundos de luz antes de escribir nada—, que es justo lo que RN-LU-MAN-02 evita.
  Consecuencia buscada: volver al Home y entrar otra vez en la misma sesión no repite la luz.
- **La entrada a Formia es la misma pieza sin frase.** `TransicionLuz` gana `conFrase`, que no es una
  segunda variante: la frase de apertura es de Lumia (§C7.5) y a Formia no le pertenece. Lo único
  propio es la paleta, que sale de `--formia-am-*` en `globals.css`. **Es un placeholder declarado**,
  el mismo trato que los íconos de emoción: existe lo justo para no bloquear la entrega y queda
  anotado que falta el brief de diseño.
- **De paso se arregló el velo nocturno de Lumia.** Al montarse el umbral en la raíz del espacio, el
  tema que manda es `data-space` + `data-moment` y no el `data-lumia` de Hoy: sin la regla nueva,
  entrar a Lumia a las once daba un velo crema —el fogonazo que la variante de dentro de Hoy ya
  evitaba desde SPEC_10—.
- **La fricción del paso extra es una decisión consciente**, no un descuido. No rompe "nada bloquea":
  el umbral se salta con un toque, el Home no pide nada y con "reducir movimiento" no hay animación
  ni umbral. Lo que sí hace es reordenar el flujo, y por eso está escrito aquí.
- **Pendiente:** §C7.1 y §C0.2 del blueprint siguen describiendo el flujo anterior. No bloquea el
  código. `docs/specs/SPEC_11.md` ya lleva su cabecera de revisión con el detalle.

**Respiración — SPEC_13 (motor, catálogo y datos), 20 ago:**

Strivo suma un tercer acceso desde el Home: **Respiración**. No es una tercera marca ni un tercer
espacio: es una **herramienta transversal**, hermana menor de Lumia y Formia. Se entra, se usa, se
sale. SPEC_13 deja el motor, el catálogo y la capa de datos; **cero UI** (la pintan SPEC_14–16).

- **El motor vive en `src/lib/respiracion/`, no en `src/shared/`.** SPEC_13 §4.3 pedía `shared/`,
  pero **esa carpeta no existe**: lo neutral de este repo es `src/lib/` —ahí están `constancia.js`,
  `timeSlot.js`, `umbralSesion.js` y el propio `ritmoRespiracion.js`—. Crear `src/shared/` al lado
  habría dejado dos carpetas con el mismo significado y ninguna regla que dijera cuál usar. El
  razonamiento de §4.3 se cumple entero: el motor **no** puede vivir en `breathing/` porque Lumia lo
  consume y Lumia no puede leer `breathing/`.
- **`ritmoRespiracion.js` es ahora un envoltorio y su firma no cambió.** Los 46 tests de SPEC_08
  (ritmo, audio y componente) siguen verdes **sin editar ni una línea**. Traduce en un solo sitio las
  dos diferencias de vocabulario: la fase que Lumia llama `pausa` es `retenerVacio`, y su `ciclo`
  empieza en 0 mientras el motor cuenta desde 1.
- **La curva se unificó en `cosenoElevado`; `smoothstep` desaparece.** SPEC_08 suavizaba con
  t²(3−2t) y los tests solo fijaban los extremos y la monotonía, así que el cambio cabía. Medido: la
  diferencia máxima es **0,0100 de amplitud, 0,36 px sobre un círculo de 200 px**. Se unificó porque
  dos curvas para el mismo gesto es la divergencia silenciosa que la cabecera de `ritmoRespiracion.js`
  ya advertía, y no compensa por un tercio de píxel. Lo decidió el propietario del producto.
- **`escalaEn` ya no calcula curva: interpola sobre `amplitud`.** RN-RE-MOT y §6.3 exigen que el
  círculo, la línea y el volumen lean **el mismo número**. Es lo que garantiza que imagen y sonido no
  puedan desincronizarse, y por eso ningún consumidor calcula su propia amplitud.
- **No hay stores nuevos ni migración de IndexedDB, y `DB_VERSION` sigue en 1.** SPEC_13 §8.1 pedía
  cuatro stores; el almacén de Strivo está **direccionado por ruta** (un solo `records` con la forma
  de Firestore), así que `breathing/` son cuatro colecciones más dentro de lo que ya existe. Subir la
  versión habría sido lo arriesgado: una build anterior **no puede abrir** una base con versión mayor
  que la suya, que es justo el requisito de §4.4. `sync.js` las espeja sin tocar una línea.
- **Las rutas de `breathing/` viven en `src/breathing/data/esquema.js`, no en `lib/db/schema.js`.**
  Ese archivo es el modelo canónico de §C5, cuyo árbol tiene **tres raíces** y no recoge `breathing/`.
  Ampliarlo ponía en rojo el criterio 9 de SPEC_08 —"el modelo canónico no tiene dónde guardar una
  respiración"—, que **sigue diciendo la verdad**: la respiración diaria de Lumia no se registra. Lo
  que registra es la herramienta, que es otra cosa. Dos afirmaciones compatibles, cada una en su sitio.
- **`breathing/` valida corrigiendo; `lib/db/` sigue rechazando.** RN-DB4-08 dice "nada se corrige en
  silencio" y RN-RE-MOT-07/RN-RE-DAT-08 dicen "nunca lanza". No se contradicen: en `lib/db/` los
  registros los escribe el código y un campo raro es un error de programación; en `breathing/` los
  escribe una persona moviendo un control, y frenarla con un error sería castigarla por explorar.
  **La frontera entre las dos filosofías es la carpeta `src/breathing/data/`.**
- **El respaldo en memoria del caso 9.8 vive en `repositorioRespiracion.js`, no en `lib/db/local.js`.**
  Degradar el almacén compartido cambiaría el comportamiento de error de Lumia y Formia, diseñado
  sobre RN-DB4-08 y sostenido por las pruebas de SPEC_02. El radio se queda dentro de la respiración.
- **`PATRON_BASE` del motor y el preset `calma-553` del catálogo son los mismos números por
  duplicado, a propósito.** El motor no puede importar `breathing/` (lo prohíbe el lint), así que una
  prueba del catálogo comprueba que los dos no se separen.
- **El léxico clínico de §7.1 se comprueba sobre el namespace `respiracion`, no sobre todo `src/`.**
  `copy.lumia.journal` ofrece **"Con ansiedad"** como emoción del catálogo de días difíciles (SPEC_07)
  y `TEMAS_DE_RENDIMIENTO` es maquinaria de SPEC_05: prohibir esas palabras en todo el árbol rompería
  el build por un motivo equivocado. Es el mismo caso que "Seguro/Segura" con el PIN. `lint-copy.js`
  importa el copy y recorre `copy.respiracion` hoja por hoja — exacto en vez de aproximado. Sí van
  globales `productividad`, `maximiza` y `trastorno`, que no son vocabulario de nadie.
- **`interpolar()` no se creó: `interpolate()` existía desde Fase 0** y usa la misma sintaxis `{n}`.
- **`retenerVacio` cuenta como retención** para `tieneRetenciones`, que es mecánico —cualquier
  retención por encima de cero— y no una etiqueta que alguien elige a mano.
- **En modo `ciclos`, `cerrando` se abre al empezar la última respiración**, no al terminarla. Es
  información útil ("esta es la última") y no corta nada: RN-RE-MOT-16 se cumple igual.
- **`notificarAusencia()` la llama la capa visual, no la máquina.** El caso 9.4 necesita
  `visibilitychange` y la máquina no toca el DOM. ~~SPEC_14 conecta el oyente.~~ **Corregido al
  cerrar SPEC_14: lo conecta SPEC_16.** Las visuales de SPEC_14 no pueden — RN-RE-VIS-02 les prohíbe
  tener `useEffect` y temporizadores, y un oyente de `visibilitychange` es exactamente eso. El sitio
  que queda es la pantalla, que es quien ya posee la máquina y el bucle de frames.

| Regla | Enunciado |
|---|---|
| **RN-RE-MOT-01/02** | `inhalar` y `exhalar` ≥ 1,0 s; las retenciones pueden ser 0. |
| **RN-RE-MOT-03/04** | Fase ≤ 20,0 s. Ciclo entre 6,0 s y 60,0 s. |
| **RN-RE-MOT-05/06** | Décimas de segundo enteras. Paso de edición 0,5 s (no 0,1 s). |
| **RN-RE-MOT-07** | La validación **nunca lanza**: corrige al valor válido más cercano y lo explica. |
| **RN-RE-MOT-08** | Un patrón que deja de coincidir con su preset pasa a `personalizado`. La caja es la excepción: la definen sus cuatro fases iguales, no el preset guardado. |
| **RN-RE-MOT-11** | El tiempo se calcula **contra el origen**, nunca acumulando deltas por fotograma. |
| **RN-RE-MOT-13/14** | Pausar congela el punto exacto. Una pestaña oculta no pausa: al volver se recalcula y no se recuperan fotogramas. |
| **RN-RE-MOT-16** | **El ciclo en curso siempre se completa.** Nunca se corta a media exhalación. |
| **RN-RE-MOT-17** | Excepción: `terminar()` de la persona corta de inmediato. Su decisión manda. |
| **RN-RE-MOT-20/21** | El límite por minutos se hace efectivo al final del ciclo, así que la sesión dura entre `valor` y `valor + un ciclo`. El acomodo no cuenta. |
| **RN-RE-DAT-01** | `guiaSonoraActiva` arranca en `false`. **Silencio por defecto**, como corrigió SPEC_08 en `initShared`. |
| **RN-RE-DAT-03/04/05** | Cinco recientes como mucho; repetir mueve la fecha en vez de duplicar; lo que ya está en favoritos no entra. |
| **RN-RE-DAT-06/07** | Las sesiones se purgan a los 90 días y **no se derivan rachas, metas ni logros**. |
| **RN-RE-DAT-09** | Nada de `breathing/` importa `lumia/` ni `formia/`. Lo vigilan el lint y una prueba. |
| **RN-RE-COPY-01** | El aviso de seguridad se muestra una vez, es descartable y no bloquea. |

**Pendiente de SPEC_13:** la nota de seguridad (RN-RE-COPY-01/02) tiene copy y campo persistido
(`avisoSeguridadVisto`) pero **nadie la pinta todavía** — es UI y le toca a SPEC_16. Lo mismo con
`mantenerPantallaEncendida`: el campo existe, la Wake Lock API del caso 9.4 la conecta **SPEC_16**
—no SPEC_14, como decía esta nota— por el mismo motivo que `visibilitychange`: es un efecto, y la
capa visual no tiene ninguno a propósito.

**Respiración — SPEC_14 (visuales: círculo y bolita sobre línea), 20 ago:**

Dos guías visuales intercambiables, las dos alimentadas por el mismo `amplitud` del motor de
SPEC_13. **Sin sonido, sin favoritos y sin pantalla**: la pantalla que las monta es de SPEC_16, y
hasta entonces esta capa está construida y probada pero no la ve nadie. Es deliberado: el orden lo
fijan las propias specs.

- **Los cuatro colores de fase salen de la escala Strivo madre, y hubo que ampliarla.** §1.1 obliga a
  detenerse si la escala no alcanza, y no alcanzaba: sobre `strivo-50`, de los cinco pasos solo
  `strivo-600` (4,82:1) y `strivo-900` (13,32:1) superan el 3:1 de WCAG 1.4.11, y §5 pide cuatro
  fases distinguibles. **El propietario del producto eligió añadir dos pasos**, `strivo-700 #58545D`
  y `strivo-800 #423E47`, interpolados sobre el eje neutro que ya existía entre 600 y 900. No
  introducen tono: Strivo sigue siendo acromático (manual §4.1). Están en `design-tokens.json`, en
  `globals.css` y **en el manual §4.2**, que es donde `marca.test.js` exige que viva todo hex de
  marca — esa prueba fue la que lo cazó.
- **Las fases se separan por luminancia, no por tono, y §5 pedía otra cosa.** §5 describe un eje
  cálido→frío ("inhalar: el más luminoso y cálido", "exhalar: más frío y profundo"); una escala
  acromática no tiene ese eje. Se cumple el propósito —cuatro fases distinguibles, todas ≥3:1— con el
  único eje que la paleta tiene. **Coste medido y asumido: entre fases contiguas hay 1,4:1**, que no
  basta para nombrar una fase por su color. Por eso RN-RE-VIS-17 no es aquí un adorno de
  accesibilidad: es lo que sostiene la lectura. `lint:contraste` mide las cuatro y deja anotadas las
  contiguas como informativas, con el motivo escrito.
- **`pintar()` por referencia, no por props: es lo que hace que se sienta suave.** RN-RE-VIS-01 fija
  las props de una visual en cuatro y RN-RE-VIS-33 prohíbe `setState` por frame. Las dos se cumplen
  a la vez porque el estado por frame **no pasa por props**: quien monta la visual llama a
  `pintar(estado)` sobre su `ref`, y eso escribe sobre el nodo. React repinta al cambiar de fase —
  nueve veces en cuarenta segundos, no dos mil cuatrocientas. Ninguna de las dos visuales tiene
  `useState`, `useEffect` ni un solo temporizador, y hay pruebas que fallan si aparecen.
- **La cuenta regresiva también baja por el nodo.** RN-RE-VIS-19 quiere que el número baje de segundo
  en segundo y §10 que React solo repinte al cambiar de fase. Un dígito no vale un render del árbol,
  así que `EtiquetaFase` recibe `refCuenta` y `pintar()` le escribe el `textContent` cuando el
  segundo cambia de verdad.
- **El anuncio accesible dice lo que DURA la fase, no lo que le queda.** Escrito con el tiempo
  restante, el texto cambiaba cada segundo y salían **39 anuncios en tres ciclos** en vez de 9: un
  `aria-live` que se reescribe así se corta a sí mismo y el lector de pantalla queda inservible.
  `AnuncioAccesible` no recibe ningún valor que cambie dentro de la fase, así que RN-RE-VIS-24 se
  cumple por construcción y no por vigilancia.
- **Con movimiento reducido manda un solo reloj.** §7 escalona dos cosas por separado —cuatro pasos
  de amplitud y un paso de arco por segundo— y gobernadas por separado se turnaban para escribir:
  **19 actualizaciones en un ciclo de trece segundos**, con RN-RE-VIS-20 pidiendo una por segundo.
  El portero es ahora el segundo transcurrido de la fase, uno solo. Es la misma idea que sostiene el
  motor entero: un reloj, no dos.
- **`prefers-reduced-motion` no apaga la animación, la escalona.** Sin escala continua pero con los
  cuatro pasos, el arco de segundo en segundo, la onda quieta con un marcador que la recorre, y la
  estela **fuera del DOM** —no escondida con CSS—. Las duraciones no se tocan: la duración no es una
  animación, es el ejercicio. Es la misma lectura que SPEC_08 hizo de §6.10.1.
- **La onda se muestrea una vez y se desplaza.** Es periódica, así que su forma no cambia entre
  frames: 1.223 puntos memoizados por `(patrón, ancho, alto, posición)` y por frame un `translateX`.
  Recalcular mil puntos sesenta veces por segundo es el error que hace que una animación de calma se
  sienta nerviosa. Medido: dos llamadas iguales muestrean una sola vez, y sesenta frames resuelven el
  motor sesenta veces —una por bolita— y ni una más.
- **Las mesetas de retención son exactamente planas.** El suavizado une los puntos con cuadráticas
  que pasan por los puntos medios, y ese esquema tiene la propiedad que hacía falta: sobre un tramo
  de Y constante, controles y puntos medios comparten esa Y. Varianza cero, comprobada sobre 669
  puntos. Una meseta que ondula estaría diciendo "sigue moviéndote" justo donde la instrucción es
  sostener.
- **La bolita se apoya en el trazo con 0,0076 unidades de error**, no porque se lea del path sino
  porque las dos alturas salen de la misma amplitud del motor (RN-RE-VIS-09). Dos fuentes de verdad
  para la misma altura acaban separándose; una no puede.
- **El disco vacío mide el 32 % del anillo y nunca 0.** Un punto que desaparece del todo se siente
  como asfixia, y esta app existe para lo contrario.
- **La cuenta 3-2-1 del acomodo la monta la pantalla, no la visual.** §9 la sitúa en el centro del
  dibujo, pero vive en `msRestantesAcomodo` de la máquina y RN-RE-VIS-01 fija las props de una visual
  en cuatro, ninguna de las cuales la lleva. Añadir una quinta abre la puerta a las demás. Lo que sí
  hace la visual en `acomodando` es la respiración lenta y decorativa de §9. **Le toca a SPEC_16.**
- **`copy.respiracion.estados.pausado` es copy nuevo, y SPEC_14 §12 decía que no haría falta.**
  RN-RE-VIS-26 pide anunciar la pausa y no había cómo decirlo: `controles.pausar` es la etiqueta de
  un botón, es decir una acción, y leerle "Pausar" a quien ya pausó es contarle lo que puede hacer y
  no lo que pasa. La prueba de bloques de SPEC_13 se actualizó con el motivo escrito al lado.
- **El filtro de "ni un string fuera de copy" (criterio 19 de SPEC_13) se afinó, no se ablandó.**
  SPEC_14 trajo los primeros `.jsx` a `breathing/` y con ellos cadenas con espacios que nadie lee:
  `(prefers-reduced-motion: reduce)`, `xMidYMid meet`, y la costura que deja un `template literal`
  partido dentro de una etiqueta JSX. La lista de excepciones es explícita —tres patrones— y hay una
  prueba que falla si esa lista empezara a tragarse texto de verdad.
- **No se añadió ninguna librería de animación** (§1.3). El repo no tenía ninguna y sigue sin
  tenerla: todo es SVG con atributos calculados por el motor y transiciones de CSS.

| Regla | Enunciado |
|---|---|
| **RN-RE-VIS-00** | Ningún archivo de `src/breathing/**` referencia un token `lumia-*` ni `formia-*`. |
| **RN-RE-VIS-01/02/03** | Una visual recibe cuatro props, no calcula nada y no conoce la capa de datos. |
| **RN-RE-VIS-04/05** | El disco vacío es el 32 % del anillo. En las retenciones queda inmóvil. |
| **RN-RE-VIS-06/07** | El arco mide la **fase actual** y se reinicia en cada cambio. Cambia de color en 200 ms. |
| **RN-RE-VIS-08** | `preserveAspectRatio="xMidYMid meet"`. El dibujo nunca se deforma. |
| **RN-RE-VIS-09** | La Y de la bolita sale de la amplitud del motor, jamás de leer el trazo. |
| **RN-RE-VIS-10** | Las mesetas de retención son planas. Varianza de Y igual a cero. |
| **RN-RE-VIS-11** | Los dos extremos de la onda se desvanecen. |
| **RN-RE-VIS-12** | Con movimiento reducido la estela no está en el DOM. |
| **RN-RE-VIS-14/15** | Solo las marcas futuras llevan texto, y solo si el ciclo llega a 8 s. |
| **RN-RE-VIS-16** | Los cuatro colores de fase ≥ 3:1 sobre el fondo; el texto asociado, AAA. |
| **RN-RE-VIS-17** | **La fase nunca se comunica solo por color.** Siempre hay palabra y forma. |
| **RN-RE-VIS-19** | Cuenta regresiva en segundos enteros; se oculta en fases de menos de 2,0 s. |
| **RN-RE-VIS-20** | Con movimiento reducido, **como mucho una actualización por segundo**. |
| **RN-RE-VIS-21/22** | La preferencia del sistema se escucha en vivo, y el interruptor manual la suma. Ninguna manda sobre la otra. |
| **RN-RE-VIS-24** | El anuncio se actualiza al cambiar de fase, nunca por frame. |
| **RN-RE-VIS-25/27** | El SVG es `role="img"` con `<title>`; lo de dentro va `aria-hidden` y nada es enfocable. |
| **RN-RE-VIS-26** | En pausa se anuncia una vez "En pausa" y se callan las fases. |
| **RN-RE-VIS-28/29** | `inactivo → acomodando` es un cruce. Cambiar de visual en marcha no interrumpe el ritmo. |
| **RN-RE-VIS-31/32/33** | El muestreo se memoiza, el desplazamiento va por `transform`, y **no hay `setState` por frame**. |

**Pendiente de SPEC_14:** nada de esto se ve todavía. `GuiaVisual` no lo monta ninguna pantalla —eso
es SPEC_16— y **las 8 validaciones manuales de §14 están sin hacer** por el mismo motivo: no hay
dónde mirarlas. Se hacen cuando exista la pantalla.

**Respiración — SPEC_15 (sonido ambiente, guía sonora y favoritos), 20 ago:**

Cinco sonidos de fondo más silencio, todos **sintetizados en tiempo real**, y la gestión de
combinaciones guardadas. Sigue sin haber pantalla que lo monte: eso es SPEC_16.

- **Síntesis procedural al 100 %, confirmado por el propietario del producto.** Cero archivos de
  audio, cero dependencias nuevas, cero licencias que resolver, y funciona sin red por construcción.
  **Medido: la capa de audio entera —singleton, generadores de ruido, las cinco fuentes, mezclador y
  orquestador— pesa 12,5 kB minificada y 4,2 kB comprimida.** Un solo bucle de lluvia en calidad
  decente pesa entre 1.500 y 4.000 kB. Una prueba recorre `src/`, `public/` y `docs/` y falla si
  aparece un `.mp3`, `.ogg`, `.wav`, `.m4a`, `.aac`, `.flac`, `.opus` o `.webm`.
- **Bosque queda fuera, y es una decisión escrita.** Es el único de los evaluados que la síntesis no
  resuelve bien: el lecho de ruido sale convincente, pero los cantos de pájaro sintetizados suenan
  sintéticos y romperían la sensación de refugio. Vale más no tenerlo que tenerlo mal. Si algún día
  resulta indispensable, entra como **el primer archivo de audio real del repo** y ahí se define su
  licencia y su precaché — hoy no.
- **La preferencia de sonido es exclusiva del espacio Respiración**, decidido por el propietario del
  producto. `shared/preferences.soundEnabled` sigue gobernando la respiración diaria de Lumia y P1
  (RN-AUD-03 intacta); `breathing/configuracion` lleva ambiente, volúmenes y guía. Silenciar en un
  sitio no silencia el otro, y es a propósito: son dos herramientas distintas.
- **Un solo `AudioContext` en toda la app, y el refactor tenía una trampa.** `audioRespiracion.js`
  cerraba el contexto en `detener()`, y la prueba de SPEC_08 —que está en la lista de "no tocar"—
  comprueba justamente eso. Con un singleton, cerrarlo al acabar la guía dejaría el ambiente mudo a
  media sesión. Se resolvió con **préstamos**: quien necesita audio lo pide y lo suelta, y el
  contexto se cierra cuando lo suelta el último. RN-AUD-04 se cumple igual, y **las 31 pruebas de
  SPEC_08 siguen verdes sin editar una línea**. Quien inyecta su propia fábrica —las pruebas—
  conserva la propiedad y cierra lo suyo.
- **Vive en `src/lib/audio/` y no en `src/shared/audio/`, que es donde lo pedía §2.1.** Misma razón
  que en SPEC_13: `src/shared/` no existe, y crearlo dejaría dos carpetas con el mismo significado
  sin ninguna regla que dijera cuál usar. `lib/` es el territorio neutral del repo. El razonamiento
  de §2.1 se cumple entero: lo consumen Lumia y Respiración, así que no puede vivir en ninguno.
- **Al pausar, el ambiente baja al 30 % y la guía se calla del todo.** No es una inconsistencia: la
  guía marca el ritmo y sin ritmo no tiene nada que decir; el ambiente es paisaje y el paisaje sigue
  ahí. Cortar el fondo en seco sobresalta, que es lo contrario del propósito — y un silencio
  repentino llama más la atención que el propio sonido.
- **Ni una asignación directa a `.value` en toda la capa.** Un salto de ganancia es un chasquido
  audible, y en una app cuyo trabajo es bajarle las pulsaciones a alguien eso es un fallo de
  producto. El doble de `AudioContext` de las pruebas lleva un `setter` que apunta cualquier
  asignación, así que la regla la vigila una prueba y no una revisión de código.
- **El bucle de ruido lleva un cruce de igual potencia, y el motivo no es el chasquido.** Un salto en
  la costura se oye como un clic, sí, pero se oye **cada cuatro segundos**: el ambiente acabaría
  teniendo un pulso regular, que es justo lo que RN-RE-SND-07 prohíbe. El fallo empieza siendo un
  chasquido y termina siendo un metrónomo. Los pesos son senos y no rectas porque al sumar dos
  señales sin correlación lo que se conserva es la potencia, no la amplitud.
- **Se encontró una fuga de verdad y se corrigió: 16 nodos al minuto 1, 451 a los sesenta.** La
  limpieza de las voces efímeras —gotas, chispas, campanas— colgaba solo de `onended`. Ahora hay
  además una **siega por tiempo en cada tic del planificador**, que no depende de ningún evento del
  navegador. Una sesión de una hora son miles de gotas: con que un uno por ciento no avisara,
  quedarían decenas de nodos vivos, y el síntoma no es un error sino un teléfono caliente.
- **Los intervalos aleatorios no son un capricho** (RN-RE-SND-07). Quien sigue una guía de cinco
  segundos no necesita un segundo metrónomo discutiéndole el compás por debajo. Se comprueba con una
  prueba estadística sobre 200 intervalos de cada fuente con eventos.
- **Las olas y el viento no tienen eventos: su modulación es continua.** Lo que evita el compás ahí
  son dos LFO con frecuencias distintas (0,05 y 0,03 Hz en el viento), que vuelven a coincidir cada
  cien segundos — para entonces el oído ya no lo relaciona.
- **Los cristales usan una pentatónica de Do.** Es la escala sin semitonos: cualesquiera dos notas
  suenan bien juntas, así que por mucho que el azar solape dos campanas nunca puede salir una
  disonancia. Con una escala mayor sí podría.
- **`crearPlanificador` e `impulso.js` no están en la lista de archivos de §7** y se añadieron a
  propósito: las cinco fuentes necesitan el mismo bucle de anticipación y el mismo gesto de impulso
  filtrado, y cinco copias serían cinco sitios donde RN-RE-SND-06 y RN-RE-SND-08 se pueden romper sin
  que nadie lo note.
- **Elegir `silencio` libera los nodos; poner el volumen a 0 no** (RN-RE-SND-16). Son dos cosas
  distintas: bajar el control es "ahora no quiero oírlo" y subirlo vuelve a oírse al instante; elegir
  silencio es "no quiero esto sonando".
- **La comparación de favoritos incluye la duración; la de recientes no.** `mismaConfiguracion` de
  SPEC_13 (RN-RE-DAT-04/05) responde "¿son la misma sesión?"; `mismaConfiguracionCompleta` de SPEC_15
  (RN-RE-FAV-05) responde "¿ya está guardada?". "4-7-8 diez minutos" y "4-7-8 tres minutos" son dos
  cosas que alguien puede querer tener a la vez. **Los volúmenes quedan fuera de las dos**: son un
  ajuste del momento —los audífonos, la hora, quién duerme al lado—, y bloquear un guardado porque el
  volumen está al 55 % en vez de al 60 % sería incomprensible. Pero **sí cuentan para "modificado"**
  (RN-RE-FAV-11): quien movió el volumen tiene derecho a que le ofrezcan guardarlo.
- **`MAX_FAVORITOS = 20` vive en `data/esquema.js`**, junto a `MAX_RECIENTES` y
  `MAX_NOMBRE_FAVORITO`, que es donde ya estaban sus hermanos. Los favoritos **no desalojan** y las
  recientes sí: aquellas las escribe la app, estas las escribe una persona, y desalojar la más vieja
  en silencio es decidir por alguien sobre algo suyo.
- **El límite de 40 caracteres cuenta grafemas con `Intl.Segmenter`.** `'👨‍👩‍👧‍👦'.length` es 11:
  contar unidades de código dejaría a alguien sin poder escribir seis emojis mientras la app le dice
  que se pasó de cuarenta.
- **El filtro de "ni un string fuera de copy" ahora excluye por POSICIÓN, no por forma.** SPEC_15
  trajo componentes con `className` de Tailwind, que son cadenas con espacios indistinguibles de una
  frase. Se descarta lo que está **dentro de un `className`** y nada más: cualquier filtro basado en
  "parece técnico" acabaría tragándose copy de verdad, que es lo que el criterio existe para cazar.
- **El separador `' · '` de las filas se movió a `copy.respiracion.favoritos.separador`.** Es
  puntuación, pero se ve, y elegirla es una decisión editorial: podría ser «·», «•» o un guion largo.

| Regla | Enunciado |
|---|---|
| **RN-RE-SND-00** | El `dist` no crece por activos de audio. Ni un archivo, ni una dependencia. |
| **RN-RE-SND-01/02** | `silencio` es el valor de fábrica **y** una opción explícita de la lista. |
| **RN-RE-SND-03** | `liberar()` deja 0 nodos conectados y 0 eventos programados. |
| **RN-RE-SND-04/05** | El ruido se genera una vez en un buffer de 4 s, con 200 ms de cruce interno. |
| **RN-RE-SND-06** | Los eventos se programan con 200 ms de anticipación sobre `ctx.currentTime`. `setTimeout` despierta el planificador; **nunca dispara un sonido**. |
| **RN-RE-SND-07** | Ningún ambiente tiene un pulso periódico perceptible. |
| **RN-RE-SND-08** | Toda ganancia se mueve con rampa. **Nunca `.value = x`.** |
| **RN-RE-SND-09/10/11** | Entrada 2,0 s · cierre 3,0 s · `terminar()` 0,8 s. |
| **RN-RE-SND-12/13** | Al pausar: ambiente al 30 %, guía a 0. |
| **RN-RE-SND-14** | Cambio en vivo: cruce de 1,2 s sin silencio intermedio. |
| **RN-RE-SND-15** | La ganancia maestra se queda en 1: el volumen del sistema es de quien lo tiene. |
| **RN-RE-SND-16** | Volumen 0 ≠ `silencio`. Lo primero no libera nodos; lo segundo sí. |
| **RN-RE-SND-19/20/21** | La guía suena al **inicio** de `inhalar` y de `exhalar`, nunca en retenciones, y se dispara desde el cambio de fase del motor. |
| **RN-RE-SND-27/28/29** | Vista previa inmediata al volumen configurado; se apaga sola a los 20 s; el primer toque es el gesto que crea el contexto. |
| **RN-RE-FAV-01** | 20 favoritos. Al intentar el 21 se explica; **no se borra nada solo**. |
| **RN-RE-FAV-02/03** | Nombre de 1 a 40 grafemas, único sin distinguir mayúsculas ni espacios de los extremos. |
| **RN-RE-FAV-04** | El campo llega prellenado y seleccionado, con sufijo numérico si hace falta. |
| **RN-RE-FAV-05** | Configuración idéntica → "ya la tienes guardada", no un duplicado. |
| **RN-RE-FAV-09/10** | Cargar aplica los ocho campos e incrementa `usos`; **no arranca la sesión**. |
| **RN-RE-FAV-11** | Tras modificar, "Guardar cambios" o "Guardar como nueva". Nunca se sobrescribe en silencio. |
| **RN-RE-FAV-12/13** | Un sonido o un patrón que ya no valen se corrigen al cargar y se avisa. No falla. |
| **RN-RE-FAV-14/15/16** | 44 px de área táctil · Enter confirma y Escape cancela · el vacío no ofrece crear de la nada. |

**Pendiente de SPEC_15:**
- **Nada de esto se ve todavía.** Ninguna pantalla monta `PanelSonido` ni `ListaFavoritos`, así que
  el bundler **elimina la capa entera por tree-shaking** y el `dist` solo creció ~1 kB (el singleton
  y el copy). La cifra real —12,5 kB, 4,2 kB comprimida— se midió aparte forzando la inclusión.
  **Hay que volver a medirla cuando SPEC_16 monte la pantalla.**
- **Las 7 validaciones manuales de audio de §10 están sin hacer**, y son las que más importan de todo
  este spec: las pruebas no oyen. Hace falta escuchar cada sonido dos minutos seguidos con audífonos
  y con la bocina del teléfono, comprobar que ninguno enmascara el ritmo, y sentir si la bajada al
  30 % al pausar se percibe cuidada o brusca.
- **La Media Session API (RN-RE-SND-25) y el manejo de `visibilitychange` (RN-RE-SND-23/24/26) no se
  conectaron.** Son efectos de pantalla, igual que la Wake Lock: le tocan a SPEC_16, que es quien
  tiene el ciclo de vida. La lógica que necesitan —`restablecer()` con rampa de 400 ms— ya está en el
  mezclador y probada.
- **Caso 6.14 (dos pestañas abiertas): la última escritura gana**, sin bloqueo optimista. Queda como
  limitación conocida, tal como la propia spec pide documentar.
- **Caso 6.15: los cambios sin guardar se pierden al salir, sin advertencia.** Es coherente con que
  la configuración sea efímera hasta que se guarda, y la spec pide anotarlo aquí.
- **Deshacer una eliminación (RN-RE-FAV-08) y su ventana de 6 s** están en el copy y en la interfaz
  de `ListaFavoritos`, pero **quien cuenta los seis segundos y confirma el borrado al navegar
  (caso 6.11) es la pantalla**, que no existe. La lista solo pinta el aviso que le pasan.

**Respiración — SPEC_16 (Home, navegación e integración), 20 ago. Cierra Fase 1C:**

El tercer acceso en el Home, las dos pantallas y el ensamblado de todo lo que SPEC_13–15 dejaron
suelto a propósito.

- **Respiración no es un tercer espacio, y el Home tiene dos niveles y no tres elementos iguales.**
  Lumia y Formia se **habitan**: tienen marca, subtítulo, transición de entrada. Respiración se
  **toma**: se entra, se usa, se sale. El acceso va en componente propio (RN-RE-NAV-08c) y **fuera
  del `<nav>` de los espacios**, porque compartir contenedor ya la ascendería de categoría.
- **No hizo falta tocar la animación de bienvenida.** El caso 8.5 obligaba a parar y pedir permiso
  antes de recortarla; medido en 360×640, los tres accesos ocupan **466 px de 640** y quedan 174
  libres. En 320×568 sobran 102. Las tarjetas de Lumia y Formia quedan byte por byte iguales
  (RN-RE-NAV-08b), y una prueba falla si cambian.
- **RN-RE-NAV-01 y RN-RE-NAV-06 se contradicen: manda la accesibilidad.** La primera pide que el
  acceso mida ≈40 % de una tarjeta —34 px— y la segunda un área táctil de 56 px como mínimo. No se
  puede entregar un blanco de 34 px, y menos a alguien que lo busca porque está mal. Se queda en 56,
  que es el 66 % de una tarjeta, y **la subordinación la cargan las otras cuatro palancas que la
  propia regla lista**: sin subtítulo, píldora en vez de tarjeta, peso normal en vez de
  `font-display`, y un anillo dibujado en vez de un símbolo de marca. Las cuatro están probadas.
- **Tres reglas salieron gratis porque `espacioDe('/respiracion')` devuelve `null`.** Sin barra de
  navegación (RN-RE-NAV-12), sin umbral de luz de Lumia (RN-RE-NAV-34) y con el cromo en los neutros
  de Strivo. No hubo que escribir ninguna de las tres: la función que decide qué es un espacio ya lo
  decía. Es la señal de que la arquitectura de SPEC_11 estaba bien puesta.
- **La sesión vive en un contenedor por encima de las dos rutas** (`Respiracion.jsx`, añadido fuera
  de la lista de §9). Si viviera en `PantallaSesion`, el botón atrás la destruiría al desmontarla, y
  RN-RE-NAV-10 pide lo contrario: que pause y se retome en su punto exacto. El estado tiene que estar
  por encima de la ruta, y de ahí cuelgan también RN-RE-NAV-09, 16, 17 y 33.
- **`useSesionRespiracion` es donde converge todo lo que las tres specs anteriores no podían tener.**
  Las visuales de SPEC_14 no pueden tener efectos ni temporizadores (RN-RE-VIS-02), así que el bucle
  de frames vive aquí y les habla por su referencia con `pintar()`. La máquina de SPEC_13 no toca el
  DOM, así que el oyente de `visibilitychange` vive aquí. La capa de audio de SPEC_15 no conoce el
  ciclo de vida de una pantalla, así que el `AudioContext` se pide aquí **dentro del gesto**. Es el
  único punto de la respiración donde un error se manifiesta como "a veces falla": conviene mirar dos
  veces lo que se le añada.
- **La primera vez de todas arranca en `entrada-suave`, y no hizo falta un campo nuevo.**
  RN-RE-NAV-17 lo pide; las preferencias de fábrica de SPEC_13 guardan `calma-553`. Se distingue por
  `actualizadoEn`, que es nulo mientras nadie haya guardado nada. Empezar aguantando el aire sin
  haberlo hecho nunca es innecesariamente exigente, y `entrada-suave` no tiene retenciones.
- **Los controles de la sesión se apagan del todo, no a 0,25, y lo decidió una medición.**
  RN-RE-NAV-23 pide opacidad 0,25 tras seis segundos sin tocar nada; medido, el texto del botón a
  0,25 sobre el fondo da **1,67:1**, ilegible. **RN-RE-NAV-46 anticipa exactamente ese caso y da la
  salida**: "o el texto se oculta del todo en vez de quedar ilegible". A 0,25 se obtiene lo peor de
  las dos cosas —una mancha que no se lee pero que sigue tirando del ojo—; a 0 la pantalla queda de
  verdad limpia, que es lo que "cerrar los ojos sin que la pantalla grite" pedía. **Siguen siendo
  tocables**: `pointer-events` no se toca, y una prueba lo vigila. El 1,67:1 queda anotado en
  `lint:contraste` como informativo, con el motivo.
- **La entrada no lleva transición de frase, y es la decisión de fondo del spec.** Quien entra a
  Lumia va a reflexionar y una frase lo prepara; **quien entra a Respiración puede estar mal en ese
  momento**. Interponer una pantalla contemplativa ahí es fricción exactamente en el peor instante
  posible. Una prueba comprueba que ningún archivo de Respiración importa `TransicionLuz`,
  `frases-apertura` ni `umbralSesion`.
- **Los favoritos van debajo de "Empezar", y "Empezar" está fijo abajo.** Hacer atravesar un catálogo
  para llegar al botón es poner una tienda entre alguien y lo que vino a buscar. El orden del DOM lo
  fija una prueba, no solo el CSS.
- **El aviso de seguridad es una tarjeta descartable dentro de la pantalla, nunca un modal.** Un modal
  obliga a leer y aceptar antes de poder hacer nada, y quien abre esto puede estar en mitad de una
  crisis de ansiedad. Ponerle una puerta delante es el gesto contrario al del producto.
- **El panel de ajustes en vivo no ofrece patrón ni duración, y esa ausencia es la mitad de su
  diseño.** Cambiar el ritmo a mitad de sesión no es ajustar: es empezar otra sesión, y hacerlo pasar
  por un ajuste dejaría a alguien a media exhalación con un patrón que no eligió para este momento.
- **El `aria-live` de los controles `−`/`+` va en el grupo, no en cada botón** (RN-RE-NAV-43). Puesto
  en los botones, un lector de pantalla anunciaría el cambio dos veces —una por el botón y otra por
  el valor— y quien lo usa acabaría oyendo el doble de lo que pidió.
- **Los tiempos van con coma decimal** (RN-RE-NAV-18) y sin `toLocaleString`: su resultado depende
  del navegador y de los datos de región instalados, y un separador que cambia de un teléfono a otro
  no es una decisión de producto, es una lotería.
- **Tres pruebas de specs anteriores tuvieron que afinarse, y ninguna se ablandó.** El filtro de "ni
  un string fuera de copy" ganó dos patrones técnicos precisos —la tecla `' '` y los selectores CSS,
  que llevan corchetes y ningún texto los lleva—; el quitador de comentarios de `navegacion.test.js`
  aprendió que `/*` solo abre comentario tras un espacio, porque la ruta comodín `"/respiracion/*"`
  se comía el resto del archivo; y dos pruebas más aprendieron a neutralizar las flechas `=>`, cuyo
  `>` partía el JSX por la mitad y daba por infractores a componentes que no escriben nada.

| Regla | Enunciado |
|---|---|
| **RN-RE-NAV-01/02/06** | El acceso es subordinado: sin subtítulo, píldora, peso normal, sin símbolo. 56 px de área táctil — la accesibilidad gana al 40 %. |
| **RN-RE-NAV-03/04/05** | Tokens Strivo, siempre debajo de los dos espacios, siempre sobre el pliegue. |
| **RN-RE-NAV-08/08b/08c** | La bienvenida no se toca, las tarjetas quedan idénticas, el acceso es componente propio. |
| **RN-RE-NAV-09/10** | La ruta de sesión no es enlazable; el botón atrás pausa y no destruye. |
| **RN-RE-NAV-12** | Dentro de Respiración no hay barra de navegación. Para ir a otro lado, se sale al Home. |
| **RN-RE-NAV-14/15** | "Empezar" fijo abajo; favoritos y recientes **debajo** de él. |
| **RN-RE-NAV-16/17** | Todo llega precargado. La primera vez de todas, `entrada-suave`. |
| **RN-RE-NAV-18/19** | Coma decimal y paso de 0,5 s; la caja se edita con un solo control. |
| **RN-RE-NAV-20** | Un patrón inválido **nunca** deshabilita "Empezar": se corrige y se avisa. |
| **RN-RE-NAV-21/23/45** | La visual domina; los controles se retiran a los 6 s y vuelven al tocar; con teclado no se retiran. |
| **RN-RE-NAV-24** | En vivo se cambia visual, sonido y volúmenes. **Nunca patrón ni duración.** |
| **RN-RE-NAV-26** | En `cerrando` el progreso no cambia: no se avisa del último ciclo. |
| **RN-RE-NAV-27** | Salir no pide confirmación. Pide confirmación quien quiere retener. |
| **RN-RE-NAV-28** | Wake Lock en `activo` y `cerrando`; se suelta al pausar, completar o salir. Degradación silenciosa. |
| **RN-RE-NAV-30/32** | Sin felicitación ni puntaje. Menos de un ciclo, sin resumen numérico. |
| **RN-RE-NAV-34/37** | Sin transición de frase y **sin puente** con Lumia ni Formia: los cruces van por el Home. |
| **RN-RE-NAV-41/43/44** | Foco inicial al encabezado y al control de pausa; `aria-live` en el grupo; el panel atrapa el foco. |

**Pendiente de SPEC_16 — lo que no puede cerrar el código:**
- **Los 8 recorridos manuales de §11 están sin hacer**, y con ellos los 15 acumulados de SPEC_14 y
  SPEC_15: **23 validaciones manuales en total**. Las que más pesan son el recorrido 4 —quince
  minutos con los ojos cerrados, que es lo que decide si el audio está bien calibrado— y el
  recorrido 8, cuya última pregunta es la que dice si este spec cumplió su propósito: *¿el tercer
  acceso se lee como herramienta y no como un tercer espacio?* Eso no lo puede contestar una prueba.
- **`ROADMAP.md` está actualizado; `INDEX.md` no existe** en este repo y no se creó: inventar un
  índice nuevo al cerrar una fase es material de documentación, no de código.
- **Una prueba de Lumia, `journal.test.js` › "viene de la más reciente a la más antigua", falló una
  vez en una corrida completa y pasó en las tres siguientes y en aislado.** Es un intermitente
  preexistente —muy probablemente dos entradas con la misma marca de tiempo al milisegundo— y no lo
  toca este spec. Queda anotado para que quien lo vea no lo busque en Respiración.

**Deuda consciente de Fase 1 (se salda en su spec):**
- **Los 16 íconos de emoción no se hicieron, y es una decisión, no un olvido.** SPEC_12 §10 excluye
  "ilustraciones nuevas" y §7 dice que los íconos de UI siguen pendientes en el manual v1.1 y que hay
  que **pedirlos, no improvisarlos: son material de marca, no de código**. La mañana conserva sus 15
  chips con emoji de SPEC_06. Para hacerlos hace falta: (a) que el manual cierre su §9, (b) la
  geometría de §6.7 —retícula de 24 px, trazo 1,75, formas orgánicas abstractas, nunca caras— y no
  el lienzo 122×130, que es el de los símbolos de marca, y (c) restaurar "Abundante" para volver a
  las 16 de §5.3.
- **La transición de entrada a Formia es un placeholder.** Hoy es la estructura del umbral de Lumia
  —luz tenue, cinco segundos, saltable— sin frase y con la paleta de Formia. Falta el brief de
  diseño: qué le corresponde a un espacio de acción al abrirse, que no tiene por qué ser una luz.
- **Las 60 frases nuevas del día están sin revisar editorialmente**, como las 100 de apertura. Pasan
  §3.6 con prueba automática; el criterio de qué se lee cada mañana es del propietario del producto.
- ~~**El escalado de texto al 200 % no funciona.**~~ **Saldada en SPEC_12.** La escala pasó a `rem` y
  la raíz dejó de fijar `font-size`. Medido: con la raíz a 32 px el texto pasa de 14 px a 28 px.
- **El `_redirects` de Netlify no existe.** Mientras el router sea `HashRouter` no hace falta; si
  alguien lo cambia a `BrowserRouter`, hay que añadirlo antes o las rutas profundas darán 404.
- **Las 100 frases de apertura están sin revisar editorialmente.** Pasan §3.6 con prueba automática
  —sin exclamaciones, sin léxico prohibido, sin promesas ni lenguaje de coach— pero el criterio de
  qué se le dice a alguien al abrir la app es del propietario del producto, no de quien programa.
- **El criterio 8 de SPEC_08 no se puede ejercitar todavía:** ninguna de las doce specs construye el
  onboarding, así que P1 no existe. Lo que sí está garantizado es que el componente sirve a los dos
  sitios —props de configuración, cero dependencias de espacio, tres ciclos por defecto y un lint que
  lo impone—. Cuando exista P1, lo único que tiene que hacer es pasarle su propio copy.
- **La ventana de activación del Ritual de Noche (RN-RN-01) y la extensión de madrugada** siguen sin
  construirse: hacen falta dos campos nuevos en `nightRitual`. Es el mismo hueco que deja RN-VN-05
  a medias desde SPEC_06.
- **`Journal` e `Historial` entran por el mismo andamio provisional** que ya usaba Formia: la
  pestaña "Journal" con un conmutador de dos. SPEC_11 lo sustituye entero.
- **La reautenticación real no se puede ejercitar** hasta que exista el onboarding con sesión de
  Firebase. Lo que sí está probado es que reestablecer el PIN no toca ni una entrada.
- `SesionProvisional.jsx` y la entrada por la pestaña "Tú" (con su conmutador Identidad/Hábitos) son andamios: los sustituyen el onboarding y SPEC_11.
- ~~`src/tokens/index.js` mapea las áreas con ids viejos.~~ **Resuelto al cerrar SPEC_12: se borró.**
  No lo importaba nadie, así que la limpieza correcta no era corregirle los ids sino retirarlo. Con él
  se fueron `src/pages/TuPage.jsx` y `src/components/ui/Chip.jsx`, los otros dos restos de Fase 0 sin
  un solo importador. El catálogo bueno de áreas sigue siendo `AREA_CATALOG` de SPEC_02, que es el que
  usa todo el código.
- Los grises de texto van a `text-ink/80` como mínimo: por debajo no llegan a AAA sobre `paper`.
- El contorno de los días sin marca en la cuadrícula de constancia se mantiene tenue (~2.4:1) por decisión de §5.7. Lo que informa son los días llenos (5.4:1) y el resumen en texto que los acompaña.
- ~~**No correr `npm run format`.**~~ **Resuelto en SPEC_12:** ya hay `.prettierrc` con el estilo del repo (sin punto y coma, comillas simples, ancho 100) y `format:check` está en verde. El CSS y `design-tokens.json` quedan fuera a propósito; el motivo está en `.prettierignore`.
- **De §5.3 y §5.4 quedan fuera, y no por olvido:** la ruta express "Hoy voy con prisa", el modo día difícil (§5.14.1, RN-VM-06), el selector de 24 emojis por fila de agradecimiento, guardar una frase manteniéndola pulsada, y la oferta de partir en algo más pequeño una victoria aplazada tres veces. Ninguno aparece en el alcance de SPEC_06.
- **RN-VN-05 se cumple a medias:** reabrir y volver a cerrar el día no duplica ningún registro, pero la celebración sí se repite tras recargar. Saberlo exigiría un estado `cerrado` que §C5 no recoge; §4.8 lo describía en v3.1.
- **La pestaña "Hoy" también entra por `SesionProvisional`.** Es el mismo andamio que ya usaba Formia y lo sustituyen el onboarding y SPEC_11.

---

Este archivo es **vivo**. Cada spec que cierre actualiza la tabla. Así Claude siempre ve dónde estamos.

Este archivo es **vivo**. Cada decisión nueva se añade aquí, no en otro lado. Así Claude siempre encuentra la fuente única de verdad.

---

**¿Dudas sobre algo de aquí? Pregunta antes de programar.**
