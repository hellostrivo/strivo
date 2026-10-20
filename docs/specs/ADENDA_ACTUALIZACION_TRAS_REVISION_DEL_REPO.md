# Adenda — Actualización de los SPECS tras revisar el repo

**9 de septiembre de 2026 · commit `5efa09e` de la rama `strivo`**

Este archivo acompaña a los SPECS v1.0 del 3 de septiembre. Dice cuáles se cierran, cuáles se reescriben y qué cambia en los que siguen vigentes. **Donde esta adenda contradiga a un SPEC v1.0, manda la adenda.**

---

## 1. Estado real del repo

| | |
|---|---|
| Último commit | `5efa09e`, 9 sep 2026 |
| Rama de trabajo | `strivo` (Netlify publica de ahí; `main` sigue en el commit raíz de agosto) |
| Ramas vivas | `strivo`, `formia-paused` (protegida), `feat/onboarding-f1b`, `feat/onboarding-p1-p3c`, `phase-1-lumia-formia` |
| Archivos fuente | 258 blobs · 61 archivos de prueba · ~1,410 casos |
| Dependencias | React 18, Vite 5, Firebase 10, idb 8, react-router 6, Tailwind 3. **Sin Capacitor.** |
| Router | `HashRouter` — conveniente para Capacitor, no hay que cambiarlo |
| Reglas de Firestore | `firestore.rules` existe y es correcta |

## 2. SPECS que se cierran sin trabajo

### SPEC_18 — Paleta AM/PM · **HECHA**
El commit del 3 de septiembre («la paleta de los dos momentos pasa a la luz de un atardecer») ya sustituyó los ocho hexes de `src/styles/tokens-strivo.css` por la familia de atardecer:

```
--strivo-am-50:  #FAF3E9   arena
--strivo-am-100: #E8C9A4   ámbar
--strivo-am-200: #F2BE95   durazno quemado
--strivo-am-300: #F4DFC4   arena clara
--strivo-pm-50:  #F2EDE5
--strivo-pm-400: #8A7E9B   violeta apagado
--strivo-pm-500: #7A5A5F   terracota oscura / ciruela
--strivo-pm-700: #5D5260
```

Y el commit del 9 de septiembre puso el cromo en contratono en todas las secciones. Ni un rosa, ni un lila pastel.

**Residuo, y no es una SPEC sino una tarea de documentación (~1 h):**
- El encabezado de `tokens-strivo.css` sigue diciendo que «los ocho hexes son los mismos». Ya no lo son.
- `BRAND_MANUAL_STRIVO.md` sigue en v2.0 con la paleta anterior. Debe pasar a v2.1 con estos valores.
- `design-tokens.json` v1.1 está fechado el 11 de agosto y remite al manual; conviene revisar que no quede nada cromático duplicado.

### SPEC_20 — Onboarding mínimo · **SUPERADA**
No hace falta escribir un onboarding de dos pantallas: **existe uno de ocho**, construido en F-1B y afinado desde entonces.

Recorrido vigente (`src/onboarding/pasos.js`, versión 3): P1 Bienvenida · P2 Nombre · P2A Género (sub-paso, no cuenta en el indicador) · P3 Motivo · P5 Horarios · P6 Recordatorios · P7 Cuenta · P8 Cierre. Detrás, una presentación de cuatro tarjetas antes de entrar por primera vez. El umbral es el video de marca.

P4 (identidad central) fue retirado el 1 de septiembre. Los identificadores no se renumeraron a propósito, para no convertir en mentira lo guardado en `completedSteps`.

**Residuo: ninguno.** Lo que la v1.0 pedía —nombre y cuenta antes de entrar— está cubierto y con más cuidado del que pedía.

> Nota sobre la v1.0: aquel SPEC decía «si encuentras restos del plan de 8 pasos, no los implementes; son referencia para v1.1». Esa instrucción era incorrecta y queda anulada. El plan de 8 pasos **es** lo que está en producción.

## 3. SPECS reescritas

| SPEC | Antes | Ahora | Horas |
|---|---|---|---|
| **SPEC_17** | Construir cola de sync desde cero | La cola ya existe; el hueco real es que **Firestore es de solo escritura** | 14 → 11 |
| **SPEC_19** | Autenticación desde cero, retirando `ArranqueProvisional` | Media autenticación ya existe; falta la sesión. `ArranqueProvisional` **se queda** | 14 → 8 |

Archivos nuevos: `SPEC_17_RESTAURACION_Y_PERSISTENCIA.md` y `SPEC_19_SESION_REAL_Y_CUENTA.md`. Sustituyen a sus v1.0.

**El hallazgo que motiva la reescritura de SPEC_17:** en todo `src/` solo se usan `doc`, `setDoc` y `deleteDoc`. No hay un solo `getDoc` ni `getDocs`. Los datos suben y nunca bajan. Hoy, reinstalar la app es perder el diario aunque esté íntegro en la nube.

## 4. SPECS vigentes, con ajustes

### SPEC_21 — Capacitor iOS
- **`signInWithPopup` no sirve en WebView.** `src/onboarding/cuenta.js` lo usa para Google y Apple. Hay que migrar a redirect o al plugin nativo de autenticación. Es trabajo nuevo dentro de esta SPEC (~2 h).
- **`useWakeLock` ya existe** (`src/breathing/hooks/useWakeLock.js`). Verificar cómo se comporta en WKWebView; en nativo lo sustituye SPEC_23.
- **`HashRouter` juega a favor.** No hay que tocar el enrutado.
- **El video de apertura (`strivo_apertura.mp4`) deja de ser un problema offline**: en nativo va embebido en el binario. La deuda del precaché del service worker se resuelve sola para la app, aunque sigue viva para la PWA.
- DP-21.4 (quién produce el ícono) se simplifica: ya existe `Strivo_Logo_Oficial.svg`, un lockup vertical. Falta el símbolo suelto para ícono y favicon, ya anotado en CLAUDE.md.
- Horas: 12 → **14** por el cambio de OAuth.

### SPEC_22 — Recordatorios locales iOS
- **Sube de prioridad.** Hoy P6 pide el permiso del navegador, guarda `preferences.remindersEnabled` y **no entrega nada**. CLAUDE.md lo dice sin rodeos: «Listo. Te avisaremos a esas horas» promete algo que aún no ocurre.
- Alcance añadido: **un bloque de Recordatorios en Perfil**. Hoy las horas solo se pueden elegir durante el onboarding y nunca más.
- Alcance añadido: revisar el copy de P6 y P8 para que no prometa lo que aún no existe, hasta que exista.
- La lógica de permiso ya está en `src/onboarding/recordatorios.js` con cuatro estados (`sinSoporte`, `sinPedir`, `concedido`, `denegado`) y ninguno tratado como error. Se reutiliza tal cual.
- Horas: 10 → **12**.

### SPEC_23 — Biometría, háptica y audio en segundo plano
- El motor de audio es **mucho más grande** de lo que la v1.0 asumía: cinco fuentes ambientales procedurales (cristales, fuego, lluvia, olas, viento), mezclador, planificador e impulso, más dos visuales y favoritos. La apuesta de 23C vale más y cuesta más.
- Sigue en pie, y con más razón, la instrucción de **probar en iPhone si el `AudioContext` sobrevive con la pantalla bloqueada antes de construir nada de 23C**.
- CLAUDE.md declara que los recorridos de validación manual de Respiración nunca se hicieron —«las pruebas no oyen»— y cita un bug de una máscara SVG que dejó una visual invisible cuatro días con la suite en verde. Esa validación con audífonos entra en el plan de pruebas de esta SPEC.
- Horas: 10, sin cambio.

### SPEC_24 — Borrado de cuenta y exportación
- DP-24.3 se resuelve sola: Perfil existe con su patrón de bloques.
- El borrado local debe contemplar **el uid local además del autenticado** (`strivo.uid.local` en `localStorage`).
- Horas: 6, sin cambio.

### SPEC_25 — Muro de pago
- Perfil es el sitio del bloque de suscripción. Sin cambios de alcance.
- `fechaInicioPrueba` debe engancharse al onboarding existente (P7 o P8), no a un onboarding nuevo.
- Horas: 16, sin cambio.

### SPEC_26 y SPEC_27 — Android
- Sin cambios de alcance. SPEC_27 hereda la lógica de permisos de `src/onboarding/recordatorios.js` igual que SPEC_22.
- Horas: 12 y 10, sin cambio.

## 5. Listado final: 9 SPECS

| Orden | SPEC | Horas | Depende de |
|---|---|---|---|
| 1 | **SPEC_17 Fase A** — Restauración y conflictos | 6 | — |
| 2 | **SPEC_19** — Sesión real y cuenta | 8 | 17A |
| 3 | **SPEC_21** — Capacitor iOS (incl. OAuth sin popup) | 14 | 19 |
| 4 | **SPEC_17 Fase B** — Adaptador SQLite | 5 | 21 |
| 5 | **SPEC_22** — Recordatorios locales iOS + bloque en Perfil | 12 | 21 |
| 6 | **SPEC_23** — Biometría, háptica, audio en segundo plano | 10 | 21 |
| 7 | **SPEC_24** — Borrado de cuenta y exportación | 6 | 19, 17B |
| 8 | **SPEC_25** — Muro de pago con RevenueCat | 16 | 19, 21 |
| 9 | **SPEC_26** — Capacitor Android | 12 | 21, 17B, 25 |
| 10 | **SPEC_27** — Recordatorios Android | 10 | 22, 26 |

**Total: 99 horas** (antes 122). Más ~1 h de la tarea de documentación del manual de marca.

Se cierran SPEC_18 y SPEC_20. Se conserva la numeración: no se renumeran los SPECS por la misma razón por la que el onboarding no renumeró sus pasos.

## 6. Qué gana el calendario

Septiembre tenía 46 horas asignadas a SPEC_17A, 19, 20 y 18. Con 20 y 18 cerradas y 17 y 19 más cortas, septiembre baja a unas **14 horas de código**.

Tres opciones, en orden de recomendación:

1. **Adelantar SPEC_21 a septiembre.** Capacitor es el mayor riesgo desconocido del plan y es lo único que no se puede simular. Cuanto antes corra en un iPhone, antes se sabe qué se rompe. Requiere tener la Mac.
2. **Gastar el margen en los recorridos manuales que nunca se hicieron**, sobre todo Respiración con audífonos. CLAUDE.md ya avisa de lo que cuesta no hacerlos.
3. **Adelantar los trámites del Bloque B**, que no dependen de código: MARCANET, e.firma, denominación social.

Los hitos de hierro no se mueven. Lo que cambia es que ahora hay holgura donde antes no había.

## 7. Deudas del repo que ningún SPEC cubre

De la sección «Deuda consciente» de CLAUDE.md, lo que sigue vivo y sin dueño:

- **16 iconos emocionales**: decisión, no olvido. Material de marca. Backlog B-1.
- **Versión monocromática del logo en uso y sin aprobar**, hoy en más sitios que antes (cromo de las cinco pantallas y logo del umbral).
- **Frases sin revisión editorial.** El repertorio del día ya subió a 200; falta que alguien las lea con ojos de propietaria del producto. Lo mismo con los catálogos emocionales nuevos.
- **`mananaEscrita` y `nocheEscrita`** exportadas y probadas sin consumidores.
- **Con dos pestañas sobre el mismo día, gana la última escritura.** Asumido.
- **Recorridos de validación en teléfono real** sin hacer, incluida la pregunta de si cada recorrido cabe en uno o dos minutos.

Ninguna de estas bloquea el lanzamiento. Las dos primeras sí afectan a cómo se ve la ficha de la tienda.

## 8. Decisiones pendientes: de 35 a 29

Resueltas por el repo: DP-17.1, DP-17.2, DP-17.3, DP-18.1 (la paleta ya está), DP-19.2 (parcialmente), DP-20.1 y DP-20.2 (el onboarding ya decidió).

Nuevas: DP-17.4 (restauración sin cuenta), DP-19.4 (Service ID de Apple), y la pregunta de qué hacer con el margen de septiembre.
