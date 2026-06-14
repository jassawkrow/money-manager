const SYSTEM_PROMPT =
  "You analyze the user's personal notes and surface non-obvious semantic connections between them. You look for pairs of notes that are about adjacent or related concepts but have never explicitly referenced each other — the connections the user hasn't noticed yet.\n\n" +
  "Do NOT surface obvious connections (e.g., two notes that are clearly about the same project, or that already share a topic word). Surface the surprising ones — pairs where the connection is real but the user would pause and say 'oh, I hadn't connected those.'\n\n" +
  "For each pair, return:\n" +
  "- The two note titles\n" +
  "- 'thread': a 1-2 sentence explanation of the implicit connection\n" +
  "- 'bridge': a question the user could sit with to explore the connection further — should feel like a creative writing prompt, not a quiz\n\n" +
  "Return 3-5 pairs as a valid JSON array in this exact shape, with no preamble or markdown:\n" +
  "[{\"noteA\": \"title\", \"noteB\": \"title\", \"thread\": \"...\", \"bridge\": \"...\"}]";

const MODEL = 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';
const KEY_STORAGE = 'wsc.apiKey.v1';

export function getStoredKey() {
  return (
    import.meta.env.VITE_ANTHROPIC_API_KEY ||
    localStorage.getItem(KEY_STORAGE) ||
    ''
  );
}

export function setStoredKey(key) {
  if (key) localStorage.setItem(KEY_STORAGE, key);
  else localStorage.removeItem(KEY_STORAGE);
}

function serializeNotes(notes) {
  return notes
    .map((n) => `Title: ${n.title}\nBody: ${n.body}`)
    .join('\n\n');
}

function extractJSON(text) {
  // Be tolerant — the model is asked to return raw JSON, but strip a stray
  // code fence if one slips through.
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fence ? fence[1] : trimmed;
  const first = candidate.indexOf('[');
  const last = candidate.lastIndexOf(']');
  if (first === -1 || last === -1 || last < first) {
    throw new Error('Claude did not return a JSON array.');
  }
  return JSON.parse(candidate.slice(first, last + 1));
}

export async function findTensions(notes, apiKey) {
  if (!apiKey) throw new Error('Missing Anthropic API key.');
  if (!notes || notes.length < 2) {
    throw new Error('Need at least two notes to find tensions.');
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: serializeNotes(notes),
        },
      ],
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error?.message || JSON.stringify(j);
    } catch {
      detail = await res.text();
    }
    throw new Error(`Claude API error (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const text =
    data?.content?.find?.((b) => b.type === 'text')?.text ??
    data?.content?.[0]?.text ??
    '';
  if (!text) throw new Error('Claude returned no text content.');
  const pairs = extractJSON(text);
  if (!Array.isArray(pairs)) throw new Error('Expected a JSON array.');
  return pairs.filter(
    (p) => p && p.noteA && p.noteB && p.thread && p.bridge
  );
}
