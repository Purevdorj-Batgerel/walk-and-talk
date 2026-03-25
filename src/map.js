import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getTheme, setTheme } from "./util.js";

const STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

export class LibreMap {
  constructor(containerId, center, routeData, placesData) {
    this.coordinates = routeData.map((point) => [point.lng, point.lat]);
    this.routeData = routeData;
    this.placesData = placesData;
    this.currentPosition = null;
    this.isAutoCentering = false;
    this.autoCenterTimeout = null;

    this.map = new maplibregl.Map({
      container: containerId,
      style: "https://tiles.openfreemap.org/styles/bright",
      center,
      zoom: 18,
    });

    // this.map.on("mousedown", () => {
    //   this.isAutoCentering = false;

    //   this.autoCenterTimeout = setTimeout(() => {
    //     this.isAutoCentering = true;
    //   }, 3000);
    // });

    // this.map.on("movestart", (e) => {
    //   if (e.originalEvent) {
    //     this.isAutoCentering = false;
    //     if (this.autoCenterTimeout) {
    //       clearTimeout(this.autoCenterTimeout);
    //     }
    //     this.autoCenterTimeout = setTimeout(() => {
    //       this.isAutoCentering = true;
    //     }, 3000);
    //   }
    // });

    this.map.on("load", () => {
      this.addRouteLayer(getTheme());
      this.addPositionLayer();
      this.addPlaces();
    });

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          const newTheme = e.matches ? "dark" : "light";
          this.map.setStyle(STYLES[newTheme]);
          this.map.once("styledata", () => {
            this.addRouteLayer(newTheme);
          });
          const themeSwitcher = document.getElementById("theme-switcher");
          themeSwitcher.textContent =
            newTheme === "dark" ? "☀️ Light" : "🌙 Dark";
        }
      });

    // Listen for manual theme changes
    window.addEventListener("themeChange", (e) => {
      console.log("Theme changed to:", e.detail);
      this.map.setStyle(STYLES[e.detail]);
      this.map.once("styledata", () => {
        this.addRouteLayer(e.detail);
      });
      const themeSwitcher = document.getElementById("theme-switcher");
      themeSwitcher.textContent = e.detail === "dark" ? "☀️ Light" : "🌙 Dark";
    });
  }

  addRouteLayer(theme) {
    this.map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: this.coordinates,
        },
      },
    });
    this.map.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 8,
      },
    });
  }

  addPositionLayer() {
    this.map.addSource("position", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
      },
    });
    this.map.addLayer({
      id: "position",
      type: "circle",
      source: "position",
      paint: {
        "circle-radius": 8,
        "circle-color": "#ef4444",
        "circle-stroke-width": 3,
        "circle-stroke-color": "#fff",
      },
    });
  }

  addPlaces() {
    this.placesData.forEach((place) => {
      const el = document.createElement("div");
      el.className = `place-card ${place.type}`;

      const link = document.createElement("a");
      link.href = place.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = place.name;

      el.appendChild(link);

      new maplibregl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .addTo(this.map);
    });
  }

  interpolate(t, p1, p2) {
    const ratio = (t - p1.time) / (p2.time - p1.time);
    return {
      lng: p1.lng + (p2.lng - p1.lng) * ratio,
      lat: p1.lat + (p2.lat - p1.lat) * ratio,
    };
  }

  getPositionAtTime(currentTime) {
    // Find the two points we are currently between
    for (let i = 0; i < this.routeData.length - 1; i++) {
      const p1 = this.routeData[i];
      const p2 = this.routeData[i + 1];

      if (currentTime >= p1.time && currentTime <= p2.time) {
        return this.interpolate(currentTime, p1, p2);
      }
    }
    // Return last point if video exceeds data
    return this.routeData[this.routeData.length - 1];
  }

  updatePosition(currentTime) {
    const position = this.getPositionAtTime(currentTime);
    this.currentPosition = position;

    const source = this.map.getSource("position");
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [position.lng, position.lat],
        },
      });
    }

    if (this.isAutoCentering) {
      this.map.setCenter([position.lng, position.lat]);
    }
  }

  updateRouteColor(theme) {
    this.map.setPaintProperty(
      "route",
      "line-color",
      theme === "dark" ? "#3b82f6" : "#2563eb",
    );
  }
}

export const initMapControls = () => {
  const themeSwitcher = document.getElementById("theme-switcher");
  themeSwitcher.textContent = getTheme() === "dark" ? "☀️ Light" : "🌙 Dark";
  themeSwitcher.addEventListener("click", () => {
    const currentTheme = getTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    themeSwitcher.textContent = newTheme === "dark" ? "☀️ Light" : "🌙 Dark";
  });
};
