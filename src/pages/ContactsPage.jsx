// google-oauth-app/frontend/src/pages/ContactsPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ContactsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const accent = "#25D366";

  const [contacts, setContacts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null); // For modal
  const [showContactDetailsModal, setShowContactDetailsModal] = useState(false);
  const [pinnedContactIds, setPinnedContactIds] = useState([]); // Stores resourceNames of pinned contacts

  // New state for search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // --- FIX: Use environment variable for backend URL ---
  const BACKEND_API_BASE_URL = import.meta.env.VITE_API_URL;

  // --- Firebase Integration for Frontend (for Pinned Contacts) ---
  // Assuming Firebase is initialized globally via index.html and exposed on window.firebase
  const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
  const firebaseConfig = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : null;
  const initialAuthToken = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;

  const [db, setDb] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const initFirebase = async () => {
      if (firebaseConfig && window.firebase && window.firebase.firestore && window.firebase.auth) {
        try {
          // Initialize Firebase app only once
          // Check if app is already initialized, otherwise initialize
          const app = window.firebase.apps && window.firebase.apps.length > 0
            ? window.firebase.apps[0]
            : window.firebase.initializeApp(firebaseConfig, appId);

          const firestoreDb = window.firebase.firestore.getFirestore(app);
          const firebaseAuth = window.firebase.auth.getAuth(app);
          setDb(firestoreDb);

          // Authenticate with custom token or anonymously
          if (initialAuthToken) {
            await window.firebase.auth.signInWithCustomToken(firebaseAuth, initialAuthToken);
          } else {
            await window.firebase.auth.signInAnonymously(firebaseAuth);
          }

          window.firebase.auth.onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
              setCurrentUserId(user.uid);
              console.log("ContactsPage: Firebase Auth State Changed. User ID:", user.uid);
            } else {
              setCurrentUserId(null);
              console.log("ContactsPage: Firebase Auth State Changed. No user.");
            }
          });
        } catch (error) {
          console.error("ContactsPage: Error initializing Firebase or signing in:", error);
          setError("Failed to initialize Firebase for pinning features.");
        }
      } else {
        console.warn("ContactsPage: window.firebase or firebaseConfig not available. Pinning feature may not work.");
      }
    };

    initFirebase();
  }, [firebaseConfig, initialAuthToken, appId]);


  // --- Fetch Pinned Contacts from Firestore ---
  useEffect(() => {
    if (db && currentUserId && isAuthenticated) {
      console.log("ContactsPage: Setting up Firestore listener for pinned contacts for user:", currentUserId);
      const pinnedContactsCollectionRef = window.firebase.firestore.collection(db, `artifacts/${appId}/users/${currentUserId}/pinnedContacts`);
      const unsubscribe = window.firebase.firestore.onSnapshot(pinnedContactsCollectionRef, (snapshot) => {
        const ids = snapshot.docs.map(doc => doc.id);
        setPinnedContactIds(ids);
        console.log("ContactsPage: Pinned contact IDs updated:", ids);
      }, (error) => {
        console.error("ContactsPage: Error fetching pinned contacts snapshot:", error);
        setError("Failed to load pinned contacts from Firestore.");
      });

      return () => unsubscribe(); // Cleanup listener
    }
  }, [db, currentUserId, isAuthenticated, appId]);


  // --- Fetch Google Contacts from Backend ---
  const fetchContacts = useCallback(async () => {
    // Only proceed if authenticated and not currently loading auth state
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
        // --- FIX: Remove Authorization header, rely on HTTP-only cookie ---
        credentials: 'include', // Ensures HTTP-only cookie is sent
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

      // Process contacts to extract relevant info and handle missing names/emails
      const processedContacts = data.map(contact => {
        const name = contact.names && contact.names.length > 0 ? contact.names[0].displayName : "No Name";
        const email = contact.emailAddresses && contact.emailAddresses.length > 0 ? contact.emailAddresses[0].value : "No Email";
        const photo = contact.photos && contact.photos.length > 0 ? contact.photos[0].url : null;
        const phone = contact.phoneNumbers && contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].value : "No Phone";
        const lastUpdated = contact.metadata && contact.metadata.sources && contact.metadata.sources.length > 0
          ? contact.metadata.sources[0].updateTime
          : "N/A";

        return {
          id: contact.resourceName, // Use resourceName as a unique ID for pinning
          name,
          email,
          photo,
          phone,
          lastUpdated,
          raw: contact // Keep raw data for debugging if needed
        };
      }).filter(contact => contact.name !== "No Name" || contact.email !== "No Email"); // Filter out contacts with no name or email

      setContacts(processedContacts);
      console.log(`ContactsPage: Displaying ${processedContacts.length} contacts.`);

    } catch (err) {
      console.error("ContactsPage: Error fetching contacts:", err);
      setError("Failed to load contacts. Please try again. Error: " + err.message);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, loading, logout]); // Dependencies for fetchContacts - added loading


  useEffect(() => {
    if (!loading && isAuthenticated) {
      fetchContacts();
    }
  }, [isAuthenticated, loading, fetchContacts]);


  // --- Filter contacts based on search query ---
  const filteredContacts = useMemo(() => {
    if (!searchQuery) {
      return contacts; // If no search query, return all contacts
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerCaseQuery) ||
      contact.email.toLowerCase().includes(lowerCaseQuery) ||
      contact.phone.toLowerCase().includes(lowerCaseQuery)
    );
  }, [contacts, searchQuery]);


  // Separate pinned and unpinned contacts from the FILTERED list
  const pinnedContacts = useMemo(() => {
    return filteredContacts.filter(contact => pinnedContactIds.includes(contact.id));
  }, [filteredContacts, pinnedContactIds]);

  const unpinnedContacts = useMemo(() => {
    return filteredContacts.filter(contact => !pinnedContactIds.includes(contact.id));
  }, [filteredContacts, pinnedContactIds]);


  // --- Contact Details Modal Handlers ---
  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowContactDetailsModal(true);
  };

  const closeContactDetailsModal = () => {
    setSelectedContact(null);
    setShowContactDetailsModal(false);
  };


  // --- Pin/Unpin Contact Logic ---
  const togglePinContact = useCallback(async (contactId) => {
    if (!db || !currentUserId) {
      setError("Firebase not ready for pinning. Please try again.");
      return;
    }

    const pinnedContactDocRef = window.firebase.firestore.doc(db, `artifacts/${appId}/users/${currentUserId}/pinnedContacts`, contactId);

    try {
      if (pinnedContactIds.includes(contactId)) {
        // Unpin
        await window.firebase.firestore.deleteDoc(pinnedContactDocRef);
        console.log("ContactsPage: Unpinned contact:", contactId);
      } else {
        // Pin
        const contactToPin = contacts.find(c => c.id === contactId);
        if (contactToPin) {
          await window.firebase.firestore.setDoc(pinnedContactDocRef, contactToPin, { merge: true });
          console.log("ContactsPage: Pinned contact:", contactId);
        }
      }
    } catch (err) {
      console.error("ContactsPage: Error toggling pin status:", err);
      setError("Failed to update pinned status. Error: " + err.message);
    }
  }, [db, currentUserId, pinnedContactIds, contacts, appId]);


  // --- Export Functionality ---
  const generateCSV = (contactsToExport) => {
    const headers = ["Name", "Email", "Phone", "Last Updated"];
    const rows = contactsToExport.map(contact => [
      contact.name,
      contact.email,
      contact.phone,
      contact.lastUpdated
    ]);
    // Use window.csvStringify if available, otherwise basic string creation
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
        // vCard 3.0 does not directly support image URLs, but some clients might interpret it.
        // For full compatibility, image would need to be base64 encoded and embedded, which is complex.
        vcard += `PHOTO;VALUE=uri:${contact.photo}\n`;
    }
    vcard += `REV:${new Date().toISOString()}\n`; // Last revised
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
      // Fallback for browsers without FileSaver.js (or if not loaded)
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#181C1F", color: "#fff" }}>
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
    <div style={{ background: "#181C1F", color: "#fff", minHeight: "100vh", padding: "32px" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "30px", color: accent }}>Your Contacts</h1>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          background: "#333",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#333")}
      >
        ← Back to Dashboard
      </button>

      {error && (
        <div style={{ color: "red", backgroundColor: "#3a1f1f", padding: "10px", borderRadius: "8px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
        <input
          type="text"
          placeholder="Search contacts by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "600px", // Limit width for better aesthetics
            padding: "12px 15px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #444",
            background: "#2A2E31",
            color: "#fff",
            outline: "none",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}40`; // Soft glow
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#444";
            e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
          }}
        />
      </div>

      {/* Export Buttons */}
      <div style={{ marginBottom: "30px", display: "flex", gap: "15px", justifyContent: "flex-end" }}>
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

      {dataLoading ? (
        <p style={{ fontSize: "1.2rem", color: "#CCC", textAlign: "center" }}>Loading contacts...</p>
      ) : filteredContacts.length === 0 && searchQuery ? ( // Show message if no results for a search
        <p style={{ fontSize: "1.2rem", color: "#CCC", textAlign: "center" }}>No contacts match your search query.</p>
      ) : filteredContacts.length === 0 && !searchQuery ? ( // Show message if no contacts at all
        <p style={{ fontSize: "1.2rem", color: "#CCC", textAlign: "center" }}>No contacts found or imported from Google.</p>
      ) : (
        <>
          {/* Pinned Contacts Section */}
          {pinnedContacts.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px", color: accent }}>
                Pinned Contacts ⭐
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                {pinnedContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    accent={accent}
                    isPinned={true}
                    onTogglePin={togglePinContact}
                    onClick={() => handleContactClick(contact)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Other Contacts Section */}
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px", color: accent }}>
            All Contacts
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {unpinnedContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                accent={accent}
                isPinned={false}
                onTogglePin={togglePinContact}
                onClick={() => handleContactClick(contact)}
              />
            ))}
          </div>
        </>
      )}

      {/* Contact Details Modal */}
      {showContactDetailsModal && selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={closeContactDetailsModal}
          accent={accent}
          generateVCard={generateVCard} // Pass generateVCard to the modal
        />
      )}
    </div>
  );
}

// --- ContactCard Component ---
function ContactCard({ contact, accent, isPinned, onTogglePin, onClick }) {
  return (
    <div
      style={{
        border: `1px solid ${isPinned ? "#FFD700" : "#333"}`, // Gold border for pinned
        borderRadius: "8px",
        padding: "20px",
        background: isPinned ? "#3A3A20" : "#2A2E31", // Darker background for pinned
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        transition: "transform 0.2s, background 0.2s, border-color 0.2s",
        position: "relative", // For pin button positioning
        cursor: "pointer", // Indicate clickable
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      onClick={onClick} // Handle click for modal
    >
      {/* Pin/Unpin Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent modal from opening when clicking pin
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
          color: isPinned ? "#FFD700" : "#888", // Gold for pinned, grey for unpinned
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
          onError={(e) => { e.target.onerror = null; e.target.src="[https://placehold.co/80x80/25D366/FFFFFF?text=](https://placehold.co/80x80/25D366/FFFFFF?text=)👤"; }} // Fallback image
        />
      ) : (
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", color: "#fff" }}>
          {contact.name.charAt(0).toUpperCase()}
        </div>
      )}
      <h3 style={{ margin: "0", color: "#FFF", textAlign: "center" }}>{contact.name}</h3>
      {contact.email !== "No Email" && (
        <p style={{ margin: "0", fontSize: "14px", color: "#CCC", textAlign: "center" }}>
          Email: {contact.email}
        </p>
      )}
      {contact.phone !== "No Phone" && (
        <p style={{ margin: "0", fontSize: "14px", color: "#CCC", textAlign: "center" }}>
          Phone: {contact.phone}
        </p>
      )}
    </div>
  );
}


// --- ContactDetailsModal Component ---
function ContactDetailsModal({ contact, onClose, accent, generateVCard }) {
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
      link.click();
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
    }} onClick={onClose}> {/* Close modal when clicking outside */}
      <div style={{
        background: "#2A2E31",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "90%",
        maxWidth: "500px",
        color: "#FFF",
        position: "relative",
        overflowY: "auto", // Enable scrolling for long content
        maxHeight: "90vh", // Limit height
      }} onClick={(e) => e.stopPropagation()}> {/* Prevent modal from closing when clicking inside */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "24px",
            color: "#FFF",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        <h2 style={{ color: accent, marginBottom: "10px" }}>{contact.name}</h2>
        {contact.photo ? (
          <img
            src={contact.photo}
            alt={contact.name}
            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}`, alignSelf: "center" }}
            onError={(e) => { e.target.onerror = null; e.target.src="[https://placehold.co/120x120/25D366/FFFFFF?text=](https://placehold.co/120x120/25D366/FFFFFF?text=)👤"; }} // Fallback image
          />
        ) : (
          <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", color: "#fff", alignSelf: "center" }}>
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Conditional rendering for Phone Actions */}
        {contact.phone && contact.phone !== "No Phone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <p style={{ margin: "0" }}><strong>Phone:</strong> {contact.phone}</p>
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
                href={`whatsapp://send?phone=${contact.phone.replace(/\D/g, '')}`} // Remove non-digits for WhatsApp
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
                href={`tg://resolve?phone=${contact.phone.replace(/\D/g, '')}`} // Remove non-digits for Telegram
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
                href={`skype:${contact.phone}?call`} // Skype call link
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

        {/* Conditional rendering for Email Action */}
        {contact.email && contact.email !== "No Email" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <p style={{ margin: "0" }}><strong>Email:</strong> {contact.email}</p>
            <a
              href={`mailto:${contact.email}`}
              style={{
                padding: "8px 15px",
                background: "#DC3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#C82333")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#DC3545")}
            >
              Email {contact.name} 📧
            </a>
          </div>
        )}

        <p><strong>Last Updated:</strong> {contact.lastUpdated !== "N/A" ? new Date(contact.lastUpdated).toLocaleString() : "N/A"}</p>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
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
