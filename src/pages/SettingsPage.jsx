// google-oauth-app/frontend/src/pages/SettingsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Reusable Confirmation Modal Component
const ConfirmationModal = ({ message, onConfirm, onCancel, confirmText, cancelText, accentColor, cardBgColor, textColor, mutedTextColor, cardBorderColor }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }} onClick={onCancel}> {/* Allows clicking outside the modal to close it */}
      <div style={{
        background: cardBgColor,
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
        maxWidth: "450px",
        textAlign: "center",
        border: `1px solid ${cardBorderColor}`,
      }} onClick={(e) => e.stopPropagation()}> {/* Prevents clicks inside the modal from closing it */}
        <p style={{ fontSize: "1.2rem", color: textColor, marginBottom: "20px" }}>
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              fontWeight: "bold",
              background: accentColor, // Use provided accentColor for confirm button
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.3s ease",
              "&:hover": { background: accentColor === "#DC3545" ? "#C82333" : "#43A047" }, // Darken based on color
            }}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              fontWeight: "bold",
              background: mutedTextColor,
              color: textColor,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.3s ease",
              "&:hover": { background: "#808080" },
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};


export default function SettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, theme, toggleTheme } = useAuth();

  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null); // For feedback messages

  // Define backend base URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL;

  // Define colors consistent with Home.jsx "Soft & Gradient" style
  const bgColor = theme === 'dark' ? "#1A222A" : "#F8FBF8";
  const textColor = theme === 'dark' ? "#E0E6EB" : "#303030";
  const accentColor = "#4CAF50"; // Soft green accent
  const cardBgColor = theme === 'dark' ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)";
  const cardBorderColor = theme === 'dark' ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === 'dark' ? "#A0A8B0" : "#606060";
  const headerBgColor = theme === 'dark' ? "#1A222A" : "#FFFFFF";
  const headerBorderColor = theme === 'dark' ? "#3A454F" : "#E8E8E8";


  // Redirect if not authenticated or still loading auth state
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);


  // Handle Delete Account
  const handleDeleteAccount = async () => {
    setShowDeleteModal(false); // Close modal
    setNotificationMessage(null); // Clear any previous notification messages

    try {
      const res = await axios.delete(`${API_URL}/api/user/account`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setNotificationMessage({ type: 'success', text: "Account deleted successfully. Logging out." });
        setTimeout(() => logout(), 2000); // Log out after a short delay
      } else {
        setNotificationMessage({ type: 'error', text: res.data.error || "Failed to delete account." });
      }
    } catch (err) {
      console.error("Network error while deleting account:", err);
      setNotificationMessage({ type: 'error', text: err.response?.data?.error || "Network error while deleting account." });
    }
  };


  if (loading) {
    return (
      <div style={{ background: bgColor, color: textColor, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ background: bgColor, color: textColor, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Access Denied. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ background: bgColor, color: textColor, minHeight: "100vh", fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          width: "100%",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          borderBottom: `1px solid ${headerBorderColor}`,
          background: headerBgColor,
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/logo.png"
            alt="Pluse CRM Logo"
            style={{ width: "36px", height: "36px", borderRadius: "50%" }}
          />
          <span style={{ fontWeight: "700", fontSize: "24px", color: textColor, letterSpacing: "-0.8px" }}>
            Pluse
          </span>
        </div>
        <nav style={{ display: "flex", gap: "25px", alignItems: "center" }}>
          <a
            href="/dashboard"
            onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}
            style={{
              textDecoration: "none",
              color: textColor,
              fontWeight: "500",
              fontSize: "1rem",
              transition: "color 0.2s ease",
              "&:hover": {
                color: accentColor,
              },
            }}
          >
            Dashboard
          </a>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: accentColor,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
          <button
            onClick={logout}
            style={{
              padding: "10px 22px",
              fontSize: "1rem",
              fontWeight: "bold",
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.3s ease, transform 0.2s ease",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
              "&:hover": {
                background: "#43A047",
                transform: "translateY(-1px)",
              },
            }}
          >
            Log Out
          </button>
        </nav>
      </header>

      {/* Main Content Section - Only Delete Account */}
      <section
        style={{
          padding: "60px 20px",
          maxWidth: "900px",
          margin: "60px auto",
          background: cardBgColor,
          borderRadius: "20px",
          border: `1px solid ${cardBorderColor}`,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "30px",
        }}
      >
        <h2 style={{ fontSize: "2.8rem", fontWeight: "bold", color: accentColor }}>Account Settings</h2>

        {notificationMessage && (
          <div style={{
            padding: "10px",
            borderRadius: "8px",
            background: notificationMessage.type === 'success' ? "#D4EDDA" : "#F8D7DA",
            color: notificationMessage.type === 'success' ? "#155724" : "#721C24",
            border: `1px solid ${notificationMessage.type === 'success' ? "#C3E6CB" : "#F5C6CB"}`,
            marginBottom: "15px",
            fontSize: "0.9rem",
            textAlign: "center",
            width: "100%",
            maxWidth: "600px"
          }}>
            {notificationMessage.text}
          </div>
        )}

        {/* Delete Account */}
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "30px",
          padding: "0 20px",
          textAlign: "left",
        }}>
          <h3 style={{ fontSize: "1.8rem", fontWeight: "bold", color: textColor, marginBottom: "10px" }}>Delete Account</h3>
          <div style={{
            background: theme === 'dark' ? "#1F2830" : "#F0F5F0",
            padding: "25px",
            borderRadius: "15px",
            border: `1px solid ${cardBorderColor}`,
            textAlign: "left",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}>
            <p style={{ fontSize: "1rem", color: mutedTextColor, marginBottom: "20px" }}>
              Permanently delete your Pluse CRM account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                padding: "12px 25px",
                fontSize: "1rem",
                fontWeight: "bold",
                background: "#DC3545", // Red for danger
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.3s ease, transform 0.2s ease",
                boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)",
                "&:hover": {
                  background: "#C82333",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Delete My Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer (consistent with Home.jsx) */}
      <footer
        style={{
          padding: "40px 20px",
          textAlign: "center",
          borderTop: `1px solid ${cardBorderColor}`,
          marginTop: "60px",
          color: mutedTextColor,
          fontSize: "0.9rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          "@media (min-width: 768px)": {
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "40px 40px",
          },
        }}
      >
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          &copy; {new Date().getFullYear()} Pluse CRM. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: "20px" }}>
          {/* Removed: About Us, Support, Contact links */}
        </div>
      </footer>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          message="Are you absolutely sure you want to permanently delete your account? This action is irreversible."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          confirmText="Yes, Delete Permanently"
          cancelText="Cancel"
          accentColor="#DC3545" // Red for danger
          cardBgColor={cardBgColor}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
          cardBorderColor={cardBorderColor}
        />
      )}
    </div>
  );
}
