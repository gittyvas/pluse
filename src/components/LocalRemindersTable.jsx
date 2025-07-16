// src/components/RemindersTable.jsx
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function RemindersTable() {
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [currentReminderId, setCurrentReminderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("localReminders");
    if (stored) setReminders(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("localReminders", JSON.stringify(reminders));
  }, [reminders]);

  const openModal = (reminder = null) => {
    setIsModalOpen(true);
    setCurrentReminderId(reminder?.id || null);
    setReminderText(reminder?.text || "");
    setReminderTime(reminder?.time || "");
  };

  const handleSave = () => {
    if (!reminderText || !reminderTime) return alert("Text and time are required");

    const now = new Date().toISOString();
    if (currentReminderId) {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === currentReminderId
            ? { ...r, text: reminderText, time: reminderTime, updated_at: now }
            : r
        )
      );
    } else {
      const newReminder = {
        id: Date.now(),
        text: reminderText,
        time: reminderTime,
        created_at: now,
        updated_at: now,
      };
      setReminders((prev) => [newReminder, ...prev]);
    }

    setIsModalOpen(false);
    setReminderText("");
    setReminderTime("");
    setCurrentReminderId(null);
  };

  const handleDelete = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-white text-2xl font-bold">Reminders</h2>
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
          <PlusCircle className="w-5 h-5 mr-2" /> Add Reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <p className="text-gray-300">No reminders found.</p>
      ) : (
        reminders.map((r) => (
          <div key={r.id} className="bg-gray-700 p-4 mb-3 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-semibold text-lg">{r.text}</h3>
                <p className="text-gray-300">Remind At: {r.time}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Updated: {new Date(r.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => openModal(r)} className="text-green-400 hover:text-green-300">
                  <Pencil />
                </button>
                <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300">
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
            <h3 className="text-white text-xl mb-4">{currentReminderId ? "Edit" : "Add"} Reminder</h3>
            <input
              type="text"
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              placeholder="Reminder Text"
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <input
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full mb-4 p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">
                {currentReminderId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RemindersTable;
