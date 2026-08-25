# Blueprint de Producto — Strivo

**Versión 5.0 · 24 de agosto de 2026**

*Documento rector de Strivo. Sustituye íntegramente a la versión 4.1 (10 de agosto de 2026).*

| Campo | Valor |
|---|---|
| Documento | Blueprint de Producto |
| Versión | 5.0 |
| Sustituye a | v4.1 (10 ago 2026) y a todas las versiones anteriores |
| Producto | Strivo — aplicación única de bienestar emocional e introspección |
| Estado | Vigente. Fuente única de verdad para diseño, contenido, datos y desarrollo |
| Repositorio | `github.com/hellostrivo/strivo` |
| Documento hermano | Manual de marca de Strivo (identidad visual; aquí se referencia, no se duplica) |
| Documento operativo hermano | *Plan de separación técnica v1* (higiene del repositorio; no es contenido de producto) |

---

## Qué cambia en la versión 5.0

Esta versión responde a una decisión de alcance tomada el 24 de agosto de 2026: **se lanza una sola aplicación.**

1. **Strivo es una aplicación, y solo una.** No contiene otras aplicaciones, no es un ecosistema y no es un contenedor de nada: es una app de bienestar emocional e introspectivo. Toda la experiencia, el contenido, el diseño y la documentación del producto viven aquí.
2. **Desaparece toda navegación de nivel superior.** No hay vestíbulo, no hay conmutador entre destinos y no hay barra que devuelva a una pantalla por encima. La app abre en su pantalla raíz.
3. **La navegación queda en cuatro secciones:** Hoy · Journal · Respiración · Historial.
4. **El modelo de datos se reduce a dos ramas:** `shared/` y `diario/`, más la rama propia de Respiración.
5. **Se incorpora todo lo construido entre el 19 y el 24 de agosto:** la mañana y la noche en tres momentos, la pantalla de consulta, la emoción de cierre, la descarga opcional, el banco de reflexiones y Respiración como sección del producto.
6. **Se retira de la especificación todo lo que quedó fuera del alcance.** Lo que no está descrito en este documento no forma parte de Strivo, y el código correspondiente sale de la rama activa. Los detalles operativos de esa depuración están en el documento hermano de separación técnica.

### Decisiones que esta versión toma y conviene confirmar

Cinco decisiones eran consecuencia obligada del repliegue de alcance, y este documento las cierra para poder ser coherente. Se listan aquí, juntas y visibles, porque son las únicas que no vienen dictadas por una instrucción previa.

| # | Decisión | Razón |
|---|---|---|
| D-1 | Se retira la pantalla de vestíbulo. La app abre directamente en **Hoy**, precedida del umbral de luz y frase. | El vestíbulo existía para elegir entre dos destinos. Con uno solo sería un toque de peaje antes de llegar. |
| D-2 | Las cuatro secciones viven en la **cabecera** del producto, como hasta ahora. Se retira la barra inferior. | La barra inferior solo devolvía al vestíbulo. Mover las secciones abajo es una mejora legítima, pero es un cambio de diseño y no de alcance: queda como decisión abierta (§16.3, DA-1). |
| D-3 | El **símbolo de Strivo** es la marca única de la app. El símbolo del producto anterior se archiva. | Un solo producto, una sola firma. Conviene validarlo visualmente: los dos símbolos comparten lienzo y trazo, así que la sustitución es de un archivo. |
| D-4 | Las dos paletas del producto (Mañana y Noche) pasan a ser **las paletas de Strivo**, renombradas `strivo-am-*` y `strivo-pm-*`. La escala neutra de marca sobrevive como cromo. | El color del producto es el que la gente ya vio y validó. Lo que se retira son las paletas que vestían al espacio que se pausa. |
| D-5 | La rama de datos se renombra de forma interna a **`diario/`**. | No hay base instalada: la prueba con personas externas todavía no ocurre. El renombrado es barato hoy y caro después. |

---

## Índice

| Capítulo | Contenido |
|---|---|
| **0** | Preámbulo: naturaleza del documento, cómo leerlo, vocabulario |
| **1** | Visión, propósito y propuesta de valor |
| **2** | Persona usuaria y necesidades |
| **3** | Principios de experiencia y tono |
| **4** | Arquitectura de información y navegación |
| **5** | Hoy: la Mañana y la Noche |
| **6** | Journal |
| **7** | Historial |
| **8** | Respiración |
| **9** | Entrada, perfil y ajustes |
| **10** | Sistema visual, interacción y accesibilidad |
| **11** | Estados de interfaz |
| **12** | Modelo de datos y reglas funcionales |
| **13** | Analítica, métricas y calidad |
| **14** | Arquitectura técnica, pruebas y aceptación |
| **15** | Contenido |
| **16** | Roadmap y backlog |
| **Anexo A** | Revisión emocional por módulo |
| **Anexo B** | Trazabilidad desde la versión 4.1 |

---

# Capítulo 0 — Preámbulo

## 0.1 Naturaleza de este documento

Este es el Blueprint de Producto de Strivo: la especificación a partir de la cual se construyen, sin ambigüedad y sin necesidad de preguntas adicionales, la interfaz, el contenido, la arquitectura de datos y el producto en producción.

No es un documento de marketing, ni un pitch, ni un brief creativo. Es lo que un equipo de producto redacta antes de abrir una herramienta de diseño, cuando todavía es barato cambiar de opinión y cada decisión puede discutirse en términos de intención y no de píxeles.

Está escrito para ser leído por quien diseña, quien escribe, quien programa, quien prueba y quien decide. Cuando una sección solo importa a uno de esos perfiles, se dice.

## 0.2 Cómo leerlo

- **Las reglas de negocio llevan identificador** (`RN-XX-00`). Son verificables y contrastables una a una. Si una pantalla contradice una regla, la pantalla está mal.
- **Los criterios de aceptación son la definición de terminado.** Una funcionalidad sin sus criterios cumplidos no entra al producto.
- **El copy literal se escribe entre comillas.** Cuando aparece entre comillas es texto autorizado y va tal cual a la biblioteca central; cuando se describe en prosa, es intención y todavía hay que redactarlo.
- **Las decisiones abiertas están en §16.3**, todas juntas. Ninguna decisión abierta se esconde dentro de un capítulo.

## 0.3 Vocabulario

| Término | Significado en este documento |
|---|---|
| **Momento** | Cada uno de los tres pasos de un recorrido de mañana o de noche. |
| **Recorrido** | La secuencia guiada de momentos, con indicador y navegación adelante/atrás. |
| **Pantalla de consulta** | Lo que queda a la vista cuando un recorrido ya se cerró: las preguntas con sus respuestas debajo. |
| **Umbral** | La transición de luz y frase al entrar. No es un paso, no pide interacción y no tiene botón de avanzar. |
| **Cierre** | La pantalla ceremonial que termina un recorrido. Dura un toque. |
| **Descarga** | El espacio opcional para dejar algo pesado antes de cerrar la noche. |
| **Pausa** | La reflexión opcional de la mañana. |
| **Frase del día** | La frase que acompaña en la pantalla Hoy, de un repertorio propio. |
| **Frase de apertura** | La frase del umbral de entrada, de un repertorio distinto. |

## 0.4 Supuestos de contexto

- Equipo de una persona, aproximadamente diez horas por semana.
- Desarrollo asistido; especificaciones escritas antes de tocar código.
- Presupuesto bajo. Ninguna decisión de este documento exige contratar servicios de pago recurrentes más allá del hospedaje y la base de datos.
- Público hispanohablante, de cualquier género. El producto se dirige a la persona en segunda persona del singular, con tuteo.

---

# Capítulo 1 — Visión, propósito y propuesta de valor

## 1.1 Qué es Strivo

**Strivo es un refugio digital: un lugar íntimo y breve donde volver a ti al empezar y al terminar el día.**

La promesa es que quien lo usa termine el día sintiéndose en paz, agradecido, presente y con algo reconocido de sí mismo. No más productivo. No más optimizado. En paz.

La pregunta central del producto —la que ordena todas las demás— es **«¿Cómo estoy?»**.

## 1.2 Qué no es

Decir lo que no es tiene consecuencias de diseño, así que esta lista es normativa, no retórica.

- **No es una app de productividad.** No hay pendientes, no hay metas medibles y no hay nada que optimizar.
- **No es un rastreador.** No cuenta días seguidos, no puntúa, no premia ni penaliza. No existe la palabra «racha».
- **No es una app de meditación.** Respiración es una herramienta de calma, no un catálogo de sesiones guiadas con narración.
- **No es una agenda ni un cuaderno de notas.** Lo que se escribe aquí no se organiza para consultarse después con eficiencia; se escribe para vivirlo.
- **No es una red social.** No hay audiencia, no hay comparación y no hay nada compartible por defecto.
- **No es un sustituto terapéutico.** No diagnostica, no interpreta y no evalúa el estado emocional de nadie.
- **No es un coach.** No da órdenes, no corrige y no propone que la persona sea distinta de como es.

## 1.3 La propuesta de valor

> Dos o tres minutos, dos veces al día, en un lugar que no te pide nada.

El valor se sostiene en cuatro cosas, y las cuatro son verificables en la interfaz:

1. **Nada bloquea.** Toda pregunta se puede dejar en blanco. Todo recorrido se puede cerrar vacío. No hay campos obligatorios, no hay validaciones en rojo y no hay una sola pantalla que impida avanzar.
2. **Nada se mide.** No hay porcentajes, no hay puntuaciones, no hay recuentos de lo escrito y no hay comparaciones entre un día y otro.
3. **Nada se juzga.** Las emociones difíciles comparten jerarquía visual con las agradables. Ninguna respuesta está mejor contestada que otra.
4. **Nada se pierde.** Lo escrito se guarda solo, funciona sin red y sigue ahí al volver.

## 1.4 El nombre

Strivo es una palabra corta, cálida y fonéticamente suave. **La narrativa de marca no se apoya en el esfuerzo.** Aunque el nombre tenga raíz en una palabra de empuje, el producto se posiciona en el sentido contrario: no es lo que te exige, es donde descansas de la exigencia. Ninguna pieza de copy debe explicar el origen del nombre ni usarlo como llamada a la acción.

## 1.5 El diferenciador

Casi todas las apps de bienestar devuelven a la persona una versión medida de sí misma: días seguidos, minutos acumulados, gráficas de ánimo. Strivo devuelve **lo que la persona escribió, con la pregunta delante**. Sin resumen, sin etiqueta, sin interpretación. La app no sabe cómo estás; solo guarda lo que dijiste, y te lo devuelve tal como lo dijiste.

Esa es toda la ventaja competitiva, y es más difícil de copiar de lo que parece, porque exige renunciar a todos los mecanismos de retención que la categoría da por sentados.

---

# Capítulo 2 — Persona usuaria y necesidades

## 2.1 A quién sirve

**Persona principal.** Adulto entre 28 y 50 años, hispanohablante, con vida ocupada y cierta carga mental. No está en crisis: está cansado de correr y quiere un momento suyo. Ha probado apps de hábitos o de meditación y las ha abandonado, casi siempre por la misma razón —le hacían sentir que iba atrasado—. Escribe poco, pero le hace bien cuando escribe.

No es «alguien que quiere mejorar». Es alguien que quiere **parar un momento**.

**Persona secundaria.** Quien ya lleva un diario en papel o en notas del teléfono y quiere una estructura mínima que le ayude a empezar, sin perder la libertad de escribir lo que quiera.

## 2.2 Necesidades que Strivo resuelve

| Necesidad | Cómo la resuelve |
|---|---|
| «No sé por dónde empezar a escribir» | Preguntas fijas, breves y siempre iguales. Ideas de apoyo que abren, no que rellenan. |
| «Empiezo y lo dejo a los tres días» | Nada que romper. No hay días seguidos, así que no hay nada que perder por faltar. |
| «Las apps me hacen sentir mal cuando fallo» | No existe el estado «fallado». Lo no contestado no se muestra. |
| «Quiero un espacio privado de verdad» | El Journal se puede proteger con un PIN. Nada se comparte por defecto. |
| «Termino el día acelerado» | Un cierre de noche con ceremonia breve y una herramienta de respiración a un toque. |
| «Quiero volver a lo que escribí» | Historial por calendario, con el día completo tal como se escribió. |

## 2.3 Los dos momentos del día

Strivo no vive todo el día. Vive en dos ventanas:

- **La mañana**, para nombrar cómo se empieza y hacia dónde se quiere ir.
- **La noche**, para reconocer el día y cerrarlo.

El resto del tiempo, la app está disponible pero no reclama nada. **No hay notificaciones agresivas, no hay recordatorios que insistan y no hay pantalla que pregunte por qué no has entrado.**

## 2.4 Qué éxito significa para la persona

No es que abra la app todos los días. Es que **cuando la abre, se siente mejor al salir que al entrar**. La métrica de producto que mejor se aproxima a eso está en §13.2, y es deliberadamente conservadora.

---

# Capítulo 3 — Principios de experiencia y tono

## 3.1 Los siete principios

**P1 — La calma es una funcionalidad.** El ritmo, el espacio en blanco y la lentitud de las transiciones no son adorno: son la función. Cuando haya que elegir entre densidad de información y respiración visual, gana la respiración.

**P2 — La persona nunca falla.** No existe el estado de fracaso en ninguna pantalla. Ni en copy, ni en color, ni en icono, ni en la ausencia de algo.

**P3 — Menos, pero mejor.** Cada elemento de pantalla debe justificar su presencia. Ante la duda, se quita. Una pantalla con una sola cosa es una pantalla terminada, no una pantalla incompleta.

**P4 — El sistema es discreto.** La app no comenta lo que la persona escribe, no lo interpreta y no lo resume. Ofrece preguntas; no ofrece conclusiones.

**P5 — Nada bloquea.** Todo es saltable, todo es opcional, todo es editable después. No hay confirmación que impida salir ni paso que exija completarse.

**P6 — Privacidad por diseño.** Local primero. Lo escrito es de quien lo escribe. Ninguna analítica contiene contenido.

**P7 — Accesible para cualquiera.** Contraste alto, escalado tipográfico, movimiento reducible, todo alcanzable con lector de pantalla. La accesibilidad no es una capa posterior.

## 3.2 El tono de voz

Cálido, cercano, breve. Tuteo. Sin condescendencia y sin entusiasmo impostado.

Strivo habla como alguien que te conoce lo justo y te tiene aprecio: no te anima a gritos, no te da lecciones y no finge que todo está bien.

**Cómo suena bien:**
- «Puede ser algo pequeño.»
- «No necesitas resolverlo ahora.»
- «Este día no tiene nada escrito. También estuviste.»
- «Nada con esas palabras. Todo lo demás sigue aquí.»
- «Tu día puede comenzar desde donde estás.»

**Cómo suena mal:**
- «¡Felicidades! ¡Llevas 7 días seguidos!»
- «Te faltó completar tu ritual de hoy.»
- «Tu ánimo ha mejorado un 20 % esta semana.»
- «Recuerda que la constancia es la clave del éxito.»

## 3.3 Léxico prohibido

Estas palabras y construcciones **no aparecen nunca** en la interfaz, ni en copy visible ni en textos accesibles:

- Fracaso y sus derivados: «fallaste», «incumpliste», «abandonaste», «te faltó», «incompleto», «pendiente» (referido a la persona).
- Deber: «deberías», «tienes que», «necesitas hacer».
- Medición: «racha», «streak», «puntuación», «nivel», «progreso» (como número), «porcentaje».
- Productividad: «tarea», «pendiente», «objetivo», «meta», «optimizar», «rendimiento», «productividad».
- Diagnóstico: «ansiedad», «depresión», «trastorno», «síntoma», y cualquier término clínico aplicado a la persona.
- Signos de exclamación, salvo en la despedida de la noche si alguna vez se autoriza expresamente. Hoy no hay ninguno autorizado.

**RN-VOZ-01 —** Ningún string se escribe directamente en un componente. Todo el texto visible vive en la biblioteca central de copy y se referencia desde ahí. Un texto en el componente es un defecto, aunque sea correcto.

**RN-VOZ-02 —** Antes de integrar cualquier cambio se ejecuta la verificación automática de léxico. Un término prohibido detiene la integración.

**RN-VOZ-03 —** Las preguntas principales de la mañana y de la noche **no cambian de redacción**. La estabilidad es lo que las vuelve familiares. Lo único que se personaliza son las ideas de apoyo.

## 3.4 Género gramatical

El perfil guarda una preferencia de género con tres valores: masculino, femenino y neutro. Todo el catálogo emocional guarda cada etiqueta en las tres formas.

**RN-GEN-01 —** Se persiste siempre el identificador de la opción, nunca la etiqueta. La etiqueta se resuelve al pintar, de modo que cambiar el género del perfil reescribe también lo ya guardado.

**RN-GEN-02 —** El neutro se redacta sin marca de género («Con cansancio», «Con inquietud») o con la fórmula «mismo/a». **No se usa la terminación en -e.**

**RN-GEN-03 —** La palabra propia que escribe la persona no pasa por el resolutor de género. Se muestra tal cual, entre comillas.

**RN-GEN-04 —** El género es editable en cualquier momento desde el perfil.

---

# Capítulo 4 — Arquitectura de información y navegación

## 4.1 Mapa del producto

```
Strivo
├── Umbral de entrada  (luz + frase, una vez por sesión)
├── Hoy                (pantalla raíz)
│   ├── Mañana         → recorrido de 3 momentos → cierre → consulta
│   └── Noche          → recorrido de 3 momentos → cierre → consulta
├── Journal            (escritura libre, protegible con PIN)
│   └── Editor de entrada
├── Respiración        (configuración → sesión → cierre)
│   └── Guardadas
├── Historial          (calendario → día completo)
└── Perfil y ajustes   (nombre, género, horarios, sonido, PIN)
```

## 4.2 Reglas de navegación

**RN-NAV-01 — Cuatro secciones y solo cuatro.** Hoy, Journal, Respiración e Historial. Añadir una quinta exige revisar este capítulo, no basta con añadirla.

**RN-NAV-02 — Orden fijo: Hoy · Journal · Respiración · Historial.** Las tres primeras son lo que se hace ahora —el día, lo que se escribe, el aire—; el Historial es lo que ya pasó. Poner Respiración al final la metería en el pasado.

**RN-NAV-03 — Profundidad máxima de tres toques** desde cualquier punto a cualquier destino.

**RN-NAV-04 — La navegación se oculta durante la escritura activa y durante las secuencias de cierre.** Son estados de flujo, no de navegación.

**RN-NAV-05 — Volver a una sección devuelve donde se estaba,** no a su raíz. Esa memoria es de interfaz y se olvida entre sesiones a propósito.

**RN-NAV-06 — Ruta desconocida devuelve a Hoy**, sin mensaje de error.

**RN-NAV-07 — La app se sirve como PWA estática.** El enrutado usa fragmento (`#`) para que recargar en una ruta profunda no dependa de reglas de reescritura del hospedaje.

## 4.3 El umbral de entrada

Al abrir la app se cruza un umbral: un velo de luz tenue con una frase corta del repertorio de apertura, que se disipa dejando debajo la pantalla ya montada.

**RN-UMB-01 —** El umbral se cruza **una vez por sesión**, no en cada navegación.

**RN-UMB-02 —** No es una secuencia. No tiene botón de avanzar, no introduce pasos y no exige interacción. Toda su superficie lo salta.

**RN-UMB-03 —** Con la preferencia de movimiento reducido activada **no se muestra**: entrar es inmediato.

**RN-UMB-04 —** El contenido de destino debe estar montado detrás antes de que la luz se vaya. Un velo sobre una pantalla en blanco no es un umbral, es una espera con luz.

**RN-UMB-05 —** La frase de apertura sale del repertorio de apertura, distinto del repertorio de la frase del día. No se repite la misma frase dos veces seguidas.

## 4.4 La cabecera

La cabecera muestra el símbolo de Strivo y, debajo, las cuatro secciones como píldoras. La sección activa se distingue **por peso tipográfico y borde, no solo por color** (criterio de accesibilidad).

La cabecera se viste con el tema de la sección Mañana o Noche cuando se está en Hoy, y con el tema neutro en el resto de secciones.

## 4.5 Ritmo de aparición

| Elemento | Duración |
|---|---|
| Cambio de color al conmutar Mañana/Noche | 320 ms, cruzado |
| Aparición de un momento del recorrido | 260 ms |
| Umbral de entrada | ~2 s de permanencia, 600 ms de salida |
| Ceremonia de cierre | hasta 900 ms |
| Mínimo de cualquier transición | 120 ms |

Con movimiento reducido, todas las anteriores son inmediatas.

---

# Capítulo 5 — Hoy

## 5.1 Propósito

Hoy es la pantalla raíz. Orienta en menos de dos segundos: qué momento es, qué hay y cómo estoy. **Nunca es un panel de control:** no hay gráficas, ni contadores, ni insignias, ni una segunda acción principal compitiendo con la primera.

## 5.2 Anatomía

De arriba abajo:

1. **Saludo y fecha.** «Buenos días», «Buenas tardes» o «Buenas noches» según la hora local, con el nombre si el perfil lo tiene: «Buenos días, Ana».
2. **Conmutador Mañana / Noche.** Dos botones, inmediatamente debajo de la fecha. Ambas secciones están siempre accesibles, a cualquier hora.
3. **Tarjeta de respiración.** Una invitación breve: «Respira un momento». Sin duración en la tarjeta.
4. **Frase del día.** Una frase del repertorio, estable durante toda la jornada.
5. **El recorrido o la consulta**, embebido aquí mismo.

**RN-HOY-01 — El conmutador es el único origen del tema de la pantalla.** La hora del sistema decide únicamente con cuál se abre; a partir de ahí manda quien mira.

**RN-HOY-02 — Ambas secciones son accesibles siempre.** No se bloquea la noche por la mañana ni al revés.

**RN-HOY-03 — El recorrido se muestra aquí, sin paso intermedio.** No hay tarjeta que anuncie el día ni botón que lleve a otra pantalla a escribirlo. Lo único que ocupa la pantalla entera es el cierre.

**RN-HOY-04 — No hay etiqueta de «hecho».** Cuando algo está escrito, está a la vista; decir que está hecho sería contarle a alguien lo que está leyendo.

**RN-HOY-05 — La frase del día no cambia dentro del mismo día.** Se elige una vez y se guarda con la fecha.

**RN-HOY-06 — El fondo es siempre un degradado, nunca un color plano.** Mañana en claridad suave; Noche en profundidad azulada.

## 5.3 El conmutador

Dos botones, no una pestaña deslizante. Al pulsar «Mañana» la pantalla cruza a los tonos claros con texto oscuro; al pulsar «Noche», a los tonos profundos con texto claro. El cruce dura 320 ms y afecta al fondo, a la cabecera y a las tarjetas a la vez, no por partes.

**RN-HOY-07 —** La tarjeta del recorrido debe quedar en un tono **distinto del fondo** en ambos temas, para que se distinga sin depender del color.

---

## 5.4 La Mañana

### 5.4.1 Estructura

El recorrido pregunta, por este orden:

| Momento | Pregunta | Forma |
|---|---|---|
| **1** | «¿Cómo me siento esta mañana?» | Selección única entre once opciones + palabra propia |
| **2** | «¿Qué agradezco hoy?» | Campos de texto que crecen |
| **3a** | «¿Cómo me gustaría sentirme durante el día de hoy?» | Selección única entre nueve opciones + palabra propia |
| **3b** | «¿Qué puedo hacer hoy para acercarme a esa sensación?» | Texto libre, con ideas de apoyo |
| *(opcional)* | Una pausa, algunos días | Texto libre, pregunta rotatoria |
| **Cierre** | La intención y el paso, y «Comenzar mi día» | Ceremonia |
| **Consulta** | Lo respondido, con las preguntas delante | Lectura |

**RN-MAN-01 — La intención va con la acción, no con el punto de partida.** «¿Qué puedo hacer hoy para acercarme a *esa sensación*?» es un pronombre sin antecedente si la sensación se eligió dos pantallas atrás. Además, juntas, las ideas de apoyo cambian en el momento en que se toca un chip de arriba.

**RN-MAN-02 — El indicador cuenta momentos, no campos.** «1 de 3» dice dónde estás, no cuánto te falta por rellenar. La pausa opcional no entra en la cuenta: no está siempre, y un total que cambia de un día para otro deja de orientar.

**RN-MAN-03 — Nada bloquea.** Se puede avanzar con todo en blanco, volver atrás, cambiar cualquier respuesta y cerrar sin haber escrito una palabra.

### 5.4.2 Momento 1 — cómo me siento

Once opciones en píldora con emoji, más «＋ Algo más» para una palabra propia de hasta 30 caracteres.

En calma · Con energía · Alegre · Con motivación · Neutral · Pensando · Con cansancio · Con poca energía · Con inquietud · Con demasiado encima · Triste

**RN-MAN-04 — Aquí caben las emociones difíciles, sin una sola marca de advertencia.** La pregunta es qué hay. Cansancio, inquietud y tristeza comparten forma, tamaño, color y posición con las demás; no van al final de la lista.

**RN-MAN-05 —** Selección **única**. Nombrar un estado no es hacer inventario.

**RN-MAN-06 —** La palabra propia no recibe emoji automático, es editable y se muestra entre comillas al releerse.

### 5.4.3 Momento 2 — gratitud

Título: «¿Qué agradezco hoy?». Apoyo: «Puede ser algo pequeño.» Marcador de posición: «Una persona, un momento o algo cotidiano…»

**RN-MAN-07 — Abre con un solo campo.** Varios campos vacíos a la vez se leen como huecos por rellenar, y esto no es un formulario. «Añadir otro» crea el siguiente.

**RN-MAN-08 — Las ideas de apoyo aparecen tras cinco segundos sin escribir** en el renglón enfocado, y **nunca rellenan el campo**: abren una pregunta detonante y ahí acaban. Ninguna da por hecho que la mañana esté siendo agradable.

| Idea | Pregunta que abre |
|---|---|
| tu familia | «¿Quién de tu familia te hizo bien esta semana?» |
| tu cuerpo | «¿Qué te permite hacer tu cuerpo esta mañana?» |
| este momento | «¿Qué tiene de bueno este momento?» |
| el silencio | «¿Dónde encuentras silencio en tu día?» |
| lo que tienes | «¿Qué tienes hoy que hace un año esperabas?» |

**RN-MAN-09 —** Tope de diez líneas. Al alcanzarlo, el mensaje celebra en voz baja y deja de crecer: «Diez cosas. Nada mal.» No reprende y no bloquea nada más.

**RN-MAN-10 —** Quitar una línea solo pide confirmación si hay texto que perder.

**RN-MAN-11 —** Existe una salida discreta: «Omitir por hoy». No deja rastro ni reproche.

### 5.4.4 Momento 3 — intención y acción

Dos preguntas en la misma pantalla.

**Intención.** Nueve opciones: En calma · Con energía · Con foco · Con motivación · Con confianza · Con ligereza · Presente · Con paciencia · Alegre. Más palabra propia.

**RN-MAN-12 — El catálogo de intención excluye las emociones difíciles**, y es deliberado: una intención de estar triste no es una intención. Es el único sitio del producto donde el catálogo se restringe, y se restringe por la naturaleza de la pregunta, no por comodidad.

**RN-MAN-13 — La diferencia entre el punto de partida y la intención no se mide.** No hay puntuación, ni brecha, ni color de alerta, ni mensaje que sugiera que hay que mejorar el estado de partida. Empezar cansado y querer estar en calma no es un problema a resolver: es exactamente lo que la pregunta esperaba.

**Acción.** «¿Qué puedo hacer hoy para acercarme a esa sensación?», con apoyo «Piensa en algo sencillo y posible.» y marcador «Hoy puedo…».

**RN-MAN-14 —** Debajo, tres ideas bajo el rótulo «Por si te sirve», elegidas según la intención seleccionada. Tocar una la deja en el campo, entera y editable.

**RN-MAN-15 —** Si la intención se escribió a mano o no se eligió ninguna, se ofrecen ideas generales. **No se interpreta lo que alguien escribió.**

**RN-MAN-16 —** Existe además «Ideas que elegiste antes»: solo lo que la propia persona escribió previamente para esa misma intención. **Nunca se afirma que le funcionara** —eso no se sabe—.

### 5.4.5 La pausa opcional

Algunos días, después del tercer momento, aparece «Si quieres, una última pausa», marcada como opcional, con salida «Ahora no».

Tres preguntas que rotan:
- «¿Qué necesito recordarme hoy?» — «Escribe una frase que quieras llevar contigo.»
- «¿Cómo quiero tratarme hoy?» — «Piensa en el tono con el que quieres acompañarte.»
- «¿Qué puedo hacer más sencillo hoy?» — «No todo necesita la misma energía.»

**RN-MAN-17 — No es una afirmación positiva y no se llama así.** Cabe el ánimo, el permiso, la perspectiva o el trato amable, sin obligación de sonar optimista.

**RN-MAN-18 —** Se guarda el identificador de la pregunta que salió ese día, para poder releerla después con su enunciado correcto.

### 5.4.6 El cierre de la mañana

Pantalla completa. Muestra hasta dos líneas:
- «Tu intención para hoy: {intención}»
- «Un paso que puedes dar: {acción}»

Y la llamada a la acción: **«Comenzar mi día»**.

**RN-MAN-19 — Con la mañana entera en blanco cierra igual**, y lo dice sin señalar el vacío: «Tu día puede comenzar desde donde estás.»

**RN-MAN-20 —** Sin puntuación, sin porcentaje y sin felicitación.

### 5.4.7 La pantalla de consulta

Una vez cerrada, la mañana queda a la vista con las **preguntas delante** y las respuestas debajo, con el mismo aspecto que tenían en el recorrido.

**RN-MAN-21 — No hay etiquetas resumidas.** «Cómo empezaste · Cansada» sería un inventario con otro vocabulario. Con la pregunta delante, releerlo es volver a lo que se preguntó.

**RN-MAN-22 — Las respuestas emocionales vuelven en forma de píldora, con su emoji.** Se eligieron tocando una píldora y se releen en una píldora. Cuando la respuesta se escribió a mano el emoji es nulo y la píldora se pinta igual, con la palabra entre comillas.

**RN-MAN-23 — Lo que quedó en blanco no aparece.** Sin marcador de ausencia, sin hueco gris y sin «sin responder»: una mañana a medias se lee entera, no incompleta.

**RN-MAN-24 —** Un enlace discreto, «Cambiar algo», devuelve al recorrido.

---

## 5.5 La Noche

### 5.5.1 Estructura

Apertura: «Vamos a cerrar el {día de la semana}.»

| Momento | Pregunta | Forma |
|---|---|---|
| **1** | «¿Qué quiero reconocer de hoy?» | Lista de 1 a 3 líneas, una al abrir |
| **2** | Una reflexión breve, distinta cada noche | Texto libre |
| **3** | «¿Cómo me siento al cerrar el día?» | Selección única entre doce opciones + palabra propia |
| *(opcional)* | «¿Hay algo que quieras dejar aquí por hoy?» | Texto libre |
| **Cierre** | «Tu día puede terminar aquí.» y «Cerrar mi día» | Ceremonia |
| **Consulta** | Lo respondido, con las preguntas delante | Lectura |

**RN-NOC-01 — La noche no evalúa el día.** No pide que nada haya salido bien, no exige una lección, no compara la mañana con la noche y **no cuenta nada de lo escrito**. Una frase del tipo «Hoy encontraste 2 cosas que agradecer» es un balance, y los balances están prohibidos.

**RN-NOC-02 — El indicador cuenta momentos, no campos.** La descarga opcional no entra en la cuenta.

### 5.5.2 Momento 1 — reconocimiento

Título: «¿Qué quiero reconocer de hoy?». Apoyo: «Puede ser algo que disfrutaste, intentaste, enfrentaste o resolviste.» Marcador: «Algo que hice, sentí o atravesé…»

**RN-NOC-03 — «Reconocer» y no «agradecer», y la diferencia es el punto.** Reconocer admite lo que costó y lo que se atravesó; agradecer obliga a que algo haya salido bien. Es la pregunta que permite que una noche difícil tenga respuesta.

**RN-NOC-04 —** Abre con una sola línea. «Añadir otro» crea la siguiente, hasta tres. Salida: «Omitir por hoy».

### 5.5.3 Momento 2 — reflexión

Una pregunta distinta cada noche, marcada como opcional, con salida «Ahora no» y marcador «Lo que se te ocurra».

Banco general:
- «¿Qué me dejó el día de hoy?» — «Una emoción, un aprendizaje o algo que quieras recordar.»
- «¿Qué aprendí hoy sobre mí?» — «No necesita ser una gran conclusión.»
- «¿Qué quiero recordar de este día?» — «Puede ser un instante muy pequeño.»
- «¿Qué ocupó más espacio en mí hoy?» — «Una emoción, una preocupación, una persona o una idea.»
- «¿Qué necesito soltar por hoy?» — «No tienes que resolverlo esta noche.»

**Pregunta ligada a la mañana.** Cuando esa mañana se eligió una intención, algunas noches la pregunta es: «Esta mañana elegiste {emoción} como intención. ¿Qué notaste al respecto?», con el apoyo «No importa si el día resultó distinto a lo que esperabas.»

**RN-NOC-05 — La intención entra como pregunta, jamás como examen.** Se pregunta qué se notó, nunca si se cumplió. No hay marca de logro, ni de incumplimiento, ni comparación entre lo pretendido y lo ocurrido.

**RN-NOC-06 —** Se guarda el identificador de la pregunta y su origen (banco general o ligada a la mañana), para reconstruirla exactamente al releerla.

### 5.5.4 Momento 3 — emoción de cierre

Título: «¿Cómo me siento al cerrar el día?». Doce opciones más palabra propia, **selección única**.

En paz · En calma · Con gratitud · Con orgullo · Con alivio · Pensando · Neutral · Con cansancio · Con inquietud · Con frustración · Triste · Con demasiado encima

**RN-NOC-07 — Las emociones difíciles comparten jerarquía con las agradables.** No hay rojo, no hay aviso, no hay orden que las relegue al final y ninguna está peor contestada que otra.

**RN-NOC-08 — Selección única.** Nombrar cómo se cierra el día no es hacer un inventario; con dos respuestas la pregunta deja de tener una.

### 5.5.5 La descarga opcional

Una tarjeta: «¿Hay algo que quieras dejar aquí por hoy?», con apoyo «No necesitas resolverlo ahora.» y llamada a la acción «Dejarlo aquí y cerrar mi día».

**RN-NOC-09 — Se ofrece sola tras cuatro emociones concretas:** inquietud, frustración, tristeza y sensación de tener demasiado encima. Es una **lista cerrada y explícita, no un análisis**: la app no lee lo que alguien escribe para decidir si está mal.

**RN-NOC-10 — La palabra propia nunca dispara la tarjeta**, por la misma razón.

**RN-NOC-11 — El enlace para abrirla a mano, «Necesito soltar algo antes de cerrar», está debajo de todas las emociones**, no solo de las cuatro. Cualquiera puede necesitarlo.

**RN-NOC-12 — Lo escrito en la descarga no se analiza, no se resume y no dispara nada.** Se guarda y se puede releer en el Historial bajo el rótulo «Lo que dejaste ahí».

### 5.5.6 El cierre de la noche

Pantalla completa, la ceremonia más lenta del producto.

- Título: «Tu día puede terminar aquí.»
- Apoyo: «Lo que viviste hoy no necesita quedar resuelto esta noche.» (o «Por ahora, puedes dejarlo aquí.» si hubo descarga)
- Si hay algo reconocido, se muestra **uno solo**, bajo «Algo que reconoces de hoy».
- Llamada a la acción: «Cerrar mi día».
- Despedida: «Buenas noches.» y, discreto, «Puedes volver y cambiar lo que quieras.»

**RN-NOC-13 — Se muestra un elemento reconocido, no todos.** La pantalla final es un descanso, no un repaso. Se elige el primero porque se escribió primero, **no porque sea el mejor**: la app no ordena por importancia lo que alguien nombró.

**RN-NOC-14 —** La ceremonia dura hasta 900 ms y es inmediata con movimiento reducido.

### 5.5.7 La consulta de la noche

Idéntica en principio a la de la mañana (RN-MAN-21 a RN-MAN-24): las preguntas delante, las respuestas debajo, sin marcadores de ausencia y con «Cambiar algo».

## 5.6 Guardado

**RN-DAT-01 — Se guarda solo, todo el rato.** Los toques se escriben al momento; lo tecleado, a los 800 ms de inactividad. Salir a media frase no pierde nada.

**RN-DAT-02 — Lo que no se contestó se anota como omitido**, para que el recorrido sepa qué llegó a preguntarse. **No se usa nunca para reprochar nada** ni se muestra en ninguna pantalla.

**RN-DAT-03 — Solo se anota como omitido lo que llegó a preguntarse.** Una pregunta que no se mostró —la pausa, la descarga— no es una pregunta omitida.

**RN-DAT-04 — El cierre lo marca una marca de tiempo, no la cantidad escrita.** Un recorrido cerrado en blanco está cerrado.

---

# Capítulo 6 — Journal

## 6.1 Propósito

El Journal es escritura libre: sin preguntas, sin estructura y sin nada que completar. Es el único lugar del producto donde **el sistema está completamente mudo**.

Título: «Journal». Apoyo: «Sin preguntas y sin estructura. Lo que quieras, cuando quieras.»

**RN-JR-01 — El sistema no sugiere, no corrige y no comenta nada** en el Journal. Ni ideas de apoyo, ni preguntas detonantes, ni recuento de palabras, ni marcador de posición que insinúe qué escribir.

**RN-JR-02 —** Varias entradas por día son válidas. El Journal no es un registro diario.

## 6.2 Anatomía

- **Lista de entradas**, agrupadas por «Hoy», «Esta semana» y después por mes. Cada entrada muestra fecha y hora, las emociones elegidas y el comienzo del texto.
- **Buscador**, siempre disponible. Sin resultados: «Nada con esas palabras. Todo lo demás sigue aquí.»
- **Botón «Escribir»**, que abre el editor.

## 6.3 El editor

Dos partes, en este orden:

1. **Emociones.** «¿Cómo me siento?» — «Hasta tres. Las difíciles también cuentan.» Píldoras con emoji, más un chip «Otra» para una palabra propia.
2. **Texto libre.** Sin límite, sin marcador de posición que dirija.

**RN-JR-03 — El catálogo emocional del Journal es propio y distinto** del de la mañana y del de la noche. Incluye emociones difíciles y agradables mezcladas, sin separación visual.

**RN-JR-04 — Máximo tres emociones.** Al llegar al tope: «Tres es un buen número.» No es un error y no bloquea nada más.

**RN-JR-05 — Una entrada solo con emociones es una entrada válida.** Se muestra en la lista como «Solo emociones, sin palabras.»

**RN-JR-06 — Autoguardado**, con las mismas reglas de §5.6.

## 6.4 El PIN

El Journal puede protegerse con un PIN numérico de cuatro a seis dígitos. **Ponerlo es opcional** y se activa desde el propio Journal o desde ajustes.

**RN-PIN-01 —** El PIN se almacena derivado, con sal y muchas iteraciones. **Nunca se guarda en claro.**

**RN-PIN-02 —** El PIN bloquea el **acceso**, no cifra el contenido. Esto es una limitación consciente de esta versión y debe documentarse con honestidad si alguna vez se comunica al usuario. Está en el backlog como mejora (§16.2, B-7).

**RN-PIN-03 —** Un PIN olvidado se recupera **reautenticando la cuenta**, sin perder ninguna entrada.

**RN-PIN-04 —** Para poder recuperar el PIN hace falta una cuenta vinculada. Si no la hay, la app lo explica antes de dejar poner el PIN y ofrece vincularla; **no lo impide**.

**RN-PIN-05 —** El PIN protege el Journal, no el resto de la app. El Historial lo dice sin rodeos: «Con tu PIN puesto, lo que escribes se lee desde el journal.»

**RN-PIN-06 —** Los intentos fallidos no se castigan con bloqueos crecientes ni mensajes acusatorios. Se puede reintentar.

## 6.5 Estados

| Estado | Copy |
|---|---|
| Vacío | «Aquí caben los pensamientos que no caben en otro lado. Empieza cuando quieras.» |
| Sin resultados | «Nada con esas palabras. Todo lo demás sigue aquí.» |
| Bloqueado por PIN | Teclado numérico y una sola línea de contexto. Sin advertencias. |

---

# Capítulo 7 — Historial

## 7.1 Propósito

Volver a cualquier día. Título: «Historial». Apoyo: «Vuelve a cualquier día. Todo sigue aquí.»

**RN-HIS-01 — El Historial muestra, no analiza.** No hay tendencias, no hay medias, no hay gráficas de evolución del ánimo, no hay comparación entre semanas y no hay una sola conclusión generada por el sistema.

## 7.2 El calendario

Una vista mensual, navegable adelante y atrás. Cada día con algo registrado lleva **un punto de color** según el ánimo con que se cerró.

La escala tiene cinco estados y se rotula sin juicio:

| Estado | Rótulo |
|---|---|
| agotado | «Con cansancio» |
| inquieto | «Con inquietud» |
| normal | «Estuviste» |
| tranquilo | «En calma» |
| en paz | «En paz» |

Leyenda: «Cómo te fuiste a dormir».

**RN-HIS-02 — El ánimo de cinco estados es una vista, no un dato.** Se calcula al vuelo desde la emoción de cierre y **nunca se persiste**. Cambiar la emoción cambia el punto; no hay dos verdades que puedan desincronizarse.

**RN-HIS-03 — La escala de cinco es más gruesa que el catálogo de doce, y se asume.** Frustración, tristeza y sensación de tener demasiado encima caen en «Con inquietud». La respuesta exacta se lee donde está: en la vista del día, que muestra la emoción tal como se eligió. Ampliar la escala exigiría color de marca nuevo y ninguna tonalidad se inventa a mano.

**RN-HIS-04 — La palabra propia devuelve «Estuviste».** Interpretar lo que alguien escribió para colocarlo en una escala sería exactamente el diagnóstico que este producto prohíbe. Un día existió y se registró; de qué color es su punto, la app no lo deduce.

**RN-HIS-05 — Un día sin registro no lleva punto y no lleva marca negativa.** No hay hueco, no hay tachado y no hay color de ausencia.

## 7.3 La vista de día

Al tocar un día se abre lo escrito ese día, en tres bloques: «Tu mañana», «Tu noche» y «Lo que escribiste» (Journal).

Rótulos de la vista de día:

| Campo | Rótulo |
|---|---|
| Punto de partida | «Cómo empezaste» |
| Intención | «Tu intención» |
| Gratitud | «Lo que agradeciste» |
| Acción | «Tu paso de ese día» |
| Pausa | «Tu pausa» |
| Reconocimiento | «Lo que reconociste» |
| Reflexión | «Tu reflexión» |
| Emoción de cierre | «Cómo cerraste el día» |
| Descarga | «Lo que dejaste ahí» |

**RN-HIS-06 —** Día sin nada escrito: «Este día no tiene nada escrito. También estuviste.»

**RN-HIS-07 — Los campos de versiones anteriores se siguen leyendo.** Los días escritos antes del rediseño del 23 de agosto guardaron otros campos —cómo querías sentirte, cómo imaginabas el día, lo que aprendiste, cómo te fuiste a dormir—. El Historial los muestra con sus rótulos propios. **Nada de lo ya escrito se sobrescribe ni desaparece.**

**RN-HIS-08 —** Volver al calendario es siempre un toque.

## 7.4 Exportación

Fuera del alcance de esta versión. Está en el backlog (§16.2, B-3) y es una promesa que conviene cumplir pronto: un producto que dice que lo escrito es tuyo debería permitir llevárselo.

---

# Capítulo 8 — Respiración

## 8.1 Propósito

Una herramienta de calma disponible a un toque, en su propia sección. No es una biblioteca de meditaciones guiadas, no tiene narración y no tiene contenido de audio grabado.

**RN-RE-01 — Respiración no es una sección de contenido, es una herramienta.** Se abre, se usa y se sale. No acumula historial visible, no puntúa y no lleva la cuenta de sesiones para mostrarla.

## 8.2 Dos puntos de entrada

1. **La sección Respiración**, desde la cabecera.
2. **La tarjeta en Hoy**: «Respira un momento», presente en Mañana y en Noche.

**RN-RE-02 — La tarjeta de Hoy no muestra la duración.** Cuánto dura se dice antes de empezar, en la pantalla donde hay un botón que arranca el ejercicio, que es donde alguien decide de verdad.

**RN-RE-03 — Desde la tarjeta de Hoy, el ejercicio es el ritmo de la casa** (5-5-3, tres ciclos, unos 39 segundos), voluntario y saltable: «Tres ciclos. Puedes salir cuando quieras.» La configuración completa vive en la sección.

## 8.3 El flujo

```
Configuración → (Acomódate) → Sesión → Cierre
                                  ↑
                             Ajustes en vivo
```

**Configuración.** Se elige el patrón, la visual, la duración y el sonido. Se puede empezar sin tocar nada.

**Acomódate.** Una pantalla breve: «Acomódate» — «Suelta los hombros. Empezamos en un momento.» Con salida «Empezar ya».

**Sesión.** La visual, la etiqueta de la fase y los controles.

**Cierre.** «Listo», con una línea de resumen y dos salidas: «Otra vez» y «Volver al inicio».

## 8.4 Patrones

| Patrón | Descripción |
|---|---|
| **Calma 5-5-3** | «El ritmo de Strivo. Inhalas, exhalas, y dejas una pausa antes de volver a empezar.» |
| **Respiración en caja** | «Cuatro tiempos iguales. Ordena la cabeza cuando anda dispersa.» |
| **4-7-8** | «Exhalación larga después de una retención. Ayuda a soltar.» |
| **Exhalación larga** | «Sueltas el doble de lo que tomas. Sencillo y hondo.» |
| **Coherencia 5-5** | «Simétrica y sostenida. Buena para quedarse un rato.» |
| **Entrada suave 4-6** | «Sin retenciones. Si es tu primera vez, empieza aquí.» |
| **A tu medida** | «Ajusta cada tiempo como te acomode.» |

**RN-RE-04 —** Calma 5-5-3 es el patrón por defecto y el ritmo de la casa.

**RN-RE-05 —** Modificar un tiempo de la respiración en caja por separado la convierte en personalizada, y la app lo dice sin drama: «Al cambiar un tiempo por separado, esto deja de ser respiración en caja.»

**RN-RE-06 —** Si un ritmo configurado no se puede seguir, la app lo ajusta y lo avisa: «Ajustamos los tiempos para que el ritmo se pueda seguir.» No lo rechaza.

## 8.5 Duración

Tres modos: por respiraciones, por tiempo, o sin final («Hasta que quieras»).

**RN-RE-07 —** Se termina al cerrar la última respiración, así que puede alargarse unos segundos. La app lo dice de antemano en lugar de cortar a mitad de una exhalación.

## 8.6 Visuales

Dos, intercambiables: **círculo** que se expande y contrae, y **bolita sobre línea** que recorre las fases.

**RN-RE-08 —** Las fases se rotulan «Inhala», «Sostén», «Exhala», «Descansa». **Sin cuenta atrás y sin números.**

**RN-RE-09 —** Para lector de pantalla existen anuncios más explícitos que las etiquetas visuales, porque quien las oye no tiene la visual delante para saber cuánto falta.

**RN-RE-10 —** El color de Respiración es la **escala neutra de Strivo**. El círculo naranja y dorado de la respiración breve de Hoy es un elemento aparte y no se toca.

## 8.7 Sonido

**Todo el sonido es sintetizado en tiempo real. No hay archivos de audio y no se añaden dependencias por esto.**

Seis opciones: Silencio · Lluvia · Olas · Viento · Cristales · Fuego. Cada una con su descripción breve.

Además, un **sonido guía** opcional: «Un tono suave al empezar cada inhalación y cada exhalación», con volumen propio.

**RN-RE-11 — Silencio por defecto, en toda la app.** Si el perfil todavía no tiene preferencias, se arranca en silencio y no al revés.

**RN-RE-12 — Silenciar una vez silencia para siempre**, hasta que se cambie.

**RN-RE-13 —** Si el navegador no puede reproducir sonido, se dice y se sigue: «Tu navegador no reproduce sonido aquí. La respiración funciona igual.»

**RN-RE-14 —** Todos los nodos de audio se liberan al salir de la sesión.

## 8.8 Combinaciones guardadas

Una combinación es patrón + visual + duración + sonido, con nombre propio. «Guardadas» y «Últimas veces».

**RN-RE-15 —** Hasta veinte guardadas. Al llegar: «Puedes guardar hasta 20. Borra alguna que ya no uses para dejar lugar.»

**RN-RE-16 —** Nombre de hasta cuarenta caracteres, obligatorio, único. Los tres errores posibles están redactados sin reproche.

**RN-RE-17 —** Eliminar ofrece **deshacer**.

**RN-RE-18 —** Si al cargar una combinación el sonido ya no existe, se carga en silencio y se dice: «El sonido de esta combinación ya no está. La cargamos en silencio.» No falla.

## 8.9 Seguridad

**RN-RE-19 — El aviso de seguridad se muestra antes de la primera sesión** y es accesible después: «Si en algún momento te mareas o te incomoda, para y respira normal. No hay nada que ganar aguantando.»

**RN-RE-20 —** Toda sesión se puede pausar, reanudar, terminar y abandonar. Salir no pide confirmación, no cuesta nada y no se registra como abandono.

## 8.10 Limitación conocida

Una aplicación web instalable **no puede garantizar la reproducción de audio con la pantalla bloqueada**. Se mitiga solicitando el bloqueo de suspensión de pantalla y publicando metadatos de sesión multimedia, pero la limitación es real y está aceptada para esta versión.

---

# Capítulo 9 — Entrada, perfil y ajustes

## 9.1 Estado actual

La app arranca hoy con un mecanismo provisional que crea una sesión local y el árbol de datos del usuario. **El onboarding completo y la autenticación real no están implementados** y son el primer bloque del roadmap (§16.1, F-1).

## 9.2 Qué debe capturar el onboarding

Deliberadamente corto. Cuatro pantallas, todas saltables.

| Paso | Qué pregunta | Por qué hace falta |
|---|---|---|
| **O1** | Bienvenida con respiración breve (5-5-3, tres ciclos) | Enseña el ritmo de la casa antes de pedir nada |
| **O2** | Nombre | Personaliza el saludo. Saltable |
| **O3** | Género gramatical | Resuelve las etiquetas del catálogo emocional |
| **O4** | Horarios: a qué hora despiertas, a qué hora duermes | Sitúa el cambio de Mañana a Noche |
| **O5** | Recordatorios y cuenta | Ambos opcionales |

**RN-ONB-01 — Ningún paso del onboarding bloquea.** Todos se pueden saltar y todos se pueden completar después desde ajustes.

**RN-ONB-02 — El género se pregunta con cuatro opciones**: masculino, femenino, prefiero no contestar, otro. Las dos últimas resuelven a neutro.

**RN-ONB-03 — La app funciona sin cuenta.** La cuenta sirve para sincronizar entre dispositivos y para recuperar el PIN. No es un muro.

**RN-ONB-04 — Se captura algo bueno antes de pedir nada.** El onboarding termina con la primera mañana escrita, no con un formulario cerrado.

## 9.3 Ajustes

Editable en cualquier momento: nombre, género, horarios, sonido, PIN del Journal, preferencia de movimiento, cuenta.

**RN-AJU-01 —** Cambiar el género reescribe las etiquetas de todo lo ya guardado, porque se persisten identificadores y no textos.

**RN-AJU-02 —** Existe siempre una forma de borrar la cuenta y sus datos. Es un derecho, no una funcionalidad negociable.

---

# Capítulo 10 — Sistema visual, interacción y accesibilidad

## 10.1 Principio rector

**El manual de marca es la fuente única para color, tipografía y símbolos. Ningún valor cromático se escribe a mano en un componente.** Todos los valores viven en el archivo de tokens y se aplican por variables.

## 10.2 Los dos momentos

El producto tiene dos vestimentas, y la elige el conmutador de Hoy:

- **Strivo · Mañana** — claridad suave. Fondos claros, texto oscuro. Base cálida con acentos malva y rosado.
- **Strivo · Noche** — introspección profunda. Fondos oscuros azulados, texto claro. Primario violáceo.

Además, una **escala neutra de marca** que viste el cromo donde no hay momento: Journal, Historial, Respiración y ajustes.

**RN-VIS-01 — El fondo de Hoy es siempre un degradado.** Nunca un color plano.

**RN-VIS-02 — El color del texto lo decide la superficie, no el componente.** Cada contenedor declara si es superficie clara u oscura, y el texto hereda. Ningún componente fija un color de texto literal.

**RN-VIS-03 — El negro puro no se usa.** El fondo oscuro es un índigo violáceo, no negro.

**RN-VIS-04 — Cambiar de momento recolorea fondo, cabecera y tarjetas a la vez**, con el mismo cruce de 320 ms. Nada salta a destiempo.

## 10.3 Tipografía

Una sola familia, **Inter**, en variable. La jerarquía se construye con peso y tamaño, nunca con familias distintas.

La escala se expresa en unidades relativas para que respete el tamaño de fuente del sistema.

## 10.4 Espaciado y forma

- Base de 4 px, escala 1,25×.
- Radios entre 10 y 32 px.
- **Sin sombras proyectadas.** La profundidad se expresa con elevación sutil de superficie.
- Área táctil mínima de 44 × 44 px en todo elemento interactivo.

## 10.5 Movimiento

- Duraciones **más lentas de lo habitual**. Mínimo 120 ms, máximo 900 ms.
- Curva suave, sin rebotes ni elasticidad.
- Vibración háptica ligera en confirmaciones. **Nunca en errores.**

**RN-VIS-05 — Toda animación respeta la preferencia de movimiento reducido del sistema.** Con ella activada, las transiciones son inmediatas y el umbral de entrada no se muestra.

## 10.6 Accesibilidad

**RN-A11Y-01 — Contraste AAA** en todo texto, en ambos momentos y en ambas superficies. Se verifica con una comprobación automatizada que forma parte de la integración.

**RN-A11Y-02 — El estado activo nunca se comunica solo por color.** Siempre acompañado de peso tipográfico y borde.

**RN-A11Y-03 — Escalado tipográfico hasta el 200 %** sin pérdida de contenido ni de funcionalidad.

**RN-A11Y-04 — Todo lo interactivo es alcanzable por teclado**, con foco visible.

**RN-A11Y-05 — Toda visual animada tiene su equivalente textual anunciado** para lector de pantalla. Esto aplica en particular a Respiración.

**RN-A11Y-06 — Los emojis del catálogo emocional son decorativos** y se ocultan al lector de pantalla; la etiqueta de texto es la que se anuncia.

**RN-A11Y-07 — Ningún icono va solo.** Todo icono lleva etiqueta visible o accesible.

---

# Capítulo 11 — Estados de interfaz

## 11.1 Principio

**RN-EST-01 — Un estado vacío es una invitación, nunca una acusación.** Nunca dice qué falta; dice qué cabe.

## 11.2 Estados vacíos

| Pantalla | Copy |
|---|---|
| Journal sin entradas | «Aquí caben los pensamientos que no caben en otro lado. Empieza cuando quieras.» |
| Búsqueda sin resultados | «Nada con esas palabras. Todo lo demás sigue aquí.» |
| Historial sin días | «Tu historial crecerá con cada día que registres.» |
| Día sin nada escrito | «Este día no tiene nada escrito. También estuviste.» |
| Respiración sin guardadas | «Todavía no guardas ninguna. Cuando encuentres un ritmo que te acomode, guárdalo aquí.» |

## 11.3 Carga

**RN-EST-02 — Sin ruedas giratorias en la carga de contenido.** Se usa un esqueleto de la forma final o, cuando la carga es breve, nada en absoluto.

**RN-EST-03 — El umbral de entrada no se usa como pantalla de carga.** Se cruza cuando el contenido ya está montado detrás.

## 11.4 Errores

**RN-EST-04 — El error nunca muestra un código.** Muestra qué pasó, tranquiliza sobre lo escrito y ofrece reintentar.

| Situación | Copy |
|---|---|
| No se pudo abrir el día | «No pudimos abrir tu día. Lo que escribiste sigue guardado.» + «Reintentar» |
| No se pudo guardar | «No pudimos guardar eso. Tu texto sigue aquí.» + «Reintentar» |

**RN-EST-05 — Un error de red no es un error visible** mientras el guardado local funcione. La app avisa solo si hay algo pendiente de subir: «Se guardará en la nube más tarde».

**RN-EST-06 — Nada vibra en un error.**

## 11.5 Confirmaciones

**RN-EST-07 — Solo se confirma lo que destruye contenido**, y solo si hay contenido que perder. Quitar una línea vacía no pregunta; quitar una línea escrita sí: «¿Quitar esto?».

**RN-EST-08 — Salir nunca pide confirmación.** Está todo guardado.

**RN-EST-09 — Eliminar una combinación de respiración ofrece deshacer** en lugar de confirmar antes.

## 11.6 Sin conexión

**RN-EST-10 — La app funciona completa sin red.** Todo se escribe primero en el almacén local; la subida es posterior y asíncrona.

**RN-EST-11 — Si la sincronización falla, la marca no se pierde.** Se reintenta y no se duplica.

## 11.7 Comportamiento adaptable

El producto se diseña **primero para teléfono en vertical**, que es donde vive.

| Ancho | Comportamiento |
|---|---|
| < 480 px | Referencia. Una columna, cabecera fija, contenido con respiración lateral |
| 480–900 px | Misma columna, centrada, con ancho máximo de lectura |
| > 900 px | Columna centrada con ancho máximo. **No se reparte en dos columnas** |

**RN-EST-12 — El producto no crece hacia los lados.** En pantalla grande hay más margen, no más contenido. Una app de calma que llena un monitor deja de serlo.

**RN-EST-13 — Se respetan las áreas seguras** del dispositivo, arriba y abajo.

---

# Capítulo 12 — Modelo de datos y reglas funcionales

## 12.1 Principios

**RN-DB-01 — Local primero.** Todo se escribe en el almacén local del dispositivo al instante. La nube es una copia posterior, no la fuente de verdad en el momento de escribir.

**RN-DB-02 — Nada se corrige en silencio.** Un registro incompleto se rechaza al escribir o se devuelve tal cual al leer. La capa de datos no rellena huecos.

**RN-DB-03 — Campo fuera del modelo es un error de programación.** Escribir un campo no declarado lanza un error explícito. Ampliar el modelo es una decisión, no un descuido.

**RN-DB-04 — Nada de lo escrito se sobrescribe ni desaparece** al cambiar el modelo. Los campos retirados se siguen leyendo; simplemente ya nadie los escribe.

## 12.2 El árbol

```
users/{uid}/
├── shared/
│   ├── profile        { name, gender, wakeTime, sleepTime, diaTerminaA, createdAt }
│   ├── auth           { uid, email, phone }
│   ├── preferences    { soundEnabled, reducedMotion }
│   └── onboarding     { completedSteps, currentStep }
│
├── diario/
│   ├── morningEntry/{YYYY-MM-DD}
│   ├── nightEntry/{YYYY-MM-DD}
│   ├── journal/{entryId}
│   └── pinConfig      { salt, hash, iterations, algorithm, enabled }
│
└── respiracion/
    ├── preferences
    ├── favoritos/{id}
    ├── recientes
    └── sesiones
```

## 12.3 Registros

### `diario/morningEntry/{fecha}`

| Campo | Tipo | Notas |
|---|---|---|
| `version` | número | 2 = tres momentos. Ausente = versión 1 |
| `updatedAt` | marca local | Con desfase horario |
| `completedAt` | marca local | Su presencia significa «cerrada» |
| `skipped` | lista | Identificadores de preguntas no contestadas |
| `feeling` | texto | Identificador del punto de partida |
| `feelingOther` | texto | Palabra propia, si la hubo |
| `intention` | texto | Identificador de la intención |
| `intentionOther` | texto | Palabra propia, si la hubo |
| `gratitude` | lista | Hasta diez líneas |
| `action` | texto | Hasta 240 caracteres sugeridos |
| `reflectionId` | texto | Qué pregunta de pausa salió |
| `reflection` | texto | Hasta 180 caracteres sugeridos |

*Solo lectura, de la versión 1:* `emotions`, `granVision`.

### `diario/nightEntry/{fecha}`

| Campo | Tipo | Notas |
|---|---|---|
| `version` | número | 2 = tres momentos |
| `updatedAt`, `completedAt`, `skipped` | — | Igual que la mañana |
| `recognized` | lista | De una a tres líneas |
| `reflectionId` | texto | Qué pregunta salió |
| `reflectionSource` | texto | Banco general o ligada a la intención |
| `reflection` | texto | Hasta 400 caracteres sugeridos |
| `closingFeeling` | texto | Identificador de la emoción de cierre |
| `closingFeelingOther` | texto | Palabra propia, si la hubo |
| `release` | texto | La descarga. Hasta 400 caracteres sugeridos |

*Solo lectura, de la versión 1:* `gratitude`, `learning`, `sleepState`, `sleepStateOther`, `inheritedWins`, `newWins`.

### `diario/journal/{id}`

`date`, `text`, `emotions` (hasta 3), `otherText`, `createdAt`, `updatedAt`.

### `diario/pinConfig`

`salt`, `hash`, `iterations`, `algorithm`, `enabled`.

## 12.4 Reglas del modelo

**RN-DB-05 — El ánimo de cinco estados no es un campo.** Es una vista derivada de la emoción de cierre, calculada al pintar. Nunca se persiste.

**RN-DB-06 — Se persisten identificadores, no etiquetas.** Vale para emociones, intenciones y preguntas.

**RN-DB-07 — Los límites de longitud son sugerencias, no validaciones.** Alcanzar uno no produce error ni bloquea el guardado.

**RN-DB-08 — Las fechas se guardan como `YYYY-MM-DD` en zona local**, con el desfase horario anotado en la marca de tiempo. Un día es el día de quien lo vivió.

**RN-DB-09 — La marca de cierre es lo único que determina si un recorrido está cerrado.** No se infiere de cuántos campos hay escritos.

**RN-DB-10 — Respiración no lee ni escribe en `diario/`,** y `diario/` no lee `respiracion/`. Lo único que comparten es el motor de ritmo, que es lógica pura sin datos.

## 12.5 Reglas de negocio transversales

| Regla | Enunciado |
|---|---|
| **RN-01** | Local primero: se guarda al instante en el dispositivo; la red es posterior. Si cae, no se pierde nada. |
| **RN-02** | Ningún campo es obligatorio en ningún recorrido. |
| **RN-03** | Cerrar un recorrido vacío lo completa igual. |
| **RN-04** | No existe el estado «fallado» en ninguna entidad del modelo. |
| **RN-05** | La app nunca presenta la ausencia de registro como un problema. |
| **RN-06** | Ningún texto de la persona se analiza para decidir cómo tratarla. Toda ramificación por contenido emocional usa listas cerradas y explícitas. |
| **RN-07** | Privacidad: ningún dato identificable ni contenido escrito sale en analítica. |
| **RN-08** | Lo escrito debe ser exportable. Nada se bloquea si se cancela una suscripción futura. |
| **RN-09** | Toda pantalla es abandonable sin coste y sin confirmación. |
| **RN-10** | Cuatro secciones máximo en la navegación; tres toques de profundidad máxima. |

---

# Capítulo 13 — Analítica, métricas y calidad

## 13.1 Qué se mide y qué no

**RN-AN-01 — La analítica nunca contiene contenido escrito por la persona.** Ni fragmentos, ni longitudes de texto, ni palabras clave.

**RN-AN-02 — La analítica nunca contiene datos identificables.** Identificador anónimo y nada más.

**RN-AN-03 — Los eventos registran que algo ocurrió, no qué se dijo.** «Mañana cerrada» es un evento válido; «mañana cerrada con emoción tristeza» no lo es.

**RN-AN-04 — No se registra ningún evento de abandono como tal.** Salir de una pantalla no es un dato negativo que la app deba recopilar sobre alguien.

### Eventos autorizados

| Evento | Propiedades |
|---|---|
| `app_abierta` | franja horaria |
| `manana_cerrada` | número de momentos con respuesta (0–3) |
| `noche_cerrada` | número de momentos con respuesta (0–3) |
| `pausa_mostrada` / `pausa_respondida` | — |
| `descarga_mostrada` / `descarga_usada` | ofrecida sola o abierta a mano |
| `journal_entrada_creada` | con o sin texto |
| `respiracion_iniciada` | patrón, duración, con o sin sonido |
| `respiracion_completada` | ciclos completados |
| `historial_dia_abierto` | — |
| `pin_activado` / `pin_desactivado` | — |

## 13.2 Métricas de producto

**La métrica principal no es el uso diario.** Es la **vuelta**: qué proporción de quienes escribieron una mañana escriben otra dentro de los siete días siguientes. Mide que el producto se sintió bien, no que enganchó.

| Métrica | Definición | Referencia inicial |
|---|---|---|
| **Vuelta a 7 días** | Escribió otra mañana o noche dentro de 7 días | ≥ 40 % |
| **Cierre completo** | Recorridos cerrados con al menos un momento respondido | ≥ 70 % |
| **Uso de la noche** | Personas activas que usan la noche, no solo la mañana | ≥ 50 % |
| **Adopción de Respiración** | Personas activas que la usan al menos una vez al mes | ≥ 25 % |
| **Segundo mes** | Personas activas en el mes 1 que siguen en el mes 2 | ≥ 30 % |

**RN-AN-05 — Ninguna métrica de retención se convierte en mecanismo dentro del producto.** Si la vuelta a siete días baja, la respuesta es mejorar la experiencia, **no añadir un recordatorio insistente ni una racha**.

## 13.3 Criterios de calidad

Toda pantalla, antes de darse por terminada:

1. Ningún texto contiene léxico prohibido (verificación automática).
2. Contraste AAA en ambos momentos; escalado al 200 %; movimiento reducido respetado.
3. Escribir, editar o marcar genera un registro local que sincroniza después sin duplicarse.
4. El estado vacío invita, no acusa.
5. El error es amable, sin código, con reintento.
6. Funciona sin conexión.
7. Ningún texto vive en el componente: todo viene de la biblioteca central.
8. Ninguna tonalidad literal en el componente: todo viene de tokens.

## 13.4 Revisión emocional

Además de las pruebas automáticas, cada bloque se recorre a mano con estas preguntas:

- ¿Alguna pantalla me hace sentir atrasado?
- ¿Alguna cifra o etiqueta me está evaluando?
- ¿Hay algún sitio donde no pueda salir sin dar explicaciones?
- ¿Alguna respuesta difícil se ve peor que una fácil?
- ¿Hay entusiasmo impostado en algún texto?
- ¿Algo va más rápido de lo que este producto debería ir?

**Un «sí» en cualquiera de estas es un defecto**, aunque todas las pruebas automáticas pasen.

---

# Capítulo 14 — Arquitectura técnica, pruebas y aceptación

## 14.1 La pila

| Capa | Elección |
|---|---|
| Interfaz | React con Vite, aplicación web instalable |
| Estilos | Utilidades con tokens propios; ningún valor cromático literal |
| Enrutado | Enrutador por fragmento (`#`), por servirse como estático |
| Datos locales | Base de datos del navegador, con acceso asíncrono |
| Datos remotos | Firebase (autenticación y base documental) |
| Audio | API de audio del navegador, síntesis en tiempo real |
| Hospedaje | Netlify, con publicación automática desde la rama activa |
| Pruebas | Vitest |

**RN-TEC-01 — Sin dependencias nuevas para sonido.** Todo el audio se sintetiza.

**RN-TEC-02 — Todo el texto visible sale de la biblioteca central de copy.** Verificado por herramienta propia.

**RN-TEC-03 — Todo color sale de tokens.** Verificado por herramienta propia de contraste.

**RN-TEC-04 — Respiración no importa nada del diario y viceversa.** Impuesto por reglas de análisis estático, no por convención.

**RN-TEC-05 — Los componentes compartidos no importan nada específico de una sección.** Lo que necesiten llega por propiedades.

## 14.2 Estructura del código

```
src/
├── copy/            biblioteca central de texto
├── content/         repertorios de frases (apertura y del día)
├── tokens/          tokens de diseño
├── styles/          variables y estilos globales
├── lib/
│   ├── db/          capa de datos: shared, diario
│   ├── respiracion/ motor de ritmo (lógica pura)
│   └── audio/       síntesis
├── diario/          lógica de mañana, noche, journal, historial, PIN
├── breathing/       la herramienta completa
├── components/
│   ├── shared/      símbolo, umbral, navegación
│   ├── ui/          primitivas
│   └── diario/      mañana, noche, journal, historial
└── pages/           Hoy, Journal, Historial, Respiración
```

## 14.3 Comandos de verificación

Los seis deben pasar antes de cualquier integración:

```
npm run lint            análisis estático, cero advertencias
npm run lint:copy       léxico prohibido y textos en componentes
npm run lint:contraste  contraste de todas las combinaciones
npm run format:check    formato
npm run test            suite completa
npm run build           construcción de producción
```

## 14.4 Estado de las pruebas

La rama activa cuenta con **52 archivos de prueba y del orden de 1.180 casos**, todos en verde antes del repliegue de alcance.

Tras la separación, la cifra bajará: las pruebas de las secciones que salen se van con ellas, y un bloque de pruebas compartidas —marca, navegación, umbral y separación de capas— debe reescribirse contra la arquitectura de una sola app. La cifra que importa no es cuántas quedan, sino que **ninguna se borre sin decidir explícitamente si lo que verificaba sigue siendo cierto**.

## 14.5 Criterios de aceptación de la versión

Strivo 1.0 está listo para prueba con personas externas cuando:

| # | Criterio |
|---|---|
| **CA-1** | La app abre en Hoy tras el umbral, sin pantallas intermedias |
| **CA-2** | La navegación muestra exactamente cuatro secciones, en el orden especificado |
| **CA-3** | Mañana y Noche se recorren completas, se cierran y quedan en consulta |
| **CA-4** | Un recorrido cerrado en blanco cierra sin advertencia y sin marcador de ausencia |
| **CA-5** | Cambiar el género del perfil reescribe las etiquetas de días ya guardados |
| **CA-6** | El Journal funciona con y sin PIN; el PIN se recupera reautenticando |
| **CA-7** | El Historial pinta el punto de ánimo y abre el día completo, incluidos campos de la versión anterior |
| **CA-8** | Respiración se abre desde la sección y desde la tarjeta de Hoy, con los siete patrones y los seis sonidos |
| **CA-9** | La app funciona completa en modo avión y sincroniza al recuperar red, sin duplicar |
| **CA-10** | Los seis comandos de verificación pasan en verde |
| **CA-11** | No queda ninguna referencia visible ni en el paquete de la aplicación al alcance retirado |
| **CA-12** | La revisión emocional de §13.4 no arroja ningún «sí» |

---

# Capítulo 15 — Contenido

## 15.1 Repertorios de frases

Dos repertorios distintos, en archivos de contenido propios, **fuera de la biblioteca de copy de interfaz**:

- **Frases de apertura** — las del umbral. Del orden de cien. Cortas, de gratitud o amabilidad, sin exigencia.
- **Frases del día** — las de la pantalla Hoy. Del orden de sesenta hoy, con objetivo de más de ciento veinte.

**RN-CON-01 — Ninguna frase manda hacer nada.** Ni «recuerda», ni «hoy es un buen día para», ni imperativos de superación.

**RN-CON-02 — Ninguna frase da por hecho que el día vaya bien.**

**RN-CON-03 — Ninguna frase se repite dos veces seguidas.**

**RN-CON-04 — Las frases del día pueden variar con el ánimo de la noche anterior**, sin nombrarlo y sin que se note que la app lo sabe.

## 15.2 Catálogos emocionales

Cuatro catálogos distintos, y la distinción es intencional:

| Catálogo | Dónde | Tamaño | Incluye difíciles |
|---|---|---|---|
| Punto de partida | Mañana, momento 1 | 11 + propia | Sí |
| Intención | Mañana, momento 3 | 9 + propia | No |
| Emoción de cierre | Noche, momento 3 | 12 + propia | Sí |
| Journal | Editor de entrada | 15 + propia | Sí |

**RN-CON-05 — Ningún catálogo puede sustituirse por otro.** Comparten mecánica, no vocabulario.

## 15.3 Iconografía emocional pendiente

El catálogo de la mañana usa hoy emojis del sistema. Está encargado un juego de **iconos propios**: formas orgánicas abstractas, **nunca caras**, coherentes con el trazo del símbolo de marca, en línea cuando están en reposo y rellenas de color al seleccionarse —lo que exige que sean formas cerradas reutilizables en ambos estados—. Curvas fluidas y cerradas para emociones de baja energía; formas que irradian para las de alta energía.

Está en el backlog (§16.2, B-1).

---

# Capítulo 16 — Roadmap y backlog

## 16.1 Fases

### F-0 — Repliegue a una sola app · *en curso*

**Objetivo:** que la rama activa contenga únicamente Strivo.

- Rama de resguardo creada y protegida.
- Rama activa depurada: código, rutas, componentes, dependencias, estilos, textos, pruebas y documentación.
- Renombrado completo de identificadores, rutas y tokens.
- Documentación del repositorio actualizada a esta versión del Blueprint.
- **Cierre:** los seis comandos en verde y CA-11 cumplido.

*Los pasos operativos están en el documento hermano de separación técnica.*

### F-1 — Entrada real · *siguiente*

Onboarding O1–O5, autenticación real en sustitución del arranque provisional, y perfil y ajustes editables.

**Cierre:** una persona nueva instala, se registra, escribe su primera mañana y vuelve al día siguiente en su propio dispositivo.

### F-2 — Prueba con personas · *tras F-1*

Cinco personas externas, observación sin guiar, recogida de vocabulario espontáneo.

**Cierre:** cuatro de cinco describen la experiencia con palabras del campo semántico de calma, cuidado u orden, sin que se les sugieran.

### F-3 — Pulido y publicación

Incorporación del feedback, iconografía emocional propia, repertorio de frases ampliado, exportación.

**Cierre:** aplicación instalable publicada, con exportación funcionando.

### F-4 — Recordatorios y presencia

Recordatorios adaptativos, discretos y desactivables.

**RN-ROAD-01 —** Ningún recordatorio menciona ausencia, retraso ni cantidad de días.

## 16.2 Backlog priorizado

| # | Elemento | Por qué |
|---|---|---|
| **B-1** | Iconografía emocional propia (16 iconos) | Los emojis del sistema son la única pieza visual que no es de la marca |
| **B-2** | Ampliar el repertorio de frases del día a 120+ | Con sesenta, la repetición se nota en dos meses |
| **B-3** | Exportar todo lo escrito | Promesa implícita del posicionamiento |
| **B-4** | Navegación por fecha dentro del Journal | Pedido en revisión previa, aplazado |
| **B-5** | Cifrado real del contenido del Journal | Hoy el PIN bloquea el acceso, no cifra |
| **B-6** | Bloqueo de suspensión de pantalla en Respiración | Mitiga la limitación de §8.10 |
| **B-7** | Mirada semanal, sin cifras | Solo si puede hacerse sin evaluar. Ante la duda, no se hace |
| **B-8** | Sincronización multidispositivo verificada | Depende de F-1 |

## 16.3 Decisiones abiertas

| # | Decisión | Opciones |
|---|---|---|
| **DA-1** | ¿Las cuatro secciones se quedan en la cabecera o bajan a una barra inferior? | Cabecera (actual, cambio nulo) · barra inferior (mejor alcance del pulgar, más trabajo) |
| **DA-2** | ¿El símbolo de Strivo es la marca única, o se rediseña a partir del símbolo del producto? | Confirmar D-3 visualmente |
| **DA-3** | ¿Cuánto dura la frase del día: la jornada natural o hasta la hora de dormir declarada? | Hoy, la jornada natural |
| **DA-4** | ¿La pausa de la mañana aparece con qué frecuencia? | Hoy, según regla interna. Falta decidir la cadencia deseada |
| **DA-5** | ¿Modelo de negocio en esta versión? | Todo gratuito hasta después de F-2 es lo recomendable |

---

# Anexo A — Revisión emocional por módulo

Quince comprobaciones, aplicables al recorrerse la app entera a mano.

| # | Comprobación |
|---|---|
| A-1 | Ninguna pantalla me dice cuánto llevo hecho ni cuánto me falta |
| A-2 | Ninguna cifra visible describe mi comportamiento |
| A-3 | Las emociones difíciles se ven igual de bien que las agradables |
| A-4 | Puedo salir de cualquier sitio sin dar explicaciones |
| A-5 | Ningún texto se alegra más de lo que yo me alegro |
| A-6 | Ningún estado vacío me señala |
| A-7 | Ningún error me culpa |
| A-8 | Nada se mueve más rápido de lo que me acomoda |
| A-9 | Ninguna pantalla me pide algo antes de darme algo |
| A-10 | Nada de lo que escribí se interpreta ni se resume por mí |
| A-11 | La noche admite un día malo sin pedirme que le encuentre lo bueno |
| A-12 | Nada compara hoy con ayer |
| A-13 | La app no sabe nada de mí que yo no le haya dicho |
| A-14 | Puedo dejar el día en blanco y cerrarlo igual |
| A-15 | Al salir estoy más tranquilo que al entrar |

---

# Anexo B — Trazabilidad desde la versión 4.1

| Capítulo v4.1 | Destino en v5.0 |
|---|---|
| Cap. 0 — Arquitectura de marca | Retirado. Sustituido por Cap. 1 |
| Cap. 1 — Onboarding y capa compartida | Cap. 9 |
| Cap. 2 — Espacio de reflexión | Caps. 5, 6, 7 (actualizados al rediseño del 23 ago) |
| Cap. 3 — Espacio de acción | Retirado del alcance |
| Cap. 4 — Inteligencia cruzada | Retirado del alcance |
| Cap. 5 — Modelo de datos | Cap. 12, reducido a dos ramas |
| Cap. 6 — Decisiones de fase inicial | Absorbido en los capítulos correspondientes |
| Cap. 7 — Decisiones de la división | Retirado: la división ya no existe |
| Caps. 8–15 — Transversales | Caps. 1–3, 10, 11, 13, 14 |
| Anexo A — Revisión emocional | Anexo A, ampliado |
| Anexo B — Analítica | Cap. 13 |
| Anexos C–D — Decisiones e instrucciones | §16.3 y Cap. 0 |
| Anexo E — Ritual de mañana derogado | Retirado: ya no hay nada que derogar |
| Anexo F — Matriz de trazabilidad | Anexo B |

**Se incorporan además**, sin equivalente en v4.1: la mañana y la noche en tres momentos, la pantalla de consulta, la emoción de cierre de doce opciones, la descarga opcional, el banco de reflexiones con pregunta ligada a la intención, y Respiración completa como sección del producto.

---

*Fin del documento.*
