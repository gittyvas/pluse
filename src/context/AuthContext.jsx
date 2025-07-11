// google-oauth-app/frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardSummaryData, setDashboardSummaryData] = useState(null);
  // Add theme state, initialized from localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const navigate = useNavigate();
  const location = useLocation();
  // Ref to ensure initial URL param processing happens only once per app load
  const initialUrlParamsProcessed = useRef(false);

  // Effect to apply theme class and persist to localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Function to toggle theme
  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  const logout = useCallback(() => {
    console.log("AuthContext: Performing logout.");
    setIsAuthenticated(false);
    setUser(null);
    setDashboardSummaryData(null);
    localStorage.removeItem("userToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("dashboardSummaryData");
    localStorage.removeItem("theme"); // Also remove theme on logout for a clean slate
    initialUrlParamsProcessed.current = false; // Reset for next login
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    console.log("AuthContext: useEffect triggered. Location:", location.pathname, "Search:", location.search);
    console.log("AuthContext: initialUrlParamsProcessed.current =", initialUrlParamsProcessed.current);

    const processAuthFlow = async () => {
      let currentToken = null;
      let currentUserData = null;
      let cachedDashboardData = null;

      // --- Phase 1: Process URL parameters for fresh login/signup ---
      // This block runs ONLY if URL has search params AND they haven't been processed yet
      if (location.search && !initialUrlParamsProcessed.current) {
        const params = new URLSearchParams(location.search);
        const urlToken = params.get("token");
        const urlEmail = params.get("email");
        const urlName = params.get("name");
        const urlPicture = params.get("picture");
        const urlError = params.get("error");

        if (urlError) {
          console.error("AuthContext: Google OAuth Error from URL:", urlError);
          logout();
          setLoading(false);
          initialUrlParamsProcessed.current = true; // Mark as processed
          return; // Exit, as we're logging out
        }

        if (urlToken && urlEmail && urlName) {
          console.log("AuthContext: Found user data in URL params (fresh login). Storing in localStorage.");
          currentToken = urlToken;
          currentUserData = { email: urlEmail, name: urlName, token: currentToken, picture: urlPicture };
          localStorage.setItem("userToken", currentToken);
          localStorage.setItem("authUser", JSON.stringify(currentUserData));
          initialUrlParamsProcessed.current = true; // Mark as processed

          // Clean the URL parameters. This navigate will trigger another useEffect run.
          // The next run will then proceed to Phase 2 (read from localStorage).
          const cleanPath = location.pathname.replace(/\/+$/, ""); // Remove trailing slashes
          console.log("AuthContext: Cleaning URL to", cleanPath);
          navigate(cleanPath, { replace: true });
          setLoading(true); // Keep loading true until localStorage is read in next cycle
          return; // Exit this useEffect run; the next one will handle the state update from localStorage
        }
      }

      // --- Phase 2: Read from localStorage (either after URL cleanup or on subsequent renders) ---
      // This runs if no URL params were processed, or if they were just processed and URL was cleaned.
      console.log("AuthContext: Attempting to read from localStorage for persistent session.");
      const storedToken = localStorage.getItem("userToken");
      const storedUser = localStorage.getItem("authUser");
      const storedDashboardData = localStorage.getItem("dashboardSummaryData");

      console.log("AuthContext: localStorage - userToken:", storedToken ? "Exists" : "Null", "authUser:", storedUser ? "Exists" : "Null");

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const decodedToken = jwtDecode(storedToken);

          if (decodedToken.exp * 1000 < Date.now()) {
            console.warn("AuthContext: Stored token expired. Logging out.");
            logout();
          } else {
            currentToken = storedToken;
            currentUserData = { ...parsedUser, token: storedToken };
            console.log("AuthContext: Valid session found in localStorage. User:", currentUserData.email);
            if (storedDashboardData) {
              cachedDashboardData = JSON.parse(storedDashboardData);
              console.log("AuthContext: Found cached dashboard data in localStorage.");
            }
          }
        } catch (e) {
          console.error("AuthContext: Failed to parse stored user data or decode token:", e);
          logout();
        }
      } else {
        console.log("AuthContext: No valid session found in localStorage.");
      }

      // --- Final state update ---
      if (currentToken && currentUserData) {
        setIsAuthenticated(true);
        setUser(currentUserData);
        setDashboardSummaryData(cachedDashboardData);
        console.log("AuthContext: Final state -> Authenticated. User:", currentUserData.email);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setDashboardSummaryData(null);
        console.log("AuthContext: Final state -> Not authenticated.");
      }
      setLoading(false); // Auth check complete
    };

    // Execute the authentication flow
    processAuthFlow();

  }, [location.search, location.pathname, navigate, logout]); // Dependencies for useEffect

  // This effect logs current state for debugging after any state update
  useEffect(() => {
    console.log("AuthContext Current State: isAuthenticated =", isAuthenticated, "user =", user?.email, "loading =", loading, "dashboardSummaryData =", dashboardSummaryData);
  }, [isAuthenticated, user, loading, dashboardSummaryData]);

  const login = (userData, token) => {
    console.log("AuthContext: Manual login called for user:", userData.email);
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("userToken", token);
    localStorage.setItem("authUser", JSON.stringify(userData));
    // Dashboard data will be fetched by Dashboard component
  };

  const updateDashboardSummary = useCallback((data) => {
    console.log("AuthContext: Updating dashboard summary data:", data);
    setDashboardSummaryData(data);
    localStorage.setItem("dashboardSummaryData", JSON.stringify(data));
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    dashboardSummaryData,
    login,
    logout,
    updateDashboardSummary,
    theme, // Added theme to context value
    toggleTheme, // Added toggleTheme to context value
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
