import React, { useEffect, useState } from "react";
import axios from "axios";
import NoteTable from "../components/NoteTable";

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/notes", {
        withCredentials: true, // Important for cookie-based auth
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (newNote) => {
    try {
      const res = await axios.post("/api/notes", newNote, {
        withCredentials: true,
      });
      setNotes((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  const handleEditNote = async (noteId, updatedNote) => {
    try {
      const res = await axios.put(`/api/notes/${noteId}`, updatedNote, {
        withCredentials: true,
      });
      setNotes((prev) =>
        prev.map((note) => (note.id === noteId ? res.data : note))
      );
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`/api/notes/${noteId}`, {
        withCredentials: true,
      });
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-4">My Notes</h2>
      {loading ? (
        <p className="text-gray-300">Loading...</p>
      ) : (
        <NoteTable
          notes={notes}
          onAdd={handleAddNote}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      )}
    </div>
  );
}

export default NotesPage;
