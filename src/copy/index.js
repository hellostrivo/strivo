// src/copy/index.js
// Biblioteca de copy de Strivo — fuente única de todos los strings de interfaz
// Fuente: copy-library.md / Blueprint v3, §3.7–3.11 + Anexo B
//
// REGLAS:
// ✅ Tuteo, cálido, breve
// ❌ Sin "Fallaste", "Racha", "Debería", exclamaciones innecesarias
// ❌ Sin emojis del sistema (solo los 24 de la tabla de emociones)
// Cambios de copy → editar AQUÍ, no en los componentes.
//
// VARIANTES DE GÉNERO (§2.3 del documento de cambios):
// Un string que cambia según el género deja de ser string y pasa a ser
// { m, f, n }. Se consume con useCopy(), nunca leyendo copy[...] a mano.
//
//   'algo': { m: 'cuida de sí mismo.', f: 'cuida de sí misma.', n: 'se cuida.' }
//
// La variante `n` se redacta en neutro natural: se reformula la frase para que
// el género no aparezca. "mismo/a" es el último recurso, no el primero. Nunca
// "elle", ni "@", ni "x" como marca de género (lo verifica lint:copy).
// Los strings sin variación se quedan como string plano: tres copias idénticas
// solo ensucian la biblioteca.

export const copy = {

  // ─── Generales ───────────────────────────────────────────────────────────
  appName: 'Strivo',

  // ─── Navegación principal (§19) ──────────────────────────────────────────
  // Cuatro pestañas: los hábitos salen de "Tú", donde estaban a dos toques, y
  // "Tú" se queda con lo que su nombre promete. El extremo es su sitio natural.
  nav: {
    hoy:     'Hoy',
    journal: 'Journal',
    habitos: 'Hábitos',
    tu:      'Tú',
    label:   'Navegación principal',
  },
  // La neutra pierde el "contigo mismo" en vez de partirlo en barras: es la
  // misma promesa y se lee sin tropiezo. Ojo, está duplicada fuera del copy
  // (package.json, el manifiesto de vite.config y el <meta> de index.html), y
  // ahí no hay variantes posibles: esos tres llevan la neutra.
  tagline: {
    m: 'Refugio digital para terminar cada día en paz contigo mismo.',
    f: 'Refugio digital para terminar cada día en paz contigo misma.',
    n: 'Refugio digital para terminar cada día en paz.',
  },

  // ─── Áreas de identidad (§5.1.1) ─────────────────────────────────────────
  // Nombres visibles de cada tipo de área. El orden canónico y el color
  // viven en @lib/areas y @tokens. `areaId = null` significa "General".
  // OJO: estas son las etiquetas visibles. Los `id` internos (las claves) no
  // cambian nunca: están referenciados en hábitos, en HabitLog, en las
  // sugerencias de H3 y en los perfiles ya guardados (§8.4).
  areas: {
    salud:       'Salud',
    trabajo:     'Trabajo',
    relaciones:  'Relaciones',
    finanzas:    'Finanzas',
    espiritual:  'Espiritualidad',      // id `espiritual`, etiqueta nueva
    personal:    'Crecimiento personal', // id `personal`, etiqueta nueva
    creatividad: 'Creatividad',
    // Nombre visible de `areaId = null`: lo que no pertenece a un área concreta
    // hereda la identidad central (§5.1.1)
    general:     'General',
    // Al intentar activar una cuarta área fuera del onboarding (§8.5-bis). Aquí
    // sí se explica: en el onboarding la regla está a la vista y basta con
    // señalarla; en la app instalada no. El verbo es "soltar", no "eliminar":
    // nada se pierde.
    limiteFueraDelOnboarding: 'Puedes enfocarte en 3 áreas a la vez. Elige cuál sueltas para hacerle espacio a esta.',
  },

  // ─── Onboarding ──────────────────────────────────────────────────────────
  onboarding: {
    // Navegación común del flujo (P1 → P11)
    nav: {
      back: 'Atrás',
      continue: 'Continuar',
      progressTemplate: 'Paso {n} de {total}',
    },
    // Apertura: los cinco segundos que separan el ruido de afuera del espacio de
    // adentro (§3.3). Una palabra, ninguna orden: "Inhala" / "Exhala" sería dar
    // instrucciones en el primer segundo de uso.
    apertura: {
      palabra: 'Respira.',
      entrar:  'Entrar',
    },
    p1: {
      // Ya no describe el producto: describe lo que la persona recibe
      subtitle: 'Tu lugar para volver a ti.',
      support: 'Tres minutos para respirar, reconocer lo que sí lograste y seguir adelante con más calma.',
      cta: 'Empezar',
    },
    p2: {
      question: 'Solo tu nombre. Nada más.',
      hint: 'Es para saludarte. Puedes dejarlo en blanco.',
      label: 'Tu nombre',
    },
    // P2A — género. Sirve para hablarle a cada quien en su propio género
    // (§2 y §5 del documento de cambios).
    //
    // El subtítulo hace un trabajo desproporcionado para su tamaño: es lo que
    // convierte un campo de formulario en un gesto de atención. No acortarlo.
    // "Prefiero no contestar" es la salida sin fricción, y está a un toque.
    p2a: {
      question: '¿Con qué género te identificas?',
      hint: 'Solo lo usamos para hablarte como te corresponde.',
      options: {
        masculino:             'Masculino',
        femenino:              'Femenino',
        prefiero_no_contestar: 'Prefiero no contestar',
        otro:                  'Otro',
      },
    },
    // P3 — lo que se viene a buscar. La pregunta pide un deseo, no una
    // justificación: se mira hacia adelante, no hacia lo que está mal (§6.1).
    // El orden y los ids viven en @lib/reasons; aquí solo las etiquetas.
    // Ninguna lleva marca de género: funcionan igual en los tres modos.
    p3: {
      question: '¿Qué te gustaría encontrar aquí?',
      hint: 'Elige todo lo que resuene contigo. Puedes seleccionar varias opciones.',
      options: {
        paz:     'Terminar el día con más paz',
        avance:  'Sentir que sí estoy avanzando',
        escucha: 'Volver a escucharme',
        sueno:   'Dormir con la mente más tranquila',
        habitos: 'Construir hábitos que realmente duren',
        espacio: 'Tener un espacio solo para mí',
        otro:    'Otro',
      },
      // El campo de "Otro" es opcional: se puede dejar vacío y avanzar igual
      otherLabel:           'En tus palabras',
      otherPlaceholder:     '¿Qué buscas?',
      otherCounterTemplate: '{n} de {max}',
    },
    // P4 — la identidad central: la pantalla sobre la que se construye todo lo
    // demás. Las sugerencias sustituyen a los ejemplos rotatorios (§7.2): rotar
    // obliga a esperar a que aparezca el que sirve, y estos además se tocan.
    p4: {
      headline: 'La persona que quieres ser se construye un día a la vez.',
      subhead: 'No busques la frase perfecta. Solo escribe algo que quieras recordar cuando abras Strivo.',
      // No es la etiqueta de un campo: es la primera mitad de la frase
      prefix: 'Soy alguien que...',
      suggestionsLabel: 'Sugerencias',
      // Ids y orden en @lib/identidad. Solo la primera lleva marca de género; en
      // neutro se reformula ("se cuida") en vez de poner barras (§2.5.3).
      chips: {
        cuidado: {
          m: 'cuida de sí mismo.',
          f: 'cuida de sí misma.',
          n: 'se cuida.',
        },
        paz:         'encuentra paz incluso en días difíciles.',
        promesa:     'cumple lo que se promete.',
        intencion:   'vive con intención.',
        aprendizaje: 'aprende de cada experiencia.',
        avances:     'celebra sus pequeños avances.',
      },
      // Limpia el campo y le da el foco: "ninguna de estas, quiero la mía"
      chipOther: 'Otro',
      // Epílogo, no instrucción: por eso va debajo del botón
      closing: 'Esta frase será un recordatorio silencioso de la persona en la que quieres convertirte.',
    },
    // P4B — dónde poner la atención. La frase deja de ser poética y pasa a ser
    // una instrucción amable: aquí lo que hace falta es saber qué hacer (§8.1).
    // El límite de 3 es de producto, no técnico: la pantalla siguiente pide una
    // reflexión por área y más de tres convierte el onboarding en trabajo.
    p4b: {
      question: 'Elige dónde quieres poner más atención ahora.',
      hint: 'No tienes que abarcarlo todo.',
      // Tercer nivel: información operativa, no voz de marca
      limit: 'Elige hasta 3 áreas.',
      // Solo para lector de pantalla: llegar al límite no tiene aviso visual
      countTemplate: '{n} de {max} áreas elegidas',
    },
    // P4C — una área por pantalla. "Quiero ser" y no "soy": afirmar en presente
    // algo que todavía no se cumple genera disonancia y culpa (§10.4).
    p4c: {
      progressTemplate: '{area} · {n} de {total}',
      titleTemplate: 'En {area}, quiero ser alguien que…',
      ideasLabel: 'Algunas ideas',
      useSuggestionTemplate: 'Usar sugerencia: {texto}',
      // Llega justo donde aparece la presión: al decidir si se escribe o no
      pressure: 'No busques la frase perfecta. Solo una dirección que se sienta tuya.',
      skip: 'Omitir por ahora',
      next: 'Siguiente',
      done: 'Listo',
      // Sugerencias por área, resueltas por el `id` interno del área. Sin
      // marca de género en ninguna: funcionan igual en los tres modos (§10.6).
      // Si un área no tuviera las suyas, P4C oculta el bloque entero en vez de
      // ofrecer las de otra.
      ideas: {
        salud: [
          'cuida su cuerpo con cariño',
          'hace espacio para descansar',
          'se mueve porque le hace bien',
          'escucha lo que necesita',
        ],
        trabajo: [
          'trabaja con intención',
          'pone límites cuando los necesita',
          'confía en sus capacidades',
          'hace bien lo importante sin exigirse perfección',
        ],
        relaciones: [
          'está presente para las personas que ama',
          'expresa lo que siente',
          'cuida sus relaciones importantes',
          'sabe poner límites con cariño',
        ],
        espiritual: [
          'hace espacio para su vida espiritual',
          'vive con más gratitud',
          'conecta con lo que cree',
          'cultiva momentos de reflexión',
        ],
        personal: [
          'aprende algo nuevo sin prisa',
          'se trata con la misma amabilidad que a los demás',
          'se anima a intentar cosas que le dan nervios',
          'hace las paces con sus errores',
        ],
        // Sin cifras, sin metas, sin plazos y sin "controlar": el vocabulario
        // financiero por defecto trae vergüenza y rompería la promesa.
        finanzas: [
          'sabe en qué se le va el dinero',
          'gasta en lo que de verdad le importa',
          'guarda algo para su tranquilidad',
          'toma decisiones de dinero con calma',
        ],
        // Disfrute y permiso, nunca productividad creativa ni audiencia
        creatividad: [
          'hace cosas solo porque le gustan',
          'se da permiso de empezar mal',
          'guarda tiempo para crear',
          'se deja llevar por su curiosidad',
        ],
      },
    },
    // T-4B — el respiro entre elegir y reflexionar. Sin él se pasa de tocar
    // tarjetas a escribir sobre uno mismo en menos de un segundo (§9.1).
    t4b: {
      phrase: 'Elegiste dónde quieres crecer. Ahora pongámosle una dirección.',
      // Existe para quien no puede "tocar la pantalla": teclado y lector
      continue: 'Continuar',
    },
    p6: {
      question: '¿Cómo son tus días?',
      hint: 'Para acompañarte a tu ritmo, no al de la app. Lo cambias cuando quieras.',
      wakeLabel: 'Me despierto a las',
      sleepLabel: 'Me duermo a las',
    },
    // P7 y P8 comparten estructura: sugerencias por área + hábitos propios.
    // Las listas son cortas a propósito; el catálogo completo por área vive en
    // habits.suggestions y se ofrece dentro de la app, no en el onboarding.
    p7: {
      question: 'Tu ritual de la mañana',
      hint: 'Elige lo que quieras cultivar. Uno basta para empezar.',
      // Cada hábito con su símbolo (§16.3.A): objetos y naturaleza, uno por
      // hábito y sin repetir dentro de la misma pantalla. Los textos no
      // cambian; el símbolo es lo que se añade.
      suggestions: {
        salud: [
          { texto: 'Beber agua',          emoji: '💧' },
          { texto: 'Estirar',             emoji: '🌿' },
          { texto: 'Caminar 10 min',      emoji: '👟' },
        ],
        trabajo: [
          { texto: 'Revisar prioridades', emoji: '📋' },
          { texto: 'Escribir una idea',   emoji: '💡' },
        ],
        relaciones: [
          { texto: 'Mensajear a alguien', emoji: '💬' },
        ],
        finanzas: [
          { texto: 'Revisar gastos',      emoji: '🧾' },
        ],
        espiritual: [
          { texto: 'Meditar',             emoji: '🕯️' },
          { texto: 'Tiempo en silencio',  emoji: '🕊️' },
        ],
        personal: [
          { texto: 'Leer 10 páginas',     emoji: '📖' },
          { texto: 'Aprender algo nuevo', emoji: '🌱' },
        ],
        creatividad: [
          { texto: 'Crear algo pequeño',  emoji: '🎨' },
        ],
        general: [
          { texto: 'Beber agua',          emoji: '💧' },
          { texto: 'Respirar',            emoji: '☁️' },
          { texto: 'Estirar',             emoji: '🌿' },
          { texto: 'Escribir una idea',   emoji: '💡' },
        ],
      },
      otherPlaceholder: 'Un hábito para la mañana',
    },
    p8: {
      question: 'Tu ritual de la noche',
      hint: 'Lo que te ayuda a cerrar el día. También puede quedarse vacío.',
      suggestions: {
        salud: [
          { texto: 'Dormir a tiempo',          emoji: '🌙' },
          { texto: 'Estirar',                  emoji: '🌿' },
        ],
        trabajo: [
          { texto: 'Dejar mañana preparado',   emoji: '📋' },
        ],
        relaciones: [
          { texto: 'Dar las gracias a alguien', emoji: '💌' },
          { texto: 'Escuchar de verdad',        emoji: '🎧' },
        ],
        finanzas: [
          { texto: 'Anotar un gasto',          emoji: '🧾' },
        ],
        espiritual: [
          { texto: 'Agradecer en voz alta',    emoji: '🕊️' },
          { texto: 'Meditar',                  emoji: '🕯️' },
        ],
        personal: [
          { texto: 'Leer 10 páginas',          emoji: '📖' },
          { texto: 'Escribir',                 emoji: '✏️' },
        ],
        creatividad: [
          { texto: 'Dibujar',                  emoji: '🎨' },
          { texto: 'Tocar',                    emoji: '🎵' },
        ],
        general: [
          { texto: 'Guardar el teléfono',      emoji: '📱' },
          { texto: 'Respirar',                 emoji: '☁️' },
          { texto: 'Leer 10 páginas',          emoji: '📖' },
        ],
      },
      otherPlaceholder: 'Un hábito para la noche',
    },
    // Comunes a P7 y P8 (mismo componente de selección)
    habitos: {
      other: 'Otro…',
      otherLabel: 'En tus palabras',
      otherAdd: 'Añadir',
      otherRemoveTemplate: 'Quitar {habito}',
    },
    p9: {
      question: '¿Quieres que te avise?',
      hint: 'Dos avisos al día, a las horas que elegiste. Nada más.',
      previewTemplate: '{hora} · {texto}',
      activate: 'Activar recordatorios',
      skip: 'Ahora no',
      granted: 'Listo. Te avisaremos a esas horas.',
      denied: 'Tu dispositivo no dio permiso. Puedes activarlo después desde Ajustes.',
      unsupported: 'Este dispositivo no tiene avisos. Strivo funciona igual.',
    },
    p10: {
      question: 'Tu historial, contigo.',
      hint: 'Lo que escribes vive en tu dispositivo. La cuenta solo lo respalda y lo lleva contigo a donde vayas.',
      google: 'Continuar con Google',
      apple: 'Continuar con Apple',
      email: 'Usar mi correo',
      emailLabel: 'Tu correo',
      passwordLabel: 'Una contraseña',
      passwordHint: 'Ocho caracteres o más.',
      create: 'Crear cuenta',
      emailExists: 'Ya existe una cuenta con ese correo. Prueba con tu contraseña de siempre.',
      skip: 'Ahora no',
      ready: 'Tu cuenta está lista.',
      // Sin cuenta no se bloquea nada (RN-07): se dice así, sin insistir
      skipNote: 'Sin cuenta también funciona todo. La puedes crear después.',
    },
    p11: {
      // Template: "Te estás convirtiendo en alguien que {identidad}, en tu {área1} y en tu {área2}."
      closingTemplate: 'Te estás convirtiendo en alguien que {identidad}.',
      closingWithAreas: 'Te estás convirtiendo en alguien que {identidad}, en tu {areas}.',
      // Sin frase todavía (P4 se puede dejar en blanco): el cierre no la echa
      // de menos ni la reclama. Ya habrá día.
      closingPlain: 'Aquí empieza tu espacio.',
      closingPlainWithAreas: 'Aquí empieza tu espacio, en tu {areas}.',
      nextTemplate: 'Nos vemos mañana a las {hora}.',
      areasJoin: ' y ',
      ctaLabel: 'Entrar a Strivo',
    },
  },

  // ─── Apertura de sesión (§17) ─────────────────────────────────────────────
  // Lo primero que se lee al abrir la app, antes de cualquier pendiente.
  // Gratitud y amabilidad; miran al presente y a lo que ya hay.
  //
  // Repertorio editorial y reglas de redacción: docs/frases.md. Ampliar es
  // añadir una línea: la baraja (@lib/frases) se adapta sola al tamaño.
  //
  // No confundir con `onboarding.apertura`, que es la palabra única de los
  // cinco segundos previos a P1 y ocurre una sola vez en la vida.
  apertura: {
    // Salida explícita para quien no puede "tocar la pantalla" (§17.8)
    entrar: 'Entrar',
    frases: [
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
      'Todo esto también es tu vida, no solo lo que falta.',
    ],
  },

  // ─── Pantalla de inicio (§20) ─────────────────────────────────────────────
  hoy: {
    seccion: {
      manana: 'Mañana',
      noche:  'Noche',
    },

    // §21 — la ayuda aparece cuando hace falta, y hace falta cuando alguien
    // mira el campo sin escribir. Fijas eran decoración permanente y, peor, una
    // respuesta prefabricada que se lee antes de pensar.
    gratitud: {
      sugerencias: ['tu familia', 'tu cuerpo', 'este momento', 'el silencio', 'lo que tienes'],
      usarTemplate: 'Usar sugerencia: {texto}',
    },

    // §22 — la pregunta es qué se quiere cultivar, no cómo se está. Por eso no
    // hay ninguna emoción negativa: ofrecer "irritable" como algo a cultivar no
    // tiene sentido. La primera persona alinea el bloque con la voz de la
    // identidad central ("Soy alguien que…"): la app habla COMO la persona.
    emociones: {
      titulo: '¿Cómo me quiero sentir hoy?',
      subtitulo: 'Elige las emociones que quieres cultivar',
      countTemplate: '{n} de {max} emociones elegidas',
      otraLabel: 'En tus palabras',
      otraPlaceholder: 'Una emoción tuya',
      otraAdd: 'Añadir',
      // Ids, orden y emojis en @lib/emociones. Once llevan variante de género:
      // sin ellas, media lista le hablaría mal a media gente en la pantalla más
      // emocional del ritual.
      opciones: {
        orgullo:     { m: 'Orgulloso de mí',    f: 'Orgullosa de mí',    n: 'Con orgullo de mí' },
        gratitud:    { m: 'Agradecido',         f: 'Agradecida',         n: 'Con gratitud' },
        // La única entrada con barra en todo el producto: toda reformulación
        // neutra desplaza el significado ("Con amor" es sentir amor hacia
        // otros, no sentirse querido). Excepción autorizada, no se extiende.
        amor:        { m: 'Amado',              f: 'Amada',              n: 'Amado/a' },
        compania:    { m: 'Acompañado',         f: 'Acompañada',         n: 'Con compañía' },
        fe:          { m: 'Conectado con Dios', f: 'Conectada con Dios', n: 'Cerca de Dios' },
        prosperidad: { m: 'Próspero',           f: 'Próspera',           n: 'En abundancia' },
        paz:         'En paz',
        energia:     'Con energía',
        alegria:     'Alegre',
        serenidad:   { m: 'Sereno',             f: 'Serena',             n: 'Con serenidad' },
        confianza:   { m: 'Confiado',           f: 'Confiada',           n: 'Con confianza' },
        plenitud:    { m: 'Pleno',              f: 'Plena',              n: 'En plenitud' },
        inspiracion: { m: 'Inspirado',          f: 'Inspirada',          n: 'Con inspiración' },
        poder:       { m: 'Poderoso',           f: 'Poderosa',           n: 'Con fuerza' },
        radiante:    'Radiante',
        otra:        { m: 'Otro',               f: 'Otra',               n: 'Otra emoción' },
      },
    },

    // §23 — un ideal es difícil de alcanzar y fácil de fallar; una condición
    // concreta se reconoce cuando ocurre. La pregunta aterriza y el marcador
    // abre, a propósito en direcciones contrarias.
    granDia: {
      pregunta: '¿Qué haría que hoy sea un gran día?',
      placeholder: 'Imagina tu día ideal',
    },

    // §24 — "victorias", la misma palabra que usa el ritual de noche, y
    // "quisiera", que deja espacio a que no pase sin que sea un fracaso.
    victorias: {
      titulo: 'Tres victorias que quisiera conseguir hoy',
      quitarAreaTemplate: 'Quitar la etiqueta de {area}',
    },

    // §25 — después de decidir cómo quieres sentirte y qué victorias quieres,
    // el paso siguiente es ir a hacerlo.
    ritualManana: {
      cta: 'Tu ritual de la mañana',
      progreso: '{completados} de {total} completados',
      completado: 'Completado',
    },
    // Una por día natural, la misma todo el día. Repertorio distinto al de la
    // apertura: aquel mira al presente, este al día por delante. Si se mezclaran,
    // la misma frase saldría dos veces con dos minutos de diferencia.
    fraseDelDia: [
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
      'La constancia se construye un día a la vez.',
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
      'Hoy termina, y eso también es un alivio.',
    ],
  },

  // ─── Rituales ─────────────────────────────────────────────────────────────
  // Navegación común a los dos rituales (el onboarding tiene la suya aparte)
  ritual: {
    nav: {
      back: 'Atrás',
      continue: 'Continuar',
      close: 'Cerrar',
      progressTemplate: 'Paso {n} de {total}',
    },
  },

  ritualManana: {
    // Nombre accesible del overlay y vuelta desde Hoy
    title: 'Ritual de la mañana',
    reopen: 'Volver al ritual',
    r1: {
      prompt: 'Respira conmigo',
      duration: '6 segundos',
      breatheIn: 'Inhala',
      breatheOut: 'Exhala',
    },
    r2: {
      normal: 'Te espera tu día',
      difficultDay: 'Ayer fue difícil. Hoy es nuevo.',
      greetingTemplate: 'Buenos días, {nombre}.',
    },
    r3: {
      template: 'Te estás convirtiendo en alguien que {identidad}.',
      areaLabel: 'Hoy toca sobre todo:',
      areaIdentityTemplate: 'alguien que {identidad}',
      commitmentLabel: 'Y estás cultivando:',
      commitmentDays: '(día {n} de {total})',
      editLink: 'Cambiar esto',
    },
    r4: {
      title: 'Tus hábitos de la mañana',
      progressTemplate: '{hecho} de {total}',
      complete: 'Ritual completo. Buen comienzo.',
      empty: 'Tu ritual de la mañana está libre. ¿Quieres añadir algo?',
    },
    r5: {
      question: '¿Cómo quieres vivir hoy?',
      placeholder: 'Una intención para el día',
    },
    cta: 'Comenzar mi día',
    ctaExpress: 'Hoy voy con prisa',
  },

  ritualNoche: {
    title: 'Ritual de la noche',
    reopen: 'Volver al ritual',
    n1: {
      prompt: 'Respira conmigo',
      duration: '6 segundos',
      breatheIn: 'Inhala',
      breatheOut: 'Exhala',
    },
    n2: {
      question: '¿Qué hábitos completaste?',
      progressTemplate: '{hecho} de {total}',
      complete: 'Ritual completo.',
      empty: 'Tu ritual de la noche está libre. ¿Quieres añadir algo?',
    },
    // Las victorias heredadas y los logros no planeados comparten pantalla, como
    // en la Vista de Noche: las etiquetas de cada acción viven en diarioNoche.
    // Las etiquetas de cada acción (decidir, añadir, quitar) viven en diarioNoche:
    // son las mismas en el ritual y en la Vista de Noche.
    n3: {
      question: '¿Qué lograste hoy?',
    },
    n4: {
      question: '¿Qué agradeces de hoy?',
      placeholder: 'Algo de hoy…',
      // Aparecen a los 6s sin escribir, como una mano tendida, no como una tarea
      suggestionsLabel: 'Si no sale solo:',
      max: 10,
    },
    n5: {
      placeholder: 'Con curiosidad, no con juicio…',
    },
    n6: {
      question: '¿Cómo te vas a dormir?',
      // El subtítulo dice el límite y quita la nota al mismo tiempo: no hay
      // respuesta correcta, así que tampoco hay forma de contestar mal.
      subtitle: 'Elige una o dos. No hay una forma correcta de cerrar el día',
      // Siete de los nueve llevan variante: es la última pregunta del día y
      // contestarla en el género de otra persona la convierte en un formulario.
      // Ids, orden y color en @lib/animos. La neutra es un sustantivo o una
      // locución, nunca una barra.
      states: {
        en_paz:     'En paz',
        agradecido: { m: 'Agradecido', f: 'Agradecida', n: 'Con gratitud' },
        orgulloso:  { m: 'Orgulloso',  f: 'Orgullosa',  n: 'Con orgullo' },
        tranquilo:  { m: 'Tranquilo',  f: 'Tranquila',  n: 'En calma' },
        contento:   { m: 'Contento',   f: 'Contenta',   n: 'Con alegría' },
        pensativo:  { m: 'Pensativo',  f: 'Pensativa',  n: 'Pensando' },
        cansado:    { m: 'Cansado',    f: 'Cansada',    n: 'Con cansancio' },
        inquieto:   { m: 'Inquieto',   f: 'Inquieta',   n: 'Con inquietud' },
        otro:       'Algo más',
      },
      // Una palabra, no una frase: el campo es para nombrar lo que falta en la
      // lista, no para explicarlo.
      otherPlaceholder: 'Una palabra',
      otherLabel: 'Tu palabra para hoy',
      otherAdd: 'Añadir',
      // Aparece solo si se escribe más de una palabra. No es un error ni un
      // reproche: es la única pista de que aquí cabe una sola, y aparece cuando
      // hace falta en vez de comerse las teclas en silencio.
      otherHint: 'Sintetízalo en una palabra',
      // Solo lo oye quien navega con lector de pantalla: en la pantalla, llegar
      // al límite se ve porque las demás se atenúan, y nada más.
      countTemplate: '{n} de {max} elegidas',
      cta: 'Cerrar el día',
    },
    closing: {
      // La plantilla base es la de la biblioteca; las variantes existen solo
      // por concordancia ("1 cosas" no se le dice a nadie a las once de la
      // noche). La regla de cuál se usa está en @lib/ritualNoche.
      summaryTemplate: 'Hoy agradeciste {n} cosas. Lograste {m}.',
      summarySingularTemplate: 'Hoy agradeciste una cosa. Lograste {m}.',
      summaryOnlyGratitude: 'Hoy agradeciste {n} cosas.',
      summaryOnlyGratitudeSingular: 'Hoy agradeciste una cosa.',
      summaryOnlyAchievements: 'Hoy lograste {m}.',
      peace: 'En paz con tu día.',
      goodnight: 'Buenas noches.',
      nothingWritten: 'Hoy solo viniste. También cuenta.',
    },
  },

  // ─── Vistas de Diario ────────────────────────────────────────────────────
  diarioManana: {
    // Bloque 1 — la frase con la que abre el día. La identidad viene de P4 y la
    // intención de R5; ninguna de las dos es obligatoria.
    phrase: {
      identityTemplate: 'Te estás convirtiendo en alguien que {identidad}.',
      intentionLabel: 'Hoy quieres vivirlo así:',
    },
    gratitude: {
      label: '¿Qué agradeces?',
      placeholder: 'Algo por lo que dar gracias…',
      // El ritual de noche (N4) las sigue ofreciendo a los 6 s; la Vista de
      // Mañana las pide por campo, a los 5 s sin escribir (§21). Los textos
      // son los mismos y viven una sola vez, en hoy.gratitud.sugerencias.
      suggestionsLabel: 'Si no sale solo:',
      suggestionsDelay: 6000, // ms
      max: 10,
    },
    emotions: {
      // El título y las opciones viven en `hoy.emociones` (§22)
      max: 3,
      complementary: '¿Qué necesitas para lograrlo?',
      complementaryPlaceholder: 'Lo que te ayudaría…',
    },
    victories: {
      placeholder: 'Una victoria que quiero lograr hoy…',
      max: 3,
    },
  },

  diarioNoche: {
    victories: {
      label: '¿Qué lograste de esto?',
      achieved: 'Lo lograste',
      notAchieved: 'No se dio',
      passToTomorrow: 'Pasarla a mañana',
      letItGo: 'Dejarla ir',
    },
    unplanned: {
      label: '¿Algo más?',
      placeholder: 'Un logro que no habías planeado…',
      add: 'Añadir',
      removeTemplate: 'Quitar {logro}',
    },
    learning: {
      label: '¿Qué fue lo menos difícil de hoy?',
      altLabel: '¿Qué intentarías diferente mañana?',
      placeholder: 'Con curiosidad, no con juicio…',
    },
  },

  // ─── Hábitos ─────────────────────────────────────────────────────────────
  habits: {
    // H1 — lista agrupada por momento
    list: {
      title: 'Tus hábitos',
      add: 'Nuevo hábito',
      // Encabezados de grupo: mismo orden que create.moments
      groups: ['Por la mañana', 'Por la noche'],
      pausedGroup: 'En pausa',
      countTemplate: '{n} activos',
      open: 'Ver detalle',
    },
    create: {
      label: '¿Cuál es tu nuevo hábito?',
      placeholder: 'Beber agua, leer, estirar…',
      moments: ['Mañana', 'Noche'],
      momentLabel: '¿Cuándo?',
      areaLabel: '¿Dónde vive esto?',
      daysLabel: '¿Qué días?',
      everyDay: 'Todos los días',
      suggestionsLabel: 'O empieza por una de estas:',
      save: 'Crear hábito',
      // Los mismos campos, en modo edición. El hábito no se recrea: se ajusta.
      editTitle: 'Ajusta tu hábito',
      editSave: 'Guardar cambios',
      edit: 'Editar',
      // Los que hoy no tocan. Siguen ahí y se pueden abrir, pero no se ofrecen
      // para marcar un día que no les corresponde.
      otherDaysGroup: 'Otros días',
    },
    detail: {
      // Ya no se usa: el detalle de un hábito muestra el NOMBRE de su área, no
      // la identidad de área, que era demasiado específica para encajar con
      // cualquier hábito ("Dormir a tiempo · se mueve porque le hace bien").
      // La clave se conserva porque la frase sigue viva en el ritual de mañana
      // y en el perfil, y por si el detalle vuelve a quererla algún día.
      identityTemplate: 'En {área} eres alguien que {identidad}.',
      totalTemplate: 'Lo has hecho {n} veces',
      last30Template: '{n} de los últimos 30 días',
      gridLabel: 'Los últimos 90 días',
      // Un día sin marca no es un fallo: no se nombra como tal
      gridDoneTemplate: '{fecha}: hecho',
      gridEmptyTemplate: '{fecha}: sin registro',
      momentTemplate: 'Lo haces {momento}',
      neverTemplate: 'Todavía no lo has registrado. Cuando pase, aquí estará.',
    },
    pause: {
      action: 'Pausar',
      confirm: 'Pausado. Aquí estará cuando lo quieras de vuelta.',
      resume: 'Reanudar',
    },
    empty: 'Tu ritual está vacío por ahora. Un solo hábito es un buen comienzo.',
    progress: {
      complete: 'Ritual completo.',
      template: '{hecho} de {total}',
    },
    // Sugerencias por área
    suggestions: {
      salud:       ['Beber agua', 'Estirar', 'Caminar 10 min', 'Dormir a tiempo', 'Respirar'],
      trabajo:     ['Revisar prioridades', 'Escribir una idea', 'Pausar 5 min', 'Revisar feedback'],
      relaciones:  ['Mensajear a alguien', 'Llamada sin agenda', 'Escuchar de verdad'],
      finanzas:    ['Revisar gastos', 'Ahorrar algo', 'Aprender una cosa'],
      espiritual:  ['Meditar', 'Agradecer en voz alta', 'Tiempo en silencio'],
      personal:    ['Leer 10 páginas', 'Escribir', 'Aprender algo nuevo'],
      creatividad: ['Dibujar', 'Tocar', 'Crear algo pequeño'],
    },

    // ─── Símbolo del hábito (§16) ────────────────────────────────────────
    // El símbolo es decorativo en la fila del hábito: quien usa lector de
    // pantalla oye el nombre, que es el identificador real. Aquí solo se nombra
    // lo que sí necesita etiqueta: el botón que abre la hoja y cada símbolo
    // dentro de ella.
    emoji: {
      pickerLabel: 'Elegir símbolo para este hábito',
      sheetTitle:  'Elige un símbolo',
      close:       'Cerrar',
      useTemplate: 'Usar {nombre}',
      categories: {
        movimiento: 'Movimiento',
        descanso:   'Descanso',
        mente:      'Mente',
        casa:       'Casa',
        comida:     'Comida',
        naturaleza: 'Naturaleza',
        simbolos:   'Símbolos',
      },
      // Nombre de cada símbolo, para el lector de pantalla. El catálogo y su
      // orden viven en @lib/emojis.
      names: {
        '👟': 'zapatilla',        '⚽': 'balón',           '🏀': 'pelota de básquet',
        '🚲': 'bicicleta',        '🎾': 'pelota de tenis',  '🥾': 'bota de montaña',
        '🛹': 'patineta',         '⛰️': 'montaña',
        '🌙': 'luna',             '🛏️': 'cama',            '💤': 'sueño',
        '🕯️': 'vela',            '☁️': 'nube',            '🧸': 'peluche',
        '🛁': 'bañera',           '🌜': 'luna con cara',
        '💡': 'bombilla',         '📖': 'libro abierto',    '📝': 'nota',
        '🎯': 'diana',            '🔍': 'lupa',             '🧩': 'pieza de rompecabezas',
        '✏️': 'lápiz',           '📚': 'libros',
        '🏠': 'casa',             '🧹': 'escoba',           '🌵': 'cactus',
        '🧺': 'cesta',            '🔑': 'llave',            '🛋️': 'sofá',
        '🧽': 'esponja',          '🚿': 'ducha',
        '💧': 'gota de agua',     '🍎': 'manzana',          '🥗': 'ensalada',
        '🍵': 'té',               '🥑': 'aguacate',         '🍋': 'limón',
        '🥕': 'zanahoria',        '☕': 'café',
        '🌿': 'hierba',           '🌱': 'brote',            '🌳': 'árbol',
        '🌊': 'ola',              '☀️': 'sol',             '🌻': 'girasol',
        '🍃': 'hojas',            '🌷': 'tulipán',
        '✨': 'destellos',        '⭐': 'estrella',         '🔥': 'fuego',
        '💫': 'estrella fugaz',   '🎵': 'nota musical',     '🎨': 'paleta de pintura',
        '💬': 'globo de diálogo', '🕊️': 'paloma',
        // Los que traen las sugerencias de P7 y P8 y no están en el catálogo
        '📋': 'portapapeles',     '🧾': 'recibo',           '💌': 'carta',
        '🎧': 'auriculares',      '📱': 'teléfono',
      },
    },
  },

  // ─── Constancia ──────────────────────────────────────────────────────────
  constancia: {
    template: '{n} días contigo',
    // NUNCA: "días seguidos"
  },

  // ─── Insights ─────────────────────────────────────────────────────────────
  insights: {
    empty: 'Necesito conocerte un poco más. En unos días empezaré a notar cosas.',
    reject: 'No me sirve',
    area: {
      // Template: "Eres alguien que crece. En {área} lo demostraste {n} de los últimos {total} días."
      evidenceTemplate: 'Eres alguien que {identidad}. En {área} lo demostraste {n} de los últimos {total} días.',
      // Desequilibrio (NUNCA acusatorio):
      // La neutra suelta el participio en vez de flexionarlo: "Llevas un tiempo
      // en Salud" dice lo mismo sin marca de género.
      lowActivity: {
        m: 'Llevas un tiempo enfocado en {áreaActiva}. Es natural. {áreaBaja} sigue aquí cuando quieras.',
        f: 'Llevas un tiempo enfocada en {áreaActiva}. Es natural. {áreaBaja} sigue aquí cuando quieras.',
        n: 'Llevas un tiempo en {áreaActiva}. Es natural. {áreaBaja} sigue aquí cuando quieras.',
      },
    },
    weekly: {
      // Template: "Cinco días esta semana. Tu palabra más repetida: calma."
      template: '{n} días esta semana. Tu palabra más repetida: {palabra}.',
    },
  },

  // ─── Perfil / Identidad ───────────────────────────────────────────────────
  profile: {
    identity: {
      title: 'Quién te estás convirtiendo',
      central: 'Identidad central',
      editHistory: 'Ver historial de versiones',
      areaPrefix: 'En {área} eres alguien que',
      addArea: 'Añadir área',
    },
    cancel: {
      // La neutra pregunta por la decisión y no por la persona, que además es
      // lo que de verdad se está preguntando.
      title: {
        m: '¿Seguro que quieres cancelar?',
        f: '¿Segura que quieres cancelar?',
        n: '¿Quieres cancelar?',
      },
      body: 'Tu historial se queda. La suscripción termina al final del ciclo.',
      confirm: 'Cancelar suscripción',
      back: 'Volver',
    },
  },

  // ─── Estados vacíos ───────────────────────────────────────────────────────
  empty: {
    journal: 'Aquí vive tu escritura libre. Toca + para empezar.',
    historial: 'Tu historial crecerá con cada día que registres.',
    insights: 'Necesito conocerte un poco más. En unos días empezaré a notar cosas.',
    habits: 'Un solo hábito es un buen comienzo.',
  },

  // ─── Errores y recuperación ───────────────────────────────────────────────
  errors: {
    generic: {
      title: 'Algo no salió como esperaba',
      body: 'Hemos guardado lo que escribiste. Intenta de nuevo:',
      retry: 'Reintentar',
      contact: 'Contactarnos',
    },
    offline: 'Estamos offline. Guardamos todo en tu teléfono y sincronizaremos cuando haya red.',
    syncFailed: 'No pudimos subir tu último cambio. Pero aquí sigue guardado. Reintentaremos.',
    emailExists: 'Ya existe una cuenta con ese correo. ¿Entramos con ella?',
  },

  // ─── Notificaciones ───────────────────────────────────────────────────────
  notifications: {
    manana: '¿Cómo quieres sentirte hoy?',   // A hora de despertar
    noche:  '¿Cómo cerrar el día?',           // A hora de dormir
    // Nunca badge numérico. Nunca contenido del usuario.
  },

  // ─── Regreso tras ausencia ────────────────────────────────────────────────
  return: {
    greeting: 'Hola de nuevo.',
    constancy: 'Tu Constancia sigue intacta. Aquí está todo como lo dejaste.',
    // NUNCA mencionar días ausentes
  },

  // ─── Paywall ─────────────────────────────────────────────────────────────
  paywall: {
    title: 'Tu historial vale oro',
    price: '99 MXN/mes o 749 MXN/año',
    trial: 'Primeros 7 días sin cobro',
    cta: 'Prueba gratis',
    skip: 'O sigue gratis',
    // NUNCA urgencia artificial ni culpa por no pagar
  },

  // ─── Modo día difícil ─────────────────────────────────────────────────────
  difficultDay: {
    prompt: '¿Hoy es un día difícil?',
    yes: 'Sí',
    no: 'No',
    affirmation: 'Hoy no necesitas logros. Solo estar.',
    closing: 'Respira. Mañana es otro día.',
  },

  // ─── Días de semana ───────────────────────────────────────────────────────
  days: {
    short: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    long:  ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  },

  // ─── Meses ────────────────────────────────────────────────────────────────
  months: {
    long: [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ],
    // "5 de agosto" · "5 de agosto de 2025" cuando no es el año en curso
    dayTemplate: '{dia} de {mes}',
    dayYearTemplate: '{dia} de {mes} de {ano}',
    // "Miércoles, 5 de agosto"
    weekdayTemplate: '{diaSemana}, {fecha}',
    monthTemplate: '{mes} de {ano}',
  },

  // ─── Journal (escritura libre) ────────────────────────────────────────────
  journal: {
    title: 'Journal',
    new: 'Escribir',
    // El editor abre con el cursor puesto: el marcador es una invitación,
    // no una pregunta que haya que contestar
    placeholder: 'Lo que sea que estés pensando…',
    back: 'Listo',
    search: 'Buscar una palabra',
    searchPlaceholder: 'Una palabra',
    clearSearch: 'Quitar la búsqueda',
    noResults: 'Nada con esa palabra.',
    resultsTemplate: '{n} entradas',
    resultsSingular: '1 entrada',
  },

  // ─── Historial ────────────────────────────────────────────────────────────
  historial: {
    title: 'Tu historial',
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    moodLabel: 'Cómo te fuiste a dormir',
    // Un día sin registro no es un hueco que reprochar
    emptyDay: 'De ese día no quedó nada escrito. También cuenta.',
    blocks: {
      intencion: 'Tu intención',
      emociones: 'Cómo querías sentirte',
      necesito: 'Lo que necesitabas',
      granDia: 'Tu mejor día',
      agradecimientos: 'Lo que agradeciste',
      victorias: 'Lo que te propusiste',
      aprendizaje: 'Lo que aprendiste',
      habitos: 'Lo que hiciste',
      journal: 'Lo que escribiste',
    },
    victoryStates: {
      pendiente: 'Sin decidir',
      lograda: 'Lo lograste',
      no_se_dio: 'No se dio',
      soltada: 'La dejaste ir',
    },
  },
}

// Utilidad: interpolar template strings
// Uso: interpolate(copy.onboarding.p11.closingTemplate, { identidad: 'crece' })
//
// El patrón acepta acentos porque varias plantillas usan {área}, {áreaActiva}
// y {áreaBaja} (p3c, habits.detail, insights.area). Con \w esas claves no
// se sustituían y la plantilla salía en crudo a la interfaz.
export function interpolate(template, vars) {
  return template.replace(/\{([^{}]+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

export default copy
