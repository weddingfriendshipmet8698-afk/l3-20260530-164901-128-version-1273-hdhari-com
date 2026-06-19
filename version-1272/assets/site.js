document.addEventListener('DOMContentLoaded', function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  }

  function playHero() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function() {
      showSlide(active + 1);
    }, 5200);
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      showSlide(index);
      playHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function() {
      showSlide(active - 1);
      playHero();
    });
  }

  if (next) {
    next.addEventListener('click', function() {
      showSlide(active + 1);
      playHero();
    });
  }

  showSlide(0);
  playHero();

  var library = document.querySelector('.library-page');
  if (library) {
    var params = new URLSearchParams(window.location.search);
    var searchInput = document.getElementById('movie-search');
    var yearFilter = document.getElementById('year-filter');
    var regionFilter = document.getElementById('region-filter');
    var typeFilter = document.getElementById('type-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('.empty-state');

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearFilter && yearFilter.value);
      var region = normalize(regionFilter && regionFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && normalize(card.dataset.year) !== year) {
          ok = false;
        }
        if (region && normalize(card.dataset.region) !== region) {
          ok = false;
        }
        if (type && normalize(card.dataset.type) !== type) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, yearFilter, regionFilter, typeFilter].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
});
