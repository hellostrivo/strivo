# ROADMAP — Strivo

**Última actualización:** 25 ago 2026 · **Fuente:** Blueprint de Producto v5.0, §16

Este documento **no es una fuente independiente**: reproduce el capítulo 16 del Blueprint v5.0
(`docs/blueprint/Strivo_Blueprint_de_Producto_v5_0_24-08-2026.md`). Si los dos discrepan, manda el
blueprint y este archivo se corrige.

---

## 1. Fases

### F-0 — Repliegue a una sola app · *en curso*

**Objetivo:** que la rama activa contenga únicamente Strivo.

- Rama de resguardo creada y protegida.
- Rama activa depurada: código, rutas, componentes, dependencias, estilos, textos, pruebas y
  documentación.
- Renombrado completo de identificadores, rutas y tokens.
- Documentación del repositorio actualizada a esta versión del Blueprint.
- **Cierre:** los seis comandos en verde y CA-11 cumplido.

*Los pasos operativos están en el documento hermano de separación técnica
(`docs/Strivo_Plan_de_Separacion_Tecnica_v1_24-08-2026.md`).*

### F-1 — Entrada real · *siguiente*

Onboarding O1–O5, autenticación real en sustitución del arranque provisional, y perfil y ajustes
editables.

**Cierre:** una persona nueva instala, se registra, escribe su primera mañana y vuelve al día
siguiente en su propio dispositivo.

### F-2 — Prueba con personas · *tras F-1*

Cinco personas externas, observación sin guiar, recogida de vocabulario espontáneo.

**Cierre:** cuatro de cinco describen la experiencia con palabras del campo semántico de calma,
cuidado u orden, sin que se les sugieran.

### F-3 — Pulido y publicación

Incorporación del feedback, iconografía emocional propia, repertorio de frases ampliado, exportación.

**Cierre:** aplicación instalable publicada, con exportación funcionando.

### F-4 — Recordatorios y presencia

Recordatorios adaptativos, discretos y desactivables.

**RN-ROAD-01 —** Ningún recordatorio menciona ausencia, retraso ni cantidad de días.

---

## 2. Backlog priorizado

| # | Elemento | Por qué |
|---|---|---|
| **B-1** | Iconografía emocional propia (16 iconos) | Los emojis del sistema son la única pieza visual que no es de la marca |
| **B-2** | Ampliar el repertorio de frases del día a 120+ | Con sesenta, la repetición se nota en dos meses |
| **B-3** | Exportar todo lo escrito | Promesa implícita del posicionamiento |
| **B-4** | Navegación por fecha dentro del Journal | Pedido en revisión previa, aplazado |
| **B-5** | Cifrado real del contenido del Journal | Hoy el PIN bloquea el acceso, no cifra |
| **B-6** | Bloqueo de suspensión de pantalla en Respiración | Mitiga la limitación de §8.10 del blueprint |
| **B-7** | Mirada semanal, sin cifras | Solo si puede hacerse sin evaluar. Ante la duda, no se hace |
| **B-8** | Sincronización multidispositivo verificada | Depende de F-1 |

---

## 3. Decisiones abiertas

| # | Decisión | Opciones |
|---|---|---|
| **DA-1** | ¿Las cuatro secciones se quedan en la cabecera o bajan a una barra inferior? | Cabecera (actual, cambio nulo) · barra inferior (mejor alcance del pulgar, más trabajo) |
| **DA-2** | ¿El símbolo de Strivo es la marca única, o se rediseña a partir del símbolo del producto? | Confirmar D-3 visualmente |
| **DA-3** | ¿Cuánto dura la frase del día: la jornada natural o hasta la hora de dormir declarada? | Hoy, la jornada natural |
| **DA-4** | ¿La pausa de la mañana aparece con qué frecuencia? | Hoy, según regla interna. Falta decidir la cadencia deseada |
| **DA-5** | ¿Modelo de negocio en esta versión? | Todo gratuito hasta después de F-2 es lo recomendable |

---

## 4. Criterios de aceptación de la versión

Strivo 1.0 está listo para prueba con personas externas cuando (blueprint §14.5):

| # | Criterio |
|---|---|
| **CA-1** | La app abre en Hoy tras el umbral, sin pantallas intermedias |
| **CA-2** | La navegación muestra exactamente cuatro secciones, en el orden especificado |
| **CA-3** | Mañana y Noche se recorren completas, se cierran y quedan en consulta |
| **CA-4** | Un recorrido cerrado en blanco cierra sin advertencia y sin marcador de ausencia |
| **CA-5** | Cambiar el género del perfil reescribe las etiquetas de días ya guardados |
| **CA-6** | El Journal funciona con y sin PIN; el PIN se recupera reautenticando |
| **CA-7** | El Historial pinta el punto de ánimo y abre el día completo, incluidos campos de la versión anterior |
| **CA-8** | Respiración se abre desde la sección y desde la tarjeta de Hoy, con los siete patrones y los seis sonidos |
| **CA-9** | La app funciona completa en modo avión y sincroniza al recuperar red, sin duplicar |
| **CA-10** | Los seis comandos de verificación pasan en verde |
| **CA-11** | No queda ninguna referencia visible ni en el paquete de la aplicación al alcance retirado |
| **CA-12** | La revisión emocional de §13.4 no arroja ningún «sí» |
