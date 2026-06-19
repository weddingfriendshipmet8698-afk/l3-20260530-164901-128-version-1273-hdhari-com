(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyCardFilter(container, query, year, region, type) {
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    var q = normalize(query);
    var y = normalize(year);
    var r = normalize(region);
    var t = normalize(type);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.getAttribute('data-keywords')
      ].join(' '));

      var ok = true;
      ok = ok && (!q || haystack.indexOf(q) !== -1);
      ok = ok && (!y || normalize(card.getAttribute('data-year')) === y);
      ok = ok && (!r || normalize(card.getAttribute('data-region')) === r);
      ok = ok && (!t || normalize(card.getAttribute('data-type')) === t);
      card.classList.toggle('is-filtered-out', !ok);
    });
  }

  var searchRoot = document.querySelector('[data-search-page]');

  if (searchRoot) {
    var input = searchRoot.querySelector('[data-search-input]');
    var yearSelect = searchRoot.querySelector('[data-search-year]');
    var regionSelect = searchRoot.querySelector('[data-search-region]');
    var typeSelect = searchRoot.querySelector('[data-search-type]');
    var results = searchRoot.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function refreshSearch() {
      applyCardFilter(
        results,
        input ? input.value : '',
        yearSelect ? yearSelect.value : '',
        regionSelect ? regionSelect.value : '',
        typeSelect ? typeSelect.value : ''
      );
    }

    [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', refreshSearch);
        control.addEventListener('change', refreshSearch);
      }
    });

    refreshSearch();
  }

  var localFilters = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));

  localFilters.forEach(function (panel) {
    var section = panel.parentElement;
    var list = section ? section.querySelector('[data-card-list]') : null;
    var textInput = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');

    function refreshLocal() {
      if (list) {
        applyCardFilter(list, textInput ? textInput.value : '', year ? year.value : '', '', '');
      }
    }

    [textInput, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', refreshLocal);
        control.addEventListener('change', refreshLocal);
      }
    });
  });

  var video = document.querySelector('[data-player]');
  var trigger = document.querySelector('[data-play-trigger]');

  if (video && trigger) {
    var streamUrl = video.getAttribute('data-stream');
    var attached = false;

    function attachStream() {
      if (attached || !streamUrl) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();
      trigger.classList.add('is-hidden');
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {
          trigger.classList.remove('is-hidden');
        });
      }
    }

    trigger.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      trigger.classList.add('is-hidden');
    });
  }
})();
