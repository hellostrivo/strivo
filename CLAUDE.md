# CLAUDE.md — Strivo

**Última actualización:** 12 nov 2026 · **Estado:** una sola aplicación, cuatro secciones y su onboarding
**Blueprint (documento rector):** `/docs/blueprint/Strivo_Blueprint_de_Producto_v5_0_24-08-2026.md`
**Manual de marca:** `/docs/blueprint/BRAND_MANUAL_STRIVO.md`
**Plan operativo del repliegue:** `/docs/Strivo_Plan_de_Separacion_Tecnica_v1_24-08-2026.md`

Este archivo es la referencia rápida para sesiones de desarrollo. **Si una decisión no está aquí,
está en el blueprint.** Si las dos discrepan, manda el blueprint y este archivo se corrige.

---

## 1. La esencia (lee esto primero)

**Strivo es un refugio digital: un lugar íntimo y breve donde volver a ti al empezar y al terminar el
día.** La promesa es que quien lo usa termine el día sintiéndose en paz, agradecido, presente y con
algo reconocido de sí mismo. No más productivo. No más optimizado. **En paz.**

La pregunta central del producto —la que ordena todas las demás— es **«¿Cómo estoy?»**.

**Strivo es una aplicación, y solo una.** No contiene otras aplicaciones, no es un ecosistema y no es
un contenedor de nada. No hay vestíbulo, no hay navegación de nivel superior y no hay marca por
encima de la app: la app **es** la marca.

**Lo que no es** (§1.2 — normativo, no retórico):

- **No es productividad.** No hay pendientes, no hay metas medibles, no hay nada que optimizar.
- **No es un rastreador.** No cuenta días seguidos, no puntúa, no premia ni penaliza.
- **No es meditación.** Respiración es una herramienta de calma, no un catálogo de sesiones guiadas.
- **No es una agenda.** Lo que se escribe se escribe para vivirlo, no para consultarlo con eficiencia.
- **No es una red social.** No hay audiencia, no hay comparación, nada es compartible por defecto.
- **No es un sustituto terapéutico.** No diagnostica, no interpreta, no evalúa.
- **No es un coach.** No da órdenes, no corrige, no propone que la persona sea distinta de como es.

**El diferenciador:** la app devuelve **lo que la persona escribió, con la pregunta delante**. Sin
resumen, sin etiqueta, sin interpretación. La app no sabe cómo estás; guarda lo que dijiste y te lo
devuelve tal como lo dijiste.

**Sobre el nombre.** Tiene raíz en una palabra de empuje y **la narrativa no se apoya en el
esfuerzo**. Ninguna pieza de copy explica su origen ni lo usa como llamada a la acción.

---

## 2. Navegación (cinco destinos, repartidos en dos barras)

```
Strivo
├── Umbral de entrada  (video de marca, una vez por sesión)
│
├── cabecera — lo que se hace ahora
│   ├── /hoy           pantalla raíz
│   │   ├── Mañana     → 3 momentos → cierre → consulta
│   │   └── Noche      → 3 momentos → cierre → consulta
│   ├── /journal       escritura libre, protegible con PIN
│   └── /respiracion   configuración → sesión → cierre
│
└── barra inferior — lo que ya pasó, y tú
    ├── /historial     calendario → día completo
    └── /perfil        nombre · género · horarios · frases · cuenta · sincronización
```

**El reparto es la decisión, no la maquetación** (26 ago 2026). Arriba, bajo el símbolo, lo que se
hace ahora: el día, lo que se escribe, el aire. Abajo, lo que ya pasó y tú. **Las dos barras
acompañan a todas las pantallas**: con la de abajo solo en Hoy, llegar al Historial desde el Journal
costaría dos toques donde antes costaba uno.

**Esto deroga «no hay barra inferior».** La barra derogada el 25 de agosto era otra cosa: navegación
de nivel superior que devolvía al vestíbulo, sobre una app que no tiene niveles. Esta no lleva a
ningún sitio por encima del producto; lleva a dos destinos que ya estaban dentro de él.

| Regla | Enunciado |
|---|---|
| **RN-NAV-01** | **Cinco destinos: tres arriba, dos abajo.** Un sexto exige revisar el capítulo 4, no basta con añadirlo — la puerta sigue cerrada, solo se movió una vez y a la vista. El blueprint §4 está pendiente de esta revisión. |
| **RN-NAV-02** | Orden fijo. Arriba **Hoy · Journal · Respiración**; abajo **Historial · Tu perfil**. El razonamiento no cambió, se cumple mejor: el Historial ya no tiene que encajar al final de una lista de cosas que se hacen hoy, porque no está en ella. |
| **RN-NAV-03** | Profundidad máxima de tres toques desde cualquier punto. |
| **RN-NAV-04** | La navegación se oculta durante la escritura activa y las secuencias de cierre. Son estados de flujo, no de navegación. |
| **RN-NAV-05** | Volver a una sección devuelve donde estabas, no a su raíz. Se olvida entre sesiones a propósito. |
| **RN-NAV-06** | Ruta desconocida devuelve a `/hoy`, sin mensaje de error. |
| **RN-NAV-07** | PWA estática con `HashRouter`. **Si alguien lo cambia a `BrowserRouter`, hay que añadir el `_redirects` de Netlify antes** o las rutas profundas darán 404. |

**Antes de todo esto, una vez en la vida de la cuenta, está el onboarding**
(`src/components/onboarding/`). No es una quinta sección y no tiene ruta: `App.jsx` pregunta al árbol
de datos si queda pendiente y monta uno u otro. No lo alcanza ningún enlace y no se vuelve a ver.
**Abre con el mismo umbral que cualquier otra apertura** —el video de marca— y con el mismo contador
de sesión: no tiene una apertura propia, así que no hay una segunda variante que mantener.

**El umbral de entrada** (§4.3): velo de luz, **una vez por sesión** (`src/lib/umbralSesion.js`). No
es una secuencia: sin botón de avanzar, toda su superficie lo salta. Con `prefers-reduced-motion`
**no se muestra**. El contenido va montado detrás antes de que la luz se vaya — un velo sobre una
pantalla en blanco no es un umbral, es una espera con luz.

**Dentro del velo va una cosa u otra según dónde se monte, y siguen siendo la misma pieza**
(`TransicionLuz`, RN-LU-MAN-01):

| Dónde | Qué lleva dentro | Quién decide que se acabó |
|---|---|---|
| Al abrir la app (`App.jsx` y `Onboarding.jsx`, `conVideo`) | El video de apertura de la marca, 4 s, sin sonido y sin bucle | El propio video (`onEnded`); el temporizador de 5 s es la red de seguridad si el autoplay no arranca |
| Al aparecer la Mañana (`Hoy.jsx`, por defecto) | Una frase del repertorio de apertura | El temporizador de 5 s |

**Y el video no se va de golpe: se despide** (26 ago). Hasta ahora `onEnded`
desmontaba el umbral entero, así que la pantalla de detrás aparecía en el mismo
fotograma en el que el video dejaba de pintarse — un corte, no un umbral. Ahora
la salida se cuenta en dos tiempos: el último fotograma se desvanece sobre el
velo —liso y del tono del momento: papel de día, índigo `#191428` de noche; ninguno es el
fondo del video, índigo (44,39,75), y eso está anotado como deuda—, el velo se queda
solo un instante, y después se retira dejando aparecer lo que ya estaba montado
detrás. **No es una secuencia y no le añade nada a RN-LU-MAN-02**: nadie avanza
esos tiempos, no hay nada que decidir y toda la superficie lo sigue saltando
entero. **Solo se despide el video que llegó a su final por su cuenta** —lo dice
el propio nodo, `ended`—: un toque, un error o la red de seguridad salen al
instante, porque un toque es alguien diciendo que ya. Las dos duraciones viven
en `TransicionLuz.jsx` (`DESPEDIDA`, `RETIRADA`) y sus curvas en `globals.css`;
hay una prueba que compara las dos parejas.

El `<video>` va con **`muted`, `playsInline` y `autoPlay`** —los tres, o iOS no reproduce— y `muted`
se repite sobre el nodo en un efecto, porque React no siempre lo escribe como atributo. **Nunca
`loop`.** Con movimiento reducido el componente pondría el logo quieto en su lugar, pero esa rama no
llega a montarse: `App` entra directo a Hoy (RN-VIS-05).

**El velo tapa desde el primer fotograma, y lo que entra despacio es el video** (26 ago). La curva de
entrada iba sobre el velo entero, así que durante sus 480 ms era semitransparente y dejaba ver justo
la pantalla que el umbral viene a cubrir: al abrir la app con onboarding pendiente, un destello del
primer paso antes de que empezara el logo. **Un umbral que enseña lo que tapa no está tapando nada.**
Por el mismo motivo, quien lo monta **lo decide al construir su estado y no en un efecto**: un efecto
corre después del primer pintado, y ese fotograma asomaba igual. Y por el mismo motivo los dos
instantes de arranque —resolver el uid, preguntar si queda onboarding— se pintan con el tono del velo
y no con el papel de la app: detrás de ellos viene el umbral, y un fotograma crema delante de un velo
nocturno es un fogonazo a las once. La regla del momento por reloj vive en `lib/timeSlot`
(`momentoDe`), que es de donde la toman `App` y el onboarding.

**Y se encaja entero: `object-contain`, nunca `object-cover`** (RN-VIS-06). El archivo es vertical
(1080×1920) y la pantalla no siempre lo es. Con `cover` —que amplía hasta cubrir— una ventana de
portátil de 1440×900 lo pintaba a 1440×2560, recortando 1660 px y dejando todo lo de dentro enorme.
**Ninguna medida del umbral va en píxeles fijos**, tampoco la del logo quieto: se miden contra la
pantalla (`min(40vh, 36vw)`), porque no se sabe en qué se abre la app.

---

## 3. Reglas de voz (§3.2 y §3.3)

**Tono:** cálido, cercano, breve. Tuteo. Sin condescendencia y sin entusiasmo impostado. Strivo habla
como alguien que te conoce lo justo y te tiene aprecio: no te anima a gritos, no te da lecciones y no
finge que todo está bien.

**Léxico prohibido — no aparece nunca, ni en copy visible ni en texto accesible:**

- **Fracaso:** «fallaste», «incumpliste», «abandonaste», «te faltó», «incompleto», «pendiente»
  (referido a la persona).
- **Deber:** «deberías», «tienes que», «necesitas hacer».
- **Medición:** «racha», «streak», «puntuación», «nivel», «progreso» (como número), «porcentaje».
- **Productividad:** «tarea», «pendiente», «objetivo», «meta», «optimizar», «rendimiento»,
  «productividad».
- **Diagnóstico:** «ansiedad», «depresión», «trastorno», «síntoma», y cualquier término clínico
  aplicado a la persona.
- **Signos de exclamación.** Hoy no hay ninguno autorizado.

**Cómo suena bien:** «Puede ser algo pequeño.» · «No necesitas resolverlo ahora.» · «Este día no
tiene nada escrito. También estuviste.» · «Nada con esas palabras. Todo lo demás sigue aquí.»

**Cómo suena mal:** «¡Felicidades! ¡Llevas 7 días seguidos!» · «Te faltó completar tu ritual de hoy.»
· «Tu ánimo ha mejorado un 20 % esta semana.»

| Regla | Enunciado |
|---|---|
| **RN-VOZ-01** | **Ningún string se escribe en un componente.** Todo el texto visible vive en `src/copy/index.js`. Un texto en el componente es un defecto, aunque sea correcto. |
| **RN-VOZ-02** | `npm run lint:copy` antes de integrar. Un término prohibido detiene la integración. |
| **RN-VOZ-03** | **Las preguntas principales de la mañana y de la noche no cambian de redacción.** La estabilidad es lo que las vuelve familiares. Solo se personalizan las ideas de apoyo. |

**Género gramatical** (§3.4): tres valores —masculino, femenino, neutro— y **se persiste el
identificador, nunca la etiqueta** (RN-GEN-01), de modo que cambiar el género reescribe también lo ya
guardado. El neutro se redacta sin marca («Con cansancio», «Con inquietud») o con «mismo/a»;
**no se usa la terminación en -e** (RN-GEN-02). La palabra propia no pasa por el resolutor: se
muestra tal cual, entre comillas (RN-GEN-03).

> **Ojo con `lint-copy.js`.** Algunas palabras prohibidas son vocabulario legítimo en un catálogo
> emocional («Con ansiedad» en el Journal) o maquinaria interna. El script comprueba el léxico
> clínico sobre el *namespace* que corresponde, no sobre todo `src/`, y **no revisa `__tests__`**:
> una prueba que comprueba que el léxico prohibido no aparece tiene que poder nombrarlo.

---

## 4. Tokens de diseño

**El manual de marca es la fuente única para color, tipografía y símbolos. Ningún valor cromático se
escribe a mano en un componente** (§10.1). Los valores viven en `src/tokens/design-tokens.json` y en
`src/styles/tokens-strivo.css`, y se aplican por variables.

### Los dos momentos

| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| `strivo-am-50` | `#FAF3E9` | | `strivo-pm-50` | `#F2EDE5` |
| `strivo-am-100` | `#E8C9A4` | | `strivo-pm-400` | `#8A7E9B` |
| `strivo-am-200` | `#F2BE95` | | `strivo-pm-500` | `#7A5A5F` (primario) |
| `strivo-am-300` | `#F4DFC4` | | `strivo-pm-700` | `#5D5260` |

**Recalibrados el 1 de septiembre de 2026 (manual v2.1, §0.1).** La familia morado/lavanda sale
entera y entra una extraída de la luz de un atardecer: ámbar, arena y durazno quemado de día;
ciruela terracota y azul violáceo ceniza de noche. **Cambian los ocho valores y nada más** — ni los
nombres, ni el número de tokens, ni la escala neutra, ni los semánticos, ni el color de firma del
logo. Los tokens nuevos conservan la luminancia de los que sustituyen, que es lo que permitió
recolorear sin mover una sola regla de maquetación.

**Dos cosas se corrigieron al integrar, y las dos las encontró la verificación:**

- **`am-200` llegó como `#DFAF88` y entró como `#F2BE95`.** El valor muestreado fallaba
  `lint:contraste`: sobre esa superficie va la atribución de la frase del día, que se pinta con el
  **secundario** (`#3A3546`) y no con la tinta, y caía a 5,98:1 contra un umbral AAA de 7:1. La
  pre-verificación del manual §4.7 no lo vio porque midió solo `ink` sobre las cuatro superficies de
  mañana. Aclarado queda en 7,07:1 sin salirse del durazno quemado (ΔE 6,0 del valor muestreado).
  **La comprobación que faltaba está anotada en el manual:** una recalibración mide la tinta *y* el
  secundario, porque el producto pinta los dos.
- **Tres copias de la paleta salían escritas a mano en `rgba()`** —el recuadro de la frase de noche,
  su borde y el halo de la respiración—, con los canales de `#8D82B6` y `#DCCFF1` en decimal. **Por
  eso ningún barrido de hexes las encontraba: un hex en decimal no se parece a un hex.** Era una
  violación de RN-VIS-02 anterior a este cambio, y habría dejado tres piezas en lavanda bajo una
  paleta que ya no lo es. Ahora piden su token con `color-mix`, que ya era el idioma de la casa en
  `globals.css`.

**Escala neutra** (no cambia con la hora): `strivo-50` `#F6F4F1` · `100` `#E9E7E3` · `300` `#D4D1CD`
· `600` `#6E6A73` · `700` `#58545D` · `800` `#423E47` · `900` `#2B2730`.

**Paleta compartida:** ink `#241E33` · paper `#FBF8F4` · **night `#191428`** (índigo violáceo, **no
negro puro**) · amber, plum, sage, clay, mist.

### Cómo se aplica

- **`data-moment`** (`manana` | `noche`) sobre la raíz elige la paleta. Lo decide **el reloj**: es la
  firma visual del producto.
- **`data-momento`** lo decide **quien mira**, con el conmutador de Hoy. Se parecen y no son lo
  mismo: a las diez de la mañana con el conmutador en Noche valen cosas distintas, y ese es justo el
  caso que hay que resolver bien. Fuera de Hoy no hay atributo.
- **`data-surface`** elige el color del texto. Son capas distintas y no se pisan.

| Regla | Enunciado |
|---|---|
| **RN-VIS-01** | El fondo de Hoy es **siempre un degradado**, nunca un color plano. |
| **RN-VIS-02** | **El color del texto lo decide la superficie, no el componente.** Ningún componente fija un color de texto literal: pide superficies por su papel (`text-on-surface`, `text-on-surface-soft`, `border-on-surface`). |
| **RN-VIS-03** | El negro puro no se usa. |
| **RN-VIS-04** | Cambiar de momento recolorea fondo, cabecera y tarjetas **a la vez**, en 320 ms. Nada salta a destiempo. |
| **RN-VIS-05** | Toda animación respeta `prefers-reduced-motion`. Con ella, las transiciones son inmediatas y el umbral no se muestra. |
| **RN-VIS-06** | **Lo que ocupa la pantalla se encaja entero, nunca se recorta ni se mide en píxeles fijos.** El visual de apertura va con `object-contain` y el logo del umbral con una longitud relativa. Un teléfono, un iPad y un portátil no tienen la misma forma, y el producto se abre en los tres. |

> **No uses `text-surface`.** Tailwind ya genera esa clase desde el color `surface` y la que gane
> depende del orden del CSS, con texto casi blanco sobre fondo claro como premio.

**Tipografía:** **Inter y solo Inter**, variable, por npm y no por CDN. La jerarquía es peso y
tamaño, nunca familia. `.font-display` **elige peso, no familia**. La escala va en `rem` para que
escale con la preferencia del sistema; los objetivos táctiles siguen en px (son el tamaño de un
dedo). **La hoja itálica (`wght-italic.css`) es obligatoria** y la usa la frase del día: sin ella el
navegador falsifica la cursiva inclinando la vertical.

**Espaciado y forma:** base 4 px, escala 1,25×. Radios 10–32 px. **Sin sombras proyectadas**: la
profundidad se expresa con elevación. Área táctil mínima 44 × 44 px.

**Movimiento:** más lento de lo habitual. Mínimo 120 ms, máximo 900 ms para el cierre nocturno. Curva
suave, sin rebotes. Háptica ligera en confirmaciones, **nunca en errores**.

**Accesibilidad:** contraste **AAA** en todo texto, en ambos momentos y en ambas superficies,
verificado por `npm run lint:contraste`. El estado activo **nunca se comunica solo por color**
(peso + borde). Escalado al 200 %. Todo alcanzable por teclado, con foco visible. Los emojis del
catálogo son decorativos y van ocultos al lector de pantalla.

---

## 5. Reglas de negocio transversales (§12.5)

| Regla | Implicación |
|---|---|
| **RN-01** | **Local primero.** Se guarda al instante en el dispositivo; la red es posterior. Si cae, no se pierde nada. |
| **RN-02** | Ningún campo es obligatorio en ningún recorrido. |
| **RN-03** | Cerrar un recorrido vacío lo completa igual. |
| **RN-04** | No existe el estado «fallado» en ninguna entidad del modelo. |
| **RN-05** | La app nunca presenta la ausencia de registro como un problema. |
| **RN-06** | **Ningún texto de la persona se analiza para decidir cómo tratarla.** Toda ramificación por contenido emocional usa **listas cerradas y explícitas**. |
| **RN-07** | Ningún dato identificable ni contenido escrito sale en analítica. |
| **RN-08** | Lo escrito debe ser exportable. |
| **RN-09** | Toda pantalla es abandonable sin coste y sin confirmación. |
| **RN-10** | Cinco destinos máximo —tres en la cabecera, dos en la barra de abajo—; tres toques de profundidad máxima. |
| **RN-11** | **Un día se escribe hasta 72 horas después de haber empezado.** La ventana es deslizante y continua: no se reinicia a medianoche y no depende de la franja de la mañana ni de la noche. Pasado el plazo el día **se lee entero y no se toca** — nunca se oculta ni desaparece. Ningún día futuro se puede escribir. |

**Verifica estas antes de cada feature: si viola una regla, no entra.**

---

## 6. Estructura de datos

**Árbol canónico `users/{uid}/` — tres ramas:**

```javascript
shared/ {
  // `identidadCentral` es de la versión anterior del onboarding: **se lee, no
  // se escribe** desde el 1 de septiembre de 2026. Era una frase y nada más:
  // no se combinaba con nada, y esa es la garantía de que el modelo de áreas
  // no vuelve por la puerta de atrás.
  profile:     { name, gender, identidadCentral, diaTerminaA,
                 wakeTime, sleepTime, createdAt },
  auth:        { uid, email, phone },
  preferences: { soundEnabled, reducedMotion, remindersEnabled },
  // `completedAt` es la única marca de que el onboarding terminó; `motivos` y
  // `motivoOtro` son la respuesta de P3, que se da una vez y no vuelve a mutar.
  onboarding:  { version, completedSteps, currentStep, completedAt,
                 motivos[], motivoOtro },
  // SPEC_29 — SOLO LOCAL: nunca se encola, ni al mudar, ni se restaura.
  // Sin documento es `sin_definir`. Restablecer lo borra.
  frases:      { modo, afinidades[], version, updatedAt }
}

diario/ {
  // La mañana de tres momentos. `emotions`, `granVision` y —desde el 30 ago
  // 2026— `feeling` e `intention` son de versiones anteriores: se leen, no se
  // escriben. Los dos últimos guardaban un id suelto donde ahora hay lista.
  morningEntry/{fecha}: { version, updatedAt, completedAt, skipped,
                          feelings[], feelingOther, intentions[], intentionOther,
                          gratitude[], action, reflectionId, reflection,
                          wishId },   // el buen deseo de «Comenzar mi día», desde el 12 oct 2026

  // La noche de tres momentos. `gratitude`, `learning`, `sleepState`,
  // `sleepStateOther` y —desde el 10 sep 2026— `closingFeeling` son de
  // versiones anteriores: se leen, no se escriben. El último guardaba un id
  // suelto donde ahora hay lista.
  nightRitual/{fecha}:  { version, updatedAt, completedAt, skipped,
                          recognized[], reflectionId, reflectionSource, reflection,
                          closingFeelings[], closingFeelingOther, release },

  journal/{entryId}:    { date, text, emotions[], otherText, createdAt, updatedAt },
  pinConfig:            { salt, hash, iterations, algorithm, enabled },
  // SPEC_29 — SOLO LOCAL. La frase ya asignada a un día para una huella de
  // preferencias: lo que impide que ampliar el catálogo cambie el pasado.
  frasesDelDia/{fecha}~{huella}: { phraseId, fecha, huella, catalogoVersion, asignadaEn }
}

breathing/ {
  configuracion, favoritos/{id}, recientes, sesiones
}
```

| Regla | Enunciado |
|---|---|
| **RN-DB-01** | Local primero. La nube es una copia posterior, no la fuente de verdad al escribir. |
| **RN-DB-02** | **Nada se corrige en silencio.** Un registro incompleto se rechaza al escribir o se devuelve tal cual al leer. |
| **RN-DB-03** | **Campo fuera del modelo es un error de programación:** escribirlo lanza `UNKNOWN_FIELD`. Ampliar el modelo es una decisión, no un descuido. |
| **RN-DB-04** | **Nada de lo escrito se sobrescribe ni desaparece** al cambiar el modelo. Los campos retirados se siguen leyendo; simplemente ya nadie los escribe. |
| **RN-DB-05** | **El ánimo de cinco estados no es un campo.** Es una vista derivada de la emoción de cierre, calculada al pintar. **Nunca se persiste.** |
| **RN-DB-06** | Se persisten identificadores, no etiquetas. |
| **RN-DB-07** | Los límites de longitud son sugerencias, no validaciones. |
| **RN-DB-08** | Fechas como `YYYY-MM-DD` en zona local. **Un día es el día de quien lo vivió.** |
| **RN-DB-09** | La marca de cierre (`completedAt`) es lo único que determina si un recorrido está cerrado. No se infiere de cuántos campos hay escritos. **Vale también para el onboarding:** saltarse los siete pasos es haberlo hecho. |
| **RN-DB-10** | **Respiración no lee ni escribe en `diario/`, y `diario/` no lee `breathing/`.** Lo único que comparten es el motor de ritmo, que es lógica pura sin datos. Lo imponen `eslint.config.js` y una prueba, no una convención. |

**Dos filosofías de validación, y la frontera es una carpeta.** En `src/lib/db/` los registros los
escribe el código, así que un campo fuera de lista **se rechaza** (RN-DB-03). En
`src/breathing/data/` los escribe una persona moviendo un control, así que se **corrige al valor
válido más cercano y se explica**: frenarla con un error sería castigarla por explorar.

**Guardado** (§5.6): los toques se escriben al momento; lo tecleado, **a los 800 ms** de inactividad.
Salir a media frase no pierde nada. `skipped` anota lo omitido **solo de las preguntas que llegaron a
hacerse** —una pausa que no se mostró no es una pausa omitida— y **no se muestra en ninguna
pantalla**.

---

## 7. Los recorridos (§5.4 y §5.5)

### Mañana

```
1 de 3  ·  ¿Cómo me siento esta mañana?           (hasta 3, de 11 + Algo más)
2 de 3  ·  ¿Qué agradezco hoy?                    (1 a 10, uno al abrir)
3 de 3  ·  ¿Cómo me gustaría sentirme…?           (hasta 3, de 9 + Algo más)
           ¿Qué puedo hacer hoy…?                 (texto libre + ideas)
   +    ·  Si quieres, una última pausa           (opcional, algunos días)
   →       Tu intención · Tu paso · «Comenzar mi día»
   →       Un buen deseo (rota entre 20) · «Puedes volver y cambiar lo que quieras.»
   →       La consulta: lo respondido, con las preguntas delante
```

- **La intención va con la acción, no con el punto de partida** (RN-MAN-01): «acercarme a *esa
  sensación*» es un pronombre sin antecedente si la sensación se eligió dos pantallas atrás.
- **El indicador cuenta momentos, no campos** (RN-MAN-02). La pausa opcional **no entra en la
  cuenta**: un total que cambia de un día para otro deja de orientar.
- **El catálogo de intención excluye las emociones difíciles** (RN-MAN-12), y es el único sitio del
  producto donde se restringe: una intención de estar triste no es una intención.
- **La diferencia entre punto de partida e intención no se mide** (RN-MAN-13). Empezar cansado y
  querer estar en calma **no es un problema a resolver**: es lo que la pregunta esperaba.
- **Las dos preguntas emocionales admiten hasta tres** (30 ago 2026). Nadie amanece sintiendo una
  sola cosa, y obligar a elegir cuál de dos es la verdadera es pedirle a alguien que se resuma antes
  de empezar el día. **Al llegar a tres, la cuarta no entra hasta soltar alguna** —lo decidió el
  propietario del producto sobre la alternativa del Journal, que deja entrar la cuarta soltando la
  más antigua—: aquí las tres son la respuesta, y quitarle a alguien algo que dijo de sí mismo para
  hacer sitio es peor que no añadir lo cuarto. **No es un bloqueo de los que §14 prohíbe**: nada
  impide avanzar, ningún chip se apaga y la pregunta se puede dejar en blanco entera. Lo único que
  no crece es el tope, y se dice en voz baja cuando se toca la cuarta.
- **Las ideas de la acción siguen a la primera intención**, no a las tres: son ideas para empezar, no
  una lista que se reparta. Se elige la primera **porque se eligió primero, no porque sea la mejor**.
- **La gratitud abre con un solo campo y llega hasta diez** (RN-MAN-07, ampliada el 30 ago 2026):
  varios campos vacíos se leen como huecos por rellenar, y esto no es un formulario. Diez es sitio
  de sobra, no una meta: **no se anuncia por adelantado y no hay «3 de 10» en ninguna parte**, porque
  contar lo que queda lo convertiría en un objetivo. Al llegar se dice una vez y la lista deja de
  crecer.
- **Las ideas de apoyo abren una pregunta y nunca rellenan el campo** (RN-MAN-08), a los 5 s sin
  escribir **en el renglón enfocado**. Dos «Ahora no» y se callan por la sesión.
- **Tocar una idea de acción NO la guarda todavía:** es una propuesta de la app hasta que se
  continúa. **Es la única excepción al autoguardado** y está anotada en el código.

### Noche

```
1 de 3  ·  La pregunta del día, según el ánimo    (lista de 1 a 5, uno al abrir)
2 de 3  ·  Una reflexión breve                    (rotativa, o ligada a la mañana)
3 de 3  ·  ¿Cómo me siento al cerrar el día?      (hasta 3, de 13 + Algo más)
   +    ·  ¿Hay algo que quieras dejar aquí?      (por la emoción, o a mano)
   →       Tu día puede terminar aquí · «Cerrar mi día» · Buenas noches
   →       La consulta: lo respondido, con las preguntas delante
```

- **«Reconocer» y no «agradecer», y la diferencia es el punto** (RN-NOC-03). Reconocer admite lo que
  costó; agradecer obliga a que algo haya salido bien. Es lo que permite que una noche difícil tenga
  respuesta.
- **La noche no evalúa el día** (RN-NOC-01): no compara la mañana con la noche y **no cuenta nada de
  lo escrito**. «Hoy encontraste 2 cosas que agradecer» es un balance, y los balances están
  prohibidos.
- **La pregunta que abre la noche se dice en el tono del día** (RN-NOC-14, 30 ago 2026), y es la
  única del producto que cambia de redacción. Tres grupos —sereno, neutro, cuidado— y **quince
  preguntas que rotan por fecha**. A quien cierra el día cansado, inquieto, frustrado, triste o con
  demasiado encima **no se le pide que encuentre algo bueno**: se le pregunta qué quiere reconocer,
  que admite haber atravesado el día y no exige nada más. Solo el grupo sereno pregunta por algo
  bueno, y solo porque la persona acaba de decir que cierra el día en paz.
  - **Es lista cerrada, no un análisis** (RN-06), igual que la descarga: se mira el id del catálogo
    y jamás una palabra escrita. **La palabra propia va al neutro** (RN-NOC-10), y también lo que no
    se pueda clasificar: entre decir de más y decir de menos sobre el estado de alguien, se dice de
    menos.
  - **Una difícil manda sobre las demás.** Nunca una pregunta de gratitud sobre un día que alguien
    acaba de nombrar difícil, ni aunque haya nombrado también algo sereno.
  - **La rotación se deriva de la fecha y no se guarda.** Congelarla al mostrarse —como hace la
    reflexión— la dejaría clavada en el grupo equivocado en cuanto alguien cambiara su emoción, que
    es justo lo que tiene que poder pasar. Derivarla da las tres cosas: estable dentro de la noche,
    distinta a la siguiente, y al día se actualiza al instante. **Y no pide un campo nuevo.**
  - **Cambiar el ánimo cambia la pregunta y las ideas, nunca lo escrito.** Las filas viven en el
    estado del recorrido; esto solo decide qué se lee encima de ellas.
  - **Con ideas de apoyo, y son las de la pregunta visible.** Mismo componente, misma espera de 5 s
    en el renglón enfocado, mismos dos «Ahora no» que en la gratitud de la mañana, y **nunca
    rellenan el campo**. Las tenía prohibidas cuando la pregunta traía su abanico en el texto de
    apoyo; ahora que se estrecha para acompañar, las ideas la acompañan a ella.
  - **Las quince hablan en primera persona** (§12), como el resto de preguntas de la noche.
- **La intención entra como pregunta, jamás como examen** (RN-NOC-05): se pregunta qué se notó, nunca
  si se cumplió.
- **La descarga se ofrece sola tras cuatro emociones concretas** —inquietud, frustración, tristeza,
  demasiado encima— y es **lista cerrada y explícita, no un análisis** (RN-NOC-09). **La palabra
  propia nunca la dispara** (RN-NOC-10).
- **El enlace para abrirla a mano va debajo de todas las emociones** (RN-NOC-11), no solo de las
  cuatro: si apareciera solo tras una emoción difícil, el catálogo se convertiría en un diagnóstico.
- **Del reconocimiento se muestra uno, no todos** (RN-NOC-13). Se elige el primero **porque se
  escribió primero, no porque sea el mejor**.

### Ambos

- **Hasta tres en las tres preguntas emocionales del día** (10 sep 2026). La noche era la
  excepción —una sola— y dejó de serlo: la asimetría existía porque el punto de ánimo del
  calendario, que es de cinco estados, no sabía qué hacer con tres; hoy lo sabe, y **gana la más
  pesada** (`animoDeCierre`), que es la regla que ya aplicaban las noches de la versión 1. Al llegar
  a tres, la cuarta no entra hasta soltar alguna, y se dice en voz baja. Se suelta tocando el chip
  otra vez, y esa es la forma de omitir. Por eso son botones con `aria-pressed` y **no radios**: un
  radio no se deselecciona, y anunciarlo así sería mentir al lector de pantalla. **«Algo más» es la
  excepción**:
  tocarlo cuando ya está elegido **reabre el campo**, y quitarlo tiene su propio control — editar y
  borrar no pueden ser el mismo gesto cuando hay texto de por medio.
- **La palabra propia no recibe emoji**, ni siquiera al releerse: elegirle uno sería la app
  interpretando lo que alguien acaba de nombrar. Sale entre comillas, en la misma píldora.
- **La consulta repite las preguntas, no las resume** (RN-MAN-21). «Cómo empezaste · Cansada» sería un
  inventario con otro vocabulario.
- **Lo que quedó en blanco no aparece** (RN-MAN-23): sin marcador de ausencia, sin hueco gris, sin
  «sin responder». Una mañana a medias se lee entera, no incompleta.
- **Sin etiqueta de «hecho»** (RN-HOY-04): con el contenido delante, decirlo es contarle a alguien lo
  que está leyendo.
- **Nada bloquea, y está probado en negativo:** ningún control lleva `disabled`, `required` ni
  `aria-invalid`, y el copy no contiene «incompleto», «te faltó», «obligatorio» ni «sin responder».

---

## 8. Journal, Historial y Respiración

**Journal** (§6). Escritura libre: **el único lugar donde el sistema está completamente mudo**
(RN-JR-01) — sin sugerencias, sin recuento de palabras, sin marcador que insinúe qué escribir. Varias
entradas por día. Catálogo emocional **propio y distinto** (15 + propia), máximo tres. Una entrada
solo con emociones es válida. El **PIN** (4–6 dígitos) se almacena derivado con sal e iteraciones,
**nunca en claro**; bloquea el **acceso, no cifra** (limitación consciente, backlog B-5). Con el PIN
puesto **el Historial no lee el journal siquiera**, y lo dice con una frase fija que no depende de si
hay entradas: si apareciera solo cuando las hay, la frase estaría contando lo que el PIN tapa.
**En la app de iPhone, el journal con PIN se abre también con Face ID o Touch ID** (SPEC_23A): otra
forma de abrir la misma puerta, no un cifrado. El PIN sigue siendo la puerta de siempre y el
respaldo, y en la web no existe nada de esto.

**Historial** (§7). **Muestra, no analiza** (RN-HIS-01): sin tendencias, sin medias, sin gráficas,
sin comparación entre semanas. Punto de ánimo de cinco estados —agotado, inquieto, normal, tranquilo,
en paz— **derivado al vuelo y nunca persistido** (RN-HIS-02). La escala de cinco es más gruesa que el
catálogo de trece **y se asume**: la respuesta exacta se lee en la vista del día, que las muestra
todas. Con varias emociones de cierre **gana la más pesada** (10 sep 2026): una noche agradecida y
agotada se pinta agotada, porque la app no maquilla el día de nadie para que el calendario se vea
mejor. **La palabra propia
devuelve «Estuviste»** (RN-HIS-04): colocarla en una escala sería el diagnóstico que este producto
prohíbe. **Los campos de versiones anteriores se siguen leyendo** con sus rótulos propios
(RN-HIS-07): nada de lo ya escrito se sobrescribe ni desaparece.

**Respiración** (§8). **Es una herramienta, no una sección de contenido** (RN-RE-01): se abre, se
usa, se sale. No acumula historial visible, no puntúa, no lleva la cuenta de sesiones. Siete
patrones, dos visuales, tres modos de duración, seis sonidos **sintetizados en tiempo real** —cero
archivos de audio, cero dependencias nuevas—, hasta veinte combinaciones guardadas. **Silencio por
defecto en toda la app** (RN-RE-11). Todos los nodos de audio se liberan al salir. **Con sonido,
sigue sonando fuera de la app y con la pantalla bloqueada, con la guía a su ritmo hasta el final**
(SPEC_23 Parte 2); en silencio, todo como siempre.

Dos entradas: la sección, y la **tarjeta de Hoy** («Respira un momento»), que **no muestra la
duración** (RN-RE-02) —cuánto dura se dice donde hay un botón que arranca, que es donde alguien
decide de verdad—. Desde la tarjeta el ejercicio es **el ritmo de la casa** (5-5-3, tres ciclos,
~39 s) y es **otro componente** que el de la sección: `components/shared/Respiracion.jsx`.

---

## 9. Estados de interfaz (§11)

- **Un estado vacío es una invitación, nunca una acusación** (RN-EST-01): nunca dice qué falta, dice
  qué cabe.
- **Sin ruedas giratorias** (RN-EST-02): esqueleto de la forma final, o nada.
- **El error nunca muestra un código** (RN-EST-04): qué pasó, tranquiliza sobre lo escrito, y
  reintentar. **Nada vibra en un error.**
- **Un error de red no es un error visible** mientras el guardado local funcione (RN-EST-05).
- **Solo se confirma lo que destruye contenido**, y solo si hay contenido que perder (RN-EST-07).
  **Salir nunca pide confirmación** (RN-EST-08). Eliminar una combinación de respiración ofrece
  **deshacer** en lugar de confirmar antes.
- **La app funciona completa sin red** (RN-EST-10). Si la sincronización falla, la marca no se pierde
  y no se duplica.
- **El producto no crece hacia los lados** (RN-EST-12): en pantalla grande hay más margen, no más
  contenido, y nunca dos columnas. Se diseña primero para teléfono en vertical.

---

## 10. Criterios de aceptación recurrentes (§13.3)

Toda pantalla, antes de darse por terminada:

1. ✅ Ningún texto contiene léxico prohibido (`npm run lint:copy`).
2. ✅ Contraste AAA en ambos momentos, escalado 200 %, movimiento reducido respetado.
3. ✅ Escribir o editar genera un registro local que sincroniza después sin duplicarse.
4. ✅ El estado vacío invita, no acusa.
5. ✅ El error es amable, sin código, con reintento.
6. ✅ Funciona sin conexión.
7. ✅ **Ningún texto vive en el componente:** todo viene de `src/copy/`.
8. ✅ **Ninguna tonalidad literal en el componente:** todo viene de tokens.

**Y la revisión emocional** (§13.4), que ninguna prueba automática puede hacer. **Un «sí» en
cualquiera de estas es un defecto**, aunque todo esté en verde:

- ¿Alguna pantalla me hace sentir atrasado?
- ¿Alguna cifra o etiqueta me está evaluando?
- ¿Hay algún sitio donde no pueda salir sin dar explicaciones?
- ¿Alguna respuesta difícil se ve peor que una fácil?
- ¿Hay entusiasmo impostado en algún texto?
- ¿Algo va más rápido de lo que este producto debería ir?

---

## 11. Arquitectura del código

```
src/
├── copy/            biblioteca central de texto  ← todo string visible sale de aquí
├── content/         repertorios de frases: apertura, día v1 (legado) y frases-v2/ (SPEC_29)
├── referencias/     territorio neutral: qué referencias se eligen para las frases (SPEC_29)
├── tokens/          design-tokens.json
├── styles/          globals.css + tokens-strivo.css
├── lib/
│   ├── db/          schema · shared · diario · local · sync
│   │                almacen · adaptadorIndexedDB · adaptadorSQLite · migracionSQLite
│   │                arranqueNativo · clavesDelTelefono (SPEC_17B)
│   ├── cuenta · sesion · entradaCuenta · salidaCuenta · useSesion
│   │                la sesión de Firebase, entrar y salir (SPEC_19.1)
│   ├── respiracion/ motor de ritmo (lógica pura)
│   └── audio/       síntesis
├── diario/          lógica de mañana, noche, journal, historial, PIN
├── onboarding/      cómo se entra: pasos · catálogos · estado
├── perfil/          bloques de Tu perfil y su estado
├── breathing/       la herramienta completa
├── components/
│   ├── shared/      Simbolo · TransicionLuz · Campo · Chips · pildora · BarraInferior
│   ├── ui/          primitivas
│   ├── onboarding/  las ocho pantallas y su contenedor
│   ├── perfil/      la pantalla de cuenta y su marco de bloque
│   └── diario/      NavStrivo · manana/ · noche/ · journal · historial
└── pages/diario/    Hoy · Journal · Historial
```

**Reglas de arquitectura, impuestas por `eslint.config.js` y por pruebas, no por convención:**

| Regla | Enunciado |
|---|---|
| **RN-TEC-02** | Todo el texto visible sale de `src/copy/`. |
| **RN-TEC-03** | Todo color sale de tokens. |
| **RN-TEC-04** | **`breathing/` no importa nada de `diario/` y viceversa.** |
| **RN-TEC-05** | **`components/shared/` no importa nada específico de una sección.** Lo que necesiten llega **por props**. |
| **RN-TEC-06** | **`onboarding/` no importa `diario/` ni `breathing/`.** Corre antes de la app, una sola vez, y todo lo que escribe vive en `shared/`. No se enruta: se interpone. |
| **RN-TEC-07** | **`perfil/` tampoco.** Es gestión de cuenta, no una sección del refugio: toca `shared/profile` y, desde SPEC_29, `shared/frases` (por `src/referencias/almacen.js`). Sí lee el catálogo de género del onboarding, y eso es deliberado: es un campo del perfil, no un paso de un recorrido, y dos copias del mismo catálogo se separan en cuanto alguien edite una. |
| **RN-TEC-08** | **`referencias/` y `content/` son neutrales** (SPEC_29): los leen el onboarding, Tu perfil y el diario, y no importan ni `diario/` ni `breathing/`. Lo impone `eslint.config.js`. |

Esa última regla es la que da forma a media base de código: `TransicionLuz` recibe su tema desde
`globals.css` y no por props de sección; `Respiracion` (la de la sección) recibe `base` y `salida`
desde `App.jsx`, que es quien enruta y el único que sabe dónde vive; `BarraStrivo` declaraba su clase
y dejaba que el CSS del sitio la vistiera. **El tema va en el CSS del sitio que lo conoce, nunca en
el componente.**

**Dónde vive cada regla — un sitio y solo uno.** Dos copias de la misma regla envejecen distinto:

- `src/diario/noche.js` → `animoDeNoche` es el **único** sitio que decide el ánimo de una noche.
  También `emocionesDeCierre`, que es el único que sabe que una noche de agosto guardó un id suelto
  donde ahora hay lista.
- `src/diario/nocheEmociones.js` → `ORDEN_DE_ANIMO` y `animoMasPesado`: cuál de varios ánimos manda,
  **de lo más pesado a lo más ligero**. Lo leen la noche de hoy (`animoDeCierre`) y las de la versión
  1 (`estadoSueno.animoDerivado`), que hacían la misma cuenta con su propia copia del orden.
- `src/lib/respiracion/` → el motor de ritmo. `ritmoRespiracion.js` es un envoltorio de compatibilidad.
- `src/lib/umbralSesion.js` → el «ya se cruzó» del umbral, compartido por sus dos consumidores.
- `src/lib/sesion.js` → `resolverSesion`: el **único** sitio que dice si hay cuenta, con la tabla
  de SPEC_19 §3.1. Nadie más mira el prefijo `local-` para eso.
- `src/lib/db/conflictos.js` → `ganaRemoto`, `esSemilla` y `ganaOrigenAlMudar`: qué gana cuando un
  registro choca, al bajar de la nube y al entrar a una cuenta. La segunda regla está hecha de las
  dos primeras, no copiada. También `hechosQueFaltan`: los hechos del expediente que ninguna
  fusión deshace, leídos por la bajada y por la mudanza (SPEC_19.2).
- `src/lib/entradaCuenta.js` → `arbolDeEntrada`: en qué árbol leen y escriben la puerta, el
  onboarding y la presentación mientras una mudanza esté pendiente (SPEC_19.2).
- `src/onboarding/escritura.js` → qué lee y qué escribe el recorrido, y dónde. El hook decide
  cuándo; esto, dónde.
- `src/diario/ventanaEdicion.js` → hasta cuándo se puede escribir en un día, y **el único sitio donde
  vive el 72** (`HORAS_DE_EDICION`). Lo leen el día, su estado de React, el Historial y la pantalla
  Hoy; hay una prueba que falla si alguno lo escribe a mano.
- `src/diario/manana.js` → `resumenDeManana`: qué bloques hay, en qué orden y con qué título. El
  componente solo pinta. También `animosDeManana` e `intencionesDeManana`, que son el **único** sitio
  que sabe que una mañana de agosto guardó un id suelto donde ahora hay lista.
- `src/diario/seleccionEmociones.js` → la mecánica de los tres catálogos emocionales del día.
  **Cuántas respuestas admite cada pregunta lo declara quien crea la selección**, no la mecánica ni
  la pantalla: un tope escrito en dos sitios se separa en cuanto alguien cambia uno. Se llamaba
  `seleccionUnica.js` y dejó de ser cierto el 30 de agosto de 2026.
- `src/diario/nocheReconocimiento.js` → los tres grupos de ánimo, qué emoción cae en cuál y qué
  pregunta toca hoy. Lo leen el recorrido de la noche y su pantalla de consulta, que así repite la
  pregunta que se contestó sin necesidad de guardarla.
- `src/components/shared/pildora.js` → la forma de la píldora, compartida por los chips del día,
  las pantallas de consulta y los del onboarding. **Subió de `diario/` a `shared/` en F-1B**, junto
  con `Campo.jsx`, cuando el onboarding pasó a montarlos: ninguno de los dos importa nada ni nombra
  una sección, que es lo que los hacía mudables.
- `src/components/shared/FormularioEntrar.jsx` → entrar o crear con correo y recuperar el
  acceso, **todo por props**. Lo montan Tu cuenta y la vista de entrar del onboarding (SPEC_30);
  qué frase toca a cada motivo es `claveDeError`, en `lib/cuenta.js`.
- `src/onboarding/traspaso.js` → lo que cruza el velo al entrar a una cuenta: el paso, el motivo y,
  desde la bienvenida, si hay que volver a la vista de entrar (`AVISOS_DE_ENTRADA`). Donde se
  retoma tras entrar desde P1 es `pasoTrasEntrar`: el paso de la cuenta, nunca P1.
- `src/onboarding/pasos.js` → el orden del recorrido y qué cuenta en el indicador. Es el **único**
  sitio que sabe que el género no gasta número.
- `src/onboarding/genero.js` → las cuatro opciones, los tres valores del modelo y el camino de
  vuelta (`opcionDe`). Lo leen el onboarding y Tu perfil.
- `src/referencias/preferencias.js` → los modos y afinidades de las frases, su normalización, el
  perfil que resulta (`perfilDeFrases`) y su huella. Lo leen el onboarding, Tu perfil y el diario.
- `src/diario/fraseDelDia.js` → qué frase le toca a un día (`elegirFrase`); `diario.js`
  (`fraseAsignada`) la guarda y respeta lo ya asignado. Las reglas editoriales del catálogo viven
  en `src/content/frases-v2/validacion.js` y las comparten el script y las pruebas.
- `src/lib/db/local.js` → `esRutaLocal`: las rutas que nunca salen del dispositivo (PIN, preferencia
  de frases y asignaciones). `enqueue` las rechaza siempre.
- `src/lib/db/limite.js` → `LIMITE_DE_RED_MS` y `conLimite`: cuánto se espera, como máximo, a una
  escritura o una lectura de Firestore (SPEC_31). Lo leen `sync.js` y `restaurar.js`.
- `src/lib/db/sync.js` → qué pone la cola en marcha y con qué ritmo: `DEMORA_DE_SUBIDA_MS` y
  `RETRY_BACKOFF_MS` (SPEC_31).
- `src/perfil/bloques.js` → qué bloques tiene Tu perfil y en qué orden. Añadir uno es un
  identificador aquí, un texto en el copy y un componente; hay una prueba que falla si falta alguno
  de los tres.

- `src/lib/db/almacen.js` → **qué almacén se usa** —IndexedDB en web, SQLite en la app nativa— y
  `prepararAlmacen`: abrir, migrar, el techo de 10 s y qué pasa si SQLite no abre (SPEC_17B).
  `local.js` le pide el adaptador en cada operación y no sabe cuál es.
- `src/lib/db/adaptadorSQLite.js` → el **único** archivo de `src/` que importa el plugin
  `strivo-almacen`, y bajo demanda. Las tablas, el cerrojo y las siete operaciones que dependen de
  una transacción. Hay una prueba que recorre `src/`.
- `src/lib/db/migracionSQLite.js` → la migración única de IndexedDB a SQLite, su verificación en
  JSON canónico y la marca `migradoEn`. **IndexedDB se lee y nada más.**
- `src/lib/db/clavesDelTelefono.js` → las claves `strivo.uid.local`, `strivo.restaurado.*` y
  `strivo.mudanzaPendiente.*`, y su copia en SQLite. Quien las escribe lo hace por aquí.
- `src/lib/plataforma.js` → `esNativa()`: el **único** sitio que pregunta si la app corre dentro
  del iPhone. Nadie más importa `@capacitor/core` para eso; hay una prueba que recorre `src/`.
  También `esIPhone()` (SPEC_22): `esNativa()` y `getPlatform() === 'ios'`. Es lo que preguntan los
  avisos, para que Android no programe nada antes de SPEC_27; SPEC_27 cambia esa función.
- `src/lib/avisos/plan.js` → `planDeAvisos`: **qué** avisos tienen que estar programados. Pura —el
  reloj, las horas y lo cerrado entran por argumentos—, y la reutilizará SPEC_27. También
  `idDeAviso` (`YYYYMMDD × 10 + 1|2`) y `DIAS_DE_VENTANA` (14).
- `src/lib/avisos/reconciliar.js` → **cuándo** se corrige: la única rutina que compara lo que toca
  con lo que iOS tiene y lo pone al día, de una en una. Solo la cargan `useAvisos` y
  `salidaCuenta`, bajo demanda; hay una prueba que lo vigila.
- `src/lib/avisos/pedido.js` → por dónde se **pide** reconciliar sin contenerla: el diario, Tu
  perfil y el bloque de recordatorios importan esto, que no importa nada.
- `src/lib/avisosNativos.js` → **cómo** se habla con iOS: el **único** archivo que importa
  `@capacitor/local-notifications`, y bajo demanda. Hay una prueba que recorre `src/`.
- `src/lib/credencialNativa.js` → el **único** sitio que importa `@capacitor-firebase/authentication`,
  y bajo demanda: la credencial de Google o Apple en la app de iPhone, qué es cancelar
  (`esCancelacion`) y el cierre de la sesión del plugin. Hay una prueba que recorre `src/`.
- `src/lib/reautenticacion.js` → `metodoDeSesion` (con qué se entró, según el token) y
  `reautenticarConProveedor`. Lo leen el PIN y, cuando llegue, el borrado de SPEC_24.
- `src/lib/barraEstado.js` → `textoDeBarra`: de qué color va la hora y la batería en la app de
  iPhone, con la tabla entera. Lo deciden el cromo y lo que se pinta encima, no la paleta.
- `src/lib/haptica.js` → `toqueSuave()`: **cómo** se pide un toque suave en el iPhone. El
  **único** archivo que importa `@capacitor/haptics`, bajo demanda y solo con `esIPhone()`; nunca
  lanza y no se espera. **Cuándo** vibra lo dice cada uno de los tres puntos (SPEC_23B).
- `src/lib/biometria.js` → **cómo** se habla con Face ID y la Keychain: el **único** archivo que
  importa `@capgo/capacitor-native-biometric`, bajo demanda. Lo cargan `pin.js` y `salidaCuenta`.
  **Qué** abre el journal lo decide `src/diario/pin.js` (`abrirConBiometria`).
- `src/diario/seleccionEmociones.js` → `entroEnLaSeleccion`: si una emoción entró con este toque,
  que es lo único que vibra al elegir. Lo preguntan `ChipsCatalogo` y `ChipsEmociones`.
- `src/lib/audio/observadorAudio.js` y `diagnosticoAudio.js` → el diagnóstico del audio
  (SPEC_23C). Solo existen con `VITE_DIAG_AUDIO=1`; cada `avisar()` de la app va detrás de la
  bandera.
- `src/lib/audio/sesionAudio.js` → **el único sitio que toca `navigator.audioSession` y
  `navigator.mediaSession`**: reclamar y soltar «reproducción», el cuadro de la pantalla de bloqueo
  y `vigilar`, que lee del estado del contexto la pausa, el reproducir y las llamadas.
- `src/lib/audio/contextoAudio.js` → además del contexto compartido, **cuándo el audio está mudo**
  (`audioMudo`, `medirReloj`), si sonó fuera (`sonoFuera`) y `alSiguienteToque`, el gesto que
  reconstruye el motor.
- `src/lib/respiracion/acompanamientoDeFondo.js` → con la app fuera, quién mueve la sesión y
  programa la guía por adelantado; lo comparten la sección y «Respira un momento». Debajo,
  `tramos.js` (qué fases caen en los próximos segundos) y `relojDeFondo.js` (el temporizador).

**Pila:** React + Vite (PWA) · IndexedDB en web · SQLite en la app nativa (SPEC_17B) · Firestore para sync · Firebase Auth · Netlify con
publicación automática · Vitest · Capacitor 8 para la app de iPhone (SPEC_21.1).

---

## 12. Comandos de verificación

**Los seis deben pasar antes de cualquier integración:**

```bash
npm run lint            # análisis estático, cero advertencias
npm run lint:copy       # léxico prohibido y textos en componentes
npm run lint:contraste  # contraste de todas las combinaciones reales
npm run format:check    # formato
npm run test            # suite completa
npm run build           # construcción de producción
```

**`npm run test` corre la suite dos veces** desde SPEC_17B (`vitest.workspace.js`): el proyecto
`indexeddb` —el almacén de la web— y el proyecto `sqlite`, con el adaptador de la app nativa sobre
`node:sqlite`. **Por eso las pruebas piden Node 22.13 o más.** El plugin nativo tiene además sus
propias pruebas en el simulador:
`cd plugins/strivo-almacen && xcodebuild test -scheme StrivoAlmacen -destination 'platform=iOS Simulator,name=iPhone 18 Pro'`.

Y desde SPEC_29, **`npm run validar:frases`**: metadatos, voz, marcas de referencia, duplicados,
expedientes de las citas y cobertura de 500 por perfil. Falla si un perfil baja de 500.

`npm run format` ya se puede correr: `.prettierrc` reproduce el estilo del repo (sin punto y coma,
comillas simples, ancho 100). **El CSS y `design-tokens.json` quedan fuera a propósito**
(`.prettierignore`): prettier colapsa la alineación por columnas de los bloques de tokens y **pasa
los hexes a minúsculas**, que es justo lo que rompe la comprobación de que cada hex de marca aparece
literal en el manual.

---

## 13. Estado actual

**Fase F-0 — repliegue a una sola app.** Los diez pasos del plan de separación están ejecutados: la
rama de resguardo está creada y congelada, la rama activa es `strivo`, y el código, las rutas, los
componentes, los estilos, los textos, las pruebas y la documentación están depurados y renombrados.

**125 archivos de prueba · 2.956 casos** en el proyecto `indexeddb`, **2.885 más** en el proyecto
`sqlite` (la misma suite contra SQLite) **y 17 XCTest del plugin** · los seis comandos y
`validar:frases` en verde. **La intermitente de `journal.test.js` se cerró** (10 nov 2026): sus dos
entradas empataban en el milisegundo y el orden lo decidía un UUID; ahora se crean con `Date`
congelado en dos instantes distintos. `listJournalEntries` no cambió. Cada caso que vuelca
IndexedDB por dentro tiene su equivalente que vuelca todas las tablas de SQLite.

### Face ID y háptica en el iPhone (SPEC_23A y 23B, 12 nov 2026)

La instrucción completa y las decisiones del reporte previo están en
`docs/specs/INSTRUCCION_SPEC_23_PARTE_1_HAPTICA_FACE_ID_Y_DIAGNOSTICO.md` (v1.1; **su §9 manda**).
**Las dos solo en la app de iPhone** (`esIPhone()`): en la web no cambia nada, no hay interruptor
de Face ID, nada vibra y ni una línea de los plugins llega a lo que se descarga.

**Un toque suave en tres momentos, y en ninguno más** (23B). `@capacitor/haptics` **8.0.2**,
versión exacta, por SPM; `ImpactStyle.Light`; sin ajuste propio (iOS aplica el de vibración del
sistema). **En la web no se carga nunca: su versión web vibra con `navigator.vibrate`.**

- **Cerrar la mañana o la noche:** en `terminar()`, tras la guarda `cerrando`. Uno por cierre;
  nunca al autoguardar ni al reintentar (que llama a `persistir`). Si la escritura falla después,
  el toque ya ocurrió: el gesto de cerrar fue de la persona.
- **Elegir una emoción:** solo lo que **entra** (`entroEnLaSeleccion`). Soltar no vibra, chocar con
  el tope no vibra; en el Journal la cuarta entra desplazando a otra, y eso sí vibra.
- **Cambio de fase en Respiración:** en `alCambiarFase`, con la sesión `activo` o `cerrando`. El
  reloj no emite en el acomodo ni en pausa, y al reanudar no repite la fase.
- **«Respira un momento»** también vibra, con su propia memoria del último toque (`claveDeFase`):
  `faseActual` se olvida al pausar y al volver a la app, así que no sirve para esto. Y «Empezar»
  pasa de uno en uno (`unaVezCon`): un doble toque dejaba un bucle huérfano que seguía vibrando en
  la pausa.
- **La inhalación fantasma, corregida en la máquina.** El cierre cae en el borde de un ciclo, y en
  el último fotograma el reloj emitía el «inhalar» del ciclo siguiente antes de completar la sesión.
  Ya no se reenvía: ni la guía ni la háptica lo reciben.
- **«Respira un momento» no se monta en P1 del onboarding**, solo en Hoy. El comentario del
  componente lo decía al revés y se corrigió.

**Face ID para el Journal** (23A). `@capgo/capacitor-native-biometric` **8.9.3**, versión exacta,
por SPM y sin configuración. **Se comparó con 8.9.2 antes de instalarlo** (se publicó la víspera):
solo cambian la cadena de versión del Swift y un párrafo del README.

- **Qué hay en cada sitio.** En la Keychain, **una clave aleatoria de 32 bytes y nada más**, con
  `.biometryCurrentSet` y `WhenPasscodeSetThisDeviceOnly` (`accessControl: 1`): no viaja a la
  Llavero de iCloud, no entra en copias, no pasa a otro teléfono e iOS la invalida si cambia una
  cara o un dedo. En `diario/pinConfig` —que nunca sale del dispositivo— el campo nuevo
  **`biometria`**: `{ verificador, activadaEn }` (el SHA-256 de la clave) o `{ cambiada: true }`.
  **El PIN no se copia ni llega a la Keychain**, y una prueba espía lo que se le pasa al plugin.
- **Activar** pide el PIN, guarda la clave y **la lee una vez**, para que iOS pida la cara ahora
  (la primera vez, antes, su permiso). Solo con la cara aceptada se guarda el verificador; cancelar,
  fallar o negar el permiso dejan todo como estaba, la clave borrada y ningún texto propio.
- **Abrir:** al montar la pantalla del PIN, iOS pide la cara sola, una vez por montaje y solo con la
  app a la vista. Abre solo si la huella coincide con el verificador. **Cancelar vuelve al PIN sin
  mensaje** y «Abrir con Face ID» lo reintenta. Se lee con `fallbackTitle: ''`: el respaldo es el
  PIN, no el código del teléfono. El journal se sigue cerrando al salir de su ruta, como siempre.
- **Cancelar e invalidar, sin adivinar.** Solo se lee la clave con verificador, y la app solo borra
  la clave a la vez que el verificador: «la clave no está» (`21`) con verificador solo puede ser que
  iOS la quitó → `cambiada`. Antes de leer, `isAvailable`: permiso negado (`1`), sin caras (`3`) o
  sin código (`14`) → `cambiada` sin diálogo; bloqueo (`2`) → como cancelado. `16`, `10` y `0` →
  cancelado. **Riesgo residual aceptado:** si iOS diera `10` y no `21` para una clave invalidada,
  Face ID fallaría en cada entrada y el PIN seguiría abriendo.
- **Lo que apaga Face ID:** el interruptor (**sin pedir el PIN**: quitarlo reduce el acceso),
  «Dejar de pedirlo», el PIN nuevo de «Olvidé mi PIN», cualquier `crearPin` y **cerrar sesión**
  (`olvidarFaceId`, en `salidaCuenta`; anotado en SPEC_24 para el borrado). **La rederivación de
  `verificarPin` conserva `biometria`**: no es un cambio de PIN.
- **Al reinstalar**, la Keychain sobrevive y `pinConfig` no: la clave huérfana se borra la primera
  vez que `estadoPin` la encuentra sin verificador, una vez por sesión y sin pedir la cara. El
  journal llega sin PIN y sin Face ID, igual que antes.
- **El interruptor** vive en «Ajustes de acceso» (`BloqueoPin`, modo `ajustes`), debajo de «Tu
  journal pide un PIN para abrirse.», solo con PIN y con biometría disponible para Strivo:
  `role="switch"`, `aria-checked` y el texto de debajo con `aria-live`. Es la misma forma que el de
  los recordatorios. Los nombres «Face ID» y «Touch ID» viven en el copy
  (`journal.pin.biometria.nombres`) y se eligen por el `biometryType` que da el plugin.
- **El texto de permiso de Face ID** es ahora «Para abrir tu journal sin escribir tu PIN.».

**Lo que no se pudo comprobar en el simulador:** si cambiar la inscripción de Face ID invalida la
clave. Ni un ejecutable suelto, ni un XCTest sin app anfitriona ni una app firmada a mano tienen
acceso a la Keychain del simulador, y su estado biométrico no cambia al reinscribir. Por eso F7
(una apariencia alternativa en el teléfono) se volvió obligatoria, **y pasó**: con una cara nueva,
Strivo dijo `cambiada` y apagó el interruptor. iOS contesta `21` para una clave invalidada, así que
el riesgo residual de arriba no se da.

**Tamaño.** El chunk principal de la web pasa de 737,40 a 744,66 kB (gzip, de 209,40 a 211,15):
es la lógica de Face ID en `pin.js` y la pantalla; los dos plugins y el puente de biometría van en
chunks aparte que la web no descarga. **La app de iPhone en Release** (medida antes de instalar,
con los dos plugins): el `.app` de 9.504 a 9.640 KB (+136 KB), comprimido +35 KB.

**Las pruebas manuales H1–H4 y F1–F9 pasan** (12 nov 2026, la fundadora en su iPhone 17 con «La
23 con diagnóstico»). En F4 Face ID abre al instante, así que «Cancelar» se probó tapando la
cámara: la pantalla del PIN quedó sin mensaje y con «Abrir con Face ID». El detalle está en el §10
de la instrucción.

### El audio de Respiración con la pantalla bloqueada (SPEC_23C Parte 2, 12 nov 2026) — D-21.13 se cierra

La instrucción completa y sus decisiones están en
`docs/specs/INSTRUCCION_SPEC_23_PARTE_2_AUDIO_RESPIRACION.md` (v1.1; **su §9 manda**). **Quien
respira con sonido puede bloquear el teléfono o salir un momento, y Strivo sigue acompañándola hasta
el final, con la guía a su ritmo; al volver, todo está donde debe; quien respira en silencio no nota
nada distinto.** Vale en la app de iPhone y en la PWA por igual, donde exista `navigator.audioSession`
(iOS 17 o más). Ni archivos de audio, ni plugins, ni Swift: el motor de síntesis sigue siendo el
único origen del sonido (DP-23.3 = c).

**Lo que dijo el código de WebKit, y manda** (leído en las ramas de iOS 17, iOS 26 y la actual):
- **`audioSession.type = 'playback'` vale al instante**, también para el contexto que ya suena.
- **Soltar es `'auto'` y después cerrar el contexto.** `'auto'` sola no desactiva la sesión de audio,
  y la música ajena solo recupera su volumen al desactivarla.
- **Los botones de la pantalla de bloqueo no llaman a nuestro código con Web Audio**: WebKit suspende
  y reanuda el contexto. Por eso se leen sus estados.
- El «localhost» del cuadro salía del origen (`capacitor://localhost`), no del `<title>`; con
  `mediaSession.metadata` se sustituye. Sin metadatos, la PWA enseñaría «netlify.app».
- **Anomalía sin explicar:** según WebKit, «reproducción» debería interrumpir la música ajena; en el
  iPhone la bajó. Nada nativo configura la sesión. Ningún código depende de ello.

**Cómo funciona:**
- **Reclamar** (`sesionAudio.reclamar`): con sonido —ambiente distinto de silencio, o guía—, en el
  toque de «Empezar» y antes del contexto; a media sesión, en el toque que activa el sonido. **En
  silencio no se reclama nada**: ni cuadro, ni música ajena tocada.
- **Soltar**: al acabar el fundido final (la música de la persona vuelve entonces, no al salir de
  Respiración), al salir y al pasar a silencio. «Otra vez» monta un contexto nuevo en su toque.
- **Con la app fuera** (`acompanamientoDeFondo`): un temporizador —iOS lo deja llegar cada 1–2 s—
  mueve la máquina con `evaluar()` y programa la guía 10 s por delante sobre el reloj del audio
  (`programar(tramos)`), con el mismo resolvedor que dibuja: **la máquina sigue siendo la única
  fuente de verdad** (RN-RE-SND-19/20). El fundido final se programa en su instante (`salirEn`) y no
  se repite cuando la máquina completa. Al volver se cancela lo programado y la guía sigue con
  `fase()` desde el valor que suena.
- **El cierre sale del límite**, no del instante en que se detecta: con tics de 2 s, medirlo desde el
  tic podía alargar la sesión un ciclo. Es el único cambio con la app a la vista, en un caso de borde.
- **El cuadro**: «Respiración · Strivo» y el nombre del patrón («Respira un momento» en Hoy), con el
  ícono de la app; solo pausa y reproducir. **Pausa** se lee como «suspendido» —este código nunca
  llama a `suspend()`— y pausa la sesión; **reproducir**, como la vuelta a «en marcha», y la reanuda
  con la rampa de 0,4 s, sin tocar la app y solo si la app sigue fuera. **Una llamada** es
  «interrumpido»: pausa y no se reanuda sola; se sigue con «Seguir». Se acepta que «reproducir» no
  haga nada si la pausa se hizo desde la app.
- **El 9.4 con sonido** (`notificarAusencia(ms, { sono })`): si el reloj del audio avanzó al menos el
  80 % del tiempo fuera, la sesión siguió y no se pausa. En silencio, como siempre.
- **El respaldo** (iOS 16, o el fallo de WebKit tras una llamada, en el que el contexto dice «en
  marcha» con el reloj quieto): al volver se miden 500 ms de reloj de pared (al menos 400 reales); si
  el reloj del audio avanzó menos de 0,1 s, si el contexto no está «en marcha» o si pasó por
  «interrumpido», **el siguiente toque reconstruye el motor** dentro del gesto. Es lo de D8 hecho
  comportamiento normal. Sin `suspend()`/`resume()`: un contexto suspendido por el código ya no lo
  reanuda la pantalla de bloqueo.
- **El Wake Lock se vuelve a pedir al volver** si el sistema lo soltó y la sesión sigue despierta.
- **Encender la guía a media sesión ya la crea**: hasta aquí solo se creaba al empezar.
- **«Respira un momento»**, lo mismo a su escala, con las piezas de `lib/` y los textos del cuadro
  por props desde Hoy.

**Tamaño.** El chunk principal de la web pasa de 744,69 a 758,18 kB (gzip, de 211,16 a 215,11).

**Las pruebas manuales A1–A8, A10 y A11 pasan** (12 nov 2026, la fundadora en su iPhone). El cuadro
sale con el ícono, «Respiración · Strivo» y «Calma 5-5-3», y pausa y reproducir funcionan. **A9**,
la PWA en Netlify, se prueba tras fusionar. **Queda O-23.1** (abajo, en la deuda): al terminar, la
música de otra app se pausa en lugar de volver a su volumen.

### El audio de Respiración al irse y al volver (SPEC_23C, diagnóstico, 12 nov 2026)

**Primer paso de 23C: medir, no arreglar.** D-21.13 (el sonido no vuelve al regresar a la app)
bloquea la publicación; el arreglo y el audio con la pantalla bloqueada son de la **Parte 2**, que
se escribe con los resultados del bloque D.

**El build de diagnóstico:** `VITE_DIAG_AUDIO=1 npm run ios:build`. Un panel **abierto por defecto**
en la sesión de Respiración y en «Respira un momento» (`components/shared/DiagnosticoAudio.jsx`),
que se repinta solo. Mide el estado del contexto con la hora de cada cambio, qué pasó al irse y al
volver, el resultado de `resume()`, cuánto avanzó el reloj del audio fuera frente al reloj de pared,
**si el JavaScript siguió corriendo fuera** (tics de 1 s y fotogramas con la página oculta), el
motor y el planificador, y la sesión. Y dos experimentos: el **tipo de sesión de audio** de WebKit
(`navigator.audioSession.type`, automático o reproducción; se guarda y se aplica a cada contexto
nuevo, así que tras cambiarlo se empieza una sesión nueva) y **«Probar con un audio nuevo»**, que
dentro del toque suelta guía, ambiente y préstamo, deja cerrarse el contexto y monta uno nuevo en
el punto de la sesión. **Desde la Parte 2 los dos experimentos ya no están** (DP-23.28): decide el
comportamiento normal. El panel añade dos líneas, las fases programadas por adelantado y si el
cuadro de la pantalla de bloqueo está puesto, y conserva la del tipo que rige.

- **Cómo se entera:** `lib/audio/observadorAudio.js`, un solo oyente. Cada `avisar()` de
  `contextoAudio`, el planificador, el hook de la sesión y `shared/Respiracion` va dentro de
  `if (import.meta.env.VITE_DIAG_AUDIO === '1')`, y una prueba lo comprueba línea por línea. El
  módulo que mide se carga al arrancar desde `contextoAudio.js`: el contexto nace con «Empezar»,
  antes de que exista el panel.
- **Sin la bandera, la app se porta igual.** El CSS sale idéntico y el JS solo conserva la
  constante `null` del `lazy()` y su hijo vacío, como los otros dos diagnósticos. **Ninguna clase
  de Tailwind del panel puede ser nueva**: Tailwind escanea el archivo aunque no se monte, y una
  clase nueva cambiaba la hoja y con ella todos los hashes.
- **Un toque en cualquier sitio despierta el audio** (`despertarAlVolver` escucha todo el
  documento), también en el panel: «Al volver» se apunta solo y la captura va antes de tocar nada.
- **Para leer el bloque D:** tras 20–30 s fuera, lo correcto hoy es «ambiente bajo (al 30 %), sin
  guía y la sesión en pausa» (caso 9.4). El defecto es no oír **nada**.
- **Para la Parte 2:** el reloj de Respiración anda con `requestAnimationFrame` (con la pantalla
  bloqueada no hay fases ni cierre) y no se congela fuera; con la pantalla bloqueada a media
  inhalación la guía se queda en un tono continuo; el planificador es un `setInterval` de 50 ms que
  iOS frena en segundo plano; el Wake Lock no se vuelve a pedir tras una ausencia corta.
- Sus textos son `DIAGNOSTICO_AUDIO` en `src/copy/diagnostico.js`; cada bandera de diagnóstico no
  arrastra los textos de las otras, y `lint:copy` los revisa.

**Resultados del bloque D** (12 nov 2026, la fundadora en su iPhone; el detalle está en el §10 de
la instrucción). **Se confirma la hipótesis 4: el tipo de sesión de audio de WebKit.**

- **En «automático»** (el de hoy), al irse el audio queda «interrumpido» y su reloj quieto. Al
  volver dice «en marcha», con el motor vivo, pero **no suena, ni con toques**. En modo silencio
  tampoco suena. **La PWA en Safari se porta igual**: no es Capacitor, es WebKit.
- **En «reproducción»** sigue sonando fuera y con la pantalla bloqueada (49,4 s de 49,4 s) y suena
  en modo silencio. También **baja el volumen de la música de otra app, sin pausarla** (D7; a la
  fundadora le parece bien) y **pone el cuadro de reproducción en la pantalla de bloqueo, titulado
  «localhost»**. El JavaScript fuera corre a medias (25 tics de 49) y con 0 fotogramas, así que el
  reloj de la sesión no avanza bloqueado: **con la pantalla bloqueada no se oía la guía, solo el
  ambiente** (D5).
- **D8, en «automático»: «Probar con un audio nuevo» sí devuelve el sonido.** Cerrar el contexto y
  reconstruir el motor dentro de un toque funciona.

### Al abrir la app, papel desde el primer instante (D-21.11, 12 nov 2026)

La instrucción completa está en `docs/specs/INSTRUCCION_D_21_11_PANTALLA_DE_ARRANQUE.md` (v1.2;
**su §9 manda**). **La ventana que crece desde el ícono ya no pasa por negro**: la imagen de arranque
de 2732 × 2732 pasaba del límite de memoria de iOS para una pantalla de arranque (25 MB), iOS
descartaba el storyboard y pintaba negro. Ahora es papel con la «S» a su tamaño justo. El porqué,
el arreglo y las reglas que deja están en «App iOS (SPEC_21.1)», en el apartado «Por qué la pantalla
de arranque es ligera». **Ni Swift, ni `capacitor.config.json`, ni `Info.plist`, ni
`project.pbxproj`, ni `package.json`, ni la web cambiaron.**

**Pruebas manuales M1–M6 no realizadas, por decisión de la fundadora (12 nov 2026).** D-21.11 se
cierra con la causa confirmada por `splashboardd` y las grabaciones del simulador (0 cuadros negros
en frío y en segundo arranque, en oscuro y en claro). Queda por ver en el iPhone, sin bloquear: el
relevo de noche de D-21.9 (criterio d) y O-21.11.1. La primera build en el iPhone va tras borrar la
app y reiniciar el teléfono.

### Los recordatorios llegan en el iPhone (SPEC_22, 11 nov 2026)

La instrucción completa y las decisiones del reporte previo están en
`docs/specs/INSTRUCCION_SPEC_22_RECORDATORIOS_IOS.md` (v1.1; **su §9 manda**). **En la app de
iPhone, quien pide los avisos los recibe a sus horas, aunque la app esté cerrada; quien no los
pide no recibe nada.** En la web no cambia nada: mismo P6, mismos textos, ningún bloque nuevo y ni
una línea del plugin en lo que se descarga.

**Avisos locales, programados en el teléfono.** Sin servidor, sin APNs, sin push remoto: nada sale
del dispositivo. `@capacitor/local-notifications` **8.3.1**, versión exacta, por SPM y sin
`packageOptions`. **Sin `aps-environment`, sin `remote-notification` y `UIBackgroundModes` sigue
siendo `[audio]`**: declarar push sin usarlo es motivo de rechazo, y `appIos.test.js` lo vigila.

**A qué hora y qué dice.** A las horas de «Cómo son tus días» (`wakeTime`, `sleepTime`), a la hora
exacta; sin hora, ese aviso no se programa. **Sin título** —el plugin exige el campo, y vacío deja
que iOS ponga el ícono y «Strivo»— y con el texto de la vista previa de P6
(`copy.notifications`), siempre el mismo, sin nombre ni nada de lo escrito. **Nunca `badge`.** Con
la app abierta no se enseña (`presentationOptions: []`). El permiso que pide el plugin incluye
globos, así que en Ajustes aparece «Globos»; ningún número llega al ícono.

**Una ventana de 14 días de avisos fechados** (como mucho 28 de los 64 de iOS), cada uno con
`schedule.on` de fecha completa: sigue la hora de pared aunque cambie la zona horaria. **Nunca
`schedule.at`** —es un intervalo desde ahora, no sigue la zona y una fecha pasada se entrega en el
acto— **y nunca un aviso diario repetido**, que no sabría saltarse un día. Ids
`YYYYMMDD × 10 + (1 mañana | 2 noche)` y `extra: { strivo: true, momento, fecha }`.

**Si ya pasaste por ese momento, ese día no llega.** Lo dice `completedAt` (RN-DB-09), y a qué día
pertenece cada aviso lo dice `strivoDateKey` con el `diaTerminaA` del perfil. Al cerrar la mañana o
la noche, además, se retira del Centro de notificaciones el aviso ya entregado de ese día.

**Una sola reconciliación** (`lib/avisos/reconciliar.js`), idempotente y de una en una. **Nunca
programa sin permiso concedido y nunca lo pide**: `schedule()` del plugin lo pediría solo. No se fía
de lo que contesta `schedule()` —responde antes de que iOS confirme—: empieza y termina con
`getPending`. Solo toca los avisos marcados de Strivo. **Los disparos:** al montar las secciones,
al volver al frente y al terminar una restauración (`useAvisos`, en `Secciones`); al cerrar la
mañana o la noche (`DiarioManana`, `DiarioNoche`); al cambiar las horas (`usePerfil`) y al tocar el
interruptor o dar el permiso (el bloque). **Quien cierra un momento o cambia una hora pide**
(`pedido.js`) **y no la contiene**: así el diario y Tu perfil no arrastran ni el plugin ni la base.
Con una mudanza pendiente, los avisos siguen al uid de la sesión, como Tu perfil.

**El permiso y la preferencia son dos cosas.** El permiso no se guarda: se consulta. **Solo se pide
con un toque**: «Activar recordatorios» en P6, o el interruptor o «Permitir avisos» en Tu perfil.
Nunca al abrir la app. El interruptor es `preferences.remindersEnabled` (uno para los dos avisos,
sin cambios en el modelo) y dice lo que la persona quiere; la frase de debajo, lo que el teléfono
deja.

**P6 en la app de iPhone** pide el permiso con el plugin (`onboarding/recordatorios.js`; en la web,
el código de antes). Sin ninguna hora, la frase de concedido es `p6.grantedSinHoras`: «Listo. Te
avisaremos cuando elijas tus horas en Tu perfil.».

**Tu perfil: el bloque «Recordatorios»**, detrás de «Cómo son tus días» y **solo en la app de
iPhone** (`visibles` y `SOLO_EN_IPHONE`, en `perfil/bloques.js`). Interruptor con `role="switch"` y
`aria-checked`, y lo de debajo anunciado con `aria-live`:

| Preferencia | Permiso | Horas | Lo que se ve |
|---|---|---|---|
| apagada | cualquiera | cualquiera | El interruptor |
| encendida | concedido | al menos una | El interruptor, y los avisos llegan |
| encendida | concedido | ninguna | `sinHoras` |
| encendida | sin pedir | cualquiera | `sinPermiso` con «Permitir avisos» |
| encendida | denegado | cualquiera | `sinPermiso` con «Abrir Ajustes del teléfono» |

**El permiso va por delante**: `sinHoras` solo aparece con el permiso concedido. Si se niega al
encender, el interruptor se queda apagado y la frase con «Abrir Ajustes del teléfono» se ve
mientras se siga en la pantalla; no se guarda. **«Abrir Ajustes del teléfono» navega a
`app-settings:`**, sin código nativo: Capacitor cancela la navegación y la abre con el sistema. Cae
en la página de Strivo en Ajustes, y ahí se toca «Notificaciones».

**Tocar un aviso abre Hoy con su momento** (`#/hoy?momento=manana|noche`), también con la app
cerrada del todo: el plugin guarda el toque hasta que alguien escucha (`retainUntilConsumed`), y
`useAvisos` escucha al montar las secciones. Hoy aplica el parámetro antes de pintar
(`useLayoutEffect`), en el día de hoy y saliendo de «Respira un momento» si estaba dentro, y lo
retira con `replace`. Un valor desconocido se ignora. Sin parámetro, Hoy es la de siempre.

**Cerrar sesión cancela todos los avisos de Strivo** (`salirDeCuenta`, tras comprobar la cola y
antes de `cerrarSesion`). Espera a la vuelta en curso, como mucho 3 s, para que nada se programe
después de salir. Está anotado en SPEC_24: borrar la cuenta tendrá que hacer lo mismo.

**`lint:copy` mira ahora «!» y «¡» en todo el copy** (`copy` y los textos de los dos diagnósticos;
ningún texto de hoy fallaba) y «pendiente» en los textos nuevos de SPEC_22.

**El build de diagnóstico:** `VITE_DIAG_AVISOS=1 npm run ios:build`. Al final del bloque, el
permiso, cuántos avisos hay programados, el próximo de cada momento y la zona horaria, repintado
tras cada reconciliación. Sus textos son `DIAGNOSTICO_AVISOS` en `src/copy/diagnostico.js`; una
prueba construye sin bandera y con cada una, y comprueba que ninguna arrastra los textos de la
otra.

**Tamaño.** El chunk principal de la web pasa de 730,19 a 737,40 kB (gzip, de 206,92 a 209,40); la
reconciliación (4,2 kB) y el plugin van en chunks aparte que la web no descarga. **La app de
iPhone en Release** (arm64, sin firmar, sin adelgazar por la tienda): el `.app` pasa de 9.316 a
9.504 KB (+188 KB: +163 KB el binario, que es el Swift del plugin, y +28 KB la web), y comprimido,
que es lo más parecido a la descarga, de 3,11 a 3,18 MB (+64 KB).

**Las pruebas manuales M1–M10 pasan** (11 nov 2026, la fundadora en su iPhone y en `localhost`
contra `strivo-fe04f`; el detalle está en el §10 de la instrucción). **El orden de M2 y M3 se
ajustó al probar:** M2 usó la Noche con la app cerrada del todo y M3 la Mañana con la app en
segundo plano, porque por la tarde Hoy ya abre en Mañana por sí sola y así cada prueba demuestra
que es el aviso el que elige el momento. **M1:** el diálogo de iOS, «Listo. Te avisaremos a esas
horas.» y los próximos a 07:00 y 23:00. **M2:** llega «¿Cómo cerrar el día?», sin nombre, sin
título duplicado y sin número, y **el toque en frío abre Hoy con Noche**. **M3:** con Hoy en Noche,
el aviso de la mañana la cambia a Mañana. **M4:** al cerrar la mañana, el próximo pasa al día
siguiente y ese día no llega nada. **M5:** apagado, 0 programados; al encender, iOS no vuelve a
preguntar. **M6:** la frase con «Abrir Ajustes del teléfono», que lleva a la página de Strivo; al
volver con permiso, cuenta otra vez sola. **M7:** en Bogotá llega a la hora local nueva. **M8:**
las horas vuelven de la nube, iOS no pregunta sin un toque y al negar se ve lo de la tabla.
**M9:** con «No molestar» no suena y queda en el Centro de notificaciones; tras cerrar sesión no
llega nada. **M10:** sin la bandera no hay diagnóstico, y en la web P6 sigue igual y sin bloque.

**Límite conocido, sin arreglar en la 1.0 — O-22.1: el WebView no se entera al momento de un
cambio de zona horaria.** Con la app en segundo plano, al volver tras cambiar la zona, el WebView
sigue con la vieja hasta que la app vuelve a arrancar (en M7 el diagnóstico dijo
`America/Monterrey` hasta cerrar la app del todo). **Los avisos llegan igual a la hora local**,
porque los disparadores de calendario siguen la hora de pared. El único efecto posible es menor:
mientras el WebView conserve la zona vieja, la reconciliación calcula «ahora» con ella, así que un
aviso que cae en la hora del desfase puede no programarse —o quedar uno ya pasado, que iOS no
entrega— hasta el siguiente arranque.

### Lo escrito en el iPhone, en SQLite (SPEC_17B, 10 nov 2026)

La instrucción completa y las decisiones de la fundadora están en
`docs/specs/INSTRUCCION_SPEC_17B_SQLITE.md` (v1.1; **su §9 manda**). **En la app de iPhone, lo
escrito vive en un archivo SQLite propio de la app y no en el IndexedDB del WebView**, que iOS puede
reclamar sin avisar. En la web, nada cambia: sigue siendo IndexedDB.

**El plugin es nuestro**: `plugins/strivo-almacen/`, paquete npm local
(`"strivo-almacen": "file:plugins/strivo-almacen"`) con su `Package.swift`, sobre el SQLite del
sistema. **Sin SQLCipher, sin servidor local y sin terceros**, así que
`ITSAppUsesNonExemptEncryption` sigue en `false` (con `@capacitor-community/sqlite` habría dejado de
poder serlo: trae SQLCipher aunque no se cifre nada). `cap sync` lo enlaza por su ruta real
(`../../../plugins/strivo-almacen`), sin `packageOptions` ni enlace en `symlinks/`. **Cuatro
métodos y ninguno más:** `abrir`, `existe`, `ejecutar` (un lote en una transacción) y `consultar`.
Todas las sentencias van con parámetros enlazados: **ningún texto de la persona entra en el SQL**.
Una sola conexión, atendida por una cola serial; **WAL con `synchronous = FULL`**; la protección de
archivo de fábrica (hasta el primer desbloqueo), **nunca `Complete`**, que dejaría la base cerrada
con el teléfono bloqueado. La mitad de Android es de SPEC_26.

**Lo escrito y el uid viajan en la copia de iCloud del teléfono**, que Apple cifra: la base no
lleva `isExcludedFromBackup`. Hoy `localStorage` no entra en esa copia, así que hasta aquí el uid
se perdía al restaurar un iPhone; con su copia en SQLite deja de pasar.

**El contrato de `local.js` no cambió.** Por dentro, `almacen.js` decide el adaptador una vez y
`local.js` aplica las reglas de siempre —qué se encola, qué decide una mudanza— sobre
`adaptadorIndexedDB.js` (el código de antes, movido sin cambiar su comportamiento) o
`adaptadorSQLite.js`. Las tablas imitan la fila real (`registros`, `cola`, `meta`, `claves`), no
la de SPEC_17 §6; los cambios de esquema futuros se hacen con `meta.esquema`. **Un cerrojo hace
pasar todas las llamadas de una en una, también las lecturas**: entre dos `await` nadie se cuela,
que es lo que IndexedDB daba gratis con sus transacciones. El adaptador SQLite y la migración van
en un chunk aparte (`arranqueNativo`) que **la web no descarga**: el chunk principal creció 4 kB.

**La migración, una vez y verificada.** En el primer arranque nativo de la versión nueva, antes de
montar la app: se copian **todos** los registros —PIN, preferencia de frases y asignaciones
incluidos, que viven en el teléfono y SQLite es el teléfono— y toda la cola con su `seq`, su `rev`
y sus `attempts`, en un solo lote. Se verifica en JSON canónico y **solo entonces** se escribe
`migradoEn` en `meta`. Si algo falla o no coincide, SQLite se vacía, no se marca, esta sesión sigue
con IndexedDB y el siguiente arranque lo intenta otra vez. **Un valor que no es JSON** —un `Date`,
un `undefined`— **no se arregla: la migración no termina y lo dice.** Con la marca puesta,
IndexedDB no se vuelve a mirar. **IndexedDB no se escribe, no se borra y no se crea**: si la base
`strivo` no aparece en `indexedDB.databases()`, ni se abre. La 1.0 sale ya con SQLite, así que
quien la instale desde la tienda nunca migra.

**Al arrancar, el velo de siempre primero** (`components/ArranqueAlmacen.jsx`) y `<App/>` cuando
el almacén está listo: así la pantalla de arranque se retira con su techo de 2 s y debajo ya hay
algo pintado. **Techo de 10 s**, y la app nunca se queda en el velo: si se cruza migrando, la
migración se abandona sin marcar y la sesión sigue con IndexedDB; si todavía no se sabe si hubo
migración, IndexedDB solo cuando no hay pista (`strivo.almacen`) y sí hay datos en IndexedDB, y si
no, la pantalla de error con «Reintentar»; si la marca ya salió, solo vale SQLite. **Si SQLite no
abre** (tres intentos), se pregunta al plugin si el archivo existe: existe → la pantalla de error
que ya existía; no existe y no se puede crear → esta sesión con IndexedDB. **Después de migrar,
nunca se vuelve a IndexedDB**: escribir en la copia vieja partiría el diario en dos.

**Las claves del teléfono se copian en SQLite** (`clavesDelTelefono.js`): el uid, la marca de
restauración y la mudanza pendiente. Al arrancar, si `localStorage` no tiene el uid —señal de que
iOS limpió el WebView—, se recuperan de SQLite **antes** de que nadie lo lea; si lo tiene, manda
`localStorage` y SQLite se iguala, así que una marca retirada no resucita. `ArranqueProvisional`
sigue siendo el único que escribe el uid, ahora con `guardarClave`; `reconciliarClaves` solo
devuelve a `localStorage` lo que él escribió.

**El build de diagnóstico**, solo para las pruebas manuales: `VITE_DIAG_ALMACEN=1 npm run ios:build`.
Al final del bloque «Dónde vive lo que escribes» de Tu perfil dice qué almacén se usa, cómo fue
la migración y cuánto hay en cada almacén, y ofrece «Simular que iOS limpió el almacén». **Sus
textos viven en `src/copy/diagnostico.js`, no en `copy/index.js`**: así sin la bandera no llegan a
`dist/`, y una prueba lo comprueba construyendo.

**Volver atrás.** Antes del lanzamiento, revertir es revertir el commit y reinstalar. **Después de
publicar la 1.0 con SQLite no hay vuelta a IndexedDB sin una migración inversa.**

**Lo que no se tocó:** `sync.js`, `conflictos.js`, el modelo de datos ni las reglas de fusión.
`restaurar.js` y `entradaCuenta.js` cambiaron solo en cómo escriben sus claves.

**Las pruebas manuales M1–M7 pasan** (10 nov 2026, la fundadora en su iPhone contra
`strivo-fe04f`; el detalle está en el §10 de la instrucción). **M1:** sin cuenta, todo pasa entero
—mañana, Journal, frase del día y su elección, combinación favorita e Historial— con «Migración:
correcta» y los mismos números en los dos lados (10 registros, 6 por subir: sin cuenta lo escrito
espera en la cola). **M2:** lo nuevo se queda y la migración no se repite. **M3:** con la simulación
de limpieza, sin bienvenida, mismo nombre y todo lo escrito; IndexedDB a 0 y SQLite intacto.
**M4:** el Journal pide el PIN tras actualizar —en M1 no se pudo probar: sin cuenta no deja
ponerlo— y lo escrito sin red llega a la nube desde la cola mudada a SQLite. **M5:** instalación
nueva con Google, «nada que migrar» y, tras la simulación sin red, la cuenta sigue y no sale el
aviso de restauración. **M6:** cerrar sesión y volver devuelve los días. **M7:** sin la bandera no
hay diagnóstico, y la web sigue igual. En el simulador se vio además el camino de una instalación
nueva: la base en `Library/Strivo/`, en WAL, con «nada que migrar», el árbol sembrado y la copia
del uid.

**Aprendido para las pruebas en el teléfono: tras borrar la app, la primera apertura de una
compilación de Xcode necesita internet.** iOS verifica en ese momento el certificado de
desarrolladora, y sin red la app no abre. Para probar algo «sin red desde la instalación» hay que
abrirla una vez con red antes, o aceptar un plan B como el de M4: se abrió con red, y la prueba de
que la cola se mudó fue que la entrada escrita sin red subió desde SQLite mientras IndexedDB la
seguía contando.

### Que lo escrito suba solo (SPEC_31, 1 nov 2026)

La instrucción completa está en `docs/specs/INSTRUCCION_SPEC_31_SINCRONIZACION_FIABLE.md`. Nace de
O-1, O-2 y O-3 de la bitácora de 21.2, que **no causó 21.2** y que pasaban también en la web.

**Hasta aquí, nada ponía la cola en marcha después de escribir** (O-3). `enqueue` guardaba y
terminaba; `flush` solo corría al montar con cuenta, al volver la red, al volver la pestaña, tras un
fallo o con un botón. Con la app abierta, lo escrito esperaba hasta que pasara una de esas cosas: en
el iPhone, «Guardando» hasta tocar «Intentar de nuevo». **El criterio 18 de 17A («llega sin
intervención») pasó en septiembre por un cambio de pestaña**: para mirar Firestore se cambia a su
consola y se vuelve, y esa vuelta es un `visibilitychange`. Lo que se midió fue «sin tocar la app»,
no «sola».

**Qué la pone en marcha ahora**, mientras `startSync` está activo (`sync.js`):

- **Escribir.** `local.js` avisa al encolar (`alEncolar`) y `sync.js` arma un vaciado a los
  `DEMORA_DE_SUBIDA_MS` (2 s). Las escrituras que llegan mientras tanto **no lo reinician**: diez
  seguidas son un vaciado, y escribir sin parar nunca deja nada esperando más de eso. Lo escrito
  durante un vaciado sale en otra vuelta. `local.js` sigue sin importar `sync.js`, y sin
  `startSync` escribir no vacía nada —por eso las pruebas de la capa siguen viendo la cola llena—.
  **`sync.js` escucha a `local.js` y sigue sin emitir nada a nadie** (D11): el bloque de Tu perfil
  sigue siendo sondeo.
- **Irse al fondo** (`visibilitychange` a oculto y `pagehide`) vacía en el acto: en el iPhone la app
  se congela poco después.
- **La red.** Volver vacía, como antes; irse cancela el reintento pendiente, y **sin red no se
  programa ninguno**. Con red la escala es `RETRY_BACKOFF_MS` = 2, 5, 10, 20 y 30 s, con tope: nada
  espera más de medio minuto. Con un reintento programado, escribir no arma otro vaciado: manda la
  escala.

**Ninguna espera de red es infinita** (O-2). En el SDK, una escritura sin conexión no falla: espera
sin plazo. Con la conexión colgada, `flushing` se quedaba en `true`, cada `flush` contestaba
`en_curso` y «Intentar de nuevo» esperaba a `flushEnCurso()`, que no terminaba: trece minutos en la
web, hasta recargar. Ahora:

- **Cada escritura de `flush` y cada lectura de `restaurar` tienen `LIMITE_DE_RED_MS` (10 s)**, en
  `limite.js`. Es el plazo con el que el propio SDK da al cliente por desconectado, y queda por
  debajo del techo de 15 s del velo. **Un límite no cancela nada**: deja de esperar.
- **Una escritura que vence cuenta como fallo y sigue en la cola**; solo sale con la confirmación de
  Firestore. Y como una conexión muerta no se recupera sola, **el siguiente intento reabre la
  conexión** (`disableNetwork` y `enableNetwork`). `enableNetwork` se pide aunque `disableNetwork`
  no conteste: el SDK atiende las dos en orden, así que la red no se queda apagada. Lo que el SDK
  tenía a medio enviar sigue en su propia cola y sale al reabrir; enviarlo dos veces no hace daño,
  porque `setDoc` reescribe el documento entero.
- **Una lectura que vence deja la restauración en `interrumpida`**, sin marca. Lo que ya bajó se
  queda, como con cualquier fallo, y **lo que la lectura abandonada traiga tarde no se escribe**.
- **«Intentar de nuevo» y la comprobación de «Cerrar sesión» contestan como mucho a los 15 s**
  (`conTecho` con `TECHO_DE_ESPERA_MS`, el mismo del velo). Dicen lo que ya decían —`sinExito` y
  `pendiente`— y cerrar sesión sigue sin dejar salir con algo pendiente (DP-19.1).

**Tres defectos de la cola que el disparo nuevo habría vuelto frecuentes**, y salen con él:

- **H-1: la cola podía sacar una versión que no se había enviado.** Una ruta reescrita conserva su
  `seq`, y `flush` hacía `dequeue(seq)` tras confirmar lo que había leído: si mientras viajaba se
  escribía de nuevo, la versión nueva salía de la cola sin enviarse y la nube se quedaba con la
  vieja hasta la siguiente edición. Ahora cada entrada lleva su revisión (`rev`) y
  `dequeueSiIgual` solo la saca si no cambió. **Las entradas de antes no traen `rev`** y siguen
  funcionando: sin tocar salen, y reescritas ya traen una y se quedan.
- **H-2: dos vaciados podían correr a la vez**, porque la guarda se ponía después de un `await`.
  Ahora va antes del primero.
- **H-3: un fallo programaba reintento aunque no hubiera red.**

**La pista de D-N8.** «Ese correo y esa contraseña no coinciden.» sigue con una pista para quien
alguna vez entró con un proveedor, y nombra solo los botones que hay en pantalla:
`cuenta.error.credenciales` dice Google (web) y `credencialesNativa`, Google o Apple (iPhone). Lo
elige `claveDeError`. P7 no tiene formulario de entrar propio: su enlace abre la misma vista, así
que la pista sale en los tres sitios. La frase del PIN no cambia.

**DP-31.1 y DP-31.5 entraron sin medir** (10 nov 2026). **O-1 no se midió con el Inspector
web**: el protocolo del §0.1 resultó demasiado complejo de seguir y el primer intento entró en
2 s, así que con pocos intentos O-1 podía no reproducirse. La fundadora decidió aplicar las dos
sin medir y validarlas con las pruebas manuales (instrucción §10).
- **Long polling forzado solo en nativo** (`opcionesDeFirestore`, en `firebase.js`): en la app de
  iPhone, `initializeFirestore` con `experimentalForceLongPolling`; en web, `getFirestore` como
  siempre. `firebaseFirestore.test.js` lo vigila.
- **La primera bajada se reintenta sola una vez** (`restaurarConUnReintento`, en `sesion.js`), la
  usan `prepararArbol` y `entrarACuenta`: solo si falló como `interrumpida` y quedan al menos
  `MARGEN_PARA_REINTENTAR_MS` (3 s) del **mismo** techo de 15 s. El velo no dura más que antes.
- La rama `diagnostico-31` se borró sin fusionar.

**Las pruebas manuales M1–M7 pasan** (10 nov 2026, la fundadora en su iPhone y en `localhost`,
sobre `revision-31` contra `strivo-fe04f`, con Wi-Fi). **M3 (O-1): 5 de 5 instalaciones nuevas
entran directo a Hoy en 2–3 s**, sin aviso de restauración —3 por correo y 2 por Google; antes de
SPEC_31, 5 de 6 acababan en el aviso—. M1 (O-3): lo escrito llega sin tocar nada. M4: sin red
queda por guardar sin alarma y sube solo al volver. M5 (O-2): sin red, «Intentar de nuevo» y
«Cerrar sesión» contestan antes de 15 s. M6: la pista de D-N8 sale en los tres sitios y la
redacción se aprueba tal cual. M7: Google y Apple vuelven a entrar tras cerrar sesión. M2: en la
web lo escrito se guarda en pocos segundos sin recargar. El detalle está en el §10 de la
instrucción.

### La intención de la mañana se cita (9 nov 2026)

Lo pidió el propietario del producto. Donde una frase de la app nombra la intención de la mañana
—«Tu intención para hoy: …» en el cierre y «Esta mañana elegí … como intención» en la noche—,
**cada intención va aparte, entre «» y en cursiva**; las uniones («, » y « y ») y el resto de la
frase siguen en redonda. Mismo cuerpo, peso y color: sin recuadro, sin otro tono y sin salto.

- **Las comillas son copy** (`copy.diario.citaDeIntencion`) y son las «» de la palabra propia; la
  palabra propia no recibe unas segundas. **La cursiva la pone `components/diario/TextoConCitas`**,
  y qué es cita lo dicen los datos: `interpolarPartes` (en `@copy`) devuelve la frase en partes
  `{ texto, cita? }` y `textoDePartes` la junta. El cierre las saca de `cierreEnPartes`
  (`lineasDeCierre` es su versión en texto) y la pregunta de la noche trae `tituloPartes` junto a
  `titulo`, que sigue siendo texto para `aria-label` y las pruebas.
- **Se ve igual al releer**: la consulta de la noche y la vista de día del Historial pintan
  `tituloPartes`, y las dos lo reconstruyen de lo guardado. Las rotativas no traen partes.
- **La noche sigue nombrando una sola**, la primera (`intencionDeLaManana`): no se tocó esa regla.
- Sin cambios en el modelo de datos, la selección ni el guardado.

### Google y Apple en la app de iPhone (SPEC_21.2, 31 oct 2026)

La instrucción completa está en `docs/specs/INSTRUCCION_SPEC_21_2_GOOGLE_Y_APPLE.md` (v1.1, con
las decisiones del reporte previo en su §1.2 y sus desvíos en §2).

**El camino de la credencial.** `@capacitor-firebase/authentication` **8.5.2**, versión exacta, con
`skipNativeAuth: true`: el plugin abre la hoja nativa de Apple o de Google y devuelve el token; la
sesión se abre en el **SDK de JavaScript** con `signInWithCredential` (en `cuenta.js`) o
`reauthenticateWithCredential` (en `lib/reautenticacion.js`). **Hay una sola sesión**, la que leen
la cola, la restauración, las reglas de Firestore y el PIN; el plugin no abre otra. Todo lo nativo
vive en `src/lib/credencialNativa.js`, que **es el único que importa el plugin, y bajo demanda**:
en web y en las pruebas no se carga nunca, y una prueba recorre `src/` para comprobarlo.
**El plugin nunca sale suelto de una promesa** (31 oct 2026): es un Proxy de Capacitor que contesta
también a `then`, y resolver una promesa con él deja el `await` colgado para siempre, sin error —en
el iPhone, los botones de Apple y Google no hacían nada—. `cargarPlugin` lo devuelve envuelto
(`{ plugin }`). Los dobles de las pruebas son un Proxy igual (`__tests__/dobleDeCapacitor.js`), con
tiempo límite: un objeto normal no lo ve. `SplashScreen` y `StatusBar` se importan arriba y solo
se llaman, así que no les afecta.

**Qué hay en cada plataforma** (`proveedoresDisponibles`): en web, `['google']`; en la app de
iPhone, `['apple', 'google']`, **Apple primero** (DP-21.2.4). Apple en web sigue fuera hasta que
DP-21.5 decida si la PWA sigue pública (DP-21.2.2). Los tres sitios con botones —P7, la vista de
entrar de SPEC_30 y Tu perfil— pintan `components/shared/BotonProveedor.jsx`, todo por props.
`entrarConGoogle` ya no existe: la sesión ofrece `entrarConProveedor(cual)`, y Tu perfil le pasa
el proveedor tocado (antes el botón de Apple habría entrado con Google).

**El override de `firebase`, y por qué existe.** El plugin pide `firebase ^12.6.0` como par
opcional y la app usa la 10.14.1; sin más, `npm install` falla con `ERESOLVE`. El `overrides` de
`package.json` va **acotado al plugin** (`{ "@capacitor-firebase/authentication": { "firebase":
"$firebase" } }`) y le da la del repo. Es seguro porque la única parte del plugin que importa
firebase es su implementación web, que se carga en un chunk aparte y la app no pide nunca. **Al
actualizar el plugin hay que volver a comprobar que `vite build` resuelve sus importaciones contra
la 10** (hoy pasa: todos los nombres que importa existen en la 10.14). `appIos.test.js` falla si el
lockfile tiene más de un `firebase`. **Deuda: subir a firebase 12 después del lanzamiento**, y con
eso retirar el override.

**SPM.** `capacitor.config.json` lleva `experimental.ios.spm` con `swiftToolsVersion: "6.1"`,
`packageOptions` con `symlink: true` (evita una colisión de identidad de paquetes) y
**`packageTraits: { "@capacitor-firebase/authentication": ["Google"] }`**: los traits de fábrica
traen también el SDK de Facebook, y listarlos lo deja fuera. Pide Xcode 16.3 o más. El enlace que
crea `cap sync` (`ios/App/CapApp-SPM/symlinks/`) está en `ios/.gitignore`.

**`GoogleService-Info.plist` está fuera de git**, como `.env.local` (DP-21.2.3), y va en
`ios/App/App/`. `npm run ios:build` corre antes `scripts/comprobar-ios.mjs`, que termina con una
frase en español si falta, si es de otro `BUNDLE_ID`, si no trae `CLIENT_ID` —la hoja de Google no
se abriría y la llamada no volvería nunca— o si el `REVERSED_CLIENT_ID` no está en
`CFBundleURLSchemes` de `Info.plist` —GoogleSignIn cerraría la app al tocar el botón—. **Sin el
archivo la app arranca igual**: el plugin no configura Firebase nativo, lo anota y sigue. Por eso
el `signOut` del plugin **solo se llama si la sesión entró con Google o Apple**: sin Firebase
nativo configurado, cerraría la app, y haber entrado con un proveedor es la prueba de que el
archivo estaba. No hace falta tocar `AppDelegate` ni `SceneDelegate`: el plugin configura Firebase
solo, y GoogleSignIn vuelve por la sesión web del sistema y no por una URL abierta.

**Cómo comitear `project.pbxproj` sin el Team.** El Team (`DEVELOPMENT_TEAM`) lo pone la fundadora
en Xcode y vive en su copia para siempre. Los cambios del proyecto se hacen **editando el texto**
(así entraron `CODE_SIGN_ENTITLEMENTS = App/App.entitlements` y la referencia al plist) y se
comitean **por ruta**, nunca con `git add -A`, `git add .` ni `git commit -a`. Antes de cada commit
que toque el archivo, `git show :ios/App/App.xcodeproj/project.pbxproj | grep DEVELOPMENT_TEAM`
tiene que salir vacío, y `appIos.test.js` lo exige sobre el índice.

**Los errores.** Los proveedores tienen **su propio mapeo** (`comoMotivoDeProveedor`): un
`auth/invalid-credential` de Google o Apple es un token que Firebase no aceptó y nunca se dice como
«ese correo ya existe».
- **Cancelar no es un error** (`rechazado`, sin texto). Ni Apple ni Google traen código al cancelar,
  así que `esCancelacion` mira el mensaje. **Apple, por el dominio y el código en cualquier orden**:
  la app declara español y el mensaje llega localizado, con otro orden según el idioma —«…
  AuthorizationError error 1001.» en inglés, «Error de com.apple.AuthenticationServices.
  AuthorizationError 1001» en español—, así que se pide «AuthorizationError» y 1001 como número
  suelto. **No se busca una frase**: la primera versión buscaba «error 1001» y en español no
  aparece. Google, por su texto fijo, «The user canceled the sign-in flow.». **Cualquier otro
  rechazo sin código es `generico`, nunca `falloRed`.**
- **Un toque a la vez en los botones de proveedor**, también en P7: en nativo, dos
  `signInWithApple` seguidos se pisan el nonce y la llamada guardada del plugin. El freno es
  `unaVezCon` (`components/shared/unaVez.js`), sin `disabled`, y lo comparten P7,
  `FormularioEntrar` y Tu cuenta; antes había dos copias a mano y P7 no tenía ninguna.
- **Mismo correo, otra forma de entrar** (`auth/account-exists-with-different-credential`) es
  `otroMetodo` y tiene su frase en P7, en la vista de entrar y en Tu perfil (DP-21.2.7). **No se
  vinculan cuentas.**
- En el PIN, cancelar la hoja es `cancelado`: la pantalla se queda como estaba, sin nota.

**Apple pide nombre y correo, y el nombre no sale de `credencialNativa`** (DP-21.2.5, reescrita).
En iOS el plugin pide los dos ámbitos y no hay forma de pedir solo el correo. Lo que se toma de la
respuesta es el token y el nonce, y una prueba lo vigila. **P2 tiene que seguir siendo opcional**:
Apple puede rechazar una app que exige el nombre después de Iniciar sesión con Apple. Con el
correo oculto (`…@privaterelay.appleid.com`), Tu cuenta dice «Entraste con Apple. Tu correo se
queda oculto.» en lugar de la dirección (DP-21.2.6, `esCorreoOculto`).

**Cerrar sesión** (DP-21.2.8, reescrita) cierra la sesión de Strivo y la del SDK de Google en el
teléfono; **la del navegador del sistema, no**. La próxima vez Google vuelve a preguntar con qué
cuenta, pero la anterior puede seguir en la lista. Con Apple no hay nada que cerrar. Si el cierre
del plugin falla, la salida sigue.

**Recuperar el PIN y, después, borrar la cuenta.** `reautenticar` decide el método por el de la
sesión —`metodoDeSesion`, el `signInProvider` del token—, no por `providerData[0]`, cuyo orden no
está garantizado. Con Google o Apple pasa por `reautenticarConProveedor`, en `lib/`, porque SPEC_24
la va a necesitar. La revocación del token de Apple al borrar está anotada al final de SPEC_24, sin
elegir camino.

**Excepción de marca a RN-VIS-03, solo para el botón de Apple.** Sus pautas admiten el botón blanco
o el negro y nada más. Va **blanco en los dos momentos**: de día con borde, texto y logo negros
(`#000000`); de noche, sin borde. Es el único negro puro de la app y vive en dos tokens de
`globals.css` (`--proveedor-tinta-apple`, `--proveedor-borde-apple`). En `lint:contraste` va como
excepción con nombre (`EXCEPCIONES_DE_MARCA`), no entre los pares generales, y una prueba falla si
`#000000` aparece en cualquier otra línea de la hoja. **Google** va igual —blanco, con borde solo
sobre superficie clara— en **Inter y no en Roboto**, y con el gris de borde `#5F6368`: el de sus
pautas actuales (`#747775`) se queda en 2,87:1 sobre la parada más oscura de la mañana.

**Lo que ya se vio en un teléfono** (31 oct y 1 nov 2026, la fundadora en su iPhone contra
`strivo-fe04f`, sobre `cda6215`): **N1–N15 y la regresión web pasan.** Las dos hojas abren;
cancelarlas no dice nada en P7, la vista de entrar, Tu perfil ni el PIN; la sesión sobrevive a
cerrar la app; tras salir, Google vuelve a mostrar la hoja para elegir cuenta; el PIN se recupera
con las dos hojas; con el correo oculto, Tu perfil no enseña la dirección de relevo; y los botones
miden lo mismo, con Apple primero, de día y de noche. El resumen está en el §9 de la instrucción y
el detalle en `docs/specs/BITACORA_PRUEBAS_SPEC_21_2.md`.

**N8, mismo correo por dos caminos**, con «una cuenta por correo» y la protección contra la
enumeración activada: entrar con Google sobre una cuenta de correo **no verificado** llega a sus
días con el mismo UID, pero **Firebase le quita la contraseña** —la fila queda solo con Google—.
Restablecer la contraseña la devuelve y **quita Google**. **`otroMetodo` no aparece**, como se
esperaba; queda para cuando Firebase sí devuelva el error. Nada de lo escrito se pierde. La
fundadora decidió (D-N8, opción c): una pista en `CUENTA.error.credenciales` para la 1.0, y
verificar el correo al crear la cuenta después del lanzamiento.

**Siguen abiertos, fuera de 21.2 y sin causarlos ella**, y los tres bloquean la publicación:
**O-1**, la primera bajada de una cuenta en un iPhone recién instalado suele acabar en el aviso de
restauración y pide «Intentar de nuevo»; **O-2**, en la web la subida se queda en «Guardando» sin
error porque `flush` espera un `setDoc` colgado; **O-3**, en el iPhone la subida tarda ~1 minuto y
solo termina con «Intentar de nuevo». Pasan, con la pista de D-N8, a una instrucción nueva.
**Cerrados por SPEC_31** (10 nov 2026, arriba): M1–M7 pasan en el iPhone y en la web.

### App iOS (SPEC_21.1, 12 oct 2026)

La instrucción completa está en `docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md`, con la SPEC
madre en `SPEC_21_CAPACITOR_IOS.md`. **La misma app, empaquetada dentro de un binario de iPhone**:
ninguna pantalla cambia salvo las áreas seguras. Google nativo e Iniciar sesión con Apple son de
SPEC_21.2 (arriba).

**Cómo se construye y se abre:**

```bash
npm run ios:build      # comprueba GoogleService-Info.plist, vite build --mode ios y cap sync ios
npm run ios:abrir      # cap open ios: abre Xcode
npm run ios:arranque   # escribe SimboloArranque.imageset (la «S» del arranque) desde el símbolo
npm run ios:recursos   # npx --yes @capacitor/assets@3.0.5 generate --ios: solo el ícono
```

**`ios:recursos` es solo para el ícono** (D-21.11). Lee `assets/`, y ahí solo están los tres
archivos del ícono: un `splash.png`, un `logo.png` o un `icon.png` le harían volver a escribir un
arranque de 2732 × 2732. `appIos.test.js` falla si `assets/` tiene cualquier otro archivo.

**`@capacitor/assets` no está en `package.json`, a propósito**: arrastra una copia de la CLI 5 y un
`sharp` viejo con binario nativo que Netlify instalaría en cada build web. Se ejecuta fijado con
`npx`. El script de la pantalla de arranque usa `sharp` 0.35 como devDependency propia. **Solo se
genera iOS**: los íconos de Android son de SPEC_26.

**Lo que no se toca nunca, porque no tiene vuelta atrás una vez publicado:**

- **El identificador: `com.hellostrivo.strivo`** (DP-21.3).
- **El esquema y el host del WebView: los de fábrica, `capacitor://localhost`** (DP-21.8), y por
  eso no se declaran en `capacitor.config.json`. **El origen es donde viven IndexedDB y
  `localStorage`**: cambiarlo después de publicar deja a cada persona con la app vacía, sin error y
  sin forma de recuperar lo escrito. Es «nada se pierde» roto en silencio. La SPEC madre proponía
  `ios.scheme: 'strivo'`, y no se aplicó por esto.
- **Sin `server.url` y sin `allowNavigation`**: los archivos van dentro del binario. Es la defensa
  frente a la Guideline 4.2, que rechaza un envoltorio que carga una web.
- **La base SQLite: `Library/Strivo/strivo.sqlite`** (SPEC_17B, DP-17B.2). Cambiar la carpeta o el
  nombre después de publicar abriría una base vacía. La vigilan `appIos.test.js` y una prueba
  XCTest del plugin.

Una prueba (`appIos.test.js`) lee `capacitor.config.json`, `project.pbxproj` e `Info.plist` y falla
si alguno cambia.

**iOS 16.2 como mínimo**, en el proyecto y en el target, Debug y Release. El de fábrica de
Capacitor 8 es 15.0 y no basta: el arranque usa `crypto.randomUUID` sin guarda y Tu perfil usa
`.at()` (los dos desde 15.4), y `globals.css` pide `color-mix()` (desde 16.2). **No se añaden
guardas para 15.x**: lo decidió la fundadora, y ningún iPhone que pueda tener iOS 16 se queda
fuera. **Por lo mismo, ninguna expresión regular de `src/` mira hacia atrás** (`(?<=`, `(?<!`):
WebKit las admite desde iOS 16.4, y en 16.2–16.3 una de ellas rompe la función que la usa o, como
literal, el módulo entero. Lo vigila `appIos.test.js`; `esCancelacion` llegó a usar una. `cap sync` no lo revierte, y la prueba lo vigila. `CapApp-SPM/Package.swift` dice `.v16` y
es correcto: es el mínimo del paquete, no el de la app, y lo reescribe la CLI.

**Swift Package Manager, no CocoaPods.** Es lo que usa Capacitor 8 por defecto. `Package.swift` lo
mantiene la CLI y `Package.resolved` se versiona: fija `capacitor-swift-pm` en la versión instalada.

**El build nativo no lleva service worker** (DP-21.7). `vite build --mode ios` apaga el PWA
(`pwaApagado`, en `vite.config.js`): dentro de la app los archivos ya están en el binario, y un
service worker podría servir una versión vieja tras una actualización. Netlify lo conserva.

**Auth en nativo es `initializeAuth` con IndexedDB y sin `popupRedirectResolver`**
(`opcionesDeAuth`, en `firebase.js`). `getAuth` carga el resolvedor de ventanas emergentes —un
iframe de `authDomain`— que dentro del WebView puede no cargar nunca y dejar colgado
`authStateReady()`. Sin resolvedor no hay ventana emergente, así que **en nativo Google y Apple
entran por la hoja nativa y `signInWithCredential`** (SPEC_21.2, arriba). En web, nada cambia.

**La barra de estado la decide el cromo, no la paleta.** La cabecera llega hasta el borde de arriba
y es el contratono oscuro en todas partes salvo en la Noche de Hoy, así que la regla de la SPEC
—«texto oscuro en Mañana»— dejaba la hora ilegible en casi toda la app. La tabla aprobada vive en
`lib/barraEstado.js` y se prueba fila por fila. **Los recorridos de la mañana y de la noche no
ocultan el cromo**: en Hoy la navegación solo se retira para «Respira un momento». Funciona con una
pila en la que **manda la capa, no el orden de montaje** —modal, pantalla, secciones y la base del
arranque; a igual capa, la última apuntada—, porque React monta los efectos de los hijos antes que
los del padre y una confirmación ya montada dentro de las secciones quedaría debajo. El buen deseo,
«Buenas noches» y la confirmación tapan el cromo sin ocultarlo y piden su propio color.

**La pantalla de arranque es la «S» sobre papel**, igual que el ícono (DP-21.1): un `UIView` de papel
`#FBF8F4` fijo en sRGB con un solo `UIImageView` (`SimboloArranque`, `scaleAspectFit`) de **97 × 123
pt**, centrado en la vista entera y no en el área segura. El plugin vuelve a montar este mismo
storyboard encima del WebView, así que su capa es idéntica. Se retira tras el
primer pintado **y 300 ms de papel quieto** con un fundido de 320 ms, o sin espera ni fundido con
«reducir movimiento». De día el velo es papel y el paso no se ve. **De noche el velo es índigo**, y el
fundido es lo que lo vuelve un paso y no un corte; arreglarlo del todo depende del tono del velo
nocturno, que sigue sin decidirse.

**Por qué espera** (D-21.9, 13 oct 2026). Dos fotogramas después de montar, la app todavía no está a
la vista: iOS sigue enseñando su propia imagen del arranque mientras termina el zoom desde el ícono.
El fundido empezaba ahí y corría sin verse; grabado a 60 fps en un iPhone 17, iOS destapaba la
ventana con el fundido ya al 41 % —0,41 × 320 ≈ 131 ms invisibles—, y de noche se veía un salto de un
cuadro del papel a un gris violáceo. **La prueba de que era el fundido nativo y no algo de la web**:
el salto recorría la misma fracción en los tres canales, que es la firma de una sola capa con alpha
sobre un fondo quieto. `ESPERA_ANTES_DE_RETIRAR` (`lib/pantallaArranque.js`) es ese tiempo con un
margen de 2,3×, y **hay que recalibrarla si cambia el aparato mínimo**: el síntoma de que se quedó
corta es el mismo salto. Cuándo y cómo lo decide `planDeRetirada`, que es pura. **Y la retirada
ocurre siempre**: con `launchAutoHide: false` un `hide()` que no llega deja la app en la «S» para
siempre, así que la llamada es lo primero de `main.jsx`, tiene un techo de 2 s que la hace aunque no
lleguen los fotogramas, se hace una sola vez y, si lanza o se rechaza, se repite sin fundido.

**Por qué la pantalla de arranque es ligera (D-21.11, nov 2026).** Al abrir desde el ícono, la
ventana que crecía pasaba por negro antes del papel: en el iPhone, ~500 ms en frío y ~80 ms en el
segundo arranque, de día y de noche, en modo claro y en oscuro. **La causa la dijo el propio iOS**:
`splashboardd` registraba «Estimated size (29900800) is over limit (25000000)» y marcaba la app con
«a bad launch image until it is updated». La imagen `Splash` era de 2732 × 2732 **en las tres
escalas** —29,9 MB al decodificarse— y **el límite de iOS para una pantalla de arranque es de 25 MB**.
Al pasarse, iOS descarta el storyboard entero y la ventana sale negra; el papel solo llegaba con la
capa del plugin. **Descartado antes:** el modo oscuro (`systemBackgroundColor`, adenda de 21.1 §1),
el fondo del storyboard y la caché. **El arreglo:** la «S» a su tamaño justo, sobre el papel de la
vista. El símbolo sale del SVG por `scripts/componer-arranque.js`, que exporta las medidas; el
storyboard repite los mismos números y una prueba comprueba que coinciden. `Splash.imageset` y
`assets/splash*.png` salieron del repo. En el simulador (iPhone 17, iOS 27.2) pasó de 2,4 s de negro
puro en frío y 1,1 s en el segundo arranque a ningún cuadro negro, en los dos modos, y la «S» quedó a
1 px o menos de donde estaba. El `Assets.car` del Release de simulador pasó de 81 480 a 51 032 B.

- **Regla: ninguna imagen del arranque va a sangre ni es más grande de lo que se pinta.**
  `appIos.test.js` falla si una imagen del catálogo pasa de 1024 px por lado o si vuelve
  `Splash.imageset`.
- **iOS guarda la pantalla de arranque por versión de la app.** Cualquier cambio en ella se prueba
  **tras borrar la app y reiniciar el teléfono** (o el simulador): si no, se ve la versión vieja, o la
  marca de «mala» de la anterior. En el simulador, las variantes salían sin «S» hasta reiniciarlo.
- **En el simulador, una build sin firmar también sale en negro**, por otro motivo (error −67056 al
  leer el storyboard). Toda medición del arranque va firmada (ad hoc basta: `CODE_SIGN_IDENTITY=-`).
- **En teoría el primer cuadro de la app podría salir sin la capa del plugin**, que se añade con
  `DispatchQueue.main.async`, y la ventana no tiene color. En la práctica no se ve. Si alguna vez se
  viera, el arreglo es darle papel a la ventana en `SceneDelegate`, y eso es código nativo: se decide
  aparte.

**Áreas seguras.** `ios.contentInset: 'never'`: con `'automatic'` iOS pone su propio margen, los
`env()` valen 0 y el fondo no llega bajo la isla. Tres pantallas sin cromo no tenían su margen y lo
tienen ahora, idéntico en web: la cabecera de la sesión de Respiración (`pt-safe`), el editor del
Journal (`max(1.5rem, env(...))`) y la hoja de ajustes de la sesión, por abajo.

**`UIBackgroundModes: [audio]` se queda, y se usa** (SPEC_23 Parte 2, DP-23.3 = c): una sesión de
Respiración con sonido sigue sonando con la pantalla bloqueada. Declararlo sin usarlo sería motivo
de rechazo; ahora es lo que permite que el sonido siga.

**Probado en el simulador de Xcode** (iPhone 18 Pro, iOS 27): compila, arranca, la pantalla de
arranque se retira, el onboarding de noche sale con la hora en claro sobre índigo y debajo de la
isla. **El primer arranque de un simulador recién encendido tarda casi veinte segundos en cargar el
WebView**: no es la app. El iPhone físico y los criterios 6–15 son de la fundadora.

### Las referencias de las frases: tres opciones, la misma redacción en los dos sitios (12 oct 2026)

Lo pidió el propietario del producto, primero para Tu perfil y después también para el onboarding
(`p5r`): **las dos superficies dicen lo mismo** y vuelven a leer **el mismo objeto de copy**
(`REFERENCIAS`), que es lo que ya pedía SPEC_29. La lógica de las frases no cambia: los
identificadores, `normalizar` y el selector son los mismos.

- **P5R se titula «Para tu inspiración diaria»** y su apoyo son dos párrafos (`apoyo` admite una
  lista). La pregunta no cambió.
- **Tres opciones**: «Quiero elegir referencias espirituales», «Sin una tradición espiritual
  específica» y «Prefiero frases seculares, sin referencias espirituales».
- **«Prefiero decidir después» ya no se ofrece en ningún sitio** (`MODOS_OFRECIDOS`, en
  `referencias/preferencias.js`). No se elige: es lo que vale sin elegir. El modo `sin_definir`
  sigue en `MODOS` porque hay elecciones guardadas con él, y es lo que deja «Borrar mi elección» o
  saltar P5R. Quien lo eligió no ve ningún chip marcado, y el resumen de Tu perfil lo sigue diciendo
  con su frase (`perfil.frases.actual.sin_definir`).
- **En Tu perfil la primera pregunta va sin título ni apoyo** (`conEncabezado={false}`): el bloque
  ya tiene los suyos y su `hint` es propio («Para que tus frases diarias reflejen mejor…»).
- **El texto de los chips de las dos preguntas va a la izquierda**, en los dos sitios (`alIzquierda`,
  de `ListaDeChips` a `Chip`). Un `<button>` centra por defecto y se notaba en cuanto la opción
  envolvía. Es una prop y no un cambio de la píldora: el resto de chips de la app no se tocaron.
- **El tamaño del encabezado lo da su nivel** (`PreguntasReferencias`): `h1` en el onboarding,
  `text-lg`; `h3` en Tu perfil, `text-base`, por debajo del `h2` del bloque (`text-md`). «Elige tus
  referencias» se leía más grande que «Personaliza tus frases».
- **En Tu perfil, «Tu elección:» y lo elegido van en un solo párrafo**, y las afinidades se dicen
  sin «Referencias de»: «Tu elección: Cristianismo y Estoicismo.». **Sin elección no hay
  etiqueta**: dice solo «Todavía no has elegido.».

### «Comenzar mi día» se despide con un buen deseo (12 oct 2026)

Lo pidió el propietario del producto. «Comenzar mi día» devolvía a la consulta sin más; ahora deja
delante **un buen deseo** —«Que tengas un día sereno.»— y debajo, más pequeño y en el secundario,
«Puedes volver y cambiar lo que quieras.». Es **el mismo gesto que «Buenas noches.»** con la luz de
la mañana: cinco segundos, medio de desvanecido (`.salida-cierre`, la misma regla de la hoja),
tocarlo salta la espera y con movimiento reducido no hay desvanecido. Al irse vuelve a la consulta,
que es donde llevaba el botón antes; desde ahí «Cambiar algo» reabre el recorrido con todo lo
escrito. **La Noche no se tocó**, ni su flujo ni su copy.

- **Veinte frases que rotan por mañana cerrada, no por calendario** (`src/diario/mananaDeseo.js`).
  El mismo día devuelve la misma aunque se reabra y se vuelva a cerrar; la siguiente mañana cerrada
  lleva la siguiente de la lista, y **ninguna se repite hasta haber pasado las veinte**. Quien pasa
  una semana sin abrir la app retoma donde se quedó, no siete frases más allá. Cerrar tarde un día
  anterior —la ventana de 72 h lo permite— no le da la frase que ya salió al día siguiente: se
  saltan las diecinueve más recientes. **No mira nada de lo escrito** (RN-06).
- **El modelo se amplía con `wishId`** en `morningEntry`, como la pausa guarda `reflectionId`: la
  rotación se decide leyendo lo ya escrito, sin contador aparte, y viaja con la mañana a la nube. Las
  mañanas anteriores no lo traen y no hace falta migrar nada. Las frases viven en
  `copy.diario.manana.cierre.deseos` con un `id` cada una: **solo se añade al final y un id no se
  cambia**.
- **Se llama «deseo» y no «saludo», a propósito.** En este código el saludo es el del héroe de Hoy
  y `separacion.test.js` prohíbe que la mañana empotrada lo nombre. Es además lo que es: un buen
  deseo, no una felicitación.
- **Terminar responde en el acto y guarda detrás**, como la noche desde el 12 de septiembre: el
  cierre se pone delante en el mismo toque, una guarda (`cerrando`) deja pasar uno solo y el buen
  deseo **solo se dice con la mañana guardada**; si la escritura falla, se dice qué pasó y se
  ofrece reintentar. Salda la deuda anotada ese día.
- **Las dos duraciones están escritas en `AperturaDelDia.jsx` y no se importan de la noche**: la
  mañana no nombra la noche. Una prueba (`mananaDeseo.test.js`) compara las de los dos componentes
  y la de la hoja.

**Verificado en Chromium con Playwright a 390 px**, además de la suite: la intención y el paso,
el buen deseo al tocar, el desvanecido entre los 5,0 y los 5,5 s, vuelta a la consulta, lo escrito
intacto al reabrir, la misma frase al volver a cerrar y el toque que salta la espera.

**Lo que sigue sin decidirse ni verse en un teléfono:** la revisión editorial de las veinte frases
es del propietario del producto, como la del resto del repertorio; y si cinco segundos de buen
deseo por la mañana —cuando la gente tiene prisa— son un respiro o una espera. Tocarlo ya la salta.

### Tu perfil: «Cómo son tus días» cabe en su tarjeta (12 oct 2026)

Lo pidió el propietario del producto. **Solo en Tu perfil; el onboarding (P5) no se tocó.**

- **El apoyo dice «Para acompañarte a tu ritmo.»** y las etiquetas, «Me despierto a las:» y «Me
  duermo a las:». P5 conserva su redacción, que sigue con «no al de la app. Lo cambias cuando
  quieras.».
- **Los campos de hora se salían de la tarjeta.** Es el mismo defecto que se corrigió en P5 el 26 de
  agosto y la corrección nunca llegó aquí: ahora el bloque lleva `campo-hora` en cada campo y
  `min-w-0` en cada renglón, y una prueba en `perfil.test.js` lo vigila. **Ni Chromium ni el WebKit
  de escritorio reproducen el desbordamiento** —el ancho propio del control es de Safari en iOS—,
  así que la verificación a 320, 360 y 390 px solo confirma que nada se rompió. Falta verlo en un
  iPhone.

### Frases del día personalizadas (SPEC_29, 4 oct 2026)

La instrucción completa y sus decisiones están en `docs/specs/SPEC_29_FRASES_PERSONALIZADAS.md`.

**Se llamó SPEC_28 hasta el 4 oct 2026** y así lo dice el commit que la fusionó (`651dbec`). El 28 es de
«Una pausa», que ya iba por SPEC_28.5 en su rama; renombrarla a ella habría tocado unas 500 menciones.

- **Catálogo v2** en `src/content/frases-v2/`: 1 000 originales aprobadas en siete audiencias
  (universal, secular, espiritual general y cuatro tradiciones), 464 citas aprobadas del lote C3 y
  25 candidatas del lote C2 en `pendiente_revision`. **El selector solo ve las aprobadas.** Cada perfil ve 500 o más y 100 por
  tema. **Solo se añade al final de cada lista**: el id de una original sale de su posición.
- **Las originales van sin comillas y sin pie**; ya no firman «Versión Strivo inspirada en…». Las
  citas, entre «», con «Autor · Obra, ubicación», y solo con expediente en
  `docs/frases-v2-fuentes.md` y dos firmas (editorial y jurídica).
- **Selector:** tema por día, ciclo por tema intercalado por audiencia y ordenado por hash del id,
  desfase por perfil. 500 días sin repetir; con ánimo bajo, calma en lugar de esfuerzo y ninguna
  repetición antes de 100 días. La asignación se guarda por (fecha, huella).
- **Onboarding:** `p5r` (paso, cuenta) y `p5ra` (sub-paso, solo con «Quiero elegir referencias»).
  Ocho pasos y dos sub-pasos; `VERSION = 4`. **Tu perfil:** bloque «Personaliza tus frases».
- **La preferencia es sensible y vive solo en este dispositivo**: salir de la cuenta o reinstalar
  la devuelve a `sin_definir`. Está anotado como consecuencia asumida.
- **`separacion.test.js` busca `\britual`**: «espiritual» contiene «ritual».

**Pendiente de esto:** revisión editorial de las 1 000 originales por la propietaria del producto;
revisión legal del aviso de privacidad y de la exportación (SPEC_24); verlo en un teléfono.

**Lote C3 de citas (14 oct 2026): 464 aprobadas**, con las dos firmas. La proporción de citas va del
20 % (secular y espiritual general) al 38 % (cristianismo con estoicismo y budismo). Cambian tres
cosas, y conviene saberlas:

- **Se admiten licencias abiertas de uso comercial**, no solo dominio público. La Biblia en Español
  Sencillo es **CC BY 4.0 y exige atribución**: va en el campo `atribucion` de cada cita
  («… · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)») y la app la pinta
  tal cual en `FraseDelDia` y en las fuentes de Tu perfil. Quitar o recortar esa cadena rompe la
  licencia. Las ediciones de SuttaCentral y Standard Ebooks son CC0.
- **Hay traducciones editoriales de Strivo**, hechas por IA y aprobadas sin revisión de una persona
  traductora; su atribución lo dice. El criterio completo está en `docs/frases-v2-fuentes.md`.
- **El selector reparte las afinidades en proporción a su tamaño**, y ahora los tamaños difieren
  (cristianismo 238, estoicismo 186, budismo 170, hinduismo 144). Con las cuatro elegidas,
  hinduismo puede salir una sola vez en 30 días. Las pruebas miden contra la proporción desde este
  lote (SPEC_29 §8). **Igualar el reparto está sin decidir y es del propietario del producto.**

### Marca: el logo oficial y el video de apertura (25 ago 2026)

Llegan dos materiales del diseñador y los dos sustituyen algo que ya existía:

- **`Strivo_Logo_Oficial.svg` sustituye a `strivo_simbolo.svg`, que sale del repo.** No es otra
  versión del mismo dibujo: es un **lockup vertical** —símbolo y palabra en el mismo trazado—, de
  relleno y no de trazo, sobre el lienzo `0 0 1016 920` y no `0 0 122 130`. Por eso **la cabecera ya
  no lleva el rótulo «Strivo» al lado**: el archivo ya lo dice, y ponerlo dos veces sería nombrar la
  marca dos veces. Va a **56 px de alto**, que es el mínimo al que la palabra se lee: ocupa la quinta
  parte inferior del lienzo, así que a los 18 px del símbolo anterior medía 3,5 px. El tono de firma
  pasa de `#2B2730` a **`#2B282F`**, y aparece un segundo color, **`#776F79`**, en los dos puntos
  terminales. Manual §3.1, §3.2 y §3.3 reeditados; `lint:contraste` mide los dos colores nuevos.
- **`strivo_apertura.mp4` sustituye a la frase, y solo al abrir la app.** La frase sigue viva en el
  umbral de la Mañana, así que el repertorio de §C7.5 conserva su consumidor. **El archivo se
  renombró al integrarlo** —llegó como `Strivo_Apertura_Respiración.mp4`—: la ruta del `import`
  habría metido «Respiración» dentro de `TransicionLuz.jsx`, que tiene prohibido nombrarla
  (RN-LU-MAN-03), y la tilde viaja percent-encoded desde el hospedaje.

~~**Pendiente de esto:** el ícono de app y el favicon piden el símbolo suelto~~ — **saldado el 12 oct
2026 con los íconos v1**: la «S» en su color original sobre papel, sin wordmark. La web está en
`public/` —el manifiesto declara aparte `icon-512.png` (`any`) e `icon-512-maskable.png`
(`maskable`)—, la fuente de iOS y Android en `assets/` para cuando exista Capacitor, y los de las
tiendas en `docs/marca/iconos-v1/`, con su LEEME. Manual §3.5 reeditado: decía «S» blanca sobre
casi negro, y lo aprobado es lo contrario. **Límite conocido:** a 16 px los puntos casi desaparecen.

### Pendiente para cerrar F-0

- **Repuntar Netlify a `strivo`** y verificar la publicación en el dispositivo (paso 10, segunda
  mitad). Valorar después promover `strivo` a rama por defecto y retirar `main`, que está obsoleta.
- **131 menciones del alcance retirado siguen en comentarios de `src/`** (y en etiquetas de
  `describe`). No hay ni un identificador, ruta, token ni cadena visible: la comprobación final de
  §6 del plan pide que tampoco queden en prosa, así que es una pasada de comentarios pendiente.
- **`docs/copy-library.md` sigue fechado en v3 del blueprint** y no se reeditó: no estaba en el
  inventario de §4.4 del plan. Conviene decidir si se actualiza o se retira, porque hoy es una
  segunda fuente de copy junto a `src/copy/`.

### Fase F-1B — el onboarding, construido (25 ago 2026)

**Nueve pantallas, ocho pasos, una sola vez** —hoy ocho y siete: P4 salió el 1 de septiembre de
2026, más abajo—. Escrito desde cero contra v5.0; de `feat/onboarding-p1-p3c` no se portó ni una
línea. El copy vive en `copy.diario.onboarding` y el
recorrido en `src/onboarding/` + `src/components/onboarding/`.

- **Se interpone, no se enruta.** `App.jsx` pregunta `shared.onboardingPendiente(uid)` —que mira
  `completedAt` y solo eso— y monta el onboarding o las cuatro secciones. Saltarse todos los pasos
  también es haberlo hecho, así que contar `completedSteps` habría dejado fuera a quien entró de
  largo. Un árbol de antes de que existiera no trae la marca y lo hace una vez: nunca lo vio.
- **Abre con el video de marca, como cualquier otra apertura de la app.** Es la misma
  `TransicionLuz` con `conVideo` y el mismo contador de `lib/umbralSesion`, y de ahí sale gratis lo
  que antes había que decidir: si el velo se ve al empezar el recorrido, al terminarlo las secciones
  se montan con el contador gastado y no lo repiten. Dos velos seguidos serían un peaje
  (RN-LU-MAN-02). Hubo una apertura propia —una palabra, «Respira.»— y se retiró el 25 de agosto con
  su copy: abrir la app es abrir la app, también la primera vez.
- **El género (P2A) es un sub-paso.** No entra en la cuenta del indicador y, mientras dura, el
  indicador **no se pinta** —lo mismo que hace la mañana con su pausa opcional—. Sus cuatro opciones
  se resuelven a los tres valores del modelo: «prefiero no contestar» y «otro» van las dos al neutro,
  que es también lo que vale sin contestar.
- **Nada del onboarding depende de áreas en ningún punto**, y hay dos pruebas que lo vigilan: ni un
  archivo del recorrido las nombra ni una cadena de su copy las menciona. Era la garantía que
  sostenía la identidad central (P4); sigue en pie ahora que ese paso ya no está, porque nunca fue
  suya sino del recorrido entero.
- **P7 muda el árbol.** Hasta ahí se escribe bajo un uid local; al crear la cuenta, `mudarUid` renombra
  `users/{local}/**` al uid de Firebase. Sin eso, las reglas de Firestore —que exigen que el segmento
  de la ruta sea el uid autenticado— dejarían fuera de la nube todo lo escrito en los pasos previos.
  **No sobrescribe nada**: si la cuenta ya tenía árbol, gana el suyo y lo de la sesión anónima se
  queda donde está (RN-DB-04).
- **Se guarda mientras se recorre**, no al final: los toques al momento, lo tecleado a los 800 ms.
  Abandonar a mitad retoma en el paso donde estaba (RN-09).
- **`colors.area` sale de `tailwind.config.js`.** Eran ocho tonos rotulados «Áreas de identidad», uno
  por área del modelo de tres niveles. No los usaba ninguna clase del árbol y eran el último rastro
  de las áreas en los tokens: un color con nombre de área es una invitación a que el concepto vuelva
  por donde salió.

### Tu perfil y la barra inferior (26 ago 2026)

**Cinco destinos repartidos en dos barras.** Lo pidió el propietario del producto y **deroga cuatro
reglas de navegación a la vista**, que es lo que RN-NAV-01 exigía antes de añadir una quinta: la
regla se cambia, no se rodea. El blueprint §4 queda pendiente de esta revisión.

- **Arriba lo que se hace ahora, abajo lo que ya pasó y tú.** El Historial baja de la cabecera a la
  barra inferior, con Tu perfil al lado. El razonamiento del orden no se rompe, se cumple mejor: el
  Historial ya no tiene que encajar al final de una lista de cosas que se hacen hoy.
- **Las dos barras acompañan a todas las pantallas**, y las dos se ocultan juntas durante la
  escritura y las secuencias de cierre (RN-NAV-04). Con la de abajo solo en Hoy, llegar al Historial
  desde el Journal costaría dos toques donde antes costaba uno.
- **El Historial no cambió por dentro.** Sigue siendo el mismo calendario y la misma vista de día.
- **Tu perfil es una pila de bloques, y esa es su forma.** Hoy hay tres —nombre, género y horarios;
  el de identidad central salió con su paso— y la lista de cuáles existen vive en
  `src/perfil/bloques.js`. Añadir el plan de
  pago de una fase posterior es **un identificador allí, un texto en el copy y un componente**; hay
  una prueba que falla si falta cualquiera de los tres. **No hay bloques de "próximamente"**: una
  pantalla que promete lo que no puede cumplir es lo contrario de un refugio.
- **Las tres preguntas del onboarding se vuelven a hacer con su mismo catálogo**, leído de
  `onboarding/`. Son campos de `shared/profile`, no pasos de un recorrido. Si aparece un tercer
  consumidor, esos módulos piden un hogar neutral.
- **`.cabecera-espacio` pasa a llamarse `.cromo-espacio`.** Es la clase que viste de contratono en la
  Mañana, y ahora viste dos piezas: la cabecera y la barra. Una clase que dijera "cabecera" en la
  barra de abajo es de las que llevan a duplicar la regla en vez de reutilizarla.
- **`Chips.jsx` sube a `components/shared/`**, con el mismo criterio que `Campo.jsx` y `pildora.js` en
  F-1B: el Perfil pregunta el género y ofrece las mismas sugerencias, y tenía que hacerlo con **estos**
  chips.

**Sin cambios en el modelo de datos.** Tu perfil escribe los cinco campos que ya escribía el
onboarding, con la misma función (`onboarding/estado.js`), así que no hay un segundo sitio donde se
decida cómo se guarda una respuesta.

### La salida del umbral y el onboarding en una pantalla (26 ago 2026)

Lo pidió el propietario del producto después de recorrerlo en un teléfono. Son
tres cosas y ninguna cambia el modelo de datos ni el copy:

- **La apertura sale despacio.** El video ya no corta: su último fotograma
  —que es el logo sobre fondo índigo (44,39,75) desde `a1de26c`— se desvanece sobre el velo, hay un
  instante de pantalla lisa y el velo se retira dejando aparecer lo de detrás.
  Alarga la apertura ~1,4 s. Está descrito arriba, en §2.
- **El onboarding cabe en una pantalla.** El marco mide `100dvh` con `100vh` de
  respaldo (`.alto-pantalla`) y se reparte en tres franjas: indicador arriba,
  paso en medio, "Atrás" y "Continuar" abajo, dentro del área segura y siempre a
  la vista. Antes la columna crecía con el contenido y en un teléfono había que
  ir a buscar "Continuar" por debajo del borde. **Lo único que se desplaza es la
  franja de en medio**, que hoy no lo necesita ningún paso —lo necesitaba la
  identidad central (P4), que era el más largo y ya no está—. **La bienvenida y
  el cierre se centran verticalmente**: no piden nada, y una frase sola pegada
  al techo se lee como el encabezado de un formulario. Los pasos con preguntas no se centran — se moverían de sitio al
  aparecer o desaparecer un campo.
- **El bloque de horarios (P5) ya no se va de lado.** Un `input[type="time"]`
  trae un ancho propio del navegador, mayor que el hueco de un teléfono, y su
  `min-width: auto` de elemento flexible le impedía encoger: empujaba a su
  contenedor y con él el bloque entero hacia la derecha. Lo corrige `.campo-hora`
  —`appearance: none`, `min-width: 0` y el valor alineado a la izquierda, que en
  iOS se pinta al otro lado— más `min-w-0` en cada renglón.

**Lo que no se tocó, y conviene saber por qué:** el tono del velo sigue siendo
el del momento —papel de día, índigo `#191428` de noche— y no el fondo del
video, que desde `a1de26c` es índigo (44,39,75), así que el fotograma se ve con
bandas: arriba y abajo en un teléfono, a los lados en una pantalla apaisada.
Cambiarlo obligaría a que los dos
instantes de arranque —resolver el uid, preguntar si queda onboarding— supieran
si va a haber umbral, o meterían el fogonazo que hoy evitan. **Está sin decidir**,
y es del propietario del producto.

### Los rituales admiten más de una respuesta, y la noche pregunta según el día (30 ago 2026)

Lo pidió el propietario del producto. Son tres cambios y **el modelo de datos se amplía sin tocar
nada de lo ya escrito** (RN-DB-04):

- **Las dos preguntas emocionales de la mañana admiten hasta tres.** `feeling` e `intention` salen de
  la lista de escritura y entran `feelings` e `intentions`; las mañanas de agosto siguen trayendo su
  campo en singular y se releen igual. Al llegar a tres, **la cuarta no entra hasta soltar alguna**:
  se preguntó explícitamente y se decidió así sobre la alternativa del Journal. El razonamiento largo
  vive en `seleccionEmociones.js`, que es donde está la regla.
- **La gratitud llega hasta diez.** Un número en `filas.js` y la frase del tope —«Diez cosas. Nada
  mal.»— que ya estaba escrita para una lista de diez y por fin la tiene. Sigue abriendo con un campo.
- **La pregunta que abre la noche se dice en el tono del día.** Descrita arriba, en §7. Es la primera
  vez que una pregunta principal cambia de redacción, y **no deroga RN-VOZ-03**: esa regla protege
  las preguntas que ordenan cada recorrido, que siguen llegando siempre igual. Lo que cambia aquí es
  el tono de una sola, por lo que la persona acaba de decir de sí misma.

**Las quince preguntas se escribieron en primera persona.** Llegaron en segunda —«¿Qué quieres
reconocer de este día?»— y §12 pide que todas las preguntas de la noche hablen en primera. Las ideas
de apoyo sí tutean, como las de la mañana: ahí sí es la app la que ofrece algo.

**Nada de esto se ha visto en un teléfono todavía**, como el resto del producto. La pregunta que
ninguna prueba contesta es si tres píldoras elegidas y una lista de diez siguen cabiendo en un
recorrido de uno o dos minutos.

### Primera persona en toda pregunta, y una noche sin ecos (30 ago 2026)

Auditoría de las 67 cadenas con interrogación del copy, a petición del propietario del producto. La
línea que se aplicó es una que ya existía en el código: **lo que se pinta como encabezado de la
pregunta (`h1`/`h2`) va en primera persona; lo que va en la franja de apoyo —el `lead` gris, las
ideas bajo el renglón enfocado— puede tutear.** Es la app la que ofrece algo ahí.

De 35 encabezados que son pregunta, 33 cumplían. **Los dos que no estaban en los rituales, y los dos
se corrigieron:**

- `noche.descarga.titulo` → «¿Hay algo de mi día que quiera dejar aquí?»
- `noche.reflexion.manana` → «Esta mañana elegí {emocion} como intención. ¿Qué noté en mí?»

**El onboarding y Tu perfil se quedan en segunda persona**, decidido explícitamente: son gestión de
cuenta, no recorrido. Son nueve encabezados —`p2a`, `p3`, `p3.otherPlaceholder`, `p5`, `p6` y los
cuatro rótulos de los bloques del perfil— y **no son un descuido**: si alguien los «arregla», los
está cambiando en contra de una decisión tomada.

**Y ninguna pregunta repite lo que ya se pregunta esa misma noche.** Una noche enseña hasta cuatro
—reconocimiento, reflexión, emoción y descarga—. El banco de la reflexión y la descarga llevan meses
estables, así que **fijan el vocabulario y el reconocimiento es el que se aparta**: quedan fuera de
sus quince preguntas «me dejó», «me llevo», «aprendí sobre mí», «recordar», «guardar», «ocupó
espacio», «soltar», «dejar» y la apertura «¿Hay algo que quiera…», que es de la descarga. Siete
redacciones se movieron por esto, y cuatro ideas de apoyo que decían casi literalmente el encabezado
que tenían encima.

**Lo que hacía falta arreglar de verdad era la vigilancia.** La regla estaba enumerada, no
comprobada: dos pruebas con listas escritas a mano, y la de la noche no incluía esas dos preguntas.
Por eso llevaban en segunda persona desde el 23 de agosto con la suite entera en verde — no fallaron,
es que nadie las metió en la lista. Ahora la lista las incluye y hay dos guardas más: ninguna pregunta
del reconocimiento puede usar el vocabulario ya ocupado, y ninguna idea de apoyo puede repetir el
encabezado de su pantalla. **Las guardas se comprobaron contra las redacciones viejas antes de darlas
por buenas**: la primera versión dejaba escapar tres de los cuatro choques, que es exactamente el
modo en que una prueba así no sirve para nada.

**Sigue sin haber una comprobación transversal** que recorra el copy entero y exija primera persona a
todo encabezado nuevo, con su lista de exenciones. Es lo que evitaría que esto vuelva a pasar en una
pantalla que aún no existe, y está sin hacer.

### El onboarding pierde un paso, el cierre saluda y la noche admite «Feliz» (1 sep 2026)

Lo pidió el propietario del producto. Son tres cambios sueltos y **ninguno toca el modelo de datos
por dentro**: lo que se retira se deja de escribir, no se borra.

- **La identidad central (P4) sale del recorrido, entera.** Se van la pantalla
  (`components/onboarding/Identidad.jsx`), su módulo (`onboarding/identidad.js`), su copy
  (`onboarding.p4`) y el bloque que la volvía a preguntar en Tu perfil. El onboarding pasa de ocho
  pasos a **siete**, y el indicador lo dice solo: el total sale de `CONTADOS` y nunca estuvo escrito
  en el copy, así que no quedó un «de 8» en ninguna parte.
  - **Los identificadores no se renumeran.** Los horarios son hoy el paso 4 y se siguen llamando
    `p5`, porque así están escritos en los expedientes que ya existen. El número lo da la posición,
    no el nombre.
  - **Quien se quedó justo en P4 sigue por donde iba**, no desde cero: `RETIRADOS` en `pasos.js`
    lleva `p4` a `p5`. Sin eso, `retomarEn` lo habría tratado como un paso desconocido y lo habría
    devuelto a la bienvenida, que es exactamente el coste que RN-09 no admite. Un `completedSteps`
    con `p4` dentro se relee tal cual: `anotarPaso` lo filtra al escribir y nadie lo corrige al leer.
  - **`identidadCentral` no se borra de nadie.** Sale de `perfilDesde`, así que ningún guardado
    posterior lo toca —`updateProfile` fusiona, y un `null` en el parche habría borrado la frase de
    quien la escribió al guardar cualquier otra cosa—. Sigue en `FIELDS.profile` y se sigue
    sembrando nulo en un árbol nuevo, para que un perfil viejo y uno de hoy tengan la misma forma al
    leerse (RN-DB-04). **La versión del recorrido sube a 2**, que es lo que permite saber qué se le
    preguntó a cada quien.
- **El cierre (P8) es un saludo y un botón.** «Bienvenida, Alejandra» en femenino, «Bienvenido…» en
  masculino y «Te damos la bienvenida…» en neutro y sin contestar. Se fueron con P4 la frase que se
  armaba con la identidad y la hora de la vuelta que iba debajo: explicar el saludo debajo del
  saludo es estrenar una segunda voz en la última pantalla que alguien lee antes de entrar. **Sin
  nombre saluda igual**, sin coma colgando y sin señalar la pregunta que se dejó en blanco.
- **«Feliz» entra en «¿Cómo me siento al cerrar el día?»**, justo detrás de «En paz». Trece opciones
  más la palabra propia. **No trajo mecánica propia**: mismo chip, misma selección única, mismo tope,
  mismo `id` persistido. Cae en el ánimo `en_paz` de la escala de cinco —no la amplía, que exigiría
  un color de marca nuevo— y en el grupo **sereno** de la pregunta del reconocimiento: quien cierra
  el día feliz acaba de decir que fue bueno. No ofrece la descarga por su cuenta, como el resto de
  las serenas.

**Lo que sigue sin verse en un teléfono**, como el resto: si el recorrido de siete pasos se siente
más breve o solo más corto.

### La ventana de edición de 72 horas (3 sep 2026)

Lo pidió el propietario del producto después de que una tester llegara a casa a las dos de la
mañana y no pudiera cerrar el día que acababa de vivir: la clave de fecha ya había cambiado y se
encontró el día siguiente en blanco. **No es un caso raro** —se registra tarde, se olvida un día, se
viaja— y cortar a medianoche castiga el uso real de la app, que es lo contrario de un refugio
(RN-05).

**Lo que había, verificado antes de tocar nada.** No existía ninguna regla de «día cerrado»: nadie
comparaba contra la fecha de hoy, nadie llamaba a `toDateString()` y `dayState` sigue sin escribirse.
El bloqueo era **de alcance, no de guardia**: `Hoy.jsx` llamaba a `useDiario(uid)` sin fecha, así que
la única fecha que la app sabía escribir era la de ahora. `useDiario` ya aceptaba una `fechaPedida`
que nadie le pasaba nunca. La capa de datos escribe cualquier clave que se le dé.

**La regla vive en `src/diario/ventanaEdicion.js`, y el 72 solo ahí** (`HORAS_DE_EDICION`). Hay una
prueba que falla si alguno de los seis consumidores lo escribe a mano.

- **Un día empieza cuando lo dice el perfil, no cuando lo dice la medianoche.** Se cuenta desde el
  mismo `diaTerminaA` que elige la clave de fecha (RN-DB-01): con `diaTerminaA = "03:00"`, el día
  `2026-09-01` va de las 03:00 de ese día a las 03:00 del siguiente, y las 72 horas se cuentan desde
  ahí. Contarlo distinto haría que la ventana y la clave discreparan justo en las horas en que la
  gente escribe tarde, que es el caso que esto viene a resolver.
- **Todo en hora local y nada en UTC.** El inicio de un día se construye con sus tres números —nunca
  `new Date(cadena)`—, así que **cambiar de huso no esconde ni duplica un registro**: la clave se
  guardó con el día que se vivió y no se reinterpreta jamás. Lo que se mide es **tiempo transcurrido
  de verdad**, así que un cambio de horario no regala ni quita una hora de ventana.
- **Nada de esto se persiste.** Es lógica pura sobre tres datos —la fecha, el corte del perfil y el
  reloj— y se calcula al mirarla, como el punto de ánimo (RN-DB-05). Una marca de «cerrado» escrita
  a medianoche envejecería mal y habría que corregirla en silencio, que es justo lo que RN-DB-02
  prohíbe.

**Dónde se comprueba, y por qué en un solo sitio.** El guardián es `useDiario`, que es el único
camino por el que la app escribe un día: `programar` y los dos guardados de toque preguntan **en cada
toque** —la ventana es continua y una app abierta toda la noche la cruza sola— y `editable` se
recalcula al pintar en vez de heredarse de la carga. `guardarManana` y `guardarNoche` siguen siendo
escritura de bajo nivel y no comprueban nada: dos guardianes de la misma regla dan dos respuestas.

**Lo pendiente sí se vuelca aunque la ventana se cierre entre la última tecla y el volcado.** Eso se
escribió con el día abierto y **nada de lo escrito se pierde** (§14, no-negociable 4). Lo que la
ventana cerrada impide es empezar algo nuevo.

**En pantalla:**

- **Hoy ofrece los días abiertos y los nombra, no los cuenta** (`SelectorDia`, bajo el conmutador de
  sección). «Hoy», «Ayer» y el nombre del día de la semana; ni «hace 2 días», ni «1 de 3», ni horas
  que queden. **Ningún día lleva marca de vacío**: sería la lista de lo que falta, y aquí no falta
  nada. El día elegido se distingue por **peso y borde**, nunca solo por color.
- **Estar en un día pasado se dice una vez y en voz baja**: «Registro del martes», debajo del
  selector. Sin advertencia y sin recordarle a nadie que ese día pasó sin que escribiera.
- **Un día fuera de la ventana se lee entero.** Se pinta con la misma pantalla de consulta que un día
  ya cerrado —las preguntas delante, las respuestas debajo— y sin el enlace de «Cambiar algo»: sin
  nada que tocar, un control que no lleva a ningún sitio es peor que su ausencia. En el Historial se
  dice al pie, «Este día ya quedó como quedó», **solo en los que ya cerraron**: decirlo también en
  los abiertos sería una cuenta atrás en una pantalla que no tiene dónde escribir.
- **El selector no se pinta si solo hay un día abierto**, y la elección **no se persiste**: al volver
  a abrir la app se entra por hoy, como siempre (RN-NAV-05).

**Los bordes que se preguntaron, y qué se decidió:**

- **Rachas, métricas y constancia: no existen y no van a existir** (§14, no-negociable 2). Nada que
  recalcular. Lo único derivado del día —el punto de ánimo del calendario y el «ánimo bajo reciente»
  que retira las frases de esfuerzo— **se calcula al pintar**, así que un día completado de forma
  retroactiva ya se refleja solo. No hacía falta tocar nada para eso y no se tocó.
- **Track de hábitos: no existe en este producto** (§1.2, y `eslint.config.js` lo impide). La premisa
  del encargo venía de otra app.
- **Días a medias de días anteriores se siguen escribiendo** dentro de la ventana: el autoguardado es
  el mismo, la fecha es la única que cambia y `completedAt` sigue siendo lo único que cierra un
  recorrido (RN-DB-09).
- **El Journal se queda fuera a propósito.** Sus entradas nunca se cerraron a medianoche —se pueden
  editar siempre— y volverlas inmutables sería una restricción nueva que nadie pidió, en el único
  sitio del producto donde el sistema está mudo (RN-JR-01). **Está sin decidir y es del propietario
  del producto.**

**Sin cambios en el modelo de datos.** No hay campo nuevo, no se escribe nada distinto y no hace
falta migrar nada.

**Lo que sigue sin verse en un teléfono**, como el resto: si volver a un día anterior se siente
natural o se siente una pantalla de administración.

### El cromo va en contratono en todas las secciones, y el foco deja de dibujarse (9 sep 2026)

Lo pidió el propietario del producto. Son dos ajustes visuales, **sin cambios en el modelo de datos,
en el copy ni en la navegación**:

- **Las dos franjas de cromo dejan de ser crema fuera de Hoy.** En el Journal, en Respiración, en el
  Historial y en Tu perfil la cabecera y la barra de abajo salían en el rango claro
  (`--espacio-cabecera`) y ahora toman **el mismo contratono que ya llevaban en la Mañana**
  (`--strivo-conmutador`, `#1D1833`). El cromo es la única pieza que acompaña a las cinco pantallas,
  y cambiar de color al cambiar de destino es justo lo que no debería hacer.
  - **Es una sola regla con dos selectores**, no una copia por sección:
    `[data-moment]:not([data-momento]) .cromo-espacio` es la app fuera de Hoy —el atributo del reloj
    lo lleva la raíz siempre, el del conmutador solo mientras Hoy está montada— y
    `[data-momento='manana'] .cromo-espacio` es la Mañana, que ya lo llevaba. Ningún componente
    cambió: siguen pidiendo superficies por su papel y declarando su clase (RN-TEC-05, RN-VIS-02).
  - **El literal `#1D1833` subió a `:root`.** Lo declaraba `[data-momento='manana']` cuando era el
    único sitio que lo usaba; ahora que lo comparte con el cromo de las otras cuatro secciones, dos
    declaraciones del mismo tono se habrían separado el día que alguien retocara una. La Mañana lo
    hereda y la Noche de Hoy sigue siendo la única que lo invierte.
  - **La Noche de Hoy se queda fuera a propósito** y conserva su rango claro (`strivo-am-100`): es la
    decisión de SPEC_12 —el texto sale de los tokens AAA sobre claro— y no estaba en el encargo.
    **Está sin decidir y es del propietario del producto** si la noche debe seguirla.
  - **El logo va donde va el contratono.** El filtro monocromo dejó de ser de la Mañana: en su tono
    de firma sobre el bloque oscuro da 1,17:1, así que si el fondo llegaba al Journal y el filtro no,
    el logo desaparecía de cuatro pantallas.
  - **Y se encontró un defecto anterior a este cambio.** La sección activa se pinta con `bg-raised`,
    y `--color-raised` seguía siendo el velo de la superficie clara —blanco al 72 %— incluso sobre el
    contratono: daba un gris claro con la tinta clara encima, **1,6:1**, el rótulo de la sección en la
    que estás prácticamente sin leerse. Pasaba ya en la Mañana; `lint:contraste` no lo veía porque
    medía el rótulo inactivo, que va sobre el bloque desnudo. Ahora el velo se invierte con la tinta
    (10,7:1) y **los dos velos tienen nombre** —`--color-raised-on-light` y `--color-raised-on-dark`,
    junto a los de texto y borde—: escribir la `rgba()` a mano dentro del cromo habría sido la cuarta
    copia de la paleta en decimal, que es la que ningún barrido de hexes encuentra.
- **El recuadro azul celeste de Respiración era el anillo de foco del navegador.** El encabezado de
  la sección lleva `tabIndex={-1}` y recibe el foco al entrar, para que el lector de pantalla diga
  dónde estás antes de que nadie tabule a ningún control (RN-RE-NAV-41). Un elemento así, enfocado
  por script, se pinta con el anillo por defecto del sistema: de ahí el recuadro alrededor de la
  palabra «Respiración», y de ahí que apareciera **en ocasiones** —solo al montar la pantalla—. **El
  foco sigue yendo ahí y lo que se retira es su dibujo** (`.respiracion-encabezado:focus`): un
  encabezado no es alcanzable con el tabulador, así que no es de los elementos a los que WCAG 2.4.7
  exige indicador, y todos los controles conservan el suyo.

**Lo que sigue sin verse en un teléfono**, como el resto: si el cromo oscuro en cinco pantallas se
siente una sola app o se siente una app oscura.

### «Entrar a Strivo» deja de cortar al final (9 sep 2026)

Lo pidió el propietario del producto: la puerta de la cuarta tarjeta se sentía abrupta. **El
desvanecido de dos segundos ya estaba y funcionaba**; lo que fallaba eran sus dos extremos, y ninguno
era un problema de animación:

- **Al terminar, la app se desmontaba y volvía a montarse entera.** `App` tenía dos retornos —un
  fragmento mientras se presentaba, `<Secciones />` a secas después—, y React compara por posición y
  por tipo: al cerrar la presentación el elemento raíz cambiaba de tipo y se llevaba por delante la
  app que llevaba dos segundos montada debajo. Hoy volvía a `carga === 'cargando'`, que es el
  degradado y nada más, y el contenido reaparecía un instante después. **El parpadeo caía justo
  cuando el desvanecido acababa de terminar**, que es donde peor se ve. Ahora hay un solo retorno y
  `Secciones` no se mueve de su ranura: nada se remonta y no hay nada que volver a cargar.
- **La curva era la de las entradas y no la de los velos.** Llevaba `ease-smooth`
  —`cubic-bezier(0.25, 0.46, 0.45, 0.94)`, arranca rápido y se posa despacio—, buena para algo que
  entra y mala para algo que se cruza con lo que hay detrás: la opacidad caía casi entera en el
  primer tercio, la app quedaba descubierta enseguida y el segundo largo que faltaba ya no tenía nada
  que enseñar. Ahora lleva `ease-in-out`, que es la del umbral de entrada y la de su despedida: sale
  despacio, se disuelve por el medio y se posa.

**Lo que no se hizo, y por qué.** No se le puso una animación de opacidad a la pantalla que llega.
Las dos capas comparten el degradado del momento y la de abajo es opaca, así que «A se desvanece
sobre B» y «B aparece bajo A» son el mismo fotograma compuesto: no hay nada que ganar. Y sí habría
qué perder — detrás de todo está el `body`, que es crema fija (`#FBF8F4`), de modo que dos capas
translúcidas a la vez dejarían pasar un fogonazo claro a las once de la noche; y una opacidad animada
sobre `Secciones` crearía un contexto de apilamiento que sacaría a la barra de abajo del borde de la
ventana durante esos dos segundos, para devolverla de golpe al acabar. La forma correcta de que la
app «aparezca» aquí es que lo de encima se vaya, que es lo que hace.

**Sin cambios en el contenido, la estructura ni la funcionalidad.** «Omitir» sigue saliendo al
instante, la duración sigue siendo 2 s y con «reducir movimiento» entrar sigue siendo inmediato.

**Lo que sigue sin verse en un teléfono:** si dos segundos sin poder tocar nada, ahora que la
disolución los usa enteros, se sienten serenos o se sienten una espera.

### El reconocimiento llega a cinco y la noche admite tres emociones (10 sep 2026)

Lo pidió el propietario del producto. Son dos cambios en la noche y **el modelo de datos se amplía
sin tocar nada de lo ya escrito** (RN-DB-04):

- **El reconocimiento (1 de 3) admite hasta cinco renglones**, eran tres. Es un número en `filas.js`
  y nada más: sigue abriendo con **un** campo, los demás los pide quien escribe tocando «Añadir
  otro», cada uno se guarda aparte y ninguno es obligatorio. **El tope no se anuncia** —ni por
  adelantado ni al llegar—: contar lo que queda convertiría en un objetivo algo que no lo es, y una
  lista de cinco se ve entera. La pregunta sigue cambiando con la emoción de cierre exactamente
  igual: no se tocó ni una línea de esa lógica.
- **«¿Cómo me siento al cerrar el día?» pasa de una emoción a hasta tres.** `closingFeeling` sale de
  la lista de escritura y entra `closingFeelings`; las noches anteriores siguen trayendo su campo en
  singular y se releen igual. Al llegar a tres, **la cuarta no entra hasta soltar alguna** —mismo
  criterio que la mañana, y por el mismo motivo: quitarle a alguien algo que acaba de decir de sí
  mismo para hacer sitio es peor que no añadir lo cuarto—. Nada bloquea: ningún chip se apaga, se
  suelta tocándolo otra vez y la pregunta se puede dejar en blanco entera.

**Con esto se acaba la asimetría entre la mañana y la noche**, y lo que la sostenía era una sola
cosa: el punto de ánimo del calendario es de cinco estados y no sabía qué hacer con tres. Ahora sí:
**gana la más pesada** (`animoDeCierre`). No es una regla nueva —es la que ya aplicaba
`animoDerivado` a las noches de la versión 1, que también guardaban dos estados— y dice lo mismo que
`grupoDeCierre`: entre maquillar el día de alguien y no maquillarlo, la app no lo maquilla. **El
orden de peso dejó de estar escrito dos veces**: vive en `nocheEmociones.js` y `estadoSueno.js` lo
importa.

**Lo demás cae solo, y conviene saber por qué:**

- **La pregunta del reconocimiento ya sabía leer una lista.** `grupoDeCierre` se escribió en agosto
  admitiendo varias «por si acaso»; desde hoy es la regla que se aplica todas las noches, sin cambiar
  una línea. Una difícil entre tres manda: nunca una pregunta de gratitud sobre un día que alguien
  acaba de nombrar difícil.
- **La descarga también.** `ofreceDescarga` mira la lista y **con una de las cuatro basta**: que
  alguien esté además agradecido no desmiente que esté inquieto. Sigue siendo lista cerrada y
  explícita (RN-06), y la palabra propia sigue sin dispararla.
- **La consulta y el Historial las muestran todas**, en el orden en que se eligieron, con la misma
  forma de ficha que la mañana. La escala de cinco del calendario sigue siendo más gruesa que el
  catálogo de trece, y la respuesta exacta se lee donde está: en la vista del día.

**Sin migración.** No se reescribe ninguna noche y no se borra ningún campo: `closingFeeling` se
sigue leyendo y simplemente ya nadie lo escribe.

**Lo que sigue sin verse en un teléfono**, como el resto: si tres píldoras al cerrar el día y cinco
renglones para reconocerlo siguen cabiendo en un recorrido de uno o dos minutos.

### Las respuestas largas de las dos listas, y la despedida de la noche se va sola (12 sep 2026)

Lo pidió el propietario del producto. Son tres cosas y **el modelo de datos no cambia**: `gratitude`
y `recognized` siguen siendo listas de texto, se leen igual y ninguna entrada anterior se toca.

- **Cada respuesta de la gratitud (mañana, 2 de 3) y del reconocimiento (noche, 1 de 3) cabe en
  cuatrocientas palabras**, y no en una línea. Eran 120 y 160 caracteres en un `<input>`, y una
  respuesta que quería ser un párrafo se cortaba a la vista. El tope es **por respuesta y en
  palabras** —tres respuestas son tres veces cuatrocientas— y vive en `LIMITES.*.palabras`
  (`filas.js`), junto a cuántas respuestas caben; lo aplica `escribirEn`, no la pantalla. Contar
  y recortar palabras es de `src/diario/palabras.js`: una palabra es un trozo entre espacios con al
  menos una letra o cifra Unicode, así que «café,» cuenta una y una raya suelta no cuenta.
  - **Al tope, lo que no cabe se rechaza tal cual; lo que llega de golpe se recorta a
    cuatrocientas.** La primera versión recortaba siempre, y tecleando se vio que el recorte tiraba
    el espacio recién escrito y la letra siguiente se pegaba a la última palabra («palabra399» +
    « e» → «palabra399e»).
  - **No hay contador: hay un aviso desde las trescientas** (tercer ajuste del día). «127 / 400
    palabras» se retiró; hasta las 300 no se dice nada y desde ahí el pie dice cuántas quedan —«Te
    quedan 44 palabras», «Te queda 1 palabra», «Llegaste al límite de 400 palabras»—. Cuándo toca
    lo decide `palabrasRestantes` (`filas.js`, `PALABRAS_DE_AVISO = 100`); la pantalla solo elige
    la frase. **Comparte fila con «Quitar» y no tiene línea propia**: una línea que apareciera y
    se fuera movía la tarjeta entera entre apoyar y soltar el dedo sobre «Añadir otro», y el toque
    se perdía. Se vio pasar en un navegador real.
- **Cada respuesta es una tarjeta que crece con el texto** (`FilasDinamicas` → `CampoParrafo`, en
  `shared/Campo.jsx`): abre en **una línea** y toma la altura de lo escrito —medida con
  `scrollHeight`, que es lo único que ve las líneas que envuelve el ancho—. Una tarjeta vacía es su
  línea y nada más; a 390 px el placeholder de la mañana envuelve en dos y la tarjeta mide eso, no
  más. **Nunca se desplaza por dentro**: lo que se desplaza es la pantalla. `CampoTexto`
  (reflexión, descarga, journal) no se tocó.
  - **Sin número mientras se escribe** (ajuste del mismo día). La primera versión lo llevaba y se
    retiró: la numeración es de la lectura y un «1» sobre un campo en blanco convierte la pregunta
    en un formulario. El indicador del recorrido («2 de 3») no es esto y se queda.
  - **El pie —aviso y «Quitar»— existe solo con texto y va debajo del campo**, no encima: al
    escribir el primer carácter aparece bajo el cursor sin mover lo que se está tocando, y con
    texto está siempre, tenga o no el foco, para que desenfocar no mueva «Añadir otro». **Y no
    mide más que su texto**: la fila llevaba `min-h-touch-sm` y ponía casi dos líneas de aire bajo
    una respuesta de una línea; ahora los 44 px del objetivo táctil son del botón, que se los come
    con `-my-3`. Una tarjeta vacía mide 50 px, una de una línea 78.
- **Lo guardado vuelve numerado, entero y con sus párrafos** en las dos consultas y en la vista de
  día del Historial, con un solo `ListaNumerada`. Qué bloque es lista lo dicen los datos
  (`numerado` en `resumenDeManana` y `resumenDeNoche`), no la pantalla. La gratitud de las noches
  de la versión 1 se relee con la misma forma.
- **«Listo» responde en el acto y la despedida se va sola.** La demora tenía dos causas, y ninguna
  era la base de datos siendo lenta: `terminar` esperaba dos escrituras encadenadas —volcar lo
  pendiente y la marca de cierre, cada una con relectura— antes de cambiar de pantalla, sin señal y
  sin guarda contra un segundo toque, que encolaba las dos otra vez; y **«Buenas noches.» no volvía
  nunca por su cuenta**: era un botón sin aspecto de botón que se quedaba hasta que alguien lo
  tocaba. Ahora la ceremonia se pone delante en el mismo toque, una guarda (`cerrando`) deja pasar
  uno solo, la escritura corre detrás y la despedida se lee **cinco segundos**, se desvanece en
  **medio segundo** (`salida-cierre`, misma curva que la salida de la presentación) y vuelve a Hoy
  con la noche cerrada debajo. Tocarla sigue saltando la espera; con «reducir movimiento» no hay
  desvanecido. **«Buenas noches» solo se dice con la noche guardada**: si la escritura falla, la
  ceremonia dice qué pasó, que lo escrito sigue aquí, y ofrece reintentar. Las dos duraciones viven
  en `CierreDeLaNoche.jsx` y una prueba las compara con la hoja.

**Verificado en Chromium con Playwright a 390 px**, además de la suite: tres respuestas de
cuatrocientas palabras cada una, párrafos conservados al volver atrás y al releer, ceremonia
inmediata, «Buenas noches» a los 40 ms del toque, vuelta a Hoy a los ~5,5 s (5,0 s con movimiento
reducido), fallo de IndexedDB forzado → aviso y reintento → despedida, y la noche cerrada tras
recargar. **`vitest.config.js` transforma ahora el JSX con el runtime automático**, que es lo que
permite pintar un componente a HTML en una prueba sin `import React`.

**Lo que sigue sin verse en un teléfono:** si una tarjeta de varios párrafos con el teclado abierto
se sigue sintiendo un refugio y no un formulario, y si cinco segundos de despedida son un descanso
o una espera. ~~`DiarioManana.terminar` conserva la espera y sin guarda contra el doble toque~~:
saldado el 12 de octubre de 2026, con el buen deseo de la mañana (abajo).

### Toda respuesta abierta del día cabe en cuatrocientas palabras (20 oct 2026)

Lo pidió el propietario del producto. **El tope de la gratitud y del reconocimiento pasa a todas las
preguntas abiertas de la mañana y de la noche**, y cada campo tiene el suyo: tres respuestas de
gratitud son tres veces cuatrocientas, y el paso de la mañana, su pausa, la reflexión y la descarga
de la noche caben en cuatrocientas cada uno. Eran 240, 180, 400 y 400 **caracteres** en un
`maxLength`. **El modelo de datos no cambia**: siguen siendo cadenas y nada de lo escrito se toca.

- **Una sola regla, un solo número.** Los cuatro campos montan `CampoRespuesta`
  (`components/diario/`), que aplica `escribirConTope` —la misma regla que `escribirEn` usa en cada
  fila, ahora exportada— con `LIMITE_DE_RESPUESTA`, que sale de `MAX_PALABRAS_POR_RESPUESTA`. Los
  dos viven en `filas.js`. `MAX_ACCION`, `MAX_REFLEXION` (de las dos) y `MAX_DESCARGA` salen del
  código.
- **El mismo aviso que las filas**: nada hasta las trescientas, y desde ahí cuántas quedan. La frase
  la elige `avisoDePalabras`, que comparten `FilasDinamicas` y `CampoRespuesta`.
- **Los cuatro campos crecen con lo escrito y no se desplazan por dentro** (`CampoParrafo`), con las
  líneas de salida que ya tenían. `CampoTexto` contaba saltos de línea, así que cuatrocientas
  palabras sin ninguno se habrían leído en tres líneas con barra.
- **«Algo más» se queda fuera a propósito.** La palabra propia de los catálogos emocionales no es una
  pregunta abierta: es un nombre dentro de una píldora, y sigue en `MAX_PALABRA_PROPIA` (30
  caracteres). Lo mismo el Journal, que no es ni mañana ni noche.

**Lo que sigue sin verse en un teléfono:** si un paso de la mañana de varios párrafos sigue
cabiendo en un recorrido de uno o dos minutos.

### La vuelta a Hoy después de los dos cierres (20 oct 2026)

Lo pidió el propietario del producto: el paso del buen deseo o de «Buenas noches.» a Hoy se sentía
un corte, y Hoy aparecía a media página, donde la había dejado el recorrido. **Las dos cosas tenían
la misma causa**: la consulta solo se montaba cuando el cierre se desmontaba, así que el
desvanecido destapaba un hueco, la consulta entraba de golpe al final y el `scrollIntoView` del
cambio de vista la llevaba a la tarjeta y no al principio.

- **Hoy ya está debajo cuando el cierre empieza a irse.** El cierre avisa primero (`onVolver`) y
  después se desvanece; el contenedor monta la consulta y la pantalla vuelve arriba mientras el
  velo aún la tapa entera. `conCierre` es estado aparte de `vista`, y **el cierre y la consulta
  comparten árbol**: si el cierre fuera la raíz en una vista y un hijo en la otra, React lo
  remontaría a media salida.
- **Arriba del todo, antes de pintar** (`useLayoutEffect`, con `alInicio`). Lo hace
  `lib/volverAlInicio.js`, que pone a cero los antepasados desplazados y el documento: hoy Hoy se
  desplaza con el documento, y si mañana vive en un contenedor propio sigue funcionando.
- **700 ms, solo opacidad, la curva de los velos** (`.salida-cierre`, `SALIDA` en los dos
  componentes, y una prueba que compara los tres). **Hoy no lleva un fundido propio, a
  propósito**: bajo un velo opaco que se va, «esto se va» y «Hoy aparece» son el mismo fotograma, y
  dos capas translúcidas a la vez dejarían ver el papel del `body` entre las dos (la misma razón que
  en «Entrar a Strivo», 9 sep).
- **Un toque salta la espera, ya no el desvanecido.** Cortaba en seco, que era justo lo que se
  pedía quitar. Con «reducir movimiento» sigue sin haber desvanecido: se vuelve en el acto.

**Sin cambios en el copy, el modelo de datos ni el guardado.** Verificado en Chromium a 375 px: en
los dos rituales, la consulta montada y el scroll en 0 en el fotograma en que empieza el
desvanecido, y el velo retirado a los 702 ms. **Lo que sigue sin verse en un teléfono:** si 700 ms
se sienten un paso o se notan.

### Entrar a una cuenta desde la bienvenida (SPEC_30, 20 oct 2026)

Lo pidió el propietario del producto. La spec está en `docs/specs/SPEC_30_ENTRAR_DESDE_LA_BIENVENIDA.md`.
Quien cambiaba de teléfono contestaba seis pantallas y, al llegar a P7 y entrar, **la mudanza
descartaba en silencio todo lo que acababa de decir** (en `shared/*` gana la cuenta, DP-19.5).

- **«Ya tengo una cuenta» es un enlace en P1, no una pregunta** (D30-1), debajo de «Empezar» y solo
  con la sesión en `sinCuenta`. Quien llega por primera vez no gasta un toque más. Y es el momento
  técnico más limpio: en P1 el árbol es semilla y la cuenta gana sin un solo choque.
- **La vista de entrar no es un paso.** Es `entrada` en `useOnboarding` (`{ desde, aviso }`), no se
  guarda y no escribe nada; mientras está abierta no hay indicador ni franja de abajo. Desde P1
  **solo se entra** (`entrarConCorreo`), nunca se crea (D30-2).
- **Tras entrar se retoma en el paso de la cuenta, nunca en P1** (`pasoTrasEntrar`); con el
  onboarding terminado, a Hoy. Las frases y los avisos no se vuelven a preguntar (D30-3).
- **Si lo de la cuenta no termina de llegar, se vuelve a la vista** con «Intentar de nuevo»
  (`reintentarRestauracion`, en la sesión: solo restaura) y «Empezar mientras tanto». Antes, el
  recorrido se habría montado en P1 como si nada y la puerta lo habría sacado a Hoy a mitad de P3.
  El recorrido lo sabe al montarse preguntando `mudanzaPendiente`, no por un valor que devuelva la
  sesión: así no hay carrera entre el velo y la carga.
- **P7 tiene el mismo enlace** y avisa antes de entrar de que gana lo guardado en la cuenta; con la
  cuenta ya conectada, P7 se ve lista y no se salta (D30-5).
- **El formulario de Tu cuenta subió a `components/shared/FormularioEntrar.jsx`** (D30-8). Tu
  perfil se ve y se comporta igual; sus pruebas leen ahora el archivo compartido.

**Sin cambios en el modelo de datos ni en las reglas de fusión.** Verificado en Chromium a 375 px
sin enviar credenciales: el enlace, la vista desde P1 y desde P7, recuperar, «Volver» y Tu perfil.
**Lo que falta:** los criterios manuales M1–M7 de la spec contra `strivo-fe04f` —entrar de verdad,
con correo y con Google, y cortar la red en medio— y verlo en un teléfono.

### Lo que subió a la nube vuelve a bajar (SPEC_17A, 17 sep 2026)

Hasta aquí Firestore era de solo escritura: la cola subía y nada volvía. Quien reinstalaba la app
perdía su diario aunque estuviera íntegro en la nube. Esta entrega cierra las dos mitades —la cola
se vacía de verdad (`startSync` conectado) y lo que subió baja— y deja cinco reglas que conviene no
olvidar. La instrucción completa está en `docs/specs/SPEC_17A_INSTRUCCION_EJECUCION.md`.

- **Tres reglas de fusión, en este orden, y viven en `src/lib/db/conflictos.js`.** (1) Ruta que no
  existe en local, la escribe lo remoto. (2) Documento local con el campo de marca **ausente**
  frente a remoto con marca: gana el remoto. (3) En todo lo demás gana lo local: empate, ambas sin
  marca, remota menor o igual, marca local ilegible, o colección sin campo de marca. Se compara por
  instante (`Date.parse`), nunca por texto: hay dos formatos en circulación. **Ausente e ilegible
  no son lo mismo.** La regla 2 existe porque un documento sin campo de marca es un hueco que nadie
  escribió —una semilla, o algo anterior a esta SPEC—; una marca presente pero imparseable es lo
  contrario: alguien escribió ahí y solo no sabemos cuándo. Convertir «no puedo leerlo» en «no
  existe» sería corregir en silencio (RN-DB-02). `null` cuenta como ausente: es la convención de
  la casa para «todavía no».
- **Una siembra ni sella, ni sube, ni pisa, y las tres salen de lo mismo: una siembra no es una
  edición.** `initShared` escribe `name: null` y valores de fábrica que no dicen nada de nadie. No
  sella `updatedAt`, porque un instante que nadie vivió le ganaría al perfil real que espera en la
  nube. No encola, porque `sync.js` sube con `setDoc` sin `merge` y la semilla reemplazaría allí el
  perfil real justo cuando la restauración falló y no hay otra copia. Y escribe solo donde no hay
  nada (`writePathIfAbsent`, una transacción), porque la bajada puede seguir corriendo por detrás
  cuando la siembra llega. Lo mismo vale para la semilla de preferencias de Respiración. El resto
  de escrituras de `shared/` y `dayState` sí sellan, después de validar.
- **El velo de restauración tiene techo: 15 segundos** (`TECHO_DE_ESPERA_MS`, `src/lib/sesion.js`).
  `sin_red` no cubre la conexión colgada —`navigator.onLine` dice `true` y la lectura no vuelve—.
  Pasado el techo el velo baja y se entra; la restauración no se cancela, sigue por detrás y marca
  si termina. No es un umbral de fallo: una restauración lenta no pierde nada por cruzarlo. Nada
  bloquea a la persona.
- **El disparo era provisional y ya no existe** (DP-17.7, cerrada en SPEC_19.1). Durante 17A la
  única señal de que había cuenta era `esUidDeCuenta` —que el uid no empezara por `local-`—; desde
  el 1 de octubre de 2026 lo dice Firebase, con `resolverSesion` (ver «Sesión real», abajo). La
  restauración del arranque se sigue evaluando **solo al montar**; entrar en P7 a una cuenta que
  ya existía baja lo suyo por `entrarACuenta` desde SPEC_19.2. **Y quien entra en P7 a una cuenta
  que ya tiene datos no los ve en esa sesión, y hasta el 18 de septiembre de 2026 además los
  perdía en la nube** (DP-17.10). Aquí decía «nada se pierde», y era falso: `mudarUid` garantizaba
  no pisar nada, pero esa garantía solo existía en local —es el `store.get(destino)` de su bucle—
  y en un dispositivo que nunca vio esa cuenta no hay nada bajo su uid, así que la mudanza
  encolaba el árbol sembrado entero y `sync.js`, que sube con `setDoc` sin `merge`, reemplazaba en
  Firestore el perfil real con `name: null`. La restauración bajaba después, fielmente, lo que la
  subida acababa de borrar. Desde entonces **la mudanza no reencola lo que sigue siendo semilla**
  —lo decide `esSemilla`, en `conflictos.js`, la misma pregunta que hace la fusión—, y con eso el
  caso medido queda cerrado. **Lo que no cierra, y es más ancho de lo que la adenda escribió al
  principio:** terminar el recorrido escribe el perfil entero y el expediente con `completedAt`,
  los dos sellados y bajo el uid de la cuenta, así que quien entra por P7 a una cuenta con datos y
  llega hasta P8 **sigue pisando `shared/profile` y `shared/onboarding` en la nube** con lo que
  contestó —o con `name: null`, si lo saltó—. Eso era DP-19.5, y **se cerró en SPEC_19.2** (ver
  «Cuenta existente en P7», abajo): P7 entra por el mismo camino que Tu perfil y la regla de
  seguridad que prohibía usarlo con una cuenta con datos ya no rige.
  - **Y la puerta del onboarding se decidía sobre la semilla si la bajada llegaba tarde**
    (DP-17.11). Dos llamadas concurrentes a `prepararArbol` con el mismo uid —el doble montaje de
    `React.StrictMode`, siempre en desarrollo— se pisaban: la segunda veía el perfil ausente porque
    la primera seguía bajando, sembraba, y `Entrada` leía `completedAt: null` y mandaba al
    onboarding a quien ya lo había hecho; terminarlo volvía a pasar por P7, que es el bucle que se
    observó dos veces. Ahora la promesa en vuelo se guarda por uid y la segunda llamada la recibe
    tal cual; no es una caché, la entrada se retira al resolverse. **Se apoya en que la llamada en
    vuelo es siempre la que hace más** (`restaurarSiHaceFalta: true` primero), y está anotado en
    `sesion.js`. El caso del techo de 15 s —la bajada que cruza el techo y la puerta ya decidida—
    **se cerró en SPEC_19.1** con el sello de restauración: al terminar la bajada, la puerta se
    relee y saca del onboarding a quien ya lo había hecho.
- **La restauración es el único sitio del código autorizado a leer de Firestore.** `getDoc` y
  `getDocs` aparecen solo en `src/lib/db/restaurar.js`, su prueba y el doble de
  `entradaCuenta.test.js` —que monta el mismo Firestore de mentira para que `entrarACuenta`
  restaure de verdad—, y hay una prueba que recorre `src/` entero para comprobarlo. La lista de rutas va escrita literal allí —el SDK web no enumera
  subcolecciones— y `diario/pinConfig` no está en ella a propósito. La bajada escribe por
  `local.writePath` con `sync: false` y sin validadores: los días de agosto traen campos que el
  modelo ya no admite escribir, y rechazarlos sería perder justo lo que esto viene a devolver.
- **Probar la restauración a mano tiene cuatro trampas, y las cuatro se aprendieron por las
  malas** (adenda del 18 sep 2026, §5). La primera es que **escribir `strivo.uid.local` a mano no
  basta**: las reglas de Firestore son uid-scoped y exigen `auth.currentUser` para ese uid, así que
  sin una sesión real de Firebase Auth `restaurar()` falla por permisos en silencio —`motivo:
  interrumpida`—, se siembra un árbol vacío y se acaba en el onboarding, que es justo el camino
  que dispara DP-17.10. Durante 17A la sesión se conseguía con `crearConCorreo` desde la consola;
  desde 19.1 se entra desde Tu perfil, y con la sesión perdida el bloque dice `vencida` en vez de
  fallar en silencio. La segunda era que **`deleteDatabase` no borraba con una
  conexión abierta**: se quedaba en `blocked` sin lanzar error, y las peticiones colgadas detrás
  congelaban cualquier transacción posterior de la página. **Desde DP-17.12 la conexión se suelta
  sola** —`getLocalDB` declara `blocking` y `terminated`—, así que borrar la base con la app
  abierta resuelve por `success` y la siguiente lectura reabre una base vacía; `closeLocalDB()`
  sigue existiendo para las pruebas y el cierre de sesión, no como requisito previo. La
  tercera es que **tocar «Omitir» sella `updatedAt` igual que contestar**, y lo único que abre o
  cierra la puerta es `completedAt`, que solo escribe `terminar()` al final: salirse en P7 deja el
  expediente a medias, con `currentStep: "p7"`, y la puerta abierta. La cuarta es que
  **`localhost:5173` es un origen compartido** con bases de otros proyectos y claves viejas, así
  que «limpiar todo» ahí es ambiguo: se borra por nombre y se comprueba con `indexedDB.databases()`.
  El resultado se lee por dentro con `ultimoResultado(uid)` de `restaurar.js`, en vez de deducirlo
  de la pantalla.

### Sesión real (SPEC_19.1, 1 oct 2026)

Hasta aquí "hay cuenta" quería decir que el uid no empezaba por `local-`. Firebase guardaba su
sesión —en web, en IndexedDB, por defecto— y nadie la escuchaba: con la sesión perdida y un uid de
cuenta en `localStorage`, la cola y la restauración fallaban por permisos en silencio. No había
forma de entrar fuera de P7, ni de salir, ni de recuperar la contraseña. La instrucción completa
está en `docs/specs/INSTRUCCION_SPEC_19_1_SESION.md` (v1.1, con sus desvíos aprobados).

**La sesión la dice Firebase, con una tabla y en un solo sitio** (`resolverSesion`,
`src/lib/sesion.js`). Al arrancar se espera a la sesión guardada (`authStateReady`, lectura local
y sin red) y se cruza con `strivo.uid.local`:

| Firebase | `strivo.uid.local` | Estado | uid vigente |
|---|---|---|---|
| sin configurar | cualquiera | `sinConfigurar` | el guardado |
| usuario U | U | `conCuenta` | U |
| usuario U | `local-…` u otro uid | `conCuenta` tras entrar a la cuenta | U |
| sin usuario | `local-…` | `sinCuenta` | el guardado |
| sin usuario | uid de cuenta | `vencida` | el guardado |

- **El prefijo `local-` sigue mirándose, y no responde a "¿hay cuenta?"**: responde a "¿este uid
  lo inventó el teléfono?", que es lo que separa las dos últimas filas.
- **La cola y la restauración solo corren en `conCuenta`.** En `vencida` nada se borra y nada se
  bloquea: se lee y se escribe en local, lo escrito se encola y sube al volver a entrar.
  `onAuthStateChanged` sigue escuchando con la app abierta; un usuario que desaparece sin que
  nadie haya cerrado sesión deja el estado en `vencida`.
- **`ArranqueProvisional` sigue siendo el único escritor de `strivo.uid.local`** y ofrece la
  sesión por contexto (`useSesion`, `src/lib/useSesion.js`). No se fija persistencia en web.
- **El sello de restauración** (`selloRestauracion`) cambia cada vez que termina una `restaurar()`
  del uid vigente —también la que cruzó el techo y la del reintento al volver la red—; lo emite
  `alTerminarRestauracion` (`restaurar.js`). `Entrada` relee la puerta con él y **solo puede
  sacar del onboarding** (`aplicarLecturaDePuerta`, `presentacion/entrada.js`); el bloque de
  sincronización se recalcula. Cierra el techo de DP-17.11 y DP-17.14.

**Entrar a una cuenta que ya existía** (`entrarACuenta`, `src/lib/entradaCuenta.js`; DP-19.7). Se
usa desde Tu perfil, desde P7 (desde SPEC_19.2) y al arrancar en la fila 3.

1. **Restaurar primero**, con el techo de 15 s y la frase de restauración.
2. **Mudar después, fila a fila, y solo si la restauración terminó bien** (`mudarUid` con
   `{ politica }`; la regla es `ganaOrigenAlMudar`, en `conflictos.js`, hecha de `esSemilla` y
   `ganaRemoto`): en **`shared/*` gana la cuenta** salvo que lo suyo sea semilla; en **`diario/*` y
   `breathing/*` gana lo más nuevo**. Si gana el origen, reemplaza y se encola; si gana el destino,
   la fila del origen **se queda bajo su uid**.
3. Se anota el correo en `shared/auth`.

**Si la restauración no terminó bien —fallo o techo—, no se muda nada** (F1, revisión del 1 oct).
La primera versión mudaba todo menos `shared/*`, y eso perdía en la nube: contra un destino que
todavía no había bajado, la mañana, la noche o el `dayState` de un día que la cuenta también tenía
ganaban sin rival, se encolaban y `setDoc` sin `merge` pisaba en Firestore la versión de la cuenta
aunque fuera más nueva; con el techo, la bajada tardía ganaba en local pero la cola ya guardaba la
versión vieja. Ahora la mudanza **se aplaza**: se apunta `strivo.mudanzaPendiente.<uidCuenta>` =
uid de origen, la sesión sigue con la cuenta y lo anónimo se queda bajo su uid, intacto —tampoco
se escribe `shared/auth`—. Cuando una restauración de esa cuenta termina con `ok: true`
(`escucharMudanzasPendientes`, sobre `alTerminarRestauracion`), o al arrancar si la marca ya
existe, `completarMudanzaPendiente` muda con la política completa, anota el correo, retira la
clave y sube el sello para que la pantalla relea. Una clave cuyo origen ya no tiene filas se
retira sin hacer nada; una segunda restauración correcta no repite la mudanza. `borrarUid` retira
la clave al salir. El nombre de la clave vive en `local.js` (`claveDeMudanzaPendiente`); no es el
uid, así que no rompe la regla del único escritor de `strivo.uid.local`.

**Con la mudanza pendiente, la puerta se lee en el árbol de origen** (F2). La sesión ya está en
el uid de la cuenta, cuyo árbol es la semilla —`completedAt: null`—, y leer ahí mandaba al
onboarding a quien estaba en Tu perfil; terminarlo otra vez subía un perfil y un expediente
sellados encima de los de la cuenta (DP-19.5). De qué árbol se lee lo decide `arbolDeEntrada`
(`lib/entradaCuenta.js`, desde SPEC_19.2; antes vivía en `leerPuerta`): el de origen mientras
`mudanzaPendiente` devuelva uno con expediente, el de la cuenta en cuanto la mudanza se completa y
el sello la relee. `onboardingPendiente` y `presentacionPendiente` no cambiaron de contrato.

**Y si se aplazó por falta de red, se reintenta al volver** (F3). `reintentarEntradaAlVolverLaRed`
deja el mismo oyente de un solo intento que pone `prepararArbol`, solo con `pendiente` y motivo
`sin_red` —con el techo no hace falta: la bajada sigue y avisa sola—. Si ese intento termina bien,
el oyente de mudanzas completa lo pendiente. `ArranqueProvisional` lo pone en las dos entradas
(al arrancar y desde Perfil), uno a la vez, y lo retira al desmontar y al salir.

**Residuo aceptado:** cuando dos versiones del mismo día chocan, la más vieja deja de verse; si era
la anónima, sigue en IndexedDB bajo su uid. Es la regla que ya rige entre dos teléfonos.

**Una cuenta recién creada no pasa por ahí**: `crearConCorreo` y `entrarConProveedor` devuelven
`nueva` (este último con `getAdditionalUserInfo(...).isNewUser`), y con `nueva` se adopta el árbol
(`adoptarArbol`). Desde SPEC_19.2, P7 también lo usa. **`completedAt` y `tourCompletedAt` no se
deshacen** en la fusión de `shared/onboarding`: si cualquier lado los trae, el resultado los
conserva, y si hubo que añadirlos el documento se encola. Desde 19.2 vale también al mudar.

**Salir** (`src/lib/salidaCuenta.js`, DP-19.1). Se intenta subir lo pendiente y **con la cola no
vacía no se cierra sesión**: la confirmación explica que hay cosas sin subir y solo ofrece
«Quedarme». `salirDeCuenta` vuelve a mirar la cola antes de tocar nada. Con la cola vacía:
`signOut`, `borrarUid` (registros y cola del uid, `pinConfig` incluido, nunca otro uid),
`olvidarUid` (marca y último resultado), la mudanza pendiente hacia ese uid, uid local nuevo, siembra y vuelta a Hoy, donde aparece el
onboarding. Las filas conservadas bajo uids anónimos antiguos no se tocan.

**Tu perfil** gana el bloque **Tu cuenta**, entre horarios y sincronización: estado, entrar, crear,
recuperar la contraseña (misma respuesta exista o no la cuenta) y salir, como vistas dentro del
bloque y sin rutas nuevas. La confirmación es `components/shared/Confirmacion.jsx` (DP-19.2), que
SPEC_24 reutilizará. **Apple no se ofrece en web** (`PROVEEDORES_WEB`, DP-19.4), ni en Perfil ni
en P7. `cuenta.js` se mudó de `onboarding/` a `src/lib/` porque ya tiene tres consumidores.

**Lo que esto no hizo** (lo hizo 19.2, abajo): cambiar el flujo de P7 y tocar el PIN. Tampoco
migra `signInWithPopup` (SPEC_21) ni borra cuentas (SPEC_24). Los criterios manuales M1–M9 los
validó la fundadora contra `strivo-fe04f` (adenda del 1 oct 2026).

### Cuenta existente en P7 y PIN con correo (SPEC_19.2, oct 2026)

Cierra DP-19.5 y DP-19.6, y con ellas **la regla de seguridad de P7, que se retira**: entrar por
P7 a una cuenta con datos reales ya no pisa nada en la nube. La instrucción completa está en
`docs/specs/INSTRUCCION_SPEC_19_2_CUENTA_EXISTENTE.md`.

**Un solo camino a la cuenta.** P7 entra por `conectarCuenta`, que es el mismo `pasarACuenta` de
Tu perfil (`ArranqueProvisional`). Una cuenta **nueva** adopta el árbol, P7 dice «Tu cuenta está
lista.» y el recorrido sigue a P8. Una cuenta **que ya existía** pasa por `entrarACuenta`, con el
velo y la frase de restauración, y el velo desmonta el onboarding:

- si la cuenta ya lo había terminado, `Entrada` se monta de nuevo, lee la puerta entera y sale a
  Hoy; la presentación la decide `presentacionPendiente`, como en un arranque;
- si no, el recorrido sigue **en el paso siguiente a P7**, no en el `currentStep` de la cuenta. Lo
  lleva un traspaso **en memoria** (`onboarding/traspaso.js`), porque escribir el paso bajo la
  cuenta tocaría su expediente en la nube para algo que es solo navegación. Residuo aceptado:
  recargar en P8 retoma desde el `currentStep` guardado. Si la mudanza misma falla, el traspaso
  lleva el aviso al recorrido que se monta con el uid de origen.

`adoptarCuenta`, `onUid` y `cambiarUid` se retiraron: `ArranqueProvisional` ofrece a sus hijos solo
el uid, y nadie fuera de él pide cambiarlo. `onTerminado` ya no entrega un uid.

**Con la mudanza pendiente, la entrada lee y escribe bajo el origen.** Si la restauración de la
cuenta no termina, la sesión ya es la cuenta pero lo contestado sigue bajo el uid de origen. La
puerta, el recorrido entero —responder, motivo, avisos, paso y `terminar`— y la presentación leen
y escriben en el árbol que decide `arbolDeEntrada`. Cuando la mudanza se completa, en `shared/*`
gana la cuenta y lo del origen se conserva bajo su uid. Aplica igual al onboarding que monta la
fila 3 del arranque, y con eso se cierra el residuo de F2 de 19.1. Tres cosas lo sostienen:

- **`arbolDeEntrada` espera antes a la mudanza en curso de esa cuenta** (la promesa de
  `EN_CURSO`) y, como decidir lee la base, vuelve a decidir si una mudanza empezó mientras tanto.
  Sin eso, un `terminar` lanzado con la mudanza en vuelo dejaba `completedAt` en el origen y la
  puerta volvía a abrirse al siguiente arranque. Hay una prueba que retiene la mudanza a medio
  camino y que falla sin la espera.
- **Lo contestado no cambia de árbol** (`onboarding/escritura.js`): las respuestas leídas de un
  origen solo se escriben en ese origen. `completedAt` y el paso sí siguen al árbol.
- **Las respuestas se recargan solo si cambia el árbol**, no con cada sello de restauración
  (`releerSiCambioElArbol`). Lo que estuviera a medio teclear sobre el árbol que perdió no se
  guarda.

Lo que decide dónde se escribe está fuera del hook, en `escritura.js` y `traspaso.js`, porque las
pruebas corren sin navegador y es justo lo que hay que poder probar.

**`completedAt` no se deshace tampoco al mudar.** `hechosQueFaltan` salió de `restaurar.js` a
`conflictos.js` y la usan la bajada y `mudarUid` con política. Si gana la cuenta y el origen traía
`completedAt` o `tourCompletedAt`, la cuenta los conserva y el expediente se encola. Si gana el
origen sobre un expediente sin marca que traía un hecho, la fila mudada se lo lleva. La política
sigue siendo booleana, y sin política nada cambia.

**PIN con cuenta de correo** (DP-19.6). `reautenticar(uid, { contrasena })`:

- con proveedor `password` y sin contraseña devuelve `pide-contrasena`; con ella reautentica con
  `EmailAuthProvider.credential`;
- `wrong-password`, `invalid-credential` e `invalid-login-credentials` se cuentan como
  `credenciales`; la falta de red, como `sin-conexion`; lo demás, como `no-verificado`;
- Google y Apple, por ventana emergente como siempre.

En `BloqueoPin`, el campo de contraseña aparece solo tras `pide-contrasena`, con foco y el error
por `aria-describedby`, y el mismo botón vuelve a intentar. **La contraseña vive solo en el
estado del componente.** Firebase se sigue cargando dentro de la función: el PIN no depende de la
capa de autenticación. Sin conexión reutiliza `cuenta.error.sinConexion`.

**Lo que esto no hace:** Apple, redirect u OAuth nativo (SPEC_21), Face ID (SPEC_23), borrar
cuenta (SPEC_24), verificación o cambio de correo, ni la prueba intermitente de `journal.test.js`.
Los criterios manuales N1–N5 los valida la fundadora contra `strivo-fe04f`.

### Divergencias conocidas entre el blueprint y el código

Ninguna bloquea; **conviene no «corregir» una sin decidir cuál de las dos manda**:

- **`nightRitual` vs `nightEntry`.** El blueprint §12.2 llama `nightEntry` a la colección de la
  noche; el código la llama **`nightRitual`** y así está en `schema.js`, en `COLLECTIONS` y en los
  datos ya escritos. Renombrarla es una migración, no un renombrado de documentación.
- **`dayState` existe en la capa de datos y nadie la escribe.** `saveDayState` y sus rutas siguen ahí,
  pero el ánimo es una vista derivada (RN-DB-05) y ninguna pantalla lo persiste. Es código muerto a
  la espera de decisión.
- **Copy sin consumidores:** `shared.home` y `navegacion.volver` (murieron con el vestíbulo) e
  `insights`, `difficultDay`, `return`, `days` (restos anteriores). Retirarlos es limpieza, no
  riesgo. **Tres salieron de esta lista:** `notifications` lo consume la vista previa de P6, y
  `navegacion.barraLabel` volvió con la barra inferior, con otro valor —ya no dice "Strivo", nombra
  los dos destinos que lleva—. `profile` y `paywall` siguen huérfanos y **conviene no retirarlos**:
  son el texto que espera el bloque de plan y suscripción de Tu perfil. Cuando llegue, hay que
  decidir si se mudan a `copy.diario.perfil` o si se quedan donde están.
  **El bloque `onboarding` ya se retiró** (25 ago 2026): era el del commit raíz —`p1`, `p2`, `p3`,
  `p3b`, `p3c`, `p4`, `p5`, `p11`—, anterior incluso al onboarding de `feat/onboarding-p1-p3c`, y
  arrastraba copy de áreas que este producto ya no tiene.
- **`mananaEscrita` y `nocheEscrita`** (`src/diario/diario.js`) siguen exportadas y probadas sin un
  solo consumidor: eran para el estado «hecho» que RN-HOY-04 retiró.

### Deuda consciente (se salda en su fase)

- **D-23.1 · El control de volumen de la guía no hace nada** (encontrado en SPEC_23 Parte 2). La
  guía de Respiración va directa a la salida y no pasa por el mezclador, cuya entrada de guía no
  tiene nada conectado: mover el control no cambia lo que suena. **Para una tarea aparte, antes de
  los testers externos**; la Parte 2 lo dejó fuera porque no tocaba mezcla ni volúmenes.
- **O-23.1 · Al terminar una sesión con sonido, la música de otra app se pausa** en lugar de volver a
  su volumen (A5 de SPEC_23 Parte 2). Durante la sesión baja, como se aprobó (DP-23.2). No bloquea.
  **Para antes de los testers externos, junto a D-23.1.** Una pista, sin comprobar: WebKit desactiva
  la sesión de audio sin `NotifyOthersOnDeactivation`, así que la otra app no recibe aviso para
  seguir.

- **El IndexedDB viejo de la app nativa no se borra** (SPEC_17B, DP-17B.10). Después de migrar se
  queda ahí, intacto y sin usarse. Borrarlo es una decisión de la fundadora para una versión
  posterior a la 1.0, nunca de esta.
- **La sesión de Firebase Auth sigue en el IndexedDB del WebView** (SPEC_17B). Si iOS lo limpia, la
  sesión queda `vencida`: nada se pierde —lo escrito y la cola están en SQLite— y sube al volver a
  entrar. Moverla de ahí queda fuera de 17B.
- **En SQLite, una clave con `undefined` desaparece al escribir** (SPEC_17B): el contenido se
  guarda con `JSON.stringify`, igual que Firestore lo rechazaría al subir. La migración no lo
  corrige —se para—, pero las escrituras nuevas sí lo pierden en silencio. Ningún escritor de hoy
  guarda `undefined`; si apareciera uno, es un defecto de ese escritor.

- **Los 16 iconos emocionales no se hicieron, y es una decisión, no un olvido** (backlog B-1). Son
  **material de marca, no de código: se piden, no se improvisan.** La especificación está en el
  manual §6.2 y en el blueprint §15.3. Los catálogos usan hoy emojis del sistema.
- **La versión monocromática del logo está en uso y sin aprobar** (manual §3.3). Está derivada con un
  filtro CSS y **no** como archivo nuevo, para que aprobarla —o sustituirla por la del diseñador— sea
  borrar dos reglas. **Y desde el 9 de septiembre de 2026 son más sitios:** el cromo de las cinco
  pantallas —cabecera y barra de abajo, salvo en la Noche de Hoy— (1,17:1 sin filtro)
  y el logo quieto del umbral sobre el velo nocturno (2,09:1 sin filtro).
- **El video de apertura no está en el precaché del service worker**, así que un primer arranque sin
  red no lo reproduce: `onError` cierra el umbral y se entra a Hoy sin más, que es lo que RN-EST-05
  pide. **No es una regresión de este cambio**: el `.svg` del logo y las once fuentes de Inter
  tampoco lo están —workbox solo precachea `js`, `css` y `html`—, así que meter el `.mp4` es una
  decisión sobre los assets en general y no sobre este archivo.
- **Las frases están sin revisar editorialmente:** ~100 de apertura y las 1 000 del día v2 (SPEC_29). Pasan §3.3 con
  prueba automática; **qué se le dice a alguien al abrir la app es del propietario del producto**, no
  de quien programa. El objetivo del blueprint son 120+ frases del día (B-2).
- **Los catálogos emocionales nuevos y las ideas de acción están sin revisar editorialmente.** Las
  formas neutras se redactaron en implementación: «Pensando», «Con demasiado encima», «Con
  cansancio», «Con ligereza», «Con inquietud».
- **En la web, los avisos de P6 se piden, pero todavía no llegan.** En la app de iPhone ya llegan
  (SPEC_22, arriba). En la web el paso solicita el permiso del navegador y guarda la preferencia en
  `preferences.remindersEnabled`; **la entrega a las horas elegidas no está construida**. Una PWA
  estática no despierta sola: hace falta push —servidor que envíe y service worker que reciba—.
  Mientras tanto, en la web «Listo. Te avisaremos a esas horas» promete algo que aún no ocurre.
  **Queda ligada a DP-21.5**: si la PWA deja de ser pública, esta deuda desaparece con ella.
- **La autenticación de P7 no se ha probado contra un proyecto real.** El código está entero —Google,
  Apple, correo, y la mudanza del árbol—, pero `src/lib/firebase.js` solo se inicializa si hay
  credenciales y en el repo no hay `.env.local`. Sin ellas el paso se ofrece con lo que puede
  cumplir y se salta con «Ahora no». Apple pide además una cuenta de desarrollador y un Service ID.
- **`ArranqueProvisional` sigue siendo un andamio**, aunque ya no sea el único arranque: resuelve el
  uid y monta el árbol, y el onboarding entra justo después. Sin autenticación real de por medio, el
  uid sigue naciendo local.
- **Los recorridos de validación manual siguen sin hacerse**, sobre todo los de Respiración: **las
  pruebas no oyen**. Hace falta escuchar cada sonido con audífonos y con la bocina del teléfono, y
  recorrer quince minutos con los ojos cerrados. **Un bug pasado es la prueba de lo que cuesta no
  hacerlas:** una máscara SVG dejó una visual entera invisible durante cuatro días con toda la suite
  en verde, porque todas las pruebas de esa capa leen la fuente.
- **La mañana, la noche y la mudanza de Respiración no se han validado en teléfono real.** La
  pregunta que ninguna prueba contesta es **si cada recorrido cabe de verdad en uno o dos minutos**.
- **Dynamic Type no llega a la app de iPhone** (SPEC_21.1). WKWebView no escala `rem` con el tamaño
  de texto del sistema: la raíz se queda en 16 px. Seguirlo pide `font: -apple-system-body` en
  `html`, y eso mueve todas las medidas a la vez. Queda fuera de 21.1.
- ~~**En la app de iPhone, P6 no podía activar los avisos.**~~ **Saldada por SPEC_22** (11 nov
  2026). Aquí decía que P6 enseñaba «Este dispositivo no tiene avisos», y no era exacto: esa frase
  solo salía tras tocar «Activar recordatorios», y el botón no aparecía sin `Notification`. P6
  enseñaba la vista previa y «Ahora no», sin forma de activar nada. Ahora pide el permiso al
  teléfono.
- **Si alguien no abre la app en catorce días, los avisos dejan de llegar** (SPEC_22, DP-22.5).
  La ventana es de catorce días de avisos fechados y se rehace cada vez que la app se abre. Es una
  consecuencia aceptada: Strivo no insiste con quien se fue.
- **Cuatro citas del repertorio v1 llevan «¡…!»** (`frases-del-dia.js`: C-005, C-008, C-047 y
  C-072). Son textos ajenos citados tal cual y no son copy: la comprobación global de signos de
  exclamación de `lint:copy` recorre `src/copy/` y no los mira. **Qué hacer con ellas es de la
  fundadora.**
- ~~**El interruptor de silencio del iPhone calla los sonidos de Respiración**~~ — **saldada por
  SPEC_23 Parte 2**: con sonido, la sesión reclama «reproducción» y suena también en modo silencio.
- **El `_redirects` de Netlify no existe.** Mientras el router sea `HashRouter` no hace falta.
- **Con dos pestañas abiertas sobre el mismo día, la última escritura gana.** Sin bloqueo optimista.
  Es el comportamiento de todo el producto y está asumido.
- **El velo del umbral y el fondo del video de apertura ya no tienen el mismo tono** (anotado el
  13 oct 2026, sin decidir). La despedida del video se escribió el 26 de agosto contando con que el
  último fotograma se desvanecía sobre un velo «del mismo tono que el fondo del propio video», que
  entonces era el crema de la marca. **En `a1de26c` cambió el video y el velo se quedó donde
  estaba**: hoy el fondo del video es índigo (44,39,75) y el velo es `#191428` (25,20,40) de noche y
  papel `#FBF8F4` de día. De noche la diferencia es pequeña y en la grabación del iPhone 17 no se vio
  costura —el video entra gradual—. **De día no se ha mirado**, y por código es la grande: un
  rectángulo índigo con bandas de papel arriba y abajo. Si la intención era que coincidieran, es
  deuda de diseño y no de documento, y **la decide el propietario del producto**: acercar el velo al
  video, el video al velo, o aceptarlo. Los comentarios de `TransicionLuz.jsx` y `globals.css` que
  repiten «del mismo tono» siguen sin corregir, a la espera de esa decisión.

### Onboarding — cómo quedó (decidido y construido el 25 ago 2026)

**Ocho pasos, escritos desde cero contra v5.0.** No se porta nada de `feat/onboarding-p1-p3c`: es una
rama huérfana y arquitectónicamente incompatible —comparte con `strivo` solo el commit raíz— y su
diagnóstico completo está en `docs/archivo/SPEC_ONBOARDING_LIMPIEZA_FORMIA.md`. Ese archivo **no se
aplica**: opera sobre componentes que aquí no existen. Se conserva porque sus §3–§5 son la decisión
de producto y **su copy es la base de texto ya validada** para reescribir el de F-1.

Eran **nueve pantallas y ocho pasos**; hoy son ocho y siete. El género es un sub-paso (P2A) y no
entra en la cuenta del indicador, igual que la pausa opcional de la Mañana no entra en la suya
(RN-MAN-02).

| Paso | Pantalla | Nota |
|---|---|---|
| P1 | Bienvenida | Transición ~5 s + degradado horario. «Ya tengo una cuenta» abre la vista de entrar (SPEC_30) |
| P2 | Nombre | |
| P2A | Género | Para los pronombres del copy: masculino · femenino · prefiero no contestar · otro |
| P3 | Motivo | «¿Qué te gustaría encontrar aquí?»: paz, avance, escucha, sueño, espacio, otro |
| ~~P4~~ | ~~Identidad central~~ | **Retirado el 1 de septiembre de 2026**, con su pantalla, su copy, su módulo y su bloque del Perfil |
| P5 | Horarios | Despertar / dormir |
| P5R | Referencias de las frases | SPEC_29. Una opción de cuatro; se salta |
| P5RA | Afinidades | Sub-paso, solo con «Quiero elegir referencias». Varias; «Omitir por ahora» |
| P6 | Recordatorios | Dos avisos al día, opcional |
| P7 | Crear cuenta | Google · Apple · correo, con opción de saltar |
| P8 | Cierre | «Bienvenida, Alejandra» —el saludo en el género elegido— y el botón de entrar |

**Fuera de este flujo, explícitamente:** selección de áreas, identidad por área y hábitos sugeridos.
Esas pantallas eran de Formia (pausada) y **no vuelven salvo que Formia se reactive**. Por eso el
motivo (P3) no lleva la opción de construir hábitos: no aplica a Strivo solo.

**Regla de arquitectura a vigilar al escribir el spec.** En la implementación anterior (v3/v4) la
identidad central terminó acoplada a `areas` **fuera del propio onboarding**: no solo en la
superficie de Formia, también en `VistaManana.jsx`, `VistaNoche.jsx`, `animos.js` y `emociones.js`.
El spec de F-1 tiene que dejar explícito que **la identidad central no depende de `areas` en ningún
punto de la app** — ni en Diario, ni en Journal, ni en Historial.

**`feat/onboarding-p1-p3c` queda sin integrar y sin borrar**, salvo decisión explícita. F-1B no la
tocó: ni un archivo, ni un cherry-pick, ni una línea de copy.

**Lo que quedó abierto del recorrido**, y conviene decidirlo antes de darlo por cerrado:

- **La revisión editorial del copy no se ha hecho.** El texto de los siete pasos viene del spec y pasa
  §3.3 con prueba automática. La frase que estaba anotada aquí para mirar —«reconocer lo que **sí
  lograste**» (P1)— **ya no existe en el copy**, así que esa queda saldada.
  - **Y la frase de apoyo de P1 dejó de prometer tres minutos** (9 sep 2026). Decía «Tres minutos
    para respirar, reconocer cómo fue tu día y seguir adelante con más calma» y dice «**Un momento
    para conectar contigo**, reconocer cómo fue tu día y seguir adelante con más calma». Lo pidió el
    propietario del producto. Ponerle una duración a la primera frase que alguien lee convierte el
    refugio en un hueco de la agenda, y además era una cifra que el producto no cumple: la mañana, la
    noche y una respiración no duran lo mismo.
- **El recorrido no se ha probado en teléfono real**, como el resto del producto. La pregunta que
  ninguna prueba contesta es si las ocho pantallas se sienten breves o se sienten un trámite.

---

## 14. Los no-negociables

1. **Nada bloquea.** Toda pregunta se puede dejar en blanco, todo recorrido se puede cerrar vacío. No
   hay campos obligatorios, no hay validaciones en rojo, no hay pantalla que impida avanzar.
2. **Nada se mide.** Sin porcentajes, sin puntuaciones, sin recuentos de lo escrito, sin comparar un
   día con otro.
3. **Nada se juzga.** Las emociones difíciles comparten jerarquía visual con las agradables. Ninguna
   respuesta está mejor contestada que otra.
4. **Nada se pierde.** Se guarda solo, funciona sin red, sigue ahí al volver.
5. **La app no interpreta.** Ningún texto de la persona se analiza para decidir cómo tratarla. Toda
   ramificación emocional usa listas cerradas y explícitas.
6. **La calma es una funcionalidad.** El ritmo, el espacio en blanco y la lentitud no son adorno: son
   la función. Entre densidad y respiración visual, gana la respiración.
7. **Cerrar el día es una ceremonia.** La secuencia de cierre nunca falla, ni con la noche en blanco
   ni con la red caída.

**Si una feature los violaría, no entra.**

---

Este archivo es **vivo**. Cada decisión nueva se añade aquí, no en otro lado. Así Claude siempre
encuentra la fuente única de verdad.

**¿Dudas sobre algo de aquí? Pregunta antes de programar.**
