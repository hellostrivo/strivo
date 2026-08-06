# ROADMAP — Strivo

**Última actualización:** 4 ago 2026 (Blueprint v3, §8.12)

**Visión:** cada fila es un hito cerrado cuando se cumplen todos sus criterios.  
**Cambios:** editables cuando la realidad lo exige; no es un plan estático.

---

## Fase 0: Fundación (24 jul – 21 ago 2026)

| Campo | Detalle |
|---|---|
| **Estado** | 🔵 En progreso |
| **Duración** | 4 semanas |
| **Entrega** | Sistema de diseño implementado + prototipo navegable de 3 flujos |
| **Salida esperada** | Design tokens en JSON · Componentes base en código · Prototipo con Onboarding → Ritual de Mañana → Ritual de Noche |
| **Criterios de cierre** | 5 personas externas recorren el prototipo sin preguntas y lo describen con palabras: "calma", "cuidado", "orden". |
| **Costos estimados (MXN)** | Herramientas: 0–2.000/mes · Tipografías: 0–6.000 (una vez) · Dominio: ~400/año · **Total: 5–15k** |
| **Tecnología** | Figma + React/Next.js prototipo + diseño en código (Tailwind con tokens.json). |
| **Dependencias** | Ninguna externa. Completar CLAUDE.md, design-tokens.json, copy-library.md, skills. |

### Checklist Fase 0

- [ ] Sistema de diseño en tokens, JSON y CSS variables.
- [ ] 6 componentes base: Button, Card, Input, Chip, HabitRow, EmotionCard.
- [ ] Prototipo navegable: P1–P11 (Onboarding) → Ritual de Mañana → Ritual de Noche.
- [ ] Copy validado contra copy-library.md.
- [ ] Contrastes AA auditados.
- [ ] Test con 5 personas; feedback compilado.

---

## Fase 1: MVP privado (22 ago – 9 oct 2026) ⭐ Primer producto con usuarios

| Campo | Detalle |
|---|---|
| **Estado** | ⚪ No comenzado |
| **Duración** | 7 semanas |
| **Usuarios** | 15–25 (private beta, invitados) |
| **Entrega** | App funcional: Onboarding completo + Diario (mañana/noche) + Rituales + Hábitos (5 máx) + Journal + Historial + Constancia |
| **Excluye deliberadamente** | IA, Insights complejos, suscripción, contenido premium, importar/compartir |
| **Criterio de salida** | ✅ **≥ 40% con 4+ días en la semana 2.** Si < 25%, pausar y rediseñar el Ritual de Noche. |
| **Costos estimados (MXN)** | Infraestructura gratuita (15–25 usuarios) | Cuentas dev Apple/Google: ~1.300 · Herramientas: 0–2k/mes · **Total: 3–8k** |
| **Tecnología** | React Native (o React PWA) + IndexedDB (almacén local) + Firebase (autenticación + base de datos simple) · Notificaciones locales (device, no push). |
| **Dependencias bloqueantes** | Stack confirmado (React? Native? PWA? Expo?) antes de empezar. |

### Componentes MVP

| Módulo | Estado | Criterios |
|---|---|---|
| Onboarding (P1–P11) | 🔴 Pendiente | 3 capas: P1–P5, P6–P10, día 2–7. P4 crea identidad central, P4B áreas, P4C identidad de área. |
| Hoy (Pantalla raíz) | 🔴 Pendiente | Degradados horarios (5 franjas). Tarjeta de acción principal liga a Diario (mañana o noche según hora). |
| Ritual de Mañana | 🔴 Pendiente | 5 pantallas (respiración, identidad, compromiso, hábitos, intención). Pop-up horario 4:00–11:30. |
| Vista de Mañana (Diario) | 🔴 Pendiente | 6 bloques: frase, agradecimientos, emociones, gran visión, victorias, checklist ritual. |
| Ritual de Noche | 🔴 Pendiente | 6 pantallas (herencia de victorias, nuevos logros, agradecimientos, aprendizaje, ánimo de cierre, checklist). |
| Vista de Noche (Diario) | 🔴 Pendiente | 8 bloques: victorias heredadas con decisión, logros nuevos, agradecimientos, aprendizaje, ánimo, cierre. |
| Hábitos (módulo) | 🔴 Pendiente | H1: lista + agrupación. H2: detalle 90 días. H3: crear. Proyección a rituales automática. |
| Journal (libre) | 🔴 Pendiente | Editor sin fricción. Búsqueda simple (palabra, etiqueta, rango). Exportación JSON. |
| Historial | 🔴 Pendiente | Calendario (puntos de ánimo, sin rojo) + línea de tiempo + vista de día + búsqueda. 60 días mínimo. |
| Constancia | 🔴 Pendiente | `count(distinct fecha)`. Visualización: anillo por tramos 10 días. Nunca se reinicia. |
| Perfil básico | 🔴 Pendiente | Identidad central (historial). Áreas (pausar/reanudar). Nombre. |
| Notificaciones | 🔴 Pendiente | Nivel 1: Rituales a horas fijas (local device, no push). Nivel 2: adaptativo. |

### Checklist de aceptación MVP

- [ ] Usuarios nuevos completan P1–P11 sin abandonar (P5 crea primer registro, captura identidad y áreas).
- [ ] Ritual de Mañana visible diariamente en ventana horaria; marca persiste.
- [ ] Ritual de Noche hereda victorias automáticamente; marca persiste.
- [ ] Hábitos creados se proyectan a ambos rituales al instante; marcar en ritual → refleja en lista.
- [ ] Journal guarda sin fricción; búsqueda funciona.
- [ ] Historial muestra 60 días sin degradación de rendimiento.
- [ ] Constancia suma correctamente desde cualquier dato (ritual, histórico).
- [ ] Offline: todo funciona localmente; sync sin conflictos cuando hay red.
- [ ] Exportación JSON completa y correcta.
- [ ] QA emocional (Anexo A) pasa para cada pantalla.
- [ ] Contraste AAA verificado; 200% escalable.
- [ ] 0 crashes en 2 semanas de uso.

---

## Fase 2: Beta pública (10 oct – 11 dic 2026) ⭐ Entregable socializable de fin de 2026

| Campo | Detalle |
|---|---|
| **Estado** | ⚪ No comenzado |
| **Duración** | 9 semanas (hito de socialización: primera semana de diciembre) |
| **Usuarios objetivo** | 300–500 (público, pero aún beta) |
| **Entrega** | Todo MVP + Insights (v1, reglas) + Suscripción + Recordatorios adaptativos + Accesibilidad AA + PWA instalable + Landing |
| **Criterios de salida** | **D30 ≥ 25 %** · **Conversión a prueba ≥ 8 %** · Cero incidentes de pérdida de datos · Landing con 100+ click-through a app. |
| **Costos estimados (MXN)** | Infraestructura (300–500 usuarios): 500–1.500/mes · Push service: ~400/mes (o gratis en FCM) · Pasarela de pagos (tipo RevenueCat): gratis hasta cierto ingreso · Landing + hosting: ~200/mes · Auditoría ligera a11y/privacidad: 8–20k una vez · **Total: 15–35k** |
| **Tecnología** | Firebase Functions (pagos/suscripción) · Servicio de notificaciones push · Motor Insights (reglas en cliente o función serverless) · PWA instalable. |
| **Dependencias bloqueantes** | MVP cierra con ≥ 40%. Pasarela de pagos integrada (Stripe, RevenueCat, etc.). |

### Componentes Beta

| Módulo | Cambios desde MVP |
|---|---|
| Insights | Nuevos tipos: Constancia, resumen semanal, palabras frecuentes, patrón (reglas), distribución por áreas, evidencia de identidad. Cada uno con evidencia citable. |
| Suscripción | Paywall + prueba 7 días + 99 MXN/mes · 749 MXN/año. Control de acceso a Insights avanzados, Descubre, Libro de Vida (futura). |
| Recordatorios v2 | Adaptativo: supresión si ya registró, aprendizaje de horario, reducción tras 3 ignorados. |
| Onboarding progresivo v2 | Capa 3: preguntas días 2–7 al final del ritual (áreas, tipo de app previo, voz, hábitos propios, compromiso). |
| Estado de regreso | Detección de ausencia 7+ días. Mensaje sin culpa. Recuperación de Constancia. |
| Descubre (preview) | 5 artículos de prueba (3–5 min cada uno). Sin audios ni programas aún. |
| Exportación mejorada | PDF además de JSON. Incluyendo visualizaciones (gráfico de Constancia). |
| Auditoría a11y | AA completo: contraste, escalado, navegación teclado, lectores de pantalla. |
| Landing + SEO | Página de presentación: 4 secciones (problema, solución, testimonios [de beta], CTA a App Store/Play). |

### Checklist Beta

- [ ] Suscripción funciona end-to-end: prueba, pago, acceso.
- [ ] Insights se generan automáticamente sin IA (solo reglas).
- [ ] Cada insight tiene botón "no me sirve" que mejora filtrado.
- [ ] Push: adaptativo (aprende ignoradas, suprime si registró).
- [ ] PWA instalable desde home screen.
- [ ] Landing convierte mínimo 8% de clicks a install.
- [ ] D30 medible (tracking de usuarios día 1, día 30 activos).
- [ ] Exportación PDF renderiza correctamente.
- [ ] QA a11y: AA auditado por herramienta (axe, WAVE, etc).
- [ ] 0 pérdida de datos en 100 usuarios × 2 meses.

---

## Fase 3: V1 Pública (ene – abr 2027) ⭐ Primer producto completo, con IA

| Campo | Detalle |
|---|---|
| **Estado** | ⚪ No comenzado |
| **Duración** | 18 semanas (4 meses) |
| **Usuarios objetivo** | 5.000 |
| **Entrega** | Todo Beta + **Insights con IA** + Biblioteca Ciencia del Bienestar + Audioteca + Programas guiados + **Apps nativas (iOS/Android)** + Importación legacy |
| **Criterios de salida** | 5.000 usuarios · **D90 ≥ 15 %** · MRR que cubra infraestructura + contenido · Conversión sostenida. |
| **Costos estimados (MXN)** | Infraestructura (5k usuarios): 3–8k/mes · **IA** (≤3 MXN/usuario premium/mes; ~1k premium): 2–6k/mes · Contenido (25 artículos + 20 audios, producción/voz/edición): 40–90k una vez · **Total: 90–180k** |
| **Tecnología** | LLM API (Anthropic, OpenAI) con procesamiento por lotes · Síntesis de voz (TTS) para audios · Caché de Insights · React Native apps (iOS/Android via App Store/Google Play) · Importador de Day One / Five Minute Journal. |
| **Dependencias bloqueantes** | Beta cierra con D30 ≥ 25%. Presupuesto de IA aprobado. Proveedor de LLM elegido. |

### Nuevos módulos V1

| Módulo | Qué incluye |
|---|---|
| **Insights con IA** | Patrones conductuales (correlación ánimo + hábito). Temas emergentes del Journal. Resúmenes narrados. Todo con control de usuario: toggle "Reflexiones con IA" en Ajustes. |
| **Biblioteca** | 25 artículos de 3–5 min sobre el bienestar. Tags: por área, por momento, por ánimo reciente. Acción integrable: "Añadir esto a mi Diario de hoy". |
| **Audioteca** | 20 audios de 60s–8 min (meditación guiada, respiración, reflexión). Organizada por momento + ánimo. |
| **Programas guiados** | 4 programas 14–30 días: "Autoestima" (21d), "Claridad" (30d), "Disciplina" (14d), "Gratitud" (21d). Notificación diaria con lección. |
| **Carta a yo futuro** | Escribir hoy, recibir en 30/60/90/365 días. Opción de completar con IA (resumen cálido de quién eres hoy). |
| **Apps nativas** | iOS (App Store) + Android (Google Play) wrapping React Native o build nativo. Mantiene almacén local IndexedDB/SQLite intacto. |
| **Importador** | Traer entradas de Day One o Five Minute Journal con mapeo de emociones. |

### Checklist V1

- [ ] Insights con IA generados sin error; control de usuario funciona.
- [ ] Coste de IA ≤ 3 MXN por usuario premium/mes, verificable.
- [ ] Biblioteca: 25 artículos + búsqueda funciona. Acción "añadir a Diario" integrada.
- [ ] Audioteca: 20 audios reproducen sin lag. Organización por momento + ánimo.
- [ ] Programas: 4 programas con notificaciones diarias funcionan.
- [ ] Carta a yo futuro: entrega correcta en fechas especificadas.
- [ ] Apps en App Store (iOS) y Google Play (Android) listadas, descargables.
- [ ] Importador: 80%+ de entradas traídas sin error.
- [ ] Conversión a suscripción sostenida (trending up de MRR).
- [ ] D90 ≥ 15% (5k usuarios × 750+ activos).

---

## Fase 4: V2 (may – dic 2027)

| Campo | Detalle |
|---|---|
| **Estado** | ⚪ No comenzado |
| **Duración** | 8 meses |
| **Entrega** | **Libro de Vida** (impreso) + E2EE opcional para Journal + Audio de cierre personalizado + Segundo idioma (inglés) + Nuevos temas visuales |
| **Criterios de salida** | Rentabilidad operativa con 2 personas · Retención estable · Libro de Vida: tasa de compra medible. |
| **Costos estimados (MXN)** | Infraestructura: 8–20k/mes · IA (incluye síntesis de voz): 6–15k/mes · Impresión bajo demanda: variable (repercutido a cliente con margen) · Reescritura copy a inglés: 30–60k una vez · **Total: 150–320k** |

### Nuevos módulos V2

| Módulo | Qué es |
|---|---|
| **Libro de Vida** | Compilación narrada del periodo del usuario. Exportable a PDF. Impresión bajo demanda (nueva línea de ingresos, margen alto). "Mi año en Strivo" o similar. |
| **E2EE (opcional)** | Cifrado de extremo a extremo para Journal. Implicación: pérdida de búsqueda en servidor e IA sobre esas entradas. User control total. |
| **Audio de cierre** | Síntesis de voz lee tus agradecimientos del día en cierre nocturno. Genera archivo de audio personalizado. |
| **Inglés** | Interfaz + copy completamente reescritos para inglés (no traducción literal). Nueva cohort de usuarios. |
| **Temas visuales** | Adicionalmente al claro/oscuro: "Bosque", "Océano", "Desierto" (sin cambiar tokens, solo paletas alternativas). |

---

## Fase 5: V3 (2028) — Ecosistema

| Campo | Detalle |
|---|---|
| **Estado** | ⚪ No comenzado |
| **Entrega** | Integraciones salud (Apple Health/Google Fit) · Apple Watch · Spotify/Audible · Exploración B2B |
| **Criterio de salida** | Decisión estratégica según tracción, financiación, equipo. |

**Riesgo:** Estas integraciones pueden dilatar el foco. Solo si tracción V1–V2 lo justifica.

---

## Métricas de referencia por fase

| Métrica | MVP | Beta | V1 | V2 |
|---|---|---|---|---|
| D7 | N/A | 40%+ | 35%+ | 30%+ (plateau aceptable) |
| D30 | N/A | 25%+ | 20%+ | 18%+ |
| D90 | N/A | N/A | 15%+ | 12%+ |
| Conversión a prueba | N/A | 8%+ | 10%+ | 12%+ |
| Conversión a pago | N/A | 1–2% | 3–5% | 5–8% |
| MRR | $0 | $300–500 | $1.5–3k | $5k+ (rentabilidad) |
| Costo de infraestructura | <$200 | $500–1.5k | $3–8k | $8–20k |

---

## Riesgos y contingencias

| Riesgo | Probabilidad | Contingencia |
|---|---|---|
| MVP < 40% en semana 2 | Media | Pausar → rediseñar Ritual de Noche, no añadir funciones. Relanzar 2 semanas después. |
| Beta D30 < 15% | Media | Revisar propuesta de valor (no es funcionalidad). Posible pivot de problema target. |
| Coste IA > presupuesto | Baja | Reducir frecuencia de Insights, no calidad. O cambiar proveedor LLM. |
| Retención por encima de V1 (mejor que V2) | Media | Normal. Significa que el foco de la app (Diario + Rituales) es más fuerte que el contenido. Aceptar. |
| Competencia entra en beta | Baja | Diferencial es la identidad + ausencia de gamificación. Difícil de copiar rápido. |

---

## Checklist antes de cada fase

### Antes de MVP
- [ ] CLAUDE.md, design-tokens.json, copy-library.md, skills están listos y centralizados.
- [ ] Stack confirmado (React Native? PWA?).
- [ ] Servidor/BD elegido (Firebase? AWS? Vercel?).
- [ ] Repositorio creado (GitHub), con CI básico.
- [ ] Prototipo Fase 0 probado con 5 personas.

### Antes de Beta
- [ ] MVP cumple ≥ 40% D2W con 15–25 usuarios.
- [ ] Suscripción integrada (Stripe, RevenueCat, etc.).
- [ ] Pasarela de pagos testeda end-to-end.
- [ ] Landing redactada y deployada.
- [ ] Feedback MVP compilado y accionado.

### Antes de V1
- [ ] Beta cumple D30 ≥ 25%, conversión ≥ 8%.
- [ ] Proveedores de LLM / TTS elegidos, costo verificado.
- [ ] Contenido (25 artículos, 20 audios) preproducido.
- [ ] Apps nativas wrapping/build completo.

---

**Última actualización:** 4 ago 2026  
**Próxima revisión:** al cerrar cada fase (no cada semana; el roadmap no es un tracker diario).
