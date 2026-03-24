const TIME_ICONS = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌇",
  night: "🌙",
};

export default function ImageCard({ image, onClick }) {
  return (
    <div className="image-card" onClick={() => onClick(image)}>
      
      {/* IMAGE */}
      <div className="image-thumb">
        {image.thumb ? (
          <img src={image.thumb} alt={image.name} loading="lazy" />
        ) : (
          <div className="no-thumb">No preview</div>
        )}

        {/* SPLIT BADGE */}
        <span className="split-badge">
          {image.split?.toUpperCase()}
        </span>

        {/* 🔥 ANNOTATION COUNT BADGE (TOP RIGHT) */}
        {image.annotations?.length > 0 && (
          <span className="annotation-badge">
            🏷 {image.annotations.length}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="card-body">
        
        {/* IMAGE NAME */}
        <p className="image-name" title={image.name}>
          {image.name}
        </p>

        {/* META */}
        <div className="card-meta">
          <span>
            {TIME_ICONS[image.timeOfDay]}{" "}
            {image.timeOfDay}
          </span>

          {/* 🔥 FIXED */}
          {image.annotations?.length > 0 && (
            <span>🏷 {image.annotations.length}</span>
          )}
        </div>

        {/* GPS */}
        {image.gps && (
          <p className="gps-text">
            📍 {image.gps.lat}, {image.gps.lng}
          </p>
        )}

        {/* TAGS */}
        {image.tags?.length > 0 && (
          <div className="card-tags">
            {image.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="mini-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}