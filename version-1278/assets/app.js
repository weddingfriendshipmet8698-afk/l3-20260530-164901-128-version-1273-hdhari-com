(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    function setupHero() {
        var hero = qs('.hero-carousel');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        var previous = qs('.hero-prev', hero);
        var next = qs('.hero-next', hero);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                var active = current === index;
                slide.classList.toggle('active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var list = qs('.movie-list');
        if (!list) {
            return;
        }
        var cards = qsa('.movie-card', list);
        var keyword = qs('.movie-keyword');
        var filters = qsa('.movie-filter');
        var sort = qs('.movie-sort');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (keyword && query) {
            keyword.value = query;
        }

        function matchCard(card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            var searchTerm = keyword ? keyword.value.trim().toLowerCase() : '';
            if (searchTerm && text.indexOf(searchTerm) === -1) {
                return false;
            }
            return filters.every(function (filter) {
                var value = filter.value;
                var field = filter.getAttribute('data-filter');
                return !value || card.getAttribute('data-' + field) === value;
            });
        }

        function applySort() {
            if (!sort || sort.value === 'default') {
                return;
            }
            var sorted = cards.slice().sort(function (a, b) {
                if (sort.value === 'year') {
                    return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                }
                if (sort.value === 'views') {
                    return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
                }
                return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
            });
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
        }

        function apply() {
            cards.forEach(function (card) {
                card.classList.toggle('is-hidden', !matchCard(card));
            });
            applySort();
        }

        if (keyword) {
            keyword.addEventListener('input', apply);
        }
        filters.forEach(function (filter) {
            filter.addEventListener('change', apply);
        });
        if (sort) {
            sort.addEventListener('change', apply);
        }
        apply();
    }

    window.setupMoviePlayer = function (source) {
        var video = qs('.movie-player-video');
        var cover = qs('.movie-player-cover');
        var playButton = qs('.movie-play-button');
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        function attachSource() {
            if (video.getAttribute('src') || hlsInstance) {
                playVideo();
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.setAttribute('src', source);
                video.load();
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                return;
            }

            video.setAttribute('src', source);
            video.load();
            playVideo();
        }

        function start() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            attachSource();
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        if (playButton) {
            playButton.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
