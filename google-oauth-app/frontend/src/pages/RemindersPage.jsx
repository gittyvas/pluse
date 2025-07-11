// google-oauth-app/frontend/src/pages/RemindersPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RemindersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const accent = "#25D366";

  const [reminders, setReminders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDescription, setNewReminderDescription] = useState("");
  const [newReminderDueDate, setNewReminderDueDate] = useState("");
  const [editingReminder, setEditingReminder] = useState(null); // Stores reminder being edited

  const BACKEND_API_BASE_URL = "http://localhost:3000";

  // --- Fetch Reminders ---
  const fetchReminders = async () => {
    if (!isAuthenticated || !user || !user.token) { // Ensure user.token is available
      console.log("RemindersPage: Not authenticated, user missing, or token missing. Skipping fetch.");
      setDataLoading(false);
      return;
    }

    setError(null);
    setDataLoading(true);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Reminders API: Session expired or invalid token. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch reminders: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      setReminders(result.reminders || []);
      console.log("Fetched Reminders:", result.reminders);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError("Failed to load reminders. Error: " + err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) { // Only attempt to fetch once auth loading is complete
      fetchReminders();
    }
  }, [isAuthenticated, loading, user]); // Re-fetch if auth state changes

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
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newReminderTitle,
          description: newReminderDescription,
          dueDate: newReminderDueDate,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Reminders API: Session expired or invalid token. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add reminder: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      setReminders((prev) => [...prev, result.reminder].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
      setShowAddForm(false);
      setNewReminderTitle("");
      setNewReminderDescription("");
      setNewReminderDueDate("");
      console.log("Reminder added:", result.reminder);
    } catch (err) {
      console.error("Error adding reminder:", err);
      setError("Failed to add reminder. Error: " + err.message);
    }
  };

  // --- Edit Reminder ---
  const handleEditReminder = async (e) => {
    e.preventDefault();
    if (!editingReminder || !editingReminder.title || !editingReminder.dueDate) {
      setError("Title and Due Date are required for editing.");
      return;
    }

    setError(null);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders/${editingReminder.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingReminder.title,
          description: editingReminder.description,
          dueDate: editingReminder.dueDate,
          completed: editingReminder.completed,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Reminders API: Session expired or invalid token. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update reminder: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      setReminders((prev) =>
        prev.map((r) => (r.id === result.reminder.id ? result.reminder : r)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      );
      setEditingReminder(null); // Close edit form
      console.log("Reminder updated:", result.reminder);
    } catch (err) {
      console.error("Error updating reminder:", err);
      setError("Failed to update reminder. Error: " + err.message);
    }
  };

  // --- Delete Reminder ---
  const handleDeleteReminder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Reminders API: Session expired or invalid token. Logging out.");
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

  // --- Toggle Reminder Completion ---
  const handleToggleComplete = async (reminder) => {
    setError(null);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/reminders/${reminder.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !reminder.completed }),
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Reminders API: Session expired or invalid token. Logging out.");
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to toggle completion: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      setReminders((prev) =>
        prev.map((r) => (r.id === result.reminder.id ? result.reminder : r))
      );
      console.log("Reminder completion toggled:", result.reminder);
    } catch (err) {
      console.error("Error toggling completion:", err);
      setError("Failed to toggle reminder completion. Error: " + err.message);
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
          background: "#2A2E31",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}>
          <h3 style={{ color: "#FFF", marginBottom: "10px" }}>Add New Reminder</h3>
          <input
            type="text"
            placeholder="Reminder Title"
            value={newReminderTitle}
            onChange={(e) => setNewReminderTitle(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #555", background: "#333", color: "#FFF" }}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newReminderDescription}
            onChange={(e) => setNewReminderDescription(e.target.value)}
            rows="3"
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #555", background: "#333", color: "#FFF" }}
          ></textarea>
          <input
            type="datetime-local"
            value={newReminderDueDate}
            onChange={(e) => setNewReminderDueDate(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #555", background: "#333", color: "#FFF" }}
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
              background: "#555",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              marginTop: "10px"
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#777")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#555")}
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
            background: "#2A2E31",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "90%",
            maxWidth: "500px"
          }}>
            <h3 style={{ color: "#FFF", marginBottom: "10px" }}>Edit Reminder</h3>
            <input
              type="text"
              placeholder="Reminder Title"
              value={editingReminder.title}
              onChange={(e) => setEditingReminder({ ...editingReminder, title: e.target.value })}
              style={{ padding: "12px", borderRadius: "6px", border: "1px solid #555", background: "#333", color: "#FFF" }}
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={editingReminder.description}
              onChange={(e) => setEditingReminder({ ...editingReminder, description: e.target.value })}
              rows="4"
              style={{ padding: "12px", borderRadius: "6px", border: "1px solid #555", background: "#333", color: "#FFF" }}
            ></textarea>
            <input
              type="datetime-local"
              value={editingReminder.dueDate ? new Date(editingReminder.dueDate).toISOString().slice(0, 16) : ""}
              onChange={(e) => setEditingReminder({ ...editingReminder, dueDate: e.target.value })}
              style={{ padding: "12px", borderRadius: "6px", border: "1px solid #555", background: "#333", color: "#FFF" }}
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
              <label htmlFor="completed" style={{ color: "#CCC" }}>Completed</label>
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
                    background: "#555",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    marginTop: "10px"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#777")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#555")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}


        {/* Reminders List */}
        {dataLoading ? (
          <p style={{ fontSize: "1.2rem", color: "#CCC", textAlign: "center" }}>Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p style={{ fontSize: "1.2rem", color: "#CCC", textAlign: "center" }}>No reminders found. Add one above!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                style={{
                  border: `1px solid ${reminder.completed ? "#4CAF50" : "#333"}`, // Green border for completed
                  borderRadius: "8px",
                  padding: "20px",
                  background: reminder.completed ? "#1f3a2f" : "#2A2E31", // Darker green for completed
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
                <h3 style={{ margin: "0", color: reminder.completed ? "#90EE90" : "#FFF", textDecoration: reminder.completed ? "line-through" : "none" }}>
                  {reminder.title}
                </h3>
                {reminder.description && (
                  <p style={{ margin: "0", fontSize: "14px", color: "#CCC" }}>
                    {reminder.description}
                  </p>
                )}
                <p style={{ margin: "0", fontSize: "12px", color: "#AAA" }}>
                  Due: {new Date(reminder.dueDate).toLocaleString()}
                </p>
                <p style={{ margin: "0", fontSize: "10px", color: "#888" }}>
                  Created: {new Date(reminder.createdAt).toLocaleString()}
                </p>
                {reminder.updatedAt && (
                  <p style={{ margin: "0", fontSize: "10px", color: "#888" }}>
                    Updated: {new Date(reminder.updatedAt).toLocaleString()}
                  </p>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "flex-end" }}>
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
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#C82333")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#DC3545")}
                  >
                    {reminder.completed ? "Unmark" : "Mark Complete"}
                  </button>
                  <button
                    onClick={() => setEditingReminder({ ...reminder, dueDate: reminder.dueDate ? new Date(reminder.dueDate).toISOString().slice(0, 16) : "" })}
                    style={{
                      padding: "8px 15px",
                      background: "#FFC107",
                      color: "#333",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      transition: "background 0.2s",
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
      </div>
    );
  }
