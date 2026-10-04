# SPEC_28 — Frases del día personalizadas por referencias

**Fecha:** 4 de octubre de 2026 · **Rama:** `strivo` · **Estado:** construida; citas pendientes de revisión
**Archivos de referencia:** `src/content/frases-v2/`, `src/diario/fraseDelDia.js`,
`src/referencias/`, `docs/frases-v2-fuentes.md`, `scripts/validar-frases.js`

---

## 1. Contexto

Las frases del día se percibían rebuscadas, antiguas y repetitivas. El repertorio anterior tenía 200
entradas en un array: 100 «versiones Strivo» firmadas como «inspiradas en» un autor y 100 citas en
dominio público, la mitad fragmentos de verso. `fraseDelDia(fecha)` elegía por índice de día sobre ese
array, y con ánimo bajo filtraba el esfuerzo y volvía a indexar sobre la lista más corta, lo que
desplazaba todo y podía repetir frases.

Esta SPEC reemplaza la lógica editorial: un catálogo nuevo, claro y contemporáneo, personalizado según
el tipo de referencias que cada persona **elige** recibir. Todo sigue siendo local, sin red y sin IA en
tiempo real.

## 2. Antes y después

| | Antes (v1) | Después (v2) |
|---|---|---|
| Repertorio | 200 frases, una sola lista | 1 000 originales aprobadas en siete audiencias + 25 citas candidatas |
| Repetición | 200 días sin repetir; con ánimo bajo se reindexaba | ≥ 500 días sin repetir en **todos** los perfiles; con ánimo bajo, ninguna frase vuelve antes de 100 días |
| Personalización | ninguna | modo + afinidades elegidas en el onboarding o en Tu perfil |
| Originales | «Versión Strivo inspirada en X» bajo la frase | sin comillas y sin pie |
| Citas | «Autor · Obra», sin expediente | «Autor · Obra, ubicación», con expediente obligatorio y dos firmas |
| Estabilidad | derivada de la fecha | asignación persistida por (fecha, huella) |

## 3. Decisiones tomadas

Cerradas por el encargo y no se discuten aquí:

- Cuatro rutas: cristianismo, budismo, hinduismo y estoicismo, combinables entre sí.
- Cada perfil, 500 frases aprobadas y elegibles como mínimo.
- Sin pop-up para quien ya terminó el onboarding: la invitación está en Tu perfil.
- La frase sigue siendo aire. No tiene favoritos, contadores, botón de «otra», enlace ni etiqueta de perfil.

Decididas en implementación, con su razón:

| # | Decisión | Por qué |
|---|---|---|
| D1 | Las dos preguntas van **tras los horarios (P5) y antes de los avisos (P6)**: `p5r` es paso y cuenta; `p5ra` es sub-paso condicional. El total pasa de 7 a 8. | «Después de los datos personales y antes de la bienvenida final». Así cierran lo que se pregunta sobre ti antes de pasar a lo que hace la app. El sub-paso no cuenta por la misma regla que el género: un total que cambia de una persona a otra deja de orientar. |
| D2 | La preferencia vive en `shared/frases` y la asignación en `diario/frasesDelDia/items/{fecha}~{huella}`. Las dos son **solo locales**. | §7 del encargo. Se usa el patrón que ya tenía el PIN. |
| D3 | Las asignaciones se guardan por fecha y huella, no solo por fecha. | Cambiar de preferencias resuelve otra frase para hoy sin tocar la de la huella anterior. Volver a la elección de antes devuelve su frase. |
| D4 | `guiadas` sin afinidades se trata como el perfil secular. | Elegir «quiero elegir» y no elegir nada no es una elección de tradición. |
| D5 | `seculares` y `sin_definir` comparten huella y repertorio. | Ven exactamente lo mismo, así que pasar de uno a otro no cambia la frase del día. |
| D6 | Con ánimo bajo, el esfuerzo se sustituye por **calma**, no por aceptación. | Los vecinos de esfuerzo en el ciclo son aceptación y gratitud. Con calma, dos días seguidos nunca comparten tema. |
| D7 | Una asignación guardada se vuelve a elegir en dos casos: si la frase ya no está aprobada, o si no es apta y el ánimo reciente es bajo. | La protección editorial, jurídica y de cuidado manda sobre la estabilidad del pasado. |
| D8 | Restablecer **borra** el documento de preferencia. | No escribe `sin_definir`: es minimización. Sin documento, el perfil ya es `sin_definir`. |
| D9 | Las piezas de las dos preguntas viven en `components/shared/PreguntasReferencias.jsx`. El copy es un solo objeto (`REFERENCIAS`) que usan el onboarding y Tu perfil. | El encargo pide la misma lógica y los mismos textos en los dos sitios. |
| D10 | `src/referencias/` es un territorio neutral nuevo, vigilado por `eslint.config.js`. | Lo leen tres consumidores, y el onboarding no puede importar del diario. |
| D11 | **Ninguna cita está aprobada.** Se verificaron textos contra ediciones de dominio público, pero las firmas editorial y jurídica son de personas. | §9 del encargo. Ver §9 de esta SPEC. |

## 4. Diferencias con el encargo y con la documentación

- **Firestore no es de solo escritura desde SPEC_17A**: `restaurar.js` lee. Esta SPEC no añade ninguna
  lectura, y las rutas nuevas no están en la lista de la restauración. Hay una prueba que lo comprueba.
- **RN-TEC-07** decía que `perfil/` solo toca `shared/profile`. Desde aquí toca también
  `shared/frases`, a través de `src/referencias/almacen.js`. La regla de fondo sigue igual: Tu perfil no
  importa nada del diario ni de Respiración.
- **No llegó el «documento de contexto» adjunto.** Se trabajó con `CLAUDE.md`, el código y `docs/`.
- **`separacion.test.js`** buscaba `/ritual/i` en todo el copy, y «espiritual» contiene «ritual». La guarda
  pasa a `/\britual/i`, que busca la palabra y no las letras.

## 5. Reglas de arquitectura afectadas

| Regla | Cambio |
|---|---|
| RN-TEC-06 / RN-TEC-07 | Onboarding y Tu perfil importan de `src/referencias/` y de `components/shared/PreguntasReferencias`. Ninguno importa del diario. |
| Nueva | `src/referencias/**` y `src/content/**` no pueden importar `diario/` ni `breathing/` (`eslint.config.js`). |
| RN-DB-03 | `FIELDS.frases` y `FIELDS.fraseAsignada` amplían el modelo, con sus validadores. |
| RN-DB-04 | El repertorio v1 se conserva intacto. Ninguna asignación v1 se borra, aunque hoy no existe ninguna. |
| RN-VOZ-01 | Todo el copy nuevo está en `src/copy/index.js`. El catálogo es la excepción ya documentada de `src/content/`. |

## 6. Modelo de datos

```js
// users/{uid}/shared/frases — solo local
{ modo: 'guiadas' | 'espirituales_generales' | 'seculares' | 'sin_definir',
  afinidades: ['budismo', 'estoicismo'],   // ordenadas, sin repetidos, vacías fuera de 'guiadas'
  version: 1,
  updatedAt }

// users/{uid}/diario/frasesDelDia/items/{fecha}~{huella} — solo local
{ phraseId: 'F2-UNI-CAL-007', fecha: '2026-10-04',
  huella: 'h1-1a2b3c4d',                   // FNV-1a del perfil resuelto: no repite la elección en claro
  catalogoVersion: 2, asignadaEn }
```

**Privacidad (§7 del encargo).**

- Solo se guarda el modo, los identificadores de afinidad, la versión y el sello.
- No hay texto libre, motivos, inferencias ni eventos.
- `local.esRutaLocal` reconoce las dos rutas. `enqueue` las rechaza siempre, `mudarUid` no las reencola y `restaurar.js` no las baja.
- La huella se deriva solo del modo y de las afinidades. No usa uid, correo ni nombre.

**Consecuencia asumida:** la preferencia es de este dispositivo. Salir de la cuenta (`borrarUid`) o
reinstalar la app la devuelve a `sin_definir`, y Tu perfil permite volver a elegir.

**Pendientes de otras SPEC:**

- **SPEC_24 (exportación y borrado):** decidir si la exportación incluye esta preferencia. Es un dato de la persona, pero solo existe en el dispositivo.
- **Aviso de privacidad y etiquetas de las tiendas:** las creencias religiosas son datos sensibles en la LFPDPPP mexicana y en el RGPD. Como no salen del dispositivo, el responsable no los recibe. **Esto requiere revisión legal antes de publicarse**.
- **Etiqueta de privacidad de App Store:** declarar que este dato no se recolecta.

## 7. Catálogo editorial

**Ubicación:** `src/content/frases-v2/`. Hay un archivo por audiencia, más `citas.js`, `construir.js` (la forma), `index.js` (la agregación) y `validacion.js` (las reglas).

**Campos de cada entrada:** `id, catalogoVersion, texto, tema, subtema, tipo, audiencias, estado, aptaConAnimoBajo, atribucion, fuenteClave`.

**Identificadores.**

- Las originales toman su id de su posición: `F2-UNI-CAL-007`. **Solo se añade al final de cada lista.**
- Para retirar una original se usa `retiradas`. El id se conserva.
- Las citas llevan id escrito a mano.

| Audiencia | Por tema | Total | La ve |
|---|---|---|---|
| universal | 80 | 400 | todos los perfiles |
| secular | 20 | 100 | `seculares`, `sin_definir`, guiadas sin afinidades |
| espiritual_general | 20 | 100 | `espirituales_generales` |
| cristianismo · budismo · hinduismo · estoicismo | 20 c/u | 100 c/u | quien la eligió |

**Cobertura** (`npm run validar:frases`): el secular, el espiritual general y cada ruta individual ven
**500**. Las combinaciones ven 600, 700 u 800. Todos tienen 100 o más por tema. El margen es exacto a
propósito: **retirar una sola frase de un perfil de 500 hace fallar la validación** hasta que se reponga.

**Proporción de citas:** 0 % en producción, porque no hay ninguna aprobada. La meta del encargo es
25–35 %. El script la informa sin bloquear.

**Reglas que hace cumplir `validacion.js`** (mismas en el script y en las pruebas):

- **Forma:** metadatos completos y dentro del catálogo; un id por entrada; texto de 150 caracteres o menos, en una sola línea.
- **Voz:** léxico prohibido en la voz de Strivo (absolutos, mandatos, «solo», exclamaciones, rendimiento, medición, registro clínico). Las originales van sin comillas ni atribución, empiezan con mayúscula y terminan con punto.
- **Esfuerzo:** las frases de esfuerzo nunca son aptas con ánimo bajo.
- **Marcas de referencia:** ninguna marca religiosa ni espiritual en lo universal o lo secular; ninguna de una tradición concreta en lo espiritual general ni en otra tradición.
- **Duplicados:** ni exactos ni casi exactos (similitud de palabras ≥ 75 %) tras normalizar.
- **Citas:** atribución «X · Y», expediente completo y, si están aprobadas, dos firmas con fecha.
- **Cobertura:** la de esta misma sección.

**El catálogo v1 no se reutilizó.** Se auditó y se escribió de nuevo. Las «versiones inspiradas» ponían
un nombre bajo ideas parafraseadas. Muchas citas eran versos sueltos (Nervo, Martí, Sor Juana, Bécquer)
y otras eran arcaísmos (Gracián, Quevedo). `frases-del-dia.js` se queda en el repo sin cambios para
resolver cualquier asignación v1.

## 8. Selector

`src/diario/fraseDelDia.js` (`elegirFrase`) y `src/diario/diario.js` (`fraseAsignada`):

1. Normaliza la preferencia y resuelve el perfil y su huella (`src/referencias/preferencias.js`).
2. El tema del día es `TEMAS[díaDeÉpoca mod 5]`.
3. Construye el ciclo del tema:
   - toma las frases aprobadas y elegibles del perfil, agrupadas por audiencia;
   - ordena cada grupo por el hash del id, de modo que el orden del archivo no importa;
   - intercala los grupos con un round robin ponderado suave, para que cada afinidad aparezca en proporción y sin quedar relegada.
4. La posición en el ciclo es `⌊día/5⌋ + desfase(huella, tema)`. Como avanza una posición cada cinco días, con L ≥ 100 **no se repite una frase en 500 días**.
5. Con ánimo bajo:
   - el día de esfuerzo toma una frase de calma desde la mitad opuesta del ciclo;
   - una frase no apta de otro tema se sustituye dentro de su tema, desde un cuarto de vuelta más allá.
6. Si un tema queda vacío, sale una frase universal o secular aprobada (`fraseDeRespaldo`).
7. `fraseAsignada` devuelve la asignación guardada si sigue valiendo (D7). Si no, elige, guarda y devuelve. Un fallo de IndexedDB nunca impide pintar el día.

**Medido:**

- En cualquier tramo de 30 días, cada afinidad elegida aparece **2 veces como mínimo**.
- Entre afinidades elegidas, la diferencia es de 3 como máximo.
- Con las cuatro elegidas, la diferencia en 500 días es de 2 como máximo.
- Con ánimo bajo todo el año, la repetición más cercana llega a los 122 días.

## 9. Citas: estado y lo que falta

Hay 25 candidatas en `citas.js`, todas en `pendiente_revision`. Su expediente está en `docs/frases-v2-fuentes.md`.

| Grupo | Candidatas | Fuente | Qué falta |
|---|---|---|---|
| Cristianismo | 18 versículos | Reina-Valera 1909 (ebible.org, dominio público) | Cotejo carácter por carácter. Decidir la ortografía antigua («á», capitulares). Revisar las promesas (Mt 11:28) y los imperativos. Dos firmas. |
| Universal | 2 de Martí · 2 de Gracián | *La Edad de Oro* (Gutenberg) · *Oráculo manual* (textos.info) | Cotejar contra un facsímil. La edición de Gracián no está identificada (LPI art. 129). Gracián conserva la ortografía de 1647. |
| Budismo | 2 (Dhammapada 5 y 14) | *Sophia*, 1908, atribuida a Rafael Urbano († 1924) | Facsímil de la BNE. Identificar la traducción inglesa de partida. Acentos modernizados por quien la publica. |
| Estoicismo | 1 (Marco Aurelio IV.3) | Díaz de Miranda, 1785 | Es un fragmento. El revisor de 1888 no está identificado. Lo seguro es citar la impresión de 1785. |
| Hinduismo | **0** | — | Roviralta († 1926) no está en dominio público en México hasta 2027, y tradujo de otra traducción. Climent Terrer parte de Besant († 1933). |

**Ruta recomendada:** encargar una traducción propia de Strivo desde los originales en dominio público
(griego, latín, pali y sánscrito). Mientras no exista, cada tradición se sostiene con originales.

## 10. Interfaz

**Onboarding:**

- `p5r` muestra las cuatro opciones en chips de selección única con `aria-pressed`.
- `p5ra` muestra cuatro chips de selección múltiple y la acción «Omitir por ahora».
- Todo se guarda al tocar y nada bloquea.

**Tu perfil**, bloque «Personaliza tus frases» (tras los horarios):

- **Resumen:** la elección dicha con palabras y la nota de privacidad.
- **Elegir o cambiar:** las mismas dos preguntas, con encabezados `h3`.
- **«Borrar mi elección»:** pide confirmación con `Confirmacion`.
- **«Fuentes de las frases»:** vista estática con el criterio editorial y la lista de citas aprobadas. Hoy dice que todas son redacción de Strivo.

**Hoy** (`FraseDelDia.jsx`):

- Una original va en cursiva, sin comillas y sin `figcaption`.
- Una cita va entre «» con su `figcaption` y el rótulo oculto «Atribución».
- Los tokens, el recuadro, la semántica y el contraste AAA no cambian (`lint:contraste` en verde).

## 11. Migración

- Quien ya terminó el onboarding no tiene `shared/frases`, así que entra en `sin_definir`. Ve solo contenido universal o secular y la invitación en Tu perfil. No hay pop-up ni bloqueo.
- `pasos.VERSION` sube a 4, que vale ≥ 3 para la presentación. Nadie vuelve a ver el recorrido.
- No se toca ningún dato de rituales, Journal, ánimo, horarios ni género.
- Las asignaciones v1 se resolverían con el repertorio v1. Hoy no existe ninguna, porque v1 no persistía.

## 12. Pruebas

| Archivo | Qué cubre |
|---|---|
| `src/diario/__tests__/fraseDelDia.test.js` (28) | Determinismo; 500 días sin repetir en 20 configuraciones y tres fechas de inicio; rotación de temas; independencia del orden del catálogo; audiencias por perfil; reparto de afinidades; ánimo bajo (sustitución, aptas, ≥ 100 días, sin reindexar); respaldo; asignación persistida (estable, cambio de huella, ampliación del catálogo, retiradas, v1); migración sin bloqueo; presentación de original y cita; tarjeta no pulsable |
| `src/content/frases-v2/__tests__/catalogo.test.js` (13) | Reglas del catálogo, cobertura, expedientes y pruebas de que las validaciones detectan los casos que deben detectar |
| `src/lib/db/__tests__/frasesLocales.test.js` (7) | Nada se encola; `enqueue` rechaza las rutas; la mudanza no sube; restablecer borra; minimización; la restauración no las baja |
| `src/onboarding/__tests__/referencias.test.js` (16) | Copy literal; mismo objeto en el onboarding y en Tu perfil; chips accesibles; nada bloquea; normalización; resumen en palabras; guardar y releer; sin cola |
| `pasos`, `onboarding`, `perfil` y `separacion` (actualizadas) | Ocho pasos y dos sub-pasos, navegación condicional, versión 4, bloque `frases` y carpeta `referencias` |

## 13. Criterios de aceptación

- [x] Las dos preguntas tienen la redacción literal del encargo, son opcionales, se pueden saltar y se pueden editar o borrar desde Tu perfil.
- [x] Ningún perfil baja de 500 frases aprobadas y elegibles. Se comprueba en las pruebas y en el script.
- [x] La frase es determinista, local y estable, y cada perfil pasa 500 días sin repetirla.
- [x] `sin_definir` y `seculares` no reciben ninguna referencia religiosa, espiritual ni filosófica específica.
- [x] La preferencia y las asignaciones no salen del dispositivo.
- [x] Las originales no llevan comillas ni atribución, y las citas solo se muestran aprobadas.
- [x] Pasan los seis comandos de `CLAUDE.md` §12 y `validar:frases`. La única falla es la prueba intermitente conocida de `journal.test.js`.
- [ ] **Revisión editorial de las 1 000 originales por la propietaria del producto.** Las redactó la implementación; qué se le dice a alguien al abrir el día es decisión de producto.
- [ ] **Aprobación editorial y jurídica de citas hasta llegar al 25–35 %.** Hoy es 0 %.
- [ ] Revisión legal del aviso de privacidad (§6).
- [ ] Recorrido en un teléfono real.
