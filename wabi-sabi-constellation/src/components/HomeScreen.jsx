import { useEffect, useRef, useState } from 'react';
import { streamChat } from '../lib/claude.js';

const SUGGESTIONS = [
  'What patterns do you see across my notes?',
  'What should I focus on or explore next?',
  'Find unexpected connections between my notes.',
];

function getGreeting(name) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${g}, ${name.split(' ')[0]}.` : `${g}.`;
}

export default function HomeScreen({ notes, apiKey, profileName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  }

  async function send(text) {
    const content = (text !== undefined ? text : input).trim();
    if (!content || streaming) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg = { role: 'user', content };
    const history = [...messages, userMsg];
    setMessages(history);
    setStreaming(true);
    setStreamText('');

    try {
      let accumulated = '';
      await streamChat(history, notes, apiKey, (chunk) => {
        accumulated += chunk;
        setStreamText(accumulated);
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: accumulated },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Something went wrong: ${e.message}` },
      ]);
    } finally {
      setStreaming(false);
      setStreamText('');
    }
  }

  function clearChat() {
    setMessages([]);
    setStreamText('');
  }

  const showSuggestions = messages.length === 0 && !streaming;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
            {getGreeting(profileName)}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {notes.length} note{notes.length !== 1 ? 's' : ''} in library
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-gray-400 hover:text-gray-700 mt-1 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {/* Suggestion chips */}
        {showSuggestions && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-gray-400 px-1 pb-1">Try asking…</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full text-left px-4 py-3 rounded-2xl bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors leading-snug"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex bubble-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-gray-900 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {streaming && streamText && (
          <div className="flex justify-start bubble-in">
            <div className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-gray-100 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
              {streamText}
              <span className="inline-block w-[2px] h-[14px] bg-gray-400 ml-0.5 cursor-blink rounded-sm" />
            </div>
          </div>
        )}

        {/* Loading dots (before first chunk) */}
        {streaming && !streamText && (
          <div className="flex justify-start">
            <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-gray-100 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400 dot-1" />
              <span className="w-2 h-2 rounded-full bg-gray-400 dot-2" />
              <span className="w-2 h-2 rounded-full bg-gray-400 dot-3" />
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Input bar */}
      <div className="px-4 pb-3 pt-2 border-t border-gray-100 bg-white">
        {!apiKey && (
          <p className="text-xs text-amber-500 text-center mb-2">
            Add your API key in Profile to start chatting
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about your notes…"
            rows={1}
            className="flex-1 rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 overflow-y-auto leading-relaxed"
            style={{ maxHeight: '128px' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || streaming}
            className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center disabled:opacity-30 shrink-0 hover:bg-gray-700 active:scale-95 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 13V3M8 3L3 8M8 3L13 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
