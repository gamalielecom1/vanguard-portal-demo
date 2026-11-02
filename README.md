# Portal del cliente · Vanguard Strategy

Maqueta navegable del portal donde los clientes de Vanguard Strategy usan los sistemas que compraron, aprenden, agendan sesiones, cotizan proyectos a medida y acumulan puntos. Incluye el back office para el equipo.

**Estado:** prototipo front-end con datos de ejemplo. No tiene servidor: todo vive en el navegador (`localStorage`). Sirve como especificación visual y de comportamiento para construir la versión real.

## Cómo correrlo

No necesita instalación. Desde esta carpeta:

```bash
python3 -m http.server 4173
```

Abre `http://localhost:4173`. Para que la pantalla parta desde cero, borra los datos del sitio en el navegador.

| Dirección | Qué abre |
|---|---|
| `http://localhost:4173/` | Portal del cliente |
| `http://localhost:4173/?dev=1` | Muestra el banner de maqueta, el selector Portal / Back office y «Reiniciar demo». `?dev=0` los oculta |
| `http://localhost:4173/#clientes` | Back office (cualquier página se abre por `#nombre`, ver `docs/ARQUITECTURA.md`) |
| `http://localhost:4173/#economia` | Simulador de la economía de puntos |

## Estructura

```
index.html          Todas las páginas (main.page) y el esqueleto
css/theme.css       Marca y piel: colores, tipografía, vidrio, botones, modo claro y oscuro
css/puntos.css      Componentes nuevos: puntos, cotizador, CFO, ayuda, notificaciones…
css/shell.css       Encabezado superior (logo, puntos, menú), anuncios, responsive
css/inicio.css      Tipografía de marca y estilos de las pantallas (Inicio, Mis sistemas, ficha guiada, Herramientas…)
css/motion.css      Animaciones: aparición al hacer scroll, indicador del menú
css/legacy-v4.css   Estilos estructurales de la primera versión
js/app.js           Estado, navegación, páginas del portal y del back office
js/puntos.js        Vanguard Points: check-in, rachas, niveles, canje, ganar puntos
js/onboarding.js    Onboarding de 3 pasos
js/anuncios.js      Oferta antes de exportar, PDF con gráfico, Excel (.xlsx), gráfico PNG y anuncios
js/economia.js      Simulador de la economía (back office)
js/theme.js         Modo claro / oscuro
js/motion.js        Movimiento: scroll, barras de progreso, indicador del menú, contador de puntos
assets/             Logos oficiales del manual de marca
docs/               Arquitectura, decisiones, economía de puntos y pendientes
```

## Marca

Colores y tipografía de **Vanguard Strategy** (navy `#0D1B2A`, dorado `#C9A84C`, hielo `#E0E1DD`, solo **Poppins**). La experiencia visual sigue la del SaaS Vanguard CFO: fondo con brillos, tarjetas de vidrio, botones tipo píldora y movimiento suave. Todo el diseño está en variables CSS al inicio de `css/theme.css`.

## Qué leer primero

1. [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md): cómo está armado y qué reemplazar por un backend.
2. [`docs/DECISIONES.md`](docs/DECISIONES.md): lo acordado en la reunión del 30 de octubre de 2026 y su estado.
3. [`docs/ECONOMIA_PUNTOS.md`](docs/ECONOMIA_PUNTOS.md): reglas de los Vanguard Points.
4. [`docs/PENDIENTES.md`](docs/PENDIENTES.md): qué falta para producción.
5. [`docs/AUDITORIA.md`](docs/AUDITORIA.md): criterios de orden de cada pantalla y qué falta reordenar.

## Advertencias

- Todos los datos son ficticios. Los precios, descuentos, días de prueba y beneficios de fundador son **propuestas** sin validar.
- Los números de la economía de puntos (margen, ticket, comisión de pago, ingresos) son supuestos de ejemplo.
- Ninguna conexión externa es real: Mercado Pago, correo, GA4, Shopify y Google Calendar están simulados.

## ERP

El ERP interno que configura este portal está en https://github.com/gamalielecom1/vanguard-erp-demo. Para verlos juntos, clona ambos como carpetas hermanas (`erp/` y `portal-cliente/`) y sirve la carpeta contenedora (ver el README del ERP).
