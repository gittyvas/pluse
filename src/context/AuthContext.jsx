// frontend/src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";
// FIX: Corrected import syntax (this line should now be correct)
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
    // Apply 'dark' class to the root HTML element
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme); // Persist theme preference
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Function to update dashboard summary data
  const updateDashboardSummary = useCallback((data) => {
    setDashboardSummaryData(prevData => ({ ...prevData, ...data }));
    // Optionally persist dashboard summary to localStorage
    // localStorage.setItem("dashboardSummaryData", JSON.stringify(data));
  }, []);

  // 🔓 Logout Function
  const logout = useCallback(async () => {
    console.log("AuthContext: Performing logout.");
    try {
      // Hit backend logout endpoint to clear HTTP-only cookie
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include" // Crucial for sending HTTP-only cookies
      });
      console.log("AuthContext: Backend logout endpoint hit successfully.");
    } catch (error) {
      console.error("AuthContext: Error during backend logout:", error);
    } finally {
      // Clear frontend state and local storage
      setIsAuthenticated(false);
      setUser(null);
      setDashboardSummaryData(null);
      localStorage.removeItem("dashboardSummaryData"); // Clear cached dashboard data
      localStorage.removeItem("theme"); // Clear theme on logout, or keep it if preferred
      setTheme('dark'); // Reset to default theme on logout
      initialUrlParamsProcessed.current = false; // Reset for next login
      navigate("/login", { replace: true }); // Redirect to login page
    }
  }, [API_URL, navigate]);

  // 🧠 Fetch user data from backend via cookie (main authentication check)
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true); // Set loading true before fetch
      console.log("AuthContext: Attempting to fetch user data from backend via cookie...");
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "GET",
        credentials: "include", // Crucial for sending HTTP-only cookies
      });

      if (response.ok) {
        const data = await response.json(); // Backend now returns profileData directly, not wrapped in { user: ... }
        setIsAuthenticated(true);
        setUser(data); // Set user with the profile data (name, email, photoURL etc.)
        console.log("AuthContext: User authenticated and data fetched:", data?.email);
      } else if (response.status === 401 || response.status === 403) {
        console.warn("AuthContext: Backend reported unauthorized/forbidden. Logging out.");
        logout(); // Call logout to clear state and redirect
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
      setLoading(false); // Set loading false after fetch attempt
    }
  }, [API_URL, logout]);

  // 🌐 Main Authentication Effect (runs on route changes and initial load)
  useEffect(() => {
    const publicRoutes = ["/", "/login", "/home", "/auth/google/callback"]; // Define public routes

    const currentPath = location.pathname;
    const isPublicRoute = publicRoutes.includes(currentPath);

    console.log(`AuthContext: useEffect triggered. Location: ${currentPath} Search: ${location.search}`);

    // 1. Handle Google OAuth callback URL parameters (initial login redirect)
    if (currentPath === '/auth/google/callback' && location.search && !initialUrlParamsProcessed.current) {
        const params = new URLSearchParams(location.search);
        const errorParam = params.get("error"); // Check for error param

        if (errorParam) {
            console.error("AuthContext: OAuth error received in callback:", errorParam);
            navigate('/login?error=' + encodeURIComponent(errorParam), { replace: true });
        } else {
            // If no error, assume successful callback and let fetchUserData handle authentication
            console.log("AuthContext: Processing Google OAuth callback. Triggering fetchUserData.");
            initialUrlParamsProcessed.current = true; // Mark as processed
            fetchUserData(); // Fetch user data after successful callback
            navigate('/dashboard', { replace: true }); // Redirect to dashboard immediately after processing
        }
        return; // Exit useEffect after handling callback
    }

    // 2. If already authenticated, no need to fetch again or redirect
    if (isAuthenticated && user) {
        console.log("AuthContext: Already authenticated and user data present. No action needed.");
        setLoading(false); // Ensure loading is false
        return;
    }

    // 3. If not authenticated and not on a public route, attempt to fetch user data
    if (!isAuthenticated && !isPublicRoute) {
        console.log("AuthContext: Not authenticated and on protected route. Initiating auth check.");
        fetchUserData();
    } else if (isPublicRoute && !isAuthenticated) {
        // 4. On a public route and not authenticated, no action needed, just set loading false
        console.log("AuthContext: On public route and not authenticated. Setting loading to false.");
        setLoading(false);
    }
    // Any other case (e.g., isAuthenticated is true but user is null, or loading is true)
    // will be handled by the specific conditions above or the initial loading state.

  }, [location.pathname, location.search, isAuthenticated, user, navigate, fetchUserData, logout]);


  // Log current state for debugging (optional, can be removed in production)
  useEffect(() => {
    console.log("AuthContext Current State: isAuthenticated =", isAuthenticated, "user =", user?.email, "loading =", loading, "dashboardSummaryData =", dashboardSummaryData);
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
