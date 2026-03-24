// -----------------------------
// server.js
// -----------------------------
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const {
  fetchProjectInfo,
  normalizeImage,
} = require("./roboflow");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// -----------------------------
// SERVE DATASET
// -----------------------------
app.use("/dataset", express.static(path.join(process.cwd(), "train")));

// -----------------------------
// CACHE
// -----------------------------
let imageCache = null;
let cacheTime = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

// -----------------------------
// LOAD COCO ANNOTATIONS
// -----------------------------
let cocoData = null;

function loadCocoAnnotations() {
  console.log("📂 Looking for dataset at:", path.join(process.cwd(), "train"));
  const filePath = path.join(process.cwd(), "train/_annotations.coco.json");

  if (!fs.existsSync(filePath)) {
    console.error("❌ COCO file not found");
    return;
  }

  const raw = fs.readFileSync(filePath);
  cocoData = JSON.parse(raw);

  console.log("✅ COCO annotations loaded");
}

loadCocoAnnotations();

// -----------------------------
// GET ANNOTATIONS FOR IMAGE
// -----------------------------
function getAnnotationsForImage(filename) {
  if (!cocoData) return [];

  const imageObj = cocoData.images.find(
    (img) => img.file_name === filename
  );

  if (!imageObj) return [];

  const annotations = cocoData.annotations.filter(
    (ann) => ann.image_id === imageObj.id
  );

  return annotations.map((ann) => {
    const category = cocoData.categories.find(
      (c) => c.id === ann.category_id
    );

    return {
      label: category?.name || "unknown",
      bbox: ann.bbox.map(Number),
    };
  });
}

// -----------------------------
// LOAD IMAGES (WITH ANNOTATIONS)
// -----------------------------
async function getCachedImages() {
  if (imageCache && Date.now() - cacheTime < CACHE_TTL_MS) {
    return imageCache;
  }

  const basePath = path.join(process.cwd(), "train");

  if (!fs.existsSync(basePath)) {
    console.error("Dataset not found:", basePath);
    return [];
  }

  const files = fs.readdirSync(basePath);

  const images = files
    .filter((file) => !file.endsWith(".json"))
    .map((file, index) => {
      const normalized = normalizeImage({
        id: `train-${index}`,
        name: file,
        image: `http://localhost:${PORT}/dataset/${file}`,
        split: "train",
      });

      const annotations = getAnnotationsForImage(file);

      return {
        ...normalized,
        annotations, // 🔥 attach annotations here
      };
    });

  imageCache = images;
  cacheTime = Date.now();

  console.log(`✅ Loaded ${images.length} images`);

  return images;
}

// -----------------------------
// ROUTES
// -----------------------------

app.get("/", (req, res) => {
  res.json({ message: "🚀 API running" });
});

// -----------------------------
// GET IMAGES (FILTER + OBJECT SEARCH)
// -----------------------------
app.get("/api/images", async (req, res) => {
  try {
    let images = await getCachedImages();

    const {
      timeOfDay,
      tag,
      split,
      search,
      object, // 🔥 NEW
      sortBy = "name",
      order = "asc",
      page = 1,
      limit = 24,
    } = req.query;

    // -----------------------------
    // FILTERS
    // -----------------------------
    if (timeOfDay) {
      images = images.filter((img) => img.timeOfDay === timeOfDay);
    }

    if (tag) {
      const tags = tag.split(",").map((t) => t.toLowerCase());
      images = images.filter((img) =>
        tags.every((t) => img.tags.includes(t))
      );
    }

    if (split) {
      images = images.filter((img) => img.split === split);
    }

    if (search) {
      const q = search.toLowerCase();
      images = images.filter(
        (img) =>
          img.name.toLowerCase().includes(q) ||
          img.tags.some((t) => t.includes(q))
      );
    }

    // -----------------------------
    // 🔥 OBJECT-BASED SEARCH
    // -----------------------------
    if (object) {
      const targets = object
        .split(",")
        .map((o) => o.trim().toLowerCase());

      images = images.filter((img) =>
        targets.every((t) =>
          img.annotations.some((ann) =>
            ann.label.toLowerCase().includes(t)
          )
        )
      );
    }

    // -----------------------------
    // SORT
    // -----------------------------
    images.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });

    // -----------------------------
    // PAGINATION
    // -----------------------------
    const total = images.length;
    const start = (page - 1) * limit;
    const paginated = images.slice(start, start + parseInt(limit));

    const allTags = [...new Set(images.flatMap((img) => img.tags))];

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      tags: allTags,
      images: paginated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// IMAGE DETAILS
// -----------------------------
app.get("/api/images/:id", async (req, res) => {
  try {
    const images = await getCachedImages();
    const image = images.find((img) => img.id === req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json(image); // annotations already included
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});