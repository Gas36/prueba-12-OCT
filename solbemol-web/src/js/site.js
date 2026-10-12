/* SolBemol — interacción del sitio: header, menú, entradas, carrusel de historias, formulario. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Video del hero: sin autoplay si el usuario pidió menos movimiento ---------- */
  var mux = document.querySelector('mux-video');
  if (mux && reduce) { mux.removeAttribute('autoplay'); if (mux.pause) mux.pause(); }

  /* ---------- Header: visible sobre el hero, al subir, o al acercar el mouse al borde ---------- */
  var header = document.querySelector('[data-header]');
  var hero = document.querySelector('.hero');
  var navOpen = false, mouseTop = false, lastY = window.scrollY || 0;
  function applyHeader() {
    if (!header) return;
    var y = window.scrollY || 0;
    var heroEnd = hero ? hero.offsetHeight - 80 : 300;
    var over = y < heroEnd, up = y < lastY - 2;
    var show = over || up || navOpen || mouseTop || y < 10;
    header.classList.toggle('is-hidden', !show);
    header.classList.toggle('is-solid', !over && show);
    lastY = y;
  }
  window.addEventListener('scroll', applyHeader, { passive: true });
  window.addEventListener('resize', applyHeader);
  window.addEventListener('mousemove', function (e) {
    var near = e.clientY < 60;
    if (near !== mouseTop) { mouseTop = near; applyHeader(); }
  });
  applyHeader();

  /* ---------- Menú deslizante ---------- */
  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var backdrop = document.querySelector('[data-nav-backdrop]');
  function setNav(open) {
    navOpen = open;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    backdrop.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.querySelector('a').focus(); else toggle.focus({ preventScroll: true });
    applyHeader();
  }
  toggle.addEventListener('click', function () { setNav(!navOpen); });
  backdrop.addEventListener('click', function () { setNav(false); });
  nav.querySelectorAll('a, .nav__close').forEach(function (el) { el.addEventListener('click', function () { if (navOpen) setNav(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navOpen) setNav(false); });

  /* ---------- Entradas: las cosas suben, una vez ---------- */
  var groups = document.querySelectorAll('[data-entra]');
  function enter(el) { el.classList.add('is-in'); }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { enter(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.25 });
    groups.forEach(function (g) { io.observe(g); });
  } else { groups.forEach(enter); }


  /* ---------- Barras de la sección 2: crecen de izquierda a derecha con el scroll ----------
     El movimiento sigue al scroll pero con inercia (suavizado), para que se sienta y no se dispare. */
  var barrido = document.querySelector('[data-barrido]');
  if (barrido) {
    var sec = barrido.closest('section');
    var objetivo = 0, actual = 0, corriendo = false;
    var easeIO = function (x) { return 0.5 - Math.cos(Math.PI * x) / 2; };
    var pinta = function () {
      [barrido.querySelectorAll('.tecla')].forEach(function (teclas) {
        var N = teclas.length, span = 12;
        // En móvil solo se ven las primeras barras: el barrido se reparte entre ellas
        if (window.innerWidth <= 900) {
          var vis = 0;
          teclas.forEach(function (t) { if (t.offsetLeft < barrido.clientWidth) vis++; });
          N = Math.max(vis, 4); span = 5;
        }
        teclas.forEach(function (t, i) {
          var l = Math.min(1, Math.max(0, (actual * (N + span) - i) / span));
          t.style.transform = 'scaleY(' + (0.02 + 0.98 * easeIO(l)).toFixed(4) + ')';
        });
      });
    };
    var calcula = function () {
      var vh = window.innerHeight, r = sec.getBoundingClientRect();
      objetivo = reduce ? 1 : Math.min(1, Math.max(0, (vh * 1.05 - r.bottom) / (vh * 0.85)));
    };
    var bucle = function () {
      actual += (objetivo - actual) * 0.07;
      if (Math.abs(objetivo - actual) < 0.0005) actual = objetivo;
      pinta();
      if (actual !== objetivo) requestAnimationFrame(bucle); else corriendo = false;
    };
    var arranca = function () { calcula(); if (reduce) { actual = objetivo; pinta(); return; } if (!corriendo) { corriendo = true; requestAnimationFrame(bucle); } };
    window.addEventListener('scroll', arranca, { passive: true });
    window.addEventListener('resize', arranca);
    window.addEventListener('load', arranca);
    arranca();
  }

  /* ---------- Carrusel de historias ---------- */
  var rail = document.querySelector('[data-rail]');
  document.querySelectorAll('[data-rail-dir]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = rail.querySelector('.voz');
      var step = card ? card.getBoundingClientRect().width : 320;
      rail.scrollBy({ left: Number(btn.getAttribute('data-rail-dir')) * step, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Formulario: validación en el navegador ----------
     TODO al publicar: conectar el envío real (correo o servicio de formularios).
     Hoy solo valida; no se envía nada. */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  function setError(input, msg) {
    var wrap = input.closest('.campo');
    wrap.classList.toggle('tiene-error', !!msg);
    wrap.querySelector('.error').textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function check(input) {
    var v = input.value.trim();
    if (input.required && !v) return 'Completa este campo.';
    if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Escribe un correo válido, por ejemplo nombre@empresa.cl.';
    if (input.type === 'tel' && v && v.replace(/\D/g, '').length < 8) return 'Escribe un teléfono con al menos 8 dígitos.';
    return '';
  }
  if (form) {
    form.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () { if (el.closest('.tiene-error')) setError(el, check(el)); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('input, textarea').forEach(function (el) {
        var msg = check(el); setError(el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      if (firstBad) { status.textContent = 'Revisa los campos marcados.'; firstBad.focus(); return; }
      status.textContent = 'Formulario válido. El envío real se conecta al publicar el sitio.';
    });
  }

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
