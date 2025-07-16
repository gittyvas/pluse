// google-oauth-app/frontend/src/pages/Reminders.jsx

import React, { useState, useEffect } from 'react';
import RemindersTable from '../components/RemindersTable';

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch reminders: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        setReminders(data);
      } catch (err) {
        console.error('Error fetching reminders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [BACKEND_API_BASE_URL]);

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow text-gray-50 flex-grow">
      <h2 className="text-3xl font-bold mb-6">Your Saved Reminders</h2>
      {loading && <div className="text-gray-300">Loading reminders...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}
      {!loading && !error && <RemindersTable reminders={reminders} />}
    </div>
  );
}

export default Reminders;
