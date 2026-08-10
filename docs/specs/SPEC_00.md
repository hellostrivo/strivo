# SPEC_00 — Guía de lectura de las specs de Fase 1

**Proyecto:** Strivo · Fase 1 (División Lumia/Formia)
**Fuente de verdad:** `/docs/blueprint/Strivo_Blueprint_de_Producto_v4_1.md` (209 págs)
**Manual de marca:** `/docs/blueprint/BRAND_MANUAL_STRIVO_LUMIA_FORMIA.md`
**Rama:** `phase-1-lumia-formia`
**Fecha:** 10 ago 2026

---

## 1. Qué es esto

Once specs operativas que traducen el Blueprint v4.1 a trabajo ejecutable. **No sustituyen al blueprint: lo indexan.** Cada spec dice *qué construir* y remite a la sección del blueprint que dice *por qué* y *con qué reglas*.

**Si una spec y el blueprint se contradicen, gana el blueprint.** Si la contradicción es real y no un malentendido, párate y pregunta antes de programar: significa que hay una decisión sin tomar.

---

## 2. Estrategia: borrón y cuenta nueva

Fase 1 **no es un refactor de Fase 0**. El código de Fase 0 se descarta. Se reutiliza:

| Se conserva | Se reescribe |
|---|---|
| Stack (React + Vite + Firebase + Netlify) | `src/components/` completo |
| `CLAUDE.md`, `ROADMAP.md` | `src/pages/` con la estructura Lumia/Formia |
| `.claude/SKILLS.md` (4 skills) | `src/lib/db.js` con el modelo `shared/lumia/formia` |
| `design-tokens.json` (se extiende) | `src/copy/index.js` (estructura sí, contenido se revisa) |
| `src/lib/timeSlot.js` | Todo lo demás |

**Consecuencia para quien implementa:** cuando una spec dice "el Diario no tiene checklist de hábitos", no busques un bloque que borrar. No existe. Se construye sin él.

**Consecuencia de datos:** no hay migración desde Fase 0. Los 5 testers crean cuentas nuevas. Las reglas RN-MIG-01 y RN-MIG-02 del blueprint quedan **latentes** (aplicarían solo si algún día se importa Fase 0), no derogadas. No implementes lógica de migración en Fase 1.

---

## 3. La arquitectura en una pantalla

```
Strivo  = marca madre. No se usa directamente. Es el puente.
Lumia   = hacia dentro.  ¿Cómo estoy?      → Hoy, Journal, Historial, Ritual de Noche
Formia  = hacia delante. ¿Quién quiero ser? → Identidad, Hábitos, Progreso
```

**Una sola app, dos espacios navegables** (§C7.1). Barra inferior de dos pestañas:
`Lumia · Reflexión` y `Formia · Acción` (§C7.3).

**La regla que más restringe el código (RN-DB4-01):**
Lumia no lee `formia/`. Formia no lee `lumia/`. Ningún componente importa datos del otro espacio. Solo Strivo Intelligence puede cruzarlos, y en Fase 1 ni siquiera lo hace (§C7.4).

Si te encuentras escribiendo un import que cruza esa línea, la spec está mal leída o falta una decisión.

---

## 4. Orden de ejecución y dependencias

```
SPEC_02  Capa de datos ────────────── FUNDAMENTO, va primera y sola
   │
   ├── SPEC_03  Formia: identidad
   │      └── SPEC_04  Formia: hábitos H1/H2/H3   (necesita 03)
   │      └── SPEC_05  Formia: progreso           (necesita 03 y 04)
   │
   ├── SPEC_06  Lumia: Hoy y Diario
   │      ├── SPEC_07  Lumia: Journal, Historial, Ritual de Noche
   │      ├── SPEC_08  Lumia: respiración diaria
   │      ├── SPEC_09  Lumia: intención del día
   │      └── SPEC_10  Lumia: transición de entrada
   │
   └── SPEC_11  Navegación de dos espacios  (necesita 03..10 montadas)
          └── SPEC_12  Aplicación de marca   (va la última, sobre todo lo demás)
```

**No adelantes SPEC_11.** La barra se monta cuando hay dos espacios que conectar; montarla antes obliga a rehacerla.

**Cadencia sugerida** (10 h/semana): 02 · 03+04 · 05+06 · 07+08+09+10 · 11+12.
Las horas que aparecen en cada spec son estimaciones, no compromisos.

---

## 5. Anatomía de una spec

Todas tienen las mismas secciones, en el mismo orden:

1. **Objetivo** — una frase.
2. **Dependencias** — qué specs deben estar verdes antes.
3. **Fuente en el blueprint** — secciones a leer *antes* de escribir código.
4. **Alcance** — qué se construye y, explícitamente, **qué no**.
5. **Modelo de datos** — rutas y campos que toca.
6. **Componentes y archivos** — dónde vive.
7. **Reglas aplicables** — los `RN-*` que la gobiernan.
8. **Copy** — strings nuevos; todos pasan por `src/copy/index.js`.
9. **Criterios de aceptación** — la definición de "terminada".
10. **Fuera de alcance** — lo que parece pertenecer y no pertenece.

La sección 4 y la 10 son las importantes. La mayoría de los errores caros vienen de construir de más.

---

## 6. Convenciones del blueprint que hay que conocer

- **Secciones con prefijo `C`** (§C2.3, §C3.6) son nuevas de la división.
- **Secciones sin prefijo** (§5.6, §5.7.4) vienen de v3.1 y **conservan su número original** como identificador estable. No las renumeres ni las cites por su posición nueva.
- **Los identificadores no se reciclan.** El Ritual de Noche tiene cinco pantallas y se llaman N1, N3, N4, N5, N6: N2 se retiró y su número no se reasigna (§C7.7.1).
- **Anexo E** es el Ritual de Mañana derogado: histórico, no implementable.
- **Anexo F** es la matriz de trazabilidad de las 120 secciones de v3.1. Úsala si buscas dónde acabó algo.

---

## 7. Reglas transversales que aplican a toda spec

| Regla | Qué obliga |
|---|---|
| **RN-DB4-01** | Ningún componente de un espacio lee datos del otro. |
| **RN-DB4-05** | `habits.identityRef` nunca es `null` en escrituras nuevas. |
| **RN-DB4-08** | Nada se corrige en silencio. Si falta un dato, se pregunta; no se rellena solo. |
| **RN-02** | Local-first: se guarda en local al instante, la red es asíncrona. |
| **RN-05 / RN-06** | Nunca se presenta ausencia como fracaso. Constancia solo sube. |
| **§3.6** | Léxico prohibido: "fallaste", "racha", "tarea", "deberías". `npm run lint:copy` antes de cada commit. |

**Criterios de aceptación que se repiten en todas** (no se listan en cada spec, se dan por hechos):

1. Cero strings hardcodeados: todo pasa por `src/copy/index.js`.
2. `npm run lint:copy` limpio.
3. Contraste AAA, escalado 200 %, `prefers-reduced-motion` respetado.
4. Funciona offline; la escritura no se pierde si cae la red.
5. Estado vacío = invitación suave, nunca acusación.
6. Error = copy amable + reintento, nunca código de error.

---

## 8. Cómo trabajar cada spec con Claude Code

1. Abre la spec y **lee las secciones del blueprint que cita**, no solo la spec.
2. Implementa el alcance completo, nada más.
3. Corre los criterios de aceptación uno por uno.
4. Commit con el número: `SPEC_04: hábitos con identidad obligatoria`.
5. Si algo no cuadra con el blueprint, **pregunta antes de decidir**. Una decisión tomada sobre la marcha en el código es una decisión que no está documentada en ningún sitio.

---

## 9. Lo que sigue abierto

Dos puntos, ambos menores y ambos marcados en el blueprint:

- **Rótulos exactos de las pestañas.** El naming está decidido (marca + descriptor); la retícula de la barra puede obligar a acortar. Se resuelve maquetando, en SPEC_11.
- **Ciclos de respiración en P1 del onboarding.** RN-LU-RESP-02 asume tres, derivado de unificar el ritmo. Confirmado por el usuario el 10 ago 2026.
- **Dos copys huérfanos** (§C7.7.6): entrada de la respiración y confirmación al completar hábitos. Se redactan en SPEC_08 y SPEC_04.

---

## 10. Índice

| Spec | Título | Espacio | Depende de |
|---|---|---|---|
| 02 | Capa de datos y modelo canónico | Transversal | — |
| 03 | Formia: espacio de identidad | Formia | 02 |
| 04 | Formia: hábitos (H1, H2, H3) | Formia | 02, 03 |
| 05 | Formia: progreso y constancia | Formia | 02, 03, 04 |
| 06 | Lumia: Hoy y Diario | Lumia | 02 |
| 07 | Lumia: Journal, Historial y Ritual de Noche | Lumia | 02, 06 |
| 08 | Lumia: respiración diaria | Lumia | 06 |
| 09 | Lumia: intención del día | Lumia | 02, 06 |
| 10 | Lumia: transición de entrada | Lumia | 06 |
| 11 | Navegación de dos espacios | Transversal | 03–10 |
| 12 | Aplicación de marca | Transversal | 11 |
