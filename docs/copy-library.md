# Copy Library — Strivo

**Fecha:** 4 ago 2026 (v3 del blueprint)  
**Fuente:** §3.7–3.11 + Anexo B del blueprint  
**Uso:** copiar estos strings exactamente a la interfaz. Cambios de redacción requieren aprobación de producto.

**Reglas al usar:**
1. ✅ Tuteo, cálido, cercano.
2. ✅ Brevedad sin frialdad.
3. ❌ Sin "Felicidades", "¡Muy bien!", exclamaciones.
4. ❌ Sin "Fallaste", "incumpliste", "debería", léxico de juicio.
5. ❌ Sin emojis salvo los 24 de la tabla de emociones (§3.9).
6. ❌ Sin "racha", "streak". Usar "Constancia", "días contigo".
7. ✅ Si el string cambia según el género, se escribe en tres variantes (ver §0).

---

## 0. Lenguaje adaptativo por género

Strivo le habla a cada persona en su propio género. No con barras para todos, sino
con la forma correcta cuando se sabe cuál es, y con una redacción **naturalmente
neutra** cuando no.

En P2A se pregunta el género. De ahí sale `profile.gender`
(`masculino` · `femenino` · `prefiero_no_contestar` · `otro` · `null`) y de ahí el
modo que consume el copy:

| `gender` | modo |
|---|---|
| `masculino` | `m` |
| `femenino` | `f` |
| `prefiero_no_contestar` · `otro` · sin respuesta | `n` |

**Cómo se escribe un string con variantes** (`src/copy/index.js`):

```js
'onboarding.p4.chip.cuidado': {
  m: 'cuida de sí mismo.',
  f: 'cuida de sí misma.',
  n: 'se cuida.',
}
```

Los strings que no cambian se quedan como texto plano. Tres copias idénticas solo
ensucian la biblioteca.

**Reglas de redacción de la variante `n`:**

1. ❌ Nunca "elle" ni sus derivados.
2. ❌ Nunca la "e" inclusiva, la "@" ni la "x" (`todes`, `amig@s`, `nosotrxs`).
3. ✅ Reformular para que el género no aparezca:
   - "alguien que cuida de sí mismo/a" → **"alguien que se cuida."**
   - "estoy orgulloso/a" → **"siento orgullo."**
   - "estoy listo/a" → **"ya está."** / **"puedo empezar."**
4. ⚠️ `mismo/a`, `listo/a` solo cuando la reformulación suene forzada. Es el último
   recurso, no el primero.
5. La variante `n` nunca debe leerse como una omisión: suena tan intencional como
   las otras dos.

**En código:** se consume con `useCopy()`, nunca leyendo `copy[...]` a mano. El modo
vive en un estado global reactivo, así que cambiar el género desde Ajustes reescribe
lo que está en pantalla sin recargar la app.

`npm run lint:copy` verifica las reglas 1 y 2 y que toda entrada con variantes
declare las tres claves.

El copy escrito antes de este sistema (emociones, rituales, diario) sigue en género
fijo: el inventario de lo que falta convertir está en `docs/gender-audit.md`.

---

## 1. Bienvenidas y saludos

### Onboarding

```
Apertura (los 5 s previos a P1):
"Respira."
[Entrar]   ← salida explícita, aparece a los 1.5 s

Pantalla P1 (Bienvenida):
"Tu lugar para volver a ti."
"Tres minutos para respirar, reconocer lo que sí lograste y seguir adelante con más calma."
[Empezar]

Pantalla P2 (Nombre):
"Solo tu nombre. Nada más."
"Es para saludarte. Puedes dejarlo en blanco."

Pantalla P2A (Género):
"¿Con qué género te identificas?"
"Solo lo usamos para hablarte como te corresponde."
- Masculino · Femenino · Prefiero no contestar · Otro
(Una sola respuesta. Continuar espera a que haya una; "Prefiero no contestar"
 es la salida sin fricción. El subtítulo no se acorta: es lo que convierte un
 campo de formulario en un gesto de atención.)

Pantalla P3 (Qué te gustaría encontrar aquí):
"¿Qué te gustaría encontrar aquí?"
"Elige todo lo que resuene contigo. Puedes seleccionar varias opciones."
- Terminar el día con más paz          (id: paz)
- Sentir que sí estoy avanzando        (id: avance)
- Volver a escucharme                  (id: escucha)
- Dormir con la mente más tranquila    (id: sueno)
- Construir hábitos que realmente duren (id: habitos)
- Tener un espacio solo para mí        (id: espacio)
- Otro                                 (id: otro → revela campo)
Campo de "Otro": "¿Qué buscas?" · máx. 80 · contador desde el carácter 65
(Se puede avanzar sin elegir nada, en silencio. Ninguna opción lleva marca
 de género: funcionan igual en los tres modos.)

Pantalla P4 (Identidad central):
"La persona que quieres ser se construye un día a la vez."
(cursiva) "No busques la frase perfecta. Solo escribe algo que quieras recordar
cuando abras Strivo."
[prefijo visible] "Soy alguien que..."

Sugerencias (chips; se tocan y el campo sigue editable):
- cuida de sí mismo. / cuida de sí misma. / neutro: "se cuida."   (id: cuidado)
- encuentra paz incluso en días difíciles.                         (id: paz)
- cumple lo que se promete.                                        (id: promesa)
- vive con intención.                                              (id: intencion)
- aprende de cada experiencia.                                     (id: aprendizaje)
- celebra sus pequeños avances.                                    (id: avances)
- Otro  → limpia el campo y le da el foco

Bajo el botón primario, con la jerarquía más baja de la pantalla:
"Esta frase será un recordatorio silencioso de la persona en la que quieres
convertirte."

(La frase se guarda sin el punto final: el resto de la app la interpola después
 de "alguien que". Se puede dejar en blanco, sin ninguna advertencia.)

Pantalla P4B (Áreas):
"Elige dónde quieres poner más atención ahora."
"No tienes que abarcarlo todo."
"Elige hasta 3 áreas."            ← tercer nivel: información operativa
(Solo lector de pantalla) "{n} de 3 áreas elegidas"
Etiquetas: Salud · Trabajo · Relaciones · Finanzas · Espiritualidad ·
Crecimiento personal · Creatividad
(Etiquetas visibles. Los `id` internos no cambian: `espiritual` y `personal`.)
Al tocar una cuarta: la instrucción pulsa. Ni error, ni aviso, ni sacudida.

Fuera del onboarding, al intentar activar una cuarta área:
"Puedes enfocarte en 3 áreas a la vez. Elige cuál sueltas para hacerle espacio
a esta."
(El verbo es "soltar": nada se pierde.)

Transición T-4B (entre P4B y P4C, solo si hay ≥ 1 área):
"Elegiste dónde quieres crecer. Ahora pongámosle una dirección."
[Continuar]  ← invisible hasta recibir el foco; para teclado y lector

Pantalla P4C (Identidad por área) — una área por pantalla:
"{Área} · {n} de {total}"
"En {Área}, quiero ser alguien que…"   ← nunca "soy alguien que…"
"Algunas ideas"
"No busques la frase perfecta. Solo una dirección que se sienta tuya."
[Siguiente] / [Listo] en la última
"Omitir por ahora"                     ← omite solo el área actual

Ideas por área (4 por área, resueltas por `id` interno):
- salud: cuida su cuerpo con cariño · hace espacio para descansar ·
  se mueve porque le hace bien · escucha lo que necesita
- trabajo: trabaja con intención · pone límites cuando los necesita ·
  confía en sus capacidades · hace bien lo importante sin exigirse perfección
- relaciones: está presente para las personas que ama · expresa lo que siente ·
  cuida sus relaciones importantes · sabe poner límites con cariño
- espiritual: hace espacio para su vida espiritual · vive con más gratitud ·
  conecta con lo que cree · cultiva momentos de reflexión
- personal: aprende algo nuevo sin prisa · se trata con la misma amabilidad que
  a los demás · se anima a intentar cosas que le dan nervios · hace las paces
  con sus errores
- finanzas: sabe en qué se le va el dinero · gasta en lo que de verdad le
  importa · guarda algo para su tranquilidad · toma decisiones de dinero con
  calma
- creatividad: hace cosas solo porque le gustan · se da permiso de empezar mal ·
  guarda tiempo para crear · se deja llevar por su curiosidad

(Todas en tercera persona, sin marca de género: no necesitan variantes.
 Finanzas nunca menciona montos, plazos, deuda ni "controlar".)

Pantalla P11 (Cierre onboarding):
"Te estás convirtiendo en alguien que crece, en tu salud y en tu trabajo.
Nos vemos mañana a las 6:45."
```

### Apertura de sesión (§17)

Lo primero que se lee al abrir la app, antes de cualquier pendiente.

```
[una frase del Repertorio A]   ← 100 frases en docs/frases.md
[Entrar]                       ← para teclado y lector de pantalla
```

La frase sale por baraja: no se repite hasta agotar el repertorio, y el estado
sobrevive a cerrar la app. Aparece en arranque en frío o tras 30 min fuera, y
como mucho una vez por hora. Nunca justo después del onboarding.

### Navegación principal (§19)

```
Hoy · Journal · Hábitos · Tú
```

### Cabecera de "Hoy" (§20)

```
[tarjeta con la frase del día]  ← 60 frases en docs/frases.md, Repertorio B
                                   una por día natural, la misma todo el día
[ Mañana ]  [ Noche ]           ← las dos secciones, disponibles siempre
```

Retirado en esta parte: los saludos por franja ("Tu día está en curso.").
Informaban de algo que la persona ya sabe y devolvían su identidad como
marcador de progreso.

### Saludos dinámicos (por franja horaria) — retirados

Los saludos por franja se retiraron de la app en §20: informaban de algo que la
persona ya sabe y le devolvían su identidad como marcador de progreso. En su
lugar, "Hoy" abre con la frase del día, que no habla de su desempeño.

El saludo con nombre del ritual de la mañana sigue existiendo
(`ritualManana.r2.greetingTemplate`); es otro momento y otra intención.

---

## 2. Rituales

### Ritual de Mañana

```
R1 (Respiración):
"Respira conmigo"
[Pausa 6 segundos]

R2 (Bienvenida dinámica):
"Te espera tu día"
(Si ánimo bajo ayer:) "Ayer fue difícil. Hoy es nuevo."

R3 (Identidad + Área del día):
"Te estás convirtiendo en alguien que crece.
Hoy toca sobre todo: ● Salud
(alguien que cuida su cuerpo)
Y estás cultivando: leer antes de dormir (día 8 de 21)"

R4 (Hábitos):
[Checklist de hábitos]
"2 de 3"
[Completar] → "Ritual completo. Buen comienzo." (sin confeti)

R5 (Intención):
"¿Cómo quieres vivir hoy?"
[Campo de texto abierto]

[Botón] "Comenzar mi día"
[Enlace] "Hoy voy con prisa" (ruta express)
```

### Ritual de Noche

```
N1 (Respiración):
"Respira conmigo"
[Pausa 6 segundos]

N2 (Revisión de hábitos):
"¿Qué hábitos completaste?"
[Checklist — heredado de mañana, editable]

N3 (Logros no planeados):
"¿Algo más de lo que hoy estés orgulloso?"
[Campo de texto]

N4 (Agradecimientos):
"¿Qué agradeces de hoy?"
[3 campos dinámicos, crecen al escribir, máx 10]
[Emojis de 24 de la paleta]
Sugerencias tras 6s: "Tu familia · Tu cuerpo · Este momento"

N5 (Reflexión):
"¿Qué fue lo menos difícil de hoy?" (rotación de preguntas)
(Alt:) "¿Qué intentarías diferente mañana?"
[Campo de texto]

N6 (Ánimo de cierre):
"¿Cómo te vas a dormir?"
5 estados: Tranquilo · Pensativo · Cansado · Inquieto · Otro
Chips de matiz debajo (contraste con cómo entraste al día)

N7 (Checklist de hábitos noche):
[Checklist de hábitos nocturnos]
"1 de 2"

N8 (Síntesis y cierre):
[Datos reales: agradecimientos, logros]
"Hoy agradeciste 3 cosas. Lograste 2."
[Frase variable por ánimo]
"En paz con tu día."
[Animación de luz: 900ms]
"Buenas noches."
[Pantalla se atenúa a negro]

[Si nada escrito:]
"Hoy solo viniste. También cuenta."
```

---

## 3. Vistas de Diario

### Vista de Mañana — Bloque por bloque

```
Bloque 1 — Frase del día:
"Te estás convirtiendo en alguien que {identidad}."
"Hoy quieres vivirlo así: {intención}"

Bloque 2 — Agradecimientos (§21):
"¿Qué agradeces?"
[campo] "Algo por lo que dar gracias…"
Sugerencias por campo, a los 5 s con el foco puesto y sin escribir:
  tu familia · tu cuerpo · este momento · el silencio · lo que tienes
(Sin encabezado: cinco chips bajo un campo vacío se explican solos, y una
 etiqueta añadiría una voz más. En el ritual de noche siguen saliendo a los
 6 s, con "Si no sale solo:".)

Bloque 3 — Emociones (§22):
"¿Cómo me quiero sentir hoy?"
"Elige las emociones que quieres cultivar"
🦁 Orgulloso/a de mí (n: Con orgullo de mí)   🙏 Agradecido/a (n: Con gratitud)
💗 Amado/a          🤝 Acompañado/a (n: Con compañía)
🕊️ Conectado/a con Dios (n: Cerca de Dios)   🌱 Próspero/a (n: En abundancia)
☮️ En paz            ⚡ Con energía          😊 Alegre
🌊 Sereno/a (n: Con serenidad)               🦋 Confiado/a (n: Con confianza)
🌸 Pleno/a (n: En plenitud)                  💡 Inspirado/a (n: Con inspiración)
🔥 Poderoso/a (n: Con fuerza)                ✨ Radiante
+ Otra  → campo de 30 caracteres, sin emoji
(Solo lector de pantalla) "{n} de 3 emociones elegidas"
"¿Qué necesitas para lograrlo?"

(Once de las quince llevan variante de género. "Amado/a" es la ÚNICA entrada
 con barra en todo el producto: cualquier reformulación neutra desplaza el
 significado. Excepción autorizada; no se extiende.
 Retiradas: irritable, abrumado, nostálgico y las demás negativas. La pregunta
 es qué se quiere cultivar, no cómo se está.)

Bloque 4 — El gran día (§23):
"¿Qué haría que hoy sea un gran día?"
[campo] "Imagina tu día ideal"
(Un ideal es fácil de fallar; una condición concreta se reconoce cuando ocurre.
 La pregunta aterriza y el marcador abre, a propósito en direcciones contrarias.)

Bloque 5 — Victorias (§24):
"Tres victorias que quisiera conseguir hoy"
[campo] "Una victoria que quiero lograr hoy…"
El área se deduce del texto y se muestra como una etiqueta diminuta; tocarla
la retira. Sin selector, y sin etiqueta cuando no hay una respuesta clara.
Retirado: "¿Dónde vive esto?"

Bloque 6 — El cierre de la mañana (§25):
[tarjeta] "Tu ritual de la mañana"
          "2 de 5 completados"  ·  "Completado" cuando ya están todos
(Sin hábitos configurados no aparece la línea de progreso: "0 de 0" sería un
 reproche. Lleva a la pestaña "Hábitos", donde se registran.)
```

### Vista de Noche — Bloque por bloque

```
ENCABEZADO:
Saludo dinámico ("Buenas noches. Cerremos el día.")

BLOQUE 1 (Victorias de la mañana — heredadas):
"¿Qué lograste de esto?"
[Victorias de la mañana + opciones "Lo lograste / No se dio"]
[Sub-opción: "Pasarla a mañana" / "Dejarla ir"]

BLOQUE 2 (Logros no planeados):
"¿Algo más?"
[Campo abierto]

BLOQUE 3 (Agradecimientos):
"¿Qué agradeces de hoy?"
[Dinámicos como la mañana, máx 10]

BLOQUE 4 (Aprendizaje):
"¿Qué fue lo menos difícil de hoy?" (rotación)
(Alt:) "¿Qué intentarías diferente mañana?"
[Campo abierto, encuadre de curiosidad, no crítica]

BLOQUE 5 (Cómo me voy a dormir):
"¿Cómo te vas a dormir?"
[5 estados + chips de matiz]

BLOQUE 6 (Checklist Ritual):
[Hábitos nocturnos]

CIERRE:
"Hoy agradeciste 3 cosas. Lograste 2."
[Frase variable: "En paz con tu día." / "Descansarás."]
[Recorrido de luz 900ms]
"Buenas noches."
[Pantalla → negro]

[Si nada escrito:]
"Hoy solo viniste. También cuenta."
```

---

## 4. Hábitos

### Crear/Editar

```
Pantalla H3:
"¿Cuál es tu nuevo hábito?"
[Campo: nombre]
[Chips de área]
[Selector: Mañana / Noche / A lo largo del día]
[Días de la semana, default all]
[Opcional: hora de recordatorio]

Sugerencias por área:
- Salud: "Beber agua", "Estirar", "Dormir", "Mover", "Respirar"
- Trabajo: "Revisar inbox", "Escribir 1 idea", "Revisar feedback", "Pausar"
- Relaciones: "Mensajear a alguien", "Llamada sin agenda", "Atención presente"
```

### Detalle y Validación

```
Pantalla H2:
[Nombre del hábito]
[Área + identidad de área]
"En Salud eres alguien que cuida su cuerpo"
[Momento]
[Días]
"Lo has hecho 47 veces"
"18 de los últimos 30 días"
[Cuadrícula 90 días — puntos llenos/vacíos, NUNCA rojo]

Acciones:
[Editar] [Cambiar área] [Pausar] [Archivar]
```

### Pausar

```
"Pausado. Aquí estará cuando lo quieras de vuelta."

[Reanudar]
```

### Vacío

```
"Tu ritual está vacío por ahora. Un solo hábito es un buen comienzo."
[6 sugerencias tocables por área]
```

### Símbolo del hábito (§16 de la Parte 4A)

Cada hábito lleva un símbolo a la izquierda de su nombre. Es **decorativo**: el
lector de pantalla oye el nombre, que es el identificador real.

```
Botón que abre la hoja:  (aria-label) "Elegir símbolo para este hábito"
Título de la hoja:       "Elige un símbolo"
Categorías:              Movimiento · Descanso · Mente · Casa · Comida ·
                         Naturaleza · Símbolos
Cada símbolo:            (aria-label) "Usar {nombre}"
Por defecto:             ✨   ← se puede cambiar; elegir es opcional siempre
```

Los símbolos de las sugerencias de P7 y P8 viven junto a su texto en
`copy.onboarding.p7.suggestions` y `p8.suggestions`. Objetos y naturaleza, nunca
caras ni personas: una cara carga una emoción que puede chocar con cómo se
siente la persona ese día. Uno por hábito, sin repetir dentro de una pantalla.

---

## 5. Journal

### Interfaz

```
Botón primario:
[+] "Escribir"

Entrada vacía:
"¿Qué está en tu mente?"
[Cursor listo]

Búsqueda:
"Buscar en tu journal"
[Etiqueta, ánimo, rango de fechas opcionales]

Seleccionar entrada:
[Vista de entrada]
Botones: [Editar] [Compartir] [Archivar]
```

---

## 6. Insights

### Tipos generales

```
Constancia:
"63 días contigo"
(NO: "63 días seguidos")

Resumen semanal:
"Cinco días esta semana. Tu palabra más repetida: calma."

Palabras frecuentes:
"Lo que más agradeces últimamente: tu familia."

Patrón:
"Los días que sales a caminar sueles irte a dormir más tranquila."

Distribución por áreas:
"Este mes creciste sobre todo en Trabajo (18 logros) y algo en Salud (4). Ambos cuentan."

Foco cambiante:
"Tu foco se movió: antes vivías más en Trabajo, últimamente en Relaciones."

Evidencia de identidad (por área):
"Eres alguien que crece. En Salud lo demostraste 11 de los últimos 14 días."

Evolución de identidad:
"Hace tres meses querías ser alguien disciplinado. Ahora, alguien presente. Cambiaste, y eso está bien."
```

### Reglas

```
✅ Coocurrencia, no causalidad:
"suele", "muchas veces", "en la mayoría de los días en los que"

❌ Nunca causalidad:
"porque", "debido a", "esto causa"

❌ Nunca negativo:
"has bajado", "estás peor", "llevas menos días"

Si hay descenso:
"Este mes escribiste menos. ¿Pasó algo distinto?"
(Solo si el usuario activó "señalarme también lo que baja")
```

### Rechazo de insight

```
[Cada insight tiene un botón]
"No me sirve"
→ Mejora el filtrado para futuros insights
```

---

## 7. Perfil

### Mi identidad

```
Encabezado:
"Quién te estás convirtiendo"

Identidad central (editable):
"Alguien que crece"
[Editar] [Ver historial de versiones]

Áreas activas:
[Chips con color, ícono, nombre]
[+] "Añadir área"
Acciones por área: [Editar] [Pausar] [Archivar]

Para cada área (si tiene identidad de área):
"En Salud eres alguien que cuida su cuerpo"
[Editar]

Compromiso activo:
"Cultivando: leer 21 días (día 8 de 21)"
[Cambiar] [Terminar]
```

### Cancelación de suscripción

```
Pantalla de confirmación:
"¿Seguro que quieres cancelar?"
"Tu historial se queda. La suscripción termina al final del ciclo."
[Cancelar suscripción] [Volver]

NO incluir:
- "¿Nos dices por qué?" (opcional, bajo el botón, no bloqueante)
- "¿Seguro seguro?" (confirmshaming)
- Descuentos/ofertas para reconvertir
```

### Tus datos

```
"Aquí vive tu información"
[Descripción en lenguaje humano, no técnico]

Opciones:
[Descargar mis datos (JSON + PDF)]
[Borrar todo (irreversible)]
```

---

## 8. Estados especiales

### Modo día difícil

```
Activación:
"¿Hoy es un día difícil?"
[Sí] [No]

Efecto:
- Copy compasivo en todos lados
- Sin celebración, sin barras de progreso agresivas
- Cierre simplificado

Ejemplo de copy difícil:
"Hoy no necesitas logros. Solo estar."
"Respira. Mañana es otro día."
"Lo que hagas hoy, aunque sea estar, vale."
```

### Regreso (después de ausencia)

```
Si el usuario no ha registrado en 7+ días:
"Hola de nuevo."
"Tu Constancia sigue intacta. Aquí está todo como lo dejaste."
[Cita del usuario de hace 10 días]
[Comenzar donde lo dejaste]

❌ NO mencionar días ausentes
❌ NO contar racha rota
```

### Aviso de contenido sensible

```
Detección local (en dispositivo):
[Tarjeta no bloqueante]
"Detectamos contenido delicado en tu entrada."
"Aquí encontrarás recursos de {país}:"
[Enlaces a números de teléfono, sitios locales]
[Cerrar]
```

---

## 9. Errores y recuperación

### Patrón general

```
[Ícono de error — clay (#C9836B), NO rojo]
"Algo no salió como esperaba"
"Hemos guardado lo que escribiste. Intenta de nuevo:"
[Reintentar] [Contactarnos]

❌ Nunca código de error
❌ Nunca jerga técnica ("socket timeout", "connection refused")
```

### Específicos

```
Sin conexión:
"Estamos offline. Guardamos todo en tu teléfono y sincronizaremos cuando haya red."

Fallo de sincronización:
"No pudimos subir tu último cambio. Pero aquí sigue guardado. Reintentaremos."

Cuenta ya existe:
"Ya existe una cuenta con ese correo. ¿Entramos con ella?"
```

---

## 10. Notificaciones push (locales, desde dispositivo)

```
Nivel 1 (siempre):
Ritual de Mañana: "Buenos días. ¿Cómo quieres sentirte hoy?" — 6:45
Ritual de Noche: "Buenas noches. ¿Cómo cerrar el día?" — 21:00

Nivel 2 (adaptativo, §5.5):
Si el usuario ignora 3× consecutivas, pausar automáticamente.
Si reabre la app, ofrecerlo de nuevo.
Copy: "Vuelvo a ofrecerte el ritual. ¿Sí o no?"

Nivel 3 (hábito individual):
Recordatorio del usuario. Solo el nombre: "Beber agua" — hora elegida

❌ Nunca badge numérico
❌ Nunca contenido del usuario en la notificación
❌ Nunca "¡Mira lo que perdiste!"
```

---

## 11. Onboarding progresivo (días 2–7)

### Al final del ritual cada día

```
Día 2:
"¿Cómo te describes en {área con más actividad}?"
[Opcional: ayudar a enriquecer Insights de esa área]

Día 3:
"¿Has usado apps así antes? ¿Cómo te fue?"
[Ajuste de expectativas y tono]

Día 4:
"¿Prefieres que te hable cálido o directo?"
[Ejemplos lado a lado]
[Ajuste de voz personal]

Día 5:
"¿Qué hábitos ya tienes que quieras registrar?"
[Garantiza victorias tempranas]

Día 6:
"¿Cuánto tiempo quieres dedicarle al día?"
[1 / 3 / 5 minutos]

Día 7:
"¿Quieres poner un foco para las próximas semanas?"
[Activar Compromiso]
```

---

## 12. Paywall (§5.17)

### Argumentación

```
Encabezado:
"Tu historial vale oro"

Beneficios:
[Icono] "Insights avanzados — patrones profundos, temas emergentes"
[Icono] "Biblioteca — artículos y audios para cada momento"
[Icono] "Libro de Vida — tu historia de este año"

Precio:
"99 MXN/mes o 749 MXN/año"
"Primeros 7 días sin cobro"

Botones:
[Prueba gratis] [O sigue gratis]

❌ NO resaltar lo que te pierdes si no pagas
❌ NO urgencia artificial ("¡Oferta termina en 24h!")
```

---

## Validación

Antes de usar cualquier string:

```bash
# Busca léxico prohibido
grep -i "Felicidades\|Fallaste\|Racha\|debería\|incumpl\|abandon" text
```

Si encuentras una palabra que no está en este archivo, **pregunta antes de comitear**.

---

**Última pregunta antes de usar algo:** ¿Este string celebra, anima, reconoce o devuelve evidencia? ✅ Adelante.  
¿Juzga, culpa, castiga o exige? ❌ No.
