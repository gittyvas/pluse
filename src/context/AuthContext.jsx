// google-oauth-app/frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// jwtDecode is no longer strictly needed for client-side token parsing if using httpOnly cookies,
// but kept for now in case you use it for other purposes or a different token strategy.
// import { jwtDecode } from "jwt-decode"; // Keep if you still decode other tokens

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

  // Function to fetch user data from backend (after successful login via httpOnly cookie)
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting to fetch user data from backend via cookie...');

      // Make a request to a protected backend endpoint.
      // The browser will automatically send the httpOnly cookie with this request.
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: 'GET',
        credentials: 'include', // IMPORTANT: Ensures cookies are sent with cross-origin requests
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user); // Assuming your backend returns user data under a 'user' key
        setDashboardSummaryData(data.dashboardSummary); // Assuming dashboard data is also returned
        console.log('AuthContext: User data fetched successfully from backend. User:', data.user?.email);
      } else if (response.status === 401 || response.status === 403) {
        // If backend says Unauthorized/Forbidden (e.g., token expired/invalid), log out
        console.warn('AuthContext: Backend reported unauthorized/forbidden. Logging out.');
        logout(); // Perform a full logout to clear any frontend state
      } else {
        console.error('AuthContext: Failed to fetch user data from backend, status:', response.status);
        // Fallback to not authenticated if other errors occur
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
  }, [logout]); // logout is a dependency because it's called inside fetchUserData

  // Updated logout function to communicate with backend to clear httpOnly cookie
  const logout = useCallback(async () => {
    console.log("AuthContext: Performing logout.");
    try {
      // Send a request to backend to clear the httpOnly cookie
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Ensure cookie is sent so backend can clear it
      });
      console.log('AuthContext: Backend logout endpoint hit successfully.');
    } catch (error) {
      console.error('AuthContext: Error calling backend logout:', error);
      // Continue with client-side logout even if backend call fails
    }

    setIsAuthenticated(false);
    setUser(null);
    setDashboardSummaryData(null);
    // Remove any remaining localStorage items (dashboard data, theme)
    localStorage.removeItem("dashboardSummaryData");
    localStorage.removeItem("theme");
    // userToken and authUser are no longer stored in localStorage for JWT
    initialUrlParamsProcessed.current = false; // Reset for next login
    navigate("/login", { replace: true });
  }, [navigate]);


  useEffect(() => {
    console.log("AuthContext: useEffect triggered. Location:", location.pathname, "Search:", location.search);
    console.log("AuthContext: initialUrlParamsProcessed.current =", initialUrlParamsProcessed.current);

    // This block handles initial URL processing (e.g., error messages from backend)
    // and cleans up the URL. It does NOT process the JWT from the URL anymore.
    if (location.search && !initialUrlParamsProcessed.current) {
      const params = new URLSearchParams(location.search);
      const urlError = params.get("error");

      if (urlError) {
        console.error("AuthContext: OAuth error from URL:", urlError);
        // You might want to display this error to the user
        // For now, just log out and navigate to login
        logout();
        setLoading(false);
      }

      // Clean the URL parameters (e.g., ?error=)
      // This navigate will trigger another useEffect run, which is fine.
      const cleanPath = location.pathname.replace(/\/+$/, ""); // Remove trailing slashes
      if (location.search) { // Only navigate if there were search params to clean
        console.log("AuthContext: Cleaning URL to", cleanPath);
        navigate(cleanPath, { replace: true });
        // Set loading to true to ensure fetchUserData runs after URL is clean
        setLoading(true);
        initialUrlParamsProcessed.current = true; // Mark as processed
        return; // Exit this useEffect run; the next one will handle the state update
      }
      initialUrlParamsProcessed.current = true; // Mark as processed even if no search params to clean
    }

    // --- Core Authentication Logic ---
    // This runs on initial load, after URL cleanup, or any time isAuthenticated state changes
    // It always attempts to verify authentication by fetching user data from the backend.
    if (!isAuthenticated) {
      console.log("AuthContext: User is not authenticated. Attempting to fetch user data.");
      fetchUserData();
    } else {
      // If already authenticated and not loading, ensure loading is false
      setLoading(false);
      console.log("AuthContext: User already authenticated. Skipping fetchUserData on this cycle.");
    }

  }, [location.search, location.pathname, navigate, logout, isAuthenticated, fetchUserData]); // Dependencies for useEffect

  // This effect logs current state for debugging after any state update
  useEffect(() => {
    console.log("AuthContext Current State: isAuthenticated =", isAuthenticated, "user =", user?.email, "loading =", loading, "dashboardSummaryData =", dashboardSummaryData);
  }, [isAuthenticated, user, loading, dashboardSummaryData]);

  // The 'login' function is no longer needed for direct JWT/user data passing from URL/localStorage.
  // The authentication flow is now managed by the backend setting the httpOnly cookie
  // and the frontend calling fetchUserData().
  // You can remove this 'login' function if it's not used elsewhere for other login methods.
  // const login = (userData, token) => {
  //   console.log("AuthContext: Manual login called for user:", userData.email);
  //   setIsAuthenticated(true);
  //   setUser(userData);
  //   localStorage.setItem("userToken", token);
  //   localStorage.setItem("authUser", JSON.stringify(userData));
  //   // Dashboard data will be fetched by Dashboard component
  // };

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
    // login, // Removed as it's no longer part of the httpOnly cookie flow
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
