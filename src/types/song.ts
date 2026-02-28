export type ScriptCode = 'original' | 'en' | 'hi' | 'te' | 'ta' | 'od';

export type SongCategory = 'aarti' | 'bhajan' | 'kirtan' | 'stuti' | 'chalisa' | 'mantra' | 'other';

export type Deity = 'krishna' | 'shiva' | 'ganesh' | 'durga' | 'hanuman' | 'ram' | 'lakshmi' | 'saraswati' | 'vishnu' | 'universal' | 'other';

export type StanzaType = 'chorus' | 'verse' | 'bridge' | 'intro' | 'outro';

export interface TransliterationMap {
  en?: string;
  hi?: string;
  te?: string;
  ta?: string;
  od?: string;
}

export interface SongLine {
  text: string;
  transliterations: TransliterationMap;
  chords?: string;
}

export interface Stanza {
  index: number;
  type: StanzaType;
  label: string; // e.g., "Chorus", "Verse 1"
  lines: SongLine[];
}

export interface Song {
  id: string;
  templeId: string;
  title: string;
  originalLanguage: string;
  category: SongCategory;
  deity: Deity;
  stanzas: Stanza[];
  metadata: {
    raag?: string;
    taal?: string;
    tempo?: string;
    tags?: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SongSearchResult {
  title: string;
  lyrics: string;
  source?: string;
  category?: SongCategory;
  deity?: Deity;
}
