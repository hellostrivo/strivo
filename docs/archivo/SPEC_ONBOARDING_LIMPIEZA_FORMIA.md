# SPEC — Limpieza del onboarding: retirar elementos de Formia

> **ARCHIVADO — NO APLICAR.** 25 ago 2026.
>
> Este spec se escribió contra la rama `feat/onboarding-p1-p3c` y **no es
> aplicable a `strivo`**. El diagnóstico del 25 de agosto estableció que esa
> rama es una línea de desarrollo paralela y huérfana: comparte con `strivo`
> únicamente el commit raíz (`ae69a30`), y de 344 rutas solo 23 son comunes
> —andamiaje, no código de producto—. Las pantallas que este documento manda
> eliminar (P4B, P4C, T-4B, P7, P8) **nunca existieron en `strivo`**, que a
> día de hoy no tiene onboarding en absoluto.
>
> **Se conserva por su §3, §4 y §5**, que son la decisión de producto —qué
> pantallas tiene el onboarding y cuáles no— y la base de texto para
> reescribir el copy en F-1. Ver «Onboarding — pendiente para F-1» en
> `CLAUDE.md` §13.
>
> `feat/onboarding-p1-p3c` queda sin integrar y sin borrar.

**Rama de partida:** `feat/onboarding-p1-p3c`
**Rama destino final:** por confirmar (ver §0)
**Fecha del spec:** 25 ago 2026

---

## §0 — Antes de tocar nada

Esta rama (`feat/onboarding-p1-p3c`) se creó **antes** de la separación técnica
Lumia/Formia del 25 de agosto (ver "Plan de Separación Técnica v1.0"). Es
probable que:

- Esté basada en un punto del historial anterior a la rama `strivo` actual
  (la que antes era `phase-1-lumia-formia`).
- Tenga rutas, imports o nombres viejos (`lumia/`, `src/lumia/`, `NavLumia`,
  etc.) que ya no existen en `strivo`.

**Primer paso obligatorio, antes de aplicar cualquier cambio de este spec:**

1. Verificar contra qué commit/rama está creada `feat/onboarding-p1-p3c`.
2. Verificar si necesita rebase sobre `strivo` para partir del estado actual
   del repo (post-separación, con Formia ya retirada).
3. Reportar el diagnóstico y la estrategia de sincronización propuesta
   **antes de aplicar los cambios de contenido de este spec**, y esperar
   confirmación.

No asumir que el resto del repo en esta rama coincide con `strivo`. Si hay
conflicto entre "lo que pide este spec" y "lo que ya no existe en `strivo`",
reportarlo en vez de improvisar una solución.

---

## §1 — Objetivo

El onboarding se pausó con partes del modelo de identidad de 3 niveles
(central → áreas → identidad por área) y con hábitos sugeridos, ambos
pensados para alimentar a Formia. Formia está pausada (rama `formia-paused`,
congelada). Este spec retira del onboarding todo lo que era exclusivo de
Formia, dejando un flujo que solo sirve a Strivo (identidad central +
reflexión), y renumera las pantallas resultantes.

## §2 — Alcance

**Dentro de este spec:**
- Copy (`src/copy/index.js`), sección `onboarding`.
- Componentes de las pantallas eliminadas y su desconexión del stepper/router.
- Estado/modelo de datos que el onboarding escribe (campos de área e
  identidad por área).
- Renumeración de pasos y del indicador de progreso (`Paso {n} de {total}`).
- Tests que cubren las pantallas eliminadas o el conteo de pasos.

**Fuera de este spec (no tocar):**
- El bloque top-level `copy.areas` (líneas 48–70 del archivo de copy actual).
  Es limpieza aparte, pendiente para otra sesión.
- Cualquier otra pantalla de la app fuera del flujo de onboarding.
- El campo `identityRef` u otras piezas del modelo de datos que ya usa
  Strivo fuera del onboarding (Diario, Historial, etc.) — no forman parte
  de este cambio salvo que dependan directamente de un campo eliminado aquí.

## §3 — Pantallas a eliminar por completo

| Clave de copy | Pantalla | Motivo |
|---|---|---|
| `onboarding.p4b` | Selección de hasta 3 áreas | Alimentaba hábitos de Formia |
| `onboarding.p4c` | Identidad por área (una a la vez) | Alimentaba hábitos de Formia |
| `onboarding.t4b` | Transición entre P4B y P4C | Queda huérfana al quitar ambas |
| `onboarding.p7` | Ritual de la mañana (hábitos sugeridos) | 100% Formia |
| `onboarding.p8` | Ritual de la noche (hábitos sugeridos) | 100% Formia |
| `onboarding.habitos` | Bloque de copy común a P7/P8 (selector) | Huérfano al quitar P7/P8 |

Para cada una: eliminar el componente `.jsx` correspondiente, sus tests, su
entrada en el copy, y su paso en el router/stepper del onboarding.

## §4 — Cambios de copy que NO son eliminación de pantalla completa

### `onboarding.p3.options`
Quitar la opción:
```js
habitos: 'Construir hábitos que realmente duren',
```
Quedan 5 opciones + `otro`: `paz`, `avance`, `escucha`, `sueno`, `espacio`, `otro`.

### `onboarding.p11` (pasa a ser `p8`, ver §5)
Quitar las claves que arman la frase de cierre con áreas, porque ya no hay
áreas que insertar:
```js
closingWithAreas: 'Te estás convirtiendo en alguien que {identidad}, en tu {areas}.',
closingPlainWithAreas: 'Aquí empieza tu espacio, en tu {areas}.',
areasJoin: ' y ',
```
Quedan únicamente `closingTemplate` y `closingPlain` (las versiones sin
área). Verificar en el componente de P11/P8 que ya no se arme `{areas}` como
variable de interpolación y que la lógica de "¿tiene áreas elegidas?" se
elimine junto con la rama de código que la consumía.

## §5 — Renumeración de pantallas

El flujo pasa de 11 pasos (con huecos por P5 ya eliminada antes, P2A, P4B,
P4C) a 8 pasos limpios:

| Paso nuevo | Paso anterior | Pantalla |
|---|---|---|
| P1 | P1 | Bienvenida |
| P2 | P2 | Nombre |
| P2A | P2A | Género |
| P3 | P3 | Motivo |
| P4 | P4 | Identidad central |
| P5 | P6 | Horarios |
| P6 | P9 | Recordatorios |
| P7 | P10 | Crear cuenta |
| P8 | P11 | Cierre |

Acciones:
- Renombrar las claves de copy (`p6`→`p5`, `p9`→`p6`, `p10`→`p7`, `p11`→`p8`)
  y todas las referencias a esas claves en componentes y tests.
- Actualizar el `total` que alimenta `onboarding.nav.progressTemplate`
  ("Paso {n} de {total}") a 8.
- Revisar el router/stepper del onboarding (probablemente tiene los pasos
  en un array o switch numerado) y actualizar el orden y el conteo.
- Buscar cualquier referencia hardcodeada a "P4B", "P4C", "P7", "P8", "P9",
  "P10", "P11" en nombres de componentes, rutas, tests o comentarios, y
  decidir si renombrar el archivo/componente o solo su contenido — reportar
  el criterio elegido antes de aplicarlo si toca muchos archivos.

## §6 — Modelo de datos

El onboarding actualmente escribe (según el modelo de identidad de 3
niveles) campos de área e identidad por área al perfil. Al quitar P4B/P4C:

- Dejar de escribir esos campos desde el onboarding.
- Verificar si el esquema los declara como opcionales ya (`areas?`,
  `identidadPorArea?`) — si es así, no requiere migración, solo que el
  onboarding deja de poblarlos.
- Si algún componente posterior al onboarding (fuera de alcance de este
  spec) lee esos campos asumiendo que siempre existen, **reportarlo sin
  tocarlo** — es una dependencia a resolver aparte, no parte de este spec.

## §7 — Criterios de aceptación

1. El flujo completo de onboarding corre de principio a fin en 8 pasos, sin
   referencias rotas a P4B/P4C/P7/P8.
2. `onboarding.nav.progressTemplate` muestra "Paso n de 8" correctamente en
   cada pantalla.
3. P3 (motivo) muestra 5 opciones + Otro, sin la opción de hábitos.
4. La pantalla de cierre (nueva P8) muestra `closingTemplate` o
   `closingPlain` según haya o no identidad central escrita — nunca intenta
   armar una frase con áreas.
5. No quedan imports, componentes, rutas ni tests huérfanos que referencien
   P4B, P4C, T4B, P7, P8 (los antiguos) o `onboarding.habitos`.
6. `npm run lint:copy`, `npm run lint`, `npm run build` y la suite de tests
   completa quedan en verde.
7. No se tocó `copy.areas` (top-level) ni nada fuera del onboarding.

## §8 — Qué reportar antes de aprobar

Siguiendo el flujo de trabajo habitual: si al ejecutar esto se detecta algo
que roza una regla de arquitectura (por ejemplo, un campo del modelo de
datos compartido que otra parte de la app sigue leyendo, o un desfase fuerte
entre esta rama y `strivo`), reportarlo con su razonamiento y esperar
aprobación antes de continuar — no resolverlo por cuenta propia.

---

## Apéndice — Diagnóstico del 25 ago 2026 (por qué no se aplicó)

Ejecutado el §0, el resultado invalidó la premisa del spec:

```
ae69a30 «primer commit» ── (= main, 4 ago)
   ├── feat/onboarding-p1-p3c   43 commits · último 8 ago 2026
   └── phase-1-lumia-formia ──► strivo   53 commits · último 25 ago 2026
```

- `git merge-base strivo origin/feat/onboarding-p1-p3c` → `ae69a30`, el
  commit raíz. Las dos ramas divergen desde el principio del repo.
- La rama solo existe en `origin` y no la contiene ninguna otra: nunca se
  integró en ningún sitio.
- **23 rutas comunes** (18 con contenido distinto), 133 archivos exclusivos
  de feat, 188 exclusivos de `strivo`. Las comunes son `package.json`,
  `vite.config.js`, `index.html`, `App.jsx`, `main.jsx` y poco más.
- La sospecha de §0 sobre nombres viejos (`lumia/`, `NavLumia`) **no se
  cumple**: la rama es anterior a esa nomenclatura y no contiene ni una
  mención de `lumia` ni de `formia`.

Arquitecturas incompatibles:

| | `feat/onboarding-p1-p3c` | `strivo` |
|---|---|---|
| Capa de datos | `src/lib/db.js` monolítico | `src/lib/db/` (schema · shared · diario · local · sync), con `UNKNOWN_FIELD` |
| Pruebas | `tests/` en la raíz | `src/**/__tests__/` colocadas |
| Copy | `hoy`, `ritual`, `ritualManana`, `ritualNoche`, `habits`, `constancia`, `areas` | `diario`, `respiracion`, `historial` |
| Blueprint | v3/v4 | **v5.0** |
| Superficie Formia | `src/pages/habitos/`, `src/pages/ritual/`, `src/lib/habits.js` | nunca existió |
| `lint:contraste`, `format:check` | no existen | obligatorios |

**Acoplamiento detectado (§6/§8 del spec).** En feat, `areas` lo leen 21
archivos fuera del onboarding. La mayoría es superficie Formia
(`pages/habitos/`, `pages/ritual/`, `lib/habits.js`, `lib/habitSuggestions.js`),
pero también `pages/diario/VistaManana.jsx`, `pages/diario/VistaNoche.jsx`,
`lib/animos.js` y `lib/emociones.js` — lado Strivo. El modelo de 3 niveles
no estaba contenido en el onboarding. En `strivo` ese acoplamiento no
existe, y no debe reintroducirse.

**Decisión:** retirar el spec y reencaminar su intención a F-1. Lo único que
se ejecutó en `strivo` fue quitar el bloque `onboarding` muerto de
`src/copy/index.js` —heredado del commit raíz, sin consumidores, anterior
incluso a la versión de feat— y anotar el flujo de 8 pasos en `CLAUDE.md`.
