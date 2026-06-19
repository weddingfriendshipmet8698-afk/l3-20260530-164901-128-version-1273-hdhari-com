document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                if (input) {
                    input.focus();
                }
            }
        });
    });

    document.querySelectorAll('.filter-input').forEach(function (input) {
        var targetId = input.getAttribute('data-filter-target');
        var list = targetId ? document.getElementById(targetId) : null;
        if (!list) {
            return;
        }
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            list.querySelectorAll('.movie-card').forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.classList.toggle('hidden-by-filter', keyword && text.indexOf(keyword) === -1);
            });
        });
    });

    var topButton = document.querySelector('.back-to-top');
    if (topButton) {
        window.addEventListener('scroll', function () {
            topButton.classList.toggle('show', window.scrollY > 360);
        });
        topButton.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var searchInput = document.getElementById('movie-search-input');
    var searchSelect = document.getElementById('movie-search-category');
    var searchResults = document.getElementById('movie-search-results');
    if (searchInput && searchSelect && searchResults && window.MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        searchInput.value = initial;

        var createCard = function (movie) {
            var article = document.createElement('article');
            article.className = 'movie-card';
            article.innerHTML = [
                '<a class="movie-poster" href="' + movie.url + '">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="movie-badge">' + escapeHtml(movie.category) + '</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
                '<p class="movie-meta">' + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(' · ')) + '</p>',
                '<p class="movie-line">' + escapeHtml(movie.line) + '</p>',
                '</div>'
            ].join('');
            return article;
        };

        var render = function () {
            var keyword = searchInput.value.trim().toLowerCase();
            var category = searchSelect.value;
            var results = window.MOVIES.filter(function (movie) {
                var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.category].join(' ').toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) > -1;
                var matchCategory = !category || movie.category === category;
                return matchKeyword && matchCategory;
            }).slice(0, 120);
            searchResults.innerHTML = '';
            if (!results.length) {
                var empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.textContent = '没有找到相关影片';
                searchResults.appendChild(empty);
                return;
            }
            results.forEach(function (movie) {
                searchResults.appendChild(createCard(movie));
            });
        };

        searchInput.addEventListener('input', render);
        searchSelect.addEventListener('change', render);
        render();
    }
});

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
