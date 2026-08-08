# CLAUDE.md — Consola ejecutiva de Strivo

**Última actualización:** 4 ago 2026 (v3 del blueprint)  
**Ubicación del blueprint completo:** `/docs/blueprint/`  
**Referencia rápida:** este archivo es para sesiones de desarrollo. Si una decisión no está aquí, busca en los archivos de `docs/blueprint/`.

---

## 1. La esencia (lee esto primero)

**Strivo es un refugio digital donde el usuario termina cada día sintiéndose orgulloso, agradecido, en paz, regulado y esperanzado.**

No es:
- Un rastreador de hábitos (no gamifica ni penaliza).
- Un coach productivo (no da órdenes).
- Una red social (no hay audiencia ni juicio externo).
- Un reemplazo terapéutico (es complementario, no diagnóstico).

**El diferenciador:** la app devuelve la evidencia propia del usuario en su lenguaje de identidad, sin juzgar. Todo hábito, victoria y logro *confirma* quién está intentando ser, nunca lo contradice.

---

## 2. Navegación de la app (estructura de 3 pestañas)

```
┌─────────────────────────────────┐
│  CONTENIDO DINÁMICO             │  (cambia por franja horaria)
│  (Ritual o Vista de Mañana/Noche│
│   según la hora; o Hoy tranquilo)
└─────────────────────────────────┘
┌─ Hoy ─┬─ Journal ─┬─ Tú ────┐
│       │           │  (Insights,
│       │           │   Historial,
│       │           │   Perfil)
└───────┴───────────┴────────┘
```

- **Hoy:** pantalla raíz. Contiene Diario (Vista de Mañana o de Noche según hora) + Rituales (como overlays modales).
- **Journal:** escritura libre, sin estructura.
- **Tú:** espacio de autoconocimiento (Insights, Historial, Perfil, Descubre).

El Diario **NO es una pestaña**; se accede desde Hoy en su momento.

---

## 3. El modelo de identidad (§5.1.1)

**Regla de oro:** todo registrado pertenece a un **área** y confirma la **identidad central**, nunca la contradice.

```
┌─ Identidad central (1)   ─────────────────────────┐
│  "Alguien que crece"                              │
│  · Amplia, estable, emocional                     │
│  · No es una tarea ni un objetivo                 │
│  · Se edita, con historial de versiones           │
└─ Áreas (0..N) ──────────────────────────────────┘
│  Salud · Trabajo · Relaciones · Finanzas · Espiritual · Personal · Creatividad
│  Cada área tiene:
│  - Ícono + color propio (§6.3)
│  - Identidad de área OPCIONAL ("En Salud, alguien que cuida su cuerpo")
│  - Puede pausarse/reanudarse sin perder historial
└─ Hábitos, Victorias, Logros ─────────────────────┘
   Cada uno pertenece a exactamente 1 área
   (o "General" si `areaId = null`)
```

**Implicación arquitectónica:** ningún insight, reporte o feedback puede presentar "bajo registro en Salud" como fracaso (RN-ID-05).

---

## 4. Reglas de UX Writing

**§3.6 — Léxico prohibido (NUNCA aparece):**
- "Fallaste", "incumpliste", "abandonaste", "deberías", "debilidades".
- "Racha", "streak" (usamos "Constancia").
- "Tarea" (usamos "Hábito", "Victoria", "Logro" según contexto).
- Emojis del sistema (solo los 24 de §3.9 en tabla de emociones y el símbolo de cada hábito, §16 de la Parte 4A: objetos y naturaleza, nunca caras ni personas).
- Signos de exclamación, salvo en confirmaciones muy especiales.

**§3.6.4 — Tono:** cálido, cercano, sin condescendencia. Tuteo. Brevedad sin frialdad.

**Ejemplos que SÍ:**
- "Pausado. Aquí estará cuando lo quieras de vuelta."
- "Tu ritual de la mañana está libre. ¿Quieres añadir algo?"
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
- Interfaz: `Satoshi` (Satoshi Regular / Medium) — cuerpo, botones, labels.

**Colores (de `design-tokens.json`):**
- Ink (texto principal): `#241E33`
- Paper (fondo claro): `#FBF8F4`
- Night (fondo oscuro): `#191428` (índigo violáceo, NO puro negro)
- Acentos: Amber, Plum, Sage, Clay, Mist (ver tabla en token).

**Espaciado:** base 4px. Escala 1,25× (4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 100).

**Motion:** duraciones **más lentas que lo normal**. Min 120ms, máx 900ms para cierre nocturno. Preferir easing smooth (ease-in-out).

**Excepciones autorizadas al rango 120–900ms** (no marcarlas en el QA gate):
- **Apertura de Strivo** (`AperturaStrivo`, antes de P1): 5000ms, o 1600ms con movimiento reducido. Es una descompresión, no una transición de interfaz. Tokens en `motion.apertura`.
- **Pantallas de transición del onboarding** (`T4BTransicion`, entre P4B y P4C): 3000ms, o 2300ms con movimiento reducido. Tokens en `motion.transicion`.

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
| **RN-10** | Acceso: 3 pestañas máximo en nav principal. Profundidad máxima 3 toques desde Hoy. |

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
7. ✅ QA emocional (Anexo A): 15 checks específicos según el módulo.

---

## 8. Estructura de datos (§7.2)

**Entidades principales:**

```javascript
// UserProfile (1 por usuario)
{
  identidadCentral: "alguien que crece",
  identidadCentralHistorial: [{texto, desde, hasta}],
  horaDespertar, horaDormir, diaTerminaA: time
}

// Area (0..N por usuario)
{
  id, tipo: enum(...), nombre, color, icono,
  identidadArea?: "alguien que cuida su cuerpo",
  estado: enum(activa, pausada, archivada)
}

// Habit
{
  nombre, areaId, momento: enum(mañana, noche, dia),
  diasSemana: [0-6], estado: enum(activo, pausado, archivado),
  totalCompletados: int  // desnormalizado, solo crece
}

// HabitLog (un registro = hábito marcado en una fecha)
{
  habitId, fecha, hora
  // NO existe fila "falló" — la ausencia es ausencia
}

// Victory (logro del día, luego heredado a la noche)
{
  texto, areaId?, estado: enum(pendiente, lograda, no_se_dio, soltada),
  origenId?: uuid  // si viene de otro día
}

// DailyEntry (central: guarda todo el día)
{
  fecha, userId,
  // contiene referencias a sus Victories, Habits del día, ánimo, etc.
}

// Insight
{
  tipo: enum(...), areaId?, texto, evidencia: [{refId, fecha}],
  generadoPor: enum(reglas, ia)
}
```

**Regla:** `areaId = null` significa "General" (hereda identidad central).

---

## 9. Fases del desarrollo (§8.12 en detalle)

| Fase | Duración | Salida | Criterio para avanzar |
|---|---|---|---|
| **Fase 0** | 4 sem (24 jul – 21 ago) | Sistema de diseño + prototipo navegable de 3 flujos clave | 5 personas describen el prototipo con palabras del campo "calma / cuidado" |
| **MVP** | 7 sem (22 ago – 9 oct) | Diario + Rituales + Hábitos + Journal, sin IA ni suscripción | 40 % con 4+ días en semana 2 |
| **Beta** | 9 sem (10 oct – 11 dic) | Insights (reglas) + Suscripción + Recordatorios inteligentes | D30 ≥ 25 %, conversión a prueba ≥ 8 % |
| **V1** | 18 sem (ene – abr 2027) | IA + Contenido + Nativo | 5k usuarios, D90 ≥ 15 % |

**MVP es lo que entra a la calle primero. Contiene SOLO lo que demuestra el valor central (cerrar el día con evidencia + hábitos que fluyen a rituales). Nada más.**

---

## 10. Cómo navegar los archivos de blueprint

- **§5.1.1 — El modelo de identidad:** léelo antes de tocar onboarding, hábitos o insights.
- **§5.3, §5.5, §5.6 — Vista de Mañana/Noche + Rituales:** todos los bloques, criterios, examples.
- **§5.7 — Hábitos:** ciclo de vida completo, diagrama de proyección ritual, 7 reglas RN-HR-*.
- **§5.9 — Insights:** tipos, reglas de generación, coste de IA.
- **§6.3–6.9 — Sistema de diseño:** tokens de color, tipografía, motion, radios, contraste.
- **Anexo A — QA emocional:** 15 checks por pantalla; corres antes de considerar "terminada".

---

## 11. Los no-negociables

1. **Identidad nunca se contradice:** un logro de trabajo confirma "alguien que crece", no lo viola.
2. **Marcar es un toque:** no puede ser un modal con preguntas. Una casilla, más nada.
3. **Cerrar el día es una ceremonia:** la secuencia de cierre (§3.3) nunca falla, ni siquiera si hay error.
4. **Local-first siempre:** la app funciona completamente sin red. Sync es async.
5. **Sin rachas, sin castigo:** Constancia solo sube. La no realización no genera notificación, alerta ni registro.

**Si una feature los violaría, no entra.**

---

## 12. Stack recomendado (a confirmar contigo)

- **Frontend:** React o React Native (el blueprint es agnóstico, pero ambos son buenos para PWA+nativo).
- **Almacén local:** IndexedDB (web) o SQLite (nativo).
- **Backend:** API serverless (Vercel Functions, Firebase, etc.) para onboarding, suscripción, sync.
- **Design tokens:** consumir desde `design-tokens.json` (copiar a src/tokens/ del proyecto).
- **Copy:** importar desde `copy-library.md` (o JSON si prefieres).

---

## 13. Comandos rápidos para validación

Antes de hacer commit:

```bash
# Pruebas de la capa de datos (IndexedDB de mentira, entorno node)
# Cubren: almacén local, onboarding → perfil, rituales, vistas y el
# recorrido de un día entero (tests/recorridoDelDia.test.js)
npm test

# Verifica que no haya léxico prohibido en strings
grep -r "Fallaste\|Racha\|debería" src/ || echo "✅ Léxico limpio"

# Verifica que todo Hábito tenga areaId
# (depende de tu schema, pero la idea es que nada quede huérfano)

# Corre QA emocional para la pantalla modificada
# (manual por ahora; en Fase 1 lo automati zamos)
```

---

## 14. Próximos pasos después de este archivo

1. **Paso 1:** Extrae los capítulos 5, 6, 7 del blueprint a `/docs/blueprint/` como .md citables.
2. **Paso 2:** Crea `design-tokens.json` desde §6.3–6.9.
3. **Paso 3:** Crea `copy-library.md` desde §3.7–3.11 + Anexo B.
4. **Paso 4:** Crea `.claude/skills/strivo-*.md` con las 4 skills.
5. **Paso 5:** Confirm a tu stack (React? React Native? qué host?) y empezamos Paso 1 del desarrollo.

Este archivo es **vivo**. Cada decisión nueva se añade aquí, no en otro lado. Así Claude siempre encuentra la fuente única de verdad.

---

**¿Dudas sobre algo de aquí? Pregunta antes de programar.**
