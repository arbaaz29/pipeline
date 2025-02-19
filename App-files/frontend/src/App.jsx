import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

const NoteKeeper = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '', id: null });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError('Failed to load notes');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNote.title || !currentNote.content) return;

    try {
      setIsLoading(true);
      if (isEditing) {
        const response = await fetch(`/api/notes/${currentNote._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: currentNote.title,
            content: currentNote.content,
          }),
        });
        if (!response.ok) throw new Error('Failed to update note');
        await fetchNotes();
      } else {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: currentNote.title,
            content: currentNote.content,
          }),
        });
        if (!response.ok) throw new Error('Failed to create note');
        await fetchNotes();
      }

      setCurrentNote({ title: '', content: '', id: null });
      setIsEditing(false);
    } catch (err) {
      setError(isEditing ? 'Failed to update note' : 'Failed to create note');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete note');
      await fetchNotes();
    } catch (err) {
      setError('Failed to delete note');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setIsEditing(true);
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-red-500">
        Error: {error}
        <button 
          onClick={() => {
            setError(null);
            fetchNotes();
          }}
          className="ml-4 text-blue-500 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Note Keeper</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Note Title"
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <textarea
              placeholder="Note Content"
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              className="w-full p-2 border rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSaveNote}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
              {isEditing ? 'Update Note' : 'Add Note'}
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map(note => (
          <Card key={note._id} className="relative">
            <CardHeader>
              <CardTitle className="text-lg">{note.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{note.content}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEditNote(note)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNote(note._id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NoteKeeper;