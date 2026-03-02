import { GoogleGenAI } from '@google/genai';
import type { ScriptCode, SongCategory, Deity, Stanza } from '@/types/song';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!apiKey) {
  console.warn('Gemini API key not found. Set VITE_GEMINI_API_KEY in .env.local');
}

export const genai = new GoogleGenAI({ apiKey: apiKey || 'placeholder' });

export const GEMINI_MODEL = 'gemini-2.0-flash';

async function callGemini(prompt: string, retries = 2): Promise<string | null> {
  if (!isGeminiConfigured()) return null;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await genai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });
      return res.text?.replace(/```json\n?|\n?```/g, '').trim() || null;
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if (status === 429 && i < retries) {
        await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
        continue;
      }
      if (status === 429) {
        console.warn('Gemini API rate limit reached. Try again in a minute.');
        throw new Error('RATE_LIMIT');
      }
      console.error('Gemini API error:', e);
      return null;
    }
  }
  return null;
}

export function isGeminiConfigured(): boolean {
  return !!apiKey && apiKey !== 'placeholder';
}

const SCRIPT_NAMES: Record<string, string> = {
  en: 'Roman/English transliteration (phonetic)',
  hi: 'Devanagari (Hindi)',
  te: 'Telugu script',
  ta: 'Tamil script',
  od: 'Odia script',
};

// ── AI Song Search ──────────────────────────────────────────────────
export async function searchSongLyrics(query: string): Promise<{
  title: string;
  lyrics: string;
  category: SongCategory;
  deity: Deity;
  language: string;
} | null> {
  const text = await callGemini(`You are a Hindu devotional music expert. Find the complete lyrics for: "${query}"

Return ONLY valid JSON (no markdown fences):
{
  "title": "correct title of the song",
  "lyrics": "full lyrics with stanzas separated by blank lines. First stanza should be the chorus/refrain if applicable. Use Devanagari script for Hindi songs.",
  "category": one of "aarti"|"bhajan"|"kirtan"|"chalisa"|"mantra"|"stuti"|"other",
  "deity": one of "krishna"|"shiva"|"ganesh"|"durga"|"hanuman"|"ram"|"lakshmi"|"saraswati"|"vishnu"|"universal"|"other",
  "language": "hi" or "en" or "sa" (Sanskrit)
}

If you cannot find the song, return: {"error": "not_found"}`);

  try {
    if (!text) return null;
    const data = JSON.parse(text);
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Smart Lyrics Formatting ─────────────────────────────────────────
export async function formatLyrics(rawLyrics: string): Promise<{
  formatted: string;
  stanzaLabels: string[];
} | null> {
  const text = await callGemini(`You are a lyrics formatting expert for devotional songs (Bhajans, Aartis, Kirtans).

Clean and format these raw lyrics into proper stanzas:
---
${rawLyrics}
---

Rules:
- Identify the chorus/refrain and place it first
- Separate stanzas with exactly one blank line
- Remove duplicate lines, numbering artifacts, website text, ads
- Keep the original script/language intact
- Fix obvious typos if the script is Devanagari
- Each stanza should be 2-6 lines

Return ONLY valid JSON (no markdown fences):
{
  "formatted": "cleaned lyrics with stanzas separated by blank lines",
  "stanzaLabels": ["Chorus", "Verse 1", "Verse 2", ...]
}`);

  try {
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ── Transliteration ─────────────────────────────────────────────────
export async function transliterateStanzas(
  stanzas: Stanza[],
  targetScript: ScriptCode,
): Promise<Stanza[] | null> {
  if (targetScript === 'original') return null;

  const scriptName = SCRIPT_NAMES[targetScript] || targetScript;
  const linesPayload = stanzas.map((s) => ({
    index: s.index,
    lines: s.lines.map((l) => l.text),
  }));

  const text = await callGemini(`You are an expert in Indian language transliteration.

Transliterate these song lyrics into ${scriptName}.

Input stanzas (JSON):
${JSON.stringify(linesPayload)}

Rules:
- For Roman/English: produce phonetic transliteration that an English reader can pronounce correctly. Use standard IAST-like conventions but keep it readable (e.g., "Hare Krishna" not "Harē Kṛṣṇa").
- For other scripts: accurately convert each syllable to the target script.
- Preserve line breaks exactly as given.
- Return the same number of stanzas and lines.

Return ONLY valid JSON (no markdown fences) as an array:
[
  { "index": 0, "lines": ["transliterated line 1", "transliterated line 2"] },
  ...
]`);

  try {
    if (!text) return null;
    const data: { index: number; lines: string[] }[] = JSON.parse(text);

    return stanzas.map((stanza) => {
      const match = data.find((d) => d.index === stanza.index);
      if (!match) return stanza;
      return {
        ...stanza,
        lines: stanza.lines.map((line, i) => ({
          ...line,
          transliterations: {
            ...line.transliterations,
            [targetScript]: match.lines[i] || line.text,
          },
        })),
      };
    });
  } catch {
    return null;
  }
}

// ── Single-line transliteration cache helper ────────────────────────
const transCache = new Map<string, string>();

export async function transliterateLine(
  text: string,
  targetScript: ScriptCode,
): Promise<string> {
  if (targetScript === 'original') return text;
  const key = `${targetScript}:${text}`;
  if (transCache.has(key)) return transCache.get(key)!;

  const scriptName = SCRIPT_NAMES[targetScript] || targetScript;
  const result = await callGemini(
    `Transliterate to ${scriptName}. Return ONLY the transliterated text, nothing else:\n${text}`,
  );

  const out = result?.trim() || text;
  transCache.set(key, out);
  return out;
}
