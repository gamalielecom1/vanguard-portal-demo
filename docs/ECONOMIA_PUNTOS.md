# Economía de Vanguard Points (VP)

Todos los valores viven en `VGX.CFG` (`js/puntos.js`) y se pueden calibrar desde el back office en `#economia`. Son **propuestas**.

## Principios

1. **1 VP = $10 CLP.** Si la economía hay que ajustarla, se mueven las tasas de ganancia, no el valor del punto.
2. **Todo es un libro de movimientos** (`vp.ledger`). El saldo se calcula sumando; nunca se edita.
3. **El costo ocurre solo con una venta.** Los puntos solo se gastan como descuento contra una compra real.
4. **Dos medidores**, como en los juegos: el *saldo* (se gana, se gasta, vence) y el *nivel* (suma todo lo ganado, nunca baja).
5. **Presupuesto de emisión:** lo regalado en un período no debe pasar de un porcentaje de los ingresos del portal (5% de partida).

## Cómo se ganan

| Acción | VP | Regla |
|---|---|---|
| Check-in diario | 5 | Una vez al día, hora de Chile (`America/Santiago`) |
| Racha de 7 / 14 / 30 / 60 / 90 días | +20 / +40 / +100 / +200 / +300 | Un día comodín por semana |
| Onboarding completo | 50 | Una vez |
| Ficha de empresa al 100% | 100 | Una vez por empresa, hasta 3 |
| Lección completada | 10 | Una vez por lección |
| Opinión sobre una lección | 5 | Una vez por lección |
| Voto en la hoja de ruta de CFO | 20 | Una vez por ítem |
| Sesión 1:1 asistida | 50 | Al cerrar la sesión el asesor |
| Reseña de un sistema | 150 | Una vez por sistema |
| Referido que compra | 500 | **Falta construirlo**; hoy solo muestra el código |

Tope diario de **60 VP** entre lecciones y opiniones. Cada acción puntúa una sola vez (`earnOnce`).

## Cómo se canjean

Solo como descuento, en tramos de **500 / 1.000 / 1.500 VP** ($5.000 / $10.000 / $15.000). Tope del **30%** de la compra. No se suma con otros descuentos: se usa el mejor. Los VP vencen a los 12 meses (el vencimiento aún no está implementado).

## Niveles (propuesta)

| Nivel | VP históricos | Beneficios propuestos |
|---|---|---|
| Explorador | 0 | Acceso al portal |
| Socio | 300 | Insignia, novedades antes que el resto |
| Estratega | 1.000 | Prioridad en el Centro de ayuda, voto doble en la hoja de ruta |
| Experto | 2.500 | Acceso anticipado a lanzamientos, sesión de bienvenida |
| Vanguard | 5.000 | Espacio de opinión con la directiva |

Hoy los beneficios son informativos: no hay nada bloqueado detrás del nivel.

## Antiabuso (por implementar en el servidor)

- El check-in usa la hora del servidor, un máximo por día.
- Los referidos solo pagan cuando su compra pasó el período de devolución.
- Un reembolso descuenta los puntos que dio.
- Se bloquean los autorreferidos.
- Todo cambio de saldo queda en el libro con fecha, origen y orden de pago.

## Descuentos relacionados

- **Popup al exportar un PDF:** 50% sobre el producto relacionado, cupón de 48 horas.
- **Anuncios en Inicio:** 10% al inicio, 15% pasadas 24 h, 20% pasadas 48 h.
- Ninguno se suma con los puntos.

## Cómo leer el simulador

Con los supuestos de ejemplo (100 clientes, ticket $60.000, margen 80%, comisión 3,5%): se emiten ~55.700 VP, el costo esperado es ~$177.000 y el programa necesita que al menos ~30% de los canjes sean ventas nuevas para no perder plata. **Margen, ticket y comisión son supuestos**: reemplazarlos por los reales antes de decidir.
