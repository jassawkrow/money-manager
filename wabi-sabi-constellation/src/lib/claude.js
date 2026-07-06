const MODEL = 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';

export function getStoredKey() {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANTHROPIC_API_KEY) ||
    localStorage.getItem('wsc.apiKey.v1') ||
    ''
  );
}

export function setStoredKey(key) {
  if (key) localStorage.setItem('wsc.apiKey.v1', key);
  else localStorage.removeItem('wsc.apiKey.v1');
}

function buildSystemPrompt(notes) {
  const base =
    'You are a personal thinking partner. You help the user brainstorm, ' +
    'spot patterns, develop ideas, and think through problems. ' +
    'Be direct, concise, and genuinely useful — not sycophantic. ' +
    "Ask good follow-up questions when it would help. Don't pad your responses.";

  if (!notes || notes.length === 0) return base;

  const notesBlock = notes
    .map((n) => `[${n.title}]\n${n.body}`)
    .join('\n\n---\n\n');

  return (
    base +
    `\n\nYou have access to the user's saved notes below. Reference them naturally — ` +
    `surface connections, quote back relevant fragments, and help them build on what they've already been thinking.\n\n` +
    `USER'S NOTES:\n\n${notesBlock}`
  );
}

export async function streamChat(conversationMessages, notes, apiKey, onChunk) {
  if (!apiKey) throw new Error('No API key set — go to Profile to add one.');

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
      max_tokens: 1024,
      stream: true,
      system: buildSystemPrompt(notes),
      messages: conversationMessages,
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
    throw new Error(`API error (${res.status}): ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        if (
          parsed.type === 'content_block_delta' &&
          parsed.delta?.type === 'text_delta'
        ) {
          onChunk(parsed.delta.text);
        }
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
