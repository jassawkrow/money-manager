import { useState } from 'react';

export default function NoteCard({ note, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);

  function save() {
    onUpdate({ ...note, title: title.trim() || 'untitled', body: body.trim() });
    setEditing(false);
  }

  function cancel() {
    setTitle(note.title);
    setBody(note.body);
    setEditing(false);
  }

  if (editing) {
    return (
      <article className="py-5 border-b border-ink/5 group">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full font-sans text-base text-ink focus:outline-none mb-2"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={Math.max(2, body.split('\n').length)}
          className="w-full font-serif text-[15px] text-ink-soft focus:outline-none leading-relaxed"
        />
        <div className="flex gap-4 mt-2 font-sans text-xs tracking-wide">
          <button onClick={save} className="text-indigo-faded hover:text-ink">
            save
          </button>
          <button
            onClick={cancel}
            className="text-ink-faded hover:text-ink"
          >
            cancel
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="py-5 border-b border-ink/5 group">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-sans text-base text-ink leading-snug">
          {note.title}
        </h3>
        <div className="font-sans text-xs tracking-wide opacity-0 group-hover:opacity-100 flex gap-3 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="text-ink-faded hover:text-indigo-faded"
          >
            edit
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-ink-faded hover:text-rose-dust"
          >
            delete
          </button>
        </div>
      </header>
      {note.body && (
        <p className="font-serif text-[15px] text-ink-soft leading-relaxed mt-1.5 whitespace-pre-wrap">
          {note.body}
        </p>
      )}
    </article>
  );
}
