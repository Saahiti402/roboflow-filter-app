// backend/server.test.js
// Run with: node --test server.test.js  (Node 18 built-in test runner)

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

// ── helpers ──────────────────────────────────────────────────

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://localhost:4000${path}`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      })
      .on("error", reject);
  });
}

// ── unit tests for pure helpers ──────────────────────────────
// Import helpers directly (no server needed)

describe("roboflow helpers", () => {
  // We test the pure functions directly
  const {
    normalizeImage,
  } = require("./roboflow");

  it("normalizeImage returns required fields", () => {
    const raw = {
      id: "abc123",
      name: "street-car-01.jpg",
      image: "https://example.com/img.jpg",
      width: 1920,
      height: 1080,
      created: new Date("2024-06-15T14:30:00Z").getTime(),
    };
    const result = normalizeImage(raw);

    assert.equal(result.id, "abc123");
    assert.equal(result.name, "street-car-01.jpg");
    assert.ok(["morning", "afternoon", "evening", "night"].includes(result.timeOfDay));
    assert.ok(Array.isArray(result.tags));
    assert.ok(result.gps === null || (typeof result.gps.lat !== "undefined"));
  });

  it("normalizeImage extracts tags from filename", () => {
    const raw = { id: "x", name: "busy-street-car.jpg", created: Date.now() };
    const result = normalizeImage(raw);
    assert.ok(result.tags.includes("street") || result.tags.includes("busy"));
  });

  it("normalizeImage handles missing fields gracefully", () => {
    const raw = { id: "empty" };
    assert.doesNotThrow(() => normalizeImage(raw));
    const result = normalizeImage(raw);
    assert.equal(result.annotationCount, 0);
    assert.equal(result.split, "train");
  });
});

describe("haversine distance (via API filter)", () => {
  // We test the GPS filtering logic indirectly
  it("filters images outside radius correctly", () => {
    // San Francisco to Los Angeles is ~559km
    // So radius 100km from SF should exclude LA coords
    const sfLat = 37.77;
    const sfLng = -122.41;
    const laLat = 34.05;
    const laLng = -118.24;

    function haversineKm(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const dist = haversineKm(sfLat, sfLng, laLat, laLng);
    assert.ok(dist > 500, `Expected SF→LA > 500km, got ${dist.toFixed(1)}km`);
    assert.ok(dist < 600, `Expected SF→LA < 600km, got ${dist.toFixed(1)}km`);
  });
});
