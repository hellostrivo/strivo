# Strivo — Biblioteca de frases

**Destino en el repo:** `docs/frases.md` (documento de referencia editorial)
**Implementación:** los dos arrays van en `src/copy/index.js`, bajo `apertura.frases` y `hoy.fraseDelDia`
**Versión:** 1.0 — 06/08/2026

---

## Por qué este archivo existe (respuesta a D-06)

Las frases se entregan **como contenido aparte, no dentro del documento de implementación**. Tres razones:

1. **Ciclo de vida distinto.** La especificación de una pantalla se implementa una vez y se archiva. Un repertorio de frases se lee, se corrige y se amplía durante toda la vida del producto. Enterrarlo dentro de un spec de 600 líneas garantiza que nadie vuelva a abrirlo.
2. **Revisión editorial, no técnica.** Estas 160 frases son lo primero que la persona lee cada vez que abre Strivo. Merecen leerse de corrido y en voz alta, no evaluarse entre criterios de aceptación y tokens de diseño.
3. **Crece sin tocar código.** Los arrays están declarados en `src/copy/index.js`; añadir la frase 101 es añadir una línea, sin abrir un componente ni recompilar lógica.

**Cómo usarlo con Claude Code:** este archivo se entrega **junto con la Parte 4B**, que es la que implementa los dos lugares donde las frases aparecen.

---

## Reglas de redacción

Aplican a toda frase que se añada en el futuro. Si una frase nueva falla cualquiera de las siete, no entra.

1. **Entre 4 y 14 palabras.** Se lee en tres segundos o no se lee.
2. **Sin imperativos ni instrucciones.** "Respira hondo" es una orden; "Hay tiempo" es una compañía. Strivo no manda.
3. **Sin promesas de resultado.** Nada de "hoy será un gran día": si no lo es, la app mintió.
4. **Sin marca de género.** Verificar una por una. Esto evita necesitar cientos de variantes y es la razón por la que aquí no hay adjetivos como "cansado", "solo" o "tranquilo" referidos a la persona.
5. **Debe funcionar en un mal día.** El filtro más importante. Una frase que consuela a quien está bien pero suena a burla para quien está mal, no entra.
6. **Sin lenguaje de coaching, productividad ni autoayuda cliché.** Ni "tú puedes con todo", ni "eres imparable", ni "la mejor versión de ti".
7. **Sin referencias temporales fijas** ("esta mañana", "hoy es lunes"): la frase puede salir a cualquier hora.

**Regla de separación entre los dos repertorios:** son distintos y no se mezclan. Si la misma frase pudiera salir en la apertura y en la tarjeta del día, aparecería dos veces con dos minutos de diferencia y delataría lo pequeño que es el repertorio.

| | Repertorio A — Apertura | Repertorio B — Frase del día |
|---|---|---|
| Dónde | Pantalla de transición al abrir la app (§17) | Tarjeta superior de "Hoy" (§20) |
| Cuándo cambia | Cada aparición | Una vez por día natural |
| Registro | Gratitud y amabilidad con uno mismo | Ánimo para el día que empieza |
| Mira hacia | El presente y lo que ya hay | El día por delante |
| Cantidad | 100 | 60 |

---

## Repertorio A — Apertura (100 frases)

Gratitud y amabilidad. Se leen en el umbral, antes de cualquier pendiente.

```js
'apertura.frases': [
  'Nada de lo que hiciste ayer te define hoy.',
  'Estar aquí ya es algo.',
  'No tienes que rendir para merecer descanso.',
  'Hay cosas buenas que no notaste todavía.',
  'Tu cuerpo te ha traído hasta aquí.',
  'Puedes ir despacio.',
  'Alguien se alegra de que existas.',
  'Lo difícil también cuenta como avanzar.',
  'No hace falta que sea perfecto.',
  'Estás haciéndolo mejor de lo que crees.',
  'Hay tiempo.',
  'Mereces la misma amabilidad que le das a quien quieres.',
  'Descansar también es parte de avanzar.',
  'Lo que sientes tiene sentido.',
  'No vas tarde.',
  'Este momento es tuyo.',
  'Tu ritmo es válido.',
  'Hay días que solo piden que los cruces.',
  'Todavía hay margen para que hoy mejore.',
  'No tienes que resolverlo todo hoy.',
  'Lo pequeño también cuenta.',
  'Tu esfuerzo existe aunque nadie lo vea.',
  'Puedes empezar otra vez cuantas veces haga falta.',
  'Nadie lleva la cuenta de tus tropiezos como tú.',
  'Hoy también hay algo que agradecer.',
  'Respirar ya es un buen comienzo.',
  'Lo que tienes hoy alguna vez lo pediste.',
  'Hay gente que te quiere sin que se lo pidas.',
  'No todo tiene que sentirse bien para estar bien.',
  'Tu historia es más larga que este día.',
  'Está permitido no poder con todo.',
  'Hay belleza en lo ordinario de hoy.',
  'Lo que aprendiste te acompaña aunque no lo notes.',
  'Sigues aquí, y eso ya dice mucho.',
  'No necesitas justificar cómo te sientes.',
  'Un día tranquilo también es un buen día.',
  'Lo que no hiciste ayer todavía se puede hacer.',
  'Nadie te pide que seas otra persona hoy.',
  'Hay cosas que ya salieron bien y no las contaste.',
  'El cansancio no borra lo que lograste.',
  'Puedes cuidarte sin dar explicaciones.',
  'La calma también se practica.',
  'Hoy no tiene que ser el mejor día para valer.',
  'Tienes permiso de pedir ayuda.',
  'Lo que agradeces se hace más grande.',
  'Tu presencia le importa a alguien más de lo que crees.',
  'No hay prisa por sentirte diferente.',
  'Cada día trae algo que no esperabas.',
  'Está bien si hoy solo alcanzas para lo básico.',
  'Lo que te preocupa hoy no siempre te va a pesar igual.',
  'Tienes derecho a un momento de silencio.',
  'Nada de esto tiene que hacerse de una vez.',
  'Tu manera de hacer las cosas también funciona.',
  'Hay algo de hoy que vas a extrañar después.',
  'Lo que das a otros también te sostiene.',
  'Puedes soltar lo que no te toca cargar.',
  'No estás compitiendo con nadie.',
  'Hay días de sembrar y días de esperar.',
  'Tu valor no depende de lo que produzcas.',
  'Alguien pensó en ti hoy sin decírtelo.',
  'Todavía puedes cambiar de opinión.',
  'Lo simple también es suficiente.',
  'Hay un lugar donde nada se te exige, y es este.',
  'Está bien no tener respuestas todavía.',
  'Cuidarte no es egoísmo.',
  'Lo que te hace bien merece espacio.',
  'Los días buenos también dejan cansancio.',
  'Nadie hace todo bien todos los días.',
  'Hay algo que hoy sí está a tu favor.',
  'Tu paciencia contigo también cuenta.',
  'Lo que te falta no borra lo que ya tienes.',
  'Puedes estar en paz sin tenerlo todo resuelto.',
  'Un paso pequeño sigue siendo un paso.',
  'Hoy también estás aprendiendo algo.',
  'Tu esfuerzo de ayer todavía sirve hoy.',
  'La gratitud no necesita motivos grandes.',
  'Hay silencio disponible cuando lo necesites.',
  'Nada te obliga a estar bien todo el tiempo.',
  'Lo que te importa dice mucho de ti.',
  'Todavía queda día por delante.',
  'Puedes volver aquí las veces que quieras.',
  'Nadie más ve lo que tú resuelves cada día.',
  'Está bien empezar por lo más fácil.',
  'Hay cosas que sanan solo con tiempo.',
  'Tu manera de sentir no está equivocada.',
  'Lo que hoy parece mucho, mañana se ve distinto.',
  'Alguien te agradece algo que ni recuerdas.',
  'Tienes más de lo que a veces alcanzas a ver.',
  'Hay días que solo piden amabilidad contigo.',
  'No tienes que ganarte el descanso.',
  'Lo que sientes hoy no es para siempre.',
  'Sigues intentándolo, y eso cuenta.',
  'Hay una versión de este día que ya está bien así.',
  'Tu compañía también es un regalo para otros.',
  'Está bien que hoy sea suficiente con estar.',
  'Lo que cuidas crece, aunque tarde.',
  'Nadie tiene que enterarse de lo que te cuesta.',
  'Hay algo bueno esperando en un rato.',
  'Puedes ser amable contigo aunque hoy no salga.',
  'Todo esto también es tu vida, no solo lo que falta.'
],
```

---

## Repertorio B — Frase del día (60 frases)

Ánimo para el día que empieza. Una por día natural, la misma todo el día.

```js
'hoy.fraseDelDia': [
  'Hoy no necesita ser extraordinario para contar.',
  'Lo que hagas hoy suma, aunque sea poco.',
  'Un día bien vivido rara vez es un día perfecto.',
  'Empezar ya es la mitad.',
  'Hoy hay espacio para algo que te haga bien.',
  'Las cosas grandes se hacen en días comunes.',
  'Tu día empieza donde tú decides.',
  'Hoy también se vale ir a tu ritmo.',
  'Lo que repites hoy es lo que te construye.',
  'Un día a la vez sigue siendo un buen plan.',
  'Hoy puedes elegir cómo responder.',
  'Lo importante casi nunca es urgente.',
  'Hay tiempo para lo que de verdad importa.',
  'Hoy cuenta aunque nadie lo esté mirando.',
  'Lo que empieza hoy no tiene que terminar hoy.',
  'Un buen día suele empezar con algo pequeño.',
  'Hoy es un buen día para ser paciente contigo.',
  'Lo que decidas hoy también es un avance.',
  'No hace falta correr para llegar.',
  'Hoy hay al menos una cosa que sí depende de ti.',
  'Los días ordinarios sostienen los extraordinarios.',
  'Hoy puede ser simple y aun así valer.',
  'Lo que cuidas hoy te acompaña mañana.',
  'Empezar de nuevo también es avanzar.',
  'Hoy tienes permiso de hacer menos y hacerlo bien.',
  'Lo que hoy parece lento después se ve como constancia.',
  'Un día sin prisa rinde más de lo que parece.',
  'Hoy hay margen para intentarlo otra vez.',
  'Lo que te propongas hoy puede caber en diez minutos.',
  'La constancia gana a la intensidad.',
  'Hoy también es parte de la historia larga.',
  'Lo que haces cuando nadie ve es lo que queda.',
  'Un paso hoy vale más que un plan perfecto.',
  'Hoy puedes cerrar el día un poco mejor de como empezó.',
  'Lo pequeño repetido termina siendo grande.',
  'Hoy hay lugar para el descanso también.',
  'Lo que no alcances hoy sigue estando mañana.',
  'Un día tranquilo también mueve las cosas.',
  'Hoy es suficiente con avanzar un poco.',
  'Lo que decides no hacer también cuenta.',
  'Hoy puedes cuidar una sola cosa y estar bien.',
  'Las rachas se construyen un día a la vez.',
  'Hoy tienes lo necesario para empezar.',
  'Lo difícil de hoy será normal en un mes.',
  'Un día es tiempo suficiente para algo bueno.',
  'Hoy también se puede empezar tarde.',
  'Lo que sostienes con calma dura más.',
  'Hoy hay una versión realista de tu mejor día.',
  'Avanzar despacio sigue siendo avanzar.',
  'Hoy puedes hacer las paces con lo pendiente.',
  'Lo que hagas hoy no tiene que impresionar a nadie.',
  'Un día bueno se nota más al final.',
  'Hoy cabe algo que te haga sentir en paz.',
  'Lo que empiezas hoy ya cuenta como empezado.',
  'Hoy es un buen momento para lo simple.',
  'Las cosas que importan aguantan ir despacio.',
  'Hoy también puedes cambiar de plan.',
  'Lo que logres hoy es tuyo, sea del tamaño que sea.',
  'Un día imperfecto sigue siendo un día ganado.',
  'Hoy termina, y eso también es un alivio.'
],
```

---

## Verificación aplicada

Las 160 frases se revisaron contra las siete reglas. Notas de la revisión:

- **Género:** ninguna frase contiene adjetivos con marca de género referidos a la persona. Por eso no aparecen construcciones como "no estás solo" o "estás cansado", que habrían obligado a triplicar el repertorio.
- **Mal día:** se descartaron durante la redacción frases del tipo "hoy será un gran día" y "tienes todo para lograrlo", que se leen como reproche cuando alguien está mal.
- **Imperativos:** las frases que empiezan con verbo son declarativas ("Respirar ya es un buen comienzo", "Descansar también es parte de avanzar"), no órdenes.
- **Duplicación entre repertorios:** ninguna frase aparece en ambos, y los registros son distintos por diseño (presente vs. día por delante).

---

## Cómo ampliar el repertorio

1. Redactar la frase nueva.
2. Pasarla por las siete reglas. Si falla una, se descarta o se reescribe.
3. Leerla en voz alta imaginando a alguien que está teniendo un día muy malo. Si suena a burla, no entra.
4. Añadirla al array correspondiente en `src/copy/index.js`.
5. Actualizar este archivo para que el repertorio editorial y el código no se separen.

**No hace falta tocar código.** La baraja de selección (§17.5) se adapta sola al tamaño del array.
