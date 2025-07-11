// frontend/src/pages/AuthLayout.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Import the new Sidebar component
import { useAuth } from '../context/AuthContext'; // NEW: Import AuthContext

function AuthLayout({ children }) {
  const location = useLocation();
  const { isAuthenticated, loadingAuth } = useAuth(); // NEW: Get auth state and loading status

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-800 text-white">
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-800"> {/* Dark background for overall layout */}
      <Sidebar /> {/* Render the Sidebar */}
      <div className="flex-grow flex flex-col">
        {/* Header for authenticated pages (optional, can be integrated into Dashboard) */}
        {/* <Header /> */}
        <main className="flex-grow p-6"> {/* Padding for main content area */}
          {children}
        </main>
        {/* You might want a different footer for authenticated areas, or none */}
      </div>
    </div>
  );
}
export default AuthLayout;
