import { useState, useEffect } from 'react'
import './App.css'
import NoteCard from './components/NoteCard'
import NoteList from './components/NoteList'
import {getNotes} from './api/notes'

function App() {
  const [notes, setNotes] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      const data = await getNotes()
      setNotes(data)
    }
    fetch()
  }, [])

  return (
    <>
      <p>Notes count: {notes.length}</p>
      <div class="flex p-5">
        <NoteList notes={notes} onSelect={setSelected}/>
      </div>
      <div>
        {selected && <NoteCard note={selected}/>}
      </div>
    </>
  )
}

export default App
