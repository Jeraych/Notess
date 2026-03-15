const TAGS = {
  work:     { label: 'Work',     bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  personal: { label: 'Personal', bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  idea:     { label: 'Idea',     bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  urgent:   { label: 'Urgent',   bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
};

function NoteList({ notes, onSelectNote, selectedNoteId }) {
  return (
    <div className="flex flex-col gap-0.5 p-2">
      {notes.map(note => {
        const tag = TAGS[note.tag] || TAGS.work;
        const isActive = note._id === selectedNoteId;
        return (
          <div
            key={note._id}
            onClick={() => onSelectNote(note)}
            className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors border
              ${isActive
                ? 'bg-white border-gray-300 shadow-sm'
                : 'border-transparent hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tag.dot}`} />
              <span className="text-sm font-medium text-gray-800 truncate">{note.title}</span>
            </div>
            <p className="text-xs text-gray-400 truncate pl-4">{note.content?.split('\n')[0]}</p>
            <p className="text-xs text-gray-300 mt-0.5 pl-4">
                {new Date(note.createdAt).toLocaleDateString('en-NZ', {
                    month: 'short', day: 'numeric', year: 'numeric'
                })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default NoteList;