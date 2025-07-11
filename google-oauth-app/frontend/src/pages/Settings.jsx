// google-oauth-app/frontend/src/pages/Settings.jsx

import React from 'react';

function Settings() {
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow text-gray-50 flex-grow">
      <h2 className="text-3xl font-bold mb-6">Settings</h2>
      <div className="bg-gray-700 p-6 rounded-lg shadow-md">
        <p className="text-gray-300">
          This is the settings page. You can add various application settings here,
          such as theme preferences, notification settings, or data export options.
        </p>
        <p className="text-gray-400 mt-4 text-sm">
          (Functionality to be implemented later.)
        </p>
      </div>
    </div>
  );
}

export default Settings;
