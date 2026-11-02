# Decisiones y estado

Fuente: reunión del 30 de octubre de 2026 (notas automáticas de la reunión, revisadas) y ajustes posteriores. Estado: **Hecho** en el prototipo · **Parcial** · **Pendiente**.

## Portal del cliente

| Decisión | Estado |
|---|---|
| «Mis sistemas» pasa a **Mis sistemas**, con botones «Abrir sistema» y «Abrir dashboard» | Hecho |
| Biblioteca de PDF por sistema y empresa, dentro de Mis sistemas | Hecho (guarda registro, no el archivo) |
| Onboarding de 3 pasos al iniciar sesión (identidad, cómo lleva sus números, educación financiera) | Hecho |
| Cursos y sistemas como módulos separados | Hecho |
| Opinión en cada lección; una duda genera un ticket | Hecho |
| Herramientas en tres momentos: vista previa (una vez) → formulario → resultado; exportar a PDF, Excel y gráfico PNG con la oferta antes de descargar | Hecho (la vista previa se muestra una vez por herramienta; el cálculo completo no se guarda, solo un resumen corto) |
| Popup de oferta antes de exportar el PDF | Hecho (50%, propuesta) |
| Ficha de empresa completa antes de agendar reunión | Hecho en Acompañamiento con un mínimo de 70% (a definir) y en el cotizador con 100% |
| Sesiones 1:1 pasan a venderse como **Acompañamiento**: un asistente de 4 pasos (plan → qué resolver → empresa → cuándo) con un solo botón por pantalla. El plan se elige dentro del flujo: una sesión ($29.990, 45 min) o 3 sesiones ($79.990, 60 min cada una, 90 días) con el ahorro a la vista y un «elígela si…» por opción. Los temas llevan una explicación simple y la opción «No estoy seguro» | Hecho (minutos y precios son propuesta) |
| Llenado de la ficha de empresa como conversación de una pregunta a la vez | Hecho |
| Cotizador de proyectos: tipo de proyecto como lista con ícono; el alcance se recorre un área por pantalla (6 áreas + plazo y revisión), con «Ninguna, seguir» para saltar. No se muestran precios por opción: solo sube el «desde» (+ IVA). Si se elige más de la mitad de una categoría, esa categoría suma un recargo de coordinación (15%). Los valores y el recargo se editan en el tarifario del back office | Hecho (cifras de ejemplo hasta recibir el tarifario real) |
| Cierre del cotizador: «desde», qué pasa después (te contactamos → reunión → presupuesto final con documentación) y sin ofrecer agendar un acompañamiento pagado | Hecho |
| Cláusula de garantía de devolución parcial en el contrato | Pendiente (texto legal; el cotizador solo lo avisa) |
| Notificaciones separadas: cuenta frente a ofertas y novedades | Hecho en Perfil → Avisos (interruptores separados); la campana sigue mostrando solo novedades |
| Pagos dentro de Configuración (tarjetas, cupones, historial) | Hecho (tarjetas simuladas) |
| Sistema de puntos y recompensas | Hecho (ver `ECONOMIA_PUNTOS.md`) |
| Soporte pasa a **Centro de ayuda** en Configuración, con soluciones antes del contacto | Hecho |
| Quitar «Para ti»; recomendaciones como anuncios flotantes en Inicio | Hecho |
| Barra de anuncios ordenada por relevancia según el tipo de cliente (puntaje con pesos propuestos) | Parcial |
| Descuentos progresivos 10 / 15 / 20% según pasan 24 h y 48 h | Hecho (en los anuncios) |
| Portal como canal de postventa para quienes ya compraron | Decisión de uso |
| Usuario demo con funciones bloqueadas o difuminadas | Pendiente |
| Usuario demo de proyecto a medida (cronograma, Gantt, reuniones, contratos) | Pendiente · posterior a enero |
| **Vanguard CFO** como una página de máximo 2 pantallas con un único CTA «Ser miembro fundador» | Hecho |
| Módulo exclusivo de fundador (avances, bitácora, votos, mensaje de la directiva) | Hecho |

## Back office

| Decisión | Estado |
|---|---|
| Unir Actividad en vivo y Analítica en «Analítica de uso del portal» (con GA4) | Hecho (datos de GA4 de ejemplo) |
| Series de tiempo en los módulos | Hecho |
| Separar tickets de soporte de oportunidades comerciales | Hecho |
| Alertas como notificaciones en tiempo real | Hecho (feed con categorías) |
| Alertas de inactividad y correos de reenganche configurables | Hecho (envío simulado) |
| Ficha de cliente 360 con tarjetas más simples | Hecho (4 indicadores y 7 pestañas) |
| Datos de cursos y ventas por producto dentro de la analítica | Hecho (Analítica de uso → Cursos y productos, con datos de ejemplo) |
| Voz del cliente alimentada por IA desde transcripciones, formularios y tickets | Existe la vista; falta el motor |
| Lanzamientos masivos de novedades desde la plataforma | Existe (`Novedades y campañas`) |
| Simulador de economía de puntos | Hecho |

## ERP interno (fuera del portal)

Fase aparte. Sin avance en este repositorio.

- Tareas y tickets generados a partir de transcripciones de reuniones.
- Tareas repetitivas mensuales (por ejemplo, el F29, el día 1 de cada mes).
- Pagos a freelance ligados a tareas, con comprobantes.
- Tablero estándar de empresa, y luego por rol (ejecutivos comerciales con metas, KPIs y comisiones).

## Precios y modelo (por validar)

- Cobrar solo costos durante 3 meses y luego el valor completo. Referencia de la reunión: 100 personas a $47.000, unos $4,7 millones al mes.
- Vanguard CFO: el prototipo usa $10.000 al mes y 14 días gratis como **propuesta**; no coincide con lo anterior y hay que definirlo.
- Mínimo de proyecto a medida: $150.000.
