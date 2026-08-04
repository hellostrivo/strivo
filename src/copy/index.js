// src/copy/index.js
// Biblioteca de copy de Strivo — fuente única de todos los strings de interfaz
// Fuente: copy-library.md / Blueprint v3, §3.7–3.11 + Anexo B
//
// REGLAS:
// ✅ Tuteo, cálido, breve
// ❌ Sin "Fallaste", "Racha", "Debería", exclamaciones innecesarias
// ❌ Sin emojis del sistema (solo los 24 de la tabla de emociones)
// Cambios de copy → editar AQUÍ, no en los componentes.

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
  },

  // ─── Onboarding ──────────────────────────────────────────────────────────
  onboarding: {
    // Navegación común del flujo (P1 → P11)
    nav: {
      back: 'Atrás',
      continue: 'Continuar',
      progressTemplate: 'Paso {n} de {total}',
    },
    p1: {
      title: 'Tu refugio digital para reconectar, crecer y avanzar cada día.',
      subtitle: 'Tres minutos al día. Sin presión.',
      cta: 'Empezar',
    },
    p2: {
      question: '¿Por qué estás aquí?',
      hint: 'Elige las oraciones que más conecten contigo',
      options: [
        'Ordenar mis emociones',
        'Reconocer lo que sí logro',
        'Conectar conmigo mismo',
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
    p3: {
      headline: 'No preguntamos qué quieres lograr.',
      subhead: 'Preguntamos en quién te estás convirtiendo.',
      prefix: 'Alguien que…',
      placeholders: [
        '…crece cada día',
        '…se respeta a sí misma',
        '…no se abandona',
        '…termina lo que empieza',
        '…vive con calma',
      ],
    },
    p3b: {
      question: 'Nadie crece en una sola dirección.',
      hint: 'Elige las que importan ahora. Podrás cambiarlas cuando quieras.',
    },
    p3c: {
      question: 'Si quieres, ponle palabras.',
      hint: 'Si no, lo dejamos para después.',
      prefixTemplate: 'En “{área}” soy alguien que…',
    },
    p4: {
      question: 'Solo tu nombre. Nada más.',
      placeholder: 'Tu nombre',
    },
    p5: {
      cta: 'Empecemos ahora',
      skip: 'Ahora no',
    },
    p11: {
      // Template: "Te estás convirtiendo en alguien que {identidad}, en tu {área1} y en tu {área2}."
      closingTemplate: 'Te estás convirtiendo en alguien que {identidad}.',
      closingWithAreas: 'Te estás convirtiendo en alguien que {identidad}, en tu {areas}.',
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
  ritualManana: {
    r1: { prompt: 'Respira conmigo', duration: '6 segundos' },
    r2: {
      normal: 'Te espera tu día',
      difficultDay: 'Ayer fue difícil. Hoy es nuevo.',
    },
    r3: {
      template: 'Te estás convirtiendo en alguien que {identidad}.',
      areaLabel: 'Hoy toca sobre todo:',
      commitmentLabel: 'Y estás cultivando:',
      commitmentDays: '(día {n} de {total})',
      editLink: 'Cambiar esto',
    },
    r4: {
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
    n1: { prompt: 'Respira conmigo', duration: '6 segundos' },
    n6: {
      question: '¿Cómo te vas a dormir?',
      states: ['Tranquilo', 'Pensativo', 'Cansado', 'Inquieto', 'Otro'],
    },
    closing: {
      summaryTemplate: 'Hoy agradeciste {n} cosas. Lograste {m}.',
      peace: 'En paz con tu día.',
      goodnight: 'Buenas noches.',
      nothingWritten: 'Hoy solo viniste. También cuenta.',
    },
  },

  // ─── Vistas de Diario ────────────────────────────────────────────────────
  diarioManana: {
    gratitude: {
      label: '¿Qué agradeces?',
      suggestions: ['Tu familia', 'Tu cuerpo', 'Este momento', 'El silencio', 'Lo que tienes'],
      suggestionsDelay: 6000, // ms
    },
    emotions: {
      label: '¿Cómo quieres sentirte hoy?',
      max: 3,
      complementary: '¿Qué necesitas para lograrlo?',
    },
    bigDay: {
      label: '¿Cómo imaginas tu mejor día hoy?',
      placeholder: 'Descríbelo como quieras…',
    },
    victories: {
      label: 'Tres cosas que, si pasan hoy, el día valió la pena.',
      placeholder: 'Una victoria que quiero lograr hoy…',
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
    },
    learning: {
      label: '¿Qué fue lo menos difícil de hoy?',
      altLabel: '¿Qué intentarías diferente mañana?',
      placeholder: 'Con curiosidad, no con juicio…',
    },
  },

  // ─── Hábitos ─────────────────────────────────────────────────────────────
  habits: {
    create: {
      label: '¿Cuál es tu nuevo hábito?',
      placeholder: 'Beber agua, leer, estirar…',
      moments: ['Mañana', 'Noche', 'A lo largo del día'],
    },
    detail: {
      identityTemplate: 'En {área} eres alguien que {identidad}.',
      totalTemplate: 'Lo has hecho {n} veces',
      last30Template: '{n} de los últimos 30 días',
    },
    pause: {
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
