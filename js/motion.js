/* Movimiento de la plataforma: pocas animaciones, suaves y con propósito.
   - Las tarjetas que están más abajo aparecen al hacer scroll.
   - Las barras de progreso se llenan al entrar a una página.
   - El indicador del menú se desliza hasta la página activa.
   - El saldo de puntos cuenta hasta su nuevo valor.
   Todo se apaga con «reducir movimiento» del sistema. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, io = null, indReady = false;

  function reveal(root) {
    if (reduce || !('IntersectionObserver' in window)) return;
    if (io) io.disconnect();
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.remove('rv'); el.style.transitionDelay = ''; });
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target; io.unobserve(t); t.classList.add('rv-in'); t.classList.remove('rv');
        setTimeout(function () { t.classList.remove('rv-in'); }, 900);
      });
    }, { threshold: .06, rootMargin: '0px 0px -5% 0px' });
    var n = 0;
    root.querySelectorAll('.card, .stat, .emp, .news, .rec, .ccard, .plan').forEach(function (el) {
      if (el.hidden || el.closest('[hidden]') || el.closest('.rv')) return;
      if (el.getBoundingClientRect().top > innerHeight * .92) { el.classList.add('rv'); el.style.transitionDelay = (n++ % 3) * 70 + 'ms'; io.observe(el); }
    });
  }

  function bars(root) {
    if (reduce) return;
    root.querySelectorAll('.bar > span').forEach(function (sp) {
      var w = sp.style.width; if (!w) return;
      sp.style.transition = 'none'; sp.style.width = '0'; void sp.offsetWidth;
      requestAnimationFrame(function () { requestAnimationFrame(function () { sp.style.transition = ''; sp.style.width = w; }); });
    });
  }

  function indicator() {
    ['nav-portal', 'nav-bo'].forEach(function (id) {
      var nav = document.getElementById(id); if (!nav || nav.hidden) return;
      var ind = nav.querySelector('.nav-ind');
      if (!ind) { ind = document.createElement('span'); ind.className = 'nav-ind'; ind.setAttribute('aria-hidden', 'true'); nav.insertBefore(ind, nav.firstChild); }
      var act = nav.querySelector('.nv[aria-current="page"]');
      if (!act || act.classList.contains('nv-cfo')) { ind.style.opacity = 0; return; }
      var nr = nav.getBoundingClientRect(), ar = act.getBoundingClientRect();
      if (!ar.width) return;
      if (!indReady) ind.style.transition = 'none';
      ind.style.opacity = 1; ind.style.width = ar.width + 'px'; ind.style.height = ar.height + 'px';
      ind.style.transform = 'translate(' + (ar.left - nr.left + nav.scrollLeft) + 'px,' + (ar.top - nr.top) + 'px)';
      if (!indReady) { void ind.offsetWidth; ind.style.transition = ''; }
      if (nav.scrollWidth > nav.clientWidth + 2) { var l = ar.left - nr.left + nav.scrollLeft; if (l < nav.scrollLeft || l + ar.width > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = Math.max(0, l - 24); }
    });
    indReady = true;
  }

  function count(el, from, to, fmt) {
    if (!el) return;
    fmt = fmt || function (n) { return Number(n).toLocaleString('es-CL'); };
    if (reduce || from === to) { el.textContent = fmt(to); return; }
    var t0 = performance.now(), dur = 700;
    (function tick(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  window.VGM = {
    after: function (pg) { var root = document.getElementById('pg-' + pg); if (root) { reveal(root); bars(root); } requestAnimationFrame(indicator); setTimeout(indicator, 120); },
    count: count
  };
  window.addEventListener('resize', function () { requestAnimationFrame(indicator); });
  document.addEventListener('DOMContentLoaded', function () { setTimeout(indicator, 60); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { indicator(); });
})();
