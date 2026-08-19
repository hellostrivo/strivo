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

**Fase 1 cerrada.** Las doce specs están implementadas y comiteadas.

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

**Deuda consciente de Fase 1 (se salda en su spec):**
- **Los 16 íconos de emoción no se hicieron, y es una decisión, no un olvido.** SPEC_12 §10 excluye
  "ilustraciones nuevas" y §7 dice que los íconos de UI siguen pendientes en el manual v1.1 y que hay
  que **pedirlos, no improvisarlos: son material de marca, no de código**. La mañana conserva sus 15
  chips con emoji de SPEC_06. Para hacerlos hace falta: (a) que el manual cierre su §9, (b) la
  geometría de §6.7 —retícula de 24 px, trazo 1,75, formas orgánicas abstractas, nunca caras— y no
  el lienzo 122×130, que es el de los símbolos de marca, y (c) restaurar "Abundante" para volver a
  las 16 de §5.3.
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
