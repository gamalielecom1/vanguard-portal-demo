/* Vanguard Points (VP): check-in diario, rachas, niveles y canje.
   1 VP = $10. El saldo sale siempre del libro de movimientos (vp.ledger); nunca se edita a mano.
   Todos los valores son propuesta y viven en CFG para calibrarlos con el simulador del back office. */
(function () {
  var TZ = 'America/Santiago', DAY = 86400000;
  var CFG = {
    peg: 10,                                   // $ por punto
    checkin: 5,                                // VP por check-in diario
    bonus: { 7: 20, 14: 40, 30: 100, 60: 200, 90: 300 },   // bono al llegar a N días de racha
    tiers: [{ pts: 500, clp: 5000 }, { pts: 1000, clp: 10000 }, { pts: 1500, clp: 15000 }],
    capPct: 30,                                // tope de descuento por compra
    dailyMinor: 60                             // tope diario de VP por acciones menores (lecciones y opiniones)
  };
  var LEVELS = VGC.use('puntos.niveles', [
    { n: 'Explorador', xp: 0, perks: ['Acceso al portal y a tus sistemas'] },
    { n: 'Socio', xp: 300, perks: ['Insignia de Socio', 'Novedades antes que el resto'] },
    { n: 'Estratega', xp: 1000, perks: ['Prioridad en el Centro de ayuda', 'Tu voto vale doble en la hoja de ruta de Vanguard CFO'] },
    { n: 'Experto', xp: 2500, perks: ['Acceso anticipado a lanzamientos', 'Sesión de bienvenida en cada sistema nuevo'] },
    { n: 'Vanguard', xp: 5000, perks: ['Espacio de opinión con la directiva'] }
  ]);
  var EARN = [
    ['Check-in diario', '5'], ['Racha de 7 / 14 / 30 / 60 / 90 días', '+20 / +40 / +100 / +200 / +300'], ['Onboarding completo', '50'],
    ['Perfil de empresa completo', '100'], ['Lección completada', '10'], ['Asistir a una sesión 1:1', '50'], ['Reseña de un sistema', '150'], ['Referido que compra', '500']
  ];
  var QUESTIONS = VGC.use('contenido.preguntas', [
    ['¿Qué quieres resolver hoy?', ['Ordenar mi caja', 'Cerrar el mes', 'Cobrar mejor', 'Aprender algo']],
    ['¿Con cuántas empresas trabajas esta semana?', ['1', '2 a 3', '4 a 10', 'Más de 10']],
    ['¿Qué te quita más tiempo hoy?', ['Conciliar', 'Impuestos', 'Cobranza', 'Reportes']],
    ['¿Cómo llevas hoy tus números?', ['Sistema propia', 'Software contable', 'Un poco de todo', 'Casi nada aún']],
    ['¿Qué te gustaría que el portal hiciera por ti?', ['Avisarme plazos', 'Armar informes', 'Proyectar caja', 'Enseñarme']],
    ['¿Qué tan seguro estás de tu flujo de caja?', ['Muy seguro', 'Más o menos', 'Poco', 'No lo sé']],
    ['¿Qué te gustaría aprender esta semana?', ['Tributario', 'Finanzas', 'Contabilidad', 'Automatizar']]
  ]);
  var A = null;   // api que entrega app.js
  /* Lo configurado en el ERP manda sobre los valores del simulador (solo si se configuró) */
  function conf() {
    var g = VGC.get, has = VGC.has;
    if (has('puntos.valor')) CFG.peg = g('puntos.valor'); if (has('puntos.checkin')) CFG.checkin = g('puntos.checkin');
    if (has('puntos.tope')) CFG.capPct = g('puntos.tope'); if (has('puntos.menorDiario')) CFG.dailyMinor = g('puntos.menorDiario');
    if (has('puntos.rachas')) { CFG.bonus = {}; g('puntos.rachas').forEach(function (r) { CFG.bonus[r.dias] = r.vp; }); }
    if (has('puntos.canje')) CFG.tiers = g('puntos.canje').map(function (p) { return { pts: p, clp: 0 }; });
    CFG.tiers.forEach(function (t) { t.clp = t.pts * CFG.peg; });
  }
  function pts(k) { return VGC.get('puntos.acciones.' + k); }

  /* ---------- fechas (hora de Chile) ---------- */
  function todayStr(d) { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d || new Date()); }
  function dayNum(s) { var p = s.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / DAY); }
  function weekOf(s) { return Math.floor((dayNum(s) + 3) / 7); }          // semana lunes a domingo
  function dayStr(n) { return new Date(n * DAY).toISOString().slice(0, 10); }
  function fmt(n) { return Number(n).toLocaleString('es-CL'); }
  function clp(n) { return '$' + fmt(Math.round(n)); }

  /* ---------- lógica pura ---------- */
  function balance(vp) { return vp.ledger.reduce(function (a, e) { return a + e.pts; }, 0); }
  function xp(vp) { return vp.ledger.reduce(function (a, e) { return a + (e.pts > 0 ? e.pts : 0); }, 0); }
  function level(vp) {
    var x = xp(vp), i = 0; LEVELS.forEach(function (l, k) { if (x >= l.xp) i = k; });
    var cur = LEVELS[i], nxt = LEVELS[i + 1] || null;
    return { i: i, cur: cur, next: nxt, xp: x, pct: nxt ? Math.round((x - cur.xp) / (nxt.xp - cur.xp) * 100) : 100 };
  }
  function nextTier(bal) {
    for (var i = 0; i < CFG.tiers.length; i++) if (bal < CFG.tiers[i].pts) return { t: CFG.tiers[i], i: i, maxed: false };
    return { t: CFG.tiers[CFG.tiers.length - 1], i: CFG.tiers.length - 1, maxed: true };
  }
  function doneToday(vp) { return vp.last === todayStr(); }
  function checkedDays(vp) { var o = {}; vp.ledger.forEach(function (e) { if (e.k === 'checkin') o[e.day] = true; }); return o; }
  function checkin(vp, answer) {
    var td = todayStr(); if (vp.last === td) return { ok: false };
    var diff = vp.last ? dayNum(td) - dayNum(vp.last) : 99, saved = false;
    if (diff === 1) vp.streak++;
    else if (diff === 2 && vp.freezeWeek !== weekOf(td)) { vp.streak++; vp.freezeWeek = weekOf(td); saved = true; }
    else vp.streak = 1;
    vp.best = Math.max(vp.best || 0, vp.streak); vp.last = td;
    var now = Date.now(), bonus = CFG.bonus[vp.streak] || 0;
    vp.ledger.push({ t: now, day: td, k: 'checkin', pts: CFG.checkin, note: 'Check-in diario' });
    if (bonus) vp.ledger.push({ t: now, day: td, k: 'racha', pts: bonus, note: 'Racha de ' + vp.streak + ' días' });
    if (answer) vp.answers[td] = answer;
    return { ok: true, pts: CFG.checkin, bonus: bonus, streak: vp.streak, saved: saved };
  }
  function redeem(vp, idx) {
    var t = CFG.tiers[idx]; if (!t || balance(vp) < t.pts) return null;
    var code = 'VP-' + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(Math.random() * 90 + 10);
    vp.ledger.push({ t: Date.now(), day: todayStr(), k: 'canje', pts: -t.pts, note: 'Canje · cupón de ' + clp(t.clp) });
    vp.coupons.push({ code: code, clp: t.clp, t: Date.now(), used: false });
    return { code: code, clp: t.clp };
  }

  var MINOR = { leccion: 1, feedback: 1 };
  /* Suma puntos una sola vez por acción (key) y respeta el tope diario de acciones menores. Devuelve los VP dados. */
  function earnOnce(key, k, pts, note, opts) {
    var vp = A.S().vp, td = todayStr(); vp.once = vp.once || {};
    if (key && vp.once[key]) return 0;
    if (opts && opts.max) { var g = key.split(':')[0]; if (Object.keys(vp.once).filter(function (x) { return x.indexOf(g + ':') === 0; }).length >= opts.max) return 0; }
    if (MINOR[k]) { var used = vp.ledger.filter(function (e) { return e.day === td && MINOR[e.k]; }).reduce(function (a, e) { return a + e.pts; }, 0); if (used + pts > CFG.dailyMinor) return 0; }
    if (key) vp.once[key] = Date.now();
    vp.ledger.push({ t: Date.now(), day: td, k: k, pts: pts, note: note });
    A.log('puntos_ganados', '+' + pts + ' VP · ' + note); A.save(); paint(); bump();
    A.toast('+' + pts + ' VP · ' + note);
    return pts;
  }
  function bump() { var b = document.querySelector('.vp-bal'); if (b) { b.classList.add('bump'); setTimeout(function () { b.classList.remove('bump'); }, 900); } }
  function onceCount(prefix) { return Object.keys(A.S().vp.once || {}).filter(function (x) { return x.indexOf(prefix + ':') === 0; }).length; }
  function nextBonus(streak) { var ks = Object.keys(CFG.bonus).map(Number).sort(function (a, b) { return a - b; }); for (var i = 0; i < ks.length; i++) if (ks[i] > streak) return ks[i]; return null; }

  /* ---------- datos de la demo ---------- */
  function defVP(now) {
    var td = dayNum(todayStr(new Date(now))), L = [];
    function add(off, k, pts, note) { L.push({ t: now + off * DAY, day: dayStr(td + off), k: k, pts: pts, note: note }); }
    add(-18, 'leccion', 10, 'Lección completada'); add(-18, 'leccion', 10, 'Lección completada'); add(-18, 'leccion', 10, 'Lección completada');
    add(-12, 'sesion', 50, 'Sesión 1:1 asistida'); add(-5, 'resena', 150, 'Reseña de Control Total Pro');
    for (var d = 11; d >= 1; d--) add(-d, 'checkin', CFG.checkin, 'Check-in diario');
    add(-5, 'racha', 20, 'Racha de 7 días');
    L.sort(function (a, b) { return a.t - b.t; });
    return { ledger: L, streak: 11, best: 11, last: dayStr(td - 1), freezeWeek: null, answers: {}, coupons: [], once: { 'leccion:p1': 1, 'leccion:p2': 1, 'leccion:p3': 1, 'sesion:seed': 1, 'resena:FIN-04': 1 } };
  }
  function defPdfs(now) {
    return [
      { id: 'f1', sku: 'FIN-04', emp: 'a1', nombre: 'Flujo de caja 12 meses · oct 2026.pdf', origen: 'Calculadora', t: now - 3 * DAY, kb: 184 },
      { id: 'f2', sku: 'FIN-04', emp: 'a1', nombre: 'Informe mensual septiembre.pdf', origen: 'Dashboard', t: now - 20 * DAY, kb: 412 },
      { id: 'f3', sku: 'FIN-04', emp: 'a2', nombre: 'Valorización · Transportes Biobío.pdf', origen: 'Calculadora', t: now - 9 * DAY, kb: 236 }
    ];
  }

  /* ---------- barra superior ---------- */
  function paint() {
    var el = A && A.$('vpbar'); if (!el) return;
    var vp = A.S().vp, bal = balance(vp), nt = nextTier(bal), lv = level(vp), done = doneToday(vp);
    var goalTxt = nt.maxed ? 'Llegaste al tramo máximo' : 'Faltan <b>' + fmt(nt.t.pts - bal) + ' VP</b> para ' + clp(nt.t.clp);
    var gp = Math.min(100, Math.round(bal / nt.t.pts * 100));
    var pb = el.querySelector('.vp-bal b'), pv = pb ? parseInt(pb.textContent.replace(/\D/g, ''), 10) : null;
    el.innerHTML =
      '<button class="vp-bal" type="button" data-vpgo title="Ver mis puntos"><span class="vp-coin">VP</span><span><b>' + fmt(bal) + '</b><small>= ' + clp(bal * CFG.peg) + '</small></span></button>' +
      '<div class="vp-goal"><div class="row between small"><span>' + goalTxt + '</span><span class="mono muted">' + fmt(bal) + '/' + fmt(nt.t.pts) + '</span></div><div class="bar"><span style="width:' + gp + '%"></span></div></div>' +
      '<div class="vp-streak" title="Días seguidos con check-in"><span class="vp-flame" aria-hidden="true">' + flame() + '</span><span><b>' + vp.streak + '</b><small>días</small></span></div>' +
      '<div class="vp-level" title="' + (lv.next ? 'Te faltan ' + fmt(lv.next.xp - lv.xp) + ' VP históricos para ' + lv.next.n : 'Nivel máximo') + '"><div class="row between small"><b>Nivel ' + (lv.i + 1) + ' · ' + lv.cur.n + '</b><span class="mono muted">' + lv.pct + '%</span></div><div class="bar thin"><span style="width:' + lv.pct + '%"></span></div></div>' +
      (done ? '<button class="btn btn-sm vp-ci done" type="button" data-vpci disabled>Hecho hoy ✓</button>' : '<button class="btn btn-gold btn-sm vp-ci" type="button" data-vpci>Check-in +' + CFG.checkin + '</button>');
    if (pv !== null && pv !== bal && window.VGM) VGM.count(el.querySelector('.vp-bal b'), pv, bal);
    el.querySelector('[data-vpgo]').onclick = function () { A.show('puntos'); };
    var ci = el.querySelector('[data-vpci]'); if (ci && !done) ci.onclick = openCheckin;
  }
  function flame() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.5 1.5c.4 3-1.4 4.4-3 6.6-1.4 1.9-2.5 3.4-2.5 5.8a4.8 4.8 0 0 0 4.8 5c2.6 0 4.7-2.1 4.7-5 0-2.4-1.2-4.1-2.3-5.8.1 1.3-.3 2.2-1.2 2.7.4-3.1-.1-5.4-.5-9.3z"/></svg>'; }

  /* ---------- check-in ---------- */
  function strip(vp) {
    var td = dayNum(todayStr()), ck = checkedDays(vp), h = '<div class="vp-days">';
    for (var i = 6; i >= 0; i--) {
      var s = dayStr(td - i), on = ck[s], isT = i === 0, wd = new Date((td - i) * DAY).toLocaleDateString('es-CL', { weekday: 'short', timeZone: 'UTC' }).slice(0, 3);
      h += '<div class="vp-day' + (on ? ' on' : '') + (isT ? ' today' : '') + '"><span>' + wd + '</span><i>' + (on ? '✓' : isT ? '+' + CFG.checkin : '·') + '</i></div>';
    }
    return h + '</div>';
  }
  function openCheckin() {
    var S = A.S(), vp = S.vp; if (doneToday(vp)) return;
    var q = QUESTIONS[dayNum(todayStr()) % QUESTIONS.length], pick = null;
    var m = A.openModal('<div class="eyebrow">Check-in diario</div><h2>Suma tus puntos de hoy</h2><p class="muted" style="margin:6px 0 14px">Llevas <b>' + vp.streak + ' días</b> seguidos. Vuelve mañana para llegar a ' + (vp.streak + 1) + '.</p>' + strip(vp) +
      '<div class="q" style="margin-top:14px"><b>' + A.esc(q[0]) + '</b><span class="muted small"> · opcional, nos ayuda a ayudarte mejor</span><div class="qopts">' + q[1].map(function (o, i) { return '<button type="button" data-o="' + i + '" aria-pressed="false">' + A.esc(o) + '</button>'; }).join('') + '</div></div>' +
      '<div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn btn-gold" type="button" id="vp-go">Hacer check-in · +' + CFG.checkin + ' VP</button></div>');
    A.qa(m, '[data-o]').forEach(function (b) { b.onclick = function () { pick = q[1][+b.getAttribute('data-o')]; A.qa(m, '[data-o]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
    m.querySelector('#vp-go').onclick = function () {
      var r = checkin(vp, pick ? { q: q[0], a: pick } : null); if (!r.ok) { A.closeModal(); return; }
      A.log('check_in', 'Racha ' + r.streak + (r.bonus ? ' · bono +' + r.bonus : '')); if (pick) A.log('pregunta_dia', q[0] + ' · ' + pick); A.save(); paint();
      var m2 = A.openModal('<div class="vp-win"><div class="vp-pop">+' + (r.pts + r.bonus) + ' VP</div><h2>¡Listo, día ' + r.streak + '!</h2><p class="muted">' + (r.bonus ? 'Bono de racha incluido: <b>+' + r.bonus + ' VP</b>. ' : '') + (r.saved ? 'Usamos tu día comodín de la semana para no perder la racha. ' : '') + 'Saldo: <b>' + fmt(balance(vp)) + ' VP</b> (' + clp(balance(vp) * CFG.peg) + ').</p>' + strip(vp) + '<div class="row" style="justify-content:center;margin-top:16px"><button class="btn" type="button" id="vp-ver">Ver mis puntos</button><button class="btn btn-gold" type="button" id="vp-ok">Seguir</button></div></div>');
      m2.querySelector('#vp-ok').onclick = A.closeModal; m2.querySelector('#vp-ver').onclick = function () { A.closeModal(); A.show('puntos'); };
      var pg = document.getElementById('pg-puntos'); if (pg && !pg.hidden) page();
    };
  }

  function earnRows() {
    var vp = A.S().vp, nb = nextBonus(vp.streak), ok = '<span class="pill ok">Listo</span>', pend = '<span class="pill neutral">Pendiente</span>';
    return [
      ['Check-in diario', CFG.checkin, doneToday(vp) ? '<span class="pill ok">Hoy ✓</span>' : pend],
      ['Bono de racha', (function () { var v = Object.keys(CFG.bonus).map(function (k) { return CFG.bonus[k]; }).sort(function (a, b) { return a - b; }); return v.length ? '+' + v[0] + ' a +' + v[v.length - 1] : '—'; })(), 'Racha ' + vp.streak + (nb ? ' · próximo bono al día ' + nb + ' (+' + CFG.bonus[nb] + ')' : ' · todos los bonos ganados')],
      ['Onboarding completo', pts('onboarding'), vp.once.onboarding ? ok : pend],
      ['Ficha de empresa completa (hasta ' + pts('perfilMax') + ')', pts('perfil') + ' c/u', onceCount('perfil') + ' de ' + pts('perfilMax')],
      ['Lección completada', pts('leccion'), onceCount('leccion') + ' ganadas'],
      ['Opinión sobre una lección', pts('feedback'), onceCount('fb') + ' ganadas'],
      ['Voto en la hoja de ruta de CFO', pts('voto'), onceCount('voto') + ' de 3'],
      ['Sesión 1:1 asistida', pts('sesion'), onceCount('sesion') + ' ganadas'],
      ['Reseña de un sistema', pts('resena'), onceCount('resena') + ' ganadas'],
      ['Referido que compra', pts('referido'), 'Se acredita cuando tu referido compra']
    ];
  }
  function refCode() { var n = A.S().user.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, ''); return 'VG-' + n.slice(0, 6) + '-' + (dayNum(A.S().user.alta || todayStr()) % 900 + 100); }

  /* ---------- página de puntos ---------- */
  function page() {
    var S = A.S(), vp = S.vp, bal = balance(vp), lv = level(vp), nt = nextTier(bal), el = A.$('pg-puntos');
    var h = '<div><h1 class="page-title">Puntos y niveles</h1><p class="muted">Cada día que entras sumas puntos. Los puntos se canjean por descuento en tus compras; el nivel sube con el tiempo y va desbloqueando cosas.</p></div>';
    h += '<section class="card vp-hero"><div class="vp-hero-main"><div class="eyebrow">Saldo</div><div class="vp-big"><span class="vp-coin lg">VP</span><b>' + fmt(bal) + '</b></div><div class="muted">equivale a <b>' + clp(bal * CFG.peg) + '</b> de descuento · 1 VP = ' + clp(CFG.peg) + '</div>' +
      '<div class="row" style="margin-top:14px">' + (doneToday(vp) ? '<button class="btn" disabled>Check-in de hoy hecho ✓</button>' : '<button class="btn btn-gold" type="button" id="pt-ci">Hacer check-in · +' + CFG.checkin + ' VP</button>') + '<span class="pill gold">Racha ' + vp.streak + ' días</span><span class="pill neutral">Mejor racha ' + vp.best + '</span></div></div>' +
      '<div class="vp-hero-side">' + strip(vp) + '<div class="muted small" style="margin-top:8px">Un día comodín por semana: si faltas un día, no pierdes la racha.</div></div></section>';
    h += '<section class="card"><div class="card-head"><div><div class="eyebrow">Canje</div><h3>Convierte tus puntos en descuento</h3></div><span class="muted small">Tope ' + CFG.capPct + '% por compra · mínimo 500 VP · vencen a los 12 meses</span></div><div class="vp-tiers">' +
      CFG.tiers.map(function (t, i) { var ok = bal >= t.pts, pct = Math.min(100, Math.round(bal / t.pts * 100)); return '<div class="vp-tier' + (ok ? ' ok' : '') + '"><div class="vp-t-top"><b>' + clp(t.clp) + '</b><span class="muted small">' + fmt(t.pts) + ' VP</span></div><div class="bar' + (ok ? ' ok' : '') + '"><span style="width:' + pct + '%"></span></div><button class="btn btn-sm' + (ok ? ' btn-gold' : '') + '" type="button" data-rd="' + i + '"' + (ok ? '' : ' disabled') + '>' + (ok ? 'Canjear' : 'Faltan ' + fmt(t.pts - bal) + ' VP') + '</button></div>'; }).join('') + '</div>' +
      (vp.coupons.length ? '<div class="list" style="margin-top:14px">' + vp.coupons.map(function (c) { return '<div class="row between"><span><span class="code">' + c.code + '</span> <b>' + clp(c.clp) + '</b> de descuento</span><span class="pill ' + (c.used ? 'neutral' : 'ok') + '">' + (c.used ? 'Usado' : 'Disponible') + '</span></div>'; }).join('') + '</div>' : '') +
      '<p class="muted small" style="margin-top:12px">El cupón se aplica al pagar con Mercado Pago y no se suma a otros descuentos: se usa el mejor de los dos. (Maqueta: el pago real se conecta en una fase posterior.)</p></section>';
    h += '<div class="grid2"><section class="card"><div class="card-head"><div><div class="eyebrow">Nivel</div><h3>Nivel ' + (lv.i + 1) + ' · ' + lv.cur.n + '</h3></div><span class="pill info">Propuesta</span></div>' +
      '<div class="row between small"><span class="muted">' + (lv.next ? 'Siguiente: ' + lv.next.n : 'Nivel máximo') + '</span><span class="mono">' + fmt(lv.xp) + (lv.next ? ' / ' + fmt(lv.next.xp) : '') + ' VP históricos</span></div><div class="bar" style="margin:6px 0 16px"><span style="width:' + lv.pct + '%"></span></div>' +
      '<div class="vp-levels">' + LEVELS.map(function (l, i) { var st = i < lv.i ? 'done' : i === lv.i ? 'cur' : 'lock'; return '<div class="vp-lvl ' + st + '"><span class="vp-lvn">' + (st === 'lock' ? '🔒' : i + 1) + '</span><div><b>' + l.n + '</b> <span class="muted small">· ' + fmt(l.xp) + ' VP</span><ul>' + l.perks.map(function (p) { return '<li>' + A.esc(p) + '</li>'; }).join('') + '</ul></div></div>'; }).join('') + '</div>' +
      '<p class="muted small" style="margin-top:10px">El nivel cuenta todo lo que has ganado y nunca baja, aunque gastes tus puntos.</p></section>' +
      '<section class="card" style="order:-1"><div class="card-head"><div><div class="eyebrow">Cómo ganar</div><h3>Formas de sumar puntos</h3></div></div><div class="tbl-wrap"><table><tr><th>Acción</th><th class="num">VP</th><th>Tu estado</th></tr>' + earnRows().map(function (r) { return '<tr><td>' + r[0] + '</td><td class="num">' + r[1] + '</td><td class="small muted">' + r[2] + '</td></tr>'; }).join('') + '</table></div><p class="muted small" style="margin-top:10px">Lecciones y opiniones suman hasta ' + CFG.dailyMinor + ' VP por día. Cada acción puntúa una sola vez.</p></section></div>';
    h += '<section class="card"><div class="card-head"><div><div class="eyebrow">Referidos</div><h3>Invita a un colega y suma 500 VP</h3></div><span class="pill info">Propuesta</span></div><div class="row"><span class="code">' + refCode() + '</span><button class="btn btn-sm" type="button" id="pt-copy">Copiar enlace</button></div><p class="muted small" style="margin-top:10px">Cuando tu referido compre y pase el período de devolución, recibes 500 VP (' + clp(500 * CFG.peg) + ') y él un descuento de bienvenida. Los referidos se acreditan solos; no hay tope de invitaciones, pero no se pueden autorreferir.</p></section>';
    var rows = vp.ledger.slice().sort(function (a, b) { return b.t - a.t; }).slice(0, 12);
    h += '<section class="card"><div class="card-head"><h3>Últimos movimientos</h3><span class="muted small">Cada punto queda registrado</span></div><div class="tbl-wrap"><table><tr><th>Fecha</th><th>Motivo</th><th class="num">VP</th></tr>' + rows.map(function (e) { return '<tr><td>' + new Date(e.t).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) + '</td><td>' + A.esc(e.note) + '</td><td class="num ' + (e.pts < 0 ? 'down' : 'up') + '">' + (e.pts > 0 ? '+' : '') + e.pts + '</td></tr>'; }).join('') + '</table></div></section>';
    el.innerHTML = h;
    var b = el.querySelector('#pt-ci'); if (b) b.onclick = openCheckin;
    var cp = el.querySelector('#pt-copy'); if (cp) cp.onclick = function () { var u = 'https://vanguardstt.com/?ref=' + refCode(); try { navigator.clipboard.writeText(u); } catch (e) {} A.log('referido_copiado', refCode()); A.toast('Enlace copiado: ' + u); };
    A.qa(el, '[data-rd]').forEach(function (x) { x.onclick = function () {
      var r = redeem(vp, +x.getAttribute('data-rd')); if (!r) return;
      A.log('canje_puntos', clp(r.clp)); A.save(); paint(); page(); A.toast('Cupón ' + r.code + ' de ' + clp(r.clp) + ' listo');
    }; });
  }

  window.VGX = {
    CFG: CFG, doneToday: doneToday, defVP: defVP, defPdfs: defPdfs, balance: balance, level: level, checkin: checkin, redeem: redeem, paint: paint,
    applyConf: conf, pts: pts,
    applyCfg: function (c) { if (!c) return; CFG.checkin = c.checkin; CFG.peg = c.peg; CFG.capPct = c.capPct; CFG.dailyMinor = c.dailyMinor; CFG.tiers.forEach(function (t) { t.clp = t.pts * CFG.peg; }); if (A) paint(); },
    earnOnce: function (key, k, pts, note, opts) { return A ? earnOnce(key, k, pts, note, opts) : 0; },
    earn: function (k, pts, note) { return earnOnce(k, k, pts, note); },
    init: function (api) { A = api; A.R.puntos = page; paint(); }
  };
})();
