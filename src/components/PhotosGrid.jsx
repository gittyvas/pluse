import React from 'react';

function PhotosGrid({ photos, theme }) {
  const mutedTextColor = theme === "dark" ? "#A0A8B0" : "#606060";
  const cardBg = theme === "dark" ? "#2A343D" : "#FFFFFF";
  const borderColor = theme === "dark" ? "#3A454F" : "#E0E5E0";

  if (!photos || photos.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          background: cardBg,
          borderRadius: "8px",
          color: mutedTextColor,
          textAlign: "center",
        }}
      >
        No photos found. Make sure you granted Photos permission during Google login.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
      }}
    >
      {photos.map((photo) => (
        <div
          key={photo.id}
          style={{
            border: `1px solid ${borderColor}`,
            borderRadius: "8px",
            overflow: "hidden",
            background: cardBg,
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          }}
        >
          <img
            src={photo.baseUrl || photo.thumbnailLink || "https://placehold.co/200x200/cccccc/333333?text=No+Image"}
            alt={photo.filename || "Photo"}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/200x150/cccccc/333333?text=Error";
            }}
          />
          <div style={{ padding: "12px" }}>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: mutedTextColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {photo.filename || "Untitled"}
            </p>
            {photo.creationTime && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: mutedTextColor }}>
                {new Date(photo.creationTime).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PhotosGrid;

