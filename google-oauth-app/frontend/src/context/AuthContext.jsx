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
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const navigate = useNavigate();
  const location = useLocation();
  const initialUrlParamsProcessed = useRef(false);

  // 🌓 Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  // 🔓 Logout
  const logout = useCallback(async () => {
    console.log("AuthContext: Performing logout.");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      console.log("AuthContext: Backend logout hit.");
    } catch (error) {
      console.error("AuthContext: Logout failed:", error);
    }

    setIsAuthenticated(false);
    setUser(null);
    setDashboardSummaryData(null);
    localStorage.removeItem("dashboardSummaryData");
    localStorage.removeItem("theme");
    initialUrlParamsProcessed.current = false;
    navigate("/login", { replace: true });
  }, [navigate]);

  // 🧠 Fetch user from backend
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("AuthContext: Fetching user via cookie...");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: "GET",
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();

        // 🛑 FIXED: `data.user`, not `data`
        setIsAuthenticated(true);
        setUser(data.user);
        console.log("AuthContext: User fetched:", data.user?.email);
      } else if (response.status === 401 || response.status === 403) {
        console.warn("AuthContext: Unauthorized. Logging out.");
        logout();
      } else {
        console.error("AuthContext: Unknown error:", response.status);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("AuthContext: Network error:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // 🌐 On route change
  useEffect(() => {
    console.log("AuthContext: useEffect. Location:", location.pathname);

    if (location.search && !initialUrlParamsProcessed.current) {
      const params = new URLSearchParams(location.search);
      const error = params.get("error");

      if (error) {
        console.error("AuthContext: OAuth error:", error);
        logout();
        setLoading(false);
      }

      const cleanPath = location.pathname.replace(/\/+$/, "");
      if (location.search) {
        navigate(cleanPath, { replace: true });
        initialUrlParamsProcessed.current = true;
        return;
      }

      initialUrlParamsProcessed.current = true;
    }

    const publicRoutes = ["/", "/login", "/home"];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!isAuthenticated && !isPublicRoute) {
      fetchUserData();
    } else if (isPublicRoute && !isAuthenticated) {
      setLoading(false);
      console.log("AuthContext: Public route. Skipping fetch.");
    } else {
      setLoading(false);
    }
  }, [location, isAuthenticated, logout, fetchUserData, navigate]);

  useEffect(() => {
    console.log("AuthContext State:", {
      isAuthenticated,
      user: user?.email,
      loading,
      dashboardSummaryData
    });
  }, [isAuthenticated, user, loading, dashboardSummaryData]);

  const updateDashboardSummary = useCallback((data) => {
    console.log("AuthContext: Updating dashboard summary.");
    setDashboardSummaryData(data);
    localStorage.setItem("dashboardSummaryData", JSON.stringify(data));
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    dashboardSummaryData,
    logout,
    updateDashboardSummary,
    theme,
    toggleTheme
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

