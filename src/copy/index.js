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

  // ─── El diario ────────────────────────────────────────────────────────────
  // Hoy, el Diario de la mañana y de la noche, Respiración, el Journal y el
  // Historial. Vocabulario hacia dentro: reflexión, calma, cierre.
  //
  // **Renombrado a `diario` el 25 de agosto de 2026** (paso 9 del plan de
  // separación, §8). Se llamaba por el espacio que lo escribía, cuando había
  // dos. Su nivel interno duplicado se aplanó en la misma pasada.
  //
  // Aquí no hay una sola palabra de construcción: ni "hábito", ni "constancia",
  // ni "progreso", ni "ritual" referido a un checklist (§C2.6, criterio 3).
  diario: {
    // ─── El onboarding (F-1B) ─────────────────────────────────────────────
    // Siete pasos y un sub-paso, una sola vez en la vida de la cuenta.
    //
    // **Vive dentro de `diario` y no en un namespace de primer nivel.** Strivo
    // es una sola aplicación: un `copy.onboarding` por encima diría que hay
    // algo antes del producto a lo que se entra, y no lo hay. Se entra a
    // Strivo, y esto es cómo empieza.
    //
    // **El umbral de entrada no está aquí, y es a propósito.** El onboarding
    // abre con el mismo velo que cualquier otra apertura de la app —el video de
    // marca de §C7.5— y ese no lleva copy: no dice nada. Lo único que se oye al
    // saltarlo es `copy.shared.transicion.saltar`, que es de la pieza y no de
    // quien la monta.
    //
    // Nada de aquí bloquea: el nombre puede quedarse en blanco, el género se
    // puede no contestar, los avisos y la cuenta se saltan con un enlace que
    // dice "Ahora no". No hay ni un texto que llame incompleto a nada.
    onboarding: {
      // El indicador cuenta **pasos, no campos**, igual que el de la mañana
      // cuenta momentos. El sub-paso del género no entra en la cuenta: no
      // está en la ruta de todo el mundo y un total que cambia deja de
      // orientar (la misma razón que RN-MAN-02).
      nav: {
        back: 'Atrás',
        continue: 'Continuar',
        progressTemplate: 'Paso {n} de {total}',
      },

      // Aquí vivía una palabra propia de apertura, "Respira.", con su propio
      // velo de cinco segundos. Se retira: el umbral del onboarding es el mismo
      // de cualquier otra apertura de la app —el video de marca— y montarlo no
      // necesita copy, porque no dice nada. La etiqueta que oye un lector de
      // pantalla al saltarlo sigue siendo `copy.shared.transicion.saltar`, que
      // es de la pieza y no de quien la monta.

      p1: {
        subtitle: 'Tu lugar para volver a ti.',
        // **Ya no promete tres minutos** (9 sep 2026). Ponerle una duración a la
        // primera frase que alguien lee convierte el refugio en algo que ocupa
        // un hueco de la agenda, y además era una cifra que el producto no
        // cumple: la mañana, la noche y una respiración no duran lo mismo. "Un
        // momento" dice lo que de verdad se ofrece sin medirlo.
        support:
          'Un momento para conectar contigo, reconocer cómo fue tu día y seguir adelante con más calma.',
        cta: 'Empezar',
      },

      // Se puede dejar en blanco, y el texto lo dice antes de que nadie se lo
      // pregunte. Sin él, un campo vacío en la segunda pantalla se lee como
      // un requisito.
      p2: {
        question: 'Solo tu nombre. Nada más.',
        hint: 'Es para saludarte. Puedes dejarlo en blanco.',
        label: 'Tu nombre',
      },

      // Sub-paso, no paso: para los pronombres del copy y para nada más.
      // Las cuatro opciones se resuelven a los tres valores del modelo
      // (`m`, `f`, `n`), que son los que sabe resolver `copy/gender.js`.
      p2a: {
        question: '¿Con qué género te identificas?',
        hint: 'Solo lo usamos para hablarte como te corresponde.',
        options: {
          masculino: 'Masculino',
          femenino: 'Femenino',
          prefiero_no_contestar: 'Prefiero no contestar',
          otro: 'Otro',
        },
      },

      // Cinco motivos y una palabra propia. **Sin la opción de construir
      // hábitos**: era del alcance retirado y no vuelve.
      p3: {
        question: '¿Qué te gustaría encontrar aquí?',
        hint: 'Elige todo lo que resuene contigo. Puedes seleccionar varias opciones.',
        options: {
          paz: 'Terminar el día con más paz',
          avance: 'Sentir que sí estoy avanzando',
          escucha: 'Volver a escucharme',
          sueno: 'Dormir con la mente más tranquila',
          espacio: 'Tener un espacio solo para mí',
          otro: 'Otro',
        },
        otherLabel: 'En tus palabras',
        otherPlaceholder: '¿Qué buscas?',
        otherCounterTemplate: '{n} de {max}',
      },

      p5: {
        question: '¿Cómo son tus días?',
        hint: 'Para acompañarte a tu ritmo, no al de la app. Lo cambias cuando quieras.',
        wakeLabel: 'Me despierto a las',
        sleepLabel: 'Me duermo a las',
      },

      // El aviso se pide, no se da por hecho. Las tres salidas —concedido,
      // denegado, sin soporte— se cuentan sin culpar al dispositivo y sin
      // pedir que se arregle nada.
      p6: {
        question: '¿Quieres que te avise?',
        hint: 'Dos avisos al día, a las horas que elegiste. Nada más.',
        previewTemplate: '{hora} · {texto}',
        activate: 'Activar recordatorios',
        skip: 'Ahora no',
        granted: 'Listo. Te avisaremos a esas horas.',
        denied: 'Tu dispositivo no dio permiso. Puedes activarlo después desde Ajustes.',
        unsupported: 'Este dispositivo no tiene avisos. Strivo funciona igual.',
      },

      // La cuenta respalda; no es la puerta. Por eso "Ahora no" está a la
      // vista y lo que sigue después dice que sin cuenta funciona todo.
      p7: {
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
        skipNote: 'Sin cuenta también funciona todo. La puedes crear después.',
      },

      // El cierre saluda por el nombre, en el género del perfil, y no dice
      // nada más. **Un solo mensaje y un botón**: la frase que se armaba con
      // la identidad central se fue con la pantalla que la preguntaba, y la
      // hora de la vuelta se fue con ella. Explicar el saludo debajo del
      // saludo sería estrenar una segunda voz en la última pantalla.
      //
      // El neutro no es el masculino reutilizado ni una terminación en "-e":
      // es una redacción distinta que rodea la marca (RN-GEN-02).
      p8: {
        welcomeTemplate: {
          m: 'Bienvenido, {nombre}',
          f: 'Bienvenida, {nombre}',
          n: 'Te damos la bienvenida, {nombre}',
        },
        // Sin nombre se saluda igual, sin coma colgando ni hueco a la vista:
        // dejarlo en blanco es una respuesta y no se señala (RN-02).
        welcomePlain: {
          m: 'Bienvenido',
          f: 'Bienvenida',
          n: 'Te damos la bienvenida',
        },
        ctaLabel: 'Entrar a Strivo',
      },
    },
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

      // La ventana de 72 horas (3 sep 2026). Qué día se está escribiendo, y
      // qué pasa con los que ya se cerraron.
      //
      // **Los días anteriores se nombran, no se cuentan.** "Hoy", "Ayer" y el
      // nombre del día de la semana; nunca "hace 2 días" ni "1 de 3", que
      // convertirían una navegación en una cuenta atrás. Tampoco se marca
      // cuáles quedaron en blanco: eso sería la lista de lo que falta, y aquí
      // no falta nada (RN-05).
      //
      // `retroTemplate` es la etiqueta discreta de estar en un día pasado. Dice
      // de qué día es lo que se está escribiendo y no dice nada más: sin "aún
      // estás a tiempo", sin "te quedan X horas" y sin recordar que ese día se
      // pasó sin escribir.
      dias: {
        label: 'Día que estás escribiendo',
        hoy: 'Hoy',
        ayer: 'Ayer',
        retroTemplate: 'Registro del {dia}',
        cerrado: 'Este día ya quedó como quedó. Aquí sigue, para leerlo.',
      },

      // Sin tarjeta de acción y sin estado "hecho": el Diario se muestra en
      // Hoy, así que no hay nada que anunciar ni que dar por terminado.
      // RN-HOY-03 se cumple sin decir nada — lo escrito está a la vista.

      // La frase del día y quién la firma.
      //
      // **Las comillas son copy, no maquetación.** Marcan la diferencia entre
      // reproducir a alguien y hablar por él: una cita va entrecomillada porque
      // es palabra de otro, y una versión propia va sin comillas porque Strivo
      // sí la firma. Son las mismas «» con las que se presenta la palabra
      // propia en el resto del producto — dos convenciones de comillas serían
      // dos maneras de citar en la misma app.
      //
      // `atribucionLabel` no se ve: nombra la línea de abajo para quien la
      // escucha, donde el cambio de cuerpo y de cursiva no se percibe.
      frase: {
        label: 'Frase de hoy',
        citaTemplate: '«{texto}»',
        atribucionLabel: 'Atribución',
      },
    },

    // El día que se escribe en Hoy: las dos secciones y lo que las enmarca.
    //
    // **Aplanado el 25 de agosto de 2026** (tanda B del paso 9). Vivía en un
    // `diario` dentro de `diario`, un nivel que solo existía para separarlo del
    // espacio que lo contenía. Sin espacio, el nivel sobraba: sus seis claves
    // suben, y ninguna chocaba con las de arriba.
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
      // Hasta tres, desde el 30 de agosto de 2026: nadie amanece sintiendo una
      // sola cosa, y elegir cuál de dos es la verdadera es resumirse antes de
      // empezar el día. Aquí sí caben las emociones difíciles, porque la
      // pregunta es qué hay.
      animo: {
        titulo: '¿Cómo me siento esta mañana?',
        lead: 'Elige hasta tres, las que más se acerquen a cómo estás.',
        // Solo aparece si se toca una cuarta, y solo entonces. Dice qué pasa,
        // no qué se hizo mal: no hay nada que corregir en sentir una cosa más.
        max: 'Caben tres a la vez. Suelta alguna si quieres cambiarla.',
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
        lead: 'Elige hasta tres intenciones para acompañar tu día.',
        max: 'Caben tres a la vez. Suelta alguna si quieres cambiarla.',
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
        // Con dos o tres intenciones se dicen seguidas, como se dicen en voz
        // alta: "en calma, con foco y con ligereza". Sin viñetas y sin
        // numerarlas — son una respuesta, no una lista de cosas por hacer.
        listaSeparador: ', ',
        listaUnion: ' y ',
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
      //
      // **La pregunta cambia con cómo se cerró el día** (30 ago 2026), y es la
      // única del recorrido que lo hace. A quien llega cansado, triste o con
      // demasiado encima no se le pide que encuentre algo bueno: se le pregunta
      // qué quiere reconocer, que admite haber atravesado el día y nada más.
      // Los tres grupos y cuándo sale cada uno viven en
      // `src/diario/nocheReconocimiento.js`; aquí solo está lo que se lee.
      //
      // **Esto no deroga RN-VOZ-03.** Esa regla protege las preguntas que
      // ordenan cada recorrido —cómo me siento, cómo me gustaría sentirme, cómo
      // cierro el día—, que siguen llegando con la misma redacción siempre. Lo
      // que cambia aquí es el tono de una sola pregunta, y cambia por lo que la
      // persona acaba de decir de sí misma: no se cuenta nada, no se compara
      // con ninguna otra noche y no se deduce de nada que no haya dicho ella.
      reconocimiento: {
        placeholder: 'Algo que hice, sentí o atravesé…',
        anadir: 'Añadir otro',
        // Salida discreta, sin nada que reprochar al volver mañana.
        omitir: 'Omitir por hoy',

        // Los tres grupos. Cada uno trae sus preguntas —rotan por fecha, así
        // que no llega la misma dos noches seguidas— y sus ideas de apoyo, que
        // son las de esa pregunta y no unas generales.
        //
        // **Las quince hablan en primera persona**, como las demás preguntas de
        // la noche (§12): son lo que alguien se pregunta a sí mismo, no lo que
        // la app le pregunta. Las ideas de apoyo sí tutean, igual que las de la
        // gratitud de la mañana — ahí sí es la app la que ofrece algo.
        //
        // **Y ninguna repite lo que ya se pregunta esa misma noche** (30 ago
        // 2026). Una noche enseña hasta cuatro preguntas —esta, la reflexión,
        // la emoción y la descarga—, y el banco de la reflexión y la descarga
        // llevan meses estables: son ellos los que fijan el vocabulario y estas
        // las que se apartan. Lo que no vuelve a aparecer aquí: "me dejó",
        // "aprendí sobre mí", "recordar", "ocupó espacio", "soltar" y "dejar
        // aquí". Las ideas de apoyo tampoco repiten el encabezado que tienen
        // encima: decir dos veces lo mismo en una pantalla se lee como un fallo.
        //
        // **Las ideas nunca rellenan el campo.** Tocar una abre otra pregunta y
        // ahí acaba, igual que en la gratitud de la mañana: la app no escribe
        // por nadie.
        grupos: {
          // Se cerró el día en paz, tranquilo, agradecido, orgulloso o
          // aliviado. Solo aquí se puede preguntar por algo bueno sin que la
          // pregunta le lleve la contraria a lo que la persona acaba de decir.
          sereno: {
            lead: 'Algo que disfrutaste, que te gustó o que quieres guardar.',
            preguntas: [
              '¿Hubo algo bueno o amable en mi día de hoy?',
              '¿Qué momento de hoy quiero reconocer?',
              '¿Qué pequeño detalle hizo mi día un poco mejor?',
              '¿Qué agradezco, valoro o rescato de mi día?',
              // Era "¿Qué me llevo de hoy…", que es lo mismo que pregunta
              // "¿Qué me dejó el día de hoy?" dos momentos después.
              '¿Qué me alegró hoy?',
            ],
            sugerencias: {
              titulo: '¿Te ayudo con una idea?',
              descartar: 'Ahora no',
              opciones: [
                {
                  id: 'gesto',
                  label: 'un gesto amable',
                  pregunta: '¿Qué gesto amable recibiste o diste hoy?',
                },
                {
                  id: 'disfrute',
                  label: 'algo que disfrutaste',
                  pregunta: '¿Qué momento de hoy disfrutaste?',
                },
                {
                  id: 'salio_bien',
                  label: 'algo que salió bien',
                  pregunta: '¿Qué salió bien hoy, aunque fuera pequeño?',
                },
                {
                  id: 'compania',
                  label: 'una persona o un lugar',
                  pregunta: '¿Qué persona o qué lugar te hizo bien hoy?',
                },
              ],
            },
          },

          // Pensativo, neutral, la palabra propia, o nada elegido todavía —que
          // es como se entra al recorrido, porque esta pregunta va antes que la
          // emoción. Preguntas abiertas, sin dar por hecho que el día fue bueno
          // ni que fue malo.
          neutro: {
            lead: 'Puede ser algo que disfrutaste, intentaste, enfrentaste o resolviste.',
            preguntas: [
              // La más ancha abre la rotación: es la redacción de siempre y la
              // que se lee al entrar al recorrido, cuando aún no se sabe nada
              // del día.
              '¿Qué quiero reconocer de este día?',
              // "Guardar" y "recordar" son lo mismo dicho de dos maneras, y
              // "recordar" es del banco de la reflexión.
              '¿Qué momento de hoy se me quedó?',
              // Sin el "¿Hay algo que quiera…", que ahora es de la descarga.
              '¿Qué de hoy quiero nombrar antes de cerrarlo?',
              '¿Qué parte de mi día quiero mirar una vez más?',
            ],
            sugerencias: {
              titulo: '¿Te ayudo con una idea?',
              descartar: 'Ahora no',
              opciones: [
                {
                  id: 'momento',
                  label: 'un momento del día',
                  pregunta: '¿Qué momento del día te viene ahora a la cabeza?',
                },
                {
                  id: 'contar',
                  label: 'algo que contar',
                  pregunta: '¿Qué le contarías a alguien de tu día?',
                },
                {
                  id: 'sencillo',
                  label: 'algo sencillo',
                  pregunta: '¿Qué cosa sencilla de hoy quieres guardar?',
                },
                {
                  id: 'atravesado',
                  label: 'algo que atravesaste',
                  pregunta: '¿Qué atravesaste hoy?',
                },
              ],
            },
          },

          // Cansado, inquieto, frustrado, triste o con demasiado encima. Aquí
          // no se pide nada bueno, ni una lección, ni una vuelta positiva:
          // haber llegado hasta el final del día ya es algo que reconocer.
          cuidado: {
            lead: 'No hace falta que haya sido un buen día.',
            preguntas: [
              '¿Qué quiero reconocer de mí hoy?',
              '¿Qué pude sostener hoy, aunque me costara?',
              // "Dejar" es de la descarga, que en este grupo se abre sola: la
              // misma pregunta dos veces en una noche es lo que hay que evitar.
              '¿Qué me tocó atravesar hoy?',
              '¿Qué me reconozco de este día, tal como fue?',
              // Sin la estructura "¿Hay algo que quiera…" de la descarga.
              'Llego al final de mi día. ¿Qué quiero decirme antes de descansar?',
            ],
            sugerencias: {
              titulo: '¿Te ayudo con una idea?',
              descartar: 'Ahora no',
              opciones: [
                {
                  id: 'sostuviste',
                  label: 'algo que sostuviste',
                  pregunta: '¿De qué te hiciste cargo hoy?',
                },
                {
                  id: 'como_pudiste',
                  label: 'algo que hiciste como pudiste',
                  pregunta: '¿Qué hiciste hoy lo mejor que pudiste?',
                },
                {
                  id: 'palabra',
                  label: 'una palabra para hoy',
                  pregunta: '¿Con qué palabra llegas a esta noche?',
                },
                {
                  id: 'seguiste',
                  label: 'algo que seguiste haciendo',
                  pregunta: '¿Qué no dejaste de hacer hoy?',
                },
              ],
            },
          },
        },
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
          // También en primera, y por lo mismo. Sigue preguntando qué se notó
          // y **nunca** si se cumplió (RN-NOC-05).
          tituloTemplate: 'Esta mañana elegí {emocion} como intención. ¿Qué noté en mí?',
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
          // Sin marca de género en las tres formas: "feliz" no la lleva, así
          // que el neutro no necesita rodearla (RN-GEN-02).
          { id: 'feliz', emoji: '🙂', label: { m: 'Feliz', f: 'Feliz', n: 'Feliz' } },
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
        // Primera persona, como todas las preguntas que alguien contesta
        // (§12). Estaba en segunda desde el 23 de agosto y la prueba que
        // vigila la regla no la miraba: recorría una lista escrita a mano.
        titulo: '¿Hay algo de mi día que quiera dejar aquí?',
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
    // Solo lo que el diario guarda: mañana, noche y journal (§C7.7.2). Sin hábitos,
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
        // La ventana de 72 horas (3 sep 2026). Se dice **solo** cuando ya se
        // cerró: decirlo también en los días abiertos sería una cuenta atrás
        // en una pantalla que no tiene dónde escribir. Nada se oculta y nada
        // desaparece — el día se lee entero, igual que antes.
        cerrado: 'Este día ya quedó como quedó.',
      },
    },
    // ─── Tu perfil (26 ago 2026) ──────────────────────────────────────────────
    // La gestión de la cuenta: lo que la app sabe de ti y que puedes cambiar
    // cuando quieras.
    //
    // **Es una pantalla de bloques y esa es su forma, no su maquetación.** Las
    // fases siguientes traen plan de pago y suscripción, y la manera de que eso
    // entre sin rehacer nada es que cada bloque sea una entrada de una lista
    // (`src/perfil/bloques.js`) con su propio texto aquí.
    //
    // **No anuncia lo que todavía no existe.** No hay bloque de "próximamente",
    // no hay ajuste apagado con una etiqueta que lo explique. Una pantalla que
    // promete lo que no puede cumplir es lo contrario de un refugio.
    //
    // **Los catálogos no se repiten aquí.** El de género y el de sugerencias de
    // identidad viven en el onboarding, que es donde se preguntan por primera
    // vez, y esta pantalla los lee de allí: dos copias del mismo catálogo se
    // separan en cuanto alguien edite una. Si aparece un tercer consumidor,
    // toca mudarlos a un nodo propio.
    perfil: {
      titulo: 'Tu perfil',
      lead: 'Lo que la app sabe de ti. Se cambia cuando quieras y no hay nada que guardar.',

      nombre: {
        titulo: 'Cómo te llamas',
        hint: 'Es para saludarte. Puedes dejarlo en blanco.',
        label: 'Tu nombre',
      },

      genero: {
        titulo: 'Cómo hablarte',
        hint: 'Solo lo usamos para hablarte como te corresponde.',
      },

      horarios: {
        titulo: 'Cómo son tus días',
        hint: 'Para acompañarte a tu ritmo, no al de la app.',
        wakeLabel: 'Me despierto a las',
        sleepLabel: 'Me duermo a las',
      },
    },

    // ─── La presentación de las secciones ─────────────────────────────────
    // Cuatro tarjetas, una vez, entre el final del onboarding y la primera vez
    // que alguien entra a Hoy.
    //
    // **Cuenta lo que hay, no explica cómo se usa.** No hay una sola
    // instrucción —ni "desliza", ni "toca aquí"—, y no hay una sola promesa de
    // resultado: cada tarjeta dice qué es esa sección y para qué está, en una
    // frase. Un recorrido de entrada que enseña a manejar la app la convierte
    // en algo que hay que aprender.
    //
    // **Vive dentro de `diario` y junto al onboarding** por el mismo motivo que
    // aquel: Strivo es una sola aplicación, y esto es cómo se termina de entrar
    // a ella, no una capa por encima.
    //
    // Los cuatro títulos son los nombres de las secciones, y son los mismos que
    // se leen en la cabecera y en la barra de abajo. Se escriben aquí en vez de
    // leerse de `copy.shared.navegacion` porque ahí son rótulos de un enlace y
    // aquí son el encabezado de una tarjeta: dos papeles distintos que hoy se
    // dicen igual. Hay una prueba que falla si dejan de coincidir, que es lo
    // que evita que uno se quede atrás sin que nadie lo note.
    presentacion: {
      nav: {
        skip: 'Omitir',
        next: 'Siguiente',
        // El único texto del producto que nombra la marca en un botón. Lo hace
        // porque es literalmente la puerta: detrás de esto ya está la app.
        enter: 'Entrar a Strivo',
        // Lo que oye un lector de pantalla. Los puntos son mudos a la vista
        // —el número no se pinta en ninguna parte, contar tarjetas no es lo
        // que se viene a hacer aquí— y aquí se dice entero.
        posicionTemplate: 'Tarjeta {n} de {total}',
        puntosLabel: 'Ir a una tarjeta',
      },

      hoy: {
        titulo: 'Hoy',
        frase: 'Tu punto de partida. Por la mañana y al cerrar el día, un momento para ti.',
      },

      journal: {
        titulo: 'Journal',
        frase: 'Tu espacio privado para anotar pensamientos, soltar emociones y ordenar ideas.',
      },

      respiracion: {
        titulo: 'Respiración',
        frase: 'Ejercicios guiados para conectar contigo. Para cuando necesites hacer una pausa.',
      },

      historial: {
        titulo: 'Historial',
        frase: 'Mira tu camino recorrido. Cada día en que estuviste para ti queda aquí.',
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
    // apertura es del umbral de entrada y aquí sería una segunda voz antes de
    // haber elegido nada. Tampoco lleva saludo ni fecha: eso es R2, suprimido
    // de raíz (Anexo E, E.0).
    //
    // La pregunta central es la del blueprint —"¿cómo estoy?"— y está aquí
    // porque es lo que dice de qué va la app a quien la abre por primera vez.
    // No es una frase del repertorio: es fija.
    home: {
      simbolo: 'Strivo',
      espaciosLabel: 'Espacios',
      diario: { titulo: 'Strivo', pregunta: '¿Cómo estoy?' },
    },

    // §C7.3 — Naming de la navegación. **Revisado el 25 de agosto de 2026, con
    // el renombrado del paso 9.** La opción A del 11 de agosto repartía el
    // nombre en dos —marca sola en la pestaña de abajo, marca + descriptor en la
    // cabecera— porque había dos espacios y el descriptor era lo que los
    // distinguía. Con un solo producto no hay de qué distinguirlo: la cabecera
    // dice **Strivo** y nada más. El descriptor se retira entero.
    navegacion: {
      // **La barra inferior vuelve el 26 de agosto de 2026**, y no es la de
      // antes: aquella saltaba entre espacios y devolvía a un vestíbulo que ya
      // no existe. Esta lleva a dos destinos y nada más —lo que ya pasó y tú—,
      // así que su etiqueta los nombra en vez de nombrar la marca.
      barraLabel: 'Historial y perfil',
      seccionesLabel: 'Secciones',
      volver: 'Strivo',
      volverLabel: 'Volver a Strivo',

      diario: {
        pestana: 'Strivo',
        cabecera: 'Strivo',
        // **Cinco destinos repartidos en dos barras (26 ago 2026).** Arriba lo
        // que se hace ahora —el día, lo que se escribe, el aire—; abajo lo que
        // ya pasó y tú. El razonamiento del orden no cambia, se cumple mejor:
        // el Historial ya no tiene que ir "al final" de una lista de cosas que
        // se hacen hoy, porque no está en ella.
        secciones: {
          hoy: 'Hoy',
          journal: 'Journal',
          respiracion: 'Respiración',
          historial: 'Historial',
          perfil: 'Tu perfil',
        },
      },
    },
  },

  // ─── Insights ─────────────────────────────────────────────────────────────
  insights: {
    empty: 'Necesito conocerte un poco más. En unos días empezaré a notar cosas.',
    reject: 'No me sirve',
    weekly: {
      // Template: "Cinco días esta semana. Tu palabra más repetida: calma."
      template: '{n} días esta semana. Tu palabra más repetida: {palabra}.',
    },
  },

  // ─── Perfil / Identidad ───────────────────────────────────────────────────
  profile: {
    cancel: {
      title: '¿Seguro que quieres cancelar?',
      body: 'Tu historial se queda. La suscripción termina al final del ciclo.',
      confirm: 'Cancelar suscripción',
      back: 'Volver',
    },
  },

  // El namespace `empty` de Fase 0 se retira con SPEC_07. Sus cuatro cadenas
  // tienen dueño en otro sitio —`diario.journal.vacio`, `diario.historial.vacio`
  // e `insights.empty`— y ninguna se usaba ya. Dos
  // versiones del mismo estado vacío es una invitación a editar la que nadie ve.

  // ─── Respiración (SPEC_13 §7) ─────────────────────────────────────────────
  // Voz **de la marca**, no la de un recorrido concreto: sobria, cálida, sin
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
// Uso: interpolate(copy.diario.hoy.saludo.conNombreTemplate, { saludo, nombre })
export function interpolate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

export default copy
