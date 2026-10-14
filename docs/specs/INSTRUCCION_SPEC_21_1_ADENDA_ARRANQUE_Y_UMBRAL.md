# INSTRUCCIÓN SPEC_21.1 — Adenda: D-21.11 (destello oscuro al abrir) y D-21.12 (bandas del umbral)

**Fecha:** 14 oct 2026 · **Rama:** `revision-21-1`, en el clon local `~/Developer/strivo` · **Origen:** grabación a 60 fps del criterio 7 en Mañana, medida cuadro por cuadro.
**Decisión de la fundadora:** D-21.12 se resuelve con la opción B (el video llena la pantalla en teléfonos). Es un desvío aprobado respecto a §4.9 de la instrucción 21.1, que no permitía tocar componentes de pantalla.

---

## 0. Antes de tocar nada

1. Lee `CLAUDE.md`, `docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md` y esta adenda.
2. Reporta la salida de `git log --oneline 6210f7c..HEAD` y de `git status`. Lo esperado: encima de `6210f7c` están el arreglo de D-21.9 y `71357ee`, y el **único** cambio sin comitear es `ios/App/App.xcodeproj/project.pbxproj` (el Team de firma, que es local y **no se comitea nunca**). Si ves cualquier otra cosa, para y repórtalo.
3. El alcance está cerrado: no hace falta reporte previo. Implementa, valida y **no comitees** hasta que la fundadora haya medido la grabación nueva (§5).

---

## 1. D-21.11 — La ventana pasa por negro mientras iOS abre la app

**Lo que se vio.** Mientras iOS agranda el ícono para abrir la app, la ventana se oscurece antes de que aparezca el papel. En el primer arranque tras instalar llegó a negro puro unos 67 ms (4 cuadros con brillo < 10 de 255). En los otros dos arranques bajó a un gris muy oscuro (~30). Después sube al papel en ~300 ms, con saltos de hasta +25 por cuadro. El fundido propio de la app no pasa de −14.

**Causa (confirmada el 14 oct: el iPhone de la fundadora está en modo oscuro).** En `ios/App/App/Base.lproj/LaunchScreen.storyboard` el `imageView` tiene `backgroundColor` = `systemBackgroundColor`, que es blanco en modo claro y **negro en modo oscuro**. La imagen `Splash` (2732×2732) tarda un instante en pintarse, y en ese hueco se ve el fondo. En modo claro el mismo hueco saldría blanco: con fondo fijo de papel, los dos modos quedan iguales.

**Cambio.**
- En ese `imageView`, `backgroundColor` pasa a ser papel `#FBF8F4` fijo: `<color key="backgroundColor" red="0.98431372549019602" green="0.97254901960784312" blue="0.95686274509803926" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>`.
- Quita el recurso `systemColor name="systemBackgroundColor"` de `<resources>` si deja de usarse.
- No toques nada más del storyboard (`contentMode`, `image="Splash"`, restricciones) ni `Assets.xcassets/Splash.imageset`.
- Confirma, leyendo el código de `@capacitor/assets@3.0.5`, si `npm run ios:recursos` reescribe el storyboard. Si lo reescribe, repórtalo: habría que anotarlo en `CLAUDE.md`. No ejecutes `ios:recursos` para comprobarlo.
- Después de `npm run ios:build` (que incluye `cap sync ios`), comprueba con `git diff` que el storyboard conserva el cambio.

**Prueba nueva** en `src/lib/__tests__/appIos.test.js`, con un `describe` propio para `ios/App/App/Base.lproj/LaunchScreen.storyboard`:
- el fondo del `imageView` es exactamente `#FBF8F4` en sRGB;
- el archivo no contiene `systemBackgroundColor`;
- la imagen sigue siendo `Splash` con `scaleAspectFill`.

**Regla que roza:** DP-21.1 (el arranque es papel, igual de día que de noche, y no cambia con el modo oscuro del sistema).

---

## 2. D-21.12 — El umbral sale como un rectángulo índigo con bandas de papel

**Lo que se vio.** De día, durante todo el umbral (~3,5 s), el video se ve como un rectángulo índigo con bandas de papel de ~79 pt arriba y ~75 pt abajo.

**Causa.** El video es vertical, 1080×1920 (9:16), y en `src/components/shared/TransicionLuz.jsx` se muestra con `object-contain`. En una pantalla más alargada que 9:16 (todos los iPhone actuales, ~9:19,5) sobra alto, y ese hueco lo llena el velo, que en Mañana es papel (`--transicion-velo: #FBF8F4`). De noche el velo es índigo y casi no se nota, pero tampoco empata con el fondo del video. Pasa igual en la PWA en cualquier teléfono: no lo trajo la 21.1.

**La lección del 25 de agosto sigue en pie.** `object-cover` sin condición agranda el video hasta 1440×2560 en una laptop y en iPad recortaba 278 px. Eso no puede volver.

**Cambio.**
- `object-contain` se queda como valor por defecto.
- **Solo cuando la ventana es más alargada que el video** se usa `object-cover`. Sugerencia: la variante arbitraria de Tailwind 3.4 en el `className` del `<video>`: `object-contain [@media(max-aspect-ratio:9/16)]:object-cover`. Si eliges otra forma (una clase en `globals.css`, por ejemplo), comprueba el orden de capas: `.velo-transicion` y compañía viven en `@layer utilities` y no deben perder contra la utilidad `object-contain`.
- La proporción `9/16` sale del video (1080×1920). Déjalo dicho en el comentario: si el diseñador entrega otro video con otra proporción, hay que cambiar ese número.
- Qué queda en cada caso: iPhone (nativo y Safari) → `cover`. iPad en vertical (3:4) y laptop → siguen en `contain`, con el velo llenando los lados como hoy.
- En un iPhone 17 (402×874 pt) el video se pinta a ~491×874 y recorta ~45 pt por lado (9 %). La «S» y la palabra STRIVO ocupan del 17 % al 85 % del ancho, así que caben. Compruébalo con capturas.
- **Este archivo no admite un signo de interrogación** ni en código ni en comentarios (prueba de la línea ~149 de `transicionLuz.test.js`). La media query no lleva ninguno; tampoco lo metas en el comentario.
- No cambian los colores del velo (`--transicion-velo`), ni las animaciones, ni los tiempos, ni nada fuera del `className` del `<video>` y su comentario.

**Pruebas** en `src/components/shared/__tests__/transicionLuz.test.js`:
- Reescribe «el fotograma entero cabe en la pantalla, sea cual sea». Ahora debe comprobar que `object-contain` es el valor por defecto y que `object-cover` aparece **solo** dentro de la variante `max-aspect-ratio:9/16`, nunca suelto. Conserva el comentario del 25 de agosto y añade debajo el porqué de este cambio (14 oct, bandas de papel en iPhone).
- Una prueba nueva: la proporción de la media query coincide con la del archivo de video. Si es barato, que la saque de las dimensiones reales del `.mp4`; si no, con el `9/16` escrito y el comentario.
- «y va centrado…» y «ni el video ni el logo se miden en píxeles…» deben seguir pasando sin cambios.

**Comprobación en navegador** (`npm run dev`, DevTools en modo dispositivo). Reporta el `object-fit` calculado del `<video>` y una captura del umbral en cada uno de estos tamaños:
- 402×874 (iPhone 17) → `cover`, sin bandas, «S» y STRIVO enteras;
- 375×667 (iPhone SE) → `cover`;
- 820×1180 (iPad vertical) → `contain`;
- 1440×900 (laptop) → `contain`, igual que hoy.

**Reglas que roza:** «nada bloquea» (el umbral se sigue saltando con un toque; no cambia) y `prefers-reduced-motion` (con movimiento reducido no se monta el video; no cambia).

---

## 3. Validaciones

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases`, en verde.
2. `npm run ios:build` sin errores, y `git diff` del storyboard intacto después.
3. Número de archivos de prueba y de casos (antes y después).

---

## 4. Entrega

- Prepara **dos commits**, sin hacerlos todavía:
  - `fix(ios): la pantalla de arranque es papel de fondo, no el color del sistema (D-21.11)`
  - `fix(umbral): en teléfonos el video llena la pantalla, sin bandas del velo (D-21.12)`
  - Cada uno termina con la línea `Co-Authored-By` que usa el repo.
- Al comitear, añade los archivos **por ruta**. Nunca `git add -A`, `git add .` ni `git commit -a`, porque arrastrarían el `project.pbxproj` con el Team.
- Sin push.
- Añade dos filas a la tabla de desvíos §2 de `docs/specs/INSTRUCCION_SPEC_21_1_CAPACITOR_IOS.md`: D-21.11 y D-21.12. La de D-21.12 dice que se tocó `TransicionLuz.jsx` con aprobación de la fundadora del 14 oct.
- Reporte final: `git diff --stat`, el diff completo de los dos cambios, las validaciones, las cuatro capturas con su `object-fit`, y lo que encontraste sobre `@capacitor/assets` y el storyboard.

---

## 5. Para la fundadora, después del reporte

1. En Xcode, ▶ al iPhone. Reinstala y borra los datos, y no pasa nada porque el 9 y el 10 aún no empiezan.
2. Cierra la app por completo y graba un arranque **de día**, igual que esta mañana. En la grabación se mide:
   - que no hay oscuro mientras iOS agranda el ícono;
   - que el umbral llena la pantalla sin bandas;
   - que la «S» y STRIVO no salen cortadas;
   - que el fundido de papel a umbral sigue suave.
3. Si pasa: se hacen los dos commits. Comitear no cambia la build, así que no hace falta recompilar.
4. Con **esa misma build**, sin volver a pulsar ▶: criterios 9 y 10 de corrido, luego 11 y 15.
5. Esta noche, con esa misma build, una grabación de arranque de noche para cerrar el criterio 7 completo.
6. Al fusionar a `strivo`: además del criterio 5 en Netlify, abre el umbral de la PWA en el teléfono y comprueba que tampoco ahí hay bandas.
