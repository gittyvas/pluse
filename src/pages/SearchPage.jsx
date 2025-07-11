// google-oauth-app/frontend/src/pages/SearchPage.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const navigate = useNavigate();
  const accent = "#25D366";

  return (
    <div style={{ background: "#181C1F", color: "#fff", minHeight: "100vh", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "20px", color: accent }}>Search</h1>
      <p style={{ fontSize: "1.2rem", color: "#CCC", marginBottom: "30px" }}>This is where you can search your contacts and notes.</p>
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          padding: "10px 20px",
          background: "#333",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#333")}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
