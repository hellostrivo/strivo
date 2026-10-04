# Fuentes de las frases del día, versión 2 (SPEC_29)

**Fecha:** 4 de octubre de 2026 · **Estado:** ninguna cita aprobada todavía

Este documento es el expediente de cada cita del catálogo v2 (`src/content/frases-v2/citas.js`). Vive
fuera del bundle a propósito: la app enseña la atribución, y la evidencia se guarda aquí. Cada cita se
enlaza por su `fuenteClave`, que es el encabezado `###` de su sección. `node scripts/validar-frases.js`
falla si una cita no tiene expediente o le falta un campo, y si una cita marcada como `aprobada` no
tiene las dos firmas (un nombre y una fecha `AAAA-MM-DD`).

## Criterio

1. **Una cita es una reproducción textual exacta de una edición concreta.** Se copia carácter por
   carácter, con su ortografía y su puntuación. Si se decide modernizar algo —una «á» preposición,
   una capitular—, se anota aquí qué se cambió y quién lo decidió antes de tocar el dato.
2. **Una paráfrasis nunca se presenta como cita.** Si una idea antigua inspira una frase de Strivo,
   esa frase es original: no lleva comillas ni atribución (`construir.js`).
3. **Que el autor haya muerto hace siglos no basta.** Para una obra traducida importa la traducción:
   cada persona que intervino en el texto español —autor, traductor, revisor— tiene que estar en
   dominio público en los dos mercados de lanzamiento. **México** protege 100 años después de la
   muerte (Ley Federal del Derecho de Autor, art. 29): para entrar en dominio público, quien murió en
   1925 o antes. **España** protege 80 años a quien murió antes del 7 de diciembre de 1987 (LPI,
   disposición transitoria cuarta): quien murió en 1945 o antes. **Manda la regla mexicana.** En
   España, además, una edición crítica de un texto en dominio público tiene protección propia de 25
   años (LPI, art. 129): por eso se prefiere citar un facsímil o una edición antigua identificada.
4. **El estado de derechos es una evaluación, no un dictamen.** Lo que aquí se anota lo verificó una
   revisión técnica; la aprobación jurídica es de una persona con criterio legal, y la editorial, de
   la propietaria del producto.
5. **Solo una cita `aprobada`, con las dos firmas, llega a la app.** Hasta entonces el selector no la
   ve, y el repertorio de cada perfil se sostiene con originales.

## Cómo se aprueba una cita

1. Cotejar el texto contra la edición de referencia con copiar y pegar desde el navegador, no desde
   un resumen. La verificación de este documento se hizo leyendo las páginas a través de una
   herramienta que resume, y dos veces esa herramienta devolvió frases que no estaban en la página
   (se descartaron). **La comprobación final carácter por carácter está pendiente en todas.**
2. Completar **Aprobación editorial** y **Aprobación jurídica** con nombre y fecha.
3. Cambiar `estado` a `aprobada` en `citas.js` y correr `node scripts/validar-frases.js`.

## Lo que no se encontró, y la ruta recomendada

- **Hinduismo: ninguna cita candidata.** La traducción española temprana del Bhagavad Gita (José
  Roviralta Borrell, Barcelona, 1896) es de un traductor que murió en 1926: **no está en dominio
  público en México** hasta, previsiblemente, el 1 de enero de 2027, y además se hizo desde otra
  traducción, cuyos derechos también contarían. La de Federico Climent Terrer (1908) parte del inglés
  de Annie Besant, que murió en 1933. No se encontraron Upanishads en español anteriores a 1925.
- **Estoicismo:** las traducciones antiguas (Díaz de Miranda, 1785, de Marco Aurelio; Fernández de
  Navarrete, de Séneca; el Brocense, 1612, de Epicteto) están en dominio público, pero su español es
  difícil para hoy y las ediciones digitales consultadas no identifican quién las revisó en el siglo
  XIX. Se deja una candidata.
- **Budismo:** el Dhammapada de 1908 publicado en *Sophia* —atribuido a Rafael Urbano, que murió en
  1924— solo se encontró en línea en su primer capítulo y con acentos modernizados por quien lo
  publica. Se dejan dos candidatas.
- **Ruta más limpia para las cuatro tradiciones:** encargar una traducción propia de Strivo desde los
  textos en su lengua original, que están en dominio público (Marco Aurelio y Epicteto en griego,
  Séneca en latín, el Dhammapada en pali, el Bhagavad Gita en sánscrito). Strivo sería titular de esa
  traducción y no heredaría el riesgo de una edición ajena. Hasta que exista, el repertorio de cada
  tradición se sostiene con originales de Strivo, que no se atribuyen a nadie.

## Expedientes

### RV1909-SAL-118-24

- **Texto:** Este es el día que hizo Jehová: nos gozaremos y alegraremos en él.
- **Id en el catálogo:** `C2-CRI-RV-SAL-118-24` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Salmos 118:24
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/PSA118.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente

### RV1909-SAL-4-8

- **Texto:** En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me harás estar confiado.
- **Id en el catálogo:** `C2-CRI-RV-SAL-4-8` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Salmos 4:8
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/PSA004.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Contiene «solo» (en el texto bíblico, no en voz de Strivo) y una afirmación de confianza; revisar que no se lea como promesa.

### RV1909-PRO-15-1

- **Texto:** LA blanda respuesta quita la ira: mas la palabra áspera hace subir el furor.
- **Id en el catálogo:** `C2-CRI-RV-PRO-15-1` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Proverbios 15:1
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/PRO15.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** La mayúscula de «LA» es la capitular del inicio de capítulo en la edición digital; decidir si se normaliza («La») y dejarlo anotado aquí.

### RV1909-PRO-17-17

- **Texto:** En todo tiempo ama el amigo; y el hermano para la angustia es nacido.
- **Id en el catálogo:** `C2-CRI-RV-PRO-17-17` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Proverbios 17:17
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/PRO17.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente

### RV1909-LAM-3-23

- **Texto:** Nuevas son cada mañana; grande es tu fidelidad.
- **Id en el catálogo:** `C2-CRI-RV-LAM-3-23` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Lamentaciones 3:23
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/LAM03.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente

### RV1909-LAM-3-26

- **Texto:** Bueno es esperar callando en la salud de Jehová.
- **Id en el catálogo:** `C2-CRI-RV-LAM-3-26` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Lamentaciones 3:26
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/LAM03.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente

### RV1909-MAT-11-28

- **Texto:** Venid á mí todos los que estáis trabajados y cargados, que yo os haré descansar.
- **Id en el catálogo:** `C2-CRI-RV-MAT-11-28` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Mateo 11:28
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/MAT11.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Contiene una promesa («yo os haré descansar»). §9 pide no prometer resultados: valorar si la voz de un texto sagrado elegido por la persona se lee como invitación o como promesa. Ortografía antigua «á».

### RV1909-MAT-6-34

- **Texto:** Así que, no os congojéis por el día de mañana; que el día de mañana traerá su fatiga: basta al día su afán.
- **Id en el catálogo:** `C2-CRI-RV-MAT-6-34` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Mateo 6:34
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/MAT06.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** «congojéis» es arcaico; 105 caracteres. Valorar claridad (§10).

### RV1909-JUA-14-27

- **Texto:** La paz os dejo, mi paz os doy: no como el mundo la da, yo os la doy. No se turbe vuestro corazón, ni tenga miedo.
- **Id en el catálogo:** `C2-CRI-RV-JUA-14-27` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Juan 14:27
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/JHN14.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** 113 caracteres; segunda persona del plural.

### RV1909-1CO-13-7

- **Texto:** Todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.
- **Id en el catálogo:** `C2-CRI-RV-1CO-13-7` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** 1 Corintios 13:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/1CO13.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente

### RV1909-FIL-4-11

- **Texto:** No lo digo en razón de indigencia, pues he aprendido á contentarme con lo que tengo.
- **Id en el catálogo:** `C2-CRI-RV-FIL-4-11` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Filipenses 4:11
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/PHP04.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Ortografía antigua «á».

### RV1909-1TE-5-18

- **Texto:** Dad gracias en todo; porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.
- **Id en el catálogo:** `C2-CRI-RV-1TE-5-18` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** 1 Tesalonicenses 5:18
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/1TH05.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Puede leerse como mandato («Dad gracias en todo»). Revisar tono (§4).

### RV1909-ROM-12-15

- **Texto:** Gozaos con los que se gozan: llorad con los que lloran.
- **Id en el catálogo:** `C2-CRI-RV-ROM-12-15` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Romanos 12:15
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/ROM12.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente

### RV1909-ROM-12-21

- **Texto:** No seas vencido de lo malo; mas vence con el bien el mal.
- **Id en el catálogo:** `C2-CRI-RV-ROM-12-21` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Romanos 12:21
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/ROM12.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Imperativo; revisar tono.

### RV1909-GAL-6-2

- **Texto:** Sobrellevad los unos las cargas de los otros; y cumplid así la ley de Cristo.
- **Id en el catálogo:** `C2-CRI-RV-GAL-6-2` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Gálatas 6:2
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/GAL06.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Imperativo; tema esfuerzo, no apta con ánimo bajo.

### RV1909-GAL-6-9

- **Texto:** No nos cansemos, pues, de hacer bien; que á su tiempo segaremos, si no hubiéremos desmayado.
- **Id en el catálogo:** `C2-CRI-RV-GAL-6-9` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Gálatas 6:9
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/GAL06.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Ortografía antigua «á»; tema esfuerzo, no apta con ánimo bajo.

### RV1909-COL-3-15

- **Texto:** Y la paz de Dios gobierne en vuestros corazones, á la cual asimismo sois llamados en un cuerpo; y sed agradecidos.
- **Id en el catálogo:** `C2-CRI-RV-COL-3-15` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** Colosenses 3:15
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/COL03.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** 115 caracteres; ortografía antigua «á».

### RV1909-1JN-4-19

- **Texto:** Nosotros le amamos á él, porque él nos amó primero.
- **Id en el catálogo:** `C2-CRI-RV-1JN-4-19` · **Estado:** `pendiente_revision`
- **Autor u obra:** Biblia (traducción de Casiodoro de Reina, revisada por Cipriano de Valera; revisión de 1909 de las sociedades bíblicas)
- **Ubicación:** 1 Juan 4:19
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909, edición digital de ebible.org (archivos fuente de 2015)
- **Fuente consultada:** https://ebible.org/spaRV1909/1JN04.htm · declaración de dominio público: https://ebible.org/spaRV1909/copyright.htm
- **Derechos:** Dominio público en México y España. Reina murió en 1594 y Valera en 1602; la revisión de 1909 es una obra colectiva de las sociedades bíblicas publicada hace más de 100 años. ebible.org la declara «Public Domain». Duda: hay pequeñas variantes de acentuación entre ediciones digitales; se toma ebible.org como edición única de referencia.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Ortografía antigua «á».

### MARTI-EDAD-ORO-TRES-HEROES

- **Texto:** Los desagradecidos no hablan más que de las manchas. Los agradecidos hablan de la luz.
- **Id en el catálogo:** `C2-UNI-MARTI-EDAD-ORO-1` · **Estado:** `pendiente_revision`
- **Autor u obra:** José Martí (1853–1895) · La Edad de Oro (Nueva York, 1889)
- **Ubicación:** Sección «Tres héroes»
- **Idioma original:** español
- **Edición de referencia:** La Edad de Oro, 1889; edición digital de Project Gutenberg n.º 19898
- **Fuente consultada:** https://www.gutenberg.org/files/19898/19898-h/19898-h.htm
- **Derechos:** Dominio público en México y España: escrita en español, sin traducción de por medio; el autor murió en 1895. Duda: conviene cotejar contra un facsímil de la edición de 1889.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Universal.

### MARTI-EDAD-ORO-MENIQUE

- **Texto:** Tener talento es tener buen corazón; el que tiene buen corazón, ése es el que tiene talento.
- **Id en el catálogo:** `C2-UNI-MARTI-EDAD-ORO-2` · **Estado:** `pendiente_revision`
- **Autor u obra:** José Martí (1853–1895) · La Edad de Oro (Nueva York, 1889)
- **Ubicación:** Sección «Meñique»
- **Idioma original:** español
- **Edición de referencia:** La Edad de Oro, 1889; edición digital de Project Gutenberg n.º 19898
- **Fuente consultada:** https://www.gutenberg.org/files/19898/19898-h/19898-h.htm
- **Derechos:** Dominio público en México y España: escrita en español, sin traducción de por medio; el autor murió en 1895. Duda: conviene cotejar contra un facsímil de la edición de 1889.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Universal. «el que tiene buen corazón» usa el masculino genérico de la época; valorar.

### GRACIAN-ORACULO-111

- **Texto:** Tener amigos. Es el segundo ser. Todo amigo es bueno y sabio para el amigo.
- **Id en el catálogo:** `C2-UNI-GRACIAN-111` · **Estado:** `pendiente_revision`
- **Autor u obra:** Baltasar Gracián (1601–1658) · Oráculo manual y arte de prudencia (Huesca, 1647)
- **Ubicación:** Aforismo 111
- **Idioma original:** español
- **Edición de referencia:** Oráculo manual y arte de prudencia; texto de textos.info, con la ortografía original
- **Fuente consultada:** https://www.textos.info/baltasar-gracian/el-arte-de-la-prudencia/ebook
- **Derechos:** Dominio público en México y España: escrita en español; el autor murió en 1658. Duda: textos.info no identifica la edición de la que transcribe; en España una edición crítica tiene protección propia (LPI, art. 129). Cotejar contra un facsímil (Huesca, 1647, o Ámsterdam, 1659).
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Universal.

### GRACIAN-ORACULO-105

- **Texto:** Lo bueno, si breve, dos vezes bueno; y aun lo malo, si poco, no tan malo.
- **Id en el catálogo:** `C2-UNI-GRACIAN-105` · **Estado:** `pendiente_revision`
- **Autor u obra:** Baltasar Gracián (1601–1658) · Oráculo manual y arte de prudencia (Huesca, 1647)
- **Ubicación:** Aforismo 105
- **Idioma original:** español
- **Edición de referencia:** Oráculo manual y arte de prudencia; texto de textos.info, con la ortografía original
- **Fuente consultada:** https://www.textos.info/baltasar-gracian/el-arte-de-la-prudencia/ebook
- **Derechos:** Dominio público en México y España: escrita en español; el autor murió en 1658. Duda: textos.info no identifica la edición de la que transcribe; en España una edición crítica tiene protección propia (LPI, art. 129). Cotejar contra un facsímil (Huesca, 1647, o Ámsterdam, 1659).
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Ortografía original («vezes»): legibilidad baja; valorar si se cita con la ortografía de la edición o se busca una edición antigua con ortografía regularizada.

### DHP-URBANO-1908-5

- **Texto:** «Lo que acaba con los odios no es el odio, sino la ausencia del odio.» He ahí una máxima tan antigua como el mundo.
- **Id en el catálogo:** `C2-BUD-DHP-5` · **Estado:** `pendiente_revision`
- **Autor u obra:** Dhammapada, traducción atribuida a Rafael Urbano (1870–1924)
- **Ubicación:** Verso 5 (capítulo 1, «Las sentencias pares»)
- **Idioma original:** pali (traducido a través del inglés)
- **Edición de referencia:** Sophia, Revista Teosófica, enero de 1908, pp. 26–28; reproducido en e-torredebabel.com
- **Fuente consultada:** https://e-torredebabel.com/las-sentencias-pares/
- **Derechos:** Probablemente en dominio público en México y España: si es de Urbano, murió en 1924; si se tratara como anónima, se publicó en 1908. Dudas: el texto en Sophia no va firmado; se desconoce la traducción inglesa de partida (si fue la de Max Müller, que murió en 1900, no hay problema); la página consultada moderniza acentos y reclama derechos sobre su sitio. Cotejar contra un facsímil de Sophia (1908) en la Hemeroteca Digital de la BNE.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** El texto lleva sus propias comillas: el verso presenta una máxima entre «». Al mostrarse irían dentro de las comillas del componente.

### DHP-URBANO-1908-14

- **Texto:** Y así como en la casa bien techada no cala la lluvia, en el ánimo que medita no penetran las pasiones.
- **Id en el catálogo:** `C2-BUD-DHP-14` · **Estado:** `pendiente_revision`
- **Autor u obra:** Dhammapada, traducción atribuida a Rafael Urbano (1870–1924)
- **Ubicación:** Verso 14 (capítulo 1, «Las sentencias pares»)
- **Idioma original:** pali (traducido a través del inglés)
- **Edición de referencia:** Sophia, Revista Teosófica, enero de 1908, pp. 26–28; reproducido en e-torredebabel.com
- **Fuente consultada:** https://e-torredebabel.com/las-sentencias-pares/
- **Derechos:** Probablemente en dominio público en México y España: si es de Urbano, murió en 1924; si se tratara como anónima, se publicó en 1908. Dudas: el texto en Sophia no va firmado; se desconoce la traducción inglesa de partida (si fue la de Max Müller, que murió en 1900, no hay problema); la página consultada moderniza acentos y reclama derechos sobre su sitio. Cotejar contra un facsímil de Sophia (1908) en la Hemeroteca Digital de la BNE.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** «ánimo que medita»: referencia budista explícita, adecuada a la ruta.

### MARCO-AURELIO-DIAZ-MIRANDA-IV-3

- **Texto:** en ninguna parte tiene el hombre un retiro más quieto ni más desocupado que dentro de su mismo espíritu
- **Id en el catálogo:** `C2-EST-MA-IV-3` · **Estado:** `pendiente_revision`
- **Autor u obra:** Marco Aurelio · Meditaciones (Soliloquios), traducción de Jacinto Díaz de Miranda (1785)
- **Ubicación:** Libro IV, sección 3
- **Idioma original:** griego
- **Edición de referencia:** Traducción de Jacinto Díaz de Miranda, 1.ª edición 1785; texto de textos.info, que declara una revisión de 1888 sin nombrar a quien la hizo
- **Fuente consultada:** https://www.textos.info/marco-aurelio/meditaciones-2/ebook · reimpresión de 1885 (Biblioteca Económica Filosófica) en https://archive.org/details/losdocelibrosde00miragoog
- **Derechos:** Traductor del siglo XVIII, fallecido con seguridad antes de 1925 (año exacto sin verificar). Duda importante: la revisión de 1888 no está identificada; si la firmó alguien muerto después de 1925, sus cambios no están en dominio público en México. Lo seguro es citar la impresión de 1785.
- **Texto verificado:** revisión técnica (Claude, asistente de IA), 2026-10-04, contra la fuente consultada; cotejo final carácter por carácter pendiente.
- **Aprobación editorial:** pendiente
- **Aprobación jurídica:** pendiente
- **Notas:** Es un fragmento: la oración empieza antes («porque…»). Usa «el hombre» como genérico. Antes de aprobarla, valorar si un fragmento que empieza en minúscula cumple §10.
