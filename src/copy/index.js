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

      // Filas dinámicas de agradecimientos (§5.3, Bloque 2).
      filas: {
        anadir: 'Añadir otra',
        quitar: 'Quitar',
        // Solo se pregunta si hay texto de sobra que perder (§5.3, B2).
        quitarConfirmar: '¿Quitar esto?',
        // El tope no reprende: celebra en voz baja y deja de crecer.
        tope: 'Diez cosas. Nada mal.',
      },

      // ─── La mañana, en tres momentos (§5.3, actualización del 23 ago) ──────
      // El recorrido pregunta, por este orden: cómo estoy, cómo me gustaría
      // estar, qué agradezco y qué puedo hacer hoy. Después, algunos días, una
      // pausa opcional. Nada bloquea y todo se puede dejar en blanco.
      //
      // Las preguntas principales **no cambian de redacción nunca**: la
      // estabilidad es lo que las vuelve familiares (§6 de la actualización).
      // Lo que se personaliza son las ideas de apoyo, y solo esas.
      manana: {
        titulo: 'Tu mañana',

        // El indicador cuenta momentos, no campos: "1 de 3" habla de dónde
        // estás en el recorrido, no de cuánto te falta por rellenar.
        pasos: {
          etiqueta: 'Momentos de la mañana',
          indicadorTemplate: '{n} de {total}',
          atras: 'Atrás',
          siguiente: 'Continuar',
          finalizar: 'Listo',
        },

        // ─── Momento 1A — punto de partida ───────────────────────────────────
        // Selección única: se nombra un estado, no se hace un inventario.
        // Aquí sí caben las emociones difíciles, porque la pregunta es qué hay.
        animo: {
          titulo: '¿Cómo me siento esta mañana?',
          lead: 'Elige lo que más se acerque a cómo estás.',
          // Palabra propia: hasta 30 caracteres, sin emoji automático y
          // siempre editable. No pasa por el helper de género (RN-GEN-06).
          otra: {
            chip: '＋ Algo más',
            label: 'Cómo me siento esta mañana, en mis palabras',
            placeholder: 'en tus palabras',
            confirmar: 'Listo',
            quitar: 'Quitar',
          },
          catalogo: [
            { id: 'calma', emoji: '😌', label: { m: 'En calma', f: 'En calma', n: 'En calma' } },
            {
              id: 'energia',
              emoji: '⚡',
              label: { m: 'Con energía', f: 'Con energía', n: 'Con energía' },
            },
            { id: 'alegre', emoji: '😊', label: { m: 'Alegre', f: 'Alegre', n: 'Alegre' } },
            {
              id: 'motivado',
              emoji: '✨',
              label: { m: 'Motivado', f: 'Motivada', n: 'Con motivación' },
            },
            { id: 'neutral', emoji: '😐', label: { m: 'Neutral', f: 'Neutral', n: 'Neutral' } },
            {
              id: 'pensativo',
              emoji: '🤔',
              label: { m: 'Pensativo', f: 'Pensativa', n: 'Pensando' },
            },
            {
              id: 'cansado',
              emoji: '😴',
              label: { m: 'Cansado', f: 'Cansada', n: 'Con cansancio' },
            },
            {
              id: 'poca_energia',
              emoji: '🪫',
              label: { m: 'Con poca energía', f: 'Con poca energía', n: 'Con poca energía' },
            },
            {
              id: 'inquieto',
              emoji: '😟',
              label: { m: 'Inquieto', f: 'Inquieta', n: 'Con inquietud' },
            },
            {
              id: 'abrumado',
              emoji: '😵‍💫',
              label: { m: 'Abrumado', f: 'Abrumada', n: 'Con demasiado encima' },
            },
            { id: 'triste', emoji: '😔', label: { m: 'Triste', f: 'Triste', n: 'Triste' } },
          ],
        },

        // ─── Momento 1B — intención ──────────────────────────────────────────
        // Una intención acompaña; no es una meta que haya que alcanzar. La
        // distancia entre 1A y 1B no se mide, no se nombra y no se colorea.
        intencion: {
          titulo: '¿Cómo me gustaría sentirme durante el día de hoy?',
          lead: 'Elige una intención para acompañar tu día.',
          otra: {
            chip: '＋ Algo más',
            label: 'Cómo me gustaría sentirme, en mis palabras',
            placeholder: 'en tus palabras',
            confirmar: 'Listo',
            quitar: 'Quitar',
          },
          catalogo: [
            { id: 'calma', emoji: '😌', label: { m: 'En calma', f: 'En calma', n: 'En calma' } },
            {
              id: 'energia',
              emoji: '⚡',
              label: { m: 'Con energía', f: 'Con energía', n: 'Con energía' },
            },
            { id: 'enfocado', emoji: '🎯', label: { m: 'Enfocado', f: 'Enfocada', n: 'Con foco' } },
            {
              id: 'motivado',
              emoji: '✨',
              label: { m: 'Motivado', f: 'Motivada', n: 'Con motivación' },
            },
            {
              id: 'confianza',
              emoji: '🧭',
              label: { m: 'Con confianza', f: 'Con confianza', n: 'Con confianza' },
            },
            { id: 'ligero', emoji: '🪶', label: { m: 'Ligero', f: 'Ligera', n: 'Con ligereza' } },
            { id: 'presente', emoji: '🌿', label: { m: 'Presente', f: 'Presente', n: 'Presente' } },
            {
              id: 'paciencia',
              emoji: '🌱',
              label: { m: 'Con paciencia', f: 'Con paciencia', n: 'Con paciencia' },
            },
            { id: 'alegre', emoji: '😊', label: { m: 'Alegre', f: 'Alegre', n: 'Alegre' } },
          ],
        },

        // ─── Momento 2 — gratitud ────────────────────────────────────────────
        // Abre con **un** campo. Varios campos vacíos a la vez se leen como
        // huecos por rellenar, y esto no es un formulario.
        gratitud: {
          titulo: '¿Qué agradezco hoy?',
          lead: 'Puede ser algo pequeño.',
          placeholder: 'Una persona, un momento o algo cotidiano…',
          anadir: 'Añadir otro',
          // Salida discreta, sin nada que reprochar al volver mañana.
          omitir: 'Omitir por hoy',
          // Las ideas de apoyo se conservan de la versión anterior: se ofrecen
          // bajo el renglón enfocado tras 5 s sin escribir en él, y **nunca**
          // rellenan el campo — abren una pregunta detonante y ahí acaban.
          // Ninguna da por hecho que la mañana esté siendo agradable.
          sugerencias: {
            titulo: '¿Te ayudo con una idea?',
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

        // ─── Momento 3 — acción del día ──────────────────────────────────────
        // Una acción, no una lista de pendientes. Las ideas se ofrecen; tocar
        // una la deja en el campo para que se pueda cambiar entera.
        accion: {
          titulo: '¿Qué puedo hacer hoy para acercarme a esa sensación?',
          lead: 'Piensa en algo sencillo y posible.',
          placeholder: 'Hoy puedo…',
          ideasTitulo: 'Por si te sirve',
          // §6 — Solo lo que la propia persona escribió antes para esa misma
          // intención. Nunca se afirma que le funcionara: eso no se sabe.
          anterioresTitulo: 'Ideas que elegiste antes',
          ideas: {
            calma: [
              'Hacer una pausa consciente',
              'Silenciar notificaciones un momento',
              'Respirar durante tres minutos',
            ],
            energia: [
              'Dar una caminata breve',
              'Tomar agua al comenzar',
              'Empezar con algo sencillo',
            ],
            enfocado: [
              'Elegir una prioridad',
              'Trabajar 25 minutos sin interrupciones',
              'Despejar mi espacio',
            ],
            motivado: [
              'Empezar solo por cinco minutos',
              'Dividir algo grande en un primer paso',
              'Reconocer un pequeño avance',
            ],
            confianza: [
              'Dar un paso que he pospuesto',
              'Recordar algo que sé hacer bien',
              'Pedir el apoyo que necesito',
            ],
            ligero: [
              'Dejar fuera algo no esencial',
              'Hacer una cosa a la vez',
              'Tomarme una pausa sin culpa',
            ],
            presente: [
              'Hacer una actividad sin el teléfono',
              'Prestar atención a una comida',
              'Volver a mi respiración',
            ],
            paciencia: [
              'Hacer una pausa antes de responder',
              'Dejar espacio entre actividades',
              'Avanzar sin apresurarme',
            ],
            alegre: [
              'Buscar un momento que disfrute',
              'Escuchar algo que me anime',
              'Compartir tiempo con alguien',
            ],
            // Para una intención escrita a mano, o sin intención elegida. No
            // se interpreta lo que alguien escribió: se ofrece lo general.
            generales: [
              'Dar un paso pequeño',
              'Hacer una pausa',
              'Elegir una prioridad',
              'Cuidar algo que necesito',
            ],
          },
        },

        // ─── Pausa opcional (§7) ─────────────────────────────────────────────
        // No es una afirmación positiva y no se llama así: cabe el ánimo, el
        // permiso, la perspectiva o el trato amable, sin obligación de sonar
        // optimista.
        reflexion: {
          titulo: 'Si quieres, una última pausa',
          opcional: 'Opcional',
          omitir: 'Ahora no',
          banco: [
            {
              id: 'recordarme',
              titulo: '¿Qué necesito recordarme hoy?',
              lead: 'Escribe una frase que quieras llevar contigo.',
            },
            {
              id: 'tratarme',
              titulo: '¿Cómo quiero tratarme hoy?',
              lead: 'Piensa en el tono con el que quieres acompañarte.',
            },
            {
              id: 'sencillo',
              titulo: '¿Qué puedo hacer más sencillo hoy?',
              lead: 'No todo necesita la misma energía.',
            },
          ],
        },

        // ─── Cierre (§8) ─────────────────────────────────────────────────────
        // Sin puntuación, sin porcentajes y sin felicitación. Con todo en
        // blanco cierra igual, y lo dice sin señalar el vacío.
        cierre: {
          intencionTemplate: 'Tu intención para hoy: {intencion}',
          accionTemplate: 'Un paso que puedes dar: {accion}',
          vacio: 'Tu día puede comenzar desde donde estás.',
          cta: 'Comenzar mi día',
        },

        // La pantalla de consulta. **No tiene etiquetas propias**: repite las
        // preguntas del recorrido, con la misma redacción y la misma
        // tipografía, y debajo lo que se respondió. Un resumen con etiquetas
        // cortas —"Cómo empezaste · Cansada"— sería un inventario con otro
        // vocabulario, y §6 pide que las preguntas se digan siempre igual.
        //
        // Tampoco hay etiqueta de "hecho": el contenido está a la vista y
        // decirlo sería contarle a alguien lo que está leyendo.
        resumen: {
          editar: 'Cambiar algo',
        },

        // Catálogo heredado. Las mañanas escritas antes de esta actualización
        // guardaron hasta tres emociones de esta lista en `morning.emotions`;
        // se conserva **solo para leerlas** en el Historial (§9: nada de lo ya
        // escrito se sobrescribe ni desaparece). Ninguna pantalla de escritura
        // lo ofrece.
        emocionesHeredadas: {
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
      },

      // ─── La noche, en tres momentos (actualización del 23 ago a §5.4) ─────
      //
      //   1 de 3 · ¿Qué quiero reconocer de hoy?     (lista de 1 a 3, uno al abrir)
      //   2 de 3 · Una reflexión breve               (rotativa, o ligada a la mañana)
      //   3 de 3 · ¿Cómo me siento al cerrar el día? (selección única, 12 + Algo más)
      //      +   · Si quieres, deja algo aquí        (por la emoción, o a mano)
      //      →     El cierre: "Tu día puede terminar aquí."
      //
      // **La noche no evalúa el día.** No pide que nada haya salido bien, no
      // exige una lección, no pregunta si se cumplió lo que se dijo por la
      // mañana y no cuenta nada de lo escrito. Reconocer no es lo mismo que
      // agradecer: cabe lo que costó, lo que se intentó y lo que se atravesó.
      //
      // La pregunta reflexiva **cambia de una noche a otra** y es la única del
      // recorrido que lo hace: las otras dos se dicen siempre igual, porque la
      // estabilidad es lo que las vuelve familiares.
      noche: {
        titulo: 'Tu noche',
        // §5.4, Bloque 1 — frase de apertura con el día de la semana.
        aperturaTemplate: 'Vamos a cerrar el {dia}.',

        // El indicador cuenta momentos, no campos. La descarga opcional no
        // entra en la cuenta: no está todas las noches, y un total que cambia
        // de un día para otro deja de orientar.
        pasos: {
          etiqueta: 'Momentos de la noche',
          indicadorTemplate: '{n} de {total}',
          atras: 'Atrás',
          siguiente: 'Continuar',
          finalizar: 'Listo',
        },

        // ─── Momento 1 — reconocimiento del día ──────────────────────────────
        // Sustituye a "¿Qué agradezco de este día?". La redacción es más ancha
        // a propósito: no pide que el día haya sido bueno, ni que lo escrito
        // suene positivo. Abre con **un** campo; el segundo lo pide quien
        // escribe.
        reconocimiento: {
          titulo: '¿Qué quiero reconocer de hoy?',
          lead: 'Puede ser algo que disfrutaste, intentaste, enfrentaste o resolviste.',
          placeholder: 'Algo que hice, sentí o atravesé…',
          anadir: 'Añadir otro',
          // Salida discreta, sin nada que reprochar al volver mañana.
          omitir: 'Omitir por hoy',
        },

        // ─── Momento 2 — reflexión rotativa (§4, §5, §6) ─────────────────────
        // Una sola pregunta por noche, nunca dos. El banco rota sin repetirse
        // hasta haber pasado por las demás, y algunas noches lo sustituye la
        // pregunta ligada a la intención de esa misma mañana.
        reflexion: {
          opcional: 'Opcional',
          omitir: 'Ahora no',
          placeholder: 'Lo que se te ocurra',
          banco: [
            {
              id: 'general',
              titulo: '¿Qué me dejó el día de hoy?',
              lead: 'Una emoción, un aprendizaje o algo que quieras recordar.',
            },
            {
              id: 'autoconocimiento',
              titulo: '¿Qué aprendí hoy sobre mí?',
              lead: 'No necesita ser una gran conclusión.',
            },
            {
              id: 'memoria',
              titulo: '¿Qué quiero recordar de este día?',
              lead: 'Puede ser un instante muy pequeño.',
            },
            {
              id: 'espacio',
              titulo: '¿Qué ocupó más espacio en mí hoy?',
              lead: 'Una emoción, una preocupación, una persona o una idea.',
            },
            {
              id: 'soltar',
              titulo: '¿Qué necesito soltar por hoy?',
              lead: 'No tienes que resolverlo esta noche.',
            },
          ],
          // §6 — La única personalización del recorrido. Nombra la intención
          // que se eligió por la mañana y pregunta qué se notó; **nunca** si se
          // cumplió, y nunca convierte la respuesta en una medida.
          manana: {
            tituloTemplate:
              'Esta mañana elegiste {emocion} como intención. ¿Qué notaste al respecto?',
            lead: 'No importa si el día resultó distinto a lo que esperabas.',
          },
        },

        // ─── Momento 3 — cómo se cierra el día ───────────────────────────────
        // Sustituye a "¿Cómo te vas a dormir?". Selección única: nombrar un
        // estado no es hacer un inventario.
        //
        // Las emociones difíciles comparten jerarquía con las agradables: mismo
        // tamaño, mismo borde, mismo orden de lectura. No hay rojo, no hay
        // aviso y no hay ninguna que esté peor contestada que otra.
        emocion: {
          titulo: '¿Cómo me siento al cerrar el día?',
          lead: 'Elige lo que más se acerque a cómo estás.',
          // Palabra propia: hasta 30 caracteres, sin emoji automático y
          // siempre editable. No pasa por el helper de género (RN-GEN-06).
          otra: {
            chip: '＋ Algo más',
            label: 'Cómo me siento al cerrar el día, en mis palabras',
            placeholder: 'en tus palabras',
            confirmar: 'Listo',
            quitar: 'Quitar',
          },
          catalogo: [
            { id: 'en_paz', emoji: '😌', label: { m: 'En paz', f: 'En paz', n: 'En paz' } },
            {
              id: 'tranquilo',
              emoji: '🌿',
              label: { m: 'Tranquilo', f: 'Tranquila', n: 'En calma' },
            },
            {
              id: 'agradecido',
              emoji: '🤍',
              label: { m: 'Agradecido', f: 'Agradecida', n: 'Con gratitud' },
            },
            {
              id: 'orgulloso',
              emoji: '✨',
              label: { m: 'Orgulloso', f: 'Orgullosa', n: 'Con orgullo' },
            },
            {
              id: 'aliviado',
              emoji: '😮‍💨',
              label: { m: 'Aliviado', f: 'Aliviada', n: 'Con alivio' },
            },
            {
              id: 'pensativo',
              emoji: '🤔',
              label: { m: 'Pensativo', f: 'Pensativa', n: 'Pensando' },
            },
            { id: 'neutral', emoji: '😐', label: { m: 'Neutral', f: 'Neutral', n: 'Neutral' } },
            {
              id: 'cansado',
              emoji: '😴',
              label: { m: 'Cansado', f: 'Cansada', n: 'Con cansancio' },
            },
            {
              id: 'inquieto',
              emoji: '😟',
              label: { m: 'Inquieto', f: 'Inquieta', n: 'Con inquietud' },
            },
            {
              id: 'frustrado',
              emoji: '😣',
              label: { m: 'Frustrado', f: 'Frustrada', n: 'Con frustración' },
            },
            { id: 'triste', emoji: '😔', label: { m: 'Triste', f: 'Triste', n: 'Triste' } },
            {
              id: 'abrumado',
              emoji: '😵‍💫',
              label: { m: 'Abrumado', f: 'Abrumada', n: 'Con demasiado encima' },
            },
          ],
        },

        // ─── Descarga opcional (§8) ──────────────────────────────────────────
        // Un espacio para dejar algo, no una intervención. La app no interpreta
        // lo que se escriba aquí, no responde y no propone nada: se guarda y se
        // cierra el día.
        descarga: {
          // El enlace va debajo de las emociones, siempre y para todas. Que
          // aparezca solo tras una emoción difícil convertiría el catálogo en
          // un diagnóstico.
          abrir: 'Necesito soltar algo antes de cerrar',
          opcional: 'Opcional',
          titulo: '¿Hay algo que quieras dejar aquí por hoy?',
          lead: 'No necesitas resolverlo ahora.',
          placeholder: 'Lo que quieras dejar aquí',
          omitir: 'Ahora no',
          cta: 'Dejarlo aquí y cerrar mi día',
        },

        // ─── Cierre (§10) ────────────────────────────────────────────────────
        // Sin recuento, sin porcentaje, sin comparar la mañana con la noche y
        // sin prometer que nadie se va a sentir mejor. Dos líneas fijas, una de
        // ellas distinta si se dejó algo escrito en la descarga, y —si hay algo
        // reconocido— una sola de esas líneas, la primera.
        cierre: {
          titulo: 'Tu día puede terminar aquí.',
          lead: 'Lo que viviste hoy no necesita quedar resuelto esta noche.',
          leadDescarga: 'Por ahora, puedes dejarlo aquí.',
          reconocidoTitulo: 'Algo que reconoces de hoy',
          cta: 'Cerrar mi día',
          despedida: 'Buenas noches.',
          reabrir: 'Puedes volver y cambiar lo que quieras.',
        },

        // La pantalla de consulta. Repite las preguntas del recorrido con su
        // redacción exacta; no tiene etiquetas propias ni marca de "hecho".
        resumen: {
          editar: 'Cambiar algo',
        },

        // ─── Catálogo heredado: "¿Cómo te vas a dormir?" ─────────────────────
        // Las noches escritas antes de esta actualización guardaron hasta dos
        // estados de esta lista en `nightRitual.sleepState`; se conserva **solo
        // para leerlas** en el Historial (§11: nada de lo ya escrito se
        // sobrescribe ni desaparece). Ninguna pantalla de escritura lo ofrece.
        sueno: {
          guardadoTemplate: 'Te fuiste a dormir: {estados}',
          separador: ' · ',
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
      },
    },

    // ─── Respiración diaria (§C2.3) ─────────────────────────────────────────
    // Ex-R1. Dejó de ser el primer paso de un ritual y es una experiencia
    // propia de la sección Mañana.
    //
    // **RN-LU-RESP-01 se nota en el copy.** Los 39 segundos solo son aceptables
    // porque nada de esto se abre solo ni retiene a nadie, y el texto lo dice
    // sin que haya que descubrirlo: se anuncia lo que dura y se anuncia que se
    // puede salir, antes de empezar. Eso ocurre en `lead`, en la pantalla del
    // ejercicio, que es la que tiene el botón que lo arranca; la entrada de las
    // dos secciones de Hoy solo invita.
    //
    // El copy de Fase 0 —"Antes de empezar, respira una vez"— quedó sin objeto
    // (§C7.7.6): "antes de empezar" presuponía un ritual que venía después, y
    // no viene nada después. Este lo sustituye. Invita, no vende: sin
    // exclamaciones, sin lenguaje de meditación guiada y sin prometer que nadie
    // se va a sentir mejor.
    respiracion: {
      // La entrada es una tarjeta, no una línea de apoyo, y por eso el rótulo
      // es toda su superficie de texto: un subtítulo la devolvería al registro
      // informativo del que se la quiso sacar.
      //
      // **Sin duración aquí.** "Poco más de medio minuto" se retiró de las dos
      // secciones: en la tarjeta era el único texto secundario y hacía que la
      // invitación se leyera como una etiqueta. Lo que dura se sigue diciendo
      // antes de empezar, en `lead`, que es la pantalla donde hay un botón que
      // arranca el ejercicio — RN-LU-RESP-01 se cumple ahí, que es donde
      // alguien decide de verdad.
      entrada: {
        abrir: 'Respira un momento',
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
        // Salida intencional del editor. No es un botón de guardar —el journal
        // se guarda solo (§5.8)— y por eso no dice "Guardar": diría que sin
        // tocarlo no se guardó. Es el cierre del flujo de escritura, la misma
        // palabra con la que Respiración cierra el suyo.
        listo: 'Listo',
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
        animo: 'Cómo empezaste',
        intencion: 'Tu intención',
        gratitud: 'Lo que agradeciste',
        accion: 'Tu paso de ese día',
        pausa: 'Tu pausa',
        // La noche de tres momentos (actualización del 23 ago).
        reconocimiento: 'Lo que reconociste',
        // La reflexión se titula con la pregunta que salió esa noche; esta
        // etiqueta es el respaldo para las noches guardadas sin `reflectionId`.
        reflexion: 'Tu reflexión',
        emocionCierre: 'Cómo cerraste el día',
        descarga: 'Lo que dejaste ahí',
        // Las dos etiquetas de las noches de la versión 1. Ninguna pantalla
        // vuelve a escribir esos campos; las noches que los tienen se siguen
        // leyendo igual (§11).
        aprendizaje: 'Lo que aprendiste',
        // Las dos etiquetas de las mañanas de la versión 1. Ninguna pantalla
        // vuelve a escribir esos campos; los días que los tienen se siguen
        // leyendo igual (§9).
        emociones: 'Cómo querías sentirte',
        granVision: 'Cómo imaginabas el día',
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

    // SPEC_14 §12 daba por hecho que no hacía falta copy nuevo, pero
    // RN-RE-VIS-26 pide anunciar la pausa y no había cómo decirlo: `controles`
    // tiene la etiqueta del botón ('Pausar'), que es una acción y no un estado.
    // Leerle "Pausar" a alguien que ya pausó es contarle lo que puede hacer,
    // no lo que pasa.
    estados: {
      pausado: 'En pausa',
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

    // SPEC_15 §4.4 — El sonido de fondo. Las descripciones existen porque elegir
    // un sonido por su nombre es adivinar: "Olas" no dice si rompen o si van y
    // vienen. La vista previa lo resuelve del todo, pero el texto llega antes.
    sonidos: {
      titulo: 'Sonido de fondo',
      silencio: { nombre: 'Silencio', descripcion: 'Solo tu respiración.' },
      lluvia: { nombre: 'Lluvia', descripcion: 'Constante, sin tormenta.' },
      olas: { nombre: 'Olas', descripcion: 'Van y vienen, muy lentas.' },
      viento: { nombre: 'Viento', descripcion: 'Entre los árboles, a lo lejos.' },
      cristales: { nombre: 'Cristales', descripcion: 'Notas sueltas que aparecen y se van.' },
      fuego: { nombre: 'Fuego', descripcion: 'Chisporroteo bajo.' },
      volumen: 'Volumen',
      guia: 'Sonido que marca el ritmo',
      guiaAyuda: 'Un tono suave al empezar cada inhalación y cada exhalación.',
      volumenGuia: 'Volumen del ritmo',
      // Caso 6.1 y 6.2 — Nada bloquea: la respiración sigue entera en silencio.
      sinSoporte: 'Tu navegador no reproduce sonido aquí. La respiración funciona igual.',
      activar: 'Activar el sonido',
    },

    favoritos: {
      titulo: 'Guardadas',
      recientes: 'Últimas veces',
      guardar: 'Guardar esta combinación',
      guardarCambios: 'Guardar cambios',
      guardarComoNueva: 'Guardar como nueva',
      modificado: 'Modificado',
      nombreEtiqueta: '¿Cómo la quieres llamar?',
      nombrePlaceholder: 'Antes de dormir',
      nombreVacio: 'Ponle un nombre para poder encontrarla.',
      nombreLargo: 'Máximo 40 caracteres.',
      nombreRepetido: 'Ya tienes una con ese nombre.',
      reemplazar: 'Reemplazar la anterior',
      yaGuardada: 'Ya la tienes guardada como «{nombre}».',
      limite: 'Puedes guardar hasta 20. Borra alguna que ya no uses para dejar lugar.',
      renombrar: 'Cambiar el nombre',
      eliminar: 'Eliminar',
      confirmarEliminar: '¿Eliminar «{nombre}»?',
      eliminada: 'Eliminada',
      deshacer: 'Deshacer',
      sonidoNoDisponible: 'El sonido de esta combinación ya no está. La cargamos en silencio.',
      // RN-RE-FAV-13 — Un patrón que ya no pasa la validación se corrige al
      // cargarlo y se dice. No se descarta: lo demás de esa combinación vale.
      patronAjustado: 'Ajustamos un poco los tiempos de esta combinación.',
      opciones: 'Más opciones',
      cancelar: 'Cancelar',
      guardarAccion: 'Guardar',
      // Es puntuación, pero se ve, y elegirla es una decisión editorial: podría
      // ser «·», «•» o un guion largo. Vive aquí como todo lo que se lee.
      separador: ' · ',
    },

    // SPEC_16 §6 — El acceso del Home. Sin subtítulo a propósito (RN-RE-NAV-02):
    // Lumia y Formia llevan uno porque son marcas; Respiración es una función y
    // su nombre ya la describe. Añadirle subtítulo la asciende de categoría.
    home: {
      acceso: 'Respiración',
    },

    configuracion: {
      titulo: 'Respiración',
      visual: 'Cómo lo quieres ver',
      visualCirculo: 'Círculo',
      visualLinea: 'Línea',
      ritmo: 'Ritmo',
      ladoUnico: 'Cada lado',
      cajaModificada: 'Al cambiar un tiempo por separado, esto deja de ser respiración en caja.',
      tiempo: 'Tiempo',
      info: 'Cómo usar esto',
      // RN-RE-NAV-20 — Un patrón imposible nunca bloquea el botón: se corrige y
      // se dice. Nada bloquea.
      patronAjustado: 'Ajustamos los tiempos para que el ritmo se pueda seguir.',
    },

    sesion: {
      ajustes: 'Ajustar',
      cerrarAjustes: 'Listo',
      progresoCiclos: '{completados} de {total}',
      progresoAbierta: '{tiempo}',
    },

    accesibilidad: {
      salir: 'Salir de respiración',
      pausar: 'Pausar la sesión',
      reanudar: 'Seguir con la sesión',
      aumentarFase: 'Aumentar el tiempo de {fase}',
      reducirFase: 'Reducir el tiempo de {fase}',
      abrirAjustes: 'Abrir ajustes de la sesión',
      vistaPrevia: 'Vista previa del ritmo {patron}',
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
