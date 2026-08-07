# STRIVO — Índice de Progreso

**Última actualización:** 5 de agosto de 2026, 22:00  
**Estado:** Fase 0 (Prototipo) — 85% completada  
**Rama activa:** `feat/onboarding-p1-p3c`

---

## Link al repositorio
https://github.com/hellostrivo/strivo

---

## Stack confirmado
- **Frontend:** React + Vite (PWA)
- **Backend:** Firebase (auth, Firestore)
- **Hospedaje:** Netlify
- **Control de versiones:** GitHub
- **IDE:** VS Code + Claude Code
- **Equipo:** 1 persona, 10 horas/semana

---

## Pantallas completadas ✅

### Onboarding (P1–P11)
- ✅ Apertura — 5 s de descompresión antes de P1; se ve una sola vez
- ✅ P1: Bienvenida — degradado horario, "Tu lugar para volver a ti."
- ✅ P2: Nombre — campo simple, solo texto
- ✅ P2A: Género — define el modo de lenguaje adaptativo (m / f / n)
- ✅ P3: Qué te gustaría encontrar aquí — 7 opciones multi-selección, sin bloqueo
- ✅ P4: Identidad central — "Soy alguien que...", 7 chips de sugerencia
- ✅ P4B: Selección de áreas — 7 áreas con color propio, máximo 3 activas
- ✅ T-4B: Transición — 3 s entre elegir y reflexionar; solo si hay ≥ 1 área
- ✅ P4C: Identidad por área — una área por pantalla, opcional, con sugerencias
- ✅ P5: Primer valor — captura algo bueno antes de crear cuenta
- ✅ P6: Horarios — hora de despertar, dormir, fin de día (diaTerminaA)
- ✅ P7: Hábitos de mañana — sugerencias por área, seleccionables
- ✅ P8: Hábitos de noche — sugerencias por área, seleccionables
- ✅ P9: Recordatorios — frecuencia y configuración de notificaciones
- ✅ P10: Crear cuenta — guardado local + Firebase auth
- ✅ P11: Pantalla de cierre — confirmación de onboarding completado

### Rituales
- ✅ **Ritual de Mañana** — 5 pantallas (R1–R5): respiración, bienvenida, identidad+área, hábitos, intención
- ✅ **Ritual de Noche** — 6 pantallas (N1–N6): respiración, herencia de victorias, nuevos logros, agradecimientos, reflexión, ánimo de cierre, hábitos, síntesis con animación de luz 900ms

### Diario
- ✅ **Vista de Mañana** — 6 bloques: frase del día, agradecimientos, emociones (máx 3), gran visión, victorias con área, checklist ritual
- ✅ **Vista de Noche** — 8 bloques: victorias heredadas (con decisiones), nuevos logros, agradecimientos, aprendizaje, estado de sueño, checklist ritual, síntesis, cierre con animación

### Módulos adicionales
- ✅ **Hábitos** — H1 (lista por momento), H2 (detalle 90 días), H3 (crear con sugerencias por área), proyección automática a rituales
- ✅ **Journal** — editor sin fricción, búsqueda simple por palabra
- ✅ **Historial** — calendario con puntos de ánimo, vista de día completa

---

## Arquitectura técnica

### Estructura de carpetas
```
src/
├── tokens/              # Design tokens (colores, tipografía, motion)
├── copy/index.js        # Biblioteca central de copy (nunca hardcodear)
├── lib/
│   ├── db.js           # IndexedDB local-first (§7.2 Blueprint)
│   ├── firebase.js     # Configuración Firebase
│   ├── timeSlot.js     # Lógica de franjas horarias
│   └── ...
├── components/
│   ├── ui/             # Base: Button, Card, Chip, Input
│   └── strivo/         # Específicos: HabitRow, EmotionCard, etc.
├── pages/
│   ├── onboarding/     # P1–P11
│   ├── rituales/       # Ritual de Mañana y Noche
│   ├── diario/         # Vista de Mañana y Noche
│   ├── habitos/        # H1, H2, H3
│   └── ...
└── ...
```

### Decisiones de diseño implementadas
- **Local-first con sync async:** IndexedDB en cliente, Firebase en servidor (RN-02)
- **Sin estado "fallado":** HabitLog solo se crea si hábito se completó (RN-06)
- **Copy centralizado:** todo en src/copy/index.js, ningún string hardcodeado
- **Modelo de identidad de 3 niveles:** central → áreas → identidad por área (§5.1.1)
- **Constancia acumulativa:** nunca se reinicia, solo suma días únicos
- **Motion intencional:** duraciones más lentas (120–900ms), respeta prefers-reduced-motion

---

## Sesiones de trabajo completadas

| Sesión | Qué se hizo | Commits |
|--------|-----------|---------|
| Sesión 1 | P1, P3 (motivo), P4 (identidad) del onboarding | `dbb33cb`, `8fab3b5` |
| Sesión 2 | P4B, P4C, P2 (nombre), P5 + P6–P11 | `48946d9`, `344d328`, `0c5d189` |
| Sesión 3 | Ritual de Mañana (R1–R5) completo | (en progreso) |
| Sesión 4 | Ritual de Noche (N1–N6) + animación | (en progreso) |
| Sesión 5 | Vista de Mañana (6 bloques) | (en progreso) |
| Sesión 6 | Vista de Noche (8 bloques) + cierre | (en progreso) |
| Sesión 7 | Módulo Hábitos completo (H1, H2, H3) | (en progreso) |
| Sesión 8 | Journal + Historial | (en progreso) |

---

## Próximas sesiones (Fase 0, final)

### Sesión 9 — Pulido y ajustes (2 horas)
Navega el prototipo completo como usuaria:
- ¿Se siente cálido y sin presión?
- ¿El copy es el que diseñamos?
- ¿Faltan transiciones o animaciones?
- ¿Hay estados vacíos o casos edge?

Anota cambios y dile a Claude Code. Prioridad: Anexo A (QA emocional).

### Sesión 10 — Pruebas con 5 personas (3 horas)
- Sienta a 5 personas a probar el prototipo sin guiarlas
- Observa dónde se confunden, dónde sonríen
- Escucha qué dicen espontáneamente
- Anota verbatim las palabras que usan

**Criterio de éxito:** 4 de 5 usan palabras como "calma", "cuidado", "orden", "presente"

### Sesión 11 — Incorporar feedback (2 horas)
- Compila el feedback de las 5 personas
- Prioriza cambios (qué es fácil, qué es crítico)
- Dale lista a Claude Code para ajustes finales
- Re-test con 2 de las 5 personas

### Sesión 12 — Preparar para Fase 1 (1 hora)
- Conectar Netlify para CI/CD automático
- Resolver errores de build (CI workflow)
- Documentar decisiones nuevas en blueprint
- Actualizar CLAUDE.md y copy-library.md

---

## Errores conocidos (pendientes)

1. **CI build failing:** Probablemente error de sintaxis en componentes nuevos. Resolvible en Sesión 9.
2. **GitHub caché:** La interfaz web de GitHub tarda en refrescar (no es error real, solo visual).

---

## Métricas del prototipo

- **Total de pantallas:** 30+ navegables
- **Componentes base:** 5+ reutilizables
- **Líneas de copy:** 200+ strings en librería
- **Archivos generados:** 70+ en src/
- **Design tokens:** 50+ variables (colores, tipografía, motion)
- **Tiempo invertido:** ~12 horas en 1 día (sesiones concentradas)

---

## Decisiones pendientes de confirmar

- [ ] ¿Mantener los 4 strings nuevos (Empezar, Continuar, Atrás, progreso)?
- [ ] ¿P9 (recordatorios) debe ser obligatoria o salteable?
- [ ] ¿Enviar confirmación de email al crear cuenta en P10?
- [ ] ¿Integrar Firebase real ahora o esperar a Fase 1?

---

## Referencia rápida

**Estructura de código:**
- Componentes: `src/components/` (ui + strivo)
- Páginas: `src/pages/` (onboarding, rituales, diario, etc.)
- Copy: SIEMPRE de `src/copy/index.js`
- Tokens: importar de `src/tokens/index.js`
- DB: `src/lib/db.js` (esquema §7.2 del blueprint)

**Comandos útiles:**
```bash
npm run dev              # Inicia desarrollo
npm run lint:copy       # Verifica léxico (sin strings prohibidos)
git log --oneline -5    # Últimos 5 commits
git push               # Guardar en GitHub
```

**Archivos maestros:**
- `CLAUDE.md` — Consola ejecutiva (siempre leer primero)
- `ROADMAP.md` — Fases con criterios de éxito
- `docs/copy-library.md` — Todos los strings autorizados
- `.claude/SKILLS.md` — Las 4 skills de validación

---

## Estado de Fase 0

```
[████████████████████░░░░] 85% completada

✅ Componentes base
✅ Design tokens integrados
✅ Onboarding completo (P1–P11)
✅ Rituales de Mañana y Noche
✅ Diario (Vistas de Mañana y Noche)
✅ Hábitos (creación, detalle, lista)
✅ Journal y Historial
⏳ Pulido y pruebas con usuarios
⏳ Arreglar CI build
```

---

## Próximo hito
**Sesión 9:** Pruebas de QA emocional con las 5 personas externas  
**Fecha objetiva:** 12 de agosto de 2026  
**Criterio:** 4 de 5 personas sienten "calma" y "cuidado" en el prototipo

---

*Documento vivo — se actualiza cada sesión*
