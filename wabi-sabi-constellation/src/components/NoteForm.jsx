import { useState } from 'react';

export default function NoteForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function submit(e) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t && !b) return;
    onAdd({ title: t || 'untitled', body: b });
    setTitle('');
    setBody('');
  }

  return (
    <form
      onSubmit={submit}
      className="border-b border-ink/10 pb-6 mb-6"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="a title, or a fragment"
        className="w-full font-sans text-lg text-ink placeholder:text-ink-faded/60 focus:outline-none mb-2"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="and what's underneath it…"
        rows={2}
        className="w-full font-serif text-base text-ink-soft placeholder:text-ink-faded/60 focus:outline-none leading-relaxed"
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          className="font-sans text-sm text-indigo-faded hover:text-ink tracking-wide"
        >
          add to inbox →
        </button>
      </div>
    </form>
  );
}
