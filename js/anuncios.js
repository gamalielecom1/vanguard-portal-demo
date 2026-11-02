/* Ofertas dentro del portal:
   1) Exportar a PDF desde una calculadora: popup de oferta (50% según la reunión) y descarga de un PDF real.
   2) Anuncios flotantes en Inicio (reemplazan la sección "Para ti"): recomendación con descuento progresivo
      (10%, 15% y 20% según pasan 24 h y 48 h), novedades, puntos y Vanguard CFO.
   Porcentajes y vigencias son propuesta; viven en CFG. */
(function () {
  var CFG = { pdfPct: VGC.get('ofertas.pdfPct'), couponHours: VGC.get('ofertas.cuponHoras'), ladder: VGC.get('ofertas.escalera').map(function (r) { return [r.hasta > 0 ? r.hasta : Infinity, r.pct]; }), dismissHours: VGC.get('ofertas.cierreHoras'), maxAds: VGC.get('ofertas.maxAnuncios'),
    rank: { base: { an: 70, vp: 55, rec: 50, cfo: 30 }, multiEmpresa: 25, contador: 15, sinSistema: 20, cercaMeta: 10, cerrado: 25, insistencia: 10 } };
  var A = null, timer = null;

  /* ---------- ofertas por herramienta ---------- */
  var BY_TOOL = {
    fl: { sku: 'FIN-01', why: 'Un sistema de flujo de caja te deja ver esto cada mes, sin rehacer el cálculo a mano.' },
    cr: { sku: 'COM-03', why: 'Banca Pro junta todos tus créditos y compara ofertas como la que acabas de calcular.' },
    mg: { sku: 'COM-02', why: 'Cotizador Pro arma tus cotizaciones con el margen ya calculado, para no regalar utilidad.' },
    pe: { sku: 'COM-02', why: 'Cotiza cada venta sabiendo de antemano si pasas tu punto de equilibrio.' },
    dcf: { ses: true, why: 'Revisa tu valorización con un asesor: supuestos, tasa y escenarios, en 30 minutos.' },
    inv: { ses: true, why: 'Un asesor revisa contigo los supuestos de tu proyecto antes de que decidas.' }
  };
  function offerFor(tool) {
    var o = BY_TOOL[tool] || { ses: true, why: 'Revisa este cálculo con un asesor.' };
    if (!o.ses && A.owns(o.sku)) o = { ses: true, why: 'Ya tienes ese sistema. Revisa este cálculo con un asesor en una sesión de 30 minutos.' };
    return o;
  }
  function info(o) {
    var price = o.ses ? A.sessionPrice : A.P[o.sku].price;
    return { name: o.ses ? 'Sesión 1:1 de 30 minutos' : A.P[o.sku].name, price: price, key: o.ses ? 'SES' : o.sku };
  }
  function off(price, pct) { return Math.round(price * (1 - pct / 100) / 10) * 10; }

  /* ---------- popup de oferta (compartido) ---------- */
  function offerModal(o, pct, opts) {
    opts = opts || {};
    var S = A.S(), inf = info(o), fin = off(inf.price, pct);
    var m = A.openModal('<div class="eyebrow">' + (opts.eyebrow || 'Oferta para ti') + '</div><h2 style="margin:6px 0 6px">' + A.esc(inf.name) + ' con ' + pct + '% de descuento</h2><p class="muted">' + A.esc(o.why) + '</p>' +
      '<div class="benefit" style="margin-top:14px"><div class="row" style="gap:18px"><div class="pct">' + pct + '%</div><div><div class="muted small">Precio normal <s>' + A.money(inf.price) + '</s></div><div class="price-tag">' + A.money(fin) + '</div></div></div><div class="muted small">Cupón de un solo uso, válido ' + CFG.couponHours + ' horas. No se suma a tus puntos ni a otros descuentos: se aplica el mejor.</div></div>' +
      '<div class="row" style="margin-top:16px"><button class="btn btn-gold" type="button" id="of-yes">Quiero mi ' + pct + '%</button><button class="btn" type="button" id="of-no">' + (opts.skipLabel || 'No, gracias') + '</button></div>' +
      '<p class="muted small" style="margin-top:10px">Propuesta: el porcentaje y la vigencia se pueden ajustar. Maqueta: el cobro real se conecta con Mercado Pago.</p>');
    A.log('oferta_vista', inf.name + ' · ' + pct + '%' + (opts.tool ? ' · ' + opts.tool : ''));
    function skip() { A.log('oferta_omitida', inf.name); A.save(); A.closeModal(); if (opts.after) opts.after(false); }
    m.querySelector('#of-no').onclick = skip; m.querySelector('#m-x').onclick = skip;
    m.querySelector('#of-yes').onclick = function () {
      var c = { code: 'VG' + pct + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(), key: inf.key, name: inf.name, pct: pct, price: fin, t: Date.now(), exp: Date.now() + CFG.couponHours * 36e5 };
      S.offers.unshift(c); A.log('oferta_aceptada', inf.name + ' · ' + pct + '% · ' + c.code); A.save();
      var m2 = A.openModal('<div class="vp-win"><div class="vp-pop">' + pct + '%</div><h2>Cupón guardado</h2><p class="muted">' + A.esc(inf.name) + ' por <b>' + A.money(fin) + '</b>. Tu código:</p><span class="code">' + c.code + '</span><p class="muted small">Válido ' + CFG.couponHours + ' horas. ' + (opts.after ? 'Tu descarga está en camino.' : '') + '</p>' +
        '<div class="row" style="justify-content:center;margin-top:12px"><button class="btn btn-gold" type="button" id="of-pay">Ir a pagar</button><button class="btn" type="button" id="of-ok">Seguir</button></div></div>');
      m2.querySelector('#of-pay').onclick = function () { A.log('oferta_pagar', c.code); A.closeModal(); A.toast('Maqueta: aquí se abre Mercado Pago con el cupón aplicado'); };
      m2.querySelector('#of-ok').onclick = A.closeModal; m2.querySelector('#m-x').onclick = A.closeModal;
      if (opts.after) opts.after(true);
    };
  }

  /* ---------- PDF real, sin librerías ---------- */
  function lat(s) { return String(s).replace(/[‒-―]/g, '-').replace(/·|•/g, '-').replace(/→/g, '->').replace(/…/g, '...').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?'); }
  function esc(s) { return lat(s).replace(/[\\()]/g, '\\$&'); }
  function wrap(s, n) { var out = [], line = ''; String(s).split(/\s+/).forEach(function (w) { if ((line + ' ' + w).trim().length > n) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); if (line) out.push(line); return out; }
  function buildPdf(doc, img) {
    var pages = [], cur = '', y = 800;
    function np() { pages.push(cur); cur = ''; y = 800; }
    function txt(s, x, size, font, rgb) { cur += 'BT /' + font + ' ' + size + ' Tf ' + rgb + ' rg ' + x + ' ' + y + ' Td (' + esc(s) + ') Tj ET\n'; }
    function adv(d) { y -= d; if (y < 70) np(); }
    cur += '0.05 0.11 0.16 rg 0 812 595 30 re f\n'; y = 790;
    txt('VANGUARD STRATEGY', 50, 10, 'F2', '0.79 0.66 0.30'); y -= 40;
    txt(doc.title, 50, 22, 'F2', '0.05 0.11 0.16'); adv(24);
    txt(doc.sub, 50, 10, 'F1', '0.33 0.41 0.50'); adv(22);
    cur += '0.79 0.66 0.30 RG 1.2 w 50 ' + (y + 6) + ' m 545 ' + (y + 6) + ' l S\n'; adv(16);
    doc.sections.forEach(function (sec) {
      if (sec.img) {
        if (!img) return;
        var iw = 495, ih = Math.min(260, iw * img.h / img.w); if (y - ih < 80) np();
        adv(6); txt('GRÁFICO', 50, 9, 'F2', '0.79 0.66 0.30'); adv(10); y -= ih; cur += 'q ' + iw + ' 0 0 ' + ih.toFixed(1) + ' 50 ' + y.toFixed(1) + ' cm /Im1 Do Q\n'; adv(16); return;
      }
      adv(6); txt(sec.h.toUpperCase(), 50, 9, 'F2', '0.79 0.66 0.30'); adv(16);
      sec.rows.forEach(function (r) {
        if (r.length === 2) { var v = wrap(r[1], 46); txt(r[0], 50, 10.5, 'F1', '0.33 0.41 0.50'); txt(v[0] || '', 300, 11, 'F2', '0.05 0.11 0.16'); adv(15); v.slice(1).forEach(function (l) { txt(l, 300, 11, 'F2', '0.05 0.11 0.16'); adv(15); }); }
        else wrap(r[0], 82).forEach(function (l) { txt(l, 50, 10.5, 'F1', '0.05 0.11 0.16'); adv(14); });
      });
      adv(8);
    });
    y = 52; wrap(doc.foot, 110).forEach(function (l) { txt(l, 50, 8, 'F1', '0.45 0.50 0.55'); y -= 10; });
    pages.push(cur);
    var n = pages.length, objs = [], IM = img ? 5 + 2 * n : 0;
    objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objs[2] = '<< /Type /Pages /Kids [' + pages.map(function (_, i) { return (5 + 2 * i) + ' 0 R'; }).join(' ') + '] /Count ' + n + ' >>';
    objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    pages.forEach(function (c, i) {
      objs[5 + 2 * i] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>' + (img ? ' /XObject << /Im1 ' + IM + ' 0 R >>' : '') + ' >> /Contents ' + (6 + 2 * i) + ' 0 R >>';
      objs[6 + 2 * i] = '<< /Length ' + c.length + ' >>\nstream\n' + c + 'endstream';
    });
    if (img) { var bs = ''; for (var q = 0; q < img.bytes.length; q++) bs += String.fromCharCode(img.bytes[q]); objs[IM] = '<< /Type /XObject /Subtype /Image /Width ' + img.w + ' /Height ' + img.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + img.bytes.length + ' >>\nstream\n' + bs + '\nendstream'; }
    var out = '%PDF-1.4\n', offs = [];
    for (var k = 1; k < objs.length; k++) { offs[k] = out.length; out += k + ' 0 obj\n' + objs[k] + '\nendobj\n'; }
    var x = out.length; out += 'xref\n0 ' + objs.length + '\n0000000000 65535 f \n';
    for (k = 1; k < objs.length; k++) out += ('0000000000' + offs[k]).slice(-10) + ' 00000 n \n';
    out += 'trailer\n<< /Size ' + objs.length + ' /Root 1 0 R >>\nstartxref\n' + x + '\n%%EOF';
    var b = new Uint8Array(out.length); for (var i = 0; i < out.length; i++) b[i] = out.charCodeAt(i) & 255;
    return new Blob([b], { type: 'application/pdf' });
  }
  function toolDoc(ex, hasImg) {
    var card = A.$('tool-card'), kp = [], inp = [];
    A.qa(card, '#t-kpis .k').forEach(function (k) { var s = k.querySelectorAll('span'); if (s.length >= 2) kp.push([s[0].textContent.trim(), s[1].textContent.trim()]); });
    A.qa(card, '.inputs label.f').forEach(function (l) { var f = l.querySelector('input,select'); if (f) var val = f.tagName === 'SELECT' ? f.options[f.selectedIndex].text : f.value; if (/^-?\d+(\.\d+)?$/.test(val) && Math.abs(+val) >= 1000) val = Number(val).toLocaleString('es-CL'); inp.push([l.childNodes[0].textContent.trim(), val]); });
    var v = A.$('t-verdict'), vt = ''; if (v) { var cl = v.cloneNode(true); A.qa(cl, 'button').forEach(function (b) { b.remove(); }); vt = A.qa(cl, '*').filter(function (n) { return !n.children.length; }).map(function (n) { return n.textContent.trim(); }).filter(Boolean).join(' '); }
    var secs = [];
    if (kp.length) secs.push({ h: 'Resultado', rows: kp });
    if (hasImg) secs.push({ img: true });
    if (vt) secs.push({ h: 'Lectura', rows: [[vt]] });
    if (inp.length) secs.push({ h: 'Datos ingresados', rows: inp });
    return { title: ex.name, sub: ex.emp.nombre + '  |  ' + new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }), sections: secs,
      foot: 'Generado en el portal de clientes de Vanguard Strategy. Es una referencia informativa basada en los datos que ingresaste; no reemplaza la asesoría de un profesional.' };
  }
  /* ---------- gráfico a imagen ---------- */
  function chartCanvas(ex) {
    return new Promise(function (res) {
      var box = A.$('t-chart'), svg = box && box.querySelector('svg'); if (!svg) return res(null);
      var cl = svg.cloneNode(true), vb = svg.viewBox.baseVal, W = vb.width || 640, H = vb.height || 220, SC = 2, ns = 'http://www.w3.org/2000/svg';
      var src = svg.querySelectorAll('*'), dst = cl.querySelectorAll('*'), props = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'font-size', 'font-family', 'opacity', 'text-anchor'];
      for (var i = 0; i < src.length; i++) { var cs = getComputedStyle(src[i]); props.forEach(function (p) { var val = cs.getPropertyValue(p); if (val) dst[i].style.setProperty(p, val); }); if (dst[i].tagName === 'text') dst[i].style.setProperty('fill', '#55697F'); if (/grid/.test(dst[i].getAttribute('class') || '')) dst[i].style.setProperty('stroke', '#E3E8EE'); if (/zero/.test(dst[i].getAttribute('class') || '')) dst[i].style.setProperty('stroke', '#9AA7B6'); }
      cl.setAttribute('xmlns', ns); cl.setAttribute('width', W * SC); cl.setAttribute('height', H * SC);
      var img = new Image(); img.onerror = function () { res(null); };
      img.onload = function () {
        var HEAD = 78 * SC, FOOT = 46 * SC, cv = document.createElement('canvas'); cv.width = W * SC; cv.height = H * SC + HEAD + FOOT;
        var c = cv.getContext('2d'); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, cv.width, cv.height);
        c.fillStyle = '#0D1B2A'; c.font = '600 ' + 26 * SC / 2 + 'px Poppins, Arial, sans-serif'; c.fillText(ex.name, 20 * SC, 36 * SC);
        c.fillStyle = '#55697F'; c.font = '400 ' + 13 * SC / 1 + 'px Poppins, Arial, sans-serif'; c.fillText(ex.emp.nombre + '  ·  ' + new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }), 20 * SC, 60 * SC);
        c.drawImage(img, 0, HEAD, W * SC, H * SC);
        var lx = 20 * SC; A.qa(A.$('t-legend'), 'span').forEach(function (sp) { var dot = sp.querySelector('i'), t = sp.textContent.trim(); if (!t) return; var col = dot ? getComputedStyle(dot).backgroundColor : '#C9A84C'; c.fillStyle = col; c.fillRect(lx, HEAD + H * SC + 14 * SC, 10 * SC, 10 * SC); c.fillStyle = '#55697F'; c.font = '400 ' + 12 * SC + 'px Poppins, Arial, sans-serif'; c.fillText(t, lx + 16 * SC, HEAD + H * SC + 24 * SC); lx += 16 * SC + c.measureText(t).width + 22 * SC; });
        c.fillStyle = '#9AA7B6'; c.font = '400 ' + 10 * SC + 'px Poppins, Arial, sans-serif'; c.fillText('Vanguard Strategy', W * SC - 140 * SC, HEAD + H * SC + 36 * SC);
        res({ canvas: cv, w: cv.width, h: cv.height });
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(cl));
    });
  }
  function slugOf(ex) { return (ex.name + ' ' + ex.emp.nombre).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + new Date().toISOString().slice(0, 10); }
  function saveBlob(blob, fname) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  function register(ex, blob, ext, label) {
    var S = A.S(), sku = (S.owned[0] || {}).sku || 'FIN-04';
    S.pdfs.push({ id: 'f' + Date.now(), sku: sku, emp: ex.emp.id, nombre: ex.name + ' · ' + new Date().toLocaleDateString('es-CL', { month: 'short', year: 'numeric' }) + '.' + ext, origen: label, t: Date.now(), kb: Math.max(1, Math.round(blob.size / 1024)) });
    A.log(ext + '_exportado', ex.name + ' · ' + ex.emp.nombre); A.save(); A.toast(label + ' descargado y guardado en Mis sistemas');
  }
  function download(ex) {
    chartCanvas(ex).then(function (cv) {
      var img = null; if (cv) { var u = cv.canvas.toDataURL('image/jpeg', .92).split(',')[1], bin = atob(u), bytes = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); img = { bytes: bytes, w: cv.w, h: cv.h }; }
      var blob = buildPdf(toolDoc(ex, !!img), img); saveBlob(blob, slugOf(ex) + '.pdf'); register(ex, blob, 'pdf', 'Calculadora (PDF)');
    });
  }
  function downloadPng(ex) {
    chartCanvas(ex).then(function (cv) { if (!cv) { A.toast('Este cálculo no tiene gráfico'); return; } cv.canvas.toBlob(function (blob) { saveBlob(blob, slugOf(ex) + '-grafico.png'); register(ex, blob, 'png', 'Gráfico (PNG)'); }, 'image/png'); });
  }

  /* ---------- Excel (.xlsx) sin librerías ---------- */
  var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function u16(n) { return [n & 255, (n >> 8) & 255]; } function u32(n) { return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255]; }
  function zip(files) {
    var enc = new TextEncoder(), out = [], cen = [], off = 0, dt = 0x0021, tm = 0;
    files.forEach(function (f) {
      var nb = enc.encode(f.name), d = enc.encode(f.text), crc = crc32(d);
      var lh = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(tm), u16(dt), u32(crc), u32(d.length), u32(d.length), u16(nb.length), u16(0));
      out.push(new Uint8Array(lh), nb, d);
      cen.push(new Uint8Array([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(tm), u16(dt), u32(crc), u32(d.length), u32(d.length), u16(nb.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nb);
      off += lh.length + nb.length + d.length;
    });
    var csz = cen.reduce(function (a, x) { return a + x.length; }, 0);
    return new Blob(out.concat(cen, [new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(csz), u32(off), u16(0)))]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function xe(s) { return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; }); }
  function colName(i) { var s = '', n = i + 1; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  function sheetXml(rows, widths) {
    var h = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>' + widths.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join('') + '</cols><sheetData>';
    rows.forEach(function (row, ri) { h += '<row r="' + (ri + 1) + '">'; row.forEach(function (c, ci) { if (c == null || c === '') return; var b = c && c.b, v = c && c.v !== undefined ? c.v : c, ref = colName(ci) + (ri + 1), st = b ? ' s="1"' : ''; h += typeof v === 'number' && isFinite(v) ? '<c r="' + ref + '"' + st + '><v>' + v + '</v></c>' : '<c r="' + ref + '" t="inlineStr"' + st + '><is><t xml:space="preserve">' + xe(v) + '</t></is></c>'; }); h += '</row>'; });
    return h + '</sheetData></worksheet>';
  }
  function num(t) { var m = String(t).replace(/\s/g, '').match(/^(-?)\$?(-?)([\d.]+)(,\d+)?(%|x| M| k)?$/); if (!m) return null; var n = parseFloat(m[3].replace(/\./g, '') + (m[4] ? m[4].replace(',', '.') : '')); return isFinite(n) ? (m[1] || m[2] ? -n : n) : null; }
  function downloadXlsx(ex) {
    var card = A.$('tool-card'), kp = [], inp = [], ci = A.chartInfo && A.chartInfo(), vt = '';
    A.qa(card, '#t-kpis .k').forEach(function (k) { var s = k.querySelectorAll('span'); if (s.length >= 2) kp.push([s[0].textContent.trim(), s[1].textContent.trim()]); });
    A.qa(card, '.inputs label.f').forEach(function (l) { var f = l.querySelector('input,select'); if (f) inp.push([l.childNodes[0].textContent.trim(), f.tagName === 'SELECT' ? f.options[f.selectedIndex].text : (isFinite(parseFloat(f.value)) ? parseFloat(f.value) : f.value)]); });
    var v = A.$('t-verdict'); if (v) { var cl = v.cloneNode(true); A.qa(cl, 'button').forEach(function (b) { b.remove(); }); vt = A.qa(cl, '*').filter(function (n) { return !n.children.length; }).map(function (n) { return n.textContent.trim(); }).filter(Boolean).join(' '); }
    var r1 = [[{ v: ex.name, b: true }], [ex.emp.nombre + ' · ' + new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })], [], [{ v: 'Indicador', b: true }, { v: 'Resultado', b: true }, { v: 'Valor numérico', b: true }]];
    kp.forEach(function (x) { r1.push([x[0], x[1], num(x[1])]); }); if (vt) { r1.push([], [{ v: 'Lectura', b: true }], [vt]); }
    var r2 = [[{ v: 'Dato', b: true }, { v: 'Valor', b: true }]].concat(inp);
    var sheets = [{ n: 'Resultado', rows: r1, w: [34, 24, 18] }, { n: 'Datos ingresados', rows: r2, w: [44, 22] }];
    if (ci) { var nm = ci.names || {}, r3 = [[{ v: 'Periodo', b: true }].concat(ci.series.map(function (s, i) { return { v: nm[s.cls] || (ci.series.length > 1 ? 'Serie ' + (i + 1) : 'Valor'), b: true }; }))]; ci.labels.forEach(function (lab, i) { r3.push([lab].concat(ci.series.map(function (s) { return typeof s.v[i] === 'number' && isFinite(s.v[i]) ? Math.round(s.v[i] * 100) / 100 : ''; }))); }); sheets.push({ n: 'Gráfico', rows: r3, w: [16, 18, 18, 18] }); }
    var files = [{ name: '[Content_Types].xml', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + sheets.map(function (s, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('') + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
      { name: '_rels/.rels', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + sheets.map(function (s, i) { return '<sheet name="' + xe(s.n) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join('') + '</sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map(function (s, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('') + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/styles.xml', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' }]
      .concat(sheets.map(function (s, i) { return { name: 'xl/worksheets/sheet' + (i + 1) + '.xml', text: sheetXml(s.rows, s.w) }; }));
    var blob = zip(files); saveBlob(blob, slugOf(ex) + '.xlsx'); register(ex, blob, 'xlsx', 'Calculadora (Excel)');
  }
  function doExport(ex, kind) { if (kind === 'xlsx') downloadXlsx(ex); else if (kind === 'png') downloadPng(ex); else download(ex); }
  function exportFlow(ex, kind) {
    var o = offerFor(ex.k), what = { pdf: 'tu PDF', xlsx: 'tu Excel', png: 'tu gráfico' }[kind] || 'tu archivo';
    offerModal(o, CFG.pdfPct, { eyebrow: 'Antes de descargar ' + what, skipLabel: 'Solo descargar', tool: ex.name, after: function (accepted) { doExport(ex, kind); if (!accepted) A.closeModal(); } });
  }
  function exportPdf(ex) { exportFlow(ex, 'pdf'); }

  /* ---------- anuncios en el flujo (barra bajo el encabezado, uno a la vez) ---------- */
  var adI = 0;
  function hostEl() { return document.getElementById('announce'); }
  function stage(key) {
    var S = A.S(); S.ads.first[key] = S.ads.first[key] || Date.now();
    var hrs = (Date.now() - S.ads.first[key]) / 36e5 + (S.ads.sim || 0), i = 0;
    while (hrs >= CFG.ladder[i][0]) i++;
    return CFG.ladder[i][1];
  }
  function candidates() {
    var S = A.S(), L = [], rc = A.recs()[0], an = A.visAn().filter(function (a) { return !S.anSeen[a.id]; })[0], vp = S.vp, bal = VGX.balance(vp), nt = VGX.CFG.tiers.filter(function (t) { return t.pts > bal; })[0];
    var nt = S.user.notif || {};
    if (rc && nt.ofertas !== false) { var pct = stage('rec:' + rc.sku), nm = A.P[rc.sku].name; L.push({ key: 'rec:' + rc.sku, tag: 'Para ti', title: nm + ' con ' + pct + '% de descuento', text: rc.why, cta: 'Ver oferta', act: function () { offerModal({ sku: rc.sku, why: rc.why }, pct, { eyebrow: 'Recomendado para ti' }); } }); }
    if (an && nt.novedades !== false) L.push({ key: 'an:' + an.id, tag: 'Novedad', title: an.titulo, text: 'Revisa qué cambió y cómo actualizar.', cta: 'Ver novedades', act: function () { A.show('novedades'); } });
    if (nt && nt.pts - bal <= 100 && !VGX.doneToday(vp)) L.push({ key: 'vp:' + nt.pts, tag: 'Puntos', title: 'Te faltan ' + (nt.pts - bal) + ' VP para ' + A.money(nt.clp), text: 'Haz tu check-in de hoy y sigue sumando.', cta: 'Ir a mis puntos', act: function () { A.show('puntos'); } });
    if (!S.cfo.joined && nt.ofertas !== false) L.push({ key: 'cfo', tag: 'Vanguard CFO', title: 'Construye con nosotros tu gerente financiero', text: 'Sé miembro fundador: tu voto decide qué viene.', cta: 'Conocer más', act: function () { A.show('cfo'); } });
    return rank(L);
  }
  /* Qué anuncio va primero: puntaje según quién es el cliente y qué ha hecho. Pesos editables (CFG.rank); son propuesta. */
  function rank(L) {
    var S = A.S(), R = CFG.rank, u = S.user || {}, cont = /contador|auditor/i.test((u.tipo || '') + ' ' + (u.profesion || '')), nEmp = (S.empresas || []).length, own = (S.owned || []).length, bal = VGX.balance(S.vp);
    L.forEach(function (c) {
      var k = c.key.split(':')[0], sc = R.base[k] || 0, why = [];
      if (k === 'cfo') { if (nEmp >= 2) { sc += R.multiEmpresa; why.push('maneja varias empresas'); } if (cont) { sc += R.contador; why.push('es contador'); } if (!own) { sc -= R.sinSistema; why.push('aún sin sistema'); } }
      if (k === 'rec') { if (cont && nEmp >= 3) { sc += R.contador; why.push('cartera de varias empresas'); } if (S.ads.first[c.key]) { sc += Math.min(R.insistencia, Math.round((Date.now() - S.ads.first[c.key]) / 36e5 / 12)); } }
      if (k === 'vp' && bal > 0) { sc += R.cercaMeta; why.push('cerca de su meta de puntos'); }
      var d = S.ads.dis[c.key]; if (d) { sc -= R.cerrado; why.push('ya lo cerró antes'); }
      c.score = sc; c.rankWhy = why.join(', ');
    });
    return L.sort(function (a, b) { return b.score - a.score; });
  }
  function paintAds() {
    var h = hostEl(), S = A.S(); if (!h) return;
    if (A.cur() !== 'inicio') { h.innerHTML = ''; return; }
    var list = candidates().filter(function (c) { var d = S.ads.dis[c.key]; return !d || (Date.now() - d) / 36e5 + (S.ads.sim || 0) >= CFG.dismissHours; });
    if (!list.length) { h.innerHTML = ''; return; }
    if (adI >= list.length) adI = 0; if (adI < 0) adI = list.length - 1;
    var c = list[adI], n = list.length;
    h.innerHTML = '<div class="ann" role="region" aria-label="Anuncio"><span class="pill gold">' + A.esc(c.tag) + '</span><div class="ann-body"><b class="ann-title">' + A.esc(c.title) + '</b><span class="ann-text">' + A.esc(c.text) + '</span></div><button class="btn btn-sm btn-gold" type="button" data-go>' + A.esc(c.cta) + '</button>' +
      (n > 1 ? '<span class="ann-pager"><button type="button" data-prev aria-label="Anterior">‹</button><span class="mono">' + (adI + 1) + ' de ' + n + '</span><button type="button" data-next aria-label="Siguiente">›</button></span>' : '') + '<button class="ann-x" type="button" data-x aria-label="Cerrar anuncio">×</button></div>';
    h.querySelector('[data-go]').onclick = function () { A.log('anuncio_click', c.key); A.save(); c.act(); };
    h.querySelector('[data-x]').onclick = function () { S.ads.dis[c.key] = Date.now(); A.log('anuncio_cerrado', c.key); A.save(); paintAds(); };
    if (n > 1) { h.querySelector('[data-prev]').onclick = function () { adI--; paintAds(); }; h.querySelector('[data-next]').onclick = function () { adI++; paintAds(); }; }
  }
  function onShow(pg) { adI = 0; clearTimeout(timer); paintAds(); }

  window.VGA = {
    CFG: CFG, defAds: function () { return { first: {}, dis: {}, sim: 0 }; },
    init: function (api) { A = api; },
    onShow: onShow, exportPdf: exportPdf, exportFlow: exportFlow, repaint: function () { if (A && A.cur() === 'inicio') { clearTimeout(timer); timer = setTimeout(paintAds, 300); } },
    offer: function (sku, why) { var rc = A.recs().filter(function (r) { return r.sku === sku; })[0]; offerModal({ sku: sku, why: why || (rc && rc.why) || 'Pensado para lo que estás calculando.' }, stage('rec:' + sku), { eyebrow: 'Recomendado para ti' }); },
    rank: rank, candidates: candidates,
    simulate: function (hours) { var S = A.S(); S.ads.sim = (S.ads.sim || 0) + hours; A.save(); paintAds(); }
  };
})();
