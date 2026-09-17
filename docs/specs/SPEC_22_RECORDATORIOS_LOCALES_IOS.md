# SPEC_22 — Recordatorios locales de mañana y noche (iOS)

**Tarea del Gantt:** A6 · **Dependencias:** SPEC_21

> Corrección respecto al plan maestro: el Gantt decía "push (APNs)". Los recordatorios de Strivo no necesitan servidor ni APNs: son **notificaciones locales** programadas en el dispositivo. Es más simple, más privado (nada sale del teléfono) y cuenta igual como funcionalidad nativa frente a la Guideline 4.2. Push remoto queda fuera de v1.0.

---

## 1. Nombre, objetivo y problema que resuelve

**Objetivo:** que la persona pueda elegir, si quiere, una hora de la mañana y una de la noche para que Strivo la invite a su momento, con notificaciones locales que llegan aunque la app esté cerrada.

**Problema:** el valor de Strivo está en el ritual diario. Sin un recordatorio nativo, la app depende de que la persona se acuerde. Y hoy no hay ningún mecanismo: los pop-ups automáticos (RN-RN-01) quedaron en Fase 2.

## 2. Alcance

**Entra:** pantalla "Recordatorios" en Ajustes con dos horas opcionales; solicitud del permiso del sistema en el momento correcto; programación diaria repetible de dos notificaciones locales; reprogramación al cambiar horas o zona horaria; apertura de la app en la sección correcta al tocar la notificación; textos rotativos de las notificaciones.

**Fuera:** push remoto, notificaciones por inactividad ("hace 3 días que no escribes" — prohibido por tono), resúmenes semanales, cualquier notificación que no haya pedido la persona, badges numéricos en el ícono, Android (SPEC_27).

## 3. Experiencia de usuario

**3.1 Descubrimiento.** No se pide el permiso al instalar ni en el onboarding. La primera vez que la persona completa un momento (Mañana o Noche) en Hoy, al terminar aparece una tarjeta suave, una sola vez: "¿Quieres que te recordemos este momento?" con "Elegir hora" y "Ahora no". "Ahora no" no vuelve a preguntar; la opción queda en Ajustes.

**3.2 Ajustes → Recordatorios.**
- Dos filas: "Mañana" y "Noche", cada una con interruptor y hora. Valores iniciales sugeridos: 08:00 y 21:30 (DP-22.1).
- Al activar la primera: se pide el permiso del sistema en ese instante (no antes). Si lo niega: el interruptor vuelve a apagado y aparece el texto `permisoDenegado` con "Abrir Ajustes del teléfono".
- Cambiar la hora reprograma al momento.

**3.3 Recibir la notificación.** Título "Strivo", cuerpo rotativo (sección 4). Sin sonido personalizado: el del sistema, y respeta "No molestar". Tocarla abre la app en Hoy, con el momento correspondiente ya seleccionado (Mañana o Noche).

**3.4 Casos límite.**
- Ya completó el momento hoy: la notificación de ese momento **no se muestra** (se cancela al completar y se reprograma para mañana).
- Cambio de zona horaria (viaje): se reprograma a la hora local del dispositivo al abrir la app.
- Hora de la noche posterior a `diaTerminaA`: se trata como noche de ese día (Claude Code confirma con `timeSlot.js`).
- Permiso revocado desde Ajustes del sistema: al abrir la app, los interruptores aparecen apagados con el texto `permisoDenegado`.
- Desinstalar y reinstalar: las horas se restauran desde el perfil en la nube, pero el permiso hay que pedirlo de nuevo.

## 4. Textos exactos

`copy.recordatorios.*`:

| Clave | Texto |
|---|---|
| `tarjeta.titulo` | ¿Quieres que te recordemos este momento? |
| `tarjeta.elegir` | Elegir hora |
| `tarjeta.ahoraNo` | Ahora no |
| `ajustes.titulo` | Recordatorios |
| `ajustes.texto` | Un aviso discreto. Puedes cambiarlo o apagarlo cuando quieras. |
| `ajustes.manana` | Mañana |
| `ajustes.noche` | Noche |
| `permisoDenegado` | Para recordarte, Strivo necesita permiso del teléfono. |
| `abrirAjustes` | Abrir Ajustes del teléfono |

Cuerpos rotativos de la notificación (se elige uno al azar por envío; el título es siempre "Strivo"):

Mañana:
1. Un momento para empezar el día contigo.
2. Tu mañana te espera. Sin prisa.
3. Antes de que el día arranque, un respiro.

Noche:
1. Un momento para cerrar el día.
2. Lo que pasó hoy merece un lugar.
3. Antes de dormir, un respiro.

Sin nombre de la persona en la notificación (aparece en la pantalla bloqueada de un teléfono que puede estar a la vista).

## 5. Interfaz, accesibilidad y consistencia

- La tarjeta de 3.1 reutiliza el componente de tarjeta de Hoy, con el mismo destaque de luminancia que la tarjeta de ritual.
- Selector de hora: el nativo del sistema (`<input type="time">` renderiza el picker de iOS dentro de WKWebView). Sin selector custom.
- Interruptores con `role="switch"` y `aria-checked`. Cambio de estado anunciado por `aria-live`.
- La pantalla de Ajustes → Recordatorios sigue la estructura de las demás pantallas de Ajustes (SPEC_19/DP-17.3).

## 6. Requisitos técnicos

**Dependencia:** `@capacitor/local-notifications` (oficial).

**Programación.** Dos notificaciones con `schedule: { on: { hour, minute }, repeats: true }`, ids fijos (1 = mañana, 2 = noche). Al completar un momento en Hoy: `cancel` del id correspondiente y `schedule` para el día siguiente con `at`. Al abrir la app: rutina de reconciliación que compara lo programado con las preferencias y corrige.

**Permiso.** `checkPermissions` al abrir Ajustes; `requestPermissions` solo al activar el primer interruptor. Estado reflejado en UI.

**Acción al tocar.** `addListener('localNotificationActionPerformed')` → navegar a `/hoy?momento=manana|noche`. Claude Code verifica que `Hoy` acepte un parámetro de momento; si no, lo añade de forma mínima.

**Datos.** `perfil.recordatorios = { manana: { activo, hora } , noche: { activo, hora } }` en local y en Firestore (sincroniza con SPEC_17). El permiso del sistema no se guarda: se consulta.

**Web.** En la PWA (no nativo) la pantalla de Recordatorios muestra el texto `soloEnApp` (DP-22.2) y no programa nada. Sin Web Push en v1.0.

**Privacidad.** Nada sale del dispositivo. Los cuerpos no contienen datos personales.

## 7. Criterios de aceptación

1. Activar Mañana a una hora dos minutos en el futuro, cerrar la app por completo: la notificación llega y al tocarla abre Hoy con Mañana seleccionado.
2. Completar el momento de la noche antes de la hora del recordatorio: esa noche no llega notificación; la siguiente noche sí.
3. Negar el permiso: interruptor apagado, texto visible, "Abrir Ajustes del teléfono" abre la pantalla correcta del sistema.
4. Cambiar la zona horaria del dispositivo y abrir la app: la notificación llega a la hora local nueva.
5. Reinstalar: las horas vuelven desde la nube; el permiso se vuelve a pedir al activar.
6. La tarjeta de descubrimiento aparece una sola vez tras el primer momento completado y nunca más tras "Ahora no".
7. Suite verde; al menos 20 pruebas nuevas (reconciliación, cancelación al completar, rotación de textos, enrutado).

## 8. Plan de pruebas

**Unitarias:** lógica de reconciliación (6 combinaciones), cálculo de "próximo envío" con `diaTerminaA`, rotación de textos sin repetir el mismo dos días seguidos, parseo del parámetro de momento.
**Integración:** el plugin se mockea; se verifica que se llama con los argumentos correctos.
**Manuales:** criterios 1–6 en iPhone, con "No molestar" activado (debe respetarse) y con modo de bajo consumo.
**Regresión:** Hoy sin parámetro se comporta igual que hoy. Ajustes existentes intactos.

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| iOS limita a 64 notificaciones pendientes | Solo 2 ids; `repeats: true` no acumula | — |
| La tarjeta de descubrimiento se percibe como presión | Aparece una vez, tras un momento completado, con "Ahora no" al mismo peso visual que "Elegir hora" | Quitar la tarjeta; dejar solo Ajustes |
| Picker nativo se ve distinto a la app | Es la convención de iOS; se acepta por consistencia con el sistema | — |

## 10. Orden y dependencias

Séptimo. Requiere SPEC_21. SPEC_27 (Android) extiende esta lógica; la capa de programación debe quedar aislada del plugin para reutilizarla.

## Decisiones pendientes

- **DP-22.1** Horas sugeridas por defecto (propuesta 08:00 y 21:30). También si `diaTerminaA` del perfil (si se conserva ese campo) debe influir en la sugerencia de la noche.
- **DP-22.2** Texto para la PWA web: "Los recordatorios están disponibles en la app de Strivo para iPhone." Confirmar redacción o decidir ocultar la pantalla en web.
