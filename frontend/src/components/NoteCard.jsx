import { useEffect, useMemo, useState } from "react";

const TAGS = {
  work: {
    label: "Work",
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-400",
  },
  personal: {
    label: "Personal",
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-400",
  },
  idea: {
    label: "Idea",
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-400",
  },
  urgent: {
    label: "Urgent",
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-400",
  },
};

const TAG_LIST = ["work", "personal", "idea", "urgent"];

const getErrorMessage = (error) =>
  error?.error || error?.message || "Could not save yet. Your changes are still here.";

function NoteCard({ note, onDelete, onEdit }) {
  const draftKey = useMemo(() => `notes:edit-draft:${note._id}`, [note._id]);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tag, setTag] = useState(note.tag);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTag(note.tag);
    setEditing(false);
    setSaving(false);
    setDeleting(false);
    setSaveError("");
  }, [note._id, note.content, note.tag, note.title]);

  useEffect(() => {
    if (!editing) return;

    const savedDraft = localStorage.getItem(draftKey);
    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft);
      setTitle(parsed.title || "");
      setContent(parsed.content || "");
      setTag(parsed.tag || "work");
    } catch {
      localStorage.removeItem(draftKey);
    }
  }, [draftKey, editing]);

  useEffect(() => {
    if (!editing) return;

    const changed =
      title !== note.title || content !== note.content || tag !== note.tag;
    if (!changed) {
      localStorage.removeItem(draftKey);
      return;
    }

    localStorage.setItem(
      draftKey,
      JSON.stringify({ title, content, tag, savedAt: new Date().toISOString() }),
    );
  }, [content, draftKey, editing, note.content, note.tag, note.title, tag, title]);

  const tagStyle = TAGS[tag] || TAGS.work;

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    setSaveError("");
    try {
      await onEdit({ ...note, title: title.trim(), content: content.trim(), tag });
      localStorage.removeItem(draftKey);
      setEditing(false);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setSaveError("");
    try {
      await onDelete(note._id);
    } catch (error) {
      setSaveError(getErrorMessage(error));
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setTag(note.tag);
    setSaveError("");
    setEditing(false);
    localStorage.removeItem(draftKey);
  };

  if (editing) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-12 py-9">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-gray-800">Edit note</h2>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-gray-400 hover:text-gray-600 disabled:text-gray-300 text-xl px-2"
              aria-label="Close editor"
            >
              x
            </button>
          </div>

          {saveError ? (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {saveError} If Render is waking up, try Save again in a moment.
            </div>
          ) : null}

          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Tag
            </label>
            <div className="flex gap-2 flex-wrap">
              {TAG_LIST.map((t) => {
                const s = TAGS[t];
                return (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    disabled={saving}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all
                      ${s.bg} ${s.text}
                      ${tag === t ? `ring-2 ${s.ring}` : "opacity-50 hover:opacity-80"}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg outline-none resize-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        <div className="px-12 py-4 border-t-2 border-gray-200 flex gap-3">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 py-2.5 text-sm text-gray-500 border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-12 py-9">
        {saveError ? (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {saveError}
          </div>
        ) : null}

        <span
          className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-5 ${tagStyle.bg} ${tagStyle.text}`}
        >
          {tagStyle.label}
        </span>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 leading-snug">
          {note.title}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {new Date(note.createdAt).toLocaleDateString("en-NZ", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <hr className="border-t-2 border-gray-100 mb-6" />
        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {note.content}
        </div>
      </div>

      <div className="px-12 py-4 border-t-2 border-gray-200 flex items-center gap-3">
        <button
          onClick={() => setEditing(true)}
          disabled={deleting}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 disabled:text-gray-300 disabled:border-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default NoteCard;
