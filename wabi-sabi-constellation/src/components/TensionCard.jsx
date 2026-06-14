export default function TensionCard({ pair, index }) {
  return (
    <article
      className="settle relative bg-cream-deep/40 border border-ink/10 px-12 py-14 my-10 mx-auto max-w-2xl"
      style={{ animationDelay: `${index * 220}ms` }}
    >
      {/* Two small index marks in the corners, like a found object. */}
      <span className="absolute top-3 left-4 font-sans text-[10px] tracking-[0.3em] uppercase text-ink-faded">
        pair · {String(index + 1).padStart(2, '0')}
      </span>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-6">
        <div className="text-right">
          <p className="font-sans text-xs tracking-[0.18em] uppercase text-ink-faded mb-2">
            note
          </p>
          <h3 className="font-sans text-lg text-ink leading-snug">
            {pair.noteA}
          </h3>
        </div>
        <div className="flex flex-col items-center pt-6">
          <span className="w-px h-12 bg-ink/15" />
          <span className="font-serif italic text-rose-dust text-sm my-2">
            ↔
          </span>
          <span className="w-px h-12 bg-ink/15" />
        </div>
        <div>
          <p className="font-sans text-xs tracking-[0.18em] uppercase text-ink-faded mb-2">
            note
          </p>
          <h3 className="font-sans text-lg text-ink leading-snug">
            {pair.noteB}
          </h3>
        </div>
      </div>

      <div className="mt-12 mb-8">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-ink-faded mb-3 text-center">
          the thread between them
        </p>
        <p className="font-serif text-lg text-ink-soft leading-relaxed text-center italic">
          {pair.thread}
        </p>
      </div>

      <div className="border-t border-ink/10 pt-8">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-ink-faded mb-3">
          a question to sit with
        </p>
        <p className="font-serif text-xl text-indigo-faded leading-snug">
          {pair.bridge}
        </p>
      </div>
    </article>
  );
}
