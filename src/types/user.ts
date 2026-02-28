import type { ScriptCode } from './song';

export type ThemeMode = 'dark' | 'light';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface UserPreferences {
  userId: string;
  preferredScript: ScriptCode;
  fontSize: FontSize;
  theme: ThemeMode;
  hapticFeedback: boolean;
  showChords: boolean;
  autoScroll: boolean;
}

export interface AppUser {
  id: string;
  email?: string;
  displayName?: string;
  preferences: UserPreferences;
}

export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId'> = {
  preferredScript: 'original',
  fontSize: 'medium',
  theme: 'dark',
  hapticFeedback: true,
  showChords: false,
  autoScroll: true,
};
