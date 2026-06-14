import { useEffect, useRef, useState } from 'react';
import TensionCard from './TensionCard.jsx';
import { findTensions, getStoredKey, setStoredKey } from '../lib/claude.js';

export default function ConstellationPanel({ notes }) {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState(getStoredKey());
  const [showKey, setShowKey] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (pairs.length && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pairs]);

  async function run() {
    setError('');
    if (!apiKey) {
      setShowKey(true);
      setError('add an Anthropic API key to continue.');
      return;
    }
    if (notes.length < 2) {
      setError('add a few more notes first.');
      return;
    }
    setLoading(true);
    try {
      const result = await findTensions(notes, apiKey);
      setPairs(result);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function saveKey(k) {
    setApiKey(k);
    setStoredKey(k);
  }

  return (
    <section className="flex flex-col h-full">
      <header className="mb-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-ink-faded">
              constellation
            </p>
            <h2 className="font-serif italic text-2xl text-ink mt-1">
              what's quietly talking to what
            </h2>
          </div>
          <button
            onClick={() => setShowKey((s) => !s)}
            className="font-sans text-[11px] tracking-[0.18em] uppercase text-ink-faded hover:text-ink"
          >
            {apiKey ? 'key set' : 'set key'}
          </button>
        </div>

        {showKey && (
          <div className="mt-4 border border-ink/10 px-4 py-3 bg-cream-deep/40">
            <label className="font-sans text-[11px] tracking-[0.18em] uppercase text-ink-faded">
              anthropic api key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="sk-ant-…"
              className="w-full font-sans text-sm text-ink mt-1 focus:outline-none border-b border-ink/10 pb-1"
            />
            <p className="font-serif italic text-xs text-ink-faded mt-2 leading-relaxed">
              stored only in this browser. used directly from the page for
              the prototype — don't reuse a production key.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-5">
          <button
            onClick={run}
            disabled={loading}
            className="font-sans text-sm tracking-[0.18em] uppercase border border-ink/40 px-5 py-2.5 text-ink hover:border-ink hover:bg-ink hover:text-cream disabled:opacity-40 disabled:cursor-wait"
          >
            {loading ? 'looking…' : 'find tensions'}
          </button>
          {loading && (
            <span className="breath font-serif italic text-ink-faded text-sm">
              reading between the notes
            </span>
          )}
          {!loading && pairs.length > 0 && (
            <span className="font-serif italic text-ink-faded text-sm">
              {pairs.length} pairs surfaced
            </span>
          )}
        </div>

        {error && (
          <p className="mt-4 font-serif italic text-sm text-rose-dust">
            {error}
          </p>
        )}
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth -mr-4 pr-4"
      >
        {pairs.length === 0 && !loading && (
          <div className="h-full flex items-center justify-center">
            <p className="font-serif italic text-ink-faded text-center max-w-sm leading-relaxed">
              the inbox holds {notes.length} notes.
              <br />
              somewhere in there, things are quietly leaning toward each other.
              <br />
              <span className="text-ink/60">press the button.</span>
            </p>
          </div>
        )}
        {pairs.map((p, i) => (
          <TensionCard key={`${p.noteA}-${p.noteB}-${i}`} pair={p} index={i} />
        ))}
      </div>
    </section>
  );
}
