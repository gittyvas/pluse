import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MailPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, theme } = useAuth();

  const bgColor = theme === "dark" ? "#1A222A" : "#F8FBF8";
  const textColor = theme === "dark" ? "#E0E6EB" : "#303030";
  const accentColor = "#4CAF50";
  const cardBgColor =
    theme === "dark"
      ? "linear-gradient(145deg, #2A343D, #1F2830)"
      : "linear-gradient(145deg, #FFFFFF, #F0F5F0)";
  const cardBorderColor = theme === "dark" ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === "dark" ? "#A0A8B0" : "#606060";

  const [emails, setEmails] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shouldLoadEmails, setShouldLoadEmails] = useState(false);
  const [emailsLoadedSuccessfully, setEmailsLoadedSuccessfully] = useState(false);

  const BACKEND_API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchEmails = useCallback(async () => {
    if (!isAuthenticated || loading) {
      console.log("MailPage: Not authenticated or auth still loading.");
      setDataLoading(false);
      return;
    }

    setError(null);
    setDataLoading(true);
    try {
      console.log("MailPage: Fetching emails from backend.");
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/emails`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error("MailPage: Session expired or invalid. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch emails: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("MailPage: Fetched emails data:", data);

      // Adjust processing based on your backend response structure
      const processedEmails = data.map((email, index) => ({
        id: email.id || index,
        subject: email.subject || "(No Subject)",
        from: email.from || "Unknown Sender",
        snippet: email.snippet || "",
        date: email.date || "",
      }));

      setEmails(processedEmails);
      setEmailsLoadedSuccessfully(true);
      console.log(`MailPage: Displaying ${processedEmails.length} emails.`);
    } catch (err) {
      console.error("MailPage: Error fetching emails:", err);
      setError("Failed to load emails. Error: " + err.message);
      setEmailsLoadedSuccessfully(false);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, loading, logout, BACKEND_API_BASE_URL]);

  const handleLoadEmails = () => {
    setShouldLoadEmails(true);
    setError(null);
    fetchEmails();
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
        Your Emails
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
          (e.currentTarget.style.background =
            theme === "dark" ? "#555" : "#CCC")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.background = mutedTextColor)
        }
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

      {!shouldLoadEmails && (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <button
            onClick={handleLoadEmails}
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
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "#357ae8")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "#4285F4")
            }
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google Logo"
              style={{ width: "24px", height: "24px" }}
            />
            Load Emails
          </button>
          <p style={{ marginTop: "15px", color: mutedTextColor }}>
            Tap the button above to load your emails.
          </p>
        </div>
      )}

      {shouldLoadEmails &&
        !dataLoading &&
        emailsLoadedSuccessfully &&
        emails.length > 0 && (
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
            <p
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span role="img" aria-label="Mail" style={{ fontSize: "1.3em" }}>
                📧
              </span>
              Emails Loaded Successfully
            </p>
          </div>
        )}

      {shouldLoadEmails ? (
        dataLoading ? (
          <p
            style={{
              fontSize: "1.2rem",
              color: mutedTextColor,
              textAlign: "center",
            }}
          >
            Loading emails...
          </p>
        ) : emails.length === 0 && emailsLoadedSuccessfully ? (
          <p
            style={{
              fontSize: "1.2rem",
              color: mutedTextColor,
              textAlign: "center",
            }}
          >
            No emails found.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {emails.map((email) => (
              <div
                key={email.id}
                style={{
                  border: `1px solid ${cardBorderColor}`,
                  borderRadius: "8px",
                  padding: "20px",
                  background: cardBgColor,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <h3 style={{ margin: 0, color: textColor }}>{email.subject}</h3>
                <p style={{ margin: 0, fontSize: "14px", color: mutedTextColor }}>
                  From: {email.from}
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: mutedTextColor }}>
                  {email.snippet}
                </p>
                {email.date && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: mutedTextColor,
                    }}
                  >
                    {new Date(email.date).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <p style={{ fontSize: "1.2rem", color: mutedTextColor }}>
            Tap "Load Emails" to fetch your emails.
          </p>
        </div>
      )}
    </div>
  );
}
