const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchImages(filters = {}, page = 1, limit = 24) {
  const params = new URLSearchParams({ page, limit });
  if (filters.timeOfDay) params.set("timeOfDay", filters.timeOfDay);
  if (filters.tags?.length) params.set("tag", filters.tags.join(","));
  if (filters.split) params.set("split", filters.split);
  if (filters.search) params.set("search", filters.search);
  if (filters.lat && filters.lng && filters.radius) {
    params.set("lat", filters.lat);
    params.set("lng", filters.lng);
    params.set("radius", filters.radius);
  }

  const res = await fetch(`${BASE}/api/images?${params}`);
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

export async function fetchImageDetail(id) {
  const res = await fetch(`${BASE}/api/images/${id}`);
  if (!res.ok) throw new Error("Failed to fetch image detail");
  return res.json();
}

export async function fetchProjectInfo() {
  const res = await fetch(`${BASE}/api/project`);
  if (!res.ok) throw new Error("Failed to fetch project info");
  return res.json();
}

export async function fetchTags() {
  const res = await fetch(`${BASE}/api/tags`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}
