import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!apiKey) {
  console.warn('Gemini API key not found. Set VITE_GEMINI_API_KEY in .env.local');
}

export const genai = new GoogleGenAI({ apiKey: apiKey || 'placeholder' });

export const GEMINI_MODEL = 'gemini-2.0-flash';
