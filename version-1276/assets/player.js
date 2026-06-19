document.addEventListener('DOMContentLoaded', function () {
    var frame = document.querySelector('[data-player]');
    if (!frame) {
        return;
    }

    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.player-overlay');
    if (!video || !overlay) {
        return;
    }

    var stream = video.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    var loadStream = function () {
        if (ready || !stream) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            ready = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            ready = true;
            return;
        }
        video.src = stream;
        ready = true;
    };

    var start = function () {
        loadStream();
        frame.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                frame.classList.remove('is-playing');
            });
        }
    };

    overlay.addEventListener('click', start);
    document.querySelectorAll('[data-start-player]').forEach(function (button) {
        button.addEventListener('click', start);
    });
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        frame.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            frame.classList.remove('is-playing');
        }
    });
    video.addEventListener('ended', function () {
        frame.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
});
