// Mobile menu
(function () {
  var toggle = document.querySelector('.menu-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) toggle.click();
  });
})();

// Before/after carousel arrows (loops around at both ends)
document.querySelectorAll('.carousel').forEach(function (carousel) {
  var track = carousel.querySelector('.carousel-track');
  function step() {
    var item = track.querySelector('li');
    return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
  }
  function go(dir) {
    var max = track.scrollWidth - track.clientWidth - 2;
    if (dir > 0 && track.scrollLeft >= max) track.scrollTo({ left: 0 });
    else if (dir < 0 && track.scrollLeft <= 2) track.scrollTo({ left: track.scrollWidth });
    else track.scrollBy({ left: dir * step() });
  }
  carousel.querySelector('[data-dir="prev"]').addEventListener('click', function () { go(-1); });
  carousel.querySelector('[data-dir="next"]').addEventListener('click', function () { go(1); });
});

// Home: the big photo zooms in slowly while you scroll past it (like the old site)
(function () {
  var photos = document.querySelectorAll('.zoom-on-scroll');
  if (!photos.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var MAX_ZOOM = 0.14; // 14% bigger by the time the photo leaves the screen
  var queued = false;
  function update() {
    queued = false;
    var screen = window.innerHeight;
    photos.forEach(function (img) {
      var box = img.parentNode.getBoundingClientRect();
      // 0 when the photo appears at the bottom of the screen, 1 when it leaves at the top
      var progress = Math.min(1, Math.max(0, (screen - box.top) / (screen + box.height)));
      img.style.transform = 'scale(' + (1 + MAX_ZOOM * progress).toFixed(4) + ')';
    });
  }
  function queue() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
})();

// Servizi: services open and close smoothly, and the photo beside them grows and shrinks with them
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.accordion details').forEach(function (item) {
    var busy = false;
    item.querySelector('summary').addEventListener('click', function (e) {
      if (reduce.matches) return; // no animation: the browser opens/closes it instantly
      e.preventDefault();
      if (busy) return;
      busy = true;
      var opening = !item.open;
      var from = item.offsetHeight;
      item.open = opening;        // measure the final height...
      var to = item.offsetHeight;
      item.open = true;           // ...but keep the text visible while it closes
      item.classList.toggle('is-closing', !opening);
      item.style.overflow = 'hidden';
      item.style.height = from + 'px';
      void item.offsetHeight;     // start from the current height
      item.style.transition = 'height .4s ease 0s';
      item.style.height = to + 'px';
      setTimeout(function () {
        item.open = opening;
        item.classList.remove('is-closing');
        item.style.height = item.style.overflow = item.style.transition = '';
        busy = false;
      }, 450);
    });
  });
})();

// Fade-in as things scroll into view, like the old site: images, text and buttons.
// The fade is switched on from here, so everything stays visible if JavaScript doesn't run.
(function () {
  if (!('IntersectionObserver' in window)) return;
  var items = document.querySelectorAll([
    'main img:not(.zoom-on-scroll):not(.contact-hero img):not(.carousel-track img)',
    'main .carousel',
    'main h1:not(.visually-hidden)',
    'main h2:not(summary h2)',
    'main h3',
    'main p:not(details p)',
    'main li:not(.carousel-track li)',
    'main details',
    'main .btn',
    '.site-footer p'
  ].join(','));
  var io = new IntersectionObserver(function (entries) {
    var n = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      el.style.transitionDelay = Math.min(n++ * 0.08, 0.6) + 's'; // things that appear together fade in one after another
      el.classList.add('is-visible');
      setTimeout(function () { // done: give the element back its normal styles (e.g. button hover)
        el.classList.remove('reveal', 'is-visible');
        el.style.transitionDelay = '';
      }, 1600);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
})();
