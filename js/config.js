/* Configuración del portal, editable desde el ERP.
   Un solo lugar guarda lo que el equipo puede cambiar sin tocar código: puntos, precios, ofertas, textos, videos, artículos de ayuda, etc.
   - Valores sueltos (números, URLs) viven en DEF.
   - Contenidos largos (listas de artículos, noticias, áreas de acompañamiento…) los registra el propio código del portal con VGC.use(ruta, valorPorDefecto):
     devuelve lo que se configuró en el ERP, o el valor del código si no hay nada.
   Hoy se guarda en localStorage (clave vg-portal-config). En producción es una tabla en la base de datos con la misma forma. */
(function () {
  var KEY = 'vg-portal-config', reg = {};
  var DEF = {
    puntos: {
      valor: 10, checkin: 5, tope: 30, menorDiario: 60,
      rachas: [{ dias: 7, vp: 20 }, { dias: 14, vp: 40 }, { dias: 30, vp: 100 }, { dias: 60, vp: 200 }, { dias: 90, vp: 300 }],
      canje: [500, 1000, 1500],
      acciones: { onboarding: 50, perfil: 100, perfilMax: 3, leccion: 10, feedback: 5, sesion: 50, resena: 150, voto: 20, referido: 500 }
    },
    ofertas: { pdfPct: 50, cuponHoras: 48, cierreHoras: 24, maxAnuncios: 2, escalera: [{ hasta: 24, pct: 10 }, { hasta: 48, pct: 15 }, { hasta: 0, pct: 20 }] },
    acomp: { precioSesion: 29990, precioPlan: 79990, sesionesPlan: 3, minSesion: 45, minPlan: 60, diasPlan: 90, fichaMin: 70 },
    cfo: { precio: 10000, dias: 14, videoDemo: '', videoDirectiva: '' },
    videos: { bienvenida: '', herramientas: { fl: '', cr: '', pe: '', mg: '', dcf: '', inv: '' } }
  };
  function walk(o, path) { var p = path.split('.'), i; for (i = 0; i < p.length; i++) { if (o == null || typeof o !== 'object') return undefined; o = o[p[i]]; } return o; }
  function clone(v) { return v === undefined ? v : JSON.parse(JSON.stringify(v)); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function setPath(o, path, val) { var p = path.split('.'), i, c = o; for (i = 0; i < p.length - 1; i++) { if (c[p[i]] == null || typeof c[p[i]] !== 'object') c[p[i]] = {}; c = c[p[i]]; } if (val === undefined) delete c[p[p.length - 1]]; else c[p[p.length - 1]] = val; }
  window.VGC = {
    KEY: KEY, DEF: DEF, reg: reg,
    has: function (path) { return walk(load(), path) !== undefined; },
    get: function (path, d) { var u = walk(load(), path); if (u !== undefined) return clone(u); var v = walk(DEF, path); if (v !== undefined) return clone(v); return reg[path] !== undefined ? clone(reg[path]) : d; },
    /* Valor por defecto (sin lo configurado), para mostrar «restablecer» en el ERP */
    def: function (path) { var v = walk(DEF, path); return clone(v !== undefined ? v : reg[path]); },
    use: function (path, codeDefault) { reg[path] = clone(codeDefault); var u = walk(load(), path); return u === undefined ? codeDefault : clone(u); },
    set: function (path, val) { var o = load(); setPath(o, path, val); save(o); },
    reset: function (path) { var o = load(); setPath(o, path, undefined); save(o); },
    all: load
  };
})();
