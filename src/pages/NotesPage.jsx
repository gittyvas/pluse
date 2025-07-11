import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  const handleAddNote = () => {
    if (!newNote.title || !newNote.content) return;

    const note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString(),
    };

    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "" });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">My Notes</h1>

      <div className="space-y-2">
        <Input
          placeholder="Note title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
        />
        <Textarea
          placeholder="Note content"
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        />
        <Button onClick={handleAddNote}>Add Note</Button>
      </div>

      <div className="grid gap-4">
        {notes.length === 0 ? (
          <p className="text-gray-500 italic">This is where your notes will be stored.</p>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <h2 className="text-lg font-bold">{note.title}</h2>
                <p className="text-sm text-gray-700">{note.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Created at: {new Date(note.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPage;
