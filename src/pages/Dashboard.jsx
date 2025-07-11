// google-oauth-app/frontend/src/pages/Dashboard.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard({
  darkMode = false,
  showDarkModeToggle = true,
}) {
  const { user, isAuthenticated, loading, logout, dashboardSummaryData, updateDashboardSummary } = useAuth();
  const navigate = useNavigate();

  const accent = "#25D366";
  const [isDark, setDark] = useState(darkMode);
  const [active, setActive] = useState(0); // Initialize active state with a default value (e.g., 0 for Dashboard)
  const [contactsCount, setContactsCount] = useState(dashboardSummaryData?.contactsCount || "...");
  const [dataLoading, setDataLoading] = useState(!dashboardSummaryData);
  const [error, setError] = useState(null);

  const BACKEND_API_BASE_URL = "http://localhost:3000";

  useEffect(() => {
    // Redirect to login if AuthContext indicates not authenticated after its own loading
    if (!loading && !isAuthenticated) {
      console.log("Dashboard: Not authenticated after AuthContext loading. Redirecting to login.");
      navigate("/login", { replace: true });
      return;
    }

    // Only fetch data if authenticated, AuthContext has finished loading, AND user.token is available
    if (isAuthenticated && user && user.token) {
      console.log("Dashboard: Authenticated, user and token available. Proceeding to fetch data.");
      const fetchDashboardData = async (isBackgroundFetch = false) => {
        if (!isBackgroundFetch) {
          setError(null);
          setDataLoading(true);
        }

        const currentJwt = user.token;
        console.log("Dashboard: Fetching contacts with JWT:", currentJwt ? "Exists" : "Missing");

        try {
          const contactsResponse = await fetch(`${BACKEND_API_BASE_URL}/api/contacts`, { // Fixed template literal
            method: "GET",
            headers: {
              "Authorization": `Bearer ${currentJwt}`, // Fixed template literal
              "Content-Type": "application/json",
            },
          });

          if (contactsResponse.status === 401 || contactsResponse.status === 403) {
            console.error("Dashboard: Contacts API: Session expired or invalid token. Logging out.");
            logout();
            return;
          }

          if (!contactsResponse.ok) {
            const errorText = await contactsResponse.text();
            throw new Error(`Failed to fetch contacts: ${contactsResponse.status} ${contactsResponse.statusText} - ${errorText}`); // Fixed template literal
          }

          const contactsData = await contactsResponse.json();
          const newContactsCount = contactsData.length;
          setContactsCount(newContactsCount);
          updateDashboardSummary({ contactsCount: newContactsCount });
          console.log("Dashboard: Fetched Contacts Count:", newContactsCount);

        } catch (contactsError) {
          console.error("Dashboard: Error fetching contacts count:", contactsError);
          setError("Failed to load contacts count. Please try again. Error: " + contactsError.message);
        } finally {
          if (!isBackgroundFetch) setDataLoading(false);
        }
      };

      if (!dashboardSummaryData) {
        console.log("Dashboard: No cached data. Performing initial fetch.");
        fetchDashboardData(false);
      } else {
        console.log("Dashboard: Using cached data. Performing background refresh.");
        setDataLoading(false); // Hide loading immediately if cached data is present
        fetchDashboardData(true);
      }
    } else if (!loading) {
        console.log("Dashboard: Not fetching data. isAuthenticated:", isAuthenticated, "user:", user, "loading:", loading);
    }
  }, [isAuthenticated, loading, user, navigate, logout, dashboardSummaryData, updateDashboardSummary]);

  const handleLogout = () => {
    logout();
  };

  const sidebarLinks = [
    { label: "Dashboard", icon: "🏠", path: "/dashboard" },
    { label: "Contacts", icon: "👥", path: "/contacts" },
    { label: "Reminders", icon: "⏰", path: "/reminders" },
    { label: "Notes", icon: "📝", path: "/notes" },
    { label: "Search", icon: "🔍", path: "/search" },
    { label: "Profile", icon: "👤", path: "/profile" },
    { label: "Settings", icon: "⚙️", path: "/settings" },
    { label: "Logout", icon: "🚪", action: handleLogout },
  ];

  const Logo = (
    <img
      src="/logo.png"
      alt="Pulse CRM Logo"
      style={{ width: 32, height: 32, borderRadius: "50%" }}
    />
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: isDark ? "#181C1F" : "#fff", color: isDark ? "#fff" : "#222" }}>
        <p>Loading application data...</p>
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
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 480,
        background: isDark ? "#181C1F" : "#fff",
        color: isDark ? "#fff" : "#222",
        display: "flex",
        fontFamily: "Inter, sans-serif",
        transition: "background 0.2s, color 0.2s",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          minWidth: 180,
          background: isDark ? "#23272A" : "#F7F7F7",
          borderRight: `1px solid ${isDark ? "#23272A" : "#EEE"}`, // Fixed template literal
          display: "flex",
          flexDirection: "column",
          padding: "32px 0 0 0",
          gap: 4,
          position: "sticky",
          left: 0,
          top: 0,
          height: "100vh",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 32px 32px 32px",
          }}
        >
          {Logo}
          <span
            style={{
              fontWeight: 700,
              fontSize: 22,
              color: accent,
              letterSpacing: -1,
            }}
          >
            Pulse
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sidebarLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.path || "#"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 32px",
                fontWeight: 500,
                fontSize: 16,
                color: active === i ? accent : isDark ? "#fff" : "#222",
                borderLeft:
                  active === i ? `4px solid ${accent}` : "4px solid transparent", // Fixed template literal
                background:
                  active === i ? "rgba(37,211,102,0.08)" : "none",
                textDecoration: "none",
                borderRadius: "0 20px 20px 0",
                transition: "background 0.15s, color 0.15s",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();
                setActive(i);
                if (link.action) {
                  link.action();
                } else if (link.path) {
                    navigate(link.path);
                }
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(37,211,102,0.12)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background =
                  active === i ? "rgba(37,211,102,0.08)" : "none")
              }
            >
              <span style={{ fontSize: 20 }}>{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <header
          style={{
            width: "100%",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            borderBottom: isDark ? "1px solid #23272A" : "1px solid #EEE",
            background: isDark ? "#181C1F" : "#fff",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 20, letterSpacing: -0.5 }}>
            Welcome,{" "}
            <span style={{ color: accent }}>
              {user?.name || "User"}
            </span>{" "}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {showDarkModeToggle && (
              <button
                aria-label="Toggle dark mode"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: accent,
                }}
                onClick={() => setDark((d) => !d)}
              >
                {isDark ? "🌙" : "☀️"}
              </button>
            )}
            <span
              style={{ fontSize: 22, color: isDark ? "#fff" : "#888" }}
              role="img"
              aria-label="Notifications"
            >
              🔔
            </span>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(37,211,102,0.10)",
              }}
            >
              {user && user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
        </header>

        {/* Summary cards */}
        <section
          style={{
            display: "flex",
            gap: 24,
            padding: "32px 32px 0 32px",
            flexWrap: "wrap",
          }}
        >
          <SummaryCard
            icon="👥"
            label="Total Contacts"
            value={dataLoading ? "..." : error ? "Error" : contactsCount}
            accent={accent}
            darkMode={isDark}
          />
          <SummaryCard
            icon="⏰"
            label="Reminders Today"
            value={0}
            accent={accent}
            darkMode={isDark}
          />
          <SummaryCard
            icon="📝"
            label="Recent Notes"
            value={0}
            accent={accent}
            darkMode={isDark}
          />
        </section>

        {/* Main content area for Dashboard details (e.g., Recent Activity, Pinned Contacts) */}
        <main style={{ flex: 1, padding: 32, minHeight: 0, overflowY: "auto" }}>
            <>
              <h2 style={{ marginBottom: "20px", color: isDark ? "#FFF" : "#222" }}>Dashboard Overview</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                <div style={{ background: isDark ? "#2A2E31" : "#FDFDFD", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 10px 0", color: isDark ? "#FFF" : "#222" }}>Recent Activity</h3>
                  <p style={{ color: isDark ? "#CCC" : "#555" }}>No recent activity yet.</p>
                </div>
                <div style={{ background: isDark ? "#2A2E31" : "#FDFDFD", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 10px 0", color: isDark ? "#FFF" : "#222" }}>Pinned Contacts</h3>
                  <p style={{ color: isDark ? "#CCC" : "#555" }}>No pinned contacts.</p>
                </div>
                <div style={{ background: isDark ? "#2A2E31" : "#FDFDFD", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 10px 0", color: isDark ? "#FFF" : "#222" }}>Quick Links</h3>
                  <p style={{ color: isDark ? "#CCC" : "#555" }}>No quick links yet.</p>
                </div>
              </div>
            </>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, accent, darkMode }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 180,
        background: darkMode ? "#23272A" : "#F7F7F7",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        alignItems: "center",
        gap: 18,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        minHeight: 80,
      }}
    >
      <span
        style={{
          fontSize: 32,
          background: accent,
          color: "#fff",
          borderRadius: 12,
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(37,211,102,0.10)",
        }}
      >
        {icon}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: 26,
            color: accent,
            letterSpacing: -1,
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontWeight: 500,
            fontSize: 15,
            color: darkMode ? "#fff" : "#222",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
