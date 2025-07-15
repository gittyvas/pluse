import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/profile`, {
          withCredentials: true,
        });
        const data = res.data;
        setName(data.name);
        setEmail(data.email);
        setProfilePictureUrl(data.profile_picture_url);
        setEmailNotifications(data.emailNotifications);
        setPushNotifications(data.pushNotifications);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile.");
      }
    };

    fetchProfile();
  }, [API_URL]);

  const handleDisconnectGoogle = async () => {
    try {
      await axios.post(`${API_URL}/api/profile/disconnect`, {}, {
        withCredentials: true,
      });
      alert("Google account disconnected.");
    } catch (err) {
      console.error("Network error while disconnecting:", err);
      setError("Failed to disconnect Google account.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account?")) return;

    try {
      await axios.delete(`${API_URL}/api/profile/account`, {
        withCredentials: true,
      });
      alert("Account deleted.");
      logout(); // Redirect to login
    } catch (err) {
      console.error("Network error while deleting account:", err);
      setError("Failed to delete account.");
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      await axios.post(`${API_URL}/api/profile/notifications`, {
        emailNotifications,
        pushNotifications,
      }, {
        withCredentials: true,
      });
      alert("Notification settings updated.");
    } catch (err) {
      console.error("Error updating notifications:", err);
      setError("Failed to update notification settings.");
    }
  };

  return (
    <div style={{ background: "#181C1F", color: "white", minHeight: "100vh", padding: "40px" }}>
      <h1 style={{ fontSize: "2.5rem", color: "#25D366" }}>Your Profile</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "20px", background: "#3a1f1f", padding: "10px", borderRadius: "8px" }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: "30px", display: "flex", gap: "30px", alignItems: "center" }}>
        <img
          src={profilePictureUrl || "/default-avatar.png"}
          alt="Profile"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: "3px solid #25D366",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-avatar.png";
          }}
        />
        <div>
          <h2 style={{ margin: 0 }}>{name}</h2>
          <p style={{ margin: 0 }}>{email}</p>
        </div>
      </div>

      {/* Notification Toggles */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ color: "#25D366" }}>Notifications</h3>
        <label style={{ display: "block", marginBottom: "10px" }}>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
          />{" "}
          Email Notifications
        </label>
        <label style={{ display: "block", marginBottom: "10px" }}>
          <input
            type="checkbox"
            checked={pushNotifications}
            onChange={() => setPushNotifications(!pushNotifications)}
          />{" "}
          Push Notifications
        </label>
        <button
          onClick={handleNotificationUpdate}
          style={{
            background: "#007BFF",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          Save Preferences
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ marginTop: "50px", borderTop: "1px solid #444", paddingTop: "30px" }}>
        <h3 style={{ color: "#FF4D4F" }}>Danger Zone</h3>
        <button
          onClick={handleDisconnectGoogle}
          style={{
            background: "#FF9900",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            marginRight: "20px",
            cursor: "pointer",
          }}
        >
          Disconnect Google
        </button>
        <button
          onClick={handleDeleteAccount}
          style={{
            background: "#FF4D4F",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
