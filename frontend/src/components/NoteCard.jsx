import React from 'react'

function NoteCard({note}) {
    return (
        <div>
            <p>{note.content}</p>
        </div>
    )
}

export default NoteCard