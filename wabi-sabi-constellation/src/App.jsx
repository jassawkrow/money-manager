import { useEffect, useState } from 'react';
import NotesPanel from './components/NotesPanel.jsx';
import ConstellationPanel from './components/ConstellationPanel.jsx';
import { loadNotes, saveNotes, newId } from './lib/storage.js';
import { buildSeedNotes } from './lib/seedNotes.js';

export default function App() {
  const [notes, setNotes] = useState(() => {
    const stored = loadNotes();
    if (stored && stored.length) return stored;
    const seeded = buildSeedNotes();
    saveNotes(seeded);
    return seeded;
  });

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  function addNote({ title, body }) {
    setNotes((prev) => [
      { id: newId(), title, body, createdAt: Date.now() },
      ...prev,
    ]);
  }

  function updateNote(updated) {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="relative z-10 min-h-screen w-full">
      <header className="pt-12 pb-8 px-16 border-b border-ink/10">
        <div className="max-w-[1280px] mx-auto flex items-baseline justify-between">
          <div>
            <h1 className="font-serif text-3xl italic text-ink">
              Wabi Sabi Constellation
            </h1>
            <p className="font-serif text-base text-ink-faded mt-2 max-w-xl leading-relaxed">
              the notes you have written, and the threads between them you
              haven't noticed yet.
            </p>
          </div>
          <p className="font-sans text-[11px] tracking-[0.3em] uppercase text-ink-faded">
            a prototype · v0
          </p>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-16 py-12">
        <div className="grid grid-cols-2 gap-16 h-[calc(100vh-220px)]">
          <NotesPanel
            notes={notes}
            onAdd={addNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
          <div className="border-l border-ink/10 pl-16 -ml-16">
            <ConstellationPanel notes={notes} />
          </div>
        </div>
      </main>
    </div>
  );
}
