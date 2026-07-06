import { useState } from 'react';

function relativeDate(ts) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function LibraryScreen({ notes, onDelete, onUpdate }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(note) {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditBody(note.body);
  }

  function saveEdit(note) {
    onUpdate({
      ...note,
      title: editTitle.trim() || 'untitled',
      body: editBody.trim(),
    });
    setEditingId(null);
    setExpanded(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function toggle(id) {
    setExpanded((prev) => (prev === id ? null : id));
    setEditingId(null);
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Library</h1>
        <span className="text-sm text-gray-400">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2.5 bg-gray-100 rounded-xl px-3 py-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-gray-400 shrink-0"
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10.5 10.5L13.5 13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 2L12 12M12 2L2 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">
              {search ? 'No notes match your search.' : 'No notes yet. Tap + to add one.'}
            </p>
          </div>
        ) : (
          <ul>
            {filtered.map((note) => (
              <li key={note.id} className="border-b border-gray-100 last:border-none">
                {editingId === note.id ? (
                  /* Edit mode */
                  <div className="px-5 py-4">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-sm font-semibold text-gray-900 focus:outline-none border-b border-gray-200 pb-1.5 mb-3"
                      placeholder="Title"
                      autoFocus
                    />
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={4}
                      className="w-full text-sm text-gray-600 focus:outline-none leading-relaxed"
                      placeholder="Note content…"
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => saveEdit(note)}
                        className="text-xs font-semibold text-white bg-gray-900 px-3 py-1.5 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-xs text-gray-500 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <button
                    onClick={() => toggle(note.id)}
                    className="w-full text-left px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {note.title}
                      </p>
                      <p className="text-xs text-gray-400 shrink-0">
                        {relativeDate(note.createdAt)}
                      </p>
                    </div>
                    <p
                      className={`text-sm text-gray-500 leading-relaxed ${
                        expanded === note.id ? '' : 'line-clamp-2'
                      }`}
                    >
                      {note.body || (
                        <span className="italic text-gray-300">No content</span>
                      )}
                    </p>
                    {expanded === note.id && (
                      <div
                        className="flex gap-4 mt-3 pt-3 border-t border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => startEdit(note)}
                          className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(note.id);
                            setExpanded(null);
                          }}
                          className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
