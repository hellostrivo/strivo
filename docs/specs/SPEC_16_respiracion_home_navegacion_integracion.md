# SPEC_16 — Respiración: Home, navegación e integración final

**Proyecto:** Strivo · **Rama:** `phase-1-lumia-formia` · **Fase:** 1C — Respiración
**Depende de:** SPEC_13, SPEC_14, SPEC_15. **Los tres en verde antes de empezar.**
**Alcance:** tercer acceso en el Home, rutas, ensamblado de las pantallas, integración de extremo a extremo.

---

## 0. Encuadre

Aquí se ensambla todo y se conecta al Home de Strivo.

**La decisión conceptual que gobierna este spec:** Respiración **no es un tercer espacio**. Lumia y Formia son espacios: tienen identidad de marca, subtítulo, transición de entrada propia, y se habitan. Respiración es una **herramienta**: se toma, se usa, se suelta. Si los tres accesos se ven iguales, el modelo mental "dos espacios bajo Strivo" se rompe, y con él la arquitectura de marca que costó cerrar en agosto.

Por eso la jerarquía visual del Home tiene **dos niveles**, no tres elementos iguales.

**Lo que mejoramos frente a PBC:**
1. Entrada sin fricción: quien busca respirar puede estar mal en ese momento. Cero pantallas intermedias.
2. Un solo toque desde el Home hasta respirar con la última configuración.
3. Sin muros de pago que interrumpan.
4. Salida siempre visible y sin confirmación.

---

## 1. Requiere confirmación previa

> ⚠️ **Claude Code confirma antes de ejecutar.**

**1.1 El Home ya está implementado — ✅ CONFIRMADO (20 ago 2026).**

**Este spec NO crea el Home ni lo rediseña. Solo añade el tercer acceso.**

Alcance de la modificación del Home, taxativo:
- ✅ Añadir el acceso a Respiración, debajo de los dos existentes.
- ✅ Reducir el espacio vertical de la animación de bienvenida **únicamente si** RN-RE-NAV-05 no se cumple sin hacerlo, y solo lo mínimo necesario.
- ❌ No se toca la animación de bienvenida en sí (RN-RE-NAV-08).
- ❌ No se toca el diseño, tamaño, color, copy ni orden de las tarjetas de Lumia y Formia.
- ❌ No se toca la transición de entrada de Lumia ni la de Formia.
- ❌ No se refactoriza el componente Home "de paso".

Antes de escribir, **reportar sin modificar**:
- Ruta del componente Home y de las tarjetas de acceso.
- Cómo están construidas hoy las tarjetas de Lumia y Formia: ¿un componente compartido con props, o dos componentes separados?
- Qué tokens de color usa el Home hoy (insumo para §1.1 de SPEC_14).
- Qué altura ocupan hoy la animación de bienvenida y cada tarjeta, y cuánto espacio libre queda en un viewport de 360×640.

Ese último dato decide si RN-RE-NAV-05 se cumple sin tocar nada. **Si no cabe, reportar el conflicto y esperar OK antes de recortar la animación** — es un elemento de marca del que ya se tomó una decisión el 19 de agosto.

Sobre la construcción de la tarjeta: si Lumia y Formia comparten un componente, **crear uno nuevo para Respiración** en vez de añadirle una variante. Meter un tercer modo a un componente que hoy modela "espacio de marca" es la forma más rápida de que Respiración termine viéndose como un tercer espacio, que es justo lo que §0 quiere evitar.

**1.2 Router.** Reportar qué usa el repo: React Router, un enrutador propio, o estado. Este spec no impone ninguno.

**1.3 Transición de entrada de Lumia (SPEC_10).** Confirmar que la transición de frase aleatoria ya está condicionada a la entrada a Lumia y no se dispara al abrir la app (decisión del 19 de agosto). Respiración **no** debe heredarla (§4.2).

**1.4 Barra de navegación.** Confirmar cómo se comporta hoy la barra de dos espacios de SPEC_11 dentro de Lumia y Formia, y que la decisión "hay que volver al Home para cambiar de espacio" está implementada.

---

## 2. El Home con tres accesos

### 2.1 Jerarquía

El diagrama muestra el Home **resultante**. Los dos primeros niveles ya existen y se dibujan aquí solo como referencia de posición: lo único que este spec construye es el bloque marcado como Nivel 2.

```
┌─────────────────────────────────────┐
│                                     │
│      [animación de bienvenida]      │   ← sin texto, ya definida
│                                     │
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │          L U M I A          │   │   ← Nivel 1: espacio
│   │          Reflexión          │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │         F O R M I A         │   │   ← Nivel 1: espacio
│   │           Acción            │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   ╭─────────────────────────────╮   │
│   │  ◯   Respiración            │   │   ← Nivel 2: herramienta
│   ╰─────────────────────────────╯   │
│                                     │
└─────────────────────────────────────┘
```

### 2.2 Reglas del acceso a Respiración

| Regla | Enunciado |
|---|---|
| **RN-RE-NAV-01** | El acceso a Respiración es **visualmente subordinado**: altura ≈ 40 % de una tarjeta de espacio, sin subtítulo de marca, esquinas más redondeadas (píldora), tipografía de un peso menos que Lumia/Formia. |
| **RN-RE-NAV-02** | **No lleva subtítulo descriptivo.** Lumia y Formia lo llevan porque son marcas ("Lumia · Reflexión"). Respiración es una función y su nombre ya la describe. Añadirle subtítulo la asciende de categoría. |
| **RN-RE-NAV-03** | Color: escala **Strivo madre**, no Lumia ni Formia. Lleva un ícono discreto (círculo con anillo, evocando la guía visual) a la izquierda del texto. |
| **RN-RE-NAV-04** | Posición: siempre debajo de los dos espacios. Nunca entre ellos, nunca arriba. |
| **RN-RE-NAV-05** | Siempre visible sin desplazar la pantalla en un viewport de 360×640. Si no cabe, se reduce el espacio vertical de la animación de bienvenida, **nunca** se manda Respiración abajo del pliegue. Alguien que necesita respirar no debe tener que buscar. |
| **RN-RE-NAV-06** | Área táctil ≥ 56 px de alto. |
| **RN-RE-NAV-07** | Contraste AAA sobre el fondo del Home, verificado por `lint:contraste`. |
| **RN-RE-NAV-08** | La animación de bienvenida del Home **no se toca**. Este spec no la rediseña. Su altura solo puede reducirse si RN-RE-NAV-05 lo exige, previa confirmación (§1.1). |
| **RN-RE-NAV-08b** | Las tarjetas de Lumia y Formia quedan **byte por byte iguales**: mismo componente, mismas props, mismo copy, mismo orden. Cualquier diferencia visual en ellas tras este spec es una regresión. |
| **RN-RE-NAV-08c** | El acceso a Respiración usa un componente **propio**, no una variante del componente de tarjeta de espacio (§1.1). |

---

## 3. Rutas y estructura de pantallas

### 3.1 Rutas

```
/                       Home de Strivo
/lumia/*                (existente)
/formia/*               (existente)
/respiracion            Configuración y arranque
/respiracion/sesion     Sesión en curso
```

| Regla | Enunciado |
|---|---|
| **RN-RE-NAV-09** | `/respiracion/sesion` **no es enlazable directamente**. Al entrar sin configuración en memoria, redirige a `/respiracion`. Evita arrancar una sesión desde un enlace o desde el historial del navegador. |
| **RN-RE-NAV-10** | El botón atrás del navegador desde `/respiracion/sesion` **pausa la sesión** y vuelve a `/respiracion`. No la destruye. Al volver a entrar, se retoma donde estaba. |
| **RN-RE-NAV-11** | El botón atrás desde `/respiracion` va al Home y libera todos los recursos de audio (RN-RE-SND-22). |
| **RN-RE-NAV-12** | **Dentro de Respiración no hay barra de navegación.** Ni la de dos espacios ni ninguna otra. Coherente con el modelo Home-céntrico: para ir a otro lado, se sale al Home. |

### 3.2 Estructura de la pantalla de configuración `/respiracion`

```
┌─────────────────────────────────────┐
│  ✕                              ⓘ  │   ← salir · nota de seguridad
│                                     │
│         [vista previa de la         │
│          visual elegida]            │   ← estado `inactivo` de SPEC_14
│                                     │
│      ─── Calma 5-5-3 ───            │
│   Inhalas, exhalas, y dejas una     │
│   pausa antes de volver a empezar.  │
│                                     │
│  ◉ Círculo      ○ Línea             │   ← visual
│                                     │
│  ┌─── Ritmo ──────────────────┐     │
│  │ Inhala      5,0 s   − +    │     │
│  │ Sostén      0,0 s   − +    │     │
│  │ Exhala      5,0 s   − +    │     │
│  │ Descansa    3,0 s   − +    │     │
│  └────────────────────────────┘     │
│                                     │
│  ┌─── Tiempo ─────────────────┐     │
│  │  Por tiempo ▾   3 minutos  │     │
│  └────────────────────────────┘     │
│                                     │
│  ┌─── Sonido ─────────────────┐     │
│  │  Lluvia        Volumen 60% │     │
│  └────────────────────────────┘     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         Empezar             │   │   ← acción principal, fija abajo
│  └─────────────────────────────┘   │
│                                     │
│  ♡ Guardar esta combinación         │
│                                     │
│  ─── Guardadas ───                  │
│  [lista de favoritos]               │
│  ─── Últimas veces ───              │
│  [lista de recientes]               │
└─────────────────────────────────────┘
```

| Regla | Enunciado |
|---|---|
| **RN-RE-NAV-13** | Selector de patrón: carrusel horizontal o lista desplegable con los 7 del catálogo. Al cambiar, la vista previa y los controles de ritmo se actualizan con un cruce de 300 ms. |
| **RN-RE-NAV-14** | "Empezar" está **fijo en la parte baja** y siempre visible, sin depender del desplazamiento. Es la única acción que importa. |
| **RN-RE-NAV-15** | Los favoritos y recientes van **debajo** de "Empezar". Quien llega con prisa no debe atravesar listas para respirar. |
| **RN-RE-NAV-16** | Al entrar, todo llega precargado con la última configuración usada (`ultimo*` de las preferencias). Es un toque desde el Home hasta respirar. |
| **RN-RE-NAV-17** | La primera vez de todas, el patrón precargado es `entrada-suave` (sin retenciones), no `calma-553`. Empezar con retenciones sin haberlo hecho nunca es innecesariamente exigente. Después manda `ultimoPatronId`. |
| **RN-RE-NAV-18** | Editar un tiempo con `−`/`+`: paso de 0,5 s, pulsación mantenida acelera tras 600 ms. El valor se muestra siempre con un decimal (`5,0 s`), con **coma decimal** (locale es-MX). |
| **RN-RE-NAV-19** | Con el patrón `caja`, los cuatro controles se sustituyen por **uno solo** ("Cada lado"), y editarlo mueve las cuatro fases. Si la persona pide edición separada, se convierte en `personalizado` (RN-RE-MOT-08) con un aviso de una línea. |
| **RN-RE-NAV-20** | Un patrón inválido nunca deshabilita "Empezar". `validarPatron` corrige y se muestra el aviso. Nada bloquea (RN-RE-MOT-07). |

### 3.3 Estructura de la pantalla de sesión `/respiracion/sesion`

```
┌─────────────────────────────────────┐
│  ✕                                  │   ← salir
│                                     │
│                                     │
│                                     │
│         [ GUÍA VISUAL ]             │   ← dominante
│                                     │
│           Inhala                    │
│              3                      │
│                                     │
│                                     │
│                                     │
│          ⏸  Pausar                  │
│                                     │
│      ○ ○ ● ○ ○   ·   1:42           │   ← progreso discreto
└─────────────────────────────────────┘
```

| Regla | Enunciado |
|---|---|
| **RN-RE-NAV-21** | **La visual domina.** Todo lo demás es periférico: opacidad ≤ 0,55, tamaño ≤ 14 px salvo la etiqueta de fase. |
| **RN-RE-NAV-22** | Solo dos controles: pausar/seguir y salir. Nada de ajustes en vivo salvo lo permitido en RN-RE-NAV-24. |
| **RN-RE-NAV-23** | **Los controles se atenúan a opacidad 0,25 tras 6 s sin interacción**, y vuelven a plena opacidad al tocar en cualquier parte. Siguen siendo tocables mientras están atenuados. Es lo que permite cerrar los ojos sin que la pantalla grite. |
| **RN-RE-NAV-24** | Ajustes permitidos en vivo, en un panel que se desliza desde abajo sin detener la sesión: cambiar de visual, cambiar de sonido, ajustar volúmenes. **No** se puede cambiar el patrón ni la duración: eso es empezar otra sesión. |
| **RN-RE-NAV-25** | Progreso: en modo `ciclos`, puntos (llenos los completados). En modo `minutos`, tiempo transcurrido. En modo `abierta`, solo tiempo transcurrido sin meta. Opacidad 0,40. |
| **RN-RE-NAV-26** | En `cerrando`, el indicador de progreso **no cambia** de comportamiento (coherente con §9 de SPEC_14: no se avisa del último ciclo). |
| **RN-RE-NAV-27** | Salir (`✕`) durante una sesión activa **no pide confirmación**. Pide confirmación quien quiere retener; Strivo no retiene. Se llama `terminar()` y se sale con fade-out de 800 ms. |
| **RN-RE-NAV-28** | Wake Lock activo mientras la sesión está en `activo` o `cerrando`, si `mantenerPantallaEncendida` está en `true`. Se libera al pausar, completar o salir. Degradación silenciosa donde no exista la API. |

### 3.4 Pantalla de cierre

Reemplaza la sesión al llegar a `completado`.

```
        Listo

   Respiraste 14 veces.

   ┌────────────────┐
   │   Otra vez     │
   └────────────────┘
     Volver al inicio
```

| Regla | Enunciado |
|---|---|
| **RN-RE-NAV-29** | Aparece con un cruce de 900 ms, el mismo gesto de cierre del Ritual de Noche. Es la firma de cierre de Strivo. |
| **RN-RE-NAV-30** | **Sin felicitación, sin racha, sin puntaje, sin "¡bien hecho!".** Se enuncia el hecho y ya. Coherente con la decisión del 19 de agosto de eliminar "logros" como concepto estructurado. |
| **RN-RE-NAV-31** | "Otra vez" reinicia con la misma configuración, pasando por `acomodando`. |
| **RN-RE-NAV-32** | Si la sesión duró menos de un ciclo completo, no se muestra el resumen numérico; solo "Listo" y las dos acciones. Decir "respiraste 0 veces" es absurdo. |
| **RN-RE-NAV-33** | Al llegar a `completado` se persiste: `sesiones`, `recientes` y `ultimo*` en preferencias. |

---

## 4. Transición de entrada

### 4.1 Comportamiento

Home → toque en Respiración → **cruce de 600 ms** directo a `/respiracion`.

### 4.2 Por qué no lleva transición de frase

| Regla | Enunciado |
|---|---|
| **RN-RE-NAV-34** | Respiración **no** hereda la transición de luz tenue + frase de SPEC_10, que es de Lumia. Tampoco tendrá la propia de Formia. |

Razón, y es la de fondo de todo este spec: quien entra a Lumia va a reflexionar y una frase lo prepara. Quien entra a Respiración **puede estar mal en ese momento**. Interponer una pantalla contemplativa entre esa persona y el ejercicio es fricción exactamente en el peor momento posible. La transición de 600 ms es suficiente para que no se sienta un salto, y lo bastante breve para no ser un obstáculo.

Es también donde más nos separamos de PBC, que mete su pantalla de inicio con anuncios entre la apertura y el ejercicio.

- **RN-RE-NAV-35:** el aviso de seguridad de la primera vez (RN-RE-COPY-01) aparece **dentro** de `/respiracion`, como tarjeta descartable. **No** es una pantalla previa ni un modal bloqueante.

---

## 5. Integración con lo existente

| Regla | Enunciado |
|---|---|
| **RN-RE-NAV-36** | La respiración diaria de Lumia (SPEC_08, 5-5-3 ×3) **sigue exactamente igual**. No se sustituye, no se enlaza a Respiración, no cambia de sitio. RN-LU-RESP-01/02/03 intactas. |
| **RN-RE-NAV-37** | **No hay puente entre Lumia/Formia y Respiración.** Ni un enlace, ni una sugerencia, ni un "¿quieres respirar más?". Extiende RN-RE-NAV-12 y la decisión §C7.7.3 (no hay puente de Hoy hacia Formia): los cruces se hacen por el Home y solo por el Home. |
| **RN-RE-NAV-38** | Los favoritos de Respiración **no** aparecen en ninguna pantalla de Lumia ni de Formia. |
| **RN-RE-NAV-39** | Las sesiones de respiración **no** aparecen en el Historial de Lumia ni en el Progreso de Formia. Son datos de `breathing/`, y `breathing/` no cruza. |
| **RN-RE-NAV-40** | El lint de la matriz de imports (§4.2 de SPEC_13) debe seguir verde al terminar. Un import cruzado es un fallo de compilación, no una advertencia. |

---

## 6. Copy adicional

Añadir a `respiracion` en `src/copy/index.js`:

```js
home: {
  acceso: 'Respiración'
},

configuracion: {
  titulo: 'Respiración',
  visual: 'Cómo lo quieres ver',
  visualCirculo: 'Círculo',
  visualLinea: 'Línea',
  ritmo: 'Ritmo',
  ladoUnico: 'Cada lado',
  cajaModificada: 'Al cambiar un tiempo por separado, esto deja de ser respiración en caja.',
  tiempo: 'Tiempo',
  info: 'Cómo usar esto'
},

sesion: {
  ajustes: 'Ajustar',
  cerrarAjustes: 'Listo',
  progresoCiclos: '{completados} de {total}',
  progresoAbierta: '{tiempo}'
},

accesibilidad: {
  salir: 'Salir de respiración',
  pausar: 'Pausar la sesión',
  reanudar: 'Seguir con la sesión',
  aumentarFase: 'Aumentar el tiempo de {fase}',
  reducirFase: 'Reducir el tiempo de {fase}',
  abrirAjustes: 'Abrir ajustes de la sesión',
  vistaPrevia: 'Vista previa del ritmo {patron}'
}
```

---

## 7. Accesibilidad de la navegación

| Regla | Enunciado |
|---|---|
| **RN-RE-NAV-41** | Al entrar a `/respiracion`, el foco va al encabezado. Al entrar a `/respiracion/sesion`, al control de pausa. |
| **RN-RE-NAV-42** | Toda la configuración es operable con teclado: tabulación, flechas para los `−`/`+`, espacio y enter para activar. |
| **RN-RE-NAV-43** | Los `−`/`+` son `<button>` con `aria-label` de `accesibilidad.aumentarFase` / `reducirFase`, y el valor se expone con `aria-live="polite"` en el contenedor del grupo, no en cada botón. |
| **RN-RE-NAV-44** | El panel de ajustes en vivo es una trampa de foco mientras está abierto, y `Escape` lo cierra. |
| **RN-RE-NAV-45** | RN-RE-NAV-23 (atenuación de controles) **no aplica** cuando hay navegación por teclado o lector de pantalla activo. Los controles se mantienen a plena opacidad. Se detecta por `:focus-visible` en el documento. |
| **RN-RE-NAV-46** | Contraste AAA en todo texto de las tres pantallas, verificado por `lint:contraste`. Incluye los estados atenuados: opacidad 0,25 sobre el fondo debe seguir cumpliendo para el texto que quede visible, o el texto se oculta del todo en vez de quedar ilegible. |

---

## 8. Casos límite

| # | Caso | Comportamiento |
|---|---|---|
| 8.1 | Entrada directa a `/respiracion/sesion` (enlace o recarga) | Redirige a `/respiracion` (RN-RE-NAV-09). |
| 8.2 | Recarga de la página a mitad de sesión | La sesión se pierde. Al volver, `/respiracion` con la última configuración cargada. **No** se intenta restaurar una sesión a medias: fingir continuidad sería falso. |
| 8.3 | Atrás del navegador durante la sesión | Pausa y vuelve a configuración (RN-RE-NAV-10). |
| 8.4 | Adelante del navegador tras el atrás | Vuelve a la sesión pausada, en su punto exacto. |
| 8.5 | El tercer acceso no cabe sobre el pliegue en 360×640 | Reportar el conflicto y **esperar OK** antes de recortar la animación de bienvenida (§1.1). No decidirlo por cuenta propia. |
| 8.6 | Viewport de 360×640 | Los tres accesos visibles sin desplazamiento (RN-RE-NAV-05). Test explícito con ese viewport. |
| 8.7 | Viewport de 320×568 | Se permite desplazamiento en el Home, pero **Respiración debe seguir sobre el pliegue**. Si no cabe, se reduce la animación de bienvenida. |
| 8.8 | Teclado abierto en el diálogo de guardar, en pantalla corta | El diálogo se desplaza para que el campo y los botones queden visibles. |
| 8.9 | Rotación a horizontal durante la sesión | La visual se recalcula (caso 11.5 de SPEC_14). El ritmo **no se interrumpe** ni se reinicia. |
| 8.10 | Sesión activa y la persona toca el acceso del sistema a otra app y vuelve | La sesión sigue si la ausencia fue menor a un ciclo; si fue mayor, queda en `pausado` (caso 9.4 de SPEC_13). |
| 8.11 | Primera vez absoluta | Aviso de seguridad + patrón `entrada-suave` + `silencio` + visual `circulo` + 3 minutos. |
| 8.12 | Wake Lock rechazado por el navegador | Se continúa sin él, sin mensaje de error. La pantalla puede apagarse; el audio sigue (RN-RE-SND-23). |
| 8.13 | Toque en "Empezar" dos veces rápido | Idempotente: la segunda no crea una segunda sesión (RN-RE-MOT idempotencia del reloj). |
| 8.14 | Sesión completada y "Otra vez" tocado 5 veces seguidas | Cada una reinicia limpiamente sin acumular nodos de audio ni relojes. |

---

## 9. Archivos

### Crear
```
src/breathing/PantallaRespiracion.jsx          // /respiracion — configuración
src/breathing/PantallaSesion.jsx               // /respiracion/sesion
src/breathing/components/CierreSesion.jsx
src/breathing/components/SelectorPatron.jsx
src/breathing/components/ControlesRitmo.jsx
src/breathing/components/SelectorVisual.jsx
src/breathing/components/SelectorDuracion.jsx
src/breathing/components/AvisoSeguridad.jsx
src/breathing/components/PanelAjustesVivo.jsx
src/breathing/components/ProgresoSesion.jsx
src/breathing/components/AccesoRespiracion.jsx  // el botón del Home, componente propio (RN-RE-NAV-08c)
src/breathing/hooks/useSesionRespiracion.js    // orquesta motor + audio + persistencia
src/breathing/hooks/useWakeLock.js
```

### Modificar
```
Home de Strivo            → SOLO montar el tercer acceso (§1.1). Nada más de ese archivo.
Configuración de rutas    → /respiracion y /respiracion/sesion
src/copy/index.js         → namespaces home, configuracion, sesion, accesibilidad
CLAUDE.md                 → reglas RN-RE-NAV-*
INDEX.md                  → Fase 1C completada
ROADMAP.md                → cierre de Fase 1C
```

### No tocar
```
src/components/lumia/**                ✗
src/components/formia/**               ✗
src/shared/respiracion/**              ✗ (SPEC_13)
src/breathing/components/visuales/**   ✗ (SPEC_14)
src/breathing/audio/**                 ✗ (SPEC_15)
Tests de SPEC_08 a SPEC_15             ✗
```

---

## 10. Criterios de aceptación

| # | Criterio |
|---|---|
| 1 | Los ~780 tests previos siguen verdes. |
| 2 | El Home muestra tres accesos con la jerarquía de §2.1: Respiración con altura ≈ 40 % de una tarjeta de espacio y sin subtítulo (RN-RE-NAV-01, 02). |
| 3 | En viewport 360×640, los tres accesos son visibles sin desplazamiento (RN-RE-NAV-05). |
| 4 | En viewport 320×568, Respiración sigue sobre el pliegue (caso 8.7). |
| 5 | El acceso a Respiración usa tokens Strivo, no Lumia ni Formia. Test que verifica las variables CSS aplicadas (RN-RE-NAV-03). |
| 5b | Las tarjetas de Lumia y Formia no cambiaron: mismo componente, props, copy y orden que antes del spec (RN-RE-NAV-08b). |
| 5c | La animación de bienvenida no fue modificada; si su altura se redujo, hubo confirmación previa registrada (RN-RE-NAV-08). |
| 5d | El acceso es un componente propio, no una variante del componente de tarjeta de espacio (RN-RE-NAV-08c). |
| 6 | Del Home a `/respiracion` hay un cruce de 600 ms, sin pantalla de frase (RN-RE-NAV-34). |
| 7 | Entrar directo a `/respiracion/sesion` redirige a `/respiracion` (RN-RE-NAV-09). |
| 8 | Atrás desde la sesión pausa sin destruir; adelante retoma el punto exacto (RN-RE-NAV-10, casos 8.3 y 8.4). |
| 9 | No hay barra de navegación en ninguna de las dos pantallas de Respiración (RN-RE-NAV-12). |
| 10 | Al entrar, la configuración llega precargada con `ultimo*` (RN-RE-NAV-16). |
| 11 | En la primera vez absoluta: `entrada-suave`, `silencio`, `circulo`, 3 minutos, y aviso de seguridad visible (RN-RE-NAV-17, caso 8.11). |
| 12 | El aviso de seguridad aparece una sola vez y luego solo desde el ícono de información (RN-RE-COPY-01, 02). |
| 13 | El aviso de seguridad es descartable y no bloquea la interacción con el resto de la pantalla (RN-RE-COPY-03). |
| 14 | "Empezar" permanece visible sin depender del desplazamiento (RN-RE-NAV-14). |
| 15 | Favoritos y recientes están debajo de "Empezar" en el orden del DOM (RN-RE-NAV-15). |
| 16 | Con `caja`, se muestra un solo control; editar una fase por separado convierte a `personalizado` y muestra el aviso (RN-RE-NAV-19). |
| 17 | Un patrón inválido no deshabilita "Empezar"; se corrige y se avisa (RN-RE-NAV-20). |
| 18 | Los tiempos se muestran con coma decimal (`5,0 s`), no con punto (RN-RE-NAV-18). |
| 19 | Pulsación mantenida en `−`/`+` acelera tras 600 ms (RN-RE-NAV-18). |
| 20 | En sesión, los controles bajan a opacidad 0,25 tras 6 s y vuelven al tocar; siguen siendo tocables atenuados (RN-RE-NAV-23). |
| 21 | Con navegación por teclado activa, los controles **no** se atenúan (RN-RE-NAV-45). |
| 22 | El panel de ajustes en vivo cambia visual, sonido y volúmenes **sin interrumpir el ritmo**: `cicloActual` y `progresoFase` se preservan (RN-RE-NAV-24). |
| 23 | El panel de ajustes en vivo **no** ofrece cambiar patrón ni duración (RN-RE-NAV-24). |
| 24 | Salir durante la sesión no pide confirmación y hace fade-out de 800 ms (RN-RE-NAV-27). |
| 25 | Wake Lock se solicita en `activo` y se libera en `pausado`, `completado` y al salir (RN-RE-NAV-28). |
| 26 | Wake Lock no disponible → la sesión funciona igual, sin mensaje de error (caso 8.12). |
| 27 | La pantalla de cierre aparece con cruce de 900 ms (RN-RE-NAV-29). |
| 28 | La pantalla de cierre no contiene felicitación, racha ni puntaje. Test que verifica ausencia de esos términos en el copy renderizado (RN-RE-NAV-30). |
| 29 | Sesión de menos de un ciclo: sin resumen numérico (RN-RE-NAV-32). |
| 30 | Al completar se persisten sesión, reciente y `ultimo*` (RN-RE-NAV-33). |
| 31 | "Otra vez" cinco veces seguidas no acumula nodos de audio ni relojes (caso 8.14). |
| 32 | Doble toque rápido en "Empezar" crea una sola sesión (caso 8.13). |
| 33 | Rotación durante la sesión no interrumpe el ritmo (caso 8.9). |
| 34 | Recarga a mitad de sesión lleva a `/respiracion`, sin intentar restaurar (caso 8.2). |
| 35 | Ninguna pantalla de Lumia ni de Formia muestra datos de respiración (RN-RE-NAV-38, 39). |
| 36 | La respiración diaria de Lumia funciona idéntica a antes: sus tests de SPEC_08 verdes sin modificar (RN-RE-NAV-36). |
| 37 | El lint de la matriz de imports es verde; un import de prueba `breathing/ → lumia/` falla la compilación (RN-RE-NAV-40). |
| 38 | Foco inicial correcto en ambas pantallas (RN-RE-NAV-41). |
| 39 | Toda la configuración es operable solo con teclado, de principio a fin (RN-RE-NAV-42). |
| 40 | El panel de ajustes atrapa el foco y `Escape` lo cierra (RN-RE-NAV-44). |
| 41 | `npm run lint:contraste` verde, incluyendo los estados atenuados (RN-RE-NAV-46). |
| 42 | Ningún string literal visible fuera de `copy/index.js` en todo `src/breathing/**`. |
| 43 | `npm run lint`, `lint:copy`, `lint:contraste`, `format:check`, `build`: los cinco verdes. |

**Meta de tests nuevos: 85–105.** Total esperado tras SPEC_16: **~875 verdes.**

---

## 11. Recorrido de extremo a extremo (validación manual obligatoria)

Estos no los cubre ningún test. Hacerlos en navegador **y** en celular vía Netlify.

**Recorrido 1 — Primera vez**
Abrir la app → Home → Respiración → ver el aviso de seguridad → descartarlo → confirmar `entrada-suave` precargado → Empezar → acomodo de 3 s → 3 minutos de sesión → cierre → Volver al inicio.
*A verificar:* ¿algo se siente exigente, confuso o demasiado largo antes de respirar?

**Recorrido 2 — Vuelta**
Abrir → Respiración → confirmar que llegó la configuración de la vez anterior → Empezar de inmediato.
*A verificar:* ¿es realmente un toque desde el Home hasta respirar?

**Recorrido 3 — Configurar y guardar**
Cambiar a `cuatro-siete-ocho` → cambiar a visual línea → poner Lluvia al 70 % → duración 10 minutos → Guardar como "Antes de dormir" → salir → volver → cargar el favorito.
*A verificar:* ¿se restauró todo? ¿el nombre sugerido fue útil?

**Recorrido 4 — Sesión larga con ojos cerrados**
15 minutos con guía sonora activa y ambiente. Cerrar los ojos de verdad.
*A verificar:* ¿la guía sonora basta para seguir el ritmo sin mirar? Es la prueba que decide si el audio está bien calibrado.

**Recorrido 5 — Interrupciones**
Pausar a mitad de exhalación → esperar 30 s → seguir. Cambiar a otra app 2 minutos y volver. Rotar el teléfono. Bloquear la pantalla 1 minuto.
*A verificar:* ¿alguna recuperación se siente rota, brusca o deshonesta?

**Recorrido 6 — Movimiento reducido**
Activar la preferencia en el sistema y repetir el recorrido 1 completo.
*A verificar:* ¿sigue siendo una herramienta usable o quedó inservible?

**Recorrido 7 — Solo teclado**
Recorrido 1 completo sin tocar la pantalla ni el ratón.
*A verificar:* ¿se puede llegar a respirar?

**Recorrido 8 — El Home no se rompió**
Abrir el Home y compararlo con una captura previa al spec. Entrar a Lumia y a Formia, salir y volver.
*A verificar:* ¿los dos espacios se ven y se comportan idénticos? ¿El tercer acceso se lee como herramienta y no como un tercer espacio? Esta última pregunta es la que decide si el spec cumplió su propósito.

---

## 12. Definición de hecho — cierre de Fase 1C

- [ ] §1.1 reportado (estructura del Home actual, alturas, tokens) y §1.2–1.4 confirmados
- [ ] 47 criterios verificados con evidencia
- [ ] 8 recorridos manuales completados y comentados
- [ ] Los seis comandos de verificación en verde
- [ ] `CLAUDE.md` con todas las reglas RN-RE-*
- [ ] `INDEX.md` y `ROADMAP.md` actualizados con Fase 1C
- [ ] Métricas finales reportadas: total de tests, cobertura, tamaño del build antes/después
- [ ] Commit hecho, **sin push**

**Nota sobre el tamaño del build:** los sonidos son 100 % sintetizados (decisión de SPEC_15 §1), así que el aumento del bundle debe ser **solo código**. Reportar el delta. Un salto de megabytes significa que se coló un activo de audio: eso viola RN-RE-SND-00 y hay que revertirlo, no justificarlo.
