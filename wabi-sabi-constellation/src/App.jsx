import { useEffect, useState } from 'react';
import HomeScreen from './components/HomeScreen.jsx';
import LibraryScreen from './components/LibraryScreen.jsx';
import ProfileScreen from './components/ProfileScreen.jsx';
import AddNoteModal from './components/AddNoteModal.jsx';
import BottomNav from './components/BottomNav.jsx';
import { loadNotes, saveNotes, newId } from './lib/storage.js';
import { buildSeedNotes } from './lib/seedNotes.js';
import { getStoredKey, setStoredKey } from './lib/claude.js';

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem('wsc.profile.v1')) || { name: '' };
  } catch {
    return { name: '' };
  }
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [notes, setNotes] = useState(() => {
    const stored = loadNotes();
    if (stored && stored.length) return stored;
    const seeded = buildSeedNotes();
    saveNotes(seeded);
    return seeded;
  });
  const [showAdd, setShowAdd] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredKey);
  const [profile, setProfile] = useState(loadProfile);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('wsc.profile.v1', JSON.stringify(profile));
  }, [profile]);

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

  function handleUpdateKey(key) {
    setApiKey(key);
    setStoredKey(key);
  }

  return (
    <div className="h-full flex items-start justify-center">
      <div className="w-full max-w-[430px] h-full flex flex-col bg-white shadow-2xl overflow-hidden relative">
        {/* Active screen */}
        <div className="flex-1 overflow-hidden">
          {tab === 'home' && (
            <HomeScreen
              notes={notes}
              apiKey={apiKey}
              profileName={profile.name}
            />
          )}
          {tab === 'library' && (
            <LibraryScreen
              notes={notes}
              onDelete={deleteNote}
              onUpdate={updateNote}
            />
          )}
          {tab === 'profile' && (
            <ProfileScreen
              profile={profile}
              onUpdateProfile={setProfile}
              apiKey={apiKey}
              onUpdateKey={handleUpdateKey}
              notesCount={notes.length}
            />
          )}
        </div>

        {/* Bottom nav */}
        <BottomNav active={tab} onChange={setTab} onAdd={() => setShowAdd(true)} />

        {/* Add note modal */}
        {showAdd && (
          <AddNoteModal
            onSave={(note) => {
              addNote(note);
              setShowAdd(false);
            }}
            onClose={() => setShowAdd(false)}
          />
        )}
      </div>
    </div>
  );
}
