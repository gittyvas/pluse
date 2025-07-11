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
