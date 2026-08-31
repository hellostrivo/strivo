# CLAUDE.md — Strivo

**Última actualización:** 25 ago 2026 · **Estado:** una sola aplicación, cuatro secciones y su onboarding
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
    └── /perfil        nombre · género · horarios · identidad central
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
velo —liso y del mismo tono que el fondo del propio video—, el velo se queda
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
| **RN-10** | Cinco destinos máximo —tres en la cabecera, dos en la barra de abajo—; tres toques de profundidad máxima. |

**Verifica estas antes de cada feature: si viola una regla, no entra.**

---

## 6. Estructura de datos

**Árbol canónico `users/{uid}/` — tres ramas:**

```javascript
shared/ {
  // `identidadCentral` es una frase y nada más: no se combina con nada, y esa
  // es la garantía de que el modelo de áreas no vuelve por la puerta de atrás.
  profile:     { name, gender, identidadCentral, diaTerminaA,
                 wakeTime, sleepTime, createdAt },
  auth:        { uid, email, phone },
  preferences: { soundEnabled, reducedMotion, remindersEnabled },
  // `completedAt` es la única marca de que el onboarding terminó; `motivos` y
  // `motivoOtro` son la respuesta de P3, que se da una vez y no vuelve a mutar.
  onboarding:  { version, completedSteps, currentStep, completedAt,
                 motivos[], motivoOtro }
}

diario/ {
  // La mañana de tres momentos. `emotions`, `granVision` y —desde el 30 ago
  // 2026— `feeling` e `intention` son de versiones anteriores: se leen, no se
  // escriben. Los dos últimos guardaban un id suelto donde ahora hay lista.
  morningEntry/{fecha}: { version, updatedAt, completedAt, skipped,
                          feelings[], feelingOther, intentions[], intentionOther,
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
| **RN-DB-09** | La marca de cierre (`completedAt`) es lo único que determina si un recorrido está cerrado. No se infiere de cuántos campos hay escritos. **Vale también para el onboarding:** saltarse los ocho pasos es haberlo hecho. |
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
1 de 3  ·  La pregunta del día, según el ánimo    (lista de 1 a 3, uno al abrir)
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

- **Hasta tres en la mañana, una en la noche**, y la asimetría es la decisión: de la emoción de
  cierre sale el punto de ánimo del calendario, que es de cinco estados y no sabría qué hacer con
  tres. Con una sola, tocar otra **cambia la respuesta** en vez de alcanzar un tope: exigir soltar
  antes de elegir sería pedir dos toques para corregirse. Se suelta tocando el chip otra vez, y esa
  es la forma de omitir. Por eso son botones con `aria-pressed` y **no radios**: un radio no se
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
├── onboarding/      cómo se entra: pasos · catálogos · cuenta · estado
├── perfil/          bloques de Tu perfil y su estado
├── breathing/       la herramienta completa
├── components/
│   ├── shared/      Simbolo · TransicionLuz · Campo · Chips · pildora · BarraInferior
│   ├── ui/          primitivas
│   ├── onboarding/  las nueve pantallas y su contenedor
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
| **RN-TEC-07** | **`perfil/` tampoco.** Es gestión de cuenta, no una sección del refugio: lo único que toca es `shared/profile`. Sí lee los catálogos del onboarding —género e identidad—, y eso es deliberado: son campos del perfil, no pasos de un recorrido, y dos copias del mismo catálogo se separan en cuanto alguien edite una. |

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
- `src/onboarding/pasos.js` → el orden del recorrido y qué cuenta en el indicador. Es el **único**
  sitio que sabe que el género no gasta número.
- `src/onboarding/genero.js` → las cuatro opciones, los tres valores del modelo y el camino de
  vuelta (`opcionDe`). Lo leen el onboarding y Tu perfil.
- `src/perfil/bloques.js` → qué bloques tiene Tu perfil y en qué orden. Añadir uno es un
  identificador aquí, un texto en el copy y un componente; hay una prueba que falla si falta alguno
  de los tres.

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

**58 archivos de prueba · 1.578 casos · los seis comandos en verde.**

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

### Fase F-1B — el onboarding, construido (25 ago 2026)

**Nueve pantallas, ocho pasos, una sola vez.** Escrito desde cero contra v5.0; de
`feat/onboarding-p1-p3c` no se portó ni una línea. El copy vive en `copy.diario.onboarding` y el
recorrido en `src/onboarding/` + `src/components/onboarding/`.

- **Se interpone, no se enruta.** `App.jsx` pregunta `shared.onboardingPendiente(uid)` —que mira
  `completedAt` y solo eso— y monta el onboarding o las cuatro secciones. Saltarse los ocho pasos
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
- **La identidad central (P4) no depende de áreas en ningún punto**, y hay tres pruebas que lo
  vigilan: ni un archivo del onboarding las nombra, ni una cadena de su copy las menciona, y el
  cierre no tiene una redacción con áreas que armar.
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
- **Tu perfil es una pila de bloques, y esa es su forma.** Hoy hay cuatro —nombre, género, horarios e
  identidad central— y la lista de cuáles existen vive en `src/perfil/bloques.js`. Añadir el plan de
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
  —que es el logo sobre el crema de la marca— se desvanece sobre el velo, hay un
  instante de pantalla lisa y el velo se retira dejando aparecer lo de detrás.
  Alarga la apertura ~1,4 s. Está descrito arriba, en §2.
- **El onboarding cabe en una pantalla.** El marco mide `100dvh` con `100vh` de
  respaldo (`.alto-pantalla`) y se reparte en tres franjas: indicador arriba,
  paso en medio, "Atrás" y "Continuar" abajo, dentro del área segura y siempre a
  la vista. Antes la columna crecía con el contenido y en un teléfono había que
  ir a buscar "Continuar" por debajo del borde. **Lo único que se desplaza es la
  franja de en medio**, y hoy solo lo necesita la identidad central (P4), que es
  el paso más largo. **La bienvenida y el cierre se centran verticalmente**: no
  piden nada, y una frase sola pegada al techo se lee como el encabezado de un
  formulario. Los pasos con preguntas no se centran — se moverían de sitio al
  aparecer o desaparecer un campo.
- **El bloque de horarios (P5) ya no se va de lado.** Un `input[type="time"]`
  trae un ancho propio del navegador, mayor que el hueco de un teléfono, y su
  `min-width: auto` de elemento flexible le impedía encoger: empujaba a su
  contenedor y con él el bloque entero hacia la derecha. Lo corrige `.campo-hora`
  —`appearance: none`, `min-width: 0` y el valor alineado a la izquierda, que en
  iOS se pinta al otro lado— más `min-w-0` en cada renglón.

**Lo que no se tocó, y conviene saber por qué:** el tono del velo de noche sigue
siendo el índigo del momento y no el crema del video, así que a esa hora el
fotograma se ve con bandas a los lados. Cambiarlo obligaría a que los dos
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
- **Los avisos de P6 se piden, pero todavía no llegan.** El paso solicita el permiso del navegador y
  guarda la preferencia en `preferences.remindersEnabled`; **la entrega a las horas elegidas no está
  construida**. Una PWA estática no despierta sola: hace falta push —servidor que envíe y service
  worker que reciba— y, en iOS, la app instalada en la pantalla de inicio. Decidido así al aprobar
  F-1B. Mientras tanto, «Listo. Te avisaremos a esas horas» promete algo que aún no ocurre, y esa es
  la razón de que esto esté anotado aquí y no dado por hecho.
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
- **El `_redirects` de Netlify no existe.** Mientras el router sea `HashRouter` no hace falta.
- **Con dos pestañas abiertas sobre el mismo día, la última escritura gana.** Sin bloqueo optimista.
  Es el comportamiento de todo el producto y está asumido.

### Onboarding — cómo quedó (decidido y construido el 25 ago 2026)

**Ocho pasos, escritos desde cero contra v5.0.** No se porta nada de `feat/onboarding-p1-p3c`: es una
rama huérfana y arquitectónicamente incompatible —comparte con `strivo` solo el commit raíz— y su
diagnóstico completo está en `docs/archivo/SPEC_ONBOARDING_LIMPIEZA_FORMIA.md`. Ese archivo **no se
aplica**: opera sobre componentes que aquí no existen. Se conserva porque sus §3–§5 son la decisión
de producto y **su copy es la base de texto ya validada** para reescribir el de F-1.

Son **nueve pantallas y ocho pasos**: el género es un sub-paso (P2A) y no entra en la cuenta del
indicador, igual que la pausa opcional de la Mañana no entra en la suya (RN-MAN-02).

| Paso | Pantalla | Nota |
|---|---|---|
| P1 | Bienvenida | Transición ~5 s + degradado horario |
| P2 | Nombre | |
| P2A | Género | Para los pronombres del copy: masculino · femenino · prefiero no contestar · otro |
| P3 | Motivo | «¿Qué te gustaría encontrar aquí?»: paz, avance, escucha, sueño, espacio, otro |
| P4 | Identidad central | «Soy alguien que…», con chips de sugerencia editables, sin marca de género salvo la primera |
| P5 | Horarios | Despertar / dormir |
| P6 | Recordatorios | Dos avisos al día, opcional |
| P7 | Crear cuenta | Google · Apple · correo, con opción de saltar |
| P8 | Cierre | Frase de identidad si existe, mensaje neutro si no |

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

- **La revisión editorial del copy no se ha hecho.** El texto de los ocho pasos viene del spec y pasa
  §3.3 con prueba automática. Hay una frase que conviene mirar: «reconocer lo que **sí lograste**»
  (P1). RN-NOC-03 eligió «reconocer» justamente para no exigir que algo haya salido bien, y §1.2 dice
  que esto no es productividad; «lograste» reintroduce el logro en la primera frase que alguien lee.
- **El recorrido no se ha probado en teléfono real**, como el resto del producto. La pregunta que
  ninguna prueba contesta es si las nueve pantallas se sienten breves o se sienten un trámite.

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
