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
| **SPEC_05** | ✅ Completa y comiteada | 10 ago |
| **SPEC_06** | ✅ Completa | 10 ago |
| **SPEC_07** | ✅ Completa | 10 ago |
| SPEC_08 | → Siguiente | — |
| SPEC_09–12 | Pendientes | — |

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
- npm run lint, test y build verdes · 294 pruebas
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

**Deuda consciente de Fase 1 (se salda en su spec):**
- **La ventana de activación del Ritual de Noche (RN-RN-01) y la extensión de madrugada** siguen sin
  construirse: hacen falta dos campos nuevos en `nightRitual`. Es el mismo hueco que deja RN-VN-05
  a medias desde SPEC_06.
- **`Journal` e `Historial` entran por el mismo andamio provisional** que ya usaba Formia: la
  pestaña "Journal" con un conmutador de dos. SPEC_11 lo sustituye entero.
- **La reautenticación real no se puede ejercitar** hasta que exista el onboarding con sesión de
  Firebase. Lo que sí está probado es que reestablecer el PIN no toca ni una entrada.
- `SesionProvisional.jsx` y la entrada por la pestaña "Tú" (con su conmutador Identidad/Hábitos) son andamios: los sustituyen el onboarding y SPEC_11.
- `src/tokens/index.js` mapea las áreas con ids viejos (`espiritual`, `personal`) y con emoji. El catálogo bueno es `AREA_CATALOG` de SPEC_02; la limpieza es SPEC_12.
- Los grises de texto van a `text-ink/80` como mínimo: por debajo no llegan a AAA sobre `paper`.
- El contorno de los días sin marca en la cuadrícula de constancia se mantiene tenue (~2.4:1) por decisión de §5.7. Lo que informa son los días llenos (5.4:1) y el resumen en texto que los acompaña.
- **No correr `npm run format`:** prettier no tiene configuración y sus valores por defecto (punto y coma, comillas dobles) contradicen el estilo de todo el repo.
- **De §5.3 y §5.4 quedan fuera, y no por olvido:** la ruta express "Hoy voy con prisa", el modo día difícil (§5.14.1, RN-VM-06), el selector de 24 emojis por fila de agradecimiento, guardar una frase manteniéndola pulsada, y la oferta de partir en algo más pequeño una victoria aplazada tres veces. Ninguno aparece en el alcance de SPEC_06.
- **RN-VN-05 se cumple a medias:** reabrir y volver a cerrar el día no duplica ningún registro, pero la celebración sí se repite tras recargar. Saberlo exigiría un estado `cerrado` que §C5 no recoge; §4.8 lo describía en v3.1.
- **La pestaña "Hoy" también entra por `SesionProvisional`.** Es el mismo andamio que ya usaba Formia y lo sustituyen el onboarding y SPEC_11.

---

Este archivo es **vivo**. Cada spec que cierre actualiza la tabla. Así Claude siempre ve dónde estamos.

Este archivo es **vivo**. Cada decisión nueva se añade aquí, no en otro lado. Así Claude siempre encuentra la fuente única de verdad.

---

**¿Dudas sobre algo de aquí? Pregunta antes de programar.**
