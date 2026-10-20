# SPEC_25 — Muro de pago con RevenueCat

**Tarea del Gantt:** A10 · **Dependencias:** SPEC_19, SPEC_21, SPEC_20 (`fechaInicioPrueba`)
**Requiere antes de codificar:** productos creados en App Store Connect, proyecto en RevenueCat con la app iOS vinculada, Paid Applications Agreement firmado (tarea B10).

---

## 1. Nombre, objetivo y problema que resuelve

**Objetivo:** que Strivo cobre. Prueba gratuita de 7 días, suscripción mensual o anual, oferta de Miembro Fundador vitalicia por tiempo limitado, restauración de compras, y un comportamiento digno cuando la prueba termina y la persona no paga.

**Problema:** no existe ninguna capa de cobro. Y el modelo anterior (gratis + premium) no tiene qué vender porque las funciones premium no existen. La versión 1.0 es de paga completa con prueba.

## 2. Alcance

**Entra:** integración de RevenueCat; pantalla de paywall; lógica de prueba de 7 días gestionada por la app; estado de derecho (`entitlement`) en toda la app; gating en modo lectura al expirar; restaurar compras; enlace a gestión de suscripción; oferta Fundador con ventana temporal configurable remotamente; eventos mínimos de analítica de conversión.

**Fuera:** pagos web (Stripe), códigos promocionales (v1.1; RevenueCat los soporta pero requieren flujo aparte), precios por país distintos de los que App Store Connect define, enlaces externos de pago en EE. UU. (su marco legal está en litigio; se revisa en 2027), Android (SPEC_26 añade la tienda de Google sobre esta misma lógica), cualquier función nueva "premium".

## 3. Experiencia de usuario

**3.1 Los 7 días de prueba.**
- Empiezan al crear la cuenta (`fechaInicioPrueba`), sin pedir tarjeta ni pasar por Apple. La app está completa durante esos días. No hay contador visible en Hoy: nada de "te quedan 3 días". El único lugar donde se ve el estado es Ajustes → Suscripción.
- Día 6: al abrir la app, una vez, una tarjeta suave en Hoy: `pruebaTermina` con "Ver opciones" y "Ahora no". Se muestra una sola vez.

**3.2 Fin de la prueba sin pago: modo lectura.**
- Al abrir la app el día 8 en adelante: se muestra el paywall (3.3) con opción "Ahora no".
- "Ahora no" lleva a la app en **modo lectura**: Hoy muestra el día actual sin campos editables, Historial y Journal se pueden leer, Respiración funciona (DP-25.1), no se puede escribir ni guardar. Cualquier intento de escribir abre el paywall. Exportar (SPEC_24) siempre disponible.
- Nunca se bloquea el acceso a lo que la persona ya escribió. Es una regla de producto, no técnica.

**3.3 Paywall.**
- Título, un párrafo, dos tarjetas de plan (Anual preseleccionado, Mensual), botón primario con el precio localizado que devuelve la tienda (nunca hardcodeado), enlace "Restaurar compras", enlaces "Términos" y "Privacidad", y "Ahora no" (solo si ya venció la prueba; durante la prueba el paywall solo se abre desde Ajustes y se cierra con "Cerrar").
- Tarjeta Fundador: aparece únicamente si la oferta está activa remotamente (RevenueCat Offering `fundador`) y la persona no tiene suscripción. Muestra el precio de la tienda y `fundadorTexto`. Sin cuenta regresiva.
- Tocar el botón primario abre la hoja de compra del sistema. Éxito → se cierra el paywall y aparece un texto breve `gracias`, dos segundos, sin confeti. Cancelación → nada, se queda en el paywall. Error → `errorCompra`.

**3.4 Ajustes → Suscripción.**
- Estado actual: "En prueba, hasta el {fecha}", "Mensual, se renueva el {fecha}", "Anual, se renueva el {fecha}", "Miembro fundador. Para siempre.", o "Sin suscripción".
- Botón "Gestionar suscripción" (abre la pantalla de Apple), "Restaurar compras", y "Ver opciones" si no hay suscripción.

**3.5 Casos límite.**
- Reinstalar durante la prueba: `fechaInicioPrueba` viene de Firestore; la prueba no se reinicia.
- Crear una segunda cuenta para otra prueba: se permite (es una cuenta distinta). No se hace fingerprinting del dispositivo.
- Suscripción comprada en un iPhone y sesión en otro: RevenueCat identifica por `appUserID = uid`; el derecho aparece en ambos.
- Sin conexión: el último estado de derecho conocido se conserva (RevenueCat lo cachea); si no hay caché, se asume sin derecho pero **no** se borra nada.
- Reembolso o expiración: RevenueCat actualiza el derecho; la app pasa a modo lectura en la siguiente apertura.
- Compra en Apple sin sesión en Strivo (no debería ocurrir; el paywall solo existe con sesión): "Restaurar compras" la recupera.
- Oferta Fundador ya comprada: desaparece de todos los paywalls de esa cuenta.

## 4. Textos exactos

`copy.suscripcion.*`. Los precios y periodos vienen de la tienda; nunca se escriben en copy.

| Clave | Texto |
|---|---|
| `paywall.titulo` | Strivo, completo |
| `paywall.texto` | Un lugar tuyo para empezar y cerrar el día. Sin anuncios, sin distracciones, sin nadie mirando. |
| `paywall.anual` | Anual |
| `paywall.anualDetalle` | {precio} al año |
| `paywall.mensual` | Mensual |
| `paywall.mensualDetalle` | {precio} al mes |
| `paywall.boton` | Continuar |
| `paywall.restaurar` | Restaurar compras |
| `paywall.terminos` | Términos |
| `paywall.privacidad` | Privacidad |
| `paywall.ahoraNo` | Ahora no |
| `paywall.cerrar` | Cerrar |
| `paywall.fundadorTitulo` | Miembro fundador |
| `paywall.fundadorTexto` | Un solo pago, para siempre. Solo durante el lanzamiento. |
| `paywall.fundadorDetalle` | {precio}, una vez |
| `paywall.gracias` | Gracias. Todo tuyo. |
| `paywall.errorCompra` | No se completó la compra. Puedes intentarlo de nuevo cuando quieras. |
| `paywall.restaurado` | Tu suscripción está de vuelta. |
| `paywall.nadaQueRestaurar` | No encontramos compras anteriores con esta cuenta de Apple. |
| `prueba.tarjetaTitulo` | Tu prueba termina mañana |
| `prueba.tarjetaTexto` | Lo que escribiste se queda contigo pase lo que pase. |
| `prueba.verOpciones` | Ver opciones |
| `prueba.ahoraNo` | Ahora no |
| `lectura.aviso` | Puedes leer todo lo que escribiste. Para seguir escribiendo, elige un plan. |
| `lectura.verOpciones` | Ver opciones |
| `ajustes.titulo` | Suscripción |
| `ajustes.enPrueba` | En prueba, hasta el {fecha} |
| `ajustes.mensual` | Mensual. Se renueva el {fecha}. |
| `ajustes.anual` | Anual. Se renueva el {fecha}. |
| `ajustes.fundador` | Miembro fundador. Para siempre. |
| `ajustes.sinSuscripcion` | Sin suscripción |
| `ajustes.gestionar` | Gestionar suscripción |
| `ajustes.restaurar` | Restaurar compras |

Prohibido en cualquier texto de este SPEC: "oferta", "descuento", "ahorra", "solo hoy", porcentajes, tachados de precio, "más popular", "mejor valor".

## 5. Interfaz, accesibilidad y consistencia

- El paywall es una pantalla completa con el degradado de la paleta activa, no un modal encima de Hoy. Se cierra con el mismo gesto que el resto.
- Las dos tarjetas de plan usan el componente de tarjeta existente; la seleccionada se marca con el token `acento` (SPEC_18), no con un borde grueso ni con un "check" grande.
- El botón "Ahora no" tiene el mismo tamaño tipográfico que "Restaurar compras". Nada se esconde.
- Todo precio se lee en voz con moneda (`aria-label` con el `localizedPriceString`).
- Apple exige que aparezcan: precio, periodo, renovación automática, y enlaces a términos y privacidad. Están.

## 6. Requisitos técnicos

**Dependencia:** `@revenuecat/purchases-capacitor` (oficial de RevenueCat).

**Productos (App Store Connect, tarea de la fundadora, antes de codificar):**
- `strivo_mensual` — suscripción auto-renovable, grupo `strivo`.
- `strivo_anual` — suscripción auto-renovable, grupo `strivo`.
- `strivo_fundador` — no consumible.
- **Sin** oferta introductoria en Apple: la prueba la gestiona la app (DP-25.2).

**RevenueCat:** entitlement `completo`; offering `default` con `anual` y `mensual`; offering `fundador` con el paquete vitalicio, activado/desactivado desde el panel de RevenueCat sin publicar versión.

**Identidad:** `Purchases.configure({ apiKey, appUserID: uid })` tras iniciar sesión; `logOut()` al cerrar sesión y en SPEC_24. Nunca anónimo.

**Estado de derecho.** Un `SuscripcionProvider` expone `{ estado: 'prueba'|'activa'|'fundador'|'lectura'|'cargando', hasta, refrescar }`. Fuente de verdad: RevenueCat `customerInfo` **más** `fechaInicioPrueba` del perfil. Lógica: `fundador` si tiene el no consumible; `activa` si `entitlements.completo.isActive`; `prueba` si hoy < inicio + 7 días; si no, `lectura`.

**Gating.** Una sola función `puedeEscribir()` consumida por Diario, Journal e Intención. No se toca cada componente por separado: Claude Code identifica el punto de escritura común en la capa de datos y lo protege ahí; la UI consulta el mismo estado para mostrar el aviso `lectura`.

**Fechas.** `fechaInicioPrueba` es ISO en UTC; el cálculo de "día 8" se hace en zona local del dispositivo. Reloj manipulado: no se defiende en v1.0.

**Analítica mínima.** Cuatro eventos: `paywall_visto`, `compra_iniciada`, `compra_ok`, `compra_cancelada`, con el plan. Solo en RevenueCat (ya los provee) y en un log local para la fundadora. **Sin** SDK de analítica adicional (DP-25.3).

**Web (PWA).** Sin RevenueCat web en v1.0. La PWA se comporta como `prueba` indefinida solo para testers marcados en Firestore (`perfil.tester: true`), y como `lectura` para cualquier otra cuenta. Ver DP-21.5.

**Seguridad.** La clave pública de RevenueCat va en el cliente (es su diseño). Los derechos se validan contra los recibos de Apple del lado de RevenueCat; la app no confía en estado local para nada que no sea la UI.

## 7. Criterios de aceptación

Todo en sandbox de App Store con cuenta de prueba.
1. Cuenta nueva: 7 días completos sin paywall salvo desde Ajustes. Día 6: tarjeta una sola vez. Día 8: paywall al abrir.
2. "Ahora no" en día 8: modo lectura; leer Journal e Historial funciona; intentar escribir abre el paywall; exportar funciona.
3. Comprar mensual: `gracias`, escribir funciona, Ajustes muestra "Mensual. Se renueva el {fecha}."
4. Restaurar en un segundo iPhone con la misma cuenta de Apple y la misma cuenta de Strivo: derecho activo sin comprar.
5. Cancelar la hoja de Apple: paywall intacto, sin error.
6. Activar el offering `fundador` en el panel: la tarjeta aparece sin publicar versión; comprarlo → `fundador` para siempre; la tarjeta desaparece.
7. Expirar la suscripción en sandbox: en la siguiente apertura, modo lectura con `lectura.aviso`.
8. Cerrar sesión y entrar con otra cuenta: `logOut()`/`configure()` correctos; el derecho no "se pega" entre cuentas.
9. Ningún precio hardcodeado (`grep -rn "\$1[0-9][0-9]\|MXN\|€" src/` sin resultados fuera de pruebas).
10. Suite verde; al menos 40 pruebas nuevas.

## 8. Plan de pruebas

**Unitarias:** cálculo de estado (12 combinaciones de `customerInfo` × fechas), `puedeEscribir()`, tarjeta de día 6 una sola vez, textos de Ajustes por estado.
**Integración:** SDK mockeado; flujo de compra ok / cancelada / error; restauración con y sin compras.
**Manuales:** criterios 1–9 en sandbox; al menos dos cuentas de prueba de Apple.
**Regresión:** todo lo escrito antes de expirar sigue legible; Respiración según DP-25.1; borrado de cuenta (SPEC_24) desvincula RevenueCat.

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Rechazo de Apple por paywall (faltan datos obligatorios) | Checklist de la sección 5; captura del paywall en las notas para el revisor | Ajuste de copy/enlaces |
| Modo lectura percibido como castigo | Copy explícito de que nada se pierde; exportar siempre disponible; Respiración libre (DP-25.1) | Ampliar prueba a 14 días por bandera remota |
| Gating disperso por componentes | Un solo punto en la capa de datos | — |
| Persona compra y la app no refleja el derecho | `refrescar()` tras compra y al volver a primer plano; "Restaurar compras" siempre visible | — |

## 10. Orden y dependencias

Décimo. Requiere 19, 20 y 21. SPEC_24 añade `logOut()` aquí si se implementa antes; SPEC_26 conecta Google Play al mismo `SuscripcionProvider`.

## Decisiones pendientes

- **DP-25.1** En modo lectura, ¿Respiración sigue funcionando completa? Recomendación: **sí**. Es lo más generoso que se puede ser sin regalar el producto entero, y es coherente con "refugio".
- **DP-25.2** Prueba gestionada por la app (recomendado: sin tarjeta, menos fricción, coherente con "nada bloquea") frente a oferta introductoria de Apple (la persona debe "suscribirse" para empezar la prueba; convierte mejor pero exige tarjeta el día 1). Si se elige Apple, cambian 3.1 y 6.
- **DP-25.3** ¿Se añade un SDK de analítica (p. ej. Firebase Analytics) para el embudo? Recomendación: no en v1.0. RevenueCat da conversión; el resto se mide a mano con seis números.
- **DP-25.4** Duración y tope de la oferta Fundador (propuesta del plan: 30 días desde el lanzamiento, sin tope de unidades). Se controla desde RevenueCat, no en código.
- **DP-25.5** Precios finales en App Store Connect (propuesta del plan: $119 / $799 MXN; $1,499 MXN fundador; 5.99 € / 44.99 € / 89 USD). No afecta al código.
