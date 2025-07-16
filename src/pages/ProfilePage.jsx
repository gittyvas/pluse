// google-oauth-app/frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Reusable FooterLink Component (kept for consistency if used elsewhere, though not in this specific file's render)
const FooterLink = ({ label, path }) => {
  const textColor = "var(--muted-foreground)";
  const accentColor = "#4CAF50"; // Soft green accent

  return (
    <a
      href={path}
      style={{
        textDecoration: "none",
        color: textColor,
        fontSize: "0.9rem",
        transition: "color 0.2s ease",
        "&:hover": {
          color: accentColor,
        },
      }}
    >
      {label}
    </a>
  );
};

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
              background: accentColor, // Use provided accentColor for confirm button
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
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


export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, theme, toggleTheme } = useAuth(); // Include theme and toggleTheme

  // State for fetched profile data
  const [profile, setProfile] = useState(null);

  // State for notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null); // For notification feedback

  // State for modals
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State for general error messages (e.g., failed to fetch profile)
  const [error, setError] = useState(null);

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

  // Fetch user profile data from backend
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !API_URL) {
      console.warn("ProfilePage: Not authenticated or API_URL missing. Skipping profile fetch.");
      return;
    }
    setError(null); // Clear previous errors
    setNotificationMessage(null); // Clear notification messages on fetch

    try {
      const res = await axios.get(`${API_URL}/api/user/profile`, {
        withCredentials: true, // Ensures HTTP-only cookie is sent
      });
      const data = res.data;

      setProfile(data); // Assuming data is directly the profile object now
      setEmailNotifications(data.emailNotifications ?? true);
      setPushNotifications(data.pushNotifications ?? false);

    } catch (err) {
      console.error("ProfilePage: Failed to fetch profile:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.error("ProfilePage: API: Session expired or invalid. Logging out.");
        logout();
      } else {
        setError("Failed to load profile. Please try again.");
      }
    }
  }, [isAuthenticated, API_URL, logout]);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      fetchProfile();
    }
  }, [isAuthenticated, loading, fetchProfile]);


  // Handle Disconnect Google Account
  const handleDisconnectGoogle = async () => {
    setShowDisconnectModal(false); // Close modal
    setNotificationMessage(null); // Clear any previous notification messages

    try {
      const res = await axios.post(`${API_URL}/api/user/disconnect`, {}, { // Corrected endpoint to /api/user/disconnect
        withCredentials: true,
      });
      if (res.status === 200) {
        setNotificationMessage({ type: 'success', text: "Google account disconnected. Logging out for full effect." });
        setTimeout(() => logout(), 2000); // Log out after a short delay
      } else {
        setNotificationMessage({ type: 'error', text: res.data.error || "Failed to disconnect Google account." });
      }
    } catch (err) {
      console.error("Network error while disconnecting:", err);
      setNotificationMessage({ type: 'error', text: err.response?.data?.error || "Network error while disconnecting." });
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    setShowDeleteModal(false); // Close modal
    setNotificationMessage(null); // Clear any previous notification messages

    try {
      const res = await axios.delete(`${API_URL}/api/user/account`, { // Corrected endpoint to /api/user/account
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
      setNotificationMessage({ type: 'error', text: err.response?.data?.error || "Failed to delete account." });
    }
  };

  // Handle Notification Update
  const handleNotificationUpdate = async () => {
    setNotificationMessage(null); // Clear previous messages
    try {
      const res = await axios.post(`${API_URL}/api/user/notifications`, { // Corrected endpoint to /api/user/notifications
        emailNotifications,
        pushNotifications,
      }, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setNotificationMessage({ type: 'success', text: "Notification settings updated." });
      } else {
        setNotificationMessage({ type: 'error', text: res.data.error || "Failed to update notification settings." });
      }
    } catch (err) {
      console.error("Error updating notifications:", err);
      setNotificationMessage({ type: 'error', text: err.response?.data?.error || "Failed to update notification settings." });
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
      {/* Top Navigation Bar (consistent with Home.jsx) */}
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
            alt="Pulse CRM Logo"
            style={{ width: "36px", height: "36px", borderRadius: "50%" }}
          />
          <span style={{ fontWeight: "700", fontSize: "24px", color: textColor, letterSpacing: "-0.8px" }}>
            Pulse
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

      {/* Profile Content Section */}
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
        <h2 style={{ fontSize: "2.8rem", fontWeight: "bold", color: accentColor }}>Your Profile</h2>

        {error && (
          <div style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#F8D7DA",
            color: "#721C24",
            border: `1px solid #F5C6CB`,
            marginBottom: "15px",
            fontSize: "0.9rem",
            textAlign: "center",
            width: "100%",
            maxWidth: "600px"
          }}>
            {error}
          </div>
        )}
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

        {/* User Identification & Basic Info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", width: "100%" }}>
          {profile?.profile_picture_url ? (
            <img
              src={profile.profile_picture_url}
              alt={`${profile.name}'s profile`}
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `5px solid ${accentColor}`,
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              }}
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/140x140/4CAF50/FFFFFF?text=👤"; }}
            />
          ) : (
            <div style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "70px", // Larger font for initial
              color: "#fff",
              border: `5px solid ${accentColor}`,
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            }}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <p style={{ fontSize: "1rem", color: mutedTextColor, marginBottom: "-5px" }}>Logged in as:</p>
          <h3 style={{ fontSize: "2.2rem", fontWeight: "bold", color: textColor }}>
            {profile?.name || "Loading Name..."}
          </h3>
          <p style={{ fontSize: "1.2rem", color: mutedTextColor, marginTop: "5px" }}>
            {profile?.email || "Loading Email..."}
          </p>
          <p style={{ fontSize: "0.9rem", color: mutedTextColor, maxWidth: "600px", lineHeight: "1.5", marginTop: "15px" }}>
            This is your Pulse CRM profile. Here you can manage your account settings and preferences.
          </p>
        </div>

        {/* Notification Preferences */}
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "30px",
          padding: "0 20px",
          textAlign: "left",
        }}>
          <h3 style={{ fontSize: "1.8rem", fontWeight: "bold", color: accentColor, marginBottom: "10px" }}>Notification Preferences</h3>
          <div style={{
            background: theme === 'dark' ? "#1F2830" : "#F0F5F0",
            padding: "25px",
            borderRadius: "15px",
            border: `1px solid ${cardBorderColor}`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="emailNotifications"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                style={{ transform: "scale(1.2)" }}
              />
              <label htmlFor="emailNotifications" style={{ fontSize: "1rem", color: textColor }}>Email Notifications</label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="pushNotifications"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                style={{ transform: "scale(1.2)" }}
              />
              <label htmlFor="pushNotifications" style={{ fontSize: "1rem", color: textColor }}>Push Notifications</label>
            </div>
            <button
              onClick={handleNotificationUpdate}
              style={{
                padding: "10px 20px",
                fontSize: "0.9rem",
                fontWeight: "bold",
                background: accentColor,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.3s ease",
                marginTop: "15px",
                "&:hover": { background: "#43A047" },
              }}
            >
              Update Notifications
            </button>
          </div>
        </div>

        {/* Session Management (Placeholder for now) */}
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "30px",
          padding: "0 20px",
          textAlign: "left",
        }}>
          <h3 style={{ fontSize: "1.8rem", fontWeight: "bold", color: accentColor, marginBottom: "10px" }}>Active Sessions</h3>
          <div style={{
            background: theme === 'dark' ? "#1F2830" : "#F0F5F0",
            padding: "25px",
            borderRadius: "15px",
            border: `1px solid ${cardBorderColor}`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            <p style={{ fontSize: "1rem", color: mutedTextColor, textAlign: "center" }}>
              Session management is not yet implemented in this version.
            </p>
          </div>
        </div>

        {/* Google Account Connection & Delete Account */}
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "30px",
          padding: "0 20px",
        }}>
          <h3 style={{ fontSize: "1.8rem", fontWeight: "bold", color: accentColor, marginBottom: "10px" }}>Account Integrations & Data</h3>

          {/* Google Account Connection */}
          <div style={{
            background: theme === 'dark' ? "#1F2830" : "#F0F5F0",
            padding: "25px",
            borderRadius: "15px",
            border: `1px solid ${cardBorderColor}`,
            textAlign: "left",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}>
            <h4 style={{ fontSize: "1.4rem", fontWeight: "bold", color: textColor, marginBottom: "10px" }}>Google Account Connection</h4>
            <p style={{ fontSize: "1rem", color: mutedTextColor, marginBottom: "20px" }}>
              Pulse CRM accesses your Google Contacts to display them in real-time. We **do not store** your Google Contacts data on our servers.
              Your privacy is paramount.
            </p>
            <button
              onClick={() => setShowDisconnectModal(true)}
              style={{
                padding: "12px 25px",
                fontSize: "1rem",
                fontWeight: "bold",
                background: "#FF6347", // Tomato red for disconnect
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.3s ease, transform 0.2s ease",
                boxShadow: "0 4px 12px rgba(255, 99, 71, 0.3)",
                "&:hover": {
                  background: "#E5533D",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Disconnect Google Account
            </button>
          </div>

          {/* Delete Account */}
          <div style={{
            background: theme === 'dark' ? "#1F2830" : "#F0F5F0",
            padding: "25px",
            borderRadius: "15px",
            border: `1px solid ${cardBorderColor}`,
            textAlign: "left",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}>
            <h4 style={{ fontSize: "1.4rem", fontWeight: "bold", color: textColor, marginBottom: "10px" }}>Delete Account</h4>
            <p style={{ fontSize: "1rem", color: mutedTextColor, marginBottom: "20px" }}>
              Permanently delete your Pulse CRM account and all associated data. This action cannot be undone.
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

        {/* Privacy & Terms Links */}
        <div style={{ marginTop: "40px", display: "flex", gap: "25px", flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="/privacy.html"
            style={{
              color: accentColor,
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "color 0.2s ease",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms.html"
            style={{
              color: accentColor,
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "color 0.2s ease",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Terms of Service
          </a>
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
          &copy; {new Date().getFullYear()} Pulse CRM. All rights reserved.
        </p>
        {/* Removed: About Us, Support, Contact links as requested */}
        <div style={{ display: "flex", gap: "20px" }}>
          {/* <FooterLink label="About Us" path="/about" /> */}
          {/* <FooterLink label="Support" path="/support" /> */}
          {/* <FooterLink label="Contact" path="/contact" /> */}
        </div>
      </footer>

      {/* Disconnect Google Modal */}
      {showDisconnectModal && (
        <ConfirmationModal
          message="Are you sure you want to disconnect your Google account? This will prevent Pulse CRM from accessing your Google Contacts."
          onConfirm={handleDisconnectGoogle}
          onCancel={() => setShowDisconnectModal(false)}
          confirmText="Yes, Disconnect"
          cancelText="Cancel"
          accentColor="#FF6347" // Tomato red for disconnect
          cardBgColor={cardBgColor}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
          cardBorderColor={cardBorderColor}
        />
      )}

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
