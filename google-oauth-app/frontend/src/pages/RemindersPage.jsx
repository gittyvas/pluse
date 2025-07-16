// google-oauth-app/frontend/src/pages/RemindersPage.jsx

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


export default function RemindersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, theme } = useAuth(); // No need for logout if no backend interaction

  const [reminders, setReminders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDescription, setNewReminderDescription] = useState("");
  const [newReminderDueDate, setNewReminderDueDate] = useState("");
  const [editingReminder, setEditingReminder] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [reminderToDeleteId, setReminderToDeleteId] = useState(null);


  // Define colors based on theme
  const bgColor = theme === 'dark' ? "#1A222A" : "#F8FBF8";
  const textColor = theme === 'dark' ? "#E0E6EB" : "#303030";
  const accentColor = "#4CAF50";
  const cardBgColor = theme === 'dark' ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)";
  const cardBorderColor = theme === 'dark' ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === 'dark' ? "#A0A8B0" : "#606060";


  // Function to update localStorage after reminders changes
  const updateLocalStorageReminders = useCallback((updatedReminders) => {
    localStorage.setItem("localReminders", JSON.stringify(updatedReminders));
    // Dispatch a storage event to notify other tabs/components (like Dashboard)
    window.dispatchEvent(new Event('storage'));
  }, []);


  // --- Fetch Reminders (from localStorage) ---
  const fetchReminders = useCallback(() => {
    setError(null);
    setDataLoading(true);
    try {
      const storedReminders = JSON.parse(localStorage.getItem("localReminders")) || [];
      setReminders(storedReminders.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
      console.log("RemindersPage: Fetched Reminders from localStorage:", storedReminders);
    } catch (err) {
      console.error("Error fetching reminders from localStorage:", err);
      setError("Failed to load reminders from local storage. Error: " + err.message);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reminders page doesn't strictly need isAuthenticated, but for consistency with app flow
    if (!loading) {
      fetchReminders();
    }
  }, [loading, fetchReminders]);

  // --- Add Reminder (to localStorage) ---
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminderTitle || !newReminderDueDate) {
      setError("Title and Due Date are required.");
      return;
    }

    setError(null);
    try {
      const newReminder = {
        id: Date.now(), // Simple unique ID for local storage
        title: newReminderTitle,
        description: newReminderDescription,
        due_date: newReminderDueDate,
        completed: false, // Default to not completed
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedReminders = [...reminders, newReminder].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      setReminders(updatedReminders);
      updateLocalStorageReminders(updatedReminders); // Update localStorage
      setShowAddForm(false);
      setNewReminderTitle("");
      setNewReminderDescription("");
      setNewReminderDueDate("");
      console.log("Reminder added to localStorage:", newReminder);
    } catch (err) {
      console.error("Error adding reminder to localStorage:", err);
      setError("Failed to add reminder. Error: " + err.message);
    }
  };

  // --- Edit Reminder (in localStorage) ---
  const handleEditReminder = async (e) => {
    e.preventDefault();
    if (!editingReminder || !editingReminder.title || !editingReminder.due_date) {
      setError("Title and Due Date are required for editing.");
      return;
    }

    setError(null);
    try {
      const updatedReminders = reminders.map((r) =>
        r.id === editingReminder.id
          ? { ...editingReminder, updated_at: new Date().toISOString() } // Update timestamp
          : r
      ).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)); // Re-sort

      setReminders(updatedReminders);
      updateLocalStorageReminders(updatedReminders); // Update localStorage
      setEditingReminder(null);
      console.log("Reminder updated in localStorage:", editingReminder);
    } catch (err) {
      console.error("Error updating reminder in localStorage:", err);
      setError("Failed to update reminder. Error: " + err.message);
    }
  };

  // --- Delete Reminder (from localStorage) ---
  const handleDeleteReminderConfirmed = async () => {
    const id = reminderToDeleteId;
    setShowDeleteConfirmModal(false);
    setReminderToDeleteId(null);

    setError(null);
    try {
      const updatedReminders = reminders.filter((r) => r.id !== id);
      setReminders(updatedReminders);
      updateLocalStorageReminders(updatedReminders); // Update localStorage
      console.log("Reminder deleted from localStorage:", id);
    } catch (err) {
      console.error("Error deleting reminder from localStorage:", err);
      setError("Failed to delete reminder. Error: " + err.message);
    }
  };

  const handleDeleteReminder = (id) => {
    setReminderToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  // --- Toggle Reminder Completion (in localStorage) ---
  const handleToggleComplete = async (reminder) => {
    setError(null);
    try {
      const updatedReminders = reminders.map((r) =>
        r.id === reminder.id
          ? { ...r, completed: !r.completed, updated_at: new Date().toISOString() }
          : r
      );
      setReminders(updatedReminders);
      updateLocalStorageReminders(updatedReminders); // Update localStorage
      console.log("Reminder completion toggled in localStorage:", reminder.id);
    } catch (err) {
      console.error("Error toggling completion in localStorage:", err);
      setError("Failed to toggle reminder completion. Error: " + err.message);
    }
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
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "30px", color: accentColor }}>Your Reminders</h1>

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

      {/* Add Reminder Button / Form */}
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
          {showAddForm ? "Hide Form" : "Add New Reminder"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddReminder} style={{
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
          <h3 style={{ color: textColor, marginBottom: "10px" }}>Add New Reminder</h3>
          <input
            type="text"
            placeholder="Reminder Title"
            value={newReminderTitle}
            onChange={(e) => setNewReminderTitle(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newReminderDescription}
            onChange={(e) => setNewReminderDescription(e.target.value)}
            rows="3"
            style={{ padding: "10px", borderRadius: "5px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
          ></textarea>
          <input
            type="datetime-local"
            value={newReminderDueDate}
            onChange={(e) => setNewReminderDueDate(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
            required
          />
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
            Save Reminder
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

      {/* Edit Reminder Form (Modal-like appearance) */}
      {editingReminder && (
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
          <form onSubmit={handleEditReminder} style={{
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
            <h3 style={{ color: textColor, marginBottom: "10px" }}>Edit Reminder</h3>
            <input
              type="text"
              placeholder="Reminder Title"
              value={editingReminder.title}
              onChange={(e) => setEditingReminder({ ...editingReminder, title: e.target.value })}
              style={{ padding: "12px", borderRadius: "6px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={editingReminder.description}
              onChange={(e) => setEditingReminder({ ...editingReminder, description: e.target.value })}
              rows="4"
              style={{ padding: "12px", borderRadius: "6px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
            ></textarea>
            <input
              type="datetime-local"
              value={editingReminder.due_date ? new Date(editingReminder.due_date).toISOString().slice(0, 16) : ""}
              onChange={(e) => setEditingReminder({ ...editingReminder, due_date: e.target.value })}
              style={{ padding: "12px", borderRadius: "6px", border: `1px solid ${cardBorderColor}`, background: bgColor, color: textColor }}
              required
            />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="completed"
                checked={editingReminder.completed}
                onChange={(e) => setEditingReminder({ ...editingReminder, completed: e.target.checked })}
                style={{ transform: "scale(1.2)" }}
              />
              <label htmlFor="completed" style={{ color: mutedTextColor }}>Completed</label>
            </div>
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
                onClick={() => setEditingReminder(null)}
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


        {/* Reminders List */}
        {dataLoading ? (
          <p style={{ fontSize: "1.2rem", color: mutedTextColor, textAlign: "center" }}>Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p style={{ fontSize: "1.2rem", color: mutedTextColor, textAlign: "center" }}>No reminders found. Add one above!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                style={{
                  border: `1px solid ${reminder.completed ? "#4CAF50" : cardBorderColor}`,
                  borderRadius: "8px",
                  padding: "20px",
                  background: reminder.completed ? "linear-gradient(145deg, #2A3D2A, #1F281F)" : cardBgColor,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  transition: "transform 0.2s, background 0.2s, border-color 0.2s",
                  position: "relative",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <h3 style={{ margin: "0", color: reminder.completed ? "#90EE90" : textColor, textDecoration: reminder.completed ? "line-through" : "none" }}>
                  {reminder.title}
                </h3>
                {reminder.description && (
                  <p style={{ margin: "0", fontSize: "14px", color: mutedTextColor }}>
                    {reminder.description}
                  </p>
                )}
                <p style={{ margin: "0", fontSize: "12px", color: mutedTextColor }}>
                  Due: {new Date(reminder.due_date).toLocaleString()}
                </p>
                <p style={{ margin: "0", fontSize: "10px", color: mutedTextColor }}>
                  Created: {new Date(reminder.created_at).toLocaleString()}
                </p>
                {reminder.updated_at && (
                  <p style={{ margin: "0", fontSize: "10px", color: mutedTextColor }}>
                    Updated: {new Date(reminder.updated_at).toLocaleString()}
                  </p>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleToggleComplete(reminder)}
                    style={{
                      padding: "8px 15px",
                      background: reminder.completed ? "#DC3545" : "#007BFF",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = reminder.completed ? "#C82333" : "#0056b3")}
                    onMouseOut={(e) => (e.currentTarget.style.background = reminder.completed ? "#DC3545" : "#007BFF")}
                  >
                    {reminder.completed ? "Unmark" : "Mark Complete"}
                  </button>
                  <button
                    onClick={() => setEditingReminder({ ...reminder, due_date: reminder.due_date ? new Date(reminder.due_date).toISOString().slice(0, 16) : "" })}
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
                    onClick={() => handleDeleteReminder(reminder.id)}
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
          message="Are you sure you want to delete this reminder? This action cannot be undone."
          onConfirm={handleDeleteReminderConfirmed}
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
