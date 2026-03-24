// -----------------------------
// roboflow.js
// -----------------------------
require("dotenv").config();
const axios = require("axios");

const BASE_URL = "https://api.roboflow.com";
const API_KEY = process.env.ROBOFLOW_API_KEY;
const WORKSPACE = process.env.ROBOFLOW_WORKSPACE;
const PROJECT = process.env.ROBOFLOW_PROJECT;

// -----------------------------
// FETCH PROJECT INFO
// -----------------------------
async function fetchProjectInfo() {
  try {
    const response = await axios.get(
      `${BASE_URL}/${WORKSPACE}/${PROJECT}`,
      { params: { api_key: API_KEY } }
    );

    return response.data?.project || {};
  } catch (error) {
    console.error("❌ Error fetching project info");
    return {};
  }
}

// -----------------------------
// FETCH IMAGE ANNOTATIONS (API)
// -----------------------------
async function fetchImageAnnotations(imageId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/${WORKSPACE}/${PROJECT}/images/${imageId}`,
      { params: { api_key: API_KEY } }
    );

    return response.data || {};
  } catch {
    return {};
  }
}

// -----------------------------
// NORMALIZE IMAGE
// -----------------------------
function normalizeImage(img) {
  const hour = extractHourFromFilename(img.name);
  const finalHour = hour !== null ? hour : Math.floor(Math.random() * 24);

  return {
    id: img.id,
    name: img.name,
    url: img.image,
    thumb: img.image,
    width: img.width || 0,
    height: img.height || 0,

    timeOfDay: getTimeOfDay(finalHour),

    gps: simulateGPS(img.id),
    tags: extractTagsFromName(img.name),
    split: img.split || "train",
  };
}

// -----------------------------
// HELPERS
// -----------------------------
function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

// 🔥 Robust time extraction
function extractHourFromFilename(filename) {
  try {
    const match = filename.match(/_(\d{2})-(\d{2})-(\d{2})(AM|PM)/i);
    if (!match) return null;

    let hour = parseInt(match[1]);
    const period = match[4].toUpperCase();

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return hour;
  } catch {
    return null;
  }
}

function simulateGPS(id) {
  const hash = String(id || "")
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return {
    lat: (37.7 + (hash % 100) * 0.01).toFixed(4),
    lng: (-122.4 - (hash % 50) * 0.01).toFixed(4),
  };
}

function extractTagsFromName(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .split(/[-_\s]+/)
    .map((t) => t.toLowerCase());
}

// -----------------------------
module.exports = {
  fetchProjectInfo,
  fetchImageAnnotations,
  normalizeImage,
};