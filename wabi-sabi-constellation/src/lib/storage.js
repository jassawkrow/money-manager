const KEY = 'wsc.notes.v1';

export function loadNotes() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveNotes(notes) {
  localStorage.setItem(KEY, JSON.stringify(notes));
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
