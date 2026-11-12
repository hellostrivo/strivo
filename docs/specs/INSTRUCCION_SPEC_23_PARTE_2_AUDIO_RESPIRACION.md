# INSTRUCCIÓN SPEC_23 · Parte 2 — El audio de Respiración: con la pantalla bloqueada y al volver (23C, cierra D-21.13)

**Para:** Claude Code
**Fecha:** 12 nov 2026 · **Versión:** 1.1 (reporte previo aprobado el 12 nov 2026: §9. **Donde §9 y el resto difieran, manda §9**)
**Rama de partida:** `strivo` en `ccecdb8` (la fusión de la Parte 1: 23A, 23B y el diagnóstico, con D-21.11 dentro). Compruébalo en §0.
**Gobierna:** esta instrucción + `docs/specs/INSTRUCCION_SPEC_23_PARTE_1_HAPTICA_FACE_ID_Y_DIAGNOSTICO.md` (sobre todo su §9 y su §10.2, los resultados del diagnóstico) + `docs/specs/SPEC_23_NATIVO_BIOMETRIA_HAPTICA_AUDIO.md` + `SPEC_00B` + `CLAUDE.md`. **Donde esta instrucción y otra difieran, manda esta.** En particular, **resuelve DP-23.3 con una opción que la SPEC no tenía, (c)**, y **sustituye DP-23.2**.
**Por qué existe:** D-21.13 bloquea la publicación: una sesión que corre en silencio no se publica. Y el audio con la pantalla bloqueada es la diferencia real con la app de referencia.

---

## 0. Antes de escribir una sola línea

1. Lee `CLAUDE.md` del repo (§8 Respiración; «App iOS (SPEC_21.1)» con «Lo que no se toca nunca» y el párrafo de `UIBackgroundModes`; las secciones de la Parte 1, sobre todo «El audio de Respiración al irse y al volver»), el §9 y el §10.2 de la Parte 1 y esta instrucción entera.
2. Comprueba que HEAD de `strivo` es `ccecdb8` o lo contiene. Si no, **para**.
3. Sigue en el worktree `~/Developer/strivo-23`. Pon `revision-23` al día con `strivo` (`git merge --ff-only strivo`; si no puede ser *fast-forward*, para y repórtalo). `~/Developer/strivo` no se toca.
4. Inspecciona lo que ya conoces de la Parte 1 (`lib/audio/contextoAudio.js`, `lib/audio/observadorAudio.js`, `lib/audioRespiracion.js`, `breathing/audio/`, `breathing/hooks/useSesionRespiracion.js`, `useWakeLock.js`, `lib/respiracion/maquinaSesion.js` y `relojSesion.js`, `components/shared/Respiracion.jsx`, `components/shared/DiagnosticoAudio.jsx`, `PantallaSesion.jsx`) y además: dónde se resuelve el nombre del patrón en el copy, `public/` (los íconos que podrían servir de imagen del cuadro de la pantalla de bloqueo), `index.html` (el `<title>`), y si WebKit expone `navigator.mediaSession` dentro del WebView de la app.
5. Entrega un **reporte previo** con todos los **REPORTA**, la lista de archivos que vas a crear o tocar y **los textos exactos** que la fundadora verá u oirá en cada prueba del §5.2, incluido lo que dice el cuadro de la pantalla de bloqueo.
6. **Espera la aprobación de la fundadora.** No cambies código antes.

---

## 1. Lo que dijo el diagnóstico (12 nov 2026, iPhone 17 con iOS 26)

| Tipo de sesión de audio | Al salir o bloquear | Al volver | Modo silencio | La música de otra app |
|---|---|---|---|---|
| **automático** (el de hoy) | El audio queda «interrumpido» y su reloj quieto (0,0 s de 20 s) | Dice «en marcha», el motor está vivo… y **no suena**, ni con toques (D1, D2, D3) | No suena | — |
| **reproducción** (`navigator.audioSession.type = 'playback'`) | **Sigue sonando**, también bloqueado más de 60 s (49,4 s de 49,4 s) | Sigue sonando; «Reanudar: no hizo falta» | **Suena** | **Baja de volumen** mientras suena Strivo; no se pausa |

- **Se confirma la hipótesis 4**: el tipo de sesión de audio de WebKit. Con el de por defecto, iOS trata el audio de Strivo como sonido de fondo.
- **La PWA en Safari se porta igual** que la app con «automático» (D0).
- **«Probar con un audio nuevo» devuelve el sonido** con «automático» (D8): cerrar el contexto y reconstruir el motor dentro de un toque funciona.
- **Con la pantalla bloqueada, en «reproducción», no se oía la guía**: solo el ambiente. Fuera de la app el JavaScript corre a medias (25 tics de 49, más o menos uno cada 2 s) y hay **0 fotogramas**, así que el reloj de la sesión no avanza, no hay cambios de fase y la sesión no puede terminar.
- **Con «reproducción», iOS enseña él solo un cuadro de reproducción en la pantalla de bloqueo, con el título «localhost»** y los botones de saltar en gris.

---

## 2. Decisiones

### 2.1 Ya tomadas, no se reabren

| Origen | Decisión |
|---|---|
| Fundadora, 12 nov 2026 | **DP-23.3 = (c): Web Audio en «reproducción».** Ni archivos de audio ni plugins nuevos: el motor de síntesis de hoy sigue siendo el único origen del sonido. (a) y (b) quedan descartadas. |
| Fundadora, 12 nov 2026 | **DP-23.2 cambia: la música de la persona baja de volumen mientras suena Strivo y vuelve a su volumen al terminar.** Es lo que hace «reproducción» y le gusta así. |
| SPEC_21.1 | **`UIBackgroundModes: [audio]` se queda**, porque ahora sí se usa. `appIos.test.js` lo sigue exigiendo. |
| DP-21.3 / DP-21.8 / DP-17B.2 | Identificador, esquema y host del WebView y base SQLite: **no se tocan**. |
| SPEC_23 §3.3 / criterio 8 | **Una sesión en silencio no reclama nada**: ni «reproducción», ni cuadro en la pantalla de bloqueo, ni toca la música de nadie. |
| SPEC_23 §3.6 / criterio 10 | **Nunca queda una sesión corriendo en silencio.** |
| RN-AUD-01 / RN-AUD-04 | El audio nace de un toque y al salir no queda nada vivo. |
| RN-RE-SND-24 | Al volver, el volumen regresa con la rampa de 0,4 s de `FUNDIDOS.reanudarContexto`. |
| SPEC_17B / SPEC_22 / Parte 1 | Pruebas manuales solo con lo que se ve y se oye; la build con `VITE_DIAG_AUDIO=1` sirve para medir. **Tras borrar la app, la primera apertura va con internet.** |
| Parte 1 | Commits por ruta, sin Team, sin «Update to recommended settings». `esIPhone()` es la única pregunta por la plataforma **para lo que solo es de la app de iPhone**; lo de esta Parte que vale también para la PWA se decide por si existe la API (DP-23.20). |

### 2.2 Nuevas, para confirmar en el reporte previo

| DP | Propuesta |
|---|---|
| **DP-23.19 · Cuándo se reclama «reproducción»** | **Al empezar una sesión con sonido** (ambiente distinto de silencio, o guía activada), dentro del toque de «Empezar», **antes** de crear o reanudar el contexto. En «Respira un momento», al empezar con el sonido activado. **Al terminar, al salir de la pantalla o al pasar a silencio**, se devuelve a `'auto'` y se suelta el contexto como hoy, para que la música de la persona vuelva a su volumen. Si alguien activa el sonido **a media sesión**, se reclama en ese toque y, si el contexto ya existía con otro tipo, se reconstruye el motor dentro del mismo toque (lo que hace «Probar con un audio nuevo»). **REPORTA** si devolver a `'auto'` basta para que la música ajena recupere su volumen, o si hace falta cerrar el contexto. |
| **DP-23.20 · Dónde vale** | **En la app de iPhone y en la PWA**, igual: se usa si existe `navigator.audioSession` (iOS 17 o más, en los dos). En navegadores sin esa API no se hace nada nuevo. Es el arreglo de D-21.13, que la fundadora pidió también para la PWA. Efecto aceptado: en Safari de iPhone, la PWA también sonará en modo silencio y con la pantalla bloqueada. |
| **DP-23.21 · El respaldo (iOS 16, y cualquier caso en que el audio no vuelva)** | La app admite iOS 16.2, donde `navigator.audioSession` no existe. Y hay un fallo conocido de WebKit: tras una llamada, el contexto queda «en marcha» pero mudo. **Respaldo:** al volver a la app con una sesión con sonido, si el reloj del audio no avanza en 0,5 s después de reanudar, **el siguiente toque reconstruye el motor** (cerrar el contexto, crear uno nuevo, volver a montar ambiente y guía en el punto de la sesión, con la rampa de 0,4 s). Si la sesión estaba en pausa, el toque es «Seguir». Es lo de D8 hecho comportamiento normal y sin texto nuevo. **REPORTA** cómo se comprueba «el reloj no avanza» sin falsos positivos y cómo lo pruebas sin un iPhone con iOS 16. |
| **DP-23.22 · El ritmo sigue con la pantalla bloqueada** | Con la sesión con sonido y la app oculta, **la guía sigue marcando las fases y la sesión termina sola**. Cómo: mientras la app está oculta, el reloj de la sesión deja de depender de `requestAnimationFrame` y lo mueve un temporizador (que iOS frena a uno cada ~2 s); en cada tic, **la guía programa por adelantado, sobre el reloj del audio, las fases de los próximos ~10 s** (ese reloj sí es exacto en segundo plano). Al cumplirse la duración, la sesión se cierra con su fundido de salida de siempre, también programado sobre el reloj del audio para que no dependa de que el tic llegue a tiempo. **Al volver**, `requestAnimationFrame` retoma lo visual en el punto real de la sesión, sin saltos de sonido; si terminó mientras estaba fuera, se ve el cierre. **La máquina sigue siendo la única fuente de verdad de las fases** (RN-RE-SND-19/20): lo que se programa por adelantado sale de `resolverEstado` con el mismo patrón, no de un segundo reloj. **REPORTA** cómo cancelas lo programado si la persona pausa, cambia de patrón, de volumen o de sonido, o sale; y qué pasa con la guía si la app vuelve justo en medio de un tramo programado. |
| **DP-23.23 · El caso 9.4 con sonido** | **Si la sesión tenía sonido y sonó mientras la app estaba fuera, al volver sigue, sin pausarse**: sí siguió. **Si era en silencio**, o el audio no sonó (iOS 16 sin reproducción, o tras una llamada), se pausa como hoy y la persona decide. La regla vive en la máquina (`notificarAusencia` recibe si hubo sonido) y tiene su prueba. |
| **DP-23.24 · El cuadro de la pantalla de bloqueo** | Con `navigator.mediaSession`: **título `bloqueo.titulo` («Respiración · Strivo») y subtítulo el nombre del patrón** (en «Respira un momento», `bloqueo.subtituloMomento`); imagen, el ícono de la app de `public/` si WebKit la acepta. Botones: **pausa** pausa la sesión y calla el sonido del todo mientras dure la pausa; **reproducir** la reanuda con la rampa; saltar y buscar, **sin acción** (en gris). Al terminar o salir, `metadata = null` y el cuadro desaparece. **REPORTA** si en el WebView de la app `navigator.mediaSession` cambia el título del cuadro (si no, qué título sale y de dónde, por ejemplo el `<title>` de `index.html`), y si «reproducir» desde la pantalla de bloqueo puede reanudar el audio sin un toque en la app. Si no puede, propón lo más pequeño (por ejemplo, que «reproducir» no aparezca y la sesión se reanude al volver con «Seguir»). |
| **DP-23.25 · Llamada entrante** | Lo que dice SPEC_23 §3.5: **iOS interrumpe; al colgar, la sesión no se reanuda sola**: queda en pausa con «Seguir», y ese toque devuelve el sonido (con el respaldo de DP-23.21 si el contexto quedó mudo). |
| **DP-23.26 · «Respira un momento»** | **Lo mismo que la sección**, a su escala: reproducción al empezar con sonido, el sonido sigue al salir y al volver, la guía sigue con la pantalla bloqueada (con el mismo mecanismo de DP-23.22, compartido en `lib/` si cabe sin acoplar el componente a `breathing/`), y si termina fuera, al volver ya está cerrada como hoy. **REPORTA** si compartir el mecanismo pide tocar mucho el componente; si es así, propón la versión mínima: sonido que sobrevive y vuelve (criterio 10) sin guía con la pantalla bloqueada. |
| **DP-23.27 · El Wake Lock** | Defecto encontrado en la Parte 1: tras una ausencia corta no se vuelve a pedir y la pantalla puede apagarse sola después. **Se vuelve a pedir al volver** si la sesión sigue en `activo` o `cerrando`. Nada más del Wake Lock cambia. |
| **DP-23.28 · El diagnóstico** | Se queda detrás de `VITE_DIAG_AUDIO`, con tres líneas nuevas: el tipo de sesión de audio **que rige** (ya existe), cuántas fases hay programadas por adelantado y hasta cuándo, y si el cuadro de la pantalla de bloqueo está puesto. **El control «automático / reproducción» y el botón «Probar con un audio nuevo» se retiran del panel** (ya no miden nada: el comportamiento normal decide). |

Criterio de producto de la fundadora, que manda sobre todo lo anterior: **quien respira con sonido puede bloquear el teléfono o salir un momento, y Strivo sigue acompañándola hasta el final, con la guía a su ritmo; al volver, todo está donde debe; y quien respira en silencio no nota nada distinto.**

---

## 3. Alcance

**Entra:** DP-23.19 a DP-23.28 en la sección Respiración y en «Respira un momento», en la app de iPhone y en la PWA; pruebas; `CLAUDE.md` (D-21.13 se cierra; la nota de `UIBackgroundModes` dice ahora por qué se queda); esta instrucción en `docs/specs/`; el §10 de la Parte 1 con los tres resultados que faltaban (§8, paso 1).

**No entra:** archivos de audio; plugins nuevos; código Swift; sonidos nuevos; cambiar la mezcla o los volúmenes de siempre; Android; SPEC_24 y SPEC_25; DP-21.5.

---

## 4. Cambios esperados (a confirmar en el reporte previo)

- **Un módulo de sesión de audio** en `lib/audio/` (por ejemplo `sesionAudio.js`): reclamar y soltar «reproducción», el cuadro de la pantalla de bloqueo y sus botones, sin conocer `breathing/` ni `diario/`.
- **El reloj de fondo** (DP-23.22) en `lib/respiracion/`: quién mueve la máquina cuando no hay fotogramas, y la programación por adelantado de la guía en `lib/audioRespiracion.js`.
- **`useSesionRespiracion.js`** y **`components/shared/Respiracion.jsx`**: usar lo anterior; el respaldo de DP-23.21; DP-23.23; DP-23.27.
- **`maquinaSesion.js`**: `notificarAusencia` con el dato de si hubo sonido.
- **`contextoAudio.js`**: la reconstrucción del motor como camino normal (hoy solo existe en el diagnóstico).
- **El diagnóstico** (DP-23.28).
- **`src/copy/index.js`**: `copy.respiracion.bloqueo` (§6).
- **Pruebas**, en archivos propios cuando se pueda.

**REPORTA, además:** tamaño del chunk principal antes y después; que sin sonido no cambia nada (pruebas de hoy sin tocar lo que comprueban); y si `index.html` necesita otro `<title>` para que la PWA no enseñe «localhost» u otra cosa rara en la pantalla de bloqueo.

---

## 5. Criterios de aceptación

### 5.1 Automáticos (Claude Code)

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde.
2. **Reclamar y soltar** (con dobles de `navigator.audioSession` y `navigator.mediaSession`): «reproducción» solo con sonido, dentro del toque y antes del contexto; vuelve a `'auto'` al terminar, salir o pasar a silencio; sin la API, nada se rompe.
3. **El reloj de fondo:** con la app oculta y sonido, las fases se programan por adelantado desde `resolverEstado`, en orden y sin huecos ni solapes; la sesión termina a su hora con el fundido; pausar, cambiar de patrón, de sonido o de volumen y salir cancelan lo programado; al volver no se repite ni se pierde ninguna fase.
4. **9.4:** con sonido que sonó fuera, no se pausa; en silencio, o sin sonido efectivo, sí.
5. **Respaldo:** si el reloj del audio no avanza tras reanudar, el siguiente toque reconstruye el motor una sola vez, en el punto de la sesión, con la rampa.
6. **El cuadro:** título y subtítulo del copy; pausa y reproducir hacen lo que dice DP-23.24; al terminar desaparece; en silencio no aparece.
7. **Wake Lock:** se vuelve a pedir al volver con la sesión en `activo` o `cerrando`.
8. **Sin sonido, todo igual:** las pruebas de Respiración, «Respira un momento», 23A y 23B pasan sin cambiar lo que comprueban.
9. `appIos.test.js` sigue exigiendo identificador, esquema, host, base y `UIBackgroundModes` = `['audio']`.
10. Sin `VITE_DIAG_AUDIO`, el diagnóstico no está en `dist/`.
11. Ningún commit lleva `DEVELOPMENT_TEAM` ni `GoogleService-Info.plist`.
12. **Al menos 20 casos nuevos.**

### 5.2 Manuales (la fundadora)

**Builds:** **«La 23C con diagnóstico»** = `~/Developer/strivo-23` con `VITE_DIAG_AUDIO=1 npm run ios:build`; **«La 23C limpia»** = la misma con `npm run ios:build`. Instalar encima no borra nada. Volumen a la mitad, modo silencio apagado salvo en A6.

- **A1 · Salir y volver.** Respiración: Lluvia, guía activada, 3 minutos. A mitad, a Fotos 30 s. **Debe oírse** mientras estás en Fotos: la lluvia y la guía (subidas y bajadas al ritmo). Al volver: la sesión **sigue, sin pausa**, en el punto que toca.
- **A2 · Bloquear.** Igual, bloqueando el teléfono 60 s. **Debe oírse:** lluvia y guía todo el rato. **En la pantalla de bloqueo:** «Respiración · Strivo» y el nombre del patrón. Tocar pausa: **silencio**. Tocar reproducir: vuelve (o lo que se apruebe en DP-23.24). Desbloquear: la sesión en el punto que toca.
- **A3 · Termina con la pantalla bloqueada.** Sesión de **1 minuto** con sonido; bloquear enseguida y esperar. **Debe oírse** el final con su fundido, y luego nada. El cuadro de la pantalla de bloqueo **desaparece**. Al desbloquear, el cierre de la sesión.
- **A4 · En silencio, nada cambia.** Sesión sin sonido ni guía; salir 30 s y volver. **Debe verse:** ningún cuadro en la pantalla de bloqueo, tu música (si suena) sin cambios, y al volver la sesión **en pausa**, como siempre.
- **A5 · Tu música.** Con música en Spotify o Apple Music, sesión con sonido: la música **baja** (o se pausa: anótalo); **al acabar el fundido final**, o al salir de Respiración, **vuelve a su volumen** (o a sonar) sola.
- **A6 · Modo silencio.** Con el modo silencio activado, sesión con sonido: **suena**.
- **A7 · «Respira un momento».** Con el sonido activado: salir 10 s y volver → **se oye**; empezar otra y bloquear → la guía sigue (o lo que se apruebe en DP-23.26).
- **A8 · (Si alguien puede llamarte) Una llamada.** Durante una sesión con sonido, recibir una llamada y colgar. **Debe verse:** la sesión en pausa con «Seguir»; al tocarlo, **vuelve el sonido**.
- **A9 · La PWA.** Tras fusionar, en Safari del iPhone, `beamish-wisp-ada776.netlify.app`: repetir A1 y A2. **Debe oírse** igual que en la app (el texto del cuadro puede ser otro; anótalo).
- **A10 · La web en la Mac.** En `localhost` (`npm run dev` en `~/Developer/strivo-23`): Respiración con y sin sonido, como siempre.
- **A11 · La limpia.** Instalar «La 23C limpia» encima: sin panel, y A1 sigue igual.

---

## 6. Copy

**Ningún texto existente cambia.** Nuevos, en `copy.respiracion.bloqueo`, sin «!» ni léxico prohibido:

| Clave | Texto |
|---|---|
| `titulo` | Respiración · Strivo |
| `subtitulo` | {nombre del patrón}, tal como sale en la pantalla de patrones |
| `subtituloMomento` | Respira un momento |

Diagnóstico (`diagnostico.js`, solo con la bandera; propuesta): `audio.programadas` — «Fases programadas por adelantado: {n} · hasta {hh:mm:ss}»; `audio.cuadro` — «Cuadro de la pantalla de bloqueo: {puesto · sin poner}».

---

## 7. Reglas de arquitectura que roza

- **Un solo reloj manda** (RN-RE-SND-19/20): lo que se programa por adelantado sale de la máquina, nunca de un temporizador que decida fases por su cuenta.
- **Nada bloquea y nada sale del teléfono:** el cuadro de la pantalla de bloqueo no lleva datos personales, solo el nombre del patrón.
- **Dirección de dependencias:** `lib/` no importa de `breathing/`, `diario/` ni de componentes; `components/shared/` no importa de `breathing/` ni de `diario/`.
- **El silencio por defecto se respeta** (RN-RE-11): sin sonido elegido, ni «reproducción» ni cuadro.

---

## 8. Entrega

1. **Primero**, en el §10.2 de la Parte 1 y en `CLAUDE.md`, los tres resultados que faltaban: **D8** — con «automático», «Probar con un audio nuevo» devuelve el sonido; **D7, al terminar** — con «reproducción» la música de otra app **baja de volumen**, no se pausa, y a la fundadora le parece bien; **D5** — con la pantalla bloqueada **no se oía la guía**, solo el ambiente. Un commit de docs.
2. Mismo worktree (`~/Developer/strivo-23`) y rama (`revision-23`, puesta al día con `strivo`).
3. Commits pequeños y por tema (sesión de audio y cuadro / reloj de fondo y guía por adelantado / 9.4 / respaldo / Wake Lock / «Respira un momento» / diagnóstico / pruebas / docs), por ruta, con la línea `Co-Authored-By` del repo.
4. **Sin push** hasta la aprobación. La fusión a `strivo` va después de A1–A8, A10 y A11; **A9 se prueba en Netlify después de fusionar** (hoy la PWA ya tiene el defecto, así que no hay regresión posible).
5. Reporte final: cada **REPORTA** con su respuesta, las siete validaciones, casos antes y después, el tamaño del chunk principal y la lista A1–A11 con lo que la fundadora verá y oirá.

---

## 9. Reporte previo y decisiones

Reporte previo de Claude Code (12 nov 2026) **aprobado por la fundadora con las decisiones de abajo**. Todo lo demás se aprueba tal como viene: archivos (`lib/audio/sesionAudio.js`, `lib/respiracion/relojDeFondo.js`, `lib/respiracion/tramos.js` y los tocados), `evaluar()` en el reloj, `tramosDesde` y `programar(tramos)` en la guía, `salirEn` en el ambiente, la regla `sono` (el reloj del audio avanzó al menos el 80 % del tiempo fuera) y los textos.

**Lo que el reporte encontró en el código de WebKit (iOS 17, iOS 26 y la rama actual), y manda sobre la instrucción:**

- **Los botones de la pantalla de bloqueo no llaman a nuestro código con Web Audio**: WebKit suspende y reanuda el contexto él solo. DP-23.24 se hace leyendo esos cambios de estado (ver la tabla).
- **Volver a `'auto'` no devuelve el volumen a la música ajena**: WebKit no desactiva la sesión. Se suelta con `'auto'` **y después cerrando el contexto**, en ese orden.
- **Un cambio de tipo vale al instante** para el contexto que ya suena: reclamar «reproducción» a media sesión no exige reconstruir el motor (corrige DP-23.19).
- **`navigator.mediaSession` y `navigator.audioSession` están encendidos en el WebView de la app** (iOS 17 y 26). El «localhost» del cuadro sale del origen (`capacitor://localhost`), no del `<title>`; con `metadata` se sustituye. `index.html` no cambia.
- **Anomalía sin explicar:** según WebKit, «reproducción» debería interrumpir la música ajena, pero en el iPhone la bajó. Ningún código depende de ello; A5 lo vuelve a mirar.
- **Dato de D1 (automático):** «Reloj del audio ahora: **quieto**», con «Audio: en marcha». Lo mismo en D2 y D3.
- **Defecto previo:** el control de volumen de la guía no hace nada (la guía no pasa por el mezclador). **Fuera de esta Parte**, anotado como deuda D-23.1 en `CLAUDE.md`, para una tarea aparte antes de los testers externos.

| Punto | Decisión |
|---|---|
| **DP-23.24 · Botones de la pantalla de bloqueo** | **Aprobado** detectarlos por el estado del contexto: «suspendido» que no provocó nuestro código → pausar la sesión; vuelta a «en marcha» → reanudarla con la rampa, sin tocar la app. **Se acepta** que «reproducir» no haga nada si la pausa se hizo desde la app (se reanuda con «Seguir»). Imagen: `icon-512.png`; si WebKit no la carga desde `capacitor://`, el cuadro va sin imagen. |
| **DP-23.19 · Soltar** | **Aprobado:** la música ajena recupera el volumen **al acabar el fundido final** (`'auto'` y cerrar el contexto), no al salir de Respiración. «Otra vez» monta un contexto nuevo en su toque. |
| **Encender la guía a media sesión** | **Entra:** se crea la guía en ese mismo toque. |
| **DP-23.21 · Respaldo** | **Aprobada la regla** de 500 ms de reloj de pared, con al menos 400 ms reales, y cualquiera de: el reloj del audio avanzó menos de 0,1 s, el contexto no está «en marcha», o pasó por «interrumpido» fuera. Sin `suspend()`/`resume()`. |
| **DP-23.25 · Llamada** | Aprobado: «interrumpido» pausa y no se reanuda solo; solo se reanuda sola la pausa que vino de la pantalla de bloqueo. |
| **DP-23.26 · «Respira un momento»** | **Versión completa**, con las piezas de `lib/` y los textos del cuadro por props desde Hoy. |
| **DP-23.27 y DP-23.28** | Aprobados tal como vienen. |
| **Casos nuevos** | Los 25 o más prometidos. |

---

## 10. Implementación y pruebas manuales

### 10.1 Implementación (Claude Code, 12 nov 2026)

En `~/Developer/strivo-23`, rama `revision-23` (puesta al día con `strivo` en `ccecdb8` por avance
rápido), sin push. Commits por tema:

| Commit | Qué |
|---|---|
| `57badac` | §8 paso 1: D8, D7 y D5 en la Parte 1 y en `CLAUDE.md` |
| `531385a` | `lib/audio/sesionAudio.js`: reclamar, soltar, el cuadro y `vigilar`; `copy.respiracion.bloqueo` |
| `720ce9a` | Reloj de fondo y guía por adelantado (piezas): `evaluar`, `msCierrePrevisto`, `tramos.js`, `relojDeFondo.js`, `programar(tramos)`, `salirEn` |
| `c221190` | El 9.4 con sonido |
| `b1e452c` | El respaldo (piezas): `audioMudo`, `medirReloj`, `sonoFuera`, `alSiguienteToque` |
| `17843ec` | El Wake Lock |
| `c15596e` | La sección: todo lo anterior, y `acompanamientoDeFondo.js` |
| `00dfa38` | «Respira un momento» |
| `e328677` | El diagnóstico solo mide |
| `b64cfb7` | Pruebas |
| (docs) | `CLAUDE.md` y esta instrucción |

- **Lo que se encontró al implementar:**
  - El cierre de una sesión en minutos se medía desde el instante en que se detectaba. Con tics de
    2 s eso podía alargar la sesión un ciclo. Ahora sale del límite; con la app a la vista solo
    cambia un caso de borde.
  - Si se pausa en la pantalla de bloqueo y se desbloquea, el despertar de la vuelta reanudaba el
    contexto y se habría tomado por «reproducir». Ahora solo se reanuda sola con la app fuera.
- **Casos:** de 2.874 a 2.956 en `indexeddb` y de 2.803 a 2.885 en `sqlite` (+82 por proyecto).
  Se tocaron, solo para añadir lo nuevo, la lista de bloques de `copy.respiracion` y las pruebas
  del diagnóstico.
- **Chunk principal de la web:** de 744,69 a 758,18 kB (gzip, de 211,16 a 215,11).
- **D-23.1** (el volumen de la guía no hace nada) anotada como deuda en `CLAUDE.md`.

### 10.2 Pruebas manuales

**A1–A8, A10 y A11 pasan** (12 nov 2026, la fundadora en su iPhone con «La 23C con diagnóstico»).

- **El cuadro de la pantalla de bloqueo** sale con el ícono de la app, «Respiración · Strivo» y
  «Calma 5-5-3», y **pausa y reproducir funcionan**. Así queda confirmado en el teléfono lo que se
  había leído en el código de WebKit: la pausa y el reproducir llegan como cambios de estado del
  contexto, y `mediaSession.metadata` sustituye a «localhost». WebKit carga la imagen desde
  `capacitor://`.
- **O-23.1 (no bloquea):** en A5 la música de otra app **baja durante la sesión, pero al terminar se
  pausa** en lugar de volver a su volumen. Queda anotada en `CLAUDE.md`, junto a D-23.1, como tarea
  para antes de los testers externos.
  - Una pista, sin comprobar: WebKit desactiva la sesión de audio sin la opción que avisa a las
    demás apps de que pueden seguir (`NotifyOthersOnDeactivation`).
- **A9** (la PWA en Netlify) se repite después de fusionar.
