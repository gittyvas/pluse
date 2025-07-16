import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// FooterLink component with working hover effect
const FooterLink = ({ label, path }) => {
  const textColor = "var(--muted-foreground)";
  const accentColor = "#4CAF50";

  return (
    <a
      href={path}
      style={{
        textDecoration: "none",
        color: textColor,
        fontSize: "0.9rem",
        transition: "color 0.2s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = accentColor)}
      onMouseOut={(e) => (e.currentTarget.style.color = textColor)}
    >
      {label}
    </a>
  );
};

// Confirmation modal
const ConfirmationModal = ({
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  accentColor,
  cardBgColor,
  textColor,
  mutedTextColor,
  cardBorderColor,
}) => {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: cardBgColor,
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
          maxWidth: "450px",
          textAlign: "center",
          border: `1px solid ${cardBorderColor}`,
        }}
      >
        <p style={{ fontSize: "1.2rem", color: textColor, marginBottom: "20px" }}>{message}</p>
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
  const { isAuthenticated, loading, logout, theme } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [profile, setProfile] = useState(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);

  const bgColor = theme === "dark" ? "#1A222A" : "#F8FBF8";
  const textColor = theme === "dark" ? "#E0E6EB" : "#303030";
  const accentColor = "#4CAF50";
  const cardBgColor = theme === "dark" ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)";
  const cardBorderColor = theme === "dark" ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === "dark" ? "#A0A8B0" : "#606060";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !API_URL) return;

    setError(null);
    setNotificationMessage(null);

    try {
      const res = await axios.get(`${API_URL}/api/user/profile`, {
        withCredentials: true,
      });

      const data = res.data;

      setProfile(data.user);
      setEmailNotifications(data.user.emailNotifications ?? true);
      setPushNotifications(data.user.pushNotifications ?? false);

    } catch (err) {
      console.error("Failed to fetch profile:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
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

  const handleDisconnectGoogle = async () => {
    setShowDisconnectModal(false);
    setNotificationMessage(null);
    try {
      const res = await axios.post(`${API_URL}/api/profile/disconnect`, {}, { withCredentials: true });
      if (res.status === 200) {
        setNotificationMessage({ type: "success", text: "Google account disconnected. Logging out." });
        setTimeout(() => logout(), 2000);
      }
    } catch (err) {
      setNotificationMessage({ type: "error", text: "Failed to disconnect Google account." });
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    setNotificationMessage(null);
    try {
      const res = await axios.delete(`${API_URL}/api/profile/account`, { withCredentials: true });
      if (res.status === 200) {
        setNotificationMessage({ type: "success", text: "Account deleted. Logging out." });
        setTimeout(() => logout(), 2000);
      }
    } catch (err) {
      setNotificationMessage({ type: "error", text: "Failed to delete account." });
    }
  };

  const handleNotificationUpdate = async () => {
    setNotificationMessage(null);
    try {
      const res = await axios.post(`${API_URL}/api/profile/notifications`, {
        emailNotifications,
        pushNotifications,
      }, { withCredentials: true });

      if (res.status === 200) {
        setNotificationMessage({ type: "success", text: "Notification settings updated." });
      }
    } catch (err) {
      setNotificationMessage({ type: "error", text: "Failed to update notification settings." });
    }
  };

  if (loading) {
    return <div style={{ background: bgColor, color: textColor, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p>Loading authentication...</p>
    </div>;
  }

  if (!isAuthenticated) {
    return <div style={{ background: bgColor, color: textColor, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p>Access Denied. Redirecting to login...</p>
    </div>;
  }

  return (
    <div style={{ background: bgColor, color: textColor, minHeight: "100vh", padding: "32px" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: accentColor, textAlign: "center", marginBottom: "30px" }}>
        Your Profile
      </h1>

      {error && <div style={{ color: "red", marginBottom: "20px", textAlign: "center" }}>{error}</div>}
      {notificationMessage && (
        <div style={{
          margin: "0 auto 20px", padding: "10px 20px", maxWidth: "600px",
          backgroundColor: notificationMessage.type === "success" ? "#D4EDDA" : "#F8D7DA",
          color: notificationMessage.type === "success" ? "#155724" : "#721C24",
          borderRadius: "8px", border: `1px solid ${notificationMessage.type === "success" ? "#C3E6CB" : "#F5C6CB"}` }}
        >
          {notificationMessage.text}
        </div>
      )}

      {profile && (
        <div style={{
          maxWidth: "600px", margin: "0 auto", background: cardBgColor, padding: "30px", borderRadius: "15px",
          border: `1px solid ${cardBorderColor}`, boxShadow: "0 5px 20px rgba(0,0,0,0.1)" }}
        >
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            {profile.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt="Profile" style={{
                width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${accentColor}` }} />
            ) : (
              <div style={{
                width: "100px", height: "100px", borderRadius: "50%", background: accentColor,
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "2rem" }}>
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <h2 style={{ marginTop: "10px" }}>{profile.name || "Name not available"}</h2>
            <p style={{ color: mutedTextColor }}>{profile.email || "Email not available"}</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3>Notification Settings</h3>
            <label>
              <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
              &nbsp; Email Notifications
            </label>
            <br />
            <label>
              <input type="checkbox" checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />
              &nbsp; Push Notifications
            </label>
            <br />
            <button onClick={handleNotificationUpdate} style={{
              marginTop: "10px", background: accentColor, color: "#fff", padding: "10px 20px",
              border: "none", borderRadius: "6px", cursor: "pointer"
            }}>
              Update Notifications
            </button>
          </div>

          <hr />

          <div style={{ marginTop: "20px" }}>
            <h3>Google Account</h3>
            <p style={{ color: mutedTextColor }}>We only read your Google Contacts temporarily. No data is stored.</p>
            <button
