import "./style.css";
import routeData from "./assets/walk1.json";
import placesData from "./assets/places.json";

import { LibreMap } from "./map.js";
import { YouTubePlayer } from "./youtube-player.js";

const youtubePlayer = new YouTubePlayer();

const map = new LibreMap(
  "map",
  [139.560587, 35.7020725],
  routeData,
  placesData,
);

// Update map position as video plays
let positionUpdateId = null;

// Hook into player ready to start position updates
const originalOnPlayerReady = youtubePlayer.onPlayerReady.bind(youtubePlayer);
youtubePlayer.onPlayerReady = function () {
  originalOnPlayerReady();

  const updatePosition = () => {
    if (youtubePlayer.player && youtubePlayer.player.getCurrentTime) {
      const currentTime = youtubePlayer.player.getCurrentTime();
      map.updatePosition(currentTime);
    }
    positionUpdateId = requestAnimationFrame(updatePosition);
  };
  updatePosition();
};
