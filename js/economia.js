/* Simulador de la economía de puntos (back office).
   Modela cuántos Vanguard Points se emiten, qué cuestan, cuánto margen queda en una venta con descuento
   y cuántos de esos canjes deben ser ventas nuevas para que el programa no pierda plata.
   Los valores de partida son de ejemplo: hay que reemplazar margen, ticket y comisión por los reales. */
(function () {
  var A = null;
  var RULES = [
    ['checkin', 'VP por check-in diario', 'VP', 1], ['peg', 'Valor de 1 VP', '$', 1], ['capPct', 'Tope de descuento por compra', '%', 1],
    ['dailyMinor', 'Tope diario en lecciones y opiniones', 'VP', 5], ['budgetPct', 'Presupuesto de emisión (% de ingresos del portal)', '%', .5]
  ];
  var SIM = [
    ['N', 'Clientes activos en el portal', '', 10, 'g1'], ['pCon', 'Constantes (6 a 7 días por semana)', '%', 5, 'g1'], ['pCas', 'Casuales (3 a 4 días por semana)', '%', 5, 'g1'],
    ['actCon', 'VP por acciones únicas, constante (90 días)', 'VP', 25, 'g2'], ['actCas', 'VP por acciones únicas, casual (90 días)', 'VP', 25, 'g2'],
    ['redeem', 'Elegibles que canjean', '%', 5, 'g3'], ['inc', 'Canjes que son ventas nuevas', '%', 5, 'g3'],
    ['ticket', 'Ticket promedio de la compra', '$', 5000, 'g4'], ['margin', 'Margen bruto del producto', '%', 1, 'g4'], ['fee', 'Comisión de pago (confirmar con Mercado Pago)', '%', .1, 'g4'],
    ['rev', 'Ingresos del portal en el período', '$', 500000, 'g5'], ['days', 'Días del período', 'días', 15, 'g5']
  ];
  function def() {
    var cfg = { checkin: 5, peg: 10, capPct: 30, dailyMinor: 60, budgetPct: 5 };
    return { cfg: cfg, applied: JSON.parse(JSON.stringify(cfg)),
      sim: { N: 100, pCon: 25, pCas: 40, actCon: 350, actCas: 200, redeem: 50, inc: 50, ticket: 60000, margin: 80, fee: 3.5, rev: 15000000, days: 90 } };
  }
  function fmt(n) { return Number(Math.round(n)).toLocaleString('es-CL'); }
  function clp(n) { return (n < 0 ? '-$' : '$') + fmt(Math.abs(n)); }
  function pct(n, d) { return (n * 100).toFixed(d == null ? 1 : d).replace('.', ',') + '%'; }

  /* ---------- modelo ---------- */
  function model(E) {
    var c = E.cfg, s = E.sim, V = window.VGX.CFG, tiers = V.tiers, bonus = V.bonus;
    var prof = [
      { k: 'con', n: 'Constantes', share: s.pCon / 100, freq: .9, act: s.actCon, streak: true },
      { k: 'cas', n: 'Casuales', share: s.pCas / 100, freq: 3.5 / 7, act: s.actCas, streak: false },
      { k: 'ina', n: 'Poco activos', share: Math.max(0, 1 - s.pCon / 100 - s.pCas / 100), freq: .1, act: 50, streak: false }
    ];
    function vpAt(p, d) { var b = 0; if (p.streak) Object.keys(bonus).forEach(function (m) { if (+m <= d) b += bonus[m]; }); return d * p.freq * c.checkin + b + p.act * Math.min(1, d / 60); }
    function dayFor(p, pts) { for (var d = 1; d <= 365; d++) if (vpAt(p, d) >= pts) return d; return null; }
    var cap = c.capPct / 100 * s.ticket, m = s.margin / 100, fee = s.fee / 100, inc = s.inc / 100, red = s.redeem / 100;
    var rows = prof.map(function (p) {
      var users = s.N * p.share, v = vpAt(p, s.days), eligible = v >= tiers[0].pts;
      var D = eligible ? Math.min(v * c.peg, cap) : 0, price = s.ticket - D, profit = price * (1 - fee) - s.ticket * (1 - m);
      var redeemers = eligible ? users * red : 0;
      return { p: p, users: users, v: v, eligible: eligible, D: D, profit: profit, redeemers: redeemers, cost: redeemers * D,
        net: redeemers * (inc * profit - (1 - inc) * D), marginPct: price > 0 ? profit / price : 0, days: tiers.map(function (t) { return dayFor(p, t.pts); }) };
    });
    var emitVP = rows.reduce(function (a, r) { return a + r.users * r.v; }, 0), cost = rows.reduce(function (a, r) { return a + r.cost; }, 0), net = rows.reduce(function (a, r) { return a + r.net; }, 0);
    var sumD = rows.reduce(function (a, r) { return a + r.redeemers * r.D; }, 0), sumP = rows.reduce(function (a, r) { return a + r.redeemers * (r.profit + r.D); }, 0);
    var full = s.ticket * (1 - fee) - s.ticket * (1 - m), budget = c.budgetPct / 100 * s.rev;
    var best = rows.filter(function (r) { return r.eligible; })[0];
    return { rows: rows, emitVP: emitVP, emitCLP: emitVP * c.peg, cost: cost, net: net, breakeven: sumP ? sumD / sumP : 0, full: full, fullMargin: full / s.ticket, budget: budget,
      emitPct: s.rev ? emitVP * c.peg / s.rev : 0, costPct: s.rev ? cost / s.rev : 0, best: best, vpAt: vpAt, prof: prof, redeemers: rows.reduce(function (a, r) { return a + r.redeemers; }, 0),
      sens: function (r2, i2) { return rows.reduce(function (a, r) { var rd = r.eligible ? r.users * r2 : 0; return a + rd * (i2 * r.profit - (1 - i2) * r.D); }, 0); } };
  }

  /* ---------- gráfico ---------- */
  function chart(M, E) {
    var W = 640, H = 230, L = 46, T = 14, B = 28, R = 12, days = E.sim.days, tiers = window.VGX.CFG.tiers;
    var ymax = Math.max(tiers[2].pts * 1.1, Math.max.apply(null, M.rows.map(function (r) { return r.v; })) * 1.05);
    function x(d) { return L + d / days * (W - L - R); } function y(v) { return H - B - v / ymax * (H - T - B); }
    var g = '';
    tiers.forEach(function (t) { g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t.pts) + '" y2="' + y(t.pts) + '" class="ec-tier"/><text x="' + (L - 6) + '" y="' + (y(t.pts) + 4) + '" text-anchor="end">' + fmt(t.pts) + '</text>'; });
    [0, .25, .5, .75, 1].forEach(function (f) { var d = Math.round(days * f); g += '<text x="' + x(d) + '" y="' + (H - 8) + '" text-anchor="middle">' + d + '</text>'; });
    function path(p) { var pts = []; for (var d = 0; d <= days; d += Math.max(1, Math.round(days / 90))) pts.push(x(d).toFixed(1) + ',' + y(M.vpAt(p, d)).toFixed(1)); return pts.join(' '); }
    g += '<polyline class="ec-l1" points="' + path(M.prof[0]) + '"/><polyline class="ec-l2" points="' + path(M.prof[1]) + '"/><polyline class="ec-l3" points="' + path(M.prof[2]) + '"/>';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ec-chart" role="img" aria-label="VP acumulados por perfil durante el período">' + g + '</svg><div class="legend"><span><i style="background:var(--gold-fill)"></i>Constantes</span><span><i style="background:var(--info)"></i>Casuales</span><span><i style="background:var(--muted)"></i>Poco activos</span><span class="muted">Días del período en el eje horizontal</span></div>';
  }

  /* ---------- página ---------- */
  function field(group, E, f) {
    var k = f[0], isCfg = group === 'cfg', v = (isCfg ? E.cfg : E.sim)[k];
    return '<label class="f ec-f"><span>' + f[1] + (f[2] ? ' <i class="muted">(' + f[2] + ')</i>' : '') + '</span><input type="number" step="' + (f[3] >= 1 ? 1 : f[3]) + '" min="0" data-ec="' + group + ':' + k + '" value="' + v + '"></label>';
  }
  function results() {
    var E = A.S().eco, M = model(E), c = E.cfg, s = E.sim, el = A.$('ec-out'), T = window.VGX.CFG.tiers;
    var okE = M.emitCLP <= M.budget, okC = M.cost <= M.budget, share = 100 - s.pCon - s.pCas;
    var h = '';
    if (share < 0) h += '<div class="note"><span>!</span><span>Constantes y casuales suman más de 100%. Ajusta los porcentajes.</span></div>';
    h += '<div class="stats">' +
      [['VP emitidos', fmt(M.emitVP), 'en ' + s.days + ' días'], ['Pasivo máximo', clp(M.emitCLP), pct(M.emitPct) + ' de los ingresos'], ['Costo esperado', clp(M.cost), pct(M.costPct) + ' de los ingresos · solo con venta'], ['Margen de la venta', pct(M.best ? M.best.marginPct : M.fullMargin), 'con descuento · ' + pct(M.fullMargin) + ' sin descuento'], ['Equilibrio', pct(M.breakeven, 0), 'canjes que deben ser ventas nuevas'], ['Resultado neto', clp(M.net), 'con ' + s.inc + '% de ventas nuevas']].map(function (x, i) { return '<div class="stat"><span class="muted small">' + x[0] + '</span><span class="v ' + (i === 5 ? (M.net >= 0 ? 'up' : 'down') : '') + '">' + x[1] + '</span><span class="d muted">' + x[2] + '</span></div>'; }).join('') + '</div>';
    h += '<section class="card"><div class="card-head"><div><div class="eyebrow">Salud</div><h3>¿Se sostiene?</h3></div></div><div class="list small">' +
      '<div class="row between"><span>Emisión frente al presupuesto (' + clp(M.budget) + ')</span><span class="pill ' + (okE ? 'ok' : 'bad') + '">' + (okE ? 'Dentro' : 'Sobre el presupuesto') + '</span></div>' +
      '<div class="row between"><span>Costo esperado frente al presupuesto</span><span class="pill ' + (okC ? 'ok' : 'bad') + '">' + (okC ? 'Dentro' : 'Sobre el presupuesto') + '</span></div>' +
      '<div class="row between"><span>Resultado con ' + s.inc + '% de ventas nuevas</span><span class="pill ' + (M.net >= 0 ? 'ok' : 'bad') + '">' + (M.net >= 0 ? 'El programa gana' : 'El programa pierde') + '</span></div>' +
      '<div class="row between"><span>Canjes esperados</span><b>' + fmt(M.redeemers) + ' clientes</b></div></div>' +
      '<p class="muted small" style="margin-top:10px">Lectura: para que el descuento no se coma el margen, al menos <b>' + pct(M.breakeven, 0) + '</b> de los canjes tienen que ser compras que no habrían ocurrido sin el programa. Si la mayoría son clientes que igual iban a comprar, el descuento es plata regalada.</p></section>';
    h += '<section class="card"><div class="card-head"><div><div class="eyebrow">Camino</div><h3>VP acumulados por perfil</h3></div></div>' + chart(M, E) + '</section>';
    h += '<section class="card"><div class="card-head"><div><div class="eyebrow">Perfiles</div><h3>Cuándo llega cada uno a un tramo</h3></div></div><div class="tbl-wrap"><table><tr><th>Perfil</th><th class="num">Clientes</th><th class="num">VP al cierre</th>' + T.map(function (t) { return '<th class="num">' + clp(t.clp) + '</th>'; }).join('') + '<th class="num">Descuento</th><th class="num">Margen venta</th></tr>' + M.rows.map(function (r) {
      return '<tr><td><b>' + r.p.n + '</b></td><td class="num">' + fmt(r.users) + '</td><td class="num">' + fmt(r.v) + '</td>' + r.days.map(function (d) { return '<td class="num">' + (d ? 'día ' + d : '—') + '</td>'; }).join('') + '<td class="num">' + (r.eligible ? clp(r.D) : '—') + '</td><td class="num">' + (r.eligible ? pct(r.marginPct) : '—') + '</td></tr>'; }).join('') + '</table></div><p class="muted small" style="margin-top:8px">Meta de diseño: que un cliente constante llegue a un descuento relevante en 2 o 3 meses.</p></section>';
    var reds = [.3, .5, .7, 1], incs = [0, .25, .5, .75, 1];
    h += '<section class="card"><div class="card-head"><div><div class="eyebrow">Sensibilidad</div><h3>Resultado neto según canje y ventas nuevas</h3></div></div><div class="tbl-wrap"><table class="sens"><tr><th>Canjean ↓ · Nuevas →</th>' + incs.map(function (i) { return '<th>' + Math.round(i * 100) + '%</th>'; }).join('') + '</tr>' + reds.map(function (r) { return '<tr><td>' + Math.round(r * 100) + '%</td>' + incs.map(function (i) { var v = M.sens(r, i); return '<td class="' + (v < 0 ? 'neg' : '') + (Math.abs(r - s.redeem / 100) < .001 && Math.abs(i - s.inc / 100) < .001 ? ' c' : '') + '">' + clp(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div></section>';
    el.innerHTML = h;
    var ap = A.$('ec-state'); if (ap) { var same = JSON.stringify(E.applied) === JSON.stringify(E.cfg); ap.className = 'pill ' + (same ? 'ok' : 'warn'); ap.textContent = same ? 'Reglas aplicadas al portal' : 'Cambios sin aplicar'; }
  }
  function page() {
    var E = A.S().eco, el = A.$('pg-economia');
    var grp = { g1: 'Clientes', g2: 'Acciones únicas', g3: 'Comportamiento', g4: 'Producto', g5: 'Período' }, cur = '', sh = '';
    SIM.forEach(function (f) { if (f[4] !== cur) { cur = f[4]; sh += '<h4 class="ec-h">' + grp[cur] + '</h4>'; } sh += field('sim', E, f); });
    el.innerHTML = '<div class="row between" style="align-items:end"><div><div class="eyebrow">Configuración</div><h1 class="page-title">Economía de puntos</h1><p class="muted">Calibra las reglas de los Vanguard Points antes de lanzarlas. Mueve un valor y mira cómo cambian la emisión, el costo y el margen.</p></div><span class="pill warn" id="ec-state"></span></div>' +
      '<div class="note"><span>i</span><span><b>Valores de ejemplo.</b> Margen, ticket, comisión e ingresos son supuestos: reemplázalos por los reales de tus productos y de Mercado Pago antes de decidir.</span></div>' +
      '<div class="eco-grid"><aside class="stack"><section class="card"><div class="card-head"><div><div class="eyebrow">Reglas</div><h3>La economía</h3></div></div><div class="list">' + RULES.map(function (f) { return field('cfg', E, f); }).join('') +
      '<p class="muted small">Los VP vencen a los 12 meses. Las reglas se aplican al portal con el botón de abajo.</p><div class="row"><button class="btn btn-gold btn-sm" type="button" id="ec-apply">Aplicar al portal</button><button class="link" type="button" id="ec-reset">Restaurar valores</button></div></div></section>' +
      '<section class="card"><div class="card-head"><div><div class="eyebrow">Escenario</div><h3>Supuestos</h3></div></div><div class="list">' + sh + '</div></section></aside><div class="stack" id="ec-out"></div></div>';
    A.qa(el, '[data-ec]').forEach(function (inp) { inp.oninput = function () { var p = inp.getAttribute('data-ec').split(':'), v = parseFloat(inp.value); (p[0] === 'cfg' ? E.cfg : E.sim)[p[1]] = isFinite(v) && v >= 0 ? v : 0; A.save(); results(); }; });
    A.$('ec-apply').onclick = function () { window.VGX.applyCfg(E.cfg); VGC.set('puntos.valor', E.cfg.peg); VGC.set('puntos.checkin', E.cfg.checkin); VGC.set('puntos.tope', E.cfg.capPct); VGC.set('puntos.menorDiario', E.cfg.dailyMinor); E.applied = JSON.parse(JSON.stringify(E.cfg)); A.log('economia_aplicada', JSON.stringify(E.cfg)); A.save(); results(); A.toast('Reglas aplicadas al portal'); };
    A.$('ec-reset').onclick = function () { var d = def(); E.cfg = d.cfg; E.sim = d.sim; A.save(); page(); };
    results();
  }

  window.VGE = { def: def, model: model, init: function (api) { A = api; A.R.economia = page; window.VGX.applyCfg(A.S().eco.cfg); } };
})();
