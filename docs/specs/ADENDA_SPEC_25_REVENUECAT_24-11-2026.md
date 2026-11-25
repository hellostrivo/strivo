# Adenda SPEC_25 — Configuración de RevenueCat (24 nov 2026)

Complementa la sección 6.3 de `SPEC_25_MURO_DE_PAGO.md`, que dice que el proyecto «todavía no existe». Ya existe. **Con esto queda cumplido el último requisito antes de codificar SPEC_25.** Aquí está lo que quedó configurado y lo que Claude Code debe saber antes de programar.

## Lo que quedó hecho

- **Proyecto** `Strivo` en RevenueCat.
- **App** «Strivo», tipo App Store, bundle `com.hellostrivo.strivo`.
- **Llave .p8 de compras** (In-App Purchase Key) subida en la app, con su Key ID y el Issuer ID. RevenueCat la marca «Valid credentials». Es la que exige la SPEC para StoreKit 2 y para los códigos de oferta.
- **Llave .p8 de la API de App Store Connect** (Team Key, nombre «RevenueCat», acceso Gestor de apps) subida en la misma app. También marca «Valid credentials». Sirve para que RevenueCat consulte los productos en Apple. Se pidió acceso a la API ese mismo día y Apple lo aprobó al instante.
- Las dos llaves viven solo en el panel de RevenueCat y en la carpeta segura de la fundadora, fuera del repo.
- **Productos** dados de alta para la app Strivo: `strivo_mensual` (suscripción), `strivo_anual` (suscripción) y `strivo_fundador` (no consumible).
- **Entitlement** `completo` (nombre visible «Acceso completo a Strivo»), con los tres productos.
- **Offering `default`**: es el actual («Current»). Paquetes que importan para iOS:
  - `$rc_annual` → `strivo_anual`
  - `$rc_monthly` → `strivo_mensual`
- **Offering `fundador`**: no es el actual. Un paquete `$rc_lifetime` → `strivo_fundador`.
- **Avisos de Apple a RevenueCat** (App Store Server Notifications): la URL de RevenueCat quedó puesta en App Store Connect → Strivo → Información de la app, tanto en producción como en sandbox. No hubo botón automático; se pegó a mano. RevenueCat dirá «No notifications received» hasta la primera compra de prueba en sandbox: esa es la verificación.

## Cambio respecto a la SPEC

La SPEC (6.3, punto 4) habla de paquetes «anual» y «mensual». Se usaron los **tipos estándar de RevenueCat** (`$rc_annual`, `$rc_monthly`, `$rc_lifetime`). En el código se leen como `offering.annual`, `offering.monthly` y `offering.lifetime`, no por identificador propio.

## Estado de los productos: «Missing Metadata»

Con la llave de la API puesta, RevenueCat ya encuentra los tres productos en Apple: los identificadores coinciden. Su estado es **«Missing Metadata»**, el mismo que tienen en App Store Connect, porque les falta la captura para la revisión (ya se sabía, ver SPEC 6.1).

**Ojo para las pruebas en sandbox:** con ese estado, StoreKit puede no devolver los productos y los offerings llegan vacíos al iPhone. Antes de probar compras en el dispositivo, cada producto debe quedar en **«Listo para enviar»** en App Store Connect: subir una captura (puede ser provisional y cambiarse por la del paywall real antes de mandar a revisión) y revisar que el producto y el grupo de suscripción `Strivo` tengan su nombre y descripción localizados. Si en sandbox los offerings llegan vacíos, esto es lo primero que hay que revisar, antes de buscar el error en el código.

## Restos que dejó RevenueCat al crear el proyecto (no se usan, no se borran)

- Una app **Test Store** con sus propios productos.
- Un entitlement **`strivo_pro`** asociado a los productos de Test Store. El código consulta **solo** `entitlements.completo`.
- Dentro de `default` hay además un paquete `$rc_lifetime` que solo tiene el producto de Test Store. En el iPhone no aparece, porque no tiene producto de la app Strivo. El Fundador se toma **solo** del offering `fundador`, nunca de `default`.
- El nombre visible de `default` es «The standard set of packages». Es interno; nadie lo ve en la app.

## Pendiente

- Poner los tres productos en «Listo para enviar» antes de probar compras en sandbox (ver arriba).
- El **Vendor number** quedó vacío en la sección de la API. Es opcional.
- En la sección de avisos de RevenueCat quedaron sin tocar el «Forwarding URL» y la casilla «Track new purchases from server-to-server notifications».
- Cómo se «prende y apaga» el offering `fundador` desde el panel (SPEC 3.3 y criterio 6) se define al implementar. `fundador` no puede ser el offering actual porque ese lugar lo ocupa `default`.
