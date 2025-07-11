// google-oauth-app/frontend/src/components/NoteTable.jsx

import React, { useState } from 'react';
import { Pencil, Trash2, PlusCircle } from 'lucide-react'; // Icons

function NoteTable({ notes, onAdd, onEdit, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null); // For editing
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const openAddModal = () => {
    setCurrentNote(null);
    setNoteTitle('');
    setNoteContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (note) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!noteTitle || !noteContent) {
      alert('Title and content cannot be empty.');
      return;
    }

    if (currentNote) {
      await onEdit(currentNote.id, { title: noteTitle, content: noteContent });
    } else {
      await onAdd({ title: noteTitle, content: noteContent });
    }
    setIsModalOpen(false);
  };

  if (!notes || notes.length === 0) {
    return (
      <div className="p-6 bg-gray-700 rounded-lg shadow-md text-gray-300 text-center">
        No notes yet. Click the "Add Note" button to create one!
        <button
          onClick={openAddModal}
          className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center mx-auto transition-colors duration-200"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Note
        </button>

        {/* Note Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-6">{currentNote ? 'Edit Note' : 'Add New Note'}</h3>
              <input
                type="text"
                placeholder="Note Title"
                className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <textarea
                placeholder="Note Content"
                rows="6"
                className="w-full p-3 mb-6 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                >
                  {currentNote ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-end p-4 bg-gray-600">
        <button
          onClick={openAddModal}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center transition-colors duration-200"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Note
        </button>
      </div>
      <div className="divide-y divide-gray-600">
        {notes.map((note) => (
          <div key={note.id} className="p-6 hover:bg-gray-600 transition-colors duration-150">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-white">{note.title}</h3>
              <div className="flex space-x-3">
                <button onClick={() => openEditModal(note)} className="text-blue-400 hover:text-blue-300 transition-colors duration-150">
                  <Pencil className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(note.id)} className="text-red-400 hover:text-red-300 transition-colors duration-150">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-300 mb-2">{note.content}</p>
            <p className="text-xs text-gray-400">
              Created: {note.createdAt ? new Date(note.createdAt._seconds * 1000).toLocaleString() : 'N/A'}
              {note.updatedAt && note.updatedAt._seconds !== note.createdAt._seconds && (
                <span> | Updated: {new Date(note.updatedAt._seconds * 1000).toLocaleString()}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-bold text-white mb-6">{currentNote ? 'Edit Note' : 'Add New Note'}</h3>
            <input
              type="text"
              placeholder="Note Title"
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
            <textarea
              placeholder="Note Content"
              rows="6"
              className="w-full p-3 mb-6 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
              >
                {currentNote ? 'Update Note' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteTable;
