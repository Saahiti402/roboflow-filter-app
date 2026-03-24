import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import FilterPanel from "./components/FilterPanel";
import ImageGallery from "./components/ImageGallery";
import ImageModal from "./components/ImageModal";
import { fetchImages } from "./api/client";
import "./App.css";

const MapView = lazy(() => import("./components/MapView"));

const DEFAULT_FILTERS = {
  timeOfDay: "",
  tags: [],
  split: "",
  search: "",
  lat: "",
  lng: "",
  radius: "",
};

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [images, setImages] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"

  const loadImages = useCallback(async (f, p) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchImages(f, p);
      setImages(data.images);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setAvailableTags(data.tags || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadImages(filters, 1);
  }, [filters, loadImages]);

  useEffect(() => {
    loadImages(filters, page);
  }, [page]); // eslint-disable-line

  function handleGPSSelect({ lat, lng }) {
    setFilters((prev) => ({
      ...prev,
      lat,
      lng,
      radius: prev.radius || "5",
    }));
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🔍</span>
            <span>Roboflow Image Filter</span>
          </div>
          <div className="header-right">
            <p className="header-sub">Filter and explore your dataset by metadata</p>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                ⊞ Grid
              </button>
              <button
                className={`toggle-btn ${viewMode === "map" ? "active" : ""}`}
                onClick={() => setViewMode("map")}
              >
                🗺 Map
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="app-body">
        <FilterPanel
          filters={filters}
          availableTags={availableTags}
          onChange={setFilters}
          total={total}
        />

        <main className="main-content">
          {error ? (
            <div className="error-banner">
              ⚠️ {error}. Check your API key and project settings.
            </div>
          ) : viewMode === "map" ? (
            <Suspense fallback={<div className="map-loading">Loading map…</div>}>
              <MapView
                images={images}
                onImageClick={setSelectedImage}
                activeGPS={
                  filters.lat && filters.lng
                    ? { lat: filters.lat, lng: filters.lng, radius: filters.radius }
                    : null
                }
                onGPSSelect={handleGPSSelect}
              />
            </Suspense>
          ) : (
            <ImageGallery
              images={images}
              loading={loading}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onImageClick={setSelectedImage}
            />
          )}
        </main>
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
