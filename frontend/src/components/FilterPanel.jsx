import { useState } from "react";

const TIME_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "morning", label: "🌅 Morning (5am–12pm)" },
  { value: "afternoon", label: "☀️ Afternoon (12pm–5pm)" },
  { value: "evening", label: "🌇 Evening (5pm–8pm)" },
  { value: "night", label: "🌙 Night (8pm–5am)" },
];

const SPLIT_OPTIONS = [
  { value: "", label: "All splits" },
  { value: "train", label: "Train" },
  { value: "valid", label: "Validation" },
  { value: "test", label: "Test" },
];

export default function FilterPanel({ filters, availableTags, onChange, total }) {
  const [gpsOpen, setGpsOpen] = useState(false);

  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function toggleTag(tag) {
    const current = filters.tags || [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    update("tags", next);
  }

  function clearAll() {
    onChange({
      timeOfDay: "",
      tags: [],
      split: "",
      search: "",
      object: "", // 🔥 NEW
      lat: "",
      lng: "",
      radius: "",
    });
  }

  const activeCount = [
    filters.timeOfDay,
    filters.tags?.length,
    filters.split,
    filters.search,
    filters.object, // 🔥 NEW
    filters.lat,
  ].filter(Boolean).length;

  return (
    <aside className="filter-panel">
      <div className="filter-header">
        <h2>Filters</h2>
        {activeCount > 0 && (
          <button className="clear-btn" onClick={clearAll}>
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <p className="result-count">{total} images found</p>

      {/* 🔍 FILE SEARCH */}
      <div className="filter-section">
        <label>Search by filename</label>
        <input
          type="text"
          placeholder="e.g. street, car..."
          value={filters.search || ""}
          onChange={(e) => update("search", e.target.value)}
          className="text-input"
        />
      </div>

      {/* 🔥 OBJECT SEARCH (NEW) */}
      <div className="filter-section">
        <label>Search by object</label>
        <input
          type="text"
          placeholder="e.g. person, adult, car..."
          value={filters.object || ""}
          onChange={(e) => update("object", e.target.value)}
          className="text-input"
        />
      </div>

      {/* TIME OF DAY */}
      <div className="filter-section">
        <label>Time of Day</label>
        <div className="radio-group">
          {TIME_OPTIONS.map((opt) => (
            <label key={opt.value} className="radio-label">
              <input
                type="radio"
                name="timeOfDay"
                value={opt.value}
                checked={filters.timeOfDay === opt.value}
                onChange={() => update("timeOfDay", opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* SPLIT */}
      <div className="filter-section">
        <label>Dataset Split</label>
        <select
          value={filters.split || ""}
          onChange={(e) => update("split", e.target.value)}
          className="select-input"
        >
          {SPLIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* TAGS */}
      {availableTags?.length > 0 && (
        <div className="filter-section">
          <label>Tags</label>
          <div className="tag-cloud">
            {availableTags.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${filters.tags?.includes(tag) ? "active" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GPS */}
      <div className="filter-section">
        <button className="collapse-btn" onClick={() => setGpsOpen(!gpsOpen)}>
          📍 GPS Location Filter {gpsOpen ? "▲" : "▼"}
        </button>
        {gpsOpen && (
          <div className="gps-inputs">
            <input
              type="number"
              placeholder="Latitude"
              value={filters.lat || ""}
              onChange={(e) => update("lat", e.target.value)}
              className="text-input"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={filters.lng || ""}
              onChange={(e) => update("lng", e.target.value)}
              className="text-input"
            />
            <input
              type="number"
              placeholder="Radius (km)"
              value={filters.radius || ""}
              onChange={(e) => update("radius", e.target.value)}
              className="text-input"
            />
          </div>
        )}
      </div>
    </aside>
  );
}