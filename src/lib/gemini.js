// gemini.js — Gemini 2.5 Flash REST API wrapper
// Strips markdown fences and robustly parses JSON from model responses

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Strip markdown code fences from a string.
 * Gemini sometimes wraps JSON in ```json ... ``` even when told not to.
 */
function stripMarkdownFences(text) {
  // Remove ```json ... ``` or ``` ... ``` blocks
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

/**
 * Call Gemini generateContent with text-only parts.
 * @param {string} systemPrompt
 * @param {string} userText
 * @returns {Promise<object>} Parsed JSON object from model response
 */
export async function callGeminiText(systemPrompt, userText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('MISSING_API_KEY');

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userText }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = stripMarkdownFences(rawText);

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`JSON_PARSE_FAILED: ${cleaned.slice(0, 200)}`);
  }
}

/**
 * Call Gemini generateContent with an image (base64) + text parts.
 * @param {string} systemPrompt
 * @param {string} base64Data — pure base64, no data-URI prefix
 * @param {string} mimeType — e.g. 'image/jpeg'
 * @param {string} userText — extra text appended after the image
 * @returns {Promise<object>} Parsed JSON object from model response
 */
export async function callGeminiVision(systemPrompt, base64Data, mimeType, userText = '') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('MISSING_API_KEY');

  const parts = [
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
  ];
  if (userText) parts.push({ text: userText });

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = stripMarkdownFences(rawText);

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`JSON_PARSE_FAILED: ${cleaned.slice(0, 200)}`);
  }
}
