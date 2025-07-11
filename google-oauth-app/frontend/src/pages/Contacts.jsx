// google-oauth-app/frontend/src/pages/Contacts.jsx

import React, { useState, useEffect } from 'react';
import ContactsTable from '../components/ContactsTable';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/api/contacts/list', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts);
        } else {
          throw new Error(`Failed to fetch contacts: ${response.statusText}`);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts. ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow text-gray-50 flex-grow">
      <h2 className="text-3xl font-bold mb-6">Your Contacts</h2>
      {loading && <div className="text-gray-300">Loading contacts...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}
      {!loading && !error && <ContactsTable contacts={contacts} />}
    </div>
  );
}

export default Contacts;
