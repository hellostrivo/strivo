# Skills de Strivo

Estas cuatro skills encapsulan las reglas más fáciles de romper por accidente durante el desarrollo.

---

## 1. `strivo-voice` — Validar UX copy

**Cuándo usarla:** Antes de comitear cualquier string que el usuario vea (botones, mensajes, notificaciones, etiquetas).

**Qué hace:**
- ✅ Verifica contra léxico prohibido (§3.6.3).
- ✅ Confirma tuteo + warmth (sin exclamaciones innecesarias).
- ✅ Avisa si hay copy que suena a castigo/juicio.
- ✅ Sugiere equivalente si detecta un término problemático.

**Entrada típica:**
```
copy_to_check = "¡Felicidades! Completaste tu racha de 7 días seguidos."
```

**Salida:**
```
❌ PROBLEMAS ENCONTRADOS:
- "¡Felicidades!" → exclamación evitable (§3.6)
- "racha de 7 días seguidos" → usa "racha" (prohibido) y "seguidos" (roto racha = culpa)

✅ ALTERNATIVA:
"14 días contigo. Siete en los últimos dos meses."
```

**Cómo invocar:**
```
# En Claude: "Valida este copy contra la skill strivo-voice"
# En CI: grep + checker local (si implementas en bash)
```

**Implementación:** Ver `/copy-library.md` + comparar contra léxico de §3.6.2–3.6.3.

---

## 2. `strivo-qa-gate` — Verificación emocional antes de "terminado"

**Cuándo usarla:** Cuando una pantalla/módulo se siente completa. Antes de hacer PR.

**Qué hace:**
- Corre Anexo A (15 checks) adaptado a la pantalla.
- Verifica criterios de aceptación específicos del módulo.
- Busca condiciones de error no manejadas.
- Valida copy, contraste, accesibilidad.

**Entrada típica:**
```
Pantalla: Vista de Mañana
Estado: "ready for review"
```

**Salida:**
```
CHECKLIST VISTA DE MAÑANA (Anexo A adaptado):

✅ 1. Ningún string contiene léxico prohibido
✅ 2. Contraste ink/paper ≥ AAA verificado
✅ 3. Frase del día se actualiza sin repetir 365 días
✅ 4. Agradecimientos: mínimo 3 campos, máx 10 ✅
✅ 5. Emociones: máx 3 seleccionables con visual claro
✅ 6. Victorias heredadas a noche automáticamente
✅ 7. Checklist ritual se proyecta desde hábitos, NO guardado en pantalla
⚠️ 8. FALTA: test de "offline" — ¿qué ocurre sin red?
✅ 9. Copy de "vacío" no es acusatorio
✅ 10. Botones 56px mínimo
✅ 11. 200% escalable, sin truncarse
✅ 12. Modo "reducir movimiento" respetado
✅ 13. Lector de pantalla anunciador: orden lógico
✅ 14. Frase inspiradora tiene tooltip con atribución
✅ 15. Interacción "guardar frase" no bloquea

RESULTADO: ⚠️ PASA CON COMENTARIO
Resolver punto 8 (offline) antes de merge.
```

**Cómo invocar:**
```
# En Claude: "Ejecuta strivo-qa-gate en la Vista de Mañana"
# O: "QA de [módulo] antes de considerar terminado"
```

**Implementación:** Checklist largo pero binario por pantalla. Vive en `/qa-checklist.md` (derivado de Anexo A).

---

## 3. `strivo-data-model` — Validar esquema contra identidad + entidades

**Cuándo usarla:** Al crear o modificar cualquier entidad (User, Area, Habit, Victory, etc.). Al diseñar una migración.

**Qué hace:**
- ✅ Verifica que toda entidad respete el modelo de identidad (§5.1.1).
- ✅ Confirma que no exista estado "fallado" en HabitLog.
- ✅ Valida que `areaId` sea presente o null, nunca undefined.
- ✅ Avisa si una relación viola RN-01 a RN-10.
- ✅ Detecta violaciones de local-first (sincronización).

**Entrada típica:**
```
Nueva entidad:
{
  habitId: uuid,
  fecha: date,
  marcado: boolean,  // ❌ PROBLEMA
  falló: boolean     // ❌ PROBLEMA
}
```

**Salida:**
```
❌ VIOLACIONES ENCONTRADAS:

1. Campo "marcado: boolean"
   → HabitLog NO almacena estado. Usa presencia de fila.
   → Si `fecha` existe en HabitLog, fue marcado. Punto.
   → Remueve "marcado"

2. Campo "falló: boolean"
   → Prohibido por diseño (§7.2, RN-06).
   → La NO realización no genera registro.
   → Remueve "falló"

✅ ESQUEMA CORREGIDO:
{
  habitId: uuid,
  fecha: date,
  hora: time
}

EXPLICACIÓN:
El ausencia de un HabitLog para (habitId, fecha) implica "no hecho".
No necesita campo explícito. Ahorra espacio, evita estados imposibles.
```

**Cómo invocar:**
```
# En Claude: "Valida este esquema contra strivo-data-model"
# Con el JSON/TypeScript del modelo propuesto
```

**Implementación:** Lógica de reglas basada en §7.2–7.3 + RN-*. Vive en `/data-model-rules.md`.

---

## 4. `strivo-a11y` — Auditoría de accesibilidad AA

**Cuándo usarla:** Al terminar cualquier componente visual. Antes de cualquier release.

**Qué hace:**
- ✅ Verifica contraste AAA (4.5:1 en cuerpo).
- ✅ Comprueba escalado 200% sin truncamiento.
- ✅ Valida tamaños de toque (mín 56×56 px).
- ✅ Avisa de movimiento no reducible (violación WCAG 2.2).
- ✅ Verifica orden de focus (teclado, lector de pantalla).
- ✅ Detecta colores usados como único medio de comunicación.

**Entrada típica:**
```
Componente: EmotionCard
Propiedades:
- Fondo: #FFFEF0 (paper)
- Texto: #241E33 (ink)
- Borde seleccionado: #8B6BA8 (plum)
- Transición: transform 260ms
- Tamaño botón: 48×48 px
```

**Salida:**
```
AUDITORÍA A11Y — EmotionCard

CONTRASTE:
✅ ink (#241E33) on paper (#FFFEF0): 15.2:1 (AAA)
✅ Borde plum on paper: 8.1:1 (AAA)

ESCALADO:
✅ 200% sin truncamiento (verificado en 2 navegadores)

TOQUE:
⚠️ Botón 48×48 px → aumentar a 56×56 px (WCAG 2.2)

MOVIMIENTO:
✅ Transición respeta prefers-reduced-motion (media query presente)

ORDEN DE FOCO:
❓ ¿Orden lógico de tab? (verificar: izq→der, arriba→abajo)

SOLO COLOR:
✅ Selección visible por color + borde + escala (3 señales, no solo color)

RESULTADO: ✅ PASA CON CAMBIO PEQUEÑO
Aumenta botón a 56px, verifica orden de tab, mergea.
```

**Cómo invocar:**
```
# En Claude: "Audita accesibilidad de [componente] con strivo-a11y"
# O: "a11y check antes de push"
```

**Implementación:** Herramientas: axe DevTools (navegador) + WAVE + verificación manual de orden de focus. Vive como checklist en `/a11y-checklist.md`.

---

## Cómo integrar las 4 skills en el flujo

### Flujo de desarrollo

```
1. CÓDIGO/DISEÑO
   ↓
2. LOCAL: Corre strivo-voice en todos los strings
   ↓
3. LOCAL: Corre strivo-a11y en componentes nuevos
   ↓
4. PUSH → PR
   ↓
5. REVIEW: Ejecuta strivo-data-model en esquemas
   ↓
6. REVIEW: Ejecuta strivo-qa-gate en pantalla completa
   ↓
7. MERGE (si todo ✅)
```

### En CI/CD (opcional, fase posterior)

```bash
# Antes de commit
npm run lint:copy     # valida léxico
npm run lint:a11y     # contraste, escalado
npm run lint:schema   # modelo de datos

# En PR, comentario automático
# "✅ strivo-voice pass | ⚠️ strivo-qa-gate: 14 de 15 checks"
```

---

## Archivo de referencia rápida de cada skill

Cada skill debería tener su propio archivo `.md` en `.claude/skills/`:

- **`strivo-voice.md`** — Léxico prohibido + ejemplos antes/después
- **`strivo-qa-gate.md`** — Checklist Anexo A adaptable por módulo
- **`strivo-data-model.md`** — Reglas de esquema + RN-* aplicables
- **`strivo-a11y.md`** — Criterios WCAG 2.2 AA + herramientas

Cada uno con:
1. Descripción
2. Cuándo usarla
3. Entrada típica
4. Salida típica
5. 3–5 ejemplos reales
6. Links a fuente del blueprint (§ citados)

---

## Las 4 skills están disponibles en `.claude/skills/`

Cuando empieces Paso 1 del desarrollo (Fase 0), puedo crear los archivos `.md` detallados de cada skill. Ahora tienes la idea.

**¿Necesitas que expanda alguna skill ahora, o esperas a tener el repo y stack confirmado?**
