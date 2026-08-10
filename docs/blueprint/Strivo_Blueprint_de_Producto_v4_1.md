# Blueprint de Producto — Strivo · Lumia · Formia

**Versión 4.1 — 10 de agosto de 2026**

Reestructuración del Blueprint de Producto v3.1 según la arquitectura de marca Strivo (madre) · Lumia (hacia dentro) · Formia (hacia delante).

| Campo              | Valor                                                                                                                                                                         |
|:-------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Documento          | Blueprint de Producto                                                                                                                                                         |
| Versión            | 4.1                                                                                                                                                                           |
| Sustituye a        | v3.1 (10 ago 2026, 168 páginas) y v4.0                                                                                                                                        |
| Estado             | Listo para generar especificaciones de implementación técnica                                                                                                                 |
| Documento hermano  | `BRAND_MANUAL_STRIVO_LUMIA_FORMIA.md` v1.1 — identidad visual (no se duplica aquí)                                                                                            |
| Alcance del cambio | Reestructuración de arquitectura de producto y de datos. **No** es una revisión de contenido: salvo dos eliminaciones explícitas, todo el detalle técnico de v3.1 se conserva |

## Qué cambia de v3.1 a v4.0

1.  **Strivo deja de ser un producto** y pasa a ser marca madre de dos productos con identidad propia: **Lumia** y **Formia** (Capítulo 0).
2.  **El Ritual de Mañana (R1–R5) se disuelve.** Deja de existir como unidad; cada paso se reubica (§C0.5). El **Ritual de Noche (N1–N6) no se toca**.
3.  **Se elimina el paso R2 (Bienvenida)** por completo. No se reubica en ningún producto.
4.  **Se elimina el bloque “checklist ritual” del Diario** en sus dos vistas (§C2.6). El progreso de hábitos vive únicamente en Formia.
5.  **Ningún hábito puede existir sin una identidad vinculada.** `habits.identityRef` pasa a ser obligatorio (§C0.3, §C3.9, Capítulo 5).
6.  **El modelo de datos se parte en tres `namespaces`:** `shared/`, `lumia/`, `formia/` (Capítulo 5).
7.  **La identidad visual se referencia, no se duplica:** vive en el manual de marca (§C0.6).
8.  **Las 12 decisiones de la división quedan CERRADAS** (Capítulo 7). v4.0 las dejó abiertas; v4.1 las resuelve.

## Qué cambia de v4.0 a v4.1

Ninguna reestructuración: v4.1 **cierra las decisiones** que v4.0 dejó abiertas y propaga sus consecuencias al texto afectado.

| Decisión                         | Resolución                                                                                                                |
|:---------------------------------|:--------------------------------------------------------------------------------------------------------------------------|
| §C7.1 Distribución               | **Una sola app** con dos espacios navegables                                                                              |
| §C7.2 Migración de Fase 0        | Se pregunta **al abrir cada hábito**. `identityRef` nulo se admite **solo** en registros anteriores a v4.0                |
| §C7.3 Naming de navegación       | **Mixto:** marca + subtítulo descriptivo (rótulos exactos pendientes de maquetar)                                         |
| §C7.4 Strivo Intelligence Fase 1 | **Solo evidencia de identidad.** La correlación conducta↔ánimo se pospone                                                 |
| §C7.5 Entrada a Mañana           | **Transición de luz + frase** ya existente. Sin wizard                                                                    |
| §C7.6 Identidad en H3            | **Sugerencia por el texto** del hábito; si no hay señal clara, el campo **queda sin resolver** hasta que la persona elija |
| §C7.7.1 N2 en el Ritual de Noche | **Se retira.** El ritual pasa a **5 pantallas**                                                                           |
| §C7.7.2 Vista de día completo    | **Solo contenido de Lumia**                                                                                               |
| §C7.7.3 Puente de Hoy a Formia   | **No existe.** Los espacios se cruzan solo por la barra                                                                   |
| §C7.7.4 Atributos de área        | Se recuperan `color`, `icon`, `order` y `state` en el mapa `areas`                                                        |
| §C7.7.5 Victorias                | **`lumia/`**, con vínculo de identidad opcional                                                                           |
| §10.2 Ritmo de respiración       | **5-5-3, tres ciclos**, unificado con P1. Voluntaria y saltable siempre                                                   |

## Índice de capítulos

| Capítulo                                   | Contenido                                                                                                                                                          |
|:-------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **0 — Arquitectura de marca**              | Strivo, Lumia, Formia: propósito, taglines, principios de alcance                                                                                                  |
| **1 — Onboarding y capa compartida**       | Todo lo que pertenece a la marca madre                                                                                                                             |
| **2 — Lumia**                              | Hoy, respiración, intención, diario, ritual de noche, journal, historial emocional                                                                                 |
| **3 — Formia**                             | Identidad, hábitos, constancia                                                                                                                                     |
| **4 — Strivo Intelligence**                | Insights cruzados *(especificación futura, no implementada)*                                                                                                       |
| **5 — Modelo de datos actualizado**        | `shared/` · `lumia/` · `formia/`                                                                                                                                   |
| **6 — Decisiones de Fase 0**               | Heredado íntegro de v3.1                                                                                                                                           |
| **7 — Decisiones abiertas de la división** | 6 decisiones + conflictos detectados                                                                                                                               |
| **8 a 15**                                 | Capítulos transversales heredados de v3.1: visión, investigación, voz, arquitectura funcional, sistema de diseño, arquitectura técnica, roadmap y revisión crítica |
| **Anexos A–F**                             | QA emocional, analítica, decisiones, instrucciones, Ritual de Mañana derogado y matriz de trazabilidad                                                             |

# Preámbulo

> **Nota de v4.0.** Este preámbulo se conserva íntegro de v3.1. Su §0.1 a §0.6 describen la naturaleza, la lectura, los supuestos y el vocabulario del documento, y siguen siendo válidos. La convención de numeración y de marcadores de v4.0 está en **§C0.7**.

## 0.1 Naturaleza de este documento

Este documento es el **Blueprint de Producto de Strivo**: la especificación fundacional a partir de la cual deben construirse, sin ambigüedad y sin necesidad de preguntas adicionales, el prototipo navegable, el sistema de interfaz de alta fidelidad, la arquitectura de datos, la capa de inteligencia artificial y el producto final en producción.

No es un documento de marketing. No es un pitch. No es un brief creativo. Es el equivalente interno a la documentación que un equipo de producto de primer nivel redacta *antes* de abrir una herramienta de diseño, cuando aún es barato cambiar de opinión y cuando cada decisión todavía puede discutirse en términos de intención y no de píxeles.

Está escrito para ser leído por ocho perfiles distintos, y cada capítulo indica implícitamente a quién sirve:

| Perfil                           | Capítulos críticos |
|:---------------------------------|:-------------------|
| Product Manager                  | 1, 2, 4, 8, 9      |
| UX Researcher                    | 1, 2, 3            |
| UX Designer                      | 3, 4, 5            |
| UI Designer                      | 5, 6               |
| Behavioral Designer / Psicólogo  | 1, 2, 3, 5, 9      |
| Arquitecto de Software / Backend | 4, 5, 7            |
| Desarrollador Frontend / Mobile  | 5, 6, 7            |
| CTO, inversionista, dirección    | 1, 8, 9            |

## 0.2 Cómo leer este documento

1.  **Nada de lo escrito aquí es decorativo.** Cuando el documento dice “la animación dura 240 ms con curva de entrada suave”, ese número es una decisión de producto, no una sugerencia. Cuando dice “el usuario nunca ve la palabra *fallaste*”, es una regla de negocio verificable en QA.
2.  **Cada decisión relevante lleva su justificación.** El formato es *decisión → razón → efecto esperado en el usuario*. Si un equipo desea cambiar una decisión, debe atacar la razón, no la decisión.
3.  **Los supuestos están marcados explícitamente** (sección 0.4). Todo aquello que el documento decidió por su cuenta ante ausencia de información está señalado para poder revertirse con un solo cambio.
4.  **Los criterios de aceptación son contractuales.** En el capítulo 5, cada módulo termina con una lista de criterios verificables. Una funcionalidad no está “hecha” hasta que todos sus criterios pasan.
5.  **La coherencia manda sobre la creatividad local.** Ninguna pantalla puede introducir un patrón, un color o un tono de voz que no exista en los capítulos 3 y 6.

## 0.3 La pregunta que gobierna el documento

Toda decisión de este blueprint fue evaluada contra dos preguntas, en este orden y sin excepción:

> **1. ¿Esta decisión hace que Strivo sea una mejor experiencia de bienestar para el usuario?**
>
> **2. ¿Esta decisión hace más probable que el usuario quiera volver mañana, sin que se sienta obligado?**

Cuando ambas preguntas entraron en conflicto —y ocurrió varias veces, sobre todo en rachas, notificaciones y monetización— **ganó siempre la primera**. Un producto de bienestar que compra retención a costa de la paz del usuario está roto por diseño, y el mercado tarda entre seis y dieciocho meses en castigarlo. Esa jerarquía es innegociable y debe entenderse como el primer principio arquitectónico de Strivo.

## 0.4 Supuestos declarados

Estos supuestos se tomaron ante ausencia de información o ante contradicciones en el material de partida. Cada uno es reversible; se documenta la alternativa.

| \#   | Supuesto                                                                                                                                     | Justificación                                                                                                                                                                                                                                                               | Alternativa si se revierte                                                                 |
|:-----|:---------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------|
| S-01 | El producto se lanza primero como **PWA instalable** y después como aplicación nativa envuelta (iOS primero).                                | El equipo es de dos personas con ~10 h/semana cada una. Una única base de código es la diferencia entre lanzar en 2026 y no lanzar.                                                                                                                                         | Nativo desde el día uno: multiplica por 2,5 el esfuerzo y retrasa el MVP unos cinco meses. |
| S-02 | El idioma de lanzamiento es **español (México/España neutro)**; el inglés llega en V2.                                                       | El mercado inicial y la voz del producto están escritos en español. Internacionalizar temprano diluye la calidad del copy, que aquí *es* el producto.                                                                                                                       | Bilingüe desde MVP: +15 % de esfuerzo y riesgo alto de copy mediocre en ambos idiomas.     |
| S-03 | Los datos se guardan **cifrados en reposo en servidor**, con opción de cifrado de extremo a extremo (E2EE) para el Journal en V2.            | E2EE completo desde el MVP impide búsqueda del lado servidor, insights por IA y recuperación de cuenta; es un compromiso desproporcionado para el estadio actual.                                                                                                           | E2EE total: elimina insights por IA salvo procesamiento en dispositivo.                    |
| S-04 | **Los “Retos” se reinterpretan como “Programas guiados” y “Compromisos”**, no como una infraestructura separada de gamificación competitiva. | El briefing menciona “retos activos” en Rituales, Recordatorios e Insights, pero existe una decisión previa de eliminar la infraestructura de Retos. Se conserva el *valor* (un foco temporal con principio y fin) sin reconstruir el sistema descartado. Ver §4.6 y §5.11. | Restaurar Retos como entidad de primera clase: ver el impacto en §9.1, riesgo P-03.        |
| S-05 | Precios: **99 MXN/mes, 749 MXN/año, 7 días de prueba**. Modelo *freemium* con journaling completo gratuito.                                  | Decisión previa confirmada del proyecto. Precios fijados como precio de tienda local (terminación psicológica), no como conversión literal de divisa.                                                                                                                       | —                                                                                          |
| S-06 | La IA se ejecuta **en servidor mediante API de modelo de lenguaje**, con presupuesto de coste por usuario premium controlado (§7.9).         | La calidad de lenguaje necesaria para los Insights no es alcanzable hoy con modelos en dispositivo del tamaño viable.                                                                                                                                                       | Modelos en dispositivo: mejor privacidad, peor calidad, mayor tamaño de app.               |
| S-07 | Público **inclusivo y neutral en género**, adulto (22–55 años), hispanohablante urbano con alta carga mental.                                | Decisión previa confirmada.                                                                                                                                                                                                                                                 | —                                                                                          |
| S-08 | No existe componente social, ni comparación entre usuarios, ni contenido público, en ninguna fase del roadmap hasta V3.                      | La intimidad es el activo diferencial. Cualquier capa social introduce comparación, y la comparación es el enemigo declarado de la autocompasión.                                                                                                                           | Ver §9.8, propuesta de “círculos privados” evaluada y rechazada.                           |

## 0.5 Vocabulario canónico

El equipo usará estos términos y solo estos. La consistencia terminológica evita la deriva de producto.

- **Ritual**: experiencia guiada, breve y acotada en el tiempo, que ocurre al inicio (Ritual de Mañana) o al cierre (Ritual de Noche) del día.
- **Diario**: el módulo “Diario de Logros y Agradecimientos”, compuesto por Vista de Mañana y Vista de Noche. Es el corazón del producto.
- **Journal**: la escritura libre, sin estructura. Nunca se le llama “diario” para evitar confusión.
- **Victoria**: uno de los tres objetivos que el usuario define por la mañana. Nunca se llama “tarea” ni “pendiente”.
- **Logro**: algo que el usuario reconoce haber conseguido. Puede provenir de una Victoria cumplida o ser un logro no planeado.
- **Hábito**: acción recurrente que forma parte de un Ritual.
- **Constancia**: la métrica de continuidad del usuario. **Nunca se llama “racha”** en la interfaz (ver §3.6 y §5.9).
- **Insight**: una observación con significado generada a partir de los datos del propio usuario.
- **Refugio**: metáfora rectora del producto. Cuando una decisión de diseño no encaje en la metáfora del refugio, está mal.

## 0.6 Estado del documento

- **Versión 3** — Vigente (4 ago 2026). Cambios de moneda (MXN), navegación de tres pestañas, profundización del módulo de Hábitos y su relación con los Rituales, y **roadmap ejecutivo detallado** (§8.12). Ver el registro de cambios abajo.
- **Versión 1.1** (31 jul 2026) — Introdujo el modelo de identidad de tres niveles (identidad central + áreas + identidad de área).
- **Versión 1.0** (24 jul 2026) — Cerró la fase de definición y habilitó el inicio de diseño de UI y prototipo.
- Las secciones marcadas con **\[PENDIENTE DE VALIDACIÓN\]** requieren investigación con usuarios reales antes de V1; están listadas en §9.9.
- Los anexos contienen la biblioteca completa de copy, el catálogo de estados y el glosario de eventos de analítica.

### Registro de cambios — v3.1 → v4.0 (división Lumia/Formia)

| \#  | Cambio                                                                 | Alcance                                      |
|:----|:-----------------------------------------------------------------------|:---------------------------------------------|
| 1   | Capítulo 0 nuevo: arquitectura de marca                                | Nuevo                                        |
| 2   | Disolución del Ritual de Mañana (R1–R5)                                | §5.5 → §C2.3, §C2.4, §C3.3, §C3.5, Anexo E   |
| 3   | Eliminación de R2 (Bienvenida)                                         | Eliminación de raíz                          |
| 4   | Eliminación del checklist de hábitos del Diario                        | §5.3 Bloque 6, §5.4 Bloque 8, §5.3.1, §5.4.2 |
| 5   | `habits.identityRef` obligatorio                                       | §5.7, §7.2, Capítulo 5                       |
| 6   | Modelo de datos en tres `namespaces`                                   | Capítulo 5 nuevo                             |
| 7   | Reubicación de los 17 módulos de §5.x                                  | Capítulos 1, 2, 3, 4                         |
| 8   | Capítulo 7 nuevo: decisiones abiertas de la división                   | Nuevo                                        |
| 9   | Anexo E (Ritual de Mañana derogado) y Anexo F (matriz de trazabilidad) | Nuevos                                       |

**Lo que NO cambió:** el Ritual de Noche, la voz del producto, el sistema de diseño funcional, la investigación de usuario, el roadmap, la revisión crítica y las decisiones de Fase 0. Todo ello se conserva íntegro.

### Registro de cambios — v3 → v3.1 (implementación de Fase 0, bloques 01–08)

**Versión 3.1 — Vigente (10 ago 2026).** Esta versión no reabre ninguna decisión de producto de la v3: la **documenta contra lo que existe realmente en el repositorio** `github.com/hellostrivo/strivo` tras ocho bloques de implementación. Todo el contenido de la v3 se conserva íntegro. Las adiciones y los ajustes aparecen marcados en línea con la etiqueta **\[ACTUALIZADO EN BLOQUE XX\]**, donde XX es el bloque de implementación que los originó.

**Naturaleza del cambio:** la v1 → v1.1 y la v1.1 → v3 fueron revisiones de *definición*. La v3 → v3.1 es la primera revisión de *reconciliación*: el documento deja de describir únicamente lo que Strivo debería ser y pasa a describir, sección por sección, **lo que Strivo es hoy en Fase 0**, señalando de forma explícita cada punto en el que la implementación difiere de la especificación original y cuál de las dos gana.

**Los ocho bloques integrados:**

| Bloque | Título                            | Naturaleza                             | Secciones tocadas                                                                            |
|:-------|:----------------------------------|:---------------------------------------|:---------------------------------------------------------------------------------------------|
| 01     | Fundamentos: género y contraste   | Infraestructura transversal            | §3.6.5 (nueva), §5.1.3 (nueva), §5.2.3 (nueva), §5.4.3 (nueva), §6.3.7 (nueva), §7.2, §7.4.1 |
| 02     | Pantalla “¿Cómo te vas a dormir?” | Rediseño de pantalla + modelo de datos | §5.4.1 (nueva), §5.6.1 (nueva), §7.2, §7.4.1                                                 |
| 03     | Pantalla Hoy: tema mañana/noche   | **Reversión de decisión previa**       | §4.3.3 (nota), §5.2.1 (nueva), §6.3.8 (nueva), §6.10.1 (nueva)                               |
| 04     | Hábitos: etiqueta de área         | Corrección de regla de presentación    | §5.1.4, §5.2.2, §5.3.1, §5.4.2, §5.5.1, §5.7.4 (todas nuevas)                                |
| 05     | Ejercicio de respiración          | Rediseño + nueva capa de audio         | §5.1.2 (nueva), §6.3.9 (nueva), §6.10.1 (nueva), §6.12.1 (nueva)                             |
| 06     | Journal: rediseño con emociones   | Rediseño de módulo                     | §5.3.2 (nueva), §5.8.1 (nueva), §6.3.10 (nueva), §7.2                                        |
| 07     | Journal: PIN opcional             | Nueva funcionalidad de seguridad       | §5.8.2 (nueva), §5.12.1 (nueva), §7.2, §7.7.1 (nueva)                                        |
| 08     | Validación final cruzada          | Verificación; sin funcionalidad nueva  | Capítulo 10 (nuevo), Anexo A, Anexo C                                                        |

**Cambios estructurales de esta versión:**

- **Capítulo 10 — Decisiones de Fase 0** (nuevo): índice único de decisiones **cerradas** (implementadas, fuera de discusión) y **abiertas** (implementadas con un comportamiento por defecto que espera confirmación del propietario del producto). Sustituye la práctica de dejar las decisiones dispersas por el documento y complementa —sin reemplazarlo— el §9.10 y el Anexo C.
- **§7.4.1 — Esquema IndexedDB de Fase 0** (nuevo): el mapa literal de almacenes locales tal como está implementado, incluido el árbol `users/{uid}/`.
- **Anexo A**: se añaden las comprobaciones 16 a 22, específicas de las capacidades introducidas en Fase 0 (género, contraste por superficie, audio, PIN).
- **Anexo C**: se añaden las decisiones D-B01 a D-B07 al índice de decisiones justificadas.

**Regla de precedencia para esta versión.** Cuando un texto de la v3 y un texto marcado **\[ACTUALIZADO EN BLOQUE XX\]** describan el mismo comportamiento de forma incompatible, **gana el texto marcado**, porque describe código que existe y funciona. El texto original **no se elimina**: se conserva como historia de la decisión, y en cada caso relevante la contradicción se resuelve de forma explícita y nominal en el apartado correspondiente. Esta regla es la única excepción al principio de que el blueprint manda sobre la implementación, y aplica exclusivamente a las secciones marcadas.

### Registro de cambios — v1.1 → v3

- **Moneda:** todos los precios y costes pasan de euros a **pesos mexicanos**. Suscripción: **99 MXN/mes · 749 MXN/año** (fijados como precio de tienda local, no como conversión literal). Costes de infraestructura e IA reexpresados en MXN.
- **Navegación (§4.3.1):** la barra inferior pasa de cuatro a **tres pestañas — Hoy · Journal · Tú**. El Diario deja de ser pestaña y se accede desde Hoy en su momento correcto del día. “Ti” se renombra “Tú” en todo el documento.
- **Hábitos (§5.7):** módulo reescrito y profundizado. Se define qué es un hábito y por qué beneficia al usuario, su ciclo de vida completo (crear → programar → proyectar → marcar → registrar → revisar), y **la relación exacta con los Rituales de Mañana y Noche** mediante el principio “el Hábito es la fuente, el Ritual es la ventana”, con diagrama, reglas RN-HR-01 a RN-HR-07 y un ejemplo completo.
- **Roadmap ejecutivo (§8.12):** nueva tabla maestra por versión con seis dimensiones —funcionalidades, fecha estimada, criterios para avanzar, costos estimados (MXN) y requisitos tecnológicos— más una matriz resumen y una nota específica sobre el alcance del MVP.

### Registro de cambios — v1.0 → v1.1

**Motivo:** en la v1.0 el usuario declaraba una única identidad (“alguien que…”). Eso creaba un riesgo real de *desconexión de identidad*: si alguien declaraba “cuido mi cuerpo” pero registraba casi todo en el trabajo, la app le devolvía una imagen de fracaso. La v1.1 lo resuelve separando la identidad en tres niveles (identidad central + áreas + identidad de área). Ver §5.1.1 y el detalle en el resto del documento.

# Capítulo 0 — Arquitectura de marca

> **Capítulo nuevo en v4.0.** No existe equivalente en v3.1. Todo lo que sigue es la consecuencia estructural de una sola decisión: **Strivo deja de ser un producto y pasa a ser una marca madre con dos productos debajo.**

## C0.1 La decisión

Strivo se documentó hasta v3.1 como **un único producto** que hacía dos cosas a la vez: acompañar a la persona hacia dentro (reflexión, gratitud, diario, journal) y empujarla hacia delante (identidad, áreas, hábitos, constancia). Las dos cosas convivían dentro de las mismas pantallas y, sobre todo, dentro de la misma secuencia: el Ritual de Mañana mezclaba una respiración, un recordatorio de identidad, un checklist de hábitos y una intención emocional en cinco pasos seguidos.

**Decisión validada con 5 usuarios (10 ago 2026):** esas dos cosas son dos productos, no dos secciones.

| Marca      | Rol                                                   | Se usa directamente                                                                                    |
|:-----------|:------------------------------------------------------|:-------------------------------------------------------------------------------------------------------|
| **Strivo** | Marca madre y puente inteligente entre Lumia y Formia | **No.** Es la capa que conecta, autentica y da sentido. La persona nunca “abre Strivo” para hacer algo |
| **Lumia**  | Producto 1 — hacia dentro                             | **Sí**                                                                                                 |
| **Formia** | Producto 2 — hacia delante                            | **Sí**                                                                                                 |

## C0.2 Las tres marcas

### Strivo — la marca madre

- **Tagline:** *“Bienestar que integra y te impulsa.”*
- **Rol:** puente inteligente entre Lumia y Formia.
- **Función de producto:** capa de inteligencia que detecta relaciones entre **lo que la persona hace** (Formia) y **cómo se siente** (Lumia). Especificada en el **Capítulo 4 — Strivo Intelligence**, aún no implementada.
- **Función técnica:** todo lo que ninguno de los dos productos puede tener por duplicado — cuenta, perfil, modelo de usuario, copy, tokens base (**Capítulo 1**).
- **Regla dura:** Strivo no tiene pantallas de uso diario. Si una funcionalidad “vive en Strivo”, o es infraestructura compartida (Capítulo 1) o es un insight cruzado (Capítulo 4). No hay una tercera posibilidad.

### Lumia — Producto 1, hacia dentro

- **Pregunta central:** *¿Cómo estoy?*
- **Territorio:** reflexión, introspección, bienestar emocional. Pausa, calma, escritura.
- **Tagline:** *“Rituales que te devuelven a ti.”*
- **Promesa:** *“Reconoce tu vida mientras la estás viviendo.”*

### Formia — Producto 2, hacia delante

- **Pregunta central:** *¿Quién quiero ser?*
- **Territorio:** identidad, crecimiento, hábitos. Acción, progreso, constancia.
- **Tagline:** *“Hábitos que construyen tu mejor versión.”*
- **Promesa:** *“Actúa desde tu identidad, no desde tus hábitos.”*

## C0.3 Los dos principios de alcance

Estos dos principios son la herramienta de decisión. Ante cualquier funcionalidad nueva o dudosa, se aplican en este orden y resuelven el reparto sin necesidad de discutir la marca.

### Principio 1 — Lumia es dueña de toda la experiencia de ritual

> **Si algo es un momento de escribir, sentir, agradecer o reflexionar, es de Lumia.**

Lumia posee la experiencia de **ritual** entendida como *introspección guiada*: mañana y noche, completa. Ningún otro producto empaqueta contenido como secuencia guiada de pasos. La palabra “ritual” en la interfaz pertenece exclusivamente a Lumia.

**Consecuencia inmediata:** el Ritual de Mañana de v3.1 no podía sobrevivir tal como estaba, porque mezclaba introspección (respiración, intención) con acción (identidad, hábitos). Se disuelve. Ver **§C0.5**.

### Principio 2 — En Formia, ningún hábito existe sin una identidad que lo sostenga

> **Todo hábito en Formia está vinculado a una identidad que la persona quiere construir** — la identidad central (“Alguien que…”) o una identidad de área (Salud, Trabajo…).

- **No existe la posibilidad de crear un hábito suelto.** Un hábito sin identidad vinculada es, conceptualmente, un **error de datos** en este modelo.
- Formia **nunca** empaqueta su contenido como ritual secuencial. Los hábitos se alimentan directamente desde su propio espacio, con contexto de mañana o noche si aplica, pero **sin flujo guiado paso a paso**.
- La expresión técnica de este principio es el campo `habits.identityRef`, obligatorio y no nulo (**Capítulo 5**).

**Brecha detectada en v3.1:** el Blueprint anterior **sí permitía** hábitos sin identidad (`areaId` opcional, área implícita “General”, RN-ID-02 y RN-HB-06). Ver el análisis completo en **§C3.9** y la decisión abierta correspondiente en **§C7.6**.

## C0.4 Cómo se relacionan los tres

    ┌──────────────────────────────────────────────────────────┐
    │                        STRIVO                            │
    │   cuenta · perfil · modelo de usuario · copy · tokens     │
    │   ── y ──                                                │
    │   Strivo Intelligence (insights cruzados, Cap. 4)         │
    └───────────────┬──────────────────────────┬───────────────┘
                    │                          │
        ┌───────────▼──────────┐   ┌───────────▼──────────┐
        │        LUMIA         │   │        FORMIA        │
        │    ¿Cómo estoy?      │   │  ¿Quién quiero ser?  │
        │  hacia dentro        │   │  hacia delante       │
        ├──────────────────────┤   ├──────────────────────┤
        │ Hoy (mañana/noche)   │   │ Identidad central    │
        │ Respiración diaria   │   │ Áreas + identidad    │
        │ Intención del día    │   │   de área            │
        │ Gratitud · logros    │   │ Hábitos (H1/H2/H3)   │
        │ Ritual de Noche      │   │   ↳ siempre colgando │
        │ Diario (mañana+noche)│   │     de una identidad │
        │ Journal (+PIN)       │   │ Progreso y constancia│
        │ Historial emocional  │   │ Compromisos          │
        └──────────────────────┘   └──────────────────────┘
              cómo me siento             qué hago
                    └──────────┬───────────┘
                     Strivo cruza las dos series

**Dirección del flujo de datos:** Lumia y Formia **no se leen entre sí**. Ninguna pantalla de Lumia consulta datos de Formia y ninguna pantalla de Formia consulta datos de Lumia. El único componente autorizado a leer las dos series es **Strivo Intelligence** (Capítulo 4), y lo hace en modo lectura, para producir observaciones — nunca para modificar el estado del otro producto.

Esta regla es la que hace posible la separación de los `namespaces` `lumia/` y `formia/` del Capítulo 5, y la que hace verificable la eliminación del checklist de hábitos del Diario (§C2.6).

## C0.5 El Ritual de Mañana se disuelve

El Ritual de Mañana (R1–R5) de v3.1 **deja de existir como unidad**. No se muda a un producto: se reparte. Ésta es la corrección de mapeo más importante de v4.0.

| Paso v3.1                 | Destino     | Qué pasa exactamente                                                                                                                                                                | Dónde queda                      |
|:--------------------------|:------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------|
| **R1 — Respiración**      | **Lumia**   | Se mantiene como momento diario de introspección. Deja de ser “paso 1 de 5”: pasa a ser una experiencia propia dentro de la sección Mañana de Lumia                                 | §C2.3                            |
| **R2 — Bienvenida**       | **Ninguno** | **Se elimina por completo.** No se reubica en ningún producto                                                                                                                       | Eliminado — rastro en el Anexo E |
| **R3 — Identidad + área** | **Formia**  | Se muda al espacio propio de Formia (identidad central + áreas). Deja de ser paso de ritual: es contenido consultable cuando la persona quiera, no una secuencia diaria obligatoria | §C3.3                            |
| **R4 — Hábitos**          | **Formia**  | Se alimenta directo desde el espacio propio de hábitos (H1/H2/H3), **siempre vinculado a una identidad**. Nunca empaquetado como ritual                                             | §C3.5                            |
| **R5 — Intención**        | **Lumia**   | Se fusiona dentro del display de “Hoy → Mañana”. Deja de ser un paso separado                                                                                                       | §C2.4                            |

**El Ritual de Noche (N1–N6) no se toca.** Se mantiene íntegro dentro de Lumia (§5.6). La especificación completa y derogada del Ritual de Mañana —incluidas sus reglas de negocio RN-RM-01 a RN-RM-06 y sus criterios de aceptación— se conserva como historia de la decisión en el **Anexo E**, con el paso R2 explícitamente eliminado.

## C0.6 Identidad visual — referencia, no duplicación

> **La identidad visual completa vive en `BRAND_MANUAL_STRIVO_LUMIA_FORMIA.md` — este blueprint cubre arquitectura de producto y datos, no especificación visual.**

Lo que está en el manual de marca y **no** se reproduce aquí: paletas de color por marca y momento (Lumia·Mañana, Lumia·Noche, Formia·Mañana, Formia·Noche, neutros Strivo), símbolos vectoriales (`lumia_simbolo.svg`, `strivo_simbolo.svg`, `formia_simbolo.svg`), wordmarks, iconos de tienda, tipografía (Inter para las tres marcas, diferenciadas por peso), escala tipográfica, patrones decorativos y reglas de aplicación de componentes de marca.

Lo que sigue estando en este documento: el sistema de diseño funcional heredado de v3.1 (**Capítulo 12**), que describe comportamiento de componentes, motion, haptics, accesibilidad y estados. Donde ambos documentos hablen de color o tipografía, **manda el manual de marca**.

## C0.7 Convenciones de este documento

| Marcador                             | Significado                                                                                                           |
|:-------------------------------------|:----------------------------------------------------------------------------------------------------------------------|
| `[REUBICADO DE CAPÍTULO X --- v3.1]` | La sección procede de v3.1 y se ha movido de capítulo sin perder detalle técnico. Se marca la primera vez que aparece |
| `[ACTUALIZADO EN BLOQUE NN]`         | Heredado de v3.1: la implementación de Fase 0 modificó esa especificación. Se conserva íntegro                        |
| `[CASO AMBIGUO --- v4.0]`            | Funcionalidad que no encaja limpiamente en Lumia ni en Formia. Se documenta el problema y se lleva al Capítulo 7      |
| `[DEROGADO EN v4.0]`                 | Contenido conservado como historia de la decisión, sin vigencia                                                       |
| `[ELIMINADO EN v4.0]`                | Contenido suprimido de raíz. Solo dos casos: R2 (Bienvenida) y el checklist de hábitos del Diario                     |

**Convención de numeración — importante.** Las secciones escritas para v4.0 llevan el prefijo **`C`** (§C0.3, §C2.4, §C5.1, §C7.6). Las secciones heredadas de v3.1 conservan su número sin prefijo (§5.7.4, §7.2, §4.5). Así, `§C2.4` y `§2.4` nunca se confunden, y cualquier referencia sin `C` remite inequívocamente al texto original.

Los capítulos se renumeran según la arquitectura nueva (0–15 más anexos). **Las secciones reubicadas conservan su numeración de v3.1** (§5.7.4 sigue siendo §5.7.4 aunque ahora viva en el Capítulo 3). Es deliberado: el documento contiene cientos de referencias cruzadas internas —y el repositorio, los archivos de copy y las skills de Claude Code también las usan— que quedarían rotas con una renumeración total. El número de sección es un **identificador estable**, no una posición. El **Anexo F** contiene la matriz completa de trazabilidad v3.1 → v4.0.

# Capítulo 1 — Onboarding y capa compartida

> **La capa compartida es Strivo.** Todo lo que hay en este capítulo pertenece a la marca madre: es infraestructura que Lumia y Formia usan por igual y que **no puede existir por duplicado**.

## C1.1 Qué es la capa compartida

La regla para decidir si algo pertenece aquí tiene una sola pregunta: **¿tendría que existir dos veces si Lumia y Formia fueran dos empresas distintas?** Si la respuesta es que sí y eso sería absurdo (una cuenta, un nombre, un género, un horario), pertenece a la capa compartida.

| Componente compartido                                                           | Origen v3.1                            | Por qué es compartido                                                                              |
|:--------------------------------------------------------------------------------|:---------------------------------------|:---------------------------------------------------------------------------------------------------|
| **Onboarding completo (P1–P11)** — nombre, género, horarios, creación de cuenta | §5.1                                   | Una sola vez, para los dos productos. Captura datos que alimentan a ambos                          |
| **Autenticación (Firebase)**                                                    | §7.7, §5.1 (P10)                       | Una cuenta, no dos                                                                                 |
| **Perfil / ajustes**                                                            | §5.12, §5.12.1                         | La persona edita su nombre, su género y sus horarios en un solo sitio                              |
| **Modelo de usuario** — nombre, género, `diaTerminaA`, horarios                 | §7.2 UserProfile                       | `shared/profile` (Capítulo 5)                                                                      |
| **Sistema de copy centralizado y helper de género**                             | §3.6.5 \[Bloque 01\]                   | Los dos productos hablan con la misma voz y respetan el mismo género                               |
| **Design tokens base** — contraste, tipografía compartida                       | §6.3.7 \[Bloque 01\] + manual de marca | El contraste y la tipografía son comunes; el color **no** (cada marca tiene su paleta: ver manual) |
| **Recordatorios inteligentes**                                                  | §5.13                                  | \[CASO AMBIGUO — v4.0\] Notifican sobre rituales (Lumia) y sobre hábitos (Formia). Ver §C7.7       |
| **Descubre — Ciencia del Bienestar y Audioteca**                                | §5.11                                  | \[CASO AMBIGUO — v4.0\] Catálogo de contenido, no encaja en ninguna de las dos preguntas centrales |
| **Estado de regreso**                                                           | §5.15                                  | Se activa por ausencia de la persona, no de un producto                                            |
| **Protocolo de contenido sensible**                                             | §5.16                                  | Obligación de seguridad; se aplica allí donde se escriba                                           |
| **Paywall y matriz gratuito/premium**                                           | §5.17, §4.10                           | Un solo modelo de negocio para el sistema                                                          |

## C1.2 Onboarding: qué alimenta a cada producto

El onboarding se ejecuta **una sola vez** y reparte lo que captura entre los tres `namespaces`. No se divide en “onboarding de Lumia” y “onboarding de Formia”.

| Paso                                     | Captura                                | Destino                                                            |
|:-----------------------------------------|:---------------------------------------|:-------------------------------------------------------------------|
| P1 Bienvenida + respiración              | —                                      | Lumia (§C2.3 hereda el ejercicio de P1)                            |
| P2 Nombre · P2A Género                   | `name`, `gender`                       | `shared/profile`                                                   |
| P3 Por qué estás aquí                    | `motivos[]`                            | `shared/`                                                          |
| P4 Identidad central                     | “Alguien que…”                         | **`formia/identity/` `central`**                                   |
| P4B Áreas (máx. 3)                       | `areas[].selected`                     | **`formia/identity/` `areas`**                                     |
| P4C Identidad por área (opcional)        | `areas[].identityText`                 | **`formia/identity/` `areas`**                                     |
| P6 Horarios                              | `wakeTime`, `sleepTime`, `diaTerminaA` | `shared/profile`                                                   |
| P7–P8 Hábitos sugeridos (mañana y noche) | Hábitos con emoji y área               | **`formia/habits`** — **con `identityRef` obligatorio: ver aviso** |
| P9 Recordatorios                         | Horas de notificación                  | `shared/`                                                          |
| P10 Crear cuenta                         | Firebase                               | `shared/auth`                                                      |
| P11 Cierre                               | —                                      | —                                                                  |

> **Aviso sobre P7–P8.** Los hábitos sugeridos del onboarding se proponen **por área** (§5.1.4), de modo que ya nacen con un vínculo natural a una identidad de área. **Pero:** si la persona omite P4B (áreas) y aun así acepta hábitos sugeridos, esos hábitos nacerían sin `identityRef`, exactamente el caso que el Principio 2 prohíbe (§C0.3, §C3.9). La solución técnica evidente es asignarles `identityRef = "central"`, que siempre existe — pero **eso es una decisión de flujo y queda abierta en §C7.6**, junto con el caso equivalente de H3.

## C1.3 Nota sobre el modelo de identidad

El modelo de identidad de tres niveles (§5.1.1) se capturaba en el onboarding y por eso vivía documentado dentro de §5.1. **En v4.0 se ha reubicado al Capítulo 3 (Formia)**, porque la identidad es el eje estructural de ese producto y no un subproducto del alta. El onboarding sigue siendo el lugar donde se captura por primera vez; el modelo, sus tres niveles y sus reglas RN-ID-01 a RN-ID-06 se especifican en el Capítulo 3.

## 5.0 Plantilla de especificación

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

Cada módulo se especifica con esta estructura. Si un apartado no aplica, se indica explícitamente “no aplica” en lugar de omitirse.

**Objetivo · Contexto · Wireframe textual · Jerarquía visual · Componentes · Comportamiento · Microinteracciones · Animaciones · Estado vacío · Estado de carga · Estado offline · Estado de error · Accesibilidad · Persistencia · Sincronización · Reglas de negocio · Criterios de aceptación.**

**Convenciones de los wireframes textuales:**

    ┌─────────────────────────┐   marco de pantalla
    │ [Texto]                 │   texto estático
    │ ‹ Botón ›               │   botón
    │ ▭ campo de texto        │   campo editable
    │ ☐ / ☑                   │   casilla
    │ ◍                       │   ilustración o gráfico
    │ ···                     │   contenido desplazable
    └─────────────────────────┘

## 5.1 Módulo: Onboarding

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

### Objetivo

Que en menos de tres minutos el usuario (a) haya experimentado el valor central del producto al menos una vez, (b) haya declarado quién quiere ser, y (c) tenga la app configurada a su vida real. **El onboarding no es un formulario: es la primera sesión de Strivo.**

### Contexto

El usuario acaba de descargar la app, probablemente de noche, probablemente con esperanza y escepticismo mezclados (persona Mariana, escenario de descarga). Ha abandonado apps parecidas antes. Cada pantalla adicional cuesta usuarios: la caída típica en onboardings de bienestar es del 6–9 % por pantalla.

### Decisión estructural: onboarding en tres capas

| Capa                       | Momento                          | Duración | Contenido                                                                     |
|:---------------------------|:---------------------------------|:---------|:------------------------------------------------------------------------------|
| **Capa 1 — Esencial**      | Inmediata, antes de crear cuenta | 60–90 s  | Bienvenida, motivo, identidad central, áreas, nombre, primer momento de valor |
| **Capa 2 — Configuración** | Tras el primer momento de valor  | 60 s     | Horarios, hábitos iniciales, notificaciones, cuenta                           |
| **Capa 3 — Progresiva**    | Días 2 a 7, una pregunta por día | 10 s/día | Áreas de vida, experiencia previa, preferencias finas, voz                    |

**Justificación:** el onboarding progresivo reduce el abandono inicial (menos preguntas antes del valor), aumenta la calidad de las respuestas (el usuario ya entiende para qué sirven) y crea razones naturales para volver los días 2–7, que son exactamente los días de mayor mortalidad. Esta es una de las decisiones de mayor impacto en retención de todo el documento.

### Flujo detallado — Capa 1

**P1. Bienvenida**

    ┌─────────────────────────┐
    │                         │
    │         ◍ (luz)         │
    │                         │
    │   Bienvenido a Strivo   │
    │                         │
    │  Un espacio para        │
    │  reconocer lo que sí    │
    │  estás logrando.        │
    │                         │
    │      ‹ Empezar ›        │
    │   Ya tengo una cuenta   │
    └─────────────────────────┘

- Sin carrusel. Sin “siguiente, siguiente, siguiente”.
- Animación: la luz central respira una vez (1,6 s) y se detiene.

**P2. ¿Por qué estás aquí?** (selección múltiple, máximo 3)

Opciones: *Quiero sentirme menos abrumado · Quiero valorar más lo que tengo · Quiero ser constante en algo · Quiero conocerme mejor · Quiero dormir con la cabeza más tranquila · Quiero avanzar hacia una meta · Otra cosa.*

- Se usa para elegir la frase de bienvenida, el orden de sugerencias y el primer Compromiso propuesto.
- Botón secundario: “Todavía no lo sé” → ruta neutra válida.

**P3. ¿En quién te estás convirtiendo?** (identidad central)

Pantalla clave del producto. Copy: *“No preguntamos qué quieres lograr. Preguntamos en quién te estás convirtiendo.”*

- Campo de texto con prefijo fijo visible: **“Alguien que…”** ▭
- Ejemplos rotatorios como texto de ayuda (no como opciones cerradas): *…crece cada día · …se respeta a sí misma · …no se abandona · …termina lo que empieza · …vive con calma.*
- Debajo, seis sugerencias tocables que rellenan el campo, todas editables.
- **Esta es la *identidad central*: una sola, deliberadamente amplia.** No describe un área concreta de la vida (cuerpo, trabajo, familia), sino la razón profunda por la que la persona está aquí. Es el paraguas bajo el cual caben todas las áreas.
- **Justificación:** el marco de identidad (Clear, Oyserman) predice mejor la persistencia conductual que el marco de objetivos. Que la identidad central sea amplia —“alguien que crece” en lugar de “alguien que cuida su cuerpo”— evita el problema de la *desconexión de identidad*: si la identidad fuera de un área específica y los logros del usuario vinieran de otra, la app le devolvería una imagen falsa de sí mismo (ver §5.1.1 y la debilidad resuelta en §9.4). Con una identidad central amplia, cualquier logro de cualquier área **confirma** la identidad, nunca la contradice.

**P3B. ¿En qué áreas de tu vida quieres crecer?** (áreas de identidad)

- Copy: *“Nadie crece en una sola dirección. Elige las que importan ahora. Podrás cambiarlas cuando quieras.”*
- **Selección múltiple**, sin límite máximo pero con recomendación amable a partir de 4: *“Con tres o cuatro es más fácil no dispersarse.”*
- Áreas disponibles (cada una con ícono y color propios del sistema de diseño): **Salud · Trabajo y carrera · Relaciones y familia · Finanzas · Espiritual · Crecimiento personal · Creatividad · Otra** (con campo libre).
- La opción **Espiritual** se oculta si el usuario desactivó las opciones espirituales (coherencia con §5.3, bloque 3).
- **Justificación:** este es el nivel donde la vida realmente ocurre. Separar la identidad central (una, estable, emocional) de las áreas (varias, cambiantes, concretas) resuelve la pregunta más importante del producto: cómo ser honesto con alguien que una semana vive el 90 % en el trabajo y otra semana en su salud, sin hacerle sentir que ha traicionado nada.

**P3C. ¿Cómo te describes en cada área?** (identidades de área — opcional)

- Copy: *“Si quieres, ponle palabras. Si no, lo dejamos para después.”*
- Por cada área elegida en P3B, un campo opcional con prefijo **“En {área} soy alguien que…”**:
  - *En Salud soy alguien que… cuida su cuerpo*
  - *En Trabajo soy alguien que… hace un trabajo del que se enorgullece*
  - *En Relaciones soy alguien que… está presente con su gente*
- Cada campo tiene 3 sugerencias tocables específicas del área, todas editables.
- **Completamente saltable.** Un usuario puede tener solo identidad central + áreas sin frases de área; la app funciona igual. Las identidades de área enriquecen los Insights pero nunca son obligatorias.
- **Justificación:** para la persona Andrés (avanzada) esto es oro; para la persona Daniel (mínima fricción) es ruido. Hacerlo opcional sirve a ambos. La estructura de datos existe siempre; el usuario decide cuánto la llena.

> **Modelo mental completo (para todo el equipo):** - **Identidad central** → *una*, amplia, estable, emocional. “Alguien que crece.” - **Áreas** → *varias*, concretas, cambiantes. Salud, Trabajo, Relaciones… - **Identidad de área** → *opcional*, una por área. “En Salud soy alguien que cuida su cuerpo.” - **Hábitos, Victorias y Logros** → siempre pertenecen a **un área** (§5.7, §5.3), y a través del área conectan con su identidad de área y con la identidad central.
>
> Así, un logro de Trabajo confirma tu identidad de Trabajo *y* tu identidad central “alguien que crece”. Nunca hay contradicción entre lo que declaras ser y lo que registras hacer.

**P4. ¿Cómo te llamas?** - Solo nombre de pila. Sin apellidos, sin correo aún. - Copy: *“Solo tu nombre. Nada más.”*

**P5. Primer momento de valor — “Empecemos ahora”**

Antes de pedir cuenta, horarios o permisos, el usuario **usa el producto**:

    ┌─────────────────────────┐
    │  Mariana, antes de      │
    │  configurar nada:       │
    │                         │
    │  ¿Qué es una cosa       │
    │  buena que te pasó hoy? │
    │                         │
    │  ▭                      │
    │                         │
    │     ‹ Guardar ›         │
    │      Ahora no           │
    └─────────────────────────┘

Al guardar: transición al cierre suave, con el texto *“Esto ya es tuyo. Así de fácil va a ser cada día.”*

**Justificación:** entregar el valor antes de pedir compromiso es el patrón con mayor impacto conocido en activación de apps de journaling. Convierte una promesa en una experiencia.

### Flujo detallado — Capa 2

**P6. Tus horarios** — dos selectores grandes: “Suelo despertar a las…” y “Suelo dormir a las…”. Opción destacada: **“Mis horarios cambian mucho”** → activa el modo de horario variable (persona Rosa).

**P7. Tu ritual de mañana** — se proponen 3 hábitos derivados de las **áreas elegidas en P3B**, ya marcados, editables y eliminables, **cada uno con su área ya asignada y visible**. Si el usuario eligió Salud y Trabajo, se propone un hábito de cada una más uno transversal. Máximo 3 sugeridos. Copy: *“Empieza con poco. Siempre puedes añadir más.”*

**P8. Tu ritual de noche** — igual, con 2 hábitos propuestos, priorizando las áreas con menos hábitos en la mañana para lograr equilibrio inicial entre áreas.

**P9. Recordatorios** — pantalla de pre-permiso con el mensaje real de ejemplo renderizado como notificación: \> *“Buenos días. ¿Cómo quieres sentirte hoy?” — 6:45*

Copy: *“Dos mensajes al día como máximo. Puedes cambiarlos o quitarlos cuando quieras.”* Botones: ‹ Activar recordatorios › / “Ahora no”.

**P10. Guardar tu espacio (cuenta)** — Copy: *“Para que nada se pierda si cambias de teléfono.”* Opciones: Apple, Google, correo. Botón secundario real y visible: **“Seguir sin cuenta”** (datos solo locales, con aviso claro y no alarmista). Este botón es obligatorio para la persona Rosa y para cualquiera con desconfianza tecnológica.

**P11. Cierre del onboarding** — Resume en una frase lo declarado, uniendo identidad central y áreas: *“Te estás convirtiendo en alguien que crece, en tu salud y en tu trabajo. Nos vemos mañana a las 6:45.”* Si el usuario no eligió áreas, se usa solo la identidad central. Botón: ‹ Entrar a Strivo ›.

### Capa 3 — Onboarding progresivo (días 2–7)

Una pregunta breve, al final del ritual, nunca antes:

| Día | Pregunta                                                                                  | Uso                              |
|:----|:------------------------------------------------------------------------------------------|:---------------------------------|
| 2   | ¿Cómo te describes en {área con más actividad}? (identidad de área, si no la puso en P3C) | Enriquece Insights de esa área   |
| 3   | ¿Has usado antes apps de este tipo? ¿Cómo te fue?                                         | Ajuste de expectativas y de tono |
| 4   | ¿Prefieres que te hable cálido o directo? (con ejemplos)                                  | Ajuste de voz (§3.6.4)           |
| 5   | ¿Qué hábitos ya tienes que quieras registrar?                                             | Victorias tempranas garantizadas |
| 6   | ¿Cuánto tiempo quieres dedicarle al día? (1, 3, 5 min)                                    | Longitud del ritual              |
| 7   | ¿Quieres poner un foco para las próximas semanas?                                         | Compromiso                       |

> **§5.1.1 (El modelo de identidad) se ha reubicado al Capítulo 3 — Formia.** Sigue siendo la referencia canónica sobre identidad para toda la aplicación; el onboarding sigue siendo el lugar donde se captura por primera vez.

### Componentes

Selector de opciones tipo chip, campo de texto con prefijo, **selector de áreas (chips múltiples con color)**, **campo de identidad de área con prefijo dinámico**, selector de hora circular, tarjeta de hábito sugerido, notificación simulada, botón primario, enlace secundario, indicador de progreso **muy sutil** (línea de 2 px, sin números).

### Microinteracciones y animaciones

- Transición entre pantallas: deslizamiento horizontal de 320 ms con desvanecimiento cruzado.
- Selección de chip: escala 1,0 → 1,04 → 1,0 en 180 ms + háptica ligera.
- En P3, al escribir la identidad central, el fondo se aclara un 6 % de forma progresiva. Efecto: la pantalla “responde” a la declaración.
- En P3B, al seleccionar cada área, aparece brevemente su color de acento en el fondo (200 ms) para que el usuario asocie desde el primer momento cada área con su color.
- En P3C, los campos de identidad de área aparecen de uno en uno, en el color de su área, con desplazamiento suave.
- P5 termina con la animación de luz de cierre (§3.3).

### Estados

- **Vacío:** no aplica (siempre hay contenido).
- **Carga:** creación de cuenta con indicador circular sobrio y copy *“Preparando tu espacio…”*, máximo 8 s antes de ofrecer reintento.
- **Offline:** todo el onboarding funciona sin conexión salvo la creación de cuenta; si no hay red, se completa en modo local y se ofrece crear cuenta después mediante una tarjeta persistente en Perfil.
- **Error:** correo ya registrado → *“Ya existe una cuenta con ese correo. ¿Entramos con ella?”*.

### Accesibilidad

Todos los textos escalables hasta 200 %; foco lógico y anunciado por lector de pantalla; los chips son botones con estado seleccionado anunciado; los campos tienen etiqueta persistente, no solo *placeholder*; se puede completar el onboarding entero con teclado externo.

### Persistencia y sincronización

Cada respuesta se guarda localmente al instante. Si se abandona a mitad, al reabrir la app se retoma en la última pantalla contestada, con copy *“Seguimos donde lo dejaste”*. Al crear cuenta, los datos locales se asocian a ella sin duplicar.

### Reglas de negocio

- **RN-ON-01** No se pide permiso de notificaciones antes de P9.
- **RN-ON-02** No se muestra paywall durante el onboarding. **El primer paywall aparece como mínimo el día 3.**
- **RN-ON-03** Ninguna pregunta es obligatoria salvo el nombre (P4) y la identidad central (P3), y esta última acepta las sugerencias predefinidas. Las áreas (P3B) y las identidades de área (P3C) son opcionales.
- **RN-ON-04** El onboarding completo (capas 1 y 2) no puede superar las 13 pantallas. P3B y P3C se presentan encadenadas a P3 con transición fluida para que se perciban como un solo momento de “definir quién eres”, no como tres pantallas.

### Criterios de aceptación

1.  Un usuario puede llegar desde la instalación hasta guardar su primera entrada en ≤ 90 segundos.
2.  Todas las pantallas se pueden saltar excepto P3 (identidad central) y P4 (nombre). P3B y P3C son saltables.
3.  Al cerrar la app en cualquier punto y reabrirla, el progreso se conserva íntegro.
4.  Si se deniega el permiso de notificaciones, la app funciona sin degradación y no vuelve a pedirlo antes de 14 días, y solo una vez más.
5.  La identidad central declarada en P3 aparece textualmente en el Ritual de Mañana del día siguiente.
6.  Las áreas elegidas en P3B aparecen como opciones de categoría al crear hábitos y victorias, con su color e ícono.
7.  Si el usuario no elige ninguna área, la app funciona con la identidad central y todos los logros se asignan a “General” sin ningún error ni fricción.
8.  Una identidad de área escrita en P3C aparece en el detalle de los hábitos de esa área y en sus Insights.
9.  Sin conexión, el onboarding se completa y no se muestra ningún error bloqueante.

### 5.1.2 P1 — Ejercicio de respiración guiada \[ACTUALIZADO EN BLOQUE 05\]

**Qué cambia respecto de la especificación original.** El texto original de P1 (arriba, “Flujo detallado — Capa 1”) describe una luz central que *“respira una vez (1,6 s) y se detiene”*. La implementación de Fase 0 sustituye ese gesto decorativo por un **ejercicio de respiración guiada real**, con ritmo terapéutico, color propio y audio opcional. El resto de P1 —copy de bienvenida, botón “Empezar”, enlace “Ya tengo una cuenta”, ausencia de carrusel— **no cambia**.

**Por qué.** P1 es el primer contacto con el producto y el único momento del onboarding en el que el usuario todavía no ha tomado ninguna decisión. Un ejercicio de respiración de duración honesta en ese punto hace tres cosas a la vez: baja el pulso de alguien que probablemente abrió la app en un momento de saturación, demuestra en cinco segundos que este producto va más lento que los demás (§1.5.5), y establece la primera experiencia de “esta app me cuida” antes de pedir un solo dato.

#### El círculo

- **Color:** naranja/dorado **visible**, token `--color-breath` (§6.3.9). **Corrección explícita:** en la versión anterior del prototipo el círculo se pintaba con el color del fondo, de modo que el ejercicio era invisible y el usuario no sabía qué mirar. El círculo debe contrastar con el degradado de amanecer en todas sus paradas.
- **Escala:** 1,0 en reposo → 1,18 en inhalación plena → 1,0 en exhalación. Sin desplazamiento, sin rotación, sin partículas.
- **Halo:** desenfoque suave que crece con la escala y decrece con ella; opacidad máxima 0,35. Refuerza la percepción de volumen sin añadir un elemento nuevo.

#### Temporización: patrón 5-5-3

| Fase    | Duración | Copy visible | Movimiento del círculo              |
|:--------|:---------|:-------------|:------------------------------------|
| Inhalar | **5 s**  | “Inhala”     | Escala 1,0 → 1,18, curva de entrada |
| Exhalar | **5 s**  | “Exhala”     | Escala 1,18 → 1,0, curva de salida  |
| Pausa   | **3 s**  | “Descansa”   | Estático en 1,0                     |

- **Ciclo completo: 13 segundos.** La pausa va **al final del ciclo**, no entre inhalación y exhalación: el patrón es **5-5-3, no 5-3-5**. Esta distinción se cerró de forma explícita durante la revisión y es una decisión cerrada (Capítulo 10).
- **Corrección explícita:** la versión anterior del prototipo ejecutaba el ciclo notablemente más rápido, lo que producía el efecto contrario al buscado (aceleraba en lugar de calmar). Cualquier regresión hacia una duración menor es un defecto, no una optimización.
- **Sin cuenta atrás visible y sin números.** El copy de fase es la única señal textual.
- **Saltable siempre**, con un enlace discreto. Saltar no tiene coste, no pide confirmación y no se registra como abandono.

#### Sonido sincronizado

La especificación completa de la capa de audio está en **§6.12.1**. Resumen operativo para P1:

- Tono suave **ascendente durante la inhalación** y **descendente durante la exhalación**, silencio durante la pausa.
- **Generado en tiempo real con la Web Audio API.** No hay archivos de audio en el paquete: cero peso adicional de descarga, cero latencia de carga, y el tono se sincroniza con la animación por construcción y no por coincidencia.
- **Nunca suena sin un gesto previo del usuario.** El contexto de audio se crea y se reanuda dentro del manejador del gesto que inicia el ejercicio.
- **Control de silencio visible** (icono de altavoz) en la propia pantalla, alcanzable en un toque.
- **Preferencia persistida** en `AppPreferences.sonidoRespiracion` (§7.2): si el usuario silencia, sigue silenciado la próxima vez.
- **Limpieza completa al salir:** osciladores detenidos, nodos desconectados y contexto cerrado al desmontar la pantalla. No debe quedar ningún nodo activo ni ningún temporizador vivo.

#### Accesibilidad

- **Teclado:** el control de inicio/pausa y el control de silencio son alcanzables con tabulación y activables con Enter y con la barra espaciadora. El orden de foco es: iniciar/pausar → silenciar → saltar.
- **Lector de pantalla:** una región `aria-live="polite"` anuncia el cambio de fase (“Inhala”, “Exhala”, “Descansa”). No se anuncia la escala ni el progreso numérico.
- **Etiquetas:** el control de silencio expone su estado (`aria-pressed`), nunca solo el icono.
- `prefers-reduced-motion`**:** el círculo **no escala**; el ejercicio se comunica **solo con opacidad** (y con el copy de fase). **Las duraciones se mantienen: 5-5-3.** Esta es una diferencia deliberada respecto de la regla general de §6.10 (“transiciones reducidas a desvanecimientos de 120 ms”): aquí la duración *es* el contenido terapéutico, no una animación de transición, y acortarla destruiría el ejercicio. La contradicción se resuelve a favor de mantener el ritmo.

#### Criterios de aceptación

1.  El círculo es visible y distinguible del fondo en las tres paradas del degradado de amanecer, con contraste ≥ 3:1 frente al fondo adyacente.
2.  Un ciclo completo dura 13 s ± 100 ms, medido de inicio de inhalación a fin de pausa.
3.  Sin ningún gesto del usuario, no se reproduce ningún sonido.
4.  Silenciar, salir de la app y volver a entrar mantiene el estado silenciado.
5.  Al abandonar la pantalla, no queda ningún `AudioContext` en estado `running` ni ningún temporizador activo.
6.  Con “reducir movimiento” activado, no hay cambio de escala y el ciclo sigue durando 13 s.
7.  Todo el ejercicio es operable sin ratón ni pantalla táctil.

### 5.1.3 Captura del género y copy adaptativo en el onboarding \[ACTUALIZADO EN BLOQUE 01\]

El Bloque 01 introduce en el modelo de datos el campo `UserProfile.genero` (§7.2), del que depende todo el copy con marca de género de la aplicación (§3.6.5).

- **Valores:** `m` (masculino), `f` (femenino), `n` (neutro). El valor por defecto, y el que se aplica mientras el dato no exista, es `n`.
- **Captura:** se pregunta en el onboarding, junto a los datos de identidad de la Capa 1, con opciones explícitas y con una alternativa de no responder que conduce a `n`. Ninguna ruta del onboarding queda bloqueada por este campo.
- **Edición:** siempre disponible desde Perfil → Mi identidad (§5.12.1). El cambio es inmediato y retroactivo en toda la interfaz.
- **Uso:** exclusivamente para resolver copy. **No se usa para segmentar contenido, ni para elegir sugerencias, ni para analítica, ni se envía a la capa de IA** (§7.9). Es un dato de presentación, no un dato de perfilado.
- **Copy del onboarding afectado:** bienvenida (“Bienvenido”/“Bienvenida”), ejemplos rotatorios de identidad central de P3 (“...se respeta a sí mismo / a sí misma”), confirmaciones de P4 y P5, y el cierre de P11.

### 5.1.4 Etiqueta de área en los hábitos sugeridos (P7–P8) \[ACTUALIZADO EN BLOQUE 04\]

Las pantallas de hábitos sugeridos muestran, bajo el nombre de cada hábito, **el nombre del área a la que pertenece o nada**. **Ya no muestran la frase de identidad de área.** La regla única que gobierna este comportamiento en toda la aplicación está en **§5.7.4**; aquí solo se registra su efecto local:

- Un hábito sugerido para el área Salud muestra la etiqueta **“Salud”**.
- Un hábito sin área asignada, o cuya área no está entre las áreas seleccionadas por el usuario, **no muestra etiqueta alguna**. No se muestra “General”, ni un guion, ni un espacio reservado.
- La etiqueta usa el color del área (§6.3.2) como punto de color, con el nombre en texto plano.

## 5.12 Módulo: Perfil y Ajustes

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

### Estructura

| Sección                    | Contenido                                                                                                                                                                                                                                                                                                                                                           |
|:---------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Mi identidad**           | **Identidad central** (editable, con historial de versiones — ver cómo ha cambiado quien quieres ser es un insight en sí mismo); **áreas de identidad** (añadir, editar, reordenar, pausar o quitar, cada una con su color, ícono e identidad de área opcional); objetivo principal; Compromiso activo. Pausar o quitar un área nunca borra su historial (RN-ID-04) |
| **Rituales y horarios**    | Hora de despertar/dormir, modo de horarios variables, “mi día termina a las 3:00”, modo guiado o vista libre                                                                                                                                                                                                                                                        |
| **Notificaciones**         | Interruptor general, horas, tipos, intensidad (mínima/normal), **botón “Pausar todo durante 7 días”**                                                                                                                                                                                                                                                               |
| **Privacidad y seguridad** | Bloqueo biométrico, PIN, ocultar contenido en multitarea, entradas privadas                                                                                                                                                                                                                                                                                         |
| **Tus datos**              | Exportar (JSON, PDF), importar (Day One, Five Minute Journal, CSV), borrar cuenta, ver qué se guarda y dónde, en lenguaje humano                                                                                                                                                                                                                                    |
| **Apariencia**             | Tema claro/oscuro/automático, temas de color, tamaño de texto, reducir movimiento, mostrar opciones espirituales                                                                                                                                                                                                                                                    |
| **Voz de Strivo**          | Cálido / Directo, con ejemplo real                                                                                                                                                                                                                                                                                                                                  |
| **IA**                     | Reflexiones con IA (sí/no), qué datos se procesan, promesa de no entrenamiento                                                                                                                                                                                                                                                                                      |
| **Suscripción**            | Estado, gestión, **cancelación en dos toques y sin fricción emocional**                                                                                                                                                                                                                                                                                             |
| **Ayuda**                  | Preguntas frecuentes, contacto, recursos de apoyo emocional, acerca de                                                                                                                                                                                                                                                                                              |

**Regla:** el botón de cancelar suscripción no puede estar a más de dos toques desde Perfil, y el flujo de cancelación **no puede usar confirmshaming**. Copy: *“Puedes volver cuando quieras. Tus cosas seguirán aquí.”*

### 5.12.1 Ajustes introducidos en Fase 0 \[ACTUALIZADO EN BLOQUES 01, 05 y 07\]

La tabla de estructura de §5.12 se mantiene íntegra. Estos ajustes se suman a las secciones ya existentes:

| Sección de Perfil          | Ajuste nuevo                            | Bloque | Comportamiento                                                                                                                                                                                                                                              |
|:---------------------------|:----------------------------------------|:-------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Mi identidad**           | **Género**                              | 01     | Tres opciones más una de no responder. Cambia el copy de toda la app de forma inmediata y retroactiva (§3.6.5). Guardado en `UserProfile.genero`. Editable siempre, sin advertencias.                                                                       |
| **Apariencia**             | **Sonido del ejercicio de respiración** | 05     | Interruptor que refleja y fija `AppPreferences.sonidoRespiracion`. Es la misma preferencia que controla el icono de altavoz de P1: cambiarla en un sitio la cambia en el otro.                                                                              |
| **Privacidad y seguridad** | **Proteger mi journal**                 | 07     | Interruptor, desactivado por defecto. Al activarlo, flujo de creación de PIN (4–6 dígitos, confirmación en dos pasos). Al desactivarlo, exige el PIN vigente. Deshabilitado —con explicación— si la cuenta no tiene correo ni teléfono vinculados (§5.8.2). |
| **Privacidad y seguridad** | **Cambiar mi PIN**                      | 07     | Visible solo con la protección activa. Exige el PIN vigente y genera salt nuevo.                                                                                                                                                                            |
| **Privacidad y seguridad** | **Vincular cuenta para poder usar PIN** | 07     | Pantalla `CuentaParaPin`: añade correo o teléfono a la cuenta de Firebase desde el propio panel de ajustes y, al terminar, habilita el interruptor de protección.                                                                                           |

**Reglas:**

- Ningún ajuste nuevo introduce fricción en el arranque: los tres tienen un valor por defecto funcional y ninguno se pregunta de forma proactiva después del onboarding.
- El copy del ajuste “Proteger mi journal” **no puede** prometer cifrado (§5.8.2, regla de copy).
- El cambio de género **no** pide confirmación, **no** advierte de consecuencias y **no** se registra en analítica más allá del evento genérico de cambio de ajuste, sin valor (§7.11).

## 3.6.5 Arquitectura de copy género-adaptativo \[ACTUALIZADO EN BLOQUE 01\]

\[REUBICADO DE CAPÍTULO 3 — v3.1\]

**Problema que resuelve.** El español marca género en adjetivos y participios. Un copy escrito en masculino genérico —“¿Cómo te sientes hoy? Tranquilo”— le devuelve a una usuaria una imagen que no es la suya, exactamente en los momentos de mayor carga emocional del producto (cierre del día, estado de sueño, reconocimiento de logros). Durante la primera revisión del prototipo se detectó este fallo en la pantalla de estado de sueño, que mostraba “Tranquilo” y “Pensativo” a una usuaria que había declarado género femenino. El Bloque 01 lo resuelve **en la infraestructura, no pantalla por pantalla**.

**Decisión.** Todo string con marca de género deja de ser una cadena literal y pasa a ser un **objeto de tres formas** resuelto en tiempo de render por un único helper compartido.

### El contrato `{ m, f, n }`

    // Forma canónica de un string con marca de género
    {
      m: 'Tranquilo',      // masculino
      f: 'Tranquila',      // femenino
      n: 'En calma'        // neutro: SIN marca de género, redactado de nuevo
    }

- `m` — forma masculina.
- `f` — forma femenina.
- `n` — forma neutra. **No es la forma masculina reutilizada ni una variante con “-e”.** Es una redacción alternativa que evita por completo la marca de género. Cuando no exista una redacción neutra natural, se admite el desdoblamiento con barra (`mismo/a`) únicamente en textos de ajustes y nunca en copy emocional.
- **Prohibición dura:** no se usa la terminación “-e” (*elle*, *tranquile*, *orgullose*) en ninguna cadena de la aplicación. Es una decisión de voz, no de política: la voz de Strivo (§3.6.1) es la de una persona que habla claro y sin subrayarse a sí misma, y una forma que llama la atención sobre su propia gramática rompe la calma de la pantalla.

### El helper de resolución

    // src/copy/gender.js  (único punto de resolución de toda la app)
    resolveGender(value, genero)
      · Si value es string          -> devuelve value sin tocarlo
      · Si value es { m, f, n }     -> devuelve value[genero] ?? value.n ?? value.m
      · Si genero es undefined/null -> devuelve value.n  (neutro es el fallback)
      · Si falta la clave pedida    -> cae a n, y si tampoco existe, a m
      · Nunca lanza excepción: una cadena vacía es preferible a una pantalla rota

**Reglas duras de uso:**

- **RN-GEN-01** Ningún componente puede leer `copy.algo.m` o `copy.algo.f` directamente. **Toda** lectura pasa por el helper. Una lectura directa es un fallo de revisión de código, no un atajo aceptable.
- **RN-GEN-02** Ninguna cadena con marca de género puede quedar escrita literalmente en un componente (*hardcoded*). Esto extiende la regla ya vigente de copy centralizado (§3.6.2) con un criterio verificable adicional.
- **RN-GEN-03** El valor de género vive en `UserProfile.genero` (§7.2), es **editable en cualquier momento** desde Perfil (§5.12.1), y su cambio se refleja **inmediatamente en toda la interfaz, incluidas las pantallas de historial**, porque el género se resuelve en render y nunca se persiste dentro del dato.
- **RN-GEN-04** **Se persisten identificadores estables, nunca etiquetas visibles.** Un estado de sueño guardado como `"tranquilo"` (id) se renderiza como “Tranquila” o “Tranquilo” según el perfil vigente; un estado guardado como la cadena `"Tranquilo"` congelaría el género del día en que se escribió. Esta regla es la razón técnica del cambio de esquema descrito en §5.4.1 y §7.2.
- **RN-GEN-05** El valor neutro es el **comportamiento por defecto** de todo el sistema. Si el usuario no ha declarado género, o eligió no declararlo, la app funciona completa y correctamente en neutro. Ninguna pantalla puede exigir el dato.
- **RN-GEN-06** El texto libre escrito por el usuario **nunca se transforma**. El helper solo actúa sobre copy del producto.

### Alcance de aplicación

El helper está activo en **toda** la aplicación. Los módulos con mayor densidad de marcas de género son, en orden:

| Módulo                       | Ejemplos de copy afectado                                                                                                     |
|:-----------------------------|:------------------------------------------------------------------------------------------------------------------------------|
| Onboarding (§5.1)            | “Bienvenido/Bienvenida”, “listo/lista para empezar”, ejemplos de identidad (“alguien que se respeta a sí mismo / a sí misma”) |
| Ritual de Mañana (§5.5)      | Saludo dinámico, recordatorio de identidad, copy de cierre de R5                                                              |
| Ritual de Noche (§5.6)       | Copy de N5 (estado de sueño), síntesis de cierre                                                                              |
| Diario — vista mañana (§5.3) | Emociones deseadas (“Agradecido/Agradecida”, “Orgulloso/Orgullosa”, “Conectado/Conectada con Dios”)                           |
| Diario — vista noche (§5.4)  | Estado de sueño, matices, copy de celebración                                                                                 |
| Journal (§5.8)               | Catálogo de 15 emociones del selector, copy de estado vacío                                                                   |
| Hábitos (§5.7)               | Copy de constancia y de detalle de hábito                                                                                     |

### Criterios de aceptación del Bloque 01 (copy)

1.  Cambiar el género en Perfil y volver a cualquier pantalla del historial muestra las etiquetas en el género nuevo, sin migración de datos y sin recargar la aplicación.
2.  Un usuario sin género declarado recorre onboarding, ritual de mañana, ritual de noche, Diario, Hábitos y Journal sin encontrar una sola marca de género masculina por defecto.
3.  Una búsqueda en el árbol de componentes no encuentra ninguna lectura directa de `.m` o `.f` fuera de `src/copy/gender.js`.
4.  Ninguna cadena de la aplicación contiene una terminación “-e” de género inclusivo.

## 6.3.7 Tokens de contraste por superficie \[ACTUALIZADO EN BLOQUE 01\]

\[REUBICADO DE CAPÍTULO 6 — v3.1\]

**Problema que resuelve.** Los tokens de §6.3.1 nombran colores (`--color-ink`, `--color-night-text`), no **roles**. Cada componente tenía que saber sobre qué fondo estaba pintado para elegir el color correcto, y en cuanto un componente se reutilizó en un fondo distinto —la pantalla Hoy en modo noche— apareció texto oscuro sobre fondo oscuro. El Bloque 01 introduce tokens **de rol** y un mecanismo de propagación.

| Token                         | Valor                   | Uso                                               |
|:------------------------------|:------------------------|:--------------------------------------------------|
| `--color-text-on-light`       | `#241E33`               | Texto principal sobre cualquier superficie clara  |
| `--color-text-on-light-soft`  | `#5B5470`               | Texto secundario sobre superficie clara           |
| `--color-text-on-light-faint` | `#8E88A0`               | Texto terciario y ayudas sobre superficie clara   |
| `--color-text-on-dark`        | `#F2EEF7`               | Texto principal sobre cualquier superficie oscura |
| `--color-text-on-dark-soft`   | `#B4ACC6`               | Texto secundario sobre superficie oscura          |
| `--color-text-on-dark-faint`  | `#8F87A6`               | Texto terciario y ayudas sobre superficie oscura  |
| `--color-border-on-light`     | `rgba(36,30,51,.12)`    | Bordes y separadores sobre superficie clara       |
| `--color-border-on-dark`      | `rgba(242,238,247,.16)` | Bordes y separadores sobre superficie oscura      |

Los valores de texto reutilizan deliberadamente los de §6.3.1: **no es una paleta nueva, es una capa de indirección**. Cambiar la paleta base sigue siendo un cambio en un solo sitio.

### El mecanismo `data-surface`

    <!-- El contenedor declara la superficie; los hijos no saben nada -->
    <section data-surface="light"> … </section>
    <section data-surface="dark">  … </section>

    [data-surface="light"] {
      --color-text:       var(--color-text-on-light);
      --color-text-soft:  var(--color-text-on-light-soft);
      --color-text-faint: var(--color-text-on-light-faint);
      --color-border:     var(--color-border-on-light);
    }
    [data-surface="dark"]  {
      --color-text:       var(--color-text-on-dark);
      --color-text-soft:  var(--color-text-on-dark-soft);
      --color-text-faint: var(--color-text-on-dark-faint);
      --color-border:     var(--color-border-on-dark);
    }
    /* Todo componente usa var(--color-text) y nunca un color literal. */

- **RN-SURF-01** Ningún componente puede fijar un color de texto literal ni leer `--color-ink` / `--color-night-text` directamente. Usa `var(--color-text)` y hereda.
- **RN-SURF-02** Toda pantalla o sección con fondo propio **debe** declarar `data-surface`. Anidar superficies está permitido: la más cercana gana, que es el comportamiento natural de las variables CSS en cascada.
- **RN-SURF-03** El mecanismo es **independiente del modo claro/oscuro del sistema** (§6.13). Una tarjeta oscura dentro de una pantalla clara declara `data-surface="dark"` y funciona; el modo del sistema no interviene.
- **Alcance:** activo en toda la aplicación — onboarding, rituales, Diario, Journal, Hábitos, Hoy, Perfil, Historial.

## 5.13 Capa: Recordatorios Inteligentes

\[REUBICADO DE CAPÍTULO 5 — v3.1\] · **\[CASO AMBIGUO — v4.0\]** — notifica sobre rituales (Lumia) y sobre hábitos (Formia). Ver §C7.7.

### Objetivo

Ayudar al usuario a volver en el momento oportuno, sintiéndose acompañado y nunca presionado.

### Arquitectura del sistema

**Nivel 1 — Recordatorios base (MVP)** - Mañana: a la hora de despertar declarada + 15 min. - Noche: a la hora de dormir declarada − 45 min. - Ambos configurables o desactivables por separado. - Mensajes de la biblioteca variable (§3.10), sin repetición en 21 días.

**Nivel 2 — Adaptación por comportamiento (Beta/V1)** - **Aprendizaje de horario:** el sistema registra a qué hora abre realmente el usuario y ajusta el envío en ventanas de ±90 min respecto a la hora declarada, con un máximo de 15 min de desplazamiento por semana (**cambios graduales para no romper el anclaje del hábito**). - **Supresión inteligente:** si el usuario ya registró algo ese día, la notificación correspondiente no se envía. Regla obvia y sorprendentemente incumplida por casi todo el sector. - **Reducción por saturación:** si tres notificaciones consecutivas del mismo tipo no producen apertura, la frecuencia de ese tipo se reduce a la mitad automáticamente y se avisa al usuario una vez: *“Voy a escribirte menos. Puedes cambiarlo cuando quieras.”* - **Acompañamiento en riesgo de abandono:** con 2 días sin registro, un mensaje suave; con 5, un mensaje con contenido de valor (un recuerdo propio); con 10+, un mensaje cada 5 días como máximo; con 30+, uno mensual.

**Nivel 3 — Recordatorios contextuales (V2)** - Recordatorio de hábito individual (opcional, por hábito). - Celebración de hitos (máximo 1 cada 15 días). - Recordatorio de Compromiso activo. - Entrega programada de una carta al yo futuro. - **Reactivación con valor:** en lugar de “vuelve”, se envía algo que el usuario escribió: *“Hace tres meses escribiste algo que quizá quieras releer.”* — **la reactivación más eficaz posible sin manipulación, porque el gancho es el propio usuario.**

### Reglas duras del sistema

- **RN-NT-01** Máximo 2 notificaciones por día por defecto, 4 como techo absoluto configurable.
- **RN-NT-02** Nunca entre las 23:59 y la hora de despertar, salvo configuración explícita.
- **RN-NT-03** Nunca se incluye contenido escrito por el usuario en el texto de la notificación.
- **RN-NT-04** Nunca se menciona un número de días perdidos, un porcentaje ni una comparación.
- **RN-NT-05** Nunca se usa lenguaje de pérdida, urgencia, culpa o abandono.
- **RN-NT-06** Ninguna notificación promocional (suscripción) puede enviarse a un usuario que no haya usado la app en 7 días.
- **RN-NT-07** El usuario puede pausar todas las notificaciones durante 7, 14 o 30 días con un solo toque, y la app se lo recuerda amablemente al final del periodo.

### Criterios de aceptación

1.  Registrar por la mañana suprime la notificación matinal de ese día.
2.  Ningún mensaje se repite en 21 días.
3.  Tras tres notificaciones ignoradas del mismo tipo, la frecuencia se reduce automáticamente.
4.  Un conjunto de pruebas verifica que ninguna cadena de notificación contiene términos de la lista prohibida.

## 5.11 Módulo: Descubre (Ciencia del Bienestar y Audioteca)

\[REUBICADO DE CAPÍTULO 5 — v3.1\] · **\[CASO AMBIGUO — v4.0\]** — catálogo de contenido; no responde a *¿cómo estoy?* ni a *¿quién quiero ser?*. Se aloja en la capa compartida por defecto.

### Ciencia del Bienestar

**Objetivo:** dar respaldo y profundidad. Responde al *“¿por qué funciona esto?”* y aumenta el valor percibido de la suscripción.

- **Formato:** artículos de 3–5 minutos, escritos en la voz de Strivo, cada uno con: una idea central, evidencia citada con referencia real, y **una acción concreta que se integra en el Diario con un toque** (“Probar esto esta noche” → añade una pregunta extra a la Vista de Noche durante 7 días).
- **Organización por pregunta, no por categoría académica.** Ejemplos de secciones: *“¿Por qué me cuesta tanto ser constante?” · “¿Por qué recuerdo lo malo con más nitidez?” · “¿Sirve de algo dar las gracias por escrito?” · “¿Qué pasa en mi cerebro cuando escribo lo que siento?”*
- **Programas guiados** (§4.6): secuencias de 14/21/30 días que combinan una lectura breve diaria con una pregunta añadida al Diario. Pausables, retomables, sin estado de fallo.
- **Regla de honestidad:** ninguna afirmación sin referencia; los tamaños de efecto se comunican con humildad (“los estudios sugieren”, no “está demostrado que”).

### Audioteca

**Objetivo:** acompañamiento sonoro para momentos concretos, no una biblioteca de meditación (Strivo no compite con Calm).

- **Organización por momento y necesidad**, no por duración ni por autor: *Para empezar el día · Para soltar el día · Para cuando no puedes dormir · Para cuando la cabeza no para · Para respirar 60 segundos · Para volver después de un tiempo.*
- **Duraciones cortas:** 60 s a 8 min. Nada de 45 minutos.
- **Reproductor:** minimalista, con temporizador de sueño, control desde pantalla bloqueada, descarga para escucha sin conexión (premium) y **continuidad al bloquear la pantalla** (requisito para escuchar en la cama con el teléfono boca abajo).
- **Innovación propuesta (V2):** *“Tu cierre de hoy”* — un audio de 90 segundos generado con voz sintética cálida que lee al usuario sus propios agradecimientos del día antes de dormir. **Alto impacto emocional, coste técnico medio, absolutamente diferencial.** Requiere consentimiento explícito y desactivación fácil.

## 5.15 Estado de regreso

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

Se activa cuando el usuario vuelve tras ≥ 7 días sin registro. **Especificación exacta:**

1.  **Nunca se menciona el número de días ausentes.**
2.  Primera pantalla: saludo específico *“Qué bueno tenerte de vuelta”* + una cita de algo que el propio usuario escribió, elegida entre sus entradas mejor valoradas emocionalmente.
3.  Ningún calendario con huecos, ninguna métrica reiniciada, ninguna disculpa solicitada.
4.  Se ofrece la ruta más corta posible: *“¿Escribimos algo de hoy?”* con un único campo.
5.  La Constancia sigue exactamente donde estaba. **Este es el pago de la decisión de no tener rachas, y hay que hacerlo visible:** *“Sigues en 63 días contigo. No se perdió nada.”*
6.  Tras el primer registro de regreso, se restablece la cadencia normal de notificaciones.

**Criterio de aceptación:** en ninguna pantalla del estado de regreso aparece un número de días de ausencia, ni una métrica reiniciada, ni la palabra “volviste a” en tono de reproche.

## 5.16 Protocolo de contenido sensible

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

**Objetivo:** proteger a usuarios como Sofía sin vigilarlos ni alarmarlos.

- **Detección:** el análisis se realiza **en el dispositivo**, mediante una lista de expresiones de riesgo alto, y **nunca envía el texto a ningún servidor** con este fin.
- **Respuesta:** al terminar de escribir —nunca durante—, aparece una tarjeta discreta, no modal, no bloqueante: *“Si estás pasando por algo difícil, hay personas que pueden ayudarte.”* + un enlace a recursos locales según el país + *“Puedes seguir escribiendo. Esto queda aquí.”*
- **Prohibido:** bloquear el guardado, mostrar alarmas, contactar con terceros, cambiar el tono del resto de la app, o volver a mostrar la tarjeta más de una vez cada 7 días.
- **Nunca** se registra un evento de analítica que identifique al usuario con esta detección. Solo un contador agregado y anónimo, si acaso.
- Recursos por país configurados para México, España, Argentina, Colombia y Chile en el MVP.

## 5.17 Paywall

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

- **Presentación:** pantalla completa, bella, sin cuenta atrás, sin precios tachados falsos, sin “oferta que expira”.
- **Argumento:** basado en el propio usuario. *“Llevas 34 días escribiendo. Strivo completo te muestra lo que hay dentro de todo eso.”* La conversión debe apoyarse en el valor acumulado, no en escasez artificial.
- **Contenido:** tres beneficios concretos con ejemplo visual real (un insight, un recuerdo, el Libro de Vida), precios claros (99 MXN/mes · 749 MXN/año, con el ahorro expresado con honestidad), 7 días de prueba.
- **Momentos de aparición permitidos:** al intentar acceder a una función premium; tras un hito de acumulación (día 14, 30); en Perfil. **Nunca:** durante un ritual, durante la secuencia de cierre, en el onboarding, tras registrar un ánimo bajo, ni en el estado de regreso.
- **Frecuencia máxima:** 2 veces por semana.
- **Botón de cierre visible desde el primer instante**, sin retardo, sin X diminuta.

## 4.10 Matriz de acceso gratuito / premium

\[REUBICADO DE CAPÍTULO 4 — v3.1\]

| Funcionalidad                        | Gratuito                   | Strivo completo    |
|:-------------------------------------|:---------------------------|:-------------------|
| Diario completo (mañana y noche)     | ✅ Ilimitado               | ✅                 |
| Journal libre                        | ✅ Ilimitado               | ✅                 |
| Rituales de mañana y noche           | ✅                         | ✅                 |
| Hábitos                              | ✅ Hasta 5                 | ✅ Ilimitados      |
| Historial y búsqueda básica          | ✅ Últimos 60 días         | ✅ Completo        |
| Exportación de todos sus datos       | ✅ **Siempre gratuita**    | ✅                 |
| Resumen semanal                      | ✅ Versión básica (datos)  | ✅ Versión narrada |
| Insights de patrones y correlaciones | ❌                         | ✅                 |
| Resumen mensual y anual narrados     | ❌                         | ✅                 |
| Recuerdos (Un día como hoy)          | ❌                         | ✅                 |
| Ciencia del Bienestar                | Vista previa (2 artículos) | ✅                 |
| Audioteca                            | 3 audios                   | ✅                 |
| Programas guiados                    | ❌                         | ✅                 |
| Libro de Vida (V2)                   | ❌                         | ✅                 |
| Temas visuales adicionales           | 2                          | Todos              |

**Principios de monetización innegociables:**

1.  **Lo que el usuario escribe es suyo para siempre y siempre exportable, pague o no.**
2.  Al terminar la suscripción, **nada se borra y nada se bloquea de lo ya creado**; solo dejan de generarse insights nuevos.
3.  El paywall aparece **como máximo dos veces por semana** y nunca durante un Ritual ni durante la secuencia de cierre.
4.  La prueba de 7 días no requiere tarjeta si la plataforma lo permite; si la requiere, se avisa del cobro **2 días antes** con notificación clara.

# Capítulo 2 — Lumia

> **Lumia — hacia dentro.** *¿Cómo estoy?* · *“Rituales que te devuelven a ti.”* · *“Reconoce tu vida mientras la estás viviendo.”*

## C2.0 Alcance de Lumia

Lumia es dueña de **toda la experiencia de ritual** entendida como introspección guiada, y de todo momento en el que la persona escribe, siente, agradece o reflexiona (Principio 1, §0.3).

**Qué contiene este capítulo:**

| Funcionalidad                                | Origen v3.1                     | Estado en v4.0                                                                                       |
|:---------------------------------------------|:--------------------------------|:-----------------------------------------------------------------------------------------------------|
| Pestaña “Hoy” completa (toggle Mañana/Noche) | §5.2 + §5.2.1 \[Bloque 03\]     | Íntegra. Bloque técnico ya implementado                                                              |
| Respiración diaria                           | §5.5 R1 + §5.5.1                | Deja de ser paso de ritual. Experiencia propia (§C2.3)                                               |
| Intención del día                            | §5.5 R5                         | Se fusiona en el display de Hoy → Mañana (§C2.4)                                                     |
| Diario — Vista de Mañana                     | §5.3                            | Íntegra **menos** el Bloque 6 (checklist de hábitos)                                                 |
| Diario — Vista de Noche                      | §5.4 + §5.4.1 + §5.4.3          | Íntegra **menos** el Bloque 8 (checklist de hábitos)                                                 |
| Ritual de Noche (N1, N3–N6)                  | §5.6 + §5.6.1                   | **Modificado en v4.1:** se retira N2 (revisión de hábitos). Pasa a 5 pantallas de pura introspección |
| Journal (editor, búsqueda, emociones, PIN)   | §5.8 + §5.8.1 + §5.8.2 + §7.7.1 | Íntegro, con su especificación criptográfica                                                         |
| Historial — estado emocional                 | §5.10 (parte)                   | Íntegro; la parte de hábitos se va a Formia (§C3.7)                                                  |
| Modo día difícil · Carta a tu yo futuro      | §5.14.1 · §5.14.2               | Íntegros                                                                                             |

**Qué NO contiene y por qué:** ningún dato de hábitos. Ninguna pantalla de Lumia muestra progreso, constancia, checklist ni conteo de hábitos. El Diario dejó de mostrarlos (§C2.6) y el `namespace` `lumia/` no tiene forma de leerlos (§0.4, Capítulo 5).

## C2.1 La disolución del Ritual de Mañana, vista desde Lumia

Lumia se queda con dos de los cinco pasos del antiguo Ritual de Mañana, y **con ninguno de ellos como paso**:

- **R1 (respiración)** era el umbral de una secuencia. Ahora es una experiencia con entidad propia dentro de la sección Mañana (§C2.3).
- **R5 (intención)** era la pantalla final antes de “Comenzar mi día”. Ahora es un campo del display de Hoy → Mañana, disponible en cualquier momento de la franja matinal (§C2.4).

Lo que desaparece es el **envoltorio**: el pop-up automático entre las 4:00 y las 11:30, el avance forzado pantalla a pantalla, el botón “Comenzar mi día” como final de secuencia y las reglas RN-RM-01 a RN-RM-06 que gobernaban esa aparición. Todo ello se conserva como historia de la decisión en el **Anexo E**.

**Consecuencia abierta:** al quedarse sin wizard, la sección Mañana de Lumia pasa a ser una página. ¿Necesita alguna transición o entrada suave al abrirse, o se accede directo? No se resuelve aquí — ver **§C7.5**.

**Nota sobre §4.5 (decisión D-4.5, “el Ritual es el envoltorio guiado, el Diario es el contenido y el archivo”).** Esa decisión sigue vigente **solo para la noche**: Ritual de Noche ↔ Vista de Noche siguen escribiendo en el mismo registro del día. Para la mañana ya no hay dos presentaciones del mismo dato, porque ya no hay ritual matinal: queda una sola superficie (el display de Hoy → Mañana y la Vista de Mañana del Diario). Ver la anotación en §4.5 (Capítulo 11).

## 5.2 Módulo: Pantalla “Hoy” (raíz)

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

### Objetivo

Orientar en menos de dos segundos: *qué momento del día es, qué me toca, cómo estoy*. Y hacerlo sin generar sensación de panel de control.

### Contexto

Es la pantalla que el usuario ve entre 300 y 700 veces al año. Su calidad emocional define la percepción del producto entero. **Decisión heredada y confirmada:** héroe con degradado + tarjetas grandes de acceso, refinado y modernizado; nunca un dashboard de métricas.

### Wireframe textual (franja noche, ritual pendiente)

    ┌───────────────────────────────┐
    │                               │
    │   ◍ degradado nocturno        │
    │                               │
    │   Buenas noches, Mariana      │
    │   Jueves, 24 de julio         │
    │                               │
    │   "Lo que reconoces, crece."  │
    │                               │
    │  ┌─────────────────────────┐  │
    │  │ Cerrar tu día           │  │
    │  │ 3 minutos               │  │
    │  │            ‹ Empezar ›  │  │
    │  └─────────────────────────┘  │
    │                               │
    │  ┌───────────┐ ┌───────────┐  │
    │  │ Journal   │ │ Insights  │  │
    │  │ Escribir  │ │ 1 nuevo   │  │
    │  └───────────┘ └───────────┘  │
    │                               │
    │  ┌─────────────────────────┐  │
    │  │ Tu historial            │  │
    │  └─────────────────────────┘  │
    │  ···                          │
    ├───────────────────────────────┤
    │  Hoy      Journal      Tú     │
    └───────────────────────────────┘

### Jerarquía visual

1.  **Degradado + saludo** (zona superior, ~35 % de la pantalla). Es aire, no información.
2.  **Tarjeta de acción principal** — única, grande, con el verbo del momento.
3.  **Tarjetas secundarias** — dos por fila, iguales entre sí, sin jerarquía interna.
4.  **Acceso a historial** — ancho completo, peso visual bajo.

**Nunca:** más de una acción primaria, gráficas, números de racha, contadores, insignias, avisos rojos.

### Componentes

Héroe con degradado dinámico; saludo; fecha larga; frase del día; tarjeta de acción (variante mañana/noche/día); tarjetas de acceso; tarjeta contextual opcional (recuerdo, insight nuevo, sugerencia de contenido premium — **máximo una, y no más de 2 veces por semana**).

### Comportamiento

| Franja                       | Tarjeta principal                                       | Copy                                       |
|:-----------------------------|:--------------------------------------------------------|:-------------------------------------------|
| Amanecer, ritual pendiente   | Ritual de Mañana                                        | Empieza tu día · 2 minutos                 |
| Amanecer, ritual hecho       | Vista de Mañana (repaso)                                | Ya definiste tu día. Míralo cuando quieras |
| Día                          | Sin acción exigente                                     | “Nos vemos esta noche.” + acceso a Journal |
| Día, con victorias definidas | Recordatorio suave de las 3 victorias, **sin casillas** | Esto es lo que elegiste hoy                |
| Atardecer                    | Invitación suave                                        | Cuando quieras, cerramos el día            |
| Noche, ritual pendiente      | Ritual de Noche                                         | Cerrar tu día · 3 minutos                  |
| Noche, ritual hecho          | Tarjeta de cierre                                       | Tu día está cerrado. Descansa              |
| Madrugada                    | Solo Journal                                            | Aún de pie. Aquí está tu espacio           |

### Microinteracciones y animaciones

- El degradado deriva lentamente (ciclo de 30 s, desplazamiento máximo del 4 %). Casi imperceptible; el efecto es de “estar vivo” sin distraer.
- Tarjetas: al pulsar, escala 0,98 con háptica ligera; al soltar, expansión hacia la pantalla destino (transición compartida de 380 ms).
- Al completar el ritual del momento, la tarjeta principal **no desaparece de golpe**: se transforma en la tarjeta de estado completado con un cambio de contenido cruzado de 500 ms.
- Entrada a la pantalla: los elementos aparecen escalonados (60 ms entre elementos, máximo 5 escalones).

### Estados

- **Vacío (día 1):** la tarjeta principal invita al primer ritual; las secundarias muestran copy de invitación en lugar de contenido.
- **Carga:** esqueletos con el color de fondo del tema, sin destellos ni animaciones de brillo. Máximo 400 ms; si tarda más, se muestra el contenido en caché con marca sutil “actualizando”.
- **Offline:** todo visible desde caché local; la tarjeta de Insights indica *“Se actualizará cuando vuelvas a tener conexión”*. **Nunca se muestra un cartel de error a pantalla completa.**
- **Error:** si falla la carga remota, se muestra el contenido local. Un fallo de red nunca impide entrar al Diario.

### Accesibilidad

Contraste mínimo 4,5:1 del texto sobre el degradado en todos sus puntos (verificado en las cuatro variantes horarias); tarjetas con área táctil ≥ 48 × 48 dp; el degradado animado se detiene si el sistema tiene activado “reducir movimiento”; orden de lectura: saludo → fecha → frase → acción principal → secundarias.

### Persistencia y sincronización

La franja horaria, la frase del día y el estado de rituales se calculan localmente. La frase del día se precarga con 30 días de antelación para que funcione offline. Los insights se sincronizan en segundo plano al abrir, con un máximo de una petición por hora.

### Reglas de negocio

- **RN-HOY-01** Nunca hay más de una tarjeta contextual promocional visible.
- **RN-HOY-02** La frase del día es distinta cada día y no se repite en 365 días.
- **RN-HOY-03** El estado “ritual completado” nunca se comunica con un tic verde tipo lista de tareas, sino con lenguaje (“Tu día está cerrado”).
- **RN-HOY-04** Ningún número visible en esta pantalla puede disminuir de un día a otro.

### Criterios de aceptación

1.  La pantalla se renderiza con contenido útil en ≤ 800 ms desde apertura en frío, incluso sin red.
2.  El degradado corresponde correctamente a las cinco franjas y transiciona sin salto al cruzar el límite.
3.  Con “reducir movimiento” activado, no hay animación de degradado ni escalonado de entrada.
4.  Tras completar un ritual, la tarjeta refleja el nuevo estado sin necesidad de recargar.

### 5.2.1 Tema de la pantalla Hoy: control por sección, no por hora \[ACTUALIZADO EN BLOQUE 03\]

> **Esta subsección revierte una decisión anterior del blueprint.** El texto de §5.2 (“Contexto”, “Comportamiento”, “Microinteracciones”, “Accesibilidad”, “Criterios de aceptación”) y el de §4.3.3 describen una pantalla Hoy cuyo degradado se elige automáticamente a partir de la franja horaria del sistema. **En Fase 0 eso ya no es así.** El texto original se conserva íntegro como historia de la decisión; el comportamiento vigente es el que se especifica aquí.

#### Qué cambia exactamente

| Aspecto              | Especificación original (v3)                                                  | Implementación Fase 0 (vigente)                                    |
|:---------------------|:------------------------------------------------------------------------------|:-------------------------------------------------------------------|
| Origen del tema      | Hora del sistema → cinco franjas (amanecer, día, atardecer, noche, madrugada) | **Elección del usuario** mediante el conmutador “Mañana” ↔ “Noche” |
| Número de temas      | 5 degradados horarios                                                         | **2 temas**: mañana y noche                                        |
| Cambio automático    | Sí, al cruzar el límite de franja                                             | **No.** El tema solo cambia cuando el usuario pulsa                |
| Deriva del degradado | Ciclo de 30 s, desplazamiento 4 %                                             | Se mantiene, dentro del tema activo                                |
| Texto sobre el fondo | Un solo color de texto                                                        | **Color de texto por superficie** (§5.2.3)                         |

#### Por qué se revierte

La decisión original era correcta como firma visual y equivocada como comportamiento de producto. Tres razones, en orden de peso:

1.  **Legibilidad rota.** Con degradado horario automático, el color de texto se fijaba una sola vez mientras el fondo cambiaba a lo largo del día. El resultado observado en el prototipo fue texto oscuro sobre fondo nocturno: ilegible exactamente en la franja de mayor uso del producto. Es un fallo de accesibilidad, no una cuestión de gusto.
2.  **Las dos secciones deben ser accesibles siempre.** La pantalla Hoy da acceso a la sección de mañana y a la de noche a cualquier hora (decisión ya vigente en v3). Si el fondo dice “noche” mientras el usuario está leyendo su sección de mañana, la pantalla se contradice a sí misma.
3.  **Control del usuario.** Un producto que cambia de aspecto solo, sin que el usuario lo haya pedido y sin que pueda deshacerlo, comunica lo contrario del §1.5.1 (Calm Technology): el usuario deja de estar al mando de su propia pantalla.

#### Comportamiento vigente

- El conmutador **“Mañana” ↔ “Noche”** es el **único** origen del tema de la pantalla Hoy.
- **Mañana** → fondo de **amanecer claro**, texto oscuro (`data-surface="light"`).
- **Noche** → fondo **azul oscuro**, texto claro (`data-surface="dark"`).
- El tema **no** depende de la hora del sistema, ni de la hora de despertar declarada, ni del modo claro/oscuro del sistema operativo.
- **Estado inicial al abrir la pantalla:** la sección propuesta por defecto sigue la lógica de momento del día ya descrita en §4.3.3 (por la mañana se propone “Mañana”, por la noche “Noche”). **Lo que cambia es que esa lógica solo elige la sección de partida; a partir de ahí, manda el usuario y el tema no vuelve a cambiar solo.**
- Ambas secciones son alcanzables en un toque a cualquier hora, sin advertencias ni fricción (“todavía no es de noche” no existe como mensaje).
- La **tarjeta del ritual** (“Tu ritual de la mañana” / “Tu ritual de noche”) se pinta con un tono **distinto al del fondo** en ambos temas, de modo que destaque como el elemento de acción principal. **Corrección explícita:** en la versión anterior la tarjeta se fundía con el degradado y desaparecía visualmente.

#### Transición entre temas

- **Cross-fade de 320 ms** entre el fondo de mañana y el de noche, con el token `dur-theme` (§6.10.1).
- El cambio de color de texto acompaña al cross-fade, sin salto intermedio ni parpadeo.
- Con `prefers-reduced-motion` activado, el cambio es **inmediato** (sin transición). No hay estado intermedio ilegible.
- El conmutador da respuesta inmediata al toque: la selección visual del botón no espera a que termine el cross-fade.

#### Qué NO cambia (alcance de la reversión)

La reversión está **acotada a la pantalla Hoy**. Conservan el degradado horario, sin cambio alguno:

- **P1 (Bienvenida del onboarding, §5.1)** — el degradado de amanecer es parte de la primera impresión del producto.
- **La pantalla de transición de entrada a la app** — luz tenue y frase de apertura sobre degradado horario.
- Los degradados horarios de **§6.3.3** siguen siendo tokens vigentes del sistema de diseño y siguen documentados. Dejan de aplicarse a la pantalla Hoy; no se eliminan del sistema.

#### Reglas de negocio

- **RN-HOY-05** El tema de la pantalla Hoy no puede cambiar sin una acción explícita del usuario.
- **RN-HOY-06** En cualquier tema, el texto sobre el fondo debe cumplir el contraste mínimo del §6.3.6, verificado en las tres paradas del degradado.
- **RN-HOY-07** La tarjeta de ritual debe ser distinguible del fondo por luminancia, no solo por borde, en ambos temas.
- **RN-HOY-08** Ambas secciones (mañana y noche) están disponibles a cualquier hora del día, sin bloqueo ni advertencia.

#### Criterios de aceptación

1.  Pulsar “Noche” a las 08:00 muestra el fondo nocturno con texto claro y lo mantiene mientras el usuario permanece en la pantalla.
2.  Ningún cambio de hora del sistema modifica el tema de la pantalla Hoy.
3.  El cross-fade dura 320 ms y es inmediato con “reducir movimiento” activado.
4.  La tarjeta de ritual es visualmente distinguible del fondo en los dos temas.
5.  P1 y la pantalla de transición siguen mostrando degradado horario.

### 5.2.2 Etiqueta de área en los hábitos visibles desde Hoy — **\[CASO AMBIGUO — v4.0\]** \[ACTUALIZADO EN BLOQUE 04\]

Cuando la pantalla Hoy muestra hábitos —en el recordatorio de la sección de mañana o en el acceso al ritual—, cada hábito muestra **el nombre de su área o nada**, según la regla única de **§5.7.4**. **No muestra la frase de identidad de área.**

> **Nota de v4.0 sobre §5.2.2.** Tras la división, Hoy es una superficie de **Lumia** y no puede mostrar datos de hábitos. Lo que queda es el enlace de salida hacia Formia (que en Fase 0 sustituyó a los hábitos por *“Tu ritual de la mañana”*). La regla de etiquetado sigue siendo válida allí donde sí se muestran hábitos — es decir, en Formia (§5.7.4). **Resuelto en v4.1 (§C7.7.3): ese enlace desaparece.** Hoy no ofrece ningún puente hacia Formia; los dos espacios se cruzan **solo por la barra de navegación**. En consecuencia, el enlace *“Tu ritual de la mañana”* introducido en Fase 0 se retira de la pantalla Hoy, y con él el último resto de vocabulario de hábitos en una superficie de Lumia. §5.2.2 deja de ser un caso ambiguo.

### 5.2.3 Contraste de texto por superficie \[ACTUALIZADO EN BLOQUE 01\]

La pantalla Hoy es el consumidor principal del mecanismo `data-surface` introducido en el Bloque 01 (tokens en §6.3.7).

- El contenedor de la sección de mañana declara `data-surface="light"`; el de la sección de noche, `data-surface="dark"`.
- Todos los textos descendientes heredan el color correcto (`--color-text-on-light` / `--color-text-on-dark`) **sin que ningún componente tenga que saber en qué tema está**.
- Esto elimina la clase de defecto que originó el Bloque 03: texto oscuro sobre fondo oscuro. Un componente nuevo colocado dentro de cualquiera de las dos secciones es legible por construcción.
- **Regla:** ningún componente de la pantalla Hoy puede fijar su color de texto con un valor literal. Debe heredarlo de la superficie.

## C2.3 Respiración diaria (ex-R1)

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

**Qué cambia respecto de v3.1:** nada del contenido, todo del marco. La respiración deja de ser *“paso 1 de un ritual de 5 pasos”* y pasa a ser **una experiencia propia dentro de la sección Mañana de Lumia**, accesible cuando la persona quiera durante la franja matinal, sin que su omisión bloquee ni desencadene nada.

**Especificación original conservada (§5.5, R1):**

> **R1 — Respiración de entrada (6 s, saltable)**
>
>     ┌───────────────────────┐
>     │                       │
>     │         ◍             │
>     │   (círculo que        │
>     │    respira)           │
>     │                       │
>     │   Antes de empezar,   │
>     │   respira una vez.    │
>     │                       │
>     │        Saltar         │
>     └───────────────────────┘
>
> Un círculo se expande 4 s (inhalar) y se contrae 4 s (exhalar) una sola vez; después avanza automáticamente. Sin cuenta atrás visible, sin números.

**Ajustes derivados de la disolución del ritual:**

- **“Después avanza automáticamente” ya no tiene destino.** No hay pantalla siguiente. Al terminar el ciclo, la experiencia se cierra y devuelve a la sección Mañana en el punto donde estaba. El avance automático se conserva como *cierre* automático.
- **El copy “Antes de empezar, respira una vez” queda sin objeto** (no hay nada que “empezar”). Requiere copy nuevo, coherente con §3.6 y con la biblioteca de `src/copy/index.js`. **Pendiente de redacción, no de decisión de producto.**
- El botón **“Saltar”** se mantiene: nunca hay avance automático sin posibilidad de detenerlo (§5.5, Accesibilidad).
- **Ritmo vigente desde v4.1: 5-5-3, tres ciclos.** Queda resuelta la contradicción registrada en Fase 0 (§10.2): la respiración diaria adopta el mismo patrón que el ejercicio de P1 —5 s de inhalación, 5 s de exhalación, 3 s de pausa al final del ciclo— con el círculo naranja/dorado y el audio generado de §6.12.1, sujeto a la preferencia de sonido de `shared/preferences`. La discusión de §5.5.1, que justificaba mantener 4-4, queda **derogada**: su argumento era que R1 era el umbral de un ritual, y ese ritual ya no existe.
- **RN-LU-RESP-01** La duración total pasa de 6 s a **~39 s**. Eso solo es aceptable si la experiencia es **enteramente voluntaria**: no se abre sola, no se dispara al entrar en la sección Mañana, no bloquea nada y es saltable desde el primer segundo. Si en algún momento se le añadiera activación automática, esos 39 segundos se convertirían en el peaje diario que §5.5.1 advertía — y la regla habría que revisarla, no ignorarla.
- **RN-LU-RESP-02** El número de ciclos es el mismo en P1 y en la respiración diaria. **Derivado, pendiente de confirmar:** se aplican tres ciclos también a P1, porque unificar el ritmo pierde sentido si el número de ciclos sigue difiriendo.
- **RN-LU-RESP-03** Se respeta `prefers-reduced-motion` (indicación estática) y la preferencia de sonido persistida, sin cambios respecto del Bloque 05.

### 5.5.1 R1 en Fase 0 — relación con el ejercicio de P1 — **\[DEROGADO EN v4.1\]**

> **Sin vigencia.** Se conserva como historia de la decisión. El comportamiento vigente es el de §C2.3: **5-5-3, tres ciclos**.

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

El Bloque 05 rediseñó el ejercicio de respiración **del onboarding (P1)**: círculo naranja/dorado, patrón 5-5-3 y audio generado (§5.1.2, §6.12.1). **R1 no forma parte de ese bloque.**

**Estado vigente:** R1 conserva su especificación original —un ciclo único de 4 s de inhalación y 4 s de exhalación, 6 segundos totales de pantalla, saltable, sin sonido— por una razón funcional: R1 es un **umbral** de tres segundos, mientras que el ejercicio de P1 es una **experiencia** en sí misma. Alargar R1 a 13 segundos cada mañana convertiría un gesto de transición en un peaje diario.

**Contradicción declarada.** Tener dos respiraciones con ritmos distintos en el mismo producto es una inconsistencia real del sistema de diseño. Se registra como **decisión abierta** (Capítulo 6, §10.2): unificar ambos ritmos, mantenerlos separados con justificación explícita en el sistema de diseño, o dar a R1 el círculo naranja y el audio conservando su duración corta. **Hasta que se decida, el comportamiento por defecto es el descrito aquí: R1 sin cambios.**

> **Observación de v4.0.** El argumento que sostenía la diferencia de ritmos era que R1 es *un umbral hacia el ritual*. Disuelto el ritual, R1 ya no es umbral de nada: es una experiencia autónoma, exactamente como la de P1. **El argumento original ha perdido su base**, lo que refuerza —sin resolverla— la opción de unificar ambos ritmos en 5-5-3. Se traslada como observación al Capítulo 6, no como decisión tomada.

## C2.4 Intención del día (ex-R5) y su reconciliación con la “gran visión”

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

**Qué cambia:** la intención deja de ser la quinta pantalla de un wizard y **se fusiona dentro del display de “Hoy → Mañana”**. Deja de ser un paso; pasa a ser un campo de la superficie de mañana, disponible durante toda la franja matinal, con el mismo comportamiento de guardado automático que el resto de Lumia.

**Especificación original conservada (§5.5, R5):**

> **R5 — Intención del día**
>
> - Pregunta: *“¿Con qué intención quieres entrar al día?”*
> - Un campo de una línea + 6 sugerencias tocables (con calma · con foco · con paciencia · con valentía · presente · sin prisa).
> - Botón final: **‹ Comenzar mi día ›**

- **El botón “Comenzar mi día” desaparece como final de secuencia** (ya no cierra un ritual). Se conserva —donde ya existía— como botón de cierre de la Vista de Mañana del Diario (§5.3, “Comportamiento general de la vista”), con su transición de expansión luminosa de 900 ms.
- **Se conserva íntegro el delight moment:** la intención escrita permanece visible en el héroe de Hoy durante toda la jornada (§5.5, “Cierre”; criterio de aceptación 6 del antiguo ritual, que sobrevive: *la intención escrita permanece visible en Hoy hasta el fin de la franja de día*).

### C2.4.1 ¿“Intención” y “gran visión” son lo mismo? — análisis y decisión

Se solicitó revisar si la intención (ex-R5) y el bloque documentado como *“gran visión”* / *“¿Qué haría que hoy sea un gran día?”* (Bloque 4 de la Vista de Mañana, §5.3) son el mismo concepto, para no duplicar un campo con dos nombres.

**Conclusión: son conceptos distintos. NO se fusionan.** El razonamiento, por si se quiere revocar la decisión con conocimiento de causa:

| Criterio                  | Intención del día (ex-R5)                                  | Gran visión (Bloque 4)                                                                                              |
|:--------------------------|:-----------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------|
| **Pregunta**              | *“¿Con qué intención quieres entrar al día?”*              | *“Imagina que hoy termina siendo un gran día. ¿Qué tuvo que haber pasado para que así fuera?”*                      |
| **Naturaleza gramatical** | **Adverbial**: el *cómo*. Modo de atravesar el día         | **Narrativa**: el *qué*. Proyección de acontecimientos                                                              |
| **Respuestas típicas**    | “con calma”, “con foco”, “sin prisa”                       | “Que terminara el informe sin ansiedad y llamara a mi madre”                                                        |
| **Entrada**               | 1 línea + 6 chips tocables. Se puede responder sin teclear | Campo amplio, mínimo 4 líneas visibles, crecimiento hasta 12. Requiere escribir                                     |
| **Ciclo de vida**         | Se muestra en el héroe de Hoy **durante todo el día**      | Se recupera **por la noche** como contraste amable: *“Esta mañana escribiste esto. ¿Cómo se parece a lo que pasó?”* |
| **Campo en v3.1**         | `DailyEntry.manana.intencion`                              | `DailyEntry.manana. visualizacionGranDia`                                                                           |

**Cuatro razones para mantenerlos separados:**

1.  **v3.1 ya los modelaba como campos distintos** (§7.2, `DailyEntry.manana`), coexistiendo sin nota de duplicación en un documento que sí declara y resuelve otras duplicaciones (§4.5, §4.6, §5.3.2). No es un descuido heredado: es una distinción deliberada.
2.  **El mecanismo nocturno se rompería con la fusión.** El contraste de la noche funciona sobre una narración de acontecimientos (“¿cómo se parece a lo que pasó?”). Sobre *“con calma”* esa pregunta no tiene sentido, o peor: se convierte en una evaluación de si la persona logró estar en calma — exactamente lo que §5.3 prohíbe (“**Nunca se pregunta si se cumplió**”).
3.  **El coste de fricción es asimétrico.** La intención se responde con un toque en un chip; la gran visión exige escribir varias líneas. Fusionarlas obligaría a elegir: o se pierde la respuesta de un toque (y la persona con prisa se queda sin intención), o se pierde la profundidad narrativa (y la noche se queda sin material de contraste).
4.  **Cumplen funciones psicológicas documentadas distintas:** la intención es una declaración de estado (*framing* atencional, visible todo el día); la gran visión es contraste prospectivo/retrospectivo. Ninguna sustituye a la otra.

**Lo que sí se corrige — el riesgo real de la separación.** Tres campos de texto abierto adyacentes en la misma superficie de mañana (intención, acción pequeña de §5.3-Bloque 3, gran visión de §5.3-Bloque 4) sí producen fatiga y sensación de formulario. Reglas de presentación en el display de Hoy → Mañana:

- **RN-LU-INT-01** La intención se presenta **primero** y por defecto respondible con un toque (6 chips). Nunca se presenta como campo vacío con teclado abierto.
- **RN-LU-INT-02** La gran visión se presenta **después**, en la Vista de Mañana del Diario, no en el display de Hoy. Son dos superficies, no una lista de tres preguntas seguidas.
- **RN-LU-INT-03** Ninguno de los tres campos es obligatorio, ninguno bloquea al otro y ninguno se presenta como pendiente si está vacío.
- **RN-LU-INT-04** El copy de los tres campos **no puede compartir formulación**. Si en algún momento la intención y la gran visión se pueden responder con la misma frase, la distinción se ha perdido y hay que revisar esta decisión.

**Consecuencia en el modelo de datos:** se conservan dos campos (Capítulo 5): `lumia/dailyIntention/{date}.intentionText` (ex-R5) y `lumia/morningEntry/{date}.granVision`. **No se crea un campo unificado.**

## 5.3 Módulo nuclear: Diario de Logros y Agradecimientos — Vista de Mañana

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

### Objetivo

Que el usuario entre al día **eligiéndolo** en lugar de recibiéndolo: con gratitud activada, una intención emocional explícita, una imagen concreta de un buen día y tres focos claros.

### Contexto

Momento escaso (persona Mariana: 3–4 minutos en cama; persona Daniel: quizá 40 segundos). **Riesgo principal identificado \[H3\]: la mañana es el momento con mayor probabilidad de abandono.** Por eso la vista es completamente saltable, tiene una ruta express y ningún campo obligatorio.

### Wireframe textual completo

    ┌───────────────────────────────┐
    │  ◍ degradado amanecer         │
    │                               │
    │  Buenos días, Mariana         │
    │  Jueves, 24 de julio de 2026  │
    │                               │
    │  "Empezar es la mitad."       │
    │                               │
    │  ── ¿Qué agradezco esta       │
    │      mañana? ──               │
    │  ☺ ▭ ................         │
    │  ☺ ▭ ................         │
    │  ☺ ▭ ................         │
    │      ‹ + Añadir otra ›        │
    │  (tras 6 s sin escribir:)     │
    │  ¿Te ayudo con una idea?      │
    │  [familia] [salud] [un        │
    │   pequeño momento] [→]        │
    │                               │
    │  ── ¿Cómo me quiero sentir    │
    │      hoy? ──                  │
    │  ( Agradecido ) ( Próspero )  │
    │  ( Orgulloso de mí ) ( Amado )│
    │  ( Pleno ) ( Inspirado ) ···  │
    │                               │
    │  ¿Qué acción pequeña podría   │
    │  ayudarte a sentirte así hoy? │
    │  ▭                            │
    │                               │
    │  ── Imagina que hoy termina   │
    │     siendo un gran día ──     │
    │  ¿Qué tuvo que pasar?         │
    │  ▭▭▭ (campo amplio)           │
    │                               │
    │  ── Mis tres victorias ──     │
    │  1 ▭ .............. [cat ▾]   │
    │  2 ▭ .............. [cat ▾]   │
    │  3 ▭ .............. [cat ▾]   │
    │      ‹ + Añadir otra ›        │
    │                               │
    │                               │
    │      ‹ Comenzar mi día ›      │
    └───────────────────────────────┘

### Especificación por bloque

#### Bloque 1 — Encabezado dinámico

- **Saludo por hora local:** 4:00–11:59 “Buenos días” · 12:00–18:59 “Buenas tardes” · 19:00–3:59 “Buenas noches”. Con el nombre del usuario. Cada 7 días, variante alternativa (“Hola de nuevo, Mariana”).
- **Fecha completa** en formato largo localizado: “Jueves, 24 de julio de 2026”.
- **Frase inspiradora diaria:** distinta cada día, seleccionada de una biblioteca de ≥ 400 frases (MVP: 120 propias + rotación), etiquetadas por tema (gratitud, calma, esfuerzo, identidad, aceptación). **Reglas de selección:** no se repite en 365 días; se filtra por el estado emocional reciente (si el ánimo medio de los últimos 3 días es bajo, se excluyen las frases de alto rendimiento y esfuerzo); si el usuario declaró un Compromiso, un 20 % de las frases se alinean con él.
- Interacción: mantener pulsada la frase → “Guardar esta frase” (colección personal, visible en Tú). Microdeleite de coste bajo.

#### Bloque 2 — Agradecimientos de la mañana

**Comportamiento de las filas dinámicas (especificación exacta):**

1.  Al abrir hay **exactamente tres filas visibles**, la primera enfocada solo si el usuario tocó “Empezar” desde el ritual (nunca autoenfoque agresivo al llegar por navegación libre).
2.  Al escribir cualquier carácter en la **última** fila, se crea una nueva fila vacía debajo, con animación de expansión de altura de 220 ms. **Nunca aparecen dos filas vacías simultáneas.**
3.  Si el usuario borra todo el contenido de una fila y sale de ella, la fila se elimina con animación inversa de 180 ms, **excepto si es una de las tres primeras** (siempre se mantienen tres).
4.  Límite máximo: 10 filas. Al llegar, se muestra el texto sereno *“Diez cosas. Nada mal.”* y se deja de generar filas.
5.  Cada fila tiene un botón de emoji opcional a la izquierda (☺). Al pulsarlo se abre un selector reducido de **24 emociones/objetos frecuentes** (no el teclado de emojis completo del sistema), con búsqueda. **Justificación:** el teclado completo del sistema rompe el estado de calma y ofrece opciones incoherentes con el tono; una paleta curada es más rápida y más bella.
6.  Eliminar una fila: deslizar hacia la izquierda revela “Quitar”, o mantener pulsado → menú contextual. Confirmación **solo** si la fila tiene más de 40 caracteres.
7.  Reordenar: mantener pulsado y arrastrar (V1, no MVP).

**Sistema de sugerencias (no invasivo):**

- Aparece tras **6 segundos** sin escritura y solo si el campo enfocado está vacío.
- Formato: una línea de texto tenue + 3 chips de categoría + una flecha para ver más.
- Categorías: familia · salud · trabajo · naturaleza · oportunidades · pequeños momentos · personas · yo mismo · lo que ya pasó · lo que está por venir.
- Al tocar un chip, **no se rellena el campo**: se muestra una pregunta detonante (“¿Quién de tu familia te hizo bien esta semana?”). **Regla dura: la app nunca escribe por el usuario.**
- Se ocultan al primer carácter escrito.
- Si el usuario las descarta dos veces en una sesión, no vuelven a aparecer ese día. Si las descarta cinco días seguidos, se desactivan y se ofrece reactivarlas en Ajustes.

#### Bloque 3 — ¿Cómo me quiero sentir hoy?

**Las 16 tarjetas de emoción** (orden fijo, definido por frecuencia esperada y equilibrio temático):

Agradecido · En paz · Enfocado · Orgulloso de mí · Pleno · Inspirado · Feliz · Conectado con Dios · Amado · Seguro · Valiente · Creativo · Paciente · Generoso · Próspero · Abundante.

- **Selección múltiple**, máximo 3. Al intentar una cuarta, la más antigua se deselecciona con animación suave y un mensaje discreto: *“Tres es un buen número.”* **Justificación:** la elección ilimitada diluye la intención; tres es el máximo con efecto psicológico útil.
- Cada tarjeta tiene un ícono propio del sistema de diseño (nunca emojis) y un color de acento tenue.
- **“Conectado con Dios”** se conserva por su relevancia cultural (persona Rosa). En Ajustes → Apariencia existe la opción “Mostrar opciones espirituales” (activada por defecto en español). Si se desactiva, esa tarjeta se sustituye por “Conectado conmigo”.
- El usuario puede añadir hasta 4 emociones propias (V1), que se integran en el mismo estilo visual.
- **Pregunta complementaria:** aparece **solo después** de la primera selección, deslizándose desde abajo: *“¿Qué acción pequeña podría ayudarte a sentirte así hoy?”* con campo corto de una línea.
  - Si el usuario seleccionó una sola emoción, la pregunta la nombra: *“¿Qué acción pequeña te ayudaría a sentirte en paz hoy?”*
  - Es una **intención de implementación** (Gollwitzer): el mecanismo con mayor evidencia de eficacia de todo el módulo.
  - Si el usuario escribe algo aquí, se ofrece —sin obligación— convertirlo en una de las tres victorias con un toque: *“¿La pongo entre tus victorias?”*

#### Bloque 4 — Visualización del gran día

- Encabezado: *“Imagina que hoy termina siendo un gran día. ¿Qué tuvo que haber pasado para que así fuera?”*
- Campo amplio, mínimo 4 líneas visibles, crecimiento automático hasta 12, luego desplazamiento interno.
- Sugerencia tras 8 s de inactividad: una única pregunta rotatoria (“¿Cómo te gustaría sentirte a las 10 de la noche?”).
- Este texto **se recupera por la noche** en el bloque de reflexión como contraste amable, nunca como evaluación: *“Esta mañana escribiste esto. ¿Cómo se parece a lo que pasó?”*. **Nunca se pregunta si “se cumplió”.**

#### Bloque 5 — Mis tres victorias

- Tres campos numerados. Al escribir en el tercero aparece un cuarto (mismo comportamiento dinámico que los agradecimientos), máximo 6.
- **Área opcional** por victoria mediante un chip desplegable. **Las opciones son exactamente las áreas que el usuario eligió en el onboarding (P3B)**, más “Otra”. El área *es* la categoría: no hay dos taxonomías paralelas. Cada área lleva su color e ícono. Es opcional y nunca bloquea el guardado; si no se asigna, la victoria queda en “General”.
- **Sugerencia inteligente de área:** si el texto de la victoria contiene señales claras de un área (p. ej. “correr”, “gym”, “dormir” → Salud; “reunión”, “propuesta”, “cliente” → Trabajo), la app **sugiere** el área con un chip tenue que el usuario confirma o ignora. Nunca la asigna sola sin confirmación. **Justificación:** reduce la fricción de categorizar (persona Daniel) sin quitar control (persona Andrés).
- Se pueden reordenar arrastrando (V1).
- **Herencia obligatoria:** cada victoria genera un objeto `Victory` con `id`, `texto`, `areaId`, `fecha`, `estado = pendiente`. La Vista de Noche las recupera automáticamente por `fecha`. Esta es la conexión que sostiene el diferenciador D-1. El `areaId` es lo que permite a los Insights hablar por área y conectar la victoria con la identidad (§5.1.1).
- Copy de apoyo bajo el encabezado: *“Tres cosas que, si pasan hoy, el día valió la pena.”*

#### Bloque 6 — **\[ELIMINADO EN v4.0\]**

El bloque *“Mi Ritual de la Mañana”* —checklist de hábitos proyectado desde el módulo de Hábitos con su barra de progreso— **se elimina por completo**. El progreso de hábitos vive únicamente en Formia (§C3.7). Razonamiento, alcance exacto y criterios de aceptación: **§C2.6**.

### Comportamiento general de la vista

- **Guardado automático** por bloque, con *debounce* de 800 ms tras el último carácter y en cada cambio de foco. Sin botón de guardar.
- **Desplazamiento inteligente:** al enfocar un campo, se desplaza para que quede en el tercio superior de la zona visible sobre el teclado, con anticipación de 120 ms.
- **Ruta express (“Hoy voy con prisa”):** enlace discreto en el encabezado. Colapsa la vista a dos bloques (emoción del día + una victoria) y muestra el resto plegado con “Ver todo”. **Justificación:** convierte un abandono en un registro parcial; en formación de hábitos, un registro parcial vale infinitamente más que ninguno.
- **Botón final “Comenzar mi día”:** cierra la vista con una transición de expansión luminosa (900 ms) y devuelve a Hoy con el estado actualizado. Si el usuario no escribió nada, el botón dice “Salir” y no hay animación de celebración.

### Microinteracciones (catálogo)

1.  Nueva fila de agradecimiento: expansión de altura + desvanecimiento de entrada, 220 ms, curva suave.
2.  Selección de emoción: la tarjeta se eleva 2 dp, el borde se ilumina, háptica ligera, 180 ms.
3.  Deselección: inversa, 140 ms.
4.  Aparición de la pregunta complementaria: deslizamiento vertical de 12 px + desvanecimiento, 280 ms, retardo de 200 ms tras la selección.
5.  Marcado de hábito: dibujo del trazo del tic en 260 ms + relleno de la barra de progreso animado en 400 ms.
6.  Sugerencias: desvanecimiento de entrada 400 ms; salida 200 ms.
7.  Modo foco al escribir: el resto de la pantalla baja a 40 % de opacidad en 200 ms.

### Estado vacío

Primera vez: las tres filas de agradecimiento muestran textos de ayuda distintos (“algo pequeño”, “alguien”, “algo que ya tienes”). El bloque de victorias muestra un ejemplo tenue no editable que desaparece al enfocar.

### Estado de carga

La vista es local: no debe haber estado de carga perceptible. Si la sincronización trae datos remotos más recientes, se integran sin parpadeo y sin mover el foco del usuario.

### Estado offline

Funcionalidad completa. Indicador discreto en la parte superior únicamente si hay cambios pendientes de sincronizar: “Se guardará en la nube más tarde”.

### Estado de error

Si falla la escritura local (caso crítico): se muestra el mensaje de §3.9, se copia el texto al portapapeles automáticamente y se ofrece reintentar. **Nunca se descarta contenido del usuario.**

### Accesibilidad

- Cada bloque es una región con encabezado anunciable.
- Las tarjetas de emoción se anuncian como “botón, seleccionado/no seleccionado, Agradecido, 1 de 16”.
- El estado del hábito se anuncia como “completado” / “sin completar”, nunca como “fallado”.
- Toda la vista funciona con teclado externo y con control por voz (“marcar beber agua”).
- Tamaño de fuente escalable al 200 % sin recortes: los bloques pasan a una sola columna y las tarjetas de emoción a lista vertical.

### Persistencia y sincronización

Todo se escribe en la base local (§7.4) al instante, con marca de tiempo por campo. La sincronización es incremental por campo (no por documento completo) para minimizar conflictos. Resolución de conflictos: gana el valor con marca de tiempo más reciente; si hay conflicto de texto en el mismo campo, **se conservan ambos** y se muestra al usuario (“Tenías dos versiones de esto. ¿Cuál quieres conservar?”). **Nunca se pierde texto silenciosamente.**

### Reglas de negocio

- **RN-VM-01** Ningún campo es obligatorio.
- **RN-VM-02** Las victorias creadas por la mañana aparecen íntegramente en la Vista de Noche del mismo día.
- **RN-VM-03** Máximo 3 emociones seleccionadas; máximo 10 agradecimientos; máximo 6 victorias.
- **RN-VM-04** La vista es accesible en cualquier momento del día, aunque su acceso destacado sea matinal.
- **RN-VM-05** Editable durante 7 días (§4.8).
- **RN-VM-06** Si el usuario activó “día difícil”, esta vista se reduce automáticamente a agradecimientos (1 fila) y emoción del día.

### Criterios de aceptación

1.  Al escribir en la última fila de agradecimientos, aparece exactamente una nueva fila.
2.  Al borrar el contenido de una fila creada dinámicamente y salir de ella, la fila desaparece; las tres primeras nunca desaparecen.
3.  Las sugerencias no aparecen antes de 6 s ni después de que el usuario escriba.
4.  Seleccionar una cuarta emoción deselecciona la primera con aviso.
5.  La pregunta complementaria solo aparece tras seleccionar al menos una emoción.
6.  Las victorias escritas aparecen en la Vista de Noche del mismo día con su área asignada (o “General” si no se asignó).
7.  Marcar hábitos actualiza la barra y el estado en el módulo de Hábitos de forma inmediata y bidireccional.
8.  Sin conexión, todos los datos se conservan y se sincronizan al recuperar red, sin duplicados.
9.  Con el tamaño de fuente al 200 %, no hay texto truncado ni solapado en ningún bloque.
10. En ningún estado aparece la palabra “fallaste”, “incumpliste” o equivalentes.

### 5.3.1 Etiqueta de área en el Bloque 6 — **\[DEROGADO EN v4.0\]**

Sin objeto: el Bloque 6 ya no existe. La regla de etiquetado que esta subsección invocaba (§5.7.4, Bloque 04) **se conserva íntegra** y sigue aplicándose en Formia, donde sí se muestran hábitos.

### 5.3.2 Delimitación frente al Journal: dos catálogos de emociones distintos \[ACTUALIZADO EN BLOQUE 06\]

El Bloque 06 introduce un selector de emociones en el Journal (§5.8.1). **No es el mismo selector que el del Bloque 3 de esta vista, y la diferencia es deliberada.** Se documenta aquí para que ningún equipo intente unificarlos por economía de código.

| Aspecto             | Diario — vista de mañana (Bloque 3)                                 | Journal (§5.8.1)                                            |
|:--------------------|:--------------------------------------------------------------------|:------------------------------------------------------------|
| Pregunta            | “¿Cómo me quiero sentir hoy?”                                       | “¿Cómo me siento?”                                          |
| Tiempo verbal       | **Futuro / intención**                                              | **Presente / registro**                                     |
| Catálogo            | **16 emociones, todas positivas**                                   | **15 emociones, incluidas las difíciles**                   |
| Representación      | Tarjetas con **ícono propio del sistema, nunca emojis**             | **Chips tipo píldora con emoji**                            |
| Máximo              | 3                                                                   | 3                                                           |
| Emociones difíciles | **Nunca**                                                           | **Sí**: Triste, Ansiosa, Frustrada, Preocupada, Melancólica |
| Emoción propia      | Hasta 4 emociones propias (V1)                                      | Chip “+ Otra”, **una sola palabra**                         |
| Consecuencia        | Dispara la pregunta de acción pequeña (intención de implementación) | Ninguna. Se registra y ya                                   |

**Justificación de la asimetría.** La vista de mañana pregunta **qué quieres cultivar**: ofrecer “Ansiosa” como opción a cultivar sería absurdo y dañino. El Journal pregunta **qué hay**: excluir las emociones difíciles convertiría el único espacio sin juicio de la aplicación en un lugar donde solo caben los días buenos, que es exactamente el fallo que Strivo existe para no cometer (§1.5.16, §3.4). **Ambos catálogos se mantienen separados en el código y en el copy.** Esta separación es una decisión cerrada (Capítulo 10).

**Lo que sí comparten:** ambos catálogos resuelven sus etiquetas con el helper de género `{ m, f, n }` (§3.6.5) y ambos persisten **identificadores estables, nunca etiquetas visibles** (RN-GEN-04).

## C2.6 Eliminación del bloque “checklist ritual” del Diario

**Esta sección documenta una de las dos únicas eliminaciones de raíz de v4.0** (la otra es R2, §C0.5). Afecta a las dos vistas del Diario.

### Qué se elimina

| Vista                      | Bloque eliminado                    | Qué contenía                                                                                                                        |
|:---------------------------|:------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------|
| **Vista de Mañana** (§5.3) | Bloque 6 — “Mi Ritual de la Mañana” | Checklist proyectado desde el módulo de Hábitos, filtrado por `momento = mañana` y día de la semana, con barra de progreso “2 de 5” |
| **Vista de Noche** (§5.4)  | Bloque 8 — “Mi Ritual de la Noche”  | “Idéntico en comportamiento al de la mañana (§5.3, bloque 6), filtrado por `momento = noche`”                                       |

Se eliminan también, por quedar sin objeto:

- La fila del checklist en el **wireframe textual** de ambas vistas.
- **§5.3.1** (“Etiqueta de área en el Bloque 6”) y **§5.4.2** (“Etiqueta de área en el Bloque 8”), del Bloque 04 de Fase 0: son reglas de presentación de un bloque que ya no existe. La regla de etiquetado que ambas invocaban —§5.7.4— **se conserva íntegra** en Formia (Capítulo 3), donde sigue aplicándose a las pantallas que sí muestran hábitos.
- La confirmación *“Ritual completo. Buen comienzo.”* con su animación de recorrido de luz (700 ms), asociada a completar el checklist del Diario. La microinteracción de barra que se llena **se conserva** en la vista de progreso de Formia (§C3.5, RN-FO-HAB-02).

### Por qué

El progreso de hábitos vive **únicamente en Formia**, en su propia vista de progreso y constancia (§C3.7). El Diario de Lumia no vuelve a mostrar ningún dato relacionado con hábitos. Es la aplicación directa de la separación de `namespaces` (§C0.4): `lumia/` no tiene forma de leer `formia/`.

### ¿Conviene conservar una versión reducida dentro de Lumia?

Se pidió evaluar si el bloque, además de hábitos, rastreaba **finalización de pasos de reflexión** —en cuyo caso tendría sentido conservar una versión reducida que solo reflejara esos pasos.

**Conclusión: no. No se conserva ninguna versión reducida.** Razones, sobre el contenido real de v3.1:

1.  **El bloque solo contenía hábitos.** §5.3, Bloque 6, empieza así: *“Checklist proyectado desde el módulo de Hábitos, filtrado por `momento = mañana` y día de la semana actual.”* Sus cinco filas de ejemplo (“Beber agua”, “Estirar 5 minutos”, “Leer 10 páginas”, “Meditar”, “Escribir mis victorias”) son todas objetos `Habit`. El contador “2 de 5” cuenta hábitos marcados, no pasos de reflexión completados.
2.  **Los pasos de reflexión nunca se rastrearon ahí.** El avance de la escritura del Diario se refleja en el propio contenido (los campos escritos) y en el estado del `DailyEntry` (`no_iniciado | en_curso | cerrado`, §4.8), no en un checklist. No hay nada que rescatar.
3.  **Un checklist de reflexión sería contrario a la filosofía del producto.** §5.3 declara que la vista es *“completamente saltable, tiene una ruta express y ningún campo obligatorio”*. Un contador de “3 de 6 apartados completados” convertiría una superficie sin obligaciones en una lista de pendientes — justo lo que §1.5.14 y §1.5.16 prohíben.
4.  **La necesidad que el bloque cubría ya está cubierta.** Saber “cómo va mi día” en Lumia se responde con la tarjeta principal de Hoy (§5.2) y con la síntesis de cierre (§5.4); en Formia, con la vista de progreso (§C3.7).

### Criterios de aceptación de la eliminación

1.  Ninguna vista del Diario —mañana o noche, del día en curso o de un día pasado— muestra hábitos, casillas de hábito, barra de progreso de hábitos ni conteo del tipo “2 de 5”.
2.  Una búsqueda de `Habit` o `HabitLog` en el árbol de componentes del Diario no devuelve ninguna referencia.
3.  El wireframe y el copy del Diario no contienen la palabra “ritual” referida a hábitos. (La Vista de Noche **sí** puede referirse al Ritual de Noche, que es de Lumia y sigue existiendo.)
4.  Marcar un hábito en Formia **no** produce ningún cambio visible en ninguna pantalla de Lumia.
5.  El material eliminado no reaparece en el Historial ni en la vista de día pasado de Lumia.

> **Nota de alcance.** El **Ritual de Noche (N1–N6) no se toca** y conserva su pantalla **N2 — Revisión de hábitos** tal como está especificada en §5.6. Esto entra en tensión con la regla de que Lumia no muestra datos de hábitos, y **no se resuelve aquí**: se documenta como conflicto detectado en §C7.7.

## 5.4 Módulo nuclear: Vista de Noche

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

### Objetivo

Cerrar el día con una sensación de suficiencia. El usuario debe salir de esta vista **con menos peso del que entró**, habiendo reconocido evidencia real de su día, incluso —y sobre todo— si el día fue malo.

### Contexto

23:00, en la cama, luz apagada, poca energía cognitiva, alta vulnerabilidad emocional. **Cada decisión de esta vista debe optimizarse para el peor día del usuario, no para el mejor.** Un diseño que funciona en un día malo funciona siempre; lo inverso no es cierto.

### Wireframe textual

    ┌───────────────────────────────┐
    │  ◍ degradado noche profunda   │
    │                               │
    │  Buenas noches, Mariana       │
    │  Vamos a cerrar el jueves.    │
    │                               │
    │  ── Mis logros de hoy ──      │
    │  ☐ Terminar la propuesta      │
    │  ☑ Salir a caminar            │
    │  ☐ Llamar a mi hermana        │
    │     [ No se dio hoy ]         │
    │      ↳ Pasarla a mañana       │
    │      ↳ Dejarla ir             │
    │                               │
    │  ── ¿Qué más logré hoy que    │
    │     no había planeado? ──     │
    │  ▭ ................           │
    │      ‹ + Añadir otro ›        │
    │                               │
    │  ── ¿Qué agradezco de este    │
    │     día? ──                   │
    │  ☺ ▭ ................         │
    │  ☺ ▭ ................         │
    │  ☺ ▭ ................         │
    │                               │
    │  ── ¿Qué podría intentar      │
    │     diferente mañana? ──      │
    │  ▭▭ (campo medio)             │
    │                               │
    │  ── Reflexiones del 24 de     │
    │     julio ──                  │
    │  ¿Qué aprendí hoy de mí, de   │
    │  los demás o de la vida?      │
    │  ▭▭▭ (campo amplio)           │
    │                               │
    │  ── ¿Cómo me voy a dormir? ── │
    │  ◍ ◍ ◍ ◍ ◍  (5 estados)      │
    │  [chips de matiz opcional]    │
    │                               │
    │                               │
    │     ‹ Cerrar mi día ›         │
    └───────────────────────────────┘

### Especificación por bloque

#### Bloque 1 — Saludo nocturno y mensaje de cierre

- Saludo con nombre + frase de apertura variable según el día de la semana y el ánimo reciente. Ejemplos: *“Vamos a cerrar el jueves.” · “Ha sido un día largo. Hagámoslo corto.” · “Aquí estamos otra vez.”*
- Si el usuario no abrió la app ayer, **no se menciona**. Si no la abrió en más de 7 días, se aplica el Estado de Regreso (§5.15).

#### Bloque 2 — Mis logros de hoy (victorias heredadas)

- Se recuperan automáticamente las victorias definidas por la mañana con `fecha = hoy`.
- **Si no hay victorias definidas** (el usuario no hizo la vista matinal): el bloque cambia su encabezado a *“¿Qué lograste hoy?”* con tres filas vacías. **Nunca se muestra un vacío que recuerde una omisión.**
- Cada victoria tiene tres estados posibles: `pendiente`, `lograda`, `no se dio`.
  - Marcar como lograda: casilla → animación de trazo + háptica + la fila adquiere un fondo cálido tenue. Copy interno: “Lo lograste”.
  - Marcar “no se dio”: botón secundario discreto. **Nunca hay una X, nunca hay rojo.** Al pulsarlo aparecen dos opciones inline:
    - **“Pasarla a mañana”** → crea la victoria en el `DailyEntry` del día siguiente con marca `heredada = true`. Al día siguiente aparece con un indicador sutil: “Viene de ayer”.
    - **“Dejarla ir”** → se archiva con estado `soltada`. Copy de confirmación: *“Soltar también es avanzar.”*
  - Si una victoria se pospone **tres veces**, la app no insiste ni juzga; en el cuarto día ofrece, una sola vez: *“Esta se ha ido moviendo. ¿La partimos en algo más pequeño?”* con un campo para reescribirla. **Esta es una intervención conductual clave** (reducción de tamaño de la tarea) y es completamente ignorable.
- Sin ninguna victoria marcada: no ocurre nada negativo. El cierre del día sigue disponible.

#### Bloque 3 — Logros no planeados

- Encabezado: *“¿Qué más logré hoy que no había planeado?”*
- Comportamiento dinámico de filas idéntico al de agradecimientos (una fila inicial, crecimiento al escribir, máximo 6).
- Sugerencias tras 6 s: *“¿Ayudaste a alguien? ¿Resolviste algo pequeño? ¿Te sostuviste en un momento difícil?”*
- **Justificación:** este bloque es el antídoto directo contra el sesgo de negatividad. Casi todos los días contienen logros no planeados que nadie registra. Es, según la evidencia del sector, el bloque con mayor impacto en la sensación de suficiencia al cerrar.

#### Bloque 4 — Agradecimientos del día

Sistema idéntico al de la mañana (§5.3, bloque 2), con dos diferencias: 1. Las sugerencias nocturnas son distintas y orientadas al día vivido (“algo que alguien hizo por ti hoy”, “un momento que no esperabas”). 2. Si el usuario ya escribió agradecimientos por la mañana, se muestran plegados arriba con el texto *“Esta mañana agradeciste: …”* y un enlace “ver”. **No se duplican ni se piden de nuevo los mismos.**

#### Bloque 5 — Qué intentar diferente mañana

- Encabezado exacto: *“¿Qué podría intentar diferente mañana para vivir un mejor día?”*
- **Encuadre obligatorio de aprendizaje.** Bajo el encabezado, texto de apoyo: *“No es una corrección. Es un experimento.”*
- Campo medio (2–6 líneas).
- Si el usuario escribe algo aquí, la mañana siguiente lo muestra en el Ritual de Mañana como recordatorio suave: *“Ayer pensaste en intentar esto hoy.”* **Sin casilla, sin seguimiento, sin evaluación.** Solo memoria.
- **Prohibido:** cualquier copy que sugiera que el día de hoy estuvo mal, o que pida identificar errores.

#### Bloque 6 — Reflexiones del \[fecha\]

- Encabezado dinámico con la fecha: “Reflexiones del 24 de julio”.
- Pregunta: *“¿Qué aprendí hoy de mí, de los demás o de la vida?”*
- Campo amplio (mínimo 5 líneas).
- **Rotación de preguntas (propuesta de mejora):** la pregunta principal se mantiene como predeterminada, pero un enlace discreto “otra pregunta” ofrece 5 alternativas del banco de preguntas reflexivas, distintas cada día: *¿Qué momento de hoy te gustaría recordar dentro de un año? · ¿Qué te sorprendió? · ¿Qué necesitaste hoy y no pediste? · ¿Dónde te reconociste? · ¿A quién le debes un gracias?*
- **Justificación:** la misma pregunta durante 300 días produce saciedad y respuestas mecánicas. La rotación opcional preserva la familiaridad y añade profundidad para usuarios avanzados (persona Andrés).

#### Bloque 7 — ¿Cómo me voy a dormir hoy?

- **Cinco estados** representados con formas orgánicas (no caras, no emojis): del más pesado al más ligero, con etiquetas de texto siempre visibles: *Agotado · Inquieto · Normal · Tranquilo · En paz*.
- Al seleccionar, aparecen **chips de matiz opcionales** (máximo 2 seleccionables): agradecido, orgulloso, triste, ansioso, esperanzado, cansado, enojado, aliviado, solo, acompañado, con ilusión, abrumado.
- **Etiquetado afectivo:** nombrar la emoción reduce su intensidad (Lieberman). Este bloque, aparentemente pequeño, tiene efecto terapéutico documentado y es la fuente principal de los datos de correlación de Insights.
- **Regla de sensibilidad:** si el usuario elige “Agotado” o “Inquieto”, la secuencia de cierre cambia: sin celebración, copy compasivo específico, y se ofrece —solo si es premium y solo una vez cada 5 días— un audio breve de calma de 2 minutos. Si no es premium, se ofrece una respiración guiada gratuita de 60 segundos. **Este audio nunca es un anuncio de suscripción.**

#### Bloque 8 — **\[ELIMINADO EN v4.0\]**

El bloque *“Mi Ritual de la Noche”* —checklist de hábitos filtrado por `momento = noche`— **se elimina por completo**, igual que su equivalente de la mañana. Ver **§C2.6**.

### Secuencia de cierre

Al pulsar “Cerrar mi día”, se ejecuta la secuencia especificada en §3.3 (etapa 4), con la síntesis construida así:

- Si hay ≥ 1 logro y ≥ 1 agradecimiento: *“Hoy reconociste {n} logros y agradeciste {m} cosas.”*
- Si solo hay agradecimientos: *“Hoy encontraste {m} cosas que agradecer.”*
- Si solo hay logros: *“Hoy reconociste {n} cosas que lograste.”*
- Si no hay nada escrito pero el usuario pulsó cerrar: *“Hoy solo viniste. También cuenta.”* — **este mensaje es uno de los más importantes del producto.**

### Estados

- **Vacío:** ver arriba, bloque 2.
- **Carga:** local, imperceptible.
- **Offline:** completo.
- **Error:** protocolo de §3.9.
- **Día difícil:** la vista se reduce a tres bloques (¿qué agradezco? con una fila, ¿cómo me voy a dormir?, y un cierre) y el copy cambia por completo al registro compasivo.

### Accesibilidad

Los cinco estados de ánimo se anuncian con su etiqueta textual y su posición (“Tranquilo, 4 de 5”). Los chips de matiz son botones con estado. El contraste de las formas orgánicas se verifica en modo oscuro con brillo mínimo, escenario real de uso.

### Reglas de negocio

- **RN-VN-01** Ningún campo es obligatorio; el día puede cerrarse vacío.
- **RN-VN-02** Las victorias no completadas **nunca** generan una notificación, un contador ni un color de alerta.
- **RN-VN-03** Una victoria pospuesta se crea en el día siguiente conservando su identificador de origen para trazabilidad.
- **RN-VN-04** Si el ánimo registrado es de los dos niveles inferiores, se suprime toda celebración durante 12 horas.
- **RN-VN-05** El cierre del día es idempotente: reabrirlo y volver a cerrarlo no duplica registros ni repite celebraciones.

### Criterios de aceptación

1.  Las victorias de la mañana aparecen en la noche del mismo día, con su área y en el mismo orden.
2.  “Pasarla a mañana” crea la victoria en el día siguiente con la marca “Viene de ayer”.
3.  “Dejarla ir” la archiva sin generar ningún mensaje negativo.
4.  Cerrar el día sin escribir nada muestra el mensaje “Hoy solo viniste. También cuenta.” y no muestra celebración.
5.  Registrar un ánimo bajo suprime la celebración y activa el copy compasivo.
6.  La secuencia de cierre termina con la app atenuada y no devuelve al usuario a un menú.
7.  Reabrir la Vista de Noche tras cerrarla permite editar sin repetir la secuencia de cierre.

### 5.4.1 Bloque 7 rediseñado — “¿Cómo te vas a dormir?” \[ACTUALIZADO EN BLOQUE 02\]

> **Esta subsección sustituye el comportamiento del Bloque 7 descrito arriba.** El texto original (cinco estados con formas orgánicas + doce chips de matiz) se conserva íntegro como historia de la decisión. El comportamiento vigente en Fase 0 es el que se especifica aquí. La regla de sensibilidad del texto original **sigue vigente** y se reexpresa más abajo en términos del nuevo catálogo.

#### Copy literal de la pantalla

- **Título:** “¿Cómo te vas a dormir?”
- **Subtítulo:** “Elige una o dos. No hay una forma correcta de cerrar el día”
- El subtítulo no es decorativo: es la única defensa del bloque contra la sensación de examen. **No puede acortarse ni reescribirse.**

#### Las nueve opciones

Cada opción se declara en el formato `{ m, f, n }` y se resuelve en render con el helper de género (§3.6.5). El **id** es lo único que se persiste (RN-GEN-04).

| id (persistido) | m          | f          | n (por defecto) |
|:----------------|:-----------|:-----------|:----------------|
| `en_paz`        | En paz     | En paz     | En paz          |
| `agradecido`    | Agradecido | Agradecida | Con gratitud    |
| `orgulloso`     | Orgulloso  | Orgullosa  | Con orgullo     |
| `tranquilo`     | Tranquilo  | Tranquila  | En calma        |
| `contento`      | Contento   | Contenta   | Con alegría     |
| `pensativo`     | Pensativo  | Pensativa  | Pensando        |
| `cansado`       | Cansado    | Cansada    | Con cansancio   |
| `inquieto`      | Inquieto   | Inquieta   | Con inquietud   |
| `otro`          | Algo más   | Algo más   | Algo más        |

- **Orden fijo.** Va de lo más ligero a lo más pesado, y “Algo más” siempre cierra. El orden no se personaliza, no se reordena por frecuencia de uso y no se aleatoriza: la estabilidad de posición es parte de la calma de la pantalla.
- **El catálogo incluye estados difíciles** (Cansado, Inquieto, Pensativo) de forma deliberada. Cerrar el día en falso no sirve a nadie (§3.4).
- Los `id` son **opacos y estables**. Su forma masculina es un accidente histórico del código, **no una etiqueta visible**: no se muestran nunca al usuario y no se traducen.

#### Selección

- **Máximo 2 selecciones.** Al intentar una tercera, la más antigua se deselecciona con la misma animación suave que el Bloque 3 de la vista de mañana. No hay mensaje de error; como mucho, una nota discreta.
- Mínimo 0: **se puede cerrar el día sin elegir nada**. El bloque nunca bloquea el cierre.
- Toque para seleccionar, toque para deseleccionar. Háptica ligera (§6.11).

#### “Algo más”

- Al seleccionar `otro`, se abre **en línea** (sin modal, sin cambio de pantalla) un campo de texto de **UNA sola palabra**.
- El campo aplica un límite duro: se acepta la primera palabra escrita; los espacios adicionales no crean una segunda palabra.
- Longitud máxima 24 caracteres. Sin validación de contenido, sin autocorrección de estilo, sin sugerencias.
- **El texto se guarda tal cual lo escribió el usuario, en** `estadoSuenoOtro`, y nunca pasa por el helper de género (RN-GEN-06).
- Si el usuario selecciona `otro` y no escribe nada, la selección se descarta al salir del bloque; no se guarda una opción vacía.
- `otro` cuenta como una de las dos selecciones permitidas.

#### Regla de sensibilidad (reexpresada)

La regla del texto original —si el usuario elige un estado pesado, la secuencia de cierre cambia— **sigue vigente**, traducida al catálogo nuevo:

- **Disparadores:** `cansado`, `inquieto`. (En el catálogo anterior: “Agotado” e “Inquieto”.)
- **Efecto:** sin celebración; copy compasivo específico; oferta de audio breve de calma (premium, máximo una vez cada 5 días) o respiración guiada gratuita de 60 s. **Nunca es un anuncio de suscripción.**
- `pensativo` **no** dispara la regla: pensar mucho no es lo mismo que estar mal.

#### Migración desde el modelo anterior

La implementación sustituye dos campos por uno. La correspondencia es explícita y **no destructiva**:

| Modelo anterior (v3)                                              | Modelo vigente (Fase 0)                        |
|:------------------------------------------------------------------|:-----------------------------------------------|
| `noche.animo: enum(agotado, inquieto, normal, tranquilo, en_paz)` | `noche.estadoSueno: [id]` (máx. 2)             |
| `noche.matices: [enum]` (máx. 2, 12 valores)                      | **Absorbido** por `estadoSueno`                |
| —                                                                 | `noche.estadoSuenoOtro?: string` (una palabra) |

- Los registros históricos escritos con el modelo anterior **se conservan tal cual** y se siguen leyendo. Un `DailyEntry` antiguo con `animo: "tranquilo"` se presenta como el estado `tranquilo` del catálogo nuevo. `agotado` se presenta como `cansado`; `normal` no tiene equivalente y se muestra sin etiqueta.
- **Ninguna entrada histórica se reescribe.** La lectura resuelve la diferencia; la escritura solo usa el modelo nuevo.

#### Compatibilidad con Historial e Insights (`animoDerivado`)

El calendario del Historial (puntos de ánimo) y las correlaciones de Insights (§5.9) dependen de la **paleta de ánimo de 5 estados** de §6.3.5. Para no perder esa capacidad, se define una **derivación determinista de solo lectura**, calculada al vuelo y **nunca persistida**:

| Estado seleccionado                   | `animoDerivado` |
|:--------------------------------------|:----------------|
| `en_paz`                              | en_paz          |
| `agradecido`, `orgulloso`, `contento` | en_paz          |
| `tranquilo`                           | tranquilo       |
| `pensativo`                           | normal          |
| `cansado`                             | agotado         |
| `inquieto`                            | inquieto        |
| `otro`, sin selección                 | normal          |

- Si hay dos selecciones, gana **la más pesada** (orden: agotado \> inquieto \> normal \> tranquilo \> en_paz). Un día en que alguien se va “Agradecido y Cansado” se representa como cansado: la app no maquilla el estado del usuario para que el calendario se vea mejor.
- `animoDerivado` **es una vista, no un dato.** No se escribe en IndexedDB ni en Firestore. Si mañana cambia el catálogo, cambia la función y no hay migración.

#### Vista de noche del Diario — presentación del estado guardado

- Se muestran las etiquetas resueltas al género vigente, separadas por ” · ” cuando hay dos: *“Te fuiste a dormir: En paz · Agradecida”*.
- Si el estado es `otro`, se muestra la palabra del usuario **entrecomillada y sin transformar**: *“Te fuiste a dormir: «serena»”*.
- Si no se eligió nada, **el bloque no aparece** en la vista. No hay marcador de ausencia.
- El estado se puede cambiar desde la vista de noche mientras el día no esté cerrado, con las mismas reglas (máx. 2).

#### Criterios de aceptación

1.  Una usuaria con género femenino ve “Tranquila”, “Agradecida”, “Orgullosa”; un usuario masculino ve las formas en `-o`; sin género declarado, ve las formas neutras.
2.  Cambiar el género en Perfil cambia las etiquetas de **entradas ya guardadas**, incluidas las del historial.
3.  No es posible seleccionar tres opciones.
4.  “Algo más” acepta una palabra y solo una, y la guarda literalmente.
5.  Cerrar el día sin seleccionar nada es posible y no produce ningún mensaje.
6.  Elegir `cansado` o `inquieto` cambia la secuencia de cierre a la variante compasiva, sin celebración.

### 5.4.2 Etiqueta de área en el Bloque 8 — **\[DEROGADO EN v4.0\]**

Sin objeto: el Bloque 8 ya no existe. La regla de §5.7.4 se conserva y se aplica en Formia.

### 5.4.3 Contraste de la vista de noche \[ACTUALIZADO EN BLOQUE 01\]

La vista de noche declara `data-surface="dark"` en su contenedor raíz y hereda `--color-text-on-dark` en todos sus textos (§6.3.7). **Corrección explícita:** en la versión anterior del prototipo, parte del texto de la vista nocturna se pintaba en un tono oscuro sobre fondo oscuro y resultaba ilegible. Ningún componente de esta vista puede fijar su color de texto con un valor literal.

## 5.6 Módulo: Ritual de Noche

\[REUBICADO DE CAPÍTULO 5 — v3.1\] · **SIN CAMBIOS EN v4.0.** Se conserva íntegro dentro de Lumia. Única salvedad documentada: la pantalla **N2 — Revisión de hábitos** muestra datos de hábitos dentro de una superficie de Lumia; se conserva tal cual por instrucción explícita y la contradicción queda registrada en **§C7.7.1**.

### Objetivo

Que el usuario termine su jornada sintiendo progreso **incluso cuando el día no haya sido perfecto**, y que este ritual sea el principal punto de entrada de datos al historial personal.

### Activación

- Pop-up automático en la **primera apertura entre las 19:00 y las 23:59** hora local.
- No reaparece si ya fue completado ese día.
- Mismas reglas de cierre, accesibilidad posterior y desactivación tras tres rechazos que el ritual matinal.
- **Extensión de madrugada:** si el usuario abre la app entre las 00:00 y las 3:00 y **no** completó el ritual del día anterior, se ofrece —con copy específico— cerrar “el día de ayer”: *“¿Cerramos el jueves antes de dormir?”*. **Justificación:** para muchos usuarios reales, la 1:00 sigue siendo “anoche”. Ignorar esto genera huecos falsos en el historial y sensación de fallo.

### Flujo (5 pantallas guiadas) — **\[ACTUALIZADO EN v4.1\]**

> **N2 se retira.** La pantalla “Revisión de hábitos” desaparece del Ritual de Noche (§C7.7.1): era la única superficie de Lumia que leía y escribía datos de hábitos, la misma mezcla que motivó disolver el Ritual de Mañana. Los hábitos se marcan **solo en Formia**.
>
> **Consecuencias exactas:**
>
> - El ritual queda en **cinco pantallas**: N1 descompresión, N3 logros, N4 agradecimientos, N5 estado de sueño y reflexión, N6 cierre. **Se conservan los identificadores N3 a N6** (no se renumeran): son identificadores estables, igual que los números de sección (§C0.7).
> - **RN-HR-01 y RN-HR-02 dejan de aplicar en la noche.** Marcar un hábito ya no tiene ninguna superficie de Lumia que actualizar.
> - **El criterio de aceptación 2 de este módulo** (“los datos alimentan Insights”) sigue vigente para logros, agradecimientos y estado de sueño; deja de serlo para `HabitLog`, que ya no se escribe desde aquí.
> - **RN-RN-03** (ritual completable en menos de 90 segundos) se cumple con más holgura al haber una pantalla menos.
> - La tabla siguiente conserva la fila de N2 tachada como historia de la decisión.

| \#     | Pantalla                  | Contenido                                                                     | Escribe en                             |
|:-------|:--------------------------|:------------------------------------------------------------------------------|:---------------------------------------|
| N1     | Descompresión             | Círculo de respiración (6 s) + *“El día ya pasó. Vamos a mirarlo con calma.”* | —                                      |
| ~~N2~~ | ~~Revisión de hábitos\]~~ | **\[RETIRADO EN v4.1\]** — ver §C7.7.1                                        | —                                      |
| N3     | Logros                    | Victorias heredadas + logros no planeados                                     | `DailyEntry.noche.logros`              |
| N4     | Agradecimientos           | Sistema de filas dinámicas                                                    | `DailyEntry.noche.agradecimientos`     |
| N5     | Cómo me sentí hoy         | Cinco estados + chips de matiz + campo de reflexión opcional                  | `DailyEntry.noche.animo`, `.reflexion` |
| N6     | Cierre                    | Síntesis con datos reales + frase de cierre + animación de luz                | —                                      |

**Diferencia con la Vista de Noche:** el ritual presenta menos campos (omite “qué intentar diferente” y la reflexión larga, que quedan como opcionales al final: *“¿Quieres escribir un poco más?”*). **Justificación:** un ritual de 6 pantallas ya está en el límite de la fatiga nocturna. La profundidad extra debe ser opt-in, no obligatoria.

### Microinteracciones

- N2: al marcar el último hábito pendiente, la barra se completa con un recorrido de luz.
- N3: al marcar una victoria como lograda, la fila se ilumina 400 ms antes de asentarse.
- N6: la secuencia de cierre completa de §3.3.

### Reglas de negocio

- **RN-RN-01** Ventana 19:00–23:59, con extensión 00:00–3:00 para el día anterior.
- **RN-RN-02** Todo lo capturado se sincroniza automáticamente con Logros, Agradecimientos, Journal (si hubo reflexión larga) e Insights.
- **RN-RN-03** El ritual es completable en menos de 90 segundos si el usuario solo marca y no escribe.
- **RN-RN-04** Si el ánimo es bajo, N6 usa el copy compasivo y suprime la celebración.

### Criterios de aceptación

1.  Completar el ritual crea o actualiza el `DailyEntry` del día correcto (incluida la extensión de madrugada).
2.  Los datos aparecen inmediatamente en Historial y alimentan Insights.
3.  El ritual se puede abandonar en cualquier pantalla conservando lo ya escrito.
4.  La secuencia de cierre se ejecuta una sola vez por día.

### 5.6.1 N5 — Estado de sueño rediseñado \[ACTUALIZADO EN BLOQUE 02\]

La pantalla N5 del Ritual de Noche presenta el bloque “¿Cómo te vas a dormir?” con la especificación completa de **§5.4.1**: título y subtítulo literales, nueve opciones en formato `{ m, f, n }`, máximo dos selecciones, “Algo más” con campo en línea de una palabra, y persistencia por identificador estable.

- N5 y el Bloque 7 de la Vista de Noche (§5.4) **escriben en el mismo campo** `DailyEntry.noche.estadoSueno`, coherentes con la decisión D-4.5 (§4.5): el Ritual es el modo guiado y el Diario la vista libre del mismo dato. Rellenar uno rellena el otro.
- El paso es **saltable**. Saltarlo no impide llegar a N6 ni altera la síntesis de cierre.
- La **regla de sensibilidad** (§5.4.1) se evalúa **al salir de N5** y determina la variante de N6: con `cansado` o `inquieto`, N6 usa la secuencia compasiva sin celebración.

#### Hábitos en el Ritual de Noche — **\[DEROGADO EN v4.1\]**

Sin objeto: no hay checklist de hábitos en el Ritual de Noche. La regla de etiquetado de §5.7.4 se conserva y se aplica en Formia.

## 5.8 Módulo: Journal (escritura libre)

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

### Objetivo

Un espacio sin estructura, sin preguntas y sin juicio, donde el usuario pueda escribir lo que sea. Es el contrapeso del Diario: si el Diario es la conversación guiada, el Journal es el silencio disponible.

### Contexto de uso

Se usa de forma irregular: días de mucha carga emocional, decisiones importantes, momentos de claridad. La frecuencia esperada es baja (1–3 veces por semana), pero **su valor percibido es altísimo** y sostiene la sensación de “aquí cabe todo”.

### Wireframe — lista

    ┌───────────────────────────────┐
    │  Journal            ‹ + ›     │
    │  ▭ Buscar                     │
    │                               │
    │  HOY                          │
    │  ┌─────────────────────────┐  │
    │  │ 23:14                   │  │
    │  │ Hoy hablé con mi jefa   │  │
    │  │ y salió mejor de lo…    │  │
    │  │ #trabajo                │  │
    │  └─────────────────────────┘  │
    │                               │
    │  ESTA SEMANA                  │
    │  ┌─────────────────────────┐  │
    │  │ Martes 22 · 07:40       │  │
    │  │ No pude dormir bien…    │  │
    │  └─────────────────────────┘  │
    │  ···                          │
    └───────────────────────────────┘

### Wireframe — editor

    ┌───────────────────────────────┐
    │  ‹                        ⋯   │
    │  Jueves, 24 de julio · 23:14  │
    │                               │
    │  ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭     │
    │  (área de escritura a         │
    │   pantalla completa)          │
    │                               │
    │                               │
    │  ─────────────────────────    │
    │  # etiqueta   ☺ ánimo   📎    │
    └───────────────────────────────┘

### Comportamiento

- **Al pulsar “+”, el cursor está listo.** Cero fricción: sin título obligatorio, sin selección de plantilla, sin pregunta.
- Fecha y hora se registran automáticamente y son visibles pero no editables (V1 permite editar la fecha para entradas retroactivas).
- **Guardado automático** cada 800 ms y al salir. Una entrada vacía no se guarda.
- **Modo escritura sin distracciones:** al empezar a escribir, la barra superior e inferior se desvanecen (opacidad 0) y reaparecen al tocar la pantalla o al dejar de escribir 3 s.
- **Funcionalidades opcionales** (todas desactivables, ninguna obligatoria):
  - **Etiquetas** libres con `#`, con autocompletado de las ya usadas.
  - **Ánimo** opcional por entrada (mismos 5 estados que el Diario) — alimenta correlaciones en Insights.
  - **Adjuntos**: una foto por entrada (V2). Audio (V3).
  - **Título** opcional; si no hay, se usan las primeras 40 caracteres.
  - **Búsqueda** por texto completo, etiqueta, rango de fechas y ánimo.
  - **Bloqueo por entrada**: marcar una entrada como “privada”, que exige biometría incluso con la app abierta (V2). **Justificación:** habilita al usuario a escribir lo que realmente no le contaría a nadie, que es exactamente donde está el valor terapéutico.
  - **Plantillas opcionales** desde el menú “⋯”: carta a alguien, carta a mi yo futuro, descarga mental, decisión difícil. Nunca aparecen sin ser solicitadas.

### Relación con la IA (opt-in estricto)

- **Resumen de entrada** (premium, bajo demanda): *“Resumir esto en tres líneas”*.
- **Temas recurrentes** (premium, mensual): la IA identifica temas que se repiten y los presenta en Insights, nunca dentro del editor.
- **La IA nunca sugiere texto mientras el usuario escribe, nunca corrige, nunca comenta una entrada sin que se le pida.** Esta regla es absoluta: el Journal es el único espacio de la app donde el sistema es completamente mudo.

### Estados

- **Vacío:** *“Aquí caben los pensamientos que no caben en otro lado. Empieza cuando quieras.”* + botón grande de escritura.
- **Carga:** lista paginada de 30 entradas, carga progresiva al desplazar, sin indicador de carga si tarda menos de 300 ms.
- **Offline:** completo, incluidas búsqueda y edición.
- **Error:** si falla el guardado remoto, la entrada permanece local con indicador discreto de “pendiente de sincronizar”.

### Accesibilidad

Editor compatible con lector de pantalla y dictado del sistema; contraste del texto de escritura AAA (7:1) porque es el texto que más tiempo se lee; tamaño de fuente del editor configurable de forma independiente al resto de la app (**decisión deliberada**: los usuarios de journaling tienen preferencias específicas de lectura).

### Reglas de negocio

- **RN-JR-01** Ninguna entrada de Journal se elimina automáticamente jamás.
- **RN-JR-02** El plan gratuito incluye Journal ilimitado en escritura y lectura; solo el resumen por IA y la búsqueda anterior a 60 días son premium.
- **RN-JR-03** El Journal nunca muestra sugerencias no solicitadas.
- **RN-JR-04** El contenido del Journal jamás aparece en notificaciones ni en widgets.

### Criterios de aceptación

1.  Desde la lista, pulsar “+” y empezar a escribir toma menos de 1 segundo y 1 toque.
2.  Cerrar la app a mitad de una entrada y reabrirla conserva el texto exacto, incluida la posición del cursor.
3.  La búsqueda encuentra texto en entradas de hace más de un año en menos de 500 ms con 1.000 entradas.
4.  Sin conexión, se pueden crear, editar, buscar y leer entradas sin ninguna degradación.
5.  Ninguna función de IA se activa sin consentimiento explícito previo.

### 5.8.1 Rediseño del editor: emociones y tarjetas de sección \[ACTUALIZADO EN BLOQUE 06\]

**Problema que resuelve.** El editor original cumplía su objetivo —cero fricción— pero se percibía **vacío y sin personalidad**: una pantalla en blanco con un cursor. En un módulo cuya frecuencia de uso es baja (1–3 veces por semana) y cuyo valor percibido debe ser altísimo, la ausencia total de estructura no se lee como libertad, se lee como abandono. El Bloque 06 añade estructura **sin añadir obligación**: todo lo nuevo es opcional y nada bloquea la escritura.

#### Estructura del editor

El editor pasa a tener dos tarjetas de sección, con tonos distintos y deliberadamente contrastados:

| Tarjeta                | Contenido                               | Tono                       | Token                           |
|:-----------------------|:----------------------------------------|:---------------------------|:--------------------------------|
| **“¿Cómo me siento?”** | Selector de emociones (chips con emoji) | **Cálido** — arena / beige | `--journal-card-warm` (§6.3.10) |
| **“Mi diario de hoy”** | Área de escritura libre                 | **Frío** — azul claro      | `--journal-card-cool` (§6.3.10) |

- Las tarjetas **no colapsan la escritura**: al empezar a escribir, la tarjeta de emociones se mantiene visible pero se atenúa, y el modo sin distracciones (barras que se desvanecen) sigue funcionando igual que antes.
- **Ninguna de las dos secciones es obligatoria.** Se puede guardar una entrada solo con emociones, solo con texto, o con ambas. Una entrada completamente vacía sigue sin guardarse (regla original intacta).

#### Selector de emociones

- **15 emociones**, chips tipo píldora, **cada uno con emoji**, **máximo 3 selecciones**.
- Etiquetas en formato `{ m, f, n }`, resueltas con el helper de género (§3.6.5). **Se persisten los** `id`**, nunca las etiquetas** (RN-GEN-04).

| id            | emoji | m           | f           | n               |
|:--------------|:------|:------------|:------------|:----------------|
| `feliz`       | 😊    | Feliz       | Feliz       | Feliz           |
| `agradecido`  | 🙏    | Agradecido  | Agradecida  | Con gratitud    |
| `tranquilo`   | 🌿    | Tranquilo   | Tranquila   | En calma        |
| `orgulloso`   | ✨    | Orgulloso   | Orgullosa   | Con orgullo     |
| `esperanzado` | 🌅    | Esperanzado | Esperanzada | Con esperanza   |
| `motivado`    | 🔥    | Motivado    | Motivada    | Con motivación  |
| `aliviado`    | 🌤️ A  | liviado A   | liviada C   | on alivio       |
| `acompanado`  | 🤝    | Acompañado  | Acompañada  | En compañía     |
| `cansado`     | 😴    | Cansado     | Cansada     | Con cansancio   |
| `triste`      | 💧    | Triste      | Triste      | Triste          |
| `ansioso`     | 🌀    | Ansioso     | Ansiosa     | Con ansiedad    |
| `frustrado`   | 😤    | Frustrado   | Frustrada   | Con frustración |
| `preocupado`  | 🌧️ P  | reocupado P | reocupada C | on preocupación |
| `melancolico` | 🍂    | Melancólico | Melancólica | Con melancolía  |
| `solo`        | 🌑    | Solo        | Sola        | En soledad      |

- **Orden fijo**, de las más ligeras a las más pesadas. No se reordena por frecuencia de uso.
- **Las emociones difíciles son obligatorias en el catálogo** (Triste, Ansioso, Frustrado, Preocupado, Melancólico, Solo, Cansado). Este es el punto del producto donde caben los días malos.
- **Chip “+ Otra”**, con **borde punteado** para distinguirlo visualmente de los chips de catálogo. Abre un campo de **una sola palabra** (mismas reglas que “Algo más” en §5.4.1: primera palabra, máximo 24 caracteres, sin transformación, sin paso por el helper de género). Cuenta como una de las 3 selecciones.
- Al intentar una cuarta selección, la más antigua se deselecciona con animación suave, sin mensaje de error.

#### Contradicciones resueltas

- **Regla “sin emojis en la voz de la app” (§3.6.2, punto 5).** Sigue vigente **para el copy del producto**: la aplicación no escribe emojis en sus frases, notificaciones ni mensajes. Los chips del Journal **no son voz de la app**: son un vocabulario que el usuario elige para nombrar su propio estado, y §3.6.2 ya establece que *“los emojis pertenecen al usuario”*. La resolución es, por tanto, coherente con la regla y no una excepción a ella.
- **Íconos propios de emoción (§6.7).** Las 16 ilustraciones abstractas de emoción **siguen siendo obligatorias en el Diario** (vista de mañana, Bloque 3), donde la emoción es una intención que se cultiva y la forma abstracta permite proyección. El Journal usa emoji porque registra un estado presente y concreto, y porque la lectura debe ser instantánea. **Dos catálogos, dos representaciones, dos propósitos** (§5.3.2).
- **Ánimo por entrada.** El texto original de §5.8 menciona un “ánimo opcional por entrada (mismos 5 estados que el Diario)”. En Fase 0, **ese campo queda sustituido por el selector de 15 emociones**. Para las correlaciones de Insights se aplica la misma derivación de solo lectura definida en §5.4.1 (`animoDerivado`), calculada al vuelo y nunca persistida.

#### Autoguardado y persistencia

- **El autoguardado no cambia:** *debounce* de 800 ms, volcado inmediato al perder el foco, al minimizar y antes de navegar (§7.4). Las emociones se guardan con el mismo mecanismo que el texto: seleccionar un chip **es** una edición.
- Nuevo campo `JournalEntry.emociones: [id]` (máx. 3) y `JournalEntry.emocionOtra?: string` (§7.2).
- Cerrar la app a mitad de una entrada conserva texto **y** selección de emociones.

#### Fuera de alcance de esta ronda

El mockup de referencia incluía navegación por fecha dentro del Journal y una acción “Descargar mi journal”. **Ninguna de las dos entra en Fase 0**; la exportación general sigue estando en Perfil → Tus datos (§5.12). Se registran como decisión abierta (Capítulo 10).

#### Criterios de aceptación

1.  Se pueden seleccionar hasta 3 emociones y no más.
2.  Las etiquetas se muestran en el género del perfil y cambian retroactivamente al cambiarlo.
3.  “+ Otra” acepta una sola palabra y la guarda literalmente.
4.  Una entrada solo con emociones se guarda; una entrada totalmente vacía no.
5.  Las emociones difíciles están presentes y no llevan ningún tratamiento visual de advertencia.
6.  Cerrar la app a mitad de la edición conserva texto y emociones.

### 5.8.2 Protección del Journal con PIN \[ACTUALIZADO EN BLOQUE 07\]

**Objetivo.** Que el usuario pueda escribir en el Journal lo que no le contaría a nadie, sabiendo que quien tome su teléfono desbloqueado no lo va a leer sin querer. El texto original de §5.8 ya anticipaba esta necesidad con el “bloqueo por entrada” previsto para V2; el Bloque 07 adelanta a Fase 0 una versión **más simple y más honesta**: bloqueo de acceso a todo el módulo, con PIN, **sin cifrado del contenido**.

#### Activación

- Interruptor **“Proteger mi journal”** en Perfil → Privacidad y seguridad (§5.12.1).
- **Desactivado por defecto.** La app nunca propone activarlo por su cuenta ni lo sugiere de forma repetida.
- **PIN numérico de 4 a 6 dígitos.** Solo dígitos. Teclado numérico. Sin caracteres alfabéticos, sin patrones de puntos, sin biometría en Fase 0.
- Confirmación en dos pasos: introducir y repetir. Si no coinciden, se repite sin culpabilizar.
- Desactivar la protección exige introducir el PIN vigente.

#### Almacenamiento del PIN

- **Nunca se guarda el PIN.** Se guarda su derivación.
- **Algoritmo: PBKDF2 con SHA-256.**
- **Salt aleatorio de 16 bytes**, generado con el generador criptográfico del navegador, distinto por usuario.
- **Iteraciones: ≥ 150.000.** El número usado se **persiste junto al hash**, para poder subirlo en el futuro sin invalidar los PIN existentes.
- Se persisten: `algoritmo`, `iteraciones`, `salt`, `hash`. Ninguno de esos campos permite recuperar el PIN.
- La verificación compara el hash derivado del PIN introducido con el almacenado, en tiempo constante.

#### Bloqueo de acceso, NO cifrado de contenido

**Esta es la limitación más importante de la funcionalidad y debe entenderse literalmente.**

- El PIN **impide entrar al módulo Journal desde la interfaz**. **No cifra el contenido de las entradas.** Quien tenga acceso físico al dispositivo y conocimientos técnicos puede leer la base de datos local.
- El cifrado del contenido es trabajo de **Fase 1** y está fuera del alcance de Fase 0.
- **Regla de copy (dura):** en ninguna pantalla, ajuste, texto de ayuda o mensaje relacionado con esta funcionalidad puede aparecer la palabra **“cifrado”**, **“encriptado”**, **“seguro”** ni ninguna promesa equivalente de inviolabilidad. El copy autorizado habla de **“acceso en este dispositivo”**.
- Autorizado: *“Pide un PIN para abrir tu journal en este dispositivo.”*
- Prohibido: *“Tu journal está cifrado”*, *“Tus entradas están seguras”*, *“Protección total”*.
- **Justificación:** §7.8 compromete honestidad literal sobre lo que la app hace con los datos del usuario. Prometer cifrado sin cifrar sería la peor clase de mentira que puede contar un producto de escritura íntima. Esta regla se verifica en el linter de copy.

#### Pantalla de desbloqueo

- Al entrar al Journal con la protección activa, se muestra la pantalla de desbloqueo.
- **RN-JR-PIN-01** El contenido del Journal **no se renderiza en absoluto** antes del desbloqueo: no hay lista difuminada, no hay títulos, no hay conteo de entradas, no hay previsualización bajo un velo. Lo que no se pinta no se puede fotografiar ni filtrar por un fallo de opacidad.
- El contenido tampoco se carga en memoria hasta que el desbloqueo es correcto.
- Sin límite de intentos ni bloqueo temporal en Fase 0 (no hay nada que proteger criptográficamente que un límite de intentos mejore). El teclado numérico no revela los dígitos introducidos.
- Enlace discreto: **“Olvidé mi PIN”**.

#### Recuperación: “Olvidé mi PIN”

- La recuperación **reautentica al usuario contra su cuenta de Firebase** (enlace por correo o código SMS, según el método vinculado) y, tras verificar la identidad, permite **crear un PIN nuevo**.
- **Ninguna entrada del Journal se pierde en el proceso.** El PIN es una puerta, no una llave de descifrado: cambiarlo no toca el contenido.
- El PIN antiguo se descarta; el nuevo genera **salt nuevo** y se rederiva por completo.

#### Caso límite: usuarios sin correo ni teléfono vinculados

- Un usuario que creó su cuenta sin correo ni teléfono **no puede crear un PIN**, porque no existiría ninguna vía de recuperación y quedaría bloqueado fuera de su propio journal de forma permanente.
- El interruptor “Proteger mi journal” aparece **desactivado con una explicación clara**, y ofrece un acceso directo a vincular una cuenta.
- La pantalla de vinculación (`CuentaParaPin`) permite añadir correo o teléfono desde el propio panel de ajustes y, al terminar, habilita el interruptor.
- **RN-JR-PIN-02** Nunca puede existir un PIN activo sobre una cuenta sin método de recuperación vinculado. Si el usuario desvincula su único método teniendo PIN activo, se le advierte y se le exige elegir: mantener el método o desactivar el PIN.

#### Criterios de aceptación

1.  Con la protección desactivada (por defecto), el Journal se abre como siempre, en un toque.
2.  Con la protección activa, ninguna parte del contenido del Journal aparece en pantalla antes del desbloqueo correcto.
3.  El PIN acepta de 4 a 6 dígitos y rechaza cualquier carácter no numérico.
4.  En el almacén local existen `salt`, `hash`, `iteraciones` y `algoritmo`, y **no** existe el PIN en claro.
5.  “Olvidé mi PIN” reautentica contra Firebase y permite fijar un PIN nuevo sin perder ninguna entrada.
6.  Un usuario sin correo ni teléfono vinculados no puede activar el interruptor y recibe una explicación accionable.
7.  El linter de copy falla si aparece “cifrado”, “encriptado” o “seguro” en cualquier cadena de este flujo.

## 7.7.1 Bloqueo del Journal por PIN en Fase 0 \[ACTUALIZADO EN BLOQUE 07\]

\[REUBICADO DE CAPÍTULO 7 — v3.1\] — se aloja junto al módulo al que sirve.

Esta subsección **acota** lo que §7.7 describe como estado objetivo del producto y declara sin ambigüedad qué parte está implementada en Fase 0 y qué parte no.

| Compromiso de §7.7                  | Estado en Fase 0                                                                                                                                                                                                                                                                          |
|:------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Transporte TLS 1.3                  | Vigente (Firebase / Netlify)                                                                                                                                                                                                                                                              |
| Cifrado en reposo en servidor       | Vigente a nivel de proveedor; **el cifrado por campo es Fase 1**                                                                                                                                                                                                                          |
| Base de datos local cifrada         | **NO implementado.** IndexedDB sin cifrar. Fase 1                                                                                                                                                                                                                                         |
| Bloqueo de la app (biometría o PIN) | **Parcial:** PIN **solo para el módulo Journal**; sin biometría; sin ocultación en el conmutador de aplicaciones                                                                                                                                                                          |
| “Sin contraseñas propias”           | **Se mantiene para la autenticación.** El PIN **no es una credencial de cuenta**: no autentica contra ningún servidor, no viaja por la red y no puede usarse para iniciar sesión. Es un control de acceso local a un módulo. La contradicción con §7.7 es aparente y queda resuelta aquí. |

### Especificación criptográfica

- **Derivación:** PBKDF2 con SHA-256, **≥ 150.000 iteraciones**, **salt aleatorio de 16 bytes** obtenido del generador criptográfico del navegador.
- El **número de iteraciones se almacena junto al hash**, de modo que puede elevarse en el futuro sin invalidar los PIN existentes: al verificar correctamente con el parámetro antiguo, se rederiva con el nuevo y se reescribe.
- **Comparación en tiempo constante.** Nunca se compara con igualdad de cadenas.
- **No se almacena el PIN.** No hay campo, ni caché en memoria más allá de la verificación, ni registro en consola, ni traza en analítica.

### Lo que esta funcionalidad NO hace

- **No cifra el contenido del Journal.** Quien tenga acceso físico al dispositivo y conocimientos técnicos puede leer IndexedDB directamente.
- **No protege contra malware, ni contra un respaldo del sistema operativo, ni contra alguien con la contraseña del dispositivo.**
- **No es un segundo factor** ni forma parte de la autenticación de la cuenta.

**Regla de comunicación (dura).** El copy de esta funcionalidad **no puede** usar “cifrado”, “encriptado” ni “seguro”. Habla de **“acceso en este dispositivo”** (§5.8.2). Esta regla se comprueba en el linter de copy y su incumplimiento es un fallo de compilación, no una observación de estilo. **Justificación:** §7.8 compromete que la app dirá la verdad sobre lo que hace con los datos del usuario, incluso cuando la verdad sea menos vendible.

### Recuperación

- **“Olvidé mi PIN”** → reautenticación contra Firebase (enlace por correo o código SMS) → creación de un PIN nuevo con salt nuevo.
- **Ninguna entrada se pierde**: el PIN no descifra nada, luego cambiarlo no puede destruir nada.
- **RN-SEC-PIN-01** No puede existir un PIN activo sobre una cuenta sin método de recuperación vinculado. Si el usuario desvincula su único método teniendo PIN activo, se le advierte y debe elegir entre mantener el método o desactivar el PIN.

## 5.10 Módulo: Historial — parte emocional (Lumia)

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

### Objetivo

Que el usuario pueda volver a cualquier día de su vida registrada y que hacerlo se sienta bien.

> **Nota de v4.0.** Este módulo se parte en dos. Lo que queda aquí es la parte de **estado emocional y ánimo**: calendario, línea de tiempo y búsqueda. La parte de **hábitos y constancia acumulada** se reubica en Formia (§C3.7). La **vista de día completo** muestra, desde v4.1, **únicamente contenido de Lumia** —mañana, noche y journal, sin hábitos— (§C7.7.2).

### Estructura

- **Vista de calendario mensual:** cada día con registro se marca con un punto de color según el ánimo registrado (paleta cálida de 5 tonos, **sin rojo**). Los días sin registro no se marcan de ningún modo especial: **no hay huecos, no hay grises acusatorios, no hay “días perdidos”**. Un día sin registro simplemente no tiene punto.
- **Vista de línea de tiempo:** desplazamiento cronológico inverso con tarjetas de día que muestran un extracto.
- **Vista de día completo:** todo lo registrado ese día (mañana, noche, journal, hábitos) en una página serena, con la fecha en grande.
- **Búsqueda global:** por palabra, etiqueta, categoría, ánimo y rango de fechas.

### Comportamiento

- Deslizamiento horizontal entre días.
- Compartir un día: genera una imagen bella con **solo el texto que el usuario seleccione explícitamente**. Nunca comparte automáticamente contenido íntimo. Aviso claro antes de compartir.
- Exportación: PDF de un mes o del año completo, con tipografía cuidada. **Alto valor percibido, coste técnico bajo, gran generador de recomendación.**

### Reglas de negocio

- **RN-HI-01** Plan gratuito: acceso a los últimos 60 días. Premium: todo. **Los datos anteriores no se borran ni se ocultan: se muestran con un mensaje que explica que están a salvo y se pueden exportar gratis en cualquier momento.**
- **RN-HI-02** La exportación completa de datos es gratuita siempre, para todos los planes, en formato legible (JSON + PDF).

### Criterios de aceptación

1.  Navegar 12 meses atrás no supera 200 ms por transición con 365 días de datos.
2.  Los días sin registro no se muestran con ninguna marca negativa.
3.  La exportación PDF respeta tipografía, saltos de página y contenido íntegro.

## 5.14.1 Modo día difícil

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

- **Activación:** enlace discreto siempre presente en la Vista de Noche y en Hoy durante la franja nocturna: *“Hoy fue un día difícil”*.
- **Efecto:** la vista se reduce a una sola pregunta (*“¿Hay algo, aunque sea pequeño, que quieras dejar escrito?”*), se suprimen celebraciones, hábitos y victorias durante 12 h, el copy cambia a registro compasivo y el cierre dice: *“Los días así también cuentan. Descansa.”*
- **Justificación:** los días difíciles son los días de mayor abandono y de mayor necesidad. Ofrecer una versión reducida convierte un abandono probable en un registro real y en un momento de lealtad profunda.

## 5.14.2 Carta a tu yo futuro

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

- El usuario escribe una carta y elige cuándo recibirla (1, 3, 6 o 12 meses).
- Se entrega mediante notificación especial y una pantalla dedicada, con el contexto del día en que se escribió (“Ese día registraste que te sentías inquieta”).
- **Es el momento de mayor impacto emocional de todo el producto** y el mecanismo de retención a largo plazo más honesto que existe: el compromiso futuro lo crea el propio usuario.

# Capítulo 3 — Formia

> **Formia — hacia delante.** *¿Quién quiero ser?* · *“Hábitos que construyen tu mejor versión.”* · *“Actúa desde tu identidad, no desde tus hábitos.”*

## C3.0 Alcance de Formia

Formia es dueña de la **identidad** y de los **hábitos**. Su promesa —*actúa desde tu identidad, no desde tus hábitos*— no es una frase de marca: es una regla estructural que gobierna el modelo de datos, el flujo de creación y la vista de progreso.

**Los dos principios que rigen este capítulo (§C0.3):**

1.  **Formia nunca empaqueta su contenido como ritual secuencial.** No hay wizard, no hay “paso 2 de 5”, no hay pop-up que se abre solo a una hora concreta, no hay botón que cierre una secuencia. Los hábitos se alimentan directamente desde su propio espacio, con contexto de mañana o noche si aplica. La palabra “ritual” no aparece en ninguna pantalla de Formia.
2.  **Ningún hábito existe sin una identidad que lo sostenga.** Todo hábito referencia una identidad — la central o una de área. `identityRef` es obligatorio y no nulo.

**Qué contiene este capítulo:**

| Funcionalidad                                              | Origen v3.1                     | Estado en v4.0                                                                         |
|:-----------------------------------------------------------|:--------------------------------|:---------------------------------------------------------------------------------------|
| Modelo de identidad de tres niveles                        | §5.1.1                          | Íntegro. Pasa de ser un apartado del onboarding a ser el **eje estructural** de Formia |
| Espacio de identidad (central + áreas + identidad de área) | §5.5 R3                         | Deja de ser paso de ritual. Espacio consultable (§C3.3)                                |
| Hábitos — H1, H2, H3                                       | §5.7 completo                   | Íntegro, con H3 corregido para capturar `identityRef` (§C3.6)                          |
| Alimentación de hábitos por momento del día                | §5.5 R4                         | Directa, desde el espacio de hábitos. Sin secuencia (§C3.5)                            |
| Etiquetado de área — regla única compartida                | §5.7.4 \[Bloque 04\]            | Íntegro, con una precisión sobre el caso `areaId = null`                               |
| Historial de constancia                                    | §5.10 (parte) + métrica de §5.9 | Vista propia de progreso, organizable por identidad (§C3.7)                            |
| Compromisos (foco temporal)                                | §4.6                            | Reubicado desde arquitectura funcional                                                 |

**Qué NO contiene y por qué:** ninguna experiencia guiada, ningún dato emocional. Formia no pregunta cómo está la persona, no recoge gratitud, no tiene campo de reflexión y no muestra estado de ánimo. Cruzar hábitos con ánimo es competencia exclusiva de Strivo Intelligence (Capítulo 4).

## C3.1 El eje estructural: identidad → hábito

En v3.1 la identidad vivía dentro del onboarding (§5.1.1) y los hábitos vivían en su propio módulo (§5.7), unidos por un campo opcional (`areaId`). En v4.0 la relación se invierte: **la identidad es la estructura, y los hábitos cuelgan de ella.**

    IDENTIDAD CENTRAL  ("Alguien que crece")         ← siempre existe (RN-ID-01)
              │
      ┌───────┼────────┬─────────────┐
    Salud  Trabajo  Relaciones   (…hasta 3 áreas)    ← áreas seleccionadas
      │       │         │
    "cuida  "hace un  "está                          ← identidad de área (opcional)
     su      buen      presente"
     cuerpo" trabajo"
      │       │         │
    hábito  hábito    hábito                         ← identityRef = areaId
      │
      └── un hábito también puede colgar directamente
          de la identidad central  → identityRef = "central"

**La regla de oro reformulada para v4.0:** cada hábito referencia **exactamente una** identidad: `"central"` o el `areaId` de un área. No hay tercera opción, no hay `null`, no hay “General”.

**RN-FO-ID-01** `Habit.identityRef` es obligatorio, no nulo, y su valor es `"central"` o un `areaId` existente. **RN-FO-ID-02** Un hábito cuya área se despausa, se pausa o se archiva **conserva su `identityRef`** (coherente con RN-ID-04 y RN-HAB-AREA-04). El vínculo nunca se borra por dejar de mostrarse. **RN-FO-ID-03** Borrar un área **no puede** dejar hábitos huérfanos: o se reasignan a `"central"`, o se archivan con el área. Cuál de las dos — ver §C7.6. **RN-FO-ID-04** La vista de progreso puede agruparse por identidad; esa agrupación es una consulta sobre `identityRef`, no un campo nuevo.

## C3.3 Espacio de identidad (ex-R3)

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

**Qué cambia:** en v3.1 el recordatorio de identidad era **R3**, la tercera pantalla del Ritual de Mañana: aparecía una vez al día, de forma automática, dentro de una secuencia. En v4.0 ese mismo contenido **vive en el espacio propio de identidad de Formia**, consultable cuando la persona quiera. **No es parte de ninguna secuencia diaria obligatoria.**

**Especificación original conservada (§5.5, R3):**

> **R3 — Recordatorio de identidad**
>
>     ┌───────────────────────┐
>     │  Te estás convirtiendo│
>     │  en alguien que       │
>     │                       │
>     │      crece            │
>     │                       │
>     │  Hoy toca sobre todo: │
>     │   ● Salud             │
>     │   alguien que cuida   │
>     │   su cuerpo           │
>     │                       │
>     │  Y estás cultivando:  │
>     │   leer antes de dormir│
>     │   (día 8 de 21)       │
>     │                       │
>     │      ‹ Seguir ›       │
>     └───────────────────────┘
>
> - Muestra **la identidad central** (siempre) y, debajo, **el área con más hábitos programados para hoy** con su identidad de área (si la tiene) y su color. Así el usuario ve el paraguas estable (“alguien que crece”) y el foco concreto del día (“hoy, Salud”).
> - **Selección del área del día:** el área con más hábitos activos hoy. En empate, la que menos ha aparecido en los últimos 7 días (para rotar el foco de forma natural entre áreas sin forzar equilibrio). Si el usuario no tiene áreas, se muestra solo la identidad central.
> - Muestra también el Compromiso activo, si existe (§4.6).
> - El contador “día 8 de 21” **cuenta días transcurridos, no días cumplidos**: nunca se reinicia, nunca se pierde.
> - Enlace discreto: “Cambiar esto” → editor de identidad (central y áreas).

**Adaptaciones derivadas de la reubicación:**

- **El botón “‹ Seguir ›” desaparece.** No hay pantalla siguiente. La pantalla de identidad es un destino, no un tránsito.
- **“Hoy toca sobre todo: \[área\]” se conserva**, pero cambia de significado: ya no es el foco que el ritual impone al arrancar el día, sino una **lectura** del propio estado (“esto es lo que más peso tiene hoy en lo que te propusiste”). La regla de selección del área del día —más hábitos activos hoy; en empate, la menos vista en 7 días— se mantiene sin cambios.
- **La frase de identidad de área se sigue mostrando aquí.** §5.7.4 retiró esa frase de las *listas de hábitos*, no del producto: R3 era y sigue siendo uno de los lugares donde está bien contextualizada. La pantalla de identidad de Formia hereda esa condición.
- **El editor de identidad (“Cambiar esto”)** es ahora la acción principal de la sección, no un enlace discreto en una esquina: en un espacio propio, editar la identidad es un uso legítimo y frecuente, no una fuga del flujo.

**Lo que NO cambia:** el modelo de tres niveles de §5.1.1 (reubicado más abajo en este mismo capítulo) y todas sus reglas RN-ID-01 a RN-ID-06, con la salvedad de RN-ID-02 analizada en §C3.9.

## C3.5 Alimentación de hábitos (ex-R4)

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

**Qué cambia:** en v3.1 los hábitos del día se marcaban en **R4**, la cuarta pantalla del ritual, y además aparecían proyectados en el Bloque 6 del Diario. En v4.0 los hábitos **se alimentan directo desde el espacio propio de hábitos de Formia (H1/H2/H3)**, y en ningún otro sitio.

**Especificación original conservada (§5.5, R4):**

> **R4 — Hábitos del día**
>
> - Muestra los hábitos programados para hoy, con la posibilidad de marcarlos ya (algunos ya se hicieron antes de abrir la app).
> - Copy: *“Esto es lo que planeaste para hoy.”* Nunca “Esto es lo que debes hacer”.
> - Si no hay hábitos configurados: invitación a añadir uno, saltable.

**Cómo se traduce esto sin ritual:**

- **El “qué” se conserva íntegro:** la lista de hábitos programados para hoy, marcables con un toque, con el copy *“Esto es lo que planeaste para hoy.”* Es exactamente la pantalla **H1** (§5.7), agrupada por momento.
- **El “cuándo” desaparece:** ya no hay un instante del día en que el producto presente esa lista por iniciativa propia dentro de una secuencia. La persona entra a Formia cuando quiere.
- **`context` sustituye a la pertenencia al ritual.** El antiguo `momento = manana | noche | dia` se conserva como **etiqueta de momento del día**, no como pertenencia a una secuencia: en el modelo nuevo es `habits.context: "manana" | "noche" | null` (Capítulo 5). Un hábito con `context = "manana"` se agrupa bajo la cabecera “Mañana” en H1; **eso es todo lo que significa**.
- **RN-FO-HAB-01** Ninguna superficie de Formia puede presentar los hábitos del día como una secuencia con principio y fin, ni mostrar un botón que “complete” el conjunto, ni un mensaje de cierre del tipo *“Ritual completo”*.
- **RN-FO-HAB-02** La confirmación al completar todos los hábitos de un momento se conserva en su nivel más bajo (barra que se llena, §5.7 “Microinteracciones”), **sin** la frase *“Ritual completo. Buen comienzo.”*, que pertenecía al Bloque 6 eliminado y usa vocabulario de Lumia. Copy sustituto pendiente de redacción.

**Criterios de aceptación de la reubicación:**

1.  Marcar un hábito desde H1 escribe un `habitLog` idéntico al que escribía R4, con `origen = "formia_lista"`.
2.  En ninguna pantalla de Formia aparece la palabra “ritual”.
3.  Ningún hábito aparece en una pantalla de Lumia, en ningún estado, incluido el Diario de días pasados.
4.  Un hábito con `context = null` no aparece bajo ninguna cabecera de momento y sigue siendo marcable desde H1.

## C3.6 H3 corregido — captura obligatoria de la identidad

\[REUBICADO DE CAPÍTULO 5 — v3.1\] · **Modifica la especificación de H3 de §5.7.**

**Especificación H3 en v3.1:**

> **H3 — Crear / editar hábito:** nombre (con sugerencias del área), área (chips de color, un toque), momento, días de la semana, recordatorio opcional. Máximo 4 campos visibles; el resto plegado en “Más opciones”.

**El problema:** en esa especificación el área es un campo más, y nada impide guardar sin tocarlo. §5.7.4 lo confirma explícitamente al describir el comportamiento de un hábito **sin** `areaId` (“no muestra nada: ni etiqueta, ni punto, ni espacio reservado”). Es decir: **v3.1 permitía crear hábitos sin identidad.** El modelo nuevo lo prohíbe.

**Especificación corregida de H3 (v4.0):**

- El campo **“¿Qué identidad construye este hábito?”** es **obligatorio** y forma parte de los campos visibles, no de “Más opciones”.
- Sus opciones son, en este orden: **la identidad central** (siempre presente, siempre válida — RN-ID-01 garantiza que existe) y **cada área seleccionada** por la persona (máximo 3).
- La opción de identidad central se presenta con el texto de la propia identidad (“Alguien que crece”), no con la etiqueta técnica.
- **No existe la opción “General”, “Otra” ni “Sin área”.** El encabezado de agrupación “General” de H1 (§5.7.4) queda sin uso posible para hábitos nuevos y solo puede contener hábitos heredados de Fase 0 aún sin migrar (§C7.2).
- **RN-FO-H3-01** El botón de guardar está deshabilitado —no oculto— hasta que haya identidad seleccionada. Deshabilitado y con explicación visible, nunca un error tras pulsar.
- **RN-FO-H3-02** La ausencia de identidad **nunca** se comunica como fallo del usuario. Copy propuesto para el estado no resuelto: *“Elige a quién estás construyendo con esto.”* Prohibido: “campo obligatorio”, “debes seleccionar”, asteriscos rojos.
- **RN-FO-H3-03** Editar un hábito existente permite **cambiar** de identidad, nunca **quitarla**. Cambiar de identidad conserva todo el historial (extiende el criterio de aceptación 6 de §5.7).

### C3.6.1 Captura de la identidad — resuelto en v4.1

**Mecanismo vigente (§C7.6): sugerencia por el texto del hábito.** Se aplica el mismo mecanismo que §5.3 ya define para las victorias:

- **RN-FO-H3-04** Al escribir el nombre del hábito, el sistema busca señales claras de una identidad de área (“correr”, “gym”, “dormir” → Salud; “reunión”, “propuesta”, “cliente” → Trabajo) y **sugiere** esa identidad con un chip tenue. **Nunca la asigna sola sin confirmación** (regla heredada de §5.3, Bloque 5).
- **RN-FO-H3-05** Si el texto no da señal clara, **el campo queda sin resolver**: no hay preselección automática, ni siquiera de la identidad central. El botón de guardar permanece deshabilitado y explicado (RN-FO-H3-01) hasta que la persona elija.
- **RN-FO-H3-06** La sugerencia solo puede proponer identidades existentes: la central o un área **seleccionada**. Nunca propone crear un área nueva desde H3.
- **RN-FO-H3-07** Cambiar una identidad sugerida cuesta un toque y no genera ningún mensaje de confirmación ni de error.

**Caso derivado en el onboarding (P7–P8), pendiente de confirmar.** Si la persona omite la selección de áreas, la única identidad existente es la central, así que la elección se reduce a una sola opción y se resuelve con un toque. Se especifica así —una opción, un toque, sin preselección— por coherencia con RN-FO-H3-05, pero **es una derivación, no una decisión tomada**: conviene confirmarla antes de implementar el onboarding.

**Lo que queda sin resolver.** Que el campo sea obligatorio en el esquema no dice **cuándo** se captura. Si la persona no tiene claro a qué identidad pertenece su hábito en el momento de crearlo, ¿se le obliga a elegir ahí, o se le permite asignarla después? El modelo de datos exige `identityRef` no nulo, así que esto **necesita resolverse en el flujo, no solo en el esquema**. Ver **§C7.6**. Recomendación técnica registrada allí, sin decidir.

## C3.7 Historial de constancia

\[REUBICADO DE CAPÍTULO 5 — v3.1\]

El Historial de v3.1 (§5.10) era una sola cosa: un calendario de días con punto de ánimo, una línea de tiempo, una vista de día completo y una búsqueda. En v4.0 se parte en dos:

| Parte                                                                                                    | Producto      | Dónde                             |
|:---------------------------------------------------------------------------------------------------------|:--------------|:----------------------------------|
| Calendario mensual con punto de ánimo, línea de tiempo, búsqueda por palabra / emoción / rango de fechas | Lumia         | §5.10, reubicado en el Capítulo 2 |
| Constancia acumulada, cuadrícula de 90 días por hábito, total histórico, progreso por identidad          | **Formia**    | Esta sección                      |
| **Vista de día completo** (“todo lo registrado ese día: mañana, noche, journal, hábitos”)                | \*\*Ambiguo\* | \*§C7.7 — caso detectado          |

**Vista de progreso de Formia — especificación:**

- Hereda íntegro el material de §5.7: **total histórico** (“Lo has hecho 47 veces”), **días de los últimos 30** en formato positivo, **cuadrícula de los últimos 90 días** en tonos tenues, y la mini-visualización de 14 días de H1. Todas las reglas de tono siguen vigentes: **nunca rojo, nunca huecos acusatorios, nunca porcentaje de incumplimiento** (RN-HB-04, RN-HB-05).
- Hereda la **métrica de Constancia** de §5.9 (Capítulo 4): consulta derivada, acumulativa, **que nunca se reinicia**. Al ser derivada y no almacenada, es imposible que se rompa por un error de sincronización.
- **Novedad de v4.0 — agrupación por identidad.** La vista se puede organizar por identidad, no solo por momento o área: *“hábitos que construyen ‘Alguien que cuida su salud’”*. Es una consulta sobre `identityRef` (RN-FO-ID-04); no añade ningún campo.
- **RN-FO-PRO-01** La vista de progreso de Formia **no muestra ningún dato emocional**: ni ánimo, ni emociones, ni extractos de journal. Si se quiere ver la relación entre constancia y ánimo, eso es Strivo Intelligence (Capítulo 4).
- **RN-FO-PRO-02** El progreso de hábitos vive **únicamente** aquí. Ninguna superficie de Lumia lo replica (§C2.6).

## C3.9 Brecha detectada: v3.1 permitía hábitos sin identidad

**Esta sección documenta una incompatibilidad real entre el contenido heredado y el principio estructural de Formia. No se arrastra sin más y no se resuelve por cuenta propia.**

### Dónde exactamente lo permitía v3.1

| Referencia v3.1       | Qué dice                                                                                             | Efecto                                                        |
|:----------------------|:-----------------------------------------------------------------------------------------------------|:--------------------------------------------------------------|
| §7.2, entidad `Habit` | `areaId?: uuid  // null = "General"`                                                                 | El campo es **opcional** en el esquema                        |
| §7.2, entidad `Area`  | El “área especial implícita General **no es una fila**; es el destino de hábitos sin área asignada”  | `null` es un valor legítimo y esperado                        |
| **RN-ID-02**          | “Las áreas son opcionales; un usuario puede tener cero áreas y funcionar solo con identidad central” | Un usuario sin áreas tiene **todos** sus hábitos sin `areaId` |
| **RN-HB-06**          | “Todo hábito pertenece a un área (**o General**); ninguno queda huérfano”                            | “o General” **es** la puerta abierta                          |
| §5.7.4, regla y CA-2  | Especifica el comportamiento visual de un hábito **sin** `areaId`                                    | Confirma que el caso existe y está contemplado                |
| §5.7, pantalla **H3** | El área es un campo más, sin obligatoriedad declarada                                                | Se puede guardar sin tocarlo                                  |

### Por qué existía

No era un descuido. RN-ID-02 protegía un caso de uso real: **la persona que no quiere organizar su vida en áreas.** v3.1 decidió que esa persona debía poder usar hábitos igualmente, y “General” era su destino. La consecuencia no deseada es que “General” no es una identidad: es la ausencia de una.

### Cómo se cierra la brecha en v4.0

El modelo nuevo no necesita romper RN-ID-02, porque **RN-ID-01 garantiza que siempre existe exactamente una identidad central.** Un usuario con cero áreas no es un usuario sin identidad: es un usuario cuya única identidad es la central. Por tanto:

- `identityRef = "central"` es siempre un valor válido y disponible, incluso con cero áreas.
- **“General” deja de ser un destino de hábitos.** Sobrevive únicamente como encabezado de agrupación de H1 para hábitos heredados aún no migrados (§5.7.4: “agrupar no es etiquetar”).
- **RN-HB-06 queda sustituida** por RN-FO-ID-01: *todo hábito referencia una identidad; ninguno queda huérfano y ninguno va a “General”*.
- **RN-ID-02 se conserva** con una precisión: un usuario puede tener cero áreas; lo que no puede tener es un hábito sin `identityRef`.
- §5.7.4 se conserva **íntegra**: su regla de etiquetado (mostrar el nombre del área o nada) sigue siendo correcta y necesaria, porque un hábito con `identityRef = "central"` sigue sin tener etiqueta de área que mostrar. **Lo que cambia no es qué se muestra, sino qué se puede guardar.**

### Lo que esta sección NO resuelve

1.  **El flujo de captura** cuando la persona no tiene clara la identidad al crear el hábito → **§C7.6**.
2.  **La migración de los hábitos ya existentes** de los 5 testers de Fase 0, creados bajo el modelo antiguo y hoy sin ese vínculo → **§C7.2**.

Ambas son decisiones de producto y quedan abiertas.

## 5.1.1 El modelo de identidad (referencia canónica para toda la app)

\[REUBICADO DE CAPÍTULO 5 — v3.1\] — **es el eje estructural de Formia.**

Esta subsección es la fuente de verdad sobre identidad. Cualquier módulo que mencione identidad remite aquí.

**Los tres niveles:**

| Nivel                 | Cardinalidad       | Naturaleza                                        | Ejemplo                                 | Editable                           |
|:----------------------|:-------------------|:--------------------------------------------------|:----------------------------------------|:-----------------------------------|
| **Identidad central** | Exactamente 1      | Amplia, estable, emocional. El “por qué” profundo | “Alguien que crece”                     | Sí, con historial de versiones     |
| **Área de identidad** | 1 a N (recom. ≤ 4) | Concreta, cambiante. El “dónde” de la vida        | Salud, Trabajo, Relaciones              | Sí, se pueden añadir/quitar/pausar |
| **Identidad de área** | 0 o 1 por área     | Opcional. El “cómo” en cada área                  | “En Salud, alguien que cuida su cuerpo” | Sí                                 |

**Cómo se conecta todo (regla de oro):**

Cada **Hábito**, cada **Victoria** y cada **Logro** pertenece a **exactamente un área**. A través del área, hereda automáticamente su identidad de área (si existe) y siempre confirma la identidad central. **Nunca puede existir un logro huérfano de área**; si el usuario no asigna una, se usa “Otra”.

            IDENTIDAD CENTRAL  ("Alguien que crece")
                      │  (todo lo confirma, nada la contradice)
          ┌───────────┼───────────┐
        Salud       Trabajo    Relaciones     ← ÁREAS
          │            │            │
     "cuida su    "hace un     "está          ← IDENTIDAD DE ÁREA (opcional)
      cuerpo"     buen trabajo" presente"
          │            │            │
      hábitos     hábitos      hábitos
      victorias   victorias    victorias      ← siempre pertenecen a un área
      logros      logros       logros

**Por qué este modelo resuelve la desconexión de identidad:**

El problema clásico: el usuario declara “soy alguien que cuida su cuerpo” pero registra el 90 % de logros en trabajo. Con una identidad única de área, la app le devolvería una imagen de fracaso (“no estás cuidando tu cuerpo”). Con este modelo de tres niveles:

- El trabajo intenso **confirma** su identidad central (“alguien que crece”) — cero contradicción.
- Los Insights hablan **por área** (“esta semana creciste sobre todo en Trabajo”) sin juzgar el desequilibrio.
- El desequilibrio entre áreas se presenta como **observación neutra y contextualizada**, nunca como carencia: *“Llevas un tiempo enfocado en Trabajo. Es natural. Cuando quieras, Salud sigue aquí.”*
- La distribución de logros entre áreas es, en sí misma, un Insight valioso y honesto sobre en qué está viviendo la persona ahora.

**Reglas de negocio del modelo de identidad:**

- **RN-ID-01** Siempre existe exactamente una identidad central. Si el usuario la borra, se pide una nueva antes de continuar (es el único campo de identidad obligatorio).
- **RN-ID-02** Las áreas son opcionales; un usuario puede tener cero áreas y funcionar solo con identidad central. En ese caso, todos los logros van a “General”.
- **RN-ID-03** Las identidades de área son siempre opcionales.
- **RN-ID-04** Añadir, quitar o pausar un área **nunca borra** los hábitos, victorias o logros ya asociados: se conservan y se muestran como historia. Un área pausada deja de sugerir hábitos pero conserva todo.
- **RN-ID-05** Ningún Insight puede presentar el bajo registro en un área como fracaso, carencia o abandono (verificable en QA con la lista de términos prohibidos, §1.5.16).
- **RN-ID-06** La app nunca fuerza equilibrio entre áreas ni penaliza la concentración en una sola.

## 5.7 Módulo: Hábitos y su relación con los Rituales

\[REUBICADO DE CAPÍTULO 5 — v3.1\] · **Modificado en v4.0:** ver §C3.6 (H3 con identidad obligatoria) y §C3.9 (brecha de hábitos sin identidad). RN-HB-06 queda sustituida por RN-FO-ID-01.

### 5.7.0 Qué es un hábito en Strivo y por qué le sirve al usuario

Un **hábito** en Strivo es una acción recurrente, pequeña y concreta, que el usuario decide repetir porque es *lo que hace la persona que quiere ser*. No es una tarea ni un pendiente: una tarea se hace una vez y se acaba; un hábito es una identidad en movimiento. “Terminar el informe” es una tarea (vive en Victorias); “leer 10 páginas cada noche” es un hábito.

**Por qué le sirve al usuario (el beneficio concreto):**

1.  **Convierte intenciones vagas en acciones repetibles.** “Quiero cuidarme” no se puede hacer; “beber agua al despertar” sí. El hábito es el puente entre la identidad declarada (§5.1.1) y la conducta real.
2.  **Baja el umbral de éxito a lo mínimo.** El compromiso más pequeño posible —marcar una casilla— ya cuenta. Esto ataca directamente el punto de fricción de la persona Daniel (“empiezo mil veces y abandono”).
3.  **Le devuelve evidencia acumulada de constancia.** Cada hábito guarda cuántas veces lo ha hecho en total y en los últimos 90 días. Esa evidencia, siempre creciente, es lo que sostiene la motivación sin necesidad de disciplina.
4.  **Ancla el hábito a un momento real del día** (mañana o noche), aprovechando rutinas que el usuario ya tiene, en lugar de pedirle que invente huecos nuevos.
5.  **Conecta cada acción con su sentido.** Al marcar un hábito, el usuario no está “cumpliendo una obligación”: está confirmando que es alguien que cuida su cuerpo, su trabajo o su gente. Los Insights se lo devuelven después en ese lenguaje.

**Qué NO es un hábito en Strivo (para evitar confusión de producto):** - No es una tarea con fecha (eso es una Victoria). - No es una meta con final (eso es un Compromiso, §4.6). - No genera castigo si no se hace. **Nunca.**

### Objetivo del módulo

Permitir que el usuario **cree, alimente, programe, valide y revise** hábitos ligados a sus áreas de identidad, con la mínima configuración posible, y que esos hábitos **fluyan de forma automática hacia los Rituales de Mañana y Noche** sin que el usuario tenga que gestionarlos dos veces.

### 5.7.1 El ciclo de vida de un hábito (de principio a fin)

       CREAR ──► PROGRAMAR ──► PROYECTAR ──► MARCAR ──► REGISTRAR ──► REVISAR
      (H3)      (días+momento) (a rituales)  (casilla)  (HabitLog)   (Insights)
        │                                                    │            │
        └──────────── PAUSAR / REANUDAR / ARCHIVAR ◄─────────┴────────────┘

**1. Crear (alimentación).** El usuario da de alta un hábito en tres momentos posibles: - Durante el **onboarding** (P7/P8): se le proponen hábitos derivados de las áreas que eligió, ya listos para editar. - En **cualquier momento** desde Tú → Hábitos → “+”. - Desde el **detalle de un área**, donde el hábito ya nace con esa área asignada.

Datos que se capturan al crear (pantalla H3, máximo 4 campos visibles): - **Nombre** (con sugerencias específicas del área). - **Área** (chips de color; una sola; “Otra” o “General” si no aplica). - **Momento**: mañana · noche · a lo largo del día. - **Días de la semana** activos (por defecto, todos). - **Recordatorio propio** (opcional, hora concreta).

**2. Programar.** El hábito queda con una regla de recurrencia: `momento` + `diasSemana`. Esta regla es lo único que determina cuándo aparece.

**3. Proyectar (la conexión con los Rituales — ver §5.7.2).** Cada día, Strivo calcula qué hábitos “tocan hoy” y los proyecta automáticamente como checklist dentro del Ritual y la Vista correspondientes. **El usuario nunca añade un hábito “al ritual” manualmente: el ritual se arma solo a partir de los hábitos.**

**4. Marcar (validación).** El usuario marca el hábito como hecho. Puede hacerlo desde cuatro superficies (todas equivalentes y sincronizadas): el Ritual de Mañana, el Ritual de Noche, la Vista de Mañana/Noche del Diario, o la lista de Hábitos. Marcar es un acto de un solo toque, con trazo animado y háptica ligera.

**5. Registrar.** Cada marca genera un `HabitLog` (§7.2) con fecha, hora y origen. **Solo se registran los hábitos hechos; la no realización no genera ningún registro** — no existe una fila que diga “falló” (decisión de modelo de datos con consecuencia filosófica: la ausencia es simplemente ausencia).

**6. Revisar.** El historial de `HabitLog` alimenta: la barra de progreso del ritual, la cuadrícula de 90 días del detalle del hábito, el total acumulado, la Constancia y los Insights por área.

**Gestión del ciclo (siempre disponible):** - **Pausar**: retira el hábito de los checklists sin borrarlo ni generar huecos. Para vacaciones, enfermedad o cambio de etapa. Copy: *“Pausado. Aquí estará cuando lo quieras de vuelta.”* - **Reanudar**: vuelve a proyectarse desde el día siguiente, con todo su historial intacto. - **Archivar**: lo retira de la vista principal conservando su historia, para hábitos que el usuario ya no quiere pero cuyo pasado quiere preservar. - **Cambiar de área**: conserva todo el historial y reasigna sus Insights.

### 5.7.2 Cómo se relacionan los Hábitos con los Rituales de Mañana y Noche — **\[ACTUALIZADO EN v4.0\]**

> **Qué queda vivo de esta subsección.** El principio *“el Hábito es la fuente; el Ritual es la ventana”* pierde una de sus dos ventanas: el Ritual de Mañana ya no existe (§C0.5) y el checklist del Diario se eliminó (§C2.6). Lo que sobrevive:
>
> - **RN-HR-01 sobrevive reformulada:** la lista de un momento = todos los hábitos con `estado = activo`, `context` igual al momento y el día actual en `diasSemana`. Ya no es “el checklist de un ritual”: es la agrupación de H1 (§C3.5).
> - **RN-HR-02 sobrevive con menos superficies:** marcar un hábito lo marca en todas partes, pero “todas partes” son ahora solo las superficies de Formia. Ninguna superficie de Lumia lo refleja.
> - **RN-HR-03, RN-HR-06 y RN-HR-07 sobreviven íntegras.** `momento = a lo largo del día` pasa a ser `context = null`.
> - **RN-HR-04 sobrevive con copy nuevo:** la invitación suave se mantiene, pero no puede decir *“Tu ritual de la mañana está libre”* — vocabulario de Lumia (§C7.7.6).
> - **RN-HR-05 sobrevive sin su copy:** la barra que se llena se conserva; la frase *“Ritual completo”* no (RN-FO-HAB-02).
> - **El diagrama de proyección de abajo se conserva como historia.** Su ventana “RITUAL DE MAÑANA” ya no existe; su ventana “RITUAL DE NOCHE” solo subsiste en la pantalla N2, cuya permanencia es un conflicto abierto (§C7.7.1).

Esta es la relación que el equipo debe entender con total claridad, porque es donde el módulo de Hábitos deja de ser una lista y se vuelve parte del corazón del producto.

> **Principio: el Hábito es la fuente; el Ritual es la ventana.** Los hábitos viven en su propio módulo (Tú → Hábitos). Los Rituales **no almacenan hábitos**: los *muestran*, filtrados por el momento del día. Un mismo hábito se ve en el Ritual de Mañana si su `momento = mañana` y hoy es un día activo; se ve en el de Noche si su `momento = noche`. El checklist del ritual es, literalmente, una consulta en vivo sobre los hábitos del usuario.

**Diagrama de proyección:**

            MÓDULO DE HÁBITOS (fuente única de verdad)
       ┌──────────────────────────────────────────────┐
       │  Beber agua      · mañana · L-D · Salud       │
       │  Estirar         · mañana · L-V · Salud       │
       │  Leer 10 páginas · noche  · L-D · Personal    │
       │  Dejar el móvil  · noche  · L-D · Salud       │
       │  Meditar         · mañana · L,X,V · Espiritual│
       └───────────────┬───────────────┬───────────────┘
                       │ filtro:        │ filtro:
                       │ momento=mañana │ momento=noche
                       │ y día activo   │ y día activo
                       ▼                ▼
            ┌───────────────────┐  ┌───────────────────┐
            │ RITUAL DE MAÑANA  │  │ RITUAL DE NOCHE   │
            │ ☐ Beber agua      │  │ ☐ Leer 10 páginas │
            │ ☐ Estirar         │  │ ☐ Dejar el móvil  │
            │ ☐ Meditar (L,X,V) │  │                   │
            │ ▓▓▓░░ 0 de 3      │  │ ▓▓░░ 0 de 2       │
            └─────────┬─────────┘  └─────────┬─────────┘
                      │ marcar                │ marcar
                      ▼                       ▼
                  HabitLog  ◄─────────────────┘
                      │
                      ▼
          Barra de progreso · Constancia · Insights por área

**Reglas de la relación (para implementación sin ambigüedad):**

- **RN-HR-01** El checklist de un ritual = todos los hábitos con `estado = activo`, `momento` igual al del ritual, y el día actual en `diasSemana`. Nada más y nada menos.
- **RN-HR-02** Marcar un hábito en el Ritual de Mañana lo marca **en todas partes** a la vez (Vista de Mañana, lista de Hábitos, y su `HabitLog` del día). La sincronización es inmediata y bidireccional.
- **RN-HR-03** Un hábito de `momento = a lo largo del día` **no aparece en ningún ritual**; se marca desde la lista de Hábitos o desde una tarjeta ligera en Hoy. *Razón:* no todo hábito pertenece a un extremo del día, y forzarlo dentro de un ritual rompería el ritmo del ritual.
- **RN-HR-04** Si el usuario no tiene hábitos para ese momento, el bloque de ritual correspondiente **no muestra un vacío acusatorio**: muestra una invitación suave (“Tu ritual de la mañana está libre. ¿Quieres añadir algo?”) que es completamente ignorable.
- **RN-HR-05** Completar todos los hábitos de un ritual dispara la confirmación de nivel “reconocimiento” (§3.11): la barra se llena con un recorrido de luz y aparece “Ritual completo”. Nunca hay confeti ni sonido por defecto.
- **RN-HR-06** Marcar hábitos **no es obligatorio para completar el ritual**. El usuario puede cerrar su día sin marcar ninguno; el ritual se completa igual. Los hábitos suman, nunca bloquean.
- **RN-HR-07** Un hábito marcado antes de abrir la app (p. ej. el usuario ya bebió agua) puede marcarse igualmente en el ritual; la hora de `HabitLog` refleja el momento de la marca, no el de la acción.

**Por qué esta arquitectura (una fuente, dos ventanas):** - Evita que el usuario mantenga listas duplicadas (una “de hábitos” y otra “del ritual”). - Garantiza que editar un hábito una vez se refleje en todos lados. - Hace que el ritual se sienta *vivo y personal* (son tus hábitos, no una plantilla) sin coste de gestión. - Permite que los Insights crucen hábitos con ánimo y áreas sin importar desde dónde se marcaron.

### 5.7.3 Ejemplo completo (persona Mariana)

- **Onboarding:** Mariana elige las áreas Salud y Trabajo. La app le propone tres hábitos: “Beber agua” (mañana, Salud), “Estirar 5 min” (mañana, Salud) y “Dejar el móvil fuera del cuarto” (noche, Salud). Los acepta y añade uno propio: “Leer 10 páginas” (noche, Personal).
- **Día 1, 6:45 — Ritual de Mañana:** el checklist muestra automáticamente “Beber agua” y “Estirar”. Marca las dos. Barra: “2 de 2”. Confirmación de luz.
- **Día 1, 23:00 — Ritual de Noche:** el checklist muestra “Dejar el móvil” y “Leer 10 páginas”. Marca solo la primera. Barra: “1 de 2”. **No pasa nada con la que no marcó.**
- **Día 8 — Tú → Hábitos → “Beber agua”:** ve “Lo has hecho 7 veces” y una cuadrícula de 7 puntos llenos. Sin rojos, sin huecos acusatorios.
- **Semana 4 — Insight de área (Salud):** *“Eres alguien que crece. En Salud lo demostraste 18 de los últimos 28 días. Los días que estiras por la mañana, tu ánimo de cierre suele ser más alto.”* Con evidencia citable.
- **Mariana se va de viaje 5 días:** pausa “Estirar” y “Leer”. No se generan huecos ni culpa. Al volver, los reanuda con un toque; su historial sigue intacto.

### Pantallas (detalle)

**H1 — Lista de hábitos:** agrupados por momento (Mañana / Noche / A lo largo del día) por defecto, con opción de **agrupar por área**. Cada fila: ícono del hábito, **punto de color del área**, nombre, días activos, y mini-visualización de los últimos 14 días como puntos (llenos = hecho, vacíos = no hecho, **nunca rojos**). Encabezado con la Constancia global. Botón “+” para crear.

**H2 — Detalle de hábito:** nombre; **área y su identidad de área** (“Esto es algo que hace alguien que cuida su cuerpo”); momento; días; recordatorio propio (opcional); notas; **total histórico** (“Lo has hecho 47 veces”); **días de los últimos 30** (formato positivo); y **cuadrícula de los últimos 90 días** en tonos tenues. Acciones: editar, cambiar de área, pausar, archivar. *Nunca* muestra porcentaje de incumplimiento ni días fallidos.

**H3 — Crear / editar hábito:** nombre (con sugerencias del área), área (chips de color, un toque), momento, días de la semana, recordatorio opcional. Máximo 4 campos visibles; el resto plegado en “Más opciones”.

### Microinteracciones

Marcar hábito: trazo animado de 260 ms + háptica ligera + la fila se atenúa al 70 % conservando el texto legible (**nunca tachado**). Desmarcar: inversa, sin penalización ni mensaje. Reordenar: mantener pulsado y arrastrar, con elevación de 4 dp. Completar el checklist de un ritual: recorrido de luz por la barra (700 ms).

### Estados

- **Vacío:** *“Tu ritual está vacío por ahora. Un solo hábito es un buen comienzo.”* + 6 sugerencias tocables por área.
- **Carga:** local, imperceptible.
- **Offline:** completo; las marcas se guardan localmente y se sincronizan después (RN-02).
- **Error:** un fallo de sincronización nunca pierde una marca; la marca vive en local hasta poder subir.

### Accesibilidad

El estado del hábito se anuncia como “completado” / “sin completar”, nunca como “fallado”. La cuadrícula de 90 días transmite información por forma y posición además de color (legible con deuteranopía y protanopía). Toda marca es alcanzable por control por voz (“marcar beber agua”) y por teclado externo.

### Persistencia y sincronización

Cada `HabitLog` se escribe en local al instante y se sincroniza de forma incremental. El `totalCompletados` del hábito es un contador desnormalizado que **solo crece** y se recalcula desde los logs al restaurar una copia. Marcar/desmarcar el mismo día es idempotente: no duplica logs.

### Reglas de negocio

- **RN-HB-01** Máximo 5 hábitos en plan gratuito; ilimitados en Strivo completo (advertencia amable a partir de 5 en ambos planes).
- **RN-HB-02** Un hábito archivado o pausado conserva todo su historial.
- **RN-HB-03** Marcar un hábito desde cualquier superficie (ritual, diario, lista, Hoy) actualiza todas las demás de forma inmediata y bidireccional.
- **RN-HB-04** Ninguna visualización de hábitos puede usar rojo, calaveras, caras tristes o metáforas de deterioro.
- **RN-HB-05** La no realización de un hábito nunca genera notificación, contador, color de alerta ni registro de fallo.
- **RN-HB-06** Todo hábito pertenece a un área (o “General”); ninguno queda huérfano.

### Criterios de aceptación

1.  Crear un hábito con `momento = mañana` y día activo hoy hace que aparezca automáticamente en el Ritual y la Vista de Mañana de hoy, sin acción adicional.
2.  Marcar en el Ritual de Mañana se refleja al instante en la Vista de Mañana, en la lista de Hábitos y en el `HabitLog` del día.
3.  Un hábito de `momento = noche` no aparece en ningún contexto de mañana, y viceversa.
4.  Un hábito con `momento = a lo largo del día` no aparece en ningún ritual.
5.  Pausar un hábito lo retira de los checklists desde el día siguiente sin borrar su historial; reanudarlo lo restaura íntegro.
6.  Cambiar el área de un hábito conserva todo su historial y actualiza sus Insights de área.
7.  Cerrar un ritual sin marcar ningún hábito completa el ritual igualmente.
8.  La cuadrícula de 90 días y los puntos de 14 días son legibles con daltonismo y no usan rojo.
9.  Sin conexión, marcar y crear hábitos funciona y sincroniza al recuperar red, sin duplicar logs.
10. En ningún estado del módulo aparece la palabra “fallaste”, “incumpliste” o equivalentes, ni un porcentaje de incumplimiento.

### 5.7.4 Etiquetado de área en hábitos: regla única compartida \[ACTUALIZADO EN BLOQUE 04\]

> **Esta subsección es la fuente de verdad del etiquetado de hábitos en toda la aplicación.** Cualquier pantalla que muestre un hábito remite aquí. Sustituye, en las listas de hábitos, la práctica anterior de acompañar cada hábito con su frase de identidad de área.

#### Qué cambia

**Antes:** cada hábito se mostraba junto a la frase de identidad de su área — *“Dormir a tiempo”* / *“se mueve porque le hace bien”*.

**Ahora:** cada hábito muestra **el nombre del área** — *“Dormir a tiempo”* / **“Salud”** — **o nada en absoluto**.

#### Por qué

La frase de identidad de área es una declaración amplia sobre quién quiere ser la persona en un dominio de su vida (“alguien que cuida su cuerpo”, “se mueve porque le hace bien”). Al pegarla debajo de cada hábito concreto, el producto afirmaba una equivalencia que a menudo era falsa: *“Dormir a tiempo”* no es *“se mueve porque le hace bien”*. El resultado observado en el prototipo fue el peor posible para este producto: **frases que suenan a plantilla**, exactamente el tono que Strivo existe para evitar (§3.6.2, §1.5.16). Una etiqueta de área —un sustantivo, sin adjetivos— clasifica sin afirmar nada falso.

**Lo que NO cambia:** la frase de identidad de área sigue siendo un elemento central del producto y se sigue mostrando donde está bien contextualizada: en **R3** (Recordatorio de identidad, §5.5), en **H2** (Detalle de hábito, con la matización de más abajo), en **Perfil → Mi identidad** (§5.12) y en los **Insights de evidencia de identidad** (§5.9). El modelo de identidad de tres niveles de §5.1.1 **no se toca**: sigue siendo la referencia canónica, y las áreas siguen heredando su identidad de área.

#### La regla

Se muestra la etiqueta de área de un hábito **si y solo si se cumplen las dos condiciones**:

1.  el hábito tiene `areaId` asignado (no es `null`), **y**
2.  esa área está entre las **áreas seleccionadas actualmente** por el usuario (las 3 activas, §5.1).

Si falla cualquiera de las dos, **no se muestra nada**. No se muestra “General”, ni “Otra”, ni un guion, ni un espacio reservado, ni un punto de color huérfano.

    // src/lib/habitAreaLabel.js  — helper único, sin duplicados
    areaLabelForHabit(habit, areasSeleccionadas)
      · si !habit.areaId                        -> null
      · si !areasSeleccionadas.includes(areaId) -> null
      · si el área existe                       -> { nombre, color }
      · en cualquier otro caso                  -> null
    // El componente que recibe null NO renderiza el nodo: no reserva alto.

- **RN-HAB-AREA-01** Existe **un solo** helper. Ninguna pantalla puede reimplementar esta lógica ni añadirle excepciones locales. Duplicar la regla fue la causa original del defecto (la etiqueta era correcta en unas pantallas y no en otras).
- **RN-HAB-AREA-02** La ausencia de etiqueta **nunca** se comunica como carencia. No hay “sin área”, no hay invitación a asignar una desde la lista, no hay icono de advertencia.
- **RN-HAB-AREA-03** El nombre del área se muestra **tal cual está en** `Area.nombre`, con su punto de color (§6.3.2). Sin prefijos (“Área:”), sin mayúsculas forzadas, sin adjetivos.
- **RN-HAB-AREA-04** Si el usuario cambia sus áreas seleccionadas, las etiquetas **desaparecen o aparecen inmediatamente**, sin migrar ni tocar los hábitos. `Habit.areaId` **no se borra nunca** por dejar de mostrar la etiqueta: el vínculo persiste y vuelve a mostrarse si el área se reactiva (coherente con RN-ID-04).

#### Pantallas afectadas

| Pantalla                                | Efecto                                                                                                                                                                                                                                                                                                                                                                                                                      |
|:----------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **H1 — Lista de hábitos**               | Cada fila muestra nombre del área o nada. El **punto de color** del área solo aparece cuando hay etiqueta. Agrupar por área sigue funcionando: un hábito sin etiqueta visible se agrupa bajo la cabecera que corresponda o bajo “General”, que **sí** es un encabezado válido de agrupación (agrupar no es etiquetar).                                                                                                      |
| **H2 — Detalle de hábito**              | Muestra el nombre del área. **Contradicción resuelta:** el texto original de H2 especifica que muestra “área y su identidad de área” con el ejemplo *“Esto es algo que hace alguien que cuida su cuerpo”*. En Fase 0, **H2 muestra el nombre del área y no muestra esa frase**. Se conserva como decisión abierta si la frase debe volver a H2 —y solo a H2— en una tarjeta propia y separada del encabezado (Capítulo 10). |
| **H3 — Crear / editar hábito**          | El selector de área sigue siendo chips de color con un toque. La vista previa del hábito muestra el nombre del área o nada, según la regla.                                                                                                                                                                                                                                                                                 |
| **Ritual de Mañana (R4)**               | Nombre del área o nada (§5.5.1).                                                                                                                                                                                                                                                                                                                                                                                            |
| **Ritual de Noche**                     | Nombre del área o nada (§5.6.1).                                                                                                                                                                                                                                                                                                                                                                                            |
| **Diario — vista de mañana (Bloque 6)** | Nombre del área o nada (§5.3.1).                                                                                                                                                                                                                                                                                                                                                                                            |
| **Diario — vista de noche (Bloque 8)**  | Nombre del área o nada (§5.4.2).                                                                                                                                                                                                                                                                                                                                                                                            |
| **Pantalla Hoy**                        | Nombre del área o nada (§5.2.2).                                                                                                                                                                                                                                                                                                                                                                                            |
| **Onboarding P7–P8**                    | Nombre del área o nada (§5.1.4).                                                                                                                                                                                                                                                                                                                                                                                            |

#### Criterios de aceptación

1.  Un hábito con `areaId` de un área seleccionada muestra el nombre del área y su punto de color, en las ocho pantallas de la tabla.
2.  Un hábito sin `areaId` no muestra nada: ni etiqueta, ni punto, ni espacio reservado.
3.  Un hábito cuya área existe pero **no** está entre las seleccionadas no muestra nada.
4.  Deseleccionar un área hace desaparecer sus etiquetas al instante; volver a seleccionarla las devuelve, con los `areaId` intactos.
5.  En ninguna pantalla aparece la frase de identidad de área junto a un hábito de una lista.
6.  Una búsqueda en el árbol de componentes encuentra **una sola** implementación de la regla.

## 4.6 Tratamiento de “Retos” (resolución de la contradicción)

\[REUBICADO DE CAPÍTULO 4 — v3.1\]

El briefing menciona “retos” en Rituales, Recordatorios e Insights; existe además una decisión previa de eliminar la infraestructura de Retos. **Resolución adoptada (supuesto S-04):**

- Se elimina la infraestructura de Retos como sistema de gamificación con inscripción, progreso competitivo y estados de fallo.
- Se conserva el valor psicológico subyacente —**un foco temporal con principio y fin**— en dos formas:
  1.  **Compromiso** (MVP): un foco personal declarado por el usuario, de duración libre (7/21/30 días), opcionalmente vinculado a un área, sin barras de progreso agresivas y sin estado de fallo. Aparece como recordatorio junto a la identidad central y el área del día en el Ritual de Mañana, y como fuente de Insight. Ejemplo: *“Estás cultivando: leer antes de dormir.”*
  2.  **Programas guiados** (V1/V2, premium): contenido secuencial de la Biblioteca (21 días de autoestima, 30 de claridad mental, 14 de disciplina, 21 de gratitud), donde cada día aporta una lectura breve y una pregunta añadida al Diario. Se pueden pausar y retomar sin penalización; **nunca “se pierden”**.

**Efecto:** el usuario percibe dirección y novedad sin que el producto adquiera una capa de gamificación contraria a su filosofía.

# Capítulo 4 — Strivo Intelligence

> **⚠ ESPECIFICACIÓN FUTURA — NO IMPLEMENTADA.** Nada de este capítulo forma parte de Fase 0 ni está comprometido para Fase 1. Se documenta ahora porque la partición del modelo de datos (Capítulo 5) solo tiene sentido si se sabe qué se va a construir encima de ella. **Su alcance en Fase 1 es una decisión abierta: §C7.4.**

## C4.1 Qué es Strivo Intelligence

Strivo Intelligence es la **capa de insights cruzados**: el único componente del sistema autorizado a leer a la vez lo que la persona **hace** (`formia/`) y **cómo se siente** (`lumia/`), para devolverle relaciones que ninguno de los dos productos puede ver por sí solo.

Es la razón de ser de la marca madre. Sin ella, Lumia y Formia son dos apps que comparten cuenta; con ella, son un sistema.

**Ejemplo del tipo de observación que solo Strivo puede producir:**

> *“Los días que estiras por la mañana, tu ánimo de cierre suele ser más alto.”*

Formia sabe que estiró. Lumia sabe cómo cerró el día. **Ninguno de los dos sabe que hay relación.**

## C4.2 Reglas de la capa

**RN-SI-01** Strivo Intelligence lee de `lumia/` y de `formia/`; **nunca escribe** en ninguno de los dos. Sus salidas son objetos propios, no modificaciones del estado de los productos. **RN-SI-02** Ningún insight puede presentarse dentro de un flujo de escritura de Lumia ni dentro del espacio de hábitos de Formia sin una decisión explícita de producto: la capa tiene su propia superficie. **RN-SI-03** Se hereda íntegro el contrato de §5.9: **todo insight debe poder citar su evidencia** (`evidencia[]` obligatoria, trazable a registros reales). Un insight sin evidencia citable no se genera. **RN-SI-04** Se heredan íntegras las prohibiciones de §5.9 y §1.5.16: ningún insight presenta el bajo registro como fracaso, carencia o abandono; ninguno fuerza equilibrio entre áreas; ninguno usa vocabulario de rendimiento. **RN-SI-05** El uso de IA sigue siendo **opt-in estricto** (§7.9, §5.8). Un insight generado por reglas no requiere consentimiento; uno generado por IA sí.

## C4.3 Clasificación del catálogo de insights heredado

§5.9 (reubicado íntegro más abajo) define un catálogo completo de insights que se escribió cuando Strivo era un solo producto. Al partirse en dos, **no todos los insights son cruzados**. Esta tabla clasifica el catálogo:

| Tipo de insight                                                                                | Necesita             | Dueño                                 |
|:-----------------------------------------------------------------------------------------------|:---------------------|:--------------------------------------|
| Patrones de ánimo, emociones más frecuentes, evolución del estado emocional                    | Solo `lumia/`        | Podría vivir en Lumia sin Strivo      |
| Constancia, evidencia de repetición, progreso por área                                         | Solo `formia/`       | Podría vivir en Formia sin Strivo     |
| **Evidencia de identidad** (“en Salud lo demostraste 18 de 28 días” con el ánimo de esos días) | `formia/` + `lumia/` | **Strivo** — insight cruzado canónico |
| **Correlación conducta ↔ ánimo**                                                               | `formia/` + `lumia/` | **Strivo**                            |
| **Resumen anual** (§5.14.3)                                                                    | Todo                 | **Strivo**                            |

**Consecuencia práctica:** si en Fase 1 se decidiera no construir Strivo Intelligence (§C7.4), Lumia y Formia podrían tener cada uno insights propios dentro de su `namespace` sin violar RN-DB4-01. Lo que **no** existiría es la parte que da sentido a la marca madre.

## C4.4 Lo que falta especificar

Antes de construir esta capa hacen falta decisiones que **no se toman en este documento**: dónde vive su superficie (¿una tercera pestaña? ¿tarjetas dentro de cada producto?), su `namespace` de almacenamiento (§C5.6), su cadencia de generación, el mínimo de datos necesario para que una correlación sea honesta y no ruido, y cómo se comunica la incertidumbre (§5.9 ya prohíbe presentar como causalidad lo que es correlación — esa regla se hereda y se refuerza).

## 5.9 Módulo: Insights y reflexión personal

\[REUBICADO DE CAPÍTULO 5 — v3.1\] · **\[ESPECIFICACIÓN FUTURA\]** — es el sustrato de Strivo Intelligence. Ver la clasificación por producto en §C4.3.

### Objetivo

Transformar los datos del usuario en **autoconocimiento con significado**. El criterio de éxito no es “el usuario entiende la gráfica”, sino *“el usuario siente que la app lo conoce”*.

### Principio de diseño rector

> **Frases antes que gráficas.** Toda visualización debe ir acompañada —y precedida— de una frase en lenguaje humano que diga lo que la gráfica significa. Si una gráfica no se puede resumir en una frase útil, la gráfica sobra.

### Estructura del módulo

    ┌───────────────────────────────┐
    │  Tú                           │
    │                               │
    │  ┌─────────────────────────┐  │
    │  │ Esta semana             │  │
    │  │                         │  │
    │  │ "Escribiste 5 días.     │  │
    │  │  En 4 de ellos          │  │
    │  │  mencionaste a tu       │  │
    │  │  hermana."              │  │
    │  │             ‹ Ver más › │  │
    │  └─────────────────────────┘  │
    │                               │
    │  ── Tu constancia ──          │
    │  ◍ 63 días contigo            │
    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░             │
    │  (solo sube, nunca baja)      │
    │                               │
    │  ── Lo que más agradeces ──   │
    │  familia · salud · mi trabajo │
    │  · dormir bien · el café      │
    │                               │
    │  ── Un día como hoy ──        │
    │  "Hace un año escribiste:     │
    │   'creo que voy a poder'"     │
    │                               │
    │  ── Patrones ──          🔒   │
    │  ── Tu mes ──            🔒   │
    │  ── Libro de Vida ──     🔒   │
    └───────────────────────────────┘

### Tipos de insight (catálogo completo)

| Tipo                       | Fuente                           | Frecuencia | Ejemplo de copy                                                                                          | Plan                                |
|:---------------------------|:---------------------------------|:-----------|----------------------------------------------------------------------------------------------------------|:------------------------------------|
| **Constancia**             | Días con registro                | Continua   | “63 días en los que te diste un momento.”                                                                | Gratis                              |
| **Resumen semanal**        | Todo                             | Semanal    | “Cinco días esta semana. Tu palabra más repetida: calma.”                                                | Gratis (básico) / Narrado (premium) |
| **Palabras frecuentes**    | Agradecimientos                  | Mensual    | “Lo que más agradeces últimamente: tu familia.”                                                          | Gratis                              |
| **Recuerdo**               | Entradas antiguas                | Variable   | “Hace un año escribiste esto.”                                                                           | Premium                             |
| **Patrón conductual**      | Hábitos + ánimo                  | Mensual    | “Los días que sales a caminar sueles irte a dormir más tranquila.”                                       | Premium                             |
| **Patrón temporal**        | Ánimo + día de semana            | Mensual    | “Los martes suelen pesarte más. Los sábados son tus días más ligeros.”                                   | Premium                             |
| **Tema emergente**         | Journal (IA)                     | Mensual    | “En las últimas tres semanas has escrito varias veces sobre tu padre.”                                   | Premium                             |
| **Evidencia de identidad** | Área + logros/hábitos            | Mensual    | “Eres alguien que crece. En Salud lo demostraste 11 de los últimos 14 días.”                             | Premium                             |
| **Distribución por áreas** | Logros/hábitos por área          | Mensual    | “Este mes creciste sobre todo en Trabajo (18 logros) y algo en Salud (4). Ambos cuentan.”                | Gratis (básico) / Narrado (premium) |
| **Foco cambiante**         | Áreas en el tiempo               | Trimestral | “Tu foco se movió: antes vivías más en Trabajo, últimamente en Relaciones.”                              | Premium                             |
| **Evolución de identidad** | Identidad central + su historial | Trimestral | “Hace tres meses querías ser alguien disciplinado. Ahora, alguien presente. Cambiaste, y eso está bien.” | Premium                             |
| **Logro acumulado**        | Logros                           | Hitos      | “Has reconocido 200 cosas que lograste.”                                                                 | Gratis                              |
| **Contraste temporal**     | Reflexiones                      | Semestral  | “Hace seis meses escribías más sobre cansancio. Ahora escribes más sobre planes.”                        | Premium                             |
| **Resumen anual**          | Todo                             | Anual      | Pantalla especial de fin de año                                                                          | Premium                             |

### Reglas de generación (críticas)

1.  **Umbral mínimo de datos.** Ningún insight de patrón se genera con menos de **10 registros** y **3 semanas** de historia. Un insight prematuro basado en tres datos destruye la credibilidad de todo el módulo.
2.  **Nunca causalidad, siempre coocurrencia.** Copy obligatorio en forma de tendencia: *“suele”, “muchas veces”, “en la mayoría de los días en los que…”*. Prohibido: “porque”, “debido a”, “esto causa”.
3.  **Siempre con evidencia citable.** El usuario puede tocar cualquier insight y ver los días concretos que lo sustentan. **Esta trazabilidad es la diferencia entre parecer un horóscopo y parecer un espejo.**
4.  **Siempre accionable o siempre bello.** Un insight debe permitir hacer algo o emocionar. Si no hace ninguna de las dos, no se muestra.
5.  **Nunca negativo.** Prohibido: “has bajado”, “estás peor”, “llevas menos días”. Los descensos se expresan como observación neutra con encuadre de curiosidad: *“Este mes escribiste menos. ¿Pasó algo distinto?”* — y solo si el usuario tiene activada la opción “señalarme también lo que baja”.
6.  **Máximo un insight nuevo destacado por semana.** La abundancia de insights los devalúa.
7.  **Derecho a rechazar.** Cada insight tiene “no me sirve” → mejora el filtrado y reduce ese tipo.
8.  **Todo logro confirma la identidad central.** Ningún insight puede sugerir que registrar mucho en un área y poco en otra traiciona quién dijo ser el usuario. La identidad central es el paraguas: un logro de Trabajo confirma “alguien que crece” exactamente igual que uno de Salud. Ver §5.1.1.
9.  **El desequilibrio entre áreas se contextualiza, nunca se reprocha.** Un área con poca actividad se presenta con encuadre de continuidad y disponibilidad, nunca de carencia: *“Llevas un tiempo enfocado en Trabajo. Es natural. Salud sigue aquí cuando quieras.”* Prohibido: “has descuidado”, “te falta”, “abandonaste”, “deberías equilibrar”.
10. **La distribución entre áreas es en sí misma un insight honesto y valioso**, no un problema a corregir. Mostrar en qué está viviendo la persona ahora es autoconocimiento; empujar hacia un reparto “equilibrado” sería imponer un juicio ajeno.

### Cómo Insights resuelve la desconexión de identidad

Este es el mecanismo que responde directamente a la pregunta que originó el modelo de tres niveles: *¿qué pasa si mi identidad dice una cosa y mis logros van por otra?*

- **Los patrones y correlaciones se calculan por área** además de globalmente. En lugar de un único “patrón conductual”, el usuario puede tener uno de Salud, uno de Trabajo, etc. Cada uno cita su propia evidencia.
- **La evidencia de identidad siempre suma a favor.** El insight “Eres alguien que crece; en Salud lo demostraste 11 de 14 días” solo cuenta lo que ocurrió, nunca lo que faltó.
- **Cuando un área queda muy por debajo de otra, la app no lo señala como fallo.** Como mucho, tras un periodo largo, ofrece una invitación amable y opcional: *“Hace un tiempo que no registras nada de {área}. ¿Sigue importándote, o la soltamos por ahora?”* — con dos salidas dignas: “sigue importándome” (no vuelve a preguntar en semanas) o “pausar esta área” (sin borrar nada). **Nunca es una alerta; es una conversación de una sola línea que el usuario puede cerrar sin coste.**
- **El usuario puede ajustar sus áreas en cualquier momento** desde Perfil. Si descubre que en realidad vive el 90 % en el trabajo, puede quitar las áreas que ya no reflejan su vida, y la app se adapta sin drama ni pérdida de historial.

### La métrica de Constancia (sustituto de la racha)

- **Definición:** número total de días con al menos un registro, desde el inicio. **Monótona creciente. Nunca se reinicia. Nunca se pierde.**
- **Visualización:** un anillo que se llena en tramos de 10 días, con marcas en hitos (10, 30, 50, 100, 200, 365).
- **Copy:** “63 días contigo”, nunca “63 días seguidos”.
- **Métrica secundaria opcional** (Ajustes, desactivada por defecto): “días de los últimos 30”. Para usuarios tipo Daniel que quieren dato objetivo. Se muestra en formato positivo (“18 de los últimos 30”).
- **Justificación estratégica:** esta decisión sacrifica el pico de retención a corto plazo que dan las rachas a cambio de eliminar el principal generador de abandono definitivo del sector: la ruptura de racha, que produce el efecto “qué más da” y el abandono total. Ver \[H2\] en §2.8.

### Uso de IA en Insights

- **Modelo:** los datos se procesan en servidor. Ver §7.9 para límites, consentimiento y coste.
- **Entrada al modelo:** datos agregados y fragmentos mínimos necesarios, nunca el historial completo.
- **Salida:** frases cortas (máximo 3), en la voz de §3.6, sin diagnósticos ni consejos clínicos.
- **Verificación:** toda salida pasa por un filtro de reglas antes de mostrarse (prohibición de términos clínicos, de causalidad y de juicio). Si el filtro rechaza la salida, no se muestra nada; **nunca se muestra un insight de baja calidad por rellenar**.
- **Control del usuario:** interruptor único “Reflexiones con IA” en Ajustes. Desactivado → todos los insights siguen existiendo en su versión basada en reglas (frecuencias, palabras, correlaciones simples). **Ningún dato del usuario se usa para entrenar modelos, jamás. Esto es una promesa contractual y debe aparecer en la política de privacidad.**

### Estados

- **Vacío (\< 3 registros):** *“Necesito conocerte un poco más. En unos días empezaré a notar cosas.”* + muestra de ejemplo real de un insight futuro, marcado claramente como ejemplo.
- **Carga:** los insights se calculan en segundo plano; la pantalla muestra los últimos calculados con la fecha.
- **Offline:** se muestran los insights ya calculados; los nuevos esperan a la sincronización.
- **Error:** si el servicio de IA falla, se muestran los insights por reglas sin mencionar el fallo salvo que el usuario abra el detalle.

### Criterios de aceptación

1.  Con menos de 10 registros, no se genera ningún insight de patrón. 1b. Los insights de patrón y de evidencia de identidad se generan por área cuando el área tiene suficientes datos, y citan evidencia específica de esa área. 1c. Ningún insight presenta el bajo registro en un área como fracaso, carencia o abandono (verificable con la lista de términos prohibidos de las reglas 8–10). 1d. Ajustar o pausar un área no borra datos y actualiza los insights correspondientes sin error.
2.  Todo insight de patrón permite ver los días que lo sustentan.
3.  Ningún insight contiene lenguaje causal o clínico (verificable con un conjunto de pruebas de cadenas prohibidas).
4.  Con la IA desactivada, el módulo sigue mostrando al menos cinco tipos de insight.
5.  La Constancia nunca disminuye en ninguna circunstancia, incluida la restauración de una copia de seguridad.

## 5.14.3 Resumen anual

\[REUBICADO DE CAPÍTULO 5 — v3.1\] · **\[ESPECIFICACIÓN FUTURA\]**

Pantalla especial disponible desde el 20 de diciembre: los momentos más significativos del año, las palabras más repetidas, la evolución de la identidad, el número total de cosas agradecidas. Exportable como imagen (**solo con contenido que el usuario elija explícitamente**) y como PDF completo.

# Capítulo 5 — Modelo de datos actualizado

> **Este capítulo sustituye a §7.2 y §7.4.1 de v3.1 como fuente de verdad del modelo de datos.** Las definiciones de entidad originales se conservan íntegras en el **Capítulo 13** (§7.2) como referencia de campos y notación; lo que cambia aquí es **dónde vive cada cosa**.

## C5.1 Principio de partición

El modelo se parte en **tres `namespaces`** que reflejan exactamente la arquitectura de marca del Capítulo 0:

| `namespace` | Contiene                                            | Quién lo lee                                        |
|:------------|:----------------------------------------------------|:----------------------------------------------------|
| `shared/`   | Identidad de cuenta, perfil, onboarding             | Lumia, Formia y Strivo                              |
| `lumia/`    | Todo lo que la persona escribe, siente y reflexiona | **Solo Lumia** (y Strivo Intelligence, en lectura)  |
| `formia/`   | Identidad construida, hábitos y su registro         | **Solo Formia** (y Strivo Intelligence, en lectura) |

**RN-DB4-01** Ninguna pantalla de Lumia lee de `formia/`. Ninguna pantalla de Formia lee de `lumia/`. La única excepción autorizada es **Strivo Intelligence** (Capítulo 4), en **lectura y nunca en escritura** sobre el `namespace` ajeno. **RN-DB4-02** Todo lo que las dos aplicaciones necesitan por igual vive en `shared/`. Si un dato se necesita en los dos lados y no está en `shared/`, es un error de diseño, no un caso a resolver con una copia. **RN-DB4-03** Se mantienen íntegras las reglas del almacén local de §7.4.1: RN-DB-01 (un registro por usuario y fecha, calculado con `diaTerminaA`), RN-DB-02 (se persisten identificadores estables, nunca etiquetas visibles), RN-DB-03 (nada se borra por obsolescencia), RN-DB-04 (el PIN no sale del dispositivo), RN-DB-05 (el Journal no se cifra en local en Fase 0) y RN-DB-06 (política de escritura con *debounce* de 800 ms). **RN-DB4-04** Implementación vigente: **IndexedDB** en la PWA (React + Vite) con sincronización asíncrona hacia **Firestore**. **Local-first sin excepciones** (RN-02): toda escritura se confirma en local **antes** de cualquier intento de red.

## C5.2 Árbol canónico

    users/{uid}/
    ├── shared/
    │     ├── profile:    { name, gender, diaTerminaA, wakeTime, sleepTime, createdAt }
    │     ├── auth:       { uid, email, phone }
    │     └── onboarding: { completedSteps, currentStep }
    │
    ├── lumia/
    │     ├── journal/
    │     │     └── {entryId}: { date, text, emotions[], otherText,
    │     │                      createdAt, updatedAt }
    │     ├── dailyIntention/
    │     │     └── {date}:    { intentionText }        // ex-R5
    │     ├── nightRitual/
    │     │     └── {date}:    { inheritedWins, newWins, gratitude, learning,
    │     │                      sleepState, sleepStateOther }
    │     └── pinConfig:       { salt, hash, iterations, algorithm, enabled }
    │
    └── formia/
          ├── identity/
          │     ├── central: string
          │     └── areas:   { [areaId]: { selected: boolean, identityText: string } }
          ├── habits/
          │     └── {habitId}: { name, identityRef, context, emoji, createdAt }
          │        // identityRef es OBLIGATORIO — "central" | areaId — nunca null
          └── habitLogs/
                └── {logId}:   { habitId, date, completedAt }

## C5.3 Extensiones necesarias del árbol

El árbol de §C5.2 es el modelo canónico acordado, pero **no cubre todavía la totalidad de la funcionalidad especificada** en los capítulos 1 a 4. Las extensiones siguientes no son decisiones de producto: son campos que ya existen en v3.1 y que necesitan un `namespace` asignado para no perderse. **Se marcan como extensiones explícitas, no se dan por supuestas.**

    users/{uid}/
    ├── shared/
    │     ├── preferences: { sonidoRespiracion, reducirMovimiento,
    │     │                  tamanoTexto, temaHoyUltimo }          // ← AppPreferences [B01,B05]
    │     ├── consents:    { iaActivada, consentimientoIA{...} }   // ← ConsentRecord
    │     ├── subscription:{ estado, finPrueba }                   // ← §7.2 User
    │     └── locale:      { zonaHoraria, idioma, voz }            // ← §7.2 User/UserProfile
    │
    ├── lumia/
    │     ├── morningEntry/
    │     │     └── {date}: { gratitude[], desiredEmotions[] (máx.3), smallAction,
    │     │                   granVision, victories[], completedAt }
    │     ├── dayState/
    │     │     └── {date}: { state(no_iniciado|en_curso|cerrado), closedAt,
    │     │                   diaDificil, fraseDelDiaId }
    │     ├── victories/
    │     │     └── {victoryId}: { date, text, identityRef?, state, originId,
    │     │                        timesPostponed, order }
    │     └── futureLetters/
    │           └── {letterId}: { writtenAt, deliverAt, text, contextSnapshot }
    │
    └── formia/
          ├── commitments/
          │     └── {commitmentId}: { text, durationDays, startDate, state,
          │                           identityRef? }
          └── identityHistory/
                └── { centralHistory[], areaHistory{[areaId]:[...]} }

**Justificación campo a campo de las extensiones:**

| Extensión                 | Por qué es imprescindible                                                                                                                                                                                        |
|:--------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `lumia/morningEntry/`     | Sin ella se pierden los bloques 2 a 5 de la Vista de Mañana (§5.3): agradecimientos, emociones deseadas, acción pequeña, gran visión y victorias. El árbol canónico solo recoge `dailyIntention` y `nightRitual` |
| `granVision`              | Campo distinto de `intentionText` por decisión razonada en §C2.4.1. Equivale a `DailyEntry.manana.visualizacionGranDia`                                                                                          |
| `lumia/dayState/`         | Sostiene la máquina de estados del registro diario (§4.8) y el modo día difícil (§5.14.1). Sin ella no hay forma de saber si un día está cerrado                                                                 |
| `lumia/victories/`        | Las victorias tienen ciclo de vida propio (heredadas, pospuestas, soltadas) y cruzan mañana y noche; no caben dentro de una entrada de un solo día                                                               |
| `victories.identityRef?`  | **Opcional**, a diferencia del de los hábitos. Una victoria es un hecho del día que ocurrió, no un compromiso de construcción. El Principio 2 (§C0.3) habla de hábitos, no de victorias. Ver nota abajo          |
| `shared/preferences/`     | `AppPreferences` \[Bloques 01 y 05\] gobierna sonido de respiración, reducir movimiento y tamaño de texto: aplica a los dos productos                                                                            |
| `formia/commitments/`     | El Compromiso (§4.6) es un foco temporal de construcción; se muestra junto a la identidad (§C3.3)                                                                                                                |
| `formia/identityHistory/` | §5.1.1 exige historial de versiones de la identidad central y de las identidades de área                                                                                                                         |

> **Nota sobre `victories`.** Las victorias viven en `lumia/` porque se escriben y se leen en superficies de Lumia (Vista de Mañana y Vista de Noche) y porque su función es emocional: reconocer lo que pasó. Su vínculo opcional con una identidad es material de **Strivo Intelligence**, no de Formia. **Confirmado en v4.1** (§C7.7.5): las victorias se quedan en `lumia/` con `identityRef` opcional. La asimetría con los hábitos es deliberada — un hábito es un compromiso de construcción; una victoria, un hecho que ya ocurrió.

## C5.4 Cambios de campo respecto de v3.1

| v3.1                                                                 | v4.0                                                      | Naturaleza del cambio                                                                                                         |
|:---------------------------------------------------------------------|:----------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------|
| `Habit.areaId?: uuid` (`null` = “General”)                           | `habits.identityRef: "central" \| areaId` **obligatorio** | **Ruptura.** Deja de ser opcional. Desaparece el valor `null` y el destino “General”                                          |
| `Habit.momento: enum( manana, noche, dia)`                           | `habits.context: "manana"\|"noche"\|null`                 | **Semántico.** Deja de significar pertenencia al ritual; ahora es solo etiqueta de momento del día. `dia` → `null`            |
| `Habit.icono: string`                                                | `habits.emoji`                                            | Renombrado. El selector de emoji por hábito viene de Fase 0 (P7/P8)                                                           |
| `DailyEntry.manana.*`                                                | `lumia/morningEntry/` `+ lumia/dailyIntention`            | Partido por producto                                                                                                          |
| `DailyEntry.noche.*`                                                 | `lumia/nightRitual/`                                      | Renombrado y reubicado. Conserva `estadoSueno` → `sleepState` y `estadoSuenoOtro` → `sleepStateOther` \[Bloque 02\]           |
| `JournalEntry.*`                                                     | `lumia/journal/`                                          | Reubicado. `emociones` → `emotions[]`, `emocionOtra` → `otherText` \[Bloque 06\]                                              |
| `JournalPinConfig`                                                   | `lumia/pinConfig`                                         | Reubicado. Sigue **sin sincronizarse** (RN-DB-04)                                                                             |
| `Area` (entidad con `tipo, nombre, color, icono, orden, estado`)     | `formia/identity/areas` `{ selected, identityText }`      | Simplificado a mapa por `areaId`. **Atención:** el mapa canónico pierde `color`, `icono`, `orden` y `estado`. Ver aviso abajo |
| `UserProfile.identidad-` `Central`                                   | `formia/identity/` `central`                              | Reubicado a Formia: la identidad es su eje                                                                                    |
| `HabitLog.completado: boolean`                                       | —                                                         | Eliminado por innecesario: solo existen logs de completado (§7.2)                                                             |
| `HabitLog.origen: enum( ritual_manana, ritual_noche, diario, lista)` | `habitLogs` sin `origen`                                  | Los orígenes `ritual_manana` y `diario` ya no existen. Ver aviso abajo                                                        |

> **Aviso 1 — atributos de área.** El mapa `formia/identity/areas` del modelo canónico solo guarda `selected` e `identityText`. Los atributos `color`, `icono`, `orden` y `estado(activa|pausada|archivada)` de la entidad `Area` de §7.2 **son necesarios** para §5.7.4 (punto de color), para la paleta por área (§6.3.2) y para RN-ID-04 (pausar sin borrar). Recomendación técnica: conservarlos dentro del mismo mapa (`areas[areaId] = { selected, identityText, color, icon, order, state }`), dado que las 7 áreas son un catálogo cerrado y sus `areaId` son estables. **Confirmado en v4.1:** el mapa pasa a ser `areas[areaId] = { selected, identityText, color, icon, order, state }`.

> **Aviso 2 — trazabilidad del origen de un log.** `HabitLog.origen` permitía saber desde dónde se marcó un hábito. Con la desaparición del ritual de mañana y del checklist del Diario, los únicos orígenes posibles son superficies de Formia. Si se quiere conservar la trazabilidad (útil para analítica, §7.11), basta con `origen: "formia_lista" | "formia_detalle"`. El árbol canónico no lo incluye; se señala, no se añade por cuenta propia.

## C5.5 Reglas de integridad de `identityRef`

**RN-DB4-05** `habits.identityRef` es **no nulo** en escritura. Una escritura sin `identityRef` se rechaza en la capa de datos, no solo en la interfaz. Es la condición técnica que hace real el Principio 2 (§C0.3). **RN-DB4-06** Los valores válidos son la cadena literal `"central"` o un `areaId` presente en `formia/identity/areas`. Cualquier otro valor es un error de datos. **RN-DB4-07** Un `identityRef` que apunta a un área **deseleccionada** sigue siendo válido: `selected: false` afecta a lo que se muestra (§5.7.4), no a la integridad del vínculo (RN-FO-ID-02). **RN-DB4-08** Al restaurar una copia de seguridad, un hábito con `identityRef` ausente o inválido **no se descarta ni se corrige en silencio**: se marca para revisión del usuario con el copy de §C3.6 (RN-FO-H3-02). Nunca se le asigna una identidad automáticamente sin decirlo. **RN-DB4-09** `formia/identity/central` **siempre existe** (RN-ID-01). Es lo que garantiza que `identityRef = "central"` sea siempre un destino válido, incluso para un usuario con cero áreas (§C3.9).

## C5.6 Referencias al modelo actualizadas en el resto del documento

Toda referencia al modelo de datos en capítulos heredados debe leerse con esta tabla de equivalencia. **Las referencias originales no se han reescrito dentro del texto heredado**, para no alterar especificaciones que siguen siendo correctas en todo lo demás.

| Referencia que aparece en el texto heredado             | Léase como                                                                                                                             |
|:--------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------|
| `DailyEntry` (§4.8, §4.5, §5.3, §5.4, §5.6, §7.2, §7.3) | `lumia/morningEntry/{date}` + `lumia/dailyIntention/{date}` + `lumia/nightRitual/{date}` + `lumia/dayState/{date}`                     |
| `DailyEntry.manana.intencion`                           | `lumia/dailyIntention/{date}.` `intentionText`                                                                                         |
| `DailyEntry.manana.` `visualizacionGranDia`             | `lumia/morningEntry/{date}.granVision`                                                                                                 |
| `DailyEntry.noche.estadoSueno`                          | `lumia/nightRitual/{date}.sleepState`                                                                                                  |
| `Habit.areaId`                                          | `formia/habits/{id}.identityRef` (obligatorio; ver §C5.4)                                                                              |
| `Habit.momento`                                         | `formia/habits/{id}.context`                                                                                                           |
| `Area`, `Area.identidadArea`                            | `formia/identity/areas[areaId]`                                                                                                        |
| `UserProfile.identidadCentral`                          | `formia/identity/central`                                                                                                              |
| `UserProfile.genero`                                    | `shared/profile.gender`                                                                                                                |
| `JournalEntry`                                          | `lumia/journal/{entryId}`                                                                                                              |
| `JournalPinConfig`                                      | `lumia/pinConfig`                                                                                                                      |
| `AppPreferences`                                        | `shared/preferences`                                                                                                                   |
| `Victory`                                               | `lumia/victories/{id}`                                                                                                                 |
| `Commitment`                                            | `formia/commitments/{id}`                                                                                                              |
| `Insight`                                               | **Sin `namespace` asignado.** Strivo Intelligence no está implementada; su almacenamiento se define cuando se especifique (Capítulo 4) |

**Entidades de v3.1 sin destino asignado todavía:** `NotificationSchedule` (recordatorios, §5.13 — probablemente `shared/`, pero notifica sobre hábitos y sobre rituales, así que hereda la ambigüedad de §C7.7), `ContentItem` y `AudioItem` (§5.11, contenido de catálogo, no datos de usuario), `Insight` (arriba). **No se asignan aquí por cuenta propia.**

# Capítulo 6 — Decisiones de Fase 0

\[REUBICADO DE CAPÍTULO 10 — v3.1\] — **conservado íntegro.** Las decisiones abiertas de Fase 0 (§10.2) **siguen abiertas** y no se mezclan con las de la división Lumia/Formia (Capítulo 7). Dentro de este capítulo, las referencias a “§10.x” se mantienen: son identificadores estables (§C0.7).

**Propósito.** Este capítulo es el índice único del estado decisional de Strivo tras la implementación de los bloques 01 a 08. Existe para responder, sin recorrer 150 páginas, a dos preguntas: *¿esto ya está decidido?* y *¿esto está esperando que yo diga algo?*

**Cómo leerlo.** Una decisión **CERRADA** está implementada, verificada en el prototipo y **fuera de discusión**: reabrirla exige atacar su justificación, no su enunciado (§0.2, punto 2). Una decisión **ABIERTA** está implementada con un **comportamiento por defecto** que funciona y es defendible, pero espera confirmación del propietario del producto; el comportamiento por defecto se documenta en cada caso para que nadie tenga que adivinarlo.

Este capítulo **no sustituye** al §9.10 (decisiones abiertas de nivel estratégico, previas a V1) ni al Anexo C (índice de decisiones justificadas). Los complementa: §9.10 mira hacia V1; este capítulo mira a lo que existe hoy en el repositorio.

## 10.1 Decisiones CERRADAS

### Copy y género \[BLOQUE 01\]

| ID      | Decisión                                                                                                                                                                            | Referencia      |
|:--------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------|
| D-B01-1 | Todo copy con marca de género se declara como `{ m, f, n }` y se resuelve con un helper único. Ningún componente lee `.m` o `.f` directamente.                                      | §3.6.5          |
| D-B01-2 | El valor **neutro es el comportamiento por defecto**. Sin género declarado, la app funciona completa en neutro.                                                                     | §3.6.5          |
| D-B01-3 | La forma neutra es una **redacción alternativa sin marca de género**, no el masculino reutilizado.                                                                                  | §3.6.5          |
| D-B01-4 | **Prohibida la terminación “-e”** (*elle*, *tranquile*) en toda la aplicación.                                                                                                      | §3.6.5          |
| D-B01-5 | Se persisten **identificadores estables, nunca etiquetas visibles**. El género se resuelve en render, luego el cambio es retroactivo sin migración.                                 | §3.6.5, §7.2    |
| D-B01-6 | El género es **editable siempre** desde Perfil y no se usa para segmentar, sugerir, analizar ni se envía a la capa de IA.                                                           | §5.1.3, §5.12.1 |
| D-B01-7 | Tokens de contraste **por rol de superficie** (`--color-text-on-light` / `--color-text-on-dark`) con propagación por `data-surface`. Ningún componente fija color de texto literal. | §6.3.7          |

### Estado de sueño \[BLOQUE 02\]

| ID      | Decisión                                                                                                                                                           | Referencia     |
|:--------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------|
| D-B02-1 | Título literal **“¿Cómo te vas a dormir?”** y subtítulo literal **“Elige una o dos. No hay una forma correcta de cerrar el día”**. No se acortan ni se reescriben. | §5.4.1         |
| D-B02-2 | **Nueve opciones** con orden fijo: En paz · Agradecido · Orgulloso · Tranquilo · Contento · Pensativo · Cansado · Inquieto · Algo más.                             | §5.4.1         |
| D-B02-3 | **Máximo 2 selecciones** (antes: 1 estado + 2 matices). Mínimo 0: se puede cerrar el día sin elegir.                                                               | §5.4.1         |
| D-B02-4 | **“Algo más”** abre un campo **en línea de UNA sola palabra**, guardada literalmente y sin flexión de género.                                                      | §5.4.1         |
| D-B02-5 | El catálogo **incluye estados difíciles** (Cansado, Inquieto, Pensativo). Cerrar el día en falso no sirve a nadie.                                                 | §5.4.1         |
| D-B02-6 | La **regla de sensibilidad** original sigue vigente, disparada ahora por `cansado` e `inquieto`. `pensativo` no la dispara.                                        | §5.4.1, §5.6.1 |
| D-B02-7 | `animo` y `matices` quedan **obsoletos pero no se borran**: se leen, no se escriben. `animoDerivado` es una función de lectura, nunca un campo.                    | §5.4.1, §7.2   |

### Pantalla Hoy \[BLOQUE 03\]

| ID      | Decisión                                                                                                                                   | Referencia     |
|:--------|:-------------------------------------------------------------------------------------------------------------------------------------------|:---------------|
| D-B03-1 | **El tema de la pantalla Hoy lo decide el botón “Mañana” ↔ “Noche”, no la hora del sistema.** Reversión explícita de la decisión anterior. | §5.2.1         |
| D-B03-2 | Dos temas: mañana (amanecer claro, texto oscuro) y noche (azul oscuro, texto claro).                                                       | §5.2.1, §6.3.8 |
| D-B03-3 | **P1 y la pantalla de transición conservan el degradado horario**, sin cambios. La reversión está acotada a Hoy.                           | §5.2.1         |
| D-B03-4 | Los cinco degradados horarios **siguen siendo tokens vigentes** del sistema de diseño; dejan de aplicarse a Hoy, no se eliminan.           | §6.3.3, §6.3.8 |
| D-B03-5 | **Cross-fade de 320 ms** (`dur-theme`) entre temas; inmediato con “reducir movimiento”.                                                    | §6.10.1        |
| D-B03-6 | La **tarjeta de ritual destaca por luminancia** sobre el fondo en ambos temas.                                                             | §5.2.1, §6.3.8 |
| D-B03-7 | **Ambas secciones son accesibles a cualquier hora**, sin bloqueo ni advertencia.                                                           | §5.2.1         |

### Hábitos \[BLOQUE 04\]

| ID      | Decisión                                                                                                                                                            | Referencia     |
|:--------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------|
| D-B04-1 | Los hábitos de una lista muestran **el nombre del área o nada**. **Se retira la frase de identidad de área** de todas las listas de hábitos.                        | §5.7.4         |
| D-B04-2 | Regla: se etiqueta **si y solo si** el hábito tiene `areaId` **y** esa área está entre las seleccionadas.                                                           | §5.7.4         |
| D-B04-3 | Cuando no procede etiquetar, **no se muestra nada**: ni “General”, ni guion, ni espacio reservado.                                                                  | §5.7.4         |
| D-B04-4 | **Un único helper compartido**. Prohibido reimplementar la regla en ninguna pantalla.                                                                               | §5.7.4         |
| D-B04-5 | `Habit.areaId` **no se borra nunca** por dejar de mostrarse la etiqueta.                                                                                            | §5.7.4, §7.2   |
| D-B04-6 | La frase de identidad de área **sigue vigente** donde está bien contextualizada: R3, Perfil e Insights de identidad. El modelo de tres niveles (§5.1.1) no se toca. | §5.5.1, §5.7.4 |

### Respiración y audio \[BLOQUE 05\]

| ID      | Decisión                                                                                                                                   | Referencia       |
|:--------|:-------------------------------------------------------------------------------------------------------------------------------------------|:-----------------|
| D-B05-1 | El círculo del ejercicio de P1 es **naranja/dorado visible** (`--color-breath`), con contraste ≥ 3:1 sobre el degradado.                   | §5.1.2, §6.3.9   |
| D-B05-2 | **Ritmo 5-5-3**: 5 s inhalar + 5 s exhalar + 3 s de pausa **al final** del ciclo. **No es 5-3-5.**                                         | §5.1.2           |
| D-B05-3 | Sonido **generado con la Web Audio API**, sin archivos de audio: ascendente al inhalar, descendente al exhalar, silencio en la pausa.      | §6.12.1          |
| D-B05-4 | **Nunca suena sin gesto previo del usuario.**                                                                                              | §6.12.1          |
| D-B05-5 | **Control de silencio visible** y **preferencia persistida**, compartida con el ajuste de Perfil.                                          | §5.12.1, §6.12.1 |
| D-B05-6 | **Limpieza completa del audio al salir**: sin nodos activos, sin contextos abiertos, sin temporizadores vivos.                             | §6.12.1          |
| D-B05-7 | Con `prefers-reduced-motion`: **solo opacidad, sin escala, y las duraciones se mantienen**. La duración es el ejercicio, no una animación. | §5.1.2, §6.10.1  |
| D-B05-8 | Accesible por teclado y con `aria-live` para el cambio de fase.                                                                            | §5.1.2           |

### Journal — emociones \[BLOQUE 06\]

| ID      | Decisión                                                                                                                                                                              | Referencia      |
|:--------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------|
| D-B06-1 | Selector de **15 emociones con emoji**, chips tipo píldora, **máximo 3**.                                                                                                             | §5.8.1          |
| D-B06-2 | El catálogo **incluye emociones difíciles** (Triste, Ansioso, Frustrado, Preocupado, Melancólico, Solo, Cansado).                                                                     | §5.8.1          |
| D-B06-3 | Chip **“+ Otra” con borde punteado**, campo de **una sola palabra**.                                                                                                                  | §5.8.1          |
| D-B06-4 | **El catálogo del Journal es distinto del de la vista de mañana del Diario** (que sigue siendo de 16 emociones positivas con ícono propio, sin emoji). Dos catálogos, dos propósitos. | §5.3.2, §5.8.1  |
| D-B06-5 | Tarjetas de sección: **“¿Cómo me siento?”** (cálida, arena/beige) y **“Mi diario de hoy”** (fría, azul claro).                                                                        | §5.8.1, §6.3.10 |
| D-B06-6 | **Autoguardado sin cambios**: seleccionar un chip es una edición y se persiste igual que el texto.                                                                                    | §5.8.1          |
| D-B06-7 | Las emociones resuelven género con `{ m, f, n }` y se persisten por id.                                                                                                               | §5.8.1, §7.2    |
| D-B06-8 | El emoji en los chips **no contradice** la regla “sin emojis en la voz de la app”: el emoji es vocabulario del usuario, no voz del producto.                                          | §5.8.1          |

### Journal — PIN \[BLOQUE 07\]

| ID      | Decisión                                                                                                                                                            | Referencia     |
|:--------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------|
| D-B07-1 | Interruptor **“Proteger mi journal”** en Perfil, **desactivado por defecto**.                                                                                       | §5.12.1        |
| D-B07-2 | **PIN numérico de 4 a 6 dígitos**, solo dígitos, sin biometría en Fase 0.                                                                                           | §5.8.2         |
| D-B07-3 | Almacenamiento: **PBKDF2 + SHA-256, salt aleatorio de 16 bytes, ≥ 150.000 iteraciones**, con las iteraciones persistidas junto al hash. **El PIN nunca se guarda.** | §5.8.2, §7.7.1 |
| D-B07-4 | **Bloqueo de acceso, NO cifrado de contenido.** El cifrado es trabajo de Fase 1.                                                                                    | §5.8.2, §7.7.1 |
| D-B07-5 | La pantalla de desbloqueo **no renderiza nada** del Journal antes del desbloqueo: ni lista difuminada, ni conteo, ni previsualización.                              | §5.8.2         |
| D-B07-6 | **Recuperación por reautenticación de Firebase** (correo o SMS) → crear PIN nuevo, **sin perder entradas**.                                                         | §5.8.2         |
| D-B07-7 | **Regla de copy dura:** prohibido decir “cifrado”, “encriptado” o “seguro”. Se dice **“acceso en este dispositivo”**. Verificado por el linter de copy.             | §5.8.2, §7.7.1 |
| D-B07-8 | Un usuario **sin correo ni teléfono vinculados no puede crear PIN**; se le ofrece vincular cuenta desde el propio panel.                                            | §5.8.2         |
| D-B07-9 | `journalPin` **no se sincroniza** a Firestore: es configuración de este dispositivo.                                                                                | §7.4.1         |

### Transversales

| ID      | Decisión                                                                                                                                                         | Referencia   |
|:--------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------|
| D-B00-1 | **Ningún dato histórico se reescribe ni se borra** al cambiar un catálogo o un esquema. Se leen los campos obsoletos; solo se escribe el modelo nuevo.           | §7.2, §7.4.1 |
| D-B00-2 | **Local-first sin excepciones**: toda escritura se confirma en IndexedDB antes de cualquier intento de red.                                                      | §7.4.1       |
| D-B00-3 | Toda contradicción entre el blueprint v3 y la implementación se **resuelve de forma explícita y nominal** en la sección afectada, conservando el texto original. | §0.6         |

## 10.2 Decisiones ABIERTAS

Cada una está **implementada con un comportamiento por defecto que funciona**. Ninguna bloquea el cierre de Fase 0. Se listan de mayor a menor impacto en el usuario.

| ID   | Pregunta abierta                                                                                                                                                                                                                                     | Comportamiento por defecto vigente                                                                                                                                                                       | Referencia      |
|:-----|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------|
| A-01 | **Hábitos propios sin área.** Cuando el usuario crea un hábito propio desde el formulario de creación, ¿se guarda **sin área** o se le **pide elegir una** antes de guardar?                                                                         | **Se guarda sin área** (`areaId = null`) y, en consecuencia, **no muestra etiqueta** en ninguna lista (§5.7.4). No se le pide nada ni se le advierte. Prioriza cero fricción sobre completitud del dato. | §5.7.4, §7.2    |
| A-02 | **Número de ciclos de respiración en P1.** ¿Cuántos ciclos de 13 s se ofrecen antes de avanzar?                                                                                                                                                      | **Un ciclo**, con avance automático y opción de saltar en cualquier momento. Prioriza no retener al usuario en su primer contacto con el producto.                                                       | §5.1.2          |
| A-03 | **Sonido activado o silenciado por defecto** en el ejercicio de respiración.                                                                                                                                                                         | **Silenciado**, coherente con §6.12 (“silencio por defecto” en toda la app), con el control de altavoz visible desde el primer segundo.                                                                  | §6.12.1         |
| A-04 | **Unificación del ritmo de respiración.** R1 (ritual de mañana) mantiene 4+4 s sin sonido; P1 usa 5-5-3 con sonido. ¿Se unifican, se mantienen separados con justificación explícita, o R1 adopta el color y el audio conservando su duración corta? | **Se mantienen separados**, con la inconsistencia declarada en el sistema de diseño.                                                                                                                     | §5.5.1, §6.10.1 |
| A-05 | **Frase de identidad de área en H2.** El Bloque 04 la retira de todas las listas. ¿Debe volver **solo** al detalle de hábito (H2), en una tarjeta propia y separada del encabezado?                                                                  | **No vuelve.** H2 muestra el nombre del área y nada más.                                                                                                                                                 | §5.7.4          |
| A-06 | **Navegación por fecha dentro del Journal** y acción **“Descargar mi journal”**, presentes en el mockup de referencia pero no solicitadas por escrito.                                                                                               | **Fuera de alcance de Fase 0.** La exportación general sigue en Perfil → Tus datos.                                                                                                                      | §5.8.1          |
| A-07 | **Límite de intentos del PIN.** ¿Debe haber bloqueo temporal tras N intentos fallidos?                                                                                                                                                               | **Sin límite de intentos.** Como no hay cifrado, un límite daría una falsa sensación de robustez sin añadir protección real.                                                                             | §5.8.2          |
| A-08 | **Sincronización del PIN entre dispositivos.** ¿Debe un dispositivo nuevo heredar la protección?                                                                                                                                                     | **No se sincroniza.** Un dispositivo nuevo empieza sin PIN, coherente con el copy “acceso en este dispositivo”.                                                                                          | §7.4.1, §7.7.1  |

### Nota sobre el Bloque 08

El Bloque 08 se define como **validación final cruzada: no introduce funcionalidad nueva**. Su función es verificar que los siete bloques anteriores conviven sin regresiones y consolidar las decisiones pendientes en este capítulo.

**Advertencia de integridad documental:** el material de entrada de esta revisión enumeró los bloques 01 a 07 con detalle y mencionó “las cinco decisiones abiertas del bloque 08” **sin adjuntar su contenido**. Las decisiones abiertas listadas en §10.2 se han reconstruido a partir de (a) las tres nombradas explícitamente en el encargo —A-01, A-02, A-03— y (b) las contradicciones y puntos sin cerrar detectados al integrar los bloques 01 a 07 —A-04 a A-08—. **Si el Bloque 08 contenía cinco decisiones abiertas con una redacción concreta, deben contrastarse con esta tabla antes de dar por cerrada la v3.1.** Este párrafo debe eliminarse en cuanto se haga esa comprobación.

## 10.3 Trazabilidad: de bloque a sección

| Bloque                  | Secciones nuevas                               | Secciones actualizadas o anotadas                                                       |
|:------------------------|:-----------------------------------------------|:----------------------------------------------------------------------------------------|
| 01 — Género y contraste | §3.6.5, §5.1.3, §5.2.3, §5.4.3, §6.3.7         | §5.12.1, §7.2 (UserProfile), §7.4.1, Anexo A, Anexo C                                   |
| 02 — Estado de sueño    | §5.4.1, §5.6.1                                 | §5.4 (Bloque 7 original), §7.2 (DailyEntry.noche), §7.4.1, §6.3.5 (vía `animoDerivado`) |
| 03 — Tema de Hoy        | §5.2.1, §6.3.8, §6.10.1                        | §4.3.3 (nota de reversión), §5.2 completa, §6.3.3                                       |
| 04 — Etiqueta de área   | §5.7.4, §5.1.4, §5.2.2, §5.3.1, §5.4.2, §5.5.1 | §5.7 (H1, H2, H3), §5.6.1, §7.2 (Habit)                                                 |
| 05 — Respiración        | §5.1.2, §6.3.9, §6.10.1, §6.12.1               | §5.1 (P1 original), §6.10 (animaciones firmadas), §6.12, §7.2 (AppPreferences)          |
| 06 — Journal emociones  | §5.8.1, §5.3.2, §6.3.10                        | §5.8 (comportamiento original), §3.6.2 (regla de emojis), §6.7, §7.2 (JournalEntry)     |
| 07 — Journal PIN        | §5.8.2, §5.12.1, §7.7.1                        | §5.8 (bloqueo por entrada V2), §5.12, §7.2 (JournalPinConfig), §7.4.1, §7.7             |
| 08 — Validación cruzada | Capítulo 10                                    | Anexo A (comprobaciones 16–22), Anexo C (D-B01 a D-B07)                                 |

# Capítulo 7 — Decisiones de la división Lumia/Formia — **CERRADAS**

> **Estado en v4.1: las 12 decisiones están cerradas** (10 ago 2026). Cada sección conserva su análisis original —contexto, opciones y recomendación técnica— seguido de la resolución adoptada, para que se pueda revocar cualquiera con conocimiento de causa. La tabla resumen está en la portada.
>
> **Sigue abierto un único punto de maquetación:** los rótulos exactos de las pestañas (§C7.3), que dependen de la retícula de la barra inferior y del manual de marca.
>
> *Texto original de v4.0:* **Ninguna de estas decisiones se toma en este documento.** Cada una lleva su contexto, sus opciones y, cuando existe, una **recomendación técnica** — que es una observación sobre coste e implicaciones, no una decisión de producto. Quedan abiertas hasta que las cierre el propietario del producto.
>
> Este capítulo es a la división Lumia/Formia lo que §10.2 fue a la Fase 0. Las decisiones abiertas de Fase 0 **siguen abiertas** y viven en el Capítulo 6; no se mezclan con éstas.

## C7.1 Distribución: ¿dos apps o una?

**La pregunta:** ¿Lumia y Formia son dos aplicaciones separadas en las tiendas, o una sola aplicación con dos espacios navegables?

**Qué está en juego:** todo lo demás de este capítulo depende de esta respuesta. Con dos apps, la capa compartida necesita un mecanismo de cuenta federada real y los insights cruzados exigen que las dos estén instaladas. Con una app, la separación es conceptual y de navegación, no de distribución.

**Recomendación previa registrada:** **una sola app en Fase 1.** Argumentos técnicos a favor: el trabajo actual (React PWA + Firebase, 1 persona, 10 h/semana) no soporta dos ciclos de publicación; `shared/` funciona sin sincronización entre procesos; Strivo Intelligence tendría acceso a los dos `namespaces` sin infraestructura adicional. Argumento en contra: dos marcas con identidad visual propia (paletas opuestas, símbolos propios) conviviendo en una sola app exigen una transición visual muy bien resuelta, o el sistema se lee como una app con dos temas.

**Resuelto en v4.1: una sola app** con dos espacios navegables.

## C7.2 Migración de los usuarios de Fase 0

**La pregunta:** ¿cómo se migran los datos de los 5 testers actuales al modelo `shared/lumia/formia`? Y en particular: **¿qué identidad se asigna retroactivamente a los hábitos existentes que hoy no tienen ese vínculo?**

**El problema concreto:** los hábitos creados en Fase 0 tienen `areaId` **opcional** (§C3.9). Los que se crearon desde P7/P8 o desde H3 con área seleccionada migran solos (`identityRef = areaId`). Los que tienen `areaId = null` —perfectamente legales en v3.1— no tienen destino automático.

**Opciones sobre la mesa (sin recomendación de producto):**

1.  **Asignación automática a `"central"`.** Migración silenciosa, sin fricción. Riesgo: asigna un significado que la persona no eligió, y RN-DB4-08 prohíbe precisamente corregir en silencio.
2.  **Pantalla de migración única.** Al abrir la versión nueva, se muestran los hábitos sin identidad y se pide asignarles una. Riesgo: fricción en el primer arranque, justo con los 5 testers que hay que cuidar.
3.  **Asignación diferida.** Migran a `"central"` marcados como “por revisar”, y se pregunta la primera vez que se abre el detalle del hábito. Riesgo: estado intermedio que hay que implementar y luego retirar.

**Resuelto en v4.1: opción 3 (asignación diferida), con una precisión decisiva.** Al abrir el detalle (H2) de un hábito heredado sin identidad, se pregunta una vez; si la persona sale sin responder, el hábito sigue funcionando y se vuelve a preguntar la próxima vez. **Nunca se le asigna una identidad en silencio** (RN-DB4-08).

**RN-MIG-01** `identityRef` nulo se admite **únicamente** en hábitos creados antes de v4.0. Toda escritura nueva sin identidad se rechaza en la capa de datos (RN-DB4-05). El Principio 2 (§C0.3) queda intacto: lo que se admite es un residuo heredado en extinción, no un modo de uso. **RN-MIG-02** Un hábito heredado sin identidad **no se marca como defectuoso** en ninguna superficie: no lleva icono de advertencia, no encabeza la lista, no se comunica como carencia (RN-HAB-AREA-02).

**Recomendación técnica (no de producto):** la migración debe ser **idempotente y reversible**, ejecutarse en local antes de cualquier sincronización, y dejar traza de qué hábitos fueron tocados. Con 5 usuarios, el coste de la opción 2 es de minutos; con 5.000 sería otra conversación — y esta migración solo se puede hacer una vez.

**Resuelto en v4.1: asignación diferida** — ver RN-MIG-01 y RN-MIG-02 arriba.

## C7.3 Naming de la navegación

**La pregunta:** si es una sola app (§C7.1), ¿cómo se llaman las pestañas?

**Qué está en juego:** v3.1 especifica una barra inferior de **tres elementos** —Hoy · Journal · Tú— con una cuarta pestaña “Hábitos” añadida en Fase 0 (§4.3.1 y su actualización). Esa estructura mezcla los dos productos en la misma barra. Las opciones evidentes —llamar a las pestañas “Lumia” y “Formia”— exponen la arquitectura de marca al usuario, que no tiene por qué conocerla.

**Tensiones a resolver:**

- Si las pestañas se llaman **Lumia** y **Formia**, la marca se aprende, pero la navegación deja de decir qué hay dentro.
- Si se llaman **Hoy** y **Hábitos**, la navegación es clara pero las marcas desaparecen del uso diario y solo viven en las tiendas.
- El manual de marca deja explícitamente **abierto** el *naming* de tabs (§9 del manual): es una decisión conjunta de marca y producto, no solo de producto.

**Resuelto en v4.1: naming mixto** — nombre de marca acompañado de un subtítulo descriptivo, de modo que la marca se aprenda sin que la barra deje de decir qué hay dentro. **Los rótulos exactos siguen pendientes de maquetar:** “Lumia · Hoy” y “Formia · Hábitos” no caben en una barra inferior de móvil, así que lo previsible es rótulo corto en la pestaña y nombre de marca en la cabecera del espacio. Es el único punto de este capítulo que queda por concretar, y es de maquetación, no de producto.

## C7.4 Strivo Intelligence — alcance de Fase 1

**La pregunta:** ¿algún insight cruzado básico ya en Fase 1, o la capa completa se pospone a Fase 2?

**Contexto:** el Capítulo 4 está marcado como especificación futura. §5.9 (heredado) define un catálogo amplio que exige volumen de datos para no producir ruido. Con 5 testers y semanas de historial, una correlación conducta ↔ ánimo no es estadísticamente honesta — y §5.9 prohíbe presentar como patrón lo que es casualidad.

**Resuelto en v4.1: en Fase 1 entra únicamente el insight de evidencia de identidad**, sin correlación conducta↔ánimo. Esto significa que Strivo Intelligence **no cruza los dos `namespaces` en Fase 1**: el insight de evidencia solo lee `formia/`, así que en la práctica puede vivir dentro de Formia hasta que llegue la correlación. La capa cruzada se especifica ahora y se construye en Fase 2.

**Análisis original:** el candidato de menor riesgo es el insight de **evidencia de identidad sin correlación** (“en Salud lo demostraste 18 de los últimos 28 días”), que solo necesita `formia/` y es verificable. La correlación con ánimo —el insight que justifica la marca madre— necesita meses de datos.

**Resuelto en v4.1: solo evidencia de identidad en Fase 1.**

## C7.5 La “Mañana” de Lumia sin secuencia de ritual

**La pregunta:** ahora que Mañana en Lumia es solo respiración + intención + gratitud/logros dentro del display de Hoy, **sin pasos secuenciales tipo wizard**, ¿se necesita algún tipo de transición o entrada suave al abrir esa sección, o se accede directo como una página?

**Qué se perdió al disolver el ritual:** el pop-up de mañana aportaba tres cosas que la página no tiene por sí sola — un **umbral** (la app se detenía antes de dejarte entrar), un **orden** (una pregunta por pantalla) y un **cierre** (el botón “Comenzar mi día” con su transición luminosa de 900 ms).

**Materiales ya existentes que podrían cubrirlo, si se decide que hace falta:** la pantalla de transición al entrar a la app con luz tenue y frase de gratitud (Fase 0), la propia respiración diaria (§C2.3) como umbral voluntario, y el cross-fade de 320 ms del cambio de tema Mañana/Noche (§5.2.1, Bloque 03).

**La tensión real:** cualquier transición añadida corre el riesgo de reconstruir el wizard por la puerta de atrás — exactamente lo que la división quería eliminar. Y no añadir nada corre el riesgo de que la mañana se sienta como un formulario.

**Resuelto en v4.1: se reutiliza la transición de luz tenue con frase que ya existe al entrar a la app.** No se construye nada nuevo.

- **RN-LU-MAN-01** La transición es la misma pieza ya implementada en Fase 0 (luz tenue + frase de un repertorio de ~100), no una variante propia de la sección Mañana.
- **RN-LU-MAN-02** No introduce pasos, no exige interacción y no se puede convertir en un wizard: es un umbral de entrada, no una secuencia.
- **RN-LU-MAN-03** La respiración diaria (§C2.3) **no** forma parte de esta transición y no se dispara con ella. Sigue siendo voluntaria (RN-LU-RESP-01).

## C7.6 Hábitos sin identidad clara al crear (H3)

**La pregunta:** si la persona crea un hábito propio sin tener claro a qué identidad pertenece, ¿se le **obliga** a elegir una en ese momento, o se le permite **asignarla después**?

**Por qué no basta con el esquema:** el modelo de datos exige `identityRef` no nulo (RN-DB4-05). Eso resuelve la integridad, no la experiencia. Si se obliga en el momento, hay fricción en el punto exacto donde v3.1 quería que no la hubiera (“máximo 4 campos visibles”). Si se permite después, hay que inventar un estado que el esquema no admite.

**Opciones sobre la mesa:**

1.  **Obligatorio en el momento** (lo que hoy especifica §C3.6): el botón de guardar espera. Coherente con el esquema, sin estados intermedios. Coste: un campo más que resolver antes de guardar.
2.  **Preselección por defecto en `"central"`**, editable con un toque, con la identidad central mostrada como texto real (“Alguien que crece”). No hay bloqueo ni estado inválido, y la persona puede cambiarla. Coste: una asignación que la persona podría no haber elegido conscientemente.
3.  **Sugerencia inteligente**, aplicando el mecanismo que §5.3 ya define para las victorias: si el texto del hábito contiene señales claras de un área (“correr”, “dormir” → Salud), se **sugiere** con un chip que la persona confirma o cambia; **nunca se asigna sola sin confirmación**. Coste: hay que construirlo; y no cubre el caso sin señales claras.

**Alcance real de la decisión:** afecta a H3 **y** a los hábitos sugeridos de P7–P8 cuando la persona omite la selección de áreas (§C1.2). Conviene resolverla una sola vez para los dos casos.

**Resuelto en v4.1: opción 3 (sugerencia por texto), con el campo sin resolver cuando no hay señal clara.** Ver §C3.6.1. El análisis original se conserva abajo como historia de la decisión.

**Nota técnica del análisis original:** la opción 2 era la única que no introducía ni bloqueo ni estado inválido, y es coherente con RN-DB4-09 (la identidad central siempre existe). Pero **es una decisión de producto**: determina si el vínculo identidad–hábito se vive como una elección consciente —que es el argumento entero de Formia— o como un valor por defecto.

**Resuelto en v4.1: sugerencia por texto; sin señal clara, el campo queda sin resolver.** Ver §C3.6.1.

## C7.7 Conflictos detectados durante la reestructuración

> Estos puntos **no formaban parte del encargo**: aparecieron al confrontar el contenido real de v3.1 con la arquitectura nueva. **Todos quedan resueltos en v4.1** salvo §C7.7.6, que es redacción de copy y no decisión.

### C7.7.1 El Ritual de Noche muestra hábitos (N2)

**Instrucción recibida:** el Ritual de Noche (N1–N6) no se toca, “nunca tuvo hábitos mezclados”.

**Lo que dice v3.1:** §5.6 especifica seis pantallas y la segunda es **N2 — Revisión de hábitos**: *“checklist de hábitos del día (mañana y noche juntos), con progreso acumulativo”*, que escribe en `HabitLog`. §5.6.1 lo confirma al aplicarle la regla de etiquetado de área del Bloque 04.

**El conflicto:** N2 es una superficie de Lumia que lee y escribe datos de hábitos, lo que contradice el reparto de `namespaces` (RN-DB4-01) y la eliminación del checklist del Diario (§C2.6). Es exactamente la misma mezcla que motivó disolver el Ritual de Mañana.

**Resuelto en v4.1: se retira N2.** El Ritual de Noche queda en cinco pantallas de pura introspección y ninguna superficie de Lumia lee ni escribe datos de hábitos. Las consecuencias exactas —identificadores N3–N6 conservados, RN-HR-01 y RN-HR-02 sin efecto en la noche, criterio de aceptación 2 acotado— están en §5.6.

**Nota:** esta resolución coincide con la enumeración de N1–N6 del encargo original, que ya describía el ritual nocturno sin hábitos.

### C7.7.2 La “vista de día completo” del Historial cruza los dos productos

§5.10 especifica una vista de día que muestra *“todo lo registrado ese día (mañana, noche, journal, hábitos)”*. Tras la división, esa vista es un insight cruzado de facto y no puede vivir en Lumia sin leer `formia/`. **Resuelto en v4.1: la vista de día completo muestra únicamente contenido de Lumia** —mañana, noche y journal—, sin hábitos. No lee `formia/` y por tanto no viola RN-DB4-01. Si algún día se quiere la vista unificada, será una superficie de Strivo Intelligence, no del Historial de Lumia.

### C7.7.3 Los hábitos visibles desde la pantalla Hoy

§5.2.2 \[Bloque 04\] especifica el etiquetado de área de **los hábitos visibles desde Hoy**, y la actualización de Fase 0 sustituyó esos hábitos por un enlace *“Tu ritual de la mañana”*. Tras la división, ese enlace apunta a Formia y su copy usa vocabulario de Lumia (“ritual”). **Resuelto en v4.1: no hay puente.** Los dos espacios se cruzan **solo por la barra de navegación**. El enlace *“Tu ritual de la mañana”* se retira de la pantalla Hoy y no se sustituye por ningún otro enlace a Formia. Consecuencia: desaparece el problema de copy (no hay que redactar nada) y §5.2.2 deja de ser un caso ambiguo. Queda un solo copy huérfano de los tres de §C7.7.6.

### C7.7.4 Atributos de área que el modelo canónico no recoge

`formia/identity/areas` guarda `selected` e `identityText`, pero §5.7.4 y §6.3.2 necesitan `color`, y RN-ID-04 necesita `estado(activa|pausada|archivada)`. Ver el Aviso 1 de §C5.4. **Resuelto en v4.1 por vía técnica** (no era decisión de producto): el mapa pasa a ser `areas[areaId] = { selected, identityText, color, icon, order, state }`. Las 7 áreas son un catálogo cerrado con `areaId` estables, así que el coste es nulo.

### C7.7.5 ¿Las victorias son de Lumia o de Formia?

Se han asignado a `lumia/` (§C5.3) porque se escriben y leen en superficies de Lumia y su función es emocional. Pero una victoria tiene `areaId` en v3.1, alimenta los insights de identidad y es, conceptualmente, evidencia de construcción. **Resuelto en v4.1: las victorias se quedan en `lumia/`, con `identityRef` opcional.** La asimetría con los hábitos es deliberada y conviene tenerla clara: un hábito es un compromiso de construcción y por eso exige identidad; una victoria es un hecho que ocurrió y no necesita justificarse ante ninguna identidad para contar. Su vínculo, cuando existe, es material de Strivo Intelligence.

### C7.7.6 Copy huérfano tras la disolución

Tres textos quedan sin objeto y necesitan redacción nueva —no decisión de producto— antes de implementar: el copy de entrada de la respiración diaria (*“Antes de empezar, respira una vez”*, §C2.3) y la confirmación al completar los hábitos de un momento (*“Ritual completo. Buen comienzo.”*, §C3.5). **El tercero desaparece:** al no haber puente de Hoy hacia Formia (§C7.7.3), no hay enlace que redactar. Los dos restantes deben pasar por `src/copy/index.js` y por `npm run lint:copy`.

# Parte transversal — Capítulos 8 a 15

> Los capítulos que siguen se conservan **íntegros de v3.1**, renumerados. No están divididos por producto porque describen el sistema entero: la visión, las personas, la voz, la arquitectura funcional, el sistema de diseño, la arquitectura técnica, el roadmap y la revisión crítica. Cuando una sección de estos capítulos ha sido reubicada a los capítulos 0–5, se indica en su lugar.

# Capítulo 8 — Visión

\[REUBICADO DE CAPÍTULO 1 — v3.1\] — íntegro. La visión sigue siendo la del sistema completo; los taglines y promesas por producto están en §C0.2.

## 1.1 Misión

**Ayudar a las personas a terminar cada día sintiéndose en paz consigo mismas y un poco más cerca de quien quieren ser.**

Cada palabra de esa frase está elegida:

- *Ayudar*: Strivo no transforma a nadie. Acompaña. La agencia siempre pertenece al usuario. Esto tiene consecuencias directas de diseño: la app nunca dice “te ayudé a lograr X”, dice “lograste X”.
- *Terminar cada día*: el ciclo de valor de Strivo es diario, no semanal ni mensual. El producto está diseñado alrededor de dos momentos con nombre propio: el despertar y el cierre.
- *En paz consigo mismas*: la métrica emocional primaria no es la motivación (volátil, agotable), sino la paz (sostenible, acumulativa). La motivación es un subproducto de la paz, no al revés.
- *Un poco más cerca*: el delta esperado por día es mínimo y consciente. Strivo vende **dirección**, no velocidad.
- *De quien quieren ser*: la identidad es el marco rector. No se persiguen métricas; se persigue una versión de uno mismo.

## 1.2 Visión

**Que en cinco años, para millones de personas hispanohablantes, “abrir Strivo” sea sinónimo de “darme tres minutos”.**

Strivo aspira a ocupar en la vida digital de una persona el lugar que ocupa una libreta en la mesita de noche: un objeto silencioso, personal, sin notificaciones agresivas, que no compite por atención pero que, cuando se abre, siempre devuelve algo. La visión de éxito no es tiempo de uso: es **frecuencia alta con duración baja y valor percibido alto**. Un usuario que abre Strivo 300 días al año durante 3 minutos es infinitamente más valioso —para él y para el negocio— que uno que lo abre 40 días durante 25 minutos.

## 1.3 Manifiesto

> **Strivo existe porque el mundo ya tiene suficientes aplicaciones que te dicen que no estás haciendo lo suficiente.**
>
> Creemos que la mayoría de las personas no necesitan más disciplina. Necesitan menos ruido.
>
> Creemos que nadie construyó una vida mejor sintiéndose culpable por ello.
>
> Creemos que un día no se mide por lo que tachaste de una lista, sino por lo que fuiste capaz de agradecer al final.
>
> Creemos que el progreso real es invisible el lunes, discutible el miércoles y evidente en noviembre. Nuestro trabajo es hacerlo visible antes de noviembre.
>
> Creemos que una aplicación de bienestar que te genera ansiedad es una contradicción, y que la industria está llena de ellas.
>
> Creemos que la calma no es la ausencia de funcionalidad: es la funcionalidad más difícil de construir.
>
> Creemos que la intimidad es sagrada. Lo que escribes aquí es tuyo, no es contenido, no es dato de entrenamiento, no es material para comparar con nadie.
>
> Creemos que celebrar es una habilidad, y que casi nadie la aprendió.
>
> No queremos tu atención. Queremos tus tres minutos. Y queremos devolvértelos convertidos en algo.
>
> **Strivo. Un poco mejor, todos los días.**

## 1.4 Valores del producto

Cada valor se acompaña de su **prueba de fuego**: la pregunta que un diseñador debe hacerse para saber si una pantalla lo respeta.

| Valor                         | Qué significa en la práctica                                                                         | Prueba de fuego                                                               |
|:------------------------------|:-----------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------|
| **Calma antes que capacidad** | Ante la duda entre una función más y una pantalla más tranquila, gana la pantalla.                   | ¿Esta pantalla se puede leer con el pulso en reposo?                          |
| **El usuario nunca fracasa**  | No existen estados de fallo atribuibles a la persona. Existen pausas, regresos y días distintos.     | ¿Hay alguna ruta en la que el usuario se sienta peor de lo que entró?         |
| **Verdad amable**             | La app no miente ni infla; celebra lo real. Un logro inventado por el sistema destruye la confianza. | ¿Este mensaje sería verdad si lo dijera un amigo honesto?                     |
| **Intimidad radical**         | Todo lo escrito es privado por defecto y por arquitectura.                                           | ¿Podría esto avergonzar al usuario si alguien mirara su pantalla en el metro? |
| **Menos, pero mejor**         | Cada elemento debe justificar su existencia. La densidad es deuda emocional.                         | Si borro esto, ¿qué se rompe realmente?                                       |
| **Progreso, no perfección**   | La métrica visible siempre suma; nunca resta.                                                        | ¿Este indicador puede bajar y hacer sentir mal al usuario?                    |
| **Dignidad del regreso**      | Volver después de 30 días debe sentirse igual de bien que volver después de un día.                  | ¿Cómo se ve esta pantalla para alguien que regresa tras un mes?               |
| **Autonomía**                 | Todo es configurable, saltable y reversible. Nunca hay una única ruta obligatoria.                   | ¿Puede el usuario decir “hoy no” sin consecuencias?                           |

## 1.5 Filosofía de diseño (desarrollo de los diecisiete principios)

### 1.5.1 Calm Technology

Los principios de Amber Case y Mark Weiser aplicados a Strivo:

- **La tecnología debe requerir la menor atención posible.** Strivo tiene como máximo **dos** notificaciones diarias por defecto, ambas configurables, ambas silenciables sin fricción.
- **La tecnología debe informar y crear calma.** Las notificaciones de Strivo no comunican urgencia. Nunca usan números en el badge de la aplicación. El badge está prohibido: un “1” rojo sobre un ícono de bienestar es una contradicción funcional.
- **La tecnología debe aprovechar la periferia.** El widget de pantalla de inicio (V2) muestra una frase, no una métrica. Informa sin exigir apertura.
- **La tecnología debe amplificar lo mejor de la tecnología y lo mejor de la humanidad.** La IA de Strivo hace lo que un humano no puede (recordar 180 entradas y encontrar un patrón) y jamás lo que un humano sí debe hacer (interpretar el sentido de su propia vida).
- **La tecnología puede comunicar, pero no necesita hablar.** Prioridad de canales: color y forma \> animación \> háptica \> sonido \> texto \> voz.
- **La tecnología debe funcionar incluso cuando falla.** Sin conexión, sin cuenta, sin batería de atención: Strivo sigue siendo usable. Ver estados offline en cada módulo del capítulo 5.

**Implicación de arquitectura:** no existe *feed*, no existe scroll infinito, no existe contenido generado por otros usuarios, no existe contador de mensajes sin leer, no existe pantalla que cambie mientras el usuario la mira.

### 1.5.2 Human Centered Design

El proceso de Strivo parte de la persona y no de la funcionalidad. Concretamente:

- Cada módulo del capítulo 5 se abre con un **“Job To Be Done”** en primera persona, no con una descripción funcional.
- Todo texto de interfaz fue escrito antes que el diseño visual. La pantalla se construye alrededor de las palabras, porque en un producto de introspección **las palabras son la interfaz**.
- Las decisiones de accesibilidad (capítulo 6) no son un anexo de cumplimiento normativo: definen el tamaño base tipográfico, el contraste mínimo y la jerarquía de toda la app.

### 1.5.3 Behavioral Design

Se adopta el modelo **B = MAP** (Fogg: comportamiento = motivación × habilidad × *prompt*) con una restricción ética explícita: **Strivo optimiza la habilidad y el disparador, nunca artificialmente la motivación.**

- **Habilidad (Ability):** el compromiso mínimo viable es *una línea de texto*. Escribir una sola cosa cierra el día como completado. Bajar el umbral es la palanca principal.
- **Disparador (Prompt):** anclado a rutinas existentes que el usuario declara en el onboarding (despertar, dormir), no a horarios arbitrarios.
- **Motivación:** se cultiva a través de significado (recuerdos propios, insights, identidad), nunca a través de miedo a la pérdida, escasez artificial, cuentas regresivas o vergüenza social.

**Prácticas explícitamente prohibidas (lista negra de patrones oscuros):**

1.  Rachas que se rompen con pérdida visible.
2.  Notificaciones que culpabilizan (“te abandonamos” / “tu planta murió”).
3.  Confirmshaming en cancelaciones (“No, prefiero seguir estancado”).
4.  Cuentas regresivas falsas en el paywall.
5.  Monedas, vidas, gemas o cualquier economía artificial.
6.  Comparación con otros usuarios.
7.  Bloqueo de contenido ya creado por el usuario si cancela la suscripción.

### 1.5.4 Psicología Positiva

Strivo implementa, con nombre y apellido, intervenciones con respaldo empírico:

| Intervención                                      | Base                                                                       | Dónde vive en Strivo                                                                   |
|:--------------------------------------------------|:---------------------------------------------------------------------------|:---------------------------------------------------------------------------------------|
| Tres cosas buenas (Seligman)                      | Aumento sostenido de bienestar y descenso de síntomas depresivos a 6 meses | Agradecimientos de la Vista de Noche                                                   |
| Gratitud diaria (Emmons & McCullough)             | Mejor afecto positivo, mejor sueño                                         | Agradecimientos de mañana y noche                                                      |
| Best Possible Self (King)                         | Aumento de optimismo y afecto positivo                                     | “Imagina que hoy termina siendo un gran día”                                           |
| Intenciones de implementación (Gollwitzer)        | Duplica-triplica tasas de ejecución                                        | “¿Qué acción pequeña podría ayudarte a sentirte así hoy?”                              |
| Savoring (Bryant & Veroff)                        | Amplifica el efecto de eventos positivos                                   | Recuerdos y “Un día como hoy” en Insights                                              |
| Autocompasión (Neff)                              | Menor ansiedad, mayor persistencia tras el fracaso                         | Copy de días incompletos y regresos                                                    |
| Etiquetado afectivo (Lieberman)                   | Nombrar la emoción reduce la activación de la amígdala                     | “¿Cómo me voy a dormir hoy?”                                                           |
| Identidad como motor del hábito (Clear, Oyserman) | La conducta persiste cuando confirma una identidad                         | Onboarding de identidad (central + áreas, §5.1.1) e Insights de evidencia de identidad |

**Regla de honestidad científica:** Strivo nunca afirma efectos clínicos, no se posiciona como terapia y no diagnostica. En la biblioteca de contenido, cada afirmación lleva referencia. Este punto también es un activo defensivo frente a regulación de apps de salud digital.

### 1.5.5 Mindfulness

Mindfulness aquí no significa meditación guiada (Strivo **no** es una app de meditación), sino tres cosas concretas:

1.  **Presencia en la transición.** Cada Ritual empieza con una pantalla de respiración de 5 a 8 segundos que no pide nada. Su función es cambiar el estado del sistema nervioso antes de pedir introspección.
2.  **Atención sin juicio.** Todas las preguntas de la app son abiertas y no evaluativas. Nunca se pregunta “¿Cumpliste?”, se pregunta “¿Qué pasó?”.
3.  **Ritmo deliberado.** Las animaciones de Strivo son entre un 20 % y un 40 % más lentas que las de una app de productividad estándar. La lentitud es intencional y medible (capítulo 6, tokens de motion).

### 1.5.6 Self Compassion

El modelo de Kristin Neff (amabilidad hacia uno mismo, humanidad compartida, atención plena) se traduce en reglas de sistema:

- **Nunca hay culpa por ausencia.** Al regresar tras días sin abrir, el primer mensaje reconoce el regreso, no la ausencia.
- **La humanidad compartida se comunica sin red social.** Frases del tipo “muchas personas dejan de escribir unos días; casi todas vuelven” ofrecen normalización sin comparación.
- **Existe un modo explícito de día difícil.** El usuario puede marcar el día como difícil, lo que cambia el copy, reduce las preguntas a una sola y desactiva cualquier celebración.

### 1.5.7 Habit Formation

- **Bucle de hábito:** señal (notificación anclada a rutina) → rutina (ritual de 3 min) → recompensa (cierre visual cálido + sentido). La recompensa de Strivo es *significado*, no puntos.
- **Fricción decreciente:** el primer día pide más (onboarding); a partir del día 5, la app precarga sugerencias, recuerda categorías y reduce el número de toques necesarios.
- **Regla de los dos días:** el sistema nunca alerta por un día perdido; solo actúa suavemente tras dos ausencias consecutivas, y aun así sin lenguaje de pérdida.
- **Anclaje temporal:** el Ritual de Mañana se vincula al despertar declarado; el de Noche, a la hora de dormir declarada, no a las 21:00 genéricas.

### 1.5.8 Diseño emocional

Los tres niveles de Norman:

- **Visceral:** degradados cálidos, tipografía humanista, curvas amplias, ausencia total de rojo de alarma. La primera impresión debe ser *“esto es un lugar agradable”* en menos de 400 ms.
- **Conductual:** la escritura no debe tener latencia perceptible; el teclado no debe tapar el campo activo; el guardado es automático y silencioso; nada se pierde nunca.
- **Reflexivo:** el usuario debe poder decir “Strivo dice algo de mí”. Los momentos reflexivos clave son el resumen semanal, el aniversario de entradas y el Libro de Vida (V2).

### 1.5.9 Minimalismo y 1.5.10 Elegancia

Minimalismo no es vacío: es **jerarquía extrema**. Reglas duras:

- Máximo **una** acción primaria por pantalla.
- Máximo **tres** niveles de jerarquía tipográfica visibles simultáneamente.
- Máximo **dos** colores de acento por pantalla.
- Ningún elemento decorativo que no comunique estado, jerarquía o emoción.
- El espacio en blanco es un componente y tiene tokens propios (§6.5).

Elegancia se define operativamente como: *la sensación de que nada sobra y nada falta*. Se verifica con el test de sustracción: quitar cualquier elemento debe empeorar la pantalla.

### 1.5.11 Privacidad por diseño

Los siete principios de Cavoukian, con implementación:

1.  **Proactiva, no reactiva:** ningún dato de contenido sale del dispositivo sin cifrado (§7.7).
2.  **Privacidad por defecto:** analítica de contenido desactivada; el usuario opta por entrar, no por salir.
3.  **Integrada en el diseño:** existe bloqueo biométrico desde el MVP y modo de privacidad de pantalla.
4.  **Funcionalidad completa:** rechazar la IA no degrada el producto base.
5.  **Seguridad de extremo a extremo del ciclo de vida:** borrado real y verificable en 30 días.
6.  **Visibilidad y transparencia:** pantalla “Tus datos” en lenguaje humano, no legal.
7.  **Respeto por el usuario:** exportación completa en un toque, sin retención de rehenes.

### 1.5.12 Accesibilidad universal

Objetivo: **WCAG 2.2 nivel AA como mínimo**, con AAA en contraste de texto de cuerpo. Ver §6.14. Compromiso explícito: si una decoración impide cumplir contraste, se cambia la decoración.

### 1.5.13 Menos pero mejor

Herencia de Rams. Traducción operativa: **el roadmap del capítulo 8 pospone deliberadamente ocho funcionalidades atractivas** para proteger la calidad de cinco. Cada aplazamiento está justificado.

### 1.5.14 Celebrar progreso, no perfección

Las celebraciones se disparan por **acumulación**, nunca por **continuidad ininterrumpida**. Escribir 10 veces desbloquea el mismo reconocimiento tanto si fueron 10 días seguidos como 10 días repartidos en dos meses. Este es uno de los diferenciadores estructurales de Strivo frente a todo el mercado.

### 1.5.15 La calma es una funcionalidad

Consecuencia presupuestaria: el equipo asigna tiempo de desarrollo explícito a la calma (animaciones, ritmo, sonido, transiciones, tono). En el roadmap, la calma no es “pulido”; tiene tareas propias y criterios de aceptación propios.

### 1.5.16 El usuario nunca fracasa y 1.5.17 La aplicación nunca juzga

Reglas verificables en QA:

- No existe la palabra *fallaste*, *perdiste*, *rompiste*, *incumpliste*, *deberías haber*, *otra vez no* en ningún string de la app.
- No existen porcentajes de cumplimiento por debajo del 100 % presentados como carencia (se presenta “6 de 10 días” como logro, nunca “40 % de incumplimiento”).
- No existen colores de alarma para estados del usuario. El rojo se reserva exclusivamente para acciones destructivas del sistema (borrar cuenta), nunca para conducta personal.
- Ningún elemento visual “muere”, se marchita, se enferma o se degrada por inactividad.

## 1.6 Propuesta de valor

**Enunciado principal (para tienda de aplicaciones y web):**

> **Strivo — Tres minutos al día para reconocer lo que sí lograste.** Un refugio privado para agradecer, cerrar bien el día y convertirte, poco a poco, en quien quieres ser.

**Enunciado interno (para el equipo):**

> Strivo convierte dos momentos que la mayoría de personas desperdicia —los primeros minutos del día y los últimos— en el mecanismo más simple posible para acumular evidencia de que uno está avanzando.

**Cadena de valor:**

Escribes tres líneas → la app te devuelve una imagen coherente de tu día → repites → la app te devuelve una imagen coherente de tu mes → empiezas a verte a ti mismo como alguien que sí avanza → esa identidad sostiene el comportamiento sin necesidad de disciplina.

**Promesa medible al usuario:** *“En 21 días vas a tener escrito, con tus palabras, un retrato de lo que agradeces y de lo que has conseguido. Nadie más lo puede escribir por ti, y nadie más lo va a leer.”*

## 1.7 El problema que resuelve

### Problema 1: la memoria negativa domina

El sesgo de negatividad hace que un comentario incómodo pese más que cinco cosas que salieron bien. A final del día, la persona promedio recuerda con nitidez lo que no hizo. **Consecuencia:** sensación crónica de insuficiencia pese a estar avanzando. **Respuesta de Strivo:** registrar activamente lo positivo y devolverlo después, cuando el usuario más lo necesita.

### Problema 2: la productividad convirtió la vida en una lista

Las herramientas disponibles (Todoist, Notion, calendarios) miden lo pendiente, no lo logrado. Al terminar el día siempre queda algo sin tachar, así que el día siempre termina en déficit. **Respuesta de Strivo:** el cierre del día no evalúa una lista; recoge evidencia.

### Problema 3: las apps de bienestar generan una segunda capa de culpa

Meditación no hecha, racha rota, planta muerta, hábitos en rojo. La herramienta de bienestar se transforma en un acreedor. **Respuesta de Strivo:** ausencia total de mecánicas de pérdida.

### Problema 4: el progreso personal es invisible a corto plazo

El esfuerzo diario no produce señal perceptible. Sin señal, no hay refuerzo, y el comportamiento se extingue en 8-14 días —la muerte típica de los propósitos. **Respuesta de Strivo:** los Insights fabrican la señal a partir de datos propios, no de métricas genéricas.

### Problema 5: el journaling libre tiene una barrera de entrada altísima

La página en blanco intimida. La mayoría de quienes compran una libreta de journaling la abandonan en dos semanas. **Respuesta de Strivo:** estructura guiada por defecto (Diario), libertad opcional (Journal). La estructura es el andamio; la libertad es el premio.

### Problema 6: la falta de conexión entre lo que se hace y quién se quiere ser

Los rastreadores de hábitos registran conductas huérfanas de sentido. **Respuesta de Strivo:** todo hábito y todo logro pertenece a un área de vida, y cada área se ancla a una identidad central amplia y estable declarada en el onboarding (§5.1.1). Los Insights hablan en lenguaje de identidad y por área (“eres alguien que crece; en Salud lo demostraste 11 de los últimos 14 días”), de modo que cualquier logro —de cualquier área— confirma quién quiere ser la persona, sin que un desequilibrio entre áreas se convierta jamás en un reproche.

## 1.8 Diferenciadores

| \#  | Diferenciador                                                                                                              | Por qué es defendible                                                                                                                                        |
|:----|:---------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| D-1 | **Doble vista del mismo día (mañana/noche) con continuidad de datos.** Las Victorias de la mañana reaparecen por la noche. | Nadie en el mercado cierra el bucle intención→evidencia dentro del mismo día. Es simple de describir e imposible de copiar sin rediseñar el producto entero. |
| D-2 | **Ausencia total de mecánicas de pérdida.**                                                                                | Requiere renunciar a retención barata. Los competidores con rachas no pueden eliminarlas sin canibalizar sus métricas.                                       |
| D-3 | **Insights escritos en segunda persona, con evidencia citada del propio usuario.**                                         | Convierte datos en espejo. Barrera técnica media, barrera de calidad de copy alta.                                                                           |
| D-4 | **Tono de voz como activo de producto.**                                                                                   | El copy es el producto. Es lo más difícil de replicar y lo que genera vínculo emocional.                                                                     |
| D-5 | **Tres minutos garantizados.** Compromiso explícito de brevedad.                                                           | Va en contra del incentivo de “tiempo en app” del resto de la industria.                                                                                     |
| D-6 | **Privacidad radical con exportación libre.**                                                                              | Genera confianza suficiente para escribir en serio, que es la precondición de todo el valor.                                                                 |
| D-7 | **Producto nativo en español, con voz culturalmente cálida (no traducida).**                                               | La mayoría de competidores son traducciones del inglés con calidad emocional degradada.                                                                      |

## 1.9 Benchmark competitivo

Para cada competidor: qué hace excepcionalmente bien (a copiar el principio, no la forma), dónde falla (nuestra oportunidad) y la lección accionable.

### Calm

- **Excepcional:** dirección de arte y sonido; el producto *suena* y *se ve* a calma. La pantalla de inicio no exige nada. Marca fortísima.
- **Falla:** es una biblioteca de contenido, no un espejo del usuario. Después de tres meses, Calm sabe lo mismo de ti que el primer día. Precio alto percibido frente a uso real.
- **Lección para Strivo:** invertir en dirección de arte y sonido por encima de la media del sector; pero el contenido nunca puede ser el núcleo, porque el contenido no genera pertenencia.

### Headspace

- **Excepcional:** pedagogía. Explica *por qué* funciona lo que te pide. Ilustración con personalidad propia y consistente.
- **Falla:** el modelo de “cursos” impone progresión lineal; abandonar a mitad de un curso genera culpa. Se ha vuelto denso: demasiadas secciones compitiendo entre sí.
- **Lección:** explicar el porqué (biblioteca de Ciencia del Bienestar), pero nunca estructurar la experiencia como un curso que se pueda “abandonar a medias”.

### Stoic

- **Excepcional:** combinación de journaling guiado, estado de ánimo y citas filosóficas; estética distintiva; buenas visualizaciones de correlación emoción-actividad.
- **Falla:** interfaz sobrecargada y ocasionalmente confusa; monetización agresiva; el tono filosófico excluye a quien no conecta con el estoicismo.
- **Lección:** las correlaciones emocionales son valiosísimas y poco explotadas; Strivo debe hacerlas *legibles* y en lenguaje humano, no en gráficas de dispersión.

### Reflectly

- **Excepcional:** onboarding conversacional cálido; entrada al journaling con muy poca fricción; estética atractiva.
- **Falla:** poca profundidad; el valor se agota en semanas; muchas quejas de facturación y de sensación de “app bonita pero vacía”.
- **Lección:** el onboarding conversacional funciona, pero debe estar respaldado por valor acumulativo real; si no, la retención de 30 días se desploma.

### Day One

- **Excepcional:** el mejor producto de journaling puro: metadatos, mapas, adjuntos, cifrado E2E, exportación impecable, “On This Day” excelente.
- **Falla:** página en blanco pura; sin acompañamiento emocional ni formación de hábito; orientado a documentar, no a crecer.
- **Lección:** copiar el estándar de calidad en exportación, cifrado y recuerdos temporales; diferenciarse en el acompañamiento.

### Finch

- **Excepcional:** vínculo emocional extraordinario mediante una mascota; autocuidado disfrazado de cuidar a otro; comunidad amable; ejemplar en accesibilidad emocional.
- **Falla:** la mascota crea dependencia y culpa latente (“si no lo hago, la descuido”); estética infantil que excluye a un público adulto profesional; densidad alta de mecánicas gamificadas.
- **Lección:** el mecanismo de “cuidar a alguien más” es potentísimo. Strivo lo adopta de forma no manipulativa: el “alguien” es **tu yo futuro** (§5.14, “Carta a tu yo de dentro de un año”), que no puede morir ni entristecerse.

### Fabulous

- **Excepcional:** rituales encadenados con ciencia conductual explícita; onboarding con narrativa fuerte.
- **Falla:** paywalls muy insistentes; sobrecarga de contenido motivacional; sensación de programa rígido.
- **Lección:** la idea de *ritual* como unidad de diseño es correcta y es la que Strivo adopta; la rigidez del programa es lo que hay que evitar.

### Habitica / Duolingo (gamificación)

- **Excepcional:** maestría absoluta en bucles de retención; Duolingo domina el disparador y la recuperación de usuarios inactivos.
- **Falla, para nuestro caso:** su motor es la aversión a la pérdida. En idiomas es tolerable; en bienestar es tóxico. Un usuario ansioso al que se le rompe una racha de meditación sale peor de lo que entró.
- **Lección:** copiar la excelencia en *timing* y variedad de mensajes; rechazar de plano la mecánica de pérdida.

### Notion / Apple Journal / Google Keep

- **Excepcional:** cero fricción (Apple Journal), flexibilidad total (Notion), disponibilidad del sistema operativo.
- **Falla:** ausencia de dirección emocional. Son contenedores, no acompañantes. Apple Journal es una amenaza de distribución real, pero no de profundidad.
- **Lección:** el diferencial frente a lo gratuito y preinstalado no es tener campos de texto: es **devolver sentido**. Toda la estrategia defensiva de Strivo descansa en Insights y en la voz.

### Síntesis competitiva

El mercado se divide entre **apps de contenido** (Calm, Headspace: te dan algo que consumir), **apps de registro** (Day One, Apple Journal: te dan dónde guardar) y **apps de gamificación** (Finch, Habitica: te dan a quién no defraudar).

**Strivo ocupa un cuarto espacio, hoy prácticamente vacío: la app que te devuelve tu propia evidencia.** No te da contenido: te da a ti mismo, ordenado y con sentido. Este posicionamiento es el activo estratégico central del producto y ninguna decisión de roadmap debe diluirlo.

## 1.10 Oportunidades de innovación

Ocho apuestas concretas, ordenadas por relación valor/esfuerzo. Cada una se especifica en el capítulo 5 o 8.

1.  **Cierre del bucle intención→evidencia en 12 horas** (D-1). *Valor: máximo. Esfuerzo: bajo.* Ya está en el núcleo del MVP.
2.  **Insight con cita textual del propio usuario.** Mostrar al usuario algo que él mismo escribió hace seis semanas, en el momento adecuado. *Valor: máximo. Esfuerzo: bajo-medio.*
3.  **“Modo día difícil”.** Un botón que reduce la app a una sola pregunta amable. *Valor: alto en retención de usuarios en riesgo. Esfuerzo: bajo.*
4.  **Constancia acumulativa en lugar de racha.** Métrica que solo sube. *Valor: alto y diferencial. Esfuerzo: bajo.*
5.  **Libro de Vida (V2).** Compilación narrada por IA de los meses del usuario, exportable a PDF y potencialmente a libro impreso. *Valor: altísimo en percepción de valor premium y en vínculo. Esfuerzo: medio-alto.*
6.  **Carta a tu yo futuro y su devolución programada.** *Valor: alto en momentos memorables. Esfuerzo: bajo.*
7.  **Detección de temas emergentes en el Journal** (“llevas tres semanas escribiendo sobre tu hermano”). *Valor: muy alto en percepción de “esta app me conoce”. Esfuerzo: medio. Riesgo ético: medio; requiere control explícito del usuario.*
8.  **Audio de cierre nocturno personalizado** que lee los agradecimientos del usuario con voz sintética cálida antes de dormir. *Valor: alto y muy memorable. Esfuerzo: medio. Diferimiento recomendado a V2.*

# Capítulo 9 — Investigación del usuario

\[REUBICADO DE CAPÍTULO 2 — v3.1\] — íntegro y sin cambios. Las cinco personas y las antipersonas siguen siendo las del sistema completo, no de un producto concreto.

## 2.0 Método y estatus de la evidencia

Los perfiles siguientes son **personas de diseño provisionales** construidas a partir de: análisis de reseñas públicas de las siete apps del benchmark (patrones de queja y de elogio), literatura de psicología positiva y formación de hábitos, y el conocimiento acumulado del equipo sobre el producto actual. **Deben validarse con 12–15 entrevistas semiestructuradas antes de V1** (§9.9, plan de investigación). Se marcan con \[H\] las hipótesis de mayor riesgo.

Regla de uso: una persona no es un promedio demográfico; es un **modelo de decisión**. En cualquier discusión de diseño, la pregunta legítima es “¿qué haría Mariana con esta pantalla a las 23:10 de un martes?”, no “¿le gustaría a Mariana?”.

## 2.1 Persona primaria — Mariana, “la que sostiene todo”

**Edad:** 34 · **Profesión:** gerente de marketing en una empresa mediana · **Ubicación:** Monterrey · **Situación:** vive con su pareja, sin hijos aún, hermana menor con la que habla a diario.

### Historia

Mariana asciende cada dos o tres años y cada ascenso le sienta como una bata prestada. Es la persona a la que todos recurren: su equipo, su jefa, su madre, su mejor amiga. Los demás la describen como “increíblemente organizada”. Ella describe su vida interior como “una alarma que suena todo el día bajito”. Duerme cerca de seis horas y media. Se levanta y lo primero que ve es Slack. Se acuesta y lo último que ve es Instagram.

Ha probado tres apps de meditación (usó dos semanas cada una), un rastreador de hábitos (abandonó cuando se le rompió una racha de 23 días durante un viaje de trabajo) y compró una libreta de gratitud preciosa que tiene once páginas escritas y ochenta en blanco. Ninguno de esos abandonos la hizo pensar “la herramienta no era buena”; todos la hicieron pensar **“yo no soy constante”**. Esa conclusión es el verdadero problema que Strivo debe atacar.

Objetivamente, Mariana está teniendo un año excelente: la promovieron, corrió sus primeros 10K, arregló la relación con su padre. Subjetivamente, siente que va tarde.

### Contexto de uso

- Teléfono: iPhone, modo oscuro siempre activo, notificaciones agrupadas.
- Momento de mañana: 6:40, en la cama, antes de levantarse; 3 a 4 minutos disponibles.
- Momento de noche: entre 22:40 y 23:20, ya en la cama, con la luz baja y la pareja durmiendo al lado. **Este dato tiene consecuencias de diseño directas:** modo oscuro impecable, cero sonido por defecto, brillo bajo tolerable, sin animaciones brillantes.
- Contexto social: no quiere que nadie sepa que usa “una app de esas”. El nombre y el ícono no pueden ser cursis.

### Dolores

1.  Termina días productivos sintiéndose insuficiente.
2.  No recuerda lo que logró hace dos semanas; su memoria solo conserva lo pendiente.
3.  Se siente culpable por sentirse mal, porque “objetivamente todo va bien”.
4.  La carga mental de cuidar a otros no aparece en ninguna lista de tareas y por tanto nunca se reconoce.
5.  Cada app abandonada es una prueba más en el juicio interno contra sí misma.

### Frustraciones con soluciones actuales

- “Las apps de meditación me piden 10 minutos que no tengo, y luego me hacen sentir mal por no tenerlos.”
- “Los hábitos en rojo son una lista de reproches.”
- “El journaling libre me deja mirando una hoja en blanco a las 23:00. No tengo energía para eso.”
- “Todo es en inglés traducido y suena a coach de LinkedIn.”

### Objetivos

- **Funcional:** cerrar el día con sensación de orden interior en menos de cinco minutos.
- **Emocional:** dejar de sentir que va tarde. Sentirse orgullosa sin necesidad de que alguien la valide.
- **De identidad:** convertirse en una persona que se cuida a sí misma con la misma seriedad con que cuida a los demás.

### Hábitos actuales

Café antes de hablar con nadie · lista de pendientes en notas del teléfono · audio diario con su hermana · pilates dos veces por semana (a veces una) · scroll de 25 minutos antes de dormir que no disfruta.

### Barreras de adopción

- Escepticismo por historial de abandonos (“¿para qué, si igual la voy a dejar?”).
- Miedo a otro compromiso diario.
- Preocupación por privacidad: escribiría cosas sobre su jefa y su madre.
- Rechazo estético a lo infantil o “hippie”.

### Necesidades emocionales

Ser vista sin ser evaluada · permiso para descansar · evidencia de su propio avance · un lugar donde no tenga que ser fuerte.

### Mapa de empatía

|                 |                                                                                                                                        |
|:----------------|:---------------------------------------------------------------------------------------------------------------------------------------|
| **Piensa**      | “Debería estar disfrutando más esto.” “¿Por qué no me alcanza el día?” “Ojalá alguien me dijera que voy bien.”                         |
| **Siente**      | Cansancio de fondo, orgullo intermitente, culpa por la culpa, ansiedad nocturna leve.                                                  |
| **Ve**          | Compañeras que “lo tienen todo resuelto” en redes; una lista de pendientes que nunca termina; su libreta de gratitud vacía en el buró. |
| **Oye**         | “Eres la más organizada”; “¿te encargas tú?”; “necesitas descansar” (dicho por gente que no le quita nada de encima).                  |
| **Dice y hace** | Dice “todo bien”. Se apunta a más cosas. Pospone lo suyo. Descarga apps a las 23:00 con esperanza genuina.                             |
| **Dolores**     | Insuficiencia crónica, memoria negativa, soledad en la carga.                                                                          |
| **Ganancias**   | Sentirse orgullosa, dormir en paz, tener pruebas de que sí avanza.                                                                     |

### Jobs To Be Done

- **JTBD-1 (principal):** *Cuando termino el día agotada y con la sensación de no haber hecho lo suficiente, quiero ver evidencia real de lo que sí hice, para poder dormir en paz conmigo misma.*
- **JTBD-2:** *Cuando despierto y la lista de pendientes ya me está esperando, quiero decidir yo cómo quiero sentirme hoy, para no entrar al día en modo reactivo.*
- **JTBD-3:** *Cuando llevo semanas sintiendo que estoy estancada, quiero que alguien —o algo— me muestre lo que he avanzado, para recuperar perspectiva.*
- **JTBD-4:** *Cuando algo me duele y no puedo contárselo a nadie, quiero un lugar privado donde soltarlo, para que deje de dar vueltas en mi cabeza.*

### Escenarios de uso

- **Escenario A (noche típica, 23:05):** en la cama, luz apagada, teléfono al 18 % de batería. Abre Strivo por la notificación. Modo oscuro. Escribe dos agradecimientos y marca dos de tres victorias. Toca “no se dio hoy” en la tercera y elige moverla a mañana. Cierra con una frase. Total: 2 min 40 s. **Sale sintiendo que el día se cerró bien.**
- **Escenario B (mañana caótica, 7:10):** llega tarde. Abre el pop-up del Ritual de Mañana, lee la frase, pulsa “Hoy voy con prisa” y la app le muestra únicamente “¿Cómo quiero sentirme hoy?” con tres tarjetas. 25 segundos. **Sale sintiendo que no falló.**
- **Escenario C (regreso tras 12 días):** volvió de un viaje de trabajo. Abre la app con culpa anticipada. La pantalla dice “Qué bueno tenerte de vuelta” y muestra un agradecimiento suyo de hace dos meses. **Sale sintiendo alivio, no reproche.** Este escenario es el más importante de todo el producto para la retención a largo plazo.
- **Escenario D (domingo, resumen semanal):** recibe el resumen. Lee que en la última semana mencionó tres veces a su hermana entre sus agradecimientos. Se emociona un poco. Toma la decisión de llamarla. **Aquí es donde Strivo deja de ser una app y se vuelve significativa.**

## 2.2 Persona secundaria — Daniel, “el que empieza mil veces”

**Edad:** 27 · **Profesión:** desarrollador de software · **Ubicación:** Guadalajara · **Situación:** vive solo, trabaja remoto.

### Historia

Daniel tiene 14 apps de productividad instaladas y usa ninguna. Ha leído *Hábitos atómicos* dos veces y ha construido tres sistemas en Notion, todos abandonados a las cinco semanas. Su patrón es reconocible: **entusiasmo de configuración \> constancia de ejecución**. Le fascina optimizar el sistema porque optimizar el sistema es más fácil que enfrentar el día. Su vida interior es un ciclo de “esta vez sí” seguido de “ya sabía”.

Su verdadero problema no es la falta de herramientas: es que **no tiene un mecanismo para reconocer avances pequeños**, y sin ese reconocimiento su motivación se apaga en dos semanas.

### Dolores y frustraciones

- Todo lo que empieza lo abandona; eso ya es parte de cómo se define.
- Trabaja solo; nadie ve su esfuerzo, y sin testigos el esfuerzo se siente irreal.
- Le irrita la ñoñería: si la app le habla como un póster motivacional, la borra en el segundo día.
- Fricción cero es requisito: si el onboarding dura más de 90 segundos, se sale.

### Objetivos

Terminar algo · demostrarse que puede sostener una rutina · ordenar el ruido mental antes de dormir · entender por qué unos días rinde y otros no.

### Barreras

Cinismo hacia el género de app · alergia al lenguaje espiritual · exigencia de calidad técnica (si hay lag al escribir, la borra) · escepticismo con la IA (“no quiero que un modelo me psicoanalice”).

### Necesidades emocionales

Sentirse capaz · evidencia objetiva, no ánimos vacíos · control total sobre sus datos y sobre lo que la app hace.

### JTBD

- *Cuando llevo dos semanas con algo y siento que no sirve de nada, quiero ver datos reales de mi propio avance, para no abandonar por decimoquinta vez.*
- *Cuando termino el día sin haber avanzado en mi proyecto, quiero reconocer lo que sí hice, para no entrar en la espiral de “no sirvo para esto”.*

### Implicaciones de diseño derivadas de Daniel

1.  El onboarding debe tener una ruta express de **menos de 60 segundos** con posibilidad de completar el perfil después.
2.  La app necesita un registro **objetivo y numérico** accesible (Insights con datos, no solo frases), aunque no sea la vista por defecto.
3.  El tono debe tener una variante sobria. Ver §3.7, *ajuste de voz*: el usuario elige entre “cálido” y “directo” durante el onboarding. **Esta es una de las propuestas de mayor impacto del documento**: amplía el mercado sin diluir la marca.
4.  Cero latencia percibida al escribir. Requisito técnico duro (§7.4).

## 2.3 Persona terciaria — Rosa, “la que quiere reencontrarse”

**Edad:** 51 · **Profesión:** enfermera, turnos rotativos · **Ubicación:** Puebla · **Situación:** dos hijos, uno ya fuera de casa; se divorció hace tres años.

### Historia

Rosa lleva 25 años cuidando personas, dentro y fuera del hospital. Sus turnos rotan, así que “las 21:00” no significa nada para ella: unos días es su hora de dormir y otros el inicio de su jornada. Tiene una fe importante y su vida espiritual es un pilar. Usó WhatsApp y Facebook durante años; no descarga apps nuevas con facilidad y desconfía de lo que le pidan datos.

Quiere volver a saber quién es más allá de ser madre y enfermera. Nunca ha escrito un diario, pero reza, y rezar se parece más al journaling de lo que ella cree.

### Dolores

- Agotamiento por compasión; da todo el día y no recibe.
- Horarios que hacen imposible cualquier rutina rígida.
- Sensación de haber perdido su identidad propia.
- Tecnología que asume que todo el mundo tiene un horario de oficina.

### Barreras

Vista cansada (necesita texto grande) · manos ocupadas · desconfianza tecnológica · poca tolerancia a interfaces complejas · datos móviles limitados en el hospital.

### Necesidades emocionales

Sentirse acompañada · reconocimiento de su esfuerzo invisible · espacio espiritual respetado y no ridiculizado · sencillez absoluta.

### JTBD

- *Cuando salgo de un turno de doce horas, quiero soltar lo que cargo en algún lugar seguro, para no llevármelo a la cama.*
- *Cuando siento que solo existo para los demás, quiero recordar quién soy yo, para no desaparecer.*

### Implicaciones de diseño derivadas de Rosa

1.  **Los rituales no pueden depender de horas fijas absolutas.** Debe existir un modo “horarios variables” que ancle el ritual al *primer acceso* de un bloque amplio y no a una hora concreta. Ver §5.5.
2.  **Tipografía grande y escalable** hasta 200 % sin rotura de diseño (§6.14).
3.  **La opción “Conectado con Dios”** entre las emociones no es decorativa: es un ancla de inclusión para un segmento amplísimo en Latinoamérica. Se conserva, junto con la posibilidad de ocultar las opciones espirituales para quien no las quiera.
4.  **Funcionamiento offline completo**, con sincronización posterior (§7.5).
5.  Onboarding que no exija cuenta para empezar a escribir (§5.2).

## 2.4 Persona cuaternaria — Andrés, “el que ya casi lo tiene”

**Edad:** 41 · **Profesión:** emprendedor, dueño de una consultora pequeña · **Situación:** casado, dos hijos.

Ya practica journaling con The Five Minute Journal en papel y ha leído a Marco Aurelio. Es el **usuario premium natural** y el evangelizador del producto. Su problema no es empezar, es **no poder buscar ni releer**: tiene cuatro libretas llenas y ninguna consultable. Su valor para Strivo es doble: convierte a suscripción anual sin fricción y es el vector principal de recomendación boca a boca.

**JTBD:** *Cuando quiero entender cómo he cambiado en los últimos dos años, quiero poder buscar y releer lo que escribí, para tomar mejores decisiones ahora.*

**Implicaciones:** exportación e importación de calidad, búsqueda potente, “Un día como hoy”, el Libro de Vida y estadísticas serias. Andrés justifica por sí solo la existencia de los Insights avanzados y del Libro de Vida en V2.

## 2.5 Persona quinaria — Sofía, “la que está pasándolo mal”

**Edad:** 23 · **Profesión:** estudiante de posgrado · **Situación:** vive con dos compañeras de piso, lejos de su familia.

Sofía atraviesa un periodo de ansiedad alta. Está en terapia quincenal. Descarga Strivo buscando algo que la sostenga entre sesiones. **No es una persona objetivo comercial, pero es una persona a la que el producto puede dañar si se diseña mal**, y por eso debe estar en este documento.

**Requisitos de seguridad que Sofía impone al producto:**

1.  **Ningún mensaje puede exigir positividad.** “¿Qué agradeces hoy?” debe poder responderse con “hoy nada, y está bien” sin que la app insista.
2.  **Nunca celebrar por encima del estado real del usuario.** Si registró un ánimo muy bajo, no aparece confeti.
3.  **Protocolo de contenido sensible (§5.16):** si el usuario escribe expresiones de riesgo, la app no diagnostica, no alarma y no bloquea; ofrece de forma discreta, no intrusiva y en un solo lugar, recursos de ayuda locales, y deja claro que Strivo no sustituye atención profesional.
4.  **La app nunca debe fingir ser terapeuta.** La IA de Insights tiene prohibido interpretar patologías, dar consejo clínico o hacer atribuciones causales sobre el estado mental del usuario (§7.9, límites de la IA).
5.  **Modo día difícil accesible en un toque.**

## 2.6 Antipersonas (para quién NO es Strivo)

Definir esto evita el 80 % de las malas decisiones de roadmap.

- **El optimizador cuantificado** que quiere correlacionar sueño, HRV, calorías y estado de ánimo en dashboards. Strivo tendrá integraciones (§7.12), pero **nunca será un panel de datos biométricos**.
- **El adolescente buscando comunidad.** Sin componente social, Strivo no le sirve; y su presencia obligaría a moderación, verificación de edad y una arquitectura entera que contradice el producto.
- **El equipo o la empresa que quiere medir el bienestar de sus empleados.** Un caso de uso comercialmente tentador y **incompatible con la intimidad radical**. Rechazado explícitamente hasta V3 y, si se aborda, solo con datos agregados y anónimos que el empleador jamás pueda desagregar.
- **Quien busca terapia.** Strivo acompaña, no trata. La comunicación debe ser inequívoca.

## 2.7 Segmentación y priorización

| Segmento                             | % objetivo del MVP | Valor de negocio                                     | Prioridad de diseño                                   |
|:-------------------------------------|:-------------------|:-----------------------------------------------------|:------------------------------------------------------|
| Mariana (profesional con sobrecarga) | 45 %               | Alta conversión a mensual, buena a anual             | **P0 — toda decisión ambigua se resuelve a su favor** |
| Andrés (practicante avanzado)        | 15 %               | Máxima: anual, retención larga, recomendación        | P1                                                    |
| Daniel (reiniciador crónico)         | 25 %               | Media: alta descarga, retención frágil               | P1                                                    |
| Rosa (cuidadora, horario irregular)  | 10 %               | Media-baja pero alto valor de misión y accesibilidad | P2                                                    |
| Sofía (vulnerable)                   | 5 %                | Baja comercialmente / crítica éticamente             | **P0 en seguridad, P3 en funcionalidad**              |

## 2.8 Hipótesis de riesgo a validar antes de V1

- **\[H1\]** El usuario percibe suficiente valor en los primeros 3 días como para volver un cuarto día sin notificación. *Método: prueba de 7 días con 10 usuarios, medición de aperturas espontáneas.*
- **\[H2\]** La ausencia de rachas no perjudica la retención de 30 días frente a una versión con rachas. *Método: prueba A/B en Beta.* **Si esta hipótesis se refuta, no se añaden rachas: se refuerza la Constancia acumulativa.**
- **\[H3\]** Los usuarios completan la Vista de Mañana. Riesgo alto: la mañana es el momento más escaso. *Método: analítica de la Beta.* **Si la tasa de finalización matinal es inferior al 25 %, la Vista de Mañana se reduce a dos preguntas por defecto.**
- **\[H4\]** El Insight generado por IA se percibe como valioso y no como invasivo. *Método: entrevistas cualitativas tras cuatro semanas de uso.*
- **\[H5\]** El precio de 99 MXN/mes no es una barrera para Mariana. *Método: prueba de precio en Beta con dos cohortes.*

# Capítulo 10 — Experiencia emocional y voz del producto

\[REUBICADO DE CAPÍTULO 3 — v3.1\] — íntegro salvo **§3.6.5** (arquitectura de copy género-adaptativo), reubicada al Capítulo 1 por ser capa compartida. El manual de marca define además un matiz de voz por marca en notificaciones; donde haya discrepancia, manda este capítulo para el fondo y el manual para el tono de marca.

## 3.1 Principio rector

En Strivo, **la emoción es la especificación**. Antes de definir qué hace una pantalla, este documento define qué debe sentir la persona antes, durante y después de usarla. Si la implementación cumple la funcionalidad pero falla la emoción, la implementación está incorrecta.

Cada etapa se especifica con cuatro elementos:

- **Estado de entrada:** cómo llega el usuario.
- **Estado objetivo:** cómo debe salir.
- **Mecanismos:** qué elementos concretos producen la transición.
- **Antipatrones:** qué destruiría el efecto.

## 3.2 La curva emocional del día

            ┌── Mañana ──┐                          ┌── Noche ──┐
    Energía │  intención │      (app ausente)       │  cierre   │
            │   ▲        │                          │      ▲    │
     Calma ─┼───┴────────┼──────────────────────────┼──────┴────┼──
            │ 60-180 s   │   0 interrupciones       │ 90-240 s  │

Strivo aparece dos veces al día y desaparece el resto. **La ausencia deliberada durante el día es una decisión de producto, no una carencia.** Ninguna funcionalidad futura puede introducir interrupciones diurnas por defecto.

## 3.3 Etapas emocionales

### Etapa 0 — Antes de abrir la app

- **Estado de entrada:** cansancio, dispersión, a veces culpa anticipada (“no escribí ayer”).
- **Estado objetivo:** curiosidad tranquila. La persona debe pensar *“me voy a dar un momento”*, no *“tengo que hacer lo de la app”*.
- **Mecanismos:** el ícono de la app es cálido, adulto y no infantil; la notificación nunca es imperativa (§3.10); no hay badge numérico; el nombre “Strivo” no revela el contenido íntimo si alguien ve la pantalla.
- **Antipatrones:** badge rojo, notificación con signo de exclamación, texto que empiece por “No olvides”.

### Etapa 1 — Al abrir la app

- **Estado de entrada:** transición desde otra app ruidosa (correo, redes) o desde el mundo físico.
- **Estado objetivo:** descompresión en menos de 2 segundos. La sensación buscada es la de **entrar a una habitación con la luz cálida ya encendida**.
- **Mecanismos:**
  1.  Fondo con degradado suave que responde a la hora del día (amanecer / día / atardecer / noche profunda), animado con una deriva casi imperceptible (ver §6.10).
  2.  Sin pantalla de carga con logo prolongada: el splash dura ≤ 700 ms y funde al contenido.
  3.  Primer elemento visible: un saludo personal con el nombre, no un menú.
  4.  Nada parpadea, nada se mueve rápido, nada exige decisión inmediata.
- **Antipatrones:** modal de valoración de la app, promoción de suscripción al abrir, carrusel de novedades, cualquier interstitial.

### Etapa 2 — Durante el Ritual (mañana)

- **Estado de entrada:** prisa, mente reactiva, cuerpo aún dormido.
- **Estado objetivo:** sensación de haber elegido el día en lugar de recibirlo.
- **Mecanismos:** una sola pregunta por pantalla; respiración inicial de 6 s; frase inspiradora breve; posibilidad de saltar cualquier paso sin penalización; cierre con “Comenzar mi día” que produce una transición amplia y satisfactoria.
- **Antipatrones:** más de cinco pasos, formularios densos, obligar a rellenar antes de continuar, temporizadores.

### Etapa 3 — Durante el Diario (escritura)

- **Estado de entrada:** ligera resistencia ante la página en blanco.
- **Estado objetivo:** flujo. El usuario debe olvidarse de que está usando una app.
- **Mecanismos:**
  1.  **Cero latencia.** El texto aparece con el trazo. Requisito duro.
  2.  El campo activo nunca queda tapado por el teclado (desplazamiento anticipado de 120 ms).
  3.  El resto de la interfaz **se atenúa** al 40 % de opacidad al escribir (modo foco automático).
  4.  Guardado automático silencioso; jamás un botón “Guardar” prominente ni un aviso de “Guardando…”.
  5.  Sugerencias que aparecen solo tras 6 segundos de inactividad, con desvanecimiento suave, siempre descartables, nunca reaparecen si se descartaron dos veces en la misma sesión.
- **Antipatrones:** contador de caracteres, corrector agresivo, animaciones durante la escritura, autocompletado por IA que ponga palabras en la boca del usuario. **Regla dura: la IA nunca escribe dentro del campo del usuario.**

### Etapa 4 — Al terminar (cierre del día)

Este es **el momento más importante del producto entero**. Es donde se genera la razón para volver mañana.

- **Estado de entrada:** el usuario acaba de escribir; hay una micro-vulnerabilidad emocional.
- **Estado objetivo:** paz + orgullo tranquilo. La sensación de *“ya está, el día se cerró bien”*.
- **Mecanismos — la secuencia de cierre (especificación exacta):**
  1.  El teclado se retira (250 ms).
  2.  La pantalla se oscurece suavemente y todo el contenido se aleja levemente (escala 0,97) durante 400 ms.
  3.  Aparece una **síntesis del día en una frase**, construida con datos reales: *“Hoy reconociste 3 logros y agradeciste 2 cosas.”*
  4.  Debajo, **una frase de cierre variable** de la biblioteca de copy nocturno (§3.11), seleccionada según el ánimo registrado.
  5.  Una única animación: un punto de luz cálida que se expande lentamente y se desvanece (900 ms, no repetible, sin sonido por defecto).
  6.  Un solo botón: **“Buenas noches”**. Al pulsarlo, la app **se atenúa a negro** y se cierra visualmente. No devuelve al usuario a un menú.
- **Justificación:** devolver al usuario a un home lleno de opciones después de un cierre emocional es el error más común del sector. Strivo termina la sesión de forma deliberada. **El producto debe ser bueno despidiéndose.**
- **Antipatrones:** confeti ruidoso, sonido de logro tipo videojuego, “¿quieres invitar a un amigo?”, encuesta, paywall, badge desbloqueado con fanfarria.

### Etapa 5 — Después de una semana

- **Estado objetivo:** reconocimiento de un patrón propio. *“Anda, sí escribí cinco días.”*
- **Mecanismos:** el primer **Resumen semanal** (domingo por la tarde o el día que el usuario prefiera) muestra: número de días con registro (siempre expresado en positivo), la palabra más repetida en sus agradecimientos, un logro que él mismo escribió, y una pregunta abierta para la semana siguiente.
- **Riesgo:** un resumen con pocos datos se siente vacío. **Regla:** si hay menos de tres registros, el resumen no muestra estadísticas; muestra únicamente una cita del propio usuario y una frase de acompañamiento.

### Etapa 6 — Después de un mes

- **Estado objetivo:** la app empieza a “conocerme”. Aparece el primer Insight con evidencia.
- **Mecanismos:** Insight de patrón (“los días que registras algo de movimiento físico, tu ánimo de cierre suele ser más alto”); primer recuerdo “Un día como hoy”; primera celebración por acumulación (30 registros).
- **Momento memorable planificado:** el **día 30**, la app muestra una pantalla especial que recopila, sin comentario editorial, **las diez cosas que el usuario agradeció más veces**. Sin gráficas. Solo sus palabras. Este es el primer momento de “wow” real del producto, y es un momento de puro savoring.

### Etapa 7 — Después de varios meses

- **Estado objetivo:** pertenencia. Strivo se ha convertido en “mi lugar”. La pérdida de la app sería una pérdida real.
- **Mecanismos:** Libro de Vida (V2); búsqueda en el archivo propio; comparación identitaria amable (“hace seis meses escribías más sobre cansancio; en los últimos dos, sobre planes”); aniversario de la primera entrada.
- **Riesgo principal:** la meseta. Un usuario de seis meses ya no se sorprende. **Contramedida:** cadencia de novedades emocionales de larga duración (§8.5), no de funcionalidades: la carta al yo futuro se devuelve a los 12 meses, el resumen anual, la retrospectiva de estaciones.

### Etapa 8 — Al regresar tras una ausencia larga

Especificado como etapa propia por su impacto desproporcionado en la retención.

- **Estado de entrada:** culpa, vergüenza, expectativa de reproche.
- **Estado objetivo:** alivio. *“No pasó nada.”*
- **Mecanismos:** ver §5.15 (Estado de regreso). En resumen: la app no menciona el número de días ausentes, no muestra huecos vacíos en calendarios, no reinicia nada visible y ofrece continuar exactamente donde estaba.
- **Antipatrón absoluto:** “Llevabas 34 días seguidos y perdiste tu racha.”

## 3.4 Emociones prohibidas

Ninguna pantalla, mensaje, animación o notificación puede producir intencionadamente:

**Culpa · Vergüenza · Urgencia · Ansiedad de comparación · Miedo a la pérdida · Sensación de deuda con la app · Presión social.**

Este listado es criterio de rechazo en revisión de diseño y en QA.

## 3.5 Momentos de deleite planificados (*delight moments*)

Deben ser **escasos** para ser especiales. Máximo uno por semana en promedio.

| \#   | Momento                                | Cuándo                    | Efecto buscado                                            |
|:-----|:---------------------------------------|:--------------------------|:----------------------------------------------------------|
| DM-1 | Primera entrada guardada               | Día 1                     | “Esto era más fácil de lo que pensaba”                    |
| DM-2 | Primera devolución de una frase propia | Día 7-10                  | Sorpresa emocional                                        |
| DM-3 | Las diez cosas que más agradeces       | Día 30                    | Emoción genuina, alta probabilidad de captura de pantalla |
| DM-4 | Insight con evidencia citada           | Semana 5+                 | “Me conoce”                                               |
| DM-5 | Un día como hoy (recuerdo anual)       | Mes 12                    | Nostalgia y vínculo profundo                              |
| DM-6 | Carta de tu yo pasado                  | Programada por el usuario | Máximo impacto emocional del producto                     |
| DM-7 | Cierre de año                          | 31 de diciembre           | Momento compartible (sin datos íntimos)                   |
| DM-8 | Regreso tras ausencia                  | Variable                  | Alivio, lealtad                                           |

**Regla de deleite:** un momento de deleite nunca interrumpe una tarea. Siempre ocurre *después* de que el usuario haya terminado lo que fue a hacer.

## 3.6 Principios de UX Writing

### 3.6.1 Definición de la voz

Strivo habla como **una persona sabia y cercana que te conoce bien y no te debe nada**. Ni coach, ni terapeuta, ni gurú, ni aplicación.

| Es           | No es             |
|:-------------|:------------------|
| Cálido       | Empalagoso        |
| Breve        | Seco              |
| Concreto     | Genérico          |
| Sereno       | Apático           |
| Adulto       | Infantil          |
| Esperanzador | Optimista forzado |
| Personal     | Invasivo          |

**Prueba de voz:** leer el texto en voz alta imaginando que lo dice un amigo de 40 años, inteligente y tranquilo, a las once de la noche, en voz baja. Si suena a póster, a anuncio o a manual, se reescribe.

### 3.6.2 Reglas duras de escritura

1.  **Tuteo siempre.** Nunca “usted”, nunca “vos” (salvo localización futura).
2.  **Segunda persona para el usuario, primera persona para lo que el usuario escribe.** La app dice “tus logros”; los encabezados de campos dicen “Mis logros de hoy”. Esta asimetría es deliberada: los campos son la voz del usuario, la interfaz es la voz de la app.
3.  **Máximo 12 palabras por microcopy de interfaz.** Máximo 24 por mensaje emocional.
4.  **Sin signos de exclamación** salvo en celebraciones (máximo uno).
5.  **Sin emojis en la voz de la app.** Los emojis pertenecen al usuario (puede añadirlos a sus agradecimientos). La app no los usa. *Excepción única: los íconos de emoción de las tarjetas, que son ilustraciones del sistema de diseño, no emojis.*
6.  **Sin lenguaje de deber:** prohibidos “debes”, “tienes que”, “no olvides”, “recuerda que”, “asegúrate de”.
7.  **Sin jerga de producto:** prohibidos “onboarding”, “streak”, “engagement”, “dashboard”, “log”, “entry” y sus traducciones torpes.
8.  **Sin superlativos vacíos:** “increíble”, “asombroso”, “espectacular”, “brutal”.
9.  **Nunca declarar la emoción del usuario:** no “¡Qué feliz debes estar!”. Sí: “Suena a un buen día.”
10. **Preguntas abiertas, nunca evaluativas.** “¿Qué pasó hoy?” en lugar de “¿Cumpliste tus metas?”.
11. **Las frases negativas se reformulan en positivo.** “Aún no has escrito nada” → “Este espacio está esperándote”.
12. **Números siempre en positivo.** “3 de 7 días” nunca “te faltaron 4 días”.

### 3.6.3 Léxico canónico

| Nunca decir             | Decir                          |
|:------------------------|:-------------------------------|
| Tarea, pendiente, to-do | Victoria, intención            |
| Racha, streak           | Constancia, días contigo       |
| Fallaste, incumpliste   | No se dio                      |
| Perdiste                | Quedó para otro momento        |
| Meta no cumplida        | Sigue abierta                  |
| Registro, log, entrada  | Lo que escribiste              |
| Usuario                 | Tú                             |
| Error                   | Algo no salió como esperábamos |
| Cancelar suscripción    | Terminar tu suscripción        |
| Premium (como muro)     | Strivo completo                |

### 3.6.4 Ajuste de voz (propuesta de innovación)

Durante el onboarding, el usuario elige entre dos registros de voz, mostrados con un ejemplo real y no con una etiqueta abstracta:

- **Cálido (por defecto):** *“Hoy hiciste más de lo que crees. Descansa.”*
- **Directo:** *“3 logros registrados. Buen día. A dormir.”*

**Justificación:** amplía el mercado a perfiles como Daniel sin diluir la marca; es barato de implementar (dos variantes por cadena emocional, no por toda la interfaz); y aumenta la sensación de que la app se adapta a la persona. **Alcance controlado:** solo afecta a ~60 cadenas emocionales, no a las ~400 de interfaz.

## 3.7 Microcopys de interfaz (catálogo base)

| Contexto                       | Texto                         |
|:-------------------------------|:------------------------------|
| Botón primario de mañana       | Comenzar mi día               |
| Botón primario de noche        | Cerrar mi día                 |
| Botón de cierre final          | Buenas noches                 |
| Añadir línea de agradecimiento | Añadir otra                   |
| Saltar un paso                 | Hoy no                        |
| Ruta express de mañana         | Hoy voy con prisa             |
| Guardar (cuando se muestra)    | Listo                         |
| Victoria completada            | Lo lograste                   |
| Victoria no completada         | No se dio hoy                 |
| Opciones tras no completar     | Pasarla a mañana · Dejarla ir |
| Modo día difícil               | Hoy fue un día difícil        |
| Editar entrada pasada          | Añadir algo más               |
| Confirmar borrado              | Esto se borra para siempre    |
| Sugerencias de escritura       | ¿Te ayudo con una idea?       |

## 3.8 Mensajes de estado vacío

El estado vacío es una **invitación**, nunca una constatación de carencia.

| Pantalla                           | Copy                                                                           |
|:-----------------------------------|:-------------------------------------------------------------------------------|
| Journal sin entradas               | Aquí caben los pensamientos que no caben en otro lado. Empieza cuando quieras. |
| Historial sin registros            | Todavía no hay nada que mirar atrás. Mañana ya habrá algo.                     |
| Insights con pocos datos           | Necesito conocerte un poco más. En unos días empezaré a notar cosas.           |
| Búsqueda sin resultados            | No encontré nada con esa palabra. Prueba con otra.                             |
| Sin hábitos configurados           | Tu ritual está vacío por ahora. Un solo hábito es un buen comienzo.            |
| Logros del día vacíos por la noche | ¿Qué pasó hoy? Aunque sea pequeño, cuenta.                                     |
| Sin agradecimientos hoy            | Está bien si hoy no encuentras nada. Mañana lo intentamos otra vez.            |

## 3.9 Mensajes de error

Estructura obligatoria: **qué pasó (sin tecnicismos) + qué está a salvo + qué puede hacer el usuario.** Nunca culpar al usuario, nunca mostrar códigos técnicos en la superficie (van al detalle plegable de diagnóstico).

| Situación                  | Copy                                                                                       |
|:---------------------------|:-------------------------------------------------------------------------------------------|
| Sin conexión               | Estás sin conexión. Sigue escribiendo: se guarda aquí y se sincroniza sola cuando vuelvas. |
| Fallo de sincronización    | No pude sincronizar ahora mismo. Nada se ha perdido; lo intento de nuevo en un rato.       |
| Fallo de inicio de sesión  | No pude entrar con esos datos. ¿Probamos otra vez?                                         |
| Fallo del servicio de IA   | Hoy no puedo generar tu reflexión. Tus datos están bien; vuelve más tarde.                 |
| Fallo al guardar (crítico) | Algo no salió bien al guardar. Copié tu texto aquí abajo para que no lo pierdas.           |
| Sesión caducada            | Por seguridad cerré tu sesión. Entra otra vez cuando quieras.                              |
| Pago rechazado             | El pago no se completó. Tu cuenta sigue igual, sin cambios.                                |

**Regla de oro de errores:** en un producto donde el usuario escribe cosas íntimas, **perder texto es el peor fallo posible**, peor que un cierre inesperado. Ver §7.4, política de persistencia local anticipada.

## 3.10 Notificaciones

### Principios

1.  Máximo **2 por día** por defecto (mañana y noche). Techo absoluto configurable: 4.
2.  Nunca entre las 23:59 y la hora de despertar declarada, salvo que el propio usuario lo configure.
3.  **Variabilidad obligatoria:** ninguna notificación se repite antes de 21 días. Biblioteca mínima de 40 variantes por tipo en el MVP.
4.  Nunca mencionan días perdidos, porcentajes ni comparaciones.
5.  Nunca usan el nombre de otras personas ni contenido íntimo del usuario en el texto visible en pantalla bloqueada. **Regla de privacidad de notificación: el contenido escrito por el usuario jamás aparece en una notificación.**

### Ejemplos por tipo

**Mañana:** - Buenos días. ¿Cómo quieres sentirte hoy? - Tres minutos para ti antes de que empiece todo. - El día está sin estrenar. - ¿Qué haría hoy la persona en la que te estás convirtiendo?

**Noche:** - Antes de dormir: ¿qué salió bien hoy? - Un momento para cerrar el día. - Aunque haya sido raro, algo pasó que vale la pena guardar. - ¿Te llevas algo bueno de hoy?

**Regreso tras ausencia (2-6 días):** - Sigue aquí cuando quieras volver. - Sin prisa. Cuando tengas un momento.

**Regreso tras ausencia larga (7+ días):** - Ha pasado un tiempo. Tu espacio sigue igual. - Hace unas semanas escribiste algo que quizá quieras releer.

**Celebración (máx. 1 cada 15 días):** - Van 30 días en los que te diste un momento. - Escribiste 100 cosas que agradeces. Cien.

**Prohibido:** “Te extrañamos”, “No rompas tu racha”, “Solo te falta un día”, “Tus amigos ya lo hicieron”, cualquier notificación con contador o cuenta atrás.

## 3.11 Celebraciones

Escala de tres niveles; **jamás se sube de nivel sin motivo real**.

| Nivel              | Disparador                                                                 | Expresión                                                                                                                            |
|:-------------------|:---------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------|
| **Susurro**        | Completar un paso, marcar un hábito                                        | Cambio de color suave + háptica muy ligera. Sin texto.                                                                               |
| **Reconocimiento** | Cerrar el día, completar un ritual                                         | Frase de cierre + animación de luz de 900 ms. Sin sonido por defecto.                                                                |
| **Celebración**    | Hitos de acumulación (10, 30, 100, 365 registros; primer mes; aniversario) | Pantalla completa dedicada, animación de 2 s, texto personalizado con datos reales, opción de guardar imagen. Máximo 1 cada 15 días. |

**Regla de sensibilidad:** si el ánimo registrado ese día está en los dos niveles más bajos, la celebración baja automáticamente un nivel y el copy cambia a registro sobrio. Nunca se celebra por encima del estado emocional de la persona.

## 3.12 Reglas para la voz de la IA

1.  La IA **describe**, no **interpreta**: “mencionaste el descanso siete veces este mes”, no “pareces agotado”.
2.  La IA **cita evidencia** del propio usuario siempre que hace una observación.
3.  La IA **pregunta más de lo que afirma**. Todo insight termina, cuando aplica, en una pregunta abierta y opcional.
4.  La IA **no da consejo no solicitado** sobre salud, relaciones, dinero o decisiones vitales.
5.  La IA **nunca finge emoción propia**: prohibido “me alegra mucho”, “me preocupa que”.
6.  La IA **admite que puede equivocarse**: “puede que me falte contexto”.
7.  La IA **nunca habla de otras personas mencionadas** por el usuario emitiendo juicios sobre ellas.
8.  Todo texto generado por IA es **identificable** y el usuario puede desactivarlo por completo sin perder funcionalidad esencial.

# Capítulo 11 — Arquitectura funcional de la aplicación

\[REUBICADO DE CAPÍTULO 4 — v3.1\]. **§4.6** (Compromisos) se reubica a Formia y **§4.10** (matriz gratuito/premium) a la capa compartida. El resto se conserva íntegro, con las anotaciones de v4.0 que se indican en cada sección afectada.

> **Nota de v4.0.** El mapa de módulos, la jerarquía de información (§4.2), la navegación (§4.3) y las dependencias (§4.4) describen el producto **antes** de la división. Siguen siendo válidos como inventario funcional, pero la asignación de cada módulo a Lumia, Formia o la capa compartida es la de los capítulos 1 a 3, y el *naming* de la navegación es una decisión abierta (§C7.3).

## 4.1 Mapa general de módulos

Strivo se compone de **cinco módulos nucleares**, **cuatro módulos de soporte** y **tres capas transversales**.

**Módulos nucleares (razón de ser del producto):**

1.  **Diario de Logros y Agradecimientos** — Vista de Mañana + Vista de Noche.
2.  **Rituales** — Ritual de Mañana, Ritual de Noche, y el motor de hábitos que los alimenta.
3.  **Journal** — escritura libre.
4.  **Insights** — reflexión personal a partir de datos propios.
5.  **Historial** — el archivo del usuario, consultable y buscable.

**Módulos de soporte:**

6.  **Onboarding** — configuración inicial e identidad.
7.  **Biblioteca de Ciencia del Bienestar** — contenido basado en evidencia (premium).
8.  **Audioteca** — audios de acompañamiento (premium).
9.  **Perfil y Ajustes** — identidad, preferencias, privacidad, suscripción, datos.

**Capas transversales (no son pantallas, atraviesan todo):**

- **Capa de Recordatorios Inteligentes** (§5.13).
- **Capa de Voz y Copy** (§3.6).
- **Capa de Estado Emocional del sistema** (§4.7): la app conoce el ánimo reciente del usuario y modula copy, celebraciones y notificaciones.

## 4.2 Jerarquía de información

    Strivo
    ├── HOY  (raíz, pantalla de inicio)
    │   ├── Héroe contextual (mañana / tarde / noche)
    │   ├── Acción principal del momento
    │   ├── Acceso a Diario (mañana o noche según hora)
    │   ├── Ritual del momento (si no completado)
    │   └── Accesos grandes a Journal / Insights / Historial
    │
    ├── DIARIO
    │   ├── Vista de Mañana
    │   │   ├── Encabezado dinámico (saludo, fecha, frase)
    │   │   ├── Agradecimientos de la mañana
    │   │   ├── Cómo me quiero sentir hoy (+ acción pequeña)
    │   │   ├── Visualización del gran día
    │   │   ├── Mis tres victorias
    │   │   └── Mi Ritual de la Mañana (checklist)
    │   └── Vista de Noche
    │       ├── Saludo nocturno
    │       ├── Mis logros de hoy (victorias heredadas)
    │       ├── Logros no planeados
    │       ├── Agradecimientos del día
    │       ├── Qué intentaría diferente mañana
    │       ├── Reflexión del día
    │       ├── Cómo me voy a dormir
    │       └── Mi Ritual de la Noche (checklist)
    │
    ├── RITUALES
    │   ├── Ritual de Mañana (pop-up + pantalla)
    │   ├── Ritual de Noche (pop-up + pantalla)
    │   └── Gestión de hábitos
    │       ├── Catálogo de hábitos
    │       ├── Hábito → área → identidad de área
    │       └── Programación (días, momento, recordatorio)
    │
    ├── JOURNAL
    │   ├── Lista cronológica
    │   ├── Editor libre
    │   ├── Búsqueda y etiquetas
    │   └── Adjuntos (V2)
    │
    ├── INSIGHTS
    │   ├── Resumen semanal
    │   ├── Resumen mensual
    │   ├── Patrones y correlaciones
    │   ├── Constancia acumulativa
    │   ├── Recuerdos (Un día como hoy)
    │   └── Libro de Vida (V2)
    │
    ├── HISTORIAL
    │   ├── Calendario / línea de tiempo
    │   ├── Vista de un día completo
    │   └── Búsqueda global
    │
    ├── DESCUBRE (premium)
    │   ├── Ciencia del Bienestar
    │   └── Audioteca
    │
    └── PERFIL
        ├── Mi identidad
        │   ├── Identidad central (una)
        │   ├── Áreas (añadir/editar/pausar/quitar)
        │   │   └── Identidad de área (opcional)
        │   └── Objetivo y Compromiso
        ├── Rituales y horarios
        ├── Notificaciones
        ├── Privacidad y seguridad
        ├── Datos (exportar, importar, borrar)
        ├── Apariencia y accesibilidad
        ├── Suscripción
        └── Ayuda y acerca de

## 4.3 Navegación

### 4.3.1 Estructura

**Barra inferior de tres elementos.** Tres es el número que mejor preserva la calma visual y elimina toda ambigüedad de destino.

| Posición | Etiqueta | Ícono                      | Destino                                                                                                    |
|:---------|:---------|:---------------------------|:-----------------------------------------------------------------------------------------------------------|
| 1        | Hoy      | Sol/luna contextual        | Pantalla raíz. Desde aquí se accede al **Diario** (Vista de Mañana o Noche según la hora) y a los Rituales |
| 2        | Journal  | Pluma                      | Lista de escritura libre                                                                                   |
| 3        | Tú       | Círculo con inicial/avatar | Insights + Historial + Perfil (+ Descubre)                                                                 |

**Decisión justificada:**

- **El Diario ya no ocupa pestaña propia.** Se accede desde la tarjeta de acción principal de “Hoy”, que siempre presenta el Diario del momento (mañana o noche). *Razón:* el Diario es una acción anclada a un momento del día, no un lugar que se visita a voluntad; tenerlo como pestaña permanente invitaba a abrir “la Vista de Noche” a las 8:00, un estado sin sentido. Ubicarlo en Hoy hace que el Diario aparezca siempre en su momento correcto y elimina la pestaña que competía con la acción principal. Esta decisión recoge la recomendación del §9.2 (UX Designer) y se valida en la Beta.
- **“Tú” agrupa Insights, Historial, Perfil y Descubre** porque todos responden al mismo trabajo del usuario: *“quiero mirarme / quiero mis cosas”*. Descubre (contenido premium) **no** ocupa espacio en la barra: se accede desde tarjetas contextuales en Hoy y desde Tú. *Razón:* poner contenido de pago en la navegación primaria convierte la barra en un anuncio permanente.
- **Journal es la única pestaña de creación libre** y merece acceso directo permanente porque su valor está justamente en poder abrirse en cualquier momento, sin depender de la hora ni de un ritual.

**Regla de acceso al Diario (para evitar ambigüedad de implementación):** - Franja de mañana → la tarjeta principal de Hoy abre la **Vista de Mañana** / Ritual de Mañana. - Franja de noche → abre la **Vista de Noche** / Ritual de Noche. - Resto del día → la tarjeta principal muestra el estado del día (“Tu día está en curso” / “cerrado”) y permite abrir la vista correspondiente para revisar o editar. - El Diario completo del día en curso y de días pasados también es accesible desde **Tú → Historial → día**.

### 4.3.2 Reglas de navegación

1.  **Profundidad máxima: 3 niveles.** Cualquier contenido debe alcanzarse en ≤ 3 toques desde Hoy.
2.  La barra inferior **se oculta** durante Rituales, escritura activa y secuencias de cierre. Esos son estados de flujo, no de navegación.
3.  **Los Rituales son modales**, no destinos de la barra: tienen principio y fin.
4.  Nunca hay dos formas visualmente distintas de llegar al mismo sitio en la misma pantalla.
5.  El gesto de retroceso del sistema siempre funciona y nunca destruye contenido sin guardar.
6.  Al terminar el Ritual de Noche, la app **no navega a ningún sitio**: ejecuta la secuencia de cierre (§3.3, etapa 4).

### 4.3.3 Comportamiento contextual de “Hoy”

La pantalla raíz cambia según la franja horaria local, definida a partir de los horarios declarados por el usuario en el onboarding:

| Franja        | Definición                                                                       | Contenido primario                                                                                              |
|:--------------|:---------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------|
| **Amanecer**  | Desde despertar_declarado − 1 h hasta despertar + 5 h (límites duros 4:00–11:30) | Ritual de Mañana / Vista de Mañana                                                                              |
| **Día**       | Entre el fin del amanecer y noche_declarada − 4 h                                | Vista tranquila: frase, acceso a Journal, victoria en curso. **Sin exigencias.**                                |
| **Atardecer** | 4 h antes de la hora de dormir declarada                                         | Invitación suave a cerrar el día                                                                                |
| **Noche**     | Desde noche_declarada − 2 h hasta 23:59 (límites duros 19:00–23:59)              | Ritual de Noche / Vista de Noche                                                                                |
| **Madrugada** | 00:00–4:00                                                                       | Modo silencioso: acceso solo a Journal, sin invitaciones, copy específico (“Aún de pie. Aquí está tu espacio.”) |

**Nota de reversión \[ACTUALIZADO EN BLOQUE 03\].** La tabla anterior sigue siendo la definición canónica de las cinco franjas horarias del producto, y sigue gobernando: qué tarjeta principal se ofrece, qué copy se muestra, qué ritual se propone, cuándo se envían los recordatorios y qué sección de Hoy se propone **al abrir** la pantalla. **Lo que ya no gobierna es el color de fondo de la pantalla Hoy.** Desde el Bloque 03, el tema visual de Hoy lo decide exclusivamente el conmutador “Mañana” ↔ “Noche” y no cambia solo. Ver §5.2.1 para la especificación completa de la reversión y su justificación. P1 y la pantalla de transición conservan el degradado horario.

## 4.4 Dependencias entre módulos

| Origen                      | Destino                                        | Naturaleza de la dependencia                                                                                                                    |
|:----------------------------|:-----------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------|
| Onboarding                  | Todos                                          | Define identidad central, áreas, identidades de área, horarios, hábitos iniciales, preferencias de voz y notificación                           |
| Áreas (identidad)           | Hábitos, Victorias, Insights, Ritual de Mañana | Cada hábito y victoria pertenece a un área; los Insights se generan por área; el Ritual de Mañana muestra el área con más peso del día (§5.1.1) |
| Vista de Mañana → Victorias | Vista de Noche → Logros                        | **Herencia de datos obligatoria.** Las victorias del día aparecen automáticamente en la noche                                                   |
| Gestión de hábitos          | Checklist de ambos rituales                    | El checklist es una proyección del catálogo de hábitos filtrado por momento y día                                                               |
| Rituales                    | Diario                                         | El Ritual de Noche **es el contenedor** de la Vista de Noche, no un módulo paralelo (§4.6)                                                      |
| Diario, Journal, Rituales   | Insights                                       | Fuente de datos. Sin datos no hay insights                                                                                                      |
| Diario, Journal             | Historial                                      | Todo lo escrito se archiva por fecha                                                                                                            |
| Estado emocional            | Recordatorios, Celebraciones, Copy             | Modula intensidad y tono                                                                                                                        |
| Suscripción                 | Insights avanzados, Descubre, Libro de Vida    | Control de acceso, **nunca sobre contenido ya creado por el usuario**                                                                           |

## 4.5 Relación crítica: Rituales y Diario — **\[ACTUALIZADO EN v4.0\]**

> **Alcance vigente de la decisión D-4.5.** Al disolverse el Ritual de Mañana, esta decisión **solo aplica a la noche**: Ritual de Noche (modo guiado) y Vista de Noche del Diario (modo libre) siguen siendo dos presentaciones del mismo registro del día, y escribir en cualquiera de las dos actualiza el mismo dato (§5.6.1). Para la mañana ya no hay dos presentaciones, porque ya no hay ritual matinal: queda el display de Hoy → Mañana y la Vista de Mañana del Diario (§C2.1). El texto original se conserva íntegro a continuación.

**Ambigüedad detectada en el briefing:** el Ritual de Noche y la Vista de Noche del Diario piden información solapada (logros, agradecimientos, reflexión). Construirlos como módulos separados produciría duplicación de datos, confusión conceptual y doble trabajo para el usuario.

**Decisión de arquitectura (D-4.5):**

> **El Ritual es el *envoltorio guiado*; el Diario es el *contenido y el archivo*.** Son la misma información presentada de dos formas.

- El **Ritual de Noche** presenta las preguntas de la Vista de Noche **de una en una, a pantalla completa**, con transiciones cuidadas y ritmo lento. Es el modo *guiado*.
- La **Vista de Noche** presenta las mismas preguntas **en una sola pantalla desplazable**, editable en cualquier orden. Es el modo *libre*.
- Escribir en cualquiera de los dos actualiza **el mismo registro del día** (entidad `DailyEntry`, §7.2).
- El usuario elige su modo preferido en Ajustes; por defecto, el Ritual guiado durante los primeros 14 días (menor fricción, mejor formación de hábito) y después se ofrece cambiar a la vista libre (“¿prefieres verlo todo de una vez?”).

**Justificación:** resuelve la duplicación, respeta ambos requisitos del briefing, reduce el coste de desarrollo (un modelo de datos, dos presentaciones) y aporta una progresión natural: el novato necesita andamios, el veterano necesita velocidad.

## 4.7 Estados globales del sistema

| Estado                            | Definición                     | Efecto en la app                                                                       |
|:----------------------------------|:-------------------------------|:---------------------------------------------------------------------------------------|
| `PRIMER_USO`                      | Sin onboarding completado      | Solo onboarding; el resto de la app es inaccesible                                     |
| `ACTIVO`                          | Registro en los últimos 2 días | Comportamiento estándar                                                                |
| `EN_PAUSA`                        | 3–13 días sin registro         | Notificaciones reducidas a 1/día, copy de acompañamiento suave                         |
| `AUSENTE`                         | 14–59 días sin registro        | Máximo 1 notificación cada 5 días; al volver, se activa el Estado de Regreso           |
| `DORMIDO`                         | 60+ días sin registro          | Sin notificaciones salvo 1 mensual; al volver, se activa el Estado de Regreso ampliado |
| `DIA_DIFICIL`                     | El usuario lo marcó hoy        | Experiencia reducida, cero celebraciones, copy compasivo                               |
| `SIN_CONEXION`                    | Sin red                        | Escritura local completa, sincronización diferida, IA no disponible                    |
| `PREMIUM` / `GRATUITO` / `PRUEBA` | Estado de suscripción          | Control de acceso a Insights avanzados, Descubre, Libro de Vida                        |
| `MODO_PRIVADO`                    | Bloqueo biométrico activo      | Contenido oculto en multitarea; requiere autenticación al abrir                        |

**Regla:** ningún estado del usuario se comunica con lenguaje negativo. `AUSENTE` nunca se muestra como “inactivo” o “abandonado”.

## 4.8 Máquina de estados del registro diario (`DailyEntry`)

            [NO_INICIADO]
                  │ primera escritura o marca
                  ▼
             [EN_CURSO] ──────────────────┐
                  │ cierre del ritual      │ el día cambia
                  ▼                        ▼
          [CERRADO_HOY]              [CERRADO_AUTO]
                  │                        │
                  └──── editable 7 días ───┘
                              │
                              ▼
                        [ARCHIVADO]

- Un día **nunca** se marca como “incompleto” o “fallido”. Los estados posibles son: no iniciado, en curso, cerrado.
- La entrada es **editable durante 7 días naturales**. Después pasa a solo lectura, con la opción “Añadir algo más” que crea una nota anexa fechada, preservando la integridad del recuerdo original.
- **Justificación de los 7 días:** permite recuperar un día olvidado (uso real habitual) sin convertir el historial en algo reescribible indefinidamente, lo que erosionaría el valor documental del archivo.

## 4.9 Permisos del sistema operativo

| Permiso                      | Cuándo se pide                                                                                            | Cómo se pide                                                             | Si se deniega                                                                |
|:-----------------------------|:----------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------|:-----------------------------------------------------------------------------|
| Notificaciones               | **Nunca al abrir.** Se pide al final del onboarding, tras explicar el valor y proponer horarios concretos | Pantalla de pre-permiso propia con ejemplo real del mensaje que recibirá | La app funciona igual; se ofrece recordatorio de calendario como alternativa |
| Biométrico                   | Al activar el bloqueo en Ajustes                                                                          | Directo                                                                  | Se ofrece PIN de 4 dígitos                                                   |
| Cámara / Fotos               | Al adjuntar imagen en Journal (V2)                                                                        | En el momento de la acción                                               | Solo texto                                                                   |
| Micrófono                    | Al usar dictado o entrada de voz (V2)                                                                     | En el momento                                                            | Solo texto                                                                   |
| Salud (HealthKit/Google Fit) | Solo si el usuario activa la integración (V3)                                                             | Explicando exactamente qué se leerá y por qué                            | Sin efecto en el resto                                                       |

**Regla de permisos:** nunca se pide un permiso antes de que el usuario haya experimentado el valor asociado. Un permiso pedido en frío es un permiso denegado.

## 4.11 Diagrama de flujo de datos (visión funcional)

    [Onboarding] ──► Identidad central + Áreas (+ identidades de área),
                     horarios, hábitos, preferencias
                              │
                              ▼
          ┌──────── Configuración del usuario ────────┐
          │  (las Áreas etiquetan hábitos y victorias  │
          │   y permiten Insights por área)            │
          │                                            │
          ▼                                            ▼
    [Ritual Mañana] ─► DailyEntry.mañana        [Motor de Recordatorios]
          │                    │                        ▲
          │  victorias         │                        │ señales de uso
          ▼                    ▼                        │
    [Ritual Noche] ──► DailyEntry.noche ────────────────┤
          │                    │                        │
          │                    ▼                        │
    [Journal] ─────────► JournalEntry                   │
                              │                         │
                              ▼                         │
                       [Motor de Insights] ─────────────┘
                              │
                              ▼
                  Resúmenes, patrones, recuerdos

## 4.12 Reglas de negocio transversales

- **RN-01** Un día es la ventana 00:00–23:59 en la zona horaria del dispositivo, salvo que el usuario active “Mi día termina a las 3:00” (opción para noctámbulos, ver §5.5). Este ajuste es una petición real y frecuente de este tipo de productos.
- **RN-02** Todo dato escrito se persiste localmente **antes** de intentar sincronizar. Sin excepción.
- **RN-03** Ningún contenido escrito por el usuario se elimina jamás por una acción automática del sistema.
- **RN-04** Ningún módulo puede mostrar el número de días consecutivos como métrica destacada.
- **RN-05** Toda métrica visible debe ser monótona creciente o neutra. Ninguna baja.
- **RN-06** Las celebraciones se limitan por frecuencia (§3.11) y por estado emocional.
- **RN-07** Ninguna funcionalidad de IA puede activarse sin consentimiento explícito registrado (§7.9).
- **RN-08** Los pop-ups de Ritual aparecen como máximo **una vez al día por ritual** y nunca si ya fue completado.
- **RN-09** Cualquier pantalla que pida algo al usuario debe ofrecer una salida sin coste emocional.
- **RN-10** La app nunca solicita valoración en la tienda dentro de los primeros 21 días, ni jamás en un contexto emocional negativo. Se solicita únicamente después de una celebración de nivel 3.

# Capítulo 12 — Sistema de diseño

\[REUBICADO DE CAPÍTULO 6 — v3.1\] — íntegro salvo **§6.3.7** (tokens de contraste por superficie), reubicada al Capítulo 1 por ser capa compartida.

> **Precedencia con el manual de marca.** Este capítulo especifica **comportamiento**: componentes, estados, motion, haptics, sonido, accesibilidad y responsive. La **especificación visual** (paletas por marca y momento, símbolos, wordmarks, tipografía y escala) vive en `BRAND_MANUAL_STRIVO_LUMIA_FORMIA.md` y **manda sobre este capítulo** en todo lo relativo a color y tipografía (§C0.6). Las paletas de §6.3 se conservan como historia de la decisión y como referencia de los tokens ya implementados en Fase 0.

## 6.1 Principios visuales

1.  **La luz es el material principal.** Strivo no se construye con cajas y bordes, sino con luz: degradados, halos y elevaciones suaves. La metáfora es una habitación con la lámpara encendida, no una hoja de cálculo.
2.  **El tiempo es visible.** La interfaz cambia con la hora del día. Es el único producto de la categoría donde abrir la app a las 7:00 y a las 23:00 se ve distinto de forma sustancial. **Esta es la firma visual de Strivo.**
3.  **Curvatura generosa.** Radios grandes (16–28 px). Nada punzante. Ninguna esquina viva en elementos que contienen texto del usuario.
4.  **Contraste tipográfico, no cromático.** La jerarquía se construye con tamaño, peso y espacio, no con muchos colores.
5.  **Un solo acento por pantalla.** Como máximo dos.
6.  **El vacío es contenido.** El espacio negativo es lo que produce la sensación de calma; recortarlo para meter una función más es la forma más rápida de destruir el producto.
7.  **Nada grita.** Sin rojos de alarma, sin badges numéricos, sin sombras duras, sin animaciones rápidas.

## 6.2 Dirección de arte: “Amanecer en una habitación”

La paleta y la tipografía se derivan de un referente concreto: **la luz que entra por una ventana a distintas horas del día en una habitación de paredes cálidas**. No de la estética genérica de “app de bienestar” (crema + terracota + serif de alto contraste), que hoy es indistinguible entre productos.

**Riesgo estético asumido y justificado:** el fondo nocturno no es negro ni gris azulado neutro, sino un **índigo violáceo profundo** (#191428). Es una decisión arriesgada porque se aleja del “modo oscuro” convencional, pero es exactamente lo que hace que la app se sienta como un espacio y no como una interfaz apagada. Además reduce la percepción de brillo agresivo en uso nocturno en cama, el escenario real de la persona primaria.

## 6.3 Color

### 6.3.1 Paleta base

| Token                     | Hex       | Uso                           |
|:--------------------------|:----------|:------------------------------|
| `--color-ink`             | `#241E33` | Texto principal en modo claro |
| `--color-ink-soft`        | `#5B5470` | Texto secundario claro        |
| `--color-ink-faint`       | `#8E88A0` | Texto terciario, ayudas       |
| `--color-paper`           | `#FBF8F4` | Fondo claro                   |
| `--color-paper-raised`    | `#FFFFFF` | Superficies elevadas claras   |
| `--color-night`           | `#191428` | Fondo oscuro                  |
| `--color-night-raised`    | `#231C36` | Superficies elevadas oscuras  |
| `--color-night-text`      | `#F2EEF7` | Texto principal oscuro        |
| `--color-night-text-soft` | `#B4ACC6` | Texto secundario oscuro       |

### 6.3.2 Acentos

| Token            | Hex       | Significado                      |
|:-----------------|:----------|:---------------------------------|
| `--accent-amber` | `#E5A25C` | Mañana, energía, logros          |
| `--accent-plum`  | `#8B6BA8` | Noche, introspección, insights   |
| `--accent-sage`  | `#7E9E86` | Hábitos, constancia, crecimiento |
| `--accent-clay`  | `#C9836B` | Gratitud, calidez humana         |
| `--accent-mist`  | `#93A9C4` | Calma, estados neutros           |

**Regla:** cada módulo tiene un acento asignado y no usa los demás salvo en iconografía compartida. Diario = ámbar (mañana) / ciruela (noche). Hábitos = salvia. Journal = niebla. Insights = ciruela. Gratitud = arcilla.

### 6.3.3 Degradados horarios (la firma del producto)

| Franja    | Parada 1  | Parada 2  | Parada 3  |
|:----------|:----------|:----------|:----------|
| Amanecer  | `#F5C99B` | `#E8A6A0` | `#C8A2C8` |
| Día       | `#FBF8F4` | `#F3EDE6` | `#EAE3DD` |
| Atardecer | `#E9A177` | `#B4749A` | `#6B5B8E` |
| Noche     | `#2C2246` | `#1F1834` | `#191428` |
| Madrugada | `#141020` | `#191428` | `#1B1730` |

Ángulo: 165°. Animación de deriva: desplazamiento del 4 % del punto central en un ciclo de 30 s, con curva sinusoidal. **Se desactiva por completo con “reducir movimiento”.**

### 6.3.4 Colores de estado

| Estado                  | Token            | Hex       | Nota                                   |
|:------------------------|:-----------------|:----------|:---------------------------------------|
| Positivo / completado   | `--state-done`   | `#7E9E86` | Nunca verde brillante                  |
| Información             | `--state-info`   | `#93A9C4` |                                        |
| Atención (solo sistema) | `--state-warn`   | `#D9A441` | Nunca para conducta del usuario        |
| Destructivo             | `--state-danger` | `#B4544A` | **Exclusivo** para borrar cuenta/datos |

**Regla absoluta:** `--state-danger` no puede usarse en ninguna pantalla de Diario, Hábitos, Rituales, Insights o Journal.

### 6.3.5 Paleta de ánimo (5 estados)

Agotado `#7A7290` · Inquieto `#9B86A8` · Normal `#A9A2B8` · Tranquilo `#93A9C4` · En paz `#7E9E86`.

Deliberadamente **no** va de rojo a verde: eso convertiría el ánimo en una calificación. La escala va de frío-apagado a fresco-luminoso, sin connotación de éxito o fracaso.

### 6.3.6 Contraste

Texto de cuerpo: mínimo **7:1** (AAA). Texto secundario: mínimo 4,5:1. Elementos interactivos: 3:1 contra el fondo adyacente. **El degradado se verifica en sus tres paradas**, no solo en el color medio.

### 6.3.8 Tokens de la pantalla Hoy: mañana y noche \[ACTUALIZADO EN BLOQUE 03\]

| Token                      | Composición                                       | Superficie                     |
|:---------------------------|:--------------------------------------------------|:-------------------------------|
| `--hoy-manana-bg`          | Degradado 165°: `#F5C99B` → `#E8A6A0` → `#C8A2C8` | `light`                        |
| `--hoy-noche-bg`           | Degradado 165°: `#2C2246` → `#1F1834` → `#191428` | `dark`                         |
| `--hoy-manana-card`        | `rgba(255,255,255,.62)` sobre el degradado        | Tarjeta de ritual, tema mañana |
| `--hoy-noche-card`         | `rgba(255,255,255,.10)` sobre el degradado        | Tarjeta de ritual, tema noche  |
| `--hoy-manana-card-border` | `rgba(36,30,51,.10)`                              | Borde de tarjeta, tema mañana  |
| `--hoy-noche-card-border`  | `rgba(242,238,247,.18)`                           | Borde de tarjeta, tema noche   |

- Los fondos reutilizan las paradas de **Amanecer** y **Noche** de §6.3.3. **Los cinco degradados horarios siguen siendo tokens vigentes del sistema**; lo que cambia es que la pantalla Hoy ya no los selecciona por hora (§5.2.1).
- Las tarjetas de ritual se separan del fondo **por luminancia**, no solo por borde: es el requisito RN-HOY-07.
- La deriva ambiental del degradado (ciclo de 30 s, §6.3.3) se mantiene dentro del tema activo.

### 6.3.9 Acento de respiración \[ACTUALIZADO EN BLOQUE 05\]

| Token                 | Hex                    | Uso                                              |
|:----------------------|:-----------------------|:-------------------------------------------------|
| `--color-breath`      | `#E8A54A`              | Círculo del ejercicio de respiración de P1       |
| `--color-breath-halo` | `rgba(232,165,74,.35)` | Halo desenfocado del círculo en inhalación plena |

- Es un naranja/dorado deliberadamente más saturado que `--accent-amber` (`#E5A25C`): tiene que **destacar sobre el degradado de amanecer**, que ya es cálido. Usar el ámbar del sistema fue precisamente el origen del defecto que el Bloque 05 corrige (círculo invisible).
- Contraste mínimo exigido frente al fondo adyacente: **3:1**, verificado en las tres paradas del degradado de amanecer.
- **Uso exclusivo:** este token no se usa en ningún otro componente de la aplicación.

### 6.3.10 Tarjetas de sección del Journal \[ACTUALIZADO EN BLOQUE 06\]

| Token                         | Hex                                    | Uso                                        |
|:------------------------------|:---------------------------------------|:-------------------------------------------|
| `--journal-card-warm`         | `#F3E7D8`                              | Tarjeta “¿Cómo me siento?” — arena / beige |
| `--journal-card-warm-border`  | `#E4D2BC`                              | Borde de la tarjeta cálida                 |
| `--journal-card-cool`         | `#E4EDF5`                              | Tarjeta “Mi diario de hoy” — azul claro    |
| `--journal-card-cool-border`  | `#CBDCE9`                              | Borde de la tarjeta fría                   |
| `--journal-chip-other-border` | `dashed 1,5 px` sobre `--color-border` | Chip “+ Otra” (borde punteado)             |

- Ambas tarjetas son superficies **claras**: declaran `data-surface="light"` y su texto hereda `--color-text-on-light` (§6.3.7).
- El contraste cálido/frío es funcional, no decorativo: separa “lo que siento” de “lo que escribo” sin necesidad de líneas ni títulos pesados.
- En modo oscuro, ambas tarjetas se sustituyen por sus equivalentes desaturados de la paleta nocturna, conservando el contraste relativo cálido/frío entre ellas (§6.13).

## 6.4 Tipografía

### 6.4.1 Familias

| Rol                   | Familia                                          | Justificación                                                                                                                                                                                                                                |
|:----------------------|:-------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Display**           | **Fraunces** (variable, ejes `wght` y `SOFT`)    | Serif contemporánea de formas suaves y ligeramente humanas. Aporta calidez y carácter sin la frialdad editorial de las serifs de alto contraste. Se usa **con moderación**: saludos, frases del día, encabezados de bloque y cifras de hito. |
| **Cuerpo / interfaz** | **Satoshi** (o *system-ui* como reserva)         | Sans geométrica-humanista con excelente legibilidad en tamaños pequeños y en modo oscuro. Neutral sin ser anónima.                                                                                                                           |
| **Texto del usuario** | Satoshi, 18 px, interlineado 1,65, `--color-ink` | El texto escrito por la persona se compone con más aire que el resto de la interfaz. **Decisión deliberada: las palabras del usuario reciben mejor tipografía que las de la app.**                                                           |
| **Datos**             | Fraunces con numerales tabulares                 | Para cifras de constancia e hitos; les da peso de “documento”, no de panel.                                                                                                                                                                  |

### 6.4.2 Escala tipográfica (base 16 px, razón 1,25)

| Token        | Tamaño | Interlineado | Peso           | Uso                           |
|:-------------|:-------|:-------------|:---------------|:------------------------------|
| `display-xl` | 40 px  | 44 px        | 500 (SOFT 100) | Cifras de hito, resumen anual |
| `display-l`  | 32 px  | 38 px        | 500            | Saludo principal              |
| `display-m`  | 26 px  | 32 px        | 500            | Encabezado de ritual          |
| `title`      | 20 px  | 26 px        | 600            | Encabezado de bloque          |
| `body-l`     | 18 px  | 30 px        | 400            | Texto del usuario             |
| `body`       | 16 px  | 26 px        | 400            | Texto de interfaz             |
| `body-s`     | 14 px  | 20 px        | 400            | Secundario                    |
| `caption`    | 13 px  | 18 px        | 500            | Etiquetas, fechas             |
| `micro`      | 11 px  | 14 px        | 600, +0,06em   | Etiquetas de categoría        |

**Reglas:** máximo tres niveles visibles por pantalla · nunca texto por debajo de 13 px salvo `micro` · nunca mayúsculas completas en frases · longitud de línea entre 45 y 72 caracteres.

## 6.5 Espaciado y retícula

Escala de 4 px: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-5` 24 · `space-6` 32 · `space-7` 48 · `space-8` 64 · `space-9` 96.

- **Margen lateral de pantalla:** 20 px (móvil pequeño), 24 px (estándar), 32 px (tableta).
- **Separación entre bloques del Diario:** `space-7` (48 px). Este valor alto es intencional: es lo que hace que la vista respire y no parezca un formulario.
- **Separación interna de tarjetas:** `space-5` (24 px).
- **Retícula:** columna única en móvil; dos columnas a partir de 720 px; contenido con ancho máximo de 680 px siempre centrado. **No se usa una retícula de 12 columnas**: el producto es de lectura y escritura, no de composición densa.

## 6.6 Radios y elevación

| Token         | Valor  | Uso                              |
|:--------------|:-------|:---------------------------------|
| `radius-s`    | 10 px  | Chips, etiquetas                 |
| `radius-m`    | 16 px  | Campos, botones                  |
| `radius-l`    | 24 px  | Tarjetas                         |
| `radius-xl`   | 32 px  | Hojas modales, pop-ups de ritual |
| `radius-full` | 999 px | Avatares, anillo de constancia   |

**Elevación** (nunca sombras duras; siempre difusas y de baja opacidad):

| Nivel       | Modo claro                                                      | Modo oscuro                            |
|:------------|:----------------------------------------------------------------|:---------------------------------------|
| 0           | ninguna                                                         | ninguna                                |
| 1           | `0 1px 2px rgba(36,30,51,.04), 0 4px 12px rgba(36,30,51,.05)`   | borde superior `rgba(255,255,255,.05)` |
| 2           | `0 2px 6px rgba(36,30,51,.06), 0 12px 28px rgba(36,30,51,.07)`  | superficie más clara + borde           |
| 3 (modales) | `0 8px 20px rgba(36,30,51,.10), 0 24px 60px rgba(36,30,51,.12)` | desenfoque de fondo 20 px              |

**En modo oscuro la elevación se expresa con luminosidad y no con sombra**, porque las sombras sobre índigo profundo se leen como suciedad.

## 6.7 Iconografía

- Trazo de 1,75 px, extremos redondeados, retícula de 24 px, esquinas de radio 2 px.
- **Estilo:** lineal con relleno tenue opcional en estado activo. Nunca íconos rellenos sólidos.
- **Íconos propios obligatorios** (no de librería genérica): sol naciente, luna, anillo de constancia, pluma, hoja, ancla, corazón abierto, y los 16 íconos de emoción.
- Las 16 emociones tienen ilustración propia de estilo unificado: formas orgánicas abstractas, no caras. **Justificación:** las caras imponen una expresión concreta y excluyen matices; las formas abstractas permiten proyección.

## 6.8 Componentes

### Botón

- **Primario:** altura 56 px, radio 16, ancho completo, fondo con degradado sutil del acento del módulo, texto 17 px peso 600. Estados: reposo, presionado (escala 0,98 + oscurecimiento 6 %), deshabilitado (opacidad 0,4, **sin gris muerto**), cargando (punto pulsante, sin girador).
- **Secundario:** texto sobre transparente con borde de 1 px al 20 % del acento.
- **Terciario / enlace:** solo texto subrayado sutil.
- **Regla:** una sola acción primaria por pantalla.

### Tarjeta

Radio 24, elevación 1, relleno 24, fondo `paper-raised` / `night-raised`. Variantes: acción (con botón), contenido (con extracto), insight (con cita), hito (a pantalla completa).

### Campo de texto

- Sin caja visible: **línea inferior de 1 px** que se ilumina al enfocar (transición de color en 200 ms), etiqueta persistente encima en `caption`.
- Altura mínima 48 px; crecimiento automático en campos multilínea.
- Cursor con el color del acento del módulo.
- **Sin contador de caracteres. Sin borde rojo de validación** (los campos de Strivo no se validan: nunca hay contenido “incorrecto”).

### Fila dinámica (componente propio de Strivo)

Compuesta por: botón de emoji (32 px), campo de texto, y acción de eliminar oculta tras deslizamiento. Especificación de comportamiento en §5.3, bloque 2. **Es el componente más importante del producto y debe tener su propia batería de pruebas.**

### Tarjeta de emoción

88 × 88 px mínimo, radio 20, ícono 32 px arriba, etiqueta debajo en `body-s`. Estados: sin seleccionar (borde 1 px al 12 %), seleccionada (fondo del acento al 12 %, borde al 40 %, elevación 1, ícono a color).

### Casilla de hábito

Círculo de 28 px con trazo de 1,75 px. Al marcar: el trazo del tic se dibuja en 260 ms (animación de trazado, no de opacidad) y el círculo se rellena con el acento salvia. **Nunca hay una X para el estado no marcado.**

### Chip

Altura 34 px, radio 10, relleno horizontal 14. Estados: normal, seleccionado (fondo del acento al 15 %), deshabilitado.

### Interruptor

Pista de 52 × 32, pomo de 26. Encendido = acento del módulo. Transición 220 ms con ligero rebote (overshoot del 6 %).

### Barra de progreso

Altura 4 px, radio completo, fondo al 10 %, relleno con degradado del acento. **Nunca muestra porcentaje numérico como elemento principal.**

### Anillo de constancia

Diámetro 120 px, grosor 8, degradado ámbar→salvia, con marcas discretas en los hitos. Se anima al entrar (llenado en 1.200 ms con desaceleración). **Solo crece.**

### Hoja modal (bottom sheet)

Radio superior 32, arrastrable para cerrar, fondo desenfocado 20 px, elevación 3. Usada para: detalle de hábito, selector de emoji, opciones de victoria.

### Pop-up de ritual

Pantalla completa con degradado horario. No es una hoja modal: es un cambio de contexto. Entrada desde abajo con desenfoque del fondo en 400 ms.

## 6.9 Estados de los componentes

Todo componente interactivo define seis estados: **reposo, foco (anillo de 2 px del acento al 60 %, siempre visible con teclado), presionado, seleccionado, deshabilitado, cargando.** El estado de error **no existe** para contenido del usuario; solo para operaciones del sistema.

## 6.10 Motion design

### Principios

1.  **Todo movimiento tiene origen y destino.** Nada aparece de la nada.
2.  **Curvas suaves:** entrada `cubic-bezier(.22,.61,.36,1)`, salida `cubic-bezier(.4,0,.2,1)`, énfasis `cubic-bezier(.34,1.2,.64,1)` (rebote muy contenido).
3.  **Duraciones más lentas que la media del sector** (§1.5.5).

### Tokens de duración

| Token         | ms     | Uso                                   |
|:--------------|:-------|:--------------------------------------|
| `dur-instant` | 120    | Cambio de color, foco                 |
| `dur-fast`    | 180    | Presionado, chips                     |
| `dur-base`    | 260    | Casillas, filas nuevas                |
| `dur-slow`    | 400    | Transiciones de bloque, hojas modales |
| `dur-scene`   | 900    | Cierre del día, transición luminosa   |
| `dur-ambient` | 30.000 | Deriva del degradado                  |

### Animaciones firmadas

- **Luz de cierre:** un punto luminoso se expande desde el centro con desenfoque creciente y opacidad decreciente. 900 ms. Solo al cerrar el día. **Nunca se reutiliza en otro contexto**: su valor está en su exclusividad.
- **Respiración:** círculo que escala 1,0 → 1,18 → 1,0 en 8 s. Solo en la entrada de los rituales.
- **Trazado del tic:** dibujo real del trazo, no aparición.
- **Recorrido de la barra:** un destello recorre la barra de progreso al completarse.

### Reducir movimiento

Con la preferencia del sistema activada: sin deriva de degradado, sin respiración (se sustituye por texto), sin escalonados de entrada, transiciones reducidas a desvanecimientos de 120 ms. **La funcionalidad nunca depende de una animación.**

### 6.10.1 Motion actualizado en Fase 0 \[ACTUALIZADO EN BLOQUES 03 y 05\]

#### Token nuevo de duración

| Token       | ms      | Uso                                                                          |
|:------------|:--------|:-----------------------------------------------------------------------------|
| `dur-theme` | **320** | Cross-fade entre el tema de mañana y el de noche en la pantalla Hoy (§5.2.1) |

Se sitúa deliberadamente entre `dur-base` (260) y `dur-slow` (400): un cambio de tema completo necesita más tiempo que una casilla y menos que una hoja modal. Con `prefers-reduced-motion`, el cambio es **inmediato** (0 ms), sin estado intermedio.

#### Animación firmada actualizada: Respiración

El catálogo de animaciones firmadas de §6.10 define la respiración como *“círculo que escala 1,0 → 1,18 → 1,0 en 8 s”*. **Esa definición se conserva para R1** (entrada a los rituales, §5.5.1). Se añade una segunda variante, exclusiva del onboarding:

| Variante                       | Dónde                           | Ciclo                                | Escala                               | Sonido           |
|:-------------------------------|:--------------------------------|:-------------------------------------|:-------------------------------------|:-----------------|
| **Respiración corta**          | R1, entrada al Ritual de Mañana | 4 s + 4 s = 8 s, un ciclo            | 1,0 → 1,18 → 1,0                     | No               |
| **Respiración guiada (5-5-3)** | P1, onboarding (§5.1.2)         | 5 s + 5 s + 3 s = **13 s** por ciclo | 1,0 → 1,18 → 1,0, con pausa estática | **Sí** (§6.12.1) |

- La coexistencia de dos ritmos es una inconsistencia **declarada y registrada** como decisión abierta (Capítulo 10), no un descuido.
- **Excepción a la regla de reducir movimiento.** §6.10 establece que con la preferencia activada las transiciones se reducen a desvanecimientos de 120 ms y la respiración *“se sustituye por texto”*. Para la respiración guiada de P1 la regla se aplica de otro modo, y esta es la formulación vigente:
- **No hay cambio de escala.** El ciclo se comunica **solo con opacidad**, más el copy de fase.
- **Las duraciones se mantienen: 5-5-3.** La duración no es una animación: **es el ejercicio**. Acortarla no reduce el movimiento, elimina el contenido terapéutico.
- El resto de la regla general (sin deriva de degradado, sin escalonados de entrada) se aplica sin cambios.

## 6.11 Haptics

| Evento                   | Patrón                                     |
|:-------------------------|:-------------------------------------------|
| Marcar hábito / victoria | Ligero (impacto suave)                     |
| Seleccionar emoción      | Ligero                                     |
| Completar un ritual      | Doble ligero separado 80 ms                |
| Hito de celebración      | Patrón cálido de 3 pulsos ascendentes      |
| Error de sistema         | Ninguno. **Strivo no vibra ante errores.** |
| Eliminar                 | Ligero al confirmar                        |

Configurable en Ajustes; respeta la configuración del sistema.

## 6.12 Sonido

- **Silencio por defecto.** Todos los sonidos están desactivados en la instalación.
- Si el usuario los activa: paleta de 4 sonidos propios, grabados o sintetizados con tonos cálidos y sin ataque brusco: *marca* (200 ms), *cierre de día* (1,4 s), *hito* (2 s), *inicio de respiración* (600 ms).
- Nunca hay sonido de error, de notificación dentro de la app ni de tecleo.
- **Justificación:** el escenario de uso nocturno con pareja durmiendo hace del sonido por defecto un riesgo de desinstalación inmediata.

### 6.12.1 Audio generativo del ejercicio de respiración \[ACTUALIZADO EN BLOQUE 05\]

§6.12 establece **silencio por defecto** y una paleta de cuatro sonidos propios, entre ellos *“inicio de respiración (600 ms)”*. El Bloque 05 introduce el primer audio **continuo y sincronizado** del producto, y lo hace **sin añadir un solo archivo de audio**.

#### Arquitectura

- **Generado en tiempo real con la Web Audio API.** Osciladores y envolventes de ganancia; sin `.mp3`, sin `.wav`, sin descarga adicional, sin latencia de carga.
- **Sincronización por construcción:** el mismo reloj que gobierna la animación gobierna la envolvente del tono. No hay dos temporizadores que puedan desfasarse.
- **Perfil sonoro:** tono suave con ataque y caída largos, sin transitorios bruscos, coherente con la voz del producto.
- **Inhalación (5 s):** barrido **ascendente** de frecuencia, con la ganancia subiendo desde el silencio.
- **Exhalación (5 s):** barrido **descendente**, con la ganancia bajando hasta el silencio.
- **Pausa (3 s):** **silencio real** (ganancia en cero), no un tono sostenido de fondo.
- **Ganancia máxima contenida.** El escenario de referencia sigue siendo el del §6.12: alguien en la cama con su pareja durmiendo al lado.

#### Reglas duras

- **RN-AUD-01** **Nunca se reproduce sonido sin un gesto previo del usuario.** El contexto de audio se crea y se reanuda dentro del manejador del gesto que inicia el ejercicio. Esto no es solo una restricción de los navegadores: es la regla del producto.
- **RN-AUD-02** **Control de silencio visible** en la propia pantalla del ejercicio (icono de altavoz), alcanzable en un toque y operable con teclado, con estado expuesto al lector de pantalla (`aria-pressed`).
- **RN-AUD-03** **La preferencia se persiste** en `AppPreferences.sonidoRespiracion` (§7.2) y es la misma que el ajuste de Perfil (§5.12.1). Silenciar una vez silencia para siempre, hasta que el usuario decida lo contrario.
- **RN-AUD-04** **Limpieza completa al salir.** Al desmontar la pantalla: osciladores detenidos, nodos desconectados, contexto de audio cerrado, temporizadores cancelados. **No puede quedar audio sonando ni un contexto activo tras abandonar el ejercicio.** Una fuga de audio en un producto de calma es un fallo grave, no una imperfección.
- **RN-AUD-05** El sonido **nunca sustituye** a una señal visual: el ejercicio es completamente utilizable en silencio.
- **RN-AUD-06** Sigue prohibido todo sonido de error, de notificación dentro de la app y de tecleo (§6.12, sin cambios).

#### Decisión abierta

Si el sonido debe llegar **activado o silenciado por defecto** en el ejercicio de P1 es una **decisión abierta** (Capítulo 10). §6.12 establece silencio por defecto para toda la aplicación; el ejercicio de P1 es el único punto donde el sonido forma parte del contenido y no es un adorno, lo que justifica plantear la excepción. **Comportamiento vigente mientras no se confirme: se respeta §6.12 y el sonido arranca silenciado, con el control de altavoz visible desde el primer segundo.**

## 6.13 Modo claro y oscuro

- **Automático por defecto**, siguiendo el sistema, con dos opciones adicionales: siempre claro, siempre oscuro.
- **Tercera opción propia: “Sigue mi día”** — claro durante el día, oscuro a partir del atardecer declarado, independientemente del sistema. Coherente con la firma del producto.
- El modo oscuro **no es una inversión**: tiene su propia paleta, sus propias elevaciones y sus propios degradados. Los acentos se desaturan un 12 % y se aclaran un 8 % para no vibrar sobre índigo.
- **Modo noche profunda (opcional):** reduce el brillo máximo, elimina los blancos puros y baja el contraste de elementos no textuales. Para uso en cama a oscuras.

## 6.14 Accesibilidad

- **Objetivo:** WCAG 2.2 AA completo; AAA en contraste de texto de cuerpo.
- **Texto escalable hasta 200 %** sin pérdida de contenido ni de funcionalidad. Todas las pantallas se prueban a 100 %, 150 % y 200 %.
- **Áreas táctiles ≥ 48 × 48 dp**, con separación mínima de 8 px.
- **Lectores de pantalla:** cada bloque es una región etiquetada; los estados se anuncian con lenguaje del producto (“completado”, nunca “checked”); el orden de foco sigue el orden visual; los modales atrapan el foco y lo devuelven al cerrarse.
- **Daltonismo:** ninguna información se transmite solo por color. Los estados de ánimo llevan siempre etiqueta textual; los hábitos, forma además de color.
- **Movimiento y parpadeo:** nada parpadea más de 3 veces por segundo; se respeta “reducir movimiento” y “reducir transparencia”.
- **Motricidad:** todos los gestos de deslizamiento tienen alternativa por botón o menú.
- **Cognitiva:** lenguaje llano, una acción por pantalla en los rituales, sin límites de tiempo en ninguna interacción, posibilidad de deshacer.

## 6.15 Diseño responsive

| Punto de ruptura             | Adaptación                                                                                                                                     |
|:-----------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------|
| \< 360 px                    | Márgenes 16 px, tarjetas de emoción a 3 por fila, escala tipográfica reducida un 6 %                                                           |
| 360–719 px (referencia)      | Diseño base descrito en este documento                                                                                                         |
| 720–1023 px (tableta)        | Contenido centrado a 680 px máximo; Diario en dos columnas en horizontal; navegación lateral opcional                                          |
| ≥ 1024 px (escritorio / PWA) | Barra lateral izquierda en lugar de barra inferior; contenido a 720 px máximo centrado; **nunca se ensancha el texto para llenar la pantalla** |

**Regla:** en pantallas grandes, Strivo no crece: se centra. La sensación de intimidad depende de que el contenido nunca se disperse.

## 6.16 Tono visual de las ilustraciones

- Formas orgánicas abstractas, degradados suaves, sin contornos duros, sin personajes, **sin mascota**.
- Paleta limitada a dos acentos por ilustración.
- Uso restringido: onboarding (3), estados vacíos (5), celebraciones (6), estado de regreso (1).
- **Justificación de “sin mascota”:** el vínculo con una mascota genera culpa por descuido (ver análisis de Finch en §1.9), y la estética infantil excluye al público adulto profesional que es el segmento primario.

# Capítulo 13 — Arquitectura técnica

\[REUBICADO DE CAPÍTULO 7 — v3.1\] — íntegro salvo **§7.7.1** (PIN del Journal), reubicada a Lumia junto al módulo al que sirve.

> **Precedencia del modelo de datos.** **§7.2, §7.3 y §7.4 se conservan aquí como referencia de campos, relaciones y notación**, pero la fuente de verdad sobre **dónde vive cada dato** es el **Capítulo 5** (`shared/` · `lumia/` · `formia/`). La tabla de equivalencia entre ambos está en §C5.6.

*Este capítulo define estructura, contratos y políticas. No contiene código.*

## 7.1 Visión general

**Arquitectura recomendada: local-first con sincronización.**

- La aplicación es **la fuente de verdad para el usuario en su dispositivo**; el servidor es un espejo cifrado y un motor de procesos que no caben en el dispositivo (IA, notificaciones programadas, respaldo).
- Toda escritura se persiste localmente **antes** de cualquier intento de red (RN-02).
- El producto debe ser completamente funcional sin conexión, indefinidamente.

**Justificación:** en un producto de escritura íntima, la latencia y la pérdida de datos son fallos catastróficos de confianza. Local-first elimina ambos riesgos, mejora la percepción de velocidad (todo es instantáneo) y reduce coste de infraestructura, algo crítico para un equipo de dos personas.

**Capas:**

    ┌─────────────────────────────────────────┐
    │  Interfaz (PWA instalable → nativa)     │
    ├─────────────────────────────────────────┤
    │  Lógica de dominio                      │
    │  (rituales, herencia de victorias,      │
    │   reglas de copy, estados globales)     │
    ├─────────────────────────────────────────┤
    │  Almacén local (IndexedDB / SQLite)     │
    │  + cola de sincronización               │
    ├─────────────────────────────────────────┤
    │  Cliente de sincronización              │
    ├──────────────┬──────────────────────────┤
    │  API         │  Servicios               │
    │  autenticada │  · notificaciones        │
    │              │  · motor de insights     │
    │              │  · IA (proveedor LLM)    │
    │              │  · pagos                 │
    │              │  · analítica             │
    └──────────────┴──────────────────────────┘

## 7.2 Modelo de datos — entidades

Notación: `campo: tipo` · `?` opcional · `[]` colección.

### User

    id: uuid
    nombre: string
    correo?: string
    proveedorAuth: enum(apple, google, email, ninguno)
    zonaHoraria: string (IANA)
    idioma: string
    creadoEn: timestamp
    estadoSuscripcion: enum(gratuito, prueba, activo, cancelado, caducado)
    finPrueba?: timestamp

### UserProfile

    userId: uuid
    identidadCentral: string          // "alguien que crece" — SIEMPRE existe, una sola
    identidadCentralHistorial: [{texto, desde, hasta}]
    objetivoPrincipal?: string
    motivos: [enum]                   // de la pregunta P2
    horaDespertar: time
    horaDormir: time
    horariosVariables: boolean
    diaTerminaA: time                 // por defecto 00:00
    voz: enum(calido, directo)
    mostrarOpcionesEspirituales: boolean
    iaActivada: boolean
    consentimientoIA: {aceptado: boolean, fecha: timestamp, version: string}
    modoDiario: enum(guiado, libre)

**Nota:** las áreas ya no son un `enum` embebido en el perfil; son entidades propias con ciclo de vida (§Area). Esto permite añadirlas, editarlas, pausarlas y asociarles una identidad de área sin migrar el perfil, y es la base del modelo de §5.1.1.

### Area — nueva entidad (nivel intermedio del modelo de identidad)

    id: uuid
    userId: uuid
    tipo: enum(salud, trabajo, relaciones, finanzas, espiritual, personal, creatividad, otra)
    nombre: string                    // etiqueta mostrada; "otra" permite texto libre
    identidadArea?: string            // "alguien que cuida su cuerpo" — OPCIONAL
    identidadAreaHistorial: [{texto, desde, hasta}]
    color: token                      // acento del sistema de diseño
    icono: string
    orden: int
    estado: enum(activa, pausada, archivada)
    creadaEn: timestamp

**Área especial implícita “General”:** no es una fila; es el destino de hábitos/victorias/logros sin área asignada. Se representa con `areaId = null` y se muestra con el color y la identidad central. Garantiza que **nada quede huérfano** aunque el usuario no cree ninguna área (RN-ID-02).

### DailyEntry — entidad central

    id: uuid
    userId: uuid
    fecha: date                  // clave natural: un registro por usuario y día
    estado: enum(no_iniciado, en_curso, cerrado)
    cerradoEn?: timestamp

    manana: {
      agradecimientos: [GratitudeItem]
      emocionesDeseadas: [enum]      // máx. 3
      accionPequena?: string
      visualizacionGranDia?: string
      intencion?: string
      completadoEn?: timestamp
    }

    noche: {
      logrosNoPlaneados: [string]
      agradecimientos: [GratitudeItem]
      intentarDiferente?: string
      reflexion?: string
      preguntaReflexionUsada: string  // id de la pregunta mostrada
      animo?: enum(agotado, inquieto, normal, tranquilo, en_paz)
      matices: [enum]                 // máx. 2
      completadoEn?: timestamp
    }

    diaDificil: boolean
    fraseDelDiaId: string
    creadoEn, actualizadoEn: timestamp
    version: int                      // para sincronización

### GratitudeItem

    id: uuid
    texto: string
    emoji?: string
    orden: int
    momento: enum(manana, noche)

### Victory

    id: uuid
    userId: uuid
    fecha: date                       // día al que pertenece
    texto: string
    areaId?: uuid                     // área a la que pertenece; null = "General"
    estado: enum(pendiente, lograda, no_se_dio, soltada)
    origenId?: uuid                   // si viene de otro día (heredada)
    vecesPospuesta: int
    orden: int

**Nota:** `areaId` sustituye al antiguo `categoria`. El área *es* la categoría; una sola taxonomía. Al resolver un insight o una vista por área, `null` se agrupa bajo “General” y hereda la identidad central.

### Habit

    id: uuid
    userId: uuid
    nombre: string
    icono: string
    areaId?: uuid                     // área a la que pertenece; null = "General"
    momento: enum(manana, noche, dia)
    diasSemana: [int]                 // 0-6
    recordatorio?: time
    estado: enum(activo, pausado, archivado)
    creadoEn: timestamp
    totalCompletados: int             // desnormalizado, solo crece

**Nota:** `areaId` sustituye a `identidadAsociada`. La identidad ya no se copia en el hábito; se deriva del área (`Area.identidadArea`) para que editar la identidad de un área se refleje en todos sus hábitos sin actualizar cada uno.

### HabitLog

    id: uuid
    habitId: uuid
    fecha: date
    completado: boolean
    completadoEn: timestamp
    origen: enum(ritual_manana, ritual_noche, diario, lista)

**Nota:** no se registran los “no completados”. La ausencia de registro es la ausencia. **No existe una fila que diga “falló”.** Decisión de modelo de datos con consecuencia filosófica directa.

### JournalEntry

    id: uuid
    userId: uuid
    creadoEn: timestamp
    fechaAsignada: date
    titulo?: string
    contenido: text
    etiquetas: [string]
    animo?: enum
    privada: boolean
    adjuntos: [{tipo, url, miniatura}]   // V2

### Commitment (Compromiso)

    id: uuid
    userId: uuid
    texto: string
    duracionDias: int
    inicio: date
    estado: enum(activo, completado, pausado, terminado)

**Sin campo de “fallado”.**

### Insight

    id: uuid
    userId: uuid
    tipo: enum(...)                   // catálogo §5.9
    areaId?: uuid                     // si el insight es de un área concreta; null = global
    periodo: {desde, hasta}
    texto: string
    evidencia: [{tipo, refId, fecha}] // trazabilidad obligatoria
    generadoPor: enum(reglas, ia)
    generadoEn: timestamp
    visto: boolean
    util?: boolean                    // feedback del usuario

**Nota:** `areaId` permite generar insights por área (§5.9). Un insight de “evidencia de identidad” siempre referencia el área y su identidad de área, y su copy conecta con la identidad central.

### Streakless / Constancia

No es una entidad: es una consulta derivada — `count(distinct fecha)` de días con al menos un registro. **Al no almacenarse, es imposible que se rompa por un error de sincronización.** Decisión deliberada.

### NotificationSchedule, ContentItem, AudioItem, Subscription, ConsentRecord

Definidas en el anexo técnico; siguen el mismo patrón.

### Modelo de datos actualizado en Fase 0 \[ACTUALIZADO EN BLOQUES 01–07\]

Las entidades descritas arriba **se conservan íntegras**. Esta subsección documenta los campos añadidos o sustituidos por la implementación de Fase 0, entidad por entidad, y las dos entidades nuevas. Notación idéntica: `campo: tipo` · `?` opcional · `[]` colección.

#### UserProfile — campos añadidos \[BLOQUE 01\]

    genero: enum(m, f, n)             // NUEVO — por defecto 'n'
                                      // Único origen del copy de género (§3.6.5)
                                      // Editable siempre; retroactivo en toda la app
                                      // NO se usa para segmentar ni se envía a la IA
    areasSeleccionadas: [uuid]        // áreas activas (máx. 3); base de §5.7.4
    diaTerminaA: time                 // (ya existía) por defecto 00:00 — sin cambios

- `genero` **no se persiste dentro de ningún otro dato.** Ninguna entidad guarda texto ya flexionado: se guardan identificadores y el género se resuelve en render (RN-GEN-04). Es lo que permite que cambiar el género reescriba retroactivamente todo el historial sin migrar una sola fila.

#### DailyEntry.noche — campos sustituidos \[BLOQUE 02\]

    noche: {
      logrosNoPlaneados: [string]
      agradecimientos: [GratitudeItem]
      intentarDiferente?: string
      reflexion?: string
      preguntaReflexionUsada: string
      estadoSueno: [id]               // NUEVO — máx. 2 ids del catálogo de §5.4.1
                                      // ids: en_paz | agradecido | orgulloso |
                                      //      tranquilo | contento | pensativo |
                                      //      cansado | inquieto | otro
      estadoSuenoOtro?: string        // NUEVO — UNA palabra, literal, sin transformar
      animo?: enum(...)               // OBSOLETO — solo lectura de registros históricos
      matices: [enum]                 // OBSOLETO — solo lectura de registros históricos
      completadoEn?: timestamp
    }

- `animo` y `matices` **no se eliminan del esquema**: los registros escritos antes de Fase 0 se conservan y se siguen leyendo con la correspondencia de §5.4.1. **La escritura solo usa** `estadoSueno`**.**
- `animoDerivado` **no existe como campo.** Es una función de lectura (§5.4.1) que alimenta el calendario del Historial y las correlaciones de Insights. Nunca se persiste.
- **Se guardan ids, no etiquetas.** Un registro con `["tranquilo"]` se muestra como “Tranquila”, “Tranquilo” o “En calma” según el perfil vigente en el momento de leerlo.

#### Habit — sin cambios de esquema \[BLOQUE 04\]

    areaId?: uuid                     // sin cambios — null = "General"

- El Bloque 04 **no modifica el esquema**: cambia únicamente la **presentación**. `areaId` se conserva siempre, incluso cuando la etiqueta no se muestra porque el área no está entre las seleccionadas (RN-HAB-AREA-04). El vínculo sobrevive a los cambios de selección de áreas.

#### JournalEntry — campos añadidos y sustituidos \[BLOQUE 06\]

    id: uuid
    userId: uuid
    creadoEn: timestamp
    fechaAsignada: date
    titulo?: string
    contenido: text
    etiquetas: [string]
    emociones: [id]                   // NUEVO — máx. 3 ids del catálogo de 15 (§5.8.1)
                                      // ids: feliz | agradecido | tranquilo | orgulloso |
                                      //      esperanzado | motivado | aliviado |
                                      //      acompanado | cansado | triste |
                                      //      ansioso | frustrado | preocupado |
                                      //      melancolico | solo | otra
    emocionOtra?: string              // NUEVO — UNA palabra, literal
    animo?: enum                      // OBSOLETO — sustituido por `emociones`
    privada: boolean
    adjuntos: [{tipo, url, miniatura}]   // V2

- El catálogo del Journal es **distinto** del de la vista de mañana del Diario y no comparte identificadores con él por convención de nombres: son dos catálogos separados y así deben permanecer (§5.3.2).
- Una entrada puede tener `emociones` y `contenido` vacío, o al revés. Ambas vacías = no se guarda.

#### JournalPinConfig — entidad nueva \[BLOQUE 07\]

    userId: uuid
    activo: boolean                   // por defecto false
    algoritmo: string                 // 'PBKDF2-SHA256'
    iteraciones: int                  // >= 150000 — persistido para poder subirlo
    salt: bytes(16)                   // aleatorio criptográfico, único por usuario
    hash: bytes                       // derivación del PIN; NUNCA el PIN
    longitud: int                     // 4..6 — valida la entrada, no revela nada
    creadoEn: timestamp
    actualizadoEn: timestamp

- **No existe ningún campo que contenga el PIN en claro, ni cifrado, ni codificado.**
- **Esta entidad no cifra nada.** Controla el acceso al módulo Journal desde la interfaz (§5.8.2, §7.7.1).
- **No se sincroniza a Firestore en Fase 0:** es una configuración **de este dispositivo**, coherente con el copy autorizado (“acceso en este dispositivo”). Un dispositivo nuevo empieza sin PIN.
- Requiere que la cuenta tenga correo o teléfono vinculado (RN-JR-PIN-02).

#### AppPreferences — entidad nueva \[BLOQUES 05 y 01\]

    userId: uuid
    sonidoRespiracion: boolean        // audio del ejercicio de P1 (§6.12.1)
                                      // por defecto false (silencio, §6.12)
    reducirMovimiento?: boolean       // override manual del ajuste del sistema
    tamanoTexto?: enum(normal, grande, mayor)
    temaHoyUltimo?: enum(manana, noche)  // informativo; NO decide el tema al abrir
    actualizadoEn: timestamp

- `temaHoyUltimo` es **informativo**: la sección de partida al abrir la pantalla Hoy la sigue eligiendo la lógica de momento del día (§5.2.1). El tema **nunca** cambia solo una vez que el usuario está en la pantalla.

#### Resumen de compatibilidad

| Campo                     | Estado              | Regla de lectura                                    |
|:--------------------------|:--------------------|:----------------------------------------------------|
| `noche.animo`             | Obsoleto            | Se lee y se mapea al catálogo nuevo. No se escribe. |
| `noche.matices`           | Obsoleto            | Se lee como estados adicionales. No se escribe.     |
| `JournalEntry.animo`      | Obsoleto            | Se lee para correlaciones. No se escribe.           |
| `Habit.identidadAsociada` | Obsoleto desde v1.1 | Sin cambios en Fase 0.                              |
| Todos los anteriores      | —                   | **Ningún dato histórico se reescribe ni se borra.** |

## 7.3 Relaciones

    User 1──1 UserProfile          (contiene la identidad central)
    User 1──N Area                 (0..N; nivel intermedio del modelo de identidad)
    User 1──N DailyEntry            (única por fecha)
    User 1──N Victory               (N por fecha)
    User 1──N Habit  1──N HabitLog
    User 1──N JournalEntry
    User 1──N Insight
    User 1──N Commitment
    Area 1──N Habit                 (areaId; null = "General")
    Area 1──N Victory               (areaId; null = "General")
    Area 0..1 Insight               (areaId; null = insight global)
    DailyEntry ──N Victory          (por fecha, no por clave foránea directa)
    Victory ──0..1 Victory          (origenId, herencia entre días)

**Decisiones:** - Las `Victory` no se anidan dentro de `DailyEntry` porque tienen ciclo de vida propio (pueden migrar de día). Anidarlas obligaría a mover objetos entre documentos, generando conflictos de sincronización. - El vínculo Hábito/Victoria→Área es por `areaId` (referencia), no por copia de la identidad. Así, editar `Area.identidadArea` se propaga a todo lo asociado sin actualizar cada registro, y **quitar o pausar un área nunca borra sus hábitos, victorias o logros** (RN-ID-04): estos conservan su `areaId`, y el área conserva su fila con `estado = pausada/archivada`. - **Integridad:** un `areaId` que apunte a un área archivada sigue siendo válido; los datos históricos nunca se rompen. Si el usuario borra un área de forma definitiva (acción explícita y confirmada), sus registros no se borran: su `areaId` pasa a `null` (General).

## 7.4 Almacenamiento local

- **Web/PWA:** IndexedDB con una capa de abstracción. **Nativo:** SQLite.
- **Escritura anticipada:** cada pulsación relevante se persiste con *debounce* de 800 ms **y** un volcado inmediato al perder el foco, al minimizar la app y antes de cualquier navegación.
- **Búfer de seguridad de texto:** el contenido del campo activo se mantiene además en un almacén de recuperación que sobrevive a un cierre inesperado. Al reabrir, si hay contenido sin confirmar, se restaura sin preguntar.
- **Requisito de rendimiento:** latencia de escritura de tecla a pintado \< 16 ms. Es un criterio de aceptación, no un objetivo.
- **Tamaño:** un usuario de 3 años con uso diario genera aproximadamente 8–15 MB de texto. Se guarda todo localmente sin política de purga.

### 7.4.1 Esquema local de Fase 0 \[ACTUALIZADO EN BLOQUES 01–07\]

Implementación vigente: **IndexedDB** en la PWA (React + Vite), con sincronización asíncrona hacia **Firestore**. Local-first sin excepciones (RN-02): toda escritura se confirma en local **antes** de cualquier intento de red.

#### Árbol lógico por usuario

    users/{uid}/
    ├── profile/                    // UserProfile
    │     ├── identidadCentral, identidadCentralHistorial
    │     ├── genero                     [BLOQUE 01]  m | f | n   (por defecto n)
    │     ├── areasSeleccionadas[]       [BLOQUE 04]  máx. 3 — rige la etiqueta
    │     ├── horaDespertar, horaDormir, diaTerminaA
    │     ├── motivos[], voz, modoDiario
    │     └── mostrarOpcionesEspirituales, iaActivada, consentimientoIA
    │
    ├── identity/                   // Area — nivel intermedio del modelo de §5.1.1
    │     └── {areaId}/  tipo, nombre, identidadArea?, identidadAreaHistorial[],
    │                    color, icono, orden, estado(activa|pausada|archivada)
    │
    ├── habits/                     // Habit
    │     └── {habitId}/ nombre, icono, areaId?,       [BLOQUE 04: se conserva siempre]
    │                    momento(manana|noche|dia), diasSemana[], recordatorio?,
    │                    estado, totalCompletados
    │
    ├── habitLogs/                  // HabitLog — solo completados; no existe "fallado"
    │     └── {logId}/   habitId, fecha, completado, completadoEn, origen
    │
    ├── dailyEntries/               // DailyEntry — uno por usuario y fecha
    │     └── {fecha}/
    │           ├── estado(no_iniciado|en_curso|cerrado), cerradoEn?
    │           ├── manana/  agradecimientos[], emocionesDeseadas[] (máx.3),
    │           │            accionPequena?, visualizacionGranDia?, intencion?
    │           └── noche/   logrosNoPlaneados[], agradecimientos[],
    │                        intentarDiferente?, reflexion?, preguntaReflexionUsada,
    │                        estadoSueno[]        [BLOQUE 02] máx. 2 ids, NO etiquetas
    │                        estadoSuenoOtro?     [BLOQUE 02] una palabra, literal
    │                        animo?, matices[]    (obsoletos: solo lectura histórica)
    │
    ├── victories/                  // Victory — areaId?, estado, origenId?
    │
    ├── journal/                    // JournalEntry
    │     └── {entryId}/ creadoEn, fechaAsignada, titulo?, contenido, etiquetas[],
    │                    emociones[]              [BLOQUE 06] máx. 3 ids (de 15)
    │                    emocionOtra?             [BLOQUE 06] una palabra, literal
    │                    animo?                   (obsoleto: solo lectura histórica)
    │                    privada, adjuntos[]
    │
    ├── journalPin/                 // JournalPinConfig     [BLOQUE 07] — NO se sincroniza
    │     └── activo, algoritmo('PBKDF2-SHA256'), iteraciones(>=150000),
    │         salt(16 bytes), hash, longitud(4..6), creadoEn, actualizadoEn
    │
    ├── preferences/                // AppPreferences       [BLOQUES 01 y 05]
    │     └── sonidoRespiracion(false por defecto), reducirMovimiento?,
    │         tamanoTexto?, temaHoyUltimo?
    │
    ├── commitments/                // Commitment — sin campo "fallado"
    ├── insights/                   // Insight — areaId?, evidencia[] obligatoria
    ├── notifications/              // NotificationSchedule
    └── consents/                   // ConsentRecord

#### Reglas del almacén local

- **RN-DB-01** Un `DailyEntry` por usuario y fecha. La fecha es la clave natural y se calcula con `diaTerminaA`, no con la medianoche del sistema.
- **RN-DB-02** **Se persisten identificadores estables, nunca etiquetas visibles**, en `estadoSueno`, `emociones`, `emocionesDeseadas` y cualquier catálogo futuro (RN-GEN-04). Es la condición técnica que hace posible el copy género-adaptativo retroactivo.
- **RN-DB-03** **Nada se borra por obsolescencia.** `animo`, `matices` y `JournalEntry.animo` permanecen en los registros antiguos y se leen; simplemente ya no se escriben.
- **RN-DB-04** `journalPin` **no sale del dispositivo** en Fase 0. No se sincroniza, no se respalda y no se exporta.
- **RN-DB-05** El contenido del Journal **no se cifra en local** en Fase 0 (§7.7.1). Es una limitación conocida, documentada y comunicada con honestidad en el copy.
- **RN-DB-06** Las escrituras siguen la política de §7.4: *debounce* de 800 ms más volcado inmediato al perder el foco, al minimizar y antes de navegar. Seleccionar un chip de emoción o un estado de sueño **es** una escritura.

## 7.5 Sincronización

- **Modelo:** sincronización incremental por entidad y por campo, con marca de tiempo lógica (`version` + `actualizadoEn`).
- **Estrategia de conflicto:**
  1.  Campos escalares (ánimo, estado de hábito): gana el más reciente.
  2.  **Campos de texto libre: nunca se descarta contenido.** Si dos versiones difieren y ambas tienen contenido, se conservan las dos y se pide al usuario que elija, mostrando ambas. Es preferible una pregunta molesta a una pérdida silenciosa.
  3.  Colecciones (agradecimientos, victorias): unión por `id`, sin borrados implícitos.
- **Frecuencia:** al abrir, al cerrar la app, tras cada cierre de ritual, y cada 15 min en primer plano. Con red móvil limitada, solo en los tres primeros casos.
- **Cola offline:** persistente, con reintento exponencial y máximo de 7 días de acumulación antes de avisar al usuario.
- **Indicador:** discreto, solo cuando hay pendientes. Nunca un icono de error permanente.

## 7.6 Respaldo y portabilidad

- **Respaldo automático** cifrado en servidor para usuarios con cuenta.
- **Exportación manual**, gratuita para todos los planes:
  - **JSON completo** (todas las entidades, formato documentado).
  - **PDF legible** con tipografía cuidada, por mes o por año.
  - **Markdown** (una carpeta con un archivo por día), para usuarios técnicos.
- **Importación:** Day One (JSON), Five Minute Journal, CSV genérico, y texto plano con fechas. **La importación es una palanca de conversión infravalorada:** un usuario que trae dos años de historia tiene una barrera de salida enorme y una razón inmediata para ver Insights.
- **Borrado:** el borrado de cuenta elimina los datos del servidor en ≤ 30 días, con confirmación en dos pasos y con oferta previa de exportación.

## 7.7 Seguridad

- **Transporte:** TLS 1.3 obligatorio, *pinning* de certificado en las apps nativas.
- **En reposo:** cifrado a nivel de base de datos y de campo para el contenido escrito por el usuario. Las claves de campo se gestionan en un servicio de gestión de claves, con rotación.
- **En dispositivo:** base de datos local cifrada con clave en el almacén seguro del sistema (Keychain / Keystore).
- **Bloqueo de la app:** biometría o PIN, con ocultación del contenido en el conmutador de aplicaciones.
- **Autenticación:** Sign in with Apple, Google, y correo con enlace mágico. **Sin contraseñas propias** (elimina toda una clase de vulnerabilidades y de fricción). Tokens de sesión de corta duración con refresco rotatorio.
- **Registro:** ningún registro del servidor contiene contenido escrito por el usuario. Está prohibido a nivel de política y verificado en revisión de código.
- **Cadena de suministro:** dependencias auditadas, mínimo posible, sin SDK de terceros con acceso al contenido.

## 7.8 Privacidad

**Compromisos públicos (deben aparecer literalmente en la política y en la app):**

1.  Lo que escribes es tuyo. No lo leemos, no lo vendemos, no lo usamos para entrenar modelos.
2.  No hay publicidad y nunca la habrá.
3.  Puedes llevarte todo lo tuyo en cualquier momento, gratis.
4.  Si borras tu cuenta, se borra de verdad.
5.  La analítica registra cómo se usa la app, nunca lo que escribes.

- **Minimización:** no se recogen contactos, ubicación, identificadores publicitarios ni datos del dispositivo más allá de lo necesario para funcionar.
- **Analítica de contenido:** desactivada. Los eventos registran acciones (`ritual_noche_completado`), nunca contenido.
- **Cumplimiento:** GDPR (base legal: consentimiento y ejecución del contrato), CCPA, LFPDPPP (México). Registro de consentimientos con versión y fecha.
- **Menores:** la app declara 13+ (16+ en la UE cuando aplique). No dirigida a menores.

## 7.9 Capa de inteligencia artificial

### Alcance

La IA hace tres cosas y solo tres: 1. **Insights narrados** a partir de datos agregados. 2. **Resumen de entradas de Journal** bajo demanda. 3. **Detección de temas recurrentes** en un periodo.

### Lo que la IA nunca hace

Escribir por el usuario · diagnosticar · dar consejo clínico, legal o financiero · emitir juicios sobre terceros mencionados · fingir emociones · actuar como chatbot conversacional · procesar el historial completo sin necesidad.

### Contrato de datos

- **Entrada:** el mínimo necesario. Para un insight de patrón: series agregadas (fechas, ánimos, hábitos) más, como máximo, **10 fragmentos de texto de ≤ 200 caracteres**.
- **Prohibido:** enviar el historial completo, enviar el Journal salvo petición explícita del usuario para esa entrada concreta.
- **Sin retención:** contrato con el proveedor que prohíba retención y entrenamiento. Debe ser verificable y comunicable al usuario.
- **Filtro de salida:** toda salida atraviesa un validador de reglas (§5.9). Si no pasa, no se muestra nada.
- **Consentimiento:** explícito, granular, revocable, registrado.

### Coste

Presupuesto objetivo: **≤ 3 MXN por usuario premium al mes**. Se consigue con: generación semanal/mensual (no diaria), procesamiento por lotes nocturno, caché de resultados, y uso de un modelo pequeño para clasificación y uno mayor solo para la redacción final. **Si el coste supera el 8 % del ingreso por usuario, se reduce la frecuencia, nunca la calidad.**

## 7.10 Notificaciones

- **Programación local** para los recordatorios base (funcionan sin red, sin servidor y sin coste).
- **Servidor** solo para: entrega de cartas al yo futuro, celebraciones calculadas y campañas de reactivación.
- **Sin contenido del usuario** en la carga útil (RN-NT-03).
- **Registro de entrega y apertura** para alimentar la reducción por saturación (§5.13), con datos agregados.

## 7.11 Analítica

- **Herramienta:** una que permita alojamiento propio o con garantías de privacidad; sin SDK publicitarios.
- **Eventos clave:** `onboarding_paso_completado`, `primera_entrada_guardada`, `ritual_manana_completado`, `ritual_noche_completado`, `dia_cerrado`, `victoria_creada`, `victoria_lograda`, `victoria_pospuesta`, `agradecimiento_creado`, `journal_entrada_creada`, `habito_marcado`, `insight_visto`, `insight_util`, `paywall_visto`, `prueba_iniciada`, `suscripcion_activada`, `notificacion_abierta`, `regreso_tras_ausencia`, `dia_dificil_activado`.
- **Métricas rectoras:**
  - **Métrica estrella:** *días con al menos un registro por usuario y mes* (DRM). Mide valor entregado, no tiempo robado.
  - Activación: % de usuarios con ≥ 3 registros en los primeros 7 días.
  - Retención D1 / D7 / D30 / D90.
  - Retención de regreso: % de usuarios ausentes ≥ 7 días que vuelven a registrar.
  - Conversión a prueba y de prueba a pago.
  - **Métrica de salud emocional del producto:** proporción de sesiones que terminan con el cierre completo frente a las que terminan por abandono. Una caída aquí indica fricción emocional.
- **Prohibido:** medir “tiempo en app” como objetivo a maximizar. Se registra, pero **un aumento se investiga como posible problema**, no se celebra.

## 7.12 Integraciones futuras

| Servicio                  | Fase | Uso propuesto                                                                                                                        | Riesgo                                                                                                         |
|:--------------------------|:-----|:-------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------|
| Apple Health / Google Fit | V3   | Leer sueño y actividad **solo** para enriquecer correlaciones (“los días que duermes más de 7 h sueles cerrar el día más tranquila”) | Convertir Strivo en un panel de métricas. Mitigación: lectura, nunca visualización de datos biométricos crudos |
| Apple Journal Suggestions | V3   | Ofrecer detonantes de escritura                                                                                                      | Dependencia de plataforma                                                                                      |
| Spotify / Apple Music     | V3   | Asociar una canción a un día; lista de reproducción del mes                                                                          | Bajo; alto valor emocional                                                                                     |
| Audible / podcasts        | V3   | Registrar lo aprendido como logro                                                                                                    | Bajo                                                                                                           |
| Calendario                | V2   | Detectar días con alta carga para ajustar la extensión del ritual                                                                    | Privacidad: solo densidad, nunca contenido de eventos                                                          |
| Widgets y Live Activities | V1   | Frase del día, acceso al ritual                                                                                                      | Ninguno                                                                                                        |
| Apple Watch               | V3   | Marcar hábitos, ánimo rápido                                                                                                         | Coste de desarrollo alto                                                                                       |
| Atajos / Shortcuts        | V2   | “Oye Siri, agradezco…”                                                                                                               | Bajo, alto valor para usuarios avanzados                                                                       |

**Principio de integración:** ninguna integración puede convertir Strivo en un panel de datos ajenos. Las integraciones solo entran si aumentan el significado de lo que el usuario escribe.

## 7.13 Internacionalización

- Todas las cadenas externalizadas desde el primer día, incluidas las de la biblioteca de frases y notificaciones.
- Soporte de formato de fecha, hora y número por región.
- **Advertencia crítica:** el copy de Strivo no se traduce, **se reescribe**. Una traducción literal destruye el activo principal del producto (§1.8, D-4). Presupuestar redacción nativa por idioma, no traducción.
- Preparado para RTL en estructura, aunque no se active hasta que exista un mercado.

## 7.14 Escalabilidad

- La arquitectura local-first hace que el 95 % de las operaciones no toquen el servidor. Con 100.000 usuarios activos, la carga real es: sincronización incremental, procesamiento por lotes de insights (nocturno, escalonado por zona horaria) y notificaciones.
- Objetivo de coste de infraestructura: **≤ 6 MXN por usuario premium al mes**, incluyendo IA.
- Cuellos de botella previstos: generación de insights (mitigado con lotes y caché) y almacenamiento de adjuntos (mitigado con almacenamiento de objetos y límites por plan).

## 7.15 Requisitos de rendimiento (criterios de aceptación técnicos)

1.  Arranque en frío hasta contenido interactivo: **≤ 1,2 s** en gama media.
2.  Latencia de tecla a pintado: **≤ 16 ms**.
3.  Transición entre pantallas: **≤ 300 ms** percibidos.
4.  Búsqueda en 1.000 entradas: **≤ 500 ms**.
5.  La app es completamente funcional sin red, incluidas búsqueda, historial y escritura.
6.  Consumo de batería en segundo plano: despreciable (sin geolocalización, sin sondeo).
7.  Tamaño de instalación: **≤ 40 MB** (PWA: ≤ 4 MB de carga inicial).

# Capítulo 14 — Roadmap

\[REUBICADO DE CAPÍTULO 8 — v3.1\] — íntegro.

> **Nota de v4.0.** El roadmap se escribió para un solo producto. La división Lumia/Formia **no altera el orden de las fases ni sus criterios de cierre**, pero sí añade trabajo no presupuestado en Fase 1: migración de datos (§C7.2), *naming* de navegación (§C7.3) y la decisión de distribución (§C7.1). Ese impacto **no se ha estimado aquí**: requiere cerrar antes esas decisiones.

## 8.1 Restricciones reales que condicionan este plan

| Restricción                                                              | Implicación                                                                                                   |
|:-------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------|
| Equipo de 2 personas, ~10 h/semana cada una = **~20 h/semana efectivas** | Aproximadamente **0,5 personas a tiempo completo**. Un mes de calendario equivale a ~80 horas de trabajo real |
| Presupuesto bajo                                                         | Sin diseñador externo, sin agencia, sin publicidad de pago inicial. Infraestructura gestionada y barata       |
| Hoy es **24 de julio de 2026**                                           | Quedan ~22 semanas hasta fin de año ≈ **440 horas de trabajo**                                                |
| Requisito: entregable socializable antes de que termine 2026             | El MVP debe estar en manos de usuarios reales en **octubre**, no en diciembre                                 |
| Herramienta principal: asistencia de IA para desarrollo                  | Multiplica la velocidad de implementación, pero **no** la de decisión, diseño ni control de calidad           |

**Conclusión estratégica:** el mayor riesgo del proyecto no es técnico, es de **alcance**. Este roadmap está construido para proteger el foco. Todo lo que no esté en la fase actual es explícitamente “todavía no”, no “nunca”.

## 8.2 Fase 0 — Fundación (24 jul – 21 ago 2026 · ~80 h)

**Objetivo:** convertir este blueprint en artefactos ejecutables.

| Entregable                                                                                                        | Horas |
|:------------------------------------------------------------------------------------------------------------------|:------|
| Sistema de diseño implementado como tokens (color, tipografía, espaciado, motion)                                 | 16    |
| Biblioteca de componentes base (botón, campo, fila dinámica, tarjeta, casilla, chip)                              | 24    |
| Prototipo navegable de alta fidelidad de los tres flujos críticos (onboarding, ritual de mañana, ritual de noche) | 20    |
| Biblioteca de copy v1: 120 frases del día, 40 notificaciones por tipo, todos los estados vacíos y errores         | 12    |
| Decisiones técnicas cerradas: almacén local, sincronización, autenticación, proveedor de pagos                    | 8     |

**Criterio de salida:** cinco personas ajenas al proyecto recorren el prototipo y describen la sensación con palabras del campo semántico de “calma”, “cuidado” o “orden”.

**Estado real al cierre de la revisión (10 ago 2026) \[ACTUALIZADO EN BLOQUES 01–08\].** Fase 0 está aproximadamente al **85 %**. Lo entregado excede el alcance previsto en la tabla anterior: además del sistema de tokens y la biblioteca de componentes, existe un **prototipo navegable completo** —no solo de los tres flujos críticos— desplegado sobre React + Vite, Firebase y Netlify, con persistencia local en IndexedDB.

| Entregable                                                           | Estado                                                                               |
|:---------------------------------------------------------------------|:-------------------------------------------------------------------------------------|
| Sistema de diseño como tokens (color, tipografía, espaciado, motion) | Completo, ampliado con los tokens de §6.3.7–6.3.10 y `dur-theme`                     |
| Biblioteca de componentes base                                       | Completa                                                                             |
| Onboarding P1–P11                                                    | Completo, con el ejercicio de respiración de §5.1.2                                  |
| Ritual de Mañana R1–R5 y Ritual de Noche N1–N6                       | Completos                                                                            |
| Diario, vistas de mañana y de noche                                  | Completas                                                                            |
| Hábitos H1, H2, H3                                                   | Completos, con el etiquetado de §5.7.4                                               |
| Journal (editor sin fricción, emociones, PIN)                        | Completo                                                                             |
| Historial (calendario + vista de día)                                | Completo                                                                             |
| Pantalla Hoy                                                         | Completa, con el tema por sección de §5.2.1                                          |
| Biblioteca de copy v1                                                | En curso                                                                             |
| Decisiones técnicas cerradas                                         | Cerradas: IndexedDB local-first, Firebase, Netlify, sin proveedor de pagos en Fase 0 |

**Pendiente para cerrar la fase:** pulido posterior a la revisión emocional (Anexo A), **pruebas con cinco personas ajenas al proyecto** (el criterio de salida no cambia), incorporación del feedback resultante, y corrección del fallo de compilación de integración continua. El **criterio de salida se mantiene íntegro**: cinco personas ajenas recorren el prototipo y describen la sensación con palabras del campo semántico de “calma”, “cuidado” u “orden”.

## 8.3 Fase 1 — MVP privado (22 ago – 9 oct 2026 · ~140 h)

**Hipótesis a validar:** *“Una persona escribe tres líneas por la noche y vuelve al día siguiente sin que se lo pidan.”*

**Alcance incluido:**

1.  Onboarding capa 1 y 2 (sin capa progresiva).
2.  Pantalla Hoy con degradados horarios.
3.  **Vista de Noche completa** (los 8 bloques).
4.  **Vista de Mañana completa** (los 6 bloques).
5.  Ritual de Mañana y Ritual de Noche (modo guiado), con sus ventanas horarias.
6.  Herencia de victorias mañana→noche.
7.  Hábitos (hasta 5) con checklist en ambos rituales.
8.  Journal libre con lista y búsqueda simple.
9.  Historial: calendario y vista de día.
10. Constancia acumulativa.
11. Notificaciones locales de nivel 1.
12. Almacenamiento local + cuenta opcional + sincronización básica.
13. Exportación JSON.
14. Modo día difícil.
15. Modo claro/oscuro.

**Alcance excluido deliberadamente (con justificación):**

| Excluido                               | Por qué                                                                                                                |
|:---------------------------------------|:-----------------------------------------------------------------------------------------------------------------------|
| Insights con IA                        | Requiere ≥ 3 semanas de datos para funcionar. Construirlo antes de tener usuarios con historial es trabajo sin retorno |
| Suscripción y paywall                  | Sin retención demostrada no hay nada que vender. Cobrar antes de tiempo contamina el aprendizaje                       |
| Ciencia del Bienestar y Audioteca      | Producción de contenido intensiva; no es la hipótesis a validar                                                        |
| Programas guiados                      | Dependen del contenido anterior                                                                                        |
| Adjuntos, etiquetas avanzadas, widgets | Placer, no necesidad                                                                                                   |
| Compartir e importar                   | Sin usuarios, no hay nada que compartir                                                                                |

**Usuarios:** 15–25 personas conocidas, con seguimiento semanal cualitativo.

**Criterio de salida (puerta de calidad):** **≥ 40 % de los usuarios del MVP tienen 4 o más días con registro en su segunda semana.** Si no se cumple, **no se avanza a Beta**: se rediseña el ritual nocturno.

## 8.4 Fase 2 — Beta pública (10 oct – 11 dic 2026 · ~180 h) — **entregable socializable de 2026**

**Objetivo:** producto compartible públicamente, con historia que contar y capacidad de cobrar.

**Alcance añadido:**

1.  **Insights v1:** constancia, resumen semanal, palabras frecuentes, primer patrón por reglas (sin IA todavía).
2.  **Onboarding progresivo** (capa 3, días 2–7).
3.  **Recordatorios inteligentes nivel 2** (supresión, aprendizaje de horario, reducción por saturación).
4.  **Suscripción**: paywall, prueba de 7 días, 99 MXN/mes y 749 MXN/año.
5.  **Estado de regreso** completo.
6.  **Momento del día 30** (las diez cosas que más agradeces).
7.  Ajuste de voz (cálido/directo).
8.  Exportación PDF.
9.  Protocolo de contenido sensible.
10. PWA instalable + landing page.
11. Accesibilidad auditada (AA completo).

**Criterio de salida:** 300–500 usuarios reales · retención D30 ≥ 25 % · conversión a prueba ≥ 8 % · **cero incidentes de pérdida de datos**.

**Hito de socialización: primera semana de diciembre de 2026.** Estado presentable, con métricas reales, prototipo instalable y narrativa de producto completa.

## 8.5 Fase 3 — V1 pública (ene – abr 2027)

1.  **Insights con IA** (patrones, temas emergentes, resúmenes narrados) con todos los controles de §7.9.
2.  **Ciencia del Bienestar**: 25 artículos iniciales.
3.  **Audioteca**: 20 audios cortos.
4.  **Programas guiados**: los cuatro comprometidos (21 días autoestima, 30 claridad mental, 14 disciplina, 21 gratitud).
5.  **Compromisos** (§4.6).
6.  Carta a tu yo futuro.
7.  Widgets, Atajos.
8.  Aplicaciones nativas iOS y Android (envoltura optimizada o migración según rendimiento medido).
9.  Importación desde Day One y Five Minute Journal.
10. Recuerdos (“Un día como hoy”).

**Criterio de salida:** 5.000 usuarios · D90 ≥ 15 % · MRR que cubra costes de infraestructura y contenido.

## 8.6 Fase 4 — V2 (may – dic 2027)

1.  **Libro de Vida**: compilación narrada del periodo del usuario, exportable a PDF y a libro impreso bajo demanda (**nueva línea de ingresos con margen alto y valor emocional máximo**).
2.  Cifrado de extremo a extremo opcional para el Journal.
3.  Audio de cierre personalizado con los agradecimientos del día.
4.  Adjuntos (foto), entradas privadas con biometría.
5.  Integración con calendario para ajustar la extensión del ritual.
6.  Resumen anual.
7.  Segundo idioma (inglés), con copy reescrito, no traducido.
8.  Temas visuales adicionales.

## 8.7 Fase 5 — V3 (2028)

1.  Integraciones de salud (Apple Health, Google Fit) para correlaciones.
2.  Apple Watch.
3.  Spotify / Audible.
4.  Modo pareja o familia (**a evaluar con extrema cautela**; ver §9.8).
5.  Exploración de licencias B2B con datos exclusivamente agregados y anónimos.

## 8.8 Justificación del orden

1.  **La noche antes que la mañana.** El cierre nocturno tiene mayor valor emocional percibido, mayor disponibilidad de tiempo y menor competencia por la atención. Es donde se gana la retención.
2.  **La retención antes que el dinero.** Cobrar por un producto que no retiene produce cancelaciones, reseñas negativas y aprendizaje contaminado.
3.  **Los datos antes que la IA.** La IA sin historial genera insights vacíos que queman la credibilidad del módulo más diferencial.
4.  **El contenido después del hábito.** La Biblioteca y la Audioteca son razones para quedarse, no para empezar.
5.  **Lo nativo después de lo validado.** Una PWA valida la hipótesis a un tercio del coste.
6.  **La calma antes que la funcionalidad, siempre.** En cada fase hay horas asignadas explícitamente a motion, copy y pulido emocional. No son opcionales ni se recortan.

## 8.9 Qué se pospone y por qué

| Funcionalidad                     | Fase    | Razón del aplazamiento                                             |
|:----------------------------------|:--------|:-------------------------------------------------------------------|
| Cualquier función social          | Ninguna | Contradice la intimidad radical (§0.4, S-08)                       |
| Gamificación con puntos o niveles | Ninguna | Contradice la filosofía                                            |
| Chatbot conversacional con IA     | Ninguna | Convierte el diario en una conversación; se rechaza explícitamente |
| Rachas                            | Ninguna | §5.9                                                               |
| Editor enriquecido en el Journal  | V2      | La escritura íntima no necesita negritas                           |
| Múltiples diarios o cuadernos     | V2      | Complejidad conceptual alta, demanda no demostrada                 |
| Web de escritorio completa        | V2      | El uso real es móvil, en cama                                      |
| Modo equipo o empresa             | V3+     | Riesgo de contaminar el posicionamiento                            |

## 8.10 Riesgos del plan y mitigaciones

| Riesgo                                                        | Prob.    | Impacto          | Mitigación                                                                                                                    |
|:--------------------------------------------------------------|:---------|:-----------------|:------------------------------------------------------------------------------------------------------------------------------|
| El alcance se desborda y no hay entregable en 2026            | Alta     | Crítico          | Puertas de calidad por fase; lista de exclusiones explícita; revisión quincenal de alcance                                    |
| La retención sin rachas es insuficiente                       | Media    | Alto             | \[H2\] con prueba A/B en Beta; refuerzo de Constancia y momentos memorables antes de considerar cualquier mecánica de pérdida |
| El coste de la IA se dispara                                  | Media    | Medio            | Presupuesto por usuario; lotes; caché; degradación a insights por reglas                                                      |
| Apple Journal o un competidor grande copia el posicionamiento | Media    | Medio            | La voz y el copy son el foso defensivo; se profundiza en Insights y Libro de Vida                                             |
| Agotamiento del equipo de dos personas                        | **Alta** | **Crítico**      | Fases con horas contadas; nada de trabajo nocturno permanente; el producto trata de bienestar y el equipo debe practicarlo    |
| Contenido de la Biblioteca demasiado costoso de producir      | Media    | Medio            | 25 artículos en V1, no 100; formato corto; reutilización en notificaciones y frases                                           |
| Incidente de privacidad                                       | Baja     | **Catastrófico** | Minimización de datos, sin registro de contenido, auditoría antes de la Beta pública                                          |

## 8.12 Roadmap ejecutivo (tabla maestra)

Esta es la vista ejecutiva de la evolución del producto: qué entra en cada versión, cuándo, qué hace falta para avanzar a la siguiente, cuánto cuesta y qué tecnología exige. Los costes están en **pesos mexicanos (MXN)** y son estimaciones para un equipo de dos personas a media jornada que usa asistencia de IA para desarrollar; **no incluyen el sueldo de los fundadores** (se asume aporte de tiempo propio), sino los desembolsos de caja reales. Los rangos reflejan incertidumbre honesta.

### 8.12.1 Supuestos económicos base

- Tipo de cambio de referencia para servicios en USD/EUR: ~19–20 MXN.
- Infraestructura gestionada (base de datos, autenticación, almacenamiento, funciones) en niveles gratuitos o de bajo coste hasta ~1.000 usuarios activos.
- Coste de IA objetivo: **≤ 3 MXN por usuario premium al mes** (§7.9), activándose solo desde V1.
- Comisión de tiendas (App Store / Google Play): 15–30 % del ingreso de suscripción; contemplada en los cálculos de rentabilidad, no en los costes de desarrollo.
- Precio de referencia: **99 MXN/mes · 749 MXN/año** (§S-05).

### 8.12.2 Tabla maestra por versión

**FASE 0 — Fundación**

| Campo                       | Detalle                                                                                                                                                                                                |
|:----------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Versión**                 | Fase 0 (interna, no pública)                                                                                                                                                                           |
| **Fecha estimada**          | 24 jul – 21 ago 2026                                                                                                                                                                                   |
| **Funcionalidades**         | Sistema de diseño en tokens; biblioteca de componentes base; prototipo navegable de onboarding y ambos rituales; biblioteca de copy v1; decisiones técnicas cerradas                                   |
| **Criterio para avanzar**   | Cinco personas externas recorren el prototipo y lo describen con palabras del campo “calma / cuidado / orden”                                                                                          |
| **Costos estimados (MXN)**  | Herramientas de diseño y prototipado: 0–2.000/mes · Tipografías con licencia: 0–6.000 una vez (o fuentes libres: 0) · Dominio: ~400/año · **Total fase: 5.000–15.000**                                 |
| **Requisitos tecnológicos** | Definición de stack PWA (framework web + almacén local IndexedDB); repositorio y CI básico; elección de proveedor de backend gestionado, autenticación y pagos. Sin infraestructura productiva todavía |

**FASE 1 — MVP privado** ⭐ *primer producto en manos de usuarios*

| Campo                            | Detalle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|:---------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Versión**                      | MVP (v0.1, cerrado / privado)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Fecha estimada**               | 22 ago – 9 oct 2026                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Funcionalidades**              | Onboarding (capas 1–2, con identidad central + áreas); pantalla Hoy con degradados horarios; **Vista de Mañana y de Noche completas**; **Ritual de Mañana y de Noche (guiados)** con sus ventanas horarias; **herencia de victorias mañana→noche**; **hábitos (hasta 5) proyectados a los rituales** (§5.7); Journal libre con búsqueda simple; Historial (calendario + día); Constancia acumulativa; notificaciones locales nivel 1; almacenamiento local + cuenta opcional + sincronización básica; exportación JSON; modo día difícil; modo claro/oscuro. **Navegación de 3 pestañas (Hoy · Journal · Tú).** *Excluye deliberadamente: IA, insights de patrón, suscripción, contenido, importar/compartir.* |
| **Criterio para avanzar a Beta** | **≥ 40 % de los usuarios del MVP con 4+ días de registro en su 2.ª semana.** Si \< 25 %, no se avanza: se rediseña el ritual nocturno                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Costos estimados (MXN)**       | Infraestructura (nivel gratuito, 15–25 usuarios): ~0 · Cuentas de desarrollador Apple (~800/año) y Google (~450 pago único): **~1.300** · Herramientas: 0–2.000/mes · **Total fase: 3.000–8.000**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Requisitos tecnológicos**      | PWA instalable; almacén local-first (IndexedDB) con cola de sincronización; backend gestionado para cuentas y respaldo cifrado; autenticación Apple/Google/correo sin contraseña; notificaciones **locales** (sin servidor de push todavía). Rendimiento: arranque ≤ 1,2 s, latencia de tecla ≤ 16 ms                                                                                                                                                                                                                                                                                                                                                                                                          |

**FASE 2 — Beta pública** ⭐ *entregable socializable de 2026 · primera versión que cobra*

| Campo                          | Detalle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|:-------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Versión**                    | Beta pública (v0.5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Fecha estimada**             | 10 oct – 11 dic 2026 (hito de socialización: **1.ª semana de diciembre 2026**)                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Funcionalidades**            | Todo el MVP **+** Insights v1 (Constancia, resumen semanal, palabras frecuentes, **distribución por áreas**, primer patrón por reglas —sin IA aún—); onboarding progresivo (capa 3); recordatorios inteligentes nivel 2 (supresión, aprendizaje de horario, reducción por saturación); **suscripción + paywall + prueba de 7 días (99 MXN/mes · 749 MXN/año)**; estado de regreso; momento del día 30; ajuste de voz (cálido/directo); exportación PDF; protocolo de contenido sensible; PWA instalable + landing; accesibilidad AA auditada |
| **Criterio para avanzar a V1** | 300–500 usuarios reales · retención **D30 ≥ 25 %** · conversión a prueba **≥ 8 %** · **cero incidentes de pérdida de datos**                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Costos estimados (MXN)**     | Infraestructura (300–500 usuarios): 500–1.500/mes · Servidor de notificaciones push: incluido o ~400/mes · Pasarela de pagos (gestor de suscripciones tipo RevenueCat: gratis hasta cierto ingreso) · Landing/hosting: ~200/mes · Auditoría ligera de accesibilidad/privacidad: 8.000–20.000 una vez · **Total fase (2 meses): 15.000–35.000**                                                                                                                                                                                               |
| **Requisitos tecnológicos**    | Servidor de notificaciones push; motor de suscripciones (RevenueCat o equivalente) integrado con App Store/Play; motor de Insights **por reglas** (sin IA) ejecutado en cliente o en función serverless; sincronización robusta con resolución de conflictos (§7.5); landing page. Escalabilidad objetivo: hasta ~1.000 usuarios sin re-arquitectura                                                                                                                                                                                         |

**FASE 3 — V1 pública** *primer producto completo con IA*

| Campo                          | Detalle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|:-------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Versión**                    | V1 (pública, 1.0)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Fecha estimada**             | ene – abr 2027                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Funcionalidades**            | **Insights con IA** (patrones, temas emergentes del Journal, resúmenes narrados, evidencia de identidad por área) con todos los controles de §7.9; **Biblioteca “Ciencia del Bienestar”** (25 artículos iniciales); **Audioteca** (20 audios cortos); **Programas guiados** (21 días autoestima, 30 claridad, 14 disciplina, 21 gratitud); Compromisos; carta a tu yo futuro; widgets y Atajos; **apps nativas iOS y Android**; importación desde Day One y Five Minute Journal; recuerdos “Un día como hoy” |
| **Criterio para avanzar a V2** | 5.000 usuarios · **D90 ≥ 15 %** · MRR que cubra la infraestructura y el contenido · conversión a pago sostenida                                                                                                                                                                                                                                                                                                                                                                                              |
| **Costos estimados (MXN)**     | Infraestructura (5.000 usuarios): 3.000–8.000/mes · **IA** (≤ 3 MXN/usuario premium/mes; ~1.000 premium → ~3.000/mes): 2.000–6.000/mes · Producción de contenido (25 artículos + 20 audios, redacción/voz/edición): 40.000–90.000 una vez · Publicación nativa: cuentas ya cubiertas · **Total fase (4 meses): 90.000–180.000**                                                                                                                                                                              |
| **Requisitos tecnológicos**    | Capa de abstracción sobre proveedor de LLM con degradación garantizada a insights por reglas; procesamiento por lotes nocturno escalonado por zona horaria; caché de resultados de IA; contrato de datos con proveedor (sin retención, sin entrenamiento); migración de PWA a apps nativas envueltas (o build nativo) preservando el almacén local; CDN para audios; almacenamiento de objetos. Escalabilidad: 10.000+ usuarios                                                                              |

**FASE 4 — V2** *profundidad y nueva línea de ingresos*

| Campo                          | Detalle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|:-------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Versión**                    | V2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Fecha estimada**             | may – dic 2027                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Funcionalidades**            | **Libro de Vida** (compilación narrada del periodo del usuario, exportable a PDF y a **libro impreso bajo demanda** — nueva línea de ingresos con margen alto); cifrado de extremo a extremo opcional para el Journal; **audio de cierre personalizado** (lee tus agradecimientos del día con voz sintética); adjuntos (foto) y entradas privadas con biometría; integración con calendario (solo densidad, para ajustar la extensión del ritual); resumen anual; **segundo idioma (inglés, copy reescrito, no traducido)**; temas visuales adicionales |
| **Criterio para avanzar a V3** | Rentabilidad operativa con el equipo de dos personas · retención estable · demanda validada del Libro de Vida (tasa de compra medible)                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Costos estimados (MXN)**     | Infraestructura (escalado): 8.000–20.000/mes · IA (incluye síntesis de voz y Libro de Vida): 6.000–15.000/mes · Impresión bajo demanda: coste variable por pedido, **repercutido al cliente con margen** (no es coste neto) · Reescritura de copy al inglés: 30.000–60.000 una vez · **Total fase (8 meses): 150.000–320.000**                                                                                                                                                                                                                          |
| **Requisitos tecnológicos**    | E2EE opcional del Journal (con las implicaciones de §S-03: pierde búsqueda servidor e IA sobre esas entradas); síntesis de voz (TTS) de calidad; integración con proveedor de impresión bajo demanda y generación de PDF de alta calidad; API de calendario del sistema; internacionalización completa (i18n) con segundo idioma; infraestructura multi-región si el inglés abre mercados nuevos                                                                                                                                                        |

**FASE 5 — V3** *ecosistema e integraciones*

| Campo                       | Detalle                                                                                                                                                                                                                                                                                                             |
|:----------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Versión**                 | V3                                                                                                                                                                                                                                                                                                                  |
| **Fecha estimada**          | 2028                                                                                                                                                                                                                                                                                                                |
| **Funcionalidades**         | Integraciones de salud (Apple Health / Google Fit) **solo para correlaciones**, nunca panel biométrico; Apple Watch; Spotify / Audible (canción o aprendizaje del día); modo pareja o familia (**a evaluar con extrema cautela**, §9.8); exploración de licencias B2B con datos exclusivamente agregados y anónimos |
| **Criterio para avanzar**   | Decisión estratégica según tracción, financiación y equipo disponible                                                                                                                                                                                                                                               |
| **Costos estimados (MXN)**  | Infraestructura y equipo ampliado: dependiente de escala; requiere probablemente contratación y/o financiación · **Rango no estimable con fiabilidad a este horizonte**                                                                                                                                             |
| **Requisitos tecnológicos** | HealthKit / Google Fit (permisos de solo lectura); app de watchOS; APIs de terceros (Spotify/Audible); si se aborda B2B, arquitectura de agregación y anonimización que impida desagregar por individuo; posible re-arquitectura para multi-tenant                                                                  |

### 8.12.3 Matriz resumen (una mirada)

| Versión    | Cuándo   | Núcleo que añade                                  | Umbral para avanzar           | Caja estimada (MXN) |
|:-----------|:---------|:--------------------------------------------------|:------------------------------|:--------------------|
| **Fase 0** | ago 2026 | Diseño, prototipo, decisiones técnicas            | Prueba de percepción de calma | 5–15 mil            |
| **MVP**    | oct 2026 | Diario + Rituales + Hábitos + Journal, 3 pestañas | 40 % con 4+ días en semana 2  | 3–8 mil             |
| **Beta**   | dic 2026 | Insights por reglas + Suscripción + Recordatorios | D30 ≥ 25 %, conversión ≥ 8 %  | 15–35 mil           |
| **V1**     | abr 2027 | IA + Contenido + Nativo + Programas               | 5.000 usuarios, D90 ≥ 15 %    | 90–180 mil          |
| **V2**     | dic 2027 | Libro de Vida + E2EE + inglés + audio propio      | Rentabilidad con 2 personas   | 150–320 mil         |
| **V3**     | 2028     | Salud + Watch + integraciones                     | Decisión estratégica          | Según escala        |

### 8.12.4 Nota sobre el MVP (lo que sale a la calle primero)

El **MVP (octubre 2026)** es la primera versión que un usuario real toca, y está deliberadamente acotado para responder **una sola pregunta**: *¿la gente vuelve al día siguiente sin que se lo pidamos?* Por eso el MVP incluye exactamente lo que crea y demuestra el valor central —cerrar el día con evidencia de lo logrado y agradecido, con hábitos que fluyen a los rituales— y **nada más**. No lleva IA, ni suscripción, ni contenido, ni funciones sociales, porque ninguna de esas cosas responde a esa pregunta y todas retrasarían la respuesta. Si el MVP demuestra retención (40 % con 4+ días en la segunda semana), el resto del roadmap está justificado; si no, ninguna función adicional lo salvaría, y la señal correcta es rediseñar el ritual nocturno antes de seguir gastando. **El MVP no es una versión pequeña de Strivo: es Strivo entero reducido a su corazón.**

# Capítulo 15 — Revisión crítica

\[REUBICADO DE CAPÍTULO 9 — v3.1\] — íntegro. Las críticas de las ocho voces se emitieron sobre v3.1; la división no las invalida y varias —especialmente la del Arquitecto de Software sobre acoplamiento y la del UX Designer sobre navegación— se vuelven **más** pertinentes tras la partición.

*Cada perspectiva revisa el documento entero, señala debilidades reales, propone mejoras concretas, estima impacto y coste. Ninguna idea original se elimina: se refuerza o se acota.*

## 9.1 Product Manager

**Debilidad 1 — Solapamiento Ritual/Diario.** Aunque §4.5 lo resuelve conceptualmente, sigue siendo el punto de mayor riesgo de confusión del usuario (“¿ya lo escribí o no?”). - *Mejora:* un único indicador de estado del día visible en Hoy (“Tu día está cerrado”), y que el Ritual muestre lo ya escrito en lugar de campos vacíos. **Impacto: alto. Coste: bajo.**

**Debilidad 2 — Demasiados bloques en la Vista de Mañana.** Seis bloques a las 6:40 es optimista. Riesgo real de abandono (\[H3\]). - *Mejora:* la ruta express ya existe, pero debería ser el **valor por defecto los primeros 7 días**, expandiéndose progresivamente. Empezar simple y crecer con el usuario. **Impacto: muy alto en activación. Coste: bajo.**

**Debilidad 3 — La métrica estrella (DRM) no captura la calidad emocional.** - *Mejora:* añadir una pregunta trimestral de una sola línea (“¿Strivo te ha ayudado estos meses?” con tres opciones) como métrica declarada. **Impacto: medio. Coste: muy bajo.**

**Debilidad 4 — No hay estrategia de adquisición en el documento.** - *Mejora:* el propio producto genera activos compartibles (resumen anual, momento del día 30, PDF exportado). Añadir a V1 una función de “compartir mi frase del día” con marca discreta. **Impacto: medio-alto. Coste: bajo.** *Coste oculto:* debe respetar la privacidad absolutamente; solo contenido elegido explícitamente.

**Riesgo P-03 (Retos):** si se decidiera restaurar la infraestructura de Retos, el impacto sería: +40 h de desarrollo, una entidad más, un estado de fallo que contradice la filosofía y un módulo compitiendo con Compromisos y Programas. *Recomendación: mantener la resolución de §4.6.*

## 9.2 UX Designer

**Debilidad 1 — La navegación de cuatro pestañas era innecesaria** (resuelta en v3). Con el Diario accesible desde Hoy, la pestaña de Diario sobraba. - *Mejora:* ya implementada en v3 — la barra pasa a tres pestañas (Hoy · Journal · Tú) con el Diario siempre accesible desde Hoy (§4.3.1). **Impacto: medio en simplicidad percibida. Coste: bajo. Estado: implementado.**

**Debilidad 2 — El campo “Visualización del gran día” es el más costoso cognitivamente y está en la mañana**, el peor momento. - *Mejora:* mantenerlo, pero plegado por defecto tras los primeros 7 días si el usuario no lo ha usado nunca. La app aprende qué bloques usa cada persona y reordena en consecuencia. **Impacto: alto. Coste: medio.** *Esta “personalización silenciosa de la estructura” es una de las mejores oportunidades del producto.*

**Debilidad 3 — Falta especificación de la primera sesión de un usuario que llega de madrugada** o fuera de ambas ventanas de ritual. - *Mejora:* definir un “ritual neutro” de 3 pantallas disponible a cualquier hora. **Impacto: medio. Coste: bajo.**

**Debilidad 4 — El deslizamiento para eliminar filas** es descubrible solo por accidente. - *Mejora:* añadir un botón de eliminar visible al enfocar la fila. **Impacto: medio. Coste: muy bajo.**

## 9.3 UI Designer

**Debilidad 1 — Cinco degradados horarios × dos modos × contraste AAA** es una matriz de verificación grande y frágil. - *Mejora:* limitar el texto sobre degradado a un único bloque (el saludo) con una capa de legibilidad garantizada detrás. **Impacto: alto en accesibilidad. Coste: bajo.**

**Debilidad 2 — Fraunces + Satoshi implica dos familias variables** con coste de carga en PWA. - *Mejora:* subconjuntos de caracteres (latín + latín extendido), carga diferida del display, reserva del sistema. Objetivo: \< 120 KB de tipografía. **Impacto: alto en rendimiento percibido. Coste: bajo.**

**Debilidad 3 — Las 16 tarjetas de emoción con ilustración propia** son 16 activos originales, mucho trabajo para un equipo de dos. - *Mejora:* generar las 16 a partir de **cuatro formas base combinadas con cuatro tratamientos de color**. Coherencia garantizada, coste dividido entre cuatro. **Impacto: alto. Coste: bajo.**

**Debilidad 4 — El índigo violáceo es un riesgo real** si en pruebas se percibe como “frío” o “morado de app espiritual”. - *Mejora:* validar con 10 usuarios en la Fase 0 comparando tres variantes de fondo nocturno. Es una decisión reversible y barata de probar ahora, cara de cambiar después.

## 9.4 Psicólogo / Behavioral Designer

**Fortaleza:** la ausencia de mecánicas de pérdida, el modo día difícil y el protocolo de contenido sensible sitúan a este producto por encima del estándar ético del sector.

**Debilidad 1 — La gratitud forzada puede ser contraproducente** en personas con estado de ánimo bajo (evidencia consistente en la literatura). - *Mejora:* si el ánimo registrado es bajo dos días seguidos, el bloque de agradecimientos cambia de pregunta: en lugar de “¿qué agradezco?”, pasa a “¿qué fue lo menos difícil de hoy?”. **Impacto: alto en usuarios vulnerables. Coste: bajo.** *Esta es la mejora más importante de todo el capítulo 9.*

**Debilidad 2 — La rumiación** es un riesgo real del journaling nocturno: escribir sobre lo difícil justo antes de dormir puede aumentar la activación. - *Mejora:* el orden de la Vista de Noche ya termina en gratitud y cierre; **reforzarlo con una regla dura: la última pantalla antes de dormir nunca es un campo de escritura problemática**. Si el usuario escribió algo cargado, el cierre añade una respiración de 30 s opcional. **Impacto: alto. Coste: bajo.**

**Debilidad 3 — La declaración de identidad puede generar disonancia** si el comportamiento no la acompaña (“soy alguien que cuida su cuerpo” tras dos semanas de solo trabajar). - *Resuelta en v1.1 con el modelo de identidad de tres niveles (§5.1.1).* La identidad **central** es deliberadamente amplia (“alguien que crece”), de modo que cualquier logro de cualquier área la confirma y nunca la contradice. Las áreas concretas (Salud, Trabajo…) capturan el “dónde” cambiante de la vida sin obligar a equilibrio. Las reglas 8–10 de Insights (§5.9) prohíben presentar el bajo registro en un área como fracaso. La prueba de QA es explícita (RN-ID-05). **Impacto: alto. Coste: bajo. Estado: implementado.**

**Debilidad 4 — El “¿qué podría intentar diferente mañana?”** puede leerse como autocrítica pese al encuadre. - *Mejora:* convertirlo en opcional y rotarlo con alternativas neutras (“¿qué te gustaría repetir mañana?”). **Impacto: medio. Coste: muy bajo.** *La versión “qué repetir” es probablemente más eficaz conductualmente que la de corrección.*

## 9.5 Arquitecto de Software

**Debilidad 1 — La resolución de conflictos “conservar ambos y preguntar”** puede generar una experiencia molesta si la sincronización falla a menudo. - *Mejora:* restringir la pregunta a divergencias de más de 30 caracteres; por debajo, fusionar por marca de tiempo. **Impacto: medio. Coste: bajo.**

**Debilidad 2 — Las** `Victory` **fuera de** `DailyEntry` complican las consultas del día. - *Mejora:* mantener la decisión (es correcta) y añadir un índice por `(userId, fecha)` y una vista materializada local del día. **Impacto: medio. Coste: bajo.**

**Debilidad 3 — La Constancia como consulta derivada** puede ser costosa con años de datos. - *Mejora:* caché local con invalidación al escribir; recálculo completo solo al restaurar. **Impacto: bajo. Coste: muy bajo.**

**Debilidad 4 — Falta definir la migración PWA → nativa.** - *Mejora:* definir desde el inicio la capa de datos como independiente de la plataforma y usar un formato de exportación/importación interno que permita migrar el almacén local sin pérdida. **Impacto: alto en V1. Coste: medio si se hace ahora, muy alto si se hace después.**

## 9.6 CTO

**Debilidad 1 — El factor bus es 1.** Dos personas a media jornada, sin redundancia. - *Mejora:* documentación obligatoria de decisiones, ningún conocimiento crítico sin escribir, infraestructura gestionada en lugar de propia. **Impacto: crítico. Coste: 5 % del tiempo.**

**Debilidad 2 — Dependencia de un proveedor de IA externo** para el módulo más diferencial. - *Mejora:* capa de abstracción sobre el proveedor desde el primer día y degradación garantizada a insights por reglas. **Impacto: alto. Coste: bajo.**

**Debilidad 3 — La promesa de privacidad es un pasivo si se incumple.** Un solo incidente destruye el producto. - *Mejora:* auditoría externa ligera antes de la Beta pública; política de no registro verificada en revisión de código; sin SDK de terceros con acceso a contenido. **Impacto: crítico. Coste: bajo-medio.**

**Debilidad 4 — Se subestima el coste de la calidad emocional.** Motion, copy y pulido consumen más tiempo del que un plan optimista asigna. - *Mejora:* asignar un 20 % explícito de cada fase a pulido, protegido y no negociable. **Impacto: alto. Coste: es el coste.**

## 9.7 Inversionista

**Fortalezas:** posicionamiento claro en un espacio poco ocupado; márgenes altos de software; coste de infraestructura bajo por diseño; precio validado; mercado hispanohablante grande y mal atendido; equipo pequeño con coste operativo mínimo.

**Debilidad 1 — No hay canal de adquisición identificado.** Es el mayor riesgo del negocio, por encima de cualquier riesgo de producto. - *Mejora:* definir en la Fase 2 una hipótesis de canal concreta (contenido orgánico en español sobre bienestar y hábitos, asociaciones con psicólogos y creadores) y medirla. **Impacto: crítico. Coste: tiempo.**

**Debilidad 2 — La conversión freemium con journaling gratuito ilimitado** puede ser baja: el usuario obtiene mucho valor sin pagar. - *Mejora:* mantener la generosidad (es coherente con los valores y con la retención), pero asegurar que lo premium sea **acumulativo**: cuanto más tiempo lleva el usuario, más valioso es Insights, el historial completo y el Libro de Vida. La conversión llega en el mes 2–4, no en el día 3. **Impacto: alto. Coste: nulo.** *Nota: el Libro de Vida impreso podría tener mejor margen y mayor tasa de compra que la suscripción; merece prueba temprana.*

**Debilidad 3 — Techo de 100.000 usuarios con dos personas** requiere soporte y contenido que no escalan solos. - *Mejora:* base de conocimiento de autoservicio, respuestas plantilla, y contenido producido en tandas. **Impacto: medio. Coste: medio.**

**Métrica que este inversionista vigilaría:** retención D90 y **LTV/CAC**. Sin un canal de adquisición barato, ningún producto de este segmento es viable, por bueno que sea.

## 9.8 Usuario final

**Voz de Mariana:** *“Me gusta que no me regañe. Pero seis preguntas por la mañana son muchas. Y si escribo algo feo sobre mi jefa, ¿de verdad nadie lo lee?”* - *Respuesta del producto:* ruta express por defecto las primeras semanas (§9.1) y pantalla “Tus datos” en lenguaje humano, accesible desde el propio editor con un enlace discreto (“¿quién lee esto?” → una frase clara). **Impacto: alto en confianza. Coste: muy bajo.**

**Voz de Daniel:** *“¿Y si un día no quiero escribir nada? ¿Se rompe algo?”* - *Respuesta:* no. Y hay que **decirlo explícitamente** en el onboarding: *“Si un día no vienes, aquí no se rompe nada.”* Esa frase, dicha pronto, elimina la ansiedad anticipatoria que mata este tipo de productos. **Impacto: alto. Coste: nulo.**

**Voz de Rosa:** *“Yo trabajo de noche. ¿Esto sirve para mí?”* - *Respuesta:* modo de horarios variables y “mi día termina a las 3:00”. Debe ofrecerse **en el onboarding**, no escondido en ajustes. **Impacto: alto para un segmento amplio. Coste: bajo.**

**Voz de Andrés:** *“Tengo cuatro libretas. ¿Puedo meterlas aquí?”* - *Respuesta:* importación en V1; mientras tanto, escaneo por foto no resuelve nada. Comunicar honestamente el plazo.

**Voz de Sofía:** *“Hoy no tengo nada que agradecer y me hace sentir peor que me lo pregunten.”* - *Respuesta:* mejora de §9.4, debilidad 1. **Es la petición más importante recogida en toda la revisión.**

**Propuesta evaluada y rechazada — “círculos privados”** (compartir un agradecimiento con una persona de confianza): emocionalmente atractiva, pero introduce audiencia, y la audiencia cambia lo que se escribe. El valor terapéutico del journaling depende de la ausencia de lector. **Rechazada hasta V3 y solo como envío puntual y explícito, nunca como espacio compartido persistente.**

## 9.9 Plan de investigación pendiente antes de V1

| \#  | Pregunta                                                                                                       | Método                                                   | Cuándo             |
|:----|:---------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------|:-------------------|
| I-1 | ¿Se completa la Vista de Mañana? \[H3\]                                                                        | Analítica + 8 entrevistas                                | MVP semana 3       |
| I-2 | ¿La ausencia de rachas afecta la retención? \[H2\]                                                             | A/B en Beta                                              | Beta mes 1         |
| I-3 | ¿Los insights se perciben valiosos o invasivos? \[H4\]                                                         | 10 entrevistas cualitativas                              | Beta mes 2         |
| I-4 | ¿El índigo nocturno funciona?                                                                                  | Prueba de preferencia con 10 personas                    | Fase 0             |
| I-5 | ¿El precio es barrera? \[H5\]                                                                                  | Dos cohortes de precio                                   | Beta               |
| I-6 | ¿La gratitud incomoda en días bajos?                                                                           | Entrevistas + análisis de abandono por ánimo             | MVP y Beta         |
| I-7 | ¿Se entiende la diferencia entre Diario y Journal?                                                             | Prueba de comprensión con 8 usuarios                     | Fase 0 (prototipo) |
| I-8 | ¿El modelo identidad central + áreas se entiende sin fricción, o P3B/P3C alargan de más el onboarding?         | Prueba de usabilidad del onboarding con 8 usuarios       | Fase 0 (prototipo) |
| I-9 | ¿Los Insights por área se perciben honestos (no culpabilizadores) cuando hay desequilibrio fuerte entre áreas? | 6 entrevistas con usuarios de uso concentrado en un área | Beta mes 2         |

## 9.10 Decisiones abiertas que requieren confirmación del propietario del producto

1.  **Retos:** confirmar la resolución de §4.6 (Compromisos + Programas guiados en lugar de infraestructura de Retos).
2.  **Alcance de la primera plataforma:** confirmar PWA primero (S-01).
3.  **Idioma de lanzamiento:** confirmar solo español (S-02).
4.  **Cifrado E2EE:** confirmar su aplazamiento a V2 (S-03) y su comunicación honesta mientras tanto.
5.  **Libro de Vida impreso:** confirmar si se explora como línea de ingresos temprana.
6.  **Nombre de la métrica de continuidad:** confirmar “Constancia” / “días contigo”.
7.  **Modelo de identidad (nuevo en v1.1):** confirmar el modelo de tres niveles —identidad central (una), áreas (varias), identidad de área (opcional)— frente a la identidad única de la v1. Ver §5.1.1. *Recomendación: adoptarlo; resuelve la desconexión de identidad sin añadir fricción obligatoria, ya que P3B/P3C son opcionales y encadenadas.*

# Anexo A — Lista de verificación de calidad emocional (QA)

Toda pantalla debe pasar estas 15 comprobaciones antes de considerarse terminada:

1.  ¿Existe alguna ruta en la que el usuario se sienta peor de lo que entró?
2.  ¿Hay alguna palabra de la lista prohibida (§1.5.16)?
3.  ¿Hay algún número que pueda bajar?
4.  ¿Hay rojo aplicado a conducta del usuario?
5.  ¿Se puede salir sin coste emocional?
6.  ¿Funciona sin conexión?
7.  ¿Funciona con el texto al 200 %?
8.  ¿Funciona con “reducir movimiento”?
9.  ¿Se puede leer en modo oscuro con brillo mínimo?
10. ¿El lector de pantalla anuncia estados con lenguaje del producto?
11. ¿Hay una sola acción primaria?
12. ¿Se pierde texto en algún escenario, incluido un cierre inesperado?
13. ¿El contenido del usuario aparece en alguna notificación o widget?
14. ¿Se celebra por encima del estado emocional registrado?
15. Si quito un elemento, ¿la pantalla empeora?

**Comprobaciones añadidas en Fase 0 \[ACTUALIZADO EN BLOQUES 01–08\].** Las quince comprobaciones anteriores se mantienen sin cambios. A partir de la v3.1 se añaden siete más, derivadas de las capacidades introducidas en Fase 0:

1.  ¿Hay alguna cadena con marca de género escrita literalmente en un componente, en lugar de resolverse con el helper `{ m, f, n }`? (§3.6.5)
2.  ¿Se muestra alguna etiqueta visible guardada como texto, en lugar de un identificador estable resuelto en render? (RN-GEN-04)
3.  ¿Aparece alguna terminación “-e” de género inclusivo? (§3.6.5)
4.  ¿Declara esta pantalla su `data-surface`, y hereda todo su texto el color de la superficie sin fijar ningún valor literal? (§6.3.7)
5.  ¿Se reproduce algún sonido sin un gesto previo del usuario, o queda algún nodo de audio vivo al salir de la pantalla? (§6.12.1)
6.  ¿Aparece la palabra “cifrado”, “encriptado” o “seguro” en algún copy relacionado con el PIN del Journal? (§5.8.2)
7.  ¿Se muestra la frase de identidad de área junto a un hábito dentro de una lista? (§5.7.4)

**Regla:** las comprobaciones 16 a 22 son verificables de forma automática. Las siete están o deben estar cubiertas por el linter de copy y por la revisión de código, no solo por inspección visual.

# Anexo B — Glosario de eventos de analítica

Ver §7.11. Todos los eventos siguen el patrón `objeto_accion` en español, sin contenido del usuario, con propiedades limitadas a: `momento_del_dia`, `dias_desde_registro`, `plan`, `origen`.

# Anexo C — Índice de decisiones justificadas

| ID            | Decisión                                                                                 | Sección         |
|:--------------|:-----------------------------------------------------------------------------------------|:----------------|
| D-4.5         | El Ritual envuelve al Diario; un solo modelo de datos, dos presentaciones                | §4.5            |
| D-ID          | Modelo de identidad de tres niveles (central + áreas + identidad de área)                | §5.1.1          |
| S-04          | Retos → Compromisos + Programas guiados                                                  | §4.6            |
| D-1           | Herencia de victorias mañana→noche                                                       | §5.3, §5.4      |
| D-2           | Constancia acumulativa en lugar de racha                                                 | §5.9            |
| D-3           | Insights con evidencia citable                                                           | §5.9            |
| D-Voz         | Ajuste de voz cálido/directo                                                             | §3.6.4          |
| D-Onb         | Onboarding en tres capas con valor antes de compromiso                                   | §5.1            |
| D-Local       | Arquitectura local-first                                                                 | §7.1            |
| D-Sin-mascota | Sin personaje ni mascota                                                                 | §6.16           |
| D-Cierre      | La app termina la sesión deliberadamente                                                 | §3.3            |
| D-B01         | Copy género-adaptativo { m, f, n } con helper único y tokens de contraste por superficie | §3.6.5, §6.3.7  |
| D-B02         | Estado de sueño: 9 opciones, máximo 2, ids estables en lugar de etiquetas                | §5.4.1          |
| D-B03         | Tema de la pantalla Hoy por sección elegida, no por hora (reversión)                     | §5.2.1          |
| D-B04         | Hábitos etiquetados con el nombre del área, o sin etiqueta; regla única compartida       | §5.7.4          |
| D-B05         | Respiración guiada 5-5-3 con círculo naranja y audio generado sin archivos               | §5.1.2, §6.12.1 |
| D-B06         | Journal con 15 emociones con emoji, catálogo distinto al del Diario                      | §5.8.1, §5.3.2  |
| D-B07         | PIN de 4-6 dígitos como bloqueo de acceso, sin cifrado y sin prometerlo                  | §5.8.2, §7.7.1  |
| D-F0          | Índice único de decisiones cerradas y abiertas de Fase 0                                 | Capítulo 10     |

# Anexo D — Instrucciones para el equipo (o modelo) que construya el prototipo

1.  Lee los capítulos 3, 5 y 6 antes de escribir una sola línea.
2.  Empieza por la Vista de Noche. Es el corazón y define la calidad del resto.
3.  El copy de este documento es **literal**: úsalo tal cual, no lo reescribas.
4.  No añadas funcionalidades que no estén aquí. Si detectas una carencia, documéntala como propuesta y sigue.
5.  Ninguna pantalla se da por terminada sin pasar el Anexo A.
6.  Ante cualquier duda no resuelta por el documento, aplica la regla del §0.3: gana la calma del usuario.

# Anexo E — Ritual de Mañana: especificación derogada

**\[DEROGADO EN v4.0\]** — conservado como historia de la decisión, sin vigencia.

El Ritual de Mañana existió desde v1.0 hasta v3.1 como una secuencia de cinco pantallas con activación automática. **En v4.0 se disuelve** (§C0.5). Este anexo conserva su especificación completa para que la decisión sea auditable, con **R2 explícitamente eliminado**.

## E.0 Qué sobrevive y dónde

| Elemento de §5.5                                                                   | Destino en v4.0                                                                           |
|:-----------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------|
| R1 — Respiración de entrada                                                        | **Vive** en Lumia como experiencia propia — §C2.3                                         |
| R2 — Bienvenida dinámica                                                           | **Eliminado.** No se reubica                                                              |
| R3 — Recordatorio de identidad                                                     | **Vive** en el espacio de identidad de Formia — §C3.3                                     |
| R4 — Hábitos del día                                                               | **Vive** en el espacio de hábitos de Formia — §C3.5                                       |
| R5 — Intención del día                                                             | **Vive** en el display de Hoy → Mañana de Lumia — §C2.4                                   |
| Contexto y activación (ventana 4:00–11:30, pop-up automático, regla anti-molestia) | **Derogado.** No hay pop-up automático de mañana                                          |
| RN-RM-01 a RN-RM-06                                                                | **Derogadas en bloque.** Todas gobernaban la aparición automática del pop-up              |
| Criterios de aceptación 1 a 5                                                      | **Derogados** (dependen de la ventana horaria)                                            |
| Criterio de aceptación 6 (la intención permanece visible en Hoy)                   | **Sobrevive** en §C2.4                                                                    |
| §5.5.1 — R1 y R4 en Fase 0                                                         | **Reubicada:** la parte de R1 en §C2.3, la de R4 en §C3.5                                 |
| Cierre: transición luminosa de 900 ms                                              | **Sobrevive** como cierre de la Vista de Mañana (§5.3)                                    |
| Relación con la Vista de Mañana (decisión D-4.5 aplicada a la mañana)              | **Derogada.** Ya no hay dos presentaciones del mismo dato en la mañana — ver §4.5 anotada |

## E.1 Especificación original de §5.5 (v3.1)

### Objetivo

Convertir el arranque del día en una experiencia breve, agradable y alineada con la identidad central del usuario y con el área que hoy tiene más peso. **No es una lista de tareas: es una ceremonia de 90 segundos.**

### Contexto y activación

- **Disparador:** pop-up automático en la **primera apertura de la app de cada día**, únicamente entre las **4:00 y las 11:30** hora local del dispositivo.
- Si ya se completó ese día, **no vuelve a aparecer**.
- Si el usuario lo cierra sin completarlo, sigue accesible desde la tarjeta principal de la pantalla Hoy durante toda la franja de mañana, y desde Diario en cualquier momento.
- Si el usuario tiene activado **“Mis horarios cambian mucho”** (persona Rosa), la ventana se amplía a 12 horas desde la primera apertura del día y el pop-up se muestra en la primera apertura tras un periodo de ≥ 5 h sin usar la app.
- **Regla anti-molestia:** si el usuario cierra el pop-up sin completarlo **tres días seguidos**, deja de aparecer automáticamente y se le pregunta una sola vez: *“¿Prefieres empezar el día por tu cuenta?”* con opciones “Sí, quítalo” / “No, mantenlo”.

### Flujo (5 pantallas, una pregunta por pantalla)

**R1 — Respiración de entrada (6 s, saltable)**

    ┌───────────────────────┐
    │                       │
    │         ◍             │
    │   (círculo que        │
    │    respira)           │
    │                       │
    │   Antes de empezar,   │
    │   respira una vez.    │
    │                       │
    │        Saltar         │
    └───────────────────────┘

Un círculo se expande 4 s (inhalar) y se contrae 4 s (exhalar) una sola vez; después avanza automáticamente. Sin cuenta atrás visible, sin números.

**R2 — Bienvenida dinámica — \[ELIMINADO EN v4.0\]**

La especificación de este paso —saludo, fecha, frase inspiradora del día y sus variantes según día de la semana, ánimo de la noche anterior, primer día del mes, aniversario de uso y recuperación de *“qué intentar diferente”*— **se ha suprimido de raíz**. R2 no se reubica en ningún producto. Es, junto con el checklist de hábitos del Diario (§C2.6), una de las dos únicas eliminaciones de v4.0.

**Ojo con lo que NO se elimina:** el **encabezado dinámico** de la Vista de Mañana del Diario (§5.3, Bloque 1) —saludo por hora local, fecha completa y frase inspiradora diaria con su biblioteca de ≥ 400 frases y sus reglas de selección— **se conserva íntegro en Lumia**. Lo que desaparece es la pantalla de bienvenida del ritual, no el saludo del producto.

**R3 — Recordatorio de identidad**

    ┌───────────────────────┐
    │  Te estás convirtiendo│
    │  en alguien que       │
    │                       │
    │      crece            │
    │                       │
    │  Hoy toca sobre todo: │
    │   ● Salud             │
    │   alguien que cuida   │
    │   su cuerpo           │
    │                       │
    │  Y estás cultivando:  │
    │   leer antes de dormir│
    │   (día 8 de 21)       │
    │                       │
    │      ‹ Seguir ›       │
    └───────────────────────┘

- Muestra **la identidad central** (siempre) y, debajo, **el área con más hábitos programados para hoy** con su identidad de área (si la tiene) y su color. Así el usuario ve el paraguas estable (“alguien que crece”) y el foco concreto del día (“hoy, Salud”).
- **Selección del área del día:** el área con más hábitos activos hoy. En empate, la que menos ha aparecido en los últimos 7 días (para rotar el foco de forma natural entre áreas sin forzar equilibrio). Si el usuario no tiene áreas, se muestra solo la identidad central.
- Muestra también el Compromiso activo, si existe (§4.6).
- El contador “día 8 de 21” **cuenta días transcurridos, no días cumplidos**: nunca se reinicia, nunca se pierde.
- Enlace discreto: “Cambiar esto” → editor de identidad (central y áreas).

**R4 — Hábitos del día** - Muestra los hábitos programados para hoy, con la posibilidad de marcarlos ya (algunos ya se hicieron antes de abrir la app). - Copy: *“Esto es lo que planeaste para hoy.”* Nunca “Esto es lo que debes hacer”. - Si no hay hábitos configurados: invitación a añadir uno, saltable.

**R5 — Intención del día** - Pregunta: *“¿Con qué intención quieres entrar al día?”* - Un campo de una línea + 6 sugerencias tocables (con calma · con foco · con paciencia · con valentía · presente · sin prisa). - Botón final: **‹ Comenzar mi día ›**

**Cierre:** transición luminosa de 900 ms, la app vuelve a Hoy con la tarjeta principal ya en estado completado y con la intención del día visible en el héroe durante toda la jornada. **Este detalle —ver tu propia intención durante el día— es un delight moment de coste casi nulo.**

### Relación con la Vista de Mañana

Ver decisión D-4.5 (§4.5). El Ritual es el modo guiado; escribe en el mismo `DailyEntry`. Al terminar R5, se ofrece (no se obliga): *“¿Quieres escribir tus agradecimientos y tus tres victorias ahora?”* → lleva a la Vista de Mañana. Si el usuario declina, se le recuerda con la tarjeta de Hoy durante la franja matinal, una sola vez.

### Microinteracciones y animaciones

- Entrada del pop-up: aparece desde abajo con desenfoque del fondo (400 ms, curva de desaceleración). **Nunca aparece de golpe.**
- Entre pantallas: desvanecimiento cruzado con desplazamiento horizontal de 24 px, 320 ms.
- El botón “Comenzar mi día” tiene un ligero brillo que lo recorre una vez al aparecer (800 ms), única animación llamativa de todo el flujo.

### Estados

- **Vacío:** si no hay identidad central (imposible salvo error) ni hábitos, R4 se omite y R3 muestra solo la identidad central; el ritual se reduce a 3–4 pantallas.
- **Carga:** ninguna; todo local.
- **Offline:** completo.
- **Error:** ninguno posible salvo fallo de escritura local.

### Accesibilidad

El pop-up es un diálogo modal correctamente anunciado, con foco atrapado y cierre por gesto o botón siempre disponible. La animación de respiración se sustituye por una indicación estática si “reducir movimiento” está activo. Nunca hay avance automático sin posibilidad de detenerlo.

### Reglas de negocio

- **RN-RM-01** Ventana horaria estricta 4:00–11:30 local (o modo variable).
- **RN-RM-02** Máximo una aparición automática por día.
- **RN-RM-03** No aparece si ya se completó.
- **RN-RM-04** Se puede cerrar en cualquier momento sin perder lo escrito.
- **RN-RM-05** Tras 3 cierres consecutivos sin completar, se desactiva la aparición automática previa consulta.
- **RN-RM-06** Nunca aparece sobre otra pantalla modal (paywall, permiso del sistema, celebración).

### Criterios de aceptación

1.  A las 3:59 no aparece; a las 4:00 sí. A las 11:31 no aparece.
2.  Completado a las 7:00, no reaparece a las 10:00 del mismo día.
3.  Cerrado a las 7:00, sigue accesible desde Hoy a las 10:00.
4.  Cambiar la zona horaria del dispositivo recalcula la ventana correctamente.
5.  En modo “horarios variables”, aparece tras la primera apertura después de 5 h de inactividad.
6.  La intención escrita en R5 permanece visible en Hoy hasta el fin de la franja de día.

# Anexo F — Matriz de trazabilidad v3.1 → v4.0

Cada sección de nivel 2 de v3.1 con su producto y su destino en v4.0. Sirve para verificar que **ninguna sección se ha quedado sin hogar**. Leyenda de producto: **Compartido** (capa Strivo), **Lumia**, **Formia**, **Strivo** (capa de inteligencia), **Ambos** (partida), **Disuelto**.

|                       |                                                                                             |                                  |                                                                                          |
|:----------------------|:--------------------------------------------------------------------------------------------|:---------------------------------|:-----------------------------------------------------------------------------------------|
| § v3.1 ========== 0.1 | Título ============================================== Naturaleza de este documento          | Producto ============ Compartido | Destino en v4.0 ==================================================== Preámbulo (íntegro) |
| 0.2                   | Cómo leer este documento                                                                    | Compartido                       | Preámbulo (íntegro)                                                                      |
| 0.3                   | La pregunta que gobierna el documento                                                       | Compartido                       | Preámbulo (íntegro)                                                                      |
| 0.4                   | Supuestos declarados                                                                        | Compartido                       | Preámbulo (íntegro)                                                                      |
| 0.5                   | Vocabulario canónico                                                                        | Compartido                       | Preámbulo (íntegro)                                                                      |
| 0.6                   | Estado del documento                                                                        | Compartido                       | Preámbulo (íntegro)                                                                      |
| 1.1                   | Misión                                                                                      | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 1.2                   | Visión                                                                                      | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 1.3                   | Manifiesto                                                                                  | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 1.4                   | Valores del producto                                                                        | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 1.5                   | Filosofía de diseño (desarrollo de los diecisiete principios)                               | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 1.6                   | Propuesta de valor                                                                          | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 1.7                   | El problema que resuelve                                                                    | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 1.8                   | Diferenciadores                                                                             | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 1.9                   | Benchmark competitivo                                                                       | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 1.10                  | Oportunidades de innovación                                                                 | Compartido                       | Cap. 8 (íntegro)                                                                         |
| 2.0                   | Método y estatus de la evidencia                                                            | Compartido                       | Cap. 9 (íntegro)                                                                         |
| 2.1                   | Persona primaria — Mariana, “la que sostiene todo”                                          | Compartido                       | Cap. 9 (íntegro)                                                                         |
| 2.2                   | Persona secundaria — Daniel, “el que empieza mil veces”                                     | Compartido                       | Cap. 9 (íntegro)                                                                         |
| 2.3                   | Persona terciaria — Rosa, “la que quiere reencontrarse”                                     | Compartido                       | Cap. 9 (íntegro)                                                                         |
| 2.4                   | Persona cuaternaria — Andrés, “el que ya casi lo tiene”                                     | Compartido                       | Cap. 9 (íntegro)                                                                         |
| 2.5                   | Persona quinaria — Sofía, “la que está pasándolo mal”                                       | Compartido                       | Cap. 9 (íntegro)                                                                         |
| 2.6                   | Antipersonas (para quién NO es Strivo)                                                      | Compartido                       | Cap. 9 (íntegro)                                                                         |
| 2.7                   | Segmentación y priorización                                                                 | Compartido                       | Cap. 9 (íntegro)                                                                         |
| 2.8                   | Hipótesis de riesgo a validar antes de V1                                                   | Compartido                       | Cap. 9 (íntegro)                                                                         |
| 3.1                   | Principio rector                                                                            | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.2                   | La curva emocional del día                                                                  | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.3                   | Etapas emocionales                                                                          | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.4                   | Emociones prohibidas                                                                        | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.5                   | Momentos de deleite planificados (*delight moments*)                                        | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.6                   | Principios de UX Writing                                                                    | Compartido                       | Cap. 10; **§3.6.5** → Cap. 1 (capa compartida)                                           |
| 3.7                   | Microcopys de interfaz (catálogo base)                                                      | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.8                   | Mensajes de estado vacío                                                                    | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.9                   | Mensajes de error                                                                           | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.10                  | Notificaciones                                                                              | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.11                  | Celebraciones                                                                               | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 3.12                  | Reglas para la voz de la IA                                                                 | Compartido                       | Cap. 10 (íntegro)                                                                        |
| 4.1                   | Mapa general de módulos                                                                     | Compartido                       | Cap. 11 (íntegro)                                                                        |
| 4.2                   | Jerarquía de información                                                                    | Compartido                       | Cap. 11 (íntegro)                                                                        |
| 4.3                   | Navegación                                                                                  | Compartido                       | Cap. 11 (íntegro)                                                                        |
| 4.4                   | Dependencias entre módulos                                                                  | Compartido                       | Cap. 11 (íntegro)                                                                        |
| 4.5                   | Relación crítica: Rituales y Diario                                                         | Lumia                            | Cap. 11, anotada: D-4.5 solo aplica a la noche                                           |
| 4.6                   | Tratamiento de “Retos” (resolución de la contradicción)                                     | Formia                           | Cap. 3 (Compromisos)                                                                     |
| 4.7                   | Estados globales del sistema                                                                | Compartido                       | Cap. 11 (íntegro)                                                                        |
| 4.8                   | Máquina de estados del registro diario (`DailyEntry`)                                       | Compartido                       | Cap. 11 (íntegro)                                                                        |
| 4.9                   | Permisos del sistema operativo                                                              | Compartido                       | Cap. 11 (íntegro)                                                                        |
| 4.10                  | Matriz de acceso gratuito / premium                                                         | Compartido                       | Cap. 1                                                                                   |
| 4.11                  | Diagrama de flujo de datos (visión funcional)                                               | Compartido                       | Cap. 11 (íntegro)                                                                        |
| 4.12                  | Reglas de negocio transversales                                                             | Compartido                       | Cap. 11 (íntegro)                                                                        |
| 5.0                   | Plantilla de especificación                                                                 | Compartido                       | Cap. 1 (plantilla de especificación)                                                     |
| 5.1                   | Módulo: Onboarding                                                                          | Compartido                       | Cap. 1 (onboarding P1–P11)                                                               |
| 5.1.1                 | El modelo de identidad                                                                      | Formia                           | Cap. 3 — eje estructural de Formia                                                       |
| 5.2                   | Módulo: Pantalla “Hoy” (raíz)                                                               | Lumia                            | Cap. 2 (pantalla Hoy); §5.2.2 marcada ambigua → §C7.7.3                                  |
| 5.3                   | Módulo nuclear: Diario de Logros y Agradecimientos — Vista de Mañana                        | Lumia                            | Cap. 2 — **sin Bloque 6** (eliminado) y §5.3.1 derogada                                  |
| 5.4                   | Módulo nuclear: Vista de Noche                                                              | Lumia                            | Cap. 2 — **sin Bloque 8** (eliminado) y §5.4.2 derogada                                  |
| 5.5                   | Módulo: Ritual de Mañana                                                                    | Disuelto                         | **Anexo E** (derogado). R1→§C2.3 · R2 eliminado · R3→§C3.3 · R4→§C3.5 · R5→§C2.4         |
| 5.6                   | Módulo: Ritual de Noche                                                                     | Lumia                            | Cap. 2 — **sin cambios**; N2 en conflicto → §C7.7.1                                      |
| 5.7                   | Módulo: Hábitos y su relación con los Rituales                                              | Formia                           | Cap. 3 — H3 corregido (§C3.6); RN-HB-06 sustituida                                       |
| 5.8                   | Módulo: Journal (escritura libre)                                                           | Lumia                            | Cap. 2 (Journal, con §7.7.1 adjunta)                                                     |
| 5.9                   | Módulo: Insights y reflexión personal                                                       | Strivo                           | Cap. 4 — especificación futura                                                           |
| 5.10                  | Módulo: Historial                                                                           | Ambos                            | Emocional → Cap. 2 · constancia → §C3.7 · vista de día → §C7.7.2                         |
| 5.11                  | Módulo: Descubre (Ciencia del Bienestar y Audioteca)                                        | Compartido                       | Cap. 1 — **\[CASO AMBIGUO\]**                                                            |
| 5.12                  | Módulo: Perfil y Ajustes                                                                    | Compartido                       | Cap. 1 (perfil y ajustes)                                                                |
| 5.13                  | Capa: Recordatorios Inteligentes                                                            | Compartido                       | Cap. 1 — **\[CASO AMBIGUO\]** → §C7.7                                                    |
| 5.14                  | Módulos y momentos especiales                                                               | Ambos                            | 5.14.1 y 5.14.2 → Cap. 2 · 5.14.3 → Cap. 4                                               |
| 6.1                   | Principios visuales                                                                         | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.2                   | Dirección de arte: “Amanecer en una habitación”                                             | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.3                   | Color                                                                                       | Compartido                       | Cap. 12; **§6.3.7** → Cap. 1. Color: manda el manual de marca                            |
| 6.4                   | Tipografía                                                                                  | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.5                   | Espaciado y retícula                                                                        | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.6                   | Radios y elevación                                                                          | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.7                   | Iconografía                                                                                 | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.8                   | Componentes                                                                                 | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.9                   | Estados de los componentes                                                                  | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.10                  | Motion design                                                                               | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.11                  | Haptics                                                                                     | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.12                  | Sonido                                                                                      | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.13                  | Modo claro y oscuro                                                                         | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.14                  | Accesibilidad                                                                               | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.15                  | Diseño responsive                                                                           | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 6.16                  | Tono visual de las ilustraciones                                                            | Compartido                       | Cap. 12 (íntegro)                                                                        |
| 7.1                   | Visión general                                                                              | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.2                   | Modelo de datos — entidades                                                                 | Compartido                       | Cap. 13 como referencia; **fuente de verdad → Cap. 5**                                   |
| 7.3                   | Relaciones                                                                                  | Compartido                       | Cap. 13 como referencia; **fuente de verdad → Cap. 5**                                   |
| 7.4                   | Almacenamiento local                                                                        | Compartido                       | Cap. 13 como referencia; **fuente de verdad → Cap. 5**                                   |
| 7.5                   | Sincronización                                                                              | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.6                   | Respaldo y portabilidad                                                                     | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.7                   | Seguridad                                                                                   | Compartido                       | Cap. 13; **§7.7.1** (PIN) → Cap. 2 (Lumia)                                               |
| 7.8                   | Privacidad                                                                                  | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.9                   | Capa de inteligencia artificial                                                             | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.10                  | Notificaciones                                                                              | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.11                  | Analítica                                                                                   | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.12                  | Integraciones futuras                                                                       | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.13                  | Internacionalización                                                                        | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.14                  | Escalabilidad                                                                               | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 7.15                  | Requisitos de rendimiento (criterios de aceptación técnicos)                                | Compartido                       | Cap. 13 (íntegro)                                                                        |
| 8.1                   | Restricciones reales que condicionan este plan                                              | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.2                   | Fase 0 — Fundación (24 jul – 21 ago 2026 · ~80 h)                                           | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.3                   | Fase 1 — MVP privado (22 ago – 9 oct 2026 · ~140 h)                                         | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.4                   | Fase 2 — Beta pública (10 oct – 11 dic 2026 · ~180 h) — **entregable socializable de 2026** | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.5                   | Fase 3 — V1 pública (ene – abr 2027)                                                        | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.6                   | Fase 4 — V2 (may – dic 2027)                                                                | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.7                   | Fase 5 — V3 (2028)                                                                          | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.8                   | Justificación del orden                                                                     | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.9                   | Qué se pospone y por qué                                                                    | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.10                  | Riesgos del plan y mitigaciones                                                             | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 8.12                  | Roadmap ejecutivo (tabla maestra)                                                           | Compartido                       | Cap. 14 (íntegro)                                                                        |
| 9.1                   | Product Manager                                                                             | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 9.2                   | UX Designer                                                                                 | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 9.3                   | UI Designer                                                                                 | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 9.4                   | Psicólogo / Behavioral Designer                                                             | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 9.5                   | Arquitecto de Software                                                                      | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 9.6                   | CTO                                                                                         | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 9.7                   | Inversionista                                                                               | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 9.8                   | Usuario final                                                                               | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 9.9                   | Plan de investigación pendiente antes de V1                                                 | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 9.10                  | Decisiones abiertas que requieren confirmación del propietario del producto                 | Compartido                       | Cap. 15 (íntegro)                                                                        |
| 10.1                  | Decisiones CERRADAS                                                                         | Compartido                       | Cap. 6 (íntegro)                                                                         |
| 10.2                  | Decisiones ABIERTAS                                                                         | Compartido                       | Cap. 6 (íntegro)                                                                         |
| 10.3                  | Trazabilidad: de bloque a sección                                                           | Compartido                       | Cap. 6 (íntegro)                                                                         |

## F.1 Verificación de la lista de control

| Comprobación                                               | Resultado                                                                        |
|:-----------------------------------------------------------|:---------------------------------------------------------------------------------|
| Cada sección de v3.1 tiene hogar claro                     | Sí — tabla anterior; 4 casos ambiguos documentados (§5.2.2, §5.11, §5.13, §5.10) |
| Ritual de Mañana disuelto y cada paso reubicado            | Sí — §C0.5 y Anexo E                                                             |
| Ritual de Noche intacto                                    | Sí — §5.6, con el conflicto N2 anotado en §C7.7.1                                |
| “Intención” y “gran visión” revisados                      | Sí — §C2.4.1: se concluye que son distintos y se justifica no fusionar           |
| Checklist ritual eliminado del Diario                      | Sí — Bloques 6 y 8, §C2.6                                                        |
| Modelo `shared/lumia/formia` con `identityRef` obligatorio | Sí — Cap. 5, RN-DB4-05                                                           |
| H3 especifica la captura de la identidad                   | Sí — §C3.6                                                                       |
| Cap. 0 con arquitectura de marca y dos principios          | Sí — §C0.2, §C0.3                                                                |
| Cap. 4 marcado como especificación futura                  | Sí                                                                               |
| Cap. 7 lista las 6 decisiones abiertas sin resolverlas     | Sí — §C7.1 a §C7.6; los conflictos detectados van aparte en §C7.7                |
| El documento referencia (no duplica) el manual de marca    | Sí — §C0.6 y nota de precedencia en Cap. 12                                      |
