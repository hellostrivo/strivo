# SPEC_23 — Biometría para el Journal, háptica y audio en segundo plano

**Tarea del Gantt:** A7 · **Dependencias:** SPEC_21
**Fases (un commit cada una):** 23A biometría · 23B háptica · 23C audio en segundo plano

> **Actualización 14 oct 2026 (validación de SPEC_21.1):** 23C hereda el defecto D-21.13 —el sonido de Respiración no vuelve al regresar a la app—. Ver §6 «Hallazgo del 14 oct», el punto 6 de §3 y el criterio 10.

---

## 1. Nombre, objetivo y problema que resuelve

**Objetivo:** tres capacidades nativas que mejoran la experiencia real y, en conjunto con SPEC_17B y SPEC_22, constituyen la defensa frente a la Guideline 4.2.

**Problemas:**
- El PIN del Journal exige teclear cada vez. Face ID lo vuelve instantáneo sin bajar la seguridad.
- Las transiciones de Strivo están diseñadas con motion intencional; la háptica sutil las completa en el cuerpo, no solo en la pantalla.
- Respiración no puede sonar con la pantalla bloqueada. Es la limitación conocida y aceptada de la PWA, y la razón por la que quedó por debajo de la app de referencia. Capacitor lo resuelve.
- **(14 oct)** Además, al salir de la app a mitad de una sesión con sonido y volver, el sonido no regresa aunque la sesión siga (D-21.13). Le pasa a la app de iPhone y, con toda probabilidad, a la PWA en iPhone.

## 2. Alcance

**23A Biometría:** desbloqueo del Journal con Face ID / Touch ID como alternativa al PIN, opt-in, con el PIN siempre como respaldo.
**23B Háptica:** tres eventos discretos: completar un momento en Hoy, seleccionar chip de emoción, cambio de fase en Respiración (inhalar→exhalar→pausa).
**23C Audio:** que los sonidos procedurales de Respiración sigan con la pantalla bloqueada; controles básicos en pantalla de bloqueo; **y que el sonido vuelva al regresar a la app, en Respiración y en «Respira un momento» de Hoy (D-21.13)**.

**Fuera:** cifrado del Journal con clave biométrica (sigue siendo bloqueo de acceso), háptica en cualquier otro punto, patrones hápticos custom, sonidos nuevos, archivos de audio, Wake Lock (queda obsoleto en nativo), Android (SPEC_26/27).

## 3. Experiencia de usuario

**23A Biometría**
1. Solo aparece si la persona ya tiene PIN. En Ajustes → Journal: interruptor "Abrir con Face ID" (el nombre cambia a Touch ID según el dispositivo; en web no aparece).
2. Al activar: se pide el PIN una vez (confirmación de identidad) y luego el sistema pide Face ID. Si el dispositivo no tiene biometría configurada, el interruptor no se muestra.
3. Al abrir el Journal con biometría activa: el sistema muestra Face ID directamente. Éxito → Journal abierto. Fallo o cancelación → pantalla del PIN de siempre, sin mensaje de error adicional (el sistema ya lo comunicó).
4. Cambiar o quitar el PIN desactiva la biometría; hay que activarla de nuevo.
5. Si la biometría del sistema cambia (se registra una cara nueva), iOS invalida la clave: la app vuelve al PIN y el interruptor queda apagado con el texto `biometriaCambiada`.

**23B Háptica**
- Un solo toque suave (`impact light`) en los tres eventos. Nunca en errores. Nunca en la transición de entrada. Respeta el ajuste del sistema: si la persona apagó la háptica del sistema, no hay háptica. Sin interruptor propio en Ajustes (DP-23.1).

**23C Audio en segundo plano**
1. La persona inicia una sesión de Respiración con sonido activado y bloquea el teléfono: el sonido continúa hasta que la sesión termina.
2. En la pantalla de bloqueo aparece el control de reproducción del sistema con título "Respiración · Strivo" y el nombre del patrón; pausar detiene el sonido y la sesión.
3. Con sonido en silencio (el valor por defecto), nada cambia: no se reclama la sesión de audio.
4. Al terminar la sesión, la app libera la sesión de audio; la música de la persona, si estaba sonando, se reanuda (opción `mixWithOthers` desactivada durante la sesión, DP-23.2).
5. Llamada entrante: el sistema interrumpe; al colgar, la sesión no se reanuda sola (se muestra en pantalla el botón de continuar).
6. **(14 oct, D-21.13)** La persona sale a otra app, o bloquea la pantalla, a mitad de una sesión con sonido y vuelve: si la sesión sigue, el sonido sigue o regresa solo, con la rampa de RN-RE-SND-24 (`FUNDIDOS.reanudarContexto`, 0,4 s). Como mucho, con el primer toque. Nunca queda una sesión corriendo en silencio. Vale igual para «Respira un momento» de Hoy. **Esto se exige también si DP-23.3 se resuelve con (b)**: aunque no haya sonido con la pantalla bloqueada, al volver tiene que sonar.

## 4. Textos exactos

`copy.journal.biometria.*` y `copy.respiracion.bloqueo.*`:

| Clave | Texto |
|---|---|
| `biometria.interruptor` | Abrir con {Face ID / Touch ID} |
| `biometria.texto` | Tu PIN sigue siendo el respaldo. |
| `biometria.confirmarPin` | Escribe tu PIN para activar {Face ID / Touch ID}. |
| `biometria.cambiada` | El teléfono cambió su configuración de {Face ID / Touch ID}. Actívalo de nuevo cuando quieras. |
| `biometria.noDisponible` | (no se muestra texto; el interruptor se oculta) |
| `bloqueo.titulo` | Respiración · Strivo |
| `bloqueo.subtitulo` | {nombre del patrón} |

El nombre de la biometría lo devuelve el plugin; se interpola, no se hardcodea.

## 5. Interfaz, accesibilidad y consistencia

- El interruptor de biometría va en la misma sección de Ajustes donde vive "Cambiar PIN" (Claude Code confirma dónde está `CuentaParaPin` y coloca la opción junto).
- La háptica no sustituye ninguna señal visual: todo evento háptico ya tiene su cambio visual.
- Los controles de la pantalla de bloqueo usan la API nativa (MPNowPlayingInfoCenter vía el plugin), accesibles por VoiceOver del sistema.

## 6. Requisitos técnicos

**Dependencias:**
- 23A: `@capacitor-community/biometric` (o `capacitor-native-biometric`; Claude Code compara mantenimiento reciente y reporta cuál). Justificación: no hay plugin oficial.
- 23B: `@capacitor/haptics` (oficial).
- 23C: ver DP-23.3. Punto de partida: `@capacitor-community/background-audio`… **no existe un plugin oficial ni comunitario maduro para mantener Web Audio en segundo plano**. Ver riesgos.

**23A.** Al activar: se genera una clave aleatoria de 32 bytes, se guarda en Keychain con `accessControl: biometryCurrentSet`, y se usa para envolver un token que el `JournalLock` acepta como equivalente a PIN correcto. El PIN en sí **no** se guarda en Keychain. Si Keychain devuelve error de biometría invalidada, se limpia y se apaga el interruptor.

**23B.** `Haptics.impact({ style: 'light' })` en los tres puntos. En web es no-op sin error.

**23C.** Requisitos: `UIBackgroundModes: audio` (ya declarado en SPEC_21); activar `AVAudioSession` categoría `playback` al iniciar sesión con sonido; publicar `NowPlayingInfo`; escuchar eventos de control remoto (play/pause). El motor de sonido sigue siendo `audioRespiracion.js` (síntesis procedural, sin archivos).

**Punto crítico:** WKWebView suspende el `AudioContext` de Web Audio al pasar a segundo plano en muchos casos aunque la sesión de audio esté activa. Claude Code debe **probar esto primero**, en dispositivo, antes de construir nada más de 23C, y reportar el resultado. Si el `AudioContext` se suspende, se aplica DP-23.3.

**Hallazgo del 14 oct (D-21.13, validación manual de SPEC_21.1).**
- **Lo que se vio:** en el iPhone 17 de la fundadora, con iOS 26.6.2 y la build de `revision-21-1`, se sale de la app a mitad de una sesión con sonido, saltando a otra app. El sonido se corta, y al volver no regresa: ni solo, ni tocando la pantalla, ni subiendo el volumen. La sesión sigue corriendo. Pasa igual en Respiración y en «Respira un momento» de Hoy.
- **Lo que se intentó, sin éxito:** commits de D-21.13 en `revision-21-1`.
  - `reanudar()` llama a `resume()` en cualquier estado que no sea `running` ni `closed` (antes solo con `suspended`), con un techo de 1 s.
  - Si no corre, reintenta con el siguiente toque.
  - Al volver usa la rampa de 0,4 s de RN-RE-SND-24.
  - Se extendió a «Respira un momento».
  - Los cambios se conservan: no hacen daño y cubren el caso `suspended` de otros navegadores.
- **Causa: sin confirmar.** Lo primero de 23C, antes del punto crítico de arriba, es diagnosticarla con el **Inspector web de Safari** conectado al iPhone. Hay que medir:
  - el estado del `AudioContext` al ocultarse y al volver, incluidos los eventos `statechange`;
  - si `resume()` resuelve o rechaza;
  - si `currentTime` avanza después de volver;
  - si los nodos del motor (fuentes, planificador) siguen vivos o hay que reconstruirlos.
- **Hipótesis a descartar en ese orden:**
  1. el contexto corre pero el grafo de nodos murió o el planificador dejó de programar mientras la página estaba oculta;
  2. WebKit no recupera ese contexto y hay que cerrarlo y crear uno nuevo, reconstruyendo el motor;
  3. la sesión de audio de iOS (`AVAudioSession`) quedó desactivada y hay que reactivarla desde nativo, que es lo mismo que pide 23C.
- **Alcance:** afecta también, con toda probabilidad, a la PWA en iPhone y iPad (mismo motor WebKit). El arreglo debe probarse en las dos.

**Privacidad.** La biometría nunca sale del dispositivo (es del sistema). El Now Playing no incluye datos personales.

## 7. Criterios de aceptación

**23A**
1. Activar Face ID, cerrar la app, abrir el Journal: Face ID → abierto. Cancelar Face ID → PIN.
2. Cambiar el PIN: la biometría queda apagada.
3. Registrar una cara nueva en iOS: la app vuelve al PIN y muestra `biometriaCambiada`.
4. En web, el interruptor no existe.

**23B**
5. Completar momento, elegir emoción, cambio de fase en Respiración: un toque suave en cada uno. Con háptica del sistema apagada: nada.

**23C**
6. Sesión con sonido, bloquear pantalla: el sonido continúa hasta el fin de la sesión.
7. Pantalla de bloqueo muestra "Respiración · Strivo"; pausar detiene sesión y sonido.
8. Sesión en silencio: no aparece control en pantalla de bloqueo, no se interrumpe música ajena.
9. Al terminar, la música de la persona (Spotify/Apple Music) se reanuda.
10. **(D-21.13)** Sesión con sonido, salir a otra app a mitad y volver: el sonido regresa solo con rampa suave o, como mucho, con el primer toque. Lo mismo bloqueando la pantalla, y lo mismo en «Respira un momento» de Hoy. Se comprueba en la app de iPhone y en la PWA en Safari de iPhone.

Suite verde; al menos 25 pruebas nuevas (estado del interruptor, invalidación, no-op web, mapeo de eventos hápticos, ciclo de vida de la sesión de audio con plugin mockeado).

## 8. Plan de pruebas

**Unitarias:** máquina de estados del desbloqueo (PIN / biometría / invalidada), disparadores hápticos, ciclo de vida de sesión de audio.
**Integración:** plugins mockeados; `JournalLock` acepta token biométrico solo si el interruptor está activo.
**Manuales:** criterios 1–10 en iPhone con Face ID y, si es posible, en uno con Touch ID. Prueba de llamada entrante durante Respiración. El criterio 10 también en la PWA en Safari de iPhone.
**Regresión:** el PIN sin biometría funciona exactamente como antes; recuperación por reautenticación intacta; Respiración en web sin cambios.

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Web Audio se suspende en segundo plano | Prueba en dispositivo **antes** de construir; DP-23.3 define el camino | 23C se entrega como "primer plano + Now Playing" y se documenta |
| El sonido no vuelve al regresar a la app (D-21.13) | Diagnóstico con el Inspector web de Safari antes de arreglar (§6) | No hay reversión aceptable: una sesión corriendo en silencio no se publica. Si no se resuelve, se pausa la sesión al volver, con el botón de continuar a la vista, para que el toque de la persona arranque el audio desde un gesto |
| Plugin de biometría sin mantenimiento | Comparar dos plugins; elegir el de commits más recientes; reportar | Quitar 23A; el PIN queda como está |
| Háptica percibida como "gamificación" | Solo tres eventos, todos suaves, ninguno de recompensa por racha | Quitar 23B (un commit) |

## 10. Orden y dependencias

Octavo. Requiere SPEC_21. 23A, 23B y 23C son independientes entre sí; se pueden aprobar por separado.

## Decisiones pendientes

- **DP-23.1** ¿Interruptor propio de háptica en Ajustes? Recomendación: no; se respeta el del sistema y se evita una opción más.
- **DP-23.2** Durante la sesión con sonido, ¿mezclar con la música de la persona o pausarla? Recomendación: pausarla (categoría `playback` exclusiva), porque los sonidos de Respiración están diseñados para ir solos.
- **DP-23.3** Si Web Audio no sobrevive en segundo plano: (a) pre-renderizar cada uno de los cinco sonidos procedurales a archivos cortos en loop **generados por el propio motor de síntesis en tiempo de build** (mantiene la decisión de "cero archivos externos" en espíritu: el origen sigue siendo la síntesis) y reproducirlos con `@capacitor-community/native-audio`; (b) aceptar solo primer plano en v1.0 y documentarlo. Recomendación: **(a)**, porque el audio con pantalla bloqueada es la diferencia real con la referencia de producto. Es una decisión de producto: la toma la fundadora. **(14 oct)** Con (a), el audio deja de pasar por Web Audio en nativo y D-21.13 probablemente desaparece en la app, pero la PWA lo sigue necesitando. Con (b), D-21.13 hay que resolverlo igual (§3, punto 6).
