// google-oauth-app/frontend/src/components/ContactsTable.jsx

import React from 'react';

function ContactsTable({ contacts }) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="p-6 bg-gray-700 rounded-lg shadow-md text-gray-300 text-center">
        No contacts found. Make sure you granted contacts permission during Google login.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-gray-700 rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-600">
        <thead className="bg-gray-600">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider rounded-tl-lg">
              Photo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider rounded-tr-lg">
              Phone
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-gray-700 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                {contact.photo ? (
                  <img className="h-10 w-10 rounded-full" src={contact.photo} alt={contact.name} onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/cccccc/333333?text=${contact.name.charAt(0)}`; }} />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                {contact.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {contact.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {contact.phone}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContactsTable;
