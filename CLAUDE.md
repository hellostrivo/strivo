# CLAUDE.md — Strivo

**Última actualización:** 25 ago 2026 · **Estado:** una sola aplicación, cuatro secciones
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

## 2. Navegación (cuatro secciones, y solo cuatro)

```
Strivo
├── Umbral de entrada  (luz + frase, una vez por sesión)
├── /hoy               pantalla raíz
│   ├── Mañana         → 3 momentos → cierre → consulta
│   └── Noche          → 3 momentos → cierre → consulta
├── /journal           escritura libre, protegible con PIN
├── /respiracion       configuración → sesión → cierre
└── /historial         calendario → día completo
```

Las cuatro secciones viven en **la cabecera**, bajo el símbolo. No hay barra inferior.

| Regla | Enunciado |
|---|---|
| **RN-NAV-01** | Cuatro secciones y solo cuatro. Una quinta exige revisar el capítulo 4, no basta con añadirla. |
| **RN-NAV-02** | Orden fijo: **Hoy · Journal · Respiración · Historial**. Las tres primeras son lo que se hace ahora; el Historial es lo que ya pasó. Poner Respiración al final la metería en el pasado. |
| **RN-NAV-03** | Profundidad máxima de tres toques desde cualquier punto. |
| **RN-NAV-04** | La navegación se oculta durante la escritura activa y las secuencias de cierre. Son estados de flujo, no de navegación. |
| **RN-NAV-05** | Volver a una sección devuelve donde estabas, no a su raíz. Se olvida entre sesiones a propósito. |
| **RN-NAV-06** | Ruta desconocida devuelve a `/hoy`, sin mensaje de error. |
| **RN-NAV-07** | PWA estática con `HashRouter`. **Si alguien lo cambia a `BrowserRouter`, hay que añadir el `_redirects` de Netlify antes** o las rutas profundas darán 404. |

**El umbral de entrada** (§4.3): velo de luz, **una vez por sesión** (`src/lib/umbralSesion.js`). No
es una secuencia: sin botón de avanzar, toda su superficie lo salta. Con `prefers-reduced-motion`
**no se muestra**. El contenido va montado detrás antes de que la luz se vaya — un velo sobre una
pantalla en blanco no es un umbral, es una espera con luz.

**Dentro del velo va una cosa u otra según dónde se monte, y siguen siendo la misma pieza**
(`TransicionLuz`, RN-LU-MAN-01):

| Dónde | Qué lleva dentro | Quién decide que se acabó |
|---|---|---|
| Al abrir la app (`App.jsx`, `conVideo`) | El video de apertura de la marca, 4 s, sin sonido y sin bucle | El propio video (`onEnded`); el temporizador de 5 s es la red de seguridad si el autoplay no arranca |
| Al aparecer la Mañana (`Hoy.jsx`, por defecto) | Una frase del repertorio de apertura | El temporizador de 5 s |

El `<video>` va con **`muted`, `playsInline` y `autoPlay`** —los tres, o iOS no reproduce— y `muted`
se repite sobre el nodo en un efecto, porque React no siempre lo escribe como atributo. **Nunca
`loop`.** Con movimiento reducido el componente pondría el logo quieto en su lugar, pero esa rama no
llega a montarse: `App` entra directo a Hoy (RN-VIS-05).

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
| `strivo-am-50` | `#F6F2E9` | | `strivo-pm-50` | `#F3EFEA` |
| `strivo-am-100` | `#DCCFF1` | | `strivo-pm-400` | `#8D82B6` |
| `strivo-am-200` | `#E5C2DC` | | `strivo-pm-500` | `#6C5AA7` (primario) |
| `strivo-am-300` | `#F6DDE8` | | `strivo-pm-700` | `#5A5568` |

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
| **RN-10** | Cuatro secciones máximo; tres toques de profundidad máxima. |

**Verifica estas antes de cada feature: si viola una regla, no entra.**

---

## 6. Estructura de datos

**Árbol canónico `users/{uid}/` — tres ramas:**

```javascript
shared/ {
  profile:     { name, gender, diaTerminaA, wakeTime, sleepTime, createdAt },
  auth:        { uid, email, phone },
  preferences: { soundEnabled, reducedMotion },
  onboarding:  { completedSteps, currentStep }
}

diario/ {
  // La mañana de tres momentos. `emotions` y `granVision` son de la versión
  // anterior: se leen, no se escriben.
  morningEntry/{fecha}: { version, updatedAt, completedAt, skipped,
                          feeling, feelingOther, intention, intentionOther,
                          gratitude[], action, reflectionId, reflection },

  // La noche de tres momentos. `gratitude`, `learning`, `sleepState` y
  // `sleepStateOther` son de la versión anterior: se leen, no se escriben.
  nightRitual/{fecha}:  { version, updatedAt, completedAt, skipped,
                          recognized[], reflectionId, reflectionSource, reflection,
                          closingFeeling, closingFeelingOther, release },

  journal/{entryId}:    { date, text, emotions[], otherText, createdAt, updatedAt },
  pinConfig:            { salt, hash, iterations, algorithm, enabled }
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
| **RN-DB-09** | La marca de cierre (`completedAt`) es lo único que determina si un recorrido está cerrado. No se infiere de cuántos campos hay escritos. |
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
1 de 3  ·  ¿Cómo me siento esta mañana?           (única, 11 + Algo más)
2 de 3  ·  ¿Qué agradezco hoy?                    (1 a 3, uno al abrir)
3 de 3  ·  ¿Cómo me gustaría sentirme…?           (única, 9 + Algo más)
           ¿Qué puedo hacer hoy…?                 (texto libre + ideas)
   +    ·  Si quieres, una última pausa           (opcional, algunos días)
   →       Tu intención · Tu paso · «Comenzar mi día»
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
- **La gratitud abre con un solo campo** (RN-MAN-07): varios campos vacíos se leen como huecos por
  rellenar, y esto no es un formulario.
- **Las ideas de apoyo abren una pregunta y nunca rellenan el campo** (RN-MAN-08), a los 5 s sin
  escribir **en el renglón enfocado**. Dos «Ahora no» y se callan por la sesión.
- **Tocar una idea de acción NO la guarda todavía:** es una propuesta de la app hasta que se
  continúa. **Es la única excepción al autoguardado** y está anotada en el código.

### Noche

```
1 de 3  ·  ¿Qué quiero reconocer de hoy?          (lista de 1 a 3, uno al abrir)
2 de 3  ·  Una reflexión breve                    (rotativa, o ligada a la mañana)
3 de 3  ·  ¿Cómo me siento al cerrar el día?      (única, 12 + Algo más)
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

- **Selección única en las tres preguntas emocionales.** Se suelta tocando el chip otra vez, y esa es
  la forma de omitir. Por eso son botones con `aria-pressed` y **no radios**: un radio no se
  deselecciona, y anunciarlo así sería mentir al lector de pantalla. **«Algo más» es la excepción**:
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

**Historial** (§7). **Muestra, no analiza** (RN-HIS-01): sin tendencias, sin medias, sin gráficas,
sin comparación entre semanas. Punto de ánimo de cinco estados —agotado, inquieto, normal, tranquilo,
en paz— **derivado al vuelo y nunca persistido** (RN-HIS-02). La escala de cinco es más gruesa que el
catálogo de doce **y se asume**: la respuesta exacta se lee en la vista del día. **La palabra propia
devuelve «Estuviste»** (RN-HIS-04): colocarla en una escala sería el diagnóstico que este producto
prohíbe. **Los campos de versiones anteriores se siguen leyendo** con sus rótulos propios
(RN-HIS-07): nada de lo ya escrito se sobrescribe ni desaparece.

**Respiración** (§8). **Es una herramienta, no una sección de contenido** (RN-RE-01): se abre, se
usa, se sale. No acumula historial visible, no puntúa, no lleva la cuenta de sesiones. Siete
patrones, dos visuales, tres modos de duración, seis sonidos **sintetizados en tiempo real** —cero
archivos de audio, cero dependencias nuevas—, hasta veinte combinaciones guardadas. **Silencio por
defecto en toda la app** (RN-RE-11). Todos los nodos de audio se liberan al salir.

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
├── content/         repertorios de frases (apertura y del día)
├── tokens/          design-tokens.json
├── styles/          globals.css + tokens-strivo.css
├── lib/
│   ├── db/          schema · shared · diario · local · sync
│   ├── respiracion/ motor de ritmo (lógica pura)
│   └── audio/       síntesis
├── diario/          lógica de mañana, noche, journal, historial, PIN
├── breathing/       la herramienta completa
├── components/
│   ├── shared/      Simbolo · TransicionLuz · Respiracion (la breve de Hoy)
│   ├── ui/          primitivas
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

Esa última regla es la que da forma a media base de código: `TransicionLuz` recibe su tema desde
`globals.css` y no por props de sección; `Respiracion` (la de la sección) recibe `base` y `salida`
desde `App.jsx`, que es quien enruta y el único que sabe dónde vive; `BarraStrivo` declaraba su clase
y dejaba que el CSS del sitio la vistiera. **El tema va en el CSS del sitio que lo conoce, nunca en
el componente.**

**Dónde vive cada regla — un sitio y solo uno.** Dos copias de la misma regla envejecen distinto:

- `src/diario/noche.js` → `animoDeNoche` es el **único** sitio que decide el ánimo de una noche.
- `src/lib/respiracion/` → el motor de ritmo. `ritmoRespiracion.js` es un envoltorio de compatibilidad.
- `src/lib/umbralSesion.js` → el «ya se cruzó» del umbral, compartido por sus dos consumidores.
- `src/diario/manana.js` → `resumenDeManana`: qué bloques hay, en qué orden y con qué título. El
  componente solo pinta.
- `src/components/diario/pildora.js` → la forma de la píldora, compartida por los chips y la consulta.

**Pila:** React + Vite (PWA) · IndexedDB local + Firestore para sync · Firebase Auth · Netlify con
publicación automática · Vitest.

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

**48 archivos de prueba · 1.393 casos · los seis comandos en verde.**

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

**Pendiente de esto:** el **ícono de app y el favicon piden el símbolo suelto**, sin wordmark —a
64 px la palabra no se lee— y ese recorte no existe como archivo. Anotado en el manual §3.5 y §9.

### Pendiente para cerrar F-0

- **Repuntar Netlify a `strivo`** y verificar la publicación en el dispositivo (paso 10, segunda
  mitad). Valorar después promover `strivo` a rama por defecto y retirar `main`, que está obsoleta.
- **131 menciones del alcance retirado siguen en comentarios de `src/`** (y en etiquetas de
  `describe`). No hay ni un identificador, ruta, token ni cadena visible: la comprobación final de
  §6 del plan pide que tampoco queden en prosa, así que es una pasada de comentarios pendiente.
- **`docs/copy-library.md` sigue fechado en v3 del blueprint** y no se reeditó: no estaba en el
  inventario de §4.4 del plan. Conviene decidir si se actualiza o se retira, porque hoy es una
  segunda fuente de copy junto a `src/copy/`.

### Divergencias conocidas entre el blueprint y el código

Ninguna bloquea; **conviene no «corregir» una sin decidir cuál de las dos manda**:

- **`nightRitual` vs `nightEntry`.** El blueprint §12.2 llama `nightEntry` a la colección de la
  noche; el código la llama **`nightRitual`** y así está en `schema.js`, en `COLLECTIONS` y en los
  datos ya escritos. Renombrarla es una migración, no un renombrado de documentación.
- **`dayState` existe en la capa de datos y nadie la escribe.** `saveDayState` y sus rutas siguen ahí,
  pero el ánimo es una vista derivada (RN-DB-05) y ninguna pantalla lo persiste. Es código muerto a
  la espera de decisión.
- **Copy sin consumidores:** `shared.home`, `navegacion.volver`, `navegacion.barraLabel` (murieron con
  el vestíbulo y la barra inferior) e `insights`, `profile`, `paywall`, `notifications`,
  `difficultDay`, `return`, `days` (restos anteriores). Retirarlos es limpieza, no riesgo.
- **`mananaEscrita` y `nocheEscrita`** (`src/diario/diario.js`) siguen exportadas y probadas sin un
  solo consumidor: eran para el estado «hecho» que RN-HOY-04 retiró.

### Deuda consciente (se salda en su fase)

- **Los 16 iconos emocionales no se hicieron, y es una decisión, no un olvido** (backlog B-1). Son
  **material de marca, no de código: se piden, no se improvisan.** La especificación está en el
  manual §6.2 y en el blueprint §15.3. Los catálogos usan hoy emojis del sistema.
- **La versión monocromática del logo está en uso y sin aprobar** (manual §3.3). Está derivada con un
  filtro CSS y **no** como archivo nuevo, para que aprobarla —o sustituirla por la del diseñador— sea
  borrar dos reglas. **Ahora son dos sitios y no uno:** la cabecera de la Mañana (1,17:1 sin filtro)
  y el logo quieto del umbral sobre el velo nocturno (2,09:1 sin filtro).
- **El video de apertura no está en el precaché del service worker**, así que un primer arranque sin
  red no lo reproduce: `onError` cierra el umbral y se entra a Hoy sin más, que es lo que RN-EST-05
  pide. **No es una regresión de este cambio**: el `.svg` del logo y las once fuentes de Inter
  tampoco lo están —workbox solo precachea `js`, `css` y `html`—, así que meter el `.mp4` es una
  decisión sobre los assets en general y no sobre este archivo.
- **Las frases están sin revisar editorialmente:** ~100 de apertura y ~60 del día. Pasan §3.3 con
  prueba automática; **qué se le dice a alguien al abrir la app es del propietario del producto**, no
  de quien programa. El objetivo del blueprint son 120+ frases del día (B-2).
- **Los catálogos emocionales nuevos y las ideas de acción están sin revisar editorialmente.** Las
  formas neutras se redactaron en implementación: «Pensando», «Con demasiado encima», «Con
  cansancio», «Con ligereza», «Con inquietud».
- **No hay onboarding ni autenticación real.** `ArranqueProvisional` crea la sesión local y el árbol
  de datos sin pedir nada. Es el primer bloque de F-1.
- **Los recorridos de validación manual siguen sin hacerse**, sobre todo los de Respiración: **las
  pruebas no oyen**. Hace falta escuchar cada sonido con audífonos y con la bocina del teléfono, y
  recorrer quince minutos con los ojos cerrados. **Un bug pasado es la prueba de lo que cuesta no
  hacerlas:** una máscara SVG dejó una visual entera invisible durante cuatro días con toda la suite
  en verde, porque todas las pruebas de esa capa leen la fuente.
- **La mañana, la noche y la mudanza de Respiración no se han validado en teléfono real.** La
  pregunta que ninguna prueba contesta es **si cada recorrido cabe de verdad en uno o dos minutos**.
- **El `_redirects` de Netlify no existe.** Mientras el router sea `HashRouter` no hace falta.
- **Con dos pestañas abiertas sobre el mismo día, la última escritura gana.** Sin bloqueo optimista.
  Es el comportamiento de todo el producto y está asumido.

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
