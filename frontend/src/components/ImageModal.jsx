import { useEffect, useState, useRef } from "react";
import { fetchImageDetail } from "../api/client";

export default function ImageModal({ image, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!image?.id) return;
    setLoading(true);

    fetchImageDetail(image.id)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [image?.id]);

  if (!image) return null;

  const annotations = detail?.annotations || detail?.image?.annotations || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-body">
          
          {/* 🔥 IMAGE + BOUNDING BOXES */}
          <div className="modal-image" style={{ position: "relative" }}>
            <img
              ref={imgRef}
              src={image.url || image.thumb}
              alt={image.name}
              onLoad={() => setImgLoaded(true)}
              style={{ maxWidth: "500px", borderRadius: "10px" }}
            />

            {/* 🔥 DRAW BOXES */}
            {imgLoaded &&
              annotations.map((ann, i) => {
                if (!imgRef.current) return null;

                const scaleX =
                  imgRef.current.clientWidth / imgRef.current.naturalWidth;
                const scaleY =
                  imgRef.current.clientHeight / imgRef.current.naturalHeight;

                const [x, y, w, h] = ann.bbox.map(Number);

                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: x * scaleX,
                      top: y * scaleY,
                      width: w * scaleX,
                      height: h * scaleY,
                      border: "2px solid red",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "-18px",
                        left: "0",
                        background: "red",
                        color: "white",
                        fontSize: "12px",
                        padding: "2px 4px",
                      }}
                    >
                      {ann.label}
                    </span>
                  </div>
                );
              })}
          </div>

          {/* 🔥 INFO PANEL */}
          <div className="modal-info">
            <h2>{image.name}</h2>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Uploaded</span>
                <span>{new Date(image.uploadedAt).toLocaleString()}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Time of Day</span>
                <span style={{ textTransform: "capitalize" }}>
                  {image.timeOfDay}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Split</span>
                <span style={{ textTransform: "capitalize" }}>
                  {image.split}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Dimensions</span>
                <span>{image.width} × {image.height}px</span>
              </div>

              {image.gps && (
                <div className="info-item">
                  <span className="info-label">GPS</span>
                  <span>{image.gps.lat}, {image.gps.lng}</span>
                </div>
              )}
            </div>

            {/* TAGS */}
            {image.tags?.length > 0 && (
              <div className="modal-tags">
                <span className="info-label">Tags</span>
                <div className="tag-row">
                  {image.tags.map((tag) => (
                    <span key={tag} className="mini-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 🔥 ANNOTATIONS LIST */}
            <div className="annotations-section">
              <h3>Annotations</h3>

              {loading ? (
                <p>Loading annotations...</p>
              ) : annotations.length > 0 ? (
                <ul className="annotation-list">
                  {annotations.map((ann, i) => (
                    <li key={i}>
                      <strong>{ann.label}</strong> → [{ann.bbox.join(", ")}]
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-annotations">
                  No annotations on this image.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}