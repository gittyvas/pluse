// google-oauth-app/frontend/src/pages/Profile.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Reusable FooterLink Component
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


export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout, disconnectGoogleAccount, deleteAccount, theme, toggleTheme } = useAuth();

  // State for modals
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State for notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null); // For notification feedback

  // State for session management (dummy data for demonstration)
  // In a real application, you would fetch these from your backend API
  const [sessions, setSessions] = useState([
    { id: 1, device: "Current Device (Chrome on Windows)", lastActive: "Just now" },
    { id: 2, device: "Mobile (Safari on iOS)", lastActive: "2 days ago" },
    { id: 3, device: "Desktop (Firefox on Linux)", lastActive: "1 week ago" },
  ]);
  const [sessionMessage, setSessionMessage] = useState(null); // For session management feedback

  // States for disconnect and delete messages (replacing alert())
  const [disconnectMessage, setDisconnectMessage] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);


  // Define colors consistent with Home.jsx "Soft & Gradient" style
  const bgColor = theme === 'dark' ? "#1A222A" : "#F8FBF8"; // Soft dark blue-grey / very light green-tinted white
  const textColor = theme === 'dark' ? "#E0E6EB" : "#303030"; // Soft light grey / soft dark grey
  const accentColor = "#4CAF50"; // Classic, slightly muted green
  const cardBgColor = theme === 'dark' ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)"; // Subtle gradients
  const cardBorderColor = theme === 'dark' ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === 'dark' ? "#A0A8B0" : "#606060";
  const headerBgColor = theme === 'dark' ? "#1A222A" : "#FFFFFF";
  const headerBorderColor = theme === 'dark' ? "#3A454F" : "#E8EBE8";

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !currentUser) {
      navigate("/login");
    }
    // In a real app, you might fetch initial notification settings and active sessions here
    // For now, using default/dummy data for these states.
  }, [isAuthenticated, currentUser, navigate]);

  /**
   * Handles the confirmation of disconnecting the Google account.
   * Sends a POST request to the backend to revoke Google access.
   * Provides user feedback via `disconnectMessage`.
   */
  const handleDisconnectConfirm = async () => {
    setDisconnectMessage(null); // Clear previous message
    try {
      const response = await fetch("/api/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.uid, // Send user ID for backend identification
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDisconnectMessage({ type: "success", text: "Google account disconnected successfully!" });
        // Call logout from AuthContext to clear local session and redirect
        logout();
      } else {
        setDisconnectMessage({ type: "error", text: data.error || "Failed to disconnect Google account." });
      }
      setShowDisconnectModal(false); // Close the modal regardless of success/failure
    } catch (error) {
      console.error("Network error while disconnecting:", error);
      setDisconnectMessage({ type: "error", text: "Network error while disconnecting." });
      setShowDisconnectModal(false); // Close the modal on network error
    }
  };

  /**
   * Handles the confirmation of deleting the user's account.
   * Sends a DELETE request to the backend to remove all user data.
   * Provides user feedback via `deleteMessage`.
   */
  const handleDeleteConfirm = async () => {
    setDeleteMessage(null); // Clear previous message
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.uid, // Send user ID for backend identification
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDeleteMessage({ type: "success", text: "Account deleted successfully!" });
        // Call logout from AuthContext to clear local session and redirect
        logout();
      } else {
        setDeleteMessage({ type: "error", text: data.error || "Failed to delete account." });
      }
      setShowDeleteModal(false); // Close the modal regardless of success/failure
    } catch (error) {
      console.error("Network error while deleting account:", error);
      setDeleteMessage({ type: "error", text: "Network error while deleting account." });
      setShowDeleteModal(false); // Close the modal on network error
    }
  };

  /**
   * Handles updating the user's notification preferences.
   * Sends a POST request to the backend with the new settings.
   * Provides user feedback via `notificationMessage`.
   */
  const handleNotificationUpdate = async () => {
    setNotificationMessage(null); // Clear previous message
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.uid, // Sending user ID in header for backend
        },
        body: JSON.stringify({ emailNotifications, pushNotifications }),
      });

      const data = await response.json();
      if (response.ok) {
        setNotificationMessage({ type: "success", text: "Notification settings updated!" });
      } else {
        setNotificationMessage({ type: "error", text: data.error || "Failed to update settings." });
      }
    } catch (error) {
      console.error("Notification update error:", error);
      setNotificationMessage({ type: "error", text: "Network error while updating notifications." });
    }
  };

  /**
   * Handles ending a specific user session.
   * Sends a POST request to the backend to invalidate the session.
   * Provides user feedback via `sessionMessage`.
   */
  const handleEndSession = async (sessionId) => {
    setSessionMessage(null); // Clear previous message
    try {
      const response = await fetch("/api/sessions/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.uid, // Send user ID for backend identification
        },
        body: JSON.stringify({ sessionId }), // Send the ID of the session to end
      });

      const data = await response.json();
      if (response.ok) {
        // Optimistically update UI by filtering out the ended session
        setSessions(sessions.filter((s) => s.id !== sessionId));
        setSessionMessage({ type: "success", text: `Session ${sessionId} ended.` });
      } else {
        setSessionMessage({ type: "error", text: data.error || "Failed to end session." });
      }
    } catch (error) {
      console.error("End session error:", error);
      setSessionMessage({ type: "error", text: "Network error while ending session." });
    }
  };


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
          maxWidth: "900px", // Increased max width for more content
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

        {/* User Identification & Basic Info - Made more prominent */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", width: "100%" }}>
          {currentUser?.photoURL && (
            <img
              src={currentUser.photoURL}
              alt={`${currentUser.displayName}'s profile`}
              style={{
                width: "140px", // Slightly larger photo
                height: "140px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `5px solid ${accentColor}`, // Thicker border
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)", // More pronounced shadow
              }}
            />
          )}
          <p style={{ fontSize: "1rem", color: mutedTextColor, marginBottom: "-5px" }}>Logged in as:</p> {/* Explicit "Logged in as" */}
          <h3 style={{ fontSize: "2.2rem", fontWeight: "bold", color: textColor }}> {/* Larger name font */}
            {currentUser?.displayName || "User Name"}
          </h3>
          <p style={{ fontSize: "1.2rem", color: mutedTextColor, marginTop: "5px" }}> {/* Larger email font */}
            {currentUser?.email || "user@example.com"}
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
            }}>
              {notificationMessage.text}
            </div>
          )}
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

        {/* Session Management */}
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
          {sessionMessage && (
            <div style={{
              padding: "10px",
              borderRadius: "8px",
              background: sessionMessage.type === 'success' ? "#D4EDDA" : "#F8D7DA",
              color: sessionMessage.type === 'success' ? "#155724" : "#721C24",
              border: `1px solid ${sessionMessage.type === 'success' ? "#C3E6CB" : "#F5C6CB"}`,
              marginBottom: "15px",
              fontSize: "0.9rem",
              textAlign: "center",
            }}>
              {sessionMessage.text}
            </div>
          )}
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
            {sessions.length > 0 ? (
              sessions.map(session => (
                <div key={session.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px dashed ${cardBorderColor}` }}>
                  <div>
                    <p style={{ fontSize: "1rem", color: textColor, fontWeight: "500" }}>{session.device}</p>
                    <p style={{ fontSize: "0.85rem", color: mutedTextColor }}>Last Active: {session.lastActive}</p>
                  </div>
                  <button
                    onClick={() => handleEndSession(session.id)}
                    style={{
                      padding: "8px 15px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      background: "#FF6347",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "background 0.3s ease",
                      "&:hover": { background: "#E5533D" },
                    }}
                  >
                    End Session
                  </button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "1rem", color: mutedTextColor, textAlign: "center" }}>No other active sessions.</p>
            )}
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
            {disconnectMessage && (
              <div style={{
                padding: "10px",
                borderRadius: "8px",
                background: disconnectMessage.type === 'success' ? "#D4EDDA" : "#F8D7DA",
                color: disconnectMessage.type === 'success' ? "#155724" : "#721C24",
                border: `1px solid ${disconnectMessage.type === 'success' ? "#C3E6CB" : "#F5C6CB"}`,
                marginBottom: "15px",
                fontSize: "0.9rem",
                textAlign: "center",
              }}>
                {disconnectMessage.text}
              </div>
            )}
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
            {showDisconnectModal && (
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
                    Are you sure you want to disconnect your Google account? This will prevent Pulse CRM from accessing your Google Contacts.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                    <button
                      onClick={handleDisconnectConfirm}
                      style={{
                        padding: "10px 20px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        background: "#FF6347",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        "&:hover": { background: "#E5533D" },
                      }}
                    >
                      Yes, Disconnect
                    </button>
                    <button
                      onClick={() => setShowDisconnectModal(false)}
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
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            {deleteMessage && (
              <div style={{
                padding: "10px",
                borderRadius: "8px",
                background: deleteMessage.type === 'success' ? "#D4EDDA" : "#F8D7DA",
                color: deleteMessage.type === 'success' ? "#155724" : "#721C24",
                border: `1px solid ${deleteMessage.type === 'success' ? "#C3E6CB" : "#F5C6CB"}`,
                marginBottom: "15px",
                fontSize: "0.9rem",
                textAlign: "center",
              }}>
                {deleteMessage.text}
              </div>
            )}
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
            {showDeleteModal && (
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
                    Are you absolutely sure you want to delete your account? This action is irreversible.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                    <button
                      onClick={handleDeleteConfirm}
                      style={{
                        padding: "10px 20px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        background: "#DC3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        "&:hover": { background: "#C82333" },
                      }}
                    >
                      Yes, Delete Permanently
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(false)}
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
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
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
        <p>&copy; {new Date().getFullYear()} Pulse CRM. All rights reserved.</p>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          {/* Using the defined FooterLink component */}
          <FooterLink label="Privacy Policy" path="/privacy.html" />
          <FooterLink label="Terms of Service" path="/terms.html" />
          <FooterLink label="Affiliate" path="/affiliate.html" />
        </div>
      </footer>
    </div>
  );
}
