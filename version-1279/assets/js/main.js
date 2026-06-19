(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function getParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (error) {
      return new URLSearchParams("");
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    if (!button) {
      return;
    }
    button.addEventListener("click", function() {
      document.body.classList.toggle("nav-open");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(parseInt(dot.getAttribute("data-slide") || "0", 10));
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    if (!scopes.length) {
      scopes = Array.prototype.slice.call(document.querySelectorAll(".catalog-section"));
    }
    var params = getParams();
    var queryFromUrl = normalize(params.get("q"));

    scopes.forEach(function(scope) {
      var search = scope.querySelector(".catalog-search");
      var year = scope.querySelector(".catalog-year");
      var type = scope.querySelector(".catalog-type");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      if (!cards.length) {
        return;
      }
      if (search && queryFromUrl && search.id === "searchPageInput") {
        search.value = params.get("q") || "";
      }

      function apply() {
        var q = normalize(search ? search.value : "");
        var y = normalize(year ? year.value : "");
        var t = normalize(type ? type.value : "");
        cards.forEach(function(card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchQ = !q || haystack.indexOf(q) !== -1;
          var matchY = !y || normalize(card.getAttribute("data-year")) === y;
          var matchT = !t || normalize(card.getAttribute("data-type")) === t;
          card.classList.toggle("is-hidden", !(matchQ && matchY && matchT));
        });
      }

      if (search) {
        search.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      apply();
    });
  }

  function setupMoviePlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }
    var shell = video.closest(".video-shell");
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (loaded) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }

    function playVideo() {
      loadStream();
      if (shell) {
        shell.classList.add("is-playing");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {
          if (shell) {
            shell.classList.remove("is-playing");
          }
        });
      }
    }

    button.addEventListener("click", function(event) {
      event.preventDefault();
      playVideo();
    });

    video.addEventListener("click", function() {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function() {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function() {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function() {
      if (shell) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;

  ready(function() {
    initMenu();
    initHeroCarousel();
    initFilters();
  });
})();
