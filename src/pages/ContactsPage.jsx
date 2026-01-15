import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ContactsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, theme } = useAuth();
  const accent = "#25D366"; // This remains the primary accent color

  // Define colors based on theme
  const bgColor = theme === 'dark' ? "#1A222A" : "#F8FBF8";
  const textColor = theme === 'dark' ? "#E0E6EB" : "#303030";
  const accentColor = "#4CAF50"; // Soft green accent for general elements, distinct from primary accent
  const cardBgColor = theme === 'dark' ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)";
  const cardBorderColor = theme === 'dark' ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === 'dark' ? "#A0A8B0" : "#606060";
  const inputBgColor = theme === 'dark' ? "#2A2E31" : "#EFEFEF"; // Specific for input fields
  const inputBorderColor = theme === 'dark' ? "#444" : "#CCC"; // Specific for input fields

  const [contacts, setContacts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false); // Initially false, as contacts aren't being loaded yet
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null); // For modal
  const [showContactDetailsModal, setShowContactDetailsModal] = useState(false);

  // NEW STATES: Control when contacts are fetched and if loaded successfully
  const [shouldLoadContacts, setShouldLoadContacts] = useState(false);
  const [contactsLoadedSuccessfully, setContactsLoadedSuccessfully] = useState(false);

  // New state for search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // Simulate pin/unpin logic using local state (for now, not persistent)
  const [pinnedIds, setPinnedIds] = useState(() => {
    // Initialize pinnedIds from localStorage
    try {
      const storedPinned = localStorage.getItem('pinnedContacts');
      return storedPinned ? JSON.parse(storedPinned) : [];
    } catch (e) {
      console.error("Failed to parse pinned contacts from localStorage", e);
      return [];
    }
  });

  const togglePinContact = (contactId) => {
    setPinnedIds((prev) => {
      const newPinned = prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId];
      localStorage.setItem('pinnedContacts', JSON.stringify(newPinned)); // Persist to localStorage
      return newPinned;
    });
  };

  const BACKEND_API_BASE_URL = import.meta.env.VITE_API_URL;

  // --- Fetch Google Contacts from Backend ---
  const fetchContacts = useCallback(async () => {
    if (!isAuthenticated || loading) {
      console.log("ContactsPage: Not authenticated or auth still loading. Skipping contacts fetch.");
      setDataLoading(false);
      return;
    }

    setError(null);
    setDataLoading(true);
    try {
      console.log("ContactsPage: Attempting to fetch contacts from backend.");
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/contacts`, {
        method: "GET",
        credentials: 'include', // Ensures HTTP-only cookie is sent automatically
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error("ContactsPage: Contacts API: Session expired or invalid. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log("ContactsPage: Fetched contacts data:", data);

      const processedContacts = data.map(contact => {
        const name = contact.names && contact.names.length > 0 ? contact.names[0].displayName : "No Name";
        const email = contact.emailAddresses && contact.emailAddresses.length > 0 ? contact.emailAddresses[0].value : "No Email";
        const photo = contact.photos && contact.photos.length > 0 ? contact.photos[0].url : null;
        const phone = contact.phoneNumbers && contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].value : "No Phone";
        const lastUpdated = contact.metadata && contact.metadata.sources && contact.metadata.sources.length > 0
          ? contact.metadata.sources[0].updateTime
          : "N/A";

        // Determine source based on metadata (assuming Google Contacts for now)
        const source = contact.metadata && contact.metadata.sources && contact.metadata.sources.some(s => s.type === 'CONTACT' || s.type === 'PROFILE') ? 'Google' : 'Unknown';

        return {
          id: contact.resourceName, // Use resourceName as a unique ID
          name,
          email,
          photo,
          phone,
          lastUpdated,
          source, // Add the source property
          raw: contact
        };
      }).filter(contact => contact.name !== "No Name" || contact.email !== "No Email");

      setContacts(processedContacts);
      setContactsLoadedSuccessfully(true); // Indicate successful loading
      console.log(`ContactsPage: Displaying ${processedContacts.length} contacts.`);

    } catch (err) {
      console.error("ContactsPage: Error fetching contacts:", err);
      setError("Failed to load contacts. Please try again. Error: " + err.message);
      setContactsLoadedSuccessfully(false); // Reset on error
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, loading, logout, BACKEND_API_BASE_URL]);


  // Effect to fetch contacts only when `shouldLoadContacts` becomes true
  useEffect(() => {
    if (shouldLoadContacts && !loading && isAuthenticated) {
      fetchContacts();
    }
  }, [shouldLoadContacts, isAuthenticated, loading, fetchContacts]);


  // Handler for the "Sync Google Contacts" button
  const handleSyncGoogleContacts = () => {
    setShouldLoadContacts(true); // This will trigger the useEffect to fetch contacts
    setError(null); // Clear any previous errors
  };

  // --- Filter contacts based on search query ---
  const filteredContacts = useMemo(() => {
    if (!searchQuery) {
      return contacts;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerCaseQuery) ||
      contact.email.toLowerCase().includes(lowerCaseQuery) ||
      contact.phone.toLowerCase().includes(lowerCaseQuery)
    );
  }, [contacts, searchQuery]);

  // Divide contacts into pinned and unpinned
  const pinnedContacts = filteredContacts.filter((c) => pinnedIds.includes(c.id));
  const unpinnedContacts = filteredContacts.filter((c) => !pinnedIds.includes(c.id));


  // --- Contact Details Modal Handlers ---
  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowContactDetailsModal(true);
  };

  const closeContactDetailsModal = () => {
    setSelectedContact(null);
    setShowContactDetailsModal(false);
  };


  // --- Export Functionality ---
  const generateCSV = (contactsToExport) => {
    const headers = ["Name", "Email", "Phone", "Last Updated", "Source"];
    const rows = contactsToExport.map(contact => [
      contact.name,
      contact.email,
      contact.phone,
      contact.lastUpdated,
      contact.source
    ]);
    if (window.csvStringify) {
      return window.csvStringify(rows, { header: true, columns: headers });
    } else {
      let csv = headers.join(",") + "\n";
      rows.forEach(row => {
        csv += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",") + "\n";
      });
      return csv;
    }
  };

  const generateVCard = (contact) => {
    let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
    vcard += `FN:${contact.name}\n`;
    if (contact.email && contact.email !== "No Email") {
      vcard += `EMAIL;TYPE=internet:${contact.email}\n`;
    }
    if (contact.phone && contact.phone !== "No Phone") {
      vcard += `TEL;TYPE=cell:${contact.phone}\n`;
    }
    if (contact.photo) {
        vcard += `PHOTO;VALUE=uri:${contact.photo}\n`;
    }
    if (contact.source) {
        vcard += `X-SOURCE:${contact.source}\n`;
    }
    vcard += `REV:${new Date().toISOString()}\n`;
    vcard += "END:VCARD\n";
    return vcard;
  };

  const handleExportCSV = () => {
    if (contacts.length === 0) {
      setError("No contacts to export to CSV.");
      return;
    }
    const csvContent = generateCSV(contacts);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    if (window.saveAs) {
      window.saveAs(blob, "google_contacts.csv");
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "google_contacts.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setError("Download initiated. If it didn't work, ensure FileSaver.js is loaded.");
    }
  };

  const handleExportVCard = () => {
    if (contacts.length === 0) {
      setError("No contacts to export to vCard.");
      return;
    }
    let allVCards = "";
    contacts.forEach(contact => {
      allVCards += generateVCard(contact) + "\n";
    });

    const blob = new Blob([allVCards], { type: "text/vcard;charset=utf-8;" });
    if (window.saveAs) {
      window.saveAs(blob, "google_contacts.vcf");
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "google_contacts.vcf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setError("Download initiated. If it didn't work, ensure FileSaver.js is loaded.");
    }
  };


  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, color: textColor }}>
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "red", color: "white" }}>
        <p>Access Denied. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ background: bgColor, color: textColor, minHeight: "100vh", padding: "32px", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "30px", color: accentColor }}>Your Contacts</h1>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          background: mutedTextColor,
          color: textColor,
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = theme === 'dark' ? "#555" : "#CCC")}
        onMouseOut={(e) => (e.currentTarget.style.background = mutedTextColor)}
      >
        ← Back to Dashboard
      </button>

      {error && (
        <div style={{ color: "red", backgroundColor: "#3a1f1f", padding: "10px", borderRadius: "8px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Sync Google Contacts Button */}
      {!shouldLoadContacts && ( // Only show if contacts haven't been triggered to load yet
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <button
            onClick={handleSyncGoogleContacts}
            style={{
              padding: "15px 30px",
              fontSize: "1.2rem",
              background: "#4285F4", // Google Blue
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.3s ease",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "0 auto"
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#357ae8")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#4285F4")}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google Logo" style={{ width: "24px", height: "24px" }} />
            Sync Contacts from Google
          </button>
          <p style={{ marginTop: "15px", color: mutedTextColor }}>Tap the button above to load your Google Contacts.</p>
        </div>
      )}

      {/* "Synced from Google Contacts" Banner - appears after successful load */}
      {shouldLoadContacts && !dataLoading && contactsLoadedSuccessfully && contacts.length > 0 && (
        <div style={{
          backgroundColor: theme === 'dark' ? "#1F3A22" : "#e6f7ff",
          border: `1px solid ${theme === 'dark' ? "#3A8D40" : "#91d5ff"}`,
          padding: "15px 20px",
          marginBottom: "30px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1em",
          color: theme === 'dark' ? "#A0D9B1" : "#0056b3",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
        }}>
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <span role="img" aria-label="Cloud Sync" style={{ fontSize: "1.3em" }}>☁️</span>
            Contacts Synced from Google Contacts
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ height: "1.2em", verticalAlign: "middle" }} />
          </p>
        </div>
      )}


      {/* Search Bar (conditional rendering based on contacts loaded) */}
      {shouldLoadContacts && (
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
          <input
            type="text"
            placeholder="Search contacts by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "12px 15px",
              fontSize: "1rem",
              borderRadius: "8px",
              border: `1px solid ${inputBorderColor}`,
              background: inputBgColor,
              color: textColor,
              outline: "none",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}40`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = inputBorderColor;
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
            }}
          />
        </div>
      )}


      {/* Export Buttons (conditional rendering based on contacts loaded) */}
      {shouldLoadContacts && contacts.length > 0 && (
        <div style={{ marginBottom: "30px", display: "flex", gap: "15px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            onClick={handleExportCSV}
            style={{
              padding: "10px 20px",
              background: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#0056b3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#007BFF")}
          >
            Export All to CSV 📤
          </button>
          <button
            onClick={handleExportVCard}
            style={{
              padding: "10px 20px",
              background: "#28A745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#218838")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#28A745")}
          >
            Export All to vCard 📤
          </button>
        </div>
      )}

      {/* Conditional rendering for contacts list */}
      {shouldLoadContacts ? ( // Only render this block if the button has been tapped
        dataLoading ? (
          <p style={{ fontSize: "1.2rem", color: mutedTextColor, textAlign: "center" }}>Loading contacts...</p>
        ) : filteredContacts.length === 0 && searchQuery ? (
          <p style={{ fontSize: "1.2rem", color: mutedTextColor, textAlign: "center" }}>No contacts match your search query.</p>
        ) : filteredContacts.length === 0 && !searchQuery && contactsLoadedSuccessfully ? (
          <p style={{ fontSize: "1.2rem", color: mutedTextColor, textAlign: "center" }}>No contacts found or imported from Google.</p>
        ) : (
          <>
            {/* Pinned Contacts Section */}
            {pinnedContacts.length > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px", color: accentColor }}>
                  Pinned Contacts ⭐
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {pinnedContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      accent={accent}
                      accentColor={accentColor}
                      isPinned={true}
                      onTogglePin={togglePinContact}
                      onClick={() => handleContactClick(contact)}
                      cardBgColor={cardBgColor}
                      cardBorderColor={cardBorderColor}
                      textColor={textColor}
                      mutedTextColor={mutedTextColor}
                      theme={theme}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Other Contacts Section */}
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px", color: accentColor }}>
              All Contacts
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {unpinnedContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  accent={accent}
                  accentColor={accentColor}
                  isPinned={false}
                  onTogglePin={togglePinContact}
                  onClick={() => handleContactClick(contact)}
                  cardBgColor={cardBgColor}
                  cardBorderColor={cardBorderColor}
                  textColor={textColor}
                  mutedTextColor={mutedTextColor}
                  theme={theme}
                />
              ))}
            </div>
          </>
        )
      ) : ( // Render this if shouldLoadContacts is still false (before button tap)
        <div style={{ textAlign: "center", padding: "50px 0" }}>
            <p style={{ fontSize: "1.2rem", color: mutedTextColor }}>
                Tap "Sync Contacts from Google" to load your contacts.
            </p>
        </div>
      )}


      {/* Contact Details Modal */}
      {showContactDetailsModal && selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={closeContactDetailsModal}
          accent={accent}
          accentColor={accentColor}
          generateVCard={generateVCard}
          cardBgColor={cardBgColor}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
          theme={theme}
        />
      )}
    </div>
  );
}

// --- ContactCard Component ---
function ContactCard({ contact, accent, accentColor, isPinned, onTogglePin, onClick, cardBgColor, cardBorderColor, textColor, mutedTextColor, theme }) {
  const isDark = theme === 'dark';
  return (
    <div
      style={{
        border: `1px solid ${isPinned ? "#FFD700" : cardBorderColor}`,
        borderRadius: "8px",
        padding: "20px",
        background: isPinned ? (isDark ? "#3A3A20" : "#FFFBE6") : cardBgColor,
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        transition: "transform 0.2s, background 0.2s, border-color 0.2s",
        position: "relative",
        cursor: "pointer",
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      onClick={onClick}
    >
      {/* Pin/Unpin Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(contact.id);
        }}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          color: isPinned ? "#FFD700" : mutedTextColor,
          transition: "color 0.2s",
        }}
      >
        {isPinned ? "⭐" : "☆"}
      </button>

      {contact.photo ? (
        <img
          src={contact.photo}
          alt={contact.name}
          style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${accent}` }}
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/25D366/FFFFFF?text=👤"; }}
        />
      ) : (
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", color: "#fff" }}>
          {contact.name.charAt(0).toUpperCase()}
        </div>
      )}
      <h3 style={{ margin: "0", color: textColor, textAlign: "center" }}>{contact.name}</h3>
      {contact.email !== "No Email" && (
        <p style={{ margin: "0", fontSize: "14px", color: mutedTextColor, textAlign: "center" }}>
          Email: {contact.email}
        </p>
      )}
      {contact.phone !== "No Phone" && (
        <p style={{ margin: "0", fontSize: "14px", color: mutedTextColor, textAlign: "center" }}>
          Phone: {contact.phone}
        </p>
      )}

      {/* Data Source Label/Tooltip within ContactCard */}
      {contact.source === 'Google' && (
        <div
          title="This contact is synced from Google Contacts"
          style={{
            marginTop: "8px",
            padding: "4px 8px",
            backgroundColor: theme === 'dark' ? "#2A3A40" : "#E8F0FE",
            color: theme === 'dark' ? "#8AB4F8" : "#1A73E8",
            borderRadius: "5px",
            fontSize: "0.75em",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            whiteSpace: "nowrap",
            border: `1px solid ${theme === 'dark' ? "#3C72B0" : "#AECBFA"}`
          }}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" style={{ height: "1em" }} />
          Google
        </div>
      )}
    </div>
  );
}


// --- ContactDetailsModal Component ---
function ContactDetailsModal({ contact, onClose, accent, accentColor, generateVCard, cardBgColor, textColor, mutedTextColor, theme }) {
  if (!contact) return null;

  const handleExportVCardSingle = () => {
    const vcardContent = generateVCard(contact);
    const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8;" });
    if (window.saveAs) {
      window.saveAs(blob, `${contact.name.replace(/\s/g, '_')}.vcf`);
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${contact.name.replace(/\s/g, '_')}.vcf`;
      document.body.appendChild(link);
      document.body.removeChild(link);
      console.warn("Download initiated. If it didn't work, ensure FileSaver.js is loaded.");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
      boxSizing: "border-box",
    }} onClick={onClose}>
      <div style={{
        background: cardBgColor,
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "90%",
        maxWidth: "500px",
        color: textColor,
        position: "relative",
        overflowY: "auto",
        maxHeight: "90vh",
      }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "24px",
            color: textColor,
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        <h2 style={{ color: accentColor, marginBottom: "10px" }}>{contact.name}</h2>
        {contact.photo ? (
          <img
            src={contact.photo}
            alt={contact.name}
            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}`, alignSelf: "center" }}
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/120x120/25D366/FFFFFF?text=👤"; }}
          />
        ) : (
          <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", color: "#fff", alignSelf: "center" }}>
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Source Label/Tooltip in Modal */}
        {contact.source === 'Google' && (
          <div
            title="This contact is synced from Google Contacts"
            style={{
              padding: "5px 10px",
              backgroundColor: theme === 'dark' ? "#2A3A40" : "#E8F0FE",
              color: theme === 'dark' ? "#8AB4F8" : "#1A73E8",
              borderRadius: "5px",
              fontSize: "0.9em",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              border: `1px solid ${theme === 'dark' ? "#3C72B0" : "#AECBFA"}`
            }}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ height: "1.2em" }} />
            Synced from Google Contacts
          </div>
        )}

        {/* Conditional rendering for Phone Actions */}
        {contact.phone && contact.phone !== "No Phone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <p style={{ margin: "0", color: textColor }}><strong>Phone:</strong> {contact.phone}</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a
                href={`tel:${contact.phone}`}
                style={{
                  padding: "8px 15px",
                  background: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#0056b3")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#007BFF")}
              >
                Call Phone 📞
              </a>
              <a
                href={`whatsapp://send?phone=${contact.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 15px",
                  background: "#25D366",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#1DA851")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#25D366")}
              >
                WhatsApp 💬
              </a>
              <a
                href={`tg://resolve?phone=${contact.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 15px",
                  background: "#0088CC",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#006699")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#0088CC")}
              >
                Telegram ✈️
              </a>
              <a
                href={`skype:${contact.phone}?call`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 15px",
                  background: "#00AFF0",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#008CBB")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#00AFF0")}
              >
                Skype 📞
              </a>
            </div>
          </div>
        )}

        {/* Conditional rendering for Email Action - MODIFIED */}
        {contact.email && contact.email !== "No Email" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <p style={{ margin: "0", color: textColor }}><strong>Email:</strong> {contact.email}</p>
            <a
              href={`mailto:${contact.email}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 15px",
                background: "#28A745", // Green color for email button
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                textDecoration: "none",
                transition: "background 0.2s",
                textAlign: "center"
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#218838")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#28A745")}
            >
              Email {contact.name === "No Name" ? "Contact" : contact.name} 📧
            </a>
          </div>
        ) : (
          // If no email, display "No Email" as muted text, not a red link
          <p style={{ margin: "0", color: mutedTextColor, fontStyle: "italic", textAlign: "center" }}>
            No Email Address Available
          </p>
        )}

        <p style={{ color: mutedTextColor }}><strong>Last Updated:</strong> {contact.lastUpdated !== "N/A" ? new Date(contact.lastUpdated).toLocaleString() : "N/A"}</p>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleExportVCardSingle}
            style={{
              padding: "10px 20px",
              background: "#28A745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#218838")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#28A745")}
          >
            Export vCard 📤
          </button>
        </div>
      </div>
    </div>
  );
}
