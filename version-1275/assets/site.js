(function () {
  function normalize(value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) return;
    function update() {
      if (window.scrollY > 420) button.classList.add('show');
      else button.classList.remove('show');
    }
    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var section = panel.closest('.section') || document;
      var list = section.querySelector('[data-movie-list]');
      var empty = section.querySelector('[data-filter-empty]');
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-quick-search]'));
      if (!input || !list) return;
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      function apply(value) {
        var q = normalize(value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' '));
          var matched = !q || text.indexOf(q) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) visible += 1;
        });
        if (empty) empty.classList.toggle('show', visible === 0);
      }
      input.addEventListener('input', function () {
        apply(input.value);
        chips.forEach(function (chip) {
          chip.classList.toggle('active', normalize(chip.getAttribute('data-quick-search')) === normalize(input.value));
        });
      });
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          input.value = chip.getAttribute('data-quick-search') || '';
          chips.forEach(function (item) {
            item.classList.toggle('active', item === chip);
          });
          apply(input.value);
          input.focus();
        });
      });
      apply('');
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (root) {
      var video = root.querySelector('video');
      var button = root.querySelector('[data-play-button]');
      var source = root.getAttribute('data-source');
      var hlsInstance = null;
      if (!video || !source) return;
      function attach() {
        if (video.getAttribute('data-ready') === 'true') return;
        video.setAttribute('data-ready', 'true');
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      function play() {
        attach();
        video.controls = true;
        root.classList.add('is-playing');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            root.classList.remove('is-playing');
          });
        }
      }
      if (button) button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) play();
        else video.pause();
      });
      video.addEventListener('play', function () {
        root.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) root.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) hlsInstance.destroy();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupBackTop();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
