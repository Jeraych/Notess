import { useState, useEffect } from "react";
import { getNotes, createNote, updateNote, deleteNote } from "../api/notes";
import NoteList from "../components/NoteList";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";

// const INITIAL_NOTES = [
//   { _id: 1, title: 'Sprint planning notes', tag: 'work',     date: 'Mar 14, 2026', content: 'Kick off the new sprint cycle. Assign tickets to frontend and backend teams. Review blockers from last sprint.\n\nPriority items:\n- Auth flow refactor\n- Notification service\n- Dashboard v2 wireframes' },
//   { _id: 2, title: 'Weekend trip ideas',    tag: 'personal', date: 'Mar 12, 2026', content: 'Thinking about a long weekend somewhere quiet. Maybe Queenstown or Wanaka.\n\nThings to book:\n- Accommodation\n- Rental car\n- Hiking gear rental' },
//   { _id: 3, title: 'Focus timer app concept', tag: 'idea',   date: 'Mar 10, 2026', content: 'A minimal focus timer that blocks distracting sites and tracks sessions.\n\nKey screens:\n- Timer\n- Session history\n- Settings' },
//   { _id: 4, title: 'Fix prod auth bug',     tag: 'urgent',   date: 'Mar 9, 2026',  content: 'JWT tokens expiring early in Safari. Need to investigate cookie SameSite settings and token refresh logic.' },
// ];

function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotes()
      .then(data => setNotes(data))
      .finally(() => setLoading(false));
  }, []);

  const handleNoteCreated = async (note) => {
    const created = await createNote(note);
    setNotes(prev => [created, ...prev]);
    setSelected(created);
    setShowForm(false);
  };

  const handleEdit = async (updatedNote) => {
    const saved = await updateNote(updatedNote._id, updatedNote);
    setNotes(prev => prev.map(n => n._id === saved._id ? saved : n));
    setSelected(saved);
  };

  const handleDelete = async (_id) => {
    await deleteNote(_id);
    setNotes(prev => prev.filter(n => n._id !== _id));
    setSelected(null);
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-white">

      {/* Sidebar */}
      <aside className="w-64 min-w-64 flex flex-col border-r-2 border-gray-200 bg-gray-50">
        <div className="p-4 border-b-2 border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">My Notes</h1>
            <span className="text-xs text-gray-300">{notes.length} notes</span>
          </div>
          <button
            onClick={() => { setShowForm(true); setSelected(null); }}
            className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-white transition-colors"
          >
            + New note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NoteList
            notes={notes}
            onSelectNote={(n) => { setSelected(n); setShowForm(false); }}
            selectedNoteId={selectedNote?._id}
          />
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
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30">
              <rect x="6" y="3" width="24" height="30" rx="3"/>
              <line x1="12" y1="12" x2="24" y2="12"/>
              <line x1="12" y1="18" x2="24" y2="18"/>
              <line x1="12" y1="24" x2="18" y2="24"/>
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