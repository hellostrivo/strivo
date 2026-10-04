// src/content/frases-v2/citas.js
// Citas candidatas (SPEC_29 §9).
//
// **Ninguna es elegible todavía.** Todas están en `pendiente_revision`: el
// texto se cotejó contra una edición concreta de dominio público, pero falta
// la firma de una persona en la revisión editorial y en la jurídica. Hasta que
// la haya, el selector no las ve (solo elige `aprobada`).
//
// El expediente de cada una —edición, ubicación, estado de derechos, qué se
// verificó, quién y cuándo, y qué falta— vive fuera del bundle, en
// `docs/frases-v2-fuentes.md`, bajo su `fuenteClave`. `scripts/validar-frases.js`
// falla si una cita no tiene expediente, y si una aprobada no tiene las dos
// firmas.
//
// **El texto es el de la edición, carácter por carácter**, con su ortografía:
// la Reina-Valera 1909 escribe «á» como preposición y Gracián «vezes». No se
// moderniza sin decidirlo antes en el expediente: una cita retocada deja de
// ser una cita. Las comillas no van aquí; las pone el componente.
//
// Para aprobar una cita: completar su expediente con las dos firmas, cambiar
// aquí su `estado` a `aprobada` y correr `node scripts/validar-frases.js`.

import { cita } from './construir.js'

const RV = 'Biblia Reina-Valera 1909'
const PENDIENTE = 'pendiente_revision'

export default Object.freeze([
  // ─── Cristianismo · Reina-Valera 1909 ──────────────────────────────────────
  cita({
    id: 'C2-CRI-RV-SAL-118-24',
    texto: 'Este es el día que hizo Jehová: nos gozaremos y alegraremos en él.',
    tema: 'gratitud',
    subtema: 'presencia',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Salmos 118:24 · ${RV}`,
    fuenteClave: 'RV1909-SAL-118-24',
  }),
  cita({
    id: 'C2-CRI-RV-SAL-4-8',
    texto:
      'En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me harás estar confiado.',
    tema: 'calma',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Salmos 4:8 · ${RV}`,
    fuenteClave: 'RV1909-SAL-4-8',
  }),
  cita({
    id: 'C2-CRI-RV-PRO-15-1',
    texto: 'LA blanda respuesta quita la ira: mas la palabra áspera hace subir el furor.',
    tema: 'calma',
    subtema: 'amabilidad',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Proverbios 15:1 · ${RV}`,
    fuenteClave: 'RV1909-PRO-15-1',
  }),
  cita({
    id: 'C2-CRI-RV-PRO-17-17',
    texto: 'En todo tiempo ama el amigo; y el hermano para la angustia es nacido.',
    tema: 'gratitud',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Proverbios 17:17 · ${RV}`,
    fuenteClave: 'RV1909-PRO-17-17',
  }),
  cita({
    id: 'C2-CRI-RV-LAM-3-23',
    texto: 'Nuevas son cada mañana; grande es tu fidelidad.',
    tema: 'aceptacion',
    subtema: 'esperanza_serena',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Lamentaciones 3:23 · ${RV}`,
    fuenteClave: 'RV1909-LAM-3-23',
  }),
  cita({
    id: 'C2-CRI-RV-LAM-3-26',
    texto: 'Bueno es esperar callando en la salud de Jehová.',
    tema: 'calma',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Lamentaciones 3:26 · ${RV}`,
    fuenteClave: 'RV1909-LAM-3-26',
  }),
  cita({
    id: 'C2-CRI-RV-MAT-11-28',
    texto: 'Venid á mí todos los que estáis trabajados y cargados, que yo os haré descansar.',
    tema: 'calma',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Mateo 11:28 · ${RV}`,
    fuenteClave: 'RV1909-MAT-11-28',
  }),
  cita({
    id: 'C2-CRI-RV-MAT-6-34',
    texto:
      'Así que, no os congojéis por el día de mañana; que el día de mañana traerá su fatiga: basta al día su afán.',
    tema: 'aceptacion',
    subtema: 'presencia',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Mateo 6:34 · ${RV}`,
    fuenteClave: 'RV1909-MAT-6-34',
  }),
  cita({
    id: 'C2-CRI-RV-JUA-14-27',
    texto:
      'La paz os dejo, mi paz os doy: no como el mundo la da, yo os la doy. No se turbe vuestro corazón, ni tenga miedo.',
    tema: 'calma',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Juan 14:27 · ${RV}`,
    fuenteClave: 'RV1909-JUA-14-27',
  }),
  cita({
    id: 'C2-CRI-RV-1CO-13-7',
    texto: 'Todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.',
    tema: 'aceptacion',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `1 Corintios 13:7 · ${RV}`,
    fuenteClave: 'RV1909-1CO-13-7',
  }),
  cita({
    id: 'C2-CRI-RV-FIL-4-11',
    texto: 'No lo digo en razón de indigencia, pues he aprendido á contentarme con lo que tengo.',
    tema: 'gratitud',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Filipenses 4:11 · ${RV}`,
    fuenteClave: 'RV1909-FIL-4-11',
  }),
  cita({
    id: 'C2-CRI-RV-1TE-5-18',
    texto:
      'Dad gracias en todo; porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.',
    tema: 'gratitud',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `1 Tesalonicenses 5:18 · ${RV}`,
    fuenteClave: 'RV1909-1TE-5-18',
  }),
  cita({
    id: 'C2-CRI-RV-ROM-12-15',
    texto: 'Gozaos con los que se gozan: llorad con los que lloran.',
    tema: 'identidad',
    subtema: 'empatia',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Romanos 12:15 · ${RV}`,
    fuenteClave: 'RV1909-ROM-12-15',
  }),
  cita({
    id: 'C2-CRI-RV-ROM-12-21',
    texto: 'No seas vencido de lo malo; mas vence con el bien el mal.',
    tema: 'identidad',
    subtema: 'amabilidad',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Romanos 12:21 · ${RV}`,
    fuenteClave: 'RV1909-ROM-12-21',
  }),
  cita({
    id: 'C2-CRI-RV-GAL-6-2',
    texto: 'Sobrellevad los unos las cargas de los otros; y cumplid así la ley de Cristo.',
    tema: 'esfuerzo',
    subtema: 'empatia',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Gálatas 6:2 · ${RV}`,
    fuenteClave: 'RV1909-GAL-6-2',
  }),
  cita({
    id: 'C2-CRI-RV-GAL-6-9',
    texto:
      'No nos cansemos, pues, de hacer bien; que á su tiempo segaremos, si no hubiéremos desmayado.',
    tema: 'esfuerzo',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Gálatas 6:9 · ${RV}`,
    fuenteClave: 'RV1909-GAL-6-9',
  }),
  cita({
    id: 'C2-CRI-RV-COL-3-15',
    texto:
      'Y la paz de Dios gobierne en vuestros corazones, á la cual asimismo sois llamados en un cuerpo; y sed agradecidos.',
    tema: 'gratitud',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `Colosenses 3:15 · ${RV}`,
    fuenteClave: 'RV1909-COL-3-15',
  }),
  cita({
    id: 'C2-CRI-RV-1JN-4-19',
    texto: 'Nosotros le amamos á él, porque él nos amó primero.',
    tema: 'gratitud',
    audiencias: ['cristianismo'],
    estado: PENDIENTE,
    atribucion: `1 Juan 4:19 · ${RV}`,
    fuenteClave: 'RV1909-1JN-4-19',
  }),

  // ─── Universal · autores en español sin traducción de por medio ────────────
  cita({
    id: 'C2-UNI-MARTI-EDAD-ORO-1',
    texto: 'Los desagradecidos no hablan más que de las manchas. Los agradecidos hablan de la luz.',
    tema: 'gratitud',
    audiencias: ['universal'],
    estado: PENDIENTE,
    atribucion: 'José Martí · La Edad de Oro, «Tres héroes»',
    fuenteClave: 'MARTI-EDAD-ORO-TRES-HEROES',
  }),
  cita({
    id: 'C2-UNI-MARTI-EDAD-ORO-2',
    texto:
      'Tener talento es tener buen corazón; el que tiene buen corazón, ése es el que tiene talento.',
    tema: 'identidad',
    subtema: 'amabilidad',
    audiencias: ['universal'],
    estado: PENDIENTE,
    atribucion: 'José Martí · La Edad de Oro, «Meñique»',
    fuenteClave: 'MARTI-EDAD-ORO-MENIQUE',
  }),
  cita({
    id: 'C2-UNI-GRACIAN-111',
    texto: 'Tener amigos. Es el segundo ser. Todo amigo es bueno y sabio para el amigo.',
    tema: 'gratitud',
    audiencias: ['universal'],
    estado: PENDIENTE,
    atribucion: 'Baltasar Gracián · Oráculo manual y arte de prudencia, aforismo 111',
    fuenteClave: 'GRACIAN-ORACULO-111',
  }),
  cita({
    id: 'C2-UNI-GRACIAN-105',
    texto: 'Lo bueno, si breve, dos vezes bueno; y aun lo malo, si poco, no tan malo.',
    tema: 'calma',
    audiencias: ['universal'],
    estado: PENDIENTE,
    atribucion: 'Baltasar Gracián · Oráculo manual y arte de prudencia, aforismo 105',
    fuenteClave: 'GRACIAN-ORACULO-105',
  }),

  // ─── Budismo · Dhammapada, traducción de 1908 ──────────────────────────────
  cita({
    id: 'C2-BUD-DHP-5',
    texto:
      '«Lo que acaba con los odios no es el odio, sino la ausencia del odio.» He ahí una máxima tan antigua como el mundo.',
    tema: 'calma',
    subtema: 'amabilidad',
    audiencias: ['budismo'],
    estado: PENDIENTE,
    atribucion: 'Dhammapada, 5 · traducción atribuida a Rafael Urbano (1908)',
    fuenteClave: 'DHP-URBANO-1908-5',
  }),
  cita({
    id: 'C2-BUD-DHP-14',
    texto:
      'Y así como en la casa bien techada no cala la lluvia, en el ánimo que medita no penetran las pasiones.',
    tema: 'calma',
    audiencias: ['budismo'],
    estado: PENDIENTE,
    atribucion: 'Dhammapada, 14 · traducción atribuida a Rafael Urbano (1908)',
    fuenteClave: 'DHP-URBANO-1908-14',
  }),

  // ─── Estoicismo · Marco Aurelio, traducción de Díaz de Miranda ─────────────
  cita({
    id: 'C2-EST-MA-IV-3',
    texto:
      'en ninguna parte tiene el hombre un retiro más quieto ni más desocupado que dentro de su mismo espíritu',
    tema: 'calma',
    audiencias: ['estoicismo'],
    estado: PENDIENTE,
    atribucion: 'Marco Aurelio · Meditaciones, libro IV, 3 (trad. Jacinto Díaz de Miranda)',
    fuenteClave: 'MARCO-AURELIO-DIAZ-MIRANDA-IV-3',
  }),
])
