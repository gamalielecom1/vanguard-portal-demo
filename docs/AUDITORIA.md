# Auditoría de orden y lógica

Objetivo: que cada pantalla tenga un orden que se pueda explicar, pensado para alguien que recién llega a la plataforma, la está entendiendo y se está acostumbrando a ella.

## Criterios

1. **Primero lo que debo hacer, después lo que quiero consultar, al final lo que me informa.**
2. **Una acción principal por pantalla**, con el porqué a la vista.
3. **Cada bloque dice para qué sirve** en una línea. Sin etiquetas decorativas.
4. **Sin duplicados:** una misma información vive en un solo lugar y se enlaza desde los demás.
5. **Lo promocional va abajo**, nunca entre las tareas.
6. **Lo que se explica una vez se pliega** (por ejemplo, «Qué ganas al agregar tus empresas»).

## Tipografía

Se mantiene Poppins (marca), con un trato más sobrio: saludo en Light 300 con el nombre en Medium 500, títulos de página en Medium, títulos de sección en SemiBold, texto en Regular. Se quitó el tracking apretado y el Bold de 700 en titulares, y las etiquetas en mayúsculas pasan de dorado a gris. Las cifras mantienen SemiBold con números tabulares. Estilos en `css/inicio.css`.

## Inicio · hecho

| Antes | Problema | Ahora |
|---|---|---|
| Nombre como etiqueta pequeña y «Tu cartera de 4 empresas» como título | Jerarquía invertida: lo importante (quién eres y dónde estás) pasaba desapercibido | **Hola, Andrés** como título y una línea de estado: «puesta en marcha 5 de 7 · 2 tareas pendientes» |
| Accesos rápidos arriba de todo | Era lo primero que se veía, aunque a quien aprende le falta saber qué hacer | Pasa al tercer lugar |
| «Tu próximo paso» en tercer lugar | La acción principal estaba enterrada | **Segundo bloque**, grande, con «Por qué ahora» |
| Accesos rápidos y «Estado de tus empresas» | Mostraban las mismas empresas dos veces | **Un solo bloque «Tus empresas y sistemas»**: ficha, sistema, dashboard y último acceso por empresa |
| Tarjeta de Vanguard CFO entre el próximo paso y el curso | Interrumpía las tareas con una promoción (ya está en el menú y en los anuncios) | Baja al final, junto a «Ayúdanos a conocerte» |
| Pregunta del día en la columna lateral | Es captura de datos, no ayuda al usuario | Final de la página |
| Plan de trabajo después del curso y el estado de empresas | Lo urgente (tareas con plazo) iba tarde | **Plan de trabajo antes del curso** |

**Orden final y su lógica:** quién soy y cómo voy → qué hago ahora → dónde trabajo → lo que me toca hacer y aprender (columna principal) y lo que puedo pedir a una persona (columna lateral) → qué pasa afuera → lo nuevo y lo que ayuda a conocerme.

## Mis sistemas · hecho

| Antes | Ahora |
|---|---|
| Cabecera → curso → copias por empresa → reseña → biblioteca de PDF → puesta en marcha (plegada) | Cabecera → **puesta en marcha** (abierta mientras falte algo; se pliega al completarla) → copias por empresa → biblioteca de PDF → curso → reseña |

Lógica: primero dejar el sistema funcionando, después usarlo (copias y PDF), después aprender más (curso) y, al final, opinar cuando ya lo usó. Cada sección dice para qué sirve en una línea.

## Mis empresas · hecho

| Antes | Ahora |
|---|---|
| «Qué ganas» → tarjetas → «Agregar empresa» como última tarjeta → formulario al final | Encabezado con el resumen («4 empresas · 2 con sistema vinculado · 4 fichas por completar») y **Agregar empresa** arriba → formulario justo debajo → «Qué ganas» (abierto la primera vez, luego plegado) → tarjetas |
| Tarjeta: nombre, datos, ficha, accesos, editar | Tarjeta: **quién es y su ficha** → **qué falta** (barra y «Completar ficha») → **cómo la uso** (abrir sistema/dashboard o vincular) → datos que la describen → editar |

Lógica: quien agrega o corrige una empresa lo hace desde arriba, sin bajar; en cada tarjeta lo pendiente se ve antes que los atajos.

## Configuración · hecho

| Página | Antes | Ahora |
|---|---|---|
| Pagos | Tarjetas → suscripción → cupones → pendientes → historial | **Pendientes primero** (se oculta si no hay y el encabezado dice «No tienes pagos pendientes») → suscripción y sesiones → tarjetas → cupones → historial |
| Puntos | Saldo → canje → niveles → cómo ganar → referidos → movimientos | Saldo → canje → **cómo ganar** → niveles → referidos → movimientos |
| Perfil | «Sobre ti» y «Tus temas» con el resumen por correo escondido junto a los temas | «Sobre ti» y «Tus temas», y un bloque nuevo **Avisos** con interruptores separados: *De tu cuenta* (soporte, sesiones, pagos, plazos) y *Ofertas y novedades* |
| Todas | Etiqueta «Configuración» / «Tu cuenta» sobre cada título | Sin etiqueta: las pestañas de Configuración ya dicen dónde estás |

Lógica: en Pagos va primero lo que exige acción; en Puntos, primero cómo sumar y después qué se desbloquea; en Perfil, primero quién eres y después qué quieres recibir. Los avisos de ofertas y novedades se respetan en los anuncios de Inicio: si los apagas, esos anuncios dejan de aparecer.

## Resto del portal · hecho

| Módulo | Cambio y lógica |
|---|---|
| Cursos | Primero el reproductor en la lección que sigue («retoma donde quedaste»). Debajo, «Otros cursos» (los que vienen con otros sistemas). Con un solo curso comprado ya no se muestra el selector. |
| Herramientas | Las calculadoras **Rápidas** van primero y abre por defecto «Flujo de caja 12 meses»; las **Avanzadas** después. |
| Sesiones 1:1 | Si hay una sesión agendada, su bloque con acuerdos sube arriba del formulario para agendar otra. |
| Proyectos a medida | Sin cambios de orden: el asistente de 3 pasos ya va primero y «Mis solicitudes» solo aparece si hay alguna. Se quitó la etiqueta decorativa. |
| Vanguard CFO | Sin cambios: pantalla 1 propuesta de valor y video, pantalla 2 razones y beneficios. |

## Back office · hecho

| Módulo | Cambio y lógica |
|---|---|
| Ficha 360 | De 8 indicadores a **4** (gasto total, empresas, tickets abiertos, avance del curso) y de 9 pestañas a **7**: «Reuniones y formularios» y «Comercial y documentos» fusionan pestañas que se consultaban juntas. |
| Cursos y ventas por producto | Salen de la gestión y entran a **Analítica de uso → Cursos y productos**: ventas por producto y dónde se abandona cada curso. En «Cursos» (gestión) solo quedan las lecciones, con un enlace a las estadísticas. |
| Analítica de uso | Cuatro pestañas: Resumen y embudo · Cursos y productos · Actividad en vivo · Páginas y fuentes. |

## Código

| Hallazgo | Estado |
|---|---|
| 6 funciones del back office definidas más de una vez (`alertas`, `analitica` ×3, `bandeja`, `clientes`, `ficha` ×3, `soporte`) | **Resuelto:** se borraron las versiones antiguas (≈150 líneas). Se conservó la segunda `analitica` porque `anValor` la usa. |
| `js/app.js` de unas 2.300 líneas con todo mezclado | Pendiente: separar por módulo (estado, navegación, portal, back office). |
| Cerca de 400 estilos en línea dentro del JavaScript | Pendiente: pasarlos a clases al tocar cada módulo. |
| 6 hojas de CSS superpuestas (`legacy`, `theme`, `puntos`, `shell`, `inicio`) | Pendiente: unificar en tokens, base, componentes y páginas. |
| Datos de ejemplo mezclados con la lógica | Pendiente: moverlos a `datos-demo.js`. |

## Experiencia de uso (segunda ronda)

- **Terminología:** «planilla» pasó a «sistema» en todo el portal, el back office y los datos ya guardados.
- **Acompañamiento:** la sección de sesiones se vende como acompañamiento continuo: asistente de 3 pasos (qué necesito, mi situación, cuándo), con el precio al final y sin hablar de minutos.
- **Herramientas:** vista previa una sola vez, formulario simple, resultado con «Calcular» y exportación a PDF (con gráfico), Excel y PNG.
- **Ficha de empresa:** una pregunta a la vez con respuestas de un toque, avance guardado y resumen editable.
- **Formulario del beneficio:** dos columnas y botón siempre visible, sin scroll.
- **Alineación:** columnas fijas en «Tus empresas y sistemas», botones del mismo ancho y Check-in centrado.
- **Repaso final de UI:** el menú de la fila inferior heredaba un `top: 12px` que lo bajaba del fondo del encabezado; el padding del Check-in lo pisaba una regla de pantallas medianas; había un bloque de botones huérfano (menú de cuenta duplicado) que aparecía bajo cada página; y en móvil el saludo de Inicio quedaba en una columna angosta.
- **Movimiento:** aparición suave de las tarjetas al hacer scroll, barras que se llenan, indicador deslizante del menú y contador de puntos. Se apagan con «reducir movimiento».

## Acompañamiento, Proyectos, Mis empresas y Noticias · tercera ronda

| Módulo | Problema | Ahora |
|---|---|---|
| Acompañamiento | Arriba un precio de inversión y al lado otra oferta (plan de 3): no se entendía cuál pagar; dos botones en la misma pantalla | Un solo botón por pantalla. El plan se elige en el primer paso entre 1 sesión y 3 sesiones, cada una con su precio, duración y un «elígela si…» grande; el ahorro del plan se ve de entrada. El precio vuelve a aparecer en el resumen final |
| Acompañamiento | Áreas en cuadros gigantes y temas en chips pequeños; difícil si no eres técnico | Área en un selector compacto y temas como lista con una explicación simple cada uno, más «No estoy seguro: ayúdenme a definirlo» |
| Proyectos | Cada opción mostraba «+$120.000» y asustaba | Sin precios por opción; solo sube el «desde». Más de la mitad de una categoría suma un recargo de coordinación, con aviso |
| Proyectos | Cierre ambiguo: ofrecía agendar un acompañamiento pagado | Cierre con «desde», qué pasa después en 3 pasos (te contactamos, reunión, presupuesto final con documentación) |
| Mis empresas | Tarjetas con estructuras distintas según el estado | Misma estructura y altura: ficha con barra, sistema con estado y dos botones iguales, datos al pie |
| Noticias | Tarjetas que parecían tareas | Encabezado tipo diario con fecha y tarjetas con color por tema |

## Verificación

Se abrieron las 32 páginas del portal y del back office y las 7 pestañas de la Ficha 360: todas dibujan sin errores.
