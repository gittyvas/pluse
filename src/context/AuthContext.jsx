import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardSummaryData, setDashboardSummaryData] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const navigate = useNavigate();
  const location = useLocation();
  const initialUrlParamsProcessed = useRef(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // 🌙 Theme Toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const updateDashboardSummary = useCallback((data) => {
    setDashboardSummaryData((prev) => ({ ...prev, ...data }));
  }, []);

  // 🔐 Logout Function
  const logout = useCallback(async () => {
    console.log("AuthContext: Logging out...");
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("AuthContext: Logout error:", err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setDashboardSummaryData(null);
      localStorage.clear();
      initialUrlParamsProcessed.current = false;
      navigate("/login", { replace: true });
    }
  }, [API_URL, navigate]);

  // ✅ Fetch User Profile
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        // Ensure proper structure and fallback
        const userProfile = {
          name: data.user?.name || data.user?.email || "User",
          email: data.user?.email || "",
          profile_picture_url: data.user?.profile_picture_url || "",
        };

        setUser(userProfile);
        setIsAuthenticated(true);
        console.log("AuthContext: Logged in as", userProfile.name);
      } else if (res.status === 401 || res.status === 403) {
        console.warn("AuthContext: Unauthorized, logging out.");
        logout();
      } else {
        console.error("AuthContext: Unknown error:", res.status, await res.text());
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error("AuthContext: Fetch error:", err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_URL, logout]);

  // 🌐 Auth Routing
  useEffect(() => {
    const publicRoutes = ["/", "/login", "/home", "/auth/google/callback"];
    const path = location.pathname;
    const isPublic = publicRoutes.includes(path);

    if (path === "/auth/google/callback" && location.search && !initialUrlParamsProcessed.current) {
      const params = new URLSearchParams(location.search);
      const error = params.get("error");
      if (error) {
        navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      } else {
        initialUrlParamsProcessed.current = true;
        fetchUserData();
        navigate("/dashboard", { replace: true });
      }
      return;
    }

    if (!isAuthenticated && !isPublic) {
      fetchUserData();
    } else if (isPublic && !isAuthenticated) {
      setLoading(false);
    }
  }, [location.pathname, location.search, isAuthenticated, user, navigate, fetchUserData]);

  // Debug log
  useEffect(() => {
    console.log("Auth State:", { isAuthenticated, user, loading });
  }, [isAuthenticated, user, loading]);

  const value = React.useMemo(() => ({
    isAuthenticated,
    user,
    loading,
    dashboardSummaryData,
    logout,
    updateDashboardSummary,
    theme,
    toggleTheme
  }), [isAuthenticated, user, loading, dashboardSummaryData, logout, updateDashboardSummary, theme, toggleTheme]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
