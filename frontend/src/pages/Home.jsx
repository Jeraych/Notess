import { useState, useEffect } from "react";
import { getNotes, createNote, updateNote, deleteNote } from "../api/notes";
import { getUser, removeToken } from "../api/auth";
import NoteList from "../components/NoteList";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";

function Home({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = getUser(); // reads from JWT in localStorage

  useEffect(() => {
    getNotes()
      .then((data) => setNotes(data))
      .catch(() => setError("Failed to load notes"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    removeToken();
    onLogout();
  };

  const handleNoteCreated = async (note) => {
    const created = await createNote(note);
    setNotes((prev) => [created, ...prev]);
    setSelected(created);
    setShowForm(false);
  };

  const handleEdit = async (updatedNote) => {
    const saved = await updateNote(updatedNote._id, updatedNote);
    setNotes((prev) => prev.map((n) => (n._id === saved._id ? saved : n)));
    setSelected(saved);
  };

  const handleDelete = async (_id) => {
    await deleteNote(_id);
    setNotes((prev) => prev.filter((n) => n._id !== _id));
    setSelected(null);
  };

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen w-full items-center justify-center text-red-400">
        {error}
      </div>
    );

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Sidebar */}
      <aside className="w-64 min-w-64 flex flex-col border-r-2 border-gray-200 bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b-2 border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              My Notes
            </h1>
            <span className="text-xs text-gray-300">{notes.length} notes</span>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setSelected(null);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-white transition-colors"
          >
            + New note
          </button>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto">
          <NoteList
            notes={notes}
            onSelectNote={(n) => {
              setSelected(n);
              setShowForm(false);
            }}
            selectedNoteId={selectedNote?._id}
          />
        </div>

        {/* User footer */}
        <div className="p-4 border-t-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-600">
                {user?.username?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">
              {user?.username ?? "User"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {showForm ? (
          <NoteForm
            onNoteCreated={handleNoteCreated}
            onCancel={() => setShowForm(false)}
          />
        ) : selectedNote ? (
          <NoteCard
            note={selectedNote}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="opacity-30"
            >
              <rect x="6" y="3" width="24" height="30" rx="3" />
              <line x1="12" y1="12" x2="24" y2="12" />
              <line x1="12" y1="18" x2="24" y2="18" />
              <line x1="12" y1="24" x2="18" y2="24" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No note open</p>
            <p className="text-sm">Select a note or create a new one</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
