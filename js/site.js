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


  /* ---------- Barras entre secciones: crecen con el scroll ----------
     [data-barrido] crece hacia arriba desde el borde inferior de su sección (negras, sección 2);
     [data-barrido][data-cuelga] es el reflejo: cuelga del borde superior de su sección (blancas, sección 5).
     El movimiento sigue al scroll con una inercia corta: suave, pero sin quedarse atrás cuando la sección ya salió de la pantalla. */
  var easeIO = function (x) { return 0.5 - Math.cos(Math.PI * x) / 2; };
  var barras = [];
  document.querySelectorAll('[data-barrido]').forEach(function (el) {
    barras.push({ el: el, sec: el.closest('section'), cuelga: el.hasAttribute('data-cuelga'), objetivo: 0, actual: 0 });
  });
  if (barras.length) {
    var corriendo = false;
    var pinta = function (b) {
      var teclas = b.el.querySelectorAll('.tecla');
      var N = teclas.length, span = 12;
      // En móvil solo se ven las primeras barras: el barrido se reparte entre ellas
      if (window.innerWidth <= 900) {
        var vis = 0, W = b.el.clientWidth;
        teclas.forEach(function (t) { if (t.offsetLeft + t.offsetWidth > 0 && t.offsetLeft < W) vis++; });
        N = Math.max(vis, 4); span = 5;
      }
      teclas.forEach(function (t, i) {
        var l = Math.min(1, Math.max(0, (b.actual * (N + span) - i) / span));
        // Antes de empezar la barra no existe (sin astillas dentadas en el borde); después crece desde cero
        t.style.visibility = l <= 0.001 ? 'hidden' : 'visible';
        t.style.transform = 'scaleY(' + Math.max(easeIO(l), 0.001).toFixed(4) + ')';
      });
    };
    var calcula = function () {
      var vh = window.innerHeight;
      barras.forEach(function (b) {
        var r = b.sec.getBoundingClientRect();
        var p = b.cuelga ? (vh * 0.95 - r.top) / (vh * 0.6) : (vh * 1.05 - r.bottom) / (vh * 0.85);
        b.objetivo = reduce ? 1 : Math.min(1, Math.max(0, p));
      });
    };
    var bucle = function () {
      var sigue = false;
      barras.forEach(function (b) {
        b.actual += (b.objetivo - b.actual) * 0.2;
        if (Math.abs(b.objetivo - b.actual) < 0.0005) b.actual = b.objetivo; else sigue = true;
        pinta(b);
      });
      if (sigue) requestAnimationFrame(bucle); else corriendo = false;
    };
    var arranca = function () {
      calcula();
      if (reduce) { barras.forEach(function (b) { b.actual = b.objetivo; pinta(b); }); return; }
      if (!corriendo) { corriendo = true; requestAnimationFrame(bucle); }
    };
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
