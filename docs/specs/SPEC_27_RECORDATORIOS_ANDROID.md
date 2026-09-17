# SPEC_27 — Recordatorios en Android: permisos, alarmas exactas y fabricantes

**Tarea del Gantt:** C2 · **Dependencias:** SPEC_22, SPEC_26

---

## 1. Nombre, objetivo y problema que resuelve

**Objetivo:** que los recordatorios de mañana y noche (SPEC_22) lleguen en Android a la hora elegida, también en Samsung y Xiaomi, que son los teléfonos que la mayoría de las personas en México tienen.

**Problema:** Android 13+ exige permiso explícito para notificaciones; Android 12+ restringe las alarmas exactas; y los fabricantes aplican "optimizaciones de batería" que matan procesos en segundo plano y con ellos las notificaciones programadas. Una app cuyo valor central es el recordatorio diario y que no avisa en un Xiaomi genera exactamente el tipo de reseña de una estrella que hunde una ficha nueva.

## 2. Alcance

**Entra:** permiso `POST_NOTIFICATIONS`; canal de notificación propio; alarmas exactas con el permiso adecuado; pantalla de ayuda por fabricante para desactivar la optimización de batería **manualmente** (no se solicita la exención por permiso, ver 6); reprogramación tras reinicio del teléfono; reconciliación al abrir la app; pruebas en tres marcas.

**Fuera:** push remoto, notificaciones que la persona no pidió, servicios en primer plano permanentes, cualquier técnica que vaya contra las políticas de Google Play.

## 3. Experiencia de usuario

**3.1 Activar un recordatorio (misma pantalla de SPEC_22).**
1. Al activar el primer interruptor: diálogo del sistema de permiso de notificaciones (Android 13+). Si lo niega: interruptor apagado, `permisoDenegado` y "Abrir Ajustes del teléfono" (lleva a la pantalla de la app en Ajustes).
2. Tras conceder: si el sistema requiere permiso de alarmas exactas y no lo tiene, diálogo propio breve `alarmaExacta` con "Permitir" (abre la pantalla del sistema) y "Ahora no". Sin él, los recordatorios funcionan pero pueden llegar con retraso de minutos: se acepta y se explica en `alarmaExactaSinPermiso`.
3. Tras conceder, en fabricantes con optimización agresiva (lista en 6): aparece una vez la tarjeta `bateria` con "Ver cómo" y "Ahora no". "Ver cómo" abre una pantalla de ayuda con los pasos para ese fabricante y un botón que abre directamente la pantalla de batería de la app en Ajustes del sistema.

**3.2 Recibir.** Igual que iOS: título "Strivo", cuerpo rotativo, sonido del sistema, respeta "No molestar". Tocar abre Hoy en el momento correcto. En Android, la notificación muestra el ícono monocromo pequeño de Strivo (símbolo en blanco) y el color de acento.

**3.3 Casos límite.**
- Reinicio del teléfono: las alarmas se pierden; el receptor de `BOOT_COMPLETED` las reprograma. Se verifica.
- La app fue "forzada a detener" desde Ajustes: Android no despierta la app hasta que la persona la abra; al abrir, se reconcilia. No hay forma de evitarlo y no se intenta.
- Cambio de hora/zona: reconciliación al abrir, más `TIME_CHANGED`/`TIMEZONE_CHANGED` si el plugin lo expone.
- Permiso de notificaciones revocado desde Ajustes: al abrir, interruptores apagados con texto.
- Modo "No molestar" con excepciones: se respeta lo que el sistema decida.

## 4. Textos exactos

`copy.recordatorios.android.*` (se suma a los de SPEC_22):

| Clave | Texto |
|---|---|
| `alarmaExacta.titulo` | Para avisarte a la hora exacta |
| `alarmaExacta.texto` | Android pide un permiso más para que el aviso llegue puntual. Sin él, puede tardar unos minutos. |
| `alarmaExacta.permitir` | Permitir |
| `alarmaExacta.ahoraNo` | Ahora no |
| `alarmaExactaSinPermiso` | Los avisos pueden llegar con unos minutos de diferencia. Puedes cambiarlo en Ajustes del teléfono. |
| `bateria.titulo` | Un ajuste más en tu teléfono |
| `bateria.texto` | Algunos teléfonos apagan los avisos para ahorrar batería. Te mostramos cómo evitarlo, toma un minuto. |
| `bateria.verComo` | Ver cómo |
| `bateria.ahoraNo` | Ahora no |
| `bateria.ayudaTitulo` | Recordatorios en {fabricante} |
| `bateria.abrirAjustes` | Abrir ajustes de batería |
| `bateria.pasos.samsung` | En Batería, busca Strivo y elige "Sin restricciones". Si aparece "Poner apps en suspensión", quita Strivo de esa lista. |
| `bateria.pasos.xiaomi` | En Ahorro de batería, elige "Sin restricciones" para Strivo. En Inicio automático, activa Strivo. |
| `bateria.pasos.huawei` | En Inicio de aplicaciones, desactiva "Gestionar automáticamente" para Strivo y activa las tres opciones. |
| `bateria.pasos.oppo` | En Batería, elige "Permitir actividad en segundo plano" para Strivo. |
| `bateria.pasos.generico` | En Batería, busca Strivo y permite la actividad en segundo plano. |

Los pasos por fabricante son propuestas basadas en las interfaces habituales; cambian entre versiones. Claude Code los deja en copy (no en código) para que se corrijan sin publicar versión, y la fundadora los verifica en los dispositivos reales de prueba (DP-27.1).

## 5. Interfaz, accesibilidad y consistencia

- La tarjeta `bateria` reutiliza el mismo componente que la tarjeta de descubrimiento de SPEC_22. Aparece una sola vez por dispositivo.
- La pantalla de ayuda es una pantalla normal de Ajustes, con pasos numerados y un botón al final. Sin capturas de pantalla (cambian con cada versión y pesan).
- El ícono pequeño de notificación cumple las guías de Android: solo alfa, sin color.

## 6. Requisitos técnicos

**Dependencia:** `@capacitor/local-notifications` (ya, desde SPEC_22). Verificar que la versión instalada soporte `SCHEDULE_EXACT_ALARM` y el canal.

**Manifest.**
- `POST_NOTIFICATIONS` (Android 13+).
- `SCHEDULE_EXACT_ALARM` (Android 12+) o `USE_EXACT_ALARM` (Android 13+, reservado a apps de alarma/recordatorio; Strivo califica como recordatorio, pero Google lo revisa). **DP-27.2** decide cuál. Recomendación: `SCHEDULE_EXACT_ALARM` con el diálogo de 3.1, porque no depende de la aprobación de Play para el uso especial.
- `RECEIVE_BOOT_COMPLETED` para reprogramar.
- **No** se declara `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`. Google Play restringe ese permiso y su uso injustificado es motivo de rechazo. La exención se consigue con la persona, a mano, guiada por la pantalla de ayuda. Es la vía que Play acepta.

**Canal.** Un solo canal `recordatorios`, importancia `DEFAULT`, nombre "Recordatorios", sin vibración personalizada.

**Detección de fabricante.** `Device.getInfo().manufacturer` (`@capacitor/device`, oficial) mapeado a `samsung | xiaomi | huawei | oppo | generico` (Xiaomi incluye Redmi y POCO; OPPO incluye Realme y OnePlus). Solo se muestra la tarjeta `bateria` si el fabricante está en la lista.

**Abrir Ajustes.** Intents: `Settings.ACTION_APPLICATION_DETAILS_SETTINGS` para la pantalla de la app; para batería, `ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS` (**abrir la lista** es permitido; lo restringido es pedir la exención por permiso). Claude Code confirma el plugin que expone estos intents (`@capacitor/app` no los cubre; puede requerir un plugin comunitario o un plugin local mínimo, que se reporta y aprueba).

**Reconciliación.** Misma capa de SPEC_22, aislada del plugin. En Android, además, tras `BOOT_COMPLETED`.

**Privacidad.** Igual que iOS: nada sale del dispositivo.

## 7. Criterios de aceptación

En Samsung, Xiaomi y Motorola:
1. Activar Mañana a dos minutos en el futuro, cerrar la app, bloquear pantalla: llega puntual (±1 min con alarma exacta).
2. Con el permiso de alarma exacta negado: llega igual, con retraso aceptable, y `alarmaExactaSinPermiso` visible en Ajustes.
3. Reiniciar el teléfono: el recordatorio del día siguiente llega.
4. En el Xiaomi, sin tocar la optimización de batería: documentar si llega o no tras 48 h sin abrir la app. Con la optimización desactivada siguiendo la pantalla de ayuda: llega tras 48 h.
5. La tarjeta `bateria` aparece solo en Samsung y Xiaomi (no en Motorola), una vez.
6. Negar `POST_NOTIFICATIONS`: interruptor apagado, "Abrir Ajustes del teléfono" lleva a la pantalla correcta.
7. Tocar la notificación abre Hoy con el momento correcto.
8. Suite verde; al menos 15 pruebas nuevas (mapeo de fabricante, decisión de mostrar tarjeta, reconciliación tras boot con plugin mockeado).

## 8. Plan de pruebas

**Unitarias:** mapeo de fabricantes (incluidas submarcas), lógica "mostrar tarjeta una vez", reconciliación.
**Integración:** plugin mockeado; permisos en sus cuatro combinaciones.
**Manuales:** criterios 1–7 en los tres dispositivos, con al menos una noche real de espera (criterio 4 exige 48 h).
**Regresión:** iOS (SPEC_22) sin cambios; la pantalla de Recordatorios en iOS no muestra nada de Android.

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Xiaomi mata la app aunque la persona siga los pasos | Documentar en la ayuda que en algunos modelos el sistema puede seguir limitándolo; no prometer | — |
| Google rechaza por `USE_EXACT_ALARM` | Usar `SCHEDULE_EXACT_ALARM` (DP-27.2) | Cambio de permiso en manifest |
| Los pasos por fabricante quedan obsoletos | Están en copy; se actualizan sin versión | — |
| Intents de Ajustes cambian entre versiones | Fallback siempre a la pantalla general de la app | — |

## 10. Orden y dependencias

Duodécimo y último. Requiere 22 y 26.

## Decisiones pendientes

- **DP-27.1** Verificar y corregir los pasos por fabricante en los dispositivos reales antes de publicar. Es tarea de la fundadora con los tres teléfonos en la mano.
- **DP-27.2** `SCHEDULE_EXACT_ALARM` (recomendado) o `USE_EXACT_ALARM`.
- **DP-27.3** ¿La tarjeta `bateria` se muestra también en Motorola y marcas sin optimización agresiva conocida? Recomendado: no; menos fricción donde no hace falta.
