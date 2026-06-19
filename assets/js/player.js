import { H as Hls } from './hls.js';

function setupPlayer(shell) {
  var video = shell.querySelector('video');
  var layer = shell.querySelector('.play-layer');
  var source = shell.getAttribute('data-video-url');
  var loaded = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function bindSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  async function startPlayback() {
    bindSource();
    video.controls = true;

    if (layer) {
      layer.classList.add('is-hidden');
    }

    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  }

  if (layer) {
    layer.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener('ended', function () {
    if (layer) {
      layer.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-video-url]').forEach(setupPlayer);
