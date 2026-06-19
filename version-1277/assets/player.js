(function () {
  window.initPlayer = function (stream) {
    var video = document.getElementById('videoPlayer');
    var cover = document.getElementById('playerCover');
    var button = document.getElementById('playButton');
    var loaded = false;

    if (!video || !cover || !button || !stream) {
      return;
    }

    function attachVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function play() {
      attachVideo();
      cover.classList.add('is-hidden');
      video.controls = true;
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
