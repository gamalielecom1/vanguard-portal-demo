/* Onboarding de 3 pasos al iniciar sesión (menos de 1 minuto, solo clics).
   Pregunta quién es, cómo lleva hoy sus números y cuánto domina finanzas.
   Lo guarda en S.onb y en el perfil, deja el dato en el back office y suma 50 VP. */
(function () {
  var STEPS = VGC.use('contenido.onboarding', [
    { k: 'rol', t: '¿Quién eres?', d: 'Para hablarte en tu idioma.', o: [
      ['Dueño/a de empresa', 'Dirijo mi propio negocio'], ['Contador/a o auditor/a', 'Llevo las cuentas de otras empresas'],
      ['Gerente o encargado/a de finanzas', 'Soy parte del equipo de una empresa'], ['Emprendedor/a', 'Estoy partiendo o haciendo crecer algo']] },
    { k: 'nums', t: '¿Cómo llevas hoy tus números?', d: 'Tu punto de partida, sin juicios.', o: [
      ['Sistemas propias', 'Excel o Google Sheets hechos por mí'], ['Un software contable', 'Defontana, Nubox, Bsale u otro'],
      ['Un poco de todo', 'Varias herramientas a la vez'], ['Casi nada aún', 'Recién estoy ordenando todo']] },
    { k: 'fin', t: '¿Qué tan cómodo estás con las finanzas?', d: 'Así te mostramos lo que de verdad te sirve.', o: [
      ['Recién parto', 'Quiero entender lo básico'], ['Entiendo lo básico', 'Leo mis números, pero me cuesta decidir'],
      ['Me defiendo bien', 'Analizo y proyecto por mi cuenta'], ['Es lo mío', 'Busco herramientas más avanzadas']] }
  ]);
  var MSG = VGC.use('contenido.onboardingMensajes', {
    'Recién parto': 'Partimos por lo esencial: lecciones cortas y el sistema más simple para ordenar tu caja.',
    'Entiendo lo básico': 'Vas a sacarle partido rápido: te mostramos qué mirar y qué decisión tomar con cada número.',
    'Me defiendo bien': 'Vamos directo a lo útil: calculadoras avanzadas y sesiones para afinar tus decisiones.',
    'Es lo mío': 'Te dejamos al frente las herramientas más profundas y el acceso a asesores para casos complejos.'
  });
  var A = null;

  function ask(i, ans) {
    var st = STEPS[i], S = A.S();
    var m = A.openModal('<div class="ob"><div class="ob-top"><span class="mstep">Paso ' + (i + 1) + ' de 3</span><div class="bar thin"><span style="width:' + Math.round((i + 1) / 3 * 100) + '%"></span></div></div>' +
      '<h2>' + st.t + '</h2><p class="muted">' + st.d + '</p><div class="ob-opts">' + st.o.map(function (o, k) { return '<button type="button" class="ob-opt" data-k="' + k + '"><b>' + A.esc(o[0]) + '</b><span class="muted small">' + A.esc(o[1]) + '</span></button>'; }).join('') + '</div>' +
      '<div class="row between" style="margin-top:14px">' + (i ? '<button class="link" type="button" id="ob-back">← Atrás</button>' : '<span></span>') + '<button class="link" type="button" id="ob-skip">Ahora no</button></div></div>');
    A.qa(m, '.ob-opt').forEach(function (b) { b.onclick = function () {
      ans[st.k] = st.o[+b.getAttribute('data-k')][0]; b.classList.add('on');
      setTimeout(function () { if (i < 2) ask(i + 1, ans); else finish(ans); }, 220);
    }; });
    if (m.querySelector('#ob-back')) m.querySelector('#ob-back').onclick = function () { ask(i - 1, ans); };
    m.querySelector('#ob-skip').onclick = skip; m.querySelector('#m-x').onclick = skip;
  }
  function skip() { var S = A.S(); if (!S.onb) S.onb = { skipped: true, t: Date.now() }; A.log('onboarding_omitido', ''); A.save(); A.closeModal(); }
  function finish(ans) {
    var S = A.S(); S.onb = { done: true, rol: ans.rol, nums: ans.nums, fin: ans.fin, t: Date.now() };
    S.user.rolDeclarado = ans.rol; S.user.llevaNumeros = ans.nums; S.user.nivelFinanciero = ans.fin;
    A.log('onboarding_completo', ans.rol + ' · ' + ans.nums + ' · ' + ans.fin);
    A.log('dato_perfil', 'Educación financiera · ' + ans.fin);
    var ptsOb = VGX.pts('onboarding'); VGX.earnOnce('onboarding', 'onboarding', ptsOb, 'Onboarding completo');
    var m = A.openModal('<div class="vp-win"><div class="vp-pop">+' + ptsOb + ' VP</div><h2>¡Todo listo, ' + A.esc(S.user.name.split(' ')[0]) + '!</h2><p class="muted">' + A.esc(MSG[ans.fin] || '') + '</p>' +
      '<div class="ob-sum"><span class="pill neutral">' + A.esc(ans.rol) + '</span><span class="pill neutral">' + A.esc(ans.nums) + '</span><span class="pill gold">' + A.esc(ans.fin) + '</span></div>' +
      '<p class="muted small">Ya sumaste tus primeros puntos. Cada día que entres, ganas más.</p><div class="row" style="justify-content:center;margin-top:12px"><button class="btn btn-gold" type="button" id="ob-ok">Ir a mi inicio</button></div></div>');
    m.querySelector('#ob-ok').onclick = function () { A.closeModal(); A.show('inicio'); };
  }
  window.VGO = {
    init: function (api) { A = api; },
    maybeOpen: function () { if (A && !A.S().onb) setTimeout(function () { if (!A.S().onb) ask(0, {}); }, 650); },
    open: function () { ask(0, {}); }
  };
})();
