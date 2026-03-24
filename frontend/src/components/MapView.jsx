import { useEffect, useRef } from "react";

// Dynamically load Leaflet from CDN (no npm install needed)
let leafletLoaded = false;

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    if (leafletLoaded) {
      const wait = setInterval(() => {
        if (window.L) { clearInterval(wait); resolve(window.L); }
      }, 50);
      return;
    }
    leafletLoaded = true;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

export default function MapView({ images, onImageClick, activeGPS, onGPSSelect }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);

  // Initialize map
  useEffect(() => {
    loadLeaflet().then((L) => {
      if (!mapRef.current || instanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [37.77, -122.41],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      instanceRef.current = map;

      // Click on map to set GPS filter
      map.on("click", (e) => {
        onGPSSelect({ lat: e.latlng.lat.toFixed(4), lng: e.latlng.lng.toFixed(4) });
      });
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  // Update markers when images change
  useEffect(() => {
    const L = window.L;
    const map = instanceRef.current;
    if (!L || !map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const imagesWithGPS = images.filter((img) => img.gps);
    if (!imagesWithGPS.length) return;

    const bounds = [];

    imagesWithGPS.forEach((img) => {
      const lat = parseFloat(img.gps.lat);
      const lng = parseFloat(img.gps.lng);

      // Custom colored marker based on time of day
      const colors = {
        morning: "#f59e0b",
        afternoon: "#10b981",
        evening: "#f97316",
        night: "#6366f1",
      };
      const color = colors[img.timeOfDay] || "#6706f2";

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:12px;height:12px;
          background:${color};
          border:2px solid white;
          border-radius:50%;
          box-shadow:0 1px 4px rgba(0,0,0,0.4);
          cursor:pointer;
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size:12px;min-width:140px">
            <strong style="display:block;margin-bottom:4px">${img.name}</strong>
            <span style="color:#888">⏰ ${img.timeOfDay}</span><br/>
            <span style="color:#888">🏷 ${img.annotationCount} annotations</span><br/>
            ${img.tags?.length ? `<span style="color:#6706f2">${img.tags.slice(0,3).join(", ")}</span>` : ""}
            <button onclick="window.__rfSelectImage('${img.id}')" style="
              margin-top:6px;width:100%;padding:4px;
              background:#6706f2;color:white;border:none;
              border-radius:4px;cursor:pointer;font-size:11px
            ">View Details</button>
          </div>
        `);

      marker.on("click", () => onImageClick(img));
      markersRef.current.push(marker);
      bounds.push([lat, lng]);
    });

    // Fit bounds
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }
  }, [images]);

  // Draw radius circle for GPS filter
  useEffect(() => {
    const L = window.L;
    const map = instanceRef.current;
    if (!L || !map) return;

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (activeGPS?.lat && activeGPS?.lng && activeGPS?.radius) {
      const circle = L.circle(
        [parseFloat(activeGPS.lat), parseFloat(activeGPS.lng)],
        {
          radius: parseFloat(activeGPS.radius) * 1000,
          color: "#6706f2",
          fillColor: "#6706f2",
          fillOpacity: 0.08,
          weight: 2,
          dashArray: "6 4",
        }
      ).addTo(map);

      // Center pin
      const pin = L.divIcon({
        className: "",
        html: `<div style="
          width:16px;height:16px;
          background:#6706f2;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(103,6,242,0.5);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([parseFloat(activeGPS.lat), parseFloat(activeGPS.lng)], { icon: pin }).addTo(map);

      map.fitBounds(circle.getBounds(), { padding: [30, 30] });
      circleRef.current = circle;
    }
  }, [activeGPS]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="leaflet-map" />
      <div className="map-legend">
        <span className="legend-title">Time of Day</span>
        {[
          ["morning", "#f59e0b", "🌅 Morning"],
          ["afternoon", "#10b981", "☀️ Afternoon"],
          ["evening", "#f97316", "🌇 Evening"],
          ["night", "#6366f1", "🌙 Night"],
        ].map(([key, color, label]) => (
          <span key={key} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
        <span className="legend-hint">💡 Click map to set GPS filter</span>
      </div>
    </div>
  );
}
