export class YouTubePlayer {
  constructor(videoId = "a2uDzM9ls3A") {
    this.videoId = videoId;
    this.player = null;
    this.slider = null;
    this.timeText = null;
    this.playPauseBtn = null;
    this.isUserDragging = false;
    this.updateLoopId = null;

    this.init();
  }

  init() {
    this.slider = document.getElementById("sync-slider");
    this.timeInput = document.getElementById("time-input");
    this.timeText = document.getElementById("time-text");
    this.playPauseBtn = document.getElementById("play-pause-btn");

    // this.setupEventListeners();

    // Wait for YouTube API to be ready
    if (window.YT && window.YT.Player) {
      this.createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => this.createPlayer();
    }
  }

  createPlayer() {
    this.player = new YT.Player("player", {
      videoId: this.videoId,
      playerVars: {
        playsinline: 1,
        controls: 1,
      },
      events: {
        onReady: () => this.onPlayerReady(),
        // onStateChange: (event) => this.onPlayerStateChange(event),
      },
    });
  }

  onPlayerReady() {
    // this.slider.max = this.player.getDuration();
    this.startUpdateLoop();
  }

  startUpdateLoop() {
    const update = () => {
      if (this.player && this.player.getCurrentTime && !this.isUserDragging) {
        const currentTime = this.player.getCurrentTime();
        const duration = this.player.getDuration();

        // this.slider.value = currentTime;
        // this.timeText.innerText = currentTime + " / " + duration;
        // this.formatTime(currentTime) + " / " + this.formatTime(duration);

        // if (this.timeInput && document.activeElement !== this.timeInput) {
        //   this.timeInput.value = Math.round(currentTime);
        // }
      }
      this.updateLoopId = requestAnimationFrame(update);
    };
    update();
  }

  // onPlayerStateChange(event) {
  //   if (event.data == YT.PlayerState.PLAYING) {
  //     this.playPauseBtn.textContent = "Pause";
  //   } else if (event.data == YT.PlayerState.PAUSED) {
  //     this.playPauseBtn.textContent = "Play";
  //   } else if (event.data == YT.PlayerState.ENDED) {
  //     this.playPauseBtn.textContent = "Play";
  //   }
  // }

  setupEventListeners() {
    this.slider.addEventListener("input", () => {
      this.isUserDragging = true;
    });

    this.slider.addEventListener("change", () => {
      this.player.seekTo(this.slider.value, true);
      this.isUserDragging = false;
    });

    if (this.timeInput) {
      this.timeInput.addEventListener("change", () => {
        const newTime = Number(this.timeInput.value);
        if (!isNaN(newTime)) {
          this.player.seekTo(newTime, true);
        }
      });
    }

    this.playPauseBtn.addEventListener("click", () => {
      if (this.player.getPlayerState() === YT.PlayerState.PLAYING) {
        this.player.pauseVideo();
      } else {
        this.player.playVideo();
      }
    });
  }

  formatTime(time) {
    time = Math.round(time);
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
  }

  destroy() {
    if (this.updateLoopId) {
      cancelAnimationFrame(this.updateLoopId);
    }
    if (this.player) {
      this.player.destroy();
    }
  }
}
