import { useCallback, useEffect, useState } from "react";
import { getNotes, createNote, updateNote, deleteNote } from "../api/notes";
import { getUser, removeToken } from "../api/auth";
import NoteList from "../components/NoteList";
import NoteCard from "../components/NoteCard";
import NoteForm from "../components/NoteForm";

const getErrorMessage = (error) =>
  error?.error || error?.message || "The backend did not respond. Your draft was kept locally.";

function Home({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadHint, setLoadHint] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [deletedNote, setDeletedNote] = useState(null);
  const [restoringDelete, setRestoringDelete] = useState(false);

  const user = getUser(); // reads from JWT in localStorage

  useEffect(() => {
    const hintTimer = setTimeout(() => setLoadHint(true), 1800);

    getNotes()
      .then((data) => {
        setNotes(data);
        setError(null);
      })
      .catch(() =>
        setError(
          "Failed to load notes. If the Render backend is waking up, refresh in a moment.",
        ),
      )
      .finally(() => {
        clearTimeout(hintTimer);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (syncStatus?.type !== "success") return undefined;

    const timer = setTimeout(() => setSyncStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [syncStatus]);

  const handleLogout = () => {
    removeToken();
    onLogout();
  };

  const handleNoteCreated = async (note) => {
    setSyncStatus({
      type: "saving",
      message: "Saving note. If Render is waking up, this can take a few seconds.",
    });

    try {
      const created = await createNote(note);
      setNotes((prev) => [created, ...prev]);
      setSelected(created);
      setShowForm(false);
      setDeletedNote(null);
      setSyncStatus({ type: "success", message: "Note saved." });
      return created;
    } catch (error) {
      setSyncStatus({ type: "error", message: getErrorMessage(error) });
      throw error;
    }
  };

  const handleEdit = async (updatedNote) => {
    setSyncStatus({
      type: "saving",
      message: "Saving changes. If Render is waking up, this can take a few seconds.",
    });

    try {
      const saved = await updateNote(updatedNote._id, updatedNote);
      setNotes((prev) => prev.map((n) => (n._id === saved._id ? saved : n)));
      setSelected(saved);
      setDeletedNote(null);
      setSyncStatus({ type: "success", message: "Changes saved." });
      return saved;
    } catch (error) {
      setSyncStatus({ type: "error", message: getErrorMessage(error) });
      throw error;
    }
  };

  const handleDelete = async (_id) => {
    const deleted = notes.find((note) => note._id === _id);
    setSyncStatus({
      type: "saving",
      message: "Deleting note. If Render is waking up, this can take a few seconds.",
    });

    try {
      await deleteNote(_id);
      setNotes((prev) => prev.filter((n) => n._id !== _id));
      setSelected(null);
      setDeletedNote(deleted || null);
      setSyncStatus({ type: "success", message: "Note deleted." });
    } catch (error) {
      setSyncStatus({ type: "error", message: getErrorMessage(error) });
      throw error;
    }
  };

  const restoreDeletedNote = useCallback(async () => {
    if (!deletedNote || restoringDelete) return;

    setRestoringDelete(true);
    setSyncStatus({
      type: "saving",
      message: "Restoring deleted note...",
    });

    try {
      const restored = await createNote({
        title: deletedNote.title,
        content: deletedNote.content,
        tag: deletedNote.tag,
      });
      setNotes((prev) => [restored, ...prev]);
      setSelected(restored);
      setDeletedNote(null);
      setSyncStatus({ type: "success", message: "Note restored." });
    } catch (error) {
      setSyncStatus({
        type: "error",
        message: `Could not restore note: ${getErrorMessage(error)}`,
      });
    } finally {
      setRestoringDelete(false);
    }
  }, [deletedNote, restoringDelete]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isEditingText =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "z" &&
        !isEditingText &&
        deletedNote
      ) {
        event.preventDefault();
        restoreDeletedNote();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deletedNote, restoreDeletedNote]);

  const syncStatusClasses = {
    saving: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-amber-200 bg-amber-50 text-amber-800",
  };

  if (loading)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-gray-400">
        <p>Loading...</p>
        {loadHint ? (
          <p className="text-sm text-gray-500">
            Waking the secure backend. This is normal after idle time.
          </p>
        ) : null}
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen w-full items-center justify-center px-6 text-center text-red-400">
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
        {syncStatus ? (
          <div
            className={`mx-12 mt-5 rounded-lg border px-4 py-3 text-sm ${
              syncStatusClasses[syncStatus.type]
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span>{syncStatus.message}</span>
            </div>
          </div>
        ) : null}

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
