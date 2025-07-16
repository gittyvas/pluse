import React from "react";
import NoteTable from "../components/NoteTable";

function NotesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <h1 className="text-2xl font-semibold mb-4">Notes</h1>
      <NoteTable />
    </div>
  );
}

export default NotesPage;
