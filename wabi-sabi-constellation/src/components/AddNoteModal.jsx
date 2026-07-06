import { useRef, useState } from 'react';

const hasVoiceSupport = !!(
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)
);

export default function AddNoteModal({ onSave, onClose }) {
  const [mode, setMode] = useState('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const canSave = title.trim() || body.trim();

  function save() {
    if (!canSave) return;
    onSave({ title: title.trim() || 'untitled', body: body.trim() });
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let finalText = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
      }
      if (finalText) setBody(finalText.trim());
    };
    r.onerror = () => stopRecording();
    r.onend = () => setRecording(false);
    r.start();
    recognitionRef.current = r;
    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  function switchMode(m) {
    stopRecording();
    setMode(m);
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-[430px] mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-14 pb-4 border-b border-gray-100">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-900 w-16 transition-colors"
        >
          Cancel
        </button>

        {/* Mode toggle */}
        <div className="flex rounded-xl bg-gray-100 p-0.5">
          <button
            onClick={() => switchMode('note')}
            className={`px-4 py-1.5 rounded-[10px] text-sm font-medium transition-all ${
              mode === 'note' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Note
          </button>
          <button
            onClick={() => switchMode('voice')}
            className={`px-4 py-1.5 rounded-[10px] text-sm font-medium transition-all ${
              mode === 'voice' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Voice
          </button>
        </div>

        <button
          onClick={save}
          disabled={!canSave}
          className="text-sm font-semibold text-gray-900 disabled:text-gray-300 w-16 text-right transition-colors"
        >
          Save
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'note' ? (
          <div className="px-5 pt-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              autoFocus
              className="w-full text-xl font-semibold text-gray-900 placeholder-gray-300 focus:outline-none mb-4"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Start writing…"
              className="w-full text-base text-gray-700 placeholder-gray-300 focus:outline-none leading-relaxed"
              style={{ minHeight: '320px' }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 pt-16 pb-8 gap-8">
            {!hasVoiceSupport ? (
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">
                  Voice notes require Chrome or Edge.
                </p>
                <p className="text-gray-400 text-xs">
                  Switch to Note mode to type instead.
                </p>
              </div>
            ) : (
              <>
                {/* Record button */}
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    recording
                      ? 'bg-red-500 text-white shadow-xl shadow-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {recording ? (
                    /* Stop icon */
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
                      <rect x="7" y="7" width="14" height="14" rx="2" />
                    </svg>
                  ) : (
                    /* Mic icon */
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect
                        x="12"
                        y="4"
                        width="8"
                        height="16"
                        rx="4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M7 16a9 9 0 0018 0"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16 25v4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>

                <p className="text-sm text-gray-500">
                  {recording ? 'Recording — tap to stop' : 'Tap to start recording'}
                </p>

                {/* Transcript */}
                {body && (
                  <div className="w-full space-y-4">
                    <div className="w-full bg-gray-50 rounded-2xl px-4 py-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
                    </div>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give it a title…"
                      className="w-full text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none border-b border-gray-200 pb-2"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
