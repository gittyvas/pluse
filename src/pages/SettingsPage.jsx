// frontend/src/pages/SettingsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Reusable Confirmation Modal Component (copied from NotesPage/RemindersPage)
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
    }}>
      <div style={{
        background: cardBgColor,
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
        maxWidth: "450px",
        textAlign: "center",
        border: `1px solid ${cardBorderColor}`,
      }}>
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
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              "&:hover": { background: accentColor === "#DC3545" ? "#C82333" : "#43A047" },
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

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Define colors based on theme
  const bgColor = theme === 'dark' ? "#1A222A" : "#F8FBF8";
  const textColor = theme === 'dark' ? "#E0E6EB" : "#303030";
  const accentColor = "#4CAF50"; // Soft green accent
  const cardBgColor = theme === 'dark' ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)";
  const cardBorderColor = theme === 'dark' ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === 'dark' ? "#A0A8B0" : "#606060";

  const BACKEND_API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleDeleteAccountConfirmed = useCallback(async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowDeleteConfirmModal(false); // Close modal immediately

    try {
      console.log("SettingsPage: Attempting to delete account via backend.");
      // FIX: Corrected endpoint URL from /delete to /account
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/user/account`, {
        method: "DELETE",
        credentials: "include", // Crucial for sending HTTP-only cookies
      });

      if (response.ok) {
        setSuccessMessage("Account deleted successfully. Redirecting to login...");
        console.log("SettingsPage: Account deleted successfully.");
        // Clear all local storage related to the user and then logout
        localStorage.clear(); // Clear all local storage
        logout(); // This will also navigate to /login
      } else if (response.status === 401 || response.status === 403) {
        setErrorMessage("Authentication required to delete account. Please log in again.");
        console.error("SettingsPage: Unauthorized to delete account.");
        logout();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to delete account. Please try again.");
        console.error("SettingsPage: Backend error deleting account:", errorData);
      }
    } catch (error) {
      setErrorMessage("Network error or unexpected issue. Please try again.");
      console.error("SettingsPage: Error during account deletion:", error);
    }
  }, [BACKEND_API_BASE_URL, logout]);


  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, color: textColor }}>
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "red", color: "white" }}>
        <p>Access Denied. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ background: bgColor, color: textColor, minHeight: "100vh", padding: "32px", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "30px", color: accentColor }>Settings</h1>

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
        onMouseOver={(e) => (e.currentTarget.style.background = theme === 'dark' ? "#555" : "#CCC")}
        onMouseOut={(e) => (e.currentTarget.style.background = mutedTextColor)}
      >
        ← Back to Dashboard
      </button>

      {errorMessage && (
        <div style={{ color: "white", backgroundColor: "#DC3545", padding: "10px", borderRadius: "8px", marginBottom: "20px" }}>
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div style={{ color: "white", backgroundColor: "#28A745", padding: "10px", borderRadius: "8px", marginBottom: "20px" }}>
          {successMessage}
        </div>
      )}

      <div style={{
        background: cardBgColor,
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        margin: "30px auto",
        border: `1px solid ${cardBorderColor}`,
      }}>
        <h2 style={{ color: accentColor, marginBottom: "20px" }}>Appearance</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <span style={{ fontSize: "1.1rem", color: textColor }}>Dark Mode</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <span className="slider round"></span>
          </label>
        </div>
        {/* Add more settings here */}
        <h2 style={{ color: accentColor, marginTop: "40px", marginBottom: "20px" }}>Account Management</h2>
        <p style={{ color: mutedTextColor, marginBottom: "20px" }}>
          Here you can manage your account settings. Be careful with actions like deleting your account, as this cannot be undone.
        </p>

        <h3 style={{ color: "#DC3545", marginBottom: "10px" }}>Delete Account</h3>
        <p style={{ color: mutedTextColor, marginBottom: "20px" }}>
          Permanently delete your Pulse CRM account and all associated data. This action is irreversible.
        </p>
        <button
          onClick={() => setShowDeleteConfirmModal(true)}
          style={{
            padding: "12px 25px",
            background: "#DC3545", // Red for delete button
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.2s",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#C82333")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#DC3545")}
        >
          Delete My Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <ConfirmationModal
          message="Are you absolutely sure you want to delete your account? This will permanently remove all your data and cannot be undone."
          onConfirm={handleDeleteAccountConfirmed}
          onCancel={() => setShowDeleteConfirmModal(false)}
          confirmText="Yes, Delete My Account"
          cancelText="Cancel"
          accentColor="#DC3545" // Red for confirm button
          cardBgColor={cardBgColor}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
          cardBorderColor={cardBorderColor}
        />
      )}

      {/* Basic CSS for the toggle switch (add this to your main CSS file or a style tag) */}
      <style>
        {`
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: ${theme === 'dark' ? '#555' : '#ccc'};
          -webkit-transition: .4s;
          transition: .4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          -webkit-transition: .4s;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: ${accentColor};
        }

        input:focus + .slider {
          box-shadow: 0 0 1px ${accentColor};
        }

        input:checked + .slider:before {
          -webkit-transform: translateX(26px);
          -ms-transform: translateX(26px);
          transform: translateX(26px);
        }
        `}
      </style>
    </div>
  );
}
