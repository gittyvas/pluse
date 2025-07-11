#!/bin/bash

# --- Configuration ---
# These paths are relative to the directory where this script is executed.
# This script assumes you run it from: /home/vax/test/google-oauth-app/frontend/src/pages/
HOME_FILE="Home.jsx"
HEADER_FILE="../components/Header.jsx"
SIDEBAR_FILE="../components/Sidebar.jsx"

# --- Emoji Signals ---
GREEN_CIRCLE="\033[0;32m🟢\033[0m"
RED_CIRCLE="\033[0;31m🔴\033[0m"
YELLOW_CIRCLE="\033[0;33m🟡\033[0m"

# --- Error Handling Function ---
handle_error() {
    echo -e "\n${RED_CIRCLE} ERROR: An error occurred during script execution. Please check the output above."
    exit 1
}

# Trap any errors and call handle_error function
trap 'handle_error' ERR

echo -e "${GREEN_CIRCLE} Starting update for specific frontend component files..."

# --- 1. Update Home.jsx ---
echo -e "${GREEN_CIRCLE} Updating ${HOME_FILE}..."
cat <<'EOF' > "$HOME_FILE"
// google-oauth-app/frontend/src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, NotebookPen, CalendarDays, Lock, Rocket } from 'lucide-react';
import { Button } from '../components/ui/button'; // Corrected: Relative path for Button

function Home() {
  const navigate = useNavigate();

  // State for typing effect
  const fullHeadline = "Stay closer to the people who matter.";
  const [displayedHeadline, setDisplayedHeadline] = useState("");
  const [charIndex, setCharIndex] = useState(0); // Track character index for typing effect
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    if (!isTypingComplete && charIndex < fullHeadline.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayedHeadline(prev => prev + fullHeadline[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 50); // Typing speed in ms

      return () => clearTimeout(typingTimeout); // Cleanup on unmount
    } else if (charIndex === fullHeadline.length && !isTypingComplete) {
      setIsTypingComplete(true);
    }
  }, [charIndex, fullHeadline, isTypingComplete]);


  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            {displayedHeadline}
            {/* Blinking cursor for typing effect */}
            {!isTypingComplete && <span className="inline-block animate-blink">|</span>}
            <br />
            <span className="text-green-600">to the people</span> who matter.
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-lg mx-auto md:mx-0">
            Organize your network, remember special moments, and never forget to follow up. Pulse CRM syncs with your Google Contacts to keep your relationships strong.
          </p>
          <Button
            onClick={() => navigate('/signup')} // Navigate to Signup page
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors duration-300 transform hover:scale-105"
          >
            Sign In / Sign Up
          </Button>
        </div>

        {/* Right Image with subtle floating animation */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <img
            src="/dashboard/dashboard.green.png" # Path to your dashboard image in public/dashboard/
            alt="Pulse Dashboard Screenshot"
            className="rounded-lg shadow-xl max-w-full h-auto animate-float"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/cccccc/333333?text=Pulse+Dashboard"; }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Features that connect you
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
              <Search className="text-green-600 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
                <p className="text-gray-700">
                  Find any contact instantly with fuzzy matching and tags.
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
              <Bell className="text-green-600 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Reminders</h3>
                <p className="text-gray-700">
                  Birthday, send follow-up, so you never lose touch.
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
              <NotebookPen className="text-green-600 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Notes & Timeline</h3>
                <p className="text-gray-700">
                  Jot down memories, last talk, next steps.
                </p>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
              <CalendarDays className="text-green-600 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar Sync</h3>
                <p className="text-gray-700">
                  See all upcoming events beside your contacts.
                </p>
              </div>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
              <Lock className="text-green-600 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-gray-700">
                  Your data lives in your account. Export on delete, anytime.
                </p>
              </div>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
              <Rocket className="text-green-600 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Setup</h3>
                <p className="text-gray-700">
                  Sign in with Google — no extensions required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
EOF

# --- 2. Update Header.jsx ---
echo -e "${GREEN_CIRCLE} Updating ${HEADER_FILE}..."
cat <<'EOF' > "$HEADER_FILE"
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
        {/* Logo - UPDATED to use img tag */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Pulse CRM Logo" className="h-8 w-8" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/32x32/cccccc/333333?text=P"; }} />
          <span className="text-xl font-bold text-gray-800">Pulse</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate('/features')}>Features</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate('/pricing')}>Pricing</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate('/faq')}>FAQ</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate('/about')}>About</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate('/privacy')}>Privacy</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate('/terms')}>Terms</a>
          {!isAuthenticated && !isAuthRoute ? (
            <button
              onClick={initiateOAuth}
              className="px-4 py-2 rounded-md text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Login
            </button>
          ) : (
            isAuthenticated && (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-md text-red-600 border border-red-300 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            )
          )}
        </div>

        {/* Mobile Menu Button (Hamburger) - Placeholder for now */}
        <div className="md:hidden">
          <button className="text-gray-600 focus:outline-none">
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
EOF

# --- 3. Update Sidebar.jsx ---
echo -e "${GREEN_CIRCLE} Updating ${SIDEBAR_FILE}..."
cat <<'EOF' > "$SIDEBAR_FILE"
// google-oauth-app/frontend/src/components/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, NotebookPen, Search, User, Settings } from 'lucide-react';

function Sidebar() {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Contacts', icon: Users, path: '/contacts' },
    { name: 'Reminders', icon: Bell, path: '/reminders' },
    { name: 'Notes', icon: NotebookPen, path: '/notes' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-gray-200 flex flex-col h-full py-6 px-4 shadow-lg">
      {/* Logo - UPDATED to use img tag */}
      <div className="flex items-center space-x-2 mb-8 px-2">
        <img src="/logo.png" alt="Pulse CRM Logo" className="h-8 w-8" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/32x32/cccccc/333333?text=P"; }} />
        <span className="text-xl font-bold text-gray-50">Pulse</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 py-2 px-3 rounded-lg transition-colors duration-200
                   ${isActive ? 'bg-green-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
EOF

echo -e "\n${GREEN_CIRCLE} Frontend component files updated successfully."
echo -e "\n--- ${YELLOW_CIRCLE} IMPORTANT NEXT STEPS ${YELLOW_CIRCLE} ---"
echo "1.  ${YELLOW_CIRCLE} Place your actual image files:"
echo "    - Your logo: Rename your logo image (e.g., 'Screenshot 2025-07-04 025124.png') to 'logo.png' and move it to:"
echo "      ${FRONTEND_ROOT_DIR}/public/logo.png"
echo "    - Your dashboard image: Rename your dashboard image (e.g., 'dashboard.green.png') to 'dashboard.green.png' and move it to:"
echo "      ${FRONTEND_ROOT_DIR}/public/dashboard/dashboard.green.png"
echo "    (If you don't have 'dashboard.green.png', the placeholder will remain.)"
echo ""
echo "2.  ${GREEN_CIRCLE} Stop your frontend development server (if running):"
echo "    Press Ctrl+C in the terminal where 'npm run dev' is active."
echo ""
echo "3.  ${GREEN_CIRCLE} Restart your frontend development server:"
echo "    cd /home/vax/test/google-oauth-app/frontend/"
echo "    npm run dev"
echo ""
echo "4.  ${GREEN_CIRCLE} Refresh your browser at http://localhost:5173/"
echo "    You should now see the correct logo, the dashboard image (if placed), and the fixed headline."
