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

// Home: the big photo zooms in slightly while you scroll down, and back out when you scroll up.
// Same maths as the old Squarespace site (its background "parallax" effect with intensity 5,
// angle 179° and zoom end 14): about +2.6% at the top of the page up to about +20% when the photo
// has scrolled away, with a small sideways drift, softly following the scroll.
(function () {
  var photos = document.querySelectorAll('.zoom-on-scroll');
  if (!photos.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var AMOUNT = 5 * 0.01 * 0.5;               // intensity 5
  var ZOOM_START = 0, ZOOM_END = 0.14;       // zoom end 14
  var DRIFT = Math.cos(179 * Math.PI / 180); // angle 179°: drifts to the left as you scroll down

  var items = Array.prototype.map.call(photos, function (img) {
    return { img: img, box: img.parentNode, shown: -1, target: 0, visible: false };
  });

  // How far you have scrolled past the photo: 0 at the start, 1 once it has left the top of the screen.
  // Like Squarespace, it starts counting from the top of the page when the photo is near it.
  function measure(item) {
    var screen = window.innerHeight;
    var rect = item.box.getBoundingClientRect();
    var pageTop = rect.top + window.pageYOffset;
    var pageBelow = document.body.scrollHeight - pageTop - rect.height;
    var before = Math.min(pageTop, screen);
    var after = Math.min(pageBelow, screen);
    var range = before + rect.height + after - screen;
    var progress = range <= 0 ? 1 : (before - rect.top) / range;
    item.target = Math.min(1, Math.max(0, progress));
    item.visible = rect.bottom > 0 && rect.top < screen;
  }

  function draw(item) {
    var p = item.shown;
    var k = 1 - AMOUNT - (ZOOM_START + (ZOOM_END - ZOOM_START) * p);
    var shift = DRIFT * AMOUNT * (p - 0.5) / k * item.img.offsetWidth;
    item.img.style.transform =
      'translate(calc(-50% + ' + shift.toFixed(2) + 'px), -50%) scale(' + (1 / k).toFixed(4) + ')';
  }

  var queued = false;
  function frame() {
    queued = false;
    var moving = false;
    items.forEach(function (item) {
      measure(item);
      var gap = item.target - item.shown;
      if (!item.visible || item.shown < 0 || Math.abs(gap) < 0.001) {
        item.shown = item.target;          // off screen: jump straight there
      } else {
        item.shown += gap * 0.1;           // on screen: follow the scroll softly
        moving = true;
      }
      draw(item);
    });
    if (moving) wake();
  }
  function wake() {
    if (!queued) { queued = true; requestAnimationFrame(frame); }
  }
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake);
  window.addEventListener('load', wake);
  wake();
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
