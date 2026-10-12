(function () {
  'use strict';
  var body = document.body;
  var sol = document.querySelector('.solucion');
  var bloques = document.querySelector('.bloques');
  var chips = document.querySelector('.chips');

  // Aparición escalonada: un único momento orquestado (bloques y luego chips)
  function enter() {
    bloques.classList.add('is-in');
    chips.classList.add('is-in');
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { enter(); io.disconnect(); } });
    }, { threshold: 0.25 });
    io.observe(bloques);
  } else { enter(); }

  // Panel de prototipo: cambia variantes sin recargar
  function bind(name, apply) {
    document.querySelectorAll('input[name="' + name + '"]').forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) apply(r.value); });
    });
  }
  bind('fondo',   function (v) { sol.setAttribute('data-theme', v); });
  bind('bloques', function (v) { body.setAttribute('data-bloques', v); });
  bind('chips',   function (v) { body.setAttribute('data-chips', v); });

  document.getElementById('repetir').addEventListener('click', function () {
    bloques.classList.remove('is-in'); chips.classList.remove('is-in');
    void bloques.offsetWidth;
    setTimeout(enter, 60);
    bloques.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
