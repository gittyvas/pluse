// frontend/src/context/AuthContext.jsx

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
  const [user, setUser] = useState(null); // Stores user data (name, email, etc.)
  const [loading, setLoading] = useState(true); // Initial loading state for authentication check
  const [dashboardSummaryData, setDashboardSummaryData] = useState(null); // For caching dashboard data
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark"); // Initialize theme from localStorage

  const navigate = useNavigate();
  const location = useLocation();
  const initialUrlParamsProcessed = useRef(false); // To prevent re-processing URL params on re-renders

  const API_URL = import.meta.env.VITE_API_URL;

  // 🌓 Theme Management
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Function to update dashboard summary data
  const updateDashboardSummary = useCallback((data) => {
    setDashboardSummaryData(prevData => ({ ...prevData, ...data }));
  }, []);

  // 🔓 Logout Function
  const logout = useCallback(async () => {
    console.log("AuthContext: Performing logout.");
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      console.log("AuthContext: Backend logout endpoint hit successfully.");
    } catch (error) {
      console.error("AuthContext: Error during backend logout:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setDashboardSummaryData(null);
      localStorage.clear(); // Clear all local storage on logout
      initialUrlParamsProcessed.current = false;
      navigate("/login", { replace: true });
    }
  }, [API_URL, navigate]);

  // 🧠 Fetch user data from backend via cookie (main authentication check)
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("AuthContext: Attempting to fetch user data from backend via cookie...");
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        // FIX: Ensure user object always has a 'name' property, falling back to email
        setUser({
          ...data,
          name: data.name || data.email || 'User' // Prioritize name, then email, then 'User'
        });
        console.log("AuthContext: User authenticated and data fetched. Name:", data.name || data.email);
      } else if (response.status === 401 || response.status === 403) {
        console.warn("AuthContext: Backend reported unauthorized/forbidden. Logging out.");
        logout();
      } else {
        console.error("AuthContext: Unknown error fetching user profile:", response.status, await response.text());
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("AuthContext: Network error during user data fetch:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_URL, logout]);

  // 🌐 Main Authentication Effect (runs on route changes and initial load)
  useEffect(() => {
    const publicRoutes = ["/", "/login", "/home", "/auth/google/callback"];
    const currentPath = location.pathname;
    const isPublicRoute = publicRoutes.includes(currentPath);

    console.log(`AuthContext: useEffect triggered. Location: ${currentPath} Search: ${location.search}`);

    if (currentPath === '/auth/google/callback' && location.search && !initialUrlParamsProcessed.current) {
        const params = new URLSearchParams(location.search);
        const errorParam = params.get("error");

        if (errorParam) {
            console.error("AuthContext: OAuth error received in callback:", errorParam);
            navigate('/login?error=' + encodeURIComponent(errorParam), { replace: true });
        } else {
            console.log("AuthContext: Processing Google OAuth callback. Triggering fetchUserData.");
            initialUrlParamsProcessed.current = true;
            fetchUserData();
            navigate('/dashboard', { replace: true });
        }
        return;
    }

    if (isAuthenticated && user) {
        console.log("AuthContext: Already authenticated and user data present. No action needed.");
        setLoading(false);
        return;
    }

    if (!isAuthenticated && !isPublicRoute) {
        console.log("AuthContext: Not authenticated and on protected route. Initiating auth check.");
        fetchUserData();
    } else if (isPublicRoute && !isAuthenticated) {
        console.log("AuthContext: On public route and not authenticated. Setting loading to false.");
        setLoading(false);
    }

  }, [location.pathname, location.search, isAuthenticated, user, navigate, fetchUserData, logout]);

  useEffect(() => {
    console.log("AuthContext Current State: isAuthenticated =", isAuthenticated, "user =", user?.name, "loading =", loading, "dashboardSummaryData =", dashboardSummaryData);
  }, [isAuthenticated, user, loading, dashboardSummaryData]);

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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
