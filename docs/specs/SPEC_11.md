# SPEC_11 — Navegación de dos espacios

**Espacio:** Transversal · **Depende de:** SPEC_03 a SPEC_10 · **Estimación:** 2 h

---

## 1. Objetivo

Montar la barra que conecta Lumia y Formia. Es lo único que los conecta: no hay ningún otro puente en la app.

---

## 2. Dependencias

Todas las specs de contenido (03–10). **No la adelantes.** Una barra montada antes de que existan los dos espacios se rehace.

---

## 3. Fuente en el blueprint

- **§C7.3** Naming de la navegación
- **§C7.7.3** No hay puente de Hoy hacia Formia
- **§C0.4** Cómo se relacionan las tres marcas
- **RN-10** Máximo de pestañas y profundidad
- **BRAND_MANUAL §9** Naming (deja abierta la retícula)

---

## 4. Alcance

**Dos pestañas: `Lumia · Reflexión` y `Formia · Acción`.**

El naming es mixto por decisión (§C7.3): nombre de marca + descriptor. La marca se aprende sin que la barra deje de decir qué hay dentro.

**El punto abierto es de maquetación, no de producto.** "Lumia · Reflexión" y "Formia · Acción" completos probablemente no caben en una barra inferior de móvil a un tamaño legible. Lo previsible es **rótulo corto en la pestaña y nombre de marca en la cabecera del espacio**. Maqueta las dos alternativas y elige con el resultado delante:

- **A)** Pestaña: `Lumia` / `Formia` · Cabecera del espacio: `Lumia · Reflexión`
- **B)** Pestaña: `Reflexión` / `Acción` · Cabecera del espacio: `Lumia`

Documenta cuál se eligió y por qué, en `CLAUDE.md`. Es la última decisión abierta del proyecto.

**Dentro de cada espacio**, la navegación secundaria es propia:
- Lumia: Hoy · Journal · Historial
- Formia: Identidad · Hábitos · Progreso

---

## 5. Modelo de datos

Ninguno. La pestaña activa es estado de UI. **No la persistas** en el modelo compartido: no es un dato del usuario.

Al abrir la app, se entra siempre por Lumia.

---

## 6. Componentes y archivos

```
src/components/shared/BarraEspacios.jsx     Las dos pestañas
src/components/lumia/NavLumia.jsx           Navegación interna de Lumia
src/components/formia/NavFormia.jsx         Navegación interna de Formia
src/App.jsx                                 Enrutado de los dos espacios
```

Rutas: `/lumia/*` y `/formia/*`. Espacios separados también en la URL.

---

## 7. Reglas aplicables

| Regla | Implementación |
|---|---|
| **RN-10** | Dos pestañas en la barra principal. Profundidad máxima de 3 toques desde cualquier punto. |
| **§C7.7.3** | La barra es el **único** cruce entre espacios. Ningún enlace de contenido lleva de uno a otro. |
| **RN-DB4-01** | Cambiar de pestaña no arrastra datos: cada espacio carga los suyos. |
| **Accesibilidad** | Objetivos táctiles ≥ 44 px. Estado activo distinguible sin depender solo del color. |
| **Transición** | El cambio de espacio es inmediato o con un cross-fade breve. Sin animación elaborada: no es un momento ceremonial. |

**Verificación que conviene hacer aquí:** recorre la app entera buscando enlaces que crucen espacios. Si SPEC_06 se implementó bien, no hay ninguno; esta es la ocasión de confirmarlo antes de la marca.

---

## 8. Copy

Namespace `shared.navegacion`.

- Rótulos de pestaña y cabeceras según la alternativa elegida.
- Cada espacio conserva su vocabulario: Lumia habla de reflexión y calma; Formia, de construcción y dirección. **La barra no mezcla los dos registros.**

---

## 9. Criterios de aceptación

1. Dos pestañas, con los rótulos de la alternativa elegida y documentada.
2. Los rótulos son legibles a tamaño de sistema y con escalado 200 %.
3. No existe ningún enlace de contenido que cruce de Lumia a Formia o al revés.
4. Cambiar de pestaña no pierde el estado interno del espacio que se deja.
5. La app abre siempre por Lumia.
6. Profundidad máxima de 3 toques desde cualquier punto.
7. El estado activo se distingue sin depender solo del color.
8. La decisión de rótulos queda escrita en `CLAUDE.md`.

---

## 10. Fuera de alcance

- Colores y símbolos de marca por espacio: SPEC_12.
- Una tercera pestaña de Strivo: Strivo **no se usa directamente** (§C0.2).
- Onboarding de la navegación o tour de bienvenida.
- Recordar la última pestaña visitada entre sesiones.
