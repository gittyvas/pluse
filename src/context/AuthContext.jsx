// google-oauth-app/frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  const logout = useCallback(async () => {
    console.log("AuthContext: Performing logout.");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      console.log('AuthContext: Backend logout endpoint hit successfully.');
    } catch (error) {
      console.error('AuthContext: Error calling backend logout:', error);
    }

    setIsAuthenticated(false);
    setUser(null);
    setDashboardSummaryData(null);
    localStorage.removeItem("dashboardSummaryData");
    localStorage.removeItem("theme");
    initialUrlParamsProcessed.current = false;
    navigate("/login", { replace: true }); // Redirect to /login after explicit logout
  }, [navigate]);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting to fetch user data from backend via cookie...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
        setDashboardSummaryData(data.dashboardSummary);
        console.log('AuthContext: User data fetched successfully from backend. User:', data.user?.email);
      } else if (response.status === 401 || response.status === 403) {
        console.warn('AuthContext: Backend reported unauthorized/forbidden. Logging out.');
        logout();
      } else {
        console.error('AuthContext: Failed to fetch user data from backend, status:', response.status);
        setIsAuthenticated(false);
        setUser(null);
        setDashboardSummaryData(null);
      }
    } catch (error) {
      console.error('AuthContext: Network error fetching user data:', error);
      setIsAuthenticated(false);
      setUser(null);
      setDashboardSummaryData(null);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    console.log("AuthContext: useEffect triggered. Location:", location.pathname, "Search:", location.search);
    console.log("AuthContext: initialUrlParamsProcessed.current =", initialUrlParamsProcessed.current);

    // This block handles initial URL processing (e.g., error messages from backend)
    // and cleans up the URL.
    if (location.search && !initialUrlParamsProcessed.current) {
      const params = new URLSearchParams(location.search);
      const urlError = params.get("error");

      if (urlError) {
        console.error("AuthContext: OAuth error from URL:", urlError);
        logout();
        setLoading(false);
      }

      const cleanPath = location.pathname.replace(/\/+$/, "");
      if (location.search) {
        console.log("AuthContext: Cleaning URL to", cleanPath);
        navigate(cleanPath, { replace: true });
        setLoading(true);
        initialUrlParamsProcessed.current = true;
        return;
      }
      initialUrlParamsProcessed.current = true;
    }

    // --- IMPORTANT CHANGE HERE ---
    // Only attempt to fetch user data if not already authenticated AND
    // if the current path is NOT the public home page ('/') or the login page ('/login').
    const isPublicRoute = location.pathname === '/' || location.pathname === '/login';

    if (!isAuthenticated && !isPublicRoute) {
      console.log("AuthContext: User is not authenticated and on a protected route. Attempting to fetch user data.");
      fetchUserData();
    } else if (isPublicRoute && !isAuthenticated) {
        // If on a public route and not authenticated, just set loading to false
        // No automatic fetch, no redirect.
        setLoading(false);
        console.log("AuthContext: On public route and not authenticated. Skipping automatic fetch.");
    } else {
      setLoading(false);
      console.log("AuthContext: User already authenticated or on public route. Skipping automatic fetch on this cycle.");
    }

  }, [location.search, location.pathname, navigate, logout, isAuthenticated, fetchUserData]);

  useEffect(() => {
    console.log("AuthContext Current State: isAuthenticated =", isAuthenticated, "user =", user?.email, "loading =", loading, "dashboardSummaryData =", dashboardSummaryData);
  }, [isAuthenticated, user, loading, dashboardSummaryData]);

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
    logout,
    updateDashboardSummary,
    theme,
    toggleTheme,
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
