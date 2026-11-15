# Reporte previo · SPEC_24 — Llevarme lo que escribí (24A) y borrar mi cuenta (24B)

**Fecha:** 15 nov 2026 · **Para:** la fundadora · **Sobre:** `revision-24` en `d90427a`, sin una línea de código cambiada.
**DP-24.4 ya decidida: A** (la app borra la nube, sin Cloud Function).

---

## 0. Estado del repositorio (§0.2–§0.4)

- `strivo` está en `d90427a` (la fusión de SPEC_23). ✔
- **Worktrees:** solo `~/Developer/strivo`. **No existe** `~/Developer/strivo-23` ni la rama `revision-23`.
- **Ramas `revision-*` locales que siguen ahí** (no las toqué): `revision-17b`, `revision-21-2`, `revision-31`.
- `~/Developer/strivo` tiene `project.pbxproj` modificado (tu Team). No lo toqué.
- **Montado:** `~/Developer/strivo-24`, rama `revision-24` desde `strivo`. Copié `.env.local`, `ios/App/App/GoogleService-Info.plist` y esta instrucción a `docs/specs/`. `npm install` hecho. **Ninguno de los tres se comitea.**
- **Compila:** `npm run build` y `npm run ios:build` limpios. `xcodebuild` para el simulador (iPhone 18 Pro, firma ad hoc) termina bien.
- **Te toca una vez:** elegir tu Team en el Xcode de `strivo-24` (Anexo A). Hasta entonces no se puede instalar en tu iPhone desde esa carpeta.

**Medidas de partida** (para comparar al final): chunk principal de la web **758,18 kB (gzip 215,11)**. Pruebas: 125 archivos y 2.956 casos en `indexeddb`, 2.885 en `sqlite`, según el CLAUDE.md. Las vuelvo a contar antes del primer commit.

---

## 1. Resumen: lo que propongo y lo que necesito que decidas

| # | Decisión | Mi propuesta |
|---|---|---|
| **D1** | Cómo se escribe el `.zip` en el iPhone antes de compartirlo (DP-24.9) | **Dos métodos nuevos en nuestro plugin `strivo-almacen`** en lugar de `@capacitor/filesystem`. Ver §4.3. Rompe «cuatro métodos y ninguno más»: **la decisión es tuya**. Si dices que no, `@capacitor/filesystem` 8.1.5, con su coste. |
| **D2** | Compartir en el iPhone | **`@capacitor/share` 8.0.3** (`navigator.share` no es fiable aquí, §4.2). Zip con **`fflate` 0.8.3** (dependencia no-Capacitor: la apruebas tú). |
| **D3** | Revocar Apple (DP-24.11) | **Camino (c)**: llamada directa desde JavaScript, una sola hoja y una sola sesión. Leído en el SDK y con la preflight CORS ya comprobada (§6.3). Queda una cosa por confirmar en el teléfono; si falla, el plan B está en §6.3. |
| **D4** | Si falla la revocación de Apple | **«No se borró nada»**, y se quita la marca. Esto resuelve una contradicción entre DP-24.11 y DP-24.12 (§6.4). |
| **D5** | Lo que se limpia del teléfono (DP-24.14) | **Vaciar el almacén entero** (todos los uid), no listar uid por uid. Ver §7. |
| **D6** | Borrar sin haber terminado de bajar la cuenta en este teléfono | **Se baja antes de empezar** (precondición). Si no baja, no se empieza. Es lo que hace que «Conservar mi cuenta» pueda reconstruir la nube entera (§6.5). |
| **D7** | Exportar sin que la cuenta haya terminado de bajar | Se intenta bajar antes (techo de 15 s) y, si no termina, se exporta igual y se dice **una frase nueva** (`exportar.incompleto`, §9). |
| **D8** | Respiración en el `.md` | **Solo las combinaciones guardadas, con su nombre**. Las sesiones y los usos (son recuentos) solo van en el `.json`. Ver §3. |
| **D9** | Tono del botón final (DP-24.3) | **El primario de siempre.** Clay no pasa AAA (§5.3). |
| **D10** | La cola con pendientes (DP-24.15) | **No se avisa**, como propone la instrucción. |
| **D11** | Riesgo de otro dispositivo (DP-24.17) | **Se documenta**, no se mitiga (§6.7). |
| **D12** | La pantalla «a medio borrar» sin sesión | Pide entrar de nuevo con el método de la cuenta antes de terminar o conservar (§6.5). Es un caso que DP-24.13 no cubría. |

Lo demás sigue la instrucción tal cual.

---

## 2. DP-24.1 y DP-24.5 · Dónde viven

- **DP-24.1: sí.** Exportar funciona con cuenta y sin cuenta, en la web y en el iPhone, sin red.
- **DP-24.5: de acuerdo con la propuesta.** Un bloque `tusDatos` («Tus datos») al final de Tu perfil, detrás de `sincronizacion`.
  - Dentro va «Llevarme lo que escribí» con su texto y el botón.
  - Debajo, solo con la sesión `conCuenta`, **«Borrar mi cuenta» como enlace de texto secundario** (la misma forma que «Volver al PIN»). Es lo último de la pantalla.
  - Los pasos del borrado son una capa a pantalla completa (`role="dialog"`, `aria-modal`, foco atrapado, Escape = Quedarme), sin rutas. Es la forma de `Confirmacion`, pero más grande: `Confirmacion` es una caja con dos botones y aquí hacen falta campos y estados.
  - **La pantalla «a medio borrar» y la despedida** las monta `ArranqueProvisional` en lugar de la app, igual que hoy monta el velo de restauración: tienen que existir antes de que se pinte cualquier sección.

---

## 3. 24A · Qué entra en el archivo (DP-24.7)

**Fuente:** el almacén local del uid de la sesión (SQLite o IndexedDB), leído con una función nueva de `local.js`, `leerTodoDelUid(uid)`. Usa el índice `byUser`, que ya tienen los dos adaptadores. Con la cola incluida es lo más completo que hay en el teléfono.

| Registro | `.md` | `.json` | Por qué |
|---|---|---|---|
| `diario/morningEntry/{fecha}` (versión actual) | **Entra** | Entra entero | Lo escribió la persona. |
| Campos de la mañana de versiones anteriores (`emotions`, `granVision`, `feeling`, `intention`) | **Entra**, con sus rótulos de RN-HIS-07 | Entra | Nada se pierde. |
| `diario/nightRitual/{fecha}` (versión actual) | **Entra** | Entra entero | |
| Campos de la noche de versiones anteriores (`gratitude`, `learning`, `sleepState`, `sleepStateOther`, `closingFeeling`) | **Entra**, con sus rótulos y «Te fuiste a dormir: …» | Entra | |
| `diario/journal/{id}` | **Entra dentro de su día**, con la hora | Entra | Con PIN, solo tras abrir la puerta (DP-24.6). |
| `shared/profile` | Entra en «Tú»: nombre, cómo hablarte, horarios y la identidad central si alguna vez se escribió | Entra | Es de la persona. |
| `shared/onboarding` | Entra la respuesta de P3 (motivos y «otro»), con su pregunta | Entra solo `motivos` y `motivoOtro` | Pasos, versión y fechas son maquinaria. |
| `shared/frases` | Entra la elección de referencias, con su pregunta | Entra | Es suya, aunque no suba a la nube. |
| `shared/auth` | No entra | Entra correo y teléfono; **nunca el uid** | El correo es suyo; un identificador interno no. |
| `shared/preferences` | No entra | Entra (sonido, movimiento reducido, recordatorios) | Ajustes, sin texto. |
| `breathing/unica` (preferencias) | No entra | Entra | Ajustes. Se lee la fila tal cual: `leerPreferencias` siembra y escribe. |
| `breathing/favoritos` | **Entra**: nombre de cada combinación y su descripción corta (la de la lista de favoritos) | Entra entero | El nombre lo escribió la persona. `usos` es un recuento y no va en el `.md`. |
| `breathing/recientes` | No entra | Entra | Configuración sin texto propio. |
| `breathing/sesiones` | **No entra** (RN-RE-01: nada se cuenta a la vista) | Entra | El derecho a llevarse los datos cubre todo lo suyo, pero el `.md` es para leerse, y ahí no van cifras. |
| `diario/dayState` | No entra | No entra | Nadie lo escribe. Si una versión vieja lo dejó, es el ánimo derivado que RN-DB-05 prohíbe persistir, sin texto de la persona. |
| `diario/pinConfig` | **Nunca** | **Nunca** | Hash, sal y verificador de Face ID. Una prueba recorre el zip. |
| `diario/frasesDelDia` | **Nunca** | **Nunca** | Asignaciones internas. |
| Cola, marcas, claves `strivo.*`, `meta` | **Nunca** | **Nunca** | Maquinaria. |
| **Cualquier otra fila del uid de una colección que el exportador no conoce** | No entra | **Entra en `otros`, tal cual** | Red de seguridad: si un teléfono guarda algo de una época anterior (la prueba de separación prohíbe nombrar en `diario/` ciertos campos muy viejos), va al `.json` sin que haya que nombrarlo. Lo de arriba que se excluye a propósito no entra aquí. |

**Si la restauración de esa cuenta no terminó en este teléfono** (`conCuenta` y sin `strivo.restaurado.<uid>`): al tocar «Preparar mi archivo», con red, se intenta `restaurar` con el techo de 15 s. Termine o no, se exporta lo que hay. Si no terminó, debajo del botón aparece `exportar.incompleto`. Sin red, igual: se exporta y se dice. Sin cuenta, nunca se dice nada.

**Lo que puede faltar sin avisar** (lo acepto y lo digo): si alguna vez Respiración no pudo escribir en el almacén y usó su copia en memoria, esa sesión no está en el archivo. Es un caso de error que ya existía.

---

## 4. 24A · Formato y entrega (DP-24.8 y DP-24.9)

### 4.1 Nombre y contenido

- **El nombre del archivo:** `strivo-{nombre}-{fecha}.zip`.
  - El nombre va sin acentos (NFD), en minúsculas, con los espacios convertidos en `-` y solo `[a-z0-9-]`.
  - Si el nombre queda vacío, el archivo se llama `strivo-{fecha}.zip`.
  - La fecha es `YYYY-MM-DD` local.
  - Ejemplo: «José Ángel» → `strivo-jose-angel-2026-11-15.zip`.
- **Dentro, en la raíz:** `entradas.md` y `entradas.json`. Archivos de iPhone lo descomprime en una carpeta con el nombre del zip.
- **Los textos dentro del `.json` van exactamente como se guardaron**, sin recortar nada. En el `.md` pasan por los resúmenes que ya usa la app, que solo quitan espacios al principio y al final.

**El `.md` sin romper el formato** (criterio 2):
- Al principio de una línea se escapan con `\` los caracteres que la app convertiría en estructura: `#`, `>`, `-`, `+`, `*`, `1.`, `---` y `===`.
- En cualquier sitio se escapan `\`, `*`, `_`, `` ` ``, `<`, `[` y `]`.
- **Cada salto de línea de la persona se conserva**: un salto simple termina con dos espacios (salto duro, invisible al leerlo como texto plano) y los párrafos siguen separados por una línea en blanco.
- Abierto como texto plano en Archivos, se lee casi igual que lo escrito; abierto con un visor de Markdown, no se rompe.

### 4.2 Por qué no `navigator.share` en el iPhone

- Dentro del WebView existe desde iOS 14, pero **necesita que el toque siga «activo»**, y nosotros armamos el zip de forma asíncrona antes de compartir. Con muchos días eso pasa de la ventana, y WebKit tiene errores abiertos con archivos (el segundo intento falla, o se ignoran los archivos si van con texto).
- **El plugin nativo no tiene esa limitación.**
- **La descarga de la web tampoco sirve dentro de la app**: Capacitor no maneja descargas, y un enlace `blob:` acaba cancelado.

### 4.3 La entrega

- **Web:** `zipSync` → `Blob` → `<a download>` → `revokeObjectURL`. Sin plugins y sin `navigator.share`. Al terminar se ve `exportar.descargado`.
- **iPhone:** `zipSync` → base64 con `FileReader` → se escribe en Caches → `Share.share({ files: [url] })` → se borra el archivo en un `finally`.
  - Cancelar la hoja: el plugin rechaza con el mensaje exacto «Share canceled», sin código. Se trata como cancelación: sin texto, y volver a tocar regenera.

**D1 · Dónde se escribe el archivo temporal:**

| | `@capacitor/filesystem` 8.1.5 | Dos métodos en `strivo-almacen` (**propuesta**) |
|---|---|---|
| Dependencias | `@capacitor/synapse` 1.0.4 (pone un global `window.CapacitorUtils` al importarse) y **un paquete Swift remoto**, `ion-ios-filesystem` 2.0.1 | Ninguna |
| Manifiesto de privacidad | **Obliga a añadir a la app un `PrivacyInfo.xcprivacy`** que declare `FileTimestamp` (C617.1): la librería enlaza `attributesOfItem` aunque no lo llamemos. Hoy la app no tiene ninguno. | Nada que declarar |
| Código propio | 0 líneas de Swift | ~40 líneas (`escribirTemporal(nombre, base64) → url` y `borrarTemporal(url)`), con su XCTest, en `Library/Caches/Strivo/exportar/` |
| Regla de 17B | Intacta | **Rompe «cuatro métodos y ninguno más»** |

Recomiendo la segunda: menos piezas de terceros justo antes de la revisión de Apple.

**`@capacitor/share` 8.0.3:**
- Es el `latest`, publicado el 2 oct 2026.
- No tiene dependencias, trae un `Package.swift` sin paquetes remotos y no trae manifiesto de privacidad (no lo necesita: solo usa `UIActivityViewController`).
- Su versión web usa `navigator.share` e ignora los archivos. Da igual, porque en la web no se carga.

**`fflate` 0.8.3:**
- Publicado el 16 may 2026, sin dependencias y con `sideEffects: false`.
- `zipSync` + `strToU8` ocupa **~9 kB minificado, 4,4 kB gzip**. Se usa la versión síncrona: la asíncrona crea workers desde `blob:`, y eso no lo queremos.

**Cada dependencia la importa un solo archivo, bajo demanda**, con una prueba que recorre `src/`:
- `fflate` → `src/lib/exportar/comprimir.js`.
- `@capacitor/share` (y el método nuevo del plugin) → `src/lib/exportar/entregarNativo.js`.

**Tamaño estimado** (mido el real después):
- **Web:** el chunk que se carga al exportar estaría entre 15 y 20 kB gzip (el exportador, los resúmenes que ya existen y fflate).
- **Chunk principal:** solo el bloque «Tus datos», unos 2 kB. El borrado, la puerta y la exportación van en chunks bajo demanda.
- **App de iPhone:** +60–100 KB con share y la opción B; con filesystem, bastante más.

---

## 5. 24A · La puerta del journal, la composición y el tono

### 5.1 DP-24.6: con el journal protegido

- **Se reutiliza `BloqueoPin` en modo `desbloqueo` con `usePin`, sin copiar nada.** Un componente nuevo y pequeño, `components/diario/PuertaDelJournal.jsx`, monta `usePin(uid)`. Mientras no esté desbloqueado pinta `<BloqueoPin modo="desbloqueo" …>`. En cuanto `desbloqueado` pasa a `true`, avisa con `onAbierta`.
- **Face ID se pide solo al montar**, como en el Journal (E3).
- **El único cambio en `BloqueoPin`:** si recibe `onCerrar` en modo `desbloqueo`, el paso «abrir» pinta debajo el botón que ya existe con `textos.cerrar` («Cerrar»). El Journal no se lo pasa y no cambia nada para él. Cerrar no prepara nada y no dice nada.
- **La puerta se pide si el PIN está activo, haya o no entradas en el journal.** Pedirla solo cuando hay entradas contaría lo que el PIN tapa (la misma razón que la frase fija del Historial).
- **Lo que verás:** la pantalla del PIN de siempre, «Tu journal te espera» / «Escribe tu PIN para abrirlo.», con «Cerrar» debajo.

### 5.2 Dirección de dependencias (§7 de la instrucción)

`lib/` no conoce secciones, y `perfil/` no lee `diario/` ni `breathing/`. Cada pieza va donde ya está lo suyo:

| Pieza | Dónde | Qué sabe |
|---|---|---|
| Leer todo un uid | `src/lib/db/local.js` · `leerTodoDelUid` | Filas, nada más |
| El día como bloques | **`src/diario/exportar.js`** | Usa `resumenDeManana`, `resumenDeNoche`, `etiquetasDe`, `horaDe` y los catálogos. Devuelve datos, no Markdown |
| Los bloques de versiones anteriores | **Funciones puras nuevas en `manana.js` y `noche.js`** (`bloquesHeredadosDeManana`, `bloquesHeredadosDeNoche`) | **Hoy esa lógica vive dentro del JSX de `VistaDiaCompleto`.** La saco y el Historial pasa a usarla: una regla, un sitio. El Historial se ve igual y sus pruebas no cambian lo que comprueban |
| Respiración | `src/breathing/data/exportar.js` | Mueve `subtitulo` y `duracionCorta` de `FilaFavorito.jsx` a `breathing/lib/`, para no copiarlos |
| «Tú» | `src/perfil/exportar.js` | Perfil, motivos (catálogo del onboarding) y frases (`referencias/`). Es lo que RN-TEC-07 ya le permite |
| Markdown, JSON, nombre del archivo, escapado | `src/lib/exportar/archivo.js` | Recibe secciones ya resueltas |
| Zip / entrega | `src/lib/exportar/comprimir.js`, `entregar.js`, `entregarNativo.js` | Bytes |
| **Composición** | **`src/exportarCuenta.js`**, importado solo por `App.jsx` | Junta las cuatro partes. `App.jsx` pasa a Tu perfil la función `exportar` y la `PuertaDelJournal` por props, como ya hace con `Respiracion` |

- **Hueco que conviene saber:** `eslint.config.js` no vigila `src/lib/**` (salvo `lib/respiracion`) ni `src/perfil/**`; hoy esa regla es convención.
- **Propongo dos zonas nuevas de eslint:** `src/lib/exportar/**` y `src/lib/borrarCuenta*.js` no pueden importar ni `diario/` ni `breathing/`. Las dos son de código nuevo, así que no tocan nada existente.

**Lo que se pierde hoy y el archivo no puede perder:**
- **La pausa de la mañana:** si su pregunta no se puede reconstruir, `resumenDeManana` la omite entera, con la respuesta incluida.
- **La reflexión de la noche ligada a una mañana sin intención:** con `preguntaGuardada` en `null`, pasa lo mismo.
- **El arreglo:** en el archivo esas respuestas salen con el rótulo del Historial («Tu pausa», «Tu reflexión») en lugar de la pregunta.

### 5.3 DP-24.3: el tono del botón final

Medido con la fórmula de `lint:contraste`:

| Par | Contraste | AAA (7:1) |
|---|---|---|
| ink `#241E33` sobre clay `#C9836B` | **5,31:1** | No |
| paper `#FBF8F4` sobre clay | 2,86:1 | No |
| secundario `#3A3546` sobre clay | 3,91:1 | No |

**Clay no pasa, así que el botón va como el primario de siempre** (`variant="surface"`). Ningún color nuevo y ningún cambio en `lint:contraste`.

---

## 5bis. Esquema de `entradas.json` (versión 1)

```jsonc
{
  "formato": "strivo.exportacion",
  "version": 1,
  "exportadoEn": "2026-11-15T22:14:03.120-06:00", // ISO con desfase local
  "zonaHoraria": "America/Monterrey",
  "completo": true,                                 // false si la cuenta no terminó de bajar (D7)
  "persona": {
    "nombre": "Alejandra" | null,
    "genero": { "id": "f", "rotulo": "Femenino" },   // id del modelo; rótulo del catálogo de P2A
    "correo": "…" | null,
    "telefono": "…" | null,
    "horarios": { "despertar": "07:00" | null, "dormir": "23:00" | null, "diaTerminaA": "03:00" },
    "identidadCentral": "…" | null,                  // solo si alguna vez se escribió
    "motivos": [{ "id": "paz", "rotulo": "…" }],
    "motivoOtro": "…" | null,
    "frases": { "modo": { "id": "espirituales_generales", "rotulo": "…" | null },
                "afinidades": [{ "id": "estoicismo", "rotulo": "…" }] } | null,
    "preferencias": { "soundEnabled": false, "reducedMotion": false, "remindersEnabled": true }
  },
  "dias": [                                          // orden cronológico ascendente por fecha
    {
      "fecha": "2026-11-14",
      "manana": {
        "registro": { /* el documento tal cual, todos sus campos, también los de versiones anteriores */ },
        "bloques": [                                 // lo mismo que el .md, ya resuelto
          { "id": "animo", "pregunta": "¿Cómo me siento esta mañana?",
            "emociones": [{ "id": "cansado", "rotulo": "Cansada" }, { "propia": "«con frío»" }] },
          { "id": "gratitud", "pregunta": "¿Qué agradezco hoy?", "respuestas": ["…", "…"] }
        ]
      } | null,
      "noche": { "registro": { … }, "bloques": [ … ] } | null,
      "journal": [
        { "id": "…", "creadaEn": "…", "actualizadaEn": "…", "texto": "…",
          "emociones": [{ "id": "…", "rotulo": "…" }], "emocionPropia": "…" | null }
      ]                                              // [] con PIN y sin abrir la puerta: no se exporta
    }
  ],
  "respiracion": {
    "preferencias": { … } | null,
    "favoritos": [ { /* el documento */ , "rotulos": { "patron": "Calma 5-5-3", "sonido": "…", "visual": "…" } } ],
    "recientes": [ … ],
    "sesiones": [ … ]
  },
  "otros": [ { "ruta": "diario/…", "datos": { … } } ]   // filas del uid que el exportador no conoce
}
```

- **Regla:** todo identificador lleva su rótulo al lado, y el rótulo sale del copy en el género de la persona.
- **El `uid` no aparece en ningún sitio.** Una prueba valida el `.json` contra este esquema y busca que no aparezca ni `pinConfig`, ni `frasesDelDia`, ni `salt`, ni `hash`, ni el uid.

---

## 5ter. Ejemplo de `entradas.md`

Los títulos de las preguntas fijas son los del copy actual. Los textos de la persona, la pregunta del reconocimiento (rota por fecha y ánimo) y el rótulo del motivo de P3 son ilustrativos.

```markdown
# Lo que escribí en Strivo

Alejandra · exportado el 15 de noviembre de 2026

## Tú

**¿Qué te gustaría encontrar aquí?**
Paz al final del día · «un rato para mí»

**Para tu inspiración diaria**
Quiero elegir referencias espirituales · Estoicismo

---

## Viernes 14 de noviembre de 2026

### Tu mañana

**¿Cómo me siento esta mañana?**
Cansada · Con inquietud · «con frío»

**¿Qué agradezco hoy?**
1. El café de mi mamá.
2. Que dormí seis horas  
   aunque me desperté dos veces.

**¿Cómo me gustaría sentirme durante el día de hoy?**
En calma

**¿Qué puedo hacer hoy para acercarme a esa sensación?**
Salir a caminar antes de abrir la computadora.

### Tu noche

**¿Qué quiero reconocer de este día?**
1. Que pedí ayuda.

**Esta mañana elegí *«En calma»* como intención. ¿Qué noté en mí?**
Que la calma llegó tarde, pero llegó.

**¿Cómo me siento al cerrar el día?**
Agotada · En paz

### Lo que escribiste

**21:40** · Con nostalgia
Hoy pensé mucho en la casa de mi abuela.

Escribo esto con \# y \*asteriscos\* tal como los puse.

---

## Martes 19 de agosto de 2026

### Tu mañana

**Cómo querías sentirte**
Tranquila · Presente

**Cómo imaginabas el día**
Un día lento.

### Tu noche

**Lo que agradeciste**
1. La lluvia.

**Lo que aprendiste**
Que no tengo que contestar todo hoy.

Te fuiste a dormir: Cansada · «pensativa»

---

## Respiración

Tus combinaciones guardadas:

- **Para dormir** · Calma 5-5-3 · Lluvia · 5 minutos
```

- La segunda fecha es una mañana y una noche de la versión 1: van con sus rótulos propios porque su pregunta no se guardó.
- **Un día con solo journal sale igual**, con el título del día y «Lo que escribiste».
- **Sin entradas,** el `.md` tiene el encabezado y «Tú».

---

## 6. 24B · Borrar mi cuenta

### 6.1 DP-24.10: leer para borrar, con una sola lectora

- **La lista es completa.** Todo lo que `sync.js` puede encolar está en `DOCUMENTOS` y `SUBCOLECCIONES`. `esRutaLocal` deja fuera `pinConfig`, `shared/frases` y `frasesDelDia`.
- **El historial de git lo confirma.** Leí todas las ramas, también `formia-paused`, solo con `git log` y `grep`: **antes del 17 sep 2026 (SPEC_17A, `221c4f2`) ningún código llamó a `flush` ni a `setDoc`**. Así que las rutas de la época `lumia/…` y `formia/…` nunca subieron. En `221c4f2` la lista ya era la de hoy.
- **El comentario de `lumia/pinConfig` en `firestore.rules` está viejo.** Propongo corregirlo de paso: es solo un comentario, las reglas no cambian.
- **No hay ninguna ruta subida que la lista no conozca.** El único riesgo fuera del repo: una escritura hecha desde la consola de Firebase u otra app en el mismo proyecto.
- **Cómo queda:** `restaurar.js` exporta `rutasEnLaNube(uid, { limiteMs })` con su misma lista, su misma paginación de 300 y `conLimite`. Devuelve las rutas de los documentos hoja que existen. El borrado la usa antes de borrar y después, para confirmar cero.
  - La prueba del criterio 1 sigue pidiendo **la misma lista blanca**: nadie más llama a `getDoc` ni a `getDocs`.
  - A la lista de borrado se suma siempre `diario/pinConfig` (sin leerlo), por si alguna versión vieja lo hubiera subido.
- **Firestore no tiene documentos contenedores** (`users/{uid}`, `…/diario/journal`): solo hojas. Borradas las hojas, el UID desaparece de la consola, también de la cursiva. Es lo que comprueba B5.
- **Criterio 9:** una prueba construye todas las rutas que `sync.js` puede encolar (desde `schema.js`, `SHARED_DOCS` y el esquema de Respiración, menos `esRutaLocal`) y falla si alguna no está cubierta por la lista de borrado.

### 6.2 La marca y los disparadores (DP-24.12, paso 2)

**La marca:**
- **Clave:** `strivo.borrado.<uid>`. Se añade a `FAMILIAS` de `clavesDelTelefono.js`; sin eso, `reconciliarClaves` borraría su copia en SQLite al arrancar.
- **Su valor** es un JSON pequeño: `{ fase, metodo, desde }`.
  - `fase` ∈ `revocando`, `nube`, `cuenta`, `telefono`.
  - `metodo` es `password`, `google.com` o `apple.com`, para saber cómo reautenticar al retomar.
  - Ningún dato que no esté ya en el teléfono.

**Toda subida termina en `flush`, y toda bajada en `restaurar`.** Por eso basta con dos cerrojos y una guarda:

| Disparador | Cómo queda bloqueado con la marca |
|---|---|
| `startSync` (vaciado inmediato) | Guarda en `flush` + `startSync` no arranca para un uid marcado |
| Escribir → a los 2 s (`alEncolar`/`programarSubida`) | Guarda en `flush` |
| `online` | Guarda en `flush` |
| `visibilitychange` / `pagehide` | Guarda en `flush` |
| Reintentos (2, 5, 10, 20, 30 s) | `cancelRetries()` al poner la marca, y `scheduleRetry` no rearma para un uid marcado |
| `otraVuelta` al acabar un vaciado | Guarda en `flush` |
| «Intentar de nuevo» de Tu perfil | Guarda en `flush` y en `restaurar` (además, la capa tapa Tu perfil) |
| `comprobarSalida` / `salirDeCuenta` | Guarda en `flush` (y no se puede tocar con la capa abierta) |
| `prepararArbol` → `restaurarConUnReintento` | Guarda en `restaurar` |
| `entrarACuenta` → `restaurarConUnReintento` | Guarda en `restaurar` |
| `reintentarAlVolverLaRed` / `reintentarEntradaAlVolverLaRed` | Guarda en `restaurar` |
| `reintentarRestauracion` (onboarding, SPEC_30) | Guarda en `restaurar` |
| `completarMudanzaPendiente` / `escucharMudanzasPendientes` | Guarda propia: no muda hacia un uid marcado (encolaría bajo él) |

- **La guarda de `flush` se mira en cada entrada, antes de `setDoc` o `deleteDoc`**, contra `entry.uid`. Así un vaciado que ya estaba en camino se detiene entre un documento y el siguiente.
- **Después de poner la marca:** `cancelRetries()` y `await flushEnCurso()`, con el techo de 15 s.
- **La guarda de `restaurar` devuelve `{ ok: false, motivo: 'borrando' }`**, sin marcar, sin avisar a los oyentes y sin escribir nada.
- `getPendingCount` y `listQueue` no se filtran: «Conservar» los necesita.
- **Criterio 8:** una prueba dispara cada uno y comprueba cero escrituras y cero lecturas.

### 6.3 DP-24.11: revocar Apple, camino (c)

**Lo leído en el SDK de iOS 12.19.3** (el que fija `Package.resolved`, ya en DerivedData):
- **El endpoint:** `RevokeTokenRequest.swift` manda `POST https://identitytoolkit.googleapis.com/v2/accounts:revokeToken?key=…`.
- **El cuerpo:** `{"providerId":"apple.com","tokenType":"3","token":<código>,"idToken":<idToken de Firebase>}`. **`tokenType` va como la cadena `"3"`**: es `authorizationCode` en su enum. No va como «CODE», como suponía la instrucción.
- **Las cabeceras** (`AuthBackend.swift`): `Content-Type`, `X-Client-Version`, **`X-Ios-Bundle-Identifier`**, `X-Firebase-GMPID` y `Accept-Language`.
- **Una confirmación más:** `Auth.revokeToken(withAuthorizationCode:)` empieza por `_currentUser?.…`. **Sin usuario nativo, no solo no hace nada: la promesa del plugin no contesta nunca.** El camino (a) con `skipNativeAuth: true` se quedaría colgado para siempre.

**El plugin 8.5.2 sí devuelve `credential.authorizationCode` con `skipNativeAuth: true`** (`AppleAuthProviderHandler.swift` y `FirebaseAuthenticationHelper.createCredentialResult`).

**La preflight CORS**, comprobada hoy desde la Mac, sin datos y sin clave:
- Un `OPTIONS` con `Origin: capacitor://localhost` contesta **200**.
- `access-control-allow-origin: capacitor://localhost`.
- Acepta `content-type`, `x-client-version`, `x-firebase-gmpid` y **`x-ios-bundle-identifier`**.

**El flujo del borrado con Apple, una sola hoja:**
1. `signInWithApple({ skipNativeAuth: true })` devuelve `idToken`, `nonce` y `authorizationCode`.
2. `reauthenticateWithCredential` con `idToken` + `rawNonce`: es la reautenticación de siempre.
3. **Primer paso tras la marca:** `fetch` al endpoint de arriba con la **clave web** (`VITE_FIREBASE_API_KEY`, la que ya usa el WebView), `tokenType: "3"`, el código y `await usuario.getIdToken()`. Lleva `X-Ios-Bundle-Identifier: com.hellostrivo.strivo`, para que el servidor canjee el código con el bundle de la app, como hace el SDK nativo.

**Lo que solo se puede confirmar en el teléfono:**
- Que el servidor acepta la llamada desde la clave web con esa cabecera.
- Que Strivo desaparece de «Iniciar sesión con Apple» (B7).
- Que el Anexo C (la clave `.p8` y el Team ID en Firebase) está hecho; **sin él, la revocación falla**.
- **Cómo lo verás sin consola:** el diagnóstico dice «Apple: revocado» o «Apple: falló».
- **Si fallara por la clave o el bundle**, el plan B es el camino (a): solo para el borrado, `skipNativeAuth: false`, `revokeAccessToken` y `signOut` nativo. Tiene el coste de una segunda sesión nativa durante unos segundos. Lo traería en una adenda, no lo construyo de entrada.

**El código no se guarda y no sale de aquí:**
- `credencialNativa('apple', { conCodigo: true })` devuelve `{ credencial, codigo }` **solo para el borrado**.
- `datosDeCredencial` sigue igual. La prueba que comprueba que no toma el nombre, y que hoy tampoco toma el código, no cambia; la nueva vía tiene su propia prueba.

### 6.4 DP-24.12: el orden y los estados

**Antes de nada** (si falla aquí, no se escribe la marca):
- hay red;
- Firebase está configurado;
- la sesión es `conCuenta`;
- **la cuenta terminó de bajar en este teléfono (D6)**;
- la reautenticación pasó **hace menos de 4 minutos**. Apple caduca a los 5 minutos y Firebase pide sesión reciente para `deleteUser`. Si alguien se queda más rato en «Última confirmación», al tocar «Borrar mi cuenta» vuelve a «Confirma que eres tú», sin más texto.

**El orden:**
1. La marca, fase `revocando`.
2. Se detienen la subida y la restauración (§6.2).
3. **Apple:** revocar.
4. **La nube:** fase `nube`. `rutasEnLaNube` + `pinConfig`, borradas con `writeBatch` en lotes de hasta 500 con `conLimite`; después se vuelve a enumerar y tiene que salir cero.
5. Fase `cuenta`: `deleteUser`.
6. Fase `telefono`: la limpieza de §7.
7. Se quita la marca.
8. Despedida.

**Los dos errores (D4):**
- **«No se borró nada» (`errorAntes`):** cualquier fallo en las precondiciones, en la reautenticación o **en la revocación de Apple**. En la revocación todavía no se ha tocado ni un documento, así que la frase es verdad. Se quita la marca y la subida se reanuda. Esto resuelve la contradicción entre DP-24.11 («si falla, se para y no se ha borrado nada») y DP-24.12 («si falla en el 3 o después…»), en el sentido del criterio automático 6. **Lo que aceptamos:** si la revocación sí llegó a Apple y solo se perdió la respuesta, la cuenta sigue y el próximo «Continuar con Apple» vuelve a pedir compartir u ocultar el correo. Entra a la misma cuenta, con los mismos días.
- **«No pudimos terminar…» (`errorDurante`):** cualquier fallo desde la fase `nube`. La marca se queda y lo local queda intacto.

**La máquina** (en `src/lib/borrarCuenta.js`, pura y probada sin React):

```
inicio ──Continuar──▶ verificar ──ok──▶ confirmar ──BORRAR──▶ borrando ──▶ despedida
  │  └─sin red─▶ (necesitaConexion, se queda en inicio)
  │              verificar ──cancelar hoja──▶ verificar (sin nota)
  │              verificar ──contraseña mal──▶ verificar (nota, sin bloqueo)
  │              confirmar ──otra palabra──▶ confirmar (confirmarNoCoincide)
  │              confirmar ──>4 min──▶ verificar
  │                                   borrando ──fallo antes de la nube──▶ errorAntes
  │                                   borrando ──fallo desde la nube───▶ errorDurante
  └── Quedarme (desde cualquiera, salvo borrando) ──▶ cerrado

al arrancar, con marca:  aMedias ──Terminar──▶ verificar … │ aMedias ──Conservar──▶ conservada
                         (sin usuario y fase ≥ cuenta)  ──▶ limpieza ──▶ despedida
```

- **Son nueve estados de pantalla**, donde SPEC_24 pedía cinco: `inicio`, `verificar`, `confirmar`, `borrando`, `despedida`, `errorAntes`, `errorDurante`, `aMedias` y `conservada`.
- **Dentro de `borrando` hay cuatro fases:** `revocando`, `nube`, `cuenta` y `telefono`. Sin rueda: solo «Borrando» en voz baja.
- **«Quedarme» no existe durante `borrando`**: no hay nada a medias que dejar. Nada más lleva ese estado.

**`deleteUser` puede fallar, y siempre cae en `errorDurante`.** Los motivos posibles (leídos en `@firebase/auth` 1.7.9):
- `auth/admin-restricted-operation`, si «Habilitar eliminación» está apagado en Firebase (Anexo C, paso 5);
- `auth/requires-recent-login`, que la regla de los 4 minutos evita;
- `auth/network-request-failed`;
- `auth/user-token-expired`, que es también lo que da una cuenta que ya no existe.

**Ninguno se enseña con código.** Por eso conviene marcar «Habilitar eliminación» **antes** de las pruebas: si no, la nube se borra y la cuenta no.

### 6.5 DP-24.13: al arrancar con la marca puesta

`resolverArranque` mira la marca del uid guardado **antes** de `entrarACuenta` y de `prepararArbol`:

| Situación al arrancar | Qué pasa |
|---|---|
| Marca con fase `telefono`, o fase `cuenta` y sin usuario de Firebase | La cuenta ya no existe: se termina la limpieza y se muestra la despedida |
| Marca y **hay** usuario de Firebase | «Tu cuenta quedó a medio borrar»: **Terminar de borrar** o **Conservar mi cuenta** |
| Marca con fase anterior a `cuenta` y **sin** usuario | **El caso que DP-24.13 no cubría** (D12). La sesión se cerró, pero la cuenta seguramente existe y la nube puede estar a medias. **Limpiar aquí perdería lo único que queda**, así que se muestra la misma pantalla «a medio borrar». Cualquiera de las dos salidas pide antes entrar con el método guardado en la marca (contraseña, Google o Apple), en la misma pantalla de verificación. Si Firebase dice que la cuenta no existe (`user-not-found`), se limpia y se despide. |

- **«Terminar de borrar»:** verificación → «Última confirmación» → sigue desde la marca. Todo es idempotente: borrar lo que ya no está no falla.
- **«Conservar mi cuenta»:**
  1. `reencolarTodo(uid)`, nueva en `local.js`. Lee todas las filas del uid y encola cada una como `put`, **saltándose las semillas (`esSemilla`), igual que `mudarUid`**. `enqueue` ya descarta las rutas locales.
  2. Se quita la marca y se reanuda `startSync`.
  3. Se ve `borrar.conservada`.
- **`setDoc` sin `merge` basta:** cada documento se reescribe entero tal como está en el teléfono, y uno que la nube aún conservaba queda igual.
- **Por qué hace falta D6:** si este teléfono no hubiera terminado de bajar la cuenta antes de borrar, «Conservar» no podría devolver lo que solo estaba en la nube. Con D6 esto no pasa.
- **Lo que aceptamos:** un documento que otro dispositivo hubiera escrito después, más nuevo que el de este teléfono, vuelve con la versión de este teléfono. Es la regla de siempre entre dos teléfonos.

### 6.6 DP-24.18: reautenticar sin el PIN

- **Sale a `lib/reautenticacion.js`** una función `reautenticarCuenta({ contrasena, conCodigoDeApple })`, con la misma lógica que hoy tiene `reautenticar` de `pin.js` menos `metodoDeRecuperacion`. Devuelve `{ ok, motivo, metodo, codigo? }`, y la traducción de errores (`motivoDeReautenticacion`) se va con ella.
- **`pin.js` sigue preguntando primero `metodoDeRecuperacion`** (eso sí es del PIN) y después llama a la de `lib/`. Hace lo mismo que hoy.
- **Las pruebas del PIN no cambian ninguna comprobación.** Lo más que puede cambiar es la ruta de un `vi.mock` si alguna prueba mockea `@/lib/reautenticacion` por dentro; lo veré al implementar y lo reportaré.
- **Contraseña equivocada:** «Esa contraseña no coincide con la de tu cuenta.», la misma frase del PIN, leída del mismo sitio. Sin conexión, `cuenta.error.sinConexion`; lo demás, `cuenta.error.generico`.

### 6.7 DP-24.16 y DP-24.17

- **«Ver mi suscripción»:** `window.open('https://apps.apple.com/account/subscriptions', '_blank')`.
  - En Capacitor 8.5.3 `createWebViewWith` lo entrega a `UIApplication.shared.open`, así que se abre en la App Store o en Safari **sin `allowNavigation` y sin `@capacitor/browser`**. Es el mismo camino que ya usa «Abrir Ajustes del teléfono».
  - Volver a Strivo te deja en la misma pantalla del borrado.
  - Las dos frases y el enlace solo se pintan con `esIPhone()`.
- **Otro dispositivo (D11):**
  - **El riesgo residual:** un token de otro teléfono vale hasta una hora después del borrado. Si ese teléfono tiene algo en su cola, puede volver a escribir documentos sueltos bajo `users/{uid}` (sin cuenta detrás y sin nadie que pueda leerlos).
  - **No se puede mitigar desde la app sin servidor:** las reglas no saben si el usuario existe.
  - **Se documenta en CLAUDE.md y en la nota para el aviso de privacidad (A9).** Si algún día hace falta, se limpia con un script de administración.

---

## 7. DP-24.14 · Inventario del teléfono (D5)

| Qué | Al borrar | Por qué |
|---|---|---|
| Filas y cola del almacén, **de todos los uid** (cuenta y `local-…` conservados) | **Se borran**: `vaciarAlmacen()`, un método nuevo en los dos adaptadores (IndexedDB vacía `records` y `syncQueue`; SQLite hace `DELETE FROM registros; DELETE FROM cola` en un lote) | Los `local-…` que deja una entrada a cuenta son lo escrito por la persona antes de entrar. Tras cerrar sesión no queda ningún otro uid de cuenta (salir los borra), así que vaciar todo no puede tocar lo de otra persona. **Es más simple y más seguro que enumerar uid**, que exigiría código nuevo en los dos adaptadores. |
| `strivo.uid.local` | **Se reemplaza** por un uid local nuevo (`fijarUid`, el único escritor) | Como al salir |
| `strivo.restaurado.*`, `strivo.mudanzaPendiente.*`, `strivo.borrado.*` | **Se borran todas**, de cualquier uid, en `localStorage` y en la tabla `claves` | Maquinaria de esa persona |
| Clave de Face ID (Keychain) | **Se borra**: `olvidarFaceId` | SPEC_23A |
| Avisos | **Se cancelan**: `apagarAvisos`, antes de cerrar la sesión | SPEC_22 |
| Sesión de Google del SDK nativo | **Se cierra**: `cerrarSesionNativa`, solo si entró con proveedor | DP-21.2.8 |
| Sesión de Firebase (`firebaseLocalStorageDb`) | **La cierra `deleteUser`** | |
| Copia vieja de IndexedDB en la app nativa (DP-17B.10) | **Se borra**: `indexedDB.deleteDatabase('strivo')`, tras cerrar su conexión, **solo si la sesión corre sobre SQLite** | Es lo escrito por la persona. Si la sesión cayó a IndexedDB, esa base es la viva y ya la vació la fila de arriba. |
| La base `Library/Strivo/strivo.sqlite` | **Se queda, vacía**. Ni se mueve, ni se renombra, ni se borra el archivo | §1.1 |
| `meta` de SQLite (`esquema`, `migradoEn`, `origen`, recuentos de la migración) | Se queda | Técnico, de nadie. Sin `migradoEn` se intentaría migrar otra vez. |
| `strivo.almacen` | Se queda | Pista técnica |
| El contador del umbral (en memoria) | Se da por cruzado | Así «Cerrar» lleva a P1 **sin el video**, también en la despedida de la retoma |

- **`apagarAvisos` y `olvidarFaceId` hoy son privadas de `salidaCuenta.js`.** Las muevo a `src/lib/limpiezaDelTelefono.js`, que usan las dos salidas, en lugar de copiarlas. `salirDeCuenta` no cambia de comportamiento.
- **Cerrar sesión no se toca:** sigue borrando solo su uid y nunca borra nada de la nube (criterio 21).
- **Después, como al cerrar sesión:** uid local nuevo, `prepararArbol` y a `/hoy`, donde `Entrada` encuentra el onboarding.
- **Para SPEC_25:** `Purchases.logOut()` queda marcado con un comentario en `borrarCuenta.js`, en la fase `telefono`.

**Lo que dirá el diagnóstico del almacén después de B5** (en tu iPhone, que migró en la M1 de 17B):
- `Almacén: SQLite`
- `Migración: correcta, {la fecha de tu M1}` (sigue en `meta`)
- `SQLite · registros: 4 · por subir: 0`: los cuatro de `shared/` que siembra un árbol nuevo. Saltar el onboarding los actualiza, no crea más.
- `IndexedDB · registros: 0 · por subir: 0`
- En el de avisos: `Avisos programados: 0`.

---

## 8. Plazos medidos y por medir

- **Exportar 300 y 2.000 días:** no se puede medir sin el código. Al implementar, una prueba de 2.000 días con un techo de **5 s en la Mac y 10 s en CI** (la holgura que propongo), y lo mido en el simulador con «Sembrar días de prueba».
  - **Estimación:** con 2.000 días, unos 4–6 MB de texto. `zipSync` comprime eso en menos de 1 s, y leer el almacén en otros pocos cientos de milisegundos.
- **Borrar 600 documentos:** son 14 enumeraciones (con su paginación) + 2 lotes + 14 enumeraciones de comprobación. Con un doble de 150 ms por llamada, unos 5 s. Lo mido en la prueba.
- **El simulador:** después de la aprobación puedo probar en el simulador, contra `strivo-fe04f` y con la build de diagnóstico:
  - la hoja de compartir, con captura de pantalla;
  - el borrado completo con una cuenta de correo de prueba que creo yo y borro al terminar;
  - **Google y Apple solo en tu iPhone.**
  - **Pido tu permiso para crear y borrar esa cuenta de prueba en tu proyecto de Firebase.**

---

## 9. Textos exactos que verás

Todo lo de la tabla del §6 de la instrucción entra tal cual. **Añado tres claves, que necesitan tu visto bueno**, y reutilizo cinco textos que ya existen.

**Nuevas:**

| Clave | Texto propuesto | Dónde |
|---|---|---|
| `perfil.tusDatos.titulo` | Tus datos | (está en la instrucción como `tusDatos.titulo`; va donde viven los títulos de los bloques) |
| `exportar.incompleto` | Puede que algo de lo que guardaste en la nube todavía no esté en este teléfono. | D7 |
| `borrar.entrarAntes` | Para seguir, entra de nuevo a tu cuenta. | La pantalla «a medio borrar» sin sesión (D12), encima de la verificación |

**Reutilizadas, sin duplicar:**
- «Continuar con Apple» y «Continuar con Google»: P7.
- «Contraseña»: `cuenta.formulario.contrasena`.
- «Esa contraseña no coincide con la de tu cuenta.»: el PIN.
- «Sin conexión. Inténtalo cuando vuelva.» y «Algo no salió bien. Inténtalo de nuevo en un momento.»: `cuenta.error`.

### 9.1 Pantalla por pantalla

**Tu perfil → «Tus datos»** (bloque)
- **Título:** Tus datos
- **Sección:** **Llevarme lo que escribí**, con el texto «Un archivo con todas tus entradas, tal como las escribiste. Es tuyo.» y el botón [Preparar mi archivo].
  - Al tocar: «Preparando tu archivo» (en voz baja, `aria-live`).
  - Sin entradas: «Todavía no hay entradas. El archivo tendrá solo tu perfil.»
  - Web, al terminar: «Listo. Tu archivo se descargó.»
  - Error: «No pudimos preparar tu archivo. Lo que escribiste sigue aquí. Inténtalo de nuevo.»
  - Cuenta sin bajar: «Puede que algo de lo que guardaste en la nube todavía no esté en este teléfono.»
- **Enlace secundario, solo con cuenta:** Borrar mi cuenta

**Borrar 1 · `inicio`**
- **Título:** Borrar mi cuenta
- Se borran tu cuenta, tus entradas y tus preferencias, aquí y en la nube. No hay forma de recuperarlas después.
- Si usas Strivo con esta cuenta en otro teléfono o en la web, lo que esté guardado ahí se queda ahí.
- *(solo iPhone)* Borrar tu cuenta no cancela tu suscripción. Si quieres cancelarla, se hace en los ajustes de tu teléfono. [Ver mi suscripción]
- *(solo iPhone)* Lo que pagaste queda ligado a tu Apple ID, no a tu cuenta de Strivo. Si más adelante creas otra cuenta, lo recuperas con “Restaurar compras”.
- **Botones:** [Antes, llevarme lo que escribí] [Continuar con el borrado] · Quedarme
- **Sin red, al tocar «Continuar»:** «Para borrar tu cuenta hace falta conexión. Lo que escribiste sigue aquí.»

**Borrar 2 · `verificar`**
- **Título:** Confirma que eres tú
- **Con correo:** «Te pedimos tu contraseña para asegurarnos de que eres tú.», el campo «Contraseña» y el botón [Continuar].
  - Si la contraseña no coincide: «Esa contraseña no coincide con la de tu cuenta.» (las veces que haga falta).
- **Con Google:** «Vuelve a entrar con Google para asegurarnos de que eres tú.» y [Continuar con Google].
- **Con Apple:** «Vuelve a entrar con Apple para asegurarnos de que eres tú.» y [Continuar con Apple].
- Cancelar la hoja deja la pantalla como estaba.
- **Errores:** «Sin conexión. Inténtalo cuando vuelva.» · «Algo no salió bien. Inténtalo de nuevo en un momento.»
- Quedarme

**Borrar 3 · `confirmar`**
- **Título:** Última confirmación
- Escribe BORRAR para confirmar. (campo con «BORRAR» de ejemplo)
- [Borrar mi cuenta] · Quedarme
- Con otra palabra: «Para confirmar, escribe la palabra BORRAR.»

**`borrando`:** Borrando

**`errorAntes`:** «No pudimos borrar tu cuenta. No se borró nada. Inténtalo de nuevo con conexión.» · Quedarme

**`errorDurante`:** «No pudimos terminar de borrar tu cuenta. Lo de este teléfono sigue aquí. Inténtalo de nuevo con conexión.» · [Terminar de borrar] · [Conservar mi cuenta]
- Es la misma salida que la pantalla «a medio borrar»: no hay un «Quedarme» que deje la marca puesta sin decidir.
- **Si prefieres** que aquí solo haya «Quedarme» (y la próxima apertura muestre «a medio borrar»), dímelo.

**`aMedias` (al abrir)**
- **Título:** Tu cuenta quedó a medio borrar
- La última vez no terminamos. Lo de este teléfono sigue aquí. Puedes terminar ahora o conservar tu cuenta.
- [Terminar de borrar] · [Conservar mi cuenta]
- **Sin sesión**, encima de la verificación: «Para seguir, entra de nuevo a tu cuenta.»

**`conservada`:** «Tu cuenta sigue aquí. Lo de este teléfono vuelve a la nube en cuanto haya conexión.» · [Cerrar]
- Esta pantalla reutiliza `borrar.cerrar` y no cambia ningún texto. Si prefieres que no tenga botón y lleve directo a Hoy, dímelo.

**`despedida`:** «Listo. Tu cuenta y tus entradas ya no existen. Gracias por haber estado aquí.» · [Cerrar] → P1 sin video.

### 9.2 Diagnóstico (`VITE_DIAG_BORRADO=1`, plegable, en «Tus datos»)

- **Encabezado plegable:** «Diagnóstico del borrado» / «Ocultar diagnóstico».
- **Fase:** `Borrado: sin empezar` · `revocando` · `borrando la nube` · `borrando la cuenta` · `limpiando el teléfono` · `terminado` · `detenido`.
- **Marca:** `Marca de borrado: sí` / `no`.
- **Nube:** `Nube: 612 encontrados · 612 borrados · lotes 2`.
- **Apple:** `Apple: revocado` / `falló` / `no aplica`.
- **Controles:** [Fallar antes de la nube] [Detenerse después de la nube] [Sembrar días de prueba].
  - Al sembrar: `Sembrados: 600 documentos` (300 días con mañana y noche).
- **Se combina** con los diagnósticos del almacén y de los avisos que ya existen.
- **Texto que añado:** «Detenerse después de la nube» deja la fase en `detenido` y la marca en `sí`, así que el panel muestra `Borrado: detenido`.

---

## 10. Archivos que voy a crear o tocar

**Nuevos:**

| Archivo | Qué |
|---|---|
| `src/lib/exportar/archivo.js` | Markdown, JSON, nombre del archivo |
| `src/lib/exportar/comprimir.js` | Zip; el único que importa `fflate` |
| `src/lib/exportar/entregar.js` | La entrega en la web |
| `src/lib/exportar/entregarNativo.js` | La entrega en el iPhone; el único que importa `@capacitor/share` |
| `src/diario/exportar.js` | El día como bloques |
| `src/breathing/data/exportar.js` y `src/breathing/lib/favoritos.js` | Respiración; `subtitulo` y `duracionCorta` movidos aquí |
| `src/perfil/exportar.js` | «Tú» |
| `src/exportarCuenta.js` | La composición |
| `src/lib/borrarCuenta.js` | Máquina, orden, marca, limpieza, retoma |
| `src/lib/limpiezaDelTelefono.js` | `apagarAvisos`, `olvidarFaceId` y `vaciarTelefono` |
| `src/lib/revocarApple.js` | La llamada directa del camino (c) |
| `src/components/perfil/TusDatos.jsx` | El bloque |
| `src/components/borrado/` | `CapaDeBorrado.jsx`, `AMedioBorrar.jsx`, `Despedida.jsx` y `DiagnosticoBorrado.jsx` |
| `src/components/diario/PuertaDelJournal.jsx` | La puerta del journal |
| Pruebas | `exportarCuenta.test.js`, `exportarMd.test.js`, `exportarJson.test.js`, `borrarCuenta.test.js`, `borrarCuentaRetoma.test.js`, `bloqueoConMarca.test.js`, `revocarApple.test.js`, `tusDatos.test.js`, `diagnosticoBorrado.test.js` |

**Tocados:**

| Archivo | Qué |
|---|---|
| `src/lib/db/local.js` | `leerTodoDelUid`, `reencolarTodo`, `vaciarAlmacen` |
| Los dos adaptadores | `vaciar()` |
| `src/lib/db/clavesDelTelefono.js` | La familia `strivo.borrado.*` y `quitarTodasLasClaves` |
| `src/lib/db/restaurar.js` | `rutasEnLaNube` y la guarda |
| `src/lib/db/sync.js` | La guarda por entrada, `startSync` y `scheduleRetry` |
| `src/lib/entradaCuenta.js` | La guarda de la mudanza |
| `src/lib/reautenticacion.js` | `reautenticarCuenta` |
| `src/lib/credencialNativa.js` | La vía con código |
| `src/diario/pin.js` | Usa la de `lib/` |
| `src/lib/salidaCuenta.js` | Importa la limpieza; no cambia lo que hace |
| `src/diario/manana.js` y `src/diario/noche.js` | Los bloques de versiones anteriores |
| `src/components/diario/VistaDiaCompleto.jsx` | Usa los bloques de versiones anteriores |
| `src/components/diario/BloqueoPin.jsx` | `onCerrar` en desbloqueo |
| `src/breathing/components/favoritos/FilaFavorito.jsx` | Importa lo movido |
| `src/perfil/bloques.js` | `tusDatos` |
| `src/components/perfil/Perfil.jsx` | `exportar` y `PuertaDelJournal` por props |
| `src/App.jsx` | Las pasa |
| `src/components/ArranqueProvisional.jsx` | La marca al arrancar, `borrarCuenta` en el contexto, la despedida |
| `src/lib/useSesion.js` | Si hace falta |
| Copy | `src/copy/index.js` y `src/copy/diagnostico.js` |
| Scripts | `scripts/lint-copy.js` (el namespace nuevo) |
| `eslint.config.js` | Las dos zonas nuevas |
| `firestore.rules` | **Solo el comentario** |
| Plugin `strivo-almacen` (si D1 = B) | `ios/…/StrivoAlmacen.swift`, sus definiciones TS, la parte web (no hace nada) y un XCTest |
| Dependencias | `package.json`, `package-lock.json`, `Package.swift` y `Package.resolved` (solo dependencias) |
| Documentación | `CLAUDE.md`, `docs/specs/SPEC_25_MURO_DE_PAGO.md` (la nota) y esta instrucción con su §9 |

- **`capacitor.config.json`: sin cambios.** Ni share ni el método nuevo lo necesitan.
- **`Info.plist`:** sin cambios.

**Pruebas nuevas previstas:** unas 60 entre 24A y 24B, sin contar las del diagnóstico. El mínimo pedido es 40.

---

## 11. Lo que necesito de ti para empezar

1. **Aprobar o corregir D1–D12** (§1), en especial **D1** (el quinto y sexto método de `strivo-almacen`, o `@capacitor/filesystem`) y **`fflate`**.
2. **Los textos:** las tres claves nuevas de §9, y las dos preguntas de `errorDurante` y `conservada`.
3. **El Anexo C hecho** (la clave `.p8` en Firebase y «Habilitar eliminación») antes de B5–B8.
4. **Permiso para crear y borrar una cuenta de correo de prueba** en `strivo-fe04f` desde el simulador.
5. **Elegir tu Team una vez** en el Xcode de `~/Developer/strivo-24` (Anexo A).
