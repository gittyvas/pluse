// google-oauth-app/frontend/src/pages/Search.jsx

import React, { useState } from 'react';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]); // Clear previous results

    // This is a client-side mock search for now.
    // In a real app, you'd send searchTerm to a backend API like /api/search
    // which would query your contacts, notes, etc.
    try {
      // Example: Fetch all contacts and filter them client-side
      const contactsResponse = await fetch('http://localhost:3000/api/contacts/list', { credentials: 'include' });
      if (!contactsResponse.ok) throw new Error('Failed to fetch contacts for search.');
      const contactsData = await contactsResponse.json();
      const allContacts = contactsData.contacts || [];

      // Example: Fetch all notes and filter them client-side
      const notesResponse = await fetch('http://localhost:3000/api/notes/list', { credentials: 'include' });
      if (!notesResponse.ok) throw new Error('Failed to fetch notes for search.');
      const notesData = await notesResponse.json();
      const allNotes = notesData.notes || [];

      const filteredResults = [];

      // Filter contacts
      if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        allContacts.forEach(contact => {
          if (contact.name.toLowerCase().includes(lowerCaseSearch) ||
              (contact.email && contact.email.toLowerCase().includes(lowerCaseSearch)) ||
              (contact.phone && contact.phone.includes(searchTerm))) {
            filteredResults.push({ type: 'contact', data: contact });
          }
        });

        // Filter notes
        allNotes.forEach(note => {
          if (note.title.toLowerCase().includes(lowerCaseSearch) ||
              note.content.toLowerCase().includes(lowerCaseSearch)) {
            filteredResults.push({ type: 'note', data: note });
          }
        });
      }

      setSearchResults(filteredResults);

    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to perform search: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow text-gray-50 flex-grow">
      <h2 className="text-3xl font-bold mb-6">Search</h2>
      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="Search contacts, notes..."
          className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">Error: {error}</p>}

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map((result, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md">
              <p className="text-sm text-gray-400 uppercase font-bold mb-2">{result.type}</p>
              {result.type === 'contact' && (
                <>
                  <h3 className="text-lg font-semibold text-white">{result.data.name}</h3>
                  <p className="text-gray-300 text-sm">{result.data.email}</p>
                  <p className="text-gray-300 text-sm">{result.data.phone}</p>
                </>
              )}
              {result.type === 'note' && (
                <>
                  <h3 className="text-lg font-semibold text-white">{result.data.title}</h3>
                  <p className="text-gray-300 text-sm line-clamp-2">{result.data.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        searchTerm && !loading && <p className="text-gray-300 text-center">No results found for "{searchTerm}".</p>
      )}
    </div>
  );
}

export default Search;
