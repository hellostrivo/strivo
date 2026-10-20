# Fuentes de las frases del día, versión 2 (SPEC_29)

**Fecha:** 14 de octubre de 2026 · **Estado:** 464 citas aprobadas (lote C3, con las dos firmas); las 25
del lote C2 siguen en `pendiente_revision`

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
6. **Además del dominio público, se admiten licencias abiertas que permiten el uso comercial**
   (decisión editorial del 13 de octubre de 2026, con el lote C3). Hoy son dos:
   - **CC BY 4.0, con atribución obligatoria.** Es la de *La Biblia en Español Sencillo* (© 2018
     AudioBiblia.org / Irma Flores). La atribución forma parte de la licencia: va en el campo
     `atribucion` de cada cita —«… · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC
     BY 4.0)»— y la app la muestra tal cual, debajo de la frase y en las fuentes de Tu perfil. La ficha
     actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se
     mantiene en cualquier caso.
   - **CC0.** Las ediciones de SuttaCentral (texto pali y traducciones inglesas de Bhikkhu Sujato) y
     las ediciones digitales de Standard Ebooks, que dedican sus aportes al dominio público.
7. **Existen traducciones editoriales de Strivo.** Cuando no hay una traducción española en dominio
   público, Strivo traduce desde un texto que sí lo está —el original o una traducción inglesa antigua—
   y la cita lo dice en su atribución: «Traducción editorial para Strivo». El punto 3 sigue rigiendo
   para el texto de partida: si es una traducción, cada persona que intervino en ella tiene que estar
   en dominio público. **Las del lote C3 las hizo una IA y se aprobaron sin revisión de una persona
   traductora**; cuando la traducción parte de otra traducción, el expediente lo anota y recomienda
   contrastarla con el original. Son de Strivo: no hay derechos ajenos sobre el texto español.
8. **En el lote C3, «Texto verificado» es una coincidencia automática** carácter por carácter, salvo
   espacios, entre el texto fuente del expediente y el archivo descargado de la fuente consultada
   (13 de octubre de 2026). En una traducción editorial lo que se verifica es el texto de partida, que
   el expediente reproduce en **Texto fuente**.

## Cómo se aprueba una cita

1. Cotejar el texto contra la edición de referencia con copiar y pegar desde el navegador, no desde
   un resumen. La verificación de este documento se hizo leyendo las páginas a través de una
   herramienta que resume, y dos veces esa herramienta devolvió frases que no estaban en la página
   (se descartaron). **En el lote C2, la comprobación final carácter por carácter está pendiente en
   todas**; el lote C3 se verificó como dice el punto 8 del criterio.
2. Completar **Aprobación editorial** y **Aprobación jurídica** con nombre y fecha.
3. Cambiar `estado` a `aprobada` en `citas.js` y correr `node scripts/validar-frases.js`.

## Lo que no se encontró, y la ruta recomendada

> Escrito con el lote C2. El lote C3 se acercó a la ruta del último punto con traducciones editoriales
> de Strivo (criterio, punto 7), aunque casi todas parten de una traducción inglesa en dominio público
> y no de la lengua original. Con ellas las cuatro tradiciones, hinduismo incluido, tienen citas
> aprobadas.

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

### C3-UNI-002

- **Texto:** Con la imaginación se ven cosas que no se pueden ver con los ojos.
- **Id en el catálogo:** `C3-UNI-002` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Martí · La Edad de Oro, Núm. 2, «Las ruinas indias»
- **Autor u obra:** José Martí · La Edad de Oro
- **Ubicación:** Núm. 2, «Las ruinas indias»
- **Idioma original:** español
- **Edición de referencia:** La Edad de Oro (Nueva York, 1889). Transcripción de Project Gutenberg n.º 19898
- **Fuente consultada:** https://www.gutenberg.org/ebooks/19898
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1895: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-003

- **Texto:** Así es la vida, que no cabe en ella todo el bien que pudiera uno hacer.
- **Id en el catálogo:** `C3-UNI-003` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Martí · La Edad de Oro, Núm. 2, «La última página»
- **Autor u obra:** José Martí · La Edad de Oro
- **Ubicación:** Núm. 2, «La última página»
- **Idioma original:** español
- **Edición de referencia:** La Edad de Oro (Nueva York, 1889). Transcripción de Project Gutenberg n.º 19898
- **Fuente consultada:** https://www.gutenberg.org/ebooks/19898
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1895: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** El párrafo contiene una alusión al suicidio unas líneas antes; la oración en sí es serena.

### C3-UNI-004

- **Texto:** Se es bueno porque sí; y porque allá adentro se siente como un gusto cuando se ha hecho un bien, o se ha dicho algo útil a los demás.
- **Id en el catálogo:** `C3-UNI-004` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Martí · La Edad de Oro, Núm. 3, «La última página»
- **Autor u obra:** José Martí · La Edad de Oro
- **Ubicación:** Núm. 3, «La última página»
- **Idioma original:** español
- **Edición de referencia:** La Edad de Oro (Nueva York, 1889). Transcripción de Project Gutenberg n.º 19898
- **Fuente consultada:** https://www.gutenberg.org/ebooks/19898
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1895: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-006

- **Texto:** La bondad es la flor de la fuerza.
- **Id en el catálogo:** `C3-UNI-006` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Martí · Amistad funesta, Capítulo I
- **Autor u obra:** José Martí · Amistad funesta
- **Ubicación:** Capítulo I
- **Idioma original:** español
- **Edición de referencia:** Amistad funesta (1885). Transcripción de Project Gutenberg n.º 18166
- **Fuente consultada:** https://www.gutenberg.org/ebooks/18166
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1895: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Bondad en general, no solo hacia una misma.

### C3-UNI-009

- **Texto:** Se busca la compañía de los que nos aman.
- **Id en el catálogo:** `C3-UNI-009` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Martí · Amistad funesta, Capítulo III
- **Autor u obra:** José Martí · Amistad funesta
- **Ubicación:** Capítulo III
- **Idioma original:** español
- **Edición de referencia:** Amistad funesta (1885). Transcripción de Project Gutenberg n.º 18166
- **Fuente consultada:** https://www.gutenberg.org/ebooks/18166
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1895: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-010

- **Texto:** Pensar, soñar, admirar: he ahí los nombres de los sutiles visitantes de mi celda.
- **Id en el catálogo:** `C3-UNI-010` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Enrique Rodó · Ariel, Discurso de Próspero, pasaje del «reino interior» (cuento del rey hospitalario)
- **Autor u obra:** José Enrique Rodó · Ariel
- **Ubicación:** Discurso de Próspero, pasaje del «reino interior» (cuento del rey hospitalario)
- **Idioma original:** español
- **Edición de referencia:** Ariel (Montevideo, 1900). Transcripción de Project Gutenberg n.º 22899
- **Fuente consultada:** https://www.gutenberg.org/ebooks/22899
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1917: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** «Mi celda» = el espacio interior de cada persona; puede requerir algo de contexto.

### C3-UNI-011

- **Texto:** Aun dentro de la esclavitud material, hay la posibilidad de salvar la libertad interior: la de la razón y el sentimiento.
- **Id en el catálogo:** `C3-UNI-011` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Enrique Rodó · Ariel, Discurso de Próspero, parte sobre la libertad interior
- **Autor u obra:** José Enrique Rodó · Ariel
- **Ubicación:** Discurso de Próspero, parte sobre la libertad interior
- **Idioma original:** español
- **Edición de referencia:** Ariel (Montevideo, 1900). Transcripción de Project Gutenberg n.º 22899
- **Fuente consultada:** https://www.gutenberg.org/ebooks/22899
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1917: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-012

- **Texto:** La vibración de las estrellas se parece al movimiento de unas manos de sembrador.
- **Id en el catálogo:** `C3-UNI-012` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Enrique Rodó · Ariel, Final de la obra (palabras de Enjolrás)
- **Autor u obra:** José Enrique Rodó · Ariel
- **Ubicación:** Final de la obra (palabras de Enjolrás)
- **Idioma original:** español
- **Edición de referencia:** Ariel (Montevideo, 1900). Transcripción de Project Gutenberg n.º 22899
- **Fuente consultada:** https://www.gutenberg.org/ebooks/22899
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1917: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Última línea del libro, dicha por el discípulo Enjolrás.

### C3-UNI-013

- **Texto:** El arte de pensar bien no se aprende tanto con reglas como con modelos.
- **Id en el catálogo:** `C3-UNI-013` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Jaime Balmes · El Criterio, Capítulo I, § VI «Cómo se debe enseñar á pensar bien»
- **Autor u obra:** Jaime Balmes · El Criterio
- **Ubicación:** Capítulo I, § VI «Cómo se debe enseñar á pensar bien»
- **Idioma original:** español
- **Edición de referencia:** El Criterio (1845). Transcripción de Project Gutenberg n.º 28929
- **Fuente consultada:** https://www.gutenberg.org/ebooks/28929
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1848: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-014

- **Texto:** El primer medio para pensar bien es atender bien.
- **Id en el catálogo:** `C3-UNI-014` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Jaime Balmes · El Criterio, Capítulo II «La atención», § I
- **Autor u obra:** Jaime Balmes · El Criterio
- **Ubicación:** Capítulo II «La atención», § I
- **Idioma original:** español
- **Edición de referencia:** El Criterio (1845). Transcripción de Project Gutenberg n.º 28929
- **Fuente consultada:** https://www.gutenberg.org/ebooks/28929
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1848: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-015

- **Texto:** No está la dificultad en comprender sino en atinar.
- **Id en el catálogo:** `C3-UNI-015` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Jaime Balmes · El Criterio, Capítulo XVI «No todo lo hace el discurso», § V (título del párrafo)
- **Autor u obra:** Jaime Balmes · El Criterio
- **Ubicación:** Capítulo XVI «No todo lo hace el discurso», § V (título del párrafo)
- **Idioma original:** español
- **Edición de referencia:** El Criterio (1845). Transcripción de Project Gutenberg n.º 28929
- **Fuente consultada:** https://www.gutenberg.org/ebooks/28929
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1848: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Es el sumario/título del § V, escrito por Balmes.

### C3-UNI-016

- **Texto:** Las pasiones son buenos instrumentos, pero malos consejeros.
- **Id en el catálogo:** `C3-UNI-016` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Jaime Balmes · El Criterio, Capítulo XXII «El entendimiento práctico», § XXXVII (título del párrafo)
- **Autor u obra:** Jaime Balmes · El Criterio
- **Ubicación:** Capítulo XXII «El entendimiento práctico», § XXXVII (título del párrafo)
- **Idioma original:** español
- **Edición de referencia:** El Criterio (1845). Transcripción de Project Gutenberg n.º 28929
- **Fuente consultada:** https://www.gutenberg.org/ebooks/28929
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1848: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Es el título del § XXXVII, escrito por Balmes.

### C3-UNI-017

- **Texto:** No todas las cosas se han de mirar de la misma manera, sino del modo que cada una de ellas se ve mejor.
- **Id en el catálogo:** `C3-UNI-017` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Jaime Balmes · El Criterio, Capítulo XXII «El entendimiento práctico», § LX «Conclusion y resúmen»
- **Autor u obra:** Jaime Balmes · El Criterio
- **Ubicación:** Capítulo XXII «El entendimiento práctico», § LX «Conclusion y resúmen»
- **Idioma original:** español
- **Edición de referencia:** El Criterio (1845). Transcripción de Project Gutenberg n.º 28929
- **Fuente consultada:** https://www.gutenberg.org/ebooks/28929
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1848: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-018

- **Texto:** Mientras la experiencia no da su fallo, todo ideal es respetable, aunque parezca absurdo.
- **Id en el catálogo:** `C3-UNI-018` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Ingenieros · Hacia una moral sin dogmas, «La ética social», 3. Idealismo y perfectibilidad
- **Autor u obra:** José Ingenieros · Hacia una moral sin dogmas
- **Ubicación:** «La ética social», 3. Idealismo y perfectibilidad
- **Idioma original:** español
- **Edición de referencia:** Hacia una moral sin dogmas (Buenos Aires, 1917). Transcripción de Project Gutenberg n.º 56301
- **Fuente consultada:** https://www.gutenberg.org/ebooks/56301
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1925: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ingenieros cita aquí una página suya anterior (entre comillas en el original); el texto es del mismo autor.

### C3-UNI-019

- **Texto:** La verdad se va haciendo, incesante e ilimitadamente, en todos los dominios de nuestra experiencia.
- **Id en el catálogo:** `C3-UNI-019` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José Ingenieros · Hacia una moral sin dogmas, «La ética social», 10. Ciencias morales sin dogmatismo
- **Autor u obra:** José Ingenieros · Hacia una moral sin dogmas
- **Ubicación:** «La ética social», 10. Ciencias morales sin dogmatismo
- **Idioma original:** español
- **Edición de referencia:** Hacia una moral sin dogmas (Buenos Aires, 1917). Transcripción de Project Gutenberg n.º 56301
- **Fuente consultada:** https://www.gutenberg.org/ebooks/56301
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1925: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-020

- **Texto:** ¿Quién no hace locuras y disparates alguna vez en su vida?
- **Id en el catálogo:** `C3-UNI-020` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mariano José de Larra · Fígaro (Artículos selectos), «Los calaveras»
- **Autor u obra:** Mariano José de Larra · Fígaro (Artículos selectos)
- **Ubicación:** «Los calaveras»
- **Idioma original:** español
- **Edición de referencia:** Fígaro. Artículos selectos. Transcripción de Project Gutenberg n.º 31541
- **Fuente consultada:** https://www.gutenberg.org/ebooks/31541
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1837: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-021

- **Texto:** Si por el camino trillado nada se ha hecho, camino nuevo.
- **Id en el catálogo:** `C3-UNI-021` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mariano José de Larra · Fígaro (Artículos selectos), «El hombre-globo»
- **Autor u obra:** Mariano José de Larra · Fígaro (Artículos selectos)
- **Ubicación:** «El hombre-globo»
- **Idioma original:** español
- **Edición de referencia:** Fígaro. Artículos selectos. Transcripción de Project Gutenberg n.º 31541
- **Fuente consultada:** https://www.gutenberg.org/ebooks/31541
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1837: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-022

- **Texto:** La belleza habla por sí misma.
- **Id en el catálogo:** `C3-UNI-022` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Miguel Cané · Prosa ligera, «España»: «El arte español»
- **Autor u obra:** Miguel Cané · Prosa ligera
- **Ubicación:** «España»: «El arte español»
- **Idioma original:** español
- **Edición de referencia:** Juvenilia y Prosa ligera. Transcripción de Project Gutenberg n.º 41575
- **Fuente consultada:** https://www.gutenberg.org/ebooks/41575
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1905: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Prosa ligera (mismo archivo que Juvenilia).

### C3-UNI-023

- **Texto:** Así corrían las noches en la alegría, como los días en la serenidad.
- **Id en el catálogo:** `C3-UNI-023` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Miguel Cané · Prosa ligera, «En la tierra»: «Tucumana»
- **Autor u obra:** Miguel Cané · Prosa ligera
- **Ubicación:** «En la tierra»: «Tucumana»
- **Idioma original:** español
- **Edición de referencia:** Juvenilia y Prosa ligera. Transcripción de Project Gutenberg n.º 41575
- **Fuente consultada:** https://www.gutenberg.org/ebooks/41575
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1905: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Prosa ligera (mismo archivo que Juvenilia).

### C3-UNI-026

- **Texto:** Según él, el secreto para llegar pronto no está en andar ligero, sino en andar seguido.
- **Id en el catálogo:** `C3-UNI-026` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Miguel Cané · Prosa ligera, «En la tierra»: «En el fondo del río» (fragmento «Tobías»)
- **Autor u obra:** Miguel Cané · Prosa ligera
- **Ubicación:** «En la tierra»: «En el fondo del río» (fragmento «Tobías»)
- **Idioma original:** español
- **Edición de referencia:** Juvenilia y Prosa ligera. Transcripción de Project Gutenberg n.º 41575
- **Fuente consultada:** https://www.gutenberg.org/ebooks/41575
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1905: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Prosa ligera. «Él» = el baqueano Tobías.

### C3-UNI-029

- **Texto:** Se parecen mucho, sí, las obras de la fuerza a las de la paciencia.
- **Id en el catálogo:** `C3-UNI-029` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Benito Pérez Galdós · Marianela, Capítulo V, «Trabajo. Paisaje. Figura»
- **Autor u obra:** Benito Pérez Galdós · Marianela
- **Ubicación:** Capítulo V, «Trabajo. Paisaje. Figura»
- **Idioma original:** español
- **Edición de referencia:** Marianela (1878). Transcripción de Project Gutenberg n.º 17340
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17340
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1920: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-030

- **Texto:** El aire que corre es suave y fresco, y el sol calienta sin quemar.
- **Id en el catálogo:** `C3-UNI-030` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Benito Pérez Galdós · Marianela, Capítulo VI, «Tonterías»
- **Autor u obra:** Benito Pérez Galdós · Marianela
- **Ubicación:** Capítulo VI, «Tonterías»
- **Idioma original:** español
- **Edición de referencia:** Marianela (1878). Transcripción de Project Gutenberg n.º 17340
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17340
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1920: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-031

- **Texto:** Las flores son las estrellas de la tierra.
- **Id en el catálogo:** `C3-UNI-031` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Benito Pérez Galdós · Marianela, Capítulo VI, «Tonterías»
- **Autor u obra:** Benito Pérez Galdós · Marianela
- **Ubicación:** Capítulo VI, «Tonterías»
- **Idioma original:** español
- **Edición de referencia:** Marianela (1878). Transcripción de Project Gutenberg n.º 17340
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17340
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1920: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-032

- **Texto:** Estoy muy alegre y muy triste, las dos cosas a un tiempo.
- **Id en el catálogo:** `C3-UNI-032` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Benito Pérez Galdós · Marianela, Capítulo VIII, «Prosiguen las tonterías»
- **Autor u obra:** Benito Pérez Galdós · Marianela
- **Ubicación:** Capítulo VIII, «Prosiguen las tonterías»
- **Idioma original:** español
- **Edición de referencia:** Marianela (1878). Transcripción de Project Gutenberg n.º 17340
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17340
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1920: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-033

- **Texto:** Lo que es y lo que se siente, ¿no son una misma cosa?
- **Id en el catálogo:** `C3-UNI-033` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Benito Pérez Galdós · Marianela, Capítulo XV, «Los tres»
- **Autor u obra:** Benito Pérez Galdós · Marianela
- **Ubicación:** Capítulo XV, «Los tres»
- **Idioma original:** español
- **Edición de referencia:** Marianela (1878). Transcripción de Project Gutenberg n.º 17340
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17340
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1920: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-034

- **Texto:** No se pasa de la ceguera a la luz, no se entra en los soberanos dominios del sol como quien entra en un teatro.
- **Id en el catálogo:** `C3-UNI-034` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Benito Pérez Galdós · Marianela, Capítulo XX, «El nuevo mundo»
- **Autor u obra:** Benito Pérez Galdós · Marianela
- **Ubicación:** Capítulo XX, «El nuevo mundo»
- **Idioma original:** español
- **Edición de referencia:** Marianela (1878). Transcripción de Project Gutenberg n.º 17340
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17340
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1920: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** En la novela alude a la curación de un ciego; se entiende como imagen del cambio gradual.

### C3-UNI-036

- **Texto:** Me gustan los hechos, la vida, las particularidades.
- **Id en el catálogo:** `C3-UNI-036` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Benito Pérez Galdós · El amigo Manso, Capítulo XX
- **Autor u obra:** Benito Pérez Galdós · El amigo Manso
- **Ubicación:** Capítulo XX
- **Idioma original:** español
- **Edición de referencia:** El amigo Manso (1882). Transcripción de Project Gutenberg n.º 55563
- **Fuente consultada:** https://www.gutenberg.org/ebooks/55563
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1920: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-037

- **Texto:** Todo pasa, y el consuelo es ley del mundo moral.
- **Id en el catálogo:** `C3-UNI-037` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Benito Pérez Galdós · El amigo Manso, Capítulo XLIV
- **Autor u obra:** Benito Pérez Galdós · El amigo Manso
- **Ubicación:** Capítulo XLIV
- **Idioma original:** español
- **Edición de referencia:** El amigo Manso (1882). Transcripción de Project Gutenberg n.º 55563
- **Fuente consultada:** https://www.gutenberg.org/ebooks/55563
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1920: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-038

- **Texto:** Para las ocasiones son los amigos.
- **Id en el catálogo:** `C3-UNI-038` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Benito Pérez Galdós · Misericordia, Capítulo IV
- **Autor u obra:** Benito Pérez Galdós · Misericordia
- **Ubicación:** Capítulo IV
- **Idioma original:** español
- **Edición de referencia:** Misericordia (1897). Transcripción de Project Gutenberg n.º 21831
- **Fuente consultada:** https://www.gutenberg.org/ebooks/21831
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1920: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-040

- **Texto:** Puedo torcerme, pero no quebrantarme.
- **Id en el catálogo:** `C3-UNI-040` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Emilia Pardo Bazán · Cuentos de amor, Cuento «Afra»
- **Autor u obra:** Emilia Pardo Bazán · Cuentos de amor
- **Ubicación:** Cuento «Afra»
- **Idioma original:** español
- **Edición de referencia:** Cuentos de amor (1898). Transcripción de Project Gutenberg n.º 55514
- **Fuente consultada:** https://www.gutenberg.org/ebooks/55514
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1921: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** En el cuento es parte de lo que «dice» un rostro, entre comillas angulares; se cita solo esta oración.

### C3-UNI-041

- **Texto:** Así que cobró algún ánimo, se levantó y siguió viviendo.
- **Id en el catálogo:** `C3-UNI-041` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Emilia Pardo Bazán · Cuentos de amor, Cuento «La culpable»
- **Autor u obra:** Emilia Pardo Bazán · Cuentos de amor
- **Ubicación:** Cuento «La culpable»
- **Idioma original:** español
- **Edición de referencia:** Cuentos de amor (1898). Transcripción de Project Gutenberg n.º 55514
- **Fuente consultada:** https://www.gutenberg.org/ebooks/55514
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1921: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-042

- **Texto:** Todo me parece más chico, mucho más chico; pero también más bonito que el recuerdo que tenía.
- **Id en el catálogo:** `C3-UNI-042` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan Valera · Pepita Jiménez, Parte I, «Cartas de mi sobrino», carta del 22 de marzo
- **Autor u obra:** Juan Valera · Pepita Jiménez
- **Ubicación:** Parte I, «Cartas de mi sobrino», carta del 22 de marzo
- **Idioma original:** español
- **Edición de referencia:** Pepita Jiménez (1874). Transcripción de Project Gutenberg n.º 17223
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17223
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1905: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-043

- **Texto:** Es portentosa la multitud de pajarillos que alegran estos campos y alamedas.
- **Id en el catálogo:** `C3-UNI-043` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan Valera · Pepita Jiménez, Parte I, «Cartas de mi sobrino», carta del 22 de marzo
- **Autor u obra:** Juan Valera · Pepita Jiménez
- **Ubicación:** Parte I, «Cartas de mi sobrino», carta del 22 de marzo
- **Idioma original:** español
- **Edición de referencia:** Pepita Jiménez (1874). Transcripción de Project Gutenberg n.º 17223
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17223
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1905: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-044

- **Texto:** La vida de aquí tiene cierto encanto.
- **Id en el catálogo:** `C3-UNI-044` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan Valera · Pepita Jiménez, Parte I, «Cartas de mi sobrino», carta del 4 de mayo
- **Autor u obra:** Juan Valera · Pepita Jiménez
- **Ubicación:** Parte I, «Cartas de mi sobrino», carta del 4 de mayo
- **Idioma original:** español
- **Edición de referencia:** Pepita Jiménez (1874). Transcripción de Project Gutenberg n.º 17223
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17223
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1905: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-045

- **Texto:** Para quien no sueña con la gloria, para quien nada ambiciona, comprendo que sea muy descansada y dulce vida.
- **Id en el catálogo:** `C3-UNI-045` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan Valera · Pepita Jiménez, Parte I, «Cartas de mi sobrino», carta del 4 de mayo
- **Autor u obra:** Juan Valera · Pepita Jiménez
- **Ubicación:** Parte I, «Cartas de mi sobrino», carta del 4 de mayo
- **Idioma original:** español
- **Edición de referencia:** Pepita Jiménez (1874). Transcripción de Project Gutenberg n.º 17223
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17223
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1905: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-046

- **Texto:** Ni un leve soplo de viento interrumpía el sosiego de la noche y la serenidad del ambiente.
- **Id en el catálogo:** `C3-UNI-046` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan Valera · Pepita Jiménez, Parte II, «Paralipómenos»
- **Autor u obra:** Juan Valera · Pepita Jiménez
- **Ubicación:** Parte II, «Paralipómenos»
- **Idioma original:** español
- **Edición de referencia:** Pepita Jiménez (1874). Transcripción de Project Gutenberg n.º 17223
- **Fuente consultada:** https://www.gutenberg.org/ebooks/17223
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1905: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-047

- **Texto:** Los mismos ruiseñores cantan los mismos trinos, y en diferentes lenguas es la misma canción.
- **Id en el catálogo:** `C3-UNI-047` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Rubén Darío · Cantos de vida y esperanza, «Los cisnes», poema I (A Juan R. Jiménez), estrofa 2, versos 3-4
- **Autor u obra:** Rubén Darío · Cantos de vida y esperanza
- **Ubicación:** «Los cisnes», poema I (A Juan R. Jiménez), estrofa 2, versos 3-4
- **Idioma original:** español
- **Edición de referencia:** Cantos de vida y esperanza (Obras completas, vol. VII). Transcripción de Project Gutenberg n.º 50341
- **Fuente consultada:** https://www.gutenberg.org/ebooks/50341
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1916: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Versos unidos en una línea.

### C3-UNI-048

- **Texto:** Lo que el árbol desea decir y dice al viento, y lo que el animal manifiesta en su instinto, cristalizamos en palabra y pensamiento.
- **Id en el catálogo:** `C3-UNI-048` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Rubén Darío · Cantos de vida y esperanza, «Otros poemas», XXII, «Ay, triste del que un día...», estrofa 2, versos 1-3
- **Autor u obra:** Rubén Darío · Cantos de vida y esperanza
- **Ubicación:** «Otros poemas», XXII, «Ay, triste del que un día...», estrofa 2, versos 1-3
- **Idioma original:** español
- **Edición de referencia:** Cantos de vida y esperanza (Obras completas, vol. VII). Transcripción de Project Gutenberg n.º 50341
- **Fuente consultada:** https://www.gutenberg.org/ebooks/50341
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1916: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Versos unidos en una línea.

### C3-UNI-051

- **Texto:** Así, la principal condición del pensador es la serenidad.
- **Id en el catálogo:** `C3-UNI-051` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Rubén Darío · Cabezas, Semblanza «José Enrique Rodó»
- **Autor u obra:** Rubén Darío · Cabezas
- **Ubicación:** Semblanza «José Enrique Rodó»
- **Idioma original:** español
- **Edición de referencia:** Cabezas (Obras completas, vol. XXII). Transcripción de Project Gutenberg n.º 56047
- **Fuente consultada:** https://www.gutenberg.org/ebooks/56047
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1916: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-052

- **Texto:** Vamos, que cuanto más se vive, más se aprende.
- **Id en el catálogo:** `C3-UNI-052` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José María de Pereda · Peñas arriba, Capítulo III
- **Autor u obra:** José María de Pereda · Peñas arriba
- **Ubicación:** Capítulo III
- **Idioma original:** español
- **Edición de referencia:** Peñas arriba (1895). Transcripción de Project Gutenberg n.º 24127
- **Fuente consultada:** https://www.gutenberg.org/ebooks/24127
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1906: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-054

- **Texto:** En fin, que dentro de mí y en derredor mío era plácido y risueño todo lo que poco antes había sido triste y aflictivo y tenebroso.
- **Id en el catálogo:** `C3-UNI-054` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José María de Pereda · Peñas arriba, Capítulo XXXII
- **Autor u obra:** José María de Pereda · Peñas arriba
- **Ubicación:** Capítulo XXXII
- **Idioma original:** español
- **Edición de referencia:** Peñas arriba (1895). Transcripción de Project Gutenberg n.º 24127
- **Fuente consultada:** https://www.gutenberg.org/ebooks/24127
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1906: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-056

- **Texto:** No quedó el camino a mi gusto, pero sí muy mejorado.
- **Id en el catálogo:** `C3-UNI-056` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José María de Pereda · Peñas arriba, Capítulo XXXII
- **Autor u obra:** José María de Pereda · Peñas arriba
- **Ubicación:** Capítulo XXXII
- **Idioma original:** español
- **Edición de referencia:** Peñas arriba (1895). Transcripción de Project Gutenberg n.º 24127
- **Fuente consultada:** https://www.gutenberg.org/ebooks/24127
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1906: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-057

- **Texto:** De todas suertes, no cabía hacer cosa mayor que la que se había hecho, en la pequeñez de las fuerzas humanas.
- **Id en el catálogo:** `C3-UNI-057` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** José María de Pereda · Peñas arriba, Capítulo XXI
- **Autor u obra:** José María de Pereda · Peñas arriba
- **Ubicación:** Capítulo XXI
- **Idioma original:** español
- **Edición de referencia:** Peñas arriba (1895). Transcripción de Project Gutenberg n.º 24127
- **Fuente consultada:** https://www.gutenberg.org/ebooks/24127
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1906: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-058

- **Texto:** Dice un refrán que la mula y la paciencia se fatigan si hay apuro, y lo mismo pensamos del amor.
- **Id en el catálogo:** `C3-UNI-058` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Ricardo Palma · Tradiciones peruanas, Tradición «La gatita de Mari-Ramos que halaga con la cola y araña con las manos», IV (primera oración)
- **Autor u obra:** Ricardo Palma · Tradiciones peruanas
- **Ubicación:** Tradición «La gatita de Mari-Ramos que halaga con la cola y araña con las manos», IV (primera oración)
- **Idioma original:** español
- **Edición de referencia:** Tradiciones peruanas. Transcripción de Project Gutenberg n.º 21282
- **Fuente consultada:** https://www.gutenberg.org/ebooks/21282
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1919: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-059

- **Texto:** El verdadero dolor huye del bullicio.
- **Id en el catálogo:** `C3-UNI-059` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Ricardo Palma · Tradiciones peruanas, Tradición «La llorona del Viernes Santo»
- **Autor u obra:** Ricardo Palma · Tradiciones peruanas
- **Ubicación:** Tradición «La llorona del Viernes Santo»
- **Idioma original:** español
- **Edición de referencia:** Tradiciones peruanas. Transcripción de Project Gutenberg n.º 21282
- **Fuente consultada:** https://www.gutenberg.org/ebooks/21282
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1919: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-060

- **Texto:** Los postreros rumores del día anunciaban por dondequiera la proximidad del silencio.
- **Id en el catálogo:** `C3-UNI-060` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Ignacio Manuel Altamirano · La Navidad en las montañas, Capítulo I
- **Autor u obra:** Ignacio Manuel Altamirano · La Navidad en las montañas
- **Ubicación:** Capítulo I
- **Idioma original:** español
- **Edición de referencia:** La Navidad en las montañas (1871). Transcripción de Project Gutenberg n.º 10825
- **Fuente consultada:** https://www.gutenberg.org/ebooks/10825
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1893: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-061

- **Texto:** El heno representa la vejez del año, como las rosas representan su juventud.
- **Id en el catálogo:** `C3-UNI-061` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Ignacio Manuel Altamirano · La Navidad en las montañas, Capítulo XI
- **Autor u obra:** Ignacio Manuel Altamirano · La Navidad en las montañas
- **Ubicación:** Capítulo XI
- **Idioma original:** español
- **Edición de referencia:** La Navidad en las montañas (1871). Transcripción de Project Gutenberg n.º 10825
- **Fuente consultada:** https://www.gutenberg.org/ebooks/10825
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1893: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-062

- **Texto:** Es innegable que las cosas sencillas son las que más conmueven los corazones profundos y los grandes entendimientos.
- **Id en el catálogo:** `C3-UNI-062` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Fernán Caballero · La gaviota, Capítulo I (primer párrafo, tras el epígrafe)
- **Autor u obra:** Fernán Caballero · La gaviota
- **Ubicación:** Capítulo I (primer párrafo, tras el epígrafe)
- **Idioma original:** español
- **Edición de referencia:** La gaviota (1849). Transcripción de Project Gutenberg n.º 23600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/23600
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1877: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-063

- **Texto:** ¿Es regular que el día de mañana nos amargue el de hoy?
- **Id en el catálogo:** `C3-UNI-063` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Fernán Caballero · La gaviota, Capítulo IX
- **Autor u obra:** Fernán Caballero · La gaviota
- **Ubicación:** Capítulo IX
- **Idioma original:** español
- **Edición de referencia:** La gaviota (1849). Transcripción de Project Gutenberg n.º 23600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/23600
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1877: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-UNI-064

- **Texto:** El tiempo quiebra, sin canto ni piedra.
- **Id en el catálogo:** `C3-UNI-064` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Fernán Caballero · La gaviota, Capítulo XI
- **Autor u obra:** Fernán Caballero · La gaviota
- **Ubicación:** Capítulo XI
- **Idioma original:** español
- **Edición de referencia:** La gaviota (1849). Transcripción de Project Gutenberg n.º 23600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/23600
- **Licencia:** Dominio público
- **Derechos:** Escrita en español, sin traducción de por medio; el autor murió en 1877: dominio público en México (muerte en 1925 o antes) y España. La transcripción de Gutenberg no siempre identifica la impresión de origen: cotejar con un facsímil de época si existe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Refrán que dice un personaje.

### C3-UNI-067

- **Texto:** La mañana es cuando estoy despierto y hay un amanecer en mí.
- **Id en el catálogo:** `C3-UNI-067` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Dónde viví y para qué viví» (Where I Lived, and What I Lived For) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Dónde viví y para qué viví» (Where I Lived, and What I Lived For)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** Morning is when I am awake and there is a dawn in me.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-068

- **Texto:** Cada mañana era una alegre invitación a hacer mi vida tan sencilla, y diría tan inocente, como la naturaleza misma.
- **Id en el catálogo:** `C3-UNI-068` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Dónde viví y para qué viví» (Where I Lived, and What I Lived For) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Dónde viví y para qué viví» (Where I Lived, and What I Lived For)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** Every morning was a cheerful invitation to make my life of equal simplicity, and I may say innocence, with Nature herself.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-069

- **Texto:** Había ocasiones en que no podía permitirme sacrificar la flor del momento presente a ningún trabajo, ni de la cabeza ni de las manos.
- **Id en el catálogo:** `C3-UNI-069` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Sonidos» (Sounds) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Sonidos» (Sounds)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** There were times when I could not afford to sacrifice the bloom of the present moment to any work, whether of the head or hands.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-070

- **Texto:** Me gusta que mi vida tenga un margen amplio.
- **Id en el catálogo:** `C3-UNI-070` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Sonidos» (Sounds) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Sonidos» (Sounds)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** I love a broad margin to my life.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Broad margin»: espacio libre, holgura; se tradujo como «margen amplio».

### C3-UNI-071

- **Texto:** Tengo mucha compañía en mi casa, sobre todo por la mañana, cuando nadie viene de visita.
- **Id en el catálogo:** `C3-UNI-071` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Soledad» (Solitude) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Soledad» (Solitude)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** I have a great deal of company in my house; especially in the morning, when nobody calls.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-072

- **Texto:** El tiempo no es más que el arroyo donde voy a pescar.
- **Id en el catálogo:** `C3-UNI-072` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Dónde viví y para qué viví» (Where I Lived, and What I Lived For) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Dónde viví y para qué viví» (Where I Lived, and What I Lived For)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** Time is but the stream I go a-fishing in.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-073

- **Texto:** Si alguien no lleva el paso de sus compañeros, quizá sea porque oye un tambor distinto.
- **Id en el catálogo:** `C3-UNI-073` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Conclusión» (Conclusion) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Conclusión» (Conclusion)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** If a man does not keep pace with his companions, perhaps it is because he hears a different drummer.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «A man» genérico traducido como «alguien».

### C3-UNI-074

- **Texto:** El sol poniente brilla en las ventanas del asilo tanto como en la casa del rico; ante su puerta la nieve se derrite igual de pronto en primavera.
- **Id en el catálogo:** `C3-UNI-074` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Conclusión» (Conclusion) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Conclusión» (Conclusion)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** The setting sun is reflected from the windows of the almshouse as brightly as from the rich man's abode; the snow melts before its door as early in the spring.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Almshouse»: asilo de pobres. «Is reflected… as brightly as» → «brilla… tanto como», por largo.

### C3-UNI-075

- **Texto:** Las cosas no cambian; cambiamos nosotros.
- **Id en el catálogo:** `C3-UNI-075` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Conclusión» (Conclusion) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Conclusión» (Conclusion)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** Things do not change; we change.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-076

- **Texto:** Tenía tres sillas en mi casa: una para la soledad, dos para la amistad, tres para la vida social.
- **Id en el catálogo:** `C3-UNI-076` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Visitantes» (Visitors) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Visitantes» (Visitors)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** I had three chairs in my house; one for solitude, two for friendship, three for society.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Society» en el sentido de reunión o trato social.

### C3-UNI-077

- **Texto:** Queda más día por amanecer. El sol no es más que una estrella de la mañana.
- **Id en el catálogo:** `C3-UNI-077` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Conclusión» (Conclusion), últimas líneas del libro · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Conclusión» (Conclusion), últimas líneas del libro
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** There is more day to dawn. The sun is but a morning star.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-078

- **Texto:** ¿Por qué habríamos de vivir con tanta prisa y tanto desperdicio de vida?
- **Id en el catálogo:** `C3-UNI-078` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Dónde viví y para qué viví» (Where I Lived, and What I Lived For) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Dónde viví y para qué viví» (Where I Lived, and What I Lived For)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** Why should we live with such hurry and waste of life?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-079

- **Texto:** Voy y vengo con una extraña libertad en la naturaleza, como parte de ella.
- **Id en el catálogo:** `C3-UNI-079` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Soledad» (Solitude) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Soledad» (Solitude)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** I go and come with a strange liberty in Nature, a part of herself.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-080

- **Texto:** Me retiré aún más dentro de mi caparazón y procuré mantener un fuego vivo tanto en mi casa como en mi pecho.
- **Id en el catálogo:** `C3-UNI-080` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Calentando la casa» (House-Warming) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Calentando la casa» (House-Warming)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** I withdrew yet farther into my shell, and endeavored to keep a bright fire both within my house and within my breast.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-081

- **Texto:** Me alegraba ver mi obra levantarse tan recta y sólida poco a poco, y pensaba que, si avanzaba despacio, era para durar mucho tiempo.
- **Id en el catálogo:** `C3-UNI-081` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Calentando la casa» (House-Warming) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Calentando la casa» (House-Warming)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** I was pleased to see my work rising so square and solid by degrees, and reflected, that, if it proceeded slowly, it was calculated to endure a long time.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Habla de la chimenea que construía; «calculated to endure» → «era para durar».

### C3-UNI-083

- **Texto:** Cuántas personas han fechado una nueva etapa de su vida a partir de la lectura de un libro.
- **Id en el catálogo:** `C3-UNI-083` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Walden, Capítulo «Lectura» (Reading) · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Walden
- **Ubicación:** Capítulo «Lectura» (Reading)
- **Idioma original:** inglés
- **Edición de referencia:** Walden (1854), transcripción de Project Gutenberg n.º 205
- **Fuente consultada:** https://www.gutenberg.org/ebooks/205
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público en México y España. La traducción española es nueva, de Strivo.
- **Texto fuente:** How many a man has dated a new era in his life from the reading of a book!
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · El original termina en exclamación; se cerró con punto por la regla de voz. «A man» genérico → «personas».

### C3-UNI-084

- **Texto:** Nada puede darte paz, excepto tú.
- **Id en el catálogo:** `C3-UNI-084` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, primera serie, Ensayo II, «Confianza en sí mismo» (Self-Reliance), penúltima línea · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, primera serie
- **Ubicación:** Ensayo II, «Confianza en sí mismo» (Self-Reliance), penúltima línea
- **Idioma original:** inglés
- **Edición de referencia:** Essays: First Series (1841), Project Gutenberg n.º 2944
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2944
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** Nothing can bring you peace but yourself.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-085

- **Texto:** Lo que debo hacer es todo lo que me concierne, no lo que piensa la gente.
- **Id en el catálogo:** `C3-UNI-085` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, primera serie, Ensayo II, «Confianza en sí mismo» (Self-Reliance) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, primera serie
- **Ubicación:** Ensayo II, «Confianza en sí mismo» (Self-Reliance)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: First Series (1841), Project Gutenberg n.º 2944
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2944
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** What I must do is all that concerns me, not what the people think.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Must» en primera persona, traducido como «debo».

### C3-UNI-086

- **Texto:** Está la rosa, sin más; es perfecta en cada momento de su existencia.
- **Id en el catálogo:** `C3-UNI-086` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, primera serie, Ensayo II, «Confianza en sí mismo» (Self-Reliance) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, primera serie
- **Ubicación:** Ensayo II, «Confianza en sí mismo» (Self-Reliance)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: First Series (1841), Project Gutenberg n.º 2944
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2944
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** There is simply the rose; it is perfect in every moment of its existence.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · La oración previa del original menciona a Dios; se cita solo esta, que se sostiene sola.

### C3-UNI-087

- **Texto:** Por cada cosa que te has perdido, has ganado otra; y por cada cosa que ganas, pierdes algo.
- **Id en el catálogo:** `C3-UNI-087` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, primera serie, Ensayo III, «Compensación» (Compensation) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, primera serie
- **Ubicación:** Ensayo III, «Compensación» (Compensation)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: First Series (1841), Project Gutenberg n.º 2944
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2944
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** For every thing you have missed, you have gained something else; and for every thing you gain, you lose something.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-088

- **Texto:** Nuestra fuerza nace de nuestra debilidad.
- **Id en el catálogo:** `C3-UNI-088` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, primera serie, Ensayo III, «Compensación» (Compensation) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, primera serie
- **Ubicación:** Ensayo III, «Compensación» (Compensation)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: First Series (1841), Project Gutenberg n.º 2944
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2944
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** Our strength grows out of our weakness.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-089

- **Texto:** Los cambios que cada tanto interrumpen la prosperidad de las personas son avisos de una naturaleza cuya ley es crecer.
- **Id en el catálogo:** `C3-UNI-089` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, primera serie, Ensayo III, «Compensación» (Compensation) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, primera serie
- **Ubicación:** Ensayo III, «Compensación» (Compensation)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: First Series (1841), Project Gutenberg n.º 2944
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2944
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** The changes which break up at short intervals the prosperity of men are advertisements of a nature whose law is growth.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Of men» genérico → «de las personas»; «at short intervals» → «cada tanto»; «break up» → «interrumpen».

### C3-UNI-090

- **Texto:** Un amigo es una persona con quien puedo ser sincero. Delante de él puedo pensar en voz alta.
- **Id en el catálogo:** `C3-UNI-090` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, primera serie, Ensayo VI, «Amistad» (Friendship) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, primera serie
- **Ubicación:** Ensayo VI, «Amistad» (Friendship)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: First Series (1841), Project Gutenberg n.º 2944
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2944
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** A friend is a person with whom I may be sincere. Before him I may think aloud.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-091

- **Texto:** Vivimos entre superficies, y el verdadero arte de la vida es patinar bien sobre ellas.
- **Id en el catálogo:** `C3-UNI-091` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, segunda serie, Ensayo II, «Experiencia» (Experience) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, segunda serie
- **Ubicación:** Ensayo II, «Experiencia» (Experience)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: Second Series (1844), Project Gutenberg n.º 2945
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2945
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** We live amid surfaces, and the true art of life is to skate well on them.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-092

- **Texto:** Cinco minutos de hoy valen para mí tanto como cinco minutos del próximo milenio.
- **Id en el catálogo:** `C3-UNI-092` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, segunda serie, Ensayo II, «Experiencia» (Experience) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, segunda serie
- **Ubicación:** Ensayo II, «Experiencia» (Experience)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: Second Series (1844), Project Gutenberg n.º 2945
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2945
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** Five minutes of today are worth as much to me as five minutes in the next millennium.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-094

- **Texto:** Todo barco es un objeto romántico, salvo aquel en el que navegamos.
- **Id en el catálogo:** `C3-UNI-094` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, segunda serie, Ensayo II, «Experiencia» (Experience) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, segunda serie
- **Ubicación:** Ensayo II, «Experiencia» (Experience)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: Second Series (1844), Project Gutenberg n.º 2945
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2945
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** Every ship is a romantic object, except that we sail in.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-095

- **Texto:** Por naturaleza somos observadores, y por eso, aprendices.
- **Id en el catálogo:** `C3-UNI-095` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, primera serie, Ensayo V, «Amor» (Love) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, primera serie
- **Ubicación:** Ensayo V, «Amor» (Love)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: First Series (1841), Project Gutenberg n.º 2944
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2944
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** We are by nature observers, and thereby learners.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-096

- **Texto:** El mundo gira; las circunstancias cambian a cada hora.
- **Id en el catálogo:** `C3-UNI-096` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, primera serie, Ensayo V, «Amor» (Love) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, primera serie
- **Ubicación:** Ensayo V, «Amor» (Love)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: First Series (1841), Project Gutenberg n.º 2944
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2944
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** The world rolls; the circumstances vary every hour.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-097

- **Texto:** El día y la noche, la casa y el jardín, unos pocos libros, unas pocas acciones nos sirven tanto como todos los oficios y espectáculos.
- **Id en el catálogo:** `C3-UNI-097` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, segunda serie, Ensayo I, «El poeta» (The Poet) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, segunda serie
- **Ubicación:** Ensayo I, «El poeta» (The Poet)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: Second Series (1844), Project Gutenberg n.º 2945
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2945
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** Day and night, house and garden, a few books, a few actions, serve us as well as would all trades and all spectacles.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-098

- **Texto:** Cada momento enseña, y cada objeto: porque la sabiduría impregna cada forma.
- **Id en el catálogo:** `C3-UNI-098` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, segunda serie, Ensayo VI, «Naturaleza» (Nature) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, segunda serie
- **Ubicación:** Ensayo VI, «Naturaleza» (Nature)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: Second Series (1844), Project Gutenberg n.º 2945
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2945
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** Every moment instructs, and every object: for wisdom is infused into every form.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-099

- **Texto:** El día, inmensamente largo, dormita sobre las amplias colinas y los campos tibios y extensos.
- **Id en el catálogo:** `C3-UNI-099` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Ralph Waldo Emerson · Ensayos, segunda serie, Ensayo VI, «Naturaleza» (Nature) · Traducción editorial para Strivo
- **Autor u obra:** Ralph Waldo Emerson · Ensayos, segunda serie
- **Ubicación:** Ensayo VI, «Naturaleza» (Nature)
- **Idioma original:** inglés
- **Edición de referencia:** Essays: Second Series (1844), Project Gutenberg n.º 2945
- **Fuente consultada:** https://www.gutenberg.org/ebooks/2945
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Emerson murió en 1882. Dominio público.
- **Texto fuente:** The day, immeasurably long, sleeps over the broad hills and warm wide fields.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-100

- **Texto:** Lo más grande del mundo es que una persona sepa que se pertenece.
- **Id en el catálogo:** `C3-UNI-100` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro I, capítulo XXXVIII, «De la soledad» (Of Solitude) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro I, capítulo XXXVIII, «De la soledad» (Of Solitude)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** The greatest thing in the world is for a man to know that he is his own.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · «A man» genérico → «una persona».

### C3-UNI-101

- **Texto:** Cuando bailo, bailo; cuando duermo, duermo.
- **Id en el catálogo:** `C3-UNI-101` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro III, capítulo XIII, «De la experiencia» (Of Experience) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro III, capítulo XIII, «De la experiencia» (Of Experience)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** When I dance, I dance; when I sleep, I sleep.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-102

- **Texto:** Quien teme que va a sufrir ya sufre lo que teme.
- **Id en el catálogo:** `C3-UNI-102` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro III, capítulo XIII, «De la experiencia» (Of Experience) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro III, capítulo XIII, «De la experiencia» (Of Experience)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** He who fears he shall suffer, already suffers what he fears.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-103

- **Texto:** Como no puedo gobernar los acontecimientos, me gobierno a mí mismo, y me adapto a ellos si ellos no se adaptan a mí.
- **Id en el catálogo:** `C3-UNI-103` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro II, capítulo XVII, «De la presunción» (Of Presumption) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro II, capítulo XVII, «De la presunción» (Of Presumption)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** Not being able to govern events, I govern myself, and apply myself to them, if they will not apply themselves to me.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-104

- **Texto:** Si alguien me insistiera en que dijera por qué lo quería, siento que no podría expresarlo sino respondiendo: porque era él, porque era yo.
- **Id en el catálogo:** `C3-UNI-104` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro I, capítulo XXVII, «De la amistad» (Of Friendship) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro I, capítulo XXVII, «De la amistad» (Of Friendship)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** If a man should importune me to give a reason why I loved him, I find it could no otherwise be expressed, than by making answer: because it was he, because it was I.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-105

- **Texto:** La gloriosa obra maestra del ser humano es vivir con acierto; todo lo demás, reinar, atesorar, construir, no son más que pequeños apéndices y apoyos.
- **Id en el catálogo:** `C3-UNI-105` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro III, capítulo XIII, «De la experiencia» (Of Experience) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro III, capítulo XIII, «De la experiencia» (Of Experience)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** The glorious masterpiece of man is to live to purpose; all other things: to reign, to lay up treasure, to build, are but little appendices and props.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · «Of man» genérico → «del ser humano»; «to live to purpose» (fr. «vivre à propos») → «vivir con acierto».

### C3-UNI-106

- **Texto:** No tengo nada que decir de mí de manera entera, simple y sólida, sin mezcla ni confusión.
- **Id en el catálogo:** `C3-UNI-106` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro II, capítulo I, «De la inconstancia de nuestras acciones» (Of the Inconstancy of Our Actions) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro II, capítulo I, «De la inconstancia de nuestras acciones» (Of the Inconstancy of Our Actions)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** I have nothing to say of myself entirely, simply, and solidly without mixture and confusion.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-107

- **Texto:** La ambición es, de todos los ánimos, el más contrario a la soledad; la gloria y el reposo no pueden habitar en un mismo lugar.
- **Id en el catálogo:** `C3-UNI-107` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro I, capítulo XXXVIII, «De la soledad» (Of Solitude) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro I, capítulo XXXVIII, «De la soledad» (Of Solitude)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** Ambition is of all others the most contrary humour to solitude; glory and repose are things that cannot possibly inhabit in one and the same place.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-108

- **Texto:** La experiencia me ha enseñado, además, esto: que nos arruinamos por la impaciencia.
- **Id en el catálogo:** `C3-UNI-108` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro III, capítulo XIII, «De la experiencia» (Of Experience) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro III, capítulo XIII, «De la experiencia» (Of Experience)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** Experience has, moreover, taught me this, that we ruin ourselves by impatience.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-109

- **Texto:** Si has sabido descansar, has hecho más que quien ha tomado imperios y ciudades.
- **Id en el catálogo:** `C3-UNI-109` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro III, capítulo XIII, «De la experiencia» (Of Experience) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro III, capítulo XIII, «De la experiencia» (Of Experience)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** Have you known how to take repose, you have done more than he who has taken empires and cities.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · «You» dirigido al lector → tuteo.

### C3-UNI-110

- **Texto:** La intemperancia es la peste del placer; y la templanza no es su azote, sino más bien su condimento.
- **Id en el catálogo:** `C3-UNI-110` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro III, capítulo XIII, «De la experiencia» (Of Experience) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro III, capítulo XIII, «De la experiencia» (Of Experience)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** Intemperance is the pest of pleasure; and temperance is not its scourge, but rather its seasoning.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-111

- **Texto:** Acepto con buen ánimo, y con gratitud, lo que la naturaleza ha hecho por mí; estoy contento con ello, y orgulloso.
- **Id en el catálogo:** `C3-UNI-111` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro III, capítulo XIII, «De la experiencia» (Of Experience) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro III, capítulo XIII, «De la experiencia» (Of Experience)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** I accept kindly, and with gratitude, what nature has done for me; am well pleased with it, and proud of it.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · La oración siguiente del original habla del «omnipotente dador»; la citada se sostiene sola y no tiene marca religiosa.

### C3-UNI-112

- **Texto:** Buscamos otras condiciones porque no entendemos el uso de las nuestras, y salimos de nosotros mismos porque no sabemos habitar ahí.
- **Id en el catálogo:** `C3-UNI-112` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro III, capítulo XIII, «De la experiencia» (Of Experience) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro III, capítulo XIII, «De la experiencia» (Of Experience)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** We seek other conditions, by reason we do not understand the use of our own; and go out of ourselves, because we know not how there to reside.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-113

- **Texto:** Entregarse a la naturaleza del modo más sencillo es hacerlo del modo más sabio.
- **Id en el catálogo:** `C3-UNI-113` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Charles Cotton revisada por W. C. Hazlitt (1877).
- **Atribución en la app:** Michel de Montaigne · Ensayos, Libro III, capítulo XIII, «De la experiencia» (Of Experience) · Traducción editorial para Strivo
- **Autor u obra:** Michel de Montaigne · Ensayos
- **Ubicación:** Libro III, capítulo XIII, «De la experiencia» (Of Experience)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Essays, trad. de Charles Cotton (1685–1686), revisada por William Carew Hazlitt (1877); Project Gutenberg n.º 3600
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3600
- **Licencia:** Dominio público
- **Derechos:** Montaigne murió en 1592; Cotton, en 1687; W. C. Hazlitt, en 1913. Todos antes de 1925: dominio público en México. Conviene confirmar que el archivo corresponde a la edición de 1877.
- **Texto fuente:** The most simply to commit one’s self to nature is to do it most wisely.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-114

- **Texto:** Encontrar a un hombre o a una mujer feliz es mejor que encontrar un billete de cinco libras.
- **Id en el catálogo:** `C3-UNI-114` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Robert Louis Stevenson · Virginibus Puerisque, Ensayo «Apología de los ociosos» (An Apology for Idlers) · Traducción editorial para Strivo
- **Autor u obra:** Robert Louis Stevenson · Virginibus Puerisque
- **Ubicación:** Ensayo «Apología de los ociosos» (An Apology for Idlers)
- **Idioma original:** inglés
- **Edición de referencia:** Virginibus Puerisque and Other Papers (1881), Project Gutenberg n.º 386
- **Fuente consultada:** https://www.gutenberg.org/ebooks/386
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Stevenson murió en 1894. Dominio público.
- **Texto fuente:** A happy man or woman is a better thing to find than a five-pound note.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se repite «encontrar» para que la comparación sea clara en español.

### C3-UNI-115

- **Texto:** Los libros están bien a su manera, pero son un sustituto muy pálido de la vida.
- **Id en el catálogo:** `C3-UNI-115` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Robert Louis Stevenson · Virginibus Puerisque, Ensayo «Apología de los ociosos» (An Apology for Idlers) · Traducción editorial para Strivo
- **Autor u obra:** Robert Louis Stevenson · Virginibus Puerisque
- **Ubicación:** Ensayo «Apología de los ociosos» (An Apology for Idlers)
- **Idioma original:** inglés
- **Edición de referencia:** Virginibus Puerisque and Other Papers (1881), Project Gutenberg n.º 386
- **Fuente consultada:** https://www.gutenberg.org/ebooks/386
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Stevenson murió en 1894. Dominio público.
- **Texto fuente:** Books are good enough in their own way, but they are a mighty bloodless substitute for life.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Bloodless» → «pálido» (sin vida).

### C3-UNI-116

- **Texto:** Con el tiempo, llegamos a amar cosas que odiábamos y a odiar cosas que amábamos.
- **Id en el catálogo:** `C3-UNI-116` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Robert Louis Stevenson · Virginibus Puerisque, Ensayo «Vejez gruñona y juventud» (Crabbed Age and Youth) · Traducción editorial para Strivo
- **Autor u obra:** Robert Louis Stevenson · Virginibus Puerisque
- **Ubicación:** Ensayo «Vejez gruñona y juventud» (Crabbed Age and Youth)
- **Idioma original:** inglés
- **Edición de referencia:** Virginibus Puerisque and Other Papers (1881), Project Gutenberg n.º 386
- **Fuente consultada:** https://www.gutenberg.org/ebooks/386
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Stevenson murió en 1894. Dominio público.
- **Texto fuente:** In the course of time, we grow to love things we hated and hate things we loved.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-117

- **Texto:** Ser verdaderamente feliz es cuestión de cómo empezamos y no de cómo terminamos, de lo que queremos y no de lo que tenemos.
- **Id en el catálogo:** `C3-UNI-117` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Robert Louis Stevenson · Virginibus Puerisque, Ensayo «El Dorado» (El Dorado) · Traducción editorial para Strivo
- **Autor u obra:** Robert Louis Stevenson · Virginibus Puerisque
- **Ubicación:** Ensayo «El Dorado» (El Dorado)
- **Idioma original:** inglés
- **Edición de referencia:** Virginibus Puerisque and Other Papers (1881), Project Gutenberg n.º 386
- **Fuente consultada:** https://www.gutenberg.org/ebooks/386
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Stevenson murió en 1894. Dominio público.
- **Texto fuente:** To be truly happy is a question of how we begin and not of how we end, of what we want and not of what we have.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-119

- **Texto:** Puedes entretenerte junto al camino todo el tiempo que quieras.
- **Id en el catálogo:** `C3-UNI-119` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Robert Louis Stevenson · Virginibus Puerisque, Ensayo «Excursiones a pie» (Walking Tours) · Traducción editorial para Strivo
- **Autor u obra:** Robert Louis Stevenson · Virginibus Puerisque
- **Ubicación:** Ensayo «Excursiones a pie» (Walking Tours)
- **Idioma original:** inglés
- **Edición de referencia:** Virginibus Puerisque and Other Papers (1881), Project Gutenberg n.º 386
- **Fuente consultada:** https://www.gutenberg.org/ebooks/386
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Stevenson murió en 1894. Dominio público.
- **Texto fuente:** You may dally as long as you like by the roadside.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Describe la pausa durante la caminata; no es un mandato.

### C3-UNI-120

- **Texto:** Cada corazón que ha latido con fuerza y alegría ha dejado en el mundo un impulso esperanzador y ha mejorado la tradición humana.
- **Id en el catálogo:** `C3-UNI-120` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Robert Louis Stevenson · Virginibus Puerisque, Ensayo «Æs Triplex» · Traducción editorial para Strivo
- **Autor u obra:** Robert Louis Stevenson · Virginibus Puerisque
- **Ubicación:** Ensayo «Æs Triplex»
- **Idioma original:** inglés
- **Edición de referencia:** Virginibus Puerisque and Other Papers (1881), Project Gutenberg n.º 386
- **Fuente consultada:** https://www.gutenberg.org/ebooks/386
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Stevenson murió en 1894. Dominio público.
- **Texto fuente:** Every heart that has beat strong and cheerfully has left a hopeful impulse behind it in the world, and bettered the tradition of mankind.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Of mankind» → «humana». El ensayo trata de la muerte, pero la oración citada no.

### C3-UNI-121

- **Texto:** Estamos rodeados de misterio, y los mayores misterios están en lo que vemos y hacemos cada día.
- **Id en el catálogo:** `C3-UNI-121` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 30 de diciembre de 1850 · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 30 de diciembre de 1850
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** We are hemmed round with mystery, and the greatest mysteries are contained in what we see and do every day.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-122

- **Texto:** La ensoñación, como la lluvia de la noche, devuelve color y fuerza a los pensamientos que el calor del día ha desteñido y cansado.
- **Id en el catálogo:** `C3-UNI-122` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 29 de abril de 1852 (Lancy) · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 29 de abril de 1852 (Lancy)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** Reverie, like the rain of night, restores color and force to thoughts which have been blanched and wearied by the heat of the day.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · El encabezado dice «April 29 (Lancy)»; el año 1852 se deduce de las entradas del 28 de abril y del 2 de mayo de 1852. La oración anterior del original menciona el «alma»; la citada no.

### C3-UNI-123

- **Texto:** Lo recibimos todo, la vida y la felicidad; pero la manera de recibir, eso es lo que sigue siendo nuestro.
- **Id en el catálogo:** `C3-UNI-123` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 14 de mayo de 1852 · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 14 de mayo de 1852
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** We receive everything, both life and happiness; but the manner in which we receive, this is what is still ours.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-124

- **Texto:** El ser humano no es sino lo que llega a ser —verdad profunda—, pero no llega a ser sino lo que es, verdad más profunda aún.
- **Id en el catálogo:** `C3-UNI-124` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 11 de mayo de 1853 · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 11 de mayo de 1853
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** Man is only what he becomes--profound truth; but he becomes only what he is, truth still more profound.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · «Man» genérico → «el ser humano»; «only» traducido con «no… sino». Las oraciones previas del original hablan de Dios; la citada no.

### C3-UNI-125

- **Texto:** Qué cosa tan dulce es un pequeño disfrute sencillo.
- **Id en el catálogo:** `C3-UNI-125` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 16 de abril de 1855 · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 16 de abril de 1855
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** How sweet a thing is a little simple enjoyment!
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · El original termina en exclamación; se cerró con punto por la regla de voz.

### C3-UNI-128

- **Texto:** Encuentro bajo este techo luz, quietud, refugio.
- **Id en el catálogo:** `C3-UNI-128` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 29 de enero de 1866 · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 29 de enero de 1866
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** I find under this roof light, quiet, shelter.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-129

- **Texto:** Mientras alguien es capaz de renovarse, es un ser vivo.
- **Id en el catálogo:** `C3-UNI-129` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 29 de julio de 1871 · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 29 de julio de 1871
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** So long as a man is capable of self-renewal he is a living being.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · «A man» genérico → «alguien». Se copia la oración sin el encabezado de fecha.

### C3-UNI-130

- **Texto:** Me gustan días así: reavivan la charla con uno mismo y dejan vivir la vida interior; son quietos y apacibles, como una canción en tono menor.
- **Id en el catálogo:** `C3-UNI-130` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 22 de agosto de 1873 (Scheveningen) · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 22 de agosto de 1873 (Scheveningen)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** I have a liking for such days as these; they revive one’s converse with one’s self and make it possible to live the inner life; they are quiet and peaceful, like a song in a minor key.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-131

- **Texto:** ¿No es hacer felices a los demás la mejor felicidad?
- **Id en el catálogo:** `C3-UNI-131` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 5 de abril de 1877 · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 5 de abril de 1877
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** Is not making others happy the best happiness?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-UNI-132

- **Texto:** En ningún momento estamos más descontentos de los demás que cuando estamos descontentos de nosotros mismos.
- **Id en el catálogo:** `C3-UNI-132` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Mary A. Ward (1885).
- **Atribución en la app:** Henri-Frédéric Amiel · Diario íntimo, Entrada del 24 de septiembre de 1857 · Traducción editorial para Strivo
- **Autor u obra:** Henri-Frédéric Amiel · Diario íntimo
- **Ubicación:** Entrada del 24 de septiembre de 1857
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** Amiel's Journal, trad. de Mary A. Ward (1885); Project Gutenberg n.º 8545
- **Fuente consultada:** https://www.gutenberg.org/ebooks/8545
- **Licencia:** Dominio público
- **Derechos:** Amiel murió en 1881; Mary Augusta Ward (Mrs Humphry Ward), en 1920. Dominio público en México.
- **Texto fuente:** We are never more discontented with others than when we are discontented with ourselves.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · «Never more… than when» → «en ningún momento… más que cuando», sin cambiar el alcance.

### C3-UNI-133

- **Texto:** En las cañadas y los rincones hay tanta quietud que se nota el canto de un grillo solitario.
- **Id en el catálogo:** `C3-UNI-133` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Burroughs · Sol de invierno, Ensayo I, «Sol de invierno» (Winter Sunshine) · Traducción editorial para Strivo
- **Autor u obra:** John Burroughs · Sol de invierno
- **Ubicación:** Ensayo I, «Sol de invierno» (Winter Sunshine)
- **Idioma original:** inglés
- **Edición de referencia:** Winter Sunshine (1875), Project Gutenberg n.º 4279
- **Fuente consultada:** https://www.gutenberg.org/ebooks/4279
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Burroughs murió en 1921. Dominio público en México.
- **Texto fuente:** In the glens and nooks it is so still that the chirp of a solitary cricket is noticeable.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-134

- **Texto:** En esta estación, cualquier señal de vida es bienvenida.
- **Id en el catálogo:** `C3-UNI-134` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Burroughs · Sol de invierno, Ensayo I, «Sol de invierno» (Winter Sunshine) · Traducción editorial para Strivo
- **Autor u obra:** John Burroughs · Sol de invierno
- **Ubicación:** Ensayo I, «Sol de invierno» (Winter Sunshine)
- **Idioma original:** inglés
- **Edición de referencia:** Winter Sunshine (1875), Project Gutenberg n.º 4279
- **Fuente consultada:** https://www.gutenberg.org/ebooks/4279
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Burroughs murió en 1921. Dominio público en México.
- **Texto fuente:** Every sign of life is welcome at this season.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Habla del invierno.

### C3-UNI-136

- **Texto:** Las nubes blancas, como vellones, yacían aquí y allá sobre el azul, como en reposo.
- **Id en el catálogo:** `C3-UNI-136` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Burroughs · Sol de invierno, Ensayo V, «Crónica de marzo» (A March Chronicle) · Traducción editorial para Strivo
- **Autor u obra:** John Burroughs · Sol de invierno
- **Ubicación:** Ensayo V, «Crónica de marzo» (A March Chronicle)
- **Idioma original:** inglés
- **Edición de referencia:** Winter Sunshine (1875), Project Gutenberg n.º 4279
- **Fuente consultada:** https://www.gutenberg.org/ebooks/4279
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Burroughs murió en 1921. Dominio público en México.
- **Texto fuente:** The white fleecy clouds lay here and there, as if at rest, on the blue sky.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «On the blue sky» → «sobre el azul»: el verificador marca «cielo» como palabra religiosa aunque aquí es el cielo físico.

### C3-UNI-137

- **Texto:** Todos los árboles y arbustos forman sus yemas florales en otoño y guardan el secreto hasta la primavera.
- **Id en el catálogo:** `C3-UNI-137` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Burroughs · Sol de invierno, Ensayo VI, «Mareas de otoño» (Autumn Tides) · Traducción editorial para Strivo
- **Autor u obra:** John Burroughs · Sol de invierno
- **Ubicación:** Ensayo VI, «Mareas de otoño» (Autumn Tides)
- **Idioma original:** inglés
- **Edición de referencia:** Winter Sunshine (1875), Project Gutenberg n.º 4279
- **Fuente consultada:** https://www.gutenberg.org/ebooks/4279
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Burroughs murió en 1921. Dominio público en México.
- **Texto fuente:** All trees and shrubs form their flower-buds in the fall, and keep the secret till spring.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-139

- **Texto:** Cada vez que aprendes a distinguir los pájaros, las plantas o los rasgos geológicos de una región, es como si se te sumaran ojos nuevos y más agudos.
- **Id en el catálogo:** `C3-UNI-139` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Burroughs · Langostas y miel silvestre, Ensayo II, «Ojos agudos» (Sharp Eyes) · Traducción editorial para Strivo
- **Autor u obra:** John Burroughs · Langostas y miel silvestre
- **Ubicación:** Ensayo II, «Ojos agudos» (Sharp Eyes)
- **Idioma original:** inglés
- **Edición de referencia:** Locusts and Wild Honey (1879), Project Gutenberg n.º 6355
- **Fuente consultada:** https://www.gutenberg.org/ebooks/6355
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Burroughs murió en 1921. Dominio público en México.
- **Texto fuente:** Whenever you have learned to discriminate the birds, or the plants, or the geological features of a country, it is as if new and keener eyes were added.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «You» genérico → tuteo.

### C3-UNI-140

- **Texto:** No vemos el espectáculo porque no miramos con suficiente atención.
- **Id en el catálogo:** `C3-UNI-140` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Burroughs · Langostas y miel silvestre, Ensayo II, «Ojos agudos» (Sharp Eyes) · Traducción editorial para Strivo
- **Autor u obra:** John Burroughs · Langostas y miel silvestre
- **Ubicación:** Ensayo II, «Ojos agudos» (Sharp Eyes)
- **Idioma original:** inglés
- **Edición de referencia:** Locusts and Wild Honey (1879), Project Gutenberg n.º 6355
- **Fuente consultada:** https://www.gutenberg.org/ebooks/6355
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Burroughs murió en 1921. Dominio público en México.
- **Texto fuente:** We do not see the play because we do not look intently enough.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «The play»: lo que ocurre en la naturaleza.

### C3-UNI-141

- **Texto:** Prueba de lo directamente unidos que estamos a la naturaleza es que, más o menos, sintonizamos con el clima y tomamos el color del día.
- **Id en el catálogo:** `C3-UNI-141` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Burroughs · Pájaros y poetas, Ensayo II, «Toques de naturaleza» (Touches of Nature) · Traducción editorial para Strivo
- **Autor u obra:** John Burroughs · Pájaros y poetas
- **Ubicación:** Ensayo II, «Toques de naturaleza» (Touches of Nature)
- **Idioma original:** inglés
- **Edición de referencia:** Birds and Poets (1877), Project Gutenberg n.º 5177
- **Fuente consultada:** https://www.gutenberg.org/ebooks/5177
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Burroughs murió en 1921. Dominio público en México.
- **Texto fuente:** 'T is an evidence of how directly we are related to Nature, that we more or less sympathize with the weather, and take on the color of the day.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Sympathize with the weather» → «sintonizamos con el clima».

### C3-UNI-142

- **Texto:** Abril es el mes en que nací, y con cada regreso suyo vuelvo a nacer a nuevas alegrías y nuevas sorpresas.
- **Id en el catálogo:** `C3-UNI-142` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Burroughs · Pájaros y poetas, Ensayo IV, «Abril» (April) · Traducción editorial para Strivo
- **Autor u obra:** John Burroughs · Pájaros y poetas
- **Ubicación:** Ensayo IV, «Abril» (April)
- **Idioma original:** inglés
- **Edición de referencia:** Birds and Poets (1877), Project Gutenberg n.º 5177
- **Fuente consultada:** https://www.gutenberg.org/ebooks/5177
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Burroughs murió en 1921. Dominio público en México.
- **Texto fuente:** April is my natal month, and I am born again into new delight and new surprises at each return of it.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-144

- **Texto:** ¿Qué hago en el bosque si estoy pensando en algo que está fuera del bosque?
- **Id en el catálogo:** `C3-UNI-144` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Caminar, Ensayo «Caminar» (Walking), primera parte · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Caminar
- **Ubicación:** Ensayo «Caminar» (Walking), primera parte
- **Idioma original:** inglés
- **Edición de referencia:** Walking (1862), Project Gutenberg n.º 1022
- **Fuente consultada:** https://www.gutenberg.org/ebooks/1022
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público.
- **Texto fuente:** What business have I in the woods, if I am thinking of something out of the woods?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-145

- **Texto:** Un paisaje del todo nuevo es una gran felicidad, y todavía puedo encontrarlo cualquier tarde.
- **Id en el catálogo:** `C3-UNI-145` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Caminar, Ensayo «Caminar» (Walking), primera parte · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Caminar
- **Ubicación:** Ensayo «Caminar» (Walking), primera parte
- **Idioma original:** inglés
- **Edición de referencia:** Walking (1862), Project Gutenberg n.º 1022
- **Fuente consultada:** https://www.gutenberg.org/ebooks/1022
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público.
- **Texto fuente:** An absolutely new prospect is a great happiness, and I can still get this any afternoon.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Prospect»: vista, paisaje.

### C3-UNI-146

- **Texto:** Mi deseo de saber es intermitente, pero mi deseo de bañar la cabeza en atmósferas que mis pies no conocen es perenne y constante.
- **Id en el catálogo:** `C3-UNI-146` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** Henry David Thoreau · Caminar, Ensayo «Caminar» (Walking), parte final · Traducción editorial para Strivo
- **Autor u obra:** Henry David Thoreau · Caminar
- **Ubicación:** Ensayo «Caminar» (Walking), parte final
- **Idioma original:** inglés
- **Edición de referencia:** Walking (1862), Project Gutenberg n.º 1022
- **Fuente consultada:** https://www.gutenberg.org/ebooks/1022
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Thoreau murió en 1862. Dominio público.
- **Texto fuente:** My desire for knowledge is intermittent, but my desire to bathe my head in atmospheres unknown to my feet is perennial and constant.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-147

- **Texto:** Es una gran verdad que, cuando nos retiramos en nosotros mismos, podemos evocar los recuerdos que queramos.
- **Id en el catálogo:** `C3-UNI-147` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Lubbock · Los placeres de la vida, Parte I, capítulo VIII, «Los placeres del hogar» (The Pleasures of Home) · Traducción editorial para Strivo
- **Autor u obra:** John Lubbock · Los placeres de la vida
- **Ubicación:** Parte I, capítulo VIII, «Los placeres del hogar» (The Pleasures of Home)
- **Idioma original:** inglés
- **Edición de referencia:** The Pleasures of Life (1887), Project Gutenberg n.º 7952
- **Fuente consultada:** https://www.gutenberg.org/ebooks/7952
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Lubbock murió en 1913. Dominio público en México.
- **Texto fuente:** It is a great truth that when we retire into ourselves we can call up what memories we please.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-148

- **Texto:** La pena y la alegría, en verdad, están extrañamente entretejidas.
- **Id en el catálogo:** `C3-UNI-148` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** John Lubbock · Los placeres de la vida, Parte I, capítulo I, «El deber de la felicidad» (The Duty of Happiness) · Traducción editorial para Strivo
- **Autor u obra:** John Lubbock · Los placeres de la vida
- **Ubicación:** Parte I, capítulo I, «El deber de la felicidad» (The Duty of Happiness)
- **Idioma original:** inglés
- **Edición de referencia:** The Pleasures of Life (1887), Project Gutenberg n.º 7952
- **Fuente consultada:** https://www.gutenberg.org/ebooks/7952
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Lubbock murió en 1913. Dominio público en México.
- **Texto fuente:** Sorrow and joy, indeed, are strangely interwoven.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-149

- **Texto:** Puedo disfrutar de la compañía en una habitación; pero al aire libre, la naturaleza me basta como compañía.
- **Id en el catálogo:** `C3-UNI-149` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** William Hazlitt · Table-Talk, Segunda serie, ensayo III, «De ir de viaje» (On Going a Journey) · Traducción editorial para Strivo
- **Autor u obra:** William Hazlitt · Table-Talk
- **Ubicación:** Segunda serie, ensayo III, «De ir de viaje» (On Going a Journey)
- **Idioma original:** inglés
- **Edición de referencia:** Table-Talk (1821–1822), Project Gutenberg n.º 3020
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3020
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Hazlitt murió en 1830. Dominio público.
- **Texto fuente:** I can enjoy society in a room; but out of doors, nature is company enough for me.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-UNI-150

- **Texto:** Mientras una persona está contenta consigo misma y con sus propios recursos, todo va bien.
- **Id en el catálogo:** `C3-UNI-150` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** William Hazlitt · Table-Talk, Primera serie, ensayo X, «De vivir para uno mismo» (On Living to One’s-Self) · Traducción editorial para Strivo
- **Autor u obra:** William Hazlitt · Table-Talk
- **Ubicación:** Primera serie, ensayo X, «De vivir para uno mismo» (On Living to One’s-Self)
- **Idioma original:** inglés
- **Edición de referencia:** Table-Talk (1821–1822), Project Gutenberg n.º 3020
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3020
- **Licencia:** Dominio público
- **Derechos:** Original inglés; Hazlitt murió en 1830. Dominio público.
- **Texto fuente:** While a man is contented with himself and his own resources, all is well.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «A man» genérico → «una persona».

### C3-CRI-001

- **Texto:** Mi voz vendrá a ti por la mañana, oh Señor; por la mañana te enviaré mi oración y esperaré.
- **Id en el catálogo:** `C3-CRI-001` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 5:3 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 5:3
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-002

- **Texto:** Él me hace un lugar de descanso en los campos verdes: él es mi guía junto a las aguas tranquilas.
- **Id en el catálogo:** `C3-CRI-002` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 23:2 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 23:2
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-003

- **Texto:** Verdaderamente, la bendición y la misericordia estarán conmigo todos los días de mi vida; y moraré en la casa del Señor todos mis días.
- **Id en el catálogo:** `C3-CRI-003` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 23:6 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 23:6
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-004

- **Texto:** Cuando esperaba en silencio al Señor, su corazón se volvió hacia mí y escuchó mi clamor.
- **Id en el catálogo:** `C3-CRI-004` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 40:1 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 40:1
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-005

- **Texto:** Dios es nuestro refugio y nuestra fuerza, una ayuda muy presente en problemas.
- **Id en el catálogo:** `C3-CRI-005` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 46:1 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 46:1
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-006

- **Texto:** El día es tuyo y la noche es tuya: hiciste la luz y el sol.
- **Id en el catálogo:** `C3-CRI-006` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 74:16 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 74:16
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-007

- **Texto:** Señor, tú has sido nuestro lugar de descanso en todas las generaciones.
- **Id en el catálogo:** `C3-CRI-007` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 90:1 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 90:1
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-008

- **Texto:** Como un padre tiene misericordia de sus hijos, así el Señor tiene misericordia de sus adoradores.
- **Id en el catálogo:** `C3-CRI-008` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 103:13 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 103:13
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-009

- **Texto:** Él convierte la tormenta en una calma, para que las olas estén en paz.
- **Id en el catálogo:** `C3-CRI-009` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 107:29 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 107:29
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-010

- **Texto:** Mis ojos se elevan a las colinas: ¿de dónde vendrá mi ayuda?
- **Id en el catálogo:** `C3-CRI-010` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 121:1 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 121:1
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-011

- **Texto:** Nuestra alma se ha liberado como un pájaro de la red de los cazadores; la red está rota, y somos libres.
- **Id en el catálogo:** `C3-CRI-011` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 124:7 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 124:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-012

- **Texto:** Los que sembraron con lágrimas, con regocijo segarán.
- **Id en el catálogo:** `C3-CRI-012` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 126:5 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 126:5
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-013

- **Texto:** Estoy esperando al Señor, mi alma lo está esperando, y mi esperanza está en su palabra.
- **Id en el catálogo:** `C3-CRI-013` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 130:5 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 130:5
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-014

- **Texto:** Oh Señor, tú me has examinado y me conoces.
- **Id en el catálogo:** `C3-CRI-014` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 139:1 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 139:1
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-015

- **Texto:** Incluso la oscuridad no es oscura para ti; la noche es tan brillante como el día: porque la oscuridad y la luz son lo mismo para ti.
- **Id en el catálogo:** `C3-CRI-015` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 139:12 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 139:12
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-016

- **Texto:** El Señor está lleno de gracia y compasión; lento para enojarse, pero grande en misericordia.
- **Id en el catálogo:** `C3-CRI-016` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 145:8 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 145:8
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-017

- **Texto:** Los ojos de todos esperan en ti, y tú les das su comida en su tiempo.
- **Id en el catálogo:** `C3-CRI-017` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 145:15 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 145:15
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-018

- **Texto:** Por su mano el cielo está cubierto de nubes y la lluvia se almacena para la tierra; él hace que la hierba sea alta en las montañas.
- **Id en el catálogo:** `C3-CRI-018` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 147:8 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 147:8
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-019

- **Texto:** Hizo la luna para los tiempos: el sol conoce su ocaso.
- **Id en el catálogo:** `C3-CRI-019` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 104:19 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 104:19
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-020

- **Texto:** Estaba buscando al Señor, y él escuchó mi voz y me liberó de todos mis temores.
- **Id en el catálogo:** `C3-CRI-020` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 34:4 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 34:4
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-021

- **Texto:** Él me sacó a un lugar amplio; él fue mi salvador porque se deleitó en mí.
- **Id en el catálogo:** `C3-CRI-021` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 18:19 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 18:19
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-022

- **Texto:** Muéstrame tus caminos, oh Señor; enséñame tus senderos.
- **Id en el catálogo:** `C3-CRI-022` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Salmos 25:4 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Salmos
- **Ubicación:** Salmos 25:4
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-023

- **Texto:** Sus caminos son caminos de deleite, y todos sus caminos son paz.
- **Id en el catálogo:** `C3-CRI-023` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 3:17 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 3:17
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores. · El sujeto («sus caminos») es la sabiduría; se entiende sin contexto, pero conviene saberlo.

### C3-CRI-024

- **Texto:** Cuando descanses no tendrás miedo, y en tu cama el sueño será dulce para ti.
- **Id en el catálogo:** `C3-CRI-024` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 3:24 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 3:24
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-025

- **Texto:** Pero el camino de los justos es como la luz de la mañana, cada vez más brillante hasta el día completo.
- **Id en el catálogo:** `C3-CRI-025` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 4:18 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 4:18
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-026

- **Texto:** La postergación de la esperanza es un cansancio para el corazón; pero cuando llega lo deseado, es un árbol de la vida.
- **Id en el catálogo:** `C3-CRI-026` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 13:12 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 13:12
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-027

- **Texto:** Mejor es la comida de legumbres donde hay amor, que de buey engordado donde hay odio.
- **Id en el catálogo:** `C3-CRI-027` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 15:17 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 15:17
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-028

- **Texto:** Las palabras agradables son como la miel, dulces para el alma y una nueva vida para los huesos.
- **Id en el catálogo:** `C3-CRI-028` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 16:24 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 16:24
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-029

- **Texto:** Una palabra en el momento correcto es como manzanas de oro en una red de plata.
- **Id en el catálogo:** `C3-CRI-029` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 25:11 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 25:11
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-030

- **Texto:** Como el agua fría al alma sedienta, así son las buenas nuevas de lejanas tierras.
- **Id en el catálogo:** `C3-CRI-030` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 25:25 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 25:25
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-031

- **Texto:** El aceite y el perfume alegran el corazón, y la sabia sugerencia de un amigo es dulce para el alma.
- **Id en el catálogo:** `C3-CRI-031` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 27:9 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 27:9
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-032

- **Texto:** Porque sin duda hay un futuro, y tu esperanza no será cortada.
- **Id en el catálogo:** `C3-CRI-032` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 23:18 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 23:18
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-033

- **Texto:** El oído que oye y el ojo que ve son igualmente obra del Señor.
- **Id en el catálogo:** `C3-CRI-033` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 20:12 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 20:12
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-034

- **Texto:** Para todo hay un tiempo fijo, y un tiempo para cada propósito bajo el cielo.
- **Id en el catálogo:** `C3-CRI-034` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Eclesiastés 3:1 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Eclesiastés
- **Ubicación:** Eclesiastés 3:1
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-035

- **Texto:** Una mano llena de descanso es mejor que dos manos llenas de problemas y aflicción de espíritu.
- **Id en el catálogo:** `C3-CRI-035` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Eclesiastés 4:6 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Eclesiastés
- **Ubicación:** Eclesiastés 4:6
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-036

- **Texto:** El fin de una cosa es mejor que su comienzo, y un espíritu amable es mejor que el orgullo.
- **Id en el catálogo:** `C3-CRI-036` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Eclesiastés 7:8 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Eclesiastés
- **Ubicación:** Eclesiastés 7:8
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-037

- **Texto:** En verdad, la luz es agradable y es bueno que los ojos vean el sol.
- **Id en el catálogo:** `C3-CRI-037` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Eclesiastés 11:7 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Eclesiastés
- **Ubicación:** Eclesiastés 11:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-038

- **Texto:** Todos los ríos bajan al mar, pero el mar no está lleno; al lugar donde van los ríos, allí vuelven.
- **Id en el catálogo:** `C3-CRI-038` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Eclesiastés 1:7 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Eclesiastés
- **Ubicación:** Eclesiastés 1:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-039

- **Texto:** El sol sale y el sol se pone, y regresa rápidamente al lugar donde salió.
- **Id en el catálogo:** `C3-CRI-039` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Eclesiastés 1:5 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Eclesiastés
- **Ubicación:** Eclesiastés 1:5
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-040

- **Texto:** Bajé al jardín de los nogales para ver las plantas verdes del valle y para ver si la vid estaba en capullos, y los granados estaban en flor.
- **Id en el catálogo:** `C3-CRI-040` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Cantares 6:11 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Cantares
- **Ubicación:** Cantares 6:11
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-041

- **Texto:** Me dije: El Señor es mi herencia; y por eso tendré esperanza en él.
- **Id en el catálogo:** `C3-CRI-041` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Lamentaciones 3:24 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Lamentaciones
- **Ubicación:** Lamentaciones 3:24
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-042

- **Texto:** El Señor es bueno para los que lo esperan, para el alma que lo está buscando.
- **Id en el catálogo:** `C3-CRI-042` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Lamentaciones 3:25 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Lamentaciones
- **Ubicación:** Lamentaciones 3:25
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-043

- **Texto:** Llegaste el día en que te hice mi oración: dijiste: No temas.
- **Id en el catálogo:** `C3-CRI-043` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Lamentaciones 3:57 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Lamentaciones
- **Ubicación:** Lamentaciones 3:57
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-044

- **Texto:** La gente que fue en la oscuridad ha visto una gran luz, y para aquellos que vivían en la tierra de la noche más profunda, la luz está brillando.
- **Id en el catálogo:** `C3-CRI-044` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Isaías 9:2 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Isaías
- **Ubicación:** Isaías 9:2
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-045

- **Texto:** Con gozo sacarás agua de los manantiales de la salvación.
- **Id en el catálogo:** `C3-CRI-045` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Isaías 12:3 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Isaías
- **Ubicación:** Isaías 12:3
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-046

- **Texto:** Toda la tierra está en reposo y está en silencio y estalla en cantos de alegría.
- **Id en el catálogo:** `C3-CRI-046` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Isaías 14:7 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Isaías
- **Ubicación:** Isaías 14:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-047

- **Texto:** Y mi pueblo vivirá en paz, en casas donde no hay miedo, y en lugares tranquilos de descanso.
- **Id en el catálogo:** `C3-CRI-047` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Isaías 32:18 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Isaías
- **Ubicación:** Isaías 32:18
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-048

- **Texto:** Se alegrarán las tierras baldías y el desierto; la tierra baja tendrá alegría y florecerá como las rosas.
- **Id en el catálogo:** `C3-CRI-048` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Isaías 35:1 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Isaías
- **Ubicación:** Isaías 35:1
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-049

- **Texto:** Porque yo, el Señor tu Dios, tomo tu diestra con la mía, y te digo: No temas. Yo seré tu ayudante.
- **Id en el catálogo:** `C3-CRI-049` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Isaías 41:13 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Isaías
- **Ubicación:** Isaías 41:13
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-050

- **Texto:** Pero los que esperan al Señor tendrán nuevas fuerzas; obtendrán alas como las águilas; correrán, y no se cansarán, caminarán, y no se fatigarán.
- **Id en el catálogo:** `C3-CRI-050` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Isaías 40:31 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Isaías
- **Ubicación:** Isaías 40:31
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-051

- **Texto:** Aun así, me alegraré en el Señor, mi gozo estará en el Dios de mi salvación.
- **Id en el catálogo:** `C3-CRI-051` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Habacuc 3:18 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Habacuc
- **Ubicación:** Habacuc 3:18
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-053

- **Texto:** Pondré mi arco iris en la nube, y será por señal de acuerdo entre mí y la tierra.
- **Id en el catálogo:** `C3-CRI-053` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Génesis 9:13 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Génesis
- **Ubicación:** Génesis 9:13
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-055

- **Texto:** El espíritu de Dios me ha hecho, y el soplo del Todopoderoso me da vida.
- **Id en el catálogo:** `C3-CRI-055` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Job 33:4 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Job
- **Ubicación:** Job 33:4
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-056

- **Texto:** Porque hay esperanza de un árbol; si se corta, volverá a retoñar, y sus ramas no llegarán a su fin.
- **Id en el catálogo:** `C3-CRI-056` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Job 14:7 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Job
- **Ubicación:** Job 14:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-057

- **Texto:** Llegará el momento en que tu boca se llenará de risas y de tus labios saldrán gritos de alegría.
- **Id en el catálogo:** `C3-CRI-057` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Job 8:21 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Job
- **Ubicación:** Job 8:21
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-058

- **Texto:** Porque tú eres mi luz, oh Señor; y el Señor alumbra mi oscuridad.
- **Id en el catálogo:** `C3-CRI-058` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 2 Samuel 22:29 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 2 Samuel
- **Ubicación:** 2 Samuel 22:29
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-059

- **Texto:** Bienaventurados los que están tristes; porque ellos serán consolados.
- **Id en el catálogo:** `C3-CRI-059` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 5:4 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 5:4
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-060

- **Texto:** Bienaventurados los amables: porque la tierra será su herencia.
- **Id en el catálogo:** `C3-CRI-060` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 5:5 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 5:5
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-061

- **Texto:** Bienaventurados los que tienen misericordia; porque ellos recibirán misericordia.
- **Id en el catálogo:** `C3-CRI-061` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 5:7 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 5:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-062

- **Texto:** Bienaventurados los limpios de corazón, porque ellos verán a Dios.
- **Id en el catálogo:** `C3-CRI-062` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 5:8 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 5:8
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-063

- **Texto:** Bienaventurados son los pacificadores, porque serán llamados hijos de Dios.
- **Id en el catálogo:** `C3-CRI-063` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 5:9 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 5:9
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-064

- **Texto:** Ustedes son la luz del mundo. Una ciudad puesta sobre una colina no se puede esconder.
- **Id en el catálogo:** `C3-CRI-064` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 5:14 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 5:14
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-065

- **Texto:** Porque donde están tus riquezas, allí estará también tu corazón.
- **Id en el catálogo:** `C3-CRI-065` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 6:21 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 6:21
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-066

- **Texto:** La luz del cuerpo es el ojo; si entonces tu ojo es bueno, todo tu cuerpo estará lleno de luz.
- **Id en el catálogo:** `C3-CRI-066` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 6:22 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 6:22
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-068

- **Texto:** Porque mi yugo es fácil, y ligera mi carga.
- **Id en el catálogo:** `C3-CRI-068` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 11:30 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 11:30
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-069

- **Texto:** Porque donde dos o tres se juntan en mi nombre, allí estoy yo en medio de ellos.
- **Id en el catálogo:** `C3-CRI-069` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 18:20 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 18:20
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-070

- **Texto:** Y por la mañana, mucho tiempo antes del amanecer, se levantó y salió a un lugar tranquilo, y allí se entregó a la oración.
- **Id en el catálogo:** `C3-CRI-070` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Marcos 1:35 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Marcos
- **Ubicación:** Marcos 1:35
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-071

- **Texto:** Mi espíritu se alegra en Dios mi Salvador.
- **Id en el catálogo:** `C3-CRI-071` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Lucas 1:47 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Lucas
- **Ubicación:** Lucas 1:47
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-072

- **Texto:** Pero María guardaba todas estas cosas en su corazón, y pensaba mucho en ellas.
- **Id en el catálogo:** `C3-CRI-072` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Lucas 2:19 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Lucas
- **Ubicación:** Lucas 2:19
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-073

- **Texto:** Y Jesús crecía en sabiduría y en estatura, y en gracia delante de Dios y de los hombres.
- **Id en el catálogo:** `C3-CRI-073` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Lucas 2:52 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Lucas
- **Ubicación:** Lucas 2:52
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-074

- **Texto:** El pan nuestro de cada día dánoslo hoy.
- **Id en el catálogo:** `C3-CRI-074` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Lucas 11:3 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Lucas
- **Ubicación:** Lucas 11:3
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-075

- **Texto:** ¿Y quién de ustedes, al afanarse, puede hacerse más alto?
- **Id en el catálogo:** `C3-CRI-075` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Lucas 12:25 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Lucas
- **Ubicación:** Lucas 12:25
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-076

- **Texto:** Y la luz sigue brillando en la oscuridad y no es vencida por la oscuridad.
- **Id en el catálogo:** `C3-CRI-076` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan 1:5 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Juan
- **Ubicación:** Juan 1:5
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-077

- **Texto:** Yo soy el pan de la vida.
- **Id en el catálogo:** `C3-CRI-077` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan 6:48 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Juan
- **Ubicación:** Juan 6:48
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-078

- **Texto:** Por esto, será claro que ustedes son mis discípulos, si tienen amor el uno por el otro.
- **Id en el catálogo:** `C3-CRI-078` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan 13:35 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Juan
- **Ubicación:** Juan 13:35
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-079

- **Texto:** No los dejaré huérfanos: voy a regresar con ustedes.
- **Id en el catálogo:** `C3-CRI-079` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan 14:18 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Juan
- **Ubicación:** Juan 14:18
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-080

- **Texto:** Les he dicho estas cosas para que se alegren conmigo y compartan mi gozo en ustedes y para que su alegría sea completa.
- **Id en el catálogo:** `C3-CRI-080` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan 15:11 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Juan
- **Ubicación:** Juan 15:11
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-081

- **Texto:** Así ahora tienen aflicción; pero volveré a verlos, y su corazón se alegrará, y nadie les quitará su alegría.
- **Id en el catálogo:** `C3-CRI-081` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan 16:22 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Juan
- **Ubicación:** Juan 16:22
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-082

- **Texto:** Yo soy el buen pastor; y conozco mis ovejas, y las mías me conocen.
- **Id en el catálogo:** `C3-CRI-082` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan 10:14 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Juan
- **Ubicación:** Juan 10:14
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-083

- **Texto:** De su plenitud todos hemos recibido gracia sobre gracia.
- **Id en el catálogo:** `C3-CRI-083` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Juan 1:16 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Juan
- **Ubicación:** Juan 1:16
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-084

- **Texto:** Y la esperanza no se avergüenza; porque nuestros corazones están llenos del amor de Dios a través del Espíritu Santo que nos es dado.
- **Id en el catálogo:** `C3-CRI-084` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Romanos 5:5 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Romanos
- **Ubicación:** Romanos 5:5
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-085

- **Texto:** Pero si tenemos esperanza de lo que no vemos, entonces podremos seguir con paciencia esperándolo.
- **Id en el catálogo:** `C3-CRI-085` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Romanos 8:25 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Romanos
- **Ubicación:** Romanos 8:25
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-086

- **Texto:** Porque el reino de Dios no es comida ni bebida, sino justicia, paz y gozo en el Espíritu Santo.
- **Id en el catálogo:** `C3-CRI-086` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Romanos 14:17 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Romanos
- **Ubicación:** Romanos 14:17
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-087

- **Texto:** Ahora bien, el Dios de la esperanza te llene de gozo y paz por medio de la fe, para que toda esperanza sea tuya en el poder del Espíritu Santo.
- **Id en el catálogo:** `C3-CRI-087` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Romanos 15:13 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Romanos
- **Ubicación:** Romanos 15:13
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-088

- **Texto:** Y si hay dolor en una parte del cuerpo, todas las partes lo sentirán; o si se honra una parte, todas las partes se alegrarán.
- **Id en el catálogo:** `C3-CRI-088` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 1 Corintios 12:26 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 1 Corintios
- **Ubicación:** 1 Corintios 12:26
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-089

- **Texto:** Pero ahora todavía tenemos fe, esperanza, amor, estos tres; y el mayor de estos es el amor.
- **Id en el catálogo:** `C3-CRI-089` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 1 Corintios 13:13 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 1 Corintios
- **Ubicación:** 1 Corintios 13:13
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-090

- **Texto:** Ahora hay diversidad de dones, pero el mismo Espíritu.
- **Id en el catálogo:** `C3-CRI-090` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 1 Corintios 12:4 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 1 Corintios
- **Ubicación:** 1 Corintios 12:4
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-091

- **Texto:** Ahora el Señor es el Espíritu; y donde está el Espíritu del Señor, allí está el corazón libre.
- **Id en el catálogo:** `C3-CRI-091` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 2 Corintios 3:17 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 2 Corintios
- **Ubicación:** 2 Corintios 3:17
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-092

- **Texto:** Así que, si alguno está en Cristo, nueva criatura es; las cosas viejas han llegado a su fin; realmente todo se ha hecho nuevo.
- **Id en el catálogo:** `C3-CRI-092` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 2 Corintios 5:17 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 2 Corintios
- **Ubicación:** 2 Corintios 5:17
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-093

- **Texto:** Y la paz de Dios, que es más profunda que todo conocimiento, guardará sus corazones y sus mentes en Cristo Jesús.
- **Id en el catálogo:** `C3-CRI-093` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Filipenses 4:7 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Filipenses
- **Ubicación:** Filipenses 4:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-094

- **Texto:** Porque todos ustedes son hijos de la luz y del día; no somos de la noche ni de la oscuridad.
- **Id en el catálogo:** `C3-CRI-094` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 1 Tesalonicenses 5:5 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 1 Tesalonicenses
- **Ubicación:** 1 Tesalonicenses 5:5
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-095

- **Texto:** Ahora el Señor de la paz mismo te dará paz en todo tiempo y en todo sentido. Que el Señor esté con todos ustedes.
- **Id en el catálogo:** `C3-CRI-095` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 2 Tesalonicenses 3:16 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 2 Tesalonicenses
- **Ubicación:** 2 Tesalonicenses 3:16
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-096

- **Texto:** Porque no nos ha dado Dios el espíritu de temor, sino el de fortaleza, y de amor, y de templanza.
- **Id en el catálogo:** `C3-CRI-096` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 2 Timoteo 1:7 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · 2 Timoteo
- **Ubicación:** 2 Timoteo 1:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-098

- **Texto:** Ahora bien, la fe es la sustancia de lo que se espera, y la evidencia de que las cosas que no se ven son verdad.
- **Id en el catálogo:** `C3-CRI-098` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Hebreos 11:1 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Hebreos
- **Ubicación:** Hebreos 11:1
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-099

- **Texto:** Jesucristo es el mismo ayer, y hoy, y por los siglos.
- **Id en el catálogo:** `C3-CRI-099` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Hebreos 13:8 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Hebreos
- **Ubicación:** Hebreos 13:8
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-100

- **Texto:** Y el fruto de la justicia es plantado en paz para los que hacen las paces.
- **Id en el catálogo:** `C3-CRI-100` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Santiago 3:18 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Santiago
- **Ubicación:** Santiago 3:18
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-101

- **Texto:** El que tiene amor por su hermano está en la luz, y no hay causa de tropiezo en él.
- **Id en el catálogo:** `C3-CRI-101` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 1 Juan 2:10 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 1 Juan
- **Ubicación:** 1 Juan 2:10
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-102

- **Texto:** Ningún hombre ha visto a Dios: si nos amamos unos a otros, Dios está en nosotros y su amor se ha perfeccionado en nosotros.
- **Id en el catálogo:** `C3-CRI-102` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 1 Juan 4:12 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 1 Juan
- **Ubicación:** 1 Juan 4:12
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-103

- **Texto:** Pero si tenemos comida y un techo sobre nosotros, que sea suficiente.
- **Id en el catálogo:** `C3-CRI-103` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 1 Timoteo 6:8 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 1 Timoteo
- **Ubicación:** 1 Timoteo 6:8
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-104

- **Texto:** Pero gran ganancia es la santidad, con contentamiento.
- **Id en el catálogo:** `C3-CRI-104` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** 1 Timoteo 6:6 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · 1 Timoteo
- **Ubicación:** 1 Timoteo 6:6
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-105

- **Texto:** El corazón del entendido adquiere sabiduría; y el oído de los sabios busca la ciencia.
- **Id en el catálogo:** `C3-CRI-105` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Proverbios 18:15 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Proverbios
- **Ubicación:** Proverbios 18:15
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-106

- **Texto:** El cielo y la tierra pasarán, mas mis palabras no pasarán.
- **Id en el catálogo:** `C3-CRI-106` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 24:35 · Biblia Reina-Valera 1909
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 24:35
- **Idioma original:** hebreo / griego
- **Edición de referencia:** Santa Biblia Reina-Valera 1909
- **Fuente consultada:** https://ebible.org/details.php?id=spaRV1909
- **Licencia:** Dominio público
- **Derechos:** Dominio público en México y España: Reina (†1594), Valera (†1602) y la revisión colectiva de 1909, publicada hace más de 100 años.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14

### C3-CRI-107

- **Texto:** El Señor es bueno, una fortaleza fuerte en el día de la angustia; y conoce a aquellos que confían en él.
- **Id en el catálogo:** `C3-CRI-107` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Nahúm 1:7 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Nahúm
- **Ubicación:** Nahúm 1:7
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-108

- **Texto:** No temas, tierra; alégrate con gran alegría; porque el Señor ha hecho grandes cosas.
- **Id en el catálogo:** `C3-CRI-108` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Joel 2:21 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Joel
- **Ubicación:** Joel 2:21
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-109

- **Texto:** Bienaventurados los pobres en espíritu; porque el reino de los cielos es de ellos.
- **Id en el catálogo:** `C3-CRI-109` · **Estado:** `aprobada`
- **Tipo:** Cita textual
- **Atribución en la app:** Mateo 5:3 · La Biblia en Español Sencillo (AudioBiblia.org / Irma Flores, CC BY 4.0)
- **Autor u obra:** Biblia · Mateo
- **Ubicación:** Mateo 5:3
- **Idioma original:** hebreo / griego
- **Edición de referencia:** La Biblia en Español Sencillo, © 2018 AudioBiblia.org / Irma Flores (traducción y edición de Irma Flores)
- **Fuente consultada:** https://ebible.org/details.php?id=spabes
- **Licencia:** CC BY 4.0
- **Derechos:** Licencia Creative Commons Reconocimiento 4.0 Internacional (© 2018 AudioBiblia.org / Irma Flores), según el aviso que conserva el repositorio open-bibles (copiado en julio de 2022). Permite uso comercial con atribución a AudioBiblia.org / Irma Flores. Nota: la ficha actual de ebible.org la rotula «Public Domain»; la firma jurídica decide, y la atribución se mantiene en cualquier caso. Abre la regla del proyecto (antes solo dominio público) por decisión editorial del 13 de octubre de 2026.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Licencia CC BY 4.0: la app tiene que mostrar la atribución a AudioBiblia.org / Irma Flores.

### C3-CRI-110

- **Texto:** Tú nos despiertas al deleite de alabarte, porque nos hiciste para ti, y nuestro corazón está inquieto hasta que descanse en ti.
- **Id en el catálogo:** `C3-CRI-110` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro I · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro I
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** Thou awakest us to delight in Thy praise; for Thou madest us for Thyself, and our heart is restless, until it repose in Thee.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro I, párrafo 1 contado desde el encabezado del libro en el archivo Gutenberg (línea 35). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-CRI-111

- **Texto:** Pero todo son dones de mi Dios: no me los di yo; y son buenos, y todos juntos son yo mismo.
- **Id en el catálogo:** `C3-CRI-111` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro I · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro I
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** But all are gifts of my God: it was not I who gave them me; and good these are, and these together are myself.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro I, párrafo 38 contado desde el encabezado del libro en el archivo Gutenberg (línea 611). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-CRI-112

- **Texto:** Y ahora, Señor, todo eso ya pasó, y el tiempo ha aliviado mi herida.
- **Id en el catálogo:** `C3-CRI-112` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro IV · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro IV
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** And now, Lord, these things are passed by, and time hath assuaged my wound.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro IV, párrafo 10 contado desde el encabezado del libro en el archivo Gutenberg (línea 1577). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín). · Contexto: el duelo por la muerte de un amigo; la frase en sí es serena.

### C3-CRI-113

- **Texto:** El ser humano es en sí mismo un gran abismo; tú, Señor, cuentas hasta sus cabellos, y no caen al suelo sin ti.
- **Id en el catálogo:** `C3-CRI-113` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro IV · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro IV
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** Man himself is a great deep, whose very hairs Thou numberest, O Lord, and they fall not to the ground without Thee.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro IV, párrafo 23 contado desde el encabezado del libro en el archivo Gutenberg (línea 1828). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín). · «Man» genérico traducido como «el ser humano».

### C3-CRI-114

- **Texto:** ¿Cuándo nos reponemos, aflojando la mente de esta tensión de preocupaciones?
- **Id en el catálogo:** `C3-CRI-114` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro VI · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro VI
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** When refresh ourselves, unbending our minds from this intenseness of care?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro VI, párrafo 18 contado desde el encabezado del libro en el archivo Gutenberg (línea 3047). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-CRI-115

- **Texto:** Y advertido así de volver a mí mismo, entré en lo íntimo de mí, guiado por ti; y pude hacerlo, porque tú te habías hecho mi ayuda.
- **Id en el catálogo:** `C3-CRI-115` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro VII · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro VII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** And being thence admonished to return to myself, I entered even into my inward self, Thou being my Guide: and able I was, for Thou wert become my Helper.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro VII, párrafo 16 contado desde el encabezado del libro en el archivo Gutenberg (línea 3617). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín). · «thence»: por la lectura de los libros platónicos; «así» lo deja implícito.

### C3-CRI-116

- **Texto:** Sin alegrarme recuerdo que estuve alegre, y sin tristeza recuerdo mi tristeza pasada.
- **Id en el catálogo:** `C3-CRI-116` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro X · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro X
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** For without rejoicing I remember myself to have joyed; and without sorrow do I recollect my past sorrow.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro X, párrafo 21 contado desde el encabezado del libro en el archivo Gutenberg (línea 5708). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-CRI-120

- **Texto:** Porque el pasado ya no es, y el futuro todavía no es.
- **Id en el catálogo:** `C3-CRI-120` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro XI · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro XI
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** For the past, is not now; and the future, is not yet.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro XI, párrafo 18 contado desde el encabezado del libro en el archivo Gutenberg (línea 6977). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-CRI-121

- **Texto:** Contemplo el alba y anuncio que el sol está a punto de salir.
- **Id en el catálogo:** `C3-CRI-121` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro XI · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro XI
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** I behold the day-break, I foreshow, that the sun, is about to rise.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro XI, párrafo 24 contado desde el encabezado del libro en el archivo Gutenberg (línea 7082). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-CRI-122

- **Texto:** Las nubes pasan, pero el cielo permanece.
- **Id en el catálogo:** `C3-CRI-122` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de E. B. Pusey (1838).
- **Atribución en la app:** San Agustín · Confesiones, Libro XIII · Traducción editorial para Strivo
- **Autor u obra:** San Agustín · Confesiones
- **Ubicación:** Libro XIII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Confessions, trad. de E. B. Pusey (1838); Project Gutenberg n.º 3296
- **Fuente consultada:** https://www.gutenberg.org/ebooks/3296
- **Licencia:** Dominio público
- **Derechos:** Agustín murió en 430; Edward Bouverie Pusey, en 1882. Dominio público en México.
- **Texto fuente:** The clouds pass away, but the heaven abideth.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización: Libro XIII, párrafo 18 contado desde el encabezado del libro en el archivo Gutenberg (línea 8634). Esa edición no numera capítulos: falta añadir la referencia canónica (libro, capítulo, párrafo). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín). · En el original, imagen de la Escritura que permanece; la frase se sostiene sola.

### C3-CRI-123

- **Texto:** Conozcamos, pues, nuestros límites: somos algo, pero no lo somos todo.
- **Id en el catálogo:** `C3-CRI-123` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Primera parte, «Desproporción del hombre» (Man's Disproportion) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Primera parte, «Desproporción del hombre» (Man's Disproportion)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** Let us then know our limits; we are something, but we are not all.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 1026. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-CRI-124

- **Texto:** Tengo dentro de mí mis días de niebla y mis días claros; que mis asuntos vayan bien o mal tiene poco que ver con eso.
- **Id en el catálogo:** `C3-CRI-124` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Primera parte, «Desproporción del hombre» (Man's Disproportion) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Primera parte, «Desproporción del hombre» (Man's Disproportion)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** I have my foggy and my fine days within me, whether my affairs go well or ill has little to do with the matter.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 1211. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-CRI-125

- **Texto:** Si leemos demasiado deprisa o demasiado despacio, no entendemos nada.
- **Id en el catálogo:** `C3-CRI-125` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Primera parte, «Desproporción del hombre» (Man's Disproportion) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Primera parte, «Desproporción del hombre» (Man's Disproportion)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** If we read too quickly or too slowly, we understand nothing.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 1302. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-CRI-126

- **Texto:** Se me ha escapado un pensamiento. Quería escribirlo. En su lugar, escribo que se me ha escapado.
- **Id en el catálogo:** `C3-CRI-126` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Primera parte, «Desproporción del hombre» (Man's Disproportion) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Primera parte, «Desproporción del hombre» (Man's Disproportion)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** A thought has escaped me. I would write it down. I write instead, that it has escaped me.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 1313. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-CRI-127

- **Texto:** Las razones, vistas de lejos, parecen limitar nuestra mirada, pero no cuando llegamos a ellas: empezamos a ver más allá.
- **Id en el catálogo:** `C3-CRI-127` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Primera parte, «Desproporción del hombre» (Man's Disproportion) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Primera parte, «Desproporción del hombre» (Man's Disproportion)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** Reasons, seen from afar, appear to restrict our view, but not when we reach them; we begin to see beyond.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 1451. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-CRI-128

- **Texto:** Quien tiene lo suficiente para vivir, si supiera estar a gusto en su propia casa, no la dejaría para navegar ni para sitiar una ciudad.
- **Id en el catálogo:** `C3-CRI-128` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Primera parte, «Diversión» (Diversion) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Primera parte, «Diversión» (Diversion)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** A man who has enough to live on, if he knew how to dwell with pleasure in his own home, would not leave it for sea-faring or to besiege a city.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 1501. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · Sigue a la célebre idea de no saber quedarse tranquilo en la propia habitación (esa oración contiene «only» y se descartó).

### C3-CRI-132

- **Texto:** Nos adelantamos al futuro como si tardara en llegar, como si pudiéramos apresurarlo; o llamamos al pasado para detener su rápida huida.
- **Id en el catálogo:** `C3-CRI-132` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Primera parte, «Debilidad, inquietud y defectos del hombre» (The Weakness, Unrest, and Defects of Man) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Primera parte, «Debilidad, inquietud y defectos del hombre» (The Weakness, Unrest, and Defects of Man)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** We anticipate the future as too slow in coming, as if we could make it move faster; or we call back the past, to stop its rapid flight.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 3061. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-CRI-133

- **Texto:** El tiempo sana todo dolor y todo malentendido, porque cambiamos y ya no somos las mismas personas.
- **Id en el catálogo:** `C3-CRI-133` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Primera parte, «Debilidad, inquietud y defectos del hombre» (The Weakness, Unrest, and Defects of Man) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Primera parte, «Debilidad, inquietud y defectos del hombre» (The Weakness, Unrest, and Defects of Man)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** Time heals all pain and misunderstanding, because we change and are no longer the same persons.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 3379. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · «heals» → «sana» (el verificador marca «cura» como léxico clínico).

### C3-CRI-134

- **Texto:** No nos cansamos de comer y dormir cada día, porque el hambre y el sueño se renuevan; sin eso nos cansaríamos de ellos.
- **Id en el catálogo:** `C3-CRI-134` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Segunda parte, «Del verdadero justo y del verdadero cristiano» (Of the True Righteous Man and of the True Christian) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Segunda parte, «Del verdadero justo y del verdadero cristiano» (Of the True Righteous Man and of the True Christian)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** We are not wearied of eating and sleeping every day, because hunger and drowsiness are renewed; without that we should be weary of them.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 10116. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés). · En el original sigue una aplicación a lo espiritual; la frase se sostiene sola.

### C3-CRI-135

- **Texto:** El corazón tiene sus razones, que la razón no conoce, como sentimos en mil ocasiones.
- **Id en el catálogo:** `C3-CRI-135` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Segunda parte, «Pensamientos diversos» (Various Thoughts) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Segunda parte, «Pensamientos diversos» (Various Thoughts)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** The heart has its reasons, which reason knows not, as we feel in a thousand instances.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 12452. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-CRI-136

- **Texto:** Por lo general nos convencen más las razones que hemos descubierto por nosotros mismos que las que se les han ocurrido a otros.
- **Id en el catálogo:** `C3-CRI-136` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de C. Kegan Paul (1885).
- **Atribución en la app:** Blaise Pascal · Pensamientos, Segunda parte, «Pensamientos diversos» (Various Thoughts) · Traducción editorial para Strivo
- **Autor u obra:** Blaise Pascal · Pensamientos
- **Ubicación:** Segunda parte, «Pensamientos diversos» (Various Thoughts)
- **Idioma original:** francés (vía inglés)
- **Edición de referencia:** The Thoughts of Blaise Pascal, trad. de C. Kegan Paul (1885) sobre el texto de A. Molinier; Project Gutenberg n.º 46921
- **Fuente consultada:** https://www.gutenberg.org/ebooks/46921
- **Licencia:** Dominio público
- **Derechos:** Pascal murió en 1662; Charles Kegan Paul, en 1902; Auguste Molinier, en 1904. Dominio público en México.
- **Texto fuente:** We are usually better persuaded by reasons which we have ourselves discovered, than by those which have come into the mind of others.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 12554. La edición de Molinier/Kegan Paul no numera los pensamientos: falta la concordancia con Brunschvicg o Lafuma. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (francés).

### C3-CRI-137

- **Texto:** Él ha puesto las preguntas en mi corazón; él guarda las respuestas en el suyo.
- **Id en el catálogo:** `C3-CRI-137` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie I, «La fe más alta» (The Higher Faith) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie I, «La fe más alta» (The Higher Faith)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** He has put the questions in my heart; he holds the answers in his.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 970. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «He» es Dios; en el contexto cristiano se entiende, pero conviene revisarlo.

### C3-CRI-138

- **Texto:** Ser algo que Dios cuida y quiere completo para sí, porque vale la pena cuidarlo, ¿no es eso vida suficiente?
- **Id en el catálogo:** `C3-CRI-138` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie I, «El nombre nuevo» (The New Name) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie I, «El nombre nuevo» (The New Name)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** To be a thing that God cares for and would have complete for himself, because it is worth caring for--is not that life enough?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 2008. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-CRI-140

- **Texto:** Porque el Padre no olvida al hijo que está tan ocupado confiando en él que ni siquiera se preocupa de pedir por sí mismo.
- **Id en el catálogo:** `C3-CRI-140` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie I, «La tentación en el desierto» (The Temptation in the Wilderness) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie I, «La tentación en el desierto» (The Temptation in the Wilderness)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** For the Father does not forget the child who is so busy trusting in him, that he cares not even to pray for himself.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 2466. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-CRI-142

- **Texto:** Quizá no sabes tan bien como yo que una región de alegría rodea toda tu pena; de luz, toda tu oscuridad; de paz, todo tu tumulto.
- **Id en el catálogo:** `C3-CRI-142` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie I, «Ama a tu prójimo» (Love Thy Neighbour) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie I, «Ama a tu prójimo» (Love Thy Neighbour)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** Perhaps thou knowest not so well as I, that a region of gladness surrounds all thy grief, of light all thy darkness, of peace all thy tumult.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 3625. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-CRI-143

- **Texto:** ¿Qué padre no se alegra con el primer intento vacilante de su pequeño por caminar?
- **Id en el catálogo:** `C3-CRI-143` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie II, «El camino» (The Way) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie II, «El camino» (The Way)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** What father is not pleased with the first tottering attempt of his little one to walk?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 4433. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · La oración siguiente del original pide más («the manly step»); esta se sostiene sola.

### C3-CRI-144

- **Texto:** Quien confía puede comprender; quien tiene la mente en calma puede descubrir una razón.
- **Id en el catálogo:** `C3-CRI-144` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie II, «La causa de la torpeza espiritual» (The Cause of Spiritual Stupidity) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie II, «La causa de la torpeza espiritual» (The Cause of Spiritual Stupidity)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** He who trusts can understand; he whose mind is set at ease can discover a reason.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 5172. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-CRI-145

- **Texto:** La próxima hora, el próximo instante, están tan fuera de nuestro alcance y tan al cuidado de Dios como lo que está a cien años.
- **Id en el catálogo:** `C3-CRI-145` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie II, «La causa de la torpeza espiritual» (The Cause of Spiritual Stupidity) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie II, «La causa de la torpeza espiritual» (The Cause of Spiritual Stupidity)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** The next hour, the next moment, is as much beyond our grasp and as much in God's care, as that a hundred years away.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 5241. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-CRI-146

- **Texto:** Cuando nos tocaría estar quietos, durmiendo o soñando, nos inquietamos por una hora que está a medio viaje del sol.
- **Id en el catálogo:** `C3-CRI-146` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie II, «La causa de la torpeza espiritual» (The Cause of Spiritual Stupidity) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie II, «La causa de la torpeza espiritual» (The Cause of Spiritual Stupidity)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** When we should be still, sleeping or dreaming, we are fretting about an hour that lies a half sun's-journey away!
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 5314. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «should» se traduce «nos tocaría» para evitar «deberíamos». El «!» final se cambia por punto.

### C3-CRI-147

- **Texto:** Dios querría que yo fuera sabio y sonriera ante la nimiedad.
- **Id en el catálogo:** `C3-CRI-147` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie II, «La causa de la torpeza espiritual» (The Cause of Spiritual Stupidity) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie II, «La causa de la torpeza espiritual» (The Cause of Spiritual Stupidity)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** God would have me wise, and smile at the trifle.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 5446. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Contexto: una pérdida pequeña que inquieta más de lo que merece.

### C3-CRI-148

- **Texto:** La misma demora puede acercarnos a nuestra ayuda, aumentar el deseo, perfeccionar la oración y madurar nuestra disposición a recibir.
- **Id en el catálogo:** `C3-CRI-148` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie II, «La dificultad humana ante la oración» (Man's Difficulty Concerning Prayer) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie II, «La dificultad humana ante la oración» (Man's Difficulty Concerning Prayer)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** The delay itself may work to bring us nearer to our help, to increase the desire, perfect the prayer, and ripen the receptive condition.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 6343. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-CRI-149

- **Texto:** Podemos volver el rostro hacia la luz y salir de la oscuridad; el Señor se ocupará de que crezcamos.
- **Id en el catálogo:** `C3-CRI-149` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie III, «El desagrado de Jesús» (The Displeasure of Jesus) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie III, «El desagrado de Jesús» (The Displeasure of Jesus)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** We are able to turn our faces to the light, and come out of the darkness; the Lord will see to our growth.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 13760. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-CRI-150

- **Texto:** Tu perro, tu caballo, te hablan de aquel que cuida de todas sus criaturas.
- **Id en el catálogo:** `C3-CRI-150` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el original inglés.
- **Atribución en la app:** George MacDonald · Sermones no pronunciados, Serie III, «La herencia» (The Inheritance) · Traducción editorial para Strivo
- **Autor u obra:** George MacDonald · Sermones no pronunciados
- **Ubicación:** Serie III, «La herencia» (The Inheritance)
- **Idioma original:** inglés
- **Edición de referencia:** Unspoken Sermons, series I–III (1867–1889), Project Gutenberg n.º 9057
- **Fuente consultada:** https://www.gutenberg.org/ebooks/9057
- **Licencia:** Dominio público
- **Derechos:** Original inglés; MacDonald murió en 1905. Dominio público.
- **Texto fuente:** Your dog, your horse tells you about him who cares for all his creatures.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Localización en el archivo Gutenberg: línea 15009. · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-EST-001

- **Texto:** Nadie puede perder ni el pasado ni el futuro: ¿cómo podría alguien quitarle a una persona lo que no tiene?
- **Id en el catálogo:** `C3-EST-001` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro II, 14 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro II, 14
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** For a man cannot lose either the past or the future: for what a man has not, how can anyone take this from him?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-002

- **Texto:** ¿Es peor una esmeralda si nadie la elogia? ¿Y el oro, el marfil, la púrpura, una lira, un cuchillito, una flor, un arbusto?
- **Id en el catálogo:** `C3-EST-002` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro IV, 20 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro IV, 20
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Is such a thing as an emerald made worse than it was, if it is not praised? Or gold, ivory, purple, a lyre, a little knife, a flower, a shrub?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-003

- **Texto:** Todo lo que está en armonía contigo, oh universo, está en armonía conmigo.
- **Id en el catálogo:** `C3-EST-003` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro IV, 23 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro IV, 23
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Everything harmonizes with me, which is harmonious to thee, O Universe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-004

- **Texto:** Es fruto para mí todo lo que traen tus estaciones, oh naturaleza: de ti viene todo, en ti está todo, a ti vuelve todo.
- **Id en el catálogo:** `C3-EST-004` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro IV, 23 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro IV, 23
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Everything is fruit to me which thy seasons bring, O Nature: from thee are all things, in thee are all things, to thee all things return.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-005

- **Texto:** La mayor parte de lo que decimos y hacemos no es necesaria; quien la suprime tendrá más tiempo libre y menos inquietud.
- **Id en el catálogo:** `C3-EST-005` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro IV, 24 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro IV, 24
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** For the greatest part of what we say and do being unnecessary, if a man takes this away, he will have more leisure and less uneasiness.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-006

- **Texto:** Todo lo que existe es, en cierto modo, la semilla de lo que será.
- **Id en el catálogo:** `C3-EST-006` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro IV, 36 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro IV, 36
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** For everything that exists is in a manner the seed of that which will be.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-007

- **Texto:** Todo lo que aceptamos como cierto puede cambiar; ¿dónde está la persona que no cambia?
- **Id en el catálogo:** `C3-EST-007` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro V, 10 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro V, 10
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** And all our assent is changeable; for where is the man who never changes?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego). · «assent» (asentimiento, término estoico) traducido como «lo que aceptamos como cierto».

### C3-EST-008

- **Texto:** Como sean tus pensamientos habituales, así será el carácter de tu mente: el alma se tiñe de los pensamientos.
- **Id en el catálogo:** `C3-EST-008` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro V, 16 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro V, 16
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Such as are thy habitual thoughts, such also will be the character of thy mind; for the soul is dyed by the thoughts.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-009

- **Texto:** La mejor manera de vengarte es no volverte como quien te hizo daño.
- **Id en el catálogo:** `C3-EST-009` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VI, 6 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VI, 6
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** The best way of avenging thyself is not to become like the wrong doer.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-010

- **Texto:** Si alguien me convence y me muestra que no pienso o no actúo bien, cambiaré con gusto: busco la verdad, que no ha dañado a nadie.
- **Id en el catálogo:** `C3-EST-010` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VI, 21 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VI, 21
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** If any man is able to convince me and show me that I do not think or act right, I will gladly change; for I seek the truth by which no man was ever injured.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-011

- **Texto:** Está en nuestras manos no opinar sobre algo y no perturbar el alma: las cosas no tienen por naturaleza poder para formar nuestros juicios.
- **Id en el catálogo:** `C3-EST-011` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VI, 52 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VI, 52
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** It is in our power to have no opinion about a thing, and not to be disturbed in our soul; for things themselves have no natural power to form our judgements.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego). · Marcada como no apta con ánimo bajo: puede leerse como que el malestar depende solo del juicio propio.

### C3-EST-012

- **Texto:** Todas las cosas están entrelazadas, y el vínculo es sagrado; casi nada está desligado de lo demás.
- **Id en el catálogo:** `C3-EST-012` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VII, 9 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VII, 9
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** All things are implicated with one another, and the bond is holy; and there is hardly anything unconnected with any other thing.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-013

- **Texto:** ¿Alguien teme el cambio? ¿Y qué puede suceder sin cambio?
- **Id en el catálogo:** `C3-EST-013` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VII, 18 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VII, 18
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Is any man afraid of change? Why what can take place without change?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-014

- **Texto:** Es propio del ser humano amar incluso a quienes obran mal.
- **Id en el catálogo:** `C3-EST-014` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VII, 22 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VII, 22
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** It is peculiar to man to love even those who do wrong.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-015

- **Texto:** No está bien enojarnos con las cosas: a ellas no les importa nada.
- **Id en el catálogo:** `C3-EST-015` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VII, 38 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VII, 38
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** It is not right to vex ourselves at things, For they care nought about it.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego). · Verso citado por Marco Aurelio (de Eurípides, según la tradición).

### C3-EST-016

- **Texto:** Dentro está la fuente del bien, y brotará sin cesar si cavas sin cesar.
- **Id en el catálogo:** `C3-EST-016` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VII, 59 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VII, 59
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Within is the fountain of good, and it will ever bubble up, if thou wilt ever dig.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-017

- **Texto:** A cada persona le alegran cosas distintas.
- **Id en el catálogo:** `C3-EST-017` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VIII, 43 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VIII, 43
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Different things delight different people.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-018

- **Texto:** Si algo externo te duele, no es esa cosa lo que te perturba, sino tu propio juicio sobre ella.
- **Id en el catálogo:** `C3-EST-018` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VIII, 47 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VIII, 47
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** If thou art pained by any external thing, it is not this thing that disturbs thee, but thy own judgement about it.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego). · Marcada como no apta con ánimo bajo: puede leerse como que el malestar depende solo del juicio propio.

### C3-EST-019

- **Texto:** ¿Cómo tener un manantial perpetuo y no un simple pozo? Formándote hora tras hora en la libertad, unida al contento, la sencillez y la modestia.
- **Id en el catálogo:** `C3-EST-019` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VIII, 51 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VIII, 51
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** How then shalt thou possess a perpetual fountain and not a mere well? By forming thyself hourly to freedom conjoined with contentment, simplicity and modesty.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-020

- **Texto:** Los seres humanos existen unos para otros.
- **Id en el catálogo:** `C3-EST-020` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro VIII, 59 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro VIII, 59
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Men exist for the sake of one another.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-021

- **Texto:** Hoy he salido de toda inquietud, o mejor, la he echado fuera: no estaba afuera, sino dentro, en mis opiniones.
- **Id en el catálogo:** `C3-EST-021` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro IX, 13 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro IX, 13
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Today I have got out of all trouble, or rather I have cast out all trouble, for it was not outside, but within and in my opinions.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego). · Marcada como no apta con ánimo bajo: puede leerse como que el malestar depende solo del juicio propio.

### C3-EST-022

- **Texto:** Quien sigue la razón en todo está a la vez tranquilo y activo, y también alegre y sereno.
- **Id en el catálogo:** `C3-EST-022` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro X, 12 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro X, 12
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** He who follows reason in all things is both tranquil and active at the same time, and also cheerful and collected.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-023

- **Texto:** A la naturaleza, que todo lo da y todo lo recupera, la persona instruida y modesta le dice: da lo que quieras; llévate lo que quieras.
- **Id en el catálogo:** `C3-EST-023` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro X, 14 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro X, 14
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** To her who gives and takes back all, to nature, the man who is instructed and modest says, Give what thou wilt; take back what thou wilt.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-024

- **Texto:** La uva verde, el racimo maduro, la uva pasa: todo son cambios, no hacia la nada, sino hacia algo que aún no existe.
- **Id en el catálogo:** `C3-EST-024` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro XI, 35 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro XI, 35
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** The unripe grape, the ripe bunch, the dried grape, all are changes, not into nothing, but into something which exists not yet.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-025

- **Texto:** Nadie puede robarnos la libertad de elegir.
- **Id en el catálogo:** `C3-EST-025` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro XI, 36 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro XI, 36
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** No man can rob us of our free will.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-026

- **Texto:** Todo aquello a lo que deseas llegar dando un rodeo puedes tenerlo ahora, si no te lo niegas.
- **Id en el catálogo:** `C3-EST-026` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro XII, 1 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro XII, 1
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** All those things at which thou wishest to arrive by a circuitous road, thou canst have now, if thou dost not refuse them to thyself.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-027

- **Texto:** Me he preguntado a menudo cómo es que cada persona se ama más que a nadie y, sin embargo, valora menos su opinión de sí que la de los demás.
- **Id en el catálogo:** `C3-EST-027` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro XII, 4 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro XII, 4
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** I have often wondered how it is that every man loves himself more than all the rest of men, but yet sets less value on his own opinion of himself than on the opinion of others.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-028

- **Texto:** ¿Qué queda sino disfrutar la vida uniendo una cosa buena a otra, sin dejar entre ellas ni el más pequeño hueco?
- **Id en el catálogo:** `C3-EST-028` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro XII, 29 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro XII, 29
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** What remains except to enjoy life by joining one good thing to another so as not to leave even the smallest intervals between?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-029

- **Texto:** A los dioses les debo tener buenos abuelos, buenos padres, una buena hermana, buenos maestros, compañeros, parientes y amigos; casi todo bueno.
- **Id en el catálogo:** `C3-EST-029` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro I, 17 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro I, 17
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** To the gods I am indebted for having good grandfathers, good parents, a good sister, good teachers, good associates, good kinsmen and friends, nearly everything good.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-030

- **Texto:** Como es el carácter de una persona, así lo muestra enseguida en sus ojos, igual que quien es amado lo lee todo en los ojos de quien ama.
- **Id en el catálogo:** `C3-EST-030` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long (1862).
- **Atribución en la app:** Marco Aurelio · Meditaciones, libro XI, 15 · Traducción editorial para Strivo
- **Autor u obra:** Marco Aurelio · Meditaciones
- **Ubicación:** libro XI, 15
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Meditations, trad. de George Long (1862); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Marco Aurelio murió en 180; George Long, en 1879. La edición digital de Standard Ebooks dedica sus aportes al dominio público (CC0).
- **Texto fuente:** Such as a man’s character is, he immediately shows it in his eyes, just as he who is beloved forthwith reads everything in the eyes of lovers.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Ubicación convertida a la numeración canónica de Long (Project Gutenberg n.º 15877). · Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-031

- **Texto:** De las cosas, unas dependen de nosotros y otras no.
- **Id en el catálogo:** `C3-EST-031` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Enquiridión, §1 · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Enquiridión
- **Ubicación:** Enquiridión, §1
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Enchiridion y Fragments, trad. de George Long; edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/short-works/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** Of things some are in our power, and others are not.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-032

- **Texto:** Todo tiene dos asas: una por la que se puede llevar y otra por la que no.
- **Id en el catálogo:** `C3-EST-032` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Enquiridión, §43 · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Enquiridión
- **Ubicación:** Enquiridión, §43
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Enchiridion y Fragments, trad. de George Long; edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/short-works/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** Everything has two handles, the one by which it may be borne, the other by which it may not.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-033

- **Texto:** No conviene que un barco dependa de una sola ancla pequeña, ni que la vida descanse en una única esperanza.
- **Id en el catálogo:** `C3-EST-033` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Fragmentos, Fragmento 89 · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Fragmentos
- **Ubicación:** Fragmento 89
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Enchiridion y Fragments, trad. de George Long; edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/short-works/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** Neither should a ship rely on one small anchor, nor should life rest on a single hope.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego). · «should» se traduce como «no conviene».

### C3-EST-034

- **Texto:** Así como es grato ver el mar desde tierra, es grato para quien ha salido de sus penas pensar en ellas.
- **Id en el catálogo:** `C3-EST-034` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Fragmentos, Fragmento 121 · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Fragmentos
- **Ubicación:** Fragmento 121
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Enchiridion y Fragments, trad. de George Long; edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/short-works/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** As it is pleasant to see the sea from the land, so it is pleasant for him who has escaped from troubles to think of them.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-035

- **Texto:** Es sabio quien no se aflige por lo que no tiene, sino que se alegra por lo que tiene.
- **Id en el catálogo:** `C3-EST-035` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Fragmentos, Fragmento 129 · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Fragmentos
- **Ubicación:** Fragmento 129
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Enchiridion y Fragments, trad. de George Long; edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/short-works/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-036

- **Texto:** Nadie es libre si no es dueño de sí.
- **Id en el catálogo:** `C3-EST-036` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Fragmentos, Fragmento 114 · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Fragmentos
- **Ubicación:** Fragmento 114
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Enchiridion y Fragments, trad. de George Long; edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/short-works/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** No man is free who is not master of himself.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-037

- **Texto:** Si buscas la verdad, no buscarás ganar a toda costa; y si la encuentras, tendrás la ganancia de no ser vencido.
- **Id en el catálogo:** `C3-EST-037` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Fragmentos, Fragmento 39 · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Fragmentos
- **Ubicación:** Fragmento 39
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Enchiridion y Fragments, trad. de George Long; edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/short-works/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** If you seek truth, you will not seek by every means to gain a victory; and if you have found truth, you will have the gain of not being defeated.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-038

- **Texto:** De los placeres, los que llegan más rara vez son los que más deleitan.
- **Id en el catálogo:** `C3-EST-038` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Fragmentos, Fragmento 54 · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Fragmentos
- **Ubicación:** Fragmento 54
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Enchiridion y Fragments, trad. de George Long; edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/short-works/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** Of pleasures those which occur most rarely give the greatest delight.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-039

- **Texto:** Ser instruido es esto: aprender a querer que todo suceda tal como sucede.
- **Id en el catálogo:** `C3-EST-039` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro I, cap. XII · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro I, cap. XII
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** By no means; but to be instructed is this, to learn to wish that everything may happen as it does.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego). · Se omite el «By no means» inicial, que responde a la pregunta anterior.

### C3-EST-040

- **Texto:** En realidad, damos gracias a los dioses por aquello en lo que ponemos nuestro bien.
- **Id en el catálogo:** `C3-EST-040` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro I, cap. XIX · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro I, cap. XIX
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** For in fact we thank the gods for those things in which we place our good.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-041

- **Texto:** Esta es la naturaleza del entendimiento: inclinarse hacia lo verdadero, rechazar lo falso y, ante lo incierto, suspender el juicio.
- **Id en el catálogo:** `C3-EST-041` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro I, cap. XXVIII · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro I, cap. XXVIII
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** Because this is the nature of the understanding: to incline to the true, to be dissatisfied with the false, and in matters uncertain to withhold assent.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego). · Se omite el «Because» inicial, que responde a la pregunta anterior.

### C3-EST-042

- **Texto:** ¿Es la libertad otra cosa que poder vivir como elegimos?
- **Id en el catálogo:** `C3-EST-042` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro II, cap. I · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro II, cap. I
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** Is freedom anything else than the power of living as we choose?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-043

- **Texto:** Es imposible empezar a aprender lo que uno cree que ya sabe.
- **Id en el catálogo:** `C3-EST-043` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro II, cap. XVII · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro II, cap. XVII
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** For it is impossible for a man to begin to learn that which he thinks that he knows.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-044

- **Texto:** Si se me permite vivir conforme a la naturaleza, no buscaré otro lugar que aquel en que estoy, ni otra gente que aquella entre la que estoy.
- **Id en el catálogo:** `C3-EST-044` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro III, cap. XXIV · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro III, cap. XXIV
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** If means of living according to nature be allowed to me, I will seek no other place than that in which I am, or other men than those among whom I am.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-045

- **Texto:** Estoy hecho por naturaleza para mi propio bien, no para mi propio mal.
- **Id en el catálogo:** `C3-EST-045` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro III, cap. XXIV · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro III, cap. XXIV
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** I am formed by nature for my own good: I am not formed for my own evil.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-046

- **Texto:** La felicidad y el deseo de lo que no está presente no pueden ir juntos.
- **Id en el catálogo:** `C3-EST-046` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro III, cap. XXIV · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro III, cap. XXIV
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** And it is never possible for happiness and desire of what is not present to come together.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-047

- **Texto:** ¿Cómo voy a tener opiniones rectas si no me basta con ser lo que soy y me inquieta lo que se cree que soy?
- **Id en el catálogo:** `C3-EST-047` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro IV, cap. VI · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro IV, cap. VI
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** How do I possess right opinions when I am not content with being what I am, but am uneasy about what I am supposed to be?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-048

- **Texto:** Que una persona esté sola no quiere decir que esté en soledad, igual que estar entre mucha gente no quiere decir que no lo esté.
- **Id en el catálogo:** `C3-EST-048` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro III, cap. XIII · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro III, cap. XIII
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** For because a man is alone, he is not for that reason also solitary; just as though a man is among numbers, he is not therefore not solitary.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-049

- **Texto:** Los niños recogen conchas y ceniza, construyen algo, lo deshacen y construyen otra cosa; así no les falta con qué pasar el tiempo.
- **Id en el catálogo:** `C3-EST-049` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro III, cap. XIII · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro III, cap. XIII
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** They take up shells and ashes, and they build something, then pull it down and build something else, and so they never want the means of passing the time.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego). · Se explicita el sujeto («los niños»), que viene de la pregunta anterior.

### C3-EST-050

- **Texto:** Quien tiene tales cosas en que pensar, y ve el sol, la luna y las estrellas, y disfruta de la tierra y el mar, no está solitario ni desvalido.
- **Id en el catálogo:** `C3-EST-050` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro III, cap. XIII · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro III, cap. XIII
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** When a man has such things to think on, and sees the sun, the moon, and stars, and enjoys earth and sea, he is not solitary nor even helpless.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-051

- **Texto:** Si me dices ahora que quieres un higo, te responderé que hace falta tiempo: que primero florezca, luego dé fruto y después madure.
- **Id en el catálogo:** `C3-EST-051` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro I, cap. XV · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro I, cap. XV
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** If you say to me now that you want a fig, I will answer to you that it requires time: let it flower first, then put forth fruit, and then ripen.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-052

- **Texto:** Así crece el fruto: la semilla necesita estar enterrada un tiempo, oculta, y crecer despacio para llegar a madurar.
- **Id en el catálogo:** `C3-EST-052` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de George Long.
- **Atribución en la app:** Epicteto · Disertaciones, Libro IV, cap. VIII · Traducción editorial para Strivo
- **Autor u obra:** Epicteto · Disertaciones
- **Ubicación:** Libro IV, cap. VIII
- **Idioma original:** griego (vía inglés)
- **Edición de referencia:** Discourses, trad. de George Long (1877); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/epictetus/discourses/george-long
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Epicteto murió hacia 135; George Long, en 1879. Standard Ebooks: CC0.
- **Texto fuente:** Fruit grows thus: the seed must be buried for some time, hid, grow slowly in order that it may come to perfection.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (griego).

### C3-EST-053

- **Texto:** La vida es lo bastante larga si sabes usarla.
- **Id en el catálogo:** `C3-EST-053` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la brevedad de la vida, cap. II · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la brevedad de la vida
- **Ubicación:** Sobre la brevedad de la vida, cap. II
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Life is long enough, if you know how to use it.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-054

- **Texto:** ¿Por qué nos quejamos de la naturaleza? Ha sido generosa con nosotros.
- **Id en el catálogo:** `C3-EST-054` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la brevedad de la vida, cap. II · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la brevedad de la vida
- **Ubicación:** Sobre la brevedad de la vida, cap. II
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Why do we complain of Nature? she has dealt kindly with us.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-055

- **Texto:** En cualquier situación de la vida encontrarás distracciones, descansos y placeres, con tal de que quieras restar peso a los males en vez de odiarlos.
- **Id en el catálogo:** `C3-EST-055` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la tranquilidad del ánimo, cap. X · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la tranquilidad del ánimo
- **Ubicación:** Sobre la tranquilidad del ánimo, cap. X
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** In every station of life you will find amusements, relaxations, and enjoyments; that is, provided you be willing to make light of evils rather than to hate them.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-056

- **Texto:** Un terreno pequeño, bien repartido, sirve para muchos usos, y el orden hace habitable hasta la habitación más estrecha.
- **Id en el catálogo:** `C3-EST-056` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la tranquilidad del ánimo, cap. X · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la tranquilidad del ánimo
- **Ubicación:** Sobre la tranquilidad del ánimo, cap. X
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Small sites, if ingeniously divided, may be made use of for many different purposes, and arrangement will render ever so narrow a room habitable.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-057

- **Texto:** No cambiar nada y estar a disgusto con todo: ambas cosas son enemigas del sosiego.
- **Id en el catálogo:** `C3-EST-057` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la tranquilidad del ánimo, cap. XIV · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la tranquilidad del ánimo
- **Ubicación:** Sobre la tranquilidad del ánimo, cap. XIV
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Both of these qualities, both that of altering nothing, and that of being dissatisfied with everything, are enemies to repose.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-058

- **Texto:** La mente humana necesita esparcimiento: después del descanso se levanta mejor y con más vigor.
- **Id en el catálogo:** `C3-EST-058` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la tranquilidad del ánimo, cap. XVII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la tranquilidad del ánimo
- **Ubicación:** Sobre la tranquilidad del ánimo, cap. XVII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Men’s minds ought to have relaxation: they rise up better and more vigorous after rest.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín). · «ought to have» se traduce como «necesita», sin forma de mandato; el sentido se conserva.

### C3-EST-059

- **Texto:** Hay mucha diferencia entre aflojar algo y soltarlo.
- **Id en el catálogo:** `C3-EST-059` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la tranquilidad del ánimo, cap. XVII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la tranquilidad del ánimo
- **Ubicación:** Sobre la tranquilidad del ánimo, cap. XVII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** There is a great difference between slackening your hold of a thing and letting it go.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-060

- **Texto:** Hay quien descansa a mediodía y deja alguna ocupación ligera para la tarde.
- **Id en el catálogo:** `C3-EST-060` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la tranquilidad del ánimo, cap. XVII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la tranquilidad del ánimo
- **Ubicación:** Sobre la tranquilidad del ánimo, cap. XVII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Some rest in the middle of the day, and reserve some light occupation for the afternoon.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-061

- **Texto:** Qué placer hay en esa franqueza honesta que es su propio adorno y no oculta nada de sí.
- **Id en el catálogo:** `C3-EST-061` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la tranquilidad del ánimo, cap. XVII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la tranquilidad del ánimo
- **Ubicación:** Sobre la tranquilidad del ánimo, cap. XVII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** But what pleasure there is in that honest straightforwardness which is its own ornament, and which conceals no part of its character?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín). · Pregunta retórica del original vertida como exclamativa sin signos.

### C3-EST-062

- **Texto:** ¿Qué puede haber más admirable que esta costumbre de repasar lo ocurrido en el día? Y qué dulce es el sueño que sigue a ese examen de uno mismo.
- **Id en el catálogo:** `C3-EST-062` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro III, cap. XXXVI · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro III, cap. XXXVI
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** What can be more admirable than this fashion of discussing the whole of the day’s events? how sweet is the sleep which follows this self-examination?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín). · La segunda pregunta retórica se vierte como exclamativa sin signos.

### C3-EST-063

- **Texto:** La virtud es lo único elevado y sublime, y nada es grande si no es al mismo tiempo sereno.
- **Id en el catálogo:** `C3-EST-063` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro I, cap. XXI · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro I, cap. XXI
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Virtue alone is lofty and sublime, nor is anything great which is not at the same time tranquil.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-064

- **Texto:** ¿Qué hay más reposado que una mente en paz, y qué más fatigoso que la ira?
- **Id en el catálogo:** `C3-EST-064` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro II, cap. XIII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro II, cap. XIII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** What is more restful than a mind at peace, and what more toilsome than anger?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-065

- **Texto:** A la sospecha no le faltarán motivos; lo que necesitamos es sencillez y una interpretación amable de las cosas.
- **Id en el catálogo:** `C3-EST-065` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro II, cap. XXIV · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro II, cap. XXIV
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Suspicion will never lack grounds: what we want is straightforwardness, and a kindly interpretation of things.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-066

- **Texto:** Así como las señales de tormenta y lluvia preceden a la tormenta misma, hay ciertos anuncios de la ira, del amor y de todas las tormentas del ánimo.
- **Id en el catálogo:** `C3-EST-066` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro III, cap. X · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro III, cap. X
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Just as the signs of storms and rain come before the storms themselves, so there are certain forerunners of anger, love, and all the storms which torment our minds.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-067

- **Texto:** Hay muchas maneras de frenar la ira; casi todo puede tomarse con humor.
- **Id en el catálogo:** `C3-EST-067` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro III, cap. XI · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro III, cap. XI
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** There are many ways in which anger may be checked; most things may be turned into jest.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-068

- **Texto:** Muchas veces la ira viene a nosotros, pero muchas otras somos nosotros quienes vamos a ella.
- **Id en el catálogo:** `C3-EST-068` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro III, cap. XII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro III, cap. XII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Anger often comes to us, but we often go to it.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-069

- **Texto:** De los agravios que te exasperan, algunos se aligerarán tras un intervalo, no ya de un día, sino de una hora; otros desaparecerán del todo.
- **Id en el catálogo:** `C3-EST-069` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro III, cap. XII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro III, cap. XII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Of these wrongs which drive you frantic, some will grow lighter after an interval, not of a day, but even of an hour: some will vanish altogether.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-070

- **Texto:** Todos guardamos la ira más tiempo del que sentimos el daño: cuánto mejor sería hacer lo contrario y no responder a un mal con otro.
- **Id en el catálogo:** `C3-EST-070` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro III, cap. XXVII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro III, cap. XXVII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** We all retain our anger longer than we feel our hurt: how far better it were to take the opposite course and not meet one mischief by another.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-071

- **Texto:** Quien busca saber lo que se dice de él y desentierra habladurías, aunque se hayan contado en secreto, destruye él mismo su propia paz.
- **Id en el catálogo:** `C3-EST-071` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la ira, libro III, cap. XI · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la ira
- **Ubicación:** Sobre la ira, libro III, cap. XI
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** He who seeks to know what is said about him, who digs up spiteful tales even if they were told in secret, is himself the destroyer of his own peace of mind.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-072

- **Texto:** ¿Cuál es, pues, la conclusión de todo esto? Que prefiero moderar alegrías antes que ahogar tristezas.
- **Id en el catálogo:** `C3-EST-072` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la vida feliz, cap. XXV · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la vida feliz
- **Ubicación:** Sobre la vida feliz, cap. XXV
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** What, then, is the upshot of all this? it is that I prefer to have to regulate joys than to stifle sorrows.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-073

- **Texto:** No hay desdicha en lo que la costumbre ha vuelto parte de nuestra naturaleza: poco a poco hallamos gusto en lo que primero hacíamos por necesidad.
- **Id en el catálogo:** `C3-EST-073` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la providencia, cap. IV · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la providencia
- **Ubicación:** Sobre la providencia, cap. IV
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** There is no unhappiness in what use has made part of one’s nature: by degrees men find pleasure in doing what they were first driven to do by necessity.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-074

- **Texto:** Esos bienes pasajeros que cambian de dueño, no sé dónde están; lo que es mío está conmigo, y lo seguirá estando.
- **Id en el catálogo:** `C3-EST-074` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre la firmeza del sabio, cap. VI · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre la firmeza del sabio
- **Ubicación:** Sobre la firmeza del sabio, cap. VI
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** As for those fleeting possessions which change their owners, I know not where they are; what belongs to myself is with me, and ever will be.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín). · Palabras que Séneca pone en boca de Estilpón.

### C3-EST-075

- **Texto:** Nada basta a la codicia, pero a la naturaleza le basta incluso con poco.
- **Id en el catálogo:** `C3-EST-075` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Consolación a Helvia, cap. X · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Consolación a Helvia
- **Ubicación:** Consolación a Helvia, cap. X
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Nothing is sufficient for covetous desire, but Nature can be satisfied even with scant measure.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-076

- **Texto:** Lo que depende de la naturaleza no se debilita con la espera, pero la pena se va borrando poco a poco con el tiempo.
- **Id en el catálogo:** `C3-EST-076` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Consolación a Marcia, cap. VIII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Consolación a Marcia
- **Ubicación:** Consolación a Marcia, cap. VIII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Moreover, that which depends upon nature is not weakened by delay, but grief is gradually effaced by time.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-077

- **Texto:** Es mejor disfrutar de placeres que pronto se van que no disfrutar de ninguno.
- **Id en el catálogo:** `C3-EST-077` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Consolación a Marcia, cap. XII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Consolación a Marcia
- **Ubicación:** Consolación a Marcia, cap. XII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** It is better to enjoy pleasures which soon leave us than to enjoy none at all.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-078

- **Texto:** Es un gran consuelo pensar que lo que nos ha pasado les pasó a todos antes que a nosotros y les pasará a todos después.
- **Id en el catálogo:** `C3-EST-078` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Consolación a Polibio, cap. I · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Consolación a Polibio
- **Ubicación:** Consolación a Polibio, cap. I
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** It is, therefore, a great consolation to reflect that what has happened to us has happened to everyone before us and will happen to everyone after us.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-079

- **Texto:** La naturaleza nos pide cierta medida de dolor, y la imaginación le añade algo más; pero en ningún caso te prohibiré llorar.
- **Id en el catálogo:** `C3-EST-079` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Consolación a Polibio, cap. XVIII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Consolación a Polibio
- **Ubicación:** Consolación a Polibio, cap. XVIII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Nature demands from us a certain amount of grief, our imagination adds some more to it; but I will never forbid you to mourn at all.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-080

- **Texto:** Quien recibe un favor con gratitud ya ha pagado el primer plazo.
- **Id en el catálogo:** `C3-EST-080` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre los beneficios, libro II, cap. XXII · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre los beneficios
- **Ubicación:** Sobre los beneficios, libro II, cap. XXII
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** He who receives a benefit with gratitude, repays the first instalment of it.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-081

- **Texto:** Es el recuerdo lo que nos hace agradecidos; y cuanto más esperamos, menos recordamos.
- **Id en el catálogo:** `C3-EST-081` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre los beneficios, libro III, cap. IV · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre los beneficios
- **Ubicación:** Sobre los beneficios, libro III, cap. IV
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** It is remembrance that makes men grateful; and the more men hope, the less they remember.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-082

- **Texto:** Nadie puede ser a la vez envidioso y agradecido: quien envidia se queja y está triste; quien agradece está alegre.
- **Id en el catálogo:** `C3-EST-082` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre los beneficios, libro III, cap. III · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre los beneficios
- **Ubicación:** Sobre los beneficios, libro III, cap. III
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Now no one can at the same time be both jealous and grateful, because those who are jealous are querulous and sad, while the grateful are joyous.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-083

- **Texto:** La naturaleza puede privarnos de sus dones en el futuro, pero no puede impedir que los hayamos disfrutado en el pasado.
- **Id en el catálogo:** `C3-EST-083` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre los beneficios, libro VI, cap. II · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre los beneficios
- **Ubicación:** Sobre los beneficios, libro VI, cap. II
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** She can cut off her blessings from us in the future, but she cannot prevent our having enjoyed them in the past.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín). · Se explicita el sujeto («la naturaleza»), nombrado dos oraciones antes.

### C3-EST-084

- **Texto:** Si alguien te diera unas pocas tierras, dirías que has recibido un favor; ¿puedes negar que la inmensa extensión de la tierra lo es?
- **Id en el catálogo:** `C3-EST-084` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre los beneficios, libro IV, cap. VI · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre los beneficios
- **Ubicación:** Sobre los beneficios, libro IV, cap. VI
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** If anyone gave you a few acres, you would say that you had received a benefit; can you deny that the boundless extent of the Earth is a benefit?
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-085

- **Texto:** ¿Qué hay más honroso que la gratitud? Las ocasiones de practicarla son tan amplias como la vida misma.
- **Id en el catálogo:** `C3-EST-085` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre los beneficios, libro IV, cap. XIX · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre los beneficios
- **Ubicación:** Sobre los beneficios, libro IV, cap. XIX
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Now what is more honourable than gratitude? the means of practising this virtue are as extensive as life itself.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-EST-086

- **Texto:** Hasta las fieras sienten la bondad, y no hay animal tan salvaje que el buen trato no lo amanse y se gane su cariño.
- **Id en el catálogo:** `C3-EST-086` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Aubrey Stewart.
- **Atribución en la app:** Séneca · Sobre los beneficios, libro I, cap. II · Traducción editorial para Strivo
- **Autor u obra:** Séneca · Sobre los beneficios
- **Ubicación:** Sobre los beneficios, libro I, cap. II
- **Idioma original:** latín (vía inglés)
- **Edición de referencia:** Dialogues (y On Benefits), trad. de Aubrey Stewart (1887–1900); edición de Standard Ebooks (CC0)
- **Fuente consultada:** https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart
- **Licencia:** Dominio público (edición digital CC0)
- **Derechos:** Séneca murió en 65; Aubrey Stewart (1844–1918), según el registro de autoridad de The Online Books Page. Dominio público en México. Standard Ebooks: CC0.
- **Texto fuente:** Even wild beasts feel kindness, nor is there any animal so savage that good treatment will not tame it and win love from it.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (latín).

### C3-BUD-001

- **Texto:** La intención va delante de todo; las cosas nacen de ella. Si hablas o actúas con intención limpia, la felicidad te sigue como una sombra fiel.
- **Id en el catálogo:** `C3-BUD-001` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 2 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp1-20/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Intention is the leader of things; intention is first, they’re made by intention. If with pure intent you speak or act, happiness follows you like a shadow that never leaves.
- **Texto pali:** Manopubbaṅgamā dhammā, manoseṭṭhā manomayā; Manasā ce pasannena, bhāsati vā karoti vā; Tato naṁ sukhamanveti, chāyāva anapāyinī.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-002

- **Texto:** «Me insultaron, me golpearon, me vencieron, me robaron». En quien no guarda ese rencor, el odio se apaga.
- **Id en el catálogo:** `C3-BUD-002` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 4 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp1-20/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “They abused me, they hit me! They beat me, they robbed me!” For those who bear no such grudge, hatred is laid to rest.
- **Texto pali:** Akkocchi maṁ avadhi maṁ, ajini maṁ ahāsi me; Ye ca taṁ nupanayhanti, veraṁ tesūpasammati.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-003

- **Texto:** Con empeño y atención, con mesura y dominio de sí, la persona sensata se hace una isla que ninguna crecida puede cubrir.
- **Id en el catálogo:** `C3-BUD-003` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 25 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 25
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp21-32/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** By hard work and diligence, by restraint and by self-control, a smart person would build an island that the floods cannot overflow.
- **Texto pali:** Uṭṭhānenappamādena, saṁyamena damena ca; Dīpaṁ kayirātha medhāvī, yaṁ ogho nābhikīrati.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-004

- **Texto:** La mente tiembla y se agita, difícil de cuidar y de frenar. Quien discierne la endereza, como el flechero endereza la flecha.
- **Id en el catálogo:** `C3-BUD-004` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 33 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 33
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp33-43/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** The mind quivers and quakes, hard to guard, hard to curb. The discerning straighten it out, like a fletcher an arrow.
- **Texto pali:** Phandanaṁ capalaṁ cittaṁ, dūrakkhaṁ dunnivārayaṁ; Ujuṁ karoti medhāvī, usukārova tejanaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-005

- **Texto:** La mente, tan difícil de ver y tan sutil, se posa donde quiere. Quien discierne la cuida, y una mente cuidada trae felicidad.
- **Id en el catálogo:** `C3-BUD-005` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 36 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 36
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp33-43/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** So hard to see, so subtle, alighting where it will; the discerning protect the mind, a guarded mind leads to bliss.
- **Texto pali:** Sududdasaṁ sunipuṇaṁ, yatthakāmanipātinaṁ; Cittaṁ rakkhetha medhāvī, cittaṁ guttaṁ sukhāvahaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-006

- **Texto:** Una mente bien orientada te hace más bien que tu madre, tu padre o cualquier otro pariente.
- **Id en el catálogo:** `C3-BUD-006` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 43 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 43
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp33-43/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** A rightly directed mind would do you more good than your mother or father or any other relative.
- **Texto pali:** Na taṁ mātā pitā kayirā, aññe vāpi ca ñātakā; Sammāpaṇihitaṁ cittaṁ, seyyaso naṁ tato kare.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-007

- **Texto:** El perfume de las flores no va contra el viento, ni el del sándalo o el jazmín; el de las personas buenas sí, y llega a todas partes.
- **Id en el catálogo:** `C3-BUD-007` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 54 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 54
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp44-59/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** The fragrance of flowers doesn’t spread upwind, nor sandalwood, pinwheel, or jasmine; but the fragrance of the good spreads upwind; a true person’s virtue spreads in every direction.
- **Texto pali:** Na pupphagandho paṭivātameti, Na candanaṁ tagaramallikā vā; Satañca gandho paṭivātameti, Sabbā disā sappuriso pavāyati.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se omite «pinwheel» (tagara, planta aromática poco conocida) de la enumeración de perfumes.

### C3-BUD-008

- **Texto:** En un montón de basura tirado junto al camino puede brotar un loto, fragante y hermoso.
- **Id en el catálogo:** `C3-BUD-008` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 58 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 58
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp44-59/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** From a heap of trash discarded on the highway, a lotus might blossom, fragrant and delightful.
- **Texto pali:** Yathā saṅkāradhānasmiṁ, ujjhitasmiṁ mahāpathe; Padumaṁ tattha jāyetha, sucigandhaṁ manoramaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · El verso 59 continúa la comparación; el 58 es una oración completa y se entiende por sí mismo.

### C3-BUD-009

- **Texto:** Quien es despierto y acompaña a los sabios aunque sea una hora comprende pronto la enseñanza, como la lengua el sabor de la sopa.
- **Id en el catálogo:** `C3-BUD-009` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 65 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 65
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp60-75/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** If a clever person attends to the wise even just for an hour or so, they swiftly understand the teaching, like a tongue the taste of the soup.
- **Texto pali:** Muhuttamapi ce viññū, paṇḍitaṁ payirupāsati; Khippaṁ dhammaṁ vijānāti, jivhā sūparasaṁ yathā.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-010

- **Texto:** Es bueno hacer aquello que después no pesa, lo que alegra y anima, y cuyo fruto te acompaña.
- **Id en el catálogo:** `C3-BUD-010` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 68 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 68
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp60-75/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** It is good to do a deed that doesn’t plague you later on, that gladdens and cheers, as its effect stays with you.
- **Texto pali:** Tañca kammaṁ kataṁ sādhu, yaṁ katvā nānutappati; Yassa patīto sumano, vipākaṁ paṭisevati.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-011

- **Texto:** Como el viento no mueve una roca maciza, la crítica y el elogio no alteran al sabio.
- **Id en el catálogo:** `C3-BUD-011` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 81 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 81
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp76-89/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** As the wind cannot stir a solid mass of rock, so too blame and praise do not affect the wise.
- **Texto pali:** Selo yathā ekaghano, vātena na samīrati; Evaṁ nindāpasaṁsāsu, na samiñjanti paṇḍitā.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-012

- **Texto:** Tocados por la tristeza o por la alegría, los sabios no se muestran ni abatidos ni eufóricos.
- **Id en el catálogo:** `C3-BUD-012` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 83, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 83, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp76-89/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Though touched by sadness or happiness, the astute appear neither depressed nor elated.
- **Texto pali:** Sukhena phuṭṭhā atha vā dukhena, Na uccāvacaṁ paṇḍitā dassayanti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Segunda mitad del verso; la primera habla de renuncia y no es necesaria para el sentido.

### C3-BUD-013

- **Texto:** Más que mil palabras vacías vale una palabra con sentido que, al oírla, trae paz.
- **Id en el catálogo:** `C3-BUD-013` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 100 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 100
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp100-115/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Better than a thousand meaningless sayings is a single meaningful saying, hearing which brings you peace.
- **Texto pali:** Sahassamapi ce vācā, anatthapadasaṁhitā; Ekaṁ atthapadaṁ seyyo, yaṁ sutvā upasammati.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-014

- **Texto:** El mayor vencedor no es quien vence a un millón de personas en batalla, sino quien se vence a sí mismo.
- **Id en el catálogo:** `C3-BUD-014` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 103 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 103
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp100-115/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** The supreme conqueror is not he who conquers a million men in battle, but he who conquers a single man: himself.
- **Texto pali:** Yo sahassaṁ sahassena, saṅgāme mānuse jine; Ekañca jeyyamattānaṁ, sa ve saṅgāmajuttamo.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · El inglés dice «a million men»; se traduce «personas».

### C3-BUD-015

- **Texto:** Más vale vivir un día viendo cómo las cosas surgen y se desvanecen que cien años sin verlo.
- **Id en el catálogo:** `C3-BUD-015` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 113 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 113
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp100-115/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Better to live a single day seeing rise and fall than to live a hundred years blind to rise and fall.
- **Texto pali:** Yo ca vassasataṁ jīve, apassaṁ udayabbayaṁ; Ekāhaṁ jīvitaṁ seyyo, passato udayabbayaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-016

- **Texto:** Gota a gota se llena el cántaro; poco a poco, quien está atento se llena de bondad.
- **Id en el catálogo:** `C3-BUD-016` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 122, líneas 3–6 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 122, líneas 3–6
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp116-128/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** The pot is filled with water falling drop by drop; the attentive one is filled with goodness piled up bit by bit.
- **Texto pali:** Udabindunipātena, udakumbhopi pūrati; Dhīro pūrati puññassa, thokaṁ thokampi ācinaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se omiten las dos primeras líneas, que son exhortativas («Think not lightly of goodness»).

### C3-BUD-017

- **Texto:** Los carros lujosos de los reyes se gastan, y también este cuerpo envejece; pero la verdad de los buenos no envejece.
- **Id en el catálogo:** `C3-BUD-017` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 151 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 151
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp146-156/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Fancy chariots of kings wear out, and even this body gets old. But the truth of the good never gets old— so the good proclaim to the good.
- **Texto pali:** Jīranti ve rājarathā sucittā, Atho sarīrampi jaraṁ upeti; Satañca dhammo na jaraṁ upeti, Santo have sabbhi pavedayanti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se omite la última línea («so the good proclaim to the good»), que no añade sentido; si se prefiere completa, ver fuenteTexto.

### C3-BUD-018

- **Texto:** Si supieras que eres alguien querido, te cuidarías muy bien.
- **Id en el catálogo:** `C3-BUD-018` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 157, líneas 1–2 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 157, líneas 1–2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp157-166/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** If you knew your self as beloved, you’d look after it so well.
- **Texto pali:** Attānañce piyaṁ jaññā, rakkheyya naṁ surakkhitaṁ;
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Primera mitad del verso; la segunda (vigilias de la noche) necesita contexto monástico.

### C3-BUD-019

- **Texto:** Cada quien es su propio refugio; ¿qué otro refugio podría haber? Quien se ha templado a sí mismo encuentra un refugio difícil de hallar.
- **Id en el catálogo:** `C3-BUD-019` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 160 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 160
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp157-166/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** One is indeed the lord of oneself, for who else would be one’s lord? By means of a well-tamed self, one gains a lord that’s rare indeed.
- **Texto pali:** Attā hi attano nātho, ko hi nātho paro siyā; Attanā hi sudantena, nāthaṁ labhati dullabhaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Sujato traduce «lord»; el pali «nātha» es protector o refugio. Se usa «refugio» para evitar «Señor», marca cristiana en Strivo.

### C3-BUD-020

- **Texto:** Quien cubre con el bien el mal que hizo ilumina este mundo como la luna libre de nubes.
- **Id en el catálogo:** `C3-BUD-020` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 173 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 173
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp167-178/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Someone whose bad deed is supplanted by the good, shines upon this world, like the moon freed from clouds.
- **Texto pali:** Yassa pāpaṁ kataṁ kammaṁ, kusalena pidhīyati; Somaṁ lokaṁ pabhāseti, abbhā muttova candimā.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-021

- **Texto:** La victoria engendra enemistad y el vencido duerme mal. Quien está en paz duerme tranquilo, más allá de ganar o perder.
- **Id en el catálogo:** `C3-BUD-021` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 201 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 201
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp197-208/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Victory breeds enmity; the defeated sleep badly. The peaceful sleep at ease, having left victory and defeat behind.
- **Texto pali:** Jayaṁ veraṁ pasavati, dukkhaṁ seti parājito; Upasanto sukhaṁ seti, hitvā jayaparājayaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-022

- **Texto:** La salud es el mayor regalo; el contento, la mayor riqueza; la confianza, la mejor familia; el nirvana, la mayor felicidad.
- **Id en el catálogo:** `C3-BUD-022` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 204 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 204
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp197-208/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Health is the ultimate blessing; contentment, the ultimate wealth; trust is the ultimate family; extinguishment, the ultimate happiness.
- **Texto pali:** Ārogyaparamā lābhā, Santuṭṭhiparamaṁ dhanaṁ; Vissāsaparamā ñāti, Nibbānaṁ paramaṁ sukhaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-023

- **Texto:** Del apego nace la pena, del apego nace el miedo; quien está libre de apego no siente pena, y menos aún miedo.
- **Id en el catálogo:** `C3-BUD-023` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 213 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 213
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp209-220/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Sorrow springs from attachment, fear springs from attachment; one free from attachment has no sorrow, let alone fear.
- **Texto pali:** Pemato jāyatī soko, pemato jāyatī bhayaṁ; Pemato vippamuttassa, natthi soko kuto bhayaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Marcada como no apta con ánimo bajo: puede leerse como que el malestar depende solo del juicio propio.

### C3-BUD-024

- **Texto:** No hubo, no habrá ni hay hoy nadie que sea del todo elogiado o del todo criticado.
- **Id en el catálogo:** `C3-BUD-024` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 228 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 228
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp221-234/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** There never was, nor will be, nor is there today, someone who is wholly praised or wholly blamed.
- **Texto pali:** Na cāhu na ca bhavissati, na cetarahi vijjati; Ekantaṁ nindito poso, ekantaṁ vā pasaṁsito.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-025

- **Texto:** La persona sensata va limpiando sus manchas poco a poco, momento a momento, como el platero purifica la plata.
- **Id en el catálogo:** `C3-BUD-025` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 239 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 239
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp235-255/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** A smart person would purge their own stains gradually, bit by bit, moment by moment, like a smith smelting silver.
- **Texto pali:** Anupubbena medhāvī, thokaṁ thokaṁ khaṇe khaṇe; Kammāro rajatasseva, niddhame malamattano.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-026

- **Texto:** Es fácil ver las faltas ajenas y difícil ver las propias.
- **Id en el catálogo:** `C3-BUD-026` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 252, líneas 1–2 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 252, líneas 1–2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp235-255/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** It’s easy to see the faults of others, hard to see one’s own.
- **Texto pali:** Sudassaṁ vajjamaññesaṁ, attano pana duddasaṁ;
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Primera oración del verso; el resto es una comparación con un tramposo.

### C3-BUD-027

- **Texto:** Ninguna cosa condicionada es eterna; quienes han despertado no se inquietan.
- **Id en el catálogo:** `C3-BUD-027` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 255, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 255, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp235-255/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** No conditions last forever, the Awakened Ones are not shaken.
- **Texto pali:** Saṅkhārā sassatā natthi, natthi buddhānamiñjitaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Segunda mitad del verso; la primera («no hay verdadero asceta fuera de aquí») es doctrinal y se omite.

### C3-BUD-028

- **Texto:** No eres sabio por hablar mucho. A quien vive seguro, sin enemistad y sin miedo, se le llama sabio.
- **Id en el catálogo:** `C3-BUD-028` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 258 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 258
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp256-272/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** You’re not an astute scholar just because you speak a lot. One who is secure, free of enmity and fear, is said to be astute.
- **Texto pali:** Na tena paṇḍito hoti, yāvatā bahu bhāsati; Khemī averī abhayo, “paṇḍito”ti pavuccati.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-029

- **Texto:** Las personas buenas brillan desde lejos, como las cumbres del Himalaya.
- **Id en el catálogo:** `C3-BUD-029` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 304, líneas 1–2 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 304, líneas 1–2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp290-305/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** The good shine from afar, like the Himalayan peaks,
- **Texto pali:** Dūre santo pakāsenti, himavantova pabbato;
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Primera mitad del verso; la segunda habla de los malvados.

### C3-BUD-030

- **Texto:** Antes mi mente iba adonde quería, donde le gustaba, como le placía. Ahora la guiaré con cuidado, como el domador con su garfio guía al elefante.
- **Id en el catálogo:** `C3-BUD-030` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 326 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 326
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp320-333/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** In the past my mind wandered how it wished, where it liked, as it pleased. Now I’ll carefully guide it, as a trainer with a hook guides a rutting elephant.
- **Texto pali:** Idaṁ pure cittamacāri cārikaṁ, Yenicchakaṁ yatthakāmaṁ yathāsukhaṁ; Tadajjahaṁ niggahessāmi yoniso, Hatthippabhinnaṁ viya aṅkusaggaho.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se omite «rutting» (en celo) del elefante por brevedad.

### C3-BUD-031

- **Texto:** Es una dicha un amigo cuando hace falta, y estar contento con lo que hay; una dicha el bien hecho al final de la vida, y dejar atrás todo sufrimiento.
- **Id en el catálogo:** `C3-BUD-031` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 331 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 331
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp320-333/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** A friend in need is a blessing; it’s a blessing to be content with whatever; good deeds are a blessing at the end of life, and giving up all suffering is a blessing.
- **Texto pali:** Atthamhi jātamhi sukhā sahāyā, Tuṭṭhī sukhā yā itarītarena; Puññaṁ sukhaṁ jīvitasaṅkhayamhi, Sabbassa dukkhassa sukhaṁ pahānaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-032

- **Texto:** Quien vence esta sed, tan difícil de superar en el mundo, ve caer sus penas como una gota de una hoja de loto.
- **Id en el catálogo:** `C3-BUD-032` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 336 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 336
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp334-359/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** But whoever prevails over this wretched craving, so hard to get over in the world, their sorrows fall from them, like a drop from a lotus-leaf.
- **Texto pali:** Yo cetaṁ sahate jammiṁ, taṇhaṁ loke duraccayaṁ; Sokā tamhā papatanti, udabinduva pokkharā.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Wretched craving» se traduce «esta sed». El verso empieza con «But» en inglés; se omite.

### C3-BUD-033

- **Texto:** Allí donde se retira el deseo de dañar, ahí mismo se calma el sufrimiento.
- **Id en el catálogo:** `C3-BUD-033` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Dhammapada, verso 390, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Dhammapada
- **Ubicación:** Dhammapada, verso 390, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/dhp383-423/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** From wherever a cruel wish recoils, right there suffering subsides.
- **Texto pali:** Yato yato hiṁsamano nivattati, Tato tato sammatimeva dukkhaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Segunda mitad del verso; la primera se refiere al brahmán.

### C3-BUD-034

- **Texto:** Viví contenida en el cuerpo, en la palabra y en la mente. Arranqué el deseo de raíz y ahora estoy serena y en calma.
- **Id en el catálogo:** `C3-BUD-034` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Therīgāthā 1.15 (Uttarā), verso único · Traducción editorial para Strivo
- **Autor u obra:** Therīgāthā
- **Ubicación:** Therīgāthā 1.15 (Uttarā), verso único
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/thig1.15/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** I was restrained in body, speech, and mind. Having plucked out craving, root and all, I’m cooled and quenched.
- **Texto pali:** “Kāyena saṁvutā āsiṁ, vācāya uda cetasā; Samūlaṁ taṇhamabbuyha, sītibhūtāmhi nibbutā”ti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-035

- **Texto:** ¿Qué importa ser mujer, cuando la mente está serena y el saber está presente al ver con claridad el Dhamma?
- **Id en el catálogo:** `C3-BUD-035` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Therīgāthā 3.8 (Somā), verso 2 · Traducción editorial para Strivo
- **Autor u obra:** Therīgāthā
- **Ubicación:** Therīgāthā 3.8 (Somā), verso 2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/thig3.8/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “What difference does womanhood make when the mind is serene, and knowledge is present as you rightly discern the Dhamma.
- **Texto pali:** “Itthibhāvo no kiṁ kayirā, cittamhi susamāhite; Ñāṇamhi vattamānamhi, sammā dhammaṁ vipassato.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Respuesta de Somā a Māra; se entiende sin el verso anterior.

### C3-BUD-036

- **Texto:** Al lavarme los pies miré el agua: vi cómo corría de lo alto a lo bajo. Mi mente se serenó, como un buen caballo de raza.
- **Id en el catálogo:** `C3-BUD-036` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Therīgāthā 5.10 (Paṭācārā), verso 3 y verso 4, líneas 1–2 · Traducción editorial para Strivo
- **Autor u obra:** Therīgāthā
- **Ubicación:** Therīgāthā 5.10 (Paṭācārā), verso 3 y verso 4, líneas 1–2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/thig5.10/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Having washed my feet, I took note of the water, seeing the foot-washing water flowing from high ground to low. My mind became serene, like a fine thoroughbred steed.
- **Texto pali:** Pāde pakkhālayitvāna, udakesu karomahaṁ; Pādodakañca disvāna, thalato ninnamāgataṁ. Tato cittaṁ samādhesiṁ, assaṁ bhadraṁvajāniyaṁ;
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se corta el verso 4 tras «like a fine thoroughbred steed»; lo que sigue (la lámpara) empieza otra oración.

### C3-BUD-037

- **Texto:** Me insulten o me elogien, sienta placer o dolor, permanezco atenta.
- **Id en el catálogo:** `C3-BUD-037` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Therīgāthā 14.1 (Subhā), verso 23, líneas 1–2 · Traducción editorial para Strivo
- **Autor u obra:** Therīgāthā
- **Ubicación:** Therīgāthā 14.1 (Subhā), verso 23, líneas 1–2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/thig14.1/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** No matter if I am reviled or praised, or feel pleasure or pain: I stay mindful.
- **Texto pali:** Mayhañhi akkuṭṭhavandite, Sukhadukkhe ca satī upaṭṭhitā;
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Primera oración del verso; la segunda («conditions are ugly») se omite.

### C3-BUD-038

- **Texto:** Mirando cómo funciona el mundo, los sabios han alabado la buena amistad: junto a buenos amigos, hasta el necio se vuelve sabio.
- **Id en el catálogo:** `C3-BUD-038` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Therīgāthā 10.1 (Kisāgotamī), verso 1 · Traducción editorial para Strivo
- **Autor u obra:** Therīgāthā
- **Ubicación:** Therīgāthā 10.1 (Kisāgotamī), verso 1
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/thig10.1/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “Pointing out how the world works, the sages have praised good friendship. Associating with good friends, even a fool becomes astute.
- **Texto pali:** “Kalyāṇamittatā muninā, lokaṁ ādissa vaṇṇitā; Kalyāṇamitte bhajamāno, api bālo paṇḍito assa.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · El pali dice «muninā» (el sabio, en singular); se sigue el plural de Sujato.

### C3-BUD-039

- **Texto:** La amabilidad con el mundo es felicidad para quien no daña a ningún ser vivo.
- **Id en el catálogo:** `C3-BUD-039` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Udāna 2.1 (Mucalindasutta), estrofa 1, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Udāna
- **Ubicación:** Udāna 2.1 (Mucalindasutta), estrofa 1, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/ud2.1/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Kindness for the world is happiness for one who’d not harm a living creature.
- **Texto pali:** Abyāpajjaṁ sukhaṁ loke, pāṇabhūtesu saṁyamo.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Amabilidad hacia los demás; se usa el eje más cercano.

### C3-BUD-040

- **Texto:** Si la mente es como una roca, firme e inmóvil, sin apego a lo atrayente ni enojo ante lo molesto, ¿de dónde le llegará el sufrimiento?
- **Id en el catálogo:** `C3-BUD-040` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Udāna 4.4 (Yakkhapahārasutta), estrofa final · Traducción editorial para Strivo
- **Autor u obra:** Udāna
- **Ubicación:** Udāna 4.4 (Yakkhapahārasutta), estrofa final
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/ud4.4/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “One whose mind is like a rock, steady, never shaking, free of desire for desirable things, not getting annoyed when things are annoying: from where will suffering strike one whose mind is developed like this?”
- **Texto pali:** “Yassa selūpamaṁ cittaṁ, ṭhitaṁ nānupakampati; Virattaṁ rajanīyesu, kopaneyye na kuppati; Yassevaṁ bhāvitaṁ cittaṁ, kuto taṁ dukkhamessatī”ti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-041

- **Texto:** El sabio de mente alta, atento, que aprende el camino de la sabiduría, no tiene penas: vive sereno y atento en todo momento.
- **Id en el catálogo:** `C3-BUD-041` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Udāna 4.7 (Sāriputtasutta), estrofa final · Traducción editorial para Strivo
- **Autor u obra:** Udāna
- **Ubicación:** Udāna 4.7 (Sāriputtasutta), estrofa final
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/ud4.7/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “A sage of higher consciousness, diligent, training in the ways of sagacity: there are no sorrows for the unaffected, calm and ever mindful.”
- **Texto pali:** “Adhicetaso appamajjato, Munino monapathesu sikkhato; Sokā na bhavanti tādino, Upasantassa sadā satīmato”ti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Ever mindful» (pali «sadā») se traduce «en todo momento».

### C3-BUD-042

- **Texto:** Al recorrer con la mente todas partes, no hay nadie más querido que uno mismo. Así se quiere cada cual; por eso quien se quiere no daña a otro.
- **Id en el catálogo:** `C3-BUD-042` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Udāna 5.1 (Piyatarasutta), estrofa final · Traducción editorial para Strivo
- **Autor u obra:** Udāna
- **Ubicación:** Udāna 5.1 (Piyatarasutta), estrofa final
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/ud5.1/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “Having explored every quarter with the mind, one finds no one dearer than oneself. Likewise for others, each holds themselves dear; so one who desires self-knowledge <j>would harm no other.”
- **Texto pali:** “Sabbā disā anuparigamma cetasā, Nevajjhagā piyataramattanā kvaci; Evaṁ piyo puthu attā paresaṁ, Tasmā na hiṁse paramattakāmo”ti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Sujato traduce «one who desires self-knowledge»; el pali «attakāmo» es «quien se quiere a sí mismo», que es lo que se sigue aquí. Conviene revisar este matiz.

### C3-BUD-043

- **Texto:** Pensamientos pequeños y sutiles brotan y se agitan en la mente. Sin entenderlos, la mente extraviada corre de una cosa a otra.
- **Id en el catálogo:** `C3-BUD-043` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Udāna 4.1 (Meghiyasutta), estrofa final, primera mitad · Traducción editorial para Strivo
- **Autor u obra:** Udāna
- **Ubicación:** Udāna 4.1 (Meghiyasutta), estrofa final, primera mitad
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/ud4.1/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “Lesser thoughts and subtle thoughts arise, springing up in the mind. Not understanding these thoughts, one with mind astray runs from one thing to the next.
- **Texto pali:** “Khuddā vitakkā sukhumā vitakkā, Anugatā manaso uppilāvā; Ete avidvā manaso vitakke, Hurā huraṁ dhāvati bhantacitto.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Primera de las dos estrofas finales; es una oración completa.

### C3-BUD-044

- **Texto:** ¿Para qué un pozo si hay agua en todo momento? Quien ha cortado el deseo de raíz, ¿qué saldría a buscar?
- **Id en el catálogo:** `C3-BUD-044` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Udāna 7.9 (Udapānasutta), estrofa final · Traducción editorial para Strivo
- **Autor u obra:** Udāna
- **Ubicación:** Udāna 7.9 (Udapānasutta), estrofa final
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/ud7.9/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “What difference would a well make if water is there all the time? Having cut off craving at the root, who would go out on a quest?”
- **Texto pali:** “Kiṁ kayirā udapānena, Āpā ce sabbadā siyuṁ; Taṇhāya mūlato chetvā, Kissa pariyesanaṁ care”ti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-045

- **Texto:** Para quien depende hay temblor; para quien no depende, no lo hay. Donde no hay temblor, hay calma.
- **Id en el catálogo:** `C3-BUD-045` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Udāna 8.4 (Catutthanibbānapaṭisaṁyuttasutta), sentencia final, primeras tres frases · Traducción editorial para Strivo
- **Autor u obra:** Udāna
- **Ubicación:** Udāna 8.4 (Catutthanibbānapaṭisaṁyuttasutta), sentencia final, primeras tres frases
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/ud8.4/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “For the dependent there is quivering. For the independent there’s no quivering. When there’s no quivering there is tranquility.
- **Texto pali:** “Nissitassa calitaṁ, anissitassa calitaṁ natthi. Calite asati passaddhi,
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se toman las tres primeras frases de la sentencia; el resto es doctrinal (renacimiento).

### C3-BUD-046

- **Texto:** Como sea que lo imagines, resulta ser otra cosa.
- **Id en el catálogo:** `C3-BUD-046` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Udāna 3.10 (Lokasutta), estrofa final, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Udāna
- **Ubicación:** Udāna 3.10 (Lokasutta), estrofa final, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/ud3.10/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** For however you imagine it, it turns out to be something else.
- **Texto pali:** Yena yena hi maññati, Tato taṁ hoti aññathā.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Oración completa dentro de la estrofa; las líneas anteriores hablan del mundo «nacido en el tormento».

### C3-BUD-047

- **Texto:** Querer con un corazón sin odio aunque sea a un único ser te hace una buena persona; quien siente compasión por todos los seres hace un gran bien.
- **Id en el catálogo:** `C3-BUD-047` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Itivuttaka 27 (Mettābhāvanāsutta), verso 2 · Traducción editorial para Strivo
- **Autor u obra:** Itivuttaka
- **Ubicación:** Itivuttaka 27 (Mettābhāvanāsutta), verso 2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/iti27/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Loving just one creature with a hateless heart makes you a good person. Sympathetic for all creatures, a noble one creates abundant merit.
- **Texto pali:** Ekampi ce pāṇamaduṭṭhacitto, Mettāyati kusalo tena hoti; Sabbe ca pāṇe manasānukampaṁ, Pahūtamariyo pakaroti puññaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Amabilidad hacia los demás; se usa el eje más cercano.

### C3-BUD-048

- **Texto:** Quien envuelve incienso de sándalo en hojas deja las hojas perfumadas: así pasa al estar cerca de personas sabias.
- **Id en el catálogo:** `C3-BUD-048` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Itivuttaka 76 (Sukhapatthanāsutta), verso 6 · Traducción editorial para Strivo
- **Autor u obra:** Itivuttaka
- **Ubicación:** Itivuttaka 76 (Sukhapatthanāsutta), verso 6
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/iti76/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** But one who wraps sandalwood incense in leaves makes the leaves fragrant— so it is when associating with the attentive.
- **Texto pali:** Tagarañca palāsena, yo naro upanayhati; Pattāpi surabhi vāyanti, evaṁ dhīrūpasevanā.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · El inglés empieza con «But»; se omite.

### C3-BUD-049

- **Texto:** Al caminar o estar de pie, sentado o acostado, con la mente recogida por dentro, no se encuentra más que paz.
- **Id en el catálogo:** `C3-BUD-049` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Itivuttaka 86 (Dhammānudhammapaṭipannasutta), verso 2 · Traducción editorial para Strivo
- **Autor u obra:** Itivuttaka
- **Ubicación:** Itivuttaka 86 (Dhammānudhammapaṭipannasutta), verso 2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/iti86/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Whether walking or standing, sitting or lying down, with mind collected inside, they attain only peace.”
- **Texto pali:** Caraṁ vā yadi vā tiṭṭhaṁ, nisinno uda vā sayaṁ; Ajjhattaṁ samayaṁ cittaṁ, santimevādhigacchatī”ti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Only peace» se traduce «no se encuentra más que paz» para evitar «solo».

### C3-BUD-050

- **Texto:** Quien calma pensamientos y cavilaciones, como la lluvia asienta el polvo, con el corazón en calma toca aquí mismo la paz.
- **Id en el catálogo:** `C3-BUD-050` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Itivuttaka 87 (Andhakaraṇasutta), verso, líneas 3–6 · Traducción editorial para Strivo
- **Autor u obra:** Itivuttaka
- **Ubicación:** Itivuttaka 87 (Andhakaraṇasutta), verso, líneas 3–6
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/iti87/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Quelling such thoughts and considerations, like rain on the dust, with a heart calmed of thought, you’ll touch the state of peace right here.”
- **Texto pali:** Sa ve vitakkāni vicāritāni, Sameti vuṭṭhīva rajaṁ samūhataṁ; Sa ve vitakkūpasamena cetasā, Idheva so santipadaṁ samajjhagā”ti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se omiten las dos líneas exhortativas iniciales. Sujato usa segunda persona («you’ll touch»); el pali («so … samajjhagā») es tercera persona, que es la que se sigue.

### C3-BUD-051

- **Texto:** Quien ha dejado el odio no se enoja aunque lo provoquen: el odio se le cae como un fruto maduro de su tallo.
- **Id en el catálogo:** `C3-BUD-051` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Itivuttaka 88 (Antarāmalasutta), verso 6 · Traducción editorial para Strivo
- **Autor u obra:** Itivuttaka
- **Ubicación:** Itivuttaka 88 (Antarāmalasutta), verso 6
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/iti88/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Those who have given up hate, don’t get angry even when provoked. Hate falls off them like a ripe palmyra fruit from its stem.
- **Texto pali:** Yo ca dosaṁ pahantvāna, dosaneyye na dussati; Doso pahīyate tamhā, tālapakkaṁva bandhanā.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Palmyra fruit» (fruto de la palmera de palmira) se traduce «fruto maduro».

### C3-BUD-052

- **Texto:** Quien ha comprendido a fondo la enseñanza se serena, quieto como un lago sin viento.
- **Id en el catálogo:** `C3-BUD-052` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Itivuttaka 92 (Saṅghāṭikaṇṇasutta), verso 2 · Traducción editorial para Strivo
- **Autor u obra:** Itivuttaka
- **Ubicación:** Itivuttaka 92 (Saṅghāṭikaṇṇasutta), verso 2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/iti92/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** An astute person who has understood and directly known the teaching, grows calm, as unperturbed as a lake free of wind.
- **Texto pali:** Yo ca dhammamabhiññāya, dhammamaññāya paṇḍito; Rahadova nivāte ca, anejo vūpasammati.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-053

- **Texto:** Quien se contenta con lo sencillo, lo poco y lo fácil de hallar no se inquieta por el techo, la ropa, la comida o la bebida, y nada le estorba.
- **Id en el catálogo:** `C3-BUD-053` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Itivuttaka 101 (Sulabhasutta), verso 1 · Traducción editorial para Strivo
- **Autor u obra:** Itivuttaka
- **Ubicación:** Itivuttaka 101 (Sulabhasutta), verso 1
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/iti101/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “When one is content with what’s blameless, trifling, and easy to find, they don’t get distressed about lodgings, robes, food, and drink, and they’re not obstructed anywhere.
- **Texto pali:** “Anavajjena tuṭṭhassa, appena sulabhena ca; Na senāsanamārabbha, cīvaraṁ pānabhojanaṁ; Vighāto hoti cittassa, disā nappaṭihaññati.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Blameless» se traduce «lo sencillo».

### C3-BUD-054

- **Texto:** Los padres hacen mucho por sus hijos: los crían, los alimentan y les muestran el mundo.
- **Id en el catálogo:** `C3-BUD-054` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Itivuttaka 106 (Sabrahmakasutta), prosa, última frase de la sección 3 · Traducción editorial para Strivo
- **Autor u obra:** Itivuttaka
- **Ubicación:** Itivuttaka 106 (Sabrahmakasutta), prosa, última frase de la sección 3
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/iti106/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Parents are very helpful to their children, they raise them, nurture them, and show them the world.”
- **Texto pali:** Bahukārā, bhikkhave, mātāpitaro puttānaṁ āpādakā posakā imassa lokassa dassetāro”ti.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · La fuente termina con comillas de cierre del discurso.

### C3-BUD-055

- **Texto:** Que estén felices y a salvo. Que todos los seres sean felices.
- **Id en el catálogo:** `C3-BUD-055` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 1.8 (Mettasutta), verso 3, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 1.8 (Mettasutta), verso 3, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp1.8/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** May they be happy and safe! May all beings be happy!
- **Texto pali:** Sukhino va khemino hontu, Sabbasattā bhavantu sukhitattā.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Deseo, no mandato. Amabilidad hacia los demás; se usa el eje más cercano.

### C3-BUD-056

- **Texto:** Como una madre protegería con su vida a su hijo, a su único hijo, así, hacia todos los seres, que se abra un corazón sin límites.
- **Id en el catálogo:** `C3-BUD-056` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 1.8 (Mettasutta), verso 7 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 1.8 (Mettasutta), verso 7
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp1.8/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Even as a mother would protect with her life her child, her only child, so too for all creatures unfold a boundless heart.
- **Texto pali:** Mātā yathā niyaṁ puttam Āyusā ekaputtamanurakkhe; Evampi sabbabhūtesu, Mānasaṁ bhāvaye aparimāṇaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Sujato usa imperativo («unfold»); el pali es optativo («bhāvaye»), que se traduce como deseo («que se abra»). Amabilidad hacia los demás; se usa el eje más cercano.

### C3-BUD-057

- **Texto:** La educación y un oficio, la disciplina bien aprendida y la palabra bien dicha: esa es la mayor dicha.
- **Id en el catálogo:** `C3-BUD-057` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 2.4 (Maṅgalasutta), verso 5 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 2.4 (Maṅgalasutta), verso 5
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp2.4/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Education and a craft, discipline and training, and well-spoken speech: this is the highest blessing.
- **Texto pali:** Bāhusaccañca sippañca, vinayo ca susikkhito; Subhāsitā ca yā vācā, etaṁ maṅgalamuttamaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Blessing» (pali «maṅgala») se traduce «dicha».

### C3-BUD-058

- **Texto:** Cuidar de madre y padre, acompañar a hijos y pareja, y un trabajo sin agobios: esa es la mayor dicha.
- **Id en el catálogo:** `C3-BUD-058` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 2.4 (Maṅgalasutta), verso 6 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 2.4 (Maṅgalasutta), verso 6
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp2.4/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Caring for mother and father, kindness to children and partners, and unstressful work: this is the highest blessing.
- **Texto pali:** Mātāpitu upaṭṭhānaṁ, puttadārassa saṅgaho; Anākulā ca kammantā, etaṁ maṅgalamuttamaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Kindness to» (pali «saṅgaho», apoyo) se traduce «acompañar».

### C3-BUD-059

- **Texto:** El respeto y la humildad, el contento y la gratitud, y escuchar la enseñanza a su tiempo: esa es la mayor dicha.
- **Id en el catálogo:** `C3-BUD-059` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 2.4 (Maṅgalasutta), verso 9 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 2.4 (Maṅgalasutta), verso 9
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp2.4/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Respect and placidity, contentment and gratitude, and timely listening to the teaching: this is the highest blessing.
- **Texto pali:** Gāravo ca nivāto ca, santuṭṭhi ca kataññutā; Kālena dhammassavanaṁ, etaṁ maṅgalamuttamaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Placidity» (pali «nivāto», humildad) se traduce «humildad».

### C3-BUD-060

- **Texto:** Aunque lo toquen los vaivenes del mundo, su mente no tiembla; sin pena, sin mancha, a salvo: esa es la mayor dicha.
- **Id en el catálogo:** `C3-BUD-060` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 2.4 (Maṅgalasutta), verso 12 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 2.4 (Maṅgalasutta), verso 12
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp2.4/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Though touched by worldly conditions, their mind does not tremble; sorrowless, stainless, secure: this is the highest blessing.
- **Texto pali:** Phuṭṭhassa lokadhammehi, Cittaṁ yassa na kampati; Asokaṁ virajaṁ khemaṁ, Etaṁ maṅgalamuttamaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-061

- **Texto:** Alabamos la dicha de tener un buen amigo; es bueno estar con amigos iguales o mejores que uno.
- **Id en el catálogo:** `C3-BUD-061` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 1.3 (Khaggavisāṇasutta), verso 13, líneas 1–2 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 1.3 (Khaggavisāṇasutta), verso 13, líneas 1–2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp1.3/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Clearly we praise the blessing of a friend, it’s good to be with friends your equal or better.
- **Texto pali:** “Addhā pasaṁsāma sahāyasampadaṁ, Seṭṭhā samā sevitabbā sahāyā;
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Primera mitad del verso; la segunda es el estribillo exhortativo del rinoceronte.

### C3-BUD-062

- **Texto:** Aquel en quien descansas como un niño en el pecho es un verdadero amigo, y nadie te separa de él.
- **Id en el catálogo:** `C3-BUD-062` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 2.3 (Hirisutta), verso 3, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 2.3 (Hirisutta), verso 3, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp2.3/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** One on whom you rest, like a child on the breast, is a true friend, not split from you by others.
- **Texto pali:** Yasmiñca seti urasīva putto, Sa ve mitto yo parehi abhejjo.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Segunda oración del verso; la primera dice lo que no es un amigo.

### C3-BUD-063

- **Texto:** Comprender es la esencia de las palabras bien dichas; la quietud, la esencia de aprender y comprender.
- **Id en el catálogo:** `C3-BUD-063` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 2.9 (Kiṁsīlasutta), verso 6, líneas 1–2 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 2.9 (Kiṁsīlasutta), verso 6, líneas 1–2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp2.9/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Understanding is the essence of well-spoken words, stillness is the essence of learning and understanding.
- **Texto pali:** Viññātasārāni subhāsitāni, Sutañca viññātasamādhisāraṁ;
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-064

- **Texto:** Los arroyos pequeños corren con estruendo; los grandes ríos fluyen en silencio.
- **Id en el catálogo:** `C3-BUD-064` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 3.11 (Nālakasutta), verso 42, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 3.11 (Nālakasutta), verso 42, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp3.11/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** the little creeks flow on resounding, while silent flow the great rivers.
- **Texto pali:** Saṇantā yanti kusobbhā, Tuṇhī yanti mahodadhī.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se omiten las líneas 1–2, exhortativas («Understand this…»).

### C3-BUD-065

- **Texto:** Como la gota resbala de la hoja de loto, como el agua de su flor, el sabio no se aferra a lo que ve, oye o piensa.
- **Id en el catálogo:** `C3-BUD-065` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 4.6 (Jarāsutta), verso 9 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 4.6 (Jarāsutta), verso 9
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp4.6/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Like a droplet slips from a lotus-leaf, like water from a lotus flower; the sage doesn’t cling to that which is seen or heard or thought.
- **Texto pali:** Udabindu yathāpi pokkhare, Padume vāri yathā na limpati; Evaṁ muni nopalimpati, Yadidaṁ diṭṭhasutaṁ mutesu vā.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora.

### C3-BUD-066

- **Texto:** Sin apego al futuro, no se lamenta por el pasado.
- **Id en el catálogo:** `C3-BUD-066` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 4.10 (Purābhedasutta), verso 4, líneas 1–2 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 4.10 (Purābhedasutta), verso 4, líneas 1–2
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp4.10/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Rid of attachment to the future, they don’t grieve for the past.
- **Texto pali:** Nirāsatti anāgate, atītaṁ nānusocati;
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Primera oración del verso; la segunda es doctrinal («views»).

### C3-BUD-067

- **Texto:** Como en medio del océano no se alza ninguna ola y todo está quieto, así está quieto quien no se agita.
- **Id en el catálogo:** `C3-BUD-067` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 4.14 (Tuvaṭakasutta), verso 6, líneas 1–3 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 4.14 (Tuvaṭakasutta), verso 6, líneas 1–3
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp4.14/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Just as, in the middle of the ocean, no waves arise, it stays still; so too one unstirred is still—
- **Texto pali:** Majjhe yathā samuddassa, Ūmi no jāyatī ṭhito hoti; Evaṁ ṭhito anejassa,
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Se omite la última línea («a mendicant would make no pretension…»).

### C3-BUD-068

- **Texto:** En paz entre quienes no tienen paz, ecuánime, no se aferra cuando otros se aferran.
- **Id en el catálogo:** `C3-BUD-068` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 4.13 (Mahābyūhasutta), verso 18, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 4.13 (Mahābyūhasutta), verso 18, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp4.13/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** Peaceful among the peaceless, equanimous, they don’t grasp when others grasp.
- **Texto pali:** Santo asantesu upekkhako so, Anuggaho uggahaṇanti maññe.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Segunda oración del verso; la primera habla de disputas.

### C3-BUD-069

- **Texto:** Hago de la verdad mi hoz, y la suavidad es mi descanso.
- **Id en el catálogo:** `C3-BUD-069` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 1.4 (Kasibhāradvājasutta), verso 7, líneas 3–4 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 1.4 (Kasibhāradvājasutta), verso 7, líneas 3–4
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp1.4/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** I use truth as my scythe, and gentleness is my release.
- **Texto pali:** Saccaṁ karomi niddānaṁ, soraccaṁ me pamocanaṁ.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Release» (pali «pamocanaṁ», desuncir los bueyes al acabar la jornada) se traduce «descanso».

### C3-BUD-070

- **Texto:** «Mi mente es dócil y libre», dijo el Buda, «cultivada largo tiempo y bien domada. No hay en mí nada malo: así que llueve, cielo, si quieres».
- **Id en el catálogo:** `C3-BUD-070` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde el texto pali y la versión inglesa de Bhikkhu Sujato (CC0).
- **Atribución en la app:** Sutta Nipāta 1.2 (Dhaniyasutta), verso 6 · Traducción editorial para Strivo
- **Autor u obra:** Sutta Nipāta
- **Ubicación:** Sutta Nipāta 1.2 (Dhaniyasutta), verso 6
- **Idioma original:** pali
- **Edición de referencia:** Texto pali de SuttaCentral (Mahāsaṅgīti) y traducción inglesa de Bhikkhu Sujato; bilara-data, rama «published»
- **Fuente consultada:** https://suttacentral.net/snp1.2/en/sujato
- **Licencia:** CC0 (dedicación al dominio público)
- **Derechos:** El texto pali es antiguo y la edición digital de SuttaCentral es CC0; la traducción inglesa de Bhikkhu Sujato también es CC0 (SuttaCentral exige CC0 para todas sus traducciones). La traducción española es nueva, de Strivo.
- **Texto fuente:** “My mind is obedient and freed,” said the Buddha, “long nurtured and well-tamed. Nothing bad is found in me: so rain forth, heavens, if you wish.”
- **Texto pali:** “Cittaṁ mama assavaṁ vimuttaṁ, (iti bhagavā) Dīgharattaṁ paribhāvitaṁ sudantaṁ; Pāpaṁ pana me na vijjati, Atha ce patthayasī pavassa deva”.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · «Heavens» (pali «deva», el cielo que llueve) se traduce «cielo».

### C3-HIN-001

- **Texto:** El contacto de los sentidos con sus objetos, que trae calor y frío, placer y dolor, no es permanente: tiene un principio y un final.
- **Id en el catálogo:** `C3-HIN-001` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** The contacts of the senses with their (respective) objects producing (sensations of) heat and cold, pleasure and pain, are not permanent, having (as they do) a beginning and an end.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-002

- **Texto:** En el yoga no se pierde ni siquiera el primer intento. No hay obstáculos.
- **Id en el catálogo:** `C3-HIN-002` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** In this (the Yoga system) there is no waste of even the first attempt. There are no impediments.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · «This (the Yoga system)»: Ganguli aclara entre paréntesis que se refiere al yoga.

### C3-HIN-003

- **Texto:** Lo que te toca es el trabajo, no su fruto.
- **Id en el catálogo:** `C3-HIN-003` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Thy concern is with work only, but not with the fruit (of work).
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Krishna se dirige a Arjuna.

### C3-HIN-004

- **Texto:** Cuando alguien suelta todos los deseos de su corazón y está contento consigo, en su interior, se dice que su mente es firme.
- **Id en el catálogo:** `C3-HIN-004` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** When one casts off all the desires of his heart and is pleased within (his) self with self, then is one said to be of steady mind.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-005

- **Texto:** Quien retira sus sentidos de los objetos, como la tortuga recoge sus miembros por todos lados, tiene la mente firme.
- **Id en el catálogo:** `C3-HIN-005` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** When one withdraws his senses from the objects of (those) senses as the tortoise its limbs from all sides, even his is steadiness of mind.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-006

- **Texto:** Quien sabe contenerse y disfruta de las cosas con sentidos libres de apego y de rechazo, dueño de sí, alcanza la paz.
- **Id en el catálogo:** `C3-HIN-006` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** But the self-restrained man, enjoying objects (of sense) with senses freed from attachment and aversion under his own control, attaineth to peace (of mind).
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-007

- **Texto:** Como el mar, que recibe agua sin cesar y no se desborda, halla la paz aquel en quien entran los deseos; no quien los anhela.
- **Id en el catálogo:** `C3-HIN-007` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. II (Bhishma Parva, sección XXVI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** He into whom all objects of desire enter, even as the waters enter the ocean which (though) constantly replenished still maintains its water-mark unchanged--(he) obtains peace (of mind) and not one that longeth for objects of desire.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · «Maintains its water-mark unchanged» se traduce como «no se desborda».

### C3-HIN-008

- **Texto:** Incluso quien es sabio actúa según su propia naturaleza. Todos los seres siguen la suya.
- **Id en el catálogo:** `C3-HIN-008` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. III (Bhishma Parva, sección XXVII) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. III (Bhishma Parva, sección XXVII)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Even a wise man acts according to his own nature. All living beings follow (their own) nature.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-009

- **Texto:** Una hoja, una flor, un fruto, agua: lo que se me ofrece con devoción, lo recibo de quien tiene el corazón puro.
- **Id en el catálogo:** `C3-HIN-009` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. IX (Bhishma Parva, sección XXXIII) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. IX (Bhishma Parva, sección XXXIII)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** They who offer me with reverence, leaf, flower, fruit, water--that offered with reverence, I accept from him whose self is pure.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Krishna habla en primera persona.

### C3-HIN-010

- **Texto:** Quien vive con devoción y renuncia al fruto de sus actos alcanza la serenidad más alta.
- **Id en el catálogo:** `C3-HIN-010` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. V (Bhishma Parva, sección XXIX) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. V (Bhishma Parva, sección XXIX)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** He who is possessed of devotion, renouncing the fruit of action, attaineth to the highest tranquillity.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-011

- **Texto:** Que cada cual se eleve por sí mismo y no se hunda, porque uno mismo es su amigo y uno mismo es su enemigo.
- **Id en el catálogo:** `C3-HIN-011` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** One should raise (his) self by self; one should not degrade (his) self; for one’s own self is one’s friend, and one’s own self is one’s enemy.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Construcción impersonal («one should»), no dirigida al lector.

### C3-HIN-012

- **Texto:** El alma de quien se ha dominado y vive en calma se mantiene firme ante el frío y el calor, el placer y el dolor, la honra y la deshonra.
- **Id en el catálogo:** `C3-HIN-012` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** The soul of one who has subjugated his self and who is in the enjoyment of tranquillity, is steadily fixed (on itself) amid cold and heat, pleasure and pain, and also honour and dishonour.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-013

- **Texto:** El yoga que alivia el sufrimiento es de quien es moderado al comer y al divertirse, en lo que hace, al dormir y al velar.
- **Id en el catálogo:** `C3-HIN-013` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Devotion is not one’s, O Arjuna, who eateth much, nor one’s who doth not eat at all; nor one’s who is addicted to too much sleep, nor one’s who is always awake, devotion that is destructive of misery is his who is temperate in food and amusements, who duly exerts himself temperately in all his works, and who is temperate in sleep and vigils.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Ganguli traduce yoga como «devotion» (II: «This equanimity is called Yoga (devotion)»). Pasaje paralelo en Arnold (pg2388.txt, cap. VI). Se traduce solo la segunda mitad de la oración de Ganguli (la primera enumera los excesos). «Devotion» se vierte como «yoga», glosa del propio Ganguli.

### C3-HIN-014

- **Texto:** Como una lámpara que no tiembla donde no hay viento, así es el devoto que ha serenado su corazón y se recoge en sí mismo.
- **Id en el catálogo:** `C3-HIN-014` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** As a lamp in a windless spot doth not flicker, even that is the resemblance declared of a devotee whose heart hath been restrained and who applieth his self to abstraction.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-015

- **Texto:** El mejor devoto es quien mira todo con igualdad, ve cada cosa como su propio ser y siente como propias la alegría y la pena de los demás.
- **Id en el catálogo:** `C3-HIN-015` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** That devotee, O Arjuna, who casteth an equal eye everywhere, regarding all things as his own self and the happiness and misery of others as his own, is deemed to be the best.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-016

- **Texto:** Sin duda, la mente es difícil de dominar e inquieta. Con práctica, sin embargo, y dejando ir el deseo, se la puede encauzar.
- **Id en el catálogo:** `C3-HIN-016` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. VI (Bhishma Parva, sección XXX)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Without doubt, O thou of mighty arms the mind is difficult of subjugation and is restless. With practice, however, O son of Kunti, and with the abandonment of desire, it can be controlled.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-017

- **Texto:** Me es querido quien no perturba al mundo ni se deja perturbar por él, y está libre de euforia, ira, miedo e inquietud.
- **Id en el catálogo:** `C3-HIN-017` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. XII (Bhishma Parva, sección XXXVI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. XII (Bhishma Parva, sección XXXVI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** He through whom the world is not troubled, (and) who is not troubled by the world, who is free from joy, wrath, fear and anxieties, even he is dear to me.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Krishna habla en primera persona. «Joy» se traduce como «euforia» (exaltación).

### C3-HIN-018

- **Texto:** La serenidad de la mente, la dulzura, el silencio, el dominio de sí y la pureza de ánimo: a eso se le llama la austeridad de la mente.
- **Id en el catálogo:** `C3-HIN-018` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. XVII (Bhishma Parva, sección XLI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. XVII (Bhishma Parva, sección XLI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Serenity of the mind, gentleness, taciturnity, self-restraint, and purity of the disposition,--these are said to be the penance of the mind.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-019

- **Texto:** La fe de cada quien se ajusta a su propia naturaleza. Todo ser está lleno de fe, y lo que alguien cree, eso es.
- **Id en el catálogo:** `C3-HIN-019` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. XVII (Bhishma Parva, sección XLI) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. XVII (Bhishma Parva, sección XLI)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** The faith of one, O Bharata, is conformable to his own nature. A being here is full of faith; and whatever is one’s faith, one is even that.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-020

- **Texto:** Actúa desde la bondad quien no se aferra, no habla de sí, tiene constancia y energía, y no se altera ante el éxito o la derrota.
- **Id en el catálogo:** `C3-HIN-020` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Bhagavad Gita, cap. XVIII (Bhishma Parva, sección XLII) · Traducción editorial para Strivo
- **Autor u obra:** Bhagavad Gita · Bhagavad Gita (Mahabharata, Bhishma Parva)
- **Ubicación:** Bhagavad Gita, cap. XVIII (Bhishma Parva, sección XLII)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** The agent who is free from attachment, who never speaketh of himself, who is endued with constancy and energy, and is unmoved by success and defeat, is said to be of the quality of goodness.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-021

- **Texto:** La salud, no deber nada, vivir en casa, la compañía de gente buena, tener con qué vivir y vivir sin miedo: estas seis cosas hacen feliz a la gente.
- **Id en el catálogo:** `C3-HIN-021` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Udyoga Parva, sección XXXIII (consejos de Vidura a Dhritarashtra) · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Udyoga Parva, sección XXXIII (consejos de Vidura a Dhritarashtra)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Health, unindebtedness, living at home, companionship with good men, certainty as regards the means of livelihood, and living without fear, these six, O king, conduce to the happiness of men.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-022

- **Texto:** Es apreciado en todas partes quien no guarda rencor y es amable con todos, no discute si es débil, no habla con soberbia y olvida las riñas.
- **Id en el catálogo:** `C3-HIN-022` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Udyoga Parva, sección XXXIII (consejos de Vidura a Dhritarashtra) · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Udyoga Parva, sección XXXIII (consejos de Vidura a Dhritarashtra)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** He who beareth not malice towards others but is kind to all, who being weak disputeth not with others, who speaketh not arrogantly, and forgeteth a quarrel, is praised everywhere.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-023

- **Texto:** El cuerpo de cada quien es su carro; el alma, por dentro, lo conduce; y los sentidos son sus caballos.
- **Id en el catálogo:** `C3-HIN-023` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Udyoga Parva, sección XXXIV (consejos de Vidura a Dhritarashtra) · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Udyoga Parva, sección XXXIV (consejos de Vidura a Dhritarashtra)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** One’s body, O king, is one’s car; the soul within is the driver; and the senses are its steeds.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-024

- **Texto:** No es amigo aquel cuya ira da miedo o a quien se trata con temor. Amigo de verdad es aquel en quien se confía como en un padre.
- **Id en el catálogo:** `C3-HIN-024` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra) · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** He is no friend whose anger inspireth fear, or who is to be waited upon with fear. He, however, on whom one can repose confidence as on a father, is a true friend.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-025

- **Texto:** Quien se porta como amigo, aunque no haya lazos de sangre, es un amigo de verdad, un refugio y un amparo.
- **Id en el catálogo:** `C3-HIN-025` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra) · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** He that beareth himself as a friend, even though unconnected by birth of blood, is a true friend, a real refuge, and a protector.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-026

- **Texto:** La dicha y la pena, la abundancia y la escasez, la ganancia y la pérdida, la vida y la muerte nos llegan a todos a su tiempo.
- **Id en el catálogo:** `C3-HIN-026` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra) · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Happiness and misery, plenty and want, gain and loss, life and death, are shared by all in due order.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-027

- **Texto:** Los parientes, como se apoyan y se ayudan unos a otros, crecen juntos como los tallos de loto en un lago.
- **Id en el catálogo:** `C3-HIN-027` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra) · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Relatives, again, in consequence of mutual dependence and mutual aid, grow together, like lotus-stalks in a lake.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-028

- **Texto:** No es fuerza la que se opone a la suavidad.
- **Id en el catálogo:** `C3-HIN-028` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra) · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Udyoga Parva, sección XXXVI (consejos de Vidura a Dhritarashtra)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** That is not strength which is opposed to softness.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-029

- **Texto:** Abundan quienes saben decir en todo momento palabras agradables. Escasea quien dice, y también quien escucha, palabras ingratas pero sanadoras.
- **Id en el catálogo:** `C3-HIN-029` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Udyoga Parva, sección XXXVII (consejos de Vidura a Dhritarashtra) · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Udyoga Parva, sección XXXVII (consejos de Vidura a Dhritarashtra)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 2; Project Gutenberg n.º 15475
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15475
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** They are abundant, O king, that can always speak agreeable words. The speaker, however, is rare, as also the hearer, of words that are disagreeable but medicinal.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-030

- **Texto:** El contento es el cielo más alto, el contento es la mayor dicha. No hay nada por encima del contento.
- **Id en el catálogo:** `C3-HIN-030` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Rajadharmanusasana Parva), sección XXI · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Rajadharmanusasana Parva), sección XXI
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Contentment is the highest heaven, contentment is the highest bliss. There is nothing higher than contentment.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-031

- **Texto:** Cuando alguien no teme a ningún ser ni asusta a ninguno, y vence el deseo y la aversión, se dice que contempla su propia alma.
- **Id en el catálogo:** `C3-HIN-031` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Rajadharmanusasana Parva), sección XXI · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Rajadharmanusasana Parva), sección XXI
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** When one does not fear any creature, nor any creature is frightened at one, when one conquers one's desire and aversion, then is one said to behold one's soul.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-032

- **Texto:** Como dos maderos que flotan en el mar se juntan un tiempo y luego se separan, así es la unión de los seres en este mundo.
- **Id en el catálogo:** `C3-HIN-032` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Mokshadharma Parva), sección CLXXIV · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Mokshadharma Parva), sección CLXXIV
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** As two pieces of wood floating on the ocean come together at one time and are again separated, even such is the union of (living) creatures in this world.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-033

- **Texto:** La pena llega tras la alegría, y la alegría tras la pena. Las alegrías y las penas de las personas giran como en una rueda.
- **Id en el catálogo:** `C3-HIN-033` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Mokshadharma Parva), sección CLXXIV · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Mokshadharma Parva), sección CLXXIV
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Sorrow comes after joy, and joy after sorrow. The joys and sorrows of human beings are revolving on a wheel.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-034

- **Texto:** Se llama entereza a la virtud que permite seguir igual en la dicha y en la pena.
- **Id en el catálogo:** `C3-HIN-034` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Apaddharmanusasana Parva), sección CLXII · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Apaddharmanusasana Parva), sección CLXII
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** That virtue owing to which one remains unchanged in happiness and misery is called fortitude.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-035

- **Texto:** Un lago grande, cuando se enturbia, recobra por sí mismo la calma. Así también quien es sabio, cuando estas cosas lo agitan, se serena por sí mismo.
- **Id en el catálogo:** `C3-HIN-035` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Rajadharmanusasana Parva), sección CIV · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Rajadharmanusasana Parva), sección CIV
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** A large lake when it becomes turbid, resumes its tranquillity of itself. Similarly, a man of wisdom, when disturbed in such matters, becomes tranquil of himself.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-036

- **Texto:** ¿Dónde estoy? ¿Adónde iré? ¿Quién soy? ¿Cómo llegué aquí? ¿Por qué y por quién me aflijo? Pensar en estas preguntas trae serenidad.
- **Id en el catálogo:** `C3-HIN-036` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Rajadharmanusasana Parva), sección XXVIII · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Rajadharmanusasana Parva), sección XXVIII
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Where am I? Where shall go? Who am I? How come I here? What for and whom I grieve? Reflecting on these questions one obtains tranquillity.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-037

- **Texto:** Quien se libra del deseo y de la expectativa duerme feliz. Estar libre de toda expectativa y de todo deseo es la dicha.
- **Id en el catálogo:** `C3-HIN-037` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Mokshadharma Parva), sección CLXXIV · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Mokshadharma Parva), sección CLXXIV
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** One freed from desire and hope sleeps in felicity. Freedom from every hope and desire is felicity.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Lo dice Pingala. «Hope» en el sentido de expectativa ansiosa (Bhishma lo glosa luego como «absence of expectation»). · Marcada como no apta con ánimo bajo: puede leerse como que el malestar depende solo del juicio propio.

### C3-HIN-038

- **Texto:** Quien sabe contenerse duerme feliz y despierta feliz. Va contento por el mundo y su ánimo se mantiene alegre.
- **Id en el catálogo:** `C3-HIN-038` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Mokshadharma Parva), sección CCXX · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Mokshadharma Parva), sección CCXX
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** One that is self-restrained sleeps happily and wakes happily. He sojourns happily in the world and his mind always remains cheerful.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-039

- **Texto:** Cada cosa deseada que se deja ir se vuelve fuente de felicidad.
- **Id en el catálogo:** `C3-HIN-039` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de K. M. Ganguli (1883–1896).
- **Atribución en la app:** Mahabharata, Shanti Parva (Mokshadharma Parva), sección CLXXIV · Traducción editorial para Strivo
- **Autor u obra:** Mahabharata
- **Ubicación:** Shanti Parva (Mokshadharma Parva), sección CLXXIV
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Mahabharata, trad. en prosa de Kisari Mohan Ganguli (1883–1896), vol. 3; Project Gutenberg n.º 15476
- **Fuente consultada:** https://www.gutenberg.org/ebooks/15476
- **Licencia:** Dominio público
- **Derechos:** Ganguli murió en 1908. Dominio público en México. Las notas entre corchetes del editor digital moderno no se citan.
- **Texto fuente:** Whatever objects, amongst things that are desired, are cast off, become sources of happiness.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito).

### C3-HIN-040

- **Texto:** Como quien va en carro ve las ruedas sin que lo toquen, así ve el día y la noche, el bien y el mal y todo par de opuestos: luz y sombra, calor y frío.
- **Id en el catálogo:** `C3-HIN-040` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de F. Max Müller.
- **Atribución en la app:** Kaushitaki Upanishad, cap. I («The Couch of Brahman») · Traducción editorial para Strivo
- **Autor u obra:** Kaushitaki Upanishad
- **Ubicación:** Kaushitaki Upanishad, cap. I («The Couch of Brahman»)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** Trad. de F. Max Müller (Sacred Books of the East), en la antología Sacred Books of the East (1900, ed. Epiphanius Wilson); Project Gutenberg n.º 12894
- **Fuente consultada:** https://www.gutenberg.org/ebooks/12894
- **Licencia:** Dominio público
- **Derechos:** Max Müller murió en 1900; Epiphanius Wilson, en 1916. Dominio público en México.
- **Texto fuente:** And as a man, driving in a chariot, might look at the two wheels without being touched by them, thus he will look at day and night, thus at good and evil deeds, and at all pairs, all correlative things, such as light and darkness, heat and cold.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Traducción inglesa de F. Max Müller. Sujeto: quien conoce a Brahman. «Good and evil deeds» se traduce como «el bien y el mal».

### C3-HIN-041

- **Texto:** La vida es aliento, el aliento es vida.
- **Id en el catálogo:** `C3-HIN-041` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de F. Max Müller.
- **Atribución en la app:** Kaushitaki Upanishad, cap. III («Life and Consciousness») · Traducción editorial para Strivo
- **Autor u obra:** Kaushitaki Upanishad
- **Ubicación:** Kaushitaki Upanishad, cap. III («Life and Consciousness»)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** Trad. de F. Max Müller (Sacred Books of the East), en la antología Sacred Books of the East (1900, ed. Epiphanius Wilson); Project Gutenberg n.º 12894
- **Fuente consultada:** https://www.gutenberg.org/ebooks/12894
- **Licencia:** Dominio público
- **Derechos:** Max Müller murió en 1900; Epiphanius Wilson, en 1916. Dominio público en México.
- **Texto fuente:** Life is prâna, prâna is life.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Traducción inglesa de F. Max Müller. Lo dice Indra. «Prâna» = aliento vital.

### C3-HIN-042

- **Texto:** La amistad entre gente buena puede romperse, pero siguen siendo amigos de corazón: si se quiebra el tallo del loto, sus fibras no se separan.
- **Id en el catálogo:** `C3-HIN-042` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Edwin Arnold.
- **Atribución en la app:** Hitopadesha, Libro I, «The Winning of Friends» · Traducción editorial para Strivo
- **Autor u obra:** Hitopadesha
- **Ubicación:** Libro I, «The Winning of Friends»
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Book of Good Counsels, trad. de Edwin Arnold, en Hindu Literature (1900, ed. Epiphanius Wilson); Project Gutenberg n.º 13268
- **Fuente consultada:** https://www.gutenberg.org/ebooks/13268
- **Licencia:** Dominio público
- **Derechos:** Edwin Arnold murió en 1904; Epiphanius Wilson, en 1916. Dominio público en México.
- **Texto fuente:** Good men's friendships may be broken, yet abide they friends at heart; Snap the stem of Luxmee's lotus, and its fibres will not part.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Traducción inglesa de Edwin Arnold. Se omite el nombre «Luxmee» (Lakshmi) del loto.

### C3-HIN-043

- **Texto:** Un saludo amable, un lugar para descansar, fuego y agua del pozo: regalos sencillos que se dan de buena gana en la casa de la gente buena.
- **Id en el catálogo:** `C3-HIN-043` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Edwin Arnold.
- **Atribución en la app:** Hitopadesha, Libro I, «The Winning of Friends» · Traducción editorial para Strivo
- **Autor u obra:** Hitopadesha
- **Ubicación:** Libro I, «The Winning of Friends»
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Book of Good Counsels, trad. de Edwin Arnold, en Hindu Literature (1900, ed. Epiphanius Wilson); Project Gutenberg n.º 13268
- **Fuente consultada:** https://www.gutenberg.org/ebooks/13268
- **Licencia:** Dominio público
- **Derechos:** Edwin Arnold murió en 1904; Epiphanius Wilson, en 1916. Dominio público en México.
- **Texto fuente:** Greeting fair, and room to rest in; fire, and water from the well-- Simple gifts--are given freely in the house where good men dwell,
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Traducción inglesa de Edwin Arnold. El verso termina en coma en la fuente.

### C3-HIN-044

- **Texto:** La sabiduría ve con claridad lo que teme la falta de conocimiento.
- **Id en el catálogo:** `C3-HIN-044` · **Estado:** `aprobada`
- **Tipo:** Traducción editorial para Strivo desde la versión inglesa de Edwin Arnold.
- **Atribución en la app:** Hitopadesha, Libro IV, «Peace» (consuelo a Kaundinya) · Traducción editorial para Strivo
- **Autor u obra:** Hitopadesha
- **Ubicación:** Libro IV, «Peace» (consuelo a Kaundinya)
- **Idioma original:** sánscrito (vía inglés)
- **Edición de referencia:** The Book of Good Counsels, trad. de Edwin Arnold, en Hindu Literature (1900, ed. Epiphanius Wilson); Project Gutenberg n.º 13268
- **Fuente consultada:** https://www.gutenberg.org/ebooks/13268
- **Licencia:** Dominio público
- **Derechos:** Edwin Arnold murió en 1904; Epiphanius Wilson, en 1916. Dominio público en México.
- **Texto fuente:** Wisdom sees aright what want of knowledge fears.
- **Texto verificado:** Coincidencia automática, carácter por carácter salvo espacios, entre el texto fuente y el archivo descargado (2026-10-13).
- **Aprobación editorial:** Alejandra Treviño Lozano, 2026-10-14
- **Aprobación jurídica:** Claudia Lozano, 2026-10-14
- **Notas:** Traducción hecha por IA; al aprobarse no la había revisado una persona traductora. · Traducción de una traducción: conviene contrastar con el original (sánscrito). · Traducción inglesa de Edwin Arnold.
