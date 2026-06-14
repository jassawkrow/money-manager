# Wabi Sabi Constellation

A single-feature prototype: does an LLM surface non-obvious semantic
connections between scattered personal notes — the kind a user wouldn't
notice on their own?

## Run it

```bash
cd wabi-sabi-constellation
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL. Desktop only (assumes
1280px+).

## Anthropic API key

The prototype calls the Anthropic API directly from the browser, which
needs a key. Two ways to provide it:

1. Click **set key** in the right column and paste it. Stored in
   `localStorage`, never leaves your browser.
2. Or create `.env.local` with `VITE_ANTHROPIC_API_KEY=sk-ant-…` and
   restart `npm run dev`.

This is a local prototype only — do not ship a production key to a static
site.

## What's here

- Two-column layout. Left: notes inbox (add / edit / delete, persisted
  to localStorage). Right: the Constellation — a **Find Tensions** button
  that ships your notes to Claude and renders the returned pairs.
- 15 seeded notes on first load: a real-feeling idea inbox covering a
  ceramics practice, a creative philosophy, half-formed business ideas,
  health/rhythm scraps, stray observations.
- Wabi-sabi visual treatment: warm cream paper, quiet serif body, muted
  ink/indigo/rose palette, generous whitespace, tension cards that
  settle in one at a time.

## What's deliberately not here

Auth. Backend. Mobile layout. Folders. Profile. Chat. Model toggles.
The point is to test whether the magic is real before building anything
around it.
