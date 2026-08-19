# Exploración — Lumia·Mañana en tono amanecer

**Rama:** `explora/lumia-am-amanecer` · **Fecha:** 19 ago 2026
**Estado:** propuesta para validación visual. **No aprobada, no mergeada.**

El manual de marca **no se ha tocado**. La paleta vigente sigue siendo la que se
pinta si nadie pide otra cosa: todo lo de esta rama cuelga de un parámetro de URL
que por defecto no existe.

---

## Cómo verlo

```bash
npm run dev
```

- Vigente: `http://localhost:5173/#/lumia/hoy`
- Propuesta A: `http://localhost:5173/?paleta=a#/lumia/hoy`
- Propuesta B: `http://localhost:5173/?paleta=b#/lumia/hoy`

Contraste de las dos propuestas, medido con la misma fórmula y los mismos
umbrales que `lint:contraste` aplica a la paleta vigente:

```bash
node scripts/explora-lumia-am.js
```

---

## Dos hallazgos previos, independientes de si la propuesta gusta

**1. `lumia-am-200` (`#E5C2DC`) está declarado y no se pinta.**
Es el hex que el manual §4.3 presenta como el rosa de Lumia·Mañana, y lo fija un
test (`marca.test.js`, criterio 4), pero **ningún CSS lo consume**. Lo que se ve
en pantalla es `am-300` (`#F6DDE8`) en la cabecera y en la parada del 62 % del
degradado, `am-50` arriba y `am-100` abajo. Cambiar solo `am-200` no cambiaría
nada visible.

**2. `lumia-am-100` sirve a los dos momentos.**
Es la parada final del degradado de la mañana **y** la cabecera de Lumia·Noche
(`tokens-lumia.css:44`). Un reemplazo literal de los cuatro tokens teñiría el
cromo nocturno, que en esta ronda no se toca. El overlay lo evita fijando la
cabecera nocturna a `#DCCFF1`, y está verificado: con las tres paletas,
Lumia·Noche resuelve `cabecera #DCCFF1 · base #F3EFEA · borde #8D82B6`.

> **Si la propuesta se aprueba, esto hay que decidirlo de verdad:** o Lumia·Noche
> estrena un token propio de cabecera, o `am-100` deja de servir a dos momentos.
> No es un detalle de implementación; es una línea del manual.

---

## Las dos propuestas

Misma estructura que la vigente: cuatro variantes, mismos nombres, mismo papel
para cada una. Aprobar una es reemplazar cuatro líneas de `tokens-lumia.css`.

| token | papel | vigente | **A · Amanecer rosado** | **B · Alba dorada** |
|---|---|---|---|---|
| `lumia-am-50` | base de la página · inicio del degradado | `#F6F2E9` | `#FCF3EC` | `#FDF5E1` |
| `lumia-am-300` | cabecera del espacio · 62 % del degradado | `#F6DDE8` | `#FBDCD1` | `#FCEBB4` |
| `lumia-am-100` | final del degradado (el horizonte) | `#DCCFF1` | `#F2C4B5` | `#F8E09A` |
| `lumia-am-200` | tono de firma (hoy sin pintar) | `#E5C2DC` | `#EDB2A0` | `#F4D386` |

**A · Amanecer rosado** — naranja con memoria del rosa que sustituye. Matiz ~16°.
**B · Alba dorada** — oro limpio, sin rosa. Matiz ~46°. Es la que más se apoya en
`--color-breath` (`#E8A54A`), el dorado del círculo de respiración que ya vive en
la mañana de Lumia (nota 2 del encargo).

En ninguna de las dos cambia el acento ni el borde: siguen siendo los primarios
morados de Lumia (`#6C5AA7` / `#8D82B6`), que son la firma de la marca y no
dependen del momento.

---

## Contraste — las dos pasan AAA

Umbrales: cuerpo AAA 7:1 (§6.3.6) · no-texto 3:1 (WCAG 2.2 1.4.11) · separador
1,5:1 (el listón del proyecto desde SPEC_05). Ninguna propuesta se presenta con
un par por debajo: `explora-lumia-am.js` sale con código 1 si eso pasa.

| par | mín | vigente | A | B |
|---|---|---|---|---|
| cuerpo sobre base (`am-50`) | 7:1 | 14,36 | 14,65 | 14,77 |
| secundario sobre base | 7:1 | 10,57 | 10,78 | 10,87 |
| cuerpo sobre cabecera (`am-300`) | 7:1 | 12,55 | 12,43 | 13,51 |
| secundario sobre cabecera | 7:1 | 9,24 | 9,15 | 9,95 |
| acento sobre cabecera | 3:1 | 4,49 | 4,44 | 4,83 |
| borde sobre cabecera | 1,5:1 | 2,74 | 2,71 | 2,95 |
| cuerpo sobre horizonte (`am-100`) | 7:1 | 10,88 | 10,19 | 12,32 |
| secundario sobre horizonte | 7:1 | 8,01 | 7,50 | 9,07 |
| cuerpo sobre firma (`am-200`) | 7:1 | 10,00 | 8,77 | 11,09 |

Los tres últimos pares **no** están en `lint-contraste.js` y aquí se exigen a
propósito: el degradado de Hoy termina en `am-100` y el héroe escribe encima. Hoy
ese par vive entre los informativos porque el lavanda no llega a AAA con holgura;
una paleta cálida sí puede, así que se exige en vez de heredar la excepción.

---

## El riesgo que no es de contraste

Formia·Mañana **ya es cálida**. Llevar Lumia·Mañana al naranja acerca los dos
espacios justo a la hora en que §6.1 pide que se distingan.

| superficie | hex | matiz | croma |
|---|---|---|---|
| Formia·AM cabecera | `#E8D9C4` | 35° | 44 % |
| Formia·PM cabecera | `#FFC29C` | 23° | 100 % |
| A cabecera | `#FBDCD1` | 16° | 84 % |
| A horizonte | `#F2C4B5` | 15° | 70 % |
| B cabecera | `#FCEBB4` | 46° | 92 % |
| B horizonte | `#F8E09A` | 45° | 87 % |

Hoy la distancia es de ~300°: el rosa y la arena no se confunden nunca. Con A
baja a 19° contra Formia·AM y a **8° contra el melocotón de Formia·Noche**. Con B
se queda en 11° y 22°.

Conviene saber además que **la base ya coincide hoy**: Lumia `#F6F2E9` contra
Formia `#F7F2E9`, un dígito de diferencia. Lo que separa los dos espacios no es
la base sino la cabecera, el degradado y el acento — y el acento es el que se
mantiene: morado `#6C5AA7` en Lumia, óxido `#B45A2B` en Formia. Es lo único que
en las capturas sigue diciendo "esto es Lumia" sin leer el rótulo.

**Lectura corta:** B se defiende mejor de la confusión con Formia; A conserva la
continuidad con lo que ya existe. Ninguna de las dos resuelve sola la pregunta de
si los dos espacios deben compartir familia cálida por la mañana. Esa pregunta es
del propietario de la marca, no del código.

---

## Qué toca esta rama

| archivo | qué hace |
|---|---|
| `src/styles/explora-lumia-am.css` | **nuevo** · las dos paletas, tras `[data-paleta]` |
| `src/styles/globals.css` | +3 líneas · un `@import` del anterior |
| `src/App.jsx` | +10 líneas · lee `?paleta=` y escribe `data-paleta` |
| `scripts/explora-lumia-am.js` | **nuevo** · el medidor de contraste |
| `docs/exploracion/LUMIA_AM_AMANECER.md` | **nuevo** · esto |

Sin el parámetro, `paletaExplorada()` devuelve `undefined`, React no escribe el
atributo y ningún selector del overlay engancha. Verificado en navegador: la
captura "vigente" resuelve los cuatro tokens del manual sin tocar.

`npm test` (438), `lint:copy`, `lint:contraste` y `format:check` siguen en verde.
**No se ha modificado el manual de marca, ni `design-tokens.json`, ni
`tokens-lumia.css`, ni nada de Formia.**

### Para retirarla

Borrar los dos archivos nuevos y revertir las 13 líneas de `globals.css` y
`App.jsx`. No queda rastro en los tokens.

### Para aprobar una

1. Decidir lo de `am-100` (arriba).
2. Versionar el manual: §4.3 y su tabla de §4.8.
3. Llevar los cuatro hexes a `design-tokens.json` y a `tokens-lumia.css`.
4. Actualizar `marca.test.js` (criterio 4 fija `#E5C2DC`) y `lint-contraste.js`.
5. Recalcular si `#5D4766` sigue siendo el punto de convergencia — **fuera de
   esta ronda por indicación expresa**, pero es consecuencia directa.
