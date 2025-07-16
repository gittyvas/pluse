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
  // We no longer need `user.token` on the frontend for auth, as it's cookie-based.
  // `isAuthenticated` and `loading` from useAuth are sufficient for UI state.
  const { isAuthenticated, loading, logout, theme } = useAuth();
  const accent = "#25D366";

  const [reminders, setReminders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDescription, setNewReminderDescription] = useState(""); // Add description state
  const [newReminderDueDate, setNewReminderDueDate] = useState("");
  const [editingReminder, setEditingReminder] = useState(null); // Stores reminder being edited
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [reminderToDeleteId, setReminderToDeleteId] = useState(null);


  // Use environment variable for backend URL
  const BACKEND_API_BASE_URL = import.meta.env.VITE_API_URL;

  // Theme colors (consistent with other pages)
  const bgColor = theme === 'dark' ? "#1A222A" : "#F8FBF8";
  const textColor = theme === 'dark' ? "#E0E6EB" : "#303030";
  const cardBgColor = theme === 'dark' ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)";
  const cardBorderColor = theme === 'dark' ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === 'dark' ? "#A0A8B0" : "#606060";


  // --- Fetch Reminders ---
  const fetchReminders = useCallback(async () => {
    // Only proceed if authenticated and not currently loading auth state
    if (!isAuthenticated || loading) {
      console.log("RemindersPage: Not authenticated or auth still loading. Skipping fetch.");
      setDataLoading(false);
      return;
    }

    setError(null);
    setDataLoading(true);
    try {
      console.log("RemindersPage: Attempting to fetch reminders from backend.");
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders`, {
        method: "GET",
        credentials: "include", // CRITICAL: Ensures HTTP-only cookie is sent
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${user.token}`, // REMOVED: No longer needed for cookie-based auth
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Reminders API: Session expired or unauthorized. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch reminders: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      // Backend's remindersController returns an array directly, not { reminders: [...] }
      setReminders(result || []);
      console.log("Fetched Reminders:", result);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError("Failed to load reminders. Error: " + err.message);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, loading, logout, BACKEND_API_BASE_URL]); // Added BACKEND_API_BASE_URL to dependencies

  useEffect(() => {
    if (!loading && isAuthenticated) { // Only attempt to fetch once auth loading is complete AND authenticated
      fetchReminders();
    }
  }, [isAuthenticated, loading, fetchReminders]);


  // --- Add Reminder ---
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminderTitle || !newReminderDueDate) {
      setError("Title and Due Date are required.");
      return;
    }

    setError(null);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders`, {
        method: "POST",
        credentials: "include", // CRITICAL: Ensures HTTP-only cookie is sent
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${user.token}`, // REMOVED
        },
        body: JSON.stringify({
          title: newReminderTitle,
          // Backend's remindersController expects 'due_date' or 'dueDate'
          // Let's stick to 'due_date' for consistency with MySQL snake_case if possible,
          // or ensure backend maps it. For now, using 'due_date'
          due_date: newReminderDueDate, // Changed to snake_case for backend consistency
          description: newReminderDescription, // Added description
        }),
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Reminders API: Session expired or invalid. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add reminder: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      // Assuming backend returns the created reminder object directly
      setReminders((prev) => [...prev, result].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))); // Sort by due_date
      setShowAddForm(false);
      setNewReminderTitle("");
      setNewReminderDescription("");
      setNewReminderDueDate("");
      console.log("Reminder added:", result);
    } catch (err) {
      console.error("Error adding reminder:", err);
      setError("Failed to add reminder. Error: " + err.message);
    }
  };

  // --- Edit Reminder ---
  const handleEditReminder = async (e) => {
    e.preventDefault();
    if (!editingReminder || !editingReminder.title || !editingReminder.due_date) { // Changed to due_date
      setError("Title and Due Date are required for editing.");
      return;
    }

    setError(null);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders/${editingReminder.id}`, {
        method: "PUT",
        credentials: "include", // CRITICAL: Ensures HTTP-only cookie is sent
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${user.token}`, // REMOVED
        },
        body: JSON.stringify({
          title: editingReminder.title,
          due_date: editingReminder.due_date, // Changed to due_date
          // The backend controller for reminders only updates title and due_date.
          // If you want to update description and completed, the backend controller needs modification.
          // For now, we only send what the backend expects.
          // description: editingReminder.description, // Not supported by current backend controller
          completed: editingReminder.completed, // Not supported by current backend controller
        }),
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Reminders API: Session expired or invalid. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update reminder: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Assuming backend returns the updated reminder object directly
      const result = await response.json();
      setReminders((prev) =>
        prev.map((r) => (r.id === result.id ? result : r)).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)) // Sort by due_date
      );
      setEditingReminder(null); // Close edit form
      console.log("Reminder updated:", result);
    } catch (err) {
      console.error("Error updating reminder:", err);
      setError("Failed to update reminder. Error: " + err.message);
    }
  };

  // --- Delete Reminder ---
  const handleDeleteReminderConfirmed = async () => {
    const id = reminderToDeleteId;
    setShowDeleteConfirmModal(false); // Close modal
    setReminderToDeleteId(null); // Clear ID

    setError(null);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders/${id}`, {
        method: "DELETE",
        credentials: "include", // CRITICAL: Ensures HTTP-only cookie is sent
        headers: {
          // "Authorization": `Bearer ${user.token}`, // REMOVED
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Reminders API: Session expired or invalid. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete reminder: ${response.status} ${response.statusText} - ${errorText}`);
      }

      setReminders((prev) => prev.filter((r) => r.id !== id));
      console.log("Reminder deleted:", id);
    } catch (err) {
      console.error("Error deleting reminder:", err);
      setError("Failed to delete reminder. Error: " + err.message);
    }
  };

  const handleDeleteReminder = (id) => {
    setReminderToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  // --- Toggle Reminder Completion (Backend does not support 'completed' field in PUT for reminders) ---
  // This function will need backend support to actually persist completion status.
  // The current backend remindersController.js only updates title and due_date.
  // For now, this will only update local state.
  const handleToggleComplete = async (reminder) => {
    setError(null);
    // Optimistic UI update
    setReminders((prev) =>
      prev.map((r) => (r.id === reminder.id ? { ...r, completed: !r.completed } : r))
    );
    console.warn("Toggle completion is currently frontend-only. Backend does not support 'completed' field for reminders.");

    // If you want to persist this, you need to update backend/controllers/remindersController.js
    // to include 'completed' in its UPDATE query.
    /*
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders/${reminder.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reminder.title, // Send existing title
          due_date: reminder.due_date, // Send existing due_date
          completed: !reminder.completed // Send the new completion status
        }),
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to toggle completion: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const result = await response.json();
      setReminders((prev) => prev.map((r) => (r.id === result.id ? result : r)));
      console.log("Reminder completion toggled:", result);
    } catch (err) {
      console.error("Error toggling completion:", err);
      setError("Failed to toggle reminder completion. Error: " + err.message);
      // Revert optimistic update if API call fails
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, completed: !r.completed } : r))
      );
    }
    */
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
    <div style={{ background: bgColor, color: textColor, minHeight: "100vh", padding: "32px", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "30px", color: accent }}>Your Reminders</h1>

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

      {/* Add Reminder Button / Form */}
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: "10px 20px",
            background: accent,
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.2s",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#20B2AA")}
          onMouseOut={(e) => (e.currentTarget.style.background = accent)}
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
              background: accent,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#20B2AA")}
            onMouseOut={(e) => (e.currentTarget.style.background = accent)}
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
              value={editingReminder.due_date ? new Date(editingReminder.due_date).toISOString().slice(0, 16) : ""} // Use due_date
              onChange={(e) => setEditingReminder({ ...editingReminder, due_date: e.target.value })} // Use due_date
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
                  background: accent,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#20B2AA")}
                onMouseOut={(e) => (e.currentTarget.style.background = accent)}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingReminder(null)} // Close modal
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
                  border: `1px solid ${reminder.completed ? "#4CAF50" : cardBorderColor}`, // Green border for completed
                  borderRadius: "8px",
                  padding: "20px",
                  background: reminder.completed ? "linear-gradient(145deg, #2A3D2A, #1F281F)" : cardBgColor, // Darker green for completed
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
          accentColor="#DC3545" // Red for delete
          cardBgColor={cardBgColor}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
          cardBorderColor={cardBorderColor}
        />
      )}
    </div>
  );
}
