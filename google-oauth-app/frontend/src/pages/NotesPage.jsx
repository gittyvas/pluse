import React from "react";
import LocalNoteTable from "../components/LocalNoteTable";
import { Link } from "react-router-dom";

function NotesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="mb-4">
        <Link to="/dashboard" className="text-green-400 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
      <LocalNoteTable />
    </div>
  );
}

export default NotesPage;
