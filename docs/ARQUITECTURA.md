# Arquitectura del prototipo

## Idea general

Una sola página (`index.html`) con muchas secciones `main.page`. Cada sección tiene un id `pg-<nombre>` y una función de dibujo `R.<nombre>()` que escribe su HTML. `show('<nombre>')` oculta todas las páginas, muestra una y la dibuja. La navegación por dirección usa el hash (`#puntos`, `#clientes`).

No hay framework ni paso de compilación. Los scripts se cargan en este orden y el orden importa: `theme → puntos → onboarding → anuncios → economia → app`. `app.js` va al final porque usa a los demás.

## Marco de la aplicación

Encabezado superior fijo en dos filas (`header.topnav`, estilos en `css/shell.css`):

- **Fila A:** logo, chip de puntos con check-in (`#vpbar`), modo claro/oscuro, ayuda, campana de novedades y menú de cuenta (`#av`). En el back office muestra el selector de configuración (`#bo-tools`).
- **Fila B:** navegación principal con íconos (`#nav-portal`) o la del back office (`#nav-bo`). Si no cabe, se desplaza horizontalmente.
- **Anuncios** (`#announce`): una barra bajo el encabezado, un anuncio a la vez con paginador. Solo aparece en Inicio.

Las secciones se muestran con `show('<pagina>')`. Configuración (Perfil, Pagos, Puntos, Centro de ayuda) se abre desde el menú de cuenta y tiene sus propias pestañas internas.

## Estado

Un solo objeto `S`, guardado en `localStorage` con la clave `vg-portal-v4`. `defState()` lo crea; al cargar se migra cualquier estado antiguo (bloque de `if (!S.xxx)` justo después de `defState`). Campos principales:

| Campo | Qué guarda |
|---|---|
| `user`, `empresas`, `cur` | Persona, sus empresas y la empresa activa |
| `owned`, `steps`, `cursos`, `vistas`, `feedback` | Sistemas comprados, puesta en marcha, lecciones vistas, opiniones |
| `pdfs` | Registro de PDF por sistema y empresa (solo metadatos, no el archivo) |
| `sesiones`, `tareas`, `proyectos`, `tar` | Sesiones 1:1, tareas, solicitudes de proyecto y tarifario |
| `vp` | Puntos: `ledger` (libro de movimientos), `once` (acciones ya premiadas), racha, cupones |
| `onb`, `ads`, `offers`, `reviews`, `cards` | Onboarding, anuncios, cupones de oferta, reseñas, tarjetas simuladas |
| `cfo`, `cfoCfg`, `cfoUpd` | Vanguard CFO: miembro fundador, votos, bitácora |
| `tickets`, `pagos`, `leads`, `events` | Soporte, historial de pagos, formularios de interés, eventos |
| `eco`, `reeng` | Reglas de la economía de puntos y del reenganche automático |

El saldo de puntos **no se guarda**: se calcula siempre sumando `vp.ledger`.

## Módulos

Cada módulo expone un objeto global y recibe una API desde `app.js` (`VAPI`: `S()`, `save`, `log`, `toast`, `openModal`, `closeModal`, `show`, `R`, `esc`, `$`, `qa`, `money`, `P`, `recs`…).

| Módulo | Objeto | Responsabilidad |
|---|---|---|
| `puntos.js` | `VGX` | Barra de puntos, check-in, rachas, niveles, canje, `earnOnce` (premiar una sola vez), `applyCfg` |
| `onboarding.js` | `VGO` | Onboarding de 3 pasos, +50 VP |
| `anuncios.js` | `VGA` | Oferta al exportar PDF, generador de PDF sin librerías, anuncios flotantes con descuento progresivo |
| `economia.js` | `VGE` | Simulador de economía y botón «Aplicar al portal» |

## Páginas

**Portal:** `inicio`, `empresas`, `productos` (Mis sistemas), `cursos`, `herramientas`, `sesiones`, `proyectos` (cotizador de 3 pasos), `cfo`, `novedades`, y las de Configuración: `perfil`, `pagos`, `puntos`, `ayuda`.

**Back office:** `clientes`, `ficha`, `bandeja` (Oportunidades), `soporte` (Tickets), `alertas` (Notificaciones), `analitica` · `cursosprod` · `actividad` · `trafico` (Analítica de uso del portal), `voz`, `admcfo`, `suscripciones`, y de configuración: `reglas`, `tarifario`, `admcursos`, `lanzamientos`, `datos`, `economia`, `reenganche`.

Cada `R.<nombre>` está definida una sola vez, salvo `R.analitica`, que tiene dos versiones a propósito: la segunda alimenta a `anValor`, que la reutiliza la versión final.

## Qué hay que reemplazar por un backend

| Hoy (simulado) | Debe ser |
|---|---|
| `localStorage` + `save()` | API con base de datos por cliente y empresa |
| `vp.ledger` en el navegador | Libro de movimientos en el servidor; acreditar puntos solo desde el servidor, con tope diario y control de duplicados |
| Cupones y precios descontados | Se crean en el servidor y viajan a Mercado Pago en el `external_reference` de la orden |
| PDF generados (`VGA`) | Guardar el archivo (almacenamiento de objetos) y ligarlo a sistema + empresa |
| Correos de reenganche y avisos | Servicio de correo y una tarea programada diaria (09:00) |
| `window.open` a la demo de CFO | Enlace con sesión a la app real |
| Datos de la pestaña «Páginas y fuentes» | Google Analytics 4 (Data API) |
| `sampleClients()` del back office | Clientes reales (Shopify + portal) |
| `defState()` | Registro y login reales; el estado inicial sale de la compra |

## Flujo de pago previsto (Mercado Pago)

1. El cliente elige cuántos puntos usar → el servidor valida saldo y el tope de descuento.
2. Reserva los puntos (estado «retenido»).
3. Crea la preferencia de pago con el precio ya descontado y `external_reference` = id de orden.
4. Webhook de Mercado Pago: pago aprobado → descuenta los puntos de forma definitiva y acredita los de la compra; rechazado o vencido → libera la reserva.

Revisar la documentación vigente de Mercado Pago antes de implementarlo.

## Convenciones

- Español de Chile, tuteo. Cifras con formato chileno (`$53.900.000`).
- Marca: variables CSS en `css/theme.css`. No usar otra tipografía que Poppins.
- Nada de datos personales reales en el repositorio.
