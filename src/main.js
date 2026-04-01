import "./style.css";
import routeData from "./assets/walk1.json";
import placesData from "./assets/places.json";
import momentsData from "./assets/moments1.json";

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

// Render moments
const momentElements = [];
momentsData.forEach((moment) => {
  const momentElement = document.createElement("div");
  momentElement.classList.add("moment");
  momentElement.innerHTML = `
    <p class="timestamp">${formatTime(moment.time)}</p>
    <p class="text">${moment.text}</p>
  `;
  momentElement.addEventListener("click", () => {
    if (youtubePlayer.player && youtubePlayer.player.seekTo) {
      youtubePlayer.player.seekTo(moment.time, true);
    }
  });
  document.getElementById("moments").appendChild(momentElement);
  momentElements.push(momentElement);
});

// Hook into player ready to start position updates
const originalOnPlayerReady = youtubePlayer.onPlayerReady.bind(youtubePlayer);
youtubePlayer.onPlayerReady = function () {
  originalOnPlayerReady();

  const updatePosition = () => {
    if (youtubePlayer.player && youtubePlayer.player.getCurrentTime) {
      const currentTime = youtubePlayer.player.getCurrentTime();
      map.updatePosition(currentTime);

      let currentIdx = 0;
      for (let i = 0; i < momentsData.length; i++) {
        if (currentTime >= momentsData[i].time) {
          currentIdx = i;
        } else {
          break;
        }
      }

      momentElements.forEach((el, idx) => {
        if (idx === currentIdx) {
          el.classList.add("current");
        } else {
          el.classList.remove("current");
        }
      });
    }
    positionUpdateId = requestAnimationFrame(updatePosition);
  };
  updatePosition();
};

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
