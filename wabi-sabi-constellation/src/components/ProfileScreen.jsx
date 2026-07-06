import { useState } from 'react';

export default function ProfileScreen({
  profile,
  onUpdateProfile,
  apiKey,
  onUpdateKey,
  notesCount,
}) {
  const [name, setName] = useState(profile.name);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [cleared, setCleared] = useState(false);

  function saveName() {
    onUpdateProfile({ ...profile, name: name.trim() });
  }

  function saveKey() {
    onUpdateKey(keyInput.trim());
  }

  function clearAll() {
    if (!window.confirm('Delete all notes? This cannot be undone.')) return;
    onUpdateProfile({ name: '' });
    setName('');
    localStorage.clear();
    setCleared(true);
    window.location.reload();
  }

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center pb-8">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-2xl font-semibold text-gray-400">{initials}</span>
        </div>
        {profile.name && (
          <p className="text-sm text-gray-500 mt-3">{profile.name}</p>
        )}
      </div>

      {/* Settings sections */}
      <div className="px-4 space-y-6 pb-10">
        {/* Account */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
            Account
          </p>
          <div className="bg-gray-50 rounded-2xl overflow-hidden divide-y divide-gray-100">
            <div className="px-4 py-3">
              <p className="text-[11px] text-gray-400 mb-1">Name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                placeholder="Your name"
                className="w-full text-sm text-gray-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* API */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
            Anthropic API
          </p>
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="px-4 py-3">
              <p className="text-[11px] text-gray-400 mb-1">API Key</p>
              <div className="flex items-center gap-2">
                <input
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onBlur={saveKey}
                  type={showKey ? 'text' : 'password'}
                  placeholder="sk-ant-…"
                  className="flex-1 text-sm text-gray-900 focus:outline-none min-w-0"
                />
                <button
                  onClick={() => setShowKey((s) => !s)}
                  className="text-gray-400 hover:text-gray-700 shrink-0 transition-colors"
                >
                  {showKey ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M2 9C2 9 4.5 4 9 4s7 5 7 5-2.5 5-7 5S2 9 2 9Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M2 2L16 16M7.5 7.8A2 2 0 0011.2 11M5 5C3.4 6.2 2 7.8 2 9c0 0 2.5 5 7 5a7 7 0 002.7-.6M8 4.1C8.3 4 8.6 4 9 4c4.5 0 7 5 7 5a11 11 0 01-2 2.7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                Stored only in this browser. Never sent anywhere except Anthropic.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
            Stats
          </p>
          <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">Notes saved</p>
            <p className="text-sm font-semibold text-gray-900">{notesCount}</p>
          </div>
        </div>

        {/* Danger */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
            Data
          </p>
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <button
              onClick={clearAll}
              className="w-full px-4 py-3 text-sm text-red-500 text-left hover:bg-gray-100 transition-colors"
            >
              Delete all notes
            </button>
          </div>
        </div>

        <p className="text-[11px] text-gray-300 text-center">v0.2 · prototype</p>
      </div>
    </div>
  );
}
