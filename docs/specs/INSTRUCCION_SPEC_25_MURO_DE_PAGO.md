# INSTRUCCIÓN SPEC_25 — Cobrar (25A) y «Tengo un código» (25B)

**Para:** Claude Code
**Fecha:** 24 nov 2026 · **Versión:** 1.1 (con el reporte previo aprobado; §9 manda)
**Rama de partida:** `strivo` en `f4c4653`, la fusión de SPEC_24. Compruébalo en §0.
**Gobierna:** esta instrucción + `docs/specs/SPEC_25_MURO_DE_PAGO.md` (con la nota final de SPEC_24) + `docs/specs/ADENDA_SPEC_25_REVENUECAT_24-11-2026.md` + `docs/specs/INSTRUCCION_SPEC_24_EXPORTAR_Y_BORRAR_CUENTA.md` (§1.1, §9 y §10) + `SPEC_00B` + `CLAUDE.md`. **Donde esta instrucción y otra difieran, manda esta.** En particular, **corrige varias partes de SPEC_25**, que se escribió en septiembre, antes de la app de iPhone, de SQLite, de Tu perfil con bloques, de SPEC_24 y de la configuración real de RevenueCat (ver §2.4).

**Cómo se reparte SPEC_25.** Dos entregas, un solo reporte previo, dos fusiones:

| Entrega | Qué es | Cuándo se fusiona |
|---|---|---|
| **25A · Cobrar** | Todo lo que Apple tiene que ver para aprobar la app: la prueba de 7 días, el muro de pago, el modo lectura, el Fundador, «Restaurar compras», «Gestionar suscripción», el bloque «Suscripción» de Tu perfil, y que la app reconozca un código canjeado **fuera** de ella (el enlace de una aliada) al volver a primer plano | En cuanto pasen sus pruebas (bloques P, C, K, W y R), sin esperar a 25B |
| **25B · «Tengo un código»** | La hoja propia de Strivo para escribir una clave dentro de la app (camino B de SPEC_25 §3.6) | Cuando pase su bloque H. Puede llegar antes del 10 de diciembre o en la 1.0.1: las claves personalizadas como `ALEJANDRA10` no existen hasta que Apple apruebe la app, y la campaña ya funciona con el enlace desde 25A |

**Orden de trabajo:** 25A → 25B. **25B no frena el envío de la 1.0 a revisión.**

**Por qué ahora:** la meta es la App Store el **10 de diciembre de 2026**. Hay que dejar días para la revisión de Apple, así que 25A tiene que estar fusionada y probada en sandbox a principios de diciembre. **Calendario orientativo:** reporte previo el 25–26 nov; 25A el 27–30 nov; pruebas en sandbox el 30 nov–2 dic; fusión y build de envío el 3–5 dic.

**No hay otro trabajo en paralelo.** Si todavía existe el worktree `~/Developer/strivo-24` o la rama local `revision-24` (SPEC_24, ya fusionada), **no los borres**: solo repórtalo.

---

## 0. Antes de escribir una sola línea

1. Lee `CLAUDE.md` **del repo** (no una copia): §5, §6, §9, §11 («Dónde vive cada regla»), §14, y en §13: «Llevarme lo que escribí y borrar mi cuenta (SPEC_24)» (sobre todo «Para SPEC_25»), «App iOS (SPEC_21.1)» con **«Lo que no se toca nunca»**, «Google y Apple en la app de iPhone (SPEC_21.2)» (el `{ plugin }`), «Los recordatorios llegan en el iPhone (SPEC_22)» (el patrón de un solo importador bajo demanda y `SOLO_EN_IPHONE`), «Lo escrito en el iPhone, en SQLite (SPEC_17B)», «Sesión real (SPEC_19.1)», «Cuenta existente en P7 (SPEC_19.2)», «La ventana de edición de 72 horas», «Deuda consciente». Lee `SPEC_25` entera con su nota de SPEC_24, la adenda de RevenueCat entera y esta instrucción entera.
2. Comprueba que HEAD de `strivo` es `f4c4653` o lo contiene (`git merge-base --is-ancestor f4c4653 HEAD`). Si no, **para**.
3. `git worktree list` y `git branch --list 'revision-*'`. Reporta lo que hay. No borres nada.
4. Monta tu worktree según §8 (pasos 1 y 2) **antes** de investigar: el reporte previo pide compilar en el simulador.
5. Inspecciona:
   - **Sesión e identidad:** `src/lib/sesion.js` (`resolverSesion`, `prepararArbol`), `src/lib/useSesion.js`, `src/components/ArranqueProvisional.jsx` (`pasarACuenta`, `salir`, el montaje de la despedida), `src/lib/entradaCuenta.js` (`entrarACuenta`, `arbolDeEntrada`), `src/lib/cuenta.js`, `src/lib/salidaCuenta.js` (`salirDeCuenta`), `src/lib/borrarCuenta.js` (**el sitio marcado para `Purchases.logOut()`** en la fase `telefono`), `src/lib/limpiezaDelTelefono.js` (`vaciarTelefono`), `src/lib/db/clavesDelTelefono.js` (`FAMILIAS`).
   - **El modelo y la fusión:** `src/lib/db/schema.js` (`FIELDS.profile`, `FIELDS.onboarding`, `assertFields`), `src/lib/db/shared.js`, `src/lib/db/conflictos.js` (`hechosQueFaltan`, `esSemilla`, `ganaOrigenAlMudar`), `src/lib/db/restaurar.js`.
   - **El onboarding:** `src/onboarding/estado.js`, `src/onboarding/escritura.js`, el hook del recorrido y `terminar()` (donde se escribe `completedAt`), `src/onboarding/pasos.js`.
   - **Dónde se escribe lo de la persona:** `src/diario/ventanaEdicion.js`, `useDiario` (`editable`, `programar`, los guardados de toque), `src/pages/diario/Hoy.jsx`, `SelectorDia`, las vistas de consulta, `src/pages/diario/Journal.jsx` y el editor del journal, `src/lib/db/diario.js` (las escrituras del journal), `src/diario/pin.js` y `components/diario/PuertaDelJournal.jsx`.
   - **Tu perfil:** `src/perfil/bloques.js` (`BLOQUES`, `SOLO_EN_IPHONE`, `visibles`) y su prueba; `src/components/perfil/Perfil.jsx`, `Bloque.jsx`, `TuCuenta.jsx`, `TusDatos.jsx`, `CapaDeBorrado.jsx` (cómo abre `https://apps.apple.com/account/subscriptions` con `window.open`); `src/components/shared/Confirmacion.jsx`, `unaVez.js`.
   - **Copy:** `src/copy/index.js` (incluidos los espacios huérfanos `profile` y `paywall` que nombra CLAUDE.md), `src/copy/diagnostico.js`, `scripts/lint-copy.js`, `scripts/lint-contraste.js`, `src/tokens/design-tokens.json` (el token `acento` que pide SPEC_25 §5: **REPORTA** si existe y con qué nombre).
   - **iPhone:** `src/lib/plataforma.js` (`esNativa`, `esIPhone`), `src/lib/avisosNativos.js` y `src/lib/credencialNativa.js` (el patrón `{ plugin }` bajo demanda), `capacitor.config.json`, `ios/App/App/Info.plist`, `ios/App/App/App.entitlements`, `ios/App/CapApp-SPM/Package.swift` y `Package.resolved`, `src/lib/__tests__/appIos.test.js`, `src/lib/__tests__/dobleDeCapacitor.js`, las pruebas que recorren `src/` buscando importadores únicos.
   - **El arranque y el umbral:** `src/App.jsx`, `Entrada`, `src/lib/umbralSesion.js` (para que el muro del día 8 no se monte encima del umbral ni del onboarding).
6. **Lee el código del plugin antes de proponer.** En una carpeta aparte, con `npm pack`, la última versión estable de `@revenuecat/purchases-capacitor` compatible con Capacitor 8 y por SPM (RevenueCat pide 12.0.3 o más para Capacitor 8; hay 13.x): compárala con la anterior por mantenimiento reciente, como en SPEC_22. **No instales nada en `revision-25` hasta la aprobación.** Del código, **REPORTA**:
   - Que se integra por **SPM** sin CocoaPods, qué añade a `CapApp-SPM/Package.swift` y qué SDK nativos resuelve (`RevenueCat`, `PurchasesHybridCommon`, versiones).
   - Si trae **implementación web** (Web Billing) y cómo te aseguras de que la web no la descarga nunca.
   - Si el objeto `Purchases` es un **Proxy de Capacitor** (la trampa del `then` de SPEC_21.2) y cómo lo envuelves en `{ plugin }` con import dinámico. Hay un caso conocido en su foro de `configure()` que no resuelve nunca con import dinámico bajo SPM: **compruébalo en el simulador** antes de proponer el patrón.
   - Las firmas exactas de: `configure`, `logIn`, `logOut` (qué pasa si se llama con un usuario anónimo), `getCustomerInfo`, `addCustomerInfoUpdateListener`, `getOfferings` (cómo llegan `current`, `all`, `annual`, `monthly`, `lifetime` y el **`metadata`** de un offering), `purchasePackage` (qué devuelve al cancelar), `restorePurchases`, `syncPurchases`, `showManageSubscriptions`, `isAnonymous`/`appUserID`.
   - Con StoreKit 2, **si una compra o un canje hecho fuera de la app llega solo por el oyente de `customerInfo`** al volver a primer plano, o si hace falta `syncPurchases()` (DP-25.18).
   - El **manifiesto de privacidad** (`PrivacyInfo.xcprivacy`) que trae el SDK: qué tipos de datos declara y con qué fines. La fundadora lo necesita para la ficha de privacidad de la App Store.
   - Si hace falta añadir la capacidad «In-App Purchase» en el proyecto de Xcode, y si sí, cómo se hace **editando el texto** de `project.pbxproj`, sin el Team.
7. Entrega un **reporte previo** con todos los puntos marcados **REPORTA**, la lista de archivos que vas a crear o tocar, la tabla de estados (§1.2, DP-25.13 y DP-25.14) con lo que se ve en Hoy, el Journal, Respiración y Tu perfil en cada uno, y **los textos exactos que la fundadora verá en pantalla** en cada prueba manual del §5.2.
8. **Espera la aprobación de la fundadora.** No cambies código antes.

---

## 1. Decisiones

### 1.1 Ya tomadas, no se reabren

| Origen | Decisión |
|---|---|
| **DP-25.1** (fundadora, 24 nov) | **En modo lectura, Respiración funciona completa**: patrones, sonidos, favoritos, recientes. |
| **DP-25.2** | **La prueba la gestiona la app**, sin tarjeta y sin oferta introductoria de Apple. Los productos ya se crearon así. |
| **DP-25.3** | **Sin SDK de analítica.** |
| **DP-25.4** (fundadora, 24 nov) | **El Fundador se ofrece del 10 de diciembre de 2026 al 15 de enero de 2027, sin tope de personas.** La ventana vive en el panel de RevenueCat, no en el código (DP-25.15): la tarjeta desaparece sola al pasar la fecha y la fundadora puede alargarla o cerrarla sin publicar versión. |
| **DP-25.5** (confirmado en App Store Connect el 24 nov) | **$89 MXN mensual, $799 MXN anual, $1,499 MXN Fundador.** México como país base. **Ningún precio se escribe en el código ni en el copy**: todo precio en pantalla es el `priceString` que devuelve la tienda. |
| **DP-25.6** (fundadora, 24 nov) | La rebaja de las aliadas es **el primer año del Anual al punto de precio de Apple más cercano a $719, y después $799**. Se configura en App Store Connect. **No toca el código.** |
| **DP-25.7** (fundadora, 24 nov) | **La clave de las aliadas solo aplica al Anual** (`strivo_anual`). |
| **DP-25.8** | Una sola oferta con una clave personalizada por aliada; los canjes se leen en App Store Connect, no en RevenueCat. |
| **DP-25.9** (fundadora, 24 nov) | **El Fundador no acepta claves.** |
| **DP-25.10** | **No se usa la hoja nativa de canje de Apple** (`presentCodeRedemptionSheet`) en la 1.0. |
| **DP-25.11** (fundadora, 24 nov, **nueva**) | **Sin cuenta también se prueba y se paga.** Strivo funciona entera sin cuenta, y Apple rechaza apps que obligan a registrarse para comprar algo que no depende de una cuenta (Guideline 5.1.1). La prueba empieza al terminar el onboarding; la compra queda ligada al Apple ID; si la persona crea una cuenta o entra a una, la compra se une a esa cuenta. Se acepta que quien no tiene cuenta y reinstala vuelva a tener 7 días. **Esto corrige** «al crear la cuenta», «el paywall solo existe con sesión» y «nunca anónimo» de SPEC_25. Cómo, en DP-25.13 y DP-25.19. |
| Adenda RevenueCat | **Los paquetes son los tipos estándar**: se leen como `offering.annual`, `offering.monthly` y `offering.lifetime`. **El Fundador sale solo del offering `fundador`**, nunca de `default` (allí hay un `$rc_lifetime` de Test Store que en el iPhone no aparece). **El derecho que se consulta es solo `entitlements.completo`**: `strivo_pro` y Test Store son restos y no se tocan. |
| Adenda RevenueCat | **Si en sandbox los offerings llegan vacíos**, lo primero es el estado de los productos en App Store Connect («Listo para enviar»), no el código. La pantalla tiene que portarse bien con offerings vacíos (DP-25.20). |
| SPEC_25 §2 | **Fuera:** Stripe, precios por país a mano, enlaces externos de pago, Android, funciones «premium», cualquier lógica propia de descuentos (Strivo no guarda, no valida, no cuenta ni calcula claves). |
| SPEC_25 §6.4 | **La llave .p8 nunca entra al repo.** La clave **pública** de RevenueCat para iOS sí va en el cliente (es su diseño). |
| SPEC_24 §10 | **`Purchases.logOut()`** va en la fase `telefono` de `borrarCuenta.js`, en el sitio marcado, y en `salirDeCuenta` (DP-25.19). |
| DP-21.3 / DP-21.8 / DP-17B.2 | **El identificador, el esquema y host del WebView y la base SQLite no se tocan.** Nada de `server`, `scheme`, `hostname` ni `allowNavigation`. |
| SPEC_21.2 | **Ningún objeto de plugin sale suelto de una promesa**: `{ plugin }`. |
| SPEC_22, DP-22.13 | **`esIPhone()` es la única pregunta por la plataforma** para todo lo de compras. |
| SPEC_22 | **Dependencias nuevas en versión exacta, un solo archivo de `src/` importa cada una, bajo demanda**, con la prueba que recorre `src/`. Nada del plugin en el chunk principal de la web. **No se instala `@revenuecat/purchases-capacitor-ui`**: el muro es nuestro. |
| `TuCuenta.jsx`, «Nada bloquea» | **Ningún control lleva `disabled`, `required` ni `aria-invalid`.** Esto **corrige** el «Continuar queda inhabilitado con el campo vacío» de SPEC_25 §5 (ver DP-25.22). |
| RN-VOZ / CLAUDE.md §3 | **Todo texto vive en `src/copy/` y pasa `lint:copy`.** Sin exclamaciones. Además, la lista prohibida de SPEC_25 §4: «oferta», «descuento», «ahorra», «solo hoy», porcentajes, tachados, «más popular», «mejor valor». Los textos de SPEC_25 §4 son definitivos; los nuevos de §6 son propuesta y los aprueba la fundadora con el reporte previo. |
| RN-07 | **Nada de lo escrito ni ningún dato identificable va a ningún sitio** por las compras. RevenueCat recibe el `uid` de Firebase como identificador y nada más: ni nombre, ni correo, ni atributos (`setAttributes`, `setEmail`, `setDisplayName`: **no se llaman**). |
| SPEC_17B / SPEC_22 / SPEC_23 / SPEC_24 | **Pruebas manuales solo con lo que se ve.** Sin consola de Safari, sin Inspector web y sin la consola de Xcode. Lo que haga falta medir se pinta en un build de diagnóstico (DP-25.21). El panel de RevenueCat y App Store Connect en el navegador sí valen: son pantallas. |
| SPEC_17B | **Tras borrar la app, la primera apertura de una compilación de Xcode necesita internet.** |
| SPEC_21.1 | **El Team de firma no se comitea nunca.** Commits por ruta, nunca `git add -A`, `git add .` ni `git commit -a`. No aceptes «Update to recommended settings». |
| Instrucciones del proyecto | **Formia** (`formia-paused`) no se toca ni se consulta. **DP-21.5** no se decide aquí (DP-25.12 solo propone qué hace la web mientras siga abierta). |

### 1.2 Nuevas, para confirmar en el reporte previo — 25A

| DP | Propuesta |
|---|---|
| **DP-25.12 · La web mientras DP-21.5 siga abierta** | SPEC_25 decía: en la PWA, `prueba` indefinida para `perfil.tester: true` y `lectura` para cualquier otra cuenta. Con DP-25.11 eso dejaría a **cualquiera** que use la PWA pública sin poder escribir y sin forma de pagar. **Propuesta: hasta que se decida DP-21.5, la web se porta como hoy** —sin muro, sin modo lectura, sin bloque de suscripción—, con la regla en **un solo sitio** del estado (por ejemplo, `estado: 'web'` que `puedeEscribir()` trata como libre). Cuando la fundadora decida DP-21.5, se cambia ahí. **Decide la fundadora.** |
| **DP-25.13 · `fechaInicioPrueba`** | SPEC_20, que iba a crearla, se cerró sin construirla: **la crea esta SPEC** (REPORTA si existe algo parecido). **Dónde:** un campo nuevo en `shared/profile` (ampliar `FIELDS.profile` es una decisión, RN-DB-03), ISO 8601 en UTC. **Cuándo:** (a) al terminar el onboarding, en el mismo `terminar()` que escribe `completedAt`; (b) **a quien ya terminó el onboarding antes de esta versión** (la fundadora y las testers), en la primera apertura de la versión nueva, con la fecha de ese momento. **Sin cuenta** se queda en el teléfono y en la cola, como todo; **con cuenta** sube y baja con el perfil. **Al mudar o restaurar** no se pierde ni se reinicia: entra en `hechosQueFaltan` y, si los dos lados la traen, **gana la más antigua**. **REPORTA** cómo lo encajas en `conflictos.js` sin copiar reglas, y qué pasa con una cuenta que ya existía y entra en un teléfono con otra prueba en curso. **El día 8** se calcula en zona local del dispositivo (SPEC_25 §6.4); reloj manipulado, sin defensa. |
| **DP-25.14 · Qué cierra el modo lectura y qué no** | **Cierra** escribir y editar la mañana, la noche y el journal. **No cierra**: leer cualquier cosa (Hoy en consulta, Historial, Journal con su PIN), **Respiración entera** (DP-25.1), **Tu perfil** (nombre, género, horarios, recordatorios, frases, cuenta), **exportar** y **borrar la cuenta** (SPEC_24), **borrar una entrada del journal** (lo escrito es de la persona), el onboarding, la restauración, la mudanza y la cola. **Cómo:** el día ya tiene un guardián único, `useDiario` con `editable`; en lectura, `editable` es falso y el día se pinta **con la misma consulta que un día fuera de la ventana de 72 h**, más el aviso `lectura` y su «Ver opciones». En el journal, «Escribir» y editar abren el muro. `puedeEscribir()` vive en un solo sitio y lo consultan `useDiario` y el journal; **la capa de datos (`local.js`) no se toca**: si se cerrara ahí, se cerrarían también las siembras, la bajada, la mudanza y Respiración. **Lo pendiente que ya estaba tecleado sí se vuelca** aunque la prueba venza a media frase (la misma regla que la ventana de 72 h). **REPORTA** la tabla estado × pantalla. |
| **DP-25.15 · Prender y apagar el Fundador** | `fundador` no puede ser el offering actual. **Propuesta: el `metadata` del offering `fundador` en RevenueCat**, `{ "mostrar": true, "hasta": "2027-01-15" }`. La tarjeta sale solo si `mostrar` es `true`, la fecha local de hoy es igual o anterior a `hasta`, el paquete `lifetime` trae producto, y la persona no tiene derecho activo ni el Fundador. Metadata ausente, mal escrita o sin producto: **no hay tarjeta**, sin error. La decisión es una función pura (`mostrarFundador`). **REPORTA** cómo expone el SDK el `metadata` y el JSON exacto que la fundadora pega en el panel. |
| **DP-25.16 · El bloque en Tu perfil** | La app no tiene «Ajustes»: tiene Tu perfil. **Un bloque nuevo, `suscripcion`, título «Suscripción»**, **solo en la app de iPhone** (`SOLO_EN_IPHONE`), **justo antes de `cuenta`**. Dentro, lo de SPEC_25 §3.4: el estado, «Gestionar suscripción» (con suscripción), «Restaurar compras» (siempre), «Ver opciones» (sin suscripción ni Fundador) y, desde 25B, «Tengo un código». Un identificador en `bloques.js`, un texto y un componente, como pide su prueba. **REPORTA** si los espacios huérfanos `profile` y `paywall` del copy se reutilizan o se retiran. |
| **DP-25.17 · Cuándo aparece el muro solo** | **Día 8 o después**, sin derecho: **una vez por sesión**, al llegar a las secciones, **después** del umbral y nunca encima del onboarding, de la despedida ni de la capa de borrado. Con «Ahora no» se queda en lectura hasta la siguiente sesión. **Durante la prueba** solo se abre desde Tu perfil («Ver opciones») y se cierra con «Cerrar». **La tarjeta del día 6** (`prueba.*`) sale una sola vez en este teléfono, en Hoy, y su marca vive en `clavesDelTelefono.js` (familia nueva o existente: REPORTA). Con cuenta y en otro teléfono podría volver a salir una vez: se acepta. |
| **DP-25.18 · Al volver a primer plano** | SPEC_25 pide `syncPurchases()` y después `refrescar()` cada vez. **Propuesta, según lo que leas en el SDK (§0.6):** siempre `refrescar()` (`getCustomerInfo`) y el oyente de `customerInfo` desde el arranque; **`syncPurchases()` solo** al volver de un canje que la propia app abrió (25B), y si el SDK con StoreKit 2 **no** detecta solo un canje hecho fuera de la app, también al volver a primer plano con una marca de tiempo que lo limite (por ejemplo, una vez cada 10 minutos). Motivo: con el comportamiento de restauración «Transferir» de RevenueCat, sincronizar en cada vuelta movería las compras entre dos cuentas de Strivo con el mismo Apple ID una y otra vez. **REPORTA** lo leído y la propuesta final. |
| **DP-25.19 · La identidad en RevenueCat** | En el iPhone, **al arrancar**, `configure({ apiKey })` **sin** `appUserID`: cliente anónimo. **Con la sesión `conCuenta`**, `logIn(uid)` (idempotente; también tras `pasarACuenta` y `entrarACuenta`). **Al cerrar sesión** (`salirDeCuenta`) y **al borrar la cuenta** (`borrarCuenta.js`, fase `telefono`), `logOut()` **solo si el cliente no es anónimo** (si no, el SDK da error). Con `vencida`, no se toca nada. Lo pagado sigue ligado al Apple ID y vuelve con «Restaurar compras», que es lo que ya dice la pantalla de borrado. **REPORTA** la tabla de alias de RevenueCat aplicada a los casos de Strivo: compra sin cuenta y después cuenta nueva; compra sin cuenta y después entrar a una cuenta que ya tenía alias; cerrar sesión con suscripción; dos cuentas de Strivo con el mismo Apple ID. Y **qué ve la persona** en cada caso. Borrar el cliente de RevenueCat al borrar la cuenta pide su llave secreta, que no puede ir en la app: **fuera de alcance**, se documenta para el aviso de privacidad (A9). |
| **DP-25.20 · Lo que puede fallar en el muro** | **Offerings vacíos o sin red:** el muro se pinta con su título, su texto, «Restaurar compras» y el aviso `sinPlanes` con «Intentar de nuevo», sin tarjetas y sin precios inventados. **Compra cancelada:** nada (SPEC_25 §3.3). **Compra con error:** `errorCompra`. **Restaurar con error:** `errorRestaurar`. **Sin red y sin caché de `customerInfo`:** SPEC_25 §3.5 (sin derecho, **nada se borra**). Ningún error muestra un código (RN-EST-04). **«Continuar» y «Restaurar compras» pasan de uno en uno** (`unaVezCon`), sin `disabled`. |
| **DP-25.21 · Build de diagnóstico** | Con `VITE_DIAG_SUSCRIPCION=1`, un panel plegable al final del bloque «Suscripción»: el estado y su «hasta»; si el cliente de RevenueCat es anónimo o de cuenta (los últimos 6 caracteres, nunca el id entero); `completo` activo o no, y por qué producto; si llegaron offerings y cuántos paquetes; el metadata del Fundador y si la tarjeta sale; `fechaInicioPrueba`; y los **cuatro eventos** de SPEC_25 §6.4 (`paywall_visto`, `compra_iniciada`, `compra_ok`, `compra_cancelada`) de esta sesión, **solo en memoria** (esto **corrige** el «log local» de SPEC_25: RN-07 y nada que borrar después). Controles: **«Simular día 6»**, **«Simular día 8»** y **«Volver al día de hoy»** (un desfase en memoria que solo lee el cálculo del estado; **no escribe nada**), **«Olvidar la tarjeta del día 6»** y **«Refrescar»**. Textos en `src/copy/diagnostico.js` bajo su clave, la prueba que construye sin la bandera y no los encuentra en `dist/`, y la que comprueba que no arrastra los de las otras banderas. **Sin la bandera, la app se porta exactamente igual.** Se combina con `VITE_DIAG_ALMACEN=1` y `VITE_DIAG_BORRADO=1`. |
| **DP-25.23 · Lo que Apple pide ver en el muro** (Guideline 3.1.2) | Precio y periodo de cada plan (de la tienda), que **la suscripción se renueva sola** y cómo cancelarla, y enlaces que funcionen a **Términos** y **Privacidad**. El copy de SPEC_25 no dice lo de la renovación: **texto nuevo `paywall.renovacion`** (§6, propuesta). **Términos:** el EULA estándar de Apple (`https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`) salvo que la fundadora dé otro. **Privacidad:** la URL del aviso de privacidad (tarea A9). Las dos URL en **una sola constante**; **REPORTA** si la de privacidad todavía no existe (no bloquea el código, sí el envío a revisión). Se abren como el enlace de SPEC_24, sin `allowNavigation`. |

### 1.3 Nuevas, para confirmar en el reporte previo — 25B

| DP | Propuesta |
|---|---|
| **DP-25.22 · La hoja «Tengo un código»** | La de SPEC_25 §3.6 y §5, con la hoja existente: campo con etiqueta accesible, `autocapitalize="characters"`, `autocorrect="off"`, `spellcheck={false}`, teclado normal; `codigo.aviso`; «Continuar» y «Cancelar». **«Continuar» no se deshabilita**: con el campo vacío, tocarlo devuelve el foco al campo y no pasa nada más (no hay texto de error para eso, y no hace falta). Se abre desde el muro (después de «Restaurar compras», antes de «Términos») y desde el bloque «Suscripción». |
| **DP-25.24 · El enlace** | `urlDeCanje(clave)`, pura, en un solo sitio: recorta los espacios, pasa a mayúsculas, rechaza la clave vacía y arma `https://apps.apple.com/redeem?ctx=offercodes&id=6836996054&code=<CLAVE>` con `encodeURIComponent`. El ID de la app vive en una constante. Se abre fuera de la app como el enlace de SPEC_24. **La clave no se guarda en ningún sitio** ni sale a otro lado que la URL. |
| **DP-25.25 · Al volver del App Store** | Solo si la app abrió un canje en esta sesión: `syncPurchases()` y `refrescar()`. Derecho activo → se cierra el muro y aparece `codigo.listo` dos segundos, como `gracias`. Sin derecho → `codigo.noAplicado` con «Restaurar compras». **`codigo.noAplicado` nunca aparece si no hubo un intento.** **REPORTA** cuánto esperas a que Apple confirme antes de decidir (el recibo puede tardar unos segundos). |

Criterio de producto de la fundadora, que manda sobre todo lo anterior: **pagar es fácil y se entiende sin letra pequeña; lo escrito nunca queda tras el muro; quien no paga sigue leyendo, respirando y llevándose lo suyo; y nada en la pantalla presiona.**

---

## 2. Lo que ya está verificado (24 nov 2026)

### 2.1 App Store Connect (19 y 24 nov)

- App **Strivo**, ID de Apple `6836996054`, SKU `strivo-ios`, español de México. Acuerdo de apps de pago firmado.
- Productos: `strivo_mensual` ($89) y `strivo_anual` ($799), suscripciones del grupo `Strivo`; `strivo_fundador` ($1,499), no consumible. Sin oferta introductoria, sin «En familia». **Precio del mensual confirmado en $89 el 24 nov.**
- Los tres en **«Missing Metadata»**: les falta la captura de revisión. Antes de las pruebas en sandbox, la fundadora los deja en «Listo para enviar» (Anexo C).
- Dos cuentas sandbox creadas.

### 2.2 RevenueCat (24 nov, detalle en la adenda)

- Proyecto `Strivo`, app de App Store con `com.hellostrivo.strivo`, llave de compras y llave de la API de App Store Connect válidas.
- Entitlement `completo` con los tres productos. Offering `default` (actual): `$rc_annual` → `strivo_anual`, `$rc_monthly` → `strivo_mensual`. Offering `fundador`: `$rc_lifetime` → `strivo_fundador`.
- Avisos de Apple a RevenueCat puestos a mano (producción y sandbox). Se verifican con la primera compra de prueba.

### 2.3 Lo que Apple impone y conviene saber antes de programar

- **Las claves personalizadas** (`ALEJANDRA10`) solo se pueden crear **cuando la app está aprobada y el producto aprobado**. Antes, solo hay **códigos de sandbox de un solo uso**. Por eso el canje de claves personalizadas se prueba en producción tras la aprobación (Anexo D), y las pruebas K y H usan códigos de sandbox.
- **En sandbox**, un mes dura unos 5 minutos y un año, 1 hora. Las renovaciones se pueden ajustar o cortar desde la cuenta de sandbox del iPhone.
- **RevenueCat registra las compras con código como $0**: el ingreso real de la campaña se lee en App Store Connect.
- **Los códigos no sirven para bajar de plan**: quien ya tiene el Anual no canjea nada; quien tiene el Mensual sí puede pasar al Anual con una clave.

### 2.4 Lo que esta instrucción corrige de SPEC_25

| SPEC_25 decía | Manda ahora | Por qué |
|---|---|---|
| «Requiere: proyecto en RevenueCat — PENDIENTE» y §6.3 «el proyecto todavía no existe» | Existe y está configurado (§2.2 y la adenda) | 24 nov. |
| Dependencia de SPEC_20 (`fechaInicioPrueba`) | La crea esta SPEC (DP-25.13) | SPEC_20 se cerró sin construirla. |
| La prueba empieza «al crear la cuenta» | Al terminar el onboarding, y en la primera apertura para quien ya lo había terminado (DP-25.13) | DP-25.11. |
| «El paywall solo existe con sesión», «Nunca anónimo» | Cliente anónimo al arrancar y `logIn(uid)` con cuenta (DP-25.19) | DP-25.11 y Guideline 5.1.1. |
| «Ajustes → Suscripción» | El bloque «Suscripción» de Tu perfil, solo en el iPhone (DP-25.16) | La app no tiene Ajustes. |
| Paquetes «anual» y «mensual» | `offering.annual`, `offering.monthly`, `offering.lifetime` | Adenda. |
| «`fundador` se prende y apaga desde el panel» | El `metadata` del offering `fundador` con `mostrar` y `hasta` (DP-25.15) | `fundador` no puede ser el actual. |
| `syncPurchases()` en cada vuelta a primer plano | Según el SDK, limitado (DP-25.18) | El comportamiento «Transferir». |
| «Continuar inhabilitado con el campo vacío» | Sin `disabled`; vuelve el foco al campo (DP-25.22) | «Nada bloquea». |
| Un «log local para la fundadora» | Los eventos en el panel de diagnóstico, solo en memoria (DP-25.21) | RN-07. |
| §5: «precio, periodo, renovación automática… Están» | Falta el texto de la renovación: `paywall.renovacion` (DP-25.23) | Guideline 3.1.2. |
| Web: `lectura` para toda cuenta que no sea tester | Como hoy hasta DP-21.5, si la fundadora lo aprueba (DP-25.12) | Sin pago en la web, la PWA quedaría cerrada para todas. |
| «Hoy muestra el día actual sin campos editables» | La consulta de siempre con `editable` falso (DP-25.14) | Una regla, un sitio. |
| Criterio 9: `grep -rn "89\|799\|1499\|MXN\|€" src/` | Una prueba acotada (criterio automático 9 de §5.1) | El grep atrapa números que no son precios y no ve `1,499`. |
| Criterios 11–13 con una «clave de sandbox válida» | Códigos de sandbox de un solo uso; las claves personalizadas, en producción tras la aprobación (Anexo D) | §2.3. |

---

## 3. Alcance

**Entra (25A):** el plugin y su único importador; la identidad (DP-25.19), también en `salirDeCuenta` y `borrarCuenta.js`; `fechaInicioPrueba` (DP-25.13); el estado y su proveedor; el modo lectura (DP-25.14); la tarjeta del día 6; el muro con el Fundador; restaurar; gestionar; el bloque «Suscripción»; el oyente y la vuelta a primer plano (DP-25.18); la web según DP-25.12; el diagnóstico; pruebas; `CLAUDE.md`; esta instrucción y la adenda en `docs/specs/`.

**Entra (25B):** la hoja, `urlDeCanje`, la vuelta del canje, sus textos y sus pruebas.

**No entra:** Android (SPEC_26); Stripe o pago web; webhooks; borrar el cliente de RevenueCat; ofertas promocionales, de recuperación o introductorias; `purchases-capacitor-ui`; cambiar textos existentes (salvo lo que el reporte previo apruebe); DP-21.5; la ficha de la App Store, las capturas y las notas para el revisor (las hace la fundadora); el aviso de privacidad (A9).

---

## 4. Cambios esperados (a confirmar en el reporte previo)

Los nombres los propones tú; esta es la forma, respetando RN-TEC (`lib/` no importa de secciones ni de componentes):

- **`src/lib/compras.js`**: el **único** archivo de `src/` que importa `@revenuecat/purchases-capacitor`, bajo demanda, solo con `esIPhone()`, devolviendo `{ plugin }`. Envuelve las llamadas de §0.6 y traduce cancelaciones y errores a motivos propios.
- **`src/lib/suscripcion/`** (o donde propongas): `estado.js`, **pura**: `estadoDeSuscripcion({ customerInfo, fechaInicioPrueba, ahora, desfaseDias, plataforma })` → `{ estado, hasta, plan, seRenueva }` con el orden de SPEC_25 §6.4 (`fundador` → `activa` → `prueba` → `lectura`, más `cargando` y, si se aprueba, `web`); `fundador.js` (`mostrarFundador`); `puedeEscribir`; el proveedor y su hook (`useSuscripcion`). En 25B, `canje.js` (`urlDeCanje`).
- **`src/lib/db/schema.js`** (`fechaInicioPrueba`), **`src/lib/db/conflictos.js`** (`hechosQueFaltan` y la más antigua), **`src/onboarding/`** (escribirla al terminar) y el arranque (la primera apertura de quien ya terminó).
- **`useDiario`** y el journal: `editable` y la puerta del muro con `puedeEscribir()`.
- **`src/pages/diario/Hoy.jsx`** y **`Journal.jsx`**: la tarjeta del día 6 y el aviso `lectura`.
- **`src/components/suscripcion/`** (carpeta nueva: **REPORTA**, hay una prueba que exige decidir cada carpeta de `components/`): el muro, el «gracias», la tarjeta del día 6 si no cabe en Hoy, y en 25B la hoja del código.
- **`src/perfil/bloques.js`** y el componente del bloque «Suscripción».
- **`src/lib/salidaCuenta.js`** y **`src/lib/borrarCuenta.js`**: `logOut()` según DP-25.19.
- **`src/App.jsx`** / **`ArranqueProvisional.jsx`**: dónde se monta el proveedor y cuándo aparece el muro solo (DP-25.17).
- **`src/copy/index.js`** (§6) y **`src/copy/diagnostico.js`**.
- **`package.json`, `package-lock.json`, `ios/App/CapApp-SPM/Package.swift` y `Package.resolved`**: solo lo del plugin.
- **`capacitor.config.json`** e **`Info.plist`**: sin cambios, salvo que el plugin los pida (**REPORTA**).
- **`.env.local`**: la clave pública de RevenueCat para iOS como `VITE_REVENUECAT_IOS_KEY` (o el nombre que propongas). Sin ella la app arranca igual y el bloque dice que no hay planes. **REPORTA** si prefieres que vaya comiteada (es pública) o fuera de git como el resto.
- **Pruebas nuevas en archivos propios**, con el doble Proxy de `dobleDeCapacitor.js` para el plugin.
- **`CLAUDE.md`**: una sección «Cobrar (SPEC_25)», «Dónde vive cada regla» (el estado, `puedeEscribir`, el Fundador, `compras.js`, `urlDeCanje`), DP-25.11 explicada, la deuda (borrar el cliente de RevenueCat; DP-25.12 ligada a DP-21.5), los recuentos de §13.

**REPORTA, además:**

- **Tamaño** de la app en Release y de los chunks de `npm run build`, antes y después; nada nuevo en el chunk principal de la web.
- **Lo que declara el SDK en su manifiesto de privacidad** (§0.6), en una tabla que la fundadora pueda copiar a la ficha de privacidad.
- **El simulador:** si puedes probar compras en el simulador con un archivo de configuración de StoreKit o contra sandbox, y qué parte de §5.2 deja cubierta.

---

## 5. Criterios de aceptación

### 5.1 Automáticos (Claude Code)

**25A**

1. Los seis comandos de `CLAUDE.md` §12 y `npm run validar:frases` en verde, en los dos proyectos (`indexeddb` y `sqlite`).
2. **El estado**, como función pura: las combinaciones de `customerInfo` (sin derecho, mensual, anual, Fundador, mensual cancelado aún vigente, expirado) por fechas (sin `fechaInicioPrueba`, día 1, día 6, día 7, día 8, día 30), con el desfase del diagnóstico y con la web. **Un derecho activo gana siempre a la prueba.**
3. **`fechaInicioPrueba`**: se escribe al terminar el onboarding; quien ya lo había terminado la recibe en la primera apertura y una sola vez; al restaurar y al mudar no se pierde y gana la más antigua; nunca se reinicia por cerrar sesión y volver a entrar a la misma cuenta.
4. **`puedeEscribir()` y el modo lectura**: en `lectura`, la mañana, la noche y el journal no escriben nada nuevo; lo tecleado antes del vencimiento sí se vuelca; Respiración, Tu perfil, exportar, borrar la cuenta y borrar una entrada del journal funcionan; la siembra, la bajada, la mudanza y la cola no cambian (pruebas de SPEC_17A, 19 y 31 sin tocar lo que comprueban).
5. **El muro**: el plan anual preseleccionado; precios solo de la tienda (con `aria-label` con moneda); el Fundador solo según `mostrarFundador`; «Ahora no» solo tras la prueba y «Cerrar» durante ella; offerings vacíos → `sinPlanes` sin tarjetas; compra cancelada → nada; error → `errorCompra`; ningún control con `disabled`.
6. **`mostrarFundador`**: `mostrar` falso, fecha pasada, metadata ausente o mal escrito, sin producto, con derecho activo o con Fundador → no sale; en el resto, sale. La fecha `hasta` es inclusiva en hora local.
7. **La identidad**: `configure` sin `appUserID` al arrancar en el iPhone; `logIn(uid)` con `conCuenta`; `logOut()` al salir y al borrar, y nunca con un cliente anónimo; con `vencida` no se llama nada.
8. **Restaurar**: con compras → `restaurado`; sin compras → `nadaQueRestaurar`; con error → `errorRestaurar`.
9. **Ningún precio escrito a mano**: una prueba que recorre `src/copy/`, `src/lib/suscripcion/`, `src/lib/compras.js` y `src/components/suscripcion/` y falla si encuentra `$` seguido de cifras, «MXN», «€», `89`, `799`, `1499` o `1,499` fuera de las pruebas.
10. **La lista prohibida de SPEC_25 §4** no aparece en ningún texto nuevo (en `lint:copy` o en una prueba).
11. **El plugin se importa en un solo archivo, bajo demanda**, y nada de él ni del diagnóstico entra en el chunk principal de la web (prueba que recorre `src/` y prueba que construye).
12. **En la web** no se carga el plugin, no hay bloque «Suscripción», y el comportamiento es el de DP-25.12.
13. **Diagnóstico**: sin `VITE_DIAG_SUSCRIPCION`, ni una línea suya en `dist/`; cada bandera no arrastra los textos de las otras; los controles de días no escriben nada en el almacén.
14. **RN-07**: ninguna llamada a `setAttributes`, `setEmail`, `setDisplayName` ni nada que mande al SDK algo distinto del `uid` (prueba que espía el doble).
15. `appIos.test.js` sigue exigiendo identificador, esquema, host y base de fábrica.
16. Ningún commit lleva `DEVELOPMENT_TEAM`, `GoogleService-Info.plist` ni `.env.local`.
17. Las pruebas de SPEC_17A, 17B, 19, 21.1, 21.2, 22, 23, 24, 29, 30 y 31 siguen pasando sin cambiar lo que comprueban (salvo listas de dependencias, de importadores únicos y de banderas de diagnóstico).
18. **Al menos 40 casos nuevos** en 25A (los del diagnóstico no cuentan).

**25B**

19. `urlDeCanje`: mayúsculas, recorte de espacios, `encodeURIComponent`, el `id` es `6836996054`, la clave vacía se rechaza.
20. La hoja: «Continuar» con el campo vacío devuelve el foco y no abre nada; «Cancelar» cierra sin efectos; ningún `disabled`.
21. La vuelta: con un intento en curso y derecho activo → `codigo.listo`; sin derecho → `codigo.noAplicado`; sin intento → ninguno de los dos.
22. **Al menos 12 casos nuevos** en 25B.

### 5.2 Manuales (la fundadora, en su iPhone 17, en sandbox, y en la web)

**Nombres de las builds:**

| Nombre | Carpeta y rama | Cómo se compila |
|---|---|---|
| **«La 25 con diagnóstico»** | `~/Developer/strivo-25`, `revision-25` | `VITE_DIAG_SUSCRIPCION=1 VITE_DIAG_ALMACEN=1 npm run ios:build` |
| **«La 25 limpia»** | la misma | `npm run ios:build` |
| **La web de la 25** | la misma | `npm run dev` y abrir `http://localhost:5173` |

**Antes de empezar:** el Anexo C, hecho. La cuenta de sandbox puesta en el iPhone (Anexo B). Para empezar «sin cuenta y desde cero», **borrar la app** e instalar con internet.

**Bloque P · La prueba y el modo lectura** (con «La 25 con diagnóstico»)
- **P1 · Sin cuenta, recién instalada.** Recorrer el onboarding sin crear cuenta. En Hoy **no hay ningún contador**. Tu perfil → «Suscripción». **Debe verse:** «En prueba, hasta el {hoy + 6 días}» (el día de la instalación es el 1 y el último, el 7; D4), «Ver opciones» y «Restaurar compras».
- **P2 · Ver el muro durante la prueba.** **Antes, iniciar sesión en la cuenta de sandbox de México** (Anexo B): sin ella, los precios salen de otra tienda, en dólares. «Ver opciones». **Debe verse:** «Strivo, completo», el texto, Anual (marcado) y Mensual con **los precios que da el App Store** ($799 y $89), la frase de la renovación, «Continuar», «Restaurar compras», «Términos», «Privacidad» y **«Cerrar»** (no «Ahora no»). Tocar «Términos» y «Privacidad»: se abren y se vuelve a Strivo. «Cerrar».
- **P3 · Día 6.** En el panel: «Simular día 6». Cerrar la app del todo y abrirla. **Debe verse** en Hoy, una vez, la tarjeta «Tu prueba termina mañana». «Ahora no». Cerrar y abrir: **ya no sale.**
- **P4 · Día 8.** En el panel: «Simular día 8». Cerrar y abrir. **Debe verse:** el muro, ahora con **«Ahora no»**. Tocarlo. **Debe verse:** Hoy con lo escrito en modo consulta y el aviso «Puedes leer todo lo que escribiste…» con «Ver opciones»; el Journal se lee, y «Escribir» abre el muro; el Historial se lee entero; **Respiración funciona entera, con sonido**; Tu perfil → «Tus datos» → «Llevarme lo que escribí» funciona.
- **P5 · Lectura sin red.** Modo avión, cerrar y abrir. **Debe verse** lo mismo de P4; nada desapareció. Quitar el modo avión. «Volver al día de hoy» en el panel.

**Bloque C · Comprar** (con «La 25 con diagnóstico», en sandbox)
- **C1 · Mensual sin cuenta.** «Simular día 8» → muro → elegir Mensual → «Continuar» → la hoja de Apple, con «[Sandbox]» y $89 → confirmar. **Debe verse:** «Gracias. Todo tuyo.» dos segundos, se puede escribir, y Tu perfil dice «Mensual. Se renueva el {fecha}.». En el panel de RevenueCat → Customers aparece la compra; en la app de RevenueCat, «Avisos de Apple» deja de decir «No notifications received».
- **C2 · Cancelar la hoja.** Con otra cuenta de sandbox o tras C7: muro → «Continuar» → cerrar la hoja de Apple. **Debe verse:** el muro igual, sin mensaje.
- **C3 · Crear cuenta después de pagar.** Con la compra de C1: Tu perfil → Tu cuenta → «Crear una cuenta» con un correo de prueba (`atreloz.prueba.1+c3@gmail.com`). **Debe verse:** sigue «Mensual». En RevenueCat → Customers, ese cliente tiene ahora el UID de Firebase.
- **C4 · Restaurar en una instalación nueva.** Borrar la app, instalar, saltar el onboarding sin cuenta, «Simular día 8» → muro → «Restaurar compras». **Debe verse:** «Tu suscripción está de vuelta.» y se puede escribir. **Puede que el plan vuelva solo**, sin tocar nada, si el Mensual renueva en ese momento (en sandbox, cada 5 minutos): también es correcto, se anota.
- **C5 · Nada que restaurar.** Con la **segunda** cuenta de sandbox puesta en el iPhone y una instalación nueva: «Restaurar compras». **Debe verse:** «No encontramos compras anteriores con esta cuenta de Apple.»
- **C6 · Gestionar.** Con suscripción: «Gestionar suscripción». **Debe abrirse** la pantalla de suscripciones de Apple, **con las suscripciones reales**: el Mensual de sandbox no estará ahí (D8). Volver: Strivo sigue donde estaba.
- **C7 · Vencer.** Cancelar el Mensual en **Ajustes → Desarrollador → Cuenta de Apple de sandbox → Gestionar → Suscripciones** (los nombres pueden variar). Pasados 5 minutos (caché), cerrar y abrir Strivo. **Debe verse** en Tu perfil «Mensual. Termina el {fecha}.»; la ventana es corta: si no da tiempo, subir antes la duración de la renovación en la cuenta de sandbox. Ya vencido, cerrar y abrir (si todavía dice «Mensual», esperar otros 5 minutos), con «Simular día 8» puesto. **Debe verse:** el muro con «Ahora no» y, tras tocarlo, el modo lectura.
- **C8 · Fundador.** En RevenueCat → offering `fundador` → metadata: el JSON del reporte previo con `mostrar: true` y `hasta` de mañana. Sin compilar nada, con una cuenta de sandbox sin compras: cerrar y abrir → muro. **Debe verse** la tarjeta «Miembro fundador» con $1,499 y «Un solo pago, para siempre. Solo durante el lanzamiento.». Comprarla. **Debe verse:** «Gracias. Todo tuyo.», Tu perfil «Miembro fundador. Para siempre.» y **la tarjeta ya no sale** en el muro. Después, poner `hasta` en la fecha de ayer y comprobar con otra cuenta de sandbox sin compras que **la tarjeta no sale**. Al terminar, dejar `mostrar: false`.
- **C9 · Fundador con suscripción.** Con una suscripción activa y `mostrar: true`: la tarjeta **no sale**.
- **C10 · Cerrar sesión y entrar con otra cuenta.** Con la cuenta de C3 y su Mensual **ya vencido o recién comprado**: cerrar sesión; tras el onboarding nuevo, Tu perfil dice «En prueba, hasta el {fecha}». Entrar con `atreloz.prueba.1@gmail.com`: **el derecho no «se pega»** a esa cuenta sin «Restaurar compras». Si aparece «Mensual» tras una renovación, anotar la hora: es el riesgo del §4 del reporte previo.

**Bloque K · Un código canjeado fuera de la app** (25A, con un código de sandbox del Anexo C)
- **K1 · Durante la prueba.** Instalación nueva, sin cuenta, en prueba. Con Strivo en segundo plano: **Ajustes → Desarrollador → Cuenta de Apple de sandbox → Gestionar, o «Initiate Transaction» → Offer Codes**, escribir el código de sandbox y confirmar (la ruta sale de un foro: se confirma al probar). Volver a Strivo y esperar hasta 30 segundos. **Debe verse, sin tocar nada:** Tu perfil → «Anual. Se renueva el {fecha}.» y el estado ya no es «En prueba». Si no llega solo, se añade `syncPurchases` limitado a una vez cada 10 minutos.
- **K2 · En modo lectura.** Igual, tras «Simular día 8» y «Ahora no»: al volver, **se puede escribir** sin tocar nada.

**Bloque W · La web** (la web de la 25)
- **W1.** Lo que decida DP-25.12. Si se aprueba la propuesta: se escribe como hoy, no hay bloque «Suscripción» y no aparece ningún muro.

**Bloque R · Regresión** (con «La 25 con diagnóstico», salvo R3)
- **R1 · Borrar la cuenta con suscripción.** Con una cuenta de prueba con Mensual activo: Tu perfil → «Tus datos» → «Borrar mi cuenta» de principio a fin. **Debe verse:** la despedida, como en SPEC_24; en una instalación nueva, «Restaurar compras» devuelve el Mensual.
- **R2 · Cerrar sesión sigue igual** con `atreloz.prueba.1@gmail.com`: los días vuelven al entrar.
- **R3 · «La 25 limpia».** Sin panel; P2 y C1 por encima.

**Bloque H · «Tengo un código»** (25B, con «La 25 con diagnóstico» y otro código de sandbox)
- **H1.** En el muro y en Tu perfil, «Tengo un código» abre la hoja «Tu código». Con el campo vacío, «Continuar» no hace nada. «Cancelar» cierra.
- **H2.** **Pasa a producción (Anexo D):** los códigos de sandbox no se canjean por enlace. Allí: escribir la clave en minúsculas y con espacios → «Continuar» → el App Store con la clave puesta → confirmar y volver. **Debe verse:** «Listo. Tu código quedó aplicado.» y Anual en Tu perfil.
- **H3.** Una clave inventada → el App Store dice que no vale → volver. **Debe verse:** «Todavía no vemos tu código aquí…» con «Restaurar compras», y el muro igual.

**Al terminar:** volver a entrar en el iPhone con la cuenta de diario y poner `mostrar: false` en el Fundador.

---

## 6. Copy

**Los textos de SPEC_25 §4 se usan tal cual**, con una sola salvedad: las claves `ajustes.*` pasan a vivir donde vivan los textos del bloque «Suscripción» de Tu perfil (el texto no cambia). Se reutilizan los que ya existen («Intentar de nuevo», «Cerrar»). **Nuevos, propuesta para el reporte previo:**

| Clave | Texto |
|---|---|
| `paywall.renovacion` | La suscripción se renueva sola al final de cada periodo. Puedes cancelarla cuando quieras en los ajustes de tu teléfono, hasta 24 horas antes de que se renueve. |
| `paywall.sinPlanes` | Ahora no pudimos traer los planes. Inténtalo de nuevo en un momento. |
| `paywall.errorRestaurar` | No pudimos revisar tus compras. Inténtalo de nuevo con conexión. |
| `ajustes.mensualTermina` | Mensual. Termina el {fecha}. |
| `ajustes.anualTermina` | Anual. Termina el {fecha}. |

**Diagnóstico** (`diagnostico.js`, solo con `VITE_DIAG_SUSCRIPCION=1`; propuesta):

| Clave | Texto |
|---|---|
| `suscripcion.estado` | Estado: {estado} · hasta {fecha} |
| `suscripcion.cliente` | RevenueCat: {anónimo · cuenta} · …{últimos 6} |
| `suscripcion.derecho` | completo: {activo · no} · {producto} |
| `suscripcion.planes` | Planes: {n} paquetes · Fundador: {sale · no sale} |
| `suscripcion.inicio` | Inicio de la prueba: {fecha} |
| `suscripcion.eventos` | Eventos: {lista} |
| `suscripcion.dia6` / `suscripcion.dia8` / `suscripcion.hoy` | Simular día 6 / Simular día 8 / Volver al día de hoy |
| `suscripcion.olvidarTarjeta` | Olvidar la tarjeta del día 6 |
| `suscripcion.refrescar` | Refrescar |
| `suscripcion.plegar` / `suscripcion.desplegar` | Ocultar diagnóstico / Diagnóstico de la suscripción |

---

## 7. Reglas de arquitectura que roza

- **Lo escrito nunca queda tras el muro.** Leer, exportar y borrar son siempre posibles.
- **Nada bloquea** (sin `disabled`), **ningún error muestra un código**, **salir de cualquier pantalla no pide confirmación**: el muro se cierra siempre.
- **Una regla, un sitio:** el estado, en una función pura; `puedeEscribir`, en uno; el Fundador, en `mostrarFundador`; el enlace, en `urlDeCanje`; los precios, solo de la tienda; la plataforma, `plataforma.js`; el día que se escribe, `useDiario`.
- **Dirección de dependencias** (RN-TEC-04 a 08): `lib/` no importa de secciones ni de componentes; el diario y Tu perfil leen el estado por el hook. **REPORTA** cómo lo cumples.
- **Nada sale del teléfono** salvo el `uid` hacia RevenueCat y lo que Apple gestiona.
- **Nada secreto en el repo:** ni el Team, ni `GoogleService-Info.plist`, ni `.env.local`, ni las llaves `.p8`.

---

## 8. Entrega

1. **Trabaja en un worktree aparte:** `~/Developer/strivo-25`, rama local `revision-25` creada desde `strivo`. **`~/Developer/strivo` se queda en `strivo` y no se toca.**
2. Copia desde `~/Developer/strivo` los archivos que no están en git (`.env.local`, con la clave pública de RevenueCat que habrá añadido la fundadora, e `ios/App/App/GoogleService-Info.plist`), corre `npm install` y **avisa a la fundadora de que tiene que elegir su Team en el Xcode de esa carpeta una vez** (Anexo A). Ninguno se comitea. **Copia esta instrucción y la adenda de RevenueCat** de `~/Developer/strivo/docs/specs/` (donde las dejó sin seguimiento la fundadora) a `docs/specs/` del worktree. **No sustituyas `SPEC_25_MURO_DE_PAGO.md` del repo**: la del repo lleva la nota de SPEC_24.
3. Commits pequeños y por tema, **en este orden**: 25A (dependencia y `compras.js` / estado y `fechaInicioPrueba` / modo lectura / muro y Fundador / bloque de Tu perfil / identidad, salida y borrado / diagnóstico / pruebas) → docs de 25A → 25B (enlace y hoja / vuelta / pruebas / docs). Cada uno con la línea `Co-Authored-By` del repo, añadiendo archivos por ruta.
4. **Sin push** hasta que la fundadora lo apruebe; entonces `git push origin revision-25`. Nunca a `strivo` directamente.
5. **Fusión de 25A** cuando pasen P, C, K, W y R: `revision-25` → `strivo` con un commit de unión (si 25B ya está a medias en la rama, propón cómo fusionar solo 25A). **Fusión de 25B** cuando pase H. Antes de cada fusión, trae lo nuevo de `strivo`, corre las siete validaciones sobre el resultado y repórtalo. **Antes de fusionar en `~/Developer/strivo`, retira de ahí las copias sin seguimiento de esta instrucción y de la adenda** (son las mismas que entran con la fusión): si no, git se niega a fusionar.
6. Reporte final: qué se hizo, cada **REPORTA** con su respuesta, la salida de las siete validaciones, archivos y casos antes y después, tamaños, y las listas P, C, K, W, R y H con los textos exactos que la fundadora verá.

---

## 9. Reporte previo y decisiones

El reporte previo está en `docs/specs/REPORTE_PREVIO_SPEC_25.md`. **La fundadora lo aprobó el 24 nov 2026 con estas decisiones, que mandan sobre lo de arriba:**

| # | Decisión |
|---|---|
| **D1** | Se comitea en `revision-25` la SPEC_25 de la fundadora más la nota de SPEC_24. Al fusionar, Claude Code descarta la copia modificada de `~/Developer/strivo`. |
| **D2** | `fechaInicioPrueba` vive en `shared/onboarding`, no en el perfil. |
| **D3** | La escribe solo la app de iPhone. |
| **D4** | Días de calendario, con `diaTerminaA`; el último día es el 7 (hoy + 6). |
| **D5** | El desfase del diagnóstico se guarda en una clave de `localStorage` que solo existe en ese build; una prueba comprueba que la build limpia nunca la lee y «Volver al día de hoy» la borra. |
| **D6** | En lectura, una entrada del journal se abre entera para leerla y se puede eliminar; solo «Escribir» abre el muro. |
| **D7** | Si un cliente anónimo con derecho lo pierde al entrar a una cuenta, se restaura una vez, en silencio. Solo en ese caso exacto. |
| **D8** | «Gestionar suscripción» abre la página de Apple. |
| **D9** | Se acepta que el SDK mande el IDFV; se declara en el aviso de privacidad y en la ficha. |
| **D10** | El plugin no existe en el build de la web. |
| **D11** | `VITE_REVENUECAT_IOS_KEY` fuera de git; sin ella, `ios:build` se detiene. |
| **D12** | La web, como hoy hasta DP-21.5. |
| **D13** | Los avisos no se tocan en la 1.0. Deuda para la 1.0.1. |
| **D14** | Se retiran los textos huérfanos `profile` y `paywall`. |
| **D15** | Cerrar sesión empieza un uid y una prueba nuevos; se acepta. |
| **D16** | Los textos nuevos del §6, tal cual. |
| **D17** | Sin URL de privacidad no se pinta el enlace y `ios:build` avisa sin detenerse. |
| **Plugin** | `@revenuecat/purchases-capacitor` 14.1.2, versión exacta. |
| **DP-25.18** | Sin `syncPurchases` en 25A. Si en K1/K2 el derecho no llega solo en 30 s, se añade limitado a una vez cada 10 minutos. |
| **Aplazada** | Una compra que espera un permiso se porta como cancelada, sin texto nuevo. |

Las pruebas P1, C4, C6, C7, C10, K1 y H2 y el Anexo B ya están corregidos arriba.

## 10. Resultados

*(Se llena al terminar.)*

---

## Anexo A · Para la fundadora: la primera vez en el Xcode del worktree

1. En la terminal de VS Code, dentro de `~/Developer/strivo-25`: `VITE_DIAG_SUSCRIPCION=1 VITE_DIAG_ALMACEN=1 npm run ios:build` y luego `npm run ios:abrir`. Se abre **otro** Xcode, el de esa carpeta (cierra antes cualquier otro Xcode; en el título de la ventana se ve de qué carpeta es).
2. En la columna izquierda, clic en **App** (el ícono azul de arriba) → pestaña **Signing & Capabilities** → en **Team** elige **ALEJANDRA TREVIÑO LOZANO**. Deja marcado **Automatically manage signing**. Si sale «Update to recommended settings», **no lo aceptes**.
3. Arriba, junto a «App», elige tu iPhone conectado por cable.
4. Para instalar: botón **▶**. Para detener: **■**.

## Anexo B · Comprar de mentira: la cuenta de sandbox

- **Las compras de sandbox no cobran nada.** Usan las dos cuentas de prueba que creaste el 19 nov en App Store Connect → Usuarios y acceso → Sandbox.
- **Dónde se pone en el iPhone** (iOS 18.1 o más): Ajustes → **Desarrollador** → hasta abajo, **«Cuenta de Apple de sandbox»** → iniciar sesión con la cuenta de prueba. Ahí mismo, en **Gestionar**, se ven, se cancelan y se ajustan las suscripciones de sandbox. Tu Apple ID de siempre no se toca. (Si no aparece, la primera compra desde una app instalada con Xcode pide la cuenta de sandbox.)
- **Se inicia sesión antes de P2, no solo antes de comprar.** Sin cuenta de sandbox, el muro enseñó $39.99 al año y $3.99 al mes, en dólares (25 nov 2026); con la de México, $799.00 y $89.00.
- **En la hoja de compra se ve «[Sandbox]».** Si no lo ves, no confirmes: estarías en tu cuenta real.
- **Tiempos de sandbox:** un mes ≈ 5 minutos; un año ≈ 1 hora.
- **Para repetir el Fundador con la misma cuenta:** App Store Connect → Usuarios y acceso → Sandbox → la cuenta → «Borrar historial de compras». O usa la otra cuenta.
- **Cuentas de Strivo para probar:** alias de tu Gmail de pruebas, como en SPEC_24: `atreloz.prueba.1+c3@gmail.com`, `+c10`… `atreloz.prueba.1@gmail.com` (sin `+`) no se borra nunca.

## Anexo C · Lo que hace la fundadora fuera del código, antes de las pruebas

**En App Store Connect:**
1. **Los tres productos en «Listo para enviar».** En cada uno (Strivo → Monetización): subir una **captura de revisión provisional** (cualquier captura de la app sirve; se cambia por la del muro real antes de enviar a revisión) y revisar que el producto **y el grupo de suscripción `Strivo`** tengan nombre y descripción en español de México. Sin esto, en sandbox los planes pueden llegar vacíos.
2. **La oferta de código del Anual (DP-25.6 y 25.7)**, para poder probar K y H: Strivo → Suscripciones → Strivo Anual → **Códigos de oferta** → crear la oferta: «Pago por adelantado» o «Pago periódico» de **1 año** al punto de precio más cercano a **$719**; elegibilidad: personas nuevas (y, si quieres, las que dejaron de suscribirse). Después, en esa oferta, generar **unos 5 códigos de sandbox**. Apunta dónde los dejaste: se usan en K1, K2, H2 y H3. **Las claves personalizadas (`ALEJANDRA10`) no se pueden crear todavía** (Anexo D).

**En RevenueCat:**
3. **La clave pública de iOS:** Project settings → API keys → la de la app «Strivo» (App Store), empieza con `appl_`. Pégala en `~/Developer/strivo/.env.local` en una línea nueva: `VITE_REVENUECAT_IOS_KEY=appl_…` (el nombre exacto lo confirma el reporte previo). No es secreta, pero no la mandes por chat.
4. **El comportamiento de restauración:** Project settings → General → «Restore behavior» (o «Transfer behavior»): **«Transfer to new App User ID»**, que es el de fábrica. Solo comprobarlo.
5. **El metadata del Fundador:** después de aprobar el reporte previo, Product catalog → Offerings → `fundador` → Metadata → el JSON exacto que diga el reporte, con `"mostrar": false` hasta las pruebas C8 y C9.

**Para el envío a revisión** (fuera de esta instrucción, como recordatorio):
6. La URL del **aviso de privacidad** (A9) y, si no usas el EULA estándar de Apple, la de tus **Términos**.
7. La **captura real del muro** en los tres productos; en las **notas para el revisor**: «La app ofrece 7 días gratis gestionados por la app, sin cuenta. El muro de pago está en Tu perfil → Suscripción → Ver opciones; también aparece al abrir la app después del día 7.»; la ficha de privacidad con lo que reporte Claude Code del SDK de RevenueCat.

## Anexo D · Después de que Apple apruebe la app (campaña con aliadas)

1. En la oferta de código del Anual, **una clave personalizada por aliada** (`ALEJANDRA10`…), solo letras y números, con **tope de canjes** y **fecha de vencimiento**. El enlace de cada una: `https://apps.apple.com/redeem?ctx=offercodes&id=6836996054&code=ALEJANDRA10`.
2. **Prueba en producción antes de repartir nada:** crea una clave de prueba (por ejemplo `PRUEBASTRIVO`) con tope de 1 canje en una oferta aparte de **1 semana gratis**, canjéala con tu Apple ID real por el enlace y, si 25B ya está publicada, por «Tengo un código»; comprueba que Strivo dice «Anual» al volver; cancela la suscripción en Ajustes y **desactiva esa oferta** (cuenta para el tope de diez).
3. Durante la campaña, el número que vale es el **reporte de canjes de App Store Connect** (columna de la clave), no el tablero de RevenueCat.
