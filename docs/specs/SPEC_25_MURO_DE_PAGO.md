# SPEC_25 — Muro de pago con RevenueCat

**Tarea del Gantt:** A10 · **Dependencias:** SPEC_19, SPEC_21, SPEC_20 (`fechaInicioPrueba`)

**Requiere antes de codificar:**
- ~~Productos creados en App Store Connect~~ — hechos el 19 nov 2026 (ver 6.1).
- ~~Paid Applications Agreement firmado~~ — firmado el 19 nov 2026 (tarea B10).
- **Proyecto en RevenueCat con la app de iOS vinculada y la clave .p8 subida — PENDIENTE.** Sin la clave, los códigos de oferta no funcionan (ver 6.3).

---

## 1. Nombre, objetivo y problema que resuelve

**Objetivo:** que Strivo cobre. Prueba gratuita de 7 días, suscripción mensual o anual, oferta de Miembro Fundador vitalicia por tiempo limitado, restauración de compras, y un comportamiento digno cuando la prueba termina y la persona no paga.

**Problema:** no existe ninguna capa de cobro. Y el modelo anterior (gratis + premium) no tiene qué vender porque las funciones premium no existen. La versión 1.0 es de paga completa con prueba.

## 2. Alcance

**Entra:** integración de RevenueCat; pantalla de paywall; lógica de prueba de 7 días gestionada por la app; estado de derecho (`entitlement`) en toda la app; gating en modo lectura al expirar; restaurar compras; enlace a gestión de suscripción; oferta Fundador con ventana temporal configurable remotamente; **canje de códigos de oferta de Apple para la campaña con aliadas (3.6 y 6.2)**; eventos mínimos de analítica de conversión.

**Fuera:** pagos web (Stripe), precios por país distintos de los que App Store Connect define, enlaces externos de pago en EE. UU. (su marco legal está en litigio; se revisa en 2027), Android (SPEC_26 añade la tienda de Google sobre esta misma lógica), cualquier función nueva "premium", y **cualquier lógica propia de descuentos**: Strivo no guarda códigos, no los valida, no calcula precios rebajados y no lleva la cuenta de canjes. Todo eso vive en Apple.

## 3. Experiencia de usuario

**3.1 Los 7 días de prueba.**
- Empiezan al crear la cuenta (`fechaInicioPrueba`), sin pedir tarjeta ni pasar por Apple. La app está completa durante esos días. No hay contador visible en Hoy: nada de "te quedan 3 días". El único lugar donde se ve el estado es Ajustes → Suscripción.
- Día 6: al abrir la app, una vez, una tarjeta suave en Hoy: `pruebaTermina` con "Ver opciones" y "Ahora no". Se muestra una sola vez.

**3.2 Fin de la prueba sin pago: modo lectura.**
- Al abrir la app el día 8 en adelante: se muestra el paywall (3.3) con opción "Ahora no".
- "Ahora no" lleva a la app en **modo lectura**: Hoy muestra el día actual sin campos editables, Historial y Journal se pueden leer, Respiración funciona (DP-25.1), no se puede escribir ni guardar. Cualquier intento de escribir abre el paywall. Exportar (SPEC_24) siempre disponible.
- Nunca se bloquea el acceso a lo que la persona ya escribió. Es una regla de producto, no técnica.

**3.3 Paywall.**
- Título, un párrafo, dos tarjetas de plan (Anual preseleccionado, Mensual), botón primario con el precio localizado que devuelve la tienda (nunca hardcodeado), enlace "Restaurar compras", **enlace "Tengo un código" (3.6)**, enlaces "Términos" y "Privacidad", y "Ahora no" (solo si ya venció la prueba; durante la prueba el paywall solo se abre desde Ajustes y se cierra con "Cerrar").
- Tarjeta Fundador: aparece únicamente si la oferta está activa remotamente (RevenueCat Offering `fundador`) y la persona no tiene suscripción. Muestra el precio de la tienda y `fundadorTexto`. Sin cuenta regresiva.
- Tocar el botón primario abre la hoja de compra del sistema. Éxito → se cierra el paywall y aparece un texto breve `gracias`, dos segundos, sin confeti. Cancelación → nada, se queda en el paywall. Error → `errorCompra`.

**3.4 Ajustes → Suscripción.**
- Estado actual: "En prueba, hasta el {fecha}", "Mensual, se renueva el {fecha}", "Anual, se renueva el {fecha}", "Miembro fundador. Para siempre.", o "Sin suscripción".
- Botón "Gestionar suscripción" (abre la pantalla de Apple), "Restaurar compras", **"Tengo un código"** y "Ver opciones" si no hay suscripción.

**3.5 Casos límite.**
- Reinstalar durante la prueba: `fechaInicioPrueba` viene de Firestore; la prueba no se reinicia.
- Crear una segunda cuenta para otra prueba: se permite (es una cuenta distinta). No se hace fingerprinting del dispositivo.
- Suscripción comprada en un iPhone y sesión en otro: RevenueCat identifica por `appUserID = uid`; el derecho aparece en ambos.
- Sin conexión: el último estado de derecho conocido se conserva (RevenueCat lo cachea); si no hay caché, se asume sin derecho pero **no** se borra nada.
- Reembolso o expiración: RevenueCat actualiza el derecho; la app pasa a modo lectura en la siguiente apertura.
- Compra en Apple sin sesión en Strivo (no debería ocurrir; el paywall solo existe con sesión): "Restaurar compras" la recupera.
- Oferta Fundador ya comprada: desaparece de todos los paywalls de esa cuenta.
- **Código canjeado y el derecho no aparece:** puede pasar si RevenueCat no tenía registro previo de esa persona. "Restaurar compras" lo resuelve. Por eso el aviso `codigo.noAplicado` manda ahí y no a un callejón sin salida.
- **Misma cuenta de Apple, dos cuentas de Strivo:** si alguien canjea un código con una cuenta de Apple que ya tiene historial de compras bajo otra cuenta de Strivo, el derecho puede quedar atado a la cuenta vieja. No se defiende en v1.0; se documenta para soporte.

**3.6 "Tengo un código" (campaña con aliadas).**

La estrategia comercial es repartir claves personalizadas entre aliadas con audiencia —del tipo `ALEJANDRA10`— que dan a su público un precio rebajado cercano al 10 % durante un periodo inicial. **El descuento lo define, lo valida y lo cobra Apple.**

Hay dos caminos para canjear, y los dos tienen que funcionar:

**Camino A — el enlace (principal).** Cada aliada reparte un enlace con su clave dentro:

```
https://apps.apple.com/redeem?ctx=offercodes&id=6836996054&code=ALEJANDRA10
```

Se abre el App Store con la clave ya puesta, la persona confirma ahí y regresa. No pasa por la app. Es el camino que recomienda RevenueCat y el que va a usar la mayoría, porque viene del posteo de la aliada.

**Camino B — dentro de la app.** En el paywall y en Ajustes hay un enlace **"Tengo un código"**, del mismo tamaño tipográfico que "Restaurar compras".

- Al tocarlo se abre una hoja propia de Strivo, sencilla: un campo de texto, el aviso `codigo.aviso`, y los botones Continuar y Cancelar.
- Al dar Continuar, Strivo **arma el mismo enlace del camino A** con lo que la persona escribió y lo abre en el App Store. La confirmación ocurre allá.
- **Deliberadamente no se usa la hoja de canje nativa de Apple** (`presentCodeRedemptionSheet`), aunque el SDK de RevenueCat la expone. Ver 6.2 para el porqué; es la decisión técnica más importante de esta sección.

**Al volver de cualquiera de los dos caminos:**
1. Al pasar la app a primer plano se llama a `syncPurchases()` y luego a `refrescar()`.
2. Si el derecho quedó activo → se cierra el paywall y aparece `codigoListo`.
3. Si no quedó activo → `codigo.noAplicado`, que ofrece "Restaurar compras". No se inventa un diagnóstico: Apple ya dijo en su pantalla si la clave no servía, y el caso restante conocido se arregla restaurando.

**Convivencia con la prueba de 7 días.** Canjear una clave arranca la suscripción en ese momento y el derecho queda activo, así que la persona pasa a `activa` aunque le quedaran días de prueba. No se le "guardan" los días restantes: la regla de estado existente (`activa` gana sobre `prueba`) basta, sin lógica nueva. Durante la prueba el paywall solo se abre desde Ajustes, y ahí está "Tengo un código", para que quien llegó por una aliada pueda usar su clave desde el día 1.

**Nada en la copia nombra el descuento.** Ni porcentajes, ni "oferta", ni precios tachados. El precio rebajado lo enseña el App Store; Strivo solo dice que la clave quedó aplicada.

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
| `paywall.tengoCodigo` | Tengo un código |
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
| `codigo.titulo` | Tu código |
| `codigo.campo` | Escríbelo aquí |
| `codigo.aviso` | Te llevamos al App Store para aplicarlo. Vuelve a Strivo cuando termines. |
| `codigo.continuar` | Continuar |
| `codigo.cancelar` | Cancelar |
| `codigo.listo` | Listo. Tu código quedó aplicado. |
| `codigo.noAplicado` | Todavía no vemos tu código aquí. Si ya lo aplicaste en el App Store, toca Restaurar compras. |
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
| `ajustes.tengoCodigo` | Tengo un código |

Prohibido en cualquier texto de este SPEC: "oferta", "descuento", "ahorra", "solo hoy", porcentajes, tachados de precio, "más popular", "mejor valor". **Esto incluye todo lo del canje:** el nombre interno de la oferta en App Store Connect no lo ve nadie, y el precio rebajado lo enseña el App Store, no Strivo.

## 5. Interfaz, accesibilidad y consistencia

- El paywall es una pantalla completa con el degradado de la paleta activa, no un modal encima de Hoy. Se cierra con el mismo gesto que el resto.
- Las dos tarjetas de plan usan el componente de tarjeta existente; la seleccionada se marca con el token `acento` (SPEC_18), no con un borde grueso ni con un "check" grande.
- El botón "Ahora no" tiene el mismo tamaño tipográfico que "Restaurar compras" y que "Tengo un código". Nada se esconde.
- "Tengo un código" va después de "Restaurar compras" y antes de "Términos" y "Privacidad". Es un enlace, no un botón primario: la ruta normal es elegir un plan.
- La hoja de código usa el componente de hoja existente. El campo tiene etiqueta accesible, `autocapitalize` en mayúsculas, `autocorrect` apagado y teclado normal. Se recorta el espacio en blanco y se normaliza a mayúsculas antes de armar el enlace.
- "Continuar" queda inhabilitado con el campo vacío.
- Todo precio se lee en voz con moneda (`aria-label` con el `localizedPriceString`).
- Apple exige que aparezcan: precio, periodo, renovación automática, y enlaces a términos y privacidad. Están.

## 6. Requisitos técnicos

**Dependencia:** `@revenuecat/purchases-capacitor` (oficial de RevenueCat).

### 6.1 Productos en App Store Connect — creados el 19 nov 2026

| Producto | Tipo | ID | Precio base (MXN) |
|---|---|---|---|
| Strivo Mensual | Suscripción auto-renovable, grupo `Strivo` | `strivo_mensual` | $89 |
| Strivo Anual | Suscripción auto-renovable, grupo `Strivo` | `strivo_anual` | $799 |
| Strivo Fundador | No consumible | `strivo_fundador` | $1,499 |

- App en App Store Connect: **Strivo**, ID de Apple `6836996054`, SKU `strivo-ios`, idioma principal español de México.
- País base de precios: **México**. Apple deriva el resto de los 175 países; no se fijan precios por país a mano.
- **Sin** oferta introductoria en Apple en ninguno de los tres: la prueba la gestiona la app (DP-25.2).
- "En familia" desactivada en los tres.
- Falta subir la **captura del paywall** para la revisión de los tres productos: se hace cuando el paywall exista. Los productos se mandan a revisión junto con la primera versión de la app.
- La disponibilidad en la Unión Europea depende de que Apple apruebe el estatus de trader (enviado el 19 nov 2026, "En revisión"). No bloquea nada de este SPEC.

### 6.2 Códigos de oferta — cómo funcionan y por qué el diseño es así

**Una oferta, muchas claves.** En App Store Connect hay dos niveles: la **oferta** (las condiciones de la rebaja) y las **claves** que la desbloquean. El tope de Apple es de diez ofertas activas por suscripción, pero **no** hay que crear una oferta por aliada: el reporte de canjes de Apple trae una columna con la clave personalizada usada, así que una sola oferta con una clave por aliada se cuenta por separado. Cada clave lleva su propio tope de canjes (de 1 a 25,000) y, opcionalmente, su fecha de vencimiento. Una persona solo puede canjear una clave por oferta, así que nadie encima dos.

**Las claves personalizadas no se pueden escribir en el App Store.** Apple distingue: las claves de un solo uso sí se tecléan en la pantalla de canje del App Store; las personalizadas, como `ALEJANDRA10`, solo se canjean con un enlace o dentro de la app. Por eso "Tengo un código" no es un adorno: sin él, la campaña depende al cien por ciento del enlace de la aliada.

**Por qué NO se usa `presentCodeRedemptionSheet`.** El SDK de Capacitor la expone, así que técnicamente se puede. No se usa por tres razones, en orden de peso:
1. La documentación de RevenueCat describe la hoja nativa de canje como muy inestable desde su lanzamiento.
2. Apple no da ninguna señal de si el canje salió bien: la función no tiene respuesta de retorno, así que de todos modos habría que detectar el cambio escuchando el estado del cliente.
3. RevenueCat recomienda explícitamente abrir el enlace del App Store y sincronizar al regresar, en vez de la hoja nativa.

Como la app ya tiene que manejar bien el regreso desde el App Store (camino A), usar el mismo mecanismo para el camino B deja **un solo flujo que mantener y probar** en vez de dos. Si en algún momento Apple estabiliza la hoja nativa, cambiar es sustituir una llamada.

**En la app solo hay dos piezas:**
1. Armar el enlace `https://apps.apple.com/redeem?ctx=offercodes&id=6836996054&code=<CLAVE>` y abrirlo fuera de la app.
2. Al volver a primer plano, llamar a `syncPurchases()` y después a `refrescar()`. `syncPurchases()` es el que ata el recibo del dispositivo a la cuenta de Strivo abierta; sin él, quien canjeó por enlace puede quedarse sin derecho visible.

No se guarda la clave, no se manda a Firestore y no se usa para nada más. El derecho entra por `entitlements.completo` como cualquier otra compra.

**Límites heredados que conviene tener presentes:**
- Un millón de canjes por app por trimestre, compartidos entre todas las suscripciones.
- Los códigos de oferta sirven para subir o cambiar de plan, **no para bajar**. Quien ya tiene anual no puede canjear una clave de mensual. Es otro argumento para DP-25.7.
- RevenueCat registra **todas** las transacciones con código de oferta como $0 en su tablero, porque Apple no le manda el monto. El ingreso real de la campaña se lee en App Store Connect, no en RevenueCat.
- Al crear la oferta, confirmar la vigencia que Apple asigna por omisión y fijar una fecha explícita si hace falta.

### 6.3 RevenueCat — qué hay que dejar configurado

El proyecto todavía no existe. Al crearlo:

1. **Proyecto** `Strivo`, con una app de tipo App Store vinculada al bundle `com.hellostrivo.strivo`.
2. **Subir la clave .p8** de compras dentro de la app, con su Key ID y su Issuer ID. Esto no es opcional: RevenueCat la necesita para validar las transacciones con StoreKit 2, **y es requisito específico para que funcionen los códigos de oferta.** Sin ella, las claves de las aliadas no otorgan el derecho.
3. **Entitlement** `completo`, asociado a los tres productos.
4. **Offerings:** `default` con los paquetes `anual` y `mensual`; `fundador` con el paquete vitalicio, que se prende y apaga desde el panel sin publicar versión.
5. **Avisos de Apple a RevenueCat (App Store Server Notifications):** RevenueCat tiene un botón que los configura solo en App Store Connect, para producción y sandbox. No son obligatorios, pero sin ellos los reembolsos y las expiraciones tardan en reflejarse. Conviene activarlos.
6. **Escuchar los cambios de estado del cliente.** La app se suscribe a las actualizaciones de `customerInfo` del SDK. Es la única forma fiable de enterarse de un canje, y también cubre renovaciones, reembolsos y cancelaciones hechas fuera de la app.
7. **Webhooks (opcional, v1.1):** sirven para avisar a un servicio propio de cada compra. No hace falta en 1.0.

**Identidad:** `Purchases.configure({ apiKey, appUserID: uid })` tras iniciar sesión; `logOut()` al cerrar sesión y en SPEC_24. Nunca anónimo.

### 6.4 Estado, gating y lo demás

**Estado de derecho.** Un `SuscripcionProvider` expone `{ estado: 'prueba'|'activa'|'fundador'|'lectura'|'cargando', hasta, refrescar }`. Fuente de verdad: RevenueCat `customerInfo` **más** `fechaInicioPrueba` del perfil. Lógica, en este orden: `fundador` si tiene el no consumible; `activa` si `entitlements.completo.isActive`; `prueba` si hoy < inicio + 7 días; si no, `lectura`. El orden importa: un derecho activo gana siempre sobre la prueba, y eso es lo que hace que una clave canjeada durante la prueba funcione sin lógica extra.

**Gating.** Una sola función `puedeEscribir()` consumida por Diario, Journal e Intención. No se toca cada componente por separado: Claude Code identifica el punto de escritura común en la capa de datos y lo protege ahí; la UI consulta el mismo estado para mostrar el aviso `lectura`.

**Fechas.** `fechaInicioPrueba` es ISO en UTC; el cálculo de "día 8" se hace en zona local del dispositivo. Reloj manipulado: no se defiende en v1.0.

**Analítica mínima.** Cuatro eventos: `paywall_visto`, `compra_iniciada`, `compra_ok`, `compra_cancelada`, con el plan. Solo en RevenueCat (ya los provee) y en un log local para la fundadora. **Sin** SDK de analítica adicional (DP-25.3). Los canjes por aliada **no** se miden en la app ni en RevenueCat: se leen en el reporte de canjes de App Store Connect.

**Web (PWA).** Sin RevenueCat web en v1.0. La PWA se comporta como `prueba` indefinida solo para testers marcados en Firestore (`perfil.tester: true`), y como `lectura` para cualquier otra cuenta. Los códigos de oferta son de Apple, así que en la PWA no existe "Tengo un código". Ver DP-21.5.

**Seguridad.** La clave pública de RevenueCat va en el cliente (es su diseño). La clave .p8 **nunca** entra al repo: vive solo en el panel de RevenueCat y en el gestor de contraseñas de la fundadora. Los derechos se validan contra los recibos de Apple del lado de RevenueCat; la app no confía en estado local para nada que no sea la UI.

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
9. Ningún precio hardcodeado (`grep -rn "89\|799\|1499\|MXN\|€" src/` sin resultados fuera de pruebas).
10. **"Tengo un código" abre la hoja de Strivo** desde el paywall y desde Ajustes; "Continuar" está inhabilitado con el campo vacío; "Cancelar" cierra sin efectos.
11. **Camino B completo:** escribir una clave de sandbox válida → se abre el App Store con la clave ya puesta → confirmar → volver a Strivo → derecho activo, `codigo.listo`, escribir funciona.
12. **Camino A completo:** canjear la misma clave desde el enlace, sin pasar por la app; al volver a Strivo y pasar a primer plano, el derecho aparece sin tocar nada.
13. **Clave inválida:** el App Store lo avisa; al volver a Strivo aparece `codigo.noAplicado` con "Restaurar compras", y el paywall queda intacto.
14. **Clave canjeada durante la prueba:** el estado pasa de `prueba` a `activa` de inmediato y Ajustes muestra el plan correcto.
15. **Espacios y minúsculas:** escribir ` alejandra10 ` con espacios y en minúsculas funciona igual que `ALEJANDRA10`.
16. **El enlace lleva el ID correcto:** el `id` del enlace armado es `6836996054`. Prueba unitaria sobre la función que arma la URL.
17. Suite verde; al menos 40 pruebas nuevas.

## 8. Plan de pruebas

**Unitarias:** cálculo de estado (12 combinaciones de `customerInfo` × fechas); `puedeEscribir()`; tarjeta de día 6 una sola vez; textos de Ajustes por estado; que un derecho activo gane sobre `prueba` vigente; y la función que arma la URL de canje (normalización a mayúsculas, recorte de espacios, ID correcto, clave vacía rechazada).

**Integración:** SDK mockeado; flujo de compra ok / cancelada / error; restauración con y sin compras; apertura del enlace de canje; `syncPurchases()` seguido de `refrescar()` al volver a primer plano; que el aviso `codigo.noAplicado` solo aparezca después de haber intentado un canje.

**Manuales:** criterios 1–16 en sandbox; al menos dos cuentas de prueba de Apple; al menos una clave de sandbox para probar el canje por los dos caminos.

**Regresión:** todo lo escrito antes de expirar sigue legible; Respiración según DP-25.1; borrado de cuenta (SPEC_24) desvincula RevenueCat.

## 9. Riesgos, mitigación y reversión

| Riesgo | Mitigación | Reversión |
|---|---|---|
| Rechazo de Apple por paywall (faltan datos obligatorios) | Checklist de la sección 5; captura del paywall en las notas para el revisor | Ajuste de copy/enlaces |
| Modo lectura percibido como castigo | Copy explícito de que nada se pierde; exportar siempre disponible; Respiración libre (DP-25.1) | Ampliar prueba a 14 días por bandera remota |
| Gating disperso por componentes | Un solo punto en la capa de datos | — |
| Persona compra y la app no refleja el derecho | `refrescar()` tras compra y al volver a primer plano; "Restaurar compras" siempre visible | — |
| **Canje por enlace y el derecho no aparece** | `syncPurchases()` antes de `refrescar()` al volver a primer plano; `codigo.noAplicado` manda a "Restaurar compras" | — |
| **La clave .p8 no está en RevenueCat** | Es requisito para los códigos de oferta: queda en la lista de 6.3 y se verifica en sandbox antes de abrir la campaña | Subirla; no requiere publicar versión |
| Una clave se filtra fuera de la audiencia de la aliada | Tope de canjes y fecha de vencimiento por clave; revisar la velocidad de canjes a diario durante la campaña | Desactivar la clave u oferta en App Store Connect; no requiere publicar versión |
| **No se puede medir el ingreso de la campaña en RevenueCat** (todo entra como $0) | El número bueno se lee en App Store Connect; los acuerdos de comisión se hacen contra ese reporte, no contra el tablero de RevenueCat | — |
| "Tengo un código" distrae de la ruta normal de compra | Es un enlace discreto después de "Restaurar compras", nunca un botón primario | Quitar el enlace del paywall y dejarlo solo en Ajustes |
| Salir al App Store rompe el hilo de la compra | El aviso `codigo.aviso` lo anticipa antes de salir | — |

## 10. Orden y dependencias

Décimo. Requiere 19, 20 y 21. SPEC_24 añade `logOut()` aquí si se implementa antes; SPEC_26 conecta Google Play al mismo `SuscripcionProvider`. Los códigos de oferta son de Apple: en SPEC_26 habrá que resolver el equivalente de Google Play por separado, no se hereda nada de aquí.

## Decisiones pendientes

- **DP-25.1** En modo lectura, ¿Respiración sigue funcionando completa? Recomendación: **sí**. Es lo más generoso que se puede ser sin regalar el producto entero, y es coherente con "refugio".
- **DP-25.2** Prueba gestionada por la app (recomendado: sin tarjeta, menos fricción, coherente con "nada bloquea") frente a oferta introductoria de Apple (la persona debe "suscribirse" para empezar la prueba; convierte mejor pero exige tarjeta el día 1). Si se elige Apple, cambian 3.1 y 6. **Los productos se crearon sin oferta introductoria, o sea asumiendo la recomendación; cambiar de opinión se hace en App Store Connect, no en código.**
- **DP-25.3** ¿Se añade un SDK de analítica (p. ej. Firebase Analytics) para el embudo? Recomendación: no en v1.0. RevenueCat da conversión; el resto se mide a mano con seis números.
- **DP-25.4** Duración y tope de la oferta Fundador (propuesta del plan: 30 días desde el lanzamiento, sin tope de unidades). Se controla desde RevenueCat, no en código.
- **DP-25.5** ~~Precios finales~~ **RESUELTA el 19 nov 2026.** Quedaron en App Store Connect: **$89 MXN mensual, $799 MXN anual, $1,499 MXN fundador**, con México como país base y el resto derivado por Apple. Las cifras en euros y dólares de la propuesta original quedan sin efecto. No afecta al código.
- **DP-25.6** ¿Qué formato toma la rebaja de las aliadas: pago periódico rebajado (precio menor durante N periodos) o pago único por adelantado? ¿Y por cuántos periodos? Recomendación: pago periódico rebajado durante el primer año, para que la persona se quede con el hábito antes de pagar precio completo. Nota: Apple no acepta "10 %" como tal, se elige un punto de precio concreto, así que el 10 % queda aproximado.
- **DP-25.7** ¿La clave aplica solo al anual o también al mensual? Recomendación: **solo al anual**. Un 10 % sobre $89 son nueve pesos, que no mueve a nadie y complica la campaña; sobre $799 sí se nota. Además los códigos no permiten bajar de plan, así que tener claves en los dos productos crea casos raros.
- **DP-25.8** ~~¿Cómo se cuentan los canjes por aliada?~~ **RESUELTA el 19 nov 2026.** Una sola oferta con una clave personalizada por aliada; el reporte de canjes de App Store Connect desglosa por clave. El tope de diez ofertas por suscripción no limita a cuántas aliadas se puede sumar. El tablero de RevenueCat **no** sirve para esto.
- **DP-25.9** ¿El Fundador también acepta clave de aliada? Apple permite códigos de oferta en productos no consumibles. Recomendación: **no** en el lanzamiento. El Fundador ya es la puerta más barata a largo plazo y encimarle una rebaja enreda el mensaje.
- **DP-25.10** Si Apple llegara a estabilizar su hoja de canje nativa, ¿se cambia el camino B por ella? Recomendación: no durante la 1.0. Revisar después del lanzamiento; el cambio es sustituir una llamada.

---

## Nota de SPEC_24 (15 nov 2026) — borrar la cuenta y las compras

Sin cambiar el alcance de esta SPEC, tres cosas que SPEC_24 deja dichas:

1. **«Restaurar compras» se llama así porque la pantalla de borrado ya lo nombra.** En la app de
   iPhone, la primera pantalla de «Borrar mi cuenta» dice: «Lo que pagaste queda ligado a tu Apple
   ID, no a tu cuenta de Strivo. Si más adelante creas otra cuenta, lo recuperas con “Restaurar
   compras”.» (`copy.cuenta.borrar.compras`). Si `paywall.restaurar` cambia de nombre, esa frase
   tiene que cambiar con él. El enlace «Ver mi suscripción» abre hoy
   `https://apps.apple.com/account/subscriptions`; esta SPEC puede cambiarlo por
   `showManageSubscriptions`.
2. **`Purchases.logOut()` de RevenueCat va en `src/lib/borrarCuenta.js`**, en la fase `telefono`
   (`limpiarElTelefono`), en el sitio marcado con un comentario: después de `deleteUser` y antes de
   vaciar el teléfono.
3. **Si hiciera falta borrar el cliente de RevenueCat**, eso pide su llave secreta, que no puede ir
   en la app: se decide aquí, con servidor o sin él.
