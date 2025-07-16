// src/components/NotesTable.jsx
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NotesTable() {
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const navigate = useNavigate();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("localNotes");
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("localNotes", JSON.stringify(notes));
  }, [notes]);

  const openModal = (note = null) => {
    setIsModalOpen(true);
    setCurrentNoteId(note?.id || null);
    setNoteTitle(note?.title || "");
    setNoteContent(note?.content || "");
  };

  const handleSave = () => {
    if (!noteTitle || !noteContent) return alert("Title and content are required");

    const now = new Date().toISOString();
    if (currentNoteId) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === currentNoteId
            ? { ...note, title: noteTitle, content: noteContent, updated_at: now }
            : note
        )
      );
    } else {
      const newNote = {
        id: Date.now(),
        title: noteTitle,
        content: noteContent,
        created_at: now,
        updated_at: now,
      };
      setNotes((prev) => [newNote, ...prev]);
    }

    setIsModalOpen(false);
    setNoteTitle("");
    setNoteContent("");
    setCurrentNoteId(null);
  };

  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-white text-2xl font-bold">Notes</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-2 text-green-400 hover:text-green-300 underline text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
        <button
          onClick={() => openModal()}
          className="text-white bg-green-600 px-4 py-2 rounded flex items-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-300">No notes found.</p>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="bg-gray-700 p-4 mb-3 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-semibold text-lg">{note.title}</h3>
                <p className="text-gray-300">{note.content}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Updated: {new Date(note.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => openModal(note)} className="text-green-400 hover:text-green-300">
                  <Pencil />
                </button>
                <button onClick={() => handleDelete(note.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-white text-xl mb-4">{currentNoteId ? "Edit Note" : "Add Note"}</h3>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note Title"
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <textarea
              rows="4"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Note Content"
              className="w-full mb-4 p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">
                {currentNoteId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesTable;
