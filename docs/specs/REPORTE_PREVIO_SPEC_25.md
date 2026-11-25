# Reporte previo · SPEC_25 — Cobrar (25A) y «Tengo un código» (25B)

**Fecha:** 24 nov 2026 · **Para:** la fundadora · **Sobre:** `revision-25` en `f4c4653`, sin una línea de código cambiada.

## 0. Estado del repositorio (§0.2–§0.4)

- `strivo` está en `f4c4653`, igual que `origin/strivo`.
- Worktrees: solo estaba `~/Developer/strivo`. No existen `~/Developer/strivo-24` ni ninguna rama local `revision-*`.
- **Montado:** `~/Developer/strivo-25`, rama `revision-25`. Copiados la instrucción, la adenda y, sin comitear, `.env.local` y `GoogleService-Info.plist` (los dos ignorados por git).
- **No corrí `npm install` ahí**, porque pediste no instalar nada. Toda la prueba del plugin se hizo en una copia temporal, fuera de las dos carpetas, y en un simulador creado para eso y ya borrado.
- **Falta tu clave pública:** `.env.local` no tiene todavía ninguna `appl_…`. El nombre queda en `VITE_REVENUECAT_IOS_KEY` (Anexo C, paso 3).
- **Hay dos SPEC_25 distintas.** La comiteada es la de septiembre más la nota de SPEC_24. La de tu carpeta, sin comitear, es la buena (§3.6, §6.1–6.3, los textos `codigo.*`) pero **no lleva esa nota**. La instrucción se apoya en las dos. Ver D1.

## 1. Lo que necesito que decidas

| # | Asunto | Propuesta |
|---|---|---|
| **D1** | Dos SPEC_25 | Comitear en `revision-25` tu versión **más** la nota de SPEC_24 al final. Antes de fusionar descartas tu copia modificada en `~/Developer/strivo`; si no, git se niega a fusionar. |
| **D2** | **`fechaInicioPrueba` no en `shared/profile`, sino en `shared/onboarding`** | En el perfil se fusiona el documento entero y gana el más nuevo: escribir ahí la fecha en la primera apertura sellaría como «recién editado» un perfil viejo, y podría pisar en la nube el nombre o los horarios puestos en otro teléfono. El expediente ya tiene la regla de «hechos que no se deshacen», y `terminarRecorrido` lo escribe de una vez con `completedAt`. |
| **D3** | **Quién recibe la fecha** | Solo la app de iPhone. Si la web también la escribiera, quien usara la PWA dos semanas instalaría la app con la prueba ya vencida. Con DP-25.12, la web no tiene prueba. |
| **D4** | **Hasta qué día dice la prueba** | Días de calendario, con el día de la instalación como día 1. El último día completo es el 7, o sea **hoy + 6**. Así «Tu prueba termina mañana» (día 6) y «hasta el {fecha}» dicen lo mismo. P1 decía «dentro de 7 días»: sería el día 8, ya en lectura. El cambio de día usa el `diaTerminaA` del perfil, como el diario. |
| **D5** | **Simular día 6 y día 8** | P3 y P4 piden cerrar la app del todo, y un desfase «en memoria» se pierde al cerrarla. Propongo guardarlo en una clave de `localStorage` que solo lee y escribe el build de diagnóstico. No toca el almacén ni sale del teléfono. «Volver al día de hoy» la borra. |
| **D6** | **Leer una entrada del Journal en modo lectura** | La lista solo enseña un extracto: hoy la única forma de leer una entrada entera es abrir el editor. Si «editar abre el muro» sin más, **lo escrito quedaría tras el muro**. Propongo que tocar una entrada la abra entera para leer, con `lectura.aviso`, «Ver opciones», «Eliminar» y volver. Solo «Escribir» abre el muro. |
| **D7** | **Quien pagó sin cuenta y entra a una cuenta que ya tenía** | RevenueCat no une nada en ese caso (§4). Sin más, alguien que acaba de pagar vería el muro. Propongo: si justo antes de entrar el derecho estaba activo y después no, la app llama **una vez** a restaurar, en silencio. En StoreKit 2 no pide contraseña (leído en el SDK). Es lo que pide DP-25.11. |
| **D8** | «Gestionar suscripción» | El plugin de Capacitor **no tiene `showManageSubscriptions`**. Se abre `https://apps.apple.com/account/subscriptions`, como ya hace SPEC_24. Esa página enseña tus suscripciones **reales**, no las de sandbox: C6 y C7 cambian (§8). |
| **D9** | Lo que RevenueCat recibe además del `uid` | El SDK manda en cada petición el **identificador de vendedor del teléfono (IDFV)**, y no se puede apagar. También versión de iOS y de la app, e idioma. RN-07 y «el `uid` y nada más» no se cumplen al pie de la letra. Propongo aceptarlo y decirlo en el aviso de privacidad. `automaticDeviceIdentifierCollectionEnabled` va en `false` y `diagnosticsEnabled` sigue apagado. Si no lo aceptas, RevenueCat no sirve. |
| **D10** | Ningún byte del plugin en la web | El import bajo demanda no basta: **el service worker precarga todos los trozos `.js`**, también los de los plugines de hoy. Propongo que el import exista solo en el build `--mode ios`, para que en Netlify no haya ni archivo. |
| **D11** | Sin la clave | `ios:build` se detiene con una frase si falta `VITE_REVENUECAT_IOS_KEY` o no empieza por `appl_`. Una build publicada sin clave dejaría a todo el mundo en lectura sin poder pagar. Fuera de git, como el resto. Esto cambia «sin ella la app arranca igual», que sigue valiendo en pruebas y en la web. |
| **D12** | DP-25.12, la web | Como hoy hasta DP-21.5. **Recomiendo aprobarla.** |
| **D13** | Los avisos en modo lectura | La instrucción no lo dice. Seguirían llegando «¿Cómo cerrar el día?» a quien no puede escribir. Propongo no tocarlos en la 1.0: los apaga quien quiera en Tu perfil. Cortarlos pide cambiar la ventana de 14 días. |
| **D14** | Textos huérfanos `profile` y `paywall` | **Retirar los dos.** No coinciden con SPEC_25 y `paywall` lleva precios escritos a mano («99 MXN/mes»), que harían fallar el criterio 9. Los nuevos van en `copy.suscripcion`. |
| **D15** | `fechaInicioPrueba` al cerrar sesión | Cerrar sesión crea un uid nuevo y un onboarding nuevo, o sea otros 7 días. Lo mismo que reinstalar: propongo aceptarlo. Volver a entrar recupera la fecha vieja. |
| **D16** | Los textos nuevos de §6 | Van tal cual. Pasan el léxico. |
| **D17** | Términos y Privacidad | Términos: el EULA de Apple. **La URL de privacidad todavía no existe en el repo (A9).** Propongo que el enlace no se pinte mientras la constante esté vacía, y que `ios:build` lo avise sin detenerse. |

**Aprobadas tal cual por mi parte:** DP-25.15, 25.16, 25.17, 25.20, 25.21 (con D5), 25.22, 25.24.

## 2. El plugin (§0.6)

**Versión: `@revenuecat/purchases-capacitor` 14.1.2**, exacta (18 nov 2026). Pide Capacitor ≥ 8.

| Versión | Fecha | Qué cambió para iOS |
|---|---|---|
| 13.8.0 | 27 oct | La última 13 |
| 14.0.0 | 28 oct | **`configure` y otros métodos contestan de verdad.** En la 13 estaban declarados sin respuesta y resolvían antes de tiempo, tragándose los errores. En Android, Billing 9 |
| 14.1.1 | 16 nov | Solo dependencias |
| **14.1.2** | 18 nov | Solo dependencias (SDK de iOS 5.103.1) |

La 14 arregla justo lo que nos importa. La rama 14 tiene menos de un mes (28 oct); la alternativa conservadora es 13.8.0.

- **SPM, sin CocoaPods.** `cap sync` añade dos líneas a `Package.swift` (`RevenuecatPurchasesCapacitor`), sin `packageOptions` ni traits. Resuelve `purchases-hybrid-common` 20.10.0 y `purchases-ios-spm` **5.103.1**. Compila para iPhone (Release) y simulador con iOS 16.2.
- **Sin cambios en `capacitor.config.json`, `Info.plist`, `App.entitlements` ni `project.pbxproj`.** Las compras no piden entitlement; el App ID las trae activas. La casilla «In-App Purchase» de Xcode no hace falta.
- **Implementación web:** trae una simulada («Web not supported in this plugin», o datos de mentira). No es Web Billing. Se carga en un trozo aparte; ver D10.
- **Es un Proxy sobre el Proxy de Capacitor.** Probado en el simulador (iPhone 17, iOS 27.2, build firmada ad hoc, import dinámico, SPM):

| Qué se probó | Resultado |
|---|---|
| Devolver `Purchases` suelto de una función `async` | **Colgado** (8 s sin respuesta) |
| `{ plugin }` y después `configure` | Resuelve |
| `isConfigured` antes y después | `false`, luego `true` |
| Oyente de `customerInfo` | Devuelve su identificador |
| `isAnonymous` / `getAppUserID` | `true` / `$RCAnonymousID:…` |
| `logOut` siendo anónimo | Error **22** («LogOut was called but the current user is anonymous») |
| `getCustomerInfo`, `getOfferings` con clave inventada | Error **11**, rechazan sin colgarse |
| `configure` por segunda vez | Resuelve |

El caso del foro (un `configure` que no resuelve) **no se reproduce envuelto en `{ plugin }`**. Lo probado va con una clave inventada: con la tuya falta ver productos y compras.

**Firmas:**

| Método | Firma y detalle |
|---|---|
| `configure` | `({ apiKey, appUserID?, … }) → Promise<void>`. Sin `appUserID`, recupera el último de su caché o crea uno anónimo |
| `logIn` | `({ appUserID }) → { customerInfo, created }`. Con el mismo id, no hace nada |
| `logOut` | `() → { customerInfo }`. Anónimo: rechaza con 22 |
| `getCustomerInfo` | `() → { customerInfo }`. Con caché de hasta 5 min con la app delante |
| `addCustomerInfoUpdateListener` | `(fn) → id`. Si ya había datos, llama enseguida |
| `getOfferings` | `() → { current, all }`. Cada offering: `metadata` (objeto tal cual), `annual`, `monthly`, `lifetime` (o `null`), `availablePackages`. Precio en `paquete.product.priceString` |
| `purchasePackage` | `({ aPackage }) → { productIdentifier, customerInfo, … }`. **Al cancelar, rechaza**, con `userCancelled: true` y código `PURCHASE_CANCELLED` (1). Compra aplazada (pedir permiso): `PAYMENT_PENDING` |
| `restorePurchases` | `() → { customerInfo }`. Sin compras también resuelve: hay que mirar `completo` |
| `syncPurchases` | `() → Promise<void>` |
| `isAnonymous`, `getAppUserID` | `{ isAnonymous }`, `{ appUserID }` |
| `showManageSubscriptions` | **No existe** (D8) |

**Compra aplazada:** `purchasePackage` rechaza con `PAYMENT_PENDING`; no es un error ni una cancelación. Propongo tratarla como cancelación (el muro se queda igual) y que el oyente abra el derecho cuando llegue. Así no hace falta texto nuevo.

**Los cuatro datos del derecho** salen de `entitlements.active.completo`: `productIdentifier`, `willRenew`, `expirationDate`, `isActive`. **Fundador = `productIdentifier === 'strivo_fundador'`**; con `willRenew: false` y fecha, el texto es «Termina el…».

## 3. Al volver a primer plano (DP-25.18)

Leído en el SDK con StoreKit 2: el oyente de transacciones (`Transaction.updates`) está activo desde `configure`. Recibe lo que pasa fuera de la app, lo manda a RevenueCat y avisa por el oyente de `customerInfo`. Al volver al frente, además, refresca su caché si tiene más de 5 minutos.

**Propuesta:** oyente desde el arranque y `getCustomerInfo` al volver. **Sin `syncPurchases()` en 25A.** En 25B, solo tras un canje que abrió la propia app. RevenueCat recomienda `syncPurchases` después de un canje por enlace; por eso **K1 y K2 deciden**: si el derecho no llega solo en unos 30 segundos, añado `syncPurchases` limitado a una vez cada 10 minutos. Lo que siempre queda es «Restaurar compras».

**Nunca se invalida la caché** antes de leer: sin red, dejaría a quien pagó sin derecho.

**Sin red, con caché:** el SDK conserva el último derecho y lo da por bueno 3 días desde su última respuesta; después mira la fecha de vencimiento.

## 4. La identidad (DP-25.19)

Tabla de la documentación de RevenueCat, aplicada a Strivo. La última columna es lo que se ve.

| Caso | Qué hace RevenueCat | Qué ve la persona |
|---|---|---|
| Compra sin cuenta y después cuenta **nueva** | Une las dos identidades | Sigue con su plan |
| Compra sin cuenta y entra a una cuenta **que ya existía** (casi todas tienen ya un alias anónimo) | Cambia a la cuenta y **no une nada** | Sin D7, el muro. Con D7, sigue con su plan |
| Cerrar sesión con suscripción | Cliente anónimo nuevo, sin derecho | En prueba (D15) o lectura; «Restaurar compras» lo devuelve |
| Dos cuentas de Strivo, mismo Apple ID | No se pega al entrar. «Restaurar compras» **lo mueve** a la cuenta abierta («Transfer») | Solo una de las dos lo tiene |
| Sesión `vencida` | Nada | Igual |

**Riesgo para C10 y C4.** Una **renovación** que StoreKit entrega al cliente abierto se manda a nombre de ese cliente. En sandbox renueva cada 5 minutos, así que el plan puede volver solo, sin tocar «Restaurar compras». Con un cliente anónimo el SDK lo manda además como restauración, y según la documentación las compras de un anónimo se **unen**. No pude comprobar ese caso sin tu clave. Por eso C10 se hace **con el Mensual ya vencido** o en los primeros minutos. En producción pasa una vez al mes y es siempre el mismo Apple ID, o sea la misma persona que paga.

**`logIn` sin red:** se reintenta al volver al frente y al volver la red. Mientras tanto no se llama nada más.

**`logOut`** en `salirDeCuenta` (después de cerrar la sesión) y en `limpiarElTelefono` de `borrarCuenta.js`, antes de `vaciarTelefono`. Siempre preguntando antes `isAnonymous`, con techo de 3 s y sin frenar nunca la salida ni el borrado.

## 5. `fechaInicioPrueba` (DP-25.13, con D2)

- Hoy **no existe nada parecido** en el repo.
- `FIELDS.onboarding` gana el campo. `terminarRecorrido` la escribe con `completedAt`. La siembra **no** la escribe.
- **Quien ya terminó:** en la primera apertura de la versión nueva, si hay `completedAt` y no hay fecha. Con cuenta, solo después de que su bajada haya terminado bien; si no, se espera y mientras tanto se puede escribir.
- **Fusión:** `hechosQueFaltan` (`conflictos.js`) es la única fusión por campo y la usan ya la bajada y la mudanza. Le añado una segunda clase de hecho: «si los dos lo traen, gana el más antiguo». **Ninguna regla se copia** y los dos sitios que la llaman no cambian.
- **Cuenta que ya existía, en un teléfono con otra prueba en curso:** gana la más antigua. Si la de la cuenta ya venció, pasa a lectura al entrar.
- **Mudanza aplazada:** se lee del árbol de `arbolDeEntrada`, como la puerta.
- **Residuo aceptado:** dos teléfonos de una misma cuenta anterior que reciben la fecha en días distintos pueden dejar en la nube la más nueva. Solo afecta a las testers de hoy.

## 6. Estados × pantallas (DP-25.13 y 25.14)

`estado` sale de una función pura, en este orden: `web` · `cargando` · `fundador` · `activa` · `prueba` · `lectura`.

| | `web` | `cargando` | `prueba` | `activa` / `fundador` | `lectura` |
|---|---|---|---|---|---|
| **Escribir** | Sí | Sí | Sí | Sí | No |
| **Hoy** | Como hoy | Como hoy | Como hoy. Día 6, la tarjeta una vez | Como hoy | El día en consulta, `lectura.aviso` y «Ver opciones» en lugar de «Este día ya quedó como quedó» |
| **Journal** | Como hoy | Como hoy | Como hoy | Como hoy | Lista, búsqueda, PIN y ajustes igual. Tocar una entrada: entera, para leer (D6). «Escribir»: el muro |
| **Historial** | Igual | Igual | Igual | Igual | Igual |
| **Respiración** y «Respira un momento» | Igual | Igual | Igual | Igual | Igual, entera |
| **Tu perfil · Suscripción** | No hay bloque | Bloque sin estado, con «Restaurar compras» | «En prueba, hasta el…» · Ver opciones · Restaurar | El plan · Gestionar (no en Fundador) · Restaurar | «Sin suscripción» · Ver opciones · Restaurar |
| **Resto de Tu perfil, exportar, borrar** | Igual | Igual | Igual | Igual | Igual |
| **Muro solo** | Nunca | Nunca | Nunca | Nunca | Una vez por sesión, tras el umbral. «Ahora no» |

- Lo tecleado antes del vencimiento se vuelca (`volcar` y la salida no se tocan; solo `abierto()` consulta `puedeEscribir`). En el journal, un borrador ya abierto se guarda y al cerrarlo queda en lectura.
- `local.js`, `sync.js` y `restaurar.js` no cambian.
- Si alguien tiene Mensual, no ve «Ver opciones»: cambiar a Anual se hace en la pantalla de Apple.
- El muro no puede taparse con onboarding, presentación, despedida ni «a medio borrar»: vive dentro de `Secciones`, que en esos casos no está o no da paso.

## 7. El resto de los REPORTA

**Fundador (DP-25.15).** El JSON exacto, en Offerings → `fundador` → Metadata:

```json
{ "mostrar": false, "hasta": "2027-01-15" }
```

`mostrar` solo cuenta si es `true` (no `"true"` ni `1`); `hasta` es `AAAA-MM-DD` e incluye ese día. RevenueCat admite cualquier JSON de hasta 4.000 caracteres. **Los cambios tardan hasta 5 minutos** en verse (caché del SDK). «Refrescar» del diagnóstico los trae en el acto.

**Privacidad, para la ficha de la App Store.** El manifiesto del SDK (`PrivacyInfo.xcprivacy`) declara poco; la columna de la derecha es lo que recomienda RevenueCat cuando el identificador es propio.

| Dato | Manifiesto del SDK | Ponlo en la ficha |
|---|---|---|
| Historial de compras | Sí. Funcionalidad. Sin vincular. Sin rastreo | Sí. Funcionalidad de la app **y** Analítica. **Vinculado a la identidad: sí** (el `uid` se puede ligar al correo en Firebase). Rastreo: no |
| ID de usuario | No | Sí. Funcionalidad. Vinculado: sí. Rastreo: no |
| ID de dispositivo (IDFV) | No | RevenueCat no lo pide sin publicidad, pero el SDK lo manda (D9). Decide con el aviso de privacidad |
| Nombre, correo, contenido, ubicación | No | No por RevenueCat |
| API con motivo declarado | UserDefaults, CA92.1 | Nada que hacer |

**Tamaño.** App en Release, arm64, sin firmar y sin símbolos:

| | Antes | Con el plugin | Diferencia |
|---|---|---|---|
| `.app` | 6.836 KB | 13.896 KB | **+7,1 MB** |
| Comprimido (lo más parecido a la descarga) | 2,77 MB | 5,60 MB | **+2,8 MB** |
| Con símbolos, sin comparar con la tienda | 9.692 KB | 26.344 KB | +16,7 MB |

Es el doble de app, por el SDK nativo. No se puede recortar. Web: chunk principal de partida **770,84 kB (gzip 218,47)**; el plugin no entra en él (sus trozos, 9,3 y 10,1 kB, van aparte y con D10 no existen en Netlify).

**Clave pública:** `VITE_REVENUECAT_IOS_KEY`, fuera de git (D11).

**Token `acento`:** no existe con ese nombre. Existe `--espacio-acento` (`border-espacio-acento`, `bg-espacio-acento`). Se usa ese; la tarjeta elegida lleva además peso y `aria-checked`, nunca solo color. `components/ui/Card.jsx` lleva sombras y `bg-paper` fijo, que aquí no valen: las tarjetas usan la forma de `Bloque` con superficies por papel.

**Marca de la tarjeta del día 6:** familia nueva `strivo.tarjetaDePrueba.<uid>` en `clavesDelTelefono.js`, la quinta. Se marca al mostrarse.

**Carpeta nueva:** `src/components/suscripcion/`, que hay que añadir a la lista de `separacion.test.js`. El bloque vive en `components/perfil/`.

**Dirección de dependencias:** `lib/suscripcion/` tiene lo puro y el contexto (como `lib/useSesion`); el proveedor, en `components/suscripcion/`, montado dentro de `Secciones`. Diario, Journal y Tu perfil solo leen el hook. Sin proveedor, el valor por defecto es `web`, así que las pruebas de hoy no cambian.

**Simulador.** Cubre sin tu clave: el puente, los rechazos, el muro con `sinPlanes`, la prueba, la lectura, el día 6 y el 8 y todo lo visual con dobles. Un archivo StoreKit local solo funciona lanzando desde Xcode y no ejercita RevenueCat. **Compras, restaurar, códigos y Fundador son de tu iPhone.**

**Canje en sandbox.** Los códigos de sandbox **no se canjean por el enlace del App Store**, según lo que encontré: se canjean en los ajustes de la cuenta de sandbox. La ayuda de Apple dice «through your Sandbox Account settings» (iOS 16.3 o más); la ruta exacta sale de un foro de desarrolladores, no de Apple: **Initiate Transaction → Offer Codes**. Por eso K1 cambia y **H2 pasa a producción (Anexo D)**, como ya preveía la instrucción. H1 y H3 se quedan.

**Dónde está la cuenta de sandbox.** Desde iOS 18.1: **Ajustes → Desarrollador → Cuenta de Apple de sandbox** (fuente: RevenueCat). «Ajustes → App Store» es de antes. El Anexo B se corrige.

**25B, espera al volver (DP-25.25):** `syncPurchases`, luego hasta 10 s atendiendo el oyente y preguntando a los 2, 5 y 10 s. Sin derecho entonces, `codigo.noAplicado`.

### Archivos

**Nuevos:** `src/lib/compras.js`; `src/lib/suscripcion/{estado,fundador,inicioDePrueba,useSuscripcion,identidad,enlaces}.js` y, en 25B, `canje.js`; `src/components/suscripcion/{ProveedorDeSuscripcion,Muro,TarjetaDePrueba,AvisoDeLectura}.jsx` y, en 25B, `HojaDeCodigo.jsx`; `src/components/perfil/{TuSuscripcion,DiagnosticoSuscripcion}.jsx`; `src/components/diario/EntradaDelJournal.jsx` (D6); pruebas en archivos propios.

**Tocados:** `src/lib/db/{schema,conflictos,clavesDelTelefono}.js`; `src/onboarding/escritura.js`; `src/lib/{salidaCuenta,borrarCuenta}.js`; `src/components/ArranqueProvisional.jsx` (identidad tras entrar); `src/App.jsx`; `src/diario/{useDiario,useJournal}.js`; `src/pages/diario/{Hoy,Journal}.jsx`; `src/perfil/bloques.js`; `src/components/perfil/Perfil.jsx`; `src/copy/{index,diagnostico}.js`; `scripts/{comprobar-ios.mjs,lint-copy.js,lint-contraste.js}`; `eslint.config.js`; `package.json`, `package-lock.json`, `Package.swift`, `Package.resolved`; las listas de las pruebas de separación, perfil, claves y `appIos`; `CLAUDE.md`.

## 8. Las pruebas, con los textos exactos

Los precios salen de la tienda y con sus decimales: lo normal es **$799.00**, **$89.00** y **$1,499.00**. Las fechas: «30 de noviembre de 2026». Donde pone {fecha}, lo escribe la app.

**Bloque P** (con diagnóstico)

- **P1.** Tu perfil, justo antes de «Tu cuenta», bloque **«Suscripción»**: «En prueba, hasta el {hoy + 6 días}» · «Ver opciones» · «Restaurar compras». En Hoy, ningún contador.
- **P2.** «Strivo, completo» / «Un lugar tuyo para empezar y cerrar el día. Sin anuncios, sin distracciones, sin nadie mirando.» / «Anual» (elegido) «$799.00 al año» / «Mensual» «$89.00 al mes» / «La suscripción se renueva sola al final de cada periodo. Puedes cancelarla cuando quieras en los ajustes de tu teléfono, hasta 24 horas antes de que se renueve.» / «Continuar» / «Restaurar compras» / «Términos» / «Privacidad» (si existe la URL, D17) / «Cerrar».
  - Sin planes o sin red, en lugar de las tarjetas: «Ahora no pudimos traer los planes. Inténtalo de nuevo en un momento.» y «Intentar de nuevo».
- **P3.** «Simular día 6», cerrar y abrir. En Hoy: «Tu prueba termina mañana» / «Lo que escribiste se queda contigo pase lo que pase.» / «Ver opciones» / «Ahora no». Al volver a abrir, ya no está. El bloque sigue diciendo «En prueba, hasta el {hoy simulado + 1}».
- **P4.** «Simular día 8», cerrar y abrir. Tras el video, el muro de P2 con **«Ahora no»** en lugar de «Cerrar». Después:
  - Hoy: «Puedes leer todo lo que escribiste. Para seguir escribiendo, elige un plan.» y «Ver opciones»; debajo, lo escrito con sus preguntas.
  - Journal: la lista; una entrada se abre entera para leer, con el mismo aviso; el botón de nueva entrada abre el muro.
  - Historial, Respiración (con sonido) y «Llevarme lo que escribí»: como siempre. Suscripción: «Sin suscripción».
- **P5.** Modo avión: igual que P4. En el muro, si se abre, los planes pueden venir de la caché o salir `sinPlanes`. «Volver al día de hoy» y cerrar y abrir.

**Bloque C** (sandbox)

- **C1.** Muro → Mensual → «Continuar» → hoja de Apple con [Sandbox] → «Gracias. Todo tuyo.» dos segundos. Tu perfil: «Mensual. Se renueva el {fecha}.» (en sandbox, hoy mismo), «Gestionar suscripción» y «Restaurar compras».
- **C2.** Cerrar la hoja: el muro igual, sin mensaje. Si falla de verdad: «No se completó la compra. Puedes intentarlo de nuevo cuando quieras.»
- **C3.** Crear cuenta: sigue «Mensual. Se renueva el {fecha}.».
- **C4.** Instalación nueva, día 8, «Restaurar compras»: «Tu suscripción está de vuelta.». **Puede que ni llegues a tocarlo:** si el Mensual renueva en ese momento, el plan vuelve solo. También es correcto; anótalo.
- **C5.** Segunda cuenta de sandbox: «No encontramos compras anteriores con esta cuenta de Apple.» Sin red: «No pudimos revisar tus compras. Inténtalo de nuevo con conexión.»
- **C6.** «Gestionar suscripción» abre la pantalla de suscripciones de Apple, **con tus suscripciones reales**: el Mensual de sandbox no estará ahí (D8). Volver: Strivo donde estaba.
- **C7.** Cancelar el Mensual en **Ajustes → Desarrollador → Cuenta de Apple de sandbox → Gestionar → Suscripciones** (los nombres pueden variar un poco). Strivo, al cerrarla y abrirla pasados 5 minutos (caché): «Mensual. Termina el {fecha}.». Vencido, cerrar y abrir: si todavía dice «Mensual», espera otros 5 minutos. Después, el muro con «Ahora no» y la lectura (con «Simular día 8» puesto). Con 5 minutos por mes, la ventana de «Termina» es corta: si no la ves, en la cuenta de sandbox sube la duración de la renovación antes de empezar.
- **C8.** Metadata `{ "mostrar": true, "hasta": "{mañana, AAAA-MM-DD}" }`, esperar 5 minutos o «Refrescar»: en el muro, «Miembro fundador» / «Un solo pago, para siempre. Solo durante el lanzamiento.» / «$1,499.00, una vez». Comprarla: «Gracias. Todo tuyo.»; Tu perfil «Miembro fundador. Para siempre.», sin «Ver opciones», así que el muro ya no se abre: la tarjeta que no sale se lee en el panel («Fundador: no sale»). Con `hasta` de ayer, otra cuenta de sandbox y 5 minutos: sin tarjeta.
- **C9.** Con suscripción y `mostrar: true`: no hay «Ver opciones»; el panel dice «Fundador: no sale».
- **C10.** Con el Mensual de C3 **ya vencido o recién comprado** (§4). Cerrar sesión: onboarding nuevo; Tu perfil «En prueba, hasta el {fecha}». Entrar con la otra cuenta: su propio estado, nunca «Mensual», sin «Restaurar compras». Si aparece «Mensual» tras una renovación, anota la hora: es el riesgo del §4.

**Bloque K**

- **K1.** Strivo en segundo plano. **Ajustes → Desarrollador → Cuenta de Apple de sandbox → Gestionar o «Initiate Transaction» → Offer Codes**, escribir el código de sandbox y confirmar. Volver y esperar hasta 30 segundos: «Anual. Se renueva el {fecha}.».
- **K2.** Igual con «Simular día 8» y «Ahora no»: desaparece el aviso y se puede escribir.

**Bloque W.** W1: se escribe como hoy, sin bloque «Suscripción» y sin muro.

**Bloque R**

- **R1.** Borrar la cuenta: los textos de SPEC_24 sin cambios, incluida la despedida. Instalación nueva y «Restaurar compras»: «Tu suscripción está de vuelta.» (con el Mensual vigente).
- **R2.** Cerrar sesión y volver: los días vuelven. El aviso de confirmación no cambia.
- **R3.** «La 25 limpia»: sin panel. P2 y C1 iguales.

**Bloque H** (25B)

- **H1.** «Tengo un código» → «Tu código» / «Escríbelo aquí» / «Te llevamos al App Store para aplicarlo. Vuelve a Strivo cuando termines.» / «Continuar» / «Cancelar». Con el campo vacío, «Continuar» devuelve el foco al campo.
- **H2.** Pasa a producción (Anexo D): «Listo. Tu código quedó aplicado.» y «Anual. Se renueva el {fecha}.».
- **H3.** Clave inventada: el App Store dice que no vale. Al volver, a los 10 s: «Todavía no vemos tu código aquí. Si ya lo aplicaste en el App Store, toca Restaurar compras.» con «Restaurar compras».

**El panel de diagnóstico**, al final del bloque: «Diagnóstico de la suscripción» / «Ocultar diagnóstico» · «Estado: {estado} · hasta {fecha}» · «RevenueCat: {anónimo · cuenta} · …{6}» · «completo: {activo · no} · {producto}» · «Planes: {n} paquetes · Fundador: {sale · no sale}» · «Inicio de la prueba: {fecha}» · «Eventos: {lista}» · «Simular día 6» · «Simular día 8» · «Volver al día de hoy» · «Olvidar la tarjeta del día 6» · «Refrescar».

## 9. Lo que no pude comprobar

- Nada contra tu proyecto de RevenueCat: sin clave, ni productos, ni compras, ni `metadata` reales.
- Las rutas de la cuenta de sandbox en tu versión de iOS: las páginas técnicas de Apple no dejaron leer su contenido.
- Que un canje de fuera llegue solo (K1, K2) y qué pasa al unir identidades con una compra viva (C3, C4, C10).

Fuentes: [ayuda de Apple sobre códigos](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-subscription-offer-codes) · [RevenueCat, códigos](https://www.revenuecat.com/docs/subscription-guidance/subscription-offers/ios-subscription-offers) · [identidad](https://www.revenuecat.com/docs/customers/identifying-customers) · [restauración](https://www.revenuecat.com/docs/projects/restore-behavior) · [metadata](https://www.revenuecat.com/docs/tools/offering-metadata) · [privacidad](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy) · [WWDC24, ofertas](https://developer.apple.com/videos/play/wwdc2024/10110/) · código de `purchases-capacitor` 13.8.0–14.1.2 y `purchases-ios` 5.103.1.

**Espero tu aprobación. No cambio código antes.**
