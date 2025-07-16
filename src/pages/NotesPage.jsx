// google-oauth-app/frontend/src/pages/NotesPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Reusable Confirmation Modal Component (copied from ProfilePage.jsx)
const ConfirmationModal = ({ message, onConfirm, onCancel, confirmText, cancelText, accentColor, cardBgColor, textColor, mutedTextColor, cardBorderColor }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: cardBgColor,
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
        maxWidth: "450px",
        textAlign: "center",
        border: `1px solid ${cardBorderColor}`,
      }}>
        <p style={{ fontSize: "1.2rem", color: textColor, marginBottom: "20px" }}>
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              fontWeight: "bold",
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              "&:hover": { background: accentColor === "#DC3545" ? "#C82333" : "#43A047" },
            }}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              fontWeight: "bold",
              background: mutedTextColor,
              color: textColor,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              "&:hover": { background: "#808080" },
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};


export default function NotesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, theme } = useAuth(); // No need for logout if no backend interaction

  const [notes, setNotes] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState(null);

  // Define colors based on theme
  const bgColor = theme === 'dark' ? "#1A222A" : "#F8FBF8";
  const textColor = theme === 'dark' ? "#E0E6EB" : "#303030";
  const accentColor = "#4CAF50";
  const cardBgColor = theme === 'dark' ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)";
  const cardBorderColor = theme === 'dark' ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === 'dark' ? "#A0A8B0" : "#606060";


  // Function to update localStorage after notes changes
  const updateLocalStorageNotes = useCallback((updatedNotes) => {
    localStorage.setItem("localNotes", JSON.stringify(updatedNotes));
    // Dispatch a storage event to notify other tabs/components (like Dashboard)
    window.dispatchEvent(new Event('storage'));
  }, []);

  // --- Fetch Notes (from localStorage) ---
  const fetchNotes = useCallback(() => {
    setError(null);
    setDataLoading(true);
    try {
      const storedNotes = JSON.parse(localStorage.getItem("localNotes")) || [];
      setNotes(storedNotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      console.log("NotesPage: Fetched Notes from localStorage:", storedNotes);
    } catch (err) {
      console.error("Error fetching notes from localStorage:", err);
      setError("Failed to load notes from local storage. Error: " + err.message);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    // Notes page doesn't strictly need isAuthenticated, but for consistency with app flow
    if (!loading) {
      fetchNotes();
    }
  }, [loading, fetchNotes]);

  // --- Add Note (to localStorage) ---
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteTitle || !newNoteContent) {
      setError("Title and Content are required.");
      return;
    }

    setError(null);
    try {
      const newNote = {
        id: Date.now(), // Simple unique ID for local storage
        title: newNoteTitle,
        content: newNoteContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedNotes = [...notes, newNote].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotes(updatedNotes);
      updateLocalStorageNotes(updatedNotes); // Update localStorage
      setShowAddForm(false);
      setNewNoteTitle("");
      setNewNoteContent("");
      console.log("Note added to localStorage:", newNote);
    } catch (err) {
      console.error("Error adding note to localStorage:", err);
      setError("Failed to add note. Error: " + err.message);
    }
  };

  // --- Edit Note (in localStorage) ---
  const handleEditNote = async (e) => {
    e.preventDefault();
    if (!editingNote || !editingNote.title || !editingNote.content) {
      setError("Title and Content are required for editing.");
      return;
    }

    setError(null);
    try {
      const updatedNotes = notes.map((n) =>
        n.id === editingNote.id
          ? { ...editingNote, updated_at: new Date().toISOString() } // Update timestamp
          : n
      ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Re-sort

      setNotes(updatedNotes);
      updateLocalStorageNotes(updatedNotes); // Update localStorage
      setEditingNote(null);
      console.log("Note updated in localStorage:", editingNote);
    } catch (err) {
      console.error("Error updating note in localStorage:", err);
      setError("Failed to update note. Error: " + err.message);
    }
  };

  // --- Delete Note (from localStorage) ---
  const handleDeleteNoteConfirmed = async () => {
    const id = noteToDeleteId;
    setShowDeleteConfirmModal(false);
    setNoteToDeleteId(null);

    setError(null);
    try {
      const updatedNotes = notes.filter((n) => n.id !== id);
      setNotes(updatedNotes);
      updateLocalStorageNotes(updatedNotes); // Update localStorage
      console.log("Note deleted from localStorage:", id);
    } catch (err) {
      console.error("Error deleting note from localStorage:", err);
      setError("Failed to delete note. Error: " + err.message);
    }
  };

  const handleDeleteNote = (id) => {
    setNoteToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };


  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, color: textColor }}>
        <p>Loading application data...</p>
      </div>
    );
  }

  // Authentication check is still relevant for page access, even if data is local
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "red", color: "white" }}>
        <p>Access Denied. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ background: bgColor, color: textColor, minHeight: "100vh", padding: "32px", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "30px", color: accentColor }}>Your Notes</h1>

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

      {/* Add Note Button / Form */}
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: "10px 20px",
            background: accentColor,
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.2s",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#20B2AA")}
          onMouseOut={(e) => (e.currentTarget.style.background = accentColor)}
        >
          {showAddForm ? "Hide Form" : "Add New Note"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddNote} style={{
          background: cardBgColor,
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          border: `1px solid ${cardBorderColor}`,
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}>
          <h3 style={{ color: textColor, marginBottom: "10px" }}>Add New Note</h3>
          <input
            type="text"
            placeholder="Note Title"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
            required
          />
          <textarea
            placeholder="Note Content"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows="5"
            style={{ padding: "10px", borderRadius: "5px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
            required
          ></textarea>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: accentColor,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#20B2AA")}
            onMouseOut={(e) => (e.currentTarget.style.background = accentColor)}
          >
            Save Note
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            style={{
              padding: "10px 20px",
              background: mutedTextColor,
              color: textColor,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              marginTop: "10px"
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#777")}
            onMouseOut={(e) => (e.currentTarget.style.background = mutedTextColor)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Edit Note Form (Modal-like appearance) */}
      {editingNote && (
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
          zIndex: 1000
        }}>
          <form onSubmit={handleEditNote} style={{
            background: cardBgColor,
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
            border: `1px solid ${cardBorderColor}`,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "90%",
            maxWidth: "500px"
          }}>
            <h3 style={{ color: textColor, marginBottom: "10px" }}>Edit Note</h3>
            <input
              type="text"
              placeholder="Note Title"
              value={editingNote.title}
              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              style={{ padding: "12px", borderRadius: "6px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
              required
            />
            <textarea
              placeholder="Note Content"
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              rows="6"
              style={{ padding: "12px", borderRadius: "6px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
              required
            ></textarea>
            <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 25px",
                  background: accentColor,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#20B2AA")}
                onMouseOut={(e) => (e.currentTarget.style.background = accentColor)}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingNote(null)} // Close modal
                style={{
                  padding: "12px 25px",
                  background: mutedTextColor,
                  color: textColor,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  marginTop: "10px"
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#777")}
                onMouseOut={(e) => (e.currentTarget.style.background = mutedTextColor)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      {dataLoading ? (
        <p style={{ fontSize: "1.2rem", color: mutedTextColor, textAlign: "center" }}>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p style={{ fontSize: "1.2rem", color: mutedTextColor, textAlign: "center" }}>No notes found. Add one above!</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                border: `1px solid ${cardBorderColor}`,
                borderRadius: "8px",
                padding: "20px",
                background: cardBgColor,
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                transition: "transform 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <h3 style={{ margin: "0", color: textColor }}>{note.title}</h3>
              <p style={{ margin: "0", fontSize: "14px", color: mutedTextColor }}>
                {note.content}
              </p>
              <p style={{ margin: "0", fontSize: "12px", color: mutedTextColor }}>
                Created: {new Date(note.created_at).toLocaleString()}
              </p>
              {note.updated_at && note.updated_at !== note.created_at && (
                <p style={{ margin: "0", fontSize: "10px", color: mutedTextColor }}>
                  Updated: {new Date(note.updated_at).toLocaleString()}
                </p>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setEditingNote(note)}
                  style={{
                    padding: "8px 15px",
                    background: "#FFC107",
                    color: "#333",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#E0A800")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#FFC107")}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  style={{
                    padding: "8px 15px",
                    background: "#DC3545",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#C82333")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#DC3545")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this note? This action cannot be undone."
          onConfirm={handleDeleteNoteConfirmed}
          onCancel={() => setShowDeleteConfirmModal(false)}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          accentColor="#DC3545"
          cardBgColor={cardBgColor}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
          cardBorderColor={cardBorderColor}
        />
      )}
    </div>
  );
}
