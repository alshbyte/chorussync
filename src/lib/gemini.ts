import { GoogleGenAI } from '@google/genai';
import type { ScriptCode, SongCategory, Deity, Stanza } from '@/types/song';

// ── Provider Configuration ──────────────────────────────────────────
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

const GEMMA_MODEL = 'gemma-3-27b-it';
const GEMINI_FALLBACK_MODEL = 'gemini-2.5-flash';

const genai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

const hasGemini = !!geminiKey;

if (!hasGemini) {
  console.warn('No AI provider configured. Set VITE_GEMINI_API_KEY in .env.local');
}

// ── Transliteration Cache (localStorage) ────────────────────────────
const CACHE_PREFIX = 'chorusync:trans:';

function getCachedTransliteration(key: string): unknown | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setCachedTransliteration(key: string, data: unknown): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch { /* quota exceeded — silently skip */ }
}

function makeTransCacheKey(stanzas: Stanza[], script: ScriptCode): string {
  const fingerprint = stanzas.map(s => s.lines.map(l => l.text).join('|')).join('||');
  // Simple hash to keep key short
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) - hash + fingerprint.charCodeAt(i)) | 0;
  }
  return `${Math.abs(hash).toString(36)}:${stanzas.length}:${script}`;
}

// ── Provider Calls ──────────────────────────────────────────────────
function cleanResponse(text: string): string {
  return text.replace(/```json\n?|\n?```/g, '').trim();
}

async function callGemmaProvider(prompt: string): Promise<string | null> {
  if (!genai) return null;
  const res = await genai.models.generateContent({
    model: GEMMA_MODEL,
    contents: prompt,
  });
  return cleanResponse(res.text || '');
}

async function callGeminiFallback(prompt: string): Promise<string | null> {
  if (!genai) return null;
  const res = await genai.models.generateContent({
    model: GEMINI_FALLBACK_MODEL,
    contents: prompt,
  });
  return cleanResponse(res.text || '');
}

// ── Unified AI Call (Gemma 3 → Gemini 2.5 Flash fallback) ───────────
async function callAI(prompt: string, retries = 1): Promise<string | null> {
  if (!hasGemini) return null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Try Gemma 3 27B first (14,400 RPD free, best for Indian languages)
    try {
      const result = await callGemmaProvider(prompt);
      if (result) return result;
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      const msg = (e as Error).message;
      if (status === 429 || msg?.includes('429')) {
        console.warn('Gemma 3 rate limited, falling back to Gemini 2.5 Flash');
      } else {
        console.warn('Gemma 3 error, trying Gemini fallback:', msg);
      }
    }

    // Fallback to Gemini 2.5 Flash
    try {
      const result = await callGeminiFallback(prompt);
      if (result) return result;
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if (status === 429) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }
        throw new Error('RATE_LIMIT');
      }
      console.error('Gemini fallback error:', e);
    }
  }

  return null;
}

// ── Public API ───────────────────────────────────────────────────────

/** Returns true if at least one AI provider is configured */
export function isGeminiConfigured(): boolean {
  return hasGemini;
}

/** Which providers are active */
export function getActiveProviders(): string[] {
  const providers: string[] = [];
  if (hasGemini) providers.push('Gemma 3 27B', 'Gemini 2.5 Flash');
  return providers;
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
  const text = await callAI(`You are a Hindu devotional music expert. Find the complete lyrics for: "${query}"

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
  const text = await callAI(`You are a lyrics formatting expert for devotional songs (Bhajans, Aartis, Kirtans).

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

// ── Transliteration (with localStorage cache) ───────────────────────
export async function transliterateStanzas(
  stanzas: Stanza[],
  targetScript: ScriptCode,
): Promise<Stanza[] | null> {
  if (targetScript === 'original') return null;

  // Check localStorage cache first
  const cacheKey = makeTransCacheKey(stanzas, targetScript);
  const cached = getCachedTransliteration(cacheKey) as { index: number; lines: string[] }[] | null;
  if (cached) {
    return applyTransliterationData(stanzas, cached, targetScript);
  }

  const scriptName = SCRIPT_NAMES[targetScript] || targetScript;
  const linesPayload = stanzas.map((s) => ({
    index: s.index,
    lines: s.lines.map((l) => l.text),
  }));

  const text = await callAI(`You are an expert in Indian language transliteration.

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

    // Cache the raw API response for future use
    setCachedTransliteration(cacheKey, data);

    return applyTransliterationData(stanzas, data, targetScript);
  } catch {
    return null;
  }
}

function applyTransliterationData(
  stanzas: Stanza[],
  data: { index: number; lines: string[] }[],
  targetScript: ScriptCode,
): Stanza[] {
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
  const result = await callAI(
    `Transliterate to ${scriptName}. Return ONLY the transliterated text, nothing else:\n${text}`,
  );

  const out = result?.trim() || text;
  transCache.set(key, out);
  return out;
}
