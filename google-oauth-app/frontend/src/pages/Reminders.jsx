// google-oauth-app/frontend/src/components/RemindersTable.jsx

import React from 'react';

function RemindersTable({ reminders }) {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="p-6 bg-gray-700 rounded-lg shadow-md text-gray-300 text-center">
        No upcoming reminders found. Make sure you granted calendar permission during Google login.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-gray-700 rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-600">
        <thead className="bg-gray-600">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider rounded-tl-lg">
              Event
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Date & Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider rounded-tr-lg">
              Link
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {reminders.map((reminder) => (
            <tr key={reminder.id} className="hover:bg-gray-700 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                {reminder.summary}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {new Date(reminder.start).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {reminder.location || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                {reminder.htmlLink && (
                  <a href={reminder.htmlLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    View
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RemindersTable;
