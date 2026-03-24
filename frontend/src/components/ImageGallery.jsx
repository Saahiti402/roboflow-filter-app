import ImageCard from "./ImageCard";

export default function ImageGallery({ images, loading, page, totalPages, onPageChange, onImageClick }) {
  if (loading) {
    return (
      <div className="gallery-loading">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    );
  }

  if (!images?.length) {
    return (
      <div className="empty-state">
        <p>😕 No images match your filters.</p>
        <p>Try adjusting or clearing the filters.</p>
      </div>
    );
  }

  return (
    <div className="gallery-wrapper">
      <div className="image-grid">
        {images.map((img) => (
          <ImageCard key={img.id} image={img} onClick={onImageClick} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="page-btn"
          >
            ← Prev
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="page-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
