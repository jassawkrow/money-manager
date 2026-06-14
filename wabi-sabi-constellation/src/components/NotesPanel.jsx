import NoteForm from './NoteForm.jsx';
import NoteCard from './NoteCard.jsx';

export default function NotesPanel({ notes, onAdd, onUpdate, onDelete }) {
  return (
    <section className="flex flex-col h-full">
      <header className="mb-6">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-ink-faded">
          inbox
        </p>
        <h2 className="font-serif italic text-2xl text-ink mt-1">
          a small pile of half-thoughts
        </h2>
      </header>
      <NoteForm onAdd={onAdd} />
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {notes.length === 0 ? (
          <p className="font-serif italic text-ink-faded text-center mt-12">
            nothing here yet. start with anything.
          </p>
        ) : (
          notes.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
