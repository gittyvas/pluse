import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PhotosGrid from "../components/PhotosGrid";

export default function GalleryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, theme } = useAuth();

  const bgColor = theme === "dark" ? "#1A222A" : "#F8FBF8";
  const textColor = theme === "dark" ? "#E0E6EB" : "#303030";
  const accentColor = "#4CAF50";
  const mutedTextColor = theme === "dark" ? "#A0A8B0" : "#606060";

  const [photos, setPhotos] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shouldLoadPhotos, setShouldLoadPhotos] = useState(false);
  const [photosLoadedSuccessfully, setPhotosLoadedSuccessfully] = useState(false);

  const BACKEND_API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchPhotos = useCallback(async () => {
    if (!isAuthenticated || loading) {
      console.log("GalleryPage: Not authenticated or auth still loading.");
      setDataLoading(false);
      return;
    }

    setError(null);
    setDataLoading(true);
    try {
      console.log("GalleryPage: Fetching photos from backend.");
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/photos`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error("GalleryPage: Session expired or invalid. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch photos: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("GalleryPage: Fetched photos data:", data);

      const processedPhotos = (data.mediaItems || data).map((photo, index) => ({
        id: photo.id || index,
        filename: photo.filename || "Untitled",
        baseUrl: photo.baseUrl || "",
        thumbnailLink: photo.thumbnailLink || "",
        creationTime: photo.mediaMetadata?.creationTime || photo.creationTime || "",
      }));

      setPhotos(processedPhotos);
      setPhotosLoadedSuccessfully(true);
      console.log(`GalleryPage: Displaying ${processedPhotos.length} photos.`);
    } catch (err) {
      console.error("GalleryPage: Error fetching photos:", err);
      setError("Failed to load photos. Error: " + err.message);
      setPhotosLoadedSuccessfully(false);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, loading, logout, BACKEND_API_BASE_URL]);

  const handleLoadPhotos = () => {
    setShouldLoadPhotos(true);
    setError(null);
    fetchPhotos();
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bgColor,
          color: textColor,
        }}
      >
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "red",
          color: "white",
        }}
      >
        <p>Access Denied. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: bgColor,
        color: textColor,
        minHeight: "100vh",
        padding: "32px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "30px",
          color: accentColor,
        }}
      >
        Your Photo Gallery
      </h1>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          background: mutedTextColor,
          color: textColor,
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.background = theme === "dark" ? "#555" : "#CCC")
        }
        onMouseOut={(e) => (e.currentTarget.style.background = mutedTextColor)}
      >
        ← Back to Dashboard
      </button>

      {error && (
        <div
          style={{
            color: "red",
            backgroundColor: "#3a1f1f",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {!shouldLoadPhotos && (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <button
            onClick={handleLoadPhotos}
            style={{
              padding: "15px 30px",
              fontSize: "1.2rem",
              background: "#4285F4",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.3s ease",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "0 auto",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#357ae8")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#4285F4")}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google Logo"
              style={{ width: "24px", height: "24px" }}
            />
            Load Photos
          </button>
          <p style={{ marginTop: "15px", color: mutedTextColor }}>
            Tap the button above to load your photos.
          </p>
        </div>
      )}

      {shouldLoadPhotos && !dataLoading && photosLoadedSuccessfully && photos.length > 0 && (
        <div
          style={{
            backgroundColor: theme === "dark" ? "#1F3A22" : "#e6f7ff",
            border: `1px solid ${theme === "dark" ? "#3A8D40" : "#91d5ff"}`,
            padding: "15px 20px",
            marginBottom: "30px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1em",
            color: theme === "dark" ? "#A0D9B1" : "#0056b3",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
          }}
        >
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <span role="img" aria-label="Camera" style={{ fontSize: "1.3em" }}>
              📷
            </span>
            Photos Loaded Successfully
          </p>
        </div>
      )}

      {shouldLoadPhotos ? (
        dataLoading ? (
          <p
            style={{
              fontSize: "1.2rem",
              color: mutedTextColor,
              textAlign: "center",
            }}
          >
            Loading photos...
          </p>
        ) : photos.length === 0 && photosLoadedSuccessfully ? (
          <p
            style={{
              fontSize: "1.2rem",
              color: mutedTextColor,
              textAlign: "center",
            }}
          >
            No photos found.
          </p>
        ) : (
          <PhotosGrid photos={photos} theme={theme} />
        )
      ) : (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <p style={{ fontSize: "1.2rem", color: mutedTextColor }}>
            Tap "Load Photos" to fetch your photos.
          </p>
        </div>
      )}
    </div>
  );
}
