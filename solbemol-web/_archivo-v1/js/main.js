/* ============================================================
   SolBemol — main.js · JavaScript puro (sin dependencias)
   1. Header transparente que se auto-oculta y reaparece al
      acercar el mouse al borde superior (o al hacer scroll arriba)
   2. Menú deslizante accesible (hamburguesa + backdrop)
   3. Aparición de secciones al hacer scroll (IntersectionObserver)
   4. Año dinámico en el footer
   5. Validación básica del formulario de contacto (solo front;
      el envío real se conecta en WordPress vía WP Mail SMTP)
   ============================================================ */
(function () {
  'use strict';

  var body = document.body;

  /* ---------- 1. HEADER AUTO-OCULTO / REAPARICIÓN ---------- */
  var header = document.querySelector('[data-header]');
  var hero = document.querySelector('.hero');
  var lastY = window.scrollY || 0;
  var mouseNearTop = false;
  var navOpen = false;

  function heroBottom() { return hero ? hero.offsetHeight - 80 : 320; }

  function applyHeader() {
    if (!header) return;
    var y = window.scrollY || 0;
    var overHero = y < heroBottom();
    var scrollingUp = y < lastY - 2;
    var nearPageTop = y < 10;

    var show = overHero || mouseNearTop || scrollingUp || navOpen || nearPageTop;
    header.classList.toggle('is-hidden', !show);
    // Sólo se ve "sólido" (fondo índigo) cuando está visible fuera del hero
    header.classList.toggle('is-solid', show && !overHero);
    lastY = y;
  }

  window.addEventListener('scroll', applyHeader, { passive: true });
  window.addEventListener('resize', applyHeader);
  // Reaparece al acercar el mouse a la franja superior de la página
  window.addEventListener('mousemove', function (e) {
    var near = e.clientY <= 64;
    if (near !== mouseNearTop) { mouseNearTop = near; applyHeader(); }
  });
  applyHeader();

  /* ---------- 2. MENÚ DESLIZANTE ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  var backdrop = document.querySelector('[data-nav-backdrop]');

  function openNav() {
    navOpen = true;
    if (toggle) { toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Cerrar menú'); }
    if (nav) nav.classList.add('is-open');
    if (backdrop) { backdrop.hidden = false; requestAnimationFrame(function () { backdrop.classList.add('is-open'); }); }
    body.classList.add('nav-open');
    applyHeader();
  }

  function closeNav() {
    navOpen = false;
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú'); }
    if (nav) nav.classList.remove('is-open');
    if (backdrop) { backdrop.classList.remove('is-open'); setTimeout(function () { backdrop.hidden = true; }, 380); }
    body.classList.remove('nav-open');
    applyHeader();
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      (toggle.getAttribute('aria-expanded') === 'true') ? closeNav() : openNav();
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeNav);
  if (nav) nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navOpen) closeNav(); });

  /* ---------- 3. APARICIÓN AL SCROLL ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 4. AÑO DINÁMICO ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 5. VALIDACIÓN DEL FORMULARIO ---------- */
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');

  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(field, msg) {
      var wrap = field.closest('.field');
      var errEl = form.querySelector('[data-error-for="' + field.name + '"]');
      if (wrap) wrap.classList.toggle('has-error', !!msg);
      if (errEl) errEl.textContent = msg || '';
    }

    function validateField(field) {
      var v = (field.value || '').trim();
      switch (field.name) {
        case 'nombre':
          if (!v) return 'Cuéntanos tu nombre.';
          break;
        case 'email':
          if (!v) return 'Necesitamos un email para responderte.';
          if (!emailRe.test(v)) return 'Revisa el formato del email.';
          break;
        case 'telefono':
          if (!v) return 'Déjanos un teléfono de contacto.';
          if (v.replace(/[^0-9]/g, '').length < 8) return 'Ingresa un teléfono válido.';
          break;
        case 'mensaje':
          if (!v) return 'Escríbenos un mensaje, aunque sea breve.';
          break;
      }
      return '';
    }

    // Limpia el error mientras el usuario corrige
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () { if (field.name) setError(field, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('input[required], textarea[required]');
      var firstInvalid = null;

      fields.forEach(function (field) {
        var msg = validateField(field);
        setError(field, msg);
        if (msg && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        if (statusEl) { statusEl.textContent = 'Revisa los campos marcados.'; statusEl.classList.remove('is-ok'); }
        firstInvalid.focus();
        return;
      }

      // Validación OK. NOTA: aquí NO se envía correo.
      // El envío real se conectará en WordPress (WP Mail SMTP → casilla del hosting).
      if (statusEl) {
        statusEl.textContent = '¡Gracias! Recibimos tu mensaje y te contactaremos pronto.';
        statusEl.classList.add('is-ok');
      }
      form.reset();
    });
  }

})();


/* ============================================================
   SolBemol — CINTA REACTIVA DE MARCA (onda vertical al borde)
   Barras horizontales apiladas verticalmente, ancladas al borde
   izquierdo (x=0) dentro de .wave-scope. El centro del viewport
   es el divisor fijo: lo que ya "pasó" por arriba queda activo
   (más largo + color de marca); lo que falta por pasar queda
   inactivo (largo fijo y constante — calmado).
   El scope va de "problema" a "contacto": el hero esconde el
   arranque de la animación y el footer esconde su cierre, porque
   el progreso se calcula sobre la altura de .wave-scope, no de
   todo el documento.
   ============================================================ */
(function () {
  'use strict';

  var scope = document.querySelector('[data-wave-scope]');
  var track = document.querySelector('[data-wave-track]');
  if (!scope || !track) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var BAR_COUNT    = 220;
  var THICKNESS    = 4;
  var GAP          = 5;
  var STEP         = THICKNESS + GAP;
  var GROW_FACTOR  = 1.4;
  var INACTIVE_LEN = 14; // largo fijo en estado calmado/inactivo

  function baseLenFor(i, n) {
    var t = i / n;
    var wave =
      Math.sin(t * Math.PI * 2.1 + 0.4) * 0.5 +
      Math.sin(t * Math.PI * 4.3 + 1.2) * 0.28 +
      Math.sin(t * Math.PI * 7.7 + 2.0) * 0.14;
    var envelope = Math.sin(Math.min(Math.max(t, 0.02), 0.98) * Math.PI); // afina arriba y abajo
    var norm = (wave + 1) / 2;
    var len = 10 + envelope * (8 + norm * 130);
    return Math.max(8, Math.round(len));
  }

  var bars = [];
  var baseLens = [];
  var frag = document.createDocumentFragment();
  for (var i = 0; i < BAR_COUNT; i++) {
    var bar = document.createElement('div');
    bar.className = 'wave-bar';
    var len = baseLenFor(i, BAR_COUNT);
    baseLens.push(len);
    bar.style.width = INACTIVE_LEN + 'px';
    frag.appendChild(bar);
    bars.push(bar);
  }
  track.appendChild(frag);

  var trackLength = BAR_COUNT * STEP - GAP;
  var ticking = false;

  function update() {
    ticking = false;

    var rect = scope.getBoundingClientRect();
    var scrollableDist = Math.max(1, scope.offsetHeight - window.innerHeight);
    var progress = -rect.top / scrollableDist;
    progress = Math.min(1, Math.max(0, progress));

    var viewportCenterY = window.innerHeight / 2;
    var shift = progress * trackLength;

    track.style.transform = 'translateY(' + (-shift) + 'px)';

    var currentIdx = -1;
    var currentDist = Infinity;

    for (var j = 0; j < bars.length; j++) {
      var barCenterY = viewportCenterY - shift + (j * STEP + THICKNESS / 2);
      var dist = Math.abs(barCenterY - viewportCenterY);
      if (dist < currentDist) { currentDist = dist; currentIdx = j; }

      var bar = bars[j];
      var isActive = barCenterY < viewportCenterY;

      if (isActive) {
        bar.classList.add('is-active');
        bar.style.width = Math.round(baseLens[j] * GROW_FACTOR) + 'px';
      } else {
        bar.classList.remove('is-active');
        bar.style.width = INACTIVE_LEN + 'px';
      }
    }

    for (var k = 0; k < bars.length; k++) {
      bars[k].classList.toggle('is-current', k === currentIdx);
    }
  }

  function schedule() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  if (reduce) {
    // movimiento reducido: la onda queda estática, sin animación de scroll
    return;
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
  window.addEventListener('load', schedule);
})();
