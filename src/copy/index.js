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
  tagline: 'Refugio digital para terminar cada día en paz contigo mismo.',

  // ─── Áreas de identidad (§5.1.1) ─────────────────────────────────────────
  // Nombres visibles de cada tipo de área. El orden canónico y el color
  // viven en @lib/areas y @tokens. `areaId = null` significa "General".
  areas: {
    salud:       'Salud',
    trabajo:     'Trabajo',
    relaciones:  'Relaciones',
    finanzas:    'Finanzas',
    espiritual:  'Espiritual',
    personal:    'Personal',
    creatividad: 'Creatividad',
    // Nombre visible de `areaId = null`: lo que no pertenece a un área concreta
    // hereda la identidad central (§5.1.1)
    general:     'General',
  },

  // ─── Emociones (§5.3, tabla de emociones) ────────────────────────────────
  // Los nombres visibles; el orden y el color viven en @lib/emotions.
  emotions: {
    tranquilo:   'Tranquilo',
    agradecido:  'Agradecido',
    motivado:    'Motivado',
    ansioso:     'Ansioso',
    cansado:     'Cansado',
    esperanzado: 'Esperanzado',
    irritable:   'Irritable',
    enfocado:    'Enfocado',
    triste:      'Triste',
    contento:    'Contento',
    abrumado:    'Abrumado',
    curioso:     'Curioso',
    presente:    'Presente',
    inseguro:    'Inseguro',
    aliviado:    'Aliviado',
    nostalgico:  'Nostálgico',
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
    // (§2 del documento de cambios). Contestar es opcional: sin respuesta, la
    // app usa la variante neutra y no vuelve a preguntar.
    p2a: {
      question: '¿Con qué género te identificas?',
      hint: 'Es para escribirte como eres. Lo cambias cuando quieras.',
      options: {
        masculino:             'Masculino',
        femenino:              'Femenino',
        prefiero_no_contestar: 'Prefiero no contestar',
        otro:                  'Otro',
      },
    },
    p3: {
      question: '¿Por qué estás aquí?',
      hint: 'Elige las oraciones que más conecten contigo',
      options: [
        'Ordenar mis emociones',
        'Reconocer lo que sí logro',
        // La variante neutra reformula en vez de poner barras (§2.5)
        {
          m: 'Conectar conmigo mismo',
          f: 'Conectar conmigo misma',
          n: 'Reconectar conmigo',
        },
        'Establecer hábitos que duren',
        'Preparar mi mente para dormir',
      ],
      // Motivos propios: se pueden añadir uno o varios
      other:               'Otro…',
      otherLabel:          'En tus palabras',
      otherPlaceholder:    'Lo que te trajo aquí',
      otherAdd:            'Añadir',
      otherRemoveTemplate: 'Quitar {motivo}',
    },
    p4: {
      headline: 'No preguntamos qué quieres lograr.',
      subhead: 'Preguntamos en quién te estás convirtiendo.',
      prefix: 'Alguien que…',
      placeholders: [
        '…crece cada día',
        {
          m: '…cuida de sí mismo',
          f: '…cuida de sí misma',
          n: '…se cuida',
        },
        {
          m: '…se respeta a sí mismo',
          f: '…se respeta a sí misma',
          n: '…se respeta',
        },
        '…no se abandona',
        '…termina lo que empieza',
        '…vive con calma',
      ],
    },
    p4b: {
      question: 'Nadie crece en una sola dirección.',
      hint: 'Elige las que importan ahora. Podrás cambiarlas cuando quieras.',
    },
    p4c: {
      question: 'Si quieres, ponle palabras.',
      hint: 'Si no, lo dejamos para después.',
      prefixTemplate: 'En “{área}” soy alguien que…',
    },
    p5: {
      headline: 'Empecemos ahora',
      question: '¿Qué cosa buena te pasó hoy?',
      hint: 'Por pequeña que parezca. Se queda guardada aquí.',
      placeholder: 'Algo bueno de hoy…',
      save: 'Guardar',
      skip: 'Ahora no',
      saved: {
        title: 'Guardado.',
        // Con identidad central (siempre existe: se escribe en P4)
        evidenceTemplate: 'Eres alguien que {identidad}. Esto ya lo confirma.',
        evidencePlain: 'Esta es tu primera evidencia.',
        edit: 'Cambiar esto',
      },
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
      suggestions: {
        salud:       ['Beber agua', 'Estirar', 'Caminar 10 min'],
        trabajo:     ['Revisar prioridades', 'Escribir una idea'],
        relaciones:  ['Mensajear a alguien'],
        finanzas:    ['Revisar gastos'],
        espiritual:  ['Meditar', 'Tiempo en silencio'],
        personal:    ['Leer 10 páginas', 'Aprender algo nuevo'],
        creatividad: ['Crear algo pequeño'],
        general:     ['Beber agua', 'Respirar', 'Estirar', 'Escribir una idea'],
      },
      otherPlaceholder: 'Un hábito para la mañana',
    },
    p8: {
      question: 'Tu ritual de la noche',
      hint: 'Lo que te ayuda a cerrar el día. También puede quedarse vacío.',
      suggestions: {
        salud:       ['Dormir a tiempo', 'Estirar'],
        trabajo:     ['Dejar mañana preparado'],
        relaciones:  ['Dar las gracias a alguien', 'Escuchar de verdad'],
        finanzas:    ['Anotar un gasto'],
        espiritual:  ['Agradecer en voz alta', 'Meditar'],
        personal:    ['Leer 10 páginas', 'Escribir'],
        creatividad: ['Dibujar', 'Tocar'],
        general:     ['Guardar el teléfono', 'Respirar', 'Leer 10 páginas'],
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
      nextTemplate: 'Nos vemos mañana a las {hora}.',
      areasJoin: ' y ',
      ctaLabel: 'Entrar a Strivo',
    },
  },

  // ─── Saludos dinámicos (por franja horaria) ──────────────────────────────
  greetings: {
    amanecer:  '¿Cómo quieres sentirte hoy?',
    dia:       'Tu día está en curso.',
    atardecer: 'Se va el día. Aún hay tiempo.',
    noche:     'Buenas noches. Cerremos el día.',
    madrugada: 'Aún de pie. Aquí está tu espacio.',
    // Con nombre: "Buenos días, {nombre}. ¿Cómo quieres sentirte hoy?"
    withName: {
      amanecer:  'Buenos días, {nombre}. ¿Cómo quieres sentirte hoy?',
      noche:     'Buenas noches, {nombre}. Cerremos el día.',
    },
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
      states: ['Tranquilo', 'Pensativo', 'Cansado', 'Inquieto', 'Otro'],
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
      suggestionsLabel: 'Si no sale solo:',
      suggestions: ['Tu familia', 'Tu cuerpo', 'Este momento', 'El silencio', 'Lo que tienes'],
      suggestionsDelay: 6000, // ms
      max: 10,
    },
    emotions: {
      label: '¿Cómo quieres sentirte hoy?',
      max: 3,
      hintTemplate: 'Elige hasta {max}.',
      complementary: '¿Qué necesitas para lograrlo?',
      complementaryPlaceholder: 'Lo que te ayudaría…',
    },
    bigDay: {
      label: '¿Cómo imaginas tu mejor día hoy?',
      placeholder: 'Descríbelo como quieras…',
    },
    victories: {
      label: 'Tres cosas que, si pasan hoy, el día valió la pena.',
      placeholder: 'Una victoria que quiero lograr hoy…',
      max: 3,
      areaLabel: '¿Dónde vive esto?',
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
      groups: ['Por la mañana', 'Por la noche', 'A lo largo del día'],
      pausedGroup: 'En pausa',
      countTemplate: '{n} activos',
      open: 'Ver detalle',
    },
    create: {
      label: '¿Cuál es tu nuevo hábito?',
      placeholder: 'Beber agua, leer, estirar…',
      moments: ['Mañana', 'Noche', 'A lo largo del día'],
      momentLabel: '¿Cuándo?',
      areaLabel: '¿Dónde vive esto?',
      daysLabel: '¿Qué días?',
      everyDay: 'Todos los días',
      suggestionsLabel: 'O empieza por una de estas:',
      save: 'Crear hábito',
    },
    detail: {
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
      lowActivity: 'Llevas un tiempo enfocado en {áreaActiva}. Es natural. {áreaBaja} sigue aquí cuando quieras.',
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
      title: '¿Seguro que quieres cancelar?',
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
