import { useState } from "react";

const TAGS = {
  work:     { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-400' },
  personal: { bg: 'bg-green-50',  text: 'text-green-700',  ring: 'ring-green-400' },
  idea:     { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-400' },
  urgent:   { bg: 'bg-red-50',    text: 'text-red-700',    ring: 'ring-red-400' },
};

function NoteForm({ onNoteCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('work');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const newNote = {
      title: title.trim(),
      content: content.trim() || '(no content)',
      tag,
    };
    onNoteCreated(newNote);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-12 py-9">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-semibold text-gray-800">New note</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Title
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give your note a title..."
            className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Tag
          </label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(TAGS).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setTag(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all
                  ${s.bg} ${s.text}
                  ${tag === key ? `ring-2 ${s.ring}` : 'opacity-50 hover:opacity-80'}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your note here..."
            rows={20}
            className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg outline-none resize-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>

      <div className="px-12 py-4 border-t-2 border-gray-200 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm text-gray-500 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
        >
          Save note
        </button>
      </div>
    </div>
  );
}

export default NoteForm;