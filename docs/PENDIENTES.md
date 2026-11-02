# Pendientes para producción

## Integraciones

- [ ] **Mercado Pago:** cobros, tarjetas guardadas, cupones y puntos en el `external_reference`, webhook de confirmación.
- [ ] **Autenticación:** registro, login y recuperación. Hoy hay un usuario de ejemplo.
- [ ] **Base de datos y API:** reemplazar `localStorage` (ver `ARQUITECTURA.md`).
- [ ] **Almacenamiento de PDF:** guardar el archivo y ligarlo a sistema + empresa.
- [ ] **Correo transaccional** y una tarea programada diaria para el reenganche.
- [ ] **Google Analytics 4:** páginas, scroll y fuentes para la pestaña «Páginas y fuentes».
- [ ] **Shopify:** compras, productos y descuentos reales.
- [ ] **Google Calendar:** agenda de asesores y enlace de la reunión.
- [ ] **Vanguard CFO:** sesión compartida con la app real (`app.vanguardstt.com`).

## Producto

- [ ] Usuario demo con funciones bloqueadas o difuminadas.
- [ ] Usuario demo de proyecto a medida (cronograma, Gantt, reuniones, contratos): después de enero.
- [ ] Referidos que compran (acreditar 500 VP).
- [ ] Vencimiento de puntos a los 12 meses.
- [ ] Beneficios reales ligados al nivel.
- [ ] Que los avisos «de tu cuenta» (soporte, sesiones, pagos, plazos) lleguen de verdad por correo según los interruptores de Perfil → Avisos.
- [ ] Conectar «Cursos y productos» con las compras y lecciones reales (hoy son datos de ejemplo).
- [ ] Motor de «Voz del cliente» (transcripciones, formularios y tickets → dolores recurrentes).
- [ ] Separar `app.js` por módulos, pasar los estilos en línea a CSS y mover los datos de ejemplo a un archivo aparte (ver `AUDITORIA.md`).

- [ ] **Algoritmo de anuncios:** hay un primer puntaje por tipo de cliente (`CFG.rank` en `js/anuncios.js`: varias empresas, contador, sin sistema, anuncios ya cerrados). Falta afinar pesos con datos reales y verlo en el back office.
- [ ] **Tarifario real** de proyectos a medida (precios por tipo y módulo, recargo, plazos) para reemplazar las cifras de ejemplo.

## Contenido y legal

- [ ] **Cláusula de garantía** del proyecto a medida: redactarla con un abogado. El cotizador hoy solo avisa que existirá.
- [ ] Revisar la adecuación a la **Ley 21.719** de datos personales: las empresas y los cálculos son información financiera del cliente y, si es contador, de terceros.
- [ ] Textos de los 13 artículos del Centro de ayuda: validarlos con quien da soporte.
- [ ] Beneficios, precio y días de prueba del miembro fundador de Vanguard CFO.
- [ ] Videos: demostración de CFO (máx. 1 minuto) y mensaje de la directiva.

## Números por validar

- [ ] Acompañamiento: duración (45 y 60 min), precio de 1 sesión ($29.990) y del plan de 3 ($79.990, ahorro de 11%): ¿se destaca más con un descuento mayor?
- [ ] Margen bruto, ticket y comisión de pago reales para el simulador.
- [ ] 50% de descuento en el popup del PDF: probar su efecto en el margen.
- [ ] Escala de descuento progresivo 10 / 15 / 20%.
- [ ] Mínimo de 500 VP para canjear: con ese mínimo, un cliente casual tarda más de 3 meses en llegar al primer tramo.

## ERP interno (fase aparte)

- [ ] Tareas generadas desde transcripciones de reuniones.
- [ ] Tareas repetitivas mensuales (F29, impuestos).
- [ ] Pagos a freelance ligados a tareas.
- [ ] Tableros por rol (ejecutivos comerciales: metas, KPIs, comisiones).
