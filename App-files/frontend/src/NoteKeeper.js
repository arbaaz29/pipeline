// NoteKeeper.js
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import './App.css';

const NoteKeeper = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '', id: null });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchNotes();
    fetchMetrics();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const text = await response.text();
      setMetrics(text);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNote.title || !currentNote.content) return;

    try {
      setIsLoading(true);
      if (isEditing) {
        await fetch(`/api/notes/${currentNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: currentNote.title,
            content: currentNote.content,
          }),
        });
      } else {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: currentNote.title,
            content: currentNote.content,
          }),
        });
      }
      await fetchNotes();
      setCurrentNote({ title: '', content: '', id: null });
      setIsEditing(false);
      fetchMetrics();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      await fetchNotes();
      fetchMetrics();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setIsEditing(true);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-title">Note Keeper</div>
        <div>
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter note title"
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              placeholder="Enter note content"
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              className="textarea"
            />
          </div>
          <button
            onClick={handleSaveNote}
            disabled={isLoading}
            className="button button-primary"
          >
            {isEditing ? (
              <>
                <Save className="icon" /> Update Note
              </>
            ) : (
              <>
                <PlusCircle className="icon" /> Add Note
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid">
        {notes.map((note) => (
          <div key={note.id} className="card">
            <div className="card-title">{note.title}</div>
            <p>{note.content}</p>
            <div>
              <button
                onClick={() => handleEditNote(note)}
                className="button button-secondary"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteNote(note._id)}
                className="button button-danger"
              >
                <Trash2 className="icon" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoteKeeper;
