/* SolBemol — formas con borde orgánico.
   Dibuja un rectángulo vectorial cuyos bordes ondulan apenas (curvas Bézier suaves, esquinas rectas).
   Sin filtros ni mapas de píxeles: el borde es siempre nítido. Se redibuja al cambiar de tamaño. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function rng(a) { // PRNG con semilla: la forma es la misma en cada carga
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function f(n) { return Math.round(n * 100) / 100; }

  function wobblyRect(w, h, seed, amp, lean, plano, ox, oy) {
    var r = rng(seed * 9973 + 13);
    function j(a) { return (r() * 2 - 1) * a; }
    var tilt = j(lean); // inclinación leve de la tecla: no es rígida
    var c = [
      [tilt + j(amp), j(amp)],
      [w + tilt + j(amp), j(amp)],
      [w + j(amp), h + j(amp)],
      [j(amp), h + j(amp)]
    ];
    if (plano) { // base plana: las esquinas inferiores quedan siempre por debajo del borde y la sección las recorta al ras
      c[2][1] = h + 10 + Math.abs(c[2][1] - h);
      c[3][1] = h + 10 + Math.abs(c[3][1] - h);
    }
    if (ox || oy) c.forEach(function (q) { q[0] += (ox || 0); q[1] += (oy || 0); });
    var d = 'M' + f(c[0][0]) + ' ' + f(c[0][1]);
    for (var k = 0; k < 4; k++) {
      var a = c[k], b = c[(k + 1) % 4];
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      var n = Math.max(2, Math.round(L / 110));
      var prev = a;
      for (var i = 1; i <= n; i++) {
        var t = i / n, p;
        if (i === n) { p = b; }
        else { var off = j(amp); p = [a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]; }
        var s = Math.sqrt(Math.pow(p[0] - prev[0], 2) + Math.pow(p[1] - prev[1], 2)) * 0.36;
        d += 'C' + f(prev[0] + ux * s) + ' ' + f(prev[1] + uy * s) + ' ' +
                   f(p[0] - ux * s) + ' ' + f(p[1] - uy * s) + ' ' + f(p[0]) + ' ' + f(p[1]);
        prev = p;
      }
    }
    return d + 'Z';
  }

  var uid = 0;
  function mount(el) {
    if (el._rg) return;
    el._rg = true;
    var seed = parseInt(el.getAttribute('data-seed'), 10) || (++uid * 7 + 3);
    var ampAttr = parseFloat(el.getAttribute('data-amp')) || 0;
    var lean = parseFloat(el.getAttribute('data-lean')) || 0;
    var plano = el.hasAttribute('data-plano');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'rg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var path = document.createElementNS(NS, 'path');
    svg.appendChild(path);
    el.insertBefore(svg, el.firstChild);
    function draw() {
      var w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      var amp = ampAttr || Math.min(3.2, Math.max(1.4, Math.min(w, h) * 0.014));
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      path.setAttribute('d', wobblyRect(w, h, seed, amp, lean, plano));
    }
    draw();
    if ('ResizeObserver' in window) new ResizeObserver(draw).observe(el);
    else window.addEventListener('resize', draw);
  }

  // Teclas decorativas: data-teclado="alto/hueco alto/hueco ..." (alto en unidades --u)
  document.querySelectorAll('[data-teclado]').forEach(function (box) {
    box.getAttribute('data-teclado').trim().split(/\s+/).forEach(function (tok, i) {
      var p = tok.split('/');
      var el = document.createElement('i');
      el.className = 'tecla rugoso';
      el.style.setProperty('--n', p[0]);
      el.style.setProperty('--k', p[1] === undefined ? 1 : p[1]);
      el.style.setProperty('--i', i);
      el.setAttribute('data-lean', '6');
      el.setAttribute('data-plano', '');
      el.setAttribute('data-seed', String(11 + i * 5));
      box.appendChild(el);
    });
  });

  // Fotos con forma de tecla: el mismo contorno orgánico, aplicado como recorte
  function mountClip(el) {
    var seed = parseInt(el.getAttribute('data-seed'), 10) || 5;
    var lean = parseFloat(el.getAttribute('data-lean')) || 4;
    var plano = el.hasAttribute('data-plano');
    function draw() {
      var w = el.offsetWidth, h = el.offsetHeight, m = 3;
      if (!w || !h) return;
      el.style.clipPath = "path('" + wobblyRect(w - 2 * m, h - m, seed, 2.2, lean, plano, m, m) + "')";
    }
    draw();
    if ('ResizeObserver' in window) new ResizeObserver(draw).observe(el);
    else window.addEventListener('resize', draw);
  }

  document.querySelectorAll('.rugoso').forEach(mount);
  document.querySelectorAll('.tecla--foto').forEach(mountClip);
  window.SolBemolShapes = { mount: mount };
})();
