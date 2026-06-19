(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    initHero();
    initFilters();
    initPlayers();
  });

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });

    play();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));
    forms.forEach(function (form) {
      var input = form.querySelector('[data-filter-input]');
      var list = document.querySelector('[data-card-list]');
      var empty = document.querySelector('[data-empty-tip]');
      var buttonWrap = document.querySelector('[data-filter-buttons]');
      var currentButton = '';
      if (!input || !list) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial) {
        input.value = initial;
      }

      function apply() {
        var term = (input.value || '').trim().toLowerCase();
        var visible = 0;
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var passText = !term || text.indexOf(term) !== -1;
          var passButton = !currentButton || text.indexOf(currentButton.toLowerCase()) !== -1;
          var show = passText && passButton;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      input.addEventListener('input', apply);

      if (buttonWrap) {
        Array.prototype.slice.call(buttonWrap.querySelectorAll('[data-filter-value]')).forEach(function (button) {
          button.addEventListener('click', function () {
            currentButton = button.getAttribute('data-filter-value') || '';
            Array.prototype.slice.call(buttonWrap.querySelectorAll('button')).forEach(function (item) {
              item.classList.remove('active');
            });
            button.classList.add('active');
            apply();
          });
        });
      }

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');
      var stream = box.getAttribute('data-stream');
      var started = false;
      if (!video || !button || !stream) {
        return;
      }

      function attach() {
        if (started) {
          return Promise.resolve();
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          });
        }
        video.src = stream;
        return Promise.resolve();
      }

      function start() {
        attach().then(function () {
          box.classList.add('is-playing');
          var result = video.play();
          if (result && result.catch) {
            result.catch(function () {});
          }
        });
      }

      button.addEventListener('click', start);
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
    });
  }
})();
