// src/copy/index.js
// Biblioteca de copy de Strivo — fuente única de todos los strings de interfaz
// Fuente: copy-library.md / Blueprint v3, §3.7–3.11 + Anexo B
//
// REGLAS:
// ✅ Tuteo, cálido, breve
// ❌ Sin léxico de castigo, sin vocabulario de rendimiento, sin lenguaje
//    prescriptivo y sin exclamaciones innecesarias (§3.6.2, §3.6.3)
// ❌ Sin emojis en la voz de la app. Los chips de emoción son vocabulario de
//    quien escribe, no voz del producto (§3.6.2, punto 5 · §5.8.1)
// Cambios de copy → editar AQUÍ, no en los componentes.
//
// Las cadenas con marca de género van en formato `{ m, f, n }` y se resuelven
// al pintar con `resolveGender` de `src/copy/gender.js` (§3.6.5). Ningún
// componente lee `.m` ni `.f` (RN-GEN-01).

export const copy = {
  // ─── Generales ───────────────────────────────────────────────────────────
  appName: 'Strivo',
  tagline: 'Refugio digital para terminar cada día en paz contigo mismo.',

  // ─── Onboarding ──────────────────────────────────────────────────────────
  onboarding: {
    p1: {
      title: 'Refugio digital para terminar cada día en paz.',
      subtitle: 'Tres minutos al día. Sin presión.',
    },
    p2: {
      question: '¿Por qué estás aquí?',
      hint: 'Elige los que resuenen',
      options: [
        'Ordenar mis emociones',
        'Reconocer lo que sí logro',
        'Conectar conmigo mismo',
        'Establecer hábitos que duren',
        'Preparar mi mente para dormir',
      ],
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
      prefixTemplate: 'En {área} soy alguien que…',
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

  // ─── Lumia ────────────────────────────────────────────────────────────────
  // Vocabulario de Lumia: hacia dentro, reflexión, calma, cierre. Nunca el de
  // Formia (construcción, identidad, hábitos) — §C2.0.
  //
  // Aquí no hay una sola palabra de hábitos: ni "hábito", ni "constancia", ni
  // "progreso", ni "ritual" referido a un checklist (§C2.6, criterio 3). La
  // palabra "ritual" solo aparece para el Ritual de Noche, que es de Lumia.
  lumia: {
    hoy: {
      // §5.3, Bloque 1 — saludo por hora local, con el nombre si lo hay.
      saludo: {
        manana: 'Buenos días',
        tarde: 'Buenas tardes',
        noche: 'Buenas noches',
        conNombreTemplate: '{saludo}, {nombre}',
      },

      // §5.2.1 — el conmutador es el único origen del tema de la pantalla.
      momento: {
        label: 'Sección del día',
        manana: 'Mañana',
        noche: 'Noche',
      },

      // Sin tarjeta de acción y sin estado "hecho": el Diario se muestra en
      // Hoy, así que no hay nada que anunciar ni que dar por terminado.
      // RN-HOY-03 se cumple sin decir nada — lo escrito está a la vista.

      frase: { label: 'Frase de hoy' },
    },

    diario: {
      volver: 'Volver',
      // §5.3, "Estado offline" — solo si hay algo pendiente de subir.
      pendiente: 'Se guardará en la nube más tarde',

      error: {
        load: {
          body: 'No pudimos abrir tu día. Lo que escribiste sigue guardado.',
          retry: 'Reintentar',
        },
        save: {
          body: 'No pudimos guardar eso. Tu texto sigue aquí.',
          retry: 'Reintentar',
        },
      },

      // Filas dinámicas de agradecimientos, logros y victorias (§5.3, Bloque 2).
      filas: {
        anadir: 'Añadir otra',
        quitar: 'Quitar',
        // Solo se pregunta si hay texto de sobra que perder (§5.3, B2).
        quitarConfirmar: '¿Quitar esto?',
        // El tope no reprende: celebra en voz baja y deja de crecer.
        tope: 'Diez cosas. Nada mal.',
      },

      manana: {
        titulo: 'Tu mañana',

        gratitud: {
          titulo: '¿Qué agradezco esta mañana?',
          // Bajo la pregunta, una sola línea que no pide nada: la certeza de
          // que hay respuesta antes de buscarla.
          lead: 'Siempre hay algo que agradecer.',
          // La pista de qué cabe aquí va dentro de los campos, en gris de
          // marcador de posición, y es la misma en los tres renglones: no se
          // reparte una idea por fila —eso era decirle a cada renglón de qué
          // tiene que hablar—. Corta a propósito: en un campo de una línea, en
          // móvil, todo lo que no quepa se corta con puntos suspensivos.
          placeholder: 'Puede ser desde algo pequeño',
          sugerencias: {
            titulo: '¿Te ayudo con una idea?',
            // RN dura de §5.3: tocar una idea NUNCA rellena el campo. Abre una
            // pregunta detonante; escribir sigue siendo cosa de la persona.
            descartar: 'Ahora no',
            opciones: [
              {
                id: 'familia',
                label: 'tu familia',
                pregunta: '¿Quién de tu familia te hizo bien esta semana?',
              },
              {
                id: 'cuerpo',
                label: 'tu cuerpo',
                pregunta: '¿Qué te permite hacer tu cuerpo esta mañana?',
              },
              {
                id: 'momento',
                label: 'este momento',
                pregunta: '¿Qué tiene de bueno este momento?',
              },
              {
                id: 'silencio',
                label: 'el silencio',
                pregunta: '¿Dónde encuentras silencio en tu día?',
              },
              {
                id: 'tienes',
                label: 'lo que tienes',
                pregunta: '¿Qué tienes hoy que hace un año esperabas?',
              },
            ],
          },
        },

        emociones: {
          titulo: '¿Cómo me quiero sentir hoy?',
          lead: 'Elige las emociones que quieres cultivar',
          // Al intentar la cuarta se suelta la más antigua. No es un error y no
          // se dice como tal (§5.3, Bloque 3).
          max: 'Tres es un buen número.',
          // Las 15 emociones de la mañana: todas positivas, en futuro, en orden
          // fijo. Se persiste el `id`, nunca la etiqueta (RN-GEN-04).
          //
          // "Conectado con Dios" se conserva por su relevancia cultural (§5.3).
          // El ajuste que lo cambia por "Conectado conmigo" es §5.12, fuera de
          // esta spec: aquí está siempre presente.
          catalogo: [
            {
              id: 'agradecido',
              emoji: '🙏',
              label: { m: 'Agradecido', f: 'Agradecida', n: 'Con gratitud' },
            },
            { id: 'en_paz', emoji: '🕊️', label: { m: 'En paz', f: 'En paz', n: 'En paz' } },
            { id: 'enfocado', emoji: '🎯', label: { m: 'Enfocado', f: 'Enfocada', n: 'Con foco' } },
            {
              id: 'orgulloso',
              emoji: '✨',
              label: { m: 'Orgulloso de mí', f: 'Orgullosa de mí', n: 'Con orgullo' },
            },
            { id: 'pleno', emoji: '🌕', label: { m: 'Pleno', f: 'Plena', n: 'En plenitud' } },
            {
              id: 'inspirado',
              emoji: '💡',
              label: { m: 'Inspirado', f: 'Inspirada', n: 'Con inspiración' },
            },
            { id: 'feliz', emoji: '😊', label: { m: 'Feliz', f: 'Feliz', n: 'Feliz' } },
            {
              id: 'conectado_dios',
              emoji: '🕯️',
              label: {
                m: 'Conectado con Dios',
                f: 'Conectada con Dios',
                n: 'En conexión con Dios',
              },
            },
            { id: 'amado', emoji: '💛', label: { m: 'Amado', f: 'Amada', n: 'Con amor' } },
            { id: 'seguro', emoji: '🛡️', label: { m: 'Seguro', f: 'Segura', n: 'Con seguridad' } },
            { id: 'valiente', emoji: '🦁', label: { m: 'Valiente', f: 'Valiente', n: 'Valiente' } },
            {
              id: 'creativo',
              emoji: '🎨',
              label: { m: 'Creativo', f: 'Creativa', n: 'Con creatividad' },
            },
            { id: 'paciente', emoji: '🌱', label: { m: 'Paciente', f: 'Paciente', n: 'Paciente' } },
            {
              id: 'generoso',
              emoji: '🤲',
              label: { m: 'Generoso', f: 'Generosa', n: 'Con generosidad' },
            },
            {
              id: 'prospero',
              emoji: '🌾',
              label: { m: 'Próspero', f: 'Próspera', n: 'Con prosperidad' },
            },
          ],
        },

        granVision: {
          titulo: '¿Qué haría que hoy sea un gran día?',
          placeholder: 'Imagina tu día ideal',
          // Aparece tras 8 s sin escribir (§5.3, Bloque 4).
          sugerencia: '¿Cómo te gustaría sentirte a las diez de la noche?',
        },

        victorias: {
          titulo: 'Tres victorias que quisiera conseguir hoy',
          ayuda: 'Tres cosas que, si pasan hoy, el día valió la pena.',
          placeholder: 'Algo que quieres que pase hoy',
        },
      },

      noche: {
        titulo: 'Tu noche',
        // §5.4, Bloque 1 — frase de apertura con el día de la semana.
        aperturaTemplate: 'Vamos a cerrar el {dia}.',

        victorias: {
          titulo: 'Mis logros de hoy',
          // Sin victorias por la mañana, el bloque cambia de pregunta. Nunca se
          // muestra un vacío que recuerde una omisión (§5.4, Bloque 2).
          tituloVacio: '¿Qué lograste hoy?',
          placeholder: 'Algo que sí pasó hoy',
          lograda: 'Lo lograste',
          marcar: 'Marcar como lograda',
          noSeDio: 'No se dio hoy',
          pasar: 'Pasarla a mañana',
          soltar: 'Dejarla ir',
          soltada: 'Soltar también es avanzar.',
          pasada: 'Mañana estará esperándote.',
          deAyer: 'Viene de ayer',
        },

        logros: {
          titulo: '¿Qué más logré hoy que no había planeado?',
          placeholder: 'Algo que no estaba en el plan',
          sugerencia:
            '¿Ayudaste a alguien? ¿Resolviste algo pequeño? ¿Te sostuviste en un momento difícil?',
        },

        gratitud: {
          titulo: '¿Qué agradezco de este día?',
          placeholder: 'algo de hoy',
          // §5.4, Bloque 4 — lo de la mañana se muestra plegado y no se vuelve
          // a pedir.
          mananaTemplate: 'Esta mañana agradeciste: {textos}',
          ver: 'Ver',
          ocultar: 'Cerrar',
          sugerencias: {
            titulo: '¿Te ayudo con una idea?',
            descartar: 'Ahora no',
            opciones: [
              {
                id: 'alguien',
                label: 'alguien de hoy',
                pregunta: '¿Quién te hizo el día más fácil?',
              },
              {
                id: 'inesperado',
                label: 'algo que no esperabas',
                pregunta: '¿Qué te sorprendió hoy?',
              },
              {
                id: 'cuerpo',
                label: 'tu cuerpo',
                pregunta: '¿Qué te sostuvo hoy sin que lo pidieras?',
              },
              {
                id: 'pequeno',
                label: 'algo pequeño',
                pregunta: '¿Qué momento de hoy duró poco y valió la pena?',
              },
              {
                id: 'tuyo',
                label: 'algo tuyo',
                pregunta: '¿Qué hiciste hoy que agradeces haber hecho?',
              },
            ],
          },
        },

        aprendizaje: {
          tituloTemplate: 'Reflexiones del {fecha}',
          pregunta: '¿Qué aprendí hoy de mí, de los demás o de la vida?',
          placeholder: 'Lo que se te ocurra',
          otraPregunta: 'Otra pregunta',
          // §5.4, Bloque 6 — banco de preguntas, distinto cada día.
          preguntas: [
            '¿Qué momento de hoy te gustaría recordar dentro de un año?',
            '¿Qué te sorprendió?',
            '¿Qué necesitaste hoy y no pediste?',
            '¿Dónde te reconociste?',
            '¿A quién le debes un gracias?',
          ],
          // Contraste amable con la gran visión de la mañana. Nunca se pregunta
          // si se cumplió (§5.3, Bloque 4).
          granVisionTitulo: 'Esta mañana escribiste esto',
          granVisionPregunta: '¿Cómo se parece a lo que pasó?',
        },

        // §5.4.1 — Bloque 7 rediseñado. El subtítulo es la única defensa de la
        // pantalla contra la sensación de examen: no se acorta ni se reescribe.
        sueno: {
          titulo: '¿Cómo te vas a dormir?',
          lead: 'Elige una o dos. No hay una forma correcta de cerrar el día',
          guardadoTemplate: 'Te fuiste a dormir: {estados}',
          separador: ' · ',
          otro: {
            label: 'Una palabra',
            placeholder: 'Como quieras decirlo',
          },
          opciones: [
            { id: 'en_paz', label: { m: 'En paz', f: 'En paz', n: 'En paz' } },
            { id: 'agradecido', label: { m: 'Agradecido', f: 'Agradecida', n: 'Con gratitud' } },
            { id: 'orgulloso', label: { m: 'Orgulloso', f: 'Orgullosa', n: 'Con orgullo' } },
            { id: 'tranquilo', label: { m: 'Tranquilo', f: 'Tranquila', n: 'En calma' } },
            { id: 'contento', label: { m: 'Contento', f: 'Contenta', n: 'Con alegría' } },
            { id: 'pensativo', label: { m: 'Pensativo', f: 'Pensativa', n: 'Pensando' } },
            { id: 'cansado', label: { m: 'Cansado', f: 'Cansada', n: 'Con cansancio' } },
            { id: 'inquieto', label: { m: 'Inquieto', f: 'Inquieta', n: 'Con inquietud' } },
            { id: 'otro', label: { m: 'Algo más', f: 'Algo más', n: 'Algo más' } },
          ],
        },

        // §5.4, "Secuencia de cierre" + §3.3 (etapa 4).
        cierre: {
          cta: 'Cerrar mi día',
          unLogro: 'un logro',
          logrosTemplate: '{n} logros',
          unaGracia: 'una cosa',
          graciasTemplate: '{m} cosas',
          ambosTemplate: 'Hoy reconociste {logros} y agradeciste {gracias}.',
          soloGraciasTemplate: 'Hoy encontraste {gracias} que agradecer.',
          soloLogrosTemplate: 'Hoy reconociste {logros} que lograste.',
          // Uno de los mensajes más importantes del producto (§5.4).
          nada: 'Hoy solo viniste. También cuenta.',
          // Frase de cierre del día normal, y la del día que pesó.
          paz: 'En paz con tu día.',
          despedida: 'Buenas noches.',
          // RN-VN-04 — Con un estado pesado no hay celebración de ningún tipo.
          compasivo: 'Hoy pesó. Cerrarlo ya es bastante.',
          reabrir: 'Puedes volver y cambiar lo que quieras.',
        },
      },
    },

    // ─── Respiración diaria (§C2.3) ─────────────────────────────────────────
    // Ex-R1. Dejó de ser el primer paso de un ritual y es una experiencia
    // propia de la sección Mañana.
    //
    // **RN-LU-RESP-01 se nota en el copy.** Los 39 segundos solo son aceptables
    // porque nada de esto se abre solo ni retiene a nadie, y el texto lo dice
    // sin que haya que descubrirlo: se anuncia lo que dura y se anuncia que se
    // puede salir, antes de empezar.
    //
    // El copy de Fase 0 —"Antes de empezar, respira una vez"— quedó sin objeto
    // (§C7.7.6): "antes de empezar" presuponía un ritual que venía después, y
    // no viene nada después. Este lo sustituye. Invita, no vende: sin
    // exclamaciones, sin lenguaje de meditación guiada y sin prometer que nadie
    // se va a sentir mejor.
    respiracion: {
      entrada: {
        abrir: 'Respirar un momento',
        ayuda: 'Poco más de medio minuto',
      },
      titulo: 'Un momento para respirar',
      lead: 'Tres ciclos. Puedes salir cuando quieras.',

      empezar: 'Empezar',
      pausar: 'Pausa',
      seguir: 'Seguir',
      // Saltar no tiene coste, no pide confirmación y no se registra.
      saltar: 'Saltar',
      salir: 'Salir',

      sonido: {
        activar: 'Activar el sonido',
        silenciar: 'Silenciar',
      },

      // La única señal textual del ejercicio. Sin cuenta atrás y sin números.
      fases: {
        inhalar: 'Inhala',
        exhalar: 'Exhala',
        pausa: 'Descansa',
      },
    },

    // ─── Journal (§5.8, §5.8.1, §5.8.2) ─────────────────────────────────────
    // El único espacio de la app donde el sistema es completamente mudo: no
    // sugiere, no corrige y no comenta nada (RN-JR-03).
    journal: {
      title: 'Journal',
      lead: 'Sin preguntas y sin estructura. Lo que quieras, cuando quieras.',
      nueva: 'Escribir',
      volver: 'Volver',
      // §5.8, "Estados" — invitación suave, nunca la cuenta de lo que falta.
      vacio: 'Aquí caben los pensamientos que no caben en otro lado. Empieza cuando quieras.',

      buscar: {
        label: 'Buscar en tu journal',
        placeholder: 'Buscar',
        limpiar: 'Limpiar',
        sinResultados: 'Nada con esas palabras. Todo lo demás sigue aquí.',
      },

      grupos: {
        hoy: 'Hoy',
        semana: 'Esta semana',
      },

      // El modelo canónico no guarda título (§C5.2): una entrada se presenta
      // por su hora y su primera línea, como en el wireframe de §5.8.
      entrada: {
        fechaHoraTemplate: '{fecha} · {hora}',
        soloEmociones: 'Solo emociones, sin palabras.',
      },

      editor: {
        volver: 'Volver',
        // §5.8.1 — Dos tarjetas de sección, cálida y fría. Ninguna obligatoria.
        emociones: {
          titulo: '¿Cómo me siento?',
          lead: 'Hasta tres. Las difíciles también cuentan.',
          max: 'Tres es un buen número.',
          otra: {
            chip: 'Otra',
            label: 'Una palabra',
            placeholder: 'Como quieras decirlo',
          },
          // Las 15 del Journal (§5.8.1). Catálogo distinto del de la mañana:
          // allí se elige qué cultivar, aquí se nombra lo que hay. Por eso
          // aquí sí están Triste, Ansioso, Frustrado, Preocupado, Melancólico,
          // Solo y Cansado, y no llevan ningún tratamiento de advertencia.
          catalogo: [
            { id: 'feliz', emoji: '😊', label: { m: 'Feliz', f: 'Feliz', n: 'Feliz' } },
            {
              id: 'agradecido',
              emoji: '🙏',
              label: { m: 'Agradecido', f: 'Agradecida', n: 'Con gratitud' },
            },
            {
              id: 'tranquilo',
              emoji: '🌿',
              label: { m: 'Tranquilo', f: 'Tranquila', n: 'En calma' },
            },
            {
              id: 'orgulloso',
              emoji: '✨',
              label: { m: 'Orgulloso', f: 'Orgullosa', n: 'Con orgullo' },
            },
            {
              id: 'esperanzado',
              emoji: '🌅',
              label: { m: 'Esperanzado', f: 'Esperanzada', n: 'Con esperanza' },
            },
            {
              id: 'motivado',
              emoji: '🔥',
              label: { m: 'Motivado', f: 'Motivada', n: 'Con motivación' },
            },
            {
              id: 'aliviado',
              emoji: '🌤️',
              label: { m: 'Aliviado', f: 'Aliviada', n: 'Con alivio' },
            },
            {
              id: 'acompanado',
              emoji: '🤝',
              label: { m: 'Acompañado', f: 'Acompañada', n: 'En compañía' },
            },
            {
              id: 'cansado',
              emoji: '😴',
              label: { m: 'Cansado', f: 'Cansada', n: 'Con cansancio' },
            },
            { id: 'triste', emoji: '💧', label: { m: 'Triste', f: 'Triste', n: 'Triste' } },
            {
              id: 'ansioso',
              emoji: '🌀',
              label: { m: 'Ansioso', f: 'Ansiosa', n: 'Con ansiedad' },
            },
            {
              id: 'frustrado',
              emoji: '😤',
              label: { m: 'Frustrado', f: 'Frustrada', n: 'Con frustración' },
            },
            {
              id: 'preocupado',
              emoji: '🌧️',
              label: { m: 'Preocupado', f: 'Preocupada', n: 'Con preocupación' },
            },
            {
              id: 'melancolico',
              emoji: '🍂',
              label: { m: 'Melancólico', f: 'Melancólica', n: 'Con melancolía' },
            },
            { id: 'solo', emoji: '🌑', label: { m: 'Solo', f: 'Sola', n: 'En soledad' } },
          ],
        },
        texto: {
          titulo: 'Mi diario de hoy',
          placeholder: 'Lo que sea',
        },
        borrar: 'Borrar esta entrada',
        borrarConfirmar: '¿Borrarla del todo?',
      },

      // §5.8.2 y §7.7.1 — Bloqueo de acceso al módulo, **no** protección del
      // contenido. El copy autorizado habla de "acceso en este dispositivo".
      // Prohibido prometer inviolabilidad de ninguna forma: §7.8 compromete
      // decir la verdad sobre lo que la app hace con lo que se escribe.
      pin: {
        title: 'Proteger mi journal',
        lead: 'Pide un PIN para abrir tu journal en este dispositivo.',
        // La honestidad de §7.7.1, dicha en voz alta y sin tecnicismos.
        alcance: 'Es una puerta en esta pantalla. Lo que escribes se guarda igual que siempre.',
        activar: 'Pedir un PIN',
        desactivar: 'Dejar de pedirlo',
        activo: 'Tu journal pide un PIN para abrirse.',
        ajustes: 'Ajustes de acceso',
        cerrar: 'Cerrar',

        campo: {
          label: 'PIN',
          hint: 'De cuatro a seis dígitos.',
        },
        repetir: {
          label: 'Escríbelo otra vez',
          noCoincide: 'No coincidieron. Puedes volver a intentarlo.',
        },
        corto: 'Con cuatro dígitos basta.',
        guardar: 'Guardar',
        cancelar: 'Cancelar',
        guardado: 'Listo. Tu journal pedirá este PIN.',
        retirado: 'Retirado. Tu journal se abre en un toque.',

        bloqueo: {
          titulo: 'Tu journal te espera',
          lead: 'Escribe tu PIN para abrirlo.',
          abrir: 'Abrir',
          incorrecto: 'Ese no era. Prueba otra vez.',
          olvide: 'Olvidé mi PIN',
        },

        // §5.8.2 — Reautenticación contra la cuenta y PIN nuevo. Nada de lo
        // escrito se toca: el PIN es una puerta, no una llave del contenido.
        recuperar: {
          titulo: 'Volvamos a reconocerte',
          lead: 'Verificamos tu cuenta y eliges un PIN nuevo. Todo lo que escribiste se queda donde está.',
          cta: 'Verificar mi cuenta',
          volver: 'Volver al PIN',
          sinSesion:
            'Para verificarte hace falta entrar a tu cuenta. Todavía no hay sesión en este dispositivo.',
          sinMetodo:
            'Esta cuenta no tiene correo ni teléfono vinculados, así que no hay forma de verificarte.',
          noVerificado: 'No pudimos verificarte esta vez. Tu journal sigue donde estaba.',
          nuevo: 'Elige tu PIN nuevo',
        },

        // RN-JR-PIN-02 — Nunca un PIN activo sobre una cuenta sin salida.
        cuenta: {
          titulo: 'Antes, una forma de volver a entrar',
          lead: 'Si algún día olvidas el PIN, necesitamos reconocerte por algún lado. Añade tu correo o tu teléfono.',
          email: { label: 'Correo', placeholder: 'tu@correo.com' },
          telefono: { label: 'Teléfono', placeholder: '+52 55 0000 0000' },
          guardar: 'Guardar',
          listo: 'Listo. Ya puedes pedir un PIN.',
          aviso:
            'Tu journal pide un PIN y esta cuenta se quedó sin forma de recuperarlo. Añade un correo o retira el PIN.',
        },
      },
    },

    // ─── Historial (§5.10) ──────────────────────────────────────────────────
    // Solo contenido de Lumia: mañana, noche y journal (§C7.7.2). Sin hábitos,
    // sin cifras acumuladas y sin ninguna vista que cruce los dos espacios.
    historial: {
      title: 'Historial',
      lead: 'Vuelve a cualquier día. Todo sigue aquí.',
      vacio: 'Tu historial crecerá con cada día que registres.',
      // Se dice siempre igual, haya o no haya entradas ese mes: si apareciera
      // solo cuando las hay, la propia frase estaría contando lo que el PIN
      // tapa (RN-JR-PIN-01).
      journalConPin: 'Con tu PIN puesto, lo que escribes se lee desde el journal.',

      calendario: {
        anterior: 'Mes anterior',
        siguiente: 'Mes siguiente',
        // Un día sin registro no se marca de ningún modo: no hay huecos, no hay
        // grises y no hay días perdidos (§5.10).
        diaConAnimoTemplate: '{fecha} · {animo}',
        leyenda: 'Cómo te fuiste a dormir',
      },

      // Los cinco tonos de §6.3.5, para el lector de pantalla y la leyenda.
      //
      // `normal` no dice "sin registrar": es el ánimo de un día que existió sin
      // estado de sueño declarado —o con "Pensativa", que §5.4.1 deriva aquí—, y
      // llamarlo "sin registrar" sería contarle a alguien que ese día no contó.
      animo: {
        agotado: 'Con cansancio',
        inquieto: 'Con inquietud',
        normal: 'Estuviste',
        tranquilo: 'En calma',
        en_paz: 'En paz',
      },

      dia: {
        volver: 'Volver al calendario',
        manana: 'Tu mañana',
        noche: 'Tu noche',
        journal: 'Lo que escribiste',
        victorias: 'Tus logros',
        emociones: 'Cómo querías sentirte',
        gratitud: 'Lo que agradeciste',
        granVision: 'Cómo imaginabas el día',
        logros: 'Lo que no estaba en el plan',
        aprendizaje: 'Lo que aprendiste',
        // Un día en blanco no es un día perdido.
        vacio: 'Este día no tiene nada escrito. También estuviste.',
      },
    },
  },

  // ─── Compartido entre los dos espacios ────────────────────────────────────
  shared: {
    // §C7.5 — La transición de entrada. Es un **umbral**, no una secuencia: no
    // introduce pasos, no exige interacción y no tiene botón de avanzar. Cada
    // cosa que se le añada la acerca al wizard derogado del Anexo E, así que
    // este namespace tiene una sola cadena y conviene que siga siendo así.
    transicion: {
      // La transición entera es el área que la salta, y esto es lo que oye
      // quien la recorre con un lector de pantalla.
      saltar: 'Entrar',
    },

    // El Home de Strivo — la pantalla por la que se entra a la app (revisión de
    // §C0.2 y de SPEC_11, 19 ago 2026). **No lleva frase**: la frase de
    // apertura es del umbral de Lumia y aquí sería una segunda voz antes de
    // haber elegido nada. Tampoco lleva saludo ni fecha: eso es R2, suprimido
    // de raíz (Anexo E, E.0).
    //
    // Las dos preguntas centrales son las del blueprint —Lumia pregunta "¿cómo
    // estoy?" y Formia "¿quién quiero ser?"— y están aquí porque son lo único
    // que distingue de verdad a los dos espacios para quien abre la app por
    // primera vez. No son una frase del repertorio: son fijas.
    home: {
      simbolo: 'Strivo',
      espaciosLabel: 'Espacios',
      lumia: { titulo: 'Lumia · Reflexión', pregunta: '¿Cómo estoy?' },
      formia: { titulo: 'Formia · Acción', pregunta: '¿Quién quiero ser?' },
    },

    // §C7.3 — Naming de la navegación. **Opción A, decidida el 11 ago 2026**:
    // rótulo corto en la pestaña y marca + descriptor en la cabecera del
    // espacio. Era la última decisión abierta del proyecto.
    //
    // El naming es mixto por decisión: la marca se aprende sin que la barra
    // deje de decir qué hay dentro. "Lumia · Reflexión" completo no cabe en una
    // pestaña de móvil a un tamaño legible, así que la marca sola va abajo y el
    // descriptor aparece arriba, al entrar.
    //
    // **La barra no mezcla los dos registros.** Lumia habla de reflexión;
    // Formia, de construcción. Cada lista de secciones usa su vocabulario y
    // ninguna toma prestado el de la otra.
    navegacion: {
      // La barra ya no salta entre espacios: devuelve al Home. Para cambiar de
      // espacio se pasa por Strivo (revisión de SPEC_11, 19 ago 2026).
      barraLabel: 'Strivo',
      seccionesLabel: 'Secciones',
      volver: 'Strivo',
      volverLabel: 'Volver a Strivo',

      lumia: {
        pestana: 'Lumia',
        cabecera: 'Lumia · Reflexión',
        secciones: {
          hoy: 'Hoy',
          journal: 'Journal',
          historial: 'Historial',
        },
      },

      formia: {
        pestana: 'Formia',
        cabecera: 'Formia · Acción',
        secciones: {
          identidad: 'Identidad',
          habitos: 'Hábitos',
          progreso: 'Progreso',
        },
      },
    },
  },

  // ─── Insights ─────────────────────────────────────────────────────────────
  insights: {
    empty: 'Necesito conocerte un poco más. En unos días empezaré a notar cosas.',
    reject: 'No me sirve',
    area: {
      // Template: "Eres alguien que crece. En {área} lo demostraste {n} de los últimos {total} días."
      evidenceTemplate:
        'Eres alguien que {identidad}. En {área} lo demostraste {n} de los últimos {total} días.',
      // Desequilibrio (NUNCA acusatorio):
      lowActivity:
        'Llevas un tiempo enfocado en {áreaActiva}. Es natural. {áreaBaja} sigue aquí cuando quieras.',
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

  // ─── Formia ───────────────────────────────────────────────────────────────
  // Vocabulario de Formia: construcción, dirección, hacia delante.
  // Nunca el de Lumia (ritual, reflexión, calma, cierre) — §C3.0, principio 1.
  formia: {
    identidad: {
      title: 'Quién estás construyendo',
      lead: 'Esto es lo que te propusiste ser. Cámbialo cuando cambies tú.',

      central: {
        label: 'Tu identidad',
        lead: 'Te estás convirtiendo en',
        edit: 'Cambiar esto',
        editorTitle: 'Quién quieres ser',
        prefix: 'Alguien que',
        placeholder: 'crece cada día',
        hint: 'Amplia y estable. No es algo que se termine.',
        restored: 'Esta parte siempre está contigo. Dejamos la que tenías.',
        history: 'Ver cómo ha cambiado',
        historyHide: 'Cerrar el historial',
        historyTitle: 'Quién has sido',
        historyCurrent: 'Ahora',
        historyUntilTemplate: 'Hasta el {hasta}',
        historyEmpty: 'Cuando cambies esto, lo anterior se queda aquí.',
      },

      areas: {
        title: 'Dónde lo estás construyendo',
        lead: 'Hasta tres áreas a la vez. Las que importan ahora.',
        empty: 'Todavía no has elegido áreas. Tu identidad se sostiene igual.',
        open: 'Elegir áreas',
        close: 'Listo',
        pickerTitle: 'Elige hasta tres',
        pickerLead: 'Podrás cambiarlas cuando quieras.',
        max: 'Tres a la vez es el tope, para que quepan de verdad. Quita una y hay sitio para otra.',
        identityPrefixTemplate: 'En {area} soy alguien que',
        identityTemplate: 'En {area}, alguien que {identidad}.',
        identityPlaceholder: 'cuida su cuerpo',
        identityEmpty: 'Si quieres, ponle palabras a esta área. Si no, así está bien.',
        identityAdd: 'Ponerle palabras',
        identityEdit: 'Cambiar esto',
        pause: 'Pausar',
        pausedTitle: 'En pausa',
        pausedNote: 'Aquí está todo, tal como lo dejaste.',
        resume: 'Reanudar',
        remove: 'Quitar',
        names: {
          salud: 'Salud',
          trabajo: 'Trabajo',
          relaciones: 'Relaciones',
          espiritualidad: 'Espiritualidad',
          crecimiento: 'Crecimiento personal',
          finanzas: 'Finanzas',
          creatividad: 'Creatividad',
        },
      },

      editor: {
        save: 'Guardar',
        cancel: 'Cancelar',
      },

      error: {
        load: {
          body: 'No pudimos abrir esto. Lo que escribiste sigue guardado.',
          retry: 'Reintentar',
        },
        save: {
          body: 'No pudimos guardar ese cambio. Lo tenemos aquí.',
          retry: 'Reintentar',
        },
      },
    },

    // La palabra "ritual" no aparece en ninguna pantalla de Formia
    // (§C3.0, principio 1 · §C3.5, criterio de aceptación 2).
    habitos: {
      title: 'Hábitos',
      lead: 'Lo que haces porque es lo que hace quien quieres ser.',
      add: 'Nuevo hábito',
      back: 'Volver',
      empty: 'Todavía no hay hábitos aquí. Uno solo es un buen comienzo.',

      momento: {
        manana: 'Mañana',
        noche: 'Noche',
        ninguno: 'Sin momento fijo',
      },

      // Confirmación al completar los hábitos de un momento (§C7.7.6).
      // Sustituye a "Ritual completo. Buen comienzo." — vocabulario de Lumia
      // dentro de Formia. Acompaña a la barra que se llena y nada más
      // (RN-FO-HAB-02): sin exclamación y sin celebrar de más.
      progreso: {
        template: '{hecho} de {total}',
        completoManana: 'Todo lo de esta mañana, hecho.',
        completoNoche: 'Todo lo de esta noche, hecho.',
      },

      grupo: {
        inactiva: 'No activa ahora',
        pausadosTitle: 'En pausa',
        archivadosTitle: 'Archivados',
        revisionTitle: 'Sin identidad todavía',
        revisionBody: 'Ábrelos cuando quieras y elige a quién construyen.',
      },

      detalle: {
        totalTemplate: 'Lo has hecho {n} veces',
        totalUna: 'Lo has hecho una vez',
        totalNinguna: 'Aquí aparecerán tus marcas.',
        diasTemplate: '{n} de los últimos {total} días',
        gridTitle: 'Los últimos 90 días',
        edit: 'Editar',
        pause: 'Pausar',
        paused: 'Pausado. Aquí estará cuando lo quieras de vuelta.',
        pausedLabel: 'En pausa',
        resume: 'Reanudar',
        archive: 'Archivar',
        archived: 'Archivado. Su historia se queda contigo.',
        archivedLabel: 'Archivado',
      },

      editor: {
        titleNuevo: 'Nuevo hábito',
        titleEditar: 'Editar hábito',
        nombre: {
          label: '¿Cuál es tu nuevo hábito?',
          labelEditar: 'El hábito',
          placeholder: 'Beber agua, leer, estirar…',
        },
        emoji: {
          label: 'Un emoji, si quieres',
          choose: 'Elegir',
          none: 'Sin emoji',
        },
        identidad: {
          label: '¿Qué identidad construye este hábito?',
          // RN-FO-H3-04 — La sugerencia se propone, nunca se asigna sola.
          suggested: 'Por lo que escribiste, quizá sea esta. Tócala si es así.',
        },
        contexto: {
          label: '¿En qué momento del día?',
          hint: 'Solo es una etiqueta. Nada te espera a esa hora.',
        },
        // RN-FO-H3-02 — Dice qué falta, nunca que hayas hecho algo mal.
        // Prohibido: "campo obligatorio", "debes seleccionar", asteriscos rojos.
        pendiente: 'Elige a quién estás construyendo con esto.',
        pendienteNombre: 'Escribe primero qué quieres hacer.',
        save: 'Guardar',
        cancel: 'Cancelar',
      },

      error: {
        load: {
          body: 'No pudimos abrir tus hábitos. Siguen guardados.',
          retry: 'Reintentar',
        },
        save: {
          body: 'No pudimos guardar eso. Tu marca sigue aquí.',
          retry: 'Reintentar',
        },
      },
    },

    // Además del léxico general de §3.6, aquí está prohibido el vocabulario de
    // rendimiento y cualquier porcentaje de cumplimiento (SPEC_05 §8). La lista
    // exacta y la prueba que recorre este namespace entero están en
    // `src/lib/__tests__/constancia.test.js`.
    progreso: {
      title: 'Progreso',
      lead: 'La evidencia de quien estás siendo. Esto solo suma.',
      empty: 'Aquí se irá acumulando lo que construyas. Empieza por un hábito.',

      constancia: {
        title: 'Tu constancia',
        // Cuenta días con algún hábito marcado, no días de presencia en la app:
        // desde Formia no se ve el resto (RN-DB4-01), y decir "días contigo"
        // sobre esta cifra sería contarle a alguien menos días de los que estuvo.
        template: '{n} días construyendo',
        uno: 'Un día construyendo',
        cero: 'Aquí aparecerán tus días en cuanto marques algo.',
      },

      identidad: {
        diasTemplate: '{n} días construyendo esto',
        diasUno: 'Un día construyendo esto',
        diasCero: 'Todavía sin marcas. Aquí se van a guardar.',
        inactiva: 'No activa ahora',
      },

      // §C4.3 — Evidencia de identidad: identidad + área + evidencia numérica.
      // Se genera por reglas, no por IA (§C4.2), y siempre puede citar los días
      // que la sostienen (RN-SI-03).
      evidencia: {
        areaTemplate: 'Eres {identidad}. En {area} lo demostraste {n} de los últimos {total} días.',
        centralTemplate: 'Eres {identidad}. Lo demostraste {n} de los últimos {total} días.',
        ver: 'Ver los días',
        ocultar: 'Cerrar',
      },
    },
  },

  // El namespace `empty` de Fase 0 se retira con SPEC_07. Sus cuatro cadenas
  // tienen dueño en otro sitio —`lumia.journal.vacio`, `lumia.historial.vacio`,
  // `insights.empty` y `formia.habitos.empty`— y ninguna se usaba ya. Dos
  // versiones del mismo estado vacío es una invitación a editar la que nadie ve.

  // ─── Respiración (SPEC_13 §7) ─────────────────────────────────────────────
  // Voz de **Strivo madre**, no de Lumia ni de Formia: sobria, cálida, sin
  // adornos. Es una herramienta transversal y suena a la marca, no a un espacio.
  //
  // Este es el desvío deliberado frente a la referencia externa que se analizó,
  // que se posiciona como herramienta clínica. Aquí no aparece ni una palabra de
  // ese registro: Strivo es un refugio, no una consulta. `lint:copy` recorre este
  // namespace entero y lo comprueba, término por término (SPEC_13 §7.1).
  respiracion: {
    titulo: 'Respiración',
    subtitulo: 'Un momento para bajar el ritmo',

    patrones: {
      calma553: {
        nombre: 'Calma 5-5-3',
        descripcion:
          'El ritmo de Strivo. Inhalas, exhalas, y dejas una pausa antes de volver a empezar.',
      },
      caja: {
        nombre: 'Respiración en caja',
        descripcion: 'Cuatro tiempos iguales. Ordena la cabeza cuando anda dispersa.',
      },
      cuatroSieteOcho: {
        nombre: '4-7-8',
        descripcion: 'Exhalación larga después de una retención. Ayuda a soltar.',
      },
      exhalacionLarga: {
        nombre: 'Exhalación larga',
        descripcion: 'Sueltas el doble de lo que tomas. Sencillo y hondo.',
      },
      coherencia: {
        nombre: 'Coherencia 5-5',
        descripcion: 'Simétrica y sostenida. Buena para quedarse un rato.',
      },
      entradaSuave: {
        nombre: 'Entrada suave 4-6',
        descripcion: 'Sin retenciones. Si es tu primera vez, empieza aquí.',
      },
      personalizado: {
        nombre: 'A tu medida',
        descripcion: 'Ajusta cada tiempo como te acomode.',
      },
    },

    fases: {
      inhalar: 'Inhala',
      retenerLleno: 'Sostén',
      exhalar: 'Exhala',
      retenerVacio: 'Descansa',
    },

    // Para lector de pantalla: más explícitas que las visuales, porque quien las
    // oye no tiene el círculo delante para saber cuánto falta.
    fasesAccesibles: {
      inhalar: 'Inhala durante {segundos} segundos',
      retenerLleno: 'Sostén el aire durante {segundos} segundos',
      exhalar: 'Exhala durante {segundos} segundos',
      retenerVacio: 'Descansa durante {segundos} segundos',
    },

    acomodo: {
      titulo: 'Acomódate',
      subtitulo: 'Suelta los hombros. Empezamos en un momento.',
      saltar: 'Empezar ya',
    },

    duracion: {
      titulo: '¿Cuánto tiempo?',
      modoCiclos: 'Por respiraciones',
      modoMinutos: 'Por tiempo',
      modoAbierta: 'Sin final',
      ciclos: '{n} respiraciones',
      minutos: 'Unos {n} minutos',
      abierta: 'Hasta que quieras',
      // RN-RE-MOT-20 — se dice en voz alta que la cifra es aproximada, porque el
      // ciclo en curso siempre se termina y eso alarga la sesión unos segundos.
      aproximado:
        'Terminamos al cerrar la última respiración, así que puede alargarse unos segundos.',
    },

    controles: {
      empezar: 'Empezar',
      pausar: 'Pausar',
      reanudar: 'Seguir',
      terminar: 'Terminar',
      salir: 'Salir',
    },

    cierre: {
      titulo: 'Listo',
      resumenCiclos: 'Respiraste {n} veces.',
      resumenTiempo: '{n} minutos contigo.',
      repetir: 'Otra vez',
      volverAlInicio: 'Volver al inicio',
    },

    // RN-RE-COPY-01/02/03 — Una tarjeta calmada que se descarta con un toque, no
    // un modal que bloquea. Sin lenguaje médico y sin pedir aceptar nada.
    seguridad: {
      aviso:
        'Si en algún momento te mareas o te incomoda, para y respira normal. No hay nada que ganar aguantando.',
      entendido: 'Entendido',
    },

    vacio: {
      sinFavoritos:
        'Todavía no guardas ninguna. Cuando encuentres un ritmo que te acomode, guárdalo aquí.',
    },
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
    manana: '¿Cómo quieres sentirte hoy?', // A hora de despertar
    noche: '¿Cómo cerrar el día?', // A hora de dormir
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
    long: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  },
}

// Utilidad: interpolar template strings
// Uso: interpolate(copy.onboarding.p11.closingTemplate, { identidad: 'crece' })
export function interpolate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

export default copy
