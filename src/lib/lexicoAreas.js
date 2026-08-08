// src/lib/lexicoAreas.js
// Con qué área se relaciona lo que se escribió (§24.4).
//
// El selector "¿dónde vive esto?" obligaba a clasificar cada victoria justo
// cuando se estaba pensando en ella: trabajo administrativo intercalado en un
// momento de intención, y multiplicado por tres. Esto lo deduce.
//
// La regla que lo hace funcionar: **por defecto no se etiqueta**. Una etiqueta
// equivocada es peor que ninguna, porque obliga a corregirla, que es justo el
// trabajo que se está quitando. Ante cualquier duda —dos áreas, coincidencia
// floja, texto corto— se calla.
//
// Todo local y sin red: la deducción es instantánea y funciona sin conexión.
//
// El léxico se afina con lo que la gente escriba de verdad (Sesión 10). Está
// aquí, aparte de la lógica, para poder tocarlo sin abrir el componente.

// Raíces, no palabras completas: "comiendo", "comer" y "comida" comparten
// "com". Se comparan contra palabras enteras del texto, nunca como fragmento
// suelto dentro de otra: buscar "paz" dentro de la cadena haría coincidir
// "capaz" (§24.6).
export const LEXICO = {
  salud: [
    'comer', 'comida', 'comiendo', 'desayun', 'almorz', 'cenar', 'cena',
    'cuerpo', 'dormir', 'sueno', 'siesta', 'descansar', 'descanso',
    'ejercicio', 'entrenar', 'entrenamiento', 'caminar', 'caminata', 'correr',
    'gimnasio', 'gym', 'estirar', 'yoga', 'agua', 'hidratar', 'saludable',
    'nutricion', 'medico', 'salud', 'moverme', 'moverse', 'bicicleta', 'nadar',
  ],
  trabajo: [
    'trabajo', 'trabajar', 'oficina', 'junta', 'juntas', 'reunion', 'reuniones',
    'proyecto', 'proyectos', 'cliente', 'clientes', 'jefe', 'equipo',
    'correo', 'correos', 'mail', 'pendiente', 'pendientes', 'entrega',
    'presentacion', 'informe', 'reporte', 'carrera', 'curriculum', 'puesto',
  ],
  relaciones: [
    'familia', 'mama', 'papa', 'madre', 'padre', 'hermano', 'hermana',
    'hijo', 'hija', 'hijos', 'abuela', 'abuelo', 'pareja', 'esposo', 'esposa',
    'novio', 'novia', 'amigo', 'amiga', 'amigos', 'amigas', 'llamar', 'llamada',
    'visitar', 'visita', 'escuchar', 'conversar', 'conversacion', 'perdonar',
  ],
  finanzas: [
    'dinero', 'gasto', 'gastos', 'gastar', 'ahorro', 'ahorrar', 'ahorros',
    'presupuesto', 'cuenta', 'cuentas', 'pago', 'pagar', 'deuda', 'deudas',
    'invertir', 'inversion', 'sueldo', 'ingreso', 'ingresos', 'factura',
    'finanzas', 'banco', 'tarjeta',
  ],
  espiritual: [
    'orar', 'oracion', 'rezar', 'dios', 'fe', 'misa', 'biblia', 'meditar',
    'meditacion', 'gratitud', 'agradecer', 'silencio', 'espiritual', 'alma',
    'templo', 'iglesia', 'retiro', 'contemplar',
  ],
  personal: [
    'leer', 'leyendo', 'libro', 'libros', 'aprender', 'aprendiendo', 'estudiar',
    'estudio', 'curso', 'clase', 'idioma', 'ingles', 'practicar', 'terapia',
    'terapeuta', 'diario', 'escribir', 'reflexionar', 'crecer', 'habito',
  ],
  creatividad: [
    'dibujar', 'dibujo', 'pintar', 'pintura', 'crear', 'creando', 'crea',
    'tocar', 'guitarra', 'piano', 'cantar', 'musica', 'componer', 'foto',
    'fotografia', 'grabar', 'video', 'disenar', 'diseno', 'bordar', 'tejer',
    'manualidad', 'manualidades',
  ],
}

// Longitud mínima para molestarse en mirar
export const MINIMO_DE_TEXTO = 3

// Lo que tarda en mirar tras dejar de escribir. Una etiqueta que aparece y
// cambia mientras se escribe es una distracción (§24.4).
export const ESPERA_ANTES_DE_MIRAR = 800

const SIN_ACENTOS = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n' }

export function normalizar(texto) {
  return (texto ?? '')
    .toLowerCase()
    .replace(/[áéíóúüñ]/g, letra => SIN_ACENTOS[letra])
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

// Una palabra coincide con una raíz si empieza por ella, y solo cuando la raíz
// es lo bastante larga para no ser ambigua: con raíces de tres letras o menos
// hace falta la palabra entera. Si no, "feliz" entraría por "fe" y "capaz" por
// "paz", que es exactamente lo que §24.6 prohíbe.
const coincide = (palabra, raiz) => {
  if (raiz.length < 4) return palabra === raiz
  return palabra.startsWith(raiz) || (palabra.length >= 4 && raiz.startsWith(palabra))
}

/**
 * Con qué área se relaciona un texto, si es que con alguna.
 *
 * @param {string} texto
 * @param {string[]} tiposElegidos - las áreas del onboarding. No se compara
 *   contra las siete: etiquetar con un área que no le interesa no aporta nada.
 * @returns {string|null} el tipo de área, o null si no hay una respuesta clara
 */
export function areaDe(texto, tiposElegidos = []) {
  const palabras = normalizar(texto)
  if (!palabras.length || (texto ?? '').trim().length < MINIMO_DE_TEXTO) return null

  const tocadas = tiposElegidos.filter(tipo =>
    (LEXICO[tipo] ?? []).some(raiz => palabras.some(palabra => coincide(palabra, raiz)))
  )

  // Con dos o más no se adivina: ahí es donde se producen los errores que
  // obligan a corregir.
  return tocadas.length === 1 ? tocadas[0] : null
}
