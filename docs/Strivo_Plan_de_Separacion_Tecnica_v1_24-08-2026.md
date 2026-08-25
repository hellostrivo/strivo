# Plan de separación técnica — Strivo

**Versión 1.0 · 24 de agosto de 2026**

*Documento operativo, hermano del Blueprint de Producto v5.0. **No es contenido de producto.** Existe para poder ejecutar el repliegue de alcance sin perder trabajo, y para que el Blueprint pueda leerse limpio, como el documento rector de una sola aplicación.*

*Este es el único documento del proyecto donde aparece el nombre del alcance que se pausa. Cuando la depuración esté cerrada, este documento puede archivarse junto a la rama de resguardo.*

---

## 1. La decisión

El 24 de agosto de 2026 se decide lanzar **una sola aplicación**. El producto desarrollado hasta hoy bajo el nombre interno **Lumia** pasa a llamarse **Strivo** y es el único producto activo. **Formia queda pausada por tiempo indefinido** — congelada, no cancelada.

A partir de esta decisión, Formia no forma parte del producto activo, ni de la rama principal de trabajo, ni del paquete de la aplicación, ni de las pruebas que se ejecutan.

---

## 2. Estado del repositorio revisado

Revisión de `github.com/hellostrivo/strivo`, rama `phase-1-lumia-formia`, hasta el commit `e7d4625` («frase del día», 24 ago 2026).

- La rama `main` está congelada en el commit inicial del 4 de agosto y **no refleja el trabajo real**.
- La rama activa es `phase-1-lumia-formia`, con 34 commits.
- Netlify vigila esa rama con publicación automática.
- 52 archivos de prueba, del orden de 1.180 casos.
- **95 archivos contienen la cadena `formia`**, de los cuales 27 son exclusivamente suyos.

### Trabajo reciente que el Blueprint v4.1 no recogía

Los commits del 19 al 24 de agosto rediseñaron a fondo el producto que ahora es Strivo, y ninguno de esos cambios estaba en el documento rector. El Blueprint v5.0 los incorpora:

| Commit | Fecha | Qué cambió |
|---|---|---|
| `75c096e` | 19 ago | Botones Mañana/Noche movidos al inicio de Hoy |
| `3e4621b` | 19 ago | Los recorridos se despliegan dentro de las pestañas, sin paso intermedio |
| `14ce4c5`, `38e2924`, `ec6ceb4` | 19 ago | Nuevo orden de preguntas; rediseño de gratitud matutina |
| `57365fb` | 19 ago | Pantalla de entrada de marca (vestíbulo) |
| `0aa1132`–`945c65b` | 20 ago | Respiración completa: motor, visuales, sonido, guardadas, integración |
| `5347b2e` | 20 ago | Correcciones del Journal |
| `6466109` | 21 ago | Cambio de paleta |
| `5ba4c92` | 23 ago | **Eliminación del concepto de logros** |
| `1be5fb0`, `74f9c1b` | 23 ago | **Rediseño de mañana y noche en tres momentos**, con consulta, emoción de cierre y descarga |
| `20ffd02`, `0081543` | 24 ago | Respiración pasa de acceso del vestíbulo a **sección del producto** |
| `e7d4625` | 24 ago | Frase del día |

---

## 3. La rama de resguardo

```
git checkout phase-1-lumia-formia
git pull
git checkout -b formia-paused
git push -u origin formia-paused
```

**Congelar `formia-paused` inmediatamente después de crearla.** Protegerla en GitHub contra escritura y borrado. Es el único registro del trabajo pausado y no debe recibir commits nuevos: si algún día se retoma, se retoma desde ahí, no encima de ahí.

Anotar en la descripción de la rama: *estado congelado del 24 de agosto de 2026; contiene ambos alcances; no integrar en la rama activa.*

### La rama activa

La rama de trabajo actual se llama por una arquitectura que ya no existe. Recomendación:

```
git checkout phase-1-lumia-formia
git checkout -b strivo
git push -u origin strivo
```

Y **repuntar Netlify a `strivo`** antes de borrar nada, verificando que la publicación automática funciona. Después, valorar promover `strivo` a rama por defecto y retirar `main`, que está obsoleta.

---

## 4. Inventario de lo que sale de la rama activa

### 4.1 Archivos exclusivos de Formia — se eliminan

Nada de esto tiene consumidores fuera de Formia. Se borran de la rama activa; viven en `formia-paused`.

**Lógica y datos**
- `src/formia/identidad.js`, `src/formia/habitos.js`, `src/formia/useIdentidad.js`, `src/formia/useHabitos.js`
- `src/formia/__tests__/identidad.test.js`, `src/formia/__tests__/habitos.test.js`
- `src/lib/db/formia.js`, `src/lib/db/__tests__/formia.test.js`

**Componentes**
- `src/components/formia/` — los trece componentes: `AreaCard`, `AreaIcon`, `Constancia90`, `ConstanciaPorIdentidad`, `EditorIdentidad`, `EvidenciaIdentidad`, `HabitoItem`, `IdentidadCentral`, `NavFormia`, `SelectorAreas`, `SelectorEmoji`, `SelectorIdentidad`

**Pantallas**
- `src/pages/formia/` — `Identidad`, `Habitos`, `HabitoNuevo`, `HabitoDetalle`, `Progreso`

**Estilos y recursos**
- `src/styles/tokens-formia.css`
- `src/assets/marca/formia_simbolo.svg`

**Ayudantes que viven fuera de `formia/` pero son suyos.** Este es el hallazgo menos evidente de la revisión: tres módulos de `src/lib/` no llevan el nombre en la ruta, pero **su único consumidor es Formia**. Si se dejan, quedan como código muerto en el paquete.

| Archivo | Único consumidor |
|---|---|
| `src/lib/constancia.js` | `Progreso.jsx`, `formia/habitos.js` |
| `src/lib/habitAreaLabel.js` | `HabitoItem.jsx`, `HabitoDetalle.jsx` |
| `src/lib/sugerirIdentidad.js` | `HabitoNuevo.jsx` |
| `src/lib/__tests__/constancia.test.js` | — |

### 4.2 Archivos compartidos que hay que editar

Aquí no basta con borrar: hay que quitar la parte y comprobar que lo que queda sigue en pie.

**`src/components/ArranqueProvisional.jsx` — la única dependencia bloqueante.**
Importa `EditorIdentidad`, la capa de datos de Formia y el ayudante de prefijo de identidad, y **condiciona el arranque de la app a que exista una identidad central**. Al retirar Formia, la app no arranca hasta que este archivo se reescriba. Debe crear la sesión local y el árbol de datos sin pedir nada, o pedir solo el nombre.
**Es el primer archivo a tocar y el que decide si la rama compila.**

**`src/lib/db/index.js`** — retirar la exportación de `formia`, la llamada de inicialización del árbol de Formia y sus ramas (`identity`, `identityHistory`) de la lista de creación.

**`src/lib/db/schema.js`** — retirar el catálogo de siete áreas, el máximo de áreas seleccionadas, la constante de identidad central, las enumeraciones de estados de área y de hábito, los contextos de hábito, las definiciones de campos de `area`, `identityVersion`, `habit` y `habitLog`, sus validadores, las rutas de Formia y sus etiquetas de colección. **Conservar** los errores genéricos, las fechas, el género y el ánimo de cinco estados.

**`src/App.jsx`** — retirar las tres rutas de Formia, la navegación de Formia, la función que decide el espacio de una ruta, el atributo de espacio y el vestíbulo. Aprovechar para retirar también el andamio de exploración de paletas (`paletaExplorada`).

**`src/pages/Home.jsx`** — se elimina por completo: el vestíbulo desaparece (Blueprint §D-1).

**`src/components/shared/BarraStrivo.jsx`** — se elimina: solo servía para volver al vestíbulo.

**`src/components/shared/Simbolo.jsx`** — retirar el símbolo de Formia del mapa de marcas.

**`src/copy/index.js`** — retirar el espacio de nombres `formia` completo, la entrada de Formia en `shared.home` y en `shared.navegacion`, `insights.area` (evidencia de identidad) y `profile.identity`. **Conservar** `insights.weekly`, que no depende de nada retirado.

**`src/styles/globals.css`** — retirar la importación de los tokens de Formia, las reglas de peso tipográfico por espacio y todas las reglas que seleccionan por el espacio de Formia.

**`src/tokens/design-tokens.json`** — retirar las dos paletas de Formia. **Conservar** la escala neutra de marca: la usa Respiración.

**`eslint.config.js`** — la regla que impedía que los dos espacios se leyeran entre sí pierde la mitad de su objeto. Debe reescribirse para custodiar lo que sigue siendo cierto: que Respiración no lee el diario y que los componentes compartidos no importan nada específico de una sección.

**`scripts/lint-contraste.js`** — retirar las combinaciones de las paletas eliminadas.

### 4.3 Pruebas que hay que revisar

| Archivo | Menciones | Qué hacer |
|---|---|---|
| `src/components/shared/__tests__/navegacion.test.js` | 36 | Reescribir: verificaba vestíbulo, barra y ausencia de cruces |
| `src/components/shared/__tests__/marca.test.js` | 15 | Reescribir: verificaba cuatro paletas y tres símbolos |
| `src/lumia/__tests__/separacion.test.js` | 9 | Reescribir: la separación que custodia cambia de forma |
| `src/components/shared/__tests__/transicionLuz.test.js` | 8 | Ajustar: el umbral ya no distingue destino |
| `src/lib/db/__tests__/sync.test.js` | 7 | Ajustar a dos ramas |
| `src/breathing/__tests__/navegacion.test.js` | 10 | Ajustar rutas |
| `src/lib/db/__tests__/schema.test.js`, `shared.test.js` | 3 + 3 | Ajustar |
| `src/breathing/**` (visuales, sonido, repositorio, separación) | 2–6 c/u | Ajustar comentarios y aserciones de rutas |
| `src/copy/__tests__/respiracion.test.js` | 2 | Ajustar |

**Regla de oro para esta parte:** ninguna prueba se borra sin decidir explícitamente si lo que verificaba **sigue siendo cierto**. Una prueba que custodiaba una regla vigente debe reescribirse, no eliminarse. Una que custodiaba una regla derogada se elimina con una nota en el commit que diga cuál.

### 4.4 Documentación

| Archivo | Menciones | Qué hacer |
|---|---|---|
| `docs/blueprint/Strivo_Blueprint_de_Producto_v4_1.md` | 125 | Sustituir por el Blueprint v5.0 |
| `CLAUDE.md` | 55 | Reescribir por completo contra v5.0 |
| `docs/specs/SPEC_00` a `SPEC_16` | 2–21 c/u | Archivar en `formia-paused`. Son el registro de cómo se construyó lo anterior, no instrucciones vigentes |
| Manual de marca | — | Reeditar: una marca, dos paletas, un símbolo |
| `ROADMAP.md` | 2 | Sustituir por §16 del Blueprint v5.0 |
| `docs/exploracion/LUMIA_AM_AMANECER.md` | 8 | Archivar con el andamio de exploración |

### 4.5 Andamio de exploración a retirar

Rastro de una rama de exploración de paletas que sigue en la activa:

- `scripts/explora-lumia-am.js`
- `src/styles/explora-lumia-am.css` y su importación en `globals.css`
- La función `paletaExplorada()` y el atributo de paleta en `App.jsx`

---

## 5. Orden de ejecución

El orden importa: la rama no compila hasta que el paso 2 está hecho.

| # | Paso | Verificación |
|---|---|---|
| **1** | Crear y proteger `formia-paused`. Crear `strivo` desde el mismo punto | Ambas ramas en el remoto |
| **2** | Reescribir `ArranqueProvisional.jsx` sin dependencias de Formia | La app arranca |
| **3** | Depurar `db/index.js` y `db/schema.js` | `npm run test` sobre la capa de datos |
| **4** | Retirar rutas, vestíbulo, barra inferior y navegación de Formia de `App.jsx` | La app navega con cuatro secciones |
| **5** | Eliminar los 27 archivos exclusivos y los tres ayudantes de `lib/` | `npm run build` sin importaciones rotas |
| **6** | Depurar copy, tokens, estilos y contraste | `lint:copy` y `lint:contraste` en verde |
| **7** | Reescribir `eslint.config.js` | `npm run lint` con cero advertencias |
| **8** | Revisar las pruebas de §4.3, una por una | `npm run test` en verde |
| **9** | Ejecutar el renombrado del anexo | Los seis comandos en verde |
| **10** | Sustituir documentación; repuntar Netlify a `strivo` | Publicación verificada en el dispositivo |

**Un commit por paso**, con mensaje que diga qué se retira y por qué. Es lo que permitirá reconstruir esto si algún día se retoma.

---

## 6. Comprobación final

La depuración está cerrada cuando todo lo siguiente es cierto:

```
grep -ri "formia" src/ scripts/ docs/ *.md *.js *.json    →  sin resultados
grep -ri "lumia"  src/ scripts/ docs/ *.md *.js *.json    →  sin resultados
npm run lint && npm run lint:copy && npm run lint:contraste
npm run format:check && npm run test && npm run build      →  los seis en verde
```

Y, a ojo: el paquete de producción no contiene ningún módulo de lo retirado; la app abre en Hoy; la navegación muestra cuatro secciones; y no queda ni una cadena de texto, ni un color, ni una ruta que nombre nada que ya no exista.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| La app no arranca tras retirar la capa de datos de Formia | Paso 2 primero, aislado, con verificación antes de continuar |
| Se pierde trabajo al borrar | `formia-paused` creada y protegida **antes** de tocar nada |
| Netlify deja de publicar | Repuntar y verificar **antes** de retirar la rama antigua |
| Se borran pruebas que custodiaban reglas vigentes | Revisión archivo por archivo, §4.3, con nota en cada commit |
| Quedan módulos huérfanos en el paquete | Los tres ayudantes de `lib/` de §4.1 son el caso conocido; verificar el paquete construido |
| El renombrado de la rama de datos rompe instalaciones existentes | No hay base instalada: la prueba con personas externas no ha ocurrido. Hacerlo ahora |

---

## 8. Diccionario de renombrado

Para quien ejecute el cambio en el repositorio.

| Antes | Después |
|---|---|
| Nombre del producto en interfaz | **Strivo** |
| `/lumia/hoy`, `/lumia/journal`, `/lumia/respiracion`, `/lumia/historial` | `/hoy`, `/journal`, `/respiracion`, `/historial` |
| Rama de datos `lumia/` | `diario/` |
| Espacio de nombres de copy `copy.lumia.*` | `copy.diario.*` |
| Tokens `--lumia-am-*`, `--lumia-pm-*` | `--strivo-am-*`, `--strivo-pm-*` |
| Atributo `data-space` | *(se elimina: hay un solo espacio)* |
| Atributo `data-lumia` | `data-momento` |
| Carpetas `src/lumia/`, `src/components/lumia/`, `src/pages/lumia/` | `src/diario/`, `src/components/diario/`, `src/pages/diario/` |
| `src/lib/db/lumia.js` | `src/lib/db/diario.js` |
| `src/styles/tokens-lumia.css` | `src/styles/tokens-strivo.css` |
| Componente de navegación de sección | `NavStrivo` |
| Cabecera «Marca · Reflexión» | «Strivo» |
| Símbolo de la app | `strivo_simbolo.svg` |
| Rama de trabajo | Una rama con nombre de producto, no de arquitectura |

---


---

*Fin del documento.*
