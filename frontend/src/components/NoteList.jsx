import React from 'react'

function NoteList({notes, onSelect}) {
    return (
        <div>
            {notes.map(note => (
                <div key={note._id} onClick={() => onSelect(note)}>
                    {note.title}
                    </div>
            ))}
        </div>
    )
}

export default NoteList