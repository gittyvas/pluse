// google-oauth-app/frontend/src/components/Header.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initiateOAuth } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isAuthRoute = location.pathname.startsWith('/dashboard') ||
                      location.pathname.startsWith('/contacts') ||
                      location.pathname.startsWith('/notes') ||
                      location.pathname.startsWith('/profile') ||
                      location.pathname.startsWith('/reminders') ||
                      location.pathname.startsWith('/search') ||
                      location.pathname.startsWith('/settings');

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 md:px-12">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Logo - Expects public/logo.png */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <img
            src="/logo.png"
            alt="Pulse CRM Logo"
            className="h-8 w-8"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/32x32/cccccc/333333?text=P"; }}
          />
          <span className="text-xl font-bold text-gray-800">Pulse CRM</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Links to static HTML pages */}
          <a href="/privacy.html" className="text-gray-600 hover:text-gray-900 font-medium">Privacy Policy</a>
          <a href="/terms.html" className="text-gray-600 hover:text-gray-900 font-medium">Terms of Service</a>
          <a href="/affiliate.html" className="text-gray-600 hover:text-gray-900 font-medium">Affiliate Program</a>
          
          {!isAuthenticated && !isAuthRoute ? (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-md bg-emerald-500 text-white border border-emerald-500 hover:bg-emerald-600 transition-colors transform hover:scale-105 active:scale-95" // Corrected: Removed # comment
            >
              Login
            </button>
          ) : (
            isAuthenticated && (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-md text-red-600 border border-red-300 hover:bg-red-50 transition-colors transform hover:scale-105 active:scale-95" // Corrected: Removed # comment
              >
                Logout
              </button>
            )
          )}
        </div>

        {/* Mobile Menu Button (Hamburger) - Placeholder for now */}
        <div className="md:hidden">
          <button className="text-gray-600 focus:outline-none transform active:scale-95 transition-transform"> {/* Corrected: Removed # comment */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
